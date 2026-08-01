# SE Masterclass — LAB-88 — Linter

**Prerequisites:** LAB-87 (Compiler)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why does a linter walk the AST instead of scanning the raw token stream?
2. What's the difference between a "fixable" and "non-fixable" lint rule?
3. Why should each lint rule be its own independent function instead of one giant function with many `if` statements?

## What You Will Build

A configurable Nano linter with three rules — unused variables, `==` instead of a stricter comparison reminder, and empty block bodies — that reports violations with source line numbers, and can auto-fix the ones that are safely fixable.

```
Source:
  let unused = 5;
  let x = 10;
  if (x == 10) {
  }

Lint report:
  line 1: 'unused' is declared but never used           [no-unused-vars]     fixable
  line 3: consider using strict comparison               [prefer-strict-eq]   fixable
  line 3: empty block body                                [no-empty-block]     not fixable
```

## Concept: Linting — Static Analysis for Style and Correctness

**What it is:** A linter walks a program's AST looking for patterns that are *syntactically valid* but likely wrong, wasteful, or against a team's conventions — code that compiles or runs fine, but that a rule says shouldn't exist. Each rule is an independent check; a linter is really a small framework for running many independent AST-walking rules and collecting their complaints.

**The problem before:** LAB-83's interpreter and LAB-87's compiler both walk the AST to *do* something with it (execute it, translate it) — they're single-purpose passes. A linter needs to walk the same AST for a completely different reason: not to run or translate the program, but to *report on* it, potentially with many independent, unrelated checks running over the same tree. Cramming unused-variable detection, style rules, and error-prone-pattern detection into one giant function would make each rule's logic tangled with every other rule's.

**The solution:** Define a common `Rule` interface — a function that visits AST nodes and reports violations — and run a list of independent rules over the same tree in one pass. Each rule only knows about its own concern (LAB-18's Single Responsibility Principle, applied to static analysis): the unused-variable rule tracks declarations and usages; the strict-equality rule just pattern-matches `BinaryExpression` nodes with `operator === "=="`; neither rule needs to know the other exists.

**Canonical example:**

```typescript
interface LintRule {
  name: string
  check(program: Program): LintViolation[]
}

function runLinter(program: Program, rules: LintRule[]): LintViolation[] {
  return rules.flatMap(rule => rule.check(program))
}
```

**Project Application:** LAB-90's static analyzer extends this exact rule-running architecture with heavier analysis (type inference, data-flow); this lab's linter is the simpler, pattern-matching-only sibling — both walk the same Nano AST for different depths of insight.

**Watch for:** A lint rule that reports a violation but can't actually explain *where* — always carry the offending node's `line` (threaded from LAB-80's tokens through LAB-82's parser) into the violation, or the report becomes "something's wrong somewhere in your 500-line file," which nobody can act on.

## Step 1: The Rule interface and violation shape

```typescript
interface LintViolation {
  rule: string
  message: string
  line: number
  fixable: boolean
}

interface LintRule {
  name: string
  check(program: Program): LintViolation[]
}
```

Every rule implements the exact same shape — `check(program) => LintViolation[]` — regardless of how simple or complex its internal logic is. This uniformity is what lets `runLinter` (Step 4) treat every rule identically, never needing to know which specific checks it's running.

### SAVE AND TRY

Write a trivial rule that always reports one fake violation, just to confirm the shape works end to end:

```typescript
const alwaysFailRule: LintRule = {
  name: "always-fail",
  check: () => [{ rule: "always-fail", message: "test violation", line: 1, fixable: false }],
}
console.log(alwaysFailRule.check({ type: "Program", statements: [] }))
```

## Step 2: The no-unused-vars rule — a two-pass walk

```typescript
const noUnusedVars: LintRule = {
  name: "no-unused-vars",
  check(program: Program): LintViolation[] {
    const declared = new Map<string, number>() // name -> line
    const used = new Set<string>()

    function collectDeclarations(node: Statement) {
      if (node.type === "LetStatement") declared.set(node.name, 0) // line tracked in Step 4's real AST
      if (node.type === "BlockStatement") node.statements.forEach(collectDeclarations)
      if (node.type === "IfStatement") { collectDeclarations(node.thenBranch); if (node.elseBranch) collectDeclarations(node.elseBranch) }
      if (node.type === "WhileStatement") collectDeclarations(node.body)
      if (node.type === "FunctionDeclaration") collectDeclarations(node.body)
    }

    function collectUsages(node: Expression | Statement) {
      if (!node) return
      if (node.type === "Identifier") used.add(node.name)
      if (node.type === "BinaryExpression") { collectUsages(node.left); collectUsages(node.right) }
      if (node.type === "CallExpression") { collectUsages(node.callee); node.args.forEach(collectUsages) }
      if (node.type === "AssignmentExpression") collectUsages(node.value)
      if (node.type === "LetStatement") collectUsages(node.initializer)
      if (node.type === "ExpressionStatement") collectUsages(node.expression)
      if (node.type === "IfStatement") { collectUsages(node.condition); collectUsages(node.thenBranch); if (node.elseBranch) collectUsages(node.elseBranch) }
      if (node.type === "WhileStatement") { collectUsages(node.condition); collectUsages(node.body) }
      if (node.type === "BlockStatement") node.statements.forEach(collectUsages)
      if (node.type === "ReturnStatement" && node.value) collectUsages(node.value)
      if (node.type === "FunctionDeclaration") collectUsages(node.body)
    }

    program.statements.forEach(collectDeclarations)
    program.statements.forEach(collectUsages)

    return [...declared.entries()]
      .filter(([name]) => !used.has(name))
      .map(([name, line]) => ({ rule: "no-unused-vars", message: `'${name}' is declared but never used`, line, fixable: true }))
  },
}
```

This needs *two* full tree walks, not one: `collectDeclarations` must see every `let` before `collectUsages` can correctly determine whether a given name was ever referenced anywhere in the program (a variable might be declared early and used much later, in a different branch or nested block). Running them as two separate passes over the same tree — rather than trying to track "declared but not yet seen used" during a single walk — avoids false positives from a variable that's declared before its only usage appears later in the source.

### SAVE AND TRY

```typescript
const source = "let unused = 5; let x = 10; let y = x + 1;"
const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
console.log(noUnusedVars.check(ast).map(v => v.message))
// ["'unused' is declared but never used"]
```

`x` is correctly excluded (it's used inside `y`'s initializer), but `y` itself should still be flagged here, since nothing references it — extend the test to also declare `let z = y;` and confirm `y` drops out of the violation list once something references it.

## Step 3: The prefer-strict-eq and no-empty-block rules — simple pattern matches

```typescript
const preferStrictEq: LintRule = {
  name: "prefer-strict-eq",
  check(program: Program): LintViolation[] {
    const violations: LintViolation[] = []

    function walk(node: any) {
      if (!node || typeof node !== "object") return
      if (node.type === "BinaryExpression" && node.operator === "==") {
        violations.push({ rule: "prefer-strict-eq", message: "consider using strict comparison", line: node.line ?? 0, fixable: true })
      }
      for (const key of Object.keys(node)) {
        const value = node[key]
        if (Array.isArray(value)) value.forEach(walk)
        else if (value && typeof value === "object") walk(value)
      }
    }

    program.statements.forEach(walk)
    return violations
  },
}

const noEmptyBlock: LintRule = {
  name: "no-empty-block",
  check(program: Program): LintViolation[] {
    const violations: LintViolation[] = []

    function walk(node: any) {
      if (!node || typeof node !== "object") return
      if (node.type === "BlockStatement" && node.statements.length === 0) {
        violations.push({ rule: "no-empty-block", message: "empty block body", line: node.line ?? 0, fixable: false })
      }
      for (const key of Object.keys(node)) {
        const value = node[key]
        if (Array.isArray(value)) value.forEach(walk)
        else if (value && typeof value === "object") walk(value)
      }
    }

    program.statements.forEach(walk)
    return violations
  },
}
```

Both rules use a **generic** `walk` — instead of `noUnusedVars`'s hand-written case-by-case recursion, this walks *any* object's keys generically, recursing into whatever's there. This is a real trade-off worth naming: generic walking is less code per rule and automatically handles new AST node types added later, but it's harder to reason about precisely (it can't distinguish "a field that happens to be an object" from "a field that's meaningfully a child AST node") — `noUnusedVars` needed the precise, hand-written version specifically because it has to track *which* statement types can introduce new variable scope.

### SAVE AND TRY

```typescript
const source = "if (x == 10) { }"
const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
console.log(preferStrictEq.check(ast).map(v => v.rule)) // ["prefer-strict-eq"]
console.log(noEmptyBlock.check(ast).map(v => v.rule))   // ["no-empty-block"]
```

Both rules found their respective violation in the same source, independently, neither aware the other rule exists — confirming the "independent rules over a shared tree" architecture from the concept section.

## Step 4: Running all rules together, with auto-fix for fixable violations

```typescript
function runLinter(program: Program, rules: LintRule[]): LintViolation[] {
  return rules.flatMap(rule => rule.check(program)).sort((a, b) => a.line - b.line)
}

function fixStrictEq(source: string): string {
  // A real fixer would operate on the AST and re-emit source (LAB-87-style); this
  // illustrates the simplest safe case: naive text substitution only where unambiguous.
  return source.replace(/([^=!])==([^=])/g, "$1===$2")
}

function reportLint(violations: LintViolation[]): void {
  for (const v of violations) {
    const fixTag = v.fixable ? "fixable" : "not fixable"
    console.log(`line ${v.line}: ${v.message} [${v.rule}] ${fixTag}`)
  }
}
```

`runLinter` sorts by `line` so reports read top-to-bottom the way a human scans a file, regardless of which rule happened to run first internally. Auto-fixing is deliberately shown as AST-aware in principle but text-substitution in this minimal example — a production linter (like ESLint) fixes by re-emitting source from a *modified* AST, exactly LAB-87's compile-to-text technique, rather than regex-patching the original text, precisely to avoid the kind of subtle correctness bugs a regex fix risks.

### SAVE AND TRY

```typescript
const source = "let unused = 5; let x = 10; if (x == 10) {\n}"
const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
const violations = runLinter(ast, [noUnusedVars, preferStrictEq, noEmptyBlock])
reportLint(violations)
```

```
line 0: 'unused' is declared but never used [no-unused-vars] fixable
line 0: consider using strict comparison [prefer-strict-eq] fixable
line 0: empty block body [no-empty-block] not fixable
```

(Real line numbers require threading `Token.line` through the parser into each AST node — noted as a known gap in this minimal example, and exactly what the Challenge below fixes.)

## 🎯 Challenge

Thread real line numbers through: add a `line: number` field to every Statement/Expression interface (LAB-81), populate it in the parser (LAB-82, using the current token's `line` at the start of each `parseX` function), and confirm `runLinter`'s output shows the actual source lines instead of `0`.

<details>
<summary>Solution</summary>

```typescript
// LAB-81: add `line: number` to every Statement and Expression interface

// LAB-82's Parser: capture line at the start of each parse function, before consuming tokens
private parseLetStatement(): LetStatement {
  const line = this.peek().line
  const name = this.expect("IDENTIFIER", "Expected variable name").value
  this.expect("EQUALS", "Expected '=' after variable name")
  const initializer = this.parseExpression()
  this.expect("SEMICOLON", "Expected ';' after variable declaration")
  return { type: "LetStatement", name, initializer, line }
}
// ...same one-line addition (`const line = this.peek().line`, then `line` in the returned object)
// repeated across every other parseX method.
```

Capturing `line` *before* any tokens are consumed (not after) ensures it reflects where the construct *starts* in the source, matching how a human would expect an error to be reported — "line 3" should mean "the `if` on line 3," not wherever parsing happened to finish consuming its last token.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Rule organization | One big function with many `if`s | Independent `LintRule` objects, each self-contained |
| Unused-variable detection | Single pass, flag on declaration | Two passes: collect all declarations, then all usages |
| Auto-fixing | Always safe to apply | Only mark `fixable: true` for changes with no ambiguity |
| Error location | "somewhere in the file" | A specific `line`, threaded from the original tokens |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `no-unused-vars` need two separate tree walks instead of one? | |
| 2 | Why does `runLinter` sort violations by line before returning them? | |
| 3 | Why is a real auto-fixer built on re-emitting from a modified AST safer than regex text substitution? | |

## Quick Check Answers

1. A flat token stream has no concept of which construct a token belongs to — the AST already groups tokens into meaningful nodes (declarations, expressions, blocks), so a lint rule can reason about "is this identifier a variable reference" or "is this an empty block" directly from node shape, without re-deriving structure from tokens itself.
2. A fixable rule can be automatically corrected with certainty about what the fix should be and that it won't change program behavior (like adding a strict-equality operator); a non-fixable rule (like an empty block) flags something a human needs to judge — the linter can't safely guess what should go inside it.
3. Because each rule only needs to understand its own narrow concern — unused variables, comparison style, empty blocks — independently of every other rule, which keeps each rule simple, testable in isolation, and addable/removable without touching unrelated logic.

*Next: [LAB-89 — Formatter](LAB-89-formatter.md)*
