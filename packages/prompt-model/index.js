import fs from "fs";

const MODEL_API_URL =
  "https://api-inference.huggingface.co/models/salesforce/blip-image-captioning-large";

/**
 * A generic helper to query a Hugging Face Inference API.
 * @param {string} apiUrl The full URL of the model's inference API.
 * @param {Buffer} data The data to send (e.g., an image buffer).
 * @returns {Promise<object>} The JSON response from the API.
 */
async function queryHuggingFace(apiUrl, data) {
  const apiKey = process.env.HUGGING_FACE_API_KEY;
  console.log("Hugging Face API Key:", apiKey ? "Loaded" : "NOT LOADED");

  if (!apiKey) {
    throw new Error("Hugging Face API key is not configured.");
  }

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: data,
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.error("Hugging Face API Error Response:", responseText);
    const errorMsg = `Hugging Face API error: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  const result = await response.json();

  return result;
}

/**
 * Generates a prompt from an image file by calling the Hugging Face Inference API.
 * @param {string} imagePath The local path to the image file.
 * @returns {Promise<string>} The generated prompt text.
 * @throws {Error} If the API call fails or the API key is missing.
 */
export async function getPromptFromImage(imagePath) {
  // Read the image file from the temporary path
  const imageBuffer = fs.readFileSync(imagePath);

  const result = await queryHuggingFace(MODEL_API_URL, imageBuffer);

  return result[0]?.generated_text || "Could not generate a prompt for this image.";
}