'use client'

import { Button } from '@/components/ui/Button'

export interface FlashcardProps {
  front: string
  back: string
  imageUrl?: string | null
  isRevealed: boolean
  onReveal: () => void
}

/**
 * Flashcard component for displaying card front/back during study.
 * Requirements: 5.2, 5.3, 5.6
 */
export function Flashcard({ front, back, imageUrl, isRevealed, onReveal }: FlashcardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card container */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 min-h-[300px] flex flex-col">
        {/* Front content - always visible */}
        <div className="flex-1">
          {/* Image if present (Requirement 5.6) */}
          {imageUrl && (
            <div className="mb-4">
              <img
                src={imageUrl}
                alt="Card image"
                className="max-w-full max-h-48 rounded-lg object-contain mx-auto"
              />
            </div>
          )}
          
          {/* Front text */}
          <div className="text-lg text-slate-100 whitespace-pre-wrap">
            {front}
          </div>
        </div>

        {/* Divider and back content - only when revealed (Requirement 5.3) */}
        {isRevealed && (
          <>
            <div className="my-6 border-t border-slate-600" />
            <div className="text-lg text-slate-300 whitespace-pre-wrap">
              {back}
            </div>
          </>
        )}
      </div>

      {/* Reveal button - only when not revealed (Requirement 5.2) */}
      {!isRevealed && (
        <div className="mt-6 flex justify-center">
          <Button onClick={onReveal} size="lg">
            Reveal Answer
          </Button>
        </div>
      )}
    </div>
  )
}
