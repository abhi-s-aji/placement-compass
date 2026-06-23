-- ============================================================
-- Helper functions to avoid missing references
-- ============================================================
create or replace function public.is_mentor_or_admin(user_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role in ('mentor', 'admin')
  );
end;
$$ language plpgsql;

create or replace function public.is_admin(user_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
end;
$$ language plpgsql;

-- ============================================================
-- MENTOR REQUESTS TABLE
-- Students request to be assigned to a specific mentor
-- ============================================================
create table if not exists public.mentor_requests (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  requested_mentor_id uuid references public.profiles(id) on delete cascade not null,
  mentor_id uuid references public.profiles(id) on delete set null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Only one active (pending) request per student at a time
  constraint mentor_requests_unique_pending unique (student_id, status, requested_mentor_id)
);

-- Ensure column compatibility and drop not-null constraint if it exists
alter table public.mentor_requests add column if not exists mentor_id uuid references public.profiles(id) on delete set null;
alter table public.mentor_requests alter column mentor_id drop not null;

alter table public.mentor_requests enable row level security;

-- Students can view their own requests
create policy "Students can view their own mentor requests"
  on public.mentor_requests for select
  using (auth.uid() = student_id);

-- Students can insert requests (only for themselves)
create policy "Students can submit mentor requests"
  on public.mentor_requests for insert
  with check (auth.uid() = student_id);

-- Mentors can view requests directed to them
create policy "Mentors can view requests directed to them"
  on public.mentor_requests for select
  using (auth.uid() = requested_mentor_id);

-- Admins can view all mentor requests
create policy "Admins can view all mentor requests"
  on public.mentor_requests for select
  using (public.is_admin(auth.uid()));

-- Admins can update (approve/reject) mentor requests
create policy "Admins can update mentor requests"
  on public.mentor_requests for update
  using (public.is_admin(auth.uid()));

-- Auto-update updated_at
create trigger handle_mentor_requests_updated_at
  before update on public.mentor_requests
  for each row execute procedure public.handle_updated_at();

-- Indexes
create index if not exists idx_mentor_requests_student_id on public.mentor_requests(student_id);
create index if not exists idx_mentor_requests_mentor_id on public.mentor_requests(requested_mentor_id);
create index if not exists idx_mentor_requests_status on public.mentor_requests(status);


-- ============================================================
-- MOCK INTERVIEW SESSIONS TABLE
-- Tracks student progress on company interview preparation
-- ============================================================
create table if not exists public.mock_interview_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company text not null,
  category text not null check (category in ('DSA', 'System Design', 'DBMS', 'OS', 'Computer Networks', 'OOP', 'HR', 'Projects')),
  completed_questions integer default 0,
  total_questions integer default 0,
  score integer default 0 check (score >= 0 and score <= 100),
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.mock_interview_sessions enable row level security;

-- Students can manage their own interview sessions
create policy "Users can manage their own mock interview sessions"
  on public.mock_interview_sessions for all
  using (auth.uid() = user_id);

-- Mentors and admins can view all sessions
create policy "Mentors and admins can view all mock interview sessions"
  on public.mock_interview_sessions for select
  using (public.is_mentor_or_admin(auth.uid()));

-- Auto-update updated_at
create trigger handle_mock_interview_sessions_updated_at
  before update on public.mock_interview_sessions
  for each row execute procedure public.handle_updated_at();

-- Indexes
create index if not exists idx_mock_interview_sessions_user_id on public.mock_interview_sessions(user_id);
create index if not exists idx_mock_interview_sessions_company on public.mock_interview_sessions(company);
create index if not exists idx_mock_interview_sessions_completed on public.mock_interview_sessions(completed);
