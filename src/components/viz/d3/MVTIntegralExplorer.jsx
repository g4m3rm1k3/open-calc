import { useState, useMemo, useEffect } from 'react';
import * as d3 from 'd3';
import katex from 'katex';


// Math renderer (inline or block)
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

// Expandable WhyPanel (nested)
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

// --- Main lesson component ---
export default function MVTIntegralExplorer() {
  const isDark = useIsDark();
  const C = isDark ? darkColors : lightColors;

  const [fnIdx, setFnIdx] = useState(0);
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);
  const [section, setSection] = useState('explorer');

  const PRESETS = [
    { label: 'f(x) = x^2', fn: x => x * x, domain: [0, 3], fnTex: 'x^2' },
    { label: 'f(x) = sin(x)', fn: x => Math.sin(x), domain: [0, Math.PI], fnTex: '\\sin(x)' },
    { label: 'f(x) = 2x + 1', fn: x => 2 * x + 1, domain: [0, 4], fnTex: '2x + 1' },
    { label: 'f(x) = e^{0.5x}', fn: x => Math.exp(0.5 * x), domain: [0, 3], fnTex: 'e^{0.5x}' },
  ];
  const fn = PRESETS[fnIdx].fn;
  const domain = PRESETS[fnIdx].domain;

  function numericalIntegral(fn, a, b, steps = 400) {
    if (b <= a) return 0;
    const dx = (b - a) / steps;
    let sum = 0;
    for (let i = 0; i < steps; i++) {
      const x0 = a + i * dx;
      const x1 = x0 + dx;
      sum += (fn(x0) + fn(x1)) * 0.5 * dx;
    }
    return sum;
  }
  const integral = numericalIntegral(fn, a, b);
  const avgValue = (b > a) ? integral / (b - a) : 0;
  function findC() {
    if (b <= a) return a;
    const step = (b - a) / 500;
    let minDiff = Infinity, bestC = a;
    for (let x = a; x <= b; x += step) {
      const diff = Math.abs(fn(x) - avgValue);
      if (diff < minDiff) { minDiff = diff; bestC = x; }
    }
    return bestC;
  }
  const c = useMemo(() => findC(), [a, b, fn, avgValue]);

  // D3/SVG setup
  const W = 600, H = 340, margin = { top: 28, right: 28, bottom: 48, left: 60 };
  const xSc = d3.scaleLinear().domain([domain[0], domain[1]]).range([margin.left, W - margin.right]);
  const yStep = (domain[1] - domain[0]) / 200;
  const yVals = d3.range(domain[0], domain[1] + yStep, yStep).map(fn); // include endpoint
  const yMin = Math.min(...yVals, 0, avgValue);
  const yMax = Math.max(...yVals, 0, avgValue);
  const yPad = (yMax - yMin) * 0.18 || 0.5;
  const ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([H - margin.bottom, margin.top]);
  const areaPts = [];
  for (let i = 0; i <= 600; i++) {
    const x = a + (b - a) * (i / 600);
    areaPts.push([x, fn(x)]);
  }
  const curveStep = (domain[1] - domain[0]) / 300;
  const curvePts = d3.range(domain[0], domain[1] + curveStep, curveStep).map((x) => ({ x, y: fn(x) }));

  // Construct polygonPoints for the area under f(x)
  const polygonPoints = [
    [xSc(a), ySc(0)],
    ...areaPts.map(([x, y]) => [xSc(x), ySc(y)]),
    [xSc(b), ySc(0)]
  ].map(([x, y]) => `${x},${y}`).join(' ');

  // Section tab button
  const sectionBtn = (key, label, color) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: section === key ? 500 : 400,
    border: `0.5px solid ${section === key ? color : C.border}`,
    background: section === key ? color + '22' : 'transparent',
    color: section === key ? color : C.textMuted,
    marginRight: 6,
  });

  // --- Main UI ---
  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0', maxWidth: 800, margin: '0 auto', color: C.textMain, background: C.bg }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: C.textMain }}>Mean Value Theorem for Integrals</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, justifyContent: 'center' }}>
        <button onClick={() => setSection('explorer')} style={sectionBtn('explorer', 'Explorer', C.indigoMain)}>Explorer</button>
        <button onClick={() => setSection('trap')} style={sectionBtn('trap', 'The trap', C.redMain)}>The trap</button>
        <button onClick={() => setSection('proof')} style={sectionBtn('proof', 'Proof', C.indigoMain)}>Proof</button>
        <button onClick={() => setSection('intuition')} style={sectionBtn('intuition', 'Intuition', C.greenMain)}>Intuition</button>
        <button onClick={() => setSection('real')} style={sectionBtn('real', 'Real-World', C.greenMain)}>Real-World</button>
        <button onClick={() => setSection('examples')} style={sectionBtn('examples', 'Examples', C.blueMain)}>Examples</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {PRESETS.map((pr, i) => (
          <button key={i} onClick={() => { setFnIdx(i); setA(pr.domain[0]); setB(pr.domain[1]); }} style={{ padding: '4px 12px', borderRadius: 14, fontSize: 12, cursor: 'pointer', fontWeight: i === fnIdx ? 600 : 400, border: `0.5px solid ${i === fnIdx ? C.indigoMain : C.border}`, background: i === fnIdx ? C.indigoBg : 'transparent', color: i === fnIdx ? C.indigoText : C.textMuted }}>{pr.label}</button>
        ))}
      </div>
      <div>
        {/* Section: Explorer */}
        {section === 'explorer' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ marginBottom: 10, textAlign: 'center', color: C.textMuted, fontSize: 16 }}>
              For any continuous function <M t={'f'} /> on <M t={'[a, b]'} />, there exists <M t={'c \\in [a, b]'} /> such that
              <M t={'\\int_a^b f(x)\\,dx = f(c)(b-a)'} display />
              The area under <M t={'f'} /> equals the area of a rectangle at the average value.
            </div>
            <svg width={W} height={H} style={{ overflow: 'visible', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
              {/* Gridlines */}
              {xSc.ticks(7).map((t, i) => (
                <line key={i} x1={xSc(t)} x2={xSc(t)} y1={margin.top} y2={H - margin.bottom} stroke={C.border} strokeDasharray="3,3" />
              ))}
              {ySc.ticks(6).map((t, i) => (
                <line key={i} x1={margin.left} x2={W - margin.right} y1={ySc(t)} y2={ySc(t)} stroke={C.border} strokeDasharray="3,3" />
              ))}
              {/* Area under f(x) */}
              <polygon
                points={polygonPoints}
                fill={C.blueMain} opacity={0.22}
              />
              {/* Rectangle for mean value (safe for negative height) */}
              {(() => {
                const rectY = Math.min(ySc(0), ySc(avgValue));
                const rectHeight = Math.abs(ySc(0) - ySc(avgValue));
                return (
                  <rect
                    x={xSc(a)}
                    y={rectY}
                    width={xSc(b) - xSc(a)}
                    height={rectHeight}
                    fill={C.yellowMain} opacity={0.18}
                    stroke={C.yellowMain} strokeWidth={1.2}
                  />
                );
              })()}
              <polyline
                fill="none"
                stroke={C.indigoMain}
                strokeWidth={2.5}
                points={curvePts.map(({ x, y }) => `${xSc(x)},${ySc(y)}`).join(' ')}
              />
              <line
                x1={xSc(c)} x2={xSc(c)}
                y1={ySc(0)} y2={ySc(fn(c))}
                stroke={C.greenMain} strokeWidth={2.2} strokeDasharray="5,3"
              />
              <circle
                cx={xSc(c)} cy={ySc(fn(c))} r={7}
                fill={C.greenMain} stroke={C.bg} strokeWidth={1.5}
              />
              <text x={xSc(c)} y={ySc(fn(c)) - 12} textAnchor="middle" fontSize={12} fill={C.greenMain}>c</text>
              <text x={W - margin.right - 4} y={margin.top + 2} textAnchor="end" fontSize={13} fill={C.indigoMain} fontWeight="bold">{PRESETS[fnIdx].fnTex}</text>
              <text x={xSc(a)} y={ySc(0) + 18} textAnchor="middle" fontSize={12} fill={C.yellowMain} fontWeight="bold">a</text>
              <text x={xSc(b)} y={ySc(0) + 18} textAnchor="middle" fontSize={12} fill={C.yellowMain} fontWeight="bold">b</text>
              <text x={(xSc(a) + xSc(b)) / 2} y={ySc(avgValue) - 8} textAnchor="middle" fontSize={13} fill={C.yellowMain}>Area = f(c)·(b-a)</text>
              <text x={(xSc(a) + xSc(b)) / 2} y={H - 12} textAnchor="middle" fontSize={12} fill={C.textMuted}>
                {`∫ₐᵇ f(x) dx ≈ ${integral.toFixed(4)}   |   f(c) ≈ ${fn(c).toFixed(4)}   |   c ≈ ${c.toFixed(3)}`}
              </text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, alignItems: 'center' }}>
              <label style={{ fontWeight: 500 }}>a (left endpoint):
                <input type="range" min={domain[0]} max={b - 0.05 * (domain[1] - domain[0])} step={(domain[1] - domain[0]) / 200} value={a} onChange={e => setA(Number(e.target.value))} style={{ margin: '0 12px', width: 180, verticalAlign: 'middle' }} />
                <span style={{ marginLeft: 8 }}>{a.toFixed(3)}</span>
              </label>
              <label style={{ fontWeight: 500 }}>b (right endpoint):
                <input type="range" min={a + 0.05 * (domain[1] - domain[0])} max={domain[1]} step={(domain[1] - domain[0]) / 200} value={b} onChange={e => setB(Number(e.target.value))} style={{ margin: '0 12px', width: 180, verticalAlign: 'middle' }} />
                <span style={{ marginLeft: 8 }}>{b.toFixed(3)}</span>
              </label>
            </div>
          </div>
        )}

        {/* Section: Trap (common mistake) */}
        {section === 'trap' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ background: C.redBg, borderLeft: `3px solid ${C.redMain}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.redDark, marginBottom: 8 }}>The trap: confusing total area with average value</div>
              <div style={{ fontSize: 14, color: C.redText, marginBottom: 8 }}>
                Many students compute <M t={'\\int_a^b f(x)dx'} /> correctly but forget to divide by <M t={'b-a'} /> to get the average value. They report the total area, not the average height.
              </div>
              <WhyPanel C={C} why={{
                tag: 'Why is dividing by (b-a) necessary?',
                explanation: 'The average value of a function on [a, b] is the height of a rectangle with the same area as under the curve. The area is width × height, so to solve for height, divide area by width.',
                math: 'f_{\\text{avg}} = \\frac{1}{b-a} \\int_a^b f(x)dx',
                why: {
                  tag: 'But why does this work for any continuous function?',
                  explanation: 'The Intermediate Value Theorem guarantees that a continuous function attains every value between its minimum and maximum, so there must be some c where f(c) = average value.',
                },
              }} />
            </div>
          </div>
        )}

        {/* Section: Proof */}
        {section === 'proof' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ background: C.indigoBg, borderLeft: `3px solid ${C.indigoMain}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.indigoText, marginBottom: 8 }}>Proof Sketch</div>
              <ol style={{ marginLeft: 18, color: C.textMain, fontSize: 14, lineHeight: 1.7 }}>
                <li>By the Extreme Value Theorem, <M t={'f'} /> attains its max <M t={'M'} /> and min <M t={'m'} /> on <M t={'[a, b]'} />.</li>
                <li>The average value <M t={'f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f(x)dx'} /> is between <M t={'m'} /> and <M t={'M'} />.</li>
                <li>By the Intermediate Value Theorem, since <M t={'f'} /> is continuous, there is <M t={'c'} /> with <M t={'f(c) = f_{\\text{avg}}'} />.</li>
                <li>So <M t={'\\int_a^b f(x)dx = f(c)(b-a)'} /> for some <M t={'c \\in [a, b]'} />.</li>
              </ol>
              <WhyPanel C={C} why={{
                tag: 'Why does the IVT apply?',
                explanation: 'The Intermediate Value Theorem applies to any continuous function on a closed interval. Since f is continuous, and f(a) ≤ f_{avg} ≤ f(b), there must be some c with f(c) = f_{avg}.',
              }} />
            </div>
          </div>
        )}

        {/* Section: Intuition */}
        {section === 'intuition' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ background: C.greenBg, borderLeft: `3px solid ${C.greenMain}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.greenDark, marginBottom: 8 }}>Intuition</div>
              <div style={{ fontSize: 14, color: C.greenText, marginBottom: 8 }}>
                The theorem says: if you average the function’s values over an interval, there must be a point where the function actually equals that average. It’s like saying: if your average speed was 60 mph, you must have been going exactly 60 mph at some instant.
              </div>
              <WhyPanel C={C} why={{
                tag: 'Why is this surprising?',
                explanation: 'It’s not obvious that a wiggly function must hit its average value. But continuity means it can’t “jump over” the average without touching it.',
              }} />
            </div>
          </div>
        )}

        {/* Section: Real-World */}
        {section === 'real' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ background: C.cyanBg, borderLeft: `3px solid ${C.greenMain}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.greenMain, marginBottom: 8 }}>Real-World Context</div>
              <div style={{ fontSize: 14, color: C.cyanText, marginBottom: 8 }}>
                If the average temperature over a week is 70°F, the theorem guarantees there was a moment when the temperature was exactly 70°F. This applies to average speed, rainfall, power output, and more.
              </div>
            </div>
          </div>
        )}

        {/* Section: Examples */}
        {section === 'examples' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ background: C.blueBg, borderLeft: `3px solid ${C.blueMain}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.blueMain, marginBottom: 8 }}>Examples</div>
              <div style={{ marginBottom: 10, color: C.textMain }}>
                <b>1. <M t={'f(x) = x^2'} /> on <M t={'[0,2]'} />:</b><br />
                <M t={'\\int_0^2 x^2 dx = [x^3/3]_0^2 = 8/3'} display />
                <M t={'f(c)\cdot 2 = 8/3 \\implies f(c) = 4/3 \\implies c = \\sqrt{4/3} \\approx 1.155'} display />
              </div>
              <div style={{ color: C.textMain }}>
                <b>2. <M t={'f(x) = \\sin(x)'} /> on <M t={'[0,\\pi]'} />:</b><br />
                <M t={'f_{\\text{avg}} = (1/\\pi)\\int_0^\\pi \\sin(x) dx = 2/\\pi \\approx 0.637'} display />
                <M t={'\\sin(c) = 2/\\pi \\implies c = \\arcsin(2/\\pi) \\approx 0.690'} display />
              </div>
            </div>
          </div>
        )}

        {/* Final panel: Why is this useful? */}
        <div style={{ background: C.yellowBg, borderLeft: `3px solid ${C.yellowBorder}`, borderRadius: 8, padding: 18, marginTop: 24, color: C.textMain }}>
          <b style={{ color: C.yellowBorder }}>Why is this useful?</b> This theorem lets you replace a complicated area with a simple rectangle — making average value calculations and estimates much easier. It's used in physics, engineering, and probability whenever you want to know if a function actually attains its average value.
        </div>
      </div>
    </div>
  );
}
