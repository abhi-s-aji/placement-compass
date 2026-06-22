-- ============================================================
-- Placement Compass - New Features Schema
-- Add Certificates, Target Skills, and Completed Resources
-- ============================================================

-- Certificates Table
create table if not exists public.certificates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  issuing_organization text not null,
  issue_date text,
  credential_url text,
  file_url text,
  created_at timestamptz default now()
);

alter table public.certificates enable row level security;

create policy "Users can manage their own certificates"
  on public.certificates for all
  using (auth.uid() = user_id);

create policy "Mentors can view all certificates"
  on public.certificates for select
  using (public.is_mentor_or_admin(auth.uid()));

-- Target Skills Table
create table if not exists public.target_skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill text not null,
  created_at timestamptz default now(),
  unique(user_id, skill)
);

alter table public.target_skills enable row level security;

create policy "Users can manage their own target skills"
  on public.target_skills for all
  using (auth.uid() = user_id);

create policy "Mentors can view all target skills"
  on public.target_skills for select
  using (public.is_mentor_or_admin(auth.uid()));

-- Completed Resources Table
create table if not exists public.completed_resources (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  resource_id text not null,
  completed_at timestamptz default now(),
  unique(user_id, resource_id)
);

alter table public.completed_resources enable row level security;

create policy "Users can manage their own completed resources"
  on public.completed_resources for all
  using (auth.uid() = user_id);

create policy "Mentors can view all completed resources"
  on public.completed_resources for select
  using (public.is_mentor_or_admin(auth.uid()));

-- Career Path Progress Table
create table if not exists public.career_path_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  path_id text not null,
  completed_steps text[] default '{}'::text[] not null,
  updated_at timestamptz default now(),
  unique(user_id, path_id)
);

alter table public.career_path_progress enable row level security;

create policy "Users can manage their own career path progress"
  on public.career_path_progress for all
  using (auth.uid() = user_id);

create policy "Mentors can view all career path progress"
  on public.career_path_progress for select
  using (public.is_mentor_or_admin(auth.uid()));
