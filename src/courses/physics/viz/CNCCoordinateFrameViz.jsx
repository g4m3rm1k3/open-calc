import { useState, useRef, useEffect, useCallback } from "react";

const STEPS = [
  {
    title: "Why coordinate frames?",
    subtitle: "Three worlds, one machine",
    narration:
      "Every CNC machine juggles three coordinate systems simultaneously. G-code runs in Machine coordinates, your CAD design lives in Workpiece coordinates, and the fixture clamps down in a third frame. The machine must translate between all three — and it does so using homogeneous transformation matrices. Without them, the tool would crash the part.",
  },
  {
    title: "Frame 1: Fixture offset",
    subtitle: "Translation matrix T",
    narration:
      "The fixture sits somewhere on the machine table. We describe its position with a translation vector (tx, ty). In homogeneous coordinates, a translation becomes a 3×3 matrix — so translations and rotations can both be matrix multiplications.",
  },
  {
    title: "Frame 2: Fixture rotation",
    subtitle: "Rotation matrix R, composed transform M = R·T",
    narration:
      "The fixture may be rotated on the table. We add an angle θ. The rotation matrix R rotates the fixture frame. The composed matrix M = R·T first translates, then rotates — giving the full pose of the fixture frame in machine coordinates.",
  },
  {
    title: "Compose the frames",
    subtitle: "p_machine = M · p_fixture",
    narration:
      "With M in hand, we can convert any point from fixture coordinates to machine coordinates. This is exactly what CNC work offsets do — G54 through G59 each store a transformation matrix. When you zero the part, you're setting the matrix entries. Try sliding the fixture point and watch where the tool tip lands on the machine.",
  },
];

const PRESETS = [
  { label: "G54 Home", tx: 0, ty: 0, theta: 0 },
  { label: "45° Fixture", tx: 50, ty: 30, theta: 45 },
  { label: "90° Rotation", tx: -40, ty: 60, theta: 90 },
  { label: "Mirrored", tx: 80, ty: -20, theta: 180 },
];

function matMul3(A, B) {
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++) C[i][j] += A[i][k] * B[k][j];
  return C;
}

function getT(tx, ty) {
  return [[1, 0, tx], [0, 1, ty], [0, 0, 1]];
}

function getR(deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r), s = Math.sin(r);
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}

function matVec3(M, v) {
  return [
    M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
    M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
    M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
  ];
}

function MatrixDisplay({ M, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {label && <span className="text-[10px] font-semibold text-violet-500 mb-0.5">{label}</span>}
      <div className="inline-flex gap-0.5 items-center">
        <span className="text-slate-400 text-lg leading-none">⎡</span>
        <div className="flex flex-col gap-0.5">
          {M.map((row, i) => (
            <div key={i} className="flex gap-1">
              {row.map((val, j) => (
                <span key={j} className="text-[11px] font-mono w-12 text-center text-slate-700 dark:text-slate-200">
                  {val.toFixed(2)}
                </span>
              ))}
            </div>
          ))}
        </div>
        <span className="text-slate-400 text-lg leading-none">⎦</span>
      </div>
    </div>
  );
}

export default function CNCCoordinateFrameViz() {
  const [step, setStep] = useState(0);
  const [tx, setTx] = useState(50);
  const [ty, setTy] = useState(30);
  const [theta, setTheta] = useState(30);
  const [fpx, setFpx] = useState(40);
  const [fpy, setFpy] = useState(20);
  const svgRef = useRef(null);

  const W = 360, H = 300;
  const cx = W / 2, cy = H / 2;
  const SCALE = 1.4;

  const T = getT(tx * SCALE, -ty * SCALE);
  const R = getR(theta);
  const M = matMul3(R, T);

  const machinePoint = matVec3(M, [fpx * SCALE, -fpy * SCALE, 1]);
  const mpx = cx + machinePoint[0];
  const mpy = cy + machinePoint[1];

  function drawAxes(svg, ox, oy, rot, color, label, len = 55) {
    const r = (rot * Math.PI) / 180;
    const cos = Math.cos(r), sin = Math.sin(r);
    const ex = ox + len * cos, ey = oy + len * (-sin);
    const ey2 = oy + len * cos, ex2 = ox + len * sin;
    return (
      <g>
        <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={color} strokeWidth="2" markerEnd="url(#arr)" />
        <line x1={ox} y1={oy} x2={ex2} y2={ey2} stroke={color} strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arr2)" />
        <circle cx={ox} cy={oy} r={5} fill={color} opacity={0.8} />
        <text x={ox - 8} y={oy + 14} fontSize="10" fill={color} fontWeight="bold">{label}</text>
      </g>
    );
  }

  const fixOx = cx + M[0][2];
  const fixOy = cy + M[1][2];

  const partPts = [
    [-15, -10], [15, -10], [15, 10], [-15, 10]
  ].map(([px, py]) => {
    const v = matVec3(M, [px * SCALE, py * SCALE, 1]);
    return [cx + v[0], cy + v[1]];
  });

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg max-w-[400px] font-sans">
      {/* Step dots */}
      <div className="flex items-center gap-2 justify-center">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === step ? "bg-violet-500 scale-125" : "bg-slate-300 dark:bg-slate-600"}`}
          />
        ))}
        <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500">{step + 1}/{STEPS.length}</span>
      </div>

      {/* Narration */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
        <div className="text-[13px] font-bold text-violet-600 dark:text-violet-400 mb-0.5">{STEPS[step].title}</div>
        <div className="text-[10px] text-violet-400 dark:text-violet-500 mb-1.5 font-medium">{STEPS[step].subtitle}</div>
        <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{STEPS[step].narration}</div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => { setTx(p.tx); setTy(p.ty); setTheta(p.theta); }}
            className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} width={W} height={H} className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden" style={{ maxWidth: "100%" }}>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
          </marker>
          <marker id="arr2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#888" />
          </marker>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Machine frame — gray */}
        <line x1={cx} y1={cy} x2={cx + 60} y2={cy} stroke="#94a3b8" strokeWidth="2.5" markerEnd="url(#arr)" />
        <line x1={cx} y1={cy} x2={cx} y2={cy - 60} stroke="#94a3b8" strokeWidth="2.5" markerEnd="url(#arr)" />
        <circle cx={cx} cy={cy} r={5} fill="#94a3b8" />
        <text x={cx - 24} y={cy + 14} fontSize="10" fill="#94a3b8" fontWeight="bold">Machine</text>
        <text x={cx + 63} y={cy + 4} fontSize="9" fill="#94a3b8">X</text>
        <text x={cx + 3} y={cy - 63} fontSize="9" fill="#94a3b8">Y</text>

        {/* Part outline (in machine coords) */}
        <polygon
          points={partPts.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="#818cf8"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.6"
        />

        {/* Fixture frame — blue */}
        {(step >= 1) && (() => {
          const r = (theta * Math.PI) / 180;
          const cos = Math.cos(r), sin = Math.sin(r);
          const len = 50;
          const x1e = fixOx + len * cos, y1e = fixOy - len * sin;
          const x2e = fixOx + len * sin, y2e = fixOy + len * cos;
          return (
            <g>
              <line x1={fixOx} y1={fixOy} x2={x1e} y2={y1e} stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arr)" />
              <line x1={fixOx} y1={fixOy} x2={x2e} y2={y2e} stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx={fixOx} cy={fixOy} r={5} fill="#60a5fa" />
              <text x={fixOx - 10} y={fixOy + 14} fontSize="10" fill="#60a5fa" fontWeight="bold">Fixture</text>
            </g>
          );
        })()}

        {/* Tool point (step 3) */}
        {step === 3 && (
          <>
            <circle cx={cx + fpx * SCALE} cy={cy - fpy * SCALE} r={5} fill="#fb923c" opacity={0.7} />
            <text x={cx + fpx * SCALE + 7} y={cy - fpy * SCALE} fontSize="9" fill="#fb923c">Fixture pt</text>
            <circle cx={mpx} cy={mpy} r={6} fill="#f43f5e" />
            <line x1={cx + fpx * SCALE} y1={cy - fpy * SCALE} x2={mpx} y2={mpy} stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 2" />
            <text x={mpx + 7} y={mpy} fontSize="9" fill="#f43f5e">Machine pt</text>
          </>
        )}
      </svg>

      {/* Controls */}
      {step === 1 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-16 text-slate-500 dark:text-slate-400">tx: {tx}mm</span>
            <input type="range" min={-100} max={100} value={tx} onChange={e => setTx(Number(e.target.value))} className="flex-1 accent-violet-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-16 text-slate-500 dark:text-slate-400">ty: {ty}mm</span>
            <input type="range" min={-100} max={100} value={ty} onChange={e => setTy(Number(e.target.value))} className="flex-1 accent-violet-500" />
          </div>
          <MatrixDisplay M={getT(tx, ty)} label="T (translation)" />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-20 text-slate-500 dark:text-slate-400">θ: {theta}°</span>
            <input type="range" min={-180} max={180} value={theta} onChange={e => setTheta(Number(e.target.value))} className="flex-1 accent-violet-500" />
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <MatrixDisplay M={getR(theta)} label="R (rotation)" />
            <div className="flex items-center text-violet-400 font-bold">·</div>
            <MatrixDisplay M={getT(tx, ty)} label="T" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-20 text-slate-500 dark:text-slate-400">fp_x: {fpx}mm</span>
            <input type="range" min={-60} max={60} value={fpx} onChange={e => setFpx(Number(e.target.value))} className="flex-1 accent-orange-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-20 text-slate-500 dark:text-slate-400">fp_y: {fpy}mm</span>
            <input type="range" min={-60} max={60} value={fpy} onChange={e => setFpy(Number(e.target.value))} className="flex-1 accent-orange-500" />
          </div>
          <MatrixDisplay M={M} label="M = R·T" />
          <div className="text-[10px] font-mono text-center text-rose-400 dark:text-rose-300">
            p_machine = [{(machinePoint[0] / SCALE).toFixed(1)}, {(-machinePoint[1] / SCALE).toFixed(1)}] mm
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 text-center italic">CNC work offsets G54–G59 each store one such matrix</div>
        </div>
      )}

      {/* Try prompts */}
      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-2 border border-violet-100 dark:border-violet-800">
        <div className="text-[9px] font-semibold text-violet-500 mb-1">💡 Try it</div>
        {step === 0 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Observe the three nested frames: gray = Machine, blue = Fixture, orange = Tool.</p>}
        {step === 1 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Try tx=50, ty=30 — the part moves in machine coordinates. The matrix column [tx,ty,1]ᵀ encodes the origin offset.</p>}
        {step === 2 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Try rotating 45° — how do the axes change? M = R₂·R₁·T for two sequential rotations.</p>}
        {step === 3 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Try: slide the fixture point around and see how the machine coordinate changes with M. Note how the offset and angle both affect the result.</p>}
      </div>

      {/* Nav */}
      <div className="flex justify-between items-center pt-1">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-[11px] px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >← Prev</button>
        <span className="text-[10px] text-slate-400">CNC Coordinate Frames</span>
        <button
          onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          className="text-[11px] px-3 py-1 rounded-lg bg-violet-500 text-white border border-violet-600 disabled:opacity-30 hover:bg-violet-600 transition-colors"
        >Next →</button>
      </div>
    </div>
  );
}
