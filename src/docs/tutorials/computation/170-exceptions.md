# Lesson 170: Exceptions

**What you will build**: By the end of this lesson you'll build `safe-div`, a division that takes *two* continuations — one for success, one for failure — and prove that a failing second division inside a nested computation jumps straight to the failure continuation, completely skipping `double-it`, the success continuation the *first* division's own result was headed toward. `"divide by zero"` comes back directly; `double-it` never runs at all.

**What you need to know first**: Lesson 169's continuation and continuation-passing style; Lesson 159's `/`, revisited here as the operation that can genuinely fail.

**Terms introduced in this lesson**:

- **non-local control flow** — a jump that skips directly from deep inside a computation to a distant point, bypassing every intermediate step that would ordinarily run on the way. *Why it matters*: an ordinary function call always returns one level up, to its immediate caller; non-local control flow, the mechanism behind a real exception, can skip past several levels at once.
- **error continuation** — a second continuation, called instead of the normal one specifically when something has gone wrong. *Why it matters*: Lesson 169's own continuations always represented "what happens on success"; giving failure its own separate continuation is what lets failure skip the normal path entirely, rather than being forced to detour through it.

**Objects and methods used**: None new. This lesson reuses `/` (Lesson 159) and `=` (Lesson 6), each already covered.

---

## Concept Unit: Two Continuations — One for Success, One for Failure

### The Problem

Lesson 159 already showed `/` genuinely throws on division by zero. Can that failure be handled with a continuation of its own — a distinct "what happens if this fails" path, separate from the normal "what happens next" continuation?

### Introduce the concept in isolation

```clojure
(defn safe-div [a b k error-k]
  (if (= b 0)
    (error-k "divide by zero")
    (k (/ a b))))
```

```
user=> (defn double-it [x] (* x 2))
user=> (defn error-handler [msg] msg)
user=> (safe-div 10 2 double-it error-handler)
10
user=> (safe-div 10 0 double-it error-handler)
"divide by zero"
```

`safe-div` takes two continuations: `k`, called with the real quotient when division succeeds, and `error-k`, called with a message instead, when it doesn't. `(safe-div 10 2 double-it error-handler)` succeeds — `k` runs, `double-it` doubles `5` to `10`. `(safe-div 10 0 double-it error-handler)` fails — `error-k` runs instead, and `double-it` never executes at all; the real division that would have crashed never happens either.

### Discard the throwaway example

Not applicable — `safe-div` is real, reusable, and verified on both a succeeding and a failing call.

### Project Change

- **Reference Source**: Lesson 169's own continuation-passing style, extended here with a second, error-specific continuation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn safe-div [a b k error-k]
  (if (= b 0)
    (error-k "divide by zero")
    (k (/ a b))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= b 0)`** — reappearing `=` (Lesson 6): checked *before* attempting the real division, so the failure path never actually triggers Lesson 159's own crash.
- **`(error-k "divide by zero")`** — first appearance of this specific idea: an **error continuation**, called instead of `k`, carrying a message instead of a real quotient.
- **`(k (/ a b))`** — reappearing continuation-call shape (Lesson 169): the success path, unchanged from an ordinary continuation call.

### CS Lens

Two continuations instead of one is the exact mechanism behind a `try`/`catch` block in a real language: the "try" body's normal continuation is whatever code follows it; the "catch" block *is* the error continuation, invoked instead, whenever something inside the try body fails.

### SE Lens

Separating success and failure into two distinct continuations, rather than one continuation that has to check "did this actually work" every time it's called, means the failure-handling logic lives in exactly one place — `error-handler` — instead of being duplicated inside every possible success continuation that might ever receive a failure marker by mistake.

---

## Concept Unit: Failure Skips the Intermediate Success Path Entirely

### The Problem

If a *second*, nested division fails, does the failure correctly skip not just its own success continuation, but everything that first division's own success path was already committed to doing next?

### Introduce the concept in isolation

```clojure
(defn after-first-div [x] (safe-div x 0 double-it error-handler))
```

```
user=> (safe-div 10 2 double-it error-handler)
10
user=> (safe-div 10 2 after-first-div error-handler)
"divide by zero"
```

The first call is this lesson's own first unit, unchanged: `10 / 2`, then doubled, `10`. The second call replaces `double-it` with `after-first-div` as the *first* division's own continuation — meaning `10 / 2 = 5` succeeds, then `after-first-div` tries `5 / 0`, which fails. The result is `"divide by zero"` — not `10`, not any doubled value at all. `double-it` — still sitting right there inside `after-first-div`'s own definition, as the *second* division's intended success continuation — never runs. The failure inside the second division jumped straight to `error-handler`, skipping over `double-it` entirely, exactly the **non-local control flow** a real exception performs.

### Discard the throwaway example

Not applicable — real, verified proof that a nested failure bypasses an intermediate success step that was already committed to running next.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch nested chain built to demonstrate non-local control flow concretely.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn after-first-div [x] (safe-div x 0 double-it error-handler))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(safe-div x 0 double-it error-handler)`**, inside `after-first-div` — reappearing `safe-div` (this lesson's first unit): a second, nested division, always failing by construction (`0` as its own divisor), with `double-it` as *its* intended success continuation.
- **`(safe-div 10 2 after-first-div error-handler)`** — reappearing outer call: `after-first-div` itself is the *outer* division's continuation, meaning the failure that happens two levels deep still has only one `error-handler` to reach — no intermediate code gets a chance to run on the way there.

### CS Lens

This is precisely why an exception thrown deep inside nested function calls doesn't need every intermediate function to explicitly check and re-raise it — the error continuation is reached directly, the identical way `error-handler` was reached here, skipping every intermediate success path (`double-it` included) without any of those intermediate functions needing to know a failure was even possible.

### SE Lens

The real alternative to this — every function explicitly checking whether the previous step failed and manually forwarding that failure — is exactly the tedious, error-prone pattern real exception handling exists to eliminate; `after-first-div` never once checks "did this fail," because it doesn't have to — the error continuation mechanism handles that skip automatically, the same way `safe-div`'s own two-continuation shape already did for a single, non-nested call.

### Connection to the previous unit

The previous unit built one division with two continuations; this unit nests two, and proves the failure path skips cleanly past an intermediate success continuation that was fully written and ready to run — the real, concrete meaning of "non-local."

---

## Connect the Pieces

Success, and a nested failure that skips an intermediate step, side by side:

```clojure
(println "Success:" (safe-div 10 2 double-it error-handler))
(println "Nested failure, double-it skipped:" (safe-div 10 2 after-first-div error-handler))
```

```
Success: 10
Nested failure, double-it skipped: divide by zero
```

`double-it` is real, correct code, sitting right inside `after-first-div`'s own definition — and it simply never runs on the failure path, not because anything crashed, but because a different continuation was called instead.

## What Breaks Without This

Suppose `after-first-div` were written without a separate error continuation — using `safe-div`'s own success continuation for both paths, and manually checking whether the result "looks like" an error message before deciding whether to proceed. Every single caller, at every nesting depth, would need that identical check, and forgetting even one — passing a genuine error message into `double-it` by mistake — would silently attempt to double a string instead of a number, a real, wrong crash somewhere far downstream of the actual failure. Two separate continuations make that check structurally unnecessary: an error can *only* ever reach `error-handler`, never `double-it`, by construction, not by every caller remembering to verify it.

## Exercises

1. **Trace.** By hand, trace `(safe-div 10 2 after-first-div error-handler)` through both calls to `safe-div`, confirming exactly where the failure happens and which continuation receives it.
2. **Predict.** Before checking, predict `(safe-div 10 0 after-first-div error-handler)` — the *outer* division failing this time, instead of the inner one. Then verify `after-first-div` never runs at all.
3. **Verify.** Build a three-level nested chain (a third `safe-div` inside `after-first-div`), and confirm a failure at the deepest level still reaches `error-handler` directly, skipping two intermediate success steps, not just one.
4. **Break it, on purpose.** Modify `safe-div` to call `k` in both branches (ignoring `error-k` entirely, passing the string `"divide by zero"` to `double-it` on failure), and describe the real crash or wrong result this produces.
5. **Generalize.** Describe, without coding it, how a *single* shared `error-handler`, reused across many different `safe-div` calls throughout a larger program, is the toy version of a language's own single `catch` block handling exceptions from anywhere inside its `try` body.
6. **Reconstruct.** Close this lesson. From memory, explain why `double-it` never running is proof of non-local control flow, not just "the code took a different branch."

## Definition of Done

- [ ] You can build a function taking separate success and error continuations, and call it on both a succeeding and a failing input.
- [ ] You can nest two such functions and confirm a failure at the inner level skips the outer level's own intermediate success step.
- [ ] You can explain why this is real non-local control flow, not just an ordinary conditional branch.
- [ ] You completed Exercise 3 and confirmed a three-level chain still reaches the error handler directly from the deepest failure.
- [ ] You completed Exercise 4 and described the real failure from merging the two continuations into one.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you built and found — for example, `"Confirm 3-level nested failure skips two intermediate success steps; show merging k/error-k causes double-it to receive a string and crash"` — not just `"lesson 170 exercise"`.

---

**Next lesson:** Lesson 171, *Iterators and Generators*, connects this section's own continuation idea to a different real problem — suspending a computation partway through and resuming it later, rather than only ever running straight through to completion or failure.
