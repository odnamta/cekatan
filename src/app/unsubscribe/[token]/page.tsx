import { verifyUnsubscribeToken } from '@/lib/email-dispatch'
import type { Metadata } from 'next'
import { UnsubscribeForm } from './unsubscribe-form'

export const metadata: Metadata = {
  title: 'Berhenti Berlangganan',
}

/**
 * Unsubscribe page — shows confirmation UI on GET (no mutation).
 * The actual database write happens via server action on button click.
 * Token is HMAC-signed (payload.hmac).
 */
export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Verify HMAC token on page load — but do NOT mutate the database
  let tokenValid = false
  try {
    const userId = verifyUnsubscribeToken(token)
    tokenValid = !!userId && userId.length === 36
  } catch {
    tokenValid = false
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* Branding */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Cekatan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform Asesmen & Pemetaan Kompetensi
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          {tokenValid ? (
            <UnsubscribeForm token={token} />
          ) : (
            <InvalidTokenMessage />
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Cekatan
        </p>
      </div>
    </div>
  )
}

function InvalidTokenMessage() {
  return (
    <>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-amber-600 dark:text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
        Terjadi Kesalahan
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Tidak dapat memproses permintaan berhenti berlangganan.
        Link mungkin sudah tidak valid atau sudah kedaluwarsa.
      </p>
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Untuk mengelola preferensi email, silakan login ke aplikasi Cekatan
          dan buka halaman{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">Profile</span>.
        </p>
      </div>
    </>
  )
}
