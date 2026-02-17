import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton'

export default function CertificateLoading() {
  return (
    <SkeletonGroup className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton h="h-7" w="w-40" className="mb-6" />
      <Skeleton h="h-[400px]" className="rounded-lg border border-slate-200 dark:border-slate-700" />
    </SkeletonGroup>
  )
}
