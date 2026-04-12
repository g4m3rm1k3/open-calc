import { useMemo, useState } from "react";
import SliderControl from "../SliderControl.jsx";

function euclideanSteps(a, b) {
  const steps = [];
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const r = x % y;
    steps.push({ x, y, q: Math.floor(x / y), r });
    x = y;
    y = r;
  }
  return { steps, gcd: x };
}

export default function EuclideanAlgorithmViz() {
  const [a, setA] = useState(252);
  const [b, setB] = useState(198);
  const [stepIndex, setStepIndex] = useState(0);
  const { steps, gcd } = useMemo(() => euclideanSteps(a, b), [a, b]);

  const currentStep = steps[stepIndex] ?? null;
  const ratio = currentStep ? Math.max(currentStep.x, currentStep.y) : 1;
  const tileSize = Math.min(80, Math.max(16, 280 / ratio));

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Euclidean Algorithm</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Discover gcd(a, b) by cutting the largest possible square from a
        rectangle and repeating the process.
      </p>

      <div className="space-y-4 mb-4">
        <SliderControl
          label={`a = ${a}`}
          min={2}
          max={400}
          step={1}
          value={a}
          onChange={(value) => setA(value)}
        />
        <SliderControl
          label={`b = ${b}`}
          min={2}
          max={400}
          step={1}
          value={b}
          onChange={(value) => setB(value)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-3">Visual rectangle model</div>
          {currentStep ? (
            <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-lg bg-slate-100 p-2 dark:bg-slate-900">
              <div
                className="relative bg-white"
                style={{
                  width: `${Math.round(currentStep.x * tileSize)}px`,
                  height: `${Math.round(currentStep.y * tileSize)}px`,
                  maxWidth: "100%",
                }}
              >
                {Array.from({ length: currentStep.y }, (_, row) => (
                  <div key={row} className="flex">
                    {Array.from({ length: currentStep.q }, (_, col) => (
                      <div
                        key={col}
                        style={{ width: tileSize, height: tileSize }}
                        className="border border-slate-300 bg-emerald-100"
                      />
                    ))}
                    {currentStep.r > 0 ? (
                      <div
                        style={{
                          width: tileSize * currentStep.r,
                          height: tileSize,
                        }}
                        className="border border-slate-300 bg-slate-200"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-900">
              Enter a and b to see the rectangle tiling.
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-3">Step selector</div>
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
          {currentStep ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                <div className="font-semibold">Step {stepIndex + 1}</div>
                <div>
                  {currentStep.x} = {currentStep.y} × {currentStep.q} +{" "}
                  {currentStep.r}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                <div className="font-semibold">
                  What is the rectangle doing?
                </div>
                <div>
                  The algorithm uses {currentStep.q} square tiles of size{" "}
                  {currentStep.y} and leaves a remainder strip of width{" "}
                  {currentStep.r}.
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800 text-slate-500">
              There are no steps because one of the inputs is zero or invalid.
            </div>
          )}
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Final gcd({a}, {b}) = {gcd}. The algorithm stops when the remainder
            reaches 0.
          </div>
        </div>
      </div>
    </div>
  );
}
