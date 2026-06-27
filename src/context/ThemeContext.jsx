import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { STUDIO_THEMES } from '../utils/studioThemes';
import { extractThemeColors, generateThemeStyleString, DEFAULT_PALETTE_RGB } from '../utils/themeEngine';

const ThemeContext = createContext({
  studioTheme: 'default',
  setStudioTheme: () => {},
  isDarkGlobal: true, // We'll assume true since it's mainly for dark mode
  themeStyles: {}
});

export function ThemeProvider({ children }) {
  const [studioThemeState, setStudioThemeState] = useState(() => {
    return localStorage.getItem('studio_theme') || 'default';
  });

  const setStudioTheme = (newTheme) => {
    setStudioThemeState(newTheme);
    localStorage.setItem('studio_theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('oc-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('oc-theme', 'dark');
    }
  };

  const studioTheme = studioThemeState;
  
  const [isDarkGlobal, setIsDarkGlobal] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkGlobal(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem('studio_theme', studioTheme);
    
    // Check if we need to apply custom CSS variables
    const themeDef = STUDIO_THEMES[studioTheme];
    
    // Generate .dark scoped variables
    if (themeDef) {
      const customColors = extractThemeColors(themeDef);
      const cssString = generateThemeStyleString(customColors);
      
      let styleEl = document.getElementById('oc-dynamic-theme-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'oc-dynamic-theme-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = cssString;
    } else {
      // Revert to defaults
      const customColors = {
        slate: DEFAULT_PALETTE_RGB.slate,
        sky: DEFAULT_PALETTE_RGB.sky,
        brand: DEFAULT_PALETTE_RGB.brand
      };
      const cssString = generateThemeStyleString(customColors);
      
      let styleEl = document.getElementById('oc-dynamic-theme-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'oc-dynamic-theme-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = cssString;
    }
  }, [studioTheme, isDarkGlobal]);

  // Derived theme styles for components that explicitly ask for it (like MarkdownHub)
  const themeStyles = useMemo(() => {
    const t = STUDIO_THEMES[studioTheme] || STUDIO_THEMES.default;
    if (t.dynamic) {
      return {
        ui: isDarkGlobal ? t.uiDark : t.uiLight,
        md: isDarkGlobal ? t.mdDark : t.mdLight,
        monaco: isDarkGlobal ? t.monacoDark : t.monacoLight,
        isDark: isDarkGlobal
      };
    } else {
      return {
        ui: t.uiDark,
        md: t.mdDark,
        monaco: t.monacoDark,
        isDark: true
      };
    }
  }, [studioTheme, isDarkGlobal]);

  return (
    <ThemeContext.Provider value={{ studioTheme, setStudioTheme, isDarkGlobal, themeStyles }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useGlobalTheme() {
  return useContext(ThemeContext);
}
