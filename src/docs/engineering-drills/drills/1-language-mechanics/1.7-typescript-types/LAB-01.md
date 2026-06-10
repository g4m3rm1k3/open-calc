# Drill 1.7 — TypeScript: The Type System Really Explained

**Standalone drill. No prerequisites except basic JavaScript knowledge.**
**Time estimate:** 75–90 minutes
**Environment:** Node.js + TypeScript — `npm install -g typescript ts-node`
**What you will build:** A typed data pipeline that transforms raw JSON through three typed stages — and a deliberate type error introduced and fixed at each stage
**What you will understand:** Why TypeScript is not just "JavaScript with types," and what structural typing, discriminated unions, and `unknown` vs `any` actually mean

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. Two TypeScript interfaces: `interface Dog { name: string; bark(): void }` and `interface Cat { name: string; bark(): void }`. Is a `Cat` assignable to a parameter of type `Dog`? Why?

2. `function identity<T>(x: T): T { return x }` — what is `T`, and why does this function need it? What would be wrong with `function identity(x: any): any { return x }`?

3. What is the concrete difference between `unknown` and `any` in TypeScript? Which is safer and why?

4. `type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number }`. What is this pattern called? Why does `shape.radius` give a TypeScript error without a condition first?

*(Answers at the bottom of this lab, referenced to specific code you will write.)*

---

## The Concept: Structural Typing

### Concept: Structural vs Nominal Typing

**What it is:**
TypeScript uses **structural typing** — type compatibility is determined by shape, not by name. If two types have the same structure, they are interchangeable, regardless of what they are called.

**The problem before:**
In Java or C#, if a function expects a `Dog`, you must pass a `Dog` (or a subclass). A `Cat` with identical methods is incompatible — different name, different type. This forces you to plan type hierarchies in advance.

**The solution:**
TypeScript checks whether the actual shape of a value satisfies what the caller expects. If `Cat` has every property and method that `Dog` requires, TypeScript treats `Cat` as compatible with `Dog` — no inheritance required.

**Canonical example:**
```typescript
interface Printable {
  toString(): string;
}

function print(p: Printable): void {
  console.log(p.toString());
}

// Every object in JavaScript has toString() — so everything is Printable
print({ toString: () => "hello" });  // works — anonymous object is structurally Printable
print(42);                           // works — number has toString()
print({ toString: () => "world", extra: true });  // works — extra properties allowed
```

**What it hides:**
TypeScript never generates runtime code for type checking. Structural typing is a compile-time-only property — the compiled JavaScript has no memory of any of it. TypeScript's type system is completely erased before your code runs.

**Project application:**
Your data pipeline will define `RawInput`, `ValidatedInput`, and `ProcessedOutput` types. The pipeline functions pass data from type to type. TypeScript catches any mismatched shape at compile time — not at runtime when a user hits the bug.

**Constraints:**
- Structural typing can surprise you: `{ name: string; extra: number }` is assignable to `{ name: string }` — extra properties are allowed when assigning to a narrower type
- However, object literals trigger "excess property checking" — passing `{ name: "a", extra: 1 }` directly to a function expecting `{ name: string }` is an error. Assigning to a variable first bypasses this check.
- TypeScript's types exist only at compile time. They cannot be inspected at runtime without additional tooling.

**Failure modes:**
- "Property X does not exist on type Y" — you accessed a property that is not in the type. Fix: add it to the type definition, or narrow the type first.
- Excess property check surprises — `{ name: "a", typo: 1 }` to a function expecting `{ name: string }` gives an error, but `const obj = { name: "a", typo: 1 }; fn(obj)` does not.
- Types become `any` silently when you use `JSON.parse()` — the return type is `any`, meaning TypeScript stops checking.

**Operational reality:**
TypeScript's type system is intentionally unsound — it makes tradeoffs for practicality. Some type errors are not caught. `any` is a hole in the type system. In large codebases (like VS Code itself, written in TypeScript), you enable `strict: true` in `tsconfig.json` to catch the most common holes: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`.

**You will see this again in:**
Every TypeScript project. React's prop types, Zod validation schemas, tRPC's type-safe API calls, and Prisma's generated types all rely on structural typing. Understanding it explains why TypeScript "just works" for so many patterns.

**Watch for:**
TypeScript checks types at compile time. The compiled JavaScript has no runtime type checking unless you add it explicitly. `JSON.parse()` returns `any` — validate API responses with Zod or io-ts before trusting them.

---

## The Concept: Generics

### Concept: Generic Type Parameters

**What it is:**
A generic function or type is parameterized by a type that is specified by the caller. Instead of writing `identity(x: string): string` and `identity(x: number): number` separately, you write `identity<T>(x: T): T` once.

**The problem before:**
```typescript
// Without generics — either lose type safety or duplicate code
function identity_any(x: any): any { return x }
const result = identity_any("hello")
// result is 'any' — TypeScript stops checking. You could call result.nonExistent() and TypeScript wouldn't complain.

function identity_string(x: string): string { return x }
function identity_number(x: number): number { return x }
// Correct, but now you need one function per type forever.
```

**The solution:**
```typescript
function identity<T>(x: T): T { return x }

const s = identity("hello")  // T is inferred as string — s is string
const n = identity(42)        // T is inferred as number — n is number
const b = identity(true)      // T is inferred as boolean — b is boolean
// TypeScript infers T from the argument — you rarely need to write it explicitly.
```

**Canonical example:**
```typescript
// A typed wrapper for Array.find:
function findFirst<T>(arr: T[], predicate: (item: T) => boolean): T | undefined {
  return arr.find(predicate)
  // Without generics, 'predicate' would need to accept 'any'
  // and the return type would be 'any'
  // With generics, TypeScript knows the element type throughout
}

const users = [{ name: "Alice" }, { name: "Bob" }]
const alice = findFirst(users, u => u.name === "Alice")
// alice: { name: string } | undefined  — TypeScript knows the shape
```

**Generic constraints:**
```typescript
// T extends { id: string } means: T must have at least an 'id' property
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id)
}
// This lets you call item.id safely inside the function
// Without the constraint, TypeScript would reject item.id — T could be anything
```

**Watch for:**
If TypeScript infers `T` as `never` (meaning no type satisfies the constraint), your generic constraint is too tight. If it infers `unknown`, it cannot determine `T` from the call site — provide the type argument explicitly: `findById<User>(users, "123")`.

---

## The Concept: Discriminated Unions

### Concept: Discriminated Union (Tagged Union)

**What it is:**
A union type where one property (the "discriminant") has a unique literal value for each variant. TypeScript narrows the type automatically when you check the discriminant.

**The problem before:**
```typescript
// Without discrimination:
type Shape = {
  kind: string;      // 'string' — could be anything
  radius?: number;   // optional — exists for circles only
  side?: number;     // optional — exists for squares only
}

function area(shape: Shape): number {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2
    //                     ^^^^^^ error: 'radius' possibly undefined
    // TypeScript doesn't know that 'circle' implies radius exists
  }
  return shape.side! ** 2  // forced to use ! to suppress the error
}
```

**The solution:**
```typescript
type Circle = { kind: "circle"; radius: number }
type Square = { kind: "square"; side: number }
type Shape = Circle | Square
// "circle" and "square" are literal string types — not just 'string'

function area(shape: Shape): number {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2
    // TypeScript KNOWS shape is Circle here — radius is guaranteed to exist
  }
  return shape.side ** 2
  // TypeScript KNOWS shape is Square here — side is guaranteed to exist
}
```

**The exhaustive check with `never`:**
```typescript
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2
    case "square": return shape.side ** 2
    default:
      const _exhaustive: never = shape
      // If you add a new variant to Shape but forget to add a case here,
      // TypeScript errors: "Type 'Triangle' is not assignable to type 'never'"
      // The compiler forces you to handle every variant.
      throw new Error(`Unhandled shape: ${JSON.stringify(_exhaustive)}`)
  }
}
```

**Watch for:**
The discriminant must be a literal type (`"circle"`, `42`, `true`), not a general type (`string`, `number`). TypeScript cannot narrow on `kind: string` — only on `kind: "circle"`.

---

## Step 1 — Create the Typed Pipeline

Create a folder and initialize TypeScript:

```bash
mkdir typed-pipeline
cd typed-pipeline
npm init -y
npm install typescript ts-node
npx tsc --init --strict true --target ES2020 --module commonjs
```

The `--strict true` flag enables: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and others. These catch the bugs that loose TypeScript misses.

Create `pipeline.ts`:

```typescript
// pipeline.ts — a three-stage typed data pipeline
// Each stage has its own type. TypeScript catches mismatches between stages.

// ── Types ──────────────────────────────────────────────────────────────────────

// Stage 1: raw JSON input — we know nothing about its shape
type RawInput = {
  user_id: string;       // snake_case from the API — will normalize later
  event_type: string;    // unvalidated — could be anything
  timestamp: string;     // ISO string — needs parsing
  payload: unknown;      // completely unknown — must validate before using
}

// Stage 2: validated input — we've checked the data
// Discriminated union: event_type is now a literal, not just 'string'
type ClickEvent = {
  kind: "click";         // literal type — the discriminant
  userId: string;        // normalized to camelCase
  timestamp: Date;       // proper Date, not a string
  elementId: string;     // extracted from payload, guaranteed to exist
}

type ViewEvent = {
  kind: "view";
  userId: string;
  timestamp: Date;
  pageUrl: string;       // different payload shape for view events
}

type ValidatedEvent = ClickEvent | ViewEvent   // the discriminated union

// Stage 3: processed output — enriched and ready for storage
type ProcessedEvent = ValidatedEvent & {
  // '&' is intersection — adds fields to all variants
  processedAt: Date;     // when this pipeline ran
  version: number;       // schema version for future migrations
}


// ── Stage 1 → Stage 2: validate ───────────────────────────────────────────────

function validate(raw: RawInput): ValidatedEvent {
  const userId = raw.user_id;           // normalize snake_case to camelCase
  const timestamp = new Date(raw.timestamp);  // parse string to Date

  if (raw.event_type === "click") {
    // TypeScript does NOT automatically know payload has elementId
    // We must assert the shape ourselves — this is the API boundary
    const payload = raw.payload as { elementId: string }
    // 'as' is a type assertion — we're telling TypeScript "trust me, I know the shape"
    // This is where you'd add runtime validation (Zod) in production

    return {
      kind: "click",        // literal "click" — makes this a ClickEvent
      userId,
      timestamp,
      elementId: payload.elementId,
    }
  }

  if (raw.event_type === "view") {
    const payload = raw.payload as { pageUrl: string }
    return {
      kind: "view",
      userId,
      timestamp,
      pageUrl: payload.pageUrl,
    }
  }

  // If neither matches, throw — this is a validation failure
  throw new Error(`Unknown event_type: ${raw.event_type}`)
}


// ── Stage 2 → Stage 3: process ────────────────────────────────────────────────

function process(event: ValidatedEvent): ProcessedEvent {
  return {
    ...event,                      // spread: copies all fields from ValidatedEvent
    processedAt: new Date(),       // added by this stage
    version: 1,                    // added by this stage
  }
}


// ── Stage 3: summarize ────────────────────────────────────────────────────────

function summarize(event: ProcessedEvent): string {
  // Discriminated union — TypeScript narrows based on 'kind'
  switch (event.kind) {
    case "click":
      return `User ${event.userId} clicked ${event.elementId} at ${event.timestamp.toISOString()}`
      //                                    ^^^^^^^^^^^^^^^^^^^^
      // TypeScript KNOWS event is ClickEvent here — elementId is safe to access
    case "view":
      return `User ${event.userId} viewed ${event.pageUrl} at ${event.timestamp.toISOString()}`
      //                                   ^^^^^^^^^^^^^^^^
      // TypeScript KNOWS event is ViewEvent here — pageUrl is safe to access
    default:
      // Exhaustive check — if ValidatedEvent grows, TypeScript forces handling it here
      const _exhaustive: never = event
      throw new Error(`Unhandled event kind: ${JSON.stringify(_exhaustive)}`)
  }
}


// ── Run the pipeline ──────────────────────────────────────────────────────────

const rawEvents: RawInput[] = [
  {
    user_id: "user-123",
    event_type: "click",
    timestamp: "2026-05-13T10:00:00Z",
    payload: { elementId: "submit-button" },
  },
  {
    user_id: "user-456",
    event_type: "view",
    timestamp: "2026-05-13T10:01:00Z",
    payload: { pageUrl: "/dashboard" },
  },
]

for (const raw of rawEvents) {
  const validated = validate(raw)
  const processed = process(validated)
  console.log(summarize(processed))
}
```

### SAVE AND TRY

```bash
npx ts-node pipeline.ts
```

**Expected output:**
```
User user-123 clicked submit-button at 2026-05-13T10:00:00.000Z
User user-456 viewed /dashboard at 2026-05-13T10:01:00.000Z
```

**Terminal verification — see the type errors TypeScript catches:**

Add this line at the end of `pipeline.ts` and run again:

```typescript
// Deliberate error: try to access pageUrl on an event that might be a click
const first = validate(rawEvents[0])
console.log(first.pageUrl)  // ← add this line
```

```bash
npx ts-node pipeline.ts
```

Expected error: `Property 'pageUrl' does not exist on type 'ValidatedEvent'`. TypeScript refuses to compile — `pageUrl` only exists on `ViewEvent`, not on all `ValidatedEvent`. Add the fix below, then remove both lines:

```typescript
if (first.kind === "view") {
  console.log(first.pageUrl)  // Now TypeScript knows it is safe
}
```

**Change something:**
Add a new raw event with `event_type: "purchase"` and run. You get a runtime `Error: Unknown event_type: purchase`. Now add `"purchase"` as a third variant — create a `PurchaseEvent` type with `kind: "purchase"` and an `amount: number` field, add it to `ValidatedEvent`, and add the case in `summarize`. Notice: TypeScript's exhaustive check (`never`) flags the missing case in `summarize` before you add it. The compiler tells you what is missing.

---

## Step 2 — Add a Generic Utility

Add this to `pipeline.ts` before the `rawEvents` declaration:

```typescript
// ── Generic utility ───────────────────────────────────────────────────────────

// findByUserId<T extends { userId: string }>(items: T[], userId: string): T | undefined
// Works for ClickEvent[], ViewEvent[], ProcessedEvent[], or any type with a userId

function findByUserId<T extends { userId: string }>(
  items: T[],
  userId: string
): T | undefined {
  return items.find(item => item.userId === userId)
  // 'item.userId' is safe — T extends { userId: string } guarantees it exists
}

// Use it — TypeScript infers T from the array element type
const processedEvents = rawEvents.map(raw => process(validate(raw)))
const found = findByUserId(processedEvents, "user-123")

if (found) {
  // 'found' is ProcessedEvent | undefined — the 'if' narrows it to ProcessedEvent
  console.log(`Found: ${summarize(found)}`)
}
```

### SAVE AND TRY

```bash
npx ts-node pipeline.ts
```

**Expected:** Same two lines as before, plus `Found: User user-123 clicked submit-button at 2026-05-13T10:00:00.000Z`

**In the terminal — see `unknown` vs `any` in action:**

Try accessing `payload` from a `RawInput` directly without the `as` cast:

```typescript
const raw = rawEvents[0]
console.log(raw.payload.elementId)  // ← add this
```

Expected error: `Object is of type 'unknown'`. TypeScript refuses to let you access properties on `unknown` — you must narrow it first. Change `payload: unknown` to `payload: any` in `RawInput` — the error disappears but TypeScript stops protecting you. Switch it back to `unknown`.

---

## Challenge

**No solution provided. Requirements checklist only.**

Extend the pipeline with a fourth event type: `SearchEvent` with fields `kind: "search"`, `userId: string`, `timestamp: Date`, `query: string`, and `resultCount: number`.

**Requirements checklist:**

- [ ] `SearchEvent` type defined with the correct shape and discriminant
- [ ] `ValidatedEvent` union includes `SearchEvent`
- [ ] `validate()` handles `event_type === "search"` — extracts `query` and `resultCount` from `payload`
- [ ] `summarize()` handles `kind: "search"` — prints a readable summary including the query and result count
- [ ] The exhaustive `never` check in `summarize` compiles without errors after the case is added
- [ ] `findByUserId` works with an array of `SearchEvent` objects — TypeScript infers the type correctly
- [ ] Add a raw `SearchEvent` to `rawEvents` and verify the full pipeline runs end to end

**Starter:**

```typescript
// Add this type definition:
type SearchEvent = {
  kind: "search";
  userId: string;
  timestamp: Date;
  query: string;        // extract from payload.query
  resultCount: number;  // extract from payload.resultCount
}
```

**When you're done:** `npx ts-node pipeline.ts` prints four lines — one per event including the new search event. TypeScript reports zero errors. Removing the `case "search"` from `summarize` immediately causes a compile error on the `never` check.

**Stuck? Ask AI:** "In TypeScript, I have a discriminated union type and I want to add a new variant. TypeScript is showing an error on my `never` exhaustive check. What does that error mean, and where exactly do I need to add code to fix it?"

---

## Quick Check Answers

**1. Is `Cat` assignable to `Dog` if both have `name: string; bark(): void`?**
Yes. TypeScript uses structural typing — it checks shape, not name. Both types have identical structure, so TypeScript treats them as interchangeable. If you renamed `Dog` to `Animal` and added a `fly()` method, `Cat` would no longer be assignable — because `Cat` doesn't satisfy the `fly()` requirement. The name `Dog` is irrelevant; only the structure matters. This is confirmed in the `pipeline.ts` code: any object that has `userId: string` satisfies the generic constraint `T extends { userId: string }` — regardless of what the object is "called."

**2. Why does `identity<T>` need `T`? What's wrong with `any`?**
`identity<T>(x: T): T` preserves the type relationship: if you pass in a `string`, you get back a `string`. TypeScript knows the return type. With `identity(x: any): any`, the return type is `any` — TypeScript stops tracking the type entirely. You could call `identity("hello").nonExistent()` and TypeScript would not complain. `T` is a placeholder that TypeScript fills in from the argument, preserving type safety without duplicating the function. You see this in `findByUserId<T>` — the return type is `T | undefined`, which TypeScript resolves to `ProcessedEvent | undefined` when you pass a `ProcessedEvent[]`.

**3. `unknown` vs `any` — which is safer?**
`unknown` is safer. With `any`, TypeScript stops all type checking — you can call any method, access any property, pass it anywhere. With `unknown`, TypeScript forces you to narrow or assert the type before using it. `raw.payload: unknown` means TypeScript refuses to let you access `raw.payload.elementId` directly — you must either narrow with an `if` or assert with `as`. The `as { elementId: string }` cast in `validate()` is the deliberate boundary where you take responsibility for the shape. Using `unknown` makes that boundary explicit; `any` hides it.

**4. What is the discriminated union pattern? Why does `shape.radius` need a condition?**
A discriminated union (or tagged union) is a union type where each variant has a unique literal property (the "discriminant") — here `kind: "circle"` and `kind: "square"`. Without checking the discriminant, TypeScript cannot know which variant you have, so `shape.radius` is an error: `radius` only exists on `Circle`, not on all `Shape`. After `if (shape.kind === "circle")`, TypeScript narrows the type to `Circle` and `shape.radius` is safe. This is demonstrated in the `summarize()` function — inside `case "click"`, TypeScript knows the event is a `ClickEvent` and allows `event.elementId`. Inside `case "view"`, it knows `event.pageUrl` is safe.
