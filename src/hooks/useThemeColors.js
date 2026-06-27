import { useState, useEffect } from "react";

// Appends an alpha channel to a color produced by this hook. Many call sites
// used to do `C.surface + "dd"` / `${C.border}44`, which only works when the
// color is a literal hex string. Now that several fields resolve to
// `rgb(var(--tw-custom-*))` (so they track the active studio theme live),
// that hex-suffix trick silently produces invalid CSS and the browser drops
// the whole declaration — e.g. cell borders/backgrounds disappearing
// entirely. Use this instead: withAlpha(C.border, "44").
export function withAlpha(color, hexAlpha) {
  if (!color) return color;
  if (color.startsWith("#")) return color + hexAlpha;
  const m = color.match(/^rgb\(([^)]+)\)$/);
  if (m) {
    const alpha = parseInt(hexAlpha, 16) / 255;
    const inner = m[1].includes("/") ? m[1].split("/")[0].trim() : m[1];
    return `rgb(${inner} / ${alpha.toFixed(3)})`;
  }
  return color;
}

// Shared color hook for notebook cells and viz components — previously this
// exact logic was copy-pasted independently across ~44 files, which is why a
// past attempt to make it theme-aware only landed in some of them.
//
// `blue` follows the active studio theme's accent color (--tw-custom-brand-*).
// `teal`/`amber`/`green`/`red`/`purple`/`orange` are deliberately fixed,
// curated colors rather than theme-variable — they read as semantic/
// categorical markers (warning, success, error, secondary accent, etc.) and
// should stay recognizable and good-looking regardless of which studio theme
// is active. (An earlier version derived `teal` from a hue-rotated accent —
// reverted because rotating an arbitrary accent hue by a fixed amount can
// land anywhere on the wheel, e.g. the default theme's cyan accent rotated
// into pink instead of teal.)
export function useThemeColors() {
  const isDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  return {
    dark,
    // bg < surface2 < surface is a deliberate depth ladder (darkest backdrop ->
    // raised header bar -> raised card), so adjacent blocks stay visually
    // distinguishable. bg and surface2 used to both resolve to slate-900,
    // which made consecutive cell blocks blend into one undifferentiated slab.
    bg: dark ? "rgb(var(--tw-custom-slate-950))" : "rgb(var(--tw-custom-slate-50))",
    surface: dark ? "rgb(var(--tw-custom-slate-800))" : "#ffffff",
    surface2: dark ? "rgb(var(--tw-custom-slate-900))" : "rgb(var(--tw-custom-slate-100))",
    border: dark ? "rgb(var(--tw-custom-slate-700))" : "rgb(var(--tw-custom-slate-200))",
    text: dark ? "rgb(var(--tw-custom-slate-200))" : "rgb(var(--tw-custom-slate-800))",
    muted: dark ? "rgb(var(--tw-custom-slate-400))" : "rgb(var(--tw-custom-slate-500))",
    hint: dark ? "rgb(var(--tw-custom-slate-500))" : "rgb(var(--tw-custom-slate-400))",

    blue: dark ? "rgb(var(--tw-custom-brand-400))" : "rgb(var(--tw-custom-brand-600))",
    blueBg: dark ? "rgb(var(--tw-custom-brand-400) / 0.12)" : "rgb(var(--tw-custom-brand-600) / 0.08)",
    blueBd: dark ? "rgb(var(--tw-custom-brand-400))" : "rgb(var(--tw-custom-brand-600))",

    teal: dark ? "#2dd4bf" : "#0d9488",
    tealBg: dark ? "rgba(45,212,191,0.12)" : "rgba(13,148,136,0.08)",
    tealBd: dark ? "#2dd4bf" : "#0d9488",

    amber: dark ? "#fbbf24" : "#d97706",
    amberBg: dark ? "rgba(251,191,36,0.12)" : "rgba(217,119,6,0.08)",
    amberBd: dark ? "#fbbf24" : "#d97706",

    green: dark ? "#4ade80" : "#16a34a",
    greenBg: dark ? "rgba(74,222,128,0.12)" : "rgba(22,163,74,0.08)",
    greenBd: dark ? "#4ade80" : "#16a34a",

    red: dark ? "#f87171" : "#dc2626",
    redBg: dark ? "rgba(248,113,113,0.12)" : "rgba(220,38,38,0.08)",
    redBd: dark ? "#f87171" : "#dc2626",

    purple: dark ? "#a78bfa" : "#7c3aed",
    purpleBg: dark ? "rgba(167,139,250,0.12)" : "rgba(124,58,237,0.08)",
    purpleBd: dark ? "#a78bfa" : "#7c3aed",

    orange: dark ? "#fb923c" : "#ea580c",
    orangeBg: dark ? "rgba(251,146,60,0.12)" : "rgba(234,88,12,0.08)",
    orangeBd: dark ? "#fb923c" : "#ea580c",
  };
}
