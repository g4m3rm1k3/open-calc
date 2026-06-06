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

export default function ACWaveformViz() {
  const dark = useDark();
  const t = makeT(dark);

  const [Vpeak, setVpeak] = useState(170);
  const [freq, setFreq] = useState(60);
  const [phaseShift, setPhaseShift] = useState(0);
  const [view, setView] = useState('wave'); // 'wave' | 'phasor' | 'power'
  const [time, setTime] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    let start = null;
    const animate = ts => {
      if (!start) start = ts;
      setTime(((ts - start) / 1000));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const Vrms = Vpeak / Math.sqrt(2);
  const T = 1 / freq;
  const omega = 2 * Math.PI * freq;

  // Current value of waveform
  const vNow = Vpeak * Math.sin(omega * time + (phaseShift * Math.PI / 180));
  const angle = (omega * time + (phaseShift * Math.PI / 180)) % (2 * Math.PI);

  // SVG helpers
  const W = 400, H = 140, pad = 30;
  const plotW = W - 2 * pad;
  const plotH = H - 2 * pad;
  const cycles = 2.5;
  const xScale = plotW / (cycles * T);
  const yScale = (plotH / 2) / Vpeak;
  const cx = pad, cy = H / 2;

  const wavePath = () => {
    const points = [];
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const tval = (i / steps) * cycles * T;
      const v = Vpeak * Math.sin(omega * tval + (phaseShift * Math.PI / 180));
      const x = cx + tval * xScale;
      const y = cy - v * yScale;
      points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  const rmsPath = () => {
    const y = cy - Vrms * yScale;
    return `M${cx},${y} L${cx + plotW},${y}`;
  };

  // Phasor
  const pR = 70;
  const px = 100, py = 100;
  const pAngle = -(angle - Math.PI / 2); // rotate for visual convention

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>AC Voltage — Waveform & Phasor</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {['wave', 'phasor', 'power'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', borderColor: view === v ? '#6366f1' : t.fence, background: view === v ? (dark ? '#1e1b4b' : '#ede9fe') : 'transparent', color: view === v ? '#a5b4fc' : t.sub }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'V_peak', val: `${Vpeak.toFixed(0)} V`, min: 10, max: 340, step: 1, value: Vpeak, onChange: setVpeak, color: '#f87171' },
          { label: 'Frequency', val: `${freq} Hz`, min: 10, max: 400, step: 1, value: freq, onChange: setFreq, color: '#60a5fa' },
          { label: 'Phase shift', val: `${phaseShift}°`, min: -180, max: 180, step: 5, value: phaseShift, onChange: setPhaseShift, color: '#a78bfa' },
        ].map(ctrl => (
          <div key={ctrl.label} style={{ flex: 1, minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 10, color: t.sub }}>{ctrl.label}</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: ctrl.color }}>{ctrl.val}</span>
            </div>
            <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.value}
              onChange={e => ctrl.onChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: ctrl.color }} />
          </div>
        ))}
      </div>

      {view === 'wave' && (
        <div style={{ padding: 16 }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
            {/* Grid */}
            {[-1, -0.5, 0, 0.5, 1].map(frac => {
              const y = cy - frac * Vpeak * yScale;
              return <line key={frac} x1={cx} y1={y} x2={cx + plotW} y2={y} stroke={t.grid} strokeWidth="1" />;
            })}
            {/* Zero axis */}
            <line x1={cx} y1={cy} x2={cx + plotW} y2={cy} stroke={t.fence} strokeWidth="1.5" />
            {/* Axes */}
            <line x1={cx} y1={pad} x2={cx} y2={H - pad} stroke={t.fence} strokeWidth="1.5" />
            {/* Waveform */}
            <path d={wavePath()} fill="none" stroke="#f87171" strokeWidth="2.5" />
            {/* RMS line */}
            <path d={rmsPath()} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6,4" />
            <text x={cx + plotW + 4} y={cy - Vrms * yScale + 4} fontSize="9" fill="#fbbf24">V_rms={Vrms.toFixed(1)}V</text>
            {/* Negative RMS line */}
            <line x1={cx} y1={cy + Vrms * yScale} x2={cx + plotW} y2={cy + Vrms * yScale} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6,4" />
            {/* Y labels */}
            <text x={cx - 4} y={cy - Vpeak * yScale + 4} textAnchor="end" fontSize="9" fill={t.sub}>+{Vpeak.toFixed(0)}</text>
            <text x={cx - 4} y={cy + 4} textAnchor="end" fontSize="9" fill={t.dim}>0</text>
            <text x={cx - 4} y={cy + Vpeak * yScale + 4} textAnchor="end" fontSize="9" fill={t.sub}>−{Vpeak.toFixed(0)}</text>
            {/* Time labels */}
            <text x={cx + xScale * T} y={H - pad + 14} textAnchor="middle" fontSize="9" fill={t.dim}>T={Math.round(T * 1000)}ms</text>
            {/* Instantaneous value dot */}
            {(() => {
              const tMod = time % (cycles * T);
              const xDot = cx + tMod * xScale;
              const yDot = cy - vNow * yScale;
              if (xDot >= cx && xDot <= cx + plotW) {
                return (
                  <>
                    <circle cx={xDot} cy={yDot} r="5" fill="#f87171" />
                    <text x={xDot + 8} y={yDot - 6} fontSize="9" fill="#f87171" fontWeight="700">{vNow.toFixed(0)}V</text>
                  </>
                );
              }
              return null;
            })()}
          </svg>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 8 }}>
            {[
              { label: 'V_peak', val: `${Vpeak.toFixed(0)} V`, color: '#f87171', desc: 'Maximum voltage' },
              { label: 'V_rms', val: `${Vrms.toFixed(1)} V`, color: '#fbbf24', desc: `Peak × (1/√2)` },
              { label: 'V_now', val: `${vNow.toFixed(1)} V`, color: '#10b981', desc: `Instantaneous` },
            ].map(item => (
              <div key={item.label} style={{ background: t.card, borderRadius: 8, padding: '8px 10px', border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 9, color: t.dim }}>{item.label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: item.color }}>{item.val}</div>
                <div style={{ fontSize: 9, color: t.sub }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'phasor' && (
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
          <div>
            <svg viewBox="0 0 200 200" width="200" height="200">
              <circle cx={px} cy={py} r={pR} fill="none" stroke={t.fence} strokeWidth="1" strokeDasharray="4,4" />
              <line x1={px - pR - 10} y1={py} x2={px + pR + 10} y2={py} stroke={t.fence} strokeWidth="1" />
              <line x1={px} y1={py - pR - 10} x2={px} y2={py + pR + 10} stroke={t.fence} strokeWidth="1" />
              {/* Phasor arrow */}
              <line x1={px} y1={py}
                x2={px + pR * Math.cos(pAngle)} y2={py + pR * Math.sin(pAngle)}
                stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
              <circle cx={px + pR * Math.cos(pAngle)} cy={py + pR * Math.sin(pAngle)} r="5" fill="#f87171" />
              <text x={px} y={py + pR + 22} textAnchor="middle" fontSize="9" fill={t.sub}>V_peak = {Vpeak.toFixed(0)} V</text>
              <text x={px} y={py + pR + 34} textAnchor="middle" fontSize="9" fill="#fbbf24">V_rms = {Vrms.toFixed(1)} V</text>
              {/* Instantaneous projection */}
              <line x1={px + pR * Math.cos(pAngle)} y1={py + pR * Math.sin(pAngle)}
                x2={px + pR * Math.cos(pAngle)} y2={py}
                stroke="#f8717140" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1={px + pR * Math.cos(pAngle)} y1={py}
                x2={px} y2={py}
                stroke="#f8717140" strokeWidth="1.5" strokeDasharray="3,3" />
            </svg>
          </div>
          <div>
            <div style={{ background: t.card, borderRadius: 10, padding: 14, border: `1px solid ${t.border}`, marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>What is a Phasor?</div>
              <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.6 }}>
                A phasor is a rotating vector. Its length is <strong style={{ color: '#f87171' }}>V_peak</strong>. As it rotates at frequency ω, its vertical projection onto the y-axis traces out the sine wave you see in the Wave view.
              </div>
            </div>
            <div style={{ background: t.card, borderRadius: 10, padding: 14, border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 8 }}>Live values</div>
              {[
                { k: 'Angle', v: `${((angle * 180 / Math.PI) % 360).toFixed(1)}°` },
                { k: 'V_instantaneous', v: `${vNow.toFixed(1)} V` },
                { k: 'V_rms', v: `${Vrms.toFixed(1)} V` },
                { k: 'Period T', v: `${(T * 1000).toFixed(2)} ms` },
                { k: 'ω (angular freq)', v: `${omega.toFixed(1)} rad/s` },
              ].map(row => (
                <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: t.sub }}>{row.k}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: t.text }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'power' && (
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 14, background: t.card, borderRadius: 10, padding: 14, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 10 }}>AC Power & RMS</div>
            <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.7 }}>
              AC voltage changes continuously. The RMS (Root Mean Square) value is the DC equivalent that delivers the <strong style={{ color: '#fbbf24' }}>same heating power</strong>. Standard US outlets: 120V RMS = 170V peak. European outlets: 230V RMS = 325V peak.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'V_rms formula', val: `V_peak / √2 = ${Vpeak.toFixed(0)} / 1.414 = ${Vrms.toFixed(1)} V`, color: '#fbbf24' },
              { label: 'V_peak from RMS', val: `V_rms × √2 = ${Vrms.toFixed(1)} × 1.414 = ${Vpeak.toFixed(0)} V`, color: '#f87171' },
              { label: 'Period (T)', val: `1 / f = 1 / ${freq} = ${(T * 1000).toFixed(2)} ms`, color: '#60a5fa' },
              { label: '60Hz AC cycle time', val: '16.67ms per cycle (US/Canada)', color: '#60a5fa' },
              { label: 'Pure resistive power', val: `P = V_rms² / R`, color: '#10b981' },
              { label: 'Example at 1kΩ', val: `P = ${Vrms.toFixed(1)}² / 1000 = ${(Vrms * Vrms / 1000).toFixed(2)} W`, color: '#10b981' },
            ].map(item => (
              <div key={item.label} style={{ background: t.card, borderRadius: 8, padding: '10px 12px', border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 9, color: t.dim, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: item.color }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
