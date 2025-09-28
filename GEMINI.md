iandp/
│
├── apps/
│   ├── web/                   # Next.js frontend (Vercel)
│   │   ├── pages/             # Pages (index, explore, api routes)
│   │   ├── components/        # Reusable UI components
│   │   ├── styles/            # Tailwind CSS
│   │   ├── public/            # Static assets (logo, icons)
│   │   └── package.json
│   │
│   └── scraper/               # Python scraper (GitHub Actions)
│       ├── scrape.py          # Crawls prompt sources, pushes to DB
│       ├── requirements.txt
│       └── README.md
│
├── packages/
│   ├── ui/                    # Shared React components (buttons, cards)
│   │   ├── index.js           # Exports Card, GradientButton, etc.
│   │   └── package.json
│   │
│   ├── api-client/            # JS client for backend endpoints
│   │   └── index.js
│   │
│   └── prompt-model/          # Wrapper for Hugging Face API calls
│       ├── index.js           # Sends image to HF, gets prompt back
│       └── README.md
│
├── infra/
│   ├── supabase-schema.sql    # Tables: users, images, prompts, tags
│   ├── vercel.json            # Vercel config
│   ├── github-actions/        # CI/CD + scraper cron
│   │   └── scrape.yml
│   └── README.md
│
├── docs/
│   ├── roadmap.md             # Phases and milestones
│   ├── architecture.md        # System diagram
│   └── api-spec.md            # API routes and responses
│
├── .gitignore
├── package.json               # Root workspace config (npm workspaces)
└── README.md                  # Overview + setup instructions

How it works

apps/web → user-facing site (upload image, view prompt library).

apps/scraper → your prompt crawler (runs on GitHub Actions, feeds Supabase DB).

packages/prompt-model → handles the Hugging Face API call.

packages/ui → shared UI components between apps.

infra → your infrastructure config, DB schema, CI/CD.

Gemini Code Assist can open roadmap.md and architecture.md and build each part step by step.


📑 2. Example roadmap.md (you can copy this into docs/roadmap.md)

# imagesandprompts Roadmap

## Phase 1 – Core MVP (2–3 Days)
- Next.js app with upload form.
- API route calling Hugging Face CLIP Interrogator.
- Display prompt + copy button.
- Seed "Explore" page with 50 sample prompts.

## Phase 2 – Prompt Library Expansion
- Add Supabase DB and storage for prompts and images.
- Implement user accounts (Supabase Auth).
- Build Python scraper on GitHub Actions to pull public prompts into the DB.

## Phase 3 – Community Features
- Save upload history.
- Implement prompt rating and favoriting.
- Automatic style tags based on prompt content (e.g., Hollywood, Noir, B&W).
- Add rate limits and a potential premium tier.

## Phase 4 – Marketplace & Mobile
- Prompt packs marketplace.
- Mobile wrapper app.


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
-- This is just to store extra profile info linked to auth.users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamp with time zone default now()
);

-- Prompts table (text prompt + metadata)
create table if not exists public.prompts (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete set null,
  prompt_text text not null,
  style_tags text[],               -- array of style tags (e.g., {'Hollywood','B&W'})
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

-- Bucket for image files
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