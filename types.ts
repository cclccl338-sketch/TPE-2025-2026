export enum ActivityType {
  TRANSPORT = 'TRANSPORT',
  MEAL = 'MEAL',
  SITE = 'SITE',
  OTHER = 'OTHER'
}

export interface Activity {
  id: string;
  time: string;
  location: string;
  description: string;
  type: ActivityType;
  costTWD: number;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface DayPlan {
  date: string; // ISO Date string YYYY-MM-DD
  activities: Activity[];
  dailyNote?: string;
}

export interface ShortlistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TripData {
  itinerary: Record<string, DayPlan>;
  shortlist: ShortlistItem[];
  packingList: ShortlistItem[];
}

export interface WeatherInfo {
  date: string;
  condition: string;
  tempHigh: number;
  tempLow: number;
  rainProb: number;
  advice: string;
}

export type Tab = 'overview' | 'itinerary' | 'weather' | 'map';

export const START_DATE = '2025-12-15';
export const END_DATE = '2026-01-05';
export const DESTINATION = 'Taipei, Taiwan';

// Safe UUID generator that works in non-secure contexts (HTTP) and older browsers
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback if crypto.randomUUID fails (e.g. insecure context)
    }
  }
  // Simple fallback
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};