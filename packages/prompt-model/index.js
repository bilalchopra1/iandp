import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { HfInference } from "@huggingface/inference";
import { spawn } from "child_process";
import path from "path";

/**
 * Converts a file to a GoogleGenerativeAI.Part object.
 * @param {string} path - The path to the file.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {import("@google/generative-ai").Part}
 */
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

/**
 * Generates a descriptive prompt from an image using Google's Gemini Pro Vision model.
 * @param {string} imagePath - The local file path of the image to analyze.
 * @param {string} mimeType - The MIME type of the image (e.g., 'image/jpeg').
 * @returns {Promise<string>} The generated text prompt.
 */
export async function getPromptFromImageWithGemini(imagePath, mimeType) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable is not set.");
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = "Analyze this image and generate a detailed, descriptive prompt that an AI image generator could use to recreate a similar image. Focus on the style, composition, subject, and any specific artistic details.";

  const imagePart = fileToGenerativePart(imagePath, mimeType);

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  return response.text();
}

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/**
 * Generates a prompt from an image file by calling the Hugging Face Inference API.
 * This is kept as a potential fallback or alternative model.
 * @param {string} imagePath The local path to the image file.
 * @returns {Promise<string>} The generated text prompt.
 */
export async function getPromptFromImageWithHuggingFace(imagePath) {
  const imageBlob = new Blob([fs.readFileSync(imagePath)]);
  const response = await hf.imageToText({
    data: imageBlob,
    model: "nlpconnect/vit-gpt2-image-captioning",
  });

  // The response is { generated_text: '...' }
  return response.generated_text;
}

/**
 * Generates a caption by running a local Python script with the transformers library.
 * This is a completely free, self-hosted option.
 * @param {string} imagePath The local path to the image file.
 * @returns {Promise<string>} The generated caption.
 */
export function getPromptFromImageLocally(imagePath) {
  return new Promise((resolve, reject) => {
    // Resolve the script path from the project root to ensure it's found
    // regardless of where this module is executed from (e.g., in the .next/server directory).
    const scriptPath = path.resolve(process.cwd(), '../../packages/prompt-model/generate_caption.py');

    // Ensure Python environment is set up to find torch, transformers, etc.
    const pythonProcess = spawn("python", [scriptPath, imagePath]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => (stdout += data.toString()));
    pythonProcess.stderr.on("data", (data) => (stderr += data.toString()));

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Local inference script failed with code ${code}: ${stderr}`);
        return reject(new Error(`Local inference failed: ${stderr}`));
      }
      resolve(stdout.trim());
    });
  });
}