/**
 * Session HUD Storage - Track cards created per PDF session
 * 
 * V6.2: Hyperflow feature - tracks session card count per PDF
 */

const STORAGE_KEY_PREFIX = 'session-cards-'

/**
 * Get the session card count for a specific source/PDF.
 */
export function getSessionCardCount(sourceId: string): number {
  if (typeof window === 'undefined') return 0
  
  const stored = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${sourceId}`)
  const count = parseInt(stored || '0', 10)
  return isNaN(count) ? 0 : count
}

/**
 * Add to the session card count for a specific source/PDF.
 */
export function addToSessionCardCount(sourceId: string, count: number): number {
  if (typeof window === 'undefined') return count
  
  const current = getSessionCardCount(sourceId)
  const newCount = current + count
  sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${sourceId}`, newCount.toString())
  return newCount
}

/**
 * Reset the session card count for a specific source/PDF.
 */
export function resetSessionCardCount(sourceId: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${sourceId}`)
}
