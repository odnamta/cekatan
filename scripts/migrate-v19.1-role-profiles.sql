-- V19.1: Role Profiles for Skills Mapping
-- Adds role_profiles, role_skill_requirements, employee_role_assignments tables
-- Enables role-based competency frameworks with target scores and gap analysis

-- ============================================
-- 1. Role Profiles per Organization
-- ============================================
CREATE TABLE IF NOT EXISTS role_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, name)
);

-- ============================================
-- 2. Role → Skill Requirements (target scores)
-- ============================================
CREATE TABLE IF NOT EXISTS role_skill_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_profile_id UUID NOT NULL REFERENCES role_profiles(id) ON DELETE CASCADE,
  skill_domain_id UUID NOT NULL REFERENCES skill_domains(id) ON DELETE CASCADE,
  target_score INTEGER NOT NULL DEFAULT 70 CHECK (target_score BETWEEN 0 AND 100),
  priority TEXT DEFAULT 'required' CHECK (priority IN ('required', 'recommended', 'optional')),
  UNIQUE(role_profile_id, skill_domain_id)
);

-- ============================================
-- 3. Employee → Role Assignments
-- ============================================
CREATE TABLE IF NOT EXISTS employee_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_profile_id UUID NOT NULL REFERENCES role_profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(org_id, user_id, role_profile_id)
);

-- ============================================
-- 4. Row Level Security
-- ============================================

ALTER TABLE role_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_role_assignments ENABLE ROW LEVEL SECURITY;

-- role_profiles: org members can SELECT, admins+ can manage
CREATE POLICY "role_profiles_select" ON role_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = role_profiles.org_id
        AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "role_profiles_insert" ON role_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = role_profiles.org_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "role_profiles_update" ON role_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = role_profiles.org_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "role_profiles_delete" ON role_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = role_profiles.org_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- role_skill_requirements: org members can SELECT (via role_profiles join)
CREATE POLICY "role_skill_requirements_select" ON role_skill_requirements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM role_profiles rp
      JOIN organization_members om ON om.org_id = rp.org_id
      WHERE rp.id = role_skill_requirements.role_profile_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "role_skill_requirements_insert" ON role_skill_requirements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM role_profiles rp
      JOIN organization_members om ON om.org_id = rp.org_id
      WHERE rp.id = role_skill_requirements.role_profile_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "role_skill_requirements_update" ON role_skill_requirements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM role_profiles rp
      JOIN organization_members om ON om.org_id = rp.org_id
      WHERE rp.id = role_skill_requirements.role_profile_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "role_skill_requirements_delete" ON role_skill_requirements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM role_profiles rp
      JOIN organization_members om ON om.org_id = rp.org_id
      WHERE rp.id = role_skill_requirements.role_profile_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- employee_role_assignments: users can SELECT own, admins+ can SELECT all + manage
CREATE POLICY "employee_role_assignments_select_own" ON employee_role_assignments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "employee_role_assignments_select_admin" ON employee_role_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = employee_role_assignments.org_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "employee_role_assignments_insert" ON employee_role_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = employee_role_assignments.org_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "employee_role_assignments_delete" ON employee_role_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = employee_role_assignments.org_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Service role for system operations
CREATE POLICY "role_profiles_service" ON role_profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "role_skill_requirements_service" ON role_skill_requirements
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "employee_role_assignments_service" ON employee_role_assignments
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 5. Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_role_profiles_org ON role_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_role_skill_requirements_role ON role_skill_requirements(role_profile_id);
CREATE INDEX IF NOT EXISTS idx_role_skill_requirements_skill ON role_skill_requirements(skill_domain_id);
CREATE INDEX IF NOT EXISTS idx_employee_role_assignments_org_user ON employee_role_assignments(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_employee_role_assignments_role ON employee_role_assignments(role_profile_id);
