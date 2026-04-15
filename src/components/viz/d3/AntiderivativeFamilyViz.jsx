import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

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

  const example = EXAMPLES[exampleIdx];

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
      .attr("color", "#64748b");

    svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .attr("color", "#64748b");

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
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Plot antiderivative (blue) when answer shown
    if (showAnswer) {
      svg
        .append("path")
        .datum(FPoints)
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
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
      .attr("fill", "#ef4444")
      .text(`f(x) = ${example.f.replace("Math.", "")}`);

    if (showAnswer) {
      svg
        .append("text")
        .attr("x", W - MARGIN.right - 100)
        .attr("y", MARGIN.top + 40)
        .attr("font-size", 14)
        .attr("font-weight", "bold")
        .attr("fill", "#3b82f6")
        .text(`F(x) = ${example.F.replace("Math.", "")}`);
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
  }, [exampleIdx, showAnswer]);

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
            Reverse Engineering: From Rate to Function
          </h3>
          <p className="text-gray-700 mb-4">
            Antiderivatives are about working backwards. Given a{" "}
            <strong>rate of change</strong> (the derivative), find the{" "}
            <strong>original function</strong> that was changing at that rate.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            {example.name} Example
          </h4>
          <p className="text-blue-700 mb-3">{example.description}</p>

          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm font-medium">Choose example:</label>
            <select
              value={exampleIdx}
              onChange={(e) => {
                setExampleIdx(Number(e.target.value));
                setShowAnswer(false);
              }}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              {EXAMPLES.map((ex, i) => (
                <option key={i} value={i}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {!showAnswer && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                <strong>Red curve:</strong> The rate of change f(x) ={" "}
                {example.f.replace("Math.", "")}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Question:</strong> What function F(x) has derivative f(x)?
              </p>
              <button
                onClick={() => setShowAnswer(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reveal Answer
              </button>
            </div>
          )}

          {showAnswer && (
            <div className="space-y-3">
              <p className="text-sm text-green-700">
                <strong>Answer:</strong> {example.answer}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Blue curve:</strong> The antiderivative F(x) ={" "}
                {example.F.replace("Math.", "")}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Verification:</strong> d/dx[F(x)] = f(x) ✓
              </p>
              <button
                onClick={() => setShowAnswer(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Try Another Example
              </button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 text-center max-w-lg">
          <p>
            <strong>Key Insight:</strong> Every derivative rule can be read
            backwards to give an antiderivative rule. This is why you already
            know every antiderivative rule — you just need to reverse your
            differentiation knowledge!
          </p>
        </div>
      </div>
    </div>
  );
}
