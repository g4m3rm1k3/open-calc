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
  if (a >= 1) return `${n.toFixed(3)}${unit}`;
  if (a >= 1e-3) return `${(n * 1e3).toFixed(2)}m${unit}`;
  if (a >= 1e-6) return `${(n * 1e6).toFixed(2)}μ${unit}`;
  return `0 ${unit}`;
};

const BJT_HFE = 100;
const VT = 0.026;
const IS = 1e-14;

const MODES = ['BJT Output Curves', 'MOSFET Transfer'];

export default function TransistorViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState(params.mode ?? 'BJT Output Curves');
  const [Ib, setIb] = useState(0.05); // mA
  const [Vce, setVce] = useState(5);
  const [Vcc, setVcc] = useState(12);
  const [Rc, setRc] = useState(1000);
  // MOSFET params
  const [Vgs, setVgs] = useState(3.5);
  const [Vth, setVth] = useState(2.0);
  const [Kn, setKn] = useState(2); // mA/V²

  const IbCurves = [0.01, 0.02, 0.05, 0.1, 0.2]; // mA

  const bjt_Ic = (ib_mA, vce) => {
    const ic = BJT_HFE * ib_mA * 1e-3;
    if (vce < 0.2) return ic * (vce / 0.2); // saturation region
    return ic * (1 + vce * 0.01); // slight slope (Early effect)
  };

  // MOSFET transfer characteristic (saturation region)
  const mos_Id = (vgs) => {
    if (vgs <= Vth) return 0;
    return (Kn / 2) * (vgs - Vth) ** 2; // mA
  };

  // Operating point
  const Q_Ic = bjt_Ic(Ib, Vce); // A
  const Q_load_Ic = (Vcc - Vce) / Rc; // load line
  // Load line intersection: find Vce where Ic(load) = Ic(BJT)
  // Ic = hFE * Ib, Ic = (Vcc - Vce)/Rc → Vce_Q = Vcc - Ic*Rc
  const Ic_Q = BJT_HFE * Ib * 1e-3;
  const Vce_Q = Math.max(0.2, Vcc - Ic_Q * Rc);

  // SVG dimensions
  const W = 380, H = 200, px = 40, py = 20, pw = W - px - 20, ph = H - py - 30;
  const Vce_max = Vcc + 1;
  const Ic_max = (Vcc / Rc) * 1.1;

  const xV = v => px + (v / Vce_max) * pw;
  const yI = i => py + ph - (i / Ic_max) * ph;

  const loadLineX1 = xV(0), loadLineY1 = yI(Vcc / Rc);
  const loadLineX2 = xV(Vcc), loadLineY2 = yI(0);

  // MOSFET curve
  const mosW = 380, mosH = 200;
  const vgs_max = Vth + 6;
  const id_max = mos_Id(vgs_max) * 1.1;
  const xVgs = v => px + ((v) / vgs_max) * (mosW - px - 20);
  const yId = i => py + (mosH - py - 30) - (i / Math.max(id_max, 0.1)) * (mosH - py - 30);

  const mosPoints = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => {
      const v = (i / 199) * vgs_max;
      const id = mos_Id(v);
      return `${i === 0 ? 'M' : 'L'}${xVgs(v).toFixed(1)},${yId(id).toFixed(1)}`;
    }).join(' ');
  }, [Vth, Kn]);

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#a855f7' }}>Transistor Characteristics</span>
        {MODES.map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: mode === m ? '#a855f7' : t.fence,
              background: mode === m ? '#a855f722' : 'transparent',
              color: mode === m ? '#a855f7' : t.sub }}>
            {m}
          </button>
        ))}
      </div>

      {mode === 'BJT Output Curves' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16 }}>
          {/* Output curves */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>
              BJT Output Curves — I_C vs V_CE for each I_B
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%"
              style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }}>
              {/* Axes */}
              <line x1={px} y1={py} x2={px} y2={py + ph} stroke={t.fence} strokeWidth={1.5} />
              <line x1={px} y1={py + ph} x2={px + pw} y2={py + ph} stroke={t.fence} strokeWidth={1.5} />
              {/* Grid */}
              {[0.25, 0.5, 0.75, 1].map(f => {
                const y = py + ph - f * ph;
                return <line key={f} x1={px} y1={y} x2={px + pw} y2={y} stroke={t.grid} strokeWidth={1} />;
              })}
              {/* Saturation region shading */}
              <rect x={px} y={py} width={xV(0.2) - px} height={ph} fill="#fbbf2415" />
              <text x={px + 4} y={py + 12} fontSize={7} fill="#fbbf24">Sat.</text>
              {/* IV curves for each Ib */}
              {IbCurves.map((ib, idx) => {
                const pts = Array.from({ length: 100 }, (_, i) => {
                  const v = (i / 99) * Vce_max;
                  const ic = bjt_Ic(ib, v);
                  return `${i === 0 ? 'M' : 'L'}${xV(v).toFixed(1)},${yI(ic).toFixed(1)}`;
                }).join(' ');
                const clr = `hsl(${260 + idx * 25}, 70%, 60%)`;
                const ic_label = bjt_Ic(ib, Vce_max * 0.9);
                return (
                  <g key={ib}>
                    <path d={pts} fill="none" stroke={clr} strokeWidth={1.8} />
                    <text x={px + pw - 2} y={yI(ic_label) - 3} fontSize={8} fill={clr} textAnchor="end">
                      I_B={ib}mA
                    </text>
                  </g>
                );
              })}
              {/* Load line */}
              <line x1={loadLineX1} y1={loadLineY1} x2={loadLineX2} y2={loadLineY2}
                stroke="#fbbf24" strokeWidth={2} strokeDasharray="6,3" />
              {/* Q point */}
              <circle cx={xV(Vce_Q)} cy={yI(Ic_Q)} r={6} fill="#10b981" />
              <text x={xV(Vce_Q) + 8} y={yI(Ic_Q) - 6} fontSize={9} fill="#10b981" fontWeight={700}>Q</text>
              {/* Axis labels */}
              <text x={px + pw / 2} y={H - 4} textAnchor="middle" fontSize={8} fill={t.sub}>V_CE (V)</text>
              <text x={8} y={py + ph / 2} textAnchor="middle" fontSize={8} fill={t.sub}
                transform={`rotate(-90, 8, ${py + ph / 2})`}>I_C</text>
              {/* V_CC, I_CC labels */}
              <text x={loadLineX2 + 2} y={loadLineY2 + 10} fontSize={8} fill="#fbbf24">{Vcc}V</text>
              <text x={loadLineX1 + 4} y={loadLineY1 - 4} fontSize={8} fill="#fbbf24">
                {fmt(Vcc / Rc, 'A')}
              </text>
            </svg>
          </div>

          <div>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 8 }}>Q-Point Analysis</div>
              {[
                { label: 'h_FE (β)', val: BJT_HFE.toString(), color: '#a855f7' },
                { label: 'I_B', val: Ib + ' mA', color: '#6366f1' },
                { label: 'I_C = β × I_B', val: fmt(Ic_Q, 'A'), color: '#10b981' },
                { label: 'V_CE', val: Vce_Q.toFixed(2) + ' V', color: '#0ea5e9' },
                { label: 'V_CC', val: Vcc + ' V', color: '#fbbf24' },
                { label: 'R_C', val: Rc + ' Ω', color: '#f87171' },
                { label: 'Region', val: Vce_Q < 0.3 ? 'Saturation' : Vce_Q > Vcc * 0.9 ? 'Cutoff' : 'Active', color: '#10b981' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: t.sub }}>{row.label}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>
            {[
              { label: 'I_B (mA)', val: Ib, set: setIb, min: 0.001, max: 0.3, step: 0.001, color: '#6366f1' },
              { label: `V_CC: ${Vcc}V`, val: Vcc, set: setVcc, min: 1, max: 30, step: 0.5, color: '#fbbf24', linear: true },
              { label: `R_C: ${Rc}Ω`, val: Rc, set: setRc, min: 100, max: 10000, step: 100, color: '#f87171', linear: true },
            ].map(c => (
              <label key={c.label} style={{ fontSize: 12, color: t.text, display: 'block', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: c.color }}>{c.label}: {c.linear ? '' : c.val + ' mA'}</span>
                <input type="range" min={c.min} max={c.max} step={c.step} value={c.val}
                  onChange={e => c.set(+e.target.value)}
                  style={{ width: '100%', accentColor: c.color, marginTop: 4 }} />
              </label>
            ))}
          </div>
        </div>
      ) : (
        // MOSFET transfer curve
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 6 }}>
              N-MOSFET Transfer Curve — I_D vs V_GS
            </div>
            <svg viewBox={`0 0 ${mosW} ${mosH}`} width="100%"
              style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }}>
              <line x1={px} y1={py} x2={px} y2={py + mosH - py - 30} stroke={t.fence} strokeWidth={1.5} />
              <line x1={px} y1={mosH - 30} x2={mosW - 20} y2={mosH - 30} stroke={t.fence} strokeWidth={1.5} />
              {/* Threshold voltage line */}
              <line x1={xVgs(Vth)} y1={py} x2={xVgs(Vth)} y2={mosH - 30}
                stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
              <text x={xVgs(Vth) + 4} y={py + 12} fontSize={8} fill="#f59e0b">V_th={Vth.toFixed(1)}V</text>
              {/* Off region shading */}
              <rect x={px} y={py} width={xVgs(Vth) - px} height={mosH - py - 30} fill="#ef444415" />
              <text x={px + 4} y={mosH - 35} fontSize={7} fill="#ef4444">OFF</text>
              {/* Transfer curve */}
              <path d={mosPoints} fill="none" stroke="#a855f7" strokeWidth={2.5} />
              {/* Operating point */}
              <circle cx={xVgs(Vgs)} cy={yId(mos_Id(Vgs))} r={6} fill="#10b981" />
              <text x={xVgs(Vgs) + 8} y={yId(mos_Id(Vgs)) - 6} fontSize={9} fill="#10b981" fontWeight={700}>Q</text>
              {/* Labels */}
              <text x={(px + mosW - 20) / 2} y={mosH - 4} textAnchor="middle" fontSize={8} fill={t.sub}>V_GS (V)</text>
              <text x={8} y={(py + mosH - 30) / 2} textAnchor="middle" fontSize={8} fill={t.sub}
                transform={`rotate(-90, 8, ${(py + mosH - 30) / 2})`}>I_D</text>
            </svg>
          </div>
          <div>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 8 }}>MOSFET Operating Point</div>
              {[
                { label: 'V_th (threshold)', val: Vth.toFixed(2) + ' V', color: '#f59e0b' },
                { label: 'V_GS', val: Vgs.toFixed(2) + ' V', color: '#a855f7' },
                { label: 'I_D', val: fmt(mos_Id(Vgs) * 1e-3, 'A'), color: '#10b981' },
                { label: 'State', val: Vgs <= Vth ? 'OFF (Cutoff)' : 'ON (Active)', color: Vgs <= Vth ? '#ef4444' : '#10b981' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: t.sub }}>{row.label}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>
            {[
              { label: `V_GS: ${Vgs.toFixed(2)}V`, val: Vgs, set: setVgs, min: 0, max: Vth + 6, step: 0.05, color: '#a855f7' },
              { label: `V_th: ${Vth.toFixed(2)}V`, val: Vth, set: setVth, min: 0.5, max: 5, step: 0.1, color: '#f59e0b' },
              { label: `Kn: ${Kn} mA/V²`, val: Kn, set: setKn, min: 0.5, max: 10, step: 0.5, color: '#6366f1' },
            ].map(c => (
              <label key={c.label} style={{ fontSize: 12, color: t.text, display: 'block', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: c.color }}>{c.label}</span>
                <input type="range" min={c.min} max={c.max} step={c.step} value={c.val}
                  onChange={e => c.set(+e.target.value)}
                  style={{ width: '100%', accentColor: c.color, marginTop: 4 }} />
              </label>
            ))}
            <div style={{ fontSize: 10, color: t.sub, background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: 10, marginTop: 4 }}>
              <strong style={{ color: t.text }}>MOSFET equation (saturation):</strong>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#a855f7', marginTop: 4 }}>
                I_D = (Kn/2)(V_GS − V_th)²
              </div>
              <div style={{ marginTop: 4 }}>Gate controls current — no gate current flows (high input impedance, unlike BJT).</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
