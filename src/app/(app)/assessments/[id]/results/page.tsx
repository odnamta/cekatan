'use client'

/**
 * V13: Assessment Results Page
 *
 * Two modes:
 * 1. With ?sessionId — Candidate view: score card + per-question review
 * 2. Without sessionId — Creator view: aggregate stats + all candidate sessions
 *
 * Sub-components extracted for maintainability (#174):
 * - CandidateResultsView: score card, topic breakdown, study recommendations, per-question review
 * - CreatorResultsView: aggregate stats, score distribution, live monitoring, sessions table
 */

import { useParams, useSearchParams } from 'next/navigation'
import { useOrg } from '@/components/providers/OrgProvider'
import { hasMinimumRole } from '@/lib/org-authorization'
import { usePageTitle } from '@/hooks/use-page-title'
import { CandidateResultsView } from './CandidateResultsView'
import { CreatorResultsView } from './CreatorResultsView'

export default function AssessmentResultsPage() {
  usePageTitle('Hasil Asesmen')
  const { role } = useOrg()
  const params = useParams()
  const searchParams = useSearchParams()
  const assessmentId = params.id as string
  const sessionId = searchParams.get('sessionId')
  const isCreator = hasMinimumRole(role, 'creator')

  // If sessionId is provided, show candidate view. Otherwise show creator view.
  if (sessionId) {
    return <CandidateResultsView assessmentId={assessmentId} sessionId={sessionId} />
  }

  if (isCreator) {
    return <CreatorResultsView assessmentId={assessmentId} />
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center text-slate-500">
      Tidak ada hasil untuk ditampilkan.
    </div>
  )
}
