import { useState } from "react";
import { useRouter } from "next/router";
import { createServerClient, serialize } from "@supabase/ssr";
import { Card, GradientHeading, GradientButton, DarkButton } from "ui";
import toast from "react-hot-toast";

export default function EditPackPage({ pack, userPrompts, error }) {
  const router = useRouter();
  const [name, setName] = useState(pack?.name || "");
  const [description, setDescription] = useState(pack?.description || "");
  const [selectedPrompts, setSelectedPrompts] = useState(pack?.prompts?.map(p => p.id) || []);
  const [isPublic, setIsPublic] = useState(pack?.is_public || false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (error) {
    return <p className="text-red-500 p-8">{error}</p>;
  }

  const handleTogglePrompt = (promptId) => {
    setSelectedPrompts((prev) =>
      prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/packs/${pack.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          is_public: isPublic,
          prompt_ids: selectedPrompts,
        }),
      });

      if (!response.ok) throw new Error("Failed to update pack.");

      toast.success("Pack updated successfully!");
      router.push(`/packs/${pack.id}`);
    } catch (err) {
      toast.error(err.message);
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this pack? This cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/packs/${pack.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete pack.");
      toast.success("Pack deleted.");
      router.push("/my-packs");
    } catch (err) {
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <GradientHeading className="mb-8">Edit Prompt Pack</GradientHeading>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-1">Pack Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <label htmlFor="is-public" className="font-medium text-neutral-300">Make Pack Public</label>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`${
                  isPublic ? 'bg-purple-600' : 'bg-neutral-700'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                id="is-public"
              >
                <span className="sr-only">Make Pack Public</span>
                <span className={`${isPublic ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Select Prompts</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {userPrompts.map((prompt) => (
              <div key={prompt.id} onClick={() => handleTogglePrompt(prompt.id)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPrompts.includes(prompt.id) ? "bg-purple-500/20" : "hover:bg-neutral-800"}`}>
                <p>{prompt.prompt_text}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-between items-center">
          <DarkButton type="button" onClick={handleDelete} disabled={isSaving || isDeleting} className="!bg-red-500/20 !text-red-400 hover:!bg-red-500/30">
            {isDeleting ? "Deleting..." : "Delete Pack"}
          </DarkButton>
          <GradientButton type="submit" disabled={isSaving || isDeleting}>
            {isSaving ? "Saving..." : "Save Changes"}
          </GradientButton>
        </div>
      </form>
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  // Fetch the pack to edit
  const { data: pack, error: packError } = await supabase.from("prompt_packs").select("*, prompt_pack_items(prompt:prompts(id))").eq("id", id).single();

  // Verify ownership
  if (packError || !pack || pack.created_by !== user.id) {
    return { notFound: true };
  }

  // Fetch all of the user's prompts so they can add/remove them
  const { data: userPrompts, error: promptsError } = await supabase.from("prompts").select("id, prompt_text").eq("user_id", user.id).order("created_at", { ascending: false });

  const formattedPack = { ...pack, prompts: pack.prompt_pack_items.map(p => p.prompt) };

  return { props: { pack: formattedPack, userPrompts: userPrompts || [], error: promptsError?.message || null } };
};