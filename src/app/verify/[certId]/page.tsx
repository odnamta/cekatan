import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ certId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certId } = await params
  return {
    title: `Certificate ${certId.toUpperCase()} — Cekatan`,
  }
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { certId } = await params

  if (!certId || certId.length < 6) {
    return <InvalidCertificate message="Invalid certificate ID" />
  }

  const supabase = await createSupabaseServiceClient()

  // Find session where ID starts with certId
  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, score, passed, completed_at, certificate_url, assessment_id, user_id')
    .ilike('id', `${certId}%`)
    .eq('status', 'completed')
    .eq('passed', true)
    .single()

  if (!session) {
    return <InvalidCertificate message="Certificate not found or not valid" />
  }

  // Fetch assessment details
  const { data: assessment } = await supabase
    .from('assessments')
    .select('title, pass_score, org_id')
    .eq('id', session.assessment_id)
    .single()

  // Fetch candidate profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', session.user_id)
    .single()

  // Fetch org name
  let orgName = 'Organization'
  if (assessment) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', assessment.org_id)
      .single()
    if (org) orgName = org.name
  }

  const completedDate = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        {/* Verified badge */}
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 px-6 py-4 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">Certificate Verified</p>
            <p className="text-sm text-green-600 dark:text-green-400">This certificate is authentic and issued by Cekatan.</p>
          </div>
        </div>

        {/* Certificate details */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Candidate</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {profile?.full_name || profile?.email || 'Unknown'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assessment</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {assessment?.title || 'Assessment'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Score</p>
              <p className="text-2xl font-bold text-green-600">{session.score}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pass Score</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{assessment?.pass_score ?? 0}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Organization</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{orgName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Completed</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{completedDate}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-mono">
            ID: {certId.toUpperCase()}
          </p>
          <p className="text-xs text-slate-400">
            Verified by Cekatan
          </p>
        </div>
      </div>
    </div>
  )
}

function InvalidCertificate({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-4 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">Certificate Not Found</p>
            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
          </div>
        </div>
        <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
          <p className="mb-2">The certificate ID you provided could not be verified.</p>
          <p className="text-sm">Please check the ID and try again, or contact the issuing organization.</p>
        </div>
      </div>
    </div>
  )
}
