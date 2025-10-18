# Setup Instructions for Images and Prompts Project

This document provides a quick guide to setting up the project. For more detailed instructions, please see the main [README.md](../README.md).

## 1. Environment Variables

- Copy `apps/web/.env.example` to `apps/web/.env.local`.
- Fill in your Supabase URL and Anon Key.

## 2. Supabase Setup

- **Create Storage Bucket:** In your Supabase project dashboard, create a public storage bucket named `uploads`.
- **Run Database Schema:** Copy the entire content of `infra/supabase-schema.sql` and run it in the Supabase SQL Editor. This will create all tables, functions, and security policies.

## 3. Install Dependencies

- **Node.js:** From the project root, run `npm install`.
- **Python:** Create and activate a virtual environment, then run `pip install -r apps/scraper/requirements.txt`.

````

## Database Schema

The database schema is already defined in `infra/supabase-schema.sql`. Run this SQL in your Supabase SQL editor to set up the tables.

## Running the Application

1. Install dependencies:
```bash
npm install
````

2. Start the development server:

```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## Troubleshooting

If you still get "Bucket not found" errors:

- Make sure the bucket name is exactly "uploads" (case-sensitive)
- Verify your Supabase project has storage enabled
- Check that your environment variables are correctly set

The application will now gracefully handle missing storage buckets and continue processing prompts without image uploads.
