import { useState } from "react";
import { createServerClient, serialize } from "@supabase/ssr";
import { Card, GradientHeading } from "ui"; 
import { CopyButton } from "../../components/CopyButton";

export default function PackDetailsPage({ pack, error }) {
  const [prompts, setPrompts] = useState(pack?.prompts || []);

  if (error) {
    return <p className="text-red-500 p-8">{error}</p>;
  }

  if (!pack) {
    return (
      <div className="text-center">
        <GradientHeading>Pack not found</GradientHeading>
        <p className="text-neutral-500">This prompt pack could not be found.</p>
      </div>
    );
  }

  const handleRatingUpdate = (updatedPrompt) => {
    setPrompts((currentList) =>
      currentList.map((p) => (p.id === updatedPrompt.id ? { ...p, ...updatedPrompt } : p))
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <GradientHeading>{pack.name}</GradientHeading>
        {pack.description && (
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            {pack.description}
          </p>
        )}
      </div>

      {prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <div className="relative">
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
          <p className="text-center text-neutral-500">This prompt pack is empty.</p>
        </Card>
      )}
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  const { id } = ctx.params;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pack, error } = await supabase
    .from("prompt_packs")
    .select("*, prompts:prompt_pack_items(prompt:prompts(*, prompt_favorites(user_id)))") // Fetch favorites for the logged-in user
    .eq("id", id)
    .single();

  // The query returns prompts nested inside prompt_pack_items, so we flatten it.
  // We also add an `is_favorited` flag to each prompt.
  const formattedPack = pack
    ? {
        ...pack,
        prompts: pack.prompts.map((p) => ({
          ...p.prompt,
          is_favorited: user ? p.prompt.prompt_favorites.some(fav => fav.user_id === user.id) : false,
        })),
      }
    : null;

  return { props: { pack: formattedPack, error: error?.message || null } };
};