/**
 * V11.5: Server Action Helpers
 * Reusable auth wrapper and utility functions for server actions.
 */

import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseServerClient, getUser } from '@/lib/supabase/server'

/**
 * Explicit context type for type safety in server actions.
 * Contains the authenticated user and Supabase client.
 */
export type AuthContext = {
  user: User
  supabase: SupabaseClient
}

/**
 * Standard auth error response shape.
 */
export type AuthError = { ok: false; error: 'AUTH_REQUIRED' }

/**
 * Wraps a server action callback with authentication.
 * Resolves user and creates Supabase client in a single operation.
 * Returns AUTH_REQUIRED error if no authenticated user.
 * 
 * @param fn - Callback function receiving AuthContext
 * @returns Result of callback or AuthError
 * 
 * **Feature: v11.5-global-study-stabilization**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 */
export async function withUser<T>(
  fn: (ctx: AuthContext) => Promise<T>
): Promise<T | AuthError> {
  const user = await getUser()
  if (!user) {
    return { ok: false, error: 'AUTH_REQUIRED' }
  }
  const supabase = await createSupabaseServerClient()
  return fn({ user, supabase })
}

/**
 * Type guard to check if a result is an AuthError.
 */
export function isAuthError(result: unknown): result is AuthError {
  return (
    typeof result === 'object' &&
    result !== null &&
    'ok' in result &&
    result.ok === false &&
    'error' in result &&
    result.error === 'AUTH_REQUIRED'
  )
}
