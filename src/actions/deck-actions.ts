'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getUser } from '@/lib/supabase/server'
import { createDeckSchema } from '@/lib/validations'
import type { ActionResult } from '@/types/actions'

/**
 * Server Action for creating a new deck.
 * Validates input with Zod and creates deck via Supabase.
 * Requirements: 2.1, 9.3
 * 
 * When used with useActionState, the first argument is the previous state
 * and the second argument is the FormData.
 */
export async function createDeckAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    title: formData.get('title'),
  }

  // Server-side Zod validation (Requirement 9.3)
  const validationResult = createDeckSchema.safeParse(rawData)
  
  if (!validationResult.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(issue.message)
    }
    return { success: false, error: 'Validation failed', fieldErrors }
  }

  // Get authenticated user
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const { title } = validationResult.data
  const supabase = await createSupabaseServerClient()

  // Create new deck linked to authenticated user (Requirement 2.1)
  const { data, error } = await supabase
    .from('decks')
    .insert({
      user_id: user.id,
      title,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate dashboard to show new deck
  revalidatePath('/dashboard')

  return { success: true, data }
}

/**
 * Server Action for deleting a deck.
 * Removes the deck and all associated cards (via cascade delete).
 * Requirements: 2.3, 9.3
 */
export async function deleteDeckAction(deckId: string): Promise<ActionResult> {
  // Validate deckId is a valid UUID
  if (!deckId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deckId)) {
    return { success: false, error: 'Invalid deck ID' }
  }

  // Get authenticated user
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const supabase = await createSupabaseServerClient()

  // Delete deck (RLS ensures user can only delete own decks)
  // Cascade delete removes all associated cards (Requirement 2.3)
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate dashboard to reflect deletion
  revalidatePath('/dashboard')

  return { success: true }
}


/**
 * Server Action for fetching all user's decks.
 * V6.3: Used by ConfigureSessionModal for deck selection.
 */
export async function getUserDecks(): Promise<{ id: string; title: string }[]> {
  const user = await getUser()
  if (!user) {
    return []
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('decks')
    .select('id, title')
    .eq('user_id', user.id)
    .order('title', { ascending: true })

  if (error) {
    console.error('Failed to fetch user decks:', error)
    return []
  }

  return data || []
}


// ============================================
// V6.4: Shared Library V2 Functions
// ============================================

import type { DeckTemplate, DeckTemplateWithDueCount } from '@/types/database'

/**
 * Fetches user's deck_templates (authored + subscribed via user_decks).
 * Includes due count from user_card_progress.
 * 
 * V6.4: Shared Library Read Path
 */
export async function getDeckTemplates(): Promise<DeckTemplateWithDueCount[]> {
  const user = await getUser()
  if (!user) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()

  // Get user's subscribed deck_templates via user_decks
  const { data: userDecks, error: userDecksError } = await supabase
    .from('user_decks')
    .select(`
      deck_template_id,
      deck_templates!inner(*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (userDecksError) {
    console.error('Failed to fetch deck templates:', userDecksError)
    return []
  }

  if (!userDecks || userDecks.length === 0) {
    return []
  }

  // Get due counts for each deck_template
  const deckTemplateIds = userDecks.map(ud => ud.deck_template_id)
  
  // Get all card_templates in user's decks
  const { data: cardTemplates, error: ctError } = await supabase
    .from('card_templates')
    .select('id, deck_template_id')
    .in('deck_template_id', deckTemplateIds)

  if (ctError) {
    console.error('Failed to fetch card templates:', ctError)
  }

  // Create map of card_template_id -> deck_template_id
  const cardToDeckMap = new Map<string, string>()
  for (const ct of cardTemplates || []) {
    cardToDeckMap.set(ct.id, ct.deck_template_id)
  }

  // Get due progress records
  const cardTemplateIdList = Array.from(cardToDeckMap.keys())
  const { data: dueProgress, error: dueError } = await supabase
    .from('user_card_progress')
    .select('card_template_id')
    .eq('user_id', user.id)
    .lte('next_review', now)
    .eq('suspended', false)
    .in('card_template_id', cardTemplateIdList)

  if (dueError) {
    console.error('Failed to fetch due counts:', dueError)
  }

  // Build due count map
  const dueCountMap = new Map<string, number>()
  for (const record of dueProgress || []) {
    const deckTemplateId = cardToDeckMap.get(record.card_template_id)
    if (deckTemplateId) {
      dueCountMap.set(deckTemplateId, (dueCountMap.get(deckTemplateId) || 0) + 1)
    }
  }

  // Map to DeckTemplateWithDueCount
  return userDecks.map(ud => {
    const dt = ud.deck_templates as unknown as DeckTemplate
    return {
      ...dt,
      due_count: dueCountMap.get(dt.id) || 0,
    }
  })
}

/**
 * Fetches user's deck_templates for dropdown selection.
 * Simpler version without due counts.
 * 
 * V6.4: Used by ConfigureSessionModal for deck selection.
 */
export async function getUserDeckTemplates(): Promise<{ id: string; title: string }[]> {
  const user = await getUser()
  if (!user) {
    return []
  }

  const supabase = await createSupabaseServerClient()

  const { data: userDecks, error } = await supabase
    .from('user_decks')
    .select(`
      deck_template_id,
      deck_templates!inner(id, title)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (error) {
    console.error('Failed to fetch user deck templates:', error)
    return []
  }

  return (userDecks || []).map(ud => {
    const dt = ud.deck_templates as unknown as { id: string; title: string }
    return { id: dt.id, title: dt.title }
  }).sort((a, b) => a.title.localeCompare(b.title))
}

/**
 * Creates a new deck_template and auto-subscribes the author.
 * 
 * V6.4: Write Path
 */
export async function createDeckTemplateAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    title: formData.get('title'),
  }

  const validationResult = createDeckSchema.safeParse(rawData)
  
  if (!validationResult.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(issue.message)
    }
    return { success: false, error: 'Validation failed', fieldErrors }
  }

  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const { title } = validationResult.data
  const supabase = await createSupabaseServerClient()

  // Create deck_template
  const { data: deckTemplate, error: createError } = await supabase
    .from('deck_templates')
    .insert({
      title,
      author_id: user.id,
      visibility: 'private',
    })
    .select()
    .single()

  if (createError) {
    return { success: false, error: createError.message }
  }

  // Auto-subscribe author via user_decks
  const { error: subscribeError } = await supabase
    .from('user_decks')
    .insert({
      user_id: user.id,
      deck_template_id: deckTemplate.id,
      is_active: true,
    })

  if (subscribeError) {
    console.error('Failed to auto-subscribe author:', subscribeError)
    // Don't fail the whole operation, deck was created
  }

  revalidatePath('/dashboard')

  return { success: true, data: deckTemplate }
}
