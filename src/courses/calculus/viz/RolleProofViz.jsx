import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

const W = 580;
const H = 340;
const M = { top: 34, right: 24, bottom: 54, left: 56 };

const PRESETS = [
  {
    label: "f(x) = x² on [−1, 1]",
    f: (x) => x * x,
    fPrime: (x) => 2 * x,
    a: -1,
    b: 1,
    domain: [-1.4, 1.4],
    yDomain: [-0.4, 1.8],
    endpointHeight: 1,
    endpointLabel: "f(a) = f(b) = 1",
    cPoints: [0],
  },
  {
    label: "f(x) = x³ − 4x on [−2, 2]",
    f: (x) => x * x * x - 4 * x,
    fPrime: (x) => 3 * x * x - 4,
    a: -2,
    b: 2,
    domain: [-2.4, 2.4],
    yDomain: [-4.8, 4.8],
    endpointHeight: 0,
    endpointLabel: "f(a) = f(b) = 0",
    cPoints: [-2 / Math.sqrt(3), 2 / Math.sqrt(3)],
  },
  {
    label: "f(x) = sin(x) on [0, 2π]",
    f: (x) => Math.sin(x),
    fPrime: (x) => Math.cos(x),
    a: 0,
    b: 2 * Math.PI,
    domain: [-0.2, 2 * Math.PI + 0.2],
    yDomain: [-1.4, 1.4],
    endpointHeight: 0,
    endpointLabel: "f(a) = f(b) = 0",
    cPoints: [Math.PI / 2, (3 * Math.PI) / 2],
  },
  {
    label: "f(x) = cos(x) on [0, 2π]",
    f: (x) => Math.cos(x),
    fPrime: (x) => -Math.sin(x),
    a: 0,
    b: 2 * Math.PI,
    domain: [-0.2, 2 * Math.PI + 0.2],
    yDomain: [-1.4, 1.6],
    endpointHeight: 1,
    endpointLabel: "f(a) = f(b) = 1",
    cPoints: [Math.PI],
  },
];

export default function RolleProofViz() {
  const svgRef = useRef(null);
  const [fnIdx, setFnIdx] = useState(0);
  const preset = PRESETS[fnIdx];
  const {
    f,
    fPrime,
    a,
    b,
    domain,
    yDomain,
    endpointHeight,
    endpointLabel,
    cPoints,
    label,
  } = preset;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xSc = d3
      .scaleLinear()
      .domain(domain)
      .range([M.left, W - M.right]);
    const ySc = d3
      .scaleLinear()
      .domain(yDomain)
      .range([H - M.bottom, M.top]);

    const xTicks = xSc.ticks(7);
    const yTicks = ySc.ticks(6);

    xTicks.forEach((t) => {
      svg
        .append("line")
        .attr("x1", xSc(t))
        .attr("x2", xSc(t))
        .attr("y1", M.top)
        .attr("y2", H - M.bottom)
        .attr("stroke", "#e2e8f0")
        .attr("stroke-dasharray", "3,3");
    });
    yTicks.forEach((t) => {
      svg
        .append("line")
        .attr("x1", M.left)
        .attr("x2", W - M.right)
        .attr("y1", ySc(t))
        .attr("y2", ySc(t))
        .attr("stroke", "#e2e8f0")
        .attr("stroke-dasharray", "3,3");
    });

    const xAxisY = Math.max(M.top, Math.min(H - M.bottom, ySc(0)));
    const yAxisX = Math.max(M.left, Math.min(W - M.right, xSc(0)));
    svg
      .append("g")
      .attr("transform", `translate(0,${xAxisY})`)
      .call(d3.axisBottom(xSc).ticks(7))
      .attr("color", "#94a3b8");
    svg
      .append("g")
      .attr("transform", `translate(${yAxisX},0)`)
      .call(d3.axisLeft(ySc).ticks(6))
      .attr("color", "#94a3b8");

    const lineFn = d3
      .line()
      .x(([x]) => xSc(x))
      .y(([, y]) => ySc(y))
      .defined(([, y]) => isFinite(y));

    const points = d3
      .range(domain[0], domain[1] + 0.001, (domain[1] - domain[0]) / 300)
      .map((x) => [x, f(x)]);

    svg
      .append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2.5)
      .attr("d", lineFn);

    svg
      .append("path")
      .datum([
        [a, endpointHeight],
        [b, endpointHeight],
      ])
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 1.8)
      .attr("stroke-dasharray", "6,4");

    svg
      .append("path")
      .datum([
        [a, f(a)],
        [b, f(b)],
      ])
      .attr("fill", "none")
      .attr("stroke", "#0f766e")
      .attr("stroke-width", 1.6)
      .attr("stroke-dasharray", "5,3");
    [a, b].forEach((xv, i) => {
      svg
        .append("circle")
        .attr("cx", xSc(xv))
        .attr("cy", ySc(f(xv)))
        .attr("r", 6)
        .attr("fill", "#f59e0b");

      svg
        .append("text")
        .attr("x", xSc(xv))
        .attr("y", ySc(f(xv)) - 12)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "#f59e0b")
        .attr("font-weight", 700)
        .text(i === 0 ? "a" : "b");
    });

    cPoints.forEach((c, idx) => {
      const y0 = f(c);
      const width = Math.min((b - a) * 0.25, 1.4);
      const left = Math.max(domain[0], c - width);
      const right = Math.min(domain[1], c + width);

      svg
        .append("line")
        .attr("x1", xSc(left))
        .attr("x2", xSc(right))
        .attr("y1", ySc(y0))
        .attr("y2", ySc(y0))
        .attr("stroke", "#10b981")
        .attr("stroke-width", 3);

      svg
        .append("line")
        .attr("x1", xSc(c))
        .attr("x2", xSc(c))
        .attr("y1", ySc(y0))
        .attr("y2", xAxisY)
        .attr("stroke", "#10b981")
        .attr("stroke-dasharray", "4,3")
        .attr("stroke-width", 1.5);

      svg
        .append("circle")
        .attr("cx", xSc(c))
        .attr("cy", ySc(y0))
        .attr("r", 6)
        .attr("fill", "#10b981");

      svg
        .append("text")
        .attr("x", xSc(c))
        .attr("y", ySc(y0) + (y0 > endpointHeight ? 18 : -12))
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "#10b981")
        .attr("font-weight", 700)
        .text(cPoints.length > 1 ? `c${idx + 1}` : "c");
    });

    svg
      .append("text")
      .attr("x", M.left + 4)
      .attr("y", M.top + 16)
      .attr("font-size", 12)
      .attr("fill", "#4338ca")
      .attr("font-family", "monospace")
      .text(label);

    svg
      .append("text")
      .attr("x", W - M.right - 4)
      .attr("y", M.top + 16)
      .attr("text-anchor", "end")
      .attr("font-size", 11)
      .attr("fill", "#475569")
      .text(endpointLabel);

    const cText = cPoints
      .map((c, i) => {
        const suffix = cPoints.length > 1 ? `c${i + 1}` : "c";
        return `${suffix} = ${c.toFixed(3)}`;
      })
      .join("   ");

    svg
      .append("text")
      .attr("x", W / 2)
      .attr("y", H - M.bottom + 24)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "#10b981")
      .attr("font-family", "monospace")
      .text(`Rolle's Theorem guarantees f′(c) = 0 at ${cText}`);
  }, [f, a, b, domain, yDomain, endpointHeight, endpointLabel, cPoints, label]);

  return (
    <div>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
      />
      <div className="px-4 mt-3 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setFnIdx(idx)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${fnIdx === idx ? "bg-brand-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Select a function with equal endpoint values and watch the guaranteed
          horizontal tangent(s) appear between a and b.
        </p>
      </div>
    </div>
  );
}
