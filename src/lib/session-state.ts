import type { SessionState } from '@/types/session'

// ============================================
// Global Study Session State Management
// ============================================

const GLOBAL_SESSION_STORAGE_KEY = 'global-study-session-state'
const SESSION_STALE_HOURS = 24

/**
 * Cached session state for global study sessions.
 * Stored in localStorage for resume capability.
 * Requirements: 1.8
 */
export interface CachedSessionState {
  currentIndex: number
  correctCount: number
  incorrectCount: number
  cardIds: string[]
  timestamp: string
}

/**
 * Saves global session state to localStorage.
 * Requirements: 1.8
 * 
 * @param state - The session state to save
 */
export function saveSessionState(state: CachedSessionState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GLOBAL_SESSION_STORAGE_KEY, JSON.stringify(state))
}

/**
 * Retrieves global session state from localStorage.
 * Returns null if no state exists or if parsing fails.
 * Requirements: 1.8
 * 
 * @returns The cached session state or null
 */
export function getSessionState(): CachedSessionState | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem(GLOBAL_SESSION_STORAGE_KEY)
  if (!stored) return null
  
  try {
    return JSON.parse(stored) as CachedSessionState
  } catch {
    return null
  }
}

/**
 * Clears global session state from localStorage.
 * Requirements: 1.8
 */
export function clearSessionState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GLOBAL_SESSION_STORAGE_KEY)
}

/**
 * Checks if a cached session state is stale (older than 24 hours).
 * Requirements: 1.8
 * 
 * @param state - The session state to check
 * @returns true if the session is older than 24 hours
 */
export function isSessionStale(state: CachedSessionState): boolean {
  const sessionTime = new Date(state.timestamp).getTime()
  const now = Date.now()
  const hoursDiff = (now - sessionTime) / (1000 * 60 * 60)
  return hoursDiff >= SESSION_STALE_HOURS
}

// ============================================
// Deck-Specific Session State (Existing)
// ============================================

/**
 * Initial session state with zero counts.
 */
export const initialSessionState: SessionState = {
  cardsReviewed: 0,
  ratings: {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  },
}

/**
 * Updates session state after a card rating.
 * Pure function for testability.
 * Requirements: 3.1, 3.2
 * 
 * @param state - Current session state
 * @param rating - Rating given (1=again, 2=hard, 3=good, 4=easy)
 * @returns Updated session state
 */
export function updateSessionState(
  state: SessionState,
  rating: 1 | 2 | 3 | 4
): SessionState {
  const ratingKey = rating === 1 ? 'again' : rating === 2 ? 'hard' : rating === 3 ? 'good' : 'easy'
  
  return {
    cardsReviewed: state.cardsReviewed + 1,
    ratings: {
      ...state.ratings,
      [ratingKey]: state.ratings[ratingKey] + 1,
    },
  }
}

/**
 * Applies a sequence of ratings to an initial session state.
 * Useful for testing and simulation.
 * 
 * @param ratings - Array of ratings to apply
 * @returns Final session state after all ratings
 */
export function applyRatings(ratings: Array<1 | 2 | 3 | 4>): SessionState {
  return ratings.reduce(
    (state, rating) => updateSessionState(state, rating),
    initialSessionState
  )
}
