# TypeScript Spreadsheet — Lesson 20 — Organising Into Modules

## What You Will Build

Nothing new appears on screen. One large `script.ts` becomes five smaller
files — `types.ts`, `tokenizer.ts`, `parser.ts`, `evaluator.ts`, and
`spreadsheet.ts` — each with one clear responsibility, with the exact
same behaviour as before. This lesson also answers a question this
project's README raised back in lesson 01 and has deferred ever since:
what does "a module" actually mean in an environment with no real
`import` or `export` at all?

---

## What You Need to Know First

By lesson 19, `script.ts` contains every type, the tokenizer, the parser,
the evaluator, and every piece of DOM and state-handling code this
project has built, all in one file.

---

## Concept: What HTML Lab's Multi-File JavaScript Actually Does

Click **+ File** in the JavaScript tab, and a second file can exist
alongside `script.ts` — but nothing about that second file works the way
a real ES module does. There is no `import`, no `export`. HTML Lab
**concatenates every file's contents into one single script, in the
order they appear in the file list**, before Babel ever sees any of it.
Every function, every type, every top-level `const` this project has
ever declared already lives in one shared scope — splitting across files
changes *where you type something*, not *what scope it exists in*.

**Why splitting still has real value, even without enforcement.**
A real module system's `import`/`export` does two things at once: it
organizes code into logical units, *and* it enforces that a file can only
use what it explicitly asked for. HTML Lab's file split only gives the
first half. That half is still worth having: a file named `evaluator.ts`
containing only evaluation logic tells you, immediately, where to look
for a bug in how formulas compute — the same value a well-organized
project always has, whether or not anything technically stops you from
reaching across files improperly.

**Why file order barely matters here, and precisely why.** In a real
module system, each file lists its own dependencies, and the loader
guarantees they are ready first, regardless of where files sit in a
project. This project's files have no such guarantee — but its actual
code still works in any reasonable order, for a specific, checkable
reason: every function this project has written is a `function`
declaration, and function declarations are **hoisted** — made available
throughout their entire containing scope before any code actually runs,
regardless of where, textually, they were written. Since every file
concatenates into one shared scope, a function defined in a *later* file
is still fully available to code in an *earlier* one. The only genuine
order requirement is the very last lines of the very last file:
`loadSpreadsheet(); renderGrid();` must run after everything else has at
least been *defined* — true the moment they are the last lines anywhere
in the whole concatenated script, regardless of which physical file they
live in.

---

## Step 1 — `types.ts`: Every Type, Nothing Else

Click **+ File**, name it `types.ts`. Move every `interface` and `type`
declaration from `script.ts` into it: `Coordinate`, `CellId`, `Cell`,
`Token`, every AST node interface, `ExpressionNode`, `ParseError`,
`ParseResult`, `EvaluationResult`, `NumberListResult`, `CellFormat`,
`CellStyle`, and `SpreadsheetSnapshot`.

**Walkthrough.** None of this costs anything at runtime — every one of
these is erased entirely by Babel before Preview ever runs, exactly as
this project's README explained back in lesson 01. Grouping them
together is purely for a human reader: "what shapes does this project's
data come in?" now has exactly one file to open.

---

## Step 2 — `tokenizer.ts` and `parser.ts`

Create `tokenizer.ts`, and move `isDigit`, `isUpper`, and `tokenize` into
it. Create `parser.ts`, and move `parse` (with its nested `peek`,
`advance`, `peekAt`, `parsePrimary`, `parseArgument`, `parseUnary`,
`parseMultiplication`, `parseAddition`, and `parseExpression`) into it.

**Walkthrough.** These two files map directly onto two of the five
pipeline stages named all the way back in lesson 06's README: text goes
in to `tokenizer.ts`, tokens go in to `parser.ts`, a tree comes out. A
reader who only wants to understand *how a formula's text becomes
structure* now has exactly two files to read, in order, with nothing
about evaluation or the DOM mixed in to distract from that one question.

---

## Step 3 — `evaluator.ts`

Create `evaluator.ts`, and move `assertNever`, `ok`, `fail`,
`applyOperator`, `evaluate`, `parseCellName`, `expandRange`,
`SPREADSHEET_FUNCTIONS`, `evaluateArgumentToNumbers`,
`evaluateFunctionCall`, `formatNumber`, `computeCellValue`,
`lookupCellValue`, and `extractDependencies` into it.

**Walkthrough — `assertNever` belongs here now, not in `types.ts`.**
`assertNever` is a real function, not a type — it has actual behaviour
(throwing at runtime) even though its *purpose* is enforcing something
about types. Grouping by what a piece of code actually *is* (a runtime
function, versus a type with zero runtime footprint) is a more useful
split than grouping by what topic it merely relates to.

---

## Step 4 — `spreadsheet.ts`

Rename `script.ts` to `spreadsheet.ts`, keeping everything not yet
moved: `COLUMN_COUNT`, `ROW_COUNT`, `columnLetter`, `cellId`,
`requireElement`, every piece of mutable state (`cells`, `cellFormats`,
`cellStyles`, `dependencies`, `dependents`, `valueCache`, `undoStack`,
`redoStack`, `selectedCoordinate`, `editingCoordinate`), every `render*`
function, `selectCell`, `moveSelection`, `commitEdit`, `startEditing`,
`updateDependencies`, `addDependent`, `findAllDependents`,
`invalidateCache`, `takeSnapshot`, `restoreSnapshot`, `recordHistory`,
`undo`, `redo`, `saveSpreadsheet`, `loadSpreadsheet`, `updateDebugPanel`,
and the `document.addEventListener('keydown', ...)` block. End the file
with `loadSpreadsheet(); renderGrid();`, exactly as before.

Click **▶ Preview**. Every feature — selection, editing, formulas,
undo, styling, persistence — behaves identically to before this lesson.

**Walkthrough — why this file is the largest, and that is fine.**
`spreadsheet.ts` owns everything genuinely specific to *this*
application: its DOM structure, its mutable state, its event wiring.
`types.ts`, `tokenizer.ts`, `parser.ts`, and `evaluator.ts` describe a
small, self-contained formula language that does not know or care that
it happens to be embedded in a spreadsheet at all — nothing in any of
those four files references `cells`, `selectedCoordinate`, or a single
DOM element. `spreadsheet.ts` is the one file that connects that
self-contained language to an actual, visible grid.

**SE lens — the same boundary lesson 07 already built, now visible as a
real file boundary.** `parse`'s independence from spreadsheet state — 
tested back in lesson 07 by calling `parse(tokenize(...))` directly from
the console — was always a *design* property. Splitting `parser.ts` into
its own file makes that same property visible structurally: nothing in
that file could reach into `spreadsheet.ts`'s state even if it wanted to,
because nothing in it ever needed to.

---

## Connect the Pieces

```
types.ts        Every interface and type — zero runtime footprint
tokenizer.ts     Text → Token[]
parser.ts        Token[] → ExpressionNode
evaluator.ts     ExpressionNode → EvaluationResult, plus cell lookups
                 and the dependency-extraction tree walk
spreadsheet.ts   Everything specific to this one application: state,
                 rendering, events, persistence, undo
```

---

## What Breaks Without This

**Placing `loadSpreadsheet(); renderGrid();` inside `spreadsheet.ts`, but
not as its very last lines — say, above `updateDebugPanel`'s
definition:** Nothing breaks. Function hoisting makes every function
declaration in the entire concatenated script available everywhere,
regardless of where, textually, either of these two calls sits, as long
as they are calls, not declarations. Try moving them deliberately to
confirm this for yourself — it is a real, if slightly surprising,
consequence of how this project has been written from lesson 01 onward.

**Defining `SPREADSHEET_FUNCTIONS` as a function that *calls* something
from `spreadsheet.ts` at the moment the const itself is created (not
inside one of its arrow functions, which only run later):** This
*would* genuinely break if `evaluator.ts` happened to be concatenated
*before* whatever it depended on existed yet — unlike function
declarations, top-level `const` initializers run immediately, in
file order, the moment the script executes. This project avoids the
problem entirely by never having a top-level `const` whose initial value
depends on anything defined in a different file.

---

## Definition of Done

- [ ] The project is split across `types.ts`, `tokenizer.ts`, `parser.ts`, `evaluator.ts`, and `spreadsheet.ts`
- [ ] Every feature behaves identically to before the split
- [ ] You can explain what HTML Lab actually does with multiple files, and how it differs from a real ES module system
- [ ] You can explain why function declaration order across files does not matter here, but top-level `const` initializers could, in principle
- [ ] You can point to which file you would open first to answer "how does operator precedence work in this project?"

---

*Next: Lesson 21 — Export and Import as CSV. The sheet can already save
itself to `localStorage` — this lesson lets it leave the browser
entirely, as a real `.csv` file, and load one back in.*
