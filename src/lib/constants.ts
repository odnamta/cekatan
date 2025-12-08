/**
 * V11.5: Shared Constants
 * Single source of truth for magic strings and validation limits.
 */

// Card status enum
export const CARD_STATUS = {
  Draft: 'draft',
  Published: 'published',
  Archived: 'archived',
} as const

export type CardStatus = (typeof CARD_STATUS)[keyof typeof CARD_STATUS]

// Tag categories (3-tier taxonomy)
export const TAG_CATEGORIES = ['source', 'topic', 'concept'] as const
export type TagCategory = (typeof TAG_CATEGORIES)[number]

// MCQ validation limits
export const MCQ_LIMITS = {
  maxOptions: 5,
  minOptions: 2,
  minStemLength: 10,
  maxStemLength: 2000,
  minExplanationLength: 10,
} as const

// SM-2 algorithm constants
export const SM2_CONSTANTS = {
  minEaseFactor: 1.3,
  defaultEaseFactor: 2.5,
  againIntervalMinutes: 10,
  easyInitialIntervalDays: 4,
} as const

// Low confidence threshold for analytics
export const LOW_CONFIDENCE_THRESHOLD = 5

/**
 * Validates if a string is a valid card status
 */
export function isValidCardStatus(status: string): status is CardStatus {
  return Object.values(CARD_STATUS).includes(status as CardStatus)
}

/**
 * Validates if a string is a valid tag category
 */
export function isValidTagCategory(category: string): category is TagCategory {
  return TAG_CATEGORIES.includes(category as TagCategory)
}
