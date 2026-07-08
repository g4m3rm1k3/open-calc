# React Calculator — Lesson 02 — Breaking the UI Into Pieces

## What You Will Build

The same box from lesson 01, now visibly restructured — a heading, and a
calculator area holding a display and a row of buttons — built from four
small components instead of one. The page will not look meaningfully
different yet. What changes is entirely underneath: *where* each piece of
the UI lives.

---

## What You Need to Know First

Lesson 01 — a mounted, working `App.tsx`. This lesson doesn't add any new
behavior, only structure, so if lesson 01's "Hello, Calculator" box is
on screen, you're ready.

---

## Step 1 — One File Per Component, and Why That's the Rule Starting Now

**The problem:** `App.tsx` currently holds the entire UI. Real UIs have far
more than one visual piece, and cramming all of them into a single growing
file is exactly the kind of problem this curriculum has already named
once: the TypeScript Spreadsheet project split `types.ts`, `parser.ts`,
and `evaluator.ts` apart in its own lesson 20, for the same reason.

In the **JavaScript** tab, click **+ New** four times and name the new
files `Header.tsx`, `Display.tsx`, `Keypad.tsx`, and `Calculator.tsx`.

**SE lens — the rule this project follows from here on: one component, one
file, one responsibility. This has a formal name: the Single Responsibility
Principle.** A component, a function, or a file follows the **Single
Responsibility Principle (SRP)** when it has exactly one reason to change
— one job, described in a single sentence with no "and" in it. `Header`'s
one job is showing a heading. `Display`'s one job (for now) is showing a
value. The moment a file's description needs "and" to state it fully
("handles the display *and* validates input," say), that's a concrete,
checkable signal it's doing more than one job and is a candidate for
splitting — precisely the check lesson 30's capstone review applies to
every file in this finished project. In a real-world React project (built
with a bundler like Vite), this would be enforced by the language itself:
each
file would write `export default function Header() { ... }`, and any file
that wanted to use it would write `import Header from './Header'` at the
top — an explicit, checked contract stating exactly what each file provides
and exactly what each file needs. **This sandbox has no real
`import`/`export`** — every file in the JavaScript tab concatenates into
one shared script, a decision this project already flagged in its own
[README](README.md). Nothing stops you from defining `Header` inside
`Keypad.tsx` here. The discipline is still worth keeping, by hand, because
it's the discipline that scales: when this project's file list is ten files
long, you will want to find "the button" by opening `Button.tsx`, not by
searching through an unrelated file that happens to also define it.

**A genuinely useful fact about this environment, not a workaround:**
every component in this lesson is written as `function Header() { ... }` —
a **function declaration**. Function declarations are *hoisted* — fully
defined before any code in the entire concatenated script runs, regardless
of which file they're written in or what order the files appear in HTML
Lab's file list. This means `Calculator.tsx` can use `<Display />` even if
`Display.tsx` happens to sit below it in the file list. (This is not true
of every kind of code — a top-level `const` runs in file order, which
matters starting in lesson 08.) Keep files in a sensible reading order
anyway; the browser doesn't need it, but the next person reading the
project does.

---

## Step 2 — Write the Leaf Components

**The problem:** `Header`, `Display`, and `Keypad` don't exist as
components yet — right now they're just empty files.

In `Header.tsx`:

```tsx
function Header() {
  return (
    <header className="app-header">
      <h1>Calculator</h1>
    </header>
  );
}
```

In `Display.tsx`:

```tsx
function Display() {
  return <div className="display">0</div>;
}
```

In `Keypad.tsx`:

```tsx
function Keypad() {
  return (
    <div className="keypad">
      <button>7</button>
      <button>8</button>
      <button>9</button>
    </div>
  );
}
```

**Walkthrough.** All three are shaped exactly like `App` was in lesson 01:
a function, taking nothing, returning one JSX expression. None of them do
anything yet — `Display` always shows `"0"`; the three buttons in `Keypad`
do nothing when clicked. That's deliberate. This lesson is only about
*where code lives*, not about making anything work — real behavior starts
in lesson 05, once the structure exists to hang it on.

**CS lens — these are "leaf" components.** In the tree `App → Calculator →
Display`, `Display` is a **leaf**: a node with no component children of its
own (only plain HTML tags like `<div>`). `Header`, `Display`, and this
version of `Keypad` are all leaves. `Calculator`, written next, will be a
**branch** — a component whose job is to arrange *other* components, not
to render raw markup itself.

---

## Step 3 — Compose Them Inside `Calculator`

**The problem:** `Display` and `Keypad` exist independently, with nothing
grouping them together the way a real calculator groups a screen and its
buttons.

In `Calculator.tsx`:

```tsx
function Calculator() {
  return (
    <div className="calculator">
      <Display />
      <Keypad />
    </div>
  );
}
```

**Walkthrough — using a component you wrote, as a tag.** `<Display />` is
JSX for "call the `Display` function here, and put whatever it returns in
this exact spot." The capital `D` is not a style choice — JSX uses it to
tell the difference between a component (`<Display />`, calls your
function) and a plain HTML tag (`<div>`, becomes a real DOM element
directly). A lowercase `<display />` would be treated as an unknown HTML
tag, not your component — capitalization is how the two are distinguished
literally by Babel while compiling.

The self-closing `<Display />` (versus `<Display></Display>`) is used
whenever a component has no children — the same convention `<img />` and
`<br />` already use in plain HTML for elements that never contain
anything.

**Worth stating precisely, since it's easy to guess wrong: using a
component is a function call, never `new Display()`.** Coming from
object-oriented languages, it's natural to guess that placing a component
"onto the page" must mean constructing an *instance* of some class, the
way `new SomeClass()` creates one object from a class blueprint elsewhere
in programming. That is **not** what `<Display />` does. `Display` is a
plain function, defined with `function Display() { ... }` — there is no
class here, and no `new` anywhere in this entire project. `<Display />`
compiles to `React.createElement(Display, null)`, and internally, at some
point, React itself simply **calls** `Display()`, the same way calling
`double(5)` calls `double`. "Mounting a component" is calling a function
and keeping track of what it returned; nothing about it constructs an
object in the traditional sense.

**SE lens — `Calculator` doesn't know how the display works, and doesn't
need to.** `Calculator`'s entire job is arranging two things next to each
other. It has no idea `Display` currently just shows `"0"`, and later,
`Display` could become far more complex internally without a single line
of `Calculator` needing to change. This is **composition**: building a
larger component out of smaller ones, where each smaller piece is a
self-contained black box to everything above it. It's the same idea behind
the TypeScript Spreadsheet project's dispatch table (lesson 10) — the
caller only needs to know *that* a piece does its job, never *how*.

**Two more formal terms, both directly visible in `Calculator` right now.**
**Coupling** measures how much one piece of code depends on the internal
details of another. `Calculator` and `Display` are **loosely coupled** —
`Calculator` depends only on the fact that `<Display />` exists and
renders something; it knows nothing of `Display`'s internals, so changing
those internals can never break `Calculator`. **Cohesion** measures how
closely the *responsibilities inside one piece of code* relate to each
other. `Display` is **highly cohesive** — everything inside it is about
one thing, showing a value. The general, memorable rule these two terms
express together: good software design pushes toward **low coupling,
high cohesion** — pieces that each do one focused thing internally
(high cohesion), while depending on each other as little and as shallowly
as possible (low coupling). Every principle this project names from here
on — separation of concerns, single responsibility, encapsulation — is a
different facet of this same underlying goal.

---

## Step 4 — Compose `App` From `Header` and `Calculator`

**The problem:** `App.tsx` still has lesson 01's placeholder content; the
real top-level structure — a header above a calculator — doesn't exist yet.

Replace `App.tsx`'s component with:

```tsx
function App() {
  return (
    <>
      <Header />
      <Calculator />
    </>
  );
}
```

(Leave `requireElement` and the `ReactDOM.createRoot(...).render(<App />)`
line at the bottom of `App.tsx` exactly as lesson 01 left them.)

Click **▶ Preview**. You'll see a "Calculator" heading, the digit `0`, and
three number buttons — visually similar to lesson 01, structurally
completely different underneath.

**Walkthrough — the empty tag `<>...</>`, a Fragment.** JSX has one hard
rule: a component must return exactly *one* root element. `<Header />` and
`<Calculator />` are two siblings — returning them side by side, with
nothing wrapping them, is not allowed. The obvious fix, wrapping them in a
`<div>`, works, but adds a real, permanent `<div>` to the actual page that
exists for no reason except satisfying this rule. `<>` and `</>` are a
**Fragment** — shorthand for `<React.Fragment>` — a wrapper JSX accepts to
satisfy the "one root" rule, that produces **no extra DOM element at all**.
After Babel and React finish, the real page has a `<header>` directly
followed by a `<div className="calculator">`, with nothing artificial
between them.

**PL lens — the term for the tree React itself builds from all this JSX:
the Virtual DOM.** `React.createElement(Display, null)` (what `<Display
/>` compiles to) doesn't create a real, on-screen DOM element — it creates
a small, plain JavaScript object describing "there should be a `Display`
here." The complete tree of these plain objects, built fresh every render,
is called the **Virtual DOM**: a lightweight, in-memory description of
what the UI *should* look like, entirely separate from the real, heavier
DOM the browser actually renders and repaints. Reconciliation — mentioned
by name starting in lesson 04 — is the process of comparing the *new*
Virtual DOM tree to the *previous* one, and only then touching the real
DOM for whatever's actually different. This is worth naming precisely
here, at the very first moment a real component tree exists: everything
this project builds from now on is, underneath, Virtual DOM trees being
built and compared, all the way up to `App`.

**CS lens — you're looking at a real tree now.** `App` is the root.
`Header` and `Calculator` are its children. `Display` and `Keypad` are
`Calculator`'s children. This is the same tree the user's own sketch for
this project described before a single line of code existed:

```
<App>
    <Header/>
    <Calculator/>
        <Display/>
        <Keypad/>
```

Every component you add for the rest of this project attaches somewhere in
this tree. Naming where something belongs in this tree, before writing it,
is one of the most useful habits this project builds.

**The formal vocabulary, worth having precisely, since it's used by name
from here on.** A **tree** is a data structure made of **nodes** connected
so that each node has exactly one **parent** (except one special node, the
**root**, which has none) and any number of **children**. `App` is this
tree's root. `Header` and `Calculator` are `App`'s children, and — the
same relationship, described from the other direction — `App` is their
parent. `Display` and `Keypad` are `Calculator`'s children, which makes
them `App`'s **descendants** (any node reachable by following parent-to-
child links downward, any number of levels) and makes `App` their
**ancestor** (the same relationship, upward). `Header` and `Calculator`
are **siblings** — they share the same parent. A node with no children —
`Header`, `Display`, `Keypad` here — is called a **leaf**. Any node,
together with everything beneath it, is a **subtree** — `Calculator`
together with `Display` and `Keypad` is a subtree of the whole tree rooted
at `App`. Lesson 07 uses "ancestor" precisely, by name, to explain a real
rule about where shared state is allowed to live — this vocabulary is
introduced now specifically so that explanation doesn't have to stop and
define it later.

---

## Connect the Pieces

```
Header.tsx      Header() — a heading, no children, no state
Display.tsx     Display() — shows "0", hardcoded, for now
Keypad.tsx      Keypad() — three buttons, hardcoded, do nothing yet
Calculator.tsx  Calculator() — composes Display + Keypad
App.tsx         App() — composes Header + Calculator; still owns the one
                mounting line from lesson 01
```

---

## What Breaks Without This

**Returning `<Header />` and `<Calculator />` side by side, with no
Fragment or wrapping element:** Babel refuses to compile the file at all —
"Adjacent JSX elements must be wrapped in an enclosing tag" is the real
error you'll see, either as a red squiggly line from Monaco or as a failed
▶ Preview. This is not a runtime bug; it's JSX syntax being invalid before
your code ever runs, the same category of failure as a missing closing
brace.

**Naming a component starting with a lowercase letter, e.g. `function
display() { ... }` used as `<display />`:** No error at all, and nothing
useful happens — Babel treats `<display />` as a request for a plain,
unknown HTML tag named `display`, not a call to your function. The browser
silently renders nothing meaningful for an unrecognized tag. This is the
single most common first mistake with JSX, and the reason component names
are capitalized by convention *and* by necessity here.

**Putting all four components' code into one giant `App.tsx` instead of
splitting them:** the calculator would look and behave identically — this
mistake produces no error and no visible symptom at all today. The cost is
entirely about the future: every one of this project's next twenty-eight
lessons touches one or two specific components, and finding "the button
component" inside a single thousand-line file, later, is a real, felt
cost that splitting now avoids paying later.

**Connect to the real world.** Splitting a UI into `Header`/`Display`/
`Keypad`/`Calculator`-shaped pieces, each in its own file, each with one
job, is exactly how professional React codebases are organized — open
almost any real production React project's source code and its file
structure mirrors its component tree the same way this project's now
does. This is not a teaching simplification; it is the actual convention.

---

## Definition of Done

- [ ] Four new files exist: `Header.tsx`, `Display.tsx`, `Keypad.tsx`, `Calculator.tsx`
- [ ] `App.tsx` composes `Header` and `Calculator` inside a Fragment
- [ ] ▶ Preview shows the same visual result as lesson 01, restructured underneath
- [ ] You can explain why `<Display />` calls your function but `<display />` would not
- [ ] You can explain what a Fragment is and what problem it solves
- [ ] You can point at the component tree and say which components are leaves and which are branches
- [ ] You can correctly use the words root, parent, child, sibling, ancestor, descendant, and subtree to describe this project's component tree
- [ ] You can explain why `<Display />` is a function call, not object construction
- [ ] You can define coupling and cohesion, and say which one you want high and which low
- [ ] You can state the Single Responsibility Principle in one sentence
- [ ] You can explain what the Virtual DOM is and how it differs from the real, on-screen DOM

---

*Next: Lesson 03 — Props: Making Button Reusable. `Keypad`'s three
hardcoded buttons become one `Button` component, reused with different
labels — the point where copy-pasting JSX starts to feel obviously wrong.*
