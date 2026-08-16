# Lesson 158: Abstraction as a Problem-Solving Tool

**What you will build**: This lesson works differently from every other one in this section, the same way Lessons 108 and 138 did. A real design challenge — recognize whether a new-looking operation forms a monoid, and use that recognition directly — worked with this section's own tools and nothing else, before this lesson shows you anything further. Then a companion implementation containing exactly one deliberately planted mistake, for you to find yourself before it's revealed — and this time, the mistake is in the *checker itself*, not the thing being checked.

**What you need to know first**: Everything built in this section (Lessons 139–157) is fair game — this lesson scaffolds as little as possible on purpose. Concretely, this lesson's own challenge leans hardest on Lesson 140's closure/associativity/identity checks, Lesson 141's monoid, and Lesson 150's product-type counting.

---

## The Challenge

A file-permission set bundles three independent flags — readable, writable, executable — exactly Lesson 150's own product type. Two permission sets can be combined with a "most permissive wins" rule: OR each flag independently, so a permission is granted in the result if either source granted it.

Before reading any further, work through this yourself:

1. **Count.** How many distinct permission sets exist at all, using Lesson 150's own product-type counting — three independent boolean flags, no new code needed to answer this.
2. **Recognize.** Does "combine by OR-ing each flag" form a monoid (Lesson 141) over the set of all permission sets? Check closure, associativity, and identity directly, the way Lesson 140 taught — don't just assume booleans behave the way you expect.
3. **Use it.** If it is a monoid, name its identity element concretely, and explain what that identity element being real and checkable actually guarantees about combining permissions from many sources, in any order, without needing to track how they were grouped.

You have everything you need: Lesson 140's own closure/associativity/identity checkers, applied to a genuinely new operation on a genuinely new set.

---

## A Companion Implementation

Here is one real attempt at the "recognize" step, written as a real associativity checker. Read it as if it were handed to you by a collaborator, before checking whether it's actually correct.

```clojure
(defn combine-perms [p1 p2]
  [(or (get p1 0) (get p2 0)) (or (get p1 1) (get p2 1)) (or (get p1 2) (get p2 2))])

(defn perms-associative? [a b c]
  (= (combine-perms (combine-perms a b) c) (combine-perms (combine-perms a b) c)))
```

The idea: `combine-perms` ORs each of the three flags, exactly the rule described above. `perms-associative?` checks Lesson 140's own associativity property — left-grouped combination compared against right-grouped combination — the identical shape `associative-at?` used back in Lesson 140.

---

## Find the Mistake

Before reading the next section, test this yourself, on real permission sets:

```clojure
(def no-perms [false false false])
(def read-only [true false false])
(def read-write [true true false])
```

Run `(perms-associative? read-only read-write no-perms)` yourself. It should report `true` — and it does. That alone doesn't prove the checker is correct, only that it didn't report a failure on *this* input. **Test the test itself**: run `perms-associative?`'s exact same shape against an operation you already know, from Lesson 140, is *not* associative — plain subtraction, using single-flag triples like `[5 0 0]`, `[3 0 0]`, `[1 0 0]` in place of real permissions, and a `combine-sub` in place of `combine-perms`. If the checker is genuinely testing associativity, it should report `false` on a known non-associative operation. Does it?

---

## Revealed: What's Wrong

```
user=> (perms-associative? read-only read-write no-perms)
true
user=> (defn combine-sub [p1 p2] [(- (get p1 0) (get p2 0)) 0 0])
user=> (defn sub-associative-buggy? [a b c] (= (combine-sub (combine-sub a b) c) (combine-sub (combine-sub a b) c)))
user=> (sub-associative-buggy? [5 0 0] [3 0 0] [1 0 0])
true
```

`true` — on an operation Lesson 140 already proved is *not* associative. `perms-associative?` never actually checks anything: its right-hand side is `(combine-perms (combine-perms a b) c)` again, an exact copy of the left-hand side, not `(combine-perms a (combine-perms b c))` as a genuine right-grouped comparison requires. Comparing any expression to an exact copy of itself is always `true`, for any operation at all, associative or not — the checker silently never tests the property it claims to.

```
user=> (defn sub-associative-correct? [a b c] (= (combine-sub (combine-sub a b) c) (combine-sub a (combine-sub b c))))
user=> (sub-associative-correct? [5 0 0] [3 0 0] [1 0 0])
false
```

The fix — genuinely comparing left-grouped against right-grouped:

```clojure
(defn perms-associative? [a b c]
  (= (combine-perms (combine-perms a b) c) (combine-perms a (combine-perms b c))))
```

This corrected version still reports `true` on real permissions — `combine-perms` genuinely *is* associative, since boolean `or` is associative (Lesson 8) — but now that `true` actually means something, confirmed by the fact that the identical checker shape correctly catches subtraction's real failure.

This is exactly why Lesson 108's own "test the real behavior, don't assume" discipline matters even for a *checker*: a checker that always agrees with whatever it's given isn't verifying anything, and the only way to catch that is testing it against a case where you already know the true answer — the identical logic behind every "break it on purpose" exercise this curriculum has asked for since Section VI.

---

## Why This Matters

Section VII's whole arc — monoids, groups, rings, equivalence relations, lattices, sum and product types, functors, monads, Curry-Howard — was never about memorizing definitions. It was about building the habit this lesson's own challenge required: meet a new-looking problem, recognize which already-understood structure it actually is, and use that structure's own already-proven guarantees instead of re-deriving them from scratch. The corrected `perms-associative?` isn't just a fixed bug — it's proof that permission-combining, a problem that has nothing to do with numbers or algebra on its surface, genuinely is a monoid, with every guarantee Lesson 141 already proved monoids have: combine permissions from any number of sources, in any order or grouping, and the result is reliable, for the identical structural reason `reduce` (Lesson 141) was always reliable on any real monoid. That's the actual, transferable payoff of this entire section — not the vocabulary itself, but the reflex to reach for it.

## Exercises

1. **Verify.** Confirm `combine-perms`'s identity is `[false false false]`, using Lesson 140's own `identity-check` shape, not just this lesson's informal claim.
2. **Count.** Confirm there are exactly `8` distinct permission sets, using Lesson 150's own product-type counting reasoning — three independent booleans.
3. **Verify.** Confirm `combine-perms` is genuinely commutative (`combine-perms a b` equals `combine-perms b a`) for at least two real permission pairs — a property this lesson never claimed, worth checking independently.
4. **Break it, on purpose, differently.** Introduce a *different* single mistake into the corrected `perms-associative?` — one that breaks the identity check instead of associativity — and describe exactly what test would reveal it.
5. **Reflect.** Before this lesson revealed the bug, did testing the checker against a known non-associative control case actually occur to you, or only the direct test on real permissions? What made the direct test alone insufficient?

## Definition of Done

- [ ] You determined the count of possible permission sets and confirmed the "OR each flag" operation forms a genuine monoid, using Lesson 140's own checks, before reading the companion implementation.
- [ ] You tested the companion checker against a known non-associative control case and found the mistake yourself, or confirmed exactly why you didn't.
- [ ] You completed Exercise 3 and confirmed `combine-perms` is commutative on real permission pairs.
- [ ] You completed Exercise 4 and correctly predicted the symptom of your own planted identity-check mistake.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm combine-perms is commutative on read-only/read-write; plant and predict symptom of a broken identity check"` — not just `"lesson 158 exercise"`.

---

**Next lesson:** Lesson 159 opens Section VIII, *Programming Languages and Semantics* — moving from this section's question, "what abstract structure does this problem already have," to a new one: what a programming language itself actually *is*, precisely, underneath any one specific language's own syntax.
