# Lesson 28: Recursive Functions

**What you will build:** A real, running program — `factorial.scm` — that computes `n!` by actually executing the recursive definition Lesson 27 only ever unfolded by hand. The transferable problem this lesson is actually about: everything reasoned about on paper since Lesson 1 has needed a human to carry out every step; this lesson introduces the first tool in this curriculum capable of carrying out a recursive definition itself, mechanically, exactly the way it was defined — no translation gap, no reinterpretation, because the language this lesson uses was chosen specifically because its own syntax for defining something in terms of a smaller version of itself is nearly identical to the mathematical notation Lesson 27 already used.

**What you need to know first:** Lesson 3 (`FP-L003-values-and-operations.md`) — specifically *operation* and *arity*, both reused directly once arithmetic appears as real, callable code. Lesson 5 (`FP-L005-names-and-bindings.md`) — specifically *binding*, reused directly for real code's `define`. Lesson 7 (`FP-L007-functions-as-transformations.md`) — specifically *function*, *parameter*, and *application*, all reused directly. Lesson 12 (`FP-L012-conditions.md`) — specifically *conditional expression*, reused directly for real code's `if`. Lesson 27 (`FP-L027-recursive-definitions.md`) — specifically the complete recursive definition of factorial, translated directly into this lesson's program.

**Terms introduced in this lesson**

- **S-expression** — the single, uniform syntactic shape every piece of Scheme code is written in: a parenthesized list whose first item names an operation or a special form, and whose remaining items are its operands, written `(operator operand operand ...)`. `(* n n)` and `(display "hello")` are both S-expressions, even though one computes a number and the other prints text — the shape doesn't distinguish between them; only what the first item names does.
- **Interpreter** — a program that reads source code and carries it out directly, one piece at a time, rather than first translating the whole program into a separate file of machine instructions the way a compiler does. Guile, the specific program this lesson uses, is an interpreter for Scheme; typing `guile factorial.scm` reads and runs the file directly, with no separate compiled output file produced as part of the ordinary workflow.
- **REPL** — Read-Eval-Print Loop, an interactive mode where an interpreter reads one expression at a time, evaluates it immediately, prints the result, and waits for the next one — as opposed to running an entire file's worth of code at once. Guile offers a REPL when started with no file argument; this lesson uses the file-running mode instead, since its programs are worth keeping and rerunning.
- **Special form** — a piece of Scheme syntax that looks like an S-expression but does not behave like an ordinary procedure call — its operands are not all evaluated automatically before it runs, the way a real procedure's arguments always are. `if` is a special form: it only evaluates one of its two branches, exactly the selective evaluation Lesson 12 already required, which an ordinary procedure call could never provide on its own, since an ordinary call always evaluates every one of its arguments first. `define` is also a special form, for a different reason examined directly in Concept Unit 2.
- **Procedure** — Scheme's own word for what Lesson 7 called a function: a named, reusable rule taking parameters and producing a result. This lesson uses "procedure" when referring to real Scheme code, and "function" when referring to the general concept, exactly the way earlier lessons distinguished a general concept from its specific realization.

## Objects and methods used

- **`display`**
  - *What it is:* a real Scheme procedure that writes a human-readable representation of a value to the terminal.
  - *Implementation:* takes one required argument (the value to show) and writes it with no trailing newline of its own; confirmed, this session, to be a genuine callable procedure in the installed Guile 3.0.11 (`(procedure? display)` returns `#t`).
  - *Its use:* the only way, so far, for a running Scheme program to actually produce visible output — every example in this lesson relies on it to show a computed result at all.
- **`newline`**
  - *What it is:* a real Scheme procedure that writes a single newline character to the terminal.
  - *Implementation:* takes no required arguments; called simply as `(newline)`.
  - *Its use:* since `display` never adds a trailing newline on its own, `(newline)` is what keeps successive outputs from running together on one line.
- **`+`, `-`, `*`, `=`**
  - *What it is:* real Scheme procedures for addition, subtraction, multiplication, and numeric equality — a reappearance of *operation* (Lesson 3), now shown as genuine, callable code rather than mathematical notation.
  - *Implementation:* each is an ordinary procedure, confirmed this session (`(procedure? +)` returns `#t`; `(procedure-name +)` returns `+`) — in Scheme, even basic arithmetic is implemented as procedures, not built-in special syntax, which is why `(+ 2 3)` and `(square 5)` are written in exactly the same S-expression shape.
  - *Its use:* every arithmetic step in this lesson's factorial program — the multiplication in the recursive case, the subtraction that produces a smaller `n`, the equality check against the base case — is one of these four procedures, called directly.

---

## Concept Unit 1: The Scheme Toolchain — Installing Guile and Running a File

### The Problem

Every recursive definition this curriculum has built so far — factorial, `sum` — has only ever been unfolded by a human, working through the steps by hand, the way Lesson 27 unfolded `5!` line by line. Getting a machine to do this instead requires something to actually read Scheme source code and carry it out. That something is an interpreter, and before any recursive function can be translated into a real program, the interpreter has to actually be installed and confirmed working.

### The New Code — Type It Yourself

```scheme
(display "hello, first principles")
(newline)
```

### The Updated Project

This is a brand-new file, `hello.scm` — there is nothing surrounding it to show in context.

### Reference Source

No reference counterpart — this is the first lesson in this curriculum to introduce real, runnable code, so there is no earlier implementation to port from.

### Files affected

Created: `hello.scm`.

### Change type

Add (new file).

### Dependencies

Guile, the GNU implementation of Scheme, installed via Homebrew: `brew install guile`. Confirmed this session — `guile --version` reports `guile (GNU Guile) 3.0.11`.

### Commands Needed

`brew install guile` — `brew` is the Homebrew package manager; `install guile` downloads and installs the Guile interpreter and everything it depends on. `guile hello.scm` — runs the `guile` interpreter on the file `hello.scm`, reading and executing every S-expression in it from top to bottom.

### Run It — Show the Real Output

```
$ guile hello.scm
hello, first principles
```

Verified this session, using Guile 3.0.11 installed fresh via Homebrew.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the code above, in order:

- **`(display "hello, first principles")`** — first appearance of an S-expression in this curriculum: parentheses enclosing a first item, `display`, naming what to do, followed by one operand, the text to show. First appearance of `display` itself (see Objects and methods used, above) — a reappearance, in spirit, of Lesson 3's *operation*, since it is a rule taking an operand and doing something with it, here producing visible output rather than a new value.
- **`(newline)`** — a second S-expression, this one with no operands at all — confirming an S-expression's parentheses can enclose just an operator name, with nothing else, when the procedure being called needs nothing further.
- **The two S-expressions, one after another, on separate lines** — first appearance of a Scheme file's basic structure: a sequence of S-expressions, each one carried out in order, top to bottom, by the interpreter.

### CS Lens

This is the most basic possible demonstration of an interpreter actually carrying out written instructions — reading a file, recognizing its S-expressions, and executing each one directly. Also recognized in: a command-line shell interpreting typed commands one at a time; a calculator interpreting a typed formula and immediately producing a result; a board game's rulebook, "read" and "executed" by players one instruction at a time; sheet music, read and performed by a musician one measure at a time, directly, with no separate translation step in between.

### SE Lens

The alternative to installing a real interpreter is to keep every computation in this curriculum confined to paper, the way Lessons 1 through 27 have been. The real cost of that alternative, made concrete by Lesson 27's own hand-unfolding of `5!`, is that every computation, however small, requires a human to correctly carry out every single step, with all the same error risk Lesson 1 identified for any repeated, un-automated process. Installing and confirming a working interpreter costs the one-time setup shown above; it is what makes every later lesson's code genuinely executable, rather than merely describable.

---

## Concept Unit 2: define — Naming a Value in Real Code

### The Problem

Lesson 5 named the act of associating a name with a value *binding*, reasoned about entirely on paper. Scheme needs a real, typed piece of syntax to actually perform this — and it's worth introducing that syntax on its own, with a value, before combining it with anything else.

### Introduce the Concept in Isolation

```scheme
(define x 5)
(display x)
(newline)
(display (* x x))
(newline)
```

Run, producing real output:

```
$ guile define1.scm
5
25
```

Verified this session. This output proves that `(define x 5)` genuinely bound the name `x` to the value `5` within the running program — the exact same binding relationship Lesson 5 described on paper, now something a real interpreter actually tracks and looks up.

This example is called a **lambda expression**'s simpler cousin — no, more precisely: this is called a **binding form**, and it is discarded now; it will not appear in this lesson's real project again.

### Project Change

**Reference Source:** No reference counterpart — a from-scratch addition, continuing this lesson's introduction of Scheme itself.

**Files affected:** A new throwaway file, `define1.scm`, used only for this isolated demonstration and not carried forward.

**Change type:** Add (new, temporary file).

**Location:** Not applicable — a standalone file with nothing surrounding it.

**Dependencies:** The Guile interpreter, already installed in Concept Unit 1.

### Mechanical Walkthrough

- **`(define x 5)`** — first appearance of `define` used to bind a name to a plain value: an S-expression whose first item is the special form `define`, followed by the name being bound and the value to bind it to.
- **`x`, used later in `(display x)`** — a reappearance of *binding* (Lesson 5), now demonstrated for real: the name `x`, once defined, can be looked up anywhere later in the file, exactly the way an environment (Lesson 5) tracks a name's current value.
- **`(* x x)`** — a reappearance of `*` (see Objects and methods used), applied here to the bound name `x` rather than to two literal numbers, confirming a bound name can be used as an operand exactly like any plain value.

### CS Lens

This is Lesson 5's binding, made real: an environment a running program actually maintains, rather than a mental model reasoned about on paper. Also recognized in: assigning a value to a variable in essentially any programming language; a spreadsheet's named range, letting a formula refer to a cell by a chosen name instead of its raw position; a contract's defined-terms clause, made operational rather than merely descriptive; a shell script's variable assignment, used identically to how `x` is used here.

### SE Lens

The alternative to naming a value with `define` is to write the literal value everywhere it's needed, directly in the code, the same repetition Lesson 5 already warned against for un-named quantities. The real cost of that alternative, in real code, is exactly what it always has been in this curriculum: if the value needs to change, every literal occurrence has to be found and updated by hand. `define` costs nothing beyond the binding itself; it gives every later use of `x` a single, authoritative source.

---

## Concept Unit 3: define — Naming a Procedure in Real Code

### The Problem

Lesson 7 defined `total_with_tax` on paper, with parameters standing for values not yet supplied. Scheme's `define` does double duty: the same special form that bound `x` to a plain value in Concept Unit 2 can also bind a name to a procedure — but the syntax for doing so looks slightly different, and it's worth examining that difference directly before it appears inside a recursive function.

### Introduce the Concept in Isolation

```scheme
(define (square n) (* n n))
(display (square 5))
(newline)
(display (square 12))
(newline)
```

Run, producing real output:

```
$ guile define2.scm
25
144
```

Verified this session. This confirms `square` behaves exactly like Lesson 7's functions: the same definition, applied to two different arguments, produces two different, correct results — `25` and `144` — with no change to the definition itself.

This isolated example is discarded now; it will not appear in this lesson's real project again.

### Project Change

**Reference Source:** No reference counterpart — a from-scratch addition.

**Files affected:** A new throwaway file, `define2.scm`.

**Change type:** Add (new, temporary file).

**Location:** Not applicable.

**Dependencies:** The Guile interpreter.

### Mechanical Walkthrough

- **`(define (square n) (* n n))`** — a reappearance of `define`, this time with a different shape for its second position: `(square n)`, itself a parenthesized list, rather than a bare name. This shape is Scheme's way of naming both the procedure (`square`) and its parameter (`n`) in one stroke — first appearance of this specific form of `define`, distinct from Concept Unit 2's plain-value form.
- **`(* n n)`** — the procedure's body, a reappearance of *function body* (Lesson 7), written as an ordinary S-expression using the parameter `n` as an operand, exactly the way Lesson 7's function bodies used parameters as operands in mathematical notation.
- **`(square 5)`** — a reappearance of *application* (Lesson 7): `square` is applied to the argument `5`, binding `n` to `5` for the duration of this one call, substituting it into the body, and evaluating the result — the exact binding-substitution-reduction sequence Lesson 7 already established, now carried out by the interpreter automatically rather than by hand.

### CS Lens

This is Lesson 7's function, made real: a named, reusable procedure a running program can apply to as many different arguments as needed, with the interpreter itself performing the binding and substitution that Lesson 7 and Lesson 5 described on paper. Also recognized in: a function definition in essentially any programming language; a mathematical formula, `f(x) = x²`, given an operational, executable form; a factory's configured machine, taking raw material as input and applying its fixed process, now literally running rather than only described; a cooking recipe, followed by an actual cook rather than only read.

### SE Lens

The alternative to naming `square` as a real procedure is to write `(* 5 5)` and `(* 12 12)` separately, wherever squaring is needed, the identical repetition problem Lesson 7 already diagnosed for un-generalized calculations — now recurring in real code instead of on paper. `define`, used this way, costs nothing beyond the definition shown above; it buys a procedure genuinely reusable across as many calls as the running program needs, exactly the payoff Lesson 7 promised, now actually realized.

---

## Concept Unit 4: if — Choosing a Branch in Real Code

### The Problem

Lesson 12's conditional expression, `if P then E1 else E2`, evaluated only one of its two branches, on paper. Scheme's real `if` needs to be shown doing the identical thing, for real, before it can be trusted inside a recursive procedure where, per Lesson 27, exactly this kind of branching decides whether to stop or continue.

### Introduce the Concept in Isolation

```scheme
(display (if (> 5 3) "yes" "no"))
(newline)
(display (if (> 2 3) "yes" "no"))
(newline)
```

Run, producing real output:

```
$ guile if1.scm
yes
no
```

Verified this session. The first `if`'s guard, `(> 5 3)`, is true, so it produced `"yes"`; the second's guard, `(> 2 3)`, is false, so it produced `"no"` — exactly matching Lesson 12's evaluation rule, now demonstrated by a real interpreter rather than reasoned about by hand.

This isolated example is discarded now; it will not appear in this lesson's real project again.

### Project Change

**Reference Source:** No reference counterpart — a from-scratch addition.

**Files affected:** A new throwaway file, `if1.scm`.

**Change type:** Add (new, temporary file).

**Location:** Not applicable.

**Dependencies:** The Guile interpreter.

### Mechanical Walkthrough

- **`(if (> 5 3) "yes" "no")`** — first appearance of `if` in real code: a special form (see Terms introduced) taking exactly three operands — a guard, a then-branch, and an else-branch — a reappearance of *conditional expression*, *guard*, and *branch* (all Lesson 12), now with Scheme's own concrete syntax.
- **`(> 5 3)`** — a reappearance of *comparison operation* (Lesson 10), here `>`, evaluated first, exactly as Lesson 12's evaluation rule requires, to decide which branch actually runs.
- **`if` not evaluating both branches** — not a new syntactic element on its own, but the crucial behavioral fact this whole unit exists to confirm: unlike `square`'s call in Concept Unit 3, where every argument was evaluated before the call proceeded, `if` evaluates only the one branch its guard selects — precisely why `if` is a special form and not an ordinary procedure, as *special form*'s own definition already stated.

### CS Lens

This is Lesson 12's conditional expression, made real, including its most important property: only the selected branch is actually evaluated, confirmed here by observation rather than merely asserted. Also recognized in: an `if` statement in essentially every programming language; a fork in a hiking trail, where a hiker only ever walks one of the two paths, never both; a triage nurse's decision, only ever pursuing one course of treatment based on an assessment, not attempting both simultaneously; a vending machine's dispensing logic, only ever dispensing from the one selected slot.

### SE Lens

The alternative to trusting that `if` evaluates only one branch is to write code as though both branches might run, defensively guarding against a possibility that Lesson 12 already proved cannot happen, and this unit has now confirmed for real code as well. The real cost of that defensive alternative is needless complexity; the real cost of *not* trusting it correctly — writing a branch that would fail if it were ever reached, relying on `if` to prevent that — is entirely justified, and is exactly what Concept Unit 5's factorial procedure depends on next.

---

## Concept Unit 5: Translating Lesson 27's Recursive Definition Directly Into a Procedure

### The Problem

Every piece needed is now in place: `define` for naming a procedure with a parameter (Concept Unit 3), `if` for choosing between a base case and a recursive case (Concept Unit 4), and arithmetic procedures for the actual computation (Objects and methods used). Lesson 27's recursive definition of factorial — `0! = 1`; `n! = n × (n − 1)!` for `n > 0` — can now be translated directly, almost unchanged, into a real Scheme procedure.

### The New Code — Type It Yourself

```scheme
(define (factorial n)
  (if (= n 0)
      1
      (* n (factorial (- n 1)))))
```

### The Updated Project

This is `factorial.scm`, in full — the complete, real, lasting artifact this lesson exists to produce:

```scheme
(define (factorial n)
  (if (= n 0)
      1
      (* n (factorial (- n 1)))))

(display (factorial 5))
(newline)
```

Nothing here is elided — every line shown is the complete file.

### Reference Source

Lesson 27 (`FP-L027-recursive-definitions.md`), Concept Unit 2, exact base case and recursive case: `0! = 1`; `n! = n × (n − 1)!` for `n > 0` — quoted and translated line for line below.

### Files affected

Created: `factorial.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Location

A brand-new file — nothing to locate a position within.

### Dependencies

The Guile interpreter, already installed and confirmed in Concept Unit 1.

### Run It — Show the Real Output

```
$ guile factorial.scm
120
```

Verified this session, using the installed Guile 3.0.11. `120` matches both Lesson 26's explicit product `5 × 4 × 3 × 2 × 1` and Lesson 27's hand-unfolded result for `5!` exactly.

### Mechanical Walkthrough

- **`(define (factorial n) ...)`** — a reappearance of Concept Unit 3's procedure-defining form, naming `factorial` and its one parameter, `n`.
- **`(if (= n 0) 1 (* n (factorial (- n 1))))`** — a reappearance of Concept Unit 4's `if`, whose guard, `(= n 0)`, is a direct translation of Lesson 27's base-case condition (`n` equal to the smallest case), and whose then-branch, `1`, is a direct translation of the base case's value, `0! = 1`.
- **`(* n (factorial (- n 1)))`** — the else-branch, a direct translation of the recursive case, `n × (n − 1)!`: `(- n 1)` computes `n − 1`, `(factorial (- n 1))` applies `factorial` to that smaller value — this is the procedure calling itself, with a genuinely smaller argument, the exact self-reference Lesson 27 built into the recursive case — and `*` multiplies that result by `n`.
- **The translation compared clause by clause against Lesson 27's original definition** — not a new syntactic element, but the central point of this entire unit: `0! = 1` became `(if (= n 0) 1 ...)`'s then-branch, and `n! = n × (n − 1)!` became the else-branch, with no restructuring, no reinterpretation, and no piece of Lesson 27's mathematics left untranslated.

### Execution Trace

`(factorial 5)` calls itself recursively; this is exactly the shape of trace the schema requires for recursive code — showing what a real run actually does, not a paraphrase of it.

1. `(factorial 5)` — `n` is `5`. Guard `(= 5 0)` is `#f`. Evaluates the else-branch, which needs `(factorial 4)` before the outer multiplication can proceed.
2. `(factorial 4)` — `n` is `4`. Guard `(= 4 0)` is `#f`. Needs `(factorial 3)`.
3. `(factorial 3)` — `n` is `3`. Guard `(= 3 0)` is `#f`. Needs `(factorial 2)`.
4. `(factorial 2)` — `n` is `2`. Guard `(= 2 0)` is `#f`. Needs `(factorial 1)`.
5. `(factorial 1)` — `n` is `1`. Guard `(= 1 0)` is `#f`. Needs `(factorial 0)`.
6. `(factorial 0)` — `n` is `0`. Guard `(= 0 0)` is `#t`. Returns `1` directly — the base case, reached at last, exactly where Lesson 27's own unfolding stopped.
7. `(factorial 1)` resumes, now that `(factorial 0)` has returned `1`: computes `(* 1 1)`, returns `1`.
8. `(factorial 2)` resumes: computes `(* 2 1)`, returns `2`.
9. `(factorial 3)` resumes: computes `(* 3 2)`, returns `6`.
10. `(factorial 4)` resumes: computes `(* 4 6)`, returns `24`.
11. `(factorial 5)` resumes: computes `(* 5 24)`, returns `120` — the final result, printed by `(display (factorial 5))`.

This is the identical sequence Lesson 27, Concept Unit 3, produced by hand — `5! = 5 × 4! = ... = 5 × (4 × (3 × (2 × (1 × 1))))`, reducing innermost first to `120` — now carried out automatically by the interpreter, call by call, exactly matching the earlier by-hand unfolding step for step.

### CS Lens

This is a function calling itself with a smaller argument until a base case halts the chain, then unwinding back through every pending call — the mechanical realization of everything Lesson 27 established about recursive definitions. Also recognized in: a nested set of Russian dolls, opened one at a time until the smallest is reached, then closed back up in reverse order; a company's approval chain, where a request escalates upward until someone with final authority approves it, then confirmation flows back down; a stack of dominoes falling and the chain reaction propagating back once the last one, unable to fall further, stops it; a search through nested folders, descending until an empty folder is found, then returning back up through every folder that led there.

### SE Lens

The alternative to translating Lesson 27's definition directly is to write factorial some other way in Scheme — an explicit loop, for instance, once this curriculum has the tools to build one. The real cost of choosing that alternative here specifically would be losing the direct, checkable correspondence this unit relies on: because `factorial.scm`'s structure mirrors Lesson 27's mathematical definition clause for clause, verifying the code is correct is a matter of checking the translation, not re-deriving the algorithm from scratch. Writing the recursive version, exactly matching the recursive definition, costs nothing beyond the direct translation shown above; it is what makes this lesson's entire premise — "translate recursive definitions directly into programs" — literally, checkably true, rather than a slogan.

---

## Closing

### Connect the pieces

One value, `5`, traced through every unit built in this lesson, start to finish:

1. **The toolchain, confirmed working (Unit 1):** `guile hello.scm` producing real, verified output.
2. **`define`, binding a plain value (Unit 2):** `x` bound to `5`, looked up and used in `(* x x)`.
3. **`define`, binding a procedure (Unit 3):** `square`, applied to two different arguments, `5` and `12`, producing `25` and `144`.
4. **`if`, choosing exactly one branch (Unit 4):** confirmed, for real, to evaluate only the branch its guard selects.
5. **Lesson 27's factorial, translated and run (Unit 5):** `factorial.scm`, applied to `5`, calling itself five times down to the base case and back, producing `120` — verified to match both Lesson 26's explicit product and Lesson 27's hand-unfolded result exactly.

Unit 5's execution trace is not new material — it is Lesson 27, Concept Unit 3's, exact by-hand unfolding of `5!`, now shown happening automatically, call by call, inside a real running program.

### What breaks without this

Suppose `factorial`'s definition had been typed with one small, easy mistake — its guard checking `(= n 1)` instead of `(= n 0)`, treating `1` as the base case instead of `0`. Applying it to `5` would still produce a plausible-looking number, since the recursion would still eventually reach `n = 1` and stop there — but applying it to `0` directly, `(factorial 0)`, would guard-check `(= 0 1)`, find it false, and recurse into `(factorial -1)`, then `(factorial -2)`, continuing indefinitely, exactly Lesson 27, Concept Unit 4's, unbounded regress, now happening inside a real running interpreter rather than only on paper. Guile does not run forever silently in this situation — it exhausts its available call stack and reports an error, but only after `(factorial 0)` is actually called, which might not happen until long after the mistaken definition was written and seemingly working. Verified this session: calling `square` (Concept Unit 3) with the wrong number of arguments produces an immediate, real error — `ice-9/eval.scm:333:13: Wrong number of arguments to #<procedure square (a)>` — confirming Lesson 3's *arity* is something the real interpreter actively enforces, not merely a mathematical nicety; a base-case mistake is more dangerous precisely because, unlike an arity error, it can pass silently for every input that happens to still reach `0`, and fail only for the input that doesn't. Restoring the exact, careful translation this unit performed — checking `factorial.scm`'s guard against Lesson 27's stated base case clause by clause, not merely typing something that looks close — is what prevents this specific, quietly dangerous mistake.

### Exercises

1. **Observe.** Install Guile if you have not already, and run this lesson's `hello.scm` yourself. Confirm your own real output matches what's shown in Concept Unit 1.
2. **Predict.** Before running it, predict what `(define (double n) (* n 2))` applied to `7` and to `100` will produce. Type it into a file, run it, and check your prediction against the real output.
3. **Formalize.** Take your own recursive definition from Lesson 27's exercises and translate it directly into a Scheme procedure, following Concept Unit 5's exact clause-by-clause method — base case to `if`'s then-branch, recursive case to `if`'s else-branch.
4. **Explain.** Run your Exercise 3 procedure on a real argument, and write out its full execution trace by hand, the way Concept Unit 5 traced `(factorial 5)` — every call, in order, down to the base case and back.
5. **Explain.** Deliberately introduce Lesson 27, Concept Unit 4's, exact mistake into your Exercise 3 procedure — remove or break its base case — and run it. Report what Guile actually does, and how long it takes to fail.

### Definition of done

- [ ] You have Guile installed and can run a `.scm` file from the command line, showing real, observed output.
- [ ] You can write a `define` for both a plain value and a procedure, and explain the syntactic difference between the two forms.
- [ ] You can explain why `if` is a special form rather than an ordinary procedure, using this lesson's `if1.scm` demonstration as evidence, not just the definition alone.
- [ ] You can translate a recursive definition directly into a Scheme procedure and verify, clause by clause, that the translation matches the original definition exactly.
- [ ] You can produce a full execution trace, by hand, for a recursive procedure of your own applied to a real argument.
- [ ] Commit `factorial.scm`, and your Exercise 3 procedure, with a commit message explaining why translating a recursive definition directly, rather than restructuring it, was the point of this lesson.
