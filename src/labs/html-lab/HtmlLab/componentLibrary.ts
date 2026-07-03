import type { LabElement, Component, ComponentTheme, BodyTheme, StyleUpdate } from "./types";

function el(
  id: string,
  tag: string,
  parentId: string | null,
  order: number,
  content: string,
  attrs: Record<string, string>,
  styles: Record<string, string>,
): LabElement {
  return {
    id, tag, parentId, order, content,
    attrs: { id: "", class: "", ...attrs },
    styles,
    mediaQueries: [],
  };
}

function sortedTags(children: LabElement[]): string {
  return [...children].map(c => c.tag).sort().join(",");
}

// ─── Body themes ─────────────────────────────────────────────────────────────
export const BODY_THEMES: BodyTheme[] = [
  { id: "body-reset",    name: "↺ Reset",           reset: true,  description: "Restore default body styles", styles: {} },
  { id: "body-css-reset", name: "CSS Reset",         description: "margin: 0, padding: 0 — clean base", styles: { margin: "0", padding: "0", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "16px", lineHeight: "1.5", color: "#0f172a", backgroundColor: "#ffffff" } },
  { id: "body-clean",    name: "Clean Light",        description: "Clean white page, sharp text", styles: { backgroundColor: "#ffffff", color: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif" } },
  { id: "body-slate",    name: "Slate",              description: "Light slate page, perfect for white cards", styles: { backgroundColor: "#f8fafc", color: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif" } },
  { id: "body-dark",     name: "Dark Mode",          description: "Dark slate background, light text", styles: { backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" } },
  { id: "body-glass",    name: "Glassmorphism",      description: "Mesh gradient background", styles: { background: "linear-gradient(135deg, #c084fc 0%, #3b82f6 100%)", color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif" } },
  { id: "body-centered", name: "Centered Canvas",   description: "Narrow centered column", styles: { display: "block", maxWidth: "1024px", margin: "0 auto", padding: "48px 24px" } },
];

// ─── Component library ────────────────────────────────────────────────────────
export const COMPONENTS: Component[] = [

  // ── Container ────────────────────────────────────────────────────────────────
  {
    id: "container", name: "Container", category: "Layout", icon: "📦",
    description: "Styled wrapper — add anything inside",
    matches: (_children, parentTag) => ["div", "section", "article", "header", "footer"].includes(parentTag ?? ""),
    themeGroups: [
      { label: "Themes", themes: [
        { id: "container-clean",       name: "Clean",       parentStyles: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", borderRadius: "16px" } },
        { id: "container-dark",        name: "Dark",        parentStyles: { backgroundColor: "#1e293b", border: "1px solid #334155", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)", borderRadius: "16px" } },
        { id: "container-glass",       name: "Glass",       parentStyles: { backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.1)", borderRadius: "16px" } },
        { id: "container-transparent", name: "Transparent", parentStyles: { backgroundColor: "transparent", border: "none", boxShadow: "none", borderRadius: "0" } },
      ] },
      { label: "Layout", themes: [
        { id: "container-layout-block",      name: "Block",       parentStyles: { display: "block" } },
        { id: "container-layout-flex-row",   name: "Flex Row",    parentStyles: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "24px", alignItems: "flex-start" } },
        { id: "container-layout-flex-col",   name: "Flex Column", parentStyles: { display: "flex", flexDirection: "column", gap: "24px", alignItems: "stretch" } },
        { id: "container-layout-flex-center",name: "Flex Center", parentStyles: { display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", justifyContent: "center" } },
        { id: "container-layout-grid-2",     name: "Grid 2-col",  parentStyles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" } },
        { id: "container-layout-grid-3",     name: "Grid 3-col",  parentStyles: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" } },
      ] },
      { label: "Padding", themes: [
        { id: "container-pad-none", name: "None",     parentStyles: { padding: "0" } },
        { id: "container-pad-sm",   name: "Tight",    parentStyles: { padding: "16px" } },
        { id: "container-pad-md",   name: "Normal",   parentStyles: { padding: "32px" } },
        { id: "container-pad-lg",   name: "Spacious", parentStyles: { padding: "64px" } },
      ] },
    ],
    template: [
      el("t0", "div", null, 0, "", {}, { display: "block", width: "100%", boxSizing: "border-box", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", minHeight: "80px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }),
    ],
  },

  // ── Navbar ───────────────────────────────────────────────────────────────────
  {
    id: "nav", name: "Navbar", category: "Navigation", icon: "🧭",
    description: "Navigation links — full width",
    matches: (children) => children.length >= 2 && children.every(c => c.tag === "a"),
    themeGroups: [
      { label: "Themes", themes: [
        { id: "nav-clean",       name: "Clean",       parentStyles: { backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" },                                                          childStylesByTag: { a: { color: "#475569" } } },
        { id: "nav-dark",        name: "Dark",        parentStyles: { backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b" },                                                          childStylesByTag: { a: { color: "#94a3b8" } } },
        { id: "nav-glass",       name: "Glass",       parentStyles: { backgroundColor: "rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(12px)" }, childStylesByTag: { a: { color: "#ffffff" } } },
        { id: "nav-transparent", name: "Transparent", parentStyles: { backgroundColor: "transparent", borderBottom: "none" },                                                                    childStylesByTag: { a: { color: "inherit" } } },
      ] },
    ],
    template: [
      el("t0", "nav", null, 0, "", {}, { display: "flex", alignItems: "center", gap: "8px", padding: "0 32px", height: "64px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", width: "100%", boxSizing: "border-box" }),
      el("t1", "a", "t0", 0, "Home",    { href: "#" }, { display: "flex", alignItems: "center", height: "64px", padding: "0 16px", fontSize: "15px", fontWeight: "600", color: "#475569", textDecoration: "none" }),
      el("t2", "a", "t0", 1, "About",   { href: "#" }, { display: "flex", alignItems: "center", height: "64px", padding: "0 16px", fontSize: "15px", fontWeight: "600", color: "#475569", textDecoration: "none" }),
      el("t3", "a", "t0", 2, "Contact", { href: "#" }, { display: "flex", alignItems: "center", height: "64px", padding: "0 16px", fontSize: "15px", fontWeight: "600", color: "#475569", textDecoration: "none" }),
    ],
  },

  // ── Hero ─────────────────────────────────────────────────────────────────────
  {
    id: "hero", name: "Hero", category: "Layout", icon: "🦸",
    description: "Full-width heading, tagline and CTA",
    matches: (children) => sortedTags(children) === "button,h1,p",
    themeGroups: [
      { label: "Themes", themes: [
        { id: "hero-clean",    name: "Clean",    parentStyles: { backgroundColor: "#f8fafc", background: "none" }, childStylesByTag: { h1: { color: "#0f172a" }, p: { color: "#64748b" }, button: { backgroundColor: "#3b82f6", color: "#ffffff", border: "none" } } },
        { id: "hero-dark",     name: "Dark",     parentStyles: { backgroundColor: "#0f172a", background: "none" }, childStylesByTag: { h1: { color: "#f8fafc" }, p: { color: "#94a3b8" }, button: { backgroundColor: "#3b82f6", color: "#ffffff", border: "none" } } },
        { id: "hero-glass",    name: "Glass",    parentStyles: { backgroundColor: "rgba(255,255,255,0.1)", background: "none", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", borderRadius: "24px" }, childStylesByTag: { h1: { color: "#ffffff" }, p: { color: "rgba(255,255,255,0.8)" }, button: { backgroundColor: "#ffffff", color: "#3b82f6", border: "none" } } },
        { id: "hero-gradient", name: "Gradient", parentStyles: { background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)", backgroundColor: "none" }, childStylesByTag: { h1: { color: "#ffffff" }, p: { color: "rgba(255,255,255,0.8)" }, button: { backgroundColor: "#ffffff", color: "#1e40af", border: "none" } } },
      ] },
      { label: "Layout", themes: [
        { id: "hero-layout-centered", name: "Centered",   parentStyles: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "128px 48px", minHeight: "500px" }, childStylesByTag: { h1: { textAlign: "center" }, p: { textAlign: "center" } } },
        { id: "hero-layout-left",     name: "Left Align", parentStyles: { display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", textAlign: "left", padding: "128px 10%", minHeight: "500px" },       childStylesByTag: { h1: { textAlign: "left" }, p: { textAlign: "left" } } },
      ] },
    ],
    template: [
      el("t0", "section", null, 0, "", {}, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "128px 48px", backgroundColor: "#f8fafc", width: "100%", boxSizing: "border-box", minHeight: "500px" }),
      el("t1", "h1",    "t0", 0, "Build Something Amazing",                      {}, { fontSize: "64px", fontWeight: "800", color: "#0f172a", marginBottom: "24px", lineHeight: "1.1", letterSpacing: "-0.03em", display: "block" }),
      el("t2", "p",     "t0", 1, "The tools you need to create the future, today.", {}, { fontSize: "20px", color: "#64748b", marginBottom: "48px", lineHeight: "1.6", display: "block", maxWidth: "600px" }),
      el("t3", "button","t0", 2, "Get Started Now", { type: "button" }, { padding: "16px 32px", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "inline-block" }),
    ],
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
  {
    id: "card", name: "Card", category: "Content", icon: "🃏",
    description: "Image, title, description and action",
    matches: (children) => sortedTags(children) === "button,h3,img,p",
    themeGroups: [
      { label: "Themes", themes: [
        { id: "card-clean",    name: "Clean",    parentStyles: { backgroundColor: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", borderRadius: "16px" },                                                               childStylesByTag: { img: { backgroundColor: "#f1f5f9" }, h3: { color: "#0f172a" }, p: { color: "#64748b" }, button: { backgroundColor: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0" } } },
        { id: "card-dark",     name: "Dark",     parentStyles: { backgroundColor: "#1e293b", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)", border: "1px solid #334155", borderRadius: "16px" },                                                              childStylesByTag: { img: { backgroundColor: "#0f172a" }, h3: { color: "#f8fafc" }, p: { color: "#94a3b8" }, button: { backgroundColor: "#3b82f6", color: "#ffffff", border: "none" } } },
        { id: "card-glass",    name: "Glass",    parentStyles: { backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "16px" },         childStylesByTag: { img: { backgroundColor: "rgba(255,255,255,0.2)" }, h3: { color: "#ffffff" }, p: { color: "rgba(255,255,255,0.8)" }, button: { backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)" } } },
        { id: "card-outlined", name: "Outlined", parentStyles: { backgroundColor: "transparent", boxShadow: "none", border: "2px solid #e2e8f0", borderRadius: "16px" },                                                                                       childStylesByTag: { img: { backgroundColor: "#f1f5f9" }, h3: { color: "#0f172a" }, p: { color: "#64748b" }, button: { backgroundColor: "transparent", color: "#3b82f6", border: "2px solid #3b82f6" } } },
      ] },
    ],
    template: [
      el("t0", "div",    null, 0, "",              {},                            { display: "block", backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", width: "320px" }),
      el("t1", "img",    "t0", 0, "",              { src: "", alt: "Card" },      { width: "100%", height: "200px", objectFit: "cover", display: "block", backgroundColor: "#f1f5f9" }),
      el("t2", "h3",     "t0", 1, "Card Title",   {},                            { fontSize: "20px", fontWeight: "700", color: "#0f172a", padding: "24px 24px 8px", margin: "0", display: "block" }),
      el("t3", "p",      "t0", 2, "A brief description explaining the value proposition of this card.", {}, { fontSize: "15px", color: "#64748b", padding: "0 24px", lineHeight: "1.6", margin: "0", display: "block" }),
      el("t4", "button", "t0", 3, "Learn More",   { type: "button" },            { display: "inline-block", margin: "24px", padding: "12px 24px", backgroundColor: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }),
    ],
  },

  // ── Feature ──────────────────────────────────────────────────────────────────
  {
    id: "feature", name: "Feature", category: "Content", icon: "⭐",
    description: "Title and description pair",
    matches: (children) => sortedTags(children) === "h2,p",
    themeGroups: [
      { label: "Themes", themes: [
        { id: "feature-clean", name: "Clean", parentStyles: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6" }, childStylesByTag: { h2: { color: "#0f172a" }, p: { color: "#64748b" } } },
        { id: "feature-dark",  name: "Dark",  parentStyles: { backgroundColor: "#1e293b", border: "1px solid #334155", borderLeft: "4px solid #3b82f6" }, childStylesByTag: { h2: { color: "#f8fafc" }, p: { color: "#94a3b8" } } },
        { id: "feature-glass", name: "Glass", parentStyles: { backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", borderLeft: "4px solid rgba(255,255,255,0.8)" }, childStylesByTag: { h2: { color: "#ffffff" }, p: { color: "rgba(255,255,255,0.8)" } } },
      ] },
      { label: "Style", themes: [
        { id: "feature-style-box",     name: "Box",     parentStyles: { borderRadius: "12px", padding: "32px", display: "block" } },
        { id: "feature-style-minimal", name: "Minimal", parentStyles: { borderRadius: "0", padding: "32px 0", borderTop: "none", borderRight: "none", borderBottom: "1px solid #e2e8f0", borderLeft: "none", backgroundColor: "transparent" } },
      ] },
    ],
    template: [
      el("t0", "div", null, 0, "", {}, { display: "block", padding: "32px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6", width: "100%", boxSizing: "border-box" }),
      el("t1", "h2",  "t0", 0, "Feature Title", {}, { fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "block" }),
      el("t2", "p",   "t0", 1, "Describe what makes this feature valuable to your users.", {}, { fontSize: "16px", color: "#64748b", lineHeight: "1.6", display: "block" }),
    ],
  },

  // ── Two Column ───────────────────────────────────────────────────────────────
  {
    id: "two-column", name: "Two Column", category: "Layout", icon: "▊",
    description: "Side-by-side columns",
    matches: (children) => sortedTags(children) === "div,div",
    themeGroups: [
      { label: "Layout", themes: [
        { id: "twocol-equal",        name: "Equal",        parentStyles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "32px", alignItems: "start", width: "100%" } },
        { id: "twocol-sidebar-left", name: "Sidebar Left", parentStyles: { display: "grid", gridTemplateColumns: "300px 1fr",      gap: "32px", alignItems: "start", width: "100%" } },
        { id: "twocol-stacked",      name: "Stacked",      parentStyles: { display: "grid", gridTemplateColumns: "1fr",            gap: "32px", alignItems: "start", width: "100%" } },
      ] },
    ],
    template: [
      el("t0", "div", null, 0, "",             {}, { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "32px", alignItems: "start", width: "100%", boxSizing: "border-box" }),
      el("t1", "div", "t0", 0, "Left Column",  {}, { padding: "32px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", display: "block", minHeight: "200px" }),
      el("t2", "div", "t0", 1, "Right Column", {}, { padding: "32px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", display: "block", minHeight: "200px" }),
    ],
  },

  // ── Testimonial ───────────────────────────────────────────────────────────────
  {
    id: "testimonial", name: "Testimonial", category: "Content", icon: "💬",
    description: "Quote and author name",
    matches: (children) => sortedTags(children) === "h3,p",
    themeGroups: [
      { label: "Themes", themes: [
        { id: "testimonial-clean", name: "Clean", parentStyles: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6" }, childStylesByTag: { p: { color: "#0f172a" }, h3: { color: "#64748b" } } },
        { id: "testimonial-dark",  name: "Dark",  parentStyles: { backgroundColor: "#1e293b", border: "1px solid #334155", borderLeft: "4px solid #3b82f6" }, childStylesByTag: { p: { color: "#f8fafc" }, h3: { color: "#94a3b8" } } },
      ] },
    ],
    template: [
      el("t0", "div", null, 0, "", {}, { display: "block", padding: "48px 40px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6", borderRadius: "16px", width: "100%", boxSizing: "border-box" }),
      el("t1", "p",  "t0", 0, "“This product changed how we work. Absolutely recommend it.”", {}, { fontSize: "20px", color: "#0f172a", lineHeight: "1.6", fontStyle: "italic", marginBottom: "24px", display: "block" }),
      el("t2", "h3", "t0", 1, "Jane Smith, CEO at Acme", {}, { fontSize: "16px", fontWeight: "600", color: "#64748b", display: "block" }),
    ],
  },

  // ── Alert ─────────────────────────────────────────────────────────────────────
  {
    id: "alert", name: "Alert", category: "Feedback", icon: "⚠️",
    description: "Info / warning / error banner",
    matches: () => false,
    themeGroups: [
      { label: "Themes", themes: [
        { id: "alert-info",    name: "Info",    parentStyles: { backgroundColor: "rgba(59,130,246,0.12)",  border: "1px solid rgba(59,130,246,0.35)",  borderLeft: "4px solid #3b82f6" }, childStylesByIndex: { 0: { color: "#60a5fa" }, 1: { color: "#93c5fd" } } },
        { id: "alert-success", name: "Success", parentStyles: { backgroundColor: "rgba(34,197,94,0.12)",   border: "1px solid rgba(34,197,94,0.35)",   borderLeft: "4px solid #22c55e" }, childStylesByIndex: { 0: { color: "#4ade80" }, 1: { color: "#86efac" } } },
        { id: "alert-warning", name: "Warning", parentStyles: { backgroundColor: "rgba(234,179,8,0.12)",   border: "1px solid rgba(234,179,8,0.35)",   borderLeft: "4px solid #eab308" }, childStylesByIndex: { 0: { color: "#facc15" }, 1: { color: "#fde047" } } },
        { id: "alert-error",   name: "Error",   parentStyles: { backgroundColor: "rgba(239,68,68,0.12)",   border: "1px solid rgba(239,68,68,0.35)",   borderLeft: "4px solid #ef4444" }, childStylesByIndex: { 0: { color: "#f87171" }, 1: { color: "#fca5a5" } } },
      ] },
    ],
    template: [
      el("t0", "div", null, 0, "", {}, { display: "block", padding: "16px 20px", backgroundColor: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.35)", borderLeft: "4px solid #3b82f6", borderRadius: "8px", width: "100%", boxSizing: "border-box" }),
      el("t1", "p",   "t0", 0, "ℹ️  Note",  {}, { fontSize: "14px", fontWeight: "700", color: "#60a5fa", margin: "0 0 4px", display: "block" }),
      el("t2", "p",   "t0", 1, "This is an informational alert. Replace this text with your message.", {}, { fontSize: "14px", color: "#93c5fd", lineHeight: "1.6", margin: "0", display: "block" }),
    ],
  },

  // ── Stat Card ─────────────────────────────────────────────────────────────────
  {
    id: "stat", name: "Stat Card", category: "Content", icon: "📊",
    description: "Key metric with label and value",
    matches: () => false,
    themeGroups: [
      { label: "Themes", themes: [
        { id: "stat-clean",  name: "Clean",  parentStyles: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }, childStylesByIndex: { 0: { color: "#3b82f6" }, 1: { color: "#0f172a" }, 2: { color: "#64748b" } } },
        { id: "stat-dark",   name: "Dark",   parentStyles: { backgroundColor: "#1e293b", border: "1px solid #334155" },                                                 childStylesByIndex: { 0: { color: "#60a5fa" }, 1: { color: "#f8fafc" }, 2: { color: "#94a3b8" } } },
        { id: "stat-accent", name: "Accent", parentStyles: { backgroundColor: "#3b82f6", border: "none" },                                                              childStylesByIndex: { 0: { color: "rgba(255,255,255,0.7)" }, 1: { color: "#ffffff" }, 2: { color: "rgba(255,255,255,0.7)" } } },
      ] },
    ],
    template: [
      el("t0", "div", null, 0, "",              {}, { display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "28px 32px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", width: "fit-content", minWidth: "200px" }),
      el("t1", "p",   "t0", 0, "📈 Total Revenue",     {}, { fontSize: "13px", fontWeight: "600", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px", display: "block" }),
      el("t2", "h2",  "t0", 1, "$48,250",              {}, { fontSize: "40px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px", lineHeight: "1", display: "block" }),
      el("t3", "p",   "t0", 2, "↑ 12% from last month", {}, { fontSize: "13px", color: "#64748b", margin: "0", display: "block" }),
    ],
  },

  // ── CTA Section ──────────────────────────────────────────────────────────────
  {
    id: "cta", name: "CTA Section", category: "Layout", icon: "🎯",
    description: "Call-to-action banner with heading and buttons",
    matches: () => false,
    themeGroups: [
      { label: "Themes", themes: [
        { id: "cta-blue",  name: "Blue",  parentStyles: { background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", backgroundColor: "none" }, childStylesByTag: { h2: { color: "#ffffff" }, p: { color: "rgba(255,255,255,0.85)" } } },
        { id: "cta-dark",  name: "Dark",  parentStyles: { backgroundColor: "#0f172a", background: "none", border: "1px solid #1e293b" },              childStylesByTag: { h2: { color: "#f8fafc" }, p: { color: "#94a3b8" } } },
        { id: "cta-glass", name: "Glass", parentStyles: { backgroundColor: "rgba(255,255,255,0.1)", background: "none", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }, childStylesByTag: { h2: { color: "#ffffff" }, p: { color: "rgba(255,255,255,0.8)" } } },
      ] },
    ],
    template: [
      el("t0", "div",    null, 0, "",                            {}, { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "80px 48px", background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", borderRadius: "24px", width: "100%", boxSizing: "border-box" }),
      el("t1", "h2",     "t0", 0, "Ready to get started?",      {}, { fontSize: "40px", fontWeight: "800", color: "#ffffff", marginBottom: "16px", lineHeight: "1.15", display: "block" }),
      el("t2", "p",      "t0", 1, "Join thousands of teams already building the future.", {}, { fontSize: "18px", color: "rgba(255,255,255,0.85)", marginBottom: "40px", lineHeight: "1.6", display: "block", maxWidth: "520px" }),
      el("t3", "button", "t0", 2, "Get Started Free", { type: "button" }, { padding: "16px 36px", backgroundColor: "#ffffff", color: "#1e40af", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "inline-block" }),
    ],
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  {
    id: "footer", name: "Footer", category: "Layout", icon: "🔻",
    description: "Page footer with links",
    matches: () => false,
    themeGroups: [
      { label: "Themes", themes: [
        { id: "footer-dark",  name: "Dark",  parentStyles: { backgroundColor: "#0f172a", borderTop: "1px solid #1e293b" }, childStylesByTag: { p: { color: "#64748b" }, a: { color: "#94a3b8" } } },
        { id: "footer-light", name: "Light", parentStyles: { backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0" }, childStylesByTag: { p: { color: "#64748b" }, a: { color: "#475569" } } },
      ] },
    ],
    template: [
      el("t0", "footer", null, 0, "", {}, { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", padding: "32px 40px", backgroundColor: "#0f172a", borderTop: "1px solid #1e293b", width: "100%", boxSizing: "border-box" }),
      el("t1", "p",   "t0", 0, "© 2025 HtmlLab. All rights reserved.", {}, { fontSize: "14px", color: "#64748b", margin: "0", display: "block" }),
      el("t2", "div", "t0", 1, "", {}, { display: "flex", gap: "24px", alignItems: "center" }),
      el("t3", "a",   "t2", 0, "Privacy", { href: "#" }, { fontSize: "14px", color: "#94a3b8", textDecoration: "none", display: "inline" }),
      el("t4", "a",   "t2", 1, "Terms",   { href: "#" }, { fontSize: "14px", color: "#94a3b8", textDecoration: "none", display: "inline" }),
      el("t5", "a",   "t2", 2, "Contact", { href: "#" }, { fontSize: "14px", color: "#94a3b8", textDecoration: "none", display: "inline" }),
    ],
  },

  // ── Newsletter Signup (styled look-alike — div/p/input/button, not a real <form>) ──
  {
    id: "form", name: "Newsletter Signup", category: "Content", icon: "📋",
    description: "Label, input field and submit button",
    matches: () => false,
    themeGroups: [
      { label: "Themes", themes: [
        { id: "form-clean", name: "Clean", parentStyles: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }, childStylesByTag: { p: { color: "#0f172a" } } },
        { id: "form-dark",  name: "Dark",  parentStyles: { backgroundColor: "#1e293b", border: "1px solid #334155" }, childStylesByTag: { p: { color: "#f8fafc" } } },
      ] },
    ],
    template: [
      el("t0", "div",    null, 0, "",                   {}, { display: "flex", flexDirection: "column", gap: "12px", padding: "32px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", width: "100%", boxSizing: "border-box", maxWidth: "440px" }),
      el("t1", "p",      "t0", 0, "Email address",      {}, { fontSize: "14px", fontWeight: "600", color: "#0f172a", margin: "0", display: "block" }),
      el("t2", "input",  "t0", 1, "", { type: "email", placeholder: "you@example.com" }, { display: "block", width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px", outline: "none", boxSizing: "border-box", backgroundColor: "#f8fafc" }),
      el("t3", "button", "t0", 2, "Subscribe", { type: "button" }, { display: "block", width: "100%", padding: "12px", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", boxSizing: "border-box" }),
    ],
  },

  // ── Table (real <table>/<thead>/<tbody> structure) ────────────────────────────
  {
    id: "table-structure", name: "Table", category: "Structure", icon: "▦",
    description: "Real <table> with header row and two data rows",
    matches: () => false,
    themeGroups: [],
    template: [
      el("t0",  "table", null, 0, "", {}, { width: "100%", borderCollapse: "collapse", fontSize: "14px", margin: "0 0 16px 0", display: "table" }),
      el("t1",  "thead", "t0", 0, "", {}, {}),
      el("t2",  "tr",    "t1", 0, "", {}, {}),
      el("t3",  "th",    "t2", 0, "Column 1", {}, { padding: "10px", textAlign: "left", borderBottom: "2px solid #e2e8f0", fontWeight: "600" }),
      el("t4",  "th",    "t2", 1, "Column 2", {}, { padding: "10px", textAlign: "left", borderBottom: "2px solid #e2e8f0", fontWeight: "600" }),
      el("t5",  "th",    "t2", 2, "Column 3", {}, { padding: "10px", textAlign: "left", borderBottom: "2px solid #e2e8f0", fontWeight: "600" }),
      el("t6",  "tbody", "t0", 1, "", {}, {}),
      el("t7",  "tr",    "t6", 0, "", {}, {}),
      el("t8",  "td",    "t7", 0, "Row 1",    {}, { padding: "10px", borderBottom: "1px solid #e2e8f0" }),
      el("t9",  "td",    "t7", 1, "Data",     {}, { padding: "10px", borderBottom: "1px solid #e2e8f0" }),
      el("t10", "td",    "t7", 2, "Data",     {}, { padding: "10px", borderBottom: "1px solid #e2e8f0" }),
      el("t11", "tr",    "t6", 1, "", {}, {}),
      el("t12", "td",    "t11", 0, "Row 2",   {}, { padding: "10px", borderBottom: "1px solid #e2e8f0" }),
      el("t13", "td",    "t11", 1, "Data",    {}, { padding: "10px", borderBottom: "1px solid #e2e8f0" }),
      el("t14", "td",    "t11", 2, "Data",    {}, { padding: "10px", borderBottom: "1px solid #e2e8f0" }),
    ],
  },

  // ── Form (real <form>/<label>/<input> structure) ──────────────────────────────
  {
    id: "form-structure", name: "Form", category: "Structure", icon: "📝",
    description: "Real <form> with labeled fields and a submit button",
    matches: () => false,
    themeGroups: [],
    template: [
      el("t0", "form",  null, 0, "", { action: "#", method: "post" }, { display: "flex", flexDirection: "column", gap: "16px", padding: "24px", border: "1px solid #e2e8f0", borderRadius: "12px", maxWidth: "440px", boxSizing: "border-box" }),
      el("t1", "label", "t0", 0, "Name",  { for: "name-field" },  { fontSize: "14px", fontWeight: "600", display: "block" }),
      el("t2", "input", "t0", 1, "",      { type: "text", name: "name", id: "name-field", placeholder: "Your name" }, { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }),
      el("t3", "label", "t0", 2, "Email", { for: "email-field" }, { fontSize: "14px", fontWeight: "600", display: "block" }),
      el("t4", "input", "t0", 3, "",      { type: "email", name: "email", id: "email-field", placeholder: "you@example.com" }, { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }),
      el("t5", "button", "t0", 4, "Submit", { type: "submit" }, { padding: "12px", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }),
    ],
  },

  // ── Select ─────────────────────────────────────────────────────────────────────
  {
    id: "select-structure", name: "Select", category: "Structure", icon: "▾",
    description: "Real <select> with three <option>s",
    matches: () => false,
    themeGroups: [],
    template: [
      el("t0", "select", null, 0, "", { name: "choice" }, { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px", display: "block", maxWidth: "280px" }),
      el("t1", "option", "t0", 0, "Option 1", { value: "option-1" }, {}),
      el("t2", "option", "t0", 1, "Option 2", { value: "option-2" }, {}),
      el("t3", "option", "t0", 2, "Option 3", { value: "option-3" }, {}),
    ],
  },

  // ── Figure ─────────────────────────────────────────────────────────────────────
  {
    id: "figure-structure", name: "Figure", category: "Structure", icon: "🖼️",
    description: "Real <figure> with an image and caption",
    matches: () => false,
    themeGroups: [],
    template: [
      el("t0", "figure",     null, 0, "", {}, { margin: "0 0 16px 0", display: "block" }),
      el("t1", "img",        "t0", 0, "", { src: "", alt: "Image" }, { width: "100%", borderRadius: "8px", display: "block" }),
      el("t2", "figcaption", "t0", 1, "Image caption", {}, { fontSize: "13px", color: "#64748b", marginTop: "8px", textAlign: "center", display: "block" }),
    ],
  },

  // ── Definition List ────────────────────────────────────────────────────────────
  {
    id: "dl-structure", name: "Definition List", category: "Structure", icon: "📖",
    description: "Real <dl> with two term/definition pairs",
    matches: () => false,
    themeGroups: [],
    template: [
      el("t0", "dl", null, 0, "", {}, { margin: "0 0 16px 0", display: "block" }),
      el("t1", "dt", "t0", 0, "Term one",       {}, { fontWeight: "600", display: "block", marginTop: "8px" }),
      el("t2", "dd", "t0", 1, "Its definition.", {}, { margin: "0 0 0 16px", color: "#475569", display: "block" }),
      el("t3", "dt", "t0", 2, "Term two",       {}, { fontWeight: "600", display: "block", marginTop: "8px" }),
      el("t4", "dd", "t0", 3, "Its definition.", {}, { margin: "0 0 0 16px", color: "#475569", display: "block" }),
    ],
  },

  // ── Details / Summary ──────────────────────────────────────────────────────────
  {
    id: "details-structure", name: "Details / Summary", category: "Structure", icon: "🔽",
    description: "Real <details> disclosure widget",
    matches: () => false,
    themeGroups: [],
    template: [
      el("t0", "details", null, 0, "", {}, { margin: "0 0 16px 0", padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: "8px", display: "block" }),
      el("t1", "summary", "t0", 0, "Click to expand", {}, { fontWeight: "600", cursor: "pointer" }),
      el("t2", "p",       "t0", 1, "Hidden content goes here.", {}, { margin: "8px 0 0 0", color: "#475569" }),
    ],
  },

  // ── Pricing Card ────────────────────────────────────────────────────────────
  {
    id: "pricing", name: "Pricing", category: "Content", icon: "💳",
    description: "Plan name, price and CTA",
    matches: (children) => sortedTags(children) === "button,h2,h3",
    themeGroups: [
      { label: "Themes", themes: [
        { id: "pricing-clean",    name: "Clean",    parentStyles: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },           childStylesByTag: { h3: { color: "#64748b" }, h2: { color: "#0f172a" }, button: { backgroundColor: "#f1f5f9", color: "#0f172a" } } },
        { id: "pricing-featured", name: "Featured", parentStyles: { backgroundColor: "#3b82f6", border: "1px solid #3b82f6", boxShadow: "0 10px 25px -5px rgba(59,130,246,0.5)" },   childStylesByTag: { h3: { color: "rgba(255,255,255,0.8)" }, h2: { color: "#ffffff" }, button: { backgroundColor: "#ffffff", color: "#3b82f6" } } },
        { id: "pricing-dark",     name: "Dark",     parentStyles: { backgroundColor: "#1e293b", border: "1px solid #334155", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" },         childStylesByTag: { h3: { color: "#94a3b8" }, h2: { color: "#f8fafc" }, button: { backgroundColor: "#3b82f6", color: "#ffffff" } } },
      ] },
    ],
    template: [
      el("t0", "div",    null, 0, "",             {}, { display: "flex", flexDirection: "column", padding: "48px 32px", backgroundColor: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", textAlign: "center", width: "300px" }),
      el("t1", "h3",     "t0", 0, "Starter Plan", {}, { fontSize: "14px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", display: "block" }),
      el("t2", "h2",     "t0", 1, "$29/mo",        {}, { fontSize: "48px", fontWeight: "800", color: "#0f172a", marginBottom: "32px", lineHeight: "1", display: "block" }),
      el("t3", "button", "t0", 2, "Get Started", { type: "button" }, { display: "block", width: "100%", padding: "16px", backgroundColor: "#f1f5f9", color: "#0f172a", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer", boxSizing: "border-box" }),
    ],
  },
];

// ─── Detect matching components for a selected parent ─────────────────────────
export function detectComponents(parentId: string, elements: LabElement[]): Component[] {
  const parent = elements.find(e => e.id === parentId);
  const parentTag = parent?.tag ?? null;

  const children = elements
    .filter(e => e.parentId === parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return COMPONENTS.filter(comp => {
    try { return comp.matches(children, parentTag); } catch { return false; }
  });
}

// ─── Build style updates for applying a theme ─────────────────────────────────
export function buildThemeUpdates(parentId: string, elements: LabElement[], theme: ComponentTheme): StyleUpdate[] {
  const children = elements
    .filter(e => e.parentId === parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const updates: StyleUpdate[] = [];

  if (theme.parentStyles) {
    updates.push({ id: parentId, styles: theme.parentStyles });
  }

  children.forEach((child, index) => {
    const indexStyles = theme.childStylesByIndex?.[index];
    const tagStyles   = theme.childStylesByTag?.[child.tag];
    const merged = { ...(tagStyles || {}), ...(indexStyles || {}) };
    if (Object.keys(merged).length > 0) {
      updates.push({ id: child.id, styles: merged });
    }
  });

  return updates;
}
