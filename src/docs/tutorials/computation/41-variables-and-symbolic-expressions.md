# Lesson 41: Variables and Symbolic Expressions

**What you will build**: By the end of this lesson you'll be able to represent an algebraic expression containing a variable — like `3x + 5` — as real Clojure data, using exactly the recursive, tree-shaped structure Lesson 30 already built for a different purpose, and write a function that evaluates such an expression once a value for the variable is supplied. This is Section II's recursive data thinking, redirected from lists and trees onto algebra itself.

**What you need to know first**: Lesson 30's tree representation (a value together with its parts) and Lesson 19's recursive definitions with more than one base case.

**Terms introduced in this lesson**:

- **symbolic expression** — an expression that may contain a variable, and so cannot be evaluated to a specific value without knowing what that variable stands for. *Why it matters*: distinguishes this lesson's subject from every expression this series has evaluated since Lesson 2, all of which reduced to exactly one value on their own, with nothing left unknown.
- **symbol** — a Clojure value that names something — a variable, an operator — without evaluating it. *Why it matters*: this is what lets `x` or `+` be treated as *data* (a name to inspect and manipulate) rather than immediately triggering a lookup or a function call, the exact distinction this lesson's first unit needs precisely.

**Objects and methods used**:

- **`quote`** (and its shorthand, `'`)
  - *What it is:* a special form in Clojure that prevents its argument from being evaluated, returning it as literal data instead.
  - *Implementation:* `(quote expr)`, or equivalently `'expr` — established behavior: `(first '(+ 2 x))` returns the symbol `+` itself, not the result of calling the `+` function; `'x` is the bare symbol `x`, not a lookup of whatever `x` might be bound to.
  - *Its use:* Concept Unit 2, to represent an expression as inspectable data instead of code Clojure would otherwise try to run immediately.
- **`number?`**
  - *What it is:* a predicate in Clojure's core library testing whether a value is a number.
  - *Implementation:* `(number? x)` — established behavior: `(number? 5)` is `true`, `(number? 'x)` is `false`.
  - *Its use:* Concept Unit 4, to distinguish a plain numeric value from a symbol or a compound expression while evaluating.

---

## Concept Unit: Numeric vs. Symbolic Expressions

### The Problem

Every expression this series has evaluated since Lesson 2 — `(+ 2 3)`, `(* n n)`, `(fib 4)` — reduces to exactly one value, given its inputs. Algebra routinely writes expressions like `3x + 5` that *don't* reduce to one value at all, because `x` isn't known yet — the expression describes a *family* of values, one for every possible `x`. Can this series' existing tools represent that kind of expression?

### Introduce the concept in isolation

Try the obvious thing:

```
user=> (+ (* 3 x) 5)
```

```
----- Error --------------------------------------------------------------------
Type:     clojure.lang.ExceptionInfo
Message:  Unable to resolve symbol: x in this context
```

This is the exact "Unable to resolve symbol" error Lesson 3 first showed for an unbound name — Clojure tried to evaluate `(+ (* 3 x) 5)` immediately, the way it evaluates every expression, and failed the moment it needed `x`'s value to do so. Nothing about `x` being "the variable in an algebraic expression, not yet meant to be looked up" is something Clojure's ordinary evaluation rule knows how to handle — evaluation *always* tries to resolve every symbol, with no way to say "leave this one alone, I want the expression itself, not its value."

### Discard the throwaway example

Not applicable — this error is the actual motivation for the rest of this lesson.

### Generalizing

What's needed is a way to build the *shape* `(+ (* 3 x) 5)` — operator, operands, nesting, exactly the structure Lesson 2's evaluation rule already reduces — without triggering that reduction at all, so it can be inspected, manipulated, and only evaluated later, once `x` is actually known.

### CS Lens

The gap here is precisely the difference between a **symbolic expression** (a description of a computation, possibly containing unknowns) and a **numeric expression** (a computation ready to be carried out immediately) — the same *what* versus *how* distinction Lesson 1 first raised about specifications and transformations, now appearing inside a single piece of notation instead of across a whole problem.

### SE Lens

Every programming language that supports symbolic math, computer algebra, or building programs that manipulate *other* programs (Section VIII's interpreters and compilers) needs exactly this capability — treating a piece of code-shaped notation as inspectable data rather than something to run immediately. Lisp dialects, including Clojure, are specifically well-suited to this, for a reason the next unit makes concrete.

---

## Concept Unit: `quote` — Treating Code as Data

### The Problem

Is there a way to write `(+ (* 3 x) 5)` and get back the *structure* — a list containing the symbols `+`, `*`, `3`, `x`, and `5`, arranged exactly as written — without Clojure trying to evaluate any of it?

### Introduce the concept in isolation

```
user=> '(+ (* 3 x) 5)
(+ (* 3 x) 5)
user=> (first '(+ (* 3 x) 5))
+
user=> (= (first '(+ 2 x)) '+)
true
```

`'` (shorthand for `quote`) tells Clojure: *do not evaluate what follows — treat it as literal data instead.* `'(+ (* 3 x) 5)` is now an ordinary list (Lesson 24), exactly like `(list '+ (list '* 3 'x) 5)` would build directly — its first element genuinely is the **symbol** `+` itself, not a call to the addition function, confirmed by `first` returning `+` rather than triggering any arithmetic. Comparing that extracted symbol against `'+` (the same symbol, quoted separately) with `=` confirms they're identical — symbols are ordinary, comparable values, the same as numbers or strings.

This is the answer to the previous unit's problem: `'(+ (* 3 x) 5)` never asks Clojure to resolve `x` at all, because quoting suppresses evaluation entirely — the whole expression is just data, structurally identical to the code that would compute it, but inert until something deliberately chooses to evaluate it.

### Discard the throwaway example

Not applicable — quoted expressions are exactly this lesson's real subject matter.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
'(+ (* 3 x) 5)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`'`** — first appearance as its own construct (briefly mentioned but deferred in Lesson 10): suppresses evaluation of whatever follows it, returning the literal structure instead.
- **`(+ (* 3 x) 5)`**, quoted — reappearing list syntax (Lesson 2's parentheses, Lesson 24's `list`-shaped structure), but here every symbol inside it — `+`, `*`, `x` — is preserved as a symbol value, not resolved to a function or a bound value the way it would be in ordinary, unquoted code.

### CS Lens

Lisp dialects (including Clojure) are famous for this specific property: code and data share the identical underlying representation — a list. This is called **homoiconicity**, and it's exactly why `'(+ (* 3 x) 5)` (data describing a computation) and `(+ (* 3 x) 5)` (the computation, actually run) can look almost identical, differing only by one character — the quote. Section VIII's interpreters (Lesson 163) depend directly on this property: an interpreter is, fundamentally, a function that takes quoted-expression-shaped data and evaluates it deliberately, one piece at a time — precisely what this lesson's own `eval-expr`, derived in Concept Unit 4, will do in miniature.

### SE Lens

Quoting isn't a trick specific to algebra — it's the general mechanism this series will eventually need for any program that builds, inspects, or transforms other pieces of code as data, rather than only executing code directly. Learning it now, on a small, concrete case (algebraic expressions), is what makes its much larger uses, much later in this series, recognizable rather than mysterious.

### Connection to the previous unit

The previous unit hit a wall trying to write a symbolic expression directly; this unit is the specific mechanism — quoting — that gets past it, by asking Clojure not to evaluate at all.

---

## Concept Unit: A Recursive Definition for Symbolic Expressions

### The Problem

`'(+ (* 3 x) 5)` is now real, inspectable data. What, precisely, counts as a well-formed symbolic expression — the same kind of question Lesson 19 asked about natural numbers, lists, and trees?

### Introduce the concept in isolation

State it the same two-part (here, three-part) way as every recursive definition in this series:

- **Base case 1:** a number is a symbolic expression (it evaluates to itself, whatever the variable's value turns out to be).
- **Base case 2:** the symbol `x` is a symbolic expression (it evaluates to whatever value is supplied for `x`).
- **Recursive case:** a list containing an operator symbol and two symbolic expressions — `(operator expr1 expr2)` — is a symbolic expression.

`'(+ (* 3 x) 5)` fits this definition exactly: the outer list is the recursive case (`+`, with two operand expressions); its first operand, `(* 3 x)`, is itself the recursive case (`*`, with operands `3` and `x`); `3` is base case 1; `x` is base case 2; `5` is base case 1 again.

### Discard the throwaway example

Not applicable — this definition is the direct structural basis for the next unit's function.

### Generalizing

Lesson 19 explicitly allowed a recursive definition to have *more than one* base case — this is the first time this series has actually needed that allowance: a symbolic expression's smallest instances come in two genuinely different flavors (a fixed number, or the variable itself), not one.

### Formal Definition, Walked Through

- *"a number is a symbolic expression"* and *"the symbol x is a symbolic expression"* — two separate base cases, each checked independently; neither is "smaller" than the other, they're simply two different kinds of already-smallest thing.
- *"a list containing an operator symbol and two symbolic expressions"* — the recursive case, referring to two smaller instances (like Lesson 19's binary trees), each of which must itself satisfy this entire definition, all the way down to a base case.

### CS Lens

This definition, drawn as a tree, has exactly the shape Lesson 30 already built code for: an operator at each internal node, with two children — themselves either further operator nodes or leaves (numbers or `x`). A symbolic expression *is* a binary tree, with a specific, restricted meaning attached to its node values and leaves — the same "same underlying structure, different meaning" realization Lesson 30 itself made about using a plain list to represent a tree.

### SE Lens

Recognizing a symbolic expression as tree-shaped, rather than inventing a new representation from scratch, means every technique this section already built for trees — recursive evaluation, traversal, structural recursion — is immediately available and already trusted, rather than needing to be reproven for this new use.

### Connection to the previous unit

The previous unit showed *how* to represent an expression as quoted data; this unit states, precisely, what makes a piece of quoted data a *well-formed* expression in the first place — the definition the next unit's function will follow structurally.

---

## Concept Unit: Evaluating a Symbolic Expression

### The Problem

Given a symbolic expression and a specific value for `x`, derive a function — structurally, the way every function in Section II was derived — that computes the actual number the expression represents.

### Introduce the concept in isolation

```clojure
(defn eval-expr [expr x-value]
  (if (= expr 'x)
    x-value
    (if (number? expr)
      expr
      (if (= (first expr) '+)
        (+ (eval-expr (second expr) x-value) (eval-expr (first (rest (rest expr))) x-value))
        (* (eval-expr (second expr) x-value) (eval-expr (first (rest (rest expr))) x-value))))))
```

```
user=> (eval-expr '(+ (* 3 x) 5) 4)
17
```

Three cases, matching the previous unit's three-part definition exactly: if the expression *is* the symbol `x`, return the supplied value directly (base case 2); if it's a number, return it unchanged (base case 1); otherwise, it's a compound expression — check whether its operator is `+` or `*`, and recursively evaluate both operand positions, combining them with the matching real arithmetic operator (the recursive case, with two recursive calls, exactly the way Lesson 30's `tree-sum` needed two).

Trace it: `(eval-expr '(+ (* 3 x) 5) 4)` checks the outer operator, `+`, and recursively evaluates both operands — `(eval-expr '(* 3 x) 4)`, which itself recurses to `3 × 4 = 12`, and `(eval-expr 5 4)`, which hits the number base case directly, returning `5` — combining to `12 + 5 = 17`, matching `3 × 4 + 5` computed by hand.

### Discard the throwaway example

Not applicable — `eval-expr` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct structural translation of the previous unit's three-case definition.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn eval-expr [expr x-value]
  (if (= expr 'x)
    x-value
    (if (number? expr)
      expr
      (if (= (first expr) '+)
        (+ (eval-expr (second expr) x-value) (eval-expr (first (rest (rest expr))) x-value))
        (* (eval-expr (second expr) x-value) (eval-expr (first (rest (rest expr))) x-value))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= expr 'x)`** — reappearing `=` (Lesson 6), comparing the expression against the quoted symbol `x` — this only matches when `expr` genuinely *is* the bare symbol, not a compound expression that happens to contain `x` somewhere inside it.
- **`number?`** — first appearance as a called function (covered fully in Objects and methods used, above): distinguishes base case 1 from the recursive case.
- **`(second expr)`, `(first (rest (rest expr)))`** — reappearing accessor pattern (Lesson 30's tree accessors), extracting the two operand positions from a three-element list `(operator operand1 operand2)`.
- **`(= (first expr) '+)`** — reappearing `=` and `first`, checking which operator this compound expression uses, to decide which real Clojure function (`+` or `*`) should combine the two recursively-evaluated operands.

### CS Lens

`eval-expr` is a small, real interpreter — precisely the kind of function Lesson 163 studies formally, at much greater scope: it takes a piece of quoted, code-shaped data and a supporting value (here, `x`'s value; later, a whole environment, Lesson 164), and produces the value that data represents, by structurally recursing on the data's own recursive definition.

### SE Lens

`eval-expr`'s three-way branch, matching the expression definition's three cases exactly, is what makes it trustworthy the same way every structurally recursive function in Section II was: nothing was invented independently of the data's own shape — number, variable, or compound, each handled by exactly the case the definition specifies, with `+` and `*` real arithmetic operators actually doing the combining once both operands are known.

### Connection to the previous unit

The previous unit stated the recursive definition abstractly; this unit is its direct, working translation into code — the same "derive the function from the definition" method Section II established, now applied to algebra instead of lists or trees.

---

## Connect the Pieces

`eval-expr`, checked against several values of `x`, confirming it behaves like a genuine algebraic expression:

```clojure
(def expr '(+ (* 3 x) 5))

(println "3x + 5 at x=0:" (eval-expr expr 0))
(println "3x + 5 at x=4:" (eval-expr expr 4))
(println "3x + 5 at x=10:" (eval-expr expr 10))
```

```
3x + 5 at x=0: 5
3x + 5 at x=4: 17
3x + 5 at x=10: 35
```

One quoted expression, `expr`, evaluated three separate times against three different values of `x`, exactly the way `3x + 5` behaves as a genuine algebraic formula — a single symbolic description, reusable for any input, the same reuse benefit Lesson 4 first established for ordinary functions, now available for expressions represented as data rather than as code.

## What Breaks Without This

Suppose `eval-expr` were called on an expression using a symbol other than `x` — say, `'(+ y 5)` — without adjusting the function at all:

```
user=> (eval-expr '(+ y 5) 4)
```

`y` doesn't match `(= expr 'x)` (it's a different symbol), and `(number? y)` is `false` too — so the function falls into the compound-expression branch, tries `(first 'y)`, and fails, because `y` isn't a list at all, just a bare symbol `eval-expr` was never designed to recognize. This is Lesson 19's completeness clause, violated concretely: `eval-expr`'s three cases only cover *exactly* the recursive definition stated in Concept Unit 3 — a symbol other than `x` was never part of that definition, and the function has no case prepared to handle it, failing with an error rather than silently guessing.

## Exercises

1. **Trace.** By hand, trace `(eval-expr '(* (+ x 1) 2) 5)`, showing each recursive call, the way Concept Unit 4 traced `3x + 5`.
2. **Predict.** Before running it, predict `(eval-expr 7 4)` — a bare number, not a compound expression at all, passed directly to `eval-expr`. Which of the three cases handles it?
3. **Build.** Write the quoted expression for `2x - 3` — you'll need to represent subtraction somehow, given `eval-expr` currently only handles `+` and `*`. Extend `eval-expr` to support a `-` operator, and verify your expression against a hand-computed value.
4. **Break it, on purpose.** Confirm, by running it yourself, that `(eval-expr '(+ y 5) 4)` fails the way "What Breaks Without This" described. Read the actual error message.
5. **Generalize.** Write a function `has-variable?` that returns `true` if a symbolic expression contains `x` anywhere within it (at any depth), `false` otherwise — using the same three-case structural recursion as `eval-expr`, but returning a boolean instead of a number.
6. **Reconstruct.** Close this lesson. From memory, state the three-case recursive definition of a symbolic expression, and explain why `quote` was necessary before any of this lesson's code could be written at all.

## Definition of Done

- [ ] You can build a quoted symbolic expression and explain why quoting prevents Clojure from trying to evaluate it immediately.
- [ ] You can write `eval-expr`-shaped structural recursion over a symbolic expression, given its three-case definition.
- [ ] You completed Exercise 3, extending `eval-expr` to support subtraction, verified against a hand-computed value.
- [ ] You completed Exercise 5 (`has-variable?`) and verified it against expressions that do and don't contain `x`.
- [ ] Commit your extended `eval-expr` and `has-variable?` to your notes repository, with a commit message stating what you extended and why — for example, `"Extend eval-expr to support subtraction; add has-variable? using the same three-case structure, returning boolean instead of a number"` — not just `"lesson 41 exercise"`.

---

**Next lesson:** Lesson 42, *Polynomials*, builds directly on this lesson's expression-as-data representation, deriving efficient ways to represent and evaluate polynomials specifically — expressions with a single variable raised to various powers — rather than the fully general operator trees this lesson covered.
