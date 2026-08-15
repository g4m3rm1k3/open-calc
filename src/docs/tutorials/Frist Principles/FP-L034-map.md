# Lesson 34: Map

**What you will build:** A real, working `my-map` procedure that takes another procedure as one of its own arguments, plus confirmation that it computes exactly what Scheme's own built-in `map` computes. The transferable problem this lesson is actually about: Lesson 33's template combined a list's items into a number or a Boolean value — never into another list. Transforming every item of a list into a new list of transformed items needs `<combine>` to be `cons`, and generalizing *which* transformation gets applied needs something this curriculum has never done before: passing a function itself as an ordinary argument to another function.

**What you need to know first:** Lesson 7 (`FP-L007-functions-as-transformations.md`) — specifically *function*, *parameter*, and *argument*, all directly extended to functions that take other functions as arguments. Lesson 32 (`FP-L032-lists.md`) — specifically `cons`, `car`, `cdr`, and `null?`, all reused directly. Lesson 33 (`FP-L033-processing-a-list.md`) — specifically the structural-recursion template and its derivation process, both applied directly in Concept Unit 2.

**Terms introduced in this lesson**

- **Higher-order function** — a function that takes another function as one of its own parameters, or produces a function as its own result. Every function this curriculum has built before this lesson has taken only plain values as parameters; `my-map`, taking a procedure as one of its two arguments, is this curriculum's first higher-order function.
- **Map** — the specific, common pattern of a higher-order function that takes a function `f` and a list, and produces a new list containing `f` applied to every item, in the same order, with the same length as the original.

## Objects and methods used

- **`map`**
  - *What it is:* Scheme's own built-in procedure implementing this lesson's central pattern.
  - *Implementation:* takes a procedure and one or more lists, applying the procedure to corresponding items and collecting the results into a new list; confirmed this session as `(map (lambda (x) (* 2 x)) scores)`.
  - *Its use:* Concept Unit 4 checks `my-map`'s output against Scheme's real `map`, confirming the hand-derived version computes exactly what the language's own built-in procedure computes.

---

## Concept Unit 1: A New Kind of Combine — Building a List Instead of a Number

### The Problem

`sum-list` and `my-length` (Lessons 32 and 33) both combined a list's items down into a single number. Doubling every score in a list — turning `(91 85 72)` into `(182 170 144)` — needs something structurally different: the result of processing a list is, this time, itself supposed to be a list, not a single value.

### The New Code — Type It Yourself

```scheme
(define (double-all lst)
  (if (null? lst)
      '()
      (cons (* 2 (car lst)) (double-all (cdr lst)))))
```

### The Updated Project

This is `double-all.scm`, in full:

```scheme
(define (double-all lst)
  (if (null? lst)
      '()
      (cons (* 2 (car lst)) (double-all (cdr lst)))))

(define scores (cons 91 (cons 85 (cons 72 '()))))

(display (double-all scores))
(newline)
```

### Reference Source

Lesson 33 (`FP-L033-processing-a-list.md`), Concept Unit 2's template, filled in with a genuinely different kind of `<base-value>` and `<combine>` than any prior instance.

### Files affected

Created: `double-all.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter, and `scores`.

### Run It — Show the Real Output

```
$ guile double-all.scm
(182 170 144)
```

Verified this session — `91 × 2 = 182`, `85 × 2 = 170`, `72 × 2 = 144`, in the original order.

### Mechanical Walkthrough

- **`(if (null? lst) '() ...)`** — the base case, `'()` rather than `0` or `#f`: doubling every item of an empty list produces another empty list, exactly as the template's `<base-value>` blank requires answering "what should this operation produce for an empty list," here answered with a list rather than a number.
- **`(cons (* 2 (car lst)) (double-all (cdr lst)))`** — the combine step: `(* 2 (car lst))` transforms the first item, and `cons` places it onto the front of the recursive result — a reappearance of `cons` (Lesson 32), used here as the template's `<combine>` for the first time.
- **`(182 170 144)`, matching the original order exactly** — confirms the recursive structure (processing the first item, then consing it onto everything that follows) naturally preserves order, without anything needing to track position separately.

### CS Lens

This is confirmation that Lesson 33's template is general enough to produce a new list, not just a summary value — `<combine>` was always a blank to be filled in with whatever the specific problem needs, and "build a new list" turns out to be exactly as legitimate a filling as "add" or "check equality" was. Also recognized in: an assembly line where each station doesn't reduce the product to a summary count, but transforms it and passes the transformed item onward; a photo-editing batch process that transforms every image in a folder into a new, edited version, preserving the folder's original structure; a translation service that transforms every sentence in a document into a new sentence, preserving the document's original order; a currency-conversion tool that transforms every price in a list into a new price, in the original currency's order.

### SE Lens

The alternative to recognizing this as another instance of the same template is to treat "transforming a list into a new list" as an unrelated, freshly invented problem. The real cost of that alternative is losing exactly the benefit Lesson 33 built: a base case and recursive case still need deriving, and without recognizing the template's applicability, that derivation risks being done less carefully — forgetting to check the empty-list case, for instance, the same omission Lesson 27 already warned costs a working definition entirely. Recognizing `double-all` as a template instance, as this unit does, costs nothing beyond noticing the connection; it carries forward every guarantee Lesson 33 already established about the template's reliability.

---

## Concept Unit 2: Map — Passing a Function as a Value

### The Problem

`double-all` only ever doubles. A procedure that added one to every score, or squared every score, would need its own, separately written version, each one differing from `double-all` in exactly one place — the specific transformation applied to each item — while everything else about the structure stays identical. This is exactly the kind of un-generalized repetition Lesson 7 first diagnosed, except this time the thing that needs to vary between uses isn't a plain value; it's the transformation itself.

### The New Code — Type It Yourself

```scheme
(define (my-map f lst)
  (if (null? lst)
      '()
      (cons (f (car lst)) (my-map f (cdr lst)))))
```

### The Updated Project

This is `my-map.scm`, in full:

```scheme
(define (my-map f lst)
  (if (null? lst)
      '()
      (cons (f (car lst)) (my-map f (cdr lst)))))

(define (double x) (* 2 x))
(define scores (cons 91 (cons 85 (cons 72 '()))))

(display (my-map double scores))
(newline)
```

### Reference Source

`double-all.scm` (Concept Unit 1), with its hardcoded `(* 2 (car lst))` generalized into `(f (car lst))`, `f` itself supplied as a new parameter.

### Files affected

Created: `my-map.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile my-map.scm
(182 170 144)
```

Verified this session — identical to `double-all.scm`'s output, confirming the generalized version still computes doubling correctly when `double` is supplied as `f`.

### Mechanical Walkthrough

- **`(define (my-map f lst) ...)`** — first appearance of a procedure whose parameter, `f`, stands for a function rather than a plain value — a reappearance of *parameter* (Lesson 7), extended here to accept a genuinely new kind of argument.
- **`(f (car lst))`** — first appearance of *applying* a parameter as though it were an ordinary procedure name, a reappearance of *application* (Lesson 7), now performed on a value that was itself passed in as an argument rather than `define`d directly.
- **`(my-map double scores)`** — `double`, itself a `define`d procedure, passed as `my-map`'s first argument — the concrete demonstration of *higher-order function*: a function, `double`, used here as an ordinary value, exactly the way `91` or `scores` would be.
- **The identical output to `double-all.scm`** — confirms the generalization changed nothing about *what* gets computed when `f` happens to be `double`; it only added the ability to supply something other than `double`.

### CS Lens

This is the recognition that a function is not fundamentally different from any other value this curriculum has already built — it can be bound to a name (Lesson 5), passed as an argument (Lesson 7), and, as this unit shows for the first time, received as a parameter by another function entirely. Also recognized in: a manager delegating "how to do this task" to whichever specialist is handed the assignment, rather than doing every task the identical way personally; a universal remote control, configured with a specific device's command set as a kind of pluggable behavior; a power drill, which performs "drilling" using whichever bit is currently attached, the bit itself a kind of pluggable behavior; a translation service that applies whichever specific language pair's rules are selected, the rules themselves supplied rather than fixed.

### SE Lens

The alternative to generalizing `double-all` into `my-map` is to write a separate, nearly identical procedure for every transformation ever needed — `double-all`, `add-one-to-all`, `square-all`, each one differing in exactly one line. The real cost of that alternative is precisely Lesson 7's original repetition cost, now recurring at the level of entire procedure definitions rather than individual calculations: every new transformation needs its own full copy of the base case, the recursive case, and the `cons`-based combining logic, with only the transformation itself actually varying. Generalizing to `my-map`, as this unit does, costs the conceptual step of treating a function as passable data; it means every future transformation needs only the transformation itself supplied, with the entire surrounding structure — base case, recursion, order preservation — written exactly once.

---

## Concept Unit 3: Checking my-map Against Different Functions

### The Problem

`my-map` has only ever been tried with `double`. Confirming it genuinely works for *any* function, not just the one it happened to be developed alongside, means trying it with something else entirely and checking the result independently.

### No isolated lab for this step

This concept has no code of its own to isolate — a second, different function applied through `my-map` is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — A Different Transformation

**A second, differently-behaved function:** `(define (add-one x) (+ x 1))`.

**Applying `my-map` with this new function, changing nothing about `my-map` itself:**

```scheme
(display (my-map add-one scores))
```

**Predicting the result before running it, using `scores`'s known values, `91, 85, 72`:** `92, 86, 73`.

**Running it for real:**

```
$ guile -q
scheme@(guile-user)> (define (my-map f lst) (if (null? lst) '() (cons (f (car lst)) (my-map f (cdr lst)))))
scheme@(guile-user)> (define (add-one x) (+ x 1))
scheme@(guile-user)> (my-map add-one (cons 91 (cons 85 (cons 72 '()))))
$1 = (92 86 73)
```

Verified this session, matching the prediction exactly.

### Walkthrough

- **`(define (add-one x) (+ x 1))`** — a second, deliberately different function, chosen specifically to confirm `my-map` isn't secretly tied to `double`'s specific behavior.
- **The prediction, `92, 86, 73`, made before running anything** — a reappearance of the predict-then-verify discipline this curriculum has used since its earliest exercises, applied here to confirm genuine understanding rather than just pattern-matching against a previous result.
- **The REPL output, matching the prediction** — confirms `my-map` genuinely generalizes: not one procedure that happens to also work for `add-one`, but a procedure that correctly applies whatever function it's given.

### CS Lens

This is the same reuse-confirmation Lesson 7, Concept Unit 5, already established for `total_with_tax` — applying an already-defined, reusable procedure to new arguments and confirming it works correctly without needing to be rewritten — now applied to a higher-order function, where the "new argument" is itself an entire function rather than a plain value. Also recognized in: a universal remote confirmed to work correctly with a second, different television model, not just the one it was first configured with; a power drill confirmed to work correctly with a second, different bit; a translation service confirmed to work correctly for a second, different language pair; a manager's delegation process confirmed to work correctly with a second, different specialist.

### SE Lens

The alternative to trying a second function is to trust `my-map`'s correctness based on a single successful case, `double`. The real cost of that alternative is exactly Lesson 22's warning about evidence from a single example: one successful case suggests, but does not establish, that `my-map` handles the general case of "any function" correctly rather than something specific to `double`'s own particular arithmetic. Trying a second, meaningfully different function and predicting its result beforehand, as this unit does, costs one small additional check; it is a genuine, if modest, strengthening of the evidence that `my-map` is correctly general.

---

## Concept Unit 4: Scheme's Real map Procedure

### The Problem

`my-map` was built entirely from first principles, to understand exactly how this pattern works underneath. Scheme already provides this exact pattern as a built-in procedure, and it's worth confirming directly that the hand-built version and the language's own version agree.

### No isolated lab for this step

This concept has no code of its own to isolate — comparing `my-map` against Scheme's real `map` is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — Comparing the Two

**Scheme's own built-in `map`, applied to the exact same function and list:**

```scheme
(display (map double scores))
```

**Running both `my-map` and the real `map` side by side:**

```
$ guile -q
scheme@(guile-user)> (define (my-map f lst) (if (null? lst) '() (cons (f (car lst)) (my-map f (cdr lst)))))
scheme@(guile-user)> (define (double x) (* 2 x))
scheme@(guile-user)> (define scores (cons 91 (cons 85 (cons 72 '()))))
scheme@(guile-user)> (my-map double scores)
$1 = (182 170 144)
scheme@(guile-user)> (map double scores)
$2 = (182 170 144)
```

Verified this session — identical results.

**Naming what this confirms, and what it doesn't:** this confirms `my-map` and Scheme's built-in `map` agree for this specific function and list — evidence, exactly in Lesson 22's sense, not a proof that they agree for every possible function and list. From this point forward in this curriculum, the built-in `map` is used directly, exactly the way Lesson 23 trusted an already-proven fact without re-deriving it — here, trusted on the strength of having independently built and checked an equivalent version, rather than on an actual proof of the built-in's internals.

### Walkthrough

- **`(map double scores)`** — first appearance of Scheme's built-in `map` (see Objects and methods used), applied identically to Concept Unit 2's `(my-map double scores)`.
- **Both producing `(182 170 144)`** — confirms the two agree on this case.
- **The explicit, honest statement of what agreement on one case does and doesn't establish** — a direct reappearance of Lesson 22's evidence-versus-proof distinction, applied here to comparing a hand-built procedure against a language's own built-in one.

### CS Lens

This is the same relationship Lesson 22 and Lesson 31 already established between reasoning and real, checked output — building `my-map` from first principles and then confirming it against an independent, already-trusted implementation, exactly the way a from-scratch derivation is often checked against a known-good reference before being trusted going forward. Also recognized in: a student solving a problem by hand and checking the answer against a calculator, before trusting hand-solving for similar problems; an engineer building a prototype and checking its behavior against an established reference design; a translator producing a translation and checking it against a professionally published one; a from-scratch reimplementation of a standard algorithm, checked against the standard library's own version before being trusted.

### SE Lens

The alternative to building `my-map` at all, before ever using the real `map`, is to simply start using Scheme's built-in procedure without ever seeing what it does underneath. The real cost of that alternative is exactly the black-box risk this curriculum's own schema warns against: a procedure that can be used correctly without being understood, leaving a learner unable to predict its behavior in an unfamiliar situation, or to write a similar higher-order function for a case the built-in `map` doesn't cover. Building `my-map` first, and only then switching to the built-in version once they're confirmed to agree, as this lesson does, costs the extra work of Concept Units 1 through 3; it buys a `map` that is understood all the way down, not merely used.

---

## Concept Unit 5: Map Preserves Length — A Property Worth Stating and Checking

### The Problem

Every example so far has, incidentally, produced a result the same length as its input. It's worth stating this as an actual property of `map`, not just an unremarked coincidence, and checking it directly using a tool this curriculum already has.

### No isolated lab for this step

This concept has no code of its own to isolate — checking the length-preservation property is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Checking Length Before and After

**The property, stated precisely:** for any function `f` and any list `lst`, `(my-length (map f lst))` equals `(my-length lst)` — mapping never adds or removes items, only transforms them in place.

**Checking this directly, using Lesson 32's `my-length` and `scores`:**

```
$ guile -q
scheme@(guile-user)> (define (my-length lst) (if (null? lst) 0 (+ 1 (my-length (cdr lst)))))
scheme@(guile-user)> (define scores (cons 91 (cons 85 (cons 72 '()))))
scheme@(guile-user)> (my-length scores)
$1 = 3
scheme@(guile-user)> (my-length (map (lambda (x) (* 2 x)) scores))
$2 = 3
```

Verified this session — both `3`, confirming the property for this specific case.

**Explaining, briefly, why this must always be true, rather than merely happening to be true here:** every application of the structural-recursion template's combine step, when it's `cons` (Concept Unit 1), adds exactly one item to the result for exactly one item consumed from the input — never zero, never two. Following the recursion all the way down to the shared base case, `'()` for both `map`'s result and the original list's own recursive structure, the two lists are built with exactly the same number of `cons` steps, guaranteeing the same length.

### Walkthrough

- **The property, stated as a general claim about any `f` and `lst`** — first explicit statement of *map*'s length-preserving behavior as a property worth naming, not just an incidental observation.
- **`(my-length scores)` and `(my-length (map ... scores))`, both `3`** — a reappearance of `my-length` (Lesson 32), used here as an independent checking tool rather than as the subject being studied.
- **The brief structural explanation, connecting to Concept Unit 1's `cons`-based combine step** — not a new concept, but a direct, honest gesture at *why* the property holds in general, distinguished from merely re-confirming it on one more example.

### CS Lens

This is the practice of stating an invariant — a property guaranteed to hold across every use of a procedure, not just the cases happened to be tried — the same discipline Lesson 9's postconditions already established for ordinary functions, here applied to a higher-order one. Also recognized in: a translation service guaranteed to produce one translated sentence per original sentence, never merging or splitting any; a currency converter guaranteed to produce one converted price per original price; a photo batch-processor guaranteed to produce one edited photo per original photo; a manufacturing line guaranteed to produce exactly one finished unit per raw unit fed in.

### SE Lens

The alternative to stating this property explicitly is to notice, informally, that `map`'s outputs have "seemed" the same length as their inputs across the examples tried, without ever stating or checking this as an actual guarantee. The real cost of that alternative is exactly Lesson 9's original argument for stating postconditions precisely: a property relied on implicitly, but never checked or stated, is a property a later mistake could silently violate without anyone noticing until something downstream, expecting matched lengths, breaks. Stating the property explicitly and checking it with `my-length`, as this unit does, costs one small additional verification; it turns an unspoken assumption into a checked, statable guarantee this curriculum can build on with the same confidence as any other established postcondition.

---

## Closing

### Connect the pieces

One list, `scores`, traced through every unit built in this lesson, start to finish:

1. **A new kind of combine (Unit 1):** `double-all`, building a new list with `cons`, following Lesson 33's template with a genuinely different `<base-value>` and `<combine>`.
2. **The transformation itself generalized (Unit 2):** `my-map`, taking a function `f` as a parameter — this curriculum's first higher-order function.
3. **Checked against a second function (Unit 3):** `add-one`, applied through `my-map`, matching a prediction made before running it.
4. **Checked against Scheme's own built-in (Unit 4):** `my-map` and `map`, applied identically, producing identical results.
5. **A stated, checked invariant (Unit 5):** `map`'s result always the same length as its input, confirmed using `my-length` and briefly explained structurally.

Unit 5's length check applies directly to Unit 4's exact comparison — the same `scores`, the same doubling transformation, examined one more time for a property neither of the first four units had explicitly named.

### What breaks without this

Suppose a later piece of code assumed, without ever having checked or stated it explicitly, that mapping a transformation over a list of student records would always produce one result per original record — and then relied on that assumption to match each mapped result back up with its original record by position, the way pairing two same-length lists item by item requires. If a custom, hand-written mapping procedure were ever introduced that didn't actually preserve this property — one that, say, silently dropped a record when a transformation produced an error, rather than propagating the error or including a placeholder — every downstream position-based pairing would silently shift out of alignment the moment a single record was dropped, associating each subsequent result with the wrong original record, with no error or warning of any kind. Restoring this lesson's discipline — stating length-preservation as an explicit, checked property of any procedure claiming to be a `map`, the way Concept Unit 5 did — is what would catch a violation like this immediately, rather than allowing a silent misalignment to propagate through everything built on top of the unstated assumption.

### Exercises

1. **Observe.** Write a transformation of your own (something other than doubling or adding one) as a named function, the way Concept Unit 2 defined `double`.
2. **Formalize.** Apply your Exercise 1 function through `my-map` to a list of your own choosing, predicting the result before running it, the way Concept Unit 3 predicted `add-one`'s output.
3. **Explain.** Apply Scheme's built-in `map` to the same function and list, and confirm it matches your `my-map` result exactly, the way Concept Unit 4 compared the two.
4. **Explain.** Check the length-preservation property for your Exercise 2 result, using `my-length`, the way Concept Unit 5 did for `scores`.
5. **Formalize.** Write a second higher-order function of your own, following `my-map`'s exact shape but with a different combine step (not `cons`) — for instance, a function that takes `f` and a list and counts how many items satisfy some condition after `f` is applied. State its base case and combine step explicitly before writing any code.

### Definition of done

- [ ] You can explain what makes `my-map` a higher-order function, and why none of this curriculum's earlier functions qualified as one.
- [ ] You can trace `my-map`'s execution by hand for a small list and function, showing each `cons` step explicitly.
- [ ] You can state map's length-preservation property precisely and explain, briefly, why it must hold structurally, not just because it happened to hold in the examples checked.
- [ ] You can compare a hand-built procedure against a language's built-in equivalent and state honestly what agreement on a few cases does and doesn't establish.
- [ ] You completed Exercises 1–5 using functions of your own choosing, not `double` or `add-one`.
- [ ] Commit your Exercise 1, 2, and 5 procedures, with a commit message stating which part of writing a higher-order function felt least like anything in this curriculum's earlier lessons.
