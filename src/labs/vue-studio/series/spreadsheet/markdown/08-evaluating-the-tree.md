# Vue Spreadsheet — Lesson 08 — Evaluating the Tree

## What you will build

Type `=10+5*2` into a cell, press Enter, and it displays `20` — not the raw formula text, not `30`. The AST lesson 07 built already has the correct shape; this lesson walks it and produces a real number. This is also the moment `displayCell` must split into two functions: what you see while *looking* at a cell, and what you see while *editing* it.

```
    A         B         C
1 | 10     | 5      | =A1+B1*2  |   ← shows 20
```

---

## What you need to know first

Lesson 07 left `parse(tokens)` returning a `ParseResult` — either a real `ExpressionNode` tree or a clear error. `Number`, `UnaryExpression`, and `BinaryExpression` are the only three node kinds so far.

---

## Step 1 — Walk the tree

**The problem:** Nothing yet turns an `ExpressionNode` into a number.

Add to `<script setup>`:

```typescript
function applyOperator(operator: '+' | '-' | '*' | '/', left: number, right: number): number {
  switch (operator) {
    case '+': return left + right
    case '-': return left - right
    case '*': return left * right
    case '/': return left / right
    default:  return assertNever(operator)
  }
}

function evaluate(node: ExpressionNode): number {
  switch (node.kind) {
    case 'Number':
      return node.value

    case 'UnaryExpression':
      return -evaluate(node.operand)

    case 'BinaryExpression': {
      const left  = evaluate(node.left)
      const right = evaluate(node.right)
      return applyOperator(node.operator, left, right)
    }

    default:
      return assertNever(node)
  }
}
```

**Before reading the walkthrough, run this throwaway to see `evaluate` working on a tree you build by hand:**

```vue
<script setup lang="ts">
interface NumberNode { kind: 'Number'; value: number }
interface UnaryExpressionNode { kind: 'UnaryExpression'; operator: '-'; operand: ExpressionNode }
interface BinaryExpressionNode { kind: 'BinaryExpression'; operator: '+' | '-' | '*' | '/'; left: ExpressionNode; right: ExpressionNode }
type ExpressionNode = NumberNode | UnaryExpressionNode | BinaryExpressionNode

function applyOperator(op: '+' | '-' | '*' | '/', l: number, r: number): number {
  switch (op) {
    case '+': return l + r
    case '-': return l - r
    case '*': return l * r
    case '/': return l / r
  }
}

function evaluate(node: ExpressionNode): number {
  switch (node.kind) {
    case 'Number': return node.value
    case 'UnaryExpression': return -evaluate(node.operand)
    case 'BinaryExpression': {
      return applyOperator(node.operator, evaluate(node.left), evaluate(node.right))
    }
  }
}

// The tree for 10+5*2: * is nested inside +
const tree: ExpressionNode = {
  kind: 'BinaryExpression',
  operator: '+',
  left: { kind: 'Number', value: 10 },
  right: {
    kind: 'BinaryExpression',
    operator: '*',
    left:  { kind: 'Number', value: 5 },
    right: { kind: 'Number', value: 2 },
  }
}

// What does evaluate do?
// evaluate(+) → evaluate(10) + evaluate(5*2)
//             → 10 + evaluate(*)
//             → 10 + (evaluate(5) * evaluate(2))
//             → 10 + (5 * 2)
//             → 10 + 10
//             → 20

const result = evaluate(tree)  // 20
</script>
<template>
  <p>Result: {{ result }}</p>
  <p>Tree: <pre>{{ JSON.stringify(tree, null, 2) }}</pre></p>
</template>
```

Click ▶ Run. The result is 20. Build a few more trees by hand and evaluate them to get a feel for how the recursive calls flow.

**Walkthrough — recursion, defined precisely, then seen doing the work:**

**Recursion** means a function calling itself, directly or indirectly, to solve a
smaller piece of the same problem it was asked to solve — here, "evaluate this whole
tree" is solved by "evaluate this node's children, then combine their results,"
where "evaluate this node's children" is the exact same job, just handed a smaller
tree. Every recursive function needs a **base case** — a version of the problem small
enough to answer directly, without recursing further, or the function would call
itself forever and eventually crash (a real error, "Maximum call stack size
exceeded" — each pending recursive call reserves space on the **call stack**, and
recursion with no base case fills that space until it runs out). `evaluate`'s base
case is the `'Number'` case: `return node.value` answers immediately, no further
recursion, no children to evaluate. Every other case recurses toward that base case,
never away from it — `node.left` and `node.right` are always smaller trees than
`node` itself.

`evaluate` calls itself twice in the `'BinaryExpression'` case — once for `node.left`, once for `node.right` — *before* computing the node's own result. For `10+5*2`'s tree, evaluating the outer `+` node requires first evaluating its right child, the `5*2` node. The `5*2` node evaluates both its children (both plain `Number` nodes), applies `*`, and returns `10`. The outer `+` then computes `10 + 10 = 20`.

No part of `evaluate` needs to know how deep the tree is. The same handful of lines correctly evaluates a tree one level deep or twenty levels deep. This is the core property of recursive algorithms over recursive structures: the code's structure mirrors the data's structure.

*Recognized elsewhere:* recursion over a tree is not a technique invented for this
project — it is how every real compiler walks an AST (this project's own `evaluate`
is, structurally, a tiny real compiler backend), how a file system's "calculate
folder size" has to work (a folder's size is the sum of its contents' sizes, some of
which are folders too), how JSON.parse and JSON.stringify handle arbitrarily nested
objects and arrays, and how a website's comment-reply threads render nested replies
inside replies. Any time data can contain smaller versions of itself, recursion is
usually the natural way to process it.

**SE concept — `evaluate` is a real, named design pattern: the Interpreter pattern.**
The **Interpreter pattern** (one of the Gang of Four's original 1994 design
patterns) describes exactly this shape: given a grammar represented as a tree of
typed nodes, define one operation that walks the tree and evaluates it, with one
case per node type. That is a precise description of `evaluate` — `ExpressionNode`
is the grammar's tree representation (built by Lesson 07's parser), and `evaluate`
is the interpret operation. This is not a coincidence of naming: this project has
been building a real, textbook Interpreter-pattern implementation since Lesson 06,
one stage at a time, and this lesson is the moment the pattern's namesake operation
— actually interpreting the tree — finally exists.

**CS concept — the time complexity of walking a tree once.** `evaluate` calls
itself exactly once per node in the tree, and does a small, fixed amount of
non-recursive work at each one (reading a field, calling `applyOperator`). This
makes `evaluate` **O(n)** — its running time grows directly in proportion to the
number of nodes in the tree, not the tree's depth, and not anything worse than
linear. A formula with a thousand operators takes roughly a thousand times longer to
evaluate than one with a single operator — not a thousand squared, not exponentially
longer. This is worth stating explicitly rather than assuming: it is the general
pattern for *any* algorithm that visits each element of a structure exactly once,
whether that structure is a tree, an array, or a list — visiting each item once,
doing constant work per item, is the definition of linear time.

**Honest scope note on recursion depth:** each recursive call to `evaluate` waits
for its children's calls to return before it can finish (`applyOperator` needs both
`left` and `right` first) — this is **non-tail recursion**: work happens *after* the
recursive call returns, not as the very last action. Each pending call reserves a
frame on the call stack (the same call stack named in Lesson 07's closures
discussion), so a formula nested a thousand levels deep — vanishingly unlikely for
anything a person would type by hand into a spreadsheet cell, but not impossible for
generated formulas — could in principle exhaust it. This project accepts that limit
deliberately, the same "simplest thing that could possibly work" reasoning Lesson 11
names explicitly: converting `evaluate` to an iterative, explicit-stack version
would remove the limit at the cost of real readability, for a scenario this
project's actual formulas will never approach.

**Walkthrough — `{ }` braces around the `'BinaryExpression'` case:**

```typescript
case 'BinaryExpression': {
  const left  = evaluate(node.left)
  const right = evaluate(node.right)
  return applyOperator(node.operator, left, right)
}
```

The `{ }` braces give this case its own block scope. Without them, all cases in a `switch` share one scope. If two cases both declared `const left`, you would get "Cannot redeclare block-scoped variable 'left'". The braces isolate each case's local variables.

Run this throwaway to see the error:

```vue
<script setup lang="ts">
function demo(x: number): string {
  switch (x) {
    case 1:
      const result = 'one'    // declared here
      return result
    case 2:
      // const result = 'two' // would error: already declared above in same switch scope
      return 'two'
    default:
      return 'other'
  }
}
</script>
<template><p>{{ demo(1) }}</p></template>
```

Try uncommenting the redeclaration. Then add `{ }` braces around each case and try again. The braces fix it.

**Walkthrough — `applyOperator` as a separate function:**

`assertNever` is used twice in this lesson: once for `ExpressionNode`'s three node kinds (inside `evaluate`), once for the four operator strings (inside `applyOperator`). Splitting them apart means each `switch` handles exactly one concern: which kind of node this is, or what this operator means. Two exhaustiveness checks, over two different unions, each clearly scoped.

**Honest scope note:** `left / right` when `right` is `0` does not throw in JavaScript. It returns `Infinity`, `-Infinity`, or `NaN` (for `0/0`) — all technically valid numbers. Whether the spreadsheet should display `Infinity` or a clear error message is a real design question that belongs to a future "error handling" lesson, once there are enough failure modes to answer it properly.

---

## Step 2 — Split `displayCell` into two functions

**The problem:** `displayCell` currently answers two different questions at once: what a cell looks like when you are *viewing* it, and what text appears in the input when you are *editing* it. For numbers and text, those have always been the same answer. For formulas, they cannot be: viewing should show the computed result (`20`), but editing should show the formula (`=10+5*2`). Opening a formula cell for editing and seeing `20` would silently destroy the formula the moment you committed it.

Add `editableText` to `<script setup>`:

```typescript
function editableText(cell: Cell | undefined): string {
  if (!cell) return ''
  switch (cell.kind) {
    case 'number':  return cell.value.toString()
    case 'text':    return cell.value
    case 'formula': return '=' + cell.expr
    default:        return assertNever(cell)
  }
}
```

Update `displayCell`:

```typescript
function displayCell(cell: Cell | undefined): string {
  if (!cell) return ''
  switch (cell.kind) {
    case 'number':  return cell.value.toString()
    case 'text':    return cell.value
    case 'formula': {
      const parseResult = parse(tokenize(cell.expr))
      if (parseResult.success === false) return '#ERROR'
      return evaluate(parseResult.ast).toString()
    }
    default: return assertNever(cell)
  }
}
```

Update the template's `<input>` to use `editableText` instead of `displayCell` for its `:value`:

```html
<input
  class="cell-input"
  :value="editableText(cells[cellId({ col, row })])"
  @keydown.enter.stop="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
  @blur="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
  :ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
/>
```

The display branch stays as `{{ displayCell(cells[cellId({ col, row })]) }}` — unchanged.

Click ▶ Run. Type `=10+5*2` into a cell and press Enter: it shows `20`. Double-click it to edit: the input shows `=10+5*2`, not `20`. Commit without changes: still shows `20`.

**This is the moment lesson 04 predicted:**

When `displayCell` was written for numbers and text, its walkthrough said: "That will not stay true once formulas exist in lesson 05." Two lessons later, that prediction arrived. The split was deferred until it was actually needed — not anticipated with a `forEditing` parameter added speculatively.

**This deferral has a real name: YAGNI — "You Aren't Gonna Need It."** It's one of
Extreme Programming's (an Agile methodology's) founding principles: don't build
flexibility for a need you're only *guessing* will arrive. A `forEditing` boolean
parameter added back in Lesson 04, "just in case," would have sat unused for two full
lessons — extra surface area, extra cognitive load, for a guess. Waiting until Lesson
08 actually needs the split, then building exactly the split that's needed, is not
laziness; it's the discipline of not paying a design cost before the requirement is
real. The cost of guessing wrong is never zero — every unused parameter is something
a future reader has to understand and wonder about.

**Why two small functions instead of one with a flag:**

```typescript
// Possible but worse:
function displayCell(cell, { forEditing = false } = {}) { ... }
```

Every call site must remember which flag means what. A future reader must track two branches inside one function. Two clearly named functions — `editableText` answers "what should the edit input show?", `displayCell` answers "what should the viewer see?" — state their purposes explicitly. The overlap in their first three cases is fine. Small, clearly named functions that share three lines are more readable than one function with a boolean parameter that silently changes its semantics.

---

## Step 3 — Expand the debug panel to show the result

Update `debugInfo` in `<script setup>` to include the evaluated result:

```typescript
interface DebugInfo {
  tokens: Token[]
  parseResult: ParseResult
  result: number | null
}

const debugInfo = computed<DebugInfo | null>(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return null
  const cell = cells.value[cellId(sel)]
  if (!cell || cell.kind !== 'formula') return null
  try {
    const tokens = tokenize(cell.expr)
    const parseResult = parse(tokens)
    const result = parseResult.success === true ? evaluate(parseResult.ast) : null
    return { tokens, parseResult, result }
  } catch {
    return null
  }
})
```

Update the template debug panel to show all three:

```html
<div class="debug-panel" v-if="debugInfo !== null">
  <h3>Tokens</h3>
  <pre>{{ JSON.stringify(debugInfo.tokens, null, 2) }}</pre>

  <h3>AST</h3>
  <template v-if="debugInfo.parseResult.success === true">
    <pre>{{ JSON.stringify(debugInfo.parseResult.ast, null, 2) }}</pre>
  </template>
  <template v-else>
    <pre class="error">Parse error: {{ debugInfo.parseResult.error.message }}</pre>
  </template>

  <h3>Result</h3>
  <pre v-if="debugInfo.result !== null">{{ debugInfo.result }}</pre>
  <pre v-else class="error">(parse failed — no result)</pre>
</div>
<div class="debug-panel debug-empty" v-else>
  <p>(select a formula cell to see the full pipeline)</p>
</div>
```

Click ▶ Run. Select a formula cell — the panel shows the entire pipeline: tokens, AST, and the final computed number.

---

## What breaks without this

**Reverting the input `:value` to `displayCell` instead of `editableText`:**

Type `=10+5*2`, confirm it shows `20`. Double-click to edit — the input shows `20`. Press Enter without changing anything. `commitEdit` calls `parseRawInput('20')` — the number `20` is stored, permanently destroying the formula. The cell now holds the literal number `20`, not a live formula. `editableText` exists specifically to prevent this.

**Removing `{ }` from the `'BinaryExpression'` case in `evaluate`, then adding another case that also declares `const left`:**

TypeScript: "Cannot redeclare block-scoped variable 'left'." The braces are required for multiple cases with their own local declarations.

**Removing `assertNever` from `applyOperator`:**

Add a fifth operator string to `'+' | '-' | '*' | '/'` — say, `'%'`. The switch has no `'%'` case and no `assertNever`. TypeScript says nothing. At runtime, `applyOperator('%', 10, 3)` falls through the switch returning `undefined`, which becomes `NaN` when used as a number. With `assertNever`, adding `'%'` to the union immediately forces you to add a `case '%': return left % right` or the code refuses to compile.

---

## Connect the pieces

```
App.vue
  <script setup>
    applyOperator()    — pure; operator + two numbers → number;
                         assertNever for exhaustiveness
    evaluate()         — pure; ExpressionNode → number; recursive;
                         BinaryExpression case needs { } for scope
    editableText()     — what the edit input shows (formula text preserved)
    displayCell()      — what the viewer sees (formula → computed result)
    debugInfo          — computed; now includes result; still zero calls
  <template>
    :value="editableText(...)"   — edit input uses editableText
    {{ displayCell(...) }}       — display text uses displayCell
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] `=10+5*2` displays `20` in the cell
- [ ] `=(10+5)*2` displays `30` (parentheses override precedence)
- [ ] Double-clicking a formula cell shows the original formula text, not its result
- [ ] The debug panel shows tokens, AST, and result for a selected formula cell
- [ ] A formula with division by zero shows `Infinity` or `NaN` (not an error yet)
- [ ] You can explain why `{ }` braces are needed in the `'BinaryExpression'` switch case
- [ ] You can explain why `editableText` and `displayCell` had to become two separate functions at this exact lesson
- [ ] You can explain why `evaluate` is an instance of the Interpreter pattern, and name the two prior lessons it depends on
- [ ] You can explain why `evaluate` runs in O(n) time relative to the number of AST nodes
- [ ] You can explain what `5/0` evaluates to and why that is not yet the final answer this project gives

---

*Next: Lesson 09 — Cell References. `=A1+B1` finally reads two other cells' values. The parser's `Primary` rule grows a second case, the evaluator grows to match it, and `cells` becomes part of what `evaluate` reads — the first time the evaluator is not pure.*
