---
concept: 214-type-narrowing
name: Type Narrowing (TypeScript)
---

## Definition

Type narrowing is TypeScript's process of refining a broader type (like a
union) down to a more SPECIFIC type within a particular code branch,
based on runtime checks the compiler recognizes — after a narrowing
check, TypeScript allows operations valid only for the narrowed type, for
the rest of that scope.

## Problem

A value with a broad or union type can't safely use type-specific
operations without first confirming, at runtime, which specific type it
actually is — but if TypeScript couldn't track the RESULT of that check
through the rest of the code, every operation would still require
redundant checks or unsafe type assertions. Narrowing lets TypeScript's
compiler follow the LOGIC of runtime checks (`typeof`, `instanceof`,
truthiness, equality comparisons) and automatically apply the more
specific type wherever the check guarantees it.

## Execution

A parameter has the union type `string | number | null`
↓
Checking for `null` and returning early NARROWS the type for the REST of
the function to `string | number` — `null` has been ELIMINATED by the
early return
↓
Checking `typeof value === 'string'` narrows FURTHER to just `string`
inside that block
↓
By the final line, TypeScript has narrowed the value down to just
`number` (both `null` and `string` have been excluded by the preceding
checks), so a number-only method is valid with NO additional check needed
↓
This progressive narrowing works because TypeScript tracks the CONTROL
FLOW of the function, understanding that reaching this final line means
all earlier branches were NOT taken

## Computer Science

This is CONTROL FLOW ANALYSIS integrated directly into the type system —
TypeScript doesn't just check types locally at each statement, it tracks
how conditions and early returns affect a variable's possible type at
EVERY subsequent point in the code, which is a genuinely sophisticated
static analysis capability beyond simple type checking.

Tags: Control flow analysis, Progressive narrowing, Type elimination

## Software Engineering

Relying on narrowing (rather than manual type assertions with `as`)
keeps code both safer and more self-documenting — the compiler VERIFIES
each narrowing step is logically sound based on the actual runtime check
present, while a manual `as` assertion is just an unchecked claim the
developer could get wrong.

Tags: Type assertions vs narrowing, Compiler-verified safety, Self-documenting checks

## Common Mistakes

- Using a type assertion (`as SomeType`) to force a type instead of a real runtime check that narrows it — assertions bypass the compiler's actual verification, so an incorrect assertion can compile fine but crash at runtime.
- Assuming narrowing persists across an intervening function call that could change the variable — TypeScript's narrowing analysis can be invalidated if a called function (or a closure) has the potential to reassign the narrowed variable to a different type between the check and its use.

## Exercises

- Trace through the example below and explain what the parameter's type is understood to be at EACH of the three return statements, and why.
- Explain why removing the early-return `null` check entirely would break the compiler's ability to safely call the number-only method later in the function.

## typescript

```typescript
function process(value: string | number | null): string {
  if (value === null) {
    return 'nothing'
  }
  if (typeof value === 'string') {
    return value.toUpperCase()
  }
  return value.toFixed(2)   // narrowed to number here -- both null and string were excluded above
}

console.log(process(null))     // nothing
console.log(process('abc'))    // ABC
console.log(process(3.14159))  // 3.14
```
Walkthrough: each call exercises a different narrowed branch — `null`
returns early before any type-specific operation, `'abc'` is narrowed to
`string` and uses `.toUpperCase()`, and `3.14159` falls through both
earlier checks, leaving TypeScript to correctly infer it must be `number`
at the final `.toFixed(2)` call, with no explicit check needed at that
point.
