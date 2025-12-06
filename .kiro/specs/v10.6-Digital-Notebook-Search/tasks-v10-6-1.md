# V10.6.1 Patch: Search & Sync Remediation Plan

**Phase:** V10.6.1 Search & Sync Patch  
**Goal:** Fix the broken Search bar, enable the Private toggle, and fix the '0 Cards Due' issue for authors.

---

## Fix 1: Search Implementation (Highest Priority)

The current `searchCards` action in `src/actions/notebook-actions.ts` is functional but needs verification. The search uses `ilike` with wildcards correctly.

### Current State
- ✅ Uses `ilike` with `%query%` wildcards (line ~217)
- ✅ Joins with `user_decks` to filter by subscribed decks
- ✅ Returns `stem`, `id`, `deck_template_id`
- ⚠️ Missing: Author access (authors should see their own deck cards even without subscription)

### Tasks

- [x] **1.1** Update `searchCards` in `src/actions/notebook-actions.ts`
  - Add author check: Include cards from decks where `author_id = user.id`
  - Query should be: subscribed decks OR authored decks
  ```ts
  // Get subscribed deck IDs
  const subscribedDeckIds = userDecks.map(ud => ud.deck_template_id)
  
  // Get authored deck IDs
  const { data: authoredDecks } = await supabase
    .from('deck_templates')
    .select('id')
    .eq('author_id', user.id)
  
  const authoredDeckIds = (authoredDecks || []).map(d => d.id)
  const accessibleDeckIds = [...new Set([...subscribedDeckIds, ...authoredDeckIds])]
  ```

- [x] **1.2** Handle empty query gracefully
  - ✅ Already implemented (returns empty array for empty/whitespace query)

- [x] **1.3** Verify Search Result dropdown links to Card Preview modal
  - File: `src/components/search/SearchResults.tsx`
  - Ensure `onResultClick` triggers `SingleCardPreviewModal`

---

## Fix 2: Sync Button - Fixing "0 Cards Due" (High Priority)

Authors who create decks don't have `user_card_progress` rows until they study. This causes "0 Due" even with 80+ cards.

### Tasks

- [x] **2.1** Create `syncAuthorProgress` Server Action in `src/actions/deck-actions.ts`
  ```ts
  /**
   * V10.6.1: Sync author progress for a deck.
   * Creates user_card_progress rows for all cards the author doesn't have progress for.
   * Uses ON CONFLICT DO NOTHING for idempotency.
   */
  export async function syncAuthorProgress(deckId: string): Promise<ActionResult> {
    const user = await getUser()
    if (!user) return { success: false, error: 'Authentication required' }
    
    const supabase = await createSupabaseServerClient()
    
    // Verify user is author
    const { data: deck } = await supabase
      .from('deck_templates')
      .select('author_id')
      .eq('id', deckId)
      .single()
    
    if (!deck || deck.author_id !== user.id) {
      return { success: false, error: 'Only the author can sync progress' }
    }
    
    // Get all card IDs in this deck
    const { data: cards } = await supabase
      .from('card_templates')
      .select('id')
      .eq('deck_template_id', deckId)
    
    if (!cards || cards.length === 0) {
      return { success: true } // No cards to sync
    }
    
    // Bulk insert progress rows (ON CONFLICT DO NOTHING)
    const progressRows = cards.map(card => ({
      user_id: user.id,
      card_template_id: card.id,
      interval: 0,
      ease_factor: 2.5,
      repetitions: 0,
      next_review: new Date().toISOString(),
      suspended: false,
      correct_count: 0,
      total_attempts: 0,
      is_flagged: false,
    }))
    
    const { error } = await supabase
      .from('user_card_progress')
      .upsert(progressRows, { 
        onConflict: 'user_id,card_template_id',
        ignoreDuplicates: true 
      })
    
    if (error) return { success: false, error: error.message }
    
    revalidatePath(`/decks/${deckId}`)
    revalidatePath('/study')
    return { success: true }
  }
  ```

- [x] **2.2** Add "Sync / Repair" button to `DeckDetailsPage`
  - File: `src/app/(app)/decks/[deckId]/page.tsx`
  - Location: In the author-only actions section (after CleanDuplicatesButton)
  - Create new component: `src/components/decks/SyncProgressButton.tsx`
  ```tsx
  'use client'
  
  import { useState, useTransition } from 'react'
  import { RefreshCw } from 'lucide-react'
  import { Button } from '@/components/ui/Button'
  import { syncAuthorProgress } from '@/actions/deck-actions'
  
  interface SyncProgressButtonProps {
    deckId: string
  }
  
  export function SyncProgressButton({ deckId }: SyncProgressButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<string | null>(null)
    
    const handleSync = () => {
      setMessage(null)
      startTransition(async () => {
        const result = await syncAuthorProgress(deckId)
        if (result.success) {
          setMessage('Progress synced!')
        } else {
          setMessage(result.error || 'Sync failed')
        }
      })
    }
    
    return (
      <div className="inline-flex items-center gap-2">
        <Button 
          variant="secondary" 
          size="lg"
          onClick={handleSync}
          disabled={isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Syncing...' : 'Sync Progress'}
        </Button>
        {message && (
          <span className="text-sm text-slate-600 dark:text-slate-400">{message}</span>
        )}
      </div>
    )
  }
  ```

- [x] **2.3** Import and add `SyncProgressButton` to DeckDetailsPage
  - Add to author-only actions section

---

## Fix 3: Toggle Error Handling (Medium Priority)

The `VisibilityToggle` component already has error handling, but needs toast notifications for better UX.

### Current State
- ✅ Error state exists (`error` state variable)
- ✅ Error message displayed below toggle
- ⚠️ Missing: Toast notification for visibility
- ⚠️ Missing: Optimistic UI revert on failure

### Tasks

- [x] **3.1** Add toast notification to `VisibilityToggle`
  - File: `src/components/decks/VisibilityToggle.tsx`
  - Import toast (check if project uses a toast library, or add simple one)
  ```tsx
  // In handleToggle, after error:
  if (!result.success) {
    const errorMsg = result.error || 'Failed to update visibility'
    setError(errorMsg)
    toast.error(errorMsg) // Add toast notification
  }
  ```

- [x] **3.2** Implement optimistic UI with revert
  - Update visibility state immediately
  - Revert if server request fails
  ```tsx
  const handleToggle = () => {
    const newVisibility: DeckVisibility = isPublic ? 'private' : 'public'
    const previousVisibility = visibility
    
    // Optimistic update
    setVisibility(newVisibility)
    setError(null)
    
    startTransition(async () => {
      const result = await updateDeckVisibilityAction(deckId, newVisibility)
      
      if (result.success) {
        onVisibilityChange?.(newVisibility)
      } else {
        // Revert on failure
        setVisibility(previousVisibility)
        setError(result.error || 'Failed to update visibility')
      }
    })
  }
  ```

- [x] **3.3** Check if toast library exists, if not add simple toast component
  - Search for existing toast implementation in `src/components/ui/`
  - If none exists, consider using `sonner` or simple inline notification

---

## Testing Checklist

- [x] Search returns results for subscribed decks
- [x] Search returns results for authored decks (even without subscription)
- [x] Empty search query returns empty array (no error)
- [x] Search result click opens Card Preview modal
- [x] Sync button appears only for authors
- [x] Sync button creates progress rows for all cards
- [x] Sync button is idempotent (safe to click multiple times)
- [x] After sync, cards appear as "Due"
- [x] Visibility toggle shows error toast on failure
- [x] Visibility toggle reverts on failure

---

## Files to Modify

| File | Fix |
|------|-----|
| `src/actions/notebook-actions.ts` | Fix 1.1 - Add author deck access |
| `src/actions/deck-actions.ts` | Fix 2.1 - Add `syncAuthorProgress` action |
| `src/components/decks/SyncProgressButton.tsx` | Fix 2.2 - New component |
| `src/app/(app)/decks/[deckId]/page.tsx` | Fix 2.3 - Add SyncProgressButton |
| `src/components/decks/VisibilityToggle.tsx` | Fix 3.1, 3.2 - Toast + optimistic UI |
