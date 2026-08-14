# Lesson 05: Lambda Expressions

**What you will build:** a throwaway `delegate` type and a lambda
satisfying it, proving that a lambda expression is a real, callable
method value — not special syntax tied to any one C# feature — before
the next two lessons build `Func<>`/`Action<>` and `event` on top of it.

**What you need to know first:** [Lesson 04](lesson-04-struct-record-class.md).
Java's anonymous classes implementing a single-method interface (a
`Runnable`, a `Comparator`) are useful context for what this replaces,
though not required.

**Terms introduced in this lesson:**
- **`delegate`** — a keyword declaring a *type* that describes a method
  shape (parameter types and a return type), rather than declaring a
  method itself.
- **Lambda expression** — an inline, unnamed method definition, written
  with the `=>` operator, satisfying whatever delegate type it's assigned
  to.
- **Lambda operator (`=>`)** — separates a lambda's parameter list (left)
  from its body (right); the same operator already seen twice, on
  expression-bodied members (Lessons 01, 02), now applied to a full
  standalone function instead of one class member.

**Objects and methods used:** none beyond `System.Console.WriteLine`,
already covered.

---

## Concept Unit: `delegate` — A Type Describing a Method Shape

### The Problem

Every variable so far in this series has held data — a `string`, a
`double`, an object. Passing *behavior* itself around — "run this
specific logic later, whatever it turns out to be" — needs some way to
describe what shape that behavior has to have (how many parameters, what
types, what it returns) before any actual behavior can be assigned to
it, the same way a variable's type has to be declared before a value can
be stored in it.

### Introduce the Concept in Isolation

```csharp
delegate int Operation(int a, int b);

class Calculator
{
    public static int Add(int a, int b) => a + b;
    public static int Multiply(int a, int b) => a * b;
}

public class Program
{
    public static void Main()
    {
        Operation op = Calculator.Add;
        System.Console.WriteLine(op(3, 4));

        op = Calculator.Multiply;
        System.Console.WriteLine(op(3, 4));
    }
}
```

Output:
```
7
12
```

`delegate int Operation(int a, int b);` declares a real **type** —
`Operation` — describing "any method taking two `int`s and returning an
`int`." `Operation op = Calculator.Add;` does **not** call `Add` — it
stores a reference to the method itself in `op`, exactly the way `int x
= 5;` stores a value in `x`. `op(3, 4)` then calls whichever method `op`
currently holds. Reassigning `op = Calculator.Multiply;` and calling it
the *exact same way* — `op(3, 4)` — changes what actually runs, from `7`
to `12`, with no change to the call syntax at all: real, provable proof
that a method itself, not just its result, was stored and swapped.

### Discard

`Operation`/`Calculator` are deleted now — the next unit's lambda uses a
fresh, equally small example.

### Mechanical Walkthrough

- `delegate int Operation(int a, int b);` — **(a) first appearance.**
  Declares `Operation` as a type; `int` (before the name) is its
  required return type, `(int a, int b)` its required parameter list —
  any method matching this exact shape can be stored in an `Operation`
  variable.
- `public static int Add(int a, int b) => a + b;` — **(b) hard concept
  reappearing**, the same `=>` expression-bodied shorthand from Lessons
  01/02, here on an ordinary method; `static` — **(a) first
  appearance** — means `Add` belongs to the `Calculator` type itself,
  not to any one instance of it, which is why it's called as
  `Calculator.Add` with no `new Calculator()` anywhere.
- `Operation op = Calculator.Add;` — **(a) first appearance** of the
  actual mechanism: assigning a method reference (not its result — note
  there are no parentheses after `Add` here) to a variable of the
  matching delegate type.
- `op(3, 4)` — **(a) first appearance**: calling through a delegate
  variable using ordinary call syntax, invoking whatever method it
  currently references.
- `op = Calculator.Multiply;` — **(c) already basic** as a plain
  reassignment; what it demonstrates (the method actually called changes)
  is this unit's entire point.

### CS Lens

**(b) hard concept, real restatement.** This is a **first-class
function** — a function treated as a value that can be stored in a
variable, passed as an argument, and returned from another function, the
same status data values already have. Java has no true first-class
function type; passing "a method" around there requires wrapping it in
an object implementing a single-method interface (a **functional
interface** — `Runnable`, `Comparator`, `OnClickListener`). A C#
`delegate` *is* the method reference directly, no wrapping object
required.

Also recognized in: JavaScript functions (always first-class, no special
type needed), Python functions (same), Kotlin's own function types
(`(Int, Int) -> Int`, a closer cousin of a C# delegate than Java's
functional interfaces are), and any callback-based API in any language.

## Concept Unit: Lambda Expressions — Writing a Method Inline

### The Problem

Writing a whole named `static` method just to hand it to a delegate, as
`Add`/`Multiply` did above, is real, avoidable ceremony for logic that's
only ever used in one place. Something more direct is needed for "define
this small piece of behavior right where it's used."

### Introduce the Concept in Isolation

```csharp
delegate int Operation(int a, int b);

public class Program
{
    public static void Main()
    {
        Operation add = (a, b) => a + b;
        System.Console.WriteLine(add(3, 4));

        Operation subtract = (int a, int b) => { return a - b; };
        System.Console.WriteLine(subtract(10, 4));
    }
}
```

Output:
```
7
6
```

`(a, b) => a + b` — no `Calculator` class, no named `Add` method
anywhere, and yet `add(3, 4)` correctly returns `7`. This is called a
**lambda expression**: an inline, unnamed method definition. `(a, b)` is
its parameter list; `=>` is the **lambda operator**, separating the
parameters from the body; `a + b` is the body — a single expression,
whose result becomes the lambda's return value automatically, with no
explicit `return` keyword needed. `subtract` shows the second, more
explicit form: `(int a, int b) => { return a - b; }` writes the
parameter types out (rather than inferring them from `Operation`'s own
declared signature, as `add`'s shorter form does) and uses a full `{ }`
block body with a real `return` statement — needed the moment a lambda's
logic is more than one expression.

### Discard

This `add`/`subtract` pair is deleted; the next lesson's `Func<>`/
`Action<>` material builds fresh, equally small examples on top of this
same lambda syntax.

### Mechanical Walkthrough

- `Operation add = (a, b) => a + b;` — **(a) first appearance** of the
  compact lambda form: `(a, b)` — the parameter list, with types omitted
  because the compiler infers them from `Operation`'s own declared
  signature (`int a, int b`); `=>` — the lambda operator, connecting
  parameters to body; `a + b` — the body, a single expression, implicitly
  returned.
- `Operation subtract = (int a, int b) => { return a - b; };` — **(a)
  first appearance** of the explicit-type, block-body form: `(int a,
  int b)` — parameter types written out by hand instead of inferred;
  `{ return a - b; }` — a full block body, needed once the logic is more
  than a single implicitly-returned expression.
- `add(3, 4)` / `subtract(10, 4)` — **(b) hard concept reappearing**,
  the identical delegate-call syntax from the previous unit, now calling
  a lambda instead of a named method — proof that a lambda is a real,
  first-class method value satisfying `Operation` exactly the way
  `Calculator.Add` did, with no difference in how it's called.

### SE Lens

The real tradeoff between a named method and a lambda: a named method
(`Calculator.Add`) is reusable by name from anywhere and shows up with a
real, findable name in a stack trace or a debugger's call list — genuine
value for logic used in more than one place, or complex enough to
benefit from a descriptive name of its own. A lambda trades that
discoverability for locality: the logic sits exactly where it's used,
with no separate declaration to go find, which is the right tradeoff for
small, single-use behavior — exactly the shape most WPF event handlers
and LINQ predicates take, which is why this lesson exists ahead of both.

## Connect the pieces

One trace: `delegate int Operation(int a, int b);` declares a type
describing a method's shape. `Calculator.Add`, stored in an `Operation`
variable, proves a method itself — not its result — can be stored and
swapped, with the call site never changing. A lambda expression,
`(a, b) => a + b`, satisfies that exact same delegate type with no named
method declared anywhere at all — the fastest, most direct way to hand a
small piece of behavior to anything expecting a delegate.

## What breaks without this

Write a lambda with the wrong parameter count against `Operation`
(which requires exactly two `int` parameters):

```csharp
Operation bad = (a) => a * 2;
```

This does **not** compile:

```
error CS1593: Delegate 'Operation' does not take 1 arguments
```

Real, provable proof that a lambda isn't just "code in curly braces
assigned to a variable" — it's genuinely type-checked against the exact
delegate shape it's being assigned to, parameter count and all, the same
strict checking any other type mismatch in this series has already shown
(Lesson 03's `var`/`string` mismatch, this same shape of error).

## Exercises

1. Declare a second delegate type, `delegate bool Predicate(int x);`,
   and write a lambda satisfying it that returns whether `x` is even
   (`x % 2 == 0`). Call it against a few different values and confirm
   the real `bool` results.
2. Rewrite `subtract` from this lesson's second unit using the compact,
   single-expression form (no `{ }`, no explicit `return`) instead of
   the block-body form shown. Confirm it compiles and produces the same
   output — proof that either form is valid whenever the body really is
   just one expression.

## Definition of Done

- [ ] You compiled and ran the `Operation`/`Calculator` example and saw
      the same call site (`op(3, 4)`) produce two different real results
      after reassignment.
- [ ] You compiled and ran the lambda versions (`add`, `subtract`) and
      saw matching output using no named method at all.
- [ ] You caused the real `CS1593` parameter-count mismatch and
      understood why a lambda is checked against its delegate type just
      as strictly as any other assignment.
- [ ] You completed both exercises and observed the described behavior
      yourself.

## Next

[Lesson 06 — Delegates, `Func<>`, and `Action<>`](lesson-06-delegates-func-action.md)
covers the two generic delegate types .NET ships so a `delegate` almost
never has to be hand-declared the way `Operation` was in this lesson.
