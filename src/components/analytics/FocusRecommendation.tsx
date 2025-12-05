'use client'

import Link from 'next/link'
import { Target, ArrowRight } from 'lucide-react'
import type { TopicAccuracy } from '@/types/database'

interface FocusRecommendationProps {
  topic: TopicAccuracy | null
}

/**
 * Generates the improve button URL for a topic.
 * 
 * **Feature: v10.2-weakness-hunter, Property 9: Improve button URL construction**
 * **Validates: Requirements 5.3**
 */
export function generateImproveUrl(tagId: string): string {
  return `/study/custom?tagIds=${tagId}&mode=due`
}

/**
 * FocusRecommendation component displays the user's weakest topic
 * and provides a direct link to study that topic.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function FocusRecommendation({ topic }: FocusRecommendationProps) {
  if (!topic) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-200 rounded-lg">
            <Target className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700">Keep studying!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Complete more reviews to get personalized recommendations for improvement.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const accuracyColor = topic.accuracy !== null && topic.accuracy < 50 
    ? 'text-red-600' 
    : topic.accuracy !== null && topic.accuracy < 70 
      ? 'text-amber-600' 
      : 'text-blue-600'

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Target className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Focus Recommendation</h3>
            <p className="text-sm text-slate-600 mt-1">
              Your weakest topic is{' '}
              <span className="font-medium text-slate-900">{topic.tagName}</span>
              {topic.accuracy !== null && (
                <span className={`ml-1 ${accuracyColor}`}>
                  ({topic.accuracy.toFixed(0)}% accuracy)
                </span>
              )}
            </p>
            {topic.isLowConfidence && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Based on limited data ({topic.totalAttempts} attempts)
              </p>
            )}
          </div>
        </div>
        
        <Link
          href={generateImproveUrl(topic.tagId)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
        >
          Improve {topic.tagName}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default FocusRecommendation
