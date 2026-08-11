# Lesson 17: A Second Pair of Eyes Before It Ever Runs

**What you will build:** a TypeScript version of `magnitude`, with a real
type annotation and an `interface` describing what a 2D vector actually
looks like — and a genuine compiler error, caught before the code ever
runs, for a mistake that silently produced `NaN` in every JavaScript
lesson so far. The transferable problem: every "what breaks without this"
section in this curriculum has demonstrated a bug that ran without
complaint — a typo'd field, a swapped sign, a misspelled `type`. None of
those needed a human to notice; every one of them could have been caught
automatically, before the code ever ran, by a tool whose entire job is
checking that the shapes of values match what functions expect.

**What you need to know first:** everything from Arc 0–2 — this lesson
starts migrating that existing, understood code into TypeScript, rather
than teaching TypeScript syntax against unfamiliar examples.

---

## Concept Unit: The Problem TypeScript Solves — Reproducing a Real Bug

### The Problem

This project has, so far, caught every one of its own bugs by deliberately
constructing them and observing the failure — a typo'd `type` field, a
sign error in a rotation matrix, a translate-back with the wrong sign.
Every single one of those ran without a single error message. Before
introducing a new tool, it's worth being precise about exactly what
problem it solves — reproduced fresh, one more time, in the plainest
possible form.

### By Hand

`magnitude`, from Lesson 8, expects an object with `x` and `y`. A simple
typo — `yy` instead of `y` — produces an object missing the property the
function actually needs:

```
v = { x: 3, yy: 4 }

magnitude(v) computes:
  v.x = 3
  v.y = undefined   (there is no "y" property, only "yy")
  undefined * undefined = NaN
  sqrt(NaN) = NaN
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none — this unit reproduces an existing gap in
  plain JavaScript; the fix begins in the next unit.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** `magnitude`, from Lesson 8

### Isolating the Concept

```js
function magnitude(v) { return Math.sqrt(v.x * v.x + v.y * v.y); }

const v = { x: 3, yy: 4 };
console.log("magnitude(v) with typo:", magnitude(v));
```

Real output:

```
magnitude(v) with typo: NaN
```

What this proves, one final time in plain JavaScript before this
curriculum leaves it behind for the engine's core logic: nothing about
calling `magnitude(v)` looked wrong. No error, no warning — just a
number, `NaN`, that would need to surface somewhere much later (a shape
failing to render, a toolpath calculation going wrong) before anyone
noticed anything was amiss at all.

### Discarding

Discarded — this reproduction is the final plain-JS version of this bug
class in this curriculum; from here forward, this project's core math
migrates to TypeScript specifically so this category of mistake gets
caught differently.

### CS Lens

Catching a class of error automatically, before a program runs, rather
than relying on a human noticing a wrong output, is called **static
analysis** — genuinely foundational to why typed languages exist at all.

```
Also recognized in: a compiler rejecting a Java program that assigns a
String to an int variable, a linter flagging an unused variable before
code review, a spell-checker underlining a typo before a document is
sent, an electrical inspector checking wiring against code before power
is ever switched on
```

### SE Lens

The alternative not chosen — write more tests instead of adopting types —
is a real, valid strategy, and not one this project is abandoning; tests
verify *behavior* (does this function produce the right output for this
input), which is different from what a type system verifies (does this
value even have the right shape to be passed here at all). The real
tradeoff: a test only catches a bug for the specific inputs it happens to
check; a type annotation catches an entire *category* of mistake — every
possible object missing a `y` property — checked automatically, everywhere
that function is ever called, without writing a single test case for it.

### Run It

Real output already shown above.

### Connecting

The exact same mistake, reproduced one more time, is what the rest of this
lesson proves TypeScript catches automatically — not hypothetically, but
with a real compiler run.

---

## Concept Unit: Setting Up TypeScript

### The Problem

Before any code can be type-checked, the actual TypeScript compiler needs
to exist in this project and be runnable — nothing so far in this
curriculum has needed anything beyond a browser and Node.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** installs the `typescript` package; no project source
  files change yet
- **Change type:** configure
- **Location:** project root
- **Dependencies:** Node and npm (already used for verification throughout
  this curriculum, though not yet installed *into* the project itself)

### The New Code

```
npm install --save-dev typescript
```

### Isolating the Concept

```
$ tsc --version
```

Real output:

```
Version 7.0.2
```

What this proves: `tsc`, the TypeScript compiler, is a real, runnable
program — not a browser feature, not a bundler plugin, but a standalone
tool that reads `.ts` files and checks them, independent of anything
built so far.

### Discarding

Not applicable — this unit installs a real tool, not throwaway code.

### Mechanical Walkthrough

- **`npm install --save-dev typescript`** — (a) first appearance of the
  `--save-dev` flag on `npm install` — installs a package as a
  **development dependency**: something needed to *build* this project
  (compiling `.ts` to `.js`) but not something the finished, running page
  itself needs bundled into it. `typescript` never runs in the browser;
  it only runs during development, to produce plain `.js` the browser
  actually loads.

### CS Lens

Not a new hard concept — this is tooling setup; its significance is what
the rest of this lesson demonstrates.

### SE Lens

The alternative not chosen: install `typescript` globally
(`npm install -g typescript`, which is in fact how this lesson's own
verification examples installed it, for convenience in this sandbox) and
rely on whatever global version happens to be present. The real risk: a
project installed globally has no record, anywhere in the project itself,
of which TypeScript version it was built and tested against — a
teammate, or a future version of this same project on a different
machine, could silently use a different compiler version with different
behavior. `--save-dev` records the exact dependency in the project's own
`package.json`, the same file Arc 8 (Node & Tooling) will make full use
of.

### Commands Needed

```
$ npm install --save-dev typescript
$ npx tsc --version
```

`npx` runs a locally-installed package's command-line tool without
needing it installed globally — the more correct way to invoke `tsc` once
it's a project dependency rather than a global install.

### Run It

Real output already shown above.

### Connecting

The compiler exists — the next unit gives it something real to check.

---

## Concept Unit: Type Annotations — Catching the Bug for Real

### The Problem

`tsc` being installed doesn't yet check anything — a plain `.js` file
has no type information for it to verify against. `magnitude` needs to be
rewritten, in a `.ts` file, with explicit annotations stating what shape
its input is supposed to have.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** a new file, `magnitude.ts` (this lesson keeps the
  migration scoped to one function, as a first, deliberately small step —
  the rest of `script.js`'s functions migrate across the remaining
  lessons of this arc)
- **Change type:** add (new file)
- **Location:** project root
- **Dependencies:** none new

### The New Code

```ts
function magnitude(v: { x: number; y: number }): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
```

### Isolating the Concept

The exact typo bug from Unit 1, rewritten in this typed function, and
compiled — not run, *compiled* — to see what `tsc` reports before a
single line of it executes:

```ts
function magnitude(v: { x: number; y: number }): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

const v = { x: 3, yy: 4 };  // same typo as Unit 1
console.log(magnitude(v));
```

```
$ tsc --noEmit magnitude.ts
```

Real output:

```
magnitude.ts(11,23): error TS2741: Property 'y' is missing in type '{ x: number; yy: number; }' but required in type 'Vector2'.
```

*(This exact error message comes from the version of this check that also
introduces the `Vector2` interface, covered in the next unit — shown here
because it's the genuine, complete compiler output this exact mistake
produces, not a simplified paraphrase of it.)*

What this proves: the identical mistake that silently produced `NaN` in
Unit 1 is now a **compile error** — `tsc` refuses to even finish checking
the file, and reports exactly which property is missing, on exactly which
line, before this code has run even once. This is called a **type
annotation** — `v: { x: number; y: number }` tells the compiler what shape
`v` is required to have, and `: number` after the parameter list states
what the function itself returns.

The fix, and confirmation it compiles clean:

```ts
const v: { x: number; y: number } = { x: 3, y: 4 };
console.log(magnitude(v));
```

```
$ tsc --noEmit magnitude_fixed.ts && echo "COMPILED CLEAN, NO ERRORS"
```

Real output:

```
COMPILED CLEAN, NO ERRORS
```

And, compiled to real JavaScript and actually run:

```
$ tsc magnitude_fixed.ts --outDir . && node magnitude_fixed.js
```

Real output:

```
5
```

The correct answer — `magnitude((3,4))` is `5`, exactly matching Lesson
8's own by-hand Pythagorean derivation — reached after compiling clean,
with no `NaN` possible for this particular mistake ever again.

### Discarding

The inline `{ x: number; y: number }` annotation is discarded in favor of
a named `interface`, covered next — repeating that shape everywhere a
vector or point is used would be a real, ongoing SE concern the next unit
addresses directly.

### Mechanical Walkthrough

- **`v: { x: number; y: number }`** — (a) first appearance. An inline
  **object type annotation** — describes the required shape of `v`
  directly, without a separate named type.
- **`: number` (after the parameter list)** — (a) first appearance of a
  **return type annotation** — states what the function itself returns,
  checked against every `return` statement inside it.
- **`x: number`, `y: number`** — (a) first appearance of `number` as a
  **type** — one of TypeScript's built-in primitive types, matching every
  numeric value this project has used since `Math.sqrt` in Lesson 8.

### CS Lens

Not yet fully expanded — annotations here are inline; the next unit's
`interface` is where this concept gets its full, reusable form and its
own CS lens.

### SE Lens

The alternative not chosen: skip type annotations and rely purely on
careful reading and testing to catch shape mismatches, as every lesson in
Arc 0–2 has done so far. The real, now-proven cost of that approach: every
single "what breaks without this" section in this curriculum found its bug
by *deliberately* constructing it and running the code to observe the
failure. A type annotation catches the same class of mistake automatically,
for every future caller of a function, without needing anyone to think to
test for it.

### Run It

Real output already shown above.

### Connecting

One function is now genuinely protected against this exact bug — the
final unit gives this shape a real, reusable name, and is honest about
what that name does and doesn't protect against.

---

## Concept Unit: Interfaces

### The Problem

Writing out `{ x: number; y: number }` inline, on every function this
project has that takes a point or a vector — and this project has eight
such functions from Arc 1 alone — would be real, repeated, error-prone
duplication. This shape deserves a name.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `magnitude.ts` (rewritten to use a named interface)
- **Change type:** refactor
- **Location:** top of the file
- **Dependencies:** none new

### The New Code

```ts
interface Vector2 {
  x: number;
  y: number;
}

function magnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
```

### Isolating the Concept

This is, in fact, the exact code already compiled in the previous unit —
the `TS2741` error shown there was produced by this named-interface
version, not the inline-object version. Confirmed again here, deliberately
isolated to just the interface's own declaration:

```ts
interface Vector2 {
  x: number;
  y: number;
}

const good: Vector2 = { x: 1, y: 2 };
console.log("good compiles:", JSON.stringify(good));
```

```
$ tsc --noEmit interface_check.ts && echo "compiled clean"
```

(This check, run as part of preparing this lesson, compiled clean with no
errors — confirming `interface` declarations themselves introduce no
runtime behavior at all; they exist purely for the compiler.)

**An honest limitation, checked directly rather than assumed:** does
naming two *different* interfaces — `Point` and `Vector`, both with
identical `x`/`y` fields — actually stop the Lesson 7 mistake of adding
two points together?

```ts
interface Point {
  x: number;
  y: number;
}

interface Vector {
  x: number;
  y: number;
}

function addVectors(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y };
}

const cornerA: Point = { x: 100, y: 50 };
const cornerB: Point = { x: 300, y: 200 };

const result = addVectors(cornerA, cornerB);  // passing two Points where Vectors are expected
console.log(result);
```

```
$ tsc --noEmit pointvector.ts
$ echo "exit code: $?"
```

Real output:

```
exit code: 0
```

What this proves, honestly: `tsc` compiles this with **zero errors** —
passing two `Point`-typed values into a function expecting `Vector`s is
accepted without complaint, even though the whole point of separate
interface names was to keep them distinct. This is real, verified
behavior, not a guess: TypeScript uses **structural typing** — two types
with identical fields are considered interchangeable, regardless of their
names, because the compiler checks *shape*, not the label attached to it.
Interfaces named `Point` and `Vector` document intent for a human reader,
but do not, by themselves, enforce Lesson 7's point-vs-vector distinction
the way this unit's earlier `Vector2` example enforced "has an `x` and a
`y`."

### Discarding

Discarded — `Point`/`Vector`/`cornerA`/`cornerB` here are a deliberate,
isolated check of a real limitation, not permanent project code; the
limitation itself, though, is real and carries forward as acknowledged
debt.

### Mechanical Walkthrough

- **`interface Vector2 { x: number; y: number; }`** — (a) first
  appearance. Declares a **named type** — anywhere `Vector2` is written
  afterward, it means exactly this required shape, without repeating it.
- **`function magnitude(v: Vector2): number`** — (b) a concept
  reappearing: the same parameter/return-type annotation pattern from the
  previous unit, now referencing the named interface instead of an inline
  shape.

### CS Lens

Structural typing — matching by shape rather than by declared name — is a
genuinely significant design choice, worth naming with real contrast.

```
Also recognized in: Python's duck typing ("if it walks like a duck...",
an informal, unenforced version of the same idea), Go's interfaces (also
structurally satisfied, with no explicit "implements" keyword), contrasted
directly against nominal typing in languages like Java or C#, where a
class must explicitly declare which interfaces it implements by name —
two identically-shaped classes there would NOT be interchangeable the way
Point and Vector are here
```

### SE Lens

The alternative not chosen: TypeScript does offer a real technique for
exactly this situation — a "branded" or "nominal" type, adding a small,
otherwise-unused marker field (like a literal `kind: "point"` versus
`kind: "vector"`) specifically to defeat structural matching and force
the two to be genuinely incompatible. That's real, valid future work for
this project — deliberately not built in this lesson, because it's a
solution to a problem this unit exists to first *prove is real*, not
assume. The honest state of this project, right now: `Vector2`-style
interfaces genuinely catch missing/misnamed fields (proven in the previous
unit), but do not yet catch the *semantic* point-vs-vector mixup from
Lesson 7 — real, named, acknowledged debt, in the same spirit as the
unguarded zero-vector cases from Lessons 8 and 9.

### Commands Needed

None new beyond `tsc`, already covered.

### Run It

Real output already shown above.

### Connecting

`Vector2` is now a real, reusable, compiler-enforced shape — with an
honestly-tested boundary on exactly what it does and doesn't protect
against, setting up exactly what Lesson 18's generics and structural
typing work digs into further.

---

## Closing

### Connect the Pieces

One mistake, `{ x: 3, yy: 4 }`, traced through the whole lesson. In plain
JavaScript (Unit 1), it silently computed `NaN`. Once `magnitude` gained a
type annotation (Unit 3), the identical mistake became a real compiler
error, `TS2741`, naming the exact missing property. Once that annotation
became a named `Vector2` interface (Unit 4), the same protection carried
forward under a reusable name — while a second, honestly-tested check in
that same unit proved this protection has a real boundary: it catches a
missing field, but not two identically-shaped types used in the wrong
semantic role.

### What Breaks Without This

Reusing the fixed, typed version, but reverting to a value with the exact
same typo one more time — the single clearest before/after of this entire
lesson:

```js
// plain JS (Unit 1): runs, produces NaN, no warning
console.log("plain JS:", (function(v) { return Math.sqrt(v.x*v.x + v.y*v.y); })({ x: 3, yy: 4 }));
```

```ts
// TypeScript (Unit 3/4): refuses to compile at all
// tsc --noEmit reports: error TS2741: Property 'y' is missing...
```

The plain JS version "succeeds" — silently, incorrectly. The TypeScript
version fails loudly, before the program ever runs, with a message
pointing at the exact problem. This is the entire case for migrating the
rest of this project's engine into TypeScript, starting with this lesson
and continuing through the remainder of Arc 3.

### Exercises

- Write an interface `Shape` matching one of Arc 0's tagged shape objects
  (`{ type: "point", x: number, y: number }`), and confirm `tsc` rejects
  an object missing the `type` field.
- Add type annotations to `dot` and `cross` from Lessons 9–10, using
  `Vector2` for both parameters and `number` as the return type. Confirm
  they compile clean against correctly-typed inputs.
- Deliberately misspell a property when calling your newly-typed `dot` or
  `cross`, and read the exact `tsc` error message it produces — compare
  its phrasing to this lesson's `TS2741` example.

### Definition of Done

- [ ] TypeScript is installed as a dev dependency, and `npx tsc --version`
      runs successfully
- [ ] A `Vector2` interface exists and `magnitude` is annotated with it
- [ ] The typo bug from Unit 1 has been reproduced as a real, captured
      `tsc` compiler error, not just described
- [ ] You can explain, without looking, one thing TypeScript's structural
      typing does catch and one thing it does not, for this project's
      Point/Vector distinction specifically
- [ ] Commit:

  ```
  git add package.json package-lock.json magnitude.ts
  git commit -m "Introduce TypeScript: type annotations and Vector2 interface

  magnitude.ts reproduces the exact typo bug ({x:3, yy:4}) that silently
  produced NaN in plain JS, and shows it as a real tsc compile error
  instead. Also honestly tested a real limitation: TypeScript's structural
  typing does not, by itself, catch Point/Vector values being swapped,
  since two identically-shaped interfaces are structurally interchangeable
  - named as real, acknowledged debt for later nominal-typing work."
  ```
