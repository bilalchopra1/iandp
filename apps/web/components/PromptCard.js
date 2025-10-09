import { Card } from "ui";
import Image from "next/image";
import { CopyButton } from "./CopyButton";
import { PromptActions } from "./PromptActions";
import { StarRating } from "./StarRating";

export function PromptCard({ prompt, onRating, isHistoryCard = false }) {
  const getPublicUrl = (storagePath) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storagePath}`;
  };

  return (
    <Card
      key={prompt.id}
      className="flex flex-col relative p-0 transition-all hover:scale-[1.02] hover:shadow-lg"
    >
      {isHistoryCard && prompt.images[0]?.storage_path && (
        <Image
          src={getPublicUrl(prompt.images[0].storage_path)}
          alt="Generated prompt image"
          width={400}
          height={400}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      )}
      <div className="flex-grow p-4 flex flex-col justify-between">
        <p className="text-neutral-700 dark:text-neutral-300 text-left pr-10 mb-2">
          {prompt.prompt_text}
        </p>
        <div className="flex items-center justify-between">
          <StarRating
            promptId={prompt.id}
            initialRating={prompt.avg_rating}
            ratingCount={prompt.rating_count}
            onRate={onRating}
          />
        </div>
        {prompt.style_tags && prompt.style_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {prompt.style_tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-xs rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <CopyButton textToCopy={prompt.prompt_text} />
      <PromptActions promptId={prompt.id} isInitiallyFavorited={!!prompt.prompt_favorites?.length} />
    </Card>
  );
}