import React, { useState } from 'react';

// Gaussian elimination on a 3x4 augmented matrix
// Returns array of {matrix, description, pivotRow, elimRow} snapshots

function cloneM(m) { return m.map(r => [...r]); }
function round6(x) { return Math.round(x * 1e6) / 1e6; }

function gaussianSteps(initial) {
  const steps = [{ matrix: cloneM(initial), desc: 'Starting augmented matrix [A | b]', pivotRow: -1, elimRow: -1 }];
  const m = cloneM(initial);
  const n = m.length;

  for (let col = 0; col < n; col++) {
    // find pivot
    let pivotRow = -1;
    for (let r = col; r < n; r++) {
      if (Math.abs(m[r][col]) > 1e-9) { pivotRow = r; break; }
    }
    if (pivotRow === -1) continue;

    // swap if needed
    if (pivotRow !== col) {
      [m[col], m[pivotRow]] = [m[pivotRow], m[col]];
      steps.push({
        matrix: cloneM(m),
        desc: `Swap row ${col + 1} ↔ row ${pivotRow + 1} to bring pivot to position`,
        pivotRow: col, elimRow: -1,
      });
    }

    // eliminate below
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) < 1e-9) continue;
      const factor = m[r][col] / m[col][col];
      for (let c = col; c <= n; c++) {
        m[r][c] = round6(m[r][c] - factor * m[col][c]);
      }
      steps.push({
        matrix: cloneM(m),
        desc: `R${r + 1} ← R${r + 1} − (${factor.toFixed(2)}) × R${col + 1}`,
        pivotRow: col, elimRow: r,
      });
    }
  }

  // back substitution display
  steps.push({ matrix: cloneM(m), desc: 'Row echelon form — now back-substitute to find x', pivotRow: -1, elimRow: -1 });

  // back sub
  for (let r = n - 1; r >= 0; r--) {
    if (Math.abs(m[r][r]) < 1e-9) continue;
    m[r][n] = round6(m[r][n] / m[r][r]);
    m[r][r] = 1;
    for (let above = r - 1; above >= 0; above--) {
      m[above][n] = round6(m[above][n] - m[above][r] * m[r][n]);
      m[above][r] = 0;
    }
    steps.push({
      matrix: cloneM(m),
      desc: `Back-substitute: x${r + 1} = ${m[r][n].toFixed(2)}`,
      pivotRow: r, elimRow: -1,
    });
  }

  return steps;
}

const PRESETS = [
  { label: 'Example 1', matrix: [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]] },
  { label: 'Example 2', matrix: [[1, 2, 1, 9], [2, 5, 3, 20], [3, 7, 4, 29]] },
  { label: 'Example 3', matrix: [[1, 0, 1, 2], [2, 1, 3, 5], [0, 1, 1, 2]] },
];

function MatrixDisplay({ matrix, pivotRow, elimRow }) {
  const n = matrix.length;
  const cols = matrix[0].length;
  const rowColors = matrix.map((_, i) => {
    if (i === pivotRow) return 'bg-blue-50 dark:bg-blue-950/40';
    if (i === elimRow) return 'bg-red-50 dark:bg-red-950/40';
    return '';
  });

  return (
    <div className="overflow-x-auto">
      <table className="mx-auto font-mono text-sm border-collapse">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i} className={rowColors[i]}>
              <td className="px-1 text-slate-400 text-xs pr-2">[</td>
              {row.map((val, j) => (
                <React.Fragment key={j}>
                  <td className={`px-2 py-1 text-center min-w-[42px] ${
                    i === pivotRow ? 'text-blue-700 dark:text-blue-300' :
                    i === elimRow ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'
                  } ${j === cols - 2 ? 'border-r-2 border-slate-300 dark:border-slate-600' : ''}`}>
                    {val === 0 ? '0' : Math.abs(val) < 0.001 ? val.toExponential(1) : Number.isInteger(val) ? val : val.toFixed(2)}
                  </td>
                </React.Fragment>
              ))}
              <td className="px-1 text-slate-400 text-xs pl-2">]</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GaussianEliminationStepper() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const steps = gaussianSteps(PRESETS[presetIdx].matrix);
  const cur = steps[stepIdx];

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Gaussian Elimination — Step by Step</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        Watch the augmented matrix transform row-by-row. <span className="text-blue-600 dark:text-blue-400">Blue = pivot row</span>, <span className="text-red-600 dark:text-red-400">Red = row being eliminated</span>.
      </p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPresetIdx(i); setStepIdx(0); }}
            className={`px-3 py-1 rounded text-xs ${i === presetIdx ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">
          Step {stepIdx + 1} of {steps.length}: <span className="font-semibold text-slate-700 dark:text-slate-200">{cur.desc}</span>
        </p>
        <MatrixDisplay matrix={cur.matrix} pivotRow={cur.pivotRow} elimRow={cur.elimRow} />
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}
          className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30">
          ← Prev
        </button>
        <button onClick={() => setStepIdx(Math.min(steps.length - 1, stepIdx + 1))} disabled={stepIdx === steps.length - 1}
          className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">
          Next →
        </button>
      </div>

      <div className="flex gap-1">
        {steps.map((_, i) => (
          <button key={i} onClick={() => setStepIdx(i)}
            className={`h-1.5 flex-1 rounded-full ${i === stepIdx ? 'bg-violet-500' : i < stepIdx ? 'bg-violet-300 dark:bg-violet-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>
    </div>
  );
}
