import { useMemo } from 'react';
import { useGlobalTheme } from '../../../../context/ThemeContext';
import { STUDIO_THEMES } from '../../../../utils/studioThemes';

function extractHex(str) {
  if (!str) return null;
  const match = str.match(/#([0-9a-fA-F]{3,8})/);
  return match ? match[0] : null;
}

const PALETTE_DARK = {
  bg: "#07111e",
  p1: "#0f172a",
  p2: "#132033",
  p3: "#1e293b",
  p4: "#334155",
  bd: "#2b3a55",
  bd2: "#475569",
  blue: "#63b8ff",
  blue2: "#94b8ff",
  blueBg: "rgba(33, 102, 255, 0.10)",
  green: "#46d89f",
  green2: "#6ee7b7",
  greenBg: "rgba(70, 216, 159, 0.1)",
  amber: "#f0b44c",
  amber2: "#fcd34d",
  amberBg: "rgba(240, 180, 76, 0.1)",
  red: "#ff8b8b",
  red2: "#fca5a5",
  redBg: "rgba(255, 139, 139, 0.1)",
  purple: "#b89cff",
  teal: "#31d0c4",
  txt: "#e6eefb",
  txt2: "#90a4c2",
  txt3: "#61738e",
  rapid: "#ff8b8b",
  feed: "#46d89f",
  arc: "#b89cff",
  steel: "#334155",
  steelLight: "#475569",
  grad: "linear-gradient(135deg, #091324 0%, #0a314e 52%, #0f5f64 100%)",
  gradBorder: "rgba(148, 184, 255, 0.18)",
  vpBg: "#0B1424",
  codeBg: "#0f172a",
  brandTxt: "#ffffff",
  grid: "#131c28",
  axBd: "#1e3040",
  axGrid: "#2a4060",
  cutOverlay: "rgba(255,110,46,0.15)",
  cutBorder: "rgba(255,110,46,0.5)",
  stockTop: "#1e3a5a",
  stockS1: "#152840",
  stockS2: "#1a4060",
  stockFront: "#0f2035",
  stockBd: "#2a5278",
  fixTop: "#2a3a10",
  fixSide: "#3a5015",
  fixBd: "#4a6820",
};

const PALETTE_LIGHT = {
  bg: "#f4f7fb",
  p1: "#ffffff",
  p2: "#edf4ff",
  p3: "#e2e8f0",
  p4: "#cbd5e1",
  bd: "#d5dfef",
  bd2: "#94a3b8",
  blue: "#1769d1",
  blue2: "#10243e",
  blueBg: "rgba(23, 105, 209, 0.10)",
  green: "#198754",
  green2: "#059669",
  greenBg: "rgba(25, 135, 84, 0.1)",
  amber: "#b36d05",
  amber2: "#d97706",
  amberBg: "rgba(179, 109, 5, 0.1)",
  red: "#c03535",
  red2: "#dc2626",
  redBg: "rgba(192, 53, 53, 0.1)",
  purple: "#6f42c1",
  teal: "#0f8d85",
  txt: "#15253a",
  txt2: "#607188",
  txt3: "#8a99ae",
  rapid: "#c03535",
  feed: "#198754",
  arc: "#6f42c1",
  steel: "#cbd5e1",
  steelLight: "#94a3b8",
  grad: "linear-gradient(135deg, #eef6ff 0%, #daeefe 48%, #ddfbf3 100%)",
  gradBorder: "rgba(23, 105, 209, 0.16)",
  vpBg: "#ffffff",
  codeBg: "#f8fbff",
  brandTxt: "#10243e",
  grid: "#d5dfef",
  axBd: "#cbd5e1",
  axGrid: "#94a3b8",
  cutOverlay: "rgba(239,68,68,0.15)",
  cutBorder: "rgba(239,68,68,0.5)",
  stockTop: "#bfdbfe",
  stockS1: "#93c5fd",
  stockS2: "#60a5fa",
  stockFront: "#3b82f6",
  stockBd: "#2563eb",
  fixTop: "#fcd34d",
  fixSide: "#fbbf24",
  fixBd: "#d97706",
};

export function useCncTheme() {
  const { studioTheme } = useGlobalTheme();
  
  return useMemo(() => {
    const activeTheme = STUDIO_THEMES[studioTheme] || STUDIO_THEMES['default'];
    // Default to dark palette to use as fallback if theme is dark
    // For our global themes, we can just check if monacoDark is set and it is not open-calc-light
    const isDark = activeTheme && (!activeTheme.monacoDark?.includes('light') || activeTheme.type !== 'light');
    const basePalette = isDark ? PALETTE_DARK : PALETTE_LIGHT;
    
    if (!activeTheme) return basePalette;

    const sourceUI = activeTheme.uiDark || activeTheme.uiLight || {};
    
    const ui = {
      ...basePalette,
      
      // Override core backgrounds
      bg: extractHex(sourceUI.bg0) ?? basePalette.bg,
      p1: extractHex(sourceUI.bg1) ?? basePalette.p1,
      p2: extractHex(sourceUI.bg2) ?? basePalette.p2,
      p3: extractHex(sourceUI.bg3) ?? basePalette.p3,
      p4: extractHex(sourceUI.bg4) ?? basePalette.p4,
      codeBg: extractHex(sourceUI.bg1) ?? basePalette.codeBg,
      vpBg: extractHex(sourceUI.bg0) ?? basePalette.vpBg,
      
      // Override borders
      bd: extractHex(sourceUI.border) ?? basePalette.bd,
      bd2: extractHex(sourceUI.borderStrong) ?? basePalette.bd2,
      axBd: extractHex(sourceUI.border) ?? basePalette.axBd,
      axGrid: extractHex(sourceUI.borderStrong) ?? basePalette.axGrid,
      
      // Override typography
      txt: extractHex(sourceUI.text) ?? basePalette.txt,
      txt2: extractHex(sourceUI.textDim) ?? basePalette.txt2,
      txt3: extractHex(sourceUI.textFaint) ?? basePalette.txt3,
      brandTxt: extractHex(sourceUI.text) ?? basePalette.brandTxt,
      
      // Accents
      blue: extractHex(sourceUI.cyan) ?? basePalette.blue,
      blue2: extractHex(sourceUI.accent) ?? basePalette.blue2,
      blueBg: extractHex(sourceUI.accentBg) ?? basePalette.blueBg,
      
      green: extractHex(sourceUI.green) ?? basePalette.green,
      green2: extractHex(sourceUI.greenBright) ?? basePalette.green2,
      greenBg: extractHex(sourceUI.green) ? (extractHex(sourceUI.green) + '33') : basePalette.greenBg,

      amber: extractHex(sourceUI.amber) ?? basePalette.amber,
      amber2: extractHex(sourceUI.amberBright) ?? basePalette.amber2,
      amberBg: extractHex(sourceUI.amber) ? (extractHex(sourceUI.amber) + '33') : basePalette.amberBg,

      red: extractHex(sourceUI.pink) ?? basePalette.red,
      red2: extractHex(sourceUI.pinkBright) ?? basePalette.red2,
      redBg: extractHex(sourceUI.pink) ? (extractHex(sourceUI.pink) + '33') : basePalette.redBg,
      
      purple: extractHex(sourceUI.purple) ?? basePalette.purple,
    };
    
    return ui;
  }, [studioTheme]);
}
