import { useState, useEffect, useCallback } from 'react';
import type { Challenge, DailyLog, DayStatus } from './types';
import { db } from '../../firebase';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

const CHALLENGE_DOC = doc(db, 'challenge_tracker', 'active');
const LOCAL_IMAGE_PREFIX = 'ct_img_';

// ── Local image helpers (localStorage, keyed by day number) ──────────────────

function localImageKey(dayNumber: number) {
  return `${LOCAL_IMAGE_PREFIX}${dayNumber}`;
}

function loadLocalImages(): Record<number, string> {
  const result: Record<number, string> = {};
  for (let i = 1; i <= 30; i++) {
    const val = localStorage.getItem(localImageKey(i));
    if (val) result[i] = val;
  }
  return result;
}

function saveLocalImage(dayNumber: number, base64: string) {
  if (base64) {
    localStorage.setItem(localImageKey(dayNumber), base64);
  } else {
    localStorage.removeItem(localImageKey(dayNumber));
  }
}

function clearAllLocalImages() {
  for (let i = 1; i <= 30; i++) {
    localStorage.removeItem(localImageKey(i));
  }
}

/** Strip image_url from all logs — we never write images to Firestore */
function toFirestoreDoc(challenge: Challenge): Challenge {
  return {
    ...challenge,
    daily_logs: challenge.daily_logs.map((log) => ({ ...log, image_url: '' })),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function createEmptyLogs(): DailyLog[] {
  return Array.from({ length: 30 }, (_, i) => ({
    day_number: i + 1,
    status: 'pending' as DayStatus,
    note_content: '',
    image_url: '',
  }));
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

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useChallengeStore() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time listener from Firestore; merge local images on every snapshot
  useEffect(() => {
    const unsubscribe = onSnapshot(CHALLENGE_DOC, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Challenge;
        const localImages = loadLocalImages();
        const merged: Challenge = {
          ...data,
          daily_logs: data.daily_logs.map((log) => ({
            ...log,
            image_url: localImages[log.day_number] ?? '',
          })),
        };
        setChallenge(merged);
      } else {
        setChallenge(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const startChallenge = useCallback(async (name: string, startDate: string) => {
    const newChallenge: Challenge = {
      challenge_name: name,
      start_date: startDate,
      daily_logs: createEmptyLogs(),
    };
    // Only cloud data (images already empty)
    await setDoc(CHALLENGE_DOC, toFirestoreDoc(newChallenge));
  }, []);

  const resetChallenge = useCallback(async () => {
    clearAllLocalImages();
    await deleteDoc(CHALLENGE_DOC);
  }, []);

  const updateLog = useCallback(
    (dayNumber: number, patch: Partial<Omit<DailyLog, 'day_number'>>) => {
      // Save image locally; save everything else to Firestore
      if (patch.image_url !== undefined) {
        saveLocalImage(dayNumber, patch.image_url);
      }

      setChallenge((prev) => {
        if (!prev) return prev;
        const updated: Challenge = {
          ...prev,
          daily_logs: prev.daily_logs.map((log) =>
            log.day_number === dayNumber ? { ...log, ...patch } : log
          ),
        };
        // Write to Firestore without images (fire-and-forget)
        setDoc(CHALLENGE_DOC, toFirestoreDoc(updated));
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
    loading,
    currentDay,
    successCount,
    failureCount,
    progressPercent,
    startChallenge,
    resetChallenge,
    updateLog,
  };
}
