-- ============================================
-- V13 Phase 3: Invitation & Assessment Engine
-- ============================================
-- Run AFTER migrate-v13-multi-tenant.sql
-- Tables: invitations, assessments, assessment_sessions, assessment_answers

-- ============================================
-- 1. Invitations
-- ============================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'candidate',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON invitations(org_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- Prevent duplicate pending invitations for same email+org
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unique_pending
  ON invitations(org_id, email)
  WHERE accepted_at IS NULL AND expires_at > NOW();

-- ============================================
-- 2. Assessment Status Enum
-- ============================================

DO $$ BEGIN
  CREATE TYPE assessment_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'timed_out');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 3. Assessments
-- ============================================

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deck_template_id UUID NOT NULL REFERENCES deck_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INT NOT NULL DEFAULT 60,
  pass_score INT NOT NULL DEFAULT 70,  -- percentage 0-100
  question_count INT NOT NULL DEFAULT 20,
  shuffle_questions BOOLEAN NOT NULL DEFAULT TRUE,
  shuffle_options BOOLEAN NOT NULL DEFAULT FALSE,
  show_results BOOLEAN NOT NULL DEFAULT TRUE, -- show results to candidate after
  max_attempts INT, -- NULL = unlimited
  status assessment_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_org_id ON assessments(org_id);
CREATE INDEX IF NOT EXISTS idx_assessments_deck ON assessments(deck_template_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(org_id, status);

-- ============================================
-- 4. Assessment Sessions (attempts)
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_remaining_seconds INT, -- snapshot at last save, for resume
  score INT, -- percentage 0-100, set on completion
  passed BOOLEAN, -- set on completion
  question_order JSONB NOT NULL DEFAULT '[]', -- array of card_template_ids
  status session_status NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_assessment ON assessment_sessions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON assessment_sessions(user_id, status)
  WHERE status = 'in_progress';

-- ============================================
-- 5. Assessment Answers
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  card_template_id UUID NOT NULL REFERENCES card_templates(id),
  selected_index INT, -- NULL = unanswered
  is_correct BOOLEAN, -- set on submission
  answered_at TIMESTAMPTZ,
  UNIQUE(session_id, card_template_id)
);

CREATE INDEX IF NOT EXISTS idx_answers_session ON assessment_answers(session_id);

-- ============================================
-- 6. RLS Policies
-- ============================================

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

-- Invitations: admins+ can manage, anyone can view their own (by email)
CREATE POLICY invitations_admin_v13 ON invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.org_id = invitations.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- Assessments: org members can view published, creators+ can manage
CREATE POLICY assessments_select_v13 ON assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.org_id = assessments.org_id
        AND om.user_id = auth.uid()
    )
    AND (status = 'published' OR created_by = auth.uid())
  );

CREATE POLICY assessments_modify_v13 ON assessments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.org_id = assessments.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'creator')
    )
  );

-- Sessions: users can view/create their own
CREATE POLICY sessions_own_v13 ON assessment_sessions
  FOR ALL
  USING (user_id = auth.uid());

-- Creators/admins can view all sessions for their org's assessments
CREATE POLICY sessions_admin_v13 ON assessment_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN organization_members om ON om.org_id = a.org_id
      WHERE a.id = assessment_sessions.assessment_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'creator')
    )
  );

-- Answers: users can manage their own session's answers
CREATE POLICY answers_own_v13 ON assessment_answers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assessment_sessions s
      WHERE s.id = assessment_answers.session_id
        AND s.user_id = auth.uid()
    )
  );

-- Creators/admins can view all answers for their org's assessments
CREATE POLICY answers_admin_v13 ON assessment_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessment_sessions s
      JOIN assessments a ON a.id = s.assessment_id
      JOIN organization_members om ON om.org_id = a.org_id
      WHERE s.id = assessment_answers.session_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'creator')
    )
  );
