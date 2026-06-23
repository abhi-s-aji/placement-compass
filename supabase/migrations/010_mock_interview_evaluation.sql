-- ============================================================
-- Placement Compass - Mock Interview Evaluation Upgrade
-- Migration 010: Add Mock Interview Evaluation Columns
-- ============================================================

ALTER TABLE public.mock_interview_sessions
  ADD COLUMN IF NOT EXISTS question_text TEXT,
  ADD COLUMN IF NOT EXISTS answer_text TEXT,
  ADD COLUMN IF NOT EXISTS interviewer_feedback TEXT,
  ADD COLUMN IF NOT EXISTS evaluation_score INTEGER,
  ADD COLUMN IF NOT EXISTS evaluation_level TEXT,
  ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS weaknesses JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS improvement_tips JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evaluation_reason TEXT;
