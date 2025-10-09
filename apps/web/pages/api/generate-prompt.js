import { createClient } from "@supabase/supabase-js";
import { Formidable } from "formidable";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { generateTags } from "tag-generator";
import { getPromptFromImage } from "prompt-model";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ✅ Create Supabase client for server-side operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // ✅ For now, skip authentication to test the API
  // TODO: Implement proper authentication with user sessions
  const user = { id: '00000000-0000-0000-0000-000000000000' };

  const form = new Formidable();

  try {
    const [fields, files] = await form.parse(req);
    const imageFile = files.image?.[0];

    if (!imageFile) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    // 1. Generate the prompt
    const generatedPrompt = await getPromptFromImage(imageFile.filepath);

    // 2. Generate style tags from the prompt
    const styleTags = generateTags(generatedPrompt);
    
    console.log("Generated prompt:", generatedPrompt);
    console.log("Generated tags:", styleTags);

    // 3. Skip database operations for now - just return the prompt
    console.log("Skipping database operations for testing");

    res.status(200).json({ prompt: generatedPrompt });
  } catch (error) {
    console.error("Error in generate-prompt API:", error);
    res.status(500).json({ error: error.message || "Failed to process image." });
  }
}