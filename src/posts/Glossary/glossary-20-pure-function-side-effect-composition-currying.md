# Functional Programming II: Pure Function, Side Effect, Composition, Currying

## What you will build

Four runnable programs — one per concept — in both Python and TypeScript,
completing the functional programming vocabulary that Glossary 19 started.
By the end you'll understand why pure functions are easier to test and
reason about, what makes side effects worth naming and managing, how
function composition builds complex behavior from simple pieces, and how
currying and partial application create specialized functions from general
ones.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation. It builds directly on Glossary
19 (Lambda, Closure, Higher-Order Function) — specifically the ideas that
functions are values and closures capture their environment. Reading
Glossary 19 first is recommended but not required; relevant ideas are
re-introduced at the point they're needed.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

---

## Concept 1: Pure Function and Side Effect

A **pure function** has two properties:
1. Given the same inputs, it always returns the same output — no
   randomness, no dependence on external state, no dependence on time.
2. It has no **side effects** — it does not modify anything outside its
   own local scope.

A **side effect** is any observable change that a function makes to the
world outside itself: modifying a variable outside the function, writing
to a file, printing to the screen, mutating a list that was passed in,
making a network call, changing global state.

### Python

First, a deliberately impure function and its problems:

```python
call_count = 0


def impure_add(a, b):
    global call_count
    call_count += 1
    print(f"  [impure_add] called {call_count} time(s)")
    return a + b


print(impure_add(2, 3))
print(impure_add(2, 3))
print(f"  call_count: {call_count}")
```

```
  [impure_add] called 1 time(s)
5
  [impure_add] called 2 time(s)
5
  call_count: 2
```

**Walkthrough:** `impure_add(2, 3)` returns `5` both times — the return
value is correct. But the function also modifies `call_count` (a side
effect) and prints to the screen (another side effect). These make
`impure_add` hard to test in isolation (tests would need to reset
`call_count` between runs) and hard to reason about (calling it twice
with the same arguments changes global state). If this function were called
from three different places in a program, the printed output and the count
would depend on the order those three call sites execute — hard to predict,
hard to debug.

```python
def pure_add(a, b):
    return a + b


def pure_multiply(a, b):
    return a * b


def pure_discount(price, discount_rate):
    if discount_rate < 0 or discount_rate > 1:
        raise ValueError(f"discount_rate must be between 0 and 1, got {discount_rate}")
    return price * (1 - discount_rate)


print(pure_add(2, 3))
print(pure_add(2, 3))
print(pure_multiply(4, 5))
print(pure_discount(100, 0.2))
```

```
5
5
20
80.0
```

**Walkthrough:** `pure_add(2, 3)` returns `5` both times, changes nothing,
prints nothing, modifies nothing. It always will. You can call it once or
a million times with the same arguments and get the same result — this
property is called **referential transparency**: a call to the function
could be replaced with its return value anywhere it appears, with no
observable difference. `pure_discount` validates its input (raising
`ValueError` for invalid values) but still has no side effects — the error
is part of the function's defined behavior for invalid inputs, not an
unintended modification of the outside world.

**CS lens — why purity matters for reasoning.** A pure function is a
**mathematical function**: a mapping from inputs to outputs, always the
same mapping, never changing anything. Pure functions are the easiest
kind of code to reason about, test, and reuse because:
- Testing: give it inputs, check the output. No setup, no teardown,
  no shared state to reset.
- Caching: if it always returns the same result for the same inputs,
  you can cache results safely (memoization).
- Parallelism: pure functions can run in any order, on any thread, with
  no risk of interference — there's no shared state to corrupt.
- Composition: pure functions chain together predictably (next section).

**SE lens — managing side effects, not eliminating them.** Real programs
must have side effects — you need to write to databases, send emails,
display output to users. The functional programming discipline isn't to
eliminate side effects but to **isolate** them: push side effects to the
edges of the system (I/O, external APIs, persistence) and keep the core
logic pure. A function that transforms data purely can be tested without
any infrastructure; the thin layer around it that reads from a database and
writes results back to it is the only part that needs integration testing.

**What breaks without this distinction:** Code where any function might
modify global state or produce output makes testing complex (everything
needs cleanup), makes bugs location-dependent (the result of calling
`f()` depends on what called it before), and makes parallelism dangerous
(two threads calling the same function simultaneously might corrupt shared
state).

### TypeScript

```typescript
let callCount = 0;

function impureAdd(a: number, b: number): number {
  callCount += 1;
  console.log(`  [impureAdd] called ${callCount} time(s)`);
  return a + b;
}

console.log(impureAdd(2, 3));
console.log(impureAdd(2, 3));
console.log(`  callCount: ${callCount}`);

console.log("---");

function pureAdd(a: number, b: number): number { return a + b; }
function pureMultiply(a: number, b: number): number { return a * b; }

function pureDiscount(price: number, discountRate: number): number {
  if (discountRate < 0 || discountRate > 1) {
    throw new Error(`discountRate must be between 0 and 1, got ${discountRate}`);
  }
  return price * (1 - discountRate);
}

console.log(pureAdd(2, 3));
console.log(pureAdd(2, 3));
console.log(pureMultiply(4, 5));
console.log(pureDiscount(100, 0.2));
```

```
  [impureAdd] called 1 time(s)
5
  [impureAdd] called 2 time(s)
5
  callCount: 2
---
5
5
20
80
```

**Walkthrough:** Note `80` in TypeScript versus `80.0` in Python —
JavaScript/TypeScript doesn't distinguish integer and float types at the
language level; `100 * (1 - 0.2)` produces `80`, not `80.0`. Both are
numerically correct; the display difference is a language convention.

---

## Concept 2: Composition

**Function composition** is combining two or more functions so that the
output of one becomes the input of the next, creating a new function that
applies all of them in sequence. In mathematics, `(f ∘ g)(x)` means
`f(g(x))` — apply `g` first, then feed the result to `f`.

### Python

```python
def compose(*functions):
    def composed(value):
        result = value
        for function in reversed(functions):
            result = function(result)
        return result
    return composed


def add_ten(x):
    return x + 10


def double(x):
    return x * 2


def square(x):
    return x * x


double_then_add = compose(add_ten, double)
all_three       = compose(add_ten, double, square)

print(f"double_then_add(5): {double_then_add(5)}")
print(f"all_three(3):       {all_three(3)}")

print(f"\nManual verification:")
print(f"  double_then_add(5) = add_ten(double(5)) = add_ten(10) = {add_ten(double(5))}")
print(f"  all_three(3) = add_ten(double(square(3))) = add_ten(double(9)) = add_ten(18) = {add_ten(double(square(3)))}")
```

**Walkthrough:** `compose(*functions)` takes any number of functions and
returns a new function (`composed`) that applies them right-to-left —
`compose(f, g, h)` produces a function that computes `f(g(h(value)))`. The
`reversed(functions)` applies them in the mathematical convention: the
rightmost function runs first. `double_then_add(5)` is `add_ten(double(5))`:
double 5 → 10, add ten → 20. `all_three(3)` is `add_ten(double(square(3)))`:
square 3 → 9, double → 18, add ten → 28.

```
double_then_add(5): 20
all_three(3):       28

Manual verification:
  double_then_add(5) = add_ten(double(5)) = add_ten(10) = 20
  all_three(3) = add_ten(double(square(3))) = add_ten(double(9)) = add_ten(18) = 28
```

Now composition applied to data transformation — the Pipeline pattern
from Glossary 10, expressed purely through function composition:

```python
def pipe(*functions):
    def piped(value):
        result = value
        for function in functions:
            result = function(result)
        return result
    return piped


def remove_whitespace(text):
    return " ".join(text.split())


def to_lowercase(text):
    return text.lower()


def remove_punctuation(text):
    return "".join(char for char in text if char.isalnum() or char == " ")


def split_words(text):
    return text.split()


normalize = pipe(
    remove_whitespace,
    to_lowercase,
    remove_punctuation,
    split_words,
)

text = "  Hello, World!  This is a TEST.  "
result = normalize(text)
print(f"\nInput:  '{text}'")
print(f"Output: {result}")
```

```

Input:  '  Hello, World!  This is a TEST.  '
Output: ['hello', 'world', 'this', 'is', 'a', 'test']
```

**Walkthrough — new syntax.** `"".join(char for char in text if
char.isalnum() or char == " ")` — `.join()` called with a generator
expression (from Glossary 12): `char` is each character in `text`;
`char.isalnum()` returns `True` if the character is a letter or digit;
`char == " "` allows spaces through. Only alphanumeric characters and
spaces survive, all others (punctuation, special characters) are filtered
out. `pipe` is `compose` with the functions applied left-to-right (the
more natural reading order for a pipeline: "first do this, then this,
then this"). Both `compose` and `pipe` are function composition — just
different conventions for the order.

**CS lens.** Composition is one of the most fundamental ideas in
mathematics and computing. Every complex system is, at some level, a
composition of simpler parts — the question is whether that composition
is explicit (named, testable, recombinable) or implicit (tangled,
hard to isolate). When `normalize` is a composed function, each of its
four component functions can be tested independently, and the composition
itself is a single, readable expression of the intended transformation.

**SE lens.** Function composition is the functional alternative to class
inheritance for building complex behavior from simple parts. Where
inheritance says "this class extends that one, inheriting and overriding
behavior," composition says "this function is built from these other
functions, applied in this order." Composition tends to produce flatter,
more flexible structures — each function in the composition can be swapped
or reordered without affecting the others, and the composition itself can
be built dynamically (as `pipe(...)` above).

### TypeScript

```typescript
function compose<T>(...functions: Array<(x: T) => T>): (x: T) => T {
  return (value: T) =>
    [...functions].reverse().reduce((result, fn) => fn(result), value);
}

function pipe<T>(...functions: Array<(x: T) => T>): (x: T) => T {
  return (value: T) => functions.reduce((result, fn) => fn(result), value);
}

const addTen  = (x: number): number => x + 10;
const double  = (x: number): number => x * 2;
const squared = (x: number): number => x * x;

const doubleThenAdd = compose(addTen, double);
const allThree      = compose(addTen, double, squared);

console.log(`double_then_add(5): ${doubleThenAdd(5)}`);
console.log(`all_three(3):       ${allThree(3)}`);

const removeWhitespace  = (text: string): string => text.trim().replace(/\s+/g, " ");
const toLowercase       = (text: string): string => text.toLowerCase();
const removePunctuation = (text: string): string => text.replace(/[^a-z0-9 ]/g, "");
const splitWords        = (text: string): string[] => text.split(" ");

const normalizeToWords = (text: string): string[] =>
  [removeWhitespace, toLowercase, removePunctuation].reduce(
    (result, fn) => fn(result),
    text
  ).split(" ");

const input = "  Hello, World!  This is a TEST.  ";
console.log(`\nInput:  '${input}'`);
console.log(`Output: ${JSON.stringify(normalizeToWords(input))}`);
```

**Walkthrough — new syntax.** `[...functions].reverse().reduce(...)` —
spreading into a new array before `.reverse()` avoids mutating the original
`functions` array in place (`.reverse()` is destructive in JavaScript,
unlike Python's `reversed()` which returns a new iterator). `.replace(/\s+/g,
" ")` — the regex `/\s+/g` uses the `g` (**global**) flag, which means
"replace all occurrences," not just the first. Without `g`, JavaScript's
`.replace()` only replaces the first match. Python's `" ".join(text.split())`
handles multiple spaces automatically; TypeScript requires the explicit
regex replacement. `.replace(/[^a-z0-9 ]/g, "")` — `[^...]` is a character
class negation: match any character that is NOT in the set `a-z`, `0-9`,
or space, and replace it with nothing (delete it).

```
double_then_add(5): 20
all_three(3):       28

Input:  '  Hello, World!  This is a TEST.  '
Output: ["hello","world","this","is","a","test"]
```

---

## Concept 3: Currying and Partial Application

**Currying** transforms a function that takes multiple arguments into a
chain of functions each taking one argument: `f(a, b, c)` becomes
`f(a)(b)(c)`. **Partial application** pre-fills some (but not all)
arguments of a function, producing a new function that accepts the
remaining ones.

Both use closures (from Glossary 19) to capture the pre-filled arguments.

### Python

```python
def add(a, b):
    return a + b


def curried_add(a):
    def inner(b):
        return a + b
    return inner


print(add(2, 3))
print(curried_add(2)(3))

add_five  = curried_add(5)
add_ten   = curried_add(10)

print(add_five(3))
print(add_ten(3))
print(list(map(add_five, [1, 2, 3, 4, 5])))
```

```
5
5
8
13
[6, 7, 8, 9, 10]
```

**Walkthrough:** `curried_add(2)(3)` — `curried_add(2)` returns the inner
function (a closure capturing `a=2`); calling that with `(3)` evaluates
`2 + 3`. `add_five = curried_add(5)` creates a specialized "add 5" function
by partially applying the first argument. `list(map(add_five, [1,2,3,4,5]))`
passes `add_five` directly to `map` — each element gets 5 added to it.
This is partial application enabling a one-argument function from a
two-argument one, ready to be used wherever a single-argument function
is expected.

Python's `functools` module provides `partial` for general partial
application without writing the closure manually:

```python
from functools import partial


def multiply(a, b):
    return a * b


def power(base, exponent):
    return base ** exponent


double   = partial(multiply, 2)
triple   = partial(multiply, 3)
square   = partial(power, exponent=2)
cube     = partial(power, exponent=3)

print(double(5))
print(triple(5))
print(square(4))
print(cube(3))

numbers = [1, 2, 3, 4, 5]
print(list(map(double, numbers)))
print(list(map(square, numbers)))
```

**Walkthrough — new syntax.** `partial(multiply, 2)` creates a new
function that pre-fills the first argument of `multiply` as `2` — calling
`double(5)` is equivalent to `multiply(2, 5)`. `partial(power,
exponent=2)` pre-fills a **keyword argument** by name, leaving `base` to
be provided at call time — `square(4)` is `power(base=4, exponent=2)`.
`functools.partial` uses closures internally to capture the pre-filled
arguments, exactly like manually written closures.

```
10
15
16
27
[2, 4, 6, 8, 10]
[1, 4, 9, 16, 25]
```

**CS lens — currying vs partial application.** These two terms are often
conflated but are technically distinct. **Currying** is a transformation:
turning `f(a, b)` into `f(a)(b)` — each argument gets its own function
call. The fully curried form of a three-argument function is a chain of
three single-argument functions. **Partial application** pre-fills one or
more arguments but doesn't require full currying — `partial(multiply, 2)`
produces a one-argument function even though `multiply` was a two-argument
function. In practice, many languages (Haskell, F#) curry all functions
automatically; Python and JavaScript/TypeScript use partial application
more commonly and require manual currying.

**SE lens.** Partial application is especially useful for adapting
functions to interfaces they don't quite fit. `add_five` fits the
signature `(number) -> number` that `map` expects; the original `add(a,
b)` doesn't. `square` fits `(number) -> number`; `power(base, exponent)`
doesn't. Partial application creates the adapter without writing a
dedicated wrapper function for each case. This is the same adapter problem
the Adapter pattern (Glossary 01) solves at the class level — partial
application solves it at the function level.

### TypeScript

```typescript
function curriedAdd(a: number): (b: number) => number {
  return (b: number) => a + b;
}

console.log(curriedAdd(2)(3));

const addFive = curriedAdd(5);
const addTen  = curriedAdd(10);

console.log(addFive(3));
console.log(addTen(3));
console.log(JSON.stringify([1, 2, 3, 4, 5].map(addFive)));

function partial<A, B, R>(
  fn: (a: A, b: B) => R,
  firstArg: A
): (b: B) => R {
  return (b: B) => fn(firstArg, b);
}

function multiply(a: number, b: number): number { return a * b; }

const double = partial(multiply, 2);
const triple = partial(multiply, 3);

console.log(double(5));
console.log(triple(5));
console.log(JSON.stringify([1, 2, 3, 4, 5].map(double)));
```

**Walkthrough — new syntax.** `function partial<A, B, R>(fn: (a: A, b: B)
=> R, firstArg: A): (b: B) => R` — three generic type parameters: `A` is
the type of the first argument, `B` is the type of the second, `R` is the
return type. The compiler uses these to verify: `fn` must be a two-argument
function, `firstArg` must match `fn`'s first parameter type, and the
returned function accepts `fn`'s second parameter type and returns `R`. This
generic `partial` function is fully type-safe — the compiler catches any
type mismatch at the call site. `functools.partial` in Python does the
same thing at runtime without the compile-time guarantee.

```
5
8
13
[6,7,8,9,10]
10
15
[2,4,6,8,10]
```

---

## Connect the pieces

**Pure functions** and **side effects** are the foundational distinction:
pure functions are predictable, testable, cacheable, and safe to compose
or parallelize; side effects are necessary but best isolated at the edges
of a system rather than mixed throughout business logic.

**Composition** applies pure functions: since each pure function has no
hidden dependencies and no side effects, composed functions are as
predictable and testable as their components. `double_then_add` is as
pure as `double` and `add_ten` individually — compose pure functions,
get a pure function.

**Currying and partial application** use closures (from Glossary 19) to
create specialized functions from general ones, adapting functions to the
interfaces they're needed at — exactly like the Adapter pattern (Glossary
01) does at the object level.

Together with Glossary 19's Lambda, Closure, and Higher-Order Function,
these four concepts form the complete functional programming vocabulary
from the glossary source this series is based on. Functional programming
isn't a completely separate paradigm from object-oriented programming —
modern Python and TypeScript code routinely uses both, applying each where
it fits best: objects for stateful entities with behavior (Entities from
Glossary 05), pure functions for data transformation and business logic.

## What breaks without understanding this

The most common practical failure: writing impure functions where pure
ones would work — functions that modify arguments passed in, depend on
global state, or produce output as a side effect of computation. This
makes testing harder (cleanup required), makes debugging harder (the
result depends on history), and prevents caching (the same inputs might
give different results next time). Recognizing when a function *could*
be pure — and making it so — is one of the most consistent improvements
you can make to code quality.

## Definition of done

- [ ] You can explain the two properties of a pure function in your own
      words, and give one example of a side effect from real code.
- [ ] You can explain why pure functions are easier to test than impure
      ones — specifically what setup and cleanup a test for `impure_add`
      would need that a test for `pure_add` wouldn't.
- [ ] You can trace `compose(add_ten, double, square)(3)` step by step
      and get the correct answer.
- [ ] You can explain the difference between currying and partial
      application using the examples in this post.
- [ ] You've run all four examples in Python and TypeScript and confirmed
      matching output.
- [ ] You can explain why `[...functions].reverse()` is used in TypeScript
      instead of `functions.reverse()`, and what would happen differently
      if the spread were omitted.
