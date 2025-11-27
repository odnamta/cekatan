'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getUser } from '@/lib/supabase/server'
import { createCardSchema } from '@/lib/validations'
import { getCardDefaults } from '@/lib/card-defaults'
import type { ActionResult } from '@/types/actions'

/**
 * Server Action for creating a new card.
 * Validates input with Zod and creates card with default SM-2 values.
 * Requirements: 3.1, 3.2, 9.3
 */
export async function createCardAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    deckId: formData.get('deckId'),
    front: formData.get('front'),
    back: formData.get('back'),
    imageUrl: formData.get('imageUrl') || '',
  }

  // Server-side Zod validation (Requirement 9.3)
  const validationResult = createCardSchema.safeParse(rawData)
  
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

  const { deckId, front, back, imageUrl } = validationResult.data
  const supabase = await createSupabaseServerClient()

  // Verify user owns the deck (RLS will also enforce this)
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (deckError || !deck) {
    return { success: false, error: 'Deck not found or access denied' }
  }

  // Create new card with default SM-2 values (Requirement 3.1)
  const defaults = getCardDefaults()
  const { data, error } = await supabase
    .from('cards')
    .insert({
      deck_id: deckId,
      front,
      back,
      image_url: imageUrl || null,
      interval: defaults.interval,
      ease_factor: defaults.ease_factor,
      next_review: defaults.next_review.toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate deck details page to show new card
  revalidatePath(`/decks/${deckId}`)

  return { success: true, data }
}
