import { Card } from '@/components/ui/Card'

/**
 * Loading skeleton for the global study session page.
 */
export default function GlobalStudyLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Progress bar skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>

      {/* Card skeleton */}
      <Card className="animate-pulse">
        <div className="min-h-[300px] flex flex-col">
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="space-y-3 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
