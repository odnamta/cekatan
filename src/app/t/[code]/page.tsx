import { PublicTestLanding } from '@/components/public-test/PublicTestLanding'
import { getPublicAssessment } from '@/actions/public-assessment-actions'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ code: string }>
}

export default async function PublicTestPage({ params }: Props) {
  const { code } = await params
  const result = await getPublicAssessment(code)

  if (!result.ok || !result.data) {
    notFound()
  }

  const { assessment, orgName } = result.data

  // Sanitize access_code: never expose the actual code to the client.
  // Replace with 'required' if an access code exists, null otherwise.
  const sanitizedAssessment = {
    ...assessment,
    access_code: assessment.access_code ? 'required' as const : null,
  }

  return (
    <PublicTestLanding
      code={code}
      assessment={sanitizedAssessment}
      orgName={orgName}
    />
  )
}
