'use server'

import { createSupabaseServerClient, getUser } from '@/lib/supabase/server'
import type { Card } from '@/types/database'

const BATCH_SIZE = 50
const NEW_CARDS_FALLBACK_LIMIT = 10

/**
 * Result type for getGlobalDueCards
 */
export interface GlobalDueCardsResult {
  success: boolean
  cards: Card[]
  totalDue: number
  hasMoreBatches: boolean
  isNewCardsFallback: boolean
  error?: string
}

/**
 * Result type for getGlobalStats
 */
export interface GlobalStatsResult {
  success: boolean
  totalDueCount: number
  completedToday: number
  currentStreak: number
  hasNewCards: boolean
  error?: string
}

/**
 * Fetches due cards across all user decks for global study session.
 * Orders by next_review ASC, limits to 50 cards per batch.
 * Falls back to new cards if no due cards exist.
 * 
 * Requirements: 2.2, 2.3, 2.4
 */
export async function getGlobalDueCards(batchNumber: number = 0): Promise<GlobalDueCardsResult> {
  const user = await getUser()
  if (!user) {
    return {
      success: false,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
      error: 'Authentication required',
    }
  }

  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()

  // First, get all user's deck IDs
  const { data: decks, error: decksError } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', user.id)

  if (decksError) {
    return {
      success: false,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
      error: decksError.message,
    }
  }

  if (!decks || decks.length === 0) {
    return {
      success: true,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
    }
  }

  const deckIds = decks.map(d => d.id)

  // Get total count of due cards
  const { count: totalDueCount, error: countError } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .in('deck_id', deckIds)
    .lte('next_review', now)

  if (countError) {
    return {
      success: false,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
      error: countError.message,
    }
  }

  const totalDue = totalDueCount || 0

  // If no due cards, fall back to new cards
  if (totalDue === 0) {
    const { data: newCards, error: newCardsError } = await supabase
      .from('cards')
      .select('*')
      .in('deck_id', deckIds)
      .order('created_at', { ascending: true })
      .limit(NEW_CARDS_FALLBACK_LIMIT)

    if (newCardsError) {
      return {
        success: false,
        cards: [],
        totalDue: 0,
        hasMoreBatches: false,
        isNewCardsFallback: false,
        error: newCardsError.message,
      }
    }

    return {
      success: true,
      cards: (newCards || []) as Card[],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: true,
    }
  }

  // Fetch due cards with pagination
  const offset = batchNumber * BATCH_SIZE
  const { data: dueCards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .in('deck_id', deckIds)
    .lte('next_review', now)
    .order('next_review', { ascending: true })
    .range(offset, offset + BATCH_SIZE - 1)

  if (cardsError) {
    return {
      success: false,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
      error: cardsError.message,
    }
  }

  const hasMoreBatches = totalDue > (offset + BATCH_SIZE)

  return {
    success: true,
    cards: (dueCards || []) as Card[],
    totalDue,
    hasMoreBatches,
    isNewCardsFallback: false,
  }
}

/**
 * Fetches global stats for the dashboard hero.
 * Returns totalDueCount, completedToday, currentStreak, and hasNewCards.
 * 
 * Requirements: 1.2, 1.3, 1.4, 1.5
 */
export async function getGlobalStats(): Promise<GlobalStatsResult> {
  const user = await getUser()
  if (!user) {
    return {
      success: false,
      totalDueCount: 0,
      completedToday: 0,
      currentStreak: 0,
      hasNewCards: false,
      error: 'Authentication required',
    }
  }

  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()
  const todayDateStr = new Date().toISOString().split('T')[0]

  // Get all user's deck IDs
  const { data: decks, error: decksError } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', user.id)

  if (decksError) {
    return {
      success: false,
      totalDueCount: 0,
      completedToday: 0,
      currentStreak: 0,
      hasNewCards: false,
      error: decksError.message,
    }
  }

  if (!decks || decks.length === 0) {
    return {
      success: true,
      totalDueCount: 0,
      completedToday: 0,
      currentStreak: 0,
      hasNewCards: false,
    }
  }

  const deckIds = decks.map(d => d.id)

  // Get total due count across all decks
  const { count: totalDueCount, error: dueCountError } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .in('deck_id', deckIds)
    .lte('next_review', now)

  if (dueCountError) {
    return {
      success: false,
      totalDueCount: 0,
      completedToday: 0,
      currentStreak: 0,
      hasNewCards: false,
      error: dueCountError.message,
    }
  }

  // Get completed today from study_logs
  const { data: studyLog, error: logError } = await supabase
    .from('study_logs')
    .select('cards_reviewed')
    .eq('user_id', user.id)
    .eq('study_date', todayDateStr)
    .single()

  // PGRST116 = no rows returned, which is expected if no study today
  if (logError && logError.code !== 'PGRST116') {
    return {
      success: false,
      totalDueCount: 0,
      completedToday: 0,
      currentStreak: 0,
      hasNewCards: false,
      error: logError.message,
    }
  }

  const completedToday = studyLog?.cards_reviewed || 0

  // Get current streak from user_stats
  const { data: userStats, error: statsError } = await supabase
    .from('user_stats')
    .select('current_streak')
    .eq('user_id', user.id)
    .single()

  // PGRST116 = no rows returned, which is expected for new users
  if (statsError && statsError.code !== 'PGRST116') {
    return {
      success: false,
      totalDueCount: 0,
      completedToday: 0,
      currentStreak: 0,
      hasNewCards: false,
      error: statsError.message,
    }
  }

  const currentStreak = userStats?.current_streak || 0

  // Check if there are any new cards (cards that exist)
  const { count: totalCardsCount, error: cardsCountError } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .in('deck_id', deckIds)

  if (cardsCountError) {
    return {
      success: false,
      totalDueCount: 0,
      completedToday: 0,
      currentStreak: 0,
      hasNewCards: false,
      error: cardsCountError.message,
    }
  }

  const hasNewCards = (totalCardsCount || 0) > 0

  return {
    success: true,
    totalDueCount: totalDueCount || 0,
    completedToday,
    currentStreak,
    hasNewCards,
  }
}

/**
 * Placeholder server action for AI draft feature.
 * Returns a predictable dummy MCQ object.
 * 
 * Requirements: 5.5, 5.6
 */
export async function draftMCQFromText(text: string): Promise<{
  success: boolean
  mcq?: {
    stem: string
    options: string[]
    correct_index: number
    explanation: string
  }
  error?: string
}> {
  // Placeholder implementation - returns dummy MCQ
  // This will be replaced with actual AI implementation later
  return {
    success: true,
    mcq: {
      stem: 'AI Draft Placeholder',
      options: ['A', 'B', 'C', 'D'],
      correct_index: 0,
      explanation: 'AI explanation placeholder.',
    },
  }
}
