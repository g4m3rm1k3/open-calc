import type { ReactNode } from 'react'
import { useGlobalTheme } from '../../../context/ThemeContext.jsx'
import { getCodeLensTheme, type CodeLensTheme } from './theme'

// CodeLens's theme picker now controls the app's real GLOBAL studio theme
// (useGlobalTheme/setStudioTheme from src/context/ThemeContext.jsx) instead
// of maintaining its own separate, siloed theme id + localStorage key.
// Previously CodeLens had its own independent 6-theme picker completely
// disconnected from the app-wide theme selector — switching theme in
// CodeLens didn't match the rest of the app (and themes set elsewhere in the
// app, like GitHub or Catppuccin, weren't reachable from CodeLens at all).
// This file is now just a thin adapter: it reads/writes the SAME global
// `studioTheme` and maps it to CodeLens's richer UI palette (theme.ts),
// which the global context doesn't provide on its own (its `uiDark`/`uiLight`
// are Tailwind class-name strings, not raw color values usable in the inline
// styles/SVG fills CodeLens's panels rely on).

interface CodeLensThemeContextValue {
  themeId: string
  setThemeId: (id: string) => void
  theme: CodeLensTheme
}

export function CodeLensThemeProvider({ children }: { children: ReactNode }) {
  // No provider of its own anymore — the real theme state lives in the
  // app-wide ThemeProvider (mounted in App.jsx), which already wraps every
  // route including this one.
  return children
}

export function useCodeLensTheme(): CodeLensThemeContextValue {
  const { studioTheme, setStudioTheme } = useGlobalTheme()
  return {
    themeId: studioTheme,
    setThemeId: setStudioTheme,
    theme: getCodeLensTheme(studioTheme),
  }
}
