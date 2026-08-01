# SE Masterclass — LAB-85 — Template Engine

**Prerequisites:** LAB-84 (Bytecode and VMs)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why is a template engine a language pipeline (lex/parse/execute), not just string replacement?
2. What's the difference between `{{ name }}` (interpolation) and `{{#if visible}}...{{/if}}` (control flow) as far as the compiler is concerned?
3. Why compile a template to a JavaScript function once, rather than re-parsing the template text on every render?

## What You Will Build

A template engine that compiles a Handlebars-style template into a reusable render function — parse once, render many times with different data, exactly how real templating libraries (Handlebars, EJS, Mustache) work internally.

```
Template: "Hello {{name}}! {{#if hasItems}}You have {{count}} items.{{/if}}"

render({ name: "Ada", hasItems: true, count: 3 })
  -> "Hello Ada! You have 3 items."

render({ name: "Grace", hasItems: false, count: 0 })
  -> "Hello Grace! "
```

## Concept: Template Compilation — Text With Embedded Code

**What it is:** A template is source text in two languages at once: literal output text, and small embedded expressions/control-flow (`{{name}}`, `{{#if}}`) that determine what gets substituted or repeated. A template *engine* is a mini compiler: it lexes the mixed text, parses it into a tree, and compiles that tree into a function that, given data, produces the final string.

**The problem before:** A naive approach — `template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key])` — handles plain interpolation but falls apart the moment templates need conditionals or loops; regex has no way to express "everything between this `{{#if}}` and its matching `{{/if}}`" once nesting is involved (nested `{{#if}}` inside another `{{#if}}` breaks naive regex immediately). This is the same "text isn't structure" problem LAB-80/81/82 solved for Nano — a template is a small language, and needs the same lex → parse → (compile or evaluate) pipeline.

**The solution:** Tokenize the template into alternating "literal text" and "`{{...}}` expression" chunks, parse the expression chunks into a small AST (reusing the *shape* of Nano's expression grammar, not its keyword set), and compile the whole thing into a single JavaScript function that concatenates literal text with evaluated expressions and rendered sub-blocks. Compiling once and calling the resulting function repeatedly is exactly LAB-84's "compile once, run many times" argument, applied to templates instead of a general-purpose language.

**Canonical example:**

```typescript
function compileTemplate(source: string): (data: Record<string, unknown>) => string {
  const nodes = parseTemplate(tokenizeTemplate(source))
  return (data) => nodes.map(node => renderNode(node, data)).join("")
}
```

**Project Application:** LAB-86's DSL and LAB-91's code generator both reuse this "small custom grammar → compiled render/generation function" shape — this lab is the first of Phase 7's mini-projects to combine everything LAB-80–84 built into one complete, useful tool.

**Watch for:** Forgetting to handle nested blocks when matching `{{#if}}...{{/if}}` — a stack-based matching approach (push on `{{#if}}`, pop on matching `{{/if}}`) is required, mirroring LAB-82's parser needing recursive functions rather than a single flat scan, once nesting enters the picture.

## Step 1: Tokenizing mixed text and expressions

```typescript
type TemplateToken =
  | { type: "TEXT"; value: string }
  | { type: "EXPRESSION"; value: string }   // {{name}}
  | { type: "IF_OPEN"; value: string }      // {{#if condition}}
  | { type: "IF_CLOSE" }                    // {{/if}}
  | { type: "EACH_OPEN"; value: string }    // {{#each items}}
  | { type: "EACH_CLOSE" }                  // {{/each}}

function tokenizeTemplate(source: string): TemplateToken[] {
  const tokens: TemplateToken[] = []
  const pattern = /\{\{(#if|\/if|#each|\/each)?\s*([^}]*)\}\}/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "TEXT", value: source.slice(lastIndex, match.index) })
    }
    const [, tag, content] = match
    if (tag === "#if") tokens.push({ type: "IF_OPEN", value: content.trim() })
    else if (tag === "/if") tokens.push({ type: "IF_CLOSE" })
    else if (tag === "#each") tokens.push({ type: "EACH_OPEN", value: content.trim() })
    else if (tag === "/each") tokens.push({ type: "EACH_CLOSE" })
    else tokens.push({ type: "EXPRESSION", value: content.trim() })
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < source.length) tokens.push({ type: "TEXT", value: source.slice(lastIndex) })
  return tokens
}
```

This mirrors LAB-80's lexer structure — scan forward, classify each chunk, emit a token — just with a regex driving the sliding window instead of a hand-rolled character loop, since template syntax (`{{...}}` delimiters) is regular enough not to need LAB-80's manual character classification.

### SAVE AND TRY

```typescript
console.log(tokenizeTemplate("Hello {{name}}!"))
// [{type:"TEXT", value:"Hello "}, {type:"EXPRESSION", value:"name"}, {type:"TEXT", value:"!"}]

console.log(tokenizeTemplate("{{#if visible}}shown{{/if}}"))
// [{type:"IF_OPEN", value:"visible"}, {type:"TEXT", value:"shown"}, {type:"IF_CLOSE"}]
```

## Step 2: Parsing tokens into a tree — handling nesting

```typescript
type TemplateNode =
  | { type: "Text"; value: string }
  | { type: "Interpolation"; expression: string }
  | { type: "If"; condition: string; body: TemplateNode[] }
  | { type: "Each"; iterable: string; body: TemplateNode[] }

function parseTemplate(tokens: TemplateToken[]): TemplateNode[] {
  let pos = 0

  function parseNodes(): TemplateNode[] {
    const nodes: TemplateNode[] = []
    while (pos < tokens.length && tokens[pos].type !== "IF_CLOSE" && tokens[pos].type !== "EACH_CLOSE") {
      const token = tokens[pos]
      if (token.type === "TEXT") { nodes.push({ type: "Text", value: token.value }); pos++ }
      else if (token.type === "EXPRESSION") { nodes.push({ type: "Interpolation", expression: token.value }); pos++ }
      else if (token.type === "IF_OPEN") {
        pos++
        const body = parseNodes()
        pos++ // consume IF_CLOSE
        nodes.push({ type: "If", condition: token.value, body })
      } else if (token.type === "EACH_OPEN") {
        pos++
        const body = parseNodes()
        pos++ // consume EACH_CLOSE
        nodes.push({ type: "Each", iterable: token.value, body })
      }
    }
    return nodes
  }

  return parseNodes()
}
```

`parseNodes` calling itself recursively for `IF_OPEN`/`EACH_OPEN` bodies is LAB-82's recursive descent technique again — a block's body is parsed by the *same* function that parses the top level, and it naturally stops when it hits a matching `IF_CLOSE`/`EACH_CLOSE`, which is what correctly handles nesting: an inner `{{#if}}...{{/if}}` gets fully consumed by its own recursive call before the outer block's `parseNodes` ever sees the outer `{{/if}}`.

### SAVE AND TRY

```typescript
const tokens = tokenizeTemplate("{{#if a}}{{#if b}}both{{/if}}{{/if}}")
const ast = parseTemplate(tokens)
console.log(JSON.stringify(ast, null, 2))
// [{ type: "If", condition: "a", body: [{ type: "If", condition: "b", body: [{ type: "Text", value: "both" }] }] }]
```

The inner `If` node is correctly nested *inside* the outer `If`'s `body` array — proving the recursive parser correctly matched each `{{/if}}` to its nearest unclosed `{{#if}}`, not just the first `{{/if}}` it happened to scan past.

## Step 3: Rendering — walking the tree with data

```typescript
function getValue(path: string, data: Record<string, unknown>): unknown {
  return path.split(".").reduce((obj: any, key) => obj?.[key], data)
}

function renderNodes(nodes: TemplateNode[], data: Record<string, unknown>): string {
  return nodes.map(node => renderNode(node, data)).join("")
}

function renderNode(node: TemplateNode, data: Record<string, unknown>): string {
  switch (node.type) {
    case "Text": return node.value
    case "Interpolation": return String(getValue(node.expression, data) ?? "")
    case "If": return getValue(node.condition, data) ? renderNodes(node.body, data) : ""
    case "Each": {
      const items = getValue(node.iterable, data)
      if (!Array.isArray(items)) return ""
      return items.map(item => renderNodes(node.body, typeof item === "object" ? { ...data, ...item } : { ...data, this: item })).join("")
    }
  }
}
```

`getValue` supports dotted paths (`user.name`) via `reduce`, so `{{user.name}}` works the same way object property access would in a real language — a small piece of expression evaluation, reused from the same instinct as LAB-83's `Identifier` lookup, just simpler since templates don't need full expression precedence. `renderNode`'s `switch (node.type)` is, again, the same dispatch shape as every AST-walking function in this curriculum (LAB-81's printer, LAB-83's interpreter, LAB-84's compiler) — a template tree is walked exactly like a code tree, because it *is* one.

### SAVE AND TRY

```typescript
const template = "Hello {{name}}! {{#if hasItems}}You have {{count}} items.{{/if}}"
const ast = parseTemplate(tokenizeTemplate(template))
console.log(renderNodes(ast, { name: "Ada", hasItems: true, count: 3 }))
// "Hello Ada! You have 3 items."
console.log(renderNodes(ast, { name: "Grace", hasItems: false, count: 0 }))
// "Hello Grace! "
```

## Step 4: Compiling to a reusable render function

```typescript
function compileTemplate(source: string): (data: Record<string, unknown>) => string {
  const ast = parseTemplate(tokenizeTemplate(source)) // parsed ONCE, here
  return (data: Record<string, unknown>) => renderNodes(ast, data) // re-walked on every call, but never re-parsed
}
```

This is the entire payoff named in the concept section: `compileTemplate` does the expensive work (tokenize + parse) exactly once, and returns a closure — reusing LAB-83's closure mechanism directly — that captures `ast` and can be called repeatedly with different `data`, never touching the raw template string again.

### SAVE AND TRY

```typescript
const render = compileTemplate("{{#each users}}{{name}} ({{age}}); {{/each}}")
console.log(render({ users: [{ name: "Ada", age: 30 }, { name: "Grace", age: 45 }] }))
// "Ada (30); Grace (45); "
```

Time 1,000 calls to `render(data)` with different `data` objects versus 1,000 calls to `renderNodes(parseTemplate(tokenizeTemplate(source)), data)` (re-parsing every time) — the compiled version should be measurably faster, since it skips tokenizing and parsing on every call.

## 🎯 Challenge

Add an `{{else}}` clause to `{{#if}}` blocks, so `{{#if visible}}shown{{else}}hidden{{/if}}` renders one branch or the other. This requires the tokenizer to recognize `{{else}}`, and the parser to split a single `If` block's body into two parts at the `else` marker.

<details>
<summary>Solution</summary>

```typescript
// tokenizeTemplate: add an ELSE token type and recognize {{else}}
type TemplateToken = /* ...existing... */ | { type: "ELSE" }
// in the regex loop: else if (tag === undefined && content.trim() === "else") tokens.push({ type: "ELSE" })
// (checked before the generic EXPRESSION fallback)

// TemplateNode: add elseBody
interface IfNode { type: "If"; condition: string; body: TemplateNode[]; elseBody: TemplateNode[] }

function parseNodes(): TemplateNode[] {
  const nodes: TemplateNode[] = []
  while (pos < tokens.length && tokens[pos].type !== "IF_CLOSE" && tokens[pos].type !== "EACH_CLOSE" && tokens[pos].type !== "ELSE") {
    // ...existing TEXT/EXPRESSION/EACH_OPEN handling...
    if (tokens[pos].type === "IF_OPEN") {
      const condition = tokens[pos].value
      pos++
      const body = parseNodes()
      let elseBody: TemplateNode[] = []
      if (tokens[pos]?.type === "ELSE") { pos++; elseBody = parseNodes() }
      pos++ // consume IF_CLOSE
      nodes.push({ type: "If", condition, body, elseBody })
    }
  }
  return nodes
}

// renderNode:
// case "If": return getValue(node.condition, data) ? renderNodes(node.body, data) : renderNodes(node.elseBody, data)
```

`parseNodes` now also stops at an `ELSE` token (added to its `while` condition), the same trick already used to stop at `IF_CLOSE`/`EACH_CLOSE` — after consuming the `body` up to `ELSE`, the parser checks for and consumes an optional `elseBody` before finally consuming `IF_CLOSE`, exactly mirroring how LAB-82's `parseIfStatement` handled Nano's optional `else`.

</details>

## Mental Model

| Concept | Naive string replacement | Template compiler |
|---|---|---|
| `{{name}}` | Regex substitution | `Interpolation` node, evaluated via `getValue` |
| `{{#if}}...{{/if}}` | Breaks on nesting | Recursive parse, correctly matches nested blocks |
| Re-rendering with new data | Re-run the whole regex pass | Call the already-compiled function again |
| Where the "parsing cost" goes | Paid on every render | Paid once, in `compileTemplate` |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why can't a single regex substitution handle nested `{{#if}}` blocks correctly? | |
| 2 | What does `parseNodes` calling itself recursively for a block's body accomplish? | |
| 3 | What does `compileTemplate` return, and why is that a closure rather than a plain value? | |

## Quick Check Answers

1. A template mixes literal text with embedded logic that has real structure (conditionals nest, loops have bodies) — regex substitution can match individual tags but has no way to track matching nested pairs, so it collapses into an actual lex/parse/execute pipeline once nesting or control flow enters the picture.
2. Interpolation just substitutes a value in place; control-flow tags mark the start/end of a *block* of other nodes that must be parsed recursively (and conditionally rendered or repeated) rather than substituted directly.
3. Because re-parsing the same template text on every render repeats identical, wasted work — tokenizing and parsing produce the same AST every time for a fixed template string, so doing it once and reusing the result for every subsequent render with different data avoids that repeated cost.

*Next: [LAB-86 — DSL](LAB-86-dsl.md)*
