import requests
from bs4 import BeautifulSoup

def scrape():
    """
    Scrapes prompts and images from PromptHero.com by parsing HTML.
    This is less stable than an API and may break if the website's layout changes.
    """
    print("Scraping prompts from PromptHero.com...")
    url = "https://prompthero.com/prompts"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    scraped_data = []

    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all prompt items on the page
        prompt_items = soup.find_all('div', class_='prompt-card-container')

        for item in prompt_items:
            prompt_text_element = item.find('p', class_='prompt-text')
            image_element = item.find('img', class_='prompt-image')

            if prompt_text_element and image_element and image_element.has_attr('src'):
                prompt_text = prompt_text_element.get_text(strip=True)
                image_url = image_element['src']
                scraped_data.append({'prompt_text': prompt_text, 'image_url': image_url})

        print(f"PromptHero scraper: Found {len(scraped_data)} new prompts with images.")
        return scraped_data

    except requests.exceptions.RequestException as e:
        print(f"Error fetching PromptHero URL {url}: {e}")
        return []
    except Exception as e:
        print(f"An error occurred during PromptHero scraping: {e}")
        return []