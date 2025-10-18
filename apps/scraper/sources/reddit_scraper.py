import requests

def scrape_subreddit(subreddit):
    """Helper function to scrape a single subreddit."""
    print(f"Scraping prompts from r/{subreddit}...")
    # Use the .json endpoint for easy parsing
    url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit=100"
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; imagesandprompts-scraper/1.0)"
    }
    
    scraped_data = []
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        posts = data.get('data', {}).get('children', [])

        for post in posts:
            post_data = post.get('data', {})
            
            # We are looking for image posts
            is_image = post_data.get('post_hint') == 'image'
            image_url = post_data.get('url_overridden_by_dest')
            prompt_text = post_data.get('title')

            if is_image and image_url and prompt_text:
                # Filter out common non-prompt titles
                if "comment" in prompt_text.lower() or "question" in prompt_text.lower():
                    continue
                scraped_data.append({'prompt_text': prompt_text, 'image_url': image_url})

        print(f"Reddit scraper: Found {len(scraped_data)} prompts from r/{subreddit}.")
        return scraped_data

    except Exception as e:
        print(f"An error occurred during Reddit scraping for r/{subreddit}: {e}")
        return []

def scrape():
    """Scrapes prompts from a list of relevant Reddit communities."""
    all_reddit_data = []
    subreddits = ["StableDiffusion", "midjourney", "dalle2", "aiArt"]
    for sub in subreddits:
        all_reddit_data.extend(scrape_subreddit(sub))
    return all_reddit_data