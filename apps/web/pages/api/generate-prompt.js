import fs from "fs";
import { formidable } from "formidable";
import { createPagesServerClient } from '@supabase/ssr';
import { getPromptFromImage } from "prompt-model";

// Turn off the default body parser, as we're using formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const PREDEFINED_STYLE_TAGS = [
  "photorealistic", "4k", "8k", "cinematic", "anime", "impressionistic",
  "oil painting", "studio lighting", "epic", "concept art", "fantasy",
  "sci-fi", "cyberpunk", "steampunk", "noir", "minimalist", "abstract",
  "watercolor", "cartoon", "cel-shaded", "low poly", "pixel art", "vaporwave"
];

function extractStyleTags(promptText) {
  const lowerCasePrompt = promptText.toLowerCase();
  const foundTags = PREDEFINED_STYLE_TAGS.filter(tag =>
    lowerCasePrompt.includes(tag)
  );
  return foundTags;
}

export default async function handler(req, res) {
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Loaded" : "NOT LOADED");
  console.log("Supabase Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Loaded" : "NOT LOADED");
  console.log("Supabase Service Role Key:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "NOT LOADED");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const supabase = createPagesServerClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Fetch user profile to check subscription status
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // Ignore if no profile row exists yet
    console.error("Error fetching user profile:", profileError);
    return res.status(500).json({ error: "Could not fetch user profile." });
  }

  // Apply rate limit based on user's tier
  const userTier = profile?.subscription_status || 'free';
  const limit = userTier === 'premium' ? 60 : 5;
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

  const { count, error: countError } = await supabase
    .from('request_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', oneMinuteAgo);

  if (countError) {
    console.error("Error fetching request count:", countError);
    return res.status(500).json({ error: "Could not verify request limit." });
  }

  if (count >= limit) {
    return res.status(429).json({
      error: "Too many requests.",
      message: `You have exceeded the request limit. Please try again later.`,
    });
  }

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = formidable();
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    const imageFile = files.image?.[0];

    if (!imageFile) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    // Log the request before processing
    const { error: logError } = await supabase.from('request_logs').insert({ user_id: user.id });
    if (logError) {
      console.error("Error logging request:", logError);
      // Decide if you want to proceed even if logging fails
    }

    const generatedPrompt = await getPromptFromImage(imageFile.filepath);
    const styleTags = extractStyleTags(generatedPrompt);

    // Save to Supabase
    const { data: storageData, error: storageError } = await supabase.storage
      .from("uploads")
      .upload(`${user.id}/${Date.now()}-${imageFile.originalFilename}`, {
        file: fs.createReadStream(imageFile.filepath),
        contentType: imageFile.mimetype,
      }, {
        upsert: true,
      });

    if (storageError) throw storageError;

    const { data: promptData, error: promptError } = await supabase
      .from("prompts")
      .insert({
        user_id: user.id,
        prompt_text: generatedPrompt,
        style_tags: styleTags,
        source: "upload",
      })
      .select()
      .single();

    if (promptError) throw promptError;

    const { error: imageError } = await supabase.from("images").insert({
      user_id: user.id,
      prompt_id: promptData.id,
      storage_path: storageData.path,
      original_filename: imageFile.originalFilename,
    });

    if (imageError) throw imageError;

    res.status(200).json({ prompt: generatedPrompt });
  } catch (error) {
    console.error("API Error:", error);
    let errorMessage = "Failed to generate prompt.";
    if (error.message.includes("bucket not found")) {
      errorMessage = "Storage bucket 'uploads' not found. Please check your Supabase project.";
    }
    return res.status(500).json({ error: errorMessage });
  }
}