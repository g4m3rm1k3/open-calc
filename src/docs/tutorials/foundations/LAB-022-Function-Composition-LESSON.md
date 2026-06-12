# FOUNDATIONS — LAB-022 — Function Composition

**Series:** FOUNDATIONS — Part IV: Functional Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 50–65 minutes.

---

## What You Will Build

A `pipe` function that chains any sequence of single-argument functions into a single function — and use it to build a text-processing pipeline, a number-transformation chain, and a data normalization flow. You will implement both `pipe` (left-to-right) and `compose` (right-to-left), verify they are inverses, and see why single-argument functions are the fundamental unit of composition. After this lab, you will be able to build complex transformations from simple reusable pieces with no glue code.

---

## What You Need to Know First

**From LAB-021 (map/filter/reduce):** You built pipelines by chaining array methods. This lab generalizes that concept to any sequence of functions — not just array methods.

**From LAB-019 (Pure Functions):** Function composition only works correctly with pure functions. A composed function is as predictable as its least predictable component.

**From LAB-007 (Closures):** `pipe` returns a function that closes over the array of functions to apply. The returned function is a closure.

---

> **Quick Check — try to answer before reading:**
>
> 1. `f(g(x))` — if `g` squares and `f` doubles, what does applying this to `3` produce? What if the order is reversed: `g(f(3))`?
> 2. Why do all functions in a composition need to have exactly one input? What would go wrong if a function in the middle needed two arguments?
> 3. `pipe(trim, uppercase, addExclamation)("  hello  ")` — in what order do the functions apply?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Manual Composition vs `pipe`

**The problem this step solves:** Show the mechanical problem that `pipe` solves: nesting function calls produces deep, right-to-left code.

**The code:**

```js
// Three simple transformations:
const trim      = str => str.trim();
const uppercase = str => str.toUpperCase();
const addBang   = str => str + "!";

// Manual composition — right-to-left, deeply nested:
const manualResult = addBang(uppercase(trim("  hello world  ")));
console.log(manualResult);   // → "HELLO WORLD!"

// Intermediate variables — explicit but verbose:
const trimmed   = trim("  hello world  ");
const upcased   = uppercase(trimmed);
const withBang  = addBang(upcased);
console.log(withBang);   // → "HELLO WORLD!"
```

**The walkthrough:**

`addBang(uppercase(trim("  hello world  ")))`:

1. `trim("  hello world  ")` returns `"hello world"`.
2. `uppercase("hello world")` returns `"HELLO WORLD"`.
3. `addBang("HELLO WORLD")` returns `"HELLO WORLD!"`.

The nesting reads inside-out — `trim` is innermost but applied first. With 5 or 6 functions, the nested version is unreadable. Intermediate variables fix readability but require inventing names for intermediate results.

**CS lens — function composition as mathematics:**

In mathematics, `(f ∘ g)(x) = f(g(x))` — the composition of `f` and `g` is the function that applies `g` first, then `f`. Computer science function composition works identically. The output of `g` must be a valid input to `f` — the types must match. In JavaScript with dynamic typing, this type constraint is not checked at compile time; in TypeScript, it is.

**SE lens — the two problems:**

Nested calls (right-to-left readability): `f(g(h(x)))` applies `h` first but reads `f` first. This mismatch between reading order and execution order is a consistent source of confusion. Intermediate variables (invented names): `const trimmedInput = trim(input)` — `trimmedInput` is a name for an intermediate state that has no domain significance. It exists only to break up the nesting. `pipe` eliminates both problems.

**What breaks when functions are not composable:**

Functions that take more than one argument cannot be in the middle of a pipeline — the output of the previous step is one value, but the next function expects two. Functions that return nothing (procedures) cannot be in a pipeline — there is nothing to pass to the next step. Composition requires single-argument, single-return-value functions throughout.

---

### SAVE AND TRY

```js
const trim      = str => str.trim();
const uppercase = str => str.toUpperCase();
const addBang   = str => str + "!";

// Manual version — deeply nested for 3 functions:
const result = addBang(uppercase(trim("  hello  ")));
console.log(result);   // → "HELLO!"

// Intermediate variables version:
const step1 = trim("  hello  ");
const step2 = uppercase(step1);
const step3 = addBang(step2);
console.log(step3);    // → "HELLO!"
```

Expected: both produce `"HELLO!"`.

**Change something:** Add a fourth transformation: `const repeat = str => str + str`. Try composing manually: `repeat(addBang(uppercase(trim("  hi  "))))`. Expected: `"HI!HI!"`. Count the layers of nesting. This is why `pipe` exists.

---

### Step 2 — Implementing `pipe`

**The problem this step solves:** Write a function that chains any sequence of functions left-to-right.

**The code:**

```js
function pipe(...functions) {
  return function(initialValue) {
    return functions.reduce(
      (currentValue, currentFunction) => currentFunction(currentValue),
      initialValue
    );
  };
}
```

**The walkthrough — `pipe(f, g, h)(x)`:**

1. `pipe(f, g, h)` is called. `functions = [f, g, h]` (rest parameters — the `...` syntax collects all arguments into an array). Returns a new function that closes over `functions`.
2. The returned function is called with `x`.
3. `functions.reduce(...)` runs:
   - Step 1: `acc = x`, applies `f(x)`, result becomes new `acc`
   - Step 2: `acc = f(x)`, applies `g(f(x))`, result becomes new `acc`
   - Step 3: `acc = g(f(x))`, applies `h(g(f(x)))`, returns result
4. Returns `h(g(f(x)))`.

`...functions` — **rest parameters**. The `...` prefix in a function parameter list collects all remaining arguments into an array. `pipe(trim, uppercase, addBang)` passes three functions; `functions = [trim, uppercase, addBang]`.

**The implementation uses `reduce`:** This is the pattern you learned in LAB-021. The accumulator starts as the initial value. Each function is applied to the current accumulator, and the result becomes the next accumulator. `pipe` IS a `reduce` over the function array.

**Using `pipe`:**

```js
const processText = pipe(
  str => str.trim(),
  str => str.toUpperCase(),
  str => str + "!",
);

console.log(processText("  hello world  "));   // → "HELLO WORLD!"
console.log(processText("  goodbye  "));        // → "GOODBYE!"

// processText is a reusable function:
const words = ["  apple  ", "  BANANA  ", "  cherry  "];
const processed = words.map(processText);
console.log(processed);  // → ["APPLE!", "BANANA!", "CHERRY!"]
```

`processText` is a new function — not a value, but a function object that can be called, passed as a callback to `map`, stored in a variable. This is a function created by composing other functions.

**CS lens — `pipe` as function factory:**

`pipe(f, g, h)` produces a new function that is the composition of `f`, `g`, and `h`. It is a factory for composed functions. The returned function is a first-class value — it can be named, passed to `map`, stored in an object, or composed with `pipe` again. Composition is associative: `pipe(pipe(f, g), h)` = `pipe(f, pipe(g, h))` = `pipe(f, g, h)`.

**SE lens — small, single-purpose functions:**

`pipe` encourages writing small functions with one responsibility: `trim`, `uppercase`, `addBang`. Each is trivially testable. Complex behavior is assembled from simple, named pieces. The pipeline name (`processText`) describes the combined behavior; the individual functions describe each step. This is the single responsibility principle at the function level.

**What breaks if a step returns the wrong type:**

`pipe(parseInt, double, formatPrice)("  9.99  ")` — `parseInt("  9.99  ")` returns `9` (parses only the integer part). `double(9)` returns `18`. `formatPrice(18)` returns `"$18.00"`. The pipeline produces a wrong result because `parseInt` discards the decimal. The type flowing through the pipeline must match what each step expects. With TypeScript: `pipe` can be typed so that the return type of step N must match the parameter type of step N+1.

---

### SAVE AND TRY

```js
function pipe(...fns) {
  return value => fns.reduce((acc, fn) => fn(acc), value);
}

const formatPrice = pipe(
  n => Math.round(n * 100) / 100,   // round to 2 decimal places
  n => n.toFixed(2),                // format as string with 2 decimal places
  s => `$${s}`,                     // prepend dollar sign
);

console.log(formatPrice(9.999));   // → "$10.00"
console.log(formatPrice(0.1 + 0.2));  // → "$0.30"  (floating point rounded correctly)
console.log([9.5, 24.99, 1.2345].map(formatPrice));  // → ["$9.50", "$24.99", "$1.23"]
```

Expected: formatted prices.

**Change something:** Create a `parseAndFormat` pipeline: `pipe(parseFloat, formatPrice)`. Call `parseAndFormat("  9.99  ")`. Expected: `"$9.99"`. `parseFloat` handles leading/trailing whitespace automatically. The pipe composes parsing and formatting into one reusable function.

---

### Step 3 — `compose`: Right-to-Left Composition

**The problem this step solves:** Implement the mathematical convention where composition applies right-to-left — identical to `pipe` but with reversed function order.

**The code:**

```js
// compose: applies functions right-to-left (mathematical convention)
function compose(...fns) {
  return value => [...fns].reverse().reduce((acc, fn) => fn(acc), value);
}

// Or equivalently:
function composeAlternative(...fns) {
  return pipe(...fns.slice().reverse());
}

// They are the same:
const trim      = str => str.trim();
const uppercase = str => str.toUpperCase();
const addBang   = str => str + "!";

// pipe:    trim → uppercase → addBang  (left to right)
const withPipe    = pipe(trim, uppercase, addBang)("  hello  ");

// compose: addBang ← uppercase ← trim  (right to left: last in list = first applied)
const withCompose = compose(addBang, uppercase, trim)("  hello  ");

console.log(withPipe === withCompose);   // → true  (same result, opposite order)
```

**`[...fns].reverse()`** — creates a copy of the `fns` array (`[...fns]` via spread) and reverses it. We copy before reversing because `Array.prototype.reverse()` mutates in place — without the copy, we would mutate the arguments array, which is bad practice.

**`fns.slice()`** — another way to copy an array. `slice()` with no arguments returns a shallow copy of the entire array. This is equivalent to `[...fns]`.

**CS lens — when to use each:**

`pipe` reads in execution order — `pipe(f, g, h)` means "apply f, then g, then h." This matches natural language and is more common in JavaScript codebases. `compose` reads in mathematical notation order — `compose(f, g, h)(x)` means `f(g(h(x)))` — "the composition of f after g after h." Functional programming libraries (Ramda, lodash/fp) provide both. Use whichever matches your team's convention — they are equivalent.

**SE lens — choose consistency:**

A codebase that mixes `pipe` and `compose` without clear convention creates confusion. Pick one and use it consistently. The choice does not affect correctness — only readability. Most modern JavaScript codebases prefer `pipe` because it matches the left-to-right reading direction of English text.

**What breaks when functions are confused:**

`compose(trim, uppercase, addBang)("  hello  ")` — `addBang` is the last in the list but applied FIRST (compose is right-to-left). Result: `addBang("  hello  ")` = `"  hello  !"`, then `uppercase("  hello  !")` = `"  HELLO  !"`, then `trim("  HELLO  !")` = `"HELLO  !"` (trim only removes leading/trailing whitespace). Wrong result. Using `pipe` when you mean `compose` (or vice versa) silently produces wrong output — one of the most insidious composition bugs.

---

### SAVE AND TRY

```js
function pipe(...fns)    { return v => fns.reduce((a, f) => f(a), v); }
function compose(...fns) { return v => [...fns].reverse().reduce((a, f) => f(a), v); }

// Verify they are inverses:
const double  = x => x * 2;
const addOne  = x => x + 1;
const square  = x => x * x;

const pipeResult    = pipe(double, addOne, square)(3);   // (3×2=6, 6+1=7, 7²=49)
const composeResult = compose(square, addOne, double)(3); // same functions, same order of application

console.log(pipeResult === composeResult);  // → true (49 === 49)
```

Expected: `true`. Both apply `double` first, `addOne` second, `square` third — despite the list order being reversed.

**Change something:** Try `pipe(square, addOne, double)(3)` (different function order). Expected: `3²=9, 9+1=10, 10×2=20`. Confirm that `compose(double, addOne, square)(3)` produces the same `20`. The function order in the list is reversed, but execution order is identical.

---

### Step 4 — Point-Free Style

**The problem this step solves:** Show how composition enables functions that describe transformations without mentioning the data they operate on.

**The code:**

```js
// Point-free: functions that describe transformations, not data
const double    = x => x * 2;
const isEven    = x => x % 2 === 0;
const toString  = x => x.toString();
const addLabel  = s => `Value: ${s}`;

// Named composed functions — no mention of the input value:
const labelEvenNumber  = pipe(double, toString, addLabel);
const processNumbers   = numbers => numbers.filter(isEven).map(labelEvenNumber);

console.log(processNumbers([1, 2, 3, 4, 5, 6]));
// → ["Value: 4", "Value: 8", "Value: 12"]
```

**"Point-free"** means writing functions that do not explicitly reference their arguments (the "points"). `const labelEvenNumber = pipe(double, toString, addLabel)` — the function is defined entirely in terms of other functions, with no explicit `x =>` parameter.

The opposite (point-full): `const labelEvenNumber = x => addLabel(toString(double(x)))` — the `x` is mentioned explicitly. Both versions are correct; point-free is more concise but can be harder to read for complex pipelines.

**CS lens — tacit programming:**

Point-free style is also called **tacit programming** — programming where function definitions do not mention the arguments. It is more common in Haskell and other pure functional languages. In JavaScript, it is a style choice. Small compositions read better point-free; large ones benefit from explicit parameter names.

**SE lens — composition as documentation:**

`const processNumbers = numbers => numbers.filter(isEven).map(labelEvenNumber)` — the function describes its behavior through its composition. `filter(isEven)` communicates "keep even numbers." `map(labelEvenNumber)` communicates "transform each remaining one." The names do the documentation.

**What breaks if components are not independently testable:**

```js
const badPipeline = pipe(
  n => n * 2 + Math.random() * 10,  // impure: result is random
  n => n.toFixed(0),
  s => `Value: ${s}`
);
```

`badPipeline(5)` produces a different result each call. Cannot be tested. Cannot be debugged — the output changes between runs. The pipeline is only as reliable as its least pure component.

---

### SAVE AND TRY

```js
function pipe(...fns) { return v => fns.reduce((a, f) => f(a), v); }

// Build a data normalization pipeline:
const normalizeUser = pipe(
  user => ({ ...user, name: user.name.trim() }),             // trim name whitespace
  user => ({ ...user, email: user.email.toLowerCase() }),    // normalize email case
  user => ({ ...user, age: Math.max(0, Math.min(150, user.age)) }),  // clamp age
);

const rawUser = { name: "  Alice Smith  ", email: "Alice@EXAMPLE.COM", age: -5 };
const normalized = normalizeUser(rawUser);
console.log(normalized);
// → { name: "Alice Smith", email: "alice@example.com", age: 0 }

console.log(rawUser);   // → unchanged (each step creates a new object)
```

Expected: trimmed name, lowercase email, age clamped to 0.

**Change something:** Add a fourth step that generates an `id` field: `user => ({ ...user, id: user.email.replace("@", "-at-") })`. Expected: `id` field derived from email. Note this step is pure: same email always produces same id.

---

## Connect the Pieces

**What you built:** `pipe` and `compose` implementations, text and number transformation pipelines, a data normalization pipeline, and point-free style functions.

**How it connects to LAB-021 (map/filter/reduce):** `pipe` is `reduce` applied to a function array. The pattern `.map(f).filter(g).reduce(h)` is a pipe of array operations. `pipe(trim, uppercase, addBang)` is a pipe of single-value operations. Both are the same concept at different levels of abstraction.

**How it connects to LAB-019 (Pure Functions):** Each step in a `pipe` must be pure for the composed function to be pure. If any step has a side effect, the composed function inherits that side effect. Composition amplifies purity when all parts are pure.

**How it connects forward:**

- **LAB-023 (Currying):** Curried functions fit perfectly into pipes because they produce single-argument functions: `pipe(filter(isEven), map(double), reduce(sum, 0))` — each is a partially-applied function that takes one array. Currying and composition are designed to work together.
- **LAB-042 (Python Generators):** Python's generator pipeline (`gen | filter_fn | map_fn`) is the same concept as JavaScript's `pipe` applied to lazy sequences.

**The real-world connection:**

Redux middleware is a composition chain. Express middleware is a pipe. Unix command pipelines (`cat file | grep pattern | sort | uniq`) are the original pipes. Every data transformation framework (Pandas in Python, LINQ in C#, Java Streams) exposes a pipe/chain API. This concept is one of the most universal in all of programming.

---

## What Breaks Without This

**Concrete failure — long chain with manual nesting:**

```js
// Five transformations, manually nested:
const result = formatOutput(
  applyDiscount(
    calculateTax(
      parseAmount(
        sanitizeInput("  $9.99  ")
      )
    )
  )
);
```

Reading order: `formatOutput`, `applyDiscount`, `calculateTax`, `parseAmount`, `sanitizeInput`. Execution order: `sanitizeInput`, `parseAmount`, `calculateTax`, `applyDiscount`, `formatOutput`. Completely backwards. Adding a sixth step requires finding the innermost nesting and inserting there. With `pipe`:

```js
const processPrice = pipe(sanitizeInput, parseAmount, calculateTax, applyDiscount, formatOutput);
const result = processPrice("  $9.99  ");
```

Add a step: append to the `pipe` call. Reading order matches execution order. No nesting.

---

## Definition of Done

Verify each item before moving to LAB-023.

- [ ] `pipe(f, g, h)(x)` applies `f`, then `g`, then `h` in left-to-right order
- [ ] `compose(f, g, h)(x)` applies `h`, then `g`, then `f` — opposite of pipe
- [ ] `pipe(double, addOne, square)(3)` === `compose(square, addOne, double)(3)` === `49`
- [ ] `normalizeUser` pipeline cleans name, email, and age without mutating the original object
- [ ] `processNumbers([1,2,3,4,5,6])` returns `["Value: 4", "Value: 8", "Value: 12"]`
- [ ] A 0-function `pipe()` returns the identity function: `pipe()(42) === 42`

**Git commit:**

```
git add .
git commit -m "LAB-022: pipe and compose implementations — function composition as reduce over a function array"
```

---

## Quick Check Answers

**1. `f(g(3))` where `g` squares and `f` doubles? What about `g(f(3))`?**

`f(g(3))`: `g(3) = 9`, `f(9) = 18`. `g(f(3))`: `f(3) = 6`, `g(6) = 36`. Composition is not commutative — the order matters. `pipe(g, f)` and `pipe(f, g)` produce different functions.

**2. Why must all functions in a composition have exactly one input?**

The output of step N becomes the sole input to step N+1. If step N+1 requires two inputs, there is only one value available (from step N) — the second has no source. Single-argument functions are the fundamental unit of composition because they have a single, well-defined "socket" for the preceding step's output. Multi-argument functions require currying (partial application) to reduce to single-argument form before they can be composed.

**3. In `pipe(trim, uppercase, addExclamation)("  hello  ")`, what order do they apply?**

Left-to-right: `trim` first, then `uppercase`, then `addExclamation`. This is why it is called `pipe` — the data flows left-to-right through the functions, like water through a pipe. `trim("  hello  ") = "hello"`, `uppercase("hello") = "HELLO"`, `addExclamation("HELLO") = "HELLO!"`.

---

*Next: LAB-023 — Currying and Partial Application*
