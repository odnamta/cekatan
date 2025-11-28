'use client'

import { useCallback } from 'react'
import { useToast } from '@/components/ui/Toast'
import type { ActionResult } from '@/types/actions'

/**
 * Hook for handling action results with toast notifications.
 * Automatically shows success/error toasts based on action result.
 */
export function useActionToast() {
  const { showToast } = useToast()

  const handleActionResult = useCallback(
    (result: ActionResult, successMessage?: string) => {
      if (result.success) {
        if (successMessage) {
          showToast(successMessage, 'success')
        }
        return true
      } else {
        showToast(result.error || 'Something went wrong', 'error')
        return false
      }
    },
    [showToast]
  )

  const showError = useCallback(
    (message: string) => {
      showToast(message, 'error')
    },
    [showToast]
  )

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, 'success')
    },
    [showToast]
  )

  return { handleActionResult, showError, showSuccess, showToast }
}
