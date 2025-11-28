import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { 
  computeGlobalDueCount, 
  filterAndOrderDueCards,
  CardForGlobalDueCount 
} from '../lib/global-due-count';

/**
 * Global Due Count Property-Based Tests
 * 
 * **Feature: v3-ux-overhaul, Property 1: Global due count accuracy**
 * **Validates: Requirements 1.2**
 * 
 * For any user with multiple decks containing cards with various next_review timestamps,
 * the computed totalDueCount SHALL equal the sum of cards where next_review <= now
 * across all user-owned decks.
 */

// Generator for valid ISO date strings using timestamps
const validDateArb = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-01-01').getTime(),
}).map(timestamp => new Date(timestamp).toISOString());

// Generator for a card with a next_review timestamp
const cardArb: fc.Arbitrary<CardForGlobalDueCount> = fc.record({
  next_review: validDateArb,
});

// Generator for an array of cards (simulating cards from multiple decks)
const cardsArb = fc.array(cardArb, { minLength: 0, maxLength: 100 });

// Generator for batch limit
const limitArb = fc.integer({ min: 1, max: 100 });

describe('Property 1: Global due count accuracy', () => {
  test('Global due count equals count of cards where next_review <= now', () => {
    fc.assert(
      fc.property(cardsArb, validDateArb, (cards, now) => {
        const dueCount = computeGlobalDueCount(cards, now);
        
        // Manually count cards that are due
        const expectedCount = cards.reduce((count, card) => {
          return card.next_review <= now ? count + 1 : count;
        }, 0);
        
        expect(dueCount).toBe(expectedCount);
      }),
      { numRuns: 100 }
    );
  });

  test('Global due count is always non-negative', () => {
    fc.assert(
      fc.property(cardsArb, validDateArb, (cards, now) => {
        const dueCount = computeGlobalDueCount(cards, now);
        expect(dueCount).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  test('Global due count is at most the total number of cards', () => {
    fc.assert(
      fc.property(cardsArb, validDateArb, (cards, now) => {
        const dueCount = computeGlobalDueCount(cards, now);
        expect(dueCount).toBeLessThanOrEqual(cards.length);
      }),
      { numRuns: 100 }
    );
  });

  test('Empty card array returns zero due count', () => {
    fc.assert(
      fc.property(validDateArb, (now) => {
        const dueCount = computeGlobalDueCount([], now);
        expect(dueCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  test('All cards due when now is far in the future', () => {
    const farFutureTime = new Date('2099-12-31').toISOString();
    
    fc.assert(
      fc.property(cardsArb, (cards) => {
        const dueCount = computeGlobalDueCount(cards, farFutureTime);
        expect(dueCount).toBe(cards.length);
      }),
      { numRuns: 100 }
    );
  });

  test('No cards due when now is far in the past', () => {
    const farPastTime = new Date('1990-01-01').toISOString();
    
    fc.assert(
      fc.property(cardsArb, (cards) => {
        const dueCount = computeGlobalDueCount(cards, farPastTime);
        expect(dueCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: v3-ux-overhaul, Property 3: Global due cards ordering and limit**
 * **Validates: Requirements 2.2**
 * 
 * For any set of due cards across multiple decks, getGlobalDueCards() SHALL return
 * cards ordered by next_review ascending, limited to 50 cards maximum.
 */
describe('Property 3: Global due cards ordering and limit', () => {
  test('Due cards are ordered by next_review ascending', () => {
    fc.assert(
      fc.property(cardsArb, validDateArb, (cards, now) => {
        const result = filterAndOrderDueCards(cards, now);
        
        // Verify ordering: each card's next_review should be <= the next card's
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].next_review <= result[i + 1].next_review).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Result is limited to specified maximum', () => {
    fc.assert(
      fc.property(cardsArb, validDateArb, limitArb, (cards, now, limit) => {
        const result = filterAndOrderDueCards(cards, now, limit);
        expect(result.length).toBeLessThanOrEqual(limit);
      }),
      { numRuns: 100 }
    );
  });

  test('Default limit is 50 cards', () => {
    // Create 100 cards all due now
    const farFutureTime = new Date('2099-12-31').toISOString();
    
    fc.assert(
      fc.property(
        fc.array(cardArb, { minLength: 60, maxLength: 100 }),
        (cards) => {
          const result = filterAndOrderDueCards(cards, farFutureTime);
          expect(result.length).toBeLessThanOrEqual(50);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('All returned cards are due (next_review <= now)', () => {
    fc.assert(
      fc.property(cardsArb, validDateArb, (cards, now) => {
        const result = filterAndOrderDueCards(cards, now);
        
        for (const card of result) {
          expect(card.next_review <= now).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Result count matches due count when under limit', () => {
    fc.assert(
      fc.property(cardsArb, validDateArb, limitArb, (cards, now, limit) => {
        const result = filterAndOrderDueCards(cards, now, limit);
        const totalDue = computeGlobalDueCount(cards, now);
        
        expect(result.length).toBe(Math.min(totalDue, limit));
      }),
      { numRuns: 100 }
    );
  });
});


import { getNewCardsFallback, CardWithCreatedAt } from '../lib/global-due-count';

// Generator for a card with created_at timestamp
const cardWithCreatedAtArb: fc.Arbitrary<CardWithCreatedAt> = fc.record({
  next_review: validDateArb,
  created_at: validDateArb,
});

// Generator for an array of cards with created_at
const cardsWithCreatedAtArb = fc.array(cardWithCreatedAtArb, { minLength: 0, maxLength: 100 });

/**
 * **Feature: v3-ux-overhaul, Property 4: New cards fallback**
 * **Validates: Requirements 2.4**
 * 
 * For any user with zero due cards but existing new cards (never reviewed),
 * getGlobalDueCards() SHALL return up to 10 new cards ordered by created_at ascending.
 */
describe('Property 4: New cards fallback', () => {
  test('New cards are ordered by created_at ascending', () => {
    fc.assert(
      fc.property(cardsWithCreatedAtArb, (cards) => {
        const result = getNewCardsFallback(cards);
        
        // Verify ordering: each card's created_at should be <= the next card's
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].created_at <= result[i + 1].created_at).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Default limit is 10 cards', () => {
    fc.assert(
      fc.property(
        fc.array(cardWithCreatedAtArb, { minLength: 15, maxLength: 50 }),
        (cards) => {
          const result = getNewCardsFallback(cards);
          expect(result.length).toBeLessThanOrEqual(10);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Result is limited to specified maximum', () => {
    fc.assert(
      fc.property(cardsWithCreatedAtArb, limitArb, (cards, limit) => {
        const result = getNewCardsFallback(cards, limit);
        expect(result.length).toBeLessThanOrEqual(limit);
      }),
      { numRuns: 100 }
    );
  });

  test('Returns all cards when under limit', () => {
    fc.assert(
      fc.property(
        fc.array(cardWithCreatedAtArb, { minLength: 0, maxLength: 5 }),
        (cards) => {
          const result = getNewCardsFallback(cards, 10);
          expect(result.length).toBe(cards.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Empty array returns empty result', () => {
    const result = getNewCardsFallback([]);
    expect(result.length).toBe(0);
  });
});
