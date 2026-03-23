import { useMemo, useState } from 'react'
import { parse, derivative, evaluate } from 'mathjs'
import KatexBlock from '../math/KatexBlock.jsx'
import OpenInGrapher from '../lesson/OpenInGrapher.jsx'

const DEPTH_STYLES = [
  { border: '#6366f1', tagBg: '#eef2ff', tagText: '#4338ca', panelBg: 'var(--color-background-secondary)' },
  { border: '#0891b2', tagBg: '#ecfeff', tagText: '#0e7490', panelBg: 'var(--color-background-primary)' },
  { border: '#059669', tagBg: '#ecfdf5', tagText: '#047857', panelBg: 'var(--color-background-secondary)' },
  { border: '#d97706', tagBg: '#fffbeb', tagText: '#b45309', panelBg: 'var(--color-background-primary)' },
  { border: '#9ca3af', tagBg: '#f9fafb', tagText: '#6b7280', panelBg: 'var(--color-background-secondary)' },
]

const DEPTH_BTN_LABELS = ['Why?', 'But why?', 'Prove it', 'From scratch', 'Axioms']

const RULE_LIBRARY = {
  product: {
    label: 'Product Rule',
    formula: "\\frac{d}{dx}(fg)=f'g+fg'",
    why: {
      tag: 'Why Product Rule?',
      explanation: 'Both factors depend on x, so total change has two contributions: changing the first factor and changing the second factor.',
      why: {
        tag: 'Limit proof sketch',
        explanation: 'Add and subtract f(x)g(a) inside the difference quotient and split into two limits.',
      },
    },
  },
  chain: {
    label: 'Chain Rule',
    formula: "\\frac{d}{dx}f(g(x))=f'(g(x))g'(x)",
    why: {
      tag: 'Why Chain Rule?',
      explanation: 'When a function is nested, inner change and outer sensitivity multiply.',
      why: {
        tag: 'Limit split idea',
        explanation: 'Rewrite one difficult quotient as a product of two linked quotients.',
      },
    },
  },
  power: {
    label: 'Power Rule',
    formula: "\\frac{d}{dx}(x^n)=n x^{n-1}",
    why: {
      tag: 'Why Power Rule?',
      explanation: 'From binomial expansion of (x+h)^n, only the linear h term survives as h approaches 0.',
    },
  },
  trig: {
    label: 'Trig Derivatives',
    formula: "(\\sin x)'=\\cos x,\\quad (\\cos x)'=-\\sin x",
    why: {
      tag: 'Why trig derivatives?',
      explanation: 'These come from angle-addition identities and fundamental trig limits.',
    },
  },
  sum: {
    label: 'Sum Rule',
    formula: "\\frac{d}{dx}(f+g)=f'+g'",
    why: {
      tag: 'Why Sum Rule?',
      explanation: 'Differentiation is linear when limits exist, so derivatives distribute over addition.',
    },
  },
}

function toLatex(node) {
  try {
    return node.toTex({ parenthesis: 'auto' })
  } catch {
    return String(node)
  }
}

function wrapIfNeeded(node) {
  if (node?.isOperatorNode && (node.op === '+' || node.op === '-')) {
    return `(${node.toString()})`
  }
  return node.toString()
}

function hasFunctionNode(node) {
  let found = false
  node.traverse((n) => {
    if (n.isFunctionNode) found = true
  })
  return found
}

function nodeHasX(node) {
  let found = false
  node.traverse((n) => {
    if (n.isSymbolNode && n.name === 'x') found = true
  })
  return found
}

function isXPower(node) {
  if (node.isSymbolNode && node.name === 'x') return true
  return !!(node.isOperatorNode && node.op === '^' && node.args?.[0]?.isSymbolNode && node.args[0].name === 'x')
}

function detectRules(node) {
  const rules = []
  node.traverse((n) => {
    if (n.isOperatorNode && n.op === '*') rules.push('product')
    if (n.isOperatorNode && n.op === '^') rules.push('power')
    if (n.isOperatorNode && (n.op === '+' || n.op === '-')) rules.push('sum')
    if (n.isFunctionNode) {
      const name = n.fn?.name
      if (['sin', 'cos', 'tan'].includes(name)) rules.push('trig')
      const arg = n.args?.[0]
      if (arg && nodeHasX(arg) && !(arg.isSymbolNode && arg.name === 'x')) rules.push('chain')
    }
  })
  return [...new Set(rules)]
}

function flattenByOperator(node, op) {
  if (node?.isOperatorNode && node.op === op) {
    return node.args.flatMap((arg) => flattenByOperator(arg, op))
  }
  return [node]
}

function canonicalizeTermFactors(termNode) {
  const factors = flattenByOperator(termNode, '*')

  function factorRank(factor) {
    if (factor.isConstantNode) return 0
    if (isXPower(factor)) return 1

    const hasX = nodeHasX(factor)
    const hasFunc = hasFunctionNode(factor)

    if (hasX && !hasFunc) return 2
    if (!hasX && !hasFunc) return 2
    if (hasFunc) return 4
    return 3
  }

  const sorted = factors
    .map((factor, i) => ({ factor, i, rank: factorRank(factor) }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map((f) => f.factor)

  const text = sorted.map((f) => wrapIfNeeded(f)).join(' * ')
  return parse(text)
}

function canonicalizeDerivative(node) {
  const terms = flattenByOperator(node, '+')
  const orderedTerms = terms.map(canonicalizeTermFactors)
  const joined = orderedTerms.map((t) => wrapIfNeeded(t)).join(' + ')
  return parse(joined)
}

function buildWhyFromRules(rules) {
  const metas = rules.map((r) => RULE_LIBRARY[r]).filter((m) => !!m)
  if (!metas.length) return null
  if (metas.length === 1) return metas[0].why

  return {
    tag: 'Rules used in this step',
    explanation: 'This step combines multiple derivative rules in sequence.',
    steps: metas.map((m) => ({ text: m.label, math: m.formula })),
  }
}

function normalizeInput(raw) {
  return raw.trim().replace(/^\s*[a-zA-Z]+\(x\)\s*=\s*/, '')
}

function validateDerivativeOnlyInput(raw) {
  const text = raw.toLowerCase()
  if (text.includes('lim') || text.includes('limit')) {
    return 'This tool is currently derivative-only. Please remove limit notation and enter just f(x).'
  }
  if (text.includes('int') || text.includes('integral') || text.includes('∫')) {
    return 'This tool is currently derivative-only. Please remove integral notation and enter just f(x).'
  }
  return ''
}

function findNumericCheck(exprText, derivText) {
  const candidates = [1, 2, 0.5, -1, 3]
  const h = 1e-5

  for (const x0 of candidates) {
    try {
      const fxph = evaluate(exprText, { x: x0 + h })
      const fxmh = evaluate(exprText, { x: x0 - h })
      const slope = (fxph - fxmh) / (2 * h)
      const exact = evaluate(derivText, { x: x0 })
      if (!Number.isFinite(slope) || !Number.isFinite(exact)) continue
      return { x0, slope, exact }
    } catch {
      // Keep searching for a safe point.
    }
  }

  return null
}

function buildExplanation(input) {
  const normalized = normalizeInput(input)
  const derivativeOnlyError = validateDerivativeOnlyInput(normalized)
  if (derivativeOnlyError) throw new Error(derivativeOnlyError)

  const exprNode = parse(normalized)
  const steps = []

  steps.push({
    id: 'identify',
    tag: 'Identify structure',
    title: 'Detect expression patterns and derivative plan',
    math: `f(x) = ${toLatex(exprNode)}`,
    note: `Detected rules: ${detectRules(exprNode).map((r) => RULE_LIBRARY[r]?.label ?? r).join(', ') || 'Direct derivative rules'}.`,
    ruleCodes: detectRules(exprNode),
    why: {
      tag: 'How was the plan chosen?',
      explanation: 'The parser reads the expression tree and maps visible patterns (product, nesting, powers, trig, sums) to derivative theorems.',
    },
  })

  let rawNode
  if (exprNode.isOperatorNode && exprNode.op === '*' && exprNode.args.length === 2) {
    const left = exprNode.args[0]
    const right = exprNode.args[1]
    const dLeft = derivative(left, 'x')
    const dRight = derivative(right, 'x')

    steps.push({
      id: 'differentiate-framework',
      tag: 'Differentiate 3.1',
      title: 'Setup Product Rule framework with deferred execution',
      math: `f'(x)=\\left[\\frac{d}{dx}${toLatex(left)}\\right]\\cdot ${toLatex(right)} + ${toLatex(left)}\\cdot\\left[\\frac{d}{dx}${toLatex(right)}\\right]`,
      note: 'We scaffold first before evaluating each derivative chunk.',
      ruleCodes: ['product'],
      why: RULE_LIBRARY.product.why,
    })

    steps.push({
      id: 'differentiate-left',
      tag: 'Differentiate 3.2',
      title: 'Evaluate the first chunk',
      math: `\\frac{d}{dx}${toLatex(left)} = ${toLatex(dLeft)}`,
      note: 'This chunk typically uses chain/trig/power logic depending on the left factor.',
      ruleCodes: detectRules(left),
      why: buildWhyFromRules(detectRules(left)),
    })

    steps.push({
      id: 'differentiate-right',
      tag: 'Differentiate 3.3',
      title: 'Evaluate the second chunk',
      math: `\\frac{d}{dx}${toLatex(right)} = ${toLatex(dRight)}`,
      note: 'This chunk isolates derivative rules for the right factor.',
      ruleCodes: detectRules(right),
      why: buildWhyFromRules(detectRules(right)),
    })

    rawNode = parse(`(${wrapIfNeeded(dLeft)})*(${wrapIfNeeded(right)}) + (${wrapIfNeeded(left)})*(${wrapIfNeeded(dRight)})`)

    steps.push({
      id: 'differentiate-merge',
      tag: 'Differentiate 3.4',
      title: 'Merge the evaluated chunks (unsimplified)',
      math: `f'(x) = ${toLatex(rawNode)}`,
      note: 'This is the unsimplified result after local derivatives are substituted.',
      ruleCodes: ['product'],
      why: {
        tag: 'Why merge now?',
        explanation: 'Combining chunks preserves proof traceability. Simplification is deferred to the next stage.',
      },
    })
  } else {
    rawNode = derivative(exprNode, 'x')
    steps.push({
      id: 'differentiate-generic',
      tag: 'Differentiate 3.x',
      title: 'Apply derivative rules directly',
      math: `f'(x) = ${toLatex(rawNode)}`,
      note: 'This expression is not a two-factor top-level product, so one direct differentiation step is used.',
      ruleCodes: detectRules(exprNode),
      why: buildWhyFromRules(detectRules(exprNode)),
    })
  }

  const simplifiedNode = canonicalizeDerivative(rawNode)
  steps.push({
    id: 'simplify',
    tag: 'Simplify',
    title: 'Reorder terms for pedagogy-safe readability',
    math: `f'(x) = ${toLatex(simplifiedNode)}`,
    note: 'AST reorder rule: coefficients and x-polynomials are pulled before trig terms to reduce angle confusion.',
    ruleCodes: ['sum'],
    why: {
      tag: 'Why this order?',
      explanation: 'Learners often confuse trig argument structure when scalar factors appear at the end. Front-loading algebra clarifies what the angle is.',
      steps: [
        { text: 'Priority 1: constants/coefficient factors' },
        { text: 'Priority 2: x and x-powers' },
        { text: 'Priority 3: algebraic polynomials' },
        { text: 'Priority 4: trig/exponential function factors' },
      ],
    },
  })

  const check = findNumericCheck(normalized, simplifiedNode.toString())
  if (check) {
    steps.push({
      id: 'numeric-check',
      tag: 'Numeric check',
      title: 'Cross-check symbolic derivative with finite difference',
      math: `x_0=${check.x0},\\quad f'(x_0)\\approx ${check.slope.toFixed(6)},\\quad \\text{symbolic }f'(x_0)=${check.exact.toFixed(6)}`,
      note: `Absolute error: ${Math.abs(check.slope - check.exact).toExponential(2)}.`,
      ruleCodes: [],
      why: {
        tag: 'Why numeric validation?',
        explanation: 'It provides an independent sanity check that the symbolic workflow is coherent.',
      },
    })
  }

  return {
    inputLatex: toLatex(exprNode),
    inputExpr: exprNode.toString(),
    steps,
    finalLatex: toLatex(simplifiedNode),
    finalExpr: simplifiedNode.toString(),
  }
}

function RuleChip({ code }) {
  const meta = RULE_LIBRARY[code]
  if (!meta) return null
  return (
    <span className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
      {meta.label}
    </span>
  )
}

function WhyPanel({ why, depth = 0 }) {
  const [open, setOpen] = useState(false)
  if (!why) return null
  const d = DEPTH_STYLES[Math.min(depth, DEPTH_STYLES.length - 1)]
  const btnLabel = why.tag || DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)]

  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: open ? d.tagBg : 'transparent',
          border: `1px solid ${d.border}`,
          borderRadius: 6, padding: '4px 12px',
          fontSize: 12, fontWeight: 500, color: d.border,
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}
      >
        <span style={{
          width: 15, height: 15, borderRadius: '50%', background: d.border,
          color: '#fff', fontSize: 10, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{open ? '−' : '?'}</span>
        {open ? 'Close' : btnLabel}
      </button>

      {open && (
        <div style={{
          marginTop: 8, padding: '14px 16px',
          background: d.panelBg,
          border: `0.5px solid ${d.border}22`,
          borderLeft: `3px solid ${d.border}`,
          borderRadius: '0 8px 8px 0',
          animation: 'slideDown .18s ease-out',
        }}>
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 4, marginBottom: 10,
            background: d.tagBg, color: d.tagText, border: `0.5px solid ${d.border}44`,
          }}>
            {why.tag || DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)]}
          </span>

          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-primary)', marginBottom: why.math || why.steps ? 12 : 0 }}>
            {why.explanation}
          </p>

          {why.math && (
            <div style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 8, padding: '12px 16px',
              textAlign: 'center', overflowX: 'auto', marginBottom: 8,
            }}>
              <KatexBlock expr={why.math} className="text-slate-900 dark:text-slate-100" />
            </div>
          )}

          {why.steps && (
            <div style={{ marginTop: 10 }}>
              {why.steps.map((st, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    minWidth: 22, height: 22, borderRadius: '50%', background: d.border,
                    color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-primary)', marginBottom: st.math ? 5 : 0 }}>
                      {st.text}
                    </p>
                    {st.math && (
                      <div style={{
                        background: 'var(--color-background-secondary)',
                        borderRadius: 6, padding: '8px 12px',
                        textAlign: 'center', overflowX: 'auto', marginTop: 4,
                      }}>
                        <KatexBlock expr={st.math} className="text-slate-900 dark:text-slate-100" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {why.why && <WhyPanel why={why.why} depth={depth + 1} />}
        </div>
      )}
    </div>
  )
}

export default function UniversalCalcExplainer() {
  const [input, setInput] = useState('sin(x^3) * (x^2 + 1)')
  const [submitted, setSubmitted] = useState('sin(x^3) * (x^2 + 1)')
  const [activeStep, setActiveStep] = useState(0)
  const [recentInputs, setRecentInputs] = useState(() => {
    try {
      const raw = localStorage.getItem('universal-calc-recent-inputs')
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.slice(0, 5) : []
    } catch {
      return []
    }
  })

  const { explanation, error } = useMemo(() => {
    try {
      return { explanation: buildExplanation(submitted), error: '' }
    } catch (e) {
      return {
        explanation: null,
        error: e?.message || 'Could not parse expression. Use mathjs style, e.g. sin(x^3) * (x^2 + 1).',
      }
    }
  }, [submitted])

  function handleExplain() {
    const normalized = normalizeInput(input)
    setSubmitted(normalized)
    const nextRecent = [normalized, ...recentInputs.filter((e) => e !== normalized)].slice(0, 5)
    setRecentInputs(nextRecent)
    localStorage.setItem('universal-calc-recent-inputs', JSON.stringify(nextRecent))
    setActiveStep(0)
  }

  return (
    <section className="max-w-4xl mx-auto">
      <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Universal Calc Explainer (Beta)</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Sequential proof stepper with progressive disclosure. Each step opens only when you navigate to it.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full min-h-[86px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 font-mono text-sm text-slate-800 dark:text-slate-100"
          placeholder="Examples: sin(x^3), (2*x+1)^5*(3*x-2)^7, exp(x^2)/x"
        />

        {recentInputs.length > 0 && (
          <div className="mt-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
              Recent Equations
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return
                setInput(e.target.value)
              }}
            >
              <option value="">Select one of your last 5</option>
              {recentInputs.map((expr, i) => (
                <option key={`${expr}-${i}`} value={expr}>{expr}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleExplain}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold"
          >
            Start Sequential Proof
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">Supported: +, -, *, /, ^, sin, cos, tan, exp, log (variable x)</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {explanation && (
        <>
          <div className="mb-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide font-bold text-slate-500 dark:text-slate-400 mb-2">Problem</p>
            <KatexBlock expr={`f(x) = ${explanation.inputLatex}`} className="text-slate-900 dark:text-slate-100" />
          </div>

          <div className="mb-4 flex gap-2">
            {explanation.steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(i)}
                className={`h-2 flex-1 rounded-full transition-colors ${i === activeStep ? 'bg-slate-800 dark:bg-slate-100' : i < activeStep ? 'bg-slate-400 dark:bg-slate-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center">{activeStep + 1}</span>
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-wide font-bold text-slate-500 dark:text-slate-400">{explanation.steps[activeStep].tag}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{explanation.steps[activeStep].title}</p>
                {explanation.steps[activeStep].ruleCodes?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {explanation.steps[activeStep].ruleCodes.map((code) => <RuleChip key={`${explanation.steps[activeStep].id}-${code}`} code={code} />)}
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{activeStep + 1} / {explanation.steps.length}</span>
            </div>

            <div className="p-4">
              <KatexBlock expr={explanation.steps[activeStep].math} className="text-slate-900 dark:text-slate-100" />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{explanation.steps[activeStep].note}</p>
              {explanation.steps[activeStep].why && <WhyPanel why={explanation.steps[activeStep].why} depth={0} />}
            </div>
          </article>

          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              disabled={activeStep === 0}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40"
            >
              Previous Step
            </button>
            <button
              onClick={() => setActiveStep((s) => Math.min(explanation.steps.length - 1, s + 1))}
              disabled={activeStep === explanation.steps.length - 1}
              className="flex-1 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-semibold text-white disabled:opacity-40"
            >
              Next Step
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Final simplified derivative</h2>
            <KatexBlock expr={`f'(x) = ${explanation.finalLatex}`} className="text-slate-900 dark:text-slate-100" />
            <div className="mt-4">
              <OpenInGrapher
                variant="button"
                label="Open f(x) and f'(x) in Grapher"
                config={{
                  mode: 'pro',
                  replace: true,
                  functions: [
                    { expr: explanation.inputExpr, type: 'explicit', color: '#6366f1', label: 'f(x)' },
                    { expr: explanation.finalExpr, type: 'explicit', color: '#ec4899', label: "f'(x)" },
                  ],
                }}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Grapher opens with a snapshot of the current function pair. Click Explain again after edits to refresh the plotted derivative.
              </p>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  )
}
