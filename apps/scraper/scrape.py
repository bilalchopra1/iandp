import os
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

def get_supabase_client():
    """Initializes and returns the Supabase client."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise EnvironmentError("Supabase URL and service key must be set in the environment.")

    return create_client(url, key)

def main():
    """Main function to run the scraper and save prompts to the database."""
    try:
        supabase = get_supabase_client()
        
        # --- Run all scrapers and collect prompts ---
        all_prompts = []
        
        # Add prompts from each scraper module
        all_prompts.extend(lexica_scraper.scrape())
        all_prompts.extend(civitai_scraper.scrape())
        # To add another site, create a new file in /scrapers and call it here.

        if all_prompts:
            # Remove duplicates before inserting
            unique_prompts = list(set(all_prompts))
            print(f"\nTotal unique prompts collected: {len(unique_prompts)}")
            
            data_to_insert = [{"prompt_text": text, "source": "scraper"} for text in unique_prompts]
            # Using upsert to avoid inserting duplicate prompts
            data, count = supabase.table("prompts").upsert(data_to_insert, on_conflict="prompt_text").execute()
            print(f"Successfully upserted {len(data[1])} prompts into the database.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()