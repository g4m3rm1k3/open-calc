# SE Masterclass — LAB-90 — Static Analyzer

**Prerequisites:** LAB-89 (Formatter)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What does "static" mean in "static analysis" — static compared to what alternative?
2. Why can type inference report an error on code that would run perfectly fine most of the time?
3. What makes "this variable is used before it's assigned" detectable without ever running the program?

## What You Will Build

A static analyzer for Nano combining three checks beyond LAB-88's pattern-matching lint rules: a simple type inferencer that catches type mismatches, dead-code detection after unconditional `return`, and symbol resolution that catches references to undeclared variables — all without executing a single line of the analyzed program.

```
function example() {
  let x = 5;
  let y = "hello";
  let z = x + y;      // type error: number + string
  return z;
  let unreachable = 1; // dead code: after return
}
console.log(missing);  // undeclared symbol: 'missing'
```

## Concept: Static Analysis — Reasoning About Code Without Running It

**What it is:** Static analysis examines a program's source (via its AST) and draws conclusions about its behavior *without executing it* — "static" as opposed to "dynamic" (LAB-83's interpreter, which only discovers a type error by actually hitting that line at runtime). A static analyzer walks the tree once and reports everything it can prove, or soundly suspect, about every code path at once — including paths a single test run might never actually take.

**The problem before:** LAB-88's linter matched surface *patterns* (an `==` here, an empty block there) — useful, but shallow; it never reasoned about what *values* flow through the program. LAB-83's interpreter *does* reason about values, but only for the one execution path it actually runs — a type error on a branch that never executes during testing stays invisible until it does, in production. Static analysis closes that gap: it reasons about *all* paths at once, structurally, the same way a human reading code (without running it) predicts "this will crash" just from looking at it.

**The solution:** Walk the AST maintaining a symbol table (name → inferred type, and whether it's been declared yet) as a form of *simulated* execution — following every branch of every `if`, not just one — combined with reachability analysis (can control flow ever reach this statement at all?) for dead-code detection. None of it runs the actual program; all of it is pattern-matching against the tree's structure, informed by rules about what types combine safely and what code is provably unreachable.

**Canonical example:**

```typescript
type NanoType = "number" | "string" | "boolean" | "unknown"

function inferType(node: Expression, symbols: Map<string, NanoType>): NanoType {
  if (node.type === "NumberLiteral") return "number"
  if (node.type === "BinaryExpression" && node.operator === "+") {
    const left = inferType(node.left, symbols)
    const right = inferType(node.right, symbols)
    return left === right ? left : "unknown" // mismatch signals a probable bug
  }
  return "unknown"
}
```

**Project Application:** LAB-91's code generator uses this same "reason about the AST without running it" instinct in reverse — generating *new* correct code from a schema, rather than checking existing code for errors — the two labs are mirror images of the same static, structure-first reasoning.

**Watch for:** Reporting a type error where the analyzer's inference is genuinely uncertain (`unknown`), rather than only reporting when it can *prove* a mismatch. A static analyzer that's too eager to flag `unknown` cases produces false positives, which — just like LAB-88's fixable/non-fixable distinction — erodes trust in the tool faster than missing a few real bugs would.

## Step 1: A minimal type inferencer

```typescript
type NanoType = "number" | "string" | "boolean" | "unknown"

function inferType(node: Expression, symbols: Map<string, NanoType>): NanoType {
  switch (node.type) {
    case "NumberLiteral": return "number"
    case "StringLiteral": return "string"
    case "BooleanLiteral": return "boolean"
    case "Identifier": return symbols.get(node.name) ?? "unknown"

    case "BinaryExpression": {
      const left = inferType(node.left, symbols)
      const right = inferType(node.right, symbols)
      if (left === "unknown" || right === "unknown") return "unknown" // can't prove anything, stay silent

      if (["+", "-", "*", "/"].includes(node.operator)) {
        if (node.operator === "+" && left === "string" && right === "string") return "string"
        if (left === "number" && right === "number") return "number"
        return "unknown" // signals a mismatch to the caller (Step 2 turns this into a report)
      }
      if (["==", "!=", "<", "<=", ">", ">="].includes(node.operator)) return "boolean"
      return "unknown"
    }

    case "UnaryExpression": return node.operator === "-" ? "number" : "unknown"
    default: return "unknown"
  }
}
```

Every branch that lacks enough information returns `"unknown"` rather than guessing — this is the concept section's "watch for" made concrete: `inferType` is deliberately conservative, only claiming a specific type (`"number"`, `"string"`, `"boolean"`) when it can actually justify one, and falling back to `"unknown"` (which Step 2 treats as "no opinion," not "error") everywhere else.

### SAVE AND TRY

```typescript
const symbols = new Map<string, NanoType>([["x", "number"], ["y", "string"]])
const mismatchAst = new Parser(new Lexer("x + y").tokenize()).parseExpression()
console.log(inferType(mismatchAst, symbols)) // "unknown" -- number + string doesn't resolve to a known type

const okAst = new Parser(new Lexer("x + 1").tokenize()).parseExpression()
console.log(inferType(okAst, symbols)) // "number"
```

## Step 2: Symbol resolution and type-mismatch reporting

```typescript
interface AnalysisIssue { kind: string; message: string; line: number }

function analyzeSymbolsAndTypes(program: Program): AnalysisIssue[] {
  const issues: AnalysisIssue[] = []
  const symbols = new Map<string, NanoType>()

  function checkExpression(node: Expression) {
    if (node.type === "Identifier" && !symbols.has(node.name)) {
      issues.push({ kind: "undeclared-symbol", message: `'${node.name}' is not declared`, line: 0 })
    }
    if (node.type === "BinaryExpression") {
      checkExpression(node.left)
      checkExpression(node.right)
      if (["+", "-", "*", "/"].includes(node.operator)) {
        const left = inferType(node.left, symbols)
        const right = inferType(node.right, symbols)
        if (left !== "unknown" && right !== "unknown" && left !== right) {
          issues.push({ kind: "type-mismatch", message: `type mismatch: ${left} ${node.operator} ${right}`, line: 0 })
        }
      }
    }
    if (node.type === "CallExpression") { checkExpression(node.callee); node.args.forEach(checkExpression) }
    if (node.type === "AssignmentExpression") checkExpression(node.value)
  }

  function checkStatement(node: Statement) {
    if (node.type === "LetStatement") {
      checkExpression(node.initializer)
      symbols.set(node.name, inferType(node.initializer, symbols)) // declare AFTER checking initializer
    }
    if (node.type === "ExpressionStatement") checkExpression(node.expression)
    if (node.type === "IfStatement") {
      checkExpression(node.condition)
      checkStatement(node.thenBranch)
      if (node.elseBranch) checkStatement(node.elseBranch)
    }
    if (node.type === "WhileStatement") { checkExpression(node.condition); checkStatement(node.body) }
    if (node.type === "BlockStatement") node.statements.forEach(checkStatement)
    if (node.type === "ReturnStatement" && node.value) checkExpression(node.value)
  }

  program.statements.forEach(checkStatement)
  return issues
}
```

`symbols.set(node.name, ...)` happens *after* `checkExpression(node.initializer)` runs — declaring a variable only once its initializer has been fully checked against the *previous* symbol table state, which correctly rejects `let x = x + 1;` (referencing `x` before it exists) as an undeclared-symbol error, rather than accidentally allowing self-reference. This ordering is the static-analysis equivalent of LAB-83's `Environment.define` only taking effect once evaluation of the initializer completes.

### SAVE AND TRY

```typescript
const source = "let x = 5; let y = \"hi\"; let z = x + y;"
const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
console.log(analyzeSymbolsAndTypes(ast))
// [{ kind: "type-mismatch", message: "type mismatch: number + string", line: 0 }]

const undeclaredSource = "let x = missing + 1;"
const undeclaredAst = new Parser(new Lexer(undeclaredSource).tokenize()).parseProgram()
console.log(analyzeSymbolsAndTypes(undeclaredAst))
// [{ kind: "undeclared-symbol", message: "'missing' is not declared", line: 0 }]
```

## Step 3: Dead code detection — reachability after `return`

```typescript
function findDeadCode(program: Program): AnalysisIssue[] {
  const issues: AnalysisIssue[] = []

  function checkBlock(statements: Statement[]) {
    let unreachable = false
    for (const stmt of statements) {
      if (unreachable) {
        issues.push({ kind: "dead-code", message: "unreachable code after return", line: 0 })
        continue // still walk it below for nested dead code, but already reported this statement
      }
      if (stmt.type === "ReturnStatement") unreachable = true
      if (stmt.type === "BlockStatement") checkBlock(stmt.statements)
      if (stmt.type === "IfStatement") {
        checkStatementForDeadCode(stmt.thenBranch)
        if (stmt.elseBranch) checkStatementForDeadCode(stmt.elseBranch)
        // Note: does NOT mark unreachable after an if/else even if both branches return --
        // that would require deeper analysis (Step 4 territory); flagged as a known limitation.
      }
      if (stmt.type === "WhileStatement") checkStatementForDeadCode(stmt.body)
      if (stmt.type === "FunctionDeclaration") checkBlock(stmt.body.statements)
    }
  }

  function checkStatementForDeadCode(stmt: Statement) {
    if (stmt.type === "BlockStatement") checkBlock(stmt.statements)
  }

  program.statements.forEach(stmt => {
    if (stmt.type === "FunctionDeclaration") checkBlock(stmt.body.statements)
    if (stmt.type === "BlockStatement") checkBlock(stmt.statements)
  })
  return issues
}
```

The `unreachable` flag is reachability tracking in its simplest form: once a `ReturnStatement` is seen in a straight-line sequence of statements, every statement after it in that *same block* can provably never execute — not "might not," but genuinely can't, since `return` unconditionally exits (LAB-83's `ReturnSignal` made this exact same guarantee at runtime; this lab proves it ahead of time, from structure alone). The explicit comment about `if`/`else` both-returning is an honest scope boundary: full reachability analysis (does *every* path through an if/else return?) is real, deeper dataflow analysis — flagged here rather than silently claimed.

### SAVE AND TRY

```typescript
const source = `
  function example() {
    let x = 5;
    return x;
    let unreachable = 1;
  }
`
const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
console.log(findDeadCode(ast))
// [{ kind: "dead-code", message: "unreachable code after return", line: 0 }]
```

## Step 4: Combining everything into one analyzer pass

```typescript
function runStaticAnalysis(program: Program): AnalysisIssue[] {
  return [...analyzeSymbolsAndTypes(program), ...findDeadCode(program)]
}
```

This mirrors LAB-88's `runLinter` shape exactly — independent checks, each returning its own issue list, combined by the caller — reinforcing that a "static analyzer" and a "linter" aren't fundamentally different architectures; the static analyzer's checks just reason more deeply about values and control flow than pattern-matching rules do, while plugging into the identical "run independent checks, collect results" harness.

### SAVE AND TRY

Run `runStaticAnalysis` on the full "What You Will Build" example at the top of this lab. It should report exactly two issues: the `x + y` type mismatch, and the dead-code `let unreachable = 1;` after `return z;` — plus, if `analyzeSymbolsAndTypes` is checking the standalone `console.log(missing)` statement too, an undeclared-symbol issue for `missing` (Nano has no built-in `console`, so treat this as illustrative — a real implementation would need a global symbol table seeded with any host-provided functions).

## 🎯 Challenge

Extend `analyzeSymbolsAndTypes` to track function parameter types (assume all parameters are `"unknown"` unless annotated — Nano has no type annotations, so this Challenge is really about correctly scoping symbols per function call rather than inferring anything new): when checking a `FunctionDeclaration`'s body, seed a *fresh* symbol table with its parameters before checking, so a parameter named the same as an outer variable doesn't inherit the outer variable's inferred type.

<details>
<summary>Solution</summary>

```typescript
function checkStatement(node: Statement, symbols: Map<string, NanoType>) {
  // ...existing cases, now threading `symbols` explicitly instead of closing over one shared map...

  if (node.type === "FunctionDeclaration") {
    const functionSymbols = new Map<string, NanoType>() // fresh scope, NOT inheriting outer symbols
    node.params.forEach(param => functionSymbols.set(param, "unknown"))
    node.body.statements.forEach(stmt => checkStatement(stmt, functionSymbols))
  }
}
```

Passing a brand-new `Map` into the function body (instead of reusing the outer `symbols`) means a parameter named `x` inside a function is treated as an entirely distinct binding from any outer `x` — correctly modeling Nano's actual scoping rules (LAB-83's `Environment` chain would also create a fresh child scope for a function call), even though this Challenge's version doesn't chain to a parent for lookups, since Nano functions don't implicitly see caller-scope variables through parameters.

</details>

## Mental Model

| Concept | LAB-88's linter | This lab's static analyzer |
|---|---|---|
| What it reasons about | Surface AST patterns | Inferred types and reachability |
| Depth | Pattern match on one node shape | Follows data through multiple nodes |
| Confidence required | High — clear syntactic pattern | Only report when provably certain (`unknown` = stay silent) |
| Architecture | Independent rules, combined results | Independent checks, combined results — same shape |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `inferType` return `"unknown"` instead of guessing when it lacks enough information? | |
| 2 | Why does `let x = x + 1;` get flagged as an undeclared-symbol error rather than silently succeeding? | |
| 3 | Why is "both branches of an if/else return" flagged as a known limitation instead of implemented? | |

## Quick Check Answers

1. "Static" means examining the program's source/structure without executing it — as opposed to "dynamic" analysis, which observes actual behavior by running the program and only sees the one path a given execution takes.
2. Because type inference reasons about *every* code path structurally, including branches a particular test run might never execute — a type mismatch on a rarely-taken `else` branch is just as real a bug as one on the main path, and static analysis catches it without needing a test to happen to exercise that branch.
3. Because reachability follows directly from the AST's structure — a `return` statement provably ends execution of its enclosing function for any code lexically after it in the same block, requiring no knowledge of actual runtime values or program behavior, only the unconditional nature of `return` itself.

*Next: [LAB-91 — Code Generator](LAB-91-code-generator.md)*
