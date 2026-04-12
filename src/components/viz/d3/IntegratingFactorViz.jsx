import { useState } from "react";
import SliderControl from "../SliderControl.jsx";

const EXAMPLES = [
  {
    label: "y' + 2y = 0",
    P: "2",
    Q: "0",
    mu: "e^{2x}",
    result: "y = Ce^{-2x}",
  },
  {
    label: "y' + y = x",
    P: "1",
    Q: "x",
    mu: "e^{x}",
    result: "y = e^{-x}(\int x e^{x} dx + C)",
  },
];

export default function IntegratingFactorViz() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const example = EXAMPLES[exampleIndex];

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            Integrating Factor Visualization
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            See how multiplying by the integrating factor turns the left side of
            a linear ODE into an exact derivative.
          </p>
        </div>
        <select
          value={exampleIndex}
          onChange={(e) => setExampleIndex(Number(e.target.value))}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
        >
          {EXAMPLES.map((item, idx) => (
            <option key={idx} value={idx}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="text-sm font-semibold mb-2">Original equation</div>
          <pre className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            y' + {example.P}y = {example.Q}
          </pre>
          <div className="text-sm font-semibold mb-2 mt-4">
            Integrating factor
          </div>
          <pre className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            μ(x) = e^&#123;∫Pdx&#125; = {example.mu}
          </pre>
        </div>

        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="text-sm font-semibold mb-2">
            After multiplying by μ
          </div>
          <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:border-slate-800">
            μ y' + μ P y = μ Q<br />
            <strong>⟹</strong> d/dx[μ y] = μ Q
          </div>
          <div className="text-sm font-semibold mb-2 mt-4">
            General solution
          </div>
          <pre className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:border-slate-800">
            y = e^&#123;-∫Pdx&#125;(∫e^&#123;∫Pdx&#125; Q dx + C)
          </pre>
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            For this example, the particular solution shape becomes:
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-200 mt-2">
            {example.result}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
        <div className="font-semibold mb-2">How to use this visualization</div>
        <p>
          Choose a linear equation from the dropdown. The left panel shows the
          ODE and the integrating factor you compute from P(x). The right panel
          shows that after multiplying, the left side collapses into a single
          exact derivative.
        </p>
        <p className="mt-2">
          This is the key moment of the integrating factor method: we did not
          guess μ. We derived it so that the derivative of μy appears
          automatically.
        </p>
      </div>
    </div>
  );
}
