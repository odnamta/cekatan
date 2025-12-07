-- ============================================
-- V11.3: Content Staging Migration
-- ============================================
-- Adds status and import_session_id columns to card_templates
-- for draft/publish workflow and import session grouping.
--
-- This migration is NON-BREAKING:
-- - Existing cards default to 'published' status
-- - All existing study flows continue to work unchanged
-- ============================================

-- Step 1: Add status column with default 'published'
-- This ensures existing cards remain visible in study flows
ALTER TABLE card_templates 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' 
CHECK (status IN ('draft', 'published', 'archived'));

-- Step 2: Add import_session_id for grouping cards by import batch
ALTER TABLE card_templates 
ADD COLUMN IF NOT EXISTS import_session_id UUID;

-- Step 3: Add updated_at column for tracking last modification
ALTER TABLE card_templates 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 4: Create index for efficient session queries
CREATE INDEX IF NOT EXISTS idx_card_templates_import_session 
ON card_templates(import_session_id) 
WHERE import_session_id IS NOT NULL;

-- Step 5: Create index for status filtering in study queries
CREATE INDEX IF NOT EXISTS idx_card_templates_status 
ON card_templates(status);

-- Step 6: Backfill - ensure all existing cards have 'published' status
-- (Should be no-op due to DEFAULT, but explicit for safety)
UPDATE card_templates 
SET status = 'published' 
WHERE status IS NULL;

-- Step 7: Backfill updated_at for existing rows
UPDATE card_templates 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- ============================================
-- Verification Query (run after migration)
-- ============================================
-- SELECT 
--   status, 
--   COUNT(*) as count 
-- FROM card_templates 
-- GROUP BY status;
--
-- Expected: All existing cards should show status = 'published'
-- ============================================
