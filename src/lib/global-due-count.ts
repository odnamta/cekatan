/**
 * Global Due Count Calculation Utility
 * 
 * This module provides functions for calculating due card counts across all decks.
 * Extracted for testability via property-based testing.
 * 
 * Requirements: 1.2, 2.2
 */

export interface CardForGlobalDueCount {
  next_review: string;
}

export interface CardWithCreatedAt extends CardForGlobalDueCount {
  created_at: string;
}

/**
 * Computes the total count of cards that are due for review across all decks.
 * A card is due when its next_review timestamp is less than or equal to the current time.
 * 
 * @param cards - Array of cards with next_review timestamps from all user decks
 * @param now - The current timestamp to compare against (ISO string)
 * @returns The count of cards that are due
 * 
 * Requirements: 1.2
 */
export function computeGlobalDueCount(cards: CardForGlobalDueCount[], now: string): number {
  return cards.filter(card => card.next_review <= now).length;
}

/**
 * Filters and orders due cards by next_review ascending, with optional limit.
 * 
 * @param cards - Array of cards with next_review timestamps
 * @param now - The current timestamp to compare against (ISO string)
 * @param limit - Maximum number of cards to return (default: 50)
 * @returns Array of due cards ordered by next_review ASC, limited to specified count
 * 
 * Requirements: 2.2
 */
export function filterAndOrderDueCards<T extends CardForGlobalDueCount>(
  cards: T[],
  now: string,
  limit: number = 50
): T[] {
  return cards
    .filter(card => card.next_review <= now)
    .sort((a, b) => a.next_review.localeCompare(b.next_review))
    .slice(0, limit);
}

/**
 * Gets new cards (never reviewed) ordered by created_at ascending.
 * Used as fallback when no due cards exist.
 * 
 * @param cards - Array of cards with created_at timestamps
 * @param limit - Maximum number of cards to return (default: 10)
 * @returns Array of cards ordered by created_at ASC, limited to specified count
 * 
 * Requirements: 2.4
 */
export function getNewCardsFallback<T extends CardWithCreatedAt>(
  cards: T[],
  limit: number = 10
): T[] {
  return cards
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, limit);
}
