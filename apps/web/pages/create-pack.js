import { useState } from "react";
import { useRouter } from "next/router";
import { createServerClient, serialize } from "@supabase/ssr";
import { useAuth } from "context/AuthContext";
import { Card, GradientHeading, GradientButton } from "ui";
import toast from "react-hot-toast";

export default function CreatePackPage() {
  const { user, supabaseClient } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreatePack = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Pack name is required.");
      return;
    }
    setLoading(true);

    const { error } = await supabaseClient
      .from("prompt_packs")
      .insert({ name, description, created_by: user.id });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Prompt pack created successfully!");
      router.push("/my-packs");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <GradientHeading className="mb-8">Create New Prompt Pack</GradientHeading>
      <Card>
        <form onSubmit={handleCreatePack} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-2">
              Pack Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-400 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <GradientButton type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Creating..." : "Create Pack"}
          </GradientButton>
        </form>
      </Card>
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