import { useState, useRef } from "react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { GradientButton, Card, GradientHeading, DarkButton } from "ui";
import { CopyButton } from "../components/CopyButton";
import { LoaderCircle, Wand2, Image as ImageIcon, BookOpen } from "lucide-react";
import { useAuth } from "context/AuthContext";
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { user, supabaseClient, isLoading: isAuthLoading } = useAuth();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !user) return;

    setIsLoading(true);
    setError(null);
    setPrompt("");

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('uploads')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Create FormData to send the image file.
      // This allows the browser to set the correct Content-Type header with boundary.
      const formData = new FormData();
      formData.append("image", image);

      // 3. Call API with the image data and metadata in headers
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "X-File-Path": filePath,
          "X-Original-Filename": encodeURIComponent(image.name),
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const err = new Error(result.error || "An unknown error occurred.");
        err.status = response.status;
        throw err;
      }

      const generatedPrompt = result.prompt;
      setPrompt(generatedPrompt);
    } catch (err) {
      let errorMessage = err.message || "An unexpected error occurred.";
      if (err.status === 429) {
        errorMessage = "You've exceeded your generation limit. Please try again later.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // If auth is still loading, don't render anything yet to prevent flashes
  if (isAuthLoading) return null;

  if (!user) { // Now we know for sure the user is not logged in
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <GradientHeading className="mb-8 !text-4xl sm:!text-5xl md:!text-6xl py-4">
            Unlock the Prompts <br className="md:hidden" /> Behind Any Image
          </GradientHeading>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Discover the magic behind AI-generated art. Upload an image and let our AI reveal the exact prompt used to create it. Join our community and explore a universe of creativity.
          </p>
          <div className="flex justify-center gap-5">
            <GradientButton asChild>
              <Link href="/login">Login / Sign Up</Link>
            </GradientButton>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in, show the main application
  return (
    <div className="flex flex-col items-center justify-center pt-8">
      <Head>
        <title>Image to Prompt AI</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <div className="text-center w-full max-w-3xl mb-16">
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
                <GradientHeading className="mb-2 !text-3xl">
                  Find the prompt.
                </GradientHeading>
                <p className="mb-6">
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
                <div className="relative w-full h-72 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Selected preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex gap-4">
                  <DarkButton type="button" onClick={() => fileInputRef.current.click()}>
                    Change Image
                  </DarkButton>
                  <GradientButton type="submit" disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Prompt"}
                  </GradientButton>
                </div>
              </div>
            )}
          </form>
        </Card>

        {isLoading && (
          <div className="mt-6 flex justify-center items-center gap-2 text-neutral-600 dark:text-neutral-500">
            <LoaderCircle className="animate-spin" />
            <span>Analyzing image...</span>
          </div>
        )}

        {error && <p className="mt-4 text-red-500">{error}</p>}

        {prompt && (
          <div className="mt-6 w-full">
            <Card className="text-left">
              <div className="relative">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Generated Prompt
                </h3>
                <p className="pr-10 leading-relaxed" data-testid="prompt-output">
                  {prompt.prompt_text}
                </p>
                <CopyButton textToCopy={prompt.prompt_text} />
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
            </div>
          </div>
        )}
      </div>

      {/* Feature Sections */}
      <div className="w-full max-w-5xl mx-auto text-center mt-16">
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-4">A Complete Suite of Tools</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto">From inspiration to creation, we&apos;ve got you covered at every step of your AI art journey.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-left !p-6">
            <ImageIcon className="w-8 h-8 mb-4 bg-ai-gradient bg-clip-text text-transparent" />
            <h3 className="font-semibold text-lg text-neutral-800 dark:text-white mb-2">Image to Prompt</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Transform any image into a detailed, descriptive prompt to understand its essence.</p>
          </Card>
          <Card className="text-left !p-6">
            <Wand2 className="w-8 h-8 mb-4 bg-ai-gradient bg-clip-text text-transparent" />
            <h3 className="font-semibold text-lg text-neutral-800 dark:text-white mb-2">Community Library</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Explore thousands of prompts and images scraped from across the web for endless inspiration.</p>
          </Card>
          <Card className="text-left !p-6">
            <BookOpen className="w-8 h-8 mb-4 bg-ai-gradient bg-clip-text text-transparent" />
            <h3 className="font-semibold text-lg text-neutral-800 dark:text-white mb-2">Prompt Packs</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Curate and share your favorite prompts in themed collections. (Coming Soon)</p>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full max-w-3xl mx-auto mt-24">
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-white">How does the Image-to-Prompt feature work?</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
              Our system uses a sophisticated AI model (a local version of Salesforce BLIP) to analyze the visual content of your uploaded image. It identifies subjects, styles, composition, and other details to generate a descriptive text prompt that could have been used to create a similar image.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-white">Is it free to use?</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
              Yes! Our core features are available for free. Free users get 10 prompt generations per hour. For unlimited generations and access to future premium features, you can upgrade to our Pro plan from your account page.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-white">Where does the &quot;Explore&quot; page content come from?</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
              The Explore page is populated by our automated scraping pipeline. It runs daily, collecting public prompts and images from popular AI art communities like Lexica, Civitai, Reddit, and more, giving you a constant stream of fresh inspiration.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-white">Do you store my uploaded images?</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
              Yes, when you generate a prompt, we save the image to your private history so you can review it later. Your uploaded images are secured by Supabase&apos;s storage and are only accessible by you through your account. They are not shared publicly.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}