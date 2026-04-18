import { useState, useMemo } from 'react';
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

// Expandable WhyPanel (nested)
const DS = [
  { border: 'var(--color-accent-indigo, #6366f1)', bg: 'var(--color-background-secondary, #eef2ff)', text: 'var(--color-accent-indigo, #4338ca)', panelBg: 'var(--color-background-secondary)' },
  { border: 'var(--color-accent-cyan, #0891b2)', bg: 'var(--color-background-primary, #ecfeff)', text: 'var(--color-accent-cyan, #0e7490)', panelBg: 'var(--color-background-primary)' },
  { border: 'var(--color-accent-green, #059669)', bg: 'var(--color-background-secondary, #ecfdf5)', text: 'var(--color-accent-green, #047857)', panelBg: 'var(--color-background-secondary)' },
];
const DL = ['Why?', 'But why?', 'Prove it'];
function WhyPanel({ why, depth = 0 }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DS[Math.min(depth, DS.length - 1)];
  const lbl = why.tag || DL[Math.min(depth, DL.length - 1)];
  return (
    <div style={{ marginLeft: depth * 12, marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: open ? d.bg : 'transparent', border: `1px solid ${d.border}`, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 500, color: d.border, cursor: 'pointer' }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: d.border, color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{open ? '−' : '?'}</span>
        {open ? 'Close' : lbl}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: '12px 14px', background: d.panelBg, border: `0.5px solid ${d.border}22`, borderLeft: `3px solid ${d.border}`, borderRadius: '0 8px 8px 0', animation: 'sd .16s ease-out' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, marginBottom: 8, display: 'inline-block', background: d.bg, color: d.text }}>{lbl}</span>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: why.math || why.steps ? 10 : 0 }}>{why.explanation}</p>
          {why.math && <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 6, padding: '10px 14px', textAlign: 'center', overflowX: 'auto', marginBottom: 6 }}><M t={why.math} display /></div>}
          {why.steps && <div style={{ marginTop: 8 }}>{why.steps.map((st, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: '50%', background: d.border, color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-primary)', marginBottom: st.math ? 4 : 0 }}>{st.text}</p>
                {st.math && <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, padding: '6px 10px', textAlign: 'center', overflowX: 'auto', marginTop: 3 }}><M t={st.math} display /></div>}
              </div>
            </div>
          ))}</div>}
          {why.why && <WhyPanel why={why.why} depth={depth + 1} />}
        </div>
      )}
    </div>
  );
}

// --- Main lesson component ---
export default function MVTIntegralExplorer() {
  // ...existing code...
  const [fnIdx, setFnIdx] = useState(0);
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);
  const [section, setSection] = useState('explorer');

  // ...existing code...
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
    border: `0.5px solid ${section === key ? color : 'var(--color-border-secondary)'}`,
    background: section === key ? color + '22' : 'transparent',
    color: section === key ? color : 'var(--color-text-secondary)',
    marginRight: 6,
  });

  // --- Main UI ---
  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0', maxWidth: 800, margin: '0 auto', color: 'var(--color-text-primary)', background: 'var(--color-background-primary)' }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: 'var(--color-text-primary)' }}>Mean Value Theorem for Integrals</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, justifyContent: 'center' }}>
        <button onClick={() => setSection('explorer')} style={sectionBtn('explorer', 'Explorer', '#6366f1')}>Explorer</button>
        <button onClick={() => setSection('trap')} style={sectionBtn('trap', 'The trap', '#ef4444')}>The trap</button>
        <button onClick={() => setSection('proof')} style={sectionBtn('proof', 'Proof', '#7F77DD')}>Proof</button>
        <button onClick={() => setSection('intuition')} style={sectionBtn('intuition', 'Intuition', '#059669')}>Intuition</button>
        <button onClick={() => setSection('real')} style={sectionBtn('real', 'Real-World', '#10b981')}>Real-World</button>
        <button onClick={() => setSection('examples')} style={sectionBtn('examples', 'Examples', '#0ea5e9')}>Examples</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {PRESETS.map((pr, i) => (
          <button key={i} onClick={() => { setFnIdx(i); setA(pr.domain[0]); setB(pr.domain[1]); }} style={{ padding: '4px 12px', borderRadius: 14, fontSize: 12, cursor: 'pointer', fontWeight: i === fnIdx ? 600 : 400, border: `0.5px solid ${i === fnIdx ? '#6366f1' : 'var(--color-border-secondary)'}`, background: i === fnIdx ? '#eef2ff' : 'transparent', color: i === fnIdx ? '#4338ca' : 'var(--color-text-secondary)' }}>{pr.label}</button>
        ))}
      </div>
      <div>
        {/* Section: Explorer */}
        {section === 'explorer' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ marginBottom: 10, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 16 }}>
              For any continuous function <M t={'f'} /> on <M t={'[a, b]'} />, there exists <M t={'c \\in [a, b]'} /> such that
              <M t={'\\int_a^b f(x)\\,dx = f(c)(b-a)'} display />
              The area under <M t={'f'} /> equals the area of a rectangle at the average value.
            </div>
            <svg width={W} height={H} style={{ overflow: 'visible', background: 'var(--color-background-secondary)', borderRadius: 8, border: '1px solid var(--color-border-tertiary)' }}>
              {/* Gridlines */}
              {xSc.ticks(7).map((t, i) => (
                <line key={i} x1={xSc(t)} x2={xSc(t)} y1={margin.top} y2={H - margin.bottom} stroke="#e2e8f0" strokeDasharray="3,3" />
              ))}
              {ySc.ticks(6).map((t, i) => (
                <line key={i} x1={margin.left} x2={W - margin.right} y1={ySc(t)} y2={ySc(t)} stroke="#e2e8f0" strokeDasharray="3,3" />
              ))}
              {/* Area under f(x) */}
              <polygon
                points={polygonPoints}
                fill="var(--color-accent-blue, #38bdf8)" opacity={0.22}
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
                    fill="var(--color-accent-yellow, #f59e0b)" opacity={0.18}
                    stroke="var(--color-accent-yellow, #f59e0b)" strokeWidth={1.2}
                  />
                );
              })()}
              <polyline
                fill="none"
                stroke="var(--color-accent-indigo, #6470f1)"
                strokeWidth={2.5}
                points={curvePts.map(({ x, y }) => `${xSc(x)},${ySc(y)}`).join(' ')}
              />
              <line
                x1={xSc(c)} x2={xSc(c)}
                y1={ySc(0)} y2={ySc(fn(c))}
                stroke="var(--color-accent-green, #10b981)" strokeWidth={2.2} strokeDasharray="5,3"
              />
              <circle
                cx={xSc(c)} cy={ySc(fn(c))} r={7}
                fill="var(--color-accent-green, #10b981)" stroke="var(--color-background-primary, #fff)" strokeWidth={1.5}
              />
              <text x={xSc(c)} y={ySc(fn(c)) - 12} textAnchor="middle" fontSize={12} fill="var(--color-accent-green, #10b981)">c</text>
              <text x={W - margin.right - 4} y={margin.top + 2} textAnchor="end" fontSize={13} fill="var(--color-accent-indigo, #6470f1)" fontWeight="bold">{PRESETS[fnIdx].fnTex}</text>
              <text x={xSc(a)} y={ySc(0) + 18} textAnchor="middle" fontSize={12} fill="var(--color-accent-yellow, #f59e0b)" fontWeight="bold">a</text>
              <text x={xSc(b)} y={ySc(0) + 18} textAnchor="middle" fontSize={12} fill="var(--color-accent-yellow, #f59e0b)" fontWeight="bold">b</text>
              <text x={(xSc(a) + xSc(b)) / 2} y={ySc(avgValue) - 8} textAnchor="middle" fontSize={13} fill="var(--color-accent-yellow, #f59e0b)">Area = f(c)·(b-a)</text>
              <text x={(xSc(a) + xSc(b)) / 2} y={H - 12} textAnchor="middle" fontSize={12} fill="var(--color-text-tertiary, #64748b)">
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
            <div style={{ background: 'var(--color-background-error, #FCEBEB)', borderLeft: '3px solid var(--color-accent-error, #ef4444)', borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-accent-error-dark, #501313)', marginBottom: 8 }}>The trap: confusing total area with average value</div>
              <div style={{ fontSize: 14, color: 'var(--color-accent-error-text, #791F1F)', marginBottom: 8 }}>
                Many students compute <M t={'\\int_a^b f(x)dx'} /> correctly but forget to divide by <M t={'b-a'} /> to get the average value. They report the total area, not the average height.
              </div>
              <WhyPanel why={{
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
            <div style={{ background: 'var(--color-background-secondary, #eef2ff)', borderLeft: '3px solid var(--color-accent-indigo, #6366f1)', borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-accent-indigo, #4338ca)', marginBottom: 8 }}>Proof Sketch</div>
              <ol style={{ marginLeft: 18, color: 'var(--color-text-primary, #334155)', fontSize: 14, lineHeight: 1.7 }}>
                <li>By the Extreme Value Theorem, <M t={'f'} /> attains its max <M t={'M'} /> and min <M t={'m'} /> on <M t={'[a, b]'} />.</li>
                <li>The average value <M t={'f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f(x)dx'} /> is between <M t={'m'} /> and <M t={'M'} />.</li>
                <li>By the Intermediate Value Theorem, since <M t={'f'} /> is continuous, there is <M t={'c'} /> with <M t={'f(c) = f_{\\text{avg}}'} />.</li>
                <li>So <M t={'\\int_a^b f(x)dx = f(c)(b-a)'} /> for some <M t={'c \\in [a, b]'} />.</li>
              </ol>
              <WhyPanel why={{
                tag: 'Why does the IVT apply?',
                explanation: 'The Intermediate Value Theorem applies to any continuous function on a closed interval. Since f is continuous, and f(a) ≤ f_{avg} ≤ f(b), there must be some c with f(c) = f_{avg}.',
              }} />
            </div>
          </div>
        )}

        {/* Section: Intuition */}
        {section === 'intuition' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ background: 'var(--color-background-success, #ecfdf5)', borderLeft: '3px solid var(--color-accent-green, #059669)', borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-accent-green-dark, #047857)', marginBottom: 8 }}>Intuition</div>
              <div style={{ fontSize: 14, color: 'var(--color-accent-green-text, #0F6E56)', marginBottom: 8 }}>
                The theorem says: if you average the function’s values over an interval, there must be a point where the function actually equals that average. It’s like saying: if your average speed was 60 mph, you must have been going exactly 60 mph at some instant.
              </div>
              <WhyPanel why={{
                tag: 'Why is this surprising?',
                explanation: 'It’s not obvious that a wiggly function must hit its average value. But continuity means it can’t “jump over” the average without touching it.',
              }} />
            </div>
          </div>
        )}

        {/* Section: Real-World */}
        {section === 'real' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ background: 'var(--color-background-info, #e1f5ee)', borderLeft: '3px solid var(--color-accent-green, #10b981)', borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-accent-green, #10b981)', marginBottom: 8 }}>Real-World Context</div>
              <div style={{ fontSize: 14, color: 'var(--color-accent-green-text, #0F6E56)', marginBottom: 8 }}>
                If the average temperature over a week is 70°F, the theorem guarantees there was a moment when the temperature was exactly 70°F. This applies to average speed, rainfall, power output, and more.
              </div>
            </div>
          </div>
        )}

        {/* Section: Examples */}
        {section === 'examples' && (
          <div style={{ animation: 'sd .2s ease-out' }}>
            <div style={{ background: 'var(--color-background-secondary, #e0f2fe)', borderLeft: '3px solid var(--color-accent-blue, #0ea5e9)', borderRadius: 8, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-accent-blue, #0ea5e9)', marginBottom: 8 }}>Examples</div>
              <div style={{ marginBottom: 10, color: 'var(--color-text-primary)' }}>
                <b>1. <M t={'f(x) = x^2'} /> on <M t={'[0,2]'} />:</b><br />
                <M t={'\\int_0^2 x^2 dx = [x^3/3]_0^2 = 8/3'} display />
                <M t={'f(c)\cdot 2 = 8/3 \\implies f(c) = 4/3 \\implies c = \\sqrt{4/3} \\approx 1.155'} display />
              </div>
              <div style={{ color: 'var(--color-text-primary)' }}>
                <b>2. <M t={'f(x) = \\sin(x)'} /> on <M t={'[0,\\pi]'} />:</b><br />
                <M t={'f_{\\text{avg}} = (1/\\pi)\\int_0^\\pi \\sin(x) dx = 2/\\pi \\approx 0.637'} display />
                <M t={'\\sin(c) = 2/\\pi \\implies c = \\arcsin(2/\\pi) \\approx 0.690'} display />
              </div>
            </div>
          </div>
        )}

        {/* Final panel: Why is this useful? */}
        <div style={{ background: 'var(--color-warning-bg, #fef9c3)', borderLeft: '3px solid var(--color-warning-border, #facc15)', borderRadius: 8, padding: 18, marginTop: 24, color: 'var(--color-text-primary)' }}>
          <b style={{ color: 'var(--color-warning-border, #facc15)' }}>Why is this useful?</b> This theorem lets you replace a complicated area with a simple rectangle — making average value calculations and estimates much easier. It's used in physics, engineering, and probability whenever you want to know if a function actually attains its average value.
        </div>
      </div>
    </div>
  );
}
