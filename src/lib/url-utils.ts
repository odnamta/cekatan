/**
 * V11.7: URL utilities for tag-filtered study sessions.
 * 
 * **Feature: v11.7-companion-dashboard-tag-filtered-study**
 */

// UUID v4 regex pattern for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validates if a string is a valid UUID v4.
 */
export function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str)
}

/**
 * Parse tag IDs from URL search params.
 * Expects format: ?tags=uuid1,uuid2,uuid3
 * Filters out invalid UUIDs and returns empty array for missing/empty param.
 * 
 * **Property 5: URL parsing extracts valid tag IDs**
 * **Validates: Requirements 2.2, 2.3, 2.4**
 * 
 * @param searchParams - URL search params string or URLSearchParams object
 * @returns Array of valid UUID strings
 */
export function parseTagIdsFromUrl(
  searchParams: string | URLSearchParams | { tags?: string } | null | undefined
): string[] {
  if (!searchParams) return []

  let tagsParam: string | null = null

  if (typeof searchParams === 'string') {
    const params = new URLSearchParams(searchParams)
    tagsParam = params.get('tags')
  } else if (searchParams instanceof URLSearchParams) {
    tagsParam = searchParams.get('tags')
  } else if (typeof searchParams === 'object' && 'tags' in searchParams) {
    tagsParam = searchParams.tags ?? null
  }

  if (!tagsParam || tagsParam.trim() === '') return []

  // Split by comma and filter to valid UUIDs only
  return tagsParam
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0 && isValidUUID(id))
}

/**
 * Build study URL with optional tag filter.
 * Returns /study/global with ?tags= query param if tagIds provided.
 * 
 * **Property 4: URL construction includes tagIds correctly**
 * **Validates: Requirements 2.1**
 * 
 * @param tagIds - Optional array of tag IDs to include
 * @returns URL string for global study page
 */
export function buildStudyUrl(tagIds?: string[]): string {
  const basePath = '/study/global'
  
  if (!tagIds || tagIds.length === 0) {
    return basePath
  }

  // Filter to valid UUIDs only
  const validIds = tagIds.filter(isValidUUID)
  if (validIds.length === 0) {
    return basePath
  }

  return `${basePath}?tags=${validIds.join(',')}`
}
