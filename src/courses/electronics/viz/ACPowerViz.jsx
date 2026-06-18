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

const fmt = (n, unit) => {
  const a = Math.abs(n);
  if (a >= 1e6) return `${(n / 1e6).toFixed(2)}M${unit}`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(2)}k${unit}`;
  return `${n.toFixed(2)}${unit}`;
};

export default function ACPowerViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [Vrms, setVrms] = useState(120);
  const [Irms, setIrms] = useState(10);
  const [phiDeg, setPhiDeg] = useState(40);
  const [pfCorrect, setPfCorrect] = useState(false);
  const [animT, setAnimT] = useState(0);

  useEffect(() => {
    let last = null;
    const id = requestAnimationFrame(function step(ts) {
      if (!last) last = ts;
      setAnimT(t => (t + (ts - last) * 0.003) % (2 * Math.PI));
      last = ts;
      requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const phi = phiDeg * Math.PI / 180;
  const correctedPhi = pfCorrect ? 0 : phi;

  const S  = Vrms * Irms;
  const P  = S * Math.cos(phi);
  const Q  = S * Math.sin(phi);
  const PF = Math.cos(phi);

  const S2  = pfCorrect ? P : S;
  const Q2  = pfCorrect ? 0 : Q;
  const PF2 = pfCorrect ? 1 : PF;

  // Power triangle SVG
  const triW = 240, triH = 180;
  const ox = 24, oy = triH - 24;
  const maxS = 170;
  const scale = maxS / Math.max(S, 1);
  const Px = P * scale, Qy = Q * scale;

  // Waveform SVG
  const wW = 340, wH = 140, wPad = 18;
  const wPlot = wW - 2 * wPad;
  const nPts = 200;
  const cycles = 2;

  const wavePoints = useMemo(() => {
    const vPts = [], iPts = [], pPts = [];
    for (let i = 0; i <= nPts; i++) {
      const x = wPad + (i / nPts) * wPlot;
      const theta = (i / nPts) * cycles * 2 * Math.PI;
      const v = Math.sin(theta);
      const ic = Math.sin(theta - correctedPhi);
      const p = v * ic;
      vPts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(wH / 2 - (wH / 2 - wPad) * v).toFixed(1)}`);
      iPts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(wH / 2 - (wH / 2 - wPad) * ic).toFixed(1)}`);
      pPts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(wH / 2 - (wH / 2 - wPad) * p).toFixed(1)}`);
    }
    return { v: vPts.join(' '), i: iPts.join(' '), p: pPts.join(' ') };
  }, [correctedPhi]);

  // Animated dots
  const tFrac = (animT % (2 * Math.PI)) / (2 * Math.PI);
  const dotX = wPad + (tFrac % (1 / cycles)) * cycles * wPlot;
  const theta0 = animT * cycles;
  const vDotY = wH / 2 - (wH / 2 - wPad) * Math.sin(theta0);
  const iDotY = wH / 2 - (wH / 2 - wPad) * Math.sin(theta0 - correctedPhi);
  const pDotY = wH / 2 - (wH / 2 - wPad) * Math.sin(theta0) * Math.sin(theta0 - correctedPhi);

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#f59e0b' }}>AC Power Triangle</span>
        <button onClick={() => setPfCorrect(c => !c)}
          style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: '2px solid', borderColor: pfCorrect ? '#10b981' : t.fence,
            background: pfCorrect ? '#10b98122' : 'transparent',
            color: pfCorrect ? '#10b981' : t.sub }}>
          {pfCorrect ? '✓ PF Corrected (φ=0)' : 'Apply PF Correction'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 16 }}>
        {/* Power triangle */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>Power Triangle</div>
          <svg viewBox={`0 0 ${triW} ${triH}`} width="100%"
            style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }}>
            {/* Axes */}
            <line x1={ox - 8} y1={oy} x2={triW - 10} y2={oy} stroke={t.fence} strokeWidth={1} />
            <line x1={ox} y1={triH - 10} x2={ox} y2={10} stroke={t.fence} strokeWidth={1} />
            <text x={triW - 8} y={oy + 12} fontSize={8} fill={t.dim}>P (W)</text>
            <text x={ox + 4} y={16} fontSize={8} fill={t.dim}>Q (VAr)</text>

            {/* P leg (horizontal, green) */}
            <line x1={ox} y1={oy} x2={ox + Px} y2={oy} stroke="#10b981" strokeWidth={3} />
            {/* Q leg (vertical, amber) */}
            <line x1={ox + Px} y1={oy} x2={ox + Px} y2={oy - Qy} stroke="#f59e0b" strokeWidth={3} strokeDasharray={pfCorrect ? "0" : "none"} />
            {/* S hypotenuse (blue) */}
            <line x1={ox} y1={oy} x2={ox + Px} y2={oy - Qy} stroke="#0ea5e9" strokeWidth={3} />

            {/* Labels */}
            <text x={ox + Px / 2} y={oy + 14} textAnchor="middle" fontSize={10} fill="#10b981" fontWeight={700}>
              P = {fmt(P, 'W')}
            </text>
            {!pfCorrect && (
              <text x={ox + Px + 8} y={oy - Qy / 2 + 4} fontSize={10} fill="#f59e0b" fontWeight={700}>
                Q = {fmt(Q, 'VAr')}
              </text>
            )}
            <text x={(ox + ox + Px) / 2 - 12} y={(oy + oy - Qy) / 2 - 6}
              fontSize={10} fill="#0ea5e9" fontWeight={700}
              transform={`rotate(${-phiDeg}, ${(ox + ox + Px) / 2}, ${(oy + oy - Qy) / 2})`}>
              S = {fmt(S, 'VA')}
            </text>

            {/* Angle arc */}
            {!pfCorrect && phiDeg > 2 && (
              <>
                <path d={`M ${ox + 26} ${oy} A 26 26 0 0 1 ${ox + 26 * Math.cos(phi)} ${oy - 26 * Math.sin(phi)}`}
                  fill="none" stroke="#a78bfa" strokeWidth={1.5} />
                <text x={ox + 32} y={oy - 10} fontSize={9} fill="#a78bfa" fontWeight={700}>φ={phiDeg}°</text>
              </>
            )}
            {pfCorrect && (
              <text x={ox + Px / 2} y={oy - 12} textAnchor="middle" fontSize={9} fill="#10b981" fontWeight={700}>PF = 1.0 (unity)</text>
            )}

            {/* Tip dot */}
            <circle cx={ox + Px} cy={oy - Qy} r={4} fill="#0ea5e9" />
          </svg>

          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { label: 'P (Active)',     val: fmt(P, 'W'),      color: '#10b981', sub: 'Does real work' },
              { label: 'Q (Reactive)',   val: fmt(pfCorrect ? 0 : Q, 'VAr'), color: '#f59e0b', sub: 'Energy storage' },
              { label: 'S (Apparent)',   val: fmt(S, 'VA'),     color: '#0ea5e9', sub: 'Utility billing' },
              { label: 'PF = cos(φ)',    val: PF2.toFixed(3),   color: '#a78bfa', sub: pfCorrect ? 'Unity ✓' : 'Lagging' },
            ].map((item, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '6px 10px', borderLeft: `3px solid ${item.color}` }}>
                <div style={{ fontSize: 8, color: t.dim }}>{item.label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: item.color }}>{item.val}</div>
                <div style={{ fontSize: 8, color: t.sub }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Waveforms + controls */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>
            Instantaneous Waveforms v(t), i(t), p(t)
          </div>
          <svg viewBox={`0 0 ${wW} ${wH}`} width="100%"
            style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block', marginBottom: 12 }}>
            {/* Zero line */}
            <line x1={wPad} y1={wH / 2} x2={wPad + wPlot} y2={wH / 2} stroke={t.fence} strokeWidth={1} />
            {/* Cycle markers */}
            {[0.5, 1, 1.5, 2].map(n => {
              const x = wPad + (n / cycles) * wPlot;
              return <line key={n} x1={x} y1={wPad} x2={x} y2={wH - wPad} stroke={t.grid} strokeWidth={1} strokeDasharray="3,3" />;
            })}
            {/* Power shading */}
            <path d={wavePoints.p + ` L${wPad + wPlot},${wH / 2} L${wPad},${wH / 2} Z`}
              fill="#a78bfa" fillOpacity={0.12} />
            {/* Waveforms */}
            <path d={wavePoints.v} fill="none" stroke="#f59e0b" strokeWidth={2} />
            <path d={wavePoints.i} fill="none" stroke="#0ea5e9" strokeWidth={2} />
            <path d={wavePoints.p} fill="none" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4,2" />
            {/* Animated dots */}
            <circle cx={dotX} cy={vDotY} r={4} fill="#f59e0b" />
            <circle cx={dotX} cy={iDotY} r={4} fill="#0ea5e9" />
            <circle cx={dotX} cy={pDotY} r={3} fill="#a78bfa" />
            {/* Legend */}
            <text x={wPad + 4} y={wPad + 10} fontSize={9} fill="#f59e0b" fontWeight={700}>v(t)</text>
            <text x={wPad + 4} y={wPad + 22} fontSize={9} fill="#0ea5e9" fontWeight={700}>i(t)</text>
            <text x={wPad + 4} y={wPad + 34} fontSize={9} fill="#a78bfa" fontWeight={700}>p(t)</text>
          </svg>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'V_rms', val: `${Vrms}V`, set: setVrms, v: Vrms, min: 1, max: 480, color: '#f59e0b', step: 1 },
              { label: 'I_rms', val: `${Irms}A`, set: setIrms, v: Irms, min: 0.1, max: 100, color: '#0ea5e9', step: 0.1 },
            ].map(c => (
              <label key={c.label} style={{ fontSize: 12, color: t.text }}>
                <span style={{ fontWeight: 700, color: c.color }}>{c.label}: {c.val}</span>
                <input type="range" min={c.min} max={c.max} step={c.step} value={c.v}
                  onChange={e => c.set(+e.target.value)}
                  style={{ width: '100%', accentColor: c.color, marginTop: 4 }} />
              </label>
            ))}
            {!pfCorrect && (
              <label style={{ fontSize: 12, color: t.text, gridColumn: '1 / -1' }}>
                <span style={{ fontWeight: 700, color: '#a78bfa' }}>Phase angle φ: {phiDeg}° (lagging)</span>
                <input type="range" min={0} max={89} value={phiDeg}
                  onChange={e => setPhiDeg(+e.target.value)}
                  style={{ width: '100%', accentColor: '#a78bfa', marginTop: 4 }} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 14px', border: `1px solid ${t.border}` }}>
        <strong style={{ color: t.text }}>Why PF matters:</strong> Utilities must supply S (apparent) VA to deliver P (real) watts. Low PF means the utility supplies extra current for the same useful work, increasing line losses and requiring larger conductors. Industrial sites are penalized for PF &lt; 0.9. Capacitor banks cancel inductive reactive power Q, raising PF to near unity.
      </div>
    </div>
  );
}
