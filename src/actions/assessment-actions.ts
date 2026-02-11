'use server'

/**
 * V13: Assessment Server Actions
 * CRUD for assessments, session management, scoring.
 */

import { revalidatePath } from 'next/cache'
import { withOrgUser } from '@/actions/_helpers'
import { createAssessmentSchema, submitAnswerSchema } from '@/lib/validations'
import { hasMinimumRole } from '@/lib/org-authorization'
import type { ActionResultV2 } from '@/types/actions'
import type {
  Assessment,
  AssessmentSession,
  AssessmentAnswer,
  AssessmentWithDeck,
  SessionWithAssessment,
} from '@/types/database'

// ============================================
// Assessment CRUD
// ============================================

/**
 * Create a new assessment from a deck.
 * Requires creator+ role.
 */
export async function createAssessment(
  input: {
    deckTemplateId: string
    title: string
    description?: string
    timeLimitMinutes: number
    passScore: number
    questionCount: number
    shuffleQuestions?: boolean
    shuffleOptions?: boolean
    showResults?: boolean
    maxAttempts?: number
  }
): Promise<ActionResultV2<Assessment>> {
  return withOrgUser(async ({ user, supabase, org, role }) => {
    if (!hasMinimumRole(role, 'creator')) {
      return { ok: false, error: 'Only creators and above can create assessments' }
    }

    const validation = createAssessmentSchema.safeParse(input)
    if (!validation.success) {
      return { ok: false, error: validation.error.issues[0]?.message ?? 'Validation failed' }
    }

    // Verify deck belongs to org
    const { data: deck } = await supabase
      .from('deck_templates')
      .select('id, org_id')
      .eq('id', input.deckTemplateId)
      .single()

    if (!deck) {
      return { ok: false, error: 'Deck not found' }
    }

    // Count available questions
    const { count: cardCount } = await supabase
      .from('card_templates')
      .select('*', { count: 'exact', head: true })
      .eq('deck_template_id', input.deckTemplateId)

    if (!cardCount || cardCount < input.questionCount) {
      return {
        ok: false,
        error: `Deck only has ${cardCount ?? 0} questions. Reduce question count or add more questions.`,
      }
    }

    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert({
        org_id: org.id,
        deck_template_id: input.deckTemplateId,
        title: input.title,
        description: input.description ?? null,
        time_limit_minutes: input.timeLimitMinutes,
        pass_score: input.passScore,
        question_count: input.questionCount,
        shuffle_questions: input.shuffleQuestions ?? true,
        shuffle_options: input.shuffleOptions ?? false,
        show_results: input.showResults ?? true,
        max_attempts: input.maxAttempts ?? null,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath('/assessments')
    return { ok: true, data: assessment as Assessment }
  })
}

/**
 * Get all assessments for the current org.
 * Candidates see only published. Creators see all.
 */
export async function getOrgAssessments(): Promise<ActionResultV2<AssessmentWithDeck[]>> {
  return withOrgUser(async ({ user, supabase, org, role }) => {
    let query = supabase
      .from('assessments')
      .select(`
        *,
        deck_templates!inner(title)
      `)
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })

    // Candidates only see published assessments
    if (!hasMinimumRole(role, 'creator')) {
      query = query.eq('status', 'published')
    }

    const { data, error } = await query

    if (error) {
      return { ok: false, error: error.message }
    }

    // Get session counts
    const assessmentIds = (data ?? []).map((a) => a.id)
    const { data: sessionCounts } = assessmentIds.length > 0
      ? await supabase
          .from('assessment_sessions')
          .select('assessment_id')
          .in('assessment_id', assessmentIds)
      : { data: [] }

    const countMap = new Map<string, number>()
    for (const s of sessionCounts ?? []) {
      countMap.set(s.assessment_id, (countMap.get(s.assessment_id) ?? 0) + 1)
    }

    const assessments: AssessmentWithDeck[] = (data ?? []).map((a) => ({
      ...a,
      deck_title: (a.deck_templates as unknown as { title: string }).title,
      session_count: countMap.get(a.id) ?? 0,
    }))

    return { ok: true, data: assessments }
  })
}

/**
 * Get a single assessment by ID.
 */
export async function getAssessment(
  assessmentId: string
): Promise<ActionResultV2<Assessment>> {
  return withOrgUser(async ({ supabase, org }) => {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('org_id', org.id)
      .single()

    if (error || !data) {
      return { ok: false, error: 'Assessment not found' }
    }

    return { ok: true, data: data as Assessment }
  })
}

/**
 * Publish an assessment (draft → published).
 * Creator+ only.
 */
export async function publishAssessment(
  assessmentId: string
): Promise<ActionResultV2<void>> {
  return withOrgUser(async ({ supabase, org, role }) => {
    if (!hasMinimumRole(role, 'creator')) {
      return { ok: false, error: 'Insufficient permissions' }
    }

    const { error } = await supabase
      .from('assessments')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('id', assessmentId)
      .eq('org_id', org.id)
      .eq('status', 'draft')

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath('/assessments')
    return { ok: true }
  })
}

// ============================================
// Session Management
// ============================================

/**
 * Start an assessment session.
 * Selects questions, creates session and empty answer rows.
 */
export async function startAssessmentSession(
  assessmentId: string
): Promise<ActionResultV2<AssessmentSession>> {
  return withOrgUser(async ({ user, supabase, org }) => {
    // Fetch assessment
    const { data: assessment, error: aError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('org_id', org.id)
      .eq('status', 'published')
      .single()

    if (aError || !assessment) {
      return { ok: false, error: 'Assessment not found or not published' }
    }

    // Check max attempts
    if (assessment.max_attempts) {
      const { count } = await supabase
        .from('assessment_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', assessmentId)
        .eq('user_id', user.id)

      if ((count ?? 0) >= assessment.max_attempts) {
        return { ok: false, error: 'Maximum attempts reached' }
      }
    }

    // Check for existing in-progress session
    const { data: existingSession } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .maybeSingle()

    if (existingSession) {
      return { ok: true, data: existingSession as AssessmentSession }
    }

    // Select questions from deck
    const { data: cards, error: cError } = await supabase
      .from('card_templates')
      .select('id')
      .eq('deck_template_id', assessment.deck_template_id)

    if (cError || !cards || cards.length === 0) {
      return { ok: false, error: 'No questions available' }
    }

    // Shuffle and pick
    let questionIds = cards.map((c) => c.id)
    if (assessment.shuffle_questions) {
      questionIds = questionIds.sort(() => Math.random() - 0.5)
    }
    questionIds = questionIds.slice(0, assessment.question_count)

    // Create session
    const { data: session, error: sError } = await supabase
      .from('assessment_sessions')
      .insert({
        assessment_id: assessmentId,
        user_id: user.id,
        question_order: questionIds,
        time_remaining_seconds: assessment.time_limit_minutes * 60,
        status: 'in_progress',
      })
      .select()
      .single()

    if (sError || !session) {
      return { ok: false, error: 'Failed to start session' }
    }

    // Create empty answer rows
    const answerRows = questionIds.map((cardId) => ({
      session_id: session.id,
      card_template_id: cardId,
    }))

    await supabase.from('assessment_answers').insert(answerRows)

    return { ok: true, data: session as AssessmentSession }
  })
}

/**
 * Submit an answer for a question in an active session.
 */
export async function submitAnswer(
  sessionId: string,
  cardTemplateId: string,
  selectedIndex: number
): Promise<ActionResultV2<{ isCorrect: boolean }>> {
  return withOrgUser(async ({ user, supabase }) => {
    const validation = submitAnswerSchema.safeParse({ sessionId, cardTemplateId, selectedIndex })
    if (!validation.success) {
      return { ok: false, error: validation.error.issues[0]?.message ?? 'Validation failed' }
    }

    // Verify session is active and belongs to user
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('id, status')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .single()

    if (!session) {
      return { ok: false, error: 'Session not found or already completed' }
    }

    // Get the correct answer
    const { data: card } = await supabase
      .from('card_templates')
      .select('correct_index')
      .eq('id', cardTemplateId)
      .single()

    if (!card) {
      return { ok: false, error: 'Question not found' }
    }

    const isCorrect = selectedIndex === card.correct_index

    // Update the answer
    const { error } = await supabase
      .from('assessment_answers')
      .update({
        selected_index: selectedIndex,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('card_template_id', cardTemplateId)

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: { isCorrect } }
  })
}

/**
 * Complete an assessment session. Calculates final score.
 */
export async function completeSession(
  sessionId: string
): Promise<ActionResultV2<{ score: number; passed: boolean; total: number; correct: number }>> {
  return withOrgUser(async ({ user, supabase }) => {
    // Verify session
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('*, assessments!inner(pass_score)')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .single()

    if (!session) {
      return { ok: false, error: 'Session not found or already completed' }
    }

    // Get answers
    const { data: answers } = await supabase
      .from('assessment_answers')
      .select('is_correct')
      .eq('session_id', sessionId)

    const total = answers?.length ?? 0
    const correct = answers?.filter((a) => a.is_correct === true).length ?? 0
    const score = total > 0 ? Math.round((correct / total) * 100) : 0
    const passScore = (session.assessments as unknown as { pass_score: number }).pass_score
    const passed = score >= passScore

    // Update session
    const { error } = await supabase
      .from('assessment_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score,
        passed,
      })
      .eq('id', sessionId)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath('/assessments')
    return { ok: true, data: { score, passed, total, correct } }
  })
}

/**
 * Get session results with answers.
 */
export async function getSessionResults(
  sessionId: string
): Promise<ActionResultV2<{
  session: AssessmentSession
  answers: (AssessmentAnswer & { stem: string; options: string[]; correct_index: number; explanation: string | null })[]
}>> {
  return withOrgUser(async ({ user, supabase }) => {
    const { data: session, error: sError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sError || !session) {
      return { ok: false, error: 'Session not found' }
    }

    // Get answers with card details
    const { data: answers, error: aError } = await supabase
      .from('assessment_answers')
      .select(`
        *,
        card_templates!inner(stem, options, correct_index, explanation)
      `)
      .eq('session_id', sessionId)

    if (aError) {
      return { ok: false, error: aError.message }
    }

    const enrichedAnswers = (answers ?? []).map((a) => {
      const card = a.card_templates as unknown as {
        stem: string; options: string[]; correct_index: number; explanation: string | null
      }
      return {
        id: a.id,
        session_id: a.session_id,
        card_template_id: a.card_template_id,
        selected_index: a.selected_index,
        is_correct: a.is_correct,
        answered_at: a.answered_at,
        stem: card.stem,
        options: card.options,
        correct_index: card.correct_index,
        explanation: card.explanation,
      }
    })

    return {
      ok: true,
      data: { session: session as AssessmentSession, answers: enrichedAnswers },
    }
  })
}

/**
 * Get all sessions for an assessment (creator/admin view).
 */
export async function getAssessmentResults(
  assessmentId: string
): Promise<ActionResultV2<AssessmentSession[]>> {
  return withOrgUser(async ({ supabase, org, role }) => {
    if (!hasMinimumRole(role, 'creator')) {
      return { ok: false, error: 'Insufficient permissions' }
    }

    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('completed_at', { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: (data ?? []) as AssessmentSession[] }
  })
}

/**
 * Get user's sessions across all assessments in the org.
 */
export async function getMyAssessmentSessions(): Promise<ActionResultV2<SessionWithAssessment[]>> {
  return withOrgUser(async ({ user, supabase, org }) => {
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select(`
        *,
        assessments!inner(title, question_count, org_id)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    const sessions: SessionWithAssessment[] = (data ?? [])
      .filter((s) => {
        const a = s.assessments as unknown as { org_id: string }
        return a.org_id === org.id
      })
      .map((s) => {
        const a = s.assessments as unknown as { title: string; question_count: number }
        return {
          ...s,
          assessment_title: a.title,
          total_questions: a.question_count,
        }
      })

    return { ok: true, data: sessions }
  })
}

/**
 * Get questions for an active session (stems + options only, no correct answers).
 * Used by the take page to display questions during the exam.
 */
export async function getSessionQuestions(
  sessionId: string
): Promise<ActionResultV2<{ cardTemplateId: string; stem: string; options: string[] }[]>> {
  return withOrgUser(async ({ user, supabase }) => {
    // Verify session belongs to user
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('id, question_order')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return { ok: false, error: 'Session not found' }
    }

    const questionOrder = session.question_order as string[]

    // Fetch card details
    const { data: cards, error } = await supabase
      .from('card_templates')
      .select('id, stem, options')
      .in('id', questionOrder)

    if (error) {
      return { ok: false, error: error.message }
    }

    // Return in question_order sequence
    const cardMap = new Map((cards ?? []).map((c) => [c.id, c]))
    const questions = questionOrder
      .map((id) => {
        const card = cardMap.get(id)
        if (!card) return null
        return {
          cardTemplateId: card.id,
          stem: card.stem,
          options: card.options as string[],
        }
      })
      .filter((q): q is NonNullable<typeof q> => q !== null)

    return { ok: true, data: questions }
  })
}
