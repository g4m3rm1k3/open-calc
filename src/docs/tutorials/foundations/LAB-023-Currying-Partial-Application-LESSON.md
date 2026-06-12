# FOUNDATIONS — LAB-023 — Currying and Partial Application

**Series:** FOUNDATIONS — Part IV: Functional Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 55–70 minutes.

---

## What You Will Build

A set of curried utility functions — `multiply`, `add`, `filter`, `map` — that can be partially applied to produce specialized versions: `double`, `addTax`, `getEvens`, `squareAll`. You will then compose these specialized functions into pipelines using `pipe` from LAB-022. After this lab, you will understand how currying converts multi-argument functions into composable single-argument functions, and why partial application is the mechanism under every function factory you have ever written.

---

## What You Need to Know First

**From LAB-022 (Function Composition):** `pipe` requires single-argument functions at every step. Multi-argument functions cannot participate directly. Currying is the conversion that makes any multi-argument function composable.

**From LAB-007 (Closures):** A curried function returns a closure over its earlier arguments. `const double = multiply(2)` — the returned function closes over `factor = 2`. Every call to `double(x)` recalls that `factor`.

**From LAB-019 (Pure Functions):** Curried functions are pure functions that return pure functions. The inner function depends only on its closed-over arguments and its own parameter.

---

> **Quick Check — try to answer before reading:**
>
> 1. `add(3, 4)` is a two-argument call. How many calls does the curried version `curriedAdd(3)(4)` require? What does `curriedAdd(3)` return on its own?
> 2. What is the difference between currying and partial application?
> 3. You have a function `isGreaterThan(threshold, value)`. After currying, how would you create a specialized `isAbove100` function?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — What Currying Is

**The problem this step solves:** Establish the definition through the simplest possible example.

**The code:**

```js
// Normal two-argument function:
function add(a, b) {
  return a + b;
}

console.log(add(3, 4));   // → 7

// Curried version: one argument at a time
function curriedAdd(a) {
  return function(b) {
    return a + b;
  };
}

console.log(curriedAdd(3)(4));   // → 7  (same result, two calls)

const add3 = curriedAdd(3);      // partial application: fix a = 3
console.log(add3(4));            // → 7
console.log(add3(10));           // → 13
console.log(add3(100));          // → 103
```

**The walkthrough — `curriedAdd(3)`:**

1. `curriedAdd(3)` is called. Creates a stack frame with `a = 3`. Returns an inner function that closes over `a = 3`.
2. The returned function is assigned to `add3`. `curriedAdd`'s frame is gone; `a = 3` lives on the heap as part of the closure.
3. `add3(4)` calls the inner function with `b = 4`. Returns `a + b = 3 + 4 = 7`.
4. `add3(10)` calls the same function with `b = 10`. Returns `3 + 10 = 13`. The closure's `a` is still `3`.

**Currying** transforms a function of N arguments into a chain of N functions each taking one argument. `add(a, b)` becomes `curriedAdd(a)(b)`. Both compute the same thing; currying changes the calling convention.

**Partial application** is the act of calling a curried function with fewer than its full argument count, producing a specialized function. `curriedAdd(3)` is partial application — fixing the first argument to `3`, returning a function waiting for the second.

**CS lens — arity and currying:**

**Arity** is the number of arguments a function takes. `add(a, b)` has arity 2. `curriedAdd(a)(b)` is a function of arity 1 that returns a function of arity 1. Currying reduces arity to 1 at every level. Since `pipe` requires arity-1 functions, currying is the bridge between multi-argument functions and pipelines.

**SE lens — currying creates specialization without duplication:**

Without currying, creating `add3`, `add5`, `add100` requires three function definitions:

```js
const add3   = b => b + 3;
const add5   = b => b + 5;
const add100 = b => b + 100;
```

With currying, all three are derived from one general function:

```js
const add3   = curriedAdd(3);
const add5   = curriedAdd(5);
const add100 = curriedAdd(100);
```

No duplication. The general function is written once. Specialized versions are derived by partial application.

**What breaks if you try to put a two-argument function in a pipe:**

```js
function pipe(...fns) { return v => fns.reduce((a, f) => f(a), v); }
const add3Uncurried = (a, b) => a + b;

const processNumber = pipe(add3Uncurried, x => x * 2);
console.log(processNumber(5));  // → NaN
// add3Uncurried receives 5 as 'a', but 'b' is undefined. 5 + undefined = NaN.
```

The two-argument function cannot participate in the pipe — it only receives the piped value as its first argument. The second argument is `undefined`. Currying fixes this.

---

### SAVE AND TRY

```js
const curriedAdd = a => b => a + b;   // arrow function shorthand for curried functions

const add10  = curriedAdd(10);
const add100 = curriedAdd(100);

console.log(add10(5));    // → 15
console.log(add10(25));   // → 35
console.log(add100(5));   // → 105

// Used in map:
const numbers = [1, 2, 3, 4, 5];
console.log(numbers.map(add10));   // → [11, 12, 13, 14, 15]
console.log(numbers.map(add100));  // → [101, 102, 103, 104, 105]
```

`a => b => a + b` — arrow function shorthand for curried functions. `a =>` returns `b => a + b`. This is cleaner than `function curriedAdd(a) { return function(b) { return a + b; }; }`.

Expected: `15`, `35`, `105`, then both mapped arrays.

**Change something:** Use `add10` in a `pipe`:

```js
function pipe(...fns) { return v => fns.reduce((a, f) => f(a), v); }
const process = pipe(add10, add100, x => x * 2);
console.log(process(5));  // → (5+10=15, 15+100=115, 115×2=230)
```

Expected: `230`. `add10` is now composable because it is arity-1 (partially applied).

---

### Step 2 — Writing a `curry` Function

**The problem this step solves:** Write a general `curry` function that automatically curries any multi-argument function.

**The code:**

```js
function curry(fn) {
  const arity = fn.length;   // fn.length is the number of declared parameters

  return function curried(...args) {
    if (args.length >= arity) {
      return fn(...args);   // enough arguments — call the original function
    }
    return function(...moreArgs) {
      return curried(...args, ...moreArgs);   // accumulate arguments, try again
    };
  };
}
```

**`fn.length`** — a property on any JavaScript function that returns the number of parameters declared in the function definition. `function add(a, b) {}.length` is `2`. Arrow functions also have `.length`. Default parameters do not count: `function f(a, b = 0) {}.length` is `1`.

**The walkthrough — `curry(add)(3)(4)`:**

1. `curry(add)` — `arity = 2`. Returns `curried` function.
2. `curried(3)` — `args = [3]`. `args.length (1) < arity (2)`. Returns a new function.
3. The new function is called with `(4)`: `curried(3, 4)` — `args = [3, 4]`. `args.length (2) >= arity (2)`. Calls `add(3, 4)`. Returns `7`.

**The walkthrough — `curry(add)(3, 4)` (both args at once):**

`curried(3, 4)` — `args.length (2) >= arity (2)`. Calls `add(3, 4)` immediately. Returns `7`. A curried function can receive all arguments at once — it falls back to the original behavior.

**CS lens — automatic arity reduction:**

`curry` wraps any function and makes it accumulate arguments until the original arity is satisfied. This is called **automatic currying**. Languages like Haskell curry all functions automatically — every function of N arguments is automatically a function of 1 argument returning a function of N-1 arguments. JavaScript requires explicit `curry()` wrapping or manual curried syntax.

**SE lens — currying at library boundaries:**

Lodash (`_.curry`), Ramda, and other functional libraries provide `curry` and export all their functions in curried form. `_.map(array, fn)` and `_.map(fn)(array)` both work. This means Ramda's `map` can be partially applied to a function and used in a pipeline: `pipe(R.map(double), R.filter(isEven))`.

**What breaks with rest parameters:**

```js
function sum(...args) { return args.reduce((a, b) => a + b, 0); }
console.log(sum.length);  // → 0  (rest parameters not counted)
curry(sum);  // → arity = 0, immediately calls sum() with no args → 0
```

`curry` cannot handle variadic functions (those using `...rest`). It only works on functions with a fixed, declared arity. For variadic functions, manual currying is required.

---

### SAVE AND TRY

```js
function curry(fn) {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
}

const multiply = curry((a, b) => a * b);
const divide   = curry((a, b) => a / b);
const power    = curry((base, exp) => base ** exp);

const double    = multiply(2);
const triple    = multiply(3);
const halve     = divide(_, 2);    // this won't work — we need divide differently
const square    = power(_, 2);     // placeholder approach doesn't work here

// Correct approach for divide (b is the divisor):
const divideBy  = curry((divisor, value) => value / divisor);
const halve2    = divideBy(2);

console.log(double(5));     // → 10
console.log(triple(5));     // → 15
console.log(halve2(10));    // → 5
console.log([1,2,3,4].map(double));   // → [2, 4, 6, 8]
```

Note: `divide(_, 2)` is shown as a placeholder approach that does NOT work — the argument order matters. To partially apply the second argument, you must reverse the argument order: `divideBy` takes the divisor first.

Expected: `10`, `15`, `5`, `[2, 4, 6, 8]`.

**Change something:** Create a `percent = curry((rate, value) => value * rate)` and derive `tenPercent = percent(0.1)`. Call `[100, 200, 50].map(tenPercent)`. Expected: `[10, 20, 5]`.

---

### Step 3 — Argument Order: Design for Partial Application

**The problem this step solves:** Show that argument order is a design decision — configuration arguments come first, data arguments come last.

**The code:**

```js
// BAD argument order for currying:
function filterBad(array, predicate) {
  return array.filter(predicate);
}
// To partially apply: filterBad(?, predicate) — but we want to fix predicate, not array

// GOOD argument order for currying:
const filter = curry((predicate, array) => array.filter(predicate));
const map    = curry((transform, array) => array.map(transform));
const reduce = curry((fn, initial, array) => array.reduce(fn, initial));

// Now we can partially apply the behavior (predicate, transform) and pass the data last:
const getEvens     = filter(x => x % 2 === 0);
const getOdds      = filter(x => x % 2 !== 0);
const doubleAll    = map(x => x * 2);
const squareAll    = map(x => x * x);
const sumAll       = reduce((a, b) => a + b, 0);
const productAll   = reduce((a, b) => a * b, 1);

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log(getEvens(numbers));    // → [2, 4, 6, 8, 10]
console.log(doubleAll(numbers));   // → [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
console.log(sumAll(numbers));      // → 55
```

**The walkthrough — `getEvens(numbers)`:**

1. `filter` is curried with arity 2.
2. `filter(x => x % 2 === 0)` — one argument provided (`predicate = isEven`). Returns a new function waiting for the array.
3. `getEvens = filter(isEven)` — a specialized function.
4. `getEvens(numbers)` — calls `filter(isEven, numbers)` which calls `numbers.filter(isEven)`.

**The design rule:** Put configuration/behavior arguments first, data arguments last. This enables partial application of behavior before the data is available — which is the common case in pipelines and callbacks.

**CS lens — data-last convention:**

Ramda and many functional libraries follow the **data-last** convention: the collection or primary data argument comes last. This maximizes partial applicability: `R.filter(predicate)` returns a function that accepts any array. `R.map(double)` returns a function that maps `double` over any array. These partially-applied functions are directly usable as `pipe` steps.

**SE lens — composable filter/map functions:**

With data-last curried `filter` and `map`:

```js
function pipe(...fns) { return v => fns.reduce((a, f) => f(a), v); }

const processNumbers = pipe(
  filter(x => x % 2 === 0),   // keep evens
  map(x => x * x),            // square them
  reduce((a, b) => a + b, 0), // sum
);

console.log(processNumbers([1, 2, 3, 4, 5]));  // → 20  (4+16=20)
```

Each step is a partially-applied function waiting for its array. `pipe` feeds the array left-to-right through the steps. This pattern is called **point-free pipeline** — the data (`[1,2,3,4,5]`) is only mentioned once, at the point of invocation.

**What breaks with data-first argument order:**

`filter(array, predicate)` cannot be partially applied with just the predicate — you would have to pass the array first, which means you need the array before you can create the specialized function. Data-first functions require currying tricks or lambda wrappers to use in pipelines: `arr => filter(arr, isEven)`. Data-last functions need no wrapper.

---

### SAVE AND TRY

```js
function curry(fn) {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
}

function pipe(...fns) { return v => fns.reduce((a, f) => f(a), v); }

const filter = curry((predicate, array) => array.filter(predicate));
const map    = curry((transform, array) => array.map(transform));
const reduce = curry((fn, init, array) => array.reduce(fn, init));

const processOrders = pipe(
  filter(order => order.amount > 50),        // keep orders over $50
  map(order => ({ ...order, tax: order.amount * 0.1 })),  // add tax field
  reduce((sum, order) => sum + order.amount + order.tax, 0), // total with tax
);

const orders = [
  { id: 1, amount: 30 },
  { id: 2, amount: 100 },
  { id: 3, amount: 75 },
  { id: 4, amount: 20 },
];

console.log(`Total after tax: $${processOrders(orders).toFixed(2)}`);
// → $192.50  (100 + 10 + 75 + 7.5)
```

Expected: `$192.50`.

**Change something:** Add a step to the pipeline: `map(order => ({ ...order, discounted: order.amount * 0.95 }))` between filter and the tax step. Adjust the reduce to use `discounted` instead of `amount`. Expected: slightly lower total (5% discount applied before tax).

---

## Connect the Pieces

**What you built:** Manual currying, a general `curry` function, data-last curried `filter`/`map`/`reduce`, and a point-free pipeline combining all three.

**How it connects to LAB-022 (Composition):** Currying is the mechanism that makes multi-argument functions composable. Every step in a `pipe` must accept one argument. Currying reduces any function to this form by partial application.

**How it connects to LAB-007 (Closures):** Every partially-applied curried function is a closure. `multiply(2)` returns a function that closes over `a = 2`. The closure is the implementation mechanism; partial application is the design concept.

**How it connects forward:**

- **LAB-038 (TypeScript Mapped Types):** TypeScript's utility types (`Partial<T>`, `Pick<T, K>`) are the type-level equivalent of partial application — applying a type transformation to part of a type definition.
- **LAB-084 (Strategy Pattern):** Curried functions are function-based strategies. `filter(isEven)` is a strategy for filtering — the predicate is the configurable part, the array iteration is fixed.

**The real-world connection:**

React's event handlers are often partial applications: `onClick={() => handleDelete(item.id)}` — `handleDelete` is partially applied with `item.id` to create a zero-argument handler. Express route handlers with middleware factories: `auth({ role: "admin" })` returns middleware (partial application). Every time you write a function that returns a function configured by its outer arguments, you are doing partial application.

---

## What Breaks Without This

**Concrete failure — repeated lambda wrappers without currying:**

```js
function pipe(...fns) { return v => fns.reduce((a, f) => f(a), v); }

// Without currying: every multi-argument function needs a wrapper lambda
const pipeline = pipe(
  arr => arr.filter(x => x % 2 === 0),   // wrapper for filter
  arr => arr.map(x => x * 2),             // wrapper for map
  arr => arr.reduce((a, b) => a + b, 0),  // wrapper for reduce
);
```

Every step requires an explicit `arr =>` wrapper that mentions the data. The data-last curried versions eliminate all these wrappers. The pipeline says "what to do" more clearly than "how to do it with this specific array variable."

---

## Definition of Done

Verify each item before moving to LAB-024.

- [ ] `curriedAdd(3)(4) === 7` and `curriedAdd(3)` returns a function
- [ ] `curry(fn)` converts a 3-argument function to `fn(a)(b)(c)` and `fn(a, b, c)` both work
- [ ] `multiply(2)` returns `double`; `double(5) === 10`
- [ ] Data-last `filter(isEven)(numbers)` returns only even numbers
- [ ] The `processOrders` pipeline returns the correct total
- [ ] You can explain why argument order matters for partial applicability

**Git commit:**

```
git add .
git commit -m "LAB-023: curry and partial application — specialized functions from general ones, data-last convention for composable pipelines"
```

---

## Quick Check Answers

**1. What does `curriedAdd(3)` return on its own?**

`curriedAdd(3)` returns a function — specifically, the inner function that takes `b` and returns `3 + b`. The call `curriedAdd(3)` is **partial application**: applying the first argument while deferring the second. The returned function is a specialized version of `add` with `a` fixed to `3`.

**2. What is the difference between currying and partial application?**

**Currying** is the transformation: converting a function that takes N arguments into N functions each taking one argument. It is a structural transformation of the function. **Partial application** is the use: calling a function with fewer arguments than it expects, fixing the supplied arguments and returning a function for the rest. Currying enables partial application. You can partially apply a curried function at any point; a non-curried function must receive all arguments at once.

**3. How would you create `isAbove100` from curried `isGreaterThan`?**

After currying with `(threshold, value)` order: `const isAbove100 = isGreaterThan(100)`. The threshold `100` is fixed; the returned function accepts the value to test. `isAbove100(150) === true`, `isAbove100(50) === false`.

---

*Next: LAB-024 — Arrays: Linear Data Structure and O(n) Operations*
