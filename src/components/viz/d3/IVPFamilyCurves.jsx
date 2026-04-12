import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import SliderControl from "../SliderControl.jsx";

const WIDTH = 660;
const HEIGHT = 420;
const MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };
const X_RANGE = [-4, 4];
const Y_RANGE = [-6, 14];
const CS = [-8, -4, -2, 0, 2, 4, 8];

export default function IVPFamilyCurves() {
  const svgRef = useRef(null);
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(2);
  const [activeC, setActiveC] = useState(2);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleLinear()
      .domain(X_RANGE)
      .range([MARGIN.left, WIDTH - MARGIN.right]);
    const yScale = d3
      .scaleLinear()
      .domain(Y_RANGE)
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .attr("color", "#94a3b8");

    svg
      .append("g")
      .attr("transform", `translate(${xScale(0)}, 0)`)
      .call(d3.axisLeft(yScale).ticks(10))
      .attr("color", "#94a3b8");

    svg
      .append("line")
      .attr("x1", xScale(X_RANGE[0]))
      .attr("x2", xScale(X_RANGE[1]))
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1);

    svg
      .append("line")
      .attr("x1", xScale(0))
      .attr("x2", xScale(0))
      .attr("y1", yScale(Y_RANGE[0]))
      .attr("y2", yScale(Y_RANGE[1]))
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1);

    const curves = svg.append("g");

    CS.forEach((C) => {
      const line = d3
        .line()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y));
      const points = d3
        .range(X_RANGE[0], X_RANGE[1] + 0.02, 0.02)
        .map((x) => ({ x, y: x * x + C }));
      curves
        .append("path")
        .datum(points)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", C === activeC ? "#ef4444" : "#94a3b8")
        .attr("stroke-width", C === activeC ? 3 : 1.5)
        .attr("opacity", C === activeC ? 1 : 0.45);
    });

    const selectedY = x0 * x0 + activeC;
    svg
      .append("circle")
      .attr("cx", xScale(x0))
      .attr("cy", yScale(selectedY))
      .attr("r", 5)
      .attr("fill", "#ef4444");

    svg
      .append("circle")
      .attr("cx", xScale(x0))
      .attr("cy", yScale(y0))
      .attr("r", 4)
      .attr("fill", "#0f766e");

    svg
      .append("line")
      .attr("x1", xScale(x0))
      .attr("x2", xScale(x0))
      .attr("y1", yScale(selectedY))
      .attr("y2", yScale(y0))
      .attr("stroke", "#f97316")
      .attr("stroke-dasharray", "4 3")
      .attr("stroke-width", 1.5);

    svg
      .append("text")
      .attr("x", xScale(x0) + 6)
      .attr("y", yScale(y0) - 8)
      .attr("fill", "#0f766e")
      .attr("font-size", 11)
      .text(`IC: (${x0.toFixed(1)}, ${y0.toFixed(1)})`);

    svg
      .append("text")
      .attr("x", xScale(x0) + 6)
      .attr("y", yScale(selectedY) + 16)
      .attr("fill", "#ef4444")
      .attr("font-size", 11)
      .text(`Selected curve: C = ${activeC}`);

    svg.on("click", (event) => {
      const [mx, my] = d3.pointer(event);
      const x = xScale.invert(mx);
      const y = yScale.invert(my);
      const C = +(y - x * x).toFixed(2);
      setX0(+x.toFixed(2));
      setY0(+y.toFixed(2));
      setActiveC(C);
    });
  }, [x0, y0, activeC]);

  return (
    <div>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="rounded-xl bg-slate-50 dark:bg-slate-slate-900 border border-slate-200 dark:border-slate-800"
      />
      <div className="grid gap-3 sm:grid-cols-3 mt-3 text-sm text-slate-700 dark:text-slate-300">
        <div className="rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-1">Current initial condition</div>
          <div>
            $(x_0, y_0) = (${x0}, ${y0})$
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-1">Particular solution</div>
          <div>$y = x^2 + ${activeC}$</div>
        </div>
        <div className="rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-1">How it works</div>
          <div>
            Click the graph to move the initial condition. The chosen curve is
            the one that passes through that point.
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Tip: clicking a point changes the constant $C$ so that the curve $y =
        x^2 + C$ goes through the chosen point. The family of curves differs
        only by vertical shift.
      </div>
    </div>
  );
}
