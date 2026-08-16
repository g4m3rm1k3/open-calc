# Lesson 145: Equivalence Relations

**What you will build**: By the end of this lesson you'll name precisely what `mod4-add` (Lesson 140) was quietly doing to every integer that ever passed through it — treating infinitely many different numbers as "the same," provided they share a remainder — and prove that treatment obeys three exact properties: reflexive, symmetric, transitive. You'll then show a second, unrelated relation obeys the identical three properties, and that `mod`'s own return value has been serving as a **canonical representative** — one chosen stand-in for an entire infinite class of equivalent values — the whole time.

**What you need to know first**: Lesson 11's relation (a set of ordered pairs); Lesson 54's `mod` and its own "equivalence class (mod n)"; Lesson 140's `mod4-add`, revisited here as the motivating example.

**Terms introduced in this lesson**:

- **equivalence relation** — a relation that is **reflexive** (`a \sim a`, always), **symmetric** (`a \sim b` implies `b \sim a`), and **transitive** (`a \sim b` and `b \sim c` implies `a \sim c`). *Why it matters*: a genuinely different idea from Lesson 7's and Lesson 8's *logical* equivalence (whether two propositions always share a truth value) — this lesson's version is a property of a *relation on a set*, checkable against real values, not propositions.
- **equivalence class** — the set of every element related to a given one by an equivalence relation. *Why it matters*: Lesson 54 already named one specific instance, "equivalence class (mod n)," without ever stating the three properties that make it one — this lesson gives the general definition that specific case was always an instance of.
- **canonical representative** — one specific, chosen member of an equivalence class, used to stand in for the entire class. *Why it matters*: names precisely what `(mod a 4)` has been computing since Lesson 54 — not "the remainder," exactly, but "the one number in `0`..`3` that represents every integer sharing that remainder."

**Objects and methods used**: None new. This lesson reuses `mod` (Lesson 54), `=` (Lesson 6), and `<`/`-` (Lesson 2, Lesson 7), each already covered.

---

## Concept Unit: Reflexive, Symmetric, Transitive — Checked, Not Assumed

### The Problem

"Same remainder mod `4`" feels obviously well-behaved as a notion of sameness. Is that feeling backed by three specific, checkable properties, or just an intuition borrowed from ordinary `=`?

### Introduce the concept in isolation

```clojure
(defn same-remainder? [a b] (= (mod a 4) (mod b 4)))
```

```
user=> (same-remainder? 5 5)
true
user=> (same-remainder? 5 9)
true
user=> (same-remainder? 9 5)
true
user=> (same-remainder? 1 5)
true
user=> (same-remainder? 5 9)
true
user=> (same-remainder? 1 9)
true
```

Three properties, each checked directly: **reflexive** — `(same-remainder? 5 5)` is `true`, every number shares a remainder with itself. **Symmetric** — `(same-remainder? 5 9)` and `(same-remainder? 9 5)` agree, both `true`; the relation doesn't care about argument order. **Transitive** — `1` and `5` share a remainder, `5` and `9` share a remainder, and, following the chain, `1` and `9` do too — checked directly on the last line, not merely assumed from the first two.

### Discard the throwaway example

Not applicable — `same-remainder?` is real, reusable, and all three properties were checked with real values, not asserted.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch checker for this lesson's own defined relation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn same-remainder? [a b] (= (mod a 4) (mod b 4)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(mod a 4)`, `(mod b 4)`** — reappearing `mod` (Lesson 54): reduces each argument to its own canonical form before comparing, rather than comparing `a` and `b` directly.
- **`(= (mod a 4) (mod b 4))`** — reappearing `=` (Lesson 6): the relation itself is nothing more than "do these two canonical forms match" — the entire definition, once the hard work is delegated to `mod`.

### CS Lens

This is called an **equivalence relation** — the general name for what Lesson 54's own "equivalence class (mod n)" was always an instance of, now given its three exact defining properties instead of just a label.

### SE Lens

Checking all three properties explicitly, rather than trusting that "same remainder" obviously behaves like equality, is the same discipline Lesson 140 applied to closure and associativity: a relation that merely *looks* well-behaved could fail transitivity specifically (Lesson 145's own third unit shows a relation that does exactly that) — and code built assuming transitivity holds, when it doesn't, breaks in a way that's easy to miss until it actually matters.

---

## Concept Unit: One Class, Many Members, One Canonical Representative

### The Problem

`1`, `5`, `9`, and `-3` all share a remainder mod `4`. Is there a precise name for "everything equivalent to `1`," and a precise name for the one value `mod4-add` (Lesson 140) has actually been operating on this whole time?

### Introduce the concept in isolation

```clojure
(defn canonical [a] (mod a 4))
```

```
user=> (canonical 1)
1
user=> (canonical 5)
1
user=> (canonical 9)
1
user=> (canonical -3)
1
```

`\{\ldots, -7, -3, 1, 5, 9, \ldots\}` — every integer congruent to `1` mod `4` — is one **equivalence class**: infinitely many numbers, every pair among them related by `same-remainder?`. `canonical` maps every one of them to the identical value, `1` — the class's own **canonical representative**. This is precisely what Lesson 140's `mod4-add` was doing the entire time: `\{0, 1, 2, 3\}$ was never "the only integers that matter," it was one canonical representative chosen from each of the four equivalence classes mod `4` — every integer at all belongs to exactly one of those four classes, and `mod4-add` only ever needed to know which.

### Discard the throwaway example

Not applicable — `canonical` is real, and every value shown maps four genuinely different integers to the identical representative.

### Project Change

- **Reference Source**: No reference counterpart — direct renaming of `mod`'s own existing behavior to make its role as class-representative explicit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn canonical [a] (mod a 4))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(mod a 4)`**, wrapped as `canonical` — reappearing `mod` (Lesson 54), renamed to make explicit that its job was always "pick the representative," not merely "compute a remainder" — the same rename-for-clarity move Lesson 142 made for `min`/`+` becoming `sr-add`/`sr-mult`.

### CS Lens

**Quotienting** — forming a new, smaller set out of an equivalence relation's classes, one representative per class — is exactly how `\{0,1,2,3\}$ relates to the full set of integers: infinitely many integers, quotiented down to four representatives, with `mod4-add`'s entire algebra living on those four alone.

### SE Lens

Working with canonical representatives instead of raw equivalence classes is a real, practical engineering choice: comparing two integers for "same remainder" by checking `same-remainder?` directly costs one `mod` call each side; a system that instead stored and compared entire equivalence classes (infinite sets) would need some other, more expensive representation entirely. Canonical representatives are what make an infinite equivalence relation usable with finite, cheap computation.

### Connection to the previous unit

The previous unit proved "same remainder" is a genuine equivalence relation; this unit names what its classes look like and shows `mod4-add` was always operating on canonical representatives of those classes, not on "all the integers" directly.

---

## Concept Unit: A Second Equivalence Relation, Nothing to Do With Remainders

### The Problem

Is "reflexive, symmetric, transitive, with a canonical representative" specific to remainders, or does a completely unrelated relation satisfy the identical three properties?

### Introduce the concept in isolation

```clojure
(defn my-abs [a] (if (< a 0) (- a) a))
(defn same-abs? [a b] (= (my-abs a) (my-abs b)))
```

```
user=> (same-abs? 5 5)
true
user=> (same-abs? 5 -5)
true
user=> (same-abs? -5 5)
true
```

"Same absolute value" is reflexive (`5` shares its own absolute value with itself), symmetric (`5`/`-5` agree in both orders), and transitive by the identical reasoning `same-remainder?` used — genuinely different relation, same three properties, checked the same way. Its equivalence classes each have exactly two members (`\{5, -5\}`, `\{3, -3\}`, and so on — except `\{0\}$, alone) rather than infinitely many; its canonical representative is simply the non-negative one, `my-abs` itself.

### Discard the throwaway example

Not applicable — `my-abs` and `same-abs?` are real, reusable, and verified against both orderings.

### Project Change

- **Reference Source**: No reference counterpart — a second, independently chosen relation, built to demonstrate the same three properties recur elsewhere.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn my-abs [a] (if (< a 0) (- a) a))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (< a 0) (- a) a)`**, in `my-abs` — reappearing `if`/`<`/`-` (Lesson 7, Lesson 2): negates only when the value is already negative, the ordinary definition of absolute value, built entirely from constructs this curriculum already had, with no new syntax needed.
- **`(= (my-abs a) (my-abs b))`**, in `same-abs?` — reappearing shape (this unit's own `same-remainder?`): identical structure, a different underlying canonical-form function.

### CS Lens

Every equivalence relation, checked this lesson's own way, factors into the identical shape: some function mapping every element to its own canonical form, and "equivalent" simply meaning "maps to the same form" — `mod4-add`'s `mod` and this unit's `my-abs` are two different instances of that one shape, not two unrelated ideas.

### SE Lens

Recognizing this shape matters practically: a hash table (Lesson 89) groups keys by *some* notion of "the same," and a poorly chosen equivalence relation for that grouping — one that isn't actually transitive, say — would silently place genuinely different keys in inconsistent buckets, a real correctness bug traceable directly back to one of this lesson's own three properties failing to hold.

### Connection to the previous unit

The previous unit named the shape ("canonical representative") for one specific relation; this unit shows that same shape recurring for a relation that shares nothing with remainders except the three defining properties.

---

## Connect the Pieces

Two unrelated relations, the identical three properties, and their own canonical representatives:

```clojure
(println "same-remainder? canonical of 1 and 9:" (canonical 1) (canonical 9))
(println "same-abs? canonical of 5 and -5:" (my-abs 5) (my-abs -5))
(println "Both relations transitive on their own chains:" (same-remainder? 1 9) (same-abs? 5 -5))
```

```
same-remainder? canonical of 1 and 9: 1 1
same-abs? canonical of 5 and -5: 5 5
Both relations transitive on their own chains: true true
```

Two completely different notions of "the same," each reducing infinitely (or in the second case, mostly two-to-one) many values down to one representative — the exact shape every equivalence relation this lesson checked turned out to share.

## What Breaks Without This

Suppose a relation "within `2` of each other" (`\lvert a - b \rvert \leq 2`) were assumed to be an equivalence relation without checking transitivity specifically. It's reflexive (`\lvert a - a \rvert = 0 \leq 2`) and symmetric (`\lvert a - b \rvert = \lvert b - a \rvert`) — but `1` is within `2` of `3`, and `3` is within `2` of `5`, while `1` is *not* within `2` of `5` (`\lvert 1 - 5 \rvert = 4`). Transitivity genuinely fails. Code that grouped values by "within `2`" as though it partitioned them into clean, non-overlapping classes — the way `same-remainder?` and `same-abs?` both genuinely do — would silently produce inconsistent groupings, exactly the hash-table failure this lesson's third unit's SE Lens named, traced back to a property that looked plausible but was never actually checked.

## Exercises

1. **Trace.** By hand, confirm `same-remainder?` is transitive on `2`, `6`, `10` — three numbers, all claimed to share a remainder mod `4`.
2. **Predict.** Before checking, predict whether "within `2` of each other" (defined in this lesson's own closing section) is reflexive and symmetric. Then verify both, and separately confirm the specific transitivity failure shown above.
3. **Verify.** Confirm `same-abs?`'s equivalence class for `0` really does contain only `\{0\}`, unlike every other class, which has exactly two members.
4. **Break it, on purpose.** Define a relation that is reflexive and transitive but *not* symmetric (for example, `\leq`), and show a concrete pair where symmetry fails.
5. **Generalize.** Describe, without coding it, the equivalence classes and canonical representative for "same length" on lists.
6. **Reconstruct.** Close this lesson. From memory, explain why `mod4-add` (Lesson 140) was always secretly operating on canonical representatives of equivalence classes, not on "the integers `0` through `3`" as an arbitrary restriction.

## Definition of Done

- [ ] You can define an equivalence relation as reflexive, symmetric, and transitive, and check all three against a real relation.
- [ ] You can explain what an equivalence class and a canonical representative are, using `mod4-add`'s own `mod` as a concrete example.
- [ ] You can explain why "within `2` of each other" fails to be an equivalence relation, using a real counterexample.
- [ ] You completed Exercise 3 and confirmed `0`'s equivalence class under `same-abs?` has exactly one member.
- [ ] You completed Exercise 4 and found a real relation that is reflexive and transitive but not symmetric.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm {0} is same-abs?'s only singleton class; show <= is reflexive/transitive but not symmetric via 3<=5 and 5<=3"` — not just `"lesson 145 exercise"`.

---

**Next lesson:** Lesson 146, *Partial Orders*, keeps this lesson's reflexive and transitive properties but deliberately drops symmetry — naming what's left when "related" no longer means "interchangeable," the exact shape `\leq`, this lesson's own closing counterexample, already hinted at.
