'use client'

/**
 * Exam modal dialogs: Tab switch warning, time warning, mobile navigation, review summary.
 * Extracted from take/page.tsx for maintainability (#174).
 */

import { AlertTriangle, Clock, CheckCircle2, Flag } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type QuestionData = {
  cardTemplateId: string
  stem: string
  options: string[]
  optionMap: number[]
  selectedIndex: number | null
  answered: boolean
  flagged: boolean
}

// --- Tab Switch Warning ---

interface TabWarningDialogProps {
  tabSwitchCount: number
  fullscreenExited: boolean
  onClose: () => void
  onReenterFullscreen: () => void
}

export function TabWarningDialog({
  tabSwitchCount,
  fullscreenExited,
  onClose,
  onReenterFullscreen,
}: TabWarningDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="tab-warning-title">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-amber-500" aria-hidden="true" />
        <h3 id="tab-warning-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Tab Switch Detected
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
          Leaving the exam window has been recorded.
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
          Violations: {tabSwitchCount}
        </p>
        <div className="flex items-center gap-2 justify-center">
          <Button size="sm" onClick={onClose}>
            Return to Exam
          </Button>
          {fullscreenExited && !document.fullscreenElement && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onReenterFullscreen}
            >
              Re-enter Fullscreen
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Time Warning ---

interface TimeWarningDialogProps {
  onClose: () => void
}

export function TimeWarningDialog({ onClose }: TimeWarningDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="time-warning-title">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl text-center">
        <Clock className="h-10 w-10 mx-auto mb-3 text-red-500" aria-hidden="true" />
        <h3 id="time-warning-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Time Almost Up!
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Less than 30 seconds remaining. Your exam will be auto-submitted when time runs out.
        </p>
        <Button size="sm" onClick={onClose}>
          Continue
        </Button>
      </div>
    </div>
  )
}

// --- Mobile Question Navigation ---

interface MobileNavDialogProps {
  questions: QuestionData[]
  currentIndex: number
  onSelectQuestion: (index: number) => void
  onClose: () => void
}

export function MobileNavDialog({ questions, currentIndex, onSelectQuestion, onClose }: MobileNavDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Question navigation">
      <div className="bg-white dark:bg-slate-800 rounded-t-xl sm:rounded-xl p-4 w-full sm:max-w-sm mx-0 sm:mx-4 shadow-xl max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Jump to Question
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
            aria-label="Close navigation"
          >
            &times;
          </button>
        </div>
        <div className="flex items-center gap-3 mb-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> answered</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> flagged</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> unanswered</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectQuestion(idx)
                onClose()
              }}
              className={`relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : q.flagged
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-400'
                    : q.answered
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              } active:scale-95`}
            >
              {idx + 1}
              {q.flagged && (
                <Flag className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-500" fill="currentColor" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Review Summary ---

interface ReviewSummaryDialogProps {
  questions: QuestionData[]
  answeredCount: number
  completing: boolean
  onSelectQuestion: (index: number) => void
  onClose: () => void
  onSubmit: () => void
}

export function ReviewSummaryDialog({
  questions,
  answeredCount,
  completing,
  onSelectQuestion,
  onClose,
  onSubmit,
}: ReviewSummaryDialogProps) {
  const flaggedCount = questions.filter((q) => q.flagged).length
  const unansweredCount = questions.length - answeredCount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="review-title">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
        <h3 id="review-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Review Before Submitting
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-slate-600 dark:text-slate-400">{answeredCount} answered</span>
          </div>
          {unansweredCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="text-slate-600 dark:text-slate-400">{unansweredCount} unanswered</span>
            </div>
          )}
          {flaggedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-600 dark:text-slate-400">{flaggedCount} flagged</span>
            </div>
          )}
        </div>

        {/* Question grid */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mb-4">
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectQuestion(idx)
                onClose()
              }}
              className={`relative w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                q.flagged
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-400'
                  : q.answered
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              } hover:ring-2 hover:ring-blue-400`}
              aria-label={`Question ${idx + 1}: ${q.answered ? 'answered' : 'unanswered'}${q.flagged ? ', flagged' : ''}`}
            >
              {idx + 1}
              {q.flagged && (
                <Flag className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-500" fill="currentColor" />
              )}
            </button>
          ))}
        </div>

        {unansweredCount > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
            {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''} will be marked incorrect.
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Back to Exam
          </Button>
          <Button
            size="sm"
            loading={completing}
            onClick={onSubmit}
            className="flex-1"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}
