# FOUNDATIONS — LAB-036 — TypeScript: Generics

**Series:** FOUNDATIONS — Part VII: TypeScript Type System
**Environment:** TypeScript playground at typescriptlang.org/play
**Time:** 50–65 minutes.

---

## What You Will Build

A generic identity function, a generic `Stack<T>` class, a generic `findFirst` function with a constraint, and a demonstration of why generics prevent the information loss that `any` causes. After this lab you will understand parametric polymorphism and the difference between `any` (unsafe, disables checking) and a type parameter `T` (safe, defers the type decision to the call site).

---

## What You Need to Know First

**From LAB-035 (Union Types):** You know union types. Generics solve a different problem: "this function works with any type, but the output type must match the input type."

**From LAB-036 Prerequisite — LAB-027 (Stacks):** The `Stack` you built is generic in spirit — it works with any type of element. TypeScript generics let you make that explicit.

---

> **Quick Check — try to answer before reading:**
>
> 1. What is wrong with `function identity(value: any): any`?
> 2. Why can you not use a union type to solve the "works with any type" problem?
> 3. What does `T extends object` mean on a generic function?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Problem Generics Solve

```typescript
// Approach 1: any — compiles, but loses type information
function identityAny(value: any): any {
  return value;
}
const resultAny = identityAny(42);
resultAny.toUpperCase();  // No error! TypeScript allows anything on 'any' — runtime crash.

// Approach 2: specific overloads — doesn't scale
function identityNumber(value: number): number { return value; }
function identityString(value: string): string { return value; }
// Need one function per type — infinite boilerplate for general utilities.

// Approach 3: generics — correct
function identity<T>(value: T): T {
  return value;
}
const resultNumber = identity(42);       // T is inferred as number
const resultString = identity('hello');  // T is inferred as string
resultNumber.toFixed(2);   // OK — TypeScript knows it's number
resultString.toUpperCase(); // OK — TypeScript knows it's string
resultNumber.toUpperCase(); // TypeScript error! number has no toUpperCase
```

**The walkthrough:** `<T>` declares a **type parameter** — a placeholder for the actual type, filled in at the call site. When you call `identity(42)`, TypeScript infers `T = number`. The return type becomes `number`. The type information flows through the function without being discarded.

**The CS lens — parametric polymorphism:** Generics implement parametric polymorphism — the same code works for many types, with the type chosen at the point of use. The function is parameterised by a type just as a function can be parameterised by a value.

**The SE lens — `any` is a type-safety escape hatch, not a feature:** `any` turns off TypeScript's checks for a value. It is occasionally necessary (when working with completely untyped external data) but should be treated as technical debt. Every use of `any` is a place where TypeScript cannot protect you. A generic `T` gives you the same flexibility without giving up type safety.

---

### Step 2 — Generic `Stack<T>`

```typescript
class Stack<T> {
  #items: T[] = [];

  push(item: T): this {
    this.#items.push(item);
    return this;
  }

  pop(): T {
    if (this.isEmpty) throw new Error('Stack underflow');
    return this.#items.pop()!;
  }

  peek(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  get size(): number { return this.#items.length; }
  get isEmpty(): boolean { return this.#items.length === 0; }
}

// TypeScript infers T from the first push:
const numberStack = new Stack<number>();
numberStack.push(1).push(2).push(3);
numberStack.push('hello');  // TypeScript error: Argument of type 'string' is not assignable to 'number'
const top = numberStack.pop();  // TypeScript knows: top is number
top.toFixed(2);  // OK

const stringStack = new Stack<string>();
stringStack.push('a').push('b');
const str = stringStack.pop();
str.toUpperCase();  // OK — TypeScript knows: str is string
```

**The walkthrough:** `Stack<T>` is a blueprint. When you write `new Stack<number>()`, TypeScript substitutes `T = number` throughout the class. The `#items` array becomes `number[]`. The `push(item: T)` method accepts only `number`. The `pop()` return type is `number`.

The same `Stack` class works for `string`, `User`, `Shape`, or any other type — without copying the class. One definition, many type instantiations.

---

### Step 3 — Generic Constraints

**The problem this step solves:** A generic `T` is unconstrained — you cannot call any methods on it because TypeScript does not know what `T` is. Constraints restrict `T` to types that have specific properties.

```typescript
// Without constraint: TypeScript error if we try to access .length
function firstThreeChars<T>(value: T): string {
  return value.toString().slice(0, 3);  // .toString() is on Object — allowed
}

// Constraint: T must have a .length property
function firstElement<T extends { length: number }>(collection: T): string {
  return `Collection has ${collection.length} items`;
}

firstElement([1, 2, 3]);         // OK — arrays have length
firstElement('hello');            // OK — strings have length
firstElement({ length: 5, x: 1 }); // OK — object has length
firstElement(42);                 // TypeScript error: number has no 'length'

// Constraint: T must be a key of U
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
const name = getProperty(user, 'name');  // TypeScript: name is string
const age  = getProperty(user, 'age');   // TypeScript: age is number
getProperty(user, 'email');              // TypeScript error: 'email' is not a key of user
```

**The walkthrough — `K extends keyof T`:**

`keyof T` produces a union of all key names of type `T`. For `{ name: string; age: number }`, `keyof T` is `'name' | 'age'`. Constraining `K extends keyof T` means `key` must be one of those names. The return type `T[K]` is the type of that specific property — `string` for `'name'`, `number` for `'age'`.

This is TypeScript making dictionary lookup type-safe. The function cannot be called with a key that does not exist on the object.

**The CS lens — bounded quantification:** `T extends Constraint` is bounded type quantification — T ranges over all types that satisfy the constraint, not all types. This is the same concept in Java's `<T extends Comparable<T>>` and in Rust's trait bounds.

---

### Step 4 — Generic Return Type Inference

```typescript
function findFirst<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
  for (const item of array) {
    if (predicate(item)) return item;
  }
  return undefined;
}

// TypeScript infers T = number
const firstEven = findFirst([1, 2, 3, 4, 5], n => n % 2 === 0);
// TypeScript: firstEven is number | undefined

// TypeScript infers T = User (assuming User interface from LAB-034)
const firstAdult = findFirst(users, user => user.age !== undefined && user.age >= 18);
// TypeScript: firstAdult is User | undefined

// Safe usage — TypeScript knows to check for undefined
if (firstEven !== undefined) {
  console.log(firstEven.toFixed(0));  // OK — now TypeScript knows firstEven is number
}
```

**The walkthrough:** TypeScript infers `T` from the array argument. For `findFirst([1, 2, 3, ...], ...)`, the array is `number[]`, so `T = number`. The predicate's parameter is typed `(item: number) => boolean` — TypeScript verifies that the predicate's body makes sense for numbers. The return type is `number | undefined`.

This is the same pattern used by `Array.prototype.find` — which TypeScript types as `find<S extends T>(predicate: (value: T) => value is S): S | undefined`. Our implementation is a simplified version.

---

## Connect the Pieces

- **Every JavaScript built-in array method** is generic in TypeScript: `Array.map<U>(callbackfn: (value: T) => U): U[]`. The `U` type parameter is the output type, inferred from what the callback returns.
- **React's `useState<S>(initialState: S): [S, Dispatch<SetStateAction<S>>]`** — the state type is inferred from the initial value.
- **`Promise<T>`** — the resolved value type travels through `.then()` chains with full type safety.
- **TypeScript's utility types** — `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>` — are all implemented as generic mapped types.

---

## What Breaks Without This

**Using `any[]` instead of `T[]`:**

```typescript
function firstAny(array: any[]): any {
  return array[0];
}

const first = firstAny([1, 2, 3]);
first.toUpperCase();  // No TypeScript error — runs, crashes at runtime
// TypeError: first.toUpperCase is not a function
```

`any[]` accepts arrays of anything, and the return type is `any` — TypeScript stops checking. The bug is invisible until runtime. With `T[]`, the return type is `T`, TypeScript knows it is a number, and `.toUpperCase()` is flagged as an error before the code runs.

---

## Definition of Done

- [ ] `identity<T>(value: T): T` — calling it with a number returns a `number` type, not `any`
- [ ] `Stack<number>` — pushing a `string` produces a TypeScript error
- [ ] `getProperty(user, 'email')` produces a TypeScript error when `email` is not a key of `user`
- [ ] `findFirst([1,2,3,4,5], n => n % 2 === 0)` returns type `number | undefined`
- [ ] You can explain in one sentence why `<T>` is safer than `any` for "works with any type" scenarios

**Git commit:**

```
git add src/
git commit -m "LAB-036: TypeScript generics — type parameters preserve type information that any discards; constraints bound T to usable shapes"
```

---

## Quick Check Answers

1. **Type information is lost.** `identity(42)` returns `any`. TypeScript allows calling any method on `any`, including `.toUpperCase()` which would crash at runtime. The function signature promises nothing about what comes out.
2. **A union type grows without bound.** To support "any type," you would need `string | number | boolean | User | Product | ...` — every type that might ever be passed. Adding a new type requires updating the union everywhere it is used. Generics let the caller specify the type without modifying the function.
3. **`T extends object` means T must be an object type** — `number`, `string`, `boolean`, `null`, `undefined`, and `symbol` are excluded. Inside the function, TypeScript knows T has all properties of `object` (basically just `toString`, `hasOwnProperty`, etc.) but nothing more specific. You would use this when you need to prevent primitives but still work with any object shape.
