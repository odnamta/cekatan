'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export interface RatingButtonsProps {
  cardId: string
  onRate: (rating: 1 | 2 | 3 | 4) => Promise<void>
}

/**
 * Rating buttons component for study mode.
 * Displays Again, Hard, Good, Easy buttons and connects to rateCardAction.
 * Requirements: 5.4
 */
export function RatingButtons({ cardId, onRate }: RatingButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    setIsLoading(true)
    try {
      await onRate(rating)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      <Button
        variant="secondary"
        onClick={() => handleRate(1)}
        disabled={isLoading}
        className="min-w-[80px] bg-red-900/50 hover:bg-red-800/50 border border-red-700"
      >
        Again
      </Button>
      <Button
        variant="secondary"
        onClick={() => handleRate(2)}
        disabled={isLoading}
        className="min-w-[80px] bg-orange-900/50 hover:bg-orange-800/50 border border-orange-700"
      >
        Hard
      </Button>
      <Button
        variant="secondary"
        onClick={() => handleRate(3)}
        disabled={isLoading}
        className="min-w-[80px] bg-green-900/50 hover:bg-green-800/50 border border-green-700"
      >
        Good
      </Button>
      <Button
        variant="secondary"
        onClick={() => handleRate(4)}
        disabled={isLoading}
        className="min-w-[80px] bg-blue-900/50 hover:bg-blue-800/50 border border-blue-700"
      >
        Easy
      </Button>
    </div>
  )
}
