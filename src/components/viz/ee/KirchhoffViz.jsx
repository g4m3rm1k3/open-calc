import { useState, useEffect, useMemo } from 'react';

function useDark() {
  const check = () => document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(check);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(check()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function makeT(dark) {
  return {
    bg:     dark ? '#0a0f1e' : '#f8fafc',
    panel:  dark ? '#111827' : '#ffffff',
    card:   dark ? '#1e293b' : '#f1f5f9',
    border: dark ? '#1e293b' : '#e2e8f0',
    fence:  dark ? '#334155' : '#d1d5db',
    text:   dark ? '#e2e8f0' : '#1e293b',
    sub:    dark ? '#94a3b8' : '#64748b',
    dim:    dark ? '#475569' : '#94a3b8',
    wireOn: '#0ea5e9',
    svgBg:  dark ? '#0f172a' : '#ffffff',
    grid:   dark ? '#1e293b' : '#f0f4f8',
  };
}

const fmtA = (v) => {
  const a = Math.abs(v);
  if (a >= 1) return `${v.toFixed(3)}A`;
  if (a >= 0.001) return `${(v * 1000).toFixed(1)}mA`;
  return `${(v * 1e6).toFixed(0)}μA`;
};

const RES_COLORS = ['#6366f1', '#10b981', '#f59e0b'];

export default function KirchhoffViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState(params.mode ?? 'KVL');
  const [vs, setVs] = useState(12);
  const [r1, setR1] = useState(100);
  const [r2, setR2] = useState(200);
  const [r3, setR3] = useState(300);

  const resistors = [r1, r2, r3];
  const setters = [setR1, setR2, setR3];
  const labels = ['R₁', 'R₂', 'R₃'];

  const calc = useMemo(() => {
    if (mode === 'KVL') {
      const rT = r1 + r2 + r3;
      const i = vs / rT;
      const drops = [i * r1, i * r2, i * r3];
      return { rT, i, drops, sum: drops.reduce((a, b) => a + b, 0) };
    } else {
      const currents = [vs / r1, vs / r2, vs / r3];
      const iT = currents.reduce((a, b) => a + b, 0);
      const rEq = vs / iT;
      return { currents, iT, rEq };
    }
  }, [mode, vs, r1, r2, r3]);

  // SVG dimensions
  const svgW = 460, svgH = 178;
  const bx = 46, ty = 50, by = 140;

  const renderKVL = () => {
    const cx = [152, 244, 336];
    const rw = 42, rh = 14;
    const wireColor = t.wireOn;
    return (
      <g>
        {/* Bottom and right rails */}
        <line x1={bx} y1={by} x2={418} y2={by} stroke={wireColor} strokeWidth={2} />
        <line x1={418} y1={by} x2={418} y2={ty} stroke={wireColor} strokeWidth={2} />
        {/* Top rail segments between resistors */}
        <line x1={bx} y1={ty} x2={cx[0] - rw / 2} y2={ty} stroke={wireColor} strokeWidth={2} />
        <line x1={cx[0] + rw / 2} y1={ty} x2={cx[1] - rw / 2} y2={ty} stroke={wireColor} strokeWidth={2} />
        <line x1={cx[1] + rw / 2} y1={ty} x2={cx[2] - rw / 2} y2={ty} stroke={wireColor} strokeWidth={2} />
        <line x1={cx[2] + rw / 2} y1={ty} x2={418} y2={ty} stroke={wireColor} strokeWidth={2} />
        {/* Battery */}
        <rect x={bx - 9} y={ty + 10} width={18} height={by - ty - 20} rx={3}
          fill="#fef3c722" stroke="#f59e0b" strokeWidth={2} />
        <text x={bx} y={ty - 8} textAnchor="middle" fontSize={11} fill="#f59e0b" fontWeight={700}>+{vs}V</text>
        <text x={bx + 14} y={ty + 22} fontSize={9} fill="#f59e0b">+</text>
        <text x={bx + 14} y={by - 6} fontSize={9} fill={t.sub}>−</text>
        {/* Current label */}
        <text x={390} y={ty - 10} textAnchor="middle" fontSize={9} fill={t.sub}>
          → I = {fmtA(calc.i)}
        </text>
        {/* Loop arrow (dashed arc) */}
        <path d={`M ${bx + 14} ${(ty + by) / 2 + 10} Q 230 ${ty + 30} 404 ${(ty + by) / 2 + 10}`}
          fill="none" stroke="#6366f133" strokeWidth={2} strokeDasharray="5,4" />
        {/* Resistors */}
        {cx.map((x, idx) => {
          const color = RES_COLORS[idx];
          const drop = calc.drops[idx];
          return (
            <g key={idx}>
              <rect x={x - rw / 2} y={ty - rh / 2} width={rw} height={rh} rx={3}
                fill={color + '22'} stroke={color} strokeWidth={2} />
              <text x={x} y={ty - rh / 2 - 5} textAnchor="middle" fontSize={8} fill={color} fontWeight={700}>
                {labels[idx]}={resistors[idx]}Ω
              </text>
              <text x={x} y={ty + rh / 2 + 13} textAnchor="middle" fontSize={9} fill={color}>
                ↓ {drop.toFixed(1)}V
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  const renderKCL = () => {
    const cx = [148, 244, 340];
    const rh = 38, rw = 14;
    const mid = (ty + by) / 2;
    const wireColor = t.wireOn;
    return (
      <g>
        {/* Top and bottom rails */}
        <line x1={78} y1={ty} x2={400} y2={ty} stroke={wireColor} strokeWidth={2} />
        <line x1={78} y1={by} x2={400} y2={by} stroke={wireColor} strokeWidth={2} />
        {/* Battery (left, vertical) */}
        <line x1={78} y1={ty} x2={78} y2={ty + 14} stroke={wireColor} strokeWidth={2} />
        <rect x={70} y={ty + 14} width={16} height={by - ty - 28} rx={3}
          fill="#fef3c722" stroke="#f59e0b" strokeWidth={2} />
        <line x1={78} y1={by - 14} x2={78} y2={by} stroke={wireColor} strokeWidth={2} />
        <text x={58} y={(ty + by) / 2 + 4} textAnchor="middle" fontSize={10} fill="#f59e0b" fontWeight={700}>
          {vs}V
        </text>
        <text x={90} y={ty + 26} fontSize={9} fill="#f59e0b">+</text>
        <text x={90} y={by - 10} fontSize={9} fill={t.sub}>−</text>
        {/* Node A dot */}
        <circle cx={244} cy={ty} r={5} fill="#f59e0b" />
        <text x={244} y={ty - 12} textAnchor="middle" fontSize={9} fill="#f59e0b" fontWeight={700}>
          node A
        </text>
        <text x={244} y={ty - 24} textAnchor="middle" fontSize={8} fill={t.sub}>
          I_in = {fmtA(calc.iT)}
        </text>
        {/* Vertical resistors */}
        {cx.map((x, idx) => {
          const color = RES_COLORS[idx];
          const i = calc.currents[idx];
          return (
            <g key={idx}>
              <line x1={x} y1={ty} x2={x} y2={mid - rh / 2} stroke={wireColor} strokeWidth={2} />
              <rect x={x - rw / 2} y={mid - rh / 2} width={rw} height={rh} rx={3}
                fill={color + '22'} stroke={color} strokeWidth={2} />
              <line x1={x} y1={mid + rh / 2} x2={x} y2={by} stroke={wireColor} strokeWidth={2} />
              <text x={x + 12} y={mid + 2} fontSize={8} fill={color} fontWeight={700}>{labels[idx]}</text>
              <text x={x + 12} y={mid + 13} fontSize={8} fill={t.sub}>{resistors[idx]}Ω</text>
              <text x={x - 18} y={mid + 7} textAnchor="end" fontSize={8} fill={color}>
                ↓{fmtA(i)}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header + mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>Kirchhoff's Laws</span>
        {['KVL', 'KCL'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: mode === m ? '#6366f1' : t.fence,
              background: mode === m ? '#6366f1' : 'transparent',
              color: mode === m ? 'white' : t.sub }}>
            {m === 'KVL' ? 'KVL — Voltage Law' : 'KCL — Current Law'}
          </button>
        ))}
      </div>

      {/* Circuit SVG */}
      <div style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, marginBottom: 14, overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ display: 'block', maxHeight: svgH }}>
          {mode === 'KVL' ? renderKVL() : renderKCL()}
        </svg>
      </div>

      {/* Law equation display */}
      <div style={{ background: t.card, borderRadius: 10, padding: '10px 16px', border: `1px solid ${t.border}`, marginBottom: 14 }}>
        {mode === 'KVL' ? (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>
              KVL: Σ voltages around loop = 0 &nbsp;→&nbsp; Vs = V₁ + V₂ + V₃
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#f59e0b', marginBottom: 4 }}>
              {vs}V = {calc.drops[0].toFixed(2)}V + {calc.drops[1].toFixed(2)}V + {calc.drops[2].toFixed(2)}V
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: t.sub }}>
              Error = {Math.abs(vs - calc.sum).toExponential(2)}V &nbsp;(floating point rounding — true error = 0)
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>
              KCL: Σ currents at node = 0 &nbsp;→&nbsp; I_source = I₁ + I₂ + I₃
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#f59e0b', marginBottom: 4 }}>
              {fmtA(calc.iT)} = {fmtA(calc.currents[0])} + {fmtA(calc.currents[1])} + {fmtA(calc.currents[2])}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: t.sub }}>
              R_equivalent = {calc.rEq.toFixed(1)}Ω &nbsp; (parallel combination)
            </div>
          </>
        )}
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: t.text }}>
          <span style={{ fontWeight: 700, color: '#f59e0b' }}>Source: {vs}V</span>
          <input type="range" min={1} max={48} value={vs}
            onChange={e => setVs(+e.target.value)} style={{ width: '100%', accentColor: '#f59e0b' }} />
        </label>
        {resistors.map((r, idx) => (
          <label key={idx} style={{ fontSize: 12, color: t.text }}>
            <span style={{ fontWeight: 700, color: RES_COLORS[idx] }}>{labels[idx]}: {r}Ω</span>
            <input type="range" min={10} max={1000} step={10} value={r}
              onChange={e => setters[idx](+e.target.value)} style={{ width: '100%', accentColor: RES_COLORS[idx] }} />
          </label>
        ))}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
        {(mode === 'KVL' ? [
          { label: 'R total', value: calc.rT + 'Ω', color: t.sub },
          { label: 'Current I', value: fmtA(calc.i), color: '#0ea5e9' },
          { label: 'V drop R₁', value: calc.drops[0].toFixed(2) + 'V', color: RES_COLORS[0] },
          { label: 'V drop R₂', value: calc.drops[1].toFixed(2) + 'V', color: RES_COLORS[1] },
          { label: 'V drop R₃', value: calc.drops[2].toFixed(2) + 'V', color: RES_COLORS[2] },
          { label: 'Sum of drops', value: calc.sum.toFixed(2) + 'V = Vs ✓', color: '#a855f7' },
        ] : [
          { label: 'R equivalent', value: calc.rEq.toFixed(1) + 'Ω', color: t.sub },
          { label: 'I_total (in)', value: fmtA(calc.iT), color: '#0ea5e9' },
          { label: 'I through R₁', value: fmtA(calc.currents[0]), color: RES_COLORS[0] },
          { label: 'I through R₂', value: fmtA(calc.currents[1]), color: RES_COLORS[1] },
          { label: 'I through R₃', value: fmtA(calc.currents[2]), color: RES_COLORS[2] },
          { label: 'Sum at node', value: fmtA(calc.iT) + ' ✓', color: '#a855f7' },
        ]).map((item, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 12px', borderLeft: `4px solid ${item.color}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 12px', border: `1px solid ${t.border}` }}>
        {mode === 'KVL'
          ? 'KVL (Kirchhoff\'s Voltage Law, 1845): The algebraic sum of all voltages around any closed loop = 0. This is conservation of energy — a charge gains energy at the source and loses it across the resistors.'
          : 'KCL (Kirchhoff\'s Current Law, 1845): The algebraic sum of all currents entering a node = 0. This is conservation of charge — charge cannot accumulate at a node; whatever flows in must flow out.'}
      </div>
    </div>
  );
}
