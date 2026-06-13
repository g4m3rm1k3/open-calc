// ─── Default styles per tag ──────────────────────────────────────────────────
const TAG_DEFAULTS = {
  div: {
    backgroundColor: "#dbeafe",
    padding: "12px",
    margin: "8px",
    border: "1px solid #93c5fd",
    borderRadius: "4px",
    minHeight: "60px",
    display: "block",
  },
  p: {
    fontSize: "14px", color: "#1a1a18",
    margin: "8px 0", padding: "4px", display: "block",
  },
  h1: {
    fontSize: "28px", fontWeight: "600",
    color: "#1a1a18", margin: "8px 0", padding: "4px", display: "block",
  },
  h2: {
    fontSize: "20px", fontWeight: "500",
    color: "#1a1a18", margin: "8px 0", padding: "4px", display: "block",
  },
  h3: {
    fontSize: "16px", fontWeight: "500",
    color: "#1a1a18", margin: "8px 0", padding: "4px", display: "block",
  },
  button: {
    padding: "8px 16px", backgroundColor: "#1d4ed8", color: "#ffffff",
    border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer",
    display: "inline-block", margin: "4px",
  },
  span: {
    padding: "4px 10px", backgroundColor: "#dcfce7", color: "#166534",
    borderRadius: "4px", fontSize: "13px", display: "inline-block", margin: "4px",
  },
  img: {
    width: "120px", height: "80px", backgroundColor: "#e5e7eb",
    border: "1px solid #d1d5db", borderRadius: "4px", display: "block", margin: "8px 0",
  },
  ul: {
    padding: "8px 8px 8px 24px", margin: "8px 0",
    border: "1px dashed #d1d5db", display: "block", minHeight: "40px",
  },
  li: {
    fontSize: "14px", color: "#1a1a18", padding: "2px 0", display: "list-item",
  },
  a: {
    color: "#1d4ed8", textDecoration: "underline",
    fontSize: "14px", display: "inline", margin: "0 2px",
  },
  section: {
    padding: "16px", margin: "8px 0", border: "1px solid #e5e7eb",
    borderRadius: "6px", display: "block", minHeight: "60px",
  },
  article: {
    padding: "16px", margin: "8px 0", backgroundColor: "#fafafa",
    border: "1px solid #e5e7eb", borderRadius: "6px", display: "block", minHeight: "60px",
  },
  header: {
    padding: "16px", margin: "0 0 8px", backgroundColor: "#f1f5f9",
    borderBottom: "2px solid #e2e8f0", display: "block", minHeight: "50px",
  },
  footer: {
    padding: "12px 16px", margin: "8px 0 0", backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0", display: "block",
  },
};

const TAG_CONTENT = {
  div: "", p: "Paragraph text", h1: "Heading 1", h2: "Heading 2",
  h3: "Heading 3", button: "Click me", span: "Span text",
  img: "", ul: "", li: "List item", a: "Link text",
  section: "", article: "", header: "", footer: "",
};

const TAG_ATTRS = {
  a: { href: "#", target: "" },
  img: { src: "", alt: "Image" },
  button: { type: "button" },
};

// Tags that can contain children
export const CONTAINER_TAGS = new Set([
  "div", "section", "article", "header", "footer", "ul", "p", "span",
]);

let _idCounter = 1;
function genId() { return "el" + (_idCounter++); }

// ─── Initial state ────────────────────────────────────────────────────────────
export const initialState = {
  elements: [],
  selectedId: null,
  showOverlay: false,
  customCss: "",
  javascript: "",
  history: [],
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

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function labReducer(state, action) {
  switch (action.type) {

    case "ADD_ELEMENT": {
      const s = withHistory(state);
      const tag = action.payload;
      // Find max order among root elements
      const rootEls = s.elements.filter((e) => !e.parentId);
      const maxOrder = rootEls.reduce((m, e) => Math.max(m, e.order ?? 0), -1);
      const el = {
        id: genId(),
        tag,
        attrs: { id: "", class: "", ...(TAG_ATTRS[tag] || {}) },
        styles: { ...TAG_DEFAULTS[tag] || TAG_DEFAULTS.div },
        content: TAG_CONTENT[tag] ?? "",
        parentId: null,
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
          if (e.id === id) return { ...e, parentId: parentId || null, order: targetOrder };
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
            ? { ...e, styles: { ...e.styles, width: w + "px", height: h + "px" } }
            : e
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

    case "APPLY_PRESET": {
      const presetStyles = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) =>
          e.id === state.selectedId
            ? { ...e, styles: { ...e.styles, ...presetStyles } }
            : e
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
            mediaQueries: [...(e.mediaQueries || []), { breakpoint, prop, value }],
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
          e.id === state.selectedId ? { ...e, content: action.payload } : e
        ),
      };

    case "UPDATE_TAG": {
      const s = withHistory(state);
      return {
        ...s,
        elements: s.elements.map((e) =>
          e.id === s.selectedId ? { ...e, tag: action.payload } : e
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
      return {
        ...s,
        elements: nextElements,
        selectedId: selectedStillExists ? state.selectedId : null,
      };
    }

    case "SET_FROM_CSS": {
      const s = withHistory(state);
      return {
        ...s,
        elements: action.payload.elements,
        customCss: action.payload.customCss,
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
