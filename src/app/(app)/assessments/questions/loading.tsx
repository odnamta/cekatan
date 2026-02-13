import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function QuestionsLoading() {
  return (
    <SkeletonGroup className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton h="h-8" w="w-8" className="rounded-lg" />
        <div>
          <Skeleton h="h-7" w="w-40" className="mb-1" />
          <Skeleton h="h-4" w="w-32" />
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <Skeleton h="h-10" className="flex-1 rounded-lg" />
        <Skeleton h="h-10" w="w-32" className="rounded-lg" />
        <Skeleton h="h-10" w="w-32" className="rounded-lg" />
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} h="h-14" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </SkeletonGroup>
  )
}
