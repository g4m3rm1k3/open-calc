import type { LabElement, SinglePageData } from "./types";
import { JS_PRESETS } from "./jsPresets";

function mk(
  id: string,
  tag: string,
  parentId: string | null,
  order: number,
  content: string,
  styles: Record<string, string>,
  cls?: string,
  extraAttrs?: Record<string, string>,
): LabElement {
  return {
    id, tag, parentId, order, content,
    attrs: { id: "", class: cls || "", ...(extraAttrs || {}) },
    styles: { ...styles },
    mediaQueries: [],
  };
}

function usePreset(
  presetId: string,
  newParentId: string | null | undefined,
  newOrder: number | undefined,
  rootStyleOverrides?: Record<string, string>,
): { elements: LabElement[]; code: string } {
  const preset = JS_PRESETS.find(p => p.id === presetId);
  if (!preset?.template) return { elements: [], code: "" };

  let counter = 0;
  const prefix = `${presetId.replace(/-/g, "_")}_`;
  const idMap: Record<string, string> = {};

  const cloned = JSON.parse(JSON.stringify(preset.template)) as LabElement[];
  cloned.forEach(el => {
    const fresh = prefix + counter++;
    idMap[el.id] = fresh;
    el.id = fresh;
  });
  cloned.forEach(el => {
    if (el.parentId && idMap[el.parentId]) el.parentId = idMap[el.parentId];
  });

  const root = cloned.find(el => el.parentId === null);
  if (root) {
    if (newParentId !== undefined) root.parentId = newParentId;
    if (newOrder   !== undefined) root.order     = newOrder;
    if (rootStyleOverrides)       root.styles    = { ...root.styles, ...rootStyleOverrides };
  }

  return { elements: cloned, code: preset.code };
}

export function generateExampleProject(): SinglePageData {
  const els: LabElement[] = [];
  const code: string[] = [];
  let seq = 1;
  const id = () => `ex${seq++}`;

  // ── 1. Nav ────────────────────────────────────────────────────────────────────
  const navId = id();
  els.push(mk(navId, "nav", null, 0, "", {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "0 40px", height: "64px",
    backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b",
    width: "100%", boxSizing: "border-box",
  }));
  els.push(mk(id(), "h3", navId, 0, "⚡ HtmlLab", {
    fontSize: "17px", fontWeight: "800", color: "#f8fafc",
    margin: "0", flexGrow: "1", display: "block",
  }));
  ([ ["Explore", 1], ["Components", 2], ["Docs", 3] ] as [string, number][]).forEach(([text, order]) =>
    els.push(mk(id(), "a", navId, order, text, {
      display: "flex", alignItems: "center", height: "64px",
      padding: "0 14px", fontSize: "14px", fontWeight: "500",
      color: "#94a3b8", textDecoration: "none",
    }, "", { href: "#" }))
  );

  // ── 2. Hero ───────────────────────────────────────────────────────────────────
  const heroId = id();
  els.push(mk(heroId, "section", null, 1, "", {
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", padding: "96px 48px 72px",
    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    width: "100%", boxSizing: "border-box",
  }));
  els.push(mk(id(), "div", heroId, 0, "✨ Interactive Learning Playground", {
    display: "inline-block", padding: "6px 18px", borderRadius: "100px",
    backgroundColor: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
    color: "#60a5fa", fontSize: "13px", fontWeight: "600", marginBottom: "24px",
  }));
  els.push(mk(id(), "h1", heroId, 1, "Build with HTML & JavaScript", {
    fontSize: "58px", fontWeight: "800", color: "#f8fafc",
    marginBottom: "20px", lineHeight: "1.1", letterSpacing: "-0.03em",
    display: "block", maxWidth: "780px",
  }));
  els.push(mk(id(), "p", heroId, 2,
    "Hit ▶ Preview in the toolbar to see it live — every component below is wired up with vanilla JavaScript. In Edit mode, click any element to inspect and change its styles.", {
      fontSize: "18px", color: "#94a3b8", marginBottom: "44px",
      lineHeight: "1.7", display: "block", maxWidth: "580px",
  }));
  els.push(mk(id(), "button", heroId, 3, "See How It Works →", {
    padding: "16px 36px", backgroundColor: "#3b82f6", color: "#ffffff",
    border: "none", borderRadius: "10px", fontSize: "16px",
    fontWeight: "700", cursor: "pointer", display: "inline-block",
  }, "js-modal-open", { type: "button" }));

  // ── 3. Stats row ─────────────────────────────────────────────────────────────
  const statsSec = id();
  els.push(mk(statsSec, "section", null, 2, "", {
    display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "24px",
    padding: "48px 40px", backgroundColor: "#0f172a",
    width: "100%", boxSizing: "border-box",
  }));
  const stats: [string, string, string][] = [
    ["🎨", "6 Presets",    "JavaScript components"],
    ["📦", "14 Components", "Drag-and-drop library"],
    ["⚡", "Zero Build",   "Vanilla JS, no frameworks"],
  ];
  stats.forEach(([icon, val, label], i) => {
    const cardId = id();
    els.push(mk(cardId, "div", statsSec, i, "", {
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", padding: "28px 36px",
      backgroundColor: "#1e293b", borderRadius: "16px",
      border: "1px solid #334155", minWidth: "180px",
    }));
    els.push(mk(id(), "p",  cardId, 0, icon, { fontSize: "28px", margin: "0 0 8px", display: "block" }));
    els.push(mk(id(), "h2", cardId, 1, val,  { fontSize: "24px", fontWeight: "800", color: "#f8fafc", margin: "0 0 4px", lineHeight: "1", display: "block" }));
    els.push(mk(id(), "p",  cardId, 2, label, { fontSize: "13px", color: "#64748b", margin: "0", display: "block" }));
  });

  // ── 4. Counter + Show/Hide row ────────────────────────────────────────────────
  const interactiveSec = id();
  els.push(mk(interactiveSec, "section", null, 3, "", {
    display: "block", padding: "64px 40px",
    backgroundColor: "#0f172a", width: "100%", boxSizing: "border-box",
  }));
  els.push(mk(id(), "p", interactiveSec, 0, "⚡ Interactive Components", {
    fontSize: "12px", fontWeight: "700", color: "#3b82f6",
    textTransform: "uppercase", letterSpacing: "0.1em",
    marginBottom: "8px", display: "block",
  }));
  els.push(mk(id(), "h2", interactiveSec, 1, "Click them — they actually work", {
    fontSize: "32px", fontWeight: "800", color: "#f8fafc",
    marginBottom: "40px", display: "block",
  }));

  const row1Id = id();
  els.push(mk(row1Id, "div", interactiveSec, 2, "", {
    display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px", alignItems: "start",
  }));

  const counter = usePreset("counter", row1Id, 0, {
    width: "100%", boxSizing: "border-box",
    backgroundColor: "#1e293b", border: "1px solid #334155",
  });
  const numEl = counter.elements.find(e => e.attrs?.class?.includes("js-count"));
  if (numEl) numEl.styles.color = "#f8fafc";
  const lbl = counter.elements.find(e => e.content === "COUNT");
  if (lbl) lbl.styles.color = "#64748b";
  els.push(...counter.elements);
  if (counter.code) code.push(counter.code);

  const showHide = usePreset("show-hide", row1Id, 1, {
    width: "100%", boxSizing: "border-box",
    backgroundColor: "#1e293b", border: "1px solid #334155",
  });
  const toggleTarget = showHide.elements.find(e => e.attrs?.class?.includes("js-toggle-target"));
  if (toggleTarget) {
    toggleTarget.styles.backgroundColor = "#0f172a";
    toggleTarget.styles.color = "#94a3b8";
    toggleTarget.styles.border = "1px solid #334155";
  }
  els.push(...showHide.elements);
  if (showHide.code) code.push(showHide.code);

  // ── 5. Tabs section ───────────────────────────────────────────────────────────
  const tabsSec = id();
  els.push(mk(tabsSec, "section", null, 4, "", {
    display: "block", padding: "0 40px 64px",
    backgroundColor: "#0f172a", width: "100%", boxSizing: "border-box",
  }));
  els.push(mk(id(), "p",  tabsSec, 0, "📑 Tabs Component", {
    fontSize: "12px", fontWeight: "700", color: "#3b82f6",
    textTransform: "uppercase", letterSpacing: "0.1em",
    marginBottom: "8px", display: "block",
  }));
  els.push(mk(id(), "h2", tabsSec, 1, "Tabbed content, zero dependencies", {
    fontSize: "32px", fontWeight: "800", color: "#f8fafc",
    marginBottom: "32px", display: "block",
  }));

  const tabs = usePreset("tabs", tabsSec, 2, {
    border: "1px solid #334155", backgroundColor: "#1e293b",
  });
  const tabRow = tabs.elements.find(e => !e.parentId?.includes("root") && e.styles?.backgroundColor === "#f8fafc");
  if (tabRow) tabRow.styles.backgroundColor = "#0f172a";
  const panel1 = tabs.elements.find(e => e.attrs?.class?.includes("js-panel-1"));
  const panel2 = tabs.elements.find(e => e.attrs?.class?.includes("js-panel-2"));
  if (panel1) { panel1.styles.color = "#94a3b8"; panel1.content = "This is Tab 1 content. Tabs are great for grouping related information without cluttering the page. The JavaScript listens for clicks on each tab button and toggles display on the panels."; }
  if (panel2) { panel2.styles.color = "#94a3b8"; panel2.content = "Tab 2 is hidden by default (display: none). When you click Tab 2, the JS sets Tab 1 panel to display:none and this panel to display:block. Select the tab buttons in the Tree to see the JS class names used to wire everything up."; }
  els.push(...tabs.elements);
  if (tabs.code) code.push(tabs.code);

  // ── 6. Toast section ─────────────────────────────────────────────────────────
  const toastSec = id();
  els.push(mk(toastSec, "section", null, 5, "", {
    display: "block", padding: "0 40px 64px",
    backgroundColor: "#0f172a", width: "100%", boxSizing: "border-box",
  }));
  els.push(mk(id(), "p",  toastSec, 0, "🔔 Toast Notification", {
    fontSize: "12px", fontWeight: "700", color: "#3b82f6",
    textTransform: "uppercase", letterSpacing: "0.1em",
    marginBottom: "8px", display: "block",
  }));
  els.push(mk(id(), "h2", toastSec, 1, "Trigger and auto-dismiss", {
    fontSize: "32px", fontWeight: "800", color: "#f8fafc",
    marginBottom: "32px", display: "block",
  }));

  const toast = usePreset("toast", toastSec, 2);
  els.push(...toast.elements);
  if (toast.code) code.push(toast.code);

  // ── 7. CTA banner ─────────────────────────────────────────────────────────────
  const ctaSec = id();
  els.push(mk(ctaSec, "section", null, 6, "", {
    display: "block", padding: "40px",
    backgroundColor: "#0f172a", width: "100%", boxSizing: "border-box",
  }));
  const ctaBox = id();
  els.push(mk(ctaBox, "div", ctaSec, 0, "", {
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", padding: "80px 48px",
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    borderRadius: "24px",
  }));
  els.push(mk(id(), "h2", ctaBox, 0, "Now build your own.", {
    fontSize: "40px", fontWeight: "800", color: "#ffffff",
    marginBottom: "16px", lineHeight: "1.15", display: "block",
  }));
  els.push(mk(id(), "p", ctaBox, 1,
    "Select any element on this page. Change its styles in the Properties panel. Drag it in the Tree. The whole page is yours.", {
      fontSize: "18px", color: "rgba(255,255,255,0.85)",
      marginBottom: "40px", lineHeight: "1.6",
      display: "block", maxWidth: "520px",
  }));
  els.push(mk(id(), "button", ctaBox, 2, "Add an Element ↑", {
    padding: "16px 36px", backgroundColor: "#ffffff", color: "#1e40af",
    border: "none", borderRadius: "10px", fontSize: "16px",
    fontWeight: "700", cursor: "pointer", display: "inline-block",
  }, "", { type: "button" }));

  // ── 8. Modal overlay ──────────────────────────────────────────────────────────
  const overlayId = id();
  els.push(mk(overlayId, "div", null, 7, "", {
    display: "none", position: "fixed", top: "0", left: "0",
    width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center", justifyContent: "center", zIndex: "1000",
  }, "js-modal-overlay"));
  const boxId = id();
  els.push(mk(boxId, "div", overlayId, 0, "", {
    backgroundColor: "#1e293b", borderRadius: "20px",
    padding: "40px", maxWidth: "520px", width: "90%",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
    border: "1px solid #334155",
  }));
  els.push(mk(id(), "h3", boxId, 0, "How the JavaScript works", {
    fontSize: "22px", fontWeight: "700", color: "#f8fafc",
    margin: "0 0 16px", display: "block",
  }));
  els.push(mk(id(), "p", boxId, 1,
    "Every component uses CSS class selectors (.js-count, .js-modal-open, etc.) so the JavaScript keeps working even after elements are rearranged. Switch to the JavaScript tab in the editor to read the code — each block is an IIFE so they stay independent. Hit ▶ Preview to run it.", {
      fontSize: "15px", color: "#94a3b8", lineHeight: "1.7",
      margin: "0 0 28px", display: "block",
  }));
  els.push(mk(id(), "button", boxId, 2, "Got it ✓", {
    padding: "12px 28px", backgroundColor: "#3b82f6", color: "#ffffff",
    border: "none", borderRadius: "8px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer", display: "inline-block",
  }, "js-modal-close", { type: "button" }));

  code.push(`(function () {
  var overlay = document.querySelector('.js-modal-overlay');
  var openBtn = document.querySelector('.js-modal-open');
  var closeBtn = document.querySelector('.js-modal-close');
  if (!overlay || !openBtn) return;
  openBtn.addEventListener('click', function () {
    overlay.style.display = 'flex';
  });
  if (closeBtn) closeBtn.addEventListener('click', function () {
    overlay.style.display = 'none';
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.style.display = 'none';
  });
})();`);

  // ── 9. Footer ─────────────────────────────────────────────────────────────────
  const footerId = id();
  els.push(mk(footerId, "footer", null, 8, "", {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: "16px", padding: "32px 40px",
    backgroundColor: "#020617", borderTop: "1px solid #1e293b",
    width: "100%", boxSizing: "border-box",
  }));
  els.push(mk(id(), "p", footerId, 0, "© 2025 HtmlLab — An interactive HTML playground", {
    fontSize: "13px", color: "#475569", margin: "0", display: "block",
  }));
  const footerLinks = id();
  els.push(mk(footerLinks, "div", footerId, 1, "", {
    display: "flex", gap: "24px", alignItems: "center",
  }));
  ([ ["Privacy", 0], ["Terms", 1], ["GitHub", 2] ] as [string, number][]).forEach(([text, i]) =>
    els.push(mk(id(), "a", footerLinks, i, text, {
      fontSize: "13px", color: "#64748b", textDecoration: "none", display: "inline",
    }, "", { href: "#" }))
  );

  // Fix root ordering
  let rootOrder = 0;
  els.filter(e => e.parentId === null).forEach(e => { e.order = rootOrder++; });

  return {
    bodyStyles: {
      backgroundColor: "#0f172a",
      color: "#f8fafc",
      fontFamily: "system-ui, -apple-system, sans-serif",
      margin: "0",
      padding: "0",
      fontSize: "16px",
      lineHeight: "1.5",
    },
    elements: els,
    javascript: code.join("\n\n"),
  };
}
