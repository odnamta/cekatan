'use client'

/**
 * QR Code modal for sharing assessment public links.
 * Extracted from assessments/page.tsx for maintainability (#174).
 */

import type { AssessmentWithDeck } from '@/types/database'

interface QRCodeModalProps {
  assessment: AssessmentWithDeck
  qrDataUrl: string | null
  onClose: () => void
}

export function QRCodeModal({ assessment, qrDataUrl, onClose }: QRCodeModalProps) {
  if (!assessment.public_code) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-lg">QR Code</h3>
        <p className="text-sm text-muted-foreground">{assessment.title}</p>
        <div className="flex justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="rounded-lg"
              width={200}
              height={200}
            />
          ) : (
            <div className="w-[200px] h-[200px] animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg" />
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          {typeof window !== 'undefined' ? window.location.origin : ''}/t/{assessment.public_code}
        </p>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
        >
          Tutup
        </button>
      </div>
    </div>
  )
}
