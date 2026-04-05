import React, { useState, useMemo } from 'react';

// Demonstrate low-rank approximation with a synthetic "image" (8x8 matrix)
// We generate a rank-4 matrix as a sum of outer products, then show truncated SVD

const M = 8; // matrix size

function outerProduct(u, v) {
  const result = Array(M).fill(0).map(() => Array(M).fill(0));
  for (let i = 0; i < M; i++)
    for (let j = 0; j < M; j++)
      result[i][j] = u[i] * v[j];
  return result;
}

function addMats(A, B, scale = 1) {
  return A.map((row, i) => row.map((val, j) => val + scale * B[i][j]));
}

// Build a synthetic 8x8 matrix with 4 rank-1 components
function buildMatrix() {
  // Component 1: horizontal gradient (σ ≈ 8)
  const u1 = Array.from({ length: M }, (_, i) => Math.sin(Math.PI * i / (M - 1)));
  const v1 = Array.from({ length: M }, (_, j) => Math.cos(Math.PI * j / (M - 1)));

  // Component 2: vertical gradient (σ ≈ 5)
  const u2 = Array.from({ length: M }, (_, i) => Math.cos(2 * Math.PI * i / (M - 1)));
  const v2 = Array.from({ length: M }, (_, j) => Math.sin(2 * Math.PI * j / (M - 1)));

  // Component 3: diagonal (σ ≈ 3)
  const u3 = Array.from({ length: M }, (_, i) => i < M / 2 ? 1 : -1);
  const v3 = Array.from({ length: M }, (_, j) => j % 2 === 0 ? 0.8 : -0.8);

  // Component 4: noise-like (σ ≈ 1)
  const u4 = Array.from({ length: M }, (_, i) => Math.sin(3 * Math.PI * i / (M - 1)));
  const v4 = Array.from({ length: M }, (_, j) => Math.cos(5 * Math.PI * j / (M - 1)));

  const sigmas = [8, 5, 3, 1.2];
  const us = [u1, u2, u3, u4];
  const vs = [v1, v2, v3, v4];

  let mat = Array(M).fill(0).map(() => Array(M).fill(0));
  for (let k = 0; k < 4; k++) {
    const op = outerProduct(us[k], vs[k]);
    mat = addMats(mat, op, sigmas[k]);
  }
  return { mat, sigmas, us, vs, rank: 4 };
}

const { mat, sigmas, us, vs, rank } = buildMatrix();

// Compute rank-k approximation
function lowRankApprox(k) {
  let approx = Array(M).fill(0).map(() => Array(M).fill(0));
  for (let r = 0; r < k; r++) {
    const op = outerProduct(us[r], vs[r]);
    approx = addMats(approx, op, sigmas[r]);
  }
  return approx;
}

// Get min/max of full matrix for color scale
const allVals = mat.flat();
const vMin = Math.min(...allVals), vMax = Math.max(...allVals);

function valToColor(v) {
  const t = (v - vMin) / (vMax - vMin + 1e-10);
  const r = Math.round(255 * (1 - t));
  const b = Math.round(255 * t);
  const g = Math.round(80 * Math.sin(Math.PI * t));
  return `rgb(${r},${g},${b})`;
}

const CELL = 28;

function MatrixHeatmap({ data, label }) {
  return (
    <div>
      <p className="text-xs text-center text-slate-500 mb-1">{label}</p>
      <svg width={M * CELL} height={M * CELL} className="rounded border border-slate-200 dark:border-slate-700">
        {data.map((row, i) =>
          row.map((val, j) => (
            <rect key={`${i},${j}`} x={j * CELL} y={i * CELL} width={CELL} height={CELL}
              fill={valToColor(val)} />
          ))
        )}
      </svg>
    </div>
  );
}

// Frobenius norm (error)
function frobNorm(A, B) {
  let sum = 0;
  for (let i = 0; i < M; i++)
    for (let j = 0; j < M; j++)
      sum += (A[i][j] - B[i][j]) ** 2;
  return Math.sqrt(sum);
}

const fullNorm = frobNorm(mat, Array(M).fill(0).map(() => Array(M).fill(0)));

export default function LowRankApproximationViz() {
  const [k, setK] = useState(1);

  const approx = useMemo(() => lowRankApprox(k), [k]);
  const error = frobNorm(mat, approx);
  const captured = ((1 - error / fullNorm) * 100).toFixed(1);
  const compressionRatio = (k * 2 * M / (M * M) * 100).toFixed(1);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Low-Rank Approximation via SVD</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        The rank-k approximation keeps only the k largest singular values. Each adds one "layer" of structure. Drag the slider to see how much information each singular value carries.
      </p>

      <div className="flex items-center gap-3 mb-4 px-1">
        <span className="text-sm font-mono w-8 text-violet-600">k =</span>
        <input type="range" min="1" max={rank} step="1" value={k}
          onChange={e => setK(parseInt(e.target.value))} className="flex-1 accent-violet-500" />
        <span className="text-sm font-mono w-6 text-right font-bold text-violet-600">{k}</span>
      </div>

      <div className="flex gap-4 justify-center mb-4">
        <MatrixHeatmap data={mat} label={`Original (rank ${rank})`} />
        <MatrixHeatmap data={approx} label={`Rank-${k} approximation`} />
      </div>

      {/* Singular value bar chart */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2">Singular values (importance of each component):</p>
        <div className="flex gap-1 items-end h-12">
          {sigmas.map((s, i) => {
            const h = (s / sigmas[0]) * 44;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div style={{ height: h }}
                  className={`w-full rounded-sm transition-colors ${i < k ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                <span className="text-xs font-mono text-slate-500">{s}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>σ₁ (most important)</span><span>σ₄ (least)</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2">
          <p className="text-xs text-violet-600 font-semibold">Rank used</p>
          <p className="font-mono font-bold">{k} / {rank}</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2">
          <p className="text-xs text-emerald-600 font-semibold">Captured</p>
          <p className="font-mono font-bold">{captured}%</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2">
          <p className="text-xs text-amber-600 font-semibold">Storage</p>
          <p className="font-mono font-bold">{compressionRatio}%</p>
        </div>
      </div>

      {k === rank && (
        <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300 text-center">
          Full rank — perfect reconstruction. Real images need far fewer components to look good.
        </div>
      )}
    </div>
  );
}
