import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import KatexBlock from '../math/KatexBlock.jsx';

// ─── safe expression evaluator ────────────────────────────────────────────────
function safeEval(expr, vars) {
  let s = expr
    .replace(/\^/g, '**')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan');
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v));
  }
  if (!/^[\d\s+\-*/().Math,a-z_]+$/i.test(s)) return NaN;
  try {
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + s + ')')();
    return typeof result === 'number' ? result : NaN;
  } catch {
    return NaN;
  }
}

// ─── closed-form recognition ──────────────────────────────────────────────────
const CLOSED_FORMS = [
  {
    label: '\\sum_{i=1}^{n} 1 = n',
    test: (expr, lo, hi) => lo === 1 && hi === 'n' && expr.trim() === '1',
    formula: (n) => n,
    latexResult: (n) => `n = ${n}`,
    explanation: 'Summing the constant 1 exactly n times gives n.',
  },
  {
    label: '\\sum_{i=1}^{n} i = \\dfrac{n(n+1)}{2}',
    test: (expr, lo, hi) => {
      const e = expr.trim();
      return lo === 1 && hi === 'n' && (e === 'i' || e === 'i*1' || e === '1*i');
    },
    formula: (n) => (n * (n + 1)) / 2,
    latexResult: (n) => `\\frac{${n}(${n}+1)}{2} = ${(n*(n+1))/2}`,
    explanation: 'Gauss\'s triangular-number formula: the sum of the first n positive integers.',
  },
  {
    label: '\\sum_{i=1}^{n} i^2 = \\dfrac{n(n+1)(2n+1)}{6}',
    test: (expr, lo, hi) => {
      const e = expr.trim().replace(/\s/g, '');
      return lo === 1 && hi === 'n' && (e === 'i^2' || e === 'i**2' || e === 'i*i');
    },
    formula: (n) => (n * (n + 1) * (2 * n + 1)) / 6,
    latexResult: (n) => `\\frac{${n}(${n}+1)(${2*n+1})}{6} = ${(n*(n+1)*(2*n+1))/6}`,
    explanation: 'The sum-of-squares formula — drives every quadratic Riemann sum.',
  },
  {
    label: '\\sum_{i=1}^{n} i^3 = \\left[\\dfrac{n(n+1)}{2}\\right]^{\\!2}',
    test: (expr, lo, hi) => {
      const e = expr.trim().replace(/\s/g, '');
      return lo === 1 && hi === 'n' && (e === 'i^3' || e === 'i**3' || e === 'i*i*i');
    },
    formula: (n) => Math.pow((n * (n + 1)) / 2, 2),
    latexResult: (n) => {
      const half = (n*(n+1))/2;
      return `\\left[\\frac{${n}(${n}+1)}{2}\\right]^2 = ${half}^2 = ${half*half}`;
    },
    explanation: 'The cube-sum is the square of the triangular number.',
  },
];

function matchClosedForm(expr, loStr, hi, n) {
  const lo = loStr === '1' ? 1 : parseInt(loStr, 10);
  for (const cf of CLOSED_FORMS) {
    if (cf.test(expr, lo, hi)) {
      return { ...cf, value: cf.formula(n), resultLatex: cf.latexResult(n) };
    }
  }
  return null;
}

// ─── colors ──────────────────────────────────────────────────────────────────
const BAR_COLORS = [
  'bg-violet-500','bg-sky-500','bg-emerald-500','bg-amber-500','bg-rose-500',
  'bg-teal-500','bg-fuchsia-500','bg-orange-500','bg-lime-500','bg-cyan-500',
];
const TEXT_COLORS = [
  'text-violet-400','text-sky-400','text-emerald-400','text-amber-400','text-rose-400',
  'text-teal-400','text-fuchsia-400','text-orange-400','text-lime-400','text-cyan-400',
];
const BORDER_COLORS = [
  'border-violet-500','border-sky-500','border-emerald-500','border-amber-500','border-rose-500',
  'border-teal-500','border-fuchsia-500','border-orange-500','border-lime-500','border-cyan-500',
];

const PRESETS = [
  { label: '∑ 1',     expr: '1',          lo: '1', hi: 'n', n: 5 },
  { label: '∑ i',     expr: 'i',          lo: '1', hi: 'n', n: 5 },
  { label: '∑ i²',   expr: 'i^2',        lo: '1', hi: 'n', n: 4 },
  { label: '∑ i³',   expr: 'i^3',        lo: '1', hi: 'n', n: 3 },
  { label: '∑ 2i−1', expr: '2*i - 1',    lo: '1', hi: 'n', n: 5 },
  { label: '∑ i(i+1)',expr: 'i*(i+1)',    lo: '1', hi: 'n', n: 4 },
];

// ─── inner panel ──────────────────────────────────────────────────────────────
function SigmaPanel({ dark }) {
  const [expr, setExpr]   = useState('i^2');
  const [debouncedExpr, setDebouncedExpr] = useState('i^2');
  const [loStr, setLoStr] = useState('1');
  const [hiStr, setHiStr] = useState('n');
  const [nStr,  setNStr]  = useState('4');
  const [focus, setFocus] = useState(null); // highlighted term index

  useEffect(() => {
    const id = setTimeout(() => setDebouncedExpr(expr), 500);
    return () => clearTimeout(id);
  }, [expr]);

  const n   = parseInt(nStr, 10);
  const lo  = parseInt(loStr, 10);
  const hi  = hiStr.trim() === 'n' ? 'n' : parseInt(hiStr, 10);
  const hiN = hi === 'n' ? n : hi;

  const bg0  = dark ? 'bg-[#0d1117]' : 'bg-slate-100';
  const bg1  = dark ? 'bg-[#161b22]' : 'bg-white';
  const bg2  = dark ? 'bg-[#21262d]' : 'bg-slate-50';
  const bdr  = dark ? 'border-slate-700' : 'border-slate-200';
  const txt  = dark ? 'text-slate-100' : 'text-slate-800';
  const muted = dark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = `w-full px-2 py-1.5 rounded-lg text-xs font-mono outline-none transition-colors border
    ${dark ? 'bg-[#0d1117] border-slate-600 text-slate-200 focus:border-violet-400 placeholder:text-slate-600'
           : 'bg-white border-slate-300 text-slate-800 focus:border-violet-400 placeholder:text-slate-400'}`;

  const terms = useMemo(() => {
    if (!debouncedExpr.trim() || isNaN(lo) || isNaN(n) || n < 1 || n > 50 || lo < 0 || lo > hiN) return [];
    const out = [];
    for (let i = lo; i <= hiN; i++) {
      const val = safeEval(debouncedExpr, { i, n });
      out.push({ i, val });
    }
    return out;
  }, [debouncedExpr, lo, hiN, n]);

  const total = useMemo(() => terms.reduce((s, t) => s + t.val, 0), [terms]);
  const closedForm = useMemo(
    () => isNaN(n) ? null : matchClosedForm(debouncedExpr, loStr, hi, n),
    [debouncedExpr, loStr, hi, n],
  );
  const hasError = terms.some((t) => isNaN(t.val));
  const maxAbs = Math.max(1, ...terms.map((t) => Math.abs(t.val)));
  const fmtVal = (v) => Number.isInteger(v) ? String(v) : v.toFixed(4);

  const sumLatex = `\\displaystyle\\sum_{i=${lo}}^{${hi === 'n' ? 'n' : hiN}} \\!\\left(${
    debouncedExpr.replace(/\*/g, '\\cdot ').replace(/\^(\d+)/g, '^{$1}')
  }\\right) = ${fmtVal(total)}`;

  function applyPreset(p) {
    setExpr(p.expr); setLoStr(p.lo); setHiStr(p.hi); setNStr(String(p.n)); setFocus(null);
  }

  return (
    <div className={`flex flex-col gap-3 p-3 ${bg1} overflow-y-auto`} style={{ maxHeight: 'calc(92dvh - 48px)' }}>

      {/* presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => applyPreset(p)}
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${bdr} ${muted} hover:${dark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'} transition-colors`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* inputs */}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 col-span-2">
          <span className={`text-[10px] uppercase tracking-wide ${muted}`}>Expression  f(i) — use i for index, ^ for powers, * for multiply</span>
          <input className={inputCls} value={expr} spellCheck={false}
            onChange={(e) => { setExpr(e.target.value); setFocus(null); }} placeholder="i^2" />
        </label>
        <label className="flex flex-col gap-1">
          <span className={`text-[10px] uppercase tracking-wide ${muted}`}>Lower  i =</span>
          <input className={inputCls} value={loStr}
            onChange={(e) => { setLoStr(e.target.value); setFocus(null); }} placeholder="1" />
        </label>
        <label className="flex flex-col gap-1">
          <span className={`text-[10px] uppercase tracking-wide ${muted}`}>Upper bound</span>
          <input className={inputCls} value={hiStr}
            onChange={(e) => { setHiStr(e.target.value); setFocus(null); }} placeholder="n" />
        </label>
        <label className="flex flex-col gap-1 col-span-2">
          <span className={`text-[10px] uppercase tracking-wide ${muted}`}>n = (max 50)</span>
          <input type="number" min={1} max={50} className={inputCls} value={nStr}
            onChange={(e) => { setNStr(e.target.value); setFocus(null); }} />
        </label>
      </div>

      {/* notation + result */}
      {!hasError && terms.length > 0 && (
        <div className={`rounded-lg px-3 py-2 overflow-x-auto text-center ${bg0}`}>
          <KatexBlock expr={sumLatex} />
        </div>
      )}
      {hasError && <p className="text-rose-400 text-xs text-center">Expression error — check syntax.</p>}

      {terms.length > 0 && !hasError && (<>

        {/* bar chart */}
        <div>
          <p className={`text-[10px] ${muted} text-center mb-1`}>Click a bar to highlight that term ↓</p>
          <div className="flex items-end gap-0.5 justify-center h-24 overflow-x-auto pb-1">
            {terms.map((t, idx) => {
              const h = Math.max(5, (Math.abs(t.val) / maxAbs) * 100);
              const isActive = focus === idx;
              return (
                <div key={idx} className="flex flex-col items-center cursor-pointer"
                  style={{ minWidth: terms.length > 20 ? 12 : 24 }}
                  onClick={() => setFocus(isActive ? null : idx)}>
                  <span className={`text-[8px] ${muted} mb-0.5`}>{Number.isInteger(t.val) ? t.val : t.val.toFixed(1)}</span>
                  <div className={`rounded-sm transition-all ${BAR_COLORS[idx % BAR_COLORS.length]} ${isActive ? 'ring-2 ring-white opacity-100' : 'opacity-75 hover:opacity-100'}`}
                    style={{ height: `${h}%`, width: '100%' }} />
                  <span className={`text-[8px] mt-0.5 ${isActive ? 'text-white font-bold' : muted}`}>i={t.i}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* expansion */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${txt}`}>Term-by-term expansion</span>
            {focus !== null && (
              <button onClick={() => setFocus(null)} className={`text-[10px] ${muted} hover:text-white underline`}>show all</button>
            )}
          </div>
          <div className={`rounded-lg p-2 space-y-1 ${bg0}`}>
            {/* running sum tokens */}
            <div className={`text-[11px] font-mono flex flex-wrap gap-x-1 gap-y-0.5 items-center pb-1 border-b ${bdr} ${muted}`}>
              {terms.map((t, idx) => {
                const vis = focus === null || focus === idx;
                return (
                  <span key={idx} className={`transition-opacity ${vis ? 'opacity-100' : 'opacity-20'}`}>
                    <span className={`font-bold cursor-pointer hover:underline ${TEXT_COLORS[idx % TEXT_COLORS.length]}`}
                      onClick={() => setFocus(focus === idx ? null : idx)}>
                      {fmtVal(t.val)}
                    </span>
                    {idx < terms.length - 1 && <span>{terms[idx+1].val >= 0 ? ' + ' : ' '}</span>}
                  </span>
                );
              })}
              <span className={`font-bold ${txt}`}> = {fmtVal(total)}</span>
            </div>

            {/* term rows */}
            {terms.map((t, idx) => {
              const vis = focus === null || focus === idx;
              const subtotal = terms.slice(0, idx + 1).reduce((s, x) => s + x.val, 0);
              return (
                <div key={idx} onClick={() => setFocus(focus === idx ? null : idx)}
                  className={`flex items-center gap-2 rounded px-2 py-0.5 cursor-pointer transition-all border-l-2 ${BORDER_COLORS[idx % BORDER_COLORS.length]}
                    ${vis ? `opacity-100 ${bg2}` : 'opacity-20'} ${focus === idx ? `ring-1 ${bdr}` : ''}`}>
                  <span className={`text-[10px] font-mono w-10 shrink-0 ${muted}`}>i = {t.i}</span>
                  <span className={`text-[10px] font-mono grow truncate ${txt}`}>
                    {expr.replace(/\bi\b/g, String(t.i))} = <strong>{fmtVal(t.val)}</strong>
                  </span>
                  {focus === idx && (
                    <span className={`text-[10px] shrink-0 ${muted}`}>running: {fmtVal(subtotal)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* closed-form */}
        {closedForm ? (
          <div className={`rounded-lg p-3 space-y-2 border ${dark ? 'border-violet-700/50 bg-violet-950/30' : 'border-violet-200 bg-violet-50'}`}>
            <div className="flex items-center gap-1.5">
              <span className="text-violet-400">✦</span>
              <span className={`text-xs font-semibold ${dark ? 'text-violet-300' : 'text-violet-700'}`}>Closed-Form Formula</span>
            </div>
            <div className="overflow-x-auto"><KatexBlock expr={closedForm.label} /></div>
            <p className={`text-[11px] ${muted}`}>{closedForm.explanation}</p>
            <div className={`rounded px-2 py-1 overflow-x-auto ${bg0}`}>
              <p className={`text-[10px] ${muted} mb-0.5`}>With n = {n}:</p>
              <KatexBlock expr={closedForm.resultLatex} />
            </div>
            <p className={`text-xs font-semibold ${Math.abs(closedForm.value - total) < 0.001 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {Math.abs(closedForm.value - total) < 0.001
                ? `✓ Formula gives ${closedForm.value} — matches the term total.`
                : `⚠ Formula gives ${closedForm.value} but term total is ${fmtVal(total)}.`}
            </p>
          </div>
        ) : (
          <div className={`rounded-lg p-2 border ${bdr} ${bg0}`}>
            <p className={`text-[11px] ${muted}`}>
              <span className={`font-semibold ${txt}`}>No closed form matched.</span> Sum computed numerically.
            </p>
          </div>
        )}

      </>)}

      {/* syntax help */}
      <details className={`text-[10px] ${muted} cursor-pointer`}>
        <summary className="hover:text-white">Syntax guide</summary>
        <ul className="mt-1.5 space-y-0.5 pl-3 list-disc leading-relaxed">
          <li><code className={txt}>i</code> — index variable</li>
          <li><code className={txt}>n</code> — the value of the upper bound</li>
          <li><code className={txt}>i^2</code> — powers (use <code className={txt}>^</code>)</li>
          <li><code className={txt}>2*i - 1</code> — use <code className={txt}>*</code> for multiply</li>
          <li><code className={txt}>sqrt(i)</code>, <code className={txt}>abs(i)</code> — built-ins</li>
        </ul>
      </details>
    </div>
  );
}

// ─── floating window wrapper ───────────────────────────────────────────────────
export default function SigmaCalc({ onClose }) {
  const dark = document.documentElement.classList.contains('dark');
  const isMobile = window.innerWidth < 640;

  const [pos, setPos] = useState(() => ({
    x: Math.max(16, window.innerWidth - 420),
    y: Math.max(16, Math.round((window.innerHeight - 580) / 2)),
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
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - 380, dragOrigin.current.px + e.clientX - dragOrigin.current.mx)),
        y: Math.max(0, Math.min(window.innerHeight - 80,  dragOrigin.current.py + e.clientY - dragOrigin.current.my)),
      });
    };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const bg0 = dark ? 'bg-[#0d1117]' : 'bg-slate-100';
  const bg1 = dark ? 'bg-[#161b22]' : 'bg-white';
  const bdr = dark ? 'border-slate-700' : 'border-slate-300';
  const txt = dark ? 'text-slate-100' : 'text-slate-900';
  const muted = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <>
      {isMobile && <div className="fixed inset-0 z-[1999] bg-black/40 backdrop-blur-sm" onClick={onClose} />}
      <div
        className={`fixed z-[2000] rounded-2xl shadow-2xl border ${bdr} ${bg1} overflow-hidden`}
        style={isMobile
          ? { left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: Math.min(400, window.innerWidth - 16), maxHeight: '92dvh', overflowY: 'auto' }
          : { left: pos.x, top: pos.y, width: 400 }
        }
      >
        {/* title bar */}
        <div className={`flex items-center gap-2 px-3 py-2.5 ${bg0} border-b ${bdr} cursor-move select-none`}
          onMouseDown={startDrag}>
          <span className="text-violet-400 text-base">Σ</span>
          <span className={`text-xs font-bold tracking-wide ${txt} flex-1`}>Sigma Evaluator</span>
          <span className={`text-[10px] ${muted}`}>drag to move</span>
          <button onClick={onClose}
            className={`ml-1 p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 ${muted} hover:text-rose-500 transition-colors text-base leading-none`}
            title="Close (Esc)">×</button>
        </div>

        <SigmaPanel dark={dark} />
      </div>
    </>
  );
}
