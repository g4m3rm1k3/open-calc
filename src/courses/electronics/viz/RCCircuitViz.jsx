import { useState, useEffect, useRef } from 'react';

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
    grid:   dark ? '#1e293b' : '#e5e7eb',
  };
}

const fmt = (n, unit) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M${unit}`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}k${unit}`;
  if (n >= 1) return `${n.toFixed(2)}${unit}`;
  if (n >= 1e-3) return `${(n * 1e3).toFixed(2)}m${unit}`;
  if (n >= 1e-6) return `${(n * 1e6).toFixed(2)}μ${unit}`;
  return `${(n * 1e9).toFixed(2)}n${unit}`;
};

export default function RCCircuitViz() {
  const dark = useDark();
  const t = makeT(dark);

  const [R, setR] = useState(10000);    // 10kΩ
  const [C, setC] = useState(100e-6);   // 100μF
  const [Vs, setVs] = useState(12);
  const [phase, setPhase] = useState('charge'); // 'charge' | 'discharge'
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const animRef = useRef(null);
  const startRef = useRef(null);

  const tau = R * C;

  // Animated time 0..5τ
  useEffect(() => {
    if (!running) return;
    let start = null;
    const duration = 5 * tau * 1000; // ms
    const animate = ts => {
      if (!start) { start = ts; startRef.current = ts; }
      const elapsed = (ts - start) / 1000; // seconds
      if (elapsed < 5 * tau) {
        setTime(elapsed);
        animRef.current = requestAnimationFrame(animate);
      } else {
        setTime(5 * tau);
        setRunning(false);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, R, C]);

  const restart = () => { setTime(0); setRunning(true); };

  // Voltage across capacitor at time t
  const vc = phase === 'charge'
    ? Vs * (1 - Math.exp(-time / tau))
    : Vs * Math.exp(-time / tau);

  const vr = Vs - vc;
  const current = vr / R;

  // SVG plot
  const W = 380, H = 130, padX = 40, padY = 20;
  const plotW = W - 2 * padX, plotH = H - 2 * padY;
  const steps = 200;
  const maxT = 5 * tau;

  const curvePath = () => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const tp = (i / steps) * maxT;
      const vc_t = phase === 'charge'
        ? Vs * (1 - Math.exp(-tp / tau))
        : Vs * Math.exp(-tp / tau);
      const x = padX + (i / steps) * plotW;
      const y = padY + plotH - (vc_t / Vs) * plotH;
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const dotX = padX + (Math.min(time, maxT) / maxT) * plotW;
  const dotY = padY + plotH - (vc / Vs) * plotH;

  // τ marker positions
  const tauMarkers = [1, 2, 3, 4, 5].map(n => padX + (n / 5) * plotW);
  const tauValues = [0.632, 0.865, 0.950, 0.982, 0.993];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>RC Circuit — Time Constant</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {['charge', 'discharge'].map(p => (
            <button key={p} onClick={() => { setPhase(p); restart(); }}
              style={{ padding: '4px 10px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', borderColor: phase === p ? '#6366f1' : t.fence, background: phase === p ? (dark ? '#1e1b4b' : '#ede9fe') : 'transparent', color: phase === p ? '#a5b4fc' : t.sub }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <button onClick={restart}
            style={{ padding: '4px 10px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${t.fence}`, background: 'transparent', color: t.sub }}>
            ↺ Restart
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'R', val: fmt(R, 'Ω'), min: 1, max: 6, logMin: Math.log10(100), logMax: Math.log10(1e6),
            onChange: v => { setR(v); restart(); }, raw: R, color: '#f87171' },
          { label: 'C', val: fmt(C, 'F'), min: 1, max: 6, logMin: Math.log10(1e-9), logMax: Math.log10(1e-2),
            onChange: v => { setC(v); restart(); }, raw: C, color: '#60a5fa' },
          { label: 'Vs', val: `${Vs} V`, min: 1, max: 100, step: 0.5, value: Vs,
            onChange: v => { setVs(v); restart(); }, raw: Vs, color: '#fbbf24', linear: true },
        ].map(ctrl => (
          <div key={ctrl.label} style={{ flex: 1, minWidth: 100 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 10, color: t.sub }}>{ctrl.label}</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: ctrl.color }}>{ctrl.val}</span>
            </div>
            {ctrl.linear ? (
              <input type="range" min={1} max={100} step={0.5} value={ctrl.raw}
                onChange={e => ctrl.onChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: ctrl.color }} />
            ) : (
              <input type="range" min={0} max={1000} step={1}
                value={Math.round(((Math.log10(ctrl.raw) - ctrl.logMin) / (ctrl.logMax - ctrl.logMin)) * 1000)}
                onChange={e => {
                  const p = e.target.value / 1000;
                  ctrl.onChange(Math.pow(10, ctrl.logMin + p * (ctrl.logMax - ctrl.logMin)));
                }}
                style={{ width: '100%', accentColor: ctrl.color }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Plot */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Vc(t) — Capacitor Voltage
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            {/* Grid horizontals */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
              const y = padY + plotH - f * plotH;
              return <line key={f} x1={padX} y1={y} x2={padX + plotW} y2={y} stroke={t.grid} strokeWidth="1" />;
            })}
            {/* τ verticals */}
            {tauMarkers.map((x, i) => (
              <g key={i}>
                <line x1={x} y1={padY} x2={x} y2={padY + plotH} stroke={t.grid} strokeWidth="1" strokeDasharray="3,3" />
                <text x={x} y={padY + plotH + 12} textAnchor="middle" fontSize="8" fill={t.dim}>{i + 1}τ</text>
              </g>
            ))}
            {/* Axes */}
            <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke={t.fence} strokeWidth="1.5" />
            <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke={t.fence} strokeWidth="1.5" />
            {/* Y labels */}
            <text x={padX - 4} y={padY + 4} textAnchor="end" fontSize="8" fill={t.sub}>{Vs}V</text>
            <text x={padX - 4} y={padY + plotH + 4} textAnchor="end" fontSize="8" fill={t.sub}>0</text>
            {/* 63.2% line (1 tau value) */}
            <line x1={padX} y1={padY + plotH - 0.632 * plotH} x2={padX + plotW} y2={padY + plotH - 0.632 * plotH} stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" />
            <text x={padX + plotW + 2} y={padY + plotH - 0.632 * plotH + 4} fontSize="8" fill="#fbbf24">63.2%</text>
            {/* Curve */}
            <path d={curvePath()} fill="none" stroke="#6366f1" strokeWidth="2.5" />
            {/* Animated dot */}
            <circle cx={dotX} cy={dotY} r={5} fill="#6366f1" />
            <text x={dotX + 8} y={dotY - 4} fontSize="9" fill="#6366f1" fontWeight="700">{vc.toFixed(1)}V</text>
          </svg>

          {/* τ table */}
          <div style={{ background: t.card, borderRadius: 8, padding: 10, border: `1px solid ${t.border}`, marginTop: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.dim, marginBottom: 6 }}>Time constant values (charge)</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n, i) => (
                <div key={n} style={{ flex: 1, textAlign: 'center', background: time >= n * tau ? '#6366f120' : 'transparent', borderRadius: 6, padding: '4px 0', border: `1px solid ${time >= n * tau ? '#6366f1' : t.fence}` }}>
                  <div style={{ fontSize: 9, color: t.dim }}>{n}τ</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1' }}>{(tauValues[i] * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div>
          <div style={{ background: t.card, borderRadius: 10, padding: 14, border: `1px solid ${t.border}`, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 10 }}>Current values</div>
            {[
              { label: 'τ = R × C', val: fmt(tau, 's'), color: '#a78bfa' },
              { label: 'Time elapsed', val: fmt(time, 's'), color: t.text },
              { label: 'V_C (capacitor)', val: `${vc.toFixed(2)} V`, color: '#6366f1' },
              { label: 'V_R (resistor)', val: `${vr.toFixed(2)} V`, color: '#f87171' },
              { label: 'Current I', val: fmt(current, 'A'), color: '#10b981' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: t.sub }}>{row.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: row.color }}>{row.val}</span>
              </div>
            ))}
          </div>

          <div style={{ background: t.card, borderRadius: 10, padding: 14, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 8 }}>Industrial Applications</div>
            {[
              { title: 'Input debounce', desc: `τ=${fmt(tau, 's')} filters contact bounce on pushbuttons and limit switches` },
              { title: 'Soft-start', desc: 'Large C on VFD ramp circuit prevents inrush current' },
              { title: 'Power supply filter', desc: 'C across DC bus smooths rectified AC ripple' },
            ].map(item => (
              <div key={item.title} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{item.title}</div>
                <div style={{ fontSize: 10, color: t.sub }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
