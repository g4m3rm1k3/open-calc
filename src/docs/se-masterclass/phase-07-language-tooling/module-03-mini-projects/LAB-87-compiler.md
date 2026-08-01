# SE Masterclass — LAB-87 — Compiler

**Prerequisites:** LAB-86 (DSL)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What's the structural difference between LAB-84's bytecode compiler and a source-to-source compiler?
2. Why does compiling `let x = 5;` to JavaScript need to worry about `let` already meaning something in JavaScript?
3. Why is generating JS source *text* (strings) sometimes preferred over generating and running bytecode directly?

## What You Will Build

A compiler that translates Nano source directly into equivalent, runnable JavaScript source text — not bytecode, not direct execution, but a `.js` file you could hand to Node.js.

```
Nano:
  function add(a, b) {
    return a + b;
  }
  let result = add(2, 3);

Generated JavaScript:
  function add(a, b) {
    return (a + b);
  }
  let result = add(2, 3);
```

## Concept: Source-to-Source Compilation

**What it is:** A source-to-source compiler (sometimes called a "transpiler") walks an AST — same shape as LAB-83's interpreter and LAB-84's bytecode compiler consumed — and instead of executing it or emitting bytecode, emits *text* in another programming language that means the same thing. TypeScript-to-JavaScript, JSX-to-JavaScript, and Babel's entire plugin ecosystem all work this way.

**The problem before:** LAB-84 compiled Nano to a custom bytecode format that only Nano's own VM understands — useful for running Nano fast, useless for anything else. If Nano code needs to run in a browser, or be committed alongside a JavaScript codebase, or be inspected by a human debugging it in normal dev tools, bytecode is the wrong output — nobody can read `PUSH 2 / PUSH 3 / ADD` and immediately understand it the way they can read `2 + 3`.

**The solution:** Walk the same AST (LAB-81's shapes, unchanged) and emit JavaScript source text instead of bytecode instructions or direct evaluation. This is structurally the *same* traversal LAB-84 used for compiling to bytecode — a `switch (node.type)` recursing into children — except each case returns a string fragment instead of pushing an instruction, and the fragments get concatenated (with correct nesting and semicolons) into valid, readable JavaScript.

**Canonical example:**

```typescript
function compileExpressionToJs(node: Expression): string {
  switch (node.type) {
    case "NumberLiteral": return String(node.value)
    case "Identifier": return node.name
    case "BinaryExpression": return `(${compileExpressionToJs(node.left)} ${node.operator} ${compileExpressionToJs(node.right)})`
  }
}
```

**Project Application:** This is the compiler used inside LAB-91's code generator when it needs to emit real, runnable JavaScript from a schema — and the same "AST → target language text" shape shows up again in LAB-89's formatter (AST → *the same* language's text, for a different purpose: pretty-printing).

**Watch for:** Emitting JavaScript that's *almost* valid — missing a semicolon in a context where JS needs one, or forgetting that Nano's grammar allows something (like using a reserved word as an identifier) that JavaScript's doesn't. A source-to-source compiler's output should be run through the target language's own parser as a correctness check, not just eyeballed.

## Step 1: Compiling expressions — mostly a direct translation

```typescript
function compileExpressionToJs(node: Expression): string {
  switch (node.type) {
    case "NumberLiteral": return String(node.value)
    case "StringLiteral": return JSON.stringify(node.value) // handles quoting/escaping correctly
    case "BooleanLiteral": return String(node.value)
    case "Identifier": return node.name

    case "BinaryExpression":
      return `(${compileExpressionToJs(node.left)} ${node.operator} ${compileExpressionToJs(node.right)})`

    case "UnaryExpression":
      return `(${node.operator}${compileExpressionToJs(node.operand)})`

    case "AssignmentExpression":
      return `(${node.name} = ${compileExpressionToJs(node.value)})`

    case "CallExpression": {
      const callee = compileExpressionToJs(node.callee)
      const args = node.args.map(compileExpressionToJs).join(", ")
      return `${callee}(${args})`
    }
  }
}
```

Nano's arithmetic and comparison operators (`+`, `-`, `==`, `<`, ...) happen to already be valid JavaScript operators — this is deliberate in Nano's design (LAB-80 chose Nano's operator set to match JS), so `compileExpressionToJs` for `BinaryExpression` is close to a direct passthrough. Every generated expression is wrapped in parentheses (`(${...})`) so that JavaScript's own precedence never has a chance to reinterpret a nested expression differently than Nano's parser (LAB-82) already resolved it — the parentheses are redundant most of the time and that's fine; correctness matters more than minimal output here.

### SAVE AND TRY

```typescript
const ast = new Parser(new Lexer("2 + 3 * 4").tokenize()).parseExpression()
console.log(compileExpressionToJs(ast))
// "(2 + (3 * 4))"
```

Paste the output directly into a Node.js REPL — it evaluates to `14`, confirming the generated JS text is not just readable but actually valid, runnable JavaScript with the same meaning as the original Nano expression.

## Step 2: Compiling statements — indentation and semicolons

```typescript
function compileStatementToJs(node: Statement, indent = ""): string {
  switch (node.type) {
    case "LetStatement":
      return `${indent}let ${node.name} = ${compileExpressionToJs(node.initializer)};`

    case "ExpressionStatement":
      return `${indent}${compileExpressionToJs(node.expression)};`

    case "ReturnStatement":
      return node.value
        ? `${indent}return ${compileExpressionToJs(node.value)};`
        : `${indent}return;`

    case "IfStatement": {
      const cond = compileExpressionToJs(node.condition)
      const thenCode = compileStatementToJs(node.thenBranch, indent)
      const elseCode = node.elseBranch ? ` else ${compileStatementToJs(node.elseBranch, "").trimStart()}` : ""
      return `${indent}if (${cond}) ${thenCode.trimStart()}${elseCode}`
    }

    case "WhileStatement": {
      const cond = compileExpressionToJs(node.condition)
      const body = compileStatementToJs(node.body, indent)
      return `${indent}while (${cond}) ${body.trimStart()}`
    }

    case "BlockStatement": {
      const inner = node.statements.map(s => compileStatementToJs(s, indent + "  ")).join("\n")
      return `${indent}{\n${inner}\n${indent}}`
    }

    case "FunctionDeclaration": {
      const params = node.params.join(", ")
      const body = compileStatementToJs(node.body, indent)
      return `${indent}function ${node.name}(${params}) ${body.trimStart()}`
    }
  }
}
```

Nano's `let` (LAB-80's keyword) maps directly to JavaScript's `let` — not a coincidence; Nano's keyword vocabulary was deliberately chosen to mirror JS closely, so this compiler mostly just *is* the identity function on keywords, with the real translation work happening in structure (indentation, brace placement) rather than vocabulary. `BlockStatement` is the one case that actually manages indentation, incrementing it for nested statements — every other case just threads the `indent` string through unchanged.

### SAVE AND TRY

```typescript
const source = "if (x > 0) { return x; } else { return 0; }"
const ast = new Parser(new Lexer(source).tokenize()).parseStatement()
console.log(compileStatementToJs(ast))
```

```
if (x > 0) {
  return x;
} else {
  return 0;
}
```

## Step 3: Compiling a full program

```typescript
function compileProgramToJs(program: Program): string {
  return program.statements.map(stmt => compileStatementToJs(stmt, "")).join("\n\n")
}
```

Top-level statements are separated by a blank line for readability — a small, deliberate formatting choice on top of raw correctness, foreshadowing LAB-89's formatter, which will make *many* such choices systematically instead of this compiler's one hardcoded convention.

### SAVE AND TRY

```typescript
const source = `
  function add(a, b) {
    return a + b;
  }
  let result = add(2, 3);
`
const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
const js = compileProgramToJs(ast)
console.log(js)

// Verify it actually runs:
const runResult = eval(js + "\nresult")
console.log(runResult) // 5
```

Running the generated JS text through `eval` and confirming it produces `5` is the real correctness check this lab's concept section demanded — not just "does it look like JavaScript," but "does executing it produce the same result LAB-83's interpreter would have produced for the same Nano source."

## Step 4: Handling a Nano feature JavaScript doesn't have identically — closures over `let` in loops

Nano's closures (LAB-83) capture the *environment*, which for a `WhileStatement` body means every iteration shares the same variable bindings unless a new scope was explicitly created. Modern JavaScript's `let` inside a `for`/`while` body, when re-declared each iteration, creates a *fresh* binding per iteration — a subtle mismatch worth naming explicitly rather than silently miscompiling.

```typescript
// Nano source (conceptually): a while loop declaring functions that capture the loop variable
// If Nano's `let` semantics inside a loop body differ from JS's per-iteration `let` semantics,
// naively compiling `let` to `let` could change closure-capture behavior across the translation.

function compileLetStatement(node: LetStatement, indent: string): string {
  // Nano's `let` always means "define in the current block scope" (LAB-83's Environment.define) --
  // this matches JS `let` exactly for Nano's semantics, since Nano has no per-iteration loop scoping
  // of its own to preserve. No special-casing needed here; documenting this is the actual "step."
  return `${indent}let ${node.name} = ${compileExpressionToJs(node.initializer)};`
}
```

The lesson here isn't a code change — it's that a source-to-source compiler must verify semantic equivalence between the source and target languages' features, not just syntactic similarity. `let` *looking* the same in both languages doesn't automatically guarantee it *behaves* the same in every context; this lab's Nano/JS pairing happens to align (both check confirms it), but a compiler targeting a language with different closure/scoping rules would need actual transformation logic here, not just a passthrough.

### SAVE AND TRY

Write a Nano program with a `while` loop that declares a `function` inside its body capturing the loop's `let`-declared counter variable, compile it with Step 2/3's compiler, and run the output. Confirm the behavior matches what LAB-83's tree-walking interpreter produces for the identical Nano source — this is the semantic-equivalence check the concept section is asking for, made concrete.

## 🎯 Challenge

Add a `--source-map` style feature: track each generated line's originating Nano source line (from `Token.line`, threaded through the AST if not already present) and emit a comment `// from Nano line N` above each compiled statement, so a human reading the generated JS can trace any line back to its Nano origin.

<details>
<summary>Solution</summary>

```typescript
// Requires each Statement node to carry a `line` field, threaded from the parser (LAB-82)
// through to here -- assume `node.line` exists on every Statement for this challenge.

function compileStatementToJs(node: Statement & { line?: number }, indent = ""): string {
  const lineComment = node.line ? `${indent}// from Nano line ${node.line}\n` : ""
  switch (node.type) {
    case "LetStatement":
      return `${lineComment}${indent}let ${node.name} = ${compileExpressionToJs(node.initializer)};`
    // ...same pattern prefixed onto every other case's return value...
    default:
      return "" // other cases omitted for brevity, same lineComment prefix applies
  }
}
```

This is a minimal, illustrative version of what real source maps do at scale (V8's source maps encode this mapping far more compactly than inline comments) — but the core idea is identical: carry source position information through every compilation stage so the *output* can still be traced back to the *input*, which matters enormously once generated code needs debugging.

</details>

## Mental Model

| Concept | LAB-84's bytecode compiler | This lab's JS compiler |
|---|---|---|
| Target | Custom VM instructions | JavaScript source text |
| Who can read the output | Only the custom VM | Any JS developer, any JS tooling |
| Traversal shape | `switch (node.type)`, same as always | `switch (node.type)`, same as always |
| What each case produces | An instruction pushed to a list | A string fragment |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `compileExpressionToJs` wrap every binary expression in parentheses? | |
| 2 | Why is `eval`-ing the generated JS and checking its result a better correctness check than just reading the output text? | |
| 3 | What real risk does Step 4 illustrate about translating between two similar-looking languages? | |

## Quick Check Answers

1. LAB-84's bytecode compiler emits a flat, linear instruction list meant only for its own custom stack-machine VM to execute; a source-to-source compiler emits text in another real programming language, meant to be read, run, and tooled by that language's own ecosystem.
2. Because JavaScript already has `let` with its own defined meaning — the compiler must confirm Nano's `let` semantics actually match JavaScript's `let` semantics in every context used, not just assume a shared keyword implies shared behavior.
3. Generated bytecode is opaque to humans and only runs on a custom VM; generated source text in a mainstream language is human-readable, debuggable with standard tools, and portable to any environment that already runs that language — sometimes worth the extra step of generating text instead of executing directly.

*Next: [LAB-88 — Linter](LAB-88-linter.md)*
