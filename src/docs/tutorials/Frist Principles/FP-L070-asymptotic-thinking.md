# Lesson 70: Asymptotic Thinking

**What you will build:** no new procedure — `linear-search` and `binary-search` (Lesson 68), measured again, at a scale small enough to reveal something Lesson 68 never showed: real, measured evidence that `binary-search` is not always faster. Real numbers this session: at `n = 2`, `linear-search` takes **`0.000808`** ms against `binary-search`'s **`0.000962`** ms — linear wins. At `n = 5`, they're essentially tied. By `n = 10`, binary search pulls ahead, and at `n = 1,000,000`, `linear-search` takes **`112.41`** ms against `binary-search`'s **`0.00555`** ms — binary wins by roughly `20,000×`. The transferable point: Lesson 69 ordered six growth-rate categories, and that ordering is true — but it's a claim about what happens as `n` grows *large*, not a claim that the "better" category always wins at every input size. This lesson names that scope precisely: asymptotic thinking.

**What you need to know first:** Lesson 68 (`FP-L068-repeated-halving.md`) — specifically `linear-search` and `binary-search`, both reused unchanged, remeasured at a scale Lesson 68 never tested. Lesson 69 (`FP-L069-growth-rates.md`) — specifically the six-category growth-rate ordering, whose precise scope this lesson clarifies.

**Terms introduced in this lesson**

- **Asymptotic** — describing behavior in the limit, as `n` grows arbitrarily large, ignoring what happens at any fixed, small value of `n`. "Asymptotically faster" means faster once `n` is large enough — not faster at every `n`.
- **Constant overhead** — a fixed cost, paid once per call regardless of scale, that doesn't grow with `n`. `binary-search`'s extra arithmetic (computing a midpoint, an extra comparison per step) is constant overhead — small, but real, and enough to lose to a simpler algorithm when `n` itself is tiny.
- **Crossover point** — the input size at which one algorithm's real cost overtakes another's, moving from one being faster to the other being faster. This lesson measures a real crossover point directly, somewhere between `n = 5` and `n = 10`.

---

## Concept Unit 1: The Small-n Surprise

### The Problem

Lesson 69 established binary search as asymptotically better than linear search — logarithmic beats linear in the growth-rate ordering. It's worth checking directly whether "better" holds at *every* input size, including very small ones, rather than assuming a growth-rate category settles every question.

### No isolated lab for this step

This concept has no code of its own to isolate — the real measurement is demonstrated directly below, using `linear-search` and `binary-search` unchanged from Lesson 68.

### Applying It — Real Timing at Tiny n

**Measuring each search's cost by averaging over a million real repeated calls (a single call is too fast to time reliably on its own):**

```
$ guile asymptotic.scm
n=2 linear=8.07598e-4 ms  binary=9.61837e-4 ms
n=5 linear=0.001173098 ms  binary=0.001182156 ms
n=10 linear=0.001698513 ms  binary=0.001477704 ms
n=50 linear=0.006395674 ms  binary=0.001931545 ms
```

Verified this session — at `n = 2`, `linear-search` (`0.000808` ms) is genuinely *faster* than `binary-search` (`0.000962` ms). At `n = 5`, the two are nearly indistinguishable. By `n = 10`, `binary-search` has pulled ahead, and at `n = 50`, it's clearly, measurably faster.

### Walkthrough

- **The real `n = 2` result, linear beating binary** — direct, measured evidence contradicting a naive reading of Lesson 69's ordering as "binary search is always faster."
- **The gradual shift from `n = 2` through `n = 50`** — shows the advantage isn't a sudden switch but a genuine crossover, worth understanding rather than dismissing as noise.

### CS Lens

This is real, direct evidence of a phenomenon every experienced engineer eventually encounters: a "better" algorithm, in the growth-rate sense, that's measurably worse at realistic small scales, because growth-rate categories describe a trend, not a guarantee at every point. Also recognized in: a highway route that's faster than city streets for a long trip but slower for a two-block trip, once the time spent reaching the highway on-ramp is counted; a bulk-shipping method that's cheaper per unit at large volumes but more expensive than a simple envelope for a single small item.

### SE Lens

The alternative to measuring this directly is to assume Lesson 69's growth-rate ordering settles every performance question, at every scale, without exception. The real cost of that alternative, made precise in Concept Unit 5, is choosing an unnecessarily complex algorithm for a situation where `n` is reliably small — genuinely worse code, for no real benefit, based on a misapplied rule of thumb. Measuring directly at small `n`, as this unit does, is what catches this specific, easy-to-make mistake before it happens.

---

## Concept Unit 2: Why This Happens — Constant Overhead vs. Growth Rate

### The Problem

Concept Unit 1's crossover is real, but it needs explaining, not just observing — following this curriculum's standing discipline of naming the mechanism behind a measurement, not leaving it as an unexplained fact.

### No isolated lab for this step

This concept has no code of its own to isolate — the explanation is stated directly below, using both procedures' own structure from Lesson 68.

### Applying It — Naming the Mechanism

**Comparing what each procedure does per step, structurally:** `linear-search`'s loop body does one thing: compare the current element to the target. `binary-search`'s loop body does more: compute a midpoint (an addition and a division), then compare, then decide which half to keep — genuinely more work per single step.

**Naming this extra, per-step work:** constant overhead — cost that doesn't depend on `n`, paid once per call (or per step) regardless of how large the search space is.

**Explaining the crossover directly:** at `n = 2`, `linear-search` needs at most `2` simple comparisons; `binary-search` needs `1` comparison, but that comparison costs more (midpoint arithmetic included) than each of `linear-search`'s. The *category* difference (logarithmic vs. linear) hasn't kicked in yet at such a small scale — there simply aren't enough steps yet for `binary-search`'s per-step efficiency to overcome its higher per-step cost. By `n = 50`, `linear-search` needs up to `50` steps, while `binary-search` needs only about `6` — enough steps now that the *category* difference dominates the *constant* difference.

### Walkthrough

- **"genuinely more work per single step"** — the precise, structural reason for `binary-search`'s constant overhead, traced directly to its own code from Lesson 68.
- **"there simply aren't enough steps yet"** — the precise explanation for *why* small `n` favors the category with less overhead, regardless of which category is asymptotically better.

### CS Lens

This is the general principle behind every real "is the fancy algorithm worth it" engineering decision: a more sophisticated algorithm's per-step efficiency only pays for itself once there are enough steps for that efficiency to matter, and knowing roughly where that crossover point falls is exactly what separates an informed choice from a reflexive one. Also recognized in: a sophisticated compiler optimization that only pays off in a loop that runs enough iterations to amortize its own analysis cost; a specialized tool that's more efficient once mastered, but costs more time to set up than a simpler tool is worth for a one-off task.

### SE Lens

The alternative to naming constant overhead explicitly is to treat Concept Unit 1's crossover as a mysterious anomaly rather than a predictable consequence of each algorithm's actual per-step cost. The real cost of that alternative is losing the ability to *predict* roughly where a crossover point will fall for a new pair of algorithms, without measuring first. Naming the mechanism precisely, as this unit does, is what turns "binary search is sometimes slower, for some reason" into "binary search is slower exactly when `n` is too small for its lower step count to outweigh its higher per-step cost" — a specific, transferable understanding.

---

## Concept Unit 3: Defining "Asymptotic" Precisely

### The Problem

Lesson 69's growth-rate ordering is true, and Concept Unit 1's crossover is also true — both, at once, without contradiction. This requires stating precisely what Lesson 69's ordering was actually a claim *about*.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below.

### Applying It — Stating the Precise Scope

**The precise claim Lesson 69's ordering makes:** as `n` grows arbitrarily large, without bound, a logarithmic algorithm's cost will *eventually* fall below a linear algorithm's cost, and will *stay* below it for every larger `n` after that point.

**What the claim does not say:** it says nothing about any specific, fixed `n` — not `n = 2`, not `n = 5`, not even `n = 10`. It's a claim about the *trend*, checked only in the limit.

**Naming this precisely:** asymptotic — describing behavior "at the limit," as `n → ∞`. "Binary search is asymptotically faster than linear search" is a precisely true, narrower claim than "binary search is faster" — the word "asymptotically" is not decoration, it's the entire scope of the claim.

**Confirming the claim is honestly true, even given Concept Unit 1's evidence:** nothing in Concept Unit 1 contradicts the asymptotic claim — `binary-search`'s advantage did keep growing, without limit, past `n = 10`, exactly as the asymptotic claim requires. The crossover at small `n` and the asymptotic dominance at large `n` are both real, simultaneously, describing different regions of the identical data.

### Walkthrough

- **"eventually fall below... and stay below it"** — the precise, two-part definition of what an asymptotic comparison actually guarantees: a crossover exists, and after it, the ordering holds forever.
- **"the word 'asymptotically' is not decoration"** — an explicit correction of a natural but imprecise reading of Lesson 69's ordering, made necessary by Concept Unit 1's real evidence.

### CS Lens

This is the precise, technical meaning behind a word this curriculum will use constantly from here forward — every future growth-rate comparison in this curriculum is implicitly an *asymptotic* one, exactly the way Lesson 69's ordering must now be understood. Also recognized in: a claim that "a marathon runner is faster than a sprinter, over long enough distances" — true asymptotically (over distance, not time), while remaining false, and understood to be false, over the sprinter's own short specialty distance; an economist's claim that "compound interest eventually outpaces any fixed annual bonus" — true in the limit, while acknowledging the bonus might exceed compound growth for the first several years.

### SE Lens

The alternative to defining "asymptotic" precisely is to keep using growth-rate comparisons loosely, as if they applied universally at every scale. The real cost of that alternative is exactly Concept Unit 1's surprise, repeated indefinitely across every future comparison this curriculum makes — a nagging, unresolved tension between measured evidence and stated theory. Defining the term's precise scope, as this unit does, resolves that tension permanently: the theory was never wrong, its scope was simply narrower than an informal reading suggested.

---

## Concept Unit 4: Confirming the Asymptotic Claim at Real Scale

### The Problem

Concept Unit 3's definition promises binary search's advantage holds, and grows, past the crossover point, forever. This is worth confirming directly, at a scale far beyond anything Concept Unit 1 tested.

### No isolated lab for this step

This concept has no code of its own to isolate — the real measurement is demonstrated directly below.

### Applying It — Real Timing at n = 1,000,000

```
$ guile asymptotic3.scm
n=1000000 linear=112.41153 ms  binary=0.00554949 ms
```

Verified this session — at `n = 1,000,000`, `linear-search` takes `112.41` ms; `binary-search` takes `0.00555` ms — a real, measured advantage of roughly `20,000×`, dwarfing even Lesson 68's own `n = 1,000,000` worst-case measurement (`115.818` ms versus `0.062` ms, a real single lookup rather than this unit's averaged repeated-call measurement).

**Connecting directly to Concept Unit 1's crossover:** the gap that was `0.000154` ms in `linear-search`'s *favor* at `n = 2` has become a `112.4` ms gap in `binary-search`'s favor at `n = 1,000,000` — not merely reversed, but reversed by a margin that keeps growing without any sign of leveling off, exactly what "asymptotically faster" promises and nothing less.

### Walkthrough

- **The real `112.41` ms versus `0.00555` ms measurement, at genuine scale** — direct confirmation that the asymptotic claim, precisely stated in Concept Unit 3, holds exactly as promised.
- **The explicit before-and-after comparison, `n = 2` versus `n = 1,000,000`** — ties this unit's evidence directly back to Concept Unit 1's, completing the full picture: a real crossover, followed by real, unbounded, growing dominance.

### CS Lens

This is the complete, honest picture asymptotic thinking is meant to convey: a real crossover at small scale, and real, ever-widening dominance at large scale, both true, both measured, neither one contradicting the other once "asymptotic" is understood precisely. Also recognized in: a new employee who's initially slower than an experienced one at a task due to a learning curve (the "constant overhead" of onboarding), but who, once past that crossover, remains faster indefinitely due to a genuinely better working method.

### SE Lens

The alternative to confirming the large-scale claim directly, after Concept Unit 1's small-scale surprise, is to leave the asymptotic claim itself unverified, trusting Concept Unit 3's definition without checking it holds in practice. The real cost of that alternative would be an unfinished argument — Concept Unit 1 alone might wrongly suggest growth-rate categories don't matter much in practice. Measuring at real scale, as this unit does, is what confirms they matter enormously, exactly where the asymptotic claim says they should.

---

## Concept Unit 5: When Asymptotic Thinking Doesn't Settle the Question

### The Problem

Both halves of this lesson's evidence are real. It's worth stating honestly, as a practical engineering conclusion, when each half should actually guide a real decision.

### No isolated lab for this step

This concept has no code of its own to isolate — the conclusion is stated directly below, drawing on every result gathered in this lesson.

### Applying It — A Precise, Honest Engineering Conclusion

**When the asymptotic ordering should drive a real decision:** whenever `n` might grow large, or isn't known in advance, or the code might be reused somewhere `n` turns out to be large — exactly the situations Lesson 56's introduction to Era III was concerned with.

**When it shouldn't, by itself, settle the question:** if `n` is reliably, permanently small — say, a lookup table with `5` fixed entries that will never grow — Concept Unit 1's real evidence shows the "asymptotically worse" algorithm can be the genuinely better engineering choice: simpler code, and, at that specific, known scale, also faster.

**Stating the actual discipline this lesson leaves behind:** know which category `n` falls into for your actual problem before choosing based on asymptotic behavior alone — and when in doubt, measure directly, the way every real number in this lesson was obtained, rather than assuming either "growth rate is everything" or "growth rate doesn't matter in practice."

### Walkthrough

- **The two conditions, stated as a direct decision rule** — a practical synthesis of Concept Unit 1 through 4's evidence, not a new abstract principle.
- **"measure directly"** — the closing return to this curriculum's central, standing discipline (Lesson 22 onward), applied here to a nuance sophisticated enough that abstract reasoning alone, without this lesson's real crossover evidence, could easily have missed it.

### CS Lens

This is the mature, complete understanding of algorithmic complexity that experienced engineers actually apply: growth-rate categories matter enormously at scale, and are close to irrelevant at genuinely fixed, small scale — knowing which situation applies is itself a skill, and this lesson's real crossover evidence, at a specific, measured `n = 5`–`10` boundary, is exactly the kind of concrete grounding that makes the skill teachable rather than vague. Also recognized in: a chef choosing a simple, direct technique for a small dinner party and a more elaborate, scalable process for catering a large event — the "better for scale" technique isn't simply better, full stop, it's better *at scale*.

### SE Lens

The alternative to this nuanced conclusion is either extreme: always reaching for the asymptotically superior algorithm regardless of actual scale, adding unnecessary complexity for no real benefit at small, fixed `n`; or always favoring the simplest code, ignoring growth-rate analysis entirely, risking exactly the catastrophic large-scale cost this curriculum has measured repeatedly since Lesson 51. The real cost of either extreme is a decision made from a rule of thumb rather than from the actual shape of the problem at hand. This lesson's conclusion — know your `n`, and measure when unsure — is what this entire curriculum's evidence discipline has been building toward since Lesson 22, now applied to its own most important piece of vocabulary.

---

## Closing

### Connect the pieces

One surprising measurement, explained, defined, confirmed, and honestly scoped:

1. **The surprise (Unit 1):** `binary-search` measurably *slower* than `linear-search` at `n = 2`, real evidence, not noise.
2. **The mechanism, named (Unit 2):** constant overhead — more work per step, only worth paying once there are enough steps for a lower growth rate to compensate.
3. **The precise term, defined (Unit 3):** asymptotic — a claim about behavior as `n → ∞`, not about any single, fixed `n`.
4. **The large-scale claim, confirmed (Unit 4):** a real, measured `20,000×` advantage at `n = 1,000,000`, exactly as the asymptotic claim promised.
5. **The honest, practical conclusion (Unit 5):** growth-rate categories matter enormously when `n` might grow large, and can matter little, or even favor the "worse" category, when `n` is reliably small.

Nothing in this lesson contradicts Lesson 69's growth-rate ordering — every piece of evidence here refines *what kind of claim* that ordering actually makes, using real, measured data at both extremes to show the refinement is necessary, not merely academic.

### What breaks without this

Suppose an engineer, having learned Lesson 69's growth-rate ordering without this lesson's refinement, encountered a small, fixed-size configuration lookup — say, checking one of `4` possible settings — and, reasoning "binary search is asymptotically better," replaced a simple linear check with a more complex binary-search implementation. Based on this lesson's own real evidence at `n = 2` through `5`, that "improvement" would likely make the code both slower, by a small but real margin, and more complex, for zero benefit, because the asymptotic advantage this engineer was chasing never actually arrives at that fixed, small scale. Understanding asymptotic thinking's precise scope, as this lesson derived directly from real measurement, is what prevents applying a true theorem in a situation where it simply doesn't say what it might seem to say.

### Exercises

1. **Observe.** Using `linear-search` and `binary-search` (Lesson 68), measure their real timing at three small values of your own choosing, between `n = 1` and `n = 20`, following Concept Unit 1's averaged-repeated-call methodology.
2. **Formalize.** Identify the approximate crossover point in your Exercise 1 data — the smallest `n` where `binary-search` becomes faster — and compare it to this lesson's own observed crossover between `n = 5` and `n = 10`.
3. **Explain.** State, in your own words, the precise difference between "binary search is faster" and "binary search is asymptotically faster," using Concept Unit 3's definition.
4. **Formalize.** Choose two other already-built procedures from this curriculum representing two different growth-rate categories (Lesson 69), and measure whether a similar small-`n` crossover exists between them.
5. **Explain.** Using Concept Unit 5's decision rule, describe a real or hypothetical situation where choosing the asymptotically worse algorithm would be the correct engineering decision, and justify it using your own reasoning about the actual, known scale involved.

### Definition of done

- [ ] You can state precisely what "asymptotically faster" means, and what it does not claim about any specific, fixed input size.
- [ ] You can explain constant overhead and why it causes small-`n` crossovers between algorithms of different growth-rate categories.
- [ ] You can measure a real crossover point between two algorithms of your own choosing.
- [ ] You can state a practical decision rule for when growth-rate category should, and shouldn't, drive a real engineering choice.
- [ ] You completed Exercises 1–5, including a real, measured crossover point different from this lesson's own `linear-search`-versus-`binary-search` example.
- [ ] Commit your Exercise 1, 2, and 4 findings, with a commit message stating the crossover points you measured.
