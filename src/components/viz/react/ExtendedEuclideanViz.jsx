import { useMemo, useState } from "react";
import SliderControl from "../SliderControl.jsx";

function extendedEuclid(a, b) {
  let oldR = Math.abs(a);
  let r = Math.abs(b);
  let oldS = 1;
  let s = 0;
  let oldT = 0;
  let t = 1;
  const steps = [];

  while (r !== 0) {
    const q = Math.floor(oldR / r);
    const tempR = oldR - q * r;
    const tempS = oldS - q * s;
    const tempT = oldT - q * t;
    steps.push({ oldR, r, q, s: oldS, t: oldT, remainder: tempR });
    oldR = r;
    r = tempR;
    oldS = s;
    s = tempS;
    oldT = t;
    t = tempT;
  }

  return { gcd: oldR, x: oldS, y: oldT, steps };
}

export default function ExtendedEuclideanViz() {
  const [a, setA] = useState(252);
  const [b, setB] = useState(198);
  const [stepIndex, setStepIndex] = useState(0);
  const { gcd, x, y, steps } = useMemo(() => extendedEuclid(a, b), [a, b]);
  const step = steps[stepIndex] || null;

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">
        Extended Euclidean Algorithm
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Follow the extended algorithm as it computes coefficients x and y for
        the identity ax + by = gcd(a, b).
      </p>

      <div className="space-y-4 mb-4">
        <SliderControl
          label={`a = ${a}`}
          min={2}
          max={400}
          step={1}
          value={a}
          onChange={setA}
        />
        <SliderControl
          label={`b = ${b}`}
          min={2}
          max={400}
          step={1}
          value={b}
          onChange={setB}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-3">Bézout coefficients</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            The algorithm finds integers x and y such that ax + by = gcd(a, b).
          </div>
          <div className="grid gap-2 text-sm">
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
              <div className="font-semibold">x</div>
              <div>{x}</div>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
              <div className="font-semibold">y</div>
              <div>{y}</div>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
              <div className="font-semibold">Check</div>
              <div>
                {a}×{x} + {b}×{y} = {a * x + b * y}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <div className="font-semibold">Final gcd</div>
              <div>{gcd}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-3">Algorithm walkthrough</div>
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              disabled={stepIndex <= 0}
              onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
              className="rounded bg-slate-200 px-3 py-2 text-sm text-slate-700 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={stepIndex >= steps.length - 1}
              onClick={() =>
                setStepIndex((value) => Math.min(steps.length - 1, value + 1))
              }
              className="rounded bg-slate-200 px-3 py-2 text-sm text-slate-700 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200"
            >
              Next
            </button>
          </div>

          {step ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                <div className="font-semibold">Step {stepIndex + 1}</div>
                <div>
                  {step.oldR} = {step.r} × {step.q} + {step.remainder}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                <div className="font-semibold">Coefficients</div>
                <div>
                  s = {step.s}, t = {step.t}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800 text-slate-500">
              There are no algorithm steps for the current inputs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
