# Concept: The `Map` Collection

**What you'll understand by the end:** how to store and look up values
by an arbitrary key, and specifically why `Map` was chosen here over a
plain JavaScript object for that job.

**Prerequisites:** `typescript-generics.md`.

## Setup

Any JavaScript runtime. `Map` is a real, built-in global — no import
required.

## The Problem

Reading one line of G-code and remembering "this line had an `M` word
worth `98`, and a `P` word worth `9001`" needs a real key → value
store: the key (the letter) isn't known in advance, and only the
*first* occurrence of each letter on a line should count. A plain
object (`{}`) can technically do this (`obj["M"] = 98`), but every key
on a plain object is silently coerced to a string, iteration order has
real historical quirks around numeric-looking keys, and there's no
direct, built-in way to ask "how many keys does this actually have"
without extra steps.

## The Isolated Example

```javascript
const wordValues = new Map();

wordValues.set("M", 98);
wordValues.set("P", 9001);

console.log("has M:", wordValues.has("M"));
console.log("get M:", wordValues.get("M"));
console.log("get X (never set):", wordValues.get("X"));
console.log("size:", wordValues.size);

if (!wordValues.has("M")) {
  wordValues.set("M", 6);
}
console.log("M after guarded re-set:", wordValues.get("M"));
```

**Real output, this session:**
```
has M: true
get M: 98
get X (never set): undefined
size: 2
has M: true
M after guarded re-set: 98
```

**What this proves:** `.get("X")` for a key that was never `.set()`
returns `undefined` rather than throwing — real proof a `Map` behaves
like a genuine lookup table with a defined "not found" answer. The
guarded `if (!wordValues.has("M"))` correctly skipped overwriting `M`'s
existing value `98` with `6` — real proof `.has()` is the correct tool
for a "first one wins" rule, checked *before* writing rather than after.

## Mechanical Walkthrough

- `new Map()` — **(a) first appearance** — constructs an empty `Map`.
  A generic type argument (`Map<string, number>`, in the real TypeScript
  project code) tells the compiler every key will be a `string` and
  every value a `number` — the same generic-parameter idea
  `typescript-generics.md` already covers, applied to a built-in type
  instead of a custom one.
- `.set(key, value)` — stores a value under a key, overwriting any
  existing value already stored under that exact key.
- `.has(key)` — returns a real `boolean`: was this exact key ever
  `.set()`? Distinct from checking `.get(key) !== undefined`, because a
  key could legitimately be `.set()` to the value `undefined` itself —
  `.has()` answers "does this key exist," not "is the value truthy" or
  even "is the value defined."
- `.get(key)` — returns the stored value, or `undefined` if the key was
  never set.
- `.size` — **(a) first appearance** — a real property (not a method
  call, no parentheses) giving the current number of stored keys.

## CS Lens

`Map` is a real, general-purpose **hash map** (also called a hash
table or dictionary in other languages) — the same fundamental data
structure as Python's `dict` (`dict-as-lookup-table.md`) or a database
index: average constant-time (`O(1)`) lookup, insertion, and existence
checks, regardless of how many entries it holds, by computing a real
hash of the key to jump almost directly to its storage location rather
than scanning every entry.

Also recognized in: Python's `dict`, Java's `HashMap`, a compiler's own
symbol table (name → declared type), a web server's in-memory session
store (session ID → user data) — any system needing fast lookup by an
arbitrary, not-necessarily-numeric key.

## SE Lens

The real, concrete reason to reach for `Map` over a plain object here:
keys are only known at runtime (whatever letters actually appear on a
given line — could be any of `M`, `G`, `P`, `X`, `T`, dozens of real
possibilities), and a plain object's prototype chain means a key like
`"toString"` or `"constructor"` could silently collide with a real,
inherited property that was never actually `.set()` by this code — a
genuine, if rare, source of bugs a `Map` cannot have, since a `Map`
never treats a key as inherited built-in behavior, only as data.

## Connection

Builds on `typescript-generics.md` (the `<string, number>` type
parameters) and `dict-as-lookup-table.md` (the same underlying idea,
Python's own name for it). Used directly in
`cnc-editor-electron/src/subprogram-calls.ts`'s `findSubprogramCalls`:
`const words = new Map<string, number>();` records each line's
word-letter-to-value mapping, with `words.has(letter)` guarding against
overwriting the first occurrence of a repeated letter on the same
line — the direct TypeScript equivalent of the reference's own Python
`words: dict[str, float]` and its `words.setdefault(letter, ...)` call.

## Try It Yourself

1. Call `.set("M", 98)` twice with different values and confirm the
   second call's value is the one `.get("M")` returns — proof `.set()`
   overwrites by default, which is exactly why the real project code
   guards it with `.has()` first when "first one wins" is the actual
   rule needed.
2. Convert a `Map` back into a plain array of `[key, value]` pairs with
   `Array.from(wordValues)` (or spread: `[...wordValues]`) and log it —
   confirm each entry is a real two-element array, proving a `Map` is
   genuinely iterable in a way a plain object isn't without
   `Object.entries()` first.
3. Try using a non-string value as a key — `wordValues.set(42, "answer")`
   — and confirm it works and `.get(42)` (the real number, not the
   string `"42"`) retrieves it correctly. Reason about why this would
   not work as cleanly on a plain object, where every key becomes a
   string.
