# Lesson 3: Names, Bindings, and Environments

**What you will build**: By the end of this lesson you'll be able to give a value a name that persists beyond one line, explain precisely what happens when a name is looked up, and know why changing what a name refers to later can never reach back and change a value someone already retrieved under that name earlier. You'll also save Clojure code to a file for the first time in this series, and see the real difference between running code in a REPL and running it from a file.

**What you need to know first**: Lesson 2's *expression*, *value*, and *evaluation* — this lesson introduces the first kind of expression whose evaluation depends on something other than its own symbols: a name that was given a value somewhere earlier.

**Terms introduced in this lesson**:

- **binding** — an association between a name and a value. *Why it matters*: this is the whole lesson in one word — a binding is not a labeled box that holds a value, it's an entry saying "this name currently refers to that value," and the difference between those two mental models is what this lesson is actually about.
- **environment** — the current collection of all active bindings, consulted whenever a name is evaluated. *Why it matters*: "where did that value come from" always has the same answer — look it up in the environment — once the environment itself has a name and a precise meaning.
- **name lookup** — the act of finding the value associated with a name in the environment, performed whenever a name is evaluated. *Why it matters*: this is the actual mechanical step that happens every single time a name appears anywhere in running code — Lesson 2's evaluation rule ("a value has nothing left to reduce") needs this to explain what a bare name reduces *to*.
- **symbol** — Clojure's own term for a name written in code, which gets looked up in the environment when it's evaluated. *Why it matters*: this is the word Clojure's own documentation and error messages use — needed to read them precisely from here on.
- **rebinding** — changing which value a name is currently associated with in the environment. *Why it matters*: this lesson's central claim is that rebinding a name never alters any value already retrieved under that name — a claim that only makes sense once "rebinding" and "mutating a value" have different names.
- **script mode** — running Clojure code straight from a saved file, top to bottom, as opposed to typing forms one at a time into a REPL. *Why it matters*: script mode does not automatically print each form's value the way the REPL does (verified in Concept Unit 4) — code that looked like it "did nothing" when moved from the REPL to a file is usually this, not a bug.

**Objects and methods used**:

- **`def`**
  - *What it is:* a Clojure special form that creates a binding — associates a name with a value in the current environment.
  - *Implementation:* `(def name value-expression)` — evaluates `value-expression` to a value, creates or updates a binding from `name` to that value, and returns a reference to the binding itself (verified this session: `(def x 5)` prints `#'user/x`, not `5` — the created binding, not the value inside it).
  - *Its use:* every Concept Unit in this lesson; the mechanism the whole lesson is about.
- **`println`**
  - *What it is:* a function in Clojure's core library that prints its argument's text representation, followed by a newline.
  - *Implementation:* `(println x)` — takes one value, prints it, and returns `nil` (verified this session: `(println 150)` prints `150` on its own line).
  - *Its use:* Concept Unit 4, to make a value visible when running code from a file — script mode, unlike the REPL, doesn't print a form's value automatically.

---

## Concept Unit: Bindings — Naming a Value

### The Problem

In many languages, a variable is taught as a labeled box: `x = 5` puts the value `5` inside a box named `x`, and later writing `x = 99` opens the box and replaces what's inside it with `99` — same box, different contents. That picture makes a specific, testable prediction: if some other name, `y`, was ever pointed at "the same box" as `x`, then changing `x`'s box should also change what `y` sees, because they share one box. Is that actually what happens?

### Introduce the concept in isolation

```
user=> (def x 5)
#'user/x
```

The value printed back, `#'user/x`, is not `5` — it's a reference to the binding itself. This is the first hint that "box" isn't quite the right picture: creating a binding is an action with its own result (the binding), separate from the value `5` that got bound.

Now use the name:

```
user=> (+ x 1)
6
```

Writing `x` where a value was expected retrieved `5` from the environment, and `(+ x 1)` evaluated the same way `(+ 5 1)` would have. This is the concept this unit is naming precisely: `(def x 5)` didn't create a box — it added one entry to the **environment**, a lookup table available for the rest of the session, saying "the name `x` is bound to `5`." Evaluating the bare symbol `x` later means: look it up in that table.

### Discard the throwaway example

This REPL session's binding for `x` doesn't outlive the session — nothing here is saved to a file yet. Concept Unit 4 is where that changes.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch introduction of `def`.
- **Files affected**: None. Still a REPL session, same as every code example in Lesson 2.
- **Change type**: N/A.
- **Location**: N/A — typed fresh at the prompt.
- **Dependencies**: Babashka, installed in Lesson 2.

### The New Code — type it yourself

```clojure
(def x 5)
```

### The Updated Project

Skipped: no enclosing file or function exists yet for this fragment to live inside — same situation as every code example in Lesson 2.

### Mechanical walkthrough — how it works in isolation

- **`def`** — first appearance (covered fully in Objects and methods used, above): a special form — not an ordinary function like `+` — that creates a binding as a side effect and returns a reference to it.
- **`x`** — first appearance in this position: the name being bound. Unlike `1` or `2` in Lesson 2's examples, this isn't a literal value — it's a symbol that, from this point in the session forward, the environment knows how to look up.
- **`5`** — reappearing numeric literal (per the Repetition Rule, no new explanation owed) — the value `x` gets bound to.

### CS Lens

An environment that maps names to values, consulted on every name lookup, is the same idea as a dictionary or hash map used specifically for this purpose (Lesson 89, *Hash Tables*, formalizes the data structure this series' own environments are conceptually built from) — and, seen from Lesson 1's vocabulary, the environment is itself an instance of **state**: information that persists across steps (each `def` in a session) and affects what later steps (each subsequent name lookup) produce. Also recognized in: a dictionary's word-to-definition mapping, a phone contact list (a name, looked up to retrieve a number), a spreadsheet's named ranges.

### SE Lens

The "box" mental model isn't wrong because it's a bad metaphor in general — it's wrong because it predicts something Clojure's bindings don't do (that two names sharing "the same box" would see each other's updates), and code written on top of a wrong prediction fails in ways that are hard to trace back to the misunderstanding. The next two units test that prediction directly and show precisely where it breaks.

---

## Concept Unit: Name Lookup — Evaluating a Symbol

### The Problem

Lesson 2's evaluation rule said a value has nothing left to reduce, and everything else reduces by evaluating its sub-expressions. A bare symbol like `x` isn't a value — a `5` in the environment is not visibly attached to it in the source code the way `(+ 1 2)` visibly contains `1` and `2`. What, precisely, does evaluating a symbol do — and what happens if the environment has no entry for it?

### Introduce the concept in isolation

```
user=> (def price 20)
#'user/price
user=> (def quantity 3)
#'user/quantity
user=> (* price quantity)
60
```

Evaluating `(* price quantity)` required evaluating each symbol first — this is Lesson 2's sub-expression rule again, except the "sub-expression" here is a bare name rather than a nested form. `price` evaluates by looking itself up in the environment (found: `20`), `quantity` evaluates the same way (found: `3`), and then `*` applies to the two retrieved values, exactly as it would to two literals.

Now try a name the environment has no entry for:

```
user=> (+ q 1)
----- Error --------------------------------------------------------------------
Type:     clojure.lang.ExceptionInfo
Message:  Unable to resolve symbol: q
```

This is a real, verified error, not a guess at what "should" happen. It proves name lookup is a genuine step that can fail — evaluating a symbol isn't just "substitute the value that happens to be nearby," it's an actual search of the environment, and a symbol with no entry has nothing to evaluate to at all.

### Discard the throwaway example

Another REPL-only session — `price` and `quantity` don't persist past it.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(* price quantity)
```

(after `(def price 20)` and `(def quantity 3)` from the isolated example above.)

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`price`, `quantity`** — first appearance of a symbol being evaluated *for* its value, rather than being the name in a `def`. Each one triggers a name lookup in the environment; per this unit's isolated example, a symbol with no entry raises an error rather than silently producing some default.
- **`*`** — reappearing (per the Repetition Rule, no new treatment owed): the same multiplication function from Lesson 2, applied here to two looked-up values instead of two literals.
- **Outer form `(* price quantity)`** — reappearing prefix-call shape (Lesson 2); the only thing new is that both operands are symbols instead of literals, which the mechanical walkthrough above already covers individually.

### CS Lens

"Look up a name in the current environment, and fail loudly if it isn't there" is the same idea as a compiler's or interpreter's **name resolution** pass (Lesson 164, *Environments*, treats this formally as part of a language's semantics), a DNS lookup failing for a domain that doesn't exist, and a database query referencing a column name that was never defined. In every case, failing immediately and specifically ("no entry for `q`") is far more useful than silently producing some placeholder value and letting the mistake surface somewhere else, later, disconnected from its actual cause.

### SE Lens

An alternative design — silently treating an unresolved name as some default value (`0`, empty, `nil`) instead of raising an error — trades an immediate, precisely located failure for a value that looks legitimate and can propagate arbitrarily far through a program before anything visibly goes wrong. Clojure's choice to fail immediately, at the exact point of the unresolved name, is the same tradeoff Lesson 1's correctness criterion cared about: catching a wrong state as close as possible to its cause, not several steps downstream where the connection is no longer obvious.

### Connection to the previous unit

The previous unit showed a binding being created; this unit showed the other half of the same mechanism — a binding being read back — and showed what happens when that read has nothing to find.

---

## Concept Unit: Rebinding Is Not Mutation

### The Problem

Go back to the "box" prediction from Concept Unit 1: if `y` is set to "whatever `x` currently is," and `x` is later changed, does `y` change too? Under the box model, if `y` and `x` ever pointed at the same box, the answer would be yes. Under the binding model this lesson has been building, is there even a "same box" for them to share?

### Introduce the concept in isolation

```
user=> (def a 10)
#'user/a
user=> (def b a)
#'user/b
user=> (def a 40)
#'user/a
user=> b
10
user=> a
40
```

`b` was bound using `a`'s value at that moment (`10`) — not to `a` itself, and not to whatever `a` might become later. Rebinding `a` to `40` changed exactly one thing: what the name `a` currently resolves to in the environment. It didn't reach into `b`'s binding and change it, because `b`'s binding was never connected to `a`'s in an ongoing way — `(def b a)` evaluated the expression `a` (a name lookup, per the previous unit), got the value `10`, and bound `b` to *that value*, the same as if you'd written `(def b 10)` directly. After that, `a` and `b` are two completely independent entries in the environment that happen, for a moment, to have held the same value.

This directly refutes the "shared box" prediction from Concept Unit 1: `b` did not change when `a` was rebound. (If you've used Python, this is exactly `a = 10; b = a; a = 40` — `b` is still `10` there too, for the same underlying reason: `b = a` binds `b` to the value `a` currently holds, not to `a` itself.)

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
(def a 10)
(def b a)
(def a 40)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(def a 10)`** — reappearing `def` (Concept Unit 1); creates the first binding.
- **`(def b a)`** — reappearing `def`, but notice its second position holds a symbol (`a`), not a literal: per Lesson 2's evaluation rule, that symbol is evaluated *before* `def` binds it — `a` resolves to `10` first, and `b` is bound to the resulting value `10`, not to the symbol `a` or to any ongoing connection with it.
- **`(def a 40)`** — first appearance of **rebinding**: `a` already has an entry in the environment; this doesn't create a second, separate entry — it replaces what `a`'s existing entry points to. Everything that already looked `a` up before this line (here, `b`'s binding) is entirely unaffected, because looking a name up retrieves a value and moves on — it doesn't leave any lasting connection back to the name that was looked up.

### CS Lens

"Rebinding a name doesn't affect values already retrieved under it" is the same underlying idea as: reassigning a variable in Python (`a = 10; b = a; a = 40` behaves identically, for the identical reason), a spreadsheet cell that was copied *by value* rather than linked by formula, and a photocopy of a document — handing someone a photocopy and then editing your own original doesn't change what's on the copy they're holding. Also recognized in: version control's concept of a commit as a frozen snapshot (Lesson 291's *designing for change* territory, much later) — the snapshot doesn't change just because the branch it came from moves forward.

### SE Lens

The alternative — names that stay connected after one is used to initialize another, so that changing one changes the other — is a real, different, useful thing (this series gets there in Lesson 168, *References*, and Lesson 192, *Pointers and References*), but it is not what `def` and ordinary name binding do, in Clojure or in Python. Confusing "I initialized `b` from `a`'s current value" with "`b` is now permanently tied to `a`" is a common, real source of bugs in exactly the languages (Clojure and Python both included) where the actual behavior is "copy the value at that moment, then forget where it came from."

### Connection to the previous unit

The previous unit established that evaluating a symbol performs a lookup and returns a value; this unit is the direct consequence of that: once the value has been retrieved and used to create a new binding, that new binding has no further relationship to the name it was retrieved from.

---

## Concept Unit: Saving Bindings to a File — REPL Mode vs. Script Mode

### The Problem

Every example in this lesson so far has lived inside one REPL session and vanished the moment that session ended. Lesson 1's bank-account specification — opening balance, transactions, ending balance — is the kind of thing worth keeping around across sessions, not retyping every time. How does code that was typed at a REPL become something that persists?

### Introduce the concept in isolation

Save this to a file named `balance.clj`:

```clojure
(def opening-balance 100)
(def deposit-amount 50)
(println (+ opening-balance deposit-amount))
```

Run the file (see Commands, below, for how):

```
150
```

Only one line of output — `150`, from the explicit `println` — even though the file contains three top-level forms, including two `def`s that, at the REPL, would each have printed `#'user/opening-balance` and `#'user/deposit-amount`. Confirm this isn't a fluke by trying a file with no `println` at all:

```clojure
(def opening-balance 100)
```

Running this file produces **no output whatsoever** — verified this session. The binding is still created (a later form in the same file could use `opening-balance` successfully), but nothing about creating it is displayed unless something explicitly prints it.

This proves a real, load-bearing distinction: the REPL's automatic "print what I just evaluated" behavior — the *P* in Lesson 2's Read-Eval-Print-Loop — is a feature of the REPL specifically, not of Clojure evaluation in general. Running a file evaluates every form in it, top to bottom, exactly as the REPL would — but nothing gets printed unless the code itself calls something like `println` to make it happen.

### Discard the throwaway example

This one genuinely isn't discarded in the usual sense — saving code to a file *is* the concept being taught. What gets set aside is the specific file `balance.clj` used to demonstrate it; the project this series builds from here forward will use its own, purposefully-named files.

### Project Change

- **Reference Source**: No reference counterpart — this is the first file the series creates.
- **Files affected**: Created — a new `.clj` file (`balance.clj` in the isolated example above; from Lesson 4 onward, this series' lessons will name files purposefully rather than as one-off demonstrations).
- **Change type**: Add — a brand-new file.
- **Location**: N/A — nothing exists yet to place it relative to.
- **Dependencies**: Babashka, already installed; a plain text editor to create the `.clj` file.

### The New Code — type it yourself

```clojure
(def opening-balance 100)
(def deposit-amount 50)
(println (+ opening-balance deposit-amount))
```

### The Updated Project

Skipped: this is a brand-new file with nothing surrounding it yet — Project Change, above, already covers this case ("a brand-new file has nothing to locate a position within").

### Mechanical walkthrough — how it works in isolation

- **`(def opening-balance 100)`, `(def deposit-amount 50)`** — reappearing `def` (Concept Unit 1); two ordinary bindings, no different from any REPL example so far, except that they now live in a file instead of a session.
- **`println`** — first appearance as a called function (covered in Objects and methods used, above): prints its argument's value and a newline, then returns `nil`. This is what makes the file's result visible at all — without it, as the isolated example proved, running the file produces no visible output.
- **`(+ opening-balance deposit-amount)`** — reappearing form (Lesson 2's `+`, this lesson's name lookup): evaluates to `150`, which `println` then displays.

### CS Lens

The distinction between "a value was computed" and "a value was displayed" recurs everywhere once code moves out of an interactive REPL: a running web server computes values constantly without printing any of them to a terminal; a compiled program's `return` value isn't automatically shown to anyone unless something explicitly logs, prints, or displays it. Also recognized in: a calculator's display versus its internal computation (pressing `=` computes a value regardless of whether the screen is even on), and Lesson 283's *Observability* — the entire idea that a running system's internal values need deliberate effort to become visible, because visibility isn't automatic just because a computation happened.

### SE Lens

A REPL that auto-prints every evaluated form is optimized for exploration — seeing immediate feedback while you're figuring out what an expression does. A saved, reusable file is optimized for a different goal — doing work reliably, possibly as part of something larger — where auto-printing every intermediate `def` would be noise, not useful feedback. Neither behavior is more "correct" than the other; they're suited to different situations, and confusing "this printed nothing" (script mode, working as designed) with "this did nothing" (an actual bug) is a mistake this unit's isolated example was built specifically to head off before it happens for real.

### Commands needed to make this unit real

1. Save the code above to a plain text file named `balance.clj` (any text editor works — the file just needs a `.clj` extension and no special formatting).
2. Run it by passing the file path to Babashka:
   ```
   bb.exe balance.clj
   ```
   (or `bb.exe C:\path\to\balance.clj` if you're not running the command from the same folder as the file.)
3. Verified output, this session:
   ```
   150
   ```

### Run it. Show the real output.

```
150
```

Verified this session via Babashka v1.13.219, running `balance.clj` from a file.

### One sentence connecting this unit to what came immediately before

The previous two units established exactly what a binding is and how looking one up works; this unit is where that stops being something that only exists for the length of one REPL session and starts being something you can save, close, and come back to.

---

## Connect the Pieces

One more file, exercising every idea from this lesson together — naming, lookup, rebinding, and script mode's silence without explicit printing:

```clojure
(def account-balance 100)
(def transaction-log account-balance)

(def account-balance 175)

(println "Value captured before the update:" transaction-log)
(println "Current value after the update:" account-balance)
```

Run it:

```
Value captured before the update: 100
Current value after the update: 175
```

`transaction-log` was bound to whatever `account-balance` evaluated to *at that moment* (`100`) — a name lookup (Concept Unit 2) producing a value used to create a new, independent binding (Concept Unit 1). Rebinding `account-balance` afterward (Concept Unit 3) changed only what the name `account-balance` currently resolves to; `transaction-log`'s binding, having already captured the value `100`, has no ongoing connection to `account-balance` to be affected by that change. And neither line of output appeared until the file's explicit `println` calls ran — nothing here printed itself automatically, because this is script mode (Concept Unit 4), not a REPL.

## What Breaks Without This

Suppose, instead, you believed the "box" model from Concept Unit 1's opening question — that `(def transaction-log account-balance)` makes `transaction-log` share `account-balance`'s box, so future changes to one show up in the other. Written as code that assumes that (incorrectly):

```clojure
(def account-balance 100)
(def transaction-log account-balance)
(def account-balance 175)
(println "Assuming transaction-log tracks account-balance, it should now read 175:" transaction-log)
```

Running this prints:

```
Assuming transaction-log tracks account-balance, it should now read 175: 100
```

The comment is simply wrong, and the code proves it: `transaction-log` still holds `100`. Nothing crashed, nothing errored — this is the dangerous kind of break, the same category Lesson 1 warned about (a technically-produced, plausible-looking value that is nonetheless not the one intended). If real code elsewhere depended on `transaction-log` staying in sync with `account-balance`, it would silently work with stale data — a bug whose actual cause (rebinding does not propagate) is nowhere near the line where the wrong value finally gets used.

## Exercises

1. **Trace.** By hand, trace what the environment contains after each line of `(def a 1) (def b 2) (def a (+ a b))`. What is `a` bound to at the end? What was `a` bound to in the moment `(+ a b)` was evaluated?
2. **Predict.** Before running it, predict the output of `(def a 10) (def b a) (def a 40) (println b) (println a) (println (+ a b))`. Then run it and check.
3. **Break it, on purpose.** Write a one-line file that references a name you never `def`'d. Run it and read the real error message — does it match the shape of this lesson's "Unable to resolve symbol" error?
4. **Script mode.** Take any two-or-three-line sequence of `def`s from this lesson, save it to a file *without* a `println`, and run it. Confirm, for yourself, that it produces no output — then add a `println` for one of the bindings and confirm the difference.
5. **Generalize.** Lesson 1's bank-account specification named six ingredients: input, output, transformation, constraints, state, correctness. Write a short `.clj` file that gives real Clojure bindings to the *input* values from one of that lesson's traced examples (an opening balance and at least two transaction amounts) — just the bindings, no computation yet. This is intentionally incomplete; Lesson 4 is where those bindings start turning into a real transformation.
6. **Reconstruct.** Close this lesson. From memory, explain why `(def b a)` followed later by rebinding `a` does not change `b` — using the words "environment," "lookup," and "binding," not just "it just doesn't."

## Definition of Done

- [ ] You can explain, from memory, the difference between a binding and a box, using the `(def b a)` / rebind-`a` example without looking back at this lesson.
- [ ] You've seen, for yourself, a real "Unable to resolve symbol" error from a name with no binding.
- [ ] You've run at least one `.clj` file with Babashka and confirmed that a file with no `println` produces no output.
- [ ] You completed Exercise 5 (a real file with real bindings for Lesson 1's bank-account input).
- [ ] Commit `balance.clj` (or your own version from Exercise 5) to your notes repository, with a commit message explaining *why* script mode stayed silent until you added output — for example, `"Add println to balance.clj — defs alone produce no output outside the REPL"` — not just `"lesson 3 file"`.

---

**Next lesson:** Lesson 4, *Functions as Transformations*, turns Lesson 1's *transformation* ingredient into something you can name, save, and call with different inputs — the bindings from this lesson were only ever bound to one fixed value each; a function is what lets the same computation run again with a value that changes each time.
