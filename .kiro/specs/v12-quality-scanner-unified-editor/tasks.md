# V12 – Quality Scanner & Unified Editor: Tasks

## Epic 1: Quality Scanner (Lib & Integration)

### Task 1.1: Define QualityScanner types and module
- [x] Create `src/lib/mcq-quality-scanner.ts`
- [x] Define types:
  - `MCQIssueSeverity = 'low' | 'medium' | 'high'`
  - `MCQIssueCode = 'MISSING_OPTIONS' | 'EXTRA_OPTIONS' | 'MISSING_QUESTIONS' | 'UNUSUAL_FORMAT'`
  - `MCQIssue = { code, severity, message }`
  - `ScannedQuestion = { index, rawText, rawOptionLetters, rawOptionCount, issues }`
  - `QualityScanResult = { rawQuestionCount, questions, globalIssues }`
- [x] Ensure module is pure (no React, no Supabase imports)
- [x] Export all types for use in other modules
- _Requirements: FR-1.1_

### Task 1.2: Implement question + option detection with regex
- [x] Implement `scanChunkForQuestionsAndOptions(text: string): QualityScanResult`
- [x] Question detection patterns:
  - `^\d+[).]\s+` (e.g., "1.", "2)", "3 )")
  - `^Q\d+[).]?\s+` (e.g., "Q1.", "Q2)")
- [x] Option detection patterns:
  - `^[A-E][).]\s+` (e.g., "A.", "B)")
  - `^\([A-E]\)\s+` (e.g., "(A)", "(B)")
  - Lowercase variants: `^[a-e][).]\s+`, `^\([a-e]\)\s+`
- [x] Group option lines per detected question
- [x] Compute `rawOptionLetters` and `rawOptionCount` for each question
- [x] Return empty result (not throw) on malformed input
- [x] Focus on Lange-style MCQ formatting; fail soft on exotic formats
- _Requirements: FR-1.2, FR-1.3, FR-1.4, FR-1.5_

### Task 1.3: Property-based tests for QualityScanner
- [x] Create `src/__tests__/mcq-quality-scanner.property.test.ts`
- [x] Unit tests with Vitest:
  - Empty text returns empty result
  - Single question with 4 options detected correctly
  - Multiple questions parsed in order
  - Lowercase options detected
  - Malformed text doesn't throw
- [x] Property tests with fast-check:
  - "If text has N lines starting with A–E pattern, rawOptionCount ≥ N"
  - "rawQuestionCount equals number of question pattern matches"
  - "Scanner never throws on arbitrary string input"
- [x] Keep scope tight to Lange-style patterns
- _Requirements: NFR-3_

### Task 1.4: Wire QualityScanner into draftBatchMCQFromText
- [x] In `src/actions/batch-mcq-actions.ts`:
  - Before AI call: run `scanChunkForQuestionsAndOptions(chunk)`
  - After AI returns drafts: compare `rawQuestionCount` vs `drafts.length`
  - For each aligned question/draft: compare `rawOptionCount` vs `draft.options.length`
- [x] Derive issues:
  - `rawQuestionCount > aiDraftCount` → `MISSING_QUESTIONS` (high)
  - `rawOptionCount > aiOptions` → `MISSING_OPTIONS` (high)
  - `rawOptionCount < aiOptions` → `EXTRA_OPTIONS` (medium)
- [x] Extend draft type with `qualityIssues?: MCQIssue[]` (in-memory only)
- [x] Extend draft type with `rawTextChunk?: string` (in-memory only)
- [x] Store the exact text chunk in `rawTextChunk` for each draft
- [x] Guard: if scanning fails, continue pipeline without throwing
- [x] Do NOT block draft creation on issues (advisory only)
- _Requirements: FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-7.1, FR-7.2_

### Task 1.5: Extend content staging metrics with quality fields
- [x] In `src/lib/content-staging-metrics.ts`:
  - Add to `QAMetrics` interface:
    - `rawQuestionCount?: number`
    - `aiDraftCount?: number`
    - `numQuestionsWithMissingOptions?: number`
    - `numQuestionsWithExtraOptions?: number`
- [x] Update `formatQAMetrics` to display new fields when present
- [x] Ensure new fields are optional (backward compatible)
- [x] Update call sites in `draftBatchMCQFromText` to pass new metrics
- [x] Metrics remain in-memory only (no new DB columns)
- _Requirements: FR-6.1, FR-6.2, FR-6.3, FR-6.4_

---

## Epic 2: Unified MCQ Options Editor

### Task 2.1: Create shared MCQOptionsEditor component
- [x] Create `src/components/mcq/MCQOptionsEditor.tsx`
- [x] Props interface:
  ```typescript
  interface MCQOptionsEditorProps {
    options: string[]
    correctIndex: number
    onChange: (options: string[], correctIndex: number) => void
    disabled?: boolean
  }
  ```
- [x] Behavior:
  - Render current options as editable inputs
  - Add option button (disabled at `MCQ_LIMITS.maxOptions`)
  - Remove option button per row (disabled at `MCQ_LIMITS.minOptions`)
  - Radio/select for correct option index
  - Auto-adjust `correctIndex` if selected option is removed
- [x] Import `MCQ_LIMITS` from `@/lib/constants` (do NOT duplicate)
- [x] Note: If `MCQ_LIMITS` moves, update imports
- [x] Mobile-first layout (375px): vertical, touch-friendly (44px min tap targets)
- [x] Clinical Glass styling: `bg-white/80`, `backdrop-blur-md`
- [x] Buttons: `active:scale-95` micro-interaction
- [x] No direct DB calls (props + callbacks only)
- _Requirements: FR-4.1, FR-4.2, FR-4.3, FR-4.4, FR-4.5, FR-4.6_

### Task 2.2: Use MCQOptionsEditor in batch draft UI
- [x] In `src/components/batch/BatchDraftCard.tsx`:
  - Replace inline options editing with `MCQOptionsEditor`
  - Pass `draft.options` and `draft.correct_index` as props
  - Wire `onChange` to update draft state
- [x] Ensure existing props and draft shape remain intact
- [x] Verify batch actions and autosave continue to work
- _Requirements: FR-4.1_

### Task 2.3: Use MCQOptionsEditor in single-card editors
- [x] In `src/components/cards/EditCardForm.tsx`:
  - Replace duplicated option fields with `MCQOptionsEditor`
  - Wire to form state (React Hook Form or local state)
- [x] In `src/components/cards/CardEditorPanel.tsx`:
  - Replace duplicated option fields with `MCQOptionsEditor`
  - Wire to component state
- [x] Verify non-MCQ card types are unaffected
- [x] Test form submission still correctly sends `options` and `correct_index`
- _Requirements: FR-4.1_

---

## Epic 3: QA UI Integration (Advisory Only)

### Task 3.1: Show quality issues in batch review UI
- [x] In `src/components/batch/BatchReviewPanel.tsx`:
  - Display summary: "Detected X questions, created Y drafts" when metrics available
  - Add "Show flagged only" toggle
  - Filter drafts with `qualityIssues` containing high-severity issues
- [x] In `src/components/batch/BatchDraftCard.tsx`:
  - Read `draft.qualityIssues` (if present)
  - Show badge for high-severity issues (colored chip/icon)
  - Mobile-friendly styling (non-blocking visual)
- [x] Do NOT prevent approving/publishing drafts with issues (advisory only)
- [x] Guard: handle drafts without `qualityIssues` (undefined-safe checks)
- _Requirements: FR-5.1, FR-5.2, FR-5.3, FR-5.5_

### Task 3.2: Add "View raw text" toggle for human oversight
- [x] In `src/components/batch/BatchDraftCard.tsx`:
  - Add "View raw text" toggle/button
  - Display `draft.rawTextChunk` in read-only `<pre>` or scrollable block
  - Usable on 375px viewport (horizontal scroll if needed)
- [x] Source: `rawTextChunk` from draft payload (same string sent to scanner/AI)
- [x] No new DB columns required
- [x] Fail soft: hide toggle if `rawTextChunk` is unavailable (older drafts)
- [x] For debugging/QA only; does not affect ingestion logic
- _Requirements: FR-5.4, FR-7.3_

---

## Summary

| Epic | Tasks | Status |
|------|-------|--------|
| 1. Quality Scanner (Lib & Integration) | 5 | ✅ Complete |
| 2. Unified MCQ Options Editor | 3 | ✅ Complete |
| 3. QA UI Integration (Advisory Only) | 2 | ✅ Complete |
| **Total** | **10** | ✅ All Complete |

## Testing Checklist

- [x] Run `npm run test` — all property tests pass (1261 tests)
- [x] Run `npm run build` — production build succeeds
- [ ] Manual test: bulk import with Lange-style PDF
- [ ] Manual test: verify quality badges appear for mismatched counts
- [ ] Manual test: "Show flagged only" filter works
- [ ] Manual test: "View raw text" displays correct chunk
- [ ] Manual test: MCQOptionsEditor in batch draft card
- [ ] Manual test: MCQOptionsEditor in single card editor
- [ ] Manual test: older drafts (without qualityIssues) render without errors
- [ ] Mobile test: all UI usable on 375px viewport

## Files Changed

| File | Change |
|------|--------|
| `src/lib/mcq-quality-scanner.ts` | NEW - Quality scanner module |
| `src/lib/batch-mcq-schema.ts` | MODIFIED - Added quality types and extended draft types |
| `src/lib/content-staging-metrics.ts` | MODIFIED - Added quality fields to QAMetrics |
| `src/actions/batch-mcq-actions.ts` | MODIFIED - Integrated quality scanner |
| `src/components/mcq/MCQOptionsEditor.tsx` | NEW - Unified options editor |
| `src/components/batch/BatchDraftCard.tsx` | MODIFIED - Uses MCQOptionsEditor, quality badges, raw text viewer |
| `src/components/batch/BatchReviewPanel.tsx` | MODIFIED - Flagged filter toggle |
| `src/components/cards/EditCardForm.tsx` | MODIFIED - Uses MCQOptionsEditor |
| `src/components/cards/CardEditorPanel.tsx` | MODIFIED - Uses MCQOptionsEditor |
| `src/__tests__/mcq-quality-scanner.property.test.ts` | NEW - 25 property tests |
