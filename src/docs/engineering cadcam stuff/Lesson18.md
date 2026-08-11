# Lesson 18: Same Function, Many Shapes, No Information Lost

**What you will build:** a generic version of `translateShape` that
preserves whatever specific shape type it's given (not just a plain
`Vector2`), and an overloaded `vectorLength` function that accepts either
one vector or two points. The transferable problem: Lesson 17's
`Vector2` interface works, but every function written to use it so far
has one real weakness — it forgets anything about its input beyond `x`
and `y`. A shape carrying a `label`, a `type` tag, or any other extra
field loses that information the moment it passes through a plainly-typed
function. Generics fix this without giving up any of Lesson 17's
type-checking.

**What you need to know first:** Lesson 17 (Arc 3) — `Vector2`, and the
honestly-tested limitation (structural typing) this lesson builds directly
on top of.

---

## Concept Unit: Generics — Preserving a Type Through a Transform

### The Problem

`translateShape`, if typed the plain way — `(points: Vector2[], offset:
Vector2): Vector2[]` — always *returns* `Vector2[]`, no matter what more
specific type was actually passed in. Any extra information a caller's
shapes carried (Arc 0's `type` tag, or anything else) is invisible to the
type checker on the way out, even though the actual JavaScript object
still has it at runtime.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** a new file, `generics.ts`
- **Change type:** add (new file)
- **Location:** project root
- **Dependencies:** `Vector2`, from Lesson 17

### The New Code

```ts
function translateShapePlain(points: Vector2[], offset: Vector2): Vector2[] {
  return points.map((p) => ({ x: p.x + offset.x, y: p.y + offset.y }));
}
```

### Isolating the Concept

A shape with extra information beyond `x`/`y`, passed through the plainly-
typed version above, and an attempt to read that extra field back out:

```ts
interface NamedPoint extends Vector2 {
  label: string;
}

const corners: NamedPoint[] = [
  { x: 0, y: 0, label: "origin-corner" },
  { x: 100, y: 0, label: "right-corner" },
];

const translatedPlain = translateShapePlain(corners, { x: 10, y: 10 });
console.log(translatedPlain[0].label);
```

```
$ tsc --noEmit generics.ts
```

Real output:

```
generics.ts(22,32): error TS2339: Property 'label' does not exist on type 'Vector2'.
```

What this proves: even though the *actual* translated object, at runtime,
genuinely still has a `label` property (JavaScript's `.map()` callback
built a new object, but nothing erased `label` from it) — the type checker
has already forgotten it, because `translateShapePlain`'s own declared
return type is `Vector2[]`, full stop. This is a real loss of information
at the type level, not at runtime — the exact opposite of Lesson 17's bug,
where the type checker caught something the runtime silently missed; here,
the type checker itself is the thing being too narrow.

### Discarding

Discarded — `translateShapePlain` is kept only as this lesson's
"before" comparison; `NamedPoint`/`corners` are illustrative, not real
project fixtures.

### CS Lens

Preserving a value's specific type through a generic operation, rather
than widening it to some common ancestor type, is genuinely a hard concept
worth naming broadly.

```
Also recognized in: a sorting function that works on any array but keeps
each element's exact type, a database ORM's query builder returning rows
typed as your specific table's shape rather than a generic "Row" type,
a JSON deserializer that, given a target type, returns that exact type
rather than a bag of unknowns, Python's TypeVar serving the identical
purpose
```

### SE Lens

The alternative not chosen: keep functions like `translateShape` plainly
typed against `Vector2`, and have callers manually re-cast or reconstruct
extra fields after calling them. The real cost: that's exactly the kind of
repetitive, error-prone busywork Lesson 17's SE Lens already flagged
inline object types as risking — except now it would recur at every call
site that needs to preserve more than `x`/`y`, rather than being solved
once in the function's own signature.

### Run It

Real output already shown above.

### Connecting

The problem is proven real — the next unit is the actual fix: a type
parameter that lets the function say "whatever specific type you give me,
I'll give the same one back."

---

## Concept Unit: Bounded Generics — `<T extends Vector2>`

### The Problem

A generic function needs two things at once: flexibility (work with any
shape type a caller passes) and safety (still know enough about that type
to actually use `.x` and `.y` inside its own body, which every version of
`translateShape` has needed since Lesson 12).

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `generics.ts` (rewritten)
- **Change type:** refactor
- **Location:** replaces `translateShapePlain`
- **Dependencies:** `Vector2`

### The New Code

```ts
function translateShape<T extends Vector2>(points: T[], offset: Vector2): T[] {
  return points.map((p) => ({ ...p, x: p.x + offset.x, y: p.y + offset.y }));
}
```

### Isolating the Concept

The same `NamedPoint` example from the previous unit, through the generic
version this time:

```ts
const translated = translateShape(corners, { x: 10, y: 10 });
console.log(translated[0].x, translated[0].y, translated[0].label);
```

```
$ tsc --noEmit generics_fixed.ts && echo "COMPILED CLEAN"
```

Real output:

```
COMPILED CLEAN
```

And compiled and actually run:

```
$ tsc generics_fixed.ts --outDir . && node generics_fixed.js
```

Real output:

```
10 10 origin-corner
```

What this proves: `translated[0].label` compiles *and* runs correctly —
`T`, inferred here as `NamedPoint` from the actual argument passed in, is
preserved all the way to the return type. No cast, no re-declaration,
no information lost.

**Proving the bound is actually load-bearing**, not decorative — removing
`extends Vector2` entirely:

```ts
function translateShapeUnbounded<T>(points: T[], offset: Vector2): T[] {
  return points.map((p) => ({ ...p, x: p.x + offset.x, y: p.y + offset.y }));
}
```

```
$ tsc --noEmit unbounded.ts
```

Real output:

```
unbounded.ts(8,42): error TS2339: Property 'x' does not exist on type 'T'.
unbounded.ts(8,61): error TS2339: Property 'y' does not exist on type 'T'.
```

What this proves: without `extends Vector2`, `T` could be *anything* —
a string, a number, an object with no `x`/`y` at all — so the compiler
correctly refuses to let the function body assume `.x` and `.y` exist.
`extends Vector2` is what tells the compiler "whatever `T` turns out to
be, it's at least guaranteed to have these two fields" — exactly enough
information for the function body to do its job, without pinning `T` down
to *exactly* `Vector2` and losing the extra-fields benefit just proven.

### Discarding

Discarded — `translateShapeUnbounded` exists only to prove the bound
matters; it's never a real, usable version of this function.

### Mechanical Walkthrough

- **`<T extends Vector2>`** — (a) first appearance of a **generic type
  parameter**. `T` is a placeholder standing in for "whatever specific
  type the caller passes here" — determined fresh, per call, not fixed
  when the function is written. `extends Vector2` is (a) first appearance
  of a **type constraint** (or "bound") — restricts `T` to only types that
  are at least `Vector2`-shaped, which is what makes `p.x`/`p.y` legal
  inside the function body.
- **`points: T[]`** — (b) a concept reappearing: array typing, applied to
  the generic parameter instead of a fixed type.
- **`{ ...p, x: ..., y: ... }`** — (a) first appearance of the **spread
  operator** (`...`) inside an object literal — copies every property
  from `p` into the new object first, so fields like `label` survive,
  before `x` and `y` get overwritten with their translated values.

### CS Lens

Not newly expanded here — bounded generics are the direct mechanism
behind the previous unit's already-covered CS lens (type preservation);
no separate lens needed for the bound itself.

### SE Lens

The alternative not chosen: pin the parameter to the exact type `Vector2`
(no generic at all) and require every caller to manually recreate any
extra fields afterward. Already covered by the previous unit's SE Lens —
this unit's real addition is proving that the *safety* half of generics
(the bound) isn't optional convenience; without it, the function
literally cannot compile, which is the correct, safe default rather than
an inconvenience to work around.

### Run It

Real output already shown above.

### Connecting

`translateShape` now genuinely preserves whatever specific shape type it's
given — the final unit covers a different kind of flexibility: one
function, multiple genuinely different valid ways to call it.

---

## Concept Unit: Function Overloads

### The Problem

Lesson 11's `distance(a, b)` finds the length between two points; Lesson
8's `magnitude(v)` finds a single vector's own length. Both are, at heart,
"how long is this," and it would be natural for a caller to want one
function name — `vectorLength` — that accepts either a single vector or
two points, with TypeScript enforcing that only those two specific call
shapes are valid (not, say, three arguments, or one string).

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** a new file, `overloads.ts`
- **Change type:** add (new file)
- **Location:** project root
- **Dependencies:** `Vector2`, `magnitude`, `distance`

### The New Code

```ts
function vectorLength(v: Vector2): number;
function vectorLength(a: Vector2, b: Vector2): number;
function vectorLength(a: Vector2, b?: Vector2): number {
  if (b !== undefined) {
    return distance(a, b);
  }
  return magnitude(a);
}
```

> **A real naming collision, discovered while verifying this lesson:**
> this function was originally named `length`, matching the informal name
> used in this lesson's own planning. Compiling it produced a genuine,
> unexpected error — `error TS2300: Duplicate identifier 'length'`,
> pointing not at this file, but at TypeScript's own built-in browser type
> definitions (`lib.dom.d.ts`). `length` collides with a global identifier
> the DOM library already declares (the browser's `window.length`,
> counting a window's frames). This is real, first-hand evidence for
> something easy to state as folklore and easy to doubt without seeing it
> happen: a browser/DOM project's global namespace is more crowded than it
> looks, and TypeScript will catch a collision with it immediately,
> before this project ever discovers the same conflict by watching
> something behave strangely in an actual browser tab. The function is
> named `vectorLength` here specifically because of this real, verified
> collision — not a hypothetical one.

### Isolating the Concept

Both valid call shapes, run for real:

```ts
console.log("length of a single vector:", vectorLength({ x: 3, y: 4 }));
console.log("length between two points:", vectorLength({ x: 0, y: 0 }, { x: 3, y: 4 }));
```

```
$ tsc --noEmit overloads_fixed.ts && echo "COMPILED CLEAN"
$ tsc overloads_fixed.ts --outDir . && node overloads_fixed.js
```

Real output:

```
COMPILED CLEAN
length of a single vector: 5
length between two points: 5
```

Both calls compile and both produce the correct `5` — `magnitude((3,4))`
and `distance((0,0),(3,4))` are the same underlying calculation Lesson 8
and Lesson 11 already proved by hand, now reachable through one shared
name with two distinct, compiler-checked shapes.

**Proving the overload signatures actually restrict what's callable** —
a call matching neither declared shape:

```ts
console.log(vectorLength({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }));
```

```
$ tsc --noEmit overloads_bad_call.ts
```

Real output:

```
overloads_bad_call.ts(24,58): error TS2554: Expected 1-2 arguments, but got 3.
```

What this proves: only the two declared overload shapes — one argument,
or two — are valid calls; a third argument is rejected before the code
ever runs, exactly the same category of protection Lesson 17 proved for
missing object fields, now applied to a function's entire calling
convention.

### Discarding

Discarded — the bad-call example exists only to prove the overload
signatures are enforced; `vectorLength` itself is the real, permanent
function.

### Mechanical Walkthrough

- **`function vectorLength(v: Vector2): number;`** and
  **`function vectorLength(a: Vector2, b: Vector2): number;`** — (a)
  first appearance of **overload signatures** — declared with no function
  body, stating two separate, valid ways this function can be called.
- **`function vectorLength(a: Vector2, b?: Vector2): number { ... }`** —
  (a) first appearance of an **implementation signature** — the one
  actual function body, whose own parameter types (`b?: Vector2`, an
  *optional* parameter) must be broad enough to cover every overload
  declared above it, but is never itself directly callable in a way that
  bypasses the two declared shapes.
- **`b !== undefined`** — (b) a concept reappearing: `!==` strict
  inequality, the same strict-comparison family as `===` from Arc 0's
  `renderShape`, used here to detect which overload shape was actually
  used at runtime.

### CS Lens

Multiple valid call signatures for one function name, resolved by argument
shape, is called **overloading**.

```
Also recognized in: many languages support this natively (Java, C#,
C++ all have real function overloading); JavaScript itself has no true
overloading, which is exactly why this is a TypeScript-level concept
layered on top of ordinary JS functions, not a runtime feature; database
query builders offering multiple valid call shapes for the same query
method; a plotting library's function accepting either a single array or
separate x/y arrays for the same chart type
```

### SE Lens

The alternative not chosen: two separate function names —
`vectorMagnitude(v)` and `pointDistance(a, b)` — rather than one
overloaded `vectorLength`. That's a perfectly valid choice, and arguably
simpler; overloading is a real tradeoff, not a strictly superior
technique. The case for one shared name here: both operations answer the
literal same question ("how long"), and a caller reaching for "the length
of this thing" doesn't have to remember two different names depending on
whether they have one vector or two points — at the cost of a slightly
more complex implementation signature juggling an optional parameter.

### Commands Needed

None new beyond `tsc`, already established.

### Run It

Real output already shown above.

### Connecting

Generics preserve a shape's specific type through a transform; overloads
let one function name serve multiple valid, distinct calling
conventions — both are ways of making this project's type system more
expressive without weakening the protection Lesson 17 established.

---

## Closing

### Connect the Pieces

One shape, `{ x: 0, y: 0, label: "origin-corner" }`, and one calculation,
"how long," traced through the lesson. `translateShape<T extends
Vector2>` (Units 1–2) moves it while genuinely preserving its `label` —
proven both by a compile-clean check and an actual `node` run printing
the label back out. `vectorLength` (Unit 3), overloaded, computes the
same underlying value Lesson 8's `magnitude` and Lesson 11's `distance`
already derived by hand, reachable through either calling shape, with
any other shape rejected before the program runs — and its very name
exists because a *different* name collided, for real, with a browser
global this project will eventually run inside.

### What Breaks Without This

Using the plain, non-generic `translateShapePlain` from Unit 1 on a real
shape carrying extra project-specific data — Arc 0's own tagged shape
objects, which carry a `type` field exactly like `NamedPoint`'s `label`:

```ts
interface TaggedPoint extends Vector2 {
  type: string;
}

const shapePoint: TaggedPoint = { x: 100, y: 50, type: "point" };
const result = translateShapePlain([shapePoint], { x: 10, y: 10 });
console.log(result[0].type);  // does this still compile?
```

```
error TS2339: Property 'type' does not exist on type 'Vector2'.
```

Any function in this project that still uses the plain, non-generic form
would lose track of Arc 0's own `type` tag the moment a shape passes
through it — a real, concrete reason this project's transform functions
need the generic form from here forward, not just as an abstract exercise.

### Exercises

- Write a generic version of `rotateShape` (Lesson 13), `<T extends
  Vector2>`, and confirm it preserves a `NamedPoint`-style extra field the
  same way `translateShape` does here.
- Add a third overload to `vectorLength` accepting a single `number`
  directly (returning it unchanged) — write both the new overload
  signature and the updated implementation signature, and confirm all
  three call shapes compile.
- Deliberately name a new function `name`, `top`, or another common global
  identifier, and see whether `tsc` reports the same kind of collision
  `length` did — confirm which names are safe and which aren't in this
  project's actual target environment (the browser).

### Definition of Done

- [ ] `translateShape<T extends Vector2>` exists and is confirmed, by a
      real compile-and-run check, to preserve an extra field beyond `x`/`y`
- [ ] Removing the `extends Vector2` bound is confirmed to break
      compilation, not just asserted
- [ ] `vectorLength` exists as an overloaded function, correctly renamed
      away from a real, discovered collision with a built-in browser
      global
- [ ] You can explain, without looking, what problem bounded generics
      solve that Lesson 17's plain interfaces could not
- [ ] Commit:

  ```
  git add generics.ts overloads.ts
  git commit -m "Add generics (bounded type parameters) and function overloads

  translateShape<T extends Vector2> preserves a shape's specific type
  through a transform, proven against a NamedPoint example that a
  non-generic version loses. vectorLength is overloaded to accept either
  one vector or two points - renamed from an original 'length' after
  discovering a real compile-time collision with a built-in DOM global."
  ```
