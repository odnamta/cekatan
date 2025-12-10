'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Play, CheckCircle } from 'lucide-react'
import { buildStudyUrl } from '@/lib/url-utils'

export interface StartStudyingButtonProps {
  dueCount: number
  onClick?: () => void
  isLoading?: boolean
  tagIds?: string[]  // V11.7: Optional tag filter
}

/**
 * StartStudyingButton Component
 * Primary CTA for starting global study sessions from dashboard.
 * Shows due count when > 0, "All caught up!" when 0.
 * 
 * V11.7: Added tagIds prop for tag-filtered study sessions.
 * 
 * **Feature: v11.7-companion-dashboard-tag-filtered-study**
 * **Validates: Requirements 2.1, 3.4, 3.5**
 */
export function StartStudyingButton({
  dueCount,
  onClick,
  isLoading = false,
  tagIds,
}: StartStudyingButtonProps) {
  const router = useRouter()
  const isDisabled = dueCount === 0

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // V11.7: Navigate with tag filter if provided
      const url = buildStudyUrl(tagIds)
      router.push(url)
    }
  }

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
      onClick={handleClick}
      loading={isLoading}
      className="w-full min-h-[44px] text-lg"
    >
      <Play className="w-5 h-5 mr-2" />
      Start Studying ({dueCount} due)
    </Button>
  )
}
