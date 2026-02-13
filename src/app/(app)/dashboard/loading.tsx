import { Card } from '@/components/ui/Card'
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

/**
 * Loading skeleton for the dashboard page.
 * Shows placeholder content while data is being fetched.
 */
export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero skeleton */}
      <Card variant="elevated" padding="lg" className="mb-8">
        <SkeletonGroup>
          <Skeleton h="h-8" w="w-64" className="mb-4" />
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Skeleton h="h-10" w="w-24" />
            <Skeleton h="h-8" w="w-px" className="hidden sm:block" />
            <Skeleton h="h-10" w="w-24" />
            <Skeleton h="h-8" w="w-px" className="hidden sm:block" />
            <Skeleton h="h-8" w="w-32" circle />
          </div>
          <Skeleton h="h-12" className="w-full rounded-lg" />
        </SkeletonGroup>
      </Card>

      {/* Heatmap skeleton */}
      <Card className="mb-8">
        <SkeletonGroup>
          <Skeleton h="h-6" w="w-32" className="mb-4" />
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-sm" />
            ))}
          </div>
        </SkeletonGroup>
      </Card>

      {/* Library section skeleton */}
      <SkeletonGroup>
        <Skeleton h="h-8" w="w-24" className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-32">
              <Skeleton h="h-5" className="w-3/4 mb-2" />
              <Skeleton h="h-4" className="w-1/2" />
            </Card>
          ))}
        </div>
      </SkeletonGroup>
    </div>
  )
}
