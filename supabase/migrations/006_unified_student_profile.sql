-- ============================================================
-- Placement Compass - Unified Student Profile Schema
-- Consolidates all progress, scores, projects, and activities 
-- under a single table structure.
-- ============================================================

create table if not exists public.student_profile (
  id uuid references public.profiles(id) on delete cascade primary key,
  projects jsonb default '[]'::jsonb not null,
  github_profile jsonb default '{"username": "", "profile_url": "", "repo_count": 0, "last_updated": null}'::jsonb not null,
  linkedin_profile jsonb default '{"profile_url": "", "completed_tasks": []}'::jsonb not null,
  aptitude_progress jsonb default '{"completed_levels": [], "level_scores": {}}'::jsonb not null,
  interview_progress jsonb default '{"completed_questions": [], "answers": {}}'::jsonb not null,
  coding_progress jsonb default '{"solved_problems": [], "code_submissions": {}}'::jsonb not null,
  readiness_scores jsonb default '{"resume_score": 0, "github_score": 0, "linkedin_score": 0, "project_score": 0, "coding_score": 0, "aptitude_score": 0, "interview_score": 0, "overall_score": 0}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.student_profile enable row level security;

-- Policies
create policy "Users can manage their own student profile"
  on public.student_profile for all
  using (auth.uid() = id);

create policy "Mentors can view all student profiles"
  on public.student_profile for select
  using (public.is_mentor_or_admin(auth.uid()));
