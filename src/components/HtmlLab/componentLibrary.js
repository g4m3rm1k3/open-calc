// ─── Template element builder ─────────────────────────────────────────────────
function el(id, tag, parentId, order, content, attrs, styles) {
  return {
    id, tag, parentId, order, content,
    attrs: { id: "", class: "", ...attrs },
    styles,
    mediaQueries: [],
  };
}

function sortedTags(children) {
  return [...children].map(c => c.tag).sort().join(",");
}

// ─── Body themes ─────────────────────────────────────────────────────────────
export const BODY_THEMES = [
  {
    id: "body-reset",
    name: "↺ Reset",
    reset: true,
    description: "Restore default body styles",
    styles: {},
  },
  {
    id: "body-css-reset",
    name: "CSS Reset",
    description: "margin: 0, padding: 0 — clean base for building from scratch",
    styles: { margin: "0", padding: "0", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "16px", lineHeight: "1.5", color: "#1a1a18", backgroundColor: "#ffffff" },
  },
  // backgrounds
  {
    id: "body-white",
    name: "White",
    description: "Clean white page",
    styles: { backgroundColor: "#ffffff", color: "#1a1a18" },
  },
  {
    id: "body-grey",
    name: "Grey",
    description: "Light grey — sections stand out as white cards",
    styles: { backgroundColor: "#f1f5f9", color: "#1a1a18" },
  },
  {
    id: "body-dark",
    name: "Dark",
    description: "Dark background, light text",
    styles: { backgroundColor: "#0f172a", color: "#e2e8f0" },
  },
  {
    id: "body-cream",
    name: "Cream",
    description: "Warm off-white, editorial feel",
    styles: { backgroundColor: "#fafaf7", color: "#1a1a18" },
  },
  // page layouts
  {
    id: "body-landing",
    name: "Landing Page",
    description: "No padding — full-width sections edge to edge (pair with Hero and Band)",
    styles: { display: "flex", flexDirection: "column", margin: "0", padding: "0" },
  },
  {
    id: "body-centered",
    name: "Centered",
    description: "Narrow centered column — content flows top to bottom",
    styles: { display: "block", maxWidth: "900px", margin: "0 auto", padding: "40px 32px" },
  },
  {
    id: "body-article",
    name: "Article",
    description: "Readable prose — narrow, serif, generous line spacing",
    styles: { display: "block", maxWidth: "680px", margin: "0 auto", padding: "64px 32px", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "18px", lineHeight: "1.85" },
  },
];

// ─── Component library ────────────────────────────────────────────────────────
//
// Each component has `themeGroups` — an array of { label, themes[] }.
// Themes within a "Colors" group change ONLY colors (background, text, border).
// Themes within a "Layout" group change ONLY alignment/direction/spacing.
// This means you can apply them in any order without getting stuck.
//
export const COMPONENTS = [

  // ── Container ────────────────────────────────────────────────────────────────
  // Matches any generic container element (div, section, article, header, footer)
  // so color/style themes appear whenever one is selected, regardless of children.
  {
    id: "container",
    name: "Container",
    category: "Layout",
    icon: "📦",
    description: "Styled wrapper — add anything inside",
    matches: (children, parentTag) =>
      ["div", "section", "article", "header", "footer"].includes(parentTag),
    themeGroups: [
      {
        label: "Colors",
        themes: [
          {
            id: "container-white",
            name: "White",
            parentStyles: { backgroundColor: "#ffffff", background: "", border: "1px solid #e2e8f0", boxShadow: "none" },
          },
          {
            id: "container-grey",
            name: "Grey",
            parentStyles: { backgroundColor: "#f8fafc", background: "", border: "1px solid #e2e8f0", boxShadow: "none" },
          },
          {
            id: "container-dark",
            name: "Dark",
            parentStyles: { backgroundColor: "#1e293b", background: "", border: "none", boxShadow: "none" },
          },
          {
            id: "container-blue",
            name: "Blue",
            parentStyles: { backgroundColor: "#eff6ff", background: "", border: "1px solid #bfdbfe", boxShadow: "none" },
          },
          {
            id: "container-green",
            name: "Green",
            parentStyles: { backgroundColor: "#f0fdf4", background: "", border: "1px solid #bbf7d0", boxShadow: "none" },
          },
          {
            id: "container-card",
            name: "Card",
            parentStyles: { backgroundColor: "#ffffff", background: "", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
          },
          {
            id: "container-transparent",
            name: "None",
            parentStyles: { backgroundColor: "transparent", background: "", border: "none", boxShadow: "none" },
          },
        ],
      },
      {
        label: "Shape",
        themes: [
          {
            id: "container-rounded",
            name: "Rounded",
            parentStyles: { borderRadius: "16px" },
          },
          {
            id: "container-soft",
            name: "Soft",
            parentStyles: { borderRadius: "8px" },
          },
          {
            id: "container-square",
            name: "Square",
            parentStyles: { borderRadius: "0" },
          },
        ],
      },
      {
        label: "Padding",
        themes: [
          { id: "container-pad-none", name: "None",     parentStyles: { padding: "0" } },
          { id: "container-pad-sm",   name: "Tight",    parentStyles: { padding: "12px" } },
          { id: "container-pad-md",   name: "Normal",   parentStyles: { padding: "24px" } },
          { id: "container-pad-lg",   name: "Spacious", parentStyles: { padding: "48px" } },
        ],
      },
      {
        label: "Layout",
        themes: [
          {
            id: "container-layout-block",
            name: "Block",
            description: "Default document flow",
            parentStyles: { display: "block", flexDirection: "", flexWrap: "", gap: "", gridTemplateColumns: "", alignItems: "", justifyContent: "" },
          },
          {
            id: "container-layout-flex-row",
            name: "Flex Row",
            description: "Items side by side — great for cards",
            parentStyles: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "24px", alignItems: "flex-start", gridTemplateColumns: "" },
          },
          {
            id: "container-layout-flex-col",
            name: "Flex Column",
            description: "Items stacked vertically with gap",
            parentStyles: { display: "flex", flexDirection: "column", flexWrap: "", gap: "16px", alignItems: "stretch", gridTemplateColumns: "" },
          },
          {
            id: "container-layout-flex-center",
            name: "Flex Center",
            description: "Everything centered horizontally and vertically",
            parentStyles: { display: "flex", flexDirection: "column", flexWrap: "", gap: "16px", alignItems: "center", justifyContent: "center", gridTemplateColumns: "" },
          },
          {
            id: "container-layout-grid-2",
            name: "Grid 2-col",
            description: "Two equal columns",
            parentStyles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", flexDirection: "", flexWrap: "", alignItems: "" },
          },
          {
            id: "container-layout-grid-3",
            name: "Grid 3-col",
            description: "Three equal columns",
            parentStyles: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", flexDirection: "", flexWrap: "", alignItems: "" },
          },
          {
            id: "container-layout-grid-auto",
            name: "Grid Auto",
            description: "Auto-fill columns, min 200px each",
            parentStyles: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px", flexDirection: "", flexWrap: "" },
          },
        ],
      },
    ],
    template: [
      el("t0", "div", null, 0, "", {}, {
        display: "block", width: "100%", boxSizing: "border-box",
        backgroundColor: "#f8fafc", borderRadius: "12px",
        border: "1px solid #e5e7eb", padding: "24px", minHeight: "80px",
      }),
    ],
  },

  // ── Band ─────────────────────────────────────────────────────────────────────
  {
    id: "band",
    name: "Band",
    category: "Layout",
    icon: "▬",
    description: "Full-width coloured section band",
    matches: () => false,
    themeGroups: [],
    template: [
      el("t0", "section", null, 0, "", {}, {
        display: "block", width: "100%", boxSizing: "border-box",
        backgroundColor: "#eff6ff", padding: "64px 48px",
      }),
    ],
  },

  // ── Navbar ───────────────────────────────────────────────────────────────────
  {
    id: "nav",
    name: "Navbar",
    category: "Navigation",
    icon: "🧭",
    description: "Navigation links — full width",
    matches: (children) => children.length >= 2 && children.every(c => c.tag === "a"),
    themeGroups: [
      {
        label: "Style",
        themes: [
          {
            id: "nav-light",
            name: "Light",
            description: "White background, dark links",
            parentStyles: {
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            },
            childStylesByTag: {
              a: { color: "#374151" },
            },
          },
          {
            id: "nav-dark",
            name: "Dark",
            description: "Dark background, muted links",
            parentStyles: {
              backgroundColor: "#0f172a",
              borderBottom: "none",
              boxShadow: "none",
            },
            childStylesByTag: {
              a: { color: "#94a3b8" },
            },
          },
          {
            id: "nav-brand",
            name: "Brand",
            description: "Blue background, white links",
            parentStyles: {
              backgroundColor: "#1d4ed8",
              borderBottom: "none",
              boxShadow: "none",
            },
            childStylesByTag: {
              a: { color: "rgba(255,255,255,0.88)" },
            },
          },
          {
            id: "nav-transparent",
            name: "Transparent",
            description: "No background — floats over content",
            parentStyles: {
              backgroundColor: "transparent",
              borderBottom: "none",
              boxShadow: "none",
            },
            childStylesByTag: {
              a: { color: "#0f172a" },
            },
          },
        ],
      },
      {
        label: "Spacing",
        themes: [
          {
            id: "nav-compact",
            name: "Compact",
            description: "Tight padding, 48px height",
            parentStyles: { padding: "0 24px", height: "48px" },
            childStylesByTag: { a: { height: "48px", padding: "0 12px", fontSize: "13px" } },
          },
          {
            id: "nav-standard",
            name: "Standard",
            description: "Default padding, 60px height",
            parentStyles: { padding: "0 32px", height: "60px" },
            childStylesByTag: { a: { height: "60px", padding: "0 16px", fontSize: "15px" } },
          },
          {
            id: "nav-spacious",
            name: "Spacious",
            description: "Wide padding, 72px height",
            parentStyles: { padding: "0 48px", height: "72px" },
            childStylesByTag: { a: { height: "72px", padding: "0 20px", fontSize: "15px" } },
          },
        ],
      },
    ],
    template: [
      el("t0", "nav", null, 0, "", {}, {
        display: "flex", alignItems: "center", gap: "4px",
        padding: "0 32px", height: "60px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        width: "100%", boxSizing: "border-box",
      }),
      el("t1", "a", "t0", 0, "Home",    { href: "#" }, { display: "flex", alignItems: "center", height: "60px", padding: "0 16px", fontSize: "15px", fontWeight: "500", color: "#374151", textDecoration: "none" }),
      el("t2", "a", "t0", 1, "About",   { href: "#" }, { display: "flex", alignItems: "center", height: "60px", padding: "0 16px", fontSize: "15px", fontWeight: "500", color: "#374151", textDecoration: "none" }),
      el("t3", "a", "t0", 2, "Work",    { href: "#" }, { display: "flex", alignItems: "center", height: "60px", padding: "0 16px", fontSize: "15px", fontWeight: "500", color: "#374151", textDecoration: "none" }),
      el("t4", "a", "t0", 3, "Contact", { href: "#" }, { display: "flex", alignItems: "center", height: "60px", padding: "0 16px", fontSize: "15px", fontWeight: "500", color: "#374151", textDecoration: "none" }),
    ],
  },

  // ── Hero ─────────────────────────────────────────────────────────────────────
  {
    id: "hero",
    name: "Hero",
    category: "Layout",
    icon: "🦸",
    description: "Full-width heading, tagline and CTA",
    matches: (children) => sortedTags(children) === "button,h1,p",
    themeGroups: [
      {
        // Colors ONLY — no layout properties
        label: "Colors",
        themes: [
          {
            id: "hero-color-light",
            name: "Light",
            description: "White/grey background, dark text",
            parentStyles: { backgroundColor: "#f8fafc", background: "" },
            childStylesByTag: {
              h1:     { color: "#0f172a" },
              p:      { color: "#64748b" },
              button: { backgroundColor: "#1d4ed8", color: "#ffffff", border: "none" },
            },
          },
          {
            id: "hero-color-white",
            name: "White",
            description: "Pure white background",
            parentStyles: { backgroundColor: "#ffffff", background: "" },
            childStylesByTag: {
              h1:     { color: "#0f172a" },
              p:      { color: "#64748b" },
              button: { backgroundColor: "#0f172a", color: "#ffffff", border: "none" },
            },
          },
          {
            id: "hero-color-dark",
            name: "Dark",
            description: "Dark gradient background, light text",
            parentStyles: { background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", backgroundColor: "" },
            childStylesByTag: {
              h1:     { color: "#f1f5f9" },
              p:      { color: "#94a3b8" },
              button: { backgroundColor: "#7c3aed", color: "#ffffff", border: "none" },
            },
          },
          {
            id: "hero-color-purple",
            name: "Purple",
            description: "Purple gradient background",
            parentStyles: { background: "linear-gradient(135deg, #4c1d95, #7c3aed)", backgroundColor: "" },
            childStylesByTag: {
              h1:     { color: "#ffffff" },
              p:      { color: "rgba(255,255,255,0.75)" },
              button: { backgroundColor: "#ffffff", color: "#7c3aed", border: "none" },
            },
          },
          {
            id: "hero-color-blue",
            name: "Blue",
            description: "Blue solid background",
            parentStyles: { backgroundColor: "#1d4ed8", background: "" },
            childStylesByTag: {
              h1:     { color: "#ffffff" },
              p:      { color: "rgba(255,255,255,0.8)" },
              button: { backgroundColor: "#ffffff", color: "#1d4ed8", border: "none" },
            },
          },
        ],
      },
      {
        // Layout ONLY — no color properties
        label: "Alignment",
        themes: [
          {
            id: "hero-layout-centered",
            name: "Centered",
            description: "Text centered, content centered",
            parentStyles: {
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center", padding: "100px 48px",
              width: "100%", boxSizing: "border-box", minHeight: "500px",
            },
            childStylesByTag: {
              h1: { textAlign: "center" },
              p:  { textAlign: "center" },
            },
          },
          {
            id: "hero-layout-left",
            name: "Left",
            description: "Left-aligned content",
            parentStyles: {
              display: "flex", flexDirection: "column",
              alignItems: "flex-start", justifyContent: "center",
              textAlign: "left", padding: "100px 10%",
              width: "100%", boxSizing: "border-box", minHeight: "460px",
            },
            childStylesByTag: {
              h1: { textAlign: "left" },
              p:  { textAlign: "left" },
            },
          },
          {
            id: "hero-layout-compact",
            name: "Compact",
            description: "Less vertical padding",
            parentStyles: {
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center", padding: "48px 48px",
              width: "100%", boxSizing: "border-box", minHeight: "300px",
            },
            childStylesByTag: {},
          },
        ],
      },
    ],
    template: [
      el("t0", "section", null, 0, "", {}, {
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "100px 48px",
        backgroundColor: "#f8fafc",
        width: "100%", boxSizing: "border-box", minHeight: "500px",
      }),
      el("t1", "h1",     "t0", 0, "Welcome to Your Website",                    {}, { fontSize: "52px", fontWeight: "800", color: "#0f172a", marginBottom: "20px", lineHeight: "1.15", display: "block" }),
      el("t2", "p",      "t0", 1, "Build something amazing. Get started today.", {}, { fontSize: "20px", color: "#64748b", marginBottom: "40px", lineHeight: "1.7", display: "block", maxWidth: "560px" }),
      el("t3", "button", "t0", 2, "Get Started", { type: "button" },                { padding: "16px 36px", backgroundColor: "#1d4ed8", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "inline-block" }),
    ],
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  {
    id: "card",
    name: "Card",
    category: "Content",
    icon: "🃏",
    description: "Image, title, description and action",
    matches: (children) => sortedTags(children) === "button,h3,img,p",
    themeGroups: [
      {
        label: null,
        themes: [
          {
            id: "card-clean",
            name: "Clean White",
            parentStyles: { backgroundColor: "#ffffff", background: "", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "none", borderRadius: "12px", overflow: "hidden", width: "300px" },
            childStylesByTag: {
              img:    { backgroundColor: "#e2e8f0" },
              h3:     { color: "#0f172a", padding: "20px 20px 8px", margin: "0", fontSize: "18px", fontWeight: "700", display: "block" },
              p:      { color: "#64748b", padding: "0 20px", fontSize: "14px", lineHeight: "1.65", margin: "0", display: "block" },
              button: { backgroundColor: "#1d4ed8", color: "#ffffff", border: "none", borderRadius: "6px", margin: "16px 20px 20px", padding: "10px 22px", fontSize: "14px", fontWeight: "600", display: "inline-block", cursor: "pointer" },
            },
          },
          {
            id: "card-dark",
            name: "Dark",
            parentStyles: { backgroundColor: "#1e293b", background: "", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", border: "none", borderRadius: "12px", overflow: "hidden", width: "300px" },
            childStylesByTag: {
              img:    { backgroundColor: "#334155" },
              h3:     { color: "#f1f5f9", padding: "20px 20px 8px", margin: "0", fontSize: "18px", fontWeight: "700", display: "block" },
              p:      { color: "#94a3b8", padding: "0 20px", fontSize: "14px", lineHeight: "1.65", margin: "0", display: "block" },
              button: { backgroundColor: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "6px", margin: "16px 20px 20px", padding: "10px 22px", fontSize: "14px", fontWeight: "600", display: "inline-block", cursor: "pointer" },
            },
          },
          {
            id: "card-outlined",
            name: "Outlined",
            parentStyles: { backgroundColor: "#ffffff", background: "", boxShadow: "none", border: "2px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", width: "300px" },
            childStylesByTag: {
              img:    { backgroundColor: "#f1f5f9" },
              h3:     { color: "#0f172a", padding: "20px 20px 8px", margin: "0", fontSize: "18px", fontWeight: "700", display: "block" },
              p:      { color: "#64748b", padding: "0 20px", fontSize: "14px", lineHeight: "1.65", margin: "0", display: "block" },
              button: { backgroundColor: "transparent", color: "#1d4ed8", border: "2px solid #1d4ed8", borderRadius: "6px", margin: "16px 20px 20px", padding: "10px 22px", fontSize: "14px", fontWeight: "600", display: "inline-block", cursor: "pointer" },
            },
          },
          {
            id: "card-glass",
            name: "Glass",
            // Frosted glass: semi-opaque white tint, dark text so it's readable on any background
            parentStyles: { background: "rgba(255,255,255,0.55)", backgroundColor: "", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "16px", overflow: "hidden", width: "300px" },
            childStylesByTag: {
              img:    { backgroundColor: "#e2e8f0" },
              h3:     { color: "#0f172a", padding: "20px 20px 8px", margin: "0", fontSize: "18px", fontWeight: "700", display: "block" },
              p:      { color: "#374151", padding: "0 20px", fontSize: "14px", lineHeight: "1.65", margin: "0", display: "block" },
              button: { backgroundColor: "#1d4ed8", color: "#ffffff", border: "none", borderRadius: "6px", margin: "16px 20px 20px", padding: "10px 22px", fontSize: "14px", fontWeight: "600", display: "inline-block", cursor: "pointer" },
            },
          },
        ],
      },
    ],
    template: [
      el("t0", "div",    null, 0, "",                       {}, { display: "block", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", width: "300px" }),
      el("t1", "img",    "t0", 0, "",                       { src: "", alt: "Card image" }, { width: "100%", height: "200px", objectFit: "cover", display: "block", backgroundColor: "#e2e8f0" }),
      el("t2", "h3",     "t0", 1, "Card Title",             {}, { fontSize: "18px", fontWeight: "700", color: "#0f172a", padding: "20px 20px 8px", margin: "0", display: "block" }),
      el("t3", "p",      "t0", 2, "Description goes here.", {}, { fontSize: "14px", color: "#64748b", padding: "0 20px", lineHeight: "1.65", margin: "0", display: "block" }),
      el("t4", "button", "t0", 3, "Learn More",             { type: "button" }, { display: "inline-block", margin: "16px 20px 20px", padding: "10px 22px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }),
    ],
  },

  // ── Feature ──────────────────────────────────────────────────────────────────
  {
    id: "feature",
    name: "Feature",
    category: "Content",
    icon: "⭐",
    description: "Title and description pair",
    matches: (children) => sortedTags(children) === "h2,p",
    themeGroups: [
      {
        label: "Colors",
        themes: [
          {
            id: "feature-neutral",
            name: "Neutral",
            parentStyles: { backgroundColor: "#f8fafc", background: "", border: "1px solid #e2e8f0", borderLeft: "" },
            childStylesByTag: { h2: { color: "#0f172a" }, p: { color: "#64748b" } },
          },
          {
            id: "feature-white",
            name: "White",
            parentStyles: { backgroundColor: "#ffffff", background: "", border: "1px solid #e2e8f0", borderLeft: "" },
            childStylesByTag: { h2: { color: "#0f172a" }, p: { color: "#64748b" } },
          },
          {
            id: "feature-accent",
            name: "Blue Accent",
            parentStyles: { backgroundColor: "#eff6ff", background: "", border: "none", borderLeft: "4px solid #1d4ed8" },
            childStylesByTag: { h2: { color: "#1e40af" }, p: { color: "#374151" } },
          },
          {
            id: "feature-dark",
            name: "Dark",
            parentStyles: { backgroundColor: "#1e293b", background: "", border: "none", borderLeft: "" },
            childStylesByTag: { h2: { color: "#f1f5f9" }, p: { color: "#94a3b8" } },
          },
          {
            id: "feature-green",
            name: "Green Accent",
            parentStyles: { backgroundColor: "#f0fdf4", background: "", border: "none", borderLeft: "4px solid #16a34a" },
            childStylesByTag: { h2: { color: "#15803d" }, p: { color: "#374151" } },
          },
        ],
      },
      {
        label: "Style",
        themes: [
          {
            id: "feature-style-box",
            name: "Box",
            parentStyles: { borderRadius: "12px", padding: "28px", display: "block", width: "100%", boxSizing: "border-box" },
            childStylesByTag: { h2: { marginBottom: "10px", fontSize: "18px", fontWeight: "700", display: "block" }, p: { lineHeight: "1.7", fontSize: "14px", display: "block" } },
          },
          {
            id: "feature-style-minimal",
            name: "Minimal",
            parentStyles: { borderRadius: "0", padding: "28px 0", borderBottom: "1px solid #e2e8f0", display: "block", width: "100%", boxSizing: "border-box" },
            childStylesByTag: { h2: { marginBottom: "8px", fontSize: "20px", fontWeight: "700", display: "block" }, p: { lineHeight: "1.7", fontSize: "15px", display: "block" } },
          },
        ],
      },
    ],
    template: [
      el("t0", "div", null, 0, "", {}, { display: "block", padding: "28px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", boxSizing: "border-box" }),
      el("t1", "h2", "t0", 0, "Feature Title",              {}, { fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "10px", display: "block" }),
      el("t2", "p",  "t0", 1, "Describe what makes this feature valuable to your users.", {}, { fontSize: "15px", color: "#64748b", lineHeight: "1.7", display: "block" }),
    ],
  },

  // ── Two Column ───────────────────────────────────────────────────────────────
  {
    id: "two-column",
    name: "Two Column",
    category: "Layout",
    icon: "▊",
    description: "Side-by-side columns",
    matches: (children) => sortedTags(children) === "div,div",
    themeGroups: [
      {
        label: "Colors",
        themes: [
          {
            id: "twocol-light",
            name: "Light",
            childStylesByTag: { div: { backgroundColor: "#f8fafc", borderRadius: "10px" } },
          },
          {
            id: "twocol-white",
            name: "White",
            childStylesByTag: { div: { backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" } },
          },
          {
            id: "twocol-dark",
            name: "Dark",
            childStylesByTag: { div: { backgroundColor: "#1e293b", borderRadius: "10px", border: "none" } },
          },
          {
            id: "twocol-transparent",
            name: "None",
            childStylesByTag: { div: { backgroundColor: "transparent", borderRadius: "0", border: "none" } },
          },
        ],
      },
      {
        label: "Layout",
        themes: [
          {
            id: "twocol-equal",
            name: "Equal",
            description: "Both columns same width",
            parentStyles: { display: "flex", gap: "32px", alignItems: "flex-start", width: "100%", boxSizing: "border-box" },
            childStylesByTag: { div: { flex: "1", padding: "24px", minHeight: "120px", display: "block" } },
          },
          {
            id: "twocol-sidebar-left",
            name: "Sidebar Left",
            description: "Narrow left column, wide right",
            parentStyles: { display: "flex", gap: "32px", alignItems: "flex-start", width: "100%", boxSizing: "border-box" },
            childStylesByIndex: [
              { flex: "0 0 220px", padding: "24px", minHeight: "200px", display: "block" },
              { flex: "1", padding: "24px", minHeight: "200px", display: "block" },
            ],
            childStylesByTag: {},
          },
          {
            id: "twocol-sidebar-right",
            name: "Sidebar Right",
            description: "Wide left column, narrow right",
            parentStyles: { display: "flex", gap: "32px", alignItems: "flex-start", width: "100%", boxSizing: "border-box" },
            childStylesByIndex: [
              { flex: "1", padding: "24px", minHeight: "200px", display: "block" },
              { flex: "0 0 220px", padding: "24px", minHeight: "200px", display: "block" },
            ],
            childStylesByTag: {},
          },
          {
            id: "twocol-stacked",
            name: "Stacked",
            description: "Stack columns vertically on top of each other",
            parentStyles: { display: "flex", flexDirection: "column", gap: "24px", width: "100%", boxSizing: "border-box" },
            childStylesByTag: { div: { flex: "unset", width: "100%", padding: "24px", display: "block" } },
          },
        ],
      },
    ],
    template: [
      el("t0", "div", null, 0, "", {}, { display: "flex", gap: "32px", alignItems: "flex-start", width: "100%", boxSizing: "border-box" }),
      el("t1", "div", "t0", 0, "Left column", {}, { flex: "1", padding: "24px", backgroundColor: "#f8fafc", borderRadius: "10px", display: "block", minHeight: "120px" }),
      el("t2", "div", "t0", 1, "Right column", {}, { flex: "1", padding: "24px", backgroundColor: "#f8fafc", borderRadius: "10px", display: "block", minHeight: "120px" }),
    ],
  },

  // ── Testimonial ───────────────────────────────────────────────────────────────
  {
    id: "testimonial",
    name: "Testimonial",
    category: "Content",
    icon: "💬",
    description: "Quote and author name",
    matches: (children) => sortedTags(children) === "h3,p",
    themeGroups: [
      {
        label: null,
        themes: [
          {
            id: "testimonial-quote",
            name: "Quote",
            parentStyles: { backgroundColor: "#f8fafc", background: "", borderLeft: "5px solid #1d4ed8", borderRadius: "0 12px 12px 0", boxShadow: "none", padding: "36px 32px", display: "block", width: "100%", boxSizing: "border-box" },
            childStylesByTag: {
              p:  { color: "#374151", fontSize: "18px", fontStyle: "italic", lineHeight: "1.8", marginBottom: "20px", display: "block" },
              h3: { color: "#64748b", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" },
            },
          },
          {
            id: "testimonial-card",
            name: "Card",
            parentStyles: { backgroundColor: "#ffffff", background: "", borderLeft: "none", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", padding: "36px 32px", display: "block", width: "100%", boxSizing: "border-box" },
            childStylesByTag: {
              p:  { color: "#374151", fontSize: "18px", fontStyle: "italic", lineHeight: "1.8", marginBottom: "24px", display: "block" },
              h3: { color: "#1d4ed8", fontSize: "14px", fontWeight: "700", display: "block" },
            },
          },
          {
            id: "testimonial-dark",
            name: "Dark",
            parentStyles: { backgroundColor: "#1e293b", background: "", borderLeft: "5px solid #7c3aed", borderRadius: "0 16px 16px 0", boxShadow: "none", padding: "36px 32px", display: "block", width: "100%", boxSizing: "border-box" },
            childStylesByTag: {
              p:  { color: "#cbd5e1", fontSize: "18px", fontStyle: "italic", lineHeight: "1.8", marginBottom: "24px", display: "block" },
              h3: { color: "#a78bfa", fontSize: "14px", fontWeight: "700", display: "block" },
            },
          },
        ],
      },
    ],
    template: [
      el("t0", "div", null, 0, "", {}, { display: "block", padding: "36px 32px", backgroundColor: "#f8fafc", borderLeft: "5px solid #1d4ed8", borderRadius: "0 12px 12px 0", width: "100%", boxSizing: "border-box" }),
      el("t1", "p",  "t0", 0, "This product changed how we work. Absolutely recommend it.", {}, { fontSize: "18px", color: "#374151", lineHeight: "1.8", fontStyle: "italic", marginBottom: "20px", display: "block" }),
      el("t2", "h3", "t0", 1, "— Jane Smith, CEO at Acme", {}, { fontSize: "14px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }),
    ],
  },

  // ── Pricing Card ────────────────────────────────────────────────────────────
  {
    id: "pricing",
    name: "Pricing",
    category: "Content",
    icon: "💳",
    description: "Plan name, price and CTA",
    matches: (children) => sortedTags(children) === "button,h2,h3",
    themeGroups: [
      {
        label: null,
        themes: [
          {
            id: "pricing-clean",
            name: "Clean",
            parentStyles: { backgroundColor: "#ffffff", background: "", border: "2px solid #e2e8f0", boxShadow: "none", borderRadius: "16px", padding: "40px 32px", textAlign: "center", display: "block", width: "260px" },
            childStylesByTag: {
              h3:     { color: "#64748b", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "block" },
              h2:     { color: "#0f172a", fontSize: "52px", fontWeight: "900", marginBottom: "28px", lineHeight: "1", display: "block" },
              button: { backgroundColor: "#1d4ed8", color: "#ffffff", border: "none", borderRadius: "8px", width: "100%", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "block", boxSizing: "border-box" },
            },
          },
          {
            id: "pricing-featured",
            name: "Featured",
            parentStyles: { background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", backgroundColor: "", border: "none", boxShadow: "0 12px 40px rgba(29,78,216,0.35)", borderRadius: "16px", padding: "40px 32px", textAlign: "center", display: "block", width: "260px" },
            childStylesByTag: {
              h3:     { color: "rgba(255,255,255,0.65)", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "block" },
              h2:     { color: "#ffffff", fontSize: "52px", fontWeight: "900", marginBottom: "28px", lineHeight: "1", display: "block" },
              button: { backgroundColor: "#ffffff", color: "#1d4ed8", border: "none", borderRadius: "8px", width: "100%", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "block", boxSizing: "border-box" },
            },
          },
          {
            id: "pricing-dark",
            name: "Dark",
            parentStyles: { backgroundColor: "#1e293b", background: "", border: "1px solid #334155", boxShadow: "none", borderRadius: "16px", padding: "40px 32px", textAlign: "center", display: "block", width: "260px" },
            childStylesByTag: {
              h3:     { color: "#64748b", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "block" },
              h2:     { color: "#f1f5f9", fontSize: "52px", fontWeight: "900", marginBottom: "28px", lineHeight: "1", display: "block" },
              button: { backgroundColor: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "8px", width: "100%", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "block", boxSizing: "border-box" },
            },
          },
        ],
      },
    ],
    template: [
      el("t0", "div",    null, 0, "",        {}, { display: "block", padding: "40px 32px", backgroundColor: "#ffffff", borderRadius: "16px", border: "2px solid #e2e8f0", textAlign: "center", width: "260px" }),
      el("t1", "h3",     "t0", 0, "Starter", {}, { fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "block" }),
      el("t2", "h2",     "t0", 1, "$29/mo",  {}, { fontSize: "52px", fontWeight: "900", color: "#0f172a", marginBottom: "28px", lineHeight: "1", display: "block" }),
      el("t3", "button", "t0", 2, "Get Started", { type: "button" }, { display: "block", width: "100%", padding: "14px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxSizing: "border-box" }),
    ],
  },
];

// ─── Detect matching components for a selected parent ─────────────────────────
export function detectComponents(parentId, elements) {
  const parent   = elements.find(e => e.id === parentId);
  const parentTag = parent?.tag ?? null;

  const children = elements
    .filter(e => e.parentId === parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return COMPONENTS.filter(comp => {
    try { return comp.matches(children, parentTag); } catch { return false; }
  });
}

// ─── Build style updates for applying a theme ─────────────────────────────────
export function buildThemeUpdates(parentId, elements, theme) {
  const children = elements
    .filter(e => e.parentId === parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const updates = [];

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

