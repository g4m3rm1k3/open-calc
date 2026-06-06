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
    svgBg:  dark ? '#0f172a' : '#ffffff',
  };
}

const MODES = [
  { key: 'inv',    label: 'Inverting' },
  { key: 'noninv', label: 'Non-Inverting' },
  { key: 'diff',   label: 'Difference' },
  { key: 'comp',   label: 'Comparator' },
];

function OpAmpSymbol({ t, cx, cy, w = 60, h = 50 }) {
  const x0 = cx - w / 2;
  const pts = `${x0},${cy - h / 2} ${x0},${cy + h / 2} ${cx + w / 2},${cy}`;
  return (
    <g>
      <polygon points={pts} fill={t.card} stroke={t.fence} strokeWidth={1.5} />
      <text x={x0 + 6} y={cy - 10} fontSize={9} fill={t.sub}>−</text>
      <text x={x0 + 6} y={cy + 14} fontSize={9} fill={t.sub}>+</text>
      <text x={cx + 2} y={cy + 3} fontSize={7} fill={t.dim}>OA</text>
    </g>
  );
}

export default function OpAmpViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState(params.mode ?? 'inv');
  const [Rf, setRf] = useState(100);   // kΩ
  const [R1, setR1] = useState(10);    // kΩ
  const [R2, setR2] = useState(10);    // kΩ (difference amp R2=R3 path)
  const [Vin, setVin] = useState(1.0); // V
  const [Vin2, setVin2] = useState(0.5); // V (for difference)
  const [Vref, setVref] = useState(0.5); // V comparator reference
  const [Vsupply, setVsupply] = useState(15); // ±Vsupply

  const gain_inv    = -(Rf / R1);
  const gain_noninv = 1 + Rf / R1;
  const Vout_inv    = Math.max(-Vsupply, Math.min(Vsupply, gain_inv * Vin));
  const Vout_noninv = Math.max(-Vsupply, Math.min(Vsupply, gain_noninv * Vin));
  const Vout_diff   = Math.max(-Vsupply, Math.min(Vsupply, (Rf / R1) * (Vin2 - Vin)));
  const Vout_comp   = Vin > Vref ? Vsupply : -Vsupply;

  const W = 400, H = 180;

  // Build transfer-function curve for current mode
  const tfCurve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const v = -Vsupply + (i / 100) * 2 * Vsupply;
      let vo;
      if (mode === 'inv')    vo = Math.max(-Vsupply, Math.min(Vsupply, gain_inv * v));
      else if (mode === 'noninv') vo = Math.max(-Vsupply, Math.min(Vsupply, gain_noninv * v));
      else if (mode === 'diff')   vo = Math.max(-Vsupply, Math.min(Vsupply, (Rf / R1) * (Vin2 - v)));
      else                        vo = v > Vref ? Vsupply : -Vsupply;
      const px = 30 + (v + Vsupply) / (2 * Vsupply) * (W - 50);
      const py = 20 + (1 - (vo + Vsupply) / (2 * Vsupply)) * (H - 40);
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return 'M' + pts.join(' L');
  }, [mode, gain_inv, gain_noninv, Rf, R1, Vin2, Vref, Vsupply]);

  // Current operating point on the curve
  const opVin = mode === 'diff' ? Vin : Vin;
  const opVout = mode === 'inv' ? Vout_inv : mode === 'noninv' ? Vout_noninv : mode === 'diff' ? Vout_diff : Vout_comp;
  const opX = 30 + (opVin + Vsupply) / (2 * Vsupply) * (W - 50);
  const opY = 20 + (1 - (opVout + Vsupply) / (2 * Vsupply)) * (H - 40);

  const modeColor = { inv: '#6366f1', noninv: '#10b981', diff: '#f59e0b', comp: '#ef4444' };
  const mc = modeColor[mode];

  const rows = mode === 'inv' ? [
    { label: 'Gain A_v', val: `${gain_inv.toFixed(2)}`, color: mc },
    { label: 'V_in', val: `${Vin.toFixed(3)} V`, color: '#0ea5e9' },
    { label: 'V_out = −(Rf/R1)·Vin', val: `${Vout_inv.toFixed(3)} V`, color: mc },
    { label: 'Virtual ground at V−', val: '≈ 0 V', color: '#94a3b8' },
    { label: 'Input current I_in', val: `${(Vin / R1 * 1000).toFixed(3)} mA`, color: '#f87171' },
  ] : mode === 'noninv' ? [
    { label: 'Gain A_v', val: `${gain_noninv.toFixed(2)}`, color: mc },
    { label: 'V_in (at V+)', val: `${Vin.toFixed(3)} V`, color: '#0ea5e9' },
    { label: 'V_out = (1+Rf/R1)·Vin', val: `${Vout_noninv.toFixed(3)} V`, color: mc },
    { label: 'V− (feedback voltage)', val: `${(Vout_noninv * R1 / (R1 + Rf)).toFixed(3)} V`, color: '#94a3b8' },
  ] : mode === 'diff' ? [
    { label: 'Gain Rf/R1', val: `${(Rf / R1).toFixed(2)}`, color: mc },
    { label: 'V_in1 (−)', val: `${Vin.toFixed(3)} V`, color: '#0ea5e9' },
    { label: 'V_in2 (+)', val: `${Vin2.toFixed(3)} V`, color: '#6366f1' },
    { label: 'V_out = (Rf/R1)·(V2−V1)', val: `${Vout_diff.toFixed(3)} V`, color: mc },
    { label: 'Common mode rejected', val: 'CMRR → ∞', color: '#94a3b8' },
  ] : [
    { label: 'V_in', val: `${Vin.toFixed(3)} V`, color: '#0ea5e9' },
    { label: 'V_ref', val: `${Vref.toFixed(3)} V`, color: '#f59e0b' },
    { label: 'V_in > V_ref?', val: Vin > Vref ? 'YES' : 'NO', color: mc },
    { label: 'V_out', val: `${Vout_comp > 0 ? '+' : ''}${Vout_comp.toFixed(1)} V`, color: mc },
  ];

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header + tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: mc }}>Op-Amp Configurations</span>
        {MODES.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)}
            style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: mode === m.key ? modeColor[m.key] : t.fence,
              background: mode === m.key ? modeColor[m.key] + '22' : 'transparent',
              color: mode === m.key ? modeColor[m.key] : t.sub }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        {/* Transfer curve */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 4 }}>
            Transfer Characteristic (V_out vs V_in)
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%"
            style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }}>
            {/* Axes */}
            <line x1={30} y1={20} x2={30} y2={H - 20} stroke={t.fence} strokeWidth={1} />
            <line x1={25} y1={H / 2} x2={W - 15} y2={H / 2} stroke={t.fence} strokeWidth={1} />
            {/* Saturation lines */}
            <line x1={30} y1={20} x2={W - 15} y2={20} stroke={t.fence} strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
            <line x1={30} y1={H - 20} x2={W - 15} y2={H - 20} stroke={t.fence} strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
            <text x={W - 14} y={23} fontSize={7} fill={t.sub} textAnchor="end">+Vs={Vsupply}V</text>
            <text x={W - 14} y={H - 14} fontSize={7} fill={t.sub} textAnchor="end">−Vs</text>
            {/* Axis labels */}
            <text x={W - 12} y={H / 2 - 4} fontSize={8} fill={t.sub}>V_in</text>
            <text x={34} y={16} fontSize={8} fill={t.sub}>V_out</text>
            {/* Curve */}
            <path d={tfCurve} fill="none" stroke={mc} strokeWidth={2.5} />
            {/* Operating point */}
            <circle cx={opX} cy={opY} r={5} fill={mc} />
            <text x={opX + 7} y={opY - 4} fontSize={8} fill={mc} fontWeight={700}>
              ({Vin.toFixed(2)}V → {opVout.toFixed(2)}V)
            </text>
          </svg>

          {/* Formula box */}
          <div style={{ marginTop: 10, background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 6 }}>Formula</div>
            {mode === 'inv' && (
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: mc }}>
                V_out = −(Rf / R1) × V_in<br />
                <span style={{ color: t.sub, fontSize: 10 }}>Virtual ground: V− ≈ 0V via negative feedback</span>
              </div>
            )}
            {mode === 'noninv' && (
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: mc }}>
                V_out = (1 + Rf / R1) × V_in<br />
                <span style={{ color: t.sub, fontSize: 10 }}>V+ = V_in, V− tracks V+ via feedback</span>
              </div>
            )}
            {mode === 'diff' && (
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: mc }}>
                V_out = (Rf / R1) × (V_in2 − V_in1)<br />
                <span style={{ color: t.sub, fontSize: 10 }}>Rejects common-mode signal, amplifies difference</span>
              </div>
            )}
            {mode === 'comp' && (
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: mc }}>
                V_out = +Vs  if V_in &gt; V_ref<br />
                V_out = −Vs  if V_in &lt; V_ref<br />
                <span style={{ color: t.sub, fontSize: 10 }}>No feedback — open loop. Output is binary ±Vs</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls + values */}
        <div>
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 10 }}>Calculated Values</div>
            {rows.map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: t.sub }}>{row.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: row.color }}>{row.val}</span>
              </div>
            ))}
          </div>

          {/* Sliders */}
          {[
            { label: 'Rf', val: Rf, set: setRf, min: 1, max: 1000, step: 1, unit: 'kΩ', color: '#6366f1', show: mode !== 'comp' },
            { label: 'R1', val: R1, set: setR1, min: 1, max: 500, step: 1, unit: 'kΩ', color: '#f87171', show: mode !== 'comp' },
            { label: 'V_in', val: Vin, set: setVin, min: -Vsupply, max: Vsupply, step: 0.1, unit: 'V', color: '#0ea5e9', show: true },
            { label: 'V_in2 (+)', val: Vin2, set: setVin2, min: -Vsupply, max: Vsupply, step: 0.1, unit: 'V', color: '#6366f1', show: mode === 'diff' },
            { label: 'V_ref', val: Vref, set: setVref, min: -Vsupply, max: Vsupply, step: 0.1, unit: 'V', color: '#f59e0b', show: mode === 'comp' },
            { label: '±V_supply', val: Vsupply, set: setVsupply, min: 3, max: 18, step: 1, unit: 'V', color: '#fbbf24', show: true },
          ].filter(s => s.show).map(s => (
            <label key={s.label} style={{ fontSize: 12, color: t.text, display: 'block', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: s.color }}>{s.label}: {Number(s.val).toFixed(1)}{s.unit}</span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                onChange={e => s.set(+e.target.value)}
                style={{ width: '100%', accentColor: s.color, marginTop: 3 }} />
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 14px', border: `1px solid ${t.border}` }}>
        <strong style={{ color: t.text }}>Ideal op-amp rules:</strong> (1) Infinite open-loop gain → V+ = V− in closed-loop. (2) Infinite input impedance → no current into inputs. (3) Zero output impedance. These two rules plus KCL derive every standard op-amp circuit formula.
      </div>
    </div>
  );
}
