import { createServerClient, serialize } from "@supabase/ssr";
import { Card, GradientHeading, DarkButton, GradientButton } from "ui";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "context/AuthContext";

export default function PacksPage({ publicPacks, myPacks, error }) {
  const [filter, setFilter] = useState("public"); // 'public' or 'my'
  const { user } = useAuth();

  if (error) {
    return <p className="text-red-500 p-8">{error}</p>;
  }

  // Mock data since database operations are disabled
  const mockPublicPacks = [
    {
      id: 1,
      name: "Landscape Photography",
      description: "A collection of prompts for creating stunning landscape images with various lighting conditions and styles.",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Portrait Styles",
      description: "Professional portrait prompts covering different styles from studio to environmental portraits.",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "Digital Art Concepts",
      description: "Creative prompts for digital artwork, concept art, and fantasy illustrations.",
      created_at: new Date().toISOString()
    }
  ];

  const mockMyPacks = [
    {
      id: 4,
      name: "My Personal Collection",
      description: "A curated collection of my favorite prompts for various creative projects.",
      created_at: new Date().toISOString()
    }
  ];

  const displayPublicPacks = publicPacks.length > 0 ? publicPacks : mockPublicPacks;
  const displayMyPacks = myPacks.length > 0 ? myPacks : mockMyPacks;
  const packsToShow = filter === "public" ? displayPublicPacks : displayMyPacks;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <GradientHeading>Prompt Packs</GradientHeading>
        <div className="flex gap-4">
          <DarkButton
            onClick={() => setFilter("public")}
            className={filter === "public" ? "!bg-purple-600" : ""}
          >
            Public Packs
          </DarkButton>
          <DarkButton
            onClick={() => setFilter("my")}
            className={filter === "my" ? "!bg-purple-600" : ""}
          >
            My Packs
          </DarkButton>
          {user && filter === 'my' && (
            <Link href="/create-pack" passHref>
              <GradientButton>Create New Pack</GradientButton>
            </Link>
          )}
        </div>
      </div>
      
      {(publicPacks.length === 0 || myPacks.length === 0) && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            📦 Showing sample prompt packs for demonstration. In a live version, these would be real community collections!
          </p>
        </div>
      )}
      {packsToShow.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packsToShow.map((pack) => (
            <Link key={pack.id} href={`/packs/${pack.id}`} passHref>
              <Card as="a" className="cursor-pointer hover:border-purple-400/50 transition-colors">
                <h3 className="text-xl font-semibold mb-2">{pack.name}</h3>
                <p className="text-neutral-400 line-clamp-2">{pack.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-neutral-500">
            {filter === "public"
              ? "No public prompt packs have been created yet."
              : "You haven't created any prompt packs yet."}
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

  const { data: publicPacks, error: publicError } = await supabase.from("prompt_packs").select("*").eq("is_public", true).order("created_at", { ascending: false });

  let myPacks = [];
  let myError = null;
  if (user) {
    const { data, error } = await supabase.from("prompt_packs").select("*").eq("created_by", user.id).order("created_at", { ascending: false });
    myPacks = data;
    myError = error;
  }

  return { props: { publicPacks: publicPacks || [], myPacks: myPacks || [], error: publicError?.message || myError?.message || null } };
};
