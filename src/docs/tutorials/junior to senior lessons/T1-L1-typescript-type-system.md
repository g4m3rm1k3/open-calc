# Junior to Senior — T1·L1 — The TypeScript Type System

**Prerequisites:** T1·L0g (Iterators and Generators). You have used TypeScript
in the previous lessons. This lesson formalises the type system itself — how
types work, how TypeScript checks them, and the special types that govern edge cases.

**What this lab adds:**
- Structural typing — why shape matters more than name
- `unknown` as a safe alternative to `any`
- `never` — the type of impossible things
- `void` — the return type of functions that return nothing
- Type inference — when TypeScript figures it out without annotation

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. TypeScript is structural, not nominal. What does that mean for two
>    interfaces with the same shape but different names?
> 2. What is the difference between `any` and `unknown`? When would you
>    use each?
> 3. A function calls `throw new Error(...)` and never returns. What is
>    its return type?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact validation pipeline that demonstrates each type system feature:

```
$ npx ts-node type-system.ts

--- Structural Typing ---
Person and Contact are compatible — same shape
Email is not assignable to FullName (different shape)

--- unknown vs any ---
Parsed JSON (unknown): must narrow before using
Name extracted safely: Alice

--- never for exhaustive checks ---
All contact types handled
Unhandled type caught at COMPILE TIME — not runtime
```

---

### Concept: Structural Typing — Shape Is the Contract

**What it is:** TypeScript uses *structural* typing: two types are compatible
if one has at least all the properties of the other, regardless of their names.
This contrasts with *nominal* typing (Java, C#) where types must explicitly
declare they are related.

**The problem before (in nominal languages):**
```java
// Java — nominal typing:
class Person { String name; }
class Contact { String name; }

// Even though both have 'name', you CANNOT pass a Person where Contact is expected.
// They are different types because they have different class declarations.
```

**The solution (structural typing):**
```ts
// TypeScript — structural typing:
interface Person  { name: string }
interface Contact { name: string }

function greet(p: Person): void { console.log(p.name); }

const contact: Contact = { name: 'Alice' };
greet(contact);  // ✓ — Contact has all properties Person requires
```

**What it hides:** Structural typing hides the requirement to explicitly declare
type relationships. You do not write `Contact implements Person`. TypeScript
automatically checks whether the shapes are compatible. This makes TypeScript
work seamlessly with plain JavaScript objects and third-party libraries.

The invariant: type compatibility is determined by structure alone. If type B
has all the properties of type A (and possibly more), then B is assignable to A.

**Canonical example:** Structural typing is like a security checkpoint that
checks your bag for prohibited items. If your bag contains no prohibited items,
it passes — regardless of who owns the bag or what brand it is. Nominal typing
is like a policy that only lets employees with a specific badge through —
the badge matters, not the bag's contents.

**Smallest possible example:**
```ts
interface Printable { print(): void }

class Document {
  print() { console.log('document'); }
}

class Image {
  print() { console.log('image'); }
}

function printAll(items: Printable[]): void {
  items.forEach(item => item.print());
}

// Document and Image are both Printable — neither declares it:
printAll([new Document(), new Image()]);
```

**You will see this again in:** Working with third-party libraries (you define
the shape you need; any object matching it works), React component props,
functional patterns (pass any object with the right methods). This is why
TypeScript works so well with existing JavaScript.

**Career signal:** "Explain the difference between structural and nominal typing"
is a TypeScript interview question that distinguishes developers who understand
the language from those who just use it.

**Watch for:** Excess property checking — TypeScript is stricter with object
literals than with variables. `greet({ name: 'Alice', extra: true })` is an
error (object literal), but `const x = { name: 'Alice', extra: true }; greet(x)`
is fine (variable, no excess checking). This surprises many developers.

---

## Step 1 — Structural Typing in Practice

Create `type-system.ts`:

```ts
console.log('--- Structural Typing ---');

interface Person  { name: string; age: number }
interface Contact { name: string; age: number; email: string }

// Contact has all of Person's properties (and one more):
function describePerson(p: Person): void {
  console.log(`${p.name}, age ${p.age}`);
}

const contact: Contact = { name: 'Alice', age: 30, email: 'alice@example.com' };

// Contact is assignable to Person — it has everything Person needs:
describePerson(contact);  // ✓

// type aliases with different names but same shape:
type EmailAddress = { value: string; domain: string };
type FullName     = { value: string; domain: string };  // same shape, different intent

const email: EmailAddress = { value: 'alice', domain: 'example.com' };
const name:  FullName     = email;  // ✓ — same structure; TypeScript allows this

console.log('Person and Contact are compatible — same shape');
console.log('Email is assignable to FullName (same shape, structural typing)');
```

### SAVE AND TRY

```bash
npx ts-node type-system.ts
```

Expected:
```
--- Structural Typing ---
Alice, age 30
Person and Contact are compatible — same shape
Email is assignable to FullName (same shape, structural typing)
```

**Change something:** Change `FullName` to `{ value: string; domain: string; title: string }`.
Now `email` is NOT assignable to `FullName` — it is missing `title`. TypeScript
reports a compile error. The shape no longer matches.

---

### Concept: `any` vs `unknown` — Escape Hatch vs Safe Unknown

**What it is:** `any` disables TypeScript's type checking for a value — it
accepts any operation without complaint. `unknown` represents a value whose
type is genuinely unknown, but forces you to narrow it before using it.

**The problem before:**

```ts
// JSON.parse returns 'any' — TypeScript accepts everything:
const data: any = JSON.parse('{"name":"Alice"}');
data.name.toUpperCase();    // OK
data.nonexistent.method();  // No compile error — but crashes at runtime!
data.toFixed(2);            // No compile error — but crashes at runtime!
```

`any` is an escape hatch that disables safety. Every `any` is a potential
runtime crash waiting to happen.

**The solution:**

```ts
// Use unknown — TypeScript forces you to check the type first:
const data: unknown = JSON.parse('{"name":"Alice"}');
data.name;            // compile error — cannot access property of unknown
data.toUpperCase();   // compile error — cannot call method on unknown

// Must narrow before use:
if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log((data as { name: string }).name); // now safe
}
```

**What it hides:** `unknown` hides nothing — it forces you to handle all
possibilities explicitly. `any` hides all type errors, including future crashes.
Use `unknown` at the boundary of your application (parsing external data);
use `any` only when you have exhausted all other options.

The invariant: a value of type `unknown` cannot be used in any way until its
type is narrowed. TypeScript ensures that every use of an `unknown` value is
preceded by a type check.

**Canonical example:** `any` is like giving your house key to a stranger and
saying "trust me." `unknown` is like giving your house key to a stranger only
after verifying their ID, signing a contract, and confirming they are the plumber
you hired. Both let the stranger enter, but only one requires proof first.

**Smallest possible example:**
```ts
function processInput(value: unknown): string {
  if (typeof value === 'string') return value.toUpperCase();
  if (typeof value === 'number') return value.toFixed(2);
  if (Array.isArray(value))      return value.join(', ');
  return String(value);  // fallback
}
```

**You will see this again in:** Parsing JSON from APIs, reading from `localStorage`,
handling event data, wrapping third-party libraries that return `any`, error
handling (`catch (error: unknown)`). Every boundary between typed and untyped
code should use `unknown`, not `any`.

**Career signal:** "When would you use `any` vs `unknown`?" is a standard
TypeScript interview question. The correct answer is "almost never `any`;
`unknown` at system boundaries."

**Watch for:** `catch (error: unknown)` — in TypeScript 4+, the caught error
is `unknown` by default (enabled by `useUnknownInCatchVariables`). You must
narrow it before accessing `.message` or `.stack`. Many developers still write
`error.message` assuming it is `Error` — which crashes if someone throws a
string or number.

---

## Step 2 — `any` vs `unknown`

```ts
console.log('\n--- unknown vs any ---');

// Simulate receiving JSON from an API — type is unknown:
const rawApiResponse: unknown = JSON.parse('{"name":"Alice","age":30}');

// Cannot use without narrowing:
// console.log(rawApiResponse.name); // compile error — good!

// Narrow before use — type guard checks the shape:
function isContactData(value: unknown): value is { name: string; age: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as Record<string, unknown>).name === 'string'
  );
}

if (isContactData(rawApiResponse)) {
  // Inside this block, TypeScript knows the shape:
  console.log('Name extracted safely:', rawApiResponse.name);
  console.log('Age:', rawApiResponse.age);
} else {
  console.log('Unexpected API response shape');
}
```

### SAVE AND TRY

```bash
npx ts-node type-system.ts
```

Expected:
```
--- unknown vs any ---
Name extracted safely: Alice
Age: 30
```

**Change something:** Change `rawApiResponse: unknown` to `rawApiResponse: any`.
The type guard is now unnecessary — TypeScript accepts `rawApiResponse.name` directly.
This feels easier but is unsafe. Change `rawApiResponse` to `JSON.parse('"not an object"')`.
With `any`, `rawApiResponse.name` is `undefined` at runtime with no compile warning.
With `unknown`, TypeScript forces you to handle this case.

---

### Concept: `never` — The Impossible Type

**What it is:** `never` is the type of values that can never exist. A function
that always throws or never returns has return type `never`. `never` is the
bottom type — it is a subtype of every type, but no type is assignable to it.

**Three uses of `never`:**

**1. Functions that never return:**
```ts
function throwError(message: string): never {
  throw new Error(message);  // always throws — never returns
}

function infiniteLoop(): never {
  while (true) {}  // never returns
}
```

**2. Exhaustive union checking:**
```ts
type ContactType = 'person' | 'company' | 'bot';

function describe(type: ContactType): string {
  switch (type) {
    case 'person':  return 'A person';
    case 'company': return 'A company';
    case 'bot':     return 'A bot';
    default:
      const exhausted: never = type;
      // If a new type is added to ContactType without updating this switch,
      // TypeScript raises a compile error here — because 'newType' is not 'never'.
      throw new Error(`Unhandled contact type: ${exhausted}`);
  }
}
```

**3. Narrowed impossibilities:**
```ts
function process(value: string | number): void {
  if (typeof value === 'string') {
    value;  // string here
  } else if (typeof value === 'number') {
    value;  // number here
  } else {
    value;  // never here — all cases handled
  }
}
```

**What it hides:** `never` in the exhaustive check hides the manual bookkeeping
of "have I handled every case?" TypeScript infers which type remains after all
narrowing, and if it is `never`, every case is handled. If it is not `never`,
a case is missing.

The invariant: assigning a value to `never` is a compile error if that value
could actually exist. This is the mechanism: `const x: never = remainingValue`
fails if `remainingValue` is anything other than `never`.

**Canonical example:** `never` is like an item on an "impossible" checklist.
"Have we handled every case?" — TypeScript checks by asking whether anything
is left. If nothing is left, the remaining type is `never` — a mathematical
proof that all cases are covered.

**You will see this again in:** Every discriminated union (lesson T1-L3),
error throwing utilities, the exhaustive switch pattern in domain models.
Anytime you have a union type and want the compiler to catch missing cases
when the union grows.

**Watch for:** The exhaustive check requires a `default` branch that assigns
to `never`. Without assigning to `never`, TypeScript does not check exhaustiveness
— it simply ignores the `default`. The assignment `const _: never = value` is
the mechanism that forces the check.

---

## Step 3 — `never` for Exhaustive Checks

```ts
console.log('\n--- never for exhaustive checks ---');

type ContactType = 'person' | 'company';

function describeType(type: ContactType): string {
  switch (type) {
    case 'person':  return 'An individual person';
    case 'company': return 'A company or organisation';
    default: {
      // If a new ContactType is added but not handled above,
      // this line becomes a compile error — the compiler catches it:
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled contact type: ${exhaustiveCheck}`);
    }
  }
}

console.log(describeType('person'));
console.log(describeType('company'));
console.log('All contact types handled');

// To see the exhaustive check work, add 'bot' to the ContactType union:
// type ContactType = 'person' | 'company' | 'bot';
// TypeScript immediately reports: Type 'string' is not assignable to type 'never'
// — because 'bot' was not handled in the switch.
```

### SAVE AND TRY

```bash
npx ts-node type-system.ts
```

Expected:
```
--- never for exhaustive checks ---
An individual person
A company or organisation
All contact types handled
```

**Change something:** Add `'bot'` to the `ContactType` union:
`type ContactType = 'person' | 'company' | 'bot'`. TypeScript immediately
shows a compile error in the `default` case — `'bot'` is not `never`.
Add `case 'bot': return 'An automated bot'` to fix it. The error disappears.
This is the exhaustive check working: it proves at compile time that every
type is handled.

---

### Concept: `void` and Type Inference

**`void` — the return type of functions that return nothing:**

`void` means the return value is intentionally absent or will be ignored.
A function that logs to the console and returns `undefined` should have
return type `void`.

```ts
function log(message: string): void {
  console.log(message);
  // no return — implicitly returns undefined
}
```

`void` differs from `never`: a `void` function finishes executing and returns
`undefined`. A `never` function does not return at all.

**Type inference — TypeScript figuring out the type without annotation:**

TypeScript infers types from context. You rarely need to annotate every variable:

```ts
const name = 'Alice';          // TypeScript infers: string
const age  = 30;               // TypeScript infers: number
const tags = ['vip', 'active']; // TypeScript infers: string[]

// Function return type is inferred:
function double(n: number) {   // TypeScript infers return type: number
  return n * 2;
}

// Hover in your IDE to see the inferred type without writing it
```

**When to annotate vs when to let TypeScript infer:**

- Infer when the value is an obvious literal: `const x = 42`
- Annotate when the intent differs from the inferred type: `const ids: string[] = []`
  (empty array is inferred `never[]` without annotation)
- Annotate function parameters always — TypeScript cannot infer them
- Annotate public function return types — makes the API explicit

---

## Step 4 — `void` and Inference

```ts
console.log('\n--- void and Inference ---');

// void return type — function returns nothing meaningful:
function logContact(name: string): void {
  console.log(`Contact: ${name}`);
  // no return needed — void functions implicitly return undefined
}

logContact('Alice');

// Type inference — no annotations needed for obvious types:
const contactName = 'Bob';               // inferred: string
const contactAge  = 25;                  // inferred: number
const activeTags  = ['vip', 'newsletter']; // inferred: string[]

// BUT empty arrays need annotation — TypeScript infers never[] otherwise:
const emptyList: string[] = [];          // annotated: string[]
// const broken = [];                    // inferred: never[] — cannot push strings later

// Hover over these in your IDE to confirm the inferred types:
console.log(typeof contactName, typeof contactAge, Array.isArray(activeTags));
```

### SAVE AND TRY

```bash
npx ts-node type-system.ts
```

Expected:
```
--- void and Inference ---
Contact: Alice
string number true
```

**Change something:** Uncomment `const broken = []` and try `broken.push('Alice')`.
TypeScript reports: `Argument of type 'string' is not assignable to parameter of type 'never'`.
The array was inferred as `never[]` — an array that can never have elements.
Add the annotation `const fixed: string[] = []` and `fixed.push('Alice')` — now it works.

---

## 🎯 Challenge: Typed Error Handler

**You know:** `unknown` for unsafe values, `never` for impossible cases,
type guards for narrowing.

**Task:** Write a function `handleError(error: unknown): string` that returns
a human-readable message from any thrown value. Handle:
- `Error` instances — return the `message`
- Strings — return them directly
- Objects with a `message` string field — return the `message`
- Arrays — return the items joined by `, `
- Everything else — return `'An unknown error occurred'`

```ts
console.log(handleError(new Error('File not found')));    // 'File not found'
console.log(handleError('Something went wrong'));          // 'Something went wrong'
console.log(handleError({ message: 'Server error' }));    // 'Server error'
console.log(handleError([404, 'Not Found']));             // '404, Not Found'
console.log(handleError(42));                              // 'An unknown error occurred'
```

**Hint:** Use `instanceof Error`, `typeof`, `Array.isArray()`, and `'message' in value`
to narrow the type at each step.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function handleError(error: unknown): string {
  // Error instance:
  if (error instanceof Error) {
    return error.message;
  }

  // String:
  if (typeof error === 'string') {
    return error;
  }

  // Array:
  if (Array.isArray(error)) {
    return error.join(', ');
  }

  // Object with a string 'message' field:
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  // Unknown:
  return 'An unknown error occurred';
}

console.log(handleError(new Error('File not found')));   // File not found
console.log(handleError('Something went wrong'));         // Something went wrong
console.log(handleError({ message: 'Server error' }));   // Server error
console.log(handleError([404, 'Not Found']));            // 404, Not Found
console.log(handleError(42));                             // An unknown error occurred
```

**Key insight:** Each `if` block narrows the type of `error`. Inside
`if (error instanceof Error)`, TypeScript knows `error` is an `Error`.
Inside `if (typeof error === 'string')`, TypeScript knows it is `string`.
By the end, everything plausible has been handled — the final `return` is
genuinely a catch-all for the impossible-to-narrow cases (numbers, booleans, etc.).
This is the correct pattern for `catch (error: unknown)` blocks in production code.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Structural compatibility | Assign a wider type to a narrower interface | No error if shapes match |
| Excess property check | `greet({ name: 'A', extra: true })` as literal | Compile error |
| `unknown` requires narrowing | `const x: unknown = 5; x.toFixed()` | Compile error |
| `any` skips checking | `const x: any = 5; x.toFixed()` | No error (unsafe) |
| `never` in exhaustive check | Add unhandled case to union | Compile error at `never` assignment |
| `void` accepts no value | Try `return 42` from a `void` function | Compile error |
| Inference on empty array | `const x = []; x.push('a')` | Compile error (never[]) |

---

## Quick Check Answers

**1. Two interfaces with the same shape but different names — are they compatible?**

Yes — TypeScript uses structural typing. If both interfaces have identical
property names and types, values of one are assignable to the other. The names
are irrelevant. A `Person` with `{ name: string }` and a `Contact` with
`{ name: string }` are mutually assignable. This is intentional: TypeScript
is designed to work with plain JavaScript objects, which have no concept of
"nominal type declarations."

**2. `any` vs `unknown`?**

`any` disables type checking entirely — TypeScript accepts any operation on an
`any` value, including ones that will crash at runtime. `unknown` represents
a value of unknown type but enforces that you check the type before using it.
`unknown` requires narrowing (via `typeof`, `instanceof`, or a type guard) before
any property access or method call. Use `unknown` at system boundaries (parsing
JSON, handling caught errors, receiving data from external systems). Use `any`
only as a last resort when nothing else works — it is an escape hatch, not a default.

**3. A function that always throws — what is its return type?**

`never`. A function that always throws cannot return a value of any type because
it never reaches a `return` statement. `never` is the bottom type — the return
type of functions that provably cannot complete normally. TypeScript uses this
to help with control flow analysis: after calling a `never`-returning function,
TypeScript knows the subsequent code is unreachable.
