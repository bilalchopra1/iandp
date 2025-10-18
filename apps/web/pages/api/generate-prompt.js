import { createServerClient } from "@supabase/ssr";
import { formidable } from "formidable";
import fs from "fs/promises";

// This function calls the Hugging Face Inference API to generate a prompt from an image.
// It uses the Salesforce/blip-image-captioning-base model.
// Environment variables needed:
// HUGGING_FACE_API_KEY: Your Hugging Face API key.
// HF_INFERENCE_API_URL: The URL of the Hugging Face Inference API.
async function getPromptFromModel(imageData, contentType) {
  console.log(`Generating prompt for image...`);
  const response = await fetch(process.env.HF_INFERENCE_API_URL || 'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base', {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
      "Content-Type": contentType,
    },
    body: imageData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Hugging Face API failed: ${errorBody}`);
  }

  const data = await response.json();
  return data[0]?.generated_text || "A beautiful image of something.";
}

// This is a placeholder for your tag generation logic.
function getTagsFromPrompt(promptText) {
  const tags = new Set();
  if (promptText.includes("landscape")) tags.add("landscape");
  if (promptText.includes("mountains")) tags.add("mountains");
  if (promptText.includes("lake")) tags.add("lake");
  if (promptText.includes("sunrise")) tags.add("sunrise");
  return Array.from(tags);
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies[name],
        set: (name, value, options) => {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly=${options.httpOnly}; Secure=${options.secure}; SameSite=${options.sameSite}`);
        },
        remove: (name, options) => res.setHeader('Set-Cookie', `${name}=; Path=${options.path}; Max-Age=0`),
      },
    }
  );

  try {
    // Get the user from the request's auth cookie.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // --- Rate Limiting Logic ---
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ error: 'Could not verify user subscription.' });
    }

    if (profile?.subscription_status === 'free') {
      const { data: rateLimitOk, error: rpcError } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_max_requests: 10, // Max 10 requests
        p_time_window_seconds: 3600, // per hour (3600 seconds)
      });

      if (rpcError) {
        console.error('Error calling rate limit function:', rpcError);
        return res.status(500).json({ error: 'Could not check rate limit.' });
      }
      if (!rateLimitOk) {
        return res.status(429).json({ error: 'Rate limit exceeded. Free users are limited to 10 generations per hour.' });
      }
    }

    // Get metadata from headers
    const filePath = req.headers['x-file-path'];
    const originalFilename = decodeURIComponent(req.headers['x-original-filename']);

    if (!filePath || !originalFilename) {
      return res.status(400).json({ error: "Missing file path or original filename in headers." });
    }

    // Use formidable to parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
    });

    const [fields, files] = await form.parse(req);
    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ error: "No image file found in the request." });
    }
    const imageBuffer = await fs.readFile(imageFile.filepath);

    // 1. Generate prompt from the image data
    const generatedPrompt = await getPromptFromModel(imageBuffer, imageFile.mimetype);

    // 2. Generate style tags from the prompt
    const styleTags = getTagsFromPrompt(generatedPrompt);

    // 3. Insert prompt and link image record via RPC.
    const { data: prompt, error: rpcError } = await supabase.rpc('create_prompt_and_image_record', {
      p_user_id: user.id,
      p_prompt_text: generatedPrompt,
      p_style_tags: styleTags,
      p_storage_path: filePath,
      p_original_filename: originalFilename,
    });

    if (rpcError) {
      console.error('Error calling create_prompt_and_image_record RPC:', rpcError);
      return res.status(500).json({ error: 'Failed to save prompt and image record.' });
    }

    // 4. Return the newly created prompt object
    res.status(200).json({ prompt });
  } catch (error) {
    console.error('Error in generate-prompt API:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
  }
}