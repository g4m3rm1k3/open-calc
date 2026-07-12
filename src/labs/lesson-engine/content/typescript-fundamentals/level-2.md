---
series: typescript-fundamentals
level: 2
title: Union and Intersection Types
lang: typescript
---

# Union and Intersection Types

A function that accepts either a string slug or a numeric database ID needs to handle both. A database record that always has timestamps and author info is the combination of multiple shapes. TypeScript handles both cases without `any`.

**Union types** (`A | B`) express "this value is one of these types." **Intersection types** (`A & B`) express "this value satisfies all of these types simultaneously." Together they cover the two fundamental ways types can be combined.

By the end of this lesson you will be able to write union types for values that take multiple forms, use type narrowing to work safely within union branches, model state machines with discriminated unions, and compose types with intersections.

## Union types — one of

`A | B` — the value is either `A` or `B`. The most common use: nullable values, discriminated unions, and configuration options.

```typescript
type Id = string | number;

function findCourse(id: Id): string {
  if (typeof id === "string") {
    return `Looking up course by slug: ${id}`;
  } else {
    return `Looking up course by ID: ${id}`;
  }
}
```

```text
findCourse("python-fundamentals")  // → "Looking up course by slug: python-fundamentals"
findCourse(42)                      // → "Looking up course by ID: 42"
findCourse(true)
//         ^^^^
// Argument of type 'boolean' is not assignable to parameter of type 'Id'.
```

Inside the `typeof` check, TypeScript **narrows** the type — within the `if (typeof id === "string")` branch, TypeScript knows `id` is a `string`. This is called **type narrowing** and eliminates the need to cast.

## Literal types and discriminated unions

A literal type is a type that's exactly one specific value — `"active"` is different from `string`. Combined with union types, this creates **discriminated unions** — a pattern for modelling state machines.

```typescript
type CourseStatus = "draft" | "published" | "archived";

interface DraftCourse {
  status: "draft";
  draftNote: string;
}
interface PublishedCourse {
  status: "published";
  publishedAt: Date;
}
interface ArchivedCourse {
  status: "archived";
  archivedReason: string;
}

type Course = DraftCourse | PublishedCourse | ArchivedCourse;

function describeCourse(course: Course): string {
  switch (course.status) {
    case "draft":     return `Draft: ${course.draftNote}`;
    case "published": return `Published on ${course.publishedAt.toDateString()}`;
    case "archived":  return `Archived: ${course.archivedReason}`;
  }
}
```

```text
// TypeScript knows which subtype you have in each case:
// In case "draft": course is DraftCourse, so course.draftNote exists
// In case "published": course is PublishedCourse, so course.publishedAt exists
// If you miss a case, TypeScript reports an exhaustiveness error (with strictness settings)
```

**CS lens:** The discriminated union is TypeScript's implementation of the **algebraic data type** (ADT) pattern, specifically the **sum type** (one of). Haskell, Rust, and Swift have this built into the language (`enum` in Rust). TypeScript achieves the same thing through unions and a shared discriminant property (`status` in this case). Sum types are the standard model for state machines — every state is a distinct variant, and the compiler enforces that every variant is handled.

## Intersection types — all of

`A & B` — the value must satisfy both types simultaneously. Used for **mixins** and for combining separate concerns into one type.

```typescript
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}
interface Authored {
  authorId: number;
  authorName: string;
}
interface LessonContent {
  title: string;
  markdown: string;
}

type PublishedLesson = LessonContent & Timestamped & Authored;

const lesson: PublishedLesson = {
  title: "Variables",
  markdown: "# Variables\n...",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-07-11"),
  authorId: 1,
  authorName: "Alice",
};
```

```text
// PublishedLesson has ALL properties from LessonContent, Timestamped, and Authored
// Missing any one of them is a compile error.

// Intersection vs Extends:
// intersection (&) — compose at the type level (no interface declaration)
// extends — compose at the interface level (creates a new named interface)
// They produce the same result. Use & when you don't need to name the intermediate type.
```

**SE lens:** Intersection types implement the **mixin pattern** — composing small, single-responsibility interfaces into larger ones. `Timestamped` and `Authored` are reusable behaviours that any entity (lesson, course, comment) might have. Keeping them separate and composing at the type level mirrors the principle of interface segregation: each interface is as small as possible, clients use only what they need.

**Common mistakes:**
- Confusing `A | B` (union: one of) with `A & B` (intersection: both) — union makes types more flexible; intersection makes them more specific.
- Using `any` when you need a union — `string | number` is safer than `any` because TypeScript still checks that you use it correctly for each type.

**Debug tip:** When TypeScript reports "Property X does not exist on type A | B" — it means property X exists on one member of the union but not the other. You must narrow the type first with `typeof`, `instanceof`, or a discriminant property check.

**Next:** Generics — writing functions and types that work with any type while still being type-safe.

## Challenge: union_type

Use a union type and handle both cases.

Write a function `formatId` that accepts `id: string | number` and returns `"str:${id}"` if it's a string, or `"num:${id}"` if it's a number.

```typescript
function formatId(id: string | number): string {
  // check the type and return the right format
}
```

```test
assert formatId("abc") === "str:abc"
assert formatId(42) === "num:42"
assert formatId("hello") === "str:hello"
assert formatId(0) === "num:0"
```
