import { Card } from '@/components/ui/Card'

/**
 * Loading skeleton for the deck study page.
 */
export default function StudyLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress bar skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="flex justify-between mb-2">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>

      {/* Card skeleton */}
      <Card className="animate-pulse">
        <div className="min-h-[300px] flex flex-col">
          <div className="h-48 w-full bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </Card>

      {/* Button skeleton */}
      <div className="mt-6 flex justify-center">
        <div className="h-12 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  )
}
