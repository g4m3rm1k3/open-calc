import { useState, useCallback } from 'react';

// Starting augmented matrix [2,1,-1|8; -3,-1,2|-11; -2,1,2|-3]
// Solution: x1=2, x2=3, x3=-1
const INITIAL = [
  [2, 1, -1, 8],
  [-3, -1, 2, -11],
  [-2, 1, 2, -3],
];

const STEPS = [
  {
    title: 'The goal: reach Row Echelon Form',
    body: 'We want leading 1s (pivots) on a staircase pattern, with zeros above and below each pivot. This augmented matrix [A|b] encodes a 3×3 linear system. Your mission: reduce it to RREF to find x₁, x₂, x₃.',
  },
  {
    title: 'Your turn: pick a row operation',
    body: 'Use the controls below to apply row operations. Swap rows, scale a row, or add a multiple of one row to another. Valid steps highlight gold. Try: divide R1 by 2 first.',
  },
  {
    title: 'Checking your work',
    body: 'Press "Check RREF" to score your progress. Green ✓ = correct pivot. Amber ⚠ = out of order. Red ✗ = not yet reduced. Keep going until all rows score green.',
  },
  {
    title: 'Solution: what RREF tells you',
    body: 'Each pivot row gives one variable\'s value directly. With RREF, x₃ is read from row 3, x₂ from row 2, x₁ from row 1. The solution to this system is x₁=2, x₂=3, x₃=−1.',
  },
];

function fraction(n, places = 3) {
  if (Math.abs(n) < 1e-9) return '0';
  const r = parseFloat(n.toFixed(places));
  return r.toString();
}

function isRREF(m) {
  let lastPivotCol = -1;
  for (let r = 0; r < 3; r++) {
    let pivotCol = -1;
    for (let c = 0; c < 3; c++) {
      if (Math.abs(m[r][c]) > 1e-6) { pivotCol = c; break; }
    }
    if (pivotCol === -1) continue;
    if (Math.abs(m[r][pivotCol] - 1) > 1e-6) return false;
    if (pivotCol <= lastPivotCol) return false;
    for (let r2 = 0; r2 < 3; r2++) {
      if (r2 !== r && Math.abs(m[r2][pivotCol]) > 1e-6) return false;
    }
    lastPivotCol = pivotCol;
  }
  return true;
}

function getPivotCols(m) {
  const pivots = [];
  let lastPivotCol = -1;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (Math.abs(m[r][c]) > 1e-6) {
        if (c > lastPivotCol) { pivots.push({ r, c }); lastPivotCol = c; }
        break;
      }
    }
  }
  return pivots;
}

function checkRowStatus(m) {
  const pivots = getPivotCols(m);
  return [0, 1, 2].map(r => {
    const piv = pivots.find(p => p.r === r);
    if (!piv) return 'free';
    if (Math.abs(m[r][piv.c] - 1) > 1e-6) return 'needs-scale';
    const zerosAboveBelow = [0, 1, 2].filter(r2 => r2 !== r && Math.abs(m[r2][piv.c]) > 1e-6).length === 0;
    return zerosAboveBelow ? 'ok' : 'needs-elim';
  });
}

export default function RowReductionChallengeViz() {
  const [step, setStep] = useState(0);
  const [matrix, setMatrix] = useState(INITIAL.map(r => [...r]));
  const [history, setHistory] = useState([]);
  const [flash, setFlash] = useState({}); // {row, type} = 'gold'|'red'
  const [checked, setChecked] = useState(null);

  // Op state
  const [opType, setOpType] = useState('scale'); // 'swap'|'scale'|'replace'
  const [ri, setRi] = useState(0);
  const [rj, setRj] = useState(1);
  const [k, setK] = useState('2');

  const applyOp = useCallback(() => {
    const m = matrix.map(r => [...r]);
    const kv = parseFloat(k);

    if (opType === 'swap') {
      if (ri === rj) { triggerFlash(ri, 'red', 'Cannot swap a row with itself'); return; }
      [m[ri], m[rj]] = [m[rj], m[ri]];
      setHistory(h => [...h, `R${ri+1} ↔ R${rj+1}`].slice(-6));
      triggerFlash(ri, 'gold');
      triggerFlash(rj, 'gold');
    } else if (opType === 'scale') {
      if (Math.abs(kv) < 1e-9 || isNaN(kv)) { triggerFlash(ri, 'red', '⚠ Cannot multiply by 0!'); return; }
      m[ri] = m[ri].map(v => v * kv);
      setHistory(h => [...h, `R${ri+1} × ${k}`].slice(-6));
      triggerFlash(ri, 'gold');
    } else if (opType === 'replace') {
      if (ri === rj) { triggerFlash(ri, 'red', 'Cannot add row to itself like that'); return; }
      if (isNaN(kv)) { triggerFlash(ri, 'red', 'Invalid multiplier'); return; }
      m[ri] = m[ri].map((v, ci) => v + kv * m[rj][ci]);
      setHistory(h => [...h, `R${ri+1} → R${ri+1} + ${k}·R${rj+1}`].slice(-6));
      triggerFlash(ri, 'gold');
    }

    setMatrix(m);
    setChecked(null);
  }, [matrix, opType, ri, rj, k]);

  const [flashMsg, setFlashMsg] = useState('');
  const triggerFlash = (row, type, msg = '') => {
    setFlash(f => ({ ...f, [row]: type }));
    if (msg) setFlashMsg(msg);
    setTimeout(() => { setFlash(f => { const n = { ...f }; delete n[row]; return n; }); setFlashMsg(''); }, 900);
  };

  const reset = () => { setMatrix(INITIAL.map(r => [...r])); setHistory([]); setChecked(null); setFlash({}); };

  const checkRREF = () => {
    const status = checkRowStatus(matrix);
    setChecked(status);
  };

  const pivotCols = getPivotCols(matrix);
  const done = isRREF(matrix);
  const rowStatuses = checked || [];

  const cellColor = (r, c) => {
    const isPivot = pivotCols.some(p => p.r === r && p.c === c);
    if (isPivot) return 'text-green-600 dark:text-green-400 font-bold';
    if (c === 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-700 dark:text-slate-200';
  };

  const rowBg = (r) => {
    if (flash[r] === 'gold') return 'bg-amber-100 dark:bg-amber-900/40';
    if (flash[r] === 'red') return 'bg-red-100 dark:bg-red-900/40';
    if (rowStatuses[r] === 'ok') return 'bg-green-50 dark:bg-green-900/20';
    if (rowStatuses[r] === 'needs-scale' || rowStatuses[r] === 'needs-elim') return 'bg-red-50 dark:bg-red-900/10';
    return '';
  };

  const statusIcon = (r) => {
    if (!checked) return null;
    const s = rowStatuses[r];
    if (s === 'ok') return <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-bold">✓</span>;
    if (s === 'needs-scale') return <span className="ml-2 text-red-500 text-xs">✗ needs pivot=1</span>;
    if (s === 'needs-elim') return <span className="ml-2 text-amber-500 text-xs">⚠ not fully cleared</span>;
    if (s === 'free') return <span className="ml-2 text-slate-400 text-xs">— zero row</span>;
    return null;
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 select-none">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Row Reduction Challenge</h3>
          <span className="text-xs text-slate-400">{step + 1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i === step ? 'bg-emerald-50 dark:bg-emerald-900/300' : i < step ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1 text-sm">{STEPS[step].title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{STEPS[step].body}</p>
        </div>
      </div>

      {/* Matrix display */}
      <div className="flex justify-center mb-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 inline-block">
          <div className="font-mono text-sm">
            {matrix.map((row, r) => (
              <div key={r} className={`flex items-center gap-1 rounded px-2 py-1 mb-1 transition-colors duration-300 ${rowBg(r)}`}>
                <span className="text-[10px] text-slate-400 w-5">R{r+1}</span>
                <span className="text-slate-400 mr-1">[</span>
                {row.map((v, c) => (
                  <span key={c}>
                    <span className={`w-12 inline-block text-center ${cellColor(r, c)}`}>
                      {fraction(v)}
                    </span>
                    {c === 2 && <span className="text-slate-400 mx-1">|</span>}
                    {c < 3 && c !== 2 && <span className="text-slate-300 dark:text-slate-600 mx-0.5">,</span>}
                  </span>
                ))}
                <span className="text-slate-400 ml-1">]</span>
                {statusIcon(r)}
              </div>
            ))}
          </div>
          {/* Pivot/free labels */}
          <div className="flex gap-2 mt-2 text-[9px]">
            <span className="text-green-600 dark:text-green-400">● pivot cols</span>
            <span className="text-amber-500">● augment col</span>
          </div>
        </div>
      </div>

      {/* Flash message */}
      {flashMsg && (
        <div className="text-center text-xs text-red-600 dark:text-red-400 mb-2 font-medium animate-pulse">{flashMsg}</div>
      )}

      {done && (
        <div className="text-center text-xs text-green-600 dark:text-green-400 mb-2 font-bold bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
          🎉 RREF achieved! x₁ = {fraction(matrix[0][3])}, x₂ = {fraction(matrix[1][3])}, x₃ = {fraction(matrix[2][3])}
        </div>
      )}

      {/* Op controls */}
      {step === 1 && (
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <div className="flex gap-2 mb-2">
            {['swap','scale','replace'].map(t => (
              <button key={t} onClick={() => setOpType(t)}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${opType === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
                {t === 'swap' ? 'Swap Rᵢ↔Rⱼ' : t === 'scale' ? 'Scale Rᵢ×k' : 'Replace Rᵢ+k·Rⱼ'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <label className="text-[10px] text-slate-500">Row i:</label>
            <select value={ri} onChange={e => setRi(+e.target.value)}
              className="text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-1 py-0.5">
              {[0,1,2].map(r => <option key={r} value={r}>R{r+1}</option>)}
            </select>
            {opType !== 'scale' && <>
              <label className="text-[10px] text-slate-500">Row j:</label>
              <select value={rj} onChange={e => setRj(+e.target.value)}
                className="text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-1 py-0.5">
                {[0,1,2].map(r => <option key={r} value={r}>R{r+1}</option>)}
              </select>
            </>}
            {opType !== 'swap' && <>
              <label className="text-[10px] text-slate-500">k =</label>
              <input type="number" value={k} step="0.5" onChange={e => setK(e.target.value)}
                className="w-16 text-center text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-0.5" />
            </>}
            <button onClick={applyOp}
              className="text-xs bg-emerald-600 text-white rounded px-3 py-1 hover:bg-emerald-700 ml-auto">
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={checkRREF}
          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-400 dark:border-emerald-600/50 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-400 transition-colors">
          Check RREF ✓
        </button>
        <button onClick={reset}
          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-red-400 dark:border-red-600/50 hover:text-red-500 transition-colors">
          Reset
        </button>
        {step !== 1 && <button onClick={() => setStep(1)}
          className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 transition-colors">
          Go to operations →
        </button>}
      </div>

      {/* Op history */}
      {history.length > 0 && (
        <div className="rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-2 mb-3 font-mono text-[9px] text-slate-500 dark:text-slate-400">
          <span className="text-slate-400">History: </span>{history.join(' → ')}
        </div>
      )}

      {/* Try prompts */}
      <div className="text-[9px] text-slate-400 dark:text-slate-500 italic mb-3 space-y-0.5">
        <div>Try: divide R1 by 2 (scale, k=0.5)</div>
        <div>Try: swap rows first to get a simpler pivot</div>
        <div>Check RREF when you think you're done!</div>
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
