'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for browser-side operations.
 * Use this in Client Components (components with 'use client' directive).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
