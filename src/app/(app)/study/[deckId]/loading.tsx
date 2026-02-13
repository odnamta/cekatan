import { Card } from '@/components/ui/Card'
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

/**
 * Loading skeleton for the deck study page.
 */
export default function StudyLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <SkeletonGroup className="mb-6">
        <div className="flex justify-between mb-2">
          <Skeleton h="h-4" w="w-20" />
          <Skeleton h="h-4" w="w-16" />
        </div>
        <Skeleton h="h-2" className="w-full rounded-full" />
      </SkeletonGroup>

      <Card>
        <SkeletonGroup>
          <div className="min-h-[300px] flex flex-col">
            <Skeleton h="h-48" className="w-full rounded-lg mb-4" />
            <Skeleton h="h-6" className="w-3/4 mb-2" />
            <Skeleton h="h-6" className="w-1/2" />
          </div>
        </SkeletonGroup>
      </Card>

      <div className="mt-6 flex justify-center">
        <Skeleton h="h-12" w="w-40" className="rounded-lg" />
      </div>
    </div>
  )
}
