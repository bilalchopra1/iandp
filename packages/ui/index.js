import React from "react";
import clsx from "clsx";

// A primary gradient button
export const GradientButton = ({ children, className, ...props }) => (
  <button
    className={clsx(
      "bg-ai-gradient text-white px-5 py-3 rounded-xl font-semibold shadow hover:opacity-90 transition",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

// A secondary dark-mode button
export const DarkButton = ({ children, className, ...props }) => (
  <button
    className={clsx(
      "bg-neutral-900 text-white px-5 py-3 rounded-xl font-semibold shadow hover:bg-neutral-800 transition dark:bg-neutral-800 dark:hover:bg-neutral-700",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

// A card container
export const Card = ({ children, className }) => (
  <div
    className={clsx(
      "bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 shadow-md",
      className
    )}
  >
    {children}
  </div>
);

// A gradient heading
export const GradientHeading = ({ children, className }) => (
  <h1
    className={clsx(
      "text-3xl font-bold bg-ai-gradient bg-clip-text text-transparent",
      className
    )}
  >
    {children}
  </h1>
);