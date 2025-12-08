import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ============================================
// Analytics Pure Functions for Testing
// ============================================

/**
 * Calculates accuracy percentage from correct count and total attempts.
 * Returns null if total attempts is 0 to avoid division by zero.
 * 
 * **Feature: v10.2-weakness-hunter, Property 1: Accuracy calculation produces valid percentages**
 * **Validates: Requirements 1.2, 3.2**
 */
export function calculateAccuracy(correctCount: number, totalAttempts: number): number | null {
  if (totalAttempts === 0) return null
  return (correctCount / totalAttempts) * 100
}

/**
 * Determines if a topic has low confidence based on attempt count.
 * Low confidence is defined as fewer than 5 attempts.
 * 
 * **Feature: v10.2-weakness-hunter, Property 5: Low confidence threshold**
 * **Validates: Requirements 3.3**
 */
export function isLowConfidence(totalAttempts: number): boolean {
  return totalAttempts < 5
}

/**
 * Formats a date to a 3-letter day name.
 * 
 * **Feature: v10.2-weakness-hunter, Property 7: Day name formatting**
 * **Validates: Requirements 4.2**
 */
export function formatDayName(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[date.getDay()]
}

/**
 * Topic accuracy data structure
 */
export interface TopicAccuracy {
  tagId: string
  tagName: string
  accuracy: number | null
  correctCount: number
  totalAttempts: number
  isLowConfidence: boolean
}

/**
 * Finds the weakest topic from a list of topic accuracies.
 * When multiple topics have the same lowest accuracy, selects the one with most attempts.
 * Returns null if no topics have valid accuracy data.
 * 
 * **Feature: v10.2-weakness-hunter, Property 8: Weakest topic identification with tiebreaker**
 * **Validates: Requirements 5.1, 5.4**
 */
export function findWeakestTopic(topics: TopicAccuracy[]): TopicAccuracy | null {
  const topicsWithAccuracy = topics.filter(t => t.accuracy !== null)
  if (topicsWithAccuracy.length === 0) return null
  
  return topicsWithAccuracy.reduce((weakest, current) => {
    if (current.accuracy! < weakest.accuracy!) {
      return current
    }
    if (current.accuracy === weakest.accuracy && current.totalAttempts > weakest.totalAttempts) {
      return current
    }
    return weakest
  })
}

/**
 * Generates the improve button URL for a topic.
 * 
 * **Feature: v10.2-weakness-hunter, Property 9: Improve button URL construction**
 * **Validates: Requirements 5.3**
 */
export function generateImproveUrl(tagId: string): string {
  return `/study/custom?tagIds=${tagId}&mode=due`
}

/**
 * Generates activity data for the last N days, filling missing days with zeros.
 * 
 * **Feature: v10.2-weakness-hunter, Property 6: Activity data covers exactly 7 days**
 * **Validates: Requirements 4.1**
 */
export function generateActivityData(
  studyLogs: { study_date: string; cards_reviewed: number }[],
  days: number = 7
): { date: string; dayName: string; cardsReviewed: number }[] {
  const result: { date: string; dayName: string; cardsReviewed: number }[] = []
  const logMap = new Map(studyLogs.map(log => [log.study_date, log.cards_reviewed]))
  
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    result.push({
      date: dateStr,
      dayName: formatDayName(date),
      cardsReviewed: logMap.get(dateStr) ?? 0,
    })
  }
  
  return result
}

/**
 * Transforms topic accuracies to radar chart data format.
 * Normalizes accuracy to 0-100 scale.
 * 
 * **Feature: v10.2-weakness-hunter, Property 4: Radar chart data contains all topics**
 * **Validates: Requirements 3.1**
 */
export function transformToRadarData(topics: TopicAccuracy[]): { topic: string; accuracy: number; fullMark: number }[] {
  return topics.map(t => ({
    topic: t.tagName,
    accuracy: t.accuracy ?? 0,
    fullMark: 100,
  }))
}

/**
 * Checks if learned count is valid (never exceeds total).
 * 
 * **Feature: v10.2-weakness-hunter, Property 2: Learned count never exceeds total count**
 * **Validates: Requirements 1.5**
 */
export function isValidDeckProgress(cardsLearned: number, totalCards: number): boolean {
  return cardsLearned <= totalCards
}

/**
 * Checks if a pathname should activate the stats nav item.
 * 
 * **Feature: v10.2-weakness-hunter, Property 3: Navigation active state detection**
 * **Validates: Requirements 2.4**
 */
export function isStatsNavActive(pathname: string): boolean {
  return pathname.startsWith('/stats')
}

// ============================================
// Property-Based Tests
// ============================================

describe('Analytics Property Tests', () => {
  // **Feature: v10.2-weakness-hunter, Property 1: Accuracy calculation produces valid percentages**
  // **Validates: Requirements 1.2, 3.2**
  describe('Property 1: Accuracy calculation produces valid percentages', () => {
    it('should produce accuracy in range [0, 100] for valid inputs', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 10000 }),  // correctCount
          fc.integer({ min: 1, max: 10000 }),  // totalAttempts (at least 1)
          (correctCount, totalAttempts) => {
            // Ensure correctCount <= totalAttempts
            const validCorrectCount = Math.min(correctCount, totalAttempts)
            const accuracy = calculateAccuracy(validCorrectCount, totalAttempts)
            
            expect(accuracy).not.toBeNull()
            expect(accuracy).toBeGreaterThanOrEqual(0)
            expect(accuracy).toBeLessThanOrEqual(100)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return null for zero attempts', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }),  // any correctCount
          (correctCount) => {
            const accuracy = calculateAccuracy(correctCount, 0)
            expect(accuracy).toBeNull()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should calculate correct percentage', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          (correctCount, totalAttempts) => {
            const validCorrectCount = Math.min(correctCount, totalAttempts)
            const accuracy = calculateAccuracy(validCorrectCount, totalAttempts)
            const expected = (validCorrectCount / totalAttempts) * 100
            
            expect(accuracy).toBeCloseTo(expected, 10)
          }
        ),
        { numRuns: 100 }
      )
    })
  })


  // **Feature: v10.2-weakness-hunter, Property 2: Learned count never exceeds total count**
  // **Validates: Requirements 1.5**
  describe('Property 2: Learned count never exceeds total count', () => {
    it('should validate that learned <= total for any deck progress', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }),  // totalCards
          fc.nat({ max: 1000 }),  // cardsLearned
          (totalCards, cardsLearned) => {
            // Valid progress: learned should not exceed total
            const validLearned = Math.min(cardsLearned, totalCards)
            expect(isValidDeckProgress(validLearned, totalCards)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return false when learned exceeds total', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }),  // totalCards
          fc.integer({ min: 1, max: 1000 }),  // excess
          (totalCards, excess) => {
            const invalidLearned = totalCards + excess
            expect(isValidDeckProgress(invalidLearned, totalCards)).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // **Feature: v10.2-weakness-hunter, Property 3: Navigation active state detection**
  // **Validates: Requirements 2.4**
  describe('Property 3: Navigation active state detection', () => {
    it('should return true for any pathname starting with /stats', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (suffix) => {
            const pathname = `/stats${suffix}`
            expect(isStatsNavActive(pathname)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return false for pathnames not starting with /stats', () => {
      const nonStatsPaths = ['/dashboard', '/library', '/profile', '/study', '/decks', '/']
      fc.assert(
        fc.property(
          fc.constantFrom(...nonStatsPaths),
          fc.string({ minLength: 0, maxLength: 20 }),
          (basePath, suffix) => {
            const pathname = `${basePath}${suffix}`
            if (!pathname.startsWith('/stats')) {
              expect(isStatsNavActive(pathname)).toBe(false)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // **Feature: v10.2-weakness-hunter, Property 4: Radar chart data contains all topics**
  // **Validates: Requirements 3.1**
  describe('Property 4: Radar chart data contains all topics', () => {
    it('should produce one data point per topic with accuracy in 0-100', () => {
      const topicArb = fc.record({
        tagId: fc.uuid(),
        tagName: fc.string({ minLength: 1, maxLength: 30 }),
        accuracy: fc.option(fc.float({ min: 0, max: 100, noNaN: true }), { nil: null }),
        correctCount: fc.nat({ max: 1000 }),
        totalAttempts: fc.nat({ max: 1000 }),
        isLowConfidence: fc.boolean(),
      })

      fc.assert(
        fc.property(
          fc.array(topicArb, { minLength: 1, maxLength: 10 }),
          (topics) => {
            const radarData = transformToRadarData(topics)
            
            // Same number of data points as topics
            expect(radarData.length).toBe(topics.length)
            
            // Each data point has accuracy in valid range
            radarData.forEach(point => {
              expect(point.accuracy).toBeGreaterThanOrEqual(0)
              expect(point.accuracy).toBeLessThanOrEqual(100)
              expect(point.fullMark).toBe(100)
            })
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // **Feature: v10.2-weakness-hunter, Property 5: Low confidence threshold**
  // **Validates: Requirements 3.3**
  describe('Property 5: Low confidence threshold', () => {
    it('should return true for attempts < 5', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 4 }),
          (attempts) => {
            expect(isLowConfidence(attempts)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return false for attempts >= 5', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 10000 }),
          (attempts) => {
            expect(isLowConfidence(attempts)).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // **Feature: v10.2-weakness-hunter, Property 6: Activity data covers exactly 7 days**
  // **Validates: Requirements 4.1**
  describe('Property 6: Activity data covers exactly 7 days', () => {
    it('should always return exactly 7 items for 7-day request', () => {
      // Generate date strings directly to avoid invalid date issues
      const dateStrArb = fc.integer({ min: 2024, max: 2025 }).chain(year =>
        fc.integer({ min: 1, max: 12 }).chain(month =>
          fc.integer({ min: 1, max: 28 }).map(day => 
            `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          )
        )
      )

      const logArb = fc.array(
        fc.record({
          study_date: dateStrArb,
          cards_reviewed: fc.nat({ max: 100 }),
        }),
        { minLength: 0, maxLength: 20 }
      )

      fc.assert(
        fc.property(logArb, (logs) => {
          const activity = generateActivityData(logs, 7)
          expect(activity.length).toBe(7)
        }),
        { numRuns: 100 }
      )
    })

    it('should fill missing days with zero', () => {
      // Empty logs should still produce 7 days with 0 cards
      const activity = generateActivityData([], 7)
      expect(activity.length).toBe(7)
      activity.forEach(day => {
        expect(day.cardsReviewed).toBe(0)
      })
    })
  })

  // **Feature: v10.2-weakness-hunter, Property 7: Day name formatting**
  // **Validates: Requirements 4.2**
  describe('Property 7: Day name formatting', () => {
    const validDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    it('should return a valid 3-letter day name for any date', () => {
      // Use integer timestamps to avoid NaN date issues
      const minTimestamp = new Date('2000-01-01').getTime()
      const maxTimestamp = new Date('2100-12-31').getTime()
      
      fc.assert(
        fc.property(
          fc.integer({ min: minTimestamp, max: maxTimestamp }),
          (timestamp) => {
            const date = new Date(timestamp)
            const dayName = formatDayName(date)
            expect(validDayNames).toContain(dayName)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return correct day name for known dates', () => {
      // Known dates for verification
      expect(formatDayName(new Date('2024-01-01'))).toBe('Mon') // Jan 1, 2024 was Monday
      expect(formatDayName(new Date('2024-01-07'))).toBe('Sun') // Jan 7, 2024 was Sunday
    })
  })

  // **Feature: v10.2-weakness-hunter, Property 8: Weakest topic identification with tiebreaker**
  // **Validates: Requirements 5.1, 5.4**
  describe('Property 8: Weakest topic identification with tiebreaker', () => {
    it('should find the topic with minimum accuracy', () => {
      const topicArb = fc.record({
        tagId: fc.uuid(),
        tagName: fc.string({ minLength: 1, maxLength: 30 }),
        accuracy: fc.float({ min: 0, max: 100, noNaN: true }),
        correctCount: fc.nat({ max: 1000 }),
        totalAttempts: fc.integer({ min: 1, max: 1000 }),
        isLowConfidence: fc.boolean(),
      })

      fc.assert(
        fc.property(
          fc.array(topicArb, { minLength: 1, maxLength: 10 }),
          (topics) => {
            const weakest = findWeakestTopic(topics)
            
            if (weakest) {
              // Weakest should have minimum accuracy
              const minAccuracy = Math.min(...topics.map(t => t.accuracy ?? Infinity))
              expect(weakest.accuracy).toBe(minAccuracy)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should use tiebreaker (most attempts) when accuracies are equal', () => {
      const topics: TopicAccuracy[] = [
        { tagId: '1', tagName: 'Topic A', accuracy: 50, correctCount: 5, totalAttempts: 10, isLowConfidence: false },
        { tagId: '2', tagName: 'Topic B', accuracy: 50, correctCount: 25, totalAttempts: 50, isLowConfidence: false },
        { tagId: '3', tagName: 'Topic C', accuracy: 50, correctCount: 10, totalAttempts: 20, isLowConfidence: false },
      ]
      
      const weakest = findWeakestTopic(topics)
      expect(weakest?.tagId).toBe('2') // Most attempts (50)
    })

    it('should return null for empty or all-null accuracy topics', () => {
      expect(findWeakestTopic([])).toBeNull()
      
      const nullTopics: TopicAccuracy[] = [
        { tagId: '1', tagName: 'Topic A', accuracy: null, correctCount: 0, totalAttempts: 0, isLowConfidence: true },
      ]
      expect(findWeakestTopic(nullTopics)).toBeNull()
    })
  })

  // **Feature: v10.2-weakness-hunter, Property 9: Improve button URL construction**
  // **Validates: Requirements 5.3**
  describe('Property 9: Improve button URL construction', () => {
    it('should generate correct URL format for any tag ID', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          (tagId) => {
            const url = generateImproveUrl(tagId)
            expect(url).toBe(`/study/custom?tagIds=${tagId}&mode=due`)
            expect(url).toContain(tagId)
            expect(url).toContain('mode=due')
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})


// ============================================
// V11.5: Weakest Concepts Property Tests
// ============================================

import { findWeakestConcepts, type WeakestConceptResult } from '@/lib/analytics-utils'

describe('V11.5 Weakest Concepts Property Tests', () => {
  // Helper to create test data
  function createTestData(
    progressItems: Array<{ cardId: string; correct: number; total: number }>,
    cardTagLinks: Array<{ cardId: string; tagId: string }>,
    tagDefs: Array<{ id: string; name: string; category: string }>
  ) {
    return {
      progressData: progressItems.map((p) => ({
        cardTemplateId: p.cardId,
        correctCount: p.correct,
        totalAttempts: p.total,
      })),
      cardTags: cardTagLinks.map((ct) => ({
        cardTemplateId: ct.cardId,
        tagId: ct.tagId,
      })),
      tags: tagDefs,
    }
  }

  /**
   * **Property 12: Weakest Concepts - Accuracy Ordering**
   * For any set of tags with accuracy data, findWeakestConcepts SHALL return tags ordered by accuracy ascending.
   * **Validates: Requirements 9.2**
   */
  describe('Property 12: Weakest Concepts - Accuracy Ordering', () => {
    it('should order concepts by accuracy ascending (weakest first)', () => {
      const { progressData, cardTags, tags } = createTestData(
        [
          { cardId: 'c1', correct: 8, total: 10 }, // 80%
          { cardId: 'c2', correct: 3, total: 10 }, // 30%
          { cardId: 'c3', correct: 5, total: 10 }, // 50%
        ],
        [
          { cardId: 'c1', tagId: 't1' },
          { cardId: 'c2', tagId: 't2' },
          { cardId: 'c3', tagId: 't3' },
        ],
        [
          { id: 't1', name: 'Concept1', category: 'concept' },
          { id: 't2', name: 'Concept2', category: 'concept' },
          { id: 't3', name: 'Concept3', category: 'concept' },
        ]
      )

      const result = findWeakestConcepts(progressData, cardTags, tags, 10)

      // Should be ordered: 30%, 50%, 80%
      expect(result.length).toBe(3)
      expect(result[0].tagName).toBe('Concept2') // 30%
      expect(result[1].tagName).toBe('Concept3') // 50%
      expect(result[2].tagName).toBe('Concept1') // 80%
    })

    it('should maintain accuracy ordering with property-based test', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 20 }),
              accuracy: fc.integer({ min: 0, max: 100 }),
              attempts: fc.integer({ min: 5, max: 100 }), // >= 5 to avoid low confidence
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (conceptData) => {
            // Create test data from generated concepts
            const progressData = conceptData.map((c, i) => ({
              cardTemplateId: `card-${i}`,
              correctCount: Math.round((c.accuracy / 100) * c.attempts),
              totalAttempts: c.attempts,
            }))
            const cardTags = conceptData.map((c, i) => ({
              cardTemplateId: `card-${i}`,
              tagId: c.id,
            }))
            const tags = conceptData.map((c) => ({
              id: c.id,
              name: c.name,
              category: 'concept',
            }))

            const result = findWeakestConcepts(progressData, cardTags, tags, 100)

            // Verify ordering: each item should have accuracy <= next item
            for (let i = 1; i < result.length; i++) {
              expect(result[i].accuracy).toBeGreaterThanOrEqual(result[i - 1].accuracy)
            }
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * **Property 13: Weakest Concepts - Low Confidence Deprioritization**
   * For any two tags with equal accuracy where one has <5 attempts and one has >=5 attempts,
   * the >=5 attempts tag SHALL rank as "weaker" (more reliable data).
   * **Validates: Requirements 9.3**
   */
  describe('Property 13: Weakest Concepts - Low Confidence Deprioritization', () => {
    it('should deprioritize low confidence tags (< 5 attempts)', () => {
      const { progressData, cardTags, tags } = createTestData(
        [
          { cardId: 'c1', correct: 2, total: 4 }, // 50%, low confidence
          { cardId: 'c2', correct: 5, total: 10 }, // 50%, high confidence
        ],
        [
          { cardId: 'c1', tagId: 't1' },
          { cardId: 'c2', tagId: 't2' },
        ],
        [
          { id: 't1', name: 'LowConfidence', category: 'concept' },
          { id: 't2', name: 'HighConfidence', category: 'concept' },
        ]
      )

      const result = findWeakestConcepts(progressData, cardTags, tags, 10)

      // High confidence should come first despite same accuracy
      expect(result.length).toBe(2)
      expect(result[0].tagName).toBe('HighConfidence')
      expect(result[0].isLowConfidence).toBe(false)
      expect(result[1].tagName).toBe('LowConfidence')
      expect(result[1].isLowConfidence).toBe(true)
    })

    it('should mark tags with < 5 attempts as low confidence', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 4 }), // Low confidence range
          (attempts) => {
            const { progressData, cardTags, tags } = createTestData(
              [{ cardId: 'c1', correct: 1, total: attempts }],
              [{ cardId: 'c1', tagId: 't1' }],
              [{ id: 't1', name: 'Test', category: 'concept' }]
            )

            const result = findWeakestConcepts(progressData, cardTags, tags, 10)

            if (result.length > 0) {
              expect(result[0].isLowConfidence).toBe(true)
            }
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * **Property 14: Weakest Concepts - Tie Breaker**
   * For any two tags with equal accuracy and both >=5 attempts, 
   * the tag with more attempts SHALL rank first.
   * **Validates: Requirements 9.4**
   */
  describe('Property 14: Weakest Concepts - Tie Breaker', () => {
    it('should use total attempts as tie-breaker (more attempts = more reliable)', () => {
      const { progressData, cardTags, tags } = createTestData(
        [
          { cardId: 'c1', correct: 5, total: 10 }, // 50%, 10 attempts
          { cardId: 'c2', correct: 10, total: 20 }, // 50%, 20 attempts
          { cardId: 'c3', correct: 3, total: 6 }, // 50%, 6 attempts
        ],
        [
          { cardId: 'c1', tagId: 't1' },
          { cardId: 'c2', tagId: 't2' },
          { cardId: 'c3', tagId: 't3' },
        ],
        [
          { id: 't1', name: 'Medium', category: 'concept' },
          { id: 't2', name: 'Most', category: 'concept' },
          { id: 't3', name: 'Least', category: 'concept' },
        ]
      )

      const result = findWeakestConcepts(progressData, cardTags, tags, 10)

      // All have 50% accuracy, should be ordered by attempts descending
      expect(result.length).toBe(3)
      expect(result[0].tagName).toBe('Most') // 20 attempts
      expect(result[1].tagName).toBe('Medium') // 10 attempts
      expect(result[2].tagName).toBe('Least') // 6 attempts
    })
  })

  /**
   * Additional tests
   */
  describe('Additional behavior', () => {
    it('should only include concept category tags', () => {
      const { progressData, cardTags, tags } = createTestData(
        [
          { cardId: 'c1', correct: 5, total: 10 },
          { cardId: 'c2', correct: 5, total: 10 },
          { cardId: 'c3', correct: 5, total: 10 },
        ],
        [
          { cardId: 'c1', tagId: 't1' },
          { cardId: 'c2', tagId: 't2' },
          { cardId: 'c3', tagId: 't3' },
        ],
        [
          { id: 't1', name: 'Source1', category: 'source' },
          { id: 't2', name: 'Topic1', category: 'topic' },
          { id: 't3', name: 'Concept1', category: 'concept' },
        ]
      )

      const result = findWeakestConcepts(progressData, cardTags, tags, 10)

      // Should only include concept tags
      expect(result.length).toBe(1)
      expect(result[0].tagName).toBe('Concept1')
    })

    it('should respect limit parameter', () => {
      const { progressData, cardTags, tags } = createTestData(
        [
          { cardId: 'c1', correct: 1, total: 10 },
          { cardId: 'c2', correct: 2, total: 10 },
          { cardId: 'c3', correct: 3, total: 10 },
          { cardId: 'c4', correct: 4, total: 10 },
          { cardId: 'c5', correct: 5, total: 10 },
        ],
        [
          { cardId: 'c1', tagId: 't1' },
          { cardId: 'c2', tagId: 't2' },
          { cardId: 'c3', tagId: 't3' },
          { cardId: 'c4', tagId: 't4' },
          { cardId: 'c5', tagId: 't5' },
        ],
        [
          { id: 't1', name: 'C1', category: 'concept' },
          { id: 't2', name: 'C2', category: 'concept' },
          { id: 't3', name: 'C3', category: 'concept' },
          { id: 't4', name: 'C4', category: 'concept' },
          { id: 't5', name: 'C5', category: 'concept' },
        ]
      )

      const result = findWeakestConcepts(progressData, cardTags, tags, 3)

      expect(result.length).toBe(3)
    })

    it('should return empty array for no data', () => {
      const result = findWeakestConcepts([], [], [], 10)
      expect(result).toEqual([])
    })

    it('should aggregate stats across multiple cards with same tag', () => {
      const { progressData, cardTags, tags } = createTestData(
        [
          { cardId: 'c1', correct: 3, total: 5 }, // 60%
          { cardId: 'c2', correct: 2, total: 5 }, // 40%
        ],
        [
          { cardId: 'c1', tagId: 't1' },
          { cardId: 'c2', tagId: 't1' }, // Same tag
        ],
        [{ id: 't1', name: 'SharedConcept', category: 'concept' }]
      )

      const result = findWeakestConcepts(progressData, cardTags, tags, 10)

      // Should aggregate: (3+2)/(5+5) = 50%
      expect(result.length).toBe(1)
      expect(result[0].accuracy).toBe(50)
      expect(result[0].totalAttempts).toBe(10)
    })
  })
})
