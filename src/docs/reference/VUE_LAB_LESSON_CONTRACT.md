# Vue Lab Lesson Contract

This is the Vue Lab adaptation of [LESSON_CONTRACT.md](LESSON_CONTRACT.md). Same
philosophy, same teaching cycle (Motivation, Concept Lab, Execution Visualization,
Generalize, Apply, Connect, Recognition), same insistence that a lesson which produces
working code but leaves a concept half-understood has failed regardless of how good the
code looks. Read LESSON_CONTRACT.md first — this document only states what is different
when the vehicle is a browser-based spreadsheet built in Vue 3 + TypeScript instead of a
CAD/CAM system built in C#.

Everything in LESSON_CONTRACT.md carries over unchanged unless a section below says
otherwise: the Silent Knowledge Problem, Describing vs Teaching, the Two Lenses, Agile
Delivery, Concept Labs, execution traces, the pipeline diagram, incremental practice,
Code Standards, Explanation Standards, Define at Use, the Aha Moment, the Repetition
Rule, Maximum Extraction, Connection Standards, Structure, and the Checklist. Where this
document is silent, LESSON_CONTRACT.md governs.

---

## The project is a production-grade spreadsheet, not the goal

The spreadsheet — grid, formulas, formatting, multiple sheets, undo/redo, a dependency
graph, a plugin system — is the laboratory. It exists so that reactivity, component
composition, type contracts, tokenizing, recursive-descent parsing, graph traversal,
state machines, and dozens of other ideas *have* to come up, because the project
genuinely needs them. A lesson that ships a working feature but leaves the underlying
concept half-understood has not succeeded. Every lesson is a case study, introduced as
one: "today we study declarative rendering; our case study is the grid," not "today we
build a grid."

### The roadmap is chosen the same way — this is easy to get backwards

It is tempting, when deciding what to write next, to reach for a list of unfinished
spreadsheet features ("still need: multiple sheets, named ranges, plugins...") and
treat that list as the plan. That is the project-as-goal trap applied to sequencing
instead of to a single lesson, and it is just as wrong. Agile Delivery (from
LESSON_CONTRACT.md) still governs *how* each lesson ships — working, visible, a
vertical slice — but it never governs *what* gets built next.

What comes next is chosen by asking, in this order: **what CS/SE/design mastery is
still missing from this series** (check it against LESSON_CONTRACT.md's Two Lenses,
Maximum Extraction, and this document's "What 'front-end engineer by the end'
obligates" list — as of the last audit, testing and performance-at-scale had no
lesson at all, which a feature checklist alone would never have surfaced), **then**
the smallest real spreadsheet feature that would make that gap show up naturally. A
feature earns a lesson because it is the vehicle for a mastery gap, never because it
was promised earlier and is still outstanding.

---

## Zero experience, always — this series is not allowed to gate itself

**The single hardest rule in this document, and the reason it exists as a separate
contract rather than a footnote on LESSON_CONTRACT.md:** this series is written for a
reader who has never written a line of code, never opened a text editor for anything
but a document, and has no other lesson series in this app as a prerequisite.

LESSON_CONTRACT.md's "Nothing is assumed" rule says a student who skips a lesson must
still follow the next one. Vue Lab goes further: **no lesson in this series may assume
completion of any *other* series in this app** — not "Vue Essentials," not any general
JavaScript primer, nothing. A learner who opens Lesson 01 as their first-ever encounter
with programming must be able to follow it to a working, visible result. If a construct
as basic as `const`, a function, an HTML tag, or an attribute has not yet appeared *in
this series*, it has not been taught, no matter how "basic" it seems or where else in
this app it might be explained.

This means Lesson 01 carries more first-appearance teaching than a typical first lesson
in a curriculum that assumes some baseline. That is the correct shape for this series,
not a defect to trim. A lesson that feels "slow" to someone who already codes is
evidence it is doing its job for someone who doesn't.

### HTML and the DOM are taught, not inherited

LESSON_CONTRACT.md's "Define at Use" domains (syntax, imports, types, functions,
terminal, tooling, config, file system, npm, git, browser APIs, security, debugging,
performance, networking, professional practice) all apply here. Vue Lab adds one
implicit domain that C#/CAD-CAM never needed to name separately, because Vue templates
*are* HTML: **every HTML element and attribute used for the first time is explained
exactly like a language construct** — what the tag means semantically, what an
attribute is, what nesting produces (a tree: the DOM). `<table>`, `<tr>`, `<td>`,
`class`, `id` are not "just markup" any more than `foreach` is "just a loop."

### The sandbox changes which domains matter, and when

Vue Studio compiles and runs every file in-browser — no terminal, no `npm install`, no
`git`, no build step. That is a deliberate scope cut, not an oversight, and it changes
*when* certain LESSON_CONTRACT.md domains get their first-appearance treatment:

- **Terminal, tooling/build system, package management (npm, semver, lock files),
  and version control (git)** are deferred, not skipped. They get their full,
  first-appearance treatment in a dedicated **"Leaving the Sandbox"** arc near the end
  of the series, where the finished spreadsheet is turned into a real local project:
  `npm create vite`, `git init`, a first commit, `npm install`, a real `node_modules`,
  a real build and deploy. Nothing in that arc may be assumed either — it is that
  arc's job to teach it, the same way Lesson 01 teaches `const`.
- **Configuration files** (`vite.config.ts`, `tsconfig.json`) are introduced in that
  same arc, when they first exist to configure.
- Everything else — browser APIs, security, debugging, performance, HTML/DOM,
  TypeScript, Vue's reactivity and component model, and the CS/SE content — is taught
  as it comes up, on the series' normal schedule, exactly as LESSON_CONTRACT.md
  requires.

### What "front-end engineer by the end" obligates

The series' stated destination is not "knows Vue." It is a working software engineer.
That means the curriculum's coverage is not limited to Vue-the-library. Across the full
arc, the series must teach, from first principles, at the point the spreadsheet
genuinely needs each one (never earlier, never as a detour):

- **HTML & the DOM** — elements, attributes, the tree, semantics, accessibility (a
  spreadsheet is a grid of interactive cells — `role`, `aria-*`, and keyboard
  navigation are not optional extras; a spreadsheet a screen-reader user cannot
  navigate is not production-grade).
- **CSS** — the box model, layout, the cascade, responsive design — whatever the grid,
  formatting UI, and multi-sheet chrome actually require, taught when required.
- **JavaScript and TypeScript** — from `const` and function calls up through generics,
  discriminated unions, and the type system decisions the formula engine needs.
- **Vue's reactivity and component model** — from `ref` and interpolation up through
  composables, provide/inject, and the render pipeline underneath them.
- **Classic CS, earned by the project, not scheduled by a syllabus** — tokenizing and
  recursive-descent parsing (the formula engine reads text like `=SUM(A1:A4)*2` and
  must become an AST before it can be evaluated — this is a real parser, taught the
  same way a compiler course teaches one, with grammars, precedence, and execution
  traces), graphs and topological sort (the dependency graph between cells — what a
  circular reference is and why it must be detected), hash maps (the cell store),
  finite state machines (the formula editor's autocomplete, the undo/redo stack),
  algorithmic complexity (why recalculating every cell on every keystroke does not
  scale, and what recalculating only the dependent cells buys you).
- **Software engineering principles** — separation of concerns, single responsibility,
  dependency inversion, the observer pattern, the plugin/strategy pattern — each
  earned by an actual design pressure in the spreadsheet (LESSON_CONTRACT.md's Two
  Lenses and Repetition Rule apply in full).
- **Testing** — unit tests for the pure functions (the parser, the evaluator, the
  dependency graph) and component tests for the interactive pieces, introduced the
  first time an untested function's behavior stops being obvious by inspection.
- **Security** — the formula engine executes user-authored text; XSS and injection are
  not hypothetical here (a formula referencing a cell that contains `<script>` is a
  real attack surface once a value is ever rendered with anything other than safe
  text interpolation). Named and defended against at first contact, per
  LESSON_CONTRACT.md §12.
- **Performance** — 60fps and the render budget apply directly to a grid that may have
  thousands of cells; reactivity fan-out, virtualization, and memoization are taught
  when the grid is large enough that their absence is visibly slow, not before.
- **Real-world tooling and deployment** — the "Leaving the Sandbox" arc above.

None of this is a separate curriculum bolted onto the spreadsheet. It is extracted from
the spreadsheet, per LESSON_CONTRACT.md's Maximum Extraction — the same rule that says a
lesson about bisection is also a lesson about binary search and pure functions applies
here at series scale: a lesson about the dependency graph is also a lesson about graph
theory, topological sort, and the observer pattern.

---

## Design is a third lens, not an afterthought

LESSON_CONTRACT.md requires the Two Lenses — CS and SE — on every significant code
block. In Vue Lab, any code block with a user-facing consequence (anything in
`<template>` or `<style>`, any interaction handler, any choice of color, spacing,
copy, or layout) requires a **third lens, applied with the same rigor as the other
two, not tacked on as a closing remark:**

**The Design lens** — What does this mean for the person using it?
Name the principle: visual hierarchy, affordance, contrast, information density,
progressive disclosure, Fitts's law, error prevention vs. error recovery. Explain the
decision the same way the SE lens explains an architectural choice — what was chosen,
what the alternative would have cost the user, and why this one is correct here. "The
selected cell gets a 2px blue outline" is a description. "The outline is 2px, not 1px,
because a 1px change is at the edge of legibility against a busy grid — and it is
positioned with `outline-offset: -2px` rather than growing the cell, because growing
the cell on selection would shift every cell after it and make the grid visually
unstable the instant you click" is the Design lens.

Design is not its own separate lesson that happens once (Lesson 13 exists because
formatting needed a dedicated home for the *concept* of a design system — colors as
tokens, contrast math, ARIA — not because design lives only there). Every lesson that
touches the template or the stylesheet owes a Design-lens explanation for the choices
it makes, the same way every lesson touching a data structure owes a CS-lens
explanation for choosing it. A lesson that adds a button, a color, a layout, or a
piece of copy with no Design-lens sentence attached is incomplete, in exactly the way
a lesson that adds a `Record` with no explanation of why `Record` over an array would
be incomplete.

**Recognition for the Design lens works the same way as for a hard CS/SE concept:**
name where the same principle shows up in real, known products — not just "good UX
practice" in the abstract.

---

## Agile is a topic that is taught, not only a method this contract practices

LESSON_CONTRACT.md's Agile Delivery section governs *how* this document's own lessons
are sequenced and shipped — vertical slices, working software at every step, no
invisible infrastructure. That governs lesson authoring. It does not, by itself, teach
the *student* what Agile is, and a curriculum that silently follows a methodology
without ever naming it to the learner has failed the same "Silent Knowledge Problem"
the whole contract exists to prevent — the same category of failure as a lesson using
`npm install` without ever explaining what a package manager is.

Real Agile/Scrum vocabulary is professional knowledge every working front-end
engineer is expected to know, and this series' own structure is already teaching it
implicitly on every page: **Definition of Done** is not this contract's invented
phrase — it is the standard Scrum term for a team-agreed checklist a unit of work must
satisfy before it counts as finished, and every lesson in this series has had one
since Lesson 01 without ever once saying so. A **vertical slice** — this contract's
own term for "input → processing → visible output, however small" — is a real,
named Agile practice for splitting work, not a pedagogical invention either.

**The rule:** the first time a lesson uses a structural pattern that is *itself* a
named Agile practice, name it explicitly and explain the real-world term, exactly like
any other piece of first-appearance vocabulary — per the Repetition Rule, since Agile
practice counts as a software engineering principle, each later appearance should
briefly restate the connection with whatever fresh facet the current lesson adds
(a **retrospective** — reflecting on what worked and what didn't after a unit of work
ships — reads differently the first time it's named than it does once a learner has
enough lessons behind them to actually compare). Terms this series must name
explicitly, at the point their structure is already in use: **Definition of Done**,
**vertical slice**, **iterative/incremental delivery**, **technical debt** (the
deliberate simplicity-vs-scalability trade this series already makes out loud in
places like Lesson 11's snapshot-vs-diff undo choice), **refactoring** (Lesson 12's
component extraction *is* a refactor — change internal structure, preserve external
behavior — and should be named as one), and **MVP** (minimum viable product — this
project's Lesson 01 grid is one). A dedicated professional-practice treatment of real
Agile ceremonies a learner won't encounter solo — sprints, standups, backlog grooming,
story points — belongs in the "Leaving the Sandbox" arc, where the learner is
explicitly moving from solo lessons toward how a real team actually works.

---

## Foundational vocabulary — the zero-experience floor

LESSON_CONTRACT.md's "Define at Use" domains assume a reader who already thinks like a
programmer in *some* language — "a student who knows Python already understands the
idea, but not yet this language's syntax." Vue Lab's reader may not know what a
variable is at all. That gap does not show up as a missing explanation of any single
line — it shows up as **knowledge that teleports**: a term gets used correctly and even
gets a good explanation, but the concept underneath it was never actually built, so the
explanation has nothing to attach to. This is the single most common way a Vue Lab
lesson fails this contract while looking, line by line, like it's teaching well.

The fix is to name the floor explicitly, so it is checked for rather than rediscovered
by an external reviewer after the lesson ships. Every one of the following is a
**foundational term**: the first lesson that uses it, at all, must define it in the
same first-appearance style as any HTML tag or TypeScript keyword — not assumed as
background a self-taught reader already has:

- **Component** — what a `.vue` file actually is, before explaining what's inside one.
- **Variable, declaration vs. assignment** — that `const x = 5` is doing two distinct
  things in one line, and that a later lesson may split those into two lines.
- **Primitive type** — string, number, boolean — as a category, not just examples.
- **Object** — a named collection of fields, before any `interface` or object literal
  is shown; `interface` describes an object's shape, it is not itself the concept of
  "object."
- **Array** — including indexing (`array[0]`, positions start at `0`) and `.length` —
  not just "an ordered list," which describes what it's *for* without showing how to
  use one.
- **Function, parameter vs. argument, return** — a parameter is the name in the
  definition; an argument is the value at the call site. These two words are not
  interchangeable, and this series must never use them as if they were.
- **Expression vs. statement** — `{{ }}` and `${}` both require an expression
  specifically; a reader who doesn't know the word "expression" was defined can't
  understand why some code fits inside them and some doesn't.
- **Scope** — the region of code where a name can be used; required the moment any
  nested block (a nested `v-for`, later a nested function) reads a name from an outer
  one.
- **Compile time vs. runtime** — required the moment anything TypeScript-only
  (`interface`, `type`) is introduced, because the entire point of those constructs is
  that they exist at one and not the other.
- **Built-in / provided by the language** — the distinction between a function this
  project wrote and one the language or a library ships, the first time a call like
  `Array.from` or `String.fromCharCode` appears.

These are not a prerequisite reading list posted somewhere else — each one is defined
at the exact lesson and exact line where the series first needs it, per LESSON_CONTRACT.md's
Define at Use rule, and never assumed again after that first definition, per the
Repetition Rule. Most of them belong in Lesson 01, because Lesson 01 is where a
zero-experience reader meets almost all of them for the first time; that lesson being
noticeably denser than a typical "lesson one" elsewhere in this app is correct, not a
defect to trim.

### Execution traces apply to function calls, not only loops

LESSON_CONTRACT.md requires an execution trace for "any code involving a loop,
recursion, or state carried across steps." In Vue Lab, extend this explicitly to **any
function call that itself calls one or more other functions** — `cellId()` calling
`columnLetter()` calling `String.fromCharCode()` is exactly this shape, and it is
exactly where a zero-experience reader loses the thread, even with a correct prose
explanation of each function individually. The first time a lesson assembles a call
chain more than one function deep, it gets a step-by-step trace in the same format
LESSON_CONTRACT.md already prescribes for loops — concrete values, one arrow per step,
ending in the actual return value — not a paraphrase of what the functions "generally
do together."

### Every call inside a template is named as a call

When a function defined in `<script setup>` is invoked from inside `<template>` — a
`v-for` body, an interpolation, a bound attribute — state explicitly, the first time
this happens, that Vue's generated render code is calling it, when (on every render of
that element), and that it is the exact same function, doing the exact same thing, as
when it was called directly in a throwaway script example. A reader who has only seen a
function "called" by writing `functionName(argument)` themselves does not automatically
recognize `{{ columnLetter(col) }}` as the same act.

---

## Recognition, aimed at this domain

LESSON_CONTRACT.md's Recognition requirement (name several unrelated places a hard
concept recurs) applies unchanged. In Vue Lab, always include the obvious anchor first:
**where this concept appears in Excel, Google Sheets, Airtable, or Vue's own source** —
the learner uses spreadsheets already; naming the concept inside a tool they already
trust is the fastest route to "this is a real pattern, not a classroom exercise."

```
Today: Recursive-descent parsing (the formula engine)

Also recognized in: Excel's and Google Sheets' own formula bars, every SQL engine
parsing a query, JSON.parse, your browser parsing the CSS in this very lesson,
Vue's own template compiler turning <template> into a render function.
```

---

## Checklist additions

Everything in LESSON_CONTRACT.md's checklist applies unchanged. Add, before publishing
any Vue Lab lesson:

- [ ] The lesson assumes zero prior lessons from any other series in this app —
      re-read it as if it is the reader's first-ever contact with code
- [ ] Every HTML element and attribute introduced is explained at first use, the same
      as a language construct
- [ ] No terminal, npm, git, or config-file concept appears before the "Leaving the
      Sandbox" arc — and within that arc, none of them is assumed either
- [ ] If the lesson touches formulas, cell references, formatting, or any
      user-authored content, the security question (XSS/injection) is asked and
      answered, per LESSON_CONTRACT.md §12
- [ ] At least one Recognition example names a real spreadsheet product or Vue itself,
      not only an unrelated CS domain
- [ ] Every foundational vocabulary term used for the first time anywhere in the
      series (component, variable, object, array, function/parameter/argument,
      expression/statement, scope, compile time/runtime, built-in) is actually
      defined at that point, not only used correctly
- [ ] Any function call chain more than one function deep gets a step-by-step
      execution trace with concrete values, the first time it's assembled
- [ ] Any function called from inside a template (not directly in `<script setup>`)
      is explicitly named as a call the first time this happens, stating who calls it
      and when
- [ ] Every code block with a user-facing consequence (template, style, interaction
      handler, copy, layout) has an explicit Design-lens explanation, not just CS/SE
- [ ] Any structural pattern this lesson uses that is itself a named Agile practice
      (Definition of Done, vertical slice, refactor, technical debt, MVP) is named to
      the student, not just silently followed
