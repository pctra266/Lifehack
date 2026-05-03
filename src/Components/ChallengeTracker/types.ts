export type DayStatus = 'success' | 'failure' | 'pending';

export interface DailyLog {
  day_number: number;
  status: DayStatus;
  note_content: string;
  image_url: string; // base64 data URL
}

export interface Challenge {
  challenge_name: string;
  start_date: string; // ISO date "YYYY-MM-DD"
  daily_logs: DailyLog[];
}
