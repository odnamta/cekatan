'use client'

/**
 * Creator Results View - shows aggregate stats, score distribution,
 * top/bottom performers, live monitoring, proctoring violations,
 * question difficulty, and candidate sessions table.
 * Extracted from results/page.tsx for maintainability (#174).
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  TrendingUp,
  Target,
  Download,
  AlertTriangle,
  Shield,
  ChevronDown,
  Clock,
  BarChart3,
  Search,
  Award,
  FileDown,
} from 'lucide-react'
import { useOrg } from '@/components/providers/OrgProvider'
import { hasMinimumRole } from '@/lib/org-authorization'
import {
  getAssessment,
  getAssessmentResultsDetailed,
  getQuestionAnalytics,
  exportResultsCsv,
  expireStaleSessions,
  getActiveSessionsForAssessment,
  getViolationHeatmap,
} from '@/actions/assessment-actions'
import { exportAssessmentResultsPdf } from '@/actions/assessment-report-actions'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'
import type { Assessment, AssessmentSession } from '@/types/database'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

const RechartsBarChart = dynamic(
  () => import('recharts').then((mod) => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = mod
    function Chart({ data }: { data: Array<{ range: string; count: number }> }) {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }
    return Chart
  }),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse bg-slate-100 dark:bg-slate-800 rounded" /> }
)

type SessionWithEmail = AssessmentSession & { user_email: string; user_full_name: string | null; user_phone: string | null }

type QuestionStat = {
  cardTemplateId: string
  stem: string
  totalAttempts: number
  correctCount: number
  percentCorrect: number
  avgTimeSeconds: number | null
}

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

function buildScoreDistribution(sessions: Array<{ score: number | null }>) {
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10 + 1}-${(i + 1) * 10}`,
    count: 0,
  }))
  // Handle 0 score in first bucket
  buckets[0].range = '0-10'

  sessions.forEach((s) => {
    if (s.score == null) return
    const idx = Math.min(Math.floor(s.score / 10), 9)
    buckets[idx].count++
  })
  return buckets
}

export function CreatorResultsView({ assessmentId }: { assessmentId: string }) {
  const router = useRouter()
  const { org } = useOrg()
  const { showToast } = useToast()
  const proctoringEnabled = org.settings.features.proctoring
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [sessions, setSessions] = useState<SessionWithEmail[]>([])
  const [stats, setStats] = useState<{ avgScore: number; passRate: number; totalAttempts: number } | null>(null)
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionLimit, setSessionLimit] = useState(20)
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [exportingPdf, setExportingPdf] = useState(false)
  const [violationHeatmap, setViolationHeatmap] = useState<Array<{ index: number; stem: string; violationCount: number }>>([])
  const [activeSessions, setActiveSessions] = useState<Array<{
    sessionId: string; userEmail: string; startedAt: string
    timeRemainingSeconds: number | null; questionsAnswered: number
    totalQuestions: number; tabSwitchCount: number
  }>>([])
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pollActiveSessions = useCallback(async () => {
    const result = await getActiveSessionsForAssessment(assessmentId)
    if (result.ok) setActiveSessions(result.data ?? [])
  }, [assessmentId])

  useEffect(() => {
    async function load() {
      // Auto-expire stale sessions before loading results
      await expireStaleSessions()

      const [aResult, rResult, qResult] = await Promise.all([
        getAssessment(assessmentId),
        getAssessmentResultsDetailed(assessmentId),
        getQuestionAnalytics(assessmentId),
      ])

      if (aResult.ok && aResult.data) setAssessment(aResult.data)
      if (!rResult.ok) {
        setError(rResult.error)
      } else if (rResult.data) {
        setSessions(rResult.data.sessions as SessionWithEmail[])
        setStats(rResult.data.stats)
      }
      if (qResult.ok && qResult.data) {
        setQuestionStats(qResult.data.questions)
      }
      setLoading(false)

      // Load violation heatmap if proctoring is enabled
      if (proctoringEnabled) {
        getViolationHeatmap(assessmentId).then(hResult => {
          if (hResult.ok && hResult.data) {
            setViolationHeatmap(hResult.data.questions)
          }
        })
      }

      // Initial poll + start interval for live monitoring
      pollActiveSessions()
    }
    load()

    pollingRef.current = setInterval(pollActiveSessions, 15000) // every 15s
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [assessmentId, pollActiveSessions])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
              <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-2" />
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-1" />
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button variant="secondary" onClick={() => router.push('/assessments')}>
          Back to Assessments
        </Button>
      </div>
    )
  }

  // Computed: median, filtered sessions, top/bottom performers
  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'timed_out')
  const scores = completedSessions.map(s => s.score).filter((s): s is number => s !== null)
  const medianScore = computeMedian(scores)

  const filteredSessions = sessions.filter(s => {
    if (statusFilter === 'passed') {
      if (s.passed !== true) return false
    } else if (statusFilter === 'failed') {
      if (s.passed !== false || (s.status !== 'completed' && s.status !== 'timed_out')) return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !(s.user_full_name?.toLowerCase().includes(q) ||
          s.user_email.toLowerCase().includes(q) ||
          s.user_phone?.toLowerCase().includes(q))
      ) return false
    }
    return true
  })

  const topPerformers = [...completedSessions]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5)

  const bottomPerformers = [...completedSessions]
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { label: 'Assessments', href: '/assessments' },
        { label: assessment?.title ?? 'Assessment', href: `/assessments/${assessmentId}/analytics` },
        { label: 'Results' },
      ]} />

      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {assessment?.title ?? 'Assessment'} — Results
        </h1>
        {sessions.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={exportingPdf}
              onClick={async () => {
                setExportingPdf(true)
                const result = await exportAssessmentResultsPdf(assessmentId)
                setExportingPdf(false)
                if (result.ok && result.data) {
                  window.open(result.data.url, '_blank')
                  showToast('PDF exported', 'success')
                } else if (!result.ok) {
                  showToast(result.error, 'error')
                }
              }}
            >
              <FileDown className="h-4 w-4 mr-1" />
              {exportingPdf ? 'Generating...' : 'Export PDF'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                const result = await exportResultsCsv(assessmentId)
                if (result.ok && result.data) {
                  const blob = new Blob([result.data], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${assessment?.title ?? 'assessment'}-results.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                  showToast('CSV exported', 'success')
                } else if (!result.ok) {
                  showToast(result.error, 'error')
                }
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        )}
      </div>
      {assessment && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {assessment.question_count} questions · {assessment.time_limit_minutes} min · {assessment.pass_score}% to pass
        </p>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
            <Users className="h-5 w-5 mx-auto text-slate-400 mb-1" />
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.totalAttempts}
            </div>
            <div className="text-xs text-slate-500">Total Attempts</div>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.avgScore}%
            </div>
            <div className="text-xs text-slate-500">Average Score</div>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
            <BarChart3 className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {medianScore}%
            </div>
            <div className="text-xs text-slate-500">Median Score</div>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
            <Target className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.passRate}%
            </div>
            <div className="text-xs text-slate-500">Pass Rate</div>
          </div>
        </div>
      )}

      {/* Score Distribution Histogram */}
      {sessions.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 mb-8">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Distribusi Skor</h3>
          <RechartsBarChart data={buildScoreDistribution(sessions)} />
        </div>
      )}

      {/* Top & Bottom Performers */}
      {completedSessions.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-900/10">
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top {Math.min(5, topPerformers.length)} Performers
            </h3>
            <div className="space-y-2">
              {topPerformers.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-right text-xs font-bold text-green-600 dark:text-green-400">{i + 1}.</span>
                  <span className="flex-1 min-w-0 truncate text-slate-700 dark:text-slate-300">
                    {s.user_full_name || s.user_email}
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50/30 dark:bg-red-900/10">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Bottom {Math.min(5, bottomPerformers.length)} Performers
            </h3>
            <div className="space-y-2">
              {bottomPerformers.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-right text-xs font-bold text-red-600 dark:text-red-400">{i + 1}.</span>
                  <span className="flex-1 min-w-0 truncate text-slate-700 dark:text-slate-300">
                    {s.user_full_name || s.user_email}
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400">{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Active Sessions Monitor */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            Live — {activeSessions.length} Active {activeSessions.length === 1 ? 'Session' : 'Sessions'}
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {activeSessions.map((s) => {
              const mins = s.timeRemainingSeconds != null ? Math.floor(s.timeRemainingSeconds / 60) : null
              const progress = s.totalQuestions > 0
                ? Math.round((s.questionsAnswered / s.totalQuestions) * 100)
                : 0
              return (
                <div
                  key={s.sessionId}
                  className="p-3 rounded-lg border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {s.userEmail}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {mins != null ? `${mins}m left` : '—'}
                      </span>
                      <span>{s.questionsAnswered}/{s.totalQuestions} answered</span>
                      {s.tabSwitchCount > 0 && (
                        <span className="text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3 inline mr-0.5" />
                          {s.tabSwitchCount} switches
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-24 flex-shrink-0">
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 text-right mt-0.5">{progress}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Flagged Sessions — Proctoring Violations (gated by feature flag) */}
      {proctoringEnabled && (() => {
        const flagged = sessions.filter((s) => s.tab_switch_count >= 3)
        if (flagged.length === 0) return null
        return (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Flagged Sessions ({flagged.length})
            </h2>
            <div className="space-y-2">
              {flagged
                .sort((a, b) => b.tab_switch_count - a.tab_switch_count)
                .map((s) => {
                  const isHigh = s.tab_switch_count >= 10
                  const log = Array.isArray(s.tab_switch_log) ? s.tab_switch_log as Array<{ timestamp: string; type: string }> : []
                  const isExpanded = expandedViolation === s.id
                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${isHigh ? 'text-red-500' : 'text-amber-500'}`} />
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {s.user_email}
                          </span>
                          <Badge className={isHigh
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }>
                            {s.tab_switch_count} violations
                          </Badge>
                          {s.score !== null && (
                            <span className="text-xs text-slate-500">{s.score}%</span>
                          )}
                        </div>
                        {log.length > 0 && (
                          <button
                            onClick={() => setExpandedViolation(isExpanded ? null : s.id)}
                            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            Timeline
                          </button>
                        )}
                      </div>
                      {isExpanded && log.length > 0 && (
                        <div className="mt-3 ml-7 space-y-1">
                          {log.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400 font-mono w-20 flex-shrink-0">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </span>
                              <span className={entry.type === 'tab_hidden' ? 'text-red-500' : 'text-green-500'}>
                                {entry.type === 'tab_hidden' ? 'Left exam' : 'Returned'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        )
      })()}

      {/* Violation Heatmap by Question */}
      {violationHeatmap.length > 0 && violationHeatmap.some(q => q.violationCount > 0) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Violation Heatmap by Question
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Tab switches during each question across all flagged sessions. Darker = more violations.
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {violationHeatmap.map((q) => {
              const maxV = Math.max(...violationHeatmap.map(h => h.violationCount), 1)
              const intensity = q.violationCount / maxV
              const bg = q.violationCount === 0
                ? 'bg-slate-100 dark:bg-slate-800'
                : intensity < 0.33
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : intensity < 0.66
                    ? 'bg-orange-200 dark:bg-orange-900/40'
                    : 'bg-red-300 dark:bg-red-900/50'
              return (
                <div
                  key={q.index}
                  title={`Q${q.index}: ${q.stem} — ${q.violationCount} violations`}
                  className={`${bg} rounded p-2 text-center cursor-default transition-colors`}
                >
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Q{q.index}
                  </div>
                  <div className={`text-sm font-bold ${q.violationCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                    {q.violationCount}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Question Difficulty Analysis */}
      {questionStats.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Question Difficulty
          </h2>
          <div className="space-y-2">
            {questionStats.map((q, idx) => {
              const isHard = q.percentCorrect < 40
              const isMedium = q.percentCorrect >= 40 && q.percentCorrect < 70
              return (
                <div
                  key={q.cardTemplateId}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <span className="text-xs font-medium text-slate-400 w-6 text-right flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-slate-100 truncate">
                      {q.stem}
                    </p>
                    <div className="mt-1 w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isHard
                            ? 'bg-red-500'
                            : isMedium
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${q.percentCorrect}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {q.avgTimeSeconds != null && (
                      <span className="text-xs text-slate-400 inline-flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {q.avgTimeSeconds}s
                      </span>
                    )}
                    <span
                      className={`text-sm font-bold ${
                        isHard
                          ? 'text-red-500'
                          : isMedium
                            ? 'text-amber-600'
                            : 'text-green-600'
                      }`}
                    >
                      {q.percentCorrect}%
                    </span>
                    <span className="text-xs text-slate-400">
                      ({q.correctCount}/{q.totalAttempts})
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      {sessions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
            {(['all', 'passed', 'failed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === f
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f === 'all' ? 'Semua' : f === 'passed' ? 'Passed' : 'Failed'}
              </button>
            ))}
          </div>
          {(statusFilter !== 'all' || searchQuery) && (
            <span className="text-xs text-slate-500">
              {filteredSessions.length} dari {sessions.length}
            </span>
          )}
        </div>
      )}

      {/* Candidate Sessions Table */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No attempts yet.</p>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            All Attempts
          </h2>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]" aria-label="Candidate attempt results">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Nama</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Email</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Telepon</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Score</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  {proctoringEnabled && <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Tab Switches</th>}
                  {proctoringEnabled && <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">IP</th>}
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredSessions.slice(0, sessionLimit).map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => {
                      if (s.status === 'completed' || s.status === 'timed_out') {
                        router.push(`/assessments/${assessmentId}/results?sessionId=${s.id}`)
                      }
                    }}
                    className={`bg-white dark:bg-slate-800 ${
                      s.status === 'completed' || s.status === 'timed_out'
                        ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                      {s.user_full_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                      {s.user_email}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                      {s.user_phone || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {(s.status === 'completed' || s.status === 'timed_out') && s.score !== null ? (
                        <span className={`font-bold ${s.passed ? 'text-green-600' : 'text-red-500'}`}>
                          {s.score}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.status === 'completed' ? (
                        s.passed ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Passed
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Failed
                          </Badge>
                        )
                      ) : s.status === 'timed_out' ? (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Timed Out
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                    </td>
                    {proctoringEnabled && (
                      <td className="px-4 py-3">
                        {s.tab_switch_count > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {s.tab_switch_count}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                    )}
                    {proctoringEnabled && (
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                        {s.ip_address ?? '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-slate-500">
                      {s.completed_at
                        ? new Date(s.completed_at).toLocaleDateString()
                        : s.created_at
                          ? new Date(s.created_at).toLocaleDateString()
                          : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSessions.length > sessionLimit && (
            <button
              onClick={() => setSessionLimit((l) => l + 20)}
              className="w-full py-2 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Show more ({filteredSessions.length - sessionLimit} remaining)
            </button>
          )}
        </>
      )}
    </div>
  )
}
