import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { GradientButton, Card, GradientHeading } from "ui";
import { CopyButton } from "../components/CopyButton";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "context/AuthContext";

export default function Home() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrompt("");
      setError(null);
    } else {
      setImage(null);
      setPreviewUrl("");
    }
  };

  const generatePromptFromImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("/api/generate-prompt", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate prompt.");
    }

    const data = await response.json();
    return data.prompt;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    setIsLoading(true);
    setError(null);
    setPrompt("");

    try {
      const generatedPrompt = await generatePromptFromImage(image);
      setPrompt(generatedPrompt);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not logged in, show a login prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-center w-full max-w-lg">
          <Image
            src="/logo.svg"
            alt="AI Prompt Finder Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <GradientHeading className="mb-4">
            Unlock the Prompts Behind Any Image
          </GradientHeading>
          <Card>
            <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
              Welcome! Please log in to start generating prompts.
            </p>
            <Link href="/login" passHref>
              <GradientButton>Login / Sign Up</GradientButton>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // If user is logged in, show the main application
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center w-full max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />

            {!previewUrl && (
              <>
                <GradientHeading className="mb-4 !text-3xl">
                  Find the prompt.
                </GradientHeading>
                <p className="mb-6 text-neutral-400">
                  Upload an AI-generated image and get the prompt.
                </p>
                <GradientButton
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                >
                  Upload Image
                </GradientButton>
              </>
            )}

            {previewUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full h-64">
                  <Image
                    src={previewUrl}
                    alt="Selected preview"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg shadow-md"
                  />
                </div>
                <GradientButton type="submit" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Prompt"}
                </GradientButton>
              </div>
            )}
          </form>
        </Card>

        {isLoading && (
          <div className="mt-6 flex justify-center items-center gap-2 text-neutral-500">
            <LoaderCircle className="animate-spin" />
            <span>Analyzing image...</span>
          </div>
        )}

        {error && <p className="mt-4 text-red-500">{error}</p>}

        {prompt && (
          <div className="mt-6 w-full">
            <Card>
              <div className="relative">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Generated Prompt
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 pr-10">
                  {prompt}
                </p>
                <CopyButton textToCopy={prompt} />
              </div>
            </Card>
            
            {/* Navigation buttons after prompt generation */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <GradientButton
                onClick={() => {
                  setImage(null);
                  setPreviewUrl("");
                  setPrompt("");
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="w-full sm:w-auto"
              >
                Upload Another Image
              </GradientButton>
              <GradientButton
                onClick={() => {
                  setImage(null);
                  setPreviewUrl("");
                  setPrompt("");
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  // Scroll to top to show the upload form
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto"
              >
                Generate New Prompt
              </GradientButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}