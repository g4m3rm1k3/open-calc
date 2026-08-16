# Lesson 154: Monads as Computational Composition

**What you will build**: By the end of this lesson you'll chain two lookups that might each fail — "who is this person's manager," which might return `nil` if the person isn't found — and confront what naive chaining does to the code once a third or fourth step joins. Then you'll build `chain`, a single small function that automates "stop immediately if anything so far was `nil`, otherwise keep going," and show it produces the identical answer as the naive version while reading as one flat sequence instead of nested checks. That's the real, practical problem a **monad** solves — explained here before any formal definition.

**What you need to know first**: Lesson 7's `nil` and truthiness; Lesson 136's `nil?`; Lesson 153's functor and `map`, revisited here by contrast.

**Terms introduced in this lesson**:

- **monad** — a way of composing functions that might each fail (or otherwise not produce an ordinary value), so failure automatically short-circuits the rest of the chain without every step needing its own explicit check. *Why it matters*: a genuinely different composition tool than Lesson 153's functor — `map` always applies its function and always keeps the same shape; this lesson's `chain` might *not* apply its function at all, and collapses toward `nil` instead of preserving anything.

**Objects and methods used**: None new. This lesson reuses `nil?` (Lesson 136), `get`/`count` (Lesson 84, Lesson 94), and `=` (Lesson 6), each already covered.

---

## Concept Unit: Chaining Lookups That Might Fail

### The Problem

A small lookup table maps each person to their manager. Finding "this person's manager's manager" needs two lookups in sequence — but either one might fail, if the person (or their manager) isn't in the table at all. What does handling that correctly, by hand, actually look like?

### Introduce the concept in isolation

```clojure
(declare lookup-at)
(defn lookup [table key] (lookup-at table key 0))
(defn lookup-at [table key i]
  (if (>= i (count table))
    nil
    (if (= (get (get table i) 0) key)
      (get (get table i) 1)
      (lookup-at table key (+ i 1)))))

(defn manager-of-manager-naive [table person]
  (if (nil? (lookup table person))
    nil
    (lookup table (lookup table person))))
```

```
user=> (def managers [["alice" "bob"] ["bob" "carol"] ["dave" "eve"]])
user=> (manager-of-manager-naive managers "alice")
"carol"
user=> (manager-of-manager-naive managers "zed")
nil
```

`lookup` is a small linear search (the same scan-with-index shape used since Lesson 94), returning `nil` when the key isn't found — Lesson 7's own "no value" marker, doing real work here. `manager-of-manager-naive` correctly handles both cases: `"alice"` chains through to `"carol"`; `"zed"`, not in the table at all, short-circuits to `nil` before the second lookup ever runs, avoiding a lookup on `nil` itself. Every step this careful required its own explicit `nil?` check.

### Discard the throwaway example

Not applicable — every function is real, reusable, and verified against both a successful and a failing chain.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch lookup table and naive chaining function, built to make the real problem concrete before solving it.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn manager-of-manager-naive [table person]
  (if (nil? (lookup table person))
    nil
    (lookup table (lookup table person))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? (lookup table person))`** — reappearing `nil?` (Lesson 136): checks the *first* lookup's result before ever attempting the second.
- **`(lookup table (lookup table person))`** — reappearing `lookup`, nested: the second lookup, using the first's result as its key — only ever reached once the first is confirmed non-`nil`.

### CS Lens

Every additional chained step doubles this function's own nesting depth — a third lookup would need a third `nil?` check wrapped around the first two, the identical scaling problem Lesson 151's own `cond` solved for many-branch dispatch, now showing up for many-step *chaining* instead.

### SE Lens

The naive version is correct, but its correctness depends entirely on remembering to write a `nil?` check before every single step that depends on a possibly-failed previous one — a real, easy place to forget one check on a fourth or fifth chained lookup, silently reintroducing exactly the crash this careful version was written to avoid.

---

## Concept Unit: `chain` — Automating the Short-Circuit

### The Problem

Every step in the naive version repeats the identical pattern: check if the previous result was `nil`; if so, stop; if not, apply the next function. Can that pattern itself be written once, as a small function, rather than by hand at every step?

### Introduce the concept in isolation

```clojure
(defn chain [value f]
  (if (nil? value)
    nil
    (f value)))

(defn lookup-manager [key] (lookup managers key))
```

```
user=> (chain (lookup managers "alice") lookup-manager)
"carol"
user=> (chain (lookup managers "zed") lookup-manager)
nil
user=> (chain (lookup managers "carol") lookup-manager)
nil
user=> (= (manager-of-manager-naive managers "alice") (chain (lookup managers "alice") lookup-manager))
true
```

`chain` is the naive version's own pattern, factored out: given a value and a function, apply the function only if the value isn't already `nil`, otherwise short-circuit. `lookup-manager` wraps `lookup` with `managers` already fixed, so it takes just the one argument `chain` expects. The first result, `"carol"`, agrees exactly with the previous unit's `manager-of-manager-naive`, confirmed directly on the last line — not merely similar-looking, the identical answer. `"zed"` (not in the table at all) and `"carol"` (in the table, but with no manager of her own) both correctly short-circuit to `nil`, for two different real reasons, without `chain` itself needing to know which.

### Discard the throwaway example

Not applicable — `chain` is real, reusable, and proven to agree with the naive version rather than merely resembling it.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch factoring of this lesson's own first unit's repeated pattern.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn chain [value f]
  (if (nil? value)
    nil
    (f value)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (nil? value) nil (f value))`** — first appearance of this specific idea, factored into its own function: the entire "check, then maybe proceed" pattern from the previous unit, now callable by name instead of hand-written at every chained step.
- **`(defn lookup-manager [key] (lookup managers key))`** — a named function fixing `managers` as `lookup`'s own table, so the result takes exactly the one argument `chain`'s own `f` parameter expects — this curriculum's usual way of avoiding a closure, reused here for a genuinely new purpose.

### CS Lens

Chaining three or more steps is now `(chain (chain (lookup managers p) lookup-manager) lookup-manager)` — each additional step adds one more `chain` wrapping the outside, never any deeper `if`-nesting, the identical flattening benefit Lesson 151's `cond` gave multi-branch dispatch, now given to multi-step chaining instead.

### SE Lens

`chain` moves the "did this fail" responsibility out of every individual call site and into one single, already-verified function — a caller can write a whole sequence of possibly-failing steps and trust that a failure anywhere along the way correctly stops everything after it, without re-deriving that guarantee by hand each time.

### Connection to the previous unit

The previous unit hand-wrote the short-circuiting logic once, directly; this unit extracts that exact logic into a reusable function, proven to produce identical answers on both a successful and a failing chain.

---

## Concept Unit: Naming It — Monad, and How It Differs From a Functor

### The Problem

Lesson 153's `map`/`map-tree` also "does something to a value inside a structure." Is `chain` just another functor, or is it doing something genuinely different?

### Introduce the concept in isolation

`map` (Lesson 153) *always* applies its function, and always keeps the identical shape — a list of `3` elements maps to a list of `3` elements, guaranteed. `chain` might *not* apply its function at all — `(chain nil lookup-manager)` never calls `lookup-manager`, short-circuiting immediately — and its "shape" isn't preserved so much as it can *collapse*: a real value going in can become `nil` coming out, something `map` never does to a list's own length. This is called a **monad**: a way of composing functions that might fail, where failure automatically propagates through the rest of a chain, rather than needing to be checked at every single step by hand. `nil`, in this lesson, plays the same "possibly nothing" role Lesson 7 always gave it — this specific monad, built around a value that's either real or `nil`, is often called a **Maybe** (or **Optional**) monad in other languages.

### Discard the throwaway example

Not applicable — this unit names the structure this lesson's own two real functions already built and verified.

### CS Lens

Also recognized in: a real login system chaining "find the user" then "check the password" then "load their profile," where any step failing should skip every step after it, not crash into the next one expecting data that was never found; a parser chaining "read a token" then "read another" then "build a tree," where a failed read anywhere should stop the whole parse rather than continuing on garbage.

### SE Lens

Choosing between a functor (`map`) and a monad (`chain`) is determined by whether the function being applied can itself fail: `double-it` (Lesson 153) never fails, so `map`'s simpler, always-applies guarantee is exactly right for it; `lookup-manager` can fail, so it needs `chain`'s short-circuiting instead — using `map` for something that can fail would apply the function anyway and produce a nonsensical result on the failure case, exactly the crash this lesson's own naive version was careful to avoid.

### Connection to the previous unit

The previous unit built `chain` and proved it matches hand-written short-circuiting logic; this unit names what `chain` actually is, and draws the real, structural line between it and Lesson 153's functor.

---

## Connect the Pieces

Naive and `chain`-based chaining, side by side, agreeing on every case:

```clojure
(println "Naive, success:" (manager-of-manager-naive managers "alice"))
(println "Chain, success:" (chain (lookup managers "alice") lookup-manager))
(println "Naive, failure:" (manager-of-manager-naive managers "zed"))
(println "Chain, failure:" (chain (lookup managers "zed") lookup-manager))
```

```
Naive, success: carol
Chain, success: carol
Naive, failure: nil
Chain, failure: nil
```

Both approaches agree on every case checked — the only difference is that `chain`'s version never needed a fresh `nil?` check written by hand for this particular pair of steps.

## What Breaks Without This

Suppose a fourth chained lookup step were added to the naive version without also adding its own `nil?` check — a real, easy mistake once the nesting is already three levels deep and hard to read at a glance. `lookup` would run with `nil` as its key, since Lesson 7's `nil` doesn't equal any real key already in the table, quietly returning `nil` again rather than crashing — a silent failure that looks like a legitimate "not found" result, indistinguishable from a step that correctly detected a missing person. `chain`, by contrast, cannot have this specific bug: the short-circuiting check lives in exactly one place, already verified, and every additional step reuses it automatically rather than needing its own copy.

## Exercises

1. **Trace.** By hand, trace `(chain (lookup managers "bob") lookup-manager)` — confirm it reaches `"carol"` in one step, then explain why chaining a third `lookup-manager` after that reaches `nil`.
2. **Predict.** Before checking, predict `(chain (lookup managers "dave") lookup-manager)`, using `managers`'s own `["dave" "eve"]` entry and the fact that `"eve"` has no manager listed. Then verify.
3. **Verify.** Confirm `chain` and a three-level naive version (written by hand, extending this lesson's own `manager-of-manager-naive`) agree on `"alice"`'s manager's manager's manager.
4. **Break it, on purpose.** Write a version of `chain` that forgets the `nil?` check — always calls `f`, unconditionally — and show it crashes (or produces a wrong, non-`nil` result) on `"zed"`, who isn't in the table at all.
5. **Generalize.** Describe, without coding it, how `chain` would need to change to short-circuit on a different "failure" marker than `nil` — say, a value your own code marks as invalid some other way.
6. **Reconstruct.** Close this lesson. From memory, explain why `chain` is not just a variant of `map` — name the specific guarantee `map` makes that `chain` deliberately doesn't.

## Definition of Done

- [ ] You can write a naive, hand-checked chain of possibly-failing lookups and explain why it grows harder to read with each added step.
- [ ] You can write `chain` and prove it agrees with the naive version rather than merely resembling it.
- [ ] You can explain the real difference between a monad (`chain`, might not apply its function, can collapse to `nil`) and a functor (`map`, always applies its function, always preserves shape).
- [ ] You completed Exercise 3 and confirmed a three-level chain agrees with its naive hand-written equivalent.
- [ ] You completed Exercise 4 and showed an unconditional `chain` variant fails on a genuinely missing key.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm chain agrees with a 3-level naive chain for alice; show an unconditional chain variant crashes on zed"` — not just `"lesson 154 exercise"`.

---

**Next lesson:** Lesson 155, *Types as Sets of Values*, steps back from composing functions to asking what a type actually *is* — building a precise, mathematical model where a type is nothing more than the set of values it permits, connecting directly back to Lesson 150's own sum and product types.
