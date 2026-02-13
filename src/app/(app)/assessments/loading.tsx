import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function AssessmentsLoading() {
  return (
    <SkeletonGroup className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton h="h-7" w="w-40" className="mb-2" />
          <Skeleton h="h-4" w="w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton h="h-9" w="w-28" className="rounded-lg" />
          <Skeleton h="h-9" w="w-20" className="rounded-lg" />
        </div>
      </div>
      <Skeleton h="h-10" className="w-full rounded-lg mb-4" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} h="h-24" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </SkeletonGroup>
  )
}
