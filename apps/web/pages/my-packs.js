import Link from "next/link";
import { createServerClient, serialize } from "@supabase/ssr";
import { Card, GradientHeading, DarkButton } from "ui";

export default function MyPacksPage({ packs, error }) {
  if (error) {
    return <p className="text-red-500 p-8">{error}</p>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <GradientHeading>My Prompt Packs</GradientHeading>
        <Link href="/create-pack" passHref>
          <DarkButton>Create New Pack</DarkButton>
        </Link>
      </div>
      {packs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => (
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
            You haven&apos;t created any prompt packs yet.
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const { data, error } = await supabase.from("prompt_packs").select("*").eq("created_by", user.id).order("created_at", { ascending: false });

  return { props: { packs: data || [], error: error?.message || null } };
};