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
  const a = Math.abs(n);
  if (a >= 1e6) return `${(n / 1e6).toFixed(2)}M${unit}`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(2)}k${unit}`;
  if (a >= 1)   return `${n.toFixed(2)}${unit}`;
  if (a >= 1e-3) return `${(n * 1e3).toFixed(2)}m${unit}`;
  if (a >= 1e-6) return `${(n * 1e6).toFixed(2)}μ${unit}`;
  return `${(n * 1e9).toFixed(2)}n${unit}`;
};

const logSlider = (raw, min, max) => Math.round(((Math.log10(raw) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 1000);
const fromLogSlider = (p, min, max) => Math.pow(10, Math.log10(min) + (p / 1000) * (Math.log10(max) - Math.log10(min)));

const MODES = ['Series', 'Parallel'];

export default function ImpedanceViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState(params.mode ?? 'Series');
  const [R, setR]   = useState(100);
  const [L, setL]   = useState(0.01);   // 10mH
  const [C, setC]   = useState(100e-6); // 100μF
  const [f, setF]   = useState(60);
  const [Vs, setVs] = useState(120);

  const calc = useMemo(() => {
    const omega = 2 * Math.PI * f;
    const XL = omega * L;
    const XC = 1 / (omega * C);
    if (mode === 'Series') {
      const X = XL - XC;
      const Z = Math.sqrt(R * R + X * X);
      const phi = Math.atan2(X, R) * 180 / Math.PI;
      const I = Vs / Z;
      const VR = I * R, VL = I * XL, VC = I * XC;
      return { XL, XC, X, Z, phi, I, VR, VL, VC, mode: 'Series' };
    } else {
      // Parallel: admittances
      const G = 1 / R;
      const BL = 1 / XL;
      const BC = 1 / XC;
      const B = BC - BL;
      const Y = Math.sqrt(G * G + B * B);
      const Z = 1 / Y;
      const phi = -Math.atan2(B, G) * 180 / Math.PI;
      const I = Vs * Y;
      const IR = Vs / R, IL = Vs / XL, IC = Vs / XC;
      return { XL, XC, G, BL, BC, B, Y, Z, phi, I, IR, IL, IC, mode: 'Parallel' };
    }
  }, [mode, R, L, C, f, Vs]);

  // Impedance triangle SVG
  const svgW = 220, svgH = 180;
  const originX = 30, originY = 140;
  const maxLen = 130;
  const { X, Z, phi: phiDeg, XL, XC } = calc;
  const scale = maxLen / Math.max(Z, 1);
  const Rx = R * scale, Xx = X * scale, Zx = Z * scale;
  const tipX = originX + Rx;
  const tipY = originY - Xx;

  const phiLabel = phiDeg.toFixed(1);
  const isInductive = X > 0;
  const isCapacitive = X < 0;
  const isResonant = Math.abs(X) < R * 0.01;

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#0ea5e9' }}>AC Impedance</span>
        {MODES.map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: mode === m ? '#0ea5e9' : t.fence,
              background: mode === m ? '#0ea5e922' : 'transparent',
              color: mode === m ? '#0ea5e9' : t.sub }}>
            {m} RLC
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 16 }}>
        {/* Impedance triangle */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>
            {mode === 'Series' ? 'Impedance Triangle' : 'Admittance Triangle'}
          </div>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%"
            style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }}>
            {/* Axes */}
            <line x1={originX - 8} y1={originY} x2={svgW - 10} y2={originY} stroke={t.fence} strokeWidth={1} />
            <line x1={originX} y1={svgH - 10} x2={originX} y2={10} stroke={t.fence} strokeWidth={1} />
            <text x={svgW - 8} y={originY + 12} fontSize={8} fill={t.dim}>R</text>
            <text x={originX + 4} y={16} fontSize={8} fill={t.dim}>X</text>

            {/* Vertical leg (X) */}
            {!isResonant && (
              <line x1={tipX} y1={originY} x2={tipX} y2={tipY}
                stroke={isInductive ? '#f59e0b' : '#38bdf8'} strokeWidth={2} strokeDasharray="5,3" />
            )}
            {/* Horizontal leg (R) */}
            <line x1={originX} y1={originY} x2={tipX} y2={originY}
              stroke="#f87171" strokeWidth={2.5} />
            {/* Hypotenuse (Z) */}
            <line x1={originX} y1={originY} x2={tipX} y2={tipY}
              stroke="#0ea5e9" strokeWidth={3} />

            {/* Labels */}
            <text x={(originX + tipX) / 2} y={originY + 14} textAnchor="middle" fontSize={10} fill="#f87171" fontWeight={700}>
              R = {fmt(R, 'Ω')}
            </text>
            {!isResonant && (
              <text x={tipX + 6} y={(originY + tipY) / 2 + 4} fontSize={10} fill={isInductive ? '#f59e0b' : '#38bdf8'} fontWeight={700}>
                X{isInductive ? 'L' : 'C'} = {fmt(Math.abs(X), 'Ω')}
              </text>
            )}
            {/* Z label along hypotenuse */}
            {Zx > 20 && (
              <text x={(originX + tipX) / 2 - 12} y={(originY + tipY) / 2 - 6}
                fontSize={10} fill="#0ea5e9" fontWeight={700} transform={`rotate(${-Math.atan2(Xx, Rx) * 180 / Math.PI}, ${(originX + tipX) / 2}, ${(originY + tipY) / 2})`}>
                Z = {fmt(Z, 'Ω')}
              </text>
            )}

            {/* Angle arc */}
            {!isResonant && (
              <>
                <path d={`M ${originX + 22} ${originY} A 22 22 0 0 ${isInductive ? 1 : 0} ${originX + 22 * Math.cos(-phiDeg * Math.PI / 180)} ${originY - 22 * Math.sin(-phiDeg * Math.PI / 180)}`}
                  fill="none" stroke="#a78bfa" strokeWidth={1.5} />
                <text x={originX + 28} y={isInductive ? originY - 10 : originY + 14} fontSize={9} fill="#a78bfa" fontWeight={700}>
                  φ={phiLabel}°
                </text>
              </>
            )}
            {isResonant && (
              <text x={originX + Rx / 2} y={originY - 14} textAnchor="middle" fontSize={10} fill="#10b981" fontWeight={700}>
                RESONANCE — X=0, Z=R
              </text>
            )}

            {/* Tip dot */}
            <circle cx={tipX} cy={tipY} r={4} fill="#0ea5e9" />
          </svg>

          <div style={{ marginTop: 8, fontSize: 10, color: t.sub, lineHeight: 1.5 }}>
            {isInductive && '▲ Inductive: XL > XC, voltage leads current'}
            {isCapacitive && '▼ Capacitive: XC > XL, current leads voltage'}
            {isResonant && '◉ Resonance: XL = XC, Z is purely resistive (minimum for series)'}
          </div>
        </div>

        {/* Controls + values */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'R', val: fmt(R, 'Ω'), min: 1, max: 100e3, raw: R, set: setR, color: '#f87171' },
              { label: 'L', val: fmt(L, 'H'),  min: 100e-6, max: 10, raw: L, set: setL, color: '#f59e0b' },
              { label: 'C', val: fmt(C, 'F'),  min: 1e-9, max: 0.1, raw: C, set: setC, color: '#38bdf8' },
            ].map(ctrl => (
              <label key={ctrl.label} style={{ fontSize: 12, color: t.text }}>
                <span style={{ fontWeight: 700, color: ctrl.color }}>{ctrl.label}: {ctrl.val}</span>
                <input type="range" min={0} max={1000} value={logSlider(ctrl.raw, ctrl.min, ctrl.max)}
                  onChange={e => ctrl.set(fromLogSlider(+e.target.value, ctrl.min, ctrl.max))}
                  style={{ width: '100%', accentColor: ctrl.color, marginTop: 4 }} />
              </label>
            ))}
            <label style={{ fontSize: 12, color: t.text }}>
              <span style={{ fontWeight: 700, color: '#a78bfa' }}>f: {f < 1000 ? f.toFixed(0) + 'Hz' : (f / 1000).toFixed(2) + 'kHz'}</span>
              <input type="range" min={0} max={1000} value={logSlider(f, 1, 100000)}
                onChange={e => setF(fromLogSlider(+e.target.value, 1, 100000))}
                style={{ width: '100%', accentColor: '#a78bfa', marginTop: 4 }} />
            </label>
            <label style={{ fontSize: 12, color: t.text }}>
              <span style={{ fontWeight: 700, color: '#fbbf24' }}>Vs: {Vs}V</span>
              <input type="range" min={1} max={480} value={Vs} onChange={e => setVs(+e.target.value)}
                style={{ width: '100%', accentColor: '#fbbf24', marginTop: 4 }} />
            </label>
          </div>

          {/* Calculated values */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
            {(mode === 'Series' ? [
              { label: 'X_L = ωL',    val: fmt(calc.XL, 'Ω'), color: '#f59e0b' },
              { label: 'X_C = 1/ωC',  val: fmt(calc.XC, 'Ω'), color: '#38bdf8' },
              { label: 'X = XL−XC',   val: fmt(calc.X, 'Ω'),  color: isInductive ? '#f59e0b' : '#38bdf8' },
              { label: '|Z| = √R²+X²', val: fmt(calc.Z, 'Ω'), color: '#0ea5e9' },
              { label: 'φ = atan(X/R)', val: `${phiLabel}°`, color: '#a78bfa' },
              { label: 'I = Vs/Z',     val: fmt(calc.I, 'A'),  color: '#10b981' },
              { label: 'V_R',          val: fmt(calc.VR, 'V'), color: '#f87171' },
              { label: 'V_L',          val: fmt(calc.VL, 'V'), color: '#f59e0b' },
              { label: 'V_C',          val: fmt(calc.VC, 'V'), color: '#38bdf8' },
            ] : [
              { label: 'X_L',          val: fmt(calc.XL, 'Ω'), color: '#f59e0b' },
              { label: 'X_C',          val: fmt(calc.XC, 'Ω'), color: '#38bdf8' },
              { label: '|Z| = 1/Y',    val: fmt(calc.Z, 'Ω'),  color: '#0ea5e9' },
              { label: 'φ',            val: `${phiLabel}°`,    color: '#a78bfa' },
              { label: 'I_total',      val: fmt(calc.I, 'A'),  color: '#10b981' },
              { label: 'I_R',          val: fmt(calc.IR, 'A'), color: '#f87171' },
              { label: 'I_L',          val: fmt(calc.IL, 'A'), color: '#f59e0b' },
              { label: 'I_C',          val: fmt(calc.IC, 'A'), color: '#38bdf8' },
            ]).map((item, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '7px 10px', borderLeft: `4px solid ${item.color}` }}>
                <div style={{ fontSize: 9, color: t.dim, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: item.color }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
