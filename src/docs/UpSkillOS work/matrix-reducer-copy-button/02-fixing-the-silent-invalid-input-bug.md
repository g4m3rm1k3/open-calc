# Lesson 2 — Fixing the Silent Invalid-Input Bug

Today we study **input validation at a state transition** — catching bad
data at the one moment your program is about to trust it, instead of
letting it quietly become wrong data. Our case study is a real bug in
`src/tools/matrix-reducer/MatrixReducer.jsx`, found while reading the file
for Lesson 1, and made more visible — and more consequential — by the copy
button that lesson just added.

---

## What You Will Build

A concrete fix, in two small parts: cells containing unparseable text get a
visible red outline the moment you type them, and clicking "Start Manual →"
or either "Solve" button with any invalid cell present refuses to proceed,
showing exactly which cell is the problem — instead of silently treating
garbage input as `0` and moving on, which is what happens today.

---

## What You Need to Know First

Lesson 1 in this folder (`01-copy-the-matrix-to-clipboard.md`) — specifically
that Matrix Reducer's `S.btn(variant)` helper and its existing red "error"
banner styling are established conventions in this file, not something to
invent fresh here.

---

## The Lesson

### Step 1 — Find the Bug

Look at `stringsToMatrix`, near the top of `MatrixReducer.jsx`:

```javascript
function stringsToMatrix(s) {
  return s.map(row => row.map(str => parseFrac(str) || frac(0)));
}
```

And `parseFrac`, just above it:

```javascript
function parseFrac(str) {
  str = str.trim();
  if (str === "" || str === "-") return frac(0);
  if (str.includes("/")) {
    const parts = str.split("/");
    const n = parseInt(parts[0], 10);
    const d = parseInt(parts[1], 10);
    if (isNaN(n) || isNaN(d)) return null;
    return frac(n, d);
  }
  const n = parseFloat(str);
  if (isNaN(n)) return null;
  const decimals = (str.split(".")[1] || "").length;
  const factor = Math.pow(10, decimals);
  return frac(Math.round(n * factor), factor);
}
```

**Walkthrough:** `parseFrac` already makes a careful distinction. An empty
string or a lone `"-"` returns `frac(0)` — these are treated as valid,
because they're states you pass through *while typing* a number (before
typing the digits after a minus sign, or after deleting a cell's contents).
But a string like `"abc"`, `"1/"`, or `"2x"` returns `null` — `parseFloat`
returns `NaN` for text that isn't a number at all, and `isNaN(n)` catches
it; for the fraction branch, `parseInt` on a missing or non-numeric part
returns `NaN` the same way. `null` here means "I genuinely could not parse
this as a number." That's a real, useful signal.

Now look at `stringsToMatrix` again: `parseFrac(str) || frac(0)`. `||`
(logical OR) evaluates its left side; if that's **falsy**, it evaluates and
returns the right side instead. `null` is falsy. So the moment `parseFrac`
correctly reports "this cell is garbage," `stringsToMatrix` throws that
signal away and silently substitutes `0` — indistinguishable, from that
point on, from a cell where the user actually typed `0`.

**Reproduce it directly.** Run `npm run dev`, open Matrix Reducer, type
`abc` into any cell, leave the rest as `0`. Click "Start Manual →". No
error. No red anything. The cell simply displays `0`. Now — with the copy
button from Lesson 1 — click Copy and paste it somewhere: the pasted text
also silently shows `0` for that cell. A typo has become a wrong answer
that looks exactly like a correct one, and it now travels outside the app
in whatever you paste it into.

**CS lens:** This is a **silent failure** — an error condition that occurs,
is even correctly *detected* by `parseFrac`, and then is discarded rather
than surfaced. Contrast this with a **loud failure** (throwing, or
returning an error the caller is forced to handle) or a genuinely
**graceful fallback** (a default that's actually a reasonable, honestly-
communicated substitute — like treating an empty cell as `0`, which *is*
reasonable and clearly signaled by the empty box itself). The bug here
isn't that a fallback to `0` exists at all — an empty cell defaulting to
`0` is fine, arguably correct. The bug is that a *different* condition
(unparseable garbage) is being funneled into the exact same fallback as a
*legitimate* one (empty/in-progress typing), with nothing left to tell them
apart afterward.

### Step 2 — Show the Problem Where It Happens: the Grid Itself

The fix has two parts. First, a visual cue at the exact moment a cell
becomes invalid — in `MatrixGrid`, where the editable `<input>` is
rendered:

```jsx
{editing ? (
  <input
    style={S.cellInput}
    value={inputStrings[ri][ci]}
    onChange={e => onCellChange(ri, ci, e.target.value)}
  />
) : ( /* ... */ )}
```

Change it to:

```jsx
{editing ? (
  <input
    style={{
      ...S.cellInput,
      borderColor: parseFrac(inputStrings[ri][ci]) === null ? "#f87171" : undefined,
    }}
    value={inputStrings[ri][ci]}
    onChange={e => onCellChange(ri, ci, e.target.value)}
  />
) : ( /* ... */ )}
```

**Walkthrough:** `{ ...S.cellInput, borderColor: ... }` **spreads** every
property from `S.cellInput` (background, the base `border` shorthand, font,
padding, width, alignment) into a brand-new object, then adds one more key,
`borderColor`, after it. Object spread copies properties left-to-right;
a key written *after* the spread overrides the same key if the spread
already set it — but here it doesn't collide, it *adds* a new, more
specific property. `S.cellInput` sets `border: "1px solid #2d3144"` — a
shorthand that implicitly sets border width, style, *and* color all at
once. Setting `borderColor` afterward as a separate key doesn't fight that
shorthand; the browser applies `border` first, then the later, more
specific `border-color` declaration wins for just the color, leaving the
width and style from the shorthand untouched. That's exactly why this
works without needing to rewrite `S.cellInput`'s `border` line at all.

`parseFrac(inputStrings[ri][ci]) === null ? "#f87171" : undefined` reuses
`parseFrac` for a **second purpose** it was never originally written for —
not to produce a number, but purely to answer "is this valid?" The function
didn't need to change at all; its existing `null`-means-invalid contract
was already exactly what this check needs. When the expression is `false`,
`borderColor` is set to `undefined` — in React, an `undefined` style value
is simply omitted, so the cell falls back to whatever `border` already
specified (`#2d3144`, the normal color), not to some literal string
`"undefined"`.

**Execution trace**, typing `"a"` into an empty cell, character by
character:

```text
Type nothing:  inputStrings[r][c] = ""     parseFrac("") = {n:0,d:1}   → valid   → normal border
Type "a":      inputStrings[r][c] = "a"    parseFrac("a") = null       → invalid → red border
Type "a2":     inputStrings[r][c] = "a2"   parseFrac("a2") = null      → invalid → red border (still)
Delete both:   inputStrings[r][c] = ""     parseFrac("") = {n:0,d:1}   → valid   → normal border
```

Run it in the browser and watch the border react live as you type — this
re-runs on every keystroke because `onCellChange` calls `setInputStrings`,
which re-renders `MatrixGrid` with the new string, which re-evaluates
`parseFrac` on it immediately.

### Step 3 — Block the Transition, Not Just the Display

A red border is a hint, not a guarantee anyone notices it before clicking
"Start Manual →" or "Solve." The second, more important part of the fix is
refusing to proceed at all while invalid cells exist — the exact moment
`stringsToMatrix` is about to be trusted.

Add one small helper, near `stringsToMatrix`:

```javascript
function findInvalidCells(strings) {
  const invalid = [];
  strings.forEach((row, r) => {
    row.forEach((str, c) => {
      if (parseFrac(str) === null) invalid.push({ r, c });
    });
  });
  return invalid;
}
```

**Walkthrough:** `strings.forEach((row, r) => ...)` visits every row, `r`
being its index; the nested `row.forEach((str, c) => ...)` visits every
cell string in that row, `c` being its column index. For each cell, the
same `parseFrac(str) === null` check from Step 2 runs again — reused a
*third* time now (its display use in the fraction cell, its validity check
in the border, and here). If invalid, `{ r, c }` — a plain object recording
that cell's position — is pushed onto the `invalid` array. The function
returns every invalid position found, not just the first, so the error
message can report a count.

**Execution trace**, for a 2×2 grid where `inputStrings` is
`[["1", "x"], ["0", ""]]`:

```text
r=0: row=["1","x"]   c=0: parseFrac("1")="1"→valid, skip
                       c=1: parseFrac("x")=null→invalid, push {r:0,c:1}
r=1: row=["0",""]     c=0: parseFrac("0")="0"→valid, skip
                       c=1: parseFrac("")=frac(0)→valid, skip
invalid = [ {r:0, c:1} ]
```

Now use it in both places that currently call `stringsToMatrix` to *start*
something — `startSession` and `runSolver`. First, `startSession`:

```javascript
function startSession() {
  const invalid = findInvalidCells(inputStrings);
  if (invalid.length > 0) {
    const first = invalid[0];
    setError(`Fix ${invalid.length} invalid cell${invalid.length === 1 ? "" : "s"} before starting — e.g. R${first.r + 1}C${first.c + 1}`);
    return;
  }
  setMatrix(stringsToMatrix(inputStrings));
  setHistory([]); setError("");
}
```

Then `runSolver`:

```javascript
function runSolver(type) {
  const invalid = findInvalidCells(inputStrings);
  if (invalid.length > 0) {
    const first = invalid[0];
    setError(`Fix ${invalid.length} invalid cell${invalid.length === 1 ? "" : "s"} before solving — e.g. R${first.r + 1}C${first.c + 1}`);
    return;
  }
  setError("");
  const m = stringsToMatrix(inputStrings);
  const { result, steps } = type === "rref" ? solveRREF(m) : solveREF(m);
  setSolverResult({ type, steps, result, initial: cloneMatrix(m) });
  setSolverStep(null);
}
```

**Walkthrough:** Both functions now check `findInvalidCells` *before*
touching `stringsToMatrix` at all. If anything's invalid, `setError(...)`
records a message naming both the count and the first offending cell's
human-readable position (`R${first.r + 1}C${first.c + 1}` — `+ 1` because
`r`/`c` are zero-indexed internally but rows and columns are shown to the
user starting at 1, exactly the same off-by-one translation the row-op
labels elsewhere in this file already do, like `R${srcRow + 1}`), and
`return` exits the function immediately — `stringsToMatrix`,
`setMatrix`/`setSolverResult`, everything below, never runs. This is a
**guard clause**: check the failure condition first, exit early, and let
the rest of the function assume, unconditionally, that it's dealing with
good data — the same shape `applyOp`'s existing scalar validation already
uses a few lines away (`if (!scalar) { setError(...); return; }`), just
applied one level earlier, before a whole matrix is trusted instead of one
scalar.

**SE lens:** `error` was already a piece of state this file tracks
(`const [error, setError] = useState("")`) and already had a rendering path
for showing it in red. This fix doesn't invent a new mechanism — it feeds a
new kind of problem into the one that already existed, the same principle
Lesson 1 used when it reused `fracToString` and the lesson-engine-autofind
lessons used when they reused `parseFrontmatter`: before writing a new
piece of infrastructure, check whether one that already does almost exactly
what you need is sitting a few lines away.

### Step 4 — Give the Error Somewhere to Actually Show

There's a gap: the existing `{error && <div>...}` banner only renders
*inside* the manual-mode operations card — which only exists once
`matrix` is already set, i.e., **after** a session has started. But
`startSession`'s new validation runs **before** that, from the "Enter
values" screen, where no error banner currently exists at all. Without
this step, `setError(...)` would set state that has nowhere to render —
the check would silently do nothing visible, which is the exact bug this
lesson is fixing, just relocated.

Find the "Start buttons" block:

```jsx
{/* Start buttons */}
{mode === "manual" && !matrix && (
  <div style={{ marginTop: 16 }}>
    <button style={S.btn("green")} onClick={startSession}>Start Manual →</button>
  </div>
)}
{mode === "solver" && !solverResult && (
  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
    <button style={S.btn("blue")} onClick={() => runSolver("ref")}>Solve → REF</button>
    <button style={S.btn("amber")} onClick={() => runSolver("rref")}>Solve → RREF</button>
  </div>
)}
```

Add the same error banner markup the operations card already uses, in
both blocks:

```jsx
{/* Start buttons */}
{mode === "manual" && !matrix && (
  <div style={{ marginTop: 16 }}>
    {error && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10 }}>⚠ {error}</div>}
    <button style={S.btn("green")} onClick={startSession}>Start Manual →</button>
  </div>
)}
{mode === "solver" && !solverResult && (
  <div style={{ marginTop: 16 }}>
    {error && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10 }}>⚠ {error}</div>}
    <div style={{ display: "flex", gap: 10 }}>
      <button style={S.btn("blue")} onClick={() => runSolver("ref")}>Solve → REF</button>
      <button style={S.btn("amber")} onClick={() => runSolver("rref")}>Solve → RREF</button>
    </div>
  </div>
)}
```

One detail worth noticing: `error` is a single piece of state shared by the
whole component — it isn't scoped to "manual mode's operations card." It
was always available to be read anywhere in this file; it just hadn't been
*rendered* anywhere except that one card. This step doesn't add new state,
only a second (and third) place that displays state that already existed —
worth confirming by checking `switchMode`, a few lines away, which already
calls `setError("")` on every tab switch, meaning stale errors from one
mode never leak into the other. That safety was already built in, for free,
before this fix even started.

### Step 5 — Verify

Run `npm run dev`. Type `abc` into a cell — its border turns red
immediately, no other action needed. Leave it invalid and click
"Start Manual →" — nothing starts; instead, a red warning appears above the
button naming the exact cell (`R1C1`, or wherever you typed it). Fix that
cell back to a real number — the red border clears, the warning is still
showing (it clears on the *next* click, per `setError("")` in the success
path — click "Start Manual →" again and it now works, and the warning
disappears with it. Repeat the same check for both "Solve → REF" and
"Solve → RREF." Finally, close the loop from Lesson 1: with a valid matrix,
click Copy — confirm the copied text still matches exactly what's on
screen, now with the guarantee that "what's on screen" can never silently
contain an unintended zero from unparsed garbage.

---

## Connect the Pieces

`parseFrac`'s `null` return already meant "invalid" — that fact was true
before this lesson and didn't need to change. The bug was never in
*detecting* invalid input; it was in what happened to that detection after
the fact. Step 2 uses it for a live visual cue. Step 3 uses the exact same
function, unchanged, to build a full list of invalid cells and refuse a
transition. Step 4 finds the display gap the fix would otherwise fall into
silently and closes it using state (`error`) that already existed. Nothing
about this fix added new concepts to the file — every piece was already
there, playing a narrower role than it could have.

---

## What Breaks Without This

Demonstrated directly in Step 1: type `abc` into any cell, start a manual
session, and the cell silently becomes `0` — no error, no visual
difference from a cell where `0` was actually intended. Before Lesson 1,
this was contained entirely inside the app, a purely internal wrong answer.
After Lesson 1's copy button, that same silent `0` is now something you can
export and hand to someone else — pasted into a homework submission, a
chat message, a report — carrying the same false confidence outward. A
feature that makes a tool's output easier to share also makes any of that
tool's silent mistakes easier to share.

---

## Definition of Done

- [ ] Typing an unparseable value into any matrix cell gives it a visibly
      red border immediately, reverting the moment the cell becomes valid
      again (including empty or a lone `-`, which remain valid)
- [ ] `findInvalidCells` exists and is used by both `startSession` and
      `runSolver` before either calls `stringsToMatrix`
- [ ] Attempting to start a manual session or run either solver with an
      invalid cell present is blocked, with a red warning naming the count
      and the first invalid cell's row/column
- [ ] The warning appears correctly in both the manual "Start" screen and
      the solver "Solve" screen — not only inside the manual operations
      card where the original `error` banner already existed
- [ ] Fixing the invalid cell(s) and retrying succeeds normally
- [ ] You can explain, in your own words, the difference between a silent
      failure and a graceful fallback, using the empty-cell-defaults-to-
      zero case as the "this one's fine" example
- [ ] `git commit` with a message explaining why — for example: "Stop
      Matrix Reducer from silently treating unparseable cell input as
      zero — surface it as a red border while typing and block starting a
      session or solve until it's fixed"

---

## Leftover Cleanup Worth Doing (Not Required Above)

**A magic color string, already repeated.** `"#f87171"` (the red used for
invalid borders and error text) already appears several times in this file
— inside `S.btn`'s `"red"` variant, and in the existing error banner's
inline `color`. This lesson adds one more occurrence rather than
introducing a new duplication pattern — it's following the file's existing
(imperfect) convention, not creating a worse one. If this file is ever
revisited, naming it once — `const ERROR_COLOR = "#f87171"` near the `S`
object — and reusing that constant everywhere would remove a small amount
of copy-pasted magic already present before this lesson touched anything.

**Swap-to-self isn't validated.** `applyOp`'s `"replace"` operation
already refuses when `srcRow === tgtRow` (`"Source and target must
differ"`). The `"swap"` operation has no equivalent check — swapping a row
with itself is harmless (it's a no-op), but it does add a pointless
`"R1 ↔ R1"` entry to the step history. Not a correctness bug, just minor
clutter; a natural small follow-up using the exact `error`-and-`return`
guard-clause shape this lesson just practiced twice.
