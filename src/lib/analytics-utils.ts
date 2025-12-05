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
