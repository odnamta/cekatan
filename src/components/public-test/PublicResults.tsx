'use client'

import { CheckCircle2, XCircle, Target, Trophy, Clock } from 'lucide-react'

interface Props {
  code: string
  data: {
    score: number
    passed: boolean
    total: number
    correct: number
    assessmentTitle: string
    orgName: string
    timeLimitMinutes: number
    passScore: number
    completedAt: string | null
    certificateUrl: string | null
  }
}

export function PublicResults({ code: _code, data }: Props) {
  const {
    score,
    passed,
    total,
    correct,
    assessmentTitle,
    orgName,
    timeLimitMinutes,
    passScore,
    certificateUrl,
  } = data

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Org name */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {orgName}
        </p>

        {/* Assessment title */}
        <h1 className="text-center text-xl font-bold text-gray-900 dark:text-gray-100">
          {assessmentTitle}
        </h1>

        {/* Score card */}
        <div
          className={`rounded-xl p-8 text-center ${
            passed
              ? 'bg-green-50 dark:bg-green-950'
              : 'bg-red-50 dark:bg-red-950'
          }`}
        >
          {passed ? (
            <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="mx-auto mb-3 h-16 w-16 text-red-600 dark:text-red-400" />
          )}

          <p className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {score}%
          </p>

          <p
            className={`text-lg font-semibold tracking-wide ${
              passed
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {passed ? 'LULUS' : 'TIDAK LULUS'}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
            <Target className="mx-auto mb-1.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {correct}/{total}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Benar</p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
            <Trophy className="mx-auto mb-1.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {passScore}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Nilai Lulus
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
            <Clock className="mx-auto mb-1.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {timeLimitMinutes}m
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Batas Waktu
            </p>
          </div>
        </div>

        {/* Certificate download button */}
        {passed && certificateUrl && (
          <a
            href={certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 active:scale-95 transition"
          >
            Unduh Sertifikat
          </a>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Hasil ini telah dicatat oleh {orgName}
        </p>
      </div>
    </div>
  )
}
