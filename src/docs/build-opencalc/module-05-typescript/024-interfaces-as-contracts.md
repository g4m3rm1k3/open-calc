# 024 — Interfaces as Contracts

*Defining shapes, typing the registry, and enforcing the lab component contract*

---

## What You Will Build

You will define TypeScript interfaces for the lab registry: `LabMetadata`, `LabRegistration`, and the props interfaces for `LabCard` and `CalculatorDisplay`. You will type the `register` function so that passing wrong metadata is a compile error. You will see how TypeScript's structural typing (duck typing) works.

---

## What You Need to Know First

Lesson 023 — What Type Systems Do. You understand interfaces, union types, and the compiler.

Lesson 022 — The Registry Pattern. `registry.js` defines the `register` function.

---

## The Lesson

### What an interface is

An **interface** describes the shape of an object. It specifies which properties the object must have and what types those properties must be.

```typescript
interface LabMetadata {
  title:       string
  description: string
  category:    'math' | 'code' | 'science' | 'language'
  difficulty:  'beginner' | 'intermediate' | 'advanced'
}
```

An object matches this interface if it has all four properties with the correct types. Missing a property → type error. Extra properties → allowed (structural typing). Wrong type → type error.

---

**CS lens — structural typing (duck typing):**

TypeScript uses **structural typing**: a value's type is determined by its shape (which properties it has and their types), not by explicit declarations or class inheritance.

In languages with **nominal typing** (Java, C#), two types with the same properties but different names are different types:

```java
// Java — nominal typing
class LabMetadata { String title; }
class CourseMetadata { String title; }

// These are different types even though they have the same shape
```

In TypeScript, two types with the same shape are interchangeable:

```typescript
// TypeScript — structural typing
interface LabMetadata { title: string }
interface CourseMetadata { title: string }

const lab: LabMetadata = { title: 'Calculator' }
const course: CourseMetadata = lab  // Valid — same shape
```

This is sometimes called **duck typing**: "if it walks like a duck and quacks like a duck, it is a duck." An object with `title: string`, `description: string`, `category: ...`, and `difficulty: ...` is a `LabMetadata` regardless of whether it was explicitly created as one.

Structural typing makes TypeScript very flexible: you do not need to import an interface to use it; you just need your object to have the right shape.

---

**SE lens — interfaces as API contracts:**

From lesson 011: a component's props interface is its contract. TypeScript interfaces formalise that contract:

```typescript
interface LabCardProps {
  title:       string
  description: string
  category:    'math' | 'code' | 'science' | 'language'
  difficulty:  'beginner' | 'intermediate' | 'advanced'
  onLaunch:    () => void
}
```

This interface is documentation that the compiler enforces. It answers:
- What data does `LabCard` require? (`title`, `description`, `category`, `difficulty`, `onLaunch`)
- What types must they be? (string, union of specific strings, a function returning void)
- Which are optional? (none — all are required in this interface; use `?` for optional props)
- What does `onLaunch` return? (`void` — nothing)

The contract is complete, unambiguous, and machine-checked. No comment can say this as precisely or as reliably.

---

### Create the type definitions file

Create `src/types.ts`:

```typescript
// src/types.ts
//
// Shared TypeScript interfaces for the platform.
// Imported by components and the registry that need these types.

import type { ComponentType, LazyExoticComponent } from 'react'

// ---- Lab metadata ----

export type LabCategory  = 'math' | 'code' | 'science' | 'language'
export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface LabMetadata {
  title:       string
  description: string
  category:    LabCategory
  difficulty:  LabDifficulty
}

// ---- Lab registration ----

export interface LabRegistration {
  component: LazyExoticComponent<ComponentType<Record<string, unknown>>> | ComponentType<Record<string, unknown>>
  metadata:  LabMetadata
}

// ---- Props interfaces ----

export interface LabCardProps {
  title:       string
  description: string
  category:    LabCategory
  difficulty:  LabDifficulty
  onLaunch:    () => void
}

export interface CalculatorDisplayProps {
  expression: string
  isError:    boolean
}

export interface HistoryEntry {
  id:         number
  expression: string
  result:     string
}

// ---- Registry types ----

export interface LabInfo extends LabMetadata {
  id: string
}
```

**Walkthrough:**

`import type { ComponentType, LazyExoticComponent } from 'react'` — `import type` imports type-only declarations. The `type` keyword tells TypeScript (and bundlers) that this import is purely for types and can be erased at compile time — no runtime import occurs. `ComponentType` is React's type for any component (function or class). `LazyExoticComponent` is the type returned by `React.lazy()`.

`export type LabCategory = 'math' | 'code' | 'science' | 'language'` — a **type alias** for the category union. Using `type` instead of `interface` for unions and aliases. The keyword `export` makes the type available to other files.

`export interface LabMetadata { ... }` — the interface export. Any file that imports `LabMetadata` can use it as an annotation.

`LazyExoticComponent<ComponentType<...>> | ComponentType<...>` — the component in a lab registration can be either a lazy component (from `React.lazy()`) or a regular component. The union `|` means either is acceptable.

`Record<string, unknown>` — a TypeScript utility type: an object with string keys and `unknown` values. Used here because lab components can accept any props (their specific props are not known to the registry). `Record<string, unknown>` is the correct type for "an object with some unknown props."

`export interface LabInfo extends LabMetadata { id: string }` — **interface extension**. `LabInfo` has all the properties of `LabMetadata` plus `id: string`. The `extends` keyword copies all properties from the extended interface into the new one.

---

### Update registry.js to registry.ts

Rename `src/registry.js` to `src/registry.ts` and add types:

```typescript
// src/registry.ts

import type { LabRegistration, LabInfo } from './types.js'

const registry = new Map<string, LabRegistration>()

export function register(id: string, registration: LabRegistration): void {
  if (registry.has(id)) {
    console.warn(`[Registry] Duplicate registration for id: "${id}". Skipping.`)
    return
  }
  registry.set(id, registration)
}

export function getComponent(id: string) {
  return registry.get(id)?.component ?? null
}

export function getMetadata(id: string): LabRegistration['metadata'] | null {
  return registry.get(id)?.metadata ?? null
}

export function getAllLabs(): LabInfo[] {
  return Array.from(registry.entries()).map(([id, { metadata }]) => ({
    id,
    ...metadata,
  }))
}
```

**Walkthrough:**

`new Map<string, LabRegistration>()` — a **generic type parameter**. `Map<K, V>` is a generic type: `K` is the key type, `V` is the value type. `Map<string, LabRegistration>` declares a map where keys are strings and values are `LabRegistration` objects. TypeScript now checks that `registry.set(key, value)` is called with a string key and a `LabRegistration` value.

`export function register(id: string, registration: LabRegistration): void` — typed parameters and return type. `void` means the function has no meaningful return value. This is more precise than `undefined` — `void` means "do not use the return value"; `undefined` means "the return value is literally `undefined`."

`LabRegistration['metadata']` — **indexed access type**. Reads the type of a specific property of an interface: `LabRegistration['metadata']` is the same as `LabMetadata`. This is a way to derive a type from another type without redundant definitions.

`LabInfo[]` — an array of `LabInfo` objects. TypeScript array type syntax: `Type[]` or `Array<Type>` — both equivalent.

---

### Add types to LabCard.jsx → LabCard.tsx

Rename `src/LabCard.jsx` to `src/LabCard.tsx` and add the props type:

```tsx
// src/LabCard.tsx

import type { LabCardProps } from './types.js'

export default function LabCard({
  title,
  description,
  category    = 'code',
  difficulty  = 'beginner',
  onLaunch    = () => {},
}: LabCardProps) {
  // ... same as before
}
```

With `LabCardProps`, calling `<LabCard difficulty="expert" />` is a TypeScript error:

```
Type '"expert"' is not assignable to type '"beginner" | "intermediate" | "advanced"'.
```

This catches the bug from lesson 011's "What Breaks Without This" section — silently rendering with a default — and turns it into a compile-time error.

---

**CS lens — generic types:**

TypeScript's `Map<K, V>` is a **generic type** — a type that is parameterised by other types. Generics allow writing type-safe functions and data structures that work with any type.

```typescript
// Generic function — works with any type T
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

const num  = first([1, 2, 3])   // T inferred as number; returns number | undefined
const str  = first(['a', 'b'])  // T inferred as string; returns string | undefined
```

Without generics, you would need separate functions `firstNumber`, `firstString`, etc., or use `any` (losing type safety). With generics, one function is type-safe for all types.

React's `useState` hook is generic:

```typescript
const [count, setCount] = useState<number>(0)
// useState<number> returns [number, Dispatch<SetStateAction<number>>]
```

Usually TypeScript infers the generic parameter from the initial value:

```typescript
const [count, setCount] = useState(0)  // inferred: useState<number>
```

But when the initial value is `null` or an empty array, explicit annotation is needed:

```typescript
const [lab, setLab] = useState<Lab | null>(null)
// Without <Lab | null>: TypeScript infers useState<null>, and setLab(someLab) is an error
```

---

### Add types to CalculatorDisplay.jsx → CalculatorDisplay.tsx

Rename `src/CalculatorDisplay.jsx` to `src/CalculatorDisplay.tsx`:

```tsx
// src/CalculatorDisplay.tsx

import type { CalculatorDisplayProps } from './types.js'

export default function CalculatorDisplay({ expression, isError }: CalculatorDisplayProps) {
  const displayValue = isError
    ? 'Error'
    : expression !== ''
      ? expression
      : '0'

  const displayColor = isError ? '#ff6b6b' : '#ffffff'

  return (
    <div style={{ /* ... same styles ... */ }}>
      <div style={{ /* ... */ }}>
        {expression !== '' ? `${expression} =` : ''}
      </div>
      <div style={{ /* ... */ }}>
        {displayValue}
      </div>
    </div>
  )
}
```

The JSX in TypeScript files is identical to JSX in JavaScript files. TypeScript adds only the type annotations; the JSX syntax is unchanged.

---

### Run tsc on the typed files

```bash
npx tsc --noEmit
```

With the deliberately erroneous `types-demo.ts` still in `src/`, this reports its errors plus any new errors from the typed components. To check only the new files, temporarily move `types-demo.ts` out of `src/`, run `tsc`, then move it back.

As you add TypeScript annotations, the error count should stay at zero for the files you have typed.

---

**SE lens — types and refactoring:**

TypeScript makes large-scale refactoring safe. Example: rename `category` to `subject` in `LabMetadata`.

**Without TypeScript:** Search the codebase for `category`, find every usage, update each one, hope you found them all. Run the app, discover crashes from missed usages.

**With TypeScript:** Change `category: LabCategory` to `subject: LabCategory` in `src/types.ts`. TypeScript immediately reports every file that uses `category` from `LabMetadata`. Fix each one; `npx tsc --noEmit` confirms zero errors. Every usage is updated.

The compiler serves as a mechanical refactoring guide. This is particularly valuable when the change affects many files across modules — precisely the cases where manual search-and-replace misses things.

---

## Connect the Pieces

**Connection to lesson 022:** The registry's `register` function now has a typed signature. Calling it with invalid metadata is a compile error. New lab authors get feedback immediately when their registration is incomplete.

**Connection to lesson 011:** The `LabCardProps` interface formalises the props contract from lesson 011. The compiler checks that every `<LabCard>` in the codebase passes the required props with the correct types.

**Connection to lesson 025:** Lesson 025 migrates remaining JavaScript files to TypeScript. This lesson established the types they will use.

**Connection to lesson 027:** Tests can use the TypeScript types. `render(<CalculatorDisplay expression="1+2" isError={false} />)` is type-checked: the types of `expression` and `isError` must match `CalculatorDisplayProps`.

---

## What Breaks Without This

**Structural typing misunderstanding:**

```typescript
interface LabMetadata {
  title:       string
  description: string
  category:    LabCategory
  difficulty:  LabDifficulty
}

const partial = { title: 'Lab', description: 'Desc' }
const meta: LabMetadata = partial
//    ^^^^
// Error: Property 'category' is missing in type '{title: string, description: string}'
//        but required in type 'LabMetadata'.
```

Missing required properties are caught. Optional properties (marked with `?`) would not be caught.

**Using `any` to bypass interface checking:**

```typescript
function register(id: any, registration: any): void {
  registry.set(id, registration)
}

register(42, { title: 'Lab' })  // No error — but id should be string, registration is incomplete
```

`any` disables the contract. The function becomes untyped; callers can pass anything. This is the pattern to avoid — it makes TypeScript worthless for that function.

**Interface extension confusion:**

```typescript
interface A { x: number }
interface B extends A { y: string }

const b: B = { x: 1, y: 'hello' }
const a: A = b  // Valid — B has all of A's properties
const b2: B = { x: 1 }  // Error — missing 'y'
```

Assigning a more specific type (B) to a more general type (A) is always valid. Assigning a more general type (A) to a more specific type (B) is an error — A might not have `y`.

---

## Definition of Done

- [ ] `src/types.ts` exists with `LabMetadata`, `LabRegistration`, `LabCardProps`, `CalculatorDisplayProps`, `HistoryEntry`, `LabInfo`
- [ ] `src/registry.js` is renamed to `src/registry.ts` with typed parameters
- [ ] `src/LabCard.jsx` is renamed to `src/LabCard.tsx` using `LabCardProps`
- [ ] `src/CalculatorDisplay.jsx` is renamed to `src/CalculatorDisplay.tsx` using `CalculatorDisplayProps`
- [ ] `npx tsc --noEmit` reports zero errors for the newly typed files
- [ ] Passing `difficulty="expert"` to `<LabCard>` in any file produces a TypeScript error
- [ ] You can explain structural typing in one sentence
- [ ] You can explain when to use `interface` vs `type` (interfaces for object shapes; type aliases for unions, primitives, and complex types)
- [ ] You can explain what `interface B extends A` does
- [ ] You can explain why `import type` is preferred for type-only imports
- [ ] Git commit:
  ```
  git add src/types.ts src/registry.ts src/LabCard.tsx src/CalculatorDisplay.tsx
  git commit -m "Add TypeScript interfaces for registry and component props

  types.ts: LabMetadata, LabRegistration, LabCardProps, CalculatorDisplayProps.
  registry.ts: typed register, getComponent, getAllLabs with Map<string, LabRegistration>.
  LabCard and CalculatorDisplay converted to .tsx with prop interfaces.
  npx tsc --noEmit passes with zero errors on the new .ts/.tsx files."
  ```
