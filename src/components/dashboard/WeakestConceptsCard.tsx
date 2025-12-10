'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Play } from 'lucide-react'
import { formatAccuracyPercent } from '@/lib/analytics-utils'
import { buildStudyUrl } from '@/lib/url-utils'
import type { WeakestConceptSummary } from '@/types/actions'

export interface WeakestConceptsCardProps {
  concepts: WeakestConceptSummary[]
}

/**
 * WeakestConceptsCard Component
 * Displays up to 3 weakest concepts with accuracy and review CTAs.
 * Hidden when concepts array is empty.
 * 
 * **Feature: v11.7-companion-dashboard-tag-filtered-study**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 */
export function WeakestConceptsCard({ concepts }: WeakestConceptsCardProps) {
  const router = useRouter()

  // Hide if no concepts
  if (concepts.length === 0) {
    return null
  }

  const handleReviewClick = (tagId: string) => {
    const url = buildStudyUrl([tagId])
    router.push(url)
  }

  return (
    <Card variant="elevated" padding="md" className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Needs Attention
        </h2>
      </div>

      {/* Concept rows */}
      <div className="space-y-3">
        {concepts.map((concept) => (
          <div
            key={concept.tagId}
            className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
          >
            {/* Concept info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {concept.tagName}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {concept.isLowConfidence ? (
                  <span className="text-amber-600 dark:text-amber-400">Needs work</span>
                ) : (
                  <span className={concept.accuracy < 50 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}>
                    {formatAccuracyPercent(concept.accuracy)} accuracy
                  </span>
                )}
              </p>
            </div>

            {/* Review button */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleReviewClick(concept.tagId)}
              className="shrink-0"
            >
              <Play className="w-4 h-4 mr-1" />
              Review
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
