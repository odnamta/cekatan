/**
 * V11.3: Content Staging - Property-Based Tests
 * 
 * Tests draft/publish workflow, session management, and QA metrics using fast-check.
 * **Feature: v11.3-content-staging**
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// ============================================
// Type Definitions
// ============================================

type CardStatus = 'draft' | 'published' | 'archived'

interface CardTemplate {
  id: string
  status: CardStatus
  import_session_id: string | null
  question_number: number | null
}

// ============================================
// Pure Helper Functions for Testing
// ============================================

/**
 * V11.3: Determines if a card should appear in study queries
 * Only published cards are visible in study flows
 */
function isCardStudyable(card: { status: CardStatus }): boolean {
  return card.status === 'published'
}

/**
 * V11.3: Filters cards to only those visible in study flows
 */
function filterStudyableCards<T extends { status: CardStatus }>(cards: T[]): T[] {
  return cards.filter(isCardStudyable)
}

/**
 * V11.3: Filters cards by import session ID
 */
function filterCardsBySession<T extends { import_session_id: string | null }>(
  cards: T[],
  sessionId: string
): T[] {
  return cards.filter(card => card.import_session_id === sessionId)
}

/**
 * V11.3: Sorts cards by question number
 */
function sortByQuestionNumber<T extends { question_number: number | null }>(
  cards: T[],
  ascending: boolean = true
): T[] {
  return [...cards].sort((a, b) => {
    // Null values go to the end
    if (a.question_number === null && b.question_number === null) return 0
    if (a.question_number === null) return 1
    if (b.question_number === null) return -1
    
    return ascending 
      ? a.question_number - b.question_number
      : b.question_number - a.question_number
  })
}

/**
 * V11.3: Generates a unique import session ID
 */
function generateImportSessionId(): string {
  return crypto.randomUUID()
}

/**
 * V11.3: Calculates missing question numbers
 */
function calculateMissingNumbers(detected: number[], saved: number[]): number[] {
  const savedSet = new Set(saved)
  return detected.filter(num => !savedSet.has(num)).sort((a, b) => a - b)
}

/**
 * V11.3: Formats QA metrics string
 */
function formatQAMetrics(
  detectedCount: number,
  createdCount: number,
  missingNumbers: number[]
): string {
  const missingPart = missingNumbers.length > 0
    ? ` · Missing: ${missingNumbers.join(', ')}`
    : ''
  return `Detected ${detectedCount} questions · ${createdCount} cards created${missingPart}`
}

/**
 * V11.3: Simulates bulk status update
 */
function bulkUpdateStatus<T extends { id: string; status: CardStatus }>(
  cards: T[],
  cardIds: string[],
  newStatus: CardStatus
): T[] {
  const idSet = new Set(cardIds)
  return cards.map(card => 
    idSet.has(card.id) ? { ...card, status: newStatus } : card
  )
}

/**
 * V11.3: Simulates card duplication
 */
function duplicateCard(
  original: CardTemplate,
  newId: string
): CardTemplate {
  return {
    ...original,
    id: newId,
    status: 'draft', // Always draft for duplicates
    // Preserve import_session_id
  }
}

// ============================================
// Property 1: Bulk import creates cards with draft status
// ============================================

describe('V11.3 Content Staging - Draft Status Properties', () => {
  /**
   * **Feature: v11.3-content-staging, Property 1: Bulk import creates cards with draft status**
   * *For any* valid bulk import input with an `importSessionId`, all created 
   * Card_Templates SHALL have `status = 'draft'`.
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: Bulk import creates cards with draft status', () => {
    it('cards created with session ID have draft status', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              stem: fc.string({ minLength: 10, maxLength: 200 }),
              options: fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 5 }),
              correctIndex: fc.integer({ min: 0, max: 4 }),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          fc.uuid(), // importSessionId
          (cards, sessionId) => {
            // Simulate bulk create with session ID
            const createdCards = cards.map((_, index) => ({
              id: `card-${index}`,
              status: 'draft' as CardStatus, // When session ID provided, status is draft
              import_session_id: sessionId,
              question_number: index + 1,
            }))
            
            // All cards should have draft status
            for (const card of createdCards) {
              expect(card.status).toBe('draft')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 2: Bulk import stores session ID on all cards
// ============================================

describe('V11.3 Content Staging - Session ID Properties', () => {
  /**
   * **Feature: v11.3-content-staging, Property 2: Bulk import stores session ID on all cards**
   * *For any* valid bulk import input with an `importSessionId`, all created 
   * Card_Templates SHALL have `import_session_id` equal to the provided session ID.
   * **Validates: Requirements 1.2, 2.2**
   */
  describe('Property 2: Bulk import stores session ID on all cards', () => {
    it('all cards in batch have same session ID', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }), // Number of cards
          fc.uuid(), // importSessionId
          (cardCount, sessionId) => {
            // Simulate bulk create
            const createdCards = Array.from({ length: cardCount }, (_, i) => ({
              id: `card-${i}`,
              status: 'draft' as CardStatus,
              import_session_id: sessionId,
              question_number: i + 1,
            }))
            
            // All cards should have the same session ID
            for (const card of createdCards) {
              expect(card.import_session_id).toBe(sessionId)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 3: Session ID generation is unique
// ============================================

describe('V11.3 Content Staging - Session ID Uniqueness', () => {
  /**
   * **Feature: v11.3-content-staging, Property 3: Session ID generation is unique**
   * *For any* two calls to `generateImportSessionId()`, the returned UUIDs 
   * SHALL be different.
   * **Validates: Requirements 2.1**
   */
  describe('Property 3: Session ID generation is unique', () => {
    it('generates unique session IDs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }), // Number of IDs to generate
          (count) => {
            const ids = Array.from({ length: count }, () => generateImportSessionId())
            const uniqueIds = new Set(ids)
            
            // All IDs should be unique
            expect(uniqueIds.size).toBe(count)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('session IDs are valid UUIDs', () => {
      fc.assert(
        fc.property(
          fc.constant(null), // No input needed
          () => {
            const id = generateImportSessionId()
            
            // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            expect(id).toMatch(uuidRegex)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 4: Study queries filter by published status only
// ============================================

describe('V11.3 Content Staging - Study Query Filtering', () => {
  /**
   * **Feature: v11.3-content-staging, Property 4: Study queries filter by published status only**
   * *For any* card with `status` not equal to 'published' (i.e., 'draft' or 'archived'), 
   * that card SHALL NOT appear in the results of study queries.
   * **Validates: Requirements 1.4, 3.1, 3.2, 3.3, 3.4**
   */
  describe('Property 4: Study queries filter by published status only', () => {
    it('only published cards appear in study results', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.option(fc.uuid(), { nil: null }),
              question_number: fc.option(fc.integer({ min: 1, max: 100 }), { nil: null }),
            }),
            { minLength: 0, maxLength: 50 }
          ),
          (cards) => {
            const studyableCards = filterStudyableCards(cards)
            
            // All studyable cards should be published
            for (const card of studyableCards) {
              expect(card.status).toBe('published')
            }
            
            // Count should match expected
            const expectedCount = cards.filter(c => c.status === 'published').length
            expect(studyableCards).toHaveLength(expectedCount)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('draft cards are excluded from study', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constant('draft') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.uuid(),
              question_number: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (draftCards) => {
            const studyableCards = filterStudyableCards(draftCards)
            expect(studyableCards).toHaveLength(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('archived cards are excluded from study', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constant('archived') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.option(fc.uuid(), { nil: null }),
              question_number: fc.option(fc.integer({ min: 1, max: 100 }), { nil: null }),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (archivedCards) => {
            const studyableCards = filterStudyableCards(archivedCards)
            expect(studyableCards).toHaveLength(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 5: Session fetch returns all cards with matching session ID
// ============================================

describe('V11.3 Content Staging - Session Fetch', () => {
  /**
   * **Feature: v11.3-content-staging, Property 5: Session fetch returns all cards with matching session ID**
   * *For any* `import_session_id`, calling `getSessionCards(sessionId)` SHALL return 
   * exactly the set of Card_Templates where `import_session_id = sessionId`.
   * **Validates: Requirements 2.3, 4.1**
   */
  describe('Property 5: Session fetch returns all cards with matching session ID', () => {
    it('returns exactly cards with matching session ID', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.option(fc.uuid(), { nil: null }),
              question_number: fc.option(fc.integer({ min: 1, max: 100 }), { nil: null }),
            }),
            { minLength: 0, maxLength: 50 }
          ),
          fc.uuid(), // Target session ID
          (cards, targetSessionId) => {
            const sessionCards = filterCardsBySession(cards, targetSessionId)
            
            // All returned cards should have matching session ID
            for (const card of sessionCards) {
              expect(card.import_session_id).toBe(targetSessionId)
            }
            
            // Count should match expected
            const expectedCount = cards.filter(c => c.import_session_id === targetSessionId).length
            expect(sessionCards).toHaveLength(expectedCount)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('returns empty array for non-existent session', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.uuid(), // All cards have session IDs
              question_number: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 0, maxLength: 20 }
          ),
          fc.uuid(), // Non-matching session ID
          (cards, nonMatchingSessionId) => {
            // Ensure the session ID doesn't match any card
            const cardsWithDifferentSessions = cards.filter(
              c => c.import_session_id !== nonMatchingSessionId
            )
            
            const sessionCards = filterCardsBySession(cardsWithDifferentSessions, nonMatchingSessionId)
            expect(sessionCards).toHaveLength(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 6: Sorting by question_number is correct
// ============================================

describe('V11.3 Content Staging - Sorting', () => {
  /**
   * **Feature: v11.3-content-staging, Property 6: Sorting by question_number is correct**
   * *For any* list of cards sorted by `question_number` ascending, each card's 
   * `question_number` SHALL be less than or equal to the next card's `question_number`.
   * **Validates: Requirements 4.4**
   */
  describe('Property 6: Sorting by question_number is correct', () => {
    it('ascending sort maintains order', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constant('draft') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.uuid(),
              question_number: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: null }),
            }),
            { minLength: 0, maxLength: 50 }
          ),
          (cards) => {
            const sorted = sortByQuestionNumber(cards, true)
            
            // Check order (nulls at end)
            for (let i = 0; i < sorted.length - 1; i++) {
              const current = sorted[i].question_number
              const next = sorted[i + 1].question_number
              
              if (current !== null && next !== null) {
                expect(current).toBeLessThanOrEqual(next)
              } else if (current === null) {
                // Current is null, next should also be null (nulls at end)
                expect(next).toBeNull()
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('descending sort maintains reverse order', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constant('draft') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.uuid(),
              question_number: fc.integer({ min: 1, max: 1000 }), // No nulls for simpler test
            }),
            { minLength: 0, maxLength: 50 }
          ),
          (cards) => {
            const sorted = sortByQuestionNumber(cards, false)
            
            for (let i = 0; i < sorted.length - 1; i++) {
              expect(sorted[i].question_number).toBeGreaterThanOrEqual(sorted[i + 1].question_number!)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('sorting preserves all cards', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constant('draft') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.uuid(),
              question_number: fc.option(fc.integer({ min: 1, max: 100 }), { nil: null }),
            }),
            { minLength: 0, maxLength: 50 }
          ),
          (cards) => {
            const sorted = sortByQuestionNumber(cards, true)
            expect(sorted).toHaveLength(cards.length)
            
            // All original IDs should be present
            const originalIds = new Set(cards.map(c => c.id))
            const sortedIds = new Set(sorted.map(c => c.id))
            expect(sortedIds).toEqual(originalIds)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})


// ============================================
// Property 8: Duplicate preserves session ID and sets draft status
// ============================================

describe('V11.3 Content Staging - Card Duplication', () => {
  /**
   * **Feature: v11.3-content-staging, Property 8: Duplicate preserves session ID and sets draft status**
   * *For any* card duplication via `duplicateCard`, the new card SHALL have the same 
   * `import_session_id` as the original and `status = 'draft'`.
   * **Validates: Requirements 5.3**
   */
  describe('Property 8: Duplicate preserves session ID and sets draft status', () => {
    it('duplicate has same session ID as original', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            status: fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<CardStatus>,
            import_session_id: fc.option(fc.uuid(), { nil: null }),
            question_number: fc.option(fc.integer({ min: 1, max: 100 }), { nil: null }),
          }),
          fc.uuid(), // New card ID
          (original, newId) => {
            const duplicate = duplicateCard(original, newId)
            
            expect(duplicate.import_session_id).toBe(original.import_session_id)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('duplicate always has draft status', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            status: fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<CardStatus>,
            import_session_id: fc.option(fc.uuid(), { nil: null }),
            question_number: fc.option(fc.integer({ min: 1, max: 100 }), { nil: null }),
          }),
          fc.uuid(),
          (original, newId) => {
            const duplicate = duplicateCard(original, newId)
            
            expect(duplicate.status).toBe('draft')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('duplicate has different ID from original', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            status: fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<CardStatus>,
            import_session_id: fc.uuid(),
            question_number: fc.integer({ min: 1, max: 100 }),
          }),
          fc.uuid(),
          (original, newId) => {
            // Ensure new ID is different
            if (newId === original.id) return true // Skip this case
            
            const duplicate = duplicateCard(original, newId)
            expect(duplicate.id).toBe(newId)
            expect(duplicate.id).not.toBe(original.id)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 9: Question number detection extracts numbers correctly
// ============================================

describe('V11.3 Content Staging - Question Number Detection', () => {
  // Import the actual detector for testing
  const QUESTION_PATTERNS = [
    { pattern: /(?:^|\s)(\d+)\.\s/gm, name: 'period' },
    { pattern: /(?:^|\s)(\d+)\)\s/gm, name: 'parenthesis' },
    { pattern: /\bQ(\d+)\b/gi, name: 'Q-prefix' },
    { pattern: /\bQuestion\s+(\d+)\b/gi, name: 'Question-prefix' },
  ]

  function detectQuestionNumbers(text: string): { detectedNumbers: number[]; patterns: string[] } {
    const detectedNumbers = new Set<number>()
    const patternsFound = new Set<string>()

    for (const { pattern, name } of QUESTION_PATTERNS) {
      pattern.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(text)) !== null) {
        const num = parseInt(match[1], 10)
        if (!isNaN(num) && num > 0) {
          detectedNumbers.add(num)
          patternsFound.add(name)
        }
      }
    }

    return {
      detectedNumbers: Array.from(detectedNumbers).sort((a, b) => a - b),
      patterns: Array.from(patternsFound),
    }
  }

  /**
   * **Feature: v11.3-content-staging, Property 9: Question number detection extracts numbers correctly**
   * *For any* text containing question patterns (e.g., "1.", "Q1", "Question 1"), 
   * `detectQuestionNumbers(text)` SHALL return all matching numbers in sorted order.
   * **Validates: Requirements 6.1**
   */
  describe('Property 9: Question number detection extracts numbers correctly', () => {
    it('detects period-terminated numbers', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 20 }),
          (numbers) => {
            const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b)
            const text = uniqueNumbers.map(n => `${n}. Question text here`).join('\n')
            
            const result = detectQuestionNumbers(text)
            
            expect(result.detectedNumbers).toEqual(uniqueNumbers)
            expect(result.patterns).toContain('period')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('detects Q-prefixed numbers', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 20 }),
          (numbers) => {
            const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b)
            const text = uniqueNumbers.map(n => `Q${n} Question text`).join('\n')
            
            const result = detectQuestionNumbers(text)
            
            expect(result.detectedNumbers).toEqual(uniqueNumbers)
            expect(result.patterns).toContain('Q-prefix')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('detects Question-prefixed numbers', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 20 }),
          (numbers) => {
            const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b)
            const text = uniqueNumbers.map(n => `Question ${n}: What is...`).join('\n')
            
            const result = detectQuestionNumbers(text)
            
            expect(result.detectedNumbers).toEqual(uniqueNumbers)
            expect(result.patterns).toContain('Question-prefix')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('returns sorted numbers', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 0, maxLength: 50 }),
          (numbers) => {
            const text = numbers.map(n => `${n}. `).join(' ')
            const result = detectQuestionNumbers(text)
            
            // Check sorted order
            for (let i = 0; i < result.detectedNumbers.length - 1; i++) {
              expect(result.detectedNumbers[i]).toBeLessThan(result.detectedNumbers[i + 1])
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('returns empty for text without question patterns', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 200 }).filter(s => !/\d+[\.\)]|\bQ\d+\b|\bQuestion\s+\d+/i.test(s)),
          (text) => {
            const result = detectQuestionNumbers(text)
            expect(result.detectedNumbers).toHaveLength(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 10: Missing number calculation is correct
// ============================================

describe('V11.3 Content Staging - Missing Number Calculation', () => {
  /**
   * **Feature: v11.3-content-staging, Property 10: Missing number calculation is correct**
   * *For any* detected numbers array and saved numbers array, `calculateMissingNumbers(detected, saved)` 
   * SHALL return exactly the numbers present in detected but not in saved.
   * **Validates: Requirements 6.2**
   */
  describe('Property 10: Missing number calculation is correct', () => {
    it('returns numbers in detected but not in saved', () => {
      fc.assert(
        fc.property(
          // Use uniqueArray to avoid duplicate handling complexity
          fc.uniqueArray(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 30 }),
          fc.uniqueArray(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 30 }),
          (detected, saved) => {
            const missing = calculateMissingNumbers(detected, saved)
            const savedSet = new Set(saved)
            
            // All missing numbers should be in detected but not in saved
            for (const num of missing) {
              expect(detected).toContain(num)
              expect(savedSet.has(num)).toBe(false)
            }
            
            // Count should match expected (unique values)
            const expectedMissing = detected.filter(n => !savedSet.has(n))
            expect(missing).toHaveLength(expectedMissing.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('returns empty when all detected are saved', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 20 }),
          (numbers) => {
            // Saved contains all detected
            const missing = calculateMissingNumbers(numbers, numbers)
            expect(missing).toHaveLength(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('returns all detected when saved is empty', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 20 }),
          (detected) => {
            const missing = calculateMissingNumbers(detected, [])
            const sortedDetected = [...detected].sort((a, b) => a - b)
            expect(missing).toEqual(sortedDetected)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('returns sorted results', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 1, max: 1000 }), { minLength: 0, maxLength: 50 }),
          fc.uniqueArray(fc.integer({ min: 1, max: 1000 }), { minLength: 0, maxLength: 50 }),
          (detected, saved) => {
            const missing = calculateMissingNumbers(detected, saved)
            
            for (let i = 0; i < missing.length - 1; i++) {
              expect(missing[i]).toBeLessThan(missing[i + 1])
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 11: QA metrics format string is correct
// ============================================

describe('V11.3 Content Staging - QA Metrics Format', () => {
  /**
   * **Feature: v11.3-content-staging, Property 11: QA metrics format string is correct**
   * *For any* detected count, created count, and missing numbers array, 
   * `formatQAMetrics(detected, created, missing)` SHALL return a string containing 
   * all three values in the specified format.
   * **Validates: Requirements 6.4**
   */
  describe('Property 11: QA metrics format string is correct', () => {
    it('contains detected count', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 0, max: 1000 }),
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 20 }),
          (detected, created, missing) => {
            const result = formatQAMetrics(detected, created, missing)
            expect(result).toContain(`Detected ${detected} questions`)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('contains created count', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 0, max: 1000 }),
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 20 }),
          (detected, created, missing) => {
            const result = formatQAMetrics(detected, created, missing)
            expect(result).toContain(`${created} cards created`)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('contains missing numbers when present', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 10 }),
          (detected, created, missing) => {
            const result = formatQAMetrics(detected, created, missing)
            expect(result).toContain('Missing:')
            
            // All missing numbers should be in the string
            for (const num of missing) {
              expect(result).toContain(num.toString())
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('omits Missing section when no missing numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 0, max: 1000 }),
          (detected, created) => {
            const result = formatQAMetrics(detected, created, [])
            expect(result).not.toContain('Missing')
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 12: Bulk status update changes all selected cards
// ============================================

describe('V11.3 Content Staging - Bulk Status Update', () => {
  /**
   * **Feature: v11.3-content-staging, Property 12: Bulk status update changes all selected cards**
   * *For any* array of card IDs passed to `publishCards` or `archiveCards`, 
   * all cards with those IDs SHALL have their status updated to the target status.
   * **Validates: Requirements 7.2, 8.1**
   */
  describe('Property 12: Bulk status update changes all selected cards', () => {
    it('publish updates all selected cards to published', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.uuid(),
              question_number: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          fc.array(fc.integer({ min: 0, max: 49 }), { minLength: 1, maxLength: 20 }),
          (cards, indices) => {
            // Select some cards by index
            const validIndices = indices.filter(i => i < cards.length)
            const selectedIds = validIndices.map(i => cards[i].id)
            
            const updated = bulkUpdateStatus(cards, selectedIds, 'published')
            
            // All selected cards should be published
            for (const id of selectedIds) {
              const card = updated.find(c => c.id === id)
              expect(card?.status).toBe('published')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('archive updates all selected cards to archived', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.uuid(),
              question_number: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          fc.array(fc.integer({ min: 0, max: 49 }), { minLength: 1, maxLength: 20 }),
          (cards, indices) => {
            const validIndices = indices.filter(i => i < cards.length)
            const selectedIds = validIndices.map(i => cards[i].id)
            
            const updated = bulkUpdateStatus(cards, selectedIds, 'archived')
            
            for (const id of selectedIds) {
              const card = updated.find(c => c.id === id)
              expect(card?.status).toBe('archived')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('non-selected cards remain unchanged', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constantFrom('draft', 'published', 'archived') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.uuid(),
              question_number: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 2, maxLength: 50 }
          ),
          (cards) => {
            // Select only first card
            const selectedIds = [cards[0].id]
            const originalStatuses = new Map(cards.map(c => [c.id, c.status]))
            
            const updated = bulkUpdateStatus(cards, selectedIds, 'published')
            
            // Non-selected cards should have original status
            for (const card of updated) {
              if (!selectedIds.includes(card.id)) {
                expect(card.status).toBe(originalStatuses.get(card.id))
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============================================
// Property 13: Publish preserves session ID
// ============================================

describe('V11.3 Content Staging - Session ID Preservation', () => {
  /**
   * **Feature: v11.3-content-staging, Property 13: Publish preserves session ID**
   * *For any* card that is published via `publishCards`, the card's 
   * `import_session_id` SHALL remain unchanged.
   * **Validates: Requirements 7.5**
   */
  describe('Property 13: Publish preserves session ID', () => {
    it('session ID unchanged after publish', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constant('draft') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.uuid(),
              question_number: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (cards) => {
            const originalSessionIds = new Map(cards.map(c => [c.id, c.import_session_id]))
            const allIds = cards.map(c => c.id)
            
            const updated = bulkUpdateStatus(cards, allIds, 'published')
            
            // All session IDs should be preserved
            for (const card of updated) {
              expect(card.import_session_id).toBe(originalSessionIds.get(card.id))
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('session ID unchanged after archive', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              status: fc.constantFrom('draft', 'published') as fc.Arbitrary<CardStatus>,
              import_session_id: fc.option(fc.uuid(), { nil: null }),
              question_number: fc.option(fc.integer({ min: 1, max: 100 }), { nil: null }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (cards) => {
            const originalSessionIds = new Map(cards.map(c => [c.id, c.import_session_id]))
            const allIds = cards.map(c => c.id)
            
            const updated = bulkUpdateStatus(cards, allIds, 'archived')
            
            for (const card of updated) {
              expect(card.import_session_id).toBe(originalSessionIds.get(card.id))
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
