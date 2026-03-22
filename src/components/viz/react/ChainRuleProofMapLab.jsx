import React, { useMemo, useState } from 'react';
import KatexInline from '../../math/KatexInline.jsx';

const PROOF_LINES = [
  {
    id: 'setup',
    expr: "\\frac{f(g(x+h)) - f(g(x))}{h}",
    hint: 'Start with the composite difference quotient.',
  },
  {
    id: 'phi-def',
    expr: "\\Phi(k)=\\begin{cases}\\dfrac{f(g(x)+k)-f(g(x))}{k}, & k\\neq 0 \\\\ f'(g(x)), & k=0\\end{cases}",
    hint: 'Define a safety-slope function that is legal at and away from 0.',
  },
  {
    id: 'phi-sub',
    expr: "f(g(x+h))-f(g(x)) = \\Phi(g(x+h)-g(x))\\,[g(x+h)-g(x)]",
    hint: 'Substitute k = g(x+h)-g(x). This avoids illegal division when inner change is 0.',
  },
  {
    id: 'split',
    expr: "\\frac{f(g(x+h))-f(g(x))}{h}=\\Phi(g(x+h)-g(x))\\cdot\\frac{g(x+h)-g(x)}{h}",
    hint: 'Now the two factors are both valid for every nearby h.',
  },
  {
    id: 'limit',
    expr: "(f\\circ g)'(x)=\\lim_{h\\to 0}\\Phi(g(x+h)-g(x))\\cdot\\lim_{h\\to 0}\\frac{g(x+h)-g(x)}{h}=f'(g(x))g'(x)",
    hint: 'Continuity of Phi at 0 plus differentiability of g gives the product rule of rates.',
  },
];

export default function ChainRuleProofMapLab() {
  const [active, setActive] = useState('phi-sub');

  const status = useMemo(() => {
    const phiFocused = active === 'phi-def' || active === 'phi-sub' || active === 'split' || active === 'limit';
    return {
      phiFocused,
      flatPatchOn: phiFocused,
      message: phiFocused
        ? "This symbol Phi is the Safety Slope. In microscope mode, if the inner line is perfectly flat, naive division breaks. Phi is the rigorous patch that keeps the gear from slipping when inner change is zero."
        : 'Hover a proof line to see the geometry-intuition bridge for that algebra step.',
    };
  }, [active]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Annotated Proof Map: Algebra Linked to Intuition</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Hover any proof line. When Phi(g(x+h)-g(x)) is active, the microscope patch glows to show why the rigorous proof stays legal.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Proof Track</p>
          <div className="space-y-2">
            {PROOF_LINES.map((line) => {
              const selected = line.id === active;
              return (
                <button
                  key={line.id}
                  type="button"
                  onMouseEnter={() => setActive(line.id)}
                  onFocus={() => setActive(line.id)}
                  className={`w-full text-left rounded-lg border p-2 transition ${selected ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/25' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  <p className="font-mono text-sm break-words"><KatexInline expr={line.expr} /></p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{line.hint}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Microscope Link</p>
          <div className={`rounded-lg border p-3 transition ${status.flatPatchOn ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'}`}>
            <svg viewBox="0 0 420 150" className="w-full h-32">
              <line x1="24" y1="112" x2="182" y2="58" stroke="#0ea5e9" strokeWidth="5" />
              <circle cx="182" cy="58" r="7" fill="#0ea5e9" />
              <line x1="182" y1="58" x2="396" y2={status.flatPatchOn ? '58' : '24'} stroke={status.flatPatchOn ? '#f59e0b' : '#10b981'} strokeWidth="6" />

              <rect x="205" y="16" width="168" height="56" rx="10" fill={status.flatPatchOn ? 'rgba(245,158,11,0.16)' : 'rgba(15,23,42,0.08)'} stroke={status.flatPatchOn ? '#f59e0b' : '#94a3b8'} strokeWidth="2" />
              <text x="216" y="38" fill="#0f172a" fontSize="12" fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">
                Microscope zone
              </text>
              <text x="216" y="56" fill="#0f172a" fontSize="11" fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">
                {status.flatPatchOn ? 'inner change = 0 case handled' : 'regular slope multiplication'}
              </text>
            </svg>
            <p className="text-sm text-slate-700 dark:text-slate-200 mt-2">{status.message}</p>
          </div>

          <div className="mt-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-sm">
            <p className="font-semibold mb-1">Unified Layer takeaway</p>
            <p>
              The intuitive microscope says local behavior is linear. The proof map shows that Phi is exactly the formal object that makes that story valid,
              even at the dangerous inner-flat moments where naive cancellation would fail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
