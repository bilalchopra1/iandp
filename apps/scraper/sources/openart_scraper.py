import requests
from bs4 import BeautifulSoup
import json

def scrape():
    """
    Scrapes prompts and images from OpenArt.ai by parsing JSON from a script tag.
    """
    print("Scraping prompts from OpenArt.ai...")
    url = "https://openart.ai/explore"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    scraped_data = []

    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # OpenArt embeds data in a __NEXT_DATA__ script tag
        script_tag = soup.find('script', id='__NEXT_DATA__')
        if not script_tag:
            print("OpenArt scraper: Could not find __NEXT_DATA__ script tag.")
            return []

        data = json.loads(script_tag.string)
        items = data.get('props', {}).get('pageProps', {}).get('items', [])

        for item in items:
            prompt_text = item.get('prompt')
            image_url = item.get('image_url')
            if prompt_text and image_url:
                scraped_data.append({'prompt_text': prompt_text, 'image_url': image_url})

        print(f"OpenArt scraper: Found {len(scraped_data)} new prompts with images.")
        return scraped_data

    except Exception as e:
        print(f"An error occurred during OpenArt scraping: {e}")
        return []