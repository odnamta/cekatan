import { getUserAnalytics, getActivityData } from '@/actions/analytics-actions'
import { RadarChart } from '@/components/analytics/RadarChart'
import { ActivityChart } from '@/components/analytics/ActivityChart'
import { FocusRecommendation } from '@/components/analytics/FocusRecommendation'
import { BarChart3 } from 'lucide-react'

export const metadata = {
  title: 'Stats | ResidencyOS',
  description: 'Track your study performance and identify areas for improvement',
}

export default async function StatsPage() {
  const [analyticsResult, activityResult] = await Promise.all([
    getUserAnalytics(),
    getActivityData(7),
  ])

  if (!analyticsResult.success || !activityResult.success) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">
            {analyticsResult.error || activityResult.error || 'Failed to load analytics'}
          </p>
        </div>
      </div>
    )
  }

  const { topicAccuracies, deckProgress, weakestTopic } = analyticsResult
  const { activity } = activityResult

  const hasData = topicAccuracies.length > 0 || activity.some(d => d.cardsReviewed > 0)

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        </div>
        <p className="text-slate-600">
          Track your performance and identify areas for improvement
        </p>
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Focus Recommendation */}
          {weakestTopic && (
            <FocusRecommendation topic={weakestTopic} />
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart - Topic Strengths */}
            {topicAccuracies.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-sm p-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Topic Strengths
                </h2>
                <RadarChart data={topicAccuracies} />
              </div>
            )}

            {/* Bar Chart - Weekly Activity */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-sm p-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Weekly Activity
              </h2>
              <ActivityChart data={activity} />
            </div>
          </div>

          {/* Deck Progress */}
          {deckProgress.length > 0 && (
            <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-sm p-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Deck Progress
              </h2>
              <div className="space-y-3">
                {deckProgress.map((deck) => (
                  <DeckProgressBar key={deck.deckId} deck={deck} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-sm p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <BarChart3 className="h-8 w-8 text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        No study data yet
      </h2>
      <p className="text-slate-600 max-w-md mx-auto">
        Start studying to see your performance analytics. Your accuracy by topic and weekly activity will appear here.
      </p>
    </div>
  )
}

interface DeckProgressBarProps {
  deck: {
    deckId: string
    deckTitle: string
    cardsLearned: number
    totalCards: number
  }
}

function DeckProgressBar({ deck }: DeckProgressBarProps) {
  const percentage = deck.totalCards > 0 
    ? Math.round((deck.cardsLearned / deck.totalCards) * 100) 
    : 0

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-700 truncate">
          {deck.deckTitle}
        </span>
        <span className="text-sm text-slate-500">
          {deck.cardsLearned}/{deck.totalCards} cards
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
