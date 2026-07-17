---
concept: 073-generics
name: Generics
---

## Definition

Generics let a function, class, or type be written once and work correctly
across many different types, by taking the type itself as a parameter —
rather than being hard-coded to one specific type, or duplicated once per
type.

## Problem

Writing a container (a stack, a list, a cache) that only holds one
hard-coded type forces a near-identical duplicate of that container for
every other type it needs to hold — a `StringStack`, a `UserStack` — each
repeating the exact same logic just to satisfy the type checker.

## Computer Science

Two different mechanisms achieve this, depending on the language. **Type
erasure** (Java, TypeScript) compiles the generic type information away
entirely, leaving ordinary untyped code at runtime — a `List<String>` and a
`List<Integer>` are literally the same bytecode. **Monomorphization** (Rust,
C++ templates) instead generates a separate, specialized copy of the code
for each concrete type actually used, trading larger compiled output for the
possibility of type-specific optimizations. Because this mechanism genuinely
differs by language, there's no single runtime model to trace step by step —
each language section below carries that difference directly.

Tags: Type erasure, Monomorphization, Parametric polymorphism, Compile-time

## Software Engineering

Generics let a library author write one well-tested container or algorithm
and have every consumer get full type-checking on their specific usage,
without the library needing to predict every type it'll ever be used with —
this is why collection classes (lists, maps, stacks) are almost universally
generic in statically-typed languages.

Tags: Code reuse, Type safety, Library design, Constraints

## Common Mistakes

- Making something generic before a second concrete type actually needs it — premature generalization adds complexity (type parameters, constraints) for flexibility nobody is using yet.
- Forgetting to add a constraint (e.g. requiring `T` to be comparable) when the generic code needs to do something only some types support — without the constraint, the compiler correctly refuses to allow that operation on an unconstrained type parameter.

## Exercises

- Write a generic `firstOrNull<T>(items: T[])` function and call it with an array of numbers, then an array of strings — confirm the same function body works for both with full type-checking.
- Try writing a generic `max<T>(a: T, b: T)` function with no constraint on `T`, then attempt `a > b` inside it — explain the resulting compiler error, and add whatever constraint fixes it.

## typescript

```typescript
function firstOrNull<T>(items: T[]): T | null {
  return items.length > 0 ? items[0] : null
}

console.log(firstOrNull<number>([10, 20, 30]))   // 10
console.log(firstOrNull<string>(['a', 'b']))     // 'a'
console.log(firstOrNull<number>([]))              // null
```
Walkthrough: `T` is a placeholder for "whatever type the caller uses" — the
same function body works correctly whether `T` ends up being `number` or
`string`, and TypeScript's compiler still checks every call site against the
specific `T` it was used with, catching a mismatched type at compile time
rather than letting it slip through the way a looser `any` type would.

## java

```java
static <T> T firstOrNull(java.util.List<T> items) {
    return items.isEmpty() ? null : items.get(0);
}

System.out.println(firstOrNull(java.util.List.of(10, 20, 30)));   // 10
System.out.println(firstOrNull(java.util.List.of("a", "b")));     // a
```
Walkthrough: Java's `<T>` before the return type declares this method's type
parameter. Unlike TypeScript, Java's generics are erased at compile time —
at runtime, this method doesn't actually know what `T` was; it works purely
because the compiler already verified type-correctness at every call site
before that erasure happened.
