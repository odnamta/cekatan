'use client'

import { useState, useSyncExternalStore } from 'react'
import { getAIMode, setAIMode, type AIMode } from '@/lib/ai-mode-storage'

const subscribeMounted = () => () => {}
const getMountedSnapshot = () => true
const getServerMountedSnapshot = () => false

interface ModeToggleProps {
  value?: AIMode
  onChange?: (mode: AIMode) => void
}

/**
 * ModeToggle - Segmented control for AI mode selection
 *
 * V6.2: Brain Toggle feature - Extract (Q&A) vs Generate (Textbook)
 * Persists selection to localStorage
 */
export function ModeToggle({ value, onChange }: ModeToggleProps) {
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getServerMountedSnapshot)
  const [mode, setMode] = useState<AIMode>('extract')
  const [hasMountLoaded, setHasMountLoaded] = useState(false)

  // Load saved mode after mount using React 19 pattern
  if (mounted && !hasMountLoaded) {
    setHasMountLoaded(true)
    const savedMode = getAIMode()
    if (savedMode !== mode) {
      setMode(savedMode)
    }
  }

  // Sync with controlled value during render
  const [prevValue, setPrevValue] = useState(value)
  if (value !== undefined && value !== prevValue) {
    setPrevValue(value)
    if (mode !== value) {
      setMode(value)
    }
  }

  const handleModeChange = (newMode: AIMode) => {
    setMode(newMode)
    setAIMode(newMode)
    onChange?.(newMode)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
        <div className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm">
          Extract (Q&A)
        </div>
        <div className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 dark:text-slate-400">
          Generate (Textbook)
        </div>
      </div>
    )
  }

  return (
    <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
      <button
        type="button"
        onClick={() => handleModeChange('extract')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === 'extract'
            ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
        title="Extract existing MCQs from Q&A text"
      >
        Extract (Q&A)
      </button>
      <button
        type="button"
        onClick={() => handleModeChange('generate')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === 'generate'
            ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
        title="Generate new MCQs from textbook content"
      >
        Generate (Textbook)
      </button>
    </div>
  )
}
