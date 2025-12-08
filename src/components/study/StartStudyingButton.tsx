'use client'

import { Button } from '@/components/ui/Button'
import { Play, CheckCircle } from 'lucide-react'

export interface StartStudyingButtonProps {
  dueCount: number
  onClick: () => void
  isLoading?: boolean
}

/**
 * StartStudyingButton Component
 * Primary CTA for starting global study sessions from dashboard.
 * Shows due count when > 0, "All caught up!" when 0.
 * 
 * **Feature: v11.5-global-study-stabilization**
 * **Validates: Requirements 1.1, 1.2**
 */
export function StartStudyingButton({
  dueCount,
  onClick,
  isLoading = false,
}: StartStudyingButtonProps) {
  const isDisabled = dueCount === 0

  if (isDisabled) {
    return (
      <Button
        size="lg"
        variant="secondary"
        disabled
        className="w-full min-h-[44px] text-lg"
      >
        <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
        All caught up!
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      onClick={onClick}
      loading={isLoading}
      className="w-full min-h-[44px] text-lg"
    >
      <Play className="w-5 h-5 mr-2" />
      Start Studying ({dueCount} due)
    </Button>
  )
}
