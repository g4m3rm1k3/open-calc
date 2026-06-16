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

export default function AverageValueExplorerMVT() {
  const isDark = useIsDark();
  const C = isDark ? darkColors : lightColors;
  const [fnIdx, setFnIdx] = useState(0);
  const PRESETS = [
    { label: 'f(x) = x^2', fn: x => x * x, domain: [0, 3], fnTex: 'x^2' },
    { label: 'f(x) = 1/x', fn: x => 1 / (x + 0.2), domain: [0, 2.8], fnTex: '1/x' },
    { label: 'f(x) = e^x', fn: x => Math.exp(x), domain: [0, 2], fnTex: 'e^x' },
  ];
  const fn = PRESETS[fnIdx].fn;
  const domain = PRESETS[fnIdx].domain;
  const [a, setA] = useState(domain[0]);
  const [b, setB] = useState(domain[1]);

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
  const yVals = d3.range(domain[0], domain[1] + yStep, yStep).map(fn);
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
  const polygonPoints = [
    [xSc(a), ySc(0)],
    ...areaPts.map(([x, y]) => [xSc(x), ySc(y)]),
    [xSc(b), ySc(0)]
  ].map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0', maxWidth: 800, margin: '0 auto', color: C.textMain, background: C.bg }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: C.textMain }}>Average Value Explorer</h2>
      <div style={{ textAlign: 'center', color: C.textMuted, fontSize: 16, marginBottom: 12 }}>
        Explore how the average value of a function on [a, b] relates to the area under the curve and the Mean Value Theorem for Integrals.
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {PRESETS.map((pr, i) => (
          <button key={i} onClick={() => { setFnIdx(i); setA(pr.domain[0]); setB(pr.domain[1]); }} style={{ padding: '4px 12px', borderRadius: 14, fontSize: 12, cursor: 'pointer', fontWeight: i === fnIdx ? 600 : 400, border: `0.5px solid ${i === fnIdx ? C.indigoMain : C.border}`, background: i === fnIdx ? C.indigoBg : 'transparent', color: i === fnIdx ? C.indigoText : C.textMuted }}>{pr.label}</button>
        ))}
      </div>
      <svg width={W} height={H} style={{ overflow: 'visible', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
        {/* Area under f(x) */}
        <polygon points={polygonPoints} fill={C.blueMain} opacity={0.22} />
        {/* Rectangle for mean value */}
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
        {/* Curve */}
        <polyline
          fill="none"
          stroke={C.indigoMain}
          strokeWidth={2.5}
          points={curvePts.map(({ x, y }) => `${xSc(x)},${ySc(y)}`).join(' ')}
        />
        {/* c marker */}
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
      <div style={{ background: C.yellowBg, borderLeft: `3px solid ${C.yellowBorder}`, borderRadius: 8, padding: 18, marginTop: 24, color: C.textMain, marginBottom: 16 }}>
        <b style={{ color: C.yellowBorder }}>Try it:</b> Adjust the interval and see how the average value changes. The theorem guarantees there is always some c where f(c) equals this average.
      </div>
    </div>
  );
}
