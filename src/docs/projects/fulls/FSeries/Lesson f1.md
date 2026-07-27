# Lesson F1: TypeScript's Type System, For Real

**What you will build**
Nothing running yet — this lesson builds the type vocabulary the rest of the frontend track depends on, matching real shapes from the backend's API. The problem we're solving: Lesson 1's ledger already established "static vs dynamic typing" as a concept, and Lesson 2 briefly contrasted Python/Pydantic against it — but TypeScript's specific version of static typing has real, load-bearing differences from both that matter the moment you start writing frontend code against this API.

**What you need to know first**
Backend Lesson 1 (static vs. dynamic typing, `BaseModel`). Backend Lesson 2 (the note that Pydantic buys *some* of static typing's safety, but only at runtime, at a specific boundary).

**Exemption from the failing-test-first rule:** this lesson establishes type vocabulary with no running application behavior yet — Phase F1 is Interlude-style, per the curriculum map.

---

## Concept Unit: Compile-Time Checking, and Why TypeScript Types Don't Exist at Runtime

### The Problem

Backend Lesson 1 proved something specific about Python: `def add_typed(a: int, b: int) -> int` ran `add_typed("2", "3")` without complaint — annotations are documentation, checked by nothing unless something like Pydantic enforces them. TypeScript's whole reason for existing is being the *opposite* of that — but understanding exactly how it's the opposite, and what that costs, matters before writing a single component.

### Introduce the concept in isolation

Create `lab_types.ts`:

```typescript
function addTyped(a: number, b: number): number {
    return a + b;
}

console.log(addTyped(2, 3));
console.log(addTyped("2", "3"));  // deliberately wrong
```

Try to run it:

```bash
npx tsc lab_types.ts
```

Output:

```text
lab_types.ts:5:20 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.

5 console.log(addTyped("2", "3"));
                        ~~~

Found 1 error.
```

*What this proves:* `tsc` (the TypeScript compiler) refused to even produce a runnable file — the error was caught before `addTyped("2", "3")` ever had a chance to execute, not while it ran. This is the exact opposite of Python's `add_typed("2", "3")`, which ran successfully and printed `23`. Fix the call (`addTyped(2, 3)`), rerun `npx tsc lab_types.ts`, and a real `lab_types.js` file now appears.

### Explain the mechanism — and the part that's easy to miss

Open the generated `lab_types.js`:

```javascript
function addTyped(a, b) {
    return a + b;
}
console.log(addTyped(2, 3));
```

*What this proves:* the types are **completely gone**. Not hidden, not checked at runtime, not present in any form — `tsc` used them once, during compilation, to catch the mistake, and then discarded them entirely when producing the actual JavaScript that runs. This is the single most important fact about TypeScript's type system, and it directly updates something from backend Lesson 14: Pydantic's `BaseModel` checks types *at runtime*, on real data, every single time a request arrives — genuinely enforcing them. TypeScript's checking happens once, before anything runs, on source code — and then the safety net is gone the moment the program is actually executing. A TypeScript type is a promise checked once, at build time; a Pydantic model is a guard checked continuously, at run time.

### Discard the throwaway example

Delete `lab_types.ts` and `lab_types.js`. This distinction is the lens for everything else in this lesson.

### CS Lens

**Compile-time vs. runtime checking as two different points in a program's life, catching two different classes of mistake.** TypeScript catches "you're calling this wrong, given what you declared" before the program exists as running code at all. Pydantic catches "the actual data that arrived doesn't match what was promised" while the program is live, handling real, unpredictable input. Neither replaces the other — a frontend can be perfectly type-checked by `tsc` and still receive genuinely malformed data from a network response, which is why Lesson F2 will handle that case explicitly rather than trusting types alone.

### SE Lens

**This is precisely why frontend code can never fully trust that the backend's response matches the TypeScript type it's declared as.** The type is a compile-time promise about *your own code's* shape assumptions — it has no ability to verify what actually arrives over the network at runtime, because by the time the network call happens, the types are already gone from the compiled output. This isn't a flaw to work around later; it's a structural fact worth holding onto for every lesson after this one.

---

## Concept Unit: Interfaces and Structural Typing

### The Problem

Every route in the backend's API Manifest returns a specific shape — `Member` has `id` and `username`; `FeedPost` has `id`, `content`, `username`, `created_at`. Writing frontend code against this API means describing those exact shapes in TypeScript, so `tsc` can catch a mistake (using `.name` when the real field is `.username`) before ever running the code against the real backend.

### Introduce the concept in isolation

Create `lab_interface.ts`:

```typescript
interface Point {
    x: number;
    y: number;
}

function printPoint(p: Point) {
    console.log(`(${p.x}, ${p.y})`);
}

const literalObject = { x: 1, y: 2 };
printPoint(literalObject);

class Coordinate {
    constructor(public x: number, public y: number) {}
}
const fromClass = new Coordinate(3, 4);
printPoint(fromClass);
```

Run it:

```bash
npx tsc lab_interface.ts && node lab_interface.js
```

Output:

```text
(1, 2)
(3, 4)
```

*What this proves:* `literalObject` was never declared as a `Point`, and `fromClass` is an instance of an entirely unrelated `Coordinate` class — neither one says `implements Point` anywhere, and `tsc` accepted both without complaint. All that mattered was that each one *happened to have* an `x: number` and a `y: number`.

### Explain the mechanism

This is **structural typing** (sometimes called "duck typing, checked at compile time"): TypeScript considers a value compatible with a type if its *shape* matches, regardless of how it was created or what it's formally declared as. This is a genuinely different rule from C#/Java's **nominal typing** (mentioned briefly back when the original backend curriculum considered and deprioritized those languages) — there, a class must explicitly declare `implements Point` to count as one, no matter how similar its shape is. TypeScript's rule matters directly for this project: a raw object returned by `fetch()` and `JSON.parse()`'d will never be declared as any specific interface — it's just a plain object — and structural typing is exactly what allows treating it as one anyway, as long as the shape actually matches.

### Discard the throwaway example

Delete `lab_interface.ts` and `lab_interface.js`. Define the real shapes this project needs, directly from the backend's API Manifest.

### Project Change

* **Files affected:** Create `types/api.ts`.
* **Change type:** Add.

### The New Code

```typescript
// types/api.ts
export interface Member {
    id: number;
    username: string;
}

export interface FeedPost {
    id: number;
    content: string;
    username: string;
    created_at: string;
}

export interface CommentRead {
    id: number;
    content: string;
    username: string;
    created_at: string;
}

export interface PostDetail {
    id: number;
    content: string;
    like_count: number;
    comments: CommentRead[];
}

export interface TokenResponse {
    access_token: string;
}
```

### Mechanical walkthrough

1. Every field name and type here was copied directly from `schemas.py`'s Pydantic models, not guessed or redesigned: (worth stating explicitly). `FeedPost.created_at: str` in Python becomes `created_at: string` in TypeScript — matching the actual JSON the backend sends, since JSON has no separate date type, only strings, numbers, and a handful of other primitives.
2. `export interface`: (first appearance of `export`). Makes this type usable from other files via `import` — necessary the moment more than one component needs to describe "the shape of a post."
3. `comments: CommentRead[]`: (already-established nested-shape idea, directly parallel to backend Lesson 7's nested Pydantic models — `list[CommentRead]` in Python becomes `CommentRead[]` in TypeScript, the same nesting concept in a different syntax).

### CS Lens

**Structural typing is what makes types usable against data you don't control the creation of.** Every value coming from `fetch()` is, at the moment it's parsed, just a plain, undeclared JavaScript object — structural typing is precisely the rule that allows treating it as a `Member` or `FeedPost` afterward, without needing some explicit "this is officially a Member" step that plain data from a network response could never provide.

### SE Lens

**Keeping `types/api.ts` a direct mirror of `schemas.py` is a deliberate discipline, not automatic.** Nothing forces these two files to stay in sync — if a backend field is renamed, nothing here will warn you until a mismatch causes a confusing `undefined` somewhere in the UI. This is worth naming honestly now: some teams solve this with codegen tools that generate TypeScript types directly from a backend's schema; for this project, keeping them manually aligned is an accepted, deliberate simplification — but the risk is real, and worth remembering the next time a backend endpoint's shape changes.

---

## Concept Unit: Generics

### The Problem

Every API call this frontend makes will need to handle the same two states — "the request is loading" and "the request succeeded with data of some particular shape." Writing that wrapper shape separately for `Member[]`, for `FeedPost[]`, and for `PostDetail` would mean three nearly identical type definitions, differing only in which specific shape they wrap.

### Introduce the concept in isolation

Create `lab_generics.ts`:

```typescript
interface Box<T> {
    contents: T;
}

const numberBox: Box<number> = { contents: 42 };
const stringBox: Box<string> = { contents: "hello" };

console.log(numberBox.contents, stringBox.contents);
```

Run it:

```bash
npx tsc lab_generics.ts && node lab_generics.js
```

Output:

```text
42 hello
```

*What this proves:* `Box<T>` is written once, with `T` standing in for "whatever type gets filled in later." `Box<number>` and `Box<string>` are both real, distinct, fully type-checked uses of the same single definition — `numberBox.contents` is genuinely known to be a `number`, not just "some unspecified value," even though `Box` itself never mentioned `number` anywhere in its own definition.

### Explain the mechanism

`T` is a **type parameter** — a placeholder filled in at the point of use, the same conceptual role a function's regular parameter plays for values, just one level up, for types instead. `Box<T>` isn't a real, usable type by itself; it's a template that produces a real type once `T` is supplied.

### Discard the throwaway example

Delete `lab_generics.ts` and `lab_generics.js`. Build a real generic wrapper for API results.

### Project Change

* **Files affected:** `types/api.ts`.
* **Change type:** Modify.

### The New Code

```typescript
// types/api.ts — add
export interface ApiResult<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
}
```

### Mechanical walkthrough

1. `ApiResult<T>`: (already-established generic pattern from isolation, real usage). One definition serves `ApiResult<Member[]>`, `ApiResult<FeedPost[]>`, and `ApiResult<PostDetail>` alike — the shape of "loading/error/data" is identical regardless of what's actually being fetched, and generics are what let that be written exactly once.
2. `T | null`: (first appearance of a **union type**). `data` is either a real `T`, or `null` — TypeScript will require code using `.data` to account for both possibilities before treating it as real data, directly anticipating Lesson F2's error-handling unit.

### CS Lens

**Generics as the type-level equivalent of a function.** A regular function takes values and returns a value; a generic type takes a type and produces a type. `ApiResult<Member[]>` is to `ApiResult<T>` what `addTyped(2, 3)` is to `addTyped(a, b)` — supplying the specific input a general definition was written to accept.

### SE Lens

**One generic type versus three near-identical ones is the same DRY instinct from backend Lesson 16's repository pattern, applied at the type level instead of the code level.** Recognizing "this is the same underlying idea I already learned, in a new place" is worth more here than treating generics as an unfamiliar new topic — it's the identical instinct, just applied to a different kind of duplication.

---

## Closing

**Connect the pieces**
TypeScript's checking happens once, at compile time, and is completely gone from the code that actually runs — a real, structural difference from Pydantic's continuous runtime checking, not just a syntax difference. `types/api.ts` describes the exact shapes this project's backend returns, matched by structure rather than explicit declaration (structural typing), which is exactly what makes it usable against real, undeclared data from `fetch()`. `ApiResult<T>` generalizes the loading/error/data pattern once, generically, rather than once per endpoint shape.

**What breaks without this**
Without matching `types/api.ts` to `schemas.py` precisely, a typo (`.user_name` instead of `.username`) would be caught immediately by `tsc` if the type is correct — but if the *type itself* is wrong (claiming a field exists that the backend doesn't actually send), nothing catches that until the real data arrives and the field is silently `undefined` at runtime, a gap directly inherited from this lesson's first unit: types are a compile-time promise, not a runtime guarantee.

**Exercises**
1. Add a `Profile` interface to `types/api.ts` matching the backend's `Profile` schema (`id`, `username`, `bio`), and a `FollowedMember` interface matching that schema too.
2. Deliberately write `const badMember: Member = { id: 1 }` (missing `username`) and read the exact `tsc` error — confirm it's caught at compile time, then compare that to what would happen if this exact bad shape arrived from a real, unchecked `fetch()` response instead.

**Definition of Done**
* [x] Can explain, without notes, why a TypeScript type provides zero runtime protection on its own.
* [x] `types/api.ts` created, matching the backend's real Pydantic schemas field-for-field.
* [x] `ApiResult<T>` generalizes the loading/error/data shape across every future API call.
* [x] Commit: `feat: TypeScript API types matching backend schemas, with generic result wrapper`

---

## Context Snapshot (End of Lesson F1)

**Frontend File Tree:** `types/api.ts`

**Frontend Terminology Ledger:**
| Term | First taught | Plain meaning |
|---|---|---|
| Compile-time vs. runtime checking | F1 | TypeScript checks once before running; types are then discarded entirely |
| Structural typing | F1 | Compatibility based on shape, not explicit declaration — contrast with nominal typing (C#/Java) |
| `export`/`import` | F1 | Makes a type or value usable from other files |
| Type parameter (generics, `<T>`) | F1 | A placeholder type filled in at the point of use |
| Union type (`T \| null`) | F1 | A value that is one of several possible types |

**Lesson Completion State:**
- Completed: F1
- Next: Interlude E — The Event Loop and Async JavaScript

**Maps to backend:** `types/api.ts` mirrors `schemas.py` (backend Lesson 1-21 accumulated shapes) — keep these two files in sync manually; no codegen in place (flagged as a deliberate simplification above).
