import { useState } from 'react'

/**
 * ChainRulePracticeViz — Viz 5: "Practice builder"
 *
 * Shows a composed function. Student clicks to identify outer/inner.
 * Then walks through the three-step chain rule process.
 * Covers many forms: polynomial in trig, trig of polynomial,
 * exponential of trig, log of polynomial, nested, reciprocal forms.
 *
 * Pure React.
 */
export default function ChainRulePracticeViz({ params = {} }) {
  const [selected, setSelected] = useState(0)
  const [revealStep, setRevealStep] = useState(0)

  const problems = [
    {
      label: 'sin(x³)',
      category: 'trig of polynomial',
      outer: 'sin(□)',
      inner: 'x³',
      outerDeriv: 'cos(□)',
      innerDeriv: '3x²',
      step1: 'Outer = sin(□), inner = x³',
      step2: "Outer derivative: d/d□[sin(□)] = cos(□)  → keep inner inside: cos(x³)",
      step3: "Inner derivative: d/dx[x³] = 3x²",
      result: "cos(x³) · 3x²",
      watch: "The argument of cos STAYS as x³ — never replace it with something simpler.",
    },
    {
      label: 'cos(5x²)',
      category: 'trig of polynomial',
      outer: 'cos(□)',
      inner: '5x²',
      outerDeriv: '−sin(□)',
      innerDeriv: '10x',
      step1: 'Outer = cos(□), inner = 5x²',
      step2: 'Outer derivative: −sin(□) → keep inner: −sin(5x²)',
      step3: 'Inner derivative: 10x',
      result: '−sin(5x²) · 10x  =  −10x sin(5x²)',
      watch: "Don't forget the negative sign from differentiating cosine.",
    },
    {
      label: 'e^(x²)',
      category: 'exponential of polynomial',
      outer: 'e^□',
      inner: 'x²',
      outerDeriv: 'e^□',
      innerDeriv: '2x',
      step1: 'Outer = e^□ (exponential), inner = x²',
      step2: 'Outer derivative: e^□ is its own derivative → e^(x²) (inner stays)',
      step3: 'Inner derivative: 2x',
      result: 'e^(x²) · 2x  =  2x·e^(x²)',
      watch: "e^□ is special: its derivative is itself. The chain rule multiplier is the only new factor.",
    },
    {
      label: 'ln(3x + 1)',
      category: 'log of linear',
      outer: 'ln(□)',
      inner: '3x + 1',
      outerDeriv: '1/□',
      innerDeriv: '3',
      step1: 'Outer = ln(□), inner = 3x+1',
      step2: 'Outer derivative: 1/□ → evaluated at inner: 1/(3x+1)',
      step3: 'Inner derivative: 3',
      result: '[1/(3x+1)] · 3  =  3/(3x+1)',
      watch: "ln(□) → 1/□. The □ is replaced by the whole inner function, not simplified.",
    },
    {
      label: '(x²+1)⁵',
      category: 'power of polynomial',
      outer: '□⁵',
      inner: 'x²+1',
      outerDeriv: '5□⁴',
      innerDeriv: '2x',
      step1: 'Outer = □⁵ (power function), inner = x²+1',
      step2: 'Outer derivative: 5□⁴ → evaluated at inner: 5(x²+1)⁴',
      step3: 'Inner derivative: 2x',
      result: '5(x²+1)⁴ · 2x  =  10x(x²+1)⁴',
      watch: "The base (x²+1) stays intact inside the power — it's the inner function, not a variable.",
    },
    {
      label: 'tan²(x)',
      category: 'power of trig',
      outer: '□²',
      inner: 'tan(x)',
      outerDeriv: '2□',
      innerDeriv: 'sec²(x)',
      step1: 'Outer = □² (square), inner = tan(x)  [equivalently: [tan(x)]²]',
      step2: 'Outer derivative: 2□ → evaluated at inner: 2·tan(x)',
      step3: 'Inner derivative: sec²(x)',
      result: '2·tan(x)·sec²(x)',
      watch: "tan²(x) means [tan(x)]² — the squaring is the outer function. This form appears constantly.",
    },
    {
      label: '√(1 + x³)',
      category: 'root of polynomial',
      outer: '√□  = □^(1/2)',
      inner: '1 + x³',
      outerDeriv: '(1/2)□^(−1/2) = 1/(2√□)',
      innerDeriv: '3x²',
      step1: 'Outer = √□ = □^(1/2), inner = 1+x³',
      step2: 'Outer derivative: (1/2)□^(−1/2) → at inner: 1/(2√(1+x³))',
      step3: 'Inner derivative: 3x²',
      result: '[1/(2√(1+x³))] · 3x²  =  3x²/(2√(1+x³))',
      watch: "Square root IS a power (exponent 1/2). Always rewrite √□ as □^(1/2) before differentiating.",
    },
    {
      label: 'sin(cos(x))',
      category: 'nested trig (chain twice)',
      outer: 'sin(□)',
      inner: 'cos(x)',
      outerDeriv: 'cos(□)',
      innerDeriv: '−sin(x)',
      step1: 'Outer = sin(□), inner = cos(x)',
      step2: 'Outer derivative: cos(□) → at inner: cos(cos(x))',
      step3: 'Inner derivative: −sin(x)',
      result: 'cos(cos(x)) · (−sin(x))  =  −sin(x)·cos(cos(x))',
      watch: "Double-nested: the argument of the outer cos is itself cos(x). Both layers must be kept intact.",
    },
    {
      label: 'e^(sin x)',
      category: 'exponential of trig',
      outer: 'e^□',
      inner: 'sin(x)',
      outerDeriv: 'e^□',
      innerDeriv: 'cos(x)',
      step1: 'Outer = e^□, inner = sin(x)',
      step2: 'Outer derivative: e^□ (same) → at inner: e^(sin x)',
      step3: 'Inner derivative: cos(x)',
      result: 'e^(sin x) · cos(x)',
      watch: "e^□ is always its own derivative — the only change is multiplying by the inner derivative.",
    },
    {
      label: 'ln(sin²x)',
      category: 'log of power of trig',
      outer: 'ln(□)',
      inner: 'sin²x',
      outerDeriv: '1/□',
      innerDeriv: '2sin(x)cos(x) = sin(2x)',
      step1: 'Outer = ln(□), inner = sin²x = [sin(x)]²\n(Note: inner itself requires the chain rule!)',
      step2: 'Outer derivative: 1/□ → at inner: 1/sin²x',
      step3: 'Inner derivative (chain rule again!): 2sin(x)·cos(x) = sin(2x)',
      result: '[1/sin²x] · sin(2x)  =  sin(2x)/sin²x  =  2cos(x)/sin(x)  =  2cot(x)',
      watch: "The inner function itself needs the chain rule — this is chain rule applied twice. The final simplification uses the double angle formula.",
    },
  ]

  const p = problems[selected]

  const card = { background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '10px 14px', border: '0.5px solid var(--color-border-tertiary)', marginBottom: 8 }

  const stepContent = [
    { label: 'Step 1: Identify outer and inner functions', content: p.step1, col: '#38bdf8' },
    { label: 'Step 2: Differentiate the outer (keep inner inside)', content: p.step2, col: '#f472b6' },
    { label: 'Step 3: Differentiate the inner', content: p.step3, col: '#a78bfa' },
    { label: 'Step 4: Multiply — chain rule complete', content: `Answer: ${p.result}`, col: '#34d399', big: true },
    { label: 'Watch out for:', content: p.watch, col: '#fbbf24', warn: true },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0' }}>
      {/* Function selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Choose a function to differentiate</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {problems.map((prob, i) => (
            <button key={i} onClick={() => { setSelected(i); setRevealStep(0) }} style={{ padding: '5px 12px', borderRadius: 16, fontSize: 13, cursor: 'pointer', fontWeight: i === selected ? 600 : 400, border: `0.5px solid ${i === selected ? 'var(--color-border-info)' : 'var(--color-border-secondary)'}`, background: i === selected ? 'var(--color-background-info)' : 'transparent', color: i === selected ? 'var(--color-text-info)' : 'var(--color-text-secondary)' }}>
              {prob.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
          d/dx [ {p.label} ] = ?
        </div>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--color-background-warning)', color: 'var(--color-text-warning)', fontWeight: 600 }}>
          {p.category}
        </span>
      </div>

      {/* Outer/inner identification */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ ...card, border: '1.5px solid #38bdf8' }}>
          <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600, marginBottom: 4 }}>OUTER function f(□)</div>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)', fontWeight: 600 }}>{p.outer}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>f'(□) = {p.outerDeriv}</div>
        </div>
        <div style={{ ...card, border: '1.5px solid #f472b6' }}>
          <div style={{ fontSize: 11, color: '#f472b6', fontWeight: 600, marginBottom: 4 }}>INNER function g(x)</div>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)', fontWeight: 600 }}>{p.inner}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>g'(x) = {p.innerDeriv}</div>
        </div>
      </div>

      {/* Step reveal */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
          Three-step process — reveal one at a time
        </div>
        {stepContent.map((sc, i) => (
          <div key={i}>
            {i <= revealStep ? (
              <div style={{ ...card, borderLeft: `3px solid ${sc.col}`, borderRadius: 0, marginBottom: 6, background: sc.warn ? 'var(--color-background-warning)' : sc.big ? 'var(--color-background-success)' : 'var(--color-background-secondary)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 3 }}>{sc.label}</div>
                <div style={{ fontSize: sc.big ? 16 : 13, fontFamily: 'var(--font-serif)', color: sc.big ? sc.col : 'var(--color-text-primary)', fontWeight: sc.big ? 700 : 400, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{sc.content}</div>
              </div>
            ) : i === revealStep + 1 ? (
              <button onClick={() => setRevealStep(i)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-tertiary)', cursor: 'pointer', textAlign: 'left', fontSize: 13, marginBottom: 6 }}>
                ▶ Reveal {sc.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {/* Reset */}
      {revealStep > 0 && (
        <button onClick={() => setRevealStep(0)} style={{ padding: '6px 14px', borderRadius: 8, border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 12 }}>
          ← Hide steps (try again)
        </button>
      )}
    </div>
  )
}
