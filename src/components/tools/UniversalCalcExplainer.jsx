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
  constant: {
    label: 'Constant Rule',
    formula: "\\frac{d}{dx}c=0",
    why: {
      tag: 'Why constant rule?',
      explanation: 'A constant does not vary with x, so its rate of change is zero.',
    },
  },
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
  log: {
    label: 'Log Derivative',
    formula: "(\\ln x)'=\\frac{1}{x}",
    why: {
      tag: 'Why log derivative?',
      explanation: 'It follows from the inverse relationship between exp and ln, plus the chain rule for nested inputs.',
    },
  },
  exp: {
    label: 'Exponential Derivative',
    formula: "(e^x)'=e^x",
    why: {
      tag: 'Why exponential derivative?',
      explanation: 'The exponential is its own derivative, and with nested input we multiply by the inner derivative.',
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
  quotient: {
    label: 'Quotient Rule',
    formula: "\\frac{d}{dx}\\left(\\frac{f}{g}\\right)=\\frac{f'g-fg'}{g^2}",
    why: {
      tag: 'Why quotient rule?',
      explanation: 'It comes from product rule plus reciprocal derivative: f/g = f * g^{-1}.',
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
    if (n.isOperatorNode && n.op === '^') {
      rules.push('power')
      const base = n.args?.[0]
      if (base && nodeHasX(base) && !(base.isSymbolNode && base.name === 'x')) {
        rules.push('chain')
      }
    }
    if (n.isOperatorNode && (n.op === '+' || n.op === '-')) rules.push('sum')
    if (n.isFunctionNode) {
      const name = n.fn?.name
      if (['sin', 'cos', 'tan'].includes(name)) rules.push('trig')
      if (name === 'exp') rules.push('exp')
      if (name === 'log' || name === 'ln') rules.push('log')
      const arg = n.args?.[0]
      if (arg && nodeHasX(arg) && !(arg.isSymbolNode && arg.name === 'x')) rules.push('chain')
    }
  })
  return [...new Set(rules)]
}

function flattenByOperator(node, op) {
  if (node?.isParenthesisNode && node.content) {
    return flattenByOperator(node.content, op)
  }
  if (node?.isOperatorNode && node.op === op) {
    return node.args.flatMap((arg) => flattenByOperator(arg, op))
  }
  return [node]
}

function canonicalizeTermFactors(termNode) {
  const factors = flattenByOperator(termNode, '*')

  function getNodeRank(factor) {
    if (factor.isConstantNode) return 1
    if (factor.isSymbolNode && factor.name === 'x') return 2
    if (factor.isOperatorNode && factor.op === '^' && factor.args?.[0]?.isSymbolNode && factor.args[0].name === 'x') return 2
    if (factor.isFunctionNode) {
      const fn = factor.fn?.name?.toLowerCase()
      if (fn === 'sin' || fn === 'cos' || fn === 'tan') return 3
      return 4
    }

    const hasX = nodeHasX(factor)
    const hasFunc = hasFunctionNode(factor)
    if (hasX && !hasFunc) return 2
    if (!hasX && !hasFunc) return 2
    return 4
  }

  const sorted = factors
    .map((factor, i) => ({ factor, i, rank: getNodeRank(factor) }))
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

function boxedDerivativeTarget(exprLatex, varName = 'x') {
  if (!exprLatex) return ''
  return `\\frac{d}{d${varName}}\\left(\\boxed{${exprLatex}}\\right)`
}

function extractPrimaryEquality(mathExpr) {
  const text = String(mathExpr || '')
  const idx = text.indexOf('=')
  if (idx === -1) return { before: text.trim(), after: '' }
  return {
    before: text.slice(0, idx).trim(),
    after: text.slice(idx + 1).trim(),
  }
}

function extractDerivativePreviewFromMath(mathExpr) {
  const eq = extractPrimaryEquality(mathExpr)
  if (eq.after) return eq.after
  return eq.before || ''
}

function compactLatex(text) {
  return String(text || '').replace(/\s+/g, '')
}

function replaceFirstExact(text, search, replacement) {
  if (!search) return { text, changed: false }
  const idx = text.indexOf(search)
  if (idx === -1) return { text, changed: false }
  return {
    text: `${text.slice(0, idx)}${replacement}${text.slice(idx + search.length)}`,
    changed: true,
  }
}

function normalizeForMatch(text) {
  return String(text || '')
    .replace(/\s+/g, '')
    .replace(/\\left|\\right/g, '')
    .replace(/[{}]/g, '')
    .replace(/\\cdot/g, '*')
}

function replaceFirstLoose(text, search, replacement) {
  if (!search) return { text, changed: false }

  const normalizedSearch = normalizeForMatch(search)
  if (!normalizedSearch) return { text, changed: false }

  const raw = String(text || '')

  // Fast path exact match first.
  const exact = replaceFirstExact(raw, search, replacement)
  if (exact.changed) return exact

  // Fallback: find first raw slice whose normalized form matches.
  for (let start = 0; start < raw.length; start += 1) {
    let norm = ''
    for (let end = start + 1; end <= raw.length; end += 1) {
      norm = normalizeForMatch(raw.slice(start, end))
      if (norm === normalizedSearch) {
        return {
          text: `${raw.slice(0, start)}${replacement}${raw.slice(end)}`,
          changed: true,
        }
      }
      if (norm.length > normalizedSearch.length) break
    }
  }

  return { text: raw, changed: false }
}

function derivativeTargets(exprLatex, varName = 'x') {
  const e = compactLatex(exprLatex)
  if (!e) return []
  const forms = [e, `(${e})`, `{${e}}`, `({${e}})`, `{(${e})}`]
  const targets = []
  forms.forEach((f) => {
    targets.push(`\\frac{d}{d${varName}}\\left(${f}\\right)`)
    targets.push(`\\frac{d}{d${varName}}(${f})`)
    targets.push(`\\frac{d}{d${varName}}\\left[${f}\\right]`)
  })
  return [...new Set(targets)]
}

function cleanupLatexExpression(exprLatex) {
  let s = String(exprLatex || '')

  // Evaluate simple integer exponent offsets like x^{3-1} -> x^{2}
  s = s.replace(/\^\{\s*(-?\d+)\s*-\s*1\s*\}/g, (_, n) => `^{${Number(n) - 1}}`)

  // Remove multiplicative identity factors.
  s = s.replace(/\\cdot\s*1(?!\d)/g, '')
  s = s.replace(/1\s*\\cdot\s*/g, '')

  // Remove additive zero terms.
  s = s.replace(/\+\s*0(?!\d)/g, '')
  s = s.replace(/0\s*\+\s*/g, '')

  // x^1 or x^{1} -> x
  s = s.replace(/x\^\{1\}/g, 'x')
  s = s.replace(/x\^1(?!\d)/g, 'x')

  // Remove multiplication dots in common simplified contexts.
  s = s.replace(/(\d)\s*\\cdot\s*(x(?:\^\{[^}]+\}|\^\d+)?)/g, '$1$2')
  s = s.replace(/\)\s*\\cdot\s*(\\(?:sin|cos|tan|exp|log|ln))/g, ')$1')
  s = s.replace(/\)\s*\\cdot\s*(\\left\()/g, ')$1')
  s = s.replace(/(x(?:\^\{[^}]+\}|\^\d+)?)\s*\\cdot\s*(\\(?:sin|cos|tan|exp|log|ln))/g, '$1$2')

  // Keep \cdot only between two raw numbers; remove all other dots.
  s = s.replace(/(\d)\s*\\cdot\s*(\d)/g, '$1@@NUMDOT@@$2')
  s = s.replace(/\\cdot/g, ' ')
  s = s.replace(/@@NUMDOT@@/g, ' \\cdot ')

  return s.replace(/\s+/g, ' ').trim()
}

function tidyDisplayLatex(exprLatex) {
  return String(exprLatex || '')
    .replace(/\\cdot(?=(?:x|y|z|\\left\(|\\sin|\\cos|\\tan|\\exp|\\log|\\ln|\\frac|\\sqrt))/g, '\\cdot ')
    .replace(/\s+/g, ' ')
    .trim()
}

function describeFocusFromStepId(id) {
  const labelMap = {
    root: 'whole expression',
    sum: 'sum/difference expression',
    left: 'left term',
    right: 'right term',
    prod: 'product expression',
    quo: 'quotient expression',
    num: 'numerator',
    den: 'denominator',
    constmul: 'constant-multiple expression',
    pow: 'power expression',
    base: 'power base',
    fn: 'function application',
    arg: 'function argument',
    x: 'variable x',
    const: 'constant term',
    merge: 'recombining pieces',
    simplify: 'simplification pass',
    identify: 'rule plan',
    numeric: 'numeric validation',
    mistake: 'pitfall check',
  }

  const pathPart = String(id || '').replace(/-\d+$/, '')
  const parts = pathPart.split('-').filter(Boolean)
  const normalized = parts
    .map((p) => labelMap[p] || p)
    .filter(Boolean)

  if (!normalized.length) return 'whole expression'
  return normalized.join(' -> ')
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

function preprocessFriendlyInput(raw) {
  let text = normalizeInput(raw)
    .replace(/\*\*/g, '^')
    .replace(/\s+/g, ' ')
    .trim()

  text = text
    .replace(/\b(sin|cos|tan|exp|log|sqrt|abs)\s+([a-zA-Z0-9_\.]+)/g, '$1($2)')
    .replace(/(\d)([a-zA-Z(])/g, '$1*$2')
    .replace(/([a-zA-Z)])(\d)/g, '$1*$2')
    .replace(/(\))(\()/g, '$1*$2')
    .replace(/(\))([a-zA-Z])/g, '$1*$2')

  return text
}

function friendlyParse(raw) {
  const text = preprocessFriendlyInput(raw)
  try {
    return parse(text)
  } catch {
    throw new Error(
      `Cannot parse "${raw}". Common fixes: use * for multiplication (2*x), use ^ for powers (x^2), and write trig as sin(x).`
    )
  }
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

function makeDifferentiator(varName = 'x') {
  let seq = 0
  const nextId = (prefix) => `${prefix}-${++seq}`

  function safeTex(node) {
    return toLatex(node)
  }

  function isIndependentOfVar(node) {
    return !nodeHasX(node)
  }

  function trace(node, path = 'root') {
    const steps = []

    // Parentheses are grouping only; unwrap to keep rule-splitting consistent.
    if (node?.isParenthesisNode && node.content) {
      return trace(node.content, `${path}-paren`)
    }

    if (node.isConstantNode || (node.isSymbolNode && node.name !== varName)) {
      steps.push({
        id: nextId(`${path}-const`),
        tag: 'Constant Rule',
        title: 'Derivative of a constant is zero',
        math: `\\frac{d}{d${varName}} ${safeTex(node)} = 0`,
        activeExpr: safeTex(node),
        note: 'No change occurs when x varies.',
        currentDerivativePreview: '0',
        ruleCodes: ['constant'],
        why: RULE_LIBRARY.constant.why,
      })
      return { derivativeNode: parse('0'), steps }
    }

    if (node.isSymbolNode && node.name === varName) {
      steps.push({
        id: nextId(`${path}-x`),
        tag: 'Power Rule (n=1)',
        title: 'Derivative of x is 1',
        math: `\\frac{d}{d${varName}} ${varName} = 1`,
        activeExpr: varName,
        note: 'x^1 differentiates to 1*x^0 = 1.',
        currentDerivativePreview: '1',
        ruleCodes: ['power'],
        why: RULE_LIBRARY.power.why,
      })
      return { derivativeNode: parse('1'), steps }
    }

    if (node.isOperatorNode && (node.op === '+' || node.op === '-') && node.args.length === 2) {
      const [left, right] = node.args
      const leftRes = trace(left, `${path}-sum-left`)
      const rightRes = trace(right, `${path}-sum-right`)
      const derivativeNode = parse(`(${wrapIfNeeded(leftRes.derivativeNode)}) ${node.op} (${wrapIfNeeded(rightRes.derivativeNode)})`)

      steps.push({
        id: nextId(`${path}-sum-rule`),
        tag: 'Sum/Difference Rule',
        title: `Apply ${node.op === '+' ? 'sum' : 'difference'} rule`,
        math: `\\frac{d}{d${varName}}(${safeTex(left)} ${node.op} ${safeTex(right)}) = \\frac{d}{d${varName}}(${safeTex(left)}) ${node.op} \\frac{d}{d${varName}}(${safeTex(right)})`,
        activeExpr: safeTex(node),
        note: 'Linearity lets us differentiate each term separately.',
        ruleCodes: ['sum'],
        why: RULE_LIBRARY.sum.why,
      })
      steps.push(...leftRes.steps)
      steps.push(...rightRes.steps)
      steps.push({
        id: nextId(`${path}-sum-merge`),
        tag: 'Combine terms',
        title: 'Unsimplified sum result',
        math: `\\frac{d}{d${varName}}(${safeTex(node)}) = ${safeTex(derivativeNode)}`,
        activeExpr: safeTex(node),
        note: 'Keep this form before algebraic simplification.',
        currentDerivativePreview: safeTex(derivativeNode),
        ruleCodes: [],
      })

      return { derivativeNode, steps }
    }

    if (node.isOperatorNode && node.op === '*' && node.args.length === 2) {
      const [left, right] = node.args
      const leftDependsOnX = nodeHasX(left)
      const rightDependsOnX = nodeHasX(right)

      if (isIndependentOfVar(left) && rightDependsOnX) {
        const rightRes = trace(right, `${path}-constmul-right`)
        const derivativeNode = parse(`(${wrapIfNeeded(left)}) * (${wrapIfNeeded(rightRes.derivativeNode)})`)

        steps.push({
          id: nextId(`${path}-constmul-rule`),
          tag: 'Constant Multiple Rule',
          title: 'Pull constant factor through derivative',
          math: `\\frac{d}{d${varName}}(${safeTex(left)}\\cdot ${safeTex(right)}) = ${safeTex(left)}\\cdot\\frac{d}{d${varName}}(${safeTex(right)})`,
          activeExpr: safeTex(node),
          note: 'Constant factor is unchanged.',
          ruleCodes: ['constant'],
          why: {
            tag: 'Why constant multiple?',
            explanation: 'Scaling a function by a constant scales its slope by that same constant.',
            why: RULE_LIBRARY.sum.why,
          },
        })
        steps.push(...rightRes.steps)
        steps.push({
          id: nextId(`${path}-constmul-merge`),
          tag: 'Combine terms',
          title: 'Unsimplified result',
          math: `\\frac{d}{d${varName}}(${safeTex(node)}) = ${safeTex(derivativeNode)}`,
          activeExpr: safeTex(node),
          note: 'Constant stays in front.',
          currentDerivativePreview: safeTex(derivativeNode),
          ruleCodes: [],
        })
        return { derivativeNode, steps }
      }

      if (leftDependsOnX && isIndependentOfVar(right)) {
        const leftRes = trace(left, `${path}-constmul-left`)
        const derivativeNode = parse(`(${wrapIfNeeded(leftRes.derivativeNode)}) * (${wrapIfNeeded(right)})`)

        steps.push({
          id: nextId(`${path}-constmul-rule`),
          tag: 'Constant Multiple Rule',
          title: 'Pull constant factor through derivative',
          math: `\\frac{d}{d${varName}}(${safeTex(left)}\\cdot ${safeTex(right)}) = \\frac{d}{d${varName}}(${safeTex(left)})\\cdot ${safeTex(right)}`,
          activeExpr: safeTex(node),
          note: 'Constant factor is unchanged.',
          ruleCodes: ['constant'],
          why: {
            tag: 'Why constant multiple?',
            explanation: 'Scaling a function by a constant scales its slope by that same constant.',
            why: RULE_LIBRARY.sum.why,
          },
        })
        steps.push(...leftRes.steps)
        steps.push({
          id: nextId(`${path}-constmul-merge`),
          tag: 'Combine terms',
          title: 'Unsimplified result',
          math: `\\frac{d}{d${varName}}(${safeTex(node)}) = ${safeTex(derivativeNode)}`,
          activeExpr: safeTex(node),
          note: 'Constant stays in front.',
          currentDerivativePreview: safeTex(derivativeNode),
          ruleCodes: [],
        })
        return { derivativeNode, steps }
      }

      const leftTrace = trace(left, `${path}-prod-left`)
      const rightTrace = trace(right, `${path}-prod-right`)
      const term1 = parse(`(${wrapIfNeeded(leftTrace.derivativeNode)}) * (${wrapIfNeeded(right)})`)
      const term2 = parse(`(${wrapIfNeeded(left)}) * (${wrapIfNeeded(rightTrace.derivativeNode)})`)
      const derivativeNode = parse(`(${wrapIfNeeded(term1)}) + (${wrapIfNeeded(term2)})`)

      steps.push({
        id: nextId(`${path}-prod-rule`),
        tag: 'Product Rule',
        title: 'Apply product rule',
        math: `\\frac{d}{d${varName}}(${safeTex(left)}\\cdot ${safeTex(right)}) = \\frac{d}{d${varName}}(${safeTex(left)})\\cdot ${safeTex(right)} + ${safeTex(left)}\\cdot\\frac{d}{d${varName}}(${safeTex(right)})`,
        activeExpr: safeTex(node),
        note: 'One term per changing factor.',
        ruleCodes: ['product'],
        why: RULE_LIBRARY.product.why,
      })
      steps.push(...leftTrace.steps)
      steps.push(...rightTrace.steps)
      steps.push({
        id: nextId(`${path}-prod-merge`),
        tag: 'Combine product terms',
        title: 'Unsimplified product result',
        math: `\\frac{d}{d${varName}}(${safeTex(node)}) = ${safeTex(derivativeNode)}`,
        activeExpr: safeTex(node),
        note: 'Unsimplified form preserves full rule trace.',
        currentDerivativePreview: safeTex(derivativeNode),
        ruleCodes: [],
      })

      return { derivativeNode, steps }
    }

    if (node.isOperatorNode && node.op === '/' && node.args.length === 2) {
      const numerator = node.args[0]
      const denominator = node.args[1]
      const numTrace = trace(numerator, `${path}-quo-num`)
      const denTrace = trace(denominator, `${path}-quo-den`)
      const termNum = parse(`((${wrapIfNeeded(numTrace.derivativeNode)}) * (${wrapIfNeeded(denominator)})) - ((${wrapIfNeeded(numerator)}) * (${wrapIfNeeded(denTrace.derivativeNode)}))`)
      const derivativeNode = parse(`(${wrapIfNeeded(termNum)}) / ((${wrapIfNeeded(denominator)})^2)`)

      steps.push({
        id: nextId(`${path}-quo-rule`),
        tag: 'Quotient Rule',
        title: 'Apply quotient rule',
        math: `\\frac{d}{d${varName}}\\left(\\frac{${safeTex(numerator)}}{${safeTex(denominator)}}\\right)=\\frac{\\frac{d}{d${varName}}(${safeTex(numerator)})\\cdot ${safeTex(denominator)}-${safeTex(numerator)}\\cdot\\frac{d}{d${varName}}(${safeTex(denominator)})}{(${safeTex(denominator)})^2}`,
        activeExpr: safeTex(node),
        note: 'Low times derivative of high minus high times derivative of low, over low squared.',
        ruleCodes: ['quotient', 'product', 'sum', 'power'],
        why: RULE_LIBRARY.quotient.why,
      })
      steps.push(...numTrace.steps)
      steps.push(...denTrace.steps)
      steps.push({
        id: nextId(`${path}-quo-merge`),
        tag: 'Combine terms',
        title: 'Write combined unsimplified derivative',
        math: `\\frac{d}{d${varName}}(${safeTex(node)}) = ${safeTex(derivativeNode)}`,
        activeExpr: safeTex(node),
        note: 'Maintain full numerator grouping before simplification.',
        currentDerivativePreview: safeTex(derivativeNode),
        ruleCodes: [],
      })

      return { derivativeNode, steps }
    }

    if (node.isOperatorNode && node.op === '^' && node.args.length === 2) {
      const base = node.args[0]
      const exp = node.args[1]

      // Extended power rule for constant exponent: d/dx(u^n) = n*u^(n-1)*u'
      if (isIndependentOfVar(exp)) {
        const baseIsSimpleX = base?.isSymbolNode && base.name === varName
        const baseTrace = trace(base, `${path}-pow-base`)
        const expMinusOne = parse(`(${wrapIfNeeded(exp)}) - 1`)
        const outer = parse(`(${wrapIfNeeded(exp)}) * (${wrapIfNeeded(base)})^(${wrapIfNeeded(expMinusOne)})`)
        const derivativeNode = parse(`(${wrapIfNeeded(outer)}) * (${wrapIfNeeded(baseTrace.derivativeNode)})`)

        steps.push({
          id: nextId(`${path}-pow-rule`),
          tag: baseIsSimpleX ? 'Power Rule' : 'Chain Rule (Extended Power Rule)',
          title: baseIsSimpleX ? 'Apply power rule to x^n' : 'Apply chain rule to a powered expression',
          math: `\\frac{d}{d${varName}}\\left[(${safeTex(base)})^{${safeTex(exp)}}\\right]=${safeTex(exp)}\\left(${safeTex(base)}\\right)^{${safeTex(expMinusOne)}}\\cdot\\frac{d}{d${varName}}\\left(${safeTex(base)}\\right)`,
          activeExpr: safeTex(node),
          note: baseIsSimpleX
            ? 'Base is x, so this is direct power rule.'
            : `Treat the base as u = ${safeTex(base)} and differentiate outside first, then inside.`,
          ruleCodes: baseIsSimpleX ? ['power'] : ['power', 'chain'],
          why: {
            tag: 'Extended power + chain',
            explanation: 'When the base is an expression in x, power rule must be multiplied by the inner derivative.',
            why: RULE_LIBRARY.power.why,
          },
        })
        steps.push(...baseTrace.steps)
        steps.push({
          id: nextId(`${path}-pow-merge`),
          tag: 'Combine terms',
          title: 'Write combined unsimplified derivative',
          math: `\\frac{d}{d${varName}}(${safeTex(node)}) = ${safeTex(derivativeNode)}`,
          activeExpr: safeTex(node),
          note: 'Keep the inner derivative factor explicit before simplification.',
          currentDerivativePreview: safeTex(derivativeNode),
          ruleCodes: [],
        })

        return { derivativeNode, steps }
      }
    }

    if (node.isFunctionNode && node.args.length === 1) {
      const name = node.fn?.name?.toLowerCase()
      const arg = node.args[0]
      const argTrace = trace(arg, `${path}-fn-arg`)

      let outer = null
      if (name === 'sin') outer = parse(`cos(${wrapIfNeeded(arg)})`)
      else if (name === 'cos') outer = parse(`-sin(${wrapIfNeeded(arg)})`)
      else if (name === 'tan') outer = parse(`1 / (cos(${wrapIfNeeded(arg)})^2)`)
      else if (name === 'exp') outer = parse(`exp(${wrapIfNeeded(arg)})`)
      else if (name === 'log' || name === 'ln') outer = parse(`1 / (${wrapIfNeeded(arg)})`)

      if (outer) {
        const derivativeNode = parse(`(${wrapIfNeeded(outer)}) * (${wrapIfNeeded(argTrace.derivativeNode)})`)
        const baseRule =
          name === 'exp' ? 'exp' :
          (name === 'log' || name === 'ln') ? 'log' :
          'trig'

        steps.push({
          id: nextId(`${path}-fn-rule`),
          tag: `${name.toUpperCase()} Rule + Chain`,
          title: `Differentiate ${name}(u)`,
          math: `\\frac{d}{d${varName}}${name}\\left(${safeTex(arg)}\\right)=${safeTex(outer)}\\cdot\\frac{d}{d${varName}}\\left(${safeTex(arg)}\\right)`,
          activeExpr: safeTex(node),
          note: `u = ${safeTex(arg)}.`,
          ruleCodes: [baseRule, 'chain'],
          why: name === 'log' || name === 'ln'
            ? {
                tag: 'Why log + chain?',
                explanation: 'The derivative of ln(u) is 1/u, then multiply by du/dx.',
                why: RULE_LIBRARY.log.why,
              }
            : name === 'exp'
              ? {
                  tag: 'Why exp + chain?',
                  explanation: 'exp(u) differentiates to exp(u), then chain rule multiplies by du/dx.',
                  why: RULE_LIBRARY.exp.why,
                }
            : buildWhyFromRules(['trig', 'chain']),
        })
        steps.push(...argTrace.steps)
        steps.push({
          id: nextId(`${path}-fn-merge`),
          tag: 'Combine terms',
          title: 'Write combined unsimplified derivative',
          math: `\\frac{d}{d${varName}}(${safeTex(node)}) = ${safeTex(derivativeNode)}`,
          activeExpr: safeTex(node),
          note: 'Outer derivative times inner derivative.',
          currentDerivativePreview: safeTex(derivativeNode),
          ruleCodes: [],
        })
        return { derivativeNode, steps }
      }
    }

    const derivativeNode = derivative(node, varName)
    steps.push({
      id: nextId(`${path}-fallback`),
      tag: 'Fallback full derivative',
      title: 'Computed directly (complex structure)',
      math: `\\frac{d}{d${varName}}(${safeTex(node)}) = ${safeTex(derivativeNode)}`,
      activeExpr: safeTex(node),
      note: 'This form uses rules not yet split into atomic teaching steps.',
      currentDerivativePreview: safeTex(derivativeNode),
      ruleCodes: detectRules(node),
      why: buildWhyFromRules(detectRules(node)),
    })
    return { derivativeNode, steps }
  }

  return { trace }
}

function buildExplanation(input) {
  const normalized = preprocessFriendlyInput(input)
  const derivativeOnlyError = validateDerivativeOnlyInput(normalized)
  if (derivativeOnlyError) throw new Error(derivativeOnlyError)

  const exprNode = friendlyParse(normalized)
  const steps = []

  steps.push({
    id: 'identify',
    tag: 'Identify structure',
    title: 'Detect expression patterns and derivative plan',
    math: `f(x) = ${toLatex(exprNode)}`,
    activeExpr: toLatex(exprNode),
    currentDerivativePreview: '0',
    note: `Detected rules: ${detectRules(exprNode).map((r) => RULE_LIBRARY[r]?.label ?? r).join(', ') || 'Direct derivative rules'}.`,
    ruleCodes: detectRules(exprNode),
    why: {
      tag: 'How was the plan chosen?',
      explanation: 'The parser reads the expression tree and maps visible patterns (product, nesting, powers, trig, sums) to derivative theorems.',
    },
  })

  const differentiator = makeDifferentiator('x')
  const { derivativeNode: rawNode, steps: diffSteps } = differentiator.trace(exprNode, 'root')
  steps.push(...diffSteps)

  const topRules = detectRules(exprNode)
  if (topRules.includes('product') && topRules.includes('chain')) {
    steps.push({
      id: 'common-mistake',
      tag: 'Common Pitfall',
      title: 'Do not forget chain rule inside product terms',
      math: `\\text{Incorrect: }\\cos(x^3)\\cdot x^2 + \\sin(x^3)\\cdot 2x \\quad \\text{(missing }3x^2\\text{)}`,
      note: 'When a product factor is itself composite, differentiate it with chain rule before combining product terms.',
      ruleCodes: ['product', 'chain'],
      why: {
        tag: 'Why this mistake happens',
        explanation: 'Students apply product rule scaffold correctly but treat sin(x^3) as if it were sin(x). The inner x^3 derivative is required.',
      },
    })
  }

  const simplifiedNode = canonicalizeDerivative(rawNode)
  const simplifiedLatex = cleanupLatexExpression(toLatex(simplifiedNode))
  steps.push({
    id: 'simplify',
    tag: 'Simplify',
    title: 'Reorder terms for pedagogy-safe readability',
    math: `f'(x) = ${simplifiedLatex}`,
    currentDerivativePreview: simplifiedLatex,
    note: 'AST reorder rule: coefficients and x-polynomials are pulled before trig terms to reduce angle confusion.',
    ruleCodes: [],
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
    const absErr = Math.abs(check.slope - check.exact)
    const relErr = Math.abs(check.exact) > 1e-8 ? absErr / Math.abs(check.exact) : null
    steps.push({
      id: 'numeric-check',
      tag: 'Numeric check',
      title: 'Cross-check symbolic derivative with finite difference',
      math: `x_0=${check.x0},\\quad f'(x_0)\\approx ${check.slope.toFixed(6)},\\quad \\text{symbolic }f'(x_0)=${check.exact.toFixed(6)}`,
      note: `Absolute error: ${absErr.toExponential(2)}${relErr !== null ? ` (relative ≈ ${relErr.toFixed(4)})` : ' (relative error unstable near zero exact value)'}.`,
      ruleCodes: [],
      why: {
        tag: 'Why numeric validation?',
        explanation: 'It provides an independent sanity check that the symbolic workflow is coherent.',
      },
    })
  }

  let rollingPreview = ''
  let globalEquation = `\\frac{d}{dx}\\left(${toLatex(exprNode)}\\right)`
  const stepsWithContext = steps.map((s) => {
    const prevPreview = rollingPreview || '0'
    const inlinePreview = extractDerivativePreviewFromMath(s.math)
    const nextPreview = s.currentDerivativePreview || inlinePreview || rollingPreview || '0'
    rollingPreview = nextPreview

    const beforeGlobal = globalEquation
    const eq = extractPrimaryEquality(s.math)
    const beforeEq = String(eq.before || '').trim()
    const afterEq = String(eq.after || '').trim()

    if (afterEq) {
      let replaced = false
      const noDerivativeBlocksLeft = !beforeGlobal.includes('\\frac{d}{dx}')

      if (s.id === 'simplify' || noDerivativeBlocksLeft) {
        globalEquation = afterEq
        replaced = true
      }

      const targets = derivativeTargets(s.activeExpr || '', 'x')

      if (!replaced) {
        for (const target of targets) {
          const attempt = replaceFirstLoose(globalEquation, target, `(${afterEq})`)
          if (attempt.changed) {
            globalEquation = attempt.text
            replaced = true
            break
          }
        }
      }

      if (!replaced && beforeEq && beforeEq !== "f'(x)") {
        const attempt = replaceFirstLoose(globalEquation, beforeEq, afterEq)
        if (attempt.changed) {
          globalEquation = attempt.text
          replaced = true
        }
      }

      if (!replaced) {
        globalEquation = beforeGlobal
      }
    }

    const afterGlobal = globalEquation

    return {
      ...s,
      focusPath: describeFocusFromStepId(s.id),
      activeSubExpr: s.activeExpr || '',
      prevDerivativePreview: prevPreview,
      currentDerivativePreview: nextPreview,
      globalBefore: tidyDisplayLatex(beforeGlobal),
      globalAfter: tidyDisplayLatex(afterGlobal),
    }
  })

  return {
    inputLatex: toLatex(exprNode),
    inputExpr: exprNode.toString(),
    rawLatex: toLatex(rawNode),
    rawExpr: rawNode.toString(),
    steps: stepsWithContext,
    finalLatex: simplifiedLatex,
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
  }

  return (
    <section className="max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6">
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

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Solution</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 mb-6">
              Problem, then alternating lines: apply a rule, then show the resulting expression.
            </p>

            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Problem</p>
                <div className="overflow-x-auto">
                  <KatexBlock expr={`f'(x)=\\frac{d}{dx}\\left(${explanation.inputLatex}\\right)`} className="text-slate-900 dark:text-slate-100" />
                </div>
              </div>

              {(() => {
                const filtered = explanation.steps.filter((step) => {
                  const tag = String(step.tag || '').toLowerCase()
                  if (tag.includes('identify')) return false
                  if (tag.includes('numeric')) return false
                  if (tag.includes('common pitfall')) return false
                  if (tag.includes('simplify')) return false
                  return true
                })

                let rollingExpr = `\\frac{d}{dx}\\left(${explanation.inputLatex}\\right)`

                return filtered.map((step, i) => {
                  const primaryRule = step.ruleCodes?.[0]
                  const ruleLabel = primaryRule && RULE_LIBRARY[primaryRule]
                    ? RULE_LIBRARY[primaryRule].label
                    : step.tag

                  const beforeExpr = step.globalBefore || rollingExpr
                  const outcomeExpr = step.globalAfter || rollingExpr
                  rollingExpr = outcomeExpr

                  return (
                    <div key={step.id} className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 last:border-0 last:pb-0">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Applied</p>
                          <p className="text-base text-slate-700 dark:text-slate-300 mb-2">Apply {ruleLabel.toLowerCase()}.</p>
                          <div className="overflow-x-auto">
                            <KatexBlock expr={`f'(x)=${beforeExpr}`} className="text-slate-900 dark:text-slate-100" />
                          </div>
                          <div className="overflow-x-auto mt-2">
                            <KatexBlock expr={step.math} className="text-slate-900 dark:text-slate-100" />
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Outcome</p>
                          <div className="overflow-x-auto">
                            <KatexBlock expr={`f'(x)=${outcomeExpr}`} className="text-slate-900 dark:text-slate-100" />
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400">{step.note}</p>
                        {step.why && <WhyPanel why={step.why} depth={0} />}
                      </div>

                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Step {i + 1}</div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Final simplified derivative</h2>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Simplified / factored</p>
              <KatexBlock expr={`f'(x) = ${explanation.finalLatex}`} className="text-slate-900 dark:text-slate-100" />
            </div>
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
