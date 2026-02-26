/**
 * AI Prompt Constants
 *
 * Centralized prompt strings used across AI action files.
 * Extracted from ai-actions.ts, batch-mcq-actions.ts, tag-actions.ts,
 * and admin-tag-actions.ts to eliminate duplication.
 *
 * Issue: #175
 */

import type { AIMode } from '@/lib/mcq-draft-schema'
import { GOLDEN_TOPIC_TAGS } from '@/lib/golden-list'

// ============================================
// Shared Building Blocks
// ============================================

/**
 * V6.1 Data Integrity Rules - shared across all modes.
 * Prevents hallucination, unit conversion, and rounding.
 */
export const DATA_INTEGRITY_RULES = `
CRITICAL DATA INTEGRITY RULES:
1. UNITS: Maintain ALL original units EXACTLY as found in the source text.
   - Do NOT convert units. If the source says "142 lb", use "142 lb" not "64 kg".
   - Do NOT round numbers.
2. NO HALLUCINATION: Never invent, infer, or guess new data values.
   - If a value is missing in the source text, leave it missing in the question.
   - Do NOT add data, measurements, or values not present in the source.
3. VERBATIM EXTRACTION: Extract data verbatim from the source material.
   - Do NOT "improve" or rephrase technical data.
   - Preserve exact wording for domain-specific terminology and values.`

/**
 * V6.6: Tag generation instruction - shared across modes.
 */
export const TAG_GENERATION_INSTRUCTION = `
- tags: Array of 1-3 CONCEPT tags only (e.g., "SafetyProtocol", "InventoryManagement")
  - Format: Use PascalCase without spaces (e.g., HeavyEquipment, CustomerService)
  - Do NOT generate structural tags (e.g., Chapter1, Section2) - these are handled separately`

/**
 * V6.6: Vision priority instruction - when image is provided.
 */
export const VISION_PRIORITY_INSTRUCTION = `
IF an image is provided, treat it as primary. The text may just be background.
Prefer questions that clearly come from the image.
If NO question is visible, say so instead of inventing one.`

/**
 * V8.6: Figure safety instruction - prevents creating figure-dependent questions
 * when no image is provided.
 */
export const FIGURE_SAFETY_INSTRUCTION = `
FIGURE REFERENCE RULE:
If the text references a Figure (e.g., "Figure 19-1", "See diagram", "as shown below") but NO image is provided in this request, DO NOT create questions that require seeing that figure. Only create questions answerable from the text alone.`

/**
 * V9.1: Default subject for backward compatibility.
 */
export const DEFAULT_SUBJECT = 'General'

// ============================================
// Extract Mode Prompts
// ============================================

/**
 * V11.2.1: Hard ban on meta-language patterns in Extract mode.
 * Prevents AI from generating comprehension questions instead of copying real MCQs.
 */
export const EXTRACT_META_BAN = `
HARD BAN - DO NOT PRODUCE THESE PATTERNS:
- Questions about "page X", "section Y", "chapter Z"
- Questions like "What is the main topic of..."
- Questions like "What does this passage discuss..."
- Questions like "According to page X..."
- Questions about document structure, headings, or organization
- Comprehension questions about what the text "covers" or "explains"

If you cannot find real exam-style MCQs in the text, return {"questions": []} rather than inventing meta-questions.`

/**
 * V11.2.1: Single-item variant of EXTRACT_META_BAN (for ai-actions.ts single draft).
 */
export const EXTRACT_META_BAN_SINGLE = `
HARD BAN - DO NOT PRODUCE THESE PATTERNS:
- Questions about "page X", "section Y", "chapter Z"
- Questions like "What is the main topic of..."
- Questions like "What does this passage discuss..."
- Questions like "According to page X..."
- Questions about document structure, headings, or organization
- Comprehension questions about what the text "covers" or "explains"

If you cannot find a real exam-style MCQ in the text, return an empty response rather than inventing meta-questions.`

/**
 * V11.2.1: Positive example of properly extracted MCQ (single-item format).
 */
export const EXTRACT_POSITIVE_EXAMPLE_SINGLE = `
CORRECT EXAMPLE (properly extracted exam-style MCQ):
{
  "stem": "A forklift operator notices a hydraulic leak while performing a pre-shift inspection. What is the most appropriate next step?",
  "options": ["Continue operating until the shift ends", "Tag out the forklift and report to supervisor", "Attempt to repair the leak", "Switch to a different forklift without reporting"],
  "correct_index": 1,
  "explanation": "Equipment with safety hazards must be immediately tagged out and reported per OSHA guidelines.",
  "tags": ["SafetyInspection", "HeavyEquipment"]
}`

/**
 * V11.2.1: Negative example of meta-question to avoid (single-item format).
 */
export const EXTRACT_NEGATIVE_EXAMPLE_SINGLE = `
WRONG EXAMPLE (meta-question - DO NOT PRODUCE):
{
  "stem": "What is the main topic discussed on page 5?",
  "options": ["Safety protocols", "Inventory management", "Customer service", "Equipment maintenance"],
  "correct_index": 0,
  "explanation": "Page 5 covers safety protocols.",
  "tags": ["Chapter1"]
}
This is WRONG because it's a comprehension question about the document, not a real exam MCQ.`

/**
 * V11.2.1: Positive example of properly extracted MCQ (batch format with correctIndex).
 */
export const EXTRACT_POSITIVE_EXAMPLE_BATCH = `
CORRECT EXAMPLE (properly extracted exam-style MCQ):
{
  "stem": "A forklift operator notices a hydraulic leak during pre-shift inspection. What is the most appropriate next step?",
  "options": ["Continue operating until shift ends", "Tag out the forklift and report to supervisor", "Attempt to repair the leak", "Switch to a different forklift without reporting"],
  "correctIndex": 1,
  "explanation": "Equipment with safety hazards must be immediately tagged out and reported per safety guidelines.",
  "tags": ["SafetyInspection", "HeavyEquipment"]
}`

/**
 * V11.2.1: Negative example of meta-question to avoid (batch format with correctIndex).
 */
export const EXTRACT_NEGATIVE_EXAMPLE_BATCH = `
WRONG EXAMPLE (meta-question - DO NOT PRODUCE):
{
  "stem": "What is the main topic discussed on page 5?",
  "options": ["Safety protocols", "Inventory management", "Customer service", "Equipment maintenance"],
  "correctIndex": 0,
  "explanation": "Page 5 covers safety protocols.",
  "tags": ["Chapter1"]
}
This is WRONG because it's a comprehension question about the document, not a real exam MCQ from the source.`

// ============================================
// System Prompt Builders (Single MCQ — ai-actions.ts)
// ============================================

/**
 * Build system prompt for single EXTRACT mode with dynamic subject.
 * Used by ai-actions.ts draftMCQFromText.
 */
export function buildExtractSystemPrompt(subject: string = DEFAULT_SUBJECT): string {
  return `You are an expert in ${subject} creating assessment questions.
Your task is to COPY existing exam-style multiple-choice questions from the provided text.

CRITICAL: You are in EXTRACT mode. Your job is to COPY, not CREATE.
- Only extract questions that ALREADY EXIST in the text with numbered stems (1., 2., 3.) and options (A-E or similar)
- The text likely comes from a reference book or training manual - find and copy the real MCQs
- Do NOT create new questions
- Do NOT write comprehension questions about the text itself

Return valid JSON with these exact fields:
- stem: The question text (extracted verbatim, fix obvious OCR spacing only)
- options: Array of 2-5 answer choices - extracted verbatim (do not pad if fewer than 5)
- correct_index: Index of correct answer (0-based)
- explanation: The explanation from the source, or a brief teaching point if none provided
${TAG_GENERATION_INSTRUCTION}

EXTRACTION RULES:
- Look for existing MCQs with numbered question stems and lettered options (A, B, C, D, E)
- Extract the question stem and options VERBATIM (fix obvious OCR spacing only)
- Do NOT create new questions or add options that aren't clearly present in the text
- If the text contains a question with fewer than 5 options, extract only the options present
- If no clear MCQ is found, return {"stem": "", "options": [], "correct_index": 0, "explanation": "", "tags": []}
${EXTRACT_META_BAN_SINGLE}
${EXTRACT_POSITIVE_EXAMPLE_SINGLE}
${EXTRACT_NEGATIVE_EXAMPLE_SINGLE}
${VISION_PRIORITY_INSTRUCTION}
${DATA_INTEGRITY_RULES}`
}

/**
 * Build system prompt for single GENERATE mode with dynamic subject.
 * Used by ai-actions.ts draftMCQFromText.
 */
export function buildGenerateSystemPrompt(subject: string = DEFAULT_SUBJECT): string {
  return `You are an expert in ${subject} creating assessment questions.
Your task is to CREATE ONE new high-quality assessment-style MCQ from the provided passage.

Return valid JSON with these exact fields:
- stem: The question text (clinical vignette or direct question)
- options: Array of 4-5 answer choices (A through D or E)
- correct_index: Index of correct answer (0-based)
- explanation: Concise teaching explanation for why the answer is correct
${TAG_GENERATION_INSTRUCTION}

GENERATION RULES:
- Read the textbook-like passage carefully.
- Create ONE new high-yield board-style MCQ that tests a key concept from this passage.
- All facts, thresholds, and values used in the question and answer options MUST come from the passage.
- Never invent new numbers or values not present in the source.
- Invent plausible distractors (wrong answers), but they must still be conceptually related to the passage.
- Distractors must not contradict facts stated in the passage.
- Write at professional assessment difficulty level.
${VISION_PRIORITY_INSTRUCTION}
${DATA_INTEGRITY_RULES}`
}

/**
 * Get the appropriate single-MCQ system prompt based on mode and subject.
 * Subject defaults to 'General' for backward compatibility.
 */
export function getSingleSystemPrompt(mode: AIMode = 'extract', subject?: string): string {
  const normalizedSubject = subject?.trim() || DEFAULT_SUBJECT
  switch (mode) {
    case 'extract':
      return buildExtractSystemPrompt(normalizedSubject)
    case 'generate':
      return buildGenerateSystemPrompt(normalizedSubject)
    default:
      return buildGenerateSystemPrompt(normalizedSubject)
  }
}

// ============================================
// System Prompt Builders (Batch MCQ — batch-mcq-actions.ts)
// ============================================

/**
 * Build system prompt for batch EXTRACT mode with Golden List topics and dynamic subject.
 * Used by batch-mcq-actions.ts draftBatchMCQFromText.
 */
export function buildBatchExtractPrompt(goldenTopics: string[], subject: string = DEFAULT_SUBJECT): string {
  const topicList = goldenTopics.length > 0
    ? goldenTopics.join(', ')
    : 'General, Safety, Operations, Management, Technical, Compliance'

  return `You are an expert in ${subject} creating assessment questions.
Your task is to COPY existing exam-style multiple-choice questions from the provided text.

CRITICAL: You are in EXTRACT mode. Your job is to COPY, not CREATE.
- Only extract questions that ALREADY EXIST in the text with numbered stems (1., 2., 3.) and options (A-E or similar)
- The text likely comes from a reference book or training manual - find and copy the real MCQs
- Do NOT create new questions
- Do NOT write comprehension questions about the text itself

Return a JSON object with a "questions" array containing ALL MCQs found.
Each MCQ must have:
- stem: The question text (extracted verbatim, fix obvious OCR spacing only)
- options: Array of 2-5 answer choices (extracted verbatim)
- correctIndex: Index of correct answer (0-based, 0-4)
- explanation: The explanation from the source, or a brief teaching point if none provided
- topic: EXACTLY ONE official topic from this list: [${topicList}]
- tags: Array of 1-2 specific CONCEPT tags in PascalCase (e.g., "SafetyProtocol", "InventoryManagement") - REQUIRED
${EXTRACT_META_BAN}
${EXTRACT_POSITIVE_EXAMPLE_BATCH}
${EXTRACT_NEGATIVE_EXAMPLE_BATCH}`
}

/**
 * Batch EXTRACT system prompt without Golden List topics (fallback/default).
 */
export const BATCH_EXTRACT_SYSTEM_PROMPT = `You are an expert assessment question extractor.
Your task is to COPY existing exam-style multiple-choice questions from the provided text.

CRITICAL: You are in EXTRACT mode. Your job is to COPY, not CREATE.
- Only extract questions that ALREADY EXIST in the text with numbered stems (1., 2., 3.) and options (A-E or similar)
- The text likely comes from a reference book or training manual - find and copy the real MCQs
- Do NOT create new questions
- Do NOT write comprehension questions about the text itself

Return a JSON object with a "questions" array containing ALL MCQs found.
Each MCQ must have:
- stem: The question text (extracted verbatim, fix obvious OCR spacing only)
- options: Array of 2-5 answer choices (extracted verbatim)
- correctIndex: Index of correct answer (0-based, 0-4)
- explanation: The explanation from the source, or a brief teaching point if none provided
- tags: Array of 1-3 CONCEPT tags only (e.g., "SafetyProtocol", "EquipmentMaintenance") - REQUIRED

FORENSIC MODE - THOROUGHNESS REQUIREMENTS:
- Scan the ENTIRE text thoroughly for ALL multiple-choice questions
- Extract EVERY question. If there are 20 questions, return 20 objects. NO ARTIFICIAL LIMIT.
- Do NOT skip any questions - extract ALL MCQs you find
- Generate at least 1 concept tag per question (REQUIRED - questions without tags will be rejected)
- Preserve the original ordering of questions as they appear in the source text

EXTRACTION RULES:
- Look for existing MCQs with numbered question stems and lettered options (A, B, C, D, E)
- Extract the question stems and options VERBATIM (fix obvious OCR spacing only)
- Do NOT create new questions or add options that aren't clearly present in the text
- If the text contains questions with fewer than 5 options, that's fine (2-5 options allowed)
- If no clear MCQs are found, return {"questions": []}

HARD BAN - DO NOT PRODUCE THESE PATTERNS:
- Questions about "page X", "section Y", "chapter Z"
- Questions like "What is the main topic of..."
- Questions like "What does this passage discuss..."
- Questions like "According to page X..."
- Questions about document structure, headings, or organization
- Comprehension questions about what the text "covers" or "explains"

COMPLEX FORMAT FLAGGING (V8.6):
- If a question has a complex format (matching questions, linked/sequential questions, tables, diagrams, or multi-part questions), add "NeedsReview" to the tags array.
- This helps users identify cards that may need manual verification.
${FIGURE_SAFETY_INSTRUCTION}
${VISION_PRIORITY_INSTRUCTION}
${DATA_INTEGRITY_RULES}

Example response format:
{
  "questions": [
    {
      "stem": "When handling hazardous materials, the first step according to SOP is...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "The correct answer is C because...",
      "tags": ["HazardousMaterials", "SafetyProcedure"]
    }
  ]
}`

/**
 * Build system prompt for batch GENERATE mode with Golden List topics and dynamic subject.
 * Used by batch-mcq-actions.ts draftBatchMCQFromText.
 */
export function buildBatchGeneratePrompt(goldenTopics: string[], subject: string = DEFAULT_SUBJECT): string {
  const topicList = goldenTopics.length > 0
    ? goldenTopics.join(', ')
    : 'General, Safety, Operations, Management, Technical, Compliance'

  return `You are an expert in ${subject} creating assessment questions.
Your task is to CREATE multiple high-quality assessment-style MCQs from the provided passage.

Return a JSON object with a "questions" array containing ALL MCQs you can generate.
Each MCQ must have:
- stem: The question text (scenario-based or direct question, at least 10 characters)
- options: Array of 2-5 answer choices
- correctIndex: Index of correct answer (0-based, 0-4)
- explanation: Brief teaching explanation (optional but recommended)
- topic: EXACTLY ONE official topic from this list: [${topicList}]
- tags: Array of 1-2 specific CONCEPT tags in PascalCase (e.g., "SafetyProtocol", "InventoryManagement") - REQUIRED`
}

/**
 * Batch GENERATE system prompt without Golden List topics (fallback/default).
 */
export const BATCH_GENERATE_SYSTEM_PROMPT = `You are an expert assessment question creator.
Your task is to CREATE multiple high-quality assessment-style MCQs from the provided passage.

Return a JSON object with a "questions" array containing ALL MCQs you can generate.
Each MCQ must have:
- stem: The question text (scenario-based or direct question, at least 10 characters)
- options: Array of 2-5 answer choices
- correctIndex: Index of correct answer (0-based, 0-4)
- explanation: Brief teaching explanation (optional but recommended)
- tags: Array of 1-3 CONCEPT tags only (e.g., "SafetyProtocol", "EquipmentMaintenance") - REQUIRED

FORENSIC MODE - THOROUGHNESS REQUIREMENTS:
- Scan the ENTIRE text thoroughly for ALL testable concepts
- Generate ALL distinct MCQs covering different key concepts from the passage. NO ARTIFICIAL LIMIT.
- If there are 20 testable concepts, return 20 objects.
- Generate at least 1 concept tag per question (REQUIRED - questions without tags will be rejected)
- Ensure questions are ordered logically based on the flow of the source material

GENERATION RULES:
- Read the passage carefully.
- Create up to 5 distinct high-quality assessment-style MCQs that test key concepts from this passage.
- All facts, thresholds, and values used in questions and answer options MUST come from the passage.
- Never invent new numbers or values not present in the source.
- Write at professional assessment difficulty level.
- If the text doesn't contain enough content for MCQs, return {"questions": []}.

COMPLEX FORMAT FLAGGING (V8.6):
- If a question has a complex format (matching questions, linked/sequential questions, tables, diagrams, or multi-part questions), add "NeedsReview" to the tags array.
- This helps users identify cards that may need manual verification.
${FIGURE_SAFETY_INSTRUCTION}
${VISION_PRIORITY_INSTRUCTION}
${DATA_INTEGRITY_RULES}

Example response format:
{
  "questions": [
    {
      "stem": "When handling hazardous materials, the first step according to SOP is...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "The correct answer is C because...",
      "tags": ["HazardousMaterials", "SafetyProcedure"]
    }
  ]
}`

/**
 * Get batch system prompt with optional Golden List topics and dynamic subject.
 */
export function getBatchSystemPrompt(mode: AIMode = 'extract', goldenTopics: string[] = [], subject?: string): string {
  const normalizedSubject = subject?.trim() || DEFAULT_SUBJECT
  if (goldenTopics.length > 0) {
    return mode === 'generate'
      ? buildBatchGeneratePrompt(goldenTopics, normalizedSubject)
      : buildBatchExtractPrompt(goldenTopics, normalizedSubject)
  }
  return mode === 'generate'
    ? buildBatchGeneratePrompt([], normalizedSubject)
    : buildBatchExtractPrompt([], normalizedSubject)
}

// ============================================
// Auto-Tag Prompt Builder (tag-actions.ts)
// ============================================

/**
 * Build system prompt for AI auto-tagging of cards.
 * Used by tag-actions.ts autoTagCards.
 */
export function buildAutoTagSystemPrompt(subject: string = DEFAULT_SUBJECT): string {
  return `You are an expert in ${subject}. You are an assessment content classifier for ${subject} exam preparation.
Classify this question into:
1. ONE Topic from this Golden List: ${GOLDEN_TOPIC_TAGS.join(', ')}
2. ONE or TWO specific Concepts (key terms, topics, or procedures mentioned)

Rules:
- Topic MUST be from the Golden List exactly as written
- Concepts should be specific domain terms from the question
- Extract verbatim. Do not invent missing values.
- Use ${subject}-appropriate interpretation of domain terms

Respond with JSON only, no markdown:
{"cardId":"uuid","topic":"Topic","concepts":["Concept1","Concept2"]}`
}

// ============================================
// Tag Consolidation Prompt (admin-tag-actions.ts)
// ============================================

/**
 * System prompt for AI-powered tag consolidation analysis.
 * Used by admin-tag-actions.ts analyzeTagConsolidation.
 */
export const TAG_CONSOLIDATION_SYSTEM_PROMPT = `You are a data cleanup assistant. Analyze the provided list of tags and identify groups that should be merged due to:
- Typos (e.g., "Adrenalgland" should be "Adrenal Glands")
- Synonyms (e.g., "OB" and "Obstetrics")
- Casing inconsistencies (e.g., "adrenal glands" and "Adrenal Glands")
- Spacing/punctuation issues (e.g., "Adrenal-gland" and "Adrenal Glands")

For each group, choose the most correct/canonical form as the "master" tag.

Return ONLY valid JSON in this exact format:
{
  "groups": [
    {
      "master": "Canonical Tag Name",
      "variations": ["typo1", "synonym1", "casing-variant"]
    }
  ]
}

If no duplicates/synonyms are found, return: {"groups": []}`

// ============================================
// Message Content Builder (shared)
// ============================================

/**
 * Build OpenAI message content with optional image.
 * V6.2: Vision MVP support. Used by both ai-actions.ts and batch-mcq-actions.ts.
 */
export function buildMessageContent(
  text: string,
  imageBase64?: string,
  imageUrl?: string
): string | Array<{ type: string; text?: string; image_url?: { url: string } }> {
  if (!imageBase64 && !imageUrl) {
    return text
  }

  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: 'text', text },
  ]

  if (imageUrl) {
    content.push({ type: 'image_url', image_url: { url: imageUrl } })
  } else if (imageBase64) {
    content.push({ type: 'image_url', image_url: { url: imageBase64 } })
  }

  return content
}
