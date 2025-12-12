# V12 – Quality Scanner & Unified Editor

## Overview

Add a regex-based Quality Scanner to compare source text vs AI-generated MCQs (questions + options) and a unified MCQ options editor to fix flagged cards. This version is **advisory only** — no blocking of ingestion or publishing.

## Constraints

- **No database schema changes** in V12
- **Advisory only** — scanner issues never block draft creation or publishing
- **Mobile-first** — all UI must work on 375px viewport
- **Fail soft** — if scanning fails, pipeline continues without throwing

## Functional Requirements

### FR-1: Quality Scanner Library

1. **FR-1.1**: The system SHALL provide a pure TypeScript module `mcq-quality-scanner.ts` with no React or Supabase imports
2. **FR-1.2**: The system SHALL detect question patterns using regex (e.g., `^\d+[).]`, `^Q\d+`)
3. **FR-1.3**: The system SHALL detect option patterns using regex (e.g., `^[A-E][).]`, `^([A-E])`)
4. **FR-1.4**: The system SHALL return a `QualityScanResult` containing `rawQuestionCount`, `questions[]`, and `globalIssues[]`
5. **FR-1.5**: The system SHALL support Lange-style MCQ formatting as the primary target

### FR-2: Issue Detection

1. **FR-2.1**: WHEN `rawQuestionCount > aiDraftCount` THEN the system SHALL flag `MISSING_QUESTIONS` with severity `high`
2. **FR-2.2**: WHEN `rawOptionCount > aiOptions` for a question THEN the system SHALL flag `MISSING_OPTIONS` with severity `high`
3. **FR-2.3**: WHEN `rawOptionCount < aiOptions` for a question THEN the system SHALL flag `EXTRA_OPTIONS` with severity `medium`
4. **FR-2.4**: The system SHALL attach `qualityIssues?: MCQIssue[]` to draft objects (in-memory only, not DB)

### FR-3: Batch Integration

1. **FR-3.1**: The system SHALL run `scanChunkForQuestionsAndOptions` on text chunks before AI processing
2. **FR-3.2**: The system SHALL compare scan results with AI drafts after generation
3. **FR-3.3**: The system SHALL NOT block draft creation based on quality issues
4. **FR-3.4**: The system SHALL gracefully handle scanning failures without throwing

### FR-4: Unified MCQ Options Editor

1. **FR-4.1**: The system SHALL provide a reusable `MCQOptionsEditor` component
2. **FR-4.2**: The component SHALL allow adding options up to `MCQ_LIMITS.maxOptions` (5)
3. **FR-4.3**: The component SHALL allow removing options down to `MCQ_LIMITS.minOptions` (2)
4. **FR-4.4**: The component SHALL safely update `correct_index` when options are removed
5. **FR-4.5**: The component SHALL use props + callbacks only (no direct DB calls)
6. **FR-4.6**: The component SHALL be mobile-first with vertical layout and touch-friendly buttons

### FR-5: Quality UI Integration

1. **FR-5.1**: The batch review panel SHALL display "Detected X questions, created Y drafts" summary
2. **FR-5.2**: The batch draft card SHALL show badges for high-severity issues
3. **FR-5.3**: The batch review panel SHALL provide a "Show flagged only" toggle
4. **FR-5.4**: The system SHALL provide a "View raw text" toggle to display source text chunks
5. **FR-5.5**: The UI SHALL handle drafts without `qualityIssues` gracefully (undefined-safe)

### FR-6: Staging Metrics Extension

1. **FR-6.1**: The system SHALL extend `QAMetrics` with `rawQuestionCount` and `aiDraftCount`
2. **FR-6.2**: The system SHALL track `numQuestionsWithMissingOptions` and `numQuestionsWithExtraOptions`
3. **FR-6.3**: New metrics fields SHALL be optional with sensible defaults
4. **FR-6.4**: Metrics SHALL remain in-memory only (no new DB columns)

### FR-7: Raw Text Passthrough

1. **FR-7.1**: The draft type SHALL include `rawTextChunk?: string` (in-memory only)
2. **FR-7.2**: The raw text SHALL be the exact string passed to `scanChunkForQuestionsAndOptions` and the AI
3. **FR-7.3**: The UI SHALL hide the "View raw text" toggle when `rawTextChunk` is unavailable

## Non-Functional Requirements

### NFR-1: Performance
- Scanner regex operations should complete in < 100ms for typical chunks

### NFR-2: Compatibility
- Must not break existing batch import flows
- Must not break existing card editor forms
- Older drafts without quality fields must render without errors

### NFR-3: Testing
- Property-based tests for regex scanner using fast-check
- Unit tests for edge cases (empty text, malformed patterns)
