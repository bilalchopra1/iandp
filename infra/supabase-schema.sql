-- ================================
-- imagesandprompts Database Schema
-- ================================

-- Users table (Supabase Auth automatically manages auth.users)
-- This is just to store extra profile info linked to auth.users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  subscription_status text default 'free', -- e.g., 'free', 'premium'
  created_at timestamp with time zone default now()
);

-- Prompts table (text prompt + metadata)
create table if not exists public.prompts (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete set null,
  prompt_text text not null,
  style_tags text[],               -- array of style tags (e.g., {'Hollywood','B&W'})
  source text,                     -- e.g. 'upload', 'scraper', 'manual'
  avg_rating numeric(3, 2) default 0.00, -- e.g., 4.50
  rating_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Images table (stores info about uploaded image + generated prompt id)
create table if not exists public.images (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete set null,
  prompt_id bigint references public.prompts(id) on delete set null,
  storage_path text not null,      -- path in Supabase storage bucket
  original_filename text,
  created_at timestamp with time zone default now()
);

-- Optional: Tags table for a normalised many-to-many relation
create table if not exists public.tags (
  id bigserial primary key,
  tag_name text unique not null
);

create table if not exists public.prompt_tags (
  prompt_id bigint references public.prompts(id) on delete cascade,
  tag_id bigint references public.tags(id) on delete cascade,
  primary key (prompt_id, tag_id)
);

-- Favorites table (many-to-many relation between users and prompts)
create table if not exists public.prompt_favorites (
  user_id uuid references auth.users(id) on delete cascade,
  prompt_id bigint references public.prompts(id) on delete cascade,
  primary key (user_id, prompt_id)
);

-- Prompt Ratings table (stores individual user ratings for prompts)
create table if not exists public.prompt_ratings (
  user_id uuid references auth.users(id) on delete cascade,
  prompt_id bigint references public.prompts(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default now(),
  primary key (user_id, prompt_id)
);

-- Prompt packs table (curated collections of prompts)
create table if not exists public.prompt_packs (
  id bigserial primary key,
  name text not null,
  description text,
  cover_image_url text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  is_public boolean default false
);

-- Linking table for prompts and packs
create table if not exists public.prompt_pack_items (
  pack_id bigint not null references public.prompt_packs(id) on delete cascade,
  prompt_id bigint not null references public.prompts(id) on delete cascade,
  primary key (pack_id, prompt_id)
);

-- Bucket for image files
-- (create a bucket called 'uploads' in Supabase Storage UI)

-- ================================
-- Suggested indexes
-- ================================
create index if not exists idx_prompt_ratings_prompt_id on public.prompt_ratings(prompt_id);
create index if not exists idx_prompts_text on public.prompts using gin (to_tsvector('english', prompt_text));
create index if not exists idx_prompts_tags on public.prompts using gin (style_tags);
