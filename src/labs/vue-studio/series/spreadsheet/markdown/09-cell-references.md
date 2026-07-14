# Vue Spreadsheet — Lesson 09 — Cell References

## What you will build

`=A1+B1` finally reads two other cells' values. Type `5` in A1, `10` in B1, then `=A1+B1` in C1 — C1 displays `15`. Change A1 to `20` — C1 updates to `30` automatically, without touching anything else. This is the first time a formula connects to the live grid rather than working with literal numbers only.

```
    A      B      C
1 | 5   | 10  | =A1+B1 → 15 |
```

---

## What you need to know first

Lesson 08 left `evaluate(node)` able to compute arithmetic formulas with literal numbers. The parser's `Primary` rule only handles numbers and parenthesized expressions. Cell references in the token list (`{ type: 'cell', name: 'A1' }`) are produced by `tokenize` but ignored by `parsePrimary`.

---

## Step 1 — A fourth node type

**The problem:** `parsePrimary` ignores `cell` tokens. They need to become AST nodes.

Add `CellReferenceNode` to `ExpressionNode`:

```typescript
interface CellReferenceNode {
  kind: 'CellReference'
  name: string
}

type ExpressionNode =
  | NumberNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | CellReferenceNode
```

`CellReferenceNode` carries the cell's name — `"A1"`, `"B12"` — as a string. The evaluator will look up this name in the `cells` map.

With four variants now, `assertNever` in `evaluate`'s `default` case immediately catches that a new case is needed — you will see a TypeScript error on `assertNever(node)` until Step 2 is complete.

---

## Step 2 — Recognise cell tokens in `parsePrimary`

**The problem:** `parsePrimary` throws on cell tokens — they are not "unexpected" once formula support exists.

Add one branch to `parsePrimary`, before the final `throw`:

```typescript
function parsePrimary(): ExpressionNode {
  const token = peek()

  if (!token) throw new Error('Expected a number, cell, or "(", but the formula ended')

  if (token.type === 'number') {
    advance()
    return { kind: 'Number', value: token.value }
  }

  if (token.type === 'cell') {          // ← new branch
    advance()
    return { kind: 'CellReference', name: token.name }
  }

  if (token.type === 'paren' && token.value === '(') {
    advance()
    const expression = parseExpression()
    const closing = peek()
    if (!closing || closing.type !== 'paren' || closing.value !== ')') {
      throw new Error('Expected a closing ")"')
    }
    advance()
    return expression
  }

  throw new Error(`Unexpected token: ${JSON.stringify(token)}`)
}
```

Run a throwaway to see the AST for a cell-reference formula:

```vue
<script setup lang="ts">
// (paste full tokenize + parse definitions here, or use the running project)
// For clarity, just show what the AST looks like:
type ExpressionNode =
  | { kind: 'Number'; value: number }
  | { kind: 'CellReference'; name: string }
  | { kind: 'BinaryExpression'; operator: string; left: ExpressionNode; right: ExpressionNode }

const manualAst: ExpressionNode = {
  kind: 'BinaryExpression',
  operator: '+',
  left:  { kind: 'CellReference', name: 'A1' },
  right: { kind: 'CellReference', name: 'B1' },
}
</script>
<template>
  <pre>{{ JSON.stringify(manualAst, null, 2) }}</pre>
</template>
```

This is what `parse(tokenize('A1+B1'))` will now produce. The AST correctly identifies that both operands are cell references, not literal numbers.

---

## Step 3 — Look up cell values during evaluation

**The problem:** `evaluate(node)` does not know how to resolve a `CellReferenceNode`. And even if it did, it currently has no access to the `cells` map.

The key design decision: `evaluate` must receive a cell-lookup function as a parameter, rather than closing over `cells.value` directly. This keeps `evaluate` pure with respect to its inputs — the same tree plus the same lookup function always produces the same result — and makes it testable in isolation.

Update `evaluate`'s signature and add the `'CellReference'` case:

```typescript
function evaluate(
  node: ExpressionNode,
  lookupCell: (name: string) => number
): number {
  switch (node.kind) {
    case 'Number':
      return node.value

    case 'UnaryExpression':
      return -evaluate(node.operand, lookupCell)

    case 'BinaryExpression': {
      const left  = evaluate(node.left,  lookupCell)
      const right = evaluate(node.right, lookupCell)
      return applyOperator(node.operator, left, right)
    }

    case 'CellReference':
      return lookupCell(node.name)

    default:
      return assertNever(node)
  }
}
```

Every recursive call now threads `lookupCell` through. `lookupCell` is a function passed in from the outside — `evaluate` calls it with a name and gets a number back. What that function actually does (look up `cells.value`, handle missing cells, recursively evaluate other formulas) is entirely the caller's concern.

---

## Step 4 — Provide the lookup function from `displayCell`

**The problem:** `displayCell` calls `evaluate`, but `evaluate` now needs a `lookupCell` function. `displayCell` is a pure function with no access to `cells.value`.

Update `displayCell`'s signature to accept `allCells`:

```typescript
function displayCell(
  cell: Cell | undefined,
  allCells: Record<CellId, Cell>
): string {
  if (!cell) return ''

  switch (cell.kind) {
    case 'number':  return cell.value.toString()
    case 'text':    return cell.value
    case 'formula': {
      const parseResult = parse(tokenize(cell.expr))
      if (parseResult.success === false) return '#ERROR'

      function lookupCell(name: string): number {
        const referenced = allCells[name]
        if (!referenced)                 return 0
        if (referenced.kind === 'number') return referenced.value
        if (referenced.kind === 'text')   return 0
        // formula cell — evaluate recursively
        const refParse = parse(tokenize(referenced.expr))
        if (refParse.success === false) return 0
        return evaluate(refParse.ast, lookupCell)
      }

      return evaluate(parseResult.ast, lookupCell).toString()
    }
    default: return assertNever(cell)
  }
}
```

`lookupCell` is defined inside the `'formula'` case. It is a recursive function: evaluating a cell that references another formula cell calls `evaluate` on that formula's AST, passing the same `lookupCell` — which can look up yet another cell, and so on.

**Note on circular references:** `=A1` in A1 would cause infinite recursion — `lookupCell('A1')` evaluating A1 calls `lookupCell('A1')` again forever. Detecting circular references is a real problem; lesson 10 handles it. For now, this is a known limitation, not a bug to paper over.

Update `editableText` signature similarly (it does not need `allCells` since it never evaluates, but add it for consistency):

```typescript
function editableText(cell: Cell | undefined): string {
  // unchanged — editableText never evaluates formulas
}
```

Update every call to `displayCell` in the template to pass `cells`:

```html
<!-- In the input :value (editableText, not displayCell) -->
:value="editableText(cells[cellId({ col, row })])"

<!-- In the display branch -->
{{ displayCell(cells[cellId({ col, row })], cells) }}
```

Update `debugInfo` computed to pass `cells.value` to `displayCell`:

```typescript
const debugInfo = computed<DebugInfo | null>(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return null
  const cell = cells.value[cellId(sel)]
  if (!cell || cell.kind !== 'formula') return null
  try {
    const tokens = tokenize(cell.expr)
    const parseResult = parse(tokens)
    const result = parseResult.success === true
      ? evaluate(parseResult.ast, (name) => {
          const c = cells.value[name]
          if (!c || c.kind === 'text') return 0
          if (c.kind === 'number') return c.value
          const pr = parse(tokenize(c.expr))
          return pr.success === true ? evaluate(pr.ast, () => 0) : 0
        })
      : null
    return { tokens, parseResult, result }
  } catch {
    return null
  }
})
```

Click ▶ Run. Type `5` in A1, `10` in B1, `=A1+B1` in C1 — C1 shows `15`. Change A1 to `20` — C1 immediately shows `30`. Change B1 to `0` — C1 shows `20`. The reactive graph connects cell changes to formula re-evaluation automatically: `cells.value` changes → everything reading `cells` (including the template's `displayCell(cells[...], cells)` calls) is invalidated → Vue re-renders.

---

## Walkthrough — why `lookupCell` is a parameter, not a closure over `cells.value`

You could instead write:

```typescript
function evaluate(node: ExpressionNode): number {
  // ...
  case 'CellReference':
    const c = cells.value[node.name]   // closes over cells directly
    // ...
}
```

This works but loses testability. `evaluate` can no longer be called without a reactive `cells` ref in scope. You cannot call `evaluate(tree)` from the browser console with a mock cell map. You cannot unit-test `evaluate` in isolation. The function is now entangled with Vue's reactive system.

Passing `lookupCell` as a parameter keeps `evaluate` testable in isolation:

```typescript
// Test: does evaluate correctly look up cell values?
const mockLookup = (name: string): number => ({ 'A1': 5, 'B1': 10 })[name] ?? 0
const result = evaluate(parseResult.ast, mockLookup)
// No Vue, no cells ref, no reactive system needed
```

This is a general principle: separate the computation from the data source. `evaluate` is the computation; the caller provides the data source.

---

## Walkthrough — why C1 updates when A1 changes

```html
{{ displayCell(cells[cellId({ col, row })], cells) }}
```

This template expression reads `cells` (auto-unwrapped from `cells` ref) twice: once to get the current cell, once to pass the full map to `displayCell`. Vue tracks both reads. Any write to `cells.value` — including `cells.value['A1'] = parseRawInput('20')` from `commitEdit` — invalidates every template expression that read `cells.value`. All sixty cells' display expressions are re-evaluated. C1's `displayCell` calls `lookupCell('A1')`, gets the new value `20`, and returns `30`.

This looks expensive: re-evaluating sixty cells on every edit. For a small grid it is imperceptible. For a large grid with complex formulas, Vue's `computed` can help: wrapping all cell evaluations in a single `computed` means the sixty evaluations run once per change, not once per template expression. Lesson 10 covers this optimisation.

---

## What breaks without this

**Leaving `parsePrimary` to throw on cell tokens:**

Type `=A1+B1`. `tokenize` produces the correct tokens. `parsePrimary` encounters `{ type: 'cell', name: 'A1' }` and throws "Unexpected token". The debug panel shows a parse error. C1 shows `#ERROR`. The formula never evaluates.

**Not passing `lookupCell` through every recursive `evaluate` call:**

Add a nested formula: A1 contains `=B1+1`, B1 contains `5`, C1 contains `=A1*2`. Evaluating C1 calls `lookupCell('A1')`. `lookupCell` sees A1 is a formula and calls `evaluate(refParse.ast, lookupCell)`. Without threading `lookupCell`, the recursive call would use the wrong lookup function — or fail entirely. Nesting works because every recursive call uses the same `lookupCell`.

**A circular reference:** Set A1 to `=A1`. `lookupCell('A1')` evaluates A1, which calls `lookupCell('A1')` again, which evaluates A1, infinitely. The browser tab eventually crashes. Detecting this requires tracking which cells are currently being evaluated — a visited set — added in lesson 10.

---

## Connect the pieces

```
App.vue
  <script setup>
    CellReferenceNode   — new ExpressionNode variant: { kind, name }
    parsePrimary()      — new branch: cell token → CellReferenceNode
    evaluate()          — new parameter: lookupCell(name) → number;
                          new case: 'CellReference' calls lookupCell
    displayCell()       — new parameter: allCells; provides lookupCell
                          to evaluate; handles recursive formula lookup
  <template>
    displayCell(cells[...], cells)  — passes full cells map
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Typing `5` in A1, `10` in B1, `=A1+B1` in C1 shows `15` in C1
- [ ] Changing A1 to `20` updates C1 to `30` without any other action
- [ ] `=A1*2+B1` evaluates correctly using operator precedence
- [ ] A formula referencing a text cell (`=A1` where A1 contains `"hello"`) returns `0`
- [ ] You can explain why `lookupCell` is a parameter to `evaluate` rather than a closure over `cells.value`
- [ ] You can explain what happens with `=A1` in A1 (circular reference) and why lesson 10 is needed

---

*Next: Lesson 10 — Dependency Graph. Circular references crash the tab. The solution is tracking which cells are currently being evaluated, detecting the cycle, and returning `#CIRCULAR` instead of infinite recursion — and as a side effect, the reactive update logic becomes more efficient.*
