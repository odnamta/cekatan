import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function EditCardLoading() {
  return (
    <SkeletonGroup className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton h="h-4" w="w-24" className="mb-4" />
      <Skeleton h="h-7" w="w-32" className="mb-6" />
      <div className="space-y-4">
        <Skeleton h="h-24" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        <Skeleton h="h-24" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        <Skeleton h="h-10" w="w-32" className="rounded-lg" />
      </div>
    </SkeletonGroup>
  )
}
