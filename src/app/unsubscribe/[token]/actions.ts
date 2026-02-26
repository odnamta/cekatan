'use server'

import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { verifyUnsubscribeToken } from '@/lib/email-dispatch'

/**
 * Server action to process the unsubscribe request.
 * Called on button click, NOT on page load.
 * Token is HMAC-signed — re-verified here to prevent tampering.
 */
export async function processUnsubscribe(token: string): Promise<{ success: boolean }> {
  try {
    const userId = verifyUnsubscribeToken(token)

    if (!userId || userId.length !== 36) {
      return { success: false }
    }

    const supabase = await createSupabaseServiceClient()

    // Update profiles table — service client bypasses RLS
    const { error } = await supabase
      .from('profiles')
      .update({ email_notifications: false })
      .eq('id', userId)

    // Also update user_metadata for consistency
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { email_notifications: false },
    })

    return { success: !error && !authError }
  } catch {
    return { success: false }
  }
}
