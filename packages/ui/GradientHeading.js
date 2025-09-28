import React from "react";

export const GradientHeading = ({ children, className = "" }) => {
  return (
    <h1 className={`text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 ${className}`}>
      {children}
    </h1>
  );
};