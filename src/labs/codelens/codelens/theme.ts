// CodeLens theme palettes — keyed by the SAME ids as the app's real global
// theme system (src/utils/studioThemes.js STUDIO_THEMES: default, github,
// dracula, nord, monokai, tokyo_night, one_dark, catppuccin), not a separate
// CodeLens-only list. CodeLens previously had its own fixed 6-theme picker
// that only ever reached the <Editor theme={...}> prop (recoloring the code
// pane but leaving every surrounding panel hardcoded) — and, worse, was
// entirely disconnected from the app's actual global theme selector, so
// switching themes in CodeLens didn't match the rest of the app and vice
// versa. This file now derives a rich UI palette (used for every panel, not
// just the editor) for each of the app's real global theme ids, hand-tuned
// from that theme's own real colors (extracted from studioThemes.js's
// `uiDark`/`mdDark` values where available) — `monaco` is read directly off
// STUDIO_THEMES so it can never drift from the global source.

import { STUDIO_THEMES } from '../../../utils/studioThemes.js'

export interface CodeLensUiPalette {
  bg: string
  headerBg: string
  panelBg: string
  panelBg2: string
  border: string
  borderStrong: string
  textFaint: string
  textMuted: string
  textDim: string
  text: string
  textBright: string
  textSoft: string
  accent: string
  accentBright: string
  accentSolid: string
  accentDeep: string
  accentBg: string
  accentBgSolid: string
  cyan: string
  green: string
  greenBright: string
  greenDeep: string
  amber: string
  amberSoft: string
  amberDeep: string
  pink: string
  purple: string
  red: string
  redSoft: string
  redSolid: string
  redDeep: string
}

export interface CodeLensTheme {
  id: string
  label: string
  monaco: string
  ui: CodeLensUiPalette
}

const PALETTES: Record<string, CodeLensUiPalette> = {
  default: {
    bg: '#080c14', headerBg: '#0a0f1e', panelBg: '#0f172a', panelBg2: '#0d1526',
    border: '#1e293b', borderStrong: '#334155',
    textFaint: '#475569', textMuted: '#64748b', textDim: '#94a3b8',
    text: '#e2e8f0', textBright: '#f1f5f9', textSoft: '#cbd5e1',
    accent: '#818cf8', accentBright: '#a5b4fc', accentSolid: '#6366f1', accentDeep: '#4338ca',
    accentBg: '#1e1b4b', accentBgSolid: '#312e81',
    cyan: '#7dd3fc', green: '#86efac', greenBright: '#34d399', greenDeep: '#14532d',
    amber: '#fbbf24', amberSoft: '#fcd34d', amberDeep: '#78350f',
    pink: '#f472b6', purple: '#a78bfa',
    red: '#f87171', redSoft: '#fca5a5', redSolid: '#ef4444', redDeep: '#dc2626',
  },
  github: {
    bg: '#0d1117', headerBg: '#010409', panelBg: '#161b22', panelBg2: '#0d1117',
    border: '#30363d', borderStrong: '#484f58',
    textFaint: '#484f58', textMuted: '#6e7681', textDim: '#8b949e',
    text: '#c9d1d9', textBright: '#f0f6fc', textSoft: '#c9d1d9',
    accent: '#58a6ff', accentBright: '#79c0ff', accentSolid: '#388bfd', accentDeep: '#1f6feb',
    accentBg: '#0d2147', accentBgSolid: '#1f3a67',
    cyan: '#39c5cf', green: '#3fb950', greenBright: '#56d364', greenDeep: '#238636',
    amber: '#d29922', amberSoft: '#e3b341', amberDeep: '#9e6a03',
    pink: '#db61a2', purple: '#bc8cff',
    red: '#f85149', redSoft: '#ffa198', redSolid: '#f85149', redDeep: '#da3633',
  },
  dracula: {
    bg: '#21222c', headerBg: '#1e1f29', panelBg: '#282a36', panelBg2: '#1e1f29',
    border: '#44475a', borderStrong: '#6272a4',
    textFaint: '#6272a4', textMuted: '#7c86b3', textDim: '#a5adc9',
    text: '#f8f8f2', textBright: '#ffffff', textSoft: '#e6e6f0',
    accent: '#bd93f9', accentBright: '#d6bcfa', accentSolid: '#bd93f9', accentDeep: '#8858c8',
    accentBg: '#33283f', accentBgSolid: '#4a3766',
    cyan: '#8be9fd', green: '#50fa7b', greenBright: '#7dffa0', greenDeep: '#1f7a3f',
    amber: '#ffb86c', amberSoft: '#ffd399', amberDeep: '#8a5a1f',
    pink: '#ff79c6', purple: '#bd93f9',
    red: '#ff5555', redSoft: '#ff9494', redSolid: '#ff5555', redDeep: '#b32a2a',
  },
  nord: {
    bg: '#242933', headerBg: '#262b36', panelBg: '#2e3440', panelBg2: '#3b4252',
    border: '#434c5e', borderStrong: '#4c566a',
    textFaint: '#4c566a', textMuted: '#616e88', textDim: '#9aa5b7',
    text: '#d8dee9', textBright: '#eceff4', textSoft: '#e5e9f0',
    accent: '#88c0d0', accentBright: '#8fbcbb', accentSolid: '#81a1c1', accentDeep: '#5e81ac',
    accentBg: '#33455a', accentBgSolid: '#3b4252',
    cyan: '#8fbcbb', green: '#a3be8c', greenBright: '#b7d1a0', greenDeep: '#566b41',
    amber: '#ebcb8b', amberSoft: '#f0d9a8', amberDeep: '#7a6a3f',
    pink: '#b48ead', purple: '#b48ead',
    red: '#bf616a', redSoft: '#d38b92', redSolid: '#bf616a', redDeep: '#8f434a',
  },
  monokai: {
    bg: '#1e1f1c', headerBg: '#1b1c19', panelBg: '#272822', panelBg2: '#1e1f1c',
    border: '#49483e', borderStrong: '#75715e',
    textFaint: '#75715e', textMuted: '#90887a', textDim: '#b2ada0',
    text: '#f8f8f2', textBright: '#ffffff', textSoft: '#e6e6df',
    accent: '#66d9ef', accentBright: '#a1e7f5', accentSolid: '#66d9ef', accentDeep: '#3f9cb3',
    accentBg: '#1c3238', accentBgSolid: '#22505c',
    cyan: '#66d9ef', green: '#a6e22e', greenBright: '#c6ef5c', greenDeep: '#4d6b16',
    amber: '#e6db74', amberSoft: '#f0e59c', amberDeep: '#7a7233',
    pink: '#f92672', purple: '#ae81ff',
    red: '#f92672', redSoft: '#ff9fbd', redSolid: '#f92672', redDeep: '#a01a4c',
  },
  tokyo_night: {
    bg: '#16161e', headerBg: '#1a1b26', panelBg: '#1f2335', panelBg2: '#16161e',
    border: '#292e42', borderStrong: '#3b4261',
    textFaint: '#3b4261', textMuted: '#565f89', textDim: '#7982a9',
    text: '#a9b1d6', textBright: '#c0caf5', textSoft: '#c0caf5',
    accent: '#7aa2f7', accentBright: '#9ab8ff', accentSolid: '#7aa2f7', accentDeep: '#3d5c9e',
    accentBg: '#242a42', accentBgSolid: '#283457',
    cyan: '#7dcfff', green: '#9ece6a', greenBright: '#b8e28c', greenDeep: '#4c6a30',
    amber: '#e0af68', amberSoft: '#eec38f', amberDeep: '#7a5a2f',
    pink: '#bb9af7', purple: '#bb9af7',
    red: '#f7768e', redSoft: '#ff9fb0', redSolid: '#f7768e', redDeep: '#a8455a',
  },
  one_dark: {
    bg: '#21252b', headerBg: '#262a31', panelBg: '#282c34', panelBg2: '#21252b',
    border: '#3a3f4b', borderStrong: '#4b5263',
    textFaint: '#4b5263', textMuted: '#5c6370', textDim: '#828997',
    text: '#abb2bf', textBright: '#dfe2e8', textSoft: '#c8ccd4',
    accent: '#61afef', accentBright: '#8cc6f5', accentSolid: '#61afef', accentDeep: '#3d7bb0',
    accentBg: '#2a3540', accentBgSolid: '#325079',
    cyan: '#56b6c2', green: '#98c379', greenBright: '#b5d999', greenDeep: '#526e38',
    amber: '#e5c07b', amberSoft: '#eed49f', amberDeep: '#7a6533',
    pink: '#c678dd', purple: '#c678dd',
    red: '#e06c75', redSoft: '#ec99a0', redSolid: '#e06c75', redDeep: '#9c454c',
  },
  catppuccin: {
    // Macchiato variant — matches the exact hex values studioThemes.js
    // already uses for this theme's global uiDark/mdDark colors.
    bg: '#181825', headerBg: '#131320', panelBg: '#24273a', panelBg2: '#1e2030',
    border: '#363a4f', borderStrong: '#494d64',
    textFaint: '#6e738d', textMuted: '#8087a2', textDim: '#a5adcb',
    text: '#cad3f5', textBright: '#f4dbd6', textSoft: '#b8c0e0',
    accent: '#8aadf4', accentBright: '#a5c8ff', accentSolid: '#8aadf4', accentDeep: '#5b83c9',
    accentBg: '#1f2b47', accentBgSolid: '#2d3f66',
    cyan: '#8bd5ca', green: '#a6da95', greenBright: '#b8e2ad', greenDeep: '#5a8c4e',
    amber: '#eed49f', amberSoft: '#f5e3bb', amberDeep: '#a8863f',
    pink: '#f5bde6', purple: '#c6a0f6',
    red: '#ed8796', redSoft: '#f2a8b3', redSolid: '#ed8796', redDeep: '#c65a6b',
  },
}

export const CODELENS_THEMES: CodeLensTheme[] = Object.entries(STUDIO_THEMES).map(([id, def]: [string, any]) => ({
  id,
  label: def.name,
  monaco: def.monacoDark ?? def.monacoLight,
  ui: PALETTES[id] ?? PALETTES.default,
}))

export const DEFAULT_CODELENS_THEME_ID = 'default'

export function getCodeLensTheme(id: string): CodeLensTheme {
  return CODELENS_THEMES.find(t => t.id === id) ?? CODELENS_THEMES.find(t => t.id === DEFAULT_CODELENS_THEME_ID)!
}
