# Lesson 2: Naming Behavior, Not Just Values

*(Continues directly from Lesson 1. Same schema rules apply throughout, including the isolate-proves
/ walkthrough-explains split established at the end of that lesson.)*

## What you will build

`lesson01.clj` gave you a way to name a *fixed* value with `def` — once bound, `favorite-number` is
always `7`. That's not enough to build anything real: real programs need names bound to *behavior*,
something that computes a fresh result from whatever input it's handed, not a memorized answer. This
lesson builds your first function, `double-it`, using `defn` — and along the way introduces the second
kind of bracket Clojure has, `[]`, first as plain data, then reused as a function's parameter list.

## What you need to know first

Lesson 1: S-expressions and prefix notation (a parenthesized list is a call — its first element must
resolve to a function, evaluated against the rest of the list); `def` as a special form that binds a
symbol to a value without evaluating that symbol first; a symbol's meaning depending on its position
(naming a function to call, naming a thing to bind, resolving to an already-bound value).

## Terms introduced in this lesson

- **Vector** — a literal collection written with square brackets, `[...]`, that evaluates to itself
  rather than being treated as a call. The term exists because Clojure needs a way to write down a
  fixed group of things — three numbers, a list of parameters — without that group being mistaken for
  an instruction to call the first item as a function, which is exactly what parentheses would mean.
- **Parameter** — a symbol inside a function's definition that stands in for whatever value will be
  supplied when the function is actually called. The term exists to separate "the placeholder name
  used while defining the function" from "the specific value handed in on any one call" — you need
  both concepts to talk about functions precisely.
- **Arity** — the number of arguments a function is defined to accept. The term exists because
  Clojure enforces this number strictly and reports mismatches by name (an "arity" error), so you
  need a word for "wrong number of arguments" that's more precise than that phrase.

## Functions and special forms used

- **`defn`**
  - *What it is:* a special form for defining a named function — it combines "bind this name" (the
    same job `def` does) with "and the value is a function that runs this code" in one form.
  - *Implementation:* `(defn function-name [param1 param2 ...] body-expr1 body-expr2 ...)`. Like
    `def`, it does not evaluate `function-name` — it uses that symbol literally as the name to bind.
    Unlike `def`, its bound value isn't a plain value handed in directly; it's a function built from
    the parameter vector and body that follow.
  - *Its use:* the only way, so far in this curriculum, to define behavior you can reuse with
    different inputs, rather than a single fixed value.
- **`*`**
  - *What it is:* a built-in function that multiplies numbers. (Same category as `+` from Lesson 1 —
    see that lesson's `+` entry for the full treatment of prefix notation and variable-arity
    arithmetic functions; nothing about `*` behaves differently.)
  - *Implementation:* takes zero or more numeric arguments and returns their product; `(* 3 4)`
    returns `12`.
  - *Its use:* the computation inside `double-it`'s body.
- **`def`**
  - *What it is / Implementation:* unchanged from Lesson 1 — see that lesson's full entry.
  - *Its use here:* binds a name to a vector instead of a bare number, which is the whole reason
    Concept Unit 1 below exists — to show `def` working on a new kind of value.

---

## Concept Enumeration (written before any Concept Unit below)

This lesson's full code:

```clojure
(def measurements [12 47 8])

(defn double-it [n]
  (* n 2))

(double-it 21)
```

1. `(` `)` around the `def` form — **reused** (Lesson 1's S-expression shape), one-clause reminder.
2. `def` — **reused** (Lesson 1, full treatment already given), one-clause reminder.
3. `measurements` as the name being bound — **reused role** (a symbol as a name to attach, same job
   `favorite-number` did), one-clause reminder.
4. `[` `]` around `12 47 8` — **new**: a vector, a second literal syntax alongside the S-expression,
   meaning "this is data" rather than "call this."
5. `12`, `47`, `8` — numeric literals — **basic, silent**.
6. `(` `)` around the `defn` form — **reused**, one-clause reminder.
7. `defn` — **new**: a special form for defining a function, distinct from `def` even though it
   shares `def`'s "don't evaluate the name" behavior.
8. `double-it` as the name being bound — **reused role** (same job as #3), one-clause reminder.
9. `[n]` — **reused shape** (#4's vector syntax) in a **new role**: a parameter list rather than a
   fixed data collection — worth its own explanation, not silent, since the *role* is new even though
   the *syntax* isn't.
10. `(` `)` around `(* n 2)` — **reused**, one-clause reminder.
11. `*` — **reused** (per the header entry above), one-clause reminder — same category as `+`, no
    new behavior to explain.
12. `n` inside `(* n 2)` — **new role** for a symbol: resolving to whatever value was passed in for
    this specific call, which is different from resolving to a `def`-created permanent binding —
    worth calling out as its own thing, not folded silently into "symbol resolution, already covered."
13. `2` — literal — **basic, silent**.
14. The function body as a whole (here, just `(* n 2)`) evaluating to `double-it`'s return value with
    no `return` keyword — **new**: implicit return.
15. `(double-it 21)` at the top level — **reused** call syntax (S-expression), but the **first
    appearance of a user-defined function in the operator position** rather than a built-in one —
    worth a clause noting the language makes no distinction between the two.
16. `21` — literal — **basic, silent**.

Result: two Concept Units. Unit 1 covers items 1–5 (vectors as data). Unit 2 covers items 6–16
(`defn`, parameters, implicit return, calling a user-defined function).

---

## Concept Unit: Vectors — A Second Kind of Bracket

### The Problem

You have three related numbers you want to keep together as one group — say, three measurements from
a job. Lesson 1 only gave you one kind of bracket, `()`, and you already know exactly what `()` means:
a call, first element resolved to a function. Try to use it for a plain group of numbers and you'd be
writing `(12 47 8)` — which Clojure will try to run as a function call with `12` in the operator
position. You need a way to write "just a group of values" that can't be misread as "call the first
one."

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `lesson02.clj` — created.
- **Change type:** add.
- **Location:** first line of the new file.
- **Dependencies:** the running REPL from Lesson 1.

### The New Code — type it yourself

```clojure
(def measurements [12 47 8])
```

### The Updated Project

Skipped — first line of a brand-new file, same exception as Lesson 1 Concept Unit 1.

### Isolate the Concept, Anchored to the Code Above

```
user=> (12 47 8)
Execution error (ClassCastException) at user/eval2 (REPL:1).
class java.lang.Long cannot be cast to class clojure.lang.IFn
user=> [12 47 8]
[12 47 8]
user=> []
[]
```

What this proves: parentheses around plain numbers really do try to call the first one — `12` isn't a
function, so it fails exactly the way Lesson 1's evaluation rule predicts. Square brackets around the
same numbers don't fail; they evaluate to themselves, unchanged, even with nothing inside. This is
called a **vector**. Why square brackets get to skip the "first element must be a function" rule that
parentheses enforce is covered in the Mechanical Walkthrough below.

### Discard the Throwaway Example

The bare `(12 47 8)` error probe and the empty `[]` check above were only run to prove the
data-versus-call distinction — neither goes into `lesson02.clj`. Only the `def` line stays.

### Mechanical Walkthrough

- **`(` `)`** around the whole `def` form — *(b) hard concept reappearing.* The same S-expression
  shape from Lesson 1: a parenthesized list, `def` in the operator position, evaluated as a call to
  that special form.
- **`def`** — *(b) hard concept reappearing.* The special form from Lesson 1 that binds a symbol to a
  value without evaluating that symbol first; nothing new about its behavior here.
- **`measurements`** — *(b) hard concept reappearing,* same role Lesson 1's `favorite-number` played:
  a symbol used as a literal name to bind, not resolved to anything.
- **`[` `]`** — *(a) first appearance.* Vectors are not a special case carved out of list syntax —
  they're the reader's second, entirely separate literal form, and the evaluator's rule for a vector
  is different from its rule for a list: evaluate each element in place, then return the collection of
  results, with no attempt to treat the first element as a function to call. That's the whole reason
  `[12 47 8]` from the isolated lab above evaluates cleanly while `(12 47 8)` doesn't — they're not
  the same rule with brackets swapped, they're two different rules, and the bracket shape is what
  tells the reader which one applies before it even looks at what's inside.
- **`12`, `47`, `8`** — *(c) genuinely basic, already-established* numeric literals.

### CS Lens

The concept here is a **self-evaluating literal** for a collection — syntax whose evaluation is just
"here is the data," with no call semantics attached, as opposed to a form that has to be evaluated to
produce a result.

```
Also recognized in: JSON arrays, Python/JS list literals, tuples, fixed-width records in a database
row, a CNC program's coordinate list (X, Y, Z) as plain positional data rather than a command
```

### SE Lens

The alternative Clojure didn't choose is the one older Lisps actually use: one bracket type (`()`)
for everything, with a special quote marker, `'(12 47 8)`, telling the reader "don't evaluate this as
a call." That approach is more uniform — one bracket shape, period — but it pushes a real cost onto
every single line of data: forget the quote mark once and a plain data list silently becomes an
attempted function call. Clojure's two-bracket approach spends a small, fixed cost (one more literal
syntax to learn) to buy a much bigger one back: the distinction between "this is data" and "this is a
call" is visible at the bracket itself, so it can't be forgotten line by line the way a quote mark can.
The debt this incurs shows up later, not now: Clojure eventually adds still more bracket-like literals
(`{}` for maps, `#{}` for sets), so "which bracket means what" becomes its own small thing to hold in
memory — a cost this lesson is deliberately not paying yet, with only two shapes in play.

### Commands Needed

None beyond the already-running REPL.

### Run It

```
user=> (def measurements [12 47 8])
#'user/measurements
```

### Connection

Vectors exist now as a standalone idea: a bracket shape that means "fixed group of data, no call
semantics." Concept Unit 2 reuses this exact same syntax for a second purpose — not holding data
values, but holding the *names* a function expects to receive.

---

## Concept Unit: `defn` — Functions That Compute, Not Just Recall

### The Problem

`measurements` always means `[12 47 8]` — `def` gave you a name for one fixed value, permanently.
That's fine for a constant, but it can't double a number, or double *any* number you hand it — for
that you need something that runs the same computation fresh, on whatever input you give it, each
time it's called. Nothing you've learned so far can do that: `def` binds a value once, it doesn't
describe a repeatable computation.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `lesson02.clj` — modified.
- **Change type:** add.
- **Location:** after the `def` line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's vector syntax.

### The New Code — type it yourself

```clojure
(defn double-it [n]
  (* n 2))

(double-it 21)
```

### The Updated Project

```clojure
(def measurements [12 47 8])

(defn double-it [n]      ; ← new
  (* n 2))                ; ← new

(double-it 21)            ; ← new
```

The file now does two independent things: it holds one fixed piece of data (`measurements`, from
Concept Unit 1), and it defines a reusable computation (`double-it`) which it immediately exercises by
calling it with `21`. Nothing about the vector line changed; the new lines simply came after it.

### Isolate the Concept, Anchored to the Code Above

```
user=> (double-it 21)
42
user=> (double-it 100)
200
user=> (double-it)
Execution error (ArityException) at user/eval5 (REPL:1).
Wrong number of args (0) passed to: user/double-it
```

What this proves: unlike `measurements`, which always evaluates to the same fixed vector, `double-it`
produces a different result depending on what's passed in — `21` in, `42` out; `100` in, `200` out —
so it's genuinely computing, not recalling a stored value. Calling it with no argument fails, because
`double-it` was defined to require exactly one — this required count is called its **arity**. Why the
parameter vector is what enforces that count, and why the function's last expression becomes its
result with no `return` keyword, is covered in the Mechanical Walkthrough below.

### Discard the Throwaway Example

The `(double-it 100)` and `(double-it)` calls above were only run to prove that `double-it` computes
fresh per call and enforces its arity — neither line goes into `lesson02.clj`. Only `(double-it 21)`
stays in the file.

### Mechanical Walkthrough

- **`(` `)`** around the `defn` form — *(b) hard concept reappearing,* same S-expression shape as
  every prior form.
- **`defn`** — *(a) first appearance.* A special form for defining a function — like `def`, it treats
  its second element (`double-it`) as a literal name rather than evaluating it, for the same reason
  `def` does: the name can't exist yet, so evaluating it first would fail. What `defn` does that plain
  `def` doesn't is take the rest of the form — the parameter vector and the body that follow — and
  build a function value out of them before binding it to that name. (`defn` is, under the hood, built
  out of `def` plus a separate function-creating form called `fn` — that machinery gets its own full
  treatment in a later lesson; for now, treat `defn` as the single form that defines a named function.)
- **`double-it`** — *(b) hard concept reappearing,* same "literal name being bound" role Lesson 1's
  `favorite-number` and this lesson's `measurements` both played.
- **`[n]`** — *(a) first appearance of this role.* The same vector syntax Concept Unit 1 just taught,
  reused as a parameter list: each symbol inside it (`n`) becomes a name that the function's body can
  use, standing for whatever value gets passed in on a given call. This is also what enforces
  **arity** — the isolated lab above showed `(double-it)` failing with an arity error, and the reason
  is directly visible here: the vector declares exactly one required parameter, so a call supplying
  zero arguments has nothing to bind `n` to, and Clojure refuses to run the function rather than leave
  `n` meaning nothing.
- **`(` `)`** around `(* n 2)` — *(b) hard concept reappearing,* the same S-expression call shape.
- **`*`** — *(b) hard concept reappearing* (see the header's `*` entry — same category as `+`, no new
  behavior).
- **`n`** inside `(* n 2)` — *(a) first appearance of this specific role.* This is a symbol resolving
  to a value, the same general job `favorite-number` did when passed to `println` in Lesson 1 — but
  there it resolved to a single, permanent `def`-created binding; here it resolves to whichever value
  was supplied on *this particular call*, and would resolve to something different on the next one
  (proven above: `21` and `100` gave `n` two different values in two different calls to the same
  code). Same general concept, genuinely different lifetime.
- **`2`** — *(c) basic, already established.*
- **The function body as a whole**, `(* n 2)`, being what `double-it` returns — *(a) first
  appearance: implicit return.* There's no `return` keyword anywhere in this code, and none is
  missing — a Clojure function's value is simply whatever its last body expression evaluates to. With
  only one expression in the body here, that expression's result *is* the whole function's result,
  which is exactly what the isolated lab's `21 → 42` and `100 → 200` results are showing.
- **`(double-it 21)`** — *(a) first appearance of a user-defined function in the operator position.*
  Structurally this is identical to `(+ 1 2)` or `(println favorite-number)` from Lesson 1 — a list,
  first element resolved to a function, applied to the rest. The only thing that's new is *where*
  that function came from: Lesson 1's `+` and `println` were built into the language; `double-it` was
  just defined two lines above, in this file, by you — and the call syntax doesn't care about that
  difference at all.
- **`21`** — *(c) basic, already established.*

### CS Lens

Binding names inside a function definition to values supplied at call time is **parameter passing** —
the mechanism that lets one piece of defined behavior run against many different inputs instead of
being rewritten for each one.

```
Also recognized in: mathematical function notation f(x), a CNC subroutine call passing feed rate and
depth as parameters, a database stored procedure taking arguments, a spreadsheet named formula that
takes a cell range as input
```

### SE Lens

The alternative not chosen is writing the computation inline everywhere it's needed — `(* 21 2)` here,
`(* 100 2)` there, instead of naming it once as `double-it`. Inline is marginally shorter for a
one-off use and avoids the small ceremony of `defn`. The cost it avoids paying: if the doubling logic
ever needs to change — say, to round the result, or log every call — every inline copy has to be found
and updated individually, and it's easy to miss one. `defn` centralizes that decision behind one name,
at the cost of one level of indirection between "I want double" and "here's the actual math." At this
lesson's trivial scale that indirection barely matters; the real payoff compounds as the logic behind
a name gets more complex than one arithmetic operation, which later lessons will demonstrate directly.

### Commands Needed

None beyond the already-running REPL.

### Run It

```
user=> (defn double-it [n]
  (* n 2))
#'user/double-it
user=> (double-it 21)
42
```

### Connection

Concept Unit 1 introduced vectors as a way to write "fixed data, not a call." This unit reused that
exact syntax for a second, different job — declaring the names a function expects — which is the same
kind of move Lesson 1 made when it reused the S-expression shape for both `+` calls and `def`: one
piece of syntax, more than one role, distinguished by context rather than by inventing new syntax for
every new use.

---

## Closing

### Connect the Pieces

Trace the vector syntax itself across the whole lesson: it's born in Concept Unit 1 to hold three
unrelated numbers, `[12 47 8]`, with no function-call meaning attached. Concept Unit 2 reuses the
identical bracket syntax, unchanged, as `[n]` — this time declaring one parameter instead of holding
three data values. When `(double-it 21)` runs, that parameter vector is what tells Clojure to bind `n`
to `21` for the duration of this one call; `(* n 2)` then evaluates using that binding, produces `42`,
and — because a function's last body expression is its implicit return value — `42` is what
`double-it` itself evaluates to. Same bracket syntax, taught once, doing two structurally different
jobs by the end of the lesson.

### What Breaks Without This

Remove the vector brackets from the parameter list and try to define the function:

```
user=> (defn double-it n
  (* n 2))
Syntax error compiling defn at (REPL:1:1).
Parameter declaration n should be a vector
```

The error names exactly what's missing — confirming that `defn` isn't loosely expecting "something to
bind names from," it specifically requires the vector syntax Concept Unit 1 taught, not just any
symbol or shape in that position. Restore the brackets before continuing.

### Exercises

1. Write a new function, `triple-it`, that triples its input instead of doubling it, and call it with
   a number of your choice.
2. Predict, then check: what happens if you call `(double-it measurements)` — passing the *vector*
   from Concept Unit 1 instead of a number? Read the real error and explain, in one sentence, why `*`
   rejects it, using what Lesson 1 and this lesson have both established about what `*` actually does.
3. Write a two-parameter function, `add-them`, that takes two numbers and returns their sum, using
   `+` from Lesson 1. You haven't been taught anything new to do this — the parameter vector already
   proved in Concept Unit 1 that it can hold more than one item.

### Definition of Done

- [ ] `lesson02.clj` exists and contains exactly the four lines shown in the final "Updated Project."
- [ ] You've run every line in a live REPL and seen the real output shown in this lesson.
- [ ] You can explain, without looking back at this file, why `[12 47 8]` evaluates cleanly while
      `(12 47 8)` doesn't.
- [ ] You can explain why `double-it 21` returns `42` with no `return` keyword anywhere in the code.
- [ ] You've completed all three exercises above.
- [ ] `git commit -m "Lesson 2: learn that defn reuses vector syntax as a parameter list, and that a
      function's last body expression is its return value with no explicit return"`
