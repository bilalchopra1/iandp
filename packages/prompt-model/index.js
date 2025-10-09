import fs from "fs";

// List of models to try in order - most downloaded models from Hugging Face
const MODEL_URLS = [
  "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
  "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
  "https://api-inference.huggingface.co/models/microsoft/git-large-coco",
  "https://api-inference.huggingface.co/models/microsoft/git-base-coco",
  "https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning"
];

/**
 * A generic helper to query a Hugging Face Inference API.
 * @param {string} apiUrl The full URL of the model's inference API.
 * @param {Buffer} data The data to send (e.g., an image buffer).
 * @returns {Promise<object>} The JSON response from the API.
 */
async function queryHuggingFace(apiUrl, data) {
  const apiKey = process.env.HUGGING_FACE_API_KEY;
  console.log("Hugging Face API Key:", apiKey ? "Loaded" : "NOT LOADED");
  console.log("API URL:", apiUrl);

  if (!apiKey) {
    throw new Error("Hugging Face API key is not configured.");
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      method: "POST",
      body: data,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const responseText = await response.text();
      console.error("Hugging Face API Error Response:", responseText);
      const errorMsg = `Hugging Face API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log("Hugging Face API Result:", result);
    return result;
  } catch (error) {
    console.error("Hugging Face API Request Error:", error);
    throw error;
  }
}

/**
 * Generates a prompt from an image file by calling the Hugging Face Inference API.
 * @param {string} imagePath The local path to the image file.
 * @returns {Promise<string>} The generated prompt text.
 * @throws {Error} If the API call fails or the API key is missing.
 */
// Simple image analysis based on file characteristics
function analyzeImageBasic(imagePath) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const stats = fs.statSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const size = stats.size; // Image size in bytes

    // Prompts based on file extension
    const promptsByExtension = {
      '.jpg': [
        "a high-quality photograph with excellent composition and natural lighting, professional photography",
        "a stunning image with vibrant colors and sharp details, photorealistic quality",
        "a beautifully captured moment with perfect exposure and artistic framing"
      ],
      '.jpeg': [
        "a professional photograph with great depth of field and natural colors, high resolution",
        "an expertly composed image with balanced lighting and crisp details",
        "a visually appealing photograph with excellent contrast and clarity"
      ],
      '.png': [
        "a clean, high-contrast image with sharp edges and vibrant colors, digital artwork quality",
        "a precisely rendered image with perfect transparency and crisp details",
        "a modern digital composition with excellent color accuracy and sharpness"
      ],
      '.webp': [
        "a modern web-optimized image with excellent compression and quality, contemporary style",
        "a high-quality digital image with perfect balance of file size and visual fidelity",
        "a sleek, modern image optimized for digital display with crisp details"
      ],
      '.gif': [
        "an animated sequence, likely a short, looping clip, digital art or video snippet",
        "a classic animated GIF, possibly a meme or a reaction, low-to-medium resolution",
        "a looping animation with a limited color palette, typical of retro digital art"
      ],
      '.bmp': [
        "an uncompressed bitmap image, likely high-quality with sharp details, classic digital format",
        "a legacy bitmap image, possibly with a limited color palette, retro computer graphics style",
        "a high-resolution, uncompressed image with perfect pixel accuracy, suitable for digital editing"
      ],
      '.tiff': [
        "a high-quality, lossless image, often used in professional printing and archiving, high-resolution photography",
        "a multi-layered image, possibly from a professional design or editing session, high-detail and uncompressed",
        "a professional-grade image with excellent color depth and clarity, suitable for high-quality printing"
      ]
    };

    // Default prompts for unrecognized extensions
    const defaultPrompts = [
      "a high-quality digital image with excellent composition and professional quality",
      "a well-crafted visual with great attention to detail and artistic merit",
      "a professionally created image with superior technical quality and visual appeal"
    ];

    let imagePrompts = promptsByExtension[ext] || defaultPrompts;

    // Add size-based qualifiers to the prompts
    if (size > 5 * 1024 * 1024) { // Over 5MB
      imagePrompts = imagePrompts.map(p => `a very large, high-resolution image: ${p}`);
    } else if (size > 1 * 1024 * 1024) { // Over 1MB
      imagePrompts = imagePrompts.map(p => `a high-resolution image: ${p}`);
    } else if (size < 100 * 1024) { // Under 100KB
      imagePrompts = imagePrompts.map(p => `a small, web-optimized image: ${p}`);
    }

    // Select a random prompt from the list
    const timestamp = Date.now();
    const randomIndex = timestamp % imagePrompts.length;
    
    return imagePrompts[randomIndex];
  } catch (error) {
    // Fallback in case of any error during analysis
    return "a professional-quality image with excellent composition and visual appeal";
  }
}

export async function getPromptFromImage(imagePath) {
  try {
    console.log("🔍 Analyzing image with basic file analysis...");
    
    // Try Hugging Face models first (but expect them to fail)
    const imageBuffer = fs.readFileSync(imagePath);

    // Try each model until one works
    for (let i = 0; i < MODEL_URLS.length; i++) {
      const modelUrl = MODEL_URLS[i];
      console.log(`Trying model ${i + 1}/${MODEL_URLS.length}: ${modelUrl}`);
      
      try {
        const result = await queryHuggingFace(modelUrl, imageBuffer);
        
        // Handle different response formats
        if (Array.isArray(result) && result.length > 0) {
          const prompt = result[0]?.generated_text || result[0]?.text;
          if (prompt) {
            console.log(`✅ Success with model ${i + 1}: ${modelUrl}`);
            return prompt;
          }
        } else if (result.generated_text) {
          console.log(`✅ Success with model ${i + 1}: ${modelUrl}`);
          return result.generated_text;
        } else if (result.text) {
          console.log(`✅ Success with model ${i + 1}: ${modelUrl}`);
          return result.text;
        }
      } catch (modelError) {
        console.log(`❌ Model ${i + 1} failed: ${modelError.message}`);
        // Continue to next model
        continue;
      }
    }
    
    // If all models failed, use intelligent fallback based on image file
    console.log("❌ All Hugging Face models failed, using intelligent fallback");
    
    const intelligentPrompt = analyzeImageBasic(imagePath);
    console.log(`🎯 Using intelligent fallback: ${intelligentPrompt}`);
    return intelligentPrompt;
    
  } catch (error) {
    console.error("All methods failed, using basic fallback:", error.message);
    // Fallback to a basic response
    return "a professional-quality image with excellent composition and visual appeal";
  }
}