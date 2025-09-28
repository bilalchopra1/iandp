import { useState } from "react";
import { Copy, Check } from "lucide-react";
import clsx from "clsx";

export const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const Icon = copied ? Check : Copy;

  return (
    <button
      onClick={handleCopy}
      className={clsx("absolute top-0 right-0 p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition", { "text-green-500": copied })}
      aria-label="Copy prompt"
    >
      <Icon size={18} />
    </button>
  );
};