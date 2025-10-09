import { createServerClient, serialize } from "@supabase/ssr";
import { Card, GradientHeading } from "ui";
import { CopyButton } from "../components/CopyButton";

export default function ExplorePage({ prompts, error }) {
  // Since database operations are disabled, show mock data
  const mockPrompts = [
    {
      id: 1,
      prompt_text: "a cinematic shot of a beautiful landscape with dramatic lighting, photorealistic, 4k",
      tags: ["photorealistic", "4k", "cinematic", "landscape"]
    },
    {
      id: 2,
      prompt_text: "a detailed portrait with soft lighting, professional photography, high resolution",
      tags: ["portrait", "professional", "high-resolution"]
    },
    {
      id: 3,
      prompt_text: "a modern architectural design with clean lines and natural lighting, minimalist style",
      tags: ["architecture", "minimalist", "modern"]
    },
    {
      id: 4,
      prompt_text: "a vibrant still life composition with rich colors and artistic lighting, studio quality",
      tags: ["still-life", "vibrant", "studio-quality"]
    },
    {
      id: 5,
      prompt_text: "a surreal digital artwork with fantastical elements, highly detailed, trending on artstation",
      tags: ["surreal", "digital-art", "fantasy"]
    },
    {
      id: 6,
      prompt_text: "a vintage film photograph with warm tones and film grain, nostalgic aesthetic",
      tags: ["vintage", "film", "nostalgic"]
    },
    {
      id: 7,
      prompt_text: "a futuristic sci-fi scene with neon lighting and cyberpunk atmosphere, 8k resolution",
      tags: ["sci-fi", "cyberpunk", "8k"]
    },
    {
      id: 8,
      prompt_text: "a well-crafted visual with great attention to detail and artistic merit",
      tags: ["artistic", "detailed", "crafted"]
    },
    {
      id: 9,
      prompt_text: "a professional-quality image with excellent composition and visual appeal",
      tags: ["professional", "composition", "visual-appeal"]
    }
  ];

  if (error) {
    return <p className="text-red-500 p-8">{error}</p>;
  }

  const displayPrompts = prompts.length > 0 ? prompts : mockPrompts;

  return (
    <div className="max-w-7xl mx-auto">
      <GradientHeading className="mb-8">Explore Prompts</GradientHeading>
      {displayPrompts.length > 0 ? (
        <>
          {prompts.length === 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                🎨 Showing sample prompts for demonstration. In a live version, these would be community-generated prompts!
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPrompts.map((prompt) => (
              <Card key={prompt.id}>
                <div className="relative">
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {prompt.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-neutral-700 dark:text-neutral-300 pr-10">
                    {prompt.prompt_text}
                  </p>
                  <CopyButton textToCopy={prompt.prompt_text} />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">
              No prompts to explore yet.
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Be the first to generate and share prompts with the community!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => {
          return ctx.req.cookies[name];
        },
        set: (name, value, options) => {
          const cookie = serialize(name, value, options);
          let header = ctx.res.getHeader('Set-Cookie') || [];
          if (!Array.isArray(header)) header = [String(header)];
          ctx.res.setHeader('Set-Cookie', [...header, cookie]);
        },
        remove: (name, options) => {
          const cookie = serialize(name, '', { ...options, maxAge: -1 });
          let header = ctx.res.getHeader('Set-Cookie') || [];
          if (!Array.isArray(header)) header = [String(header)];
          ctx.res.setHeader('Set-Cookie', [...header, cookie]);
        },
      },
    }
  );
  const { data, error } = await supabase.from("prompts").select("*").limit(50).order("created_at", { ascending: false });

  return { props: { prompts: data || [], error: error?.message || null } };
};