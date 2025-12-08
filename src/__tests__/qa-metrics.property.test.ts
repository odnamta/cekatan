import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  formatQAMetrics,
  calculateMissingNumbers,
  createQAMetrics,
  isImportComplete,
  type QAMetrics,
} from '@/lib/content-staging-metrics'

/**
 * QA Metrics Property Tests
 * 
 * **Feature: v11.5-global-study-stabilization**
 * Tests for QA metrics formatting and calculation.
 */

describe('QA Metrics Property Tests', () => {
  /**
   * **Property 15: QA Metrics Formatting**
   * For any QAMetrics input, formatQAMetrics SHALL return a string containing
   * detected count, created count, and missing numbers list.
   * **Validates: Requirements 11.2**
   */
  describe('Property 15: QA Metrics Formatting', () => {
    it('should include detected and created counts in output', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 100 }),
          fc.nat({ max: 100 }),
          fc.array(fc.nat({ max: 100 }), { maxLength: 20 }),
          (detected, created, missing) => {
            const metrics: QAMetrics = {
              detectedCount: detected,
              createdCount: created,
              missingNumbers: missing,
            }

            const result = formatQAMetrics(metrics)

            expect(result).toContain(`Detected ${detected}`)
            expect(result).toContain(`Created ${created}`)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should show "Complete ✓" when all detected are created and no missing', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (count) => {
            const metrics: QAMetrics = {
              detectedCount: count,
              createdCount: count,
              missingNumbers: [],
            }

            const result = formatQAMetrics(metrics)

            expect(result).toContain('Complete ✓')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should show missing numbers when present', () => {
      const metrics: QAMetrics = {
        detectedCount: 10,
        createdCount: 7,
        missingNumbers: [3, 5, 8],
      }

      const result = formatQAMetrics(metrics)

      expect(result).toContain('Missing:')
      expect(result).toContain('3')
      expect(result).toContain('5')
      expect(result).toContain('8')
    })

    it('should truncate long missing lists with ellipsis', () => {
      const metrics: QAMetrics = {
        detectedCount: 20,
        createdCount: 5,
        missingNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      }

      const result = formatQAMetrics(metrics)

      expect(result).toContain('...')
    })

    it('should not show Complete when counts differ', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (detected, created) => {
            fc.pre(detected !== created)

            const metrics: QAMetrics = {
              detectedCount: detected,
              createdCount: created,
              missingNumbers: [],
            }

            const result = formatQAMetrics(metrics)

            expect(result).not.toContain('Complete ✓')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * calculateMissingNumbers tests
   */
  describe('calculateMissingNumbers', () => {
    it('should return numbers in detected but not in created', () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat({ max: 100 }), { minLength: 1, maxLength: 20 }),
          fc.array(fc.nat({ max: 100 }), { maxLength: 20 }),
          (detected, created) => {
            const missing = calculateMissingNumbers(detected, created)
            const createdSet = new Set(created)

            // All missing numbers should be in detected but not in created
            for (const num of missing) {
              expect(detected).toContain(num)
              expect(createdSet.has(num)).toBe(false)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return sorted array', () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat({ max: 100 }), { minLength: 1, maxLength: 20 }),
          fc.array(fc.nat({ max: 100 }), { maxLength: 10 }),
          (detected, created) => {
            const missing = calculateMissingNumbers(detected, created)

            // Verify sorted ascending
            for (let i = 1; i < missing.length; i++) {
              expect(missing[i]).toBeGreaterThanOrEqual(missing[i - 1])
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty array when all detected are created', () => {
      const detected = [1, 2, 3, 4, 5]
      const created = [1, 2, 3, 4, 5]

      const result = calculateMissingNumbers(detected, created)

      expect(result).toEqual([])
    })

    it('should handle empty inputs', () => {
      expect(calculateMissingNumbers([], [])).toEqual([])
      expect(calculateMissingNumbers([], [1, 2, 3])).toEqual([])
      expect(calculateMissingNumbers([1, 2, 3], [])).toEqual([1, 2, 3])
    })
  })

  /**
   * createQAMetrics tests
   */
  describe('createQAMetrics', () => {
    it('should create correct metrics from number arrays', () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat({ max: 100 }), { maxLength: 20 }),
          fc.array(fc.nat({ max: 100 }), { maxLength: 20 }),
          (detected, created) => {
            const metrics = createQAMetrics(detected, created)

            expect(metrics.detectedCount).toBe(detected.length)
            expect(metrics.createdCount).toBe(created.length)
            expect(metrics.missingNumbers).toEqual(
              calculateMissingNumbers(detected, created)
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * isImportComplete tests
   */
  describe('isImportComplete', () => {
    it('should return true when all conditions met', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (count) => {
            const metrics: QAMetrics = {
              detectedCount: count,
              createdCount: count,
              missingNumbers: [],
            }

            expect(isImportComplete(metrics)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return false when counts differ', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (detected, created) => {
            fc.pre(detected !== created)

            const metrics: QAMetrics = {
              detectedCount: detected,
              createdCount: created,
              missingNumbers: [],
            }

            expect(isImportComplete(metrics)).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return false when missing numbers exist', () => {
      const metrics: QAMetrics = {
        detectedCount: 10,
        createdCount: 10,
        missingNumbers: [5],
      }

      expect(isImportComplete(metrics)).toBe(false)
    })

    it('should return false when detected is 0', () => {
      const metrics: QAMetrics = {
        detectedCount: 0,
        createdCount: 0,
        missingNumbers: [],
      }

      expect(isImportComplete(metrics)).toBe(false)
    })
  })

  /**
   * Format output examples
   */
  describe('Format output examples', () => {
    it('should format complete import correctly', () => {
      const metrics: QAMetrics = {
        detectedCount: 20,
        createdCount: 20,
        missingNumbers: [],
      }

      expect(formatQAMetrics(metrics)).toBe('Detected 20 · Created 20 · Complete ✓')
    })

    it('should format partial import with missing numbers', () => {
      const metrics: QAMetrics = {
        detectedCount: 10,
        createdCount: 7,
        missingNumbers: [3, 5, 8],
      }

      expect(formatQAMetrics(metrics)).toBe('Detected 10 · Created 7 · Missing: 3, 5, 8')
    })

    it('should format import with no missing but different counts', () => {
      const metrics: QAMetrics = {
        detectedCount: 10,
        createdCount: 8,
        missingNumbers: [],
      }

      expect(formatQAMetrics(metrics)).toBe('Detected 10 · Created 8')
    })
  })
})
