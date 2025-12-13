// components/ThemeHtmlWrapper.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function ThemeHtmlWrapper() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // This hook is primarily to ensure this component only runs on the client.
    // next-themes handles most of the logic, but sometimes a small wrapper is needed
    // to force hydration in the correct order.
    // The attributes applied by next-themes itself are the key.
    
    // Safety check: ensure the theme is reflected on the root element
    if (resolvedTheme) {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    }
  }, [resolvedTheme]);

  // This component doesn't need to render anything itself.
  return null;
}