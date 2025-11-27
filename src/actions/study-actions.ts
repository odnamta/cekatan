'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getUser } from '@/lib/supabase/server'
import { ratingSchema } from '@/lib/validations'
import { calculateNextReview } from '@/lib/sm2'
import type { NextCardResult } from '@/types/actions'
import type { Card } from '@/types/database'

/**
 * Server Action for rating a card during study.
 * Integrates SM-2 algorithm for card updates and returns next due card.
 * Requirements: 5.4
 */
export async function rateCardAction(
  cardId: string,
  rating: 1 | 2 | 3 | 4
): Promise<NextCardResult> {
  // Server-side Zod validation
  const validationResult = ratingSchema.safeParse({ cardId, rating })
  
  if (!validationResult.success) {
    return { success: false, error: 'Invalid rating data' }
  }

  // Get authenticated user
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const supabase = await createSupabaseServerClient()

  // Fetch the card with deck info to verify ownership
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select(`
      *,
      decks!inner(user_id)
    `)
    .eq('id', cardId)
    .single()

  if (cardError || !card) {
    return { success: false, error: 'Card not found or access denied' }
  }

  // Calculate new SM-2 values
  const sm2Result = calculateNextReview({
    interval: card.interval,
    easeFactor: card.ease_factor,
    rating,
  })

  // Update the card with new SM-2 values
  const { error: updateError } = await supabase
    .from('cards')
    .update({
      interval: sm2Result.interval,
      ease_factor: sm2Result.easeFactor,
      next_review: sm2Result.nextReview.toISOString(),
    })
    .eq('id', cardId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Fetch next due card from the same deck
  const now = new Date().toISOString()
  const { data: dueCards, error: dueError } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', card.deck_id)
    .lte('next_review', now)
    .neq('id', cardId) // Exclude the card we just rated
    .order('next_review', { ascending: true })
    .limit(1)

  if (dueError) {
    return { success: false, error: dueError.message }
  }

  // Get remaining count of due cards
  const { count, error: countError } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('deck_id', card.deck_id)
    .lte('next_review', now)
    .neq('id', cardId)

  if (countError) {
    return { success: false, error: countError.message }
  }

  // Revalidate study page
  revalidatePath(`/study/${card.deck_id}`)

  const nextCard = dueCards && dueCards.length > 0 ? (dueCards[0] as Card) : null

  return {
    success: true,
    nextCard,
    remainingCount: count || 0,
  }
}

/**
 * Fetches due cards for a deck.
 * Requirements: 5.1
 */
export async function getDueCardsForDeck(deckId: string): Promise<{
  cards: Card[]
  error?: string
}> {
  const user = await getUser()
  if (!user) {
    return { cards: [], error: 'Authentication required' }
  }

  const supabase = await createSupabaseServerClient()

  // Verify user owns the deck
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (deckError || !deck) {
    return { cards: [], error: 'Deck not found or access denied' }
  }

  // Fetch due cards (next_review <= now)
  const now = new Date().toISOString()
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .lte('next_review', now)
    .order('next_review', { ascending: true })

  if (cardsError) {
    return { cards: [], error: cardsError.message }
  }

  return { cards: (cards || []) as Card[] }
}
