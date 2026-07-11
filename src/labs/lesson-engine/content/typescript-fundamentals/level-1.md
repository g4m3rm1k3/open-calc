---
series: typescript-fundamentals
level: 1
title: Interfaces and Type Aliases
lang: typescript
---

# Interfaces and Type Aliases

A raw object type like `{ name: string; level: number }` can only be used in one place. Interfaces and type aliases give the shape a name, so it can be reused across files. They also make intent explicit — `User` communicates far more than `{ id: number; email: string }`.

## Type aliases — naming any type

`type` creates a named alias for any type expression. It can name primitives, unions, objects, and functions.

```typescript
type CourseId = number;
type LevelTitle = string;
type Status = "active" | "draft" | "archived";

type Level = {
  number: number;
  title: string;
  filePath: string;
};

const level: Level = {
  number: 0,
  title: "What CSS Is",
  filePath: "css-fundamentals/level-0.md",
};
```

```text
// Valid — matches the Level shape
const level: Level = { number: 0, title: "What CSS Is", filePath: "css-fundamentals/level-0.md" };

// Error — missing filePath
const bad: Level = { number: 0, title: "What CSS Is" };
//                             ^^^^^^^^^^^
// Property 'filePath' is missing in type '{ number: number; title: string; }'
// but required in type 'Level'.
```

## Interfaces — naming object shapes

`interface` is nearly identical to `type` for objects. The key difference: interfaces can be extended (merged) — you can add properties to an existing interface. Type aliases cannot be reopened.

```typescript
interface Course {
  id: string;
  label: string;
  lang: string;
  description: string;
}

interface CourseWithLevels extends Course {
  levels: Level[];
}

const pythonCourse: CourseWithLevels = {
  id: "python-fundamentals",
  label: "Python Fundamentals",
  lang: "python",
  description: "Learn Python the way professionals think about it.",
  levels: [
    { number: 0, title: "What Programming Is", filePath: "python-fundamentals/level-0.md" },
  ],
};
```

```text
// CourseWithLevels has all Course properties PLUS levels: Level[]
// extends works like inheritance — CourseWithLevels IS a Course with extra properties
```

**CS lens:** `interface extends` is **structural subtyping** — `CourseWithLevels` is a subtype of `Course` because it has all of `Course`'s properties plus more. This means a `CourseWithLevels` value can be used anywhere a `Course` is expected. TypeScript checks assignability structurally, not by name — this is fundamentally different from class-based inheritance in Java.

## Optional and readonly properties

```typescript
interface UserProfile {
  readonly id: number;          // cannot be reassigned after creation
  name: string;
  email: string;
  bio?: string;                 // ? makes it optional — can be undefined
  createdAt: Date;
}

const user: UserProfile = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  // bio omitted — that's fine, it's optional
  createdAt: new Date(),
};

// user.id = 2; // Error: Cannot assign to 'id' because it is a read-only property.
```

```text
// Optional property access:
const bio: string | undefined = user.bio;
// TypeScript knows bio might be undefined — you must handle that before using it

// Safe:
const displayBio = user.bio ?? "No bio provided";
// ?? is the nullish coalescing operator — returns the right side if left is null/undefined
```

**SE lens:** `readonly` on an interface property enforces the same discipline as `Object.freeze()` but at compile time — TypeScript rejects reassignment before the code runs. In functional programming, immutability (values that never change) eliminates an entire class of bugs: race conditions, accidental mutation, and state that's hard to trace. `readonly` is TypeScript's way of expressing this intention in the type system.

**Common mistakes:**
- Choosing `interface` vs `type` based on personal preference alone — use `interface` for objects that may be extended (especially in library code), `type` for unions, primitives, and closed object shapes.
- Making every property optional with `?` to avoid compiler errors — optional properties proliferate `| undefined` through your codebase. Only use `?` when a property genuinely may not exist.

**Debug tip:** In VSCode, hover over a type alias or interface name to see its full expanded definition. For large nested types, this is the fastest way to understand the shape without reading every file.

**Next:** Union types and intersection types — combining types to express "one of these" or "all of these."

## Challenge: interface_shape

Define an interface and use it.

Define a `Book` interface with: `title: string`, `author: string`, `pages: number`, and optional `isbn?: string`. Then create a `Book` object called `myBook`.

```typescript
interface Book {
  // define properties
}

const myBook: Book = {
  // fill in values
};
```

```test
assert typeof myBook === 'object'
assert typeof myBook.title === 'string'
assert typeof myBook.author === 'string'
assert typeof myBook.pages === 'number'
assert myBook.title.length > 0
assert myBook.pages > 0
```
