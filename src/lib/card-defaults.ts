/**
 * Card Default Values Utility
 * 
 * Provides default SM-2 values for newly created cards.
 * Requirements: 3.1
 */

export interface CardDefaults {
  interval: number
  ease_factor: number
  next_review: Date
}

/**
 * Generates default SM-2 values for a new card.
 * 
 * Default values:
 * - interval: 0 (card is new, never reviewed)
 * - ease_factor: 2.5 (standard starting ease)
 * - next_review: current timestamp (immediately due)
 * 
 * @returns CardDefaults with initial SM-2 values
 */
export function getCardDefaults(): CardDefaults {
  return {
    interval: 0,
    ease_factor: 2.5,
    next_review: new Date(),
  }
}

/**
 * Validates that card values match the expected defaults.
 * Used for testing and verification.
 * 
 * @param card - Card values to validate
 * @param referenceTime - Reference timestamp for next_review comparison
 * @returns true if values match defaults
 */
export function validateCardDefaults(
  card: { interval: number; ease_factor: number; next_review: Date | string },
  referenceTime: Date
): boolean {
  const nextReview = typeof card.next_review === 'string' 
    ? new Date(card.next_review) 
    : card.next_review

  return (
    card.interval === 0 &&
    card.ease_factor === 2.5 &&
    nextReview.getTime() <= referenceTime.getTime()
  )
}
