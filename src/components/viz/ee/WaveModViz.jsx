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
    card:   dark ? '#1e293b' : '#f1f5f9',
    border: dark ? '#1e293b' : '#e2e8f0',
    fence:  dark ? '#334155' : '#d1d5db',
    text:   dark ? '#e2e8f0' : '#1e293b',
    sub:    dark ? '#94a3b8' : '#64748b',
    dim:    dark ? '#475569' : '#94a3b8',
    svgBg:  dark ? '#0f172a' : '#ffffff',
  };
}

const N = 400; // sample points

function buildAM(Ac, fc, Am, fm, N) {
  const ma = Am / Ac;
  const carrier = [], message = [], modulated = [], upper = [], lower = [];
  for (let i = 0; i < N; i++) {
    const t = i / N; // 0..1 represents a fixed time window
    const c = Ac * Math.cos(2 * Math.PI * fc * t);
    const m = Am * Math.cos(2 * Math.PI * fm * t);
    const s = Ac * (1 + ma * Math.cos(2 * Math.PI * fm * t)) * Math.cos(2 * Math.PI * fc * t);
    carrier.push(c);
    message.push(m);
    modulated.push(s);
    upper.push(Ac * ma / 2 * Math.cos(2 * Math.PI * (fc + fm) * t));
    lower.push(Ac * ma / 2 * Math.cos(2 * Math.PI * (fc - fm) * t));
  }
  return { carrier, message, modulated, upper, lower, ma };
}

function buildFM(Ac, fc, Am, fm, delta_f, N) {
  const mf = delta_f / fm;
  const carrier = [], message = [], modulated = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const m = Am * Math.cos(2 * Math.PI * fm * t);
    const s = Ac * Math.cos(2 * Math.PI * fc * t + mf * Math.sin(2 * Math.PI * fm * t));
    carrier.push(Ac * Math.cos(2 * Math.PI * fc * t));
    message.push(m);
    modulated.push(s);
  }
  return { carrier, message, modulated, mf };
}

function waveToPath(wave, W, H, yMid, yScale) {
  return wave.map((v, i) => {
    const x = (i / (wave.length - 1)) * W;
    const y = yMid - v * yScale;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

const ROW_H = 80;

export default function WaveModViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState(params.mode ?? 'am');
  // AM params
  const [fc_am, setFc_am] = useState(20);   // carrier freq (relative units)
  const [fm_am, setFm_am] = useState(3);    // message freq
  const [ma, setMa] = useState(0.7);        // modulation index 0-1
  // FM params
  const [fc_fm, setFc_fm] = useState(20);
  const [fm_fm, setFm_fm] = useState(3);
  const [delta_f, setDeltaF] = useState(6); // frequency deviation (freq units)

  const Ac = 1, Am_am = ma * Ac;
  const Am_fm = 0.8;

  const am = useMemo(() => buildAM(Ac, fc_am, Am_am, fm_am, N), [fc_am, fm_am, ma]);
  const fm = useMemo(() => buildFM(Ac, fc_fm, Am_fm, fm_fm, delta_f, N), [fc_fm, fm_fm, delta_f]);

  const W = 500;
  const yScale = (ROW_H / 2) * 0.85;

  function Waveform({ wave, color, label, yOffset }) {
    const mid = yOffset + ROW_H / 2;
    const path = waveToPath(wave, W, ROW_H, mid, yScale);
    return (
      <g>
        <line x1={0} y1={mid} x2={W} y2={mid} stroke={t.fence} strokeWidth={0.5} />
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
        <text x={4} y={yOffset + 12} fontSize={9} fill={color} fontWeight={700}>{label}</text>
      </g>
    );
  }

  const totalH = ROW_H * 3 + 20;
  const modeColor = { am: '#10b981', fm: '#6366f1' };
  const mc = modeColor[mode];

  // Carson's rule BW
  const bw_fm = 2 * (delta_f + fm_fm);
  const bw_am = 2 * fm_am;
  const sidebands_am = [fc_am - fm_am, fc_am, fc_am + fm_am];

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: mc }}>Modulation Techniques</span>
        {[['am', 'AM — Amplitude Modulation'], ['fm', 'FM — Frequency Modulation']].map(([k, label]) => (
          <button key={k} onClick={() => setMode(k)}
            style={{ padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: mode === k ? modeColor[k] : t.fence,
              background: mode === k ? modeColor[k] + '22' : 'transparent',
              color: mode === k ? modeColor[k] : t.sub }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16 }}>
        {/* Waveforms */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 4 }}>
            {mode === 'am' ? 'AM: Carrier, Message & Modulated Signal' : 'FM: Carrier, Message & Modulated Signal'}
          </div>
          <svg viewBox={`0 0 ${W} ${totalH}`} width="100%"
            style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, display: 'block' }}>
            {mode === 'am' ? (
              <>
                <Waveform wave={am.carrier}   color={t.dim}    label="Carrier c(t)"    yOffset={10} />
                <Waveform wave={am.message}   color="#0ea5e9"  label="Message m(t)"    yOffset={10 + ROW_H} />
                <Waveform wave={am.modulated} color="#10b981"  label="AM output s(t)"  yOffset={10 + ROW_H * 2} />
                {/* Envelope lines */}
                {am.modulated.map((v, i) => null)}
              </>
            ) : (
              <>
                <Waveform wave={fm.carrier}   color={t.dim}    label="Carrier c(t)"    yOffset={10} />
                <Waveform wave={fm.message}   color="#0ea5e9"  label="Message m(t)"    yOffset={10 + ROW_H} />
                <Waveform wave={fm.modulated} color="#6366f1"  label="FM output s(t)"  yOffset={10 + ROW_H * 2} />
              </>
            )}
          </svg>

          {/* Spectrum bar chart */}
          <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 4 }}>
            {mode === 'am' ? 'AM Frequency Spectrum (3 components)' : 'FM Bandwidth (Carson\'s Rule)'}
          </div>
          <div style={{ background: t.svgBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px' }}>
            {mode === 'am' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 60, justifyContent: 'center' }}>
                  {[
                    { f: `fc−fm\n${fc_am - fm_am}`, h: 40 * (ma / 2), color: '#f59e0b', label: 'LSB' },
                    { f: `fc\n${fc_am}`, h: 60, color: '#10b981', label: 'Carrier' },
                    { f: `fc+fm\n${fc_am + fm_am}`, h: 40 * (ma / 2), color: '#f59e0b', label: 'USB' },
                  ].map(bar => (
                    <div key={bar.f} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 24, height: bar.h, background: bar.color, borderRadius: 3 }} />
                      <div style={{ fontSize: 9, color: t.sub, textAlign: 'center', whiteSpace: 'pre' }}>{bar.f}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: t.sub }}>
                  AM bandwidth = 2 × f_m = <strong style={{ color: '#10b981' }}>{bw_am} (units)</strong>. Upper sideband (USB) + lower sideband (LSB) each carry the message.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 24, background: t.card, borderRadius: 4, position: 'relative', overflow: 'hidden', border: `1px solid ${t.fence}` }}>
                    <div style={{ position: 'absolute', left: '20%', right: '20%', top: 0, bottom: 0, background: '#6366f144', borderLeft: '2px solid #6366f1', borderRight: '2px solid #6366f1' }} />
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: '#6366f1', transform: 'translateX(-50%)' }} />
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: t.sub }}>
                  FM BW ≈ 2(Δf + f_m) = 2×({delta_f} + {fm_fm}) = <strong style={{ color: '#6366f1' }}>{bw_fm} (units)</strong>
                  <br />Modulation index β = Δf/f_m = {(delta_f / fm_fm).toFixed(2)}. Higher β → wider BW but better noise immunity.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls + info */}
        <div>
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 10 }}>
              {mode === 'am' ? 'AM Parameters' : 'FM Parameters'}
            </div>
            {mode === 'am' ? [
              { label: 'Carrier freq fc', val: `${fc_am} (rel)`, color: t.dim },
              { label: 'Message freq fm', val: `${fm_am} (rel)`, color: '#0ea5e9' },
              { label: 'Mod. index mₐ', val: ma.toFixed(2), color: ma > 1 ? '#ef4444' : mc },
              { label: 'Bandwidth', val: `2fm = ${bw_am}`, color: mc },
              { label: 'Overmodulated?', val: ma > 1 ? 'YES — distortion!' : 'No', color: ma > 1 ? '#ef4444' : '#10b981' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: t.sub }}>{row.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: row.color }}>{row.val}</span>
              </div>
            )) : [
              { label: 'Carrier freq fc', val: `${fc_fm} (rel)`, color: t.dim },
              { label: 'Message freq fm', val: `${fm_fm} (rel)`, color: '#0ea5e9' },
              { label: 'Freq. deviation Δf', val: `${delta_f} (rel)`, color: mc },
              { label: 'Mod. index β', val: (delta_f / fm_fm).toFixed(2), color: mc },
              { label: 'Carson BW', val: `${bw_fm} (rel)`, color: mc },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: t.sub }}>{row.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: row.color }}>{row.val}</span>
              </div>
            ))}
          </div>

          {mode === 'am' ? [
            { label: 'Carrier freq', val: fc_am, set: setFc_am, min: 10, max: 40, step: 1, color: t.sub },
            { label: 'Message freq', val: fm_am, set: setFm_am, min: 1, max: 8, step: 1, color: '#0ea5e9' },
            { label: `Mod. index mₐ: ${ma.toFixed(2)}`, val: ma, set: setMa, min: 0.1, max: 1.5, step: 0.05, color: mc },
          ].map(s => (
            <label key={s.label} style={{ fontSize: 12, color: t.text, display: 'block', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: s.color }}>{s.label}</span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                onChange={e => s.set(+e.target.value)}
                style={{ width: '100%', accentColor: typeof s.color === 'string' && s.color.startsWith('#') ? s.color : '#6366f1', marginTop: 3 }} />
            </label>
          )) : [
            { label: 'Carrier freq', val: fc_fm, set: setFc_fm, min: 10, max: 40, step: 1, color: t.sub },
            { label: 'Message freq', val: fm_fm, set: setFm_fm, min: 1, max: 8, step: 1, color: '#0ea5e9' },
            { label: `Freq. deviation Δf: ${delta_f}`, val: delta_f, set: setDeltaF, min: 1, max: 20, step: 1, color: mc },
          ].map(s => (
            <label key={s.label} style={{ fontSize: 12, color: t.text, display: 'block', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: s.color }}>{s.label}</span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                onChange={e => s.set(+e.target.value)}
                style={{ width: '100%', accentColor: '#6366f1', marginTop: 3 }} />
            </label>
          ))}

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 6 }}>Key Differences</div>
            <div style={{ fontSize: 10, color: t.sub, lineHeight: 1.7 }}>
              <strong style={{ color: t.text }}>AM:</strong> Amplitude varies; constant frequency. Narrow BW = 2fm. Susceptible to amplitude noise.<br />
              <strong style={{ color: t.text }}>FM:</strong> Frequency varies; constant amplitude. Wider BW ≈ 2(Δf+fm). Immune to amplitude noise — used in FM radio, two-way radio.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 14px', border: `1px solid ${t.border}` }}>
        {mode === 'am'
          ? <><strong style={{ color: t.text }}>AM signal:</strong> s(t) = A_c[1 + m_a cos(2πf_m t)] cos(2πf_c t). Three spectral lines at f_c, f_c±f_m. Bandwidth = 2f_m. If m_a &gt; 1: overmodulation causes envelope distortion.</>
          : <><strong style={{ color: t.text }}>FM signal:</strong> s(t) = A_c cos(2πf_c t + β sin(2πf_m t)), where β = Δf/f_m. Carson's rule: BW ≈ 2(Δf + f_m). Higher β gives better SNR but uses more spectrum.</>
        }
      </div>
    </div>
  );
}
