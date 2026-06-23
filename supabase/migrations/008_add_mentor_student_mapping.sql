-- ============================================================
-- Placement Compass - Mentor-Student Mapping and Suggestions
-- ============================================================

-- Add mentor_id column to profiles (self-reference)
alter table public.profiles 
  add column if not exists mentor_id uuid references public.profiles(id) on delete set null;

-- Add indexes for fast lookup
create index if not exists idx_profiles_mentor_id on public.profiles(mentor_id);

-- Extend feedback table to support course/resource suggestions
alter table public.feedback 
  add column if not exists type text not null default 'feedback' check (type in ('feedback', 'suggestion')),
  add column if not exists suggestion_details jsonb;
