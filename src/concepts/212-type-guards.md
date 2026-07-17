---
concept: 212-type-guards
name: Type Guards (TypeScript)
---

## Definition

A type guard is a runtime check (like `typeof`, `instanceof`, or a custom
function returning a special `x is Type` predicate) that TypeScript's
compiler recognizes as PROOF of a value's specific type — after the
check, TypeScript narrows the value's type accordingly for the rest of
that code block.

## Problem

A union-typed value (see Union Types) needs SOME runtime check to
determine which specific type it actually is before type-specific
operations are safe — but TypeScript needs to be able to statically
UNDERSTAND that check to safely narrow the type afterward, or it won't
allow type-specific operations even after a seemingly-valid check. Type
guards are specifically the checks TypeScript's compiler recognizes and
trusts for this narrowing.

## Execution

`typeof value === 'string'` is a BUILT-IN type guard TypeScript
recognizes natively, narrowing a value to `string` inside that branch
↓
A CUSTOM type guard function uses the special `pet is Cat` return type
annotation instead of plain `boolean`
↓
Calling it inside an `if` check lets TypeScript trust the function's `pet
is Cat` signature, narrowing the argument to `Cat` inside the `if` block
↓
Without the `pet is Cat` return type (just `boolean` instead), TypeScript
would NOT narrow the argument's type after the check, even though the
runtime check itself is identical — the SPECIAL return type syntax is
what tells the compiler to trust it as a type guard

## Computer Science

A custom type guard's `x is Type` return annotation is a form of
DEPENDENT typing at a small scale — the function's return TYPE (well, its
effect on the CALLER's type narrowing) depends on the actual boolean
VALUE it returns, which is a genuinely unusual, special-cased feature
TypeScript provides specifically to let user-defined runtime checks
participate in its narrowing system the same way built-in checks like
`typeof` do.

Tags: Type predicates, Dependent typing (limited), Compiler-trusted checks

## Software Engineering

Writing a well-defined type guard function is the idiomatic way to check
custom object shapes (distinguishing between several possible interface
types in a union) in a REUSABLE way — rather than repeating the same raw
membership check inline everywhere it's needed, wrapping it in a
properly-typed guard function lets TypeScript narrow correctly at every
call site.

Tags: Reusable narrowing logic, Custom guard functions, Interface discrimination

## Common Mistakes

- Writing a function that performs a valid runtime type check but declaring its return type as plain `boolean` instead of the special `x is Type` predicate — TypeScript won't narrow based on such a function's result, even though the check itself is logically correct.
- Writing a type guard whose actual runtime check DOESN'T truly guarantee the claimed type (a lying type guard) — TypeScript trusts the `x is Type` annotation completely and has no way to verify the function's body actually implements that check correctly, so a wrong implementation can cause real runtime type errors that the type system won't catch.

## Exercises

- Trace through what would happen (in terms of TypeScript's compile-time checking) if the guard's return type were changed from `pet is Cat` to plain `boolean`, keeping the exact same function body — would the cat-only method still be allowed inside the `if` block?
- Write a type guard function `isString(x: unknown): x is string` and explain how it would be used to safely narrow a value of type `unknown`.

## typescript

```typescript
interface Cat {
  meow(): string
}
interface Dog {
  bark(): string
}

function isCat(pet: Cat | Dog): pet is Cat {
  return 'meow' in pet
}

function greet(pet: Cat | Dog): string {
  if (isCat(pet)) {
    return pet.meow()   // TypeScript trusts isCat's "pet is Cat" annotation, narrows pet to Cat here
  } else {
    return pet.bark()   // narrowed to Dog in the else branch instead
  }
}

const myCat: Cat = { meow() { return 'Meow' } }
const myDog: Dog = { bark() { return 'Woof' } }

console.log(greet(myCat))   // Meow
console.log(greet(myDog))   // Woof
```
Walkthrough: `isCat`'s `pet is Cat` return type is what lets TypeScript
narrow `pet` to `Cat` inside `greet`'s `if` block, making `.meow()`
valid — a plain `boolean` return type would NOT enable this narrowing,
even with the identical runtime check. Calling `greet` with both a `Cat`
and a `Dog` correctly dispatches to each type's own method.
