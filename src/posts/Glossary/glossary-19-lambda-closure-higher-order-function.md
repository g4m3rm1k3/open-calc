# Functional Programming I: Lambda, Closure, Higher-Order Function

## What you will build

Three runnable programs — one per concept — in both Python and TypeScript,
showing what it means to treat functions as values you can store, pass,
and return. By the end you'll understand why functions-as-values is one
of the most powerful ideas in programming, how closures capture their
surrounding environment, and how higher-order functions express patterns
that would otherwise require writing the same structure over and over.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. This post stands fully alone. Lambdas and callbacks were briefly
mentioned in earlier posts in this series (Glossary 03's Callback section,
Glossary 10's Pipeline); this post covers them properly from first
principles.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

---

## The foundational idea: functions are values

Everything that follows in this post rests on one idea: **in Python and
JavaScript/TypeScript, functions are values** — they can be assigned to
variables, stored in lists or dictionaries, passed as arguments to other
functions, and returned from functions.

```python
def add(a, b):
    return a + b

operation = add
print(operation(3, 4))
print(type(operation))
```

```
7
<class 'function'>
```

**Walkthrough:** `operation = add` assigns the function *itself* (not its
result) to `operation`. Note the absence of parentheses — `add` refers to
the function object; `add(3, 4)` calls it. `operation` and `add` now both
point to the same function object in memory. Calling `operation(3, 4)`
is identical to calling `add(3, 4)`.

---

## Concept 1: Lambda

A **lambda** is an anonymous function — a function with no name, defined
inline at the point where it's needed. Lambdas are useful for short,
single-use functions that don't need a full `def`/`function` definition.

### Python

```python
square = lambda x: x * x
print(square(5))

numbers = [3, 1, 4, 1, 5, 9, 2, 6]
sorted_numbers = sorted(numbers)
print(sorted_numbers)

people = [
    {"name": "Carol", "age": 35},
    {"name": "Alice", "age": 30},
    {"name": "Bob",   "age": 25},
]

by_age  = sorted(people, key=lambda person: person["age"])
by_name = sorted(people, key=lambda person: person["name"])

print("\nBy age:")
for person in by_age:
    print(f"  {person['name']}: {person['age']}")

print("\nBy name:")
for person in by_name:
    print(f"  {person['name']}: {person['age']}")
```

**Walkthrough — new syntax.** `lambda x: x * x` — `lambda` is the keyword
for an anonymous function. The syntax is: `lambda parameters: expression`.
The expression's value is returned automatically — no `return` keyword.
Python's `lambda` is intentionally limited to a single expression: no
statements, no multiple lines, no `if`/`elif` blocks (though a ternary
expression `value_if_true if condition else value_if_false` is allowed).
This limitation keeps lambdas small and encourages using `def` for
anything complex.

`sorted(numbers)` uses Python's built-in sort — returns a new sorted list,
leaving the original unchanged. `sorted(people, key=lambda person:
person["age"])` sorts using a **key function**: a function called on each
item that returns the value to sort by. The lambda here extracts the age
from each person dictionary. `key=` accepts any callable — a lambda, a
named function, or any object with `__call__`. This is functions-as-values
in direct use: `sorted` takes a function argument and calls it on each item.

```
25
[1, 1, 2, 3, 4, 5, 6, 9]

By age:
  Bob: 25
  Alice: 30
  Carol: 35

By name:
  Alice: 30
  Bob: 25
  Carol: 35
```

**CS lens.** Lambdas exist in almost every modern language: Python's
`lambda`, JavaScript's `() =>` arrow functions, Java's `(x) -> x * x`,
Haskell's `\x -> x * x`. The concept predates most programming languages —
it comes from the **lambda calculus**, a formal mathematical system for
expressing computation developed by Alonzo Church in the 1930s. The lambda
calculus is, in a precise mathematical sense, the foundation of all
functional programming.

**SE lens.** Lambdas reduce noise for short, obvious transformations. When
the intent is clear from the expression itself (`lambda x: x * x`), a full
named function adds clutter without adding clarity. When the logic is
non-trivial or reused in multiple places, a named function is better — not
because lambdas can't be complex, but because a name communicates intent.

### TypeScript

```typescript
const square = (x: number): number => x * x;
console.log(square(5));

const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
const sortedNumbers = [...numbers].sort((a, b) => a - b);
console.log(sortedNumbers);

const people = [
  { name: "Carol", age: 35 },
  { name: "Alice", age: 30 },
  { name: "Bob",   age: 25 },
];

const byAge  = [...people].sort((a, b) => a.age - b.age);
const byName = [...people].sort((a, b) => a.name.localeCompare(b.name));

console.log("\nBy age:");
byAge.forEach((p)  => console.log(`  ${p.name}: ${p.age}`));
console.log("\nBy name:");
byName.forEach((p) => console.log(`  ${p.name}: ${p.age}`));
```

**Walkthrough — new syntax.** `(x: number): number => x * x` is an arrow
function with explicit types — the TypeScript equivalent of Python's
`lambda x: x * x`. Arrow functions are TypeScript/JavaScript's primary
lambda syntax. Unlike Python's `lambda`, arrow functions can span multiple
lines and contain any statements — the limitation in Python doesn't exist
in TypeScript. `[...numbers].sort(...)` — `.sort()` mutates the original
array in place, so spreading into a new array first (`[...numbers]`)
preserves the original, matching Python's `sorted()` behavior of returning
a new list. `.sort((a, b) => a - b)` — JavaScript's `.sort()` requires
a comparator function for numbers (covered in Glossary 07's Strategy
section). `a.name.localeCompare(b.name)` is JavaScript's built-in method
for locale-aware string comparison — returns negative, zero, or positive,
exactly what `.sort()`'s comparator expects.

```
25
[
  1, 1, 2, 3,
  4, 5, 6, 9
]

By age:
  Bob: 25
  Alice: 30
  Carol: 35

By name:
  Alice: 30
  Bob: 25
  Carol: 35
```

---

## Concept 2: Closure

A **closure** is a function that remembers the variables from the scope
in which it was created, even after that scope has finished executing.
The function "closes over" its environment — capturing the variables it
references from the surrounding context.

### Python

```python
def make_multiplier(factor):
    def multiply(number):
        return number * factor
    return multiply


double = make_multiplier(2)
triple = make_multiplier(3)

print(double(5))
print(triple(5))
print(double(triple(4)))
```

```
10
15
24
```

**Walkthrough:** `make_multiplier(2)` creates and returns `multiply` —
the inner function. After `make_multiplier` returns, its stack frame is
gone. But `double` (which holds the returned `multiply` function) still
works, because it **closed over** `factor` — the variable `factor` from
`make_multiplier`'s scope was captured by `multiply` and lives on inside
the closure, even though the surrounding function has exited.

`double` and `triple` are two separate closures, each capturing a
different `factor` value. They're independent — calling `double` doesn't
affect `triple`. `double(triple(4))` composes them: `triple(4)` = 12,
then `double(12)` = 24.

**CS lens — closures and the scope chain.** When Python executes `return
number * factor` inside `multiply`, it looks up `factor` in a chain of
scopes: first the local scope (not there), then the enclosing scope
(`make_multiplier`'s scope, where `factor` lives), then the module scope,
then the built-in scope. This chain is called the **LEGB rule** (Local,
Enclosing, Global, Built-in). The closure captures the *enclosing* scope.
In the variables post from this series, we named this the symbol table —
a closure keeps a reference to the enclosing function's symbol table alive
after that function has returned, which is what lets `factor` persist.

**What closures enable:** Closures let you create **function factories** —
functions that produce specialized functions. Instead of one general
`multiply(number, factor)` function that always requires both arguments,
you create `double` and `triple` as specializations that remember their
factor. This is the foundational mechanism behind:

- **Decorators** (Glossary 01): a function that wraps another, using
  closures to remember the original
- **Callbacks with context**: a callback that remembers which component
  it belongs to
- **Partial application** (Glossary 20): pre-filling some arguments of
  a function to create a more specific one
- **Memoization**: a function wrapped to remember its previous results

```python
def make_counter(start=0):
    count = [start]

    def increment():
        count[0] += 1
        return count[0]

    def reset():
        count[0] = start
        return count[0]

    return increment, reset


counter_inc, counter_reset = make_counter(0)

print(counter_inc())
print(counter_inc())
print(counter_inc())
print(counter_reset())
print(counter_inc())
```

```
1
2
3
0
1
```

**Walkthrough — new syntax.** `count = [count]` wraps the counter in a
list — this is a Python-specific workaround. Inside `increment`, writing
`count += 1` would create a new *local* variable named `count`, shadowing
the enclosing one. Wrapping in a list (`count[0] += 1`) mutates the list
in place, which works correctly because reading a list and mutating it
don't trigger the local-variable-creation behavior. In Python 3, you can
also use `nonlocal count` to declare that `count` refers to the enclosing
scope's variable — a more explicit solution. `return increment, reset` — a
function can return multiple values as a tuple; `counter_inc, counter_reset
= make_counter(0)` unpacks that tuple. Both `increment` and `reset` close
over the same `count` list, so `reset` actually affects the same counter
that `increment` changes.

**SE lens.** Closures are how JavaScript event handlers remember which
element they're attached to, how React hooks remember state between renders,
and how database connection pools remember their connection strings. Any
time you need "a function with some pre-configured context baked in," a
closure is the mechanism.

### TypeScript

```typescript
function makeMultiplier(factor: number): (n: number) => number {
  return (n: number) => n * factor;
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);

console.log(double(5));
console.log(triple(5));
console.log(double(triple(4)));
```

**Walkthrough — new syntax.** `(n: number) => number` as the return type
annotation means "a function taking a number and returning a number." This
is a function type annotation — the same type alias form from TypeScript
Prereq 02 (`type Multiplier = (n: number) => number`), written inline
here instead of aliased. The arrow function `(n: number) => n * factor`
closes over `factor` from the enclosing `makeMultiplier` scope, exactly
as Python's `multiply` closed over `factor`.

```
10
15
24
```

```typescript
function makeCounter(start: number = 0): [() => number, () => number] {
  let count = start;

  const increment = (): number => {
    count += 1;
    return count;
  };

  const reset = (): number => {
    count = start;
    return count;
  };

  return [increment, reset];
}

const [counterInc, counterReset] = makeCounter(0);

console.log(counterInc());
console.log(counterInc());
console.log(counterInc());
console.log(counterReset());
console.log(counterInc());
```

**Walkthrough — new syntax.** `[() => number, () => number]` as the return
type declares a tuple of two functions, both returning numbers. `let count
= start` inside the function — TypeScript's closures over `let` variables
work cleanly, with no list-wrapping workaround needed. Both `increment`
and `reset` close over the same `count` variable. `const [counterInc,
counterReset] = makeCounter(0)` uses array destructuring (from the
Glossary 08 Policy section) to unpack the returned pair.

```
1
2
3
0
1
```

---

## Concept 3: Higher-Order Function

A **higher-order function** is a function that either accepts other
functions as arguments, returns a function, or both. `sorted(key=...)`,
`asyncio.gather(...)`, and every callback-based API you've seen in this
series are higher-order functions. `map`, `filter`, and `reduce` are the
canonical examples.

### Python

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

squares   = list(map(lambda x: x * x, numbers))
evens     = list(filter(lambda x: x % 2 == 0, numbers))

from functools import reduce
total     = reduce(lambda acc, x: acc + x, numbers, 0)
factorial = reduce(lambda acc, x: acc * x, range(1, 6), 1)

print(f"Original: {numbers}")
print(f"Squares:  {squares}")
print(f"Evens:    {evens}")
print(f"Sum:      {total}")
print(f"5!:       {factorial}")
```

**Walkthrough — new syntax.** `map(function, iterable)` is a built-in
higher-order function that applies `function` to each item in `iterable`
and returns a **map object** (a lazy iterator — it produces values on
demand rather than building the whole list at once). `list(map(...))` forces
it to produce all values as a list. `filter(function, iterable)` keeps
only items for which `function` returns truthy. `from functools import
reduce` — `reduce` was moved to the `functools` module in Python 3 (it
was a built-in in Python 2). `reduce(function, iterable, initial)` applies
`function` cumulatively: `function(function(function(initial, item1),
item2), item3)...` — the accumulator pattern from this series' loops post,
expressed as a single function call. `range(1, 6)` for factorial: 1×2×3×4×5.

```
Original: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Squares:  [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
Evens:    [2, 4, 6, 8, 10]
Sum:      55
5!:       120
```

**CS lens.** `map`, `filter`, and `reduce` are the three foundational
higher-order functions of functional programming. They express common
patterns that would otherwise require explicit loops:

- `map` replaces "loop over a collection, transform each item, collect
  results"
- `filter` replaces "loop over a collection, keep items matching a
  condition"
- `reduce` replaces "loop over a collection, accumulate a single result"

These three functions, combined with lambdas and closures, are sufficient
to express a very large class of data-processing operations without
explicit loops. This is not just a stylistic preference — expressing
computation as transformations on data rather than mutations of state
makes code easier to reason about, parallelize, and test.

**SE lens.** In Python, list comprehensions (`[x*x for x in numbers]`)
are generally preferred over `map`/`filter` for readability. But `map`,
`filter`, and `reduce` are worth knowing because they appear in other
languages (JavaScript's `.map()`, `.filter()`, `.reduce()` on arrays),
in data processing libraries (pandas, Spark), and in functional
programming patterns you'll encounter in real codebases. The conceptual
vocabulary ("I need to map this collection") is useful even when the
syntax differs.

```python
def apply_transformations(data, *transforms):
    result = data
    for transform in transforms:
        result = transform(result)
    return result


pipeline_result = apply_transformations(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    lambda nums: filter(lambda x: x % 2 == 0, nums),
    lambda nums: map(lambda x: x * x, nums),
    lambda nums: list(nums),
    lambda nums: sorted(nums, reverse=True),
)

print(f"Even squares descending: {pipeline_result}")
```

```
Even squares descending: [100, 64, 36, 16, 4]
```

**Walkthrough:** `apply_transformations` is itself a higher-order function:
it takes a list and any number of transform functions (`*transforms` uses
the variadic parameter syntax from this series' Communication post),
applying each in sequence — the Pipeline pattern from Glossary 10,
expressed with higher-order functions and lambdas.

### TypeScript

```typescript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const squares = numbers.map((x) => x * x);
const evens   = numbers.filter((x) => x % 2 === 0);
const total   = numbers.reduce((acc, x) => acc + x, 0);
const factorial = [1, 2, 3, 4, 5].reduce((acc, x) => acc * x, 1);

console.log(`Original: ${JSON.stringify(numbers)}`);
console.log(`Squares:  ${JSON.stringify(squares)}`);
console.log(`Evens:    ${JSON.stringify(evens)}`);
console.log(`Sum:      ${total}`);
console.log(`5!:       ${factorial}`);
```

**Walkthrough:** In TypeScript, `map`, `filter`, and `reduce` are methods
on arrays — `numbers.map(fn)` rather than `map(fn, numbers)`. This is the
same operation with different syntax: TypeScript follows the object-method
convention while Python uses standalone built-in functions. Both approaches
produce identical results.

```typescript
function applyTransformations<T>(
  data: T,
  ...transforms: Array<(input: T) => T>
): T {
  return transforms.reduce((result, transform) => transform(result), data);
}

const pipelineResult = applyTransformations(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  (nums: number[]) => nums.filter((x) => x % 2 === 0),
  (nums: number[]) => nums.map((x) => x * x),
  (nums: number[]) => nums.sort((a, b) => b - a),
);

console.log(`Even squares descending: ${JSON.stringify(pipelineResult)}`);
```

**Walkthrough — new syntax.** `function applyTransformations<T>(data: T,
...transforms: Array<(input: T) => T>): T` — a generic function where `T`
is the type of data flowing through the pipeline. `Array<(input: T) => T>`
is the type of the rest parameter: an array of functions that each take `T`
and return `T`. `transforms.reduce((result, transform) => transform(result),
data)` uses `.reduce()` to apply each transform in sequence — starting with
`data`, applying the first transform, using the result as input for the
second, and so on. This is `apply_transformations` expressed in one line
using higher-order functions applied to themselves — a function pipeline
built from `reduce`.

```
Original: [1,2,3,4,5,6,7,8,9,10]
Squares:  [1,4,9,16,25,36,49,64,81,100]
Evens:    [2,4,6,8,10]
Sum:      55
5!:       120
Even squares descending: [100,64,36,16,4]
```

---

## Connect the pieces

**Lambda**, **Closure**, and **Higher-Order Function** are three
perspectives on the same foundational idea: functions as first-class values.

A **lambda** is an anonymous function — a function with no name, useful
for short, single-use transformations at the point they're needed.

A **closure** is a function that captures its enclosing environment —
making it possible to create specialized functions (like `double` and
`triple`) with pre-configured context baked in, persisting beyond the
lifetime of the creating scope.

A **higher-order function** is a function that works with other functions
as values — either receiving them as arguments (`map`, `filter`, `sorted`)
or returning them (`make_multiplier`). Higher-order functions are what make
it possible to write general-purpose abstractions that work with any logic
the caller provides.

These three concepts are the foundation of the next post (Glossary 20:
Pure Function, Side Effect, Composition, Currying) — composition chains
functions together, currying uses closures to pre-fill arguments, and pure
functions are what make all of this predictable.

They also appear throughout everything else in this series: the Decorator
pattern (Glossary 01) uses closures to wrap functions; the Strategy pattern
(Glossary 07) uses higher-order functions to make algorithms swappable;
the Callback pattern (Glossary 03) passes functions as arguments; the
Pipeline pattern (Glossary 10) applies a sequence of functions to data.
All of those patterns rest on functions-as-values as their foundation.

## What breaks without understanding this

Developers who don't understand closures write bugs like creating loop
callbacks where every callback captures the same variable (the final loop
value) rather than the value at the time the callback was created — a
classic JavaScript/Python closure mistake. Developers who don't understand
higher-order functions reinvent the same patterns (`map`, `filter`,
`reduce`) with explicit loops every time, missing the abstraction. These
aren't obscure edge cases — they're the foundational vocabulary of
modern Python and TypeScript development.

## Definition of done

- [ ] You can write a lambda in Python and an equivalent arrow function in
      TypeScript, and explain the syntax of each.
- [ ] You can explain what a closure is — specifically what "captured
      variable" means and why the captured value persists after the
      enclosing function returns.
- [ ] You've built a function factory using closures (`make_multiplier` or
      similar) and created two specialized functions from it.
- [ ] You can explain what `map`, `filter`, and `reduce` each do, in your
      own words, without looking at the definitions.
- [ ] You've run all three examples in Python and TypeScript and confirmed
      matching output.
- [ ] You can explain why Python needs the list-wrapping workaround (`count
      = [start]`) in the mutable closure counter, while TypeScript doesn't.
