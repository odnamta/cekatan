/**
 * V10.2: Analytics utility functions
 * Pure functions extracted from analytics-actions.ts for testability
 * and Next.js 16 Server Actions compatibility.
 */

import type { TopicAccuracy } from '@/types/database'

/**
 * Calculates accuracy percentage from correct count and total attempts.
 * Returns null if total attempts is 0 to avoid division by zero.
 */
export function calculateAccuracy(correctCount: number, totalAttempts: number): number | null {
  if (totalAttempts === 0) return null
  return (correctCount / totalAttempts) * 100
}

/**
 * Determines if a topic has low confidence based on attempt count.
 * Low confidence is defined as fewer than 5 attempts.
 */
export function isLowConfidence(totalAttempts: number): boolean {
  return totalAttempts < 5
}

/**
 * Formats a date to a 3-letter day name.
 */
export function formatDayName(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[date.getDay()]
}

/**
 * Finds the weakest topic from a list of topic accuracies.
 * When multiple topics have the same lowest accuracy, selects the one with most attempts.
 * Returns null if no topics have valid accuracy data.
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
 */
export function generateImproveUrl(tagId: string): string {
  return `/study/custom?tagIds=${tagId}&mode=due`
}


// ============================================
// V10.3: Subject Badge & Radar Chart Utilities
// ============================================

const DEFAULT_SUBJECT = 'OBGYN'

/**
 * Derives subject name from user's first active deck.
 * Returns default subject if no decks available.
 * 
 * **Feature: v10.3-analytics-visual-unity, Property 1: Subject derivation returns first deck's subject or default**
 * **Validates: Requirements 2.2, 2.3**
 */
export function deriveSubjectFromDecks(
  decks: Array<{ title: string; subject?: string | null }>,
  defaultSubject: string = DEFAULT_SUBJECT
): string {
  if (decks.length === 0) return defaultSubject
  // Use explicit subject field if available, otherwise extract from title
  const firstDeck = decks[0]
  if (firstDeck.subject) return firstDeck.subject
  // Fallback: use deck title as subject indicator
  return firstDeck.title || defaultSubject
}

/**
 * Selects top N topics by attempt count for radar display.
 * Returns all topics if fewer than N available.
 * 
 * **Feature: v10.3-analytics-visual-unity, Property 2: Top topics selection returns exactly N topics sorted by attempts**
 * **Validates: Requirements 3.2**
 */
export function getTopTopicsByAttempts(
  topics: TopicAccuracy[],
  count: number
): TopicAccuracy[] {
  if (topics.length <= count) return [...topics]
  
  return [...topics]
    .sort((a, b) => b.totalAttempts - a.totalAttempts)
    .slice(0, count)
}

/**
 * Normalizes accuracy value to 0-100 scale.
 * Null values are mapped to 0.
 * 
 * **Feature: v10.3-analytics-visual-unity, Property 3: Accuracy normalization bounds**
 * **Validates: Requirements 3.3**
 */
export function normalizeAccuracy(accuracy: number | null): number {
  if (accuracy === null) return 0
  return Math.max(0, Math.min(100, accuracy))
}

/**
 * Identifies the topic with lowest accuracy from a list.
 * Returns the index of the lowest accuracy topic, or -1 if empty.
 * 
 * **Feature: v10.3-analytics-visual-unity, Property 4: Lowest accuracy topic identification**
 * **Validates: Requirements 3.4**
 */
export function findLowestAccuracyIndex(topics: TopicAccuracy[]): number {
  if (topics.length === 0) return -1
  
  let lowestIndex = 0
  let lowestAccuracy = normalizeAccuracy(topics[0].accuracy)
  
  for (let i = 1; i < topics.length; i++) {
    const accuracy = normalizeAccuracy(topics[i].accuracy)
    if (accuracy < lowestAccuracy) {
      lowestAccuracy = accuracy
      lowestIndex = i
    }
  }
  
  return lowestIndex
}

/**
 * Generates the training URL for a topic.
 * 
 * **Feature: v10.3-analytics-visual-unity, Property 5: Train URL construction**
 * **Validates: Requirements 4.2**
 */
export function generateTrainUrl(tagId: string): string {
  return `/study/custom?tagIds=${tagId}&mode=due`
}

/**
 * Selects the weakest topic with tie-breaker by attempt count.
 * When multiple topics share the minimum accuracy, returns the one with highest attempts.
 * 
 * **Feature: v10.3-analytics-visual-unity, Property 6: Tie-breaker selection by attempt count**
 * **Validates: Requirements 4.3**
 */
export function selectWeakestTopic(topics: TopicAccuracy[]): TopicAccuracy | null {
  const topicsWithAccuracy = topics.filter(t => t.accuracy !== null)
  if (topicsWithAccuracy.length === 0) return null
  
  // Find minimum accuracy
  const minAccuracy = Math.min(...topicsWithAccuracy.map(t => t.accuracy!))
  
  // Filter topics with minimum accuracy
  const tiedTopics = topicsWithAccuracy.filter(t => t.accuracy === minAccuracy)
  
  // Return the one with highest attempts (tie-breaker)
  return tiedTopics.reduce((best, current) => 
    current.totalAttempts > best.totalAttempts ? current : best
  )
}


// ============================================
// V11.5: Weakest Concepts Analytics
// ============================================

import { LOW_CONFIDENCE_THRESHOLD } from './constants'

/**
 * Result type for weakest concept analysis.
 */
export interface WeakestConceptResult {
  tagId: string
  tagName: string
  accuracy: number
  totalAttempts: number
  isLowConfidence: boolean
}

/**
 * Finds the weakest concepts based on user progress and card tags.
 * Orders by accuracy ascending, deprioritizes low-confidence tags.
 * 
 * @param progressData - Array of { cardTemplateId, correctCount, totalAttempts }
 * @param cardTags - Array of { cardTemplateId, tagId }
 * @param tags - Array of { id, name, category }
 * @param limit - Maximum number of results (default 5)
 * @returns Array of WeakestConceptResult ordered by weakness
 * 
 * **Feature: v11.5-global-study-stabilization**
 * **Property 12: Weakest Concepts - Accuracy Ordering**
 * **Property 13: Weakest Concepts - Low Confidence Deprioritization**
 * **Property 14: Weakest Concepts - Tie Breaker**
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**
 */
export function findWeakestConcepts(
  progressData: Array<{ cardTemplateId: string; correctCount: number; totalAttempts: number }>,
  cardTags: Array<{ cardTemplateId: string; tagId: string }>,
  tags: Array<{ id: string; name: string; category: string }>,
  limit: number = 5
): WeakestConceptResult[] {
  // Build map of cardTemplateId -> progress
  const progressMap = new Map<string, { correctCount: number; totalAttempts: number }>()
  for (const p of progressData) {
    progressMap.set(p.cardTemplateId, { correctCount: p.correctCount, totalAttempts: p.totalAttempts })
  }
  
  // Build map of tagId -> tag info
  const tagMap = new Map<string, { name: string; category: string }>()
  for (const t of tags) {
    tagMap.set(t.id, { name: t.name, category: t.category })
  }
  
  // Aggregate stats per tag
  const tagStats = new Map<string, { correctCount: number; totalAttempts: number }>()
  
  for (const ct of cardTags) {
    const progress = progressMap.get(ct.cardTemplateId)
    if (!progress || progress.totalAttempts === 0) continue
    
    const existing = tagStats.get(ct.tagId) || { correctCount: 0, totalAttempts: 0 }
    tagStats.set(ct.tagId, {
      correctCount: existing.correctCount + progress.correctCount,
      totalAttempts: existing.totalAttempts + progress.totalAttempts,
    })
  }
  
  // Convert to results with accuracy
  const results: WeakestConceptResult[] = []
  
  for (const [tagId, stats] of tagStats) {
    const tagInfo = tagMap.get(tagId)
    if (!tagInfo) continue
    
    // Only include concept tags (not source or topic)
    if (tagInfo.category !== 'concept') continue
    
    const accuracy = stats.totalAttempts > 0
      ? (stats.correctCount / stats.totalAttempts) * 100
      : 0
    
    results.push({
      tagId,
      tagName: tagInfo.name,
      accuracy,
      totalAttempts: stats.totalAttempts,
      isLowConfidence: stats.totalAttempts < LOW_CONFIDENCE_THRESHOLD,
    })
  }
  
  // Sort by:
  // 1. Low confidence tags go last (deprioritized)
  // 2. Accuracy ascending (weakest first)
  // 3. Total attempts descending (tie-breaker: more data = more reliable)
  results.sort((a, b) => {
    // Low confidence goes last
    if (a.isLowConfidence !== b.isLowConfidence) {
      return a.isLowConfidence ? 1 : -1
    }
    // Lower accuracy = weaker = comes first
    if (a.accuracy !== b.accuracy) {
      return a.accuracy - b.accuracy
    }
    // More attempts = more reliable = comes first (tie-breaker)
    return b.totalAttempts - a.totalAttempts
  })
  
  return results.slice(0, limit)
}


/**
 * V11.7: Format accuracy as a percentage string.
 * Rounds to nearest integer and appends "%".
 * 
 * **Property 11: Accuracy formatting rounds to integer**
 * **Validates: Requirements 5.5**
 */
export function formatAccuracyPercent(accuracy: number | null): string {
  if (accuracy === null) return 'N/A'
  return `${Math.round(accuracy)}%`
}
