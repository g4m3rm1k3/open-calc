# Lesson 172: Coroutines

**What you will build**: By the end of this lesson you'll step Lesson 171's `next-fib` and a new `next-square` *alternately* — fib, square, fib, square — and prove each one's own sequence comes out exactly right despite never running twice in a row: `[[0 0] [1 1] [1 4] [2 9] [3 16]]`, fib's own `0, 1, 1, 2, 3` and square's own `0, 1, 4, 9, 16`, each correct on its own terms, interleaved.

**What you need to know first**: Lesson 171's generators and their value-plus-new-state shape.

**Terms introduced in this lesson**:

- **coroutine** — two or more independent computations that trade control back and forth, each resuming from exactly where it last paused, rather than one running to completion before the next begins. *Why it matters*: Lesson 171 built one resumable computation; a coroutine is what happens when *more than one* resumable computation exists at once, and something switches between them.

**Objects and methods used**: None new. This lesson reuses `get`/`assoc`/`count` (Lesson 84, Lesson 94), each already covered.

---

## Concept Unit: Two Independent Generators, Stepped in Turn

### The Problem

Lesson 171's `next-fib` produces one resumable sequence. Can a *second*, completely unrelated generator be stepped in between calls to the first, with neither one's own progress affected by the other running in the meantime?

### Introduce the concept in isolation

```clojure
(defn next-square [state]
  [(* state state) (+ state 1)])
```

```
user=> (next-fib [0 1])
[0 [1 1]]
user=> (next-square 0)
[0 1]
user=> (next-fib [1 1])
[1 [1 2]]
user=> (next-square 1)
[1 2]
```

`next-square` is a second, independent generator — its own state is just a plain number (the next base to square), nothing like `next-fib`'s own two-number pair. Calling `next-fib` once, then `next-square` once, then `next-fib` again, produces exactly the values each generator would have produced on its own — `0, 1` for fib; `0, 1` for square — because each call only ever touches its *own* state, never the other's.

### Discard the throwaway example

Not applicable — `next-square` is real, reusable, and verified alongside `next-fib` without either affecting the other.

### Project Change

- **Reference Source**: Lesson 171's own `next-fib`, reused unchanged, alongside a new, independently-built second generator.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn next-square [state]
  [(* state state) (+ state 1)])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(* state state)`, `(+ state 1)`** — reappearing `*`/`+` (Lesson 2): the current square, and the next base to square — a genuinely simpler state than `next-fib`'s own pair, since squaring only ever needs the single next base, not two running values.
- **`[value new-state]`** — reappearing generator shape (Lesson 171), confirming the shape itself doesn't depend on any detail of what a particular generator's state actually looks like.

### CS Lens

`next-fib`'s state (a pair of numbers) and `next-square`'s state (one number) look nothing alike, and neither generator has to know or care what the other's state contains — the identical `[value new-state]` interface is all either one needs to expose.

### SE Lens

Building `next-square` required zero changes to `next-fib` — the two coexist purely because neither one reaches into the other's own state at all, the same independence Lesson 139's abstraction already named for two unrelated ADT implementations.

---

## Concept Unit: A Driver That Interleaves Both

### The Problem

Can a single driver alternate between two generators — one call to each, back and forth — and produce a real, combined result proving both sequences stayed correct the whole time?

### Introduce the concept in isolation

```clojure
(declare interleave-square combine-step)

(defn interleave-fib [fib-state sq-state i n acc]
  (if (>= i n)
    acc
    (interleave-square (next-fib fib-state) sq-state i n acc)))

(defn interleave-square [fib-result sq-state i n acc]
  (combine-step fib-result (next-square sq-state) i n acc))

(defn combine-step [fib-result sq-result i n acc]
  (interleave-fib (get fib-result 1) (get sq-result 1) (+ i 1) n
    (assoc acc (count acc) [(get fib-result 0) (get sq-result 0)])))
```

```
user=> (interleave-fib [0 1] 0 0 5 [])
[[0 0] [1 1] [1 4] [2 9] [3 16]]
```

Every pair is correct on both sides: `[0 0]`, `[1 1]`, `[1 4]`, `[2 9]`, `[3 16]` — fib's own `0, 1, 1, 2, 3` and square's own `0, 1, 4, 9, 16`, exactly matching what each generator would produce running alone. `interleave-fib` steps `next-fib`, hands its result to `interleave-square`, which steps `next-square`, hands *both* results to `combine-step`, which records the pair and loops back to `interleave-fib` — control passing back and forth between the two generators, each one resuming from its own separately-threaded state every time.

### Discard the throwaway example

Not applicable — real, verified output confirming both interleaved sequences are individually correct.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch driver interleaving two independently-built generators.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn interleave-fib [fib-state sq-state i n acc]
  (if (>= i n)
    acc
    (interleave-square (next-fib fib-state) sq-state i n acc)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(interleave-square (next-fib fib-state) sq-state i n acc)`** — first appearance of this specific control-transfer shape: `next-fib` runs, then control passes to `interleave-square` — `sq-state`, untouched, threads straight through, exactly the way a paused coroutine's own state waits, unaffected, while control is elsewhere.
- **`(combine-step fib-result (next-square sq-state) i n acc)`** — `next-square` now runs, resuming from `sq-state` exactly where it was left — `fib-result`, already computed, threads through unchanged.
- **`(interleave-fib (get fib-result 1) (get sq-result 1) (+ i 1) n ...)`**, in `combine-step` — both generators' *new* states are threaded back into the next round — each one always resuming from its own most recent state, never the other's.

### CS Lens

This *is* a **coroutine**, built from nothing more than Lesson 171's own generator shape, twice, plus a driver alternating between them: no special language feature required — the pattern was already fully present in "value plus new state," the moment a second one exists alongside the first.

### SE Lens

Each generator's state stays completely private to itself — `interleave-fib` never inspects `sq-state`'s own contents, and `interleave-square` never inspects `fib-state`'s — the same abstraction-barrier discipline Lesson 139 named, here keeping two coroutines from accidentally interfering with each other simply because there's no shared mutable state for either one to reach into.

### Connection to the previous unit

The previous unit built two generators independently; this unit interleaves them, and proves — with real output — that alternating control between them never corrupts either one's own sequence.

---

## Connect the Pieces

Both generators, run alone and interleaved, agreeing exactly:

```clojure
(println "fib alone, first 3:" (get r1 0) (get r2 0) (get r3 0))
(println "interleaved, first 3 fib values:" (get (get (interleave-fib [0 1] 0 0 3 []) 0) 0) (get (get (interleave-fib [0 1] 0 0 3 []) 1) 0) (get (get (interleave-fib [0 1] 0 0 3 []) 2) 0))
```

```
fib alone, first 3: 0 1 1
interleaved, first 3 fib values: 0 1 1
```

Fib's own sequence comes out identically whether it runs alone or interleaved with an entirely different generator — proof that trading control back and forth changed nothing about either computation's own correctness.

## What Breaks Without This

Suppose the two generators' states had been merged into one shared piece of state instead — a single vector both `next-fib` and `next-square` read from and wrote to, rather than each keeping its own. Stepping one would risk corrupting data the other one needed, or the two would need constant, careful coordination just to avoid stepping on each other's own progress — real complexity this lesson's own design avoids entirely by keeping every coroutine's state completely private, threaded through independently, with the driver's own role limited to deciding *when* each one gets to run, never *what* either one's internal state means.

## Exercises

1. **Trace.** By hand, trace `(interleave-fib [0 1] 0 0 3 [])` through `interleave-fib`/`interleave-square`/`combine-step`, confirming both threaded states at each round.
2. **Predict.** Before checking, predict the sixth pair `(interleave-fib [0 1] 0 0 6 [])` would produce, continuing this lesson's own two sequences by hand. Then verify.
3. **Verify.** Confirm `next-square`, run alone for five steps (no interleaving at all), produces the identical five square values as the interleaved version's own second slot.
4. **Break it, on purpose.** Modify `combine-step` to accidentally thread `fib-result`'s new state into *both* `interleave-fib`'s next-round arguments (losing `sq-result`'s own state entirely), and describe the real, wrong sequence `next-square`'s own values now follow.
5. **Generalize.** Describe, without coding it, how a *third* independent generator could be added to this lesson's own interleaving driver, alongside fib and square.
6. **Reconstruct.** Close this lesson. From memory, explain why `next-fib` and `next-square` never interfering with each other is proof of real coroutine independence, not just a coincidence of this lesson's own small example.

## Definition of Done

- [ ] You can build a second, independent generator and step it alongside an existing one without either affecting the other.
- [ ] You can write a driver that interleaves two generators and produces a real, correctly-paired combined result.
- [ ] You can explain why each generator's state must stay private for coroutines to work correctly.
- [ ] You completed Exercise 3 and confirmed interleaved and standalone runs of the same generator agree.
- [ ] You completed Exercise 4 and described the real corruption from threading the wrong state through.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm standalone and interleaved next-square runs agree on all 5 values; show state-threading bug causes next-square to silently follow fib's sequence instead"` — not just `"lesson 172 exercise"`.

---

**Next lesson:** Lesson 173, *Type Systems*, leaves this section's own interpreter-building arc and returns to types — not as sets of values (Lesson 155), but as constraints checked *before* a program ever runs, catching a real class of errors this section's own interpreter has never once guarded against.
