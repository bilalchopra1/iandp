import React from "react";

export const DarkButton = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="px-5 py-2 rounded-md font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
    >
      {children}
    </button>
  );
};