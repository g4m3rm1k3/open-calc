import type { useThemeColors } from "../../hooks/useThemeColors";

// Fixed, curated semantic colors (green/amber/red for response status) —
// deliberately theme-invariant, per useThemeColors.js's own documented
// intent, not the studio-theme-reactive system.
export type StatusColors = ReturnType<typeof useThemeColors>;

// The REAL studio-theme-reactive palette (Vue/Dracula/GitHub/...), sourced
// from STUDIO_THEMES via useGlobalTheme()'s themeStyles.ui — plain Tailwind
// class-name strings, applied via className, not inline styles.
export interface UiTheme {
  bg0: string;
  bg1: string;
  bg2: string;
  border: string;
  txt1: string;
  txt2: string;
  hoverBg: string;
  hoverTx: string;
  btnBorder: string;
  primary: string;
  primaryBg: string;
}

export interface BackendFile {
  id: string;
  name: string;
  code: string;
}

export interface HttpRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string;
}

export interface HttpResponseResult {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}
