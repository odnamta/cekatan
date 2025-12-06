# V8.2.4 Patch: Upload Auto-Migration for Legacy Decks

**Phase:** V8.2.4 Upload Migration Patch  
**Goal:** Fix the "Deck not found" error during PDF upload by adding Auto-Migration logic for legacy decks, supporting old bookmarked URLs.

**⚠️ V2 Only Law EXCEPTION:** This patch is an approved exception to read from `public.decks` for auto-migration purposes only. This bridges the gap for users with old bookmarked URLs.

---

## Current State Analysis

The `source-actions.ts` has a 3-step ID resolution that fails for unmigrated legacy decks:
1. ✅ Direct V2 match (`deck_templates.id`)
2. ✅ Legacy URL match (`deck_templates.legacy_id`)
3. ✅ Subscription match (`user_decks.id → deck_template_id`)
4. ❌ **Missing:** Legacy table lookup + auto-migration

---

## Fix 1: Auto-Migration in `resolveDeckTemplateId` (Highest Priority)

### New Resolution Logic

```
1. Check deck_templates.id (V2 direct match)
2. Check deck_templates.legacy_id (already migrated)
3. Check user_decks.id → deck_template_id (subscription)
4. **NEW:** Check public.decks (legacy table)
   - If found AND user is owner → call migrateLegacyDeck()
   - Return the NEW V2 deck_template ID
5. If all fail → return null (error)
```

### Tasks

- [x] **1.1** Create `migrateLegacyDeck` helper function in `src/actions/source-actions.ts`
  ```ts
  /**
   * V8.2.4: Auto-migrate a single legacy deck to V2 schema.
   * Creates deck_template with legacy_id reference.
   * Creates user_decks subscription for owner.
   * Does NOT migrate cards (lazy migration on first study).
   */
  async function migrateLegacyDeck(
    supabase: SupabaseClient,
    legacyDeckId: string,
    userId: string
  ): Promise<{ templateId: string; authorId: string } | null>
  ```
  - Query `public.decks` for the legacy deck
  - Verify `user_id === userId` (owner check)
  - Insert into `deck_templates` with `legacy_id = legacyDeckId`
  - Insert into `user_decks` to auto-subscribe owner
  - Return new template ID and author ID
  - Log: `[migrateLegacyDeck] Migrated legacy deck ${legacyDeckId} → ${newTemplateId}`

- [x] **1.2** Update `resolveDeckTemplateId` to add Step 4
  - After Step 3 fails, attempt legacy lookup
  - Call `migrateLegacyDeck` if found and user is owner
  - Log: `[resolveDeckTemplateId] Step 4: Legacy auto-migration triggered`

---

## Fix 2: Enhanced Error Logging (High Priority)

### Tasks

- [x] **2.1** Add detailed logging to `resolveDeckTemplateId`
  - Log each step attempted with result
  - Format: `[resolveDeckTemplateId] Step N: {description} - {result}`

- [x] **2.2** Update `uploadSourceAction` error logging
  - When deck not found after all 4 steps, log:
    ```
    [Upload Failed] Input ID: ${deckId}, User: ${userId}, Resolution: all 4 steps failed
    ```

- [x] **2.3** Update error message for users
  - If migration fails due to permission: "Only the deck owner can upload to this deck"
  - If deck truly not found: "Deck not found. Please verify the deck exists."

---

## Fix 3: Apply Same Logic to `linkSourceToDeckAction` (Medium Priority)

### Tasks

- [x] **3.1** Update `linkSourceToDeckAction` to use enhanced `resolveDeckTemplateId`
  - Already uses the helper, will automatically benefit from Step 4

---

## Implementation Details

### `migrateLegacyDeck` Function Spec

```ts
async function migrateLegacyDeck(
  supabase: SupabaseClient,
  legacyDeckId: string,
  userId: string
): Promise<{ templateId: string; authorId: string } | null> {
  // 1. Query legacy deck
  const { data: legacyDeck } = await supabase
    .from('decks')
    .select('id, title, user_id')
    .eq('id', legacyDeckId)
    .single()

  if (!legacyDeck) return null

  // 2. Verify ownership
  if (legacyDeck.user_id !== userId) {
    console.log('[migrateLegacyDeck] User is not owner, skipping migration')
    return null
  }

  // 3. Check if already migrated (race condition guard)
  const { data: existing } = await supabase
    .from('deck_templates')
    .select('id, author_id')
    .eq('legacy_id', legacyDeckId)
    .single()

  if (existing) {
    console.log('[migrateLegacyDeck] Already migrated:', existing.id)
    return { templateId: existing.id, authorId: existing.author_id }
  }

  // 4. Create deck_template
  const { data: newTemplate, error: createError } = await supabase
    .from('deck_templates')
    .insert({
      title: legacyDeck.title,
      author_id: legacyDeck.user_id,
      visibility: 'private',
      legacy_id: legacyDeckId,
    })
    .select('id, author_id')
    .single()

  if (createError || !newTemplate) {
    console.error('[migrateLegacyDeck] Failed to create template:', createError)
    return null
  }

  // 5. Auto-subscribe owner
  await supabase.from('user_decks').insert({
    user_id: legacyDeck.user_id,
    deck_template_id: newTemplate.id,
    is_active: true,
  })

  console.log(`[migrateLegacyDeck] Migrated ${legacyDeckId} → ${newTemplate.id}`)
  return { templateId: newTemplate.id, authorId: newTemplate.author_id }
}
```

---

## Files to Modify

| File | Fix |
|------|-----|
| `src/actions/source-actions.ts` | Fix 1.1, 1.2, 2.1, 2.2, 2.3 - Auto-migration + logging |

---

## Testing Checklist

- [x] Upload to V2 deck works normally (no migration triggered)
- [x] Upload to legacy deck (owner) triggers auto-migration
- [x] Upload to legacy deck (non-owner) returns permission error
- [x] After migration, deck appears in dashboard
- [x] After migration, subsequent uploads use V2 ID directly
- [x] Error logs include input ID, user ID, and step results
- [x] Race condition: concurrent migrations don't create duplicates
