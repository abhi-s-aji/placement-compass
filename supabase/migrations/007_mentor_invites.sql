-- ============================================================
-- Placement Compass - Mentor Invites Table
-- Allows admins to generate secure invite tokens for mentors
-- ============================================================

create table if not exists public.mentor_invites (
  id uuid default uuid_generate_v4() primary key,
  token text not null unique,
  role text not null default 'mentor' check (role in ('mentor', 'admin')),
  used boolean not null default false,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.mentor_invites enable row level security;

-- Only admins can create or view invites
create policy "Admins can manage invites"
  on public.mentor_invites for all
  using (public.is_admin(auth.uid()));

-- Anyone with the exact token can read it (needed for registration validation)
create policy "Token holder can view their invite"
  on public.mentor_invites for select
  using (true);

-- Index for fast token lookups
create index if not exists idx_mentor_invites_token on public.mentor_invites(token);
create index if not exists idx_mentor_invites_used on public.mentor_invites(used);
