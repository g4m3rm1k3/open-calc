# TypeScript Prerequisite 02: Intermediate TypeScript

## What this post is for

Same contract as Prereq 01: orientation, not mastery. This post covers the
TypeScript features that appear in the glossary posts but weren't covered
in Prereq 01 — generics, type aliases, array methods, error handling,
`async`/`await`, and a few practical pitfalls specific to TypeScript's
environment. You'll see every one of these again, re-taught in context,
inside the glossary posts. Read this once to have the shape, then let the
glossary do the real teaching.

## What you need to know first

TypeScript Prereq 01. Specifically: type annotations, `interface`,
`class` with `public`/`private`, union types (`string | null`), and the
`const`/`let` distinction. If any of those feel shaky, revisit Prereq 01
before continuing here.

---

## Part 1: `type` aliases

In Prereq 01 you saw `interface` for describing the shape of an object.
TypeScript also has a `type` keyword that creates a named alias for *any*
type — not just object shapes:

```typescript
type UserId = number;
type UserName = string;
type Status = "active" | "inactive" | "banned";
```

**Reading this:** `type Status = "active" | "inactive" | "banned"` creates
an alias called `Status` that can only ever hold one of those three exact
string values — nothing else. This is called a **string literal union
type**, and it's one of TypeScript's genuinely useful features: a variable
declared as `Status` will produce a compile error if you try to assign
any string other than those three. Python has no equivalent — you'd
typically use an `Enum` class or just rely on convention and documentation.

**`type` vs `interface` — when to use which:**

- `interface` — for describing the shape of an object (properties and
  methods). Preferred when defining contracts that classes will
  `implement`.
- `type` — for everything else: function signatures, union types, string
  literal unions, aliases for primitives, or cases where you're combining
  multiple types together.

In practice, for object shapes, both often work — and you'll see both used
in the glossary posts. The rule of thumb: if a class needs to `implement`
it, use `interface`. If it's a function type, union, or simple alias,
use `type`.

**Function type aliases** — something you'll see constantly in the glossary
posts:

```typescript
type ClickHandler = (event: string) => void;
type Transformer = (input: number) => number;
```

These name the *shape* of a function: what parameters it takes, what it
returns. A variable declared as `ClickHandler` can only hold a function
that takes exactly one `string` parameter and returns nothing. This is
how the glossary posts type callbacks and strategy functions — instead of
writing the full `(event: string) => void` type inline every place it
appears, they define a named alias once and use the name throughout.

---

## Part 2: Generics — `<T>`

Generics are TypeScript's way of writing code that works with *any* type
while still being type-safe. Python has no direct equivalent — Python
functions accept any type by default, and type checking on generic
containers is handled differently (via `list[int]` hints and runtime
tools).

Start with the problem generics solve:

```typescript
function identity(value: any): any {
  return value;
}
```

This function accepts anything and returns anything — no type safety at
all. `any` is TypeScript's escape hatch, a way of saying "don't check
this." Using `any` defeats the purpose of TypeScript, because anything
you do with an `any` value is unchecked.

The generic solution:

```typescript
function identity<T>(value: T): T {
  return value;
}
```

**Reading this:** `<T>` declares a **type parameter** — a placeholder for
"whatever type the caller actually uses." `value: T` means the parameter
must be of type `T`. `: T` at the end means the return type is also `T` —
the same type as the input. When you call it:

```typescript
const result1 = identity<string>("hello");  // T is string
const result2 = identity<number>(42);       // T is number
```

TypeScript substitutes `string` for `T` in the first call and `number` in
the second — and verifies that everything passed in and returned is
consistent with that substitution. You get "works with any type" *and*
"fully type-checked" at the same time.

**You usually don't need to write `<string>` explicitly** — TypeScript
infers it:

```typescript
const result1 = identity("hello");  // TypeScript infers T = string
const result2 = identity(42);       // TypeScript infers T = number
```

**Where you'll see generics in the glossary posts:**

- `Record<K, V>` — a built-in generic type (covered properly below)
- Classes with generic type parameters:
  `class Box<T> { constructor(public value: T) {} }`
- Interfaces with generic type parameters:
  `interface Repository<T> { findById(id: number): T | null; }`

The mental model: every time you see `<SomeName>` after a class, function,
or interface name, it's a type placeholder being filled in at the point
of use. You don't need to understand the full theory of generics — just
recognize the shape and know that `T` (or `K`, `V`, `E` — any single
letter) is a stand-in for "whatever type you're actually working with here."

---

## Part 3: `Record<K, V>` and other built-in generic types

The glossary posts use `Record<K, V>` constantly. It's a built-in
TypeScript generic type that describes a plain JavaScript object used as
a dictionary — keys of type `K`, values of type `V`:

```typescript
const ages: Record<string, number> = {
  Alice: 30,
  Bob: 25,
};
```

**Python equivalent:** `dict[str, int]` — the same idea, different syntax.

Common built-in generic types you'll encounter:

| TypeScript | Python equivalent | Means |
|---|---|---|
| `Record<string, number>` | `dict[str, int]` | Object/dict with string keys, number values |
| `number[]` or `Array<number>` | `list[int]` | Array/list of numbers |
| `string[]` | `list[str]` | Array/list of strings |
| `T[]` | `list[T]` | Array of any type T |
| `Promise<number>` | *(see Part 6)* | A value that will eventually be a number |

`number[]` and `Array<number>` are exactly equivalent — `T[]` is just
shorthand for `Array<T>`. You'll see both forms in the glossary posts,
used interchangeably.

---

## Part 4: Array methods — `filter`, `map`, `reduce`

JavaScript/TypeScript arrays have three methods you'll see repeatedly in
the glossary posts. All three take a function (usually an arrow function)
as their argument. Python has direct equivalents.

**`.filter()` — keep only items matching a condition:**

```typescript
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter((n) => n % 2 === 0);
// evens: [2, 4]
```

Python equivalent: `[n for n in numbers if n % 2 == 0]`

`.filter()` returns a *new* array containing only the items for which the
callback returned `true`. The original array is never modified.

**`.map()` — transform every item:**

```typescript
const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map((n) => n * n);
// squares: [1, 4, 9, 16, 25]
```

Python equivalent: `[n * n for n in numbers]`

`.map()` returns a new array with each item replaced by whatever the
callback returned for it. Same length as the original, different values.

**`.reduce()` — accumulate a single result from all items:**

```typescript
const numbers = [1, 2, 3, 4, 5];
const total = numbers.reduce((sum, n) => sum + n, 0);
// total: 15
```

Python equivalent: `sum(numbers)` for this specific case, or
`functools.reduce(lambda acc, n: acc + n, numbers, 0)` for the general
form.

`.reduce(callback, initialValue)` starts with `initialValue` (here `0`),
then calls `callback(accumulator, currentItem)` once per item — whatever
the callback returns becomes the new accumulator for the next call. After
all items, the final accumulator is returned. This is the accumulator
pattern from this series' loops post, expressed as a single method call.

**`.forEach()` — do something for each item without building a new array:**

```typescript
numbers.forEach((n) => console.log(n));
```

Python equivalent: a plain `for n in numbers: print(n)` loop.

`.forEach()` is the simplest — it calls the callback once per item and
returns nothing. Unlike the other three, it's not about producing a new
value; it's purely for side effects (printing, updating something external,
etc.). The glossary posts mostly use `for...of` loops instead of
`.forEach()` because they read more clearly — but you'll see `.forEach()`
in real TypeScript code constantly.

---

## Part 5: Error handling — `try`/`catch` and `instanceof`

Python:

```python
try:
    result = risky_operation()
except ValueError as e:
    print(f"Caught: {e}")
```

TypeScript:

```typescript
try {
  const result = riskyOperation();
} catch (error) {
  if (error instanceof Error) {
    console.log(`Caught: ${error.message}`);
  }
}
```

**The key difference:** Python's `except ValueError` catches only
`ValueError` specifically. TypeScript's `catch (error)` catches
*anything* — because JavaScript allows `throw`ing any value at all (a
string, a number, an object — not just proper `Error` instances). This
means `error` arrives with the type `unknown` inside the catch block, and
TypeScript requires you to check what you actually caught before accessing
its properties.

`error instanceof Error` checks whether the caught value is actually an
instance of JavaScript's built-in `Error` class. After that check,
TypeScript narrows the type from `unknown` to `Error`, and `error.message`
becomes accessible. This pattern — `catch (error) { if (error instanceof
Error) { ... } }` — is the standard, safe TypeScript way to handle errors,
and you'll see it in every glossary post that involves `try`/`catch`.

**Throwing errors:**

Python: `raise ValueError("something went wrong")`
TypeScript: `throw new Error("something went wrong")`

`throw` is the keyword (not `raise`), and `new Error(...)` creates a new
error object. The `new` is required — unlike Python's `raise ValueError()`,
you can't just `throw Error("...")` without `new` (well, you can, but
it's not idiomatic — always use `new Error(...)`).

---

## Part 6: `async`/`await` and `Promise` — just enough to not be lost

The glossary posts occasionally use `async`/`await` for examples that
simulate real-world patterns like network calls or delayed operations.
This is a full topic covered in its own dedicated glossary post — but here
is enough to not be confused when you see it.

**The problem:** JavaScript is single-threaded. When you do something
that takes time — reading a file, making a network request, waiting for
a database — you don't want the entire program to freeze and wait. Python
solves this with threads or `asyncio`; JavaScript solves it with an
**event loop** and **Promises**.

**`Promise<T>`:** A `Promise<T>` represents a value that doesn't exist
*yet* but will eventually be of type `T`. It's JavaScript's built-in
mechanism for "I've started this work, here's a placeholder — come back
when it's done."

**`async`/`await`:** Instead of working with Promises directly (which
requires chaining `.then()` calls, which gets messy), `async`/`await` lets
you write asynchronous code that *looks* synchronous:

```typescript
async function fetchUser(id: number): Promise<string> {
  const result = await someAsyncOperation(id);
  return result.name;
}
```

- `async function` marks a function as asynchronous — it can use `await`
  inside it and automatically returns a `Promise`
- `await` pauses *this specific function* until the `Promise` resolves —
  other code can run in the meantime
- The return type `Promise<string>` means "this function eventually
  produces a `string`"

**Python comparison:** `async def` / `await` in Python's `asyncio` — the
syntax is nearly identical, the underlying mechanism is similar, the key
difference being Python's event loop implementation details versus
JavaScript's.

**What you need to recognize in the glossary posts:**

- When you see `async function` or a method prefixed with `async`, that
  function returns a Promise
- When you see `await someCall()`, that line pauses until the Promise
  resolves
- When you see `async function main() { ... } main();` at the bottom of
  a file, it's the standard pattern for running async code at the top
  level of a script

You don't need to understand Promises deeply to follow the glossary posts
— the dedicated async/await post covers them properly. Just recognize the
shape.

---

## Part 7: The `!` non-null assertion — and when not to use it

When TypeScript knows a value *might* be null (because its type is
`Something | null`), it refuses to let you use it as if it's definitely
not null:

```typescript
const user: User | null = findUser(42);
user.name;  // compile error: Object is possibly 'null'
```

Sometimes you know more than the compiler does — you know for structural
reasons that this specific value cannot be null at this point, even though
the type says it could be. TypeScript provides an escape hatch:

```typescript
user!.name;  // the ! tells the compiler "trust me, this isn't null"
```

The `!` is the **non-null assertion operator**. It suppresses the null
check entirely for that specific expression — the compiler accepts it
without complaint. The cost: if you're wrong (if the value actually *is*
null at runtime), you get a crash. `!` doesn't add any runtime protection;
it just tells the compiler to stop checking.

**When it's appropriate:** When the design of your code guarantees a value
has been set before it's accessed, but that guarantee isn't visible to
the compiler from the type alone. The glossary posts use `!` in specific,
narrow situations — always with an explanation of what the design
guarantee is.

**When it's not appropriate:** As a general "I can't figure out the null
check, so let me just add `!` and make the error go away." This is the
`!` being misused as a shortcut, hiding a real problem rather than solving
it. Every `!` in production code deserves a comment explaining why the
null case is impossible here.

---

## Part 8: DOM type collisions — a practical pitfall

The TypeScript compiler ships with built-in type definitions for the
browser's DOM (the Document Object Model — the browser's programming
interface for web pages). These definitions include types with common
names like `Cache`, `Event`, `Request`, `Response`, `URL`, and many
others.

When you compile TypeScript for a non-browser environment (like Node.js,
which is what the glossary posts use), these DOM type definitions are
still included by default — and if you name your own class `Cache` or
`Request`, the compiler sees two definitions of the same name and refuses
to compile.

**What this looks like:**

```
error TS2300: Duplicate identifier 'Cache'.
```

**The fix:** Use a more specific name for your class. Rather than `Cache`,
use `ResultCache` or `ComputationCache`. Rather than `Request`, use
`HttpRequest` or `ApiRequest`. This isn't a flaw in your code — it's a
naming collision with a browser API you're not even using, and a more
descriptive name is usually better anyway.

You saw this issue fixed in Glossary Posts 03 and 06 of this series —
`ErrorCallback` renamed to `ErrorHandler`, and `Cache` renamed to
`ResultCache`. Now you know why.

---

## Part 9: `for...of` — iterating over arrays

You've already seen this in the glossary posts, but it's worth making
the Python comparison explicit:

Python:
```python
for item in my_list:
    print(item)
```

TypeScript:
```typescript
for (const item of myArray) {
  console.log(item);
}
```

`for...of` is TypeScript/JavaScript's closest equivalent to Python's
`for...in` loop over a list — it iterates over the *values* of an array
(or any iterable), one at a time. The `const` declares `item` as a
block-scoped variable that exists only for that one iteration.

**JavaScript also has `for...in`** (which iterates over an object's *keys*,
not its values) — this is different from Python's `for...in` and
potentially confusing. In the glossary posts, `for...of` is always used
for arrays. You'll rarely need `for...in`.

---

## Connect the pieces

This post covered the TypeScript features that appear most often in the
glossary posts without a full derivation: `type` aliases (especially
function type aliases), generics `<T>` (a placeholder for "whatever type
you're working with"), `Record<K,V>` and `T[]` (typed collections),
`.filter()`/`.map()`/`.reduce()` (array methods that take functions),
`try`/`catch` with `instanceof Error` (error handling that handles
TypeScript's "catch anything" behavior safely), `async`/`await` (enough
to recognize the shape), the `!` non-null assertion (and when to distrust
it), and the DOM type collision pitfall (rename your class if it conflicts
with a browser API name).

None of these require mastery from this post alone. Every one of them
will appear again in the glossary posts, re-explained in context, in
service of a real pattern. This post's job was to give you the shape so
the re-teaching lands on prepared ground.

## Definition of done

Recognition, not recall:

- [ ] You can read `type Handler = (msg: string) => void` and explain
      what it declares.
- [ ] You can read `function wrap<T>(value: T): T` and explain what
      `T` is doing.
- [ ] You know what `Record<string, number>` means and its Python
      equivalent.
- [ ] You can read a `.filter()`, `.map()`, or `.reduce()` call and
      roughly describe what it produces.
- [ ] You know why TypeScript's `catch (error)` requires an
      `instanceof Error` check before accessing `error.message`.
- [ ] You know what `async function` and `await` signal, even without
      understanding Promises fully yet.
- [ ] You know what `!` does in `user!.name` and why it's a trade-off,
      not a fix.
- [ ] You know why naming a class `Cache` or `Request` can cause a
      compile error in Node.js TypeScript projects.
