-- ============================================================
-- Placement Compass - Unified Readiness Features Schema
-- Tables for Aptitude levels, Mock Interviews, and Coding compiler progress
-- ============================================================

-- Aptitude Progress Table
create table if not exists public.aptitude_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  level integer not null, -- 1 to 150
  score integer not null, -- score out of 10
  completed_at timestamptz default now(),
  unique(user_id, level)
);

-- Enable RLS for Aptitude Progress
alter table public.aptitude_progress enable row level security;

create policy "Users can manage their own aptitude progress"
  on public.aptitude_progress for all
  using (auth.uid() = user_id);

create policy "Mentors can view all aptitude progress"
  on public.aptitude_progress for select
  using (public.is_mentor_or_admin(auth.uid()));


-- Interview Progress Table
create table if not exists public.interview_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mode text not null, -- 'company' or 'role'
  target text not null, -- e.g., 'Google', 'Frontend Developer'
  question_id text not null, -- e.g., 'q1', 'hr-2'
  question_type text not null, -- 'hr', 'technical', 'coding'
  user_response text,
  completed boolean default false not null,
  completed_at timestamptz default now(),
  unique(user_id, mode, target, question_id)
);

-- Enable RLS for Interview Progress
alter table public.interview_progress enable row level security;

create policy "Users can manage their own interview progress"
  on public.interview_progress for all
  using (auth.uid() = user_id);

create policy "Mentors can view all interview progress"
  on public.interview_progress for select
  using (public.is_mentor_or_admin(auth.uid()));


-- Coding Progress Table
create table if not exists public.coding_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  problem_id text not null, -- e.g., 'two-sum'
  status text not null, -- 'solved' or 'attempted'
  language text not null, -- 'python', 'javascript', etc.
  code text not null,
  completed_at timestamptz default now(),
  unique(user_id, problem_id)
);

-- Enable RLS for Coding Progress
alter table public.coding_progress enable row level security;

create policy "Users can manage their own coding progress"
  on public.coding_progress for all
  using (auth.uid() = user_id);

create policy "Mentors can view all coding progress"
  on public.coding_progress for select
  using (public.is_mentor_or_admin(auth.uid()));
