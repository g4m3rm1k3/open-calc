# TypeScript Spreadsheet — Lesson 05 — Formulas Appear

## What You Will Build

Type `=A1+B1` into a cell, and it is recognised as a formula — stored as
its own distinct shape, displayed with its leading `=` restored. It does
not compute anything yet; that is the entire job of lessons 06 through 08,
built properly rather than rushed. What this lesson builds is the moment
`Cell` grows a third shape, and TypeScript gains a real, checkable way to
guarantee that every function switching over it was actually updated to
handle the new one.

---

## What You Need to Know First

Lesson 04 left `Cell` as a two-variant discriminated union — `{ kind:
'number' }` or `{ kind: 'text' }` — with `parseRawInput` deciding which one
a freshly typed string becomes, and `displayCell` turning either kind back
into text using a `switch` on `cell.kind`.

---

## Step 1 — A Third Shape

**The problem:** `parseRawInput` currently has no way to recognise that
`=A1+B1` means something different from ordinary text.

Update `Cell` in `script.ts`:

```typescript
type Cell =
  | { kind: 'number'; value: number }
  | { kind: 'text'; value: string }
  | { kind: 'formula'; expr: string };
```

Update `parseRawInput`:

```typescript
function parseRawInput(rawInput: string): Cell {
  const trimmed = rawInput.trim();

  if (trimmed.startsWith('=')) {
    return { kind: 'formula', expr: trimmed.slice(1) };
  }

  const numericValue = Number(trimmed);
  if (trimmed !== '' && !Number.isNaN(numericValue)) {
    return { kind: 'number', value: numericValue };
  }

  return { kind: 'text', value: rawInput };
}
```

**Walkthrough:** `{ kind: 'formula'; expr: string }` is the third member
of the union — its own tag, `'formula'`, and its own field, `expr`,
holding the formula's text *without* the leading `=` sign. `trimmed.
startsWith('=')` checks for that leading character; `trimmed.slice(1)`
returns everything *after* index `0` — the formula's real content, with
the `=` itself removed, since the type's own tag already communicates "this
is a formula" without needing to keep a redundant `=` character sitting
inside `expr` as well.

The `startsWith('=')` check runs *before* the number check, deliberately
— a string like `=A1` would otherwise reach `Number('=A1')`, get `NaN`
back, and fall through to being stored as plain text, silently losing the
one signal that actually mattered.

---

## Step 2 — Update `displayCell`

**The problem:** `displayCell`'s `switch` only knows about two cases —
`Cell` now has three.

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
    case 'formula':
      return '=' + cell.expr;
  }
}
```

Click **▶ Preview**. Type `=A1+B1` into any cell and press Enter: it
displays as `=A1+B1` — exactly what was typed, restored with its `=` sign.
Nothing is computed yet; this is expected. Lesson 06 begins the real work
of understanding what a formula's text actually means.

**Before moving on, try this deliberately.** Comment out the `case
'formula':` line and its `return` entirely, leaving only the `'number'`
and `'text'` cases. Check Monaco. In this project's setup, nothing turns
red — the function still compiles, even though a real `formula` cell would
now silently fall through to the end of the function and return `undefined`
at runtime, breaking the string type this function promises to return.
Restore the `'formula'` case before continuing.

**This gap is worth sitting with, honestly.** You might reasonably expect
TypeScript to catch a switch that no longer covers every case of the type
it is switching on. Whether it does depends on which strictness settings a
project has enabled — settings this environment, with no `tsconfig.json`
at all, does not turn on. Relying on TypeScript happening to notice a
missing case is not a dependable habit. Step 3 builds the one pattern that
works the same way regardless of settings, by asking the question directly
instead of hoping the compiler asks it for you.

---

## Step 3 — Ask the Question Directly, With `never`

**The problem:** Nothing currently *forces* every switch over `Cell` to
stay complete as the type grows — Step 2 just demonstrated that leaving it
to chance is not good enough.

Add to `script.ts`:

```typescript
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
```

Update `displayCell`'s `switch` to add a `default` case:

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
    case 'formula':
      return '=' + cell.expr;
    default:
      return assertNever(cell);
  }
}
```

Click **▶ Preview** again — behaviour is identical to Step 2; this change
is purely about what TypeScript can prove.

**Walkthrough — `never`, the type with no possible values.** `never` means
exactly what it says: a value that can genuinely never exist. `assertNever
(value: never)` is a function that only accepts an argument TypeScript has
already *proven* is impossible — which sounds useless, until you see how
`default` uses it. Inside the `switch`, by the time control reaches
`default`, TypeScript has already ruled out `'number'`, `'text'`, and
`'formula'` — every real member of the union has its own `case` above it.
Whatever is theoretically left over, having survived all three checks,
must be `never` — and TypeScript lets you pass `cell` to `assertNever`
specifically because it can prove, statically, that this line is
unreachable as long as `Cell` has exactly these three shapes.

**Now delete the `case 'formula':` block again, but keep the `default`
case this time.** Monaco shows a new, more direct error, pointing at
`cell` inside `assertNever(cell)`: *"Argument of type '{ kind: "formula";
expr: string }' is not assignable to parameter of type 'never'."*
TypeScript is telling you, precisely: "a `formula` cell really could reach
this line, so it is not actually impossible, so you cannot call a function
that demands the impossible." Restore the `'formula'` case before
continuing.

**SE lens — why this matters more as a project grows, not less.** Right
now, `displayCell` is the only function that switches over every `Cell`
variant. That will not stay true — lesson 08's evaluator, lesson 13's
error handling, and others will each need their own exhaustive `switch`
over `Cell` or a related union. `assertNever` in a `default` case is a
small, one-line insurance policy: the day a fourth `Cell` variant is added,
*every* switch statement using this pattern will refuse to compile until
it is updated too — not just the one you remembered to check by hand.

---

## Connect the Pieces

```
script.ts    Cell — now three variants: number, text, formula
             parseRawInput() — checks for a leading '=' before anything else
             assertNever() — a small, reusable exhaustiveness check, used
             in displayCell's default case and every future switch over
             Cell or a union like it
```

---

## What Breaks Without This

**Checking for a number before checking for a leading `=`:** Swap the
order of the two checks in `parseRawInput`. Type `=A1` into a cell.
`Number('=A1')` is `NaN`, so the number check correctly fails — but with
the formula check now running second, execution falls through to `{ kind:
'text', value: '=A1' }` instead, and the formula is silently stored as
plain text forever, with no error anywhere to explain why it never
computes anything in later lessons.

**Removing a case from a `switch` with no `default: assertNever(...)` at
all:** As shown in Step 2, nothing here stops this from compiling — the
function silently returns `undefined` for a real, valid `formula` cell at
runtime, a genuine bug that nothing in the editor warned about. `assertNever`
in a `default` case catches this every time, regardless of whether the
surrounding function happens to return a value or not, which is exactly
why it is worth using as a standing habit rather than something reached
for only after being burned by a missing case once.

---

## Definition of Done

- [ ] Typing `=anything` into a cell stores it as `{ kind: 'formula' }`
- [ ] A formula cell displays its raw text with the `=` sign restored
- [ ] You can explain why `parseRawInput` checks for a leading `=` before checking for a number
- [ ] You can show that removing a case from `displayCell`'s `switch` compiles silently without `assertNever`, but produces a real Monaco error with it
- [ ] You can explain what `never` means as a type, and why `assertNever`'s parameter is declared with it
- [ ] You can explain why relying on TypeScript to notice a missing switch case on its own is not a dependable habit, and what `assertNever` gives you instead

---

*Next: Lesson 06 — Tokenizing a Formula. `=A1+B2*5` is still just one long
string as far as this project is concerned — nothing yet understands it as
anything more structured than text. This is where that changes: the first
stage of a real, small interpreter, the same kind this site's own OpenMAT
project builds in full.*
