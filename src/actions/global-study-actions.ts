'use server'

import { createSupabaseServerClient, getUser } from '@/lib/supabase/server'
import type { Card, CardTemplate, UserCardProgress } from '@/types/database'

const BATCH_SIZE = 50
const NEW_CARDS_FALLBACK_LIMIT = 10

// Feature flag for V2 schema - set to true to use new template tables
const USE_V2_SCHEMA = true

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


// ============================================
// V6.4: Shared Library V2 Functions
// ============================================

/**
 * Card with progress - combines template and user progress for study
 */
export interface CardWithProgress {
  id: string // card_template_id
  deck_template_id: string
  stem: string
  options: string[]
  correct_index: number
  explanation: string | null
  // SRS fields from user_card_progress (or defaults)
  interval: number
  ease_factor: number
  next_review: string
  // For compatibility with existing Card type
  deck_id: string // alias for deck_template_id
  card_type: 'mcq'
  front: string // alias for stem
  back: string // alias for explanation
  image_url: string | null
  created_at: string
}

/**
 * Fetches due cards using V2 schema (card_templates + user_card_progress).
 * Falls back to V1 if USE_V2_SCHEMA is false.
 * 
 * Requirements: V6.4 Read Path
 */
export async function getGlobalDueCardsV2(batchNumber: number = 0): Promise<GlobalDueCardsResult> {
  if (!USE_V2_SCHEMA) {
    return getGlobalDueCards(batchNumber)
  }

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

  // Get user's subscribed deck_templates via user_decks
  const { data: userDecks, error: userDecksError } = await supabase
    .from('user_decks')
    .select('deck_template_id')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (userDecksError) {
    return {
      success: false,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
      error: userDecksError.message,
    }
  }

  if (!userDecks || userDecks.length === 0) {
    return {
      success: true,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
    }
  }

  const deckTemplateIds = userDecks.map(d => d.deck_template_id)

  // Get card_template_ids from active subscriptions
  const { data: activeCardTemplates, error: activeCardsError } = await supabase
    .from('card_templates')
    .select('id')
    .in('deck_template_id', deckTemplateIds)

  if (activeCardsError) {
    return {
      success: false,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
      error: activeCardsError.message,
    }
  }

  const activeCardIds = (activeCardTemplates || []).map(c => c.id)

  if (activeCardIds.length === 0) {
    return {
      success: true,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
    }
  }

  // Get total count of due cards from user_card_progress (only from active subscriptions)
  const { count: totalDueCount, error: countError } = await supabase
    .from('user_card_progress')
    .select('card_template_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('card_template_id', activeCardIds)
    .lte('next_review', now)
    .eq('suspended', false)

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

  // If no due cards, fall back to new cards (cards without progress)
  if (totalDue === 0) {
    // Get card_templates that don't have user_card_progress yet
    const { data: newCardTemplates, error: newCardsError } = await supabase
      .from('card_templates')
      .select('*')
      .in('deck_template_id', deckTemplateIds)
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

    // Filter out cards that already have progress
    const { data: existingProgress } = await supabase
      .from('user_card_progress')
      .select('card_template_id')
      .eq('user_id', user.id)

    const existingCardIds = new Set((existingProgress || []).map(p => p.card_template_id))
    const trulyNewCards = (newCardTemplates || []).filter(c => !existingCardIds.has(c.id))

    // Convert to Card-compatible format
    const cards = trulyNewCards.slice(0, NEW_CARDS_FALLBACK_LIMIT).map(ct => templateToCard(ct))

    return {
      success: true,
      cards,
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: true,
    }
  }

  // Fetch due cards with pagination - join card_templates with user_card_progress
  // Only include cards from active subscriptions
  const offset = batchNumber * BATCH_SIZE
  const { data: progressRecords, error: progressError } = await supabase
    .from('user_card_progress')
    .select(`
      *,
      card_templates!inner(*)
    `)
    .eq('user_id', user.id)
    .in('card_template_id', activeCardIds)
    .lte('next_review', now)
    .eq('suspended', false)
    .order('next_review', { ascending: true })
    .range(offset, offset + BATCH_SIZE - 1)

  if (progressError) {
    return {
      success: false,
      cards: [],
      totalDue: 0,
      hasMoreBatches: false,
      isNewCardsFallback: false,
      error: progressError.message,
    }
  }

  // Convert to Card-compatible format
  const cards = (progressRecords || []).map(record => {
    const ct = record.card_templates as unknown as CardTemplate
    return templateToCard(ct, record as unknown as UserCardProgress)
  })

  const hasMoreBatches = totalDue > (offset + BATCH_SIZE)

  return {
    success: true,
    cards,
    totalDue,
    hasMoreBatches,
    isNewCardsFallback: false,
  }
}

/**
 * Converts a CardTemplate (with optional progress) to Card-compatible format.
 * Used for backward compatibility with existing UI components.
 */
function templateToCard(
  template: CardTemplate,
  progress?: UserCardProgress
): Card {
  return {
    id: template.id,
    deck_id: template.deck_template_id,
    card_type: 'mcq',
    front: template.stem,
    back: template.explanation || '',
    stem: template.stem,
    options: template.options,
    correct_index: template.correct_index,
    explanation: template.explanation,
    image_url: null,
    interval: progress?.interval ?? 0,
    ease_factor: progress?.ease_factor ?? 2.5,
    next_review: progress?.next_review ?? new Date().toISOString(),
    created_at: template.created_at,
  }
}

/**
 * Fetches global stats using V2 schema.
 * 
 * Requirements: V6.4 Read Path
 */
export async function getGlobalStatsV2(): Promise<GlobalStatsResult> {
  if (!USE_V2_SCHEMA) {
    return getGlobalStats()
  }

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

  // Get user's active subscriptions first
  const { data: userDecks, error: userDecksError } = await supabase
    .from('user_decks')
    .select('deck_template_id')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (userDecksError) {
    return {
      success: false,
      totalDueCount: 0,
      completedToday: 0,
      currentStreak: 0,
      hasNewCards: false,
      error: userDecksError.message,
    }
  }

  // If no active subscriptions, return zeros
  if (!userDecks || userDecks.length === 0) {
    // Still get streak and completed today
    const { data: studyLog } = await supabase
      .from('study_logs')
      .select('cards_reviewed')
      .eq('user_id', user.id)
      .eq('study_date', todayDateStr)
      .single()

    const { data: userStats } = await supabase
      .from('user_stats')
      .select('current_streak')
      .eq('user_id', user.id)
      .single()

    return {
      success: true,
      totalDueCount: 0,
      completedToday: studyLog?.cards_reviewed || 0,
      currentStreak: userStats?.current_streak || 0,
      hasNewCards: false,
    }
  }

  const deckTemplateIds = userDecks.map(d => d.deck_template_id)

  // Get card_template_ids from active subscriptions
  const { data: activeCardTemplates, error: activeCardsError } = await supabase
    .from('card_templates')
    .select('id')
    .in('deck_template_id', deckTemplateIds)

  if (activeCardsError) {
    return {
      success: false,
      totalDueCount: 0,
      completedToday: 0,
      currentStreak: 0,
      hasNewCards: false,
      error: activeCardsError.message,
    }
  }

  const activeCardIds = (activeCardTemplates || []).map(c => c.id)

  // Get total due count from user_card_progress (only from active subscriptions)
  let totalDueCount = 0
  if (activeCardIds.length > 0) {
    const { count, error: dueCountError } = await supabase
      .from('user_card_progress')
      .select('card_template_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('card_template_id', activeCardIds)
      .lte('next_review', now)
      .eq('suspended', false)

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
    totalDueCount = count || 0
  }

  // Get completed today from study_logs (unchanged)
  const { data: studyLog, error: logError } = await supabase
    .from('study_logs')
    .select('cards_reviewed')
    .eq('user_id', user.id)
    .eq('study_date', todayDateStr)
    .single()

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

  // Get current streak from user_stats (unchanged)
  const { data: userStats, error: statsError } = await supabase
    .from('user_stats')
    .select('current_streak')
    .eq('user_id', user.id)
    .single()

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

  // Check if there are any card_templates in user's active subscriptions
  // (we already have deckTemplateIds from earlier)
  let hasNewCards = false
  if (deckTemplateIds.length > 0) {
    const { count: totalCardsCount } = await supabase
      .from('card_templates')
      .select('*', { count: 'exact', head: true })
      .in('deck_template_id', deckTemplateIds)

    hasNewCards = (totalCardsCount || 0) > 0
  }

  return {
    success: true,
    totalDueCount: totalDueCount || 0,
    completedToday,
    currentStreak,
    hasNewCards,
  }
}


/**
 * Creates or updates user_card_progress when a card is answered.
 * This enables lazy progress creation - progress is created on first answer.
 * 
 * Requirements: V6.4 Lazy Progress Creation
 */
export async function upsertCardProgress(
  cardTemplateId: string,
  srsUpdate: {
    interval: number
    easeFactor: number
    nextReview: Date
  }
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const supabase = await createSupabaseServerClient()

  // Upsert the progress record
  const { error } = await supabase
    .from('user_card_progress')
    .upsert({
      user_id: user.id,
      card_template_id: cardTemplateId,
      interval: srsUpdate.interval,
      ease_factor: srsUpdate.easeFactor,
      next_review: srsUpdate.nextReview.toISOString(),
      last_answered_at: new Date().toISOString(),
      repetitions: srsUpdate.interval > 0 ? 1 : 0,
      suspended: false,
    }, {
      onConflict: 'user_id,card_template_id',
    })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
