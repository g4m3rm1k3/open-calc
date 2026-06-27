import { useState, useEffect, useMemo } from 'react';

import { makeCircuitTokens } from '../../../utils/themeTokens';
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
    ...makeCircuitTokens(dark),

  };
}

const fmt = (n, unit) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M${unit}`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}k${unit}`;
  if (n >= 1)   return `${n.toFixed(2)}${unit}`;
  if (n >= 1e-3) return `${(n * 1e3).toFixed(2)}m${unit}`;
  return `${(n * 1e6).toFixed(2)}μ${unit}`;
};

const logSlider = (raw, min, max) => Math.round(((Math.log10(raw) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 1000);
const fromLogSlider = (p, min, max) => Math.pow(10, Math.log10(min) + (p / 1000) * (Math.log10(max) - Math.log10(min)));

const FREQS = 300;
const F_MIN = 10, F_MAX = 100000;

export default function ResonanceViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState(params.mode ?? 'Series');
  const [R, setR] = useState(50);
  const [L, setL] = useState(0.01);   // 10mH
  const [C, setC] = useState(10e-6);  // 10μF

  const { f0, Q, BW, fLow, fHigh, points, normMax } = useMemo(() => {
    const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
    const Q = (1 / R) * Math.sqrt(L / C);
    const BW = f0 / Q;
    const fLow  = f0 - BW / 2;
    const fHigh = f0 + BW / 2;

    const pts = Array.from({ length: FREQS }, (_, i) => {
      const logF = Math.log10(F_MIN) + (i / (FREQS - 1)) * (Math.log10(F_MAX) - Math.log10(F_MIN));
      const freq = Math.pow(10, logF);
      const omega = 2 * Math.PI * freq;
      const XL = omega * L, XC = 1 / (omega * C);
      let mag;
      if (mode === 'Series') {
        const Z = Math.sqrt(R * R + (XL - XC) ** 2);
        mag = 1 / Z; // current magnitude (∝ I = V/Z)
      } else {
        // Parallel: Z = 1/Y
        const G = 1 / R, BL = 1 / XL, BC = 1 / XC;
        const Y = Math.sqrt(G * G + (BC - BL) ** 2);
        mag = 1 / Y; // impedance magnitude
      }
      return { freq, logF, mag };
    });

    const normMax = Math.max(...pts.map(p => p.mag));
    return { f0, Q, BW, fLow, fHigh, points: pts, normMax };
  }, [mode, R, L, C]);

  // SVG dimensions
  const W = 520, H = 200, padX = 40, padY = 20;
  const plotW = W - padX - 20, plotH = H - padY - 28;

  const freqToX = f => padX + (Math.log10(f) - Math.log10(F_MIN)) / (Math.log10(F_MAX) - Math.log10(F_MIN)) * plotW;
  const magToY = m => padY + plotH - (m / normMax) * plotH;

  const curvePath = points.map((p, i) => {
    const x = padX + (i / (FREQS - 1)) * plotW;
    const y = magToY(p.mag);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const xF0    = freqToX(f0);
  const xFLow  = freqToX(Math.max(fLow, F_MIN));
  const xFHigh = freqToX(Math.min(fHigh, F_MAX));
  const y3dB   = magToY(normMax / Math.sqrt(2));

  // Grid decade lines
  const decades = [10, 100, 1000, 10000, 100000];

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#10b981' }}>Resonance Explorer</span>
        {['Series', 'Parallel'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: mode === m ? '#10b981' : t.fence,
              background: mode === m ? '#10b98122' : 'transparent',
              color: mode === m ? '#10b981' : t.sub }}>
            {m} RLC
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: t.sub }}>
          {mode === 'Series' ? 'y-axis: Current magnitude (I ∝ 1/Z)' : 'y-axis: Impedance magnitude |Z|'}
        </span>
      </div>

      {/* Frequency response chart */}
      <div style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, marginBottom: 14 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          {/* Grid horizontals */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const y = padY + plotH - f * plotH;
            return <line key={f} x1={padX} y1={y} x2={padX + plotW} y2={y} stroke={t.grid} strokeWidth="1" />;
          })}
          {/* Decade vertical lines */}
          {decades.map(d => {
            const x = freqToX(d);
            return (
              <g key={d}>
                <line x1={x} y1={padY} x2={x} y2={padY + plotH} stroke={t.grid} strokeWidth="1" />
                <text x={x} y={padY + plotH + 14} textAnchor="middle" fontSize={8} fill={t.dim}>
                  {d >= 1000 ? d / 1000 + 'k' : d}
                </text>
              </g>
            );
          })}
          {/* Axes */}
          <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke={t.fence} strokeWidth="1.5" />
          <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke={t.fence} strokeWidth="1.5" />
          {/* Axis labels */}
          <text x={padX + plotW / 2} y={H - 2} textAnchor="middle" fontSize={8} fill={t.sub}>Frequency (Hz)</text>
          <text x={8} y={padY + plotH / 2 + 4} textAnchor="middle" fontSize={8} fill={t.sub} transform={`rotate(-90, 8, ${padY + plotH / 2})`}>
            {mode === 'Series' ? '|I|' : '|Z|'}
          </text>
          {/* −3dB line */}
          <line x1={padX} y1={y3dB} x2={padX + plotW} y2={y3dB} stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" />
          <text x={padX + plotW + 2} y={y3dB + 4} fontSize={8} fill="#fbbf24">−3dB</text>
          {/* Bandwidth shading */}
          {fLow > F_MIN && fHigh < F_MAX && (
            <rect x={xFLow} y={padY} width={xFHigh - xFLow} height={plotH} fill="#10b98110" />
          )}
          {/* Bandwidth markers */}
          {[xFLow, xFHigh].map((x, i) => x > padX && x < padX + plotW && (
            <line key={i} x1={x} y1={padY} x2={x} y2={padY + plotH} stroke="#10b981" strokeWidth="1" strokeDasharray="4,3" />
          ))}
          {/* Response curve */}
          <path d={curvePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
          {/* f0 marker */}
          {xF0 > padX && xF0 < padX + plotW && (
            <>
              <line x1={xF0} y1={padY} x2={xF0} y2={padY + plotH} stroke="#a78bfa" strokeWidth="2" />
              <circle cx={xF0} cy={padY + 4} r={4} fill="#a78bfa" />
              <text x={xF0 + 4} y={padY + 14} fontSize={9} fill="#a78bfa" fontWeight={700}>f₀</text>
            </>
          )}
        </svg>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'R', val: fmt(R, 'Ω'), min: 1, max: 100e3, raw: R, set: setR, color: '#f87171' },
          { label: 'L', val: fmt(L, 'H'), min: 100e-6, max: 1, raw: L, set: setL, color: '#f59e0b' },
          { label: 'C', val: fmt(C, 'F'), min: 1e-9, max: 0.01, raw: C, set: setC, color: '#38bdf8' },
        ].map(ctrl => (
          <label key={ctrl.label} style={{ fontSize: 12, color: t.text }}>
            <span style={{ fontWeight: 700, color: ctrl.color }}>{ctrl.label}: {ctrl.val}</span>
            <input type="range" min={0} max={1000} value={logSlider(ctrl.raw, ctrl.min, ctrl.max)}
              onChange={e => ctrl.set(fromLogSlider(+e.target.value, ctrl.min, ctrl.max))}
              style={{ width: '100%', accentColor: ctrl.color, marginTop: 4 }} />
          </label>
        ))}
      </div>

      {/* Result cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
        {[
          { label: 'f₀ = 1/(2π√LC)', val: fmt(f0, 'Hz'), color: '#a78bfa' },
          { label: 'Q = (1/R)√(L/C)', val: Q.toFixed(2), color: '#10b981' },
          { label: 'BW = f₀/Q',       val: fmt(BW, 'Hz'), color: '#fbbf24' },
          { label: 'f_low (−3dB)',     val: fmt(Math.max(fLow, 0), 'Hz'), color: '#64748b' },
          { label: 'f_high (−3dB)',    val: fmt(fHigh, 'Hz'), color: '#64748b' },
        ].map((item, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 12px', borderLeft: `4px solid ${item.color}` }}>
            <div style={{ fontSize: 9, color: t.dim, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: item.color }}>{item.val}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 14px', border: `1px solid ${t.border}` }}>
        {mode === 'Series'
          ? 'Series resonance: at f₀, XL = XC, they cancel. Z = R (minimum). Current is maximum. High Q → narrow, tall peak. Low R → high Q. Used in bandpass filters, radio tuners.'
          : 'Parallel resonance (tank circuit): at f₀, the LC tank presents maximum impedance to the source. Current circulates in the tank. Used in oscillators, notch filters, RF amplifier loads.'}
      </div>
    </div>
  );
}
