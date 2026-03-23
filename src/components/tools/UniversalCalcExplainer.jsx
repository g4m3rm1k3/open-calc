import { useMemo, useState } from 'react'
import { parse, derivative, simplify, evaluate } from 'mathjs'
import KatexBlock from '../math/KatexBlock.jsx'

function nodeHasX(node) {
  let found = false
  node.traverse((n) => {
    if (n.isSymbolNode && n.name === 'x') found = true
  })
  return found
}

function detectRules(node) {
  const rules = []

  node.traverse((n) => {
    if (n.isOperatorNode && n.op === '*' && n.args.filter(nodeHasX).length >= 2) {
      rules.push('product')
    }
    if (n.isOperatorNode && n.op === '/') {
      rules.push('quotient')
    }
    if (n.isOperatorNode && n.op === '^') {
      rules.push('power')
    }
    if (n.isFunctionNode && n.args?.[0] && nodeHasX(n.args[0])) {
      const arg = n.args[0]
      if (!(arg.isSymbolNode && arg.name === 'x')) {
        rules.push('chain')
      }
    }
  })

  return [...new Set(rules)]
}

function getRuleWhy(rule) {
  const WHY = {
    product: {
      label: 'Why product rule?',
      explanation: 'If two x-dependent factors multiply, both can change. The derivative must account for change from each side: f\'g + fg\'.',
      deeper: 'From limits: add and subtract f(x)g(a), split, then apply limit laws.',
    },
    quotient: {
      label: 'Why quotient rule?',
      explanation: 'A quotient is a product with a reciprocal: f/g = f * g^{-1}. Differentiate and simplify.',
      deeper: 'This is equivalent to d/dx[f/g] = (f\'g - fg\') / g^2 when g != 0.',
    },
    power: {
      label: 'Why power rule?',
      explanation: 'For x^n, the leading linear term from (x+h)^n controls the limit, giving n*x^(n-1).',
      deeper: 'Binomial expansion plus h -> 0 removes higher-order h terms.',
    },
    chain: {
      label: 'Why chain rule?',
      explanation: 'For nested functions f(g(x)), inner change and outer sensitivity multiply: f\'(g(x)) * g\'(x).',
      deeper: 'This comes from rewriting a hard quotient into two linked limits.',
    },
  }
  return WHY[rule]
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
      return {
        x0,
        slope,
        exact,
      }
    } catch {
      // Try next safe point.
    }
  }

  return null
}

function toLatex(node) {
  try {
    return node.toTex({ parenthesis: 'auto' })
  } catch {
    return String(node)
  }
}

function buildExplanation(input) {
  const exprNode = parse(input)
  const derivNode = derivative(exprNode, 'x')
  const simplifiedNode = simplify(derivNode)

  const rules = detectRules(exprNode)
  const derivText = simplifiedNode.toString()
  const check = findNumericCheck(input, derivText)

  const ruleLines = rules.length
    ? rules.map((r) => r[0].toUpperCase() + r.slice(1)).join(', ')
    : 'Direct derivative'

  const steps = [
    {
      id: 'identify',
      tag: 'Identify structure',
      title: 'Detect the shape of the expression',
      math: `f(x) = ${toLatex(exprNode)}`,
      note: `Detected strategy: ${ruleLines}.`,
    },
    {
      id: 'differentiate',
      tag: 'Differentiate',
      title: 'Take derivative using detected rules',
      math: `f'(x) = ${toLatex(derivNode)}`,
      note: 'This is the raw symbolic derivative before cleanup.',
    },
    {
      id: 'simplify',
      tag: 'Simplify',
      title: 'Clean up equivalent expression',
      math: `f'(x) = ${toLatex(simplifiedNode)}`,
      note: 'Algebraic simplification keeps meaning but improves readability.',
    },
  ]

  if (check) {
    steps.push({
      id: 'numeric-check',
      tag: 'Numeric check',
      title: 'Verify derivative numerically at one point',
      math: `x_0 = ${check.x0},\\quad f'(x_0) \\approx ${check.slope.toFixed(6)},\\quad \\text{symbolic } f'(x_0) = ${check.exact.toFixed(6)}`,
      note: `Absolute error: ${Math.abs(check.slope - check.exact).toExponential(2)}.`,
    })
  }

  const why = rules.map((r) => ({ rule: r, data: getRuleWhy(r) })).filter((r) => !!r.data)

  return {
    inputLatex: toLatex(exprNode),
    derivativeLatex: toLatex(simplifiedNode),
    steps,
    why,
    dependency: [
      'Expression structure',
      ...(rules.length ? rules.map((r) => `${r} rule`) : ['basic derivative rules']),
      'algebra simplification',
      'numeric consistency check',
    ],
  }
}

export default function UniversalCalcExplainer() {
  const [input, setInput] = useState('sin(x^3) * (x^2 + 1)')
  const [submitted, setSubmitted] = useState('sin(x^3) * (x^2 + 1)')
  const [error, setError] = useState('')

  const explanation = useMemo(() => {
    try {
      setError('')
      return buildExplanation(submitted)
    } catch {
      setError('Could not parse expression. Use mathjs style, e.g. sin(x^3) * (x^2 + 1).')
      return null
    }
  }, [submitted])

  return (
    <section className="max-w-4xl mx-auto">
      <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Universal Calc Explainer (Beta)</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Enter a derivative expression and get strategy detection, symbolic steps, and a numeric sanity check.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full min-h-[86px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 font-mono text-sm text-slate-800 dark:text-slate-100"
          placeholder="Examples: sin(x^3), (2*x+1)^5*(3*x-2)^7, exp(x^2)/x"
        />

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setSubmitted(input)}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold"
          >
            Explain Derivative
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">Supported: +, -, *, /, ^, sin, cos, tan, exp, log</p>
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
            <p className="text-xs uppercase tracking-wide font-bold text-slate-500 dark:text-slate-400 mb-2">Result</p>
            <KatexBlock expr={`f(x) = ${explanation.inputLatex}`} className="text-slate-900 dark:text-slate-100 mb-2" />
            <KatexBlock expr={`f'(x) = ${explanation.derivativeLatex}`} className="text-slate-900 dark:text-slate-100" />
          </div>

          <div className="space-y-4 mb-6">
            {explanation.steps.map((step, i) => (
              <article key={step.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-bold text-slate-500 dark:text-slate-400">{step.tag}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{step.title}</p>
                  </div>
                </div>
                <div className="p-4">
                  <KatexBlock expr={step.math} className="text-slate-900 dark:text-slate-100" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{step.note}</p>
                </div>
              </article>
            ))}
          </div>

          {explanation.why.length > 0 && (
            <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Why these rules apply</h2>
              <div className="space-y-3">
                {explanation.why.map(({ rule, data }) => (
                  <details key={rule} className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-100">{data.label}</summary>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{data.explanation}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.deeper}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Dependency chain</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {explanation.dependency.join(' -> ')}
            </p>
          </div>
        </>
      )}
    </section>
  )
}
