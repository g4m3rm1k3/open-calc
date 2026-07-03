export interface ComponentPreset {
  key: string;
  label: string;
  category: string;
  styles: Record<string, string>;
}

export interface Breakpoint {
  label: string;
  value: string;
}

// ─── Component Presets ────────────────────────────────────────────────────────
export const COMPONENT_PRESETS: ComponentPreset[] = [
  // ── Layouts (Strictly structural, NO colors/backgrounds/borders) ──
  { key: "flex-row",         label: "Flex Row",          category: "Layouts", styles: { display: "flex", flexDirection: "row", alignItems: "center", gap: "16px", flexWrap: "wrap" } },
  { key: "flex-col",         label: "Flex Column",       category: "Layouts", styles: { display: "flex", flexDirection: "column", gap: "16px" } },
  { key: "grid-2",           label: "Grid 2-col",        category: "Layouts", styles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" } },
  { key: "grid-3",           label: "Grid 3-col",        category: "Layouts", styles: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" } },
  { key: "container-center", label: "Centered Container", category: "Layouts", styles: { display: "block", maxWidth: "1024px", margin: "0 auto", padding: "0 24px" } },

  // ── Visual Presets (Strictly thematic) ──
  { key: "card-clean", label: "Card (Clean)", category: "Styles", styles: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", padding: "24px" } },
  { key: "card-dark",  label: "Card (Dark)",  category: "Styles", styles: { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)", padding: "24px", color: "#f8fafc" } },
  { key: "card-glass", label: "Card (Glass)", category: "Styles", styles: { backgroundColor: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "16px", boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)", backdropFilter: "blur(12px)", padding: "24px", color: "#ffffff" } },
  { key: "btn-primary", label: "Button (Primary)", category: "Buttons", styles: { display: "inline-block", padding: "12px 24px", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease" } },
  { key: "btn-outline", label: "Button (Outline)", category: "Buttons", styles: { display: "inline-block", padding: "10px 22px", backgroundColor: "transparent", color: "#3b82f6", border: "2px solid #3b82f6", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease" } },
  { key: "btn-glass",   label: "Button (Glass)",   category: "Buttons", styles: { display: "inline-block", padding: "12px 24px", backgroundColor: "rgba(255, 255, 255, 0.2)", color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.3)", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", backdropFilter: "blur(8px)" } },
  { key: "btn-danger",  label: "Button (Danger)",  category: "Buttons", styles: { display: "inline-block", padding: "12px 24px", backgroundColor: "#ef4444", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease" } },
  { key: "badge-blue",  label: "Badge (Blue)",  category: "Badges", styles: { display: "inline-block", padding: "4px 12px", backgroundColor: "#dbeafe", color: "#1d4ed8", borderRadius: "9999px", fontSize: "12px", fontWeight: "600" } },
  { key: "badge-green", label: "Badge (Green)", category: "Badges", styles: { display: "inline-block", padding: "4px 12px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "9999px", fontSize: "12px", fontWeight: "600" } },
  { key: "badge-dark",  label: "Badge (Dark)",  category: "Badges", styles: { display: "inline-block", padding: "4px 12px", backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: "9999px", fontSize: "12px", fontWeight: "600" } },
  { key: "alert-info",    label: "Alert (Info)",    category: "Alerts", styles: { display: "block", padding: "16px", backgroundColor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "12px", fontSize: "14px" } },
  { key: "alert-success", label: "Alert (Success)", category: "Alerts", styles: { display: "block", padding: "16px", backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "12px", fontSize: "14px" } },
  { key: "alert-warning", label: "Alert (Warning)", category: "Alerts", styles: { display: "block", padding: "16px", backgroundColor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "12px", fontSize: "14px" } },
  { key: "code-block",    label: "Code Block",    category: "Typography", styles: { display: "block", padding: "20px", backgroundColor: "#0f172a", color: "#e2e8f0", borderRadius: "12px", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: "1.6", overflowX: "auto", whiteSpace: "pre" } },
  { key: "heading-hero",  label: "Hero Heading",  category: "Typography", styles: { display: "block", fontSize: "56px", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.03em" } },
  { key: "text-muted",    label: "Text Muted",    category: "Typography", styles: { display: "block", fontSize: "16px", color: "#64748b", lineHeight: "1.6" } },
  { key: "avatar",        label: "Avatar Circle", category: "Media", styles: { display: "inline-block", width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#f1f5f9", border: "2px solid #e2e8f0", objectFit: "cover" } },
  { key: "img-rounded",   label: "Rounded Image", category: "Media", styles: { display: "block", width: "100%", height: "auto", borderRadius: "16px", objectFit: "cover" } },
];

// ─── Per-property preset values ───────────────────────────────────────────────
export const PROP_PRESETS: Record<string, string[]> = {
  border: ["none", "1px solid #e2e8f0", "1px solid #334155", "2px solid #3b82f6", "2px solid #10b981", "2px solid #ef4444", "1px dashed #cbd5e1", "1px solid rgba(255,255,255,0.2)"],
  borderTop: ["none", "1px solid #e2e8f0", "1px solid #334155", "2px solid #3b82f6"],
  borderRight: ["none", "1px solid #e2e8f0", "1px solid #334155", "2px solid #3b82f6"],
  borderBottom: ["none", "1px solid #e2e8f0", "1px solid #334155", "2px solid #3b82f6"],
  borderLeft: ["none", "1px solid #e2e8f0", "1px solid #334155", "4px solid #3b82f6"],
  borderRadius: ["0", "4px", "8px", "12px", "16px", "24px", "32px", "50%", "9999px"],
  outline: ["none", "2px solid #3b82f6", "2px dashed #94a3b8"],
  boxShadow: ["none", "0 1px 2px rgba(0,0,0,0.05)", "0 4px 6px -1px rgba(0,0,0,0.05)", "0 10px 15px -3px rgba(0,0,0,0.1)", "0 20px 25px -5px rgba(0,0,0,0.1)", "0 8px 32px 0 rgba(0,0,0,0.1)", "0 0 15px rgba(59,130,246,0.5)", "0 0 15px rgba(16,185,129,0.5)"],
  backgroundColor: ["transparent", "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#1e293b", "#0f172a", "#3b82f6", "#dbeafe", "#10b981", "#dcfce7", "#8b5cf6", "#ede9fe", "#ef4444", "#fee2e2", "rgba(255,255,255,0.1)", "rgba(0,0,0,0.2)"],
  backgroundImage: ["none", "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)", "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"],
  color: ["#0f172a", "#1e293b", "#475569", "#64748b", "#94a3b8", "#ffffff", "#f8fafc", "#3b82f6", "#1e40af", "#10b981", "#065f46", "#ef4444", "#8b5cf6"],
  fontSize: ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "40px", "48px", "56px", "64px", "1rem", "1.125rem", "1.25rem", "1.5rem", "2rem", "3rem", "4rem"],
  lineHeight: ["1", "1.2", "1.4", "1.5", "1.6", "1.8", "2"],
  letterSpacing: ["normal", "-0.04em", "-0.02em", "0.02em", "0.05em", "0.1em"],
  gap: ["4px", "8px", "12px", "16px", "24px", "32px", "48px", "64px"],
  padding: ["0", "8px", "16px", "24px", "32px", "48px", "64px", "8px 16px", "12px 24px", "16px 32px", "24px 48px"],
  margin: ["0", "auto", "8px", "16px", "24px", "32px", "0 auto", "16px 0", "24px 0", "32px 0"],
  width: ["auto", "100%", "75%", "50%", "25%", "fit-content", "max-content", "240px", "320px", "480px", "640px", "1024px"],
  height: ["auto", "100%", "100vh", "48px", "64px", "128px", "256px", "400px"],
  minHeight: ["auto", "48px", "100px", "200px", "400px", "100vh"],
  maxWidth: ["none", "100%", "480px", "640px", "768px", "1024px", "1280px"],
  opacity: ["1", "0.9", "0.8", "0.5", "0.2", "0"],
  transition: ["none", "all 0.2s ease", "all 0.3s ease-in-out", "opacity 0.2s ease", "transform 0.2s ease", "background-color 0.2s ease", "box-shadow 0.2s ease"],
  transform: ["none", "translateY(-4px)", "translateY(4px)", "scale(1.05)", "scale(0.95)", "rotate(45deg)", "rotate(180deg)"],
  cursor: ["default", "pointer", "text", "not-allowed", "grab"],
  zIndex: ["auto", "0", "10", "20", "30", "40", "50", "999"],
};

// ─── Breakpoints ──────────────────────────────────────────────────────────────
export const BREAKPOINTS: Breakpoint[] = [
  { label: "sm  ≥ 640px",  value: "640px" },
  { label: "md  ≥ 768px",  value: "768px" },
  { label: "lg  ≥ 1024px", value: "1024px" },
  { label: "xl  ≥ 1280px", value: "1280px" },
  { label: "2xl ≥ 1536px", value: "1536px" },
  { label: "custom…",      value: "" },
];

// ─── CSS property list ────────────────────────────────────────────────────────
export const CSS_PROPS_LIST: string[] = [
  "display", "flexDirection", "alignItems", "justifyContent", "flexWrap", "gap",
  "gridTemplateColumns", "gridTemplateRows", "gridColumn", "gridRow",
  "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
  "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
  "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textAlign",
  "color", "backgroundColor", "backgroundImage", "backgroundSize",
  "border", "borderTop", "borderRight", "borderBottom", "borderLeft", "borderRadius",
  "boxShadow", "outline",
  "position", "top", "right", "bottom", "left", "zIndex",
  "overflow", "opacity", "transform", "transition", "cursor",
  "visibility", "pointerEvents", "objectFit",
];
