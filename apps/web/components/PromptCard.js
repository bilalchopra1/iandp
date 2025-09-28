import { Card } from "ui"; // Assuming a generic Card from our shared UI package
import { StarIcon } from "@heroicons/react/20/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PromptCard({ prompt }) {
  if (!prompt) {
    return null;
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="flex-grow p-6">
        <p className="text-neutral-400 text-sm">
          Source: {prompt.source || "N/A"}
        </p>
        <p className="mt-2 text-neutral-100 leading-relaxed">
          {prompt.prompt_text}
        </p>
      </div>

      {prompt.style_tags && prompt.style_tags.length > 0 && (
        <div className="px-6 pt-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {prompt.style_tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-neutral-800 rounded-full px-3 py-1 text-xs font-semibold text-neutral-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 pt-4 border-t border-neutral-800 flex justify-between items-center">
        <div className="flex items-center">
          {[0, 1, 2, 3, 4].map((rating) => (
            <StarIcon
              key={rating}
              className={classNames(
                prompt.avg_rating > rating
                  ? "text-yellow-400"
                  : "text-neutral-600",
                "h-5 w-5 flex-shrink-0"
              )}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-xs text-neutral-500">
          {prompt.rating_count > 0
            ? `${prompt.rating_count} review${prompt.rating_count > 1 ? "s" : ""}`
            : "No reviews yet"}
        </p>
      </div>
    </Card>
  );
}