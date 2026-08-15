# Lesson 21: Structural Recursion

**What you will build**: By the end of this lesson you'll be able to name, precisely, why `sum-to` and `factorial` ended up with visibly the same shape in the previous lesson — it wasn't a stylistic coincidence, it was forced by both functions recursing on the exact same underlying data definition. You'll also see what changes when a recursive function *doesn't* follow its data's own structure, and why that requires a different, separate justification.

**What you need to know first**: The previous lesson's `sum-to` and `factorial`, and Lesson 19's recursive definition of the natural numbers.

**Terms introduced in this lesson**:

- **structural recursion** — a recursive function whose recursive call operates on exactly the "smaller instance" that a recursive data definition's own recursive case specifies. *Why it matters*: this is the precise name for what made `sum-to` and `factorial` end up with the same shape — both recurse on the natural numbers' own successor-based structure, not on some independently invented notion of "smaller."

**Objects and methods used**: None new. This lesson reuses `defn`, `if`, `=`, `<=`, `+`, `-`, and `not`, each already fully covered.

---

## Concept Unit: What Makes Recursion "Structural"?

### The Problem

`sum-to` and `factorial`, in the previous lesson, had visibly identical shapes: check for the base case, return a literal directly; otherwise, combine the current value with a recursive call on `(- n 1)`. Was that a coincidence, a stylistic choice both happened to share, or something forced by the problem itself?

### Introduce the concept in isolation

Recall the natural numbers' own recursive definition, from two lessons ago: `0` is the base case; the successor of a smaller natural number (`n - 1`, going the other direction) is the recursive case. Both `sum-to` and `factorial` recurse on *exactly* this structure — their recursive call is always on `(- n 1)`, the precise "smaller instance" the natural numbers' own recursive case specifies, never on anything else (`(- n 2)`, `(/ n 2)`, or some other notion of "smaller"). This is **structural recursion**: the function's recursive call follows the data's own recursive definition, exactly.

This isn't a coincidence — it's close to forced. Given a recursive definition with one base case and one recursive case referring to "a smaller instance of the same kind," a function that mirrors that structure has almost no other choice to make beyond *what to return at the base case* and *how to combine the current piece with the recursive call's result*. Everything else — which input the recursive call receives, and how many recursive calls there are — is dictated by the data's own definition, not invented separately by whoever writes the function.

### Discard the throwaway example

Not applicable — this unit names something already demonstrated by code the previous lesson already wrote and verified.

### Formal Definition, Walked Through

> A recursive function exhibits **structural recursion** on a recursive data definition if, for every recursive case of the definition, the function makes exactly one recursive call per smaller instance the definition's recursive case refers to, on that exact smaller instance.

- *"exactly one recursive call per smaller instance"* — the natural numbers' recursive case refers to one smaller instance (`n - 1`); a structurally recursive function on natural numbers therefore makes exactly one recursive call, on exactly `n - 1`. A tree's recursive case (Lesson 19) refers to *two* smaller instances (a left and a right subtree); a structurally recursive function on trees will make exactly two recursive calls, one per subtree — previewed here, fully demonstrated once Lesson 30 introduces real trees.

### CS Lens

Structural recursion is the precise reason "derive the function from the data definition" (Lesson 20's own method) works as reliably as it does — the data definition doesn't just suggest a function's shape, it very nearly determines it, the same way Lesson 4's parameter list determined exactly how many arguments a call needed to supply, leaving little room for a different, equally valid shape.

### SE Lens

Recognizing when a function is structurally recursive — and when it isn't — is what makes correctness arguments (Lesson 22's termination proofs, and eventually Lesson 300's general proof techniques for algorithms) tractable: a structurally recursive function's termination follows almost automatically from the data definition's own well-foundedness (Lesson 19's completeness clause), while a non-structural one needs its own, separate argument — exactly what the next two units show, first by contrast, then by direct demonstration.

---

## Concept Unit: The Shape Is Forced, Not Chosen

### The Problem

Is structural recursion's "almost no choice" claim actually true, or does it just happen to hold for addition and multiplication specifically? Try it with a completely different kind of result — not a number, but a boolean.

### Introduce the concept in isolation

Define "is `n` an even number," recursively, the same two-part way as before:

- **Base case:** `0` is even — `true`.
- **Recursive case:** `n` (for `n > 0`) is even exactly when `n - 1` is *not* even.

```clojure
(defn even-number? [n]
  (if (= n 0)
    true
    (not (even-number? (- n 1)))))
```

```
user=> (even-number? 4)
true
user=> (even-number? 3)
false
```

Trace it briefly: `(even-number? 3)` is `(not (even-number? 2))`; `(even-number? 2)` is `(not (even-number? 1))`; `(even-number? 1)` is `(not (even-number? 0))`; `(even-number? 0)` is `true`, directly. Unwinding: `(not true)` is `false` (so `1` is not even — correct); `(not false)` is `true` (so `2` is even — correct); `(not true)` is `false` (so `3` is not even — correct).

`even-number?` shares the *identical* structural shape `sum-to` and `factorial` had — check the base case, return its literal directly; otherwise, combine the current step with a recursive call on `(- n 1)` — even though its result type (a boolean) and its combining operation (`not`, rather than `+` or `*`) are both completely different. The shape wasn't chosen freely each time; it was determined by all three functions recursing structurally on the same underlying natural-number definition.

### Discard the throwaway example

Not applicable — `even-number?` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct structural translation of the recursive definition stated above.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn even-number? [n]
  (if (= n 0)
    true
    (not (even-number? (- n 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (= n 0) true ...)`** — reappearing shape (Lesson 20); the base case's literal is `true` this time, dictated by the recursive definition's own base case, not by any pattern in `sum-to` or `factorial`.
- **`(not (even-number? (- n 1)))`** — reappearing recursive-call structure, with `not` as the combining step instead of `+` or `*` — a boolean connective (Lesson 7) combined with a recursive call the exact same way an arithmetic operator was in the previous lesson.

### CS Lens

Three functions — `sum-to`, `factorial`, `even-number?` — computing entirely different kinds of things (a sum, a product, a boolean), sharing one shape because they all structurally recurse on the identical underlying data definition, is early, direct evidence for Lesson 27's `reduce`: once a shape recurs this reliably across genuinely different operations, it becomes worth abstracting into one reusable tool rather than rewriting by hand every time.

### SE Lens

This is a real, practical benefit, not just tidy theory: once a recursive definition is settled (natural numbers, in this case), writing a *new* structurally recursive function against it is almost mechanical — decide the base case's literal answer and the combining operation, and the rest of the shape is already known to be correct, inherited from the data definition's own well-foundedness rather than needing to be independently verified each time.

### Connection to the previous unit

The previous unit claimed the shape was "almost forced"; this unit tested that claim against a function computing something entirely different from either of the previous lesson's two examples, and found the identical shape held anyway — real evidence for the claim, not just an assertion.

---

## Concept Unit: When Recursion Isn't Structural

### The Problem

Is every valid recursive function structurally recursive, or can a function recurse correctly using a "smaller instance" the data's own recursive definition never mentioned?

### Introduce the concept in isolation

Define a function that sums `n`, then `n - 2`, then `n - 4`, and so on, until reaching zero or below:

```clojure
(defn sum-by-twos [n]
  (if (<= n 0)
    0
    (+ n (sum-by-twos (- n 2)))))
```

```
user=> (sum-by-twos 4)
6
user=> (sum-by-twos 5)
9
```

Trace `(sum-by-twos 5)`: `5 + (sum-by-twos 3)`, `3 + (sum-by-twos 1)`, `1 + (sum-by-twos -1)`, and `(sum-by-twos -1)` hits the base case directly (`-1 ≤ 0`), returning `0` — total: `5 + 3 + 1 + 0 = 9`.

This function's recursive call is on `(- n 2)`, not `(- n 1)` — a different "smaller instance" than the natural numbers' own recursive case (successor, one step at a time) specifies. `sum-by-twos` is a valid, correctly terminating recursive function — but it is **not** structurally recursive on the natural numbers' standard definition, because its recursive call doesn't match that definition's own recursive case.

Notice the consequence this forced: the base case had to become `(<= n 0)` rather than `(= n 0)`. Stepping by `2` from an odd starting number (like `5`) never lands exactly on `0` — it reaches `1`, then `-1`, skipping past `0` entirely. A base case written to match the *standard* definition exactly (`(= n 0)`) would never trigger for an odd starting number, and the recursion would continue forever, past zero, into negative numbers indefinitely. Departing from structural recursion didn't just change the recursive call — it required rethinking the base case too, precisely because the "smaller instance" being used no longer guarantees landing on the data definition's own official base case.

### Discard the throwaway example

Not applicable — `sum-by-twos` demonstrates a real, if narrower, pattern.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn sum-by-twos [n]
  (if (<= n 0)
    0
    (+ n (sum-by-twos (- n 2)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(<= n 0)`** — a reappearing comparison (Lesson 7), but a genuinely different condition than `sum-to`'s `(= n 0)`: "less than or equal to zero" rather than "equal to zero exactly," a change forced by stepping in twos instead of ones, as explained above.
- **`(- n 2)`** — reappearing subtraction, with `2` in place of `1` — the specific departure from structural recursion this unit is about: the natural numbers' recursive case never mentioned "two less," only "one less."

### CS Lens

Non-structural recursion isn't a mistake — it's simply recursion following a *different* notion of "smaller" than the one a specific, standard data definition provides, and it's genuinely common: many efficient algorithms (Lesson 112, *Divide and Conquer*, most of all) deliberately recurse on a smaller instance that isn't "one less," precisely because skipping ahead faster is often the entire point.

### SE Lens

The real cost of non-structural recursion is that its termination can no longer be inherited for free from the data definition's own well-foundedness — it needs its own, separate argument, the way `sum-by-twos` needed a rethought base case just to actually reach zero reliably. Lesson 22, immediately next, names exactly what that separate argument has to establish for *any* recursive function, structural or not: a measurable quantity that strictly decreases with every recursive call, guaranteeing the base case is eventually reached.

### Connection to the previous unit

The previous unit showed three different structurally recursive functions sharing one shape, inherited for free from the data definition; this unit shows a function that steps outside that shape deliberately, and the price it pays — a base case that has to be independently re-justified, rather than inherited automatically.

---

## Connect the Pieces

All four functions from this lesson and the previous one, classified together:

| Function | Recursive call on | Structurally recursive on natural numbers? |
|---|---|---|
| `sum-to` | `(- n 1)` | Yes |
| `factorial` | `(- n 1)` | Yes |
| `even-number?` | `(- n 1)` | Yes |
| `sum-by-twos` | `(- n 2)` | No |

The first three share their shape because they all recurse on exactly the natural numbers' own successor-based recursive case; `sum-by-twos` breaks that pattern by design, and — as a direct, visible consequence — needed a different base case condition (`<=` instead of `=`) to actually terminate correctly, exactly the kind of extra care non-structural recursion requires that structural recursion gets for free.

## What Breaks Without This

Suppose `sum-by-twos` had kept the *structural* base case, `(= n 0)`, instead of correctly adapting it to `(<= n 0)`:

```clojure
(defn broken-sum-by-twos [n]
  (if (= n 0)
    0
    (+ n (broken-sum-by-twos (- n 2)))))
```

Calling `(broken-sum-by-twos 5)` steps through `5, 3, 1, -1, -3, -5, ...` — decreasing by `2` every time, but `(= n 0)` is never true for any of these odd numbers; `0` is simply skipped over. The recursion never reaches its base case and never stops, exactly the runaway failure Lesson 20's "What Breaks Without This" demonstrated for a completely different reason (a recursive call that didn't shrink its input at all). Here, the input *does* shrink, every single call — but shrinking alone isn't enough; it has to actually *reach* the specific condition the base case checks for, which is exactly what changing the recursive step without reconsidering the base case silently broke.

## Exercises

1. **Trace.** By hand, trace `(even-number? 5)`, the way this lesson traced `(even-number? 3)`, confirming it correctly reports `false`.
2. **Predict.** Before running it, predict whether `sum-by-twos`, called on a negative starting number like `-3`, terminates correctly. Trace it to check.
3. **Classify.** Write a recursive function that sums `n, n-3, n-6, ...` down to zero or below. Is it structurally recursive on the standard natural-number definition? What base case condition does it need, and why?
4. **Break it, on purpose.** Take Exercise 3's function and give it the "wrong" base case (`(= n 0)`, matching the standard structural definition instead of the one your function's actual step size needs). Find a starting value where it fails to terminate correctly, the way "What Breaks Without This" did for `sum-by-twos`.
5. **Generalize.** Is `factorial`, as written in the previous lesson, structurally recursive? Justify your answer using this lesson's formal definition, not just intuition.
6. **Reconstruct.** Close this lesson. From memory, explain why `sum-to`, `factorial`, and `even-number?` all share the same shape, and explain precisely what `sum-by-twos` gave up by not following that shape.

## Definition of Done

- [ ] You can define structural recursion precisely, from memory, using the phrase "smaller instance" correctly.
- [ ] You can classify a given recursive function as structurally recursive or not, and justify the classification.
- [ ] You completed Exercise 3 and correctly identified the base case condition your function's step size actually requires.
- [ ] You can explain why non-structural recursion needs a separate termination argument that structural recursion gets for free.
- [ ] Commit your Exercise 3 function to your notes repository, with a commit message stating its base case condition and why it differs from the standard `(= n 0)` — for example, `"Add sum-by-threes — base case is (<= n 0), not (= n 0), since stepping by 3 can skip past zero for some starting values"` — not just `"lesson 21 exercise"`.

---

**Next lesson:** Lesson 22, *Base Cases and Progress*, formalizes exactly what this lesson's `sum-by-twos` example brushed against directly — the precise condition every recursive function, structural or not, needs to satisfy to be guaranteed to terminate at all.
