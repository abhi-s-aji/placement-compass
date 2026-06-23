-- ============================================================
-- Placement Compass - Mentor Panel Security & RLS Policies
-- Migration 012: Enforce strict Mentor Panel and Student rules
-- ============================================================

-- ------------------------------------------------------------
-- 1. Restrict Profiles select access
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Mentors can view all student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Mentors can view assigned student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Students can view all mentors" ON public.profiles;

-- Mentors can only see student profiles assigned to them
CREATE POLICY "Mentors can view assigned student profiles"
  ON public.profiles FOR SELECT
  USING (
    (id = auth.uid()) OR
    (role = 'student' AND mentor_id = auth.uid())
  );

-- Students can view themselves and all mentors (to request a mentor)
CREATE POLICY "Students can view all mentors"
  ON public.profiles FOR SELECT
  USING (
    (id = auth.uid()) OR
    (role = 'mentor')
  );


-- ------------------------------------------------------------
-- 2. Restrict Feedback (messaging & course suggestions) access
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Students can view their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can manage their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can manage feedback for assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can view feedback for assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can insert feedback for assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can update feedback for assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can delete feedback for assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Students can message their assigned mentor" ON public.feedback;
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback;

-- Student SELECT: view own messages
CREATE POLICY "Students can view own feedback"
  ON public.feedback FOR SELECT
  USING (
    student_id = auth.uid()
  );

-- Student INSERT: insert message only to assigned mentor
CREATE POLICY "Students can message their assigned mentor"
  ON public.feedback FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
    AND
    mentor_id = (
      SELECT mentor_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Mentor SELECT: select messages where feedback.mentor_id = auth.uid()
CREATE POLICY "Mentors can view feedback for assigned students"
  ON public.feedback FOR SELECT
  USING (
    mentor_id = auth.uid()
  );

-- Mentor INSERT: insert message only if student belongs to mentor
CREATE POLICY "Mentors can insert feedback for assigned students"
  ON public.feedback FOR INSERT
  WITH CHECK (
    mentor_id = auth.uid()
    AND
    student_id IN (
      SELECT id FROM public.profiles
      WHERE mentor_id = auth.uid()
    )
  );

-- Mentor UPDATE: only allow update if needed
CREATE POLICY "Mentors can update feedback for assigned students"
  ON public.feedback FOR UPDATE
  USING (
    mentor_id = auth.uid()
    AND
    student_id IN (
      SELECT id FROM public.profiles
      WHERE mentor_id = auth.uid()
    )
  )
  WITH CHECK (
    mentor_id = auth.uid()
    AND
    student_id IN (
      SELECT id FROM public.profiles
      WHERE mentor_id = auth.uid()
    )
  );

-- Admin: ALL permissions
CREATE POLICY "Admins can manage all feedback"
  ON public.feedback FOR ALL
  USING (
    public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.is_admin(auth.uid())
  );
