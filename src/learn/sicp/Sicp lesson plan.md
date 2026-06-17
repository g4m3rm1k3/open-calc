# SICP JavaScript — Complete Lesson Plan

**Structure and Interpretation of Computer Programs, JavaScript Edition**
From beginner to master. Every lesson maps to the book. Every lesson has a concept, a CodeLens moment, and a challenge.

---

## How to Read This Plan

Each lesson entry contains:

- **Concept** — the central idea the lesson teaches
- **Narration arc** — the sequence of ideas within the lesson
- **CodeLens moment** — the specific execution the student steps through and what they should see
- **Challenge** — what the student writes to prove understanding
- **Connects to** — which lesson this unlocks

Lessons are grouped into sections which are grouped into chapters. The depth increases across chapters — Chapter 1 assumes no prior programming knowledge. Chapter 4 assumes mastery of Chapters 1–3. Chapter 5 assumes mastery of the whole book.

---

## Chapter 1 — Building Abstractions with Functions

> **The chapter question:** How do we build computations?
>
> Chapter 1 starts from nothing. A student who has never programmed should be able to follow it. By the end they can write recursive processes, higher-order functions, and reason about the complexity of a computation. The vehicle is pure functions — no objects, no mutation, no I/O beyond console.log.

---

### Section 1.1 — The Elements of Programming

---

#### Lesson `sicp-1-1-1` — Expressions and Evaluation

**Concept:** The interpreter evaluates expressions and returns values. Every expression has a value. Combinations are expressions built from sub-expressions.

**Narration arc:**
1. The simplest expressions: number literals. The interpreter returns the number.
2. Arithmetic combinations: `486`, `137 + 349`, `5 * 99`. Operator and operands.
3. Nesting: `(3 * 5) + (10 - 6)`. The interpreter evaluates innermost first.
4. The evaluation rule is recursive — to evaluate a combination, evaluate all sub-expressions first, then apply the operator.
5. This recursive rule terminates at primitives — numbers and built-in operators are the base cases.

**CodeLens moment:** Step through `(2 + (4 * 6)) * ((3 + 5) + 7)`. Watch the call tree form as a tree — leaves are primitives, branches are operations. The shape of the tree IS the expression.

**Challenge:** Without running it, predict the value of `(3 * (2 + 4)) * (7 - (1 + 2))`. Then verify. Write three nested expressions of your own that each evaluate to 100.

**Connects to:** `sicp-1-1-2` (naming gives values handles so we can reuse them)

---

#### Lesson `sicp-1-1-2` — Naming and the Environment

**Concept:** Names bind to values. The environment is the interpreter's memory of all current bindings. `const` creates a binding.

**Narration arc:**
1. `const size = 2` — the interpreter evaluates the right side, binds the result to the name.
2. Using the name: `5 * size`. The interpreter looks up `size` in the environment, substitutes 2.
3. Names can refer to other names: `const area = pi * radius * radius`.
4. The environment grows as we make declarations. It is the accumulated context of our program.
5. Naming is the simplest abstraction — it lets us refer to complex things by simple names.

**CodeLens moment:** Step through a sequence of `const` declarations. Watch the scope chain panel — each declaration adds a row. When `area` is computed, watch the interpreter look up `pi` and `radius` in the environment.

**Challenge:** Define names for the sides of a right triangle (3, 4, 5). Using only those names and arithmetic operators, compute and log the hypotenuse, the perimeter, and the area of the triangle. No numeric literals allowed after the initial declarations.

**Connects to:** `sicp-1-1-3` (names are looked up during evaluation of combinations)

---

#### Lesson `sicp-1-1-3` — Evaluating Combinations

**Concept:** The evaluation rule is a recursive process. Evaluating a combination means evaluating all sub-expressions, then applying. The recursion bottoms out at primitives and names.

**Narration arc:**
1. Walk through the full evaluation of `(x + 1) * (y - 2)` step by step.
2. The tree of evaluation — every combination produces a node, every primitive is a leaf.
3. Names are evaluated by looking them up in the environment — they return their bound value.
4. Special forms: `const` is not evaluated like a combination. The right side is evaluated but the left side (the name) is not looked up — it is being created.
5. The evaluation rule does not apply uniformly to everything — special forms are exceptions.

**CodeLens moment:** Step through a moderately complex expression with several named constants. Watch the event panel — `variable_assign` for declarations, the recursive evaluation order for combinations. Count how many `statement_enter` events fire.

**Challenge:** Write an expression using at least four named constants and three levels of nesting that evaluates to your birth year. Trace the evaluation order by hand first, then verify with CodeLens.

**Connects to:** `sicp-1-1-4` (function application is the next level of combination)

---

#### Lesson `sicp-1-1-4` — Compound Functions

**Concept:** Function declarations give names to compound operations. A function abstracts a pattern of computation — square, sum_of_squares, pythagoras.

**Narration arc:**
1. `function square(x) { return x * x; }` — declare a function, give it a name and parameters.
2. Application: `square(5)`. The interpreter evaluates the argument, substitutes for the parameter, evaluates the body.
3. Functions can call functions: `sum_of_squares(x, y)` calls `square` twice.
4. The caller does not need to know how `square` works — only what it does. This is abstraction.
5. Functions compose: `pythagoras` calls `sum_of_squares` which calls `square`. Layers of abstraction.

**CodeLens moment:** Step through `pythagoras(3, 4)`. Watch the call stack grow: pythagoras → sum_of_squares → square (twice). Each call pushes a frame. Each return pops one. The heap is empty — pure functions create no objects.

**Challenge:** Write `cube(x)`, `sum_of_cubes(x, y, z)`, and `hypotenuse_3d(a, b, c)` that computes the diagonal of a 3D box. Use only previously defined functions — no raw multiplication in `sum_of_cubes` or `hypotenuse_3d`.

**Connects to:** `sicp-1-1-5` (the substitution model explains how application works)

---

#### Lesson `sicp-1-1-5` — The Substitution Model

**Concept:** The substitution model is a way to reason about function application by hand. Replace parameter names with argument values, then evaluate. It is not how the interpreter works internally — but it gives correct answers for pure functions.

**Narration arc:**
1. Walk `square(5)` through the substitution model: replace `x` with `5` in `x * x`, get `5 * 5`, evaluate to 25.
2. Walk `sum_of_squares(3, 4)` fully: substitute, expand each `square` call, reduce to primitives.
3. Applicative order vs normal order. JavaScript uses applicative — evaluate arguments before substituting. Normal order substitutes first, evaluates only when needed.
4. The two orders give the same result for pure functions. They differ when there are side effects.
5. The substitution model is a mental tool. The environment model (Chapter 3) is the real mechanism.

**CodeLens moment:** Step through `sum_of_squares(3, 4)` and manually write the substitution model on paper alongside. Verify that each step of the substitution matches the execution events in CodeLens. Count the total number of multiplications performed.

**Challenge:** Use only the substitution model — no running code — to evaluate `f(5)` where `f(x) = sum_of_squares(x + 1, x * 2)`. Show every substitution step. Then verify by running it.

**Connects to:** `sicp-1-1-6` (conditionals introduce branching — the substitution model extends to handle them)

---

#### Lesson `sicp-1-1-6` — Conditional Expressions and Predicates

**Concept:** Conditionals let a function choose between expressions based on a predicate. Predicates return true or false. Logical operators combine predicates.

**Narration arc:**
1. `abs(x)` — three cases, three branches. The `if/else if/else` form.
2. Predicates: `>`, `<`, `===`, `>=`, `<=`. They return boolean values.
3. Logical operators: `&&` (and), `||` (or), `!` (not). They combine predicates.
4. Conditionals are special forms — only one branch is evaluated. This matters when branches have side effects.
5. The ternary operator `condition ? a : b` as a compact conditional expression.

**CodeLens moment:** Step through `abs(-3)`, `abs(0)`, and `abs(5)` in sequence. Watch the `conditional_branch` events — each shows the condition evaluated and which branch was taken. The other branch shows no events at all — it was never evaluated.

**Challenge:** Write `sign(x)` returning -1, 0, or 1. Write `in_range(x, low, high)` returning true if `low <= x <= high`. Write `clamp(x, low, high)` returning `low` if `x < low`, `high` if `x > high`, and `x` otherwise. Use `in_range` inside `clamp`.

**Connects to:** `sicp-1-1-7` (Newton's method uses conditionals to decide when to stop)

---

#### Lesson `sicp-1-1-7` — Square Roots by Newton's Method

**Concept:** The difference between declarative knowledge (what the answer is) and imperative knowledge (how to find it). Newton's method as an iterative improvement process. Recursive iteration.

**Narration arc:**
1. The mathematical definition of square root tells us nothing about how to compute one.
2. Newton's idea: start with a guess, improve it by averaging with `x / guess`, repeat.
3. When to stop: when the guess is "good enough" — when `|guess² - x| < tolerance`.
4. `sqrt_iter` calls itself with an improved guess each time. This is iteration expressed as recursion.
5. The process converges: each guess is closer to the true value. Why? The improvement always reduces the error.

**CodeLens moment:** Step through `sqrt(9)` and track the `guess` value across iterations of `sqrt_iter`. Watch it converge: 1.0 → 5.0 → 3.4 → 3.02 → 3.00009... The call tree shows iteration as repeated self-calls.

**Challenge:** The Newton's method tolerance of 0.001 is problematic for very large and very small numbers. Write an improved `good_enough` that uses relative rather than absolute tolerance: `|guess² - x| / x < 0.001`. Test it on `sqrt(0.0001)` and `sqrt(1000000000000)`.

**Connects to:** `sicp-1-1-8` (block structure lets us hide sqrt's helpers inside it)

---

#### Lesson `sicp-1-1-8` — Functions as Black Boxes

**Concept:** Procedural abstraction: a function hides how it works. Block structure: helper functions nested inside the function that needs them. Lexical scoping: inner functions capture variables from the enclosing scope.

**Narration arc:**
1. `square` inside `sum_of_squares` is a black box — the caller doesn't care about implementation.
2. Two implementations of `square` that produce identical results — the caller cannot tell the difference.
3. Block structure: move `good_enough`, `improve`, `sqrt_iter` inside `sqrt`. They are now private.
4. Lexical scoping: `good_enough` can use `x` from `sqrt` without it being passed as a parameter.
5. Free vs bound variables: `x` is bound in `sqrt`, free in `good_enough`. The scope chain connects them.

**CodeLens moment:** Step through the block-structured `sqrt`. Watch the scope chain panel — `good_enough` has its own frame, and behind it is `sqrt`'s frame containing `x`. When `good_enough` refers to `x`, the lookup traverses the scope chain upward.

**Challenge:** Refactor the `cube_root` function from the previous challenge into full block structure with all helpers inside. Then extend it: make the tolerance a parameter of `cube_root` so the caller can control precision. `cube_root(8, 0.0001)` should give more decimal places than `cube_root(8, 0.1)`.

**Connects to:** `sicp-1-2-1` (recursion creates processes — we can now analyze what kind of process a function generates)

---

### Section 1.2 — Functions and the Processes They Generate

---

#### Lesson `sicp-1-2-1` — Linear Recursion and Iteration

**Concept:** A recursive function does not necessarily generate a recursive process. Recursive factorial generates a linear recursive process (the stack grows). Iterative factorial generates an iterative process (constant stack depth). The distinction is in the shape of the process, not the shape of the code.

**Narration arc:**
1. Factorial defined recursively: `n! = n * (n-1)!`. The function calls itself.
2. Trace `factorial(5)` with the substitution model — a chain of deferred multiplications builds up, then resolves. This is a recursive process — the chain IS the computation.
3. Factorial defined iteratively: a running product updated in a loop (expressed as recursion with an accumulator).
4. Trace `factorial_iter(5, 1, 5)` — the stack does not grow. The accumulator holds the state. This is an iterative process.
5. The key distinction: a recursive process has pending operations that must be remembered. An iterative process has all its state in its parameters.

**CodeLens moment:** Step through recursive `factorial(5)` and watch the call stack grow to depth 5, then unwind. Then step through iterative `factorial_iter` and watch the stack stay at constant depth while the accumulator changes. The contrast is the lesson.

**Challenge:** Write both recursive and iterative versions of `sum_integers(n)` that sums 1 + 2 + ... + n. For the iterative version use an accumulator parameter. Verify they give identical results. Use CodeLens to compare the maximum call stack depth for `n = 10`.

**Connects to:** `sicp-1-2-2` (tree recursion is a different shape again — multiple recursive calls per step)

---

#### Lesson `sicp-1-2-2` — Tree Recursion

**Concept:** Some recursive processes are tree-shaped — each step spawns multiple recursive calls. Fibonacci is the canonical example. Tree recursive processes can be exponentially wasteful but are often the most natural expression of a problem.

**Narration arc:**
1. Fibonacci: `fib(n) = fib(n-1) + fib(n-2)`. Two recursive calls per step.
2. Trace `fib(5)` — the process is a tree. The same subproblems are computed repeatedly. `fib(3)` is computed twice, `fib(2)` three times.
3. The number of steps grows as the Fibonacci sequence itself — roughly φⁿ where φ ≈ 1.618. Exponential.
4. An iterative Fibonacci: track two consecutive values, step forward. Linear time, constant space.
5. Tree recursion is not always bad — sometimes the tree structure perfectly matches the problem (tree data structures, Chapter 2). The lesson is recognizing when it is wasteful.

**CodeLens moment:** Step through `fib(6)` in the call tree view. The tree visualization shows the exponential branching. Count the duplicate nodes — `fib(3)` appears as a subtree multiple times. This is the redundant computation made visible.

**Challenge:** Count the number of times `fib(1)` is called when computing `fib(n)` for n = 1 through 10. Find the pattern. Then write a `count_calls` version of fibonacci that tracks and returns this count alongside the result.

**Connects to:** `sicp-1-2-3` (order of growth lets us describe the cost of these processes precisely)

---

#### Lesson `sicp-1-2-3` — Orders of Growth

**Concept:** Orders of growth describe how resource requirements scale with input size. O(1) (constant), O(n) (linear), O(n²) (quadratic), O(log n) (logarithmic), O(2ⁿ) (exponential). These are tools for comparing processes.

**Narration arc:**
1. Define order of growth: R(n) = Θ(f(n)) means R grows like f — constant factor apart.
2. Linear recursive factorial: Θ(n) steps, Θ(n) space (stack depth).
3. Iterative factorial: Θ(n) steps, Θ(1) space.
4. Tree recursive Fibonacci: Θ(φⁿ) steps, Θ(n) space (depth of deepest branch).
5. Why this matters: the difference between Θ(log n) and Θ(n) is enormous at scale. Between Θ(n) and Θ(2ⁿ) it is catastrophic.

**CodeLens moment:** Use the complexity chart in CodeLens. Run `fib` for inputs 5, 10, 15, 20. Plot operation count vs input. Watch the exponential curve. Run iterative fibonacci for the same inputs — the line is nearly flat by comparison.

**Challenge:** Without running anything, predict the order of growth (steps and space) for: (a) recursive `length` of a list, (b) `power(base, exp)` using repeated multiplication, (c) `count_change` (making change with coins — look ahead to section 1.2.2). Explain your reasoning.

**Connects to:** `sicp-1-2-4` (fast exponentiation is a concrete example of achieving O(log n) vs O(n))

---

#### Lesson `sicp-1-2-4` — Exponentiation

**Concept:** Slow exponentiation is O(n). Fast exponentiation by successive squaring is O(log n). The same mathematical operation, two completely different processes, dramatically different performance.

**Narration arc:**
1. Slow: `power(b, n) = b * power(b, n-1)`. Linear steps.
2. Fast: `b^n = (b^(n/2))²` if n is even, `b * b^(n-1)` if odd. Each even step halves n — logarithmic.
3. Trace `fast_power(2, 10)`: 10 → 5 → 4 → 2 → 1. Only 4 squarings to compute 2^10 = 1024.
4. The iterative version of fast exponentiation using an accumulator.
5. The general principle: successive squaring is a technique applicable beyond exponentiation — matrix exponentiation, Fibonacci in O(log n), etc.

**CodeLens moment:** Step through `fast_power(2, 10)` and `slow_power(2, 10)` side by side. Count the total operations each requires. The difference is the point — same result, 4 steps vs 10 steps. At `n = 1000` it would be 10 steps vs 1000.

**Challenge:** Implement `fast_power_iter(b, n, acc)` — the iterative version using an accumulator. Invariant: at every step, `acc * b^n` equals the final result. Verify it matches `fast_power` for all inputs you try. Then implement `fibonacci_fast(n)` using matrix exponentiation to compute Fibonacci in O(log n).

**Connects to:** `sicp-1-2-5` (GCD is another O(log n) algorithm — Euclid's method)

---

#### Lesson `sicp-1-2-5` — Greatest Common Divisors

**Concept:** Euclid's algorithm computes GCD in O(log n) steps. It is one of the oldest algorithms in existence. Understanding why it works requires a simple proof. The algorithm's structure reveals something profound: `gcd(a, b) = gcd(b, a % b)`.

**Narration arc:**
1. The problem: find the largest integer that divides both a and b.
2. Euclid's observation: `gcd(a, b) = gcd(b, a mod b)`. Why? Because any divisor of a and b also divides a mod b.
3. The algorithm terminates because `a mod b < b` — the second argument strictly decreases.
4. Lamé's theorem: the number of steps is at most 5 times the number of digits in the smaller input. Logarithmic.
5. GCD is foundational — we used it in the rational number system to reduce fractions. It will appear again.

**CodeLens moment:** Step through `gcd(206, 40)`. Watch the arguments: (206, 40) → (40, 6) → (6, 4) → (4, 2) → (2, 0). Five steps to compute GCD of a three-digit number. The call tree shows the linear chain — this is a linear recursive process, not a tree.

**Challenge:** Prove by hand (not by running) that `gcd(a, 0) = a` for any positive a, and that `gcd(0, b) = b`. Then use GCD to write `lcm(a, b)` — the least common multiple — using the identity `lcm(a, b) = a * b / gcd(a, b)`.

**Connects to:** `sicp-1-2-6` (prime testing is another application of number theory — and introduces probabilistic algorithms)

---

#### Lesson `sicp-1-2-6` — Prime Testing

**Concept:** Trial division is O(√n). The Fermat primality test is O(log n) — probabilistic. Fast exponentiation makes the Fermat test practical. This is the first encounter with probabilistic algorithms — correct with high probability, not certain.

**Narration arc:**
1. Trial division: try every integer from 2 to √n. If none divide evenly, n is prime. Why √n? If n has a factor > √n it also has one < √n.
2. `smallest_divisor(n)` using trial division. `is_prime(n) = smallest_divisor(n) === n`.
3. Fermat's little theorem: if n is prime and a < n, then `a^n mod n = a`. We can check this for random a.
4. The Fermat test: pick a random a, check the theorem. Repeat k times. If it always holds, n is probably prime.
5. Carmichael numbers fool the Fermat test — they satisfy Fermat's theorem but are not prime. Probabilistic algorithms can be wrong.

**CodeLens moment:** Step through `fermat_test(97)` and `fermat_test(561)` (a Carmichael number). Watch `fast_mod_power` compute `a^n mod n` using the modular version of fast exponentiation. See the Carmichael number pass the test it should fail.

**Challenge:** Implement `is_prime_miller_rabin(n, k)` — the Miller-Rabin primality test, which is more reliable than Fermat. The test requires checking that `a^(n-1) mod n = 1` and that no "non-trivial square root of 1 mod n" is encountered during the computation. Test it on several Carmichael numbers.

**Connects to:** `sicp-1-3-1` (higher-order functions abstract over patterns — the summation pattern appears throughout 1.2)

---

### Section 1.3 — Formulating Abstractions with Higher-Order Functions

---

#### Lesson `sicp-1-3-1` — Functions as Arguments

**Concept:** Functions are values. They can be passed as arguments. This lets us abstract over patterns of computation — the summation pattern, the product pattern, the accumulation pattern — rather than repeating the pattern with different details.

**Narration arc:**
1. Three functions: `sum_integers`, `sum_cubes`, `sum_pi_series`. They share a pattern — summing terms from a to b.
2. Abstract the pattern: `sum(term, a, next, b)`. `term` computes each value, `next` advances to the next.
3. `sum_integers` as `sum(x => x, 1, x => x+1, n)`. The pattern and the details are now separate.
4. `sum_cubes`, `pi_sum` expressed the same way. One function, many applications.
5. Numerical integration using `sum`: `integral(f, a, b, dx)`. Functions as mathematical objects.

**CodeLens moment:** Step through `sum(x => x * x, 1, x => x + 1, 5)` — summing squares 1 through 5. Watch the `function_call` events — the `term` function is called 5 times, the `next` function 5 times. The heap contains the two arrow functions as objects with closures.

**Challenge:** Write `product(term, a, next, b)` analogous to `sum` but multiplying instead of adding. Use `product` to implement `factorial(n)` and `wallis_pi(n)` — the Wallis product approximation of π/4 = (2/3)(4/3)(4/5)(6/5)(6/7)...

**Connects to:** `sicp-1-3-2` (lambda functions let us write the term and next functions inline without naming them)

---

#### Lesson `sicp-1-3-2` — Lambda Functions and Let

**Concept:** Lambda functions (arrow functions in JavaScript) create function values without naming them. `let` creates local name bindings. These two tools together make higher-order functions much more expressive.

**Narration arc:**
1. Arrow functions: `x => x * x` is the same as declaring `square` but without giving it a name.
2. Multi-parameter: `(x, y) => x + y`. Multi-statement: `(x) => { const a = x + 1; return a * a; }`.
3. `let` as syntactic sugar: `let x = 5` in an expression is equivalent to `(x => ...)(5)`. A `let` is secretly a lambda application.
4. Closures: arrow functions capture the surrounding environment. A function remembers where it was born.
5. Building the `f(x, y) = x(1 + xy)² + y(1-y) + (1+xy)(1-y)` example from SICP using `let` for `a` and `b`.

**CodeLens moment:** Step through a closure example — a function that captures a variable from its enclosing scope. Watch the heap: the arrow function is an object on the heap with a `closure` property pointing to the environment it captured. This is the physical reality of a closure.

**Challenge:** Rewrite `pi_sum` and `integral` from 1.3.1 using arrow functions everywhere — no named helper functions. Then write `compose(f, g)` that returns `x => f(g(x))`. Use it to build `square_then_add1 = compose(x => x + 1, x => x * x)`.

**Connects to:** `sicp-1-3-3` (functions as general methods — fixed points and half-interval search)

---

#### Lesson `sicp-1-3-3` — Functions as General Methods

**Concept:** Higher-order functions can express general mathematical methods — bisection search for roots, fixed-point iteration. These are not specific algorithms but algorithmic patterns.

**Narration arc:**
1. Half-interval method: find x where f(x) = 0 between a and b by bisection. If f(midpoint) has the same sign as f(a), replace a; otherwise replace b.
2. `half_interval_search(f, neg_point, pos_point)` — a generic root finder.
3. Fixed points: x is a fixed point of f if f(x) = x. We can find fixed points by repeatedly applying f.
4. `fixed_point(f, first_guess)` — apply f repeatedly until the value barely changes.
5. Average damping: some functions oscillate instead of converging. Averaging `x` and `f(x)` dampens the oscillation. Newton's square root was actually fixed-point finding with average damping.

**CodeLens moment:** Step through `fixed_point(x => 1 + 1/x, 1.0)`. Watch the sequence of values: 1, 2, 1.5, 1.667, 1.6, 1.625... converging to the golden ratio φ = 1.618... The convergence is visible in the variable panel across iterations.

**Challenge:** Find the fixed point of `cos` (in radians). Find the root of `x³ - 2x - 3 = 0` using the half-interval method between 1 and 3. Express Newton's square root entirely in terms of `fixed_point` and `average_damp` — no explicit recursion.

**Connects to:** `sicp-1-3-4` (functions as return values — average damping is a function that takes a function and returns a function)

---

#### Lesson `sicp-1-3-4` — Functions as Returned Values

**Concept:** Functions can return functions. This is the complement of functions as arguments. Together they give us full first-class functions — functions that can go anywhere a value can go.

**Narration arc:**
1. `average_damp(f)` returns a function that averages `x` and `f(x)`. It is a function transformer.
2. Expressing `sqrt` using `fixed_point` and `average_damp`: `sqrt(x) = fixed_point(average_damp(y => x/y), 1.0)`.
3. Newton's method generalized: find where f(x) = 0 by finding the fixed point of `x - f(x)/f'(x)`. We need to compute the derivative — but derivative is itself a function transformer.
4. `deriv(f)` returns an approximation of f's derivative: `x => (f(x + dx) - f(x)) / dx`.
5. `newton_transform(f)` and `newtons_method(f, guess)` — Newton's method as a general algorithm.

**CodeLens moment:** Step through `sqrt(2)` expressed as `fixed_point(average_damp(y => 2/y), 1.0)`. The heap shows `average_damp` returning a closure, that closure being passed to `fixed_point`. Functions-returning-functions are visible as objects on the heap pointing to captured environments.

**Challenge:** Implement `cube_root` using `fixed_point`, `average_damp`, and `deriv`. Then implement `nth_root(n, x)` that computes the nth root of x for any n, again using `fixed_point` and `average_damp`. No explicit recursion — everything through higher-order functions.

**Connects to:** `sicp-2-1-1` (Chapter 2 begins — now we abstract over data the same way we abstracted over functions)

---

## Chapter 2 — Building Abstractions with Data

> **The chapter question:** How do we organize information?
>
> Chapter 1 abstracted over computational processes. Chapter 2 applies the same idea to data. We build compound data, hide how it is represented behind interfaces, and discover that the same abstraction principles apply at the data level. The chapter culminates with generic operations that work across different representations.

---

### Section 2.1 — Introduction to Data Abstraction

> **Note:** Lessons `sicp-2-1-1` through `sicp-2-1-3` are already written. They are included here for completeness of the plan.

---

#### Lesson `sicp-2-1-1` — Rational Numbers *(written)*

**Concept:** Data abstraction separates use from representation. `make_rat`, `numer`, `denom` form a complete interface to rational numbers. Everything above the interface is independent of everything below it.

**Challenge:** `sub_rat` and `equal_rat`.

---

#### Lesson `sicp-2-1-2` — Abstraction Barriers *(written)*

**Concept:** Barriers separate layers. Change below a barrier does not require change above. Adding GCD reduction to `make_rat` fixes all arithmetic functions without touching them.

**Challenge:** `distance` using procedural pairs.

---

#### Lesson `sicp-2-1-3` — What Is Data? *(written)*

**Concept:** Data is defined by behavior, not by representation. The procedural pair — data made from functions — proves this. A pair is anything that satisfies the `head(pair(x,y)) = x` and `tail(pair(x,y)) = y` contracts.

---

### Section 2.2 — Hierarchical Data and the Closure Property

---

#### Lesson `sicp-2-2-1` — Sequences and Lists

**Concept:** Lists are chains of pairs. `pair(1, pair(2, pair(3, null)))` is the list [1, 2, 3]. The closure property of pairs — that the elements of a pair can themselves be pairs — is what makes lists possible.

**Narration arc:**
1. A list is a sequence of pairs where each tail is either another pair or null.
2. `list(1, 2, 3)` as shorthand for the nested pair construction.
3. `head` gives the first element, `tail` gives the rest of the list.
4. List operations: `length`, `list_ref` (nth element), `append` (concatenate).
5. Mapping: `map(f, lst)` applies `f` to each element and returns a new list of results. This is the most important list operation.

**CodeLens moment:** Step through `map(x => x * x, list(1, 2, 3, 4, 5))`. Watch the heap — the input list is a chain of pairs. As `map` runs, a new chain of pairs is built. Both chains exist simultaneously on the heap. The object graph shows two parallel chains.

**Challenge:** Implement `filter(predicate, lst)` returning only elements satisfying the predicate, `reduce(f, init, lst)` folding the list with a function and initial value, and `flat_map(f, lst)` applying `f` to each element and concatenating results. Use all three to compute all pairs (i, j) where 1 ≤ j < i ≤ n whose sum is prime.

**Connects to:** `sicp-2-2-2` (pairs can hold pairs — hierarchical structures, not just flat lists)

---

#### Lesson `sicp-2-2-2` — Hierarchical Structures (Trees)

**Concept:** Lists of lists form trees. A tree is a pair whose elements can themselves be pairs (subtrees) or atoms (leaves). Recursion on trees mirrors the recursive structure of the data.

**Narration arc:**
1. `list(list(1, 2), list(3, 4))` — a list of lists. The heap shows a tree of pairs.
2. `count_leaves` — count the atoms in a tree. Base case: atom → 1. Recursive case: count left subtree + count right subtree.
3. `map_tree(f, tree)` — apply f to every leaf. The structure is preserved, only the leaves change.
4. Fringe: `fringe(tree)` flattens a tree to a list of its leaves in left-to-right order.
5. The recursive structure of the function mirrors the recursive structure of the data. This is the key insight of working with trees.

**CodeLens moment:** Step through `count_leaves(list(list(1,2), list(3, list(4, 5))))`. Watch the call tree in CodeLens — it mirrors the data tree exactly. Each recursive call corresponds to a node in the data. The heap shows the pair structure being traversed.

**Challenge:** Write `tree_map(f, tree)` that applies `f` to every leaf and returns a tree with the same structure. Write `deep_reverse(tree)` that reverses a tree at every level — not just the top level. Then write `accumulate_tree(f, init, tree)` that folds over all leaves.

**Connects to:** `sicp-2-2-3` (sequences as interfaces — map, filter, accumulate as a design paradigm)

---

#### Lesson `sicp-2-2-3` — Sequences as Interfaces

**Concept:** Map, filter, and accumulate (reduce) are not just list operations — they are a design paradigm. Complex computations become pipelines of simple transformations. Signal processing as a mental model.

**Narration arc:**
1. The signal processing view: data flows through a pipeline of transformers. Each stage does one thing.
2. Sum of squares of odd Fibonacci numbers: `enumerate(1, n)` → `filter(is_odd)` → `map(square)` → `accumulate(+, 0)`.
3. Without the pipeline: a single recursive function mixing enumeration, filtering, mapping, and accumulation. Hard to read, hard to reuse.
4. With the pipeline: each stage is independently testable and reusable.
5. Flatmap: when each element maps to a sequence, we need to flatten the results. This enables Cartesian products and combinations.

**CodeLens moment:** Step through a pipeline computation. Watch the intermediate lists appear on the heap — the output of `map` becomes the input of `filter`. The heap at peak has three lists simultaneously: input, mapped, filtered. This is the memory cost of the pipeline style.

**Challenge:** Express the following as pipelines using `map`, `filter`, `accumulate`, and `flatmap`: (a) all odd squares less than 100, (b) all pairs (i, j) with i + j prime and 1 ≤ j < i ≤ 6, (c) the number of ways to make change for 100 cents using 1, 5, 10, 25, 50 cent coins.

**Connects to:** `sicp-2-2-4` (the picture language applies all of Chapter 2.2 to a domain-specific language)

---

#### Lesson `sicp-2-2-4` — Example: The Picture Language

**Concept:** A domain-specific language for geometric pictures. Painters are functions from frames to drawings. Combinators build complex painters from simple ones. The closure property means any combined painter can be further combined.

**Narration arc:**
1. A painter is a function that draws something in a frame. `wave`, `rogers`, a solid square.
2. `beside(p1, p2)` places two painters side by side. `below(p1, p2)` stacks them.
3. `flip_vert(p)`, `flip_horiz(p)` transform a painter.
4. `right_split`, `up_split`, `corner_split` — recursive painters that create fractal-like patterns.
5. `square_limit` — the classic SICP cover image — built from `corner_split` applied four times.

**CodeLens moment:** Step through `corner_split(wave, 3)` building recursively. Watch each recursive call produce a painter function on the heap — a closure capturing the sub-painters it was built from. The heap graph shows the tree of painter combinations.

**Challenge:** Implement `square_of_four(tl, tr, bl, br)` which takes four transformation functions and applies them to a painter to build a square mosaic. Use it to implement `square_limit`. Then define a new combinator `rotate90` that rotates a painter 90 degrees.

**Connects to:** `sicp-2-3-1` (symbolic data — now we represent symbols, not just numbers and functions)

---

### Section 2.3 — Symbolic Data

---

#### Lesson `sicp-2-3-1` — Quotation and Symbols

**Concept:** Symbols are atomic data that represent themselves — not numbers, not functions, just names. Quotation lets us treat code as data. This is the first step toward programs that manipulate programs.

**Narration arc:**
1. Symbols: `"apple"`, `"x"`, `"plus"`. Strings used as symbolic atoms.
2. `eq_sym(a, b)` tests symbol equality. Unlike numbers, symbols have no arithmetic.
3. The `memq` function: is a symbol in a list? Linear search with `eq_sym`.
4. The difference between a symbol and a value: `"x"` is the symbol x; `x` is whatever x is bound to.
5. Using symbols to represent expressions: `list("plus", "x", 3)` represents `x + 3` as data.

**CodeLens moment:** Step through `memq("b", list("a", "b", "c"))`. Watch the list traversal — the heap shows the list structure being walked. The `eq_sym` call returns false twice, then true, stopping the search.

**Challenge:** Write `count_occurrences(sym, lst)` counting how many times a symbol appears in a list. Write `substitute(lst, old, new_sym)` replacing all occurrences of `old` with `new_sym`. Write `remove_duplicates(lst)` returning a list with each symbol appearing only once.

**Connects to:** `sicp-2-3-2` (symbolic differentiation represents algebraic expressions as lists of symbols)

---

#### Lesson `sicp-2-3-2` — Symbolic Differentiation

**Concept:** Algebraic expressions represented as lists. Differentiation rules implemented as functions that manipulate these representations. A program that does symbolic mathematics — the same thing a computer algebra system does.

**Narration arc:**
1. Represent `x + 3` as `list("plus", "x", 3)`, `2 * x` as `list("times", 2, "x")`.
2. Constructor, selectors, predicates: `make_sum`, `addend`, `augend`, `is_sum`. Abstraction barriers again.
3. The differentiation rules: d(c)/dx = 0, d(x)/dx = 1, d(u+v)/dx = d(u)/dx + d(v)/dx, d(uv)/dx = u*d(v)/dx + v*d(u)/dx.
4. Implement `deriv(expr, variable)` recursively on the expression structure.
5. Simplification: `make_sum(0, x)` should return `x`, not `list("plus", 0, "x")`. Add simplification to constructors.

**CodeLens moment:** Step through `deriv(list("plus", list("times", "x", "x"), list("times", 3, "x")), "x")` — differentiating x² + 3x. Watch the recursive decomposition of the expression tree. The result is built up from the leaves as the recursion unwinds.

**Challenge:** Extend the differentiator to handle exponentiation: `d(uⁿ)/dx = n * u^(n-1) * d(u)/dx`. Add simplification for multiplication by 1 and 0. Then add support for sin and cos: `d(sin(u))/dx = cos(u) * d(u)/dx`.

**Connects to:** `sicp-2-3-3` (sets as another example of data with multiple representations)

---

#### Lesson `sicp-2-3-3` — Sets and Their Representations

**Concept:** A set is an abstract type with operations: `adjoin`, `element_of`, `intersection`, `union`. Three concrete representations — unordered lists, ordered lists, binary trees — trade off simplicity against performance.

**Narration arc:**
1. Set as an abstract type: the interface is what a set does, not how it is stored.
2. Unordered list: simple to implement, O(n) for element lookup.
3. Ordered list: elements in sorted order. `element_of` can stop early — O(n/2) average, same O(n) worst.
4. Binary search tree: balanced tree gives O(log n) operations. But keeping it balanced is extra work.
5. The same interface, three representations. The choice of representation affects performance dramatically.

**CodeLens moment:** Compare `element_of_unordered` vs `element_of_tree` on a set of 100 elements. Use the complexity chart — the unordered version scans linearly, the tree version halves the search space each step. The call tree for tree search is shallow; for list search it is long.

**Challenge:** Implement all three representations completely — constructors, `element_of`, `adjoin`, `intersection`, `union`. Benchmark them by building sets of 10, 100, and 1000 elements and performing 100 lookups each. Plot the results.

**Connects to:** `sicp-2-3-4` (Huffman trees are a specific binary tree application — compression)

---

#### Lesson `sicp-2-3-4` — Huffman Encoding

**Concept:** Huffman encoding compresses data by using shorter codes for more frequent symbols. The encoding is built as a binary tree. Encoding traverses the tree. Decoding traverses it from the other direction.

**Narration arc:**
1. Fixed-length vs variable-length encoding. A 5-symbol alphabet needs 3 bits fixed. Huffman can do better.
2. Huffman trees: leaves are symbols with weights. Internal nodes have combined weights. Frequent symbols are near the root.
3. Building the tree: merge the two lowest-weight items repeatedly. Greedy algorithm.
4. Encoding: traverse the tree, left = 0, right = 1, until you reach the leaf for the symbol.
5. Decoding: read bits, traverse the tree, emit symbol when you reach a leaf, restart from root.

**CodeLens moment:** Step through encoding `"aababca"` using a Huffman tree built from the frequency table. Watch the tree traversal — the heap shows the tree structure. `a` (most frequent) gets a short code; less frequent symbols get longer codes.

**Challenge:** Build a Huffman tree from scratch given an arbitrary frequency table. Implement encoding and decoding. Verify that decoding the encoding of any message returns the original message. Calculate the compression ratio vs 3-bit fixed-length encoding for the sample alphabet.

**Connects to:** `sicp-2-4-1` (multiple representations — what if we need both rectangular and polar complex numbers?)

---

### Section 2.4 — Multiple Representations for Abstract Data

---

#### Lesson `sicp-2-4-1` — Complex Numbers and Two Representations

**Concept:** The same abstract type can have multiple concrete representations simultaneously. Complex numbers can be stored as (real, imaginary) or as (magnitude, angle). Both are valid. Generic selectors dispatch to the right representation.

**Narration arc:**
1. Complex number operations: `add_complex`, `mul_complex`. These are easiest with different representations.
2. Rectangular form: add is easy (`real(z1) + real(z2)`), multiply is harder.
3. Polar form: multiply is easy (`magnitude(z1) * magnitude(z2)`), add is harder.
4. We need both. Define both representations, use each where it is natural.
5. Selectors `real_part`, `imag_part`, `magnitude`, `angle` work on both representations. But how do they know which to use?

**CodeLens moment:** Step through `add_complex(make_from_real_imag(3, 4), make_from_mag_ang(5, 0.927))`. Watch the heap — two objects with different internal structures are treated uniformly by the selectors. The object graph shows them as having the same type label but different internal structure.

**Challenge:** Add a third representation: complex numbers stored as (real, magnitude). Implement all selectors for it. Verify that all arithmetic operations still work correctly with this new representation mixed with the existing two.

**Connects to:** `sicp-2-4-2` (type tags are the mechanism that makes multiple representations work)

---

#### Lesson `sicp-2-4-2` — Tagged Data

**Concept:** Type tags allow a system to dispatch on representation at runtime. A tagged datum is a pair of a type tag and the content. Selectors check the tag and call the right implementation.

**Narration arc:**
1. Attach a tag: `list("rectangular", real, imag)` vs `list("polar", magnitude, angle)`.
2. `type_tag(datum)` extracts the tag, `contents(datum)` extracts the data.
3. Selectors dispatch: `real_part(z)` checks the tag and calls either `real_part_rectangular` or `real_part_polar`.
4. The problem with this: every new representation requires modifying every selector. It does not scale.
5. The additive ideal: adding a new representation should not require modifying existing code.

**CodeLens moment:** Step through the tagged dispatch. Watch the `conditional_branch` event fire in each selector — the tag check. The heap shows the tag as the first element of every complex number. Pattern detection should identify the dispatch pattern.

**Challenge:** Add a third complex number representation (e.g., (real, angle)). Count how many functions you had to modify to add it. This is the cost of the tagged dispatch approach — it motivates data-directed programming.

**Connects to:** `sicp-2-4-3` (data-directed programming solves the modification problem)

---

#### Lesson `sicp-2-4-3` — Data-Directed Programming

**Concept:** Instead of if/else chains on type tags, use a dispatch table — a 2D table keyed on operation name and type tag. Adding a new type means adding new rows to the table, not modifying existing functions. This is the open/closed principle.

**Narration arc:**
1. The operation-type table: rows are types, columns are operations. Each cell is an implementation.
2. `put(op, type, proc)` installs a procedure. `get(op, type)` retrieves it.
3. Each type package installs itself: the rectangular package calls `put` for each of its operations.
4. Generic selectors use `get` to look up and apply the right implementation.
5. Adding a new type: write the package, call `put` for each operation. Nothing else changes. This is additive.

**CodeLens moment:** Step through `install_rectangular_package()` and `install_polar_package()`. Watch the dispatch table fill up in the heap — it is a hash map of maps. Then step through `real_part(z)` — it calls `get`, retrieves the right function from the table, and applies it.

**Challenge:** Add a new operation `conjugate(z)` (negate the imaginary part) to the data-directed complex number system. You should only need to modify the two type packages — not the generic selector layer. Verify this by counting the functions touched.

**Connects to:** `sicp-2-5-1` (generic arithmetic — apply the same pattern to a full numeric tower)

---

### Section 2.5 — Systems with Generic Operations

---

#### Lesson `sicp-2-5-1` — Generic Arithmetic

**Concept:** A complete numeric tower — ordinary numbers, rational numbers, complex numbers — with a single `add`, `mul`, `sub`, `div` that works on all of them. Data-directed dispatch makes this possible without any function knowing about the others.

**Narration arc:**
1. The numeric tower: integers ⊂ rationals ⊂ reals ⊂ complex. Operations should work at any level.
2. Install each type as a package: `install_javascript_number_package`, `install_rational_package`, `install_complex_package`.
3. Generic `add(x, y)` looks up `add` in the dispatch table for the type of x.
4. The problem: `add(3, make_rat(1, 2))` — what is the type of `3 + 1/2`? Types must be coerced.
5. The tower of coercions: integer → rational → real → complex. Promote the lower type before operating.

**CodeLens moment:** Step through `add(make_complex_from_real_imag(3, 0), make_rat(1, 2))`. Watch the type coercion — the rational is promoted to a complex number before the operation runs. The heap shows both representations simultaneously.

**Challenge:** Add support for a `polynomial` type — polynomials in x with rational coefficients. Implement `add_poly` and `mul_poly`. The coefficients should themselves use the generic arithmetic system, so `add` of polynomial coefficients uses the same `add` that works on all other types.

**Connects to:** `sicp-3-1-1` (Chapter 3 introduces state — the table in data-directed programming is itself a mutable data structure)

---

## Chapter 3 — Modularity, Objects, and State

> **The chapter question:** What happens when things can change?
>
> Chapters 1 and 2 were purely functional — no mutation, no state. Chapter 3 introduces assignment (`=`) and asks: what does this cost us? The answer is that reasoning about programs becomes dramatically harder. The environment model replaces the substitution model. Objects have identity over time. Concurrency becomes possible and dangerous.

---

### Section 3.1 — Assignment and Local State

---

#### Lesson `sicp-3-1-1` — Local State Variables

**Concept:** Assignment creates objects with persistent state. A counter that increments each time it is called. A bank account that remembers its balance. The function no longer returns the same value for the same call — it depends on history.

**Narration arc:**
1. `make_counter()` returns a function that increments and returns a count each time called.
2. `let count = 0` inside a function, with `count = count + 1` in the returned function. This is mutation.
3. Two counters are independent — each has its own `count` variable.
4. The substitution model breaks: `counter()` is called twice — same expression, different values. Substitution cannot model time.
5. The environment model is necessary: the function closes over a mutable binding, not just a value.

**CodeLens moment:** Step through two calls to the same counter. Watch the heap — the counter function is one object, its closure contains a mutable binding for `count`. The `variable_assign` event fires each call, updating the binding. The second call returns 2, not 1.

**Challenge:** Implement `make_accumulator(n)` that returns a function which accumulates a sum, starting from n. Each call adds its argument to the running sum and returns the new total. Implement `make_monitored(f)` that wraps f and tracks how many times it has been called, allowing `"how many calls?"` as a special argument.

**Connects to:** `sicp-3-1-2` (benefits of assignment — modeling identity over time)

---

#### Lesson `sicp-3-1-2` — The Benefits of Assignment

**Concept:** Assignment enables modeling of systems with state. A bank account, a random number generator, a simulation object. Without assignment we would need to pass state explicitly everywhere — this is sometimes cleaner, sometimes not.

**Narration arc:**
1. `make_account(balance)` — a bank account object with `deposit`, `withdraw`, and `balance` methods.
2. Message passing: the account returns different functions based on the message string received.
3. `rand` — a stateful random number generator using `rand_update`. Each call returns a new pseudorandom value.
4. Monte Carlo simulation using `rand` — estimate π by checking if random points fall inside the unit circle.
5. The assignment approach vs the functional approach. The assignment version is more modular for objects that naturally have identity.

**CodeLens moment:** Step through a Monte Carlo π estimation. Watch `rand` — the heap shows its state variable changing with each call. The `variable_assign` event fires repeatedly. The object graph shows the rand closure holding a mutable binding.

**Challenge:** Implement `make_joint(account, password, new_password)` which creates a new account object that shares the balance of the original account but requires a different password. Then implement a statistics tracker that records the min, max, mean, and running variance of values it receives.

**Connects to:** `sicp-3-1-3` (costs of assignment — the loss of referential transparency)

---

#### Lesson `sicp-3-1-3` — The Costs of Assignment

**Concept:** Assignment destroys referential transparency — you can no longer replace an expression with its value freely. The same expression can return different values. This makes reasoning about programs much harder.

**Narration arc:**
1. Referential transparency: `f(x) + f(x) = 2 * f(x)` if f is pure. False if f has state.
2. `let D1 = make_decrementer(25); let D2 = make_decrementer(25)` — D1 and D2 are interchangeable. Pure functions.
3. `let W1 = make_simplified_withdraw(25); let W2 = make_simplified_withdraw(25)` — W1 and W2 are NOT interchangeable after the first call. Stateful objects.
4. The sameness problem: are W1 and W2 the "same"? Only if they have the same identity — point to the same object. This is reference equality vs value equality.
5. The trade-off: assignment gives us modularity and modeling power. It costs us equational reasoning.

**CodeLens moment:** Step through `W1(10)` then `W1(10)` vs `W2(10)` then `W2(10)`. Two different objects with the same initial state diverge after the first call. The heap shows them as two separate objects — same structure, different identities.

**Challenge:** Trace through the "sameness" puzzle from SICP: Peter has $100 in an account. Paul has an account sharing the same balance. Peter withdraws $50. Paul checks his balance. What does he see — and why? Implement this scenario and step through it in CodeLens.

**Connects to:** `sicp-3-2-1` (the environment model replaces substitution to correctly model stateful programs)

---

### Section 3.2 — The Environment Model

---

#### Lesson `sicp-3-2-1` — Environment Structure

**Concept:** An environment is a sequence of frames. Each frame is a table of name-value bindings. The environment model replaces the substitution model and correctly handles mutation, closures, and object identity.

**Narration arc:**
1. A frame is a table of bindings. An environment is a frame plus a pointer to an enclosing environment.
2. The global environment is the outermost frame — it holds all top-level names.
3. Name lookup: search the current frame, then the enclosing frame, up to global. First match wins.
4. A closure is a function value plus the environment in which it was created.
5. This is not a new idea — it is what CodeLens has been showing all along in the scope chain panel.

**CodeLens moment:** Open the scope chain panel and navigate through several levels of nested functions. See each frame as a horizontal slice. Each closure in the heap has an arrow pointing to the frame it captured. The environment structure IS the scope chain.

**Challenge:** Draw (on paper) the complete environment structure at the moment when `make_account(100)` returns — showing the global frame, the frame created by calling `make_account`, and the three closure objects created for deposit, withdraw, and dispatch. Then verify by stepping through it in CodeLens.

**Connects to:** `sicp-3-2-2` (applying functions creates new frames — the full application rule)

---

#### Lesson `sicp-3-2-2` — Applying Functions in the Environment Model

**Concept:** Applying a function creates a new frame extending the function's closure environment (not the caller's environment). This is the full rule. It explains closures, it explains dynamic binding vs lexical binding, it explains everything about how function calls work.

**Narration arc:**
1. To apply a closure: create a new frame, bind parameters to arguments in it, extend the closure's environment with the new frame, evaluate the body in this new environment.
2. Work through `square(5)` in the environment model — a new frame with x=5, extending global.
3. Work through `sum_of_squares(3, 4)` — two levels of new frames.
4. The key: the new frame extends the closure's environment, NOT the caller's environment. Lexical scope.
5. This explains why inner functions see their enclosing scope — they were created in it.

**CodeLens moment:** Step through a function call and watch the scope chain panel. A new frame appears at the top. It extends the frame that was current when the function was DEFINED — not when it was CALLED. The distinction is what makes closures work.

**Challenge:** Predict (without running) the output of a program with three levels of nested closures where each level captures a variable from the enclosing level. Draw the environment diagram. Then verify with CodeLens.

**Connects to:** `sicp-3-2-3` (frames as local state — closures are objects)

---

#### Lesson `sicp-3-2-3` — Frames as Local State

**Concept:** A closure is an object. The frame it closes over is its instance state. `make_account` creates a closure over a `balance` frame — that frame IS the account's state. Object-oriented programming is just the environment model seen differently.

**Narration arc:**
1. `make_counter` — the closure over `count` IS the counter. The frame holds the state.
2. Each call to `make_counter` creates a new frame, a new closure, a new independent counter.
3. The bank account: three closures (deposit, withdraw, dispatch) all close over the same frame. They share state because they share a frame.
4. This is what OOP means by "encapsulation" — data hidden inside the closure, accessible only through the provided functions.
5. Object identity is frame identity — W1 and W2 are different because they close over different frames.

**CodeLens moment:** Step through `make_account(100)` and watch the heap. Three closure objects are created, all with their environment pointer pointing to the same frame. That frame contains `balance`. This is the object. The closures are the methods.

**Challenge:** Implement an object system without using `class` — only closures and dispatch functions. Create `make_point(x, y)` with methods `get_x()`, `get_y()`, `move(dx, dy)` (mutation), and `distance_to(other_point)`. All state in a closed-over frame.

**Connects to:** `sicp-3-3-1` (mutable data structures — mutation of list structure, not just bindings)

---

### Section 3.3 — Modeling with Mutable Data

---

#### Lesson `sicp-3-3-1` — Mutable Lists

**Concept:** `set_head` and `set_tail` mutate pair structure — not just variable bindings, but the data itself. This enables efficient in-place algorithms and new data structures, but creates sharing and aliasing problems.

**Narration arc:**
1. `set_head(pair, value)` and `set_tail(pair, value)` — mutate the elements of a pair.
2. The difference between binding mutation (`x = x + 1`) and structure mutation (`set_head(p, 5)`).
3. Aliasing: two names pointing to the same pair. Mutating through one name changes what the other sees.
4. `append` vs `append!` (destructive append) — same result, very different behavior with shared structure.
5. Cycles: `set_tail(z, z)` creates a pair pointing to itself. `length` would loop forever.

**CodeLens moment:** Step through `append!` on two lists that share a tail. Watch the heap mutation — `object_mutate` events fire as the pair structure changes. The object graph shows the structural change in real time. Then create an accidentally circular list and watch what happens.

**Challenge:** Implement `make_queue` using mutable pairs — a queue that supports `enqueue`, `dequeue`, and `is_empty` in O(1) each. The trick is maintaining both a front pointer and a rear pointer. Use mutation to update the rear when enqueuing.

**Connects to:** `sicp-3-3-2` (queues as a formal data structure built on mutable pairs)

---

#### Lesson `sicp-3-3-2` — Queues

**Concept:** A queue is a sequence with O(1) insert at the rear and O(1) delete from the front. Implemented with a front pointer and a rear pointer into a shared mutable list. Procedural representation of a data structure.

**Narration arc:**
1. The queue interface: `make_queue`, `enqueue!`, `dequeue!`, `front_queue`, `empty_queue?`.
2. The representation: a pair of pointers — front and rear — into a list.
3. Enqueue: set the tail of the current rear to a new pair, advance the rear pointer.
4. Dequeue: advance the front pointer. The old front becomes garbage.
5. The edge case: dequeue from a single-element queue must update both pointers.

**CodeLens moment:** Enqueue three items then dequeue two. Watch the heap at each step — the front and rear pointers are visible as named arrows. The dequeued pairs are still in memory until GC. The `object_gc` event fires when they become unreachable.

**Challenge:** Implement `make_deque` — a double-ended queue supporting `enqueue_front!`, `enqueue_rear!`, `dequeue_front!`, and `dequeue_rear!` all in O(1). This requires doubly-linked pairs (each node pointing both forward and backward).

**Connects to:** `sicp-3-3-3` (tables as associative mutable data structures)

---

#### Lesson `sicp-3-3-3` — Tables

**Concept:** A table is a mutable associative data structure — a list of key-value pairs supporting lookup and insertion. One-dimensional and two-dimensional tables. The dispatch table used in data-directed programming was a table.

**Narration arc:**
1. A table as a list of `list(key, value)` pairs with a special `list("*table*")` header.
2. `lookup(key, table)`: scan the association list for a matching key.
3. `insert!(key, value, table)`: prepend a new pair to the table's list.
4. Two-dimensional tables: keys are pairs. `lookup(key1, key2, table)` finds the subtable for key1, then looks up key2 within it.
5. Creating local tables: `make_table` returns an object with `lookup` and `insert` methods closing over a private table.

**CodeLens moment:** Build the two-dimensional operation/type dispatch table from section 2.4.3 using this table implementation. Step through `get("real_part", "rectangular")` and watch it navigate two levels of tables.

**Challenge:** Implement a memoization function `memoize(f)` that wraps f and caches its results in a table. The first call with any argument computes and caches the result; subsequent calls return the cached value. Use it to memoize Fibonacci and measure the improvement.

**Connects to:** `sicp-3-3-4` (digital circuit simulation applies all of 3.3 to a complex simulation problem)

---

#### Lesson `sicp-3-3-4` — Digital Circuit Simulation

**Concept:** A complete event-driven simulation of digital logic circuits. Wires carry signals. Gates have delays. The agenda is a time-ordered queue of pending events. This is how hardware simulators and discrete event simulations work.

**Narration arc:**
1. Wires: `make_wire`. Each wire has a signal value and a list of action procedures to call when it changes.
2. Gates: `and_gate`, `or_gate`, `inverter`. Each schedules a delayed signal change on the output wire.
3. The agenda: a time-ordered list of `(time, action)` pairs. `add_to_agenda!` inserts in order. `propagate` runs actions in time order.
4. Assembling a circuit: connect wires and gates. Call `propagate`. Watch signals ripple through.
5. A half-adder and full-adder built from primitive gates — the agenda correctly handles propagation delays.

**CodeLens moment:** Step through the propagation of a signal through a half-adder. Watch the agenda in the heap — it is a sorted list of pending actions. Each `propagate` step dequeues the next action, runs it, and potentially adds more. The simulation advances in simulated time.

**Challenge:** Build a ripple-carry adder from full-adders and simulate adding two 4-bit binary numbers. Measure the total propagation delay. Then implement a carry-lookahead adder and compare the delay — this is the same trade-off real CPU designers make.

**Connects to:** `sicp-3-4-1` (concurrency — multiple processes sharing state, like multiple wires in a circuit)

---

### Section 3.4 — Concurrency

---

#### Lesson `sicp-3-4-1` — Time and Shared State

**Concept:** Concurrency is multiple processes sharing mutable state. The fundamental problem: interleaving of operations creates outcomes that no single sequential execution could produce. Race conditions.

**Narration arc:**
1. Two processes both incrementing a counter: read, add 1, write. If interleaved, both can read the same value and write the same result — the counter is incremented only once.
2. Correct concurrent behavior depends on atomicity: some operations must not be interrupted.
3. The deposit/withdrawal problem: concurrent deposit and withdrawal to the same account.
4. Commutativity is not enough: even if the operations are individually correct, their interleaving may not be.
5. Any program using shared mutable state and concurrency must address this problem.

**CodeLens moment:** Simulate a race condition by interleaving two processes step by step manually (CodeLens allows stepping individual processes). Watch the same shared balance variable being read by both processes before either writes — the lost update is visible.

**Challenge:** Enumerate all possible interleavings of two concurrent processes: one increments a counter twice, one increments it once. Which interleavings give the correct result (counter incremented by 3)? Which give wrong results?

**Connects to:** `sicp-3-4-2` (serialization prevents the bad interleavings)

---

#### Lesson `sicp-3-4-2` — Mechanisms for Controlling Concurrency

**Concept:** Serializers ensure that only one process at a time executes a protected procedure. Mutexes are the underlying mechanism. Proper use of serializers prevents race conditions. Improper use creates deadlock.

**Narration arc:**
1. A serializer: `make_serializer()` returns a function that takes a procedure and returns a protected version.
2. Protected procedures in the same serializer set cannot overlap — one must complete before the other starts.
3. Serializing the bank account: the protected `deposit` and `withdraw` cannot interleave with each other.
4. The exchange problem: two accounts being balanced requires holding both serializers simultaneously. But acquiring serializers one at a time can deadlock.
5. Deadlock: process A holds serializer 1 and wants 2; process B holds 2 and wants 1. Neither can proceed.

**CodeLens moment:** Step through a serialized exchange operation. Watch the mutex state in the heap — when one process holds the serializer, the other's protected procedure blocks (shown as a pending event in the agenda). No interleaving is possible.

**Challenge:** Implement `make_serializer` using a mutex. Implement `make_mutex` using a test-and-set atomic operation. Write the exchange procedure that correctly acquires both serializers without deadlock — the solution requires ordering serializer acquisition by account number.

**Connects to:** `sicp-4-1-1` (Chapter 4 — the evaluator is just another program, now we build one)

---

## Chapter 4 — Metalinguistic Abstraction

> **The chapter question:** How do programming languages work?
>
> Chapter 4 is the payoff of the whole book. We build an evaluator for a subset of JavaScript — a program that takes a program as data and evaluates it. This is the metacircular evaluator. Then we modify it to implement lazy evaluation, nondeterminism, and logic programming. Each modification takes a few dozen lines because we own the evaluator.

---

### Section 4.1 — The Metacircular Evaluator

---

#### Lesson `sicp-4-1-1` — The Core Evaluator: eval and apply

**Concept:** `evaluate` dispatches on expression type. `apply` handles function application. Together they form a complete evaluator. The mutual recursion between evaluate and apply is the heart of every programming language runtime.

**Narration arc:**
1. The evaluator is just a JavaScript program that takes an expression (as a data structure) and an environment and returns a value.
2. `evaluate(exp, env)`: dispatch on the type of exp. Literal → return value. Name → lookup in env. Combination → evaluate operator and operands, then apply.
3. `apply(fun, args)`: if primitive, apply directly. If compound, create a new environment extending the function's closure, evaluate the body.
4. The mutual recursion: `evaluate` calls `apply`, `apply` calls `evaluate`. This loop IS the execution engine.
5. This is the same eval/apply pair CodeLens implements. We have been using a metacircular evaluator all along.

**CodeLens moment:** Step through the evaluator evaluating a simple function call. Watch the mutual recursion — `evaluate` calls `apply` which calls `evaluate` for each argument and for the body. The call stack grows with each level of the mutual recursion. The evaluator IS what we have been looking at from the inside.

**Challenge:** Add support for `let` expressions to the metacircular evaluator. A `let` is syntactic sugar — `let x = val in body` is equivalent to `((x) => body)(val)`. Transform `let` to a lambda application in `evaluate` before evaluating.

**Connects to:** `sicp-4-1-2` (representing expressions — the data structures the evaluator operates on)

---

#### Lesson `sicp-4-1-2` — Representing Expressions

**Concept:** The evaluator needs to recognize and decompose expressions. Predicates and selectors for each expression type. Abstract syntax: the evaluator's view of program structure, independent of surface syntax.

**Narration arc:**
1. Is the expression a literal? A name? A conditional? A function definition? A combination?
2. Predicates: `is_literal(exp)`, `is_name(exp)`, `is_if(exp)`, `is_lambda(exp)`, `is_application(exp)`.
3. Selectors: `if_predicate(exp)`, `if_consequent(exp)`, `if_alternative(exp)`.
4. Constructors: used in transformations like `let` → lambda.
5. The abstract syntax is the AST that the parser produces — the evaluator operates on what we have been seeing in CodeLens all along.

**CodeLens moment:** Step through parsing `if (x > 0) { return x; } else { return -x; }` and look at the AST panel. The AST nodes match exactly the predicates and selectors the evaluator uses. The evaluator IS an AST walker.

**Challenge:** Add `cond` (a multi-way conditional) to the evaluator. A `cond` expression is a list of clauses, each with a predicate and a consequent. Transform it to nested if expressions before evaluating.

**Connects to:** `sicp-4-1-3` (the environment data structures — how the evaluator represents environments)

---

#### Lesson `sicp-4-1-3` — Evaluator Data Structures

**Concept:** Environments in the evaluator are represented as lists of frames. This is the explicit data structure for what CodeLens has been showing in the scope chain panel all along.

**Narration arc:**
1. A frame is a pair of lists: a list of names and a list of values. (Or a Map from names to values.)
2. An environment is a list of frames — the head is the current frame, the tail is the enclosing environment.
3. `lookup_variable(name, env)`: scan frames from innermost to outermost. First match wins.
4. `define_variable!(name, val, env)`: add to the current frame.
5. `set_variable!(name, val, env)`: find the frame containing the name, mutate it.

**CodeLens moment:** Step through `lookup_variable` on a name that is bound in an outer scope. Watch it scan past the current frame, find it in the enclosing frame. The scope chain panel shows the same thing — the evaluator implements exactly what CodeLens visualizes.

**Challenge:** Modify the evaluator to detect and report a useful error when a variable is used before it is defined (rather than just returning undefined or crashing). Then implement `scan_out_defines` — transform function bodies so internal `const` declarations are moved to the front.

**Connects to:** `sicp-4-1-4` (running the evaluator — the read-eval-print loop)

---

#### Lesson `sicp-4-1-4` — Running the Evaluator

**Concept:** The read-eval-print loop (REPL) is the interactive interface to the evaluator. The evaluator is now a complete system. We test it by running programs within it. A program running in the evaluator, running in CodeLens, is three levels of evaluation simultaneously.

**Narration arc:**
1. The driver loop: read an expression string, parse it to an AST, evaluate in the global environment, print the result, repeat.
2. The global environment: pre-loaded with primitive operations (+, -, *, /, console.log, etc.).
3. Testing the evaluator with increasingly complex programs: arithmetic, functions, recursion, closures.
4. The metacircular nature: the evaluator is a JavaScript program. It can evaluate itself — if you pass the evaluator's source to the evaluator, it evaluates a copy of itself.
5. This is what SICP means by metalinguistic abstraction — building a language by building its evaluator.

**CodeLens moment:** Step through the evaluator evaluating `factorial(5)` where `factorial` is defined inside the evaluator's language. You are watching a JavaScript interpreter running a JavaScript interpreter running a recursive function. Three levels of execution visible in one CodeLens session.

**Challenge:** Add tail-call optimization to the evaluator. A recursive process expressed with tail calls should run in constant stack space. Implement this by detecting tail position and returning a thunk instead of calling recursively.

**Connects to:** `sicp-4-2-1` (lazy evaluation — change when arguments are evaluated to enable infinite data structures)

---

### Section 4.2 — Variations on a Scheme

---

#### Lesson `sicp-4-2-1` — Lazy Evaluation

**Concept:** Change the evaluator to use normal order (lazy) evaluation instead of applicative order. Arguments are not evaluated until their values are actually needed. This enables infinite data structures and some powerful programming patterns.

**Narration arc:**
1. In applicative order, all arguments are evaluated before the function body runs.
2. In normal order, arguments are wrapped in thunks — unevaluated expressions plus their environment.
3. A thunk is forced (evaluated) only when its value is actually needed.
4. Memoization: force a thunk once, cache the result. Subsequent forces return the cached value.
5. Infinite streams: `ones = pair(1, () => ones)` — a list that produces 1s forever. Each tail is a thunk that generates the next element on demand.

**CodeLens moment:** Step through accessing the 5th element of an infinite stream of integers. Watch the heap — each thunk is an object containing an unevaluated expression. As elements are demanded, thunks are forced and replaced with their values. Only the needed elements are ever computed.

**Challenge:** Implement `stream_filter`, `stream_map`, and `stream_take(n, stream)` for lazy streams. Generate the infinite stream of prime numbers using the Sieve of Eratosthenes on streams. Take the first 20 primes.

**Connects to:** `sicp-4-3-1` (nondeterministic evaluation — the amb operator enables search)

---

#### Lesson `sicp-4-3-1` — Nondeterministic Evaluation and Amb

**Concept:** `amb` is a special form that nondeterministically chooses one of its arguments. If the program later fails, `amb` backtracks and tries another choice. This enables constraint solving and search expressed as ordinary programs.

**Narration arc:**
1. `amb(1, 2, 3)` returns 1, 2, or 3 — the evaluator explores all possibilities.
2. `require(condition)` fails (triggers backtracking) if the condition is false.
3. Pythagorean triples: `let a = amb(1,...,20); let b = amb(1,...,20); require(a*a + b*b === c*c)`.
4. The evaluator maintains a stack of continuation points — where to resume when backtracking.
5. This is a complete search procedure expressed as a program. The evaluator does the searching.

**CodeLens moment:** Step through a simple amb search — finding two numbers that sum to 10 from a small set. Watch the evaluator backtrack: it takes a first choice, evaluates the require, fails, backtracks, tries the next choice. The search is visible as the call stack rewinding.

**Challenge:** Use amb to solve the "Baker, Cooper, Fletcher, Miller, Smith" logic puzzle from SICP — five people on five floors with constraints about who is adjacent to whom. Express the constraints as `require` statements. The evaluator finds the solution.

**Connects to:** `sicp-5-1-1` (Chapter 5 — how does a CPU execute the evaluator? Register machines.)

---

## Chapter 5 — Computing with Register Machines

> **The chapter question:** How does a computer execute programs?
>
> Chapter 5 descends to the hardware level. Register machines model real CPUs. We compile the metacircular evaluator to register machine instructions. The complete chain: JavaScript source → AST → evaluator → register machine → hardware. This is what happens inside the computer for every program ever run.

---

### Section 5.1 — Register Machine Design

---

#### Lesson `sicp-5-1-1` — Register Machines

**Concept:** A register machine has a fixed set of registers, a controller (a sequence of instructions), and operations. This is the abstract model of a CPU. Real CPUs are register machines with many registers and a large instruction set.

**Narration arc:**
1. Registers hold values. Operations read from and write to registers. The controller sequences operations.
2. A GCD machine: two registers `a` and `b`. Instructions: test, branch, assign.
3. The data path: a diagram of registers and operations and which connect to which.
4. The controller: a sequence of labels and instructions. The program counter tracks position.
5. The GCD machine described in the SICP register machine language — a formal description of hardware.

**CodeLens moment:** Simulate the GCD register machine running on input (206, 40). Each instruction is one step. Watch the registers `a` and `b` change. The call stack has one frame — the machine has no concept of function calls yet.

**Challenge:** Design a register machine for factorial. You will need a stack because factorial is recursive — the machine must save register values before recursive calls. Draw the data path diagram before implementing.

**Connects to:** `sicp-5-1-2` (the controller design — how to sequence instructions for a complex algorithm)

---

#### Lesson `sicp-5-1-2` — The Register Machine Simulator

**Concept:** We can simulate any register machine in JavaScript. The simulator interprets the machine description. This is another metacircular moment — a simulator is an evaluator for a machine description language.

**Narration arc:**
1. The machine description language: `assign`, `test`, `branch`, `goto`, `save`, `restore`, `perform`.
2. `make_machine(registers, operations, controller)` builds a machine from its description.
3. `start(machine)` runs the machine until it halts.
4. `get_register_contents` and `set_register_contents` inspect and set register values.
5. The simulator itself is about 150 lines of JavaScript — straightforward but instructive.

**CodeLens moment:** Step through the simulator executing a GCD machine description. Two levels: the simulator (JavaScript code stepping through instructions) and the machine (the described machine's registers changing). The simulator is the evaluator; the machine description is the program.

**Challenge:** Instrument the simulator to count how many instructions are executed for each operation type. Run the Fibonacci machine and analyze which instructions dominate. This is what a CPU performance profiler measures.

**Connects to:** `sicp-5-3-1` (memory — how does the machine represent and manage its data?)

---

### Section 5.3 — Storage and Garbage Collection

---

#### Lesson `sicp-5-3-1` — Memory Representation

**Concept:** Pairs — the foundation of all data in our system — must be stored in memory. Each pair occupies two memory cells: one for the head, one for the tail. Memory is a flat array. Pairs are indexes into this array.

**Narration arc:**
1. Memory as two arrays: `the_heads` and `the_tails`. A pair is an index n — `the_heads[n]` is head, `the_tails[n]` is tail.
2. Values are tagged: a value is either a number, a boolean, a symbol, or a pair index.
3. `cons` allocates the next available index. `free` tracks the next free cell.
4. This is how Lisp/Scheme implemented pairs on real hardware in the 1960s.
5. Memory is finite. When `free` reaches the end of the arrays, we need garbage collection.

**CodeLens moment:** Build a list of 5 elements and watch the memory arrays fill up. The heap visualization in CodeLens is a friendly view of what is actually two raw arrays. Step through `cons` — it writes to the head and tail arrays and increments `free`.

**Challenge:** Implement the entire pair system — `cons`, `car`, `cdr`, `is_pair`, `is_null` — using only two JavaScript arrays and an integer counter. No JavaScript objects or arrays inside the pairs. Build a linked list and traverse it using only your array-based primitives.

**Connects to:** `sicp-5-3-2` (when memory fills up, garbage collection reclaims unused cells)

---

#### Lesson `sicp-5-3-2` — Garbage Collection

**Concept:** Stop-and-copy garbage collection: traverse all reachable objects starting from the roots, copy them to a new memory area, update all pointers, then swap. The old memory is now free. No leaks, no manual memory management.

**Narration arc:**
1. Reachable objects: anything you can reach by following pointers from the registers and the stack.
2. Unreachable objects: orphaned data that no living reference points to. They can be freed.
3. Stop-and-copy: use two memory halves. Copy all reachable objects from the working half to the free half. Flip.
4. The Cheney algorithm: use the to-space itself as a queue for the copying scan. Elegant and cache-friendly.
5. After GC: all live data is in the new half, compacted. All references updated. The old half is completely free.

**CodeLens moment:** Step through a garbage collection cycle. The heap visualization shows objects in working memory. As GC runs, watch objects being copied — green for copied (reachable), fading for unreachable. After GC the object graph is compacted and the `object_gc` events fire for everything unreachable.

**Challenge:** Implement mark-and-sweep GC as an alternative to stop-and-copy. Mark: traverse reachable objects and mark them. Sweep: scan all memory, free unmarked objects. Compare: stop-and-copy uses 2x memory but compacts. Mark-and-sweep uses 1x memory but fragments.

**Connects to:** `sicp-5-4-1` (the explicit-control evaluator runs our language on a register machine)

---

### Section 5.4 — The Explicit-Control Evaluator

---

#### Lesson `sicp-5-4-1` — The Explicit-Control Evaluator

**Concept:** Translate the metacircular evaluator to register machine instructions. The result is an explicit-control evaluator — the metacircular evaluator running on a register machine. This is a real implementation of a programming language.

**Narration arc:**
1. The metacircular evaluator's `evaluate` and `apply` become sequences of register machine instructions.
2. Recursive calls become explicit saves and restores on the stack — no JavaScript call stack needed.
3. The `exp` register holds the current expression. The `env` register holds the current environment. The `val` register holds the last computed value.
4. The `continue` register holds the label to jump to after the current operation completes — the explicit continuation.
5. The entire evaluator is about 700 instructions — every line is understandable from what we have built.

**CodeLens moment:** Step through the explicit-control evaluator evaluating `(2 + 3) * 4`. Watch the explicit saves and restores — the `save` instruction pushes to the machine stack, `restore` pops. The machine's stack is the call stack we have been watching all along, made explicit.

**Challenge:** Trace through the explicit-control evaluator executing a recursive `factorial(3)`. Map each register machine instruction back to the corresponding step in the metacircular evaluator. Every instruction should be explainable in terms of what the high-level evaluator was doing.

**Connects to:** `sicp-5-4-2` (compilation — instead of interpreting the AST, translate it to instructions directly)

---

#### Lesson `sicp-5-4-2` — Compilation

**Concept:** A compiler translates source code to register machine instructions directly — without the runtime overhead of interpretation. The compiled code does the same work as the interpreter but faster, because the dispatch overhead happens once at compile time.

**Narration arc:**
1. The interpreter dispatches on expression type at runtime for every expression, every time.
2. The compiler does this dispatch at compile time — it knows the expression type and generates only the instructions needed.
3. `compile(exp, target, linkage)` — compile `exp` to instructions that put the result in `target` and then jump to `linkage`.
4. Compiling a combination: compile the operator, compile each argument, emit an `apply` instruction.
5. The open coding optimization: if the operator is a known primitive (+, -, *, /), emit direct arithmetic instructions instead of a generic apply.

**CodeLens moment:** Compile `factorial` to register machine instructions and read the output. Each source construct has become a sequence of register operations. The compiler has made explicit every implicit step the interpreter was doing dynamically.

**Challenge:** Extend the compiler to optimize tail calls — when a call is in tail position, do not save the current continuation. The compiled tail-recursive factorial should run in constant stack space. Verify by running it with n=1000.

---

#### Lesson `sicp-5-4-3` — The Full Picture

**Concept:** Synthesis. The complete chain from source code to hardware is now visible. This lesson connects every concept from the whole book into one diagram.

**Narration arc:**
1. Source text → Parser → AST (Chapter 1, and what CodeLens shows in the AST panel).
2. AST → Evaluator → Result (Chapters 1–3, what CodeLens steps through in execution mode).
3. AST → Compiler → Register machine instructions (Chapter 5).
4. Register machine instructions → Simulator → Execution (Chapter 5, and what real CPUs do).
5. The heap, the stack, the environment chain, the call stack, the GC — all of these appeared in CodeLens from day one. Now we know exactly what they are and how they work.

**CodeLens moment:** Open CodeLens on the metacircular evaluator itself evaluating a simple expression. You are watching JavaScript execute a JavaScript evaluator evaluating JavaScript. The AST panel shows the evaluator's AST. The call stack shows the evaluator's calls. The heap shows the evaluator's environment structures. Everything is visible at once.

**Challenge:** There is no single challenge for this lesson. The challenge is the book. Read the metacircular evaluator from Chapter 4 in full. Read the register machine description of `eval` from Chapter 5 in full. Trace a single function call through all five levels: source → AST → metacircular eval → register machine → memory. That trace IS the answer to "how does a computer work?"

---

## Appendix — Lesson Summary Table

| ID | Title | Key Concept | Challenge |
|---|---|---|---|
| sicp-1-1-1 | Expressions and Evaluation | Recursive evaluation rule | Predict and verify nested expressions |
| sicp-1-1-2 | Naming and the Environment | const, environment as memory | Geometry with only named values |
| sicp-1-1-3 | Evaluating Combinations | Recursive evaluation, special forms | Trace evaluation order by hand |
| sicp-1-1-4 | Compound Functions | Functions as abstraction | cube, sum_of_cubes, hypotenuse_3d |
| sicp-1-1-5 | The Substitution Model | Applicative vs normal order | Hand-trace substitution, verify |
| sicp-1-1-6 | Conditionals and Predicates | Branching, boolean operators | sign, in_range, clamp |
| sicp-1-1-7 | Square Roots by Newton's Method | Iterative improvement, convergence | Relative tolerance sqrt |
| sicp-1-1-8 | Functions as Black Boxes | Block structure, lexical scope | cube_root with configurable tolerance |
| sicp-1-2-1 | Linear Recursion and Iteration | Process shape vs procedure shape | Recursive and iterative sum_integers |
| sicp-1-2-2 | Tree Recursion | Exponential processes, Fibonacci | Count fib(1) calls, track redundancy |
| sicp-1-2-3 | Orders of Growth | Θ notation, comparing processes | Predict Big-O without running |
| sicp-1-2-4 | Exponentiation | O(log n) via successive squaring | fast_power_iter, fibonacci_fast |
| sicp-1-2-5 | Greatest Common Divisors | Euclid's algorithm, logarithmic | Prove termination, implement lcm |
| sicp-1-2-6 | Prime Testing | Trial division vs Fermat test | Miller-Rabin primality test |
| sicp-1-3-1 | Functions as Arguments | Abstracting summation patterns | product, factorial, wallis_pi |
| sicp-1-3-2 | Lambda Functions and Let | Closures, let as lambda | compose, rewrite with arrow functions |
| sicp-1-3-3 | Functions as General Methods | Half-interval search, fixed points | Fixed point of cos, Newton sqrt |
| sicp-1-3-4 | Functions as Returned Values | Function transformers, deriv | nth_root via fixed_point |
| sicp-2-1-1 | Rational Numbers | Constructor/selector abstraction | sub_rat, equal_rat |
| sicp-2-1-2 | Abstraction Barriers | Layers, GCD in make_rat | distance with procedural pairs |
| sicp-2-1-3 | What Is Data? | Data as behavior, procedural pairs | Point abstraction on closures |
| sicp-2-2-1 | Sequences and Lists | Pairs as lists, map | filter, reduce, flatmap, prime pairs |
| sicp-2-2-2 | Hierarchical Structures | Trees as nested pairs | tree_map, deep_reverse |
| sicp-2-2-3 | Sequences as Interfaces | Pipelines, signal processing | Odd squares, prime pairs, change |
| sicp-2-2-4 | The Picture Language | DSL, closure property, painters | square_of_four, square_limit |
| sicp-2-3-1 | Quotation and Symbols | Symbols as data | count_occurrences, substitute |
| sicp-2-3-2 | Symbolic Differentiation | Expressions as data, recursion | Extend with exponentiation, trig |
| sicp-2-3-3 | Sets and Representations | Same interface, different costs | All three set implementations |
| sicp-2-3-4 | Huffman Encoding | Trees for compression | Full encode/decode, compression ratio |
| sicp-2-4-1 | Complex Numbers | Multiple representations | Third representation |
| sicp-2-4-2 | Tagged Data | Type dispatch | Count functions touched by new type |
| sicp-2-4-3 | Data-Directed Programming | Dispatch table, open/closed | Add conjugate operation additively |
| sicp-2-5-1 | Generic Arithmetic | Numeric tower, coercion | Polynomial type with generic arithmetic |
| sicp-3-1-1 | Local State Variables | Mutation, environment model needed | make_accumulator, make_monitored |
| sicp-3-1-2 | Benefits of Assignment | Objects, Monte Carlo | make_joint, statistics tracker |
| sicp-3-1-3 | Costs of Assignment | Referential transparency lost | Trace Peter/Paul account scenario |
| sicp-3-2-1 | Environment Structure | Frames, closures, scope chain | Draw make_account environment diagram |
| sicp-3-2-2 | Applying Functions | Frame creation, lexical scope | Predict nested closure output |
| sicp-3-2-3 | Frames as Local State | Closures are objects | OOP with closures only |
| sicp-3-3-1 | Mutable Lists | set_head, set_tail, aliasing | make_queue with mutation |
| sicp-3-3-2 | Queues | O(1) front/rear with pointers | make_deque doubly-linked |
| sicp-3-3-3 | Tables | Associative mutable data | memoize with table cache |
| sicp-3-3-4 | Digital Circuit Simulation | Event-driven simulation, agenda | Ripple-carry vs lookahead adder |
| sicp-3-4-1 | Time and Shared State | Race conditions, interleaving | Enumerate all interleavings |
| sicp-3-4-2 | Controlling Concurrency | Serializers, mutexes, deadlock | Serialized exchange, ordered locks |
| sicp-4-1-1 | eval and apply | Metacircular evaluator core | Add let to the evaluator |
| sicp-4-1-2 | Representing Expressions | Abstract syntax, AST walkers | Add cond to the evaluator |
| sicp-4-1-3 | Evaluator Data Structures | Environment as data | Detect undefined variable use |
| sicp-4-1-4 | Running the Evaluator | REPL, global environment, metacircular | Tail-call optimization |
| sicp-4-2-1 | Lazy Evaluation | Thunks, streams, infinite data | Infinite stream of primes |
| sicp-4-3-1 | Nondeterministic Evaluation | amb, backtracking, constraint solving | Logic puzzle with amb |
| sicp-5-1-1 | Register Machines | CPU model, registers, controller | Factorial register machine |
| sicp-5-1-2 | The Register Machine Simulator | Interpreter for machine descriptions | Instrument and profile the simulator |
| sicp-5-3-1 | Memory Representation | Pairs as array indexes | Pair system in raw arrays |
| sicp-5-3-2 | Garbage Collection | Stop-and-copy, reachability | Mark-and-sweep alternative |
| sicp-5-4-1 | The Explicit-Control Evaluator | Evaluator as register machine | Trace factorial through all registers |
| sicp-5-4-2 | Compilation | Source to instructions, optimization | Tail-call optimization in compiler |
| sicp-5-4-3 | The Full Picture | End-to-end chain, synthesis | Trace one call through all five levels |

---

*55 lessons. Five chapters. Beginner to master.*
*Every lesson has a concept, a CodeLens moment, and a challenge.*
*The plan is complete. Build the lessons.*