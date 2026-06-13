# FOUNDATIONS — LAB-034 — TypeScript: Interfaces and Type Aliases

**Series:** FOUNDATIONS — Part VII: TypeScript Type System
**Environment:** Browser DevTools console or TypeScript playground at typescriptlang.org/play. No installation required.
**Time:** 50–65 minutes.

---

## What You Will Build

A TypeScript interface with required and optional properties, a type alias, a function typed to accept only values matching that interface, and a demonstration of structural typing — TypeScript's "shape matters, not name" rule. After this lab you will understand the difference between a TypeScript type check and a JavaScript runtime check, and when to use `interface` vs `type`.

---

## What You Need to Know First

**From LAB-017 (Interfaces as a Contract):** You know the concept of an interface as a contract between caller and implementer. TypeScript interfaces make that contract enforceable at compile time.

**From LAB-010 (Modules):** TypeScript files are modules. Type annotations are stripped by the TypeScript compiler before the code runs in JavaScript.

**New in this lab:** The TypeScript compiler (`tsc`) and what "compile time vs runtime" means.

---

> **Quick Check — try to answer before reading:**
>
> 1. TypeScript type annotations are removed when code runs in the browser. What does this mean for runtime performance?
> 2. What is the difference between a syntax error and a type error?
> 3. If TypeScript uses structural typing, can two completely different interfaces describe the same object?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — What TypeScript Is and What It Is Not

**TypeScript is a superset of JavaScript.** Every valid JavaScript program is valid TypeScript. TypeScript adds a type annotation layer on top of JavaScript syntax. The TypeScript compiler (`tsc`) reads `.ts` files, checks types, and outputs plain `.js` files with all type annotations removed.

**Type checking happens at compile time.** When you run `tsc`, the compiler reads your code, checks that types are used consistently, and reports errors. At runtime (in the browser or Node.js), only the compiled JavaScript executes. There is no TypeScript at runtime. There are no type checks at runtime. A TypeScript error is caught before the program runs, not during.

**Type annotations have zero runtime cost.** They are erased before execution. A TypeScript annotation like `: User` in `function greet(user: User)` becomes `function greet(user)` in the compiled JavaScript. The annotation is documentation the compiler enforces.

---

### Step 2 — Interface: Shape Declaration

**The problem this step solves:** Describe the exact shape that a `User` object must have, so the compiler reports an error wherever you use a `User` incorrectly.

**The code (in the TypeScript playground):**

```typescript
interface User {
  readonly id: number;      // readonly: cannot be reassigned after creation
  name: string;
  email: string;
  age?: number;             // ?: optional — may be absent
}
```

**The walkthrough:**

- `readonly id: number` — The `id` field is a number that cannot be changed after the object is created. TypeScript rejects `user.id = 999` with an error: "Cannot assign to 'id' because it is a read-only property." This is compile-time enforcement of an invariant.
- `name: string` — Required. TypeScript rejects any object without `name` being assigned as a `User`.
- `age?: number` — The `?` makes the field optional. TypeScript knows that `age` may be `undefined`, so it will require you to check before using it.

**The CS lens — static type system:** TypeScript is a statically typed language. Types are checked at compile time, before the program runs. JavaScript is dynamically typed — types are checked (implicitly) at runtime. Static typing catches entire categories of bugs before they can happen: calling a method that doesn't exist, passing a number where a string is expected, missing a required field.

**The SE lens — type as documentation:** The interface is a machine-readable specification. A new developer reading the code knows exactly what a `User` is. The compiler enforces the specification — it cannot go out of date the way a comment can.

---

### Step 3 — Using the Interface

```typescript
function formatUserDisplayName(user: User): string {
  // user.age might be undefined — TypeScript forces us to handle it
  const ageDisplay = user.age !== undefined ? ` (age ${user.age})` : '';
  return `${user.name}${ageDisplay} <${user.email}>`;
}

// Valid — matches the User interface exactly
const validUser: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
};

// TypeScript error: Property 'email' is missing
const missingEmail: User = { id: 2, name: 'Bob' };

// TypeScript error: Object literal may only specify known properties
const extraProperty: User = { id: 3, name: 'Carol', email: 'c@example.com', phone: '555-1234' };

console.log(formatUserDisplayName(validUser));
// "Alice (age 30) <alice@example.com>"
```

**The walkthrough — excess property checking:** TypeScript catches extra properties on object literals assigned to an interface type. This is a deliberate design decision: object literals are the point where typos in property names cause bugs. If you wrote `emal` instead of `email`, TypeScript catches it here.

However, if you assign via an intermediate variable, TypeScript is more permissive:

```typescript
const extended = { id: 3, name: 'Carol', email: 'c@example.com', phone: '555-1234' };
const valid: User = extended;  // OK — no error. Structural typing: extended has all User fields.
```

This is structural typing at work — `extended` has all the fields `User` requires, and more. The extra field is ignored.

---

### Step 4 — Structural Typing: Shape Over Name

**The core TypeScript rule:** A value satisfies a type if it has at least the properties the type declares. The name of the type does not matter.

```typescript
interface Point2D {
  x: number;
  y: number;
}

interface Coordinate {
  x: number;
  y: number;
}

function distanceFromOrigin(point: Point2D): number {
  return Math.sqrt(point.x ** 2 + point.y ** 2);
}

const coord: Coordinate = { x: 3, y: 4 };
console.log(distanceFromOrigin(coord));  // 5 — no error, even though type is "Coordinate" not "Point2D"
```

`Coordinate` and `Point2D` are structurally identical. TypeScript accepts a `Coordinate` anywhere a `Point2D` is expected. This is **structural typing** (also called "duck typing with static checking"). Contrast with **nominal typing** (Java/C#) where the type name must match — a `Coordinate` class cannot be passed where a `Point2D` is expected unless `Coordinate extends Point2D`.

**The CS lens — structural vs nominal:** Structural typing is more flexible: you can add interfaces to types you didn't write (library types, external APIs) without modifying them. Nominal typing is more explicit: two types with the same shape are still distinct if they have different names.

---

### Step 5 — Type Aliases: Naming Any Type Expression

**A type alias** names any TypeScript type expression — not just object shapes.

```typescript
// Type alias for an object shape (similar to interface)
type ProductId = number;          // alias for a primitive
type Callback = () => void;       // alias for a function type
type UserId = string | number;    // alias for a union

// Type alias for an object shape:
type Address = {
  street: string;
  city: string;
  country: string;
};

// Interface with another interface:
interface UserWithAddress extends User {
  address: Address;
}
```

**Interface vs type — when to use which:**

Use `interface` when:
- You are describing the shape of an object or class.
- You want it to be extensible with `extends`.
- You want declaration merging (two `interface User` blocks in the same scope merge automatically — useful for extending library types).

Use `type` when:
- You need a union, intersection, mapped type, or conditional type.
- You are naming a primitive alias (`type Id = string`).
- You are naming a function signature.

Both work for object shapes. In practice, many teams pick one and use it consistently. The TypeScript team's own code uses `interface` for objects and `type` for everything else.

**Try it:**

```typescript
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

const userResponse: ApiResponse<User> = {
  data: { id: 1, name: 'Alice', email: 'alice@example.com' },
  status: 200,
  message: 'OK',
};

// TypeScript verifies that data matches User
console.log(userResponse.data.name);   // "Alice"
```

---

## Connect the Pieces

- **React's `props` types** are interfaces or type aliases — the mechanism is exactly what you built here. `interface ButtonProps { onClick: () => void; label: string; disabled?: boolean }`.
- **REST API contracts** — tools like Zod and io-ts turn runtime validation into TypeScript types, bridging the gap between the compile-time type system and the runtime data that arrives from external APIs.
- **TypeScript's own library types** (`lib.dom.d.ts`) are a massive collection of interfaces describing every browser API. When you type `document.getElementById(...)`, TypeScript knows the return type from these interface declarations.

---

## What Breaks Without This

**Relying on JavaScript's runtime type of an `any`:**

```typescript
function processUser(user: any) {
  // TypeScript allows this — no error. But user might not have email.
  console.log(user.email.toUpperCase());  // Runtime error if user.email is undefined
}
```

`any` disables TypeScript's type checking. The function accepts anything, TypeScript stops helping, and the runtime error appears when the code runs — perhaps hours later, in production, seen by a user. The purpose of the interface is to make TypeScript refuse to compile code that would produce this runtime error.

---

## Definition of Done

- [ ] Define a `Product` interface with `id: number`, `name: string`, `price: number`, `inStock?: boolean`
- [ ] TypeScript reports an error when you omit `name` from a `Product` literal
- [ ] TypeScript reports an error when you add an unknown property to a `Product` literal
- [ ] A function typed `(product: Product): string` compiles correctly and handles `inStock` being optional
- [ ] You can explain why `interface` supports `extends` but `type` does not

**Git commit:**

```
git add src/
git commit -m "LAB-034: TypeScript interfaces and type aliases — structural typing explained; compile-time enforcement replaces runtime guesswork"
```

---

## Quick Check Answers

1. **Zero impact.** TypeScript annotations are stripped by the compiler before the JavaScript runs. The browser never sees the type annotations. There is no type checking at runtime unless you explicitly write validation code (like a Zod schema).
2. **A syntax error prevents parsing.** `const x = ;` is a syntax error — the JavaScript engine cannot even parse it. A type error is caught by the TypeScript compiler but produces valid JavaScript — `const x: string = 42` compiles to `const x = 42` which runs fine in JavaScript. TypeScript type errors are compile-time warnings that catch logical mistakes before execution.
3. **Yes.** TypeScript uses structural typing — two interfaces with the same shape are interchangeable. `interface A { x: number }` and `interface B { x: number }` are compatible. A value of type A satisfies type B and vice versa. Only the shape matters, not the name.
