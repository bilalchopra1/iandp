import requests

def scrape():
    """
    Scrapes recent prompts from Civitai.com's public API.
    """
    print("Scraping prompts from Civitai.com...")
    # Public API endpoint for fetching images, sorted by newest
    url = "https://civitai.com/api/v1/images?sort=Newest&limit=100"
    headers = {"User-Agent": "imagesandprompts-scraper/1.0"}
    
    scraped_data = []

    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        items = data.get("items", [])

        if not items:
            print("Civitai scraper: No items found in API response.")
            return scraped_data

        # Extract the prompt text and image URL from each image object
        for item in items:
            if not isinstance(item, dict):
                continue

            prompt_text = item.get('meta', {}).get('prompt') if item.get('meta') else None
            image_url = item.get('url')

            # We only want items that have both a prompt and an image
            if prompt_text and isinstance(prompt_text, str) and image_url:
                # The API sometimes returns different image sizes, we'll pick the most common width
                image_url = image_url.replace('/width=dpr', '/width=450')
                scraped_data.append({'prompt_text': prompt_text, 'image_url': image_url})

        print(f"Civitai scraper: Found {len(scraped_data)} new prompts with images.")
        return scraped_data

    except requests.exceptions.RequestException as e:
        print(f"Error fetching Civitai URL {url}: {e}")
        return scraped_data
    except Exception as e:
        print(f"An error occurred during Civitai scraping: {e}")
        return scraped_data