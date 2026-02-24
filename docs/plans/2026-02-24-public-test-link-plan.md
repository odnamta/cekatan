# Public Test Link Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let non-tech candidates take assessments via a shareable link (`/t/[code]`) with zero-friction registration, auto org membership, and a clean assessment-focused admin dashboard.

**Architecture:** New public route creates Supabase users via service role on registration, adds them to the org as candidates, then uses the existing assessment engine. Dashboard cleaned up for assessment focus.

**Tech Stack:** Next.js 16 App Router, Supabase (service role for registration), Zod validation, React 19

**Design doc:** `docs/plans/2026-02-24-public-test-link-design.md`

---

### Task 1: Database Migration — public_code + phone

**Files:**
- Create: `src/actions/public-assessment-actions.ts` (placeholder only)
- Modify: `src/types/database.ts` (Assessment + Profile types)

**Context:** We need `assessments.public_code` (short shareable code) and `profiles.phone` (for candidates who register with phone). These are the data model foundations.

**Step 1: Apply migration via Supabase MCP**

```sql
-- Add public_code to assessments
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS public_code VARCHAR(8) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_assessments_public_code ON assessments(public_code) WHERE public_code IS NOT NULL;

-- Add phone to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
```

Run via Supabase MCP `apply_migration` with name `add_public_code_and_phone`.

**Step 2: Update TypeScript types**

Modify `src/types/database.ts`:

In the `Assessment` interface, add after `access_code`:
```typescript
public_code: string | null
```

In the `Profile` interface, add after `avatar_url`:
```typescript
phone: string | null
```

**Step 3: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors related to `public_code` or `phone`

**Step 4: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add public_code to assessments and phone to profiles"
```

---

### Task 2: Public Code Generation + Validation Schemas

**Files:**
- Modify: `src/lib/validations.ts` (add schemas)
- Create: `src/__tests__/public-code.property.test.ts`

**Context:** We need a function to generate unique 6-char alphanumeric codes and a Zod schema for candidate registration (name required, at least one of email/phone).

**Step 1: Write property-based tests**

Create `src/__tests__/public-code.property.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generatePublicCode } from '@/lib/public-code'
import { publicRegistrationSchema } from '@/lib/validations'

describe('generatePublicCode', () => {
  it('generates 6-char uppercase alphanumeric strings', () => {
    fc.assert(
      fc.property(fc.integer(), () => {
        const code = generatePublicCode()
        expect(code).toMatch(/^[A-Z0-9]{6}$/)
        expect(code.length).toBe(6)
      }),
      { numRuns: 100 }
    )
  })

  it('generates unique codes across runs', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generatePublicCode()))
    // With 36^6 = 2.1B possible codes, collisions in 100 runs should be astronomically rare
    expect(codes.size).toBe(100)
  })
})

describe('publicRegistrationSchema', () => {
  it('accepts name + email', () => {
    const result = publicRegistrationSchema.safeParse({
      name: 'Budi',
      email: 'budi@gis.co',
    })
    expect(result.success).toBe(true)
  })

  it('accepts name + phone', () => {
    const result = publicRegistrationSchema.safeParse({
      name: 'Siti',
      phone: '081234567890',
    })
    expect(result.success).toBe(true)
  })

  it('accepts name + email + phone', () => {
    const result = publicRegistrationSchema.safeParse({
      name: 'Andi',
      email: 'andi@gis.co',
      phone: '081234567890',
    })
    expect(result.success).toBe(true)
  })

  it('rejects name only (no email or phone)', () => {
    const result = publicRegistrationSchema.safeParse({
      name: 'Budi',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = publicRegistrationSchema.safeParse({
      name: '',
      email: 'budi@gis.co',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = publicRegistrationSchema.safeParse({
      name: 'Budi',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short phone', () => {
    const result = publicRegistrationSchema.safeParse({
      name: 'Budi',
      phone: '0812',
    })
    expect(result.success).toBe(false)
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/public-code.property.test.ts`
Expected: FAIL — modules not found

**Step 3: Implement public code generator**

Create `src/lib/public-code.ts`:

```typescript
import crypto from 'crypto'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No 0/O/1/I to avoid confusion

/**
 * Generate a 6-character public code for assessment sharing.
 * Uses crypto.randomBytes for secure randomness.
 */
export function generatePublicCode(): string {
  const bytes = crypto.randomBytes(6)
  return Array.from(bytes)
    .map((b) => CHARS[b % CHARS.length])
    .join('')
}
```

**Step 4: Implement registration schema**

Add to `src/lib/validations.ts`:

```typescript
export const publicRegistrationSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang').trim(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().min(10, 'Nomor HP minimal 10 digit').max(15, 'Nomor HP terlalu panjang').regex(/^[0-9+\-\s]+$/, 'Format nomor HP tidak valid').optional().or(z.literal('')),
}).refine(
  (data) => (data.email && data.email.length > 0) || (data.phone && data.phone.length > 0),
  { message: 'Email atau nomor HP harus diisi', path: ['email'] }
)
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/public-code.property.test.ts`
Expected: All PASS

**Step 6: Run all tests to verify no regressions**

Run: `npm test`
Expected: All PASS

**Step 7: Commit**

```bash
git add src/lib/public-code.ts src/lib/validations.ts src/__tests__/public-code.property.test.ts
git commit -m "feat: add public code generator and registration validation schema"
```

---

### Task 3: Auto-Generate public_code on Publish

**Files:**
- Modify: `src/actions/assessment-actions.ts` (publishAssessment function, lines 212-258)

**Context:** When an admin publishes an assessment, auto-generate a `public_code` if it doesn't already have one. Store it in the DB. Clear it when archived.

**Step 1: Update publishAssessment**

In `src/actions/assessment-actions.ts`, modify the `publishAssessment` function.

After line 221 (`const { data: assessment } = await supabase`), change the select to also get `public_code`:
```typescript
.select('title, public_code')
```

After the status update (line 233-238), add public code generation if none exists:
```typescript
import { generatePublicCode } from '@/lib/public-code'

// Inside publishAssessment, after the status update succeeds:
if (!assessment.public_code) {
  // Generate unique public code with retry on collision
  let code: string | null = null
  for (let i = 0; i < 5; i++) {
    const candidate = generatePublicCode()
    const { error: codeError } = await supabase
      .from('assessments')
      .update({ public_code: candidate })
      .eq('id', assessmentId)
    if (!codeError) {
      code = candidate
      break
    }
  }
  if (!code) {
    console.warn('[publishAssessment] Failed to generate unique public code after 5 attempts')
  }
}
```

**Step 2: Update archiveAssessment**

In `archiveAssessment` function (line 264), add to the update object:
```typescript
.update({ status: 'archived', public_code: null, updated_at: new Date().toISOString() })
```

**Step 3: Verify build compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add src/actions/assessment-actions.ts
git commit -m "feat: auto-generate public_code on assessment publish"
```

---

### Task 4: Public Assessment Server Actions

**Files:**
- Create: `src/actions/public-assessment-actions.ts`

**Context:** These server actions handle the entire public test flow: fetch assessment by code, register candidate + create session, submit answers, complete session, get results. They use service role (no auth cookies) since candidates are unauthenticated.

**Step 1: Create the actions file**

Create `src/actions/public-assessment-actions.ts`:

```typescript
'use server'

import crypto from 'crypto'
import { headers } from 'next/headers'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { publicRegistrationSchema } from '@/lib/validations'
import type { ActionResultV2 } from '@/types/actions'
import type { Assessment, AssessmentSession } from '@/types/database'

// Simple in-memory rate limit (per-process, resets on deploy)
const ipAttempts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    ipAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

/**
 * Fetch a published assessment by its public_code.
 * Returns assessment metadata for the landing page (no auth required).
 */
export async function getPublicAssessment(
  code: string
): Promise<ActionResultV2<{
  assessment: Pick<Assessment, 'id' | 'title' | 'description' | 'time_limit_minutes' | 'pass_score' | 'question_count' | 'access_code' | 'start_date' | 'end_date' | 'shuffle_questions' | 'allow_review' | 'max_attempts'>
  orgName: string
  orgSlug: string
}>> {
  const supabase = await createSupabaseServiceClient()

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      id, title, description, time_limit_minutes, pass_score, question_count,
      access_code, start_date, end_date, shuffle_questions, allow_review, max_attempts,
      organizations!inner(name, slug)
    `)
    .eq('public_code', code.toUpperCase())
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return { ok: false, error: 'Asesmen tidak ditemukan atau sudah ditutup' }
  }

  const org = data.organizations as unknown as { name: string; slug: string }

  // Check schedule window
  const now = new Date()
  if (data.start_date && new Date(data.start_date) > now) {
    return { ok: false, error: 'Asesmen belum dibuka' }
  }
  if (data.end_date && new Date(data.end_date) < now) {
    return { ok: false, error: 'Asesmen sudah ditutup' }
  }

  return {
    ok: true,
    data: {
      assessment: {
        id: data.id,
        title: data.title,
        description: data.description,
        time_limit_minutes: data.time_limit_minutes,
        pass_score: data.pass_score,
        question_count: data.question_count,
        access_code: data.access_code ? 'required' : null, // Don't expose the actual code
        start_date: data.start_date,
        end_date: data.end_date,
        shuffle_questions: data.shuffle_questions,
        allow_review: data.allow_review,
        max_attempts: data.max_attempts,
      } as Pick<Assessment, 'id' | 'title' | 'description' | 'time_limit_minutes' | 'pass_score' | 'question_count' | 'access_code' | 'start_date' | 'end_date' | 'shuffle_questions' | 'allow_review' | 'max_attempts'>,
      orgName: org.name,
      orgSlug: org.slug,
    },
  }
}

/**
 * Register a guest candidate and start their assessment session.
 * Creates a Supabase auth user, adds them to the org, starts the session.
 * Returns sessionId + sessionToken for subsequent exam actions.
 */
export async function registerAndStartSession(
  code: string,
  input: { name: string; email?: string; phone?: string; accessCode?: string }
): Promise<ActionResultV2<{ sessionId: string; sessionToken: string; timeRemainingSeconds: number; questionCount: number }>> {
  // Rate limit by IP
  const hdrs = await headers()
  const clientIp = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown'
  if (!checkIpRateLimit(clientIp)) {
    return { ok: false, error: 'Terlalu banyak percobaan. Coba lagi nanti.' }
  }

  // Validate input
  const validation = publicRegistrationSchema.safeParse(input)
  if (!validation.success) {
    return { ok: false, error: validation.error.issues[0]?.message ?? 'Data tidak valid' }
  }

  const { name, email, phone } = validation.data
  const supabase = await createSupabaseServiceClient()

  // Fetch assessment + org
  const { data: assessment, error: aError } = await supabase
    .from('assessments')
    .select('*, organizations!inner(id, name, slug)')
    .eq('public_code', code.toUpperCase())
    .eq('status', 'published')
    .single()

  if (aError || !assessment) {
    return { ok: false, error: 'Asesmen tidak ditemukan' }
  }

  const org = assessment.organizations as unknown as { id: string; name: string; slug: string }

  // Validate access code if required
  if (assessment.access_code) {
    if (!input.accessCode) {
      return { ok: false, error: 'Kode akses diperlukan' }
    }
    const expected = Buffer.from(assessment.access_code, 'utf8')
    const provided = Buffer.from(input.accessCode, 'utf8')
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
      return { ok: false, error: 'Kode akses salah' }
    }
  }

  // Check schedule
  const now = new Date()
  if (assessment.start_date && new Date(assessment.start_date) > now) {
    return { ok: false, error: 'Asesmen belum dibuka' }
  }
  if (assessment.end_date && new Date(assessment.end_date) < now) {
    return { ok: false, error: 'Asesmen sudah ditutup' }
  }

  // Check if user already exists by email or phone
  let userId: string | null = null

  if (email) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (existingUser) userId = existingUser.id
  }

  if (!userId && phone) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()
    if (existingUser) userId = existingUser.id
  }

  // Create new user if not found
  if (!userId) {
    const tempPassword = crypto.randomBytes(16).toString('hex')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email || `${crypto.randomUUID().slice(0, 8)}@guest.cekatan.com`,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        onboarded: true, // Skip onboarding wizard
      },
    })

    if (authError || !authUser.user) {
      return { ok: false, error: 'Gagal membuat akun. Coba lagi.' }
    }

    userId = authUser.user.id

    // Update profile with phone if provided
    if (phone) {
      await supabase
        .from('profiles')
        .update({ phone, full_name: name })
        .eq('id', userId)
    }
  } else {
    // Update existing profile with latest name/phone
    const updates: Record<string, string> = {}
    if (name) updates.full_name = name
    if (phone) updates.phone = phone
    if (Object.keys(updates).length > 0) {
      await supabase.from('profiles').update(updates).eq('id', userId)
    }
  }

  // Add to org if not already a member
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('org_id', org.id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!existingMember) {
    await supabase.from('organization_members').insert({
      org_id: org.id,
      user_id: userId,
      role: 'candidate',
    })
  }

  // Check max attempts
  if (assessment.max_attempts) {
    const { count } = await supabase
      .from('assessment_sessions')
      .select('id', { count: 'exact' })
      .eq('assessment_id', assessment.id)
      .eq('user_id', userId)

    if ((count ?? 0) >= assessment.max_attempts) {
      return { ok: false, error: 'Jumlah percobaan maksimum telah tercapai' }
    }
  }

  // Check for existing in-progress session
  const { data: existingSession } = await supabase
    .from('assessment_sessions')
    .select('id, time_remaining_seconds')
    .eq('assessment_id', assessment.id)
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (existingSession) {
    const sessionToken = crypto.randomBytes(32).toString('hex')
    await supabase
      .from('assessment_sessions')
      .update({ ip_address: clientIp })
      .eq('id', existingSession.id)

    return {
      ok: true,
      data: {
        sessionId: existingSession.id,
        sessionToken,
        timeRemainingSeconds: existingSession.time_remaining_seconds ?? assessment.time_limit_minutes * 60,
        questionCount: assessment.question_count,
      },
    }
  }

  // Select questions from deck
  const { data: cards } = await supabase
    .from('card_templates')
    .select('id')
    .eq('deck_template_id', assessment.deck_template_id)

  if (!cards || cards.length === 0) {
    return { ok: false, error: 'Tidak ada pertanyaan tersedia' }
  }

  let questionIds = cards.map((c) => c.id)
  if (assessment.shuffle_questions) {
    questionIds = questionIds.sort(() => Math.random() - 0.5)
  }
  questionIds = questionIds.slice(0, assessment.question_count)

  // Generate session token
  const sessionToken = crypto.randomBytes(32).toString('hex')

  // Create session
  const { data: session, error: sError } = await supabase
    .from('assessment_sessions')
    .insert({
      assessment_id: assessment.id,
      user_id: userId,
      question_order: questionIds,
      time_remaining_seconds: assessment.time_limit_minutes * 60,
      status: 'in_progress',
      ip_address: clientIp,
    })
    .select('id')
    .single()

  if (sError || !session) {
    return { ok: false, error: 'Gagal memulai sesi' }
  }

  // Create empty answer rows
  const answerRows = questionIds.map((cardId) => ({
    session_id: session.id,
    card_template_id: cardId,
  }))
  await supabase.from('assessment_answers').insert(answerRows)

  return {
    ok: true,
    data: {
      sessionId: session.id,
      sessionToken,
      timeRemainingSeconds: assessment.time_limit_minutes * 60,
      questionCount: assessment.question_count,
    },
  }
}

/**
 * Submit an answer for a public exam session.
 * Uses sessionId for identity (no auth cookies).
 */
export async function submitPublicAnswer(
  sessionId: string,
  cardTemplateId: string,
  selectedIndex: number,
  timeRemainingSeconds?: number,
  timeSpentSeconds?: number
): Promise<ActionResultV2<{ isCorrect: boolean }>> {
  const supabase = await createSupabaseServiceClient()

  // Verify session is active
  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, status, question_order')
    .eq('id', sessionId)
    .eq('status', 'in_progress')
    .single()

  if (!session) {
    return { ok: false, error: 'Sesi tidak ditemukan atau sudah selesai' }
  }

  const questionOrder = session.question_order as string[]
  if (!questionOrder.includes(cardTemplateId)) {
    return { ok: false, error: 'Pertanyaan bukan bagian dari sesi ini' }
  }

  // Get correct answer
  const { data: card } = await supabase
    .from('card_templates')
    .select('correct_index')
    .eq('id', cardTemplateId)
    .single()

  if (!card) {
    return { ok: false, error: 'Pertanyaan tidak ditemukan' }
  }

  const isCorrect = selectedIndex === card.correct_index

  // Update answer
  await supabase
    .from('assessment_answers')
    .update({
      selected_index: selectedIndex,
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
      ...(timeSpentSeconds !== undefined && { time_spent_seconds: Math.round(timeSpentSeconds) }),
    })
    .eq('session_id', sessionId)
    .eq('card_template_id', cardTemplateId)

  // Persist timer
  if (timeRemainingSeconds !== undefined && timeRemainingSeconds >= 0) {
    await supabase
      .from('assessment_sessions')
      .update({ time_remaining_seconds: timeRemainingSeconds })
      .eq('id', sessionId)
  }

  return { ok: true, data: { isCorrect } }
}

/**
 * Complete a public exam session. Calculates score.
 */
export async function completePublicSession(
  sessionId: string
): Promise<ActionResultV2<{ score: number; passed: boolean; total: number; correct: number }>> {
  const supabase = await createSupabaseServiceClient()

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('*, assessments!inner(pass_score, title, org_id)')
    .eq('id', sessionId)
    .eq('status', 'in_progress')
    .single()

  if (!session) {
    return { ok: false, error: 'Sesi tidak ditemukan atau sudah selesai' }
  }

  const { data: answers } = await supabase
    .from('assessment_answers')
    .select('is_correct')
    .eq('session_id', sessionId)

  const total = answers?.length ?? 0
  const correct = answers?.filter((a) => a.is_correct === true).length ?? 0
  const score = total > 0 ? Math.round((correct / total) * 100) : 0
  const passScore = (session.assessments as unknown as { pass_score: number }).pass_score
  const passed = score >= passScore

  await supabase
    .from('assessment_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      score,
      passed,
    })
    .eq('id', sessionId)

  return { ok: true, data: { score, passed, total, correct } }
}

/**
 * Get results for a public session.
 */
export async function getPublicResults(
  sessionId: string
): Promise<ActionResultV2<{
  score: number
  passed: boolean
  total: number
  correct: number
  assessmentTitle: string
  orgName: string
  timeLimitMinutes: number
  passScore: number
  completedAt: string | null
  certificateUrl: string | null
}>> {
  const supabase = await createSupabaseServiceClient()

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select(`
      score, passed, completed_at, certificate_url,
      assessments!inner(title, time_limit_minutes, pass_score, org_id,
        organizations!inner(name)
      )
    `)
    .eq('id', sessionId)
    .in('status', ['completed', 'timed_out'])
    .single()

  if (!session) {
    return { ok: false, error: 'Hasil tidak ditemukan' }
  }

  const assessment = session.assessments as unknown as {
    title: string
    time_limit_minutes: number
    pass_score: number
    organizations: { name: string }
  }

  const { data: answers } = await supabase
    .from('assessment_answers')
    .select('is_correct')
    .eq('session_id', sessionId)

  const total = answers?.length ?? 0
  const correct = answers?.filter((a) => a.is_correct === true).length ?? 0

  return {
    ok: true,
    data: {
      score: session.score ?? 0,
      passed: session.passed ?? false,
      total,
      correct,
      assessmentTitle: assessment.title,
      orgName: assessment.organizations.name,
      timeLimitMinutes: assessment.time_limit_minutes,
      passScore: assessment.pass_score,
      completedAt: session.completed_at,
      certificateUrl: session.certificate_url,
    },
  }
}
```

**Step 2: Verify build compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/actions/public-assessment-actions.ts
git commit -m "feat: add public assessment server actions for guest test-taking"
```

---

### Task 5: Public Landing Page — /t/[code]

**Files:**
- Create: `src/app/t/[code]/page.tsx`
- Create: `src/app/t/[code]/layout.tsx`

**Context:** This is the first thing candidates see when they tap a shared link. Shows org name, assessment details, registration form. Mobile-first, clean, zero noise.

**Step 1: Create layout**

Create `src/app/t/layout.tsx` (shared layout for all public test pages — minimal, no nav):

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cekatan — Asesmen Online',
}

export default function PublicTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  )
}
```

**Step 2: Create landing page**

Create `src/app/t/[code]/page.tsx`:

```typescript
import { PublicTestLanding } from '@/components/public-test/PublicTestLanding'
import { getPublicAssessment } from '@/actions/public-assessment-actions'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ code: string }>
}

export default async function PublicTestPage({ params }: Props) {
  const { code } = await params
  const result = await getPublicAssessment(code)

  if (!result.ok) {
    notFound()
  }

  return (
    <PublicTestLanding
      code={code}
      assessment={result.data.assessment}
      orgName={result.data.orgName}
    />
  )
}
```

**Step 3: Create the landing component**

Create `src/components/public-test/PublicTestLanding.tsx`:

This is a client component with:
- Org name header
- Assessment title + metadata (questions, time, pass score)
- Registration form (name, email, phone with at-least-one validation)
- Access code input (if required)
- Confirmation dialog before start
- "Mulai Tes" button → calls `registerAndStartSession` → redirects to `/t/[code]/exam?sid=[sessionId]`
- Loading state during registration
- Error display for validation failures

The component should be mobile-first (375px), use existing UI primitives from `src/components/ui/`, and show Indonesian text.

Full component code: ~200 lines of React. Key elements:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerAndStartSession } from '@/actions/public-assessment-actions'
import type { Assessment } from '@/types/database'
import { Clock, FileText, Target, Shield, AlertCircle } from 'lucide-react'

interface Props {
  code: string
  assessment: Pick<Assessment, 'id' | 'title' | 'description' | 'time_limit_minutes' | 'pass_score' | 'question_count' | 'access_code' | 'shuffle_questions' | 'allow_review' | 'max_attempts' | 'start_date' | 'end_date'>
  orgName: string
}

export function PublicTestLanding({ code, assessment, orgName }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasContact = (email.length > 0) || (phone.length > 0)
  const canStart = name.length >= 2 && hasContact

  async function handleStart() {
    setShowConfirm(false)
    setLoading(true)
    setError(null)

    const result = await registerAndStartSession(code, {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      accessCode: accessCode.trim() || undefined,
    })

    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Store session info in sessionStorage for exam page
    sessionStorage.setItem(`cekatan_session_${code}`, JSON.stringify({
      sessionId: result.data.sessionId,
      sessionToken: result.data.sessionToken,
      timeRemainingSeconds: result.data.timeRemainingSeconds,
    }))

    router.push(`/t/${code}/exam`)
  }

  // Render: header (org name), assessment card, form, confirm dialog, start button
  // See implementation for full JSX
}
```

**Step 4: Verify the page renders**

Start dev server, navigate to `/t/ABC123` (will 404 since no assessment has that code yet).
After seeded assessments get public codes (Task 3), test with a real code.

**Step 5: Commit**

```bash
git add src/app/t/ src/components/public-test/
git commit -m "feat: add public test landing page with registration form"
```

---

### Task 6: Public Exam Page — /t/[code]/exam

**Files:**
- Create: `src/app/t/[code]/exam/page.tsx`
- Create: `src/components/public-test/PublicExam.tsx`

**Context:** This is the actual test-taking page. Reuses the exam UI patterns from the existing `assessments/[id]/take/page.tsx` but works without auth — uses sessionId from sessionStorage. Same timer, question nav, proctoring, keyboard shortcuts.

**Step 1: Create the exam page**

Create `src/app/t/[code]/exam/page.tsx`:

```typescript
import { PublicExam } from '@/components/public-test/PublicExam'

interface Props {
  params: Promise<{ code: string }>
}

export default async function PublicExamPage({ params }: Props) {
  const { code } = await params
  return <PublicExam code={code} />
}
```

**Step 2: Create PublicExam component**

Create `src/components/public-test/PublicExam.tsx`:

This is a large client component (~500 lines) that mirrors the existing take page but uses public server actions. Key differences from the authenticated version:

1. Session loaded from `sessionStorage` (not from auth user query)
2. Uses `submitPublicAnswer` instead of `submitAnswer`
3. Uses `completePublicSession` instead of `completeSession`
4. Questions fetched via a new `getPublicQuestions(sessionId)` action
5. On completion, redirects to `/t/[code]/results/[sessionId]`
6. Proctoring (fullscreen + tab switch) included if assessment has it enabled

The component needs the same:
- Timer countdown with auto-submit
- Question navigation (prev/next + dot grid)
- Option selection (A-E)
- Flag for review
- Keyboard shortcuts (A-E, arrows, F, Enter)
- Proctoring (visibility change + fullscreen detection)
- Review screen before submit

You can extract shared exam logic from the existing take page into a shared hook or keep it as a standalone component to avoid coupling.

**Step 3: Add getPublicQuestions action**

Add to `src/actions/public-assessment-actions.ts`:

```typescript
/**
 * Get questions for an active public session.
 */
export async function getPublicQuestions(
  sessionId: string
): Promise<ActionResultV2<{
  questions: Array<{
    cardTemplateId: string
    stem: string
    options: string[]
    selectedIndex: number | null
    flagged: boolean
  }>
  timeRemainingSeconds: number
  assessmentTitle: string
  allowReview: boolean
  shuffleOptions: boolean
}>> {
  const supabase = await createSupabaseServiceClient()

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, question_order, time_remaining_seconds, assessments!inner(title, allow_review, shuffle_options)')
    .eq('id', sessionId)
    .eq('status', 'in_progress')
    .single()

  if (!session) {
    return { ok: false, error: 'Sesi tidak ditemukan' }
  }

  const questionOrder = session.question_order as string[]
  const assessment = session.assessments as unknown as { title: string; allow_review: boolean; shuffle_options: boolean }

  // Fetch questions in order
  const { data: cards } = await supabase
    .from('card_templates')
    .select('id, front, options')
    .in('id', questionOrder)

  if (!cards) {
    return { ok: false, error: 'Pertanyaan tidak ditemukan' }
  }

  // Fetch existing answers
  const { data: answers } = await supabase
    .from('assessment_answers')
    .select('card_template_id, selected_index')
    .eq('session_id', sessionId)

  const answerMap = new Map(answers?.map((a) => [a.card_template_id, a.selected_index]) ?? [])
  const cardMap = new Map(cards.map((c) => [c.id, c]))

  const questions = questionOrder.map((cardId) => {
    const card = cardMap.get(cardId)
    return {
      cardTemplateId: cardId,
      stem: card?.front ?? '',
      options: (card?.options ?? []) as string[],
      selectedIndex: answerMap.get(cardId) ?? null,
      flagged: false,
    }
  })

  return {
    ok: true,
    data: {
      questions,
      timeRemainingSeconds: session.time_remaining_seconds ?? 0,
      assessmentTitle: assessment.title,
      allowReview: assessment.allow_review,
      shuffleOptions: assessment.shuffle_options,
    },
  }
}
```

**Step 4: Verify build compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

**Step 5: Commit**

```bash
git add src/app/t/[code]/exam/ src/components/public-test/PublicExam.tsx src/actions/public-assessment-actions.ts
git commit -m "feat: add public exam page with timer, proctoring, and keyboard nav"
```

---

### Task 7: Public Results Page — /t/[code]/results/[sessionId]

**Files:**
- Create: `src/app/t/[code]/results/[sessionId]/page.tsx`
- Create: `src/components/public-test/PublicResults.tsx`

**Context:** Simple results page: score, pass/fail, certificate link. No dashboard links, no study recommendations. Clean and final.

**Step 1: Create results page**

Create `src/app/t/[code]/results/[sessionId]/page.tsx`:

```typescript
import { PublicResults } from '@/components/public-test/PublicResults'
import { getPublicResults } from '@/actions/public-assessment-actions'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ code: string; sessionId: string }>
}

export default async function PublicResultsPage({ params }: Props) {
  const { code, sessionId } = await params
  const result = await getPublicResults(sessionId)

  if (!result.ok) {
    notFound()
  }

  return <PublicResults code={code} data={result.data} />
}
```

**Step 2: Create PublicResults component**

Create `src/components/public-test/PublicResults.tsx`:

```typescript
'use client'

import { CheckCircle2, XCircle, Trophy, Clock, Target } from 'lucide-react'

interface Props {
  code: string
  data: {
    score: number
    passed: boolean
    total: number
    correct: number
    assessmentTitle: string
    orgName: string
    timeLimitMinutes: number
    passScore: number
    completedAt: string | null
    certificateUrl: string | null
  }
}

export function PublicResults({ code, data }: Props) {
  const { score, passed, total, correct, assessmentTitle, orgName, passScore, certificateUrl } = data

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{orgName}</p>
          <h1 className="text-xl font-semibold mt-1">{assessmentTitle}</h1>
        </div>

        {/* Score Card */}
        <div className={`rounded-xl p-8 text-center ${passed ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'}`}>
          {passed ? (
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
          ) : (
            <XCircle className="h-16 w-16 mx-auto text-red-600" />
          )}
          <p className="text-4xl font-bold mt-4">{score}%</p>
          <p className={`text-lg font-medium mt-1 ${passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {passed ? 'LULUS' : 'TIDAK LULUS'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-white dark:bg-gray-900 p-4 border">
            <Target className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="text-lg font-semibold mt-1">{correct}/{total}</p>
            <p className="text-xs text-muted-foreground">Benar</p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-900 p-4 border">
            <Trophy className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="text-lg font-semibold mt-1">{passScore}%</p>
            <p className="text-xs text-muted-foreground">Nilai Lulus</p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-900 p-4 border">
            <Clock className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="text-lg font-semibold mt-1">{data.timeLimitMinutes}m</p>
            <p className="text-xs text-muted-foreground">Batas Waktu</p>
          </div>
        </div>

        {/* Certificate */}
        {certificateUrl && passed && (
          <a
            href={certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 active:scale-95 transition"
          >
            Unduh Sertifikat
          </a>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Hasil ini telah dicatat oleh {orgName}
        </p>
      </div>
    </div>
  )
}
```

**Step 3: Verify build compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

**Step 4: Commit**

```bash
git add src/app/t/[code]/results/ src/components/public-test/PublicResults.tsx
git commit -m "feat: add public results page with score and certificate download"
```

---

### Task 8: Admin Sharing UI — Copy Link, WhatsApp, QR

**Files:**
- Modify: `src/app/(app)/assessments/page.tsx` (sharing buttons)

**Context:** Replace the existing copy-link button with three sharing options: copy public link, WhatsApp share, QR code. Only show for published assessments with a `public_code`.

**Step 1: Update the assessment list sharing UI**

In `src/app/(app)/assessments/page.tsx`, modify the `handleCopyLink` function (lines 191-198) to use `public_code`:

```typescript
function handleCopyPublicLink(assessment: AssessmentWithDeck) {
  if (!assessment.public_code) return
  const link = `${window.location.origin}/t/${assessment.public_code}`
  navigator.clipboard.writeText(link).then(() => {
    showToast('Link publik disalin!', 'success')
  })
}

function handleWhatsAppShare(assessment: AssessmentWithDeck) {
  if (!assessment.public_code) return
  const link = `${window.location.origin}/t/${assessment.public_code}`
  const text = `Silakan kerjakan asesmen "${assessment.title}":\n${link}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}
```

Replace the existing Link2 button with a dropdown or button group containing:
- Copy Link (Link2 icon)
- WhatsApp (MessageCircle icon)
- QR Code (QrCode icon) — shows a modal with a generated QR code

For QR code, use a simple SVG QR generator or the existing URL as a `qrserver.com` API image.

**Step 2: Update AssessmentWithDeck type if needed**

Ensure `AssessmentWithDeck` includes `public_code` from the select query in `getOrgAssessments`.

**Step 3: Commit**

```bash
git add src/app/(app)/assessments/page.tsx
git commit -m "feat: add public link, WhatsApp share, and QR code buttons for assessments"
```

---

### Task 9: Dashboard Cleanup — Assessment-Focused

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`
- Modify: `src/components/dashboard/SetupChecklist.tsx` (optional: update items)

**Context:** Reorder dashboard to prioritize assessment features. Remove study-mode clutter (heatmap, library, repair button, welcome hero) from default view. Keep study mode accessible via "My Library" nav link.

**Step 1: Reorder dashboard components**

In `src/app/(app)/dashboard/page.tsx`, change the render order:

For admins/creators:
```tsx
{/* 1. Setup Checklist (assessment-focused) */}
<SetupChecklist items={checklistItems} />

{/* 2. Org Stats */}
<OrgStatsCard />

{/* 3. Skills Profile (if enabled) */}
<MySkillProfile />
```

Remove from admin view:
- `<DashboardHero />` (welcome + browse library)
- `<WeakestConceptsCard />`
- `<RepairButton />`
- `<StudyHeatmap />`
- `<LibrarySection />`

For candidates (non-creators):
```tsx
{/* 1. My Assessments (promoted to top) */}
<CandidateAssessmentCard />

{/* 2. Skills Profile (if enabled) */}
<MySkillProfile />
```

Remove from candidate view:
- `<DashboardHero />`
- `<WeakestConceptsCard />`
- `<RepairButton />`
- `<StudyHeatmap />`
- `<LibrarySection />`

**Step 2: Clean up unused data fetching**

Remove or skip the data queries that are no longer needed on the dashboard:
- `getStudyLogs(365)` — move to My Library page
- `getDashboardInsights()` — weakest concepts, move to My Library
- The deck/course fetching section

**Step 3: Verify the page renders**

Start dev server, login, verify dashboard shows clean assessment-focused view.

**Step 4: Commit**

```bash
git add src/app/(app)/dashboard/page.tsx
git commit -m "refactor: clean up dashboard to be assessment-focused"
```

---

### Task 10: Admin Results Dashboard Enhancement

**Files:**
- Modify: `src/app/(app)/assessments/[id]/results/page.tsx`

**Context:** Enhance the creator results view with: separate email/phone columns, score distribution chart, CSV export, and PDF report export. The existing page already has a creator view — we're adding to it.

**Step 1: Add CSV export**

Add a "Export CSV" button to the creator results view. Generate CSV client-side from the results data:

```typescript
function exportCSV(sessions: SessionData[]) {
  const header = 'Nama,Email,Telepon,Skor,Status,Durasi (menit),Selesai'
  const rows = sessions.map((s) =>
    [s.name, s.email || '', s.phone || '', s.score, s.passed ? 'Lulus' : 'Tidak Lulus', s.durationMinutes, s.completedAt].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `results-${assessmentTitle}.csv`
  a.click()
}
```

**Step 2: Add score distribution histogram**

Use existing Recharts dependency to render a histogram:

```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Bucket scores into 0-10, 11-20, ..., 91-100
const distribution = bucketScores(sessions.map((s) => s.score))
```

**Step 3: Update results table with separate email/phone columns**

Modify the existing sessions table to fetch and display `profiles.phone` alongside `profiles.email`.

**Step 4: Commit**

```bash
git add src/app/(app)/assessments/[id]/results/page.tsx
git commit -m "feat: enhance admin results with CSV export, score distribution, phone column"
```

---

### Task 11: Generate Public Codes for Existing Assessments

**Context:** The seeded IQ and SCA assessments are already published but have no `public_code`. We need to generate codes for them so they can be tested.

**Step 1: Run SQL to generate codes for existing published assessments**

Via Supabase MCP `execute_sql`:

```sql
UPDATE assessments SET public_code = 'IQ2026' WHERE title LIKE '%Cognitive Ability%' AND status = 'published';
UPDATE assessments SET public_code = 'SCA026' WHERE title LIKE '%Standardized Cognitive%' AND status = 'published';
```

**Step 2: Verify via curl or browser**

Navigate to `cekatan.com/t/IQ2026` — should show the IQ test landing page.

**Step 3: End-to-end test**

1. Open `/t/IQ2026`
2. Enter name + phone
3. Confirm
4. Take a few questions
5. Submit
6. See results

---

### Task 12: Run Full Test Suite + Build Verification

**Step 1: Run tests**

```bash
npm test
```
Expected: All pass

**Step 2: Run build**

```bash
npm run build -- --webpack
```
Expected: Build succeeds

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve build/test issues from public test link implementation"
```
