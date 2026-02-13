import { Card } from '@/components/ui/Card'
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

/**
 * Loading skeleton for the deck detail page.
 */
export default function DeckLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SkeletonGroup className="mb-6">
        <Skeleton h="h-4" w="w-24" className="mb-2" />
        <Skeleton h="h-8" w="w-48" />
      </SkeletonGroup>

      <SkeletonGroup className="flex gap-3 mb-6">
        <Skeleton h="h-10" w="w-32" className="rounded-lg" />
        <Skeleton h="h-10" w="w-32" className="rounded-lg" />
      </SkeletonGroup>

      <SkeletonGroup className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Skeleton h="h-5" className="w-3/4 mb-2" />
                <Skeleton h="h-4" className="w-1/2" />
              </div>
              <Skeleton h="h-6" w="w-16" />
            </div>
          </Card>
        ))}
      </SkeletonGroup>
    </div>
  )
}
