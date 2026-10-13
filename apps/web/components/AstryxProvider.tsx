'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '@astryxdesign/core';
import { themes, defaultThemeSlug } from '../astryx-themes';
import { ThemeMode } from '../lib/types';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'sepia',
  setTheme: () => {},
});

export const useReaderTheme = () => useContext(ThemeContext);

export function AstryxProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('sepia');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('er_theme') as ThemeMode;
      const initialTheme: ThemeMode =
        saved === 'light' || saved === 'sepia' || saved === 'dark' ? saved : 'sepia';
      setThemeState(initialTheme);
      applyThemeToDOM(initialTheme);
    }
  }, []);

  const applyThemeToDOM = (t: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', t);
    root.classList.toggle('dark', t === 'dark');
    root.style.colorScheme = t === 'dark' ? 'dark' : 'light';
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('er_theme', newTheme);
      } catch (e) {}
    }
    applyThemeToDOM(newTheme);
  };

  const astryxMode = theme === 'dark' ? 'dark' : 'light';

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Theme theme={themes[defaultThemeSlug]} mode={astryxMode}>
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
}
