# Lesson 39: Tail Recursion

**What you will build:** A precise, checkable test for exactly the structural difference Lesson 29 and Lesson 38 both stumbled into without naming it, plus a tail-recursive rewrite of `factorial` that computes `10000!` — a 35,660-digit number — without the memory cost the original version would have paid. The transferable problem this lesson is actually about: Lesson 29's `broken-factorial.scm` grew from 830 megabytes to over 2 gigabytes while Lesson 30's `countdown-by-2` merely hung, using almost no extra memory at all, and this curriculum never explained why those two failures looked so different. The answer is the same structural distinction that made Lesson 38's accumulators fast — now named, measured, and given a precise test.

**What you need to know first:** Lesson 29 (`FP-L029-base-cases.md`) — specifically `broken-factorial.scm`'s real, measured memory growth, revisited directly. Lesson 30 (`FP-L030-making-progress.md`) — specifically `countdown-by-2`'s different failure signature, revisited directly. Lesson 38 (`FP-L038-accumulators.md`) — specifically `reverse-acc` and `sum-acc`'s accumulator shape, shown here to be exactly what makes tail-call optimization possible.

**Terms introduced in this lesson**

- **Tail position** — the position of a call that is the very last thing a procedure does before returning — nothing happens to its result except handing it directly back. `(reverse-acc (cdr lst) (cons (car lst) acc))`, in Lesson 38's `reverse-acc`, is in tail position: once it returns, `reverse-acc` itself has nothing left to do but return that same value. `(factorial (- n 1))`, inside `(* n (factorial (- n 1)))`, is not in tail position: `factorial` still has to multiply the result by `n` before it can return.
- **Tail call optimization** — an interpreter's ability to recognize a call in tail position and reuse the current call's own stack space for it, rather than keeping the current call waiting and allocating new space for the next one. This is what lets a tail-recursive procedure run in a small, constant amount of memory regardless of how many times it recurses, while a non-tail-recursive procedure's memory use grows with its recursion depth.

## Objects and methods used

None new. This lesson reuses `get-internal-real-time` (Lesson 37) and standard process-monitoring commands (`ps`), applied to compare two structurally different recursive procedures directly.

---

## Concept Unit 1: Revisiting Two Different Memory Behaviors

### The Problem

Lesson 29 ran `broken-factorial.scm` — no base case, `(* n (factorial (- n 1)))` — and watched its memory climb from 830 megabytes to over 2 gigabytes in thirty seconds. Lesson 30 ran a broken `countdown-by-2` — a real base case, just unreachable for odd inputs — and it simply hung, using almost no memory at all. Both procedures failed to terminate. Neither lesson explained why their failures looked so different.

### No isolated lab for this step

This concept has no code of its own to isolate — comparing two already-run experiments is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Two Failures, Side by Side

**`broken-factorial`'s recursive case, quoted from Lesson 29:** `(* n (factorial (- n 1)))`.

**`countdown-by-2`'s recursive case, quoted from Lesson 30:** `(countdown-by-2 (- n 2))`.

**The structural difference, examined directly:** `broken-factorial`'s recursive call to `factorial` is wrapped inside a call to `*` — once `(factorial (- n 1))` returns, there is still a multiplication left to perform before `factorial` itself can return. `countdown-by-2`'s recursive call is not wrapped in anything — once `(countdown-by-2 (- n 2))` returns, `countdown-by-2` itself is already finished; there is nothing left to do but hand that same value back.

**Naming what this difference predicts:** every pending multiplication in `broken-factorial`'s case has to be remembered somewhere while the next, deeper call is made — and since the recursion never stops, those pending multiplications accumulate without bound, exactly matching the measured memory growth. `countdown-by-2` has no pending work to remember at any point — exactly matching its measured, flat memory use.

### Walkthrough

- **`(* n (factorial (- n 1)))`, reappearing from Lesson 29** — examined here specifically for what happens *after* the recursive call returns.
- **`(countdown-by-2 (- n 2))`, reappearing from Lesson 30** — examined the same way, finding nothing happens after it returns at all.
- **The prediction, stated before this lesson's own measurements confirm it** — not a new concept, but the precise hypothesis Concept Unit 3 will go on to test directly.

### CS Lens

This is the recognition that two failures which look completely different in practice — one consuming ever-growing memory, one simply hanging — can share the identical root cause (a process that never terminates) while differing entirely in a second, independent property: whether anything is left pending at each step. Also recognized in: two different traffic jams, one where cars pile up bumper to bumper occupying more and more road, and one where a single lane is simply blocked with no backup building behind it; two different unfinished paperwork backlogs, one where each new form waits behind an ever-growing stack of unprocessed ones, and one where a single form is stuck without blocking anything behind it; two different cooking mishaps, one where dishes pile up unfinished on every burner, and one where a single dish is simply never removed from the oven.

### SE Lens

The alternative to comparing these two prior lessons directly is to treat them as two unrelated incidents, each explained only in its own terms — Lesson 29's growth attributed vaguely to "recursion," Lesson 30's hang attributed vaguely to "an unreachable base case," with no shared vocabulary connecting the two. The real cost of that alternative is losing a genuinely useful, transferable distinction: recognizing *which* of these two memory behaviors a new piece of recursive code will exhibit, before running it, requires exactly the structural check this lesson is about to make precise. Comparing the two directly, as this unit does, costs nothing beyond re-reading two already-written recursive cases; it sets up Concept Unit 2's formal definition with two concrete, already-familiar examples already in hand.

---

## Concept Unit 2: Tail Position — Where a Call Is the Last Thing Left to Do

### The Problem

Concept Unit 1's comparison was informal — "wrapped in a multiplication" versus "not wrapped in anything." Stating this precisely, as a checkable test applicable to any recursive procedure, is what actually makes it useful going forward.

### No isolated lab for this step

This concept has no code of its own to isolate — the precise definition is stated and applied directly below, not through a construct with its own syntax.

### Applying It — Checking Four Procedures

**The definition, stated directly:** a call is in tail position if it is the very last operation a procedure performs — its result is returned directly, with no further computation applied to it afterward.

**Checking `factorial`'s recursive call:** `(factorial (- n 1))` is an operand of `*`, not the last operation — `*` runs after it. Not in tail position.

**Checking `countdown-by-2`'s recursive call:** `(countdown-by-2 (- n 2))` is the entire else-branch, with nothing surrounding it. In tail position.

**Checking `reverse-acc`'s recursive call, from Lesson 38:** `(reverse-acc (cdr lst) (cons (car lst) acc))` is the entire else-branch — the `cons` happens as part of *computing the argument* to pass in, before the call is made, not after it returns. In tail position.

**Checking `naive-reverse`'s call to `my-append`, from Lesson 37:** `(my-append (naive-reverse (cdr lst)) (list (car lst)))` — the outer call, to `my-append`, is in tail position (it's the entire else-branch); but the *inner* call, `(naive-reverse (cdr lst))`, is an operand of `my-append`, not the last operation performed. `naive-reverse`'s own recursive call to itself is not in tail position.

### Walkthrough

- **The precise definition, stated as a checkable test** — first appearance of *tail position*, defined directly.
- **`factorial`, `countdown-by-2`, `reverse-acc`, and `naive-reverse`, each checked against the definition** — a reappearance of four already-familiar procedures from Lessons 29, 30, 37, and 38, now examined through a single, uniform, precise lens.
- **The `naive-reverse` case specifically, distinguishing the outer call from the inner one** — demonstrates that "in tail position" is a property of one *specific* call within a procedure, not a property of the procedure as a whole; `naive-reverse` makes one call that's in tail position (to `my-append`) and one that isn't (to itself).

### CS Lens

This is a precise, mechanical test — checkable by looking directly at a piece of code's syntactic structure, with no need to run it — for a property that turns out to predict real, measurable behavior, exactly the kind of static check this curriculum's later lessons on programming languages will formalize much further. Also recognized in: checking a contract's final clause to see whether it's genuinely the last obligation or merely appears last while still depending on something evaluated afterward; checking a relay race's final leg to see whether the anchor runner's finish is truly the race's end or whether a judge still needs to review something before the result is official; checking a recipe's last step to see whether it's genuinely final or secretly requires returning to an earlier step.

### SE Lens

The alternative to checking tail position precisely is to judge "how recursive-looking" a procedure is by feel, the same imprecise instinct that made `naive-reverse` and `reverse-acc` look deceptively similar before Lesson 38 explained the difference. The real cost of that alternative is exactly what Concept Unit 1 exposed: two recursive procedures with superficially similar structure (a base case, a recursive call) can differ in this one precise, easy-to-check way, with dramatically different consequences. Checking tail position mechanically, as this unit does for four real procedures, costs nothing beyond examining each recursive call's own syntactic position; it is what turns an intuitive hunch into a reliable, repeatable test.

---

## Concept Unit 3: Tail Call Optimization — Reusing the Same Stack Frame

### The Problem

Concept Unit 1 predicted that a call not in tail position must keep something pending, growing with recursion depth, while a tail call has nothing left pending at all. This prediction is worth testing directly, on a scale large enough for any real difference to become unmistakable.

### No isolated lab for this step

This concept has no code of its own to isolate — the real memory and timing comparison is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Twenty Million Calls, Two Ways

**Two procedures, counting to the same large number, one via each structure:**

```scheme
(define (count-nontail n)
  (if (= n 0) 0 (+ 1 (count-nontail (- n 1)))))

(define (count-tail n acc)
  (if (= n 0) acc (count-tail (- n 1) (+ 1 acc))))
```

**Checking `count-nontail`'s recursive call against Concept Unit 2's test:** `(count-nontail (- n 1))` is an operand of `+` — not in tail position, structurally identical to `factorial`.

**Checking `count-tail`'s recursive call:** the entire else-branch — in tail position, structurally identical to `reverse-acc`.

**Running `count-nontail` on `20,000,000`, watching real memory use over time:**

```
$ guile count-nontail.scm &
$ ps -o rss= -p <pid>
   573760   (KB, after 3 seconds)
   874000   (KB, after 6 seconds)
```

Verified this session — memory climbing from roughly 560 megabytes to over 850 megabytes before the call finally finished.

**Running `count-tail` on the identical `20,000,000`, watching the same way:**

```
$ guile count-tail.scm &
$ ps -o rss= -p <pid>
    19792   (KB, after 1 second)
```

Verified this session — the entire call finished in about a second, using under 20 megabytes throughout.

**Timing both directly, using Lesson 37's own `time-it`:**

```
non-tail count (20,000,000): 7321.611 ms
tail count (20,000,000): 1327.880 ms
```

Verified this session — the tail-recursive version over five times faster, and using roughly forty times less memory, on the identical computation.

### Walkthrough

- **`count-nontail` and `count-tail`, checked against Concept Unit 2's test before being run at all** — confirms the prediction is made from the code's structure alone, before any measurement.
- **The real memory measurements, `874,000KB` versus `19,792KB`** — first appearance of *tail call optimization*'s actual, measured effect: the tail-recursive version's memory stays essentially flat regardless of depth, while the non-tail version's grows directly with how many pending additions remain unfinished.
- **The real timing measurements, `7321.6ms` versus `1327.9ms`** — confirms the effect isn't limited to memory; keeping millions of pending stack frames also costs real, measurable time.

### CS Lens

This is a direct, measured confirmation of what an interpreter's tail call optimization actually buys: recognizing that a call in tail position leaves nothing pending, and reusing the current call's own space for the next one instead of allocating new space — exactly why `count-tail`'s memory use never grows with `n`, while `count-nontail`'s does. Also recognized in: a relay race baton handoff that reuses the same baton rather than manufacturing a new one for each runner; a hotel room turned over and reused for the next guest rather than building an entirely new room; a factory jig reused for the next unit rather than built fresh each time; a phone call transferred directly to the next department rather than the caller being asked to hang up and redial each time.

### SE Lens

The alternative to measuring this directly is to trust the structural prediction from Concept Unit 1 and Concept Unit 2 without ever confirming it against real, running code — exactly the risk this curriculum has repeatedly warned against since Lesson 22. The real cost of that alternative here specifically would be missing just how large the actual difference is: a factor of five in time and roughly forty in memory is not a subtle effect, and a learner who only reads the structural argument, without seeing these real numbers, might reasonably underestimate how much a single syntactic choice — where a recursive call sits relative to a surrounding operation — actually matters in practice.

---

## Concept Unit 4: Rewriting factorial to Be Tail Recursive, Using an Accumulator

### The Problem

`factorial`, as originally written in Lesson 28, is not tail recursive, per Concept Unit 2's own check. Lesson 38 already built the exact tool needed to fix this — an accumulator — and it's worth applying it here directly, closing a gap left open since this curriculum's very first piece of real code.

### The New Code — Type It Yourself

```scheme
(define (factorial-acc n acc)
  (if (= n 0)
      acc
      (factorial-acc (- n 1) (* n acc))))
```

### The Updated Project

This is `factorial-tail.scm`, in full:

```scheme
(define (factorial-acc n acc)
  (if (= n 0)
      acc
      (factorial-acc (- n 1) (* n acc))))

(define (clean-factorial n)
  (factorial-acc n 1))

(display (clean-factorial 5))
(newline)
(display (clean-factorial 10))
(newline)
```

### Reference Source

Lesson 28's original `factorial`, restructured using Lesson 38's accumulator-passing shape, with `*` replacing `cons` as the update operation and `1` replacing `'()` as the correct starting value — the identity for multiplication (Lesson 3), exactly the way `0` was the identity for `sum-acc`'s addition.

### Files affected

Created: `factorial-tail.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile factorial-tail.scm
120
3628800
```

Verified this session — `clean-factorial(5) = 120` and `clean-factorial(10) = 3628800`, both matching known-correct values.

**Confirming this handles a genuinely large input the original `factorial` was never tested against:**

```
$ guile -q
scheme@(guile-user)> (define (factorial-acc n acc) (if (= n 0) acc (factorial-acc (- n 1) (* n acc))))
scheme@(guile-user)> (define (clean-factorial n) (factorial-acc n 1))
scheme@(guile-user)> (string-length (number->string (clean-factorial 10000)))
$1 = 35660
```

Verified this session — `10000!` has `35,660` digits, computed directly with no error, no unusual delay, and no unusual memory use.

### Mechanical Walkthrough

- **`(define (factorial-acc n acc) ...)`** — a reappearance of Lesson 38's accumulator shape, this time carrying a running product rather than a running sum or a growing list.
- **`(if (= n 0) acc ...)`** — the base case, returning the accumulator directly, exactly as `reverse-acc` and `sum-acc`'s base cases did.
- **`(factorial-acc (- n 1) (* n acc))`** — the recursive case: `(* n acc)` updates the running product *before* recursing, and the call itself, `(factorial-acc ...)`, is the entire else-branch — in tail position, per Concept Unit 2's test, unlike the original `factorial`'s recursive call.
- **`clean-factorial`, wrapping `factorial-acc` with a starting accumulator of `1`** — a reappearance of Lesson 38, Concept Unit 4's, wrapping pattern, with `1` — multiplication's identity — playing the role `0` and `'()` played for the earlier accumulator versions.

### CS Lens

This is the direct, practical payoff of recognizing tail position: a procedure this curriculum has used since Lesson 28, restructured with the identical accumulator technique already learned for an unrelated problem (reversing a list), now capable of correctly computing values — `10000!`, a 35,660-digit number — that would have cost the original version substantially more memory to reach the same result. Also recognized in: a manufacturing process redesigned to eliminate a growing backlog at one station, using a technique already proven effective at a different station in the same factory; a filing system redesigned to eliminate a growing stack of pending folders, using a technique already proven effective for a different kind of paperwork; a traffic pattern redesigned to eliminate a growing backup at one intersection, using a technique already proven effective at a different intersection.

### SE Lens

The alternative to rewriting `factorial` in tail-recursive form is to accept its original shape permanently, relying on it only for inputs small enough that its non-tail-position recursive call never accumulates enough pending multiplications to matter. The real cost of that alternative is a procedure with a hidden scaling limit nobody stated explicitly — correct for every input tried in earlier lessons, and silently more expensive than it needed to be for any input large enough to expose it, exactly the kind of unstated limitation Lesson 9's contracts exist to prevent. Rewriting it in tail-recursive form, as this unit does, costs the same accumulator-passing effort Lesson 38 already established; it removes the hidden limit entirely, for an argument, `*`, that turns out to have exactly the right identity value already familiar from Lesson 3.

---

## Concept Unit 5: Not Every Recursive Procedure Can Be Made Tail Recursive

### The Problem

`factorial`, `sum-list`, and `reverse` were all rewritten into tail-recursive form using a single accumulator. It would be a mistake to conclude every recursive procedure can be rewritten this easily — some genuinely cannot, at least not without real added complexity, and it's worth confronting one honestly rather than implying the technique always applies cleanly.

### No isolated lab for this step

This concept has no code of its own to isolate — the honest complication is examined directly below, not through a construct with its own syntax.

### Applying It — Why fib Resists This Technique

**`fib`'s recursive case, quoted from Lesson 29:** `(+ (fib (- n 1)) (fib (- n 2)))`.

**Checking both of its recursive calls against Concept Unit 2's test:** `(fib (- n 1))` is an operand of `+` — not in tail position. `(fib (- n 2))` is also an operand of `+` — also not in tail position. *Neither* of `fib`'s two recursive calls is a tail call.

**Why a single accumulator, of the kind that fixed `factorial`, doesn't obviously fix this:** `factorial`'s fix worked because there was exactly one pending operation (`* n`) to fold into a single running accumulator. `fib` has *two* recursive calls whose results need to be combined — carrying a single accumulator through the first call has nothing useful to do with the second call's eventual result, since they're needed together, not one after another.

**Stating honestly what actually would be needed:** making `fib` tail recursive is possible, but requires an accumulator scheme that tracks *two* running values at once (typically, the current and previous Fibonacci numbers), restructuring the recursion to walk forward from the base case rather than backward from `n` — a genuinely different, more involved rewrite than the single-accumulator pattern that handled `factorial`, `sum-list`, and `reverse` so directly, and one this curriculum will return to once iteration, in the next lesson, offers an even more natural way to express it.

### Walkthrough

- **`fib`'s two recursive calls, both checked and both failing Concept Unit 2's test** — confirms, precisely rather than by assertion, that `fib` genuinely differs from every procedure successfully rewritten so far in this lesson.
- **The explanation of why a single accumulator doesn't transfer directly** — not a new concept, but an honest diagnosis of exactly what makes this case harder, rather than leaving it as an unexplained exception.
- **The honest forward-pointer to a genuinely different fix, not yet built** — an explicit acknowledgment, in the spirit of Lesson 14 and Lesson 21's own honest forward-pointers, of what this lesson has and hasn't resolved.

### CS Lens

This is the recognition that tail-call rewriting, like every technique this curriculum has introduced, is a tool with a genuine scope — powerful and directly applicable to procedures making one recursive call whose result feeds a single pending operation, and requiring real additional thought for procedures, like `fib`, that branch into more than one recursive call needing to be combined. Also recognized in: a manufacturing fix that works cleanly for a single-station bottleneck but requires a fundamentally different redesign for a process with two parallel bottlenecks that both feed the same next step; a traffic fix that works cleanly for a single merging lane but requires a different approach for an intersection where two separate lanes merge simultaneously; a filing fix that works cleanly for a single growing stack but requires different handling when two separate stacks need to be combined into one.

### SE Lens

The alternative to confronting `fib`'s resistance honestly is to imply, by only ever showing successful rewrites, that any recursive procedure can always be made tail recursive with enough cleverness. The real cost of that alternative is a false sense of the technique's universality, leaving a learner unprepared for the genuine difficulty the first time they encounter a procedure this pattern doesn't cleanly apply to. Stating the limitation honestly, and diagnosing precisely why, as this unit does, costs one direct admission; it is what keeps this lesson's real, substantial success with `factorial`, `sum-list`, and `reverse` from being overclaimed into something it isn't.

---

## Closing

### Connect the pieces

Two long-standing, unexplained observations, traced through every unit built in this lesson, start to finish:

1. **The gap named (Unit 1):** Lesson 29's memory growth and Lesson 30's flat-memory hang, compared directly for the first time.
2. **The precise test (Unit 2):** tail position, defined and checked against four already-familiar procedures.
3. **The prediction measured (Unit 3):** `count-nontail` and `count-tail` at twenty million calls, differing by a factor of five in time and roughly forty in memory.
4. **The fix applied to unfinished business (Unit 4):** `factorial-tail.scm`, correctly computing `10000!`, a number Lesson 28's original version was never tested against.
5. **The technique's honest limit (Unit 5):** `fib`, shown to resist the same single-accumulator fix, with the actual reason diagnosed precisely rather than glossed over.

Unit 4's `factorial-acc` directly resolves the exact structural weakness Unit 1 and Unit 2 identified in Lesson 28's original `factorial` — nothing in this lesson's fix was invented independently of the diagnosis that came before it.

### What breaks without this

Suppose a procedure structured like the original, non-tail-recursive `factorial` were used inside a real system processing an ever-growing input — a report-total calculation applied to a transaction log that grows daily, say, written the natural, non-tail-recursive way because it happened to work correctly, and quickly, during early testing on a small log. As the log grows past whatever threshold this lesson's own `count-nontail` began visibly struggling at, the calculation would start consuming noticeably more memory and time with every additional day's data — not because anything about the calculation's logic was ever wrong, but because its specific recursive shape keeps a pending operation alive for every single item processed, exactly Concept Unit 1's diagnosis. A team without this lesson's precise vocabulary might spend real time investigating unrelated causes — a database, a memory leak elsewhere — before ever suspecting the specific, checkable property (is the recursive call in tail position?) this lesson has shown predicts the problem directly. Restoring this lesson's discipline — checking tail position explicitly for any recursive procedure expected to run on a large or growing input, and rewriting with an accumulator when it fails that check — is what catches this before it becomes a slow, hard-to-diagnose production problem.

### Exercises

1. **Observe.** Take three recursive procedures from your own earlier exercises (Lessons 28 through 38) and check each one's recursive call against Concept Unit 2's tail-position test, the way this lesson checked `factorial`, `countdown-by-2`, `reverse-acc`, and `naive-reverse`.
2. **Predict.** For each of your Exercise 1 procedures that isn't tail recursive, predict whether running it on a very large input would show `count-nontail`-style memory growth, and roughly how severe.
3. **Formalize.** Rewrite one of your non-tail-recursive Exercise 1 procedures into tail-recursive form using an accumulator, following `factorial-acc`'s exact pattern: identify the correct starting accumulator value (the identity for whatever operation you're accumulating) and fold the pending operation into the accumulator update.
4. **Explain.** Using Lesson 37's timing harness and real memory measurement (`ps -o rss=`), compare your original and rewritten Exercise 3 procedures on a large input, the way Concept Unit 3 compared `count-nontail` and `count-tail`.
5. **Explain.** If any of your Exercise 1 procedures makes more than one recursive call (like `fib`), explain, in your own words, why a single accumulator doesn't straightforwardly fix it, using Concept Unit 5's diagnosis of `fib` as a model.

### Definition of done

- [ ] You can check whether a given recursive call is in tail position, from the code alone, without running it.
- [ ] You can explain, using real measured numbers, what tail call optimization actually saves — in both memory and time.
- [ ] You can rewrite a non-tail-recursive procedure into tail-recursive form using an accumulator, correctly identifying the starting value.
- [ ] You can explain why a procedure making more than one recursive call resists the single-accumulator technique, using your own example.
- [ ] You completed Exercises 1–5 using your own procedures, not `factorial`, `countdown-by-2`, or `fib`.
- [ ] Commit your Exercise 3 tail-recursive rewrite and your Exercise 4 measurements, with a commit message stating the actual measured difference in memory or time between your original and rewritten versions.
