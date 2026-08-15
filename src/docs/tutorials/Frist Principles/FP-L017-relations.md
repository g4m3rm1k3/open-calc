# Lesson 17: Relations

**What you will build:** Still nothing runnable — this lesson names what's left over once a Cartesian product (Lesson 16) is narrowed down to only the pairs that are actually connected in some way: a *relation*. The transferable problem this lesson is actually about: real connections between two collections are almost never "everything paired with everything," the way a Cartesian product describes — an employee doesn't work in every department, a number isn't less-than-or-equal-to every other number — and this curriculum has had no precise way, until now, to describe exactly which pairs are connected and which aren't.

**What you need to know first:** Lesson 15 (`FP-L015-sets.md`) — specifically *set* and *set-builder notation*, both reused directly. Lesson 16 (`FP-L016-set-operations.md`) — specifically *ordered pair* and *Cartesian product*, both directly extended: a relation is defined here as a specific kind of subset of a Cartesian product.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Relation** — a subset of a Cartesian product `A × B` (Lesson 16), representing exactly which pairs of items are connected, out of every pair the Cartesian product could have contained. Writing `R ⊆ A × B` and `(a, b) ∈ R` (often abbreviated `a R b`) says precisely that `a` and `b` are related by `R`, while every pair in `A × B` but not in `R` is precisely not related.
- **Reflexive** — a property a relation on a set may have: every item is related to itself, `∀a ∈ A, a R a`. `≤` is reflexive on numbers, since every number is at least itself; `<` is not, since no number is strictly less than itself.
- **Symmetric** — a property a relation may have: whenever `a` is related to `b`, `b` is also related to `a`, `∀a, b ∈ A, (a R b) → (b R a)`. `=` is symmetric; `≤` is not, since `1 ≤ 2` holds while `2 ≤ 1` does not.
- **Transitive** — a property a relation may have: whenever `a` is related to `b`, and `b` is related to `c`, then `a` is also related to `c`, `∀a, b, c ∈ A, ((a R b) AND (b R c)) → (a R c)`. `≤` is transitive; a relation like "is a close friend of" often is not, since two people can each be close friends with a third without being close friends with each other.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, using an employee-department connection for Concept Units 1 through 3, and small numeric relations on `{1, 2, 3}` for Concept Units 4 and 5.

---

## Concept Unit 1: Beyond Pairing Everything — Only Some Pairs Are Connected

### The Problem

Three employees, `Employees = {Ana, Ben, Cid}`, and three departments, `Departments = {Sales, IT, HR}`. Lesson 16's Cartesian product, `Employees × Departments`, contains every possible employee-department pair — nine of them, since every employee is paired with every department. But that isn't what "who works where" actually means; Ana doesn't work in Sales, IT, and HR simultaneously. Only a handful of the nine possible pairs actually describe a real working arrangement, and nothing built so far can say, precisely, which ones.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap between "every possible pair" and "the pairs that are actually true" is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Who Actually Works Where

**Every possible pair, per Lesson 16's Cartesian product:**

> `Employees × Departments = {(Ana, Sales), (Ana, IT), (Ana, HR), (Ben, Sales), (Ben, IT), (Ben, HR), (Cid, Sales), (Cid, IT), (Cid, HR)}`

**The actual working arrangement, stated in prose:** Ana works in Sales. Ben works in IT. Cid works in both IT and HR.

**The gap, stated directly:** four of the nine pairs in the full Cartesian product — `(Ana, Sales)`, `(Ben, IT)`, `(Cid, IT)`, `(Cid, HR)` — describe something true. The other five describe something false. Nothing about the Cartesian product itself distinguishes the four true pairs from the five false ones; it treats all nine identically, exactly as its own definition (Lesson 16) requires.

### Walkthrough

- **`Employees × Departments`, all nine pairs** — a reappearance of *Cartesian product* (Lesson 16), shown here specifically to expose what it cannot express on its own.
- **The four actually-true pairs, named directly** — establishes concretely what's actually wanted: not the full product, but a specific, meaningful subset of it.
- **"nothing about the Cartesian product itself distinguishes"** — not a new concept, but the precise statement of the gap this whole lesson exists to close.

### CS Lens

This is the recognition that a full combinatorial pairing and an actual, meaningful connection are two different things, even though the second is always contained within the first. Also recognized in: a database join without a filtering condition, producing every combination of rows, versus the specific matches an actual foreign-key relationship describes; a social network's set of every possible pair of users versus the much smaller set of pairs who are actually friends; an airline's every possible city pair versus the specific routes it actually flies; a dating app's every possible pair of users versus the pairs who have actually matched.

### SE Lens

The alternative to naming this gap precisely is to keep describing real connections only in prose — "Ana works in Sales," stated as a sentence, with no precise notation connecting it back to the sets `Employees` and `Departments` at all. The real cost of that alternative is exactly Lesson 1's original cost: a real-world fact stated only informally cannot be checked, combined, or reasoned about using any of the tools this curriculum has built for sets and Boolean expressions. Naming the actual connections as a specific subset of the Cartesian product, the subject of the rest of this lesson, costs nothing beyond stating which pairs are true; it makes "who works where" a genuine set, usable with every tool Lesson 15 and Lesson 16 already established.

---

## Concept Unit 2: Relation — a Subset of a Cartesian Product

### The Problem

Concept Unit 1 identified exactly four pairs, out of nine possible ones, as actually true. Naming this precisely means recognizing what those four pairs, taken together, actually are: a set, and specifically a set of ordered pairs drawn from `Employees × Departments` — in other words, a subset of the Cartesian product itself.

### No isolated lab for this step

This concept has no code of its own to isolate — defining a relation as a subset is demonstrated directly below, combining Lesson 15's set with Lesson 16's Cartesian product, not through a new construct with its own syntax.

### Applying It — the WorksIn Relation

**The relation, named and defined directly:**

> `WorksIn = {(Ana, Sales), (Ben, IT), (Cid, IT), (Cid, HR)}`

**Confirming this is a subset of the Cartesian product from Concept Unit 1:** every one of `WorksIn`'s four pairs is also a member of `Employees × Departments`, and `WorksIn` excludes the other five members of that same Cartesian product — exactly what "subset" means.

**Using relation notation directly:** `(Ana, Sales) ∈ WorksIn` is `true`; `(Ana, IT) ∈ WorksIn` is `false`. Written with the abbreviated form, `Ana WorksIn Sales` holds; `Ana WorksIn IT` does not.

**Confirming this fixes Concept Unit 1's exact gap:** `WorksIn` is now a genuine set, checkable by membership (Lesson 15) exactly like any other set — the informal prose statement "Ana works in Sales" has become the precise, checkable fact `(Ana, Sales) ∈ WorksIn`.

### Walkthrough

- **`WorksIn = {(Ana, Sales), (Ben, IT), (Cid, IT), (Cid, HR)}`** — first appearance of *relation*, defined as a specific subset of `Employees × Departments`, containing exactly the four pairs Concept Unit 1 identified as true.
- **Confirming `WorksIn ⊆ Employees × Departments`** — a reappearance of the subset relationship implicit in Lesson 15's set definition, applied here to confirm `WorksIn` is a legitimate relation and not some unrelated set of pairs.
- **`(Ana, Sales) ∈ WorksIn`, and the abbreviated `Ana WorksIn Sales`** — demonstrates both the full membership notation (Lesson 15) and the shorthand form relations are commonly written with.

### CS Lens

This is the idea of representing a real-world connection as nothing more than a specific set of ordered pairs — turning "who is connected to what" into an object every set operation and membership check already built in this curriculum applies to directly. Also recognized in: a database's foreign-key relationship, literally implemented as a table of paired identifiers; a graph's edge list in graph theory, listing exactly which pairs of nodes are connected; a permissions system's access-control list, pairing users with the specific resources they can access; a family tree's parent-child links, each one an ordered pair connecting a specific parent to a specific child.

### SE Lens

The alternative to defining a relation as an explicit set of pairs is to keep the connection information scattered — a paragraph here, a note there, never assembled into one checkable object. The real cost of that alternative is exactly Lesson 7's original duplication cost, transplanted to relationships: without one authoritative set of pairs, two different people (or two different parts of a system) checking "does Cid work in HR" might consult different, inconsistently maintained sources and get different answers. Defining `WorksIn` once, as an explicit set, costs nothing beyond listing the true pairs; it means there is exactly one place any future question about who works where gets answered from.

---

## Concept Unit 3: Representing a Relation

### The Problem

`WorksIn`, written as a set of ordered pairs, is precise — but a set of pairs isn't always the easiest way for a person to take in a relation at a glance. The same relation can be shown in more than one form, and it's worth confirming, directly, that these different forms genuinely describe the exact same underlying set of connections, not merely similar-looking pictures of it.

### No isolated lab for this step

This concept has no code of its own to isolate — comparing three representations of the same relation is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Three Views of WorksIn

**As a set of pairs, exactly as defined in Concept Unit 2:**

> `WorksIn = {(Ana, Sales), (Ben, IT), (Cid, IT), (Cid, HR)}`

**As a table, with a mark showing which employee-department pairs are related:**

| | Sales | IT | HR |
|---|---|---|---|
| Ana | ✓ | | |
| Ben | | ✓ | |
| Cid | | ✓ | ✓ |

**As an arrow diagram, in prose, since this lesson works entirely in text:** an arrow from `Ana` to `Sales`; an arrow from `Ben` to `IT`; two arrows from `Cid`, one to `IT` and one to `HR` — with no arrow at all connecting `Ana` to `IT` or `HR`, `Ben` to `Sales` or `HR`, or `Cid` to `Sales`.

**Confirming all three describe the identical relation:** the table's four checkmarks correspond exactly to the set's four pairs; the described arrows correspond exactly to the same four pairs. No representation includes a connection the others lack, and none omits one the others include.

### Walkthrough

- **The set-of-pairs form, reappearing from Concept Unit 2** — established as the precise, foundational representation every other form must agree with.
- **The table form, with exactly four checkmarks** — a second representation, checked directly against the set form to confirm the same four pairs are represented.
- **The arrow-diagram description, with exactly four arrows** — a third representation, likewise checked against the same four pairs.
- **The explicit cross-check across all three** — not a new concept, but confirmation that different-looking representations can describe the exact same underlying object, exactly the way Lesson 11's truth table and Lesson 12's prose description of a conditional both described the same evaluation rule.

### CS Lens

This is the recognition that the same underlying mathematical object can be displayed in multiple different, equally valid forms, chosen for whichever is clearest in a given context. Also recognized in: a graph, displayable as an adjacency list, an adjacency matrix, or a visual node-and-edge diagram, all describing the same connections; a function, displayable as a formula, a table of input-output pairs, or a graph plotted on axes; a database relationship, displayable as an entity-relationship diagram or as the actual foreign-key table underneath it; a musical chord, displayable as sheet music notation, a chord diagram for guitar, or a list of note names.

### SE Lens

The alternative to confirming multiple representations actually agree is to assume, without checking, that a diagram or a table "obviously" matches its underlying precise definition. The real cost of that alternative is exactly the same risk Lesson 11 already flagged for truth tables versus prose: a diagram drawn from memory, or a table filled in by hand, can silently drift from the actual set of pairs it's meant to represent, especially as a relation grows larger than four pairs. Explicitly cross-checking every representation against the precise set-of-pairs form, as this unit did, costs one verification pass; it is the only way to be sure a more convenient-looking representation hasn't quietly introduced an error.

---

## Concept Unit 4: Relations Defined by a Predicate

### The Problem

`WorksIn` was defined by listing its four true pairs directly, because there was no simpler rule connecting an employee to a department — the connection was just a fact about the world, looked up rather than computed. Many relations, though, are defined by exactly the kind of rule Lesson 13's predicates already handle — a relationship that holds or doesn't based on a condition involving both items, not by an arbitrary list that has to be memorized.

### No isolated lab for this step

This concept has no code of its own to isolate — defining a relation from a predicate is demonstrated directly below, combining Lesson 13's predicate with Lesson 15's set-builder notation, not through a new construct with its own syntax.

### Applying It — the "At Most" Relation

**A predicate over two numbers, exactly as Lesson 13 taught, but now taking two parameters instead of one:**

> `is_at_most(a, b) = a ≤ b`

**The relation, defined using set-builder notation, over the small domain `{1, 2, 3}`:**

> `LE = {(a, b) ∈ {1, 2, 3} × {1, 2, 3} : is_at_most(a, b)}`

**Working out the actual members, by checking the predicate against every pair in the Cartesian product `{1, 2, 3} × {1, 2, 3}` — nine pairs in total:** `(1,1)`: `1 ≤ 1` is `true` — included. `(1,2)`: `true` — included. `(1,3)`: `true` — included. `(2,1)`: `2 ≤ 1` is `false` — excluded. `(2,2)`: `true` — included. `(2,3)`: `true` — included. `(3,1)` and `(3,2)`: `false` — excluded. `(3,3)`: `true` — included.

**The resulting relation:**

> `LE = {(1,1), (1,2), (1,3), (2,2), (2,3), (3,3)}`

### Walkthrough

- **`is_at_most(a, b) = a ≤ b`** — a reappearance of *predicate* (Lesson 13), extended here to two parameters rather than one.
- **`LE = {(a, b) ∈ {1,2,3} × {1,2,3} : is_at_most(a, b)}`** — a reappearance of set-builder notation (Lesson 15), applied here to a Cartesian product (Lesson 16) rather than to a single set, defining a relation from a predicate rather than by listing pairs directly.
- **Checking all nine pairs of the Cartesian product** — a reappearance of the exhaustive checking already established for quantifiers (Lesson 14), applied here to determine a relation's exact membership.
- **`LE = {(1,1), (1,2), (1,3), (2,2), (2,3), (3,3)}`** — the resulting relation, derived from the predicate rather than asserted directly, exactly the way Lesson 15's `{91, 100}` was derived from `is_high_score`.

### CS Lens

This is the same distinction Lesson 15, Concept Unit 5, already drew for ordinary sets — listing members by hand versus defining them by a condition — now applied to relations specifically. Also recognized in: a database view defined by a `JOIN ... ON` condition rather than by a manually maintained table of matched rows; a recommendation system's "users who liked similar items" relation, computed from a similarity rule rather than listed by hand; a scheduling system's "can be assigned to" relation between workers and shifts, computed from availability rules; a genealogy database's "is an ancestor of" relation, computed from parent-child links rather than listed exhaustively for every possible pair.

### SE Lens

The alternative to defining `LE` by its predicate is to list its six pairs directly, as `WorksIn` was listed. The real cost of that alternative, specifically for a relation like "at most," is that it doesn't scale: for a domain of three numbers, listing six pairs by hand is manageable; for a domain of a hundred numbers, the same relation would have thousands of pairs, none of which need to be listed if the underlying rule, `a ≤ b`, is stated once instead. Defining a relation by predicate, as this unit does, costs nothing beyond having a genuine rule to state; it buys a relation whose membership can be checked, or generated, for a domain of any size, without ever writing out its pairs by hand.

---

## Concept Unit 5: Properties a Relation Might Have — Reflexive, Symmetric, Transitive

### The Problem

`LE` (at most) and `WorksIn` (employment) feel like fundamentally different kinds of relations, beyond just having different domains — `LE` connects every number to itself (`1 ≤ 1`), while nothing in `WorksIn` connects an employee to themselves at all (that wouldn't even make sense, given its domains). Naming exactly what distinguishes different kinds of relations, precisely rather than by feeling, is the job of a handful of properties a relation may or may not have.

### No isolated lab for this step

This concept has no code of its own to isolate — checking three relations against three properties is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Comparing Three Relations on {1, 2, 3}

**Three relations on the same small domain, for direct comparison:**

> `LE = {(1,1), (1,2), (1,3), (2,2), (2,3), (3,3)}` (at most, `≤`, from Concept Unit 4)
> `EQ = {(1,1), (2,2), (3,3)}` (equals, `=`)
> `LT = {(1,2), (1,3), (2,3)}` (strictly less than, `<`)

**Checking reflexivity — does every item relate to itself?** `LE`: `(1,1)`, `(2,2)`, `(3,3)` are all present — reflexive. `EQ`: the same three pairs are present — reflexive. `LT`: `(1,1)` is absent (`1 < 1` is `false`) — not reflexive, and one missing pair is enough to settle this, exactly the way Lesson 14's universal claims could be disproven by a single failure.

**Checking symmetry — whenever `a R b`, does `b R a` also hold?** `LE`: `(1,2) ∈ LE`, but `(2,1) ∉ LE` — not symmetric, disproven by this one pair. `EQ`: every pair present has matching partners already identical (`(1,1)`'s reverse is itself); checking the only non-identical-looking case that could threaten this, there are none, since `EQ` contains no pair with different first and second items — symmetric. `LT`: `(1,2) ∈ LT`, but `(2,1) ∉ LT` — not symmetric.

**Checking transitivity — whenever `a R b` and `b R c`, does `a R c` also hold?** `LE`: checking `(1,2)` and `(2,3)` — both present; is `(1,3)` present? Yes. Checking every other chaining pair the same way confirms none fail — transitive. `EQ`: the only chains possible involve identical items throughout, and every such chain trivially holds — transitive. `LT`: checking `(1,2)` and `(2,3)` — both present; is `(1,3)` present? Yes — transitive.

**The results, assembled into one table:**

| Relation | Reflexive? | Symmetric? | Transitive? |
|---|---|---|---|
| `LE` (`≤`) | yes | no | yes |
| `EQ` (`=`) | yes | yes | yes |
| `LT` (`<`) | no | no | yes |

### Walkthrough

- **`LE`, `EQ`, and `LT`, all defined on the same domain `{1, 2, 3}`** — chosen deliberately so the three properties can be checked and compared side by side, on a domain small enough to check exhaustively.
- **Checking reflexivity for all three, with `LT` failing on a single missing pair** — first appearance of *reflexive*, checked concretely, with the failing case demonstrated directly rather than merely asserted.
- **Checking symmetry, with `LE` and `LT` both failing and `EQ` holding** — first appearance of *symmetric*, likewise checked concretely.
- **Checking transitivity, with all three holding** — first appearance of *transitive*, confirmed by checking actual chains of related pairs, not merely assumed.
- **The three-row comparison table** — assembles every result, making the structural differences between these three relations precise rather than left as an intuitive feeling.

### CS Lens

This is the practice of characterizing a relation by a small set of general, checkable properties, rather than only by its specific list of pairs — exactly the same move from specific instance to general classification this curriculum has made repeatedly, since Lesson 1's move from "these 40 quizzes" to "any finite sequence." Also recognized in: a sorting algorithm's correctness depending on its comparison relation being transitive, without which "sorted order" wouldn't even be well defined; a social network distinguishing symmetric relationships (mutual friendship) from asymmetric ones (following); a database's foreign-key relationships, generally neither reflexive nor symmetric, unlike an equality-based join; a scheduling system checking whether a "must happen before" relation is transitive, to catch contradictory constraints before they cause a conflict.

### SE Lens

The alternative to checking these properties explicitly is to describe a relation only by its specific pairs, and reason about its behavior case by case, every time, without ever stepping back to classify its general shape. The real cost of that alternative shows up specifically once a relation like `LE` needs to be reasoned about in general — for instance, whether it can be used to reliably sort a collection at all, which depends specifically on transitivity holding, not merely on a handful of checked examples. Checking reflexivity, symmetry, and transitivity explicitly, as this unit did, costs the exhaustive-checking effort demonstrated above; it buys a general classification that predicts how the relation will behave on pairs never individually checked, setting up exactly what the next two lessons — equivalence and ordering — depend on.

---

## Closing

### Connect the pieces

Two relations, `WorksIn` and `LE`, traced through every unit built in this lesson, start to finish:

1. **The gap exposed (Unit 1):** `Employees × Departments` contains nine pairs; only four describe an actual working arrangement.
2. **A relation, defined as a subset (Unit 2):** `WorksIn = {(Ana, Sales), (Ben, IT), (Cid, IT), (Cid, HR)}`, a specific subset of that Cartesian product.
3. **Three equivalent representations (Unit 3):** the same four pairs, shown as a set, a table, and a described arrow diagram, cross-checked for agreement.
4. **A relation defined by a predicate (Unit 4):** `LE`, derived from `is_at_most(a, b) = a ≤ b`, checked against all nine pairs of `{1,2,3} × {1,2,3}`.
5. **Properties compared across three relations (Unit 5):** `LE`, `EQ`, and `LT`, checked for reflexivity, symmetry, and transitivity, assembled into one comparison table.

Unit 5's `LE` is the exact relation derived in Unit 4 — nothing in the second half of this lesson introduced a fresh, unrelated relation without connecting it back to work already shown.

### What breaks without this

Suppose a company's internal system tracked "who works where" only as scattered notes across several documents, never assembled into one precise relation the way Concept Unit 2 assembled `WorksIn`. One document, maintained by HR, lists Cid as working in HR; a separate document, maintained by IT, lists Cid as working in IT; neither document was ever checked against the other, because there was never one authoritative set of pairs both could be compared to. When a security audit asks "does every employee with system access actually work in IT," the answer depends entirely on which document happens to get consulted — HR's list would say Cid doesn't belong on an IT-only access list, while IT's own list would say Cid clearly does. This is not a disagreement about facts; both documents are individually accurate, in isolation — it is a disagreement caused entirely by never having one relation, checkable and consistent, that both documents were meant to be reflecting. Restoring Concept Unit 2's approach — one explicit relation, `WorksIn`, as the single source every document and every check is derived from — removes this failure by removing the possibility of two inconsistent partial views existing in the first place.

### Exercises

1. **Observe.** Choose two sets of your own (people and hobbies, books and authors, cities and countries) and list the actual connections between them as a relation, the way Concept Unit 2 defined `WorksIn`.
2. **Formalize.** Write your Exercise 1 relation using full membership notation (`(a, b) ∈ R`) for one true connection and one false one, the way Concept Unit 2 checked `(Ana, Sales) ∈ WorksIn` and `(Ana, IT) ∈ WorksIn`.
3. **Explain.** Represent your Exercise 1 relation as a table, the way Concept Unit 3 represented `WorksIn`, and confirm by checking every cell that it matches your original set of pairs exactly.
4. **Formalize.** Choose a numeric or comparative relation (divisibility, "is older than," "costs more than") and define it using a predicate and set-builder notation over a small domain of your choosing, the way Concept Unit 4 defined `LE` over `{1, 2, 3}`.
5. **Formalize.** Check your Exercise 4 relation for reflexivity, symmetry, and transitivity, the way Concept Unit 5 checked `LE`, `EQ`, and `LT`. For each property that fails, show the specific pair (or pairs) that disproves it.

### Definition of done

- [ ] You can define a relation as a subset of a Cartesian product, and explain the difference between a relation and the full Cartesian product it's drawn from.
- [ ] You can represent the same relation in at least two different forms and confirm, explicitly, that they agree.
- [ ] You can define a relation from a two-parameter predicate using set-builder notation, and derive its actual membership by checking the predicate against a Cartesian product.
- [ ] You can check a relation for reflexivity, symmetry, and transitivity, and for each property that fails, produce a specific pair that disproves it.
- [ ] You completed Exercises 1–5 using your own sets and relations, not `WorksIn` or `LE`.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating which of the three properties (reflexive, symmetric, transitive) your Exercise 4 relation surprised you by having or lacking.
