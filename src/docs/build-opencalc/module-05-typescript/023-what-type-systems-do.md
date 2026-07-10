# 023 — What Type Systems Do

*Static vs dynamic typing, what TypeScript catches that JavaScript does not, and the first compile error*

---

## What You Will Build

You will add TypeScript to the project and write one TypeScript file alongside the existing JavaScript. The file will contain a function with a type error that crashes at runtime in JavaScript but is caught at write-time in TypeScript. You will see the exact compiler error, understand what it means, and fix it.

---

## What You Need to Know First

Lesson 007 — Build Tools and the Dev Server. Vite already handles TypeScript.

Lesson 001 — What Is Software Engineering. Types are a form of specification.

---

## The Lesson

### What a type is

A **type** is a set of possible values. The type `boolean` is the set `{true, false}`. The type `string` is the (infinite) set of all possible string values. The type `number` is the set of all IEEE 754 floating-point values.

A **type system** is a set of rules that associates types with values and expressions in a program, and checks that operations are applied only to values of the appropriate type.

JavaScript has a type system — it is **dynamic** (types are checked at runtime):

```javascript
const x = 42
x.toUpperCase()  // TypeError: x.toUpperCase is not a function
```

The error occurs when the program runs. `x` is the number `42`; numbers do not have a `toUpperCase` method. JavaScript detects this mismatch at the moment the line executes.

TypeScript has a **static** type system (types are checked before the program runs):

```typescript
const x: number = 42
x.toUpperCase()  // Error: Property 'toUpperCase' does not exist on type 'number'.
```

The error appears in your editor immediately, before any code runs. TypeScript's compiler analyzes the code, determines that `x` has type `number`, and reports that `toUpperCase` is not a property of `number`.

---

**CS lens — the type system as a proof:**

A type system is a form of **formal verification** — a mathematical proof that certain classes of errors cannot occur. If a TypeScript program compiles without errors:

- Every variable has an explicit or inferred type
- Every function call is applied to arguments of the correct type
- Every property access refers to a property that exists on the object's type

The compiler has verified these properties for all possible inputs and code paths (within the limitations of TypeScript's type system). This is stronger than testing: a test verifies one specific execution; the type checker verifies all possible executions simultaneously.

The trade-off: TypeScript's type system is not Turing-complete-verified (it cannot prevent all possible errors). It catches a specific class of errors — type mismatches — which happen to be a large fraction of JavaScript bugs in practice.

---

**SE lens — types as documentation:**

Types are the most reliable form of documentation because they are machine-checked. A comment can lie:

```javascript
// Returns the lab title as a string
function getTitle(lab) {
  if (!lab) return null  // returns null — comment is wrong
  return lab.title
}
```

A type cannot lie:

```typescript
function getTitle(lab: Lab): string {
  if (!lab) return null  // Error: Type 'null' is not assignable to type 'string'
  return lab.title       // The compiler caught the lie
}
```

TypeScript forces the function signature to be honest about what it returns. When the implementation contradicts the declared return type, the compiler reports an error. The documentation (the type annotation) stays accurate because the compiler enforces it.

This is why TypeScript is described as "JavaScript that scales." As a codebase grows and more developers contribute, the type system provides a machine-enforced contract layer that makes large-scale refactoring safer.

---

### TypeScript is already configured

In lesson 007, you created a Vite project that compiles TypeScript. Vite's React plugin handles `.tsx` files (TypeScript + JSX) automatically.

However, TypeScript needs a configuration file to know its settings. Create `tsconfig.json` in the project root:

```json
{
  "compilerOptions": {
    "target":           "ES2020",
    "lib":              ["ES2020", "DOM", "DOM.Iterable"],
    "module":           "ESNext",
    "moduleResolution": "bundler",
    "jsx":              "react-jsx",
    "strict":           true,
    "noEmit":           true,
    "skipLibCheck":     true
  },
  "include": ["src"]
}
```

**Every field explained:**

`"target": "ES2020"` — the JavaScript version that TypeScript compiles to. `ES2020` supports `async/await`, optional chaining (`?.`), nullish coalescing (`??`), and other modern features without transformation. Vite handles the actual compilation; TypeScript's `target` just affects which ECMAScript features TypeScript considers safe to use.

`"lib": ["ES2020", "DOM", "DOM.Iterable"]` — type definitions to include. `ES2020` adds TypeScript's built-in types for `Array`, `Promise`, `Map`, etc. `DOM` adds browser API types (`document`, `window`, `HTMLElement`). `DOM.Iterable` adds iterable types for DOM collections (allows `for...of` over `NodeList`).

`"module": "ESNext"` — the module system to use in TypeScript output. `ESNext` means ES modules (`import`/`export`), matching the project's `"type": "module"` in `package.json`.

`"moduleResolution": "bundler"` — how TypeScript resolves import paths. `"bundler"` tells TypeScript to follow Vite's resolution rules (which are slightly different from Node.js's). Required for Vite projects.

`"jsx": "react-jsx"` — how to handle JSX. `"react-jsx"` uses the React 17+ automatic JSX transform (no `import React from 'react'` needed in every file).

`"strict": true"` — enables all strict type checking options. This is the most important setting. Without `strict`, many categories of type errors are silently allowed. `strict: true` enables:
  - `strictNullChecks` — `null` and `undefined` are not assignable to other types unless explicitly allowed
  - `noImplicitAny` — variables without explicit types cannot be inferred as `any` (the "escape hatch" type)
  - `strictFunctionTypes`, `strictPropertyInitialization`, and others

`"noEmit": true` — TypeScript does not produce JavaScript output files. Vite does the compilation; TypeScript's role is type checking only.

`"skipLibCheck": true` — skip type checking of `.d.ts` files in `node_modules`. Many packages have slightly incorrect type definitions; this prevents their errors from blocking your project.

`"include": ["src"]` — check only files in `src/`, not configuration files or build output.

---

### Install TypeScript types for React

TypeScript needs type definitions for React and React DOM:

```bash
npm install --save-dev typescript @types/react @types/react-dom
```

`typescript` — the TypeScript compiler.

`@types/react` — type definitions for React. The `@types/` namespace on npm contains type definitions for packages that do not ship their own. `react` ships JavaScript; `@types/react` provides the TypeScript types for React's API (`FC`, `ReactElement`, `useEffect`, etc.).

`@types/react-dom` — type definitions for ReactDOM (`createRoot`, `render`).

These are dev dependencies — only used during development and type checking.

---

### Your first TypeScript type error

Create `src/types-demo.ts` — a TypeScript file (`.ts`, not `.tsx` because there is no JSX here):

```typescript
// src/types-demo.ts
//
// Demonstrating what TypeScript catches that JavaScript misses.
// This file intentionally contains type errors — read the comments.

// ---- Example 1: Wrong argument type ----

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

// Correct: passing a number
const price1 = formatCurrency(9.99)
console.log(price1)  // "$9.99"

// Type error: passing a string
// In JavaScript: formatCurrency("free") → "$free.toFixed is not a function" (runtime crash)
// In TypeScript: error before the program runs
const price2 = formatCurrency("free")
//                             ^^^^^^
// Argument of type 'string' is not assignable to parameter of type 'number'.


// ---- Example 2: Accessing a property that might not exist ----

interface Lab {
  id:          string
  title:       string
  description: string
  category:    'math' | 'code' | 'science' | 'language'
}

function getLabTitle(lab: Lab | null): string {
  // Error: Object is possibly 'null'
  // Without strictNullChecks, this compiles fine and crashes at runtime
  return lab.title
  //     ^^^
  // TypeScript requires you to handle the null case
}

// Correct implementation:
function getLabTitleSafe(lab: Lab | null): string {
  if (lab === null) return 'Unknown Lab'
  return lab.title  // TypeScript knows lab is not null here
}


// ---- Example 3: Exhaustive variant handling ----

type Category = 'math' | 'code' | 'science' | 'language'

function getCategoryColor(category: Category): string {
  if (category === 'math')     return '#1565c0'
  if (category === 'code')     return '#6a1b9a'
  if (category === 'science')  return '#2e7d32'
  // Forgot 'language'!

  // TypeScript knows this case can be reached:
  // Error: Function lacks ending return statement and return type
  // does not include 'undefined'.
  //
  // If we add 'language' to the union type, TypeScript requires
  // us to handle it here too — exhaustive checking.
}

// Correct: handle all cases
function getCategoryColorSafe(category: Category): string {
  if (category === 'math')     return '#1565c0'
  if (category === 'code')     return '#6a1b9a'
  if (category === 'science')  return '#2e7d32'
  if (category === 'language') return '#e65100'

  // TypeScript: this line is unreachable — all cases are covered.
  // The 'never' type represents "this can never happen."
  const _exhaustiveCheck: never = category
  return _exhaustiveCheck
}
```

**Walkthrough:**

`function formatCurrency(amount: number): string` — function with TypeScript annotations:
- `amount: number` — the parameter has type `number`
- `: string` after the parameters — the function returns a `string`

TypeScript checks all call sites: every place `formatCurrency(...)` is called, the argument must be assignable to `number`. A `string` argument is not assignable to `number` → compile error.

`interface Lab { ... }` — an **interface** defines the shape of an object. `id: string` means any object of type `Lab` must have an `id` property of type `string`. Interfaces are pure TypeScript — they compile to nothing; they exist only for type checking.

`lab: Lab | null` — a **union type**: `lab` is either a `Lab` or `null`. With `strictNullChecks: true`, TypeScript treats `null` and `undefined` as distinct types. A value of type `Lab` cannot be `null`. A value of type `Lab | null` can be either.

`type Category = 'math' | 'code' | 'science' | 'language'` — a **literal union type** (also called a "discriminated union" or "string enum"). The type is not just `string` — it is the specific set of four string values. TypeScript checks that all assignments to `Category` use one of these exact strings.

When a function takes `category: Category` and switches on its value, TypeScript tracks which values have been handled. If a case is missing, TypeScript can report "function might return undefined."

`const _exhaustiveCheck: never = category` — the `never` type represents impossible values. After handling all four cases of `Category`, the `category` value has type `never` (there are no remaining values). Assigning a `never` value to `never` is valid. If a new category is added to the union (e.g., `'history'`) and not handled in the function, `category`'s type is `'history'` at this point, not `never` — and assigning `'history'` to `never` is a type error. This pattern forces exhaustive handling of union members.

---

**CS lens — type inference:**

TypeScript does not always require explicit annotations. It **infers** types from values:

```typescript
const count  = 42         // inferred: number
const name   = 'Alice'    // inferred: string
const active = true       // inferred: boolean

const labs   = [           // inferred: Array<{ id: string, title: string }>
  { id: 'a', title: 'Lab A' },
  { id: 'b', title: 'Lab B' },
]
```

TypeScript's type inference uses a bottom-up analysis: it determines the type of an expression based on the types of its sub-expressions. `42` has type `number`; a variable initialised with `42` has inferred type `number`.

The rule of thumb: explicitly annotate function signatures (parameters and return types); let TypeScript infer the types of variables and expressions inside functions. This gives the maximum benefit (functions document their contracts) with the minimum annotation burden (no redundant variable type annotations).

---

### Run the type checker

```bash
npx tsc --noEmit
```

`npx tsc` — runs the TypeScript compiler (`tsc`). `--noEmit` tells it to only check types, not produce JavaScript output (Vite handles that).

Expected output for `types-demo.ts`:

```
src/types-demo.ts:20:31 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/types-demo.ts:33:10 - error TS2531: Object is possibly 'null'.
src/types-demo.ts:43:1  - error TS2366: Function lacks ending return statement...
```

Three errors, corresponding to the three examples. These are the bugs that TypeScript caught. In JavaScript, two of them would crash the program at runtime (`formatCurrency("free")` → `TypeError`; `lab.title` on `null` → `TypeError`). The third would return `undefined` silently, passing `undefined` to whatever received the function's output.

TypeScript found all three before the program ever ran.

---

**SE lens — the cost of strictness:**

Enabling `"strict": true` means you must handle every case TypeScript identifies. This slows initial development — you cannot write `function formatCurrency(amount)` and move on. You must write `function formatCurrency(amount: number): string`.

The payoff comes at scale. In a team of 5 developers over 6 months, TypeScript's strict mode:
- Catches argument-type bugs that would surface as runtime errors in production
- Catches null pointer errors (the "billion-dollar mistake") before they reach users
- Makes refactoring safe: rename a field in an interface, and TypeScript shows every place that uses the old name
- Makes the codebase self-documenting: function signatures are verified contracts

The strictness is particularly valuable when:
- The codebase grows beyond what one person can hold in their head
- Contributors change frequently (onboarding is faster with self-documenting types)
- Refactoring large features (rename a prop, TypeScript shows every component that passes that prop)

---

## Connect the Pieces

**Connection to lesson 001:** Types are the machine-enforced version of the specification. From lesson 001: "a specification that cannot be tested is not a specification." TypeScript types make the component contract (the props interface) a specification that the compiler tests on every keystroke.

**Connection to lesson 011:** The `LabCard` props (`title`, `description`, `category`, `difficulty`, `onLaunch`) are an implicit contract. Lesson 024 converts them to a TypeScript interface that is explicitly checked.

**Connection to lesson 025:** Lesson 025 migrates an existing JavaScript file to TypeScript. Lesson 023 is the foundation — you need to understand what types are and what errors they catch before migrating real code.

---

## What Breaks Without This

**The `any` type escape hatch:**

```typescript
function formatCurrency(amount: any): string {
  return `$${amount.toFixed(2)}`
}
formatCurrency("free")  // No TypeScript error — but still crashes at runtime
```

`any` disables type checking for that value. TypeScript allows any operation on `any`. Using `any` defeats the purpose of TypeScript. The rule: never use `any` in production code. When TypeScript infers `any` (e.g., for untyped library calls or complex patterns), provide an explicit type annotation or use `unknown` (the safe alternative).

`unknown` vs `any`: `any` allows any operation. `unknown` requires type-narrowing (an `if` check or a cast) before any operation. `unknown` preserves type safety; `any` abandons it.

**Ignoring TypeScript errors:**

```typescript
// @ts-ignore
const price2 = formatCurrency("free")  // Suppresses the error on the next line
```

`// @ts-ignore` suppresses TypeScript errors on the following line. Use it only for known false positives — when TypeScript is wrong and you can prove it. Using it to silence real errors hides bugs and produces the same failures at runtime that TypeScript is designed to prevent.

`// @ts-expect-error` is a safer variant: if the following line does NOT produce an error, TypeScript reports an error ("expected an error but found none"). Use this for test code where you intentionally test invalid inputs.

---

## Definition of Done

- [ ] `tsconfig.json` exists with `"strict": true` and `"noEmit": true`
- [ ] `typescript`, `@types/react`, `@types/react-dom` are in `devDependencies`
- [ ] `src/types-demo.ts` exists with the three type error examples
- [ ] Running `npx tsc --noEmit` reports at least 3 errors for the intentional mistakes
- [ ] You can identify and fix each error in `types-demo.ts` (comment out the bad lines, add the correct implementations)
- [ ] You can explain the difference between dynamic type checking (JavaScript) and static type checking (TypeScript)
- [ ] You can explain what `| null` in a type annotation means and what changes it forces
- [ ] You can explain what `never` means and how it enables exhaustive checking
- [ ] You can explain the difference between `any` and `unknown`
- [ ] Git commit:
  ```
  git add tsconfig.json package.json package-lock.json src/types-demo.ts
  git commit -m "Add TypeScript configuration and type system demonstration

  tsconfig.json with strict: true, noEmit: true for type-check-only mode.
  @types/react and @types/react-dom provide React API type definitions.
  types-demo.ts shows: argument type errors, null checks, exhaustive union handling.
  npx tsc --noEmit reports the intentional errors in types-demo.ts."
  ```
