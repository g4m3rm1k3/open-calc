# TypeScript Spreadsheet — Lesson 13 — Errors as Values

## What You Will Build

Nothing new appears on screen — every formula that already worked still
works identically. What changes is how failure is represented, project-wide.
Right now, this project has *three* inconsistent ways of signalling
something went wrong: `ParseResult` (a real, typed result), a plain
`'#ERROR'` string (swallowing the real reason), and thrown exceptions
(caught by a blunt `try`/`catch` two lessons ago). This lesson replaces
all three with one considered design: a real `EvaluationResult` type,
carrying either a genuine number or a genuine, specific reason it could
not be computed — never a crash, never a silently discarded message.

---

## What You Need to Know First

Lesson 12 left `lookupCellValue` throwing on a circular reference, caught
by `displayCell`'s `try`/`catch` from lesson 10 — which also happens to
catch unknown-function errors and everything else, all collapsing into
the same generic `'#ERROR'` text.

---

## Step 1 — A Type for a Computation That Might Fail

**The problem:** "Did this succeed, and if not, why?" is currently
answered three different, inconsistent ways across this project.

Add to `script.ts`:

```typescript
type EvaluationResult =
  | { kind: 'success'; value: number }
  | { kind: 'error'; message: string };

function ok(value: number): EvaluationResult {
  return { kind: 'success', value };
}

function fail(message: string): EvaluationResult {
  return { kind: 'error', message };
}
```

**Walkthrough — the same shape as `ParseResult`, now applied one stage
later.** `ParseResult` (lesson 07) answered "did *parsing* succeed?"
`EvaluationResult` answers the same kind of question for *evaluation*
instead — success carries the real value; failure carries a real,
specific message, never just a code or a generic flag. `ok` and `fail`
are small, deliberately named helpers — writing `ok(5)` instead of
`{ kind: 'success', value: 5 }` everywhere makes every call site read
like what it means, not just what shape it produces.

---

## Step 2 — Thread `EvaluationResult` Through the Evaluator

**The problem:** `evaluate`, `applyOperator`, `evaluateFunctionCall`, and
`lookupCellValue` all currently either return a plain `number` or throw —
none of them yet speak `EvaluationResult`.

Update `applyOperator` in `script.ts` — this is also where division by
zero, deferred since lesson 08, finally gets a real answer:

```typescript
function applyOperator(operator: '+' | '-' | '*' | '/', left: number, right: number): EvaluationResult {
  switch (operator) {
    case '+':
      return ok(left + right);
    case '-':
      return ok(left - right);
    case '*':
      return ok(left * right);
    case '/':
      if (right === 0) {
        return fail('Division by zero');
      }
      return ok(left / right);
    default:
      return assertNever(operator);
  }
}
```

Update `evaluate` in `script.ts`:

```typescript
function evaluate(node: ExpressionNode, lookupCell: (name: CellId) => EvaluationResult): EvaluationResult {
  switch (node.kind) {
    case 'Number':
      return ok(node.value);
    case 'CellReference':
      return lookupCell(node.name);
    case 'Range':
      return fail('A range can only be used inside a function like SUM()');
    case 'UnaryExpression': {
      const operandResult = evaluate(node.operand, lookupCell);
      if (operandResult.kind === 'error') {
        return operandResult;
      }
      return ok(-operandResult.value);
    }
    case 'BinaryExpression': {
      const leftResult = evaluate(node.left, lookupCell);
      if (leftResult.kind === 'error') {
        return leftResult;
      }
      const rightResult = evaluate(node.right, lookupCell);
      if (rightResult.kind === 'error') {
        return rightResult;
      }
      return applyOperator(node.operator, leftResult.value, rightResult.value);
    }
    case 'FunctionCall':
      return evaluateFunctionCall(node, lookupCell);
    default:
      return assertNever(node);
  }
}
```

**Walkthrough — checking `.kind === 'error'` and returning early, at
every step.** Each case that depends on a sub-result checks it
immediately: if evaluating `node.left` already failed, `evaluate` returns
that same failure straight away, never even attempting `node.right`. This
is a manual version of a pattern real languages sometimes build in
directly (Rust's `?` operator does exactly this for its own `Result`
type) — propagate a failure upward the instant it appears, untouched,
rather than trying to continue with a value that was never actually
produced.

**Walkthrough — division by zero, finally answered.** `right === 0`
returns `fail('Division by zero')` instead of letting JavaScript's own
`Infinity`/`NaN` behaviour leak through unexamined, as it silently did
since lesson 08. This is the considered answer that lesson's honest scope
note promised: a real spreadsheet failure, named and shown clearly,
instead of an infinity quietly propagating into whatever formula happens
to use this one's result next.

---

## Step 3 — Update Functions, Ranges, and Cell Lookups

**The problem:** `evaluateFunctionCall`, its argument handling, and
`lookupCellValue` all still throw or return plain numbers.

Add to `script.ts` — a second, related result type for a list of numbers,
since a function argument can expand into many values, not just one:

```typescript
type NumberListResult =
  | { kind: 'success'; values: number[] }
  | { kind: 'error'; message: string };

function evaluateArgumentToNumbers(node: ExpressionNode, lookupCell: (name: CellId) => EvaluationResult): NumberListResult {
  if (node.kind === 'Range') {
    const values: number[] = [];
    for (const id of expandRange(node.from, node.to)) {
      const result = lookupCell(id);
      if (result.kind === 'error') {
        return { kind: 'error', message: result.message };
      }
      values.push(result.value);
    }
    return { kind: 'success', values };
  }

  const result = evaluate(node, lookupCell);
  if (result.kind === 'error') {
    return { kind: 'error', message: result.message };
  }
  return { kind: 'success', values: [result.value] };
}

function evaluateFunctionCall(node: FunctionCallNode, lookupCell: (name: CellId) => EvaluationResult): EvaluationResult {
  const implementation = SPREADSHEET_FUNCTIONS[node.name];
  if (!implementation) {
    return fail(`Unknown function: "${node.name}"`);
  }

  const allValues: number[] = [];
  for (const arg of node.args) {
    const argResult = evaluateArgumentToNumbers(arg, lookupCell);
    if (argResult.kind === 'error') {
      return argResult;
    }
    allValues.push(...argResult.values);
  }

  return ok(implementation(allValues));
}
```

Update `lookupCellValue` in `script.ts`:

```typescript
function lookupCellValue(name: CellId, evaluationStack: Set<CellId>): EvaluationResult {
  if (evaluationStack.has(name)) {
    const chain = [...evaluationStack, name].join(' → ');
    return fail(`Circular reference: ${chain}`);
  }

  const referencedCell = cells[name];
  if (!referencedCell) {
    return ok(0);
  }

  switch (referencedCell.kind) {
    case 'number':
      return ok(referencedCell.value);
    case 'text':
      return ok(0);
    case 'formula': {
      const parseResult = parse(tokenize(referencedCell.expr));
      if (parseResult.success === false) {
        return fail(parseResult.error.message);
      }

      const nextStack = new Set(evaluationStack);
      nextStack.add(name);

      return evaluate(parseResult.ast, (referencedName) => lookupCellValue(referencedName, nextStack));
    }
    default:
      return assertNever(referencedCell);
  }
}
```

**Walkthrough — `NumberListResult`, and why it is not just
`EvaluationResult` again.** `EvaluationResult`'s success case holds one
`number`; a function argument can expand into a whole array of them (a
range). Rather than force one type to describe two different shapes of
success, this project defines a second, sibling type with the identical
`kind: 'success' | 'error'` tagging convention, differing only in what
success actually carries. `EvaluationResult` and `NumberListResult` are
almost identical — that repetition is deliberate to notice: lesson 23
revisits this exact pair once generics make it possible to describe both
with one reusable shape instead of two similar, separately-written ones.

**Walkthrough — a `for` loop instead of lesson 10's `flatMap`, and why.**
`flatMap` is excellent at "transform and flatten," but it has no clean
way to stop partway through the moment one element fails — every element
would run regardless. `evaluateFunctionCall`'s plain `for` loop checks
each argument's result immediately and returns the first failure it
finds, skipping every argument after it entirely. Sometimes a more basic
tool is the right one, specifically because a more advanced one cannot
express "stop early" as directly.

---

## Step 4 — Simplify the Display Code

**The problem:** `displayCell` and `updateDebugPanel` still wrap
`evaluate` in a `try`/`catch` from lesson 10 — no longer needed, now that
failure is a real, typed value instead of a thrown exception.

Update `displayCell`'s `'formula'` case in `script.ts`:

```typescript
case 'formula': {
  const parseResult = parse(tokenize(cell.expr));
  if (parseResult.success === false) {
    return '#ERROR';
  }

  const result = evaluate(parseResult.ast, (name) => lookupCellValue(name, new Set([ownId])));
  return result.kind === 'success' ? result.value.toString() : '#ERROR';
}
```

Update `updateDebugPanel`'s result section in `script.ts`:

```typescript
const result = evaluate(parseResult.ast, (name) => lookupCellValue(name, new Set([cellId(coordinate)])));
resultOutput.textContent = result.kind === 'success'
  ? result.value.toString()
  : `Error: ${result.message}`;
```

Click **▶ Preview**. Every formula that worked before still works
identically. Type `=5/0`: the cell shows `#ERROR`, and the debug panel
shows the specific reason, `Error: Division by zero` — the first time
this project has ever surfaced that particular failure clearly, rather
than letting `Infinity` slip through silently.

**Walkthrough — no more `try`/`catch` anywhere in this pipeline.**
Nothing in `evaluate`, `applyOperator`, `evaluateFunctionCall`,
`evaluateArgumentToNumbers`, or `lookupCellValue` throws an exception for
an ordinary formula failure anymore — every one of them returns a real,
typed value describing exactly what happened. `displayCell` and
`updateDebugPanel` no longer need to guard against an unexpected throw,
because there no longer is one; they simply check `.kind` the same way
every other discriminated union in this project has been checked since
lesson 04.

**SE lens — why this refactor was worth doing now, not from the very
start.** Building `EvaluationResult` in lesson 08, before any formula
could actually fail in more than one way, would have been solving a
problem that did not exist yet — infrastructure with no felt need behind
it. By lesson 13, this project has accumulated four *genuinely different*
failure modes: a parse error, an unknown function, a circular reference,
and division by zero. Only once that real variety existed did designing
one consistent way to represent all of them become an improvement worth
making, rather than a guess about what might eventually be needed.

---

## Connect the Pieces

```
script.ts    EvaluationResult, NumberListResult — a considered, typed
             replacement for three previously inconsistent ways of
             representing failure (ParseResult stays as-is; it already
             had this shape from the start)
             ok(), fail() — small helpers making every success/failure
             call site read as what it means
             Every evaluation function now returns a real value instead
             of throwing, all the way down to displayCell and the debug
             panel
```

---

## What Breaks Without This

**Forgetting to check `.kind === 'error'` after a sub-evaluation, using
the value directly regardless (temporarily change `evaluate`'s
`BinaryExpression` case to skip the check):** `=5/0+3` would try to add
`leftResult.value` even when `leftResult.kind` is `'error'` — but
`{ kind: 'error'; message: string }` has no `value` field at all,
so Monaco itself refuses to compile this, catching the mistake before it
becomes a runtime problem.

**Typing `=5/0` before this lesson's changes:** Recall from lesson 08:
`5/0` silently evaluates to `Infinity`, a technically real JavaScript
number, displayed as-is with no indication anything unusual happened —
exactly the gap this lesson exists to close.

---

## Definition of Done

- [ ] `=5/0` shows `#ERROR` in the cell and "Division by zero" in the debug panel
- [ ] Every previously-working formula (arithmetic, references, functions, ranges) still works identically
- [ ] No function in the evaluation pipeline throws an exception for an ordinary formula failure anymore
- [ ] You can name all four distinct failure modes this project's formulas can now hit, and where each one is produced
- [ ] You can explain why `NumberListResult` is a separate type from `EvaluationResult` rather than the same one reused
- [ ] You can explain why this refactor happened in lesson 13 specifically, not earlier

---

*Next: Lesson 14 — Recalculation Performance. Every formula is still
re-parsed and re-evaluated from scratch on every single render, even when
nothing it depends on has changed. This lesson makes that honest, then
fixes it.*
