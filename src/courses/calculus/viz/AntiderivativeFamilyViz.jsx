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

const EXAMPLES = [
  {
    name: "Linear Growth",
    f: "2*x",
    F: "x*x",
    description: "Rate of change is constant 2. What function grows at constant rate 2?",
    answer: "x² (since d/dx[x²] = 2x)",
    domain: [-3, 3],
  },
  {
    name: "Quadratic Growth",
    f: "3*x*x",
    F: "x*x*x",
    description: "Rate of change is 3x². What function has derivative 3x²?",
    answer: "x³ (since d/dx[x³] = 3x²)",
    domain: [-2, 2],
  },
  {
    name: "Exponential Growth",
    f: "2*x",
    F: "x*x",
    description: "Rate of change is 2ˣ. What function grows at rate 2ˣ?",
    answer: "(2ˣ)/ln(2) (since d/dx[2ˣ/ln(2)] = 2ˣ)",
    domain: [-2, 2],
  },
  {
    name: "Trig Function",
    f: "Math.cos(x)",
    F: "Math.sin(x)",
    description: "Rate of change is cos(x). What function has derivative cos(x)?",
    answer: "sin(x) (since d/dx[sin(x)] = cos(x))",
    domain: [-Math.PI, Math.PI],
  },
];

export default function ReverseEngineeringAntiderivatives({ params }) {
  const svgRef = useRef();
  const [exampleIdx, setExampleIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const isDark = useIsDark();

  const example = EXAMPLES[exampleIdx];

  const C = {
    text: isDark ? "#94a3b8" : "#64748b",
    grid: isDark ? "#334155" : "#e2e8f0",
    red: isDark ? "#f87171" : "#ef4444",
    blue: isDark ? "#60a5fa" : "#3b82f6",
    bg: isDark ? "#0f172a" : "#ffffff",
    border: isDark ? "#1e293b" : "#e5e7eb"
  };

  const makeFn = (expr) => {
    try {
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

  const f = makeFn(example.f);
  const F = makeFn(example.F);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const [xMin, xMax] = example.domain;
    const xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([MARGIN.left, W - MARGIN.right]);

    // Generate points
    const fPoints = [];
    const FPoints = [];
    for (let x = xMin; x <= xMax; x += 0.1) {
      const y1 = f(x);
      const y2 = F(x);
      if (y1 !== null && isFinite(y1)) fPoints.push([x, y1]);
      if (y2 !== null && isFinite(y2)) FPoints.push([x, y2]);
    }

    // Calculate y domain
    let yMin = Infinity;
    let yMax = -Infinity;
    [...fPoints, ...FPoints].forEach(([x, y]) => {
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    });

    const yRange = yMax - yMin;
    yMin -= yRange * 0.1;
    yMax += yRange * 0.1;

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([H - MARGIN.bottom, MARGIN.top]);

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${H - MARGIN.bottom})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .attr("color", C.text);

    svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .attr("color", C.text);

    // Plot derivative function (red)
    const line = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .defined((d) => d[1] !== null);

    svg
      .append("path")
      .datum(fPoints)
      .attr("fill", "none")
      .attr("stroke", C.red)
      .attr("stroke-width", 3)
      .attr("d", line);

    // Plot antiderivative (blue) when answer shown
    if (showAnswer) {
      svg
        .append("path")
        .datum(FPoints)
        .attr("fill", "none")
        .attr("stroke", C.blue)
        .attr("stroke-width", 3)
        .attr("d", line);
    }

    // Labels
    svg
      .append("text")
      .attr("x", W - MARGIN.right - 100)
      .attr("y", MARGIN.top + 20)
      .attr("font-size", 14)
      .attr("font-weight", "bold")
      .attr("fill", C.red)
      .text(`f(x) = ${example.f.replace("Math.", "")}`);

    if (showAnswer) {
      svg
        .append("text")
        .attr("x", W - MARGIN.right - 100)
        .attr("y", MARGIN.top + 40)
        .attr("font-size", 14)
        .attr("font-weight", "bold")
        .attr("fill", C.blue)
        .text(`F(x) = ${example.F.replace("Math.", "")}`);
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
  }, [exampleIdx, showAnswer, isDark]);

  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        ref={svgRef}
        width={W}
        height={H}
        className="border rounded transition-colors duration-300"
        style={{ backgroundColor: C.bg, borderColor: C.border }}
      ></svg>

      <div className="flex flex-col gap-4 w-full max-w-2xl px-4">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Reverse Engineering: From Rate to Function
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Antiderivatives are about working backwards. Given a{" "}
            <strong>rate of change</strong> (the derivative), find the{" "}
            <strong>original function</strong> that was changing at that rate.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2 text-lg">
            {example.name} Example
          </h4>
          <p className="text-blue-800 dark:text-blue-400 mb-4">{example.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-semibold text-blue-900 dark:text-blue-200 uppercase tracking-wider">Example:</label>
            <select
              value={exampleIdx}
              onChange={(e) => {
                setExampleIdx(Number(e.target.value));
                setShowAnswer(false);
              }}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {EXAMPLES.map((ex, i) => (
                <option key={i} value={i}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {!showAnswer && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xs font-bold text-red-500 uppercase">Rate (f)</span>
                  <p className="font-mono text-slate-900 dark:text-slate-100">{example.f.replace("Math.", "")}</p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-slate-800/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">???</span>
                </div>
              </div>
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
              >
                Reveal Original Function
              </button>
            </div>
          )}

          {showAnswer && (
            <div className="space-y-4 animate-in zoom-in-95 duration-500">
               <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xs font-bold text-red-500 uppercase">Rate (f)</span>
                  <p className="font-mono text-slate-900 dark:text-slate-100">{example.f.replace("Math.", "")}</p>
                </div>
                <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-lg">
                  <span className="text-xs font-bold text-blue-100 uppercase">Original (F)</span>
                  <p className="font-mono text-white font-bold">{example.F.replace("Math.", "")}</p>
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                <p className="text-green-800 dark:text-green-300 leading-relaxed font-medium">
                  <strong className="block text-xs uppercase mb-1">Observation:</strong>
                  {example.answer}
                </p>
              </div>
              <button
                onClick={() => setShowAnswer(false)}
                className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-colors"
              >
                Reset Example
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-900 dark:text-slate-200">Key Insight:</strong> Every derivative rule can be read
            backwards to give an antiderivative rule. This is why you already
            know every antiderivative rule — you just need to reverse your
            differentiation knowledge!
          </p>
        </div>
      </div>
    </div>
  );
}
