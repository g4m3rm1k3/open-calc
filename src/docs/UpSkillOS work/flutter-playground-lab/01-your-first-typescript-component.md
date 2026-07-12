# Lesson 1 — Your First TypeScript Component: A New Lab Appears

Today we study **static typing** and **the component as the unit of UI**. Our case
study is the very first screen of a brand-new lab you're about to build: **Flutter
Playground** — a tool that will eventually embed a live, editable Flutter/Dart code
editor inside the app, framed to look like a phone. That's the destination. Today we
build none of it. Today's entire job is smaller and more important: get one new
TypeScript file, containing one new type-checked function component, rendering real
text inside a real, clickable window in the real running app — and understand, from
zero, every symbol in the code that makes that happen.

This is real code in this repository, the same way the lesson-engine and
git-fundamentals lesson sets in `src/docs/UpSkillOS work/` are. You are not learning
a simulation of your app. You are learning your app, one real file at a time.

---

## What You Will Build

A new folder, `src/labs/flutter-playground/`, containing two real TypeScript/React
files and one registry entry. By the end of this lesson you will run `npm run dev`,
open UpSkillOS, find "Flutter Playground" in the Explore page (or the Start Menu's
Labs list) next to every other lab, click it, and watch a real window open showing
a heading and a "Coming soon" message — nothing fake, nothing simulated, a genuine
new addition to the running app that you built and understand completely.

---

## What You Need to Know First

Nothing. This lesson assumes no prior TypeScript, no prior React, and no prior
JavaScript beyond being able to read English words in code. If you've done the
`git-fundamentals` or `lesson-engine-autofind` lesson sets already, you've seen
`npm run dev` before — quick recap since it's used again here: `npm` is the Node
Package Manager, a command-line tool that ships with Node.js. `run dev` tells it to
execute the script named `"dev"` inside this project's `package.json` file, which (in
this repo) runs a couple of quick data-preparation scripts and then starts **Vite**'s
development server — a local program that serves the app to your browser and
recompiles files the moment you save them. If you haven't done those lessons, that
one paragraph is everything you need; nothing else from them is assumed here.

---

## The Lesson

### Step 1 — What Problem Does TypeScript Actually Solve?

Before writing a single line of it, you need to know what TypeScript *is*, because
every file in this lesson ends in `.ts` or `.tsx` instead of `.js` or `.jsx`.

JavaScript is a **dynamically typed** language: a variable can hold a number, then
later hold a string, and the language never stops you. Nothing checks, while you're
writing the code, whether you're using a value correctly — mistakes are only
discovered when that exact line of code actually runs, which might be seconds after
you start the app, or might be months later when a rare code path finally executes
in front of a real user.

TypeScript is a **statically typed superset of JavaScript**. "Superset" means: every
valid JavaScript file is already valid TypeScript — TypeScript adds things on top, it
doesn't take anything away. "Statically typed" means TypeScript checks the *shapes*
of your values — is this a number, a string, an object with a specific set of
fields? — **before the code ever runs**, while you're still typing, by reading your
source code and reasoning about it. When your code violates a type, TypeScript
refuses to compile it and shows you the exact line, instead of waiting for that line
to run and crash.

#### Concept lab: watch type-checking catch a real mistake

This code is disposable — it will never appear in the project, and you'll delete the
file at the end of this step. It exists only to let you *watch* type-checking do its
job, once, with your own eyes, before you trust the explanation.

Create a scratch file anywhere outside `src/` — for example
`C:\Users\g4m3r\Documents\testing tutorials\open-calc\scratch.ts` — with exactly this:

```typescript
function double(value: number): number {
  return value * 2
}

console.log(double(21))
```

Run it from a terminal in the project folder:

```
npx tsc --noEmit scratch.ts
```

**What each part of that command is:** `npx` runs a locally-installed package
without you having to install it globally first — it's already bundled with `npm`.
`tsc` is the **TypeScript compiler** — the actual program that reads `.ts` files and
type-checks them (and, normally, translates them into plain `.js`). `--noEmit` is a
flag telling `tsc`: check the types, report any errors, but don't write any output
file — we only want the checking, not a compiled copy, for this experiment.
`scratch.ts` is the file to check.

**Expected output:** nothing prints from `tsc` itself — no errors means `tsc` stays
silent and exits cleanly. That silence *is* the proof: your code type-checks.

Now break it. Change the last line to:

```typescript
console.log(double("21"))
```

Run the exact same command again:

```
npx tsc --noEmit scratch.ts
```

**Expected output** (approximately — exact wording varies by TypeScript version):

```
scratch.ts:5:15 - error TS2345: Argument of type 'string' is not assignable to
parameter of type 'number'.

5 console.log(double("21"))
                ~~~~

Found 1 error.
```

**What that output proves:** you never ran `double("21")`. Nothing executed. `tsc`
read your source code, saw that `double` was declared to accept a `number` (that's
what `value: number` means — a **type annotation**, read "the parameter named `value`
must be a `number`"), saw that you were calling it with the string `"21"` instead,
and refused before a single line ran. In plain JavaScript, `double("21")` would have
silently run and returned `"2121"` — the `*` operator on a string does something
JavaScript-specific and surprising, not an error, just a wrong answer that might not
be noticed until much later. TypeScript turned a silent wrong-answer bug into an
immediate, specific, pre-execution error.

Delete `scratch.ts` now. It was never part of the project and never will be — its
only job was to let you watch this exact failure happen once, with your own eyes.

**CS lens:** This is **static analysis** — examining a program's source code to
reason about its behavior without running it. Type checking is the most common form
of static analysis a working developer encounters daily; linters (which check style
and common mistakes) and this repo's own `import.meta.glob`-based auto-discovery
(from the `lesson-engine-autofind` lesson set, if you've read it) are two more.

**SE lens:** This is **fail fast, fail loud** — a design principle that says: the
earlier a mistake is caught, the cheaper it is to fix. A mistake caught by `tsc`
while you're typing costs you seconds. The same mistake caught by a user hitting a
crash in production costs a bug report, a debugging session, and a fix-and-redeploy
cycle. TypeScript moves the moment of failure as early as it can possibly go.

**Recognition — you will see "fail fast, fail loud" again in:** database schema
constraints (a `NOT NULL` column rejects a bad insert immediately instead of storing
a broken row), HTTP form validation (rejecting a malformed email before it ever
reaches a database), airplane pre-flight checklists (catching a fault on the ground,
where it's safe, rather than in the air), and unit tests (catching a broken function
the moment it's broken, not weeks later when a feature built on top of it fails).

---

### Step 2 — What a Function Component Actually Is

UpSkillOS's UI is built with **React** — a JavaScript library where the UI is
described as a tree of **components**. A component is, at its simplest, just a
JavaScript function with one special rule: it returns a description of what should
appear on screen, written in a syntax called **JSX**.

#### Concept lab: the smallest possible component

This code is disposable too — a throwaway file, never part of the project, deleted
at the end of this step.

Create `src/labs/_scratch/Greeting.tsx` (the `_scratch` folder name matters: it
starts with an underscore, a convention meaning "not real, temporary, safe to
delete" — you'll delete the whole folder in a moment):

```typescript
export default function Greeting() {
  return <h1>Hello from a real component</h1>
}
```

**Walking through every symbol on that first line:** `export` makes this function
importable from other files — without it, `Greeting` would only exist inside this
one file, invisible everywhere else. `default` means this is *the* thing this file
exports when nothing more specific is asked for — a file can have many named exports
but at most one `default`. `function Greeting()` is an ordinary JavaScript function
declaration, named `Greeting`, taking no parameters (the empty `()`). Nothing about
this line is React-specific yet — it's plain JavaScript/TypeScript syntax, doing
exactly what it would do in any other function.

**The second line is where JSX appears:** `<h1>Hello from a real component</h1>`
looks like HTML, but it's not HTML — it's **JSX**, a syntax extension that lets you
write UI structure directly inside TypeScript/JavaScript code. It gets transformed
(by Vite, before your browser ever sees it) into plain function calls that build up
a description of the UI as data — you never write those function calls yourself,
JSX is the readable shorthand for them. `<h1>...</h1>` describes one HTML heading
element containing the text "Hello from a real component." Because this function
`return`s that JSX, calling `Greeting()` (which React does for you, not code you
write directly) produces a description of "one `<h1>` with this text" — that
description is what React turns into real, visible DOM.

Now prove it renders. Temporarily add one line near the top of
`src/pages/HomePage.jsx` (you will remove this in a moment — it's a throwaway probe,
not a real change to that file):

```typescript
import Greeting from '../labs/_scratch/Greeting.tsx'
```

And temporarily render it anywhere inside that file's JSX, for example right after
its opening tag — anywhere you can see it:

```typescript
<Greeting />
```

**What `<Greeting />` means:** this is JSX again, but now referring to *your*
component instead of a built-in HTML tag like `<h1>`. The rule that distinguishes
the two: JSX tags starting with a **lowercase** letter (`<h1>`, `<div>`) are treated
as real HTML elements. JSX tags starting with an **uppercase** letter (`<Greeting>`)
are treated as references to a component you defined — this is exactly why
`Greeting` was capitalized and why every component you'll write in this app is too.
The self-closing `/>` (instead of `<Greeting></Greeting>`) is just a shorthand for
"this element has no children" — identical to `<img src="..." />` in HTML.

Save both files. With `npm run dev` running, open the app in your browser and look
at the home page. **Expected output:** the words "Hello from a real component"
appear as a real, visible heading somewhere on the page you already know.

That's the entire loop: a function, returning JSX, imported and referenced by
another file, rendered as real pixels in a real browser. Everything else in React —
state, props, effects, the whole ecosystem — is built on top of exactly this loop
and nothing more exotic than it.

**Now remove the probe:** delete the `import Greeting ...` line and the
`<Greeting />` line from `HomePage.jsx`, and delete the entire
`src/labs/_scratch/` folder. Confirm the home page looks exactly like it did before
you started. This was a disposable experiment; it leaves no trace in the project.

**CS lens:** A component is a **pure function of its inputs to a UI description** —
call it, get back a description of what should be on screen. This is the same shape
as any pure function (`double(value)` from Step 1, or `Math.sin(x)`): given the same
inputs, it always produces the same output, with no hidden side effects. React
components can *have* side effects (you'll meet `useState` and `useEffect` in a
later lesson), but the core rendering function itself — "given my current inputs,
what should be on screen" — is meant to stay pure.

**SE lens:** This is **composition** — building complex UI out of small, named,
independently-understandable pieces, the same way a large program is built from
small, independently-understandable functions rather than one enormous one. `App`
is built from `AppShell`, which is built from `HomePage` or whatever page is active,
which is built from smaller pieces still. You just added one new leaf to that tree,
temporarily, to prove you understand how a leaf gets there.

**Recognition — "small named pieces composed into a whole" recurs in:** Unix's
"do one thing well" philosophy (small programs piped together), a car's parts list
(engine, transmission, chassis — each independently designed, then assembled),
database views built from smaller queries, and every design pattern under the
umbrella of "composition over inheritance."

---

### Step 3 — Naming the Shape of a Component's Inputs: Interfaces

Real components almost always need to *receive* information from whoever renders
them — the `Greeting` component above always says the exact same fixed sentence,
which isn't very useful. Components receive input through **props** (short for
"properties"), and in TypeScript, the shape of those props is described with an
**interface**.

#### Concept lab: a typed prop, and what happens when you violate it

Disposable again — same rule, deleted when this step ends.

Create `src/labs/_scratch/Announcement.tsx`:

```typescript
interface AnnouncementProps {
  message: string
}

export default function Announcement({ message }: AnnouncementProps) {
  return <p>{message}</p>
}
```

**`interface AnnouncementProps { message: string }`:** an `interface` is a named
type describing the shape an object must have. This one says: anything claiming to
be `AnnouncementProps` must have a field called `message`, and that field must be a
`string`. This exists only at compile time — after Vite compiles this file to plain
JavaScript, the `interface` disappears entirely; it leaves no trace in the code that
actually runs in the browser. Its entire job is catching mistakes before that point,
exactly like `double(value: number)` in Step 1.

**`function Announcement({ message }: AnnouncementProps)`:** the parameter is
written as `{ message }` — this is **destructuring**, a shorthand meaning "the
argument passed in is an object; immediately pull its `message` field out into a
local variable also called `message`, instead of writing `props.message` every time
it's needed." The `: AnnouncementProps` after the closing `}` types that whole
destructured parameter — TypeScript checks that whatever object gets passed in
actually has a `message` field of type `string`.

**`<p>{message}</p>`:** inside JSX, curly braces `{ }` **escape back into
JavaScript** — anything inside them is evaluated as a normal expression, and its
result is inserted into the UI as text. `{message}` inserts the value of the
`message` variable. This is different from `<p>message</p>`, which would render the
literal five letters "message" — the braces are what make it a variable reference
instead of literal text.

Now render it, the same throwaway-probe way as Step 2 — temporarily in
`HomePage.jsx`:

```typescript
import Announcement from '../labs/_scratch/Announcement.tsx'
// ...
<Announcement message="This prop is fully typed." />
```

Run it. **Expected output:** the sentence "This prop is fully typed." appears on the
page, coming from the `message` prop you passed in — change the string and it
changes what renders, proving the value really is flowing through the prop, not
hardcoded.

Now break it on purpose. Change the call to:

```typescript
<Announcement message={42} />
```

**Expected output:** your editor (and `tsc`) shows an error immediately, before you
even save and reload:

```
Type 'number' is not assignable to type 'string'.
```

**What that proves:** exactly the same guarantee as Step 1's `double`, now applied
to a component. `AnnouncementProps` said `message` must be a `string`; passing `42`
(a `number`) violates that contract, and TypeScript refuses it before any code runs.
Without the `interface`, this would have silently rendered the number `42` as text —
not a crash, just quietly wrong, exactly the kind of bug that's hardest to notice.

Fix the call back to a string, confirm it renders correctly one more time, then
**delete `src/labs/_scratch/Announcement.tsx` and its import/usage in
`HomePage.jsx`**, restoring that file to exactly its original state.

**CS lens:** `AnnouncementProps` is a **contract** — a formal, checked agreement
about what data crosses a boundary (here, the boundary between whoever renders
`<Announcement />` and the component itself). TypeScript's `interface` is one
concrete tool for writing that contract down in a form the computer can verify.

**SE lens:** This is the same **fail fast, fail loud** principle from Step 1, now
applied at a component boundary instead of a function boundary — and it's also an
early example of **minimizing the public surface**: `AnnouncementProps` states
precisely and only what `Announcement` needs from the outside world. Anyone using
this component doesn't need to read its internals to know how to call it correctly
— the interface *is* the documentation, and it's enforced, not just suggested in a
comment that could silently go stale.

**Recognition — typed contracts at a boundary recur in:** function signatures in
every statically typed language (Java, C#, Rust), a REST API's documented request
body shape, a database table's column types and constraints, and a shipping
container's standardized dimensions (any port in the world can handle it because the
shape is a guaranteed, checked contract, not a suggestion).

---

### Step 4 — The Real Project Code: `FlutterPlaygroundLab.tsx`

Everything above was disposable, deleted, proven-then-removed. This is different —
this file is written once and stays, becoming a real, permanent part of UpSkillOS.

Create the real folder: `src/labs/flutter-playground/`. Inside it, create
`FlutterPlaygroundLab.tsx`:

```typescript
interface FlutterPlaygroundLabProps {
  onBack?: () => void
  onClose?: () => void
}

export default function FlutterPlaygroundLab({ onBack, onClose }: FlutterPlaygroundLabProps) {
  const close = onBack ?? onClose

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      {close && (
        <button
          onClick={close}
          className="absolute left-4 top-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
        >
          Labs
        </button>
      )}
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
        Flutter Playground
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Coming soon — a live, editable Flutter/Dart editor, right here.
      </p>
    </div>
  )
}
```

**Walking through the new pieces, one at a time:**

`interface FlutterPlaygroundLabProps { onBack?: () => void; onClose?: () => void }`
— same shape as `AnnouncementProps` in Step 3, with one new piece of syntax: the `?`
right after `onBack` and `onClose`. That marks the field **optional** — a value of
this type is allowed to omit `onBack` entirely, and TypeScript won't complain. Without
the `?`, every caller would be *required* to pass it. `() => void` is a **function
type**: `()` says this function takes no parameters, `=> void` says it returns
nothing meaningful (`void` is TypeScript's way of saying "don't use this function's
return value, it's not designed to have one — usually because it exists only for its
side effect, like closing a window").

`const close = onBack ?? onClose` — `??` is the **nullish coalescing operator**,
which you already met briefly in the `lesson-engine-autofind` lesson set if you've
read it, and which is explained fully here regardless: it evaluates to its left side
unless that left side is `null` or `undefined`, in which case it evaluates to the
right side instead. `close` becomes whichever of `onBack`/`onClose` was actually
provided (or `undefined`, if neither was). **Why both exist at all, instead of one
name:** you'll see in Step 5 that this app's windowing system calls whichever
callback prop a lab component happens to accept — some existing labs in this
codebase were written expecting `onBack`, others `onClose`, and accepting both here
means this component works correctly no matter which convention the caller uses,
instead of silently doing nothing if the "wrong" one was passed.

`{close && ( ... )}` — inside JSX, `&&` is a common **conditional rendering**
pattern: JavaScript's `&&` operator evaluates its left side first; if that's
"falsy" (here, `undefined` — no close handler was provided), it stops immediately
and evaluates to `undefined`, and JSX simply renders nothing for `undefined`. If the
left side is truthy (a real function was provided), `&&` evaluates and returns the
right side — the button JSX — which then renders. This is how the "Labs" back button
only appears when there's actually somewhere for it to go back to.

`className="..."` — these are **Tailwind CSS utility classes**, the same styling
system used throughout this app (you can see the exact same pattern in
`src/labs/decomp-lab/DecompLab.jsx` or any other recently-built lab). Each class
name is a tiny, single-purpose CSS rule: `flex` turns on flexbox layout, `h-full
w-full` fills the available space, `items-center justify-center` centers content
both ways, `dark:bg-slate-950` applies only when the app is in dark mode. This
lesson doesn't re-derive Tailwind from scratch — the classes here do exactly what
their names say — but every class is explained in full the first time this lesson
set uses something more unusual than a plain layout/color utility.

---

### Step 5 — Connecting It to the App: the `index.jsx` Entry Wrapper

A `.tsx` file sitting in `src/labs/` isn't reachable by anything yet — nothing
imports it, nothing knows it exists. UpSkillOS discovers labs through a specific,
existing mechanism, and you're about to plug into it exactly the way every other lab
in this codebase already does.

Create `src/labs/flutter-playground/index.jsx`:

```javascript
import FlutterPlaygroundLab from './FlutterPlaygroundLab.tsx'

export const meta = {
  label: 'Flutter Playground',
  emoji: '🦋',
  color: 'sky',
  kind: 'lab',
  subject: 'Web Dev',
  desc: 'A live, editable Flutter/Dart code editor embedded right in the app, framed to look like a phone. Currently a placeholder — the real editor comes in a later lesson.',
  tags: ['Flutter', 'Dart', 'Mobile', 'Embed'],
  cover: { grad: 'from-sky-600 via-blue-700 to-indigo-950', mark: '🦋', sub: 'Flutter · Dart · Live Preview' },
}

export default function FlutterPlaygroundEntry({ onBack }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <FlutterPlaygroundLab onBack={onBack} />
    </div>
  )
}
```

**Why this file is plain `.jsx`, not `.tsx`, when everything else in this lesson
has been TypeScript:** the mechanism that finds every lab (`src/labs/labLoader.js`)
uses a Vite feature called `import.meta.glob('./**/index.jsx')` — a pattern that
only matches files literally named `index.jsx`. This is a real, current limitation
of this codebase, not a mistake in this lesson: the *entry point* file must keep the
`.jsx` extension so the loader's pattern finds it, while everything that entry point
imports — `FlutterPlaygroundLab.tsx` — is free to be real TypeScript. This is the
same "thin wrapper, real internals" shape used by every lab built this way in this
repo (`src/labs/decomp-lab/index.jsx` is one you can open right now and compare).

**`import FlutterPlaygroundLab from './FlutterPlaygroundLab.tsx'`** — an import
statement is a **dependency declaration**: this file is stating, explicitly, that it
needs `FlutterPlaygroundLab.tsx`'s default export to do its job, and nothing else.
`./` means "look in this same folder" — as opposed to a **bare specifier** like
`'react'`, which means "look in `node_modules` for an installed package."

**`export const meta = { ... }`** — a plain JavaScript object, describing this lab
for every part of the app that needs to *list* it without opening its full window:
the Explore page's cards, the Start Menu's Labs tab, search results. `label` is the
display name. `emoji` and `cover` control how its card looks. `kind: 'lab'`, `color`,
`subject`, and `tags` are read by the app's Explore-page filtering and grouping
logic — using existing values (`'lab'`, `'Web Dev'`) rather than inventing new ones
keeps this lab consistent with every other one already in the app.

**`export default function FlutterPlaygroundEntry({ onBack }) { ... }`** — the
actual component the app renders when this lab is opened. It wraps your real
`FlutterPlaygroundLab` component in a plain `<div>` sized to `h-full w-full`, and
passes `onBack` straight through. This two-layer shape — a thin `Entry` wrapper
around the real component — exists because the windowing system (next paragraph)
expects a very specific, minimal contract from whatever it renders, and keeping that
contract's implementation in a tiny wrapper file means `FlutterPlaygroundLab.tsx`
itself never has to know anything about how it gets opened.

---

### Step 6 — Wiring the Registry Entry

One more file needs one small addition: `src/labs/registry.js`. This file is a
single JavaScript array — every lab in the app is one object in that array,
describing where it lives and how to reach it directly by URL. Open it and add a new
entry (anywhere in the array; alphabetical-ish grouping by subject is the loose
existing convention, but nothing enforces it):

```javascript
{
  key: 'flutter-playground',
  label: 'Flutter Playground',
  emoji: '🦋',
  color: 'sky',
  kind: 'lab',
  subject: 'Web Dev',
  desc: 'A live, editable Flutter/Dart code editor embedded right in the app, framed to look like a phone. Currently a placeholder — the real editor comes in a later lesson.',
  path: '/lab/flutter-playground',
  tags: ['Flutter', 'Dart', 'Mobile', 'Embed'],
  cover: { grad: 'from-sky-600 via-blue-700 to-indigo-950', mark: '🦋', sub: 'Flutter · Dart · Live Preview' },
},
```

**Why this looks almost identical to `index.jsx`'s `meta` object:** it is almost the
same information, on purpose — this repeats the "same fact typed in more than one
place" shape you may recognize from the `lesson-engine-autofind` lesson set, if
you've read it (and if you haven't: it's the same idea — two places describing the
same lab, and nothing currently keeps them in sync automatically). `registry.js` is
what every part of the app reads to *list and search* labs without loading their
code (it's a small, cheap file to load; `index.jsx` isn't loaded until you actually
open the lab). `key` here must exactly match this folder's name
(`flutter-playground`) — that's the string `labLoader.js` uses to find
`src/labs/flutter-playground/index.jsx` when the lab is opened. `path` is the direct
URL this lab lives at.

---

### Step 7 — Run It

With all three files saved, start (or confirm) the dev server:

```
npm run dev
```

Open the printed `localhost` address in your browser. Find **Flutter Playground** —
in the Explore page under Web Dev, or in the Start Menu's Labs list, or by typing
"flutter" into search. Click it.

**Expected output:** a window opens (draggable, resizable from its bottom-right
corner, maximizable — the same window chrome every other lab in this app already
has, for free, because this window system doesn't know or care what's inside it),
showing the heading "Flutter Playground" and the message "Coming soon — a live,
editable Flutter/Dart editor, right here." Click the "Labs" button in the top-left —
the window closes and you're back where you started.

That is a real, permanent, working addition to UpSkillOS. Nothing about it is a
simulation or a preview of a future lesson — it is the actual first slice of the
actual feature, visible and running, right now.

---

## Connect the Pieces

Three files, three jobs, matching a pattern this app already uses for every lab:

`FlutterPlaygroundLab.tsx` is the **real component** — everything this lab actually
does eventually lives here, and it knows nothing about how it gets opened. `index.jsx`
is the **entry point** — the one file `labLoader.js`'s `import.meta.glob('./**/index.jsx')`
pattern can find, wrapping the real component in the minimal shape the windowing
system expects, and exporting `meta` for anything that needs to describe this lab
without opening it. `registry.js`'s new entry is the **searchable index** — a
lightweight, always-loaded description used by the Explore page, the Start Menu, and
search, so the app never has to load every lab's actual code just to show a list of
cards.

This is the exact three-piece shape used by `src/labs/decomp-lab/`, the
`image-lab-wip`/`image-lab` pair, and every other lab in this codebase — you didn't
invent a new pattern, you correctly reproduced an existing, proven one.

---

## What Breaks Without This

Skip the `registry.js` entry and everything else works — you can navigate directly
to `/#/lab/flutter-playground` and it opens fine, because `labLoader.js` finds
`index.jsx` by folder name, not through `registry.js` at all. But the lab becomes
**unreachable through the UI**: no card appears in Explore, the Start Menu, or
search, because all three of those read `registry.js`'s array, not the filesystem.
The code exists and technically works; nobody without the exact URL memorized will
ever find it. This is a real, quiet failure mode — nothing crashes, nothing errors,
the feature simply doesn't exist from a user's point of view.

Skip the `key: 'flutter-playground'` matching the folder name exactly (a typo, say,
`'flutter-play-ground'`) and clicking the card in Explore navigates to
`/lab/flutter-play-ground`, which `labLoader.js`'s glob lookup can't match to any
real folder — `getLabEntry` returns `null`, and the app shows its "lab not found"
state instead of your component.

---

## Definition of Done

- [ ] `src/labs/flutter-playground/FlutterPlaygroundLab.tsx` exists, is real
      TypeScript (`interface` for its props, no `any` types), and renders a
      heading and a "coming soon" message
- [ ] `src/labs/flutter-playground/index.jsx` exists, imports the `.tsx` file, and
      exports both `meta` and a default `FlutterPlaygroundEntry` component
- [ ] `src/labs/registry.js` has a new entry with `key: 'flutter-playground'`
      matching the folder name exactly
- [ ] Clicking "Flutter Playground" from Explore, the Start Menu, or search opens a
      real window showing your placeholder content
- [ ] You can explain, without looking back at this lesson, what `interface`,
      `?` on a prop, `??`, and `{condition && <jsx/>}` each do
- [ ] You reran the Step 1 concept lab's broken version yourself and saw the real
      `tsc` error, not just read about it
- [ ] All three `_scratch` probes from Steps 2 and 3 are deleted, and
      `HomePage.jsx` is back to its original, unmodified state
- [ ] `git commit` with a message explaining *why*, not just what — for example:
      "Add Flutter Playground as a new lab shell — a typed, empty placeholder
      component wired into the existing registry/index.jsx/labLoader pattern,
      as the first vertical slice before the real DartPad embed lands"
