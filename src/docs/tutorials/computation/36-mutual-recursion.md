# Lesson 36: Mutual Recursion

**What you will build**: By the end of this lesson you'll be able to write two functions that call *each other* rather than themselves — a genuinely different recursive shape from everything else in this section — and solve the chicken-and-egg problem this creates (each function needs the other to already exist) using Clojure's forward declaration. You'll also confirm directly why `recur`, from the previous lesson, cannot help here.

**What you need to know first**: The previous lesson's `recur` and tail-call vocabulary, and Lesson 3's "Unable to resolve symbol" error — this lesson's forward-declaration problem produces exactly that error if left unaddressed.

**Terms introduced in this lesson**:

- **mutual recursion** — two or more functions that call each other, directly or indirectly, rather than a single function calling only itself. *Why it matters*: a genuinely different recursive shape from every function this section has written so far — no single function's own base case and recursive case tell the whole story; the two definitions only make sense taken together.
- **forward declaration** — announcing a name's existence before it's actually given a value, so that other code, defined earlier, can reference it without error. *Why it matters*: mutual recursion's chicken-and-egg problem (each function needs the other to already exist, at the point it's being defined) requires exactly this — a way to promise "this name will be filled in soon" before it actually is.

**Objects and methods used**:

- **`declare`**
  - *What it is:* a macro in Clojure that creates a forward declaration — a named var with no value yet, allowing other code to reference the name before it's actually defined.
  - *Implementation:* `(declare name)` — creates a var named `name`, unbound until a later `def` or `defn` gives it a real value.
  - *Its use:* Concept Unit 2, to let two mutually recursive functions reference each other regardless of which one is written first.

---

## Concept Unit: Two Functions, Defined in Terms of Each Other

### The Problem

Every recursive function in this section so far calls *itself*. Consider a different, equally natural pair of definitions: a number is even if it's `0`, or if the number one less than it is odd; a number is odd if the number one less than it is even (`0` itself is not odd). Neither definition, alone, is self-recursive — each one is defined in terms of the *other*.

### Introduce the concept in isolation

State both definitions precisely, the way every recursive definition in this series has been stated:

- **`is-even?`:** `0` is even; for `n > 0`, `n` is even exactly when `n - 1` is odd.
- **`is-odd?`:** `0` is not odd; for `n > 0`, `n` is odd exactly when `n - 1` is even.

Trace `is-even?(4)` by hand, alternating between the two definitions: is `4` even? Exactly when `3` is odd. Is `3` odd? Exactly when `2` is even. Is `2` even? Exactly when `1` is odd. Is `1` odd? Exactly when `0` is even — and `0` is even, directly, by the base case. Unwinding: `1` is odd (since `0` is even); `2` is even (since `1` is odd); `3` is odd (since `2` is even); `4` is even (since `3` is odd) — correctly confirming `4` is even, by alternating between two definitions at every single step, never using one definition's own base case or recursive case twice in a row.

### Discard the throwaway example

Not applicable — this trace directly motivates the code the next unit writes.

### Generalizing

This is **mutual recursion**: two definitions, each incomplete on its own, that together fully specify both. Neither `is-even?` nor `is-odd?` could be understood or trusted in isolation — the trace above only made sense because both definitions were available at every step.

### CS Lens

Mutual recursion is the natural shape for problems that genuinely alternate between two (or more) distinct states or roles — Lesson 254's *finite automata*, much later, are built entirely from states that transition into each other, frequently forming cycles of mutual reference exactly like `is-even?` and `is-odd?`'s. Also recognized in: a game's turn-based structure (each player's turn is naturally defined in terms of "after the other player's turn"), and a conversation protocol where a valid "question" is defined partly in terms of a valid "answer," and vice versa.

### SE Lens

Splitting `is-even?` and `is-odd?` into two separate, mutually referencing functions — rather than writing one function that tracks a number's parity by counting decrements internally — keeps each definition focused on exactly the one question it answers, at the cost of needing both to exist before either one can actually run, the specific problem the next unit solves.

---

## Concept Unit: The Forward-Reference Problem — `declare`

### The Problem

Translate both definitions into Clojure directly, defining `is-even?` first:

```clojure
(defn is-even? [n]
  (if (= n 0)
    true
    (is-odd? (- n 1))))
```

At the moment this form is evaluated, `is-odd?` doesn't exist yet — nothing has defined it. Does this cause a problem, and if so, when?

### Introduce the concept in isolation

Evaluating `is-even?`'s definition on its own, before `is-odd?` exists anywhere, produces exactly the error Lesson 3 first showed for any undefined name:

```
Unable to resolve symbol: is-odd? in this context
```

This is the same category of error as looking up an unbound name in Lesson 3 — `is-even?`'s body references `is-odd?`, and at the point Clojure processes this definition, no var named `is-odd?` exists at all yet. The fix is to announce `is-odd?`'s existence *before* `is-even?` is defined, without yet giving it a real definition:

```clojure
(declare is-odd?)

(defn is-even? [n]
  (if (= n 0)
    true
    (is-odd? (- n 1))))

(defn is-odd? [n]
  (if (= n 0)
    false
    (is-even? (- n 1))))
```

```
user=> (is-even? 4)
true
user=> (is-even? 7)
false
```

`(declare is-odd?)` creates a **forward declaration** — a real var named `is-odd?`, with no function attached yet, just enough for `is-even?`'s definition to compile successfully by referencing a name that's known to exist. By the time `is-even?` is actually *called*, `is-odd?` has already been fully defined by its own `defn`, several lines later — the forward declaration only needed to bridge the gap during *definition*, not during actual use.

### Discard the throwaway example

Not applicable — both functions, together with the `declare`, are a real, correct, reusable pair.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of the mutual definitions stated in the previous unit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(declare is-odd?)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`declare`** — first appearance (covered fully in Objects and methods used, above): creates a named var without a value, solving exactly the forward-reference problem this unit's isolated example demonstrated.
- **`(is-odd? (- n 1))`** — reappearing function-call shape (Lesson 4), the only new fact being that it calls a *different* function than the one currently being defined, rather than calling itself.

### CS Lens

Forward declaration is the same idea as a legal contract referencing a "Schedule B" that's attached later in the same document — the reference is valid because both parties know Schedule B will exist by the time the contract is actually used, even though it isn't physically present at the exact point it's mentioned. Also recognized in: a table of contents listing a chapter title before that chapter's actual pages appear, and mutually referencing forward and backward links in a linked data structure, resolved once every node has been created.

### SE Lens

Needing a forward declaration at all is a direct, visible consequence of Clojure processing definitions top to bottom, one at a time — a real, structural fact about how the language works, not an arbitrary inconvenience. Recognizing "Unable to resolve symbol" as potentially *this* specific problem (a not-yet-defined mutual reference), rather than assuming it's always a typo, is the practical skill this unit builds directly on top of Lesson 3's original error.

### Connection to the previous unit

The previous unit stated two definitions that reference each other, in the abstract; this unit is the exact, real problem that abstraction creates in actual code, and Clojure's specific, minimal fix for it.

---

## Concept Unit: Why `recur` Doesn't Help Here

### The Problem

The previous lesson's `recur` gave a tail-recursive function constant-space execution. Can `is-even?`'s call to `is-odd?` — a tail call, by Lesson 35's own definition, since nothing wraps it — use `recur` the same way?

### Introduce the concept in isolation

Attempt it:

```clojure
(defn is-even? [n]
  (if (= n 0)
    true
    (recur (- n 1))))    ; this would call is-even? again, not is-odd?!
```

This compiles and runs — but it doesn't do what `is-even?` and `is-odd?`'s mutual definition actually specifies. `recur` always calls back into the *current* function (or the nearest enclosing `loop`) — never a different one. Written this way, every call is really asking "is `n - 1` even," repeatedly, within `is-even?` alone, which happens to still compute a correct answer for evenness *only* because subtracting `1` twice is the same as subtracting `2` once — but it silently abandons the actual mutual structure, and provides no way to ask `is-odd?`'s own question using this shortcut at all.

`is-even?`'s real call to `is-odd?` is a genuine tail call — nothing wraps it — but it's a tail call to a *different* function, and `recur` is specifically restricted to same-function (or same-`loop`) tail calls. This isn't a limitation Clojure could easily lift: reusing a stack frame safely requires knowing the exact shape of the function being jumped back into, and `is-even?`'s frame and `is-odd?`'s frame aren't the same shape by coincidence — they're different functions.

### Discard the throwaway example

Not applicable — this demonstrates a real, structural limitation, not a mistake to fix.

### CS Lens

Mutually recursive tail calls *can* be given a constant-space guarantee, using a more general technique called a **trampoline** — each function returns a description of "what to call next" instead of actually calling it, and an outer loop repeatedly performs whatever's returned, never growing the stack, because no function ever directly calls another. This is a real, genuinely more advanced technique, deliberately out of scope for this lesson — the point here is recognizing precisely *why* `recur` alone can't solve this problem, not yet solving the deeper one.

### SE Lens

`is-even?` and `is-odd?`, as written with ordinary calls (not `recur`), do *not* have Lesson 35's constant-space guarantee — each call to the other genuinely does allocate a new stack frame, the same as any non-tail-optimized call, meaning a very large input could, in principle, exhaust the stack the same way Lesson 35's non-`recur` `list-sum-acc` could. For the modest inputs this lesson uses, this is a non-issue; recognizing that mutual recursion reintroduces the exact risk `recur` was solving is the honest, complete picture, not a detail to gloss over.

### Connection to the previous unit

The previous unit solved mutual recursion's *definitional* problem (forward declaration); this unit shows precisely which problem it does *not* solve — the constant-space guarantee `recur` provided for self-recursion doesn't carry over automatically to recursion between two different functions.

---

## Connect the Pieces

`is-even?` and `is-odd?`, checked against numbers with a known, obvious answer, confirming the mutual definition works correctly in both directions:

```clojure
(println "is-even? 0:" (is-even? 0))
(println "is-odd? 0:" (is-odd? 0))
(println "is-even? 7:" (is-even? 7))
(println "is-odd? 7:" (is-odd? 7))
(println "Exactly one of each pair should be true:" (not (= (is-even? 7) (is-odd? 7))))
```

```
is-even? 0: true
is-odd? 0: false
is-even? 7: false
is-odd? 7: true
Exactly one of each pair should be true: true
```

Every result matches direct arithmetic knowledge (`0` is even, not odd; `7` is odd, not even) — and the final check confirms a real property of the mutual definition itself: for any natural number, `is-even?` and `is-odd?` should never agree, since a number is exactly one or the other, never both, never neither — a small, direct application of Lesson 7's boolean vocabulary to verify the pair of functions is behaving consistently with each other, not just individually correct.

## What Breaks Without This

Suppose `declare` were left out, and `is-odd?` happened to be defined *before* `is-even?` instead of after — avoiding the forward-reference problem for this one specific ordering, purely by luck:

```clojure
(defn is-odd? [n]
  (if (= n 0)
    false
    (is-even? (- n 1))))   ; is-even? doesn't exist yet either!

(defn is-even? [n]
  (if (= n 0)
    true
    (is-odd? (- n 1))))
```

This still fails — reordering the two definitions doesn't actually solve anything, it just moves the identical problem to the other function: now `is-odd?`'s own definition references `is-even?`, which doesn't exist yet at *that* point. With exactly two mutually recursive functions, there is no ordering that avoids the problem — whichever one is written first will always reference the other before it exists. `declare` isn't a workaround for a specific unlucky ordering; it's the only real fix, because the underlying problem (two functions that each need the other to already exist) has no ordering-based solution at all.

## Exercises

1. **Trace.** By hand, trace `is-odd?(5)`, alternating between the `is-even?` and `is-odd?` definitions the way this lesson traced `is-even?(4)`.
2. **Predict.** Before running it, predict `(is-even? 0)` and `(is-odd? 0)` using the base cases stated in Concept Unit 1 directly (not by tracing recursive calls). Verify.
3. **Diagnose.** Remove the `(declare is-odd?)` line from this lesson's code, leaving the two `defn`s in their original order, and confirm you get the exact "Unable to resolve symbol" error this lesson described.
4. **Break it, on purpose.** Reorder `is-even?` and `is-odd?`'s definitions (odd first, even second) without adding any `declare` at all, and confirm — the way "What Breaks Without This" argued — that the problem doesn't go away, just moves.
5. **Generalize.** Write a mutually recursive pair, `count-down-and-greet` and `count-down-and-farewell`, that alternate printing "Hello from N" and "Goodbye from N" while counting down from a given number to `0` (your choice of exact behavior — the point is practicing the forward-declaration pattern on a pair you design yourself).
6. **Reconstruct.** Close this lesson. From memory, explain why `declare` is needed regardless of which of two mutually recursive functions is written first, and explain precisely why `recur` cannot be used for a call from one function to a different one.

## Definition of Done

- [ ] You can write a pair of mutually recursive functions, correctly using `declare` to solve the forward-reference problem.
- [ ] You completed Exercise 3 and have seen the real "Unable to resolve symbol" error `declare`'s absence produces.
- [ ] You completed Exercise 4 and can explain why reordering the two definitions doesn't avoid the problem.
- [ ] You can explain, from memory, why `recur` cannot be used for a tail call from one function into a different function.
- [ ] Commit your Exercise 5 mutually recursive pair to your notes repository, with a commit message noting which function you declared forward and why — for example, `"Add count-down-and-greet/farewell — declared count-down-and-farewell first since count-down-and-greet references it before it's defined"` — not just `"lesson 36 exercise"`.

---

**Next lesson:** Lesson 37, *Recursion vs Iteration*, steps back from recursion specifically and asks a question this section has assumed the answer to throughout: could every one of these functions have been written as an ordinary loop instead — and if so, what's actually gained or lost by choosing recursion over iteration, or the reverse?
