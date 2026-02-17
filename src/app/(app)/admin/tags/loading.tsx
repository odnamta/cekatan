import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function TagsLoading() {
  return (
    <SkeletonGroup className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton h="h-7" w="w-40" className="mb-6" />
      <div className="flex gap-2 mb-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} h="h-9" w="w-24" className="rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} h="h-12" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </SkeletonGroup>
  )
}
