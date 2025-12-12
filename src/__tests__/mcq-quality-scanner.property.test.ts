/**
 * V12: MCQ Quality Scanner Property-Based Tests
 * 
 * Tests for regex-based MCQ text analysis using Vitest and fast-check.
 * 
 * **Feature: v12-quality-scanner-unified-editor**
 * **Requirements: NFR-3**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  scanChunkForQuestionsAndOptions,
  compareWithAIDrafts,
  getIssuesForDraft,
  hasHighSeverityIssues,
  countIssuesBySeverity,
  type QualityScanResult,
} from '@/lib/mcq-quality-scanner'

// ============================================
// Unit Tests
// ============================================

describe('scanChunkForQuestionsAndOptions', () => {
  it('returns empty result for empty string', () => {
    const result = scanChunkForQuestionsAndOptions('')
    expect(result.rawQuestionCount).toBe(0)
    expect(result.questions).toHaveLength(0)
    expect(result.globalIssues).toHaveLength(0)
  })

  it('returns empty result for null/undefined input', () => {
    // @ts-expect-error - testing invalid input
    const result1 = scanChunkForQuestionsAndOptions(null)
    expect(result1.rawQuestionCount).toBe(0)

    // @ts-expect-error - testing invalid input
    const result2 = scanChunkForQuestionsAndOptions(undefined)
    expect(result2.rawQuestionCount).toBe(0)
  })

  it('detects single question with numbered format', () => {
    const text = `1. What is the most common cause of postpartum hemorrhage?
A. Uterine atony
B. Retained placenta
C. Genital tract trauma
D. Coagulation disorders`

    const result = scanChunkForQuestionsAndOptions(text)
    expect(result.rawQuestionCount).toBe(1)
    expect(result.questions[0].rawOptionLetters).toEqual(['A', 'B', 'C', 'D'])
    expect(result.questions[0].rawOptionCount).toBe(4)
  })

  it('detects multiple questions in sequence', () => {
    const text = `1. First question stem?
A. Option A
B. Option B
C. Option C

2. Second question stem?
A. Option A
B. Option B
C. Option C
D. Option D

3. Third question stem?
A. Option A
B. Option B`

    const result = scanChunkForQuestionsAndOptions(text)
    expect(result.rawQuestionCount).toBe(3)
    expect(result.questions[0].rawOptionCount).toBe(3)
    expect(result.questions[1].rawOptionCount).toBe(4)
    expect(result.questions[2].rawOptionCount).toBe(2)
  })

  it('detects Q-prefixed question format', () => {
    const text = `Q1. What is the diagnosis?
A. Preeclampsia
B. Eclampsia
C. HELLP syndrome

Q2. What is the treatment?
A. Magnesium sulfate
B. Labetalol
C. Delivery`

    const result = scanChunkForQuestionsAndOptions(text)
    expect(result.rawQuestionCount).toBe(2)
  })

  it('detects parenthesized option format', () => {
    const text = `1. Question stem here?
(A) First option
(B) Second option
(C) Third option
(D) Fourth option
(E) Fifth option`

    const result = scanChunkForQuestionsAndOptions(text)
    expect(result.rawQuestionCount).toBe(1)
    expect(result.questions[0].rawOptionLetters).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(result.questions[0].rawOptionCount).toBe(5)
  })

  it('detects lowercase option format', () => {
    const text = `1. Question stem?
a. First option
b. Second option
c. Third option`

    const result = scanChunkForQuestionsAndOptions(text)
    expect(result.rawQuestionCount).toBe(1)
    expect(result.questions[0].rawOptionLetters).toEqual(['A', 'B', 'C'])
    expect(result.questions[0].rawOptionCount).toBe(3)
  })

  it('handles text with no questions', () => {
    const text = `This is just regular text without any MCQ formatting.
It has multiple lines but no question numbers or options.`

    const result = scanChunkForQuestionsAndOptions(text)
    expect(result.rawQuestionCount).toBe(0)
    expect(result.questions).toHaveLength(0)
  })

  it('handles malformed text without crashing', () => {
    const malformedTexts = [
      '1.',
      'A.',
      '1. Question without options',
      'A. Option without question',
      '1. 2. 3. Multiple numbers on same line',
      'A. B. C. Multiple options on same line',
    ]

    for (const text of malformedTexts) {
      expect(() => scanChunkForQuestionsAndOptions(text)).not.toThrow()
    }
  })
})

describe('compareWithAIDrafts', () => {
  it('flags MISSING_QUESTIONS when raw > AI', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 5,
      questions: Array(5).fill(null).map((_, i) => ({
        index: i,
        rawText: `Question ${i + 1}`,
        rawOptionLetters: ['A', 'B', 'C', 'D'],
        rawOptionCount: 4,
        issues: [],
      })),
      globalIssues: [],
    }

    const result = compareWithAIDrafts(scanResult, 3, [4, 4, 4])
    
    expect(result.globalIssues).toHaveLength(1)
    expect(result.globalIssues[0].code).toBe('MISSING_QUESTIONS')
    expect(result.globalIssues[0].severity).toBe('high')
  })

  it('flags MISSING_OPTIONS when raw options > AI options', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 1,
      questions: [{
        index: 0,
        rawText: 'Question 1',
        rawOptionLetters: ['A', 'B', 'C', 'D', 'E'],
        rawOptionCount: 5,
        issues: [],
      }],
      globalIssues: [],
    }

    const result = compareWithAIDrafts(scanResult, 1, [3])
    
    expect(result.questions[0].issues).toHaveLength(1)
    expect(result.questions[0].issues[0].code).toBe('MISSING_OPTIONS')
    expect(result.questions[0].issues[0].severity).toBe('high')
  })

  it('flags EXTRA_OPTIONS when AI options > raw options', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 1,
      questions: [{
        index: 0,
        rawText: 'Question 1',
        rawOptionLetters: ['A', 'B'],
        rawOptionCount: 2,
        issues: [],
      }],
      globalIssues: [],
    }

    const result = compareWithAIDrafts(scanResult, 1, [4])
    
    expect(result.questions[0].issues).toHaveLength(1)
    expect(result.questions[0].issues[0].code).toBe('EXTRA_OPTIONS')
    expect(result.questions[0].issues[0].severity).toBe('medium')
  })

  it('does not flag when counts match', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 2,
      questions: [
        { index: 0, rawText: 'Q1', rawOptionLetters: ['A', 'B', 'C', 'D'], rawOptionCount: 4, issues: [] },
        { index: 1, rawText: 'Q2', rawOptionLetters: ['A', 'B', 'C', 'D'], rawOptionCount: 4, issues: [] },
      ],
      globalIssues: [],
    }

    const result = compareWithAIDrafts(scanResult, 2, [4, 4])
    
    expect(result.globalIssues).toHaveLength(0)
    expect(result.questions[0].issues).toHaveLength(0)
    expect(result.questions[1].issues).toHaveLength(0)
  })
})

describe('getIssuesForDraft', () => {
  it('returns global issues for first draft only', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 3,
      questions: [],
      globalIssues: [{ code: 'MISSING_QUESTIONS', severity: 'high', message: 'Test' }],
    }

    const issues0 = getIssuesForDraft(scanResult, 0)
    const issues1 = getIssuesForDraft(scanResult, 1)

    expect(issues0).toHaveLength(1)
    expect(issues1).toHaveLength(0)
  })

  it('returns per-question issues for matching index', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 2,
      questions: [
        { index: 0, rawText: 'Q1', rawOptionLetters: [], rawOptionCount: 0, issues: [{ code: 'MISSING_OPTIONS', severity: 'high', message: 'Test' }] },
        { index: 1, rawText: 'Q2', rawOptionLetters: [], rawOptionCount: 0, issues: [] },
      ],
      globalIssues: [],
    }

    const issues0 = getIssuesForDraft(scanResult, 0)
    const issues1 = getIssuesForDraft(scanResult, 1)

    expect(issues0).toHaveLength(1)
    expect(issues1).toHaveLength(0)
  })
})

describe('hasHighSeverityIssues', () => {
  it('returns true when global issues have high severity', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 0,
      questions: [],
      globalIssues: [{ code: 'MISSING_QUESTIONS', severity: 'high', message: 'Test' }],
    }

    expect(hasHighSeverityIssues(scanResult)).toBe(true)
  })

  it('returns true when question issues have high severity', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 1,
      questions: [{
        index: 0,
        rawText: 'Q1',
        rawOptionLetters: [],
        rawOptionCount: 0,
        issues: [{ code: 'MISSING_OPTIONS', severity: 'high', message: 'Test' }],
      }],
      globalIssues: [],
    }

    expect(hasHighSeverityIssues(scanResult)).toBe(true)
  })

  it('returns false when only medium/low severity issues', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 1,
      questions: [{
        index: 0,
        rawText: 'Q1',
        rawOptionLetters: [],
        rawOptionCount: 0,
        issues: [{ code: 'EXTRA_OPTIONS', severity: 'medium', message: 'Test' }],
      }],
      globalIssues: [],
    }

    expect(hasHighSeverityIssues(scanResult)).toBe(false)
  })
})

describe('countIssuesBySeverity', () => {
  it('counts issues correctly', () => {
    const scanResult: QualityScanResult = {
      rawQuestionCount: 2,
      questions: [
        { index: 0, rawText: 'Q1', rawOptionLetters: [], rawOptionCount: 0, issues: [
          { code: 'MISSING_OPTIONS', severity: 'high', message: 'Test' },
        ]},
        { index: 1, rawText: 'Q2', rawOptionLetters: [], rawOptionCount: 0, issues: [
          { code: 'EXTRA_OPTIONS', severity: 'medium', message: 'Test' },
        ]},
      ],
      globalIssues: [{ code: 'MISSING_QUESTIONS', severity: 'high', message: 'Test' }],
    }

    const counts = countIssuesBySeverity(scanResult)
    expect(counts.high).toBe(2)
    expect(counts.medium).toBe(1)
    expect(counts.low).toBe(0)
  })
})

// ============================================
// Property-Based Tests
// ============================================

describe('Property-based tests', () => {
  it('scanner never throws on arbitrary string input', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        expect(() => scanChunkForQuestionsAndOptions(text)).not.toThrow()
      }),
      { numRuns: 100 }
    )
  })

  it('rawQuestionCount equals number of detected questions', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = scanChunkForQuestionsAndOptions(text)
        expect(result.rawQuestionCount).toBe(result.questions.length)
      }),
      { numRuns: 100 }
    )
  })

  it('rawOptionCount is non-negative for all questions', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = scanChunkForQuestionsAndOptions(text)
        for (const question of result.questions) {
          expect(question.rawOptionCount).toBeGreaterThanOrEqual(0)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('rawOptionLetters length equals rawOptionCount', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = scanChunkForQuestionsAndOptions(text)
        for (const question of result.questions) {
          expect(question.rawOptionLetters.length).toBe(question.rawOptionCount)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('detects at least N questions when text has N numbered lines', () => {
    // Generate text with explicit question patterns
    const questionArb = fc.array(
      fc.record({
        num: fc.integer({ min: 1, max: 100 }),
        stem: fc.string({ minLength: 5, maxLength: 50 }),
      }),
      { minLength: 1, maxLength: 10 }
    )

    fc.assert(
      fc.property(questionArb, (questions) => {
        const text = questions
          .map((q, i) => `${i + 1}. ${q.stem}?\nA. Option A\nB. Option B`)
          .join('\n\n')
        
        const result = scanChunkForQuestionsAndOptions(text)
        expect(result.rawQuestionCount).toBeGreaterThanOrEqual(questions.length)
      }),
      { numRuns: 50 }
    )
  })

  it('compareWithAIDrafts never throws', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        fc.array(fc.integer({ min: 0, max: 10 }), { maxLength: 20 }),
        (rawCount, aiCount, optionCounts) => {
          const scanResult: QualityScanResult = {
            rawQuestionCount: rawCount,
            questions: Array(rawCount).fill(null).map((_, i) => ({
              index: i,
              rawText: `Q${i}`,
              rawOptionLetters: ['A', 'B', 'C', 'D'].slice(0, optionCounts[i] || 4),
              rawOptionCount: optionCounts[i] || 4,
              issues: [],
            })),
            globalIssues: [],
          }

          expect(() => compareWithAIDrafts(scanResult, aiCount, optionCounts)).not.toThrow()
        }
      ),
      { numRuns: 100 }
    )
  })
})
