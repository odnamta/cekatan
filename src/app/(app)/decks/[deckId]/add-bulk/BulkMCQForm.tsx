'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

/**
 * Inline MCQ form component with controlled state from parent.
 * Extracted from BulkImportClient.tsx for maintainability (#174).
 */
export interface BulkMCQFormProps {
  deckId: string
  stem: string
  setStem: (value: string) => void
  options: string[]
  setOptions: React.Dispatch<React.SetStateAction<string[]>>
  correctIndex: number
  setCorrectIndex: (value: number) => void
  explanation: string
  setExplanation: (value: string) => void
  stemRef: React.RefObject<HTMLTextAreaElement | null>
  optionRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  explanationRef: React.RefObject<HTMLTextAreaElement | null>
  sessionTagIds?: string[]
  onSaveSuccess?: () => void
  // V6.6: AI-generated tags
  aiTagNames?: string[]
  onAiTagNamesChange?: (tags: string[]) => void
}

export function BulkMCQForm({
  deckId,
  stem,
  setStem,
  options,
  setOptions,
  correctIndex,
  setCorrectIndex,
  explanation,
  setExplanation,
  stemRef,
  optionRefs,
  explanationRef,
  sessionTagIds = [],
  onSaveSuccess,
  aiTagNames = [],
  onAiTagNamesChange,
}: BulkMCQFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleOptionChange = (index: number, value: string) => {
    setOptions(prev => {
      const newOptions = [...prev]
      newOptions[index] = value
      return newOptions
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('deckId', deckId)
      formData.append('stem', stem)
      formData.append('correctIndex', correctIndex.toString())
      formData.append('explanation', explanation)
      options.forEach((opt, i) => formData.append(`option_${i}`, opt))
      sessionTagIds.forEach((tagId, i) => formData.append(`tagId_${i}`, tagId))

      const { createMCQAction } = await import('@/actions/mcq-actions')
      const result = await createMCQAction({ ok: true }, formData)

      if (result.ok) {
        setMessage({ type: 'success', text: 'MCQ created successfully!' })
        setStem('')
        setOptions(['', '', '', '', ''])
        setCorrectIndex(0)
        setExplanation('')
        onSaveSuccess?.()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create MCQ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Question Stem
        </label>
        <textarea
          ref={stemRef}
          name="stem"
          value={stem}
          onChange={(e) => setStem(e.target.value)}
          placeholder="Enter the question or scenario..."
          className="w-full min-h-[100px] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Answer Options
        </label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              checked={correctIndex === index}
              onChange={() => setCorrectIndex(index)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-6">
              {String.fromCharCode(65 + index)}.
            </span>
            <input
              ref={el => { optionRefs.current[index] = el }}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => {
                  const newOptions = options.filter((_, i) => i !== index)
                  setOptions(newOptions)
                  if (correctIndex >= newOptions.length) {
                    setCorrectIndex(newOptions.length - 1)
                  } else if (correctIndex > index) {
                    setCorrectIndex(correctIndex - 1)
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label={`Remove option ${String.fromCharCode(65 + index)}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {options.length < 5 && (
          <button
            type="button"
            onClick={() => setOptions([...options, ''])}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            + Add Option
          </button>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Min 2, max 5 options (A-E)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Explanation (optional)
        </label>
        <textarea
          ref={explanationRef}
          name="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain why the correct answer is correct..."
          className="w-full min-h-[80px] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* V6.6: AI-generated tags display */}
      {aiTagNames.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            AI Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {aiTagNames.map((tag, index) => (
              <span
                key={`ai-${tag}-${index}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => {
                    const newTags = aiTagNames.filter((_, i) => i !== index)
                    onAiTagNamesChange?.(newTags)
                  }}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                  aria-label={`Remove tag ${tag}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            AI-suggested concept tags (click x to remove)
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding MCQ...' : 'Add MCQ'}
        </Button>
      </div>
    </form>
  )
}
