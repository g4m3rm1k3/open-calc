# SE Masterclass — LAB-26 — Serialization Engine

**Language: TypeScript (Node.js)** — same module as LAB-21–25.

**Prerequisites:** LAB-01 (value vs reference semantics — this lab's deep clone directly resolves LAB-01's "shallow clone only works for one level" limitation). LAB-06/07 (recursion — deep clone recurses through nested structure exactly like tree traversal).

**What this lab adds:**
- Why data must be **serialized** to cross a boundary (disk, network) — the in-memory object itself can't just "go" anywhere
- What JSON can and cannot represent (functions, `undefined`, `Date`, circular references all get mangled or dropped)
- Deep clone, built from scratch — recursively, not just `{ ...obj }`
- Schema versioning: a save file format that changes over time, and loading OLD files with a NEW loader

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `JSON.stringify({ fn: () => 1, date: new Date() })` — what happens to the `fn` and `date` fields?
> 2. LAB-01's shallow clone (`{ ...user }`) correctly created an independent COPY for `user.name`. Why does it FAIL to create an independent copy for `user.address.city`?
> 3. A save file was written by version 1 of your app (no `difficulty` field existed yet). Version 2 expects every save to have `difficulty`. What should loading an old save file do?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== What JSON.stringify Actually Keeps ===
original: { name: 'Alice', greet: [Function], joined: 2026-01-01T00:00:00.000Z, score: undefined }
serialized: {"name":"Alice","joined":"2026-01-01T00:00:00.000Z"}
  ← 'greet' (a function) vanished, 'score' (undefined) vanished, 'joined' became a STRING not a Date

=== Shallow Clone Still Shares Nested Objects ===
original.address.city: Springfield
shallowClone.address.city: Springfield
after shallowClone.address.city = "Shelbyville":
  original.address.city: Shelbyville   ← BUG: the "clone" mutated the original!

=== Deep Clone: True Independence ===
deepClone.address.city: Springfield
after deepClone.address.city = "Shelbyville":
  original.address.city: Springfield   ← unaffected — true independence

=== Deep Clone Handles Arrays and Nested Arrays ===
original: [1, [2, 3], { x: [4, 5] }]
clone: [1, [2, 3], { x: [4, 5] }]
mutating clone[1] does not affect original[1]: confirmed

=== Versioned Save/Load: v1 -> v2 Migration ===
loading a v1 save file (no 'difficulty' field):
raw v1 data: {"version":1,"playerName":"Hero","level":5}
migrated to v2: {"version":2,"playerName":"Hero","level":5,"difficulty":"normal"}
loading a v2 save file directly (already current):
loaded as-is: {"version":2,"playerName":"Hero","level":5,"difficulty":"hard"}

=== Schema Validation on Load ===
loading corrupted save (missing playerName): Error: invalid save file — missing "playerName"
```

---

### Concept: Why Serialization Exists

**What it is:** **Serialization** converts an in-memory object (living in RAM, full of references, function pointers, and runtime-specific structure) into a flat, transferable format — usually text (JSON) or bytes — that can cross a BOUNDARY: written to disk, sent over a network, or stored in a database. **Deserialization** reverses the process.

**The problem before:** A JavaScript object in memory contains actual MEMORY ADDRESSES (LAB-01's reference semantics) — `user.address` is a pointer to a location in THIS program's heap. That pointer is MEANINGLESS to a different program, a file on disk, or a server on the other side of a network request. You cannot just "send the object" — you have to describe its VALUE in a format both sides agree on.

**The solution:** JSON (JavaScript Object Notation) is the most common such format — a text representation of numbers, strings, booleans, `null`, arrays, and plain objects, with NO functions, NO `Date` objects, NO `undefined`, and no way to represent that two properties point to the SAME object (no shared references survive a round trip).

**Project Application (The "Why" here):** Every time you've called `console.log(JSON.stringify(...))` throughout this curriculum (LAB-11's AST printing, LAB-14's graph printing), you were already doing a LIGHT version of what this lab studies directly.

---

## Step 1 — What JSON Loses

```ts
// main.ts
const original = {
  name: 'Alice',
  greet: () => 'hi',
  joined: new Date('2026-01-01T00:00:00.000Z'),
  score: undefined,
}

console.log('=== What JSON.stringify Actually Keeps ===')
console.log('original:', original)
const serialized = JSON.stringify(original)
console.log('serialized:', serialized)
console.log("  ← 'greet' (a function) vanished, 'score' (undefined) vanished, 'joined' became a STRING not a Date")
```

### SAVE AND TRY

```bash
npx tsc --init --strict true
npx ts-node main.ts
```

**Expected:**
```
=== What JSON.stringify Actually Keeps ===
original: { name: 'Alice', greet: [Function: greet], joined: 2026-01-01T00:00:00.000Z, score: undefined }
serialized: {"name":"Alice","joined":"2026-01-01T00:00:00.000Z"}
  ← 'greet' (a function) vanished, 'score' (undefined) vanished, 'joined' became a STRING not a Date
```

**Confirm the Date problem specifically:** `JSON.parse(serialized).joined` is the STRING `"2026-01-01T00:00:00.000Z"`, not a `Date` OBJECT — calling `.getFullYear()` on it would throw `TypeError: ...joined.getFullYear is not a function`, because JSON has no `Date` type; it only has strings. Any code that round-trips a `Date` through JSON must explicitly convert it BACK with `new Date(str)` after parsing — JSON never does this automatically.

**Change something:** Add a `NaN` field and a `circular` field that points back to `original` itself (`original.self = original` — but note this specific case will THROW on `JSON.stringify`, not silently misbehave — try it and read the error: `Converting circular structure to JSON`).

---

### Concept: Shallow Clone vs. Deep Clone

**What it is:** LAB-01 demonstrated that `{ ...user }` correctly copies TOP-LEVEL primitive fields independently — but any field that is ITSELF an object (like `user.address`) is copied by REFERENCE, not by value. Both the original and the "clone" end up pointing to the SAME nested object. A **deep clone** recursively copies EVERY level, so nothing is shared anywhere in the structure.

**The problem before, revisited from LAB-01:**

```ts
const original = { name: 'Alice', address: { city: 'Springfield' } }
const shallowClone = { ...original }       // top-level 'address' KEY is new, but its VALUE is the same reference
shallowClone.address.city = 'Shelbyville'
console.log(original.address.city)          // 'Shelbyville' — the "clone" mutated the original!
```

**The solution:** Recurse — for every property, if the VALUE is itself an object (or array), deep-clone IT too, instead of just copying the reference.

---

## Step 2 — Feel the Shallow Clone Bug, Then Fix It

```ts
console.log('\n=== Shallow Clone Still Shares Nested Objects ===')
const user = { name: 'Alice', address: { city: 'Springfield' } }
const shallowClone = { ...user }
console.log(`original.address.city: ${user.address.city}`)
console.log(`shallowClone.address.city: ${shallowClone.address.city}`)

shallowClone.address.city = 'Shelbyville'
console.log('after shallowClone.address.city = "Shelbyville":')
console.log(`  original.address.city: ${user.address.city}   ← BUG: the "clone" mutated the original!`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Shallow Clone Still Shares Nested Objects ===
original.address.city: Springfield
shallowClone.address.city: Springfield
after shallowClone.address.city = "Shelbyville":
  original.address.city: Shelbyville   ← BUG: the "clone" mutated the original!
```

Now build the recursive fix:

```ts
function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value                                          // ← add: base case — primitives are already independent (LAB-01)
  }

  if (Array.isArray(value)) {
    return value.map(item => deepClone(item)) as unknown as T    // ← add: recurse into every array element
  }

  const cloned: Record<string, unknown> = {}
  for (const key of Object.keys(value as object)) {
    cloned[key] = deepClone((value as Record<string, unknown>)[key])   // ← add: recurse into every property
  }
  return cloned as T
}
```

Add to `main.ts`:

```ts
console.log('\n=== Deep Clone: True Independence ===')
const user2 = { name: 'Alice', address: { city: 'Springfield' } }
const deepCloned = deepClone(user2)
console.log(`deepClone.address.city: ${deepCloned.address.city}`)

deepCloned.address.city = 'Shelbyville'
console.log('after deepClone.address.city = "Shelbyville":')
console.log(`  original.address.city: ${user2.address.city}   ← unaffected — true independence`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Deep Clone: True Independence ===
deepClone.address.city: Springfield
after deepClone.address.city = "Shelbyville":
  original.address.city: Springfield   ← unaffected — true independence
```

**Confirm this is the SAME recursive shape as LAB-06's tree traversal:** `deepClone`'s base case (`typeof value !== 'object'`, return directly) and recursive case (recurse into each property/element) mirror `preorder`/`postorder`'s base case (`node == nullptr`) and recursive case (recurse into children) exactly — a nested object IS a tree, and deep cloning it IS a tree traversal that happens to build a parallel copy instead of just visiting.

---

## Step 3 — Confirm Arrays and Nesting Work Too

```ts
console.log('\n=== Deep Clone Handles Arrays and Nested Arrays ===')
const nested = [1, [2, 3], { x: [4, 5] }]
console.log('original:', JSON.stringify(nested))
const clonedNested = deepClone(nested)
console.log('clone:', JSON.stringify(clonedNested))

;(clonedNested[1] as number[])[0] = 999
console.log(`mutating clone[1] does not affect original[1]: ${(nested[1] as number[])[0] !== 999}`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Deep Clone Handles Arrays and Nested Arrays ===
original: [1,[2,3],{"x":[4,5]}]
clone: [1,[2,3],{"x":[4,5]}]
mutating clone[1] does not affect original[1]: confirmed
```

*(Note: `Node.js`'s built-in `structuredClone()` — available in modern Node versions — does everything this hand-written `deepClone` does, and MORE, including `Date`, `Map`, `Set`, and circular references, which `JSON.stringify` cannot handle at all. Building `deepClone` by hand here is about understanding the RECURSIVE MECHANISM `structuredClone` uses internally, the same reason LAB-04 built a hash map from scratch even though `Map` already existed.)*

**Change something:** Deep-clone an object containing a `Date`. Confirm the hand-written `deepClone` above INCORRECTLY treats it as a plain object (since `typeof someDate === 'object'`) rather than preserving it as a `Date` — this is a genuine limitation of the simple version above, and exactly the kind of edge case `structuredClone` handles that a naive recursive clone does not.

---

### Concept: Schema Versioning — Old Data Meeting New Code

**What it is:** A save file (or any persisted data) format written TODAY may need to be READ by a future version of your application that expects a DIFFERENT shape — new fields added, old fields renamed. A **migration** transforms old-format data into the current format before the rest of the application ever sees it.

**The problem before:** If version 2 of an app just assumes every save file has a `difficulty` field (added in v2), loading a save file written by v1 (before `difficulty` existed) produces `undefined` for that field — and everything downstream that expects a real difficulty value breaks in confusing ways.

**The solution:** Tag every save with a `version` number. On load, check the version, and if it's OLD, run it through a migration step that fills in sensible defaults for whatever's missing, before handing it to the rest of the app.

---

## Step 4 — Versioned Save/Load

```ts
// save-format.ts
export interface SaveV1 {
  version: 1
  playerName: string
  level: number
}

export interface SaveV2 {
  version: 2
  playerName: string
  level: number
  difficulty: string
}

export function migrateSave(raw: SaveV1 | SaveV2): SaveV2 {
  if (raw.version === 2) return raw                              // ← add: already current — nothing to do
  return { ...raw, version: 2, difficulty: 'normal' }              // ← add: v1 -> v2 — fill in the new field with a default
}
```

Add to `main.ts`:

```ts
import { migrateSave } from './save-format'

console.log('\n=== Versioned Save/Load: v1 -> v2 Migration ===')
const v1Save = { version: 1 as const, playerName: 'Hero', level: 5 }
console.log('loading a v1 save file (no \'difficulty\' field):')
console.log('raw v1 data:', JSON.stringify(v1Save))
const migrated = migrateSave(v1Save)
console.log('migrated to v2:', JSON.stringify(migrated))

const v2Save = { version: 2 as const, playerName: 'Hero', level: 5, difficulty: 'hard' }
console.log('loading a v2 save file directly (already current):')
const loaded = migrateSave(v2Save)
console.log('loaded as-is:', JSON.stringify(loaded))
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Versioned Save/Load: v1 -> v2 Migration ===
loading a v1 save file (no 'difficulty' field):
raw v1 data: {"version":1,"playerName":"Hero","level":5}
migrated to v2: {"version":2,"playerName":"Hero","level":5,"difficulty":"normal"}
loading a v2 save file directly (already current):
loaded as-is: {"version":2,"playerName":"Hero","level":5,"difficulty":"hard"}
```

**Confirm the SHAPE of the fix, not just the output:** `migrateSave` is a DISPATCH on `version` (LAB-09's dispatch table idea again, at just two cases here) — real systems chain MULTIPLE migration steps (v1→v2, then v2→v3, then v3→v4...) so a very old save can be walked forward one version at a time, rather than requiring a direct v1→v4 conversion function for every possible starting version. LAB-64 (Migration System) builds exactly this chained approach for database schemas.

---

## 🎯 Challenge: Schema Validation on Load

**You know:** LAB-09's boundary validation and LAB-25's `validateConfig` both check required fields immediately, with a clear error.

**Task:** Before migrating/using a loaded save, validate that `playerName` (a required field in BOTH `SaveV1` and `SaveV2`) actually exists and is a string. Reject a corrupted save with a clear error instead of silently proceeding with `undefined`.

<details>
<summary>▶ Show Solution</summary>

```ts
function validateSave(raw: unknown): asserts raw is SaveV1 | SaveV2 {
  const data = raw as Record<string, unknown>
  if (typeof data.playerName !== 'string') {
    throw new Error('invalid save file — missing "playerName"')
  }
}

console.log('\n=== Schema Validation on Load ===')
const corruptedSave = { version: 1, level: 5 }    // missing playerName entirely
try {
  validateSave(corruptedSave)
} catch (err) {
  console.log(`loading corrupted save (missing playerName): Error: ${(err as Error).message}`)
}
```

**Key insight:** `asserts raw is SaveV1 | SaveV2` is a TypeScript "assertion function" — after calling `validateSave(raw)` successfully (without throwing), TypeScript NARROWS `raw`'s type for the rest of the code, the same way LAB-11's `if (shape.kind === "circle")` narrowed a discriminated union. Validation and TYPE NARROWING happen together in one function call, instead of validating at runtime and then needing a SEPARATE type assertion to satisfy the compiler.

</details>

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Schema Validation on Load ===
loading corrupted save (missing playerName): Error: invalid save file — missing "playerName"
```

---

## Mental Model: Where This Shows Up

| System | Serialization at work |
|---|---|
| Every REST API (LAB-45) | Request/response bodies are JSON — objects serialized to cross the network |
| `localStorage` in browsers | Can only store strings — objects must be `JSON.stringify`'d first |
| Save games (this lab's example) | Persisted state that must survive across app versions |
| Database ORMs (LAB-62) | Rows (flat, typed columns) ↔ objects (nested, typed classes) — a serialization boundary |
| Redux DevTools / time-travel debugging | Serializes entire application state to replay it later |

**Where you will see this again:** LAB-64 (Migration System) generalizes this lab's v1→v2 save migration to full database schema migrations, chained across many versions.

---

## Final Check

| Feature | How to verify |
|---|---|
| `JSON.stringify` silently drops functions and `undefined`, converts `Date` to a string | Step 1 |
| Shallow clone (`{...obj}`) shares nested object references — mutation bug demonstrated | Step 2 |
| Hand-written `deepClone` produces a genuinely independent nested copy | Step 2 |
| `deepClone` correctly handles arrays and mixed nested structures | Step 3 |
| A v1 save file is correctly migrated to v2 with a sensible default | Step 4 |
| A v2 save file passes through migration unchanged | Step 4 |
| A corrupted save (missing a required field) is rejected with a clear error | Challenge |

---

## Quick Check Answers

**1. `JSON.stringify({ fn, date })` — what happens to `fn` and `date`?**

`fn` (a function) is DROPPED entirely — it doesn't appear in the output JSON at all, because JSON has no representation for executable code. `date` (a `Date` object) is converted to its ISO STRING representation (`"2026-01-01T00:00:00.000Z"`) — it survives, but as a plain string, not a `Date` object; parsing it back with `JSON.parse` gives you a string, not a working `Date`, until you explicitly wrap it in `new Date(...)` again.

**2. Why does shallow clone fail for `user.address.city` but succeed for `user.name`?**

`user.name` is a PRIMITIVE (a string) — LAB-01's value semantics mean `{ ...user }` copies the actual string value into a new slot, fully independent. `user.address` is an OBJECT — LAB-01's reference semantics mean `{ ...user }` copies the REFERENCE (the memory address) to `address`, not the object itself; both `user.address` and `shallowClone.address` end up pointing at the exact SAME underlying object, so mutating one is indistinguishable from mutating the other, demonstrated directly in Step 2.

**3. Loading an old v1 save (no `difficulty` field) in v2 code — what should happen?**

It should be MIGRATED, not left broken — Step 4's `migrateSave` detected `version === 1` and filled in a sensible default (`difficulty: 'normal'`) before handing the data to the rest of the application, rather than letting `difficulty` silently be `undefined` everywhere it's used. This is the general shape every real save/schema migration follows: detect the old version, transform it explicitly and deliberately into the current shape, and never assume old data magically already matches the new expectations.

---

*Next: [LAB-27 — Testing Framework](LAB-27-testing-framework.md) — TypeScript, same module*
