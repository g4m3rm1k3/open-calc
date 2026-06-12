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
  if (error) return { error, files: [], classes: [], functions: [], variables: [], imports: [], exports: [] }

  const classes   = []
  const functions = []
  const imports   = []
  const exports   = []

  // Top-level variable declarations (direct children of Program body only)
  const variables = []
  for (const node of ast.body ?? []) {
    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations) {
        variables.push({
          name:     decl.id?.name ?? '?',
          kind:     node.kind,
          initType: inferInitType(decl.init),
          line:     node.loc?.start?.line ?? null,
        })
      }
    }
  }

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
    variables,
    imports,
    exports,
    callGraph: buildCallGraph(ast),
  }
}

// ── Call Graph ────────────────────────────────────────────────────────────────
// Static analysis: which functions call which. Used by CallGraphView.

export function buildCallGraph(ast) {
  if (!ast) return { nodes: [], edges: [] }

  const funcs  = []
  const seenIds = new Set()

  walkASTWithParent(ast, (node, parent, grandparent) => {
    let name     = null
    let kind     = 'function'
    let funcNode = null

    if (node.type === 'FunctionDeclaration') {
      name = node.id?.name ?? null
      kind = 'function'
      funcNode = node
    } else if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      funcNode = node
      kind = node.type === 'ArrowFunctionExpression' ? 'arrow' : 'function'
      if (parent?.type === 'VariableDeclarator' && parent.id?.type === 'Identifier') {
        name = parent.id.name
      } else if (parent?.type === 'MethodDefinition') {
        const clsName = grandparent?.id?.name ?? ''
        const mname   = parent.key?.name ?? parent.key?.value ?? '(computed)'
        name = clsName ? `${clsName}.${mname}` : mname
        kind = parent.kind === 'constructor' ? 'constructor' : 'method'
      } else if (parent?.type === 'AssignmentExpression' && parent.left?.type === 'Identifier') {
        name = parent.left.name
      }
    }

    if (name && funcNode) {
      const id = `${name}@${funcNode.start}`
      if (!seenIds.has(id)) {
        seenIds.add(id)
        funcs.push({
          id,
          name,
          kind,
          start:      funcNode.start,
          end:        funcNode.end,
          line:       funcNode.loc?.start?.line ?? null,
          params:     (funcNode.params ?? []).map(paramName),
          complexity: estimateComplexity(funcNode),
        })
      }
    }
  })

  const edges  = []
  const edgeSet = new Set()

  walkASTWithParent(ast, (node) => {
    if (node.type !== 'CallExpression') return

    let targetName = null
    if (node.callee.type === 'Identifier') {
      targetName = node.callee.name
    } else if (node.callee.type === 'MemberExpression' && !node.callee.computed) {
      const obj  = node.callee.object
      const prop = node.callee.property?.name
      if (obj?.type === 'Identifier' && prop) targetName = `${obj.name}.${prop}`
    }
    if (!targetName) return

    // Innermost enclosing function: smallest source range that contains this call
    const enclosing = funcs
      .filter(f => f.start <= node.start && node.end <= f.end)
      .sort((a, b) => (a.end - a.start) - (b.end - b.start))[0]

    if (!enclosing) return

    const target = funcs.find(f => f.name === targetName)
    if (!target) return

    const key = `${enclosing.id}→${target.id}`
    if (!edgeSet.has(key)) {
      edgeSet.add(key)
      edges.push({ from: enclosing.id, to: target.id, recursive: enclosing.id === target.id })
    }
  })

  return { nodes: funcs, edges }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function walkASTWithParent(node, visitor, parent = null, grandparent = null) {
  if (!node || typeof node !== 'object') return
  visitor(node, parent, grandparent)
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue
    const val = node[key]
    if (Array.isArray(val)) {
      val.forEach(c => {
        if (c && typeof c === 'object' && c.type) walkASTWithParent(c, visitor, node, parent)
      })
    } else if (val && typeof val === 'object' && val.type) {
      walkASTWithParent(val, visitor, node, parent)
    }
  }
}

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

function inferInitType(init) {
  if (!init) return null
  if (init.type === 'Literal')           return typeof init.value   // 'number', 'string', 'boolean'
  if (init.type === 'ArrayExpression')   return 'array'
  if (init.type === 'ObjectExpression')  return 'object'
  if (init.type === 'NewExpression')     return init.callee?.name ? `new ${init.callee.name}` : 'new'
  if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') return 'function'
  if (init.type === 'CallExpression') {
    const callee = init.callee
    if (callee.type === 'Identifier') return `${callee.name}()`
    if (callee.type === 'MemberExpression') return `${callee.object?.name ?? '?'}.${callee.property?.name ?? '?'}()`
    return 'call'
  }
  if (init.type === 'TemplateLiteral')   return 'string'
  if (init.type === 'BinaryExpression')  return 'expr'
  return null
}

function formatParseError(err) {
  return {
    message: err.message ?? String(err),
    line:    err.loc?.line   ?? null,
    column:  err.loc?.column ?? null,
  }
}
