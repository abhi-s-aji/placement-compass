-- ============================================================
-- Placement Compass - Feedback RLS Policies Fix
-- Migration 013: Clean up and define exact feedback policies
-- ============================================================

-- Drop all previous policies on public.feedback to prevent conflicts
DROP POLICY IF EXISTS "Students can view their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Students can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Students can message their assigned mentor" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can manage their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can view feedback for assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can insert feedback for assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can update feedback for assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can delete feedback for assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Mentors can message assigned students" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback;

-- 1. Student can SELECT their own messages:
CREATE POLICY "Students can view own feedback"
  ON public.feedback FOR SELECT
  USING (
    auth.uid() = student_id
  );

-- 2. Student can INSERT message to assigned mentor:
CREATE POLICY "Students can message their assigned mentor"
  ON public.feedback FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND
    mentor_id = (
      SELECT mentor_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- 3. Mentor can SELECT assigned student messages:
CREATE POLICY "Mentors can view feedback for assigned students"
  ON public.feedback FOR SELECT
  USING (
    auth.uid() = mentor_id
    AND
    student_id IN (
      SELECT id
      FROM public.profiles
      WHERE mentor_id = auth.uid()
    )
  );

-- 4. Mentor can INSERT replies:
CREATE POLICY "Mentors can insert feedback for assigned students"
  ON public.feedback FOR INSERT
  WITH CHECK (
    auth.uid() = mentor_id
    AND
    student_id IN (
      SELECT id
      FROM public.profiles
      WHERE mentor_id = auth.uid()
    )
  );

-- 5. Mentor can UPDATE replies/suggestions:
CREATE POLICY "Mentors can update feedback for assigned students"
  ON public.feedback FOR UPDATE
  USING (
    auth.uid() = mentor_id
    AND
    student_id IN (
      SELECT id
      FROM public.profiles
      WHERE mentor_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = mentor_id
    AND
    student_id IN (
      SELECT id
      FROM public.profiles
      WHERE mentor_id = auth.uid()
    )
  );

-- 6. Admin full access (manage all feedback):
CREATE POLICY "Admins can manage all feedback"
  ON public.feedback FOR ALL
  USING (
    public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.is_admin(auth.uid())
  );
