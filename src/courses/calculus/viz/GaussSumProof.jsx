import { useState } from 'react';
import KatexBlock from '../../../components/math/KatexBlock.jsx';
import KatexInline from '../../../components/math/KatexInline.jsx';

// ─── Gauss's Pairing Proof Visualizer ────────────────────────────────────────
// Teaches Σi = n(n+1)/2 from scratch with no prerequisites.
// Each phase shows one idea and nothing more.

const PHASES = [
  {
    id: 'question',
    label: 'The Question',
    color: 'violet',
  },
  {
    id: 'write-forward',
    label: 'Write S forward',
    color: 'sky',
  },
  {
    id: 'write-backward',
    label: 'Write S backward',
    color: 'amber',
  },
  {
    id: 'pair',
    label: 'Pair the columns',
    color: 'emerald',
  },
  {
    id: 'solve',
    label: 'Solve for S',
    color: 'rose',
  },
  {
    id: 'verify',
    label: 'Verify with numbers',
    color: 'teal',
  },
];

const COLOR = {
  violet: { bg: 'bg-violet-950/60', border: 'border-violet-600', text: 'text-violet-300', badge: 'bg-violet-600 text-white', num: 'text-violet-300', dot: 'bg-violet-500' },
  sky:    { bg: 'bg-sky-950/60',    border: 'border-sky-600',    text: 'text-sky-300',    badge: 'bg-sky-600 text-white',    num: 'text-sky-300',    dot: 'bg-sky-500' },
  amber:  { bg: 'bg-amber-950/60',  border: 'border-amber-600',  text: 'text-amber-300',  badge: 'bg-amber-600 text-slate-950', num: 'text-amber-300', dot: 'bg-amber-500' },
  emerald:{ bg: 'bg-emerald-950/60',border: 'border-emerald-600',text: 'text-emerald-300',badge: 'bg-emerald-600 text-white',num: 'text-emerald-300',dot: 'bg-emerald-50 dark:bg-emerald-900/300' },
  rose:   { bg: 'bg-rose-950/60',   border: 'border-rose-600',   text: 'text-rose-300',   badge: 'bg-rose-600 text-white',   num: 'text-rose-300',   dot: 'bg-rose-50 dark:bg-rose-900/300' },
  teal:   { bg: 'bg-teal-950/60',   border: 'border-teal-600',   text: 'text-teal-300',   badge: 'bg-teal-600 text-white',   num: 'text-teal-300',   dot: 'bg-teal-50 dark:bg-teal-900/300' },
};

function NumberRow({ numbers, color, label, dim = false }) {
  const c = COLOR[color];
  return (
    <div className={`flex items-center gap-2 ${dim ? 'opacity-40' : ''}`}>
      <span className={`text-xs font-bold w-5 text-right ${c.num} shrink-0`}>{label}</span>
      <div className="flex gap-1 flex-wrap">
        {numbers.map((n, i) => (
          <span
            key={i}
            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-white ${c.dot}`}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function PairRow({ n, color }) {
  const c = COLOR[color];
  const pairs = Array.from({ length: n }, (_, i) => i + 1 + (n - i));
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold w-5 text-right ${c.num} shrink-0`}>=</span>
      <div className="flex gap-1 flex-wrap">
        {pairs.map((p, i) => (
          <span
            key={i}
            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold ${c.bg} border ${c.border} ${c.text}`}
          >
            {p}
          </span>
        ))}
      </div>
      <span className={`text-sm font-bold ${c.text} ml-1`}>× {n} pairs</span>
    </div>
  );
}

export default function GaussSumProof() {
  const [phase, setPhase]   = useState(0);
  const [n, setN]           = useState(5);
  const phaseId = PHASES[phase].id;
  const phaseColor = PHASES[phase].color;
  const c = COLOR[phaseColor];

  const forward  = Array.from({ length: n }, (_, i) => i + 1);
  const backward = Array.from({ length: n }, (_, i) => n - i);
  const S = (n * (n + 1)) / 2;

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-lg p-5 space-y-5 select-none">

      {/* header */}
      <div className="text-center">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Gauss's Pairing Proof</h3>
        <p className="text-slate-400 text-sm">
          Why does <KatexInline expr="\textstyle\sum_{i=1}^n i = \dfrac{n(n+1)}{2}" />? Step through the proof.
        </p>
      </div>

      {/* n slider */}
      <div className="flex items-center gap-4 justify-center">
        <span className="text-slate-400 text-sm">n =</span>
        <input
          type="range" min={2} max={10} value={n}
          onChange={e => setN(+e.target.value)}
          className="w-40 accent-violet-500"
        />
        <span className="text-white font-bold w-4">{n}</span>
      </div>

      {/* phase progress bar */}
      <div className="flex gap-1">
        {PHASES.map((p, i) => {
          const cc = COLOR[p.color];
          const done = i <= phase;
          return (
            <button
              key={p.id}
              onClick={() => setPhase(i)}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${
                done ? `${cc.badge}` : 'bg-slate-800 text-slate-500'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-500">
        Step {phase + 1} / {PHASES.length} — <span className={c.text}>{PHASES[phase].label}</span>
      </p>

      {/* ── phase content ────────────────────────────────────────────────── */}
      <div className={`rounded-xl border ${c.border} ${c.bg} p-4 space-y-4 min-h-[160px]`}>

        {phaseId === 'question' && (
          <>
            <p className="text-white font-bold text-base">What is the sum of the first {n} positive integers?</p>
            <div className="overflow-x-auto">
              <KatexBlock expr={`S = 1 + 2 + 3 + \\cdots + ${n} = \\;?`} />
            </div>
            <p className="text-slate-300 text-sm">
              Adding them one by one works for small <KatexInline expr="n" /> but fails for <KatexInline expr="n = 100" /> or <KatexInline expr="n = 1{,}000{,}000" />.
              We need a formula. The key insight is to write the same sum <em>twice</em> — once forward, once backward.
            </p>
            <div className="flex gap-1 flex-wrap mt-2">
              {forward.map((v, i) => (
                <span key={i} className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-white ${c.dot}`}>{v}</span>
              ))}
              <span className="text-slate-400 font-bold self-center ml-1">= {S}</span>
            </div>
          </>
        )}

        {phaseId === 'write-forward' && (
          <>
            <p className="text-white font-bold">Step 1: Write S going forward — smallest to largest</p>
            <div className="overflow-x-auto">
              <KatexBlock expr={`S = 1 + 2 + 3 + \\cdots + ${n-1} + ${n}`} />
            </div>
            <NumberRow numbers={forward} color="sky" label="S =" />
            <p className="text-slate-300 text-sm mt-2">
              Nothing fancy yet — just the definition of S. Each term increases by 1.
            </p>
          </>
        )}

        {phaseId === 'write-backward' && (
          <>
            <p className="text-white font-bold">Step 2: Write S again — largest to smallest</p>
            <div className="overflow-x-auto">
              <KatexBlock expr={`S = ${n} + ${n-1} + \\cdots + 2 + 1`} />
            </div>
            <p className="text-slate-300 text-sm">The value of S has not changed — same numbers, reversed order.</p>
            <div className="space-y-2 mt-2">
              <NumberRow numbers={forward}  color="sky"   label="S =" />
              <NumberRow numbers={backward} color="amber" label="S =" />
            </div>
            <p className={`text-sm font-semibold ${c.text} mt-2`}>
              Now line up the two rows. Each column has the same position — one from the forward row, one from the backward row.
            </p>
          </>
        )}

        {phaseId === 'pair' && (
          <>
            <p className="text-white font-bold">Step 3: Add the two rows column by column</p>
            <p className="text-slate-300 text-sm">
              Each column sums to <KatexInline expr={`${n} + 1 = ${n+1}`} />, no matter which column you pick.
            </p>
            <div className="space-y-2 mt-2">
              <NumberRow numbers={forward}  color="sky"   label="S =" />
              <NumberRow numbers={backward} color="amber" label="S =" />
              <div className="h-px bg-slate-600 my-1" />
              <PairRow n={n} color="emerald" />
            </div>
            <div className="overflow-x-auto mt-3">
              <KatexBlock expr={`2S = \\underbrace{(${n}+1) + (${n}+1) + \\cdots + (${n}+1)}_{${n}\\text{ pairs}} = ${n}(${n}+1) = ${n*(n+1)}`} />
            </div>
          </>
        )}

        {phaseId === 'solve' && (
          <>
            <p className="text-white font-bold">Step 4: Solve for S</p>
            <p className="text-slate-300 text-sm">
              We know <KatexInline expr={`2S = ${n}(${n}+1) = ${n*(n+1)}`} />. Divide both sides by 2:
            </p>
            <div className="overflow-x-auto mt-3">
              <KatexBlock expr={`S = \\frac{${n}(${n}+1)}{2} = \\frac{${n*(n+1)}}{2} = ${S}`} />
            </div>
            <div className={`mt-4 rounded-lg border ${c.border} px-4 py-3`}>
              <p className="text-white font-bold text-center text-lg">
                <KatexInline expr={`\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}`} />
              </p>
            </div>
            <p className="text-slate-300 text-sm mt-2">
              This formula works for <em>any</em> n. Try changing the slider — the proof is identical.
            </p>
          </>
        )}

        {phaseId === 'verify' && (
          <>
            <p className="text-white font-bold">Step 5: Verify — formula vs term-by-term</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className={`rounded-lg border ${c.border} p-3`}>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Term by term</p>
                <div className="flex gap-1 flex-wrap mb-2">
                  {forward.map((v, i) => (
                    <span key={i} className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-white ${c.dot}`}>{v}</span>
                  ))}
                </div>
                <p className={`font-bold text-lg ${c.text}`}>{forward.join(' + ')} = {S}</p>
              </div>
              <div className={`rounded-lg border ${c.border} p-3`}>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Formula</p>
                <div className="overflow-x-auto">
                  <KatexBlock expr={`\\frac{${n}(${n}+1)}{2} = \\frac{${n*(n+1)}}{2}`} />
                </div>
                <p className={`font-bold text-lg ${c.text} mt-1`}>= {S} ✓</p>
              </div>
            </div>
            <div className={`mt-4 rounded-lg ${c.bg} border ${c.border} px-4 py-3 text-center`}>
              <p className={`text-sm font-semibold ${c.text}`}>
                Gauss used this trick as a child to add 1 through 100 in seconds: <KatexInline expr="\frac{100 \cdot 101}{2} = 5{,}050" />
              </p>
            </div>
          </>
        )}

      </div>

      {/* nav buttons */}
      <div className="flex gap-3">
        <button
          disabled={phase === 0}
          onClick={() => setPhase(p => p - 1)}
          className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold disabled:opacity-30 transition-colors"
        >
          ← Back
        </button>
        <button
          disabled={phase === PHASES.length - 1}
          onClick={() => setPhase(p => p + 1)}
          className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-30 transition-colors"
        >
          Next Step →
        </button>
      </div>

      {phase === PHASES.length - 1 && (
        <div className="text-center">
          <button
            onClick={() => setPhase(0)}
            className="text-xs text-slate-500 hover:text-slate-300 underline"
          >
            Restart proof
          </button>
        </div>
      )}
    </div>
  );
}
