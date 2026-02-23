-- v24: Email notification preferences
-- Adds email_notifications flag to profiles for controlling email delivery

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
