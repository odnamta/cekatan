import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function OrgSettingsLoading() {
  return (
    <SkeletonGroup className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton h="h-7" w="w-48" className="mb-6" />
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} h="h-32" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </SkeletonGroup>
  )
}
