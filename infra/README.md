# Infrastructure

This directory contains all infrastructure-as-code and configuration for the project's deployment and database.

## Files

-   `supabase-schema.sql`: The complete SQL schema for our Supabase PostgreSQL database. This is the source of truth for our database structure.

-   `vercel.json`: Configuration file for deploying the Next.js frontend (`apps/web`) to Vercel. It specifies the root directory and build commands for the monorepo.

-   `github-actions/scrape.yml`: A GitHub Actions workflow that runs the Python scraper (`apps/scraper`) on a daily schedule to populate the database with new prompts.