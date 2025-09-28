import { createPagesServerClient } from "@supabase/ssr";
import { Layout } from "../components/Layout";
import PromptCard from "../components/PromptCard";

export default function ExplorePage({ prompts, error }) {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-100 mb-8">
          Explore Prompts
        </h1>

        {error && <p className="text-red-500">Error: {error}</p>}

        {prompts && prompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          !error && (
            <p className="text-neutral-400">
              No prompts found. Try running the scraper or generating a new
              prompt!
            </p>
          )
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  console.log("Explore page data:", { data, error });
};