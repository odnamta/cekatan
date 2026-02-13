import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function ResultsLoading() {
  return (
    <SkeletonGroup className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton h="h-4" w="w-32" className="mb-6" />
      <Skeleton h="h-7" w="w-64" className="mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} h="h-24" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
      <Skeleton h="h-5" w="w-40" className="mb-4" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} h="h-14" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </SkeletonGroup>
  )
}
