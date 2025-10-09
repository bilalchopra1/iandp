# images&prompts

**images&prompts** is a full-stack, community-driven platform for discovering, sharing, and managing AI art prompts. It features a Next.js frontend, a Supabase backend, and a complete monetization flow with Stripe.

This monorepo contains the frontend, backend services, and shared packages for the application.

## Features

- **AI-Powered Prompt Generation**: Upload an image to automatically generate a descriptive text prompt. Features a robust fallback mechanism that analyzes image characteristics (file type, size) to provide intelligent prompt suggestions when the primary AI models are unavailable.
- **Community Prompt Library**: Explore a vast library of prompts populated by a Python scraper and user submissions.
- **Advanced Discovery**: Full-text search, filtering by style tags, and sorting by newest or top-rated.
- **User Accounts & History**: Sign up and get a personal history of all your generated prompts.
- **Community Interaction**: Rate and favorite prompts to help surface the best content.
- **Prompt Packs Marketplace**: Browse curated "Prompt Packs" or create, manage, and publish your own.
- **Subscription Tiers**: A complete Stripe integration for a premium subscription tier with higher API rate limits.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage), Vercel Edge Middleware
- **Scraper**: Python (BeautifulSoup, Requests)
- **Monetization**: Stripe
- **AI**: Hugging Face (for prompt generation)
- **Deployment**: Vercel (Web), GitHub Actions (Scraper)

## Monorepo Structure

The repository is a monorepo managed with npm workspaces.

```
iandp/
├── apps/
│   ├── web/         # Next.js frontend (Vercel)
│   └── scraper/     # Python scraper (GitHub Actions)
│
├── packages/
│   ├── ui/            # Shared React components
│   ├── context/       # Auth context
│   ├── tag-generator/ # Shared tag generation logic
│   └── supabase-client/ # Shared Supabase client
│
├── infra/
│   ├── supabase-schema.sql
│   ├── supabase-profiles.sql
│   └── supabase-rate-limit.sql
│
├── .gitignore
├── package.json     # Root workspace config
└── README.md
```

## How It Works

*   **`apps/web`**: The main user-facing Next.js site where users can upload an image to get a prompt or explore the prompt library.
*   **`apps/scraper`**: A Python script that runs on a schedule (e.g., via GitHub Actions) to crawl public sources for AI prompts and populate the Supabase database.
*   **`packages/ui`**: A shared library of React components used across the web application to maintain a consistent design system.
*   **`infra`**: Contains all the SQL scripts for setting up the Supabase database schema, tables, and functions.

## Environment Variables

To run the project locally, create a `.env.local` file in the `apps/web` directory and a `.env` file in the `apps/scraper` directory.

```bash
# apps/web/.env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_KEY="YOUR_SUPABASE_SERVICE_KEY" # For admin tasks like the Stripe webhook

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="YOUR_STRIPE_PUBLISHABLE_KEY"
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"
STRIPE_WEBHOOK_SIGNING_SECRET="YOUR_STRIPE_WEBHOOK_SECRET"
NEXT_PUBLIC_STRIPE_PRICE_ID="YOUR_STRIPE_PRICE_ID" # e.g., price_...

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

You can find these keys in your Supabase project's "Project Settings" > "API" section.

## Getting Started

1. Install dependencies from the root directory:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The web application will be available at `http://localhost:3000`.