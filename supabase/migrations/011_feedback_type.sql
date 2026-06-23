-- ============================================================
-- Placement Compass - Feedback Table Extensions
-- Migration 011: Add type, suggestion_details, and check constraint
-- ============================================================

-- Ensure type column exists on feedback table
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'feedback';

-- Ensure suggestion_details column exists on feedback table
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS suggestion_details JSONB;

-- Update the check constraint to allow 'student' as well
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_type_check;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_type_check CHECK (type IN ('feedback', 'suggestion', 'student'));
