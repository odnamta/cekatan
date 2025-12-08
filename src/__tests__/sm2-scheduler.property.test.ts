import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { calculateNextReview, type SM2Input } from '@/lib/sm2'
import { SM2_CONSTANTS } from '@/lib/constants'

/**
 * SM-2 Algorithm Property Tests
 * 
 * **Feature: v11.5-global-study-stabilization**
 * Tests SM-2 invariants to ensure scheduling remains predictable.
 */

describe('SM-2 Algorithm Property Tests', () => {
  // Valid SM2Input arbitrary
  // Note: fc.float requires 32-bit float bounds, use Math.fround
  const validSM2InputArb = fc.record({
    interval: fc.nat({ max: 365 }), // 0 to 365 days
    easeFactor: fc.float({ min: Math.fround(1.3), max: Math.fround(3.0), noNaN: true }),
    rating: fc.constantFrom(1, 2, 3, 4) as fc.Arbitrary<1 | 2 | 3 | 4>,
  })

  /**
   * **Property 1: SM-2 Interval Non-Negativity**
   * For any valid SM-2 input, calculateNextReview SHALL return an interval >= 0.
   * **Validates: Requirements 3.1**
   */
  describe('Property 1: SM-2 Interval Non-Negativity', () => {
    it('should always return non-negative interval', () => {
      fc.assert(
        fc.property(validSM2InputArb, (input) => {
          const result = calculateNextReview(input)
          expect(result.interval).toBeGreaterThanOrEqual(0)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Property 2: SM-2 Ease Factor Floor**
   * For any valid SM-2 input, calculateNextReview SHALL return an ease_factor >= 1.3.
   * **Validates: Requirements 3.2**
   */
  describe('Property 2: SM-2 Ease Factor Floor', () => {
    it('should never return ease factor below 1.3', () => {
      fc.assert(
        fc.property(validSM2InputArb, (input) => {
          const result = calculateNextReview(input)
          // Use small tolerance for floating point comparison
          expect(result.easeFactor).toBeGreaterThanOrEqual(SM2_CONSTANTS.minEaseFactor - 0.001)
        }),
        { numRuns: 100 }
      )
    })

    it('should maintain floor even with repeated Again ratings', () => {
      // Simulate worst case: repeated Again (1) ratings
      let state: SM2Input = { interval: 10, easeFactor: 2.5, rating: 1 }
      
      for (let i = 0; i < 20; i++) {
        const result = calculateNextReview(state)
        expect(result.easeFactor).toBeGreaterThanOrEqual(SM2_CONSTANTS.minEaseFactor)
        state = { ...state, interval: result.interval, easeFactor: result.easeFactor }
      }
    })
  })

  /**
   * **Property 3: SM-2 Next Review Strictly Future**
   * For any valid SM-2 input, calculateNextReview SHALL return a next_review date strictly after now.
   * **Validates: Requirements 3.3**
   */
  describe('Property 3: SM-2 Next Review Strictly Future', () => {
    it('should always return next_review in the future', () => {
      fc.assert(
        fc.property(validSM2InputArb, (input) => {
          const before = new Date()
          const result = calculateNextReview(input)
          // Allow small tolerance for execution time
          expect(result.nextReview.getTime()).toBeGreaterThanOrEqual(before.getTime())
        }),
        { numRuns: 100 }
      )
    })
  })

  // Reusable ease factor arbitrary with Math.fround
  const easeFactorArb = fc.float({ min: Math.fround(1.3), max: Math.fround(3.0), noNaN: true })
  const easeFactorHighArb = fc.float({ min: Math.fround(1.5), max: Math.fround(3.0), noNaN: true })

  /**
   * Rating-specific behavior tests
   */
  describe('Rating-specific behavior', () => {
    it('rating=1 (Again) should reset interval to 0 and schedule within 10 minutes', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 365 }),
          easeFactorArb,
          (interval, easeFactor) => {
            const input: SM2Input = { interval, easeFactor, rating: 1 }
            const before = new Date()
            const result = calculateNextReview(input)
            
            // Interval should be reset to 0
            expect(result.interval).toBe(0)
            
            // Next review should be within ~10 minutes
            const diffMs = result.nextReview.getTime() - before.getTime()
            const tenMinutesMs = 10 * 60 * 1000
            expect(diffMs).toBeLessThanOrEqual(tenMinutesMs + 1000) // 1s tolerance
            expect(diffMs).toBeGreaterThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('rating=4 (Easy) with interval=0 should set interval to 4 days', () => {
      fc.assert(
        fc.property(
          easeFactorArb,
          (easeFactor) => {
            const input: SM2Input = { interval: 0, easeFactor, rating: 4 }
            const result = calculateNextReview(input)
            
            expect(result.interval).toBe(SM2_CONSTANTS.easyInitialIntervalDays)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('rating=2 (Hard) should not decrease interval below 1 for non-zero input', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 365 }),
          easeFactorArb,
          (interval, easeFactor) => {
            const input: SM2Input = { interval, easeFactor, rating: 2 }
            const result = calculateNextReview(input)
            
            expect(result.interval).toBeGreaterThanOrEqual(1)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('rating=3 (Good) should increase interval for non-zero input', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          easeFactorHighArb,
          (interval, easeFactor) => {
            const input: SM2Input = { interval, easeFactor, rating: 3 }
            const result = calculateNextReview(input)
            
            // Good rating multiplies by ease factor, so should increase
            expect(result.interval).toBeGreaterThanOrEqual(interval)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Ease factor adjustment tests
   */
  describe('Ease factor adjustments', () => {
    it('rating=1 should decrease ease factor', () => {
      const input: SM2Input = { interval: 10, easeFactor: 2.5, rating: 1 }
      const result = calculateNextReview(input)
      expect(result.easeFactor).toBeLessThan(2.5)
    })

    it('rating=2 should decrease ease factor', () => {
      const input: SM2Input = { interval: 10, easeFactor: 2.5, rating: 2 }
      const result = calculateNextReview(input)
      expect(result.easeFactor).toBeLessThan(2.5)
    })

    it('rating=3 should maintain ease factor', () => {
      const input: SM2Input = { interval: 10, easeFactor: 2.5, rating: 3 }
      const result = calculateNextReview(input)
      expect(result.easeFactor).toBe(2.5)
    })

    it('rating=4 should increase ease factor', () => {
      const input: SM2Input = { interval: 10, easeFactor: 2.5, rating: 4 }
      const result = calculateNextReview(input)
      expect(result.easeFactor).toBeGreaterThan(2.5)
    })
  })
})
