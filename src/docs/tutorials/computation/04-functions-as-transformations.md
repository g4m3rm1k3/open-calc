# Lesson 4: Functions as Transformations

**What you will build**: By the end of this lesson you'll be able to name a transformation once and reuse it with as many different inputs as you like, instead of rewriting the same computation by hand every time the numbers change. You'll also see precisely why a function's parameters don't collide with bindings that exist outside it, even when they share a name — and what Clojure does when a function is called with the wrong number of arguments.

**What you need to know first**: Lesson 1's *transformation* (a rule connecting a problem's input to its output) and Lesson 3's *binding* and *environment* (a name, looked up in a table of active associations). This lesson is where those two ideas merge: a function is a transformation that gets its own name, and calling it creates new bindings.

**Terms introduced in this lesson**:

- **function** — an association from each valid input to exactly one output, computed by evaluating a rule. *Why it matters*: this is Lesson 1's *transformation*, given a name and a form you can write down once and reuse — the same idea, made concrete and reusable.
- **parameter** — a name that stands for whatever value a function is called with, bound to the actual argument for the duration of one call. *Why it matters*: this is what lets one written rule work for more than one input — Lesson 3's *binding*, applied to something new: a binding created fresh on every call and gone once the call finishes.
- **argument** — the actual value supplied for a parameter at a specific call. *Why it matters*: keeping "parameter" (the name, fixed in the definition) and "argument" (the value, different at every call) distinct avoids a common source of imprecise reasoning about what calling a function actually does.
- **call** (or **invocation**) — evaluating a function with specific arguments, producing its return value. *Why it matters*: a function definition alone computes nothing; a call is the actual event that makes evaluation happen, the same way a bare expression, unevaluated, isn't yet a value.
- **return value** — the value a function call evaluates to. *Why it matters*: distinguishes what a function *produces* from anything else it might additionally do (like Lesson 3's `println`, which prints and returns `nil` — the printing is not the return value).
- **arity** — the fixed number of parameters a function is defined with, and therefore the number of arguments a call must supply. *Why it matters*: this is a real, enforced constraint, verified directly in this lesson — calling with the wrong number of arguments is an error, not a warning or an approximation.
- **local scope** — the region of code (here, a function's own body) where a parameter's binding exists and can be looked up; outside that region, the binding simply doesn't exist. *Why it matters*: this is what makes it safe for two different functions, or two different calls to the same function, to use the same parameter name without interfering with each other — proven directly in Concept Unit 2, not just asserted.

**Objects and methods used**:

- **`defn`**
  - *What it is:* a Clojure macro for defining a named function — it creates a binding (like Lesson 3's `def`) whose value is a function.
  - *Implementation:* `(defn name [param1 param2 ...] body-expression)` — creates a binding from `name` to a function that, when called, binds each parameter to its corresponding argument and evaluates `body-expression` in that new environment (verified this session: `(defn square [n] (* n n))` prints `#'user/square`, the created binding, exactly like `def` did in Lesson 3).
  - *Its use:* every Concept Unit in this lesson.

---

## Concept Unit: Functions, Mathematically and Computationally

### The Problem

Lesson 1 defined a *transformation* as the rule connecting a problem's input to its output — for example, "square a number": given `5`, produce `25`; given `7`, produce `49`. Lesson 2 showed how to evaluate `(* 5 5)` to get `25`. But writing `(* 5 5)` and, later, `(* 7 7)` separately is writing the *same rule* twice, by hand, once per input — nothing in either expression says "this is the same transformation, applied again." How does a rule like "square a number" get written down *once*, in a form that works for whatever input it's given later?

### Introduce the concept in isolation

```
user=> (defn square [n] (* n n))
#'user/square
```

The result, `#'user/square`, is a binding — exactly the shape Lesson 3's `def` produced, because `defn` *is*, under the hood, a way of binding a name to a function value. Now call it with different inputs:

```
user=> (square 5)
25
user=> (square 7)
49
```

One definition, two different results, because `n` stood for a different value each time. This is the payoff promised above: the rule "multiply a number by itself" was written exactly once, inside `square`'s definition, and reused for both `5` and `7` without being retyped. Mathematically, this is precisely what a **function** is: an association from each valid input to exactly one output — the same definition every mathematics course means by "let *f(x) = x²*," now written in a form a computer can evaluate.

### Discard the throwaway example

REPL-only, same as every code example in Lessons 2 and 3 before it was deliberately saved to a file.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch introduction of `defn`.
- **Files affected**: None — REPL session.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, installed in Lesson 2.

### The New Code — type it yourself

```clojure
(defn square [n] (* n n))
```

### The Updated Project

Skipped — no enclosing file exists yet for this fragment to live inside.

### Mechanical walkthrough — how it works in isolation

- **`defn`** — first appearance (covered fully in Objects and methods used, above): defines a named function.
- **`square`** — first appearance in this position: the name the resulting function gets bound to — plays the same role `x` played as the first argument to `def` in Lesson 3.
- **`[n]`** — first appearance: a **parameter** list containing one parameter, `n`. This isn't a value yet — it's a placeholder name that will be bound to whatever argument the function is called with.
- **`(* n n)`** — the function's body: a reappearing form (Lesson 2's `*`), except its operands are now a parameter rather than literals. This doesn't evaluate to anything at the moment `defn` runs — it only evaluates once the function is actually called, with `n` bound to that call's argument.

### CS Lens

"Write the rule once, apply it to many different inputs without rewriting it" is the entire reason functions exist as a language feature, in every language — Also recognized in: a recipe written once and followed for any quantity of ingredients (not rewritten per batch), a spreadsheet formula in one cell, filled down a column so the same formula applies to every row with that row's own numbers, and a mathematical function's graph (one rule, `y = x²`, producing a different `y` for every `x` along the curve).

### SE Lens

The alternative — writing `(* 5 5)`, then later `(* 7 7)`, then later `(* 12 12)`, each time the same rule is needed — is exactly the "technically works, doesn't scale" pattern this series keeps returning to: it works for three uses, and becomes a real liability the moment the rule itself needs to change (imagine "square" was actually a more complex, multi-line computation — fixing a mistake in it would mean finding and fixing every copy, not just one). Lesson 280 (*Refactoring*) and Lesson 275 (*Modularity*) are this same idea, at a much larger scale, later in this series.

---

## Concept Unit: Parameters Are Bindings, Scoped to the Call

### The Problem

Lesson 3 spent an entire lesson establishing that bindings live in an environment, and that name lookup searches that environment. `square`'s parameter, `n`, is a name too — does it go into the *same* environment as everything defined with `def`? If some other binding already used the name `n` before `square` was ever called, does calling `square` disturb it?

### Introduce the concept in isolation

```
user=> (def n 999)
#'user/n
user=> (defn square [n] (* n n))
#'user/square
user=> (square 5)
25
user=> n
999
```

`n` was already bound to `999` at the top level before `square` was even defined. Calling `(square 5)` still produced the correct answer, `25` — and afterward, the top-level `n` is still `999`, completely undisturbed. This proves parameters don't share the top-level environment: calling `square` created a *new*, temporary environment, with its own `n` bound to `5`, used only for evaluating `(* n n)` during that one call — and then discarded once the call finished, leaving the original `n` exactly as it was.

### Discard the throwaway example

REPL-only, as with every example so far.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def n 999)
(defn square [n] (* n n))
(square 5)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(def n 999)`** — reappearing `def` (Lesson 3); creates a top-level binding for `n`.
- **`(defn square [n] (* n n))`** — reappearing `defn` (Concept Unit 1); the parameter name `n` here is written independently of the top-level `n` above — nothing about `defn` looks up the existing `n` binding while defining `square`, since `n` in the parameter list is being *declared*, not evaluated (the same way `x` in `(def x 5)` is a name being assigned to, not a value being looked up).
- **`(square 5)`** — first appearance of a call actually demonstrating **local scope**: this creates a new environment, layered on top of the existing one, containing exactly one binding — `n` to `5` — used only while evaluating `(* n n)`. Once the call finishes and returns `25`, that temporary environment is gone; the top-level `n` was never part of it and was never touched.

### CS Lens

A temporary environment that exists only for the duration of one function call, layered on top of the surrounding one without disturbing it, is the concept of **scope** — you'll meet it again, formally, in Lesson 164 (*Environments*) and Lesson 193 (*Stack Frames*), where each function call's local bindings are shown living in their own frame, stacked on top of whichever call is waiting for it to finish. Also recognized in: a meeting room booked under one name not conflicting with a different meeting elsewhere using the same room-naming convention, and a recipe's "1 cup" meaning something specific and self-contained within that one recipe, regardless of what "1 cup" might mean in a different recipe using the same word.

### SE Lens

The alternative — parameters sharing one single, global environment with everything else — would mean every function's parameter names would have to be chosen to avoid colliding with every other name used anywhere in the whole program, forever, an unworkable constraint at any real scale. Scoping parameters to just their own call is what makes it safe to write `n`, `x`, or `balance` in a hundred different functions without a single naming conflict — a design decision so foundational that most languages don't even offer the unscoped alternative.

### Connection to the previous unit

The previous unit showed `square` producing correct results for two different inputs; this unit is the proof of *why* that's safe — each call's parameter binding is new and temporary, never colliding with anything that existed before it.

---

## Concept Unit: More Than One Parameter — A Transformation With Multiple Inputs

### The Problem

Lesson 1's bank-account transformation needed *two* pieces of information to process one transaction: the current balance, and the transaction amount. `square`'s single parameter, `n`, doesn't show how a function handles more than one input at once. Does the parameter list extend the same way for two names as it did for one?

### Introduce the concept in isolation

```
user=> (defn apply-deposit [balance amount] (+ balance amount))
#'user/apply-deposit
user=> (apply-deposit 100 50)
150
user=> (apply-deposit 200 25)
225
```

Two parameters, `balance` and `amount`, both bound in the same call — the first argument (`100`) went to `balance`, the second (`50`) went to `amount`, matched up by position. This is Lesson 1's bank-account *transformation*, made real and reusable for the first time: given any opening balance and any deposit amount, `apply-deposit` produces the new balance, without rewriting the addition by hand for every different pair of numbers.

(This function only handles deposits, which always succeed unconditionally — Lesson 1's *constraint*, "reject a withdrawal that would take the balance negative," needs a way to make a decision based on the numbers involved, which this lesson hasn't introduced yet. Lesson 7, *Predicates and Boolean Logic*, is where that becomes possible.)

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
(defn apply-deposit [balance amount] (+ balance amount))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[balance amount]`** — a parameter list with two names instead of one — a reappearing construct (Concept Unit 1's `[n]`), extended: each position in the list gets bound to the argument in the corresponding position at the call site, in order. Nothing new syntactically; the only new fact is that a parameter list can hold more than one name, and calls must supply a matching argument for each.
- **`(+ balance amount)`** — reappearing form (Lesson 2's `+`); its operands are this function's two parameters instead of literals or a single parameter.
- **`(apply-deposit 100 50)`** — reappearing call shape (Concept Unit 1); the only new fact is positional matching: `100` (first argument) becomes `balance`, `50` (second argument) becomes `amount`, because of the order they were written in, not anything about the numbers themselves.

### CS Lens

Matching arguments to parameters by position is called **positional arguments**, and it's the same underlying idea as a mathematical function of several variables (*f(x, y) = x + y*, where which number is *x* and which is *y* depends on the order they're written in) and a spreadsheet function like `SUM(A1, B1)` (position, not the cell's contents, determines which argument is which). Some languages also support matching arguments by name instead of position — a genuinely different mechanism, out of scope for this lesson.

### SE Lens

Positional matching is compact but places a real burden on the caller to remember the correct order — calling `(apply-deposit 50 100)` instead of `(apply-deposit 100 50)` wouldn't error (both arguments are valid numbers), it would silently compute a *different*, wrong-for-the-intent result (a balance of `150` either way, coincidentally, for this specific commutative operation — but a function whose parameters aren't interchangeable, unlike addition, would produce a genuinely wrong answer with no error at all). This is the same "technically an answer, practically wrong" failure Lesson 1 first raised, and Lesson 281 (*API Design*) returns to it directly, at the scale of a whole library's worth of function calls instead of one.

### Connection to the previous unit

The previous unit showed one parameter getting its own scoped binding per call; this unit shows the same mechanism extending cleanly to more than one parameter, each bound independently, in the order they're listed.

---

## Concept Unit: Arity

### The Problem

`apply-deposit` expects exactly two arguments. What happens if it's called with the wrong number — one argument instead of two, or three instead of two?

### Introduce the concept in isolation

```
user=> (apply-deposit 100)
----- Error --------------------------------------------------------------------
Type:     clojure.lang.ArityException
Message:  Wrong number of args (1) passed to: user/apply-deposit
```

```
user=> (apply-deposit 100 50 10)
----- Error --------------------------------------------------------------------
Type:     clojure.lang.ArityException
Message:  Wrong number of args (3) passed to: user/apply-deposit
```

Both are real, verified errors — not silently ignoring the extra argument, and not silently leaving `amount` unbound and producing some default. Clojure checks the number of arguments against the function's declared parameter list — its **arity** — before the function body ever runs, and refuses to call it at all if they don't match.

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
(apply-deposit 100)
```

(against the two-parameter `apply-deposit` from the previous unit.)

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(apply-deposit 100)`** — reappearing call shape (Concept Unit 3), but supplying only one argument to a function defined with two parameters. This is the first appearance of arity being *checked*: Clojure counts the arguments before attempting to evaluate the function body, finds one instead of the required two, and raises `ArityException` rather than attempting the call with `amount` left unbound.

### CS Lens

Checking arity before running any of a function's code is one instance of a broader idea: catching a mismatch between what's expected and what's provided as early and as specifically as possible, the same principle behind Lesson 3's "Unable to resolve symbol" error firing immediately at the unresolved name rather than letting execution continue with a missing value. Also recognized in: a form that refuses to submit until all required fields are filled (checked before any processing happens, not after), and a shipping label rejected at the counter for a missing field rather than getting lost in transit.

### SE Lens

The alternative — silently ignoring extra arguments, or filling missing ones with some default like `nil` or `0` — would let a caller's mistake (forgetting an argument, or an argument added to a function's definition later without updating every call site) produce a *plausible-looking wrong answer* instead of an immediate, specific error. This is the same tradeoff Lesson 1 and Lesson 3 both already made concrete: an error at the exact point of the mistake is far cheaper to fix than a wrong value discovered later, disconnected from its actual cause.

### Run it. Show the real output.

```
user=> (apply-deposit 100)
Wrong number of args (1) passed to: user/apply-deposit
user=> (apply-deposit 100 50 10)
Wrong number of args (3) passed to: user/apply-deposit
```

Verified this session via Babashka v1.13.219.

### Connection to the previous unit

The previous unit showed positional arguments filling a function's parameters correctly; this unit shows what happens when there aren't the right number of arguments to fill them with at all — a mismatch caught immediately, before the function body runs.

---

## Connect the Pieces

One file, using every idea from this lesson together:

```clojure
(defn apply-deposit [balance amount] (+ balance amount))

(def starting-balance 100)
(def after-first-deposit (apply-deposit starting-balance 50))
(def after-second-deposit (apply-deposit after-first-deposit 25))

(println "Starting balance:" starting-balance)
(println "After first deposit:" after-first-deposit)
(println "After second deposit:" after-second-deposit)
```

Run it:

```
Starting balance: 100
After first deposit: 150
After second deposit: 175
```

`apply-deposit` is defined once (Concept Unit 1) and called twice, with different arguments each time (Concept Unit 3) — each call creates its own scoped `balance`/`amount` bindings that vanish once that call returns (Concept Unit 2), leaving only the returned value behind, captured by an ordinary `def` (Lesson 3). The second call reuses the *result* of the first as its own `balance` argument — proving the return value from one call is an ordinary value, usable anywhere a value is expected, including as another function's argument.

## What Breaks Without This

Suppose `apply-deposit` were called with its arguments in the wrong order — easy to do, since Concept Unit 3 already showed positional matching places no obstacle in the way of this mistake:

```clojure
(defn apply-deposit [balance amount] (+ balance amount))
(println (apply-deposit 50 100))
```

```
150
```

No error, and the value is even the one you might expect if you weren't looking closely — `150` either way, because `+` doesn't care which argument arrived first. But now compare a function where the parameters genuinely aren't interchangeable — computing balance *minus* a fee instead of balance *plus* a deposit:

```clojure
(defn apply-fee [balance fee] (- balance fee))
(println (apply-fee 100 5))
(println (apply-fee 5 100))
```

```
95
-95
```

Swapping the argument order here doesn't produce the same wrong-looking-right answer `apply-deposit` did — it produces a *completely different, clearly broken* value, `-95`, from arguments that were individually perfectly valid numbers. Nothing about the arity check (Concept Unit 4) catches this, because two arguments really were supplied — the mistake is entirely about *which value went to which parameter*, exactly the risk Concept Unit 3's SE Lens named directly.

## Exercises

1. **Trace.** Define `(defn cube [n] (* n n n))` and trace `(cube 3)` by hand, the way Lesson 2 traced nested expressions, before running it to check.
2. **Predict.** Given `(defn average-of-two [a b] (/ (+ a b) 2))`, predict the value of `(average-of-two 10 15)` — and predict whether it will be a whole number or an exact fraction (Lesson 2). Run it and check both predictions.
3. **Scope.** Write a function with a parameter named `balance`, and separately `def` a top-level binding also named `balance` with a different value. Call the function and confirm, the way Concept Unit 2 did for `n`, that the top-level `balance` is unaffected afterward.
4. **Break it, on purpose.** Call one of this lesson's two-parameter functions with only one argument, and separately with three. Read both real error messages and confirm they name the function and the wrong count, the way this lesson's verified errors did.
5. **Generalize.** Write a three-parameter function, `(defn total-with-two-deposits [balance deposit1 deposit2] ...)`, that returns the balance after both deposits are applied. Call it and confirm the result.
6. **Reconstruct.** Close this lesson. From memory, explain why `(apply-fee 100 5)` and `(apply-fee 5 100)` produce different values while `(apply-deposit 100 50)` and `(apply-deposit 50 100)` happen to produce the same one — using the words "parameter," "argument," and "position."

## Definition of Done

- [ ] You can define a function with `defn`, call it with at least two different sets of arguments, and correctly predict each result before running it.
- [ ] You completed Exercise 3 and confirmed, yourself, that a function's parameter doesn't disturb a top-level binding with the same name.
- [ ] You've seen a real arity error from calling a function with too few and too many arguments.
- [ ] You can explain, from memory, the difference between a parameter and an argument.
- [ ] Commit your Exercise 5 function to your notes repository, with a commit message explaining *why* it needs three parameters instead of reusing `apply-deposit` twice by hand — for example, `"Add total-with-two-deposits — names the whole three-input transformation once instead of chaining two separate calls at every use site"` — not just `"lesson 4 exercise"`.

---

**Next lesson:** Lesson 5, *Function Composition*, is where functions like `apply-deposit` stop being used one at a time and start being built out of each other — deriving complex behavior from simple, already-defined pieces instead of writing every transformation from scratch.
