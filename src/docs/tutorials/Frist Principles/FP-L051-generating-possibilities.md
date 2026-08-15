# Lesson 51: Generating Possibilities

**What you will build:** `all-subsets`, a real procedure that generates every possible subset of a list — not one witness, not a yes/no answer, but the complete collection — plus a direct, measured demonstration of why naming a recursive call's result, rather than writing it twice, is the difference between eleven calls and over two thousand for a list of only ten items. The transferable problem this lesson is actually about: Lesson 49 and Lesson 50 searched a space of choices for one answer or one witness, stopping as soon as either was found. Some problems need every possibility, not just one — and generating them recursively raises a genuine new risk, first hinted at by `fib`'s redundant calls in Lesson 31, that this lesson finally gives a name and a fix.

**What you need to know first:** Lesson 31 (`FP-L031-tracing-recursive-evaluation.md`) — specifically `fib`'s redundant, repeated recursive calls, revisited directly as the exact risk this lesson's new construct prevents. Lesson 34 (`FP-L034-map.md`) — specifically `map`, reused directly to build each generated subset. Lesson 49 (`FP-L049-recursive-search.md`) — specifically *search space*, extended here from "checked for one answer" to "generated in full."

**Terms introduced in this lesson**

- **Enumeration** — generating every member of a collection explicitly, one at a time, rather than only checking whether a specific member exists or satisfies some condition. `all-subsets` enumerates every subset of a list; Lesson 49's `can-sum-to?` never enumerated anything — it searched without ever building the full collection of possibilities.
- **`let`** — a special form binding one or more names to values for use within a following expression, written `(let ((name value) ...) body)`. `let` exists specifically so a computed value can be named once and reused, rather than recomputed every place it's needed — precisely the problem Concept Unit 3 demonstrates has real, measurable consequences when ignored.

## Objects and methods used

None new. This lesson reuses `cons`, `append`, and `map` (Lessons 32, 37, and 34), combined with this lesson's new `let` special form.

---

## Concept Unit 1: From "Does One Exist" to "What Are They All"

### The Problem

`can-sum-to?` (Lesson 49) and `which-sum` (Lesson 50) both stop the moment they've answered their question — existence, or one witness. Neither one is built to answer a genuinely different question: not "does some subset work," but "what are all the subsets, full stop," regardless of whether any particular property holds.

### No isolated lab for this step

This concept has no code of its own to isolate — the motivating gap is demonstrated directly below, not through a construct with its own syntax.

### Applying It — A Question Neither Earlier Procedure Answers

**`can-sum-to?`'s job, restated:** answer `#t` or `#f` — one Boolean value, regardless of how many subsets might actually satisfy the target.

**`which-sum`'s job, restated:** return one witness — a single subset, chosen by whichever branch the search happened to try first.

**The new question, stated directly:** for a list `(1 2 3)`, what are *every one* of its subsets — `()`, `(1)`, `(2)`, `(3)`, `(1 2)`, `(1 3)`, `(2 3)`, `(1 2 3)` — all eight, listed explicitly, not merely checked for existence or reported one at a time.

### Walkthrough

- **`can-sum-to?` and `which-sum`, restated for what they deliberately don't do** — establishes the genuine gap precisely, rather than treating "generate them all" as an arbitrary new task.
- **The eight subsets of `(1 2 3)`, listed by hand** — makes the actual target concrete before any code is written.

### CS Lens

This is the third and final member of a family of questions a search space can be asked: does something satisfying a property exist (Lesson 49), what is one example that does (Lesson 50), and, now, what are they all. Also recognized in: a database query checking whether any matching row exists, versus returning one matching row, versus returning every matching row; a locksmith checking whether any key on a ring opens a door, versus finding one that does, versus testing and cataloging every key's effect; a store checking whether any item is on sale, versus finding one, versus listing its entire sale inventory.

### SE Lens

The alternative to distinguishing this third question from the first two is to assume any search procedure can be trivially adapted to "find everything" by minor tweaking. The real cost of that alternative, made concrete in the rest of this lesson, is underestimating a real risk — generating every possibility, rather than stopping at the first success, removes the early-termination safety net Lesson 49's `or` provided, and a careless recursive structure for enumeration can be dramatically more expensive than either of the first two questions ever were. Naming the distinction explicitly, as this unit does, costs nothing beyond stating it; it motivates the care Concept Unit 3 takes in deriving `all-subsets` correctly.

---

## Concept Unit 2: Generating All Subsets — the Recursive Case, in Prose

### The Problem

Deriving `all-subsets` correctly means working out its base case and recursive case in prose first, following Lesson 46's leap-of-faith discipline, before writing any code.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is given directly below, not through a construct with its own syntax.

### Applying It — Deriving the Recursive Case by Leap of Faith

**The invariant, stated first:** `(all-subsets items)` returns a list containing every possible subset of `items`, each one itself a list.

**The base case:** the empty list has exactly one subset — itself, the empty list. `(all-subsets '())` should return `(list '())` — a list *containing* the empty list, not the empty list itself; these are genuinely different (the first has one member, the second has none).

**The recursive case, derived by trusting `(all-subsets (cdr items))` without tracing it:** every subset of `items` either includes `(car items)` or it doesn't. Every subset that *doesn't* include it is exactly a subset of `(cdr items)` — trusted, by the leap of faith, to already be sitting in `(all-subsets (cdr items))`. Every subset that *does* include it is exactly one of those same subsets of `(cdr items)`, with `(car items)` added on.

**Stating the combining rule precisely:** the full answer is every subset of `(cdr items)` with `(car items)` added, together with every subset of `(cdr items)` unchanged.

### Walkthrough

- **The invariant, stated in Lesson 46's precise form** — establishes exactly what `all-subsets` must guarantee before any code exists.
- **The base case, `(list '())`, carefully distinguished from `'()` itself** — a subtle but essential distinction, checked explicitly rather than assumed.
- **The recursive case, derived by trusting `(all-subsets (cdr items))`'s result without tracing how it's computed** — a direct application of *recursive leap of faith* (Lesson 46).

### CS Lens

This is the identical design discipline Lesson 46 established for `tree-height`, applied here to a procedure that generates a whole collection rather than a single number — confirming the leap-of-faith method works for enumeration exactly as well as it worked for a numeric invariant. Also recognized in: a manufacturing planner deriving a complete parts list by trusting a supplier's own already-verified sub-assembly list, without re-deriving its contents; a genealogist deriving a complete family list by trusting an ancestor's own already-researched descendant list; an editor deriving a complete table of contents by trusting each chapter's own already-finalized section list.

### SE Lens

The alternative to deriving the recursive case in prose first is to start writing code immediately and hope the right structure emerges. The real cost of that alternative, for a procedure returning an entire collection rather than a single value, is a much higher risk of a subtly wrong combining rule — missing the "with it included" half, say, or accidentally duplicating the "without it" half. Deriving the exact combining rule in prose before any code, as this unit does, costs the same discipline already established in Lesson 46; it produces a precise specification Concept Unit 3 can translate directly, rather than debug into existence.

---

## Concept Unit 3: A New Construct — let, for Naming a Value Used More Than Once

### The Problem

Concept Unit 2's combining rule needs `(all-subsets (cdr items))`'s result *twice* — once with `(car items)` added to each subset, once unchanged. Writing the call to `(all-subsets (cdr items))` twice in the actual code, rather than computing it once and reusing the result, has a real cost worth measuring directly before writing the final procedure.

### Introduce the Concept in Isolation

```scheme
(display (let ((x 5) (y 3)) (+ x y)))
(newline)
```

Run, producing real output:

```
$ guile let1.scm
8
```

Verified this session. `(let ((x 5) (y 3)) (+ x y))` binds `x` to `5` and `y` to `3`, then evaluates `(+ x y)` using those bindings — a reappearance of *binding* (Lesson 5), now as real, callable syntax that scopes its bindings to exactly the expression that follows.

This isolated example is discarded now; it will not appear in this lesson's real project again.

### Project Change

**Reference Source:** No reference counterpart — a from-scratch introduction of Scheme's `let` special form.

**Files affected:** A new throwaway file, `let1.scm`.

**Change type:** Add (new, temporary file).

**Location:** Not applicable.

**Dependencies:** The Guile interpreter.

### Applying It — Measuring What Writing a Call Twice Actually Costs

**A version of `all-subsets` written the naive way, calling `(all-subsets (cdr items))` twice, instrumented to count its own calls, applied to a ten-item list:**

```
$ guile wasteful.scm
calls: 2047
```

Verified this session.

**The same procedure, rewritten to compute `(all-subsets (cdr items))` once, using `let`, and reuse the result — instrumented the identical way, on the identical ten-item list:**

```
$ guile efficient.scm
calls: 11
```

Verified this session — `2047` calls versus `11`, on the exact same input, for procedures that produce the exact same output.

**Connecting this directly to Lesson 31's own warning:** this is precisely the redundant-computation risk Lesson 31 found inside `fib`'s two recursive calls, `fib(2)` recomputed independently rather than shared — except here, writing `(all-subsets (cdr items))` twice doesn't just redo one subtree's worth of work; because each level's redundancy compounds with every level beneath it, the wasted work grows exponentially with list length, exactly matching `2047 = 2¹¹ − 1` against `11`'s plain, linear growth.

### Walkthrough

- **`(let ((x 5) (y 3)) (+ x y))`** — first appearance of `let`, binding two names for use in one following expression.
- **`2047` calls, the naive double-call version** — confirms, with real, measured numbers, that writing a recursive call twice is not merely inelegant; it has genuine, compounding cost.
- **`11` calls, the `let`-based version** — confirms the fix: computing `(all-subsets (cdr items))` exactly once per level, naming it, and reusing the name, reduces the same computation from exponential to linear growth in the number of calls made.
- **The explicit connection to `fib`'s redundancy (Lesson 31)** — not a new concept, but the recognition that this is the identical risk, now caught and fixed deliberately rather than merely observed.

### CS Lens

This is a direct, measured demonstration of the difference between computing something once and naming it, versus computing it again every place it's needed — the single most common, avoidable source of exponential blowup in otherwise-correct recursive code. Also recognized in: a company recalculating the same expensive report from scratch for every department that needs it, instead of computing it once and distributing the result; a construction project re-surveying the same plot of land for every contractor, instead of sharing one survey; a research team re-deriving the same intermediate result for every paper that needs it, instead of citing a single, shared derivation.

### SE Lens

The alternative to using `let` here is to accept `2047` calls as simply "how expensive generating subsets is" — a plausible-sounding but false conclusion, since the *correct* number of subsets, `2¹⁰ = 1024`, doesn't require anywhere near `2047` calls to produce; the excess is pure, avoidable waste from redundant recomputation. The real cost of accepting that false conclusion would be believing enumeration is inherently more expensive than it actually is, potentially avoiding a perfectly practical technique out of an unfounded fear of its cost. Using `let`, as this unit demonstrates with real, measured numbers, costs nothing beyond naming a value once; it is the difference between a procedure whose cost roughly matches the size of its actual output and one that wastes exponentially more work than its output requires.

---

## Concept Unit 4: The Complete all-subsets Procedure, Verified

### The Problem

Concept Unit 2 supplied the derivation; Concept Unit 3 supplied the tool needed to implement it without waste. It's time to write the real, final procedure and check it thoroughly.

### The New Code — Type It Yourself

```scheme
(define (all-subsets items)
  (if (null? items)
      (list '())
      (let ((rest-subsets (all-subsets (cdr items))))
        (append (map (lambda (s) (cons (car items) s)) rest-subsets)
                rest-subsets))))
```

### The Updated Project

This is `all-subsets.scm`, in full:

```scheme
(define (all-subsets items)
  (if (null? items)
      (list '())
      (let ((rest-subsets (all-subsets (cdr items))))
        (append (map (lambda (s) (cons (car items) s)) rest-subsets)
                rest-subsets))))

(display (all-subsets (list 1 2 3)))
(newline)
```

### Reference Source

Concept Unit 2's derivation, translated directly: `(list '())` for the base case; `let` binding `rest-subsets` once (Concept Unit 3); `map` (Lesson 34) adding `(car items)` to each subset in the "included" half; `append` (Lesson 37) combining both halves.

### Files affected

Created: `all-subsets.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile all-subsets.scm
((1 2 3) (1 2) (1 3) (1) (2 3) (2) (3) ())
```

Verified this session — all eight subsets of `(1 2 3)`, matching Concept Unit 1's hand-listed set exactly, just in a different order.

**Confirming the count matches `2ⁿ` for several list lengths:**

```
$ guile -q
scheme@(guile-user)> (define (all-subsets items) (if (null? items) (list '()) (let ((rest-subsets (all-subsets (cdr items)))) (append (map (lambda (s) (cons (car items) s)) rest-subsets) rest-subsets))))
scheme@(guile-user)> (length (all-subsets (list 1 2 3)))
$1 = 8
scheme@(guile-user)> (length (all-subsets (list 1 2 3 4 5)))
$2 = 32
scheme@(guile-user)> (length (all-subsets '()))
$3 = 1
```

Verified this session — `8 = 2³`, `32 = 2⁵`, and `1 = 2⁰` for the empty list, exactly matching the exponential count this lesson's own comparison in Concept Unit 3 already measured directly.

### Mechanical Walkthrough

- **`(if (null? items) (list '()) ...)`** — the base case, `(list '())`: a list containing exactly the empty subset — a reappearance of Concept Unit 2's precise distinction, now checked directly against real output.
- **`(let ((rest-subsets (all-subsets (cdr items)))) ...)`** — first appearance of `let` in the real, kept project, computing the recursive call exactly once, exactly the fix Concept Unit 3 demonstrated saves real, measured work.
- **`(map (lambda (s) (cons (car items) s)) rest-subsets)`** — a reappearance of `map` (Lesson 34), building the "included" half by adding `(car items)` to the front of every already-generated smaller subset.
- **`(append ... rest-subsets)`** — a reappearance of `append` (Lesson 37), combining the "included" half with the unchanged "excluded" half, `rest-subsets` itself.

### CS Lens

This is a complete, correct, efficiently-derived enumeration procedure — the concrete, working answer to Concept Unit 1's original question — checked both against a hand-listed small example and against the general `2ⁿ` count this lesson's own measurements already confirmed. Also recognized in: a complete parts catalog, generated once and verified against both a specific known assembly and a general count of expected parts; a complete genealogical chart, generated once and verified against both a specific known relative and a general expected family size; a complete inventory listing, generated once and verified against both a specific known item and a general expected total count.

### SE Lens

The alternative to checking both a specific example and the general count is to trust the procedure because it ran without error and produced *some* list. The real cost of that alternative is exactly Lesson 29's warning about a plausible-looking but unverified result — a procedure with a subtly wrong combining rule (missing one subset, or duplicating another) could still produce output that looks reasonable at a glance. Checking both the exact contents for a small case and the count for several larger ones, as this unit does, costs two kinds of verification instead of one; it confirms `all-subsets` is correct in the same strong sense this curriculum has demanded since Lesson 22, not merely plausible.

---

## Concept Unit 5: Connecting Generation Back to Search

### The Problem

Lesson 49's `can-sum-to?` searched directly, without ever building an explicit list of subsets. It's worth closing this lesson by connecting the two techniques explicitly — confirming that `can-sum-to?`'s question *could* be answered by generating everything and then checking, and being honest about why that's usually the worse choice.

### No isolated lab for this step

This concept has no code of its own to isolate — the connection is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Two Ways to Answer the Same Question

**`can-sum-to?`'s question, answerable via generation instead:** does any subset of `(3 7 5 2)` sum to `9`? Equivalently: does `9` appear as the sum of any list in `(all-subsets (list 3 7 5 2))`?

**Confirming this equivalence directly, using tools already fully verified:**

```
$ guile -q
scheme@(guile-user)> (define (all-subsets items) (if (null? items) (list '()) (let ((rest-subsets (all-subsets (cdr items)))) (append (map (lambda (s) (cons (car items) s)) rest-subsets) rest-subsets))))
scheme@(guile-user)> (define (my-sum lst) (if (null? lst) 0 (+ (car lst) (my-sum (cdr lst)))))
scheme@(guile-user)> (define (any-sums-to-9? lst) (if (null? lst) #f (or (= (my-sum (car lst)) 9) (any-sums-to-9? (cdr lst)))))
scheme@(guile-user)> (any-sums-to-9? (all-subsets (list 3 7 5 2)))
$1 = #t
```

Verified this session — agreeing with `can-sum-to?`'s already-verified `#t` for the identical question.

**Stating honestly why `can-sum-to?`'s original approach (Lesson 49) is usually still the better choice:** generating all sixteen subsets of a four-item list first, then checking each one's sum, does strictly more work than `can-sum-to?`'s direct search, which can stop the instant one satisfying subset is found — exactly Lesson 49, Concept Unit 4's, own measured early-termination advantage. Generation is the right tool specifically when *every* possibility is genuinely needed, as this lesson's own `all-subsets` does; it is the wrong tool when only existence or one example matters, and Lesson 49 and Lesson 50's direct search techniques remain the better choice for those questions.

### Walkthrough

- **`any-sums-to-9?` applied to `(all-subsets (list 3 7 5 2))`** — demonstrates the generate-then-check approach directly, using this lesson's own verified `all-subsets` alongside `sum-list`'s logic (Lesson 33).
- **The agreement with `can-sum-to?`'s already-established answer** — a reappearance of the independent cross-verification discipline (Lesson 22, Lesson 42), confirming the two approaches genuinely answer the same question.
- **The honest closing comparison** — not a new concept, but a direct, final statement of when each of this lesson's and Lesson 49's techniques is actually the right choice, in the same spirit as every other tool-choice comparison this curriculum has made (Lesson 36's `map` versus `fold`, Lesson 48's mutual recursion versus a single flagged procedure).

### CS Lens

This is the recognition that generation and search are related but distinct techniques over the same underlying space — generation answers "what are they all," search answers "does one exist" or "find one" — and that a problem shaped like the second question is usually solved better by search directly, even though generation could technically answer it too. Also recognized in: a research process that could catalog every possible explanation before selecting one, but usually reasons directly toward a single plausible explanation instead; a shopping process that could list every possible outfit combination before choosing one, but usually decides directly instead; a scheduling process that could enumerate every possible arrangement before picking one, but usually reasons directly toward a workable arrangement instead.

### SE Lens

The alternative to stating this comparison honestly is to leave the impression that this lesson's enumeration technique is a strictly more powerful replacement for Lesson 49 and Lesson 50's direct search. The real cost of that impression would be real, avoidable waste — using `all-subsets` and then filtering, for a question that only ever needed existence or one witness, when direct search would answer the identical question doing strictly less work, exactly the way Concept Unit 3 already demonstrated redundant computation compounds badly. Stating plainly when each technique is the right one, as this unit does, costs one honest closing comparison; it leaves this curriculum's three search-and-generation techniques — Lesson 49, Lesson 50, and this lesson — as three genuinely different tools, each with its own clear job, rather than one technique made to seem obsolete by another.

---

## Closing

### Connect the pieces

One list, `(1 2 3)`, and one ten-item measurement, traced through every unit built in this lesson, start to finish:

1. **The third question named (Unit 1):** not existence, not one witness, but every possibility — eight subsets of `(1 2 3)`, listed by hand.
2. **The recursive case derived by leap of faith (Unit 2):** the precise combining rule — every subset of the rest, with and without the current item — stated in prose before any code.
3. **`let` introduced, and its cost measured directly (Unit 3):** `2047` calls without it, `11` with it, on the identical ten-item list — the exact redundancy Lesson 31 first found inside `fib`.
4. **The complete procedure, verified two ways (Unit 4):** `all-subsets`, checked against a hand-listed small example and against `2ⁿ` for several list lengths.
5. **Generation connected back to search, honestly (Unit 5):** the same question answered both ways, agreeing exactly, with a direct, honest statement of when each technique is actually the better choice.

Unit 4's verified `all-subsets` is the exact procedure Unit 5 uses to answer `can-sum-to?`'s original question a second way — not a fresh example, but this lesson's own real, kept artifact, checked against Lesson 49's independently established answer.

### What breaks without this

Suppose a real inventory or configuration system needed to generate every valid combination of optional components for a product, and its author, unfamiliar with `let`'s specific role, wrote the natural-looking recursive case calling itself twice, the way Concept Unit 3's wasteful version did. For a small number of options, this would run acceptably, and nothing about testing at that scale would reveal a problem — exactly the same trap Lesson 37 already demonstrated for `naive-reverse`. As the number of optional components grew even modestly — the same doubling Concept Unit 3 measured, from `2047` calls at ten items — the system would become dramatically, and then completely impractically, slow, long before the actual number of valid combinations became too large to be useful. Restoring this lesson's discipline — naming a recursive call's result once with `let`, whenever it's needed more than once, rather than writing the call out repeatedly — is what keeps an enumeration procedure's cost proportional to what it's actually generating, rather than needlessly, exponentially inflated by redundant recomputation.

### Exercises

1. **Observe.** Choose a small collection of your own (four or five items) and list every one of its subsets by hand, the way Concept Unit 1 listed all eight subsets of `(1 2 3)`.
2. **Formalize.** Derive `all-subsets`-style reasoning for a different collection-generation task of your choosing (every possible pairing of two lists, every possible ordering of three items, or similar), stating the base case and recursive case in prose first, following Concept Unit 2's leap-of-faith method.
3. **Formalize.** Implement your Exercise 2 derivation in real Scheme, using `let` deliberately wherever a recursive call's result is needed more than once.
4. **Explain.** Write a deliberately wasteful version of your Exercise 3 procedure, calling the same recursive call twice instead of using `let`, and instrument both versions to count their real calls on a moderately sized input, the way Concept Unit 3 compared `2047` against `11`.
5. **Explain.** For a search-shaped question related to your Exercise 1 collection (does some subset satisfy a property, say), compare answering it by generating everything and filtering versus searching directly, the way Concept Unit 5 compared the two approaches to `can-sum-to?`'s question.

### Definition of done

- [ ] You can derive a collection-generating recursive procedure's base case and recursive case in prose, using the leap-of-faith method, before writing any code.
- [ ] You can use `let` correctly to name a value computed once and used more than once within a procedure.
- [ ] You can measure, with real instrumented code, the actual cost difference between writing a recursive call twice and using `let` to compute it once.
- [ ] You can explain when generating every possibility is the right technique, and when a direct search (Lesson 49 or Lesson 50) is a better choice for the same underlying question.
- [ ] You completed Exercises 1–5 using your own collection and generation task, not subsets of `(1 2 3)`.
- [ ] Commit `all-subsets.scm`, your Exercise 3 procedure, and your Exercise 4 measurements, with a commit message stating the actual measured call-count difference your Exercise 4 comparison found.
