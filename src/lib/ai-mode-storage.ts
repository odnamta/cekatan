/**
 * AI Mode Storage - Persist AI draft mode selection
 * 
 * V6.2: Brain Toggle feature - stores user's preferred mode (Extract vs Generate)
 */

export type AIMode = 'extract' | 'generate'

const STORAGE_KEY = 'ai-draft-mode'

/**
 * Get the saved AI mode from localStorage.
 * Defaults to 'extract' if not set or invalid.
 */
export function getAIMode(): AIMode {
  if (typeof window === 'undefined') return 'extract'
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'extract' || stored === 'generate') {
    return stored
  }
  return 'extract'
}

/**
 * Save the AI mode to localStorage.
 */
export function setAIMode(mode: AIMode): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, mode)
}
