import { Card } from '@/components/ui/Card'

/**
 * Loading skeleton for the deck detail page.
 */
export default function DeckLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Action buttons skeleton */}
      <div className="flex gap-3 mb-6 animate-pulse">
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* Cards list skeleton */}
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
