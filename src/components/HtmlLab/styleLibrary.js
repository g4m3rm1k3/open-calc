// ─── Component Presets ────────────────────────────────────────────────────────
// Full style sets applied as "styled components" – overwrites element styles
export const COMPONENT_PRESETS = [
  {
    key: "card",
    label: "Card",
    category: "Containers",
    styles: {
      display: "block", backgroundColor: "#ffffff", border: "1px solid #e5e7eb",
      borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
      padding: "20px", margin: "8px 0",
    },
  },
  {
    key: "card-dark",
    label: "Card Dark",
    category: "Containers",
    styles: {
      display: "block", backgroundColor: "#1e1e2e", border: "1px solid #313244",
      borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      padding: "20px", color: "#cdd6f4",
    },
  },
  {
    key: "hero",
    label: "Hero Section",
    category: "Containers",
    styles: {
      display: "block", padding: "64px 32px", backgroundColor: "#1e293b",
      color: "#f1f5f9", textAlign: "center", borderRadius: "12px", margin: "0 0 16px",
    },
  },
  {
    key: "navbar",
    label: "Nav Bar",
    category: "Containers",
    styles: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 24px", backgroundColor: "#1e293b", color: "#f1f5f9",
      borderBottom: "2px solid #334155", margin: "0 0 8px",
    },
  },
  {
    key: "flex-row",
    label: "Flex Row",
    category: "Containers",
    styles: {
      display: "flex", flexDirection: "row", alignItems: "center",
      gap: "12px", flexWrap: "wrap", padding: "8px",
    },
  },
  {
    key: "flex-col",
    label: "Flex Column",
    category: "Containers",
    styles: {
      display: "flex", flexDirection: "column", gap: "12px", padding: "8px",
    },
  },
  {
    key: "grid-2",
    label: "Grid 2-col",
    category: "Containers",
    styles: {
      display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", padding: "8px",
    },
  },
  {
    key: "grid-3",
    label: "Grid 3-col",
    category: "Containers",
    styles: {
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", padding: "8px",
    },
  },
  {
    key: "btn-primary",
    label: "Button Primary",
    category: "Buttons",
    styles: {
      display: "inline-block", padding: "10px 20px", backgroundColor: "#3b82f6",
      color: "#ffffff", border: "none", borderRadius: "8px",
      fontSize: "14px", fontWeight: "600", cursor: "pointer", margin: "4px",
    },
  },
  {
    key: "btn-outline",
    label: "Button Outline",
    category: "Buttons",
    styles: {
      display: "inline-block", padding: "9px 20px", backgroundColor: "transparent",
      color: "#3b82f6", border: "2px solid #3b82f6", borderRadius: "8px",
      fontSize: "14px", fontWeight: "600", cursor: "pointer", margin: "4px",
    },
  },
  {
    key: "btn-ghost",
    label: "Button Ghost",
    category: "Buttons",
    styles: {
      display: "inline-block", padding: "9px 20px", backgroundColor: "transparent",
      color: "#475569", border: "1px solid #e2e8f0", borderRadius: "8px",
      fontSize: "14px", fontWeight: "500", cursor: "pointer", margin: "4px",
    },
  },
  {
    key: "btn-danger",
    label: "Button Danger",
    category: "Buttons",
    styles: {
      display: "inline-block", padding: "10px 20px", backgroundColor: "#ef4444",
      color: "#ffffff", border: "none", borderRadius: "8px",
      fontSize: "14px", fontWeight: "600", cursor: "pointer", margin: "4px",
    },
  },
  {
    key: "badge",
    label: "Badge Blue",
    category: "Badges",
    styles: {
      display: "inline-block", padding: "3px 10px", backgroundColor: "#dbeafe",
      color: "#1d4ed8", borderRadius: "9999px", fontSize: "11px",
      fontWeight: "600", margin: "2px",
    },
  },
  {
    key: "badge-green",
    label: "Badge Green",
    category: "Badges",
    styles: {
      display: "inline-block", padding: "3px 10px", backgroundColor: "#dcfce7",
      color: "#166534", borderRadius: "9999px", fontSize: "11px",
      fontWeight: "600", margin: "2px",
    },
  },
  {
    key: "badge-red",
    label: "Badge Red",
    category: "Badges",
    styles: {
      display: "inline-block", padding: "3px 10px", backgroundColor: "#fee2e2",
      color: "#dc2626", borderRadius: "9999px", fontSize: "11px",
      fontWeight: "600", margin: "2px",
    },
  },
  {
    key: "pill",
    label: "Pill Tag",
    category: "Badges",
    styles: {
      display: "inline-block", padding: "4px 12px", backgroundColor: "#f1f5f9",
      color: "#475569", borderRadius: "9999px", fontSize: "12px",
      border: "1px solid #e2e8f0", margin: "2px",
    },
  },
  {
    key: "alert-info",
    label: "Alert Info",
    category: "Alerts",
    styles: {
      display: "block", padding: "12px 16px", backgroundColor: "#eff6ff",
      color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: "8px",
      fontSize: "14px", margin: "8px 0",
    },
  },
  {
    key: "alert-success",
    label: "Alert Success",
    category: "Alerts",
    styles: {
      display: "block", padding: "12px 16px", backgroundColor: "#f0fdf4",
      color: "#166534", border: "1px solid #bbf7d0", borderRadius: "8px",
      fontSize: "14px", margin: "8px 0",
    },
  },
  {
    key: "alert-warning",
    label: "Alert Warning",
    category: "Alerts",
    styles: {
      display: "block", padding: "12px 16px", backgroundColor: "#fffbeb",
      color: "#92400e", border: "1px solid #fde68a", borderRadius: "8px",
      fontSize: "14px", margin: "8px 0",
    },
  },
  {
    key: "alert-danger",
    label: "Alert Danger",
    category: "Alerts",
    styles: {
      display: "block", padding: "12px 16px", backgroundColor: "#fef2f2",
      color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px",
      fontSize: "14px", margin: "8px 0",
    },
  },
  {
    key: "code-block",
    label: "Code Block",
    category: "Typography",
    styles: {
      display: "block", padding: "16px", backgroundColor: "#1e1e1e",
      color: "#d4d4d4", borderRadius: "8px", fontFamily: "monospace",
      fontSize: "13px", border: "1px solid #3c3c3c", overflowX: "auto",
      whiteSpace: "pre", margin: "8px 0",
    },
  },
  {
    key: "heading-hero",
    label: "Heading Hero",
    category: "Typography",
    styles: {
      display: "block", fontSize: "48px", fontWeight: "700", lineHeight: "1.1",
      letterSpacing: "-0.02em", color: "#0f172a", margin: "0 0 12px",
    },
  },
  {
    key: "text-muted",
    label: "Text Muted",
    category: "Typography",
    styles: {
      display: "block", fontSize: "14px", color: "#64748b",
      lineHeight: "1.6", margin: "0 0 8px",
    },
  },
  {
    key: "avatar",
    label: "Avatar",
    category: "Media",
    styles: {
      display: "inline-block", width: "48px", height: "48px",
      borderRadius: "50%", backgroundColor: "#e5e7eb",
      border: "2px solid #d1d5db", overflow: "hidden", flexShrink: "0",
    },
  },
  {
    key: "img-cover",
    label: "Cover Image",
    category: "Media",
    styles: {
      display: "block", width: "100%", height: "200px",
      objectFit: "cover", borderRadius: "8px", backgroundColor: "#e5e7eb",
    },
  },
  {
    key: "divider",
    label: "Divider",
    category: "Layout",
    styles: {
      display: "block", height: "1px", backgroundColor: "#e5e7eb",
      margin: "16px 0", border: "none",
    },
  },
];

// ─── Per-property preset values ───────────────────────────────────────────────
// Used in the "picker" button next to each individual style field
export const PROP_PRESETS = {
  border: [
    "none",
    "1px solid #e5e7eb",
    "1px solid #d1d5db",
    "2px solid #3b82f6",
    "2px solid #10b981",
    "2px solid #ef4444",
    "1px dashed #9ca3af",
    "1px dashed #3b82f6",
    "3px solid #1e293b",
  ],
  borderTop: ["none", "1px solid #e5e7eb", "2px solid #3b82f6", "3px solid #1e293b"],
  borderRight: ["none", "1px solid #e5e7eb", "2px solid #3b82f6"],
  borderBottom: ["none", "1px solid #e5e7eb", "2px solid #3b82f6", "3px solid #1e293b"],
  borderLeft: [
    "none",
    "4px solid #3b82f6",
    "4px solid #10b981",
    "4px solid #f59e0b",
    "4px solid #ef4444",
  ],
  borderRadius: ["0", "4px", "6px", "8px", "12px", "16px", "24px", "50%", "9999px"],
  outline: ["none", "2px solid #3b82f6", "2px dashed #3b82f6", "3px solid #ef4444"],
  boxShadow: [
    "none",
    "0 1px 2px rgba(0,0,0,0.05)",
    "0 1px 3px rgba(0,0,0,0.1)",
    "0 4px 6px rgba(0,0,0,0.07)",
    "0 10px 15px rgba(0,0,0,0.1)",
    "0 20px 25px rgba(0,0,0,0.15)",
    "inset 0 2px 4px rgba(0,0,0,0.06)",
    "0 0 0 3px rgba(59,130,246,0.3)",
    "0 0 0 3px rgba(239,68,68,0.3)",
  ],
  backgroundColor: [
    "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0",
    "#dbeafe", "#dcfce7", "#fef3c7", "#fee2e2", "#f3e8ff",
    "#1e293b", "#0f172a",
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "transparent",
  ],
  backgroundImage: [
    "none",
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(180deg, #1e293b 0%, #334155 100%)",
    "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
  ],
  color: [
    "#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#94a3b8",
    "#ffffff", "#f1f5f9",
    "#1d4ed8", "#166534", "#92400e", "#dc2626", "#7c3aed",
  ],
  fontSize: [
    "11px", "12px", "13px", "14px", "16px", "18px", "20px", "24px",
    "28px", "32px", "40px", "48px",
    "0.75rem", "0.875rem", "1rem", "1.25rem", "1.5rem", "1.875rem", "2.25rem", "3rem",
  ],
  lineHeight: ["normal", "1", "1.25", "1.375", "1.5", "1.625", "2"],
  letterSpacing: ["normal", "-0.05em", "-0.025em", "0.025em", "0.05em", "0.1em"],
  gap: ["4px", "6px", "8px", "12px", "16px", "20px", "24px", "32px", "40px"],
  padding: [
    "0", "4px", "8px", "12px", "16px", "20px", "24px", "32px",
    "4px 8px", "8px 16px", "12px 24px", "16px 24px", "16px 32px",
  ],
  margin: ["0", "auto", "4px", "8px", "12px", "16px", "24px", "0 auto", "8px 0", "16px 0"],
  width: [
    "auto", "100%", "75%", "50%", "33%", "25%",
    "fit-content", "min-content", "max-content",
    "200px", "300px", "400px", "500px", "640px",
  ],
  height: ["auto", "100%", "fit-content", "100vh", "50vh", "40px", "48px", "64px", "120px", "200px", "300px"],
  minHeight: ["auto", "40px", "60px", "80px", "100px", "200px", "100vh", "50vh"],
  maxWidth: ["none", "640px", "768px", "1024px", "1280px", "100%", "fit-content"],
  opacity: ["1", "0.9", "0.75", "0.5", "0.25", "0"],
  transition: [
    "none",
    "all 0.15s ease",
    "all 0.2s ease",
    "all 0.3s ease",
    "opacity 0.2s ease",
    "transform 0.2s ease",
    "background-color 0.2s ease",
    "box-shadow 0.2s ease",
  ],
  transform: [
    "none",
    "translateY(-2px)",
    "translateY(2px)",
    "scale(1.05)",
    "scale(0.95)",
    "rotate(45deg)",
    "rotate(180deg)",
    "skewX(10deg)",
  ],
  cursor: ["default", "pointer", "text", "not-allowed", "grab", "crosshair", "zoom-in"],
  zIndex: ["auto", "0", "10", "20", "30", "40", "50"],
};

// ─── Breakpoints ──────────────────────────────────────────────────────────────
export const BREAKPOINTS = [
  { label: "sm  ≥ 640px",  value: "640px"  },
  { label: "md  ≥ 768px",  value: "768px"  },
  { label: "lg  ≥ 1024px", value: "1024px" },
  { label: "xl  ≥ 1280px", value: "1280px" },
  { label: "2xl ≥ 1536px", value: "1536px" },
  { label: "custom…",      value: ""        },
];

// ─── CSS property list (for media query builder autocomplete) ─────────────────
export const CSS_PROPS_LIST = [
  "display", "flexDirection", "alignItems", "justifyContent", "flexWrap", "gap",
  "gridTemplateColumns", "gridTemplateRows", "gridColumn", "gridRow",
  "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
  "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
  "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textAlign",
  "color", "backgroundColor", "backgroundImage", "backgroundSize",
  "border", "borderTop", "borderRight", "borderBottom", "borderLeft",
  "borderRadius", "boxShadow", "outline",
  "position", "top", "right", "bottom", "left", "zIndex",
  "overflow", "opacity", "transform", "transition", "cursor",
  "visibility", "pointerEvents", "objectFit",
];
