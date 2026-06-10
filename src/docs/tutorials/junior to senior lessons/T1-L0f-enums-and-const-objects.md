# Junior to Senior — T1·L0f — Enums and Const Objects

**Prerequisites:** T1·L0e (Array and Object Methods). You know how to work
with object data. This lesson covers how to represent a fixed set of named
values safely in TypeScript.

**What this lab adds:**
- TypeScript `enum` — numeric and string variants
- `const enum` — zero-runtime-cost enums
- `const` object + `as const` — the modern alternative
- When to choose each approach and why

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You write `contact.status = 'activ'` (typo). With a plain string, what happens
>    at runtime? With a TypeScript string enum, what happens at compile time?
> 2. What does TypeScript emit to JavaScript for a `const enum`? For a regular `enum`?
> 3. `enum Color { Red, Green, Blue }` — what is `Color.Red`? What is `Color[0]`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contacts system where statuses and categories are typed values that cannot
be misspelled:

```
$ npx ts-node contacts-enum.ts

Contact status: active
Is premium: true
Category: VIP
Status label: Active

Error caught: 'activ' is not assignable to type 'ContactStatus'
(This error appears at COMPILE time — the bug never reaches runtime)
```

---

## The Problem — Magic Strings Are Unsafe

Create `contacts-enum.ts`. First show the problem with plain strings:

```ts
// Plain string — the compiler cannot catch typos:
function updateStatus(contact: { name: string; status: string }, newStatus: string) {
  contact.status = newStatus;
}

const alice = { name: 'Alice', status: 'active' };
updateStatus(alice, 'activ');   // typo — accepted silently!
updateStatus(alice, 'deleted'); // valid-looking but wrong value
updateStatus(alice, 'purple');  // nonsense — accepted!

console.log(alice.status); // 'purple' — the function accepted anything
```

### SAVE AND TRY

```bash
npx ts-node contacts-enum.ts
```

Expected (no errors, wrong output):
```
purple
```

TypeScript accepted every string because the parameter type was `string`.
There is no way to know which values are valid without reading documentation.
A typo reaches production. This is the problem enums and const objects solve.

---

### Concept: TypeScript `enum` — Named Constants With Types

**What it is:** An `enum` is a TypeScript construct that creates a named set
of related constants. TypeScript checks that only valid enum members are used,
catching invalid values at compile time.

**The problem before:**
```ts
// Magic strings — no compile-time checking:
function setStatus(status: string) { ... }
setStatus('activ'); // no error — typo goes undetected
```

**The solution:**
```ts
enum ContactStatus {
  Active   = 'active',
  Inactive = 'inactive',
  Deleted  = 'deleted',
}

function setStatus(status: ContactStatus) { ... }
setStatus('activ');               // compile error — not a valid ContactStatus
setStatus(ContactStatus.Active);  // correct
```

**What it hides:** Enums hide the actual values behind names. Your code uses
`ContactStatus.Active` everywhere. If the underlying value ever changes from
`'active'` to `'ACTIVE'`, you change it in one place. Every function call is
already using the name, not the string — zero changes elsewhere.

The invariant: the TypeScript compiler enforces that only valid enum members
are assignable to enum-typed parameters. Invalid strings are rejected at compile
time, not at runtime.

**Two enum variants:**

**Numeric enum** (default — rarely what you want):
```ts
enum Direction { Up, Down, Left, Right }
// Direction.Up === 0, Direction.Down === 1, ...
// Direction[0] === 'Up' — reverse mapping exists
```

**String enum** (almost always better):
```ts
enum Direction { Up = 'UP', Down = 'DOWN', Left = 'LEFT', Right = 'RIGHT' }
// Direction.Up === 'UP'
// No reverse mapping — string enums do not have Direction['UP']
```

**Canonical example:** Enums are like a traffic light specification.
A `TrafficLight.Red` cannot be confused with `TrafficLight.Green` or a colour
not on the traffic light. Writing `TrafficLight.Pink` is a compile error.
Writing `'red'` where a `TrafficLight` is expected is a compile error.
The compiler is the specification enforcer.

**Smallest possible example:**
```ts
enum Planet { Mercury = 'MERCURY', Venus = 'VENUS', Earth = 'EARTH' }

function describeDistance(from: Planet, to: Planet): string {
  return `${from} to ${to}`;
}

describeDistance(Planet.Earth, Planet.Venus);  // OK
describeDistance('Earth', 'Venus');            // compile error — not Planet type
describeDistance(Planet.Earth, 'Pluto');       // compile error — Pluto is not Planet
```

**You will see this again in:** Database column values that must match an
allowed set, API status codes, UI mode flags, configuration options. Any
"this field accepts one of these specific values" use case.

**Career signal:** "How do you type a field that can only be certain values?"
is a common TypeScript interview question. Knowing enums vs union types vs
const objects is expected.

**Watch for:** TypeScript emits a real JavaScript object for `enum`. This adds
a few bytes to your bundle and a few properties to your code. For values used
only in type positions (never at runtime), use `type` unions instead. For
runtime values with compile-time safety, use enums or `const` objects.

---

## Step 1 — Basic String Enum

Replace the plain string version with a typed enum:

```ts
// Define the allowed status values:
enum ContactStatus {
  Active   = 'active',
  Inactive = 'inactive',
  Deleted  = 'deleted',
}

// The function now only accepts ContactStatus values:
interface Contact {
  name: string;
  status: ContactStatus;
}

function updateStatus(contact: Contact, newStatus: ContactStatus): void {
  contact.status = newStatus;
}

const alice: Contact = {
  name:   'Alice',
  status: ContactStatus.Active,   // must use the enum member
};

updateStatus(alice, ContactStatus.Inactive); // ✓ valid
console.log('Contact status:', alice.status); // 'inactive'

// TypeScript prevents this at compile time — uncomment to see the error:
// updateStatus(alice, 'activ');  // Error: 'activ' is not assignable to ContactStatus
// updateStatus(alice, 'active'); // Error: even a correct string is rejected
```

### SAVE AND TRY

```bash
npx ts-node contacts-enum.ts
```

Expected:
```
Contact status: inactive
```

**Change something:** Uncomment `updateStatus(alice, 'activ')`. Try to run —
`ts-node` will report a compile error before executing. The bug is caught before
the code runs. Comment it out again.

---

### Concept: `const enum` — Zero Runtime Cost

**What it is:** A `const enum` is inlined at compile time. Instead of generating
a JavaScript object, TypeScript replaces every use of the enum with its literal value.
The enum ceases to exist at runtime.

**The problem before:**

Regular `enum` compiles to JavaScript like this:

```js
// TypeScript enum compiles to:
var ContactStatus;
(function (ContactStatus) {
  ContactStatus["Active"]   = "active";
  ContactStatus["Inactive"] = "inactive";
  ContactStatus["Deleted"]  = "deleted";
})(ContactStatus || (ContactStatus = {}));
```

This is an IIFE (Immediately Invoked Function Expression) that creates a runtime
object. It exists in the bundle, takes memory, and adds startup time.

**The solution:**

```ts
const enum ContactStatus {
  Active   = 'active',
  Inactive = 'inactive',
  Deleted  = 'deleted',
}
```

After TypeScript compiles, every `ContactStatus.Active` in the code becomes
the literal string `'active'` directly. No runtime object is created.

**What it hides:** `const enum` hides the enum entirely from the runtime.
The compile-time type safety remains — TypeScript still checks enum members.
But the compiled JavaScript has no trace of the enum.

The invariant: `const enum` members are fully inlined. You cannot access a
`const enum` using dynamic lookup (`ContactStatus['Active']`) at runtime —
the object does not exist.

**Canonical example:** A `const enum` is like a `#define` in C/C++ — a name
that the compiler replaces with its value before the machine code is produced.
The name is for the programmer; the value is for the machine. No runtime cost,
full compile-time safety.

**Smallest possible example:**
```ts
const enum Priority { Low = 1, Medium = 2, High = 3 }

// TypeScript sees: if (priority === Priority.High)
// Compiled JS emits: if (priority === 3)
// Priority does not exist at runtime.
```

**You will see this again in:** Any TypeScript project optimising for bundle
size. Libraries use `const enum` for flags and options that are only ever used
in conditions.

**Watch for:** `const enum` cannot be used across TypeScript module boundaries
in some configurations. If you export a `const enum` from a `.d.ts` file that
is consumed by another project (a library), the other project cannot inline it
because it does not have the source. Use `isolatedModules: true` in tsconfig
to catch this issue early. For library code, use regular enums or const objects.

---

## Step 2 — Comparing `enum` and `const enum`

```ts
// Regular enum — compiles to a runtime JavaScript object:
enum ContactCategory {
  Personal  = 'personal',
  Work      = 'work',
  VIP       = 'vip',
}

// const enum — completely inlined; no runtime object:
const enum ContactPriority {
  Low    = 'low',
  Medium = 'medium',
  High   = 'high',
}

// Both provide identical type safety at compile time:
function categorise(contact: Contact, category: ContactCategory): void {
  console.log(`Category: ${category.toUpperCase()}`);
}

categorise(alice, ContactCategory.VIP);
```

### SAVE AND TRY

```bash
npx ts-node contacts-enum.ts
```

Expected:
```
Contact status: inactive
Category: VIP
```

**Change something:** Run `npx tsc --noEmit false contacts-enum.ts` to emit
JavaScript. Open the generated `.js` file. `ContactCategory` appears as a full
IIFE runtime object. `ContactPriority` (if used) is replaced by its literal
values inline. The difference is visible in the compiled output.

---

### Concept: `const` Object + `as const` — The Modern Alternative

**What it is:** A plain JavaScript object with `as const` applied creates a type
where every value is its literal type. Combined with a `type` alias extracting
the value types, this achieves the same effect as an enum with more flexibility.

**The problem with enums:**

1. Enums are a TypeScript-only concept — they do not exist in JavaScript
2. Regular enums have runtime cost
3. String enum values are not assignable from their literal strings without casting
4. Harder to iterate at runtime without converting to an array first

**The solution:**

```ts
const ContactStatus = {
  Active:   'active',
  Inactive: 'inactive',
  Deleted:  'deleted',
} as const;
// 'as const' makes every value its literal type: 'active', not string

type ContactStatus = typeof ContactStatus[keyof typeof ContactStatus];
// ContactStatus is now: 'active' | 'inactive' | 'deleted'
```

**What it hides:** The `as const` approach uses TypeScript's structural typing
rather than a special construct. The object stays as plain JavaScript at runtime.
The `type` alias extracts the union of all possible values.

The invariant: the type `ContactStatus` (derived from the object) equals exactly
the union of the object's values. Adding a new value to the object automatically
expands the type — no separate enum definition needed.

**When to use `const` object vs enum:**

| Situation | Use |
|---|---|
| You need to iterate all values at runtime | `const` object (`Object.values(Status)`) |
| The values are only used in type checks | `const enum` or type union |
| You want to consume as plain strings in APIs | `const` object (strings are assignable) |
| You need reverse mapping (value → name) | numeric `enum` (only numeric enums have this) |
| Library code with external consumers | `const` object (no `const enum` cross-module issues) |

**Canonical example:** A `const` object is like a menu board at a café.
The board lists exactly what is available. Your code (the customer) can only
order items on the board — TypeScript rejects anything else. Unlike an enum,
the board itself is just a regular physical object (a plain JS object)
that staff can read, list, and iterate.

**Smallest possible example:**
```ts
const COLORS = { Red: 'red', Green: 'green', Blue: 'blue' } as const;
type Color = typeof COLORS[keyof typeof COLORS]; // 'red' | 'green' | 'blue'

function paint(color: Color): void { console.log(`Painting: ${color}`); }

paint(COLORS.Red);    // ✓
paint('red');         // ✓ — string literals assignable to the type
paint('purple');      // compile error
```

**You will see this again in:** Modern TypeScript codebases often prefer `const`
objects over enums. React Query, Zustand, and many major libraries use this pattern.
The Fluent UI library uses `const` objects for its token values.

**Watch for:** Without `as const`, the object's values are inferred as `string`,
not as their literal types. `const obj = { A: 'a' }` makes `obj.A` type `string`.
`const obj = { A: 'a' } as const` makes `obj.A` type `'a'` (literal). The
`as const` is essential.

---

## Step 3 — `const` Object with `as const`

```ts
// Const object approach — plain JS at runtime, full type safety:
const STATUS = {
  Active:   'active',
  Inactive: 'inactive',
  Deleted:  'deleted',
} as const;

// Extract the union type of all values:
type ContactStatusV2 = typeof STATUS[keyof typeof STATUS];
// = 'active' | 'inactive' | 'deleted'

function getLabel(status: ContactStatusV2): string {
  // Object.entries works at runtime — you can iterate:
  const labels: Record<ContactStatusV2, string> = {
    active:   'Active',
    inactive: 'Inactive',
    deleted:  'Deleted',
  };
  return labels[status];
}

console.log('Status label:', getLabel(STATUS.Active));
console.log('Is premium:', getLabel('active') === 'Active'); // string literals work too
```

### SAVE AND TRY

```bash
npx ts-node contacts-enum.ts
```

Expected:
```
Status label: Active
Is premium: true
```

**Change something:** Try `getLabel('activ')`. This is a compile error —
`'activ'` is not `ContactStatusV2`. Try `getLabel('active')` — this works
because `'active'` is exactly one of the union members. Unlike an enum,
the plain string `'active'` is assignable to the type directly.

---

## 🎯 Challenge: Typed Contact Form

**You know:** String enums, `const enum`, and `const` object types.

**Task:** A contact form has three fields: `status` (Active/Inactive/Pending),
`priority` (Low/Medium/High), and `category` (Personal/Work/VIP). Use whichever
approach you prefer for each, but justify the choice in a comment.

Write:
1. The type definitions
2. A `validateContact(contact)` function that returns `{ valid: boolean; errors: string[] }`
3. Two test calls — one with valid data, one with at least one invalid field

**Requirements:**
- Invalid enum/union values are caught at compile time
- The validate function checks that status is not 'deleted' for new contacts
- The validate function checks that VIP contacts must have High priority

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Use string enum for status — values appear in API responses as strings:
enum ContactStatus2 {
  Active  = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

// Use const enum for priority — only used in conditions, no runtime iteration:
const enum Priority {
  Low    = 'low',
  Medium = 'medium',
  High   = 'high',
}

// Use const object for category — we need to iterate all values for display:
const CATEGORY = {
  Personal: 'personal',
  Work:     'work',
  VIP:      'vip',
} as const;
type Category = typeof CATEGORY[keyof typeof CATEGORY];

interface NewContact {
  name:     string;
  status:   ContactStatus2;
  priority: Priority;
  category: Category;
}

function validateContact(contact: NewContact): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (contact.status === ContactStatus2.Inactive) {
    errors.push('New contacts cannot be inactive');
  }

  if (contact.category === CATEGORY.VIP && contact.priority !== Priority.High) {
    errors.push('VIP contacts must have High priority');
  }

  return { valid: errors.length === 0, errors };
}

// Valid:
const valid = validateContact({
  name: 'Alice', status: ContactStatus2.Active,
  priority: Priority.High, category: CATEGORY.VIP,
});
console.log('Valid:', valid);  // { valid: true, errors: [] }

// Invalid:
const invalid = validateContact({
  name: 'Bob', status: ContactStatus2.Active,
  priority: Priority.Low, category: CATEGORY.VIP,  // VIP must be High priority!
});
console.log('Invalid:', invalid);
// { valid: false, errors: ['VIP contacts must have High priority'] }
```

**Key insight:** The choice of enum type should match the runtime usage.
`ContactStatus2` is a regular enum because status values appear in API payloads —
they need to be real strings at runtime. `Priority` is a `const enum` because
it is only ever used in `if` comparisons — inlining costs nothing and gains
bundle efficiency. `CATEGORY` is a `const` object because we might need to
iterate all categories for a dropdown menu.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| String enum catches typos | Assign `'activ'` to an enum-typed field | Compile error |
| Enum values as strings | `console.log(ContactStatus.Active)` | `'active'` |
| Numeric enum reverse map | `enum E { A }; console.log(E[0])` | `'A'` |
| String enum no reverse map | `enum E { A='a' }; console.log(E['a'])` | `undefined` |
| `as const` literal type | Hover over const object value in IDE | Shows literal, not `string` |
| String assignable to const type | Assign `'active'` to `ContactStatusV2` | No error |
| String NOT assignable to enum | Assign `'active'` to `ContactStatus` | Compile error |

---

## Quick Check Answers

**1. Plain string typo vs enum typo?**

With a plain `string` parameter, `'activ'` is accepted silently. The typo
reaches production and causes a logic bug — a contact that should be active
has status `'activ'`, which no condition matches. The bug only appears when
behaviour is tested. With a string enum, `updateStatus(contact, 'activ')`
is a TypeScript compile error. TypeScript rejects it before the code runs,
before it is committed, before it reaches production. The bug is impossible.

**2. `const enum` vs regular `enum` JavaScript output?**

A regular `enum` compiles to an IIFE that creates a JavaScript object at
runtime: `var ContactStatus; (function(ContactStatus) { ... })(...)`. This
object exists in memory, in the bundle, and at startup. A `const enum` compiles
to nothing — every use of `Priority.High` in the source becomes the literal
`'high'` in the output. The compiled JavaScript has no trace of the enum.
Zero runtime cost; full compile-time safety.

**3. `Color.Red` and `Color[0]` for a numeric enum?**

For `enum Color { Red, Green, Blue }` (numeric, default starting at 0):
`Color.Red === 0` (the numeric value). `Color[0] === 'Red'` (the reverse mapping —
numeric enums generate both a forward and backward lookup).
For a string enum like `enum Color { Red = 'RED' }`:
`Color.Red === 'RED'`. `Color['RED']` is `undefined` — string enums do not
generate reverse mappings because string-to-name lookup is ambiguous and rarely needed.
