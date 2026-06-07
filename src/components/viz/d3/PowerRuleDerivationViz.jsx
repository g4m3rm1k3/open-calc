import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

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

const W = 600,
  H = 450;
const MARGIN = { top: 20, right: 20, bottom: 80, left: 60 };

const FUNCTIONS = [
  {
    name: "x²",
    f: "x*x",
    F1: "x*x*x/3",
    F2: "x*x*x/3 + 5",
    description: "Two antiderivatives of 2x: x³/3 and x³/3 + 5",
  },
  {
    name: "sin(x)",
    f: "Math.sin(x)",
    F1: "-Math.cos(x)",
    F2: "-Math.cos(x) + 2",
    description: "Two antiderivatives of sin(x): -cos(x) and -cos(x) + 2",
  },
  {
    name: "eˣ",
    f: "Math.exp(x)",
    F1: "Math.exp(x)",
    F2: "Math.exp(x) - 3",
    description: "Two antiderivatives of eˣ: eˣ and eˣ - 3",
  },
];

export default function ConstantDifferenceProof({ params }) {
  const svgRef = useRef(null);
  const [functionIdx, setFunctionIdx] = useState(0);
  const [showDifference, setShowDifference] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const isDark = useIsDark();

  const func = FUNCTIONS[functionIdx];

  const C = {
    text: isDark ? "#94a3b8" : "#64748b",
    grid: isDark ? "#334155" : "#e2e8f0",
    blue: isDark ? "#60a5fa" : "#3b82f6",
    purple: isDark ? "#a78bfa" : "#8b5cf6",
    red: isDark ? "#f87171" : "#ef4444",
    emerald: isDark ? "#34d399" : "#10b981",
    bg: isDark ? "#0f172a" : "#ffffff",
    border: isDark ? "#1e293b" : "#e5e7eb"
  };

  const makeFn = (expr) => {
    try {
      // eslint-disable-next-line no-new-func
      const compiled = new Function("x", `"use strict"; return (${expr})`);
      return (x) => {
        try {
          const y = compiled(x);
          return Number.isFinite(y) ? y : null;
        } catch {
          return null;
        }
      };
    } catch {
      return () => null;
    }
  };

  const f = makeFn(func.f); // The common derivative
  const F1 = makeFn(func.F1); // First antiderivative
  const F2 = makeFn(func.F2); // Second antiderivative
  const difference = (x) => F2(x) - F1(x); // Should be constant

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set domain based on function
    let domain = [-3, 3];
    if (func.name === "sin(x)") domain = [-Math.PI, Math.PI];
    if (func.name === "eˣ") domain = [-2, 2];

    const [xMin, xMax] = domain;
    const xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([MARGIN.left, W - MARGIN.right]);

    // Calculate y domain
    let yMin = Infinity,
      yMax = -Infinity;
    for (let x = xMin; x <= xMax; x += 0.1) {
      const y1 = F1(x);
      const y2 = F2(x);
      const yd = f(x);
      if (y1 !== null && isFinite(y1)) {
        yMin = Math.min(yMin, y1);
        yMax = Math.max(yMax, y1);
      }
      if (y2 !== null && isFinite(y2)) {
        yMin = Math.min(yMin, y2);
        yMax = Math.max(yMax, y2);
      }
      if (yd !== null && isFinite(yd)) {
        yMin = Math.min(yMin, yd);
        yMax = Math.max(yMax, yd);
      }
    }
    const padding = (yMax - yMin) * 0.1 || 1;
    const yScale = d3
      .scaleLinear()
      .domain([yMin - padding, yMax + padding])
      .range([H - MARGIN.bottom, MARGIN.top]);

    // Grid lines
    const xTicks = xScale.ticks(6);
    xTicks.forEach((tick) => {
      svg
        .append("line")
        .attr("x1", xScale(tick))
        .attr("x2", xScale(tick))
        .attr("y1", MARGIN.top)
        .attr("y2", H - MARGIN.bottom)
        .attr("stroke", C.grid)
        .attr("stroke-dasharray", "2,2");
    });

    const yTicks = yScale.ticks(6);
    yTicks.forEach((tick) => {
      svg
        .append("line")
        .attr("x1", MARGIN.left)
        .attr("x2", W - MARGIN.right)
        .attr("y1", yScale(tick))
        .attr("y2", yScale(tick))
        .attr("stroke", C.grid)
        .attr("stroke-dasharray", "2,2");
    });

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .attr("color", C.text);

    svg
      .append("g")
      .attr("transform", `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .attr("color", C.text);

    const line = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .defined((d) => d[1] !== null);

    // Generate points
    const fPoints = [];
    const F1Points = [];
    const F2Points = [];
    const diffPoints = [];

    for (let x = xMin; x <= xMax; x += 0.05) {
      const yf = f(x);
      const y1 = F1(x);
      const y2 = F2(x);
      const yd = difference(x);

      if (yf !== null) fPoints.push([x, yf]);
      if (y1 !== null) F1Points.push([x, y1]);
      if (y2 !== null) F2Points.push([x, y2]);
      if (yd !== null && showDifference) diffPoints.push([x, yd]);
    }

    // Plot the common derivative (slope field representation)
    if (showProof) {
      // Show slope field - small line segments showing derivative
      for (let x = xMin; x <= xMax; x += 0.3) {
        const slope = f(x);
        if (slope !== null && isFinite(slope)) {
          const y = (F1(x) + F2(x)) / 2; // Average of the two functions
          if (y !== null && isFinite(y)) {
            const dx = 0.1;
            const dy = slope * dx;
            svg
              .append("line")
              .attr("x1", xScale(x - dx / 2))
              .attr("x2", xScale(x + dx / 2))
              .attr("y1", yScale(y - dy / 2))
              .attr("y2", yScale(y + dy / 2))
              .attr("stroke", C.emerald)
              .attr("stroke-width", 1);
          }
        }
      }
    }

    // Plot F1 and F2
    svg
      .append("path")
      .datum(F1Points)
      .attr("fill", "none")
      .attr("stroke", C.blue)
      .attr("stroke-width", 3)
      .attr("d", line);

    svg
      .append("path")
      .datum(F2Points)
      .attr("fill", "none")
      .attr("stroke", C.purple)
      .attr("stroke-width", 3)
      .attr("d", line);

    // Plot difference if enabled
    if (showDifference) {
      svg
        .append("path")
        .datum(diffPoints)
        .attr("fill", "none")
        .attr("stroke", C.red)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6,3")
        .attr("d", line);
    }

    // Legend
    const legendY = MARGIN.top + 10;
    let legendItem = 0;

    svg
      .append("line")
      .attr("x1", W - MARGIN.right - 140)
      .attr("x2", W - MARGIN.right - 120)
      .attr("y1", legendY + legendItem * 20)
      .attr("y2", legendY + legendItem * 20)
      .attr("stroke", C.blue)
      .attr("stroke-width", 3);

    svg
      .append("text")
      .attr("x", W - MARGIN.right - 115)
      .attr("y", legendY + legendItem * 20 + 4)
      .attr("font-size", 12)
      .attr("fill", C.blue)
      .text("F₁(x) - one antiderivative");

    legendItem++;

    svg
      .append("line")
      .attr("x1", W - MARGIN.right - 140)
      .attr("x2", W - MARGIN.right - 120)
      .attr("y1", legendY + legendItem * 20)
      .attr("y2", legendY + legendItem * 20)
      .attr("stroke", C.purple)
      .attr("stroke-width", 3);

    svg
      .append("text")
      .attr("x", W - MARGIN.right - 115)
      .attr("y", legendY + legendItem * 20 + 4)
      .attr("font-size", 12)
      .attr("fill", C.purple)
      .text("F₂(x) - another antiderivative");

    if (showDifference) {
      legendItem++;
      svg
        .append("line")
        .attr("x1", W - MARGIN.right - 140)
        .attr("x2", W - MARGIN.right - 120)
        .attr("y1", legendY + legendItem * 20)
        .attr("y2", legendY + legendItem * 20)
        .attr("stroke", C.red)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6,3");

      svg
        .append("text")
        .attr("x", W - MARGIN.right - 115)
        .attr("y", legendY + legendItem * 20 + 4)
        .attr("font-size", 12)
        .attr("fill", C.red)
        .text("F₂(x) - F₁(x) = constant");
    }

    // Axis labels
    svg
      .append("text")
      .attr("x", W / 2)
      .attr("y", H - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", C.text)
      .text("x");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -H / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", C.text)
      .text("y");
  }, [functionIdx, showDifference, showProof, isDark]);

  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        ref={svgRef}
        width={W}
        height={H}
        className="border transition-colors duration-300 rounded"
        style={{ backgroundColor: C.bg, borderColor: C.border }}
      ></svg>

      <div className="flex flex-col gap-4 w-full max-w-2xl px-4">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Why Antiderivatives Differ by Constants
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            If two functions have the same derivative, they can only differ by a{" "}
            <strong>constant</strong>. This is the mathematical foundation of the
            +C in ∫f(x) dx = F(x) + C.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm font-semibold text-green-900 dark:text-green-200">Choose function:</label>
            <select
              value={functionIdx}
              onChange={(e) => {
                setFunctionIdx(Number(e.target.value));
                setShowDifference(false);
                setShowProof(false);
              }}
              className="px-3 py-1 bg-white dark:bg-slate-800 border border-green-200 dark:border-green-700 rounded text-slate-900 dark:text-slate-100"
            >
              {FUNCTIONS.map((fn, i) => (
                <option key={i} value={i}>
                  {fn.name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-green-800 dark:text-green-300 mb-3 font-medium">{func.description}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-green-100 dark:border-green-900/50">
            Both functions have the same derivative: F₁'(x) = F₂'(x) ={" "}
            <span className="font-mono text-green-700 dark:text-green-400 font-bold">{func.f.replace("Math.", "").replace("*", "")}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-green-100 dark:border-green-900/50">
              <input
                type="checkbox"
                id="show-difference"
                checked={showDifference}
                onChange={(e) => setShowDifference(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 dark:text-blue-400 focus:ring-blue-500"
              />
              <label htmlFor="show-difference" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Show F₂(x) - F₁(x)
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-green-100 dark:border-green-900/50">
              <input
                type="checkbox"
                id="show-proof"
                checked={showProof}
                onChange={(e) => setShowProof(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500"
              />
              <label htmlFor="show-proof" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Show slope field
              </label>
            </div>
          </div>

          {showDifference && (
            <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50 animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-red-700 dark:text-red-400 font-bold mb-1 uppercase tracking-tight">Constant Difference:</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-mono text-slate-900 dark:text-white">
                  {Math.round(difference(1) * 100) / 100}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400 tracking-tighter">(constant along whole domain)</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">
                This proves the theorem: any two antiderivatives differ by a
                constant.
              </p>
            </div>
          )}

          {showProof && (
            <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-900/50 animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-bold mb-1 uppercase tracking-tight">Slope Field:</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Both curves follow the <span className="text-emerald-600 dark:text-emerald-400 font-bold dark:text-emerald-400 uppercase text-xs">same paths</span> locally. Their shapes are rigid copies of each other, shifted vertically.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="mb-2">
              <strong className="text-slate-900 dark:text-slate-200">Theorem:</strong> If F'(x) = G'(x) for all x in an interval,
              then F(x) = G(x) + C for some constant C.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-200">Proof Sketch:</strong> Let H(x) = G(x) - F(x). Then H'(x) = 0, so H
              is constant by the Mean Value Theorem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
