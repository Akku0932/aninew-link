'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps,
} from 'next-themes'

// Create a context for theme updates
export const ThemeContext = React.createContext<{
  theme: string | undefined;
  setTheme: (theme: string) => void;
}>({
  theme: undefined,
  setTheme: () => {},
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mountedTheme, setMountedTheme] = React.useState<string | undefined>(undefined);
  
  // Listen for theme change events
  React.useEffect(() => {
    const handleThemeChange = (event: CustomEvent<string>) => {
      setMountedTheme(event.detail);
    };
    
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);
  
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}

// Custom hook to use theme with event listening
export function useTheme() {
  const context = useNextTheme();
  
  React.useEffect(() => {
    const handleThemeChange = (event: CustomEvent<string>) => {
      if (context.setTheme) {
        context.setTheme(event.detail);
      }
    };
    
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, [context]);
  
  return context;
}
