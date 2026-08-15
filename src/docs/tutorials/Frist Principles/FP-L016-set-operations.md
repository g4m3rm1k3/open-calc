# Lesson 16: Set Operations

**What you will build:** Still nothing runnable — this lesson introduces operations (Lesson 3) that take one or two sets (Lesson 15) as operands and produce a new set as their result: union, intersection, difference, complement, and Cartesian product. The transferable problem this lesson is actually about: real questions about collections are almost never about just one set on its own — they're about how two sets relate to each other, who belongs to both, who belongs to only one, and every possible way members of one set could be paired with members of another.

**What you need to know first:** Lesson 3 (`FP-L003-values-and-operations.md`) — specifically *operation*, generalized here to take sets as operands. Lesson 11 (`FP-L011-logical-operators.md`) — specifically `AND`, `OR`, and `NOT`, each shown to be exactly what a corresponding set operation reduces to at the level of membership. Lesson 15 (`FP-L015-sets.md`) — specifically *set*, *membership*, and *set-builder notation*, all reused directly throughout.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Union** — an operation taking two sets and producing a new set containing every item that belongs to at least one of them, written `A ∪ B`. `x ∈ (A ∪ B)` holds exactly when `(x ∈ A) OR (x ∈ B)` holds.
- **Intersection** — an operation taking two sets and producing a new set containing only the items that belong to both, written `A ∩ B`. `x ∈ (A ∩ B)` holds exactly when `(x ∈ A) AND (x ∈ B)` holds.
- **Difference** — an operation taking two sets and producing a new set containing every item that belongs to the first but not the second, written `A − B`. `x ∈ (A − B)` holds exactly when `(x ∈ A) AND NOT (x ∈ B)` holds.
- **Universal set** — the full domain a complement is taken relative to, written `U`. A complement is never meaningful on its own; it always requires stating, explicitly, what larger collection "everything else" is being drawn from — the same way a precondition (Lesson 9) is never meaningful without stating what it's a condition on.
- **Complement** — an operation taking one set and producing the set of every item in the universal set that does *not* belong to it, written `Aᶜ`. `x ∈ Aᶜ` holds exactly when `(x ∈ U) AND NOT (x ∈ A)` holds.
- **Ordered pair** — two items combined in a specific order, written `(a, b)`, where `(a, b)` and `(b, a)` are considered different unless `a` and `b` happen to be the same item. An ordered pair is deliberately the opposite of a set in exactly one respect: a set (Lesson 15) never cares about order, and an ordered pair is entirely defined by it.
- **Cartesian product** — an operation taking two sets and producing a new set of every possible ordered pair with its first item from the first set and its second item from the second, written `A × B`.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, using two small school-club sets for Concept Units 1 through 4, and a product catalog for Concept Unit 5.

---

## Concept Unit 1: Union — Combining Two Sets

### The Problem

A class of five students, `U = {Ana, Ben, Cid, Dee, Eli}`, has two clubs. The math club is `Math = {Ana, Ben, Cid}`; the science club is `Science = {Ben, Cid, Dee}`. A teacher planning a joint field trip needs the set of every student in *either* club — not two separate lists to cross-reference by hand, but one set, built directly from the two already-defined ones.

### No isolated lab for this step

This concept has no code of its own to isolate — union is demonstrated directly below, built from Lesson 11's `OR` applied to membership, not through a construct with its own syntax.

### Applying It — Either Club

**The two sets:** `Math = {Ana, Ben, Cid}`, `Science = {Ben, Cid, Dee}`.

**The union, defined by membership:** `x ∈ (Math ∪ Science)` holds exactly when `(x ∈ Math) OR (x ∈ Science)` holds.

**Working out the actual members, by checking each of the five students:** `Ana ∈ Math` is `true`, so `Ana ∈ (Math ∪ Science)` is `true` (Lesson 11's `OR` only needs one side to hold). `Ben` and `Cid` are in both sets, so both hold. `Dee ∈ Science` is `true`, so `Dee ∈ (Math ∪ Science)` is `true`. `Eli` is in neither set, so `Eli ∈ (Math ∪ Science)` is `false`.

**The resulting set:** `Math ∪ Science = {Ana, Ben, Cid, Dee}`.

### Walkthrough

- **`x ∈ (Math ∪ Science)` holds exactly when `(x ∈ Math) OR (x ∈ Science)`** — first appearance of *union*, defined directly in terms of Lesson 11's `OR` applied to two membership checks (Lesson 15), rather than as an independent new idea.
- **Checking each of the five students individually** — a reappearance of *membership* (Lesson 15), applied once per student, exactly the way Lesson 14's quantifiers checked a predicate once per domain item.
- **`{Ana, Ben, Cid, Dee}`, with `Eli` the only student excluded** — confirms union includes everyone belonging to at least one set, and excludes only those in neither.

### CS Lens

This is the idea of combining two collections into one that includes everything from either — exactly Lesson 11's `OR`, now operating at the level of whole sets instead of individual Boolean values. Also recognized in: a search returning documents matching *either* of two keywords; a guest list combining invitees from two separate events into one master list; a database `UNION` query, combining rows from two result sets into one; a recycling program accepting items belonging to either of two separate accepted-materials lists.

### SE Lens

The alternative to defining union precisely is to combine two lists by hand, checking each one for duplicates and cross-referencing membership informally. The real cost of that alternative, for even a modest number of items, is exactly the same error-prone repetition Lesson 1 warned about for un-generalized calculations — a student appearing in both original lists might get listed twice, or a shared member might get missed during manual cross-referencing. Defining union in terms of membership and `OR`, as this unit does, costs nothing beyond stating the rule once; it guarantees, by Lesson 15's own definition of set equality, that the result never contains an accidental duplicate and never misses a member of either original set.

---

## Concept Unit 2: Intersection — What Two Sets Share

### The Problem

The same teacher, planning a smaller trip with room for only students in *both* clubs, needs a different set entirely — not everyone in either club, but only those doing double duty in both.

### No isolated lab for this step

This concept has no code of its own to isolate — intersection is demonstrated directly below, built from Lesson 11's `AND`, not through a construct with its own syntax.

### Applying It — Both Clubs

**The intersection, defined by membership:** `x ∈ (Math ∩ Science)` holds exactly when `(x ∈ Math) AND (x ∈ Science)` holds.

**Working out the actual members:** `Ana ∈ Math` is `true`, but `Ana ∈ Science` is `false`; `true AND false` is `false` (Lesson 11), so `Ana` is excluded. `Ben` is in both, so `true AND true` holds — `Ben` is included. `Cid` is in both the same way — included. `Dee ∈ Math` is `false`, so `Dee` is excluded regardless of `Science` membership. `Eli` is in neither, excluded.

**The resulting set:** `Math ∩ Science = {Ben, Cid}`.

### Walkthrough

- **`x ∈ (Math ∩ Science)` holds exactly when `(x ∈ Math) AND (x ∈ Science)`** — first appearance of *intersection*, defined directly in terms of Lesson 11's `AND`, in direct structural parallel to how union was defined in terms of `OR`.
- **Checking each student, with `Ana` and `Dee` each excluded for a different reason** — demonstrates `AND`'s requirement that *both* sides hold, in direct contrast to Concept Unit 1's `OR`, which only needed one.
- **`{Ben, Cid}`** — the resulting set, strictly smaller than either original set, exactly as `AND`'s truth table guarantees it must be.

### CS Lens

This is the idea of finding exactly what two collections have in common — Lesson 11's `AND`, now operating at the level of whole sets. Also recognized in: a search returning only documents matching *both* of two keywords; a dating app's compatibility match, based on shared interests common to both users' profiles; a database `INTERSECT` query, returning only rows present in both result sets; a Venn diagram's overlapping region, the visual representation of exactly this operation.

### SE Lens

The alternative to defining intersection precisely is to eyeball two lists side by side, looking for matches by hand. The real cost of that alternative grows quickly with list size — checking every pair of items from two lists of even modest length by eye is exactly the kind of repeated, error-prone comparison this curriculum has repeatedly shown to be unreliable. Defining intersection in terms of membership and `AND` costs nothing beyond the rule itself; it guarantees an exact, checkable answer for any two sets, however large, the same way Lesson 14's quantifiers guaranteed an exact answer over any domain.

---

## Concept Unit 3: Difference — What's in One but Not the Other

### The Problem

The teacher now wants to know which students are in the math club *specifically*, and would need separate seating from the science-club overlap — students in `Math` who are not also in `Science`. Neither union nor intersection answers this: union includes everyone in either, intersection includes only the overlap, and neither one isolates "in this set, excluding that one."

### No isolated lab for this step

This concept has no code of its own to isolate — difference is demonstrated directly below, built from Lesson 11's `AND` combined with `NOT`, not through a construct with its own syntax.

### Applying It — Math Club Only

**The difference, defined by membership:** `x ∈ (Math − Science)` holds exactly when `(x ∈ Math) AND NOT (x ∈ Science)` holds.

**Working out the actual members:** `Ana ∈ Math` is `true`; `Ana ∈ Science` is `false`, so `NOT (Ana ∈ Science)` is `true`; `true AND true` holds — `Ana` is included. `Ben ∈ Math` is `true`, but `Ben ∈ Science` is also `true`, so `NOT (Ben ∈ Science)` is `false`; `true AND false` fails — `Ben` is excluded. `Cid` is excluded the same way. `Dee` and `Eli` are excluded immediately, since neither is even in `Math` at all.

**The resulting set:** `Math − Science = {Ana}`.

**Confirming difference is not commutative, in direct contrast to union and intersection:** `Science − Math` asks a different question — students in science but not math. `Dee ∈ Science` is `true`, `Dee ∈ Math` is `false`, so `Dee` is included; `Ben` and `Cid` are excluded, being in both. `Science − Math = {Dee}` — a different set entirely from `Math − Science = {Ana}`.

### Walkthrough

- **`x ∈ (Math − Science)` holds exactly when `(x ∈ Math) AND NOT (x ∈ Science)`** — first appearance of *difference*, built from `AND` combined with `NOT` (Lesson 11), the first set operation in this lesson requiring two logical operators rather than one.
- **`{Ana}`, the resulting set** — confirms difference isolates exactly the members unique to the first set.
- **`Science − Math = {Dee}`, compared against `Math − Science = {Ana}`** — demonstrates directly that, unlike union and intersection, difference depends on which set is written first — a reappearance of *commutative* (Lesson 8), here shown to fail for this particular operation.

### CS Lens

This is the idea of isolating what belongs exclusively to one collection, excluding anything shared with another. Also recognized in: a database `EXCEPT` query, returning rows present in one result but absent from another; an inventory audit identifying items on a physical shelf count but missing from a recorded system list; a version-control diff, showing lines present in one file version but absent from another; a "people who viewed this but didn't purchase" marketing segment, built from exactly this kind of exclusion.

### SE Lens

The alternative to defining difference precisely, and specifically to skipping the check for whether it's commutative, is to assume, by analogy with union and intersection, that `A − B` and `B − A` should behave similarly. The real cost of that unchecked assumption is exactly the mistake Lesson 8, Concept Unit 3, already warned against for composed functions: assuming an operation behaves like a similar-looking one without verifying it. Checking difference's commutativity directly, as this unit did, costs one extra comparison; it prevents exactly the kind of silent, order-dependent bug Lesson 8 demonstrated for `add_one` and `double`.

---

## Concept Unit 4: Complement — Everything Outside a Set, Relative to a Universe

### The Problem

"Students not in the math club" sounds like it should be answerable directly from `Math` alone — but it isn't, not without first answering a question difference, union, and intersection never had to ask: not in math club, out of *what*? Every student in the whole school? Every student in the class? Every living person on Earth who isn't in this particular math club? "Not in `Math`" is meaningless until a specific larger collection is named to draw "everything else" from.

### No isolated lab for this step

This concept has no code of its own to isolate — the necessity of a stated universal set is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Not in Math Club

**The universal set, stated explicitly — without this, nothing in this unit can proceed:** `U = {Ana, Ben, Cid, Dee, Eli}`, the entire class this lesson has been working with all along.

**The complement, defined by membership, relative to this stated `U`:** `x ∈ Mathᶜ` holds exactly when `(x ∈ U) AND NOT (x ∈ Math)` holds.

**Working out the actual members:** every one of the five students is in `U` by definition, so the `(x ∈ U)` clause always holds here; the check reduces to `NOT (x ∈ Math)`. `Ana`, `Ben`, `Cid` are all in `Math`, so each is excluded. `Dee` and `Eli` are not in `Math`, so `NOT (x ∈ Math)` holds for both — included.

**The resulting set:** `Mathᶜ = {Dee, Eli}`.

**Confirming this genuinely depends on which universal set was chosen:** if `U` had instead been the whole school of five hundred students, rather than this one class of five, `Mathᶜ` would include every one of the roughly four hundred ninety-seven students outside this specific class entirely — a completely different, much larger set, from the exact same `Math`, simply because a different universal set was named.

### Walkthrough

- **"not in math club, out of what?"** — establishes directly why complement cannot be defined the way union, intersection, and difference were: those three needed only the two sets involved; complement needs an explicit third thing, the universal set, stated first.
- **`U = {Ana, Ben, Cid, Dee, Eli}`, stated explicitly** — first appearance of *universal set*, named before the complement itself can even be defined.
- **`x ∈ Mathᶜ` holds exactly when `(x ∈ U) AND NOT (x ∈ Math)`** — first appearance of *complement*, built from `AND` and `NOT`, with the `(x ∈ U)` clause doing real work only when `U` is not simply "everything" but a specific, bounded collection.
- **The whole-school comparison** — not a new concept, but direct confirmation that a complement's actual members depend entirely on which universal set was named, exactly the way Lesson 9's postcondition depended entirely on its precondition having been stated.

### CS Lens

This is the recognition that "everything else" is never a free-standing idea — it always requires a stated boundary for what "everything" means in the first place, the same requirement Lesson 1 placed on every computational problem's input. Also recognized in: a firewall's "deny all" default rule, meaningless without first defining the universe of possible traffic it applies to; a tax code's exemption list, meaningful only relative to a stated universe of taxable entities; a spell-checker's "not a recognized word" flag, relative to whichever specific dictionary is loaded; a museum's "not on display" inventory, meaningful only relative to the museum's total stated collection.

### SE Lens

The alternative to explicitly naming a universal set is to talk about a complement as though "everything else" were self-evident, the same unstated-assumption trap Lesson 1 warned about for input and Lesson 9 warned about for preconditions. The real cost of that alternative is exactly what the whole-school comparison demonstrated: two people discussing "students not in math club" could silently mean wildly different universal sets — one the class, one the whole school — and reach completely different, both internally consistent, conclusions without ever noticing they were answering different questions. Naming the universal set explicitly, every time a complement is taken, costs one stated fact; it removes this exact category of silent disagreement.

---

## Concept Unit 5: Cartesian Product — Pairing Every Combination

### The Problem

A small shop sells one item in two colors, `Colors = {red, blue}`, and two sizes, `Sizes = {S, M}`. Stocking the shop means preparing every possible color-and-size combination as its own distinct product — not a union of colors and sizes (which would just be `{red, blue, S, M}`, four unrelated items), and not an intersection (which would be empty, since no color is also a size) — but every way of pairing one color with one size.

### No isolated lab for this step

This concept has no code of its own to isolate — Cartesian product is demonstrated directly below, building on the newly introduced ordered pair, not through a construct with its own syntax.

### Applying It — Every Color-Size Combination

**An ordered pair, introduced first, since Cartesian product is built from it:** `(red, S)` — red, then S, in that specific order. `(S, red)` would be a different ordered pair entirely, pairing the same two items in reverse — a distinction that never applied to a set's members (Lesson 15), where `{red, S}` and `{S, red}` are the exact same set.

**The Cartesian product, defined directly:** `Colors × Sizes` is the set of every ordered pair with its first item from `Colors` and its second from `Sizes`.

**Working out every member by systematically pairing each color with each size:** `red` paired with `S`, then with `M`; `blue` paired with `S`, then with `M`.

**The resulting set:**

> `Colors × Sizes = {(red, S), (red, M), (blue, S), (blue, M)}`

**Confirming order matters here, in direct contrast to Lesson 15's sets:** `Colors × Sizes` and `Sizes × Colors` are genuinely different sets — `Sizes × Colors` would contain `(S, red)`, `(M, red)`, `(S, blue)`, `(M, blue)` — pairs with sizes listed first, which are not the same ordered pairs as `(red, S)` and the rest, even though they combine the exact same underlying items.

### Walkthrough

- **`(red, S)`, contrasted with `{red, S}`** — first appearance of *ordered pair*, deliberately compared against Lesson 15's set notation to highlight that order, meaningless for a set, is the entire content of a pair.
- **`Colors × Sizes = {(red, S), (red, M), (blue, S), (blue, M)}`** — first appearance of *Cartesian product*, worked out by systematically pairing every member of the first set with every member of the second.
- **`Sizes × Colors`, shown to differ** — confirms Cartesian product is not commutative, in direct structural parallel to Concept Unit 3's finding for difference, though for a different underlying reason: here, it's because the pairs themselves are ordered, not because the operation's own definition is asymmetric.

### CS Lens

This is the idea of systematically generating every possible combination of items drawn from two separate collections — the mathematical foundation behind exhaustively considering every case a two-part choice could produce. Also recognized in: a restaurant's prix fixe menu, generating every combination of one appetizer and one entrée; a coordinate grid, generating every point from a pairing of possible x-values and y-values; a database join without any filtering condition, producing every combination of rows from two tables; a testing strategy that deliberately exercises every combination of two independent input parameters, to make sure no combination was overlooked.

### SE Lens

The alternative to Cartesian product is to generate combinations by hand, nesting loops or writing out pairs individually as they're needed, without ever naming the underlying operation being performed. The real cost of that alternative, once the two sets involved grow beyond a handful of items, is exactly the same risk of missed or duplicated cases already seen throughout this lesson — a color-size combination accidentally skipped, or listed twice, because nothing enforced systematic, exhaustive pairing. Naming Cartesian product as a precise operation costs nothing beyond stating the two sets involved; it guarantees, by definition, that every combination is generated exactly once, setting up exactly the tool the next lesson needs to define relationships between two sets precisely.

---

## Closing

### Connect the pieces

Two sets, `Math = {Ana, Ben, Cid}` and `Science = {Ben, Cid, Dee}`, drawn from `U = {Ana, Ben, Cid, Dee, Eli}`, traced through every unit built in this lesson, start to finish:

1. **Union (Unit 1):** `Math ∪ Science = {Ana, Ben, Cid, Dee}` — everyone in at least one club.
2. **Intersection (Unit 2):** `Math ∩ Science = {Ben, Cid}` — everyone in both.
3. **Difference (Unit 3):** `Math − Science = {Ana}`, and, checked separately, `Science − Math = {Dee}` — confirming the operation is not commutative.
4. **Complement (Unit 4):** `Mathᶜ = {Dee, Eli}`, relative to the stated `U` — and a demonstration that a different `U` would produce an entirely different complement.
5. **Cartesian product (Unit 5):** a fresh example, `Colors × Sizes`, producing every ordered-pair combination, deliberately contrasted with Lesson 15's order-independent sets.

Every one of Units 1 through 4's results was checked against the exact same five students and the exact same two original club sets — nothing in this lesson's first four units introduced a fresh, unrelated example.

### What breaks without this

Suppose Concept Unit 4's insistence on a stated universal set had been ignored, and a school's records system computed "students not enrolled in any club" by taking a complement without ever specifying, in its own logic, which universal set — the whole school, or just the students who had submitted at least one club-interest form — it was actually working from. A student who submitted no club-interest form at all would be silently excluded from the universal set entirely in one part of the system, while another part of the system, built by someone who assumed the universal set was the whole school roster, would expect that same student to appear correctly in the "not enrolled in any club" complement. Depending on which part of the system generated a given report, that student would either appear on an outreach list meant to catch exactly the students who need it, or vanish from every list entirely — not because of any error in computing the complement itself, but because two different, never-reconciled assumptions about the universal set were quietly in play. Restoring Concept Unit 4's discipline — stating the universal set explicitly, every time a complement is taken, and keeping that statement consistent across every part of the system — removes this failure by making the previously implicit disagreement impossible to have silently in the first place.

### Exercises

1. **Observe.** Choose two overlapping real-world sets of your own (two categories of a hobby, two lists of requirements, two overlapping groups of people you know), stating each one by listing its members, the way `Math` and `Science` were stated.
2. **Formalize.** Compute the union and the intersection of your Exercise 1 sets by hand, checking membership for every relevant item, the way Concept Units 1 and 2 checked each of the five students.
3. **Formalize.** Compute both differences, `A − B` and `B − A`, for your Exercise 1 sets, and confirm directly whether they differ, the way Concept Unit 3 compared `Math − Science` against `Science − Math`.
4. **Explain.** State an explicit universal set for one of your Exercise 1 sets, and compute its complement relative to that universal set. Then compute the complement again relative to a deliberately different universal set, and explain how and why the result changes.
5. **Formalize.** Choose two small sets suited to pairing (not overlapping categories of the same kind of thing, the way a product's color and size options are genuinely different kinds of choice) and compute their Cartesian product by hand, the way Concept Unit 5 computed `Colors × Sizes`.

### Definition of done

- [ ] You can define union, intersection, and difference precisely in terms of membership and Lesson 11's logical operators, without relying only on an intuitive picture.
- [ ] You can explain why a complement cannot be computed without first stating a universal set, and give a concrete example of two different, equally valid universal sets producing two different complements for the same set.
- [ ] You can explain the difference between an ordered pair and a two-member set, and why Cartesian product needs the former rather than the latter.
- [ ] You can compute a Cartesian product by hand for two small sets, confirming every combination appears exactly once.
- [ ] You completed Exercises 1–5 using your own sets, not the school-clubs or product-catalog examples from this lesson.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating which of the five operations in this lesson you found least intuitive before working through it by hand.
