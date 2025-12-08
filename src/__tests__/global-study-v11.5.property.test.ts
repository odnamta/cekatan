import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Global Study Property Tests
 * 
 * **Feature: v11.5-global-study-stabilization**
 * Tests for global due card filtering and ordering.
 */

// Types for testing
interface MockCard {
  id: string
  status: 'draft' | 'published' | 'archived'
  suspended: boolean
  nextReview: Date
}

/**
 * Pure function to filter due cards (mirrors getGlobalDueCards logic).
 * Used for property testing without database dependencies.
 */
function filterDueCards(cards: MockCard[], now: Date): MockCard[] {
  return cards.filter(
    (card) =>
      card.status === 'published' &&
      !card.suspended &&
      card.nextReview <= now
  )
}

/**
 * Pure function to sort cards by next_review ascending.
 */
function sortByNextReview(cards: MockCard[]): MockCard[] {
  return [...cards].sort(
    (a, b) => a.nextReview.getTime() - b.nextReview.getTime()
  )
}

// Arbitraries
const cardStatusArb = fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<'draft' | 'published' | 'archived'>

const mockCardArb = fc.record({
  id: fc.uuid(),
  status: cardStatusArb,
  suspended: fc.boolean(),
  nextReview: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
})

describe('Global Study Property Tests', () => {
  /**
   * **Property 4: Global Due Cards Filter - Published Only**
   * For any set of cards with mixed statuses, getGlobalDueCards SHALL return only cards where status = 'published'.
   * **Validates: Requirements 1.4, 2.3**
   */
  describe('Property 4: Global Due Cards Filter - Published Only', () => {
    it('should only return published cards', () => {
      fc.assert(
        fc.property(
          fc.array(mockCardArb, { minLength: 0, maxLength: 50 }),
          fc.date({ min: new Date('2024-06-01'), max: new Date('2025-06-01') }),
          (cards, now) => {
            const result = filterDueCards(cards, now)
            
            // All returned cards must be published
            result.forEach((card) => {
              expect(card.status).toBe('published')
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should exclude draft cards', () => {
      const cards: MockCard[] = [
        { id: '1', status: 'draft', suspended: false, nextReview: new Date('2024-01-01') },
        { id: '2', status: 'published', suspended: false, nextReview: new Date('2024-01-01') },
      ]
      const now = new Date('2024-06-01')
      
      const result = filterDueCards(cards, now)
      
      expect(result.length).toBe(1)
      expect(result[0].id).toBe('2')
    })

    it('should exclude archived cards', () => {
      const cards: MockCard[] = [
        { id: '1', status: 'archived', suspended: false, nextReview: new Date('2024-01-01') },
        { id: '2', status: 'published', suspended: false, nextReview: new Date('2024-01-01') },
      ]
      const now = new Date('2024-06-01')
      
      const result = filterDueCards(cards, now)
      
      expect(result.length).toBe(1)
      expect(result[0].id).toBe('2')
    })
  })

  /**
   * **Property 5: Global Due Cards Filter - Not Suspended**
   * For any set of cards with mixed suspended values, getGlobalDueCards SHALL exclude cards where suspended = true.
   * **Validates: Requirements 2.4**
   */
  describe('Property 5: Global Due Cards Filter - Not Suspended', () => {
    it('should exclude suspended cards', () => {
      fc.assert(
        fc.property(
          fc.array(mockCardArb, { minLength: 0, maxLength: 50 }),
          fc.date({ min: new Date('2024-06-01'), max: new Date('2025-06-01') }),
          (cards, now) => {
            const result = filterDueCards(cards, now)
            
            // No returned cards should be suspended
            result.forEach((card) => {
              expect(card.suspended).toBe(false)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include non-suspended published cards', () => {
      const cards: MockCard[] = [
        { id: '1', status: 'published', suspended: true, nextReview: new Date('2024-01-01') },
        { id: '2', status: 'published', suspended: false, nextReview: new Date('2024-01-01') },
      ]
      const now = new Date('2024-06-01')
      
      const result = filterDueCards(cards, now)
      
      expect(result.length).toBe(1)
      expect(result[0].id).toBe('2')
    })
  })

  /**
   * **Property 6: Global Due Cards Ordering**
   * For any set of due cards, getGlobalDueCards SHALL return them sorted by next_review ascending.
   * **Validates: Requirements 1.5**
   */
  describe('Property 6: Global Due Cards Ordering', () => {
    it('should sort cards by next_review ascending (most overdue first)', () => {
      fc.assert(
        fc.property(
          fc.array(mockCardArb, { minLength: 0, maxLength: 50 }),
          fc.date({ min: new Date('2024-06-01'), max: new Date('2025-06-01') }),
          (cards, now) => {
            const filtered = filterDueCards(cards, now)
            const sorted = sortByNextReview(filtered)
            
            // Verify ascending order
            for (let i = 1; i < sorted.length; i++) {
              expect(sorted[i].nextReview.getTime()).toBeGreaterThanOrEqual(
                sorted[i - 1].nextReview.getTime()
              )
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should put most overdue cards first', () => {
      const cards: MockCard[] = [
        { id: '3', status: 'published', suspended: false, nextReview: new Date('2024-03-01') },
        { id: '1', status: 'published', suspended: false, nextReview: new Date('2024-01-01') },
        { id: '2', status: 'published', suspended: false, nextReview: new Date('2024-02-01') },
      ]
      const now = new Date('2024-06-01')
      
      const filtered = filterDueCards(cards, now)
      const sorted = sortByNextReview(filtered)
      
      expect(sorted[0].id).toBe('1') // Jan 1 - most overdue
      expect(sorted[1].id).toBe('2') // Feb 1
      expect(sorted[2].id).toBe('3') // Mar 1
    })
  })

  /**
   * Combined filter and sort test
   */
  describe('Combined filtering and sorting', () => {
    it('should filter then sort correctly', () => {
      const cards: MockCard[] = [
        { id: '1', status: 'draft', suspended: false, nextReview: new Date('2024-01-01') },
        { id: '2', status: 'published', suspended: true, nextReview: new Date('2024-01-02') },
        { id: '3', status: 'published', suspended: false, nextReview: new Date('2024-03-01') },
        { id: '4', status: 'published', suspended: false, nextReview: new Date('2024-02-01') },
        { id: '5', status: 'archived', suspended: false, nextReview: new Date('2024-01-15') },
        { id: '6', status: 'published', suspended: false, nextReview: new Date('2025-01-01') }, // future
      ]
      const now = new Date('2024-06-01')
      
      const filtered = filterDueCards(cards, now)
      const sorted = sortByNextReview(filtered)
      
      // Should only have cards 3 and 4 (published, not suspended, due)
      expect(sorted.length).toBe(2)
      expect(sorted[0].id).toBe('4') // Feb 1 - more overdue
      expect(sorted[1].id).toBe('3') // Mar 1
    })
  })

  /**
   * Edge cases
   */
  describe('Edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = filterDueCards([], new Date())
      expect(result).toEqual([])
    })

    it('should return empty array when no cards are due', () => {
      const cards: MockCard[] = [
        { id: '1', status: 'published', suspended: false, nextReview: new Date('2025-12-01') },
      ]
      const now = new Date('2024-06-01')
      
      const result = filterDueCards(cards, now)
      expect(result).toEqual([])
    })

    it('should return empty array when all cards are draft', () => {
      const cards: MockCard[] = [
        { id: '1', status: 'draft', suspended: false, nextReview: new Date('2024-01-01') },
        { id: '2', status: 'draft', suspended: false, nextReview: new Date('2024-02-01') },
      ]
      const now = new Date('2024-06-01')
      
      const result = filterDueCards(cards, now)
      expect(result).toEqual([])
    })

    it('should return empty array when all cards are suspended', () => {
      const cards: MockCard[] = [
        { id: '1', status: 'published', suspended: true, nextReview: new Date('2024-01-01') },
        { id: '2', status: 'published', suspended: true, nextReview: new Date('2024-02-01') },
      ]
      const now = new Date('2024-06-01')
      
      const result = filterDueCards(cards, now)
      expect(result).toEqual([])
    })
  })
})
