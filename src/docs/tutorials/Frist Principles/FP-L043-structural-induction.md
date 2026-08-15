# Lesson 43: Structural Induction

**What you will build:** Two complete, rigorous proofs — one finally establishing, for a tree of *any* depth, the sorted-output claim Lesson 42 could only demonstrate on a three-level example; one establishing, for the first time with actual certainty, the length-preservation property Lesson 34 only ever checked against a single case. The transferable problem this lesson is actually about: Lesson 23's direct proof reasons about one arbitrary, but fixed, case — a number, a pair of numbers. Neither Lesson 42's tree claim nor Lesson 34's `map` claim is about a fixed case at all; both are claims about *every* instance of a recursively defined structure, of any depth, and direct proof alone was never actually equipped to establish that.

**What you need to know first:** Lesson 23 (`FP-L023-direct-proof.md`) — specifically *direct proof*'s hypothesis-conclusion-chain structure, extended here rather than replaced. Lesson 27 (`FP-L027-recursive-definitions.md`) — specifically *base case* and *recursive case*, reused as the exact two parts this lesson's proof technique mirrors. Lesson 33 (`FP-L033-processing-a-list.md`) — specifically the structural-recursion template, whose validity this lesson finally explains. Lesson 34 (`FP-L034-map.md`) and Lesson 42 (`FP-L042-tree-traversal.md`) — specifically their two unproven claims, both resolved directly in this lesson.

**Terms introduced in this lesson**

- **Structural induction** — a proof technique for establishing that a property holds for *every* instance of a recursively defined structure: prove the property holds for the base case directly, then prove that *if* it holds for every smaller instance a recursive case is built from, it holds for that recursive case too. Structural induction is what actually licenses trusting a recursive procedure's own correctness on smaller inputs while deriving its behavior on a larger one — the same trust every recursive procedure in this curriculum has quietly depended on since Lesson 27.
- **Inductive hypothesis** — the assumption, made only for the second part of a structural induction proof, that the property being proven already holds for every smaller instance a recursive case is built from. Assuming this is not circular reasoning — it is the entire technique's actual mechanism, examined precisely in Concept Unit 2.

## Objects and methods used

None new. This lesson reuses `inorder` (Lesson 42) and `map` together with `my-length` (Lesson 34), applied to genuinely new proofs about them rather than new code.

---

## Concept Unit 1: Why Direct Proof Alone Can't Handle "Every Tree"

### The Problem

Lesson 42, Concept Unit 3, traced `inorder`'s sorted-output behavior through `example-tree`'s three levels and stopped, explicitly, short of a real proof — "a genuinely complete proof needs a technique capable of reasoning about a tree of arbitrary depth." Lesson 23's direct proof reasons about one arbitrary case, stated as a hypothesis at the very start — but "an arbitrary tree" isn't one case with a fixed shape; it could have any depth at all, and nothing about direct proof's own structure says how to reason about a shape that isn't fixed in advance.

### No isolated lab for this step

This concept has no code of its own to isolate — the structural gap is demonstrated directly below, not through a construct with its own syntax.

### Applying It — What "Any Tree" Actually Requires

**Lesson 42's own honest limitation, quoted directly:** the explanation "correctly identifies the actual mechanism" but "is not yet a fully rigorous proof covering every possible tree with this property, of any size or shape."

**Attempting a direct proof anyway, to see exactly where it gets stuck:** "Hypothesis: `tree` is a binary search tree. Conclusion: `inorder(tree)` is sorted." A direct proof needs a chain of steps from hypothesis to conclusion — but `tree` could be empty, could be one node, could be the eight-node tree Lesson 42 traced, or could be a million nodes deep, and nothing about "assume `tree` is a binary search tree" pins down which shape to actually reason about.

**Naming the actual obstacle, precisely, connecting to Lesson 21:** this is structurally the same problem Lesson 21 diagnosed for infinite domains — Lesson 14's quantifier-unpacking method needed a finite, fixed number of cases to check, and failed for infinitely many real numbers; direct proof, similarly, reasons cleanly about one fixed shape, and a tree's depth is genuinely unbounded, exactly the way the real numbers were genuinely unbounded.

### Walkthrough

- **Lesson 42's own quoted limitation** — a direct reappearance of that lesson's honest closing, examined here as the actual problem this lesson exists to solve, rather than merely referenced.
- **The stalled direct-proof attempt** — demonstrates concretely, rather than by assertion, exactly where Lesson 23's technique runs out of traction.
- **The explicit connection to Lesson 21's infinite-domain problem** — not a new concept, but confirmation that this lesson's obstacle is a genuine instance of a difficulty this curriculum has already named once, in a different setting.

### CS Lens

This is the recognition that "any instance of a recursively defined structure" is, in the relevant sense, an unbounded domain — not because the values inside it are infinite, the way Lesson 21's real numbers were, but because the *shape* itself has no fixed upper bound on depth, and a proof technique built for one fixed case cannot, on its own, cover every possible shape. Also recognized in: an architectural safety claim needing to hold for a building of any height, not just the one specific building already constructed; a legal principle needing to hold for a corporate structure of any number of subsidiary layers, not just one example company; a manufacturing quality guarantee needing to hold regardless of how many components a product is assembled from.

### SE Lens

The alternative to naming this obstacle precisely is to keep checking examples of increasing depth, the way Lesson 42 checked a three-level tree, hoping that "enough" checked examples eventually amounts to certainty. The real cost of that alternative is exactly Lesson 22's `n² + n + 41` warning, applied to tree depth instead of to a numeric input: no number of checked depths, however large, logically rules out a depth where the claim happens to fail. Naming the actual obstacle precisely, as this unit does, costs nothing beyond the comparison to Lesson 21; it is what makes Concept Unit 2's actual solution feel motivated rather than arbitrary.

---

## Concept Unit 2: Structural Induction — the Base Case, Then Trusting Smaller Instances

### The Problem

Lesson 21 ultimately needed a technique reasoning about an arbitrary case *at once*, rather than checking cases one by one — Lesson 22 supplied that technique as proof in general, and Lesson 23 supplied direct proof as one concrete way to carry it out. What's needed now is a proof technique built specifically for recursively defined structures, one that reasons about "any depth" the same way a recursive procedure itself handles "any depth" — by reducing the arbitrary case to a smaller one, and trusting that smaller case, rather than reasoning about every depth individually.

### No isolated lab for this step

This concept has no code of its own to isolate — the technique is stated directly below, deliberately mirroring Lesson 27's own recursive-definition shape, not through a construct with its own syntax.

### Applying It — the Two-Part Technique, Stated Precisely

**To prove a property `P` holds for every instance of a recursively defined structure, two things must be shown:**

> 1. **Base case:** `P` holds for the structure's base case, directly — no assumption needed, exactly like Lesson 27's base case.
> 2. **Inductive step:** assuming `P` already holds for every smaller instance a recursive case is built from (the inductive hypothesis), show that `P` then holds for that recursive case too.

**Why assuming the inductive hypothesis is not circular reasoning, examined directly:** the inductive step never assumes `P` holds for the *specific* instance being proven — only for the smaller instances it's built from, which are genuinely different, smaller objects. Once both parts are shown, `P` is established for every instance, no matter how deep, by the same reasoning Lesson 27 already used to explain why a recursive definition with a real base case always eventually bottoms out: an instance of depth `d` is proven using the inductive step applied to instances of depth `d − 1`, which were themselves proven using instances of depth `d − 2`, all the way down to the base case, which was proven directly, with nothing assumed at all.

**Connecting this precisely to why recursive procedures are trustworthy at all, closing a gap this curriculum has quietly relied on since Lesson 27:** every recursive procedure written since Lesson 28 has implicitly trusted that a recursive call, applied to smaller input, correctly computes the right answer — `factorial`'s recursive case trusts `(factorial (- n 1))`'s result before using it. Structural induction is the actual justification for that trust: it is precisely the inductive hypothesis, made rigorous.

### Walkthrough

- **The two-part technique, base case and inductive step** — first appearance of *structural induction*, deliberately stated to mirror Lesson 27's own base-case-and-recursive-case shape, rather than as an unrelated new procedure.
- **The explanation of why the inductive hypothesis isn't circular** — first appearance of *inductive hypothesis*, defined precisely and defended directly against the most natural objection to it.
- **The explicit connection to why recursive procedures are trustworthy** — not a new concept, but the precise closing of a gap this curriculum has depended on silently since its very first recursive procedure, now finally made explicit.

### CS Lens

This is the proof-side mirror of structural recursion (Lesson 33): the identical base-case-and-recursive-case shape that licenses *computing* over recursive data licenses *proving things about* recursive data, for the identical underlying reason — both techniques are ultimately justified by the same fact about how a recursively defined structure is built. Also recognized in: a building inspection certifying a foundation directly, then certifying each additional floor based on the floor beneath it already being certified sound; a genealogical claim about "every ancestor" established by verifying it for the earliest known ancestor, then showing it passes from any verified ancestor to their children; a supply chain certification verifying raw materials directly, then certifying each assembled stage based on its verified inputs; a mathematical proof that a physical process converges, established by verifying an initial state directly, then showing the process's own update rule preserves whatever property was being tracked.

### SE Lens

The alternative to formalizing structural induction is to keep trusting recursive procedures' correctness informally, the way this curriculum has done by necessity since Lesson 27, without ever stating precisely *why* that trust is justified. The real cost of that alternative is exactly the gap Concept Unit 1 exposed: an informal sense that recursion "should" work provides no actual defense against a case like Lesson 42's arbitrary-depth tree, where checking examples alone cannot establish a general claim. Formalizing the technique explicitly, as this unit does, costs the conceptual work of stating and justifying both parts precisely; it is what finally supplies the missing tool Concept Unit 1 identified, and what retroactively justifies every recursive procedure this curriculum has written since Lesson 28.

---

## Concept Unit 3: A Worked Proof — inorder Really Does Produce Sorted Output

### The Problem

Concept Unit 2 stated the technique; it's time to actually use it, on the exact claim Lesson 42 left open, for a tree of genuinely unrestricted depth rather than the fixed, three-level `example-tree`.

### No isolated lab for this step

This concept has no code of its own to isolate — the complete structural induction proof is given directly below, not through a construct with its own syntax.

### Applying It — the Full Proof

**The property `P(tree)`, stated precisely:** if `tree` is a binary search tree — every node's left subtree contains only values less than that node's value, and every node's right subtree contains only values greater than it — then `inorder(tree)` is sorted (non-decreasing, left to right).

**Base case: `tree` is the empty tree.** `inorder('())` returns `'()`, by `inorder`'s own base case (Lesson 42). An empty sequence is trivially sorted — there are no adjacent pairs to violate the sorted condition. `P` holds directly.

**Inductive step: `tree` is a node with value `v`, left subtree `L`, and right subtree `R`.**

> 1. **Inductive hypothesis:** assume `P(L)` and `P(R)` both hold — that is, `inorder(L)` and `inorder(R)` are each already sorted.
> 2. Since `tree` is a binary search tree, every value in `L` is less than `v`, and every value in `R` is greater than `v` (the binary-search-tree property, applied to this specific node).
> 3. `inorder(tree) = inorder(L) ++ [v] ++ inorder(R)`, by `inorder`'s own recursive case (Lesson 42), where `++` denotes the list concatenation `append` performs.
> 4. By the inductive hypothesis (Step 1), `inorder(L)` is sorted, and every one of its values is less than `v` (Step 2) — so appending `v` immediately after `inorder(L)` keeps the combined sequence sorted so far.
> 5. By the inductive hypothesis, `inorder(R)` is sorted, and every one of its values is greater than `v` (Step 2) — so appending `inorder(R)` immediately after `v` keeps the whole sequence sorted through to the end.
> 6. Therefore, `inorder(L) ++ [v] ++ inorder(R)` — which Step 3 already established equals `inorder(tree)` — is sorted. `P(tree)` holds.

**Confirming both parts together establish the claim for a tree of any depth:** a tree of depth `d` is proven via the inductive step, which relies on `P` already holding for its two subtrees, each of depth at most `d − 1` — which were themselves proven the same way, all the way down to the empty subtrees at the very bottom, proven directly by the base case. No depth is ever assumed or skipped.

**Rechecking this against Lesson 42's real, verified examples:** `example-tree` (three levels) and the deeper eight-node tree checked in this lesson's own evidence-gathering both satisfy this proof's hypothesis and both were independently confirmed sorted — consistent with, though no longer needed to establish, what this proof now guarantees for every such tree.

### Walkthrough

- **The base case, `tree = '()`** — a direct application of Concept Unit 2's first requirement, proven with no assumption at all, exactly as required.
- **Step 1, stating the inductive hypothesis explicitly** — a reappearance of *inductive hypothesis*, applied here specifically to the two subtrees `L` and `R`, genuinely smaller than `tree` itself.
- **Step 3, reappearing `inorder`'s exact recursive case from Lesson 42** — grounds the proof in the actual code being reasoned about, not an abstract restatement of it.
- **Steps 4 and 5, the actual combination of the inductive hypothesis with the binary-search-tree property** — the heart of the proof: showing precisely how "already sorted" plus "everything on one side is smaller, everything on the other is larger" combines into "the whole thing is sorted."

### CS Lens

This is a complete, general correctness proof for a real algorithm — `inorder` traversal of a binary search tree — covering every possible tree satisfying the property, not merely the ones happened to be tested, the actual standard this curriculum has been building toward since Lesson 22 first distinguished evidence from proof. Also recognized in: a compiler correctness proof, establishing that a translation rule preserves meaning for programs of any size, by induction on program structure; a data structure invariant proof, establishing that a balancing operation preserves a tree's balance property for a tree of any size; a recursive algorithm's correctness proof in general, the standard way computer science establishes that an algorithm works for every input, not just tested ones.

### SE Lens

The alternative to writing this full proof is to remain at Lesson 42's level of confidence — a convincing trace through one specific tree — and trust that it generalizes. The real cost of that alternative, made concrete by everything Lesson 22 already established, is that "convincing" and "proven" remain permanently different claims, no matter how many additional example trees get checked. Writing the complete inductive proof, as this unit does, costs real, careful effort — precisely stating the property, correctly identifying what's smaller in the inductive step, and correctly combining the inductive hypothesis with the tree's own defining property; it buys a guarantee that holds for a tree of any depth at all, checked once, forever.

---

## Concept Unit 4: A Second Worked Proof — map Preserves Length, for Real

### The Problem

Lesson 34, Concept Unit 5, stated that `map` always preserves a list's length and checked it against exactly one list. Structural induction can establish this properly, for a list of any length, the same way Concept Unit 3 just did for trees of any depth — confirming the technique generalizes across genuinely different recursive data types, exactly as Lesson 40 already established structural recursion itself does.

### No isolated lab for this step

This concept has no code of its own to isolate — the second complete proof is given directly below, not through a construct with its own syntax.

### Applying It — the Full Proof

**The property `P(lst)`, stated precisely:** for any function `f` and any list `lst`, `length(map(f, lst)) = length(lst)`.

**Base case: `lst` is `'()`.** `map(f, '())` returns `'()` (Lesson 34's base case). `length('()) = 0` and `length('()) = 0` — both sides equal. `P` holds directly.

**Inductive step: `lst` is `cons(x, rest)` for some item `x` and smaller list `rest`.**

> 1. **Inductive hypothesis:** assume `P(rest)` holds — that is, `length(map(f, rest)) = length(rest)`.
> 2. `map(f, cons(x, rest)) = cons(f(x), map(f, rest))`, by `map`'s own recursive case (Lesson 34).
> 3. `length(cons(f(x), map(f, rest))) = 1 + length(map(f, rest))`, by `length`'s own recursive case (Lesson 32).
> 4. By the inductive hypothesis (Step 1), `length(map(f, rest)) = length(rest)`. Substituting into Step 3: `length(map(f, cons(x, rest))) = 1 + length(rest)`.
> 5. `length(cons(x, rest)) = 1 + length(rest)`, by `length`'s own recursive case, applied directly to `cons(x, rest)`.
> 6. Steps 4 and 5 both equal `1 + length(rest)` — therefore `length(map(f, cons(x, rest))) = length(cons(x, rest))`. `P(cons(x, rest))` holds.

**Confirming this holds for any `f` at all, not just the specific ones tested in Lesson 34:** nothing in this proof ever used any property of `f` beyond its being a function applied once per item — `f` never appears on either side of the final equation in Step 6, exactly reflecting that length-preservation has nothing to do with what `f` actually computes, only with the fact that `map` produces exactly one output per input.

### Walkthrough

- **The base case, `lst = '()`** — proven directly, matching Lesson 34's own already-established base case for both `map` and `length`.
- **Step 1, the inductive hypothesis for the smaller list `rest`** — a reappearance of *inductive hypothesis*, applied here to lists rather than trees, confirming the technique isn't tree-specific.
- **Steps 2 and 3, grounding the proof directly in `map` and `length`'s own real recursive cases** — not abstract restatements, but the actual definitions from Lessons 32 and 34.
- **Step 6, the final equality, with `f` never appearing** — confirms, explicitly, that the proof genuinely covers every possible function `f`, not merely the ones happened to be checked.

### CS Lens

This is confirmation that structural induction, like structural recursion before it (Lesson 40), is a general technique applicable to any recursively defined data — lists here, trees in Concept Unit 3 — rather than a technique invented specifically for one of them. Also recognized in: a mathematical property proven by induction for one recursively defined number system (naturals) and then shown to generalize, using the identical technique, to a structurally different one (lists, trees, or graphs); a safety property proven by induction for one recursive data structure in a formally verified program, then proven again, using the identical technique, for a structurally different data structure in the same program.

### SE Lens

The alternative to proving this second claim is to let Concept Unit 3's tree proof stand as the only example, risking the impression that structural induction is somehow specific to trees or to sorting. The real cost of that alternative is exactly the narrow-understanding risk Lesson 40 already warned about for structural recursion itself — a learner who's only seen the technique applied once might not recognize it as available the next time a different recursively defined structure raises a similar "does this hold for every instance" question. Proving a second, structurally different claim, as this unit does, costs one additional full proof; it confirms the technique itself, not merely one successful application of it, is what's actually been learned.

---

## Concept Unit 5: Structural Induction Mirrors Structural Recursion — Why This Isn't a Coincidence

### The Problem

Both proofs in this lesson followed the identical shape as the code they were proving something about — `inorder`'s proof had a base case and inductive step exactly matching `inorder`'s own base case and recursive case; the `map`-length proof did the same. It's worth stating directly why this correspondence is not a stylistic coincidence, but a necessary consequence of what both techniques actually are.

### No isolated lab for this step

This concept has no code of its own to isolate — the final, unifying explanation is given directly below, not through a construct with its own syntax.

### Applying It — One Underlying Reason for Two Techniques

**Structural recursion (Lesson 33), restated:** a computational procedure with one case per case of the data's own recursive definition, correctly handling every instance because the definition itself guarantees every instance eventually reduces to the base case.

**Structural induction (Concept Unit 2), restated:** a proof with one case per case of the data's own recursive definition, correctly establishing a property for every instance for the identical reason — the definition itself guarantees every instance eventually reduces to the base case.

**Stating the shared foundation directly:** both techniques work for the same reason, because they are, at bottom, the same technique aimed at two different goals — one computing a value, one establishing a fact — both licensed entirely by the recursively defined structure's own base case and recursive case, per Lesson 27.

**Confirming this explains something that might otherwise feel uncomfortable:** a recursive procedure's recursive case trusting its own recursive call's result on smaller input (`factorial` trusting `(factorial (- n 1))`, `inorder` trusting `(inorder (node-left tree))`) can feel, to someone encountering it for the first time, uncomfortably close to assuming what's being computed. Structural induction is the precise, rigorous justification for why that trust is not circular: it is the inductive hypothesis, applied not to a proof but to a computation, and it is exactly as sound in that setting as Concept Unit 2 already established it is in this lesson's own two proofs.

### Walkthrough

- **Structural recursion and structural induction, restated side by side** — not new concepts, but a direct, final comparison making their shared shape explicit rather than merely implicit across this lesson's two worked proofs.
- **"the same technique aimed at two different goals"** — the precise, unifying statement this entire lesson has been building toward.
- **The explicit resolution of recursion's apparent circularity** — closes a gap that has been silently present since Lesson 28's very first recursive procedure, now given its actual, rigorous justification rather than left as something that simply happens to work.

### CS Lens

This is the deepest connection this curriculum has drawn so far between computing and proving: the same recursive structure that makes a computation well-defined is exactly what makes a proof about that structure valid, because both are grounded in the identical fact — a base case that terminates the recursion, and a recursive case that always, genuinely, reduces to something smaller. Also recognized in: the Curry-Howard correspondence, a much deeper connection this curriculum will name explicitly much later, between programs and proofs; a manufacturing process and its quality certification sharing an identical stage-by-stage structure, for the identical underlying reason; a legal contract's obligations and its own enforcement mechanism sharing an identical clause-by-clause structure.

### SE Lens

The alternative to stating this connection explicitly is to let a learner absorb structural recursion and structural induction as two separate, coincidentally similar-looking techniques, never quite understanding why they resemble each other so closely. The real cost of that alternative is a shallower, less transferable understanding of both — missing the connection means missing that trusting a recursive call's correctness on smaller input was never an act of faith; it has been structural induction, silently at work, since this curriculum's very first recursive procedure. Stating the connection directly, as this final unit does, costs one closing comparison; it is what turns two separately learned techniques into one deeply understood idea.

---

## Closing

### Connect the pieces

Two claims, one about trees and one about lists, both previously left unproven, traced through every unit built in this lesson, start to finish:

1. **The gap named (Unit 1):** direct proof alone cannot handle "any tree, of any depth" — the same unbounded-domain problem Lesson 21 already diagnosed, in a new setting.
2. **The technique supplied (Unit 2):** structural induction — a base case proven directly, an inductive step trusting smaller instances — and its precise justification for why recursive procedures' self-trust is not circular.
3. **Lesson 42's claim, finally proven (Unit 3):** `inorder` produces sorted output for a binary search tree of any depth, established completely, not merely traced through one example.
4. **Lesson 34's claim, finally proven (Unit 4):** `map` preserves list length for any function and any list, established completely, with `f` never once needing to be assumed anything specific.
5. **The deeper reason, stated explicitly (Unit 5):** structural recursion and structural induction share one underlying justification, resolving why recursive self-trust has been sound all along.

Unit 5's explanation accounts directly for both of Unit 3 and Unit 4's proofs — not a separate insight, but the precise reason both proofs were able to follow their respective procedures' own recursive shape so exactly.

### What breaks without this

Suppose a later, more elaborate procedure over trees or lists were written, and its author, having only ever seen claims checked against a few examples (Lesson 42's own honest limitation, before this lesson), presented "checked against several test cases" as equivalent to an actual guarantee. A colleague relying on that claim to build further logic on top of it — code assuming `inorder` always produces sorted output, say, the way a real search feature might — would be trusting something that was never actually established for every possible tree, only observed to hold for the ones happened to be tried, exactly the gap Lesson 22's `n² + n + 41` warned could hide an untested failure at any depth beyond whatever was checked. Restoring this lesson's discipline — actually proving a claim about recursive data using structural induction, rather than resting on checked examples alone, whenever the claim needs to hold for structures of unbounded depth — is what converts "seems to always work" into "is guaranteed to work," closing exactly the gap this curriculum has been carrying, honestly flagged, since Lesson 34 and Lesson 42 first made their claims.

### Exercises

1. **Observe.** Return to Lesson 33's `sum-list` and state, precisely, the property "the sum of a list's items is always at least as large as its largest single item, if all items are non-negative" — or a similar claim of your own about a procedure you've already built.
2. **Formalize.** State your Exercise 1 claim's base case and inductive step explicitly, following Concept Unit 3's exact structure, before writing any proof steps.
3. **Formalize.** Write the complete structural induction proof for your Exercise 1 claim, following Concept Unit 3 or Concept Unit 4's exact format — hypothesis stated, inductive hypothesis named explicitly, each step justified by an already-established definition.
4. **Explain.** Check your Exercise 3 proof against several real, checked examples using actual Scheme code, the way this lesson's own evidence-gathering checked `map`-length across several functions and lists, and confirm they're consistent with (though not a substitute for) your proof.
5. **Explain.** In your own words, explain why your Exercise 3 proof's inductive step is not circular reasoning, using Concept Unit 2's explanation as a model.

### Definition of done

- [ ] You can state the two parts of structural induction from memory, and explain why the inductive step's assumption is not circular.
- [ ] You can write a complete structural induction proof for a property of a recursive procedure you've built, with an explicit base case and inductive step.
- [ ] You can explain, in your own words, why structural recursion and structural induction share the same underlying justification.
- [ ] You can identify, in your own past work, at least one claim that was only ever checked against examples and could now be proven properly using this lesson's technique.
- [ ] You completed Exercises 1–5 using a claim of your own choosing, not the `inorder`-sorted or `map`-length claims.
- [ ] Commit your Exercise 3 proof, with a commit message stating which specific step of the proof took the most care to get right, and why.
