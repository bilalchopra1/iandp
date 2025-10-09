iandp/
│
├── apps/
│   ├── web/      # Next.js frontend
│   └── scraper/  # Python scraper
│
├── packages/
│   ├── ui/
│   ├── context/
│   ├── tag-generator/
│   └── supabase-client/
│
├── infra/
│   ├── supabase-schema.sql
│   ├── supabase-profiles.sql
│   └── supabase-rate-limit.sql
│
├── docs/
│   ├── roadmap.md             # Phases and milestones
│   ├── architecture.md        # System diagram
│   └── api-spec.md            # API routes and responses
│
├── .gitignore
├── package.json               # Root workspace config (npm workspaces)
└── README.md                  # Overview + setup instructions

📑 2. Example roadmap.md (you can copy this into docs/roadmap.md)

# imagesandprompts Roadmap

## Phase 1 – Core MVP
- **[DONE]** Next.js app with upload form.
- **[DONE]** API route calling Hugging Face CLIP Interrogator.
- **[DONE]** Display prompt + copy button.
- **[DONE]** Seed "Explore" page with 50 sample prompts.

## Phase 2 – Prompt Library Expansion
- **[DONE]** Add Supabase DB and storage for prompts and images.
- **[DONE]** Implement user accounts (Supabase Auth).
- **[DONE]** Build Python scraper on GitHub Actions to pull public prompts into the DB.

## Phase 3 – Community Features
- **[DONE]** Save upload history.
- **[DONE]** Implement prompt rating and favoriting.
- **[DONE]** Automatic style tags based on prompt content.
- **[DONE]** Add rate limits and a potential premium tier.

## Phase 4 – Marketplace & Mobile
- **[DONE]** Prompt packs marketplace (Web Application).
- **[PENDING]** Mobile wrapper app.


🎨 3. Branding & Design System

### Logo Style Ideas
The core idea is something simple, modern, and recognizable that combines the concepts of images and text. Some ideas include a camera lens with a pencil inside, or a chat bubble with a paintbrush. The format should be a scalable SVG with light and dark mode variants.

### Color Palette & Theme
The application uses a dual light/dark mode theme, configured in `tailwind.config.js` and implemented in the shared `ui` package.

- **Primary Accent:** A bright `blue-purple-pink` gradient (`bg-ai-gradient`) is used for primary calls-to-action (`GradientButton`) and headings (`GradientHeading`) to evoke creativity.
- **UI Theme:** The UI is built on Tailwind's `neutral` color scale for a clean, modern look.
  - **Light Mode:** `bg-neutral-100` page background with `bg-neutral-50` for cards.
  - **Dark Mode:** `bg-neutral-950` page background with `bg-neutral-900` for cards.

-- ================================
-- imagesandprompts Database Schema
-- ================================

-- Users table (Supabase Auth automatically manages auth.users)
-- This table stores additional user data.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  subscription_status text default 'free' not null, -- e.g., 'free', 'premium'
  updated_at timestamp with time zone default now()
);

-- Prompts table (text prompt + metadata)
create table if not exists public.prompts (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete set null,
  prompt_text text not null,
  style_tags text[],               -- e.g., {'Hollywood','B&W'}
  avg_rating numeric(3, 2) default 0.00,
  rating_count int default 0,
  source text,                     -- e.g. 'upload', 'scraper', 'manual'
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

-- Prompt ratings table (stores individual user ratings)
create table if not exists public.prompt_ratings (
  id bigserial primary key,
  prompt_id bigint not null references public.prompts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default now(),
  unique(prompt_id, user_id)
);

-- Prompt favorites table (stores which users favorited which prompts)
create table if not exists public.prompt_favorites (
  prompt_id bigint not null references public.prompts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (prompt_id, user_id)
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

-- Rate limiting table
create table if not exists public.rate_limits (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  requests_count int not null default 1,
  last_request_at timestamptz not null default now(),
  unique (user_id)
);
-- (create a bucket called 'uploads' in Supabase Storage UI)

-- ================================
-- Suggested indexes
-- ================================
create index if not exists idx_prompts_text on public.prompts using gin (to_tsvector('english', prompt_text));
create index if not exists idx_prompts_tags on public.prompts using gin (style_tags);


How it works

auth.users: Supabase manages basic user auth.

public.users: Your extra profile info.

public.prompts: Every prompt (either extracted from an image or scraped).

public.images: Stores path to uploaded image + links to the prompt it produced.

public.tags + public.prompt_tags: optional for advanced tag filtering.

Indexes: speed up full-text search on prompt_text and tags.