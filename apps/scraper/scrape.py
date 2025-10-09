"""
This module runs various scrapers to collect image prompts from different
websites and stores them in a Supabase database.
"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from postgrest.exceptions import APIError
from supabase import Client, create_client

# Load environment variables from .env file
load_dotenv()

# Add the root directory to the Python path to allow imports from the root
# Use pathlib for a more robust path calculation
project_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(project_root))

import lexica_scraper  # pylint: disable=wrong-import-position
import civitai_scraper  # pylint: disable=wrong-import-position
import ghauseditz_scraper  # pylint: disable=wrong-import-position
import tag_utils  # pylint: disable=wrong-import-position

def get_supabase_client() -> Client:
    """Initializes and returns the Supabase client."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise EnvironmentError("Supabase URL and service key must be set in the environment.")

    return create_client(url, key)

def main() -> None:
    """Main function to run the scraper and save prompts to the database."""
    try:
        supabase = get_supabase_client()

        # --- Run all scrapers and collect prompts ---
        all_prompts = []
        scrapers = [
            lexica_scraper,
            civitai_scraper,
            ghauseditz_scraper,
            # To add another site, import it and add the module to this list.
        ]

        for scraper_module in scrapers:
            try:
                prompts = scraper_module.scrape()
                all_prompts.extend(prompts)
            except Exception as e:  # pylint: disable=broad-except
                print(f"Error running {scraper_module.__name__}: {e}")

        if all_prompts:
            # Remove duplicates before inserting
            unique_prompts = list(set(all_prompts))
            print(f"\nTotal unique prompts collected: {len(unique_prompts)}")

            data_to_insert = [
                {
                    "prompt_text": text,
                    "source": "scraper",
                    "style_tags": tag_utils.generate_tags(text),
                } for text in unique_prompts
            ]
            # Using upsert to avoid inserting duplicate prompts
            response = (supabase.table("prompts")
                        .upsert(data_to_insert, on_conflict="prompt_text")
                        .execute())

            # response.data contains the list of upserted items
            upserted_count = len(response.data)
            print(f"Successfully upserted {upserted_count} prompts into the database.")
    except APIError as e:
        print(f"A Supabase API error occurred: {e}")
    except EnvironmentError as e:
        print(f"An environment configuration error occurred: {e}")

if __name__ == "__main__":
    main()