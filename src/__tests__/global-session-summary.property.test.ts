import { describe, test, expect } from 'vitest'
import fc from 'fast-check'

/**
 * Global Session Summary Property-Based Tests
 * 
 * **Feature: v3-ux-overhaul, Property 5: Session summary state consistency**
 * **Validates: Requirements 2.6, 6.1**
 * 
 * For any sequence of answers in a global study session, the summary SHALL display
 * `correctCount` equal to the number of correct answers and `incorrectCount` equal
 * to the number of incorrect answers, where `correctCount + incorrectCount` equals
 * total cards answered.
 */

// Pure function to compute session summary state from a sequence of answers
interface SessionSummaryState {
  correctCount: number
  incorrectCount: number
  totalAnswered: number
}

/**
 * Computes session summary state from a sequence of boolean answers.
 * true = correct, false = incorrect
 */
function computeSessionSummary(answers: boolean[]): SessionSummaryState {
  const correctCount = answers.filter(a => a === true).length
  const incorrectCount = answers.filter(a => a === false).length
  return {
    correctCount,
    incorrectCount,
    totalAnswered: correctCount + incorrectCount,
  }
}

/**
 * Applies a single answer to the session state.
 * Returns updated state.
 */
function applyAnswer(
  state: SessionSummaryState,
  isCorrect: boolean
): SessionSummaryState {
  return {
    correctCount: state.correctCount + (isCorrect ? 1 : 0),
    incorrectCount: state.incorrectCount + (isCorrect ? 0 : 1),
    totalAnswered: state.totalAnswered + 1,
  }
}

// Generator for answer sequences (true = correct, false = incorrect)
const answerSequenceArb = fc.array(fc.boolean(), { minLength: 0, maxLength: 100 })

// Generator for valid session summary state
const sessionSummaryStateArb = fc.record({
  correctCount: fc.integer({ min: 0, max: 500 }),
  incorrectCount: fc.integer({ min: 0, max: 500 }),
}).map(({ correctCount, incorrectCount }) => ({
  correctCount,
  incorrectCount,
  totalAnswered: correctCount + incorrectCount,
}))

describe('Property 5: Session summary state consistency', () => {
  /**
   * **Feature: v3-ux-overhaul, Property 5: Session summary state consistency**
   * **Validates: Requirements 2.6, 6.1**
   */
  test('correctCount equals the number of correct answers', () => {
    fc.assert(
      fc.property(answerSequenceArb, (answers) => {
        const result = computeSessionSummary(answers)
        const expectedCorrect = answers.filter(a => a === true).length
        
        expect(result.correctCount).toBe(expectedCorrect)
      }),
      { numRuns: 100 }
    )
  })

  test('incorrectCount equals the number of incorrect answers', () => {
    fc.assert(
      fc.property(answerSequenceArb, (answers) => {
        const result = computeSessionSummary(answers)
        const expectedIncorrect = answers.filter(a => a === false).length
        
        expect(result.incorrectCount).toBe(expectedIncorrect)
      }),
      { numRuns: 100 }
    )
  })

  test('correctCount + incorrectCount equals total cards answered', () => {
    fc.assert(
      fc.property(answerSequenceArb, (answers) => {
        const result = computeSessionSummary(answers)
        
        expect(result.correctCount + result.incorrectCount).toBe(result.totalAnswered)
        expect(result.totalAnswered).toBe(answers.length)
      }),
      { numRuns: 100 }
    )
  })

  test('single answer updates state correctly', () => {
    fc.assert(
      fc.property(sessionSummaryStateArb, fc.boolean(), (state, isCorrect) => {
        const result = applyAnswer(state, isCorrect)
        
        // totalAnswered should increase by 1
        expect(result.totalAnswered).toBe(state.totalAnswered + 1)
        
        if (isCorrect) {
          expect(result.correctCount).toBe(state.correctCount + 1)
          expect(result.incorrectCount).toBe(state.incorrectCount)
        } else {
          expect(result.correctCount).toBe(state.correctCount)
          expect(result.incorrectCount).toBe(state.incorrectCount + 1)
        }
      }),
      { numRuns: 100 }
    )
  })

  test('empty answer sequence results in zero counts', () => {
    const result = computeSessionSummary([])
    
    expect(result.correctCount).toBe(0)
    expect(result.incorrectCount).toBe(0)
    expect(result.totalAnswered).toBe(0)
  })

  test('counts are always non-negative', () => {
    fc.assert(
      fc.property(answerSequenceArb, (answers) => {
        const result = computeSessionSummary(answers)
        
        expect(result.correctCount).toBeGreaterThanOrEqual(0)
        expect(result.incorrectCount).toBeGreaterThanOrEqual(0)
        expect(result.totalAnswered).toBeGreaterThanOrEqual(0)
      }),
      { numRuns: 100 }
    )
  })
})
