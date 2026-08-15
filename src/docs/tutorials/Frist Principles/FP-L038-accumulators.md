# Lesson 38: Accumulators

**What you will build:** A third way to reverse a list — carrying the answer as it's being built, one extra parameter at a time, rather than combining partial results together after each recursive call returns — timed directly against Lesson 37's two earlier versions to confirm it solves `naive-reverse`'s actual problem. The transferable problem this lesson is actually about: Lesson 37 measured a real, dramatic slowdown and explained precisely why it happened, but never asked whether `naive-reverse`'s own basic shape — recurse first, combine afterward — could be restructured to avoid the problem entirely, while still being a recursive procedure in every sense already established.

**What you need to know first:** Lesson 6 (`FP-L006-state-and-change.md`) — specifically *state*, informally echoed here by an accumulator's role, though an accumulator itself is passed as an ordinary parameter, not mutated. Lesson 30 (`FP-L030-making-progress.md`) — specifically *progress measure*, reused directly to confirm the accumulator version still terminates correctly. Lesson 37 (`FP-L037-append-and-reverse.md`) — specifically `naive-reverse`, `fold-reverse`, and the real timing measurements, all directly extended in this lesson's own comparison.

**Terms introduced in this lesson**

- **Accumulator** — an extra parameter a recursive procedure carries through every call, holding the answer built up *so far*, rather than combining partial results together only after each recursive call returns. Where `naive-reverse` waited until a recursive call returned and then combined its result with the current item, an accumulator-based procedure updates the answer immediately, before making its next recursive call, and simply returns the accumulator itself once the base case is reached.

## Objects and methods used

None new. This lesson reuses `define`, `if`, `null?`, `cons`, `car`, `cdr`, and `get-internal-real-time`, all established in Lessons 28 through 37, applied to a new procedure shape.

---

## Concept Unit 1: Revisiting naive-reverse's Problem — Building the Result Piece by Piece

### The Problem

Lesson 37 explained precisely why `naive-reverse` was slow: each recursive call waited for a smaller call to fully finish, then combined its result with the current item using `append`, an operation whose own cost grew every time. It's worth asking directly whether the *combining-after-the-fact* structure itself is the actual problem, separate from the specific choice to use `append` — and whether building the answer incrementally, during the recursion rather than after it, avoids the problem at its root.

### No isolated lab for this step

This concept has no code of its own to isolate — the structural question is posed directly below, not through a construct with its own syntax.

### Applying It — Two Different Shapes of Recursion

**`naive-reverse`'s shape, examined once more:** compute the recursive call first (`(naive-reverse (cdr lst))`), then combine its result with the current item afterward.

**A genuinely different shape, described in prose before any code:** instead of waiting to combine after the recursive call returns, place the current item onto an already-in-progress answer *immediately*, and pass that updated answer *into* the next recursive call as an additional argument — so that by the time the base case is reached, the answer is already fully built, needing no further combining at all.

**Naming what this second shape would need, precisely:** a procedure taking not just the list still left to process, but also a second parameter representing the answer built so far — something no procedure in this curriculum has carried as an explicit parameter before.

### Walkthrough

- **`naive-reverse`'s combine-after shape, reappearing from Lesson 37** — examined here specifically for the structural choice (combine after the recursive call) rather than the specific operation (`append`) it happened to use.
- **The prose description of building the answer incrementally** — not yet code, but a precise statement of what Concept Unit 2 will actually build.
- **"a second parameter representing the answer built so far"** — a direct forward-reference to this lesson's central term, named formally in the next unit.

### CS Lens

This is the distinction between two fundamentally different shapes a recursive process can take: one where work happens *after* recursing (combining results on the way back up, the shape every procedure in this curriculum has used until now), and one where work happens *before* recursing (updating an in-progress answer on the way down, so nothing remains to be done once the base case returns). Also recognized in: proofreading a document by reading it once and marking every correction to apply afterward, versus correcting each error the moment it's found, leaving nothing to apply later; packing a suitcase by laying everything out and organizing it at the end, versus placing each item directly into its final position as you go; totaling a receipt by writing down every price and adding them all at the register, versus keeping a running total in your head as each item is scanned.

### SE Lens

The alternative to asking this structural question is to assume `naive-reverse`'s slowness is an unavoidable cost of recursion itself, rather than a specific, fixable consequence of *this* recursive shape. The real cost of that alternative would be giving up on recursion for performance-sensitive code entirely, when in fact — as the rest of this lesson demonstrates — a different recursive shape, still fully recursive in every sense this curriculum has established, avoids the problem completely. Asking the structural question explicitly, as this unit does, costs nothing beyond the reframing itself; it is what makes Concept Unit 2's solution feel like a natural next step rather than an unmotivated trick.

---

## Concept Unit 2: An Accumulator — an Extra Parameter Carrying the Answer So Far

### The Problem

Concept Unit 1 described, in prose, a procedure that builds its answer during the recursion rather than after it. Turning that description into real code means writing a procedure with two parameters instead of one, and figuring out exactly what happens to each of them at every step.

### The New Code — Type It Yourself

```scheme
(define (reverse-acc lst acc)
  (if (null? lst)
      acc
      (reverse-acc (cdr lst) (cons (car lst) acc))))
```

### The Updated Project

This is `reverse-acc.scm`, in full:

```scheme
(define (reverse-acc lst acc)
  (if (null? lst)
      acc
      (reverse-acc (cdr lst) (cons (car lst) acc))))

(display (reverse-acc (list 1 2 3 4 5) '()))
(newline)
```

### Reference Source

Concept Unit 1's prose description, translated directly into a two-parameter recursive procedure.

### Files affected

Created: `reverse-acc.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile reverse-acc.scm
(5 4 3 2 1)
```

Verified this session — correctly reversed, matching both `naive-reverse.scm` and `fold-reverse.scm`'s already-verified results.

### Mechanical Walkthrough

- **`(define (reverse-acc lst acc) ...)`** — first appearance of *accumulator*, `acc`, a second parameter alongside `lst`, holding the reversed list built so far.
- **`(if (null? lst) acc ...)`** — the base case: once nothing is left in `lst`, the accumulator itself, already fully built, *is* the answer — no further combining required, unlike every earlier base case in this curriculum, which returned a fixed starting value rather than an already-complete result.
- **`(reverse-acc (cdr lst) (cons (car lst) acc))`** — the recursive case: `(cons (car lst) acc)` places the current item onto the *front* of the accumulator immediately, and the updated accumulator, not the original, is passed into the next recursive call — a reappearance of *progress measure* (Lesson 30): `lst` still strictly shrinks toward `'()` with every call, exactly as every earlier recursive procedure required, even though `acc` is simultaneously growing.
- **The call site, `(reverse-acc (list 1 2 3 4 5) '())`** — the accumulator starts at `'()`, the correct "nothing built yet" starting value, exactly the way `fold`'s `base` argument started at `'()` in Lesson 36.

### CS Lens

This is accumulator-passing style: threading a partial result through a recursion as an ordinary parameter, updated before each recursive call rather than combined after it returns. Also recognized in: a relay race baton, carried and physically handed off by each runner in turn, rather than each runner's individual time being combined into a total only after the race finishes; a tour guide's running head-count, updated the instant each visitor passes through a gate, rather than counted from scratch at the end; an assembly line's partially built product, physically carried from station to station and added to directly, rather than each station's contribution being combined afterward; a savings account's running balance, updated with each deposit immediately, rather than every deposit being summed only when the balance is finally checked.

### SE Lens

The alternative to threading an accumulator explicitly is to keep combining results only after recursive calls return, the way `naive-reverse` did, accepting whatever cost that combining step happens to carry. The real cost of that alternative was exactly Lesson 37's measured, dramatic slowdown. Threading an accumulator, as this unit does, costs one additional parameter and a moment's care in getting its starting value and update step right; it buys a recursive procedure whose per-call work — one `cons`, nothing more — no longer grows with how much of the list has already been processed.

---

## Concept Unit 3: Comparing All Three Versions — Timing the Accumulator

### The Problem

`reverse-acc` looks, by inspection, like it should avoid `naive-reverse`'s problem — each recursive call does a fixed, small amount of work (`cons`), not a call to an operation whose cost grows. This needs to be confirmed the same way Lesson 37 confirmed everything else in this lesson's family: by actually measuring it.

### No isolated lab for this step

This concept has no code of its own to isolate — the three-way timing comparison is demonstrated directly below, reusing Lesson 37's own timing harness, not through a new construct with its own syntax.

### Applying It — Three Versions, One Measurement

**All three reversal procedures, timed on the identical input, using Lesson 37's own `time-it` procedure:**

```
$ guile timing.scm
naive-reverse (4000 items): 525.394 ms
fold-reverse (4000 items): 0.104 ms
clean-reverse/accumulator (4000 items): 0.753 ms
```

Verified this session. `reverse-acc` (wrapped, per Concept Unit 4, as `clean-reverse`) finishes in well under a millisecond — roughly seven hundred times faster than `naive-reverse` on the identical input, and in the same general range as `fold-reverse`, though not quite as fast (a difference this curriculum will be equipped to explain precisely once `fold`'s own internal implementation is examined in later lessons).

**Confirming this matches Concept Unit 2's structural prediction, not just a coincidence:** `reverse-acc` calls `cons` exactly once per item, doing a fixed amount of work each time, with no call to any operation whose own cost depends on a growing argument — precisely the property `naive-reverse` lacked, and precisely why the two differ so dramatically.

### Walkthrough

- **`naive-reverse`, reappearing from Lesson 37 at `525` milliseconds** — the baseline this comparison is measured against.
- **`fold-reverse`, reappearing from Lesson 37 at `0.104` milliseconds** — the fastest of the three, already established.
- **`clean-reverse`, this lesson's accumulator version, at `0.753` milliseconds** — dramatically faster than `naive-reverse`, confirming Concept Unit 2's structural change actually solved the measured problem, not merely looked like it should.

### CS Lens

This is the completion of Lesson 37's own investigation: having identified precisely why `naive-reverse` was slow, this lesson proposes a structural fix and then actually measures it, rather than trusting the fix by inspection alone — exactly the measure-don't-guess discipline Lesson 37, Concept Unit 4, already insisted on. Also recognized in: a proposed fix to a slow database query, actually benchmarked against the original rather than merely assumed to be faster because it "looks more efficient"; a proposed redesign of a manufacturing process, actually timed on the factory floor rather than trusted from the blueprint alone; a proposed shortcut route, actually driven and timed rather than assumed faster from the map; a new medical treatment, actually tested rather than trusted on theoretical grounds alone.

### SE Lens

The alternative to measuring `reverse-acc` is to trust Concept Unit 2's structural reasoning — "each call does fixed work, so it should be fast" — without ever confirming it against real, running code. The real cost of that alternative is exactly the risk this entire lesson family has been built to guard against: a plausible-sounding structural argument is evidence, in Lesson 22's sense, not proof, and an unnoticed detail (perhaps `cons` itself turned out to be expensive somehow, or the recursion itself carried some other hidden cost) could have invalidated the reasoning. Measuring directly, as this unit does, costs nothing beyond running the same timing harness already built in Lesson 37; it turns "should be fast" into a checked, confirmed fact.

---

## Concept Unit 4: Wrapping an Accumulator Procedure Behind a Clean Interface

### The Problem

`reverse-acc` requires its caller to supply a second argument, `'()`, every single time — and to know, correctly, that `'()` is the right starting value to supply. This is an implementation detail nobody calling "reverse a list" should actually need to think about, exactly the kind of unnecessary burden Lesson 7's original argument for named, reusable functions already warned against.

### The New Code — Type It Yourself

```scheme
(define (clean-reverse lst)
  (reverse-acc lst '()))
```

### The Updated Project

This is `clean-reverse.scm`, in full:

```scheme
(define (reverse-acc lst acc)
  (if (null? lst)
      acc
      (reverse-acc (cdr lst) (cons (car lst) acc))))

(define (clean-reverse lst)
  (reverse-acc lst '()))

(display (clean-reverse (list 1 2 3 4 5)))
(newline)
```

### Reference Source

`reverse-acc.scm` (Concept Unit 2), wrapped in a second, single-argument procedure.

### Files affected

Created: `clean-reverse.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

`reverse-acc`, defined in the same file.

### Run It — Show the Real Output

```
$ guile clean-reverse.scm
(5 4 3 2 1)
```

Verified this session. `(clean-reverse (list 1 2 3 4 5))` needs only the list itself — no accumulator argument, no knowledge of `reverse-acc`'s existence at all.

### Mechanical Walkthrough

- **`(define (clean-reverse lst) (reverse-acc lst '()))`** — a reappearance of *composition* (Lesson 8) in spirit, though here one procedure simply calls another with a fixed, correct starting value supplied automatically, rather than combining two independently useful procedures.
- **`clean-reverse`'s own single parameter, `lst`** — confirms the wrapping procedure presents exactly the interface Lesson 7 already established a well-designed function should: everything the caller actually needs to supply, nothing they shouldn't have to think about.
- **`reverse-acc` itself, still fully usable directly, for anyone who does need to supply a non-empty starting accumulator** — not a new syntactic element, but a note that wrapping doesn't hide or remove the more general procedure underneath; it simply provides a more convenient entry point for the common case.

### CS Lens

This is the same interface-design principle Lesson 9's preconditions and Lesson 13's predicates already valued: separating what a procedure actually needs to do its job internally from what a caller should reasonably be expected to supply. Also recognized in: a car's ignition, presenting a single "start" action to the driver while an entire internal sequence of fuel, spark, and starter-motor coordination happens automatically underneath; a coffee machine's single "brew" button, hiding water heating, grinding, and timing behind one simple interface; a restaurant's menu item, presenting one ordered dish while hiding the specific sequence of kitchen steps that produces it; a library's public checkout process, hiding the internal cataloging and shelving logic a patron never needs to think about.

### SE Lens

The alternative to wrapping `reverse-acc` is to expose it directly, requiring every caller to remember and correctly supply `'()` as a second argument every time. The real cost of that alternative is a real, avoidable source of error: a caller who forgets, or supplies the wrong starting value by mistake, gets a silently wrong result — exactly Lesson 29's warning about a present-but-wrong value, applied here to a caller-supplied argument rather than a base case's own guard. Wrapping `reverse-acc` behind `clean-reverse`, as this unit does, costs one small additional procedure; it removes an entire category of caller mistake by making the correct starting value automatic rather than remembered.

---

## Concept Unit 5: Accumulators Generalize Beyond Reverse

### The Problem

Everything built so far in this lesson has been specific to reversing a list. It's worth confirming, directly, that accumulator-passing is a general technique — applicable to other list-processing procedures already built in this curriculum, not a trick specific to reversal.

### The New Code — Type It Yourself

```scheme
(define (sum-acc lst acc)
  (if (null? lst)
      acc
      (sum-acc (cdr lst) (+ (car lst) acc))))
```

### The Updated Project

This is `sum-acc.scm`, in full:

```scheme
(define (sum-acc lst acc)
  (if (null? lst)
      acc
      (sum-acc (cdr lst) (+ (car lst) acc))))

(define (clean-sum lst)
  (sum-acc lst 0))

(display (clean-sum (list 91 85 72)))
(newline)
```

### Reference Source

`sum-list` (Lesson 33), rewritten using this lesson's accumulator-passing shape rather than its original combine-after-the-fact shape.

### Files affected

Created: `sum-acc.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile sum-acc.scm
248
```

Verified this session — matching `sum-list.scm`'s already-verified result exactly.

### Mechanical Walkthrough

- **`(define (sum-acc lst acc) ...)`** — a reappearance of this lesson's accumulator shape, applied here to summing rather than reversing.
- **`(if (null? lst) acc ...)`** — the base case, again simply returning the accumulator directly, exactly as `reverse-acc`'s base case did.
- **`(sum-acc (cdr lst) (+ (car lst) acc))`** — the recursive case: `(+ (car lst) acc)` updates the running total immediately, before recursing, in direct structural parallel to `reverse-acc`'s `(cons (car lst) acc)` — the only difference between the two procedures is `cons` versus `+`, exactly the kind of single-blank difference Lesson 33's original template already made visible for combine-after-the-fact procedures.
- **`clean-sum`, wrapping `sum-acc` with a starting accumulator of `0`** — a reappearance of Concept Unit 4's wrapping pattern, with `0` playing the role `'()` played for reversal — the correct "nothing accumulated yet" value for addition specifically.

### CS Lens

This is confirmation that accumulator-passing, like structural recursion (Lesson 33) before it, is a general shape applicable across many specific problems, not a one-off solution invented only for reversal. Also recognized in: a cash register's running total, updated immediately with each item scanned, using the identical "update the running value, then continue" shape regardless of whether it's tracking a sum, a count, or a running maximum; a fitness tracker's running step count, updated the same way regardless of what specific quantity (steps, calories, distance) is being tracked; a scoreboard's running tally, updated identically whether tracking points, fouls, or time remaining; a warehouse's running inventory count, updated the same way for any specific item being tracked.

### SE Lens

The alternative to checking whether accumulator-passing generalizes is to treat `reverse-acc` as a clever, isolated solution to one specific problem, never recognizing it as an instance of a broader, reusable technique. The real cost of that alternative is losing exactly the kind of transfer this curriculum has valued since Lesson 33's own template — a learner who only knows "accumulators fix `reverse`" cannot recognize the identical opportunity the next time a combine-after-the-fact procedure turns out to be unexpectedly slow. Rebuilding `sum-list` in accumulator-passing style, as this unit does, costs one small additional procedure; it confirms the technique itself, not merely one lucky application of it, is what's actually been learned.

---

## Closing

### Connect the pieces

Three versions of reverse, and one accumulator-style rebuild of an earlier procedure, traced through every unit built in this lesson, start to finish:

1. **The structural question posed (Unit 1):** could building the answer during recursion, rather than combining it afterward, avoid `naive-reverse`'s problem entirely?
2. **The accumulator built (Unit 2):** `reverse-acc`, carrying the reversed list as it's built, with a base case that simply returns the finished accumulator.
3. **The fix confirmed by measurement (Unit 3):** `reverse-acc`, wrapped as `clean-reverse`, timed at under one millisecond on 4000 items — roughly seven hundred times faster than `naive-reverse`.
4. **A clean interface restored (Unit 4):** `clean-reverse`, hiding the accumulator's starting value from callers entirely.
5. **The technique generalized (Unit 5):** `sum-acc`, the identical accumulator shape applied to summing, matching `sum-list`'s already-verified result.

Unit 3's measurement directly answers Unit 1's own opening question — not with a fresh example, but with the exact procedure Unit 2 built, checked against the exact baseline Lesson 37 already established.

### What breaks without this

Suppose a team, having read Lesson 37's warning about `naive-reverse`'s quadratic cost, concluded that recursion itself was simply unsuitable for building up results and switched every affected procedure to some other approach entirely, discarding recursion's own benefits — direct correspondence to a problem's recursive structure (Lesson 33), straightforward correctness reasoning (Lesson 23), explicit termination guarantees (Lesson 30) — along with the one specific problem (combine-after-the-fact using an expensive operation) that was actually responsible for the slowdown. This lesson's entire point is that such a wholesale retreat would have been unnecessary: the actual fix, accumulator-passing, is still fully recursive, still built from a base case and a recursive case, still subject to every guarantee this curriculum has already established about recursive procedures — it simply restructures *when* combining happens, not whether recursion is used at all. Restoring this lesson's specific diagnosis and fix — recognize the combine-after-the-fact shape as the actual cause, and restructure to an accumulator rather than abandoning recursion — is what keeps a real performance lesson from being over-generalized into an unnecessary rejection of a technique that was never actually the problem.

### Exercises

1. **Observe.** Take one of your own combine-after-the-fact procedures from Lesson 33 or Lesson 35's exercises and identify exactly where it combines a recursive call's result with the current item, the way Concept Unit 1 examined `naive-reverse`'s own combining step.
2. **Formalize.** Rewrite your Exercise 1 procedure in accumulator-passing style, following `reverse-acc`'s exact shape: an extra parameter, a base case that returns the accumulator directly, and a recursive case that updates the accumulator before recursing.
3. **Explain.** Wrap your Exercise 2 procedure behind a clean, single-argument interface, the way Concept Unit 4 wrapped `reverse-acc` as `clean-reverse`, supplying the correct starting accumulator value automatically.
4. **Formalize.** Using Lesson 37's timing harness, compare your Exercise 1 and Exercise 3 procedures on a large input, the way Concept Unit 3 compared `naive-reverse` and `clean-reverse`.
5. **Explain.** If your Exercise 1 procedure didn't actually have `naive-reverse`'s specific problem (no operation whose cost grows with a shrinking or growing argument), explain, honestly, whether accumulator-passing still changed its measured performance, and why or why not.

### Definition of done

- [ ] You can state, in your own words, the structural difference between combining a result after a recursive call returns and updating an accumulator before making the next call.
- [ ] You can write an accumulator-passing version of a procedure you've already built, correctly identifying the accumulator's starting value and update step.
- [ ] You can wrap an accumulator-passing procedure behind a clean, single-argument interface.
- [ ] You can measure, using real timing, whether restructuring a procedure into accumulator-passing style actually changed its performance, rather than assuming it always will.
- [ ] You completed Exercises 1–5 using a procedure of your own, not `reverse` or `sum-list`.
- [ ] Commit your Exercise 2 and Exercise 3 procedures, along with your Exercise 4 timing results, with a commit message stating whether accumulator-passing made a measurable difference for your specific procedure.
