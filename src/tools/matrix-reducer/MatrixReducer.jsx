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
  root: "font-mono p-5 sm:p-6 overflow-y-auto text-slate-800 dark:text-slate-200",
  header: "text-[13px] tracking-[0.15em] uppercase text-emerald-600 dark:text-emerald-400 mb-1 font-semibold",
  subheader: "text-[11px] text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase mb-4",
  card: "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-5 mb-4 shadow-sm dark:shadow-none",
  label: "text-[11px] text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase mb-1.5 block",
  row: "flex items-center gap-2 flex-wrap mb-2",
  select: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200 text-[13px] px-2 py-1 outline-none cursor-pointer",
  input: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200 text-[13px] px-2 py-1 outline-none w-16 text-center",
  cellInput: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200 text-[14px] px-1 py-1.5 outline-none w-14 text-center font-mono transition-colors",
  btn: (variant = "default") => {
    const base = "rounded text-[12px] px-3.5 py-1.5 cursor-pointer tracking-[0.05em] uppercase transition-opacity whitespace-nowrap "
    if (variant === "green") return base + "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:opacity-80"
    if (variant === "red") return base + "bg-rose-100 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 hover:opacity-80"
    if (variant === "blue") return base + "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:opacity-80"
    if (variant === "amber") return base + "bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:opacity-80"
    if (variant === "ghost") return base + "bg-transparent text-slate-600 dark:text-slate-300 hover:opacity-80"
    return base + "bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:opacity-80"
  },
  pill: (color = "gray") => {
    const base = "inline-block rounded px-2 py-0.5 text-[11px] tracking-[0.05em] "
    if (color === "green") return base + "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
    if (color === "blue") return base + "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
    if (color === "amber") return base + "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
    return base + "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
  },
  tabBtn: (active) => {
    const base = "rounded-t text-[12px] px-4 py-2 cursor-pointer tracking-[0.08em] uppercase mb-[-1px] relative transition-colors "
    if (active) return base + "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-b-slate-50 dark:border-b-slate-800 text-slate-800 dark:text-slate-200 z-10"
    return base + "bg-transparent border border-transparent border-b-slate-200 dark:border-b-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 z-0"
  }
};

// ── MatrixGrid display ──────────────────────────────────────────────────────
function MatrixGrid({ matrix, augmented, editing, inputStrings, onCellChange }) {
  const numRows = matrix.length;
  const numCols = matrix[0]?.length ?? 0;
  const augSplit = augmented ? numCols - 1 : numCols;

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <tbody>
          {matrix.map((row, ri) => (
            <tr key={ri}>
              <td className={`pl-1 pr-0.5 w-1.5 border-l-2 border-emerald-400 ${ri === 0 ? 'border-t-2' : ''} ${ri === numRows - 1 ? 'border-b-2' : ''}`} />
              {row.map((f, ci) => (
                <React.Fragment key={ci}>
                  {augmented && ci === augSplit && (
                    <td className="px-1.5">
                      <div className="w-[1px] h-8 bg-emerald-400 opacity-50 mx-auto" />
                    </td>
                  )}
                  <td className="p-1">
                    {editing ? (
                      <input
                        className={S.cellInput}
                        value={inputStrings[ri][ci]}
                        onChange={e => onCellChange(ri, ci, e.target.value)}
                      />
                    ) : (
                      <div className={`${S.cellInput} cursor-default flex items-center justify-center ${feq0(f) ? 'border-transparent text-slate-400 dark:text-slate-600 bg-transparent dark:bg-transparent' : (f.n < 0 ? 'border-slate-300 dark:border-slate-600 text-rose-600 dark:text-rose-400' : 'border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200')}`}>
                        {fracToString(f)}
                      </div>
                    )}
                  </td>
                </React.Fragment>
              ))}
              <td className={`pr-1 pl-0.5 w-1.5 border-r-2 border-emerald-400 ${ri === 0 ? 'border-t-2' : ''} ${ri === numRows - 1 ? 'border-b-2' : ''}`} />
              <td className="pl-2.5 text-[11px] text-slate-500 dark:text-slate-400 align-middle">
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
    <div className="flex flex-col gap-1">
      {steps.map((h, i) => (
        <div
          key={i}
          onClick={() => onStepClick && onStepClick(i)}
          className={`flex items-center gap-2.5 px-2 py-1.5 rounded ${activeStep === i ? 'bg-slate-200 dark:bg-slate-800' : 'bg-transparent'} ${onStepClick ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50' : 'cursor-default'} transition-colors`}
        >
          <span className={`${S.pill(color)} min-w-[36px] text-center`}>
            {i + 1}
          </span>
          <span className="text-[12px] text-slate-600 dark:text-slate-400 flex-1">{h.opLabel}</span>
          {onStepClick && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">view</span>
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

  const bg1 = 'bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-2xl'
  const bdr = 'border-slate-200/80 dark:border-slate-700/80'

  return (
    <>
      {isMobile && onBack && (
        <div className="fixed inset-0 z-[1999] bg-black/40 backdrop-blur-sm" onClick={onBack} />
      )}
      <div
        className={`fixed z-[2000] rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_50px_rgba(0,0,0,0.5)] border ${bdr} ${bg1} overflow-hidden ring-1 ring-black/5 dark:ring-white/10 flex flex-col`}
        style={isMobile
          ? { left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: Math.min(PANEL_W, window.innerWidth - 16), maxHeight: '92dvh' }
          : { left: pos.x, top: pos.y, width: PANEL_W, maxHeight: '92dvh' }
        }
      >
        {/* Title bar */}
        <div
          onMouseDown={startDrag}
          className={`flex items-center gap-2 px-3 py-2.5 bg-slate-100/50 dark:bg-slate-800/50 border-b ${bdr} cursor-move shrink-0 select-none`}
        >
          <span className="text-emerald-500 dark:text-emerald-400 text-base font-bold font-mono">⊞</span>
          <span className={`text-xs font-bold tracking-wide text-slate-700 dark:text-slate-100 flex-1 uppercase font-mono`}>
            Matrix Reducer
          </span>
          {onBack && (
            <button onClick={onBack}
              className={`ml-1 p-1 rounded-lg hover:bg-rose-500/10 dark:hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors text-base leading-none`}
              title="Close"
            >×</button>
          )}
        </div>
        <div className={`${S.root} flex-1 min-h-0 bg-transparent`}>
          <div className="max-w-[800px] mx-auto">
            <div className={S.header}>Matrix Workspace</div>
            <div className={S.subheader}>REF / RREF · Manual &amp; Solver</div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
              <button className={S.tabBtn(mode === "manual")} onClick={() => switchMode("manual")}>
                ✎ Manual
              </button>
              <button className={S.tabBtn(mode === "solver")} onClick={() => switchMode("solver")}>
                ⚡ Solver
              </button>
            </div>

            {/* ── Shared setup (shown when no active session) ── */}
            {(mode === "manual" ? !matrix : !solverResult) && (
              <div className={S.card}>
                <span className={S.label}>Matrix dimensions</span>
                <div className={S.row}>
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">Rows</span>
                  <input type="number" min={1} max={10} value={rows} className={`${S.input} w-12`}
                    onChange={e => resizeGrid(Math.max(1, Math.min(10, +e.target.value)), cols)} />
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">Cols</span>
                  <input type="number" min={1} max={12} value={cols} className={`${S.input} w-12`}
                    onChange={e => resizeGrid(rows, Math.max(1, Math.min(12, +e.target.value)))} />
                  <label className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 cursor-pointer">
                    <input type="checkbox" checked={augmented} onChange={e => setAugmented(e.target.checked)}
                      className="accent-emerald-500" />
                    Augmented
                  </label>
                </div>
              </div>
            )}

            {/* ── Matrix input / display ── */}
            <div className={S.card}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className={S.label}>
                  {mode === "manual"
                    ? (matrix ? `Current matrix — step ${history.length}` : "Enter values  (fractions ok: 3/2)")
                    : (solverResult ? `${solverResult.type.toUpperCase()} result` : "Enter values  (fractions ok: 3/2)")}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {mode === "manual" && matrix && (
                    <>
                      <button className={S.btn()} onClick={undo} disabled={!history.length}>↩ Undo</button>
                      <button className={S.btn()} onClick={clearHistory} disabled={!history.length}>↩↩ Revert</button>
                      <button className={S.btn("red")} onClick={resetSession}>Reset</button>
                    </>
                  )}
                  {mode === "solver" && solverResult && (
                    <button className={S.btn("red")} onClick={() => { setSolverResult(null); setSolverStep(null); }}>
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
                <div className="mt-4">
                  <button className={S.btn("green")} onClick={startSession}>Start Manual →</button>
                </div>
              )}
              {mode === "solver" && !solverResult && (
                <div className="flex gap-2.5 mt-4">
                  <button className={S.btn("blue")} onClick={() => runSolver("ref")}>Solve → REF</button>
                  <button className={S.btn("amber")} onClick={() => runSolver("rref")}>Solve → RREF</button>
                </div>
              )}
            </div>

            {/* ── Manual: operations ── */}
            {mode === "manual" && matrix && (
              <div className={S.card}>
                <span className={S.label}>Row operation</span>
                <div className={S.row}>
                  <select className={S.select} value={op} onChange={e => setOp(e.target.value)}>
                    <option value="replace">Row Replacement: Rᵢ ← Rᵢ + k·Rⱼ</option>
                    <option value="scale">Scale Row: Rᵢ ← k·Rᵢ</option>
                    <option value="swap">Swap Rows: Rᵢ ↔ Rⱼ</option>
                  </select>
                </div>

                <div className={S.row}>
                  {(op === "swap" || op === "replace") && (
                    <>
                      <span className="text-[13px] text-slate-500 dark:text-slate-400 min-w-[44px]">
                        {op === "swap" ? "R1" : "Target"}
                      </span>
                      <select className={S.select} value={tgtRow} onChange={e => setTgtRow(+e.target.value)}>
                        {Array.from({ length: numRows }, (_, i) => <option key={i} value={i}>R{i + 1}</option>)}
                      </select>
                    </>
                  )}
                  {op === "swap" && <span className="text-[13px] text-slate-500 dark:text-slate-400">↔</span>}
                  {op === "replace" && (
                    <>
                      <span className="text-[13px] text-slate-500 dark:text-slate-400">+</span>
                      <input className={`${S.input} w-14`} value={scalarStr}
                        onChange={e => setScalarStr(e.target.value)} placeholder="k" />
                      <span className="text-[13px] text-slate-500 dark:text-slate-400">·</span>
                    </>
                  )}
                  {op === "scale" && (
                    <>
                      <select className={S.select} value={srcRow} onChange={e => setSrcRow(+e.target.value)}>
                        {Array.from({ length: numRows }, (_, i) => <option key={i} value={i}>R{i + 1}</option>)}
                      </select>
                      <span className="text-[13px] text-slate-500 dark:text-slate-400">←</span>
                      <input className={`${S.input} w-14`} value={scalarStr}
                        onChange={e => setScalarStr(e.target.value)} placeholder="k" />
                      <span className="text-[13px] text-slate-500 dark:text-slate-400">·  R{srcRow + 1}</span>
                    </>
                  )}
                  {(op === "swap" || op === "replace") && (
                    <select className={S.select} value={srcRow} onChange={e => setSrcRow(+e.target.value)}>
                      {Array.from({ length: numRows }, (_, i) => <option key={i} value={i}>R{i + 1}</option>)}
                    </select>
                  )}
                </div>

                <div className="text-[12px] text-emerald-600 dark:text-emerald-400 mb-2.5 min-h-[18px]">
                  {op === "swap" && `R${tgtRow + 1} ↔ R${srcRow + 1}`}
                  {op === "scale" && `R${srcRow + 1} ← (${scalarStr})·R${srcRow + 1}`}
                  {op === "replace" && `R${tgtRow + 1} ← R${tgtRow + 1} + (${scalarStr})·R${srcRow + 1}`}
                </div>

                {error && <div className="text-[12px] text-rose-600 dark:text-rose-400 mb-2.5">⚠ {error}</div>}

                <button className={S.btn("green")} onClick={applyOp}>Apply operation</button>
              </div>
            )}

            {/* ── Manual: history ── */}
            {mode === "manual" && history.length > 0 && (
              <div className={S.card}>
                <span className={S.label}>Step history</span>
                <StepList steps={history} augmented={augmented} color="blue" />
                <div className="flex items-center gap-2.5 mt-2 px-2 py-1.5">
                  <span className={`${S.pill("green")} min-w-[36px] text-center`}>now</span>
                  <span className="text-[12px] text-emerald-600 dark:text-emerald-400">current state</span>
                </div>
              </div>
            )}

            {/* ── Solver: step walkthrough ── */}
            {mode === "solver" && solverResult && (
              <div className={S.card}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className={S.label}>
                    {solverResult.type.toUpperCase()} steps — {solverResult.steps.length} operation{solverResult.steps.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-2">
                    <button className={S.btn("blue")} onClick={() => { runSolver("ref"); }}>REF</button>
                    <button className={S.btn("amber")} onClick={() => { runSolver("rref"); }}>RREF</button>
                  </div>
                </div>

                {solverResult.steps.length === 0 ? (
                  <div className="text-[12px] text-slate-600 dark:text-slate-400">Matrix is already in {solverResult.type.toUpperCase()} — no operations needed.</div>
                ) : (
                  <>
                    <div className="text-[11px] text-slate-500 dark:text-slate-500 mb-2.5">
                      Click any step to preview the matrix at that point
                    </div>
                    {/* Initial */}
                    <div
                      onClick={() => setSolverStep(null)}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer ${solverStep === null ? 'bg-slate-200 dark:bg-slate-800' : 'bg-transparent'}`}
                    >
                      <span className={`${S.pill("gray")} min-w-[36px] text-center`}>start</span>
                      <span className="text-[12px] text-slate-600 dark:text-slate-400">initial matrix</span>
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
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded mt-1 cursor-pointer bg-transparent"
                    >
                      <span className={`${S.pill(solverResult.type === "rref" ? "amber" : "blue")} min-w-[36px] text-center`}>
                        final
                      </span>
                      <span className={`text-[12px] ${solverResult.type === "rref" ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
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