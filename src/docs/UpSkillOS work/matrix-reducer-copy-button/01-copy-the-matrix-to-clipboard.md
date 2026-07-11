# Lesson 1 — Copy the Matrix to Your Clipboard

Today we study **browser platform APIs and asynchronous feedback** — how a
button click triggers something outside your program (the OS clipboard) and
how your UI shows the user it worked. Our case study is real code: the
**Matrix Reducer** tool at `src/tools/matrix-reducer/MatrixReducer.jsx`, the
app's row-reduction (REF/RREF) workspace.

Every file path, function name, and line of code below is the real, current
Matrix Reducer — not a simulation. You'll be editing this exact file.

---

## What You Will Build

A "Copy" button on the Matrix Reducer that captures whatever matrix is
currently on screen — your manual working matrix, or the solver's REF/RREF
result — as readable text, puts it on your system clipboard, and gives you a
clear, temporary "✓ Copied" confirmation. You'll build it by first proving
the underlying browser mechanism works in complete isolation (a throwaway
lab), then wiring it into the real tool using a pattern this codebase
already uses successfully elsewhere.

---

## What You Need to Know First

Nothing from a prior lesson in this folder is required — this is a new
topic. One concept carries over by name, though, from
`lesson-engine-autofind/01-how-content-loading-works-today.md`: **single
source of truth**. It shows up again here, in miniature, in Step 2 — the
same principle, a completely different subsystem.

---

## The Lesson

### Step 1 — Read the Tool You're About to Change

Open `src/tools/matrix-reducer/MatrixReducer.jsx`. Before writing anything,
find the four pieces of state that decide what's currently on screen:

```javascript
const [mode, setMode] = useState("manual");        // "manual" | "solver"
const [matrix, setMatrix] = useState(null);          // manual session's live matrix
const [solverResult, setSolverResult] = useState(null); // {type, steps, result}
const [solverStep, setSolverStep] = useState(null);  // which step is being previewed
```

**`useState`, defined:** `useState(initialValue)` is a React **hook** — a
function that gives a plain component function its own persistent memory
across renders. Calling it returns a pair: `[currentValue, setterFunction]`.
Without it, a plain JavaScript variable declared inside a component function
would reset to its initial value every time the component re-rendered —
`useState` is what lets `mode` remember it's `"solver"` after you click a
tab, instead of forgetting the instant the component function runs again.
Calling the setter (`setMode("solver")`) does two things: it updates the
stored value, and it tells React "re-run this component function, something
changed." `matrix` starts as `null` specifically to mean "no manual session
has been started yet" — `null` here is a deliberate third state, distinct
from "an empty matrix," used throughout the file to gate what renders
(`mode === "manual" && matrix && (...)`).

A few lines later, two more values are *derived* from that state, not stored
in it:

```javascript
const current = matrix ?? stringsToMatrix(inputStrings);
// ...
const solverPreview = solverResult
  ? (solverStep !== null ? solverResult.steps[solverStep].matrix : solverResult.result)
  : null;
```

`current` is the manual-mode matrix: the live session (`matrix`) if one's
running, otherwise whatever the input grid currently holds, freshly parsed.
`solverPreview` is the solver-mode matrix: `null` if nothing's been solved
yet, otherwise either a specific step's snapshot (if the learner clicked a
step to preview it) or the final result.

Now find where these get chosen between, at the `MatrixGrid` call further
down:

```jsx
<MatrixGrid
  matrix={mode === "solver" && solverPreview ? solverPreview : current}
  augmented={augmented}
  editing={mode === "manual" ? !matrix : !solverResult}
  inputStrings={inputStrings}
  onCellChange={updateInput}
/>
```

That inline expression —
`mode === "solver" && solverPreview ? solverPreview : current` — is the
single, precise answer to "what matrix is the user looking at right now,"
built from the four state values above. Hold onto this expression; it's the
one thing the Copy button needs, and it's about to matter a lot in Step 2.

### Step 2 — Name "What's On Screen" Before You Duplicate It

You are about to write a Copy button whose whole job is "grab whatever
matrix is currently visible." That's the *exact* expression from Step 1.
Copy-pasting it a second time — once for `MatrixGrid`'s `matrix` prop, once
for the copy handler — would create two independent copies of the same
decision. If a third mode were ever added to this tool, or the solver's
preview logic changed, a person would have to remember to update both
copies, in two different places in the file, to keep them agreeing.

This is the same shape of problem as the `series.ts` / `LESSON_FILES`
duplication from the lesson-engine-autofind lessons — **single source of
truth** — just caught here *before* it happens instead of after. Fix it by
naming the value once:

```javascript
const displayedMatrix = mode === "solver" && solverPreview ? solverPreview : current;
```

Place this line directly below where `solverPreview` is computed. Then
replace the `MatrixGrid` call's `matrix` prop:

```jsx
<MatrixGrid
  matrix={displayedMatrix}
  augmented={augmented}
  editing={mode === "manual" ? !matrix : !solverResult}
  inputStrings={inputStrings}
  onCellChange={updateInput}
/>
```

**SE lens:** This is a **derived value**, computed fresh on every render
from other state, never stored in its own `useState`. It doesn't need to
be — it's fully determined by `mode`, `matrix`, `current`, and
`solverPreview`, all of which are already tracked. Storing it in a fifth
`useState` would create a *fifth* thing that could drift out of sync with
the state it depends on, for zero benefit. Deriving it, once, by name, gets
you a single reusable answer without adding a new piece of state to keep
consistent — the same "cheap to compute, don't cache it" instinct that led
`current` and `solverPreview` themselves to be plain `const`s instead of
`useState`s.

### Step 3 — Concept Lab: The Clipboard API in Isolation

Before touching `MatrixReducer.jsx` again, prove the browser mechanism
works on its own, with no matrix, no fractions, no existing component in the
way.

**3a.** Create a disposable file, `src/scratch-clipboard-lab/Lab.jsx`:

```jsx
import { useState } from 'react'

export default function ClipboardLab() {
  const [copied, setCopied] = useState(false)

  function copyGreeting() {
    navigator.clipboard?.writeText('hello from the clipboard lab').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return <button onClick={copyGreeting}>{copied ? 'Copied!' : 'Copy'}</button>
}
```

**3b.** Temporarily render it. Add to `src/main.jsx`, right after the other
top-level imports:

```javascript
import ClipboardLab from './scratch-clipboard-lab/Lab.jsx'
```

and mount it somewhere it'll actually show up on screen — the simplest
option is temporarily replacing whatever `ReactDOM.createRoot(...).render(...)`
currently renders with `<ClipboardLab />`, just for this experiment. (Note
exactly what it replaced — you're about to put it back.)

**3c.** Run `npm run dev`, open the app, click the button. Open a text
editor or an empty search box and paste (Ctrl+V) — `hello from the
clipboard lab` appears. Click again — button briefly reads "Copied!", then
reverts to "Copy" after roughly a second and a half.

**Walkthrough:** `navigator` is a browser-provided global object describing
the browser environment itself (things like `navigator.userAgent`,
`navigator.language` — and, here, `navigator.clipboard`).
`navigator.clipboard.writeText(text)` asks the browser to place `text` on
the operating system's clipboard and returns a **`Promise`** — a JavaScript
object representing a value that isn't ready yet, but will be (or will
fail) at some point in the future. Writing to the clipboard isn't
instantaneous or guaranteed: the browser may need to check permissions
first, or the OS call itself takes a moment — so `writeText` can't just
return the result directly the way a normal function does. `.then(callback)`
registers `callback` to run once that promise **resolves** (succeeds).
Here, the callback is `() => { setCopied(true); setTimeout(...) }` — an
**arrow function**, a compact function syntax where the part before `=>` is
the parameter list (empty, here) and the part after is the function body.
`setTimeout(fn, 1500)` is a browser API that schedules `fn` to run once,
1500 **milliseconds** (1.5 seconds) later — it's what makes "Copied!" a
*temporary* confirmation instead of a permanent label change.

**3d. Vary the input, once, to see the defensive `?.` actually matter.**
Temporarily change the click handler to:

```javascript
function copyGreeting() {
  const fakeNavigator = {}   // simulates a browser/context with no Clipboard API
  fakeNavigator.clipboard?.writeText('hello').then(() => setCopied(true))
}
```

Click the button. Nothing happens — no crash, no error in the console, just
silently nothing, because `fakeNavigator.clipboard` is `undefined` and `?.`
(**optional chaining**) short-circuits the whole expression to `undefined`
the moment it hits a missing property, skipping the `.writeText(...)` call
entirely instead of throwing. Now remove the `?.` — change it to
`fakeNavigator.clipboard.writeText(...)` — and click again. This time the
browser console (F12 → Console) shows a real crash:
`TypeError: Cannot read properties of undefined (reading 'writeText')`.

**What this proves:** `navigator.clipboard` genuinely can be missing —
the real Clipboard API only exists in a **secure context** (a page served
over HTTPS, or `localhost` during development, which is why your dev server
works fine) and isn't present in every browser or embedding context. `?.`
is not a style preference here; it's the difference between "the copy
button quietly does nothing in an unsupported context" and "clicking this
button crashes this part of the page." Revert your test changes back to
the real `copyGreeting` from 3a before continuing.

**3e. Delete the lab.** Remove `src/scratch-clipboard-lab/`, remove the
import from `main.jsx`, and put back whatever `main.jsx` was rendering
before you swapped in `<ClipboardLab />`. Confirm `npm run dev` shows the
real app again. This code's job is done — it never enters the project.

**Recognition — optional chaining as defensive access recurs in:** every
`?.` you'll find already in this codebase (`navigator.clipboard?.writeText`
appears, unmodified, in `src/tools/calculator/index.jsx` and
`src/labs/robot-arm-sim/RobotArmLab.jsx` — the exact same guard, for the
exact same reason); reading a possibly-missing key from a parsed JSON API
response (`response.data?.user?.name`); walking a possibly-null linked
list or tree node in any language with nullable references. The pattern is
always the same: "if any link in this chain is missing, stop, don't crash."

### Step 4 — Prior Art: This Codebase Already Has the Copy-Button Pattern

Before writing the real button, read `Teach2DPanel` inside
`src/labs/robot-arm-sim/RobotArmLab.jsx`:

```javascript
const [copied, setCopied] = useState(false);
// ...
const copyCode = () => {
  navigator.clipboard?.writeText(genCode()).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false), 1500); });
};
```

```jsx
<button onClick={copyCode} style={{
  marginLeft:"auto",background:copied?"#10b98122":"#0f1e33",
  border:`1px solid ${copied?"#10b98166":"#1a3050"}`,borderRadius:4,
  color:copied?"#10b981":"#3a5870",padding:"3px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit",
}}>{copied?"✓ Copied":"Copy"}</button>
```

This is precisely what you built in the concept lab — `copied` state,
`.then()`, `setTimeout` — applied to real generated robot-motion code
instead of a hardcoded greeting. **SE lens:** this confirms the lab wasn't
an invented toy pattern; it's this codebase's actual, working convention for
"give transient confirmation after an async action succeeds," used the same
way in at least two other tools already
(`src/tools/calculator/index.jsx` uses the bare `navigator.clipboard?.writeText(...)`
half of it, without the `copied`-state feedback, for a single-line result —
worth less ceremony for a one-line answer; Matrix Reducer's multi-line
output deserves the fuller pattern, same reasoning `RobotArmLab` used for
multi-line generated code). Notice one difference worth keeping, not
copying blindly: `RobotArmLab.jsx` hand-writes its button's colors inline
for this one button. `MatrixReducer.jsx` already has a shared
`S.btn(variant)` style helper (look near the top of the file — `"green"`,
`"red"`, `"blue"`, `"amber"`, `"ghost"`, and a default). Reuse *that*
instead of hand-writing new inline colors — it already defines exactly the
green/default contrast this button needs, and it's the convention every
other button in this file already follows.

### Step 5 — Design the Text Format

`writeText` needs a single string. Decide what "the matrix, as text" means
before writing the function — a small, deliberate design decision, not an
afterthought.

**The problem:** A raw fraction object like `{ n: 3, d: 2 }` means nothing
outside this file. The tool already has a function that turns one fraction
into readable text — `fracToString(f)`, used everywhere the grid displays a
cell (`fracToString({n:3,d:2})` → `"3/2"`; `fracToString({n:5,d:1})` →
`"5"`). Reuse it; don't invent a second number-to-string function.

**The augmented case:** Look at `MatrixGrid` — when `augmented` is true, it
draws a vertical divider line before the last column, visually separating
the coefficient matrix from the "answer" column of a linear system. The
copied text should preserve that same distinction, or it silently throws
away information the screen was showing.

Add this near the other matrix helpers, just below `stringsToMatrix`:

```javascript
function matrixToClipboardText(matrix, augmented) {
  const numCols = matrix[0]?.length ?? 0;
  const augSplit = augmented ? numCols - 1 : numCols;
  return matrix.map(row => {
    const cells = row.map(fracToString);
    if (!augmented) return `[ ${cells.join(', ')} ]`;
    const left = cells.slice(0, augSplit).join(', ');
    const right = cells.slice(augSplit).join(', ');
    return `[ ${left} | ${right} ]`;
  }).join('\n');
}
```

**Walkthrough:** `matrix[0]?.length ?? 0` reads the first row's length to
get the column count — the `?.` guards against an empty matrix (`matrix[0]`
would be `undefined`), the `??` gives `0` if that lookup came back
`null`/`undefined`. `augSplit` is computed exactly the way `MatrixGrid`
already computes it (`augmented ? numCols - 1 : numCols`) — same rule,
same reasoning: the last column is the "answer" column only when
`augmented` is true. `matrix.map(row => ...)` turns each row into one line
of text; `row.map(fracToString)` turns each fraction in that row into its
string form — passing `fracToString` directly as the callback works because
it already takes exactly one argument (the fraction) and returns exactly
one value (the string), matching what `.map()` calls its callback with.
`cells.slice(0, augSplit)` and `.slice(augSplit)` split the row's string
cells into "before the divider" and "after the divider." `.join(', ')`
turns an array of strings into one comma-separated string;
`.join('\n')` at the very end stacks each row's line onto its own line
(`\n` is the newline character). For a 2×3 augmented matrix holding
`[[1,0,3],[0,1,-2]]`, this produces:

```text
[ 1, 0 | 3 ]
[ 0, 1 | -2 ]
```

**CS lens:** This is a small, purpose-built **serializer** — a function
that converts an in-memory data structure (nested fraction objects) into a
flat, portable representation (a string) with no information loss for the
things that matter (values, sign, row order, the augmented boundary).
Every "export" or "save" feature in real software is some version of this:
JSON.stringify, a CSV writer, a database's row-to-disk encoding — all take
a structure your program understands and produce a string or byte sequence
something *outside* your program can understand.

### Step 6 — Wire Up the Button

Add the feedback state near the tool's other state declarations:

```javascript
const [copied, setCopied] = useState(false);
```

Add the handler, near `copyMatrix`'s natural neighbors — right after
`switchMode`, before the drag-handling code, is a reasonable spot:

```javascript
function copyMatrix() {
  const text = matrixToClipboardText(displayedMatrix, augmented);
  navigator.clipboard?.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });
}
```

This is the Step 3 lab and the Step 4 prior-art pattern, combined: the same
`copied` / `.then()` / `setTimeout` shape, now calling the real
`matrixToClipboardText` from Step 5 on the real `displayedMatrix` from
Step 2, instead of a hardcoded greeting.

Now add the button itself. Find the button row inside the matrix card
(search for `↩ Undo` — it's the `<div style={{ display: "flex", gap: 8, ...`
just above it) and add the Copy button as the *first* child, unconditional
— it should work whether or not a manual session or solve has started,
since `displayedMatrix` is always defined:

```jsx
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
  <button style={S.btn(copied ? "green" : "ghost")} onClick={copyMatrix}>
    {copied ? "✓ Copied" : "⧉ Copy"}
  </button>
  {mode === "manual" && matrix && (
    <>
      <button style={S.btn()} onClick={undo} disabled={!history.length}>↩ Undo</button>
      <button style={S.btn()} onClick={clearHistory} disabled={!history.length}>↩↩ Revert</button>
      <button style={S.btn("red")} onClick={resetSession}>Reset</button>
    </>
  )}
  {mode === "solver" && solverResult && (
    <button style={S.btn("red")} onClick={() => { setSolverResult(null); setSolverStep(null); }}>
      Reset
    </button>
  )}
</div>
```

**Walkthrough:** `S.btn(copied ? "green" : "ghost")` is a **function call
inside a ternary** — `S.btn` (Step 4) returns a different style object
depending on the string you pass it. When `copied` is `false`, this reads
`S.btn("ghost")` — a low-emphasis, mostly-transparent button, appropriate
for an action that isn't the primary thing on this card. When `copied`
flips to `true`, the very next render calls `S.btn("green")` instead,
giving the same button a green background and border for the 1.5 seconds
the confirmation is showing, then it flips back. `{copied ? "✓ Copied" : "⧉ Copy"}`
does the same swap for the button's text.

### Step 7 — Verify

Run `npm run dev`, open Matrix Reducer. Type a few values into the grid,
click Copy before starting anything — paste somewhere, confirm you get your
raw input matrix as text. Click "Start Manual →", apply a row operation,
Copy again — confirm the *current* (post-operation) matrix copies, not the
original. Switch to the Solver tab, run RREF, click a step in the step list
to preview it, Copy — confirm you get *that specific step's* matrix, not
the final result (this is `displayedMatrix` correctly picking up
`solverPreview`, from Step 2, when a step is selected). Click "final" (or
click the active step again to deselect), Copy once more — confirm you now
get the completed RREF result. Toggle "Augmented" on and off and confirm
the `|` divider appears and disappears in the copied text to match.

---

## Connect the Pieces

`displayedMatrix` (Step 2) answers "what's on screen" once, for both the
grid that renders it and the button that copies it — the same
single-source-of-truth principle from the lesson-engine-autofind lessons,
just caught proactively instead of fixed reactively. `matrixToClipboardText`
(Step 5) reuses `fracToString`, a function that already existed for a
different purpose (rendering a cell), instead of writing a second
number-formatting function — the same instinct that made you export
`parseFrontmatter` instead of writing a second frontmatter parser in the
lesson-engine work. `copyMatrix` (Step 6) is the Step 3 lab's exact shape,
proven correct in isolation first, then connected to real data — and it's
also, verified in Step 4, this codebase's established convention, not a
new one you invented. Every piece here was either already sitting in this
file waiting to be reused, or already proven to work elsewhere in this
app.

---

## What Breaks Without This

Without the `?.` in `navigator.clipboard?.writeText(...)` (proven directly
in Step 3d): in any context where `navigator.clipboard` doesn't exist —
not a secure context, or an embedding environment that doesn't expose it —
clicking Copy throws `TypeError: Cannot read properties of undefined
(reading 'writeText')` and crashes that click handler, instead of the
button simply doing nothing. Without deriving `displayedMatrix` once
(Step 2) and instead writing the "what's on screen" ternary a second time
inside `copyMatrix`: the two copies work today, but the next person (or
you, in six months) who changes how solver previews work only has to
remember to update one of the two copies to introduce a bug where Copy
grabs a different matrix than the one visibly on screen — silent, and hard
to notice, because both versions look right most of the time.

---

## Definition of Done

- [ ] `displayedMatrix` is derived once in `MatrixReducer.jsx` and used by
      both `MatrixGrid`'s `matrix` prop and `copyMatrix` — no second copy
      of the "what's on screen" expression exists
- [ ] `matrixToClipboardText(matrix, augmented)` exists, reuses
      `fracToString`, and correctly places the `|` divider only when
      `augmented` is true
- [ ] Clicking Copy places the currently-displayed matrix on the system
      clipboard, verified by pasting it somewhere real
- [ ] The button reads "✓ Copied" for roughly 1.5 seconds after a
      successful copy, then reverts
- [ ] Copy works correctly in all three situations tested in Step 7: before
      any session/solve has started, mid-manual-session, and while
      previewing a specific solver step
- [ ] You can explain, without notes, what a `Promise` is and why
      `writeText` returns one instead of just returning the result directly
- [ ] You can explain what `?.` does and reproduce, from memory, the crash
      Step 3d showed when it's removed
- [ ] You can name the two other files in this codebase that already use
      `navigator.clipboard?.writeText`, and what's different about Matrix
      Reducer's version
- [ ] `git commit` with a message explaining why — for example: "Add copy-
      to-clipboard for Matrix Reducer's current matrix, following the
      copied-state confirmation pattern already used in RobotArmLab"

Lesson 2 in this folder picks up a real bug this feature makes worse, found
while reading this file: a matrix cell containing unparseable text is
silently treated as zero, with no warning anywhere — including, now, in
whatever you copy to your clipboard.
