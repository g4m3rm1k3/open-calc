import React, { useState, useRef, useEffect } from "react";

// ── Fraction arithmetic ─────────────────────────────────────────────────────
function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
function frac(n, d = 1) {
  if (d === 0) return { n: NaN, d: 1 };
  if (n === 0) return { n: 0, d: 1 };
  const sign = (n < 0) !== (d < 0) ? -1 : 1;
  n = Math.abs(n); d = Math.abs(d);
  const g = gcd(n, d);
  return { n: sign * (n / g), d: d / g };
}
const fadd = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const fmul = (a, b) => frac(a.n * b.n, a.d * b.d);
const fdiv = (a, b) => frac(a.n * b.d, a.d * b.n);
const fneg = (a) => frac(-a.n, a.d);
const feq0 = (a) => a.n === 0;

function parseFrac(str) {
  str = str.trim();
  if (str === "" || str === "-") return frac(0);
  if (str.includes("/")) {
    const parts = str.split("/");
    const n = parseInt(parts[0], 10);
    const d = parseInt(parts[1], 10);
    if (isNaN(n) || isNaN(d)) return null;
    return frac(n, d);
  }
  const n = parseFloat(str);
  if (isNaN(n)) return null;
  const decimals = (str.split(".")[1] || "").length;
  const factor = Math.pow(10, decimals);
  return frac(Math.round(n * factor), factor);
}

function fracToString(f) {
  if (isNaN(f.n)) return "undef";
  if (f.d === 1) return String(f.n);
  return `${f.n}/${f.d}`;
}

// ── Matrix helpers ──────────────────────────────────────────────────────────
function cloneMatrix(m) {
  return m.map(row => row.map(f => ({ ...f })));
}

function stringsToMatrix(s) {
  return s.map(row => row.map(str => parseFrac(str) || frac(0)));
}

// ── REF / RREF solver (returns step log) ───────────────────────────────────
function solveREF(inputMatrix) {
  const steps = [];
  let m = cloneMatrix(inputMatrix);
  const numRows = m.length;
  const numCols = m[0].length;

  const snap = (label) => steps.push({ matrix: cloneMatrix(m), opLabel: label });

  let pivotRow = 0;
  for (let col = 0; col < numCols && pivotRow < numRows; col++) {
    // Find pivot
    let found = -1;
    for (let r = pivotRow; r < numRows; r++) {
      if (!feq0(m[r][col])) { found = r; break; }
    }
    if (found === -1) continue;

    // Swap if needed
    if (found !== pivotRow) {
      [m[pivotRow], m[found]] = [m[found], m[pivotRow]];
      snap(`R${pivotRow + 1} ↔ R${found + 1}`);
    }

    // Eliminate below
    for (let r = pivotRow + 1; r < numRows; r++) {
      if (feq0(m[r][col])) continue;
      const factor = fneg(fdiv(m[r][col], m[pivotRow][col]));
      m[r] = m[r].map((v, i) => fadd(v, fmul(factor, m[pivotRow][i])));
      const fs = fracToString(factor);
      snap(`R${r + 1} ← R${r + 1} + (${fs})·R${pivotRow + 1}`);
    }

    pivotRow++;
  }

  return { result: m, steps };
}

function solveRREF(inputMatrix) {
  // First get REF
  const { result: ref, steps: refSteps } = solveREF(inputMatrix);
  const steps = [...refSteps];
  let m = cloneMatrix(ref);
  const numRows = m.length;
  const numCols = m[0].length;

  const snap = (label) => steps.push({ matrix: cloneMatrix(m), opLabel: label });

  // Scale pivot rows to 1
  for (let r = 0; r < numRows; r++) {
    const pivotCol = m[r].findIndex(f => !feq0(f));
    if (pivotCol === -1) continue;
    const pivot = m[r][pivotCol];
    if (pivot.n === pivot.d && pivot.d === 1) continue; // already 1
    const inv = fdiv(frac(1), pivot);
    m[r] = m[r].map(v => fmul(inv, v));
    snap(`R${r + 1} ← (${fracToString(inv)})·R${r + 1}`);
  }

  // Eliminate above pivots
  for (let r = numRows - 1; r >= 0; r--) {
    const pivotCol = m[r].findIndex(f => !feq0(f));
    if (pivotCol === -1) continue;
    for (let above = r - 1; above >= 0; above--) {
      if (feq0(m[above][pivotCol])) continue;
      const factor = fneg(m[above][pivotCol]);
      m[above] = m[above].map((v, i) => fadd(v, fmul(factor, m[r][i])));
      const fs = fracToString(factor);
      snap(`R${above + 1} ← R${above + 1} + (${fs})·R${r + 1}`);
    }
  }

  return { result: m, steps };
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  root: {
    fontFamily: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
    background: "#0f1117",
    color: "#e2e8f0",
    padding: "20px 24px 24px",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  header: {
    fontSize: 13,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#4ade80",
    marginBottom: 4,
    fontWeight: 600,
  },
  subheader: {
    fontSize: 11,
    color: "#64748b",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  card: {
    background: "#1a1d27",
    border: "1px solid #2d3144",
    borderRadius: 8,
    padding: "16px 20px",
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: "#64748b",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  select: {
    background: "#0f1117",
    border: "1px solid #2d3144",
    borderRadius: 4,
    color: "#e2e8f0",
    fontSize: 13,
    padding: "5px 8px",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
  },
  input: {
    background: "#0f1117",
    border: "1px solid #2d3144",
    borderRadius: 4,
    color: "#e2e8f0",
    fontSize: 13,
    padding: "5px 8px",
    fontFamily: "inherit",
    outline: "none",
    width: 64,
    textAlign: "center",
  },
  cellInput: {
    background: "#0f1117",
    border: "1px solid #2d3144",
    borderRadius: 4,
    color: "#e2e8f0",
    fontSize: 14,
    padding: "6px 4px",
    fontFamily: "inherit",
    outline: "none",
    width: 52,
    textAlign: "center",
  },
  btn: (variant = "default") => ({
    background: variant === "green"
      ? "#166534" : variant === "red"
      ? "#7f1d1d" : variant === "blue"
      ? "#1e3a5f" : variant === "amber"
      ? "#78350f" : variant === "ghost"
      ? "transparent" : "#1e293b",
    border: `1px solid ${variant === "green"
      ? "#15803d" : variant === "red"
      ? "#991b1b" : variant === "blue"
      ? "#1d4ed8" : variant === "amber"
      ? "#92400e" : "#2d3144"}`,
    borderRadius: 4,
    color: variant === "green" ? "#4ade80" : variant === "red" ? "#f87171"
      : variant === "blue" ? "#60a5fa" : variant === "amber" ? "#fbbf24" : "#cbd5e1",
    fontSize: 12,
    padding: "6px 14px",
    fontFamily: "inherit",
    cursor: "pointer",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    transition: "opacity 0.15s",
    whiteSpace: "nowrap",
  }),
  pill: (color = "gray") => ({
    display: "inline-block",
    background: color === "green" ? "#14532d" : color === "blue" ? "#1e3a5f"
      : color === "amber" ? "#78350f" : "#1e293b",
    color: color === "green" ? "#4ade80" : color === "blue" ? "#60a5fa"
      : color === "amber" ? "#fbbf24" : "#94a3b8",
    border: `1px solid ${color === "green" ? "#166534" : color === "blue" ? "#1d4ed8"
      : color === "amber" ? "#92400e" : "#2d3144"}`,
    borderRadius: 4,
    fontSize: 11,
    padding: "2px 8px",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
  }),
  tabBtn: (active) => ({
    background: active ? "#1a1d27" : "transparent",
    border: `1px solid ${active ? "#2d3144" : "transparent"}`,
    borderBottom: active ? "1px solid #1a1d27" : "1px solid #2d3144",
    borderRadius: "4px 4px 0 0",
    color: active ? "#e2e8f0" : "#64748b",
    fontSize: 12,
    padding: "8px 18px",
    fontFamily: "inherit",
    cursor: "pointer",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: -1,
    position: "relative",
    zIndex: active ? 1 : 0,
  }),
};

// ── MatrixGrid display ──────────────────────────────────────────────────────
function MatrixGrid({ matrix, augmented, editing, inputStrings, onCellChange }) {
  const numRows = matrix.length;
  const numCols = matrix[0]?.length ?? 0;
  const augSplit = augmented ? numCols - 1 : numCols;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          {matrix.map((row, ri) => (
            <tr key={ri}>
              <td style={{
                borderLeft: "2px solid #4ade80",
                borderTop: ri === 0 ? "2px solid #4ade80" : "none",
                borderBottom: ri === numRows - 1 ? "2px solid #4ade80" : "none",
                paddingLeft: 4, paddingRight: 2, width: 6,
              }} />
              {row.map((f, ci) => (
                <React.Fragment key={ci}>
                  {augmented && ci === augSplit && (
                    <td style={{ paddingLeft: 6, paddingRight: 6 }}>
                      <div style={{ width: 1, height: 32, background: "#4ade80", opacity: 0.5 }} />
                    </td>
                  )}
                  <td style={{ padding: "3px 4px" }}>
                    {editing ? (
                      <input
                        style={S.cellInput}
                        value={inputStrings[ri][ci]}
                        onChange={e => onCellChange(ri, ci, e.target.value)}
                      />
                    ) : (
                      <div style={{
                        ...S.cellInput,
                        cursor: "default",
                        borderColor: feq0(f) ? "#1a1d27" : "#2d3144",
                        color: feq0(f) ? "#334155" : (f.n < 0 ? "#f87171" : "#e2e8f0"),
                      }}>
                        {fracToString(f)}
                      </div>
                    )}
                  </td>
                </React.Fragment>
              ))}
              <td style={{
                borderRight: "2px solid #4ade80",
                borderTop: ri === 0 ? "2px solid #4ade80" : "none",
                borderBottom: ri === numRows - 1 ? "2px solid #4ade80" : "none",
                paddingRight: 4, paddingLeft: 2, width: 6,
              }} />
              <td style={{ paddingLeft: 10, fontSize: 11, color: "#64748b", verticalAlign: "middle" }}>
                R{ri + 1}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── StepList ────────────────────────────────────────────────────────────────
function StepList({ steps, augmented, activeStep, onStepClick, color = "blue" }) {
  if (!steps.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {steps.map((h, i) => (
        <div
          key={i}
          onClick={() => onStepClick && onStepClick(i)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "5px 8px", borderRadius: 4,
            background: activeStep === i ? "#1e293b" : "transparent",
            cursor: onStepClick ? "pointer" : "default",
            transition: "background 0.1s",
          }}
        >
          <span style={{ ...S.pill(color), minWidth: 36, textAlign: "center" }}>
            {i + 1}
          </span>
          <span style={{ fontSize: 12, color: "#94a3b8", flex: 1 }}>{h.opLabel}</span>
          {onStepClick && (
            <span style={{ fontSize: 10, color: "#475569" }}>view</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function MatrixReducer({ onBack } = {}) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [augmented, setAugmented] = useState(true);
  const [inputStrings, setInputStrings] = useState(
    Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => "0"))
  );

  // Mode: "manual" | "solver"
  const [mode, setMode] = useState("manual");

  // Manual state
  const [matrix, setMatrix] = useState(null);
  const [history, setHistory] = useState([]);
  const [op, setOp] = useState("replace");
  const [srcRow, setSrcRow] = useState(0);
  const [tgtRow, setTgtRow] = useState(1);
  const [scalarStr, setScalarStr] = useState("1");
  const [error, setError] = useState("");

  // Solver state
  const [solverResult, setSolverResult] = useState(null); // {type, steps, result}
  const [solverStep, setSolverStep] = useState(null); // index into steps for preview

  // ── Grid resize ────────────────────────────────────────────────────────────
  function resizeGrid(r, c) {
    setRows(r); setCols(c);
    setInputStrings(prev =>
      Array.from({ length: r }, (_, ri) =>
        Array.from({ length: c }, (_, ci) => prev[ri]?.[ci] ?? "0")
      )
    );
    setMatrix(null); setHistory([]); setError("");
    setSolverResult(null); setSolverStep(null);
  }

  function updateInput(r, c, val) {
    setInputStrings(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = val;
      return next;
    });
  }

  // ── Manual ops ─────────────────────────────────────────────────────────────
  function startSession() {
    setMatrix(stringsToMatrix(inputStrings));
    setHistory([]); setError("");
  }

  function resetSession() {
    setMatrix(null); setHistory([]); setError("");
  }

  const current = matrix ?? stringsToMatrix(inputStrings);
  const numRows = current.length;
  const numCols = current[0]?.length ?? 0;

  function applyOp() {
    setError("");
    const scalar = parseFrac(scalarStr);
    if (!scalar) { setError("Invalid scalar — use a number or fraction like 3/2"); return; }
    if (op === "scale" && feq0(scalar)) { setError("Cannot scale a row by zero"); return; }
    if (op === "replace" && srcRow === tgtRow) { setError("Source and target must differ"); return; }

    const m = cloneMatrix(current);
    let label = "";

    if (op === "swap") {
      [m[srcRow], m[tgtRow]] = [m[tgtRow], m[srcRow]];
      label = `R${srcRow + 1} ↔ R${tgtRow + 1}`;
    } else if (op === "scale") {
      m[srcRow] = m[srcRow].map(f => fmul(f, scalar));
      label = `R${srcRow + 1} ← (${fracToString(scalar)})·R${srcRow + 1}`;
    } else if (op === "replace") {
      m[tgtRow] = m[tgtRow].map((f, i) => fadd(f, fmul(scalar, m[srcRow][i])));
      label = `R${tgtRow + 1} ← R${tgtRow + 1} + (${fracToString(scalar)})·R${srcRow + 1}`;
    }

    setHistory(prev => [...prev, { matrix: cloneMatrix(current), opLabel: label }]);
    setMatrix(m);
  }

  function undo() {
    if (!history.length) return;
    setMatrix(history[history.length - 1].matrix);
    setHistory(h => h.slice(0, -1));
    setError("");
  }

  function clearHistory() {
    if (!history.length) return;
    setMatrix(history[0].matrix);
    setHistory([]); setError("");
  }

  // ── Solver ─────────────────────────────────────────────────────────────────
  function runSolver(type) {
    const m = stringsToMatrix(inputStrings);
    const { result, steps } = type === "rref" ? solveRREF(m) : solveREF(m);
    setSolverResult({ type, steps, result, initial: cloneMatrix(m) });
    setSolverStep(null);
  }

  const solverPreview = solverResult
    ? (solverStep !== null ? solverResult.steps[solverStep].matrix : solverResult.result)
    : null;

  // ── Tab switch ─────────────────────────────────────────────────────────────
  function switchMode(m) {
    setMode(m);
    setError("");
  }

  // ── Draggable panel ────────────────────────────────────────────────────────
  const PANEL_W = 740;
  const isMobile = window.innerWidth < 640;
  const [pos, setPos] = useState(() => ({
    x: Math.max(16, Math.round((window.innerWidth - PANEL_W) / 2)),
    y: Math.max(16, Math.round((window.innerHeight - 600) / 2)),
  }));
  const dragging   = useRef(false);
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const startDrag = (e) => {
    e.preventDefault();
    dragging.current = true;
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragOrigin.current.mx;
      const dy = e.clientY - dragOrigin.current.my;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - PANEL_W, dragOrigin.current.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 80, dragOrigin.current.py + dy)),
      });
    };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  const dark = document.documentElement.classList.contains('dark')
  const bg1 = 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl'
  const bdr = 'border-slate-200/80 dark:border-slate-700/80'

  return (
    <>
      {isMobile && onBack && (
        <div className="fixed inset-0 z-[1999] bg-black/40 backdrop-blur-sm" onClick={onBack} />
      )}
      <div
        className={`fixed z-[2000] rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_50px_rgba(0,0,0,0.5)] border ${bdr} ${bg1} overflow-hidden ring-1 ring-white/10 flex flex-col`}
        style={isMobile
          ? { left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: Math.min(PANEL_W, window.innerWidth - 16), maxHeight: '92dvh' }
          : { left: pos.x, top: pos.y, width: PANEL_W, maxHeight: '92dvh' }
        }
      >
        {/* Title bar */}
        <div
          onMouseDown={startDrag}
          className={`flex items-center gap-2 px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-b ${bdr} cursor-move shrink-0 select-none`}
        >
          <span className="text-emerald-400 text-base font-bold font-mono">⊞</span>
          <span className={`text-xs font-bold tracking-wide text-slate-800 dark:text-slate-100 flex-1 uppercase font-mono`}>
            Matrix Reducer
          </span>
          {onBack && (
            <button onClick={onBack}
              className={`ml-1 p-1 rounded-lg hover:bg-rose-500/10 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors text-base leading-none`}
              title="Close"
            >×</button>
          )}
        </div>
        <div style={{ ...S.root, flex: 1, minHeight: 0, background: 'transparent' }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={S.header}>Matrix Workspace</div>
        <div style={S.subheader}>REF / RREF · Manual &amp; Solver</div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", borderBottom: "1px solid #2d3144", marginBottom: 16 }}>
          <button style={S.tabBtn(mode === "manual")} onClick={() => switchMode("manual")}>
            ✎ Manual
          </button>
          <button style={S.tabBtn(mode === "solver")} onClick={() => switchMode("solver")}>
            ⚡ Solver
          </button>
        </div>

        {/* ── Shared setup (shown when no active session) ── */}
        {(mode === "manual" ? !matrix : !solverResult) && (
          <div style={S.card}>
            <span style={S.label}>Matrix dimensions</span>
            <div style={S.row}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Rows</span>
              <input type="number" min={1} max={10} value={rows} style={{ ...S.input, width: 48 }}
                onChange={e => resizeGrid(Math.max(1, Math.min(10, +e.target.value)), cols)} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Cols</span>
              <input type="number" min={1} max={12} value={cols} style={{ ...S.input, width: 48 }}
                onChange={e => resizeGrid(rows, Math.max(1, Math.min(12, +e.target.value)))} />
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
                <input type="checkbox" checked={augmented} onChange={e => setAugmented(e.target.checked)}
                  style={{ accentColor: "#4ade80" }} />
                Augmented
              </label>
            </div>
          </div>
        )}

        {/* ── Matrix input / display ── */}
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <span style={S.label}>
              {mode === "manual"
                ? (matrix ? `Current matrix — step ${history.length}` : "Enter values  (fractions ok: 3/2)")
                : (solverResult ? `${solverResult.type.toUpperCase()} result` : "Enter values  (fractions ok: 3/2)")}
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {mode === "manual" && matrix && (
                <>
                  <button style={S.btn()} onClick={undo} disabled={!history.length}>↩ Undo</button>
                  <button style={S.btn()} onClick={clearHistory} disabled={!history.length}>↩↩ Revert</button>
                  <button style={S.btn("red")} onClick={resetSession}>Reset</button>
                </>
              )}
              {mode === "solver" && solverResult && (
                <button style={S.btn("red")} onClick={() => { setSolverResult(null); setSolverStep(null); }}>
                  Reset
                </button>
              )}
            </div>
          </div>

          <MatrixGrid
            matrix={mode === "solver" && solverPreview ? solverPreview : current}
            augmented={augmented}
            editing={mode === "manual" ? !matrix : !solverResult}
            inputStrings={inputStrings}
            onCellChange={updateInput}
          />

          {/* Start buttons */}
          {mode === "manual" && !matrix && (
            <div style={{ marginTop: 16 }}>
              <button style={S.btn("green")} onClick={startSession}>Start Manual →</button>
            </div>
          )}
          {mode === "solver" && !solverResult && (
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={S.btn("blue")} onClick={() => runSolver("ref")}>Solve → REF</button>
              <button style={S.btn("amber")} onClick={() => runSolver("rref")}>Solve → RREF</button>
            </div>
          )}
        </div>

        {/* ── Manual: operations ── */}
        {mode === "manual" && matrix && (
          <div style={S.card}>
            <span style={S.label}>Row operation</span>
            <div style={S.row}>
              <select style={S.select} value={op} onChange={e => setOp(e.target.value)}>
                <option value="replace">Row Replacement: Rᵢ ← Rᵢ + k·Rⱼ</option>
                <option value="scale">Scale Row: Rᵢ ← k·Rᵢ</option>
                <option value="swap">Swap Rows: Rᵢ ↔ Rⱼ</option>
              </select>
            </div>

            <div style={S.row}>
              {(op === "swap" || op === "replace") && (
                <>
                  <span style={{ fontSize: 13, color: "#94a3b8", minWidth: 44 }}>
                    {op === "swap" ? "R1" : "Target"}
                  </span>
                  <select style={S.select} value={tgtRow} onChange={e => setTgtRow(+e.target.value)}>
                    {Array.from({ length: numRows }, (_, i) => <option key={i} value={i}>R{i + 1}</option>)}
                  </select>
                </>
              )}
              {op === "swap" && <span style={{ fontSize: 13, color: "#94a3b8" }}>↔</span>}
              {op === "replace" && (
                <>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>+</span>
                  <input style={{ ...S.input, width: 56 }} value={scalarStr}
                    onChange={e => setScalarStr(e.target.value)} placeholder="k" />
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>·</span>
                </>
              )}
              {op === "scale" && (
                <>
                  <select style={S.select} value={srcRow} onChange={e => setSrcRow(+e.target.value)}>
                    {Array.from({ length: numRows }, (_, i) => <option key={i} value={i}>R{i + 1}</option>)}
                  </select>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>←</span>
                  <input style={{ ...S.input, width: 56 }} value={scalarStr}
                    onChange={e => setScalarStr(e.target.value)} placeholder="k" />
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>·  R{srcRow + 1}</span>
                </>
              )}
              {(op === "swap" || op === "replace") && (
                <select style={S.select} value={srcRow} onChange={e => setSrcRow(+e.target.value)}>
                  {Array.from({ length: numRows }, (_, i) => <option key={i} value={i}>R{i + 1}</option>)}
                </select>
              )}
            </div>

            <div style={{ fontSize: 12, color: "#4ade80", marginBottom: 10, minHeight: 18 }}>
              {op === "swap" && `R${tgtRow + 1} ↔ R${srcRow + 1}`}
              {op === "scale" && `R${srcRow + 1} ← (${scalarStr})·R${srcRow + 1}`}
              {op === "replace" && `R${tgtRow + 1} ← R${tgtRow + 1} + (${scalarStr})·R${srcRow + 1}`}
            </div>

            {error && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10 }}>⚠ {error}</div>}

            <button style={S.btn("green")} onClick={applyOp}>Apply operation</button>
          </div>
        )}

        {/* ── Manual: history ── */}
        {mode === "manual" && history.length > 0 && (
          <div style={S.card}>
            <span style={S.label}>Step history</span>
            <StepList steps={history} augmented={augmented} color="blue" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, padding: "5px 8px" }}>
              <span style={{ ...S.pill("green"), minWidth: 36, textAlign: "center" }}>now</span>
              <span style={{ fontSize: 12, color: "#4ade80" }}>current state</span>
            </div>
          </div>
        )}

        {/* ── Solver: step walkthrough ── */}
        {mode === "solver" && solverResult && (
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <span style={S.label}>
                {solverResult.type.toUpperCase()} steps — {solverResult.steps.length} operation{solverResult.steps.length !== 1 ? "s" : ""}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.btn("blue")} onClick={() => { runSolver("ref"); }}>REF</button>
                <button style={S.btn("amber")} onClick={() => { runSolver("rref"); }}>RREF</button>
              </div>
            </div>

            {solverResult.steps.length === 0 ? (
              <div style={{ fontSize: 12, color: "#64748b" }}>Matrix is already in {solverResult.type.toUpperCase()} — no operations needed.</div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>
                  Click any step to preview the matrix at that point
                </div>
                {/* Initial */}
                <div
                  onClick={() => setSolverStep(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "5px 8px",
                    borderRadius: 4, cursor: "pointer",
                    background: solverStep === null ? "#1e293b" : "transparent",
                  }}
                >
                  <span style={{ ...S.pill("gray"), minWidth: 36, textAlign: "center" }}>start</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>initial matrix</span>
                </div>

                <StepList
                  steps={solverResult.steps}
                  augmented={augmented}
                  activeStep={solverStep}
                  onStepClick={i => setSolverStep(solverStep === i ? null : i)}
                  color={solverResult.type === "rref" ? "amber" : "blue"}
                />

                {/* Final */}
                <div
                  onClick={() => setSolverStep(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "5px 8px",
                    borderRadius: 4, marginTop: 4, cursor: "pointer",
                    background: solverStep === null ? "transparent" : "transparent",
                  }}
                >
                  <span style={{ ...S.pill(solverResult.type === "rref" ? "amber" : "blue"), minWidth: 36, textAlign: "center" }}>
                    final
                  </span>
                  <span style={{ fontSize: 12, color: solverResult.type === "rref" ? "#fbbf24" : "#60a5fa" }}>
                    {solverResult.type.toUpperCase()} complete ↑ matrix above updates as you click steps
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
        </div>
      </div>
    </>
  );
}