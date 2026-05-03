import { useState, useCallback } from 'react';
import type { Challenge, DailyLog, DayStatus } from './types';

const STORAGE_KEY = 'lifehack_challenge_tracker';

function createEmptyLogs(): DailyLog[] {
  return Array.from({ length: 30 }, (_, i) => ({
    day_number: i + 1,
    status: 'pending' as DayStatus,
    note_content: '',
    image_url: '',
  }));
}

function loadFromStorage(): Challenge | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Challenge;
  } catch {
    return null;
  }
}

function saveToStorage(challenge: Challenge) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
}

/** Returns the 1-based day number the user is currently on, clamped 1–30. Returns 0 if not started yet or past day 30. */
export function computeCurrentDay(startDate: string): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const day = diffDays + 1; // day 1 = start date
  if (day < 1 || day > 30) return 0;
  return day;
}

export function useChallengeStore() {
  const [challenge, setChallenge] = useState<Challenge | null>(() => loadFromStorage());

  const startChallenge = useCallback((name: string, startDate: string) => {
    const newChallenge: Challenge = {
      challenge_name: name,
      start_date: startDate,
      daily_logs: createEmptyLogs(),
    };
    saveToStorage(newChallenge);
    setChallenge(newChallenge);
  }, []);

  const resetChallenge = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setChallenge(null);
  }, []);

  const updateLog = useCallback(
    (dayNumber: number, patch: Partial<Omit<DailyLog, 'day_number'>>) => {
      setChallenge((prev) => {
        if (!prev) return prev;
        const updated: Challenge = {
          ...prev,
          daily_logs: prev.daily_logs.map((log) =>
            log.day_number === dayNumber ? { ...log, ...patch } : log
          ),
        };
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const currentDay = challenge ? computeCurrentDay(challenge.start_date) : 0;

  const successCount = challenge
    ? challenge.daily_logs.filter((l) => l.status === 'success').length
    : 0;

  const failureCount = challenge
    ? challenge.daily_logs.filter((l) => l.status === 'failure').length
    : 0;

  const progressPercent = successCount > 0 ? Math.round((successCount / 30) * 100) : 0;

  return {
    challenge,
    currentDay,
    successCount,
    failureCount,
    progressPercent,
    startChallenge,
    resetChallenge,
    updateLog,
  };
}
