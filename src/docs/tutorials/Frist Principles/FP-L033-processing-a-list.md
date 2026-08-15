# Lesson 33: Processing a List

**What you will build:** Three real, running list-processing procedures — summing, searching, and finding a maximum — derived not by thinking up each one from scratch, but by filling in the blanks of a single template that comes directly from a list's own recursive definition. The transferable problem this lesson is actually about: Lesson 32 showed that `my-length` happened to follow the same shape as `factorial`; this lesson shows that shape is not a coincidence specific to counting — it is a direct consequence of how a list itself is defined, and any procedure that processes a list correctly can be derived from that definition rather than invented freshly each time.

**What you need to know first:** Lesson 9 (`FP-L009-preconditions-and-postconditions.md`) — specifically *precondition*, reused directly in Concept Unit 4. Lesson 32 (`FP-L032-lists.md`) — specifically *pair*, *list*, `cons`, `car`, `cdr`, `null?`, and `my-length`, all directly extended throughout this lesson.

**Terms introduced in this lesson**

- **Structural recursion** — deriving a recursive procedure's shape directly from the recursive definition of the data it processes, rather than by independently reasoning about the specific problem. A list is defined as either `'()` or an item combined with a smaller list (Lesson 32); a structurally recursive procedure over a list follows that exact shape — one case for `'()`, one case combining the first item with the result of processing the rest.

## Objects and methods used

- **`max`**
  - *What it is:* a real Scheme procedure that returns the largest of its arguments.
  - *Implementation:* takes one or more numbers and returns the greatest; confirmed this session as `(max (car lst) (max-list (cdr lst)))`, comparing two numbers at a time.
  - *Its use:* Concept Unit 4's `max-list` combines each item with the maximum of the rest using `max`, exactly the way `sum-list` combines each item with the sum of the rest using `+`.

---

## Concept Unit 1: A Template Emerges — Comparing Two List Procedures

### The Problem

Lesson 32 built `my-length`, counting a list's items. A genuinely different task — adding up a list of numbers — sounds like it should require different reasoning. It's worth building it and comparing the two procedures directly, side by side, to see whether that's actually true.

### The New Code — Type It Yourself

```scheme
(define (sum-list lst)
  (if (null? lst)
      0
      (+ (car lst) (sum-list (cdr lst)))))
```

### The Updated Project

This is `sum-list.scm`, in full:

```scheme
(define (sum-list lst)
  (if (null? lst)
      0
      (+ (car lst) (sum-list (cdr lst)))))

(define scores (cons 91 (cons 85 (cons 72 '()))))

(display (sum-list scores))
(newline)
(display (sum-list '()))
(newline)
```

### Reference Source

No independent reference — deliberately derived by comparison against Lesson 32's `my-length`, examined directly below.

### Files affected

Created: `sum-list.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter, and `scores`, reused from Lesson 32.

### Run It — Show the Real Output

```
$ guile sum-list.scm
248
0
```

Verified this session — `91 + 85 + 72 = 248`, and the empty list sums correctly to `0`.

### Mechanical Walkthrough

- **`(if (null? lst) 0 ...)`** — the base case, checking `null?` exactly the way `my-length` did, returning `0` where `my-length` returned `0` as well, though for a different reason: an empty list has no items to sum, just as it has no items to count.
- **`(+ (car lst) (sum-list (cdr lst)))`** — the recursive case: `(car lst)`, the first item, combined with `(sum-list (cdr lst))`, the sum of everything else — structurally identical to `my-length`'s `(+ 1 (my-length (cdr lst)))`, with `(car lst)` standing in for the literal `1`.
- **Comparing the two procedures directly, line for line:** both check `null? lst`; both return a fixed value in the base case; both combine something with a recursive call on `(cdr lst)` in the recursive case. The only genuine difference is *what* gets combined, and *how* — `1` added, versus `(car lst)` added.

### CS Lens

This is the first direct confirmation that two procedures solving different problems over the same kind of data can share nearly all of their structure — a strong hint that the structure itself, not the specific problem, is what's actually doing the organizing work. Also recognized in: two different assembly-line processes for two different products, sharing an identical sequence of stations because both products pass through the same kind of packaging; two different grading rubrics sharing an identical structure of stages because both grade the same kind of assignment; two different translations sharing an identical sentence structure because both render the same source grammar; two different tax forms sharing an identical layout because both process the same category of income.

### SE Lens

The alternative to comparing `sum-list` against `my-length` directly is to treat each new list-processing procedure as its own independent design problem, reasoned out from nothing each time. The real cost of that alternative is exactly Lesson 7's original repetition cost, applied to *procedure design* rather than to a single calculation: the same underlying decision (check `null?`, handle the base case, combine the first item with a recursive call on the rest) gets rediscovered from scratch every time, rather than reused. Comparing the two procedures explicitly, as this unit does, costs nothing beyond the comparison itself; it sets up Concept Unit 2's precise statement of what, exactly, is being reused.

---

## Concept Unit 2: The Template, Stated Explicitly

### The Problem

Concept Unit 1 noticed that `my-length` and `sum-list` share almost all of their structure. Stating that shared structure precisely, as a template with two blanks to fill in, is what actually makes it reusable for a procedure not yet written.

### No isolated lab for this step

This concept has no code of its own to isolate — the template is stated directly below, extracted from Concept Unit 1's own comparison, not through a construct with its own syntax.

### Applying It — Extracting the Template

**The shared shape, written with its two varying parts left as blanks:**

```scheme
(define (process lst)
  (if (null? lst)
      <base-value>
      (<combine> (car lst) (process (cdr lst)))))
```

**Filling in the blanks for `my-length`:** `<base-value>` is `0`; `<combine>` is a rule that ignores its first argument and adds `1` to its second — `my-length`'s actual code, `(+ 1 (my-length (cdr lst)))`, is this combine rule applied directly, with the "ignore the first argument" part folded into simply not using `(car lst)` at all.

**Filling in the blanks for `sum-list`:** `<base-value>` is `0`; `<combine>` is `+`, applied to the first item and the recursive result directly.

**Naming this template precisely:** structural recursion — a recursive procedure whose shape is derived directly from the list's own recursive definition (Lesson 32), rather than invented independently for each new problem.

### Walkthrough

- **The template, with `<base-value>` and `<combine>` left as blanks** — first appearance of *structural recursion*, stated as a fillable pattern rather than as an abstract description.
- **Filling in `my-length`'s and `sum-list`'s specific blanks** — a reappearance of both procedures from Lesson 32 and Concept Unit 1, now understood as two different instantiations of one shared template.
- **The direct connection to Lesson 32's list definition** — not a new concept, but the explicit statement of *why* this template has exactly this shape: it mirrors the base case (`'()`) and recursive case (an item plus a smaller list) that a list is itself defined by.

### CS Lens

This is the recognition of a design pattern — a reusable shape for solving a whole family of problems, extracted by generalizing from specific solved instances, exactly the same generalizing move Lesson 1 made from one instance of sorting to the general computational problem. Also recognized in: a cooking technique (like sautéing) that applies to many different specific ingredients, once the technique itself is understood as a reusable shape; a legal argument structure (state the rule, apply the facts, reach a conclusion) reused across many different specific cases; an architectural pattern (load-bearing wall placement) reused across many different specific building designs; a proof technique (like Lesson 23's direct proof) reused across many different specific claims.

### SE Lens

The alternative to naming the template explicitly is to leave the shared structure as an informal, unstated observation, the way Concept Unit 1 left it. The real cost of that alternative is that the pattern has to be rediscovered, or worse, half-remembered and reconstructed slightly wrong, every time a new list-processing procedure is needed. Naming the template precisely, with its two blanks explicitly identified, costs nothing beyond the act of writing it down; it is what makes Concept Unit 3's derivation of a brand-new procedure a matter of filling in blanks, rather than reasoning from first principles all over again.

---

## Concept Unit 3: Deriving a New Procedure by Following the Template

### The Problem

The real test of Concept Unit 2's template is whether it actually helps derive a procedure that hasn't been written yet, rather than merely explaining two that already had been. A search — does a given number appear anywhere in this list — is a genuinely different kind of question than counting or summing, and it's worth deriving it by filling in the template's blanks rather than reasoning about it independently.

### The New Code — Type It Yourself

```scheme
(define (contains? lst target)
  (if (null? lst)
      #f
      (if (= (car lst) target)
          #t
          (contains? (cdr lst) target))))
```

### The Updated Project

This is `contains.scm`, in full:

```scheme
(define (contains? lst target)
  (if (null? lst)
      #f
      (if (= (car lst) target)
          #t
          (contains? (cdr lst) target))))

(define scores (cons 91 (cons 85 (cons 72 '()))))

(display (contains? scores 85))
(newline)
(display (contains? scores 100))
(newline)
```

### Reference Source

Concept Unit 2's template, filled in explicitly below, and Lesson 13's *predicate* (a Boolean-valued procedure), which `contains?` is an instance of.

### Files affected

Created: `contains.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter, and `scores`.

### Run It — Show the Real Output

```
$ guile contains.scm
#t
#f
```

Verified this session. `85` is in `scores`; `100` is not.

### Mechanical Walkthrough

- **Filling in the template's blanks before writing any code:** `<base-value>` for "does an empty list contain anything" is `#f` — an empty list contains nothing, ever. `<combine>` needs to check whether the first item *is* the target — if so, the answer is `#t` immediately, regardless of the rest; if not, the answer depends entirely on whether the *rest* of the list contains it.
- **`(if (null? lst) #f ...)`** — the base case, `#f`, filled in directly from the reasoning above — a reappearance of the template's base-case slot, this time producing a Boolean value (Lesson 10) rather than a number.
- **`(if (= (car lst) target) #t (contains? (cdr lst) target))`** — the combine step, slightly more elaborate than `+` or the `my-length` counting rule, because "does this list contain the target" genuinely needs to check the first item specifically, not just combine it arithmetically with the rest.
- **The explicit derivation process, stated plainly:** nothing about `contains?`'s code was invented independently — its base case came from asking "what does the template's base-value blank need to be, for this question," and its combine step came from asking the same question about the combine blank, both answered before any Scheme was typed.

### CS Lens

This is derivation, in the exact sense Lesson 1 and Lesson 23 already valued it: deriving a new result from an established structure, rather than presenting a solution as though it appeared from nowhere. Also recognized in: deriving a new chemical compound's likely properties from the known behavior of its component elements; deriving a new legal ruling from established precedent and the specific facts of a new case; deriving a new melody's harmonic structure from established rules of the musical key it's written in; deriving a new building's structural requirements from established engineering principles applied to its specific design.

### SE Lens

The alternative to deriving `contains?` from the template is to write it independently, reasoning about lists and searching from scratch, the way `contains?` might have been written before Concept Unit 2's template existed. The real cost of that alternative is a slower, more error-prone process, with no guarantee the result actually handles the empty-list case correctly, since nothing forces the base case to be considered explicitly and separately the way the template does. Deriving `contains?` by filling in the template's blanks, as this unit does, costs the discipline of answering the template's two questions before writing any code; it buys a procedure whose base case is guaranteed to be considered on purpose, not forgotten.

---

## Concept Unit 4: When the Template Needs More Than One Base Case

### The Problem

Finding the maximum value in a list looks, at first, like another straightforward instance of the template. But "the maximum of an empty list" has no sensible answer — there is no number to return, the same kind of gap Lesson 9's preconditions were built to name explicitly. This is worth confronting directly, rather than papering over.

### The New Code — Type It Yourself

```scheme
(define (max-list lst)
  (if (null? (cdr lst))
      (car lst)
      (max (car lst) (max-list (cdr lst)))))
```

### The Updated Project

This is `max-list.scm`, in full:

```scheme
(define (max-list lst)
  (if (null? (cdr lst))
      (car lst)
      (max (car lst) (max-list (cdr lst)))))

(define scores (cons 91 (cons 85 (cons 72 '()))))

(display (max-list scores))
(newline)
(display (max-list (cons 42 '())))
(newline)
```

### Reference Source

Concept Unit 2's template, deliberately adapted rather than filled in unchanged — the adaptation is this unit's entire subject.

### Files affected

Created: `max-list.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter, `max` (see Objects and methods used), and `scores`.

### Run It — Show the Real Output

```
$ guile max-list.scm
91
42
```

Verified this session — the largest of `91, 85, 72` is correctly `91`; a single-item list's maximum is correctly that one item.

**Confirming the precondition directly, by violating it on purpose:**

```
$ guile max-list-empty.scm
ice-9/eval.scm:155:9: In procedure cdr: Wrong type argument in position 1 (expecting pair): ()
```

Verified this session — applying `max-list` to `'()` produces a real error, not a wrong-but-plausible number, because `(cdr '())` is called before any base case catches it.

### Mechanical Walkthrough

- **`(if (null? (cdr lst)) (car lst) ...)`** — the base case here checks `(null? (cdr lst))`, not `(null? lst)` directly: it fires when exactly one item remains, not when zero remain, because "the maximum of a one-item list" has a sensible direct answer (that one item), while "the maximum of zero items" does not.
- **`(max (car lst) (max-list (cdr lst)))`** — the recursive case, combining the first item with the maximum of the rest using `max` (see Objects and methods used), following the template's shape exactly once the base case is adjusted.
- **The precondition, stated explicitly rather than left implicit:** `max-list` requires its argument to be a non-empty list — a reappearance of *precondition* (Lesson 9) — and Concept Unit 4's own real error output confirms this precondition is never checked by `max-list` itself; violating it produces a genuine crash inside `cdr`, not a caught, reported violation.

### CS Lens

This is the recognition that a template is a strong default, not an unconditional law — some problems genuinely have no sensible answer for the template's usual base case, and the honest response is to adapt the base case (or state a precondition ruling the problematic input out entirely), not to force an answer that doesn't exist. Also recognized in: a general contract template that needs a specific clause struck out because it doesn't apply to an unusual transaction; a standard medical treatment protocol that needs adjustment for a patient with an atypical condition it wasn't designed around; a general recipe technique that needs adaptation for an ingredient with unusual properties; a general engineering safety margin that needs a special case for a load condition outside its usual assumptions.

### SE Lens

The alternative to confronting the empty-list case directly is to apply the template mechanically, using `null? lst` as the base case regardless, and returning some arbitrary placeholder — `0`, perhaps — for the empty case. The real cost of that alternative is exactly the silent-wrongness risk Lesson 29 already warned about: `0` is a plausible-looking number, and nothing about receiving it back would signal that the actual answer, "there is no maximum of an empty list," was quietly replaced with a number that happens to look like a valid response. Stating the precondition explicitly, and accepting that `max-list` genuinely crashes rather than lies when it's violated, as this unit does, costs giving up the comfort of an always-succeeding procedure; it is the more honest choice, consistent with everything Lesson 9 already established about a function's contract only ever applying to inputs that satisfy its precondition.

---

## Concept Unit 5: Why This Works — the Template Mirrors the Data's Own Definition

### The Problem

Three procedures have now been derived from the same template, with the third requiring a genuine adaptation. It's worth stating precisely *why* the template works as reliably as it does — not as an act of faith, but as a direct consequence of how a list is actually defined.

### No isolated lab for this step

This concept has no code of its own to isolate — the argument is given directly below, connecting this lesson's template back to Lesson 32's data definition, not through a construct with its own syntax.

### Applying It — Matching the Template to the Definition

**Lesson 32's definition of a list, quoted directly:** "either the empty list, `'()`, or a pair whose second element (its `cdr`) is itself a list."

**The template's own two cases, placed directly alongside it:** the template's base case, `(if (null? lst) <base-value> ...)`, applies exactly when `lst` is `'()` — the first branch of the list's own definition. The template's recursive case applies exactly when `lst` is a pair whose `cdr` is a smaller list — the second branch of the list's own definition, with `(process (cdr lst))` calling on precisely the "smaller list" the definition itself names.

**Stating the connection precisely:** the template is not a clever trick discovered by comparing `my-length` and `sum-list` — it is what any correct list-processing procedure has to look like, because it has exactly one case for each of the list's own two cases, with the recursive case's recursive call landing precisely on the smaller list the data's own definition guarantees exists.

**Confirming this explains Concept Unit 4's adaptation, rather than contradicting it:** `max-list`'s adjusted base case still corresponds to a case of the list's definition — it simply recognizes that a one-item list (`(cons x '())`) is itself already covered by the *recursive* case applied down to where `(cdr lst)` is `'()`, and chooses to treat that specific, common situation directly rather than recursing one step further into a call that would need to handle the empty list specially anyway. The template's shape is still being followed; only where its base case is drawn has moved.

### Walkthrough

- **Lesson 32's list definition, quoted directly** — a reappearance of *list*, examined here specifically for its two-case structure.
- **The template's base case and recursive case, matched directly against the definition's two cases** — not a new concept, but the precise justification this unit exists to provide: the template's reliability is a consequence of the data's own structure, not a coincidence.
- **The explicit reconciliation with `max-list`'s adaptation** — confirms Concept Unit 4's adjustment doesn't undermine this unit's claim; it's a legitimate variation still grounded in the same underlying correspondence.

### CS Lens

This is the deeper reason structural recursion, as a technique, is trustworthy rather than merely convenient: a procedure with one case per case of its input data's own recursive definition is guaranteed to handle every possible input, by the same exhaustiveness argument Lesson 24's proof by cases already relied on. Also recognized in: a legal analysis structured to address every category a statute itself defines, guaranteed complete because it mirrors the statute's own structure; a manufacturing quality check structured to inspect every stage a product's own assembly process defines; a filing system structured to mirror the exact categories an organization's own document types define; a translation process structured to handle every grammatical case a source language's own grammar defines.

### SE Lens

The alternative to grounding the template in the data's own definition is to treat it as a useful trick, learned by pattern-matching against two examples, without understanding why it generalizes. The real cost of that alternative is fragility: a trick learned by pattern-matching can be misapplied to a case it doesn't actually fit, or abandoned too quickly the moment a case like `max-list`'s arises that doesn't match the pattern exactly. Understanding the template as a direct consequence of the list's own recursive definition, as this unit does, costs the extra step of connecting the two explicitly; it is what allows a learner to correctly judge, the way Concept Unit 4 did, when and how the template can be adapted without abandoning the reasoning that made it trustworthy in the first place.

---

## Closing

### Connect the pieces

One list, `scores`, traced through every unit built in this lesson, start to finish:

1. **Two procedures compared (Unit 1):** `my-length` and `sum-list`, shown to share nearly identical structure.
2. **The shared structure named (Unit 2):** a template with two blanks, `<base-value>` and `<combine>`, extracted and shown to instantiate both procedures.
3. **A new procedure derived, not invented (Unit 3):** `contains?`, built by filling in the template's blanks for a genuinely new question.
4. **The template adapted, honestly (Unit 4):** `max-list`, requiring a different base case and an explicit precondition, confirmed to crash rather than lie when that precondition is violated.
5. **The template's reliability explained (Unit 5):** shown to follow directly from the list's own two-case recursive definition, with `max-list`'s adaptation reconciled rather than treated as an exception.

Unit 5's explanation directly justifies every procedure built earlier in this lesson — `my-length`, `sum-list`, and `contains?`'s reliability, and `max-list`'s legitimate departure from the template's usual base case, are all accounted for by the same underlying correspondence to Lesson 32's list definition.

### What breaks without this

Suppose a new list-processing procedure were written by loosely imitating `sum-list`'s general shape from memory, without actually re-deriving its base case and combine step from the template the way Concept Unit 3 did for `contains?`. A procedure computing the product of a list's numbers, written this way, might copy `sum-list`'s base case of `0` without reconsidering it — but `0` is catastrophically wrong for a product: multiplying anything by the accumulated result of a base case of `0` forces the entire product to `0`, regardless of the list's actual contents. This is not a hypothetical mistake; it's exactly the kind of error the template exists to prevent, by insisting the base case be derived deliberately for the specific operation at hand — asking "what is the product of no numbers at all" (which is `1`, arithmetic's own identity, not `0`) rather than reusing whatever the last example's base case happened to be. Restoring Concept Unit 2 and 3's discipline — deriving the base case and combine step freshly from the actual question being asked, every time, rather than copying a previous procedure's answer — is what catches this before a silently, catastrophically wrong procedure is ever trusted.

### Exercises

1. **Observe.** Compare `contains?` (Concept Unit 3) and `max-list` (Concept Unit 4) directly against Concept Unit 2's template, the way Concept Unit 1 compared `my-length` and `sum-list`. State exactly what each one's `<base-value>` and `<combine>` are, and note that `max-list`'s comparison needs the adaptation Concept Unit 4 explained.
2. **Formalize.** Derive a procedure that computes the product of a list of numbers, by explicitly answering the template's two questions before writing any code, the way Concept Unit 3 derived `contains?`.
3. **Explain.** State, explicitly, why your Exercise 2 procedure's base case has the value it does, connecting your reasoning to the specific mistake described in this lesson's closing.
4. **Formalize.** Derive a procedure that finds the minimum value in a list, adapting the template's base case the way Concept Unit 4 adapted it for `max-list`, and state your procedure's precondition explicitly.
5. **Explain.** Violate your Exercise 4 procedure's precondition on purpose, the way Concept Unit 4 ran `max-list` on `'()`, and report the real error Guile produces.

### Definition of done

- [ ] You can state the structural-recursion template from memory, with its two blanks clearly named.
- [ ] You can derive a new list-processing procedure by explicitly filling in the template's blanks, rather than writing code first and checking it fits the template afterward.
- [ ] You can identify when a procedure needs to adapt the template's usual base case, and explain why, using a precondition stated explicitly.
- [ ] You can explain why the template is reliable, using Lesson 32's own recursive definition of a list, not just because it has worked for the examples seen so far.
- [ ] You completed Exercises 1–5 using procedures of your own, not `contains?` or `max-list`.
- [ ] Commit your Exercise 2 and Exercise 4 procedures, with a commit message stating what each one's base case is and why that specific value, rather than any other, is the correct one.
