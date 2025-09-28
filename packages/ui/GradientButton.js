import React from "react";

export const GradientButton = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="px-6 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
    >
      {children}
    </button>
  );
};