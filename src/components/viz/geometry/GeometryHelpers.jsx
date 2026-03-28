import { useState, useEffect, useRef } from "react";

export function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"; document.head.appendChild(link);
    const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"; s.onload = () => setReady(true); document.head.appendChild(s);
  }, []);
  return ready;
}

export function M({ t, display = false, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !window.katex || !t) return;
    try { window.katex.render(t, ref.current, { throwOnError: false, displayMode: display }); } catch (_) { if (ref.current) ref.current.textContent = t; }
  }, [t, display, ready]);
  if (!t) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

export function WhyPanel({ depth = 0, tag, children }) {
  const [open, setOpen] = useState(false);
  const colors = [
    { border: "#4f46e5", bg: "#eef2ff", text: "#3730a3" },
    { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" },
    { border: "#059669", bg: "#ecfdf5", text: "#047857" },
    { border: "#d97706", bg: "#fffbeb", text: "#92400e" },
  ];
  const c = colors[Math.min(depth, colors.length - 1)];
  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? c.bg : "transparent", border: `1px solid ${c.border}`, borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: c.border, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        <span style={{ width: 15, height: 15, borderRadius: "50%", background: c.border, color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{open ? "−" : "?"}</span>
        {open ? "Close" : tag}
      </button>
      {open && <div style={{ marginTop: 8, padding: "12px 14px", background: "var(--color-background-secondary)", borderLeft: `3px solid ${c.border}`, borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>{children}</div>}
    </div>
  );
}

// ─── Shared layout helpers ──────────────────────────────────────────────────
export const mkPanel = { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 14 };
export const mkHdr = (tag, ts, title) => (<div style={{ padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, ...ts }}>{tag}</span><span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</span></div>);
export const mkBody = { padding: "16px 20px" };
export const mkMbox = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "12px 16px", textAlign: "center", overflowX: "auto", margin: "10px 0" };
export const mkInsight = (col = "#4f46e5") => ({ padding: "12px 14px", borderLeft: `3px solid ${col}`, background: "var(--color-background-secondary)", borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: "10px 0" });
export const mkBadge = (ch) => (<div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>{`Geometry · Book 1 · Chapter ${ch}`}</div>);
export const mkHook = (text) => (<div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--color-text-tertiary)", marginBottom: 5 }}>The situation</div><div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.45 }}>{text}</div></div>);
export const mkSeed = (text) => (<div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #b45309", borderRadius: "0 0 10px 10px", padding: "12px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>{text}</div>);

export function StepBlock({ num, label, tex, note, ready, col = "#4f46e5" }) {
  const ref = useRef(null);
  useEffect(() => { if (ready && ref.current && window.katex && tex) { try { window.katex.render(tex, ref.current, { throwOnError: false, displayMode: true }); } catch (_) { if (ref.current) ref.current.textContent = tex; } } }, [tex, ready]);
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: col, color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</span></div>
      {tex && <div ref={ref} style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: 8, textAlign: "center", overflowX: "auto", marginBottom: 5 }} />}
      {note && <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{note}</div>}
    </div>
  );
}
