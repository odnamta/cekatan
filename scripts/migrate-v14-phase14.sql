-- V14 Phase 14: Proctoring Intelligence & Candidate Experience
-- Adds per-question time tracking

ALTER TABLE assessment_answers
  ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT NULL;
