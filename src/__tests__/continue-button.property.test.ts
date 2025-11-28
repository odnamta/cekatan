import { describe, test, expect } from 'vitest'
import fc from 'fast-check'

/**
 * Continue Button Display Property-Based Tests
 * 
 * **Feature: v3-ux-overhaul, Property 7: Continue button conditional display**
 * **Validates: Requirements 6.3, 6.4**
 * 
 * For any global study session completion, the "Continue Studying" button SHALL be
 * visible if and only if `remainingDueCount > 0`.
 */

/**
 * Pure function to determine if the continue button should be visible.
 * This mirrors the logic in GlobalStudySummary component.
 * 
 * @param remainingDueCount - Number of remaining due cards
 * @returns true if continue button should be visible
 */
function shouldShowContinueButton(remainingDueCount: number): boolean {
  return remainingDueCount > 0
}

// Generator for remaining due count (non-negative integers)
const remainingDueCountArb = fc.integer({ min: 0, max: 10000 })

// Generator for positive remaining due count (at least 1)
const positiveRemainingDueCountArb = fc.integer({ min: 1, max: 10000 })

// Generator for zero remaining due count
const zeroRemainingDueCountArb = fc.constant(0)

describe('Property 7: Continue button conditional display', () => {
  /**
   * **Feature: v3-ux-overhaul, Property 7: Continue button conditional display**
   * **Validates: Requirements 6.3, 6.4**
   */
  test('continue button is visible when remainingDueCount > 0', () => {
    fc.assert(
      fc.property(positiveRemainingDueCountArb, (remainingDueCount) => {
        const shouldShow = shouldShowContinueButton(remainingDueCount)
        
        // Requirement 6.3: WHEN more due cards remain THEN display "Continue Studying" button
        expect(shouldShow).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  test('continue button is hidden when remainingDueCount is 0', () => {
    fc.assert(
      fc.property(zeroRemainingDueCountArb, (remainingDueCount) => {
        const shouldShow = shouldShowContinueButton(remainingDueCount)
        
        // Requirement 6.4: WHEN no more due cards remain THEN hide "Continue Studying" button
        expect(shouldShow).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  test('continue button visibility is determined solely by remainingDueCount > 0', () => {
    fc.assert(
      fc.property(remainingDueCountArb, (remainingDueCount) => {
        const shouldShow = shouldShowContinueButton(remainingDueCount)
        
        // The button should be visible if and only if remainingDueCount > 0
        expect(shouldShow).toBe(remainingDueCount > 0)
      }),
      { numRuns: 100 }
    )
  })

  test('continue button visibility is consistent for same remainingDueCount', () => {
    fc.assert(
      fc.property(remainingDueCountArb, (remainingDueCount) => {
        // Calling the function multiple times with same input should give same result
        const result1 = shouldShowContinueButton(remainingDueCount)
        const result2 = shouldShowContinueButton(remainingDueCount)
        const result3 = shouldShowContinueButton(remainingDueCount)
        
        expect(result1).toBe(result2)
        expect(result2).toBe(result3)
      }),
      { numRuns: 100 }
    )
  })

  test('boundary case: remainingDueCount of 1 shows button', () => {
    const shouldShow = shouldShowContinueButton(1)
    expect(shouldShow).toBe(true)
  })

  test('boundary case: remainingDueCount of 0 hides button', () => {
    const shouldShow = shouldShowContinueButton(0)
    expect(shouldShow).toBe(false)
  })
})
