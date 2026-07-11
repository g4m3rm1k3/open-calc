---
series: typescript-fundamentals
level: 0
title: Types and Type Annotations
lang: typescript
---

# Types and Type Annotations

TypeScript is JavaScript with a type system bolted on. Every `.ts` file compiles to plain `.js` — TypeScript only exists at development time. Its job is to catch bugs before the code runs by checking that values are used in ways consistent with their declared types.

## Why types catch bugs

JavaScript is dynamically typed — variables can hold any value and the type is checked at runtime. TypeScript is statically typed — the compiler knows the type of every variable before the code runs.

```typescript
// JavaScript — no error until runtime
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
greet(42); // Runtime crash: name.toUpperCase is not a function
```

```text
// TypeScript — caught at compile time
function greet(name: string): string {
  return "Hello, " + name.toUpperCase();
}
greet(42);
//    ^^
// Argument of type 'number' is not assignable to parameter of type 'string'.
// This error appears in your editor before you even run the code.
```

The TypeScript compiler reads your code and checks types. Errors appear in your editor (VSCode underlines them in red) and in the terminal when you run `tsc`. The code never reaches the browser with a type error.

## Primitive type annotations

TypeScript's primitive types mirror JavaScript's: `string`, `number`, `boolean`, `null`, `undefined`.

```typescript
let courseName: string = "Python Fundamentals";
let levelCount: number = 36;
let isPublished: boolean = true;
let authorId: number | null = null; // can be a number or null
```

```text
// Compiled output — types are erased, pure JavaScript:
let courseName = "Python Fundamentals";
let levelCount = 36;
let isPublished = true;
let authorId = null;
```

`: string` is a **type annotation**. It tells TypeScript what type this variable holds. TypeScript checks that every assignment to `courseName` is a `string`. `number | null` is a **union type** — it can be either.

**CS lens:** TypeScript's type system is **structural** — a type is defined by its shape (properties and methods), not its name. This is different from Java's **nominal** type system where two types with identical properties but different names are incompatible. In TypeScript, if it has the right shape, it's the right type.

## Type inference — TypeScript guesses the type

Annotating every variable manually would be tedious. TypeScript infers the type from the initial value — you only need annotations when inference can't determine the type or when you want to document intent.

```typescript
// TypeScript infers the type — no annotation needed
let name = "Alice";        // inferred: string
let score = 42;            // inferred: number
let active = true;         // inferred: boolean

// Inference can't help here — TypeScript uses 'any'
let data;                  // inferred: any (avoid this)
data = "hello";
data = 42;                 // both allowed — 'any' disables type checking
```

```text
// Hover over a variable in VSCode to see its inferred type.
// The TypeScript language server runs in the background — it re-checks types
// as you type, not just at compile time.
```

**SE lens:** `any` is TypeScript's escape hatch — it disables type checking for that value. Using `any` is sometimes necessary when interacting with third-party libraries that have no type definitions. But `any` spreads: if `data` is `any`, then `data.name` is `any`, then `data.name.toUpperCase()` is `any` — you've lost type safety for that entire chain. The TypeScript team tracks `any` usage as a **type coverage metric**. Production codebases aim for 0% `any`.

## Function type annotations

Every function parameter and return type can be annotated. Annotating return types is especially useful — it catches the case where one branch of the function returns the wrong type.

```typescript
function add(a: number, b: number): number {
  return a + b;
}

function formatLevel(level: number, title: string): string {
  return `Level ${level}: ${title}`;
}

// Arrow function
const double = (n: number): number => n * 2;

// void — function returns nothing
function logMessage(message: string): void {
  console.log(message);
}
```

```text
add(1, 2)           // → 3
add("1", 2)
//  ^^^
// Argument of type 'string' is not assignable to parameter of type 'number'.

formatLevel(3, "Functions")  // → "Level 3: Functions"
double(5)                     // → 10
```

**Common mistakes:**
- Annotating every variable — TypeScript's inference is good. Only annotate when inference gives the wrong type or when you're writing a function signature (which always benefits from explicit parameter types).
- Using `any` as a shortcut when TypeScript complains — the complaint is telling you something. Understand it before silencing it.

**Debug tip:** VSCode's TypeScript integration shows errors in the Problems panel (`Ctrl+Shift+M` / `Cmd+Shift+M`) before you even run `tsc`. Hover over any underlined identifier to see its type and the full error message.

**Next:** Interfaces and type aliases — defining the shape of objects and giving your types names.

## Challenge: type_annotations

Write a function with correct TypeScript type annotations.

Write a function `describe` that takes a `name` (string) and `level` (number) and returns a string `"${name} — Level ${level}"`.

```typescript
// Write the function with type annotations
function describe(  ) {

}
```

```test
assert typeof describe === 'function'
var result = describe("Python", 5)
assert typeof result === 'string'
assert result === 'Python — Level 5'
var result2 = describe("CSS", 12)
assert result2 === 'CSS — Level 12'
```
