import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function OrgAnalyticsLoading() {
  return (
    <SkeletonGroup className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton h="h-7" w="w-56" className="mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} h="h-20" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
      <Skeleton h="h-48" className="rounded-lg border border-slate-200 dark:border-slate-700 mb-6" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} h="h-14" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </SkeletonGroup>
  )
}
