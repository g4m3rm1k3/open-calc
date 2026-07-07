# TypeScript Spreadsheet — Lesson 08 — Evaluating the Tree

## What You Will Build

Type `=10+5*2` into a cell, and it finally displays `20` — not the raw
text, not `30`. The AST lesson 07 built already has the correct shape;
this lesson walks it and produces a real number. This is also the moment
`displayCell` finally needs to become two different functions instead of
one, exactly as lesson 04 predicted the day formulas were still two
lessons away.

---

## What You Need to Know First

Lesson 07 left `parse(tokens)` returning a `ParseResult` — either a real
`ExpressionNode` tree, or a clear error — with `Number`, `UnaryExpression`,
and `BinaryExpression` as the only three node kinds so far.

---

## Step 1 — Walk the Tree

**The problem:** Nothing yet turns an `ExpressionNode` into a number.

Add to `script.ts`:

```typescript
function applyOperator(operator: '+' | '-' | '*' | '/', left: number, right: number): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    default:
      return assertNever(operator);
  }
}

function evaluate(node: ExpressionNode): number {
  switch (node.kind) {
    case 'Number':
      return node.value;
    case 'UnaryExpression':
      return -evaluate(node.operand);
    case 'BinaryExpression': {
      const left = evaluate(node.left);
      const right = evaluate(node.right);
      return applyOperator(node.operator, left, right);
    }
    default:
      return assertNever(node);
  }
}
```

**Walkthrough — recursion doing the actual work.** `evaluate` calls
itself twice inside the `'BinaryExpression'` case — once for `node.left`,
once for `node.right` — *before* it can compute anything for the node
itself. For `10+5*2`'s tree, evaluating the outer `+` node first requires
evaluating its right child, the `5*2` node, completely — which itself
just returns `5 * 2`, i.e. `10`, immediately, since both of *its* children
are plain `Number` nodes needing no further recursion. The outer call
then computes `10 + 10`, giving `20`. No part of this function ever needs
to know how deep the tree is, or how many operators a formula contains —
the same handful of lines correctly evaluates a tree ten levels deep or
one level deep.

**Walkthrough — the `{ }` braces around the `'BinaryExpression'` case,
and why they are not just style.** `const left = ...` and `const right =
...` are declared *inside* this one case. Without the braces, every
`case` in a `switch` shares one single block scope — declaring `const
left` in one case and attempting to declare another `const left` in a
different case of the *same* switch would be a real error, "cannot
redeclare block-scoped variable." Wrapping a case's body in `{ }` gives
it its own scope, so its local variables cannot collide with any other
case's, regardless of what any other case happens to declare.

**Walkthrough — `applyOperator` as its own small function, exhaustiveness
checked a third time.** `assertNever`, first built in lesson 05, is used
twice here: once for `ExpressionNode`'s three node kinds, once for
`BinaryExpressionNode`'s four operators. Splitting operator application
into its own function keeps `evaluate`'s own `switch` focused purely on
*which kind of node this is*, while `applyOperator`'s `switch` handles a
completely separate question, *what this specific operator does* — two
different exhaustiveness checks, over two different unions, each doing
exactly one job.

**Honest scope note.** `left / right` when `right` is `0` does not throw
in JavaScript — it produces `Infinity`, `-Infinity`, or (for `0/0`) `NaN`,
all of which are technically real `number` values as far as this function
is concerned. Whether a spreadsheet should show `Infinity` to a person, or
something clearer, is a real design question — lesson 13, Errors as
Values, is where this project answers it properly, once there are enough
real failure cases to justify a considered answer rather than a rushed one.

---

## Step 2 — Split `displayCell` Into Two Functions

**The problem:** `displayCell` currently serves two purposes at once —
what a cell *looks like* when shown plainly, and what text an edit box
should *start with* when you open it. For a `number` or `text` cell,
those have always been identical. For a `formula` cell, they no longer
can be: showing `20` makes sense when just looking at the cell, but
opening it to edit and seeing `20` instead of `=10+5*2` would silently
throw away the actual formula the moment you tried to change it.

Add to `script.ts`:

```typescript
function editableText(cell: Cell | undefined): string {
  if (!cell) {
    return '';
  }

  switch (cell.kind) {
    case 'number':
      return cell.value.toString();
    case 'text':
      return cell.value;
    case 'formula':
      return '=' + cell.expr;
    default:
      return assertNever(cell);
  }
}
```

Update `displayCell` in `script.ts`:

```typescript
function displayCell(cell: Cell | undefined): string {
  if (!cell) {
    return '';
  }

  switch (cell.kind) {
    case 'number':
      return cell.value.toString();
    case 'text':
      return cell.value;
    case 'formula': {
      const parseResult = parse(tokenize(cell.expr));
      if (parseResult.success === false) {
        return '#ERROR';
      }
      return evaluate(parseResult.ast).toString();
    }
    default:
      return assertNever(cell);
  }
}
```

Update `renderCell` in `script.ts` — the editing branch now calls
`editableText`, not `displayCell`:

```typescript
if (isEditing) {
  const input = document.createElement('input');
  input.className = 'cell-input';
  input.value = editableText(cell);
  // ...rest of this block is unchanged
```

Click **▶ Preview**. Type `=10+5*2` into a cell and press Enter: it shows
`20`. Double-click it again to edit: the input shows `=10+5*2`, exactly
as typed, not `20`.

**Walkthrough — this is the moment lesson 04 predicted.** Back when
`displayCell` was written for just numbers and text, its own walkthrough
said plainly: "That will not stay true once formulas exist in lesson 05."
This is that moment, arriving exactly on schedule. `editableText` and
`displayCell` are now allowed to diverge because they answer two
genuinely different questions — "what should a person see while editing?"
versus "what should a person see while not editing?" — that only
*happened* to have the same answer before a cell could compute anything.

**SE lens — `editableText` and `displayCell` share their first three
lines almost exactly, and that repetition is fine.** They could be
merged back into one function taking a flag (`displayCell(cell,
{ forEditing: true })`), but that would make every future call site have
to remember which flag means what, for a distinction that only actually
matters for one of three cell kinds. Two small, clearly-named functions
that happen to overlap are often more readable than one function with a
parameter that silently changes its meaning.

---

## Step 3 — Show the Computed Result in the Debug Panel

**The problem:** The debug panel shows tokens and the AST, but not the
number those actually produce.

Update the HTML tab's debug panel:

```html
<div class="debug-panel">
  <h3>Debug: Tokens</h3>
  <pre id="debug-tokens">(select a formula cell)</pre>
  <h3>Debug: AST</h3>
  <pre id="debug-ast">(select a formula cell)</pre>
  <h3>Debug: Result</h3>
  <pre id="debug-result">(select a formula cell)</pre>
</div>
```

Update `updateDebugPanel` in `script.ts`:

```typescript
function updateDebugPanel(coordinate: Coordinate | null): void {
  const tokensOutput = requireElement('debug-tokens');
  const astOutput = requireElement('debug-ast');
  const resultOutput = requireElement('debug-result');
  const cell = coordinate ? cells[cellId(coordinate)] : undefined;

  if (!cell || cell.kind !== 'formula') {
    tokensOutput.textContent = '(select a formula cell)';
    astOutput.textContent = '(select a formula cell)';
    resultOutput.textContent = '(select a formula cell)';
    return;
  }

  const tokens = tokenize(cell.expr);
  tokensOutput.textContent = JSON.stringify(tokens, null, 2);

  const parseResult = parse(tokens);
  if (parseResult.success === false) {
    astOutput.textContent = `Parse error: ${parseResult.error.message}`;
    resultOutput.textContent = '(no result — parsing failed)';
    return;
  }

  astOutput.textContent = JSON.stringify(parseResult.ast, null, 2);
  resultOutput.textContent = evaluate(parseResult.ast).toString();
}
```

Click **▶ Preview** and select a formula cell: the panel now shows tokens,
tree, and final number together, in order — the entire pipeline, visible
in one place.

---

## Connect the Pieces

```
script.ts    evaluate(), applyOperator() — walk an ExpressionNode
             recursively, producing a real number
             editableText() — what an edit box shows; displayCell() —
             what a non-editing cell shows; identical for number and
             text, genuinely different for formula
```

---

## What Breaks Without This

**Removing the `{ }` braces around the `'BinaryExpression'` case, then
adding a second case elsewhere that also declares `const left`:** Monaco
shows "Cannot redeclare block-scoped variable 'left'" — try it by
temporarily adding a throwaway second case to confirm this for yourself,
then remove it again.

**Editing a formula cell before Step 2's split, using `displayCell` for
both purposes (temporarily revert `renderCell`'s input value back to
`displayCell(cell)`):** Type `=10+5*2`, confirm it shows `20`, then
double-click to edit it. The input shows `20`, not the formula — pressing
Enter without changing anything now stores the *literal number* `20`
where a live formula used to be, permanently losing the original formula
the moment you merely opened and closed the editor.

---

## Definition of Done

- [ ] `=10+5*2` displays as `20`
- [ ] Re-opening a formula cell for editing shows its original formula text, never its computed result
- [ ] The debug panel shows tokens, AST, and final result together for any formula cell
- [ ] You can explain why `evaluate`'s `'BinaryExpression'` case needs its own `{ }` block
- [ ] You can explain why `editableText` and `displayCell` had to become two functions, and why that was fine to defer until this exact lesson
- [ ] You can explain what `5/0` currently evaluates to, and why that is not yet the final, considered answer this project will give

---

*Next: Lesson 09 — Cell References in Formulas. `=A1+B1` finally reads two
other cells' real values — the parser's `Primary` rule grows a second
case, and the evaluator grows to match it, following the exact same
extension pattern `Cell` and `Token` have already used twice.*
