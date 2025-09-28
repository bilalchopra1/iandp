# Prompt Scraper

This Python script is designed to be run periodically (e.g., via GitHub Actions) to scrape public sources for AI-generated image prompts and populate the Supabase database.

## Setup

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Variables:**
    Create a `.env` file in this directory and add your Supabase credentials:
    ```
    SUPABASE_URL="your-supabase-url"
    SUPABASE_SERVICE_KEY="your-supabase-service-role-key"
    ```
    **Important:** Use the `service_role` key, as this script needs write access to the database.

## Usage

Run the script directly:
```bash
python scrape.py
```