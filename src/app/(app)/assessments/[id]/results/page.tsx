'use client'

/**
 * V13: Assessment Results Page
 *
 * Shows score, pass/fail status, and per-question review.
 * Accessible to the candidate who took the session.
 */

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  BarChart3,
  Clock,
} from 'lucide-react'
import { getSessionResults, getAssessment } from '@/actions/assessment-actions'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import type { Assessment, AssessmentSession } from '@/types/database'

type EnrichedAnswer = {
  id: string
  session_id: string
  card_template_id: string
  selected_index: number | null
  is_correct: boolean | null
  answered_at: string | null
  stem: string
  options: string[]
  correct_index: number
  explanation: string | null
}

export default function AssessmentResultsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const assessmentId = params.id as string
  const sessionId = searchParams.get('sessionId')

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [answers, setAnswers] = useState<EnrichedAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!sessionId) {
        setError('No session specified')
        setLoading(false)
        return
      }

      const [aResult, sResult] = await Promise.all([
        getAssessment(assessmentId),
        getSessionResults(sessionId),
      ])

      if (aResult.ok && aResult.data) setAssessment(aResult.data)
      if (!sResult.ok) {
        setError(sResult.error)
      } else if (sResult.data) {
        setSession(sResult.data.session)
        setAnswers(sResult.data.answers)
      }
      setLoading(false)
    }
    load()
  }, [assessmentId, sessionId])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-slate-500">
        Loading results...
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error ?? 'Session not found'}</p>
        <Button variant="secondary" onClick={() => router.push('/assessments')}>
          Back to Assessments
        </Button>
      </div>
    )
  }

  const correctCount = answers.filter((a) => a.is_correct === true).length
  const totalCount = answers.length
  const score = session.score ?? 0
  const passed = session.passed ?? false

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/assessments')}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessments
      </button>

      {/* Score Card */}
      <div
        className={`rounded-xl p-6 mb-8 text-center ${
          passed
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}
      >
        <div className="mb-3">
          {passed ? (
            <Trophy className="h-12 w-12 mx-auto text-green-600" />
          ) : (
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
          )}
        </div>
        <h1 className="text-3xl font-bold mb-1">
          <span className={passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
            {score}%
          </span>
        </h1>
        <p className={`text-lg font-medium ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {passed ? 'Passed' : 'Not Passed'}
        </p>
        {assessment && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {assessment.title} — Pass score: {assessment.pass_score}%
          </p>
        )}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            {correctCount}/{totalCount} correct
          </span>
          {session.completed_at && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(session.completed_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Per-Question Review */}
      {answers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Question Review
          </h2>
          <div className="space-y-4">
            {answers.map((answer, idx) => (
              <div
                key={answer.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      answer.is_correct
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {answer.stem}
                  </p>
                </div>

                <div className="ml-9 space-y-2">
                  {answer.options.map((option, optIdx) => {
                    const isSelected = answer.selected_index === optIdx
                    const isCorrect = answer.correct_index === optIdx
                    let className = 'p-2.5 rounded-lg text-sm flex items-start gap-2 '

                    if (isCorrect) {
                      className += 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                    } else if (isSelected && !isCorrect) {
                      className += 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                    } else {
                      className += 'text-slate-600 dark:text-slate-400'
                    }

                    return (
                      <div key={optIdx} className={className}>
                        <span className="flex-shrink-0 font-medium">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{option}</span>
                        {isCorrect && (
                          <CheckCircle2 className="h-4 w-4 ml-auto flex-shrink-0 text-green-600" />
                        )}
                        {isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 ml-auto flex-shrink-0 text-red-500" />
                        )}
                      </div>
                    )
                  })}
                </div>

                {answer.explanation && (
                  <div className="ml-9 mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-medium">Explanation: </span>
                    {answer.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Button variant="secondary" onClick={() => router.push('/assessments')}>
          Back to Assessments
        </Button>
      </div>
    </div>
  )
}
