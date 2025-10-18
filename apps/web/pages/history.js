import { createServerClient } from "@supabase/ssr";
import { Card, GradientHeading } from "ui";
import { PromptCard } from "../components/PromptCard";
import { useState } from "react";
import Link from "next/link";

export default function HistoryPage({ initialPrompts }) {
  const [prompts, setPrompts] = useState(initialPrompts || []);
  const [loading, setLoading] = useState(!initialPrompts);

  return (
    <div className="flex flex-col items-center justify-center pt-8">
      <GradientHeading className="mb-8 text-center">My Prompt History</GradientHeading>
      
      {loading ? (
        <Card>
          <p>Loading your prompt history...</p>
        </Card>
      ) : prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} isHistoryCard={true} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8 max-w-lg mx-auto">
            <p className="mb-4">
              You haven't generated any prompts yet.
            </p>
            <Link href="/" className="text-sm text-gray-400 hover:text-white">
              Start by uploading an image to generate your first prompt!
            </Link>
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  // Fetch prompts created by the user, along with the associated image data.
  const { data: prompts, error } = await supabase
    .from("prompts")
    .select(`
      *,
      images(*),
      prompt_favorites(user_id)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user history:", error);
    // Don't block the page load, just show an empty list.
  }

  return { props: { initialPrompts: prompts || [] } };
};