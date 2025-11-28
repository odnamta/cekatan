'use client'

import Link from 'next/link'
import { Flame, CheckCircle, XCircle } from 'lucide-react'

export interface GlobalStudySummaryProps {
  correctCount: number
  incorrectCount: number
  currentStreak: number
  remainingDueCount: number
  onContinue?: () => void
  nextBatchUrl?: string
}

/**
 * Global Study Summary Component
 * Displays end-of-session statistics for global study sessions.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 7.4
 * 
 * - 6.1: Display correct count, incorrect count, streak progress
 * - 6.2: Large "Return to Dashboard" button
 * - 6.3: Conditional "Continue Studying" button when remainingDueCount > 0
 * - 6.4: Hide "Continue Studying" when no more due cards
 * - 7.4: Mobile-first with 44px minimum tap targets
 */
export function GlobalStudySummary({
  correctCount,
  incorrectCount,
  currentStreak,
  remainingDueCount,
  onContinue,
  nextBatchUrl,
}: GlobalStudySummaryProps) {
  const totalAnswered = correctCount + incorrectCount
  const accuracy = totalAnswered > 0 
    ? Math.round((correctCount / totalAnswered) * 100) 
    : 0

  return (
    <div className="bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
      {/* Celebration emoji */}
      <div className="text-4xl mb-4">🎉</div>
      
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Session Complete!
      </h2>
      
      {/* Total cards reviewed */}
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        You reviewed <span className="text-blue-600 dark:text-blue-400 font-semibold">{totalAnswered}</span> {totalAnswered === 1 ? 'card' : 'cards'} this session.
      </p>

      {/* Correct/Incorrect breakdown - Requirement 6.1 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</span>
          </div>
          <div className="text-sm text-green-600/70 dark:text-green-400/70">Correct</div>
        </div>
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{incorrectCount}</span>
          </div>
          <div className="text-sm text-red-600/70 dark:text-red-400/70">Incorrect</div>
        </div>
      </div>

      {/* Accuracy percentage */}
      {totalAnswered > 0 && (
        <div className="mb-6 text-slate-600 dark:text-slate-400">
          Accuracy: <span className="font-semibold text-slate-900 dark:text-slate-100">{accuracy}%</span>
        </div>
      )}

      {/* Streak display - Requirement 6.1 */}
      <div className="flex items-center justify-center gap-2 mb-6 py-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 rounded-lg">
        <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <span className="text-orange-700 dark:text-orange-300 font-bold">
          {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak
        </span>
      </div>

      {/* Action buttons - Requirements 6.2, 6.3, 6.4, 7.4 */}
      <div className="space-y-3">
        {/* Continue Studying button - only shown when remainingDueCount > 0 (Requirements 6.3, 6.4) */}
        {remainingDueCount > 0 && nextBatchUrl && (
          <Link
            href={nextBatchUrl}
            className="block w-full min-h-[44px] px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            Continue Studying ({remainingDueCount} remaining)
          </Link>
        )}
        {remainingDueCount > 0 && onContinue && !nextBatchUrl && (
          <button
            onClick={onContinue}
            className="w-full min-h-[44px] px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue Studying ({remainingDueCount} remaining)
          </button>
        )}
        
        {/* Return to Dashboard button - Requirement 6.2, 7.4 (44px min tap target) */}
        <Link 
          href="/dashboard"
          className="block w-full min-h-[44px] px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
