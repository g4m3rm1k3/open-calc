import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import SliderControl from "../SliderControl.jsx";

const WIDTH = 660;
const HEIGHT = 420;
const MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };
const X_MAX = 2.5;

function exactSolution(x) {
  return Math.exp(x);
}

function slope(x, y) {
  return y;
}

export default function EulerMethodStepper() {
  const svgRef = useRef(null);
  const [h, setH] = useState(0.25);
  const [showExact, setShowExact] = useState(true);
  const [showSteps, setShowSteps] = useState(true);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleLinear()
      .domain([0, X_MAX])
      .range([MARGIN.left, WIDTH - MARGIN.right]);
    const yScale = d3
      .scaleLinear()
      .domain([0, 16])
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    const xAxis = d3.axisBottom(xScale).ticks(6);
    const yAxis = d3.axisLeft(yScale).ticks(8);

    svg
      .append("g")
      .attr("transform", `translate(0, ${HEIGHT - MARGIN.bottom})`)
      .call(xAxis)
      .attr("color", "#94a3b8");
    svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, 0)`)
      .call(yAxis)
      .attr("color", "#94a3b8");

    const exactPoints = d3
      .range(0, X_MAX + 0.01, 0.01)
      .map((x) => ({ x, y: exactSolution(x) }));
    if (showExact) {
      svg
        .append("path")
        .datum(exactPoints)
        .attr("fill", "none")
        .attr("stroke", "#2563eb")
        .attr("stroke-width", 2.5)
        .attr(
          "d",
          d3
            .line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y)),
        );
    }

    const eulerPoints = [{ x: 0, y: 1 }];
    while (eulerPoints[eulerPoints.length - 1].x + h <= X_MAX + 1e-9) {
      const prev = eulerPoints[eulerPoints.length - 1];
      const nextX = prev.x + h;
      const nextY = prev.y + h * slope(prev.x, prev.y);
      eulerPoints.push({ x: nextX, y: nextY });
    }

    if (showSteps) {
      svg
        .append("path")
        .datum(eulerPoints)
        .attr("fill", "none")
        .attr("stroke", "#16a34a")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6 4")
        .attr(
          "d",
          d3
            .line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y)),
        );

      eulerPoints.forEach((point, index) => {
        svg
          .append("circle")
          .attr("cx", xScale(point.x))
          .attr("cy", yScale(point.y))
          .attr("r", 4)
          .attr("fill", "#16a34a");

        if (index < eulerPoints.length - 1) {
          const tangentX = point.x;
          const tangentY = point.y;
          const slopeValue = slope(point.x, point.y);
          const delta = 0.25;
          const x1 = tangentX - delta;
          const x2 = tangentX + delta;
          const y1 = tangentY + slopeValue * (x1 - tangentX);
          const y2 = tangentY + slopeValue * (x2 - tangentX);

          svg
            .append("line")
            .attr("x1", xScale(x1))
            .attr("y1", yScale(y1))
            .attr("x2", xScale(x2))
            .attr("y2", yScale(y2))
            .attr("stroke", "#d97706")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.8);
        }
      });
    }

    svg
      .append("text")
      .attr("x", WIDTH / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", 12)
      .text(
        "Euler method for $y' = y$, $y(0) = 1$ — exact $y = e^x$ vs. step-by-step approximation",
      );
  }, [h, showExact, showSteps]);

  return (
    <div>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="rounded-xl bg-slate-50 dark:bg-slate-slate-900 border border-slate-200 dark:border-slate-800"
      />
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr] mt-3">
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <SliderControl
            label={`Step size h = ${h.toFixed(2)}`}
            min={0.05}
            max={0.5}
            step={0.05}
            value={h}
            onChange={setH}
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-3">
            <input
              type="checkbox"
              checked={showExact}
              onChange={(e) => setShowExact(e.target.checked)}
              className="accent-brand-500"
            />
            Show exact solution
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={showSteps}
              onChange={(e) => setShowSteps(e.target.checked)}
              className="accent-brand-500"
            />
            Show Euler approximation
          </label>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
          <div className="font-semibold mb-2">Euler method insight</div>
          <p className="mb-2">
            At each step n, Euler uses the current slope $y' = y_n$ at $(x_n,
            y_n)$ and moves forward by $h$: $y_&#123;n + 1&#125; = y_n + h y_n$.
            The green dashed approximation follows these tangent steps.
          </p>
          <p className="mb-2">
            As h gets smaller, the approximation gets closer to the blue exact
            curve. The error at $x = 2.5$ shrinks because the tangent-line
            approximation becomes valid over smaller intervals.
          </p>
        </div>
      </div>
    </div>
  );
}
