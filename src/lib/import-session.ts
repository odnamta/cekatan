/**
 * V11.3: Import Session Utilities
 * 
 * Provides functions for managing import sessions in the content staging workflow.
 * Import sessions group cards created during a single bulk import operation.
 */

/**
 * Generates a unique import session ID.
 * Uses crypto.randomUUID() for UUID v4 generation.
 * 
 * @returns A unique UUID string for the import session
 */
export function generateImportSessionId(): string {
  return crypto.randomUUID()
}

/**
 * Card status type for the staging workflow.
 * - draft: Card is not visible in study flows, pending QA review
 * - published: Card is live and visible in all study flows
 * - archived: Card is hidden from study but retained for historical purposes
 */
export type CardStatus = 'draft' | 'published' | 'archived'

/**
 * Import session metadata interface.
 * Represents the context of a bulk import operation.
 */
export interface ImportSessionMeta {
  id: string
  bookSourceId: string | null
  bookTitle: string | null
  chapterId: string | null
  chapterTitle: string | null
  draftCount: number
  publishedCount: number
  archivedCount: number
  createdAt: string
}

/**
 * Session card interface for the review UI.
 */
export interface SessionCard {
  id: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string | null
  questionNumber: number | null
  status: CardStatus
  tags: Array<{ id: string; name: string; color: string }>
  createdAt: string
  updatedAt: string
}
