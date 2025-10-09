import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

export function StarRating({ promptId, initialRating, ratingCount, onRate }) {
  const [rating, setRating] = useState(Math.round(initialRating));
  const [hover, setHover] = useState(0);

  const handleRating = async (newRating) => {
    try {
      const response = await fetch("/api/rate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt_id: promptId, rating: newRating }),
      });

      if (!response.ok) throw new Error("Failed to submit rating.");

      const { prompt: updatedPrompt } = await response.json();
      setRating(Math.round(updatedPrompt.avg_rating));
      onRate(updatedPrompt); // Notify parent of the update
      toast.success("Thanks for your rating!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={starValue}
              onClick={() => handleRating(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
              className="p-0 bg-transparent border-none"
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  starValue <= (hover || rating) ? "text-yellow-400 fill-current" : "text-neutral-600"
                }`}
              />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500">({ratingCount})</p>
    </div>
  );
}