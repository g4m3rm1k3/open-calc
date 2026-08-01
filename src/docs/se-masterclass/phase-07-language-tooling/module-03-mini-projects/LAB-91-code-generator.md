# SE Masterclass — LAB-91 — Code Generator

**Prerequisites:** LAB-90 (Static Analyzer)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What's the difference between "template-based" and "AST-based" code generation?
2. Why does template-based generation risk producing syntactically invalid output in a way AST-based generation can't?
3. Why is a code generator, in a sense, the exact reverse of LAB-90's static analyzer?

## What You Will Build

A code generator that takes a small JSON schema describing a data model and produces two different things from it: TypeScript interfaces (via string templates, LAB-85-style) and Nano validation functions (via AST construction, LAB-81/87-style) — the same schema driving two structurally different generation strategies.

```
Schema:
  { name: "User", fields: [
    { name: "id", type: "number" },
    { name: "email", type: "string" },
    { name: "active", type: "boolean" }
  ]}

Generated TypeScript interface:
  interface User {
    id: number;
    email: string;
    active: boolean;
  }

Generated Nano validator (via AST, then LAB-87's printer):
  function validateUser(obj) {
    if (obj.id == 0) { return false; }
    return true;
  }
```

## Concept: Code Generation — Programs That Write Programs

**What it is:** Code generation produces source code programmatically from a higher-level description — a schema, a data model, an API spec — rather than a human typing it by hand. There are two broad strategies: **template-based** (fill in blanks in a string template, LAB-85's technique) and **AST-based** (construct AST nodes programmatically, then print them, LAB-81/87's technique).

**The problem before:** Every previous lab in Phase 7 started from *existing source text* and derived something from it (an AST, a bytecode program, a lint report, formatted text). Code generation runs the pipeline in the opposite direction: starting from *data* (a schema) with no source text at all, and producing source text as the *output*. The tools are shared — LAB-81's AST shapes, LAB-87's printer — but the direction of the pipeline, and the starting point, are inverted.

**The solution:** For simple, mostly-fixed-shape output (a TypeScript interface, where every field just needs `name: type;`), template strings are fast to write and easy to read — LAB-85's compiled-template technique, minus the runtime data-binding, since the "data" here is available once at generation time, not per-render. For output requiring real logic (a validator function with conditionals, potentially recursive structure) building actual AST nodes and running them through LAB-87's printer guarantees the output is syntactically well-formed by construction — a template can produce text with a typo'd brace; a printer walking a valid `FunctionDeclaration` node structurally cannot.

**Canonical example:**

```typescript
function generateInterface(schema: Schema): string {
  const fields = schema.fields.map(f => `  ${f.name}: ${f.type};`).join("\n")
  return `interface ${schema.name} {\n${fields}\n}`
}
```

**Project Application:** This is the last lab of Phase 7 — it closes the module by reusing nearly everything built across LAB-80–90: the AST shapes (LAB-81), the printer technique (LAB-87), template compilation (LAB-85), all pointed at a new starting point (structured data) instead of parsed source text.

**Watch for:** Reaching for template strings once the generated logic needs real structure (nested conditionals, loops) — past a certain complexity, hand-assembling strings with correct brace/semicolon placement becomes exactly the bug-prone process LAB-89's formatter existed to eliminate for human-written code. The rule of thumb: flat, fixed-shape output → templates; output with real control flow → construct an AST and print it.

## Step 1: The schema shape

```typescript
interface FieldSchema { name: string; type: "number" | "string" | "boolean" }
interface Schema { name: string; fields: FieldSchema[] }

const userSchema: Schema = {
  name: "User",
  fields: [
    { name: "id", type: "number" },
    { name: "email", type: "string" },
    { name: "active", type: "boolean" },
  ],
}
```

This is the "higher-level description" the concept section named — no source code anywhere yet, just data describing *what should exist*. Everything from here is generation: turning this data into one or more textual artifacts.

### SAVE AND TRY

Sketch (on paper, or in a comment) what a second schema — say, `Product` with `id: number`, `price: number`, `inStock: boolean` — should generate, for both output kinds shown in "What You Will Build," before writing any generator code. This is the same "write examples before building the tool" discipline LAB-86 used for TaskLang's grammar, applied here to output shape instead of input grammar.

## Step 2: Template-based generation — the TypeScript interface

```typescript
function generateInterface(schema: Schema): string {
  const fields = schema.fields
    .map(field => `  ${field.name}: ${field.type};`)
    .join("\n")
  return `interface ${schema.name} {\n${fields}\n}`
}
```

This is deliberately the simplest possible generator: map each field to one fixed-shape line, join, wrap in the `interface {}` boilerplate. There's no branching, no nested structure — exactly the "flat, fixed-shape output" case the concept section said templates suit well. Reaching for AST construction here would be pure overhead for no benefit.

### SAVE AND TRY

```typescript
console.log(generateInterface(userSchema))
```

```
interface User {
  id: number;
  email: string;
  active: boolean;
}
```

Paste the output into a `.ts` file (or a TypeScript playground) and confirm it compiles with no errors — the real correctness bar for generated code, same as LAB-87's "does the generated JS actually run" check.

## Step 3: AST-based generation — the Nano validator

```typescript
function buildValidatorAst(schema: Schema): FunctionDeclaration {
  const checks: Statement[] = schema.fields
    .filter(field => field.type === "number") // only numbers get a "non-zero" style sanity check, illustratively
    .map(field => ({
      type: "IfStatement",
      condition: {
        type: "BinaryExpression",
        operator: "==",
        left: { type: "BinaryExpression", operator: "==", left: { type: "Identifier", name: `obj.${field.name}` }, right: { type: "NumberLiteral", value: 0 } } as any,
        right: { type: "BooleanLiteral", value: true },
      } as any,
      thenBranch: {
        type: "BlockStatement",
        statements: [{ type: "ReturnStatement", value: { type: "BooleanLiteral", value: false } }],
      },
      elseBranch: null,
    } as IfStatement))

  return {
    type: "FunctionDeclaration",
    name: `validate${schema.name}`,
    params: ["obj"],
    body: {
      type: "BlockStatement",
      statements: [...checks, { type: "ReturnStatement", value: { type: "BooleanLiteral", value: true } }],
    },
  }
}
```

This builds real `FunctionDeclaration`/`IfStatement`/`BlockStatement` nodes — the *exact same interfaces* LAB-81 defined and LAB-82's parser normally produces from source text — except here they're constructed directly, by hand, from schema data, with no lexer or parser involved at all. This is the concept section's core claim made concrete: an AST doesn't have to come from parsing; it's just a data structure, and any code that can construct valid instances of it can feed the same downstream tools (LAB-87's printer, LAB-83's interpreter) that parsed source would.

### SAVE AND TRY

```typescript
const validatorAst = buildValidatorAst(userSchema)
console.log(validatorAst.type, validatorAst.name, validatorAst.params)
// "FunctionDeclaration" "validateUser" ["obj"]
```

Confirm the constructed tree has the right *shape* even before printing anything — `validatorAst.body.statements.length` should be 2 (one `IfStatement` for the `id` field, since it's the only `number` field, plus the final `return true;`).

## Step 4: Printing the constructed AST — reusing LAB-87 unchanged

```typescript
function generateValidator(schema: Schema): string {
  const ast = buildValidatorAst(schema)
  return printStatement(ast, "") // LAB-87/89's printer -- ZERO changes needed
}
```

This is the payoff the whole lab has been building toward: `printStatement`, written in LAB-87 to turn *parsed* Nano code into text, works completely unmodified on a *hand-constructed* AST it never parsed from anything. The printer only ever looks at node shape (`node.type`, `node.name`, `node.body`, ...) — it has no idea, and no way to tell, whether the tree in front of it came from `Parser.parseProgram()` or from `buildValidatorAst`'s manual object literals. This is the deepest confirmation of LAB-81's original design bet: keeping the AST shape decoupled from any one producer or consumer pays off across the entire curriculum, right up to this last lab.

### SAVE AND TRY

```typescript
console.log(generateValidator(userSchema))
```

```
function validateUser(obj) {
  if (obj.id == 0 == true) {
    return false;
  }
  return true;
}
```

(The doubled `== true` reflects this step's intentionally simple, illustrative check-building logic — the Challenge below cleans it up.) Feed this generated text back through LAB-80's lexer and LAB-82's parser — it should parse without error, confirming the generator produced syntactically valid Nano, purely as a byproduct of building valid AST node shapes rather than ever hand-assembling strings.

## 🎯 Challenge

Fix Step 3's awkward double-comparison (`obj.id == 0 == true`) by building a cleaner condition — `obj.id == 0` directly, without the redundant `== true` — and extend `buildValidatorAst` to also check `string` fields aren't empty (`obj.email == ""`) and `boolean` fields are actually booleans conceptually (illustrative — Nano has no runtime `typeof`, so simplify to just checking presence, `obj.active == null`... adjust to whatever check makes sense given Nano's operator set).

<details>
<summary>Solution</summary>

```typescript
function buildFieldCheck(field: FieldSchema): Statement {
  const zeroOrEmpty: Record<FieldSchema["type"], Expression> =
    { number: { type: "NumberLiteral", value: 0 }, string: { type: "StringLiteral", value: "" }, boolean: { type: "BooleanLiteral", value: false } }

  return {
    type: "IfStatement",
    condition: {
      type: "BinaryExpression",
      operator: "==",
      left: { type: "Identifier", name: `obj.${field.name}` },
      right: zeroOrEmpty[field.type],
    },
    thenBranch: {
      type: "BlockStatement",
      statements: [{ type: "ReturnStatement", value: { type: "BooleanLiteral", value: false } }],
    },
    elseBranch: null,
  }
}

function buildValidatorAst(schema: Schema): FunctionDeclaration {
  const checks = schema.fields.map(buildFieldCheck)
  return {
    type: "FunctionDeclaration",
    name: `validate${schema.name}`,
    params: ["obj"],
    body: { type: "BlockStatement", statements: [...checks, { type: "ReturnStatement", value: { type: "BooleanLiteral", value: true } }] },
  }
}
```

`zeroOrEmpty` is a lookup table mapping each field type to its "falsy default" value node — the same "table instead of a chain of `if`s" instinct LAB-09's calculator dispatch table and LAB-80's `KEYWORDS` map both used, here applied to picking the right comparison literal per field type. Every field, regardless of type, now produces one clean `if (obj.field == <default>) { return false; }` check with no redundant comparison.

</details>

## Mental Model

| Concept | Template-based generation | AST-based generation |
|---|---|---|
| Best suited for | Flat, fixed-shape output | Output with real control flow/structure |
| Correctness guarantee | None automatic — a typo'd brace is possible | Structurally guaranteed by valid node shapes |
| Example in this lab | `generateInterface` | `buildValidatorAst` + `printStatement` |
| Relationship to parsing | Unrelated — no AST involved | Uses the *same* AST shape a parser would produce |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why is `generateInterface` written as templates rather than constructed AST nodes? | |
| 2 | Why can `printStatement` from LAB-87 print `buildValidatorAst`'s output with zero modifications? | |
| 3 | In what sense is this lab's pipeline the reverse of LAB-90's static analyzer? | |

## Quick Check Answers

1. Template-based generation fills in a fixed string pattern with data — fast for flat, unstructured output; AST-based generation constructs real tree nodes (of the same shape a parser would produce) and prints them through an existing printer, which guarantees syntactic validity for output with real structure or logic.
2. A hand-assembled template string has no structural guarantee of correctness — a missing brace, a misplaced semicolon, or mismatched nesting can slip through unnoticed; building actual AST nodes and printing them through a printer that only emits valid node shapes makes that class of error impossible by construction.
3. Because printer functions like `printStatement` operate purely on AST node shape (`node.type` and its fields) — they have no way to know or care whether the tree came from parsing real source text or was constructed directly by other code, so any valid tree works identically either way.

*Next: [Phase 8 — OS & Systems Thinking →](../../phase-08-os-thinking/README.md)*
