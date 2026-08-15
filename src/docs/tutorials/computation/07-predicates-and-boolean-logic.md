# Lesson 7: Predicates and Boolean Logic

**What you will build**: By the end of this lesson you'll be able to ask yes/no questions in code, combine them with AND, OR, and NOT, and use the answer to choose between two different computations — finally completing Lesson 1's bank-account withdrawal rule (reject a withdrawal that would take the balance negative), which every lesson since Lesson 4 has had to work around because this lesson hadn't happened yet. You'll also see a real, surprising difference between how Clojure and Python decide whether a value counts as "true."

**What you need to know first**: Lesson 6's `=` and the boolean values it produces, and Lesson 4's functions and parameters — this lesson's predicates are ordinary functions that happen to return `true` or `false`.

**Terms introduced in this lesson**:

- **predicate** — a function that returns a boolean value, asking a yes/no question about its argument(s). *Why it matters*: Lesson 6's `=` was already an example of this without the category having a name — this lesson makes the category explicit and adds several new members to it.
- **boolean** — a value that is either `true` or `false`, and nothing else. *Why it matters*: this is the result type of every predicate, and the type every conditional (below) makes its decision from.
- **logical connective** — an operation that combines boolean values into a new boolean value (`and`, `or`, `not`, and, built from them, implication and equivalence). *Why it matters*: gives a name to the whole family this lesson covers, distinguishing it from arithmetic operators, which combine numbers instead of truth values.
- **nil** — Clojure's value representing "nothing" or "no answer" (the same role Python's `None` plays). *Why it matters*: this lesson's truthiness rules (Concept Unit 3) treat `nil` specially, the same way they treat `false` specially — both count as "no" in a boolean context, and everything else counts as "yes."
- **truthy** / **falsy** — describing whether a value counts as true or false when a conditional needs a yes/no answer from it, even if the value itself isn't literally `true` or `false`. *Why it matters*: Concept Unit 3 shows this rule is not the same in every language — carrying an assumption from one language into another here is a real, easy mistake.
- **conditional** — an expression that evaluates one of two (or more) branches depending on a boolean value. *Why it matters*: `if` (Concept Unit 4) is this lesson's example, and "conditional" is the general word this series uses for the idea from here on, distinct from the predicate that supplies the boolean and the branches it chooses between.
- **implication** — a logical connective, "if p then q," false only when p is true and q is false. *Why it matters*: this is the precise logical shape behind every constraint this series has used so far — "if a withdrawal would exceed the balance, reject it" is an implication, named precisely for the first time in Concept Unit 5.
- **equivalence** (or **biconditional**) — a logical connective, "p if and only if q," true exactly when p and q have the same truth value. *Why it matters*: this is the precise shape behind claims like Lesson 6's equality, and recurs constantly once proofs (starting Lesson 15) need to state that two conditions are interchangeable.

**Objects and methods used**:

- **`>`, `>=`, `<`, `<=`** (comparison operators)
  - *What they are:* functions in Clojure's core library comparing two numbers, each testing a different relationship (greater than, greater-or-equal, less than, less-or-equal).
  - *Implementation:* all four share the same shape — `(op a b)` returns a boolean — verified this session: `(> 5 3)` → `true`, `(>= 100 150)` → `false`, `(< 3 5)` → `true`.
  - *Its use:* Concept Unit 1, as this lesson's first predicates beyond `=`.
- **`and`**
  - *What it is:* a Clojure special form combining boolean-context values, true only if every argument is truthy.
  - *Implementation:* `(and a b ...)` evaluates its arguments left to right, stopping (**short-circuiting**) at the first falsy one and returning it — or, if none are falsy, returning the last one evaluated. Verified this session: `(and false (println "should not print"))` prints nothing and returns `false` — the second argument is never evaluated. `(and 5 10)` returns `10`, not `true` — proof that `and` returns one of its actual argument values, not necessarily a boolean.
  - *Its use:* Concept Unit 2, combining predicate results.
- **`or`**
  - *What it is:* a Clojure special form combining boolean-context values, true if at least one argument is truthy.
  - *Implementation:* `(or a b ...)` evaluates left to right, stopping at the first truthy value and returning it — or returning the last one if none are truthy. Verified this session: `(or true (println "should not print either"))` prints nothing and returns `true`. `(or false 7)` returns `7`.
  - *Its use:* Concept Unit 2.
- **`not`**
  - *What it is:* a function in Clojure's core library that reverses a boolean-context value.
  - *Implementation:* `(not x)` returns `true` if `x` is falsy, `false` if `x` is truthy — verified this session: `(not (> 3 5))` → `true`.
  - *Its use:* Concept Unit 2, and Concept Unit 5's derivation of implication.
- **`if`**
  - *What it is:* a Clojure special form that evaluates one of two expressions depending on a condition.
  - *Implementation:* `(if condition then-expr else-expr)` evaluates `condition`; if it's truthy, evaluates and returns `then-expr` *without evaluating* `else-expr` at all; otherwise evaluates and returns `else-expr` without evaluating `then-expr`. Verified this session: `(if true 1 (println "should not print"))` returns `1` and prints nothing — the untaken branch never runs.
  - *Its use:* Concept Unit 4, finally completing Lesson 1's withdrawal-rejection rule.

---

## Concept Unit: Predicates — Functions That Answer Yes or No

### The Problem

Lesson 6's `=` answers one specific yes/no question: "are these two values equal?" Lesson 1's bank-account constraint needs a different question answered: "is the balance at least as large as the withdrawal amount?" Is there a whole family of functions like `=`, each asking its own yes/no question, or is `=` a one-off?

### Introduce the concept in isolation

```
user=> (> 5 3)
true
user=> (>= 100 150)
false
user=> (< 3 5)
true
```

Each of these is a function, called the same way `=` was in Lesson 6, returning a **boolean** — `true` or `false`, and nothing else. `=` turns out to be one member of a larger family: any function whose job is answering a yes/no question about its arguments is called a **predicate**. `>`, `>=`, `<`, and `<=` are four more predicates, each testing a different numeric relationship.

By convention (not a language rule — a style choice most Clojure code follows), a predicate's own name often ends in `?` when it's user-defined, to make "this returns a boolean" visible at the call site:

```
user=> (defn eligible-for-discount? [total] (>= total 100))
#'user/eligible-for-discount?
user=> (eligible-for-discount? 120)
true
```

`?` is just a character allowed in Clojure symbol names — nothing about it changes how the function behaves. It's a naming convention, the same kind of thing as choosing to name a function `calculate_total` versus `calculateTotal` in other languages: readable and expected, not enforced by the language itself.

### Discard the throwaway example

REPL-only, same as prior lessons' early examples.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(> 5 3)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`>`** — first appearance (covered fully in Objects and methods used, above): tests whether its first argument is greater than its second.
- **`5`, `3`** — reappearing numeric literals (Lesson 2); no new treatment owed.
- **Outer form `(> 5 3)`** — reappearing prefix-call shape (Lesson 2); the only new fact is what kind of value the operator produces — a boolean, not a number.

### CS Lens

A function that answers a yes/no question about its input, with nothing but `true` or `false` as the result, is the same idea as a database's `WHERE` clause condition (`WHERE balance >= 100` — literally a predicate, filtering rows), a search engine's filter checkbox, and a spam filter's core decision (`is-spam?`, a predicate over an email). Lesson 26 (*Filter*) builds an entire, heavily-used tool directly on top of predicates exactly like these.

### SE Lens

Naming a predicate with a trailing `?` (`eligible-for-discount?`) rather than a plain word (`eligible`) costs nothing and buys real clarity at every call site — `(if eligible-for-discount? ...)` reads as an obvious question; `(if eligible ...)` could just as easily be a non-boolean value someone forgot to check with `=` or `>`. This is a small instance of a much larger idea, Lesson 289 (*Documentation as a Formal Interface*): a name can carry part of a contract's meaning, reducing how much a reader has to infer from context alone.

---

## Concept Unit: Combining Predicates — `and`, `or`, `not`

### The Problem

Lesson 1's full bank-account constraint was really two conditions joined together: reject a withdrawal *if* it would take the balance negative — meaning apply it only when the balance is large enough. A real specification often needs several yes/no questions combined into one — "is the amount positive *and* does the balance cover it" — not just one predicate at a time. How do individual predicates combine into a single boolean?

### Introduce the concept in isolation

```
user=> (and (> 5 3) (< 5 10))
true
user=> (and (> 5 3) (< 5 2))
false
user=> (or (> 5 3) (< 5 2))
true
user=> (not (> 3 5))
true
```

`and` is true only when every one of its arguments is true; `or` is true when at least one is; `not` reverses a single value. So far, unsurprising. Two behaviors worth proving directly, though:

**`and` and `or` don't always evaluate every argument.** Confirm with a form that would print something if it ran:

```
user=> (and false (println "should not print"))
false
```

Nothing printed. `and` checked its first argument, found it falsy, and stopped — the second argument, `(println ...)`, was never evaluated at all. This is called **short-circuiting**: once the overall answer is already determined, there's no reason to evaluate what's left. `or` does the same thing in reverse — stopping the instant it finds something truthy:

```
user=> (or true (println "should not print either"))
true
```

**`and` and `or` don't always return a plain boolean.** Compare:

```
user=> (and 5 10)
10
user=> (or false 7)
7
```

`(and 5 10)` returns `10`, not `true`. `and` doesn't ask "are both of these `true`" — it evaluates arguments left to right and returns the first falsy one it finds, or, if none are falsy, whatever the *last* one evaluated to. `or` returns the first truthy one it finds, or the last one if none are truthy. (If you've used Python, this will look familiar: Python's `and`/`or` behave the same way — `5 and 10` in Python is also `10`, not `True`.)

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
(and (> 5 3) (< 5 10))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`and`** — first appearance (covered fully in Objects and methods used, above): combines its arguments, short-circuiting on the first falsy one.
- **`(> 5 3)`, `(< 5 10)`** — reappearing predicate calls (this lesson's Concept Unit 1); each evaluates to a boolean, which `and` then combines.

### CS Lens

Short-circuit evaluation — stop as soon as the answer is already known — is the same idea as a security checkpoint that stops checking further bags the moment one fails inspection (the outcome, "not cleared," is already decided), and a spell-checker that stops scanning a word the instant it finds a character not in any valid word (no point checking the rest). Lesson 137 (*Search, Pruning, and Heuristics*) is this exact idea, generalized to entire search spaces instead of two-argument boolean expressions.

### SE Lens

Short-circuiting isn't just an optimization — it's frequently load-bearing for correctness. A check like `(and (not (nil? balance)) (>= balance amount))` depends on the first condition being checked *first*: if `balance` really were `nil`, evaluating `(>= balance amount)` at all could be an error, not just wasted work. Writing conditions in an order that relies on earlier ones to make later ones safe to evaluate is a real, common pattern — and only works because `and`/`or` are guaranteed to stop, not merely likely to.

### Connection to the previous unit

The previous unit introduced individual predicates; this unit shows how their boolean results combine into more complex conditions — the actual mechanism Lesson 1's compound constraint needs.

---

## Concept Unit: Truthiness — Which Values Count as False?

### The Problem

`and` and `or`, per the previous unit, don't strictly require `true`/`false` — `(and 5 10)` treated `5` and `10` as something other than a literal boolean, and still made a decision. What decides whether an arbitrary value like `5`, `0`, or `nil` counts as "yes" or "no" in a context expecting a boolean?

### Introduce the concept in isolation

If you've used Python, `0` is falsy there — `if 0:` doesn't run its body. Check whether Clojure agrees:

```
user=> (if 0 :truthy :falsy)
:truthy
```

It doesn't. In Clojure, `0` counts as **truthy** — the `if` above took the truthy branch. Now check what Clojure's actual falsy values are:

```
user=> (if nil :truthy :falsy)
:falsy
user=> (if false :truthy :falsy)
:falsy
```

**`nil`** — Clojure's "nothing" value, the same role Python's `None` plays — and **`false`** are the *only two* falsy values in Clojure. Every other value — `0`, an empty string, an empty collection, anything at all besides those exact two — is truthy. This directly explains the previous unit's `(and 5 10)` returning `10`: `5` is truthy (not `nil` or `false`), so `and` moved on to evaluate `10`, and since `10` was the last argument, that's what came back.

This is a real, verified difference from Python's rules (where `0`, empty strings, and empty collections are all falsy), not a minor detail — code translated from Python that relies on "zero means false" will silently behave differently in Clojure, taking the *truthy* branch exactly where a Python programmer's instinct would expect the falsy one.

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
(if 0 :truthy :falsy)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`if`** — previewed here as the thing whose condition position reveals truthiness directly; given full treatment in the next unit.
- **`0`** — reappearing numeric literal (Lesson 2), but in a new position: the condition of an `if`, revealing that its truthiness (truthy) is being tested, not its equality to anything.
- **`:truthy`, `:falsy`** — first appearance of a **keyword** (a Clojure value that stands for itself, written with a leading colon) — used here only as two clearly-labeled, self-describing return values so the isolated example's result is unambiguous to read. Full treatment of keywords as their own concept is out of scope for this lesson; they're standing in here for "yes" and "no" the same way plain words would in an English sentence.

### CS Lens

A rule for which values count as true besides the literal boolean `true` is called **truthiness**, and different languages draw this line in genuinely different places — Also recognized in: JavaScript (`0`, `""`, and `null` are all falsy, closer to Python's rule than Clojure's), C (any nonzero number is true, `0` is false — yet another rule), and Lesson 173 (*Type Systems*), which frames this whole family of design choices formally, as one instance of a language deciding what's allowed where.

### SE Lens

Clojure's rule — only `nil` and `false` are falsy — is deliberately simple and uniform: no special case for zero, empty collections, or empty strings, unlike several widely-used languages. The tradeoff is real in both directions: Python's richer truthiness rule lets `if my_list:` mean "if the list is non-empty" concisely; Clojure requires that check spelled out explicitly (something like checking the collection's count, a topic for later lessons). What Clojure's rule buys back is predictability: exactly two values are ever falsy, memorized once, with no per-type exceptions to remember.

### Connection to the previous unit

The previous unit showed `and`/`or` returning values that weren't strictly `true`/`false`; this unit is the precise rule that explains how any such value gets sorted into "counts as true" or "counts as false" in the first place.

---

## Concept Unit: `if` — Choosing a Branch Based on a Predicate

### The Problem

Every function this series has written so far computes the same kind of result no matter what its arguments are — `apply-deposit` always adds. Lesson 1's bank-account constraint needs a function that behaves *differently* depending on a condition: apply a withdrawal if the balance covers it, leave the balance unchanged otherwise. Nothing built so far can express "do one of two different things, chosen by a predicate."

### Introduce the concept in isolation

```
user=> (if (> 5 3) :yes :no)
:yes
user=> (if (>= 100 150) (- 100 150) 100)
100
```

`if` takes three parts: a condition, a "then" branch, and an "else" branch. `(>= 100 150)` is falsy (`100` is not `≥` `150`), so `if` evaluated and returned the else branch, `100`, without ever evaluating the then branch, `(- 100 150)`. Confirm this precisely — that the untaken branch really doesn't run, not just that its value doesn't get returned:

```
user=> (if true 1 (println "should not print"))
1
user=> (if false (println "should not print, either") 2)
2
```

Neither `println` ran. `if` doesn't evaluate both branches and discard one — it evaluates the condition first, then evaluates *only* the branch that condition selects.

Now, finally, Lesson 1's constraint, completed in real code:

```
user=> (defn apply-withdrawal [balance amount] (if (>= balance amount) (- balance amount) balance))
#'user/apply-withdrawal
user=> (apply-withdrawal 100 30)
70
user=> (apply-withdrawal 100 150)
100
```

`(apply-withdrawal 100 30)`: `(>= 100 30)` is truthy, so the withdrawal is applied — `70`. `(apply-withdrawal 100 150)`: `(>= 100 150)` is falsy, so the balance is returned unchanged — `100`, exactly matching Lesson 1's hand-traced rule ("reject a withdrawal that would take the balance below zero") for the first time in real, running code, three lessons after Lesson 4 first had to defer it.

### Discard the throwaway example

REPL-only, but `apply-withdrawal` is worth keeping in mind — the Exercises and Connect the Pieces below build on it directly.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of Lesson 1's own specification.
- **Files affected**: None yet (see Connect the Pieces, below, for a saved-file version).
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn apply-withdrawal [balance amount]
  (if (>= balance amount)
    (- balance amount)
    balance))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`if`** — first appearance as a called special form (covered fully in Objects and methods used, above): evaluates its condition, then evaluates and returns exactly one of the two remaining expressions.
- **`(>= balance amount)`** — reappearing predicate call (Concept Unit 1), now using parameters (Lesson 4) instead of literals — the condition `if` bases its choice on.
- **`(- balance amount)`** — reappearing form (Lesson 2's `-`); the then-branch, evaluated only when the condition is truthy.
- **`balance`** — reappearing symbol lookup (Lesson 3); the else-branch, evaluated only when the condition is falsy — simply returning the balance unchanged, exactly Lesson 1's specified behavior for a rejected withdrawal.

### CS Lens

Choosing between two computations based on a condition is the single most fundamental form of **control flow** beyond straight-line evaluation — every loop, every recursive base case (Lesson 22), and every algorithm's decision point (Section VI, throughout) is built from this same "evaluate a condition, take one of the resulting paths" shape. Also recognized in: a fork in a physical road (only one path is actually traveled, regardless of how many were visible), and a light switch (exactly one of two circuits is completed, never both, never neither).

### SE Lens

`if`'s guarantee that only the taken branch ever evaluates is not a minor implementation detail — real code routinely relies on it for correctness, not just performance: a check like `(if (not (nil? balance)) (>= balance amount) false)` depends on `(>= balance amount)` never running when `balance` is `nil`, because comparing `nil` to a number would itself be an error. Without a guarantee that the untaken branch is skipped entirely, this kind of "check it's safe, *then* use it" pattern — used constantly, in every language with a conditional — wouldn't be trustworthy.

### Run it. Show the real output.

```
user=> (apply-withdrawal 100 30)
70
user=> (apply-withdrawal 100 150)
100
```

Verified this session via Babashka v1.13.219.

### Connection to the previous unit

The previous unit established which values count as truthy and falsy; this unit shows the actual place that classification matters — an `if`'s condition — and uses it to finally give Lesson 1's bank-account specification a complete, correct implementation.

---

## Concept Unit: Implication and Equivalence — Building New Connectives from the Basic Three

### The Problem

Lesson 1's constraint — "if a withdrawal would exceed the balance, reject it" — has a shape none of `and`, `or`, or `not` directly names: "if [condition], then [consequence]." Clojure has no built-in `implies` function. Can this shape be built from the three connectives already available, the way `apply-withdrawal` was built from `if` and `>=`?

### Introduce the concept in isolation

Logical implication, "if p then q," is false in exactly one case: p is true and q turns out false. Every other combination is true — including, perhaps surprisingly, whenever p itself is false ("if p then q" makes no claim at all when p never held in the first place). That's exactly captured by "not-p, or q":

```
user=> (defn implies [p q] (or (not p) q))
#'user/implies
user=> (implies true true)
true
user=> (implies true false)
false
user=> (implies false true)
true
user=> (implies false false)
true
```

All four combinations match the definition of implication exactly: false only in the `true`/`false` case. Equivalence — "p if and only if q," true exactly when p and q match — follows the same way, built from implication in both directions:

```
user=> (defn iff [p q] (and (implies p q) (implies q p)))
#'user/iff
user=> (iff true true)
true
user=> (iff true false)
false
user=> (iff false false)
true
```

Neither `implies` nor `iff` needed any new language feature — both are ordinary functions (Lesson 4), built entirely from `and`, `or`, and `not` (Concept Unit 2), the same way `apply-withdrawal` was built from `if` and an already-known predicate.

### Discard the throwaway example

REPL-only — though `implies` and `iff`, like `apply-withdrawal`, are worth remembering; Lesson 8's truth tables verify these exact definitions systematically.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn implies [p q] (or (not p) q))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(defn implies [p q] ...)`** — reappearing two-parameter function definition (Lesson 4); nothing new in shape.
- **`(or (not p) q)`** — reappearing `or` and `not` (Concept Unit 2), composed together (Lesson 5) to build a connective neither one expresses alone. `(not p)`, evaluated first per Lesson 2's sub-expression rule, is truthy exactly when `p` is falsy; `or` then returns true if *either* `p` was already false, or `q` is true — precisely implication's definition.

### CS Lens

Implication is the exact logical shape behind every "precondition implies guaranteed behavior" contract in software — Lesson 274 (*Interfaces*) and Lesson 277 (*Testing as Specification*) both rely on this shape directly: "if the input is valid, the function returns a correct result" is an implication, and it says nothing at all about what happens when the input isn't valid, the same way `(implies false anything)` is always `true` regardless of `anything`. Also recognized in: a warranty ("if the product fails under normal use, we'll replace it" — makes no claim about failures from misuse), and a mathematical theorem's hypothesis and conclusion.

### SE Lens

Building `implies` and `iff` from three primitives that already existed, rather than needing the language to provide them directly, is a small, concrete instance of a much larger idea this series returns to constantly: a handful of well-chosen fundamental operations (here, `and`, `or`, `not`) can generate a much larger space of useful behavior (here, every one of the sixteen possible two-input boolean connectives) without needing each one built in separately. Lesson 140 (*Algebraic Structures*) and Lesson 185 (*Boolean Circuits*) both revisit exactly this fact — that `and`, `or`, and `not` alone are enough to build any boolean function whatsoever.

### Connection to the previous unit

The previous unit finally implemented Lesson 1's constraint directly with `if`; this unit steps back and names the deeper logical shape that constraint always had — "if [condition], then [consequence]" — and shows it, too, is built from the same three connectives, not a fourth, separate primitive.

---

## Connect the Pieces

Save this to a file, `withdrawal.clj`, exercising every idea from this lesson at once:

```clojure
(defn valid-withdrawal-amount? [amount]
  (> amount 0))

(defn apply-withdrawal [balance amount]
  (if (and (valid-withdrawal-amount? amount) (>= balance amount))
    (- balance amount)
    balance))

(println "Balance after withdrawing 30 from 100:" (apply-withdrawal 100 30))
(println "Balance after withdrawing 150 from 100:" (apply-withdrawal 100 150))
(println "Balance after withdrawing -5 from 100:" (apply-withdrawal 100 -5))
```

Run it:

```
Balance after withdrawing 30 from 100: 70
Balance after withdrawing 150 from 100: 100
Balance after withdrawing -5 from 100: 100
```

`valid-withdrawal-amount?` is a predicate (Concept Unit 1); `and` combines it with the balance check, short-circuiting appropriately if the amount is already invalid (Concept Unit 2); `if` chooses the correct branch based on the combined, truthy-or-falsy result (Concept Units 3 and 4); and the whole condition — "the amount is valid and the balance covers it" — is the precise, complete version of the implication Concept Unit 5 named: *if* both conditions hold, apply the withdrawal; otherwise, leave the balance untouched, exactly as Lesson 1 specified from the very beginning of this series.

## What Breaks Without This

Suppose the `and` in `apply-withdrawal` were mistakenly written as `or`:

```clojure
(defn broken-withdrawal [balance amount]
  (if (or (valid-withdrawal-amount? amount) (>= balance amount))
    (- balance amount)
    balance))
```

```
user=> (broken-withdrawal 100 -5)
105
```

A withdrawal of `-5` — invalid on its own terms, per `valid-withdrawal-amount?` — was still applied, because `(>= 100 -5)` is true, and `or` only needs *one* truthy condition to proceed. The balance came out `105`, larger than it started — an "amount" that should never have been accepted at all silently became a deposit. This is exactly the kind of technically-computed, practically-wrong result Lesson 1 warned about from its very first Concept Unit: nothing crashed, no error appeared, and the constraint that was supposed to prevent this — reduced to the wrong connective — quietly failed to do its job.

## Exercises

1. **Trace.** By hand, trace `(and (> 10 5) (< 10 20) (not (= 10 10)))` — three conditions combined. What's the final value, and which condition made it so?
2. **Predict.** Predict, then verify: does `(if [] :truthy :falsy)` return `:truthy` or `:falsy`? (An empty vector, `[]`, hasn't been formally taught yet — just apply this lesson's truthiness rule directly: is `[]` `nil` or `false`?)
3. **Truthiness.** Write down, from memory, exactly which two values are falsy in Clojure. Then write one sentence contrasting this with what you'd expect in Python for the number `0`.
4. **Break it, on purpose.** Take `apply-withdrawal` and change `>=` to `>`. Find a concrete balance and amount where the two versions disagree, and explain in one sentence which one matches Lesson 1's original specification (hint: check the boundary case where the withdrawal amount exactly equals the balance).
5. **Generalize.** Using `implies`, write a predicate `safe-to-apply?` that captures "if the amount is negative, the withdrawal must not exceed the balance" — a real implication, not just an `and`.
6. **Reconstruct.** Close this lesson. From memory, explain why `(and 5 10)` returns `10` rather than `true`, using the words "short-circuit" and "truthy" — and explain why `implies` returns `true` whenever its first argument is `false`, without looking back at the truth table.

## Definition of Done

- [ ] You can define a predicate, combine it with `and`/`or`/`not`, and use the result in an `if`, without looking back at this lesson.
- [ ] You can state, from memory, Clojure's exact truthiness rule, and how it differs from Python's for the number `0`.
- [ ] `apply-withdrawal` correctly rejects a withdrawal exceeding the balance and correctly applies one that doesn't — verified yourself, not just read.
- [ ] You completed Exercise 4 and can explain the boundary-case difference between `>=` and `>` in this specific function.
- [ ] Commit `withdrawal.clj` (or your own version, including Exercise 5's `safe-to-apply?`) to your notes repository, with a commit message explaining *why* the condition needs `and`, not `or` — for example, `"Fix withdrawal condition to use and — or let invalid amounts through as valid withdrawals"` — not just `"lesson 7 file"`.

---

**Next lesson:** Lesson 8, *Truth Tables and Logical Equivalence*, systematizes what this lesson built by hand — deriving a mechanical way to check whether two logical expressions (like this lesson's `implies` and a differently-written version of the same idea) are truly, provably equivalent, not just equal on the handful of cases tried so far.
