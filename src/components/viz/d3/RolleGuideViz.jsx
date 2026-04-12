import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const W = 580;
const H = 340;
const M = { top: 34, right: 24, bottom: 52, left: 56 };

const PROBLEMS = [
  {
    title: "Quadratic example",
    label: "f(x) = x^2 - 4x + 3",
    f: (x) => x * x - 4 * x + 3,
    fPrime: (x) => 2 * x - 4,
    derivativeText: "f'(x) = 2x - 4",
    a: 1,
    b: 3,
    roots: [2],
    domain: [0.2, 3.8],
    yDomain: [-2.2, 4.8],
    steps: [
      {
        title: "Confirm equal heights",
        description:
          "Compute f(a) and f(b). The endpoints are equal, which is the trigger for Rolle's Theorem.",
      },
      {
        title: "Verify smoothness",
        description:
          "This is a polynomial, so it is continuous on [a,b] and differentiable on (a,b). The technical hypotheses are satisfied.",
      },
      {
        title: "Differentiate the function",
        description:
          "Find the derivative f'(x). This tells us where the slope of the curve can be zero.",
      },
      {
        title: "Solve f'(x) = 0",
        description:
          "Solve the derivative equation and keep only solutions in the open interval (a,b). That gives the candidate c values.",
      },
      {
        title: "Rolle's conclusion",
        description:
          "Rolle's Theorem guarantees at least one c in (a,b) with f'(c) = 0. The graph shows the matching point visually.",
      },
    ],
  },
  {
    title: "Cubic example",
    label: "f(x) = x^3 - 4x",
    f: (x) => x * x * x - 4 * x,
    fPrime: (x) => 3 * x * x - 4,
    derivativeText: "f'(x) = 3x^2 - 4",
    a: -2,
    b: 2,
    roots: [-2 / Math.sqrt(3), 2 / Math.sqrt(3)],
    domain: [-2.4, 2.4],
    yDomain: [-5, 5],
    steps: [
      {
        title: "Confirm equal heights",
        description:
          "Evaluate f(a) and f(b) to see that the endpoints are equal. That is the key boundary condition for Rolle's.",
      },
      {
        title: "Verify smoothness",
        description:
          "This polynomial is continuous and differentiable everywhere, so the smoothness conditions on the interval hold.",
      },
      {
        title: "Differentiate the function",
        description:
          "Compute f'(x) and prepare to find where the slope of the curve is zero.",
      },
      {
        title: "Solve f'(x) = 0",
        description:
          "The derivative equation has two solutions. Both of them lie inside the interval, so Rolle's applies to each.",
      },
      {
        title: "Rolle's conclusion",
        description:
          "At least one interior point has f'(c) = 0. The graph displays both possible c values for this example.",
      },
    ],
  },
  {
    title: "Sine wave example",
    label: "f(x) = sin(x)",
    f: (x) => Math.sin(x),
    fPrime: (x) => Math.cos(x),
    derivativeText: "f'(x) = cos(x)",
    a: 0,
    b: 2 * Math.PI,
    roots: [Math.PI / 2, (3 * Math.PI) / 2],
    domain: [-0.2, 2 * Math.PI + 0.2],
    yDomain: [-1.4, 1.4],
    steps: [
      {
        title: "Confirm equal heights",
        description:
          "sin(0) and sin(2π) are both zero, so the function starts and ends at the same height.",
      },
      {
        title: "Verify smoothness",
        description:
          "sin(x) is continuous and differentiable everywhere, so Rolle's hypotheses are satisfied on this interval.",
      },
      {
        title: "Differentiate the function",
        description:
          "The derivative is cos(x). Find when cos(x) equals zero inside the interval.",
      },
      {
        title: "Solve f'(x) = 0",
        description:
          "cos(x)=0 at x = π/2 and x = 3π/2. Both values lie strictly between 0 and 2π.",
      },
      {
        title: "Rolle's conclusion",
        description:
          "There are at least two Rolle points in this example. The graph highlights both horizontal tangents.",
      },
    ],
  },
  {
    title: "Cosine example",
    label: "f(x) = cos(x)",
    f: (x) => Math.cos(x),
    fPrime: (x) => -Math.sin(x),
    derivativeText: "f'(x) = -sin(x)",
    a: 0,
    b: 2 * Math.PI,
    roots: [Math.PI],
    domain: [-0.2, 2 * Math.PI + 0.2],
    yDomain: [-1.4, 1.4],
    steps: [
      {
        title: "Confirm equal heights",
        description:
          "cos(0) = cos(2π) = 1, so the endpoints are equal and Rolle's may apply.",
      },
      {
        title: "Verify smoothness",
        description:
          "cos(x) is smooth on the whole real line, so the continuity and differentiability conditions hold.",
      },
      {
        title: "Differentiate the function",
        description:
          "The derivative is -sin(x). Solve for where the slope of the curve is zero.",
      },
      {
        title: "Solve f'(x) = 0",
        description:
          "-sin(x)=0 at x = 0, π, 2π. Only x = π is strictly inside the open interval (0,2π).",
      },
      {
        title: "Rolle's conclusion",
        description:
          "Rolle's Theorem guarantees a horizontal tangent at x = π, and the graph shows this point clearly.",
      },
    ],
  },
  {
    title: "Double-root quartic",
    label: "f(x) = (x^2 - 1)^2",
    f: (x) => (x * x - 1) * (x * x - 1),
    fPrime: (x) => 4 * x * (x * x - 1),
    derivativeText: "f'(x) = 4x(x^2 - 1)",
    a: -1,
    b: 1,
    roots: [0],
    domain: [-1.3, 1.3],
    yDomain: [0, 1.4],
    steps: [
      {
        title: "Confirm equal heights",
        description:
          "f(-1) and f(1) are both zero, so the function starts and ends at the same value.",
      },
      {
        title: "Verify smoothness",
        description:
          "This polynomial is smooth everywhere, so Rolle's hypotheses hold on [-1, 1].",
      },
      {
        title: "Differentiate the function",
        description:
          "The derivative is 4x(x^2 - 1). We look for interior zeros of this expression.",
      },
      {
        title: "Solve f'(x) = 0",
        description:
          "The derivative is zero at x = -1, 0, 1. Only x = 0 lies inside (-1, 1), so c = 0 is the Rolle point.",
      },
      {
        title: "Rolle's conclusion",
        description:
          "Rolle's Theorem guarantees that a horizontal tangent exists somewhere in the interval, and the graph shows it at c = 0.",
      },
    ],
  },
  {
    title: "Trigonometric plateau",
    label: "f(x) = 1 - cos(x)",
    f: (x) => 1 - Math.cos(x),
    fPrime: (x) => Math.sin(x),
    derivativeText: "f'(x) = sin(x)",
    a: 0,
    b: 2 * Math.PI,
    roots: [Math.PI],
    domain: [-0.1, 2 * Math.PI + 0.1],
    yDomain: [-0.1, 2.2],
    steps: [
      {
        title: "Confirm equal heights",
        description:
          "f(0) = f(2π) = 0, so the function begins and ends at the same height.",
      },
      {
        title: "Verify smoothness",
        description:
          "The cosine function is smooth everywhere, so the Rolle hypotheses hold on this interval.",
      },
      {
        title: "Differentiate the function",
        description:
          "The derivative is sin(x), which tells us where the curve has a horizontal tangent.",
      },
      {
        title: "Solve f'(x) = 0",
        description:
          "sin(x)=0 at x=0, π, 2π. Only x=π lies inside the open interval, so c = π.",
      },
      {
        title: "Rolle's conclusion",
        description:
          "The graph confirms the guaranteed horizontal tangent at the top of the plateau, x = π.",
      },
    ],
  },
  {
    title: "Quartic with three critical points",
    label: "f(x) = x^4 - 5x^2 + 4",
    f: (x) => x * x * x * x - 5 * x * x + 4,
    fPrime: (x) => 4 * x * x * x - 10 * x,
    derivativeText: "f'(x) = 4x^3 - 10x",
    a: -2,
    b: 2,
    roots: [-Math.sqrt(2.5), 0, Math.sqrt(2.5)],
    domain: [-2.2, 2.2],
    yDomain: [-1.2, 5],
    steps: [
      {
        title: "Confirm equal heights",
        description:
          "f(-2) and f(2) are both 0, so the endpoints are equal and Rolle's may apply.",
      },
      {
        title: "Verify smoothness",
        description:
          "This polynomial is smooth everywhere, so continuity and differentiability are guaranteed on [-2,2].",
      },
      {
        title: "Differentiate the function",
        description:
          "The derivative is 4x^3 - 10x. Factor it to find the candidate critical points.",
      },
      {
        title: "Solve f'(x) = 0",
        description:
          "The derivative factors to 2x(2x^2 - 5) = 0, giving x = 0 and x = ±√2.5. All three are interior to (-2,2).",
      },
      {
        title: "Rolle's conclusion",
        description:
          "Rolle's Theorem requires at least one such c, and this example actually has three interior points where f'(c)=0.",
      },
    ],
  },
];

function drawGraph(svg, problem, step) {
  const { f, a, b, domain, yDomain, roots } = problem;
  svg.selectAll("* ").remove();

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

  const line = d3
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
    .attr("stroke", "#2563eb")
    .attr("stroke-width", 2.5)
    .attr("d", line);

  svg
    .append("path")
    .datum([
      [a, f(a)],
      [b, f(b)],
    ])
    .attr("fill", "none")
    .attr("stroke", "#f59e0b")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "6,4");

  [
    [a, "a"],
    [b, "b"],
  ].forEach(([x, label]) => {
    svg
      .append("circle")
      .attr("cx", xSc(x))
      .attr("cy", ySc(f(x)))
      .attr("r", 6)
      .attr("fill", "#f59e0b");

    svg
      .append("text")
      .attr("x", xSc(x))
      .attr("y", ySc(f(x)) - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#f59e0b")
      .attr("font-weight", 700)
      .text(label);
  });

  if (step >= 1) {
    svg
      .append("path")
      .datum([
        [a, f(a)],
        [b, f(b)],
      ])
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 1.2)
      .attr("stroke-dasharray", "4,3")
      .attr("opacity", 0.75);

    svg
      .append("text")
      .attr("x", (xSc(a) + xSc(b)) / 2)
      .attr("y", ySc(f(a)) - 18)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "#f59e0b")
      .attr("font-family", "monospace")
      .text("f(a) = f(b)");
  }

  if (step >= 2) {
    svg
      .append("text")
      .attr("x", W - M.right - 8)
      .attr("y", M.top + 16)
      .attr("text-anchor", "end")
      .attr("font-size", 11)
      .attr("fill", "#10b981")
      .attr("font-family", "monospace")
      .text("smooth on (a,b)");
  }

  if (step >= 3) {
    roots.forEach((c, idx) => {
      const y0 = f(c);
      svg
        .append("line")
        .attr("x1", xSc(c))
        .attr("x2", xSc(c))
        .attr("y1", ySc(yDomain[0]))
        .attr("y2", ySc(yDomain[1]))
        .attr("stroke", "#16a34a")
        .attr("stroke-width", 1.2)
        .attr("stroke-dasharray", "4,3");

      svg
        .append("circle")
        .attr("cx", xSc(c))
        .attr("cy", ySc(y0))
        .attr("r", 6)
        .attr("fill", "#16a34a");

      svg
        .append("text")
        .attr("x", xSc(c))
        .attr("y", ySc(y0) + 18)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("fill", "#16a34a")
        .attr("font-weight", 700)
        .text(roots.length > 1 ? `c${idx + 1}` : "c");
    });
  }

  if (step >= 4) {
    roots.forEach((c) => {
      const y0 = f(c);
      const slope = fPrime ? fPrime(c) : (f(c + 0.001) - f(c - 0.001)) / 0.002;
      const tangent = [c - 0.9, c + 0.9].map((x) => [
        x,
        f(c) + slope * (x - c),
      ]);

      svg
        .append("path")
        .datum(tangent)
        .attr("fill", "none")
        .attr("stroke", "#ea580c")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "8,5")
        .attr("d", line);
    });
  }

  svg
    .append("text")
    .attr("x", M.left + 4)
    .attr("y", M.top + 16)
    .attr("font-size", 12)
    .attr("fill", "#1d4ed8")
    .attr("font-weight", 700)
    .text(problem.title);
}

export default function RolleGuideViz() {
  const svgRef = useRef(null);
  const [problemIdx, setProblemIdx] = useState(0);
  const [step, setStep] = useState(0);
  const problem = PROBLEMS[problemIdx];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    drawGraph(svg, problem, step);
  }, [problem, step]);

  useEffect(() => {
    setStep(0);
  }, [problemIdx]);

  const rootText = problem.roots
    .map((c, idx) =>
      problem.roots.length > 1
        ? `c${idx + 1} = ${c.toFixed(3)}`
        : `c = ${c.toFixed(3)}`,
    )
    .join(", ");

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Guided Rolle walkthrough
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Toggle between problems, then step through the visual reasoning
            behind Rolle's Theorem.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROBLEMS.map((item, idx) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setProblemIdx(idx)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                idx === problemIdx
                  ? "bg-brand-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
      />

      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {problem.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Step {step + 1} of {problem.steps.length}:{" "}
              {problem.steps[step].title}
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {rootText}
          </div>
        </div>

        <p className="mt-3 leading-6">{problem.steps[step].description}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Endpoint check
            </p>
            <p className="mt-2 text-sm">
              a = {problem.a}, b = {problem.b}, f(a) ={" "}
              {problem.f(problem.a).toFixed(3)}, f(b) ={" "}
              {problem.f(problem.b).toFixed(3)}.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Derivative
            </p>
            <p className="mt-2 text-sm">{problem.derivativeText}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
            className="rounded-full bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
            disabled={step === 0}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setStep((prev) => Math.min(prev + 1, problem.steps.length - 1))
            }
            className="rounded-full bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-600"
            disabled={step === problem.steps.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
