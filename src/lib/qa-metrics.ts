/**
 * V11.3: QA Metrics Utilities
 * 
 * Provides functions for formatting and calculating QA metrics
 * in the content staging workflow.
 */

/**
 * Formats QA metrics into a human-readable string.
 * 
 * @param detectedCount - Number of questions detected in source text
 * @param createdCount - Number of cards actually created
 * @param missingNumbers - Array of question numbers that are missing
 * @returns Formatted string like "Detected 59 questions · 44 cards created · Missing: 52, 53, 54"
 */
export function formatQAMetrics(
  detectedCount: number,
  createdCount: number,
  missingNumbers: number[]
): string {
  const missingPart = missingNumbers.length > 0
    ? ` · Missing: ${missingNumbers.join(', ')}`
    : ''
  return `Detected ${detectedCount} questions · ${createdCount} cards created${missingPart}`
}

/**
 * Calculates the coverage percentage of created cards vs detected questions.
 * 
 * @param detectedCount - Number of questions detected
 * @param createdCount - Number of cards created
 * @returns Coverage percentage (0-100)
 */
export function calculateCoverage(detectedCount: number, createdCount: number): number {
  if (detectedCount === 0) return 100
  return Math.round((createdCount / detectedCount) * 100)
}

/**
 * Formats a compact summary for the session panel.
 * 
 * @param draftCount - Number of draft cards in session
 * @param detectedCount - Number of questions detected
 * @param missingCount - Number of missing questions
 * @returns Formatted string like "44 draft cards · Detected 59 · Missing 8"
 */
export function formatSessionSummary(
  draftCount: number,
  detectedCount: number,
  missingCount: number
): string {
  const parts = [`${draftCount} draft cards`]
  
  if (detectedCount > 0) {
    parts.push(`Detected ${detectedCount}`)
  }
  
  if (missingCount > 0) {
    parts.push(`Missing ${missingCount}`)
  }
  
  return parts.join(' · ')
}
