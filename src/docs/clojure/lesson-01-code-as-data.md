# Lesson 1: Code as Data, Not Sentences

**Schema note (read once, delete before working the lesson):** This lesson applies three changes to
the schema on top of the base rules: (1) a full concept enumeration is written out *before* any
Concept Unit is drafted, not discovered mid-draft; (2) each Concept Unit shows real project code
first, then an isolated throwaway lab that explicitly refers back to it, rather than lab-then-code;
(3) the isolated lab (step 2) is proof-only — it runs code, shows real output, states in one or two
sentences what that output demonstrates, and names the concept in bold. It does not explain *why* the
concept works that way. All reasoning about why lives solely in the Mechanical Walkthrough (step 7),
so a reader has exactly one place to go to understand a piece, not two slightly different-sounding
explanations of the same thing. "Objects and methods used" is relabeled "Functions and special forms
used" below, since Clojure has no classes — flag if you'd rather I keep the original heading even
where it's a forced fit.

---

## What you will build

By the end of this lesson you'll have a running Clojure REPL, a growing file called `lesson01.clj`
containing three lines of real, working Clojure, and — more importantly — a different mental model
for what "code" even is. Every language you already know (Python, JS) writes an operator *between*
its operands: `1 + 2`. Clojure writes the operator *in front*, as the first item of a list:
`(+ 1 2)`. That's not a quirky syntax choice you memorize and move past — it's the visible surface
of the idea that Clojure code and Clojure data are made of the exact same structure (a list). This
lesson's real, transferable problem is building the reflex to read `(f a b)` as "a list whose first
element happens to be a function" rather than as a weird way of writing `f(a, b)`.

## What you need to know first

Nothing — this is Lesson 1.

## Terms introduced in this lesson

- **REPL** — Read-Eval-Print Loop: a running process that reads one expression you type, evaluates
  it immediately, prints the result, and loops back to read the next one. It exists because Clojure
  treats "try this small thing and see what happens" as the normal way to write code, not a debugging
  fallback — you build programs *inside* a live, already-running process instead of editing a file
  and restarting the whole program to see if a line works.
- **Form** — any single unit of Clojure code that the REPL can read and evaluate, whether that's a
  bare literal like `7` or a full parenthesized list like `(+ 1 2)`. The term exists because Clojure
  needs one word that covers both "a value" and "a list to evaluate" — both are handed to the
  evaluator the same way, so the language needs a name for that shared category.
- **S-expression** — short for "symbolic expression": specifically the parenthesized-list shape of a
  form, `(x y z ...)`. The term exists to name the syntax itself, separately from what evaluating it
  does — you'll need to talk about the *shape* of the parentheses independently of the *meaning* of
  what's inside them.
- **Symbol** — a name, like `+` or `favorite-number`, that Clojure resolves to whatever it refers to
  (a function, a value) at evaluation time rather than treating as literal text. The term exists
  because "a name" is a load-bearing concept in a language that's about to let you rebind and pass
  names around as first-class things — later lessons need "symbol" to mean something precise, not
  just "the word before the parenthesis."
- **Special form** — a form that looks like a normal function call (`(def x 7)`) but is *not* one:
  it doesn't evaluate all its arguments the normal way, and it's built into the language itself, not
  defined in terms of anything else. The term exists because you're about to meet `def`, and calling
  it "a function" would be a lie that causes real confusion two lessons from now when you try to pass
  it around like a function and can't.

## Functions and special forms used

*(Adapted section — Clojure has no classes or interfaces; these are the concrete functions and
special forms this lesson's code depends on, each still given What it is / Implementation / Its use.)*

- **`+`**
  - *What it is:* a built-in function that adds numbers.
  - *Implementation:* takes zero or more numeric arguments and returns their sum; `(+ )` returns
    `0`, `(+ 5)` returns `5`, `(+ 1 2 3)` returns `6`. It's an ordinary function, not a special form —
    it follows the normal evaluation rule (every argument gets evaluated first, then the function is
    called with the results).
  - *Its use:* the very first form this lesson evaluates, chosen because it's the smallest possible
    demonstration of "operator in front" without any other new concept riding along.
- **`def`**
  - *What it is:* a special form that creates a new binding — it attaches a symbol to a value inside
    the current namespace so that typing the symbol later evaluates to that value.
  - *Implementation:* `(def symbol-name value)`. It evaluates `value` once, then does *not* evaluate
    `symbol-name` — it uses that symbol literally, as the name to bind to. This is exactly why it's a
    special form and not a function: an ordinary function call evaluates every argument, and
    evaluating `symbol-name` before it exists would be meaningless.
  - *Its use:* gives us a way to name a value so later forms in the file can refer to it, instead of
    retyping a literal every time.
- **`println`**
  - *What it is:* a built-in function that prints its arguments to the console, followed by a newline,
    and returns `nil`.
  - *Implementation:* `(println x)` converts `x` to its printed text representation and writes it out;
    the return value `nil` is discarded here since we only care about the side effect (the printed
    text), not the result.
  - *Its use:* lets us see, in the terminal, that `def` actually worked — without it we'd only have
    the REPL's own echoed result to trust.

---

## Concept Enumeration (written before any Concept Unit below)

The lesson's full code, across both units, is:

```clojure
(+ 1 2)

(def favorite-number 7)
(println favorite-number)
```

Walking every distinct syntactic element in order, deciding new vs. reused vs. basic-and-silent:

1. `(` `)` surrounding `+ 1 2` — **new**: the S-expression / list shape itself.
2. `+` in the first position — **new**: prefix notation — a symbol in operator position resolves to
   a function, and the list is a call.
3. `1`, `2` — numeric literals — **basic, silent**: identical in meaning to every language already
   known; no Clojure-specific behavior to teach.
4. `(` `)` surrounding `def favorite-number 7` — **reused** (same S-expression shape as #1) but
   worth a one-clause reminder, not a new unit, since the *shape* was just taught — what's new here
   isn't the parentheses, it's what's inside them.
5. `def` — **new**: special form, binding a symbol to a value.
6. `favorite-number` as the second element — **new**: a symbol used as a *name to bind*, not a
   symbol being resolved to a value — this is a different role for a symbol than #2's `+` was, and
   gets called out as such.
7. `7` — numeric literal — **basic, silent** (already covered by #3).
8. `(` `)` surrounding `println favorite-number` — **reused**, same shape, silent per the Repetition
   Rule (already given a real reminder once at #4; a third mention would be noise).
9. `println` — **new**: first appearance of a function call whose entire purpose is a side effect
   (printing) rather than a return value used for anything.
10. `favorite-number` as an argument to `println` — **reused**: this time the symbol *is* being
    resolved to its bound value — a third role for symbols, distinct from #2 and #6, worth one clause
    in the walkthrough of Unit 2 rather than a whole new unit, since "a symbol resolves to its bound
    value" is the direct, expected consequence of `def` just taught, not an independent concept.

Result: two Concept Units — (1) S-expressions and prefix notation, covering items 1–3; (2) `def` and
symbol binding, covering items 4–10.

---

## Concept Unit: S-Expressions and Prefix Notation

### The Problem

In every language you've used so far, `+` sits *between* its two operands: `1 + 2`. That's so
familiar it doesn't feel like a design choice — it feels like what math notation just is. But it
creates an inconsistency those languages live with forever: `1 + 2` uses infix notation, while
`Math.max(1, 2)` uses prefix notation (function name first, arguments after) in the very same
language. You've been silently context-switching between two different grammars your whole
programming life. Clojure's whole code base uses exactly one grammar for both, and this unit is
about seeing why that's possible and what it buys you.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition; there is no
  existing implementation this lesson is porting from.
- **Files affected:** `lesson01.clj` — created.
- **Change type:** add.
- **Location:** first line of the new file.
- **Dependencies:** Clojure installed and a REPL runnable (covered in Commands, below).

### The New Code — type it yourself

```clojure
(+ 1 2)
```

### The Updated Project

Skipped — this is the first line of a brand-new file; there is no enclosing structure to return to
and show. (Project Change's "a brand-new file has nothing to locate a position within" applies here
too, and the same reasoning extends to showing it composed into something larger — there's nothing
larger yet.)

### Isolate the Concept, Anchored to the Code Above

The line you just typed, `(+ 1 2)`, *is* already about as small as an example can get — but let's
prove what it means by changing exactly one thing at a time and watching the REPL's response, so the
"function first" idea isn't just asserted, it's demonstrated:

```
user=> (+ 1 2)
3
user=> (+ 1 2 3)
6
user=> (+ 5)
5
user=> (+)
0
```

What this proves: `+` takes zero, one, or many arguments, and every one of these evaluates cleanly —
the same shape handles all of them with no special case. This shape, a parenthesized list where the
first element is a symbol resolved to a function, is called an **S-expression**. Why it's able to
work this way is covered in the Mechanical Walkthrough below.

### Discard the Throwaway Example

The `(+)`, `(+ 5)`, and `(+ 1 2 3)` variations above were only run to prove the shape holds under
change — none of them go into `lesson01.clj`. Only the original `(+ 1 2)` stays in the file.

### Mechanical Walkthrough

Enumerating `(+ 1 2)` element by element, per the enumeration pass above:

- **`(` `)`** — *(a) first appearance.* This is the S-expression itself: a parenthesized list handed
  to the evaluator as a single form. The parentheses aren't grouping punctuation the way they are in
  `(1 + 2) * 3` in other languages — they *are* the call. Removing them, `+ 1 2`, isn't "the same
  math without a wrapper"; it's three separate, unrelated forms (a symbol, a number, a number), and
  the REPL would try to evaluate `+` on its own as a value, not as a call.
- **`+`** — *(a) first appearance.* Sitting in the first position of the list, `+` is not treated as
  a literal character — it's a symbol, and the evaluator's rule for any list form is "resolve the
  first element to a function, then apply it to the evaluated results of the rest." `+` happens to
  resolve to Clojure's built-in addition function. Nothing about the *position* is specific to `+` —
  any function's name could sit there. This is *why* the isolated lab above could run `(+)` and
  `(+ 5)` cleanly: there's no infix grammar to satisfy (no "5 +" to parse as a dangling operator),
  just a function being applied to however many arguments follow it, including zero. It's also why
  the language never needs a separate grammar rule for a two-argument call versus a twenty-argument
  one — both are "symbol, then a list of arguments," full stop.
- **`1`, `2`** — *(c) genuinely basic, already-established.* Numeric literals mean exactly what they
  mean in every other language you know; no restatement needed.

### CS Lens

The concept here — treating an operator and its operands as one uniform list structure, evaluated by
one uniform rule regardless of which operator it is — is a form of **homoiconicity**: code represented
using the language's own core data structure (here, the list).

```
Also recognized in: Lisp and Scheme (Clojure's direct ancestors), abstract syntax trees inside every
compiler (an AST node for a function call looks exactly like "operator, then operands," regardless
of source language), spreadsheet formulas (=SUM(A1, A2) is prefix notation with a different symbol
set), Polish notation calculators
```

### SE Lens

The alternative Clojure did *not* choose is infix notation with operator precedence rules (why does
`*` bind tighter than `+`? because a table of precedence levels says so, and that table has to live
somewhere and be memorized). Infix reads slightly more like textbook math for the two- or three-symbol
case, which is a real, honest advantage for quick arithmetic. The cost it avoids by not choosing infix:
no precedence table to learn or implement, no ambiguity about `1 + 2 * 3`, and — the part that matters
most later in this curriculum — a call to a two-argument function and a call to a twenty-argument
function are written with the *identical* grammar. There's no special case to maintain in the parser,
and no special case for you to remember, as arguments grow. The debt this project isn't carrying yet,
but will meet soon: deeply nested S-expressions get visually dense fast, and Clojure's answer to that
(threading macros) doesn't show up until a later lesson — for now, dense nesting is a real, unaddressed
cost of this choice.

### Commands Needed

- `clojure` (or `clj`, depending on your install) — starts a REPL. Install via the Clojure CLI tools;
  on macOS, `brew install clojure/tools/clojure`, then run `clj` from a terminal. Success output looks
  like a `user=>` prompt waiting for input.

### Run It

```
user=> (+ 1 2)
3
```

### Connection

This S-expression shape — parens, function first, arguments after — is the one grammar rule every
single form in the rest of this curriculum will use, including the very next thing you'll learn:
`def` is written the exact same way, `(def name value)`, even though it behaves completely
differently under the hood. That difference is what Concept Unit 2 is about.

---

## Concept Unit: `def` and Symbol Binding

### The Problem

Right now `(+ 1 2)` produces `3` and then that `3` is gone — the REPL printed it and forgot it. Real
programs need to hang onto values and refer back to them by name later, the same way you'd write
`favorite_number = 7` in Python. Clojure has a way to do this, but — and this is the actual point of
this unit — it can't be an ordinary function call, for a reason that becomes obvious once you look at
what a normal function call would have to do with the name itself.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `lesson01.clj` — modified.
- **Change type:** add.
- **Location:** after the `(+ 1 2)` line added in Concept Unit 1.
- **Dependencies:** none beyond Concept Unit 1's completed file.

### The New Code — type it yourself

```clojure
(def favorite-number 7)
(println favorite-number)
```

### The Updated Project

```clojure
(+ 1 2)

(def favorite-number 7)     ; ← new
(println favorite-number)   ; ← new
```

The file now does three things in sequence when loaded: it evaluates `(+ 1 2)` (whose result `3` is
still discarded, exactly as before — this line is unchanged from Unit 1), it creates a binding named
`favorite-number` pointing at `7`, and it prints that bound value back out so you have visible proof,
in the terminal, that the binding is real and not just something the REPL claims happened.

### Isolate the Concept, Anchored to the Code Above

Here's the reason `def` can't be an ordinary function, demonstrated rather than just asserted. If
`def` behaved like `+` — evaluate every argument first, then call the function — then evaluating
`(def favorite-number 7)` would require evaluating `favorite-number` *before* `def` ever runs. But
`favorite-number` doesn't exist yet; that's the entire point of the line. Watch what happens when you
try to evaluate the bare symbol before it's been bound:

```
user=> favorite-number
Syntax error compiling at (REPL:1:1).
Unable to resolve symbol: favorite-number in this context
```

```
user=> (def favorite-number 7)
#'user/favorite-number
user=> favorite-number
7
```

What this proves: before `def` runs, `favorite-number` genuinely doesn't resolve to anything — the
error is real, not a formality. After `def` runs, the same symbol resolves to `7`. `def` is called a
**special form**. Why it's able to make that switch is covered in the Mechanical Walkthrough below.

### Discard the Throwaway Example

The bare `favorite-number` lookup that triggered the error above was only run to prove the binding
didn't exist yet — it's not part of `lesson01.clj`. Only the two real lines (`def` and `println`)
stay in the file.

### Mechanical Walkthrough

Enumerating `(def favorite-number 7)` and `(println favorite-number)`:

- **`(` `)`** around both lines — *(b) hard concept reappearing.* Same S-expression shape Concept
  Unit 1 just taught: a parenthesized list, first element resolved and applied to the rest. Worth
  this one-clause reminder because the shape is doing real work here, not because it needs
  re-explaining.
- **`def`** — *(a) first appearance.* A special form, not a function — it deliberately skips the
  normal "evaluate every argument" rule so it can treat its second argument as a name rather than a
  value to look up. The isolated lab above proved this is necessary, not arbitrary: `favorite-number`
  had no meaning at all until `def` ran, which is only possible if `def` never tried to evaluate that
  symbol in the first place — an ordinary function, which evaluates every argument before it runs,
  couldn't do this; it would fail on `favorite-number` the same way the bare lookup failed above,
  before ever reaching the point of creating the binding.
- **`favorite-number`** (as the second element of `def`) — *(a) first appearance,* and a distinct role
  from `+` in Unit 1: there, the symbol in that position was *resolved* to a function; here, `def`'s
  special evaluation rule means this symbol is *not* resolved at all — it's used as literal text, the
  name being created.
- **`7`** — *(c) basic, already established* (identical to Unit 1's numeric literals).
- **`println`** — *(a) first appearance.* An ordinary function (not a special form — it follows the
  normal rule and evaluates its argument first), whose entire purpose is the side effect of printing;
  its return value (`nil`) is never used here.
- **`favorite-number`** (as the argument to `println`) — *(a) first appearance of this specific
  role,* even though the symbol itself was just introduced two lines above: this is the first time in
  the lesson a symbol is *resolved to its bound value* rather than being created (`def`'s case) or
  resolved to a function (`+`'s case). Three appearances of "a symbol," three different jobs — worth
  distinguishing explicitly rather than assuming "you already know what a symbol does" carries over
  automatically from the first two.

### CS Lens

`def` creating a name-to-value association that persists after the form finishes evaluating is a
**binding** — the general concept of associating a name with a value or storage location so later
code can refer to it without repeating the value itself.

```
Also recognized in: variable assignment in every language you already know, a dictionary/hash map
entry, a DNS record mapping a hostname to an IP address, a symbol table inside a compiler
```

### SE Lens

The alternative not chosen here is implicit binding — some languages let you just write
`favorite_number = 7` with no keyword at all, inferring "you meant to create this" from context. That
reads shorter, but it's genuinely ambiguous in a way `def` isn't: without a keyword, the language (or
the reader) has to guess whether you meant to create a new name or reassign an existing one, and
several real languages' historically bad bugs (accidentally shadowing a variable due to a typo) come
directly from that ambiguity. `def` costs four extra characters and buys an unambiguous, greppable
signal: every binding in a Clojure file starts with `def` (or one of its relatives you'll meet later),
so "where is this name created" is always answerable by search, never by tracing control flow. No
debt from this choice yet — it's a straightforward win at this scale.

### Commands Needed

None beyond the already-running REPL from Concept Unit 1.

### Run It

```
user=> (def favorite-number 7)
#'user/favorite-number
user=> (println favorite-number)
7
nil
```

(The `7` is `println`'s printed side effect; the `nil` beneath it is the REPL echoing `println`'s own
return value — a small preview of "everything in Clojure returns something," which later lessons will
build on.)

### Connection

Unit 1 established that Clojure code is written as uniform lists. This unit shows that not every list
follows the same *evaluation* rule even though they share the same *shape* — `def` looks exactly like
a function call but isn't one. That distinction (same syntax, different evaluation rules) is the seed
of something you'll meet formally, and by name, in a later lesson: macros.

---

## Closing

### Connect the Pieces

Trace `favorite-number` through the whole file: `(+ 1 2)` runs first and produces `3`, which is
immediately discarded — nothing binds it, so it's gone the instant the REPL prints it. Then
`(def favorite-number 7)` creates a binding: the symbol `favorite-number` now resolves to `7` for the
rest of the file (and the rest of the REPL session). Then `(println favorite-number)` evaluates that
symbol — resolving it to `7` via the binding just created — and prints it. One value, `7`, survives
past the line that created it only because `def` deliberately broke the normal evaluation rule to make
that possible; `3` didn't survive because nothing did the same for it.

### What Breaks Without This

Delete the `def` line and try to run just `(println favorite-number)`:

```
user=> (println favorite-number)
Syntax error compiling at (REPL:1:10).
Unable to resolve symbol: favorite-number in this context
```

Same error as the isolated lab in Concept Unit 2 — confirming that `println` didn't do anything
special to make `favorite-number` available; the binding was entirely `def`'s doing, and without it
the symbol is just as unresolved as it was before either line ran. Restore the `def` line before
continuing.

### Exercises

1. In the REPL, bind a symbol called `my-age` to your actual age, then `println` it.
2. Predict, then check: what does `(+ favorite-number 3)` evaluate to, once `favorite-number` is
   bound? Explain in one sentence why this works given what Concept Unit 1 taught about `+`.
3. Try `(def 7 favorite-number)` — arguments reversed. Read the error. Explain in your own words why
   it fails, using the "second argument to `def` is a literal name, not something evaluated" fact from
   this lesson's isolated lab.

### Definition of Done

- [ ] `lesson01.clj` exists and contains exactly the three lines shown in "The Updated Project."
- [ ] You've run all three lines in a live REPL and seen the real output shown in this lesson.
- [ ] You can explain, without looking back at this file, why `def` can't be an ordinary function.
- [ ] You've completed all three exercises above.
- [ ] `git commit -m "Lesson 1: learn that def is a special form because ordinary function calls
      can't create the names they'd need to look themselves up by"`
