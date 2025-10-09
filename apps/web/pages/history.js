import { createServerClient, serialize } from "@supabase/ssr";
import { Card, GradientHeading } from "ui";
import { CopyButton } from "../components/CopyButton";
import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";

export default function HistoryPage({ initialPrompts }) {
  const [prompts, setPrompts] = useState(initialPrompts || []);
  const [loading, setLoading] = useState(false);
  const { user, supabaseClient } = useAuth();

  const fetchUserPrompts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Since database operations are disabled for testing, show mock data
      const mockPrompts = [
        {
          id: 1,
          prompt_text: "a cinematic shot of a beautiful landscape with dramatic lighting, photorealistic, 4k",
          image_url: null,
          created_at: new Date().toISOString(),
          tags: ["photorealistic", "4k", "cinematic", "landscape"]
        },
        {
          id: 2,
          prompt_text: "a well-crafted visual with great attention to detail and artistic merit",
          image_url: null,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          tags: ["artistic", "detailed"]
        },
        {
          id: 3,
          prompt_text: "a futuristic sci-fi scene with neon lighting and cyberpunk atmosphere, 8k resolution",
          image_url: null,
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          tags: ["sci-fi", "cyberpunk", "8k"]
        }
      ];
      setPrompts(mockPrompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPrompts();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <GradientHeading className="mb-8">My Prompt History</GradientHeading>
      
      {loading ? (
        <Card>
          <p className="text-center text-neutral-500">Loading your prompt history...</p>
        </Card>
      ) : prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <div className="relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-neutral-500">
                    {formatDate(prompt.created_at)}
                  </span>
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.slice(0, 2).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 pr-10">
                  {prompt.prompt_text}
                </p>
                <CopyButton textToCopy={prompt.prompt_text} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">
              You haven't generated any prompts yet.
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Start by uploading an image on the home page to generate your first prompt!
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: {} };
};