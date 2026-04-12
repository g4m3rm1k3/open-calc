import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const W = 580;
const H = 360;
const M = { top: 34, right: 24, bottom: 62, left: 56 };

const DEFAULT_PROBLEM = {
  title: "Rolle's Theorem: full walkthrough",
  label: "f(x) = x^3 - 13x^2 + 50x - 56",
  a: 2,
  b: 7,
  domain: [1.5, 7.5],
  yDomain: [-20, 40],
  f: (x) => x * x * x - 13 * x * x + 50 * x - 56,
  fPrime: (x) => 3 * x * x - 26 * x + 50,
  derivativeText: "f'(x) = 3x^2 - 26x + 50",
  roots: [(13 - Math.sqrt(19)) / 3, (13 + Math.sqrt(19)) / 3],
};

const STEPS = [
  {
    title: "What is Rolle's Theorem?",
    description:
      "If f is continuous on [a,b], differentiable on (a,b), and f(a)=f(b), then there is at least one c in (a,b) with f'(c)=0.",
  },
  {
    title: "Check continuity on [2,7]",
    description:
      "This is a polynomial, so it is continuous everywhere. In particular, it is continuous on [2,7].",
  },
  {
    title: "Check differentiability on (2,7)",
    description:
      "Polynomials are differentiable everywhere, so f is differentiable on the open interval (2,7).",
  },
  {
    title: "Check the endpoints",
    description:
      "Compute f(2) and f(7). If they are equal, the last hypothesis of Rolle's Theorem is satisfied.",
  },
  {
    title: "Apply Rolle's Theorem",
    description:
      "All three hypotheses hold, so Rolle's Theorem guarantees at least one c in (2,7) with f'(c)=0.",
  },
  {
    title: "Solve f'(x)=0",
    description:
      "Compute the derivative, set it equal to zero, and solve the quadratic equation to find the candidate c values.",
  },
  {
    title: "Confirm both c values lie in (2,7)",
    description:
      "Both roots of the derivative are inside the interval, so they are valid solutions for the Rolle conclusion.",
  },
];

function createTicks(xSc, ySc) {
  const xTicks = xSc.ticks(8).filter((t) => t >= 0);
  const yTicks = ySc.ticks(7);
  return { xTicks, yTicks };
}

function drawGraph(svg, problem, step) {
  const { f, fPrime, a, b, domain, yDomain, roots } = problem;
  svg.selectAll("*").remove();

  const xSc = d3
    .scaleLinear()
    .domain(domain)
    .range([M.left, W - M.right]);
  const ySc = d3
    .scaleLinear()
    .domain(yDomain)
    .range([H - M.bottom, M.top]);

  const { xTicks, yTicks } = createTicks(xSc, ySc);

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
    .call(d3.axisBottom(xSc).ticks(8))
    .attr("color", "#94a3b8");

  svg
    .append("g")
    .attr("transform", `translate(${yAxisX},0)`)
    .call(d3.axisLeft(ySc).ticks(7))
    .attr("color", "#94a3b8");

  const line = d3
    .line()
    .x(([x]) => xSc(x))
    .y(([, y]) => ySc(y))
    .defined(([, y]) => isFinite(y));

  const points = d3
    .range(domain[0], domain[1] + 0.001, (domain[1] - domain[0]) / 320)
    .map((x) => [x, f(x)]);

  svg
    .append("path")
    .datum(points)
    .attr("fill", "none")
    .attr("stroke", "#2563eb")
    .attr("stroke-width", 2.5)
    .attr("d", line);

  svg
    .append("circle")
    .attr("cx", xSc(a))
    .attr("cy", ySc(f(a)))
    .attr("r", 6)
    .attr("fill", "#f59e0b");
  svg
    .append("circle")
    .attr("cx", xSc(b))
    .attr("cy", ySc(f(b)))
    .attr("r", 6)
    .attr("fill", "#f59e0b");

  svg
    .append("text")
    .attr("x", xSc(a))
    .attr("y", ySc(f(a)) - 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", "#f59e0b")
    .attr("font-weight", 700)
    .text("a");

  svg
    .append("text")
    .attr("x", xSc(b))
    .attr("y", ySc(f(b)) - 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", "#f59e0b")
    .attr("font-weight", 700)
    .text("b");

  if (step >= 3) {
    svg
      .append("line")
      .attr("x1", xSc(a))
      .attr("x2", xSc(b))
      .attr("y1", ySc(f(a)))
      .attr("y2", ySc(f(b)))
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 1.2)
      .attr("stroke-dasharray", "6,4")
      .attr("opacity", 0.9);

    svg
      .append("text")
      .attr("x", (xSc(a) + xSc(b)) / 2)
      .attr("y", ySc(f(a)) - 24)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "#f59e0b")
      .attr("font-family", "monospace")
      .text("f(a) = f(b)");
  }

  if (step >= 4) {
    svg
      .append("circle")
      .attr("cx", xSc(roots[0]))
      .attr("cy", ySc(f(roots[0])))
      .attr("r", 6)
      .attr("fill", "#16a34a");
    svg
      .append("circle")
      .attr("cx", xSc(roots[1]))
      .attr("cy", ySc(f(roots[1])))
      .attr("r", 6)
      .attr("fill", "#16a34a");

    svg
      .append("line")
      .attr("x1", xSc(roots[0]))
      .attr("x2", xSc(roots[0]))
      .attr("y1", ySc(yDomain[0]))
      .attr("y2", ySc(yDomain[1]))
      .attr("stroke", "#16a34a")
      .attr("stroke-width", 1.2)
      .attr("stroke-dasharray", "4,3");
    svg
      .append("line")
      .attr("x1", xSc(roots[1]))
      .attr("x2", xSc(roots[1]))
      .attr("y1", ySc(yDomain[0]))
      .attr("y2", ySc(yDomain[1]))
      .attr("stroke", "#16a34a")
      .attr("stroke-width", 1.2)
      .attr("stroke-dasharray", "4,3");

    svg
      .append("text")
      .attr("x", xSc(roots[0]))
      .attr("y", ySc(f(roots[0])) + 18)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "#16a34a")
      .attr("font-weight", 700)
      .text("c1");

    svg
      .append("text")
      .attr("x", xSc(roots[1]))
      .attr("y", ySc(f(roots[1])) + 18)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "#16a34a")
      .attr("font-weight", 700)
      .text("c2");
  }

  if (step >= 5) {
    [roots[0], roots[1]].forEach((c) => {
      const slope = fPrime(c);
      const tangent = [c - 0.8, c + 0.8].map((x) => [
        x,
        f(c) + slope * (x - c),
      ]);
      svg
        .append("path")
        .datum(tangent)
        .attr("fill", "none")
        .attr("stroke", "#f97316")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "8,5")
        .attr("d", line);
    });
  }

  svg
    .append("text")
    .attr("x", M.left + 4)
    .attr("y", M.top + 14)
    .attr("font-size", 13)
    .attr("fill", "#1d4ed8")
    .attr("font-weight", 700)
    .text(problem.title);
}

export default function RolleProblemStepper({ params = {} }) {
  const svgRef = useRef(null);
  const [step, setStep] = useState(Number(params.initialStep ?? 0));
  const problem = params.problem ? params.problem : DEFAULT_PROBLEM;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    drawGraph(svg, problem, step);
  }, [problem, step]);

  useEffect(() => {
    if (params.initialStep != null) {
      setStep(Number(params.initialStep));
    }
  }, [params.initialStep]);

  const rootText = problem.roots
    .map((c, idx) => `c${idx + 1} = ${c.toFixed(3)}`)
    .join(" and ");

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Rolle’s Theorem: one problem from start to finish
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Walk through each hypothesis, verify them visually, then solve the
            derivative and confirm the Rolle points.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STEPS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStep(idx)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                idx === step
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
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {problem.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Step {step + 1} of {STEPS.length}: {STEPS[step].title}
            </p>
            <p className="mt-2 leading-6">{STEPS[step].description}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950">
            <p className="text-slate-500 dark:text-slate-400">
              Endpoint values
            </p>
            <p className="mt-1">f(2) = {problem.f(problem.a).toFixed(0)}</p>
            <p>f(7) = {problem.f(problem.b).toFixed(0)}</p>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Derivative
            </p>
            <p>{problem.derivativeText}</p>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Rolle points
            </p>
            <p>{rootText}</p>
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
              setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
            }
            className="rounded-full bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-600"
            disabled={step === STEPS.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
