import { useState } from "react";
import { Search } from "lucide-react";
import { DarkButton } from "ui";

export function SearchBar({ onSearch, initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for prompts..."
        className="flex-grow px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <DarkButton type="submit" className="!p-2.5">
        <Search size={20} />
      </DarkButton>
    </form>
  );
}