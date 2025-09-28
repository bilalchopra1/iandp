import React from "react";

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
};