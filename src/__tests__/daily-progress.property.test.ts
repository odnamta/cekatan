import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { computeDailyProgress, StudyLogForProgress } from '../lib/daily-progress';

/**
 * Daily Progress Property-Based Tests
 * 
 * **Feature: v3-ux-overhaul, Property 2: Daily progress calculation**
 * **Validates: Requirements 1.3, 1.4**
 * 
 * For any user with study logs, the completedToday count SHALL equal the
 * cards_reviewed value from the study_log entry for today's date, or 0 if no entry exists.
 */

// Generator for a valid study log with non-negative cards_reviewed
const studyLogArb: fc.Arbitrary<StudyLogForProgress> = fc.record({
  cards_reviewed: fc.nat({ max: 1000 }),
});

// Generator for study log or null
const studyLogOrNullArb = fc.option(studyLogArb, { nil: null });

describe('Property 2: Daily progress calculation', () => {
  test('Daily progress equals cards_reviewed when study log exists', () => {
    fc.assert(
      fc.property(studyLogArb, (studyLog) => {
        const progress = computeDailyProgress(studyLog);
        expect(progress).toBe(studyLog.cards_reviewed);
      }),
      { numRuns: 100 }
    );
  });

  test('Daily progress is 0 when no study log exists', () => {
    const progress = computeDailyProgress(null);
    expect(progress).toBe(0);
  });

  test('Daily progress is always non-negative', () => {
    fc.assert(
      fc.property(studyLogOrNullArb, (studyLog) => {
        const progress = computeDailyProgress(studyLog);
        expect(progress).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  test('Daily progress matches cards_reviewed or is 0 for null', () => {
    fc.assert(
      fc.property(studyLogOrNullArb, (studyLog) => {
        const progress = computeDailyProgress(studyLog);
        const expected = studyLog === null ? 0 : studyLog.cards_reviewed;
        expect(progress).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });
});
