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
  if (n >= 1) return `${n.toFixed(3)}${unit}`;
  if (n >= 1e-3) return `${(n * 1e3).toFixed(2)}m${unit}`;
  if (n >= 1e-6) return `${(n * 1e6).toFixed(2)}μ${unit}`;
  if (n >= 1e-9) return `${(n * 1e9).toFixed(2)}n${unit}`;
  return `${(n * 1e12).toFixed(2)}p${unit}`;
};

const TAU_PCT = [63.2, 86.5, 95.0, 98.2, 99.3];

export default function RLCircuitViz() {
  const dark = useDark();
  const t = makeT(dark);

  const [R, setR] = useState(100);
  const [L, setL] = useState(0.1);      // 100mH
  const [Vs, setVs] = useState(12);
  const [phase, setPhase] = useState('energize');
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const animRef = useRef(null);
  const startRef = useRef(null);

  const tau = L / R;
  const iFinal = Vs / R;

  useEffect(() => {
    if (!running) return;
    let start = null;
    const animate = ts => {
      if (!start) { start = ts; startRef.current = ts; }
      const elapsed = (ts - start) / 1000;
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
  }, [running, R, L]);

  const restart = () => { setTime(0); setRunning(true); };

  const iL = phase === 'energize'
    ? iFinal * (1 - Math.exp(-time / tau))
    : iFinal * Math.exp(-time / tau);

  const vL = phase === 'energize'
    ? Vs * Math.exp(-time / tau)
    : -Vs * Math.exp(-time / tau);

  const vR = iL * R;

  const W = 380, H = 130, padX = 40, padY = 20;
  const plotW = W - 2 * padX, plotH = H - 2 * padY;
  const maxT = 5 * tau;

  const curvePath = () => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const tp = (i / 200) * maxT;
      const norm = phase === 'energize'
        ? (1 - Math.exp(-tp / tau))
        : Math.exp(-tp / tau);
      const x = padX + (i / 200) * plotW;
      const y = padY + plotH - norm * plotH;
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const normI = phase === 'energize'
    ? (1 - Math.exp(-Math.min(time, maxT) / tau))
    : Math.exp(-Math.min(time, maxT) / tau);
  const dotX = padX + (Math.min(time, maxT) / maxT) * plotW;
  const dotY = padY + plotH - normI * plotH;
  const tauMarkers = [1, 2, 3, 4, 5].map(n => padX + (n / 5) * plotW);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>RL Circuit — Time Constant</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {['energize', 'de-energize'].map(p => (
            <button key={p} onClick={() => { setPhase(p); restart(); }}
              style={{ padding: '4px 10px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                border: '1px solid', borderColor: phase === p ? '#10b981' : t.fence,
                background: phase === p ? (dark ? '#052e16' : '#dcfce7') : 'transparent',
                color: phase === p ? '#10b981' : t.sub }}>
              {p === 'energize' ? 'Energize' : 'De-energize'}
            </button>
          ))}
          <button onClick={restart}
            style={{ padding: '4px 10px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${t.fence}`, background: 'transparent', color: t.sub }}>
            ↺ Restart
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'R', val: fmt(R, 'Ω'), logMin: Math.log10(1), logMax: Math.log10(1e5),
            onChange: v => { setR(v); restart(); }, raw: R, color: '#f87171' },
          { label: 'L', val: fmt(L, 'H'), logMin: Math.log10(1e-6), logMax: Math.log10(10),
            onChange: v => { setL(v); restart(); }, raw: L, color: '#60a5fa' },
          { label: 'Vs', val: `${Vs}V`, linear: true,
            onChange: v => { setVs(v); restart(); }, raw: Vs, color: '#fbbf24' },
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
            I_L(t) — Inductor Current
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
              const y = padY + plotH - f * plotH;
              return <line key={f} x1={padX} y1={y} x2={padX + plotW} y2={y} stroke={t.grid} strokeWidth="1" />;
            })}
            {tauMarkers.map((x, i) => (
              <g key={i}>
                <line x1={x} y1={padY} x2={x} y2={padY + plotH} stroke={t.grid} strokeWidth="1" strokeDasharray="3,3" />
                <text x={x} y={padY + plotH + 12} textAnchor="middle" fontSize="8" fill={t.dim}>{i + 1}τ</text>
              </g>
            ))}
            <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke={t.fence} strokeWidth="1.5" />
            <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke={t.fence} strokeWidth="1.5" />
            <text x={padX - 4} y={padY + 4} textAnchor="end" fontSize="8" fill={t.sub}>{fmt(iFinal, 'A')}</text>
            <text x={padX - 4} y={padY + plotH + 4} textAnchor="end" fontSize="8" fill={t.sub}>0</text>
            <line x1={padX} y1={padY + plotH - 0.632 * plotH} x2={padX + plotW} y2={padY + plotH - 0.632 * plotH}
              stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" />
            <text x={padX + plotW + 2} y={padY + plotH - 0.632 * plotH + 4} fontSize="8" fill="#fbbf24">63.2%</text>
            <path d={curvePath()} fill="none" stroke="#10b981" strokeWidth="2.5" />
            <circle cx={dotX} cy={dotY} r={5} fill="#10b981" />
            <text x={dotX + 8} y={dotY - 4} fontSize="9" fill="#10b981" fontWeight="700">{fmt(iL, 'A')}</text>
          </svg>

          {/* τ table */}
          <div style={{ background: t.card, borderRadius: 8, padding: 10, border: `1px solid ${t.border}`, marginTop: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.dim, marginBottom: 6 }}>τ milestones (energize)</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n, i) => (
                <div key={n} style={{ flex: 1, textAlign: 'center',
                  background: time >= n * tau ? '#10b98120' : 'transparent', borderRadius: 6, padding: '4px 0',
                  border: `1px solid ${time >= n * tau ? '#10b981' : t.fence}` }}>
                  <div style={{ fontSize: 9, color: t.dim }}>{n}τ</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>{TAU_PCT[i]}%</div>
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
              { label: 'τ = L / R', val: fmt(tau, 's'), color: '#a78bfa' },
              { label: 'I_final = Vs/R', val: fmt(iFinal, 'A'), color: t.sub },
              { label: 'Time elapsed', val: fmt(time, 's'), color: t.text },
              { label: 'I_L (inductor)', val: fmt(iL, 'A'), color: '#10b981' },
              { label: 'V_L (inductor)', val: `${vL.toFixed(2)}V`, color: '#60a5fa' },
              { label: 'V_R (resistor)', val: `${vR.toFixed(2)}V`, color: '#f87171' },
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
              { title: 'Relay coil', desc: `τ = ${fmt(tau, 's')} — inductor delays current, causing relay pull-in delay` },
              { title: 'Motor winding', desc: 'High inductance → VFD must ramp slowly to avoid inrush overcurrent' },
              { title: 'Flyback diode', desc: 'De-energize: V_L reverses as back-EMF spike — always protect PLC outputs' },
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
