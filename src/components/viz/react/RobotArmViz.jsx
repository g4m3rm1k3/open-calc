import { useState, useRef, useEffect } from "react";

const STEPS = [
  {
    title: "A 2-joint robot arm",
    subtitle: "Forward kinematics intro",
    narration:
      "This planar robot arm has two links. The shoulder (joint 1) and elbow (joint 2) each apply a rotation matrix. Compose both matrices and you know exactly where the end-effector (tool tip) lands. This is called forward kinematics — given joint angles, find the tip position.",
  },
  {
    title: "Joint 1: shoulder rotation",
    subtitle: "R(θ₁) rotates the whole arm",
    narration:
      "The shoulder rotates the entire arm. The elbow position is determined by the shoulder angle alone: [L₁·cosθ₁, L₁·sinθ₁]. The rotation matrix R(θ₁) tells us how to transform any vector attached to the base frame.",
  },
  {
    title: "Joint 2: elbow rotation",
    subtitle: "End-effector = R(θ₁+θ₂)·[L₂,0] + elbow",
    narration:
      "The elbow adds a second rotation relative to the first link. The end-effector combines both: p = [L₁cosθ₁ + L₂cos(θ₁+θ₂), L₁sinθ₁ + L₂sin(θ₁+θ₂)]. Notice how we add the cumulative angles — each joint's contribution stacks.",
  },
  {
    title: "Matrix multiplication order",
    subtitle: "In 2D, rotations commute. In 3D, they don't!",
    narration:
      "In 2D, R(θ₁)·R(θ₂) = R(θ₁+θ₂) = R(θ₂)·R(θ₁). Rotation matrices in 2D always commute. But in 3D robots, rotating around X then Y gives a DIFFERENT result than Y then X. That's why robot programming joint order is critical — and why quaternions and Euler angles matter.",
  },
];

const PRESETS = [
  { label: "Straight up", t1: 90, t2: 0 },
  { label: "L-shape", t1: 0, t2: 90 },
  { label: "Folded", t1: 45, t2: -90 },
  { label: "Full stretch", t1: 30, t2: 0 },
];

export default function RobotArmViz() {
  const [step, setStep] = useState(0);
  const [theta1, setTheta1] = useState(45);
  const [theta2, setTheta2] = useState(30);

  const W = 360, H = 280;
  const L1 = 100, L2 = 70;
  const cx = W / 2, cy = H / 2 + 20;

  const t1r = (theta1 * Math.PI) / 180;
  const t2r = (theta2 * Math.PI) / 180;

  const elbowX = cx + L1 * Math.cos(t1r);
  const elbowY = cy - L1 * Math.sin(t1r);
  const tipX = elbowX + L2 * Math.cos(t1r + t2r);
  const tipY = elbowY - L2 * Math.sin(t1r + t2r);

  const cos1 = Math.cos(t1r), sin1 = Math.sin(t1r);
  const cos12 = Math.cos(t1r + t2r), sin12 = Math.sin(t1r + t2r);

  const R1 = [[cos1, -sin1], [sin1, cos1]];
  const R12 = [[cos12, -sin12], [sin12, cos12]];

  // Check commutativity: R1·R2 vs R2·R1
  const cos2 = Math.cos(t2r), sin2 = Math.sin(t2r);
  const R2 = [[cos2, -sin2], [sin2, cos2]];
  function m2mul(A, B) {
    return [
      [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
      [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
    ];
  }
  const R1R2 = m2mul(R1, R2);
  const R2R1 = m2mul(R2, R1);

  const workspaceR = L1 + L2;

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg max-w-[400px] font-sans">
      {/* Dots */}
      <div className="flex items-center gap-2 justify-center">
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === step ? "bg-violet-500 scale-125" : "bg-slate-300 dark:bg-slate-600"}`} />
        ))}
        <span className="ml-2 text-[10px] text-slate-400">{step + 1}/{STEPS.length}</span>
      </div>

      {/* Narration */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
        <div className="text-[13px] font-bold text-violet-600 dark:text-violet-400 mb-0.5">{STEPS[step].title}</div>
        <div className="text-[10px] text-violet-400 dark:text-violet-500 mb-1.5 font-medium">{STEPS[step].subtitle}</div>
        <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{STEPS[step].narration}</div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setTheta1(p.t1); setTheta2(p.t2); }}
            className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      {/* SVG Canvas */}
      <svg width={W} height={H} className="rounded-xl bg-slate-950 border border-slate-800" style={{ maxWidth: "100%" }}>
        <defs>
          <pattern id="rgrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="wsGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <marker id="rarr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <rect width={W} height={H} fill="url(#rgrid)" />

        {/* Workspace circle */}
        <circle cx={cx} cy={cy} r={workspaceR} fill="url(#wsGrad)" stroke="#7c3aed" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
        <circle cx={cx} cy={cy} r={Math.abs(L1 - L2)} fill="none" stroke="#7c3aed" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

        {/* Base */}
        <rect x={cx - 14} y={cy} width={28} height={10} fill="#334155" rx={3} />
        <rect x={cx - 18} y={cy + 8} width={36} height={5} fill="#475569" rx={2} />

        {/* Link 1 */}
        <line x1={cx} y1={cy} x2={elbowX} y2={elbowY}
          stroke="#60a5fa" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        <line x1={cx} y1={cy} x2={elbowX} y2={elbowY}
          stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

        {/* Link 2 */}
        <line x1={elbowX} y1={elbowY} x2={tipX} y2={tipY}
          stroke="#fb923c" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        <line x1={elbowX} y1={elbowY} x2={tipX} y2={tipY}
          stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

        {/* Joints */}
        <circle cx={cx} cy={cy} r={8} fill="#1e40af" stroke="#93c5fd" strokeWidth="2" />
        <circle cx={elbowX} cy={elbowY} r={6} fill="#c2410c" stroke="#fed7aa" strokeWidth="1.5" />
        {/* End-effector */}
        <circle cx={tipX} cy={tipY} r={9} fill="#f43f5e" stroke="#fda4af" strokeWidth="2" />
        <circle cx={tipX} cy={tipY} r={3} fill="white" />

        {/* Labels */}
        <text x={cx + 5} y={cy - 5} fontSize="9" fill="#60a5fa" fontWeight="bold">J1</text>
        <text x={elbowX + 5} y={elbowY - 5} fontSize="9" fill="#fb923c" fontWeight="bold">J2</text>
        <text x={tipX + 8} y={tipY + 4} fontSize="9" fill="#f43f5e" fontWeight="bold">EE</text>
        <text x={tipX + 8} y={tipY + 14} fontSize="8" fill="#f43f5e">
          ({(tipX - cx).toFixed(0)}, {(cy - tipY).toFixed(0)})
        </text>
      </svg>

      {/* Controls & live formula */}
      {(step === 1 || step === 2) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-20 text-blue-400">θ₁: {theta1}°</span>
            <input type="range" min={-180} max={180} value={theta1} onChange={e => setTheta1(Number(e.target.value))} className="flex-1 accent-blue-500" />
          </div>
          {step === 2 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] w-20 text-orange-400">θ₂: {theta2}°</span>
              <input type="range" min={-180} max={180} value={theta2} onChange={e => setTheta2(Number(e.target.value))} className="flex-1 accent-orange-500" />
            </div>
          )}
          {step === 1 && (
            <div className="bg-slate-900 rounded-lg p-2 text-center">
              <div className="text-[9px] text-slate-400 mb-1">R(θ₁)</div>
              <div className="inline-flex gap-2 font-mono text-[11px]">
                <span className="text-slate-400">⎡</span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-3">
                    <span className="text-blue-300 w-10">{R1[0][0].toFixed(3)}</span>
                    <span className="text-blue-300 w-10">{R1[0][1].toFixed(3)}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-300 w-10">{R1[1][0].toFixed(3)}</span>
                    <span className="text-blue-300 w-10">{R1[1][1].toFixed(3)}</span>
                  </div>
                </div>
                <span className="text-slate-400">⎦</span>
              </div>
              <div className="text-[10px] text-blue-400 mt-1">
                Elbow: ({(elbowX - cx).toFixed(1)}, {(cy - elbowY).toFixed(1)})px
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="bg-slate-900 rounded-lg p-2 text-center">
              <div className="text-[9px] text-slate-400 mb-0.5">p_end = R(θ₁+θ₂)·[L₂,0]ᵀ + [L₁cosθ₁, L₁sinθ₁]ᵀ</div>
              <div className="text-[11px] font-mono text-rose-400">
                = ({(tipX - cx).toFixed(1)}, {(cy - tipY).toFixed(1)}) px
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                θ₁+θ₂ = {theta1 + theta2}° | cos(sum) = {cos12.toFixed(3)}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-20 text-blue-400">θ₁: {theta1}°</span>
            <input type="range" min={-180} max={180} value={theta1} onChange={e => setTheta1(Number(e.target.value))} className="flex-1 accent-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-20 text-orange-400">θ₂: {theta2}°</span>
            <input type="range" min={-180} max={180} value={theta2} onChange={e => setTheta2(Number(e.target.value))} className="flex-1 accent-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900 rounded-lg p-2 text-center">
              <div className="text-[9px] text-green-400 mb-1">R(θ₁)·R(θ₂)</div>
              <div className="font-mono text-[10px] text-green-300">
                [{R1R2[0][0].toFixed(2)}, {R1R2[0][1].toFixed(2)}]<br />
                [{R1R2[1][0].toFixed(2)}, {R1R2[1][1].toFixed(2)}]
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-2 text-center">
              <div className="text-[9px] text-amber-400 mb-1">R(θ₂)·R(θ₁)</div>
              <div className="font-mono text-[10px] text-amber-300">
                [{R2R1[0][0].toFixed(2)}, {R2R1[0][1].toFixed(2)}]<br />
                [{R2R1[1][0].toFixed(2)}, {R2R1[1][1].toFixed(2)}]
              </div>
            </div>
          </div>
          <div className="text-[10px] text-center text-slate-400">
            In 2D: R(θ₁)·R(θ₂) = R(θ₂)·R(θ₁) ✓ (always equal!) — In 3D with mixed axes: NOT equal ✗
          </div>
        </div>
      )}

      {step === 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] w-20 text-blue-400">θ₁: {theta1}°</span>
          <input type="range" min={-180} max={180} value={theta1} onChange={e => setTheta1(Number(e.target.value))} className="flex-1 accent-blue-500" />
          <span className="text-[10px] w-20 text-orange-400">θ₂: {theta2}°</span>
          <input type="range" min={-180} max={180} value={theta2} onChange={e => setTheta2(Number(e.target.value))} className="flex-1 accent-orange-500" />
        </div>
      )}

      {/* Try it */}
      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-2 border border-violet-100 dark:border-violet-800">
        <div className="text-[9px] font-semibold text-violet-500 mb-1">💡 Try it</div>
        {step === 0 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Try θ₁=90°, θ₂=-90° — where does the end-effector land? (Hint: directly above base)</p>}
        {step === 1 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Drag θ₁ and watch the whole arm pivot. The elbow traces a circle of radius L₁.</p>}
        {step === 2 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Try reaching a specific target by adjusting both angles. The end-effector workspace is the annulus between |L₁-L₂| and L₁+L₂.</p>}
        {step === 3 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Try flipping θ₁ and θ₂ — in 2D rotation still commutes! Watch both matrices stay equal. In 3D robots, this breaks down.</p>}
      </div>

      {/* Nav */}
      <div className="flex justify-between items-center pt-1">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="text-[11px] px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          ← Prev
        </button>
        <span className="text-[10px] text-slate-400">Robot Arm Kinematics</span>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="text-[11px] px-3 py-1 rounded-lg bg-violet-500 text-white border border-violet-600 disabled:opacity-30 hover:bg-violet-600 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}
