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
file, one responsibility.** In a real-world React project (built with a
bundler like Vite), this would be enforced by the language itself: each
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

**SE lens — `Calculator` doesn't know how the display works, and doesn't
need to.** `Calculator`'s entire job is arranging two things next to each
other. It has no idea `Display` currently just shows `"0"`, and later,
`Display` could become far more complex internally without a single line
of `Calculator` needing to change. This is **composition**: building a
larger component out of smaller ones, where each smaller piece is a
self-contained black box to everything above it. It's the same idea behind
the TypeScript Spreadsheet project's dispatch table (lesson 10) — the
caller only needs to know *that* a piece does its job, never *how*.

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

---

## Definition of Done

- [ ] Four new files exist: `Header.tsx`, `Display.tsx`, `Keypad.tsx`, `Calculator.tsx`
- [ ] `App.tsx` composes `Header` and `Calculator` inside a Fragment
- [ ] ▶ Preview shows the same visual result as lesson 01, restructured underneath
- [ ] You can explain why `<Display />` calls your function but `<display />` would not
- [ ] You can explain what a Fragment is and what problem it solves
- [ ] You can point at the component tree and say which components are leaves and which are branches

---

*Next: Lesson 03 — Props: Making Button Reusable. `Keypad`'s three
hardcoded buttons become one `Button` component, reused with different
labels — the point where copy-pasting JSX starts to feel obviously wrong.*
