# SE Masterclass — LAB-83 — Tree-Walking Interpreter

**Prerequisites:** LAB-82 (Recursive Descent Parser)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What does "tree-walking" mean, mechanically — what is the interpreter actually doing as it runs?
2. Why does a variable environment need a reference to its *parent* environment, not just its own variables?
3. What makes a closure "close over" a variable, rather than just reading its value once?

## What You Will Build

A full interpreter that runs Nano programs directly from the AST — no compilation step — including functions, recursion, and closures that correctly capture variables from their defining scope.

```
function makeCounter() {
  let count = 0;
  function increment() {
    count = count + 1;
    return count;
  }
  return increment;
}
let counter = makeCounter();
counter();  // 1
counter();  // 2
counter();  // 3  -- each call sees the SAME count, not a fresh one
```

## Concept: Tree-Walking Interpretation

**What it is:** A tree-walking interpreter executes a program by recursively visiting AST nodes and directly producing their effect or value as it goes — no intermediate representation, no compilation. `evaluate(node)` for a `BinaryExpression` evaluates `node.left`, evaluates `node.right`, then applies `node.operator` to the two results, immediately.

**The problem before:** LAB-81 built the AST shape and LAB-82 built the parser that produces it, but neither *does* anything with a Nano program beyond describing its structure. LAB-12 (Phase 1) built a small tree-walking evaluator for arithmetic expressions only; this lab generalizes that same recursive `evaluate` pattern to a full language — statements, variables, control flow, and critically, functions that can be called, passed around, and that remember the scope they were created in.

**The solution:** One `evaluate(node, environment)` function with a `switch (node.type)` — structurally identical to LAB-81's `printAst` and LAB-82's parser dispatch, just producing a runtime value instead of printing or building a tree. `environment` is a chain of variable scopes: looking up a name checks the current scope, then its parent, then its parent's parent, up to the global scope — which is exactly the mechanism that makes closures work, once function values remember which environment they were created in.

**Canonical example:**

```typescript
function evaluate(node: Expression, env: Environment): NanoValue {
  switch (node.type) {
    case "NumberLiteral": return node.value
    case "Identifier": return env.get(node.name)
    case "BinaryExpression": {
      const left = evaluate(node.left, env)
      const right = evaluate(node.right, env)
      return applyOperator(node.operator, left, right)
    }
    // ...
  }
}
```

**Project Application:** LAB-84's bytecode VM does the same job a different way — compile once, then run fast — and this lab's interpreter is the reference implementation both to compare against and to fall back on for any Nano tool that just needs to *run* a program rather than analyze it (LAB-85's template engine, LAB-86's DSL).

**Watch for:** Creating a fresh environment for a function call but forgetting to chain it to the environment the function was *defined* in (not the one it's *called* from) — this is the single mistake that breaks closures, and it's subtle because most test cases (calling a function right where it's defined) don't expose it.

## Step 1: The Environment — a chain of scopes

```typescript
type NanoValue = number | string | boolean | NanoFunction | null

interface NanoFunction {
  declaration: FunctionDeclaration
  closure: Environment // the environment active when this function was DEFINED
}

class Environment {
  private values = new Map<string, NanoValue>()

  constructor(private parent: Environment | null = null) {}

  define(name: string, value: NanoValue): void {
    this.values.set(name, value)
  }

  get(name: string): NanoValue {
    if (this.values.has(name)) return this.values.get(name)!
    if (this.parent) return this.parent.get(name)
    throw new Error(`Undefined variable '${name}'`)
  }

  assign(name: string, value: NanoValue): void {
    if (this.values.has(name)) { this.values.set(name, value); return }
    if (this.parent) { this.parent.assign(name, value); return }
    throw new Error(`Undefined variable '${name}'`)
  }
}
```

`get` and `assign` both walk up the `parent` chain when a name isn't found locally — this is the scope-chasing lookup that lets an inner block reference an outer variable. `define` never looks at the parent; declaring `let x` always creates a *new* binding in the current scope, even if an outer scope already has an `x` — this is how shadowing works.

### SAVE AND TRY

```typescript
const outer = new Environment()
outer.define("x", 10)
const inner = new Environment(outer)
console.log(inner.get("x")) // 10 -- found via parent chain
inner.define("x", 20)
console.log(inner.get("x")) // 20 -- inner's own binding
console.log(outer.get("x")) // 10 -- outer's binding untouched by inner's shadow
```

## Step 2: Evaluating expressions

```typescript
function evaluate(node: Expression, env: Environment): NanoValue {
  switch (node.type) {
    case "NumberLiteral": return node.value
    case "StringLiteral": return node.value
    case "BooleanLiteral": return node.value
    case "Identifier": return env.get(node.name)

    case "BinaryExpression": {
      const left = evaluate(node.left, env)
      const right = evaluate(node.right, env)
      return applyBinaryOperator(node.operator, left, right)
    }

    case "UnaryExpression": {
      const operand = evaluate(node.operand, env)
      if (node.operator === "-") return -(operand as number)
      throw new Error(`Unknown unary operator ${node.operator}`)
    }

    case "AssignmentExpression": {
      const value = evaluate(node.value, env)
      env.assign(node.name, value)
      return value
    }

    case "CallExpression":
      return evaluateCall(node, env)
  }
}

function applyBinaryOperator(op: string, left: NanoValue, right: NanoValue): NanoValue {
  switch (op) {
    case "+": return (left as any) + (right as any) // supports both number+number and string+string
    case "-": return (left as number) - (right as number)
    case "*": return (left as number) * (right as number)
    case "/": return (left as number) / (right as number)
    case "==": return left === right
    case "!=": return left !== right
    case "<": return (left as number) < (right as number)
    case "<=": return (left as number) <= (right as number)
    case ">": return (left as number) > (right as number)
    case ">=": return (left as number) >= (right as number)
    default: throw new Error(`Unknown operator ${op}`)
  }
}
```

This `switch (node.type)` is structurally the same as LAB-81's `printAst` and LAB-82's parsing dispatch — the third time this curriculum uses "one case per AST node kind" for a completely different purpose (printing, parsing, now evaluating), which is exactly why AST shape and traversal logic being separate (LAB-81's whole point) pays off: the tree didn't need to change at all for this new consumer.

### SAVE AND TRY

```typescript
const tokens = new Lexer("2 + 3 * 4").tokenize()
const ast = new Parser(tokens).parseExpression()
console.log(evaluate(ast, new Environment())) // 14 -- precedence from LAB-82 correctly respected
```

## Step 3: Executing statements — control flow

```typescript
function execute(node: Statement, env: Environment): NanoValue | ReturnSignal {
  switch (node.type) {
    case "LetStatement":
      env.define(node.name, evaluate(node.initializer, env))
      return null

    case "ExpressionStatement":
      evaluate(node.expression, env)
      return null

    case "IfStatement":
      if (evaluate(node.condition, env)) return execute(node.thenBranch, env)
      else if (node.elseBranch) return execute(node.elseBranch, env)
      return null

    case "WhileStatement":
      while (evaluate(node.condition, env)) {
        const result = execute(node.body, env)
        if (result instanceof ReturnSignal) return result // propagate return out of the loop
      }
      return null

    case "BlockStatement": {
      const blockEnv = new Environment(env) // new scope for the block
      for (const stmt of node.statements) {
        const result = execute(stmt, blockEnv)
        if (result instanceof ReturnSignal) return result
      }
      return null
    }

    case "FunctionDeclaration":
      env.define(node.name, { declaration: node, closure: env } as NanoFunction)
      return null

    case "ReturnStatement":
      return new ReturnSignal(node.value ? evaluate(node.value, env) : null)
  }
}

class ReturnSignal {
  constructor(public value: NanoValue) {}
}
```

`ReturnSignal` is how `return` escapes an arbitrary depth of nested blocks and loops without every caller needing special-case logic — `execute` on a block or loop checks "did executing this statement produce a `ReturnSignal`?" and if so, immediately stops and re-propagates it upward, unwinding exactly like a real call stack unwinding on `return`. `FunctionDeclaration`'s handler is the critical line for Step 4: `closure: env` captures *this* environment — the one active at the point the function was declared — inside the function value itself.

### SAVE AND TRY

```typescript
const source = `
  let total = 0;
  let i = 0;
  while (i < 5) {
    total = total + i;
    i = i + 1;
  }
`
const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
const env = new Environment()
for (const stmt of ast.statements) execute(stmt, env)
console.log(env.get("total")) // 10 -- 0+1+2+3+4
```

## Step 4: Function calls and closures

```typescript
function evaluateCall(node: CallExpression, env: Environment): NanoValue {
  const callee = evaluate(node.callee, env)
  if (typeof callee !== "object" || callee === null || !("declaration" in callee)) {
    throw new Error("Attempted to call a non-function")
  }
  const fn = callee as NanoFunction
  const args = node.args.map(arg => evaluate(arg, env))

  // The call's environment chains to the function's CLOSURE, not the caller's env.
  const callEnv = new Environment(fn.closure)
  fn.declaration.params.forEach((param, i) => callEnv.define(param, args[i] ?? null))

  const result = execute(fn.declaration.body, callEnv)
  return result instanceof ReturnSignal ? result.value : null
}
```

`new Environment(fn.closure)` — not `new Environment(env)` — is the one line that makes closures work. If the call environment chained to the *caller's* environment instead, a function called from a different scope than where it was defined would see the wrong variables, or none at all. Chaining to `fn.closure` guarantees a function always sees the variables that were in scope when *it* was written, regardless of where it's later called from — exactly what "What You Will Build"'s `makeCounter` example depends on: `increment`'s closure is the environment inside `makeCounter` where `count` lives, so every call to the returned `increment` function reads and mutates that same `count`.

### SAVE AND TRY

Run the full `makeCounter` example from "What You Will Build" through `execute`/`evaluateCall`. Confirm three successive calls to the returned function produce `1`, `2`, `3` — not `1`, `1`, `1` (which would mean each call got a fresh, disconnected `count`) and not an "undefined variable" error (which would mean the closure environment wasn't wired up at all).

## 🎯 Challenge

Add short-circuit evaluation for `&&` and `||` (from LAB-82's challenge) directly in `evaluate`'s `BinaryExpression` case — `&&`'s right side must not be evaluated at all if the left side is falsy, and `||`'s right side must not be evaluated if the left side is truthy, since `applyBinaryOperator` as written always evaluates both sides first.

<details>
<summary>Solution</summary>

```typescript
case "BinaryExpression": {
  if (node.operator === "&&") {
    const left = evaluate(node.left, env)
    if (!left) return left // short-circuit: skip evaluating the right side entirely
    return evaluate(node.right, env)
  }
  if (node.operator === "||") {
    const left = evaluate(node.left, env)
    if (left) return left // short-circuit
    return evaluate(node.right, env)
  }
  const left = evaluate(node.left, env)
  const right = evaluate(node.right, env)
  return applyBinaryOperator(node.operator, left, right)
}
```

`&&`/`||` are pulled out of the generic "evaluate both sides then apply" path entirely, because their defining property is that the right side must sometimes never be evaluated at all — important if that right side has a side effect (like `hasPermission() && deleteRecord()`), where the whole point of short-circuiting is to skip `deleteRecord()` when `hasPermission()` is false.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Variable lookup | Check only the current scope | Walk up the `parent` chain until found |
| Function call environment | Chain to the caller's environment | Chain to the function's `closure` (its defining environment) |
| `return` inside a loop | Just `return` from the JS function and hope | Propagate a `ReturnSignal` value up through every `execute` call |
| `let` re-declaring a name | Overwrite the outer binding | Create a new, shadowing binding in the current scope only |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does a function call create a new environment chained to `fn.closure` instead of the caller's environment? | |
| 2 | What problem does `ReturnSignal` solve that a plain JS `return` inside `execute` couldn't? | |
| 3 | Why does `Environment.define` never check the parent chain, while `get` and `assign` do? | |

## Quick Check Answers

1. It recursively evaluates each AST node — for an expression node, computing its value by first evaluating its children and combining their results; for a statement node, performing its effect — directly from the tree, with no separate compiled form in between.
2. So that nested scopes (a block inside a function, a loop inside a block) can still find variables declared in an enclosing scope — without a parent reference, each scope would be an isolated island with no way to reach outer variables.
3. A closure keeps a live reference to the environment active when it was created, and looks up captured variables through that reference every time it runs — so if the variable's value changes after the closure was created, the closure sees the updated value, not a frozen snapshot from creation time.

*Next: [LAB-84 — Bytecode and VMs](LAB-84-bytecode-vm.md)*
