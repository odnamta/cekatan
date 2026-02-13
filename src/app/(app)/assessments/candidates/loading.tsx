import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function CandidatesLoading() {
  return (
    <SkeletonGroup className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton h="h-4" w="w-32" className="mb-6" />
      <Skeleton h="h-7" w="w-48" className="mb-1" />
      <Skeleton h="h-4" w="w-36" className="mb-6" />
      <Skeleton h="h-10" className="w-full rounded-lg mb-4" />
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} h="h-16" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </SkeletonGroup>
  )
}
