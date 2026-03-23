import { useState } from 'react'

/**
 * ChainRuleLimitBridgeViz — Viz 3: "The limit algebra bridge"
 *
 * Walks through the EXACT proof shown in the textbook image, step by step.
 * Each step:
 *   - Shows the algebraic expression
 *   - Has a "what is happening" explanation in plain English
 *   - Has a "why this is valid" geometric/logical justification
 *   - Links to the prerequisite concept being used
 *
 * Pure React — no D3 needed, clarity > animation here.
 */
export default function ChainRuleLimitBridgeViz({ params = {} }) {
  const [step, setStep] = useState(0)
  const [showPrereq, setShowPrereq] = useState(null)

  const prereqs = {
    limitDef: {
      title: 'Limit definition of derivative',
      body: "f'(a) = lim(x→a) [f(x)−f(a)] / (x−a)\n\nThis says: the derivative at a is the slope of the secant line as the two points merge. The numerator is the change in output; the denominator is the change in input.",
    },
    multBy1: {
      title: 'Multiplying by a clever form of 1',
      body: "Multiplying by (x³−a³)/(x³−a³) equals 1, so the limit is unchanged.\n\nWhy do this? It splits one complicated limit into a PRODUCT of two limits — each of which we can recognise as a derivative.",
    },
    productLimit: {
      title: 'Limit of a product = product of limits',
      body: "lim(x→a) [f(x)·g(x)] = lim(x→a) f(x) · lim(x→a) g(x)\n\n(when both limits exist individually)\n\nThis allows us to evaluate each factor separately.",
    },
    secondFactor: {
      title: 'Recognising the second factor as a derivative',
      body: "lim(x→a) (x³−a³)/(x−a)\n\nThis matches the definition f'(a) where f(x)=x³. So this limit IS the derivative of x³ at a, which equals 3a².\n\nYou MUST recognise this pattern — it is the key move.",
    },
    substitution: {
      title: 'Substitution u = x³',
      body: "When x→a, what does x³ approach?\n\nSince x³ is continuous, x³→a³ as x→a.\n\nSo the first factor, rewritten with u=x³, has u→a³.\n\nThis converts the first limit into the derivative of sin(u) at u=a³.",
    },
    firstFactor: {
      title: 'Recognising the first factor as a derivative',
      body: "lim(u→a³) [sin(u)−sin(a³)] / (u−a³)\n\nThis is the definition of (d/du)sin(u) evaluated at u=a³.\n\n= cos(a³)\n\nAgain: pattern recognition is the key skill.",
    },
  }

  const steps = [
    {
      id: 'start',
      heading: 'Start: what we want to find',
      expr: "h'(a) = lim(x→a)  [sin(x³) − sin(a³)] / (x − a)",
      plain: "We want the derivative of h(x) = sin(x³) at the point x = a.",
      why: "This is just plugging h(x) = sin(x³) into the limit definition of derivative. Nothing fancy yet.",
      prereq: 'limitDef',
      prereqLabel: 'Limit definition of derivative ↗',
      note: null,
    },
    {
      id: 'multiply',
      heading: 'Step 1: multiply top and bottom by (x³ − a³)',
      expr: "h'(a) = lim(x→a)  [sin(x³) − sin(a³)] / (x³ − a³)  ·  (x³ − a³) / (x − a)",
      plain: "We multiply by (x³−a³)/(x³−a³) — which equals 1, so nothing changes mathematically.",
      why: "This looks like a strange move — why would you do it? Because it SPLITS the single complicated limit into a PRODUCT of two limits, each of which is recognisable as a derivative.",
      prereq: 'multBy1',
      prereqLabel: 'Why multiply by 1? ↗',
      note: "This is the algebraic trick the book doesn't explain. It's not obvious — it's a pattern mathematicians learned to recognise.",
    },
    {
      id: 'split',
      heading: 'Step 2: split into a product of two limits',
      expr: "= lim(x→a) [sin(x³) − sin(a³)] / (x³ − a³)  ×  lim(x→a) (x³ − a³) / (x − a)",
      plain: "Because each factor has its own limit, we can evaluate them separately.",
      why: "The limit of a product equals the product of the limits — as long as both limits exist. They do here.",
      prereq: 'productLimit',
      prereqLabel: 'Limit of a product rule ↗',
      note: null,
    },
    {
      id: 'secondFactor',
      heading: 'Step 3: evaluate the SECOND factor',
      expr: "lim(x→a) (x³ − a³) / (x − a)  =  d/dx[x³] at x=a  =  3a²",
      plain: "The second factor matches the definition of derivative exactly — with f(x) = x³. So this limit IS the derivative of x³ at a.",
      why: "Pattern: [f(x)−f(a)]/(x−a) as x→a is ALWAYS f'(a). Here f(x)=x³, so f'(x)=3x², giving 3a² at x=a.",
      prereq: 'secondFactor',
      prereqLabel: 'Recognising the derivative pattern ↗',
      note: "This is the second key move: seeing a limit and recognising it as a derivative. Practice this pattern — it comes up constantly.",
    },
    {
      id: 'firstFactor',
      heading: 'Step 4: evaluate the FIRST factor — substitution u = x³',
      expr: "As x→a:  u = x³ → a³\n\nlim(x→a) [sin(x³)−sin(a³)] / (x³−a³)\n= lim(u→a³) [sin(u)−sin(a³)] / (u−a³)\n= d/du[sin u] at u=a³\n= cos(a³)",
      plain: "Let u = x³. As x approaches a, u = x³ approaches a³ (by continuity). Rewriting with u, the first factor also matches the derivative definition — this time for sin(u).",
      why: "After substitution, [sin(u)−sin(a³)]/(u−a³) as u→a³ is the definition of d/du[sin u] at u=a³ = cos(a³).",
      prereq: 'substitution',
      prereqLabel: 'Why u=x³ works ↗',
      note: "This is the hardest step. The substitution is invisible until you've seen it before. Once recognised, the rest is mechanical.",
    },
    {
      id: 'assemble',
      heading: 'Step 5: multiply the two results together',
      expr: "h'(a) = cos(a³) × 3a²\n\nOr in function notation:\nh'(x) = cos(x³) · 3x²",
      plain: "The two limits we evaluated separately now multiply together to give the chain rule result.",
      why: "Chain rule: derivative of outer (cos(x³), keeping inner inside) times derivative of inner (3x²).",
      prereq: null,
      prereqLabel: null,
      note: "Notice: this is exactly what the chain rule formula predicts — f'(g(x))·g'(x) = cos(x³)·3x². The limit proof is just the rigorous verification that the chain rule is true.",
    },
  ]

  const s = steps[step]

  const card = { background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-lg)', padding: '14px 16px', marginBottom: 10, border: '0.5px solid var(--color-border-tertiary)' }
  const exprStyle = { fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.9, background: 'var(--color-background-primary)', padding: '12px 16px', borderRadius: 8, border: '0.5px solid var(--color-border-secondary)', whiteSpace: 'pre-wrap', marginBottom: 10 }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0' }}>
      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {steps.map((st, i) => (
          <button key={i} onClick={() => { setStep(i); setShowPrereq(null) }} style={{ padding: '4px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer', fontWeight: i === step ? 600 : 400, border: `0.5px solid ${i === step ? 'var(--color-border-info)' : 'var(--color-border-secondary)'}`, background: i === step ? 'var(--color-background-info)' : i < step ? 'var(--color-background-success)' : 'transparent', color: i === step ? 'var(--color-text-info)' : i < step ? 'var(--color-text-success)' : 'var(--color-text-secondary)' }}>
            {i < step ? '✓' : i + 1}
          </button>
        ))}
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', alignSelf: 'center', marginLeft: 4 }}>Step {step + 1} of {steps.length}</span>
      </div>

      {/* Main step content */}
      <div style={{ ...card, borderLeft: '3px solid var(--color-border-info)', borderRadius: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Step {step + 1}</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>{s.heading}</div>
      </div>

      <div style={exprStyle}>{s.expr}</div>

      <div style={{ ...card, borderLeft: '3px solid var(--color-border-success)', borderRadius: 0, marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>What is happening</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{s.plain}</div>
      </div>

      <div style={{ ...card, borderLeft: '3px solid var(--color-border-warning)', borderRadius: 0, marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Why this is valid</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{s.why}</div>
      </div>

      {s.note && (
        <div style={{ ...card, borderLeft: '3px solid var(--color-border-danger)', borderRadius: 0, marginBottom: 8, background: 'var(--color-background-danger)' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Key insight — easy to miss</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{s.note}</div>
        </div>
      )}

      {/* Prerequisite drawer */}
      {s.prereq && (
        <button onClick={() => setShowPrereq(showPrereq === s.prereq ? null : s.prereq)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-info)', marginBottom: 8 }}>
          {showPrereq === s.prereq ? '▼' : '▶'} Prerequisite: {s.prereqLabel}
        </button>
      )}

      {showPrereq && prereqs[showPrereq] && (
        <div style={{ ...card, background: 'var(--color-background-info)', borderColor: 'var(--color-border-info)', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-info)', marginBottom: 6 }}>{prereqs[showPrereq].title}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{prereqs[showPrereq].body}</div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={() => { setStep(s => Math.max(0, s - 1)); setShowPrereq(null) }} disabled={step === 0} style={{ padding: '7px 18px', borderRadius: 8, border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
        <button onClick={() => { setStep(s => Math.min(steps.length - 1, s + 1)); setShowPrereq(null) }} disabled={step === steps.length - 1} style={{ padding: '7px 18px', borderRadius: 8, border: '0.5px solid var(--color-border-info)', background: 'var(--color-background-info)', color: 'var(--color-text-info)', cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer', opacity: step === steps.length - 1 ? 0.4 : 1, fontWeight: 500 }}>Next →</button>
        {step === steps.length - 1 && (
          <button onClick={() => { setStep(0); setShowPrereq(null) }} style={{ padding: '7px 18px', borderRadius: 8, border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: 12 }}>Start over</button>
        )}
      </div>
    </div>
  )
}
