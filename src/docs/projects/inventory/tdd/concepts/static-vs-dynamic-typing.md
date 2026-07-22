# Concept: Static vs. Dynamic Typing

**What you'll understand by the end:** the difference between a language checking types before a program runs versus while it runs, and where a few common languages actually fall on that line.

**Prerequisites:** `typescript-type-annotations.md`.

## Setup

Node.js (for the TypeScript/JavaScript comparison) and Python 3 (for the Python comparison).

## The Problem

"Type checking" isn't one single thing every language does the same way — *when* a mismatch is caught, and whether it's caught at all, varies fundamentally between languages, and conflating "has types" with "checks types before running" is a real, common misunderstanding worth resolving directly.

## The Isolated Example

TypeScript (statically checked, before running):
```typescript
function double(n: number): number {
  return n * 2;
}
double("five" as any);
```
`npx tsc --noEmit` on the un-cast version (`double("five")`) reports a real error *before* anything runs. Once cast past the checker with `as any` (a deliberate escape hatch), the line compiles — and then fails, or behaves strangely, only once actually executed.

Python (dynamically checked, only at the moment of use):
```python
def double(n):
    return n * 2

print(double("five"))
```
**Real output:**
```
fivefive
```

**What this proves:** Python raised no error at all — `"five" * 2` is completely valid Python (string repetition), so the "wrong-typed" call didn't even fail, it just did something the caller likely didn't intend. Nothing checked, before or during execution, whether `double` was "supposed to" receive a number — Python only ever asks, at the moment `*` actually runs, "does this specific operation make sense for these specific values," with no earlier, broader check of the function's intent.

## Mechanical Walkthrough

- **Static typing** (TypeScript, when types aren't bypassed): the checker analyzes the entire program's source text before execution, and refuses to produce a passing result if a type mismatch exists anywhere it can prove one — the check happens once, ahead of time, independent of which code paths a particular run actually takes.
- **Dynamic typing** (Python, JavaScript without TypeScript): no upfront analysis occurs; each individual operation (a multiplication, a method call) checks — or doesn't — whether the values involved support it, at the exact moment that operation runs, and only for the code paths actually executed that run.
- Python *does* perform some real dynamic type checking (calling `.upper()` on an integer raises a real `AttributeError` at that exact line) — it isn't typeless, it's just checked later, and only for the specific operations actually attempted, not the full space of what a function could receive.

## CS Lens

This is the distinction between a **static type system** and a **dynamic type system** — a static system proves properties about *all possible executions* of a program by analyzing its text; a dynamic system only ever observes what happens on *the one specific execution* actually taking place, and only if that execution reaches an operation a mismatched type would break.

Also recognized in: Java/C#/Rust/Go/C++ (statically typed, checked before running), Python/Ruby/JavaScript (dynamically typed, checked — if at all — during running), and gradually-typed systems like TypeScript itself or Python's own optional type hints (`mypy`) — layering a static check on top of a fundamentally dynamic runtime, catching what the static analysis can prove wrong ahead of time while the underlying execution model remains dynamic either way.

## SE Lens

Static typing's real benefit — catching a class of bug before any code runs, across every path a checker can reason about, not just the one path a specific test happens to exercise — comes with a real cost: more upfront annotation, and occasional friction when a checker can't prove something a developer knows is actually fine. Dynamic typing's real benefit — write and run code immediately, with no annotation overhead — comes with the real cost demonstrated above: a genuine type mistake (`"five" * 2`) can silently produce a plausible-looking wrong answer instead of any error at all, discovered only if and when someone actually notices the output is wrong.

## Connection

Builds on `typescript-type-annotations.md`. Directly explains why a dynamically-typed backend's own hand-written `isinstance` checks (see `input-validation-at-boundary.md`) only run for the specific cases someone thought to check, while a statically-typed frontend's checking is automatic and exhaustive across every annotated line — the same underlying static/dynamic distinction, observed as a real, practical difference between two language stacks in the same project.

## Try It Yourself

1. Write the identical "multiply by 2" function in TypeScript with a `string` parameter type instead of `number`, and confirm `double("five" as unknown as string)`... more directly: confirm that typed correctly (`n: string`), TypeScript happily allows string repetition-via-multiplication-typo to be *caught*, because `"five" * 2` (multiplication on a declared string) is itself a real type error in TypeScript, unlike in Python.
2. In Python, deliberately call a function expecting a number with a list instead (`double([1, 2])`) and observe the real, dynamic `TypeError` this produces at the point of the `*` operation — contrast this against the earlier string case, where the identical "wrong type" input didn't error at all, only behaved surprisingly. Reason about why dynamic typing's failures are inconsistent this way — some wrong types crash, some don't, depending entirely on whether the specific operation involved happens to support the wrong type too.
3. Look up Python's own optional type hints (`def double(n: int) -> int:`) and run `mypy` (or a similar checker, if available) against a call that violates them. Confirm Python itself still runs the mismatched call with no complaint at the language level — the hints are purely for an external tool's benefit, never enforced by the Python interpreter itself, a real, important distinction from TypeScript's own annotations, which the compiler that produces the running code actually uses.
