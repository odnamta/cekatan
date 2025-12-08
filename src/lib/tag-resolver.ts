/**
 * V11.5: Tag Resolver
 * Pure helper functions for resolving tag names to canonical forms.
 * 
 * **Feature: v11.5-global-study-stabilization**
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**
 */

import { GOLDEN_TOPIC_TAGS, type GoldenTopicTag } from './golden-list'

/**
 * Resolves an input string to a canonical Golden List topic tag.
 * Case-insensitive matching.
 * 
 * @param input - The topic string to resolve
 * @returns The canonical form if valid, null otherwise
 * 
 * **Property 10: Topic Tag Resolution - Valid Input**
 * **Property 11: Topic Tag Resolution - Invalid Input**
 */
export function resolveTopicTag(input: string): GoldenTopicTag | null {
  if (!input || typeof input !== 'string') return null
  
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  
  const found = GOLDEN_TOPIC_TAGS.find(
    (tag) => tag.toLowerCase() === normalized
  )
  
  return found ?? null
}

/**
 * Resolves a concept tag to a normalized form.
 * Trims whitespace and converts to PascalCase.
 * 
 * @param input - The concept string to normalize
 * @returns Normalized concept string
 */
export function resolveConceptTag(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  const trimmed = input.trim()
  if (!trimmed) return ''
  
  // Convert to PascalCase: "gestational diabetes" -> "GestationalDiabetes"
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Checks if a string is a valid Golden List topic (case-insensitive).
 * 
 * @param input - The string to check
 * @returns true if it's a valid topic
 */
export function isValidTopic(input: string): boolean {
  return resolveTopicTag(input) !== null
}

/**
 * Batch resolve multiple topic tags.
 * Returns only valid topics in their canonical form.
 * 
 * @param inputs - Array of topic strings
 * @returns Array of valid canonical topic tags
 */
export function resolveTopicTags(inputs: string[]): GoldenTopicTag[] {
  const result: GoldenTopicTag[] = []
  const seen = new Set<string>()
  
  for (const input of inputs) {
    const resolved = resolveTopicTag(input)
    if (resolved && !seen.has(resolved)) {
      seen.add(resolved)
      result.push(resolved)
    }
  }
  
  return result
}
