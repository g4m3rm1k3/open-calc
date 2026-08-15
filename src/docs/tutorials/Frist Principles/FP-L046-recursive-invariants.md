# Lesson 46: Recursive Invariants

**What you will build:** A brand-new procedure, `tree-height`, designed before being written — its invariant stated first, its recursive case trusted to satisfy that invariant without tracing it, and only then implemented and checked against real output. The transferable problem this lesson is actually about: Lesson 45's loop invariant described a property true throughout one tail-recursive procedure's own running state. General recursion — `tree-size`, `eval-expr`, anything making a recursive call whose result feeds into further computation rather than simply accumulating — needs the identical kind of guarantee, stated as a precise promise about what a call returns, trusted without re-tracing it every time it's used, exactly the way this curriculum has quietly trusted recursive calls since Lesson 27 without ever naming the discipline that makes doing so safe.

**What you need to know first:** Lesson 9 (`FP-L009-preconditions-and-postconditions.md`) — specifically *postcondition*, generalized here to a recursive setting. Lesson 31 (`FP-L031-tracing-recursive-evaluation.md`) — specifically evaluation trees, deliberately contrasted against this lesson's alternative to tracing. Lesson 41 (`FP-L041-trees.md`) — specifically the tree vocabulary and `example-tree`, reused directly. Lesson 43 (`FP-L043-structural-induction.md`) — specifically the inductive step, revealed here as the same reasoning this lesson's "leap of faith" performs while a procedure is still being designed, not only after it's finished.

**Terms introduced in this lesson**

- **Recursive invariant** — a precise statement of what a recursive call guarantees about its own return value, given whatever its argument satisfies — Lesson 9's postcondition, generalized to hold for every recursive call a procedure makes, at every depth, not just its outermost application.
- **Recursive leap of faith** — the discipline of trusting a recursive call to satisfy its stated recursive invariant, without tracing through how it actually computes that result, while designing or reading a recursive case. This is not blind trust — Lesson 43 already proved this trust is justified by structural induction — but a deliberate choice to reason at one level at a time, rather than unfolding an entire call tree the way Lesson 31 did by hand.

## Objects and methods used

None new. This lesson reuses `max` (Lesson 33) and the tree constructors and accessors from Lesson 41, applied to a genuinely new procedure designed from scratch within this lesson.

---

## Concept Unit 1: Tracing Every Call Doesn't Scale

### The Problem

Lesson 31 traced `(fib 4)`'s entire evaluation tree by hand — nine calls, small enough to draw completely. A tree-processing procedure applied to a genuinely large tree could make thousands of calls; tracing every single one, the way Lesson 31 did for `fib`, would be exactly the kind of unmanageable, error-inviting repetition Lesson 1 warned about for any un-generalized process. Something other than full tracing is needed to reason confidently about a recursive procedure's correctness at realistic scale.

### No isolated lab for this step

This concept has no code of its own to isolate — the scaling problem is demonstrated directly below, not through a construct with its own syntax.

### Applying It — What Full Tracing Would Actually Require

**Lesson 31's tree for `(fib 4)`, reappearing:** nine nodes, drawn completely, checked bottom-up by hand.

**Scaling this up, honestly:** a tree with a thousand nodes, processed by a structurally recursive procedure making two calls per node, would need a trace with roughly two thousand nodes to draw out fully — not impossible, but no longer something checked by eye with any real confidence.

**Naming what's actually needed instead:** a way to check a recursive case's correctness by examining *only* that one case — the current node and its two subtree calls — without needing to know or verify how either subtree call actually arrived at its own result.

### Walkthrough

- **Lesson 31's nine-node trace, reappearing** — established as a genuinely useful, but genuinely limited, technique — useful for a small, concrete example, not for reasoning about correctness in general.
- **The thousand-node scaling estimate** — makes the limitation concrete rather than abstract.
- **"examining only that one case"** — not yet a formal technique, but the precise shape Concept Unit 2 and 3 are about to supply.

### CS Lens

This is the recognition that verifying a system's correctness by exhaustively tracing every possible execution path is a technique that works for small, illustrative examples and fails to scale — exactly the same limitation Lesson 22 already found for checking a universal mathematical claim against a finite set of examples. Also recognized in: reviewing a large codebase by reading every single function call by hand versus reviewing each function's own documented contract in isolation; auditing a large organization by personally verifying every single transaction versus trusting each department's own internal controls, checked independently; inspecting a large bridge by physically tracing every load path versus trusting each certified component's own rated capacity.

### SE Lens

The alternative to finding a scalable technique is to keep relying on full tracing indefinitely, accepting that confidence in a recursive procedure's correctness necessarily shrinks as the procedure is applied to larger and larger inputs than anyone actually traced by hand. The real cost of that alternative is exactly the evidence-versus-proof gap Lesson 22 already warned about: confidence built from tracing a few small examples is not the same as an actual guarantee for every input, of any size. Naming the scaling problem explicitly, as this unit does, costs nothing beyond the observation itself; it motivates Concept Unit 2's actual solution rather than treating it as an arbitrary new topic.

---

## Concept Unit 2: The Recursive Invariant — What a Call Promises About Its Own Result

### The Problem

Concept Unit 1 identified what's needed: a way to reason about one recursive case using only a precise statement of what its recursive calls return, not their internal workings. That precise statement is exactly Lesson 9's postcondition, restated for a recursive setting.

### No isolated lab for this step

This concept has no code of its own to isolate — stating a recursive invariant precisely is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Stating tree-size's Invariant

**`tree-size`'s already-familiar code, from Lesson 41:**

```scheme
(define (tree-size tree)
  (if (null? tree)
      0
      (+ 1 (tree-size (node-left tree)) (tree-size (node-right tree)))))
```

**Its recursive invariant, stated precisely, in exactly Lesson 9's postcondition form:** for any tree `t` satisfying Lesson 41's binary-tree definition, `(tree-size t)` returns the exact number of nodes `t` contains.

**Confirming this is genuinely a postcondition, generalized:** Lesson 9's `total_with_tax` postcondition described what one, specific kind of call guarantees. `tree-size`'s recursive invariant describes what *every* call to `tree-size`, on *any* tree, guarantees — the same idea, extended to cover every depth of recursive call rather than a single, non-recursive application.

**Confirming the invariant is exactly what Lesson 43's proof already established, examined from a different angle:** Lesson 43 never proved `tree-size`'s invariant directly, but the identical proof technique — base case for the empty tree, inductive step trusting the invariant for both subtrees — would establish exactly this statement, for a tree of any depth, the same way Lesson 43's own two worked proofs did for different claims.

### Walkthrough

- **`tree-size`'s code, reappearing from Lesson 41** — examined here specifically for what it's actually meant to guarantee, not merely what it computes.
- **The invariant, stated in Lesson 9's exact postcondition form** — first appearance of *recursive invariant*, defined by direct generalization of an already-familiar term.
- **The explicit connection to Lesson 43** — not a new concept, but confirmation that this invariant is exactly the kind of claim structural induction is built to establish, tying this lesson directly back to the technique already fully justified.

### CS Lens

This is the recognition that every correctly working recursive procedure has an invariant, whether or not anyone has ever bothered to write it down — a precise answer to "what does calling this actually guarantee," applicable at any depth of recursion, not just the first, outermost call. Also recognized in: a supplier's quality guarantee, applying identically to a shipment of any size, not just the first order; a financial audit's certification, applying identically to a subsidiary's books at any level of a corporate structure, not just the parent company; a building code's safety standard, applying identically to a structure of any height, not just a one-story example.

### SE Lens

The alternative to stating a recursive invariant explicitly is to leave a recursive procedure's guarantee implicit, trusted informally the way this curriculum has, by necessity, trusted every recursive call since Lesson 27, without ever writing down precisely what's actually being trusted. The real cost of that alternative is exactly what Concept Unit 1 already identified: without a precise, written statement, checking a recursive case's correctness has no target to check against except full tracing, which doesn't scale. Stating the invariant explicitly, as this unit does for `tree-size`, costs one precise sentence; it gives Concept Unit 3 something concrete to trust, deliberately, rather than trust vaguely.

---

## Concept Unit 3: The Recursive Leap of Faith — Trusting the Invariant Without Tracing

### The Problem

Concept Unit 2 stated `tree-size`'s invariant. It's worth demonstrating directly how having that statement available changes the *way* its recursive case gets checked — trusting the invariant for the two recursive calls, rather than tracing what they actually do internally, and checking only whether the current case's own combining step is correct given that trust.

### No isolated lab for this step

This concept has no code of its own to isolate — the leap of faith is demonstrated directly below, applied to `tree-size`'s already-familiar recursive case, not through a construct with its own syntax.

### Applying It — Checking tree-size's Recursive Case, Without Tracing

**`tree-size`'s recursive case, for a node with value `v`, left subtree `L`, and right subtree `R`:** `(+ 1 (tree-size L) (tree-size R))`.

**Taking the leap of faith, explicitly:** trust, without tracing how, that `(tree-size L)` returns the exact number of nodes in `L`, and `(tree-size R)` returns the exact number of nodes in `R` — exactly what Concept Unit 2's invariant promises, applied to the two smaller trees `L` and `R`.

**Checking only whether the current case's own arithmetic is correct, given that trust:** the total number of nodes in the whole tree is exactly one (the current node itself) plus however many nodes `L` contains plus however many nodes `R` contains — precisely `(+ 1 (tree-size L) (tree-size R))`, matching the code exactly.

**Confirming this check required no tracing of `L` or `R`'s own internal recursive calls at all:** whether `L` itself has zero nodes, five nodes, or five thousand, the leap of faith trusts `(tree-size L)` to correctly report whichever number is true, and the check above never needed to know which.

**Naming what just happened, precisely:** the recursive leap of faith — reasoning about one recursive case in isolation, trusting the invariant rather than the implementation, exactly the way Lesson 43's inductive step trusted `P(L)` and `P(R)` without re-proving them from scratch at that same moment.

### Walkthrough

- **`(+ 1 (tree-size L) (tree-size R))`, re-examined without tracing either recursive call** — demonstrates the technique directly, using code already fully familiar from Lesson 41.
- **"trust, without tracing how"** — first appearance of *recursive leap of faith*, defined by contrast with Lesson 31's own full-tracing technique.
- **The explicit confirmation that no tracing of `L` or `R` was needed** — not a new concept, but the concrete demonstration of exactly what the leap of faith actually saves.
- **The connection to Lesson 43's inductive step** — confirms this "leap" is not actually a leap at all, in the sense of an unjustified assumption; it is the identical, already-proven-sound reasoning Lesson 43 used, applied here as a design and verification tool rather than only as a retrospective proof step.

### CS Lens

This is the standard way experienced programmers actually read and verify recursive code — trusting a recursive call's contract rather than re-deriving its implementation every time it's encountered, exactly the way a competent engineer trusts a certified component's rating without re-deriving its physical properties from scratch on every use. Also recognized in: a manager trusting a direct report's completed work based on their role's stated responsibilities, without personally re-verifying every detail; a driver trusting a bridge's posted weight limit without re-deriving its structural engineering; a doctor trusting a lab result's stated accuracy without re-running the underlying chemistry personally; a reader trusting a cited fact's accuracy based on the citation's own stated reliability, without re-deriving the original research.

### SE Lens

The alternative to taking the leap of faith is to insist on tracing every recursive call fully before trusting any recursive procedure at all, the exact scaling problem Concept Unit 1 already identified. The real cost of that alternative, chosen consistently, would make reasoning about any nontrivial recursive procedure practically impossible — no one traces a thousand-node tree by hand before trusting code that processes it. Taking the leap of faith deliberately, as this unit does, costs nothing beyond stating the invariant precisely first (Concept Unit 2) — a cost already paid; it buys the ability to check a recursive case's correctness in isolation, at constant effort, regardless of how large the actual recursion eventually turns out to run.

---

## Concept Unit 4: Using the Leap of Faith to Design tree-height

### The Problem

Every use of the leap of faith so far has examined already-written code. It's worth using it the other direction — as a genuine design tool, for a procedure that doesn't exist yet — to see that stating the invariant first, then trusting it while deriving the recursive case, actually produces correct code directly, rather than only verifying code written some other way.

### No isolated lab for this step

This concept has no code of its own to isolate — the design process itself is demonstrated directly below, before any code is written, not through a construct with its own syntax.

### Applying It — Designing Before Writing

**The task, stated in prose first:** compute a tree's height — the length of the longest path from its root down to any leaf.

**Stating the recursive invariant first, before any code:** for any tree `t`, `(tree-height t)` returns the number of nodes on the longest root-to-leaf path in `t`.

**Checking the base case directly, no leap of faith needed since there's nothing to recurse into:** the empty tree has no nodes at all on any path — height `0`.

**Deriving the recursive case using the leap of faith, trusting two calls that don't exist yet:** for a node with subtrees `L` and `R`, trust `(tree-height L)` to correctly report `L`'s own height, and `(tree-height R)` to correctly report `R`'s. The longest path through the current node is one (the current node itself) plus whichever of `L` or `R`'s own longest path is longer — `(+ 1 (max (tree-height L) (tree-height R)))`.

**Only now writing the actual code, directly from the derivation just completed:**

```scheme
(define (tree-height tree)
  (if (null? tree)
      0
      (+ 1 (max (tree-height (node-left tree)) (tree-height (node-right tree))))))
```

**Running it for real, checking against a tree whose height is easy to verify by eye:**

```
$ guile -q
scheme@(guile-user)> (define (tree-height tree) (if (null? tree) 0 (+ 1 (max (tree-height (cadr tree)) (tree-height (caddr tree))))))
scheme@(guile-user)> (define example-tree (list 50 (list 30 (list 20 '() '()) (list 40 '() '())) (list 70 '() '())))
scheme@(guile-user)> (tree-height example-tree)
$1 = 3
```

Verified this session — the longest path, `50 → 30 → 20` (or equally, `50 → 30 → 40`), has three nodes on it, matching `tree-height`'s reported `3` exactly.

**Confirming height and size are genuinely different, using a second, deliberately lopsided tree:**

```
scheme@(guile-user)> (define lopsided (list 1 (list 2 (list 3 (list 4 '() '()) '()) '()) '()))
scheme@(guile-user)> (tree-height lopsided)
$2 = 4
```

Verified this session — a four-node chain has both size `4` and height `4`, while `example-tree` has size `5` (Lesson 41) but height only `3`, confirming the two are genuinely independent properties.

### Walkthrough

- **The invariant stated first, in prose, before any Scheme is written** — demonstrates the design order this whole lesson has been building toward: invariant, then base case, then recursive case derived by leap of faith, then code.
- **The base case, requiring no leap of faith at all** — confirms the leap of faith is specifically for recursive calls, not for the parts of a procedure that need none.
- **`(+ 1 (max (tree-height L) (tree-height R)))`, derived entirely from trusting two calls not yet written** — the concrete demonstration of design-by-leap-of-faith: the formula was reasoned out completely before the procedure existed to check it against.
- **The real, verified output confirming the derivation was correct** — a reappearance of this curriculum's standing discipline: derived reasoning is trusted provisionally, then actually checked against real, running code.

### CS Lens

This is structural recursion (Lesson 33) and the recursive leap of faith combined into a complete design method: state what a procedure must guarantee, handle the base case directly, and derive the recursive case by trusting — not tracing — the very calls being designed. Also recognized in: an engineer designing a new bridge span by trusting standard, already-certified component specifications rather than re-deriving material science from scratch for each one; a novelist outlining a new chapter by trusting that earlier, not-yet-written chapters will establish certain facts, then writing consistently with that trust; a software architect designing a new module by trusting an interface's documented contract before either side of it is actually implemented.

### SE Lens

The alternative to designing this way is to write `tree-height`'s code first, by trial and error, and only afterward check whether it happens to be correct. The real cost of that alternative is exactly backwards from this curriculum's own repeated emphasis on deriving rather than guessing (Lesson 1, Section 11 of this curriculum's own founding philosophy) — code written by trial and error might happen to work on the examples tried and fail on a case nobody thought to check, the identical risk Lesson 22 has warned about since its very first lesson. Designing by stating the invariant first and deriving the recursive case through the leap of faith, as this unit does, costs the discipline of resisting the urge to write code before finishing the reasoning; it produces code whose correctness was established during design, not discovered afterward by luck.

---

## Concept Unit 5: When the Leap of Faith Reveals a Design Is Wrong

### The Problem

The leap of faith is also a genuine design check, not only a design aid — attempting to state a clean, precise invariant, and finding it impossible to state clearly, is itself valuable information, revealing a design problem before a single line of code is written.

### No isolated lab for this step

This concept has no code of its own to isolate — a flawed design attempt is examined directly below, not through a construct with its own syntax.

### Applying It — Noticing an Unclear Invariant

**A flawed attempt at stating `tree-height`'s invariant, easy to write carelessly:** "`tree-height` returns how big the tree is."

**Checking this attempted invariant against Concept Unit 4's actual, careful derivation:** "how big" is ambiguous between two genuinely different, already-established properties — `tree-size` (Lesson 41), the total count of nodes, and `tree-height` (this lesson), the longest root-to-leaf path length. `example-tree` has size `5` and height `3` — two different numbers, both legitimately describable as "how big" in casual language.

**Confirming this ambiguity would cause a real design mistake if not caught:** attempting to derive a recursive case from the ambiguous invariant "how big" risks accidentally deriving `tree-size`'s combining rule (`+ 1` on both subtree results) instead of `tree-height`'s (`+ 1` on the *larger* of the two subtree results) — a real, plausible, easy mistake, caught here specifically because stating the invariant precisely, before writing any code, forced the ambiguity into the open.

**Stating the general lesson directly:** an invariant that cannot be stated precisely and unambiguously is a sign the underlying design isn't yet clear enough to implement correctly — the leap of faith doesn't just verify an already-clear design; attempting it is what exposes an unclear one.

### Walkthrough

- **"how big" as a first, careless attempt at an invariant** — deliberately vague, chosen to demonstrate exactly the kind of imprecision Lesson 1 and Lesson 2 already warned against, now shown specifically in the context of designing a recursive procedure.
- **The direct comparison against `tree-size`, `5`, and `tree-height`, `3`** — a reappearance of both procedures, used here specifically to make the ambiguity concrete rather than abstract.
- **The plausible wrong-combining-rule mistake, traced to its actual source** — confirms this isn't a hypothetical risk; a genuinely different, wrong procedure could easily result from proceeding with an unclear invariant.
- **The general lesson, stated directly** — not a new concept, but the precise, final point this closing unit exists to make: the invariant-first discipline is a design check, not merely a design aid.

### CS Lens

This is the recognition that the discipline of writing something down precisely is itself a debugging tool, applied here before any code exists at all — the identical value Lesson 1 found in turning a vague situation into a precise specification, now shown specifically for a recursive invariant rather than a computational problem's overall statement. Also recognized in: an architect discovering a floor plan's ambiguity — "the main room" referring to two different spaces in different drawings — only once forced to write a precise materials list; a legal drafter discovering a contract clause's ambiguity only once forced to state precisely what "reasonable time" means numerically; a project manager discovering two team members have different understandings of "done" only once forced to write an explicit, shared definition.

### SE Lens

The alternative to insisting on a precise invariant before writing code is to proceed with a vague, "good enough for now" sense of what a procedure should do, the same imprecision Lesson 2 has warned against since this curriculum's second lesson. The real cost of that alternative, specifically for recursive design, is exactly the risk this unit demonstrated: an ambiguous invariant can silently license deriving the wrong recursive case entirely, with the mistake only surfacing later, if at all, once real output happens to look wrong for some specific input. Insisting on a precise, unambiguous invariant before deriving any recursive case, as this unit's own example demonstrates the value of, costs the discipline of resisting a vague first draft; it is what turns the leap of faith into a genuine safeguard, not merely a convenient shortcut.

---

## Closing

### Connect the pieces

Two tree-processing procedures, one already familiar and one designed fresh within this lesson, traced through every unit built in this lesson, start to finish:

1. **The scaling problem named (Unit 1):** full tracing, fine for `fib(4)`'s nine calls, unworkable for a realistically large tree.
2. **The invariant stated precisely (Unit 2):** `tree-size`'s exact guarantee, written in Lesson 9's postcondition form.
3. **The leap of faith demonstrated (Unit 3):** `tree-size`'s recursive case checked by trusting, not tracing, its two recursive calls.
4. **A new procedure designed by the same discipline (Unit 4):** `tree-height`, invariant stated first, recursive case derived by leap of faith, only then implemented and verified against real output.
5. **The discipline shown to catch design flaws too (Unit 5):** an ambiguous invariant, "how big," shown to risk deriving the wrong procedure entirely, caught specifically by insisting on precision before writing code.

Unit 4's `tree-height` directly applies Unit 2 and Unit 3's technique to a genuinely new problem, and Unit 5's warning applies directly to Unit 4's own design process — a mistake that specific derivation successfully avoided by being precise from the start.

### What breaks without this

Suppose a later, more elaborate tree-processing procedure — one balancing a tree, say, a genuinely more complex task than counting or measuring height — were designed the way Concept Unit 5 warned against: written directly from a vague, unstated sense of what it should do, with its recursive calls trusted implicitly but never actually given a precise, checkable invariant. Any mistake in that implicit trust — a recursive call assumed to return a sorted list when it actually doesn't, say, or assumed to preserve some property it doesn't actually guarantee — would have no invariant to be checked against at all, leaving whoever eventually notices a wrong result with no systematic way to trace the mistake back to a specific, misstated assumption, only Lesson 31's full-tracing technique, which Concept Unit 1 already established doesn't scale to a procedure of any real complexity. Restoring this lesson's discipline — stating a precise recursive invariant for every nontrivial recursive procedure, before or immediately after writing it, and using the leap of faith deliberately rather than trusting implicitly — is what keeps a complex recursive design's correctness checkable, one case at a time, no matter how large the recursion eventually grows.

### Exercises

1. **Observe.** Choose a recursive procedure you've already written (from Lesson 33 through Lesson 42) and state its recursive invariant precisely, in Lesson 9's postcondition form, the way Concept Unit 2 did for `tree-size`.
2. **Explain.** Check your Exercise 1 procedure's recursive case using the leap of faith explicitly — state what you're trusting each recursive call to return, without tracing how, and confirm the combining step is correct given that trust.
3. **Formalize.** Design a genuinely new procedure (one you haven't already built) using this lesson's exact method: state its invariant in prose first, handle the base case directly, derive the recursive case by leap of faith, and only then write the code.
4. **Explain.** Run your Exercise 3 procedure on a real input and check its output against something you can verify independently by hand, the way Concept Unit 4 checked `tree-height` against `example-tree`'s visibly countable longest path.
5. **Explain.** Write a deliberately vague, ambiguous first attempt at your Exercise 3 procedure's invariant, the way Concept Unit 5 wrote "how big" for `tree-height`. Explain what wrong design that vague version could plausibly have led to.

### Definition of done

- [ ] You can state a recursive procedure's invariant precisely, distinguishing it from a vague description of what the procedure "generally does."
- [ ] You can check a recursive case's correctness using the leap of faith, explicitly stating what's being trusted rather than tracing every call.
- [ ] You can design a new recursive procedure by stating its invariant first, deriving its recursive case by leap of faith, and only then writing code — and can point to where each step happened in your own work.
- [ ] You can explain, using your own example, how attempting to state an invariant precisely can reveal a design flaw before any code is written.
- [ ] You completed Exercises 1–5 using procedures of your own, not `tree-size` or `tree-height`.
- [ ] Commit your Exercise 3 procedure, with a commit message stating your Exercise 1 procedure's invariant and confirming it directly.
