import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import clsx from "clsx";

export function FilterControls({ onSortChange, onTagFilterChange, availableTags, activeTags }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <select
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="newest">Sort by: Newest</option>
          <option value="rating">Sort by: Top Rated</option>
        </select>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300">
          <SlidersHorizontal size={20} />
          <span>Filters</span>
        </button>
      </div>
      {showFilters && (
        <div className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <h4 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Filter by Tags</h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagFilterChange(tag)}
                className={clsx("px-3 py-1 text-sm rounded-full transition-colors", {
                  "bg-purple-500 text-white": activeTags.includes(tag),
                  "bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600": !activeTags.includes(tag),
                })}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}