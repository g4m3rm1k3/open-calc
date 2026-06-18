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
    grid:   dark ? '#1e293b' : '#e5e7eb',
  };
}

const DIODE_TYPES = {
  Silicon:  { Vf: 0.7,   Vz: 50,  Is: 1e-12, label: 'Silicon (1N4001)',   color: '#6366f1' },
  Schottky: { Vf: 0.3,   Vz: 40,  Is: 1e-8,  label: 'Schottky (1N5817)', color: '#f59e0b' },
  Zener:    { Vf: 0.7,   Vz: 5.1, Is: 1e-12, label: 'Zener 5.1V',        color: '#10b981' },
  LED:      { Vf: 2.0,   Vz: 40,  Is: 1e-14, label: 'Red LED',           color: '#ef4444' },
};

const fmt = (n, unit) => {
  const a = Math.abs(n);
  if (a >= 1) return `${n.toFixed(3)}${unit}`;
  if (a >= 1e-3) return `${(n * 1e3).toFixed(2)}m${unit}`;
  if (a >= 1e-6) return `${(n * 1e6).toFixed(2)}μ${unit}`;
  if (a >= 1e-9) return `${(n * 1e9).toFixed(2)}n${unit}`;
  return `0 ${unit}`;
};

export default function DiodeViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [type, setType] = useState(params.type ?? 'Silicon');
  const [vd, setVd] = useState(0.65);
  const [R, setR] = useState(100);

  const d = DIODE_TYPES[type];

  const diodeCurrent = (v) => {
    const Vt = 0.02585;
    if (v >= -d.Vz) {
      return d.Is * (Math.exp(v / Vt) - 1);
    } else {
      return -0.1; // beyond breakdown
    }
  };

  const Id = diodeCurrent(vd);
  const Vs_needed = vd + Id * R;

  // IV curve
  const W = 420, H = 220, ox = 160, oy = 130;
  const xScale = 60, yScaleA = 60, yScaleRev = 20;

  const points = useMemo(() => {
    const fwd = [], rev = [];
    for (let i = 0; i <= 200; i++) {
      const v = -d.Vz - 0.5 + (i / 200) * (d.Vz + 1.5);
      const I = diodeCurrent(v);
      const px = ox + v * xScale;
      const py = oy - (I > 0 ? I * yScaleA : I * yScaleRev);
      if (v < 0) rev.push(`${rev.length === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
      else fwd.push(`${fwd.length === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return { fwd: fwd.join(' '), rev: rev.join(' ') };
  }, [type]);

  const dotX = ox + vd * xScale;
  const dotY = oy - (Id > 0 ? Math.min(Id * yScaleA, 100) : Id * yScaleRev);

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: d.color }}>Diode IV Characteristics</span>
        {Object.entries(DIODE_TYPES).map(([key, dt]) => (
          <button key={key} onClick={() => { setType(key); setVd(dt.Vf * 0.9); }}
            style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: type === key ? dt.color : t.fence,
              background: type === key ? dt.color + '22' : 'transparent',
              color: type === key ? dt.color : t.sub }}>
            {key}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        {/* IV Curve */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>I–V Characteristic Curve</div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%"
            style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }}>
            {/* Grid */}
            <line x1={10} y1={oy} x2={W - 10} y2={oy} stroke={t.fence} strokeWidth={1.5} />
            <line x1={ox} y1={10} x2={ox} y2={H - 10} stroke={t.fence} strokeWidth={1.5} />
            {/* Voltage axis labels */}
            {[-1, -0.5, 0.5, 1, 1.5].map(v => {
              const x = ox + v * xScale;
              return x > 10 && x < W - 10 ? (
                <g key={v}>
                  <line x1={x} y1={oy - 3} x2={x} y2={oy + 3} stroke={t.fence} strokeWidth={1} />
                  <text x={x} y={oy + 14} textAnchor="middle" fontSize={8} fill={t.sub}>{v}V</text>
                </g>
              ) : null;
            })}
            {/* Zener breakdown line */}
            <line x1={ox - d.Vz * xScale} y1={10} x2={ox - d.Vz * xScale} y2={H - 10}
              stroke={d.color} strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
            <text x={ox - d.Vz * xScale + 4} y={H - 20} fontSize={8} fill={d.color}>−Vz={d.Vz}V</text>
            {/* Vf line */}
            <line x1={ox + d.Vf * xScale} y1={10} x2={ox + d.Vf * xScale} y2={H - 10}
              stroke={d.color} strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
            <text x={ox + d.Vf * xScale + 4} y={20} fontSize={8} fill={d.color}>Vf={d.Vf}V</text>
            {/* Current axis labels */}
            <text x={ox - 4} y={oy - 60} textAnchor="end" fontSize={8} fill={t.sub}>+I</text>
            <text x={ox - 4} y={oy + 30} textAnchor="end" fontSize={8} fill={t.sub}>−I</text>
            {/* IV curve */}
            <path d={points.fwd} fill="none" stroke={d.color} strokeWidth={2.5} />
            <path d={points.rev} fill="none" stroke={d.color} strokeWidth={2.5} />
            {/* Operating point dot */}
            <circle cx={dotX} cy={dotY} r={6} fill={d.color} />
            <text x={dotX + 8} y={dotY - 6} fontSize={9} fill={d.color} fontWeight={700}>
              ({vd.toFixed(2)}V, {fmt(Id, 'A')})
            </text>
            {/* Load line */}
            {(() => {
              const x1 = ox + Vs_needed * xScale;
              const y1 = oy;
              const y2 = oy - (Vs_needed / R) * yScaleA;
              const x2 = ox;
              return x1 > 0 && x1 < W ? (
                <line x1={Math.min(x1, W - 10)} y1={y1} x2={x2} y2={y2}
                  stroke="#64748b" strokeWidth={1.5} strokeDasharray="6,3" />
              ) : null;
            })()}
            {/* Axis labels */}
            <text x={W - 8} y={oy - 6} textAnchor="end" fontSize={8} fill={t.sub}>V_D</text>
            <text x={ox + 4} y={14} fontSize={8} fill={t.sub}>I_D</text>
          </svg>
          <div style={{ marginTop: 6, fontSize: 10, color: t.sub }}>
            Dashed line = load line (slope = −1/R). Intersection = operating point.
          </div>
        </div>

        {/* Controls + values */}
        <div>
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 10 }}>Operating Point</div>
            {[
              { label: 'Diode type', val: DIODE_TYPES[type].label, color: d.color },
              { label: 'V_D (diode voltage)', val: `${vd.toFixed(3)} V`, color: '#0ea5e9' },
              { label: 'I_D (diode current)', val: fmt(Id, 'A'), color: d.color },
              { label: 'Series R', val: R + ' Ω', color: '#f87171' },
              { label: 'V_R = I_D × R', val: fmt(Id * R, 'V'), color: '#f87171' },
              { label: 'Vs required', val: fmt(Vs_needed, 'V'), color: '#fbbf24' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: t.sub }}>{row.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: row.color }}>{row.val}</span>
              </div>
            ))}
          </div>

          <label style={{ fontSize: 12, color: t.text, display: 'block', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, color: '#0ea5e9' }}>V_D: {vd.toFixed(3)}V</span>
            <input type="range" min={-d.Vz - 0.2} max={d.Vf + 0.3} step={0.005} value={vd}
              onChange={e => setVd(+e.target.value)}
              style={{ width: '100%', accentColor: '#0ea5e9', marginTop: 4 }} />
          </label>

          <label style={{ fontSize: 12, color: t.text, display: 'block' }}>
            <span style={{ fontWeight: 700, color: '#f87171' }}>Series R: {R} Ω</span>
            <input type="range" min={10} max={10000} step={10} value={R}
              onChange={e => setR(+e.target.value)}
              style={{ width: '100%', accentColor: '#f87171', marginTop: 4 }} />
          </label>

          <div style={{ marginTop: 12, background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 6 }}>Key properties</div>
            <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.6 }}>
              <div><strong style={{ color: t.text }}>Forward bias:</strong> V_D &gt; Vf → exponential I increase</div>
              <div><strong style={{ color: t.text }}>Reverse bias:</strong> V_D &lt; 0 → tiny leakage I_s</div>
              {type === 'Zener' && <div><strong style={{ color: '#10b981' }}>Zener: </strong> conducts at Vz = {d.Vz}V in reverse</div>}
              {type === 'LED' && <div><strong style={{ color: '#ef4444' }}>LED: </strong>emits light above ~{d.Vf}V forward bias</div>}
              {type === 'Schottky' && <div><strong style={{ color: '#f59e0b' }}>Schottky: </strong>metal-semiconductor junction, fast switching</div>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 14px', border: `1px solid ${t.border}` }}>
        <strong style={{ color: t.text }}>Shockley equation:</strong> I_D = Is × (e^(V_D/Vt) − 1), where Vt ≈ 26mV at room temperature and Is is the saturation current. Below Vf, exponential growth is slow. Above Vf, current rises steeply — a small voltage increase causes a large current increase. Always use a series resistor to limit current.
      </div>
    </div>
  );
}
