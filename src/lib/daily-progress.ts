/**
 * Daily Progress Calculation Utility
 * 
 * This module provides functions for calculating daily study progress.
 * Extracted for testability via property-based testing.
 * 
 * Requirements: 1.3, 1.4
 */

export interface StudyLogForProgress {
  cards_reviewed: number;
}

/**
 * Computes the daily progress (cards reviewed today) from a study log entry.
 * Returns the cards_reviewed count if a log exists, or 0 if no log exists.
 * 
 * @param studyLog - The study log entry for today, or null if none exists
 * @returns The count of cards reviewed today
 * 
 * Requirements: 1.3, 1.4
 */
export function computeDailyProgress(studyLog: StudyLogForProgress | null): number {
  if (studyLog === null) {
    return 0;
  }
  return studyLog.cards_reviewed;
}
