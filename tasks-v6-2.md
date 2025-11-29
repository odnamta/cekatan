# V6.2 Tasks – Hyperflow & Versatility

**Phase Goal:** Speed up real-world importing (Hyperflow UX), activate Tag filtering in the UI, and prepare the AI for both Textbook and Q&A modes. Vision support starts as a contained MVP.

---

## Feature 1: Hyperflow Import (The Speed Up)
**Priority:** Highest

### 1.1 Batch Workflow Polish

- [ ] **Auto-Close Modal on Save Success**
  - File: `src/components/batch/BatchReviewPanel.tsx`
  - After successful `bulkCreateMCQ` save, auto-close the modal
  - Show success toast: `Saved N cards · Session total: X`
  - Pass session total count via `onSaveSuccess` callback

- [ ] **Scroll Preservation**
  - File: `src/components/pdf/PDFViewer.tsx`
  - Capture current scroll position before opening Batch Review modal
  - Restore scroll position after modal closes
  - Ensure page number persists (already uses `savePdfPage`)

- [ ] **Session HUD**
  - File: `src/components/pdf/SessionHUD.tsx` (new)
  - Create small stats bar component showing `Session: X cards created`
  - Position: top-right or bottom of PDF page
  - Add 'Reset' control to clear session count
  - Define 'session' as current visit on this PDF (reset on page reload or explicit reset)
  - Integrate into PDF source page layout

### 1.2 Selection Tooltip

- [ ] **Make Batch Draft Primary**
  - File: `src/components/pdf/SelectionTooltip.tsx`
  - Visually emphasize 'Batch Draft' button (larger, primary color)
  - Mobile: ensure large thumb-friendly tap area (min 44x44px)
  - Reorder buttons: Batch Draft first, then AI Draft, then To Stem/Explanation

- [ ] **Keyboard Shortcut for Batch Draft**
  - File: `src/hooks/useBatchDraftShortcut.ts` (new)
  - Bind `Shift+Cmd+Enter` (Mac) / `Shift+Ctrl+Enter` (Win/Linux)
  - Trigger Batch Draft only if PDF text selection exists
  - No-op if no selection
  - Integrate hook into PDF viewer page

### 1.3 Review Modal Upgrades

- [ ] **Include/Exclude Toggle per Card**
  - File: `src/components/batch/BatchDraftCard.tsx`
  - Add 'Include' checkbox/toggle (default: checked/included)
  - Visually mute excluded cards (opacity-50 or similar)
  - Update `MCQBatchDraftUI` type if needed to track `include` state

- [ ] **Count Logic for Save Button**
  - File: `src/components/batch/BatchReviewPanel.tsx`
  - Ensure `Save Selected (N)` reflects only included cards
  - Already implemented: `selectedCount = drafts.filter(d => d.include).length`
  - Verify count updates reactively when toggling include

- [ ] **Disable Save When N = 0**
  - File: `src/components/batch/BatchReviewPanel.tsx`
  - Already implemented: `disabled={selectedCount === 0 || isSaving}`
  - Verify payload to `bulkCreateMCQ` only includes cards where `include === true`

---

## Feature 2: Tag Filtering (The ROI)
**Priority:** High

### 2.1 Deck Filter UI

- [ ] **Create FilterBar Component**
  - File: `src/components/decks/FilterBar.tsx` (new)
  - Multi-select dropdown for tag filtering
  - Show active tags as removable pills
  - 'Clear filters' control to reset

- [ ] **Integrate FilterBar into DeckDetailsPage**
  - File: `src/app/decks/[id]/page.tsx` (or equivalent)
  - Position FilterBar above card list
  - Compute all unique tags used in this deck
  - Populate multi-select dropdown (sorted alphabetically)

- [ ] **Client-Side Filtering Logic**
  - Filter `cards` array in memory when tags selected
  - Rule: card must contain ALL selected tags (logical AND)
  - Update displayed card count to reflect filtered results

---

## Feature 3: The 'Brain Toggle' (Textbook vs Q&A)
**Priority:** High

### 3.1 Mode Switcher

- [ ] **Create Mode Toggle Component**
  - File: `src/components/ai/ModeToggle.tsx` (new)
  - Segmented control: `Extract (Q&A)` | `Generate (Textbook)`
  - Default: Extract mode
  - Compact design for placement near AI Draft entry points

- [ ] **Integrate Mode Toggle into UI**
  - Add toggle near AI Draft / Batch Draft entry points
  - Files: `src/components/pdf/SelectionTooltip.tsx`, relevant modal/panel components
  - Pass selected mode to server actions

- [ ] **Persist Mode Selection**
  - File: `src/lib/ai-mode-storage.ts` (new)
  - Save last used mode in `localStorage`
  - Restore on page reload
  - Key: `ai-draft-mode` with values `extract` | `generate`

### 3.2 Prompt Engineering

- [ ] **Update Server Actions for Mode Parameter**
  - Files: `src/actions/ai-actions.ts`, `src/actions/batch-mcq-actions.ts`
  - Accept `mode: 'extract' | 'generate'` parameter
  - Update schemas in `src/lib/mcq-draft-schema.ts`, `src/lib/batch-mcq-schema.ts`

- [ ] **Extract Mode Prompt (Q&A)**
  - Instruction: "Identify any existing multiple-choice questions already present in the selected text. Extract the question stems and options verbatim (fix obvious OCR spacing only)."
  - "Do NOT create new questions or add options that aren't clearly present in the text."
  - Preserve V6.1 data-integrity rules (units, clinical numbers must match source)

- [ ] **Generate Mode Prompt (Textbook)**
  - Instruction: "Read this textbook-like passage. Create ONE new high-yield board-style MCQ that tests a key concept from this passage."
  - "All clinical facts, thresholds, and units used in the question and answer options must come from the passage. Never invent new numbers or units."
  - "Invent plausible distractors (wrong answers), but they must still be conceptually related to the passage and not contradict medical facts in the passage."

- [ ] **Preserve V6.1 Data Integrity Rules in Both Modes**
  - Units and clinical numbers must match source text exactly
  - Model must not invent new clinical thresholds, numbers, or units
  - Only use concepts that actually appear in the provided passage

---

## Feature 4: AI Vision MVP
**Priority:** Medium

### 4.1 Image Handling

- [ ] **Create Image Drop Zone Component**
  - File: `src/components/ai/ImageDropZone.tsx` (new)
  - Support paste and drag-drop (single image per request for V6.2)
  - Preview thumbnail of uploaded image
  - Clear/remove image control

- [ ] **Client-Side Image Processing**
  - File: `src/lib/image-processing.ts` (new)
  - Resize image to max width ~1024px (maintain aspect ratio)
  - Compress/downscale to keep file size reasonable
  - Convert to Base64 for small images (<500KB after resize)
  - For larger images: upload to Supabase Storage, return signed URL

- [ ] **Supabase Storage Integration for Large Images**
  - File: `src/lib/supabase/image-upload.ts` (new)
  - Upload resized image to Supabase Storage bucket
  - Generate temporary signed URL (e.g., 1 hour expiry)
  - Clean up old temporary images (optional, can be background job)

- [ ] **Extend Server Actions for Vision**
  - Files: `src/actions/ai-actions.ts`, `src/actions/batch-mcq-actions.ts`
  - Accept optional `imageBase64` OR `imageUrl` parameter
  - Update input schemas accordingly

- [ ] **OpenAI Vision API Integration**
  - File: `src/lib/openai-vision.ts` (new)
  - Use GPT-4o vision capabilities
  - Prefer `image_url` style payload when using Supabase Storage URLs
  - Fallback to text-only path when no image provided
  - Handle vision-specific errors gracefully

- [ ] **Integrate Image Drop Zone into AI Draft UI**
  - Add ImageDropZone to single-card AI Draft modal
  - Add ImageDropZone to Batch Draft flow
  - Pass image data through to server actions

---

## Testing & Validation

- [ ] **Extend Existing Tests**
  - Do not break existing single-card AI Draft or Batch Draft tests
  - Add tests for new mode parameter handling
  - Add tests for include/exclude toggle logic
  - Add tests for tag filtering logic

- [ ] **Manual Testing Checklist**
  - [ ] Batch save auto-closes modal and shows correct toast
  - [ ] PDF scroll position preserved after modal close
  - [ ] Session HUD displays and resets correctly
  - [ ] Batch Draft shortcut works on Mac and Windows
  - [ ] Tag filtering shows correct cards (AND logic)
  - [ ] Mode toggle persists across page reloads
  - [ ] Extract mode extracts verbatim questions
  - [ ] Generate mode creates new questions from textbook content
  - [ ] Image paste/drop works and resizes correctly
  - [ ] Large images upload to Supabase Storage
  - [ ] Vision API returns valid MCQs from images

---

## V6.1 Invariants to Preserve

1. **Units and clinical numbers must match source text exactly** – no conversions, no rounding
2. **Tags remain user-scoped with case-insensitive uniqueness** – atomic upsert with ILIKE matching
3. **AI-generated concept tags use purple color** – maintain visual distinction
4. **Session tags merge with per-card AI tags** – server-side deduplication

---

## File Summary

### New Files
- `src/components/pdf/SessionHUD.tsx`
- `src/hooks/useBatchDraftShortcut.ts`
- `src/components/decks/FilterBar.tsx`
- `src/components/ai/ModeToggle.tsx`
- `src/lib/ai-mode-storage.ts`
- `src/components/ai/ImageDropZone.tsx`
- `src/lib/image-processing.ts`
- `src/lib/supabase/image-upload.ts`
- `src/lib/openai-vision.ts`

### Modified Files
- `src/components/batch/BatchReviewPanel.tsx`
- `src/components/batch/BatchDraftCard.tsx`
- `src/components/pdf/PDFViewer.tsx`
- `src/components/pdf/SelectionTooltip.tsx`
- `src/actions/ai-actions.ts`
- `src/actions/batch-mcq-actions.ts`
- `src/lib/mcq-draft-schema.ts`
- `src/lib/batch-mcq-schema.ts`
- `src/app/decks/[id]/page.tsx` (or equivalent deck details page)
