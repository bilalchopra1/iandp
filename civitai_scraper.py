import requests

def scrape():
    """
    Scrapes recent prompts from Civitai.com's public API.
    """
    print("Scraping prompts from Civitai.com...")
    # Public API endpoint for fetching images, sorted by newest
    url = "https://civitai.com/api/v1/images?sort=Newest&limit=100"
    headers = {"User-Agent": "imagesandprompts-scraper/1.0"}
    
    scraped_prompts = []

    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        items = data.get("items", [])

        if not items:
            print("Civitai scraper: No items found in API response.")
            return []

        # Extract the 'meta.prompt' text from each image object
        for item in items:
            # The prompt is often in the 'meta' object
            if isinstance(item, dict) and 'meta' in item and item['meta'] and 'prompt' in item['meta']:
                prompt_text = item['meta']['prompt']
                if prompt_text and isinstance(prompt_text, str):
                    scraped_prompts.append(prompt_text)

        print(f"Civitai scraper: Found {len(scraped_prompts)} new prompts.")
        return scraped_prompts

    except requests.exceptions.RequestException as e:
        print(f"Error fetching Civitai URL {url}: {e}")
        return []
    except Exception as e:
        print(f"An error occurred during Civitai scraping: {e}")
        return []