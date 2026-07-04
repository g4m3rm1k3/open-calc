export default   {
    id: 'currying',
    title: 'Currying',
    tag: 'Functional',
    steps: [
      {
        title: 'add — two calls, one addition',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}`,
        explanation: [
          '`add` on line 1 takes a single argument `a` and immediately returns another function on line 2. The inner function takes `b` and on line 3 computes `a + b`. Nothing is added yet — no call has been made. `add` is a function factory: calling it produces a specialised function.',
          'CS — This is currying: transforming a function that takes two arguments at once into a sequence of two functions that each take one argument. `add(a, b)` (uncurried) becomes `add(a)(b)` (curried). The inner function closes over `a` — the outer argument is captured in the closure and remains accessible after `add` returns.',
          'SE — Currying is the foundation of function composition in Haskell and Elm, where all functions are curried by default. In JavaScript, Lodash `_.curry(fn)` converts any function to its curried form automatically. Ramda\'s entire API is curried. The pattern enables partial application — baking in some arguments up front and supplying the rest later.',
          'Without this: a standard `function add(a, b) { return a + b }` cannot be partially applied. You cannot create a specialised `add5` from it without a wrapper. Currying separates argument slots so each can be filled independently — enabling reuse patterns that flat argument lists cannot express.',
        ],
        active: [{ startLine: 1, endLine: 5, color: 'indigo', label: 'add — takes a, returns fn' }],
        connections: [],
      },
      {
        title: 'add(5) — closes over a=5, returns inner fn',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5 = add(5)`,
        explanation: [
          'Line 7 calls `add(5)`. Execution enters line 1 — `a` receives `5`. Line 2 creates and returns the inner function. `add5` stores that function. The inner function has permanently closed over `a = 5` — that binding lives as long as `add5` is reachable. `add` returns. `a = 5` is preserved in the closure.',
          'CS — Closure capture: when `add` returns the inner function, `a` is not on the stack frame any more — it is promoted to the closure environment. The inner function holds a reference to that environment. `a` will never be garbage-collected while `add5` exists. This is the mechanism that makes partial application possible.',
          'SE — Closure-based partial application is used extensively in event handler setup: `const handleClick = withUserId(currentUser.id)` returns a function that already knows the user ID. React hooks use the same pattern: `useCallback(() => dispatch(actionCreator(id)), [id])` closes over `id`. The dependency array exists precisely because of closure capture.',
          'Without this: if `a` were not closed over, the inner function would have no way to access it after `add` returned. Every call to `add5` would need `a` to be passed again — defeating the purpose of partial application. Closures are what make "bake in one argument now, supply the other later" actually work.',
        ],
        active: [
          { startLine: 7, endLine: 7, color: 'emerald', label: 'add5 = add(5)' },
          { startLine: 1, endLine: 4, color: 'violet',  label: 'add runs — a=5, returns inner fn' },
        ],
        connections: [{ fromLine: 7, toLine: 1, color: 'emerald', label: 'enters add' }],
      },
      {
        title: 'add5(3) — inner fn runs, a from closure',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5 = add(5)

console.log(add5(3))`,
        explanation: [
          'Line 9 calls `add5(3)`. That calls the inner function with `b = 3`. Line 3 runs: `a + b`. `a` is retrieved from the closure — it is `5`. `5 + 3 = 8`. The result `8` returns from the inner function, back through `add5(3)`, to `console.log`.',
          'CS — The call stack at line 3: `console.log` → inner function. The inner function\'s closure environment provides `a = 5`. `b = 3` is the current call\'s argument. The two values come from two different sources — closure (outer call) and argument (current call) — and combine in one expression. This is why currying requires closures.',
          'SE — `add5` is now a fully reusable increment function. You can pass it anywhere a `(number) => number` function is expected. `[1, 2, 3].map(add5)` returns `[6, 7, 8]`. No lambda, no boilerplate — `add5` is the callback. Lodash partial application and Ramda\'s composition combinators work on this exact principle.',
          'Without this: if you called `add(5)(3)` directly instead of storing `add5`, you get the same result but lose the reuse. Every use of `add5` would require writing `add(5)(...)` — repeating the `5`. Naming the partially applied function is what makes it composable and readable. The intermediate binding is the point.',
        ],
        active: [
          { startLine: 9, endLine: 9, color: 'emerald', label: 'add5(3) → 8' },
          { startLine: 2, endLine: 4, color: 'violet',  label: 'inner fn — a=5 from closure' },
        ],
        connections: [{ fromLine: 9, toLine: 2, color: 'emerald', label: 'calls inner fn' }],
      },
      {
        title: 'add5 called with different values',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5 = add(5)

console.log(add5(3))
console.log(add5(10))
console.log(add5(0))`,
        explanation: [
          'Lines 9–11 call `add5` three times with different values of `b`. `a` is always `5` — fixed by the closure. `add5(3)` returns `8`, `add5(10)` returns `15`, `add5(0)` returns `5`. Each call is independent. The closure environment holding `a = 5` is shared across all three calls but never mutated.',
          'CS — The closure environment is read-only here. Each call to `add5` creates a new stack frame for the inner function with a fresh `b` binding, but they all share the same closure reference for `a`. This is safe because `a` is never reassigned inside the inner function. If it were reassigned, calls would interfere — a common bug in closures that capture mutable state.',
          'SE — This reuse pattern maps directly to production use: `const taxRate = withRate(0.2)` produces a function for 20% tax. `prices.map(taxRate)` applies it to every price. `[netPrice, grossPrice].map(taxRate)` applies it to two values. The function is defined once, applied anywhere. Same pattern as `add5`.',
          'Without this: an uncurried `add(a, b)` forces the full argument list every time: `add(5, 3)`, `add(5, 10)`, `add(5, 0)`. The `5` is repeated in every call — not DRY. If the first argument changes (`6` instead of `5`), every call must be updated. Partial application eliminates the repeated argument by naming the partially applied form.',
        ],
        active: [
          { startLine: 9,  endLine: 11, color: 'emerald', label: 'same a, different b' },
          { startLine: 2,  endLine: 4,  color: 'violet',  label: 'inner fn — a=5 always' },
        ],
        connections: [{ fromLine: 9, toLine: 2, color: 'emerald', label: 'calls inner fn' }],
      },
      {
        title: 'add10 — a second specialised function',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5  = add(5)
const add10 = add(10)

console.log(add5(3))
console.log(add5(10))
console.log(add5(0))
console.log(add10(3))`,
        explanation: [
          'Line 8 calls `add(10)`. A fresh inner function is returned with `a = 10` in its closure — entirely separate from `add5`\'s closure where `a = 5`. Line 13 prints `add10(3)`: inner function runs with `b = 3`, `a + b = 10 + 3 = 13`. `add5` and `add10` are two independent specialised functions produced from one `add` definition.',
          'CS — Each call to `add(a)` creates a new closure environment. `add5`\'s closure and `add10`\'s closure are distinct heap objects — they do not share storage. Changing the `a` slot of one would not affect the other (if such a mutation were possible). This is why curried functions are safe to create in any quantity from a single definition.',
          'SE — This is the factory function pattern. `add` is a function factory that produces specialised adders. In production: `withLogger(\'[Auth]\')` and `withLogger(\'[DB]\')` produce two loggers that prepend different prefixes but share the same logging implementation. One definition, many specialisations.',
          'Without this: without currying, creating `add10` would require writing `function add10(b) { return 10 + b }` — a new function definition for every specialisation. Each new fixed value (`15`, `20`, `100`) requires a new function. The curried `add` collapses infinitely many specialisations into one definition parameterised by the first argument.',
        ],
        active: [
          { startLine: 8,  endLine: 8,  color: 'pink',    label: 'add10 — a=10 baked in' },
          { startLine: 13, endLine: 13, color: 'emerald', label: 'same b=3, different results' },
        ],
        connections: [
          { fromLine: 8,  toLine: 1, color: 'pink',    label: 'a=10' },
          { fromLine: 13, toLine: 2, color: 'pink',    label: 'inner fn — a=10' },
        ],
      },
      {
        title: 'Compose — output of one feeds the next',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5  = add(5)
const add10 = add(10)

console.log(add5(3))
console.log(add5(10))
console.log(add5(0))
console.log(add10(3))
console.log(add5(add10(2)))`,
        explanation: [
          'Line 14: `add10(2)` evaluates first — `a=10, b=2` → returns `12`. That result `12` is passed as the argument to `add5(12)` — `a=5, b=12` → returns `17`. `console.log` prints `17`. The output of `add10` is the input to `add5`. No intermediate variable. No glue code. Two curried functions compose naturally.',
          'CS — Function composition: `add5(add10(2))` is equivalent to `(f ∘ g)(x)` where `f = add5`, `g = add10`, `x = 2`. Composition works here because both functions share the same type: `number → number`. When every function in a chain takes and returns the same type, they can be nested arbitrarily. Currying enables this by ensuring each function takes exactly one value.',
          'SE — Lodash `_.flow([add10, add5])` and Ramda `R.pipe(add10, add5)` formalise this pattern. They take an array of single-argument functions and return a composed function: `pipe(add10, add5)(2)` = `17`. The composed function reads like a pipeline — data flows left to right through each stage. Currying is the prerequisite: each stage must take one argument.',
          'Without this: composing two-argument functions requires explicit lambda wrappers: `x => add5(add10(x), ???)` — the second argument (`5`) has nowhere to go without partial application. Currying eliminates the wrapper by baking the fixed argument into the function reference. `add5` already carries its `5`; no wrapper needed at composition time.',
        ],
        active: [
          { startLine: 14, endLine: 14, color: 'emerald', label: 'add5(add10(2)) = 17' },
          { startLine: 2,  endLine: 4,  color: 'violet',  label: 'add10 inner fn: a=10, b=2 → 12' },
          { startLine: 2,  endLine: 4,  color: 'indigo',  label: 'add5 inner fn: a=5, b=12 → 17' },
        ],
        connections: [
          { fromLine: 14, toLine: 2, color: 'violet', label: 'add10(2)=12' },
        ],
      },
    ],
  }
