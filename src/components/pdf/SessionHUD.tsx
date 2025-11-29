'use client'

import { RotateCcw } from 'lucide-react'

interface SessionHUDProps {
  cardCount: number
  onReset: () => void
}

/**
 * SessionHUD - Small stats bar showing session card count
 * 
 * V6.2: Hyperflow feature - displays cards created in current session
 * Position: top-right of PDF viewer area
 */
export function SessionHUD({ cardCount, onReset }: SessionHUDProps) {
  if (cardCount === 0) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
      <span className="text-green-700 dark:text-green-300 font-medium">
        Session: {cardCount} card{cardCount !== 1 ? 's' : ''} created
      </span>
      <button
        type="button"
        onClick={onReset}
        className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
        title="Reset session count"
        aria-label="Reset session count"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
