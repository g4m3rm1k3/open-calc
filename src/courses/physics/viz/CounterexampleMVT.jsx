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

export default function CounterexampleMVT() {
  const isDark = useIsDark();
  const C = isDark ? darkColors : lightColors;
  // Discontinuous function: step function
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);
  const fn = x => (x < 1 ? 1 : 3); // Discontinuous at x=1
  const domain = [0, 2];

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
  // Try to find c where f(c) = avgValue
  function findC() {
    if (b <= a) return a;
    const step = (b - a) / 500;
    for (let x = a; x <= b; x += step) {
      if (Math.abs(fn(x) - avgValue) < 1e-2) return x;
    }
    return null;
  }
  const c = useMemo(() => findC(), [a, b, avgValue]);

  // D3/SVG setup
  const W = 600, H = 340, margin = { top: 28, right: 28, bottom: 48, left: 60 };
  const xSc = d3.scaleLinear().domain([domain[0], domain[1]]).range([margin.left, W - margin.right]);
  const ySc = d3.scaleLinear().domain([0, 4]).range([H - margin.bottom, margin.top]);
  // Step function points
  const stepPts = [
    { x: a, y: fn(a) },
    { x: 1 - 1e-6, y: 1 },
    { x: 1, y: 3 },
    { x: b, y: fn(b) },
  ];
  // Area polygon
  const areaPts = [
    [xSc(a), ySc(0)],
    [xSc(a), ySc(fn(a))],
    [xSc(1), ySc(1)],
    [xSc(1), ySc(3)],
    [xSc(b), ySc(fn(b))],
    [xSc(b), ySc(0)],
  ];
  const polygonPoints = areaPts.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0', maxWidth: 800, margin: '0 auto', color: C.textMain, background: C.bg }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: C.textMain }}>Counterexample: Failure Without Continuity</h2>
      <div style={{ textAlign: 'center', color: C.textMuted, fontSize: 16, marginBottom: 12 }}>
        The Mean Value Theorem for Integrals requires <b>continuity</b>. Here, a step function is not continuous, and there may be no c where f(c) equals the average value.
      </div>
      <svg width={W} height={H} style={{ overflow: 'visible', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
        {/* Area under f(x) */}
        <polygon points={polygonPoints} fill={C.redMain} opacity={0.18} />
        {/* Step function */}
        <polyline
          fill="none"
          stroke={C.redMain}
          strokeWidth={2.5}
          points={stepPts.map(({ x, y }) => `${xSc(x)},${ySc(y)}`).join(' ')}
        />
        {/* Discontinuity marker */}
        <circle cx={xSc(1)} cy={ySc(1)} r={6} fill={C.redMain} stroke={C.bg} strokeWidth={1.5} />
        <circle cx={xSc(1)} cy={ySc(3)} r={6} fill={C.redMain} stroke={C.bg} strokeWidth={1.5} />
        {/* Average value line */}
        <line
          x1={xSc(a)} x2={xSc(b)}
          y1={ySc(avgValue)} y2={ySc(avgValue)}
          stroke={C.yellowMain} strokeWidth={2} strokeDasharray="4,3"
        />
        <text x={xSc(a) + 10} y={ySc(avgValue) - 8} fontSize={13} fill={C.yellowMain}>Average value</text>
        {/* c marker (if exists) */}
        {c && (
          <circle cx={xSc(c)} cy={ySc(fn(c))} r={7} fill={C.greenMain} stroke={C.bg} strokeWidth={1.5} />
        )}
        <text x={xSc(a)} y={ySc(0) + 18} textAnchor="middle" fontSize={12} fill={C.yellowMain} fontWeight="bold">a</text>
        <text x={xSc(b)} y={ySc(0) + 18} textAnchor="middle" fontSize={12} fill={C.yellowMain} fontWeight="bold">b</text>
        <text x={(xSc(a) + xSc(b)) / 2} y={H - 12} textAnchor="middle" fontSize={12} fill={C.textMuted}>
          {`∫ₐᵇ f(x) dx ≈ ${integral.toFixed(4)}   |   f(c) ≈ ${c ? fn(c).toFixed(4) : '—'}   |   c ≈ ${c ? c.toFixed(3) : '—'}`}
        </text>
      </svg>
      <div style={{ background: C.redBg, borderLeft: `3px solid ${C.redMain}`, borderRadius: 8, padding: 18, marginTop: 24, color: C.textMain, marginBottom: 16 }}>
        <b style={{ color: C.redMain }}>Key point:</b> If a function is not continuous, the theorem can fail. Here, the average value is not actually attained by the function anywhere on [a, b].
      </div>
    </div>
  );
}
