import { Card } from '@/components/ui/Card'
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

/**
 * Loading skeleton for the global study session page.
 */
export default function GlobalStudyLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <SkeletonGroup className="mb-6">
        <Skeleton h="h-8" w="w-48" className="mb-2" />
        <Skeleton h="h-4" w="w-32" />
      </SkeletonGroup>

      <SkeletonGroup className="mb-6">
        <Skeleton h="h-2" className="w-full rounded-full" />
      </SkeletonGroup>

      <Card>
        <SkeletonGroup>
          <div className="min-h-[300px] flex flex-col">
            <Skeleton h="h-6" className="w-3/4 mb-4" />
            <div className="space-y-3 flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} h="h-16" className="w-full rounded-lg" />
              ))}
            </div>
          </div>
        </SkeletonGroup>
      </Card>
    </div>
  )
}
