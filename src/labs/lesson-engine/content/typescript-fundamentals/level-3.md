---
series: typescript-fundamentals
level: 3
title: Generics
lang: typescript
---

# Generics

A function that returns the first element of an array should work whether the array holds strings, numbers, or objects. Without generics, you would either write a separate function for each type (duplication), or use `any` as the return type (losing all type safety). Neither is acceptable.

**Generics** let you parameterize a function or type by another type. Write once, type-check correctly for every type it's called with. They are the foundation of every collection, API response wrapper, and utility type in TypeScript.

By the end of this lesson you will understand what type parameters are and how TypeScript infers them, write generic functions and interfaces, and constrain type parameters with `extends` to limit what types are accepted.

## The problem generics solve

```typescript
// Without generics — duplicated for every type:
function getFirstString(arr: string[]): string | undefined {
  return arr[0];
}
function getFirstNumber(arr: number[]): number | undefined {
  return arr[0];
}

// With generics — one function works for any type:
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

```text
getFirst(["Python", "CSS", "JS"])  // → "Python"  (TypeScript infers T = string)
getFirst([1, 2, 3])                 // → 1          (TypeScript infers T = number)
getFirst([true, false])             // → true        (TypeScript infers T = boolean)

// You can also write the type argument explicitly:
getFirst<string>(["Python", "CSS"]) // → "Python"
```

`<T>` is the **type parameter** — a placeholder for a real type that TypeScript fills in at each call site. The name `T` is conventional but arbitrary. When TypeScript sees `getFirst(["Python", "CSS"])`, it infers `T = string` from the argument.

**CS lens:** Generics are **parametric polymorphism** — the function has a single implementation that works for any type, parameterized by that type. This is different from **ad-hoc polymorphism** (function overloading) where you write separate implementations. Parametric polymorphism was introduced by ML in 1973 and is the foundation of generic collections in Java, templates in C++, and generics in Rust. TypeScript's implementation is structural, not nominal.

## Generic interfaces and type aliases

Generics apply to interfaces and type aliases too.

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface Course {
  id: string;
  title: string;
}

type CourseResponse = ApiResponse<Course>;
type CourseList = Paginated<Course>;

const response: CourseResponse = {
  data: { id: "python-fundamentals", title: "Python Fundamentals" },
  status: 200,
  message: "OK",
};
```

```text
// ApiResponse<Course> expands to:
// { data: Course; status: number; message: string; }

// ApiResponse<string> expands to:
// { data: string; status: number; message: string; }

// The same interface structure — different data type.
```

## Generic constraints — restricting T

Without constraints, `T` can be anything. Constraints limit what types `T` can be. The most common constraint is `extends` — `T extends SomeType` means T must be assignable to SomeType.

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(value: T): T {
  console.log(`Length: ${value.length}`);
  return value;
}
```

```text
logLength("hello")          // → Length: 5 (strings have .length)
logLength([1, 2, 3])        // → Length: 3 (arrays have .length)
logLength({ length: 10 })   // → Length: 10 (objects with .length work too)
logLength(42)
//        ^^
// Argument of type 'number' is not assignable to parameter of type 'HasLength'.
// number doesn't have a .length property.
```

**SE lens:** Generic constraints are the TypeScript version of **interface contracts** from Java. `T extends HasLength` says "I don't care what T is, as long as it has a `.length` property — I promise only to use that." This is a type-safe version of duck typing: "if it walks like a duck, it's a duck" — except the compiler verifies the walking before you run the code.

**Common mistakes:**
- Writing `<T extends any>` — this is equivalent to `<T>` (no constraint) because everything is assignable to `any`. Use `<T extends object>` if you need to restrict to non-primitive types.
- Using generics when a union type would suffice — `getFirst<string | number>` is more specific and usually what you want for a finite set of types.

**Debug tip:** When a generic function gives an unexpected type error, check what TypeScript inferred for `T` — hover over the call site in VSCode. The inference error message shows what TypeScript tried to assign to `T` and why it failed.

**Next:** Utility types — TypeScript's built-in type transformations: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`.

## Challenge: generic_function

Write a generic function.

Write `wrap<T>(value: T): { value: T }` that wraps any value in an object.

```typescript
function wrap<T>(value: T): { value: T } {
  // return the wrapped object
}
```

```test
var s = wrap("hello")
assert s.value === "hello"
assert typeof s.value === "string"
var n = wrap(42)
assert n.value === 42
assert typeof n.value === "number"
var a = wrap([1, 2, 3])
assert Array.isArray(a.value)
assert a.value.length === 3
```
