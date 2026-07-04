import type { Action, BodyThemeState, LabElement, LabPage, LabState, StyleUpdate } from "./types";
import { cascadeComponentThemes } from "./componentLibrary";

// ─── Default styles per tag ───────────────────────────────────────────────────
const TAG_DEFAULTS: Record<string, Record<string, string>> = {
  div:     { padding: "24px", margin: "0 0 16px 0", border: "1px dashed #cbd5e1", borderRadius: "8px", minHeight: "60px", display: "block" },
  p:       { fontSize: "16px", color: "#475569", lineHeight: "1.6", margin: "0 0 16px 0", display: "block" },
  h1:      { fontSize: "40px", fontWeight: "700", margin: "0 0 24px 0", lineHeight: "1.2", display: "block" },
  h2:      { fontSize: "32px", fontWeight: "600", margin: "0 0 16px 0", lineHeight: "1.3", display: "block" },
  h3:      { fontSize: "24px", fontWeight: "600", margin: "0 0 16px 0", lineHeight: "1.4", display: "block" },
  button:  { padding: "10px 20px", backgroundColor: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", display: "inline-block", margin: "0 8px 0 0" },
  span:    { display: "inline", color: "inherit" },
  img:     { width: "100%", maxWidth: "400px", height: "auto", backgroundColor: "#f1f5f9", borderRadius: "8px", display: "block", margin: "0 0 16px 0" },
  ul:      { padding: "0 0 0 24px", margin: "0 0 16px 0", display: "block", color: "#475569" },
  li:      { fontSize: "16px", lineHeight: "1.6", display: "list-item", margin: "0 0 8px 0" },
  a:       { color: "#3b82f6", textDecoration: "underline", display: "inline", cursor: "pointer" },
  section: { padding: "48px 24px", margin: "0", display: "block", minHeight: "100px", backgroundColor: "transparent" },
  article: { padding: "32px", margin: "0 0 24px 0", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", display: "block" },
  header:  { padding: "24px", margin: "0", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "block" },
  footer:  { padding: "32px 24px", margin: "0", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "block" },
  nav:     { padding: "16px 24px", margin: "0", display: "flex", alignItems: "center", gap: "16px", backgroundColor: "transparent" },
  ol:      { padding: "0 0 0 24px", margin: "0 0 16px 0", display: "block", color: "#475569" },
  hr:      { border: "none", borderTop: "1px solid #e2e8f0", margin: "16px 0" },
  blockquote: { margin: "0 0 16px 0", padding: "8px 20px", borderLeft: "4px solid #cbd5e1", color: "#475569", fontStyle: "italic", display: "block" },
  pre:     { margin: "0 0 16px 0", padding: "16px", backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", overflow: "auto", display: "block" },
  code:    { fontFamily: "monospace", fontSize: "14px", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", display: "inline" },
  label:   { fontSize: "14px", fontWeight: "500", color: "#0f172a", display: "block", margin: "0 0 4px 0", cursor: "pointer" },
  video:   { width: "100%", maxWidth: "480px", backgroundColor: "#0f172a", borderRadius: "8px", display: "block", margin: "0 0 16px 0" },
  audio:   { width: "100%", maxWidth: "400px", display: "block", margin: "0 0 16px 0" },
  h4:      { fontSize: "20px", fontWeight: "600", margin: "0 0 12px 0", lineHeight: "1.4", display: "block" },
  h5:      { fontSize: "17px", fontWeight: "600", margin: "0 0 12px 0", lineHeight: "1.4", display: "block" },
  h6:      { fontSize: "15px", fontWeight: "600", margin: "0 0 12px 0", lineHeight: "1.4", display: "block" },
  strong:  { fontWeight: "700", display: "inline", color: "inherit" },
  em:      { fontStyle: "italic", display: "inline", color: "inherit" },
  b:       { fontWeight: "700", display: "inline", color: "inherit" },
  i:       { fontStyle: "italic", display: "inline", color: "inherit" },
  u:       { textDecoration: "underline", display: "inline", color: "inherit" },
  s:       { textDecoration: "line-through", display: "inline", color: "inherit" },
  small:   { fontSize: "12px", display: "inline", color: "inherit" },
  mark:    { backgroundColor: "#fef08a", padding: "0 2px", display: "inline", color: "#1a1a18" },
  sub:     { verticalAlign: "sub", fontSize: "12px", display: "inline", color: "inherit" },
  sup:     { verticalAlign: "super", fontSize: "12px", display: "inline", color: "inherit" },
  kbd:     { fontFamily: "monospace", fontSize: "13px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "1px 6px", display: "inline" },
  time:    { color: "#64748b", display: "inline" },
  br:      {},
  input:   { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px", display: "block", width: "100%", maxWidth: "320px", boxSizing: "border-box", margin: "0 0 16px 0" },
  textarea: { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px", display: "block", width: "100%", maxWidth: "320px", minHeight: "80px", boxSizing: "border-box", margin: "0 0 16px 0", fontFamily: "inherit" },
  address: { fontStyle: "normal", color: "#475569", display: "block", margin: "0 0 16px 0", lineHeight: "1.6" },
  iframe:  { width: "100%", maxWidth: "480px", height: "270px", border: "none", borderRadius: "8px", display: "block", margin: "0 0 16px 0", backgroundColor: "#f1f5f9" },
  canvas:  { width: "100%", maxWidth: "480px", height: "240px", backgroundColor: "#f1f5f9", borderRadius: "8px", display: "block", margin: "0 0 16px 0" },
};

const TAG_CONTENT: Record<string, string> = {
  div: "", p: "Paragraph text", h1: "Heading 1", h2: "Heading 2", h3: "Heading 3",
  button: "Click me", span: "Span text", img: "", ul: "", li: "List item",
  a: "Link text", section: "", article: "", header: "", footer: "",
  nav: "", ol: "", hr: "", blockquote: "The best way to predict the future is to invent it.",
  pre: "console.log(\"Hello, world!\");", code: "code", label: "Label text",
  video: "", audio: "",
  h4: "Heading 4", h5: "Heading 5", h6: "Heading 6",
  strong: "Bold text", em: "Italic text", b: "Bold text", i: "Italic text",
  u: "Underlined text", s: "Strikethrough text", small: "Small print",
  mark: "Highlighted text", sub: "sub", sup: "sup", kbd: "Ctrl+S", time: "2025-01-01",
  br: "", input: "", textarea: "", address: "123 Main St, Anytown", iframe: "", canvas: "",
};

const TAG_ATTRS: Record<string, Record<string, string>> = {
  a:      { href: "#", target: "" },
  img:    { src: "", alt: "Image" },
  button: { type: "button" },
  video:  { controls: "true" },
  audio:  { controls: "true" },
  time:   { datetime: "2025-01-01" },
  input:  { type: "text", placeholder: "Enter text..." },
  iframe: { src: "" },
  canvas: { width: "480", height: "240" },
};

export const CONTAINER_TAGS = new Set([
  "div", "section", "article", "header", "footer", "nav", "ul", "ol", "li", "p", "span",
  // Table structure — without these, an imported <table>'s <thead>/<tr>/<th> children
  // are silently dropped (they're not text content, and only container tags render children).
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "form", "fieldset", "figure", "figcaption", "dl", "dt", "dd",
  "main", "aside", "blockquote", "details", "summary",
]);

// Tags the canvas renders with no administrative wrapper div at all (see
// CanvasPanel's renderElement/renderTag) — nesting a table-role display
// (table-row/table-cell/...) wrapper around a real thead/tbody/tr/th/td
// forces the browser to insert an anonymous mini-table at that level (a
// table-cell can't directly contain another table-cell), which isolates that
// cell's column width from its siblings entirely. The real tag carries the
// interactive/selection behavior directly instead.
export const TABLE_ROLE_TAGS = new Set(["thead", "tbody", "tfoot", "tr", "th", "td"]);

let _idCounter = 1;
function genId(): string {
  return "el" + _idCounter++;
}

// ─── Global style axes ──────────────────────────────────────────────────────────
// Color mode, glass surface, and centered layout are independent — computed
// fresh from these three flags every time, rather than merged from a flat list
// of mutually-exclusive presets (which is how picking "Centered" used to throw
// away whatever color mode was active).
export const DEFAULT_BODY_THEME: BodyThemeState = { colorMode: "light", glass: false, centered: false };

export function computeBodyStyles(theme: BodyThemeState): Record<string, string> {
  const isDark = theme.colorMode === "dark";
  const styles: Record<string, string> = {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "16px",
    lineHeight: "1.5",
    margin: "0",
    padding: "0",
    color: isDark ? "#f8fafc" : "#0f172a",
  };

  if (theme.glass) {
    // Glass always needs something colorful underneath it to read as "glass" —
    // the gradient itself shifts with color mode, same as the per-component
    // -glass variants do for their own backgrounds.
    styles.background = isDark
      ? "linear-gradient(135deg, #4c1d95 0%, #1e3a8a 100%)"
      : "linear-gradient(135deg, #ddd6fe 0%, #bfdbfe 100%)";
  } else {
    styles.backgroundColor = isDark ? "#0f172a" : "#f8fafc";
  }

  if (theme.centered) {
    styles.maxWidth = "1024px";
    styles.margin = "0 auto";
    styles.padding = "48px 24px";
  }

  return styles;
}

// Best-effort reverse mapping, for whenever bodyStyles gets set directly by
// something outside the axis system (loading an example, importing a page,
// hand-editing the CSS tab) — without this, the Global Style panel keeps
// showing whatever axis state it last had (e.g. "Light" highlighted) even
// though the page that just loaded is actually dark, since none of those
// code paths otherwise touch `bodyTheme` at all.
export function inferBodyTheme(bodyStyles: Record<string, string>): BodyThemeState {
  const bg = bodyStyles.backgroundColor || bodyStyles.background || "";
  // A plain color is just itself; a gradient (or any string with multiple hex
  // colors) is judged by the average luminance of every color in it, so this
  // works for gradients this app never generated itself (e.g. a hand-authored
  // import) just as well as for its own light-glass/dark-glass gradients.
  const hexColors = bg.match(/#[0-9a-fA-F]{6}/g) ?? [];
  const isDark = hexColors.length > 0
    ? hexColors.reduce((sum, c) => sum + hexLum(c), 0) / hexColors.length < 0.5
    : /0f172a|1e293b|1a1a1a|000000|020617/i.test(bg);
  return {
    colorMode: isDark ? "dark" : "light",
    glass: Boolean(bodyStyles.background && !bodyStyles.backgroundColor),
    centered: Boolean(bodyStyles.maxWidth),
  };
}

// ─── Initial state ────────────────────────────────────────────────────────────
export const initialState: LabState = {
  elements: [],
  selectedId: null,
  showOverlay: false,
  showLabels: true,
  customCss: "",
  javascript: "",
  history: [],
  bodyTheme: DEFAULT_BODY_THEME,
  bodyStyles: computeBodyStyles(DEFAULT_BODY_THEME),
  mode: "single",
  pages: [],
  activePageId: null,
  cdnLinks: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cloneElements(elements: LabElement[]): LabElement[] {
  return JSON.parse(JSON.stringify(elements)) as LabElement[];
}

function withHistory(state: LabState): LabState {
  const history = [...state.history, cloneElements(state.elements)];
  return { ...state, history: history.slice(-40) };
}

function saveActivePage(state: LabState): LabPage[] {
  if (state.mode !== "multi" || !state.activePageId) return state.pages;
  return state.pages.map((p) =>
    p.id === state.activePageId
      ? { ...p, elements: state.elements, bodyStyles: state.bodyStyles, javascript: state.javascript, customCss: state.customCss }
      : p,
  );
}

function blankPage(name: string, index: number): LabPage {
  return {
    id: "pg" + (Date.now() + index),
    name,
    elements: [],
    bodyStyles: computeBodyStyles(DEFAULT_BODY_THEME),
    javascript: "",
    customCss: "",
  };
}

function getDescendants(elements: LabElement[], id: string): Set<string> {
  const result = new Set<string>();
  const queue = [id];
  while (queue.length) {
    const cur = queue.shift()!;
    const children = elements.filter((e) => e.parentId === cur);
    for (const c of children) {
      result.add(c.id);
      queue.push(c.id);
    }
  }
  return result;
}

// ─── Dark/light cascade helpers ───────────────────────────────────────────────
function hexLum(hex: string): number {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return 0.5;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function hexSat(hex: string): number {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return 1;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  return max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
}

function extractHexColors(value: string): string[] {
  return value.match(/#[0-9a-fA-F]{6}/g) ?? [];
}

const BORDER_SHORTHAND_PROPS = ["border", "borderTop", "borderRight", "borderBottom", "borderLeft", "outline", "boxShadow"] as const;

// Real "page chrome" colors — light or dark — sit near the luminance extremes
// (near-black, near-white); genuine accent/brand colors (a CTA blue, a badge
// red) sit in the middle regardless of hue. Checking extremity instead of hue
// saturation is what lets a dark-navy nav (high saturation, but near-black)
// count as repaintable chrome while a mid-tone accent button stays protected.
// 0.20 (not a rounder-looking 0.15) is deliberate: it's calibrated to include
// #1e293b (lum 0.156 — Tailwind slate-800, used throughout this app's own
// dark-chrome sections, e.g. exampleProject.ts's hero gradient) while still
// excluding #334155 (lum 0.247, slate-700) and any real accent color like the
// #3b82f6 buttons (lum 0.478) — verified against the actual palette in use,
// not picked from a round number.
function isNeutralLum(lum: number): boolean {
  return lum < 0.20 || lum > 0.90;
}

// A background is "neutral" (safe to repaint) if every hex color found in it
// is luminance-extreme — covers a plain `backgroundColor` (one color) and a
// `background` gradient (several stops) with the same check. A background
// with no hex color at all (rgba(), a CSS var, a named color) stays opaque/protected.
function isNeutralBackground(bg?: string): boolean {
  if (!bg) return true;
  const hexColors = extractHexColors(bg);
  return hexColors.length > 0 && hexColors.every((c) => isNeutralLum(hexLum(c)));
}

// Remaps every extreme-luminance hex stop in a background value (a plain color
// or a multi-stop gradient) to the equivalent shade for the new mode, leaving
// any stop that's already the right extreme (or isn't extreme at all) alone.
function remapNeutralBackground(value: string, goingDark: boolean): { next: string; changed: boolean } {
  let changed = false;
  const next = value.replace(/#[0-9a-fA-F]{6}/g, (hex) => {
    const lum = hexLum(hex);
    if (goingDark && lum > 0.60) {
      changed = true;
      return lum > 0.95 ? "#1e293b" : lum > 0.85 ? "#0f172a" : "#334155";
    }
    if (!goingDark && lum < 0.35) {
      changed = true;
      return lum < 0.10 ? "#ffffff" : lum < 0.20 ? "#f8fafc" : "#f1f5f9";
    }
    return hex;
  });
  return { next, changed };
}

function cascadeBodyTheme(elements: LabElement[], newBodyStyles: Record<string, string>): LabElement[] {
  const rawBg = newBodyStyles.backgroundColor || newBodyStyles.background || "";
  const rawHexColors = extractHexColors(rawBg);
  if (rawHexColors.length === 0) return elements;

  const goingDark = rawHexColors.reduce((sum, c) => sum + hexLum(c), 0) / rawHexColors.length < 0.35;
  const primaryText   = goingDark ? "#f8fafc" : "#0f172a";
  const secondaryText = goingDark ? "#94a3b8" : "#64748b";

  const byId = new Map(elements.map((e) => [e.id, e]));
  const ownBgValue = (el: LabElement): string | undefined => el.styles.backgroundColor || el.styles.background;

  // The background an element actually sits on: its own, if set, otherwise the
  // nearest ancestor's explicit background, otherwise the body itself.
  function effectiveBg(el: LabElement): string | undefined {
    const own = ownBgValue(el);
    if (own) return own;
    let cur = el.parentId ? byId.get(el.parentId) : undefined;
    while (cur) {
      const curBg = ownBgValue(cur);
      if (curBg) return curBg;
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    return rawBg;
  }

  return elements.map((el) => {
    const s = { ...el.styles };
    let changed = false;

    // Only recolor an element's background if it's neutral enough to safely
    // repaint. Only recolor its text if the background it actually sits on
    // (own, or inherited from an ancestor) is neutral too — otherwise text and
    // backdrop end up mismatched (e.g. dark text stranded on an unchanged navy card).
    const ownBgIsNeutral = isNeutralBackground(ownBgValue(el));
    const sittingBgIsNeutral = isNeutralBackground(effectiveBg(el));

    if (sittingBgIsNeutral && s.color && s.color.startsWith("#") && s.color.length >= 7 && hexSat(s.color) < 0.25) {
      const lum = hexLum(s.color);
      if (goingDark && lum < 0.40) {
        s.color = lum < 0.20 ? primaryText : secondaryText;
        changed = true;
      } else if (!goingDark && lum > 0.60) {
        s.color = lum > 0.85 ? primaryText : secondaryText;
        changed = true;
      }
    }

    if (ownBgIsNeutral) {
      if (s.backgroundColor) {
        const { next, changed: c } = remapNeutralBackground(s.backgroundColor, goingDark);
        if (c) { s.backgroundColor = next; changed = true; }
      }
      if (s.background) {
        const { next, changed: c } = remapNeutralBackground(s.background, goingDark);
        if (c) { s.background = next; changed = true; }
      }
    }

    // Border/outline/shadow shorthands embed a color too (e.g. "2px solid
    // #e2e8f0"), and it's independent of whatever the fill is doing — a plain
    // table's whole color identity lives in borderBottom, with no
    // backgroundColor at all, so without this it never budges on a mode
    // toggle. Gated per-property on that property's own neutrality, not the
    // element's background, since a neutral gray border can sit on a
    // deliberately-unchanged accent fill.
    for (const prop of BORDER_SHORTHAND_PROPS) {
      const val = s[prop];
      if (val && isNeutralBackground(val)) {
        const { next, changed: c } = remapNeutralBackground(val, goingDark);
        if (c) { s[prop] = next; changed = true; }
      }
    }

    return changed ? { ...el, styles: s } : el;
  });
}

function applyStyleUpdates(elements: LabElement[], updates: StyleUpdate[]): LabElement[] {
  let next = elements;
  for (const update of updates) {
    next = next.map((el) => (el.id === update.id ? { ...el, styles: { ...el.styles, ...update.styles } } : el));
  }
  return next;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function labReducer(state: LabState, action: Action): LabState {
  switch (action.type) {
    case "LOAD_EXAMPLE": {
      const s = withHistory(state);
      if ("pages" in action.payload) {
        const first = action.payload.pages[0];
        return {
          ...s,
          elements: first.elements,
          bodyStyles: first.bodyStyles,
          bodyTheme: inferBodyTheme(first.bodyStyles),
          javascript: first.javascript ?? "",
          customCss: first.customCss ?? "",
          cdnLinks: action.payload.cdnLinks ?? s.cdnLinks,
          mode: "multi",
          pages: action.payload.pages,
          activePageId: first.id,
          selectedId: null,
        };
      }
      return {
        ...s,
        elements: action.payload.elements,
        bodyStyles: action.payload.bodyStyles,
        bodyTheme: inferBodyTheme(action.payload.bodyStyles),
        javascript: action.payload.javascript ?? "",
        customCss: action.payload.customCss ?? "",
        cdnLinks: action.payload.cdnLinks ?? s.cdnLinks,
        selectedId: null,
        mode: "single",
        pages: [],
        activePageId: null,
      };
    }

    case "TOGGLE_CDN": {
      const id = action.payload;
      return {
        ...state,
        cdnLinks: state.cdnLinks.includes(id)
          ? state.cdnLinks.filter((i) => i !== id)
          : [...state.cdnLinks, id],
      };
    }

    case "APPLY_GLOBAL_THEME": {
      const s = withHistory(state);
      let newElements = [...s.elements];
      for (const update of action.payload.updates) {
        newElements = newElements.map(el =>
          el.id === update.id ? { ...el, styles: { ...el.styles, ...update.styles } } : el,
        );
      }
      return {
        ...s,
        bodyStyles: action.payload.bodyStyles
          ? { ...s.bodyStyles, ...action.payload.bodyStyles }
          : s.bodyStyles,
        elements: newElements,
      };
    }

    case "ADD_ELEMENT": {
      const s = withHistory(state);
      const tag = action.payload;
      const selectedEl = s.selectedId ? s.elements.find(e => e.id === s.selectedId) : null;
      const parentId = (selectedEl && CONTAINER_TAGS.has(selectedEl.tag)) ? selectedEl.id : null;
      const siblings = s.elements.filter(e => (e.parentId ?? null) === parentId);
      const maxOrder = siblings.reduce((m, e) => Math.max(m, e.order ?? 0), -1);
      const el: LabElement = {
        id: genId(),
        tag,
        attrs: { id: "", class: "", ...(TAG_ATTRS[tag] || {}) },
        styles: { ...(TAG_DEFAULTS[tag] || TAG_DEFAULTS.div) },
        content: TAG_CONTENT[tag] ?? "",
        parentId,
        order: maxOrder + 1,
        mediaQueries: [],
      };
      return { ...s, elements: [...s.elements, el], selectedId: el.id };
    }

    case "DELETE_ELEMENT": {
      const s = withHistory(state);
      const toDelete = new Set([action.payload, ...getDescendants(s.elements, action.payload)]);
      return {
        ...s,
        elements: s.elements.filter((e) => !toDelete.has(e.id)),
        selectedId: (state.selectedId !== null && toDelete.has(state.selectedId)) ? null : state.selectedId,
      };
    }

    case "SELECT":
      return { ...state, selectedId: action.payload };

    case "PUSH_HISTORY":
      return withHistory(state);

    case "NEST_ELEMENT": {
      const { childId, parentId, order } = action.payload;
      if (childId === parentId) return state;
      const descendants = getDescendants(state.elements, childId);
      if (descendants.has(parentId)) return state;
      const parent = state.elements.find((e) => e.id === parentId);
      if (!parent || !CONTAINER_TAGS.has(parent.tag)) return state;

      const s = withHistory(state);
      const siblings = s.elements
        .filter((e) => e.parentId === parentId && e.id !== childId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const targetOrder = order ?? siblings.length;
      const reordered = siblings.map((e, i) => ({ ...e, order: i >= targetOrder ? i + 1 : i }));

      return {
        ...s,
        elements: s.elements.map((e) => {
          if (e.id === childId) return { ...e, parentId, order: targetOrder };
          const r = reordered.find((r) => r.id === e.id);
          return r ?? e;
        }),
        selectedId: childId,
      };
    }

    case "MOVE_TO_ROOT": {
      const { id, order } = action.payload;
      const s = withHistory(state);
      const rootEls = s.elements
        .filter((e) => !e.parentId && e.id !== id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const targetOrder = order ?? rootEls.length;
      const reordered = rootEls.map((e, i) => ({ ...e, order: i >= targetOrder ? i + 1 : i }));
      return {
        ...s,
        elements: s.elements.map((e) => {
          if (e.id === id) return { ...e, parentId: null, order: targetOrder };
          const r = reordered.find((r) => r.id === e.id);
          return r ?? e;
        }),
      };
    }

    case "REORDER_ELEMENT": {
      const { id, parentId, order } = action.payload;
      const s = withHistory(state);
      const siblings = s.elements
        .filter((e) => e.parentId === (parentId || null) && e.id !== id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const targetOrder = Math.max(0, Math.min(order, siblings.length));
      const reordered = siblings.map((e, i) => ({ ...e, order: i >= targetOrder ? i + 1 : i }));
      return {
        ...s,
        elements: s.elements.map((e) => {
          if (e.id === id) return { ...e, parentId: parentId || null, order: targetOrder };
          const r = reordered.find((r) => r.id === e.id);
          return r ?? e;
        }),
      };
    }

    case "DUPLICATE_ELEMENT": {
      // Ctrl/Alt+drag in the Tree — clone the dragged subtree (fresh ids
      // throughout, so the clone's own descendants still point at each
      // other correctly) and insert the clone at the drop target, leaving
      // the original untouched. Unlike NEST_ELEMENT/REORDER_ELEMENT there's
      // no move-within-same-parent-vs-different-parent distinction to make:
      // inserting a brand-new clone at (parentId, order) is the same
      // operation either way.
      const { id, parentId, order } = action.payload;
      const source = state.elements.find((e) => e.id === id);
      if (!source) return state;
      if (parentId !== null) {
        const parent = state.elements.find((e) => e.id === parentId);
        if (!parent || !CONTAINER_TAGS.has(parent.tag)) return state;
      }

      const s = withHistory(state);
      const subtreeIds = getDescendants(s.elements, id);
      subtreeIds.add(id);
      const subtree = s.elements.filter((e) => subtreeIds.has(e.id));

      const idMap = new Map<string, string>();
      subtree.forEach((el) => idMap.set(el.id, genId()));

      const siblings = s.elements
        .filter((e) => (e.parentId ?? null) === parentId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const targetOrder = Math.max(0, Math.min(order, siblings.length));
      const shiftedSiblings = siblings.map((e, i) => ({ ...e, order: i >= targetOrder ? i + 1 : i }));

      const clones: LabElement[] = subtree.map((el) => {
        // A copied HTML `id` attribute would collide with the original the
        // moment both render on the same page — getElementById, #id
        // selectors, and label[for] would all now only ever find one of them.
        const attrs = el.attrs?.id ? { ...el.attrs, id: "" } : el.attrs;
        return {
          ...el,
          id: idMap.get(el.id)!,
          attrs,
          parentId: el.id === id ? parentId : (el.parentId ? (idMap.get(el.parentId) ?? el.parentId) : null),
          order: el.id === id ? targetOrder : el.order,
        };
      });

      return {
        ...s,
        elements: [
          ...s.elements.map((e) => shiftedSiblings.find((r) => r.id === e.id) ?? e),
          ...clones,
        ],
        selectedId: idMap.get(id)!,
      };
    }

    case "RESIZE_ELEMENT": {
      const { id, w, h } = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) =>
          e.id === id ? { ...e, styles: { ...e.styles, width: w + "px", height: h + "px" } } : e,
        ),
      };
    }

    case "UPDATE_STYLE": {
      const { prop, value } = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) => {
          if (e.id !== state.selectedId) return e;
          const s2 = { ...e.styles };
          if (value === "") delete s2[prop];
          else s2[prop] = value;
          return { ...e, styles: s2 };
        }),
      };
    }

    case "UPDATE_MULTI_STYLE": {
      const { ids, prop, value } = action.payload;
      const idSet = new Set(ids);
      const s = withHistory(state);
      return {
        ...s,
        elements: s.elements.map((e) => {
          if (!idSet.has(e.id)) return e;
          const s2 = { ...e.styles };
          if (value === "") delete s2[prop];
          else s2[prop] = value;
          return { ...e, styles: s2 };
        }),
      };
    }

    case "APPLY_PRESET":
      return {
        ...state,
        elements: state.elements.map((e) =>
          e.id === state.selectedId
            ? { ...e, styles: { ...e.styles, ...action.payload } }
            : e,
        ),
      };

    case "ADD_MEDIA_QUERY": {
      const { breakpoint, prop, value } = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) => {
          if (e.id !== state.selectedId) return e;
          return { ...e, mediaQueries: [...(e.mediaQueries || []), { breakpoint, prop, value }] };
        }),
      };
    }

    case "REMOVE_MEDIA_QUERY": {
      const index = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) => {
          if (e.id !== state.selectedId) return e;
          return { ...e, mediaQueries: (e.mediaQueries || []).filter((_, i) => i !== index) };
        }),
      };
    }

    case "UPDATE_CONTENT":
      return {
        ...state,
        elements: state.elements.map((e) =>
          e.id === state.selectedId ? { ...e, content: action.payload } : e,
        ),
      };

    case "UPDATE_TAG": {
      const s = withHistory(state);
      return {
        ...s,
        elements: s.elements.map((e) =>
          e.id === s.selectedId ? { ...e, tag: action.payload } : e,
        ),
      };
    }

    case "UPDATE_ATTR": {
      const { prop, value } = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) => {
          if (e.id !== state.selectedId) return e;
          const attrs = { ...(e.attrs || {}) };
          attrs[prop] = value;
          return { ...e, attrs };
        }),
      };
    }

    case "SET_FROM_CODE": {
      const s = withHistory(state);
      const nextElements = action.payload;
      const selectedStillExists = nextElements.some((el) => el.id === state.selectedId);
      return { ...s, elements: nextElements, selectedId: selectedStillExists ? state.selectedId : null };
    }

    case "UPDATE_BODY_STYLE": {
      const { prop, value } = action.payload;
      const bodyStyles = { ...state.bodyStyles };
      if (value === "") delete bodyStyles[prop];
      else bodyStyles[prop] = value;
      return { ...state, bodyStyles };
    }

    case "SET_FROM_CSS": {
      const s = withHistory(state);
      const bodyStyles = action.payload.bodyStyles ?? s.bodyStyles;
      return {
        ...s,
        elements: action.payload.elements,
        customCss: action.payload.customCss,
        bodyStyles,
        bodyTheme: action.payload.bodyStyles ? inferBodyTheme(bodyStyles) : s.bodyTheme,
      };
    }

    case "SET_JAVASCRIPT":
      return { ...state, javascript: action.payload };

    case "SET_CUSTOM_CSS":
      return { ...state, customCss: action.payload };

    case "TOGGLE_OVERLAY":
      return { ...state, showOverlay: !state.showOverlay };

    case "TOGGLE_LABELS":
      return { ...state, showLabels: !state.showLabels };

    case "INSERT_TEMPLATE": {
      const s = withHistory(state);
      const templateElements = Array.isArray(action.payload) ? action.payload : action.payload.template;
      const autoTheme = Array.isArray(action.payload) ? null : (action.payload.autoTheme ?? null);

      const selectedEl = s.selectedId ? s.elements.find(e => e.id === s.selectedId) : null;
      const insertParentId = (selectedEl && CONTAINER_TAGS.has(selectedEl.tag)) ? selectedEl.id : null;

      const idMap = new Map<string, string>();
      templateElements.forEach(el => idMap.set(el.id, genId()));

      const rootOffset = s.elements
        .filter(e => (e.parentId ?? null) === insertParentId)
        .reduce((m, e) => Math.max(m, e.order ?? 0), -1) + 1;

      let newElements: LabElement[] = templateElements.map(el => ({
        ...el,
        id: idMap.get(el.id)!,
        parentId: el.parentId ? (idMap.get(el.parentId) ?? insertParentId) : insertParentId,
        order: el.parentId ? el.order : (el.order ?? 0) + rootOffset,
      }));

      const firstRoot = newElements.find(e => {
        const orig = templateElements.find(t => idMap.get(t.id) === e.id);
        return orig && !orig.parentId;
      });

      if (autoTheme && firstRoot) {
        const children = newElements
          .filter(e => e.parentId === firstRoot.id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const styleMap = new Map<string, Record<string, string>>();
        if (autoTheme.parentStyles) styleMap.set(firstRoot.id, autoTheme.parentStyles);
        children.forEach((child, i) => {
          const indexStyles = autoTheme.childStylesByIndex?.[i];
          const tagStyles   = autoTheme.childStylesByTag?.[child.tag];
          const merged = { ...(tagStyles || {}), ...(indexStyles || {}) };
          if (Object.keys(merged).length > 0) styleMap.set(child.id, merged);
        });

        newElements = newElements.map(el => {
          const update = styleMap.get(el.id);
          return update ? { ...el, styles: { ...el.styles, ...update } } : el;
        });
      }

      return {
        ...s,
        elements: [...s.elements, ...newElements],
        selectedId: firstRoot?.id ?? null,
      };
    }

    case "APPLY_COMPONENT_THEME": {
      const { updates } = action.payload;
      return {
        ...state,
        elements: state.elements.map(el => {
          const update = updates.find(u => u.id === el.id);
          if (!update) return el;
          return { ...el, styles: { ...el.styles, ...update.styles } };
        }),
      };
    }

    case "SET_COLOR_MODE": {
      const s = withHistory(state);
      const bodyTheme: BodyThemeState = { ...s.bodyTheme, colorMode: action.payload };
      const bodyStyles = computeBodyStyles(bodyTheme);
      const elements = cascadeBodyTheme(s.elements, bodyStyles);
      const mode = bodyTheme.glass ? "glass" : action.payload;
      return { ...s, bodyTheme, bodyStyles, elements: applyStyleUpdates(elements, cascadeComponentThemes(elements, mode)) };
    }

    case "TOGGLE_GLASS": {
      const s = withHistory(state);
      const bodyTheme: BodyThemeState = { ...s.bodyTheme, glass: !s.bodyTheme.glass };
      const bodyStyles = computeBodyStyles(bodyTheme);
      const elements = cascadeBodyTheme(s.elements, bodyStyles);
      const mode = bodyTheme.glass ? "glass" : bodyTheme.colorMode;
      return { ...s, bodyTheme, bodyStyles, elements: applyStyleUpdates(elements, cascadeComponentThemes(elements, mode)) };
    }

    case "TOGGLE_CENTERED": {
      const s = withHistory(state);
      const bodyTheme: BodyThemeState = { ...s.bodyTheme, centered: !s.bodyTheme.centered };
      return { ...s, bodyTheme, bodyStyles: computeBodyStyles(bodyTheme) };
    }

    case "RESET_BODY_THEME": {
      const s = withHistory(state);
      return { ...s, bodyTheme: DEFAULT_BODY_THEME, bodyStyles: computeBodyStyles(DEFAULT_BODY_THEME) };
    }

    case "UNDO": {
      if (!state.history.length) return state;
      const history = [...state.history];
      const elements = history.pop()!;
      return { ...state, elements, history, selectedId: null };
    }

    case "CLEAR": {
      const s = withHistory(state);
      return { ...s, elements: [], selectedId: null };
    }

    case "TOGGLE_MULTIPAGE": {
      if (state.mode === "single") {
        const p1: LabPage = { id: "pg" + Date.now(), name: "Home", elements: state.elements, bodyStyles: state.bodyStyles, javascript: state.javascript, customCss: state.customCss };
        const p2 = blankPage("Page 2", 1);
        return { ...state, mode: "multi", pages: [p1, p2], activePageId: p1.id, history: [] };
      } else {
        const updatedPages = saveActivePage(state);
        const mergedElements = updatedPages.flatMap((p) => p.elements);
        const mergedJs  = updatedPages.map((p) => p.javascript).filter(Boolean).join("\n\n");
        const mergedCss = updatedPages.map((p) => p.customCss).filter(Boolean).join("\n\n");
        const first = updatedPages[0];
        return { ...state, mode: "single", pages: [], activePageId: null, elements: mergedElements, bodyStyles: first?.bodyStyles ?? state.bodyStyles, javascript: mergedJs, customCss: mergedCss, selectedId: null, history: [] };
      }
    }

    case "SWITCH_PAGE": {
      if (action.payload === state.activePageId) return state;
      const updatedPages = saveActivePage(state);
      const next = updatedPages.find((p) => p.id === action.payload);
      if (!next) return state;
      return { ...state, pages: updatedPages, activePageId: action.payload, elements: next.elements, bodyStyles: next.bodyStyles, javascript: next.javascript, customCss: next.customCss || "", selectedId: null, history: [] };
    }

    case "ADD_PAGE": {
      const updatedPages = saveActivePage(state);
      const page = blankPage(action.payload ?? `Page ${updatedPages.length + 1}`, 0);
      return { ...state, pages: [...updatedPages, page], activePageId: page.id, elements: page.elements, bodyStyles: page.bodyStyles, javascript: page.javascript, customCss: "", selectedId: null, history: [] };
    }

    case "DELETE_PAGE": {
      if (state.pages.length <= 1) return state;
      const updatedPages = saveActivePage(state);
      const idx = updatedPages.findIndex((p) => p.id === action.payload);
      const remaining = updatedPages.filter((p) => p.id !== action.payload);
      const needSwitch = action.payload === state.activePageId;
      const newActive = needSwitch ? remaining[Math.max(0, idx - 1)] : undefined;
      return {
        ...state,
        pages: remaining,
        ...(needSwitch && newActive ? {
          activePageId: newActive.id,
          elements: newActive.elements,
          bodyStyles: newActive.bodyStyles,
          javascript: newActive.javascript,
          customCss: newActive.customCss || "",
          selectedId: null,
          history: [],
        } : {}),
      };
    }

    case "RENAME_PAGE":
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === action.payload.id ? { ...p, name: action.payload.name } : p,
        ),
      };

    default:
      return state;
  }
}
