// OpenMatNotebook.jsx
// Inline MATLAB-like notebook cells embedded in LA lessons.
// Execution engine: shared with OpenMatStudio via openmatEngine.js (single source of truth).
// "Open in OpenMAT" writes to the same localStorage keys OpenMatStudio already reads.

import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { create, all, format as mathFormat } from "mathjs";
import { runOpenMatScript } from "../../../utils/openmatEngine.js"; // ← single source of truth
import FigureRenderer from "./FigureRenderer";
import { parseProse } from "../../math/parseProse.jsx";
import { setupOpenCalcMonaco } from "../../../utils/monacoThemes.js";

const math = create(all, { precision: 6 });

// ── Colors (same hook as every other viz component) ──────────────────────────
function useColors() {
  const isDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return {
    dark,
    bg: dark ? "#0f172a" : "#f8fafc",
    surface: dark ? "#1e293b" : "#ffffff",
    surface2: dark ? "#0f172a" : "#f1f5f9",
    border: dark ? "#334155" : "#e2e8f0",
    text: dark ? "#e2e8f0" : "#1e293b",
    muted: dark ? "#94a3b8" : "#64748b",
    hint: dark ? "#475569" : "#94a3b8",
    blue: dark ? "#38bdf8" : "#0284c7",
    blueBg: dark ? "rgba(56,189,248,0.12)" : "rgba(2,132,199,0.08)",
    blueBd: dark ? "#38bdf8" : "#0284c7",
    amber: dark ? "#fbbf24" : "#d97706",
    amberBg: dark ? "rgba(251,191,36,0.12)" : "rgba(217,119,6,0.08)",
    amberBd: dark ? "#fbbf24" : "#d97706",
    green: dark ? "#4ade80" : "#16a34a",
    greenBg: dark ? "rgba(74,222,128,0.12)" : "rgba(22,163,74,0.08)",
    greenBd: dark ? "#4ade80" : "#16a34a",
    red: dark ? "#f87171" : "#dc2626",
    redBg: dark ? "rgba(248,113,113,0.12)" : "rgba(220,38,38,0.08)",
    redBd: dark ? "#f87171" : "#dc2626",
    teal: dark ? "#2dd4bf" : "#0d9488",
    tealBg: dark ? "rgba(45,212,191,0.12)" : "rgba(13,148,136,0.08)",
    tealBd: dark ? "#2dd4bf" : "#0d9488",
    purple: dark ? "#a78bfa" : "#7c3aed",
    purpleBg: dark ? "rgba(167,139,250,0.12)" : "rgba(124,58,237,0.08)",
    purpleBd: dark ? "#a78bfa" : "#7c3aed",
    orange: dark ? "#fb923c" : "#ea580c",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTION ENGINE
// Mirrors the core of OpenMatStudio's executeScript / createExecutionEngine.
// Key functions: rref, lu, eig, svd, qr, det, rank, null, orth, cond, inv
// Control flow: for, while, if/elseif/else/end, functions
// Plotting: plot, scatter, bar, stem, hist → opencalc_figure JSON
// Output: disp, fprintf, num2str, sprintf
// TODO: Extract shared engine to src/utils/openmatEngine.js so this and
//       OpenMatStudio.jsx both import from one place.
// ─────────────────────────────────────────────────────────────────────────────

function toPlain(value) {
  if (value && typeof value.valueOf === "function") {
    const p = value.valueOf();
    if (p !== value) return toPlain(p);
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    if ("re" in value && "im" in value && Object.keys(value).length <= 3) return value;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
}

function isComplexLike(v) { return v && typeof v === "object" && "re" in v && "im" in v; }
function realValue(v) {
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (isComplexLike(v)) return Number(v.re ?? 0);
  return Number(v);
}
function isMatrix(v) { return Array.isArray(v) && Array.isArray(v[0]); }
function normalizeVector(v) {
  const p = toPlain(v);
  if (!Array.isArray(p)) return [realValue(p)];
  if (Array.isArray(p[0]) && p[0].length === 1) return p.map(r => realValue(r[0]));
  return p.flat().map(realValue);
}
function isCollection(v) { return Array.isArray(toPlain(v)); }
function mapDeep(v, fn) {
  const p = toPlain(v);
  return Array.isArray(p) ? p.map(e => mapDeep(e, fn)) : fn(p);
}
function toNumericMatrix(v) {
  const p = toPlain(v);
  if (!Array.isArray(p) || !p.length) return null;
  if (!Array.isArray(p[0])) return p.map(e => [realValue(e)]);
  return p.map(r => r.map(e => realValue(e)));
}
function inferSize(v) {
  const p = toPlain(v);
  if (p == null) return [0, 0];
  if (!Array.isArray(p)) return [1, 1];
  if (!p.length) return [0, 0];
  return Array.isArray(p[0]) ? [p.length, Math.max(...p.map(r => r.length), 0)] : [1, p.length];
}
function makeDiag(vals) {
  const v = normalizeVector(vals);
  return v.map((x, i) => v.map((_, j) => i === j ? x : 0));
}
function buildLinspace(a, b, n = 100) {
  const count = Math.max(1, Math.round(Number(n)));
  const start = Number(a), end = Number(b);
  if (count === 1) return [start];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + step * i);
}
function meshgrid(xs, ys = xs) {
  const x = normalizeVector(xs), y = normalizeVector(ys);
  return { __multi: [y.map(() => [...x]), y.map(v => Array(x.length).fill(v))] };
}
function formatValue(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (v?.__multi) return v.__multi.map(formatValue).join("\n\n");
  try { return mathFormat(toPlain(v), { precision: 6, notation: "auto" }); }
  catch { return JSON.stringify(toPlain(v), null, 2); }
}

// ── RREF ─────────────────────────────────────────────────────────────────────
function rrefMatrix(A, tol = 1e-10) {
  const m = toNumericMatrix(A);
  if (!m?.length) return m || [];
  const out = m.map(r => [...r]);
  const rows = out.length, cols = Math.max(...out.map(r => r.length), 0);
  out.forEach(r => { while (r.length < cols) r.push(0); });
  let lead = 0;
  for (let r = 0; r < rows && lead < cols; r++) {
    let pivRow = r;
    while (pivRow < rows && Math.abs(out[pivRow][lead]) <= tol) pivRow++;
    while (pivRow === rows) {
      lead++;
      if (lead >= cols) return out;
      pivRow = r;
      while (pivRow < rows && Math.abs(out[pivRow][lead]) <= tol) pivRow++;
    }
    if (pivRow !== r) [out[r], out[pivRow]] = [out[pivRow], out[r]];
    const piv = out[r][lead];
    if (Math.abs(piv - 1) > tol) for (let c = 0; c < cols; c++) out[r][c] /= piv;
    for (let i = 0; i < rows; i++) {
      if (i === r) continue;
      const f = out[i][lead];
      if (Math.abs(f) <= tol) continue;
      for (let c = 0; c < cols; c++) {
        out[i][c] -= f * out[r][c];
        if (Math.abs(out[i][c]) <= tol) out[i][c] = 0;
      }
    }
    lead++;
  }
  return out;
}

// ── Singular values → rank / cond ────────────────────────────────────────────
function singularValues(A) {
  try {
    const svd = math.svd ? math.svd(A) : null;
    if (svd) return normalizeVector(math.diag(svd.S ?? svd)).map(v => Math.abs(Number(v)));
  } catch { /* fall through */ }
  // Fallback: eigenvalues of AᵀA
  const m = toNumericMatrix(A);
  if (!m?.length) return [];
  const AT = toPlain(math.transpose(m));
  const ATA = toPlain(math.multiply(AT, m));
  const eig = math.eigs(ATA);
  return normalizeVector(toPlain(eig.values)).map(v => Math.sqrt(Math.max(0, realValue(v))));
}
function matrixRank(A) {
  const s = singularValues(A);
  const mx = Math.max(...s, 0);
  const tol = mx * Math.max(...inferSize(A)) * 1e-10;
  return s.filter(v => v > tol).length;
}
function conditionNumber(A) {
  const s = singularValues(A).filter(v => v > 1e-12);
  if (!s.length) return Infinity;
  return Math.max(...s) / Math.min(...s);
}

// ── LU factorization ─────────────────────────────────────────────────────────
function luFactorization(A) {
  const m = toNumericMatrix(A);
  if (!m?.length || !m.every(r => r.length === m.length)) throw new Error("lu: square matrix required");
  const n = m.length;
  const U = m.map(r => [...r]);
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
  const P = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
  for (let p = 0; p < n; p++) {
    let pivRow = p, maxV = Math.abs(U[p][p]);
    for (let r = p + 1; r < n; r++) if (Math.abs(U[r][p]) > maxV) { maxV = Math.abs(U[r][p]); pivRow = r; }
    if (maxV < 1e-12) throw new Error("lu: singular or near-singular matrix");
    if (pivRow !== p) {
      [U[p], U[pivRow]] = [U[pivRow], U[p]];
      [P[p], P[pivRow]] = [P[pivRow], P[p]];
      for (let c = 0; c < p; c++) [L[p][c], L[pivRow][c]] = [L[pivRow][c], L[p][c]];
    }
    for (let r = p + 1; r < n; r++) {
      const f = U[r][p] / U[p][p];
      L[r][p] = f;
      for (let c = p; c < n; c++) U[r][c] -= f * U[p][c];
    }
  }
  return { __multi: [L, U, P], L, U, P };
}

// ── SVD ──────────────────────────────────────────────────────────────────────
function computeSVD(A) {
  try {
    if (math.svd) {
      const r = math.svd(A);
      return { U: toPlain(r.U), S: Array.isArray(r.S?.[0]) ? toPlain(r.S) : makeDiag(toPlain(r.S)), V: toPlain(r.V) };
    }
  } catch { /* fall through */ }
  // Fallback via AᵀA eigen
  const m = toNumericMatrix(A);
  const rows = m?.length || 0, cols = rows ? m[0].length : 0;
  const padded = (m || []).map(r => [...r, ...Array(Math.max(0, cols - r.length)).fill(0)]);
  const AT = toPlain(math.transpose(padded));
  const ATA = toPlain(math.multiply(AT, padded));
  const eig = math.eigs(ATA);
  const pairs = (eig.eigenvectors || []).map((e, i) => ({
    sigma: Math.sqrt(Math.max(0, realValue(eig.values?.[i] ?? e.value ?? 0))),
    vec: normalizeVector(e.vector ?? []),
  })).sort((a, b) => b.sigma - a.sigma);
  const Vcols = pairs.map(p => { const n = Math.hypot(...p.vec) || 1; return p.vec.map(v => v / n); });
  const sigs = pairs.map(p => p.sigma);
  const Ucols = Vcols.map((vc, i) => {
    const sig = sigs[i];
    const Av = normalizeVector(toPlain(math.multiply(padded, vc)));
    if (sig <= 1e-12) return Array.from({ length: rows }, (_, r) => r === i ? 1 : 0);
    return Av.map(v => v / sig);
  });
  const U = Ucols.length ? toPlain(math.transpose(Ucols)) : Array.from({ length: rows }, () => []);
  const V = Vcols.length ? toPlain(math.transpose(Vcols)) : Array.from({ length: cols }, () => []);
  return { U, S: makeDiag(sigs), V };
}

// ── Null / Orth ───────────────────────────────────────────────────────────────
function orthonormalBasis(A, mode = "orth") {
  const { U, V, S } = computeSVD(A);
  const sigs = normalizeVector(math.diag(S)).map(v => Math.abs(Number(v)));
  const tol = Math.max(...sigs, 0) * Math.max(...inferSize(A)) * 1e-10;
  const src = mode === "null" ? toPlain(V) : toPlain(U);
  const cols = math.transpose(src);
  const keep = cols.filter((_, i) => mode === "null" ? sigs[i] <= tol : sigs[i] > tol);
  return keep.length ? math.transpose(keep) : [];
}

// ── sprintfFormat ─────────────────────────────────────────────────────────────
function sprintfFormat(fmt, ...args) {
  let i = 0;
  return String(fmt).replace(/%[\d.]*[diouxXeEfgGs]/g, m => {
    const val = args[i++];
    if (val == null) return m;
    if (m.endsWith("d") || m.endsWith("i")) return Math.round(Number(val)).toString();
    const prec = Number((m.match(/\.(\d+)/) || [, "6"])[1]);
    return Number(val).toFixed(prec);
  });
}

// ── Figure renderer (handles single + subplot figures) ───────────────────────
function NotebookFigure({ figureJson, C }) {
  if (!figureJson) return null;
  let parsed;
  try { parsed = typeof figureJson === "string" ? JSON.parse(figureJson) : figureJson; } catch { return null; }
  if (parsed?.type === "opencalc_subplots") {
    const { cols = 1, panels = [] } = parsed;
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
        {panels.map((panel, i) => (
          <div key={i} style={{ minWidth: 0 }}>
            {panel ? <FigureRenderer figureJson={panel} C={C} /> : <div style={{ height: 200, borderRadius: 8, background: C.surface2, border: `1px solid ${C.border}` }} />}
          </div>
        ))}
      </div>
    );
  }
  return <FigureRenderer figureJson={figureJson} C={C} />;
}

// ── Plot accumulator → opencalc_figure JSON ───────────────────────────────────
function makeFigure(plotState) {
  const elements = [];
  if (plotState.gridOn) elements.push({ type: "grid", step: 1, color: "border" });
  elements.push({ type: "axes" });
  // series
  for (const s of plotState.series) {
    if (s.type === "line") {
      elements.push({ type: "curve", xs: s.xs, ys: s.ys, color: s.color || "blue", width: 2 });
    } else if (s.type === "scatter") {
      elements.push({ type: "scatter", xs: s.xs, ys: s.ys, color: s.color || "blue", radius: 4, labels: null });
    } else if (s.type === "bar") {
      elements.push({ type: "bar", xs: s.xs, ys: s.ys, color: s.color || "blue" });
    } else if (s.type === "stem") {
      elements.push({ type: "stem", xs: s.xs, ys: s.ys, color: s.color || "blue" });
    } else if (s.type === "hist") {
      elements.push({ type: "bar", xs: s.xs, ys: s.ys, color: s.color || "blue" });
    }
  }
  const allXs = plotState.series.flatMap(s => s.xs || []).filter(Number.isFinite);
  const allYs = plotState.series.flatMap(s => s.ys || []).filter(Number.isFinite);
  const xmin = plotState.xlim?.[0] ?? (allXs.length ? Math.min(...allXs) - 0.5 : -5);
  const xmax = plotState.xlim?.[1] ?? (allXs.length ? Math.max(...allXs) + 0.5 : 5);
  const ymin = plotState.ylim?.[0] ?? (allYs.length ? Math.min(...allYs) - 0.5 : -5);
  const ymax = plotState.ylim?.[1] ?? (allYs.length ? Math.max(...allYs) + 0.5 : 5);
  return JSON.stringify({
    type: "opencalc_figure",
    xmin, xmax, ymin, ymax,
    title: plotState.title || null,
    xlabel: plotState.xlabel || null,
    ylabel: plotState.ylabel || null,
    elements,
  });
}

const SERIES_COLORS = ["blue", "amber", "green", "red", "purple", "teal"];

// ── Matrix elementwise helpers ────────────────────────────────────────────────
function dotMultiply(a, b) {
  const pa = toPlain(a), pb = toPlain(b);
  if (Array.isArray(pa) && Array.isArray(pb)) {
    if (Array.isArray(pa[0])) return pa.map((row, i) => row.map((v, j) => v * (pb[i]?.[j] ?? pb[i] ?? pb)));
    return pa.map((v, i) => v * (Array.isArray(pb) ? pb[i] : pb));
  }
  if (Array.isArray(pa)) return pa.map(v => v * Number(pb));
  if (Array.isArray(pb)) return pb.map(v => Number(pa) * v);
  return Number(pa) * Number(pb);
}
function dotDivide(a, b) {
  const pa = toPlain(a), pb = toPlain(b);
  if (Array.isArray(pa) && Array.isArray(pb)) {
    if (Array.isArray(pa[0])) return pa.map((row, i) => row.map((v, j) => v / (pb[i]?.[j] ?? pb[i] ?? pb)));
    return pa.map((v, i) => v / (Array.isArray(pb) ? pb[i] : pb));
  }
  if (Array.isArray(pa)) return pa.map(v => v / Number(pb));
  if (Array.isArray(pb)) return pb.map(v => Number(pa) / v);
  return Number(pa) / Number(pb);
}
function dotPow(a, b) {
  const pa = toPlain(a), pb = toPlain(b);
  if (Array.isArray(pa) && Array.isArray(pb)) return pa.map((v, i) => Array.isArray(v) ? v.map((u, j) => u ** realValue(pb[i]?.[j] ?? pb[i] ?? pb)) : v ** realValue(pb[i] ?? pb));
  if (Array.isArray(pa)) return pa.map(v => Array.isArray(v) ? v.map(u => u ** Number(pb)) : v ** Number(pb));
  if (Array.isArray(pb)) return pb.map(v => Number(pa) ** v);
  return Number(pa) ** Number(pb);
}

// ── Block parser (same grammar as OpenMatStudio) ──────────────────────────────
function parseBlocks(lines) {
  const stack = [{ type: "root", body: [] }];
  const top = () => stack[stack.length - 1];
  const getBody = (node) => {
    if (node.type === "if") return node.elseBody !== null ? node.elseBody : node.branches[node.branches.length - 1].body;
    return node.body;
  };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const stripped = raw.replace(/%.*$/, "").trim();
    if (!stripped) continue;
    const lower = stripped.toLowerCase();
    const fn = stripped.match(/^function\s+(?:\[([^\]]*)\]\s*=\s*|([A-Za-z_]\w*)\s*=\s*)?([A-Za-z_]\w*)\s*\(([^)]*)\)/i);
    if (fn) {
      const outs = fn[1] ? fn[1].split(",").map(s => s.trim()).filter(Boolean) : fn[2] ? [fn[2].trim()] : [];
      const node = { type: "function", name: fn[3], ins: fn[4].split(",").map(s => s.trim()).filter(Boolean), outs, body: [] };
      top().body.push(node); stack.push(node); continue;
    }
    const forM = stripped.match(/^for\s+([A-Za-z_]\w*)\s*=\s*(.+)$/i);
    if (forM) { const node = { type: "for", varName: forM[1], iterExpr: forM[2], body: [] }; top().body.push(node); stack.push(node); continue; }
    const whileM = stripped.match(/^while\s+(.+)$/i);
    if (whileM) { const node = { type: "while", condExpr: whileM[1], body: [] }; top().body.push(node); stack.push(node); continue; }
    const ifM = stripped.match(/^if\s+(.+)$/i);
    if (ifM) { const node = { type: "if", branches: [{ cond: ifM[1], body: [] }], elseBody: null }; top().body.push(node); stack.push(node); continue; }
    const elifM = stripped.match(/^elseif\s+(.+)$/i);
    if (elifM) { const ifNode = top(); if (ifNode.type === "if") ifNode.branches.push({ cond: elifM[1], body: [] }); continue; }
    if (lower === "else") { const ifNode = top(); if (ifNode.type === "if") ifNode.elseBody = []; continue; }
    if (lower === "end") { if (stack.length > 1) stack.pop(); continue; }
    if (lower === "break") { getBody(top()).push({ type: "break" }); continue; }
    if (lower === "continue") { getBody(top()).push({ type: "continue" }); continue; }
    getBody(top()).push({ type: "line", raw: stripped });
  }
  return stack[0].body;
}

// ── Line preprocessor ─────────────────────────────────────────────────────────
function normalizeLine(line, variables, fnNames) {
  let out = line.replace(/%.*$/, "").trim();
  if (!out) return "";
  // hold on/off, grid on/off
  out = out.replace(/^hold\s+on$/i, "hold('on')").replace(/^hold\s+off$/i, "hold('off')");
  out = out.replace(/^grid\s+on$/i, "grid('on')").replace(/^grid\s+off$/i, "grid('off')");
  out = out.replace(/^axis\s+(tight|equal|auto)$/i, "axis('$1')");
  // elementwise operators: .^ .* ./
  out = out.replace(/([A-Za-z0-9_\]\)])\s*\.\s*\^\s*/g, "$1.^").replace(/([A-Za-z0-9_\]\)])\s*\.\s*\*\s*/g, "$1.*").replace(/([A-Za-z0-9_\]\)])\s*\.\s*\/\s*/g, "$1./");
  out = out.replace(/\.(\^|\*|\/)([^=])/g, (_, op, after) => {
    const map = { "^": "dotPow", "*": "dotMultiply", "/": "dotDivide" };
    return `_${map[op]}_placeholder_${after}`;
  });
  // Normalize matrix syntax [a b; c d]
  out = out.replace(/\[([^[\]]+)\]/g, (_, inner) => {
    const rows = inner.split(";").map(row => row.trim().split(/[\s,]+/).filter(Boolean).join(", "));
    return `[${rows.join("; ")}]`;
  });
  // Indexing A(i,j) → A[i,j] for known variables
  if (variables.size > 0) {
    out = out.replace(/\b([A-Za-z_]\w*)\s*\(([^()]+)\)/g, (match, name, inner) => {
      if (!variables.has(name) || fnNames.has(name)) return match;
      return `${name}[${inner}]`;
    });
  }
  // Backslash A\b → mldivide(A, b)
  out = out.replace(/(\b\w[\w.[\]()]*)\s*\\\s*(\b\w[\w.[\]()]*)/g, "mldivide($1, $2)");
  return out;
}


// ─────────────────────────────────────────────────────────────────────────────
// "Open in OpenMAT" handoff
// Writes to the same localStorage keys OpenMatStudio reads on mount.
// Requires no changes to OpenMatStudio.jsx.
// ─────────────────────────────────────────────────────────────────────────────
function openInOpenMat(code, cellTitle) {
  try {
    const docs = (() => {
      try { return JSON.parse(localStorage.getItem("openmat-documents") || "[]"); } catch { return []; }
    })();
    const id = `doc-notebook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const name = cellTitle ? `${cellTitle.replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 30)}.m` : "notebook-import.m";
    const newDoc = { id, name, code };
    const updated = Array.isArray(docs) ? [...docs, newDoc] : [newDoc];
    localStorage.setItem("openmat-documents", JSON.stringify(updated));
    localStorage.setItem("openmat-active-document-id", JSON.stringify(id));
    window.location.href = "/#/openmat";
  } catch (e) {
    console.error("Failed to hand off to OpenMAT:", e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STARTER CELLS — shown when no initialCells are provided
// ─────────────────────────────────────────────────────────────────────────────
const STARTER_CELLS = [
  {
    id: 1,
    cellTitle: "Matrix basics",
    prose: ["Define matrices, solve Ax=b, compute rank and determinant."],
    code: `A = [2 1; 1 3]
b = [8; 9]
x = A \\ b
det(A)
rank(A)
`,
  },
  {
    id: 2,
    cellTitle: "Eigenvalues",
    prose: ["Compute eigenvectors and eigenvalues. Verify A = VDV⁻¹."],
    code: `A = [4 1; 2 3]
[V, D] = eig(A)
V * D * inv(V)
`,
  },
  {
    id: 3,
    cellTitle: "Plot",
    prose: ["Plot a sine wave."],
    code: `x = linspace(0, 2*pi, 200)
y = sin(x)
plot(x, y)
title('sin(x)')
grid on
`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DIFFICULTY STYLE
// ─────────────────────────────────────────────────────────────────────────────
function diffStyle(diff, C) {
  if (diff === "easy") return { bg: C.greenBg, bd: C.greenBd, fg: C.green };
  if (diff === "hard") return { bg: C.redBg, bd: C.redBd, fg: C.red };
  return { bg: C.amberBg, bd: C.amberBd, fg: C.amber };
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const CellComponent = React.memo(function CellComponent({ cell, C, onRun, onClear, onRemove, onUpdate, isExecuting, isOnlyCell }) {
  const [hintOpen, setHintOpen] = useState(false);
  const isChallenge = !!cell.challengeType;
  const ds = diffStyle(cell.difficulty, C);
  const lineCount = (cell.code || "").split("\n").length;
  const editorHeight = `${Math.min(380, Math.max(80, lineCount * 21 + 24))}px`;

  return (
    <div style={{
      background: `${C.surface}dd`,
      border: `1.5px solid ${cell.status === "error" ? C.redBd : cell.status === "running" ? C.tealBd : isChallenge ? C.purpleBd : C.orange + "66"}`,
      borderRadius: 12, overflow: "hidden", transition: "border-color .2s",
      boxShadow: isChallenge ? `0 6px 28px ${C.purpleBd}28, 0 2px 8px ${C.purpleBd}14` : `0 4px 18px ${C.orange}18, 0 2px 6px #0002`,
    }}>
      {/* Challenge header */}
      {isChallenge && (
        <div style={{ padding: "12px 16px", background: `linear-gradient(135deg, ${C.purpleBg}, ${C.blueBg})`, borderBottom: `1px solid ${C.purpleBd}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: cell.prompt ? 6 : 0 }}>
            {cell.challengeNumber != null && (
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: C.purple, color: "#fff", fontSize: 11, fontWeight: 700 }}>{cell.challengeNumber}</span>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>{cell.challengeTitle || "Challenge"}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: C.orangeBg ?? C.amberBg, border: `1px solid ${C.orange}`, color: C.orange }}>OpenMAT</span>
            {cell.difficulty && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: ds.bg, border: `1px solid ${ds.bd}`, color: ds.fg }}>{cell.difficulty}</span>}
          </div>
          {cell.prompt && <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{cell.prompt}</p>}
        </div>
      )}

      {/* Prose / title bar */}
      {(cell.prose || (!isChallenge && cell.cellTitle)) && (
        <div style={{ borderBottom: `1px solid ${C.border}` }}>
          {!isChallenge && cell.cellTitle && (
            <div style={{ padding: "7px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.orange, background: `linear-gradient(90deg, ${C.amberBg} 0%, ${C.surface2} 60%, ${C.surface} 100%)`, borderBottom: `1px solid ${C.amberBd}44`, borderLeft: `3px solid ${C.orange}` }}>
              {cell.cellTitle}
            </div>
          )}
          {cell.prose && (
            <div style={{ padding: !isChallenge && cell.cellTitle ? "6px 16px 10px" : "10px 16px 10px" }}>
              {(Array.isArray(cell.prose) ? cell.prose : [cell.prose]).map((p, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : "6px 0 0", fontSize: 13, color: C.text, lineHeight: 1.7 }}>{parseProse(p)}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cell header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px", background: C.surface2, borderBottom: `0.5px solid ${C.border}` }}>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: C.hint }}>
          {cell.status === "running" ? <span>In [<span style={{ color: C.orange }}>*</span>]</span> : <span>In [{cell.execCount ?? " "}]</span>}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onRun(cell.id)} disabled={isExecuting} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: isExecuting ? "default" : "pointer", border: "none", background: C.orange, color: "#fff", opacity: isExecuting ? 0.5 : 1 }}>
            {cell.status === "running" ? "..." : "▶ Run"}
          </button>
          <button onClick={() => openInOpenMat(cell.code, cell.cellTitle)} title="Open this script in the full OpenMAT studio" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer", border: `0.5px solid ${C.amberBd}`, background: "transparent", color: C.amber, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10 }}>⇱</span> OpenMAT
          </button>
          <button onClick={() => onClear(cell.id)} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, cursor: "pointer", border: `0.5px solid ${C.border}`, background: "transparent", color: C.hint }}>Clear</button>
          <button onClick={() => onRemove(cell.id)} disabled={isOnlyCell} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, cursor: isOnlyCell ? "default" : "pointer", border: `0.5px solid ${C.border}`, background: "transparent", color: C.hint, opacity: isOnlyCell ? 0.3 : 1 }}>✕</button>
        </div>
      </div>

      {/* Monaco editor */}
      <Editor
        height={editorHeight}
        beforeMount={setupOpenCalcMonaco}
        defaultLanguage="openmat"
        theme={C.dark ? "openmat-dark" : "openmat-light"}
        value={cell.code}
        onChange={val => onUpdate(cell.id, val || "")}
        options={{ minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13, lineNumbers: "on", padding: { top: 10, bottom: 10 }, automaticLayout: true, scrollbar: { vertical: "hidden", alwaysConsumeMouseWheel: false } }}
        onMount={editor => { editor.addCommand(1024 | 3, () => onRun(cell.id)); }}
      />

      {/* Output */}
      {(cell.output || cell.figureJson) && (
        <div style={{ borderTop: `0.5px solid ${C.border}` }}>
          <div style={{ padding: "4px 14px 2px", fontSize: 11, color: C.hint, fontFamily: "monospace" }}>Out [{cell.execCount ?? " "}]</div>
          {cell.figureJson && (
            <div style={{ padding: "8px 14px 10px", borderBottom: cell.output ? `0.5px solid ${C.border}` : undefined }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.hint, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Figure</div>
              <NotebookFigure figureJson={cell.figureJson} C={C} />
            </div>
          )}
          {cell.output && cell.output !== "Plot rendered." && (
            <pre style={{ margin: 0, padding: "4px 14px 12px", fontFamily: "monospace", fontSize: 13, lineHeight: 1.6, color: cell.status === "error" ? C.red : C.text, background: "transparent", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{cell.output}</pre>
          )}
        </div>
      )}

      {/* Hint toggle (challenge cells) */}
      {isChallenge && cell.hint && (
        <div style={{ borderTop: `0.5px solid ${C.border}` }}>
          <button onClick={() => setHintOpen(h => !h)} style={{ width: "100%", padding: "8px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontSize: 12, color: C.amber, display: "flex", alignItems: "center", gap: 6 }}>
            <span>{hintOpen ? "▾" : "▸"}</span>{hintOpen ? "Hide hint" : "Show hint"}
          </button>
          {hintOpen && (
            <div style={{ padding: "8px 16px 12px", background: C.amberBg, borderTop: `0.5px solid ${C.amberBd}`, fontSize: 13, color: C.amber, lineHeight: 1.6 }}>
              {parseProse(cell.hint)}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function OpenMatNotebook({ params }) {
  const C = useColors();
  const initialCells = params?.initialCells || STARTER_CELLS;
  const [cells, setCells] = useState(initialCells);
  const [executing, setExecuting] = useState(false);
  const execCount = useRef(0);

  // Swap cells when lesson changes (HMR or navigation)
  useEffect(() => {
    if (params?.initialCells) setCells(params.initialCells);
  }, [params?.initialCells]);

  const runCell = useCallback((id) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, status: "running", output: "", figureJson: null } : c));
    setExecuting(true);
    // Use a short timeout so React renders the "running" state before execution blocks the thread
    setTimeout(() => {
      const cell = cells.find(c => c.id === id);
      if (!cell) { setExecuting(false); return; }
      execCount.current++;
      const count = execCount.current;
      try {
        const result = runOpenMatScript(cell.code);
        const output = result.logs.join("\n");
        setCells(prev => prev.map(c => c.id === id ? { ...c, status: "ok", output, figureJson: result.figureJson, execCount: count } : c));
      } catch (e) {
        setCells(prev => prev.map(c => c.id === id ? { ...c, status: "error", output: `Error: ${e.message}`, figureJson: null, execCount: count } : c));
      }
      setExecuting(false);
    }, 20);
  }, [cells]);

  const runAll = useCallback(() => {
    // Run cells sequentially
    const runSeq = (idx) => {
      if (idx >= cells.length) { setExecuting(false); return; }
      const cell = cells[idx];
      setExecuting(true);
      setCells(prev => prev.map(c => c.id === cell.id ? { ...c, status: "running", output: "", figureJson: null } : c));
      setTimeout(() => {
        execCount.current++;
        const count = execCount.current;
        try {
          const result = runOpenMatScript(cell.code);
          setCells(prev => prev.map(c => c.id === cell.id ? { ...c, status: "ok", output: result.logs.join("\n"), figureJson: result.figureJson, execCount: count } : c));
        } catch (e) {
          setCells(prev => prev.map(c => c.id === cell.id ? { ...c, status: "error", output: `Error: ${e.message}`, figureJson: null, execCount: count } : c));
        }
        runSeq(idx + 1);
      }, 20);
    };
    runSeq(0);
  }, [cells]);

  const clearCell = useCallback((id) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, output: "", figureJson: null, status: "idle", execCount: undefined } : c));
  }, []);

  const removeCell = useCallback((id) => {
    setCells(prev => prev.length > 1 ? prev.filter(c => c.id !== id) : prev);
  }, []);

  const updateCell = useCallback((id, code) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, code } : c));
  }, []);

  const addCell = useCallback(() => {
    const newId = Date.now();
    setCells(prev => [...prev, { id: newId, code: "% New cell\n", status: "idle" }]);
  }, []);

  const openAllInOpenMat = useCallback(() => {
    const combined = cells.map(c => `% ── ${c.cellTitle || `Cell ${c.id}`} ──\n${c.code}`).join("\n\n");
    openInOpenMat(combined, "All Cells");
  }, [cells]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 8px 32px ${C.orange}18` }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: `linear-gradient(90deg, ${C.surface2} 0%, ${C.surface} 100%)`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📐</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>OpenMAT Notebook</div>
            <div style={{ fontSize: 11, color: C.muted }}>MATLAB-like • mathjs engine • Shift+Enter to run</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={runAll} disabled={executing} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, cursor: executing ? "default" : "pointer", border: "none", background: C.orange, color: "#fff", fontWeight: 600, opacity: executing ? 0.5 : 1 }}>
            ▶▶ Run All
          </button>
          <button onClick={openAllInOpenMat} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, cursor: "pointer", border: `1px solid ${C.amberBd}`, background: "transparent", color: C.amber, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13 }}>⇱</span> Open in OpenMAT
          </button>
        </div>
      </div>

      {/* Cells */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {cells.map(cell => (
          <CellComponent
            key={cell.id}
            cell={cell}
            C={C}
            onRun={runCell}
            onClear={clearCell}
            onRemove={removeCell}
            onUpdate={updateCell}
            isExecuting={executing}
            isOnlyCell={cells.length === 1}
          />
        ))}
        {/* Add cell button */}
        <button onClick={addCell} style={{ width: "100%", padding: "10px", borderRadius: 10, cursor: "pointer", border: `1.5px dashed ${C.border}`, background: "transparent", color: C.hint, fontSize: 13, transition: "all 0.2s" }}
          onMouseEnter={e => { e.target.style.borderColor = C.orange; e.target.style.color = C.orange; }}
          onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.hint; }}>
          + Add Cell
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 16px", borderTop: `0.5px solid ${C.border}`, fontSize: 11, color: C.hint, display: "flex", alignItems: "center", gap: 8 }}>
        <span>🔧</span>
        <span>Runs in-browser via mathjs. Supports rref, eig, svd, lu, qr, null, orth, cond, inv, plot, and more.</span>
        <span style={{ marginLeft: "auto", color: C.muted }}>Sliders & 3D → use "Open in OpenMAT"</span>
      </div>
    </div>
  );
}
