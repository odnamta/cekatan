/**
 * Due Count Calculation Utility
 * 
 * This module provides functions for calculating due card counts.
 * Extracted for testability via property-based testing.
 */

export interface CardForDueCount {
  next_review: string;
}

/**
 * Calculates the number of cards that are due for review.
 * A card is due when its next_review timestamp is less than or equal to the current time.
 * 
 * @param cards - Array of cards with next_review timestamps
 * @param currentTime - The current timestamp to compare against (ISO string)
 * @returns The count of cards that are due
 * 
 * Requirements: 6.2
 */
export function calculateDueCount(cards: CardForDueCount[], currentTime: string): number {
  return cards.filter(card => card.next_review <= currentTime).length;
}

/**
 * Filters cards to return only those that are due for review.
 * A card is due when its next_review timestamp is less than or equal to the current time.
 * 
 * @param cards - Array of cards with next_review timestamps
 * @param currentTime - The current timestamp to compare against (ISO string)
 * @returns Array of cards that are due
 * 
 * Requirements: 5.1
 */
export function filterDueCards<T extends CardForDueCount>(cards: T[], currentTime: string): T[] {
  return cards.filter(card => card.next_review <= currentTime);
}
