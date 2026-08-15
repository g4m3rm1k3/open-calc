# Lesson 37: Append and Reverse

**What you will build:** Two genuinely correct ways to reverse a list — one built from repeated `append`, one built from `fold` — timed against each other on a real, sizeable list, revealing that "equally correct" and "equally fast" are not the same claim at all. The transferable problem this lesson is actually about: every procedure in this curriculum so far has been checked only for correctness — does it compute the right answer. Two procedures can both pass that check perfectly and still differ by a factor of thousands in how long they take, and nothing about reading either definition on its own reveals which one that will be.

**What you need to know first:** Lesson 33 (`FP-L033-processing-a-list.md`) — specifically the structural-recursion template, reused to derive `append`. Lesson 36 (`FP-L036-fold.md`) — specifically `fold` and Concept Unit 4's discovery that `(fold cons '() lst)` reverses a list, reused directly as this lesson's fast alternative.

**Terms introduced in this lesson**

- **Running time** — how long a procedure actually takes to execute on a given input, measured directly rather than assumed from how its definition looks. Two procedures can be equally correct and have dramatically different running times, a distinction invisible from correctness checking alone and the entire subject of this lesson.

## Objects and methods used

- **`append`**
  - *What it is:* Scheme's own built-in procedure for combining two lists into one.
  - *Implementation:* takes two lists and returns a new list containing every item of the first followed by every item of the second; confirmed this session as `(append (list 1 2 3) (list 4 5 6))`.
  - *Its use:* Concept Unit 2's `naive-reverse` calls `append` (through a hand-built equivalent) once per item in the list being reversed — the specific choice this lesson's timing exposes as costly.
- **`get-internal-real-time`**
  - *What it is:* a real Scheme procedure returning the current time, in implementation-specific internal units.
  - *Implementation:* takes no arguments; the difference between two calls, divided by `internal-time-units-per-second`, gives elapsed real time; confirmed this session.
  - *Its use:* Concept Unit 4 uses it directly to measure, honestly and for real, how long each version of reverse actually takes.

---

## Concept Unit 1: Append — Combining Two Lists

### The Problem

Every list-processing procedure so far has taken one list at a time. Combining two separate lists into one — the passing scores from one class period appended to the passing scores from another, say — needs a procedure that takes two lists and produces a single one containing every item of both, in order.

### The New Code — Type It Yourself

```scheme
(define (my-append lst1 lst2)
  (if (null? lst1)
      lst2
      (cons (car lst1) (my-append (cdr lst1) lst2))))
```

### The Updated Project

This is `my-append.scm`, in full:

```scheme
(define (my-append lst1 lst2)
  (if (null? lst1)
      lst2
      (cons (car lst1) (my-append (cdr lst1) lst2))))

(display (my-append (list 1 2 3) (list 4 5 6)))
(newline)
```

### Reference Source

Lesson 33's structural-recursion template, derived by explicitly answering its two questions: what should an empty first list produce (the second list, unchanged, since there's nothing from the first list left to add), and how should a non-empty first list's first item combine with the recursive result (by `cons`ing it onto the front, exactly as `map` already did).

### Files affected

Created: `my-append.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile my-append.scm
(1 2 3 4 5 6)
```

Verified this session, alongside a check against Scheme's built-in `append`:

```
$ guile -q
scheme@(guile-user)> (define (my-append lst1 lst2) (if (null? lst1) lst2 (cons (car lst1) (my-append (cdr lst1) lst2))))
scheme@(guile-user)> (my-append (list 1 2 3) (list 4 5 6))
$1 = (1 2 3 4 5 6)
scheme@(guile-user)> (append (list 1 2 3) (list 4 5 6))
$2 = (1 2 3 4 5 6)
```

Verified this session — identical results.

### Mechanical Walkthrough

- **`(if (null? lst1) lst2 ...)`** — the base case, checking only the *first* list's emptiness, not the second's — a reappearance of Lesson 33's template, base-valued this time with an entire list, `lst2`, rather than a number or `'()`.
- **`(cons (car lst1) (my-append (cdr lst1) lst2))`** — the recursive case, `cons`ing `lst1`'s first item onto the front of the result of appending the rest of `lst1` to all of `lst2` — the second list, `lst2`, passed through unchanged at every recursive step.
- **A crucial fact worth naming explicitly, since Concept Unit 2 depends on it:** `my-append`'s own work is proportional to the length of its *first* argument — the recursion walks all the way down `lst1` before the base case is reached, regardless of how long `lst2` is.

### CS Lens

This is another direct instance of Lesson 33's template, this time combining two lists rather than combining a list down into a single value — confirming the template's reach extends to procedures with more than one list argument. Also recognized in: splicing two video clips together, where the first clip plays entirely before the second begins; concatenating two documents, where every page of the first appears before any page of the second; merging two queues, where everyone in the first queue is served before anyone in the second; joining two train cars, where passengers in the first car reach their destination in the same order the cars were coupled.

### SE Lens

The alternative to deriving `append` from the template is to treat list-combining as an unrelated, special case needing its own independent reasoning. The real cost of that alternative is losing the generality this curriculum has been building since Lesson 33 — recognizing `append` as another template instance means every guarantee already established (base case correctly derived, recursive case genuinely making progress per Lesson 30) applies here too, without needing to be separately re-verified. Deriving it explicitly, as this unit does, costs nothing beyond the same derivation process already used repeatedly; the fact worth carrying forward — that `my-append`'s cost depends on its first argument's length — is what Concept Unit 4 will make consequential.

---

## Concept Unit 2: Reverse, the Naive Way — Using Append Repeatedly

### The Problem

Reversing a list sounds, at first, like a natural fit for the same recursive shape used throughout this curriculum: reverse the rest of the list, then place the first item at the very end of that reversed result. `append` is exactly the tool that places one thing at the end of a list.

### The New Code — Type It Yourself

```scheme
(define (naive-reverse lst)
  (if (null? lst)
      '()
      (my-append (naive-reverse (cdr lst)) (list (car lst)))))
```

### The Updated Project

This is `naive-reverse.scm`, in full:

```scheme
(define (my-append lst1 lst2)
  (if (null? lst1)
      lst2
      (cons (car lst1) (my-append (cdr lst1) lst2))))

(define (naive-reverse lst)
  (if (null? lst)
      '()
      (my-append (naive-reverse (cdr lst)) (list (car lst)))))

(display (naive-reverse (list 1 2 3 4 5)))
(newline)
```

### Reference Source

`my-append.scm` (Concept Unit 1), used here as a building block rather than a from-scratch derivation.

### Files affected

Created: `naive-reverse.scm`.

### Change type

Add (new file).

### Dependencies

`my-append`, defined in the same file.

### Run It — Show the Real Output

```
$ guile naive-reverse.scm
(5 4 3 2 1)
```

Verified this session — correctly reversed.

### Mechanical Walkthrough

- **`(if (null? lst) '() ...)`** — the base case: reversing nothing produces nothing, exactly the reasoning already used for every other list-processing base case.
- **`(my-append (naive-reverse (cdr lst)) (list (car lst)))`** — the recursive case: reverse everything after the first item, then append a one-item list containing the first item onto the *end* of that already-reversed result — `(list (car lst))` builds a single-item list specifically so `my-append` has a list, not a bare value, to combine.
- **What this recursive case actually costs, worth stating precisely before Concept Unit 4's measurement:** every single call to `naive-reverse` — not just the outermost one, but every one of the `n` recursive calls it makes for a list of `n` items — triggers its own separate call to `my-append`, and Concept Unit 1 already established `my-append`'s cost grows with its first argument's length, which itself grows larger with each step of `naive-reverse`'s own recursion.

### CS Lens

This is a procedure built entirely correctly, using tools already fully trusted (structural recursion, `append`), by directly translating the intuitive description "reverse the rest, then put the first item last" into code — exactly the kind of derivation this curriculum has repeatedly endorsed. Also recognized in: unpacking a stack of plates one at a time and placing each one at the bottom of a new stack, correct but requiring lifting the entire growing new stack for every single plate; reading a book backwards by re-copying the entire remaining manuscript with one more word appended at the end, for every single word; rebuilding a train one car at a time, uncoupling and reattaching the entire assembled portion for every new car added at the end.

### SE Lens

The alternative to building `naive-reverse` this way is already implicitly present in Lesson 36's own discovery — `(fold cons '() lst)` reverses a list too, using a completely different mechanism. The real cost of `naive-reverse`'s specific approach isn't visible yet from its definition alone; it takes Concept Unit 4's actual measurement to make the cost concrete. Building it this way first, honestly, as the natural-seeming translation of "reverse the rest, append the first item last," costs nothing beyond the derivation itself; it sets up a genuine, fair comparison against Concept Unit 3's alternative.

---

## Concept Unit 3: Reverse, the Fold Way — Using fold Directly

### The Problem

Lesson 36, Concept Unit 4, already discovered, somewhat by accident, that `(fold cons '() lst)` reverses a list. It's worth building this as its own named, deliberate procedure, to compare directly and fairly against `naive-reverse`.

### The New Code — Type It Yourself

```scheme
(define (fold-reverse lst)
  (fold cons '() lst))
```

### The Updated Project

This is `fold-reverse.scm`, in full:

```scheme
(use-modules (srfi srfi-1))

(define (fold-reverse lst)
  (fold cons '() lst))

(display (fold-reverse (list 1 2 3 4 5)))
(newline)
```

### Reference Source

Lesson 36 (`FP-L036-fold.md`), Concept Unit 4's own finding, made into its own named procedure here.

### Files affected

Created: `fold-reverse.scm`.

### Change type

Add (new file; this lesson's second real, kept artifact).

### Dependencies

`fold`, from the `(srfi srfi-1)` module.

### Run It — Show the Real Output

```
$ guile fold-reverse.scm
(5 4 3 2 1)
```

Verified this session — identical result to `naive-reverse.scm`'s.

### Mechanical Walkthrough

- **`(fold cons '() lst)`** — a reappearance of `fold` (Lesson 36), applied with `cons` as its combining function and `'()` as its base value.
- **What this actually does, restated from Lesson 36's own explanation:** `fold` processes `lst`'s items left to right, `cons`ing each new item directly onto the *front* of the accumulated result so far — no `append` involved at all, and no recursive call ever triggers a second, separate traversal of any list.
- **The contrast with `naive-reverse`'s recursive case, made explicit:** `naive-reverse` calls `my-append` once *per item*, each call independently walking as much of a list as it's been handed; `fold-reverse` calls `cons` once per item, and `cons` (Lesson 32) does a fixed, constant amount of work every single time, regardless of how long any list involved is.

### CS Lens

This is the same underlying operation — reversal — implemented through a fundamentally different mechanism: building the result directly, one `cons` at a time, rather than assembling partial reversals and repeatedly re-combining them with `append`. Also recognized in: dealing a stack of plates directly onto a new stack, each plate placed once, versus Concept Unit 2's approach of rebuilding the entire new stack for every plate; reading a book backwards by simply starting from the last word and writing each word down once, versus re-copying the whole manuscript per word; adding train cars to the front of an already-assembled train, one coupling per car, versus disassembling and reassembling the whole train each time.

### SE Lens

The alternative to building `fold-reverse` as its own explicit procedure is to leave Lesson 36's discovery as an incidental example, never elevated to a genuine, comparable alternative to `naive-reverse`. The real cost of that alternative is losing the fair, direct comparison Concept Unit 4 needs — without a second, real, correctly-working procedure computing the identical result, there would be nothing concrete to actually time against `naive-reverse`. Building `fold-reverse` explicitly, as this unit does, costs one small procedure definition; it is what makes Concept Unit 4's comparison possible at all.

---

## Concept Unit 4: Measuring the Difference — Real Timing on a Large List

### The Problem

`naive-reverse` and `fold-reverse` have both been checked and confirmed correct, on the same small list, producing identical results. Nothing about reading either definition, on its own, reveals whether they take the same amount of time to run — that has to actually be measured, on a list large enough for any real difference to become visible.

### The New Code — Type It Yourself

```scheme
(define (time-it label thunk)
  (let* ((start (get-internal-real-time))
         (result (thunk))
         (end (get-internal-real-time))
         (elapsed-ms (/ (* 1000.0 (- end start)) internal-time-units-per-second)))
    (display label) (display ": ") (display elapsed-ms) (display " ms") (newline)
    result))
```

### The Updated Project

This is `timing.scm`, in full:

```scheme
(use-modules (srfi srfi-1))

(define (my-append lst1 lst2)
  (if (null? lst1)
      lst2
      (cons (car lst1) (my-append (cdr lst1) lst2))))

(define (naive-reverse lst)
  (if (null? lst)
      '()
      (my-append (naive-reverse (cdr lst)) (list (car lst)))))

(define (fold-reverse lst)
  (fold cons '() lst))

(define (time-it label thunk)
  (let* ((start (get-internal-real-time))
         (result (thunk))
         (end (get-internal-real-time))
         (elapsed-ms (/ (* 1000.0 (- end start)) internal-time-units-per-second)))
    (display label) (display ": ") (display elapsed-ms) (display " ms") (newline)
    result))

(time-it "naive-reverse (1000 items)" (lambda () (naive-reverse (iota 1000))))
(time-it "naive-reverse (2000 items)" (lambda () (naive-reverse (iota 2000))))
(time-it "naive-reverse (4000 items)" (lambda () (naive-reverse (iota 4000))))
(time-it "fold-reverse (4000 items)" (lambda () (fold-reverse (iota 4000))))
```

### Reference Source

No reference counterpart — a from-scratch measurement built specifically to answer this unit's question honestly, rather than by assumption.

### Files affected

Created: `timing.scm`.

### Change type

Add (new file).

### Dependencies

`my-append`, `naive-reverse`, `fold-reverse`, `get-internal-real-time` (see Objects and methods used), and `iota`, a standard Scheme procedure producing a list of consecutive integers.

### Run It — Show the Real Output

```
$ guile timing.scm
naive-reverse (1000 items): 38.014 ms
naive-reverse (2000 items): 140.621 ms
naive-reverse (4000 items): 532.851 ms
fold-reverse (4000 items): 0.094 ms
```

Verified this session, on this machine, this run — real timings vary by hardware and system load, but the *pattern* is the point, not the exact millisecond values.

### Mechanical Walkthrough

- **`(get-internal-real-time)`, called before and after each timed operation** — first appearance of *running time*, measured directly rather than estimated or assumed.
- **`naive-reverse` at `1000`, `2000`, and `4000` items — `38`, `141`, and `533` milliseconds** — doubling the list size from `1000` to `2000` roughly *quadrupled* the time (`38 → 141`, a factor of about `3.7`); doubling again from `2000` to `4000` roughly quadrupled it again (`141 → 533`, a factor of about `3.8`) — a pattern, not a coincidence, examined precisely in Concept Unit 5.
- **`fold-reverse` at `4000` items — `0.094` milliseconds** — over five thousand times faster than `naive-reverse` on the identical input, computing the identical, already-verified correct result.

### CS Lens

This is an empirical demonstration of two procedures with identical correctness and dramatically different running times — the concrete, felt experience this curriculum will formalize much later, once asymptotic notation and complexity analysis are introduced, but genuinely observable right now, with nothing more than a stopwatch and a large enough list. Also recognized in: two delivery routes to the same destination, both arriving correctly, one taking five minutes and the other taking five hours; two methods of alphabetizing a stack of papers, both producing the identical correct order, one taking a minute and the other taking an afternoon; two ways of searching a phone book for a name, both finding it correctly, one taking seconds and the other taking hours; two recipes producing an identical finished dish, one taking twenty minutes and the other taking most of a day.

### SE Lens

The alternative to actually measuring is to guess, from reading the two definitions, which one is likely faster — a guess that might well be wrong, since `naive-reverse`'s definition looks no more complicated than `fold-reverse`'s at a glance, and nothing about its structure visibly announces the repeated, growing `append` calls hiding inside it. The real cost of guessing instead of measuring is exactly the risk this curriculum has warned about since Lesson 22: a plausible-sounding intuition is not the same as a checked fact. Measuring directly, as this unit does, costs the small effort of writing a timing harness and waiting for a large input to run; it replaces a guess with a genuinely surprising, concrete number — over five thousand times slower — that no amount of reading either definition alone would have revealed.

---

## Concept Unit 5: Why the Difference Exists — Counting append's Own Work

### The Problem

Concept Unit 4 measured a dramatic difference and noticed doubling the input roughly quadrupled `naive-reverse`'s time. It's worth explaining precisely why, connecting the measured pattern back to Concept Unit 1's own observation about what `my-append`'s cost actually depends on.

### No isolated lab for this step

This concept has no code of its own to isolate — the explanation is given directly below, connecting Concept Unit 1's fact to Concept Unit 4's measurement, not through a construct with its own syntax.

### Applying It — Counting the Total Work

**Concept Unit 1's fact, restated:** `my-append`'s own cost is proportional to the length of its *first* argument.

**Tracing `naive-reverse`'s calls to `my-append`, for a list of `n` items, one level at a time:** at the deepest level, `naive-reverse` calls `my-append` on two single-item-or-shorter lists — cheap. One level up, it calls `my-append` with a first argument of length `1`. One level up from there, length `2`. And so on, up to the outermost call, where `my-append`'s first argument — the fully reversed tail of the original list — has length `n − 1`.

**Adding up the total work across every one of these `n` calls:** `0 + 1 + 2 + ... + (n − 1)` — Lesson 27's own `sum(n)` function, applied here to count total operations rather than total value. This sum grows proportionally to `n²`, not to `n` — precisely why doubling `n` roughly quadruples the total work, exactly the pattern Concept Unit 4 measured directly.

**Confirming `fold-reverse` doesn't have this problem, by the identical kind of counting:** each of `fold`'s `n` calls to `cons` does a fixed, small amount of work, regardless of how long any list involved is — total work proportional to `n` itself, not `n²`, exactly why `fold-reverse` stayed fast even at `4000` items where `naive-reverse` had already become dramatically slow.

### Walkthrough

- **`my-append`'s cost, tied to its first argument's length, reappearing from Concept Unit 1** — the specific fact this whole explanation is built from.
- **The growing first-argument lengths across `naive-reverse`'s own recursive calls, `0, 1, 2, ..., n − 1`** — a reappearance of *summation* (Lesson 26) and the exact recursive definition of `sum(n)` from Lesson 27, now counting operations rather than counting a value.
- **The connection to the measured quadrupling pattern** — not a new concept, but the precise, honest explanation of *why* Concept Unit 4's real numbers came out the way they did, rather than leaving the measurement as an unexplained curiosity.

### CS Lens

This is the first genuine cost analysis in this curriculum — counting not what a procedure computes, but how much total work it does, by tracing exactly which operations get repeated and how their individual cost grows — the direct forerunner of the formal complexity analysis Era III of this curriculum will build in full. Also recognized in: counting the total number of handshakes at a party where everyone shakes hands with everyone else, which grows proportionally to the square of the number of guests, not linearly; counting the total number of matches in a round-robin tournament, growing the same quadratic way; counting the total pages copied when re-copying an entire growing document once per new paragraph added, rather than only writing each paragraph once; counting the total distance walked when repeatedly returning to a growing pile to add one more item at a time from a single starting point, instead of carrying items directly to their final positions.

### SE Lens

The alternative to explaining the measured pattern precisely is to accept Concept Unit 4's numbers as an interesting but unexplained fact, without connecting them back to anything in `naive-reverse`'s actual structure. The real cost of that alternative is a weaker, less transferable understanding — a learner who only knows "naive-reverse is somehow slower" cannot predict, for a *different* procedure, whether it will have the same problem, while a learner who understands the actual mechanism (repeated calls to an operation whose own cost grows with an argument that itself keeps growing) can recognize the same danger anywhere it recurs. Explaining the mechanism precisely, as this unit does, costs the extra work of tracing through exactly what grows and why; it turns a measured curiosity into a transferable, recognizable pattern.

---

## Closing

### Connect the pieces

Two ways of reversing a list, both checked against the same inputs, traced through every unit built in this lesson, start to finish:

1. **Append, derived and its cost noted (Unit 1):** `my-append`, correct, with its cost tied specifically to its first argument's length.
2. **The naive approach, correctly built (Unit 2):** `naive-reverse`, calling `my-append` once per item, each call's first argument longer than the last.
3. **The fold-based alternative, made explicit (Unit 3):** `fold-reverse`, using `cons` directly, with no repeated `append` calls at all.
4. **The real difference, measured (Unit 4):** `naive-reverse` taking over five thousand times longer than `fold-reverse` on an identical, 4000-item input, with a clear quadrupling pattern as input size doubled.
5. **The pattern explained precisely (Unit 5):** `naive-reverse`'s total work shown to be `0 + 1 + 2 + ... + (n − 1)`, growing with `n²`, directly accounting for the measured quadrupling.

Unit 5's explanation accounts for the exact numbers measured in Unit 4 — not a general theory offered separately, but a precise reconstruction of why those specific, real milliseconds came out the way they did.

### What breaks without this

Suppose a real program used `naive-reverse`'s exact pattern — reversing a list by repeatedly appending, one item at a time — to process a list that grows over time, say a log of user actions reversed to display most-recent-first. At small scale, during early testing with a few dozen entries, this would perform perfectly acceptably, and nothing about testing at that scale would reveal any problem at all. As the log grows into the thousands or tens of thousands of entries, exactly the quadratic growth this lesson measured would begin consuming noticeably more time with every additional entry — not gradually and proportionally, but accelerating, since doubling the log size roughly quadruples the reversal time. A team debugging this slowdown without this lesson's specific understanding might suspect the wrong cause entirely — a database, a network call, anything but the specific, quiet cost of repeated `append` calls, buried inside an ordinary-looking recursive definition that was never wrong, only slow in a way invisible from reading it. Restoring this lesson's discipline — measuring real running time on realistically large inputs, and understanding precisely which repeated operations' own costs compound — is what catches this before it becomes a production problem discovered only once real user data has grown large enough to expose it.

### Exercises

1. **Observe.** Write your own version of `naive-reverse`'s structure — any procedure that repeatedly calls another procedure whose own cost depends on an argument that keeps growing across recursive calls.
2. **Formalize.** Write an alternative version of your Exercise 1 procedure that avoids the repeated, growing-argument calls, the way `fold-reverse` avoided repeated `append` calls.
3. **Predict.** Before measuring, predict which of your two Exercise 1 and 2 versions will be slower on a large input, and roughly by how much.
4. **Formalize.** Using Concept Unit 4's `time-it` procedure, measure both versions on a real, sizeable input (at least a thousand items), and on two different sizes to check for a quadrupling pattern, the way Concept Unit 4 measured `1000`, `2000`, and `4000`.
5. **Explain.** Explain your Exercise 4 results precisely, the way Concept Unit 5 explained `naive-reverse`'s, by tracing exactly which operation's cost grows and why, rather than simply reporting the numbers.

### Definition of done

- [ ] You can explain, in your own words, why two procedures computing identical, correct results can have dramatically different running times.
- [ ] You can identify, in a piece of recursive code, an operation whose own cost depends on an argument that grows across repeated calls, the way `my-append`'s cost depends on `naive-reverse`'s growing first argument.
- [ ] You can measure a procedure's real running time using Guile's timing tools, on more than one input size, and check for a pattern rather than reporting a single number.
- [ ] You can explain a measured performance difference by counting total operations, the way Concept Unit 5 explained `naive-reverse`'s quadratic total work.
- [ ] You completed Exercises 1–5 using your own procedures, not `naive-reverse` or `fold-reverse`.
- [ ] Commit `my-append.scm`, `naive-reverse.scm`, `fold-reverse.scm`, `timing.scm`, and your own Exercise 1 and 2 procedures, with a commit message stating the actual measured ratio between your two versions on your largest tested input.
