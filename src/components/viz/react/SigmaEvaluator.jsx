import { useState, useMemo } from 'react';
import KatexInline from '../../math/KatexInline.jsx';
import KatexBlock from '../../math/KatexBlock.jsx';

// ─── safe expression evaluator ───────────────────────────────────────────────
// Supports: i, n, +, -, *, /, ^, (), Math functions
function safeEval(expr, vars) {
  // Replace ^ with ** for JS exponentiation
  let s = expr
    .replace(/\^/g, '**')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan');
  // Inject variable values
  for (const [k, v] of Object.entries(vars)) {
    // Replace whole-word occurrences
    s = s.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v));
  }
  // Security guard: only digits, operators, parens, dots, spaces, Math.*
  if (!/^[\d\s+\-*/().Math,a-z_]+$/i.test(s)) return NaN;
  try {
    // eslint-disable-next-line no-new-func
    return Function('"use strict"; return (' + s + ')')();
  } catch {
    return NaN;
  }
}

// ─── closed-form recognition ─────────────────────────────────────────────────
const CLOSED_FORMS = [
  {
    label: '\\sum_{i=1}^{n} 1 = n',
    test: (expr, lo, hi) => {
      const e = expr.trim();
      return lo === 1 && hi === 'n' && e === '1';
    },
    formula: (n) => n,
    latex: (n) => `n = ${n}`,
    explanation: 'Summing the constant 1 exactly n times gives n.',
  },
  {
    label: '\\sum_{i=1}^{n} i = \\dfrac{n(n+1)}{2}',
    test: (expr, lo, hi) => {
      const e = expr.trim();
      return lo === 1 && hi === 'n' && (e === 'i' || e === 'i*1' || e === '1*i');
    },
    formula: (n) => (n * (n + 1)) / 2,
    latex: (n) => `\\frac{${n}(${n}+1)}{2} = \\frac{${n * (n + 1)}}{2} = ${(n * (n + 1)) / 2}`,
    explanation: 'This is Gauss\'s triangular-number formula.',
  },
  {
    label: '\\sum_{i=1}^{n} i^2 = \\dfrac{n(n+1)(2n+1)}{6}',
    test: (expr, lo, hi) => {
      const e = expr.trim().replace(/\s/g, '');
      return lo === 1 && hi === 'n' && (e === 'i^2' || e === 'i**2' || e === 'i*i');
    },
    formula: (n) => (n * (n + 1) * (2 * n + 1)) / 6,
    latex: (n) => `\\frac{${n}(${n}+1)(2\\cdot${n}+1)}{6} = \\frac{${n*(n+1)*(2*n+1)}}{6} = ${(n*(n+1)*(2*n+1))/6}`,
    explanation: 'The sum-of-squares formula — the engine of every quadratic Riemann sum.',
  },
  {
    label: '\\sum_{i=1}^{n} i^3 = \\left[\\dfrac{n(n+1)}{2}\\right]^2',
    test: (expr, lo, hi) => {
      const e = expr.trim().replace(/\s/g, '');
      return lo === 1 && hi === 'n' && (e === 'i^3' || e === 'i**3' || e === 'i*i*i');
    },
    formula: (n) => Math.pow((n * (n + 1)) / 2, 2),
    latex: (n) => {
      const half = (n*(n+1))/2;
      return `\\left[\\frac{${n}(${n}+1)}{2}\\right]^2 = ${half}^2 = ${half*half}`;
    },
    explanation: 'The cube-sum equals the square of the triangular number. A beautiful identity.',
  },
];

// ─── detect which closed form applies ────────────────────────────────────────
function matchClosedForm(expr, lo, hi, nVal) {
  for (const cf of CLOSED_FORMS) {
    if (cf.test(expr, lo, hi)) {
      return { ...cf, value: cf.formula(nVal), latexResult: cf.latex(nVal) };
    }
  }
  return null;
}

// ─── component ───────────────────────────────────────────────────────────────
const PRESETS = [
  { label: '∑ 1', expr: '1', lo: 1, hi: 'n', n: 5 },
  { label: '∑ i', expr: 'i', lo: 1, hi: 'n', n: 5 },
  { label: '∑ i²', expr: 'i^2', lo: 1, hi: 'n', n: 4 },
  { label: '∑ i³', expr: 'i^3', lo: 1, hi: 'n', n: 3 },
  { label: '∑ 2i−1', expr: '2*i - 1', lo: 1, hi: 'n', n: 5 },
  { label: '∑ i(i+1)', expr: 'i*(i+1)', lo: 1, hi: 'n', n: 4 },
];

export default function SigmaEvaluator() {
  const [expr, setExpr]     = useState('i^2');
  const [loStr, setLoStr]   = useState('1');
  const [hiStr, setHiStr]   = useState('n');
  const [nStr, setNStr]     = useState('4');
  const [step, setStep]     = useState(null); // null = show all; index = highlight that term

  const n   = parseInt(nStr, 10);
  const lo  = parseInt(loStr, 10);
  const hi  = hiStr.trim() === 'n' ? 'n' : parseInt(hiStr, 10);
  const hiN = hi === 'n' ? n : hi;

  // ── evaluate each term ────────────────────────────────────────────────────
  const terms = useMemo(() => {
    if (!expr.trim() || isNaN(lo) || isNaN(n) || n < 1 || n > 50 || lo < 0 || lo > hiN) return [];
    const out = [];
    for (let i = lo; i <= hiN; i++) {
      const val = safeEval(expr, { i, n });
      out.push({ i, val });
    }
    return out;
  }, [expr, lo, hiN, n]);

  const total = useMemo(() => terms.reduce((s, t) => s + t.val, 0), [terms]);

  const closedForm = useMemo(
    () => (isNaN(n) ? null : matchClosedForm(expr, loStr === '1' ? 1 : parseInt(loStr), hi, n)),
    [expr, loStr, hi, n],
  );

  const hasError = terms.some((t) => isNaN(t.val));

  // ── latex for the current sum ─────────────────────────────────────────────
  const sumLatex = `\\sum_{i=${lo}}^{${hi === 'n' ? 'n' : hiN}} \\left(${expr
    .replace(/\*/g, '\\cdot ')
    .replace(/\^/g, '^')}\\right)`;

  // ── colour helpers ────────────────────────────────────────────────────────
  const BAR_COLORS = [
    'bg-violet-500', 'bg-sky-500', 'bg-emerald-500',
    'bg-amber-500',  'bg-rose-500', 'bg-teal-500',
    'bg-fuchsia-500','bg-orange-500','bg-lime-500','bg-cyan-500',
  ];
  const maxAbs = Math.max(1, ...terms.map((t) => Math.abs(t.val)));

  function applyPreset(p) {
    setExpr(p.expr);
    setLoStr(String(p.lo));
    setHiStr(p.hi);
    setNStr(String(p.n));
    setStep(null);
  }

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-lg p-4 sm:p-6 space-y-5 select-none">

      {/* ── header ── */}
      <div className="text-center">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Sigma Evaluator</h3>
        <p className="text-slate-400 text-sm">Enter any sum, choose bounds, see every term expand step by step.</p>
      </div>

      {/* ── presets ── */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-3 py-1 rounded-full text-xs font-mono font-semibold border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── input panel ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-slate-400 text-xs uppercase tracking-wide">Expression f(i)</span>
          <input
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-violet-500"
            value={expr}
            onChange={(e) => { setExpr(e.target.value); setStep(null); }}
            placeholder="i^2"
            spellCheck={false}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-400 text-xs uppercase tracking-wide">Lower i =</span>
          <input
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-violet-500"
            value={loStr}
            onChange={(e) => { setLoStr(e.target.value); setStep(null); }}
            placeholder="1"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-400 text-xs uppercase tracking-wide">Upper bound</span>
          <input
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-violet-500"
            value={hiStr}
            onChange={(e) => { setHiStr(e.target.value); setStep(null); }}
            placeholder="n"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-400 text-xs uppercase tracking-wide">n =</span>
          <input
            type="number"
            min={1}
            max={50}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-violet-500"
            value={nStr}
            onChange={(e) => { setNStr(e.target.value); setStep(null); }}
          />
        </label>
      </div>

      {/* ── display sum notation ── */}
      {!hasError && terms.length > 0 && (
        <div className="bg-slate-800 rounded-lg px-4 py-3 text-center overflow-x-auto">
          <KatexBlock math={`${sumLatex} \\;=\\; ${total % 1 === 0 ? total : total.toFixed(4)}`} />
        </div>
      )}

      {hasError && (
        <p className="text-rose-400 text-sm text-center">
          Expression error — check for typos. Use * for multiply, ^ for powers, i for the index.
        </p>
      )}

      {terms.length === 0 && !hasError && (
        <p className="text-slate-500 text-sm text-center">Enter a valid expression and bounds to begin.</p>
      )}

      {terms.length > 0 && !hasError && (
        <>
          {/* ── bar chart ── */}
          <div>
            <p className="text-slate-400 text-xs mb-2 text-center">Each bar = one term. Click a bar to highlight it in the expansion below.</p>
            <div className="flex items-end gap-1 justify-center h-28 overflow-x-auto pb-1">
              {terms.map((t, idx) => {
                const heightPct = Math.max(4, (Math.abs(t.val) / maxAbs) * 100);
                const isNeg     = t.val < 0;
                const color     = BAR_COLORS[idx % BAR_COLORS.length];
                const isActive  = step === idx;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center cursor-pointer"
                    style={{ minWidth: terms.length > 20 ? 14 : 28 }}
                    onClick={() => setStep(isActive ? null : idx)}
                  >
                    <span className="text-[9px] text-slate-400 mb-0.5">{Number.isInteger(t.val) ? t.val : t.val.toFixed(1)}</span>
                    <div
                      className={`rounded-sm transition-all duration-150 ${color} ${isActive ? 'ring-2 ring-white' : 'opacity-80 hover:opacity-100'}`}
                      style={{ height: `${heightPct}%`, width: '100%', opacity: isNeg ? 0.5 : undefined }}
                    />
                    <span className={`text-[9px] mt-0.5 ${isActive ? 'text-white font-bold' : 'text-slate-500'}`}>i={t.i}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── step-by-step expansion ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-300 text-sm font-semibold">Term-by-term expansion</p>
              {step !== null && (
                <button
                  onClick={() => setStep(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Show all
                </button>
              )}
            </div>
            <div className="bg-slate-800 rounded-lg px-3 py-3 overflow-x-auto space-y-1.5">
              {/* running sum line */}
              <div className="text-slate-400 text-xs font-mono mb-2 flex flex-wrap gap-x-1 gap-y-1 items-center">
                {terms.map((t, idx) => {
                  const visible = step === null || step === idx;
                  const color   = BAR_COLORS[idx % BAR_COLORS.length].replace('bg-', 'text-');
                  return (
                    <span key={idx} className={`transition-opacity ${visible ? 'opacity-100' : 'opacity-20'}`}>
                      <span
                        className={`font-bold ${color} cursor-pointer hover:underline`}
                        onClick={() => setStep(step === idx ? null : idx)}
                      >
                        {Number.isInteger(t.val) ? t.val : t.val.toFixed(3)}
                      </span>
                      {idx < terms.length - 1 && (
                        <span className="text-slate-500">{terms[idx + 1].val >= 0 ? ' + ' : ' '}</span>
                      )}
                    </span>
                  );
                })}
                <span className="text-slate-300 font-bold"> = {Number.isInteger(total) ? total : total.toFixed(4)}</span>
              </div>

              {/* individual term rows */}
              {terms.map((t, idx) => {
                const visible = step === null || step === idx;
                const color   = BAR_COLORS[idx % BAR_COLORS.length].replace('bg-', 'border-');
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 rounded-md px-2 py-1 cursor-pointer transition-all border-l-2 ${color} ${
                      visible ? 'opacity-100 bg-slate-700/40' : 'opacity-20 bg-transparent'
                    } ${step === idx ? 'ring-1 ring-slate-500' : ''}`}
                    onClick={() => setStep(step === idx ? null : idx)}
                  >
                    <span className="text-slate-400 text-xs w-12 shrink-0 font-mono">i = {t.i}</span>
                    <span className="text-slate-300 text-xs font-mono grow overflow-x-auto whitespace-nowrap">
                      f({t.i}) = {expr.replace(/\bi\b/g, String(t.i)).replace(/\^/g, '^')} = <strong className="text-white">{Number.isInteger(t.val) ? t.val : t.val.toFixed(4)}</strong>
                    </span>
                    {/* running subtotal */}
                    {step === idx && (
                      <span className="text-slate-400 text-xs shrink-0">
                        subtotal: {Number.isInteger(terms.slice(0, idx + 1).reduce((s, x) => s + x.val, 0))
                          ? terms.slice(0, idx + 1).reduce((s, x) => s + x.val, 0)
                          : terms.slice(0, idx + 1).reduce((s, x) => s + x.val, 0).toFixed(4)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── closed-form panel ── */}
          {closedForm ? (
            <div className="bg-slate-800 border border-violet-700/50 rounded-lg px-4 py-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-violet-400 text-lg">✦</span>
                <span className="text-violet-300 font-semibold text-sm">Closed-Form Formula Detected</span>
              </div>
              <div className="overflow-x-auto">
                <KatexBlock math={closedForm.label} />
              </div>
              <p className="text-slate-400 text-sm">{closedForm.explanation}</p>
              <div className="bg-slate-900 rounded-md px-3 py-2 overflow-x-auto">
                <p className="text-slate-400 text-xs mb-1">With n = {n}:</p>
                <KatexBlock math={closedForm.latexResult} />
              </div>
              <div className={`text-sm font-semibold ${Math.abs(closedForm.value - total) < 0.001 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Math.abs(closedForm.value - total) < 0.001
                  ? `✓ Formula gives ${closedForm.value} — matches the term-by-term total.`
                  : `⚠ Formula gives ${closedForm.value} but term total is ${total}.`}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
              <p className="text-slate-400 text-sm">
                <span className="text-slate-300 font-semibold">No closed form matched.</span> The sum was evaluated numerically by computing each term.
                Try one of the presets to see closed-form recognition in action.
              </p>
            </div>
          )}

          {/* ── result banner ── */}
          <div className="bg-slate-800 rounded-lg px-4 py-3 text-center border border-slate-600">
            <KatexBlock math={`${sumLatex} = ${Number.isInteger(total) ? total : total.toFixed(4)}`} />
          </div>
        </>
      )}

      {/* ── help ── */}
      <details className="text-xs text-slate-500 cursor-pointer">
        <summary className="hover:text-slate-300">Expression syntax guide</summary>
        <ul className="mt-2 space-y-0.5 pl-3 list-disc">
          <li>Use <code className="text-slate-300">i</code> as the index variable</li>
          <li>Use <code className="text-slate-300">n</code> to refer to the upper bound value</li>
          <li>Use <code className="text-slate-300">^</code> for powers: <code className="text-slate-300">i^2</code>, <code className="text-slate-300">i^3</code></li>
          <li>Use <code className="text-slate-300">*</code> for multiplication: <code className="text-slate-300">2*i - 1</code></li>
          <li>Use <code className="text-slate-300">sqrt(i)</code>, <code className="text-slate-300">abs(i)</code> for built-ins</li>
          <li>Example: <code className="text-slate-300">i*(i+1)/2</code> or <code className="text-slate-300">3*i^2 - 2*i + 1</code></li>
        </ul>
      </details>
    </div>
  );
}
