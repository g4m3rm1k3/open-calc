import { useState, useEffect, useRef, useMemo } from 'react';

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
    grid:   dark ? '#1e3a5f' : '#e0e7ef',
  };
}

const COMPONENTS = {
  R:   { label: 'Resistor (R)',          phi: 0,      desc: 'Voltage and current are in phase (φ = 0°). V = IR — purely resistive, no energy storage.' },
  L:   { label: 'Inductor (L)',          phi: 90,     desc: 'Voltage leads current by 90° (current lags). V = jXL × I. Energy stored in magnetic field.' },
  C:   { label: 'Capacitor (C)',         phi: -90,    desc: 'Current leads voltage by 90° (voltage lags). I = jXC × V. Energy stored in electric field.' },
  RLC: { label: 'Series RLC (custom)',   phi: null,   desc: 'Adjust φ to see any phase relationship. Inductive (φ > 0): V leads. Capacitive (φ < 0): I leads.' },
};

export default function PhasorViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [comp, setComp] = useState(params.comp ?? 'R');
  const [customPhi, setCustomPhi] = useState(45);
  const [animT, setAnimT] = useState(0);
  const animRef = useRef(null);

  const phi = COMPONENTS[comp].phi !== null ? COMPONENTS[comp].phi : customPhi;
  const phiRad = (phi * Math.PI) / 180;

  useEffect(() => {
    let last = null;
    const step = ts => {
      if (!last) last = ts;
      setAnimT(t => (t + (ts - last) * 0.002) % (2 * Math.PI));
      last = ts;
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Phasor diagram dimensions
  const cx = 90, cy = 90, r = 66;

  // V phasor: fixed at 0° (reference)
  const vAng = 0;
  const vx = cx + r * Math.cos(vAng), vy = cy - r * Math.sin(vAng);

  // I phasor: shifted by -phi (lags if phi>0, leads if phi<0)
  const iAng = -phiRad;
  const ix = cx + r * Math.cos(iAng), iy = cy - r * Math.sin(iAng);

  // Waveform dimensions
  const wW = 320, wH = 130, wPad = 18;
  const wPlot = wW - 2 * wPad;
  const cycles = 2;
  const pts = 200;

  const vWave = useMemo(() => {
    return Array.from({ length: pts + 1 }, (_, i) => {
      const x = wPad + (i / pts) * wPlot;
      const y = wH / 2 - (wH / 2 - wPad) * Math.sin((i / pts) * cycles * 2 * Math.PI);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, []);

  const iWave = useMemo(() => {
    return Array.from({ length: pts + 1 }, (_, i) => {
      const x = wPad + (i / pts) * wPlot;
      const y = wH / 2 - (wH / 2 - wPad) * Math.sin((i / pts) * cycles * 2 * Math.PI - phiRad);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [phiRad]);

  // Animated dots on waveform
  const tFrac = (animT % (2 * Math.PI)) / (2 * Math.PI);
  const dotXw = wPad + (tFrac % (1 / cycles)) * cycles * wPlot;
  const vDotY = wH / 2 - (wH / 2 - wPad) * Math.sin(animT * cycles);
  const iDotY = wH / 2 - (wH / 2 - wPad) * Math.sin(animT * cycles - phiRad);

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header + component selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#f59e0b', marginRight: 4 }}>Phasor Diagram</span>
        {Object.entries(COMPONENTS).map(([key, c]) => (
          <button key={key} onClick={() => setComp(key)}
            style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: comp === key ? '#f59e0b' : t.fence,
              background: comp === key ? '#f59e0b22' : 'transparent',
              color: comp === key ? '#f59e0b' : t.sub }}>
            {key}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '196px 1fr', gap: 16 }}>
        {/* Phasor circle */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>Phasor Space</div>
          <svg width={180} height={180} style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }}>
            {/* Axes */}
            <line x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} stroke={t.fence} strokeWidth={1} />
            <line x1={cx} y1={cy - r - 10} x2={cx} y2={cy + r + 10} stroke={t.fence} strokeWidth={1} />
            {/* Reference circle */}
            <circle cx={cx} cy={cy} r={r} stroke={t.grid} strokeWidth={1} fill="none" strokeDasharray="4,3" />
            {/* Angle arc */}
            {phi !== 0 && (
              <path d={`M ${cx + 28} ${cy} A 28 28 0 ${Math.abs(phi) > 180 ? 1 : 0} ${phi < 0 ? 0 : 1} ${cx + 28 * Math.cos(-phiRad)} ${cy - 28 * Math.sin(-phiRad)}`}
                fill="none" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="3,2" />
            )}
            {phi !== 0 && (
              <text x={cx + 36} y={cy + (phi < 0 ? -10 : 14)} fontSize={9} fill="#a78bfa" fontWeight={700}>
                {phi > 0 ? 'φ=' : 'φ='}+{Math.abs(phi)}°
              </text>
            )}
            {/* V phasor (orange) */}
            <line x1={cx} y1={cy} x2={vx} y2={vy} stroke="#f59e0b" strokeWidth={3} />
            <polygon points={`${vx},${vy} ${vx - 8 * Math.cos(vAng) + 4 * Math.sin(vAng)},${vy + 8 * Math.sin(vAng) + 4 * Math.cos(vAng)} ${vx - 8 * Math.cos(vAng) - 4 * Math.sin(vAng)},${vy + 8 * Math.sin(vAng) - 4 * Math.cos(vAng)}`} fill="#f59e0b" />
            <text x={vx + 8} y={vy + 4} fontSize={11} fill="#f59e0b" fontWeight={700}>V</text>
            {/* I phasor (blue) */}
            <line x1={cx} y1={cy} x2={ix} y2={iy} stroke="#38bdf8" strokeWidth={3} />
            <polygon points={`${ix},${iy} ${ix - 8 * Math.cos(iAng) + 4 * Math.sin(iAng)},${iy + 8 * Math.sin(iAng) + 4 * Math.cos(iAng)} ${ix - 8 * Math.cos(iAng) - 4 * Math.sin(iAng)},${iy + 8 * Math.sin(iAng) - 4 * Math.cos(iAng)}`} fill="#38bdf8" />
            <text x={ix + 8} y={iy + 4} fontSize={11} fill="#38bdf8" fontWeight={700}>I</text>
            {/* Origin dot */}
            <circle cx={cx} cy={cy} r={3} fill={t.sub} />
            {/* Axis labels */}
            <text x={cx + r + 12} y={cy + 4} fontSize={8} fill={t.dim}>Re</text>
            <text x={cx + 2} y={cy - r - 12} fontSize={8} fill={t.dim}>Im</text>
          </svg>
          <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>● V (reference)</span>
            <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>● I</span>
          </div>
        </div>

        {/* Waveforms + description */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>Time-Domain Waveforms</div>
          <svg viewBox={`0 0 ${wW} ${wH}`} width="100%" style={{ display: 'block', background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}` }}>
            {/* Zero line */}
            <line x1={wPad} y1={wH / 2} x2={wPad + wPlot} y2={wH / 2} stroke={t.fence} strokeWidth={1} />
            {/* Cycle markers */}
            {[0.5, 1, 1.5, 2].map(n => {
              const x = wPad + (n / cycles) * wPlot;
              return <line key={n} x1={x} y1={wPad} x2={x} y2={wH - wPad} stroke={t.grid} strokeWidth={1} strokeDasharray="3,3" />;
            })}
            {/* Waveforms */}
            <path d={vWave} fill="none" stroke="#f59e0b" strokeWidth={2} />
            <path d={iWave} fill="none" stroke="#38bdf8" strokeWidth={2} />
            {/* Animated dots */}
            <circle cx={dotXw} cy={vDotY} r={4} fill="#f59e0b" />
            <circle cx={dotXw} cy={iDotY} r={4} fill="#38bdf8" />
            {/* Labels */}
            <text x={wPad + 4} y={wPad + 10} fontSize={9} fill="#f59e0b" fontWeight={700}>v(t)</text>
            <text x={wPad + 4} y={wPad + 22} fontSize={9} fill="#38bdf8" fontWeight={700}>i(t)</text>
            {/* Phase label */}
            {phi !== 0 && (
              <>
                <text x={wPad + wPlot - 8} y={wH - 4} textAnchor="end" fontSize={8} fill="#a78bfa">
                  φ = {phi > 0 ? 'I lags V' : 'I leads V'} by {Math.abs(phi)}°
                </text>
              </>
            )}
            {phi === 0 && (
              <text x={wPad + wPlot - 8} y={wH - 4} textAnchor="end" fontSize={8} fill="#10b981">In phase (φ = 0°)</text>
            )}
          </svg>

          {/* Custom φ slider for RLC mode */}
          {comp === 'RLC' && (
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 12, color: t.text, display: 'block' }}>
                <span style={{ fontWeight: 700, color: '#a78bfa' }}>Phase angle φ: {customPhi}°</span>
                <span style={{ fontSize: 10, color: t.sub }}>&nbsp; (+inductive / −capacitive)</span>
                <input type="range" min={-90} max={90} value={customPhi}
                  onChange={e => setCustomPhi(+e.target.value)}
                  style={{ width: '100%', accentColor: '#a78bfa', marginTop: 4 }} />
              </label>
            </div>
          )}

          {/* Description card */}
          <div style={{ marginTop: 10, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text, marginBottom: 4 }}>{COMPONENTS[comp].label}</div>
            <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.5 }}>{COMPONENTS[comp].desc}</div>
            <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 11, color: '#a78bfa' }}>
              {comp === 'R' && 'Z_R = R  |  φ = 0°  |  V = I·R'}
              {comp === 'L' && 'Z_L = jωL = jX_L  |  φ = +90°  |  V leads I'}
              {comp === 'C' && 'Z_C = 1/(jωC) = −jX_C  |  φ = −90°  |  I leads V'}
              {comp === 'RLC' && `Z = R + j(X_L − X_C)  |  φ = ${customPhi}°  |  |Z| = √(R² + X²)`}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 14px', border: `1px solid ${t.border}` }}>
        <strong style={{ color: t.text }}>Mnemonic:</strong> <em style={{ color: '#f59e0b' }}>ELI</em> (Voltage E leads Current I in inductors L) the <em style={{ color: '#38bdf8' }}>ICE</em> man (I leads E in capacitors C). Engineers worldwide use this to remember phase relationships.
      </div>
    </div>
  );
}
