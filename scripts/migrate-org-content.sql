-- ============================================
-- V13: Migrate Existing Content to an Organization
-- ============================================
-- This script assigns org-less content to a target organization.
-- Run AFTER creating the organization via the UI.
--
-- USAGE: Replace <TARGET_ORG_ID> with the actual organization UUID.
--   SELECT id FROM organizations WHERE slug = 'your-org-slug';
--
-- Safe to run multiple times (idempotent — only updates NULL org_id rows).

-- Set target org (replace with actual UUID)
\set target_org_id '''YOUR_ORG_ID_HERE'''

-- ============================================
-- 1. Migrate deck_templates
-- ============================================
UPDATE deck_templates
SET org_id = :target_org_id::uuid
WHERE org_id IS NULL;

-- ============================================
-- 2. Migrate tags
-- ============================================
UPDATE tags
SET org_id = :target_org_id::uuid
WHERE org_id IS NULL;

-- ============================================
-- 3. Migrate book_sources
-- ============================================
UPDATE book_sources
SET org_id = :target_org_id::uuid
WHERE org_id IS NULL;

-- ============================================
-- 4. Verify migration
-- ============================================
SELECT 'deck_templates' AS table_name,
       COUNT(*) FILTER (WHERE org_id IS NULL) AS still_null,
       COUNT(*) FILTER (WHERE org_id = :target_org_id::uuid) AS migrated
FROM deck_templates
UNION ALL
SELECT 'tags',
       COUNT(*) FILTER (WHERE org_id IS NULL),
       COUNT(*) FILTER (WHERE org_id = :target_org_id::uuid)
FROM tags
UNION ALL
SELECT 'book_sources',
       COUNT(*) FILTER (WHERE org_id IS NULL),
       COUNT(*) FILTER (WHERE org_id = :target_org_id::uuid)
FROM book_sources;
