# V10.6.2: Dashboard Performance & Actions Remediation

**Goal:** Fix the INP/Freeze issue on deck operations and clarify Delete vs. Unsubscribe actions.

---

## Current State Analysis

### Existing Implementation
- `MyDeckCard.tsx` already uses `useTransition` for unsubscribe ✅
- `DeckCard.tsx` uses `useTransition` for delete ✅
- **Problem:** `MyDeckCard` only shows "Unsubscribe" regardless of author status
- **Problem:** Authors cannot delete their own decks from the library view
- **Problem:** No optimistic UI updates (cards remain visible during server action)

---

## Fix 1: Unsubscribe vs Delete Logic (Highest Priority)

### 1.1 Update `MyDeckCard.tsx` - Author Actions
- [x] Add dropdown menu with two options for authors:
  - "Unsubscribe" - Remove from my view, keep deck alive for other subscribers
  - "Delete Deck" - Destructive action (red), requires confirmation modal
- [x] For non-authors (students), show only "Unsubscribe" button
- [x] Import `deleteDeckAction` from `@/actions/deck-actions`
- [x] Add state for dropdown visibility: `const [showMenu, setShowMenu] = useState(false)`
- [x] Add delete confirmation state: `const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)`
- [x] Delete warning text: "This will permanently delete the deck for ALL users. This action cannot be undone."

### 1.2 Update `MyLibraryGrid.tsx` - Callback Support
- [x] Add `onDeleteSuccess` callback prop alongside `onUnsubscribeSuccess`
- [x] Pass both callbacks to `MyDeckCard`

### 1.3 Ensure Library Browse View Consistency
- [x] Verify `/library` browse view uses same action patterns for subscribed decks
- [x] Check `DeckBrowseCard` - correctly shows only subscribe/go-to-library (no unsubscribe needed in browse)

---

## Fix 2: Performance - INP Fix (High Priority)

### 2.1 Verify `useTransition` Usage
- [x] `MyDeckCard.tsx` - Already uses `useTransition` ✅
- [x] `DeckCard.tsx` - Already uses `useTransition` ✅

### 2.2 Add Loading States
- [x] Show spinner immediately when delete/unsubscribe clicked
- [x] Disable all action buttons during pending state
- [x] Use `isPending` from `useTransition` to control UI

### 2.3 Button State Pattern
```tsx
// Implemented in MyDeckCard.tsx:
<Button disabled={isPending}>
  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes'}
</Button>
```

---

## Fix 3: Optimistic Updates (Medium Priority)

### 3.1 Implement Optimistic Hide
- [x] Add `const [isVisible, setIsVisible] = useState(true)` to `MyDeckCard`
- [x] Set `isVisible = false` immediately on action click (before server response)
- [x] Wrap card in conditional: `if (!isVisible) return null`
- [x] On error, restore visibility: `setIsVisible(true)`

### 3.2 Pattern Implementation
```tsx
// Implemented in MyDeckCard.tsx:
const handleUnsubscribe = () => {
  setIsVisible(false) // Optimistic hide
  startTransition(async () => {
    const result = await unsubscribeFromDeck(deck.id)
    if (result.success) {
      onUnsubscribeSuccess?.()
    } else {
      setIsVisible(true) // Restore on error
    }
  })
}
```

---

## Implementation Order

1. ~~**Fix 1.1** - Update `MyDeckCard.tsx` with author/student logic~~ ✅
2. ~~**Fix 2.2** - Add loading spinners to buttons~~ ✅
3. ~~**Fix 3.1** - Add optimistic hide behavior~~ ✅
4. ~~**Fix 1.2** - Update `MyLibraryGrid.tsx` callbacks~~ ✅
5. ~~**Fix 1.3** - Verify library browse consistency~~ ✅

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/library/MyDeckCard.tsx` | Added dropdown menu, delete action, optimistic UI, Loader2 spinner |
| `src/components/library/MyLibraryGrid.tsx` | Added onDeleteSuccess callback |

---

## Testing Checklist

- [x] Author can see both "Unsubscribe" and "Delete Deck" options (via MoreVertical dropdown)
- [x] Non-author only sees "Unsubscribe" (simple text button)
- [x] Delete shows warning about affecting all users
- [x] Delete requires confirmation before executing
- [x] UI responds immediately (no freeze) - useTransition
- [x] Card disappears instantly on action (optimistic) - isVisible state
- [x] Error restores card visibility - setIsVisible(true) on failure
- [x] Loading spinner shows during pending state - Loader2 with animate-spin
