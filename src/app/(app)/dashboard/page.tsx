export const metadata = { title: 'Dasbor' }

import { getUser } from '@/lib/supabase/server'
import { OrgStatsCard } from '@/components/dashboard/OrgStatsCard'
import { CandidateAssessmentCard } from '@/components/dashboard/CandidateAssessmentCard'
import { MySkillProfile } from '@/components/skills/MySkillProfile'
import { getSetupChecklistData } from '@/actions/analytics-actions'
import { SetupChecklist } from '@/components/dashboard/SetupChecklist'

/**
 * Dashboard Page - React Server Component
 * Assessment-focused dashboard: onboarding checklist, org stats, candidate assessments, skills profile.
 * Study-mode features (heatmap, library, weakest concepts) are accessible via My Library.
 */
export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    return null // Layout handles redirect
  }

  // Fetch setup checklist data for onboarding
  const checklistResult = await getSetupChecklistData()
  const checklistItems = (checklistResult.ok && checklistResult.data?.items) ? checklistResult.data.items : []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* V23: Setup Checklist */}
      {checklistItems.length > 0 && (
        <SetupChecklist items={checklistItems} />
      )}

      {/* V13: Org Stats for Creators */}
      <OrgStatsCard />

      {/* V13 Phase 8: Assessment Overview for Candidates */}
      <CandidateAssessmentCard />

      {/* V19: My Skills Radar Chart */}
      <MySkillProfile />
    </div>
  )
}
