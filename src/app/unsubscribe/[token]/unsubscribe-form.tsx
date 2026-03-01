'use client'

import { useState } from 'react'
import { processUnsubscribe } from './actions'

type State = 'idle' | 'loading' | 'success' | 'error'

export function UnsubscribeForm({ token }: { token: string }) {
  const [state, setState] = useState<State>('idle')

  async function handleUnsubscribe() {
    setState('loading')
    try {
      const result = await processUnsubscribe(token)
      setState(result.success ? 'success' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Berhasil Berhenti Berlangganan
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Anda telah berhenti berlangganan email notifikasi dari Cekatan.
          Anda tidak akan menerima email notifikasi lagi.
        </p>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Untuk mengaktifkan kembali, buka halaman{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">Profil</span>{' '}
            di aplikasi Cekatan.
          </p>
        </div>
      </>
    )
  }

  if (state === 'error') {
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
          Silakan coba lagi atau hubungi administrator.
        </p>
        <button
          onClick={handleUnsubscribe}
          className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-95 transition"
        >
          Coba Lagi
        </button>
      </>
    )
  }

  // idle or loading
  return (
    <>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
        Berhenti Berlangganan Email
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Apakah Anda yakin ingin berhenti menerima email notifikasi dari Cekatan?
      </p>
      <button
        onClick={handleUnsubscribe}
        disabled={state === 'loading'}
        className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-95 transition disabled:opacity-50 disabled:active:scale-100"
      >
        {state === 'loading' ? 'Memproses...' : 'Konfirmasi Berhenti Langganan'}
      </button>
    </>
  )
}
