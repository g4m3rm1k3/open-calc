# SE Masterclass — LAB-81 — Abstract Syntax Trees

**Prerequisites:** LAB-80 (Tokenization)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why is a flat token list not enough to represent `1 + 2 * 3` unambiguously?
2. What does "abstract" mean in "abstract syntax tree" — abstract compared to what?
3. Why does every AST node need a `type` field discriminating what kind of node it is?

## What You Will Build

A set of TypeScript interfaces describing every shape of Nano code as a tree, plus a hand-built example tree for `let total = 12 + count;` that you'll walk and print — no parser yet (that's LAB-82); this lab is purely about the *shape* of the data structure the parser will produce.

```
let total = 12 + count;

LetStatement
├── name: "total"
└── initializer: BinaryExpression (+)
    ├── left: NumberLiteral (12)
    └── right: Identifier ("count")
```

## Concept: The AST — Code as a Tree

**What it is:** An abstract syntax tree is a tree data structure representing the *grammatical structure* of source code — "abstract" because it deliberately throws away everything that doesn't affect meaning (whitespace, comments, parentheses used only for grouping) and keeps only what does (this is a binary operation, its left side is this, its right side is that).

**The problem before:** LAB-80's tokenizer produces a flat list: `[NUMBER(1), PLUS, NUMBER(2), STAR, NUMBER(3)]`. A flat list has no notion of grouping or precedence — nothing in the list itself says whether `2 * 3` should be evaluated first (correct, matching math convention) or `1 + 2` should be (wrong). LAB-11 (Phase 1) hit this same wall with a four-operator calculator and solved it by building a tree; Nano's AST generalizes that idea to statements, keywords, and control flow, not just arithmetic.

**The solution:** Define one TypeScript interface per kind of Nano construct — `NumberLiteral`, `Identifier`, `BinaryExpression`, `LetStatement`, `IfStatement`, and so on — each carrying exactly the children relevant to its meaning. A `BinaryExpression` for `2 * 3` has a `left` child, a `right` child, and an `operator` — no mention of the token stream that produced it, no whitespace, no source positions unless explicitly kept for error messages. The tree's shape *is* the parse: `2 * 3` nested inside `1 + (...)` unambiguously encodes "multiplication happens first" through structure alone, not through a rule remembered separately.

**Canonical example:**

```typescript
interface BinaryExpression {
  type: "BinaryExpression"
  operator: "+" | "-" | "*" | "/" | "==" | "!=" | "<" | "<=" | ">" | ">="
  left: Expression
  right: Expression
}
```

**Project Application:** Every remaining Phase 7 lab operates on this AST shape: LAB-82's parser builds it, LAB-83's interpreter walks it, LAB-84's compiler flattens it to bytecode, and every mini-project (linter, formatter, static analyzer, code generator) reads or rewrites it.

**Watch for:** Conflating "how the parser will build this" with "what this represents." This lab is deliberately parser-free — the AST shape should make sense purely as a description of Nano's grammar, independent of any particular parsing strategy that will later construct it.

## Step 1: Expression nodes

```typescript
type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | Identifier
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | AssignmentExpression

interface NumberLiteral { type: "NumberLiteral"; value: number }
interface StringLiteral { type: "StringLiteral"; value: string }
interface BooleanLiteral { type: "BooleanLiteral"; value: boolean }
interface Identifier { type: "Identifier"; name: string }

interface BinaryExpression {
  type: "BinaryExpression"
  operator: string
  left: Expression
  right: Expression
}

interface UnaryExpression {
  type: "UnaryExpression"
  operator: string
  operand: Expression
}

interface CallExpression {
  type: "CallExpression"
  callee: Expression
  args: Expression[]
}

interface AssignmentExpression {
  type: "AssignmentExpression"
  name: string
  value: Expression
}
```

Every node has a `type` field with a distinct string literal value — a **discriminated union**, the same pattern LAB-71's `Shape` type and LAB-11's expression nodes both used. This is what lets a `switch (node.type)` in any consumer (interpreter, formatter, linter) narrow `node` to the exact interface for that case, with TypeScript checking exhaustiveness.

### SAVE AND TRY

Hand-construct the tree for `12 + count`:

```typescript
const expr: BinaryExpression = {
  type: "BinaryExpression",
  operator: "+",
  left: { type: "NumberLiteral", value: 12 },
  right: { type: "Identifier", name: "count" },
}
console.log(expr.left.type, expr.right.type) // "NumberLiteral" "Identifier"
```

No parser was involved — this is proof the AST shape stands on its own as a data structure, buildable by hand or by any parser that targets it.

## Step 2: Statement nodes

```typescript
type Statement =
  | LetStatement
  | ExpressionStatement
  | IfStatement
  | WhileStatement
  | FunctionDeclaration
  | ReturnStatement
  | BlockStatement

interface LetStatement { type: "LetStatement"; name: string; initializer: Expression }
interface ExpressionStatement { type: "ExpressionStatement"; expression: Expression }

interface IfStatement {
  type: "IfStatement"
  condition: Expression
  thenBranch: Statement
  elseBranch: Statement | null
}

interface WhileStatement { type: "WhileStatement"; condition: Expression; body: Statement }

interface FunctionDeclaration {
  type: "FunctionDeclaration"
  name: string
  params: string[]
  body: BlockStatement
}

interface ReturnStatement { type: "ReturnStatement"; value: Expression | null }
interface BlockStatement { type: "BlockStatement"; statements: Statement[] }
```

Expressions and statements are kept as two separate unions because Nano (like most languages) distinguishes "a thing that produces a value" (`12 + count`) from "a thing that performs an action" (`let total = ...;`, `if (...) { ... }`). `IfStatement.elseBranch` being `Statement | null` (not optional/`undefined`) makes "no else clause" an explicit, checkable value rather than a field that might just be missing.

### SAVE AND TRY

Hand-construct `if (x > 0) { return x; }` (no else):

```typescript
const ifStmt: IfStatement = {
  type: "IfStatement",
  condition: { type: "BinaryExpression", operator: ">", left: { type: "Identifier", name: "x" }, right: { type: "NumberLiteral", value: 0 } },
  thenBranch: { type: "BlockStatement", statements: [{ type: "ReturnStatement", value: { type: "Identifier", name: "x" } }] },
  elseBranch: null,
}
```

`elseBranch: null` had to be written explicitly — TypeScript won't let you omit it, because the interface requires the field to exist, forcing every consumer to handle the no-else case deliberately instead of accidentally reading `undefined`.

## Step 3: The Program root and a full hand-built tree

```typescript
interface Program {
  type: "Program"
  statements: Statement[]
}

// The full tree for: let total = 12 + count;
const program: Program = {
  type: "Program",
  statements: [
    {
      type: "LetStatement",
      name: "total",
      initializer: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "NumberLiteral", value: 12 },
        right: { type: "Identifier", name: "count" },
      },
    },
  ],
}
```

`Program` is the tree's root — every Nano source file becomes exactly one `Program` node holding a flat list of top-level statements, each of which can nest arbitrarily deep (a `WhileStatement`'s `body` can itself contain another `IfStatement`, and so on).

### SAVE AND TRY

Write a function `countNodes(node: any): number` that recursively counts every node in a tree (walk every object-valued field, recurse, sum 1 + children). Run it starting from `program.statements[0]` — it should report 4 nodes: `LetStatement`, `BinaryExpression`, `NumberLiteral`, `Identifier`. This kind of generic tree walk is exactly what LAB-83's interpreter will specialize into "evaluate this node" instead of "count this node."

## Step 4: A generic tree-printer — proving the shape is walkable

```typescript
function printAst(node: Expression | Statement | Program, indent = ""): void {
  console.log(indent + node.type)
  const nextIndent = indent + "  "

  switch (node.type) {
    case "Program": node.statements.forEach(s => printAst(s, nextIndent)); break
    case "LetStatement": printAst(node.initializer, nextIndent); break
    case "BinaryExpression": printAst(node.left, nextIndent); printAst(node.right, nextIndent); break
    case "IfStatement":
      printAst(node.condition, nextIndent)
      printAst(node.thenBranch, nextIndent)
      if (node.elseBranch) printAst(node.elseBranch, nextIndent)
      break
    case "BlockStatement": node.statements.forEach(s => printAst(s, nextIndent)); break
    case "NumberLiteral": case "Identifier": case "StringLiteral": case "BooleanLiteral":
      break // leaf nodes — nothing further to recurse into
    default:
      break
  }
}
```

This printer is structurally identical to what LAB-83's `evaluate` function and LAB-89's formatter will look like — a `switch (node.type)` with one case per node kind, recursing into children. Writing it now, before any parser exists, confirms the AST shape is genuinely walkable and complete: every node either has children to recurse into or is correctly treated as a leaf.

### SAVE AND TRY

Run `printAst(program)` on Step 3's hand-built tree:

```
Program
  LetStatement
    BinaryExpression
      NumberLiteral
      Identifier
```

The indentation visually confirms the nesting depth matches the ASCII diagram in "What You Will Build" — the printer output and the diagram should describe the identical structure.

## 🎯 Challenge

Add an `ArrayLiteral` expression node (`type: "ArrayLiteral"; elements: Expression[]`) to the `Expression` union, hand-construct the tree for `[1, 2, count]`, and extend `printAst` to handle it correctly (recursing into every element).

<details>
<summary>Solution</summary>

```typescript
interface ArrayLiteral { type: "ArrayLiteral"; elements: Expression[] }
// add ArrayLiteral to the Expression union

const arrayExpr: ArrayLiteral = {
  type: "ArrayLiteral",
  elements: [
    { type: "NumberLiteral", value: 1 },
    { type: "NumberLiteral", value: 2 },
    { type: "Identifier", name: "count" },
  ],
}

// add to printAst's switch:
// case "ArrayLiteral": node.elements.forEach(e => printAst(e, nextIndent)); break
```

`elements: Expression[]` reuses the existing `Expression` union rather than inventing a narrower type — an array literal's contents are just ordinary expressions, so `[1, 2, count]` and `[1 + 2, count]` are both valid without any special-casing.

</details>

## Mental Model

| Concept | Token list (LAB-80) | AST (this lab) |
|---|---|---|
| Structure | Flat sequence | Nested tree |
| Precedence | Not represented | Represented by nesting depth |
| Grouping parens | A literal `(` token | Discarded — nesting alone shows grouping |
| What a consumer reads | "what token comes next" | "what kind of node is this, what are its children" |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why can't `1 + 2 * 3`'s correct evaluation order be recovered from the token list alone? | |
| 2 | Why do Expression and Statement stay as two separate TypeScript unions? | |
| 3 | Why does `printAst` use a `switch (node.type)` instead of, say, checking `"left" in node`? | |

## Quick Check Answers

1. A flat token list has no structure — nothing distinguishes "multiply first" from "add first" without a separately-remembered precedence rule; a tree encodes that order directly through nesting.
2. "Abstract" contrasts with a *concrete* syntax tree, which would keep every syntactic detail (parentheses, whitespace, punctuation) exactly as written; an AST keeps only what affects meaning.
3. Because many different node kinds could structurally have a field called `left`, or could lack one for unrelated reasons — `type` is an explicit, unambiguous tag that both a human and TypeScript's type narrowing can rely on to know exactly which interface applies.

*Next: [LAB-82 — Recursive Descent Parser](LAB-82-recursive-descent.md)*
