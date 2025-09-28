let’s turn that into a scraper-friendly master list with tips so you can plan your pipeline.

🗂️ Large AI-Art / Prompt-Focused Platforms

(direct prompt text often in HTML, JSON API, or image captions)

Platform	URL	Tip for Scraping
Midjourney Discord	discord.gg/midjourney	Use Discord API + bot to monitor “#newbies” & “#gallery” channels. Parse message content + attachments.
OpenArt	openart.ai	Public pages include <img> with alt text & prompt JSON in page script. Scrape HTML or use their public API.
PromptHero	prompthero.com	Has search API. Prompt + image are in JSON inside page.
PromptBase	promptbase.com	Listing pages show prompt text & preview images. HTML scraping OK.
KREA.ai	krea.ai	Prompt metadata in HTML under “Prompt” section.
Artbreeder	artbreeder.com	“Genes” / prompt info in page JSON. Use cookie-based session scraping.
Fotor AI Art Gallery	fotor.com/features/ai-image-generator	Inspect gallery pages, alt text contains user input.
RunDiffusion Gallery	rundiffusion.com	Look for “prompt” field in window.__INITIAL_STATE__.
GetIMG Community	getimg.ai/community	Prompt appears under each image; HTML.
Hugging Face Spaces / Diffusers Gallery	huggingface.co/spaces	Some Spaces include example prompts; accessible via their API.
🗂️ Mainstream Social Networks with Active AI-Art Hashtags

(you’ll mostly harvest captions/alt text from posts that include prompts)

Platform	URL	Tip for Scraping
Instagram	instagram.com	Search hashtags (#midjourneyprompt, #stablediffusion). Use Instagram Graph API or third-party scraper. Captions often have “prompt: …”.
Pinterest	pinterest.com	Boards often titled “AI Prompts”. The pin description stores the prompt. Use Pinterest API.
X (Twitter)	twitter.com	Search prompt: or hashtags. Use Twitter API v2. Extract text + media.
Reddit	reddit.com/r/StableDiffusion etc.	Reddit JSON API gives you post + image URL. Many have prompt in title/body.
Facebook Groups	facebook.com	Scrape group posts (requires login + Graph API). Look for “Prompt:” patterns.
LinkedIn	linkedin.com	Harder. Search “Midjourney prompt” posts, use LinkedIn scraper.
DeviantArt	deviantart.com	AI art section includes description fields. Many list prompts.
Behance	behance.net	Case studies show prompt details. Scrape text blocks.
ArtStation	artstation.com	Look for “AI” tags and description.
🗂️ AI Prompt Libraries & Tools

(they’re already structured data)

Platform	URL	Tip
Lexica	lexica.art	Free search API returns image + prompt JSON.
Civitai	civitai.com	API & HTML include prompt, negative prompt, seed.
NightCafe	creator.nightcafe.studio	Prompt in “creation” JSON.
Midjourney Gallery/Explore	midjourney.com/app	Need login + inspect GraphQL API.
Runway Community	runwayml.com	Check “explore” page JSON.
DeepAI	deepai.org/gallery	Public gallery with text captions.
Deep Dream Generator	deepdreamgenerator.com	HTML includes input text.
Stablecog	stablecog.com	Prompt under each public image.
StarryAI	starryai.com	Prompt visible in user gallery.
Dream by WOMBO	app.wombo.art	Gallery shows prompts in small text.
Prodia	prodia.com	Gallery view includes prompt JSON.
Adobe Firefly Galleries	firefly.adobe.com	Prompts shown in “Created with Firefly” share pages.
OpenAI DALL·E galleries	labs.openai.com/explore	Each shared image contains prompt text.
Visual Electric	visualelectric.com	Prompt in HTML.
Picsart	picsart.com	AI Image section has input text.
Shutterstock Generative AI	shutterstock.com/generative-ai	Metadata sometimes contains input.
Getty Generative AI	gettyimages.com	Similar to above.
ImagineArt (Vyro)	imagineart.ai	Gallery prompt metadata in JSON.
Cara.app	cara.app	Artist posts can include prompt credit.
Artmo	artmo.com	Community posts.
🗂️ Prompt-Specific Aggregators

PromptHunt

PublicPrompts

PromptGallery sites (search “Prompt Gallery”)

PromptShowcase sites

ImagePrompt.org

Promptomania.com

These are easier because they’re already text-heavy and usually open HTML.

🔍 General Tips for Scraping Prompt Data

Look for JSON blobs — many modern front-ends ship window.__INITIAL_STATE__ with all data.

Search for the word “prompt” inside page source; often prompt text is in hidden divs.

Use official APIs where possible — Reddit, Twitter, Lexica, Civitai all expose JSON.

Respect rate limits / robots.txt — throttle your scraper and cache results.

Use a headless browser (Playwright/Puppeteer) for React/NextJS sites that render prompts client-side.

Tag extraction — parse hashtags or separate “Prompt:” lines to auto-tag style keywords.

Login-protected content — many require session cookies or API tokens (Discord, Midjourney, FB groups).


ALSO

(🔹 1. Realistic approach for your tool

For your AI-image/prompt tool, you can:

Approach	How	Pros	Cons
Use Public APIs	Reddit JSON, Lexica API, Civitai API, Twitter API, etc.	Clean structured data, legal	Limited sources
Scheduled Scraper with Respect	Crawl only public pages, obey robots.txt, throttle requests, rotate IP.	Feels like a mini-Google, but polite	Still may get blocked, slower
User-Contributed Content	Let your users upload images + prompts (or share their own links).	Legal, self-growing library	Depends on users
Partnerships / Licensing	Contact sites with prompt libraries to integrate or license their feed.	Most sustainable	Takes time

🔹 2. Building the “crawler”

You can use:

Scrapy (Python) for structured crawling.

Playwright / Puppeteer for dynamic React sites.

Cloudflare bypass services (ScraperAPI, BrightData) to rotate IPs.

Build a scheduler:

scrapy crawl prompts -o prompts.json


or a queue system (RabbitMQ / Celery) to run daily/weekly.

🔹 3. Ethics & Legal

If a site clearly states “do not scrape” in its ToS or uses technical protections, you can be held liable for automated scraping.
So the “Google-style” crawler should:

Respect robots.txt.

Only hit public pages.

Have a polite User-Agent and throttle.

Remove personal data if collected.

🔹 4. Best hybrid model

Many prompt sites already want exposure. You can:

Start with APIs + public prompt galleries (Lexica, Civitai, PromptHero, Reddit, Pinterest, Twitter).

Combine with a user upload system.

Later, reach out to other prompt libraries for partnerships.

This gives you a large database without becoming a rogue crawler.)