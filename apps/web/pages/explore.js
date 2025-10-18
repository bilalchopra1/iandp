import { createServerClient } from "@supabase/ssr";
import { Card, GradientHeading } from "ui";
import { PromptCard } from "../components/PromptCard";
import { useState } from "react";

export default function ExplorePage({ initialPrompts }) {
  const [prompts, setPrompts] = useState(initialPrompts || []);
  const [loading, setLoading] = useState(false);

  // In a future step, we could add client-side pagination or infinite scroll here.
  // For now, we rely on the server-side props for the initial data.

  return (
    <div className="flex flex-col items-center justify-center pt-8">
      <GradientHeading className="mb-8 text-center">Explore Prompts</GradientHeading>
      <p className="text-center mb-8">
        Discover prompts from the community and our automated scrapers.
      </p>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <Card className="max-w-lg">
          <p className="text-center text-neutral-500">
            No prompts found. The scrapers might not have run yet.
          </p>
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
        get: (name) => ctx.req.cookies[name],
        set: (name, value, options) => {
          ctx.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
        },
        remove: (name, options) => {
          ctx.res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
        },
      },
    }
  );

  const { data: prompts, error } = await supabase
    .from("prompts")
    .select(`*, prompt_favorites(user_id)`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching explore prompts:", error);
  }

  return {
    props: {
      initialPrompts: prompts || [],
    },
  };
};