import requests

def scrape():
    """
    Scrapes prompts from Lexica.art's API.
    Lexica provides a public JSON API, which is much more reliable than parsing HTML.
    """
    print("Scraping prompts from Lexica.art...")
    # This is a documented (but unofficial) API endpoint for Lexica's search.
    # We'll search for a common term like "cinematic" to get recent prompts.
    url = "https://lexica.art/api/v1/search?q=cinematic"
    headers = {"User-Agent": "imagesandprompts-scraper/1.0"}
    
    scraped_prompts = []

    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        images = data.get("images", [])

        if not images:
            print("Lexica scraper: No images found in API response.")
            return []

        # Extract the 'prompt' text from each image object
        for image_data in images:
            if 'prompt' in image_data:
                scraped_prompts.append(image_data['prompt'])

        print(f"Lexica scraper: Found {len(scraped_prompts)} new prompts.")
        return scraped_prompts

    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return []
    except Exception as e:
        print(f"An error occurred during Lexica scraping: {e}")
        return []