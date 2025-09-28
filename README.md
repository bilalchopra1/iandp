# images&prompts

**images&prompts** is a full-stack application designed to extract text prompts from AI-generated images. It features a Next.js frontend, a Supabase backend for database and user authentication, and a Python scraper for populating a public prompt library.

This monorepo contains the frontend, backend services, and shared packages for the application.

## Project Structure

The repository is a monorepo managed with npm workspaces.

```
iandp/
├── apps/
│   ├── web/         # Next.js frontend (Vercel)
│   └── scraper/     # Python scraper (GitHub Actions)
│
├── packages/
│   ├── ui/          # Shared React components (buttons, cards)
│   ├── api-client/  # JS client for backend endpoints
│   └── prompt-model/ # Wrapper for Hugging Face API calls
│
├── infra/
│   └── supabase-schema.sql # Database schema
│
├── .gitignore
├── package.json     # Root workspace config
└── README.md
```

## How It Works

*   **`apps/web`**: The main user-facing Next.js site where users can upload an image to get a prompt or explore the prompt library.
*   **`apps/scraper`**: A Python script that runs on a schedule (e.g., via GitHub Actions) to crawl public sources for AI prompts and populate the Supabase database.
*   **`packages/ui`**: A shared library of React components used across the web application to maintain a consistent design system.
*   **`packages/prompt-model`**: Handles the core logic of sending an image to a machine learning model (like Hugging Face CLIP Interrogator) and receiving a text prompt in return.
*   **`infra`**: Contains the database schema (`supabase-schema.sql`) for the Supabase backend.

## Environment Variables

To run the web application locally, you'll need to set up your Supabase environment variables. Create a `.env.local` file in the `apps/web` directory:

```bash
# apps/web/.env.local

NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
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