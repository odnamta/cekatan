import { Card } from '@/components/ui/Card'

/**
 * Loading skeleton for the dashboard page.
 * Shows placeholder content while data is being fetched.
 */
export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero skeleton */}
      <Card variant="elevated" padding="lg" className="mb-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </Card>

      {/* Heatmap skeleton */}
      <Card className="mb-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-sm"
            />
          ))}
        </div>
      </Card>

      {/* Library section skeleton */}
      <div className="animate-pulse">
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-32">
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
