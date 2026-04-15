import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

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

  const func = FUNCTIONS[functionIdx];

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
        .attr("stroke", "#e2e8f0")
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
        .attr("stroke", "#e2e8f0")
        .attr("stroke-dasharray", "2,2");
    });

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .attr("color", "#64748b");

    svg
      .append("g")
      .attr("transform", `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .attr("color", "#64748b");

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
              .attr("stroke", "#10b981")
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
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("d", line);

    svg
      .append("path")
      .datum(F2Points)
      .attr("fill", "none")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Plot difference if enabled
    if (showDifference) {
      svg
        .append("path")
        .datum(diffPoints)
        .attr("fill", "none")
        .attr("stroke", "#ef4444")
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
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3);

    svg
      .append("text")
      .attr("x", W - MARGIN.right - 115)
      .attr("y", legendY + legendItem * 20 + 4)
      .attr("font-size", 12)
      .attr("fill", "#3b82f6")
      .text("F₁(x) - one antiderivative");

    legendItem++;

    svg
      .append("line")
      .attr("x1", W - MARGIN.right - 140)
      .attr("x2", W - MARGIN.right - 120)
      .attr("y1", legendY + legendItem * 20)
      .attr("y2", legendY + legendItem * 20)
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 3);

    svg
      .append("text")
      .attr("x", W - MARGIN.right - 115)
      .attr("y", legendY + legendItem * 20 + 4)
      .attr("font-size", 12)
      .attr("fill", "#8b5cf6")
      .text("F₂(x) - another antiderivative");

    if (showDifference) {
      legendItem++;
      svg
        .append("line")
        .attr("x1", W - MARGIN.right - 140)
        .attr("x2", W - MARGIN.right - 120)
        .attr("y1", legendY + legendItem * 20)
        .attr("y2", legendY + legendItem * 20)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6,3");

      svg
        .append("text")
        .attr("x", W - MARGIN.right - 115)
        .attr("y", legendY + legendItem * 20 + 4)
        .attr("font-size", 12)
        .attr("fill", "#ef4444")
        .text("F₂(x) - F₁(x) = constant");
    }

    // Axis labels
    svg
      .append("text")
      .attr("x", W / 2)
      .attr("y", H - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#64748b")
      .text("x");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -H / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#64748b")
      .text("y");
  }, [functionIdx, showDifference, showProof]);

  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        ref={svgRef}
        width={W}
        height={H}
        className="border border-gray-200 rounded"
      ></svg>

      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Why Antiderivatives Differ by Constants
          </h3>
          <p className="text-gray-700 mb-4">
            If two functions have the same derivative, they can only differ by a{" "}
            <strong>constant</strong>. This is the mathematical foundation of the
            +C in ∫f(x) dx = F(x) + C.
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm font-medium">Choose function:</label>
            <select
              value={functionIdx}
              onChange={(e) => {
                setFunctionIdx(Number(e.target.value));
                setShowDifference(false);
                setShowProof(false);
              }}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              {FUNCTIONS.map((fn, i) => (
                <option key={i} value={i}>
                  {fn.name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-green-700 mb-3">{func.description}</p>
          <p className="text-sm text-gray-600 mb-3">
            Both functions have the same derivative: F₁'(x) = F₂'(x) ={" "}
            {func.f.replace("Math.", "").replace("*", "")}
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-difference"
                checked={showDifference}
                onChange={(e) => setShowDifference(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="show-difference" className="text-sm">
                Show F₂(x) - F₁(x) (should be constant)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-proof"
                checked={showProof}
                onChange={(e) => setShowProof(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="show-proof" className="text-sm">
                Show slope field (derivative visualization)
              </label>
            </div>
          </div>

          {showDifference && (
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="text-sm text-red-700">
                <strong>Red dashed line:</strong> F₂(x) - F₁(x) ={" "}
                {Math.round(difference(1) * 100) / 100} (constant!)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                This proves the theorem: any two antiderivatives differ by a
                constant.
              </p>
            </div>
          )}

          {showProof && (
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="text-sm text-green-700">
                <strong>Green lines:</strong> Slope field showing the derivative
                at each point.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Both F₁ and F₂ follow the same slope field everywhere — they
                just start at different heights.
              </p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 text-center max-w-lg">
          <p>
            <strong>Theorem:</strong> If F'(x) = G'(x) for all x in an interval,
            then F(x) = G(x) + C for some constant C.
          </p>
          <p className="mt-2">
            <strong>Proof:</strong> Let H(x) = G(x) - F(x). Then H'(x) = 0, so H
            is constant by the Mean Value Theorem.
          </p>
        </div>
      </div>
    </div>
  );
}
