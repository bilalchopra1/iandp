"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export const ThemeAwareLogo = ({ width, height, className }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or default to avoid layout shift and hydration errors.
    return <div style={{ width, height }} className={className} />;
  }

  const src = resolvedTheme === 'dark' ? '/logo-for-dark-theme.svg' : '/logo-for-light-theme.svg';

  return <Image src={src} alt="Logo" width={width} height={height} className={className} />;
};