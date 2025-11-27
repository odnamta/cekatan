'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flashcard } from '@/components/study/Flashcard'
import { RatingButtons } from '@/components/study/RatingButtons'
import { rateCardAction } from '@/actions/study-actions'
import type { Card } from '@/types/database'

interface StudySessionProps {
  initialCards: Card[]
  deckId: string
}

/**
 * Client component for managing the interactive study session.
 * Handles card reveal state and rating flow.
 */
export function StudySession({ initialCards, deckId }: StudySessionProps) {
  const [currentCard, setCurrentCard] = useState<Card | null>(initialCards[0] || null)
  const [remainingCount, setRemainingCount] = useState(initialCards.length)
  const [isRevealed, setIsRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return

    setError(null)
    const result = await rateCardAction(currentCard.id, rating)

    if (!result.success) {
      setError(result.error)
      return
    }

    // Move to next card or show completion
    if (result.nextCard) {
      setCurrentCard(result.nextCard)
      setRemainingCount(result.remainingCount)
      setIsRevealed(false)
    } else {
      setIsComplete(true)
      setCurrentCard(null)
      setRemainingCount(0)
    }
  }

  // Session complete state
  if (isComplete || !currentCard) {
    return (
      <div className="text-center py-12 bg-slate-800/30 border border-slate-700 rounded-xl">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">
          Study Session Complete!
        </h2>
        <p className="text-slate-400 mb-6">
          You&apos;ve reviewed all due cards in this deck.
        </p>
        <Link 
          href={`/decks/${deckId}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Deck
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-6 text-center">
        <span className="text-sm text-slate-400">
          {remainingCount} {remainingCount === 1 ? 'card' : 'cards'} remaining
        </span>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Flashcard */}
      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
        imageUrl={currentCard.image_url}
        isRevealed={isRevealed}
        onReveal={handleReveal}
      />

      {/* Rating buttons - only show when revealed */}
      {isRevealed && (
        <RatingButtons cardId={currentCard.id} onRate={handleRate} />
      )}
    </div>
  )
}
