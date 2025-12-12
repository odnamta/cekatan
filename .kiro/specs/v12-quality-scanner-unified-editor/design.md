# V12 – Quality Scanner & Unified Editor: Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Batch Import Flow                           │
├─────────────────────────────────────────────────────────────────┤
│  PDF Text Chunk                                                 │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────┐                                        │
│  │ mcq-quality-scanner │  ← Pure TS, no React/Supabase          │
│  │ scanChunkFor...()   │                                        │
│  └─────────┬───────────┘                                        │
│            │ QualityScanResult                                  │
│            ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │ draftBatchMCQFrom   │  ← Server Action                       │
│  │ Text (AI call)      │                                        │
│  └─────────┬───────────┘                                        │
│            │ MCQDraft[] + qualityIssues + rawTextChunk          │
│            ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │ BatchReviewPanel    │  ← React UI                            │
│  │ + BatchDraftCard    │                                        │
│  │ + MCQOptionsEditor  │                                        │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Type Definitions

### Quality Scanner Types (`src/lib/mcq-quality-scanner.ts`)

```typescript
// Issue severity levels
export type MCQIssueSeverity = 'low' | 'medium' | 'high'

// Issue codes for categorization
export type MCQIssueCode = 
  | 'MISSING_OPTIONS' 
  | 'EXTRA_OPTIONS' 
  | 'MISSING_QUESTIONS' 
  | 'UNUSUAL_FORMAT'

// Single issue descriptor
export interface MCQIssue {
  code: MCQIssueCode
  severity: MCQIssueSeverity
  message: string
}

// Per-question scan result
export interface ScannedQuestion {
  index: number
  rawText: string
  rawOptionLetters: string[]  // e.g., ['A', 'B', 'C', 'D']
  rawOptionCount: number
  issues: MCQIssue[]
}

// Full scan result for a text chunk
export interface QualityScanResult {
  rawQuestionCount: number
  questions: ScannedQuestion[]
  globalIssues: MCQIssue[]
}
```

### Extended Draft Type (in-memory only)

```typescript
// Extend existing MCQDraft type with quality fields
interface MCQDraftWithQuality extends MCQDraft {
  qualityIssues?: MCQIssue[]    // Per-draft issues
  rawTextChunk?: string         // Source text for this draft
}
```

### Extended QA Metrics (`src/lib/content-staging-metrics.ts`)

```typescript
export interface QAMetrics {
  // Existing fields
  detectedCount: number
  createdCount: number
  missingNumbers: number[]
  
  // V12: Quality scanner fields (optional for backward compat)
  rawQuestionCount?: number
  aiDraftCount?: number
  numQuestionsWithMissingOptions?: number
  numQuestionsWithExtraOptions?: number
}
```

## Regex Patterns

### Question Detection (Lange-style priority)

```typescript
// Primary patterns (most common)
const QUESTION_PATTERNS = [
  /^(\d+)[).]\s+/m,        // "1.", "2)", "3 )"
  /^Q(\d+)[).]?\s+/mi,     // "Q1.", "Q2)", "Q3"
]
```

### Option Detection

```typescript
// Primary patterns
const OPTION_PATTERNS = [
  /^([A-E])[).]\s+/m,      // "A.", "B)", "C )"
  /^\(([A-E])\)\s+/m,      // "(A)", "(B)"
  /^([a-e])[).]\s+/m,      // "a.", "b)" (lowercase)
  /^\(([a-e])\)\s+/m,      // "(a)", "(b)" (lowercase)
]
```

## Component Design

### MCQOptionsEditor (`src/components/mcq/MCQOptionsEditor.tsx`)

```typescript
interface MCQOptionsEditorProps {
  options: string[]
  correctIndex: number
  onChange: (options: string[], correctIndex: number) => void
  disabled?: boolean
}
```

**Behavior:**
- Vertical layout for mobile (375px)
- Each option: text input + radio for correct + delete button
- Add button at bottom (disabled when at maxOptions)
- Delete disabled when at minOptions
- Auto-adjust correctIndex if selected option is deleted

**Styling (Clinical Glass):**
- `bg-white/80 backdrop-blur-md`
- Touch-friendly: min 44px tap targets
- `active:scale-95` on buttons

### Quality Badge Component

```typescript
// Inline in BatchDraftCard
function QualityBadge({ issues }: { issues?: MCQIssue[] }) {
  const highSeverity = issues?.filter(i => i.severity === 'high') ?? []
  if (highSeverity.length === 0) return null
  
  return (
    <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">
      {highSeverity.length} issue{highSeverity.length > 1 ? 's' : ''}
    </span>
  )
}
```

## Integration Points

### 1. `draftBatchMCQFromText` Flow

```
1. Receive text chunk
2. Run scanChunkForQuestionsAndOptions(chunk) → QualityScanResult
3. Call AI with chunk → MCQDraft[]
4. Compare: rawQuestionCount vs drafts.length
5. For each draft[i], compare rawOptionCount vs draft.options.length
6. Attach qualityIssues[] and rawTextChunk to each draft
7. Update staging metrics
8. Return drafts (never throw on quality issues)
```

### 2. BatchReviewPanel Integration

```
- Display summary: "Detected X · Created Y"
- "Show flagged only" toggle → filter drafts with high-severity issues
- Pass rawTextChunk to BatchDraftCard for viewer
```

### 3. MCQOptionsEditor Integration

**BatchDraftCard:**
```typescript
<MCQOptionsEditor
  options={draft.options}
  correctIndex={draft.correct_index}
  onChange={(opts, idx) => updateDraft({ ...draft, options: opts, correct_index: idx })}
/>
```

**EditCardForm / CardEditorPanel:**
- Replace inline option fields with MCQOptionsEditor
- Wire to form state (React Hook Form or local state)

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/mcq-quality-scanner.ts` | NEW | Pure scanner module |
| `src/lib/content-staging-metrics.ts` | MODIFY | Add quality fields to QAMetrics |
| `src/actions/batch-mcq-actions.ts` | MODIFY | Integrate scanner, attach issues |
| `src/components/mcq/MCQOptionsEditor.tsx` | NEW | Reusable options editor |
| `src/components/batch/BatchDraftCard.tsx` | MODIFY | Use MCQOptionsEditor, show badges, raw text viewer |
| `src/components/batch/BatchReviewPanel.tsx` | MODIFY | Summary display, flagged filter |
| `src/components/cards/EditCardForm.tsx` | MODIFY | Use MCQOptionsEditor |
| `src/components/cards/CardEditorPanel.tsx` | MODIFY | Use MCQOptionsEditor |
| `src/__tests__/mcq-quality-scanner.property.test.ts` | NEW | Property-based tests |

## Error Handling Strategy

1. **Scanner fails to parse:** Return empty QualityScanResult, log warning, continue
2. **AI returns fewer drafts:** Flag MISSING_QUESTIONS, don't block
3. **Option count mismatch:** Flag MISSING_OPTIONS or EXTRA_OPTIONS, don't block
4. **Old drafts without qualityIssues:** UI checks `draft.qualityIssues?.length` (undefined-safe)
5. **Missing rawTextChunk:** Hide "View raw text" toggle

## Constants Reference

Import from `src/lib/constants.ts`:
```typescript
import { MCQ_LIMITS } from '@/lib/constants'
// MCQ_LIMITS.maxOptions = 5
// MCQ_LIMITS.minOptions = 2
```

**Note:** If `MCQ_LIMITS` location changes, update imports. Do NOT duplicate constants.
