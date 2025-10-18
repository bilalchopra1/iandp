import { Card } from "ui";
import Image from "next/image";
import { CopyButton } from "./CopyButton";
import { PromptActions } from "./PromptActions";
import { StarRating } from "./StarRating";

export function PromptCard({ prompt, isHistoryCard = false }) {
  const getPublicUrl = (storagePath) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storagePath}`;
  };

  const imageUrl = isHistoryCard
    ? (prompt.images && prompt.images[0]?.storage_path ? getPublicUrl(prompt.images[0].storage_path) : null)
    : prompt.image_url;

  return (
    <Card
      key={prompt.id}
      className="flex flex-col relative p-0 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1 group"
    >
      {imageUrl && (
        <div className="relative w-full aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={imageUrl}
            alt={prompt.prompt_text.substring(0, 50)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex-grow p-4 flex flex-col justify-between">
        <div>
          <p className="text-neutral-600 dark:text-neutral-300 text-left text-sm leading-relaxed mb-3 h-20 overflow-hidden">
            {prompt.prompt_text}
          </p>
          {prompt.style_tags && prompt.style_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {prompt.style_tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <StarRating
            promptId={prompt.id}
            initialRating={prompt.avg_rating}
            ratingCount={prompt.rating_count}
          />
          <PromptActions
            promptId={prompt.id}
            isInitiallyFavorited={!!prompt.prompt_favorites?.length}
            as="button"
          />
        </div>
      </div>
      <CopyButton textToCopy={prompt.prompt_text} />
    </Card>
  );
}