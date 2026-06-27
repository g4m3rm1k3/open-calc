// Shared "structural" color tokens for notebook-style and circuit/PLC-style viz
// components — previously the common fields here were copy-pasted independently
// across ~30 files (as `function makeT(dark) {...}`), which is why a past pass
// to make them theme-aware only ever touched a field or two per file.
//
// Each consumer keeps its own bespoke extras (e.g. plateFill, wireOn, canvasBg)
// by spreading this core and adding its own fields:
//   const t = { ...makeCircuitTokens(dark), plateFill: dark ? '#1e3a5f' : '#dbeafe' };

// Used by ScienceNotebook.jsx (one per course) and JSNotebook.jsx.
// bg < panel2 < panel is a deliberate depth ladder (darkest backdrop -> raised
// header bar -> raised card) so adjacent blocks stay visually distinguishable
// regardless of theme — bg and panel2 used to collide on the same slate shade.
export function makeNotebookTokens(dark) {
  return {
    bg: dark ? "rgb(var(--tw-custom-slate-950))" : "rgb(var(--tw-custom-slate-50))",
    panel: dark ? "rgb(var(--tw-custom-slate-800))" : "#ffffff",
    panel2: dark ? "rgb(var(--tw-custom-slate-900))" : "rgb(var(--tw-custom-slate-100))",
    border: dark ? "rgb(var(--tw-custom-slate-700))" : "rgb(var(--tw-custom-slate-200))",
    text: dark ? "rgb(var(--tw-custom-slate-200))" : "rgb(var(--tw-custom-slate-800))",
    muted: dark ? "rgb(var(--tw-custom-slate-400))" : "rgb(var(--tw-custom-slate-500))",
    accent: dark ? "rgb(var(--tw-custom-brand-400))" : "rgb(var(--tw-custom-brand-600))",
  };
}

// Used by Electronics/PLC circuit-diagram viz components.
export function makeCircuitTokens(dark) {
  return {
    bg: dark ? "rgb(var(--tw-custom-slate-950))" : "rgb(var(--tw-custom-slate-50))",
    panel: dark ? "rgb(var(--tw-custom-slate-900))" : "#ffffff",
    card: dark ? "rgb(var(--tw-custom-slate-800))" : "rgb(var(--tw-custom-slate-100))",
    // inset is a sunken/recessed surface (e.g. a display readout), so it
    // matches bg's depth rather than panel's, keeping it visually distinct.
    inset: dark ? "rgb(var(--tw-custom-slate-950))" : "rgb(var(--tw-custom-slate-50))",
    border: dark ? "rgb(var(--tw-custom-slate-800))" : "rgb(var(--tw-custom-slate-200))",
    fence: dark ? "rgb(var(--tw-custom-slate-700))" : "rgb(var(--tw-custom-slate-300))",
    text: dark ? "rgb(var(--tw-custom-slate-200))" : "rgb(var(--tw-custom-slate-800))",
    sub: dark ? "rgb(var(--tw-custom-slate-400))" : "rgb(var(--tw-custom-slate-500))",
    dim: dark ? "rgb(var(--tw-custom-slate-500))" : "rgb(var(--tw-custom-slate-400))",
    svgBg: dark ? "rgb(var(--tw-custom-slate-900))" : "#ffffff",
    grid: dark ? "rgb(var(--tw-custom-slate-800))" : "rgb(var(--tw-custom-slate-200))",
  };
}
