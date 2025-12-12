'use client'

import { Plus, Trash2 } from 'lucide-react'
import { MCQ_LIMITS } from '@/lib/constants'

/**
 * V12: MCQOptionsEditor Props
 * Reusable component for editing MCQ options and correct answer selection.
 */
export interface MCQOptionsEditorProps {
  options: string[]
  correctIndex: number
  onChange: (options: string[], correctIndex: number) => void
  disabled?: boolean
  /** Compact mode for batch review (smaller inputs) */
  compact?: boolean
}

/**
 * V12: MCQOptionsEditor - Unified MCQ options editor component
 * 
 * Reusable component for editing MCQ options across:
 * - BatchDraftCard (batch review)
 * - EditCardForm (single card edit)
 * - CardEditorPanel (slide-over editor)
 * 
 * **Feature: v12-quality-scanner-unified-editor**
 * **Requirements: FR-4.1, FR-4.2, FR-4.3, FR-4.4, FR-4.5, FR-4.6**
 * 
 * Behavior:
 * - Renders current options as editable inputs
 * - Add option button (disabled at MCQ_LIMITS.maxOptions)
 * - Remove option button per row (disabled at MCQ_LIMITS.minOptions)
 * - Radio for correct option selection
 * - Auto-adjusts correctIndex if selected option is removed
 * 
 * Styling:
 * - Mobile-first (375px viewport)
 * - Clinical Glass aesthetic
 * - Touch-friendly (44px min tap targets)
 * - active:scale-95 on buttons
 */
export function MCQOptionsEditor({
  options,
  correctIndex,
  onChange,
  disabled = false,
  compact = false,
}: MCQOptionsEditorProps) {
  const canAddOption = options.length < MCQ_LIMITS.maxOptions
  const canRemoveOption = options.length > MCQ_LIMITS.minOptions

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    onChange(newOptions, correctIndex)
  }

  const handleCorrectIndexChange = (index: number) => {
    onChange(options, index)
  }

  const handleAddOption = () => {
    if (canAddOption) {
      onChange([...options, ''], correctIndex)
    }
  }

  const handleRemoveOption = (index: number) => {
    if (canRemoveOption) {
      const newOptions = options.filter((_, i) => i !== index)
      // Adjust correctIndex if needed
      let newCorrectIndex = correctIndex
      if (index === correctIndex) {
        // Removed the correct option, default to first
        newCorrectIndex = 0
      } else if (index < correctIndex) {
        // Removed an option before the correct one, shift down
        newCorrectIndex = correctIndex - 1
      }
      // Ensure correctIndex is within bounds
      newCorrectIndex = Math.min(newCorrectIndex, newOptions.length - 1)
      newCorrectIndex = Math.max(newCorrectIndex, 0)
      onChange(newOptions, newCorrectIndex)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Enter → add new option (if allowed)
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      if (canAddOption) {
        handleAddOption()
      }
    }
  }

  // Styling based on compact mode
  const inputPadding = compact ? 'px-2 py-1' : 'px-3 py-2'
  const inputText = compact ? 'text-sm' : 'text-base'
  const labelText = compact ? 'text-xs' : 'text-sm'
  const buttonSize = compact ? 'p-1.5' : 'p-2'
  const radioSize = compact ? 'w-3 h-3' : 'w-4 h-4'
  const letterWidth = compact ? 'w-4' : 'w-6'
  const gap = compact ? 'gap-1.5' : 'gap-2'

  return (
    <div className="space-y-2">
      {/* Options list */}
      {options.map((option, index) => (
        <div key={index} className={`flex items-center ${gap}`}>
          {/* Radio for correct answer */}
          <input
            type="radio"
            checked={correctIndex === index}
            onChange={() => handleCorrectIndexChange(index)}
            disabled={disabled}
            className={`${radioSize} text-blue-600 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed`}
            aria-label={`Mark option ${String.fromCharCode(65 + index)} as correct`}
          />
          
          {/* Option letter */}
          <span className={`${labelText} font-medium text-slate-600 dark:text-slate-400 ${letterWidth} flex-shrink-0`}>
            {String.fromCharCode(65 + index)}.
          </span>
          
          {/* Option input */}
          <input
            type="text"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={disabled}
            placeholder={`Option ${String.fromCharCode(65 + index)}`}
            className={`flex-1 ${inputPadding} ${inputText} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          
          {/* Remove button */}
          {canRemoveOption && (
            <button
              type="button"
              onClick={() => handleRemoveOption(index)}
              disabled={disabled}
              className={`${buttonSize} text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800`}
              title="Remove option"
              aria-label={`Remove option ${String.fromCharCode(65 + index)}`}
            >
              <Trash2 className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            </button>
          )}
        </div>
      ))}

      {/* Add option button */}
      {canAddOption && (
        <button
          type="button"
          onClick={handleAddOption}
          disabled={disabled}
          className={`flex items-center ${gap} ${labelText} text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${inputPadding} rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20`}
        >
          <Plus className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          <span>Add Option</span>
        </button>
      )}

      {/* Helper text */}
      {!compact && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Min {MCQ_LIMITS.minOptions}, max {MCQ_LIMITS.maxOptions} options. Press Enter to add.
        </p>
      )}
    </div>
  )
}
