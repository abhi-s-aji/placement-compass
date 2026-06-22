-- ============================================================
-- Placement Compass - Custom Templates and Pathways Schema
-- ============================================================

-- Custom Resume Templates Table
create table if not exists public.user_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  layout_config jsonb not null,
  css_config jsonb,
  share_code text unique,
  is_public boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.user_templates enable row level security;

-- Policies
create policy "Users can manage their own templates"
  on public.user_templates for all
  using (auth.uid() = user_id);

create policy "Anyone can read shared public templates"
  on public.user_templates for select
  using (is_public = true or share_code is not null);

-- Index for share_code lookup
create index if not exists idx_user_templates_share_code on public.user_templates(share_code);


-- User Pathways Table
create table if not exists public.user_pathways (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  steps jsonb not null, -- Array of steps: { id, title, description, resourceUrl, resourceName, completed }
  progress integer default 0,
  share_code text unique,
  is_public boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.user_pathways enable row level security;

-- Policies
create policy "Users can manage their own pathways"
  on public.user_pathways for all
  using (auth.uid() = user_id);

create policy "Anyone can read shared public pathways"
  on public.user_pathways for select
  using (is_public = true or share_code is not null);

-- Index for share_code lookup
create index if not exists idx_user_pathways_share_code on public.user_pathways(share_code);
