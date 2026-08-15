# Lesson 48: Recurrences

**What you will build**: By the end of this lesson you'll be able to translate a recursive function's own structure directly into a recurrence equation describing its cost — the precise mathematical object behind every growth pattern this series has already measured by hand, from `sum-to`'s straightforward linear cost to `fib`'s explosive branching one. This lesson only translates; the next one solves what gets written here.

**What you need to know first**: `sum-to` (Lesson 20), `fib` and its evaluation tree (Lesson 23), and `reverse-naive`'s counted cost (Lesson 28) — this lesson gives each of their costs a precise equation.

**Terms introduced in this lesson**:

- **recurrence** (or **recurrence relation**) — an equation defining a quantity, often a cost or a count, in terms of the same quantity at a smaller input size. *Why it matters*: gives an algorithm's *cost* the identical recursive-definition treatment Lesson 19 gave *data* — translating "how much work does this do" into a precise equation, not a felt impression.
- **T(n)** — standard notation for "the amount of work an algorithm performs on an input of size `n`." *Why it matters*: a fixed, conventional name for exactly the quantity this lesson's recurrences describe, used identically across every algorithm this lesson and the next one cover.

**Objects and methods used**: None new. This lesson analyzes already-written functions rather than introducing new code.

---

## Concept Unit: From Algorithm to Equation — Counting Recursive Calls

### The Problem

`sum-to`'s recursive case does one addition and makes one recursive call, on an input one smaller. Stated as a cost, in the standard `T(n)` notation, what equation captures exactly that?

### Introduce the concept in isolation

Recall `sum-to`'s definition (Lesson 20): the base case does a fixed, small amount of work (checking `(= n 0)`, returning `0`); the recursive case does that same fixed amount of work, plus whatever `(sum-to (- n 1))` itself costs. Write this as a **recurrence**:

> **T(n) = T(n-1) + c**, for `n > 0`, with **T(0) = c'**

`c` and `c'` stand for "some fixed, small amount of work" — one addition, one comparison, one function call's own overhead — deliberately left unspecified in exact units, since the *shape* of the recurrence, not the precise constant, is what this lesson and the next one care about.

### Discard the throwaway example

Not applicable — this equation is a precise restatement of `sum-to`'s own already-understood behavior.

### Generalizing

Every function this series has written with `sum-to`'s exact shape — one recursive call, on an input one smaller, plus a fixed amount of surrounding work — has the identical recurrence: `factorial`, `my-length`, `list-sum`. The recurrence describes the *cost's* structure, exactly the way Lesson 19's recursive definitions described *data's* structure — and, unsurprisingly, functions that share a data-recursion shape (Lesson 21) also share a cost recurrence shape.

### CS Lens

`T(n) = T(n-1) + c` is precisely the recurrence Lesson 51 (*Big-O*) will show corresponds to **linear** growth — the next lesson derives exactly why, but the translation itself (read the recursive case's own structure directly off the code) is this unit's whole point, independent of knowing the answer in advance.

### SE Lens

Writing this equation down explicitly, rather than reasoning about a function's cost only informally, is what makes it possible to *compare* two functions' costs precisely — Concept Unit 2 and 3's recurrences will look visibly different from this one, in a way "feels slower" never could state precisely.

---

## Concept Unit: A Recurrence for Branching Recursion

### The Problem

`fib`'s recursive case makes *two* recursive calls, not one — `(fib (- n 1))` and `(fib (- n 2))`. Lesson 23 traced its evaluation tree by hand and found real, measured redundancy. What equation captures `fib`'s cost precisely?

### Introduce the concept in isolation

`fib`'s recursive case does a fixed amount of surrounding work (one addition, one comparison), plus whatever *both* recursive calls cost:

> **T(n) = T(n-1) + T(n-2) + c**, for `n > 1`, with **T(0) = T(1) = c'**

This is visibly a different *shape* of equation than `sum-to`'s — two smaller instances of `T` appear on the right-hand side, not one, directly reflecting `fib`'s own two recursive calls. Nothing about writing this equation down required knowing yet how fast `T(n)` actually grows — only reading `fib`'s own recursive case and transcribing exactly what it does.

### Discard the throwaway example

Not applicable — this equation restates `fib`'s already-traced behavior precisely.

### Generalizing

Any function making `k` recursive calls per non-base case produces a recurrence with `k` smaller `T` terms on the right — `find-subset-sum` (Lesson 33, before pruning trims some branches away) and `tree-sum` (Lesson 30) both have this same two-term shape as `fib`, for the identical structural reason: two recursive calls per level.

### CS Lens

`T(n) = T(n-1) + T(n-2) + c` is the recurrence behind **exponential** growth — Lesson 47's geometric series and this recurrence are closely related, and Lesson 49 derives exactly how. The connection to Lesson 23's evaluation tree is direct: every node in that tree corresponds to one "unit" of the `+ c` term, and the tree's total size *is* what `T(n)` computes.

### SE Lens

Recognizing a function's recurrence shape *before* running it on a large input is what lets a real cost problem be predicted rather than discovered the hard way — `T(n) = T(n-1) + T(n-2) + c`, once its growth is known (next lesson), immediately signals that naive `fib` will become impractically slow well before any specific input size needs to be tried and timed.

### Connection to the previous unit

The previous unit's recurrence had one smaller `T` term, matching `sum-to`'s one recursive call; this unit's has two, matching `fib`'s two — the recurrence's shape is a direct, mechanical transcription of the recursive case's own structure, not a separate analysis requiring new information.

---

## Concept Unit: A Recurrence Involving the Recursive Call's Own Cost

### The Problem

`sum-to` and `fib`'s recurrences both had a *constant* amount of surrounding work (`c`) at each level. `reverse-naive` (Lesson 28) is different: its recursive case calls `my-append`, whose own cost depends on `n`, not a fixed constant. What recurrence captures that?

### Introduce the concept in isolation

Recall Lesson 28's precise count: `reverse-naive`'s recursive case costs one `my-append` call on a list of length roughly `n - 1`, which itself costs about `n - 1` steps (Lesson 28's own finding — `my-append`'s cost is proportional to its first argument's length), plus whatever the recursive call `(reverse-naive (rest lst))` costs:

> **T(n) = T(n-1) + (n-1)**, for `n > 0`, with **T(0) = c**

The surrounding work here isn't a constant `c` — it's `(n-1)`, itself dependent on the current input size. This is exactly Lesson 46's arithmetic series in disguise: solving this recurrence (next lesson) means summing `(n-1) + (n-2) + ... + 1 + 0`, precisely the sum Lesson 28 already counted by hand, and precisely the shape Lesson 46's pairing formula solves directly.

### Discard the throwaway example

Not applicable — this equation restates Lesson 28's already-counted cost precisely.

### Generalizing

A recurrence's "surrounding work" term doesn't have to be a fixed constant — any function whose recursive case does work proportional to the current input size, before or after recursing, produces this kind of recurrence, and Lesson 46's arithmetic series formula is exactly the tool that solves it, as the next lesson shows directly.

### CS Lens

`T(n) = T(n-1) + (n-1)` is the recurrence behind **quadratic** growth — the exact shape Lesson 28 discovered by direct counting, now given its precise algebraic form, connecting Lesson 28's hands-on arithmetic to Lesson 46's arithmetic series formula in a single equation.

### SE Lens

This is the recurrence for exactly the situation Lesson 28's SE Lens warned about: a function whose recursive case does non-constant work at every level, silently accumulating cost in a way invisible from reading any single line of code — the recurrence, once written down, makes that accumulation visible and precise, rather than something only a careful hand-count (like Lesson 28's) would reveal.

### Connection to the previous unit

The previous two units both had recurrences with a fixed `c` as the "extra" work per level; this unit's `(n-1)` is the first case where that extra work itself scales with the input — a real, third shape, distinct from both, directly connecting this lesson's recurrences to Lesson 46's series formula ahead of actually solving anything.

---

## Connect the Pieces

All three recurrences, side by side, each transcribed directly from an already-understood function's own structure:

| Function | Recursive calls | Extra work per level | Recurrence |
|---|---|---|---|
| `sum-to` | 1 | constant | `T(n) = T(n-1) + c` |
| `fib` | 2 | constant | `T(n) = T(n-1) + T(n-2) + c` |
| `reverse-naive` | 1 | proportional to `n` | `T(n) = T(n-1) + (n-1)` |

Every recurrence was read directly off its function's own recursive case — how many recursive calls, on what smaller inputs, plus how much additional work happens at that level — with nothing yet said about how fast any of the three actually grow. That's deliberate: this lesson's entire job was accurate translation; Lesson 49 is where these three equations get solved and compared.

## What Breaks Without This

Suppose someone assumed all three functions had the *same* recurrence shape, `T(n) = T(n-1) + c`, purely because all three "recurse on `n-1`" in some sense. `fib`'s actual behavior — genuinely different, with *two* recursive calls, not one — would then be predicted to cost roughly the same as `sum-to`'s, when Lesson 23's own hand-traced evaluation tree already proved otherwise (nine calls for `fib(4)`, not four). Writing the recurrence down precisely, rather than pattern-matching on a superficial resemblance ("it recurses on `n-1`, so it must be linear"), is exactly what catches this mistake before it leads to a wildly wrong prediction about how a function will actually perform on larger input.

## Exercises

1. **Trace.** Write the recurrence for `my-length` (Lesson 24), justifying each part by pointing to the specific line of code it comes from.
2. **Predict.** Before writing it, predict whether `tree-sum`'s (Lesson 30) recurrence looks more like `sum-to`'s or `fib`'s. Write the recurrence and confirm.
3. **Derive.** Write the recurrence for `count-halvings` (Lesson 43), being careful about what the "smaller input" actually is (hint: it isn't `n - 1`).
4. **Break it, on purpose.** Write a *wrong* recurrence for `reverse-naive` — one that uses a constant `c` instead of `(n-1)` — and explain, using Lesson 28's own counted values, exactly which input size would first reveal the wrong recurrence's prediction as inaccurate.
5. **Generalize.** Write the recurrence for `eval-poly-horner` (Lesson 42), and compare it to `eval-poly-naive`'s. Do they have the same shape, or different ones?
6. **Reconstruct.** Close this lesson. From memory, state all three recurrence shapes from this lesson, and explain how to tell, just from reading a recursive function's code, which shape its own recurrence will have.

## Definition of Done

- [ ] You can translate a recursive function's code directly into a recurrence, correctly counting recursive calls and surrounding work.
- [ ] You completed Exercise 3 (`count-halvings`) and correctly identified that its "smaller input" isn't `n - 1`.
- [ ] You completed Exercise 5 and can state whether `eval-poly-horner` and `eval-poly-naive` share a recurrence shape.
- [ ] You can explain why superficial resemblance ("it recurses on n-1") isn't enough to conclude two functions share a recurrence.
- [ ] Commit your Exercise 3 and Exercise 5 recurrences to your notes repository, with a commit message stating each one's shape — for example, `"Derive count-halvings recurrence T(n)=T(n/2)+c; confirm eval-poly-horner and eval-poly-naive have different recurrence shapes despite computing the same value"` — not just `"lesson 48 exercise"`.

---

**Next lesson:** Lesson 49, *Solving Simple Recurrences*, takes all three of this lesson's equations and derives their actual closed-form growth — using expansion, substitution, and the series formulas Lessons 46 and 47 already proved — turning "here's the equation" into "here's exactly how fast this grows."
