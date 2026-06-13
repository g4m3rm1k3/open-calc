// ─── Default styles per tag ──────────────────────────────────────────────────
const TAG_DEFAULTS = {
  div: {
    width: "160px", height: "80px", backgroundColor: "#dbeafe",
    padding: "8px", margin: "8px", border: "1px solid #93c5fd",
    borderRadius: "4px", display: "block",
  },
  p: {
    width: "200px", fontSize: "14px", color: "#1a1a18",
    margin: "8px", padding: "4px", display: "block",
  },
  h1: {
    width: "240px", fontSize: "28px", fontWeight: "600",
    color: "#1a1a18", margin: "8px", padding: "4px", display: "block",
  },
  h2: {
    width: "220px", fontSize: "20px", fontWeight: "500",
    color: "#1a1a18", margin: "8px", padding: "4px", display: "block",
  },
  h3: {
    width: "200px", fontSize: "16px", fontWeight: "500",
    color: "#1a1a18", margin: "8px", padding: "4px", display: "block",
  },
  button: {
    padding: "8px 16px", backgroundColor: "#1d4ed8", color: "#ffffff",
    border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer",
    display: "inline-block",
  },
  span: {
    padding: "4px 10px", backgroundColor: "#dcfce7", color: "#166534",
    borderRadius: "4px", fontSize: "13px", display: "inline-block",
  },
  img: {
    width: "120px", height: "80px", backgroundColor: "#e5e7eb",
    border: "1px solid #d1d5db", borderRadius: "4px", display: "block",
  },
  ul: {
    width: "180px", padding: "8px 8px 8px 24px", margin: "8px",
    border: "1px dashed #d1d5db", display: "block",
  },
  a: {
    color: "#1d4ed8", textDecoration: "underline",
    fontSize: "14px", display: "inline-block",
  },
};

const TAG_CONTENT = {
  div: "", p: "Paragraph text", h1: "Heading 1", h2: "Heading 2",
  h3: "Heading 3", button: "Click me", span: "Span text",
  img: "", ul: "List item", a: "Link text",
};

let _idCounter = 1;
function genId() { return "el" + (_idCounter++); }

function scatter(index) {
  return {
    left: 20 + (index % 5) * 40 + Math.floor(index / 5) * 10,
    top: 20 + (index % 4) * 30 + Math.floor(index / 4) * 20,
  };
}

// ─── Initial state ────────────────────────────────────────────────────────────
export const initialState = {
  elements: [],
  selectedId: null,
  showOverlay: false,
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

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function labReducer(state, action) {
  switch (action.type) {

    case "ADD_ELEMENT": {
      const s = withHistory(state);
      const tag = action.payload;
      const pos = scatter(s.elements.length);
      const el = {
        id: genId(),
        tag,
        styles: { ...TAG_DEFAULTS[tag] || TAG_DEFAULTS.div },
        content: TAG_CONTENT[tag] ?? "",
        x: pos.left,
        y: pos.top,
      };
      return { ...s, elements: [...s.elements, el], selectedId: el.id };
    }

    case "DELETE_ELEMENT": {
      const s = withHistory(state);
      return {
        ...s,
        elements: s.elements.filter((e) => e.id !== action.payload),
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
      };
    }

    case "SELECT":
      return { ...state, selectedId: action.payload };

    case "PUSH_HISTORY":
      return withHistory(state);

    case "MOVE_ELEMENT": {
      const { id, x, y } = action.payload;
      return {
        ...state,
        elements: state.elements.map((e) =>
          e.id === id ? { ...e, x, y } : e
        ),
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
          const styles = { ...e.styles };
          if (value === "") delete styles[prop];
          else styles[prop] = value;
          return { ...e, styles };
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

    case "SET_FROM_CODE": {
      const s = withHistory(state);
      return { ...s, elements: action.payload, selectedId: null };
    }

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
