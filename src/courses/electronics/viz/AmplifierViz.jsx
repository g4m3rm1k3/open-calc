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

const HFE = 100;
const Vt = 0.02585;

const CLASS_DATA = [
  { label: 'Class A',  angle: 360, maxEff: 25,   color: '#6366f1', desc: 'Full cycle, low distortion' },
  { label: 'Class B',  angle: 180, maxEff: 78.5, color: '#10b981', desc: 'Half cycle, push-pull pair' },
  { label: 'Class AB', angle: 200, maxEff: 60,   color: '#f59e0b', desc: 'Slightly >180°, low crossover' },
  { label: 'Class C',  angle: 90,  maxEff: 85,   color: '#ef4444', desc: '<180°, RF transmitters' },
];

function fmt2(n) { return n.toFixed(2); }
function fmtDb(gain) { return (20 * Math.log10(Math.abs(gain))).toFixed(1); }

export default function AmplifierViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState('ce');
  const [Ib_uA, setIb_uA] = useState(20);
  const [Rc, setRc] = useState(1000);
  const [VCC, setVCC] = useState(12);
  const [Vin_mV, setVin_mV] = useState(10);

  const Ib = Ib_uA * 1e-6;
  const Ic = HFE * Ib;
  const Vce = Math.max(0.1, VCC - Ic * Rc);
  const gm = Ic / Vt;
  const Av = -(gm * Rc);
  const Vin = Vin_mV * 1e-3;
  const Vout = Av * Vin;
  const Vout_clipped = Math.max(-(VCC - 0.2), Math.min(VCC - 0.2, Vout));
  const clipped = Math.abs(Vout) > Math.abs(Vout_clipped) + 0.01;

  // Load line: from (0, VCC/Rc) to (VCC, 0) on Ic-Vce axes
  // SVG dimensions
  const W = 380, H = 200;
  const mx = 50, my = 15, pw = W - mx - 15, ph = H - my - 30;

  const IcMax = VCC / Rc;
  const toX = (vce) => mx + (vce / VCC) * pw;
  const toY = (ic) => my + ph - (ic / IcMax) * ph;

  // Family of curves
  const curves = useMemo(() => {
    const ibs = [10e-6, 20e-6, 40e-6, 60e-6, 80e-6, 100e-6];
    return ibs.map(ib => {
      const pts = [];
      for (let vce = 0; vce <= VCC + 0.1; vce += VCC / 60) {
        const ic = Math.min(HFE * ib, (vce < 0.2 ? vce / 0.2 * HFE * ib : HFE * ib));
        pts.push(`${toX(vce).toFixed(1)},${toY(ic).toFixed(1)}`);
      }
      return { ib, path: 'M' + pts.join(' L') };
    });
  }, [VCC, Rc]);

  const dotX = toX(Vce);
  const dotY = toY(Ic);

  // Waveform SVG
  const WW = 340, WH = 110;
  const wPts = useMemo(() => {
    const inp = [], out = [];
    for (let i = 0; i <= 100; i++) {
      const phi = (i / 100) * 2 * Math.PI;
      const v_in = Vin * Math.sin(phi);
      const v_out = Math.max(-(VCC - 0.2), Math.min(VCC - 0.2, Av * v_in));
      const ix = 10 + (i / 100) * (WW - 20);
      inp.push(`${ix.toFixed(1)},${(WH / 2 - v_in * (WH * 10)).toFixed(1)}`);
      out.push(`${ix.toFixed(1)},${(WH / 2 - v_out * (WH / (2 * VCC) * 0.9)).toFixed(1)}`);
    }
    return { inp: 'M' + inp.join(' L'), out: 'M' + out.join(' L') };
  }, [Vin, Av, VCC]);

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1', alignSelf: 'center', marginRight: 4 }}>Amplifiers</span>
        {[['ce', 'CE Amplifier'], ['classes', 'Amplifier Classes']].map(([k, label]) => (
          <button key={k} onClick={() => setMode(k)}
            style={{ padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: mode === k ? '#6366f1' : t.fence,
              background: mode === k ? '#6366f122' : 'transparent',
              color: mode === k ? '#6366f1' : t.sub }}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'ce' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16 }}>
          <div>
            {/* Output curves */}
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 4 }}>BJT Output Characteristics (I_C vs V_CE)</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%"
              style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }}>
              {/* Axes */}
              <line x1={mx} y1={my} x2={mx} y2={my + ph + 5} stroke={t.fence} strokeWidth={1.5} />
              <line x1={mx - 5} y1={my + ph} x2={mx + pw} y2={my + ph} stroke={t.fence} strokeWidth={1.5} />
              {/* Axis labels */}
              <text x={mx + pw / 2} y={H - 2} textAnchor="middle" fontSize={8} fill={t.sub}>V_CE (V)</text>
              <text x={8} y={my + ph / 2} textAnchor="middle" fontSize={8} fill={t.sub} transform={`rotate(-90,8,${my + ph / 2})`}>I_C (A)</text>
              {/* Grid ticks */}
              {[...Array(5)].map((_, i) => {
                const v = (i + 1) * VCC / 5;
                return <g key={i}>
                  <line x1={toX(v)} y1={my + ph} x2={toX(v)} y2={my + ph + 4} stroke={t.fence} strokeWidth={1} />
                  <text x={toX(v)} y={my + ph + 12} textAnchor="middle" fontSize={7} fill={t.sub}>{v.toFixed(0)}</text>
                </g>;
              })}
              {/* Ic axis ticks */}
              {[...Array(4)].map((_, i) => {
                const ic = (i + 1) * IcMax / 4;
                return <g key={i}>
                  <line x1={mx - 4} y1={toY(ic)} x2={mx} y2={toY(ic)} stroke={t.fence} strokeWidth={1} />
                  <text x={mx - 6} y={toY(ic) + 3} textAnchor="end" fontSize={7} fill={t.sub}>{(ic * 1000).toFixed(0)}m</text>
                </g>;
              })}
              {/* Family of curves */}
              {curves.map((c, i) => (
                <path key={i} d={c.path} fill="none"
                  stroke={c.ib === Ib ? '#6366f1' : (dark ? '#334155' : '#cbd5e1')}
                  strokeWidth={c.ib === Ib ? 2.5 : 1}
                  opacity={c.ib === Ib ? 1 : 0.7} />
              ))}
              {/* Load line */}
              <line x1={toX(0)} y1={toY(IcMax)} x2={toX(VCC)} y2={toY(0)}
                stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="6,3" />
              {/* Q-point */}
              <circle cx={dotX} cy={dotY} r={6} fill="#10b981" />
              <text x={dotX + 8} y={dotY - 6} fontSize={8} fill="#10b981" fontWeight={700}>Q</text>
              <text x={dotX + 8} y={dotY + 8} fontSize={7} fill={t.sub}>{Vce.toFixed(2)}V</text>
            </svg>

            {/* Waveforms */}
            <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 4 }}>Signal Waveforms</div>
            <svg viewBox={`0 0 ${WW} ${WH}`} width="100%"
              style={{ background: t.svgBg, borderRadius: 8, border: `1px solid ${t.border}`, display: 'block' }}>
              <line x1={10} y1={WH / 2} x2={WW - 10} y2={WH / 2} stroke={t.fence} strokeWidth={1} />
              <path d={wPts.inp} fill="none" stroke="#0ea5e9" strokeWidth={1.5} />
              <path d={wPts.out} fill="none" stroke={clipped ? '#ef4444' : '#6366f1'} strokeWidth={1.5} />
              <text x={12} y={14} fontSize={8} fill="#0ea5e9">V_in ({fmt2(Vin_mV)}mV)</text>
              <text x={12} y={26} fontSize={8} fill={clipped ? '#ef4444' : '#6366f1'}>
                V_out {clipped ? '[CLIPPED]' : `(${fmt2(Vout * 1000)}mV)`}
              </text>
            </svg>
          </div>

          {/* Controls */}
          <div>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 10 }}>Q-Point</div>
              {[
                { label: 'I_B (base current)', val: `${Ib_uA} μA`, color: '#0ea5e9' },
                { label: 'I_C = hFE × I_B', val: `${(Ic * 1000).toFixed(2)} mA`, color: '#6366f1' },
                { label: 'V_CE', val: `${Vce.toFixed(3)} V`, color: '#10b981' },
                { label: 'g_m = I_C / V_T', val: `${(gm * 1000).toFixed(1)} mS`, color: '#f59e0b' },
                { label: 'A_v = −g_m R_C', val: `${Av.toFixed(1)}  (${fmtDb(Av)} dB)`, color: '#ef4444' },
                { label: 'V_out (small signal)', val: `${(Vout * 1000).toFixed(2)} mV`, color: clipped ? '#ef4444' : '#6366f1' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: t.sub }}>{row.label}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>

            {[
              { label: 'I_B', val: Ib_uA, set: setIb_uA, min: 5, max: 100, step: 5, unit: 'μA', color: '#0ea5e9' },
              { label: 'R_C', val: Rc, set: setRc, min: 100, max: 10000, step: 100, unit: 'Ω', color: '#f87171' },
              { label: 'V_CC', val: VCC, set: setVCC, min: 3, max: 24, step: 1, unit: 'V', color: '#fbbf24' },
              { label: 'V_in', val: Vin_mV, set: setVin_mV, min: 1, max: 200, step: 1, unit: 'mV', color: '#0ea5e9' },
            ].map(s => (
              <label key={s.label} style={{ fontSize: 12, color: t.text, display: 'block', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: s.color }}>{s.label}: {s.val}{s.unit}</span>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                  onChange={e => s.set(+e.target.value)}
                  style={{ width: '100%', accentColor: s.color, marginTop: 3 }} />
              </label>
            ))}
          </div>
        </div>
      )}

      {mode === 'classes' && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 12 }}>Amplifier Classes — Conduction Angle & Efficiency</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {CLASS_DATA.map(cls => {
              const W2 = 160, H2 = 120, cx = 80, cy = 70, r = 50;
              const angle = (cls.angle / 360) * 2 * Math.PI;
              const startAngle = -Math.PI / 2;
              const endAngle = startAngle + angle;
              const x1 = cx + r * Math.cos(startAngle);
              const y1 = cy + r * Math.sin(startAngle);
              const x2 = cx + r * Math.cos(endAngle);
              const y2 = cy + r * Math.sin(endAngle);
              const largeArc = cls.angle > 180 ? 1 : 0;
              const arcPath = `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`;
              return (
                <div key={cls.label} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg viewBox={`0 0 ${W2} ${H2}`} width={W2} height={H2} style={{ background: t.svgBg, borderRadius: 8, flexShrink: 0 }}>
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.fence} strokeWidth={1.5} />
                      <path d={arcPath} fill={cls.color} opacity={0.4} />
                      <path d={arcPath} fill="none" stroke={cls.color} strokeWidth={2} />
                      <text x={cx} y={H2 - 8} textAnchor="middle" fontSize={9} fill={t.sub}>{cls.angle}° conduction</text>
                    </svg>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: cls.color, marginBottom: 4 }}>{cls.label}</div>
                      <div style={{ fontSize: 11, color: t.text, marginBottom: 3 }}>Max η: <strong style={{ color: cls.color }}>{cls.maxEff}%</strong></div>
                      <div style={{ fontSize: 10, color: t.sub, lineHeight: 1.5 }}>{cls.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14, background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 6 }}>Key Principle</div>
            <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.7 }}>
              <strong style={{ color: t.text }}>Class A:</strong> transistor conducts full 360° — always on, lowest distortion, highest linearity, but wastes power as heat (max 25% eff).<br />
              <strong style={{ color: t.text }}>Class B:</strong> two transistors share the load, each conducting 180°. Efficient but crossover distortion at zero-crossing.<br />
              <strong style={{ color: t.text }}>Class AB:</strong> small idle current eliminates crossover distortion. Used in most audio power amplifiers.<br />
              <strong style={{ color: t.text }}>Class C:</strong> conduction &lt;180°, high distortion but &gt;80% efficient. Used with resonant tank circuits in RF transmitters.
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 14px', border: `1px solid ${t.border}` }}>
        <strong style={{ color: t.text }}>CE gain:</strong> A_v = −g_m × R_C, where g_m = I_C / V_T ≈ I_C / 26mV. Negative sign = 180° phase inversion. Higher I_C → higher g_m → more gain — but reduces headroom for output swing.
      </div>
    </div>
  );
}
