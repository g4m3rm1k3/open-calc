# Lesson 5: Function Composition

**What you will build**: By the end of this lesson you'll be able to build a new transformation out of two or more already-defined functions, without rewriting any of their logic — first by nesting calls directly, then by naming the combination itself as its own reusable function. You'll also see, concretely, why the order functions are combined in changes the result, and prove that a function is itself an ordinary value, not just a name you can call.

**What you need to know first**: Lesson 4's *function*, *parameter*, *argument*, and *return value* — this lesson is entirely about combining functions Lesson 4 already showed how to define and call.

**Terms introduced in this lesson**:

- **composition** — building a new transformation by applying one function to the result of another. *Why it matters*: this is Lesson 4's SE Lens promise made good — instead of writing a new function from scratch for every combination of behaviors you need, you build it out of pieces you already have.
- **first-class value** — something a language lets you do everything with a value that it lets you do with any other value: bind it to a name, pass it as an argument, return it from a function. *Why it matters*: this lesson is where it becomes visible that a *function itself* is one of these — not just something you call, but something you can hand to another function as an argument, which is exactly what composing functions requires.
- **commutative** — a property of an operation where swapping the order of its two inputs never changes the result (ordinary addition has this property: `a + b` always equals `b + a`). *Why it matters*: this lesson proves, concretely, that composition does *not* have this property — a claim that needs a precise name for what's being denied, not just "order matters, trust me."

**Objects and methods used**:

- **`comp`**
  - *What it is:* a function in Clojure's core library that builds a new function by composing two or more existing functions.
  - *Implementation:* `(comp f g)` returns a new function that, when called with some arguments, calls `g` on those arguments first, then calls `f` on `g`'s result — verified this session: `(comp)` with no arguments returns a function that gives back whatever it's called with, unchanged; `(comp f)` with one function behaves exactly like `f` itself; `(comp f g h)` chains three functions, applying `h` first, then `g` to `h`'s result, then `f` to `g`'s result.
  - *Its use:* every Concept Unit in this lesson from Concept Unit 2 onward.

---

## Concept Unit: Composition by Substitution

### The Problem

Lesson 4 defined `apply-deposit` (adds an amount to a balance) as one transformation, and this lesson's exercises will need a second one, `apply-fee` (subtracts a fee from a balance). What if a single transaction needs both — a deposit, immediately followed by a fee? Nothing about either function, on its own, does both.

### Introduce the concept in isolation

```
user=> (defn apply-deposit [balance amount] (+ balance amount))
#'user/apply-deposit
user=> (defn apply-fee [balance fee] (- balance fee))
#'user/apply-fee
user=> (apply-fee (apply-deposit 100 50) 10)
140
```

Confirm this is genuinely the same thing as doing it in two separate, named steps:

```
user=> (def after-deposit (apply-deposit 100 50))
#'user/after-deposit
user=> (apply-fee after-deposit 10)
140
```

Both give `140`. This is Lesson 4's own point about return values, applied directly: `apply-deposit`'s return value is an ordinary value — nothing distinguishes a value that came out of a function call from a value that came from a literal — so it can be used anywhere a value is expected, including as another function's argument, whether or not it's given its own name first. Nesting `(apply-fee (apply-deposit 100 50) 10)` is exactly Lesson 2's evaluation rule (reduce the sub-expression `(apply-deposit 100 50)` to its value, `150`, before applying `apply-fee`) — nothing new is happening mechanically. What's new is recognizing this pattern by name: applying one function to another's result is called **composition**.

### Discard the throwaway example

REPL-only, same as Lesson 4's examples.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(apply-fee (apply-deposit 100 50) 10)
```

(against the `apply-deposit` and `apply-fee` definitions from the isolated example above.)

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(apply-deposit 100 50)`** — reappearing call (Lesson 4); evaluates first, per Lesson 2's sub-expression rule, since it's nested inside `apply-fee`'s argument position.
- **`(apply-fee … 10)`** — reappearing call (Lesson 4), with its first argument being the sub-expression above instead of a literal — nothing about `apply-fee` needed to change to accept this; it only ever sees a plain number, `150`, once evaluation reaches it.

### CS Lens

This is precisely the mathematical definition of composition: given *f* and *g*, the composed function *(f ∘ g)(x)* means "compute *g(x)* first, then apply *f* to that result" — written here as `(apply-fee (apply-deposit ...) ...)`, with the innermost call playing the role of *g*. Also recognized in: an assembly line (each station's output becomes the next station's input, without any station needing to know what happens before or after it), and a pipe in a command-line shell (`cat file | sort | uniq`, where each program's output becomes the next one's input) — Lesson 233 (*Vector Operations*) and Section VI's algorithm-design work both return to this exact shape.

### SE Lens

Nesting calls directly, as above, works — but every place in a program that needs "deposit then fee" has to write out that same nesting again, which is the identical "same rule, rewritten by hand" problem Lesson 4 raised about repeating `(* 5 5)` and `(* 7 7)` instead of defining `square` once. The next unit fixes this the same way Lesson 4 did: give the combination itself a name.

---

## Concept Unit: Naming a Composition — `comp` and Functions as Values

### The Problem

`(apply-fee (apply-deposit 100 50) 10)` is a specific instance of a *general* pattern — "double, then increment" or "increment, then double," applied to whatever number shows up. Lesson 4 named a repeated rule once with `defn`; is there a way to name *this combination itself* — "first `double-it`, then `increment`" — as its own callable transformation, the way `square` named "multiply a number by itself"?

### Introduce the concept in isolation

```
user=> (defn double-it [n] (* 2 n))
#'user/double-it
user=> (defn increment [n] (+ n 1))
#'user/increment
user=> (def process (comp increment double-it))
#'user/process
user=> (process 5)
11
user=> (process 10)
21
```

`process` behaves exactly like a function defined directly with `defn` — it can be called, with different arguments, producing different results (`11` for `5`, `21` for `10`) — but it was never written with `defn` at all. It was *built* by handing `comp` two already-defined functions, `increment` and `double-it`, as arguments, and binding the function `comp` returned to a name with ordinary `def`. Confirm `process` really is a function, the same kind of thing `double-it` and `increment` are:

```
user=> (fn? process)
true
```

This proves the claim this unit is named for: a function in Clojure isn't just something you call by writing its name first in a form — it's an ordinary value, storable in a binding (`def process ...`), passable as an argument (`increment` and `double-it`, handed directly to `comp`), and, as just shown, returnable as a result (what `comp` itself did). That's what **first-class value** means, made concrete instead of asserted.

### Discard the throwaway example

REPL-only, as with every example so far in this lesson.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def process (comp increment double-it))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`comp`** — first appearance as a called function (covered fully in Objects and methods used, above): unlike every function called so far in this series, its arguments (`increment`, `double-it`) are themselves functions, not numbers — and its return value is also a function, not a number.
- **`increment`, `double-it`** — reappearing symbols (Lesson 3's name lookup), but evaluated here to retrieve *function values*, not numbers — the same lookup mechanism Lesson 3 established, working on a new kind of value.
- **`(def process (comp increment double-it))`** — reappearing `def` (Lesson 3); the only new fact is that the value being bound is a function this time, rather than a number — `def` itself doesn't care what kind of value it's binding.

### CS Lens

A function that takes another function as an argument, or returns one as a result, is called a **higher-order function** — `comp` is this lesson's first example, and Section II's `map`, `filter`, and `reduce` (Lessons 25–27) are the next, much more heavily used ones. Also recognized in: a thermostat's "schedule" (a rule for choosing *which* temperature-setting rule applies at a given time — a rule about rules), and a factory that builds machines instead of products (its "output" is itself something capable of producing further output).

### SE Lens

Being able to name a *composition* itself, not just its individual pieces, means the "deposit then fee" pattern from the previous unit only has to be assembled once, at the point `process` is defined — every later use just calls `process`, the same reuse benefit Lesson 4 established for a single function, now available for combinations of functions too. This is a genuine capability, not available in every language: a language where functions are *not* first-class values (where a function's name can only ever be called, never passed around or returned) couldn't express `comp` at all, no matter how it were written.

### Connection to the previous unit

The previous unit showed that nesting calls by hand produces the composed result; this unit shows that the *combination itself* can be named and reused, the same way Lesson 4 let a single rule be named and reused instead of rewritten.

---

## Concept Unit: Order Matters — Composition Is Not Commutative

### The Problem

`(comp increment double-it)` combines two functions — but in which order do they actually run? "First `increment`, then `double-it`" and "first `double-it`, then `increment`" are two different transformations, and nothing about the *phrase* "compose increment and double-it" says which one `comp` builds.

### Introduce the concept in isolation

```
user=> ((comp increment double-it) 5)
11
user=> ((comp double-it increment) 5)
12
```

Same two functions, same input (`5`), different results: `11` versus `12`. Trace both by hand to see why:

```
(comp increment double-it), applied to 5:
  double-it runs first (it's listed second, applied first): double-it(5) → 10
  increment runs on that result: increment(10) → 11

(comp double-it increment), applied to 5:
  increment runs first (listed second here, applied first): increment(5) → 6
  double-it runs on that result: double-it(6) → 12
```

`comp`'s arguments are applied **right to left** — the *last* function listed runs *first*, on the original arguments, and each function to its left runs on the previous one's result. This matches the mathematical notation composition is named after: *(f ∘ g)(x)* means "apply *g* first, then *f*" — `g`, on the right, runs first, same as `comp`'s rightmost argument.

This proves composition is **not commutative**: swapping the order of `comp`'s arguments is not a harmless rewording — it builds a genuinely different function, one that can (and here, does) produce a different result from the same input.

### Discard the throwaway example

REPL-only.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
((comp double-it increment) 5)
```

(to compare directly against `((comp increment double-it) 5)` from the previous unit.)

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(comp double-it increment)`** — reappearing call to `comp` (Concept Unit 2), with its two arguments in the opposite order from before. Per this unit's isolated example, `comp` applies its *rightmost* argument first — so this builds "`increment`, then `double-it`," the reverse of the previous unit's "`double-it`, then `increment`."
- **Outer call `(... 5)`** — reappearing call-a-function-value shape (Concept Unit 2's `(process 5)`); nothing new here beyond what's already been walked through.

### CS Lens

An operation where order changes the result is the norm, not the exception, once you leave simple arithmetic: matrix multiplication (Lesson 235) is famously not commutative either (*AB* usually isn't *BA*), function composition in ordinary mathematics has never been commutative (getting dressed: "put on socks, then shoes" and "put on shoes, then socks" are not the same sequence of states, even though both involve the same two actions), and neither is the order of operations in a real transaction sequence — applying a discount before tax is calculated gives a different total than applying it after, even though both steps are "correct" transformations in isolation.

### SE Lens

Because `comp`'s right-to-left order is a specific, memorized convention rather than something visually obvious from `(comp increment double-it)` alone, misreading it is a real, easy mistake — this unit's whole reason for existing is to make that convention impossible to guess wrong once you've traced it by hand, the same way Lesson 2's Concept Unit 1 made arithmetic's own precedence convention explicit instead of assumed. Code that composes functions without either a team-wide convention or a comment stating the intended order is exactly the kind of "technically valid, silently means something different than intended" risk Lesson 1 raised in its very first Concept Unit.

### Connection to the previous unit

The previous unit showed that a composition, once built, behaves like any other function; this unit shows that *how* it was built — specifically, the order of `comp`'s arguments — determines which transformation that actually is.

---

## Concept Unit: Composing More Than Two Functions

### The Problem

Everything so far has composed exactly two functions. Does the same right-to-left rule extend cleanly to three, or does adding a third function change how the rule works?

### Introduce the concept in isolation

```
user=> (defn square [n] (* n n))
#'user/square
user=> ((comp square increment double-it) 3)
49
```

Trace it the same way as the two-function case:

```
(comp square increment double-it), applied to 3:
  double-it runs first (rightmost): double-it(3) → 6
  increment runs on that result: increment(6) → 7
  square runs on that result: square(7) → 49
```

The rule from the previous unit — rightmost function first, then working leftward, each function applied to the previous one's result — extends to any number of functions without any new rule needed: three functions are just two applications of the same right-to-left step, one after another.

### Discard the throwaway example

REPL-only.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
((comp square increment double-it) 3)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(comp square increment double-it)`** — reappearing call to `comp` (Concept Units 2 and 3), with three arguments instead of two. No new syntax: `comp` accepts as many function arguments as it's given (verified in this lesson's "Objects and methods used" entry), applying the same right-to-left chaining rule regardless of how many there are.

### CS Lens

A chain of composed functions, each one's output feeding the next one's input, is the same shape as a **pipeline** — Lesson 3 (*Names, Bindings, and Environments*) briefly mentioned this word won't matter until later; here's where it starts to. Also recognized in: a factory assembly line with more than two stations, a series of image filters applied one after another in photo-editing software, and Unix shell pipes chained more than once (`cat file | grep foo | sort | uniq`).

### SE Lens

Building a three-step transformation out of three separately-defined, separately-testable one-step functions (`double-it`, `increment`, `square`) — instead of one large function that does all three steps in a single body — means each piece can be checked and reused on its own, independent of the other two. Lesson 275 (*Modularity*) is this exact tradeoff, examined at the scale of a whole system instead of three small functions.

### Connection to the previous unit

The previous unit established the right-to-left rule for two functions; this unit shows the identical rule covering any number of them, with nothing extra to learn.

---

## Connect the Pieces

One expression combining a two-argument function with two single-argument ones, exercising every idea in this lesson at once:

```
user=> ((comp double-it apply-deposit) 100 50)
300
```

Trace it: `apply-deposit`, the rightmost function, runs first — and unlike every other function composed so far in this lesson, it takes *two* arguments (`100` and `50`), because it's the one directly receiving the call's actual arguments (Concept Unit 1 and Lesson 4's multi-parameter functions). It returns `150`. `double-it` then runs on that single result, producing `300` (Concept Unit 3's right-to-left rule, extended here to a case where the innermost function isn't single-argument). Nothing about `comp` needed to change to allow this — only the *first* function applied (the rightmost one) can take more than one argument, because every function after it in the chain only ever receives one value: the previous function's single return value.

## What Breaks Without This

Suppose `apply-deposit` were composed in the wrong position — as the *outer* function instead of the inner one, reversing Concept Unit 3's lesson about order:

```
user=> ((comp apply-deposit double-it) 100 50)
```

```
----- Error --------------------------------------------------------------------
Type:     clojure.lang.ArityException
Message:  Wrong number of args (2) passed to: user/double-it
```

This is a real, verified error. `double-it` is now the rightmost function, so it runs first, on the call's actual arguments — but it was given two (`100` and `50`), and `double-it` only takes one, raising the exact Lesson 4 arity error this series has already seen. This is a more forgiving failure than it could have been: Concept Unit 3's ambiguity risk (order matters, silently producing a different but still valid-looking number) and this unit's risk (order matters enough to break arity entirely) are the same underlying mistake, just landing on two different kinds of consequence — one silent, one loud.

## Exercises

1. **Trace.** Define `(defn halve [n] (/ n 2))` (Lesson 2's exact division). Trace `((comp halve increment) 9)` by hand before running it — which function runs first?
2. **Predict.** Predict whether `((comp increment halve) 9)` gives the same result as Exercise 1. Run it and check.
3. **Name it.** Bind `(comp square double-it)` to a name of your own choosing, call it with two different inputs, and confirm both results by tracing them by hand first.
4. **Break it, on purpose.** Compose `apply-fee` (two arguments) with any single-argument function, but put `apply-fee` in a position where it isn't the rightmost function. Run it and read the real arity error, the way "What Breaks Without This" did.
5. **Generalize.** Using `comp`, build a single named function that applies a deposit, then a fee, then doubles the result — three functions chained. Confirm it against a by-hand trace.
6. **Reconstruct.** Close this lesson. From memory, explain why `(comp f g)` and `(comp g f)` can produce different functions — using the word "commutative" — and why `comp`'s rightmost argument is the one that runs first.

## Definition of Done

- [ ] You can trace a two-function composition by hand, correctly identifying which function runs first, before running it to check.
- [ ] You completed Exercise 3 (naming your own composed function) and confirmed it behaves correctly for at least two different inputs.
- [ ] You can explain, from memory, why composition is not commutative, with a concrete example (not just the definition).
- [ ] You've seen a real arity error caused by composing functions in the wrong order.
- [ ] Commit your Exercise 5 function to your notes repository, with a commit message explaining *why* the functions had to be composed in that specific order — for example, `"Compose double-it after apply-fee after apply-deposit — comp runs right-to-left, so the first transaction step has to be listed last"` — not just `"lesson 5 exercise"`.

---

**Next lesson:** Lesson 6, *Equality and Substitution*, steps back from combining functions to ask a question this lesson has been assuming the answer to at every turn: what does it actually mean for two values — or two expressions — to be "the same"?
