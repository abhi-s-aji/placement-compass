-- ============================================================
-- Placement Compass - Student Custom Todos (Google Tasks style)
-- ============================================================

create table if not exists public.student_todos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false not null,
  tags text[] default '{}'::text[] not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.student_todos enable row level security;

-- Policies
create policy "Users can manage their own todos"
  on public.student_todos for all
  using (auth.uid() = user_id);

-- Index for fast lookup by user
create index if not exists idx_student_todos_user_id on public.student_todos(user_id);
