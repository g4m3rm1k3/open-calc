import { useEffect, useMemo, useState } from 'react'
import { parse, derivative, evaluate, simplify } from 'mathjs'
import KatexBlock from '../math/KatexBlock.jsx'
import { parseProse } from '../math/parseProse.jsx'
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

const LOCAL_SNAPSHOT_STORE_KEY = 'universal-calc-snapshots-v1'

function loadLocalSnapshotStore() {
  try {
    const raw = localStorage.getItem(LOCAL_SNAPSHOT_STORE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveLocalSnapshotStore(store) {
  localStorage.setItem(LOCAL_SNAPSHOT_STORE_KEY, JSON.stringify(store))
}

function getSnapshotDisplayName(functionKey, snapshot) {
  const equation = String(snapshot?.equation || '').trim()
  if (!equation) return functionKey
  const idx = equation.indexOf('=')
  const rhs = idx === -1 ? equation : equation.slice(idx + 1).trim()
  return rhs || functionKey
}

function isDegenerateSnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.steps) || !snapshot.steps.length) return false

  const normalizeSavedLine = (line) => {
    const text = String(line || '').trim().replace(/^f'\(x\)\s*=\s*/i, '')
    return compactLatex(text)
  }

  const appliedNorm = snapshot.steps.map((s) => normalizeSavedLine(s?.applied))
  const outcomeNorm = snapshot.steps.map((s) => normalizeSavedLine(s?.outcome))

  const appliedSet = new Set(appliedNorm)
  const outcomeSet = new Set(outcomeNorm)
  const unchangedPairs = snapshot.steps.reduce((count, s) => {
    const a = normalizeSavedLine(s?.applied)
    const o = normalizeSavedLine(s?.outcome)
    return count + (a === o ? 1 : 0)
  }, 0)

  // Treat snapshots as degenerate if they carry almost no progression signal.
  if (appliedSet.size <= 1 && outcomeSet.size <= 1) return true
  if (snapshot.steps.length >= 2 && unchangedPairs === snapshot.steps.length) return true
  return false
}

function hasAnyCommentary(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.steps)) return false
  return snapshot.steps.some((s) => String(s?.commentary || '').trim().length > 0)
}

function stripDerivativePrefix(text) {
  return String(text || '').replace(/^f'\(x\)\s*=\s*/i, '').trim()
}

function isRenderableLatexCandidate(expr) {
  const s = String(expr || '')
  if (!s.trim()) return false

  // Imported JSON can accidentally decode some LaTeX commands as control chars.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s)) return false

  let depth = 0
  for (const ch of s) {
    if (ch === '{') depth += 1
    if (ch === '}') {
      depth -= 1
      if (depth < 0) return false
    }
  }
  if (depth !== 0) return false

  const leftCount = (s.match(/\\left/g) || []).length
  const rightCount = (s.match(/\\right/g) || []).length
  if (leftCount !== rightCount) return false

  return true
}

function pickRenderableLatex(primary, fallback = '') {
  const p = String(primary || '').trim()
  const f = String(fallback || '').trim()
  if (isRenderableLatexCandidate(p)) return p
  if (isRenderableLatexCandidate(f)) return f
  return p || f
}

function inferOperationFamily(ruleUsed) {
  const rule = String(ruleUsed || '').toLowerCase()
  if (rule.includes('product')) return 'product'
  if (rule.includes('quotient')) return 'quotient'
  if (rule.includes('chain')) return 'chain'
  if (rule.includes('power')) return 'power'
  if (rule.includes('sum') || rule.includes('difference')) return 'sum'
  if (rule.includes('constant multiple')) return 'constant-multiple'
  if (rule.includes('constant')) return 'constant'
  if (rule.includes('combine')) return 'combine'
  if (rule.includes('trig') || rule.includes('sin') || rule.includes('cos') || rule.includes('tan')) return 'trig'
  if (rule.includes('log') || rule.includes('ln')) return 'log'
  if (rule.includes('exp')) return 'exp'
  return 'generic'
}

function buildDefaultCommentary(step) {
  if (!step) return ''

  const operation = inferOperationFamily(step.ruleUsed)
  const appliedCore = stripDerivativePrefix(
    pickRenderableLatex(step.applied, step.fallbackApplied)
  )
  const outcomeCore = stripDerivativePrefix(
    pickRenderableLatex(step.outcome, step.fallbackOutcome)
  )
  const appliedMath = appliedCore ? `\\(${appliedCore}\\)` : 'the current derivative form'
  const outcomeMath = outcomeCore ? `\\(${outcomeCore}\\)` : 'the transformed derivative form'

  const templates = {
    product: `Product rule splits the derivative into two contributions: first-diff times second, plus first times second-diff. Here we transform ${appliedMath} into ${outcomeMath}.`,
    quotient: `Quotient rule tracks competing rates in numerator and denominator using $(low\\cdot d(high)-high\\cdot d(low))/low^2$. This step rewrites ${appliedMath} into ${outcomeMath}.`,
    chain: `Chain rule handles composition: differentiate the outer form first, then multiply by the inner derivative. This maps ${appliedMath} to ${outcomeMath}.`,
    power: `Power behavior comes from reducing the exponent by one and scaling by the original exponent (with chain behavior if the base is composite). Here ${appliedMath} becomes ${outcomeMath}.`,
    sum: `Linearity lets us differentiate each term independently and preserve the plus/minus structure. This step carries ${appliedMath} into ${outcomeMath}.`,
    'constant-multiple': `A constant factor only scales slope, so it stays outside while the variable-dependent part is differentiated. This turns ${appliedMath} into ${outcomeMath}.`,
    constant: `Constants do not vary with $x$, so their derivative contribution is zero. This simplifies ${appliedMath} into ${outcomeMath}.`,
    combine: `This is a recombination step: earlier local derivatives are assembled into a single global expression. We move from ${appliedMath} to ${outcomeMath}.`,
    trig: `Trig derivatives follow base identities (like $\\sin\\to\\cos$ and $\\cos\\to-\\sin$), then chain behavior if the angle is composite. This updates ${appliedMath} into ${outcomeMath}.`,
    log: `Log derivative structure is $1/u$ times $u'$, so inner-rate information is preserved explicitly. This takes ${appliedMath} to ${outcomeMath}.`,
    exp: `Exponential derivatives preserve the exponential form and multiply by the inner derivative when composed. Here ${appliedMath} becomes ${outcomeMath}.`,
    generic: `This step applies ${step.ruleUsed || 'the current rule'} to move from ${appliedMath} to ${outcomeMath}, while preserving derivative equivalence.`,
  }

  return templates[operation] || templates.generic
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

function algebraicSimplify(node) {
  try {
    return simplify(node)
  } catch {
    return node
  }
}

function factorSharedProductTerms(node) {
  try {
    const terms = flattenByOperator(node, '+')
    if (terms.length < 2) return node

    const factorLists = terms.map((term) => flattenByOperator(term, '*'))

    const asPositiveInt = (n) => {
      if (!Number.isFinite(n)) return null
      if (!Number.isInteger(n)) return null
      if (n <= 0) return null
      return n
    }

    const getPowParts = (factor) => {
      if (factor?.isOperatorNode && factor.op === '^' && factor.args?.length === 2) {
        const base = factor.args[0]
        const expNode = factor.args[1]
        const expNum = asPositiveInt(Number(expNode?.value))
        if (base && expNum !== null) {
          return { baseKey: base.toString(), exp: expNum }
        }
      }
      if (factor?.isConstantNode) return null
      return { baseKey: factor.toString(), exp: 1 }
    }

    // Phase 1: exact shared factors (same full factor text in every term).
    const termCountMaps = factorLists.map((factors) => {
      const m = new Map()
      factors.forEach((factor) => {
        const key = factor.toString()
        m.set(key, (m.get(key) || 0) + 1)
      })
      return m
    })

    const commonCounts = new Map(termCountMaps[0])
    for (let i = 1; i < termCountMaps.length; i += 1) {
      for (const [key, count] of commonCounts.entries()) {
        const nextCount = termCountMaps[i].get(key) || 0
        if (nextCount <= 0) {
          commonCounts.delete(key)
        } else {
          commonCounts.set(key, Math.min(count, nextCount))
        }
      }
    }

    const commonFactorEntries = [...commonCounts.entries()].filter(([, count]) => count > 0)

    let reducedFactorLists = factorLists.map((factors) => [...factors])
    const commonFactorTexts = []

    if (commonFactorEntries.length) {
      commonFactorEntries.forEach(([key, count]) => {
        for (let i = 0; i < count; i += 1) commonFactorTexts.push(key)
      })

      reducedFactorLists = reducedFactorLists.map((factors) => {
        const localRemove = new Map(commonFactorEntries)
        const remaining = []

        factors.forEach((factor) => {
          const key = factor.toString()
          const left = localRemove.get(key) || 0
          if (left > 0) {
            localRemove.set(key, left - 1)
          } else {
            remaining.push(factor)
          }
        })

        return remaining
      })
    }

    // Phase 2: shared symbolic bases across different exponents.
    // Example: a^4 + a^5 shares a^4.
    const baseExponentMaps = reducedFactorLists.map((factors) => {
      const m = new Map()
      factors.forEach((factor) => {
        const parts = getPowParts(factor)
        if (!parts) return
        m.set(parts.baseKey, (m.get(parts.baseKey) || 0) + parts.exp)
      })
      return m
    })

    const sharedBaseMinExp = new Map(baseExponentMaps[0] || [])
    for (let i = 1; i < baseExponentMaps.length; i += 1) {
      for (const [baseKey, exp] of sharedBaseMinExp.entries()) {
        const next = baseExponentMaps[i].get(baseKey) || 0
        if (next <= 0) {
          sharedBaseMinExp.delete(baseKey)
        } else {
          sharedBaseMinExp.set(baseKey, Math.min(exp, next))
        }
      }
    }

    const powerFactorEntries = [...sharedBaseMinExp.entries()].filter(([, exp]) => exp > 0)
    if (powerFactorEntries.length) {
      powerFactorEntries.forEach(([baseKey, exp]) => {
        commonFactorTexts.push(exp === 1 ? baseKey : `(${baseKey})^${exp}`)
      })

      reducedFactorLists = reducedFactorLists.map((factors) => {
        const remainingNeeds = new Map(powerFactorEntries)
        const rebuilt = []

        factors.forEach((factor) => {
          const parts = getPowParts(factor)
          if (!parts) {
            rebuilt.push(factor)
            return
          }

          const need = remainingNeeds.get(parts.baseKey) || 0
          if (need <= 0) {
            rebuilt.push(factor)
            return
          }

          const consume = Math.min(need, parts.exp)
          remainingNeeds.set(parts.baseKey, need - consume)
          const leftover = parts.exp - consume

          if (leftover > 0) {
            const leftoverText = leftover === 1 ? parts.baseKey : `(${parts.baseKey})^${leftover}`
            rebuilt.push(parse(leftoverText))
          }
        })

        return rebuilt
      })
    }

    if (!commonFactorTexts.length) return node

    const reducedTerms = reducedFactorLists.map((factors) => {
      if (!factors.length) return '1'
      return factors.map((f) => wrapIfNeeded(f)).join(' * ')
    })

    const commonExpr = commonFactorTexts.map((text) => {
      const parsed = parse(text)
      return wrapIfNeeded(parsed)
    }).join(' * ')

    if (!commonExpr) return node

    const insideExpr = reducedTerms.map((t) => `(${t})`).join(' + ')
    return parse(`${commonExpr} * (${insideExpr})`)
  } catch {
    return node
  }
}

function distributeAndCombine(node) {
  try {
    const source = String(node?.toString?.() || '')
    if (!source) return node

    // Guardrail against combinatorial blow-up on very large expressions.
    if (source.length > 260) return node

    const distributiveRules = [
      'n1*(n2+n3) -> n1*n2 + n1*n3',
      '(n1+n2)*n3 -> n1*n3 + n2*n3',
      'n1*(n2-n3) -> n1*n2 - n1*n3',
      '(n1-n2)*n3 -> n1*n3 - n2*n3',
    ]

    const distributed = simplify(node, distributiveRules)
    return simplify(distributed)
  } catch {
    return node
  }
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
    .replace(/\\left|\\right/g, '')
    // Normalize d/dx(...) and d/dx ... variants to the same form.
    .replace(/\\frac\{d\}\{d([a-zA-Z])\}\(([a-zA-Z])\)/g, '\\frac{d}{d$1}$2')
    .replace(/\\frac\{d\}\{d([a-zA-Z])\}\s+/g, '\\frac{d}{d$1}')
    // Ignore parentheses that only wrap a single variable.
    .replace(/\(([a-zA-Z])\)/g, '$1')
    .replace(/\s+/g, '')
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
  s = s.replace(/(^|[^\d])1\s*\\cdot\s*/g, '$1')

  // Remove additive zero terms.
  s = s.replace(/\+\s*0(?!\d)/g, '')
  s = s.replace(/(^|[^\d])0\s*\+\s*/g, '$1')

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

function getRootBranchKeyFromStepId(id) {
  const key = String(id || '').replace(/-\d+$/, '')
  if (!key) return 'root'

  const branchMatchers = [
    { re: /-(?:prod|sum|constmul)-left(?:-|$)/, key: 'left' },
    { re: /-(?:prod|sum|constmul)-right(?:-|$)/, key: 'right' },
    { re: /-quo-num(?:-|$)/, key: 'num' },
    { re: /-quo-den(?:-|$)/, key: 'den' },
    { re: /-fn-arg(?:-|$)/, key: 'arg' },
    { re: /-pow-base(?:-|$)/, key: 'base' },
  ]

  for (const m of branchMatchers) {
    if (m.re.test(key)) return m.key
  }

  return 'root'
}

function getRootBranchLabel(branchKey) {
  const labels = {
    root: 'whole expression',
    left: 'left branch',
    right: 'right branch',
    num: 'numerator branch',
    den: 'denominator branch',
    arg: 'argument branch',
    base: 'base branch',
  }
  return labels[branchKey] || String(branchKey || 'branch')
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

  const knownFns = '(sin|cos|tan|exp|log|ln|sqrt|abs)'

  text = text
    .replace(new RegExp(`\\b${knownFns}\\s+([a-zA-Z0-9_\\.]+)`, 'g'), '$1($2)')
    .replace(/(\d)([a-zA-Z(])/g, '$1*$2')
    .replace(/([a-zA-Z)])(\d)/g, '$1*$2')
    .replace(/([a-zA-Z0-9_)])(\()/g, '$1*$2')
    .replace(/(\))(\()/g, '$1*$2')
    .replace(/(\))([a-zA-Z])/g, '$1*$2')
    // Revert accidental insertion for known function calls (sin*(x) -> sin(x)).
    .replace(new RegExp(`\\b${knownFns}\\*\\(`, 'g'), '$1(')

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
    try {

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
    } catch (err) {
      const derivativeNode = derivative(node, varName)
      steps.push({
        id: nextId(`${path}-recovery-fallback`),
        tag: 'Recovery fallback',
        title: 'Recovered from deep-nesting step split error',
        math: `\\frac{d}{d${varName}}(${safeTex(node)}) = ${safeTex(derivativeNode)}`,
        activeExpr: safeTex(node),
        note: `Step-level recursion failed on this subtree, so a direct derivative was used to preserve continuity.${err?.message ? ` (${String(err.message)})` : ''}`,
        currentDerivativePreview: safeTex(derivativeNode),
        ruleCodes: detectRules(node),
        why: buildWhyFromRules(detectRules(node)),
      })
      return { derivativeNode, steps }
    }
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

  const reorderedNode = canonicalizeDerivative(rawNode)
  const reorderedLatex = cleanupLatexExpression(toLatex(reorderedNode))
  steps.push({
    id: 'simplify-reorder',
    tag: 'Simplify',
    title: 'Reorder terms for pedagogy-safe readability',
    math: `f'(x) = ${reorderedLatex}`,
    currentDerivativePreview: reorderedLatex,
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

  const simplifiedNode = algebraicSimplify(reorderedNode)
  const simplifiedLatex = cleanupLatexExpression(toLatex(simplifiedNode))

  if (compactLatex(simplifiedLatex) !== compactLatex(reorderedLatex)) {
    steps.push({
      id: 'simplify-final',
      tag: 'Simplify',
      title: 'Evaluate constants and collapse equivalent factors',
      math: `f'(x) = ${simplifiedLatex}`,
      currentDerivativePreview: simplifiedLatex,
      note: 'Now apply algebraic simplification so equivalent constants and factors are collapsed.',
      ruleCodes: [],
      why: {
        tag: 'Why this final pass?',
        explanation: 'Rule tracing is easier in expanded form, but final answers should collapse constant arithmetic and obvious factor identities.',
      },
    })
  }

  const factoredNode = factorSharedProductTerms(simplifiedNode)
  const factoredLatex = cleanupLatexExpression(toLatex(factoredNode))

  if (compactLatex(factoredLatex) !== compactLatex(simplifiedLatex)) {
    steps.push({
      id: 'factor-final',
      tag: 'Simplify',
      title: 'Factor common structure',
      math: `f'(x) = ${factoredLatex}`,
      currentDerivativePreview: factoredLatex,
      note: 'Extract shared factors so the derivative matches textbook-style compact factoring.',
      ruleCodes: [],
      why: {
        tag: 'Why factor at the end?',
        explanation: 'Factoring is easiest after constants and powers are cleaned up; this makes shared subexpressions explicit and shorter.',
      },
    })
  }

  const finalNode = compactLatex(factoredLatex) !== compactLatex(simplifiedLatex) ? factoredNode : simplifiedNode
  const finalLatex = compactLatex(factoredLatex) !== compactLatex(simplifiedLatex) ? factoredLatex : simplifiedLatex

  const expandedCombinedNode = distributeAndCombine(finalNode)
  const expandedCombinedLatex = cleanupLatexExpression(toLatex(expandedCombinedNode))

  if (compactLatex(expandedCombinedLatex) !== compactLatex(finalLatex)) {
    steps.push({
      id: 'expand-combine-final',
      tag: 'Simplify',
      title: 'Distribute and combine equivalent terms',
      math: `f'(x) = ${expandedCombinedLatex}`,
      currentDerivativePreview: expandedCombinedLatex,
      note: 'Optional canonicalization pass: expand distributed products and combine constants/like pieces.',
      ruleCodes: [],
      why: {
        tag: 'Why include this pass?',
        explanation: 'Some textbooks prefer expanded-combined form over factored form. This keeps both representations algorithmic and equivalent.',
      },
    })
  }

  const chooseExpanded = compactLatex(expandedCombinedLatex).length > 0
    && compactLatex(expandedCombinedLatex).length < compactLatex(finalLatex).length
  const chosenFinalNode = chooseExpanded ? expandedCombinedNode : finalNode
  const chosenFinalLatex = chooseExpanded ? expandedCombinedLatex : finalLatex

  const check = findNumericCheck(normalized, chosenFinalNode.toString())
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

      // Only simplify is allowed to replace the full displayed equation directly.
      // If local replacement fails on a leaf node, we preserve the existing global string.
      if (s.id === 'simplify-reorder' || s.id === 'simplify-final' || s.id === 'factor-final' || s.id === 'expand-combine-final') {
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
    finalLatex: chosenFinalLatex,
    finalExpr: chosenFinalNode.toString(),
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
  const [currentFunctionKey, setCurrentFunctionKey] = useState(() => preprocessFriendlyInput('sin(x^3) * (x^2 + 1)'))
  const [loadedSnapshotKey, setLoadedSnapshotKey] = useState('')
  const [snapshotOwnerKey, setSnapshotOwnerKey] = useState(() => preprocessFriendlyInput('sin(x^3) * (x^2 + 1)'))
  const [savedSnapshots, setSavedSnapshots] = useState(() => loadLocalSnapshotStore())
  const [tutorialSnapshot, setTutorialSnapshot] = useState({
    equation: '',
    isAuthoringMode: false,
    steps: [],
  })
  const [isImportedSnapshot, setIsImportedSnapshot] = useState(false)
  const [importText, setImportText] = useState('')
  const [toast, setToast] = useState('')
  const [showSimplificationPath, setShowSimplificationPath] = useState(true)
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

  const dynamicSnapshot = useMemo(() => {
    if (!explanation) return null

    const filtered = explanation.steps.filter((step) => {
      const tag = String(step.tag || '').toLowerCase()
      if (tag.includes('identify')) return false
      if (tag.includes('numeric')) return false
      if (tag.includes('common pitfall')) return false
      if (tag.includes('simplify')) return false
      return true
    })

    let rollingExpr = `\\frac{d}{dx}\\left(${explanation.inputLatex}\\right)`
    const rootByBranch = new Map()
    const steps = filtered.map((step) => {
      const stepId = String(step.id || '')
      const primaryRule = step.ruleCodes?.[0]
      const ruleUsed = primaryRule && RULE_LIBRARY[primaryRule]
        ? RULE_LIBRARY[primaryRule].label
        : (step.tag || 'Custom Step')

      const localEq = extractPrimaryEquality(step.math)
      const fallbackApplied = tidyDisplayLatex(localEq.before)
      const fallbackOutcome = tidyDisplayLatex(localEq.after)

      let beforeExpr = step.globalBefore || rollingExpr
      let outcomeExpr = step.globalAfter || rollingExpr

      // If global replacement failed for a step, fallback to local equation sides
      // so each line still reflects a real transformation.
      if (compactLatex(beforeExpr) === compactLatex(outcomeExpr)) {
        if (localEq.before && localEq.after && compactLatex(localEq.before) !== compactLatex(localEq.after)) {
          beforeExpr = tidyDisplayLatex(localEq.before)
          outcomeExpr = tidyDisplayLatex(localEq.after)
        }
      }

      // If the global stitched expression becomes malformed, fall back to local step equality.
      beforeExpr = pickRenderableLatex(beforeExpr, fallbackApplied)
      outcomeExpr = pickRenderableLatex(outcomeExpr, fallbackOutcome)

      rollingExpr = outcomeExpr

      const branchKey = getRootBranchKeyFromStepId(stepId)
      const activeSubExpr = tidyDisplayLatex(step.activeSubExpr || '')
      if (activeSubExpr && !rootByBranch.has(branchKey)) {
        rootByBranch.set(branchKey, activeSubExpr)
      }
      const rootSubExpr = rootByBranch.get(branchKey)
        || activeSubExpr
        || tidyDisplayLatex(explanation.inputLatex)

      return {
        ruleUsed,
        stepId,
        applied: `f'(x)=${beforeExpr}`,
        outcome: `f'(x)=${outcomeExpr}`,
        fallbackApplied: fallbackApplied ? `f'(x)=${fallbackApplied}` : '',
        fallbackOutcome: fallbackOutcome ? `f'(x)=${fallbackOutcome}` : '',
        rootBranchKey: branchKey,
        rootBranchLabel: getRootBranchLabel(branchKey),
        rootSubExpr,
        commentary: '',
        note: step.note || '',
        why: step.why || null,
      }
    })

    return {
      equation: `f(x) = ${explanation.inputLatex}`,
      steps,
      finalLatex: explanation.finalLatex,
      inputExpr: explanation.inputExpr,
      finalExpr: explanation.finalExpr,
      derivativeStart: `f'(x)=\\frac{d}{dx}\\left(${explanation.inputLatex}\\right)`,
    }
  }, [explanation])

  const simplificationPath = useMemo(() => {
    if (!explanation) return []

    const rows = []
    const seen = new Set()

    const pushRow = (label, exprLatex, note = '', why = null) => {
      const cleaned = tidyDisplayLatex(exprLatex)
      if (!cleaned) return
      const key = compactLatex(cleaned)
      if (!key || seen.has(key)) return
      seen.add(key)
      rows.push({
        label,
        expr: `f'(x)=${cleaned}`,
        note,
        why,
      })
    }

    pushRow(
      'Unsimplified combined derivative',
      explanation.rawLatex,
      'Direct result after rule application, before algebraic cleanup.'
    )

    explanation.steps
      .filter((step) => String(step?.tag || '').toLowerCase().includes('simplify') || step?.id === 'simplify')
      .forEach((step) => {
        const eq = extractPrimaryEquality(step?.math || '')
        const candidate = eq.after || step.currentDerivativePreview || explanation.finalLatex
        pushRow(step.title || 'Simplify', candidate, step.note || '', step.why || null)
      })

    pushRow('Final simplified / factored derivative', explanation.finalLatex)

    return rows
  }, [explanation])

  const savedFunctionEntries = useMemo(
    () => Object.entries(savedSnapshots).sort((a, b) => (Number(b?.[1]?.updatedAt) || 0) - (Number(a?.[1]?.updatedAt) || 0)),
    [savedSnapshots]
  )

  useEffect(() => {
    if (isImportedSnapshot || !dynamicSnapshot) return

    setTutorialSnapshot((prev) => {
      const freshSteps = dynamicSnapshot.steps.map((step) => ({
        ...step,
        commentary: '',
      }))

      return {
        equation: dynamicSnapshot.equation,
        isAuthoringMode: prev.isAuthoringMode,
        steps: freshSteps,
      }
    })
    setSnapshotOwnerKey(currentFunctionKey)
  }, [dynamicSnapshot, isImportedSnapshot, currentFunctionKey, loadedSnapshotKey])

  useEffect(() => {
    if (!currentFunctionKey) return
    if (!tutorialSnapshot.equation || !Array.isArray(tutorialSnapshot.steps) || !tutorialSnapshot.steps.length) return

    // Never persist if this snapshot belongs to a different function key.
    // This prevents cross-function commentary leaks during key-switch races.
    if (!snapshotOwnerKey || snapshotOwnerKey !== currentFunctionKey) return

    // Persist authored/imported/tutorial commentary snapshots, but avoid saving
    // passive unedited dynamic renders that can overwrite good stored content.
    const shouldPersist = tutorialSnapshot.isAuthoringMode || isImportedSnapshot || hasAnyCommentary(tutorialSnapshot)
    if (!shouldPersist) return

    const persisted = {
      equation: tutorialSnapshot.equation,
      steps: tutorialSnapshot.steps.map((step) => ({
        ruleUsed: String(step.ruleUsed || 'Custom Step'),
        applied: String(step.applied || ''),
        outcome: String(step.outcome || ''),
        commentary: String(step.commentary || ''),
      })),
      updatedAt: Date.now(),
    }

    setSavedSnapshots((prev) => {
      const next = { ...prev, [currentFunctionKey]: persisted }
      saveLocalSnapshotStore(next)
      return next
    })
  }, [tutorialSnapshot, currentFunctionKey, isImportedSnapshot, snapshotOwnerKey])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(timer)
  }, [toast])

  const displayedSteps = tutorialSnapshot.steps
  const derivativeStartExpr = displayedSteps[0]?.applied || dynamicSnapshot?.derivativeStart || ''

  function updateStep(index, patch) {
    setTutorialSnapshot((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? { ...step, ...patch } : step)),
    }))
  }

  function deleteStep(index) {
    setTutorialSnapshot((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }))
  }

  function deleteSavedForCurrentFunction() {
    if (!currentFunctionKey) return

    setSavedSnapshots((prev) => {
      if (!prev[currentFunctionKey]) return prev
      const next = { ...prev }
      delete next[currentFunctionKey]
      saveLocalSnapshotStore(next)
      return next
    })

    setIsImportedSnapshot(false)
    if (loadedSnapshotKey === currentFunctionKey) {
      setLoadedSnapshotKey('')
    }

    // Rebuild from current dynamic explanation immediately when available.
    if (dynamicSnapshot) {
      setTutorialSnapshot((prev) => ({
        equation: dynamicSnapshot.equation,
        isAuthoringMode: prev.isAuthoringMode,
        steps: dynamicSnapshot.steps.map((step) => ({ ...step, commentary: '' })),
      }))
      setSnapshotOwnerKey(currentFunctionKey)
    }

    setToast('Saved version deleted. Showing fresh steps.')
  }

  function deleteSavedByKey(functionKey) {
    setSavedSnapshots((prev) => {
      if (!prev[functionKey]) return prev
      const next = { ...prev }
      delete next[functionKey]
      saveLocalSnapshotStore(next)
      return next
    })

    if (loadedSnapshotKey === functionKey) {
      setLoadedSnapshotKey('')
      setIsImportedSnapshot(false)
      setToast('Saved tutorial removed.')
      return
    }

    setToast('Saved tutorial removed.')
  }

  function loadSavedFunction(functionKey) {
    const saved = savedSnapshots[functionKey]
    if (!saved || !Array.isArray(saved.steps) || !saved.steps.length) {
      setToast('No saved tutorial found for that function.')
      return
    }

    if (isDegenerateSnapshot(saved)) {
      deleteSavedByKey(functionKey)
      setToast('That saved tutorial was corrupted and has been deleted.')
      return
    }

    setTutorialSnapshot((prev) => ({
      equation: String(saved.equation || ''),
      isAuthoringMode: prev.isAuthoringMode,
      steps: saved.steps.map((step) => ({
        ruleUsed: String(step?.ruleUsed || 'Custom Step'),
        applied: String(step?.applied || ''),
        outcome: String(step?.outcome || ''),
        fallbackApplied: String(step?.fallbackApplied || ''),
        fallbackOutcome: String(step?.fallbackOutcome || ''),
        commentary: String(step?.commentary || ''),
        note: '',
        why: null,
      })),
    }))

    setInput(functionKey)
    setSubmitted(functionKey)
    setCurrentFunctionKey(functionKey)
    setSnapshotOwnerKey(functionKey)
    setLoadedSnapshotKey(functionKey)
    setIsImportedSnapshot(true)
    setToast('Loaded saved tutorial.')
  }

  async function handleExportTutorial() {
    const payload = {
      equation: tutorialSnapshot.equation,
      steps: tutorialSnapshot.steps.map((step) => ({
        ruleUsed: step.ruleUsed || 'Custom Step',
        applied: String(step.applied || ''),
        outcome: String(step.outcome || ''),
        fallbackApplied: String(step.fallbackApplied || ''),
        fallbackOutcome: String(step.fallbackOutcome || ''),
        commentary: String(step.commentary || ''),
      })),
    }
    const text = JSON.stringify(payload, null, 2)

    try {
      await navigator.clipboard.writeText(text)
      setToast('Copied!')
    } catch {
      setImportText(text)
      setToast('Clipboard blocked: JSON placed in import box.')
    }
  }

  function handleImportTutorial() {
    try {
      const parsed = JSON.parse(importText)
      if (!parsed || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid snapshot')
      }

      const normalized = {
        equation: String(parsed.equation || ''),
        isAuthoringMode: false,
        steps: parsed.steps.map((step) => ({
          ruleUsed: String(step?.ruleUsed || 'Custom Step'),
          applied: String(step?.applied || ''),
          outcome: String(step?.outcome || ''),
          fallbackApplied: String(step?.fallbackApplied || ''),
          fallbackOutcome: String(step?.fallbackOutcome || ''),
          commentary: String(step?.commentary || ''),
          note: '',
          why: null,
        })),
      }

      setTutorialSnapshot(normalized)
      const importKey = preprocessFriendlyInput(normalizeInput(input))
      setCurrentFunctionKey(importKey)
      setSnapshotOwnerKey(importKey)
      setLoadedSnapshotKey('')
      setIsImportedSnapshot(true)
      setToast('Tutorial loaded.')
    } catch {
      setToast('Invalid JSON.')
    }
  }

  function handleExplain() {
    const normalized = normalizeInput(input)
    const nextKey = preprocessFriendlyInput(normalized)

    // Clear previous loaded/imported snapshot immediately to avoid stale render/save races.
    setTutorialSnapshot((prev) => ({
      equation: '',
      isAuthoringMode: prev.isAuthoringMode,
      steps: [],
    }))
    setSnapshotOwnerKey('')

    setCurrentFunctionKey(nextKey)
    setLoadedSnapshotKey('')
    setIsImportedSnapshot(false)
    setSubmitted(normalized)
    const nextRecent = [normalized, ...recentInputs.filter((e) => e !== normalized)].slice(0, 5)
    setRecentInputs(nextRecent)
    localStorage.setItem('universal-calc-recent-inputs', JSON.stringify(nextRecent))
  }

  return (
    <section className="max-w-[2200px] mx-auto px-2 sm:px-4 lg:px-8">
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

        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTutorialSnapshot((prev) => ({ ...prev, isAuthoringMode: !prev.isAuthoringMode }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${tutorialSnapshot.isAuthoringMode
                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700'
                : 'bg-white text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700'}`}
            >
              {tutorialSnapshot.isAuthoringMode ? 'Authoring: ON' : 'Authoring: OFF'}
            </button>

            <button
              onClick={handleExportTutorial}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Export Tutorial
            </button>

            <button
              onClick={deleteSavedForCurrentFunction}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Saved For This Function
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Saved functions: {Object.keys(savedSnapshots).length}
            </span>

            {toast && <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{toast}</span>}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Import Tutorial JSON</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full min-h-[110px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 font-mono text-xs text-slate-700 dark:text-slate-200"
              placeholder='{"equation":"f(x)=...","steps":[...]}'
            />
            <button
              onClick={handleImportTutorial}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Load Imported Tutorial
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Saved Edited / Commentary Functions</p>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {savedFunctionEntries.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
                  No saved authored/commentary functions yet.
                </div>
              ) : (
                savedFunctionEntries.map(([functionKey, snapshot]) => {
                  const displayName = getSnapshotDisplayName(functionKey, snapshot)
                  const stepCount = Array.isArray(snapshot?.steps) ? snapshot.steps.length : 0
                  const updatedAt = Number(snapshot?.updatedAt) || 0

                  return (
                    <div key={functionKey} className="px-3 py-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{functionKey}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {stepCount} steps {updatedAt ? `| ${new Date(updatedAt).toLocaleString()}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => loadSavedFunction(functionKey)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold ${loadedSnapshotKey === functionKey
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteSavedByKey(functionKey)}
                          className="px-2 py-1 rounded text-[11px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {error && !isImportedSnapshot && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {(displayedSteps.length > 0 || dynamicSnapshot) && (
        <>
          <div className="mb-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide font-bold text-slate-500 dark:text-slate-400 mb-2">Problem</p>
            <KatexBlock expr={tutorialSnapshot.equation || dynamicSnapshot?.equation || ''} className="text-slate-900 dark:text-slate-100" />
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Solution</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 mb-6">
              Problem, then alternating lines: apply a rule, then show the resulting expression.
            </p>

            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Problem</p>
                <div className="overflow-x-auto max-w-full">
                  <KatexBlock expr={derivativeStartExpr} className="text-[0.92rem] lg:text-[1rem] text-slate-900 dark:text-slate-100" />
                </div>
              </div>

              {displayedSteps.map((step, i) => {
                const ruleLabel = step.ruleUsed || 'Custom Step'
                const customCommentary = String(step.commentary || '').trim()
                const defaultCommentary = buildDefaultCommentary(step)
                const effectiveCommentary = customCommentary || defaultCommentary
                const isDefaultCommentary = !customCommentary

                return (
                  <div key={`${ruleLabel}-${i}`} className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 last:border-0 last:pb-0">
                      {!tutorialSnapshot.isAuthoringMode && step.rootSubExpr ? (
                        <div className="pointer-events-none absolute right-10 top-1 max-w-[58%] text-right">
                          <p className="text-[10px] italic font-semibold uppercase tracking-wide text-slate-500/80 dark:text-slate-400/80">
                            Root focus: {step.rootBranchLabel}
                          </p>
                          <div className="overflow-x-auto max-w-full">
                            <KatexBlock expr={step.rootSubExpr} className="text-[0.78rem] lg:text-[0.86rem] italic text-slate-500 dark:text-slate-400" />
                          </div>
                        </div>
                      ) : null}

                      <div className="min-w-0 space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Applied</p>
                          <p className="text-base text-slate-700 dark:text-slate-300 mb-2">Apply {ruleLabel.toLowerCase()}.</p>

                          {tutorialSnapshot.isAuthoringMode ? (
                            <textarea
                              value={step.applied || ''}
                              onChange={(e) => updateStep(i, { applied: e.target.value })}
                              className="w-full min-h-[80px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 font-mono text-xs text-slate-700 dark:text-slate-200"
                            />
                          ) : (
                            <div className="overflow-x-auto max-w-full">
                              <KatexBlock expr={pickRenderableLatex(step.applied, step.fallbackApplied)} className="text-[0.9rem] lg:text-[0.98rem] text-slate-900 dark:text-slate-100" />
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Outcome</p>

                          {tutorialSnapshot.isAuthoringMode ? (
                            <textarea
                              value={step.outcome || ''}
                              onChange={(e) => updateStep(i, { outcome: e.target.value })}
                              className="w-full min-h-[80px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 font-mono text-xs text-slate-700 dark:text-slate-200"
                            />
                          ) : (
                            <div className="overflow-x-auto max-w-full">
                              <KatexBlock expr={pickRenderableLatex(step.outcome, step.fallbackOutcome)} className="text-[0.9rem] lg:text-[0.98rem] text-slate-900 dark:text-slate-100" />
                            </div>
                          )}
                        </div>

                        {tutorialSnapshot.isAuthoringMode ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Commentary</p>
                            <textarea
                              value={step.commentary || ''}
                              onChange={(e) => updateStep(i, { commentary: e.target.value })}
                              className="w-full min-h-[90px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-sm text-slate-700 dark:text-slate-200"
                              placeholder="Author commentary for this step..."
                            />
                          </div>
                        ) : (
                          <>
                            {step.note ? <p className="text-sm text-slate-500 dark:text-slate-400">{step.note}</p> : null}
                            {effectiveCommentary ? (
                              <div className={`rounded-xl p-3 ${isDefaultCommentary
                                ? 'border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-900/20'
                                : 'border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-900/20'}`}>
                                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDefaultCommentary
                                  ? 'text-sky-700 dark:text-sky-300'
                                  : 'text-amber-700 dark:text-amber-300'}`}>
                                  {isDefaultCommentary ? 'Auto Commentary' : 'Director\'s Commentary'}
                                </p>
                                <div className={`text-sm leading-relaxed ${isDefaultCommentary
                                  ? 'text-sky-900 dark:text-sky-100'
                                  : 'text-amber-900 dark:text-amber-100'}`}>
                                  {parseProse(effectiveCommentary)}
                                </div>
                              </div>
                            ) : null}
                            {step.why ? <WhyPanel why={step.why} depth={0} /> : null}
                          </>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        <span>Step {i + 1}</span>
                        {tutorialSnapshot.isAuthoringMode && (
                          <button
                            onClick={() => deleteStep(i)}
                            className="px-2 py-1 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs"
                          >
                            Delete Step
                          </button>
                        )}
                      </div>
                    </div>
                )
              })}
            </div>
          </div>

          {dynamicSnapshot && simplificationPath.length > 1 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Simplification path</h2>
                <button
                  onClick={() => setShowSimplificationPath((v) => !v)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                >
                  {showSimplificationPath ? 'Hide simplification steps' : 'Show simplification steps'}
                </button>
              </div>

              {showSimplificationPath ? (
                <div className="space-y-4">
                  {simplificationPath.map((entry, idx) => (
                    <div key={`${entry.label}-${idx}`} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                        {idx + 1}. {entry.label}
                      </p>
                      <div className="overflow-x-auto max-w-full">
                        <KatexBlock expr={entry.expr} className="text-[0.92rem] lg:text-[1rem] text-slate-900 dark:text-slate-100" />
                      </div>
                      {entry.note ? <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{entry.note}</p> : null}
                      {entry.why ? <div className="mt-2"><WhyPanel why={entry.why} depth={0} /></div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Simplification details are hidden. Toggle to inspect how the unsimplified derivative becomes the final form.</p>
              )}
            </div>
          )}

          {dynamicSnapshot && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Final simplified derivative</h2>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Simplified / factored</p>
              <KatexBlock expr={`f'(x) = ${dynamicSnapshot.finalLatex}`} className="text-slate-900 dark:text-slate-100" />
            </div>
            <div className="mt-4">
              <OpenInGrapher
                variant="button"
                label="Open f(x) and f'(x) in Grapher"
                config={{
                  mode: 'pro',
                  replace: true,
                  functions: [
                    { expr: dynamicSnapshot.inputExpr, type: 'explicit', color: '#6366f1', label: 'f(x)' },
                    { expr: dynamicSnapshot.finalExpr, type: 'explicit', color: '#ec4899', label: "f'(x)" },
                  ],
                }}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Grapher opens with a snapshot of the current function pair. Click Explain again after edits to refresh the plotted derivative.
              </p>
            </div>
          </div>
          )}

        </>
      )}

      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  )
}
