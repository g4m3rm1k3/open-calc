import { useMemo, useState } from "react";
import SliderControl from "../SliderControl.jsx";

function factorSteps(n) {
  const number = Math.max(2, Math.abs(n));
  const steps = [];
  let value = number;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor !== 0) continue;
    while (value % divisor === 0) {
      steps.push({ divisor, before: value, after: value / divisor });
      value /= divisor;
    }
  }
  if (value > 1) {
    steps.push({ divisor: value, before: value, after: 1 });
  }
  return steps;
}

export default function PrimeFactorizationViz() {
  const [value, setValue] = useState(84);
  const steps = useMemo(() => factorSteps(value), [value]);
  const factors = useMemo(() => steps.map((step) => step.divisor), [steps]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Prime Factorization</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Break a number into its prime building blocks, step by step. Watch the
        repeated division that reveals the hidden prime tree.
      </p>

      <div className="space-y-4 mb-4">
        <SliderControl
          label={`number = ${value}`}
          min={2}
          max={250}
          step={1}
          value={value}
          onChange={(value) => setValue(Math.max(2, value))}
        />
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm">
          <div className="font-semibold mb-3">Factorization steps</div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={`${step.divisor}-${index}`}
                className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"
              >
                <div className="font-semibold">Step {index + 1}</div>
                <div className="text-slate-600 dark:text-slate-400">
                  Divide {step.before} by {step.divisor} → {step.after}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            The factorization is the list of divisors used by repeated division.
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-2">Prime factor tree</div>
          <div className="flex flex-wrap gap-2">
            {factors.map((prime, index) => (
              <span
                key={`${prime}-${index}`}
                className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200"
              >
                {prime}
              </span>
            ))}
          </div>
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {value} = {factors.join(" × ")}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <div className="font-semibold mb-2">What is happening?</div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Each step finds the smallest prime divisor and removes it from the
            number. What remains is either 1 or another composite that is
            factored again.
          </p>
        </div>
      </div>
    </div>
  );
}
