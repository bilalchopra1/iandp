import { createPagesServerClient } from "@supabase/ssr";
import { Card, GradientHeading } from "ui";
import { CopyButton } from "../components/CopyButton";
import { PromptActions } from "../components/PromptActions";
import { Toaster } from "react-hot-toast";

export default function HistoryPage({ history, error }) {
  if (error) {
    return <p className="text-red-500 p-8">{error}</p>;
  }

  const getPublicUrl = (storagePath) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storagePath}`;
  };

  return (
    <div>
      <Toaster position="bottom-center" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <GradientHeading>My History</GradientHeading>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
            All the prompts you've generated.
          </p>
        </div>

        {history.length === 0 ? (
          <Card className="text-center">
            <p className="text-neutral-700 dark:text-neutral-300">
              You haven't generated any prompts yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {history.map((item) => (
              <Card key={item.id} className="flex flex-col relative p-0">
                {item.images[0]?.storage_path && (
                  <img
                    src={getPublicUrl(item.images[0].storage_path)}
                    alt="Generated prompt image"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="flex-grow p-4">
                  <p className="text-neutral-700 dark:text-neutral-300 text-left pr-10">
                    {item.prompt_text}
                  </p>
                </div>
                <div className="absolute bottom-2 right-2">
                   <CopyButton textToCopy={item.prompt_text} />
                </div>
                <PromptActions promptId={item.id} isInitiallyFavorited={item.is_favorited} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const { data, error } = await supabase
    .from("prompts")
    .select("*, images(storage_path), prompt_favorites(user_id)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  console.log("History page data:", { data, error });

  return { props: { history: processedHistory, error: error?.message || null } };
};