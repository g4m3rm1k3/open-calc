# Junior to Senior — T1·L2 — Generics and Utility Types

**Prerequisites:** T1·L1 (TypeScript Type System). You know structural typing,
`unknown`, and `never`. This lesson covers how to write reusable, type-safe
code that works across multiple types.

**What this lab adds:**
- Generic functions — writing logic once, typed for any value
- Generic constraints — restricting what T can be
- Generic interfaces and classes
- Built-in utility types: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`
- Extracting types from functions: `ReturnType` and `Parameters`

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You write a function that wraps any value in an object: `{ value: x }`.
>    Without generics, what type does the return value have? What type with generics?
> 2. `Partial<Contact>` makes all fields optional. When would you use this
>    instead of defining a separate optional interface?
> 3. `Omit<Contact, 'password'>` — what does this produce?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A type-safe API response wrapper and a contact update system:

```
$ npx ts-node generics.ts

--- Generic Functions ---
Wrapped string: { value: 'Alice', timestamp: 1234567890 }
Wrapped number: { value: 42, timestamp: 1234567890 }
Type preserved — no casting needed

--- Generic Constraints ---
Longest name: Charlie (7 chars)

--- Utility Types ---
Partial update — only changed fields:
{ email: 'alice-new@example.com' }

Public contact (no password):
{ name: 'Alice', email: 'alice@example.com', city: 'London' }
```

---

### Concept: Generic Functions — One Function, Any Type

**What it is:** A generic function uses a type parameter (by convention `T`)
as a placeholder for a specific type. The caller's type is substituted at each
call site, preserving type information throughout.

**The problem before:**

```ts
// Without generics — must choose one type:
function wrapString(value: string): { value: string } {
  return { value };
}
function wrapNumber(value: number): { value: number } {
  return { value };
}
// Duplicated logic for every type — not maintainable.

// Or — using 'any' — loses type information:
function wrapAny(value: any): { value: any } {
  return { value };
}
const wrapped = wrapAny('Alice');
wrapped.value.toFixed(); // no compile error — crashes at runtime!
```

**The solution:**

```ts
function wrap<T>(value: T): { value: T } {
  return { value };
}

const wrappedStr = wrap('Alice');  // T = string; returns { value: string }
const wrappedNum = wrap(42);       // T = number; returns { value: number }

wrappedStr.value.toUpperCase();    // ✓ — TypeScript knows it's a string
wrappedNum.value.toFixed(2);       // ✓ — TypeScript knows it's a number
wrappedStr.value.toFixed(2);       // compile error — string has no toFixed
```

**What it hides:** Generics hide the need to duplicate logic for each type
OR to sacrifice type safety with `any`. TypeScript substitutes the actual
type at each call and propagates it through the return type, parameters, and
any intermediate expressions.

The invariant: `T` is consistent within a single call. If `wrap<T>` is called
with `T = string`, every use of `T` inside that call is `string`.

**Canonical example:** A generic function is like a factory stamp. The stamp's
shape (the function's logic) is fixed. The material (the type T) varies.
Stamping metal gives a metal widget. Stamping plastic gives a plastic widget.
The stamping operation is the same; the material determines the result type.

**Smallest possible example:**
```ts
function identity<T>(value: T): T {
  return value;
}

const str = identity('hello');   // T = string; returns string
const num = identity(42);        // T = number; returns number
const arr = identity([1, 2, 3]); // T = number[]; returns number[]
```

**You will see this again in:** React hooks (`useState<Contact | null>(null)`),
API client wrappers (`fetch<T>(url): Promise<T>`), collection operations,
any library function that works with user-provided types. Generics are the
foundation of every typed library.

**Career signal:** "Write a generic function that..." is a common TypeScript
interview task. Understanding when to add type parameters (and when not to —
if inference handles it) is a mid-to-senior-level skill.

**Watch for:** You can often omit the explicit type argument — TypeScript infers it
from the argument: `wrap('Alice')` is equivalent to `wrap<string>('Alice')`.
Only provide the type argument explicitly when inference fails or when you want
to enforce a specific type.

---

## Step 1 — Generic Functions

Create `generics.ts`:

```ts
console.log('--- Generic Functions ---');

// Generic function — T represents "whatever type the caller passes":
function wrapWithTimestamp<T>(value: T): { value: T; timestamp: number } {
  return {
    value,
    timestamp: Date.now(),
  };
}

// TypeScript infers T from the argument:
const wrappedName   = wrapWithTimestamp('Alice');  // T = string
const wrappedNumber = wrapWithTimestamp(42);        // T = number

// Type is preserved — no casting, no 'any':
console.log('Wrapped string:', wrappedName);
console.log('Wrapped number:', wrappedNumber);

// TypeScript knows the exact type of .value:
const upperName = wrappedName.value.toUpperCase();  // string method — ✓
const fixed     = wrappedNumber.value.toFixed(2);   // number method — ✓

console.log('Type preserved — no casting needed');
```

### SAVE AND TRY

```bash
npx ts-node generics.ts
```

Expected:
```
--- Generic Functions ---
Wrapped string: { value: 'Alice', timestamp: 1234567890 }
Wrapped number: { value: 42, timestamp: 1234567890 }
Type preserved — no casting needed
```

**Change something:** Try calling `wrappedName.value.toFixed(2)`.
Expected compile error: `Property 'toFixed' does not exist on type 'string'`.
TypeScript correctly infers `T = string` from the call site and rejects
number-only operations. This is the entire value of generics over `any`.

---

### Concept: Generic Constraints — Restricting `T`

**What it is:** A generic constraint limits which types `T` can be. Instead of
any type, `T extends U` requires `T` to be a subtype of `U` — to have at least
the properties of `U`.

**The problem before:**

```ts
// Unconstrained — T could be anything, including types without .length:
function longest<T>(a: T, b: T): T {
  return a.length > b.length ? a : b; // compile error — T might not have 'length'
}
```

**The solution:**

```ts
// Constrained — T must have a 'length' property:
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length > b.length ? a : b; // ✓ — 'length' is guaranteed
}

longest('abc', 'de');          // T = string (strings have .length)
longest([1, 2, 3], [1]);       // T = number[] (arrays have .length)
longest({ length: 5 }, { length: 3 }); // T = { length: number }
longest(42, 99);               // compile error — numbers have no .length
```

**What it hides:** Constraints hide the need to write separate overloads for
each type. One function works for any type with `length`. New types (typed arrays,
custom classes) automatically work if they have `length`.

**Canonical example:** A constraint is like a job requirement. "Must have a
driver's licence" does not specify who the employee is — it constrains the pool
of valid candidates. `T extends Driveable` does not specify which vehicle T is —
it constrains T to be something that can be driven.

**Smallest possible example:**
```ts
interface Nameable { name: string }

function getName<T extends Nameable>(item: T): string {
  return item.name;  // safe — T is guaranteed to have 'name'
}

getName({ name: 'Alice', age: 30 });  // ✓
getName({ name: 'London', population: 9000000 }); // ✓
getName({ age: 30 });                              // compile error — no 'name'
```

**You will see this again in:** React's `forwardRef<T>`, `Array.sort`'s
comparator, any utility function that works on objects with a known subset
of fields, keyof constraints for accessing object properties by variable key.

**Watch for:** `T extends U` means "T must have at least the properties of U."
T can have more — it cannot have less. This is the Liskov Substitution Principle
expressed as a type constraint.

---

## Step 2 — Generic Constraints

```ts
console.log('\n--- Generic Constraints ---');

// Constraint: T must have a string 'name' property:
function longestName<T extends { name: string }>(items: T[]): T {
  return items.reduce((longest, current) =>
    current.name.length > longest.name.length ? current : longest
  );
}

const contacts = [
  { name: 'Alice',   email: 'alice@example.com' },
  { name: 'Bob',     email: 'bob@example.com'   },
  { name: 'Charlie', email: 'charlie@example.com' },
];

const contactWithLongest = longestName(contacts);
console.log(`Longest name: ${contactWithLongest.name} (${contactWithLongest.name.length} chars)`);

// Also works for any object with a 'name' string:
const cities = [
  { name: 'London', country: 'UK' },
  { name: 'Paris',  country: 'France' },
];
const longestCity = longestName(cities);
console.log(`Longest city name: ${longestCity.name}`);
```

### SAVE AND TRY

```bash
npx ts-node generics.ts
```

Expected:
```
--- Generic Constraints ---
Longest name: Charlie (7 chars)
Longest city name: London
```

**Change something:** Try `longestName([{ city: 'London' }, { city: 'Paris' }])`.
Expected compile error: `Property 'name' is missing`. The constraint `T extends { name: string }`
rejects objects without `name`.

---

### Concept: Built-in Utility Types

**What it is:** TypeScript provides utility types that transform existing types
into new ones. These are the most commonly used:

| Utility type | What it produces |
|---|---|
| `Partial<T>` | All fields of T made optional |
| `Required<T>` | All fields of T made required (opposite of Partial) |
| `Readonly<T>` | All fields of T made readonly |
| `Pick<T, K>` | Only the fields named in K (subset) |
| `Omit<T, K>` | T without the fields named in K |
| `Record<K, V>` | An object type with keys K and values V |
| `ReturnType<F>` | The return type of function F |
| `Parameters<F>` | The parameter types of function F as a tuple |

**The problem before:**

```ts
// Without utility types — manual interface for every variant:
interface Contact { name: string; email: string; city: string; password: string }

// Separate interface for updates (all optional):
interface ContactUpdate { name?: string; email?: string; city?: string; }

// Separate interface for public view (no password):
interface PublicContact { name: string; email: string; city: string; }

// Four interfaces to maintain — add a field and you update all four.
```

**The solution:**

```ts
interface Contact { name: string; email: string; city: string; password: string }

type ContactUpdate = Partial<Contact>;               // all optional
type PublicContact  = Omit<Contact, 'password'>;     // no password
type ContactPreview = Pick<Contact, 'name' | 'email'>; // only name and email
```

**What it hides:** Utility types hide the manual duplication of interface
definitions. Change `Contact` and all derived types update automatically —
no risk of forgetting to update `ContactUpdate` when adding a field.

The invariant: utility types are computed from their source type at compile time.
Adding a field to `Contact` automatically adds it to `Partial<Contact>`,
`Required<Contact>`, and `Readonly<Contact>`.

**Canonical example:** Utility types are like clothing alterations on a
standard pattern. You start with the full pattern (`Contact`) and ask the
tailor to: make all seams loose (`Partial`), remove the pockets (`Omit`),
or keep only the collar and sleeves (`Pick`). The original pattern is unchanged;
each alteration is a separate derived garment.

**Smallest possible examples:**
```ts
interface User { id: number; name: string; email: string; role: string }

type PartialUser   = Partial<User>;       // { id?: number; name?: string; ... }
type ReadonlyUser  = Readonly<User>;      // all fields readonly
type UserPreview   = Pick<User, 'name' | 'email'>;  // { name: string; email: string }
type SafeUser      = Omit<User, 'role'>;  // { id: number; name: string; email: string }
type UserIndex     = Record<string, User>; // { [key: string]: User }
type CreateUserFn  = (name: string, email: string) => User;
type CreateParams  = Parameters<CreateUserFn>; // [string, string]
type CreateReturn  = ReturnType<CreateUserFn>;  // User
```

**You will see this again in:** React component props (`Partial<ButtonProps>` for
a variant), API response types (`Omit<User, 'password'>`), form state (`Partial<T>`
for a form that partially fills in a type), anywhere you derive types from
existing types programmatically.

**Career signal:** Utility types are used in every TypeScript codebase. Knowing
them prevents duplication and makes APIs self-documenting.

**Watch for:** `Partial<T>` makes all fields optional — including required ones.
If some fields must always be present, use `Pick` to select only the optional
subset: `Pick<Contact, 'email' | 'city'>` combined with `Partial`.

---

## Step 3 — Utility Types in Practice

```ts
console.log('\n--- Utility Types ---');

interface Contact {
  name:     string;
  email:    string;
  city:     string;
  password: string;  // private — never expose this
}

// Partial<T> — all fields optional (for update operations):
type ContactUpdate = Partial<Contact>;

function applyUpdate(contact: Contact, update: ContactUpdate): Contact {
  return { ...contact, ...update };  // spread merges; undefined fields are ignored
}

const alice: Contact = {
  name: 'Alice', email: 'alice@example.com',
  city: 'London', password: 'secret123',
};

// Only provide the fields that changed:
const update: ContactUpdate = { email: 'alice-new@example.com' };
const updated = applyUpdate(alice, update);

console.log('Partial update — only changed fields:');
console.log(update);
console.log('Updated email:', updated.email);

// Omit<T, K> — produce a type without the specified fields:
type PublicContact = Omit<Contact, 'password'>;

function toPublic(contact: Contact): PublicContact {
  const { password, ...publicData } = contact;  // destructure out password
  return publicData;
}

console.log('\nPublic contact (no password):');
console.log(toPublic(alice));

// Record<K, V> — index contacts by email:
type ContactIndex = Record<string, PublicContact>;
const index: ContactIndex = {
  'alice@example.com': toPublic(alice),
};

console.log('\nIndexed by email:', Object.keys(index));
```

### SAVE AND TRY

```bash
npx ts-node generics.ts
```

Expected:
```
--- Utility Types ---
Partial update — only changed fields:
{ email: 'alice-new@example.com' }
Updated email: alice-new@example.com

Public contact (no password):
{ name: 'Alice', email: 'alice@example.com', city: 'London' }

Indexed by email: [ 'alice@example.com' ]
```

**Change something:** Try `toPublic(alice).password`. Expected compile error:
`Property 'password' does not exist on type 'PublicContact'`. The `Omit`
type removed `password` from the type. TypeScript enforces this at compile time —
you cannot accidentally access what was excluded.

---

## 🎯 Challenge: Generic Repository Interface

**You know:** Generic functions, constraints, and utility types.

**Task:** Write a generic `Repository<T>` interface that works for any entity
type with an `id: string` field. Then implement it for contacts using an in-memory
Map.

The interface should provide:
- `findById(id: string): T | undefined`
- `findAll(): T[]`
- `save(entity: T): T`
- `update(id: string, updates: Partial<Omit<T, 'id'>>): T | undefined`
- `delete(id: string): boolean`

```ts
interface Contact { id: string; name: string; email: string }

const repo: Repository<Contact> = new InMemoryRepository<Contact>();

repo.save({ id: '1', name: 'Alice', email: 'alice@example.com' });
repo.save({ id: '2', name: 'Bob',   email: 'bob@example.com'   });

console.log(repo.findAll().length); // 2
repo.update('1', { email: 'alice-new@example.com' });
console.log(repo.findById('1')?.email); // 'alice-new@example.com'
repo.delete('2');
console.log(repo.findAll().length); // 1
```

**Requirements:**
- `T` must be constrained to have `id: string`
- `update` uses `Partial<Omit<T, 'id'>>` — cannot update the ID
- All methods should be type-safe — no `any`

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// T must have an id field:
interface Repository<T extends { id: string }> {
  findById(id: string): T | undefined;
  findAll(): T[];
  save(entity: T): T;
  update(id: string, updates: Partial<Omit<T, 'id'>>): T | undefined;
  delete(id: string): boolean;
}

class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  private readonly store = new Map<string, T>();

  findById(id: string): T | undefined {
    return this.store.get(id);
  }

  findAll(): T[] {
    return [...this.store.values()];
  }

  save(entity: T): T {
    this.store.set(entity.id, entity);
    return entity;
  }

  update(id: string, updates: Partial<Omit<T, 'id'>>): T | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }
}

interface Contact { id: string; name: string; email: string }

const repo = new InMemoryRepository<Contact>();
repo.save({ id: '1', name: 'Alice', email: 'alice@example.com' });
repo.save({ id: '2', name: 'Bob',   email: 'bob@example.com'   });

console.log(repo.findAll().length);                   // 2
repo.update('1', { email: 'alice-new@example.com' });
console.log(repo.findById('1')?.email);               // alice-new@example.com
repo.delete('2');
console.log(repo.findAll().length);                   // 1
```

**Key insight:** The `T extends { id: string }` constraint lets the repository
use `entity.id` without knowing what type T is. `Partial<Omit<T, 'id'>>` removes
`id` from the update type — you cannot accidentally change an entity's ID via
`update`. This is a production-ready pattern used in many TypeScript backends.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Generic inference | `wrap(42).value.toFixed()` | No error — TypeScript infers number |
| Generic rejects wrong type | `wrap<string>(42)` | Compile error — 42 not string |
| Constraint works | `longestName([{city: 'X'}])` | Compile error — no 'name' |
| `Partial` makes optional | Assign `{}` to `Partial<Contact>` | No error |
| `Omit` removes field | Access omitted field on Omit type | Compile error |
| `Record` types values | `Record<string, number>['key'] + 1` | No error — it's a number |
| `ReturnType` extracts type | `ReturnType<typeof Math.random>` | `number` |

---

## Quick Check Answers

**1. Return type without generics vs with generics?**

Without generics using a specific type (`function wrap(v: string)`), the return
type is `{ value: string }` — only strings work. Without generics using `any`
(`function wrap(v: any)`), the return type is `{ value: any }` — no type
information is preserved; TypeScript accepts anything on `.value`.

With generics (`function wrap<T>(v: T)`), the return type is `{ value: T }`.
T is whatever the caller passes — `string`, `number`, `Contact`, any type.
TypeScript preserves this information, so `wrap(42).value.toFixed()` works
and `wrap(42).value.toUpperCase()` does not.

**2. When to use `Partial<T>` instead of a separate optional interface?**

Use `Partial<T>` whenever you need an "all fields optional" variant of an
existing type — for update operations, form state, or partial configurations.
The advantage over a separate interface: adding a field to the source type
automatically adds it to `Partial<T>`. A separate interface requires a manual
update. `Partial<T>` is the correct default for update/patch operations.

**3. What does `Omit<Contact, 'password'>` produce?**

An object type with all of `Contact`'s fields except `password`. If `Contact`
has `{ name: string; email: string; city: string; password: string }`, then
`Omit<Contact, 'password'>` produces `{ name: string; email: string; city: string }`.
This is the standard pattern for creating "safe" versions of types that contain
sensitive fields — the password field is structurally excluded from the derived type.
