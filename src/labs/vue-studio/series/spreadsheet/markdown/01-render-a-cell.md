# Vue Spreadsheet — Lesson 01 — The Grid: Your First Vue Component

## What you will build

A 6×10 grid: column headers `A` through `F` across the top, row numbers `1` through
`10` down the left side, and sixty empty, individually addressable cells between them —
the visible skeleton every later lesson fills in, until it is a real spreadsheet with
formulas, formatting, multiple sheets, undo/redo, and a plugin system.

```
    A     B     C     D     E     F
1 |     |     |     |     |     |     |
2 |     |     |     |     |     |     |
3 |     |     |     |     |     |     |
  ...
```

This lesson is entirely about the grid's structure. No interaction. No reactive state.
Just sixty cells, generated from two numbers by code that could scale to six hundred
without a single extra line of markup.

**A real term for what you're about to build:** this grid is this project's **MVP** —
**Minimum Viable Product** — the smallest version of the idea that is genuinely real
and runnable, not a mockup or a sketch. It is also what's called a **vertical slice**:
a complete path from input to visible output, however thin, rather than one
horizontal layer (all the data handling, say) built in isolation with nothing to look
at. Real software teams working in an **Agile** way — the dominant way professional
software gets built today — deliberately choose to ship the thinnest possible working
version first and grow it, specifically so there is always something real to look at,
test, and get feedback on. Every lesson in this series is structured as one vertical
slice; this is not a teaching gimmick borrowed from nowhere — it is the same reasoning
a real product team applies to a two-week sprint.

If you have never written a line of code before, this is the right place to start. This
lesson assumes nothing — not a prior lesson in this app, not another language, not
"some HTML I picked up once." Every term is defined the moment it is used. It will feel
slower than a tutorial aimed at people who already program, because it is teaching two
things at once: how to build *this*, and how to think about software in general. Both
are the point.

---

## What you need to know first

Nothing. Zero prior lessons, zero prior programming experience.

This series is a case study, not a syllabus: the topic is *how software like a
spreadsheet is actually built*, and the spreadsheet you build alongside it is the
proof that you understood each idea, not just a nice thing to have at the end. By the
end of this series you will have built formulas, a dependency graph, undo/redo, and a
plugin system — a real front-end engineering skill set — because a real spreadsheet
genuinely needs all of that, not because a checklist said so.

**The tool you're using — Vue Studio:** the screen you're looking at right now has
three working areas. On the left is this lesson. In the middle is a code editor —
specifically **Monaco**, the same editor engine that powers Visual Studio Code, giving
you syntax highlighting and inline error checking as you type. On the right is a
**live preview**: whatever your code produces, rendered exactly as a browser would
render it. Above the editor is a **▶ Run** button.

There is no terminal, no install step, no build command. In a real project — which you
will eventually set up, in this series' final arc — getting code from a text file to a
running page on screen takes several tools working together. Vue Studio does all of
that invisibly so this lesson can focus on one thing at a time. Nothing is hidden
forever; it is deferred until there is a reason to open it up.

---

## Step 1 — What "running code" actually means

**The problem:** Before building anything, you need to know what happens when you
press ▶ Run, and what a "component" even is. Everything else in this lesson stands on
that.

**What a component is:** a Vue **component** is a reusable, self-contained piece of
user interface — it bundles the logic needed to produce something together with the
exact markup that displays it, as one named unit. A `.vue` file defines exactly one
component. A real spreadsheet app ends up built from many components nested inside
each other — a cell could be a component, a row could be a component, the whole grid
could be a component — but right now, before any of that splitting happens, this
project has exactly one component: the file you're about to type into, informally
called `App.vue` because it's the single top-level component every Vue project starts
from.

Type this into the editor — you can select all the placeholder text and replace it —
and click ▶ Run:

```vue
<script setup lang="ts">
const message = 'Spreadsheet project — lesson 01'
const count = 42
</script>

<template>
  <div>
    <h2>{{ message }}</h2>
    <p>The answer is {{ count }}</p>
  </div>
</template>
```

You should see a heading and a paragraph appear in the preview panel. Discard this —
you will replace it in the next step — but do not skip past what just happened, because
every later step in this lesson is a variation on it.

**Walkthrough — what you just wrote, piece by piece:**

The file you typed is called a **Single File Component**, or **SFC** — a `.vue` file.
Vue components have up to three parts, and each part has exactly one job:

- **`<script setup lang="ts">...</script>`** — the *logic*. Anything the component
  needs to compute, store, or decide lives here.
- **`<template>...</template>`** — the *structure*. What actually appears on screen,
  described declaratively (more on that word in Step 5).
- **`<style>...</style>`** — the *appearance*. Not used yet in this file, but it will
  be by Step 5.

This three-way split is a form of **separation of concerns** — a software engineering
principle that says a system is easier to understand, change, and debug when each part
has one clearly bounded job, rather than one part doing everything. You will see this
principle again throughout this series, every time a new file is created: the question
"why does this live in its own file?" almost always has the same answer — "because it
has a different job than the code around it."

One naming note, since `setup` looks like an ordinary English word rather than a
technical one: it isn't a vague description. `setup` is Vue's specific term for the
function that runs once, when the component is first created, to prepare everything
the template will need. `<script setup>` is shorthand — Vue's compiler expands it into
a real `setup()` function behind the scenes. You never write that expansion by hand —
`<script setup>` is the standard, modern way to write it — but the name names a real,
specific concept in Vue's component model, not a generic phrase.

**Walkthrough — the order this file actually runs in:**

```
Click ▶ Run
     ↓
<script setup> runs, top to bottom — every const and function
     is created, in the order it's written
     ↓
<template> renders — it can now use every name that
     <script setup> created, because <script setup> already finished running
     ↓
Vue builds real DOM nodes from that render
     ↓
The browser displays them in the preview panel
```

This order is why `<template>` is allowed to use `message` at all: `<script setup>`
runs first and creates it before the template ever needs it. The two blocks are not
executed in the order they happen to appear on the page — only the lines *inside*
`<script setup>` run top to bottom. Keep this sequence in mind every time something in
a template seems to "just know about" a variable from the script block: it knows
because the script already ran by the time the template needs it.

**Walkthrough — `const message = 'Spreadsheet project — lesson 01'`:**

This is a **variable declaration**. Two separate things happen in this one line, and
they're worth pulling apart: **declaring** a variable means creating the name itself —
telling the compiler "this name now exists." **Assigning** means giving that name a
value. `const message = '...'` does both at once — it declares `message` and assigns
it a value in the same instruction. Later lessons will show code that declares a
variable on one line and assigns its value separately, on a later line — a distinction
that only matters once you've seen a case where they're not the same line.

`const` is a keyword — a reserved word with a fixed
meaning to the language — that creates a name (`message`) and permanently binds it to a
value (the text `'Spreadsheet project — lesson 01'`). "Permanently" is the important
part of `const`: once a `const` variable is assigned, that specific binding can never
be reassigned to something else. Try to write `message = 'something else'` on a second
line and TypeScript rejects it before you even click ▶ Run — the editor underlines it
red. (JavaScript also has `let`, for values that are allowed to change after creation.
You have not needed a `let` yet — the moment this series needs one, it will be
introduced there, not before.)

The text between the quotes, `'Spreadsheet project — lesson 01'`, is a **string** — one
of JavaScript's handful of primitive data types, used for any sequence of text. `42` in
the next line is a **number** — another primitive type, used for anything you'd do
arithmetic with. TypeScript, the language you're writing (more on that below), knows
`message` holds a string and `count` holds a number the instant you write them, without
you writing the word "string" or "number" anywhere — this is called **type inference**,
and it means TypeScript only requires you to spell out a type when it cannot work one
out on its own.

**Walkthrough — `{{ message }}`:**

Inside `<template>`, double curly braces are **interpolation**: "evaluate this
JavaScript expression and print the result as text, right here." An **expression** is
any piece of code that reduces to a single value — `message`, `2 + 2`, and
`columnLetter(0)` (written properly in Step 3) are all expressions. This is different
from a **statement**, which is a complete instruction that *does* something rather than
producing a value — `const message = 'text'` is a statement: it declares and assigns,
but it doesn't itself reduce to a value you could print. `{{ }}` only ever accepts a
single expression, because its whole job is "produce one value, then display it" — you
cannot put a full statement, an `if`, or multiple lines inside `{{ }}`.

`{{ message }}` looks up the `message` variable from the `<script setup>` block above
and inserts its current value into the page. This is Vue template syntax — it does not
exist in plain HTML, and it does not exist in plain JavaScript. It exists specifically
to connect a component's logic to what it displays.

**This is also why `<template>` is not HTML, even though it looks like it.** The
browser never receives the literal text `<h2>{{ message }}</h2>` and tries to make
sense of `{{ message }}` on its own — that would be meaningless to a browser. Vue's
compiler reads your entire `<template>` block first and turns it into a plain
JavaScript function that builds real DOM nodes with the real text already filled in.
Only the *output* of that function — an ordinary `<h2>` element that already contains
the words `Spreadsheet project — lesson 01` — ever reaches the browser. What you write
is Vue template syntax; what the browser sees is plain HTML with no trace of `{{ }}`
left in it anywhere.

**Walkthrough — HTML tags, elements, and nesting:**

`<div>`, `<h2>`, and `<p>` are **HTML elements**. HTML (HyperText Markup Language) is
the language browsers use to describe the structure of a page — headings, paragraphs,
tables, buttons, and so on. Every element is written as an opening **tag** (`<h2>`) and
a matching closing tag (`</h2>`), with content in between. `<h2>` means "a second-level
heading" — bold, prominent text, used for section titles. `<p>` means "a paragraph" —
regular body text. `<div>` means "a generic container" — it carries no meaning of its
own; it exists purely to group other elements together, the way a folder groups files
without saying anything about what's inside them.

Elements can contain other elements. Here, `<div>` contains both `<h2>` and `<p>`. This
nesting is not just visual indentation — it is a real data structure. The browser reads
your HTML and builds it into a tree in memory, where `<div>` is the parent node and
`<h2>` and `<p>` are its children. That in-memory tree is called the **DOM** — the
**Document Object Model**. Every element in your HTML becomes a node in this tree. When
your code changes what should appear on screen, it is really asking the browser to
change nodes in this tree; the browser repaints the screen to match. These nodes live
only in the browser's memory for as long as the page stays open — nothing about them
is written to a file anywhere; the browser itself creates them, owns them, and
discards them when the page closes. You cannot see the
DOM directly in the preview panel, but every browser has a tool for it — in a real
browser, right-click any webpage and choose "Inspect" to see this exact tree for that
page.

*Recognized elsewhere:* a tree of nested containers, each one able to contain more of
itself, is one of the most common shapes in computing — not just the DOM. Your
computer's file system is a tree (folders containing folders containing files). This
lesson's own JSON-like data later on is a tree. A parser later in this series will
build a tree out of a spreadsheet formula. The DOM is your first encounter with the
idea; it will not be the last.

**Walkthrough — what ▶ Run actually does:**

Vue Studio takes the text you typed, runs it through two tools, and shows you the
result:

1. The **TypeScript compiler** reads the `<script setup lang="ts">` block and checks
   every line against TypeScript's type rules — this is what makes mistakes appear as
   red underlines in the editor before you even click Run.
2. Vue's **template compiler** reads the `<template>` block and turns it into a plain
   JavaScript function that knows how to build (and later, update) the corresponding
   part of the DOM.

The result — plain, standard JavaScript — is handed to the browser inside the preview
panel, which runs it and builds the DOM tree described above. You never see these
intermediate steps; you only see the rendered output. In a real project (again: the
final arc of this series), a build tool called Vite does this same compiling; here,
Vue Studio does it for you so the lesson can stay focused on Vue and TypeScript, not on
build tooling.

**What `lang="ts"` does:** without it, `<script setup>` is treated as plain
JavaScript — no type checking. TypeScript is a superset of JavaScript: it adds type
checking on top of the exact same language, then compiles down to ordinary JavaScript
for the browser to run. `lang="ts"` turns that checking on. It is not a Vue Studio
feature — it is the same attribute you'd write in any real Vue 3 project.

---

## Step 2 — Define the coordinate type

**The problem:** The grid will have sixty cells. Each one needs to be addressed by its
column and row. Before anything can compute a cell's position, something has to
describe what "a position" *is*.

Replace the entire file with:

```vue
<script setup lang="ts">
const COLUMN_COUNT = 6
const ROW_COUNT = 10

interface Coordinate {
  col: number
  row: number
}
</script>

<template>
  <p>Coordinate type defined. Nothing visible yet.</p>
</template>
```

Click ▶ Run. The message appears. Dull output — important foundation.

**What an object is, before the interface that describes one:**

`interface Coordinate` is about to describe the shape of something called an
**object**. An object is a collection of named values grouped together under one
variable — written with curly braces, each named value (called a **field**, or a
**property**) separated by a comma:

```typescript
const point = { col: 2, row: 4 }
```

`point` is one variable holding two named values at once: `col` is `2`, `row` is `4`.
You read a field back out with a dot — `point.col` — the same **dot notation** you'll
see again shortly as `coordinate.col`. An object is how you group values that only
mean something *together* — a column number on its own, or a row number on its own,
is not a position; the pair is. Keeping them in two separate, unrelated variables would
lose that connection. `interface Coordinate` is not the object itself — it is a
description, checked by the compiler, of what fields an object must have to count as
one.

**Walkthrough — `interface Coordinate { col: number; row: number }`:**

`interface` is a TypeScript-only keyword — it has no equivalent in plain JavaScript,
because plain JavaScript has no concept of checking a value's shape before the program
runs. An interface does not create an object, and it produces no code that runs in the
browser at all. It describes the *shape* a value must have to be considered a
`Coordinate`: an object with a `col` field holding a number, and a `row` field holding
a number. Nothing more, nothing less. The TypeScript compiler reads this description
once and then uses it to check every place a `Coordinate` is expected — purely at
compile time, before ▶ Run, with zero runtime cost.

```
You type interface Coordinate { col: number; row: number }
     ↓
TypeScript compiler reads it, checks every place a Coordinate
     is used against this shape
     ↓
Compiler deletes the interface entirely — it produces zero
     JavaScript output
     ↓
Plain JavaScript, with no trace of Coordinate left anywhere
     in it, is what actually runs in the browser
```

This is the general shape of **compile time** versus **runtime** you'll see throughout
this series: compile time is everything that happens *before* your code runs —
checking, transforming, sometimes deleting code entirely, exactly like the interface
here. Runtime is everything that happens *while* your code is actually executing in
the browser. A TypeScript-only construct like `interface` exists only at compile time;
by runtime it is gone without a trace, which is exactly why it costs nothing to run.

To see what that buys you, run this throwaway example instead of the code above (this
example exists only to demonstrate the point — you will discard it and never see it
again in this project):

```vue
<script setup lang="ts">
interface Coordinate {
  col: number
  row: number
}

// This is fine — the shape matches
const a: Coordinate = { col: 2, row: 4 }

// TypeScript catches each of these before ▶ Run:
// const b: Coordinate = { col: 2 }            // missing row
// const c: Coordinate = { col: 'A', row: 1 }  // col should be number, not string
// const d: Coordinate = { column: 2, row: 1 } // wrong field name

console.log(a.col, a.row)
</script>

<template>
  <p>{{ a }}</p>
</template>
```

Uncomment each broken declaration one at a time (delete the `//` at the start of the
line). Monaco underlines the mistake before you click ▶ Run. TypeScript is not
guessing — it is applying the exact contract `interface Coordinate` stated. This lab is
now finished — the point has been made, and `Coordinate` as a disposable example will
not appear again. The `Coordinate` you keep, from here on, is the one used inside the
real project below.

**The CS concept — named shapes.**

Without `interface Coordinate`, you could still write `{ col: 2, row: 4 }` directly.
The problem shows up in function signatures — a function's declared list of parameters
and what it returns. Compare:

```typescript
// Before: what does this function expect? You have to read the whole type every time.
function doSomething(pos: { col: number; row: number }): string { ... }

// After: the name carries meaning
function doSomething(pos: Coordinate): string { ... }
```

Both enforce the exact same structure. The named-interface version communicates
intent — "`pos` is a coordinate" — and lets every function across this entire project
share one name instead of repeating `{ col: number; row: number }` everywhere it's
needed. This is the same idea as naming a well-understood shape in mathematics ("a
right triangle" instead of "a triangle with one 90° angle") — a name is a shortcut for
a shape everyone has agreed on.

**Walkthrough — `type CellId = string`:**

Add this line after the interface:

```typescript
type CellId = string
```

`type CellId = string` creates an **alias** — a second name for an existing type.
`CellId` and `string` are completely interchangeable to the TypeScript compiler; this
adds no new restriction at all. Its entire value is to a *reader*: a function that says
`): CellId` communicates "this returns a cell's identifying string" more precisely than
`): string`, even though the compiler treats them identically. Like `interface`, `type`
is compile-time-only: by the time this code runs in the browser, every `CellId` in the
file has been silently replaced by the compiler with the word `string`. There is no
`CellId` anywhere in the JavaScript that actually executes.

This project's convention, from here forward: `interface` for shapes with multiple
named fields; `type` for aliases, and — starting in Lesson 04 — for unions (a type that
can be one of several alternatives, introduced when it's first needed).

---

## Step 3 — Two pure functions

**The problem:** Knowing a cell is at `{ col: 2, row: 0 }` is useless if nothing can
turn that into the string `"C1"` the grid needs for display and identity.

**What a function is, first:** a **function** is a named, reusable block of code that
takes zero or more inputs — called **parameters** — and can hand back a result, called
its **return value**. You define a function once; you can then *call* it — run it —
as many times as you want, with different inputs each time, without rewriting its body.
This is the single biggest tool programming has for avoiding repetition: instead of
writing "convert column 0 to a letter" as one block of code and "convert column 5 to a
letter" as a near-identical second block, you write the conversion once, as a function,
and call it with `0` and then with `5`.

Add to `<script setup>`, below the `type CellId = string` line:

```typescript
function columnLetter(col: number): string {
  return String.fromCharCode(65 + col)
}

function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`
}
```

**Before reading the walkthrough, run this to see what they produce:**

```vue
<script setup lang="ts">
interface Coordinate { col: number; row: number }
type CellId = string

function columnLetter(col: number): string {
  return String.fromCharCode(65 + col)
}
function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`
}

// Try it
const examples = [
  columnLetter(0),  // 'A'
  columnLetter(1),  // 'B'
  columnLetter(5),  // 'F'
  cellId({ col: 0, row: 0 }),  // 'A1'
  cellId({ col: 2, row: 3 }),  // 'C4'
  cellId({ col: 5, row: 9 }),  // 'F10'
]
</script>

<template>
  <ul>
    <li v-for="(ex, i) in examples" :key="i">{{ ex }}</li>
  </ul>
</template>
```

Click ▶ Run. You should see: `A`, `B`, `F`, `A1`, `C4`, `F10`. Discard and continue —
`v-for` and `:key` appear here early only so you can see the output; both are explained
properly in Step 5, the first time they're used for real.

**Walkthrough — `function columnLetter(col: number): string { ... }`, piece by piece:**

- `function columnLetter(...)` — declares a function named `columnLetter`.
- `col: number` — its one **parameter**, named `col`, and a type annotation stating it
  must be a number. (Vocabulary note — these two words get used interchangeably in
  casual conversation but mean different things here: a **parameter** is the name
  written in the function's own definition, like `col` above. An **argument** is the
  actual value handed over at the moment the function is *called* — in
  `columnLetter(0)`, `0` is the argument. `col` is a placeholder; a different argument
  fills it in on every call.) TypeScript rejects any call that passes something else —
  `columnLetter('B')` is caught as a type error before ▶ Run, not discovered later as a
  wrong result.
- `: string` after the closing parenthesis — the **return type**. It states what the
  function hands back. If the function body tried to `return 5` instead, TypeScript
  would catch that mismatch inside the function itself, at the point of the mistake.
- `{ return ... }` — the function's **body**: the code that runs each time the function
  is called. `return` immediately ends the function and hands the value that follows
  back to whoever called it.

Parameter types and a return type together form a **contract**, checked by the
compiler on both sides: callers cannot pass the wrong thing in, and the function cannot
hand the wrong thing back out.

**Walkthrough — `String.fromCharCode(65 + col)`:**

Every character a computer can display has a numeric code behind it (this project will
only ever need a handful of them). `65` is the code for the capital letter `'A'`.
`String.fromCharCode` is a built-in JavaScript function — **built-in** means it ships
as part of the language itself; you didn't write it and don't need to define it, it's
simply always available. (`String` here is not a variable holding a value the way
`message` was — it's JavaScript's built-in `String` namespace, a home for
string-related functions; `fromCharCode` is one function living inside it, reached
with the same dot notation `coordinate.row` uses to reach a field.) It
accepts a number and returns the one character at that
code. `String.fromCharCode(65)` returns `'A'`. `String.fromCharCode(66)` returns
`'B'`. Adding `col` shifts that many positions forward through the alphabet: column
`0` → `'A'`, column `1` → `'B'`, column `5` → `'F'`. No array of letters to maintain by
hand — the alphabet's own ordering does the work.

Verify it with another throwaway:

```vue
<script setup lang="ts">
// Character codes around 'A'
const codes = [64, 65, 66, 67, 90, 91].map(n => ({
  code: n,
  char: String.fromCharCode(n)
}))
</script>
<template>
  <ul>
    <li v-for="c in codes" :key="c.code">{{ c.code }} → "{{ c.char }}"</li>
  </ul>
</template>
```

`64` is `@`, `65` is `A`, `90` is `Z`, `91` is `[` — the letters occupy consecutive
codes between those two boundaries.

**Walkthrough — `.map(...)`, a second array method alongside `Array.from`:**

`someArray.map(transformFn)` is a built-in array method that calls `transformFn`
once for every item already in `someArray`, and returns a *new* array made of
whatever each call returned — the original array is never changed. It's closely
related to `Array.from`'s second argument from Step 4, and deliberately similar on
purpose: both call a function once per position and collect the results, but `.map`
starts from an array that already has values (`[64, 65, 66, 67, 90, 91]`), while
`Array.from`'s second argument builds values from nothing but a length. Here, `.map`
transforms each raw number `n` into a small object pairing it with the character it
represents — the arrow function `n => ({ code: n, char: String.fromCharCode(n) })`
returns one new object per input number.

**Walkthrough — `coordinate.row + 1`:**

`coordinate.row` reads the `row` field off a `Coordinate` object using **dot
notation** — `object.fieldName` — the standard way to read a named field out of an
object in JavaScript. Spreadsheet rows are traditionally shown starting at `1` (row
"1", not row "0"). This project's internal `row` field, like array positions in
general, starts counting at `0`. The `+ 1` is the entire translation between the two:
the cell at `{ col: 0, row: 0 }` displays as `"A1"`, never `"A0"`. If you ever see a
cell labeled row `0` anywhere in this project, that `+ 1` has gone missing somewhere.

**Walkthrough — template literals, the backtick string:**

```typescript
`${columnLetter(coordinate.col)}${coordinate.row + 1}`
```

Backticks (`` ` ``) create a **template literal** — a string that can embed
JavaScript expressions directly using `${...}`. Everything inside `${...}` is
evaluated as code, converted to text, and spliced into the surrounding string. This is
the same idea as `{{ }}` in a Vue template (evaluate an expression, insert the result
as text), but `${}` works inside any JavaScript string, anywhere — not just inside a
`<template>` block. `` `${columnLetter(coordinate.col)}${coordinate.row + 1}` `` with
`coordinate = { col: 2, row: 3 }` evaluates `columnLetter(2)` to `'C'`, evaluates
`3 + 1` to `4`, and produces the string `'C4'`.

**Execution trace — calling `cellId({ col: 2, row: 3 })` from scratch:**

`cellId` calls `columnLetter`, which calls `String.fromCharCode` — three functions
deep. A prose description of what they "do together" is not enough to actually follow
this; here is every step, in order, with real values:

```
cellId({ col: 2, row: 3 }) is called
     ↓
coordinate is bound to { col: 2, row: 3 } for the life of this call
     ↓
columnLetter(coordinate.col) runs → columnLetter(2)
     ↓
   inside columnLetter: col is bound to 2
     ↓
   String.fromCharCode(65 + 2) runs → String.fromCharCode(67)
     ↓
   returns 'C'
     ↓
columnLetter(2) returns 'C'
     ↓
coordinate.row + 1 evaluates → 3 + 1 → 4
     ↓
template literal assembles: 'C' + 4 → 'C4'
     ↓
cellId returns 'C4'
```

Every arrow here is a real, mechanical step — nothing is skipped or implied. This is
what "running" a function actually means: a sequence of small, deterministic steps,
each one producing exactly the input the next step needs. Being able to trace code this
way by hand, without running it, is one of the most useful skills in this entire
series — it is also exactly what the TypeScript compiler and the browser's JavaScript
engine are doing, just far faster than a person can.

**Walkthrough — pure functions.**

`columnLetter` and `cellId` are **pure functions**: given the same input, they always
produce the same output, and calling them changes nothing outside themselves — no
stored state changes, no random values, no current time, no network request, nothing
written to the page as a side effect. `cellId({ col: 2, row: 3 })` always returns
`"C4"`. Not "usually." Not "unless something else happened first." Always. That
predictability is what makes a pure function easy to reason about and to test: you can
compute what it returns just by reading it, without running the whole program.

*Recognized elsewhere:* pure functions are not a Vue idea or even a frontend idea — it
is one of the oldest and most load-bearing concepts in all of programming.
Mathematical functions (`sin`, `sqrt`) are pure by definition. Spreadsheet formulas
themselves are pure — `=SUM(A1:A4)` always produces the same result for the same
inputs, which is exactly why Excel and Google Sheets can safely cache a formula's
result and only recompute it when an input changes (this project's own dependency
graph, built later in this series, depends on that same fact). Database query
functions, cryptographic hash functions, and React's and Vue's own rendering functions
all lean on purity for the same reason: predictable input-to-output behavior is what
lets a system skip recomputation safely, and what lets a test simply call a function
and assert on what comes back.

**SE concept — the single-definition rule:**

Every lesson from here forward that needs a cell's address calls `cellId()`. Every
lesson that needs a column letter calls `columnLetter()`. Define each idea exactly
once; call it everywhere it's needed. If the grid grows from six columns to twenty-six,
`columnLetter` does not change and none of its callers change — only `COLUMN_COUNT`
changes. This is not an accident; it is what defining a function buys a project: the
logic that matters lives in exactly one place.

---

## Step 4 — Generate the grid data

**The problem:** The grid needs sixty cells. The template will need to repeat markup
once per cell, and repeating markup in Vue requires something to repeat *over* — an
**array**: an ordered list of values, written with square brackets, like
`[10, 20, 30]`.

A quick, throwaway example of what an array actually offers, before writing the real
one — run this if you want to see it:

```vue
<script setup lang="ts">
const numbers = [10, 20, 30]

const first = numbers[0]        // 10 — arrays count positions from 0, not 1
const second = numbers[1]       // 20
const howMany = numbers.length  // 3 — how many values the array holds
</script>
<template>
  <p>first: {{ first }}, second: {{ second }}, count: {{ howMany }}</p>
</template>
```

`numbers[0]` reads the value at **position** (also called **index**) `0` — the first
slot, because array positions start counting at `0`, the same reason `col` and `row`
start at `0` for this project's cells. `numbers.length` is a built-in property every
array carries, holding how many values it contains. Discard this example — the real
arrays this project needs are `columns` and `rows`, built next.

Add to `<script setup>`, below the two functions:

```typescript
const columns = Array.from({ length: COLUMN_COUNT }, (_, col) => col)
const rows    = Array.from({ length: ROW_COUNT },    (_, row) => row)
```

**Walkthrough — `Array.from({ length: N }, (_, i) => i)`:**

`Array.from(arrayLike, mapFn)` is a built-in JavaScript function that builds a new
array from anything with a `.length` property, calling `mapFn` once per position to
decide what goes there. `{ length: 6 }` is the smallest legal input for this — a plain
object claiming to have six positions, with no actual elements inside it yet.

The second argument, `(_, col) => col`, is an **arrow function** — a compact way to
write a small function. `(_, col) => col` is shorthand for
`function(_, col) { return col }`: the part before `=>` is the parameter list, the
part after `=>` is what gets returned. Arrow functions are used for short functions
that don't need a name of their own, especially ones passed directly as an argument to
another function, the way this one is passed to `Array.from`. It has no name here
because it doesn't need one — it's created once, used exactly once (by `Array.from`,
immediately), and never called again by name from anywhere else in the file. Giving it
a name like `function mapIndexToValue(...)` would add a label nothing ever refers to.

`Array.from`'s map function always receives two arguments: the current value at that
position (which doesn't exist yet, so it's always `undefined`) and the index. The
underscore `_` as a parameter name is a convention — not a rule the language
enforces — that signals "this parameter is required by the function's position but is
intentionally unused here." Returning `col` (the index) fills the array with
`[0, 1, 2, 3, 4, 5]`.

**Execution trace — `Array.from({ length: 6 }, (_, i) => i)`, position by position:**

```
position 0: mapFn(undefined, 0) called → returns 0
position 1: mapFn(undefined, 1) called → returns 1
position 2: mapFn(undefined, 2) called → returns 2
position 3: mapFn(undefined, 3) called → returns 3
position 4: mapFn(undefined, 4) called → returns 4
position 5: mapFn(undefined, 5) called → returns 5
     ↓
result: [0, 1, 2, 3, 4, 5]
```

`Array.from` calls your arrow function once per position, in order, and collects every
return value into the new array. Nothing here is magic — it's a loop, running inside
`Array.from`'s own built-in code, calling the function you handed it, exactly the way
you would call it yourself.

Run this throwaway to see it directly:

```vue
<script setup lang="ts">
const columns = Array.from({ length: 6 }, (_, i) => i)
const rows    = Array.from({ length: 4 }, (_, i) => i)

// columns = [0, 1, 2, 3, 4, 5]
// rows    = [0, 1, 2, 3]
</script>
<template>
  <p>columns: {{ columns }}</p>
  <p>rows: {{ rows }}</p>
</template>
```

**Why not just write `[0, 1, 2, 3, 4, 5]` directly?**

Because `COLUMN_COUNT` should control everything downstream of it. Change
`COLUMN_COUNT` to `26` and `columns` becomes `[0, 1, ..., 25]` — a full alphabet —
without touching anything else in the file. A hand-written array
`[0, 1, 2, 3, 4, 5]` would need manual editing every time, and could silently drift out
of sync with `COLUMN_COUNT` if someone forgot.

---

## Step 5 — Render the grid

**The problem:** `columns` and `rows` now exist as data, but nothing on screen displays
them yet.

Replace the entire file with:

```vue
<script setup lang="ts">
const COLUMN_COUNT = 6
const ROW_COUNT = 10

interface Coordinate {
  col: number
  row: number
}

type CellId = string

function columnLetter(col: number): string {
  return String.fromCharCode(65 + col)
}

function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`
}

const columns = Array.from({ length: COLUMN_COUNT }, (_, col) => col)
const rows    = Array.from({ length: ROW_COUNT },    (_, row) => row)
</script>

<template>
  <table class="spreadsheet">
    <thead>
      <tr>
        <th></th>
        <th v-for="col in columns" :key="col">{{ columnLetter(col) }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row">
        <th>{{ row + 1 }}</th>
        <td
          v-for="col in columns"
          :key="col"
          :id="'cell-' + cellId({ col, row })"
          class="cell"
        ></td>
      </tr>
    </tbody>
  </table>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; padding: 1rem; }

.spreadsheet { border-collapse: collapse; }
.spreadsheet th,
.spreadsheet td {
  border: 1px solid #cbd5e1;
  min-width: 90px;
  height: 28px;
  text-align: left;
  padding: 0 6px;
  font-size: 0.875rem;
}
.spreadsheet thead th,
.spreadsheet tbody th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  text-align: center;
}
</style>
```

Click ▶ Run. A full grid appears: column letters `A` through `F` along the top, row
numbers `1` through `10` down the left, and sixty empty bordered cells.

**Walkthrough — the HTML table elements:**

`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` are HTML's dedicated
elements for tabular data — a grid of rows and columns is such a common shape that
HTML has built-in vocabulary for it, rather than requiring you to fake a grid out of
generic `<div>`s:

- `<table>` — the whole grid.
- `<thead>` — the header section (here: the row of column letters).
- `<tbody>` — the body section (here: the sixty data rows).
- `<tr>` — one table row, in either section.
- `<th>` — a **header** cell — a label, like a column letter or row number. Browsers
  bold and center it by default.
- `<td>` — a **data** cell — one of the sixty actual spreadsheet cells.

This is the correct, semantic choice for a spreadsheet specifically because a
spreadsheet *is* the thing `<table>` was designed to represent — rows, columns, headers,
data. (Later series in this app, and later arcs of this one, use `<div>`-based grids
for things that only *look* like a grid but aren't really tabular data — a distinction
worth remembering.)

**Walkthrough — attributes, and `class`:**

`class="spreadsheet"` is an **attribute** — extra information attached to a tag,
written as `name="value"` inside the opening tag. `class` is one specific,
very common attribute: it assigns one or more names to an element so that CSS (in the
`<style>` block) or JavaScript can target it. `.spreadsheet { border-collapse: collapse }`
in the `<style>` block below reads "for every element with `class="spreadsheet"`,
collapse table borders into single lines instead of doubled ones." The class name
itself carries no special meaning to the browser — `spreadsheet` here means nothing
more or less than any other name you might have chosen; its only job is to be a
matchable label.

**The Design lens — why these specific CSS values, not just "some CSS":**

Every number and color in the `<style>` block above was a decision, not a placeholder.
`border: 1px solid #cbd5e1` uses a light gray, not black — a black grid on sixty empty
cells reads as visually loud before there is any real content to look at; a light gray
is enough to communicate "these are separate cells" without competing with data that
hasn't been typed yet. `min-width: 90px` and `height: 28px` are not arbitrary either:
a spreadsheet cell needs to be wide enough to hold a plausible short value (`1,234.50`,
a person's name) without truncating, and short enough vertically that ten rows fit on
screen without scrolling — a cell sized like a paragraph of text would make the grid
feel less like a grid and more like a list. `background: #f1f5f9` on the header row
is a slightly different shade from the white cell background, not a bold color — a
header only needs to be *distinguishable at a glance*, not attention-grabbing; drawing
the eye to the header more than the data would get the priority backwards. Every one
of these is the **Design lens**: not "what CSS produces this look," but "what does
this specific choice communicate to someone looking at it, and what would a different
choice cost them."

*Recognized elsewhere:* this exact reasoning — legibility over decoration, subtle
distinction over loud contrast for structural elements — is why Excel's and Google
Sheets' own default grid lines are a pale gray, never black, and why their header row
background is a barely-there off-white rather than a saturated color. You are not
inventing spreadsheet visual conventions from scratch; you are arriving, by the same
reasoning, at decisions the entire industry already converged on.

**Walkthrough — the template structure:**

```html
<thead>
  <tr>
    <th></th>                                         <!-- empty corner cell -->
    <th v-for="col in columns" :key="col">           <!-- A B C D E F -->
      {{ columnLetter(col) }}
    </th>
  </tr>
</thead>
```

The empty `<th></th>` occupies the top-left corner — the intersection of the
column-header row and the row-number column. Without it, column `A`'s header would sit
directly above row 1's first data cell rather than above the first data column. One
placeholder `<th>` keeps everything aligned.

`v-for="col in columns"` is a Vue **directive** — a special HTML attribute, always
prefixed `v-`, that tells Vue's template compiler to generate extra behavior around
this element rather than treating it as literal markup. `v-for` means "repeat this
element once per item in the list." Here it iterates over `[0, 1, 2, 3, 4, 5]`; each
repetition, `col` is bound to one of those numbers, and `columnLetter(col)` converts it
to a letter for display.

This looks like a loop, and it behaves like one conceptually, but it is not
JavaScript's `for` loop — there is no counter you manage, no `break`, no `continue`.
`v-for` is a directive Vue's compiler reads and turns into real looping code *for* you,
behind the scenes, as part of the JavaScript render function it generates. You never
write the loop yourself; you declare what should repeat, and over what, and Vue
produces the loop.

`columnLetter(col)` here is also worth pausing on: it is a genuine function call, no
different from the ones you triggered by hand in Step 3's throwaway examples. Vue's
generated render code calls it once per column, every time this element needs to be
(re)drawn — exactly the same function, doing exactly the same thing, just invoked from
inside compiled template code instead of from a line you typed yourself.

```html
<tbody>
  <tr v-for="row in rows" :key="row">
    <th>{{ row + 1 }}</th>                            <!-- 1 2 3 ... 10 -->
    <td
      v-for="col in columns"
      :key="col"
      :id="'cell-' + cellId({ col, row })"
      class="cell"
    ></td>
  </tr>
</tbody>
```

The outer `v-for` repeats a `<tr>` once per row; the inner `v-for`, nested inside it,
repeats a `<td>` once per column, for every row. This produces `ROW_COUNT × COLUMN_COUNT`
cells — `10 × 6 = 60` — from four lines of markup.

**Walkthrough — `:id="'cell-' + cellId({ col, row })"`:**

`:id` — with a leading colon — is Vue's shorthand for **attribute binding**: "evaluate
the JavaScript expression that follows, and use its result as this attribute's value."
Without the colon, `id="cell-A1"` would set the literal, unchanging text
`cell-A1` as the id, no matter what. With the colon, `:id="'cell-' + cellId({ col, row })"`
runs actual code — string concatenation with `+`, and a call to the `cellId` function
you wrote in Step 3 — every time this element is created, and uses whatever that
code evaluates to. The colon is the signal: "what follows is an expression, not text."

One more thing worth knowing now, even though it won't matter until Lesson 02: this
expression is re-evaluated every single time Vue re-renders this cell, not just once.
For this lesson the grid is built once and never changes, so `cellId({ col, row })`
only ever runs once per cell. Starting in Lesson 02, when cells become interactive,
expressions like this one will run repeatedly, in response to user actions like a
click.

`id` itself is a plain HTML attribute, not a Vue one — it gives an element a unique
identifying name within the page, which JavaScript can later use to find that exact
element (via `document.getElementById`, a browser function used starting in Lesson
02). Every cell's id here follows the pattern `cell-` followed by its spreadsheet
address, so the cell at column 2, row 0 gets `id="cell-C1"`. This convention means any
future code that needs to find a specific cell can compute
`'cell-' + cellId(coordinate)` using the exact same `cellId()` function, rather than
maintaining a separate lookup table or a stored list of element references.

**Walkthrough — `{ col, row }` inside the loop:**

```html
<td :id="'cell-' + cellId({ col, row })">
```

Inside the inner `v-for`, both `row` (bound by the outer loop) and `col` (bound by the
inner loop) are in **scope** — meaning both names can be legally used at this exact
point in the code. A variable's **scope** is the region of code where it exists and
can be referred to; outside that region, the name means nothing at all. `row` is
created by the outer `v-for`, and its scope is everything inside that repeated `<tr>`,
including the `<td v-for>` nested inside it — that is precisely why the inner loop can
still read `row`. Each time the outer loop moves on to its next row, the previous
value of `row` is gone; a new one, scoped the same way, takes its place for that
iteration only. This is the same nesting rule JavaScript's own loops follow: an inner
block can always see variables bound by the loop wrapped around it.
`{ col, row }` is JavaScript's **shorthand property syntax** for
`{ col: col, row: row }` — when a variable's name and the field name you want are the
same, you can write the variable once instead of twice. The result is an object shaped
exactly like the `Coordinate` interface from Step 2, passed straight into `cellId()`.

**Walkthrough — `:key`:**

```html
<th v-for="col in columns" :key="col">
```

`:key` tells Vue how to tell items in a list apart. When a list changes — an item
added, removed, or reordered — Vue uses each item's key to work out which existing DOM
node corresponds to which new item, so it can update only what actually changed instead
of rebuilding the whole list.

Without `:key`, Vue falls back to matching by position: "first item stays matched to
the first DOM node, second to the second," and so on. For a grid that never changes
size, this makes no visible difference. For a list whose items are added, removed, or
reordered later, a missing key causes Vue to update the wrong DOM nodes — data can end
up attached to the wrong element on screen. The convention followed throughout this
project, starting now: always provide `:key` on `v-for`.

Here, the key is the index itself — `col` or `row` — because within its own loop each
index is unique and stable: column `0` is always column A, for the life of this grid.

**Execution trace — rendering the single cell at row 0, column 0:**

Every walkthrough above explained one piece in isolation. Here is all of it happening
together, for one concrete cell, start to finish:

```
Outer v-for: row = 0
     ↓
Inner v-for: col = 0
     ↓
{ col, row } builds the object { col: 0, row: 0 }
     ↓
cellId({ col: 0, row: 0 }) is called
     ↓
   columnLetter(0) runs → String.fromCharCode(65) → 'A'
     ↓
   0 + 1 → 1
     ↓
   template literal: 'A' + 1 → 'A1'
     ↓
cellId returns 'A1'
     ↓
'cell-' + 'A1' → 'cell-A1'
     ↓
Vue creates a <td> DOM node and sets its id attribute to 'cell-A1'
     ↓
That node is inserted into the DOM tree, inside this row's <tr>
```

This exact sequence repeats sixty times — once per combination of `row` and `col` — to
produce the full grid. Nothing about the sixtieth cell is different from the first;
the same steps run again with different starting numbers, which is the entire point of
writing this as a loop over data instead of as sixty hand-written `<td>` tags.

**CS concept — declarative vs. imperative.**

The same grid, built the way plain JavaScript would build it without Vue, looks like
this:

```typescript
for (let col = 0; col < COLUMN_COUNT; col++) {
  const headerCell = document.createElement('th')
  headerCell.textContent = columnLetter(col)
  headerRow.appendChild(headerCell)
}
```

Step by step: create an element, set its text, attach it to its parent. Four
instructions to add one header cell, repeated for every cell in the grid — and every
one of those instructions is something you, the programmer, must get right, in order,
every time the grid changes.

Vue's template is **declarative**:

```html
<th v-for="col in columns" :key="col">{{ columnLetter(col) }}</th>
```

One line states: "for each column, there should be a `<th>` showing
`columnLetter(col)`." The *how* — creating the element, setting its content, attaching
it to the DOM, and later updating it efficiently when data changes — is Vue's job, not
yours. You describe what should exist; Vue makes it exist, and keeps it that way.

Neither style is always better — declarative templates get harder to read once the
structure becomes highly conditional or deeply dynamic, and there are cases later in
this series where dropping to imperative code is the right call. But for rendering
lists and grids — repeating structure generated from data, exactly this lesson's
situation — declarative templates are shorter and far less prone to an entire class of
bugs imperative DOM code invites: forgetting to clear stale elements before re-adding,
appending in the wrong order, or losing track of which element belongs to which piece
of data.

*Recognized elsewhere:* SQL is declarative — `SELECT name FROM users WHERE age > 18`
states what you want, not the steps to fetch it. CSS is declarative — `color: red`
states a rule, not a sequence of pixel-painting instructions. React (a different
frontend framework) makes exactly this same declarative-over-imperative trade for
exactly the same reason Vue does here. Recognizing "is this describing what should
exist, or listing steps to perform" is a lens worth applying to every unfamiliar
codebase you'll ever read.

---

## What breaks without this

**Hardcoding `[0, 1, 2, 3, 4, 5]` instead of `Array.from`:** change `COLUMN_COUNT` to
`8`. The header and cell loops now attempt eight columns, but `columns` still holds
only six entries. Row cells and header cells disagree about the grid's width.
Alignment breaks. The bug is invisible in the code — it only shows up when you look at
the rendered grid and count columns. With `Array.from({ length: COLUMN_COUNT }, ...)`,
`COLUMN_COUNT` is the single source of truth, and this class of bug cannot occur.

**Removing `:key` from one of the `v-for` directives:** in development, Vue warns:
"Elements in iteration expect to have 'v-key' directives." For this static grid the
visual output is unchanged today. But Vue has lost its ability to efficiently and
correctly update this list. Add interaction in Lesson 02 and incorrect update
behavior — data appearing to "stick" to the wrong cell — can trace back to a missing
key.

**Returning `coordinate.row` instead of `coordinate.row + 1` from `cellId`:** the cell
at row 0 gets id `"cell-A0"`, while its visible row header still shows `1`. The id and
the label now disagree. Every later feature that finds a cell by id — selection
(Lesson 02), editing (Lesson 03), formula evaluation (Lessons 06–08) — would silently
target the wrong cell.

**Calling `columnLetter('A')` instead of `columnLetter(0)`:** TypeScript catches
`Argument of type 'string' is not assignable to parameter of type 'number'` before
▶ Run — this is exactly the contract from Step 2 doing its job. Without a type
annotation on the parameter, this same mistake would only surface at runtime, as
`String.fromCharCode(65 + 'A')` — JavaScript would try to add a number and a string,
produce `NaN` ("Not a Number"), and `String.fromCharCode(NaN)` would silently return an
empty string. A type annotation is what turns that silent, hard-to-trace runtime
failure into an error caught at the exact line responsible, before the program ever
runs.

---

## Connect the pieces

```
App.vue
  <script setup>
    COLUMN_COUNT, ROW_COUNT  — the two numbers the entire grid derives from
    interface Coordinate     — named shape for a grid position
    type CellId = string     — alias making function signatures readable
    columnLetter()           — pure: number → letter. String.fromCharCode.
    cellId()                 — pure: Coordinate → 'A1' style string
    columns, rows            — arrays of indices; v-for iterates these
  <template>
    <table><thead><tr>            — table structure, HTML's built-in grid vocabulary
      <th v-for="col in columns"> — header row
    <tbody>
      <tr v-for="row in rows">    — body rows
        <td v-for="col in columns" :id="'cell-' + cellId({ col, row })">
                                   — sixty individually addressable cells
  <style>
    .spreadsheet, th, td          — appearance, scoped to this grid's own class names
```

Every function, type, and variable in this file exists for exactly one reason each —
that is separation of concerns again, this time inside a single file rather than
across several: `COLUMN_COUNT`/`ROW_COUNT` control *size*, `Coordinate`/`CellId`
describe *shape*, `columnLetter`/`cellId` compute *identity*, `columns`/`rows` hold
*data*, and the `<template>` handles *display*. No piece of this file does another
piece's job.

This is also your first look at the **Single Responsibility Principle** — a software
engineering principle stating that something should have exactly one reason to change.
`columnLetter` changes only if the letter-generation rule changes. `cellId` changes
only if the id format changes. `COLUMN_COUNT` changes only if the grid's size changes.
If any single bug report or feature request could only ever point at one of these, each
of them is doing its one job correctly. This principle will come up by name again —
every time this series adds a new file or function, ask "what is the one reason this
would need to change?" If the honest answer names two unrelated reasons, that's usually
a sign the code should be split.

---

## Definition of done

**This heading is also a real term, not a phrase invented for this series.**
**Definition of Done (DoD)** is standard vocabulary from Scrum, the most widely used
Agile framework: a checklist a team agrees on *in advance*, so that "is this finished?"
has a concrete, checkable answer instead of a feeling. A real team's Definition of
Done might include "tests pass," "code reviewed," "no new accessibility failures" —
the specifics vary by team, but the discipline is identical to what's below: a list
you check yourself against, honestly, before calling something finished. Every lesson
in this series has one, for exactly the reason a real sprint task does.

Click ▶ Run and verify:

- [ ] A 6×10 grid appears with column letters `A`–`F` and row numbers `1`–`10`
- [ ] Each cell's `id` attribute follows the `cell-A1` pattern (verify by right-clicking
      a cell in the preview → Inspect, and finding it in the DOM tree that opens)
- [ ] Changing `COLUMN_COUNT = 6` to `COLUMN_COUNT = 8` adds two columns without any
      other line of code changing
- [ ] You can explain, in your own words, the difference between the `<script setup>`,
      `<template>`, and `<style>` blocks
- [ ] You can explain why `interface Coordinate` does not create an object at runtime
- [ ] You can explain the difference between `:id="..."` and `id="..."`
- [ ] You can explain why `coordinate.row + 1` appears inside `cellId` but not inside
      `v-for`'s `:key`
- [ ] You can explain what `String.fromCharCode(65 + col)` computes, and why `65`
- [ ] You can explain, without looking back at this lesson, what a pure function is and
      name one real-world spreadsheet feature that depends on functions being pure
- [ ] You can explain the difference between a parameter and an argument, using
      `columnLetter`'s definition and a specific call to it as your example
- [ ] You can explain what scope means, using `row` and `col` inside the nested
      `v-for` as your example
- [ ] You can trace, step by step, without running it, what `cellId({ col: 1, row: 0 })`
      returns
- [ ] You can explain the difference between compile time and runtime, using
      `interface Coordinate` as your example

---

*Next: Lesson 02 — Selecting a Cell. Click any cell and it highlights — the first piece
of state this project tracks, the first time a value is deliberately allowed to be
"nothing at all," and the first encounter with type narrowing.*
