export type DayStatus = 'success' | 'failure' | 'pending';

export interface DailyLog {
  day_number: number;
  status: DayStatus;
  note_content: string;
  image_urls: string[]; // base64 JPEGs stored in localStorage
}

export interface Challenge {
  challenge_name: string;
  start_date: string; // ISO date "YYYY-MM-DD"
  daily_logs: DailyLog[];
}
