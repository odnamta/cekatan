'use client'

import { Trash2, FolderInput, Download, X } from 'lucide-react'

interface BulkActionsBarProps {
  selectedCount: number
  onDelete: () => void
  onMove: () => void
  onExport: () => void
  onClearSelection: () => void
}

/**
 * BulkActionsBar - Sticky bar for bulk card operations
 * Requirements: C.2, C.3
 */
export function BulkActionsBar({
  selectedCount,
  onDelete,
  onMove,
  onExport,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="sticky top-0 z-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
        {selectedCount} card{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onMove}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <FolderInput className="w-4 h-4" />
          Move to...
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
        <button
          onClick={onClearSelection}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
