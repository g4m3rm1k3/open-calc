# Lesson 146: Partial Orders

**What you will build**: By the end of this lesson you'll check `\subseteq` (subset) on real sets against three properties — reflexive and transitive, kept from Lesson 145, plus a new one, antisymmetric — and show something an equivalence relation never has to face: two sets that are neither a subset of the other, related to *neither* by this ordering at all. That's a **partial order**, and it's the exact structure Lesson 127's topological sort was always ordering — which is why more than one valid topological order can exist for the identical dependency graph.

**What you need to know first**: Lesson 145's reflexive and transitive properties, and its own equivalence-relation contrast; Lesson 10's `#{}` sets and `clojure.set/subset?`; Lesson 127's topological sort, revisited here as this lesson's own payoff.

**Terms introduced in this lesson**:

- **antisymmetric** — a relation where `a \sim b` and `b \sim a` together force `a = b`. *Why it matters*: the opposite instinct from Lesson 145's symmetric — an equivalence relation lets `a` and `b` be genuinely different yet related both ways; a partial order forbids that unless they're actually the same element.
- **partial order** — a relation that is reflexive, transitive, and antisymmetric. *Why it matters*: unlike Lesson 145's equivalence relation, a partial order is *not* required to relate every pair of elements at all — two elements can simply be incomparable.
- **comparable** — two elements `a` and `b` are comparable, under a given order, if `a \sim b$ or `b \sim a` holds. *Why it matters*: names precisely the property an equivalence relation's classes never had to worry about, and a partial order can genuinely lack, for some pairs.
- **total order** — a partial order where *every* pair of elements is comparable. *Why it matters*: `\leq` on ordinary numbers is total — any two numbers can always be compared — which is exactly the property this lesson's `\subseteq` example lacks, and the reason "partial" is in the name at all.

**Objects and methods used**: None new. This lesson reuses `#{}` and `clojure.set/subset?` (Lesson 10), and `=` (Lesson 6), each already covered.

---

## Concept Unit: Subset — Reflexive, Transitive, and Something New

### The Problem

Lesson 145's equivalence relation was symmetric — `a \sim b` always meant `b \sim a`. Does `\subseteq` (subset) share that property, or does it behave differently once two genuinely different sets are involved?

### Introduce the concept in isolation

```
user=> (clojure.set/subset? #{1 2} #{1 2})
true
user=> (clojure.set/subset? #{1} #{1 2})
true
user=> (clojure.set/subset? #{1 2} #{1 2 3})
true
user=> (clojure.set/subset? #{1} #{1 2 3})
true
```

**Reflexive**: every set is a subset of itself — `\#\{1,2\} \subseteq \#\{1,2\}` is `true`. **Transitive**: `\#\{1\} \subseteq \#\{1,2\}` and `\#\{1,2\} \subseteq \#\{1,2,3\}`, and, following the chain, `\#\{1\} \subseteq \#\{1,2,3\}` too — checked directly on the last line. So far, this looks exactly like Lesson 145's equivalence relation. The difference shows up asking about symmetry directly: is `\#\{1,2\} \subseteq \#\{1,2,3\}` accompanied by `\#\{1,2,3\} \subseteq \#\{1,2\}`? It plainly isn't — a 3-element set is never a subset of one with fewer elements unless they're equal. `\subseteq` is **antisymmetric** instead: the *only* way both directions can hold at once is if the two sets are actually identical.

### Discard the throwaway example

Not applicable — every check is real, run against `clojure.set/subset?` directly, not assumed from familiarity with subsets.

### Project Change

- **Reference Source**: No reference counterpart — direct verification of `clojure.set/subset?`'s already-existing behavior against three named properties.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit checks an existing function (`clojure.set/subset?`) against existing sets, rather than building a new one.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(clojure.set/subset? #{1 2} #{1 2})`** — reappearing `clojure.set/subset?` (Lesson 10), checked here specifically for reflexivity, a use it was never explicitly put to before.
- **`(clojure.set/subset? #{1} #{1 2})`, `(clojure.set/subset? #{1 2} #{1 2 3})`** — the same function, chained to check transitivity across three related sets, matching the exact chained-check shape Lesson 145's `same-remainder?` transitivity check used.

### CS Lens

Reflexive, transitive, antisymmetric together is a **partial order** — Lesson 145's equivalence relation, with symmetric swapped out for antisymmetric, a small change in the defining properties producing a structurally very different kind of relation.

### SE Lens

Antisymmetry is precisely what makes `\subseteq` useful as a genuine notion of "smaller than or equal to" for sets, the way `\leq` is for numbers — an equivalence relation could never serve that role, since it treats every related pair as fully interchangeable, discarding exactly the directional information a real ordering needs to keep.

---

## Concept Unit: Incomparable — Two Sets, Neither a Subset of the Other

### The Problem

Every pair of numbers can be compared with `\leq` — one is always at most the other. Does `\subseteq` guarantee the same thing for every pair of sets?

### Introduce the concept in isolation

```
user=> (clojure.set/subset? #{1 2} #{3 4})
false
user=> (clojure.set/subset? #{3 4} #{1 2})
false
```

Neither direction holds. `\#\{1,2\}$ is not a subset of `\#\{3,4\}`, and `\#\{3,4\}` is not a subset of `\#\{1,2\}` either — these two sets are **incomparable** under `\subseteq`. This never happens under `\leq` on ordinary numbers: for any two real numbers `a` and `b`, at least one of `a \leq b` or `b \leq a` always holds — `\leq` is a **total order**. `\subseteq` is only a **partial** order precisely because pairs like this exist.

### Discard the throwaway example

Not applicable — both `false` results are real, confirming genuine incomparability rather than an oversight.

### Project Change

- **Reference Source**: No reference counterpart — direct demonstration of `clojure.set/subset?`'s behavior on a genuinely incomparable pair.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit demonstrates existing behavior rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(clojure.set/subset? #{1 2} #{3 4})`, `(clojure.set/subset? #{3 4} #{1 2})`** — reappearing `clojure.set/subset?`, both directions checked and both `false` — the defining evidence of incomparability, shown rather than merely claimed.

### CS Lens

Divisibility on positive integers is another real partial order for the identical reason: `2` divides `6`, but `2` and `5` are incomparable — neither divides the other — the same shape as this unit's two sets, in a completely different domain.

### SE Lens

Code that assumes every pair of a data type's values can be compared — sorting sets by `\subseteq`, say, the way numbers get sorted by `\leq` — runs into a real, structural problem the moment two incomparable elements show up: there is no correct answer for "which comes first," because neither actually does. Recognizing a partial order for what it is, before writing a sort or comparison function against it, avoids building something that will eventually hit input it fundamentally cannot handle correctly.

### Connection to the previous unit

The previous unit confirmed `\subseteq` satisfies a partial order's three properties; this unit shows the specific consequence "partial" refers to — real pairs that satisfy none of the ordering relationship at all.

---

## Concept Unit: Topological Sort Was Ordering a Partial Order All Along

### The Problem

Lesson 127's topological sort produced one valid ordering of a dependency graph's vertices — but more than one correct ordering usually exists for the identical graph. Is there a precise reason for that, connected to what this lesson just named?

### Introduce the concept in isolation

A dependency graph's "must happen before" relationship — task `A` before task `B`, following the graph's edges, transitively — is reflexive (a task trivially precedes itself, in the sense this comparison needs), transitive (Lesson 127's own DFS-based ordering already relied on this), and antisymmetric (a real dependency graph has no cycles, so `A` before `B` and `B` before `A` can never both hold unless `A` and `B` are the same task). That is a **partial order**: two tasks with no dependency path between them at all — neither before the other — are simply **incomparable**, the identical situation this lesson's own two sets were in.

Topological sort's job was never to discover *the* one true order — it was to produce *some* **total order** (Lesson 127's own linear sequence) that's consistent with the partial order already given by the graph's edges: every *comparable* pair keeps its required relationship, and every *incomparable* pair — tasks with no dependency between them — can legally appear in either order. That's precisely why more than one correct topological sort usually exists: incomparable pairs have no single correct placement to begin with.

### Discard the throwaway example

Not applicable — this unit names the real structure Lesson 127's own algorithm was already built on, without introducing new code.

### CS Lens

"Extend a partial order to a total order" is the exact, general name for what topological sort does — the same task shows up as "extending a partial specification into a total one" anywhere a dependency structure (build systems, package managers, spreadsheet formula evaluation) needs to be flattened into one concrete sequence to actually execute.

### SE Lens

A build system that reports "these two build steps can run in either order" isn't being vague — it's reporting a real, structural fact about the underlying partial order: those two steps are genuinely incomparable, and forcing one specific order between them (rather than allowing either) would be adding a constraint the actual dependency graph never required.

### Connection to the previous unit

The previous unit showed a partial order can leave real pairs incomparable; this unit shows that's exactly why a single dependency graph can have many correct topological orderings — one for every way of arbitrarily deciding the pairs the partial order itself never decided.

---

## Connect the Pieces

Antisymmetry, incomparability, and the connection to an already-built algorithm, together:

```clojure
(println "Reflexive:" (clojure.set/subset? #{1 2} #{1 2}))
(println "Antisymmetric (equal sets, both directions hold):" (and (clojure.set/subset? #{1 2} #{1 2}) (clojure.set/subset? #{1 2} #{1 2}) (= #{1 2} #{1 2})))
(println "Incomparable pair:" (clojure.set/subset? #{1 2} #{3 4}) (clojure.set/subset? #{3 4} #{1 2}))
```

```
Reflexive: true
Antisymmetric (equal sets, both directions hold): true
Incomparable pair: false false
```

`\subseteq` satisfies every property a partial order requires, and genuinely lacks the one property — comparability for every pair — that would make it total, exactly the gap Lesson 127's topological sort has always had to fill in by choosing an order for.

## What Breaks Without This

Suppose a scheduler assumed every pair of tasks in a dependency graph *must* be comparable — that for any two tasks, one always has to come strictly before the other — and treated any two tasks it couldn't order as a bug to be fixed rather than a legitimate incomparability. It would either loop forever searching for an ordering relationship that was never actually there, or force an artificial, unnecessary constraint between tasks that have no real dependency, silently making the schedule less flexible than the actual problem allows. Recognizing that a dependency structure is only a *partial* order — some pairs genuinely incomparable, not merely undiscovered — is what makes "either order is fine here" a correct answer instead of a symptom of an unsolved problem.

## Exercises

1. **Trace.** By hand, confirm `\#\{1\} \subseteq \#\{1,2\} \subseteq \#\{1,2,3\}` implies `\#\{1\} \subseteq \#\{1,2,3\}$, the same transitivity chain this lesson's first unit checked.
2. **Predict.** Before checking, predict whether `\#\{1,2\}` and `\#\{2,3\}` are comparable under `\subseteq`. Then verify with `clojure.set/subset?` in both directions.
3. **Verify.** Confirm divisibility on `\{2, 3, 4, 6, 12\}` is antisymmetric by checking that no two *different* numbers in that set divide each other both ways.
4. **Break it, on purpose.** Find two numbers in `\{2, 3, 4, 6, 12\}` that are incomparable under divisibility (neither divides the other), and confirm directly.
5. **Generalize.** Describe, without coding it, why `\leq` on numbers is a total order but `\subseteq` on sets is only partial — what specific property numbers have that sets don't.
6. **Reconstruct.** Close this lesson. From memory, explain why more than one valid topological order can exist for a single dependency graph, using this lesson's own "incomparable pair" idea, not a general statement about flexibility.

## Definition of Done

- [ ] You can define a partial order as reflexive, transitive, and antisymmetric, and explain how antisymmetric differs from Lesson 145's symmetric.
- [ ] You can find a real incomparable pair under `\subseteq` and explain why comparability can fail.
- [ ] You can explain why Lesson 127's topological sort is "extending a partial order into a total order," not discovering one true order.
- [ ] You completed Exercise 3 and confirmed antisymmetry for divisibility on a real set of numbers.
- [ ] You completed Exercise 4 and found a genuine incomparable pair under divisibility.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm divisibility antisymmetric on {2,3,4,6,12}; find 4 and 6 incomparable (neither divides the other)"` — not just `"lesson 146 exercise"`.

---

**Next lesson:** Lesson 147, *Lattices*, asks what happens when a partial order is guaranteed to have a well-defined "best common ground" for every incomparable pair — connecting directly to program analysis, where exactly this guarantee is what makes certain compiler optimizations provably terminate.
