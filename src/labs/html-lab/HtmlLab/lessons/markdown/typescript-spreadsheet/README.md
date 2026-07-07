# TypeScript Spreadsheet — A Small Excel, Built to Teach TypeScript

## What You Will Build

A real, working spreadsheet: a grid of cells you click and edit, holding
numbers, text, or formulas like `=A1+B1` or `=SUM(A1:A3)`, recalculating
automatically when a cell it depends on changes. Not a clone of Excel —
Excel has decades of features this project has no reason to build. What
this project *does* build is the one part of a spreadsheet that is
genuinely hard to get right: a small piece of data that can honestly be one
of several different shapes, and code that has to behave correctly no
matter which shape it turns out to be. That is exactly the problem
TypeScript's type system was built to solve.

This project is built entirely inside **HTML Lab**, using real `.ts` files
— no separate compiler to install, no `tsconfig.json` to configure, no
terminal. Open HTML Lab, add a `.ts` file in the JavaScript tab, and you are
already writing real, type-checked TypeScript.

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../../../../../docs/LESSON_CONTRACT.md).
Its principles apply at full strength here — nothing assumed, every concept
explained at first use, both lenses on every non-trivial block, agile
vertical slices, maximum extraction — for a learner who has never written
TypeScript, and for one who already knows JavaScript and wants to
understand exactly what types add. Where the contract discusses a domain
this environment does not have in the form the contract describes it
(there is no terminal, no `tsc` command line, no `npm`, no real ES
modules), the *domain* is still taught — type checking, dependency
organisation, module boundaries are all real, important ideas — but taught
for what this environment actually provides, exactly as the companion
[Video Notes](../video-notes/README.md) project already did for `git` and
`npm`.

## Concept: How TypeScript Actually Works in This Environment

This matters enough to state before lesson 1, because it is different from
how TypeScript works almost everywhere else it is used, and it will look
like a contradiction the first time you notice it if nobody says so first.

**Two separate systems are involved, and they do two completely different
jobs.** Monaco — the code editor HTML Lab's JavaScript tab is built on, the
same editor VS Code itself uses — reads every `.ts` file you write and
checks it against TypeScript's real rules, live, as you type. A red
squiggly line under your code means Monaco's own TypeScript engine found a
real type error — this checking is genuinely real, not a simulation, and it
requires no setup at all.

**Babel — the tool that actually turns your code into something the
browser can run — does something entirely different: it deletes your
types.** Before your code ever reaches ▶ Preview, every type annotation,
every `interface`, every generic parameter is stripped out completely.
What is left is plain JavaScript. Babel never checks whether your types
were used correctly — it does not even look.

**The honest consequence:** if you ignore a red squiggly line and click ▶
Preview anyway, your code will still run — possibly incorrectly, possibly
crashing at runtime in exactly the way the type system tried to warn you
about, but it *will* run, with no error stopping it. This is different from
a real production TypeScript project, where a build step (`tsc`, or a
bundler configured to run it) refuses to produce output at all until every
type error is fixed. This project has no such gate. The type checking is
just as real; only the *enforcement* is missing. Getting comfortable
reading and trusting Monaco's red squiggles — without a build step forcing
you to — is itself a real skill, and one this project deliberately asks you
to practise from lesson one.

**One more honest note.** Monaco's checking is real, but it is one
specific tool, not a perfect oracle identical to every TypeScript setup
you might use later. A small number of lessons in this project point out
a real, verified spot where Monaco's narrowing behaves slightly
differently from what you might expect — always confirmed live, never
assumed, and always with the working alternative shown right next to it.

## Why This Project

Every feature below exists because a spreadsheet without it would not be
honest to call a spreadsheet, not because a lesson invented a reason to use
a TypeScript feature. A cell needs to hold a number, some text, *or* a
formula — never more than one, never something in between — which is
precisely what a **discriminated union** is for. A formula needs to be
recalculated when something it depends on changes — a real, small
**dependency graph**. Two different cells referencing each other,
`=A1` in `B1` and `=B1` in `A1`, is a real bug a real spreadsheet must
detect and refuse to loop forever on. None of this is contrived. It is what
a spreadsheet actually is.

## How the Lessons Are Ordered

A visible grid exists from lesson one — empty cells you can already see,
before a single type is defined. Every lesson after that adds one real
capability to a spreadsheet that is already on screen and already working.
The type system is introduced exactly where plain JavaScript starts to
struggle: a cell's value only actually needs to be *one type describing
three possibilities* the moment a cell can hold three different kinds of
thing, which is lesson 4 — not lesson 1, because lesson 1 has nothing yet
that would make a beginner feel why a union type is worth the syntax.

## Lessons

The formula engine (lessons 06–14) is deliberately the largest section of
this project. A spreadsheet formula is a tiny programming language, and
building a real tokenizer → parser → AST → evaluator pipeline for it —
rather than reaching for `eval()`, which would teach nothing — is the same
pipeline this site's own OpenMAT interpreter project builds in full. Every
stage stays visible while it is being built: a small debug panel shows the
raw tokens and the parsed tree as you type, the same "echo it before you
can act on it" trick a language console uses long before it can run real
programs.

| # | Title | You Can See | Concepts |
|---|---|---|---|
| 01 | The Grid | A real grid of labelled, empty cells (A1, B1, ... F10) | `interface`, `type` aliases, generating column letters, nested loops |
| 02 | Selecting a Cell | Click a cell — it highlights; only one cell is ever selected | Union types with `null`, `readonly` properties, derived UI state |
| 03 | Editing a Cell | Double-click or press Enter — type a raw value, it saves | DOM input overlays, `Record<K, V>`, keyboard events |
| 04 | Numbers and Text | Typed values become real numbers or text automatically | Discriminated unions, `switch` narrowing — the `Cell` type this whole project is built around |
| 05 | Formulas Appear | Typing `=anything` is recognised and stored as a third kind of cell | Extending a union, exhaustiveness checking with `never` |
| 06 | Tokenizing a Formula | A debug panel shows `=A1+B2*5` broken into real tokens as you type | Lexing, a `Token` discriminated union, string scanning |
| 07 | Parsing Into a Tree | The same panel shows a real Abstract Syntax Tree, correctly respecting `*` before `+` | Recursive descent parsing, operator precedence, AST node types |
| 08 | Evaluating the Tree | `=10+5*2` finally computes — correctly, as `20`, not `30` | Recursive tree evaluation |
| 09 | Cell References in Formulas | `=A1+B1` reads two other cells' real current values | Reusing the evaluator's structure for a new node kind |
| 10 | Functions and Ranges | `=SUM(A1:A10)`, `AVG`, `MIN`, `MAX`, `COUNT` all work | Parsing ranges, coordinate math, a typed dispatch table |
| 11 | The Dependency Graph | Change A1 — every formula depending on it updates automatically | Graphs, `Map`, topological recalculation order |
| 12 | Circular References | `=A1` inside `A1` shows a clear error instead of freezing the page | Cycle detection during graph traversal |
| 13 | Errors as Values | Every failure mode shows a real, specific message, never a crash | Refactoring ad-hoc failure signals into a `Result`-style discriminated union |
| 14 | Recalculation Performance | Editing one cell no longer silently recomputes the whole sheet | Dirty-cell tracking, honest performance reasoning |
| 15 | Number Formatting | Display a cell as currency or a percentage without changing its stored value | String literal types, `Intl.NumberFormat` |
| 16 | Cell Styles | Bold, italic, and colour, applied per cell | Optional properties, nested interfaces, `Partial<T>` |
| 17 | Saving and Loading | Reload the page — every cell, formula, and style survives | `localStorage`, serializing a typed structure honestly |
| 18 | Undo and Redo | Ctrl+Z and Ctrl+Shift+Y step backward and forward through every edit | Immutability, `Readonly<T>`, a history stack |
| 19 | Keyboard Navigation | Arrow keys move the selection; Enter confirms and moves down | Global `keydown` handling, the same trap Video Notes' lesson 17 named |
| 20 | Organising Into Modules | The same spreadsheet, split across `types.ts`, `parser.ts`, `evaluator.ts` | What a "module" means in an environment with no real `import`/`export` |
| 21 | Export and Import as CSV | Download the sheet as a real `.csv` file; load one back in | A second small parser, `async`/`await` |
| 22 *(optional)* | From Functions to a Class | The same behaviour, reorganised around a `Spreadsheet` class | Classes, encapsulation, motivated by real, felt repetition |
| 23 *(optional)* | Generics, Revisited | The grid's storage and the undo history both become genuinely reusable | Generic types and functions, `Grid<T>` |

## Definition of Done (whole project)

- A grid of cells can be selected, edited, and holds numbers, text, and formulas
- Formulas support cell references, arithmetic, parentheses, and `SUM`/`AVG`/`MIN`/`MAX`/`COUNT` over ranges
- Changing a cell correctly recalculates every formula that depends on it, directly or indirectly
- A circular reference shows a clear error instead of freezing the page
- Cells can be formatted and styled without changing what is actually stored
- The whole sheet survives a page reload, and can be exported to and imported from a real `.csv` file
- You can explain, without looking anything up, what a discriminated union is and point to the exact moment this project needed one
