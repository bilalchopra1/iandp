/**
 * Generates a prompt by sending an image file to the backend API.
 * @param {File} imageFile The image file to be processed.
 * @returns {Promise<string>} The generated prompt text.
 * @throws {Error} If the API response is not ok or fails to return a prompt.
 */
export async function generatePromptFromImage(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch("/api/generate-prompt", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate prompt.");
  }

  return data.prompt;
}