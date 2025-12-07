'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatSessionSummary } from '@/lib/qa-metrics'
import { calculateMissingNumbers } from '@/lib/question-number-detector'

interface SessionPanelProps {
  sessionId: string | null
  draftCount: number
  detectedNumbers: number[]
  savedNumbers: number[]
}

/**
 * V11.3: Session Panel Component
 * Displays current session stats on the BulkImport page.
 * Requirements: 9.1, 9.2
 */
export function SessionPanel({ 
  sessionId, 
  draftCount, 
  detectedNumbers, 
  savedNumbers 
}: SessionPanelProps) {
  if (!sessionId) {
    return null
  }

  const missingNumbers = calculateMissingNumbers(detectedNumbers, savedNumbers)
  const summary = formatSessionSummary(draftCount, detectedNumbers.length, missingNumbers.length)

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
        Current Session
      </h3>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        {summary}
      </p>

      {missingNumbers.length > 0 && missingNumbers.length <= 10 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
          Missing: {missingNumbers.join(', ')}
        </p>
      )}

      {draftCount > 0 && (
        <Link href={`/admin/sessions/${sessionId}`}>
          <Button size="sm" className="w-full">
            Review & Publish
          </Button>
        </Link>
      )}
    </div>
  )
}
