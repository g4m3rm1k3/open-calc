---
series: typescript-fundamentals
level: 7
title: Modules and Declaration Files
lang: typescript
---

# Modules and Declaration Files

TypeScript modules are JavaScript modules with type information. Every file is a module if it has an `import` or `export` statement. Declaration files (`.d.ts`) add type information to JavaScript packages that weren't written in TypeScript.

## Export and import

TypeScript uses the same `import`/`export` syntax as JavaScript ESModules, plus the ability to import and export types.

```typescript
// math.ts — exporting functions and a type
export type MathResult = { value: number; error?: string };

export function add(a: number, b: number): MathResult {
  return { value: a + b };
}

export function divide(a: number, b: number): MathResult {
  if (b === 0) return { value: 0, error: "Division by zero" };
  return { value: a / b };
}

export const PI = 3.14159265358979;
```

```typescript
// app.ts — importing from math.ts
import { add, divide, PI, type MathResult } from "./math.js";
// 'type' keyword — tells bundlers this import is type-only (erased at compile time)

const result: MathResult = add(2, 3);
console.log(result.value);  // → 5

const safe = divide(10, 0);
if (safe.error) {
  console.log(safe.error);  // → "Division by zero"
}
```

```text
// 'import type' — only imports the type, not the value
// At runtime this import compiles to nothing — types are erased.
// Use it for interface/type imports to improve bundler tree-shaking.

// 'export type' — same idea: only exports the type
// Useful when a type is used across modules but has no runtime value.
```

**CS lens:** TypeScript modules follow the **module pattern** — each file is a private scope by default. Only exported identifiers are visible to importers. This is the same concept as Python's module system or Java's package-private visibility. The `import type` / `export type` distinction exists because TypeScript types are erased at compile time — bundlers (like Vite, esbuild) can dead-code-eliminate imports that are type-only. Without `type`, the bundler doesn't know if an import has a runtime value.

## Ambient declarations — typing JavaScript

Some packages are pure JavaScript with no TypeScript types. Declaration files (`.d.ts`) add types without any runtime code.

```typescript
// Imagine a JavaScript library that exports: window.Analytics = { track, identify }
// Its declaration file would be:

// analytics.d.ts
declare namespace Analytics {
  function track(event: string, properties?: Record<string, unknown>): void;
  function identify(userId: string, traits?: Record<string, unknown>): void;
}

// After this declaration, TypeScript knows the shape of Analytics:
Analytics.track("course_started", { courseId: "python-fundamentals" });
Analytics.identify("user-123", { plan: "pro" });
```

```text
// The @types/* packages on npm are community-maintained declaration files
// for popular JavaScript packages:

// npm install --save-dev @types/node   — adds types for Node.js built-ins
// npm install --save-dev @types/react  — adds types for React

// When you install @types/react, TypeScript knows that:
// import React from 'react' → React.FC, React.useState, etc. are all typed.

// Without @types/react, every React import would be 'any'.
```

## Re-exports and barrel files

A **barrel file** (`index.ts`) re-exports everything from a folder, creating a clean public API for a module.

```typescript
// src/types/index.ts — barrel file
export type { Course } from "./course";
export type { User } from "./user";
export type { Level } from "./level";
export { SERIES } from "./series";

// Now consumers import from one place:
import { Course, User, SERIES } from "./types";
// Instead of:
// import { Course } from "./types/course"
// import { User } from "./types/user"
// import { SERIES } from "./types/series"
```

```text
// tsconfig.json paths — set up module path aliases:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}

// With paths configured:
import { Course } from "@types/course";  // resolves to src/types/course.ts
```

**SE lens:** Barrel files implement the **facade pattern** — a single entry point that hides the internal module structure. The internal structure can be reorganized freely without affecting importers. This is why React can move internal code between files between versions without breaking `import { useState } from 'react'`. The public API is stable; the implementation is free to change.

**Common mistakes:**
- Circular imports — file A imports from file B which imports from file A. This causes runtime errors in JavaScript (the module is undefined when first imported). TypeScript warns about this. Barrel files can accidentally create circular imports — check `madge` (a CLI tool) if you suspect cycles.
- Re-exporting everything with `export * from "./module"` — this exports internal implementation details alongside the public API, making it impossible to know what's intentionally public. Always be explicit: `export { specificThing } from "./module"`.

**Debug tip:** Run `tsc --noEmit` to type-check your entire project without producing output. This is the standard "type check only" command for CI pipelines. The output is all TypeScript errors across all files — zero output means zero type errors.

**Congratulations — TypeScript Fundamentals complete!** You've covered types, interfaces, unions, generics, utility types, narrowing, classes, and modules. The curriculum continues with SQL Fundamentals.

## Challenge: export_import

Use import/export syntax.

Create and use an exported function.

```typescript
// In this lesson engine, we simulate exports in a single file.
// Write a function 'formatCourse' that takes a name: string and returns 'Course: ${name}'
// Then export it (in a real module you'd write: export function formatCourse...)
// For this challenge, just define it — the test will check it directly.

function formatCourse(name: string): string {
  // implement
}
```

```test
assert typeof formatCourse === 'function'
assert formatCourse("Python") === "Course: Python"
assert formatCourse("CSS") === "Course: CSS"
assert formatCourse("SQL") === "Course: SQL"
```
