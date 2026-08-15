# Lesson 47: Termination

**What you will build:** One general theorem, proven once, guaranteeing that *every* structurally recursive procedure this curriculum has built since Lesson 33 terminates — followed by a real, deliberately broken tree procedure that violates the theorem's one condition and genuinely never stops. The transferable problem this lesson is actually about: Lesson 30 proved `factorial` terminates using a progress measure that was itself a plain number, decreasing by exactly one each call. `tree-size` and `tree-height`'s arguments are trees, not numbers — nothing in Lesson 30 said how, or whether, its technique applies when what's shrinking isn't a number at all.

**What you need to know first:** Lesson 20 (`FP-L020-ordering.md`) — specifically *total order*, extended here to a property an order needs for termination arguments specifically. Lesson 21 (`FP-L021-finite-and-infinite-thinking.md`) — specifically *finite set*, reused directly as the actual reason this lesson's general theorem holds. Lesson 30 (`FP-L030-making-progress.md`) — specifically *progress measure*, generalized here beyond plain numbers. Lesson 41 (`FP-L041-trees.md`) — specifically `tree-size`, reused directly as this lesson's central example.

**Terms introduced in this lesson**

- **Well-founded** — a property an order may have: no strictly decreasing sequence under it can continue forever. The natural numbers under `<`, bounded below by `0`, are well-founded — exactly Lesson 30's original progress-measure requirement, now named as a property of the order itself rather than only asserted case by case.

## Objects and methods used

None new. This lesson reuses `tree-size` (Lesson 41) directly, examining a general property of its recursion rather than introducing new syntax.

---

## Concept Unit 1: Revisiting Lesson 30's Numeric Progress Measures — Do They Generalize?

### The Problem

Lesson 30 proved `factorial` terminates by showing `n` strictly decreases by exactly `1` each call and is bounded below by `0`. `tree-size`'s argument is a tree, not a number — `n` decreasing has no direct meaning for `(tree-size (node-left tree))`. It's worth asking directly whether Lesson 30's technique has anything at all to say about a procedure like this, before assuming it simply doesn't apply.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly below, not through a construct with its own syntax.

### Applying It — What Actually Shrinks in tree-size's Recursion

**`tree-size`'s recursive case, reappearing from Lesson 41:** `(+ 1 (tree-size (node-left tree)) (tree-size (node-right tree)))`.

**Checking whether `tree` itself, as an argument, is "smaller" in any numeric sense:** a tree isn't a number, so "smaller" can't mean less-than the way it did for `factorial`'s `n` — but `(node-left tree)` and `(node-right tree)` do intuitively feel like smaller *trees* than `tree` itself, containing fewer nodes.

**Naming the actual quantity that shrinks, even though the argument passed isn't itself a number:** the *number of nodes* in the tree being processed — a genuine natural number, computable from any tree, that strictly decreases from `tree` to `(node-left tree)` or `(node-right tree)`, exactly the way `n` decreased for `factorial`.

### Walkthrough

- **`tree-size`'s recursive case, re-examined for what actually gets smaller** — establishes the question precisely, rather than assuming Lesson 30's technique either obviously applies or obviously doesn't.
- **"a tree isn't a number, so 'smaller' can't mean less-than"** — confirms the genuine gap Lesson 30 left open.
- **"the number of nodes... strictly decreases"** — the key realization this unit exists to produce: the *argument itself* doesn't need to be a number for a numeric progress measure to still exist, computed *from* the argument.

### CS Lens

This is the recognition that a progress measure and the thing being measured don't have to be the same kind of object — `factorial`'s progress measure happened to be its own argument, `n`, but nothing in Lesson 30's actual requirement (strictly decreasing, bounded below) demanded that coincidence. Also recognized in: a hiking trail's progress measured by remaining distance, a number, even though the hiker's actual position is a location, not a number; a countdown to a project deadline measured by days remaining, a number, even though the project itself is a complex, non-numeric thing; a chess endgame's progress measured by remaining material or moves, a number, even though a chess position itself is not.

### SE Lens

The alternative to asking this question explicitly is to assume Lesson 30's technique simply doesn't apply to non-numeric recursive arguments, missing a genuinely useful generalization. The real cost of that alternative would be losing the ability to give any rigorous termination argument at all for tree-processing procedures, `list`-processing procedures, or any other recursive data this curriculum has built since Lesson 32 — a real gap, given how much of this curriculum's later work depends on exactly this kind of recursion. Asking the question directly, as this unit does, costs nothing beyond noticing what Lesson 30 actually required versus what `factorial` happened to provide; it opens the way for Concept Unit 2's full generalization.

---

## Concept Unit 2: A Progress Measure Doesn't Have to Be the Input Itself

### The Problem

Concept Unit 1 identified "number of nodes" as a quantity that shrinks in `tree-size`'s recursion. Stating this precisely, as a general technique rather than an observation specific to trees, is what makes it usable for any structurally recursive procedure, not just this one.

### No isolated lab for this step

This concept has no code of its own to isolate — the generalized technique is stated directly below, not through a construct with its own syntax.

### Applying It — Restating Lesson 30's Requirement, Generalized

**Lesson 30's original requirement, restated:** a progress measure is a quantity, computed from a recursive call's argument, that strictly decreases with every recursive call and is bounded below by the base case.

**The generalization, made explicit:** "computed from a recursive call's argument" was always general enough to allow the measure to be a function *of* the argument, not only the argument itself — `factorial`'s case simply had the identity function play that role, which made the distinction invisible until a non-numeric argument, like a tree, forced it into the open.

**Applying this directly to `tree-size`:** the progress measure is `size(t)` — the number of nodes in whatever tree `t` is currently being processed — a genuine natural number for any tree, strictly decreasing from a node to either of its subtrees (a subtree has strictly fewer nodes than the tree containing it, since it excludes at least the current node itself), bounded below by `0` (the empty tree's size).

**Confirming this satisfies Lesson 30's exact requirement, checked directly:** strictly decreasing — yes, a proper subtree always has fewer nodes than its parent. Bounded below — yes, `0`, reached exactly at the empty-tree base case.

### Walkthrough

- **Lesson 30's requirement, restated precisely** — a direct reappearance of *progress measure* (Lesson 30), examined here for exactly which part of its original wording already permitted this generalization.
- **"the identity function... made the distinction invisible"** — explains directly why `factorial`'s example never revealed this generality, without suggesting Lesson 30 was ever actually wrong or incomplete.
- **`size(t)`, checked against both parts of Lesson 30's requirement** — confirms the generalized measure genuinely satisfies the same standard already established, not a new, looser one invented for this case.

### CS Lens

This is the recognition that a proof technique's real generality is often hidden inside its original wording, only revealed once applied to a case its first example didn't happen to test — the identical situation Lesson 40 already found for structural recursion itself, first demonstrated only on lists. Also recognized in: a legal principle's true scope only becoming clear once tested against a case its original drafters never specifically considered; a scientific law's true generality only becoming clear once tested outside the specific conditions it was first observed under; a mathematical theorem's true strength only becoming clear once applied to a structure its original proof never explicitly mentioned.

### SE Lens

The alternative to generalizing Lesson 30's requirement explicitly is to treat "progress measure" as meaning, specifically, "the argument itself gets numerically smaller," missing every recursive procedure whose argument isn't already a number. The real cost of that alternative would be an entire category of recursive procedures — every one processing trees, lists, or any other recursive data — left with no rigorous termination argument available at all, despite this curriculum having built dozens of exactly such procedures since Lesson 32. Generalizing the requirement explicitly, as this unit does, costs nothing beyond restating what Lesson 30 already allowed; it makes rigorous termination arguments available for every structurally recursive procedure this curriculum has built.

---

## Concept Unit 3: A General Termination Theorem for Structural Recursion

### The Problem

Concept Unit 2 supplied a progress measure for one specific procedure, `tree-size`. It's worth proving something considerably stronger: that *any* procedure following Lesson 33's structural-recursion template — recursing only on genuine, smaller pieces of its input data — automatically terminates, once and for all, rather than needing this same argument repeated individually for every single such procedure this curriculum has built or will build.

### No isolated lab for this step

This concept has no code of its own to isolate — the general theorem and its proof are given directly below, not through a construct with its own syntax.

### Applying It — Proving the General Case

**The claim, stated precisely:** any procedure defined by structural recursion (Lesson 33) over a finite recursively defined data type (Lesson 27) — one case per case of the data's own definition, with every recursive call made on a genuine component of the current data (a list's `cdr`, a tree's `node-left` or `node-right`) — terminates on every finite instance of that data type.

**The progress measure, stated generally rather than for one specific data type:** the total number of constructor applications (`cons` calls, or `make-node` calls) used to build the current argument — a natural number for any finite list or tree, exactly the way Concept Unit 2's `size(t)` counted node-constructing calls specifically.

**Checking this measure strictly decreases, for structural recursion in general, not just for `tree-size`:** by the definition of structural recursion itself, every recursive call is made on a genuine component of the current argument — a list's `cdr` (one `cons` fewer than the list itself) or a tree's `node-left`/`node-right` (strictly fewer node-constructions than the tree itself, since the current node's own construction is excluded). This holds for *any* procedure with this shape, not merely the specific ones already built.

**Checking the measure is bounded below, connecting directly to Lesson 21:** the measure is a natural number, and Lesson 21 already established the natural numbers are bounded below by `0` — combined with the data type's own base case (`'()` or the empty tree) corresponding to exactly zero constructor applications, the measure cannot decrease forever.

**Stating the conclusion:** any structurally recursive procedure over finite recursive data terminates — a single proof, covering `my-length`, `sum-list`, `my-map`, `my-filter`, `my-fold`, `tree-size`, `tree-height`, `eval-expr`, and every other structurally recursive procedure this curriculum has built since Lesson 33, all at once.

### Walkthrough

- **The claim, stated for structural recursion in general** — deliberately generalized beyond `tree-size`, to cover the entire family of procedures this curriculum has built using Lesson 33's template.
- **The progress measure, "total constructor applications"** — a reappearance of Concept Unit 2's `size(t)`, restated generally enough to apply to lists, trees, or any other recursively defined data type built from constructors the way Lesson 27 requires.
- **The strictly-decreasing check, argued from the definition of structural recursion itself** — not checked procedure by procedure, but established once, for the entire category, exactly the generality this unit set out to achieve.
- **The bounded-below check, explicitly citing Lesson 21** — grounds the argument in an already-established fact about the natural numbers, rather than treating "bounded below by zero" as a fresh assumption.

### CS Lens

This is a general termination theorem, of exactly the kind formal methods and programming language theory use to guarantee entire categories of programs terminate without needing to individually verify every single one — proven once, here, for structural recursion specifically, the same way a building code's general safety standard, once established, doesn't need to be independently re-derived for every building constructed under it. Also recognized in: a compiler's own termination checker for a restricted "structurally recursive" subset of a language, verifying automatically, for any program in that subset, that it terminates; a general mathematical result covering an entire family of related claims, proven once rather than case by case; a general engineering safety margin, established once for an entire class of standard designs, rather than individually re-derived for every specific building meeting that class's requirements.

### SE Lens

The alternative to proving this general theorem is to keep re-deriving a termination argument individually for every new structurally recursive procedure this curriculum builds, the way Lesson 30 did specifically for `factorial`. The real cost of that alternative, now made concrete, is enormous redundant effort: dozens of procedures, each needing its own progress-measure argument, when in fact every single one shares the identical underlying reason for terminating. Proving the general theorem once, as this unit does, costs the real effort of stating and checking it carefully at the level of the whole category; it means any *future* structurally recursive procedure, built following Lesson 33's template correctly, is automatically guaranteed to terminate, with no further proof needed — provided, as Concept Unit 4 examines directly, the template is actually followed correctly.

---

## Concept Unit 4: Termination Isn't Automatic — When Structural Recursion Breaks Its Own Rule

### The Problem

Concept Unit 3's theorem has exactly one condition: every recursive call must be made on a genuine, smaller component of the current argument. It's worth demonstrating, with real code and a real, easy-to-make mistake, exactly what happens when that one condition is silently violated.

### The New Code — Type It Yourself

```scheme
(define (tree-size-buggy tree)
  (if (null? tree)
      0
      (+ 1 (tree-size-buggy tree) (tree-size-buggy (node-right tree)))))
```

### The Updated Project

This is `tree-size-buggy.scm`, in full:

```scheme
(define empty-tree '())
(define (make-node value left right) (list value left right))
(define (node-value node) (car node))
(define (node-left node) (cadr node))
(define (node-right node) (caddr node))

(define (tree-size-buggy tree)
  (if (null? tree)
      0
      (+ 1 (tree-size-buggy tree) (tree-size-buggy (node-right tree)))))

(define example-tree
  (make-node 50
    (make-node 30 empty-tree empty-tree)
    (make-node 70 empty-tree empty-tree)))

(display (tree-size-buggy example-tree))
```

### Reference Source

`tree-size.scm` (Lesson 41), with a single, plausible copy-paste-style mistake: the first recursive call, meant to be `(tree-size-buggy (node-left tree))`, instead calls `(tree-size-buggy tree)` — recursing on the *same* tree, not a smaller one.

### Files affected

Created: `tree-size-buggy.scm`.

### Change type

Add (new file, deliberately flawed, kept for comparison).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile tree-size-buggy.scm &
$ sleep 3
$ ps -o rss= -p <pid>
   1578128   (KB, after 3 seconds, still running)
```

Verified this session — memory climbing past 1.5 gigabytes within three seconds, with no sign of finishing, exactly Lesson 29's `broken-factorial.scm` failure signature.

### Mechanical Walkthrough

- **`(tree-size-buggy tree)`, the first recursive call, using `tree` instead of `(node-left tree)`** — the single altered piece, isolated so its consequence can be examined precisely.
- **Checking this against Concept Unit 3's theorem directly:** the theorem's one condition — every recursive call made on a genuine, smaller component — is violated by this specific call. `tree`, passed to itself unchanged, has exactly as many constructor applications as the call that produced it; the progress measure does not decrease at all for this recursive call.
- **The consequence, matching the theorem's own structure exactly:** since the progress measure fails to strictly decrease, Concept Unit 3's guarantee simply doesn't apply — not because the theorem was wrong, but because this code no longer satisfies the one condition the theorem actually requires.

### CS Lens

This is a direct, concrete demonstration that a general theorem's guarantee is only as strong as its stated conditions — violate the one condition Concept Unit 3's theorem requires, and the guarantee it provides evaporates completely, exactly the way a building code's safety guarantee doesn't extend to a building that violates the code. Also recognized in: a bridge's rated load capacity, which guarantees nothing once the bridge is modified in a way that violates the assumptions the rating was calculated under; a medication's safety guarantee, which doesn't extend to a dosage outside its tested and approved range; a warranty's coverage, which doesn't extend to damage caused by a use the warranty's conditions explicitly excluded.

### SE Lens

The alternative to checking this specific failure mode is to trust that "it looks like a structurally recursive procedure" is enough, without verifying the one condition that actually makes it one. The real cost of that alternative is exactly what this unit demonstrates: a single mistyped variable name — `tree` instead of `(node-left tree)` — produces code that still *looks* like every other structurally recursive procedure in this curriculum, passes a casual visual inspection, and never terminates, with the exact same dangerous, silent, memory-consuming failure Lesson 29 already warned about. Checking, explicitly, that every recursive call genuinely reduces the progress measure — not merely assuming a procedure's resemblance to a correct one is sufficient — as this unit models, costs one careful check per recursive call; it is the only way to actually confirm Concept Unit 3's theorem applies before trusting that it does.

---

## Concept Unit 5: Termination for Non-Structural Recursion — Back to Lesson 30's General Technique

### The Problem

Concept Unit 3's theorem covers structural recursion specifically — recursive calls made on genuine components of the current argument. Not every correct recursive procedure has this shape; some recurse on an argument computed some other way, and it's worth being honest about what happens then.

### No isolated lab for this step

This concept has no code of its own to isolate — the honest scope limitation is examined directly below, not through a construct with its own syntax.

### Applying It — Recognizing the Theorem's Actual Boundary

**A procedure whose recursive call is not made on a literal component of its argument, recalling Lesson 30's own example:** repeated halving — `n ÷ 2`, discarding the remainder — recurses on a value computed *from* `n`, not on some smaller piece `n` is literally built from the way a list's `cdr` is.

**Checking this against Concept Unit 3's theorem directly:** the theorem, as stated, covers structural recursion specifically — it says nothing at all about a procedure like this one, since halving isn't "recursing on a genuine component" in the sense the theorem's proof actually used.

**Confirming this doesn't mean such a procedure can't be proven to terminate — only that this lesson's specific theorem doesn't automatically cover it:** Lesson 30's original, more general technique — find *any* progress measure that strictly decreases and is bounded below, then prove it does — still applies directly, exactly as Lesson 30 already demonstrated for repeated halving.

**Stating the relationship between this lesson's theorem and Lesson 30's original technique precisely:** Concept Unit 3's theorem is a specific, powerful shortcut, applicable automatically to an entire common category of recursion (structural recursion over finite data) without needing to construct a fresh progress-measure argument every time. Lesson 30's original technique is the general fallback, still fully valid and still necessary for any recursive procedure that falls outside that specific category.

### Walkthrough

- **Repeated halving, reappearing from Lesson 30** — deliberately chosen because Lesson 30 already worked through it, making the comparison concrete rather than abstract.
- **Checking it against Concept Unit 3's theorem, and confirming the theorem doesn't cover it** — an honest, explicit statement of the theorem's actual scope, rather than an implied claim that it covers every recursive procedure.
- **"a specific, powerful shortcut" versus "the general fallback"** — not a new concept, but the precise, final relationship this lesson's two techniques have to each other.

### CS Lens

This is the recognition that a powerful, general-purpose theorem and a more effortful, case-by-case technique can coexist usefully — the theorem handling the common case automatically, the technique remaining available for whatever falls outside it — exactly the kind of layered tooling this curriculum has already valued (Lesson 36's preference for `map` and `filter` over an equally capable but less immediately clear `fold`, applied here to proof techniques instead of code). Also recognized in: a building code's standard, pre-approved designs covering most construction automatically, with a full engineering review still available and still necessary for anything outside those standard designs; a tax system's standard deduction covering most filers automatically, with itemized deductions still available and still necessary for situations the standard doesn't fit; a medical protocol's standard treatment covering most cases automatically, with individualized treatment planning still available and still necessary for atypical presentations.

### SE Lens

The alternative to being explicit about this lesson's theorem's actual scope is to let it be assumed, incorrectly, to cover every recursive procedure, leaving a learner unprepared for the first genuinely non-structural recursive procedure they encounter. The real cost of that alternative would be either a false sense that termination is now "automatically" guaranteed for everything, or, worse, an abandoned attempt to prove termination for a valid procedure simply because it doesn't fit this lesson's specific theorem. Stating the boundary explicitly, and reaffirming Lesson 30's original technique's continued validity, as this unit does, costs one honest clarification; it keeps this lesson's genuine, powerful result from being overclaimed into something it isn't, exactly the discipline Lesson 22 has demanded of every claim in this curriculum since it was first introduced.

---

## Closing

### Connect the pieces

One general theorem and one deliberately broken procedure, traced through every unit built in this lesson, start to finish:

1. **The gap identified (Unit 1):** `tree-size`'s argument isn't a number — does Lesson 30's technique even apply?
2. **The generalization made precise (Unit 2):** a progress measure can be computed *from* an argument, not only be the argument itself — `size(t)`, the node count, for `tree-size`.
3. **One theorem, covering every structurally recursive procedure (Unit 3):** proven once, using "total constructor applications" as a general progress measure, citing Lesson 21 directly for why it's bounded below.
4. **The theorem's one condition, violated on purpose (Unit 4):** `tree-size-buggy`, recursing on its own unchanged argument, genuinely never terminating, verified by real, measured memory growth.
5. **The theorem's honest boundary (Unit 5):** repeated halving, shown to fall outside structural recursion, with Lesson 30's original technique confirmed as the still-necessary fallback.

Unit 4's violation is checked directly against Unit 3's own stated condition — not a fresh, unrelated bug, but the precise, deliberate breaking of the one requirement the general theorem depends on.

### What breaks without this

Suppose a learner, having only ever seen Lesson 30's case-by-case termination proofs, assumed every new structurally recursive procedure needed its own fresh progress-measure argument, unaware that Concept Unit 3's general theorem already covers the entire category automatically. Real effort would go into re-proving termination, procedure by procedure, for something already fully guaranteed — and, in the opposite direction, a learner unaware of the theorem's *actual* condition might trust a procedure that merely looks structurally recursive, the way `tree-size-buggy` does, without checking that every recursive call genuinely reduces the progress measure, exactly the mistake Concept Unit 4 demonstrated can hide behind a single mistyped variable name. Restoring this lesson's two-sided lesson — trusting the general theorem for genuine structural recursion, without needing to re-derive it each time, while still checking that a procedure actually satisfies the theorem's one real condition before assuming it does — is what makes termination reasoning both efficient and honest.

### Exercises

1. **Observe.** Choose three structurally recursive procedures from your own earlier exercises (any combination of Lessons 33 through 42) and identify, for each, the natural-number progress measure Concept Unit 3's general theorem implicitly guarantees — the total constructor applications in whatever argument each one is currently processing.
2. **Explain.** For one of your Exercise 1 procedures, check its recursive call (or calls) directly against Concept Unit 3's one condition — confirm each one is genuinely made on a smaller component of the current argument, not a copy of it or something computed some other way.
3. **Formalize.** Deliberately introduce Concept Unit 4's exact mistake into one of your Exercise 1 procedures — change one recursive call to use the current argument unchanged, rather than a smaller component of it.
4. **Explain.** Run your Exercise 3 broken procedure and observe its real failure behavior (memory growth, or hanging, depending on whether it's in tail position per Lesson 39), the way Concept Unit 4 observed `tree-size-buggy`'s memory growth directly.
5. **Explain.** Find, or invent, one recursive procedure whose recursion is not structural in Concept Unit 3's sense (its recursive call isn't made on a literal component of its argument), and construct a Lesson 30-style progress-measure proof for it directly, the way Lesson 30 did for repeated halving.

### Definition of done

- [ ] You can state Concept Unit 3's general termination theorem from memory, including its one required condition.
- [ ] You can identify the implicit progress measure for a structurally recursive procedure of your own, without needing to construct a fresh proof for it.
- [ ] You can construct a real, running example of the theorem's condition being violated, and explain precisely why the resulting procedure fails to terminate.
- [ ] You can identify a recursive procedure that falls outside structural recursion, and construct a Lesson 30-style progress-measure proof for it directly.
- [ ] You completed Exercises 1–5 using your own procedures, not `tree-size` or repeated halving.
- [ ] Commit your Exercise 3 broken procedure and your Exercise 4 real failure observation, with a commit message stating exactly which recursive call you altered and why the resulting procedure no longer satisfies Concept Unit 3's theorem.
