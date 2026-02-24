import { PublicResults } from '@/components/public-test/PublicResults'
import { getPublicResults } from '@/actions/public-assessment-actions'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ code: string; sessionId: string }>
}

export default async function PublicResultsPage({ params }: Props) {
  const { code, sessionId } = await params
  const result = await getPublicResults(sessionId)

  if (!result.ok || !result.data) {
    notFound()
  }

  return <PublicResults code={code} data={result.data} />
}
