-- ================================
-- =================================================================
-- imagesandprompts Database Schema
-- =================================================================
 
-- Create a table for public user profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username ~ '^[a-zA-Z0-9_]{3,15}$'),
  subscription_status text default 'free' not null, -- e.g., 'free', 'premium'
  updated_at timestamptz default now()
);

comment on table public.profiles is 'Stores public-facing user data, linked to auth.users.';

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
-- It's a good practice to set the search_path to prevent security issues.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================
-- CORE TABLES (Prompts, Images, Tags)
-- ================================

-- Prompts table (text prompt + metadata)
create table if not exists public.prompts (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  prompt_text text not null,
  image_url text,                  -- URL for scraped images
  style_tags text[],               -- array of style tags (e.g., {'Hollywood','B&W'})
  source text,                     -- e.g. 'upload', 'scraper', 'manual'
  avg_rating numeric(3, 2) default 0.00, -- e.g., 4.50
  rating_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Images table (stores info about uploaded image + generated prompt id)
create table if not exists public.images (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
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
  user_id uuid references public.profiles(id) on delete cascade,
  prompt_id bigint references public.prompts(id) on delete cascade,
  primary key (user_id, prompt_id)
);

-- Prompt Ratings table (stores individual user ratings for prompts)
create table if not exists public.prompt_ratings (
  user_id uuid references public.profiles(id) on delete cascade,
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
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  is_public boolean default false
);

-- Linking table for prompts and packs
create table if not exists public.prompt_pack_items (
  pack_id bigint not null references public.prompt_packs(id) on delete cascade,
  prompt_id bigint not null references public.prompts(id) on delete cascade,
  primary key (pack_id, prompt_id)
);

-- ================================
-- RPC FUNCTIONS
-- ================================

-- Function to create a prompt and its associated image record in a single transaction.
-- This ensures data integrity when a user uploads an image to generate a prompt.
create or replace function public.create_prompt_and_image_record(
  p_user_id uuid,
  p_prompt_text text,
  p_style_tags text[],
  p_storage_path text,
  p_original_filename text
)
returns json as $$
declare
  new_prompt_id bigint;
  new_prompt json;
begin
  -- Insert into the prompts table and get the new prompt's ID
  insert into public.prompts (user_id, prompt_text, style_tags, source)
  values (p_user_id, p_prompt_text, p_style_tags, 'upload')
  returning id into new_prompt_id;

  -- Insert into the images table, linking it to the new prompt
  insert into public.images (user_id, prompt_id, storage_path, original_filename)
  values (p_user_id, new_prompt_id, p_storage_path, p_original_filename);

  -- Return the newly created prompt record as JSON
  select to_json(p) into new_prompt from public.prompts p where p.id = new_prompt_id;
  return new_prompt;
end;
$$ language plpgsql security definer;

-- ================================
-- RATE LIMITING
-- ================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    requests_count INT NOT NULL DEFAULT 0,
    window_start_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

comment on table public.rate_limits is 'Tracks API request counts for free-tier users.';

-- Disable RLS for this table because it's managed by a SECURITY DEFINER function
alter table public.rate_limits disable row level security;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID,
    p_max_requests INT,
    p_time_window_seconds INT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INT;
    window_start TIMESTAMPTZ;
    time_window_expired BOOLEAN;
BEGIN
    SELECT requests_count, window_start_at INTO current_count, window_start
    FROM public.rate_limits
    WHERE user_id = p_user_id;

    time_window_expired := (window_start IS NULL) OR (NOW() - window_start >= (p_time_window_seconds * INTERVAL '1 second'));

    IF time_window_expired THEN
        INSERT INTO public.rate_limits (user_id, requests_count, window_start_at)
        VALUES (p_user_id, 1, NOW())
        ON CONFLICT (user_id) DO UPDATE SET requests_count = 1, window_start_at = NOW();
        RETURN TRUE;
    ELSE
        IF current_count >= p_max_requests THEN
            RETURN FALSE; -- Rate limit exceeded
        ELSE
            UPDATE public.rate_limits SET requests_count = requests_count + 1 WHERE user_id = p_user_id;
            RETURN TRUE;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bucket for image files
-- (create a bucket called 'uploads' in Supabase Storage UI)

-- ================================
-- Suggested indexes
-- ================================
create index if not exists idx_prompt_ratings_prompt_id on public.prompt_ratings(prompt_id);
create index if not exists idx_prompts_text on public.prompts using gin (to_tsvector('english', prompt_text));
create index if not exists idx_prompts_tags on public.prompts using gin (style_tags);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all data tables
alter table public.prompts enable row level security;
alter table public.images enable row level security;
alter table public.tags enable row level security;
alter table public.prompt_tags enable row level security;
alter table public.prompt_favorites enable row level security;
alter table public.prompt_ratings enable row level security;
alter table public.prompt_packs enable row level security;
alter table public.prompt_pack_items enable row level security;

-- ========================================
-- PROMPTS table policies
-- ========================================

DROP POLICY IF EXISTS "Public can view all prompts" ON public.prompts;
-- 1. Prompts should be publicly viewable for the 'Explore' page.
create policy "Public can view all prompts"
on public.prompts
for select
using (true);

-- 2. Authenticated users can insert prompts.
DROP POLICY IF EXISTS "Users can insert their own prompts" ON public.prompts;
create policy "Users can insert their own prompts"
on public.prompts
for insert
with check (auth.role() = 'authenticated' and user_id = auth.uid());

-- 3. Users can only update or delete prompts they created.
DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
create policy "Users can update their own prompts"
on public.prompts
for update
using (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
create policy "Users can delete their own prompts"
on public.prompts
for delete
using (user_id = auth.uid());

-- ========================================
-- IMAGES table policies
-- ========================================

DROP POLICY IF EXISTS "Users can manage their own images" ON public.images;
-- Users can perform all actions on their own images. RLS is enabled on the table.
create policy "Users can manage their own images"
on public.images
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ========================================
-- PROMPT_FAVORITES table policies
-- ========================================

DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.prompt_favorites;
-- Users can manage their own favorites.
create policy "Users can manage their own favorites"
on public.prompt_favorites
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ========================================
-- PROMPT_RATINGS table policies
-- ========================================

DROP POLICY IF EXISTS "Users can manage their own ratings" ON public.prompt_ratings;
-- Users can manage their own ratings.
create policy "Users can manage their own ratings"
on public.prompt_ratings
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ========================================
-- PROMPT_PACKS table policies
-- ========================================

DROP POLICY IF EXISTS "Public can view public prompt packs" ON public.prompt_packs;
-- 1. Public packs are viewable by everyone. RLS is enabled on the table.
create policy "Public can view public prompt packs"
on public.prompt_packs
for select
using (is_public = true);

DROP POLICY IF EXISTS "Users can view their own prompt packs" ON public.prompt_packs;
-- 2. Users can view their own private packs.
create policy "Users can view their own prompt packs"
on public.prompt_packs
for select
using (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own prompt packs" ON public.prompt_packs;
-- 3. Users can manage (create, update, delete) their own packs.
create policy "Users can manage their own prompt packs"
on public.prompt_packs
for all
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- ========================================
-- PROMPT_PACK_ITEMS table policies
-- ========================================

DROP POLICY IF EXISTS "Users can manage items in their own packs" ON public.prompt_pack_items;
-- Users can manage items in packs they created. RLS is enabled on the table.
create policy "Users can manage items in their own packs"
on public.prompt_pack_items
for all
using (exists (
  SELECT 1 FROM public.prompt_packs
  WHERE id = prompt_pack_items.pack_id AND created_by = auth.uid()
));
