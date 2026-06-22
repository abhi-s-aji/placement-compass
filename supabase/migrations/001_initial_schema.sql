-- ============================================================
-- Placement Compass - Initial Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Extends Supabase auth.users
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'student' check (role in ('student', 'mentor', 'admin')),
  college text,
  department text,
  graduation_year integer,
  skills text[] default '{}',
  resume_url text,
  github_username text,
  linkedin_url text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helper functions to avoid infinite recursion in RLS policies
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

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Mentors can view all student profiles"
  on public.profiles for select
  using (public.is_mentor_or_admin(auth.uid()));

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin can update any profile"
  on public.profiles for update
  using (public.is_admin(auth.uid()));

create policy "Enable insert for authenticated users"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  technologies text[] default '{}',
  github_url text,
  live_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Students can manage their own projects"
  on public.projects for all
  using (auth.uid() = user_id);

create policy "Mentors can view all projects"
  on public.projects for select
  using (public.is_mentor_or_admin(auth.uid()));

-- ============================================================
-- PROGRESS TABLE
-- Stores category scores per user
-- ============================================================
create table public.progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  resume_score integer default 0 check (resume_score >= 0 and resume_score <= 100),
  github_score integer default 0 check (github_score >= 0 and github_score <= 100),
  linkedin_score integer default 0 check (linkedin_score >= 0 and linkedin_score <= 100),
  project_score integer default 0 check (project_score >= 0 and project_score <= 100),
  coding_score integer default 0 check (coding_score >= 0 and coding_score <= 100),
  aptitude_score integer default 0 check (aptitude_score >= 0 and aptitude_score <= 100),
  interview_score integer default 0 check (interview_score >= 0 and interview_score <= 100),
  overall_score integer default 0 check (overall_score >= 0 and overall_score <= 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.progress enable row level security;

create policy "Users can view their own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Mentors can view all progress"
  on public.progress for select
  using (public.is_mentor_or_admin(auth.uid()));

create policy "Users can manage their own progress"
  on public.progress for all
  using (auth.uid() = user_id);

-- ============================================================
-- CHECKLIST ITEMS TABLE
-- Stores per-user checklist state per category
-- ============================================================
create table public.checklist_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null check (category in ('resume', 'github', 'linkedin', 'projects', 'coding', 'aptitude', 'interview')),
  item_key text not null,
  is_completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, category, item_key)
);

alter table public.checklist_items enable row level security;

create policy "Users can manage their own checklist"
  on public.checklist_items for all
  using (auth.uid() = user_id);

create policy "Mentors can view all checklists"
  on public.checklist_items for select
  using (public.is_mentor_or_admin(auth.uid()));

-- ============================================================
-- GITHUB DATA TABLE
-- Cached GitHub profile metrics
-- ============================================================
create table public.github_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  username text not null,
  repo_count integer default 0,
  public_repos jsonb default '[]',
  top_languages jsonb default '{}',
  recent_activity_count integer default 0,
  followers integer default 0,
  following integer default 0,
  bio text,
  profile_complete boolean default false,
  github_score integer default 0,
  last_fetched timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.github_data enable row level security;

create policy "Users can manage their own github data"
  on public.github_data for all
  using (auth.uid() = user_id);

create policy "Mentors can view all github data"
  on public.github_data for select
  using (public.is_mentor_or_admin(auth.uid()));

-- ============================================================
-- TASKS TABLE
-- Mentor-assigned tasks for students
-- ============================================================
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  mentor_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null check (category in ('resume', 'github', 'linkedin', 'projects', 'coding', 'aptitude', 'interview', 'general')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  deadline timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Students can view their own tasks"
  on public.tasks for select
  using (auth.uid() = student_id);

create policy "Students can update task status"
  on public.tasks for update
  using (auth.uid() = student_id);

create policy "Mentors can manage tasks they created"
  on public.tasks for all
  using (auth.uid() = mentor_id);

create policy "Admins can view all tasks"
  on public.tasks for select
  using (public.is_admin(auth.uid()));

-- ============================================================
-- FEEDBACK TABLE
-- Mentor feedback messages for students
-- ============================================================
create table public.feedback (
  id uuid default uuid_generate_v4() primary key,
  mentor_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  category text check (category in ('resume', 'github', 'linkedin', 'projects', 'coding', 'aptitude', 'interview', 'general')),
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

create policy "Students can view their own feedback"
  on public.feedback for select
  using (auth.uid() = student_id);

create policy "Mentors can manage their own feedback"
  on public.feedback for all
  using (auth.uid() = mentor_id);

create policy "Admins can view all feedback"
  on public.feedback for select
  using (public.is_admin(auth.uid()));

-- ============================================================
-- AI REPORTS TABLE
-- Stored AI analysis results
-- ============================================================
create table public.ai_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  strengths text[] default '{}',
  weaknesses text[] default '{}',
  recommendations text[] default '{}',
  thirty_day_plan text,
  readiness_percentage integer,
  raw_json jsonb,
  created_at timestamptz default now()
);

alter table public.ai_reports enable row level security;

create policy "Users can view their own AI reports"
  on public.ai_reports for select
  using (auth.uid() = user_id);

create policy "Users can create their own AI reports"
  on public.ai_reports for insert
  with check (auth.uid() = user_id);

create policy "Mentors can view all AI reports"
  on public.ai_reports for select
  using (public.is_mentor_or_admin(auth.uid()));

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );

  insert into public.progress (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamps
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_projects_updated_at before update on public.projects
  for each row execute procedure public.handle_updated_at();

create trigger handle_progress_updated_at before update on public.progress
  for each row execute procedure public.handle_updated_at();

create trigger handle_checklist_updated_at before update on public.checklist_items
  for each row execute procedure public.handle_updated_at();

create trigger handle_github_updated_at before update on public.github_data
  for each row execute procedure public.handle_updated_at();

create trigger handle_tasks_updated_at before update on public.tasks
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_progress_user_id on public.progress(user_id);
create index if not exists idx_checklist_user_category on public.checklist_items(user_id, category);
create index if not exists idx_tasks_student_id on public.tasks(student_id);
create index if not exists idx_tasks_mentor_id on public.tasks(mentor_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_feedback_student_id on public.feedback(student_id);
create index if not exists idx_ai_reports_user_id on public.ai_reports(user_id);
