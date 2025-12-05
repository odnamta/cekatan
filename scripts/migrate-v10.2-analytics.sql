-- V10.2: Analytics - Add accuracy tracking columns to user_card_progress
-- This migration adds columns to track correct answers and total attempts per card

-- Add correct_count column (number of times user answered correctly)
ALTER TABLE user_card_progress 
ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0;

-- Add total_attempts column (total number of times user answered this card)
ALTER TABLE user_card_progress 
ADD COLUMN IF NOT EXISTS total_attempts INTEGER DEFAULT 0;

-- Create index for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_user_card_progress_accuracy 
ON user_card_progress(user_id, correct_count, total_attempts);

-- Optional: Create a view for topic accuracy aggregation
CREATE OR REPLACE VIEW user_topic_accuracy AS
SELECT 
  ucp.user_id,
  t.id as tag_id,
  t.name as tag_name,
  t.color as tag_color,
  SUM(ucp.correct_count) as correct_count,
  SUM(ucp.total_attempts) as total_attempts,
  CASE 
    WHEN SUM(ucp.total_attempts) > 0 
    THEN (SUM(ucp.correct_count)::float / SUM(ucp.total_attempts)) * 100
    ELSE NULL
  END as accuracy
FROM user_card_progress ucp
JOIN card_templates ct ON ct.id = ucp.card_template_id
JOIN card_template_tags ctt ON ctt.card_template_id = ct.id
JOIN tags t ON t.id = ctt.tag_id
WHERE t.category = 'topic'
GROUP BY ucp.user_id, t.id, t.name, t.color;
