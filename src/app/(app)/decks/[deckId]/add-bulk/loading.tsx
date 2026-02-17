import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function BulkImportLoading() {
  return (
    <SkeletonGroup className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton h="h-4" w="w-32" className="mb-4" />
      <Skeleton h="h-7" w="w-40" className="mb-6" />
      <Skeleton h="h-48" className="rounded-lg border border-slate-200 dark:border-slate-700" />
    </SkeletonGroup>
  )
}
