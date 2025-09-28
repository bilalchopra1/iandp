# API Specification

This document outlines the API endpoints for the images&prompts application.

## `POST /api/generate-prompt`

Generates a text prompt from an uploaded image by calling the Hugging Face CLIP Interrogator model.

### Request

-   **Method**: `POST`
-   **Content-Type**: `multipart/form-data`

#### Body

| Field   | Type   | Description                  | Required |
| ------- | ------ | ---------------------------- | -------- |
| `image` | `File` | The image file to be analyzed. | Yes      |

#### Example cURL Request

```bash
curl -X POST http://localhost:3000/api/generate-prompt \
  -F "image=@/path/to/your/image.png"
```

### Responses

#### ✅ 200 OK - Success

Returns the generated prompt.

-   **Content-Type**: `application/json`

```json
{
  "prompt": "a detailed, photorealistic painting of a cat wearing a small hat, sitting on a wooden table in a sunlit room, artstation"
}
```

#### ❌ 400 Bad Request

Returned if no image file is provided in the request.

-   **Content-Type**: `application/json`

```json
{
  "error": "No image file provided."
}
```

#### ❌ 500 Internal Server Error

Returned if the backend fails to process the image or communicate with the Hugging Face API.

-   **Content-Type**: `application/json`

```json
{
  "error": "Failed to generate prompt."
}
```