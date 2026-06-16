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
    card:   dark ? '#1e293b' : '#f8fafc',
    border: dark ? '#1e293b' : '#e2e8f0',
    text:   dark ? '#e2e8f0' : '#1e293b',
    sub:    dark ? '#94a3b8' : '#64748b',
    dim:    dark ? '#475569' : '#94a3b8',
    svgBg:  dark ? '#111827' : '#f8fafc',
  };
}

const MODES = ['Series', 'Parallel', 'Mixed'];

function Resistor({ x, y, w = 40, h = 16, color = '#6366f1', label, value, textColor }) {
  return (
    <g>
      <rect x={x} y={y - h/2} width={w} height={h} rx={3} fill={color + '22'} stroke={color} strokeWidth={2} />
      <text x={x + w/2} y={y - h/2 - 4} textAnchor="middle" fontSize={9} fill={color} fontWeight={700}>{label}</text>
      <text x={x + w/2} y={y + h/2 + 11} textAnchor="middle" fontSize={8} fill={textColor}>{value ? value + 'Ω' : ''}</text>
    </g>
  );
}

function Battery({ x, y, voltage }) {
  return (
    <g>
      <rect x={x - 6} y={y - 16} width={12} height={32} rx={3} fill="#fef3c7" stroke="#f59e0b" strokeWidth={2} />
      <text x={x} y={y - 20} textAnchor="middle" fontSize={9} fill="#f59e0b" fontWeight={700}>{voltage}V</text>
      <text x={x} y={y + 26} textAnchor="middle" fontSize={8} fill="#94a3b8">+</text>
    </g>
  );
}

function Wire({ x1, y1, x2, y2, active, current }) {
  const color = active ? '#10b981' : '#94a3b8';
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={active ? (current > 0.5 ? 3 : 2) : 1.5} strokeDasharray={active ? 'none' : '4 3'} />
  );
}

export default function SeriesParallelViz() {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState('Series');
  const [voltage, setVoltage] = useState(12);
  const [r1, setR1] = useState(100);
  const [r2, setR2] = useState(200);
  const [r3, setR3] = useState(150);
  const [sw1] = useState(true);
  const [sw2] = useState(true);

  const calc = useMemo(() => {
    if (mode === 'Series') {
      const rTotal = (sw1 ? r1 : Infinity) + (sw2 ? r2 : Infinity);
      const I = rTotal === Infinity ? 0 : voltage / rTotal;
      const V1 = sw1 ? I * r1 : 0;
      const V2 = sw2 ? I * r2 : 0;
      return { rTotal: rTotal === Infinity ? '∞' : rTotal.toFixed(0), I, V1, V2, P: voltage * I };
    } else if (mode === 'Parallel') {
      const g1 = sw1 ? 1/r1 : 0;
      const g2 = sw2 ? 1/r2 : 0;
      const gTotal = g1 + g2;
      const rTotal = gTotal === 0 ? Infinity : 1/gTotal;
      const I1 = sw1 ? voltage / r1 : 0;
      const I2 = sw2 ? voltage / r2 : 0;
      const I = I1 + I2;
      return { rTotal: rTotal === Infinity ? '∞' : rTotal.toFixed(0), I, I1, I2, P: voltage * I };
    } else {
      const rParallel = sw2 ? (r2 * r3) / (r2 + r3) : r3;
      const rTotal = r1 + rParallel;
      const I = voltage / rTotal;
      const Vmid = I * rParallel;
      return { rTotal: rTotal.toFixed(0), I, I2: sw2 ? Vmid / r2 : 0, I3: Vmid / r3, P: voltage * I };
    }
  }, [mode, voltage, r1, r2, r3, sw1, sw2]);

  const svgW = 440, svgH = 220;

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>Circuit Builder</span>
        {MODES.map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '2px solid', borderColor: mode === m ? '#6366f1' : t.border, background: mode === m ? '#6366f1' : 'transparent', color: mode === m ? 'white' : t.sub }}>
            {m}
          </button>
        ))}
      </div>

      <div style={{ background: t.svgBg, borderRadius: 12, border: `1px solid ${t.border}`, marginBottom: 16, overflow: 'hidden' }}>
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', maxHeight: 220 }}>
          {mode === 'Series' && (
            <g>
              <Battery x={40} y={110} voltage={voltage} />
              <Wire x1={40} y1={94} x2={150} y2={94} active={sw1 || sw2} current={calc.I} />
              <Resistor x={150} y={94} w={60} h={20} color="#6366f1" label="R₁" value={r1} textColor={t.sub} />
              <Wire x1={210} y1={94} x2={280} y2={94} active={sw1 && sw2} current={calc.I} />
              <Resistor x={280} y={94} w={60} h={20} color="#10b981" label="R₂" value={r2} textColor={t.sub} />
              <Wire x1={340} y1={94} x2={400} y2={94} active={sw1 && sw2} current={calc.I} />
              <Wire x1={400} y1={94} x2={400} y2={126} active={sw1 && sw2} current={calc.I} />
              <Wire x1={400} y1={126} x2={40} y2={126} active current={calc.I} />
              <text x={180} y={130} textAnchor="middle" fontSize={9} fill="#6366f1">V₁={calc.V1?.toFixed(1)}V</text>
              <text x={310} y={130} textAnchor="middle" fontSize={9} fill="#10b981">V₂={calc.V2?.toFixed(1)}V</text>
              <text x={220} y={160} textAnchor="middle" fontSize={10} fill={t.sub} fontWeight={600}>I = {calc.I?.toFixed(3)}A</text>
            </g>
          )}
          {mode === 'Parallel' && (
            <g>
              <Battery x={40} y={110} voltage={voltage} />
              <Wire x1={40} y1={80} x2={380} y2={80} active current={calc.I} />
              <Wire x1={40} y1={140} x2={380} y2={140} active current={calc.I} />
              <Wire x1={40} y1={94} x2={40} y2={80} active current={calc.I} />
              <Wire x1={40} y1={126} x2={40} y2={140} active current={calc.I} />
              <Wire x1={160} y1={80} x2={160} y2={95} active={sw1} current={calc.I1} />
              <Resistor x={140} y={110} w={40} h={20} color="#6366f1" label="R₁" value={r1} textColor={t.sub} />
              <Wire x1={160} y1={125} x2={160} y2={140} active={sw1} current={calc.I1} />
              <text x={175} y={115} fontSize={9} fill="#6366f1">I₁={calc.I1?.toFixed(3)}A</text>
              <Wire x1={280} y1={80} x2={280} y2={95} active={sw2} current={calc.I2} />
              <Resistor x={260} y={110} w={40} h={20} color="#10b981" label="R₂" value={r2} textColor={t.sub} />
              <Wire x1={280} y1={125} x2={280} y2={140} active={sw2} current={calc.I2} />
              <text x={295} y={115} fontSize={9} fill="#10b981">I₂={calc.I2?.toFixed(3)}A</text>
              <text x={220} y={170} textAnchor="middle" fontSize={10} fill={t.sub} fontWeight={600}>I = {calc.I?.toFixed(3)}A  |  V = {voltage}V across both</text>
            </g>
          )}
          {mode === 'Mixed' && (
            <g>
              <Battery x={40} y={110} voltage={voltage} />
              <Wire x1={40} y1={90} x2={100} y2={90} active current={calc.I} />
              <Resistor x={100} y={90} w={50} h={18} color="#6366f1" label="R₁" value={r1} textColor={t.sub} />
              <Wire x1={150} y1={90} x2={200} y2={90} active current={calc.I} />
              <Wire x1={200} y1={90} x2={200} y2={75} active current={calc.I} />
              <Wire x1={200} y1={75} x2={340} y2={75} active current={calc.I} />
              <Resistor x={250} y={75} w={40} h={16} color="#10b981" label="R₂" value={r2} textColor={t.sub} />
              <Wire x1={200} y1={90} x2={200} y2={105} active current={calc.I} />
              <Wire x1={200} y1={105} x2={340} y2={105} active current={calc.I} />
              <Resistor x={250} y={105} w={40} h={16} color="#8b5cf6" label="R₃" value={r3} textColor={t.sub} />
              <Wire x1={340} y1={75} x2={380} y2={75} active current={calc.I} />
              <Wire x1={340} y1={105} x2={380} y2={105} active current={calc.I} />
              <Wire x1={380} y1={75} x2={380} y2={130} active current={calc.I} />
              <Wire x1={380} y1={130} x2={40} y2={130} active current={calc.I} />
              <text x={220} y={155} textAnchor="middle" fontSize={10} fill={t.sub} fontWeight={600}>I = {calc.I?.toFixed(3)}A</text>
              <text x={270} y={60} textAnchor="middle" fontSize={9} fill="#10b981">I₂={calc.I2?.toFixed(3)}A</text>
              <text x={270} y={125} textAnchor="middle" fontSize={9} fill="#8b5cf6">I₃={calc.I3?.toFixed(3)}A</text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: t.text }}>
          <span style={{ fontWeight: 700, color: '#f59e0b' }}>Voltage: {voltage}V</span>
          <input type="range" min={1} max={48} value={voltage} onChange={e => setVoltage(+e.target.value)} style={{ width: '100%', accentColor: '#f59e0b' }} />
        </label>
        <label style={{ fontSize: 12, color: t.text }}>
          <span style={{ fontWeight: 700, color: '#6366f1' }}>R₁: {r1}Ω</span>
          <input type="range" min={10} max={1000} step={10} value={r1} onChange={e => setR1(+e.target.value)} style={{ width: '100%', accentColor: '#6366f1' }} />
        </label>
        <label style={{ fontSize: 12, color: t.text }}>
          <span style={{ fontWeight: 700, color: '#10b981' }}>R₂: {r2}Ω</span>
          <input type="range" min={10} max={1000} step={10} value={r2} onChange={e => setR2(+e.target.value)} style={{ width: '100%', accentColor: '#10b981' }} />
        </label>
        {mode === 'Mixed' && (
          <label style={{ fontSize: 12, color: t.text }}>
            <span style={{ fontWeight: 700, color: '#8b5cf6' }}>R₃: {r3}Ω</span>
            <input type="range" min={10} max={1000} step={10} value={r3} onChange={e => setR3(+e.target.value)} style={{ width: '100%', accentColor: '#8b5cf6' }} />
          </label>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
        {[
          { label: 'R total', value: calc.rTotal + 'Ω', color: '#6366f1' },
          { label: 'Current (total)', value: (calc.I * 1000).toFixed(1) + 'mA', color: '#10b981' },
          { label: 'Power', value: calc.P?.toFixed(2) + 'W', color: '#f59e0b' },
          mode === 'Series' && { label: 'V drop R₁', value: calc.V1?.toFixed(2) + 'V', color: '#6366f1' },
          mode === 'Series' && { label: 'V drop R₂', value: calc.V2?.toFixed(2) + 'V', color: '#10b981' },
          mode === 'Parallel' && { label: 'I through R₁', value: (calc.I1 * 1000).toFixed(1) + 'mA', color: '#6366f1' },
          mode === 'Parallel' && { label: 'I through R₂', value: (calc.I2 * 1000).toFixed(1) + 'mA', color: '#10b981' },
        ].filter(Boolean).map((item, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 12px', borderLeft: `4px solid ${item.color}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 12px', border: `1px solid ${t.border}` }}>
        {mode === 'Series' && 'KVL: V = V₁ + V₂  |  Same current through each resistor'}
        {mode === 'Parallel' && 'KCL: I = I₁ + I₂  |  Same voltage across each resistor'}
        {mode === 'Mixed' && 'Series: same I through R₁ and the parallel combination  |  Parallel: same V across R₂ and R₃'}
      </div>
    </div>
  );
}
