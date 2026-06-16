import React, { useState } from 'react';

// ─── math helpers ─────────────────────────────────────────────────────────────

function r4(x) { return Math.round(x * 1e4) / 1e4; }
function fmt(v) {
  if (v === 0) return '0';
  if (Math.abs(v) < 0.001) return v.toExponential(2);
  if (Number.isInteger(v)) return String(v);
  for (let d = 2; d <= 16; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-6) return `${n}/${d}`;
  }
  return v.toFixed(3);
}
function fmtDeg(r) { return (r * 180 / Math.PI).toFixed(1) + '°'; }
function norm(v) { return Math.sqrt(v.reduce((s, x) => s + x * x, 0)); }
function dot(a, b) { return r4(a.reduce((s, x, i) => s + x * b[i], 0)); }
function cross(a, b) {
  return [r4(a[1]*b[2]-a[2]*b[1]), r4(a[2]*b[0]-a[0]*b[2]), r4(a[0]*b[1]-a[1]*b[0])];
}
function normalize(v) { const n = norm(v); return n < 1e-9 ? v : v.map(x => r4(x / n)); }
function angle(a, b) {
  const d = dot(a, b);
  const n = norm(a) * norm(b);
  if (n < 1e-9) return 0;
  return Math.acos(Math.max(-1, Math.min(1, d / n)));
}

// ─── dot product steps ────────────────────────────────────────────────────────

function dotSteps(u, v) {
  const steps = [];
  steps.push({ desc: 'Write the dot product formula', detail: 'u · v = u₁v₁ + u₂v₂ + u₃v₃\n(multiply matching components, then sum)', highlight: -1 });
  const terms = u.map((ui, i) => ({ i, ui, vi: v[i], prod: r4(ui * v[i]) }));
  terms.forEach(t => {
    steps.push({ desc: `Component ${t.i + 1}: (${fmt(t.ui)})(${fmt(t.vi)}) = ${fmt(t.prod)}`, detail: `Multiply u${t.i + 1} × v${t.i + 1}`, highlight: t.i });
  });
  const total = r4(terms.reduce((s, t) => s + t.prod, 0));
  steps.push({ desc: `Sum = ${terms.map(t => fmt(t.prod)).join(' + ')} = ${fmt(total)}`, detail: `u · v = ${fmt(total)}`, highlight: -1, result: total });
  const normU = r4(norm(u)), normV = r4(norm(v));
  steps.push({ desc: `Compute magnitudes: ‖u‖ = ${fmt(normU)},  ‖v‖ = ${fmt(normV)}`, detail: `‖u‖ = √(${u.map(x => x*x).join('+')} ) = ${fmt(normU)}`, highlight: -1 });
  if (normU > 1e-9 && normV > 1e-9) {
    const cosT = r4(total / (normU * normV));
    const theta = angle(u, v);
    steps.push({ desc: `cos θ = ${fmt(total)} / (${fmt(normU)} × ${fmt(normV)}) = ${fmt(cosT)}`, detail: `θ = arccos(${fmt(cosT)}) = ${fmtDeg(theta)}`, highlight: -1, theta });
    steps.push({
      desc: Math.abs(total) < 1e-6 ? '✓ u · v = 0 → u and v are ORTHOGONAL (perpendicular)' : `θ = ${fmtDeg(theta)} — vectors are ${theta < Math.PI / 4 ? 'mostly aligned' : theta < Math.PI * 3 / 4 ? 'roughly perpendicular' : 'mostly opposite'}`,
      detail: 'The dot product sign tells you: positive=acute angle, zero=perpendicular, negative=obtuse angle',
      highlight: -1,
    });
  }
  return steps;
}

// ─── cross product steps ──────────────────────────────────────────────────────

function crossSteps(u, v) {
  const steps = [];
  steps.push({ desc: 'Set up the determinant expansion', detail: 'u × v = det [ e₁ e₂ e₃ ]\n               [ u₁ u₂ u₃ ]\n               [ v₁ v₂ v₃ ]', line: '' });
  const c1 = r4(u[1]*v[2]-u[2]*v[1]);
  const c2 = r4(-(u[0]*v[2]-u[2]*v[0]));
  const c3 = r4(u[0]*v[1]-u[1]*v[0]);
  steps.push({
    desc: `e₁ component: u₂v₃ − u₃v₂`,
    detail: `(${fmt(u[1])})(${fmt(v[2])}) − (${fmt(u[2])})(${fmt(v[1])}) = ${fmt(u[1]*v[2])} − ${fmt(u[2]*v[1])} = ${fmt(c1)}`,
    comp: 0, val: c1,
  });
  steps.push({
    desc: `e₂ component: −(u₁v₃ − u₃v₁)`,
    detail: `−((${fmt(u[0])})(${fmt(v[2])}) − (${fmt(u[2])})(${fmt(v[0])})) = −(${fmt(r4(u[0]*v[2]))} − ${fmt(r4(u[2]*v[0]))}) = ${fmt(c2)}`,
    comp: 1, val: c2,
  });
  steps.push({
    desc: `e₃ component: u₁v₂ − u₂v₁`,
    detail: `(${fmt(u[0])})(${fmt(v[1])}) − (${fmt(u[1])})(${fmt(v[0])}) = ${fmt(r4(u[0]*v[1]))} − ${fmt(r4(u[1]*v[0]))} = ${fmt(c3)}`,
    comp: 2, val: c3,
  });
  const result = [c1, c2, c3];
  steps.push({ desc: `u × v = [${fmt(c1)}, ${fmt(c2)}, ${fmt(c3)}]ᵀ`, detail: 'Result is a VECTOR perpendicular to both u and v.', result });
  const area = r4(norm(result));
  steps.push({ desc: `‖u × v‖ = ${fmt(area)} = area of parallelogram spanned by u and v`, detail: `‖u × v‖ = ‖u‖‖v‖sin θ. This equals the area of the parallelogram formed by u and v as adjacent sides.`, area });
  // verify perpendicularity
  const dp1 = dot(u, result), dp2 = dot(v, result);
  steps.push({ desc: `Verify: u·(u×v) = ${fmt(dp1)},  v·(u×v) = ${fmt(dp2)}`, detail: dp1 === 0 && dp2 === 0 ? '✓ Both zero — result is perpendicular to both inputs, as expected.' : 'Check arithmetic — should be zero.', verify: true });
  return steps;
}

// ─── presets ──────────────────────────────────────────────────────────────────

const DOT_PRESETS = [
  { label: 'General', u: [3, 1, 2], v: [2, -4, 1], context: 'Standard 3D example. Compute the dot product and find the angle.' },
  { label: 'Orthogonal', u: [1, 2, -1], v: [3, 0, 3], context: 'These are perpendicular. Watch the dot product hit exactly zero.' },
  { label: 'Parallel', u: [1, 2, 3], v: [2, 4, 6], context: 'v = 2u. Angle should be 0° and dot product = ‖u‖·‖v‖.' },
  { label: 'CAM normal', u: [0, 1, 1], v: [0, 1, 0], context: 'Surface normal [0,1,1] vs tool axis [0,1,0]. The angle determines cutting contact — must stay within 30° for a ballnose mill.' },
];

const CROSS_PRESETS = [
  { label: 'General', u: [1, 2, 3], v: [4, 5, 6], context: 'Standard 3D example. Verify the result is perpendicular to both.' },
  { label: 'Unit vectors', u: [1, 0, 0], v: [0, 1, 0], context: 'e₁ × e₂ = e₃. The fundamental right-hand rule identity.' },
  { label: 'Parallel', u: [1, 2, 0], v: [2, 4, 0], context: 'Parallel vectors → cross product = 0. Parallelogram area collapses.' },
  { label: 'Torque', u: [0.3, 0, 0], v: [0, 50, 0], context: 'Torque τ = r × F. Radius arm r along x, force F along y. Result is the torque vector along z.' },
];

// ─── practice ─────────────────────────────────────────────────────────────────

const PRACTICE = [
  {
    context: 'Dot product', q: 'Compute u · v, ‖u‖, ‖v‖, the angle between them, and state whether they are orthogonal.',
    data: 'u = [2, −1, 3]ᵀ    v = [1, 4, 1]ᵀ',
    hint: 'Dot product = sum of products of matching components. Angle = arccos(u·v / (‖u‖‖v‖)).',
    answer: `u · v = (2)(1) + (−1)(4) + (3)(1) = 2 − 4 + 3 = 1

‖u‖ = √(4 + 1 + 9) = √14 ≈ 3.742
‖v‖ = √(1 + 16 + 1) = √18 = 3√2 ≈ 4.243

cos θ = 1 / (√14 · √18) = 1 / √252 ≈ 0.06299

θ = arccos(0.06299) ≈ 86.4°

Not orthogonal (dot product = 1, not 0), but nearly perpendicular.`,
  },
  {
    context: 'Cross product', q: 'Compute u × v. Verify the result is perpendicular to both u and v.',
    data: 'u = [2, 0, 1]ᵀ    v = [1, 3, 0]ᵀ',
    hint: 'c₁ = u₂v₃−u₃v₂, c₂ = −(u₁v₃−u₃v₁), c₃ = u₁v₂−u₂v₁. Then check u·(u×v)=0.',
    answer: `c₁ = u₂v₃ − u₃v₂ = (0)(0) − (1)(3) = −3
c₂ = −(u₁v₃ − u₃v₁) = −((2)(0) − (1)(1)) = −(−1) = 1
c₃ = u₁v₂ − u₂v₁ = (2)(3) − (0)(1) = 6

u × v = [−3, 1, 6]ᵀ

Verify perpendicular to u:
u · (u×v) = (2)(−3) + (0)(1) + (1)(6) = −6 + 0 + 6 = 0 ✓

Verify perpendicular to v:
v · (u×v) = (1)(−3) + (3)(1) + (0)(6) = −3 + 3 + 0 = 0 ✓

Area of parallelogram = ‖u×v‖ = √(9+1+36) = √46 ≈ 6.78`,
  },
  {
    context: 'Real world — structural', q: 'A bolt is pulled by F₁ = [3, 4, 0]ᵀ kN and F₂ = [−1, 2, 1]ᵀ kN. Find the resultant force, its magnitude, and unit vector.',
    hint: 'Add component-by-component. Magnitude = √(sum of squares). Unit vector = v / ‖v‖.',
    answer: `Resultant = F₁ + F₂ = [3+(−1), 4+2, 0+1] = [2, 6, 1]ᵀ kN

‖R‖ = √(4 + 36 + 1) = √41 ≈ 6.403 kN

Unit vector R̂ = [2, 6, 1] / √41
             = [2/√41, 6/√41, 1/√41]
             ≈ [0.312, 0.937, 0.156]

Check: ‖R̂‖ = √(0.312²+0.937²+0.156²) ≈ √(0.097+0.878+0.024) = √1.0 ✓`,
  },
  {
    context: 'CAM — tool angle check', q: 'Surface normal is n = [1, 1, 2]ᵀ (not normalized). Tool axis is t = [0, 0, 1]ᵀ. Find the angle between them. Is this within the 30° limit for a ballnose mill?',
    hint: 'Normalize n first. Then use cos θ = n̂ · t (since t is already a unit vector).',
    answer: `n = [1, 1, 2]ᵀ
‖n‖ = √(1 + 1 + 4) = √6

n̂ = [1/√6, 1/√6, 2/√6]

t = [0, 0, 1]ᵀ  (already unit vector)

n̂ · t = (1/√6)(0) + (1/√6)(0) + (2/√6)(1) = 2/√6 ≈ 0.8165

θ = arccos(0.8165) ≈ 35.3°

35.3° > 30° → OUTSIDE the safe cutting angle limit.
The CAM software would flag this toolpath and either tilt
the 5-axis tool or slow the feed rate.`,
  },
  {
    context: 'Torque', q: 'A wrench applies force F = [0, 0, −80]ᵀ N at position r = [0.25, 0, 0]ᵀ m. Compute the torque τ = r × F and its magnitude.',
    hint: 'Torque is a cross product. Use the determinant formula. The result is a vector.',
    answer: `r = [0.25, 0, 0]ᵀ    F = [0, 0, −80]ᵀ

τ = r × F:
τ₁ = r₂F₃ − r₃F₂ = (0)(−80) − (0)(0) = 0
τ₂ = −(r₁F₃ − r₃F₁) = −((0.25)(−80) − (0)(0)) = −(−20) = 20
τ₃ = r₁F₂ − r₂F₁ = (0.25)(0) − (0)(0) = 0

τ = [0, 20, 0]ᵀ N·m

‖τ‖ = 20 N·m  (torque is along the y-axis — rotation about y)

Intuition: force is downward (−z), lever arm is along x.
Cross product of x × (−z) points in y direction. ✓`,
  },
];

// ─── sub-components ──────────────────────────────────────────────────────────

function VecDisplay({ v, label, color = 'text-blue-600 dark:text-blue-400' }) {
  return (
    <span className="font-mono text-sm">
      <span className={`font-semibold ${color}`}>{label}</span>
      {' = ['}
      {v.map((x, i) => <span key={i}>{i > 0 ? ', ' : ''}{fmt(x)}</span>)}
      {']ᵀ'}
    </span>
  );
}

function ProgressDots({ total, current, onJump }) {
  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => onJump(i)}
          className={`h-1.5 flex-1 rounded-full transition-colors ${i === current ? 'bg-violet-500' : i < current ? 'bg-violet-300 dark:bg-violet-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
      ))}
    </div>
  );
}

function PracticeCard({ item, index }) {
  const [shown, setShown] = useState(false);
  const [hint, setHint] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">{item.context}</span>
        <span className="text-xs text-slate-400">Problem {index + 1}</span>
      </div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">{item.q}</p>
      {item.data && <pre className="text-xs font-mono bg-slate-50 dark:bg-slate-900 rounded p-2 mb-3 text-slate-700 dark:text-slate-300">{item.data}</pre>}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setHint(h => !h)} className="text-xs px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">{hint ? 'Hide hint' : 'Hint'}</button>
        <button onClick={() => setShown(s => !s)} className="text-xs px-3 py-1.5 rounded border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40">{shown ? 'Hide answer' : 'Show answer'}</button>
      </div>
      {hint && <p className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded p-2">💡 {item.hint}</p>}
      {shown && <pre className="mt-3 text-xs font-mono bg-slate-50 dark:bg-slate-900 rounded p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">{item.answer}</pre>}
    </div>
  );
}

// ─── steppers ─────────────────────────────────────────────────────────────────

function DotStepper() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const preset = DOT_PRESETS[pi];
  const steps = dotSteps(preset.u, preset.v);
  const cur = steps[si];
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {DOT_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>{p.label}</button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>
      <div className="flex gap-4 text-sm flex-wrap">
        <VecDisplay v={preset.u} label="u" color="text-blue-600 dark:text-blue-400" />
        <VecDisplay v={preset.v} label="v" color="text-violet-600 dark:text-violet-400" />
      </div>
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[100px]">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{cur.desc}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap">{cur.detail}</p>
        {cur.highlight !== undefined && cur.highlight >= 0 && (
          <div className="mt-2 flex gap-2">
            {preset.u.map((x, i) => (
              <span key={i} className={`px-2 py-1 rounded font-mono text-xs ${i === cur.highlight ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
                {fmt(x)}×{fmt(preset.v[i])}
              </span>
            ))}
          </div>
        )}
        {'result' in cur && (
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-400">u · v = {fmt(cur.result)}</span>
            {Math.abs(cur.result) < 1e-6 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">orthogonal!</span>}
          </div>
        )}
        {'theta' in cur && (
          <div className="mt-2 font-mono text-sm font-semibold text-violet-700 dark:text-violet-400">θ = {fmtDeg(cur.theta)}</div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0} className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300">← Prev</button>
        <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1} className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
      <ProgressDots total={steps.length} current={si} onJump={setSi} />
    </div>
  );
}

function CrossStepper() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const preset = CROSS_PRESETS[pi];
  const steps = crossSteps(preset.u, preset.v);
  const cur = steps[si];
  const COMPS = ['e₁ (x)', 'e₂ (y)', 'e₃ (z)'];
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {CROSS_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>{p.label}</button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>
      <div className="flex gap-4 text-sm flex-wrap">
        <VecDisplay v={preset.u} label="u" color="text-blue-600 dark:text-blue-400" />
        <VecDisplay v={preset.v} label="v" color="text-violet-600 dark:text-violet-400" />
      </div>
      {/* determinant layout */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 font-mono text-xs overflow-x-auto">
        <table className="mx-auto border-collapse">
          <thead>
            <tr>{['e₁', 'e₂', 'e₃'].map(h => <th key={h} className="px-3 py-1 text-teal-600 dark:text-teal-400">{h}</th>)}</tr>
          </thead>
          <tbody>
            {[preset.u, preset.v].map((row, ri) => (
              <tr key={ri}>
                {row.map((v, ci) => (
                  <td key={ci} className={`px-3 py-1 text-center border border-slate-200 dark:border-slate-700 ${cur.comp === ci ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[90px]">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{cur.desc}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap">{cur.detail}</p>
        {'result' in cur && (
          <div className="mt-2 font-mono text-sm font-semibold text-green-700 dark:text-green-400">
            u × v = [{cur.result.map(fmt).join(', ')}]ᵀ
          </div>
        )}
        {'area' in cur && (
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Parallelogram area = {fmt(cur.area)} sq units</div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0} className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300">← Prev</button>
        <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1} className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
      <ProgressDots total={steps.length} current={si} onJump={setSi} />
    </div>
  );
}

function ConceptPane() {
  return (
    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">Why this exists</p>
        <p>Vectors are how you represent anything that has both magnitude and direction — forces, velocities, surface normals, displacements. The dot product measures alignment (and is used for angle calculations, shadow rendering, and cutting tool checks). The cross product produces a perpendicular vector (used for torque, surface normals, and volume calculations).</p>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">What a vector is</p>
        <p>An ordered list of numbers — a column matrix with a direction. Different from a scalar (single number) in that it points somewhere. Magnitude + direction.</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 mt-2 space-y-1">
          <div>v = [v₁, v₂, v₃]ᵀ  ∈ ℝ³</div>
          <div className="text-slate-400">‖v‖ = √(v₁² + v₂² + v₃²)  — magnitude (length)</div>
          <div className="text-slate-400">v̂ = v / ‖v‖  — unit vector (length 1, same direction)</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Dot product</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 mt-1 space-y-1">
          <div>u · v = u₁v₁ + u₂v₂ + u₃v₃  (a SCALAR)</div>
          <div>u · v = ‖u‖ ‖v‖ cos θ</div>
          <div className="text-slate-400">→ cos θ = (u·v) / (‖u‖‖v‖)</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
          {[
            { label: 'u·v > 0', color: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400', desc: 'Acute angle (< 90°)' },
            { label: 'u·v = 0', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400', desc: 'Orthogonal (90°) — perpendicular' },
            { label: 'u·v < 0', color: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400', desc: 'Obtuse angle (> 90°)' },
          ].map(c => <div key={c.label} className={`rounded p-2 ${c.color}`}><p className="font-semibold mb-0.5">{c.label}</p><p>{c.desc}</p></div>)}
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Cross product (3D only)</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 mt-1 space-y-1">
          <div>u × v = [u₂v₃−u₃v₂,  −(u₁v₃−u₃v₁),  u₁v₂−u₂v₁]ᵀ  (a VECTOR)</div>
          <div>‖u × v‖ = ‖u‖ ‖v‖ sin θ = area of parallelogram</div>
          <div className="text-slate-400">u × v is perpendicular to BOTH u and v</div>
          <div className="text-red-500 dark:text-red-400">u × v = −(v × u)  — anti-commutative!</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Real-world use summary</p>
        <div className="space-y-1 text-xs">
          {[
            { op: 'Dot product', uses: 'Angle between vectors, checking orthogonality, surface brightness in rendering (n̂·L̂), work done by a force (F·d), projection of one vector onto another' },
            { op: 'Cross product', uses: 'Torque (r×F), surface normals in 3D graphics, angular momentum, area of parallelogram, testing if vectors are parallel' },
            { op: 'Magnitude', uses: 'Distance between points, normalizing to unit vectors, force magnitude, speed from velocity vector' },
          ].map(r => (
            <div key={r.op} className="flex gap-2 bg-slate-50 dark:bg-slate-900 rounded p-2">
              <span className="text-violet-500 font-semibold w-28 shrink-0">{r.op}</span>
              <span>{r.uses}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RealWorldPane() {
  return (
    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">CAM toolpath: dot product determines cutting angle</p>
        <p>In 5-axis CAM, the contact angle between the tool axis and the surface normal is computed as arccos(n̂ · t̂) using the dot product. The CAM software checks this at every point along the toolpath. If the angle exceeds a threshold, it either tilts the tool (5-axis motion) or flags the toolpath for review.</p>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Step-by-step surface normal check</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-1">
          <div className="text-slate-400 mb-1">Given: surface normal n = [0, 1, 1] (not normalized), tool axis t = [0, 0, 1]</div>
          <div>‖n‖ = √(0+1+1) = √2</div>
          <div>n̂ = [0, 1/√2, 1/√2] ≈ [0, 0.707, 0.707]</div>
          <div>t already unit vector: t = [0, 0, 1]</div>
          <div className="text-blue-600 dark:text-blue-400">n̂ · t = 0(0) + 0.707(0) + 0.707(1) = 0.707</div>
          <div className="text-violet-600 dark:text-violet-400">θ = arccos(0.707) = 45°</div>
          <div className="text-red-500 dark:text-red-400">45° &gt; 30° limit → CAM flags this point</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Surface rendering (Phong shading model)</p>
        <p className="mb-2">Every pixel's brightness in 3D rendering is computed using the dot product of the surface normal with the light direction:</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-1">
          <div>diffuse = max(0,  n̂ · L̂)</div>
          <div className="text-slate-400">n̂ = unit surface normal at pixel</div>
          <div className="text-slate-400">L̂ = unit vector from surface toward light</div>
          <div>dot product = 1 → facing light directly → full brightness</div>
          <div>dot product = 0 → perpendicular to light → at terminator</div>
          <div>dot product &lt; 0 → facing away from light → in shadow (clamped to 0)</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Torque: cross product in mechanical design</p>
        <p className="mb-2">Torque τ = r × F, where r is the position vector from the pivot to the point of force application, and F is the force vector. The magnitude ‖τ‖ = ‖r‖‖F‖sin θ is why force applied perpendicular to the lever arm gives maximum torque.</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-1">
          <div className="text-slate-400 mb-1">Wrench example: r = [0.3, 0, 0] m,  F = [0, −50, 0] N</div>
          <div>τ = r × F</div>
          <div>τ₁ = (0)(0) − (0)(−50) = 0</div>
          <div>τ₂ = −((0.3)(0) − (0)(0)) = 0</div>
          <div>τ₃ = (0.3)(−50) − (0)(0) = −15</div>
          <div className="text-green-600 dark:text-green-400">τ = [0, 0, −15] N·m  → 15 N·m rotation about −z axis</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">MATLAB reference</p>
        <pre className="text-xs font-mono bg-slate-900 text-slate-300 rounded p-3 overflow-x-auto">{`u = [3; 1; 2];
v = [2; -4; 1];

% Dot product
d = dot(u, v)           % or: u' * v

% Magnitudes
nu = norm(u)
nv = norm(v)

% Angle
theta = acos(dot(u,v) / (norm(u)*norm(v)));
theta_deg = rad2deg(theta)

% Unit vectors
u_hat = u / norm(u)

% Cross product (3D only)
w = cross(u, v)

% Verify perpendicularity
dot(u, w)               % should be ~0
dot(v, w)               % should be ~0

% Area of parallelogram
area = norm(cross(u, v))`}</pre>
      </div>
    </div>
  );
}

const TABS = ['Concept', 'Dot product', 'Cross product', 'Real world', 'Practice'];

export default function VectorsModule() {
  const [tab, setTab] = useState(0);
  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Module 3 — Vectors, Dot &amp; Cross Products</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Concept · Dot stepper · Cross stepper · Real world · Practice</p>
      </div>
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 overflow-x-auto">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors min-w-[64px]
              ${tab === i ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 0 && <ConceptPane />}
      {tab === 1 && <DotStepper />}
      {tab === 2 && <CrossStepper />}
      {tab === 3 && <RealWorldPane />}
      {tab === 4 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">Work each problem by hand before revealing.</p>
          {PRACTICE.map((item, i) => <PracticeCard key={i} item={item} index={i} />)}
        </div>
      )}
    </div>
  );
}
