// A predefined list of common style tags.
export const STYLE_TAGS = [
  "photorealistic", "4k", "8k", "cinematic", "film grain", "portrait",
  "landscape", "sci-fi", "fantasy", "anime", "manga", "cartoon", "comic book",
  "noir", "cyberpunk", "steampunk", "vaporwave", "gothic", "art deco",
  "impressionism", "surrealism", "abstract", "minimalist", "vintage",
  "retro", "black and white", "monochrome", "vibrant", "pastel", "dark",
  "moody", "epic", "dramatic lighting", "studio lighting", "octane render",
  "unreal engine", "hyperrealistic", "concept art", "digital painting",
  "long exposure", "golden hour", "blue hour", "art nouveau", "bauhaus"
];

/**
 * Extracts style tags from a given prompt text.
 * @param {string} promptText The text of the prompt.
 * @returns {string[]} An array of found style tags.
 */
export function generateTags(promptText) {
  if (!promptText) return [];
  const lowercasedPrompt = promptText.toLowerCase();
  // Use a regex with word boundaries to avoid partial matches (e.g., 'art' in 'cartoon')
  return STYLE_TAGS.filter(tag =>
    new RegExp(`\\b${tag}\\b`, 'i').test(lowercasedPrompt)
  );
}
