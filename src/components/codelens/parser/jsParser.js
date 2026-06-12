import * as acorn from 'acorn'

// ── Token stream ──────────────────────────────────────────────────────────────

export function tokenize(source) {
  const tokens = []
  try {
    const tokenizer = acorn.tokenizer(source, {
      ecmaVersion: 2022,
      sourceType: 'module',
    })
    for (const tok of tokenizer) {
      tokens.push({
        type:  tok.type.label,
        value: tok.value ?? null,
        start: tok.start,
        end:   tok.end,
      })
    }
  } catch (err) {
    return { tokens: [], error: formatParseError(err) }
  }
  return { tokens, error: null }
}

// ── AST ───────────────────────────────────────────────────────────────────────

export function parse(source) {
  try {
    const ast = acorn.parse(source, {
      ecmaVersion: 2022,
      sourceType: 'module',
      locations: true,
    })
    return { ast, error: null }
  } catch (err) {
    return { ast: null, error: formatParseError(err) }
  }
}

// ── Program Model ─────────────────────────────────────────────────────────────
// Produced once at parse time. Static structure — does not change during execution.

export function buildProgramModel(source, filename = 'main.js') {
  const { tokens, error: tokenError } = tokenize(source)
  const { ast, error: parseError } = parse(source)

  const error = tokenError || parseError
  if (error) return { error, files: [], classes: [], functions: [], imports: [], exports: [] }

  const classes   = []
  const functions = []
  const imports   = []
  const exports   = []

  walkAST(ast, (node) => {
    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      classes.push({
        name:       node.id?.name ?? '(anonymous)',
        superclass: node.superClass?.name ?? null,
        methods:    (node.body?.body ?? [])
          .filter(m => m.type === 'MethodDefinition')
          .map(m => ({
            name:   m.key?.name ?? m.key?.value ?? '(computed)',
            kind:   m.kind,
            static: m.static,
            line:   m.loc?.start?.line ?? null,
          })),
        line:     node.loc?.start?.line ?? null,
        file:     filename,
      })
    }

    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      functions.push({
        name:       node.id?.name ?? '(anonymous)',
        params:     (node.params ?? []).map(p => paramName(p)),
        line:       node.loc?.start?.line ?? null,
        file:       filename,
        complexity: estimateComplexity(node),
      })
    }

    if (node.type === 'ImportDeclaration') {
      imports.push({
        source:     node.source?.value ?? '',
        specifiers: (node.specifiers ?? []).map(s => s.local?.name ?? ''),
        line:       node.loc?.start?.line ?? null,
      })
    }

    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      exports.push({
        kind: node.type === 'ExportDefaultDeclaration' ? 'default' : 'named',
        line: node.loc?.start?.line ?? null,
      })
    }
  })

  return {
    error: null,
    files: [{ path: filename, source, tokens, ast }],
    classes,
    functions,
    imports,
    exports,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function walkAST(node, visitor) {
  if (!node || typeof node !== 'object') return
  visitor(node)
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue
    const child = node[key]
    if (Array.isArray(child)) child.forEach(c => walkAST(c, visitor))
    else if (child && typeof child.type === 'string') walkAST(child, visitor)
  }
}

function paramName(param) {
  if (!param) return '?'
  if (param.type === 'Identifier') return param.name
  if (param.type === 'AssignmentPattern') return paramName(param.left)
  if (param.type === 'RestElement') return `...${paramName(param.argument)}`
  return '?'
}

// Simple static complexity estimate: count loop nesting depth + recursion.
function estimateComplexity(fnNode) {
  let loopDepth = 0
  let maxDepth  = 0
  let current   = 0
  const fnName  = fnNode.id?.name

  walkAST(fnNode, (node) => {
    const isLoop = ['ForStatement','ForInStatement','ForOfStatement','WhileStatement','DoWhileStatement'].includes(node.type)
    if (isLoop) { current++; maxDepth = Math.max(maxDepth, current) }

    // Detect direct recursion
    if (fnName && node.type === 'CallExpression' && node.callee?.name === fnName) {
      loopDepth = Math.max(loopDepth, 1)
    }
  })

  if (maxDepth === 0 && loopDepth === 0) return 'O(1)'
  if (maxDepth === 1 && loopDepth === 0) return 'O(n)'
  if (maxDepth === 0 && loopDepth === 1) return 'O(n) recursive'
  if (maxDepth === 2) return 'O(n²)'
  if (maxDepth >= 3) return `O(n^${maxDepth})`
  return 'O(n log n)?'
}

function formatParseError(err) {
  return {
    message: err.message ?? String(err),
    line:    err.loc?.line   ?? null,
    column:  err.loc?.column ?? null,
  }
}
