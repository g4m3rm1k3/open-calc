// ─── Default styles per tag ──────────────────────────────────────────────────
const TAG_DEFAULTS = {
  div: {
    padding: "24px",
    margin: "0 0 16px 0",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    minHeight: "60px",
    display: "block",
  },
  p: {
    fontSize: "16px",
    color: "#475569",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
    display: "block",
  },
  h1: {
    fontSize: "40px",
    fontWeight: "700",
    margin: "0 0 24px 0",
    lineHeight: "1.2",
    display: "block",
  },
  h2: {
    fontSize: "32px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    lineHeight: "1.3",
    display: "block",
  },
  h3: {
    fontSize: "24px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    lineHeight: "1.4",
    display: "block",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "inline-block",
    margin: "0 8px 0 0",
  },
  span: {
    display: "inline",
    color: "inherit",
  },
  img: {
    width: "100%",
    maxWidth: "400px",
    height: "auto",
    backgroundColor: "#f1f5f9",
    borderRadius: "8px",
    display: "block",
    margin: "0 0 16px 0",
  },
  ul: {
    padding: "0 0 0 24px",
    margin: "0 0 16px 0",
    display: "block",
    color: "#475569",
  },
  li: {
    fontSize: "16px",
    lineHeight: "1.6",
    display: "list-item",
    margin: "0 0 8px 0",
  },
  a: {
    color: "#3b82f6",
    textDecoration: "underline",
    display: "inline",
    cursor: "pointer",
  },
  section: {
    padding: "48px 24px",
    margin: "0",
    display: "block",
    minHeight: "100px",
    backgroundColor: "transparent",
  },
  article: {
    padding: "32px",
    margin: "0 0 24px 0",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    display: "block",
  },
  header: {
    padding: "24px",
    margin: "0",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    display: "block",
  },
  footer: {
    padding: "32px 24px",
    margin: "0",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    display: "block",
  },
};

const TAG_CONTENT = {
  div: "",
  p: "Paragraph text",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  button: "Click me",
  span: "Span text",
  img: "",
  ul: "",
  li: "List item",
  a: "Link text",
  section: "",
  article: "",
  header: "",
  footer: "",
};

const TAG_ATTRS = {
  a: { href: "#", target: "" },
  img: { src: "", alt: "Image" },
  button: { type: "button" },
};

// Tags that can contain children
export const CONTAINER_TAGS = new Set([
  "div",
  "section",
  "article",
  "header",
  "footer",
  "nav",
  "ul",
  "li",
  "p",
  "span",
]);

let _idCounter = 1;
function genId() {
  return "el" + _idCounter++;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export const initialState = {
  elements: [],
  selectedId: null,
  showOverlay: false,
  showLabels: true,
  customCss: "",
  javascript: "",
  history: [],
  bodyStyles: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#1a1a18",
    backgroundColor: "#ffffff",
    margin: "0",
    padding: "0",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cloneElements(elements) {
  return JSON.parse(JSON.stringify(elements));
}

function withHistory(state) {
  const history = [...state.history, cloneElements(state.elements)];
  return { ...state, history: history.slice(-40) };
}

// Get all descendant IDs of a given element
function getDescendants(elements, id) {
  const result = new Set();
  const queue = [id];
  while (queue.length) {
    const cur = queue.shift();
    const children = elements.filter((e) => e.parentId === cur);
    for (const c of children) {
      result.add(c.id);
      queue.push(c.id);
    }
  }
  return result;
}

// ─── Dark/light cascade helpers ───────────────────────────────────────────────
function hexLum(hex) {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return 0.5;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Returns saturation (0–1) for a hex color — high saturation = brand/accent color, skip swapping
function hexSat(hex) {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return 1;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  return max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
}

// Cascade body theme change to all child elements.
// Uses luminance + saturation: only swaps neutral greys/near-whites/near-blacks.
// Brand/accent colors (blues, greens, reds — high saturation) are left untouched.
function cascadeBodyTheme(elements, newBodyStyles) {
  const rawBg = newBodyStyles.backgroundColor || newBodyStyles.background || "";
  if (!rawBg.startsWith("#")) return elements; // gradient — skip

  const goingDark = hexLum(rawBg) < 0.35;
  const primaryText = goingDark ? "#f8fafc" : "#0f172a";
  const secondaryText = goingDark ? "#94a3b8" : "#64748b";

  return elements.map((el) => {
    const s = { ...el.styles };
    let changed = false;

    // Swap text color if it's a neutral (low-sat) color on the wrong end of the luminance scale
    if (s.color && s.color.startsWith("#") && s.color.length >= 7 && hexSat(s.color) < 0.25) {
      const lum = hexLum(s.color);
      if (goingDark && lum < 0.40) {
        s.color = lum < 0.20 ? primaryText : secondaryText;
        changed = true;
      } else if (!goingDark && lum > 0.60) {
        s.color = lum > 0.85 ? primaryText : secondaryText;
        changed = true;
      }
    }

    // Swap background color if neutral and on the wrong end
    if (s.backgroundColor && s.backgroundColor.startsWith("#") && s.backgroundColor.length >= 7 && hexSat(s.backgroundColor) < 0.20) {
      const lum = hexLum(s.backgroundColor);
      if (goingDark && lum > 0.60) {
        s.backgroundColor = lum > 0.95 ? "#1e293b" : lum > 0.85 ? "#0f172a" : "#334155";
        changed = true;
      } else if (!goingDark && lum < 0.35) {
        s.backgroundColor = lum < 0.10 ? "#ffffff" : lum < 0.20 ? "#f8fafc" : "#f1f5f9";
        changed = true;
      }
    }

    return changed ? { ...el, styles: s } : el;
  });
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function labReducer(state, action) {
  switch (action.type) {
    case "LOAD_EXAMPLE": {
      const s = withHistory(state);
      return {
        ...s,
        elements: action.payload.elements,
        bodyStyles: action.payload.bodyStyles,
        javascript: action.payload.javascript ?? "",
        selectedId: null,
      };
    }

    case "APPLY_GLOBAL_THEME": {
      const s = withHistory(state);

      let newElements = [...s.elements];
      for (const update of action.payload.updates) {
        newElements = newElements.map(el =>
          el.id === update.id ? { ...el, styles: { ...el.styles, ...update.styles } } : el
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

      // If a container element is selected, add inside it; otherwise add to root
      const selectedEl = s.selectedId ? s.elements.find(e => e.id === s.selectedId) : null;
      const parentId = (selectedEl && CONTAINER_TAGS.has(selectedEl.tag)) ? selectedEl.id : null;

      const siblings = s.elements.filter(e => (e.parentId ?? null) === parentId);
      const maxOrder = siblings.reduce((m, e) => Math.max(m, e.order ?? 0), -1);

      const el = {
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
      const toDelete = new Set([
        action.payload,
        ...getDescendants(s.elements, action.payload),
      ]);
      return {
        ...s,
        elements: s.elements.filter((e) => !toDelete.has(e.id)),
        selectedId: toDelete.has(state.selectedId) ? null : state.selectedId,
      };
    }

    case "SELECT":
      return { ...state, selectedId: action.payload };

    case "PUSH_HISTORY":
      return withHistory(state);

    // Nest element inside a container, at a given position (order)
    case "NEST_ELEMENT": {
      const { childId, parentId, order } = action.payload;
      if (childId === parentId) return state;
      const descendants = getDescendants(state.elements, childId);
      if (descendants.has(parentId)) return state; // would be circular
      const parent = state.elements.find((e) => e.id === parentId);
      if (!parent || !CONTAINER_TAGS.has(parent.tag)) return state;

      const s = withHistory(state);
      // Shift siblings to make room
      const siblings = s.elements
        .filter((e) => e.parentId === parentId && e.id !== childId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const targetOrder = order ?? siblings.length;
      const reordered = siblings.map((e, i) => ({
        ...e,
        order: i >= targetOrder ? i + 1 : i,
      }));

      return {
        ...s,
        elements: s.elements.map((e) => {
          if (e.id === childId) return { ...e, parentId, order: targetOrder };
          const r = reordered.find((r) => r.id === e.id);
          return r || e;
        }),
        selectedId: childId,
      };
    }

    // Move element to root or different parent
    case "MOVE_TO_ROOT": {
      const { id, order } = action.payload;
      const s = withHistory(state);
      const rootEls = s.elements
        .filter((e) => !e.parentId && e.id !== id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const targetOrder = order ?? rootEls.length;
      const reordered = rootEls.map((e, i) => ({
        ...e,
        order: i >= targetOrder ? i + 1 : i,
      }));
      return {
        ...s,
        elements: s.elements.map((e) => {
          if (e.id === id) return { ...e, parentId: null, order: targetOrder };
          const r = reordered.find((r) => r.id === e.id);
          return r || e;
        }),
      };
    }

    // Reorder within same parent
    case "REORDER_ELEMENT": {
      const { id, parentId, order } = action.payload;
      const s = withHistory(state);
      const siblings = s.elements
        .filter((e) => e.parentId === (parentId || null) && e.id !== id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const targetOrder = Math.max(0, Math.min(order, siblings.length));
      const reordered = siblings.map((e, i) => ({
        ...e,
        order: i >= targetOrder ? i + 1 : i,
      }));
      return {
        ...s,
        elements: s.elements.map((e) => {
          if (e.id === id)
            return { ...e, parentId: parentId || null, order: targetOrder };
          const r = reordered.find((r) => r.id === e.id);
          return r || e;
        }),
      };
    }

    case "RESIZE_ELEMENT": {
      const { id, w, h } = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) =>
          e.id === id
            ? {
                ...e,
                styles: { ...e.styles, width: w + "px", height: h + "px" },
              }
            : e,
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

    case "APPLY_PRESET": {
      const presetStyles = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) =>
          e.id === state.selectedId
            ? { ...e, styles: { ...e.styles, ...presetStyles } }
            : e,
        ),
      };
    }

    case "ADD_MEDIA_QUERY": {
      const { breakpoint, prop, value } = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) => {
          if (e.id !== state.selectedId) return e;
          return {
            ...e,
            mediaQueries: [
              ...(e.mediaQueries || []),
              { breakpoint, prop, value },
            ],
          };
        }),
      };
    }

    case "REMOVE_MEDIA_QUERY": {
      const index = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) => {
          if (e.id !== state.selectedId) return e;
          const mqs = (e.mediaQueries || []).filter((_, i) => i !== index);
          return { ...e, mediaQueries: mqs };
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
      const selectedStillExists = nextElements.some(
        (el) => el.id === state.selectedId,
      );
      return {
        ...s,
        elements: nextElements,
        selectedId: selectedStillExists ? state.selectedId : null,
      };
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
      return {
        ...s,
        elements: action.payload.elements,
        customCss: action.payload.customCss,
        bodyStyles: action.payload.bodyStyles ?? s.bodyStyles,
      };
    }

    case "SET_JAVASCRIPT":
      return {
        ...state,
        javascript: action.payload,
      };

    case "SET_CUSTOM_CSS":
      return {
        ...state,
        customCss: action.payload,
      };

    case "TOGGLE_OVERLAY":
      return { ...state, showOverlay: !state.showOverlay };

    case "TOGGLE_LABELS":
      return { ...state, showLabels: !state.showLabels };

    // Insert a component template — remaps all template IDs to fresh ones.
    // Payload: { template: el[], autoTheme?: themeObject } or bare el[] (legacy)
    case "INSERT_TEMPLATE": {
      const s = withHistory(state);
      const templateElements = Array.isArray(action.payload) ? action.payload : action.payload.template;
      const autoTheme = Array.isArray(action.payload) ? null : action.payload.autoTheme;

      // If a container is selected, insert inside it; otherwise insert at root
      const selectedEl = s.selectedId ? s.elements.find(e => e.id === s.selectedId) : null;
      const insertParentId = (selectedEl && CONTAINER_TAGS.has(selectedEl.tag)) ? selectedEl.id : null;

      const idMap = new Map();
      templateElements.forEach(el => idMap.set(el.id, genId()));

      const rootOffset = s.elements
        .filter(e => (e.parentId ?? null) === insertParentId)
        .reduce((m, e) => Math.max(m, e.order ?? 0), -1) + 1;

      let newElements = templateElements.map(el => ({
        ...el,
        id: idMap.get(el.id),
        parentId: el.parentId ? idMap.get(el.parentId) : insertParentId,
        order: el.parentId ? el.order : el.order + rootOffset,
      }));

      // Find the root element of this template (no template-parentId)
      const firstRoot = newElements.find(e => {
        const orig = templateElements.find(t => idMap.get(t.id) === e.id);
        return orig && !orig.parentId;
      });

      // Auto-apply a theme to the inserted elements (e.g. dark theme on dark body)
      if (autoTheme && firstRoot) {
        const children = newElements
          .filter(e => e.parentId === firstRoot.id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const styleMap = new Map();
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

    // Apply a component theme — merges styles onto matched elements
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

    // Apply a body theme — merges on top of existing and cascades colors to elements
    case "APPLY_BODY_THEME": {
      const s = withHistory(state);
      const newBodyStyles = { ...s.bodyStyles, ...action.payload };
      const hasBgChange = "backgroundColor" in action.payload || "background" in action.payload;
      const newElements = hasBgChange ? cascadeBodyTheme(s.elements, newBodyStyles) : s.elements;
      return { ...s, bodyStyles: newBodyStyles, elements: newElements };
    }

    // Hard-reset body styles back to defaults
    case "RESET_BODY_STYLES":
      return {
        ...state,
        bodyStyles: {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "16px",
          lineHeight: "1.5",
          color: "#1a1a18",
          backgroundColor: "#ffffff",
          margin: "0",
          padding: "0",
        },
      };

    case "UNDO": {
      if (!state.history.length) return state;
      const history = [...state.history];
      const elements = history.pop();
      return { ...state, elements, history, selectedId: null };
    }

    case "CLEAR": {
      const s = withHistory(state);
      return { ...s, elements: [], selectedId: null };
    }

    default:
      return state;
  }
}
