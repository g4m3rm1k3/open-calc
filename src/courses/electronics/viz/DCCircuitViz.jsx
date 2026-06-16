import { useState, useEffect } from 'react';

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
  };
}

const fmt = (n, unit = '') => {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(2)}k${unit}`;
  if (Math.abs(n) >= 1) return `${n.toFixed(2)}${unit}`;
  return `${(n * 1000).toFixed(1)}m${unit}`;
};

const COLORS = ['#f87171', '#34d399', '#60a5fa', '#fbbf24'];

export default function DCCircuitViz({ params = {} }) {
  const mode = params.mode ?? 'series'; // 'series' | 'parallel'
  const dark = useDark();
  const t = makeT(dark);

  const [topology, setTopology] = useState(mode);
  const [vsource, setVsource] = useState(12);
  const [resistors, setResistors] = useState([100, 220, 470]);

  const n = resistors.length;
  const rtSeries = resistors.reduce((s, r) => s + r, 0);
  const rtParallel = 1 / resistors.reduce((s, r) => s + 1 / r, 0);
  const rt = topology === 'series' ? rtSeries : rtParallel;
  const itotal = vsource / rt;

  // Series: same current, different voltages
  // Parallel: same voltage, different currents
  const drops = topology === 'series'
    ? resistors.map(r => itotal * r)
    : resistors.map(() => vsource);
  const currents = topology === 'series'
    ? resistors.map(() => itotal)
    : resistors.map(r => vsource / r);

  const addResistor = () => {
    if (resistors.length < 4) setResistors(prev => [...prev, 330]);
  };
  const removeResistor = () => {
    if (resistors.length > 2) setResistors(prev => prev.slice(0, -1));
  };
  const updateR = (i, v) => setResistors(prev => prev.map((r, idx) => idx === i ? Math.max(1, Math.min(100000, v)) : r));

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>DC Circuit — Series & Parallel</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {['series', 'parallel'].map(v => (
            <button key={v} onClick={() => setTopology(v)}
              style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', borderColor: topology === v ? '#6366f1' : t.fence, background: topology === v ? (dark ? '#1e1b4b' : '#ede9fe') : 'transparent', color: topology === v ? '#a5b4fc' : t.sub }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left: controls */}
        <div style={{ padding: 16, borderRight: `1px solid ${t.border}` }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>Source Voltage</span>
              <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#f87171' }}>{vsource.toFixed(1)} V</span>
            </div>
            <input type="range" min={1} max={240} step={0.5} value={vsource}
              onChange={e => setVsource(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f87171' }} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Resistors</div>
          {resistors.map((r, i) => (
            <div key={i} style={{ background: t.card, borderRadius: 8, padding: '10px 12px', marginBottom: 8, border: `1px solid ${COLORS[i]}40` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: COLORS[i] }}>R{i + 1}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: COLORS[i] }}>{fmt(r, 'Ω')}</span>
              </div>
              <input type="range" min={0} max={1000} step={1}
                value={Math.round(((Math.log10(r) - 0) / (Math.log10(100000) - 0)) * 1000)}
                onChange={e => { const p = e.target.value / 1000; updateR(i, Math.pow(10, p * Math.log10(100000))); }}
                style={{ width: '100%', accentColor: COLORS[i] }} />
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: t.sub }}>V: <span style={{ color: t.text, fontFamily: 'monospace' }}>{fmt(drops[i], 'V')}</span></span>
                <span style={{ fontSize: 10, color: t.sub }}>I: <span style={{ color: t.text, fontFamily: 'monospace' }}>{fmt(currents[i], 'A')}</span></span>
                <span style={{ fontSize: 10, color: t.sub }}>P: <span style={{ color: t.text, fontFamily: 'monospace' }}>{fmt(drops[i] * currents[i], 'W')}</span></span>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={addResistor} disabled={resistors.length >= 4}
              style={{ flex: 1, padding: '6px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${t.fence}`, background: 'transparent', color: t.sub, fontSize: 11, opacity: resistors.length >= 4 ? 0.4 : 1 }}>
              + Add R
            </button>
            <button onClick={removeResistor} disabled={resistors.length <= 2}
              style={{ flex: 1, padding: '6px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${t.fence}`, background: 'transparent', color: t.sub, fontSize: 11, opacity: resistors.length <= 2 ? 0.4 : 1 }}>
              − Remove R
            </button>
          </div>
        </div>

        {/* Right: results + circuit diagram */}
        <div style={{ padding: 16 }}>
          {/* Summary */}
          <div style={{ background: t.card, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Circuit Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: `R_total (${topology})`, val: fmt(rt, 'Ω'), color: '#6366f1' },
                { label: 'Total Current', val: fmt(itotal, 'A'), color: '#10b981' },
                { label: 'Total Power', val: fmt(itotal * vsource, 'W'), color: '#fb923c' },
                { label: topology === 'series' ? 'KVL: ΣV = 0' : 'KCL: ΣI = 0',
                  val: topology === 'series'
                    ? `${vsource.toFixed(1)} = ${drops.map(v => v.toFixed(1)).join(' + ')}`
                    : `${fmt(itotal, 'A')} = ${currents.map(c => fmt(c, '')).join(' + ')}`,
                  color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ gridColumn: item.label.startsWith('K') ? '1 / -1' : 'auto' }}>
                  <div style={{ fontSize: 9, color: t.dim, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: item.label.startsWith('K') ? 10 : 13, fontWeight: 700, color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Formula card */}
          <div style={{ background: t.card, borderRadius: 10, padding: 14, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              {topology === 'series' ? 'Series Rules' : 'Parallel Rules'}
            </div>
            {topology === 'series' ? (
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 11, color: t.sub }}>▸ <strong style={{ color: '#10b981' }}>Same current</strong> flows through all resistors</div>
                <div style={{ fontSize: 11, color: t.sub }}>▸ <strong style={{ color: '#f87171' }}>Voltage splits</strong> proportionally to resistance</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6366f1', marginTop: 4 }}>R_total = R1 + R2 + ... = {fmt(rt, 'Ω')}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#10b981' }}>I = V / R_total = {fmt(itotal, 'A')}</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 11, color: t.sub }}>▸ <strong style={{ color: '#f87171' }}>Same voltage</strong> across all branches</div>
                <div style={{ fontSize: 11, color: t.sub }}>▸ <strong style={{ color: '#10b981' }}>Current splits</strong> inversely to resistance</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6366f1', marginTop: 4 }}>1/R_total = 1/R1 + 1/R2 + ... → {fmt(rt, 'Ω')}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#10b981' }}>I_total = V / R_total = {fmt(itotal, 'A')}</div>
              </div>
            )}

            {/* Current bar chart */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 9, color: t.dim, marginBottom: 6 }}>Current per branch</div>
              {currents.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: COLORS[i], minWidth: 20, fontWeight: 700 }}>R{i + 1}</span>
                  <div style={{ flex: 1, height: 8, background: t.border, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c / Math.max(...currents)) * 100}%`, background: COLORS[i], borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: COLORS[i], minWidth: 60 }}>{fmt(c, 'A')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
