import { useState, useMemo, useEffect } from 'react';
import * as d3 from 'd3';
import katex from 'katex';

function M({ t, display = false }) {
  const html = useMemo(() => {
    if (!t) return '';
    try {
      return katex.renderToString(t, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch {
      return `<span>${String(t)}</span>`;
    }
  }, [t, display]);
  if (!t) return null;
  return <span style={{ display: display ? 'block' : 'inline' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

const lightColors = {
  bg: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  textMain: '#1e293b',
  textMuted: '#64748b',
  indigoMain: '#6366f1',
  indigoText: '#4338ca',
  indigoBg: '#eef2ff',
  cyanMain: '#0891b2',
  cyanText: '#0e7490',
  cyanBg: '#ecfeff',
  greenMain: '#10b981',
  greenDark: '#047857',
  greenText: '#0f6e56',
  greenBg: '#ecfdf5',
  blueMain: '#38bdf8',
  blueDark: '#0ea5e9',
  blueBg: '#e0f2fe',
  yellowMain: '#f59e0b',
  yellowBorder: '#facc15',
  yellowBg: '#fef9c3',
  redMain: '#ef4444',
  redDark: '#501313',
  redText: '#791f1f',
  redBg: '#FCEBEB',
};

const darkColors = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  textMain: '#e2e8f0',
  textMuted: '#94a3b8',
  indigoMain: '#818cf8',
  indigoText: '#a5b4fc',
  indigoBg: 'rgba(99,102,241,0.15)',
  cyanMain: '#22d3ee',
  cyanText: '#67e8f9',
  cyanBg: 'rgba(6,182,212,0.15)',
  greenMain: '#34d399',
  greenDark: '#10b981',
  greenText: '#6ee7b7',
  greenBg: 'rgba(16,185,129,0.15)',
  blueMain: '#38bdf8',
  blueDark: '#0ea5e9',
  blueBg: 'rgba(14,165,233,0.15)',
  yellowMain: '#fbbf24',
  yellowBorder: '#fcd34d',
  yellowBg: 'rgba(245,158,11,0.15)',
  redMain: '#f87171',
  redDark: '#fca5a5',
  redText: '#fecaca',
  redBg: 'rgba(239,68,68,0.15)',
};

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const ob = new MutationObserver(update);
    ob.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => ob.disconnect();
  }, []);
  return isDark;
}

const DL = ['Why?', 'But why?', 'Prove it'];
function WhyPanel({ why, depth = 0, C }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const DS = [
    { border: C.indigoMain, bg: C.indigoBg, text: C.indigoText, panelBg: C.indigoBg },
    { border: C.cyanMain, bg: C.cyanBg, text: C.cyanText, panelBg: C.cyanBg },
    { border: C.greenMain, bg: C.greenBg, text: C.greenText, panelBg: C.greenBg },
  ];
  const d = DS[Math.min(depth, DS.length - 1)];
  const lbl = why.tag || DL[Math.min(depth, DL.length - 1)];
  return (
    <div style={{ marginLeft: depth * 12, marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: open ? d.bg : 'transparent', border: `1px solid ${d.border}`, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 500, color: d.border, cursor: 'pointer' }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: d.border, color: C.bg, fontSize: 9, fontWeight: 700, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{open ? '−' : '?'}</span>
        {open ? 'Close' : lbl}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: '12px 14px', background: d.panelBg, border: `0.5px solid ${d.border}22`, borderLeft: `3px solid ${d.border}`, borderRadius: '0 8px 8px 0', animation: 'sd .16s ease-out' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, marginBottom: 8, display: 'inline-block', background: d.bg, color: d.text }}>{lbl}</span>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: C.textMain, marginBottom: why.math || why.steps ? 10 : 0 }}>{why.explanation}</p>
          {why.math && <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: '10px 14px', textAlign: 'center', overflowX: 'auto', marginBottom: 6 }}><M t={why.math} display /></div>}
          {why.steps && <div style={{ marginTop: 8 }}>{why.steps.map((st, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: '50%', background: d.border, color: C.bg, fontSize: 10, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: C.textMain, marginBottom: st.math ? 4 : 0 }}>{st.text}</p>
                {st.math && <div style={{ background: C.surface, borderRadius: 6, padding: '6px 10px', textAlign: 'center', overflowX: 'auto', marginTop: 3 }}><M t={st.math} display /></div>}
              </div>
            </div>
          ))}</div>}
          {why.why && <WhyPanel why={why.why} depth={depth + 1} C={C} />}
        </div>
      )}
    </div>
  );
}

export default function HigherOrderDerivativesExplorer() {
  const isDark = useIsDark();
  const C = isDark ? darkColors : lightColors;
  const [fnIdx, setFnIdx] = useState(0);
  const PRESETS = [
    { label: 's(t) = t³ − 3t', fn: t => t ** 3 - 3 * t, fn1: t => 3 * t ** 2 - 3, fn2: t => 6 * t, domain: [-2.5, 2.5], color: C.indigoMain },
    { label: 's(t) = sin(t)', fn: t => Math.sin(t), fn1: t => Math.cos(t), fn2: t => -Math.sin(t), domain: [-Math.PI * 1.2, Math.PI * 1.2], color: C.greenMain },
    { label: 's(t) = e^t', fn: t => Math.exp(t), fn1: t => Math.exp(t), fn2: t => Math.exp(t), domain: [-1.5, 1.5], color: C.cyanMain },
  ];
  const fn = PRESETS[fnIdx].fn;
  const fn1 = PRESETS[fnIdx].fn1;
  const fn2 = PRESETS[fnIdx].fn2;
  const domain = PRESETS[fnIdx].domain;
  const [t, setT] = useState(0);
  const [panel, setPanel] = useState('explorer');

  // D3/SVG setup
  const W = 600, H = 340, margin = { top: 28, right: 28, bottom: 48, left: 60 };
  const tMin = domain[0], tMax = domain[1];
  const tStep = (tMax - tMin) / 300;
  const tVals = d3.range(tMin, tMax + tStep, tStep);
  const yVals = tVals.map(fn);
  const y1Vals = tVals.map(fn1);
  const y2Vals = tVals.map(fn2);
  const yMin = Math.min(...yVals, ...y1Vals, ...y2Vals);
  const yMax = Math.max(...yVals, ...y1Vals, ...y2Vals);
  const yPad = (yMax - yMin) * 0.18 || 0.5;
  const ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([H - margin.bottom, margin.top]);
  const xSc = d3.scaleLinear().domain([tMin, tMax]).range([margin.left, W - margin.right]);

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0', maxWidth: 800, margin: '0 auto', color: C.textMain, background: C.bg }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: C.textMain }}>Higher-Order Derivatives Explorer</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, justifyContent: 'center' }}>
        <button onClick={() => setPanel('explorer')} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: panel === 'explorer' ? 500 : 400, border: `0.5px solid ${panel === 'explorer' ? C.indigoMain : C.border}`, background: panel === 'explorer' ? C.indigoBg : 'transparent', color: panel === 'explorer' ? C.indigoText : C.textMuted, marginRight: 6 }}>Explorer</button>
        <button onClick={() => setPanel('notation')} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: panel === 'notation' ? 500 : 400, border: `0.5px solid ${panel === 'notation' ? C.cyanMain : C.border}`, background: panel === 'notation' ? C.cyanBg : 'transparent', color: panel === 'notation' ? C.cyanMain : C.textMuted, marginRight: 6 }}>Notation</button>
        <button onClick={() => setPanel('concavity')} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: panel === 'concavity' ? 500 : 400, border: `0.5px solid ${panel === 'concavity' ? C.greenMain : C.border}`, background: panel === 'concavity' ? C.greenBg : 'transparent', color: panel === 'concavity' ? C.greenMain : C.textMuted, marginRight: 6 }}>Concavity</button>
        <button onClick={() => setPanel('examples')} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: panel === 'examples' ? 500 : 400, border: `0.5px solid ${panel === 'examples' ? C.blueMain : C.border}`, background: panel === 'examples' ? C.blueBg : 'transparent', color: panel === 'examples' ? C.blueMain : C.textMuted }}>Examples</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {PRESETS.map((pr, i) => (
          <button key={i} onClick={() => { setFnIdx(i); setT(0); }} style={{ padding: '4px 12px', borderRadius: 14, fontSize: 12, cursor: 'pointer', fontWeight: i === fnIdx ? 600 : 400, border: `0.5px solid ${i === fnIdx ? pr.color : C.border}`, background: i === fnIdx ? C.indigoBg : 'transparent', color: i === fnIdx ? pr.color : C.textMuted }}>{pr.label}</button>
        ))}
      </div>
      {panel === 'explorer' && (
        <div style={{ animation: 'sd .2s ease-out' }}>
          <div style={{ marginBottom: 10, textAlign: 'center', color: C.textMuted, fontSize: 16 }}>
            Explore how position, velocity, and acceleration relate. Move t to see all three curves update in sync.
          </div>
          <svg width={W} height={H} style={{ overflow: 'visible', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
            {/* Position curve */}
            <polyline fill="none" stroke={C.indigoMain} strokeWidth={2.5} points={tVals.map((x, i) => `${xSc(x)},${ySc(yVals[i])}`).join(' ')} />
            {/* Velocity curve */}
            <polyline fill="none" stroke={C.greenMain} strokeWidth={2.2} strokeDasharray="5,3" points={tVals.map((x, i) => `${xSc(x)},${ySc(y1Vals[i])}`).join(' ')} />
            {/* Acceleration curve */}
            <polyline fill="none" stroke={C.cyanMain} strokeWidth={2.2} strokeDasharray="2,2" points={tVals.map((x, i) => `${xSc(x)},${ySc(y2Vals[i])}`).join(' ')} />
            {/* Moving point on position */}
            <circle cx={xSc(t)} cy={ySc(fn(t))} r={7} fill={C.indigoMain} stroke={C.bg} strokeWidth={1.5} />
            {/* Tangent at t (velocity) */}
            {(() => {
              const slope = fn1(t);
              const x0 = t - 0.7, x1 = t + 0.7;
              const y0 = fn(t) + slope * (x0 - t);
              const y1 = fn(t) + slope * (x1 - t);
              return <line x1={xSc(x0)} y1={ySc(y0)} x2={xSc(x1)} y2={ySc(y1)} stroke={C.greenMain} strokeWidth={2.5} />;
            })()}
            {/* Acceleration marker */}
            <circle cx={xSc(t)} cy={ySc(fn1(t))} r={6} fill={C.greenMain} stroke={C.bg} strokeWidth={1.2} />
            <circle cx={xSc(t)} cy={ySc(fn2(t))} r={6} fill={C.cyanMain} stroke={C.bg} strokeWidth={1.2} />
            {/* Labels */}
            <text x={xSc(t)} y={ySc(fn(t)) - 16} textAnchor="middle" fontSize={12} fill={C.indigoMain}>s(t)</text>
            <text x={xSc(t)} y={ySc(fn1(t)) - 12} textAnchor="middle" fontSize={12} fill={C.greenMain}>v(t)</text>
            <text x={xSc(t)} y={ySc(fn2(t)) - 12} textAnchor="middle" fontSize={12} fill={C.cyanMain}>a(t)</text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, alignItems: 'center' }}>
            <label style={{ fontWeight: 500 }}>t:
              <input type="range" min={tMin} max={tMax} step={(tMax - tMin) / 200} value={t} onChange={e => setT(Number(e.target.value))} style={{ margin: '0 12px', width: 260, verticalAlign: 'middle' }} />
              <span style={{ marginLeft: 8 }}>{t.toFixed(3)}</span>
            </label>
          </div>
        </div>
      )}
      {panel === 'notation' && (
        <div style={{ animation: 'sd .2s ease-out', background: C.cyanBg, borderLeft: `3px solid ${C.cyanMain}`, borderRadius: 8, padding: 22, marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.cyanText, marginBottom: 8 }}>Higher-Order Derivative Notation</div>
          <div style={{ fontSize: 15, color: C.textMain, marginBottom: 10 }}>
            <M t={'f\' = \\frac{df}{dx}'} /> &nbsp; <M t={'f\'\' = \\frac{d^2f}{dx^2}'} /> &nbsp; <M t={'f\'\'\' = \\frac{d^3f}{dx^3}'} /> &nbsp; <M t={'f^{(n)} = \\frac{d^nf}{dx^n}'} />
          </div>
          <WhyPanel C={C} why={{
            tag: 'Why d²f/dx²?',
            explanation: 'It means apply d/dx twice. The numerator counts applications; the denominator tracks units. (d/dx)²f = d²f/dx².'
          }} />
        </div>
      )}
      {panel === 'concavity' && (
        <div style={{ animation: 'sd .2s ease-out', background: C.greenBg, borderLeft: `3px solid ${C.greenMain}`, borderRadius: 8, padding: 22, marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.greenText, marginBottom: 8 }}>Second Derivative and Concavity</div>
          <div style={{ fontSize: 15, color: C.textMain, marginBottom: 10 }}>
            <M t={'f\'\'(x) > 0 \\implies f \\text{ is concave up}'} /> &nbsp; <M t={'f\'\'(x) < 0 \\implies f \\text{ is concave down}'} />
          </div>
          <WhyPanel C={C} why={{
            tag: 'Why does f\'\' > 0 mean concave up?',
            explanation: 'Concave up means the slope is increasing. f\'\' = (f\')\' measures how quickly f\' changes. If f\'\' > 0, then f\' is increasing → the function is concave up.'
          }} />
        </div>
      )}
      {panel === 'examples' && (
        <div style={{ animation: 'sd .2s ease-out', background: C.blueBg, borderLeft: `3px solid ${C.blueMain}`, borderRadius: 8, padding: 22, marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.blueMain, marginBottom: 8 }}>Examples</div>
          <div style={{ fontSize: 15, color: C.textMain, marginBottom: 10 }}>
            <b>Polynomial:</b> <M t={'f(x) = x^4 - 3x^3 + 2x - 7'} />
            <br />
            <M t={'f\'(x) = 4x^3 - 9x^2 + 2'} />
            <br />
            <M t={'f\'\'(x) = 12x^2 - 18x'} />
            <br />
            <M t={'f\'\'\'(x) = 24x - 18'} />
            <br />
            <M t={'f^{(4)}(x) = 24'} />
            <br />
            <M t={'f^{(5)}(x) = 0'} />
          </div>
          <div style={{ fontSize: 15, color: C.textMain, marginBottom: 10 }}>
            <b>Trig:</b> <M t={'f(x) = \sin(x)'} />
            <br />
            <M t={'f\'(x) = \cos(x)'} />
            <br />
            <M t={'f\'\'(x) = -\sin(x)'} />
            <br />
            <M t={'f\'\'\'(x) = -\cos(x)'} />
            <br />
            <M t={'f^{(4)}(x) = \sin(x)'} />
          </div>
        </div>
      )}
      <div style={{ background: C.yellowBg, borderLeft: `3px solid ${C.yellowBorder}`, borderRadius: 8, padding: 18, marginTop: 24, color: C.textMain }}>
        <b style={{ color: C.yellowBorder }}>Summary:</b> Higher-order derivatives describe how motion, slope, and curvature change. The second derivative is acceleration and concavity; the third is jerk. Each level adds a new layer of understanding.
      </div>
    </div>
  );
}
