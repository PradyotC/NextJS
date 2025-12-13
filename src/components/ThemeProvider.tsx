// components/ThemeProvider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';

const themeList = ['light', 'dark', 'system'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider 
            attribute="data-theme" // Target the data-theme attribute used by DaisyUI
            defaultTheme="dark"    
            enableSystem           // Ensures the media query is checked
            themes={themeList}     
            
            // FIX: Prevents layout flashes during theme change, which can sometimes interfere
            // with the initial reading of the system setting on the client.
            disableTransitionOnChange 
        >
            {children}
        </NextThemesProvider>
    );
}