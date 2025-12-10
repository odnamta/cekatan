/**
 * V11.7: Property tests for tag-filtered global study
 * 
 * **Feature: v11.7-companion-dashboard-tag-filtered-study**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { parseTagIdsFromUrl, buildStudyUrl, isValidUUID } from '@/lib/url-utils'
import { filterStudyTags } from '@/components/tags/StudyTagFilter'
import type { Tag } from '@/types/database'

// Arbitrary for valid UUIDs
const uuidArb = fc.uuid()

// Arbitrary for tag categories
const tagCategoryArb = fc.constantFrom('source', 'topic', 'concept')

// Arbitrary for hex color
const hexColorArb = fc.array(
  fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
  { minLength: 6, maxLength: 6 }
).map(arr => `#${arr.join('')}`)

// Arbitrary for valid ISO date strings (using integer timestamps to avoid invalid dates)
const validDateArb = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-12-31').getTime(),
}).map(ts => new Date(ts).toISOString())

// Arbitrary for Tag objects
const tagArb = fc.record({
  id: uuidArb,
  user_id: uuidArb,
  name: fc.string({ minLength: 1, maxLength: 50 }),
  color: hexColorArb,
  category: tagCategoryArb,
  created_at: validDateArb,
}) as fc.Arbitrary<Tag>

describe('V11.7: Tag-Filtered Global Study', () => {
  /**
   * **Property 4: URL construction includes tagIds correctly**
   * **Validates: Requirements 2.1**
   */
  describe('Property 4: URL construction includes tagIds correctly', () => {
    it('should include all valid UUIDs in the tags query parameter', () => {
      fc.assert(
        fc.property(
          fc.array(uuidArb, { minLength: 1, maxLength: 10 }),
          (tagIds) => {
            const url = buildStudyUrl(tagIds)
            
            // URL should contain tags parameter
            expect(url).toContain('?tags=')
            
            // All tag IDs should be in the URL
            for (const id of tagIds) {
              expect(url).toContain(id)
            }
            
            // Tags should be comma-separated
            const tagsParam = url.split('?tags=')[1]
            const parsedIds = tagsParam.split(',')
            expect(parsedIds.length).toBe(tagIds.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return base path when tagIds is empty', () => {
      fc.assert(
        fc.property(
          fc.constant([]),
          (tagIds) => {
            const url = buildStudyUrl(tagIds)
            expect(url).toBe('/study/global')
            expect(url).not.toContain('?')
          }
        )
      )
    })

    it('should return base path when tagIds is undefined', () => {
      const url = buildStudyUrl(undefined)
      expect(url).toBe('/study/global')
    })
  })

  /**
   * **Property 5: URL parsing extracts valid tag IDs**
   * **Validates: Requirements 2.2, 2.4**
   */
  describe('Property 5: URL parsing extracts valid tag IDs', () => {
    it('should extract all valid UUIDs from tags parameter', () => {
      fc.assert(
        fc.property(
          fc.array(uuidArb, { minLength: 1, maxLength: 10 }),
          (tagIds) => {
            const url = `?tags=${tagIds.join(',')}`
            const parsed = parseTagIdsFromUrl(url)
            
            expect(parsed.length).toBe(tagIds.length)
            for (const id of tagIds) {
              expect(parsed).toContain(id)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should filter out invalid UUIDs', () => {
      fc.assert(
        fc.property(
          fc.array(uuidArb, { minLength: 1, maxLength: 5 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          (validIds, invalidIds) => {
            // Mix valid and invalid IDs
            const mixedIds = [...validIds, ...invalidIds.filter(s => !isValidUUID(s))]
            const url = `?tags=${mixedIds.join(',')}`
            const parsed = parseTagIdsFromUrl(url)
            
            // Should only contain valid UUIDs
            for (const id of parsed) {
              expect(isValidUUID(id)).toBe(true)
            }
            
            // Should contain all valid IDs
            for (const id of validIds) {
              expect(parsed).toContain(id)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty array for missing tags parameter', () => {
      expect(parseTagIdsFromUrl('')).toEqual([])
      expect(parseTagIdsFromUrl(null)).toEqual([])
      expect(parseTagIdsFromUrl(undefined)).toEqual([])
      expect(parseTagIdsFromUrl('?other=value')).toEqual([])
    })

    it('should handle URLSearchParams object', () => {
      fc.assert(
        fc.property(
          fc.array(uuidArb, { minLength: 1, maxLength: 5 }),
          (tagIds) => {
            const params = new URLSearchParams()
            params.set('tags', tagIds.join(','))
            const parsed = parseTagIdsFromUrl(params)
            
            expect(parsed.length).toBe(tagIds.length)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should handle object with tags property', () => {
      fc.assert(
        fc.property(
          fc.array(uuidArb, { minLength: 1, maxLength: 5 }),
          (tagIds) => {
            const obj = { tags: tagIds.join(',') }
            const parsed = parseTagIdsFromUrl(obj)
            
            expect(parsed.length).toBe(tagIds.length)
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * **Property 6: Tag filter loads only topic/source categories**
   * **Validates: Requirements 3.2**
   */
  describe('Property 6: Tag filter loads only topic/source categories', () => {
    it('should only return tags with topic or source category', () => {
      fc.assert(
        fc.property(
          fc.array(tagArb, { minLength: 0, maxLength: 20 }),
          (tags) => {
            const filtered = filterStudyTags(tags)
            
            // All filtered tags should be topic or source
            for (const tag of filtered) {
              expect(['topic', 'source']).toContain(tag.category)
            }
            
            // Should include all topic/source tags from input
            const expectedCount = tags.filter(t => 
              t.category === 'topic' || t.category === 'source'
            ).length
            expect(filtered.length).toBe(expectedCount)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should exclude concept tags', () => {
      fc.assert(
        fc.property(
          fc.array(tagArb, { minLength: 1, maxLength: 10 }),
          (tags) => {
            const filtered = filterStudyTags(tags)
            
            // No concept tags should be in the result
            for (const tag of filtered) {
              expect(tag.category).not.toBe('concept')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * URL round-trip property
   */
  describe('URL round-trip', () => {
    it('should preserve tag IDs through build and parse cycle', () => {
      fc.assert(
        fc.property(
          fc.array(uuidArb, { minLength: 1, maxLength: 10 }),
          (tagIds) => {
            const url = buildStudyUrl(tagIds)
            const searchParams = url.includes('?') ? url.split('?')[1] : ''
            const parsed = parseTagIdsFromUrl(`?${searchParams}`)
            
            // Should have same length
            expect(parsed.length).toBe(tagIds.length)
            
            // Should contain all original IDs
            for (const id of tagIds) {
              expect(parsed).toContain(id)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
