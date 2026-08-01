# SE Masterclass — LAB-89 — Formatter

**Prerequisites:** LAB-88 (Linter)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why does a formatter that reprints from the AST guarantee consistent style, while a formatter that adjusts existing text (regex-based) doesn't?
2. What information does source text have that an AST deliberately discards, and why does that make "restore the original formatting" impossible after parsing?
3. Why must `format(format(source))` produce the exact same output as `format(source)` (idempotence) for a formatter to be trustworthy?

## What You Will Build

A Nano source-code formatter that parses arbitrarily messy input — inconsistent spacing, mismatched brace styles, cramped one-liners — and reprints it in one canonical style, every time.

```
Input (messy, inconsistent):
  function add(a,b){return a+b;}
  let   x=1;
  if(x>0){let y=2;}

Output (canonical):
  function add(a, b) {
    return a + b;
  }
  let x = 1;
  if (x > 0) {
    let y = 2;
  }
```

## Concept: AST to Canonical Source Text

**What it is:** A formatter parses source into an AST — discarding all original whitespace, indentation, and brace placement in the process — then reprints that AST using one fixed, consistent set of formatting rules. The output depends only on the *structure* of the code, never on how the original author happened to space or indent it.

**The problem before:** A regex- or text-based formatter (find `,` and ensure a space after it; find `{` and ensure a newline before it) has to handle an unbounded number of edge cases, because text patterns can appear in contexts a regex can't distinguish — a `,` inside a string literal shouldn't get formatting treatment, but a plain regex can't tell a string's contents from real code without accidentally re-implementing a lexer. LAB-87's compiler already solved a version of this exact problem (walk the AST, emit text) for a *different* target language; this lab reuses the identical shape for the *same* language, output tuned for human readability instead of correctness-as-JS.

**The solution:** Parse fully (LAB-80/82), discard the original text entirely, and print fresh from the AST using LAB-87's "walk the tree, emit strings, manage indentation" technique. Because the printer only ever looks at AST node shape — never the original text — two inputs that parse to the *same* AST always produce byte-identical output, regardless of how differently they were originally spaced or indented.

**Canonical example:**

```typescript
function formatSource(source: string): string {
  const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
  return printProgram(ast) // structurally identical to LAB-87's compileProgramToJs
}
```

**Project Application:** This lab and LAB-87 are close siblings — both are "AST → text" — proving that the AST built in LAB-81 truly is a reusable intermediate representation, not something tied to any one downstream consumer (interpret, compile, or in this case, pretty-print).

**Watch for:** Reusing LAB-87's `compileStatementToJs` unmodified and assuming it's "already a formatter." It produces *correct* JavaScript, but a formatter's job is to produce *human-preferred* JavaScript — consistent spacing choices, blank-line conventions, maybe trailing commas — a related but distinct goal from "the compiler's output has to actually run."

## Step 1: Printing expressions — same recursion, tuned for readability

```typescript
function printExpression(node: Expression): string {
  switch (node.type) {
    case "NumberLiteral": return String(node.value)
    case "StringLiteral": return `"${node.value}"`
    case "BooleanLiteral": return String(node.value)
    case "Identifier": return node.name

    case "BinaryExpression":
      return `${printExpression(node.left)} ${node.operator} ${printExpression(node.right)}`

    case "UnaryExpression":
      return `${node.operator}${printExpression(node.operand)}`

    case "AssignmentExpression":
      return `${node.name} = ${printExpression(node.value)}`

    case "CallExpression": {
      const callee = printExpression(node.callee)
      const args = node.args.map(printExpression).join(", ")
      return `${callee}(${args})`
    }
  }
}
```

Compare this to LAB-87's `compileExpressionToJs`: `BinaryExpression` here does *not* wrap every result in parentheses. LAB-87 needed parentheses everywhere to guarantee correctness in generated JS regardless of surrounding context; a formatter instead needs to decide, per-context, whether parentheses are *necessary* for correctness or merely add visual noise — a formatting-specific concern LAB-87's compiler never had to solve because "always parenthesize" was a perfectly acceptable answer there.

### SAVE AND TRY

```typescript
const ast = new Parser(new Lexer("2+3*4").tokenize()).parseExpression()
console.log(printExpression(ast))
// "2 + 3 * 4"
```

No parentheses in the output, yet re-parsing `"2 + 3 * 4"` produces the exact same AST shape as the original — confirming the formatter didn't need parentheses to preserve meaning, because standard operator precedence already disambiguates it identically on the way back in.

## Step 2: When parentheses ARE required — precedence-aware printing

```typescript
const PRECEDENCE: Record<string, number> = {
  "==": 1, "!=": 1, "<": 2, "<=": 2, ">": 2, ">=": 2, "+": 3, "-": 3, "*": 4, "/": 4,
}

function printExpressionWithPrecedence(node: Expression, parentPrecedence = 0): string {
  if (node.type !== "BinaryExpression") return printExpression(node)

  const ownPrecedence = PRECEDENCE[node.operator] ?? 0
  const left = printExpressionWithPrecedence(node.left, ownPrecedence)
  const right = printExpressionWithPrecedence(node.right, ownPrecedence + 1) // +1 forces parens on equal-precedence right operands
  const text = `${left} ${node.operator} ${right}`

  return ownPrecedence < parentPrecedence ? `(${text})` : text
}
```

This solves the problem Step 1 quietly avoided: if the *original* source had explicit parentheses that change meaning (like `(1 + 2) * 3`, where the parens force addition before multiplication), simply printing left/right/operator with no parens would produce `1 + 2 * 3` — which reparses to a *different* tree. Comparing `ownPrecedence` against `parentPrecedence` (passed down from the caller) recovers exactly when parens are structurally necessary versus merely redundant, printing them only in the former case.

### SAVE AND TRY

```typescript
const withParens = new Parser(new Lexer("(1 + 2) * 3").tokenize()).parseExpression()
console.log(printExpressionWithPrecedence(withParens))
// "(1 + 2) * 3"  -- parens preserved: needed for correctness

const withoutParens = new Parser(new Lexer("1 + 2 * 3").tokenize()).parseExpression()
console.log(printExpressionWithPrecedence(withoutParens))
// "1 + 2 * 3"  -- no parens: not needed, precedence already correct without them
```

Both outputs, when re-parsed, produce ASTs identical to their originals — the formatter added parentheses exactly where structurally required, and nowhere else.

## Step 3: Printing statements with consistent indentation

```typescript
function printStatement(node: Statement, indent = ""): string {
  switch (node.type) {
    case "LetStatement":
      return `${indent}let ${node.name} = ${printExpressionWithPrecedence(node.initializer)};`

    case "ExpressionStatement":
      return `${indent}${printExpressionWithPrecedence(node.expression)};`

    case "ReturnStatement":
      return node.value ? `${indent}return ${printExpressionWithPrecedence(node.value)};` : `${indent}return;`

    case "IfStatement": {
      const cond = printExpressionWithPrecedence(node.condition)
      const thenCode = printStatement(node.thenBranch, indent)
      const elseCode = node.elseBranch ? ` else ${printStatement(node.elseBranch, indent).trimStart()}` : ""
      return `${indent}if (${cond}) ${thenCode.trimStart()}${elseCode}`
    }

    case "WhileStatement": {
      const cond = printExpressionWithPrecedence(node.condition)
      return `${indent}while (${cond}) ${printStatement(node.body, indent).trimStart()}`
    }

    case "BlockStatement": {
      if (node.statements.length === 0) return `${indent}{\n${indent}}`
      const inner = node.statements.map(s => printStatement(s, indent + "  ")).join("\n")
      return `${indent}{\n${inner}\n${indent}}`
    }

    case "FunctionDeclaration": {
      const params = node.params.join(", ")
      return `${indent}function ${node.name}(${params}) ${printStatement(node.body, indent).trimStart()}`
    }
  }
}
```

This is deliberately close to LAB-87's `compileStatementToJs` — same recursive shape, same indentation threading — because both are fundamentally "walk statements, manage nesting depth." The formatting-specific decisions are small and localized: always 2-space indent, always a space after `if`'s `(`, an opening brace always on the same line as its construct — one fixed choice per stylistic question, applied uniformly regardless of how the input was originally styled.

### SAVE AND TRY

```typescript
const messy = "function add(a,b){return a+b;}"
const ast = new Parser(new Lexer(messy).tokenize()).parseStatement()
console.log(printStatement(ast, ""))
```

```
function add(a, b) {
  return a + b;
}
```

## Step 4: Idempotence — the formatter's core correctness property

```typescript
function formatSource(source: string): string {
  const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
  return ast.statements.map(s => printStatement(s, "")).join("\n\n")
}

function isIdempotent(source: string): boolean {
  const once = formatSource(source)
  const twice = formatSource(once)
  return once === twice
}
```

Idempotence — `format(format(x)) === format(x)` — is the property that makes a formatter trustworthy to run automatically (in a pre-commit hook, in CI) without fear of it endlessly "fixing" its own output differently each time. It holds here specifically because the formatter's output is a pure function of the AST, and formatting *already-formatted* code produces the same AST as the first pass did — feed the printer the same tree twice, get the same text twice.

### SAVE AND TRY

```typescript
const messy = "function add(a,b){return a+b;}\nlet   x=1;"
console.log(isIdempotent(messy)) // true

const formatted = formatSource(messy)
console.log(formatSource(formatted) === formatted) // true -- running the formatter on already-formatted code changes nothing
```

## 🎯 Challenge

Add a configurable indent width (2 spaces vs. 4 spaces vs. tabs) as a parameter threaded through `printStatement`/`formatSource`, and confirm `isIdempotent` still holds for every configuration — proving idempotence is a property of the printer's *consistency*, not tied to any one specific style choice.

<details>
<summary>Solution</summary>

```typescript
interface FormatOptions { indentUnit: string }

function printStatementConfigurable(node: Statement, indent: string, options: FormatOptions): string {
  const nextIndent = indent + options.indentUnit
  switch (node.type) {
    case "BlockStatement": {
      if (node.statements.length === 0) return `${indent}{\n${indent}}`
      const inner = node.statements.map(s => printStatementConfigurable(s, nextIndent, options)).join("\n")
      return `${indent}{\n${inner}\n${indent}}`
    }
    // ...every other case threads `options` through recursive calls the same way,
    // using `options.indentUnit` wherever printStatement previously hardcoded "  "...
    default: return printStatement(node, indent) // fallback for brevity
  }
}

function formatSourceConfigurable(source: string, options: FormatOptions): string {
  const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
  return ast.statements.map(s => printStatementConfigurable(s, "", options)).join("\n\n")
}

console.log(formatSourceConfigurable("function f(){let x=1;}", { indentUnit: "    " }))
```

Idempotence survives any fixed `options` value because it was never about *which* style rules the printer uses — only that the printer applies the *same* rules deterministically every time it runs, which holds regardless of whether `indentUnit` is two spaces, four spaces, or a tab character.

</details>

## Mental Model

| Concept | Text-based formatter | AST-based formatter (this lab) |
|---|---|---|
| What it operates on | Regex patterns over raw text | The parsed structure of the code |
| String literal contents | Risk of false-positive matches | Never touched — parsed as an opaque `StringLiteral` node |
| Guaranteed consistency | No — depends on which patterns matched | Yes — same AST always produces same text |
| Parentheses | Preserved or stripped by pattern rules | Printed only when structurally required (Step 2) |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does parsing before reprinting guarantee consistent output regardless of input style? | |
| 2 | Why does `printExpressionWithPrecedence` need a `parentPrecedence` parameter at all? | |
| 3 | What would break if a formatter were not idempotent? | |

## Quick Check Answers

1. Reprinting from the AST means the output depends only on the tree's structure, which is the same for any input that parses identically — a regex-based approach instead reacts to surface text patterns, which can vary even between two inputs that mean the exact same thing.
2. Original whitespace, indentation, exact brace placement, and blank lines are not represented in the AST at all (LAB-81's "abstract" in "abstract syntax tree") — once parsed, there is no way to recover how the original author formatted the code, only what it structurally means.
3. Because a non-idempotent formatter could keep changing its own output every time it's re-run — making it unsafe to run automatically in tooling like a pre-commit hook or CI check, since two runs might disagree about what "correctly formatted" even means for the same input.

*Next: [LAB-90 — Static Analyzer](LAB-90-static-analyzer.md)*
