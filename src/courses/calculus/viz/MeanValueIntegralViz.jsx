import * as d3 from 'd3';
import { useRef, useEffect, useState } from 'react';
import SliderControl from './SliderControl.jsx';

const W = 600, H = 360;
const M = { top: 28, right: 28, bottom: 48, left: 60 };

const PRESETS = [
  {
    label: 'f(x) = x²',
    fn: (x) => x * x,
    domain: [0, 3],
    fnTex: 'x^2',
  },
  {
    label: 'f(x) = sin(x)',
    fn: (x) => Math.sin(x),
    domain: [0, Math.PI],
    fnTex: 'sin(x)',
  },
  {
    label: 'f(x) = 2x + 1',
    fn: (x) => 2 * x + 1,
    domain: [0, 4],
    fnTex: '2x + 1',
  },
  {
    label: 'f(x) = e^{0.5x}',
    fn: (x) => Math.exp(0.5 * x),
    domain: [0, 3],
    fnTex: 'e^{0.5x}',
  },
];

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

export default function MeanValueIntegralViz() {
  const svgRef = useRef(null);
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];
  const [domain, setDomain] = useState(preset.domain);
  const [a, setA] = useState(preset.domain[0]);
  const [b, setB] = useState(preset.domain[1]);
  const [c, setC] = useState((preset.domain[0] + preset.domain[1]) / 2);

  useEffect(() => {
    setDomain(PRESETS[presetIdx].domain);
    setA(PRESETS[presetIdx].domain[0]);
    setB(PRESETS[presetIdx].domain[1]);
    setC((PRESETS[presetIdx].domain[0] + PRESETS[presetIdx].domain[1]) / 2);
  }, [presetIdx]);

  const fn = preset.fn;
  const integral = numericalIntegral(fn, a, b);
  // Find c such that f(c) = average value = (1/(b-a)) * integral
  const avgValue = (b > a) ? integral / (b - a) : 0;
  // Find closest c in [a, b] such that f(c) = avgValue
  function findC() {
    let minDiff = Infinity, bestC = a;
    for (let x = a; x <= b; x += (b - a) / 500) {
      const diff = Math.abs(fn(x) - avgValue);
      if (diff < minDiff) { minDiff = diff; bestC = x; }
    }
    return bestC;
  }
  const autoC = findC();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const [dMin, dMax] = domain;
    const xSc = d3.scaleLinear().domain([dMin, dMax]).range([M.left, W - M.right]);
    // Compute y domain
    const yVals = d3.range(dMin, dMax, (dMax - dMin) / 200).map(fn);
    const yMin = Math.min(...yVals, 0, avgValue);
    const yMax = Math.max(...yVals, 0, avgValue);
    const yPad = (yMax - yMin) * 0.18 || 0.5;
    const ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([H - M.bottom, M.top]);

    // Gridlines
    xSc.ticks(7).forEach((t) => {
      svg.append('line')
        .attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3');
    });
    ySc.ticks(6).forEach((t) => {
      svg.append('line')
        .attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3');
    });

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(7)).attr('color', '#94a3b8');
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8');

    // Area under f(x) from a to b
    const N_AREA = 600;
    const dx = (b - a) / N_AREA;
    let areaPts = [];
    for (let i = 0; i <= N_AREA; i++) {
      const x = a + i * dx;
      areaPts.push([x, fn(x)]);
    }
    const areaGen = d3.area()
      .x(([x]) => xSc(x))
      .y0(ySc(0))
      .y1(([, y]) => ySc(y));
    svg.append('path').datum(areaPts).attr('fill', '#38bdf8').attr('opacity', 0.22).attr('d', areaGen);

    // Rectangle for mean value
    svg.append('rect')
      .attr('x', xSc(a))
      .attr('y', ySc(avgValue))
      .attr('width', xSc(b) - xSc(a))
      .attr('height', ySc(0) - ySc(avgValue))
      .attr('fill', '#f59e0b').attr('opacity', 0.18)
      .attr('stroke', '#f59e0b').attr('stroke-width', 1.2);

    // Curve
    const curvePts = d3.range(dMin, dMax + (dMax - dMin) / 300, (dMax - dMin) / 300).map((x) => ({ x, y: fn(x) }));
    const lineGen = d3.line().x((d) => xSc(d.x)).y((d) => ySc(d.y));
    svg.append('path').datum(curvePts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', lineGen);

    // c marker
    svg.append('line')
      .attr('x1', xSc(autoC)).attr('x2', xSc(autoC))
      .attr('y1', ySc(0)).attr('y2', ySc(fn(autoC)))
      .attr('stroke', '#10b981').attr('stroke-width', 2.2).attr('stroke-dasharray', '5,3');
    svg.append('circle')
      .attr('cx', xSc(autoC)).attr('cy', ySc(fn(autoC)))
      .attr('r', 7).attr('fill', '#10b981').attr('stroke', 'white').attr('stroke-width', 1.5);
    svg.append('text')
      .attr('x', xSc(autoC)).attr('y', ySc(fn(autoC)) - 12)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#10b981')
      .text('c');

    // Labels
    svg.append('text')
      .attr('x', W - M.right - 4).attr('y', M.top + 2)
      .attr('text-anchor', 'end').attr('font-size', 13).attr('fill', '#6470f1').attr('font-weight', 'bold')
      .text(`f(x) = ${preset.fnTex}`);
    svg.append('text')
      .attr('x', xSc(a)).attr('y', ySc(0) + 18)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#f59e0b').attr('font-weight', 'bold')
      .text('a');
    svg.append('text')
      .attr('x', xSc(b)).attr('y', ySc(0) + 18)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#f59e0b').attr('font-weight', 'bold')
      .text('b');
    svg.append('text')
      .attr('x', (xSc(a) + xSc(b)) / 2).attr('y', ySc(avgValue) - 8)
      .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#f59e0b')
      .text('Area = f(c)·(b-a)');
    svg.append('text')
      .attr('x', (xSc(a) + xSc(b)) / 2).attr('y', H - 12)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b')
      .text(`∫ₐᵇ f(x) dx ≈ ${integral.toFixed(4)}   |   f(c) ≈ ${fn(autoC).toFixed(4)}   |   c ≈ ${autoC.toFixed(3)}`);
  }, [presetIdx, a, b, c, domain, fn, avgValue, autoC, integral]);

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-1 space-y-3">
        <SliderControl
          label={`a (left endpoint)`}
          min={domain[0]}
          max={b - 0.05 * (domain[1] - domain[0])}
          step={(domain[1] - domain[0]) / 200}
          value={a}
          onChange={setA}
          format={(v) => `a = ${v.toFixed(3)}`}
        />
        <SliderControl
          label={`b (right endpoint)`}
          min={a + 0.05 * (domain[1] - domain[0])}
          max={domain[1]}
          step={(domain[1] - domain[0]) / 200}
          value={b}
          onChange={setB}
          format={(v) => `b = ${v.toFixed(3)}`}
        />
        <div className="flex flex-wrap gap-2 justify-center">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPresetIdx(i)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                i === presetIdx
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-center text-slate-500 mt-2 italic px-4">
        The orange rectangle has the same area as the blue region: ∫ₐᵇ f(x) dx = f(c)·(b-a). The Mean Value Theorem for Integrals guarantees at least one c ∈ [a, b] where this is true.
      </p>
    </div>
  );
}
