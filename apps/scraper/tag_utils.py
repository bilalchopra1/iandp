"""
Utility for generating style tags from prompt text.
"""

STYLE_TAGS = [
    "photorealistic", "4k", "8k", "cinematic", "film grain", "portrait",
    "landscape", "sci-fi", "fantasy", "anime", "manga", "cartoon", "comic book",
    "noir", "cyberpunk", "steampunk", "vaporwave", "gothic", "art deco",
    "impressionism", "surrealism", "abstract", "minimalist", "vintage",
    "retro", "black and white", "monochrome", "vibrant", "pastel", "dark",
    "moody", "epic", "dramatic lighting", "studio lighting", "octane render",
    "unreal engine", "hyperrealistic", "concept art", "digital painting",
]

def generate_tags(prompt_text: str) -> list[str]:
    """
    Extracts style tags from a given prompt text.
    """
    if not prompt_text:
        return []

    lowercased_prompt = prompt_text.lower()
    # A simple substring check is fast and effective for this list.
    return [tag for tag in STYLE_TAGS if tag in lowercased_prompt]