import React, { useState, useRef } from 'react';
import './ChallengeTracker.css';
import type { DailyLog, DayStatus } from './types';
import { useChallengeStore } from './useChallengeStore';

// ── Image compression (Canvas, no extra dependencies) ─────────────────────────

/** Resize image to maxPx on longest side, encode as JPEG. Safe for localStorage. */
function compressImage(file: File, maxPx = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function statusIcon(status: DayStatus, isCurrentDay: boolean): string {
  if (status === 'success') return '✓';
  if (status === 'failure') return '✗';
  if (isCurrentDay) return '▶';
  return '';
}

function todayISO(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/** Return the calendar date for day N of the challenge (e.g. "28/4") */
function getDayDate(startDate: string, dayNumber: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayNumber - 1);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ── Setup Screen ─────────────────────────────────────────────────────────────

interface SetupScreenProps {
  onStart: (name: string, startDate: string) => void;
}

function SetupScreen({ onStart }: SetupScreenProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(todayISO());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate) return;
    onStart(name.trim(), startDate);
  }

  return (
    <div className="ct-setup">
      <div className="ct-setup-card">
        <span className="ct-setup-icon">🏆</span>
        <h2>Start Your 30-Day Challenge</h2>
        <p>Track your journey, log daily progress, and build the habit.</p>

        <form className="ct-form" onSubmit={handleSubmit}>
          <div className="ct-field">
            <label htmlFor="ct-challenge-name">Challenge Name</label>
            <input
              id="ct-challenge-name"
              type="text"
              className="ct-input"
              placeholder="e.g. Morning Workout, Healthy Diet..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="ct-field">
            <label htmlFor="ct-start-date">Start Date</label>
            <input
              id="ct-start-date"
              type="date"
              className="ct-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <button
            id="ct-start-btn"
            type="submit"
            className="ct-btn ct-btn-primary"
            disabled={!name.trim() || !startDate}
          >
            🚀 Begin Challenge
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Day Detail Side Panel ────────────────────────────────────────────────────

interface DayPanelProps {
  log: DailyLog;
  isCurrent: boolean;
  onClose: () => void;
  onSave: (patch: Partial<Omit<DailyLog, 'day_number'>>) => void;
}

function DayPanel({ log, isCurrent, onClose, onSave }: DayPanelProps) {
  const [status, setStatus] = useState<DayStatus>(log.status);
  const [note, setNote] = useState(log.note_content);
  const [imageUrls, setImageUrls] = useState<string[]>(log.image_urls);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);    // gallery (multiple)
  const cameraInputRef = useRef<HTMLInputElement>(null);  // camera (single)

  function handleSave() {
    onSave({ status, note_content: note, image_urls: imageUrls });
    onClose();
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setCompressing(true);
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      setImageUrls((prev) => [...prev, ...compressed]);
    } catch {
      alert('Không thể đọc ảnh. Vui lòng thử lại.');
    } finally {
      setCompressing(false);
      if (e.target) e.target.value = '';
    }
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  const panelTitle = `Day ${log.day_number}`;

  return (
    <>
      <div className="ct-overlay" id="ct-panel-overlay" onClick={onClose} />
      <div className="ct-panel" role="dialog" aria-label={`Detail for Day ${log.day_number}`}>
        {/* Header */}
        <div className="ct-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="ct-day-badge">
              {isCurrent ? '📍 Today' : panelTitle}
            </span>
            <h3>{panelTitle}</h3>
          </div>
          <button
            id="ct-panel-close-btn"
            className="ct-panel-close"
            onClick={onClose}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="ct-panel-body">
          {/* Status Toggle */}
          <div className="ct-status-section">
            <h4>Status</h4>
            <div className="ct-status-toggle">
              <button
                id={`ct-status-success-day${log.day_number}`}
                className={`ct-status-option ${status === 'success' ? 'selected-success' : ''}`}
                onClick={() => setStatus(status === 'success' ? 'pending' : 'success')}
              >
                ✓ Success
              </button>
              <button
                id={`ct-status-failure-day${log.day_number}`}
                className={`ct-status-option ${status === 'failure' ? 'selected-failure' : ''}`}
                onClick={() => setStatus(status === 'failure' ? 'pending' : 'failure')}
              >
                ✗ Failed
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="ct-note-section">
            <h4>Notes & Journal</h4>
            <textarea
              id={`ct-note-day${log.day_number}`}
              className="ct-textarea"
              placeholder="How did today go? Record your feelings, milestones, or anything important..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="ct-image-section">
            <h4>Progress Photos {imageUrls.length > 0 && <span className="ct-img-count">{imageUrls.length}</span>}</h4>

            {/* Thumbnail grid */}
            {imageUrls.length > 0 && (
              <div className="ct-img-grid">
                {imageUrls.map((url, i) => (
                  <div key={i} className="ct-img-thumb">
                    <img src={url} alt={`Photo ${i + 1}`} />
                    <button
                      className="ct-img-thumb-remove"
                      onClick={() => removeImage(i)}
                      aria-label={`Remove photo ${i + 1}`}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Compressing indicator */}
            {compressing && (
              <div className="ct-compressing">
                <div className="ct-compressing-spinner" />
                <span>Đang nén ảnh...</span>
              </div>
            )}

            {/* Add buttons — always visible */}
            {!compressing && (
              <div className="ct-img-pick-row">
                <button
                  id={`ct-btn-camera-day${log.day_number}`}
                  className="ct-img-pick-btn"
                  onClick={() => cameraInputRef.current?.click()}
                  type="button"
                >
                  <span>📷</span>
                  Chụp ảnh
                </button>
                <button
                  id={`ct-btn-gallery-day${log.day_number}`}
                  className="ct-img-pick-btn"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <span>🖼️</span>
                  Thư viện
                </button>
              </div>
            )}

            {/* Camera input */}
            <input
              ref={cameraInputRef}
              id={`ct-camera-input-day${log.day_number}`}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            {/* Gallery input — multiple selection */}
            <input
              ref={fileInputRef}
              id={`ct-file-input-day${log.day_number}`}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="ct-panel-footer">
          <button
            id="ct-panel-cancel-btn"
            className="ct-btn ct-btn-ghost"
            onClick={onClose}
            disabled={compressing}
          >
            Cancel
          </button>
          <button
            id="ct-panel-save-btn"
            className="ct-btn ct-btn-primary"
            onClick={handleSave}
            disabled={compressing}
          >
            💾 Save
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function ChallengeTracker() {
  const {
    challenge,
    loading,
    currentDay,
    successCount,
    failureCount,
    progressPercent,
    startChallenge,
    resetChallenge,
    updateLog,
  } = useChallengeStore();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // ── Loading from Firestore
  if (loading) {
    return (
      <div className="ct-wrapper ct-loading">
        <div className="ct-spinner" aria-label="Loading challenge data..." />
        <p>Loading your challenge...</p>
      </div>
    );
  }

  // ── No active challenge → Setup screen
  if (!challenge) {
    return (
      <div className="ct-wrapper">
        <SetupScreen onStart={startChallenge} />
      </div>
    );
  }

  const selectedLog = selectedDay
    ? challenge.daily_logs.find((l) => l.day_number === selectedDay) ?? null
    : null;

  function handleCellClick(dayNumber: number) {
    // Allow interaction with past, current, and (optionally) future days
    setSelectedDay(dayNumber);
  }

  function handleSave(patch: Partial<Omit<DailyLog, 'day_number'>>) {
    if (selectedDay !== null) updateLog(selectedDay, patch);
  }

  async function handleReset() {
    if (window.confirm('Reset this challenge? All progress will be lost.')) {
      await resetChallenge();
    }
  }

  const startFormatted = new Date(challenge.start_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="ct-wrapper">
      {/* Header */}
      <div className="ct-header">
        <div className="ct-header-left">
          <h1>🏆 {challenge.challenge_name}</h1>
          <span>Started {startFormatted} · {currentDay > 0 ? `Day ${currentDay} of 30` : 'Challenge not started / completed'}</span>
        </div>
        <button
          id="ct-reset-btn"
          className="ct-btn ct-btn-ghost ct-btn-sm"
          onClick={handleReset}
        >
          🔄 Reset
        </button>
      </div>

      {/* Stats */}
      <div className="ct-stats">
        <div className="ct-stat-item">
          <span className="ct-stat-label">Current Day</span>
          <span className="ct-stat-value accent">{currentDay > 0 ? currentDay : '—'} / 30</span>
        </div>

        <div className="ct-stat-item">
          <span className="ct-stat-label">Success</span>
          <span className="ct-stat-value success">✓ {successCount}</span>
        </div>

        <div className="ct-stat-item">
          <span className="ct-stat-label">Failed</span>
          <span className="ct-stat-value failure">✗ {failureCount}</span>
        </div>

        <div className="ct-progress-wrap">
          <div className="ct-stat-label">Progress ({progressPercent}%)</div>
          <div className="ct-progress-track">
            <div
              className="ct-progress-fill"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="ct-grid" role="grid" aria-label="30-day challenge grid">
        {challenge.daily_logs.map((log) => {
          const isCurrentDay = log.day_number === currentDay;
          const isFuture = currentDay > 0 && log.day_number > currentDay;
          const hasImage = log.image_urls.length > 0;
          const cellClass = [
            'ct-cell',
            log.status !== 'pending' ? log.status : '',
            isCurrentDay ? 'current-day' : '',
            isFuture ? 'future' : '',
            hasImage ? 'has-image' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const calDate = getDayDate(challenge.start_date, log.day_number);
          const icon = statusIcon(log.status, isCurrentDay);

          return (
            <div
              key={log.day_number}
              id={`ct-cell-day${log.day_number}`}
              className={cellClass}
              role="gridcell"
              tabIndex={0}
              aria-label={`Day ${log.day_number} (${calDate}): ${log.status}`}
              onClick={() => handleCellClick(log.day_number)}
              onKeyDown={(e) => e.key === 'Enter' && handleCellClick(log.day_number)}
            >
              {/* Photo background — use first image */}
              {hasImage && (
                <img
                  className="ct-cell-bg-img"
                  src={log.image_urls[0]}
                  alt={`Day ${log.day_number} progress`}
                />
              )}

              {/* Gradient overlay (always present so text is readable on images) */}
              <div className="ct-cell-overlay" />

              {/* Content */}
              <div className="ct-cell-content">
                {/* Top row: day badge + status icon */}
                <div className="ct-cell-top">
                  <span className="ct-cell-day-badge">Day {log.day_number}</span>
                  {icon && <span className="ct-cell-status-icon">{icon}</span>}
                </div>

                {/* Calendar date — prominent */}
                <span className="ct-cell-date">{calDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="ct-legend" aria-label="Legend">
        <div className="ct-legend-item">
          <span className="ct-legend-dot current" /> Today
        </div>
        <div className="ct-legend-item">
          <span className="ct-legend-dot success" /> Success
        </div>
        <div className="ct-legend-item">
          <span className="ct-legend-dot failure" /> Failed
        </div>
        <div className="ct-legend-item">
          <span className="ct-legend-dot pending" /> Pending
        </div>
      </div>

      {/* Side Panel */}
      {selectedLog && (
        <DayPanel
          log={selectedLog}
          isCurrent={selectedLog.day_number === currentDay}
          onClose={() => setSelectedDay(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
