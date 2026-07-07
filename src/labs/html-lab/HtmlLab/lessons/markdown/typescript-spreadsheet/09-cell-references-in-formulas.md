# TypeScript Spreadsheet — Lesson 09 — Cell References in Formulas

## What You Will Build

Put `5` in A1, `3` in B1, then type `=A1+B1` into C1: it shows `8`, reading
two other cells' real, current values. The tokenizer already recognised
`A1` as a `'cell'` token back in lesson 06 — nothing about it changes here.
What extends is the parser's `Primary` rule, gaining its second case, and
the evaluator, gaining a way to reach outside the one formula it is
currently walking and into the rest of the spreadsheet.

---

## What You Need to Know First

Lesson 08 left `evaluate(node)` walking `Number`, `UnaryExpression`, and
`BinaryExpression` nodes, with `applyOperator` handling the four
arithmetic operators.

---

## Step 1 — A Node for a Cell Reference

**The problem:** Nothing in `ExpressionNode` can represent "the value in
some other cell."

Add to `script.ts`:

```typescript
interface CellReferenceNode {
  kind: 'CellReference';
  name: string;
}

type ExpressionNode =
  | NumberNode
  | CellReferenceNode
  | UnaryExpressionNode
  | BinaryExpressionNode;
```

**Walkthrough:** `CellReferenceNode` carries just one field, `name` — the
referenced cell's id as text, like `"A1"`. Nothing about resolving *what
value* that cell actually holds belongs here; an AST node's only job,
consistently since lesson 07, is representing *structure*, never
computing anything.

---

## Step 2 — Extend the Parser's `Primary` Rule

**The problem:** `parsePrimary` currently only recognises numbers and
parenthesized expressions — a `'cell'` token reaches its final `throw` and
fails.

Update `parsePrimary` in `script.ts`, adding one more case:

```typescript
function parsePrimary(): ExpressionNode {
  const token = peek();

  if (!token) {
    throw new Error('Expected a number, cell reference, or "(", but the formula ended');
  }

  if (token.type === 'number') {
    advance();
    return { kind: 'Number', value: token.value };
  }

  if (token.type === 'cell') {
    advance();
    return { kind: 'CellReference', name: token.name };
  }

  if (token.type === 'paren' && token.value === '(') {
    advance();
    const expression = parseExpression();

    const closingToken = peek();
    if (!closingToken || closingToken.type !== 'paren' || closingToken.value !== ')') {
      throw new Error('Expected a closing ")"');
    }
    advance();

    return expression;
  }

  throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
}
```

Click **▶ Preview**, select a cell containing `=A1+B1`: the debug panel's
AST now shows a real `CellReference` node wherever `A1` or `B1` appears,
with no other function touched at all.

**Walkthrough — extending, not rewriting.** `parseUnary`,
`parseMultiplication`, and `parseAddition` needed zero changes.
`parsePrimary` grew one more `if` block, in the same shape as its
existing ones, and every level above it already knows how to combine
*any* `ExpressionNode` — including a brand-new kind it has never
specifically been told about — because they only ever call `parsePrimary`
(indirectly) and combine whatever comes back. This is precisely the value
`assertNever` protects: the moment a fourth AST node kind is added
anywhere a `switch` consumes `ExpressionNode`, that switch will refuse to
compile until it accounts for the new case — but nothing about *parsing*
required touching four different functions just to add one.

---

## Step 3 — Resolve a Reference by Recursively Evaluating It

**The problem:** `evaluate` has no way to answer "what is A1's value?" —
and answering that question honestly means it might have to evaluate
*another formula*, not just look up a stored number.

Update `evaluate` in `script.ts` to accept a lookup function, and add a
new case:

```typescript
function evaluate(node: ExpressionNode, lookupCell: (name: CellId) => number): number {
  switch (node.kind) {
    case 'Number':
      return node.value;
    case 'CellReference':
      return lookupCell(node.name);
    case 'UnaryExpression':
      return -evaluate(node.operand, lookupCell);
    case 'BinaryExpression': {
      const left = evaluate(node.left, lookupCell);
      const right = evaluate(node.right, lookupCell);
      return applyOperator(node.operator, left, right);
    }
    default:
      return assertNever(node);
  }
}

function lookupCellValue(name: CellId): number {
  const referencedCell = cells[name];

  if (!referencedCell) {
    return 0;
  }

  switch (referencedCell.kind) {
    case 'number':
      return referencedCell.value;
    case 'text':
      return 0;
    case 'formula': {
      const parseResult = parse(tokenize(referencedCell.expr));
      if (parseResult.success === false) {
        return 0;
      }
      return evaluate(parseResult.ast, lookupCellValue);
    }
    default:
      return assertNever(referencedCell);
  }
}
```

Update `displayCell`'s `'formula'` case in `script.ts`:

```typescript
case 'formula': {
  const parseResult = parse(tokenize(cell.expr));
  if (parseResult.success === false) {
    return '#ERROR';
  }
  return evaluate(parseResult.ast, lookupCellValue).toString();
}
```

Update `updateDebugPanel`'s result line the same way:

```typescript
resultOutput.textContent = evaluate(parseResult.ast, lookupCellValue).toString();
```

Click **▶ Preview**. Put `5` in A1, `3` in B1, then `=A1+B1` in C1: it
shows `8`. Change A1 to `10` and re-commit C1's own formula (retyping the
same text and pressing Enter again): it now shows `13`.

**Walkthrough — why `evaluate` takes `lookupCell` as a parameter instead
of reaching for `cells` directly.** `evaluate` could have referenced the
global `cells` object directly inside its `'CellReference'` case — but
passing the lookup behaviour in as a parameter keeps `evaluate` itself
focused purely on *tree-walking*, with no built-in assumption about where
a referenced value actually comes from. `lookupCellValue` is the one
function that actually knows about `cells`; `evaluate` only knows it was
handed *some* function from a name to a number, and trusts it.

**Walkthrough — `lookupCellValue`'s honest choices.** An empty cell
(`!referencedCell`) and a cell holding plain text both resolve to `0` —
a real, deliberate simplification, matching a convention many real
spreadsheets use, and one this project states outright rather than
leaving to guesswork. Whether text really should silently become `0` in
arithmetic, or instead produce a visible error, is a genuine design
question — lesson 13, Errors as Values, is where this project gives it a
proper, considered answer, once enough real failure cases exist to make
that decision meaningfully.

**Walkthrough — the recursive heart of this lesson.** If the referenced
cell is itself a formula, `lookupCellValue` parses and evaluates *that*
formula too, calling `evaluate(parseResult.ast, lookupCellValue)` —
passing *itself* back in as the lookup function for whatever *that*
formula might reference. A chain like C1 `=B1+1`, B1 `=A1+1`, A1 `5`
resolves correctly, however many cells deep the chain goes, because each
level asks the exact same question of whatever it depends on.

**A real, serious gap, named honestly.** If A1's formula referenced B1,
and B1's formula referenced A1, `lookupCellValue` would call itself,
which would call itself, forever — a real infinite recursion that would
freeze this project's tab. Nothing in this lesson's code detects or
prevents that yet. This is not an oversight left in by accident: lesson
12, Circular References, exists specifically to solve this one problem
properly, with a real, general technique. For now, simply avoid typing a
circular formula by hand — nothing will stop you if you do.

---

## Connect the Pieces

```
script.ts    CellReferenceNode — ExpressionNode's fourth variant
             parsePrimary() — one new case, everything above it unchanged
             evaluate() — now takes a lookupCell function instead of
             assuming where values come from
             lookupCellValue() — the only function that reads cells
             directly during evaluation; recursively re-parses and
             re-evaluates any formula it finds along the way
```

---

## What Breaks Without This

**Typing a circular formula on purpose, right now, to see the real
cost:** Put `=B1` in A1, then `=A1` in B1. The browser tab freezes or
crashes — `lookupCellValue` calling itself with no way to ever stop. This
is not a hypothetical; it is the exact, real failure lesson 12 exists to
prevent. Reload the page afterward — the frozen tab may need to be closed
and reopened.

**Making `evaluate` reach for the global `cells` variable directly instead
of accepting `lookupCell` as a parameter:** Nothing breaks immediately —
but `evaluate` can no longer be tested or reasoned about without the
entire spreadsheet's state existing alongside it, the same independence
lesson 07 built the parser around, now quietly lost for the evaluator
instead.

---

## Definition of Done

- [ ] `=A1+B1` correctly reads both cells' real values
- [ ] Changing a referenced cell and re-committing the formula shows the updated result
- [ ] A chain of formulas referencing each other (A1 → B1 → C1) resolves correctly at any depth
- [ ] An empty or text-holding referenced cell contributes `0`, without crashing
- [ ] You can explain why `evaluate` accepts `lookupCell` as a parameter instead of reading `cells` directly
- [ ] You can explain, precisely, what happens right now if two cells reference each other, and why lesson 12 exists

---

*Next: Lesson 10 — Functions and Ranges. `=SUM(A1:A10)` needs a fifth kind
of token, a fifth kind of AST node, and a real way to turn `A1:A10` into
the ten individual cells it actually refers to.*
