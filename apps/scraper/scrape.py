"""
This module runs various scrapers to collect image prompts from different
websites and stores them in a Supabase database.
"""
import os
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
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
import prompthero_scraper # pylint: disable=wrong-import-position
import openart_scraper # pylint: disable=wrong-import-position
import reddit_scraper # pylint: disable=wrong-import-position
import tag_utils  # pylint: disable=wrong-import-position

def get_supabase_client() -> Client:
    """Initializes and returns the Supabase client."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise EnvironmentError("Supabase URL and service key must be set in the environment.")

    return create_client(url, key)

def run_scraper_task(scraper_module):
    """Wrapper to run a scraper and handle its output."""
    try:
        prompts = scraper_module.scrape()
        # Basic validation to ensure scraper returns a list of dicts with 'prompt_text'
        if not isinstance(prompts, list) or not all(isinstance(p, dict) and 'prompt_text' in p for p in prompts):
            print(f"Warning: {scraper_module.__name__} returned malformed data. Skipping.")
            return []
        print(f"Successfully scraped {len(prompts)} prompts from {scraper_module.__name__}.")
        return prompts
    except Exception as e:  # pylint: disable=broad-except
        print(f"Error running {scraper_module.__name__}: {e}")
        return []

def batch_insert(supabase: Client, table_name: str, data: list, batch_size: int = 500):
    """Inserts data in batches to avoid large request payloads."""
    total_upserted = 0
    for i in range(0, len(data), batch_size):
        batch = data[i:i + batch_size]
        response = supabase.table(table_name).upsert(batch, on_conflict="prompt_text").execute()
        total_upserted += len(response.data)
    return total_upserted

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
            prompthero_scraper,
            openart_scraper,
            reddit_scraper,
            # To add another site, import it and add the module to this list.
        ]
        
        # Run scrapers concurrently for better performance
        with ThreadPoolExecutor(max_workers=len(scrapers)) as executor:
            future_to_scraper = {executor.submit(run_scraper_task, s): s for s in scrapers}
            for future in as_completed(future_to_scraper):
                all_prompts.extend(future.result())

        if all_prompts:
            # Deduplicate based on prompt_text
            seen_prompts = set()
            unique_prompts = []
            for item in all_prompts:
                if item['prompt_text'] not in seen_prompts:
                    unique_prompts.append(item)
                    seen_prompts.add(item['prompt_text'])
            
            print(f"\nTotal unique prompts collected: {len(unique_prompts)}")

            data_to_insert = [
                {
                    "prompt_text": item['prompt_text'],
                    "image_url": item.get('image_url'),
                    "source": item.get('source', 'scraper'), # Allow scrapers to specify their source
                    "style_tags": tag_utils.generate_tags(item['prompt_text']),
                } for item in unique_prompts
            ]
            
            upserted_count = batch_insert(supabase, "prompts", data_to_insert)
            print(f"Successfully upserted {upserted_count} prompts into the database.")
    except APIError as e:
        print(f"A Supabase API error occurred: {e}")
    except EnvironmentError as e:
        print(f"An environment configuration error occurred: {e}")

if __name__ == "__main__":
    main()