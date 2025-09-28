import { useState } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

export function PromptActions({ promptId, isInitiallyFavorited }) {
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      });

      if (!response.ok) throw new Error("Failed to update favorite status.");

      const { favorited } = await response.json();
      setIsFavorited(favorited);
      toast.success(favorited ? "Added to favorites!" : "Removed from favorites.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-2 right-2">
      <button
        onClick={handleFavorite}
        disabled={isLoading}
        className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        <Heart className={`w-5 h-5 ${isFavorited ? "text-red-500 fill-current" : "text-neutral-500"}`} />
      </button>
    </div>
  );
}