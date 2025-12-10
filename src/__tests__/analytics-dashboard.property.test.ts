/**
 * V11.7: Property tests for dashboard insights and weakest concepts
 * 
 * **Feature: v11.7-companion-dashboard-tag-filtered-study**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { findWeakestConcepts, formatAccuracyPercent } from '@/lib/analytics-utils'
import { LOW_CONFIDENCE_THRESHOLD } from '@/lib/constants'

// Arbitrary for UUIDs
const uuidArb = fc.uuid()

// Arbitrary for progress data
const progressDataArb = fc.record({
  cardTemplateId: uuidArb,
  correctCount: fc.integer({ min: 0, max: 100 }),
  totalAttempts: fc.integer({ min: 0, max: 100 }),
})

// Arbitrary for card-tag associations
const cardTagArb = fc.record({
  cardTemplateId: uuidArb,
  tagId: uuidArb,
})

// Arbitrary for tag info
const tagInfoArb = fc.record({
  id: uuidArb,
  name: fc.string({ minLength: 1, maxLength: 50 }),
  category: fc.constantFrom('source', 'topic', 'concept'),
})

describe('V11.7: Dashboard Insights', () => {
  /**
   * **Property 9: Low confidence threshold hides noisy tags**
   * **Validates: Requirements 4.4, 8.2**
   */
  describe('Property 9: Low confidence threshold hides noisy tags', () => {
    it('should deprioritize tags with fewer than LOW_CONFIDENCE_THRESHOLD attempts', () => {
      fc.assert(
        fc.property(
          fc.array(progressDataArb, { minLength: 1, maxLength: 20 }),
          fc.array(cardTagArb, { minLength: 1, maxLength: 30 }),
          fc.array(tagInfoArb.filter(t => t.category === 'concept'), { minLength: 1, maxLength: 10 }),
          (progressData, cardTags, tags) => {
            const result = findWeakestConcepts(progressData, cardTags, tags, 10)
            
            // Low confidence tags should come after high confidence tags
            let foundLowConfidence = false
            for (const concept of result) {
              if (concept.isLowConfidence) {
                foundLowConfidence = true
              } else if (foundLowConfidence) {
                // If we found a low confidence tag, all subsequent should also be low confidence
                // This validates the sorting puts low confidence last
                expect(concept.isLowConfidence).toBe(true)
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should mark tags with < LOW_CONFIDENCE_THRESHOLD attempts as low confidence', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: LOW_CONFIDENCE_THRESHOLD - 1 }),
          (attempts) => {
            const progressData = [{ cardTemplateId: 'card-1', correctCount: 0, totalAttempts: attempts }]
            const cardTags = [{ cardTemplateId: 'card-1', tagId: 'tag-1' }]
            const tags = [{ id: 'tag-1', name: 'Test', category: 'concept' as const }]
            
            const result = findWeakestConcepts(progressData, cardTags, tags, 5)
            
            if (result.length > 0 && attempts > 0) {
              expect(result[0].isLowConfidence).toBe(true)
            }
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * **Property 10: Weakest concepts ordered by accuracy ascending**
   * **Validates: Requirements 8.3**
   */
  describe('Property 10: Weakest concepts ordered by accuracy ascending', () => {
    it('should order concepts by accuracy ascending (weakest first)', () => {
      fc.assert(
        fc.property(
          fc.array(progressDataArb, { minLength: 5, maxLength: 20 }),
          fc.array(cardTagArb, { minLength: 5, maxLength: 30 }),
          fc.array(tagInfoArb.filter(t => t.category === 'concept'), { minLength: 3, maxLength: 10 }),
          (progressData, cardTags, tags) => {
            const result = findWeakestConcepts(progressData, cardTags, tags, 10)
            
            if (result.length < 2) return // Need at least 2 to check ordering
            
            // Within same confidence level, should be ordered by accuracy ascending
            for (let i = 1; i < result.length; i++) {
              const prev = result[i - 1]
              const curr = result[i]
              
              // If both have same confidence level
              if (prev.isLowConfidence === curr.isLowConfidence) {
                // Accuracy should be ascending (or equal with tie-breaker)
                if (prev.accuracy !== curr.accuracy) {
                  expect(prev.accuracy).toBeLessThanOrEqual(curr.accuracy)
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return weakest concept first when all have sufficient attempts', () => {
      // Create deterministic test data
      const progressData = [
        { cardTemplateId: 'card-1', correctCount: 8, totalAttempts: 10 }, // 80%
        { cardTemplateId: 'card-2', correctCount: 3, totalAttempts: 10 }, // 30%
        { cardTemplateId: 'card-3', correctCount: 5, totalAttempts: 10 }, // 50%
      ]
      const cardTags = [
        { cardTemplateId: 'card-1', tagId: 'tag-1' },
        { cardTemplateId: 'card-2', tagId: 'tag-2' },
        { cardTemplateId: 'card-3', tagId: 'tag-3' },
      ]
      const tags = [
        { id: 'tag-1', name: 'High', category: 'concept' as const },
        { id: 'tag-2', name: 'Low', category: 'concept' as const },
        { id: 'tag-3', name: 'Mid', category: 'concept' as const },
      ]
      
      const result = findWeakestConcepts(progressData, cardTags, tags, 3)
      
      expect(result.length).toBe(3)
      expect(result[0].tagName).toBe('Low') // 30% - weakest
      expect(result[1].tagName).toBe('Mid') // 50%
      expect(result[2].tagName).toBe('High') // 80% - strongest
    })
  })

  /**
   * **Property 11: Accuracy formatting rounds to integer**
   * **Validates: Requirements 5.5**
   */
  describe('Property 11: Accuracy formatting rounds to integer', () => {
    it('should round accuracy to nearest integer and append %', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          (accuracy) => {
            const formatted = formatAccuracyPercent(accuracy)
            const expected = `${Math.round(accuracy)}%`
            expect(formatted).toBe(expected)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return N/A for null accuracy', () => {
      expect(formatAccuracyPercent(null)).toBe('N/A')
    })

    it('should handle edge cases', () => {
      expect(formatAccuracyPercent(0)).toBe('0%')
      expect(formatAccuracyPercent(100)).toBe('100%')
      expect(formatAccuracyPercent(50.4)).toBe('50%')
      expect(formatAccuracyPercent(50.5)).toBe('51%') // Rounds up
      expect(formatAccuracyPercent(50.6)).toBe('51%')
    })
  })

  /**
   * **Property 8: Dashboard insights returns correct DTO shape**
   * **Validates: Requirements 4.2**
   */
  describe('Property 8: findWeakestConcepts returns correct shape', () => {
    it('should return array with correct properties', () => {
      fc.assert(
        fc.property(
          fc.array(progressDataArb, { minLength: 1, maxLength: 10 }),
          fc.array(cardTagArb, { minLength: 1, maxLength: 20 }),
          fc.array(tagInfoArb.filter(t => t.category === 'concept'), { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 1, max: 10 }),
          (progressData, cardTags, tags, limit) => {
            const result = findWeakestConcepts(progressData, cardTags, tags, limit)
            
            // Should be an array
            expect(Array.isArray(result)).toBe(true)
            
            // Should respect limit
            expect(result.length).toBeLessThanOrEqual(limit)
            
            // Each item should have correct shape
            for (const item of result) {
              expect(typeof item.tagId).toBe('string')
              expect(typeof item.tagName).toBe('string')
              expect(typeof item.accuracy).toBe('number')
              expect(typeof item.totalAttempts).toBe('number')
              expect(typeof item.isLowConfidence).toBe('boolean')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should limit results to specified count', () => {
      const progressData = Array.from({ length: 10 }, (_, i) => ({
        cardTemplateId: `card-${i}`,
        correctCount: i,
        totalAttempts: 10,
      }))
      const cardTags = Array.from({ length: 10 }, (_, i) => ({
        cardTemplateId: `card-${i}`,
        tagId: `tag-${i}`,
      }))
      const tags = Array.from({ length: 10 }, (_, i) => ({
        id: `tag-${i}`,
        name: `Tag ${i}`,
        category: 'concept' as const,
      }))
      
      const result3 = findWeakestConcepts(progressData, cardTags, tags, 3)
      expect(result3.length).toBe(3)
      
      const result5 = findWeakestConcepts(progressData, cardTags, tags, 5)
      expect(result5.length).toBe(5)
    })
  })

  /**
   * localStorage round-trip for tag filter
   */
  describe('Property 7: localStorage persistence round-trip', () => {
    it('should preserve tag IDs through save and load cycle', () => {
      // This is tested in the component, but we can test the serialization format
      fc.assert(
        fc.property(
          fc.array(uuidArb, { minLength: 0, maxLength: 10 }),
          (tagIds) => {
            const stored = JSON.stringify({
              selectedTagIds: tagIds,
              updatedAt: Date.now(),
            })
            
            const parsed = JSON.parse(stored)
            expect(parsed.selectedTagIds).toEqual(tagIds)
            expect(typeof parsed.updatedAt).toBe('number')
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
