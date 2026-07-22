# Concept: TypeScript Array Types

**What you'll understand by the end:** how to declare that a value is a list of a specific type, and how that composes with interfaces.

**Prerequisites:** `typescript-interfaces.md`.

## Setup

Node.js with TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

A single interface names the shape of *one* object. Real data is often a *collection* of them — a list of users, a list of points — and something needs to express "an array where every element satisfies this shape," not just "one value of this shape."

## The Isolated Example

```typescript
interface Dog {
  name: string;
  age: number;
}

const pack: Dog[] = [
  { name: "Rex", age: 3 },
  { name: "Fido", age: 5 },
];

console.log(pack.map((dog) => dog.name));
```

**Real output:**
```
[ 'Rex', 'Fido' ]
```

Adding an invalid element:
```typescript
const badPack: Dog[] = [
  { name: "Rex", age: 3 },
  { name: "NoAge" },
];
```

**Real `tsc` output:**
```
error TS2741: Property 'age' is missing in type '{ name: string; }' but required in type 'Dog'.
```

**What this proves:** `Dog[]` checked *every* element of the array against the `Dog` shape, not just the array's own "is this a list" property — the second, malformed entry was caught by the same interface-checking machinery `typescript-interfaces.md` already demonstrated for a single value, applied automatically across every element.

## Mechanical Walkthrough

- `T[]` (here, `Dog[]`) is the array-type syntax: a value typed this way must be an array where every element satisfies `T`.
- An equivalent, alternate syntax exists — `Array<Dog>` — using generic syntax (see `typescript-generics.md`) instead of the bracket shorthand; both mean the same thing, and `T[]` is simply the more common, terser convention for arrays specifically.
- `pack.map(...)` — TypeScript knows `dog` inside the callback is a `Dog` (not just some generic, unknown element type), because the array's element type was declared — this is what allows `dog.name` to be typed-checked too, not just accepted blindly.

## CS Lens

This is a **parameterized collection type** — the array type itself is generic over what it contains, so "array of numbers," "array of strings," and "array of `Dog`" are all distinct, separately-checked types, rather than one undifferentiated "array" type that could hold anything.

Also recognized in: every statically-typed language's own generic collection types — Java's `List<Dog>`, C#'s `List<Dog>`, Rust's `Vec<Dog>` — the identical underlying idea of "a collection, parameterized by what it holds," expressed with different syntax per language.

## SE Lens

Declaring `Dog[]` instead of a bare, untyped array means every later use of that array — iterating it, indexing into it, passing it to another function — gets the same element-level checking for free, propagated automatically from the one declaration. An untyped (or `any[]`-typed) array would silently allow any code touching it to also silently accept wrong-shaped elements anywhere downstream, defeating the whole point of having declared `Dog` in the first place.

## Connection

Builds directly on `typescript-interfaces.md`. This is exactly the shape a real API response's array field needs — the interface for one item, composed with `[]`, describes the whole collection a server actually returns.

## Try It Yourself

1. Write a function `totalAge(dogs: Dog[]): number` that sums every dog's age, and confirm TypeScript correctly infers each element's type inside the function body with no additional annotation needed there.
2. Try assigning a plain, empty array literal (`const empty: Dog[] = [];`) — confirm this is valid; an empty array trivially satisfies "every element matches `Dog`," since there are no elements to check.
3. Declare a doubly-nested array type, `Dog[][]` (an array of arrays of `Dog`), and construct a small, valid value for it — reason about what real-world data shape this might represent (e.g. dogs grouped by owner) and when this level of nesting starts becoming hard to read versus when a named interface for the outer structure would clarify it.
