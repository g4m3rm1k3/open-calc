# React Calculator — A Student Scientific Calculator, Built to Teach React

## What You Will Build

A real, working scientific calculator: a display, a keypad, a scientific
mode with trig and logarithms, memory buttons, a library of saved formulas
you can create and edit, a history of past calculations, and a settings
panel for theme, precision, and angle mode. Not a clone of a TI-84 — a
graphing calculator has decades of accumulated features and menu layers
this project has no reason to build. What this project scopes itself to is
enough real functionality to feel like a genuine tool, built entirely in
**React**, with every core idea React exists to solve arising naturally from
something the calculator actually needs.

This project is built entirely inside **HTML Lab**, using real `.tsx` and
`.ts` files in the JavaScript tab — the same tab, the same Monaco editor,
the same ▶ Preview button used by the [TypeScript Spreadsheet](../typescript-spreadsheet/README.md)
project. If you have not done that project, at least read its
["How TypeScript Actually Works in This Environment"](../typescript-spreadsheet/README.md#concept-how-typescript-actually-works-in-this-environment)
section first — everything it says about Monaco checking types live while
Babel silently deletes them before ▶ Preview applies here without
change. What's new in this project is JSX: files ending in `.tsx` (not
`.ts`) can contain HTML-like syntax directly inside TypeScript, and HTML
Lab already knows how to turn that into a running page — the exact
mechanics are taught in lesson 01.

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../../../../../docs/LESSON_CONTRACT.md),
at full strength, for a learner who has never written React, and for one
who already knows React and wants to find out what they've been doing on
autopilot. Nothing assumed, every concept explained at first use, both
lenses (what this is computationally, why it's designed this way) on every
non-trivial block, agile vertical slices, maximum extraction.

## The One Idea That Organises This Whole Project

> **The math engine is not React. React is not the math engine.**

Every file in this project belongs to exactly one of two piles:

- **The engine** (`engine/tokenizer.ts`, `engine/parser.ts`,
  `engine/evaluator.ts`, `engine/memory.ts`, `engine/formulas.ts`,
  `engine/history.ts`) — plain TypeScript. No `import React`. No JSX. No
  `useState`. It has no idea a screen exists. Given `"2+3*4"`, it returns
  `14`. Given a percent button's value and an operator, it returns the next
  display string. That is the entire job.
- **The UI** (`App.tsx`, `Display.tsx`, `Keypad.tsx`, `Button.tsx`, and
  every other `.tsx` file) — plain React. It never computes a result
  itself. It calls a function the engine exported, and puts whatever comes
  back on the screen.

This is not a rule imposed for tidiness. It is **separation of concerns**,
the same software engineering principle the TypeScript Spreadsheet project
built around its own tokenizer/parser/evaluator pipeline — and this
project's engine reuses that project's exact technique (a real recursive
descent parser, not `eval()`, not a regex) because `2+3*4` and `=SUM(A1:A3)`
are the same underlying problem: a tiny expression language that has to
respect operator precedence. Lesson 10 names this connection explicitly
when it happens.

The reason this particular project teaches this particular lesson so well:
a calculator is the smallest possible program where "what does the screen
look like" and "what does the answer mean mathematically" are obviously,
undeniably two different jobs — and where gluing them together anyway is
the single most common beginner mistake in every framework, not just React.

## Scope: A Student Scientific Calculator, Not a TI-84

- **Basic** — add, subtract, multiply, divide, percent, parentheses, sign change
- **Scientific** — powers, roots, logarithms, trig (sin/cos/tan), degree/radian mode
- **Memory** — MS, MR, MC, M+, M-
- **Formula Library** — save, edit, organize, and favorite named formulas
- **History** — every past expression and result, click one to reuse it
- **Settings** — theme, decimal precision, angle mode

## How the Lessons Are Ordered

A visible calculator exists from lesson one — a display and a keypad on
screen, before a single button actually does anything. Every lesson after
that adds one real capability to something already visible and already
running, never invisible infrastructure waiting on a future reveal. The
math engine does not appear until lesson 08, once buttons already exist for
it to answer to — building a parser before there is a screen that could
show its output would be exactly backwards.

## Lessons

The engine (lessons 08–14) is the second-largest section of this project,
for the same reason it was the largest section of the TypeScript
Spreadsheet project: a real expression language deserves a real tokenizer →
parser → AST → evaluator pipeline, not a shortcut that teaches nothing.

| # | Title | You Can See | Concepts |
|---|---|---|---|
| 01 | Your First Component | A calculator-shaped box appears on the page from a `.tsx` file | JSX, `ReactDOM.createRoot`, function components |
| 02 | Breaking the UI Into Pieces | The same box, now visibly built from `Header`, `Calculator`, `Display`, `Keypad` | Composition, single-responsibility components |
| 03 | Props: Making Button Reusable | Ten differently-labelled buttons from one `Button` component | `interface` props, reusability |
| 04 | Rendering the Keypad From Data | The same ten buttons, generated from an array instead of typed ten times | `.map()`, the `key` prop |
| 05 | State: Giving the Display a Memory | The display holds a real value that can change | `useState` |
| 06 | Events: Wiring Up the Buttons | Clicking `7` then `8` shows `78` | `onClick`, immutable state updates |
| 07 | Lifting State Up | `Display` and `Keypad` are siblings, and it still works | Lifting state, single source of truth |
| 08 | Where Should Math Live? | A `engine/tokenizer.ts` file exists with zero React in it | Separation of concerns, module boundaries without real `import` |
| 09 | Wiring the Operator Buttons | `+`, `-`, `×`, `÷` compute something, left to right | Calling engine functions from event handlers |
| 10 | Why Doesn't 2+3×4 Equal 20? | Typing `2+3×4=` shows the wrong answer, live, on your own screen | The precedence bug, motivating real parsing |
| 11 | Tokenizing an Expression | A hidden debug line shows `"2+3*4"` broken into real tokens | Lexing, a `Token` discriminated union |
| 12 | Parsing With Precedence | The same debug line shows a correctly-shaped tree, `*` nested under `+` | Recursive descent, `Expression → Addition → Multiplication → Unary → Primary` |
| 13 | Evaluating the Tree | `2+3×4=` finally shows `14` | Recursive evaluation, `Result`-style errors, division by zero |
| 14 | Real Buttons, Real Precedence | Parentheses, percent, and sign-change all work correctly | Wiring a finished engine to a finished UI |
| 15 | Conditional Rendering: Scientific Mode | A toggle button shows or hides a whole second row of buttons | `&&`, ternaries, conditional JSX |
| 16 | Trig Functions and the Angle Mode Bug | `sin(30)` gives the wrong answer until you fix the mode | Degrees vs. radians, a second live bug |
| 17 | Context: AngleModeContext | Every button that needs the angle mode gets it without being passed it directly | `createContext`, `useContext`, avoiding prop-drilling |
| 18 | Outgrowing useState: A Reducer | Every button press becomes one named action instead of a scattered `if` chain | `useReducer`, action objects as discriminated unions |
| 19 | Memory Buttons via the Reducer | MS, MR, MC, M+, M- all work | Extending a reducer, one memory slot |
| 20 | Custom Hooks: useMemory() | The same memory behaviour, now reusable in one line | Extracting a custom hook |
| 21 | Forms: A Formula Editor | A real form to name and save a formula | Controlled inputs, `onSubmit`, `preventDefault` |
| 22 | Lists, Editing, Deleting | Saved formulas can be edited or removed | Immutable CRUD over an array |
| 23 | Persisting Formulas | Reload the page — every saved formula survives | `useEffect`, `localStorage`, dependency arrays |
| 24 | Expression History | Every calculation appears in a running history list | Rendering an ever-growing list |
| 25 | Memoization: useMemo | A deliberately slow formula stops recomputing on every keystroke | `useMemo`, recomputation cost |
| 26 | React.memo: Stopping Unnecessary Renders | React DevTools shows buttons no longer re-render on every keystroke | `React.memo`, the render-cause problem |
| 27 | Error Boundaries | A broken formula shows a message instead of a blank white screen | Class-based error boundaries, the one place React 18 still needs a class |
| 28 | Tabs Without a Router | Basic / Scientific / Settings become real, separate views | Composition, a tiny `useHashRoute()` hook, connected to the real router this whole app runs on |
| 29 | Settings: Theme, Precision, Angle Mode | A settings panel controls how every screen looks and rounds | Context revisited, the IEEE-754 float bug |
| 30 | Refactoring & Architecture Review | The same calculator, audited file by file | No new feature — a capstone single-responsibility pass |

## Definition of Done (whole project)

- Basic arithmetic respects operator precedence and parentheses, verified against the actual math, not just "looks right"
- Scientific functions work correctly in both degree and radian mode
- Memory (MS/MR/MC/M+/M-) behaves exactly like a physical calculator's memory
- Formulas can be created, edited, deleted, and survive a page reload
- Every past calculation appears in history and can be reused with one click
- Theme, precision, and angle mode are all controlled from one settings panel and actually take effect everywhere
- A broken formula never produces a blank white screen
- You can point to the exact file boundary between "this is React" and "this is math," and explain why that boundary exists
