# React Calculator — Lesson 12 — Parsing With Precedence

## What You Will Build

The debug line stops showing a flat list of tokens and starts showing a
real tree — one where `3×4` is nested *inside* the addition, not sitting
next to it as an equal. This is the structure that finally makes
precedence a property of the *shape* of the data, not something a
function has to remember to check.

---

## What You Need to Know First

Lesson 11 — `tokenize`, turning `"2+3×4"` into five tokens.

---

## Step 1 — Define the Tree's Shape

Add to `engine.ts`:

```typescript
type ExpressionNode =
  | { kind: "number"; value: number }
  | { kind: "negate"; operand: ExpressionNode }
  | { kind: "binary"; operator: "+" | "-" | "×" | "÷"; left: ExpressionNode; right: ExpressionNode };
```

**Walkthrough.** Another discriminated union, same shape as `Token` — but
notice `ExpressionNode` appears *inside its own definition* (`left:
ExpressionNode`, `right: ExpressionNode`, `operand: ExpressionNode`). This
is a **recursive type**: a binary node's children are themselves complete
expression nodes, which might themselves be binary nodes with their own
children, as deep as the expression actually goes. `2+3×4` becomes a
`binary` node for `+`, whose `left` is a `number` node (`2`) and whose
`right` is a *whole separate* `binary` node for `×` (with `left: 3, right:
4`) — multiplication doesn't sit next to addition in this structure, it
sits **underneath** it, exactly matching the fact that it needs to be
computed first.

**CS lens — this is an Abstract Syntax Tree, or AST.** A tree of nodes
representing the *structure* of an expression, with no remaining ambiguity
about what happens first — the same kind of structure a real programming
language's compiler builds from your source code before running it, and
the same structure the TypeScript Spreadsheet project's own formula engine
builds for `=A1+B1×2`. "Abstract" means it discards details that don't
matter to meaning — no spaces, no original text — keeping only what
computation actually depends on.

---

## Step 2 — A Shared Parser State

```typescript
interface ParseState {
  tokens: Token[];
  position: number;
}
```

**Walkthrough — why a shared object instead of passing `position` around
by value.** Every parsing function below needs to read *and advance*
`position` as it consumes tokens, and every function that calls another
parsing function needs to see how far that call advanced things.
`ParseState` is a plain object holding both together. Because objects in
JavaScript are passed **by reference** — a variable holding an object
holds a pointer to the same underlying data, not a private copy — every
function given the *same* `ParseState` object sees every other function's
updates to `.position` immediately, with no need to return and re-thread a
new position value through every single call.

---

## Step 3 — The Grammar, One Function Per Precedence Level

```typescript
function parseExpression(state: ParseState): ExpressionNode {
  return parseAddition(state);
}

function parseAddition(state: ParseState): ExpressionNode {
  let left = parseMultiplication(state);
  while (state.position < state.tokens.length) {
    const token = state.tokens[state.position];
    if (token.kind !== "plus" && token.kind !== "minus") break;
    state.position += 1;
    const right = parseMultiplication(state);
    left = { kind: "binary", operator: token.kind === "plus" ? "+" : "-", left, right };
  }
  return left;
}

function parseMultiplication(state: ParseState): ExpressionNode {
  let left = parseUnary(state);
  while (state.position < state.tokens.length) {
    const token = state.tokens[state.position];
    if (token.kind !== "multiply" && token.kind !== "divide") break;
    state.position += 1;
    const right = parseUnary(state);
    left = { kind: "binary", operator: token.kind === "multiply" ? "×" : "÷", left, right };
  }
  return left;
}

function parseUnary(state: ParseState): ExpressionNode {
  const token = state.tokens[state.position];
  if (token !== undefined && token.kind === "minus") {
    state.position += 1;
    return { kind: "negate", operand: parseUnary(state) };
  }
  return parsePrimary(state);
}

function parsePrimary(state: ParseState): ExpressionNode {
  const token = state.tokens[state.position];
  if (token === undefined) {
    throw new Error("Expected a number or \"(\", but the expression ended");
  }
  if (token.kind === "number") {
    state.position += 1;
    return { kind: "number", value: token.value };
  }
  if (token.kind === "leftParen") {
    state.position += 1;
    const inner = parseExpression(state);
    const closing = state.tokens[state.position];
    if (closing === undefined || closing.kind !== "rightParen") {
      throw new Error("Expected \")\"");
    }
    state.position += 1;
    return inner;
  }
  throw new Error(`Unexpected token: ${token.kind}`);
}
```

**Walkthrough — one function per grammar rule, calling "downward" into the
next tighter level.** `parseExpression` calls `parseAddition`.
`parseAddition` calls `parseMultiplication` *before* looking for a `+` or
`-` of its own. `parseMultiplication` calls `parseUnary` before looking
for `×` or `÷`. This ordering — `Expression → Addition → Multiplication →
Unary → Primary` — is precedence encoded directly into which function
calls which: by the time `parseAddition` gets to check for a `+`,
`parseMultiplication` has *already* consumed and fully resolved any `×` or
`÷` immediately next to it, folding it into a single `ExpressionNode`
first. Multiplication ends up nested *inside* addition's tree not because
of any explicit "multiplication is higher precedence" check anywhere, but
because of the order these functions were written to call each other in.
This exact structure — one function per level, each calling the next
tighter one first — is called **recursive descent parsing**.

**Walkthrough — `parseAddition`'s loop.** `left` starts as whatever
`parseMultiplication` returns — a complete subtree, already correctly
handling any multiplication or division at this point in the expression.
The `while` loop then looks for a `+` or `-` immediately after it; if one
exists, it's consumed (`state.position += 1`), the *next* multiplication-
level subtree is parsed as `right`, and the two are combined into a new
`binary` node that becomes the new `left` — allowing `2+3+4` to build up
as `(2+3)+4`, left to right, correctly, even with three separate numbers.
If no `+` or `-` is next, `break` exits the loop and returns whatever
`left` has become. `parseMultiplication` is structured identically, one
level down, calling `parseUnary` instead of `parseMultiplication`.

**Walkthrough — `parseUnary`, and why negation gets its own level.**
`token !== undefined && token.kind === "minus"` checks: is there a token
left at all, and is it a minus sign appearing where a *number* was
expected, not between two numbers? This is what makes `-5` (a single
negative number) parse correctly instead of being mistaken for a
subtraction missing its left side. `parseUnary` calls itself recursively
(`operand: parseUnary(state)`) rather than calling `parsePrimary`
directly, specifically so `--5` (however unlikely a real button sequence)
parses as a legal double-negation rather than immediately failing — a
small piece of correctness earned almost for free by the recursion.

**Walkthrough — `parsePrimary`, the bottom of the grammar.** This is where
recursion in the *other* direction happens: `parsePrimary` handles a bare
number directly, but for a `(`, it calls all the way back **up** to
`parseExpression` to parse whatever is inside the parentheses — a
complete, independent expression, which might itself contain more
parentheses, more addition, more of everything. This is why parentheses
can nest to any depth: `((2+3)×4)` works because `parsePrimary` doesn't
know or care how deep it's already been called: `parseExpression` calling
`parsePrimary` calling `parseExpression` again is exactly how "an
expression can contain another expression, inside parentheses" becomes
real, working code.

**SE lens — why not one function trying to handle everything.** A single
function juggling numbers, all four operators, precedence rules, and
parentheses at once would need explicit tracking of "how tightly does this
operator bind compared to that one" — a lookup table of precedence levels,
consulted constantly (this is exactly what **precedence climbing** and
**Pratt parsing** do, and precisely what this project avoids on purpose).
Recursive descent trades that bookkeeping for structure: precedence is a
property of *which function you're inside*, never a value you have to
compare.

---

## Step 4 — See the Tree

Update the debug panel in `Calculator.tsx`:

```tsx
<p>
  tree: {JSON.stringify(parseExpression({ tokens: tokenize(display), position: 0 }))}
</p>
```

Click **▶ Preview**. Type `42` — the tree is a single `{"kind":"number","value":42}`.
There's no expression string builder yet (that's lesson 14), so full
multi-operator trees aren't visible on the live display just yet — but you
can confirm the parser directly, right now, using the Preview panel's own
browser console: click ▶ Preview, open DevTools (F12) → Console, and run:

```js
JSON.stringify(parseExpression({ tokens: tokenize("2+3×4"), position: 0 }))
```

Confirm the result shows a `binary` `+` node whose `right` side is itself a
`binary` `×` node — multiplication, nested inside addition, exactly as
described above.

---

## Connect the Pieces

```
engine.ts   ExpressionNode — a recursive discriminated union describing a
            fully-structured expression; ParseState — tokens plus a
            shared, mutable cursor; parseExpression/parseAddition/
            parseMultiplication/parseUnary/parsePrimary — one function per
            precedence level, each calling the next tighter one first
```

---

## What Breaks Without This

**Making `parseAddition` check for `×`/`÷` itself, instead of delegating
to `parseMultiplication` first:** the tree would come out flat — a chain
of `+`/`-`/`×`/`÷` nodes side by side, no nesting — which is exactly the
same left-to-right, no-precedence bug lesson 10 already showed, just moved
one layer deeper into the code instead of fixed.

**Removing the `parseMultiplication` → `parseUnary` call, calling
`parsePrimary` directly instead:** `-3×4` would fail to parse at all —
`parseMultiplication` would hand `parsePrimary` a `minus` token it has no
idea how to handle (it only understands numbers and parentheses), throwing
`Unexpected token: minus` for a perfectly reasonable expression.

---

## Definition of Done

- [ ] `ExpressionNode` is defined as a recursive discriminated union
- [ ] All five parse functions exist, one per grammar level
- [ ] `parseExpression` on `"2+3×4"`'s tokens produces a tree with multiplication nested inside addition, confirmed in the console
- [ ] You can explain why recursive descent doesn't need a precedence lookup table
- [ ] You can explain what makes `ExpressionNode` a recursive type

---

*Next: Lesson 13 — Evaluating the Tree. The tree exists — now it has to
turn back into a single number, correctly, and division by zero finally
gets handled instead of ignored.*
