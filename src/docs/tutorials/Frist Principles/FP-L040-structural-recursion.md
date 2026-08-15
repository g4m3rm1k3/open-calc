# Lesson 40: Structural Recursion

**What you will build:** A real, working expression evaluator, `eval-expr`, that computes the exact value Lesson 4 worked out by hand — `(3 + 5) × (10 − 4) = 48` — by representing that expression as literal, nested list data and deriving its evaluator the same way `my-length` was derived in Lesson 33. The transferable problem this lesson is actually about: Lesson 33 named structural recursion using only lists as its example, which could easily leave the impression that the technique is specifically a list technique. It isn't. It applies to any data whose own definition has a base case and a recursive case, and an arithmetic expression — already recursively defined in Lesson 4, long before this curriculum had any way to build real data structures — is exactly such a case.

**What you need to know first:** Lesson 4 (`FP-L004-expressions-and-evaluation.md`) — specifically the exact expression `(3 + 5) × (10 − 4)` and its hand-worked evaluation to `48`, reproduced here as real code. Lesson 27 (`FP-L027-recursive-definitions.md`) — specifically *base case* and *recursive case*, applied here to a data type other than numbers or lists. Lesson 33 (`FP-L033-processing-a-list.md`) — specifically *structural recursion*, generalized here beyond lists for the first time.

**Terms introduced in this lesson**

- **Symbol** — a Scheme value that names something without being evaluated as code — `'+`, written with a leading quote, is the symbol naming addition, distinct from `+`, the actual callable procedure. A symbol is data, usable for comparison and pattern-matching, the way `91` or `"hello"` are data; a full account of exactly what quoting does, and why it's needed, belongs to a later lesson — this one uses just enough of it to represent an operator as something an expression-evaluating procedure can inspect and compare, rather than something it accidentally tries to call.

## Objects and methods used

- **`number?`**
  - *What it is:* a real Scheme predicate (Lesson 13) checking whether a value is a number.
  - *Implementation:* takes one argument, returns `#t` or `#f`; confirmed this session as `(number? 5)` returning `#t` and `(number? '(+ 1 2))` returning `#f`.
  - *Its use:* `eval-expr`'s base-case guard, distinguishing a plain number (needing no further evaluation) from a nested expression (needing to be broken down further).
- **`eq?`**
  - *What it is:* a real Scheme predicate testing whether two values are the identical symbol (among other uses this lesson doesn't need).
  - *Implementation:* takes two arguments, returns `#t` or `#f`; confirmed this session as `(eq? '+ '+)` behavior underlying `eval-expr`'s operator checks.
  - *Its use:* comparing an expression's operator symbol against `'+`, `'-`, and `'*` to decide which arithmetic procedure to actually apply.
- **`cadr`, `caddr`**
  - *What it is:* real Scheme procedures for reaching into a list's second and third elements.
  - *Implementation:* `cadr` is exactly `(car (cdr lst))`; `caddr` is exactly `(car (cdr (cdr lst)))` — both confirmed this session, e.g. `(cadr '(* (+ 3 5) (- 10 4)))` returning `(+ 3 5)`.
  - *Its use:* pulling an expression's left and right sub-expressions out of its list representation, without writing `car`/`cdr` chains by hand each time.

---

## Concept Unit 1: A List Whose Items Can Themselves Be Lists

### The Problem

Lesson 4's expression, `(3 + 5) × (10 − 4)`, was reasoned about entirely on paper — no version of it has ever existed as real, inspectable Scheme data. Representing it for real needs something Lesson 32's lists have never been asked to do before: a list whose *items* are sometimes themselves entire lists, not just plain numbers.

### No isolated lab for this step

This concept has no code of its own to isolate — the motivating gap is demonstrated directly below, not through a construct with its own syntax.

### Applying It — What the Expression Actually Needs

**Lesson 4's expression, restated:** a multiplication, whose two operands are themselves an addition and a subtraction.

**Confirming this is not a flat list of plain values:** `(91 85 72)` (Lesson 32) is a list of three plain numbers, nothing nested inside it. Representing `(3 + 5) × (10 − 4)` needs a structure where the multiplication's two "items" are, each one, an entire smaller expression — a list containing lists.

**Confirming `cons` already supports this, without needing anything new:** `cons`'s definition (Lesson 32) never restricted what its first element could be — a pair's first element can be any value at all, including another pair. Nothing about lists, as already built, actually prevents this; it simply hasn't come up until now.

### Walkthrough

- **Lesson 4's expression, restated in prose** — re-examined here specifically for what representing it as real data would require.
- **`(91 85 72)`, contrasted with the nested structure needed here** — a reappearance of *list* (Lesson 32), used to highlight exactly what's different about this new case.
- **"nothing about lists... actually prevents this"** — not a new concept, but confirmation that Lesson 32's `cons` already supports what this lesson needs, without requiring any new primitive.

### CS Lens

This is the recognition that a list's items were never restricted to plain values in the first place — a list containing lists is not a new kind of structure requiring new tools, only a use of `cons` that simply hadn't come up yet. Also recognized in: a folder that can contain files or other folders, using the identical "folder" mechanism either way; an outline that can contain plain bullet points or entire sub-outlines, using the identical "list item" mechanism either way; a company's org chart, where a "report" can be an individual contributor or an entire team, represented with the identical box-and-line mechanism either way; a sentence that can contain plain words or entire embedded clauses, represented with the identical grammatical structure either way.

### SE Lens

The alternative to recognizing this directly is to assume, from having only ever seen flat lists of numbers, that a genuinely new mechanism is needed to represent nested structure. The real cost of that alternative would be reaching for unnecessary new machinery, or worse, concluding incorrectly that this curriculum's existing tools can't handle the job. Recognizing that `cons` already supports nesting, as this unit does, costs nothing beyond checking `cons`'s own definition for a restriction that was never actually there; it means Concept Unit 2 can build the expression directly, with tools already fully trusted.

---

## Concept Unit 2: Representing an Expression as Nested List Data

### The Problem

Concept Unit 1 confirmed the tools exist. Actually writing Lesson 4's expression as real Scheme data means deciding, precisely, how to represent an operator — `+`, `−`, `×` — as something that sits inside a list as data, rather than something Scheme tries to immediately run.

### The New Code — Type It Yourself

```scheme
(define example-expr '(* (+ 3 5) (- 10 4)))
```

### The Updated Project

This is `expr-data.scm`, in full:

```scheme
(define example-expr '(* (+ 3 5) (- 10 4)))

(display example-expr)
(newline)
```

### Reference Source

Lesson 4 (`FP-L004-expressions-and-evaluation.md`), Concept Unit 1's exact expression, `(3 + 5) × (10 − 4)`, translated directly into nested-list form.

### Files affected

Created: `expr-data.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile expr-data.scm
(* (+ 3 5) (- 10 4))
```

Verified this session — the expression prints back out exactly as written, confirming it was stored as data, not run as code.

### Mechanical Walkthrough

- **`'(* (+ 3 5) (- 10 4))`** — the leading quote mark (already seen once, briefly, for `'()` in Lesson 32) tells Scheme to treat everything that follows as data to be built, not code to be evaluated — without it, Scheme would try to *run* `(* (+ 3 5) (- 10 4))` as a real calculation immediately, rather than storing its structure.
- **`*`, `+`, and `-`, appearing inside the quoted list** — first appearance of *symbol*: because the whole expression is quoted, these three are not the callable procedures from Lesson 3 and Lesson 28; they are symbols, plain data naming "the idea of multiplication," "the idea of addition," and so on, inspectable the same way a number is.
- **`(* (+ 3 5) (- 10 4))`, printed back exactly as entered** — confirms the whole thing really is just a nested list, three elements deep at most: a symbol, followed by two smaller lists, each themselves a symbol followed by two numbers.

### CS Lens

This is the same idea Lesson 4 introduced as pure notation — an expression as a nested combination — now realized as an actual, inspectable value a program can examine, take apart, and process, rather than only something reasoned about on paper. Also recognized in: a musical score, which represents a performance as data (notes, symbols, timing) that a musician later interprets and performs, rather than being the performance itself; a recipe card, which represents a cooking process as data (ingredients, steps) separate from actually cooking; a blueprint, which represents a building as data separate from the built structure; a legal contract's text, which represents obligations as data separate from anyone actually fulfilling them.

### SE Lens

The alternative to representing the expression as quoted data is to just write `(* (+ 3 5) (- 10 4))` directly and let Scheme evaluate it immediately, the way every earlier expression in this curriculum's Scheme lessons has been evaluated. The real cost of that alternative is that a directly-evaluated expression is gone the instant it's computed — there is no way to inspect its structure, ask what operator sits at its root, or write a separate procedure that processes it, because it was never held onto as data at all. Quoting it, as this unit does, costs one leading character; it is what makes Concept Unit 4's evaluator possible — a procedure that takes the expression's own structure as its input, rather than relying on Scheme's built-in evaluation to happen automatically.

---

## Concept Unit 3: The Expression's Own Recursive Definition

### The Problem

Lesson 33's template needs a recursive data definition to derive an algorithm from — Lesson 32's list definition supplied one for `my-length`. This lesson's expression data needs the identical treatment: a precise statement of its base case and recursive case, before any evaluator can be derived from it.

### No isolated lab for this step

This concept has no code of its own to isolate — stating the definition precisely is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Defining "Expression" Precisely

**The base case:** an expression is a plain number — `5`, `72`, `3` — needing no further breakdown.

**The recursive case:** an expression is a list of exactly three items: an operator symbol (`'+`, `'-`, or `'*`), and two smaller expressions.

**Checking `example-expr` against this definition directly:** `(* (+ 3 5) (- 10 4))` is a list of three items — `'*`, `(+ 3 5)`, and `(- 10 4)` — matching the recursive case. `(+ 3 5)` is itself a list of three items — `'+`, `3`, and `5`` — matching the recursive case again, with both `3` and `5` matching the base case directly.

**Confirming this is exactly Lesson 4's original mathematical definition, only now stated for real Scheme data:** Lesson 4 never formally separated "base case" from "recursive case" for expressions — it didn't have Lesson 27's vocabulary yet — but its own Concept Unit 2 ("the whole expression is a multiplication, whose two operands are themselves expressions") was already saying exactly this.

### Walkthrough

- **The base case, "a plain number"** — a reappearance of *base case* (Lesson 27), applied here to expression data for the first time.
- **The recursive case, "a list of an operator symbol and two smaller expressions"** — a reappearance of *recursive case*, likewise applied to expression data.
- **`example-expr`, checked clause by clause against both cases** — confirms the definition actually matches the concrete data built in Concept Unit 2, rather than being stated in the abstract only.
- **The explicit connection back to Lesson 4's own original wording** — not a new concept, but confirmation that this lesson isn't inventing a new idea; it's giving Lesson 4's already-correct intuition its first fully precise, checkable statement.

### CS Lens

This is the exact same move Lesson 32 made for lists — stating a data type's own recursive definition precisely, as a base case and a recursive case — now applied to a second, structurally different kind of data, confirming the move itself generalizes. Also recognized in: a grammar rule defining a sentence as either a simple clause or a combination of smaller sentences joined by a conjunction; a legal definition of "descendant" as either a direct child or a descendant of a descendant; a company's organizational definition of "team," as either an individual or a group of smaller teams; a fractal's own mathematical definition, as either a base shape or a combination of smaller copies of itself.

### SE Lens

The alternative to stating the expression's recursive definition explicitly is to jump straight to writing an evaluator, relying on an intuitive sense of the expression's shape rather than a precise statement of it. The real cost of that alternative is exactly the risk Lesson 27 already warned about for any recursive definition: without stating the base and recursive cases precisely first, it's easy to derive an evaluator that handles some cases correctly and silently mishandles others — a plain number nested unusually deep, for instance. Stating the definition explicitly and checking it against real data, as this unit does, costs one careful comparison; it is what makes Concept Unit 4's derivation a genuine application of Lesson 33's template, rather than a guess.

---

## Concept Unit 4: Deriving eval-expr by Following That Definition

### The Problem

Concept Unit 3 supplied exactly what Lesson 33's template needs: a base case and a recursive case for expression data. Deriving `eval-expr` now means filling in the template's blanks precisely, the same disciplined process Lesson 33, Concept Unit 3, already used to derive `contains?`.

### The New Code — Type It Yourself

```scheme
(define (eval-expr expr)
  (if (number? expr)
      expr
      (if (eq? (car expr) '+)
          (+ (eval-expr (cadr expr)) (eval-expr (caddr expr)))
          (if (eq? (car expr) '-)
              (- (eval-expr (cadr expr)) (eval-expr (caddr expr)))
              (* (eval-expr (cadr expr)) (eval-expr (caddr expr)))))))
```

### The Updated Project

This is `eval-expr.scm`, in full:

```scheme
(define (eval-expr expr)
  (if (number? expr)
      expr
      (if (eq? (car expr) '+)
          (+ (eval-expr (cadr expr)) (eval-expr (caddr expr)))
          (if (eq? (car expr) '-)
              (- (eval-expr (cadr expr)) (eval-expr (caddr expr)))
              (* (eval-expr (cadr expr)) (eval-expr (caddr expr)))))))

(define example-expr '(* (+ 3 5) (- 10 4)))

(display (eval-expr example-expr))
(newline)
```

### Reference Source

Concept Unit 3's definition, filled in directly: `<base-value>` for a plain number is the number itself; `<combine>` for a three-item list is "check which operator symbol sits first, then apply the matching arithmetic procedure to the evaluated left and right sub-expressions."

### Files affected

Created: `eval-expr.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile eval-expr.scm
48
```

Verified this session.

### Mechanical Walkthrough

- **`(if (number? expr) expr ...)`** — the base case: a reappearance of `number?` (see Objects and methods used) guarding the case where `expr` needs no further breakdown, returning it directly, exactly the way Concept Unit 3's base case required.
- **`(car expr)`** — retrieves the operator symbol, the first of the recursive case's three required parts.
- **`(eq? (car expr) '+)`** — a reappearance of `eq?` (see Objects and methods used), comparing the retrieved symbol against the symbol `'+` specifically — checking which specific operator this expression's root actually is.
- **`(eval-expr (cadr expr))` and `(eval-expr (caddr expr))`** — first appearance of `cadr` and `caddr` (see Objects and methods used), retrieving the left and right sub-expressions, each one recursively evaluated — the recursive calls Lesson 33's template requires, here applied to smaller *expressions* rather than smaller lists in the counting sense.
- **The nested `if`s, checking `'+`, then `'-`, falling through to `'*`** — not a new syntactic element on its own, but confirms every operator this lesson's expressions can contain is actually handled, in the same exhaustive-checking spirit Lesson 2 and Lesson 14 already established.

### CS Lens

This is a real, working evaluator — the first one this curriculum has built — derived by the identical process Lesson 33 used for ordinary lists, now applied to nested expression data instead. Also recognized in: a calculator's own internal logic, evaluating a parsed expression the same structural way; a spreadsheet's formula engine, evaluating a nested formula by recursively evaluating its sub-expressions; a programming language's interpreter, doing precisely this at a much larger scale — a connection this curriculum will return to directly, once building an actual interpreter becomes this curriculum's own explicit subject, much later; a legal document's nested clause structure, "evaluated" by a court working from the innermost, most specific clause outward.

### SE Lens

The alternative to deriving `eval-expr` from Concept Unit 3's definition is to write it by intuition, trusting that "it probably needs to check the operator and recurse on both sides" without grounding that intuition in the data's own precise definition. The real cost of that alternative is exactly the risk Lesson 33 already warned against: an intuitively-written procedure might handle the cases the author happened to picture and silently mishandle others. Deriving it explicitly from the base case and recursive case, as this unit does, costs the same disciplined process already used for `contains?` and `max-list`; it produces a procedure whose correctness can be checked directly against the definition it was derived from, not merely against how plausible it looks.

---

## Concept Unit 5: Checking Against Lesson 4, and Generalizing the Principle

### The Problem

`eval-expr`'s real output, `48`, needs to be checked against something independent of `eval-expr` itself — exactly the discipline Lesson 22 and Lesson 29 already insisted on. Lesson 4 already provides exactly that: a complete, independent, hand-worked evaluation of this identical expression.

### No isolated lab for this step

This concept has no code of its own to isolate — the check against Lesson 4, and the resulting generalization, are stated directly below, not through a construct with its own syntax.

### Applying It — Closing the Loop With Lesson 4

**Lesson 4's hand-worked evaluation, quoted directly:** `(3 + 5) × (10 − 4)` reduces, innermost first, to `8 × 6`, then to `48`.

**`eval-expr`'s real output, from Concept Unit 4:** `48`.

**Confirming agreement, precisely:** the two match exactly — a genuine, independent check, not merely a coincidence, since Lesson 4's hand evaluation and `eval-expr`'s real execution arrived at the same value through entirely different means, separated by thirty-six lessons.

**Stating the general principle this whole lesson has been building toward:** structural recursion — check the data's own base case, recurse structurally on the data's own recursive case — is not a technique specific to lists. It works for any recursively defined data, because, as Lesson 33's Concept Unit 5 already established for lists specifically, a procedure with one case per case of the data's own definition is guaranteed to handle every possible instance. Lists (Lesson 33), expressions (this lesson), and, starting next lesson, trees, are all specific instances of one general idea: recursive data always admits a structurally recursive procedure derived directly from its own definition.

### Walkthrough

- **Lesson 4's hand-worked result, quoted verbatim** — a direct reappearance of that lesson's own conclusion, examined here as independent verification rather than merely referenced.
- **`48`, matching exactly** — not a new concept, but the concrete confirmation this whole lesson has been building toward.
- **The general principle, stated explicitly, connecting lists, expressions, and trees together** — the precise, final generalization this lesson exists to establish, directly extending Lesson 33's own justification (Concept Unit 5) beyond the one data type it was originally demonstrated on.

### CS Lens

This is the completion of a chain spanning thirty-six lessons: a mathematical notation introduced in Lesson 4, formalized as recursive data in this lesson, evaluated by a procedure derived using a technique named in Lesson 33 — three separate lessons' worth of work, converging on one checked, correct number. Also recognized in: an architectural design, structurally engineered using principles established generations earlier, converging correctly on a building that actually stands; a legal ruling, reasoned from principles established in far earlier, separate cases, converging correctly on a single verdict; a scientific result, built from separately established, much earlier theorems, converging correctly on a single new conclusion.

### SE Lens

The alternative to explicitly checking `eval-expr`'s output against Lesson 4's independent, hand-worked result is to trust the real code simply because it ran without error and produced some number. The real cost of that alternative is exactly Lesson 29's own warning: a procedure can run to completion and still be subtly wrong, and only an independent check — not merely "it didn't crash" — actually confirms correctness. Checking against Lesson 4's genuinely independent, already-established result, as this unit does, costs nothing beyond the comparison itself; it is what turns `eval-expr` from "code that runs" into "code confirmed correct," and what earns the right to state this lesson's general principle with real confidence rather than as an unverified hope.

---

## Closing

### Connect the pieces

One expression, `(3 + 5) × (10 − 4)`, traced through every unit built in this lesson, start to finish:

1. **The gap named (Unit 1):** expressions need lists whose items can themselves be lists — confirmed to already be supported by `cons`.
2. **Real data built (Unit 2):** `'(* (+ 3 5) (- 10 4))`, quoted so its operators become symbols, not immediate calls.
3. **The data's own recursive definition (Unit 3):** a plain number as base case; an operator symbol plus two smaller expressions as recursive case.
4. **The evaluator derived (Unit 4):** `eval-expr`, following Lesson 33's exact template, producing `48`.
5. **Independently checked, and the principle generalized (Unit 5):** `48` confirmed against Lesson 4's own hand-worked result, and structural recursion confirmed to apply beyond lists.

Unit 5's check reaches all the way back to Lesson 4 — not a fresh verification invented for this lesson, but confirmation against a result this curriculum already, independently established thirty-six lessons earlier.

### What breaks without this

Suppose a learner, having only ever seen structural recursion applied to lists in Lesson 33, encountered a genuinely different recursively structured data type later in this curriculum — a tree, a nested folder structure, a parsed sentence — and concluded, incorrectly, that a wholly new, unrelated technique was needed to process it, simply because it didn't look like a list. Real, unnecessary effort would go into inventing or searching for a different approach, when the actual technique — state the data's base case and recursive case precisely, then derive a procedure with one branch per case, following Lesson 33's exact template — was already fully available and needed no modification at all. This lesson's demonstration on expression data specifically exists to prevent that exact narrowing: seeing the identical technique succeed on a second, structurally different kind of data is what makes the underlying principle, rather than one memorized example, the thing actually learned. Restoring this lesson's generalization — checking any new recursive data type for its own base case and recursive case, and reaching for the same derivation process regardless of how different the data looks from a list — is what prevents reinventing a technique that was already fully general.

### Exercises

1. **Observe.** Choose a recursively structured idea from your own experience that isn't a list (a nested folder structure, a sentence with embedded clauses, a set of nested parentheses) and state its base case and recursive case precisely, the way Concept Unit 3 did for expressions.
2. **Formalize.** Represent a small instance of your Exercise 1 structure as real, quoted Scheme data, the way Concept Unit 2 represented `(* (+ 3 5) (- 10 4))`.
3. **Formalize.** Derive a procedure that processes your Exercise 2 data, following Lesson 33's template and this lesson's exact derivation process — one case for the base case, one for the recursive case.
4. **Explain.** Run your Exercise 3 procedure on your Exercise 2 data and check the result against an answer you can verify independently, by hand, the way Concept Unit 5 checked `eval-expr` against Lesson 4.
5. **Formalize.** Extend `eval-expr` to handle a fourth operator of your choosing (division, say), following the exact pattern the existing three operators already use, and check it on a new expression you construct yourself.

### Definition of done

- [ ] You can represent a small nested expression as quoted Scheme list data and explain what the leading quote actually does.
- [ ] You can state a recursively structured data type's base case and recursive case precisely, for a structure that isn't a list.
- [ ] You can derive a structurally recursive procedure for that data type, following Lesson 33's template explicitly.
- [ ] You can check your derived procedure's output against an independently obtained, already-verified result.
- [ ] You completed Exercises 1–5 using a recursive structure of your own choosing, not arithmetic expressions.
- [ ] Commit `expr-data.scm`, `eval-expr.scm`, your Exercise 5 extension, and your Exercise 3 procedure, with a commit message stating what your Exercise 1 structure's base case and recursive case actually were.
