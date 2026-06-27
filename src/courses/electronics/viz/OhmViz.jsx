import { useState, useEffect } from 'react';

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

const CLAMP_V = [0.1, 240];
const CLAMP_I = [0.001, 20];
const CLAMP_R = [1, 100000];
const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(2)}k` : n >= 1 ? n.toFixed(2) : n.toFixed(4);

function Slider({ label, unit, value, min, max, log, onChange, color }) {
  const dark = false; // handled by parent
  const pos = log
    ? (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))
    : (value - min) / (max - min);

  const handleChange = e => {
    const p = Number(e.target.value) / 1000;
    const v = log
      ? Math.pow(10, Math.log10(min) + p * (Math.log10(max) - Math.log10(min)))
      : min + p * (max - min);
    onChange(v);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color }}>{fmt(value)} {unit}</span>
      </div>
      <input type="range" min={0} max={1000} step={1}
        value={Math.round(pos * 1000)}
        onChange={handleChange}
        style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
      />
    </div>
  );
}

export default function OhmViz() {
  const dark = useDark();
  const t = makeT(dark);
  const [locked, setLocked] = useState('R'); // which value is computed
  const [V, setV] = useState(12);
  const [I, setI] = useState(0.12);
  const [R, setR] = useState(100);
  const [view, setView] = useState('ohm'); // 'ohm' | 'power'

  const P = V * I;

  const derive = (changed, val) => {
    if (changed === 'V') {
      setV(val);
      if (locked === 'I') setI(Math.max(CLAMP_I[0], Math.min(CLAMP_I[1], val / R)));
      if (locked === 'R') setR(Math.max(CLAMP_R[0], Math.min(CLAMP_R[1], val / I)));
    } else if (changed === 'I') {
      setI(val);
      if (locked === 'V') setV(Math.max(CLAMP_V[0], Math.min(CLAMP_V[1], val * R)));
      if (locked === 'R') setR(Math.max(CLAMP_R[0], Math.min(CLAMP_R[1], V / val)));
    } else {
      setR(val);
      if (locked === 'V') setV(Math.max(CLAMP_V[0], Math.min(CLAMP_V[1], val * I)));
      if (locked === 'I') setI(Math.max(CLAMP_I[0], Math.min(CLAMP_I[1], V / val)));
    }
  };

  // Water analogy descriptions
  const waterDesc = {
    V: 'Voltage is electrical pressure — like water pressure in a pipe.',
    I: 'Current is the flow rate of electrons — like gallons per minute.',
    R: 'Resistance opposes current flow — like a narrow pipe restricting water.',
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>Ohm's Law — V = I × R</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {['ohm', 'power'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', borderColor: view === v ? '#6366f1' : t.fence, background: view === v ? (dark ? '#1e1b4b' : '#ede9fe') : 'transparent', color: view === v ? '#a5b4fc' : t.sub }}>
              {v === 'ohm' ? "Ohm's Law" : 'Power'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left: sliders */}
        <div style={{ padding: 20, borderRight: `1px solid ${t.border}` }}>
          <div style={{ marginBottom: 14, fontSize: 11, color: t.sub }}>
            Lock one value to compute — the locked value is calculated from the other two.
          </div>

          {/* V slider */}
          <div style={{ background: t.card, borderRadius: 10, padding: 14, marginBottom: 10, border: locked === 'V' ? '2px solid #ef444460' : `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>Voltage (V)</div>
                  <div style={{ fontSize: 9, color: t.dim }}>Electrical pressure</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: '#f87171' }}>{fmt(V)}</span>
                <span style={{ fontSize: 11, color: t.sub }}>V</span>
                <button onClick={() => setLocked('V')}
                  style={{ padding: '3px 8px', borderRadius: 8, fontSize: 10, cursor: 'pointer', border: `1px solid ${locked === 'V' ? '#ef4444' : t.fence}`, background: locked === 'V' ? '#ef444420' : 'transparent', color: locked === 'V' ? '#ef4444' : t.dim }}>
                  {locked === 'V' ? '🔒 Computed' : 'Lock'}
                </button>
              </div>
            </div>
            <input type="range" min={0} max={1000} step={1}
              value={Math.round(((Math.log10(V) - Math.log10(CLAMP_V[0])) / (Math.log10(CLAMP_V[1]) - Math.log10(CLAMP_V[0]))) * 1000)}
              onChange={e => { const p = e.target.value / 1000; derive('V', Math.pow(10, Math.log10(CLAMP_V[0]) + p * (Math.log10(CLAMP_V[1]) - Math.log10(CLAMP_V[0])))); }}
              disabled={locked === 'V'}
              style={{ width: '100%', accentColor: '#f87171', opacity: locked === 'V' ? 0.4 : 1 }}
            />
          </div>

          {/* I slider */}
          <div style={{ background: t.card, borderRadius: 10, padding: 14, marginBottom: 10, border: locked === 'I' ? '2px solid #34d39960' : `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>〰</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>Current (I)</div>
                  <div style={{ fontSize: 9, color: t.dim }}>Electron flow rate</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: '#34d399' }}>{fmt(I)}</span>
                <span style={{ fontSize: 11, color: t.sub }}>A</span>
                <button onClick={() => setLocked('I')}
                  style={{ padding: '3px 8px', borderRadius: 8, fontSize: 10, cursor: 'pointer', border: `1px solid ${locked === 'I' ? '#10b981' : t.fence}`, background: locked === 'I' ? '#10b98120' : 'transparent', color: locked === 'I' ? '#10b981' : t.dim }}>
                  {locked === 'I' ? '🔒 Computed' : 'Lock'}
                </button>
              </div>
            </div>
            <input type="range" min={0} max={1000} step={1}
              value={Math.round(((Math.log10(I) - Math.log10(CLAMP_I[0])) / (Math.log10(CLAMP_I[1]) - Math.log10(CLAMP_I[0]))) * 1000)}
              onChange={e => { const p = e.target.value / 1000; derive('I', Math.pow(10, Math.log10(CLAMP_I[0]) + p * (Math.log10(CLAMP_I[1]) - Math.log10(CLAMP_I[0])))); }}
              disabled={locked === 'I'}
              style={{ width: '100%', accentColor: '#34d399', opacity: locked === 'I' ? 0.4 : 1 }}
            />
          </div>

          {/* R slider */}
          <div style={{ background: t.card, borderRadius: 10, padding: 14, border: locked === 'R' ? '2px solid #60a5fa60' : `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>⊘</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>Resistance (R)</div>
                  <div style={{ fontSize: 9, color: t.dim }}>Opposition to current</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: '#60a5fa' }}>{fmt(R)}</span>
                <span style={{ fontSize: 11, color: t.sub }}>Ω</span>
                <button onClick={() => setLocked('R')}
                  style={{ padding: '3px 8px', borderRadius: 8, fontSize: 10, cursor: 'pointer', border: `1px solid ${locked === 'R' ? '#3b82f6' : t.fence}`, background: locked === 'R' ? '#3b82f620' : 'transparent', color: locked === 'R' ? '#3b82f6' : t.dim }}>
                  {locked === 'R' ? '🔒 Computed' : 'Lock'}
                </button>
              </div>
            </div>
            <input type="range" min={0} max={1000} step={1}
              value={Math.round(((Math.log10(R) - Math.log10(CLAMP_R[0])) / (Math.log10(CLAMP_R[1]) - Math.log10(CLAMP_R[0]))) * 1000)}
              onChange={e => { const p = e.target.value / 1000; derive('R', Math.pow(10, Math.log10(CLAMP_R[0]) + p * (Math.log10(CLAMP_R[1]) - Math.log10(CLAMP_R[0])))); }}
              disabled={locked === 'R'}
              style={{ width: '100%', accentColor: '#60a5fa', opacity: locked === 'R' ? 0.4 : 1 }}
            />
          </div>
        </div>

        {/* Right: formula display + circuit or power */}
        <div style={{ padding: 20 }}>
          {view === 'ohm' && (
            <>
              {/* Triangle */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <svg viewBox="0 0 200 160" width="200" height="160" style={{ display: 'block', margin: '0 auto' }}>
                  <polygon points="100,10 190,150 10,150" fill={dark ? '#1e293b' : '#f1f5f9'} stroke={t.fence} strokeWidth="2" />
                  <line x1="100" y1="80" x2="100" y2="150" stroke={t.fence} strokeWidth="1.5" />
                  <text x="100" y="55" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#f87171">V</text>
                  <text x="55" y="145" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#34d399">I</text>
                  <text x="145" y="145" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#60a5fa">R</text>
                  <text x="100" y="175" textAnchor="middle" fontSize="10" fill={t.dim}>Cover the unknown — the formula is what remains</text>
                </svg>
              </div>

              {/* Formula cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'V = I × R', val: `${fmt(V)} V`, color: '#f87171' },
                  { label: 'I = V ÷ R', val: `${fmt(I)} A`, color: '#34d399' },
                  { label: 'R = V ÷ I', val: `${fmt(R)} Ω`, color: '#60a5fa' },
                ].map(f => (
                  <div key={f.label} style={{ background: t.card, borderRadius: 8, padding: '10px 8px', textAlign: 'center', border: `1px solid ${t.border}` }}>
                    <div style={{ fontSize: 10, color: t.sub, marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: f.color }}>{f.val}</div>
                  </div>
                ))}
              </div>

              {/* Water analogy */}
              <div style={{ background: t.card, borderRadius: 8, padding: 12, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Water Pipe Analogy</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
                  {[
                    { label: 'Voltage (V)', icon: '⬆', desc: 'Water pressure pushing flow through the pipe' },
                    { label: 'Current (I)', icon: '〰', desc: 'Volume flow rate (liters/min)' },
                    { label: 'Resistance (R)', icon: '⊘', desc: 'Narrow pipe section restricting flow' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{row.icon}</span>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{row.label}: </span>
                        <span style={{ fontSize: 11, color: t.sub }}>{row.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {view === 'power' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fb923c', fontFamily: 'monospace' }}>P = V × I</div>
                <div style={{ fontSize: 13, color: t.sub, marginTop: 4 }}>Power dissipated as heat in the resistor</div>
              </div>
              <div style={{ background: t.card, borderRadius: 10, padding: 20, marginBottom: 14, textAlign: 'center', border: `1px solid #fb923c40` }}>
                <div style={{ fontSize: 12, color: t.dim, marginBottom: 6 }}>Current power dissipation</div>
                <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 900, color: '#fb923c' }}>{fmt(P)}</div>
                <div style={{ fontSize: 14, color: t.sub }}>Watts</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'P = V × I', val: `${fmt(V)} × ${fmt(I)} = ${fmt(P)} W`, color: '#fb923c' },
                  { label: 'P = I² × R', val: `${fmt(I)}² × ${fmt(R)} = ${fmt(I*I*R)} W`, color: '#fb923c' },
                  { label: 'P = V² ÷ R', val: `${fmt(V)}² ÷ ${fmt(R)} = ${fmt(V*V/R)} W`, color: '#fb923c' },
                  { label: 'Energy (1 hour)', val: `${fmt(P / 1000)} kWh`, color: '#fbbf24' },
                ].map(f => (
                  <div key={f.label} style={{ background: t.card, borderRadius: 8, padding: '8px 10px', border: `1px solid ${t.border}` }}>
                    <div style={{ fontSize: 10, color: t.sub, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: f.color }}>{f.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, background: t.card, borderRadius: 8, padding: 10, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 4 }}>Component ratings context</div>
                <div style={{ fontSize: 11, color: t.sub }}>
                  A 1/4W resistor can safely handle up to 250mW. A 1W resistor handles 1W.
                  At {fmt(P)}W, you need a resistor rated for at least <strong style={{ color: '#fb923c' }}>{fmt(P * 1.5)}W</strong> (1.5× safety factor).
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
