# Concept: TypeScript Interfaces

**What you'll understand by the end:** how to name a specific object shape so TypeScript can check values against it, and how an interface differs from a class.

**Prerequisites:** `typescript-type-annotations.md`.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

A function or variable often needs to work with an object having several specific fields — not just "a string" or "a number," but "something with a `name` that's a string and an `age` that's a number." Declaring that shape inline, every place it's needed, is repetitive and gives it no name a reader can recognize across a codebase.

## The Isolated Example

```typescript
interface Dog {
    name: string;
    age: number;
}

const rex: Dog = { name: "Rex", age: 3 };
console.log(rex.name, "is", rex.age, "years old");
```

**Real output:**
```
Rex is 3 years old
```

Now, an object missing a required field:
```typescript
const rex: Dog = { name: "Rex" };
```

**Real `tsc` output:**
```
error TS2741: Property 'age' is missing in type '{ name: string; }' but required in type 'Dog'.
```

**What this proves:** `interface Dog` established a named contract — any value assigned to something typed `Dog` must have (at least) a `string` `name` and a `number` `age`. The checker caught the missing field by name, before running anything.

## Mechanical Walkthrough

- `interface Dog { name: string; age: number; }` declares a **named type** describing an object shape.
- `const rex: Dog = { name: "Rex", age: 3 };` — the object literal is checked against `Dog`'s declared shape at the point of assignment.
- Unlike a `class` (see `python-classes-instances.md` for the Python equivalent), a TypeScript `interface` has **no behavior, no methods, and no runtime existence at all** — it exists purely for the type checker to compare values against, and disappears completely once TypeScript is compiled to JavaScript; a running browser never sees `interface Dog` in any form, not even as a comment.

## CS Lens

An interface is a **structural type** — TypeScript checks whether an object *has the right shape*, not whether it was constructed by any particular class or declared with any particular name. A plain object literal satisfies `Dog` simply by having the right fields, with no `implements Dog` declaration needed anywhere — this is called **structural typing** (or "duck typing," checked at compile time instead of at runtime), distinct from the **nominal typing** some other languages require (where a type must be explicitly declared as implementing an interface to count as one).

Also recognized in: Go's interfaces (also structural, satisfied implicitly), and contrasted directly against Java/C#'s interfaces (nominal — a class must explicitly declare `implements SomeInterface` even if its shape already matches).

## SE Lens

Naming a shape once, as an interface, rather than repeating `{ name: string; age: number }` inline at every function signature or variable declaration that needs it, is the same readability and maintainability payoff as naming any repeated pattern — a change to the shape (adding a required field) only needs to happen in one place, and every location using the named type is automatically re-checked against the new definition, rather than needing to be found and updated by hand everywhere it was duplicated inline.

## Connection

Builds on `typescript-type-annotations.md`. Directly enables naming a real network response's shape — the interface a project actually needs is often the shape of data crossing a real boundary (an API response), giving the type checker something concrete to verify parsed JSON against.

## Try It Yourself

1. Add an optional field to `Dog` (`breed?: string;` — the `?` marks it as not required) and confirm an object without `breed` still satisfies the interface, while one that includes it with the wrong type (a number instead of a string) is still rejected.
2. Declare a second, unrelated object with the exact same shape as `Dog` (`name`/`age`) but assign it to a variable typed `Dog` without ever mentioning the interface name in its own literal. Confirm it's accepted — direct, concrete proof of structural typing: the object was never declared "as a `Dog`," it simply matches.
3. Add an extra, undeclared field to an object literal assigned directly to a `Dog`-typed variable (`const rex: Dog = { name: "Rex", age: 3, color: "brown" };`). Read the real `tsc` error about "excess property checks," and then confirm the same object assigned to an intermediate untyped variable first, then passed where `Dog` is expected, does *not* trigger the same check — a real, subtle, worth-knowing quirk of how TypeScript's excess-property checking specifically targets object literals.
