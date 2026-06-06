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
    grid:   dark ? '#1e293b' : '#f0f4f8',
    plateFill: dark ? '#1e3a5f' : '#dbeafe',
    dieFill:   dark ? '#1e293b' : '#f0f9ff',
  };
}

const EPS0 = 8.854e-12; // F/m

const DIELECTRICS = [
  { name: 'Air / Vacuum', er: 1.0, color: '#94a3b8' },
  { name: 'Polyester film', er: 3.2, color: '#60a5fa' },
  { name: 'Ceramic (X7R)', er: 3000, color: '#f59e0b' },
  { name: 'Electrolytic oxide', er: 8.5, color: '#10b981' },
  { name: 'Tantalum oxide', er: 27, color: '#a855f7' },
];

const fmt = (n, unit) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M${unit}`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}k${unit}`;
  if (n >= 1) return `${n.toFixed(3)}${unit}`;
  if (n >= 1e-3) return `${(n * 1e3).toFixed(2)}m${unit}`;
  if (n >= 1e-6) return `${(n * 1e6).toFixed(2)}μ${unit}`;
  if (n >= 1e-9) return `${(n * 1e9).toFixed(2)}n${unit}`;
  return `${(n * 1e12).toFixed(2)}p${unit}`;
};

export default function CapacitorViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [view, setView] = useState('geometry'); // 'geometry' | 'energy'
  const [areaCm2, setAreaCm2] = useState(10);   // cm²
  const [sepMm, setSepMm] = useState(1.0);       // mm
  const [dielIdx, setDielIdx] = useState(0);     // index into DIELECTRICS
  const [voltage, setVoltage] = useState(5);     // V

  const diel = DIELECTRICS[dielIdx];

  const A = areaCm2 * 1e-4;       // m²
  const d = sepMm * 1e-3;         // m
  const C = EPS0 * diel.er * A / d;
  const Q = C * voltage;
  const E_field = voltage / d;     // V/m
  const Energy = 0.5 * C * voltage * voltage;

  // SVG for capacitor cross-section
  const svgW = 340, svgH = 160;
  const plateY1 = 34, plateY2 = 116;
  const plateH = 14;
  const sepPixels = plateY2 - (plateY1 + plateH); // pixels between plates

  // Number of charge symbols based on charge density
  const chargeCount = Math.min(Math.round(areaCm2 / 3) + 1, 8);
  const platePad = 28;
  const plateWidth = svgW - 2 * platePad;
  const chargeXs = Array.from({ length: chargeCount }, (_, i) =>
    platePad + 14 + (i / Math.max(chargeCount - 1, 1)) * (plateWidth - 28)
  );

  // E field arrow count
  const fieldCount = Math.min(chargeCount, 6);
  const fieldXs = Array.from({ length: fieldCount }, (_, i) =>
    platePad + 20 + (i / Math.max(fieldCount - 1, 1)) * (plateWidth - 40)
  );

  // Energy chart (Q vs V)
  const chartW = 200, chartH = 120, cPad = 28;
  const Vmax = Math.max(voltage * 1.4, 10);
  const Qmax = C * Vmax;
  const chartPath = () => {
    const pts = [];
    for (let i = 0; i <= 50; i++) {
      const v = (i / 50) * Vmax;
      const q = C * v;
      const x = cPad + (v / Vmax) * (chartW - cPad * 1.5);
      const y = cPad + chartH - (q / Qmax) * chartH;
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const dotX = cPad + (voltage / Vmax) * (chartW - cPad * 1.5);
  const dotY = cPad + chartH - (Q / Qmax) * chartH;

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>Capacitor Explorer</span>
        {['geometry', 'energy'].map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: view === v ? '#6366f1' : t.fence,
              background: view === v ? '#6366f1' : 'transparent',
              color: view === v ? 'white' : t.sub }}>
            {v === 'geometry' ? 'Structure' : 'Q = CV  Energy'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: view === 'geometry' ? '1fr 1fr' : '1fr 1fr', gap: 16 }}>

        {/* Left: SVG visualization */}
        <div>
          {view === 'geometry' ? (
            <div style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
              <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ display: 'block' }}>
                {/* Dielectric fill */}
                <rect x={platePad} y={plateY1 + plateH} width={plateWidth} height={sepPixels}
                  fill={diel.color + '18'} />
                <text x={svgW / 2} y={(plateY1 + plateH + plateY2) / 2 + 4}
                  textAnchor="middle" fontSize={9} fill={diel.color} fontWeight={700}>
                  ε_r = {diel.er} — {diel.name}
                </text>

                {/* Top plate (positive) */}
                <rect x={platePad} y={plateY1} width={plateWidth} height={plateH} rx={3}
                  fill={t.plateFill} stroke="#60a5fa" strokeWidth={2} />
                <text x={platePad - 10} y={plateY1 + plateH / 2 + 4} textAnchor="end"
                  fontSize={10} fill="#ef4444" fontWeight={700}>+</text>

                {/* Bottom plate (negative) */}
                <rect x={platePad} y={plateY2} width={plateWidth} height={plateH} rx={3}
                  fill={t.plateFill} stroke="#60a5fa" strokeWidth={2} />
                <text x={platePad - 10} y={plateY2 + plateH / 2 + 4} textAnchor="end"
                  fontSize={10} fill="#60a5fa" fontWeight={700}>−</text>

                {/* Charge symbols on top plate */}
                {chargeXs.map((x, i) => (
                  <text key={i} x={x} y={plateY1 + plateH - 2} textAnchor="middle"
                    fontSize={9} fill="#ef4444" fontWeight={700}>+</text>
                ))}
                {/* Charge symbols on bottom plate */}
                {chargeXs.map((x, i) => (
                  <text key={i} x={x} y={plateY2 + 11} textAnchor="middle"
                    fontSize={9} fill="#60a5fa" fontWeight={700}>−</text>
                ))}

                {/* E field arrows (downward) */}
                {voltage > 0 && fieldXs.map((x, i) => {
                  const arrowTop = plateY1 + plateH + 6;
                  const arrowBot = plateY2 - 6;
                  const midY = (arrowTop + arrowBot) / 2;
                  return (
                    <g key={i}>
                      <line x1={x} y1={arrowTop} x2={x} y2={arrowBot}
                        stroke="#f59e0b" strokeWidth={1.2} opacity={0.7} />
                      <polygon points={`${x},${arrowBot} ${x - 3},${arrowBot - 6} ${x + 3},${arrowBot - 6}`}
                        fill="#f59e0b" opacity={0.7} />
                    </g>
                  );
                })}

                {/* Voltage label */}
                <text x={svgW - 14} y={(plateY1 + plateY2 + plateH) / 2}
                  textAnchor="middle" fontSize={9} fill="#f59e0b">
                  {voltage}V
                </text>
                <line x1={svgW - 20} y1={plateY1 + plateH / 2} x2={svgW - 20} y2={plateY2 + plateH / 2}
                  stroke="#f59e0b" strokeWidth={1} strokeDasharray="3,2" />

                {/* Separation label */}
                <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize={8} fill={t.sub}>
                  A = {areaCm2}cm²  d = {sepMm}mm
                </text>
              </svg>
            </div>
          ) : (
            /* Energy / Q-V chart */
            <div style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
              <svg viewBox={`0 0 ${chartW + 40} ${chartH + cPad * 2 + 10}`} width="100%" style={{ display: 'block' }}>
                {/* Shaded energy area */}
                {Q > 0 && (
                  <path d={`M ${cPad},${cPad + chartH} L ${dotX},${dotY} L ${dotX},${cPad + chartH} Z`}
                    fill="#6366f122" />
                )}
                {/* Axes */}
                <line x1={cPad} y1={cPad} x2={cPad} y2={cPad + chartH} stroke={t.fence} strokeWidth={1.5} />
                <line x1={cPad} y1={cPad + chartH} x2={chartW - 4} y2={cPad + chartH} stroke={t.fence} strokeWidth={1.5} />
                {/* Q=CV line */}
                <path d={chartPath()} fill="none" stroke="#6366f1" strokeWidth={2.5} />
                {/* Dot at current V */}
                <circle cx={dotX} cy={dotY} r={5} fill="#6366f1" />
                {/* Labels */}
                <text x={cPad - 4} y={cPad + 4} textAnchor="end" fontSize={8} fill={t.sub}>{fmt(Qmax, 'C')}</text>
                <text x={cPad - 4} y={cPad + chartH + 4} textAnchor="end" fontSize={8} fill={t.sub}>0</text>
                <text x={chartW - 6} y={cPad + chartH + 14} textAnchor="middle" fontSize={8} fill={t.sub}>{Vmax.toFixed(0)}V</text>
                <text x={cPad} y={cPad + chartH + 14} textAnchor="middle" fontSize={8} fill={t.sub}>0</text>
                <text x={cPad - 2} y={cPad - 6} textAnchor="end" fontSize={8} fill="#6366f1">Q (C)</text>
                <text x={chartW - 2} y={cPad + chartH + 22} textAnchor="end" fontSize={8} fill={t.sub}>V</text>
                {/* Energy label */}
                <text x={(cPad + dotX) / 2} y={cPad + chartH - 10} textAnchor="middle"
                  fontSize={9} fill="#6366f1">E = ½CV² = {fmt(Energy, 'J')}</text>
                {/* Slope label */}
                <text x={dotX + 8} y={dotY - 8} fontSize={8} fill="#6366f1">
                  Q = {fmt(Q, 'C')}
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* Right: controls and readouts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, color: t.text }}>
              <span style={{ fontWeight: 700, color: '#60a5fa' }}>Plate Area: {areaCm2}cm²</span>
              <input type="range" min={1} max={100} value={areaCm2}
                onChange={e => setAreaCm2(+e.target.value)} style={{ width: '100%', accentColor: '#60a5fa' }} />
            </label>
            <label style={{ fontSize: 12, color: t.text }}>
              <span style={{ fontWeight: 700, color: '#f59e0b' }}>Separation: {sepMm.toFixed(1)}mm</span>
              <input type="range" min={0.1} max={10} step={0.1} value={sepMm}
                onChange={e => setSepMm(+e.target.value)} style={{ width: '100%', accentColor: '#f59e0b' }} />
            </label>
            <label style={{ fontSize: 12, color: t.text }}>
              <span style={{ fontWeight: 700, color: '#a855f7' }}>Voltage: {voltage}V</span>
              <input type="range" min={0} max={100} value={voltage}
                onChange={e => setVoltage(+e.target.value)} style={{ width: '100%', accentColor: '#a855f7' }} />
            </label>
          </div>

          {/* Dielectric selector */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 4 }}>
              Dielectric material
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {DIELECTRICS.map((d, i) => (
                <button key={i} onClick={() => setDielIdx(i)}
                  style={{ textAlign: 'left', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                    cursor: 'pointer', border: `1px solid ${dielIdx === i ? d.color : t.fence}`,
                    background: dielIdx === i ? d.color + '22' : 'transparent',
                    color: dielIdx === i ? d.color : t.sub }}>
                  ε_r={d.er} — {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginTop: 14 }}>
        {[
          { label: 'Capacitance C', value: fmt(C, 'F'), color: '#6366f1' },
          { label: 'Charge Q = CV', value: fmt(Q, 'C'), color: '#60a5fa' },
          { label: 'E field', value: (E_field / 1000).toFixed(1) + ' kV/m', color: '#f59e0b' },
          { label: 'Energy ½CV²', value: fmt(Energy, 'J'), color: '#10b981' },
          { label: 'Dielectric ε_r', value: diel.er.toString(), color: diel.color },
        ].map((item, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8,
            padding: '8px 12px', borderLeft: `4px solid ${item.color}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 12px', border: `1px solid ${t.border}` }}>
        C = ε₀ × ε_r × A / d &nbsp;|&nbsp; Q = CV &nbsp;|&nbsp; E = ½CV² &nbsp;|&nbsp;
        Larger area → more C &nbsp; Closer plates → more C &nbsp; Higher ε_r → more C
      </div>
    </div>
  );
}
