# Lesson 56: Why Counting Matters

**What you will build:** no new procedure — this lesson instead connects four things already real and already measured across this curriculum (a search space's size, the memory it costs to store, the probability of a random outcome within it, and the runtime of a computation over it) back to one shared root cause: counting. Real, freshly measured evidence this session: `all-subsets` (Lesson 51) on a 10-item list produces exactly `1,024` subsets, costing `14,254,080` bytes of resident memory to hold; on a 20-item list, exactly `1,048,576` subsets, costing `94,191,616` bytes — the count didn't double when the input did, it squared. The transferable point this lesson exists to make: this pattern — counting explaining size, memory, probability, and runtime all at once — is not a coincidence specific to `all-subsets`. It is the reason Era III exists.

**What you need to know first:** Lesson 39 (`FP-L039-termination.md`) — specifically the real, measured RSS-memory-growth evidence used there, reused here in the identical spirit. Lesson 51 (`FP-L051-generating-possibilities.md`) — specifically `all-subsets`, whose real, verified subset counts anchor this entire lesson. Lesson 53 through 55 (`FP-L053` through `FP-L055`) — specifically the real call-count numbers already measured for `fib`, `memo-fib`, and `table-fib`, reused directly in this lesson's fourth connection.

**Terms introduced in this lesson**

- **Search space** — the complete set of possibilities a computation might need to examine or generate, such as every subset of a list, every ordering of a sequence, or every path through a decision tree. Lesson 50's backtracking search and Lesson 51's `all-subsets` both operated over a search space, without this curriculum naming it explicitly until now.
- **Counting principle** — the general idea that the *size* of a search space, computed in advance by counting, predicts the memory, time, and probability behavior of any computation over that space — before the computation is ever run.

## Objects and methods used

No new procedures are introduced in this lesson — every real number below comes from procedures already fully built (`all-subsets`, Lesson 51; `fib`, `memo-fib`, `table-fib`, Lessons 53–55) and Guile's `random`, used here only to generate real evidence for Concept Unit 3, not introduced as course material in its own right.

---

## Concept Unit 1: One Question, Asked Four Different Ways

### The Problem

Across Lessons 39, 51, 53, 54, and 55, this curriculum has already asked, in four seemingly different contexts: how much memory will this cost? how likely is this outcome? how long will this take? and how big is the space of possibilities here? It's worth asking directly whether these are actually four different questions, or one question asked four different ways.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly, using evidence already gathered across five prior lessons.

### Applying It — Naming the Common Root

**Restating each prior question, precisely, in terms of a specific search space:**

- Lesson 39 asked how memory grows with recursion depth — a question about the space of pending call frames.
- Lesson 51 asked how many calls `all-subsets` makes without `let` — a question about the space of subsets being generated.
- Lesson 53 asked how many total calls `fib(n)` makes — a question about the space of recursive calls its call tree contains.
- Lesson 54 and 55 asked how much faster a fix runs — a question about how much smaller a *distinct*-subproblem space is than the full call space.

**Naming what's shared:** every one of these questions is secretly the same question — *how large is the relevant space of possibilities* — asked once about memory, once about calls, once about time. Counting that space's size, precisely, is what Era III is actually about.

### Walkthrough

- **Each restated prior question** — not new material, but the first time this curriculum has explicitly named what these five separate measurements had in common all along.
- **"how large is the relevant space of possibilities"** — the first appearance of *search space* as a deliberately named idea, though the idea itself has been present, unnamed, since Lesson 39.

### CS Lens

This is the recognition that many apparently distinct engineering questions — memory budgeting, runtime estimation, likelihood estimation — reduce to a single mathematical question, counting, asked in different clothing. Also recognized in: a warehouse manager asking "how much shelf space," "how long will picking take," and "how likely is a stockout" all really depending on one shared number, how many distinct items the warehouse holds; an airline asking about fuel cost, boarding time, and overbooking risk, all depending on one shared number, how many passengers.

### SE Lens

The alternative to naming this shared root is to keep treating memory questions, time questions, and probability questions as separate concerns, each needing its own separate intuition built from scratch. The real cost of that alternative is exactly what Era III's introduction (BRD) warns against: not recognizing when a program has quietly become impossible to run, because the underlying reason — an uncounted, exploding search space — was never named as one single, recognizable cause. Naming it now, as this unit does, costs nothing beyond the recognition itself; it is what makes Concept Units 2 through 5's four concrete connections legible as instances of one pattern, not four unrelated facts.

---

## Concept Unit 2: Counting and Search-Space Size

### The Problem

`all-subsets` (Lesson 51) already produced real, verified subset counts for lists of a few different sizes. It's worth looking at those counts directly, as a table, rather than one number at a time, to see what the *size itself* does as the input grows.

### No isolated lab for this step

This concept has no code of its own to isolate — the real counts are shown directly below, generated from code already fully built in Lesson 51.

### Applying It — The Real, Measured Subset Counts

```
$ guile subset10.scm
n=10 subset-count=1024
$ guile subset20.scm
n=20 subset-count=1048576
```

Verified this session, using `all-subsets` (Lesson 51) unchanged, applied to a list of the first `n` positive integers: a `10`-item list produces exactly `1,024` subsets; a `20`-item list — twice as many items — produces `1,048,576` subsets, not twice as many, but `1,024` times as many.

**Naming why, directly:** Concept Unit 2 of Lesson 51 already derived this — every item either is or isn't in a given subset, so each additional item *doubles* the number of subsets. Ten items means the count doubled ten times over (`2¹⁰`); twenty items means it doubled twenty times over (`2²⁰`). Doubling the input doesn't double the space — it doubles the space *again*, on top of everything the first ten doublings already produced.

### Walkthrough

- **The real `1,024` versus `1,048,576` counts** — first direct, side-by-side look at how dramatically a search space's size can grow from a modest-looking change in input.
- **The connection to Lesson 51 and 52's own doubling derivation** — not new material, but the same `2ⁿ` growth already derived there, now examined specifically for what it does to the *size of the space itself*, independent of how long generating it takes.

### CS Lens

This is the recognition that a search space's size is a property of the *problem*, fixed by counting, entirely independent of how cleverly or wastefully a program explores it — `all-subsets` couldn't have produced fewer than `1,048,576` subsets for a 20-item list no matter how it was written, because that many subsets genuinely exist. Also recognized in: a warehouse's total inventory count, fixed by what's actually on the shelves, independent of how efficiently or inefficiently a clerk counts it; a city's total population, fixed by who actually lives there, independent of how a census is conducted.

### SE Lens

The alternative to counting a search space's size directly is to discover it empirically, by running a program and seeing how long it takes or how much memory it uses. The real cost of that alternative, for a space that grows the way subsets do, is discovering the problem only after attempting an input large enough to make the program impractically slow or memory-hungry — exactly the "impossible to run" scenario Era III's introduction warns about. Counting the space's size in advance, as this unit does using nothing but arithmetic, costs nothing beyond the derivation itself; it predicts the practical limit before ever running the program at that scale.

---

## Concept Unit 3: Counting and Storage

### The Problem

Lesson 39 measured real memory growth from recursion depth. It's worth measuring, just as directly, what storing an entire counted search space actually costs — connecting the abstract count from Concept Unit 2 to a concrete, real memory number.

### No isolated lab for this step

This concept has no code of its own to isolate — the real measurement is shown directly below, using `all-subsets` unchanged from Lesson 51.

### Applying It — Real, Measured Memory Cost

```
$ /usr/bin/time -l guile subset10.scm
n=10 subset-count=1024
            14254080  maximum resident set size

$ /usr/bin/time -l guile subset20.scm
n=20 subset-count=1048576
            94191616  maximum resident set size
```

Verified this session — holding all `1,024` subsets of a 10-item list in memory costs `14,254,080` bytes (roughly `13.6` MB, most of it Guile's own fixed startup cost); holding all `1,048,576` subsets of a 20-item list costs `94,191,616` bytes (roughly `89.8` MB) — a real, measured roughly `6.6×` increase in memory, directly tracking Concept Unit 2's `1,024×` increase in subset count (the increase in *memory* is far smaller than the increase in *count* here specifically because Guile's own fixed startup memory, present in both measurements, dominates the smaller run — a genuine, honest reason the two ratios don't match exactly).

### Walkthrough

- **The real `14,254,080` versus `94,191,616` byte measurements** — first direct connection between a counted search-space size (Concept Unit 2) and an actual, measured memory cost of holding it.
- **The honest explanation for why the memory ratio doesn't match the count ratio exactly** — the same non-overclaiming discipline this curriculum has used since Lesson 39, naming a real confound (fixed startup memory) rather than letting the numbers imply a cleaner relationship than actually exists.

### CS Lens

This is the direct, practical consequence of Concept Unit 2's counting: a search space isn't just an abstract number, it's a concrete memory bill, and counting the space in advance predicts that bill before ever running the program. Also recognized in: a moving company estimating truck size from a counted inventory of boxes before the move, not by attempting it and discovering a truck's too small partway through; a caterer estimating table space from a counted guest list before the event.

### SE Lens

The alternative to measuring memory directly, alongside the abstract count, is to trust that "more items counted" straightforwardly means "proportionally more memory used," without checking. The real cost of that alternative is exactly the imprecision Concept Unit 3 corrected — the actual ratio, `6.6×`, is nowhere near the count's `1,024×`, and assuming otherwise could badly mis-estimate a real system's memory needs at a different scale, in either direction. Measuring directly, as this unit does, costs one real, repeatable command; it replaces an assumed proportionality with a checked, honestly-explained one.

---

## Concept Unit 4: Counting and Probability

### The Problem

A search space's size doesn't only predict memory and time — it also predicts the likelihood of any single outcome within it, if every member of that space is equally likely to occur. This is worth checking with a real, empirical trial, not just asserted.

### No isolated lab for this step

This concept has no code of its own to isolate — the real simulation is shown directly below, using `all-subsets` unchanged from Lesson 51 plus Guile's built-in `random`.

### Applying It — A Real, Measured Probability Check

**The claim to check:** if a subset is drawn uniformly at random from all `1,024` subsets of a 10-item list, the probability of drawing specifically the empty subset should be exactly `1 / 1,024`.

```
$ guile probability.scm
total subsets: 1024
trials: 200000
empty-subset draws: 198
measured frequency: 9.9e-4
expected 1/total: 9.765625e-4
```

Verified this session — across `200,000` real random draws from the actual `1,024` subsets `all-subsets` generated, the empty subset was drawn `198` times, a measured frequency of `0.00099`, closely matching the predicted `1/1,024 = 0.0009766` — confirming, empirically, that counting a search space's size directly predicts the probability of any one specific outcome within it.

### Walkthrough

- **The stated claim, `1 / 1,024`, before any simulation is run** — following this curriculum's standing discipline (established since Lesson 22) of stating a prediction before checking it, not fitting an explanation to results after the fact.
- **The real `198`-draws-out-of-`200,000` result, closely matching the prediction** — genuine empirical confirmation, not a hand-wavy appeal to "obviously" true probability theory.

### CS Lens

This is the direct connection between counting and probability that underlies every use of randomness in computing that assumes uniform likelihood — a random password's strength, a hash function's collision risk, a shuffle algorithm's fairness — all of it ultimately a statement about the *size* of a counted space. Also recognized in: a lottery's odds, computed directly from how many possible ticket combinations exist; a card shuffle's fairness, judged by whether every one of a counted number of orderings is equally likely to occur.

### SE Lens

The alternative to checking this claim empirically is to trust the `1 / 1,024` prediction purely from the counting argument, without ever generating real random draws to confirm it. The real cost of that alternative, in a real system relying on this reasoning — a security system assuming a search space is large enough to resist guessing, say — is a silent, unverified assumption standing in for a checked fact, exactly the gap this curriculum's evidence-over-assumption discipline (Lesson 22 onward) exists to close. Running the real simulation, as this unit does, costs one small, honest empirical check; it turns a plausible-sounding mathematical claim into a confirmed one.

---

## Concept Unit 5: Counting and Runtime

### The Problem

The fourth and final connection is the one this curriculum has already made the most concrete, across three entire lessons: a computation's runtime is very often, quite directly, a count — the count of steps, or calls, it actually performs.

### No isolated lab for this step

This concept has no code of its own to isolate — the connection is made directly below, using real numbers already established in Lessons 53 through 55.

### Applying It — Restating Three Lessons' Worth of Evidence as One Pattern

**Lesson 53's finding, restated as a counting fact:** `fib(30)`, unmemoized, makes `2,692,537` total calls (Lesson 54) — a real, countable number, and the *reason* `fib(30)` takes `144.195` ms (Lesson 54) rather than some other duration.

**Lesson 54's finding, restated as a counting fact:** `memo-fib(30)` makes only `59` total calls — a smaller counted number, directly producing the measured `0.334` ms.

**Lesson 55's finding, restated as a counting fact:** `table-fib(100000)` performs exactly one loop iteration per table position, `99,999` of them — a count directly, mechanically responsible for its measured `53`–`55` ms.

**Naming the pattern directly:** in every one of these three lessons, the runtime measured in milliseconds and the count of steps performed moved together, because the count of steps *is*, at bottom, what runtime measures — a computer performing a counted number of operations, at some roughly fixed cost per operation. Counting the steps a procedure will perform, before running it, predicts its runtime the same way Concept Unit 2 and 3 showed counting predicts a search space's memory cost.

### Walkthrough

- **The three restated findings from Lessons 53–55** — not new measurements, but the same real numbers already established there, now explicitly reframed as instances of one shared pattern: count predicts runtime.
- **"a computer performing a counted number of operations, at some roughly fixed cost per operation"** — the mechanical reason counting and runtime move together, stated plainly for the first time.

### CS Lens

This is the foundational insight underlying every algorithm-analysis technique the rest of Era III will build: if runtime is fundamentally a count of steps, then predicting runtime without running a program is a matter of counting those steps in advance — precisely what Lessons 71 through 74's "Big-O" and related notations will formalize. Also recognized in: a factory line's output time, predicted directly from counting the number of stations a product passes through; a delivery route's duration, predicted directly from counting the number of stops.

### SE Lens

The alternative to recognizing runtime as fundamentally a count is to treat every new procedure's speed as something that can only be discovered by timing it after the fact, the way this curriculum did for `fib`, `memo-fib`, and `table-fib` individually across three separate lessons. The real cost of that alternative, at scale, is exactly what motivates the rest of Era III: without a general way to *count* a procedure's steps from its structure alone, every new procedure requires its own separate, from-scratch timing experiment, with no way to predict a procedure's behavior on an input too large to actually run. Recognizing runtime as a countable quantity, as this unit does, costs nothing beyond restating already-measured evidence in a new light; it is exactly the recognition the rest of Era III exists to make precise and systematic.

---

## Closing

### Connect the pieces

One question, asked four ways, unified by counting:

1. **The shared root, named (Unit 1):** memory, time, and probability questions across five prior lessons all reduce to one question — how large is the relevant search space?
2. **Counting and size (Unit 2):** `all-subsets`' real `1,024` versus `1,048,576` counts, doubling with every added item, exactly as Lesson 51 and 52 already derived.
3. **Counting and storage (Unit 3):** the same counted spaces' real, measured memory cost — `14,254,080` versus `94,191,616` bytes — directly, if not perfectly proportionally, tracking the counted size.
4. **Counting and probability (Unit 4):** a real, `200,000`-trial empirical check confirming a counted space's size directly predicts the likelihood of any one specific outcome within it.
5. **Counting and runtime (Unit 5):** Lessons 53 through 55's already-measured call counts and millisecond timings, reframed as one shared pattern — runtime is, fundamentally, a count of steps performed.

Every one of these four connections used evidence this curriculum had already built and measured firsthand, in Lessons 39 and 51 through 55 — this lesson introduced no new procedure of its own, only the recognition that five separate measurements were, all along, expressions of one underlying principle.

### What breaks without this

Suppose an engineer, having read and understood Lessons 51 through 55 individually, never made the connection this lesson makes explicit — treating each new procedure's memory cost, runtime, and probability behavior as a separate mystery to be discovered by separate experiments, rather than recognizing all three as predictable in advance from counting alone. Faced with a genuinely new problem — not `fib`, not `all-subsets`, but something never measured before — that engineer would have no way to predict its behavior at a larger scale without simply running it there and hoping it finishes, exactly the "impossible to run" trap Era III's introduction describes. Recognizing counting as the shared root, as this lesson does, is what turns five isolated, already-measured facts into one transferable predictive tool, ready to apply to problems this curriculum hasn't built yet.

### Exercises

1. **Observe.** Pick any two procedures already built in this curriculum — one from Era I or early Era II, one from Lessons 49 through 55 — and identify, in prose, what "the relevant search space" is for each.
2. **Formalize.** For one of your Exercise 1 procedures, count its search space's size directly, using arithmetic alone, the way Concept Unit 2 counted `all-subsets`' `2ⁿ` subsets.
3. **Explain.** Run your Exercise 1 procedure at two different input sizes and measure its real memory cost with `/usr/bin/time -l` (or your platform's equivalent), the way Concept Unit 3 did — state whether the memory ratio matched your Exercise 2 count ratio, and if not, why not.
4. **Explain.** State, in your own words, why a computation's runtime is fundamentally a count, using one real, already-measured example from this curriculum other than the three used in Concept Unit 5.
5. **Formalize.** Design a probability question of your own about one of this curriculum's already-built search spaces — modeled on Concept Unit 4's "probability of drawing the empty subset" — and check it with a real simulation of at least `10,000` trials.

### Definition of done

- [ ] You can state, in one sentence, why memory cost, runtime, and probability are all, at root, questions about counting.
- [ ] You can count a search space's size directly from a procedure's recursive structure, without running the procedure.
- [ ] You can connect a counted search-space size to a real, measured memory cost, and explain honestly when and why the two don't scale in exact proportion.
- [ ] You can design and run a real empirical probability check against a counted search space, and explain whether the result matched the counting-based prediction.
- [ ] You completed Exercises 1–5 using at least one procedure not used as this lesson's own example.
- [ ] Commit your Exercise 2 through 5 findings, with a commit message stating the search space you counted and the size you found.
