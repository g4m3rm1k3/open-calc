# Lesson 2: Expressions, Values, and Evaluation

**What you will build**: By the end of this lesson you will have run real code for the first time in this series — small arithmetic expressions, evaluated in a Clojure REPL — and you'll be able to explain precisely what "evaluation" means: not "the computer runs it and something happens," but a specific, traceable process of reducing an expression to a value, one sub-expression at a time. You'll also see the first real difference between a language whose notation can be ambiguous (ordinary arithmetic) and one engineered so it can't be.

**What you need to know first**: Lesson 1's *transformation* — the rule that connects a problem's input to its output. This lesson turns that abstract idea into something you can actually type and watch happen, for the first time.

**A note on this lesson's format**: This is the first lesson with real code, so most of it follows this series' full production schema — a throwaway lab, real code, real output, actually run this session. Concept Unit 1 is the one exception: it stays code-free, in the same style as all of Lesson 1, because the idea it establishes (what "expression," "value," and "evaluation" even mean) needs to be pinned down before any one language's syntax gets involved — exactly as Lesson 1 pinned down "input" and "output" before any code existed. From Concept Unit 2 onward, every code example below was run this session using Babashka, a Clojure implementation; installation instructions are in Concept Unit 2's Commands step, the first place they're needed.

**Terms introduced in this lesson**:

- **expression** — a piece of notation that denotes a value, possibly by combining smaller expressions. *Why it matters*: separating "the notation" from "the value it names" is what makes it possible to say two very different-looking pieces of notation (`2 + 3 * 4` and `14`) name the same thing.
- **value** — the result of evaluating an expression; something that has no further evaluation left to do. *Why it matters*: this is the thing a computation is actually trying to produce — Lesson 1's *output*, made precise enough to reason about mechanically.
- **evaluation** — the process of reducing an expression to its value, by repeatedly replacing sub-expressions with their own values until nothing is left to reduce. *Why it matters*: this is the literal, mechanical thing every program execution is doing, at every scale, from a single arithmetic expression to an entire running system.
- **sub-expression** — an expression nested inside a larger one, itself evaluated as one step of evaluating the whole. *Why it matters*: without this idea, "evaluate the expression" is a single opaque step; with it, evaluation becomes a traceable sequence you can follow by hand.
- **REPL** (Read-Eval-Print Loop) — a program that reads one expression you type, evaluates it, prints the resulting value, and loops back to read the next one. *Why it matters*: this is the tool every Clojure example in this series runs in; knowing what it's actually doing turns it from a black box into something you understand.
- **form** — Clojure's own word for a piece of Clojure syntax that can be evaluated (what this lesson has otherwise been calling an "expression," specifically when it's written in Clojure). *Why it matters*: Clojure's documentation and error messages use this word, not "expression" — learning it now avoids a translation step later.
- **prefix notation** — writing an operator before its operands (`(+ 1 2)`) rather than between them (`1 + 2`). *Why it matters*: this is the one grammar rule behind every Clojure form you will ever read or write, arithmetic included — recognizing it as a single consistent rule, not a special case for math, is what makes the rest of Clojure's syntax predictable from here on.

**Objects and methods used**:

- **`+`**
  - *What it is:* a function in Clojure's core library that adds numbers.
  - *Implementation:* variadic (accepts any number of arguments) — verified this session: `(+)` → `0`, `(+ 5)` → `5`, `(+ 1 2 3)` → `6`. With zero arguments it returns `0`; with one, it returns that number unchanged; with more, it returns their sum.
  - *Its use:* this lesson's first running example, `(+ 1 2)`.
- **`*`**
  - *What it is:* a function in Clojure's core library that multiplies numbers.
  - *Implementation:* variadic, verified this session: `(*)` → `1`, `(* 5)` → `5`, `(* 3 4)` → `12`.
  - *Its use:* the nested sub-expression in this lesson's motivating example, `(+ 2 (* 3 4))`.
- **`-`**
  - *What it is:* a function in Clojure's core library that subtracts numbers.
  - *Implementation:* variadic, verified this session: `(- 5)` → `-5` (one argument negates it), `(- 10 3 2)` → `5` (more than one argument subtracts each later one from the first, left to right).
  - *Its use:* Concept Unit 3's nested example, `(- (+ 8 2) (* 3 3))`.
- **`/`**
  - *What it is:* a function in Clojure's core library that divides numbers.
  - *Implementation:* variadic, verified this session: `(/ 5)` → `1/5` (one argument gives its reciprocal), `(/ 1 3)` → `1/3`. When every argument is a whole number and the division doesn't come out even, the result is an exact fraction rather than a rounded decimal — Concept Unit 4 is entirely about this behavior.
  - *Its use:* Concept Unit 4's exact-vs-approximate example, `(/ 1 3)` versus `(/ 1.0 3)`.

---

## Concept Unit: Expressions and Values

### The Problem

Take the notation `2 + 3 * 4`. What number does it name? Read strictly left to right, `2 + 3` is `5`, then `5 * 4` is `20`. Read using the "multiplication before addition" rule taught in school, `3 * 4` is `12` first, then `2 + 12` is `14`. Both readings follow *some* rule; they disagree. Before any programming language is involved, this lesson needs a precise account of what turns a piece of notation like this into one specific number — and why the notation alone doesn't settle it.

### The Concept, Concretely

Trace `2 + 3 * 4` using the standard convention (multiplication before addition), one reduction at a time:

```
2 + 3 * 4
  the sub-expression "3 * 4" reduces first (multiplication before addition): 3 * 4 → 12
2 + 12
  only one sub-expression is left: 2 + 12 → 14
14
```

Two things happened at each line: a *sub-expression* (a smaller expression nested inside the larger one — `3 * 4`, inside `2 + 3 * 4`) got replaced by its own value, and the result was a shorter expression with one less operation left to do. Repeating that — find a sub-expression, replace it with its value — until nothing is left to reduce, is the entire mechanical process. The final line, `14`, differs in kind from every line above it: it isn't waiting to be reduced further. That's what makes it a value rather than an expression.

Now trace the *other* reading — left to right, ignoring the precedence convention:

```
2 + 3 * 4
  read left to right: "2 + 3" reduces first: 2 + 3 → 5
5 * 4
  only one sub-expression is left: 5 * 4 → 20
20
```

Same starting notation, same mechanical process (find a sub-expression, reduce it), different *order* of reduction, different final value. The notation `2 + 3 * 4` never said which sub-expression to reduce first — "multiplication before addition" is a convention laid on top of the notation, not part of it. Nothing about the symbols themselves picks `14` over `20`.

### Generalizing

This trace generalizes past arithmetic completely: any notation that names a computation — a formula, a nested function call, a spreadsheet cell — has this same structure. Some piece of it can be reduced to a value; that reduction can reveal another reducible piece inside the result; the process repeats until a final value, one that doesn't reduce further, is reached. What arithmetic's `2 + 3 * 4` exposes sharply is that *evaluation order matters* and *notation alone doesn't always fix it* — which is exactly the seed of the next unit: a notation that fixes evaluation order by construction, so this particular ambiguity can't happen at all.

### Formal Definition, Walked Through

> An **expression** is a piece of notation that denotes a value, possibly by combining smaller expressions (**sub-expressions**). **Evaluation** is the process of determining an expression's value: if the expression is already a value, evaluation is done; otherwise, evaluate its sub-expressions and combine their values according to the rule the expression represents.

- *"denotes a value"* — an expression's job is to name or produce a value; `2 + 3 * 4` and `14` denote the *same* value even though they look completely different, which is exactly why "the expression" and "the value" need separate names.
- *"if the expression is already a value, evaluation is done"* — this is why the trace above stopped at `14`: a bare number has nothing left to reduce, so evaluating it just gives back itself.
- *"evaluate its sub-expressions... according to the rule the expression represents"* — this is the step that was ambiguous above: `2 + 3 * 4` has two plausible sub-expressions to reduce first (`2 + 3` or `3 * 4`), and "the rule the expression represents" (precedence) is what has to say which — a rule external to the raw symbols themselves.

### CS Lens

This reduce-a-sub-expression-until-nothing's-left process is the mechanical core of every programming language's execution model, not just arithmetic. Also recognized in: a spreadsheet recalculating `=A1+B1*C1` (the software evaluates sub-expressions in a fixed order, invisibly, every time a cell changes), a calculator app, a compiler's constant-folding pass, and — much later in this series — Lesson 163's *interpreters*, which are, precisely, programs that automate the exact trace performed by hand above.

### SE Lens

Relying on a shared, memorized precedence convention (as ordinary math notation does) works for arithmetic, where the convention is close to universal — but it doesn't scale cleanly to a general-purpose language with dozens of operators, both built-in and user-defined; disagreements about "what binds tighter" are a real, recurring source of subtle bugs in languages that lean on infix notation with many operators. The next unit shows one language's answer: remove the need for a memorized convention entirely, by making every grouping decision explicit in the notation itself.

---

## Concept Unit: Clojure's Prefix Notation

### The Problem

The ambiguity traced above — `2 + 3 * 4` meaning `14` under one convention and `20` under a naive one — exists because the notation doesn't show its own grouping; a reader has to already know the precedence rules to recover it. Is there a notation for the exact same computation that doesn't have this problem — where the grouping is visible in the symbols themselves, with nothing to memorize?

### Introduce the concept in isolation

Here is the same computation — add `2` and the product of `3` and `4` — written in Clojure:

```clojure
(+ 2 (* 3 4))
```

Running it (installation instructions are in the Commands step below):

```
user=> (+ 2 (* 3 4))
14
```

The value is `14` — unambiguously, the same answer the school-convention trace above reached, with no left-to-right misreading possible. This is called **prefix notation**: the operator (`+`, `*`) is written *before* its operands, inside parentheses, instead of between them. Every operation Clojure ever performs — arithmetic included — is written this same way: `(operator operand operand ...)`. That whole parenthesized unit is what Clojure calls a **form** — its own word for "an expression written in Clojure's own syntax."

This proves something concrete: nesting the parentheses is what fixes the grouping. `(* 3 4)` is entirely enclosed in its own parentheses, sitting in the position of one of `+`'s operands — there's no question about whether it's grouped with the `2` or evaluated as its own unit first, because the parentheses themselves say so, not a memorized rule about which operator "binds tighter."

### Discard the throwaway example

This one-off REPL session isn't going into any file — it's evaluated once, at the prompt, and the value it produces (`14`) isn't reused anywhere. Every Concept Unit in this lesson works the same way: type an expression, see its value, move on. Lesson 3 is where this series starts giving values names that persist and get reused — nothing from this unit's REPL session carries forward on its own.

### Project Change

- **Reference Source**: No reference counterpart — this is the first code in the entire series. There is nothing to port from; the goal is introducing evaluation itself.
- **Files affected**: None. This lesson's code is typed directly at the Babashka REPL prompt and evaluated immediately — nothing is saved to a file. This series starts saving code to files once Lesson 3 introduces named bindings worth keeping around.
- **Change type**: N/A — nothing exists yet to add to, replace, or configure.
- **Location**: N/A — typed fresh at the prompt.
- **Dependencies**: Babashka, installed and runnable (see Commands, below).

### The New Code — type it yourself

```clojure
(+ 1 2)
```

The smallest possible version of this unit's idea: one operator, two operands, prefix notation.

### The Updated Project

Skipped deliberately: this fragment has no enclosing structure to place it inside — no function, no file, nothing surrounding it. It's the entire thing you type at the REPL prompt, and the REPL evaluates it the instant you press Enter. (Project Change, above, already covers why: no file exists yet for this to live inside.)

### Mechanical walkthrough — how it works in isolation

Enumerating every syntactic element of `(+ 1 2)`, in order:

- **`(` … `)`** — first appearance. In ordinary math notation, parentheses only *group* an already-written expression (`(2 + 3) * 4`). In Clojure, a parenthesized group isn't optional grouping — it *is* the notation for "call this operator on these operands." Writing `+ 1 2` without the parentheses doesn't leave "the same computation, less grouped," the way `2 + 3 * 4` without extra parens still means something — it isn't a form Clojure evaluates as a call at all, just three separate things sitting next to each other. The parentheses aren't decoration here; they're the entire mechanism that makes this a function call.
- **`+`** — first appearance. Covered fully in "Objects and methods used," above: the addition function, sitting in *operator position* — the first thing inside the parentheses, the position Clojure always reads as "which operation is this."
- **`1`, `2`** — first appearance, but genuinely basic: numeric literals, written exactly as they'd be written in Python or ordinary arithmetic notation. Nothing about *how you write the digit* `1` is Clojure-specific — only its *position* (after the operator, not around it) is new, and that's already covered by the parentheses bullet above.

### CS Lens

Prefix notation for every operation, with no exceptions for arithmetic, is one member of a small family of ways to remove notational ambiguity entirely — the other well-known members are *postfix* (operators after their operands, as in `3 4 *`, used by RPN calculators and the stack-machine execution model covered in Lesson 193) and *fully-parenthesized infix* (`(2 + (3 * 4))`, keeping the familiar between-operands position but forcing every grouping to be explicit). All three share the same underlying idea: an unambiguous notation removes the need for a memorized precedence table, at the cost of looking unfamiliar the first time.

### SE Lens

Clojure's designers chose to apply this rule with zero exceptions, even where it looks unfamiliar (arithmetic), rather than special-casing arithmetic to look like ordinary infix math notation the way most languages do. The tradeoff is real: infix arithmetic (`1 + 2`) is more familiar on first contact; uniform prefix notation (`(+ 1 2)`) means there is exactly one grammar rule for "how do I call something" in the entire language, arithmetic included, instead of one rule for arithmetic operators and a different rule for everything else. That uniformity is what will make Lesson 4 (*Functions as Transformations*) land as "arithmetic was already an example of this," rather than a special case needing its own explanation.

### Commands needed to make this unit real

This lesson's code needs a Clojure implementation installed. This series uses **Babashka**, a fast-starting, single-executable implementation of Clojure — well suited to a REPL you'll open constantly throughout the next several sections, without a multi-second JVM startup delay each time you open it.

1. Download the Windows build from Babashka's GitHub releases page: `https://github.com/babashka/babashka/releases/latest` — look for the asset named `babashka-<version>-windows-amd64.zip` (verified this session: `babashka-1.13.219-windows-amd64.zip`).
2. Extract the zip. It contains one file, `bb.exe` — put it somewhere convenient, for example `C:\tools\babashka\bb.exe`.
3. Confirm it works. Open a terminal in that folder and run:
   ```
   bb.exe --version
   ```
   Verified output, this session:
   ```
   babashka v1.13.219
   ```
4. Start a REPL — a program that **R**eads one form you type, **E**valuates it, **P**rints the resulting value, then **L**oops back to read the next one (that's what the term means, and it's the tool every code example in this lesson runs in):
   ```
   bb.exe
   ```
   This prints a `user=>` prompt and waits. Typing a form and pressing Enter evaluates it and prints its value, then shows `user=>` again for the next one. (Adding `bb.exe`'s folder to your system `PATH` lets you type just `bb` instead of the full path — optional, and not required for anything in this lesson.)

### Run it. Show the real output.

```
user=> (+ 1 2)
3
```

Verified this session via Babashka v1.13.219.

### One sentence connecting this unit to what came immediately before

The previous unit traced `2 + 3 * 4` by hand and found its grouping was ambiguous without an outside convention; `(+ 2 (* 3 4))` is the same kind of computation with that ambiguity engineered out of the notation itself.

---

## Concept Unit: Nested Expressions and Evaluation Order

### The Problem

`(+ 1 2)` has only one operation and no sub-expressions to speak of. Concept Unit 1's whole point — sub-expressions nested inside larger expressions, each reduced to a value in turn — hasn't actually been exercised in Clojure yet. Does Clojure's evaluation process for a nested form like `(+ 2 (* 3 4))` actually match the by-hand trace from Concept Unit 1, step for step?

### Introduce the concept in isolation

This is exactly the motivating example from the previous unit — worth tracing properly now, the way Concept Unit 1 traced `2 + 3 * 4` by hand:

```
user=> (+ 2 (* 3 4))
14
```

```
(+ 2 (* 3 4))
  "(* 3 4)" is a sub-expression sitting in operand position — it must be reduced to a value before "+" can be applied at all: (* 3 4) → 12
(+ 2 12)
  both operands are now plain values; apply "+": (+ 2 12) → 14
14
```

Compare this to Concept Unit 1's trace of `2 + 3 * 4`: same two operations (one multiplication, one addition), same final value `14` — but this time there was only one legal reduction order, because `(* 3 4)` being wrapped in its own parentheses, sitting inside `+`'s operand position, *is* the statement "reduce me first, I'm nested inside." Nothing needed to be memorized about which operator binds tighter; the nesting says it directly.

This proves the claim from the previous unit's "Mechanical walkthrough": a parenthesized form in operand position isn't optional grouping, it's a sub-expression that gets evaluated to a value before the surrounding form can be applied — exactly the general evaluation rule Concept Unit 1 defined, now shown holding for real, running code.

### Discard the throwaway example

As before, nothing here is saved — this is one more REPL session, evaluated once, its value not reused.

### Project Change

- **Reference Source**: No reference counterpart — building directly on the previous unit's own first example.
- **Files affected**: None (same as the previous unit — still no file exists in this series yet).
- **Change type**: N/A.
- **Location**: N/A — typed fresh at the prompt.
- **Dependencies**: Babashka, already installed in the previous unit.

### The New Code — type it yourself

```clojure
(- (+ 8 2) (* 3 3))
```

A slightly deeper case than the motivating example: *two* nested sub-expressions inside one outer form, instead of one.

### The Updated Project

Skipped for the same reason as the previous unit: no enclosing file or function exists for this fragment to be placed inside.

### Mechanical walkthrough — how it works in isolation

- **`-`** — first appearance as a *called* function in this lesson (covered in Objects and methods used, above): subtraction, applied to two operands here.
- **Outer form `(- … …)`** — a reappearance of the pattern the previous unit already gave full treatment to (an operator in prefix position, operands following) — per the Repetition Rule, no new explanation owed for the *shape*, only for what's different this time: it now has two operands that are themselves forms, not plain numbers.
- **`(+ 8 2)`, in the first operand position** — a reappearing sub-expression, exactly the role `(* 3 4)` played in the motivating example: it must reduce to a value (`10`) before `-` can be applied.
- **`(* 3 3)`, in the second operand position** — a second sub-expression in the *same* outer form. This is new: the motivating example only had one nested sub-expression; this shows the same rule (reduce sub-expressions to values first) applying independently to *each* operand position, not just the first one it happens to appear in.

**Execution trace:**

```
(- (+ 8 2) (* 3 3))
  first operand is a sub-expression: (+ 8 2) → 10
(- 10 (* 3 3))
  second operand is also a sub-expression: (* 3 3) → 9
(- 10 9)
  both operands are now plain values; apply "-": (- 10 9) → 1
1
```

### CS Lens

Reducing every nested sub-expression to a value before applying the outer operator — regardless of how many operand positions hold sub-expressions, or how deeply they're nested — is the same evaluation rule as Concept Unit 1's formal definition, just now shown holding for a form with *more than one* nested sub-expression rather than only one. Also recognized in: a compiler's expression tree (Lesson 162, *Abstract Syntax Trees*, gives this exact shape its own name — this nested-parentheses picture *is* what a syntax tree looks like, drawn as text instead of a diagram), and any nested function call in any language (`f(g(x), h(y))` reduces `g(x)` and `h(y)` before calling `f`, by the same rule, in a language with entirely different-looking syntax).

### SE Lens

The alternative — a language where deeply nested expressions become progressively harder to read because grouping isn't visually explicit — is a real, common complaint about ordinary infix notation once expressions get complicated (`a + b * c - d / e + f * (g - h)`). Clojure's uniform prefix notation trades that unfamiliarity for a mechanical guarantee: the nesting in the parentheses *is* the evaluation order, always, no matter how deep it goes — a property that becomes more valuable, not less, as expressions grow more complex, which is exactly the direction this series' code examples head from here.

### Run it. Show the real output.

```
user=> (- (+ 8 2) (* 3 3))
1
```

Verified this session via Babashka v1.13.219.

### One sentence connecting this unit to what came immediately before

The previous unit showed one operator applied to two plain numbers; this unit showed the exact same rule — reduce, then apply — extending unchanged to operands that are themselves whole sub-expressions, which is what "nested" actually means.

---

## Concept Unit: Division and Exact Values

### The Problem

Every value seen so far in this lesson has been a whole number, and every one of them was unambiguous — `14`, `1`, and so on are each exactly one specific value, with nothing approximate about them. Division doesn't usually split evenly, though: what value does `(/ 1 3)` — one divided by three — actually produce, and is it *exactly* right, or a rounded stand-in for it?

### Introduce the concept in isolation

```
user=> (/ 1 3)
1/3
```

That's not an approximation — it's the exact fraction one-third, printed using a slash, the way `1/3` gets written by hand. Compare a case where the division comes out even:

```
user=> (/ 6 3)
2
```

`6` divided by `3` is a whole number, so Clojure's `/` returns a plain whole number rather than a fraction that happens to reduce — the value `2`, indistinguishable from typing `2` directly. Now compare what happens when one of the numbers is written with a decimal point instead of as a whole number:

```
user=> (/ 1.0 3)
0.3333333333333333
```

`1.0` (with the decimal point) produces a *decimal approximation* of one-third, cut off after sixteen digits — not the exact value `1/3`. If you've written `1 / 3` in Python before, this is the behavior you'd already recognize: Python's `/` always produces a decimal approximation like this, even when both numbers are whole (`1 / 3` in Python gives `0.3333333333333333` too, never the exact fraction). Clojure's `/` does something Python's doesn't: when *every* number involved is written as a whole number (no decimal point anywhere), the result is the exact fraction — only writing a number *with* a decimal point (`1.0` instead of `1`) switches the computation over to decimal approximation.

This proves a claim worth stating precisely: **the same mathematical operation, division, produces a genuinely different value depending on how the operands were written** — `1/3` and `0.3333333333333333` are two distinguishable values in Clojure, not two ways of printing the same one. One is the exact mathematical value one-third; the other is a decimal that has been cut off after a fixed number of digits, and is only *close* to one-third.

### Discard the throwaway example

As before — a REPL session, evaluated once, nothing saved.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, direct continuation of the previous two units' REPL sessions.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A — typed fresh at the prompt.
- **Dependencies**: Babashka, already installed two units ago.

### The New Code — type it yourself

```clojure
(/ 1 3)
```

### The Updated Project

Skipped, for the same reason as the previous two units: no enclosing file or function exists yet.

### Mechanical walkthrough — how it works in isolation

- **`/`** — first appearance as a called function (covered in Objects and methods used, above): division, applied here to two whole-number operands.
- **`1`, `3`** — reappearing numeric literals (per the Repetition Rule, no new explanation owed for *how* a literal is written) — but their *form* (no decimal point) is doing real work this time: it's what tells Clojure to compute an exact fraction rather than a decimal approximation, as the isolated example above demonstrated by contrast with `1.0`.
- **The outer form `(/ 1 3)`** — a reappearance of the prefix-call pattern from Concept Unit 2; no new explanation owed for the shape itself.

### CS Lens

A value whose printed form is a truncated stand-in for the true mathematical value — as `0.3333333333333333` is for one-third — is a recurring theme with real teeth: Lesson 189 (*Floating-Point Representation*) devotes an entire lesson to exactly why decimals like this are approximations rather than perfectly accurate values, and to the errors that accumulate from doing arithmetic on stand-ins instead of exact values. Also recognized in: currency calculations (where using an approximate decimal type instead of an exact one is a well-known, real source of off-by-a-cent bugs), and any measurement recorded with limited precision (a ruler reading "3.3 cm" isn't claiming the true length is exactly `3.3000...`, only that it rounds to that at the ruler's precision).

### SE Lens

A language that only ever produced decimal approximations for division (as most languages, including Python, do by default) is simpler in one sense — one numeric representation, one behavior — but it means "did I actually get an exact answer, or a rounded one?" is a question the *programmer* has to track manually, separately from the value itself, because the value's printed form doesn't distinguish the two cases. Clojure's choice — track exactness as part of the value itself, only losing it when a decimal point is explicitly written somewhere in the computation — pushes that tracking into the language, at the cost of a numeric system with more than one kind of number to keep straight (a cost Lesson 187, *Integer Representation*, and Lesson 189 pick back up in full).

### Run it. Show the real output.

```
user=> (/ 1 3)
1/3
user=> (/ 6 3)
2
user=> (/ 1.0 3)
0.3333333333333333
```

Verified this session via Babashka v1.13.219.

### One sentence connecting this unit to what came immediately before

The previous two units established that Clojure's evaluation always produces *some* value for a well-formed expression; this unit is the first case in this lesson where *which* value depends on a detail (a decimal point) easy to overlook — a direct, concrete instance of Lesson 1's warning that a technically-produced answer can still be the wrong one if a detail of the specification (here, "exact or approximate?") goes unexamined.

---

## Connect the Pieces

One expression, exercising every unit built in this lesson at once:

```
user=> (- (+ 2 (* 3 4)) (/ 1 3))
41/3
```

Trace it: `(* 3 4)` is a nested sub-expression, reducing first, to `12` (Concept Unit 3's rule). `(+ 2 12)` then reduces to `14` (Concept Unit 2's prefix notation, applied). `(/ 1 3)` reduces separately, in the second operand position, to the exact fraction `1/3`, not a decimal approximation, because neither `1` nor `3` was written with a decimal point (Concept Unit 4's rule). Finally, `(- 14 1/3)` reduces to `41/3` — Clojure's `-`, like `/`, keeps the result exact rather than converting it to a decimal, because every value involved was exact to begin with. Every reduction in that trace is the same single rule from Concept Unit 1's formal definition — evaluate sub-expressions, then apply the operator to their values — applied uniformly, all the way down, with prefix notation removing any question about which sub-expression to reduce first.

## What Breaks Without This

Concept Unit 1's ambiguous trace found two different values for the same symbols, `2 + 3 * 4`, depending on grouping: `14` under the standard convention, `20` under a naive left-to-right reading. Prefix notation was supposed to make that kind of mistake impossible by making grouping explicit — but explicit grouping still has to be *written correctly*. Compare:

```
user=> (+ 2 (* 3 4))
14
user=> (* (+ 2 3) 4)
20
```

Same four symbols — `2`, `3`, `4`, and one `+` and one `*` — arranged with different nesting, and the values are the exact same two numbers, `14` and `20`, that the ambiguous infix notation produced. Prefix notation didn't remove the possibility of getting the wrong value — it moved the risk from "an unwritten convention the reader has to already know" to "the parentheses have to be nested where you actually meant them," a mistake you can see directly in the text once you know to look for it, rather than one hiding in an invisible precedence rule.

## Exercises

1. **Trace.** By hand, trace `(+ (* 2 3) (- 10 4))` the way this lesson traced its own examples — one reduction at a time — before running it. What value do you get?
2. **Predict.** Without running it, predict whether `(* (- 10 4) (+ 2 3))` produces the same value as Exercise 1's expression. The same four numbers and the same two operators appear in both — does the same *nesting* appear in both? Run it and check.
3. **Trace exact vs. approximate.** `(/ 22 7)` is a classic approximation of π. Predict what Clojure prints for `(/ 22 7)`, and separately for `(/ 22.0 7)` — then run both. Explain, in one sentence each, why they differ, using this lesson's vocabulary (which value is exact, which is a decimal approximation, and what in the notation caused the difference).
4. **Break it.** Take any nested expression from this lesson and deliberately move one sub-expression's parentheses to change what's nested inside what — the same kind of change as "What Breaks Without This" made to `(+ 2 (* 3 4))`. Predict the new value before running it, then confirm.
5. **Generalize.** Using only `+` and `/` in prefix notation, write an expression for "the average of 8, 12, and 22." (You'll need one form nested inside the other.) Run it and confirm the value is what you expect.
6. **Reconstruct.** Close this lesson. From memory, state the evaluation rule from Concept Unit 1's formal definition, and explain in your own words why `(+ 2 (* 3 4))` can only ever mean one thing, while `2 + 3 * 4` needed an outside convention to mean anything in particular.

## Definition of Done

- [ ] Babashka is installed and `bb.exe --version` runs successfully on your machine.
- [ ] You can evaluate a nested arithmetic expression at the REPL and correctly predict its value before running it, for at least two levels of nesting.
- [ ] You can state, from memory, the difference between an expression and a value.
- [ ] You completed Exercise 3 and can explain, without looking back at this lesson, why `(/ 22 7)` and `(/ 22.0 7)` produce different kinds of values.
- [ ] Commit a short notes file recording your answers to Exercises 5 and 6 to your notes repository, with a commit message explaining *why* the average expression needed nesting — for example, `"Average expression needs (/ (+ ...) 3) nested, not (+ (/ ...) ...) — division has to apply to the whole sum, not each term"` — not just `"lesson 2 exercises"`.

---

**Next lesson:** Lesson 3, *Names, Bindings, and Environments*, gives values a name that persists — the first time this series saves anything to a file, and the first step past "type an expression, see a value, forget it" toward building something that lasts longer than one REPL session.
