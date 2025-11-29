import { describe, test, expect } from 'vitest'
import fc from 'fast-check'
import { getCardDefaults } from '../lib/card-defaults'

/**
 * Card Duplication Property-Based Tests
 * 
 * These tests verify the duplicateCard logic from the design document:
 * - MCQ cards should have non-null front/back fields
 * - Flashcard duplication copies front/back with "(copy)" suffix
 * - Duplicated cards have fresh SM-2 scheduling defaults
 * 
 * **Feature: v4.2-ui-ux-upgrade, Property: Card Duplication**
 * **Validates: Requirements B.2, B.3, B.4**
 */

// Types matching the database schema
interface Card {
  id: string
  deck_id: string
  card_type: 'flashcard' | 'mcq'
  front: string
  back: string
  stem: string | null
  options: string[] | null
  correct_index: number | null
  explanation: string | null
  image_url: string | null
  interval: number
  ease_factor: number
  next_review: string
}

/**
 * Pure function that simulates the duplication logic from duplicateCard server action.
 * This allows us to test the logic without database dependencies.
 */
function buildDuplicateCardData(originalCard: Card): Omit<Card, 'id' | 'created_at'> {
  const defaults = getCardDefaults()
  
  const newCardData: Omit<Card, 'id' | 'created_at'> = {
    deck_id: originalCard.deck_id,
    card_type: originalCard.card_type,
    interval: defaults.interval,
    ease_factor: defaults.ease_factor,
    next_review: defaults.next_review.toISOString(),
    front: '',
    back: '',
    stem: null,
    options: null,
    correct_index: null,
    explanation: null,
    image_url: null,
  }

  if (originalCard.card_type === 'mcq') {
    newCardData.stem = (originalCard.stem || '') + ' (copy)'
    newCardData.options = originalCard.options
    newCardData.correct_index = originalCard.correct_index
    newCardData.explanation = originalCard.explanation
    // MCQ cards need front/back to satisfy NOT NULL constraint
    newCardData.front = originalCard.front || ''
    newCardData.back = originalCard.back || ''
  } else {
    newCardData.front = (originalCard.front || '') + ' (copy)'
    newCardData.back = originalCard.back
    newCardData.image_url = originalCard.image_url
  }

  return newCardData
}

// Arbitraries for generating test data
const uuidArb = fc.uuid()

// Simple URL arbitrary (avoid fc.webUrl() which can generate invalid URLs)
const imageUrlArb = fc.option(
  fc.constantFrom(
    'https://example.com/image.jpg',
    'https://example.com/photo.png',
    'https://cdn.example.com/img/test.gif',
    null
  ),
  { nil: null }
)

const flashcardArb = fc.record({
  id: uuidArb,
  deck_id: uuidArb,
  card_type: fc.constant('flashcard' as const),
  front: fc.string({ minLength: 1, maxLength: 100 }),
  back: fc.string({ minLength: 1, maxLength: 100 }),
  stem: fc.constant(null),
  options: fc.constant(null),
  correct_index: fc.constant(null),
  explanation: fc.constant(null),
  image_url: imageUrlArb,
  interval: fc.integer({ min: 0, max: 365 }),
  ease_factor: fc.constantFrom(1.3, 2.0, 2.5, 3.0, 4.0),
  next_review: fc.constant(new Date().toISOString()),
})

const mcqOptionsArb = fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 5 })

const mcqCardArb = mcqOptionsArb.chain(options => 
  fc.record({
    id: uuidArb,
    deck_id: uuidArb,
    card_type: fc.constant('mcq' as const),
    front: fc.constant(''), // MCQ cards have empty front
    back: fc.constant(''),  // MCQ cards have empty back
    stem: fc.string({ minLength: 1, maxLength: 100 }),
    options: fc.constant(options),
    correct_index: fc.integer({ min: 0, max: options.length - 1 }),
    explanation: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
    image_url: imageUrlArb,
    interval: fc.integer({ min: 0, max: 365 }),
    ease_factor: fc.constantFrom(1.3, 2.0, 2.5, 3.0, 4.0),
    next_review: fc.constant(new Date().toISOString()),
  })
)

describe('Property: Card Duplication - MCQ cards have non-null front/back', () => {
  /**
   * **Validates: Requirements B.2, B.3, B.4**
   * 
   * For any MCQ card, duplicating it should produce a card with non-null front and back fields
   * to satisfy the database NOT NULL constraint.
   */
  test('MCQ duplication produces card with non-null front field', () => {
    fc.assert(
      fc.property(mcqCardArb, (mcqCard) => {
        const duplicated = buildDuplicateCardData(mcqCard)
        
        expect(duplicated.front).not.toBeNull()
        expect(duplicated.front).toBeDefined()
        expect(typeof duplicated.front).toBe('string')
      }),
      { numRuns: 100 }
    )
  })

  test('MCQ duplication produces card with non-null back field', () => {
    fc.assert(
      fc.property(mcqCardArb, (mcqCard) => {
        const duplicated = buildDuplicateCardData(mcqCard)
        
        expect(duplicated.back).not.toBeNull()
        expect(duplicated.back).toBeDefined()
        expect(typeof duplicated.back).toBe('string')
      }),
      { numRuns: 100 }
    )
  })

  test('MCQ duplication preserves stem with "(copy)" suffix', () => {
    fc.assert(
      fc.property(mcqCardArb, (mcqCard) => {
        const duplicated = buildDuplicateCardData(mcqCard)
        
        expect(duplicated.stem).toBe((mcqCard.stem || '') + ' (copy)')
      }),
      { numRuns: 100 }
    )
  })

  test('MCQ duplication preserves options array', () => {
    fc.assert(
      fc.property(mcqCardArb, (mcqCard) => {
        const duplicated = buildDuplicateCardData(mcqCard)
        
        expect(duplicated.options).toEqual(mcqCard.options)
      }),
      { numRuns: 100 }
    )
  })

  test('MCQ duplication preserves correct_index', () => {
    fc.assert(
      fc.property(mcqCardArb, (mcqCard) => {
        const duplicated = buildDuplicateCardData(mcqCard)
        
        expect(duplicated.correct_index).toBe(mcqCard.correct_index)
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property: Card Duplication - Flashcard copies front/back with suffix', () => {
  /**
   * **Validates: Requirements B.2, B.3, B.4**
   * 
   * For any flashcard, duplicating it should copy front with "(copy)" suffix
   * and preserve the back field exactly.
   */
  test('Flashcard duplication adds "(copy)" suffix to front', () => {
    fc.assert(
      fc.property(flashcardArb, (flashcard) => {
        const duplicated = buildDuplicateCardData(flashcard)
        
        expect(duplicated.front).toBe((flashcard.front || '') + ' (copy)')
      }),
      { numRuns: 100 }
    )
  })

  test('Flashcard duplication preserves back field exactly', () => {
    fc.assert(
      fc.property(flashcardArb, (flashcard) => {
        const duplicated = buildDuplicateCardData(flashcard)
        
        expect(duplicated.back).toBe(flashcard.back)
      }),
      { numRuns: 100 }
    )
  })

  test('Flashcard duplication preserves image_url', () => {
    fc.assert(
      fc.property(flashcardArb, (flashcard) => {
        const duplicated = buildDuplicateCardData(flashcard)
        
        expect(duplicated.image_url).toBe(flashcard.image_url)
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property: Card Duplication - Fresh SM-2 scheduling defaults', () => {
  /**
   * **Validates: Requirements B.2, B.3, B.4**
   * 
   * For any duplicated card (MCQ or flashcard), the SM-2 scheduling values
   * should be reset to fresh defaults (interval=0, ease_factor=2.5).
   */
  test('Duplicated card has interval reset to 0', () => {
    const anyCardArb = fc.oneof(flashcardArb, mcqCardArb)
    
    fc.assert(
      fc.property(anyCardArb, (card) => {
        const duplicated = buildDuplicateCardData(card)
        
        expect(duplicated.interval).toBe(0)
      }),
      { numRuns: 100 }
    )
  })

  test('Duplicated card has ease_factor reset to 2.5', () => {
    const anyCardArb = fc.oneof(flashcardArb, mcqCardArb)
    
    fc.assert(
      fc.property(anyCardArb, (card) => {
        const duplicated = buildDuplicateCardData(card)
        
        expect(duplicated.ease_factor).toBe(2.5)
      }),
      { numRuns: 100 }
    )
  })

  test('Duplicated card has next_review set to current time', () => {
    const anyCardArb = fc.oneof(flashcardArb, mcqCardArb)
    
    fc.assert(
      fc.property(anyCardArb, (card) => {
        const before = new Date()
        const duplicated = buildDuplicateCardData(card)
        const after = new Date()
        
        const nextReview = new Date(duplicated.next_review)
        
        // next_review should be between before and after (inclusive)
        expect(nextReview.getTime()).toBeGreaterThanOrEqual(before.getTime())
        expect(nextReview.getTime()).toBeLessThanOrEqual(after.getTime())
      }),
      { numRuns: 100 }
    )
  })

  test('Duplicated card preserves deck_id', () => {
    const anyCardArb = fc.oneof(flashcardArb, mcqCardArb)
    
    fc.assert(
      fc.property(anyCardArb, (card) => {
        const duplicated = buildDuplicateCardData(card)
        
        expect(duplicated.deck_id).toBe(card.deck_id)
      }),
      { numRuns: 100 }
    )
  })

  test('Duplicated card preserves card_type', () => {
    const anyCardArb = fc.oneof(flashcardArb, mcqCardArb)
    
    fc.assert(
      fc.property(anyCardArb, (card) => {
        const duplicated = buildDuplicateCardData(card)
        
        expect(duplicated.card_type).toBe(card.card_type)
      }),
      { numRuns: 100 }
    )
  })
})
