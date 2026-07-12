---
series: typescript-fundamentals
level: 4
title: Utility Types
lang: typescript
---

# Utility Types

A form that edits a user allows changing name or email, but not id or createdAt. Without utility types, you would write a separate `EditableUser` interface manually — and update it every time `User` changes.

TypeScript ships with built-in generic types that transform existing types: make all properties optional, remove some, keep only some, make them all readonly. These are called **utility types** and they are used in virtually every TypeScript codebase.

By the end of this lesson you will be able to use `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, and `Record`, and understand that these are implemented using mapped types — giving you the vocabulary to understand advanced TypeScript library code.

## Partial and Required

`Partial<T>` makes every property optional. `Required<T>` makes every property required.

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  level: number;
}

// Partial — useful for update payloads (patch endpoints)
type CourseUpdate = Partial<Course>;
// { id?: string; title?: string; description?: string; level?: number; }

function updateCourse(id: string, changes: CourseUpdate): void {
  // Only the provided fields are updated
  console.log(`Updating ${id}:`, changes);
}

updateCourse("python-fundamentals", { title: "Python Fundamentals v2" });
// valid — only title is needed
```

```text
// Required — opposite of Partial
interface Config {
  apiUrl?: string;
  timeout?: number;
  retries?: number;
}

type StrictConfig = Required<Config>;
// { apiUrl: string; timeout: number; retries: number; }
// All properties required — can't omit any.
```

## Pick and Omit

`Pick<T, Keys>` creates a type with only the specified properties. `Omit<T, Keys>` creates a type without the specified properties.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "student";
  createdAt: Date;
}

// Pick — safe public user shape (no password)
type PublicUser = Pick<User, "id" | "name" | "role">;
// { id: number; name: string; role: "admin" | "student"; }

// Omit — same result, different approach
type SafeUser = Omit<User, "passwordHash">;
// { id, name, email, role, createdAt } — everything except passwordHash
```

```text
// In practice: use Pick when you want a few specific fields,
// use Omit when you want everything except a few fields.

const publicProfile: PublicUser = { id: 1, name: "Alice", role: "student" };
const safeUser: SafeUser = { id: 1, name: "Alice", email: "...", role: "student", createdAt: new Date() };
```

**CS lens:** `Pick` and `Omit` are **type-level functions** — they take a type as input and produce a new type as output. TypeScript's utility types are implemented using **mapped types** (`{ [K in keyof T]: T[K] }`) and **conditional types** (`T extends U ? X : Y`). Understanding these underlying mechanisms lets you write your own utility types.

## Record and Readonly

`Record<Keys, Values>` creates an object type with specific key and value types. `Readonly<T>` makes all properties immutable.

```typescript
type SeriesId = "python-fundamentals" | "css-flexbox" | "css-grid";
type SeriesInfo = { label: string; levelCount: number };

const seriesMap: Record<SeriesId, SeriesInfo> = {
  "python-fundamentals": { label: "Python Fundamentals", levelCount: 37 },
  "css-flexbox":         { label: "CSS Flexbox", levelCount: 9 },
  "css-grid":            { label: "CSS Grid", levelCount: 8 },
};
// TypeScript ensures every SeriesId key is present — missing one is an error.

type ImmutableCourse = Readonly<Course>;
// All properties become readonly — cannot be reassigned after creation
```

```text
seriesMap["python-fundamentals"]  // → { label: "Python Fundamentals", levelCount: 37 }
seriesMap["sql-fundamentals"]
//         ^^^^^^^^^^^^^^^^^^^
// Type '"sql-fundamentals"' is not assignable to type 'SeriesId'.
// This is a typo check at the type level.
```

**SE lens:** `Record<K, V>` is the type-safe version of a plain object used as a lookup table. The pattern `Record<string, string>` is equivalent to `{ [key: string]: string }` but reads more clearly. In production codebases, `Record<SomeEnum, SomeType>` ensures that every enum value has an entry in the lookup table — adding a new enum value causes a compile error if the lookup table isn't updated. This is compile-time exhaustiveness checking for object maps.

**Common mistakes:**
- Using `Partial<T>` for DTOs (data transfer objects) where all fields are actually required — Partial communicates "fields may be absent," which is misleading if they're always present. Use a separate "create" interface with required fields.
- `Record<string, any>` — the `any` value defeats type safety. Use `Record<string, unknown>` when the value type is truly unknown, then narrow at the call site.

**Debug tip:** In VSCode, hover over a utility type instantiation (e.g., `Partial<Course>`) to see the fully expanded type. This shows exactly what properties the resulting type has.

**Next:** Narrowing and type guards — using `typeof`, `instanceof`, `in`, and custom type predicates to refine types inside conditional blocks.

## Challenge: utility_types

Use Partial and Pick.

Given `interface Product { id: number; name: string; price: number; stock: number }`:
1. Create `type ProductPreview = Pick<Product, 'id' | 'name'>`
2. Create `type ProductUpdate = Partial<Product>`
3. Create a `preview` object of type `ProductPreview`

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

type ProductPreview = Pick<Product, 'id' | 'name'>;
type ProductUpdate = Partial<Product>;

const preview: ProductPreview = {
  // fill in
};
```

```test
assert typeof preview === 'object'
assert typeof preview.id === 'number'
assert typeof preview.name === 'string'
assert preview.id > 0
assert preview.name.length > 0
```
