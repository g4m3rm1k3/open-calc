import * as acorn from 'acorn'
import { Environment, serializeValue } from './environment.js'
import { Heap, mkRef, isRef } from './heap.js'
import { EventType, makeEvent } from '../eventStream.js'

const MAX_STEPS = 100_000

// ── Control-flow sentinels ────────────────────────────────────────────────────

class ReturnSignal  { constructor(v) { this.value = v } }
class BreakSignal   { constructor(label) { this.label = label } }
class ContinueSignal{ constructor(label) { this.label = label } }
class ThrowSignal   { constructor(v) { this.value = v } }

// ── Public entry point ────────────────────────────────────────────────────────

export function run(source) {
  let ast
  try {
    ast = acorn.parse(source, { ecmaVersion: 2022, sourceType: 'module', locations: true })
  } catch (e) {
    return { events: [], error: { message: e.message, line: e.loc?.line ?? null } }
  }

  const interp = new Interpreter(source, ast)
  return interp.execute()
}

// ── Interpreter ───────────────────────────────────────────────────────────────

class Interpreter {
  constructor(source, ast) {
    this.source   = source
    this.ast      = ast
    this.events   = []
    this.stepId   = 0
    this.heap     = new Heap()
    this.callStack= []   // [{ name, env, returnLine }]
    this.globalEnv= null // set during execute(), included in every stackSnapshot
    this.output   = []   // console.log lines
    this.labels   = new Map()
  }

  // ── Execution entry ────────────────────────────────────────────────────────

  execute() {
    const globalEnv = new Environment(null, 'global')
    this.globalEnv = globalEnv
    this._installGlobals(globalEnv)

    this._emit(EventType.PROGRAM_START, null, globalEnv, {
      source: this.source,
    })

    let error = null
    try {
      this._hoistDeclarations(this.ast.body, globalEnv)
      const result = this._evalBody(this.ast.body, globalEnv)
      if (result instanceof ThrowSignal) throw result.value
    } catch (e) {
      error = { message: e?.message ?? String(e), type: e?.constructor?.name ?? 'Error' }
      this._emit(EventType.ERROR_THROWN, null, globalEnv, {
        errorType: error.type, message: error.message,
      })
    }

    this._emit(EventType.PROGRAM_END, null, globalEnv, {
      totalSteps: this.stepId,
      output: this.output,
    })

    return { events: this.events, output: this.output, error }
  }

  // ── Hoisting ───────────────────────────────────────────────────────────────

  _hoistDeclarations(stmts, env) {
    for (const stmt of stmts) {
      if (stmt.type === 'FunctionDeclaration') {
        const fn = this._makeFunction(stmt, env)
        env.define(stmt.id.name, fn, 'var')
      }
      if (stmt.type === 'VariableDeclaration' && stmt.kind === 'var') {
        for (const decl of stmt.declarations) {
          const name = decl.id.name
          env.functionScope().hoist(name)
        }
      }
    }
  }

  // ── Statement evaluator ────────────────────────────────────────────────────

  _evalStmt(node, env) {
    if (++this.stepId > MAX_STEPS) throw new Error(`Step limit (${MAX_STEPS}) exceeded — possible infinite loop`)

    this._emit(EventType.STATEMENT_ENTER, node, env)

    let result
    switch (node.type) {
      case 'ExpressionStatement':
        result = this._evalExpr(node.expression, env); break
      case 'BlockStatement':
        result = this._evalBlock(node, env); break
      case 'VariableDeclaration':
        result = this._evalVarDecl(node, env); break
      case 'FunctionDeclaration':
        // Already hoisted — skip body re-execution but mark as seen
        result = undefined; break
      case 'ClassDeclaration':
        result = this._evalClassDecl(node, env); break
      case 'ReturnStatement':
        result = this._evalReturn(node, env); break
      case 'IfStatement':
        result = this._evalIf(node, env); break
      case 'SwitchStatement':
        result = this._evalSwitch(node, env); break
      case 'WhileStatement':
        result = this._evalWhile(node, env); break
      case 'DoWhileStatement':
        result = this._evalDoWhile(node, env); break
      case 'ForStatement':
        result = this._evalFor(node, env); break
      case 'ForInStatement':
        result = this._evalForIn(node, env); break
      case 'ForOfStatement':
        result = this._evalForOf(node, env); break
      case 'BreakStatement':
        result = new BreakSignal(node.label?.name ?? null); break
      case 'ContinueStatement':
        result = new ContinueSignal(node.label?.name ?? null); break
      case 'ThrowStatement': {
        const val = this._evalExpr(node.argument, env)
        result = new ThrowSignal(val); break
      }
      case 'TryStatement':
        result = this._evalTry(node, env); break
      case 'LabeledStatement':
        result = this._evalLabeled(node, env); break
      case 'ImportDeclaration':
      case 'ExportNamedDeclaration':
      case 'ExportDefaultDeclaration':
        result = undefined; break
      default:
        result = undefined
    }

    this._emit(EventType.STATEMENT_EXIT, node, env, { result: serializeValue(result) })
    return result
  }

  _evalBody(stmts, env) {
    for (const stmt of stmts) {
      const r = this._evalStmt(stmt, env)
      if (r instanceof ReturnSignal || r instanceof BreakSignal ||
          r instanceof ContinueSignal || r instanceof ThrowSignal) return r
    }
    return undefined
  }

  _evalBlock(node, env) {
    const blockEnv = env.extend('block')
    this._emit(EventType.SCOPE_ENTER, node, blockEnv, { scopeId: blockEnv.id })
    // Hoist functions inside block
    this._hoistDeclarations(node.body, blockEnv)
    const result = this._evalBody(node.body, blockEnv)
    this._emit(EventType.SCOPE_EXIT, node, blockEnv, { scopeId: blockEnv.id })
    return result
  }

  // ── Variable declarations ──────────────────────────────────────────────────

  _evalVarDecl(node, env) {
    for (const decl of node.declarations) {
      const value = decl.init ? this._evalExpr(decl.init, env) : undefined
      const names = this._destructure(decl.id, value, env, node.kind)

      for (const [name, val] of names) {
        if (node.kind === 'var') {
          env.functionScope().assign(name, val)
        } else {
          env.define(name, val, node.kind)
        }
        this._emit(EventType.VARIABLE_DECLARE, decl, env, {
          name, value: serializeValue(val), kind: node.kind,
        })
      }
    }
  }

  // ── Control flow ───────────────────────────────────────────────────────────

  _evalReturn(node, env) {
    const value = node.argument ? this._evalExpr(node.argument, env) : undefined
    return new ReturnSignal(value)
  }

  _evalIf(node, env) {
    const test = this._evalExpr(node.test, env)
    const branch = test ? 'consequent' : 'alternate'
    this._emit(EventType.CONDITIONAL_BRANCH, node, env, {
      condition: this._nodeSource(node.test),
      result: !!test, branch,
    })
    if (test) return this._evalStmt(node.consequent, env)
    if (node.alternate) return this._evalStmt(node.alternate, env)
  }

  _evalSwitch(node, env) {
    const discriminant = this._evalExpr(node.discriminant, env)
    let matched = false
    for (const cs of node.cases) {
      if (!matched && cs.test !== null) {
        const test = this._evalExpr(cs.test, env)
        matched = test === discriminant
      } else if (cs.test === null) matched = true // default

      if (matched) {
        for (const stmt of cs.consequent) {
          const r = this._evalStmt(stmt, env)
          if (r instanceof BreakSignal && r.label === null) return undefined
          if (r instanceof ReturnSignal || r instanceof ThrowSignal) return r
        }
      }
    }
  }

  _evalWhile(node, env) {
    let iter = 0
    while (true) {
      const test = this._evalExpr(node.test, env)
      this._emit(EventType.CONDITIONAL_BRANCH, node.test, env, {
        condition: this._nodeSource(node.test), result: !!test, branch: test ? 'body' : 'exit',
      })
      if (!test) break
      this._emit(EventType.LOOP_ITERATION, node, env, { loopType: 'while', iteration: ++iter })
      const r = this._evalStmt(node.body, env)
      if (r instanceof BreakSignal && r.label === null) break
      if (r instanceof BreakSignal) return r
      if (r instanceof ReturnSignal || r instanceof ThrowSignal) return r
      // ContinueSignal — just continue
    }
  }

  _evalDoWhile(node, env) {
    let iter = 0
    do {
      this._emit(EventType.LOOP_ITERATION, node, env, { loopType: 'do-while', iteration: ++iter })
      const r = this._evalStmt(node.body, env)
      if (r instanceof BreakSignal && r.label === null) break
      if (r instanceof BreakSignal) return r
      if (r instanceof ReturnSignal || r instanceof ThrowSignal) return r
      const test = this._evalExpr(node.test, env)
      if (!test) break
    } while (true)
  }

  _evalFor(node, env) {
    const forEnv = env.extend('block')
    if (node.init) {
      if (node.init.type === 'VariableDeclaration') this._evalVarDecl(node.init, forEnv)
      else this._evalExpr(node.init, forEnv)
    }
    let iter = 0
    while (true) {
      if (node.test) {
        const test = this._evalExpr(node.test, forEnv)
        this._emit(EventType.CONDITIONAL_BRANCH, node.test, forEnv, {
          condition: this._nodeSource(node.test), result: !!test, branch: test ? 'body' : 'exit',
        })
        if (!test) break
      }
      this._emit(EventType.LOOP_ITERATION, node, forEnv, { loopType: 'for', iteration: ++iter })
      const r = this._evalStmt(node.body, forEnv)
      if (r instanceof BreakSignal && r.label === null) break
      if (r instanceof BreakSignal) return r
      if (r instanceof ReturnSignal || r instanceof ThrowSignal) return r
      if (node.update) this._evalExpr(node.update, forEnv)
    }
  }

  _evalForIn(node, env) {
    const obj = this._evalExpr(node.right, env)
    const keys = isRef(obj) ? this.heap.allKeys(obj) : Object.keys(Object(obj))
    let iter = 0
    for (const key of keys) {
      this._emit(EventType.LOOP_ITERATION, node, env, { loopType: 'for-in', iteration: ++iter })
      const loopEnv = env.extend('block')
      this._assignLoopVar(node.left, key, loopEnv)
      const r = this._evalStmt(node.body, loopEnv)
      if (r instanceof BreakSignal && r.label === null) break
      if (r instanceof ReturnSignal || r instanceof ThrowSignal) return r
    }
  }

  _evalForOf(node, env) {
    const iterable = this._evalExpr(node.right, env)
    const items = this._toIterable(iterable)
    let iter = 0
    for (const item of items) {
      this._emit(EventType.LOOP_ITERATION, node, env, { loopType: 'for-of', iteration: ++iter })
      const loopEnv = env.extend('block')
      this._assignLoopVar(node.left, item, loopEnv)
      const r = this._evalStmt(node.body, loopEnv)
      if (r instanceof BreakSignal && r.label === null) break
      if (r instanceof ReturnSignal || r instanceof ThrowSignal) return r
    }
  }

  _evalLabeled(node, env) {
    const r = this._evalStmt(node.body, env)
    if (r instanceof BreakSignal && r.label === node.label.name) return undefined
    return r
  }

  // ── Try/catch/finally ──────────────────────────────────────────────────────

  _evalTry(node, env) {
    let result
    let thrown = null
    try {
      result = this._evalBlock(node.block, env)
      if (result instanceof ThrowSignal) { thrown = result.value; result = null }
    } catch (e) { thrown = e }

    if (thrown !== null && node.handler) {
      const catchEnv = env.extend('block')
      if (node.handler.param) {
        const names = this._destructure(node.handler.param, thrown, catchEnv, 'let')
        for (const [n, v] of names) catchEnv.define(n, v, 'let')
      }
      this._emit(EventType.ERROR_CAUGHT, node.handler, catchEnv, {
        errorType: thrown?.constructor?.name ?? 'Error',
        message: thrown?.message ?? String(thrown),
      })
      result = this._evalBlock(node.handler.body, catchEnv)
      thrown = null
    }

    if (node.finalizer) {
      const fr = this._evalBlock(node.finalizer, env)
      if (fr instanceof ReturnSignal || fr instanceof ThrowSignal) return fr
    }

    if (thrown !== null) return new ThrowSignal(thrown)
    return result
  }

  // ── Classes ────────────────────────────────────────────────────────────────

  _evalClassDecl(node, env) {
    const cls = this._buildClass(node, env)
    env.define(node.id.name, cls, 'let')
    return cls
  }

  _buildClass(node, env) {
    const superCls = node.superClass ? this._evalExpr(node.superClass, env) : null
    const protoRef = this.heap.allocate('prototype', {}, superCls?.__protoId ?? null)

    const methods = {}
    for (const member of node.body.body) {
      if (member.type !== 'MethodDefinition') continue
      const key   = member.computed ? this._evalExpr(member.key, env) : member.key.name ?? member.key.value
      const fn    = this._makeFunction(member.value, env, key)
      if (member.static) {
        methods['static:' + key] = fn
      } else {
        this.heap.set(protoRef, key, fn)
      }
    }

    const cls = {
      __kind:    'class',
      name:      node.id?.name ?? '(anonymous)',
      protoRef,
      superCls,
      __protoId: protoRef.objectId,
      staticMethods: methods,
    }
    return cls
  }

  // ── Expression evaluator ───────────────────────────────────────────────────

  _evalExpr(node, env) {
    if (!node) return undefined
    switch (node.type) {
      case 'Literal':                 return this._evalLiteral(node)
      case 'ThisExpression':          return (() => { try { return env.lookup('this') } catch { return undefined } })()
      case 'TemplateLiteral':         return this._evalTemplate(node, env)
      case 'Identifier':              return this._evalIdentifier(node, env)
      case 'BinaryExpression':        return this._evalBinary(node, env)
      case 'LogicalExpression':       return this._evalLogical(node, env)
      case 'UnaryExpression':         return this._evalUnary(node, env)
      case 'UpdateExpression':        return this._evalUpdate(node, env)
      case 'AssignmentExpression':    return this._evalAssignment(node, env)
      case 'ConditionalExpression':   return this._evalConditional(node, env)
      case 'SequenceExpression':      return this._evalSequence(node, env)
      case 'CallExpression':          return this._evalCall(node, env)
      case 'NewExpression':           return this._evalNew(node, env)
      case 'MemberExpression':        return this._evalMember(node, env)
      case 'ArrayExpression':         return this._evalArray(node, env)
      case 'ObjectExpression':        return this._evalObject(node, env)
      case 'FunctionExpression':
      case 'ArrowFunctionExpression': return this._makeFunction(node, env)
      case 'ClassExpression':         return this._buildClass(node, env)
      case 'SpreadElement':           return this._evalExpr(node.argument, env)
      case 'AssignmentPattern':       return this._evalExpr(node.right, env)
      case 'ChainExpression':         return this._evalChain(node, env)
      default:
        return undefined
    }
  }

  _evalLiteral(node) {
    return node.regex ? new RegExp(node.regex.pattern, node.regex.flags) : node.value
  }

  _evalTemplate(node, env) {
    let result = ''
    for (let i = 0; i < node.quasis.length; i++) {
      result += node.quasis[i].value.cooked ?? ''
      if (i < node.expressions.length) result += String(this._evalExpr(node.expressions[i], env) ?? '')
    }
    return result
  }

  _evalIdentifier(node, env) {
    return env.lookup(node.name)
  }

  _evalBinary(node, env) {
    const left  = this._evalExpr(node.left,  env)
    const right = this._evalExpr(node.right, env)
    const op    = node.operator
    switch (op) {
      case '+':   return this._add(left, right)
      case '-':   return left - right
      case '*':   return left * right
      case '/':   return left / right
      case '%':   return left % right
      case '**':  return left ** right
      case '===': return left === right
      case '!==': return left !== right
      case '==':  return left == right  // eslint-disable-line eqeqeq
      case '!=':  return left != right  // eslint-disable-line eqeqeq
      case '<':   return left < right
      case '<=':  return left <= right
      case '>':   return left > right
      case '>=':  return left >= right
      case '&':   return left & right
      case '|':   return left | right
      case '^':   return left ^ right
      case '<<':  return left << right
      case '>>':  return left >> right
      case '>>>': return left >>> right
      case 'in':
        if (isRef(right)) return this.heap.has(right, String(left))
        return left in Object(right)
      case 'instanceof': return this._instanceof(left, right)
      default:    return undefined
    }
  }

  _add(a, b) {
    if (typeof a === 'string' || typeof b === 'string') return String(a) + String(b)
    return a + b
  }

  _instanceof(val, cls) {
    if (cls?.__kind !== 'class') return false
    if (!isRef(val)) return false
    let protoId = this.heap.objects.get(val.objectId)?.prototype ?? null
    while (protoId !== null) {
      if (protoId === cls.__protoId) return true
      protoId = this.heap.objects.get(protoId)?.prototype ?? null
    }
    return false
  }

  _evalLogical(node, env) {
    const left = this._evalExpr(node.left, env)
    if (node.operator === '&&')  return left ? this._evalExpr(node.right, env) : left
    if (node.operator === '||')  return left ? left : this._evalExpr(node.right, env)
    if (node.operator === '??')  return left ?? this._evalExpr(node.right, env)
    return undefined
  }

  _evalUnary(node, env) {
    if (node.operator === 'typeof') {
      try { return typeof this._evalExpr(node.argument, env) }
      catch { return 'undefined' }
    }
    const val = this._evalExpr(node.argument, env)
    switch (node.operator) {
      case '!':   return !val
      case '-':   return -val
      case '+':   return +val
      case '~':   return ~val
      case 'void': return undefined
      case 'delete': {
        if (node.argument.type === 'MemberExpression') {
          const obj  = this._evalExpr(node.argument.object, env)
          const prop = node.argument.computed
            ? this._evalExpr(node.argument.property, env)
            : node.argument.property.name
          if (isRef(obj)) {
            this.heap.objects.get(obj.objectId)?.properties.delete(String(prop))
            return true
          }
        }
        return true
      }
      default: return undefined
    }
  }

  _evalUpdate(node, env) {
    const name = node.argument.type === 'Identifier' ? node.argument.name : null
    const old  = this._evalExpr(node.argument, env)
    const next = node.operator === '++' ? old + 1 : old - 1

    if (name) {
      const prev = serializeValue(old)
      env.assign(name, next)
      this._emit(EventType.VARIABLE_ASSIGN, node, env, {
        name, oldValue: prev, newValue: serializeValue(next),
      })
    } else if (node.argument.type === 'MemberExpression') {
      this._memberSet(node.argument, next, env)
    }

    return node.prefix ? next : old
  }

  _evalAssignment(node, env) {
    // Compound assignment operators: +=, -=, etc.
    if (node.operator !== '=') {
      const current = this._evalExpr(node.left, env)
      const right   = this._evalExpr(node.right, env)
      const op      = node.operator.slice(0, -1)
      const value   = this._evalBinary({ ...node, operator: op, left: { type: '__value', _v: current }, right: { type: '__value', _v: right } }, env)
      return this._doAssign(node.left, value, env)
    }
    const value = this._evalExpr(node.right, env)
    return this._doAssign(node.left, value, env)
  }

  _doAssign(target, value, env) {
    if (target.type === 'Identifier') {
      const old = (() => { try { return env.lookup(target.name) } catch { return undefined } })()
      env.assign(target.name, value)
      this._emit(EventType.VARIABLE_ASSIGN, target, env, {
        name: target.name,
        oldValue: serializeValue(old),
        newValue: serializeValue(value),
      })
    } else if (target.type === 'MemberExpression') {
      this._memberSet(target, value, env)
    } else if (target.type === 'ArrayPattern' || target.type === 'ObjectPattern') {
      const pairs = this._destructure(target, value, env, 'assign')
      for (const [n, v] of pairs) {
        try { env.assign(n, v) } catch { env.define(n, v, 'var') }
      }
    }
    return value
  }

  _evalConditional(node, env) {
    const test = this._evalExpr(node.test, env)
    this._emit(EventType.CONDITIONAL_BRANCH, node, env, {
      condition: this._nodeSource(node.test), result: !!test,
      branch: test ? 'consequent' : 'alternate',
    })
    return test ? this._evalExpr(node.consequent, env) : this._evalExpr(node.alternate, env)
  }

  _evalSequence(node, env) {
    let result
    for (const expr of node.expressions) result = this._evalExpr(expr, env)
    return result
  }

  _evalChain(node, env) {
    try { return this._evalExpr(node.expression, env) }
    catch { return undefined }
  }

  // ── Member expressions ─────────────────────────────────────────────────────

  _evalMember(node, env) {
    const obj  = this._evalExpr(node.object, env)
    if (node.optional && (obj === null || obj === undefined)) return undefined

    const prop = node.computed
      ? String(this._evalExpr(node.property, env))
      : node.property.name

    if (isRef(obj)) {
      const heapVal = this.heap.get(obj, prop)
      // If not found on heap, check built-in array/object methods
      if (heapVal !== undefined) return heapVal
      return this._primitiveGet(obj, prop)
    }

    // Native module objects (console, Math, Number, String, Array, Object, etc.)
    if (obj !== null && obj !== undefined && typeof obj === 'object') {
      const val = obj[prop]
      if (val !== undefined) return val
    }

    // Primitive method calls (string, number via native wrappers)
    if (obj !== null && obj !== undefined) return this._primitiveGet(obj, prop)
    throw new TypeError(`Cannot read property '${prop}' of ${obj}`)
  }

  _memberSet(node, value, env) {
    const obj  = this._evalExpr(node.object, env)
    const prop = node.computed
      ? String(this._evalExpr(node.property, env))
      : node.property.name

    if (isRef(obj)) {
      const old = this.heap.get(obj, prop)
      this.heap.set(obj, prop, value)
      this._emit(EventType.OBJECT_MUTATE, node, env, {
        objectId: obj.objectId, property: prop,
        oldValue: serializeValue(old), newValue: serializeValue(value),
      })
    } else {
      throw new TypeError(`Cannot set property '${prop}' on ${typeof obj}`)
    }
    return value
  }

  // ── Object / Array literals ────────────────────────────────────────────────

  _evalObject(node, env) {
    const ref = this.heap.allocate('Object', {})
    this._emit(EventType.OBJECT_CREATE, node, env, {
      objectId: ref.objectId, objectType: 'Object',
    })

    for (const prop of node.properties) {
      if (prop.type === 'SpreadElement') {
        const src = this._evalExpr(prop.argument, env)
        if (isRef(src)) {
          for (const k of this.heap.ownKeys(src)) {
            const v = this.heap.get(src, k)
            this.heap.set(ref, k, v)
          }
        }
        continue
      }
      const key = prop.computed
        ? String(this._evalExpr(prop.key, env))
        : prop.key.name ?? prop.key.value ?? String(prop.key.value)
      const val = prop.shorthand ? env.lookup(key) : this._evalExpr(prop.value, env)
      this.heap.set(ref, key, val)
    }
    return ref
  }

  _evalArray(node, env) {
    const ref = this.heap.allocate('Array', { length: 0 })
    this._emit(EventType.OBJECT_CREATE, node, env, {
      objectId: ref.objectId, objectType: 'Array',
    })

    let idx = 0
    for (const el of node.elements) {
      if (!el) { idx++; continue }
      if (el.type === 'SpreadElement') {
        const src = this._evalExpr(el.argument, env)
        for (const item of this._toIterable(src)) {
          this.heap.set(ref, String(idx++), item)
        }
      } else {
        this.heap.set(ref, String(idx++), this._evalExpr(el, env))
      }
    }
    this.heap.set(ref, 'length', idx)
    return ref
  }

  // ── Function calls ─────────────────────────────────────────────────────────

  _evalCall(node, env) {
    // Optional chaining short-circuit
    if (node.optional) {
      const callee = (() => { try { return this._evalExpr(node.callee, env) } catch { return undefined } })()
      if (callee === null || callee === undefined) return undefined
    }

    let fn, thisVal

    if (node.callee.type === 'MemberExpression') {
      thisVal = this._evalExpr(node.callee.object, env)
      const prop = node.callee.computed
        ? String(this._evalExpr(node.callee.property, env))
        : node.callee.property.name
      if (isRef(thisVal)) {
        fn = this.heap.get(thisVal, prop)
        if (fn === undefined) fn = this._primitiveGet(thisVal, prop)
      } else if (typeof thisVal === 'object' && thisVal !== null) {
        fn = thisVal[prop] ?? this._primitiveGet(thisVal, prop)
      } else {
        fn = this._primitiveGet(thisVal, prop)
      }
    } else {
      fn = this._evalExpr(node.callee, env)
      thisVal = null
    }

    const args = this._evalArgs(node.arguments, env)
    return this._apply(fn, args, thisVal, node, env)
  }

  _evalNew(node, env) {
    const cls  = this._evalExpr(node.callee, env)
    const args = this._evalArgs(node.arguments, env)
    return this._construct(cls, args, node, env)
  }

  _evalArgs(argNodes, env) {
    const args = []
    for (const a of argNodes) {
      if (a.type === 'SpreadElement') {
        for (const item of this._toIterable(this._evalExpr(a.argument, env))) args.push(item)
      } else {
        args.push(this._evalExpr(a, env))
      }
    }
    return args
  }

  _apply(fn, args, thisVal, callNode, callerEnv) {
    if (!fn) throw new TypeError(`${this._nodeSource(callNode?.callee)} is not a function`)

    if (fn?.__kind === 'native') {
      const name = fn.name ?? '(native)'
      this._emit(EventType.FUNCTION_CALL, callNode, callerEnv, {
        functionName: name, args: args.map(serializeValue), native: true,
      })
      const result = fn.fn(thisVal, args, this)
      this._emit(EventType.FUNCTION_RETURN, callNode, callerEnv, {
        functionName: name, returnValue: serializeValue(result),
      })
      return result
    }

    if (fn?.__kind === 'class') return this._construct(fn, args, callNode, callerEnv)

    if (fn?.__kind !== 'function') throw new TypeError(`Value is not a function`)

    const { node: fnNode, closure, name } = fn
    const fnName = name ?? fnNode.id?.name ?? '(anonymous)'

    // Build function scope
    const fnEnv = closure.extend('function')
    fnEnv.name = 'function'

    // Bind `this`
    if (fnNode.type !== 'ArrowFunctionExpression') {
      fnEnv.define('this', thisVal ?? undefined, 'const')
    }

    // Bind parameters
    this._bindParams(fnNode.params, args, fnEnv)

    // Hoist vars/functions inside the function body
    if (fnNode.body.type === 'BlockStatement') {
      this._hoistDeclarations(fnNode.body.body, fnEnv)
    }

    this.callStack.push({ name: fnName, env: fnEnv, line: callNode?.loc?.start?.line })
    this._emit(EventType.FUNCTION_CALL, callNode, callerEnv, {
      functionName: fnName,
      args: args.map(serializeValue),
    })
    this._emit(EventType.SCOPE_ENTER, fnNode, fnEnv, { scopeId: fnEnv.id })

    let result
    if (fnNode.body.type !== 'BlockStatement') {
      // Arrow function with expression body
      result = this._evalExpr(fnNode.body, fnEnv)
    } else {
      result = this._evalBody(fnNode.body.body, fnEnv)
    }

    const returnValue = result instanceof ReturnSignal
      ? result.value
      : fnNode.body.type !== 'BlockStatement'
        ? result   // expression-body arrow: result is the return value directly
        : undefined
    this._emit(EventType.SCOPE_EXIT, fnNode, fnEnv, { scopeId: fnEnv.id })
    this.callStack.pop()
    this._emit(EventType.FUNCTION_RETURN, callNode, callerEnv, {
      functionName: fnName, returnValue: serializeValue(returnValue),
    })

    if (result instanceof ThrowSignal) return result
    return returnValue
  }

  _construct(cls, args, callNode, callerEnv) {
    if (cls?.__kind !== 'class') throw new TypeError(`${cls?.name ?? 'Value'} is not a constructor`)

    const instance = this.heap.allocate(cls.name, {}, cls.__protoId)
    this._emit(EventType.OBJECT_CREATE, callNode, callerEnv, {
      objectId: instance.objectId, objectType: cls.name,
    })

    // Find and call constructor
    const ctorFn = this.heap.get(cls.protoRef, 'constructor')
    if (ctorFn?.__kind === 'function') {
      const { node: fnNode, closure } = ctorFn
      const fnEnv = closure.extend('function')
      fnEnv.name = 'function'
      fnEnv.define('this', instance, 'const')

      // Support super()
      if (cls.superCls) {
        fnEnv.define('__super__', cls.superCls, 'const')
      }

      this._bindParams(fnNode.params, args, fnEnv)
      this._hoistDeclarations(fnNode.body.body, fnEnv)
      this.callStack.push({ name: `new ${cls.name}`, env: fnEnv })
      this._emit(EventType.FUNCTION_CALL, callNode, callerEnv, {
        functionName: `new ${cls.name}`, args: args.map(serializeValue),
      })
      this._evalBody(fnNode.body.body, fnEnv)
      this.callStack.pop()
      this._emit(EventType.FUNCTION_RETURN, callNode, callerEnv, {
        functionName: `new ${cls.name}`, returnValue: serializeValue(instance),
      })
    }

    return instance
  }

  _bindParams(params, args, env) {
    let argIdx = 0
    for (const param of params) {
      if (param.type === 'RestElement') {
        const rest = args.slice(argIdx)
        const ref  = this.heap.allocate('Array', { length: rest.length })
        rest.forEach((v, i) => this.heap.set(ref, String(i), v))
        env.define(param.argument.name, ref, 'let')
        break
      }
      const val = args[argIdx] !== undefined
        ? args[argIdx]
        : (param.type === 'AssignmentPattern' ? this._evalExpr(param.right, env) : undefined)
      const name = param.type === 'AssignmentPattern' ? param.left.name
        : param.type === 'Identifier' ? param.name : null
      if (name) env.define(name, val, 'let')
      argIdx++
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _makeFunction(node, env, name) {
    return {
      __kind:  'function',
      name:    name ?? node.id?.name ?? null,
      node,
      closure: env,
    }
  }

  _destructure(pattern, value, env, kind) {
    const pairs = []
    if (pattern.type === 'Identifier') {
      pairs.push([pattern.name, value])
    } else if (pattern.type === 'ArrayPattern') {
      const items = this._toIterable(value)
      pattern.elements.forEach((el, i) => {
        if (!el) return
        if (el.type === 'RestElement') {
          const rest = items.slice(i)
          const ref  = this.heap.allocate('Array', { length: rest.length })
          rest.forEach((v, j) => this.heap.set(ref, String(j), v))
          pairs.push([el.argument.name, ref])
        } else if (el.type === 'AssignmentPattern') {
          const v = items[i] !== undefined ? items[i] : this._evalExpr(el.right, env)
          pairs.push(...this._destructure(el.left, v, env, kind))
        } else {
          pairs.push(...this._destructure(el, items[i], env, kind))
        }
      })
    } else if (pattern.type === 'ObjectPattern') {
      for (const prop of pattern.properties) {
        if (prop.type === 'RestElement') {
          const used = new Set(pattern.properties.filter(p => p.type !== 'RestElement').map(p => p.key.name))
          const rest = this.heap.allocate('Object', {})
          if (isRef(value)) {
            for (const k of this.heap.ownKeys(value)) {
              if (!used.has(k)) this.heap.set(rest, k, this.heap.get(value, k))
            }
          }
          pairs.push([prop.argument.name, rest])
        } else {
          const key = prop.computed ? this._evalExpr(prop.key, env) : prop.key.name ?? prop.key.value
          const v   = isRef(value) ? this.heap.get(value, String(key)) : value?.[key]
          const actual = (v === undefined && prop.value?.type === 'AssignmentPattern')
            ? this._evalExpr(prop.value.right, env) : v
          pairs.push(...this._destructure(prop.value?.type === 'AssignmentPattern' ? prop.value.left : (prop.value ?? prop.key), actual, env, kind))
        }
      }
    }
    return pairs
  }

  _assignLoopVar(node, value, env) {
    if (node.type === 'VariableDeclaration') {
      const pairs = this._destructure(node.declarations[0].id, value, env, node.kind)
      for (const [n, v] of pairs) {
        if (node.kind === 'var') env.functionScope().define(n, v, 'var')
        else env.define(n, v, node.kind)
      }
    } else {
      this._doAssign(node, value, env)
    }
  }

  _toIterable(value) {
    if (isRef(value)) {
      const len = this.heap.get(value, 'length')
      if (len !== undefined) {
        const items = []
        for (let i = 0; i < len; i++) items.push(this.heap.get(value, String(i)))
        return items
      }
      return this.heap.ownKeys(value).map(k => this.heap.get(value, k))
    }
    if (typeof value === 'string') return [...value]
    if (value?.[Symbol.iterator]) return [...value]
    return []
  }

  // Primitive property access (strings, numbers, arrays).
  _primitiveGet(value, prop) {
    if (typeof value === 'string') {
      if (prop === 'length') return value.length
      if (prop === 'split')  return { __kind: 'native', name: 'String.split', fn: (t, [sep]) => {
        const parts = t.split(sep ?? '')
        const ref   = this.heap.allocate('Array', { length: 0 })
        parts.forEach((p, i) => this.heap.set(ref, String(i), p))
        this.heap.set(ref, 'length', parts.length)
        return ref
      }}
      if (prop === 'includes') return { __kind: 'native', name: 'String.includes', fn: (t, [s]) => t.includes(s) }
      if (prop === 'indexOf')  return { __kind: 'native', name: 'String.indexOf',  fn: (t, [s]) => t.indexOf(s) }
      if (prop === 'slice')    return { __kind: 'native', name: 'String.slice',    fn: (t, [s, e]) => t.slice(s, e) }
      if (prop === 'toUpperCase') return { __kind: 'native', name: 'String.toUpperCase', fn: (t) => t.toUpperCase() }
      if (prop === 'toLowerCase') return { __kind: 'native', name: 'String.toLowerCase', fn: (t) => t.toLowerCase() }
      if (prop === 'trim')     return { __kind: 'native', name: 'String.trim',     fn: (t) => t.trim() }
      if (prop === 'charAt')   return { __kind: 'native', name: 'String.charAt',   fn: (t, [i]) => t.charAt(i) }
      if (prop === 'charCodeAt') return { __kind: 'native', name: 'String.charCodeAt', fn: (t, [i]) => t.charCodeAt(i) }
      if (!isNaN(prop))        return value[prop]
      return undefined
    }
    if (isRef(value)) {
      if (prop === 'length') return this.heap.get(value, 'length')
      if (prop === 'push')    return this._arrayMethod('push', value)
      if (prop === 'pop')     return this._arrayMethod('pop', value)
      if (prop === 'shift')   return this._arrayMethod('shift', value)
      if (prop === 'unshift') return this._arrayMethod('unshift', value)
      if (prop === 'map')     return this._arrayMethod('map', value)
      if (prop === 'filter')  return this._arrayMethod('filter', value)
      if (prop === 'reduce')  return this._arrayMethod('reduce', value)
      if (prop === 'forEach') return this._arrayMethod('forEach', value)
      if (prop === 'find')    return this._arrayMethod('find', value)
      if (prop === 'findIndex') return this._arrayMethod('findIndex', value)
      if (prop === 'some')    return this._arrayMethod('some', value)
      if (prop === 'every')   return this._arrayMethod('every', value)
      if (prop === 'includes') return this._arrayMethod('includes', value)
      if (prop === 'indexOf') return this._arrayMethod('indexOf', value)
      if (prop === 'join')    return this._arrayMethod('join', value)
      if (prop === 'slice')   return this._arrayMethod('slice', value)
      if (prop === 'splice')  return this._arrayMethod('splice', value)
      if (prop === 'sort')    return this._arrayMethod('sort', value)
      if (prop === 'reverse') return this._arrayMethod('reverse', value)
      if (prop === 'flat')    return this._arrayMethod('flat', value)
      if (prop === 'flatMap') return this._arrayMethod('flatMap', value)
      if (prop === 'concat')  return this._arrayMethod('concat', value)
      if (prop === 'fill')    return this._arrayMethod('fill', value)
      if (prop === 'keys')    return this._arrayMethod('keys', value)
      if (prop === 'values')  return this._arrayMethod('values', value)
      if (prop === 'entries') return this._arrayMethod('entries', value)
      if (prop === 'toString') return { __kind: 'native', name: 'Array.toString', fn: (t) => this._toIterable(t).join(',') }
    }
    return undefined
  }

  _arrayMethod(name, arrRef) {
    return {
      __kind: 'native', name: `Array.${name}`,
      fn: (t, args, interp) => {
        const items = () => {
          const len = this.heap.get(arrRef, 'length') ?? 0
          const arr = []
          for (let i = 0; i < len; i++) arr.push(this.heap.get(arrRef, String(i)))
          return arr
        }
        const setItems = (arr) => {
          const old = this.heap.get(arrRef, 'length') ?? 0
          for (let i = 0; i < Math.max(old, arr.length); i++) {
            if (i < arr.length) this.heap.set(arrRef, String(i), arr[i])
            else this.heap.objects.get(arrRef.objectId)?.properties.delete(String(i))
          }
          this.heap.set(arrRef, 'length', arr.length)
        }
        const mkArr = (arr) => {
          const ref = this.heap.allocate('Array', { length: arr.length })
          arr.forEach((v, i) => this.heap.set(ref, String(i), v))
          return ref
        }
        const callCb = (cb, cbArgs) => {
          if (cb?.__kind === 'function' || cb?.__kind === 'native') return interp._apply(cb, cbArgs, null, null, new Environment(null))
          return undefined
        }
        const cur = items()

        switch (name) {
          case 'push': {
            const newItems = [...cur, ...args]
            setItems(newItems)
            return newItems.length
          }
          case 'pop': {
            const v = cur.pop(); setItems(cur); return v
          }
          case 'shift': {
            const v = cur.shift(); setItems(cur); return v
          }
          case 'unshift': {
            const newItems = [...args, ...cur]; setItems(newItems); return newItems.length
          }
          case 'map':    return mkArr(cur.map((v, i) => callCb(args[0], [v, i, arrRef])))
          case 'filter': return mkArr(cur.filter((v, i) => callCb(args[0], [v, i, arrRef])))
          case 'reduce': {
            let acc = args.length > 1 ? args[1] : cur[0]
            const start = args.length > 1 ? 0 : 1
            for (let i = start; i < cur.length; i++) acc = callCb(args[0], [acc, cur[i], i, arrRef])
            return acc
          }
          case 'forEach': cur.forEach((v, i) => callCb(args[0], [v, i, arrRef])); return undefined
          case 'find':    return cur.find((v, i) => callCb(args[0], [v, i, arrRef]))
          case 'findIndex': return cur.findIndex((v, i) => callCb(args[0], [v, i, arrRef]))
          case 'some':    return cur.some((v, i) => callCb(args[0], [v, i, arrRef]))
          case 'every':   return cur.every((v, i) => callCb(args[0], [v, i, arrRef]))
          case 'includes': return cur.includes(args[0])
          case 'indexOf':  return cur.indexOf(args[0])
          case 'join':     return cur.map(v => v == null ? '' : String(v)).join(args[0] ?? ',')
          case 'slice':    return mkArr(cur.slice(args[0], args[1]))
          case 'splice': {
            const spliced = cur.splice(args[0], args[1] ?? cur.length, ...args.slice(2))
            setItems(cur)
            return mkArr(spliced)
          }
          case 'sort': {
            const sorted = args[0]
              ? cur.sort((a, b) => callCb(args[0], [a, b]))
              : cur.sort()
            setItems(sorted); return arrRef
          }
          case 'reverse': { cur.reverse(); setItems(cur); return arrRef }
          case 'concat':  return mkArr([...cur, ...args.flatMap(a => isRef(a) ? items.call({heap: this.heap, arrRef: a}) : [a])])
          case 'fill': {
            const filled = cur.fill(args[0], args[1], args[2])
            setItems(filled); return arrRef
          }
          case 'flat': {
            const depth = args[0] ?? 1
            const flat = (arr, d) => d > 0 ? arr.flatMap(v => isRef(v) ? flat(this._toIterable(v), d - 1) : [v]) : arr
            return mkArr(flat(cur, depth))
          }
          case 'keys':    return this._toIterator([...cur.keys()])
          case 'values':  return this._toIterator(cur)
          case 'entries': return this._toIterator(cur.map((v, i) => mkArr([i, v])))
          default:        return undefined
        }
      },
    }
  }

  _toIterator(items) {
    let i = 0
    return {
      __kind: 'native', name: 'Iterator',
      fn: () => ({ done: i >= items.length, value: items[i++] }),
      [Symbol.iterator]() { return { next: this.fn } },
    }
  }

  // ── Globals ────────────────────────────────────────────────────────────────

  _installGlobals(env) {
    const self = this

    env.define('undefined', undefined, 'const')
    env.define('null',      null,      'const')
    env.define('true',      true,      'const')
    env.define('false',     false,     'const')
    env.define('Infinity',  Infinity,  'const')
    env.define('NaN',       NaN,       'const')

    env.define('console', { __kind: 'native', name: 'console', fn: null }, 'const')

    const native = (name, fn) => ({ __kind: 'native', name, fn })

    env.define('console', {
      __kind: 'native', name: 'console',
      log:   native('console.log',   (_, args) => { const line = args.map(a => self._display(a)).join(' '); self.output.push(line); return undefined }),
      warn:  native('console.warn',  (_, args) => { const line = args.map(a => self._display(a)).join(' '); self.output.push('[warn] ' + line); return undefined }),
      error: native('console.error', (_, args) => { const line = args.map(a => self._display(a)).join(' '); self.output.push('[error] ' + line); return undefined }),
    }, 'const')

    // Override MemberExpression lookup for console.log etc.
    env.define('__console_log__', native('console.log', (_, args) => {
      const line = args.map(a => self._display(a)).join(' ')
      self.output.push(line)
      return undefined
    }), 'const')

    env.define('Math', {
      __kind: 'native', name: 'Math',
      abs:   native('Math.abs',   (_, [x]) => Math.abs(x)),
      ceil:  native('Math.ceil',  (_, [x]) => Math.ceil(x)),
      floor: native('Math.floor', (_, [x]) => Math.floor(x)),
      round: native('Math.round', (_, [x]) => Math.round(x)),
      sqrt:  native('Math.sqrt',  (_, [x]) => Math.sqrt(x)),
      pow:   native('Math.pow',   (_, [x, y]) => Math.pow(x, y)),
      max:   native('Math.max',   (_, args) => Math.max(...args)),
      min:   native('Math.min',   (_, args) => Math.min(...args)),
      log:   native('Math.log',   (_, [x]) => Math.log(x)),
      log2:  native('Math.log2',  (_, [x]) => Math.log2(x)),
      random: native('Math.random', () => Math.random()),
      PI:    Math.PI,
      E:     Math.E,
    }, 'const')

    env.define('Number', {
      __kind: 'native', name: 'Number',
      isInteger:  native('Number.isInteger',  (_, [x]) => Number.isInteger(x)),
      isFinite:   native('Number.isFinite',   (_, [x]) => Number.isFinite(x)),
      isNaN:      native('Number.isNaN',      (_, [x]) => Number.isNaN(x)),
      parseInt:   native('Number.parseInt',   (_, [x, r]) => parseInt(x, r)),
      parseFloat: native('Number.parseFloat', (_, [x]) => parseFloat(x)),
      MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
      MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
    }, 'const')

    env.define('String', {
      __kind: 'native', name: 'String',
      fromCharCode: native('String.fromCharCode', (_, args) => String.fromCharCode(...args)),
    }, 'const')

    env.define('Array', {
      __kind: 'native', name: 'Array',
      isArray: native('Array.isArray', (_, [x]) => isRef(x) && self.heap.objects.get(x.objectId)?.type === 'Array'),
      from:    native('Array.from',    (_, [x]) => {
        const items = self._toIterable(x)
        const ref = self.heap.allocate('Array', { length: items.length })
        items.forEach((v, i) => self.heap.set(ref, String(i), v))
        return ref
      }),
      of:      native('Array.of',      (_, args) => {
        const ref = self.heap.allocate('Array', { length: args.length })
        args.forEach((v, i) => self.heap.set(ref, String(i), v))
        return ref
      }),
    }, 'const')

    env.define('Object', {
      __kind: 'native', name: 'Object',
      keys:    native('Object.keys',    (_, [r]) => { const ref = self.heap.allocate('Array', {}); const ks = isRef(r) ? self.heap.ownKeys(r) : Object.keys(r ?? {}); ks.forEach((k, i) => self.heap.set(ref, String(i), k)); self.heap.set(ref, 'length', ks.length); return ref }),
      values:  native('Object.values',  (_, [r]) => { const ref = self.heap.allocate('Array', {}); const vs = isRef(r) ? self.heap.ownKeys(r).map(k => self.heap.get(r, k)) : Object.values(r ?? {}); vs.forEach((v, i) => self.heap.set(ref, String(i), v)); self.heap.set(ref, 'length', vs.length); return ref }),
      assign:  native('Object.assign',  (_, [target, ...srcs]) => { for (const s of srcs) { if (isRef(s)) self.heap.ownKeys(s).forEach(k => self.heap.set(target, k, self.heap.get(s, k))) } return target }),
      entries: native('Object.entries', (_, [r]) => { const ref = self.heap.allocate('Array', {}); const entries = isRef(r) ? self.heap.ownKeys(r).map(k => [k, self.heap.get(r, k)]) : Object.entries(r ?? {}); entries.forEach(([k, v], i) => { const pair = self.heap.allocate('Array', { '0': k, '1': v, length: 2 }); self.heap.set(ref, String(i), pair) }); self.heap.set(ref, 'length', entries.length); return ref }),
      freeze:  native('Object.freeze',  (_, [r]) => r),
      create:  native('Object.create',  (_, [proto]) => self.heap.allocate('Object', {}, isRef(proto) ? proto.objectId : null)),
    }, 'const')

    env.define('parseInt',   native('parseInt',   (_, [x, r]) => parseInt(x, r)), 'const')
    env.define('parseFloat', native('parseFloat', (_, [x]) => parseFloat(x)), 'const')
    env.define('isNaN',      native('isNaN',      (_, [x]) => isNaN(x)), 'const')
    env.define('isFinite',   native('isFinite',   (_, [x]) => isFinite(x)), 'const')
    env.define('String',     env.lookup('String'), 'const')
    env.define('typeof',     undefined, 'const')

    // Make Map and Set available as native wrappers
    env.define('Map', {
      __kind: 'class', name: 'Map', __protoId: null, protoRef: null, superCls: null,
      staticMethods: {},
      __construct: native('new Map', (_, args, interp) => {
        const ref = self.heap.allocate('Map', {})
        self.heap.set(ref, '__mapData__', self.heap.allocate('Array', { length: 0 }))
        self.heap.set(ref, 'size', 0)
        self._installMapMethods(ref)
        return ref
      }),
    }, 'const')

    env.define('Set', {
      __kind: 'class', name: 'Set', __protoId: null, protoRef: null, superCls: null,
      staticMethods: {},
      __construct: native('new Set', (_, args, interp) => {
        const ref = self.heap.allocate('Set', {})
        self._installSetMethods(ref)
        return ref
      }),
    }, 'const')
  }

  _installMapMethods(ref) {
    const self = this
    const store = new Map() // JS-side storage for this Map instance
    const native = (name, fn) => ({ __kind: 'native', name, fn })
    this.heap.set(ref, 'set',     native('Map.set',     (_, [k, v]) => { store.set(k, v); self.heap.set(ref, 'size', store.size); return ref }))
    this.heap.set(ref, 'get',     native('Map.get',     (_, [k])    => store.get(k)))
    this.heap.set(ref, 'has',     native('Map.has',     (_, [k])    => store.has(k)))
    this.heap.set(ref, 'delete',  native('Map.delete',  (_, [k])    => { const r = store.delete(k); self.heap.set(ref, 'size', store.size); return r }))
    this.heap.set(ref, 'clear',   native('Map.clear',   () => { store.clear(); self.heap.set(ref, 'size', 0) }))
    this.heap.set(ref, 'keys',    native('Map.keys',    () => self._toIterator([...store.keys()])))
    this.heap.set(ref, 'values',  native('Map.values',  () => self._toIterator([...store.values()])))
    this.heap.set(ref, 'entries', native('Map.entries', () => self._toIterator([...store.entries()].map(([k,v]) => { const p = self.heap.allocate('Array', {'0':k,'1':v,length:2}); return p }))))
    this.heap.set(ref, 'forEach', native('Map.forEach', (_, [cb], interp) => { store.forEach((v, k) => interp._apply(cb, [v, k, ref], null, null, new Environment(null))) }))
  }

  _installSetMethods(ref) {
    const self = this
    const store = new Set()
    const native = (name, fn) => ({ __kind: 'native', name, fn })
    this.heap.set(ref, 'add',     native('Set.add',     (_, [v]) => { store.add(v); self.heap.set(ref, 'size', store.size); return ref }))
    this.heap.set(ref, 'has',     native('Set.has',     (_, [v]) => store.has(v)))
    this.heap.set(ref, 'delete',  native('Set.delete',  (_, [v]) => { const r = store.delete(v); self.heap.set(ref, 'size', store.size); return r }))
    this.heap.set(ref, 'clear',   native('Set.clear',   () => { store.clear(); self.heap.set(ref, 'size', 0) }))
    this.heap.set(ref, 'forEach', native('Set.forEach', (_, [cb], interp) => { store.forEach(v => interp._apply(cb, [v, v, ref], null, null, new Environment(null))) }))
    this.heap.set(ref, 'values',  native('Set.values',  () => self._toIterator([...store.values()])))
    this.heap.set(ref, 'size', store.size)
  }

  _display(v) {
    if (v === null)      return 'null'
    if (v === undefined) return 'undefined'
    if (typeof v !== 'object') return String(v)
    if (v?.__kind === 'function') return `[Function: ${v.name ?? 'anonymous'}]`
    if (v?.__kind === 'class')    return `[class ${v.name}]`
    if (v?.__kind === 'native')   return `[native ${v.name}]`
    if (isRef(v)) {
      const obj = this.heap.objects.get(v.objectId)
      if (!obj) return '[Object]'
      if (obj.type === 'Array') {
        const len = obj.properties.get('length') ?? 0
        const items = []
        for (let i = 0; i < len; i++) items.push(this._display(obj.properties.get(String(i))))
        return `[ ${items.join(', ')} ]`
      }
      const pairs = []
      for (const [k, val] of obj.properties) {
        if (k === '__mapData__') continue
        pairs.push(`${k}: ${this._display(val)}`)
      }
      return `{ ${pairs.join(', ')} }`
    }
    return String(v)
  }

  // ── Event emission ─────────────────────────────────────────────────────────

  _emit(type, node, env, payload = {}) {
    const loc = node?.loc?.start
      ? { line: node.loc.start.line, column: node.loc.start.column, astNodeId: node.start ?? null }
      : null

    const stackSnapshot = this.callStack.map(f => ({
      name: f.name,
      line: f.line ?? null,
      locals: f.env?.snapshot() ?? {},
    }))

    const heapDelta = this.heap.drainDeltas()

    this.events.push(makeEvent(type, this.stepId, loc, stackSnapshot, heapDelta, payload))
  }

  _nodeSource(node) {
    if (!node) return ''
    return this.source.slice(node.start, node.end) ?? ''
  }
}

// Handle __value synthetic nodes from compound assignment
const _origEvalExpr = Interpreter.prototype._evalExpr
Interpreter.prototype._evalExpr = function(node, env) {
  if (node?.type === '__value') return node._v
  return _origEvalExpr.call(this, node, env)
}
