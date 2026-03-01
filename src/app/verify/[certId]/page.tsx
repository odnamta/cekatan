import { headers } from 'next/headers'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ certId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certId } = await params
  return {
    title: `Sertifikat ${certId.toUpperCase()} — Cekatan`,
  }
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { certId } = await params

  if (!certId || certId.length < 6 || certId.length > 36 || !/^[a-zA-Z0-9-]+$/.test(certId)) {
    return <InvalidCertificate message="ID sertifikat tidak valid" />
  }

  // Rate limit by IP to prevent brute-force enumeration
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = await checkRateLimit(`cert-verify:${ip}`, RATE_LIMITS.standard)
  if (!rl.allowed) {
    return <InvalidCertificate message="Terlalu banyak permintaan. Coba lagi nanti." />
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
    return <InvalidCertificate message="Sertifikat tidak ditemukan atau tidak valid" />
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
  let orgName = 'Organisasi'
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
            <p className="font-semibold text-green-800 dark:text-green-300">Sertifikat Terverifikasi</p>
            <p className="text-sm text-green-600 dark:text-green-400">Sertifikat ini asli dan diterbitkan oleh Cekatan.</p>
          </div>
        </div>

        {/* Certificate details */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kandidat</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {profile?.full_name || profile?.email || 'Tidak diketahui'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Asesmen</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {assessment?.title || 'Asesmen'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Skor</p>
              <p className="text-2xl font-bold text-green-600">{session.score}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Skor Lulus</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{assessment?.pass_score ?? 0}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Organisasi</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{orgName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Selesai</p>
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
            Diverifikasi oleh Cekatan
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
            <p className="font-semibold text-red-800 dark:text-red-300">Sertifikat Tidak Ditemukan</p>
            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
          </div>
        </div>
        <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
          <p className="mb-2">ID sertifikat yang Anda masukkan tidak dapat diverifikasi.</p>
          <p className="text-sm">Periksa kembali ID dan coba lagi, atau hubungi organisasi penerbit.</p>
        </div>
      </div>
    </div>
  )
}
