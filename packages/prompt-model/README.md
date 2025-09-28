# Prompt Model Package

This package is a dedicated wrapper for interacting with the Hugging Face Inference API. Its purpose is to abstract the logic of generating a text prompt from an image.

## Core Function

`getPromptFromImage(image)`

-   Accepts an image (as a file or buffer).
-   Sends the image data to the `salesforce/blip-image-captioning-large` (or similar) model on Hugging Face.
-   Parses the response and returns the generated prompt as a string.

## Usage

This package is intended to be used by the backend API route (`apps/web/pages/api/generate-prompt.js`).

```javascript
import { getPromptFromImage } from 'prompt-model';

// Inside an API route handler...
const imageFile = ... // Get image from request
const prompt = await getPromptFromImage(imageFile);
```