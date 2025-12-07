'use client'

import type { ImportSessionMeta } from '@/lib/import-session'
import { formatQAMetrics } from '@/lib/qa-metrics'

interface SessionReviewHeaderProps {
  sessionMeta: ImportSessionMeta
  cardCount: number
}

/**
 * V11.3: Session Review Header Component
 * Displays book title, chapter title, card counts, and QA metrics.
 * Requirements: 4.2, 6.2, 6.4
 */
export function SessionReviewHeader({ sessionMeta, cardCount }: SessionReviewHeaderProps) {
  const { bookTitle, chapterTitle, draftCount, publishedCount, archivedCount } = sessionMeta

  return (
    <div className="mb-8">
      {/* Title section */}
      <div className="mb-4">
        {bookTitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {bookTitle}
          </p>
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {chapterTitle || 'Import Session Review'}
        </h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Total Cards" 
          value={cardCount} 
          color="slate"
        />
        <StatCard 
          label="Draft" 
          value={draftCount} 
          color="amber"
        />
        <StatCard 
          label="Published" 
          value={publishedCount} 
          color="green"
        />
        <StatCard 
          label="Archived" 
          value={archivedCount} 
          color="slate"
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  color: 'slate' | 'amber' | 'green'
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100',
  }

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <p className="text-sm opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
