# Lesson 35: Tail Recursion

**What you will build**: By the end of this lesson you'll know precisely what a tail call is, why it makes constant-space execution possible in principle, and — a genuinely important, Clojure-specific fact — that Clojure does not grant this guarantee automatically the way Scheme does. You'll use `recur`, Clojure's explicit, compiler-checked mechanism for real tail-call execution, and see exactly what happens when it's used correctly, used incorrectly, and left out entirely.

**What you need to know first**: The previous lesson's accumulator transformation and its "nothing pending at the base case" observation — this lesson names that property precisely and shows what it actually buys.

**A note for readers who know Scheme**: if the Clojure this series has been writing has felt familiar, that's deliberate — both are Lisps, and this lesson is exactly where one real difference between them matters. Scheme's own standard *guarantees* that every tail call, to any function, runs in constant space, with no special syntax required. Clojure, running on the JVM, makes no such automatic guarantee for an ordinary self-call — this lesson's `recur` is Clojure's explicit, opt-in answer to the same problem, and Concept Unit 3 shows exactly what happens without it.

**Terms introduced in this lesson**:

- **tail call** — a call that is the last thing a function does, with no pending work remaining once it returns. *Why it matters*: exactly the property Lesson 34's accumulator transformation produced without yet naming it — the precise, checkable condition that makes constant-space execution possible at all.
- **tail call optimization** (or **tail call elimination**) — reusing the current call's own stack space for a tail call instead of allocating a new one, since nothing about the current call needs to remain once the tail call is made. *Why it matters*: the actual mechanism that turns "nothing pending" from a theoretical nicety into a real, measurable difference in how much memory a recursive process uses.

**Objects and methods used**:

- **`recur`**
  - *What it is:* a special form in Clojure that performs a tail call to the current function (or the nearest enclosing `loop`), reusing the current stack frame instead of creating a new one.
  - *Implementation:* `(recur arg1 arg2 ...)` — rebinds the function's parameters to the given arguments and jumps back to the start of the function's body, without growing the call stack. Must appear in tail position — the compiler checks this and refuses to compile a `recur` that isn't the very last thing evaluated.
  - *Its use:* Concept Unit 2, replacing an ordinary self-call once a function's shape already guarantees nothing is pending afterward.

---

## Concept Unit: What Makes a Call a "Tail Call"

### The Problem

The previous lesson traced `list-sum-acc`'s calls and found none of them held any pending work at the base case, unlike `list-sum`'s. Is there a precise way to identify, just by looking at a function's code, whether a specific call inside it has this property?

### Introduce the concept in isolation

Compare the two recursive calls directly:

```clojure
(defn list-sum [lst]
  (if (empty? lst)
    0
    (+ (first lst) (list-sum (rest lst)))))   ; NOT a tail call

(defn list-sum-acc [lst acc]
  (if (empty? lst)
    acc
    (list-sum-acc (rest lst) (+ acc (first lst)))))   ; IS a tail call
```

In `list-sum`, the recursive call `(list-sum (rest lst))` is *not* the last thing that happens — its result still needs to be added to `(first lst)` afterward, by the surrounding `+`. In `list-sum-acc`, the recursive call `(list-sum-acc (rest lst) (+ acc (first lst)))` genuinely *is* the last thing that happens — whatever it returns is returned directly, with nothing further to compute. This is a **tail call**: a call in the very last position of a function's execution, with nothing left to do once it returns.

### Discard the throwaway example

Not applicable — both functions are already established; this unit gives their difference a precise name.

### Formal Definition, Walked Through

> A call is in **tail position** if it is the last operation performed before a function returns — its result becomes the function's own result directly, without any further computation applied to it.

- *"without any further computation applied to it"* — this is the exact test: `(+ (first lst) (list-sum (rest lst)))`'s outermost operation is `+`, not the recursive call — the call's result gets combined with something else before the function actually returns, so it isn't in tail position, no matter how "close to the end" it visually appears.

### CS Lens

This is precisely why Lesson 34's accumulator transformation matters beyond just "avoiding pending work" in the abstract — it's the specific, general technique for converting a non-tail call into a tail call, by moving the combining step to happen *before* the recursive call instead of after it.

### SE Lens

Identifying whether a call is in tail position is a mechanical check, not a judgment call: look at what wraps the recursive call. If nothing does — if the call's own result is what the surrounding `if` branch (or the function itself) directly returns — it's a tail call. If anything at all (an arithmetic operator, a `cons`, another function call) wraps it, it isn't.

---

## Concept Unit: `recur` — Making the Constant-Space Guarantee Explicit

### The Problem

`list-sum-acc`'s recursive call is already in tail position. Does Clojure automatically notice this and run it in constant space, the way Scheme's standard guarantees for any Scheme program?

### Introduce the concept in isolation

It does not — not for an ordinary self-call written by name. Clojure runs on the Java Virtual Machine, and the JVM itself provides no general guarantee of proper tail calls; an ordinary recursive call, even one sitting in perfect tail position, still allocates a new stack frame in real Clojure, the same as any other call. Clojure's actual answer is a dedicated special form:

```clojure
(defn list-sum-acc [lst acc]
  (if (empty? lst)
    acc
    (recur (rest lst) (+ acc (first lst)))))
```

```
user=> (list-sum-acc (list 1 2 3) 0)
6
```

Same result as before — `recur` computes the identical thing an ordinary self-call to `list-sum-acc` would, but instead of pushing a new stack frame for the next call, it reuses the current one: the function's parameters (`lst` and `acc`) are simply rebound to the new values, and execution jumps back to the top of the function body, without the call stack growing at all. This is only possible, and only permitted, in exact tail position — the same position Concept Unit 1 just defined precisely.

### Discard the throwaway example

Not applicable — this is the corrected, real-world-appropriate version of `list-sum-acc`, worth keeping.

### Project Change

- **Reference Source**: `list-sum-acc`, from Lesson 34, serves as the direct function this unit modifies.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn list-sum-acc [lst acc]
  (if (empty? lst)
    acc
    (recur (rest lst) (+ acc (first lst)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`recur`** — first appearance (covered fully in Objects and methods used, above): a tail call to the current function, guaranteed by the compiler to run in constant stack space.
- **`(rest lst)`, `(+ acc (first lst))`** — reappearing expressions (Lessons 24, 34), unchanged in meaning — `recur`'s arguments are computed exactly the way an ordinary call's arguments would be; only what happens *after* they're computed (reuse the frame instead of allocating a new one) is different.

### CS Lens

Requiring an explicit marker for a guaranteed tail call — rather than having the compiler silently detect and optimize any qualifying call, the way some other languages attempt — is a deliberate design choice: it means a Clojure programmer can always tell, just by reading the code, exactly which calls are guaranteed constant-space and which aren't, rather than needing to reason about a compiler's own internal, possibly version-dependent optimization decisions.

### SE Lens

This is the direct, real-world answer to Lesson 34's closing question: `list-sum-acc`, written with `recur`, processes a list of any length using the same small, fixed amount of stack space throughout — not growing with the list's length the way `list-sum`'s ordinary recursive calls do. For a function meant to run on genuinely large input, this isn't a minor tidiness improvement; it's the difference between a function that scales and one that eventually crashes, which the next unit demonstrates directly.

### Connection to the previous unit

The previous unit identified, precisely, which calls qualify as tail calls; this unit is Clojure's real mechanism for actually claiming the constant-space benefit such a call makes possible — a benefit that, in Clojure specifically, has to be requested explicitly, not assumed.

---

## Concept Unit: What Breaks Without `recur` — and What Breaks If You Use It Wrong

### The Problem

Two different mistakes are possible here: writing an ordinary self-call where `recur` belongs, and writing `recur` somewhere that isn't actually tail position. What does each one actually do?

### Introduce the concept in isolation

**Mistake one: an ordinary self-call, in tail position, without `recur`.** `list-sum-acc`, written the way Lesson 34 originally left it (calling itself by name instead of using `recur`), is *not* wrong — it computes the correct answer for any list short enough to fit comfortably within the JVM's default stack space. But it does not get the constant-space guarantee: each call genuinely does allocate a new stack frame, exactly like `list-sum`'s non-tail calls do, even though nothing is pending. Given a sufficiently long list — millions of elements, well beyond what this series' examples have used — this ordinary version will eventually exhaust the available stack space and fail with a `StackOverflowError`, while the `recur` version, run on the identical input, keeps using the same small amount of stack space throughout and completes normally. (This is well-established, standard behavior for any JVM-hosted Clojure or Babashka program — worth confirming for yourself by trying both versions on a very long generated list, rather than taking it purely on this lesson's word.)

**Mistake two: `recur` used somewhere that isn't tail position.** Suppose `recur` were used inside `list-sum`'s *original*, non-accumulator shape:

```clojure
(defn broken-recur-attempt [lst]
  (if (empty? lst)
    0
    (+ (first lst) (recur (rest lst)))))
```

This does not compile. `recur` here sits inside `+`'s argument list — not in tail position, since `+` still needs to combine its result with `(first lst)` afterward — and Clojure's compiler rejects it outright, with an error naming the exact problem (`recur` outside of tail position), rather than silently compiling something that would behave incorrectly. This is a deliberate, real safety property: Clojure would rather refuse to compile a misplaced `recur` than let a programmer believe they have a constant-space guarantee they don't actually have.

### Discard the throwaway example

Not applicable — both mistakes are real, instructive, and worth understanding precisely, not just avoiding.

### CS Lens

Rejecting a misplaced `recur` at compile time, rather than at runtime or not at all, is exactly the same philosophy Lesson 4's arity checking already established for this series: catch a specific, checkable mistake as early and as precisely as possible, rather than letting it surface later as a subtler, harder-to-diagnose failure.

### SE Lens

The two mistakes have very different costs: forgetting `recur` (mistake one) compiles and runs correctly on any input small enough not to trigger the problem — a real, latent risk that can sit undetected in code for a long time, only surfacing once someone eventually runs it on unusually large input. Misusing `recur` in the wrong position (mistake two) is caught immediately, every time, before the code ever runs at all — a far cheaper failure to discover, precisely because the compiler refuses to let it through silently.

### Connection to the previous unit

The previous unit showed `recur` used correctly; this unit shows both of its failure modes directly — one silent and input-size-dependent, one loud and immediate — making clear that `recur`'s benefit is real but has to be earned by placing it exactly right, not merely intended.

---

## Connect the Pieces

Both accumulator-based functions from this section, converted to use `recur`, confirming they still compute the same answers:

```clojure
(defn list-sum-acc [lst acc]
  (if (empty? lst)
    acc
    (recur (rest lst) (+ acc (first lst)))))

(defn reverse-acc [lst acc]
  (if (empty? lst)
    acc
    (recur (rest lst) (cons (first lst) acc))))

(println "list-sum-acc:" (list-sum-acc (list 1 2 3 4 5) 0))
(println "reverse-acc:" (reverse-acc (list 1 2 3 4 5) (list)))
```

```
list-sum-acc: 15
reverse-acc: (5 4 3 2 1)
```

Both functions already had their combining work moved before the recursive call, per Lesson 34's transformation — converting each ordinary self-call into a `recur` was a small, mechanical, final step, not a redesign. Both now carry Clojure's real, compiler-checked, constant-stack-space guarantee — something neither `list-sum` nor a non-accumulator `my-reduce` (Lesson 27) could ever have, no matter how they were rewritten, since their combining step fundamentally requires holding pending work until the recursive call returns.

## What Breaks Without This

Suppose a function needed to process a very long list — say, every transaction from a full year of daily activity, tens of thousands of entries — using `list-sum`'s original, non-accumulator shape. Every one of those tens of thousands of calls holds a pending addition, all the way down to the base case, before any of them can resolve — a call stack tens of thousands of frames deep. Depending on the JVM's configured stack size, this may complete successfully, or it may fail with a `StackOverflowError` partway through — and critically, *which* of those two outcomes occurs depends on the size of the input, something that could easily test successfully during development (on a small sample) and then fail in production (on the real, full dataset) without any code change at all. `list-sum-acc`, written with `recur`, has no such threshold — the same small stack usage applies whether the list has ten elements or ten million.

## Exercises

1. **Trace.** Identify, for each of `sum-to` (Lesson 20), `factorial` (Lesson 20), and `my-length` (Lesson 24), whether the recursive call is in tail position. Justify each answer by naming what (if anything) wraps the call.
2. **Predict.** Before converting it, predict whether `find-subset-sum` (Lesson 33) has any tail calls, given that its recursive case makes *two* recursive calls combined with `my-append`. Justify your prediction.
3. **Convert.** Apply Lesson 34's accumulator transformation to `factorial`, and then convert the result to use `recur`. Verify it against the original `factorial` on at least two inputs.
4. **Break it, on purpose.** Write a function using `recur` in a position that isn't tail position (your choice of shape), attempt to run it, and read the actual compiler error. Confirm it names the problem precisely.
5. **Generalize.** `tree-sum` (Lesson 30) makes two recursive calls, combined with `+`. Can *both* of `tree-sum`'s recursive calls be tail calls at once? If not, which one (if either) could be, and what would need to change about the function's shape to make it so?
6. **Reconstruct.** Close this lesson. From memory, explain why Clojure requires `recur` explicitly instead of automatically detecting tail calls the way Scheme does, and state precisely what happens if a tail-position self-call is left as an ordinary call on very large input.

## Definition of Done

- [ ] You can identify whether a given recursive call is in tail position, justifying your answer by naming what wraps it (if anything).
- [ ] You completed Exercise 3 (`factorial` converted to use `recur`) and verified it matches the original.
- [ ] You've seen a real compiler error from misusing `recur` outside tail position (Exercise 4).
- [ ] You can explain, from memory, the specific difference between Clojure's `recur` and Scheme's automatic tail-call guarantee.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating your finding about `tree-sum`'s two recursive calls — for example, `"Convert factorial to recur; tree-sum can't have both calls in tail position simultaneously — only the last call before return ever qualifies"` — not just `"lesson 35 exercise"`.

---

**Next lesson:** Lesson 36, *Mutual Recursion*, introduces two functions that call each other rather than themselves — a genuinely different recursive shape, and one `recur` alone cannot handle, since it only ever calls back into the *same* function.
