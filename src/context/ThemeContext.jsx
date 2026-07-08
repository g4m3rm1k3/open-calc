import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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

  const setStudioTheme = useCallback((newTheme) => {
    setStudioThemeState(newTheme);
    localStorage.setItem('studio_theme', newTheme);
    const themeDef = STUDIO_THEMES[newTheme];
    if (newTheme === 'light' || themeDef?.forceLight) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('oc-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('oc-theme', 'dark');
    }
  }, []);

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
      // forceLight themes remove the 'dark' class, so CSS vars must target :root
      const cssString = generateThemeStyleString(customColors, !!themeDef.forceLight);
      
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
      // forceLight themes (e.g. vue-light) store their light-mode classes
      // under the same uiDark/mdDark keys non-dynamic themes conventionally
      // use (there's only ever one variant for a non-dynamic theme), so the
      // fallback here is intentional, not a typo — only monaco has a real
      // separate monacoLight to prefer. Previously this branch always read
      // monacoDark/isDark:true unconditionally, which silently broke
      // vue-light specifically: monacoDark didn't exist on it at all.
      const isDark = !t.forceLight;
      return {
        ui: t.uiDark,
        md: t.mdDark,
        monaco: (isDark ? t.monacoDark : t.monacoLight) ?? t.monacoDark ?? t.monacoLight,
        isDark
      };
    }
  }, [studioTheme, isDarkGlobal]);

  const value = useMemo(
    () => ({ studioTheme, setStudioTheme, isDarkGlobal, themeStyles }),
    [studioTheme, setStudioTheme, isDarkGlobal, themeStyles]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useGlobalTheme() {
  return useContext(ThemeContext);
}
