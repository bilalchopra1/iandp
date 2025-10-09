import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.ghauseditz.com"


def scrape():
    """
    Scrapes prompts from ghauseditz.com by parsing HTML from journal pages.
    """
    print("Scraping prompts from ghauseditz.com...")
    headers = {"User-Agent": "imagesandprompts-scraper/1.0"}
    scraped_prompts = []

    try:
        # Start with the main journal page
        response = requests.get(f"{BASE_URL}/journal", headers=headers, timeout=20)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")

        # Find all links to individual journal entries
        journal_links = soup.select("a.journal-item-title-link")

        for link in journal_links:
            entry_url = BASE_URL + link["href"]
            entry_response = requests.get(entry_url, headers=headers, timeout=20)
            entry_response.raise_for_status()
            entry_soup = BeautifulSoup(entry_response.content, "html.parser")

            # Prompts are in 'p' tags within a 'sqs-block-content' div
            prompt_elements = entry_soup.select(".sqs-block-content p")
            for p in prompt_elements:
                scraped_prompts.append(p.get_text(strip=True))

        print(f"Ghauseditz scraper: Found {len(scraped_prompts)} new prompts.")
        return scraped_prompts

    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL for Ghauseditz: {e}")
        return []
    except Exception as e:
        print(f"An error occurred during Ghauseditz scraping: {e}")
        return []