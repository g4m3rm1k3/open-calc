# Lesson 85: Linked Structures

**What you will build**: By the end of this lesson you'll be able to build a linked list completely from scratch — nodes and references, nothing else — revealing the actual mechanism that has been underneath every `first`, `rest`, and `cons` this entire series has used since Lesson 24, and derive from that mechanism exactly why lists' costs (Lesson 83) are what they are.

**What you need to know first**: Lesson 84's contiguous memory, Lesson 83's cost profiles, and Lesson 30's accessor-function pattern for recursive data.

**Terms introduced in this lesson**:

- **node** — a single unit of a linked structure, holding one value and a **reference** to the next node (or a marker for "no next node"). *Why it matters*: this is the actual, physical structure underlying every list this series has built — made explicit, for the first time, in this lesson.
- **reference** — a link connecting one node directly to another, rather than the two being stored contiguously (Lesson 84). *Why it matters*: this is the structural opposite of an array — nodes can live anywhere at all, connected only by these links, which is exactly what makes some operations cheap and others expensive.

**Objects and methods used**: None new. This lesson combines vector literals and `get` (Lesson 84), `nil`, and `nil?`, each already covered.

---

## Concept Unit: Building a Node from Scratch

### The Problem

Lesson 24's lists have been used constantly, but always through `first`, `rest`, and `cons` — never by looking at what a list is actually *made of*. What is really underneath those three functions?

### Introduce the concept in isolation

```clojure
(defn make-node [value next]
  [value next])

(defn node-value [node] (get node 0))
(defn node-next [node] (get node 1))
```

```
user=> (def my-list (make-node 10 (make-node 20 (make-node 30 nil))))
user=> my-list
[10 [20 [30 nil]]]
user=> (node-value my-list)
10
user=> (node-value (node-next my-list))
20
```

A **node** is nothing more than two things held together: a value, and a **reference** to the next node — here, a two-element vector (Lesson 84), with `nil` marking "no next node," the end of the structure. `my-list` is three nodes, each one's `next` pointing directly at the node after it — precisely the shape every list this series has used has actually had, informally, the whole time.

### Discard the throwaway example

Not applicable — `make-node`, `node-value`, and `node-next` are real, reusable functions.

### Project Change

- **Reference Source**: `node-value`/`node-next` reuse Lesson 30's accessor-function pattern directly, applied to a genuinely new kind of recursive structure.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn make-node [value next]
  [value next])

(defn node-value [node] (get node 0))
(defn node-next [node] (get node 1))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[value next]`** — reappearing vector literal (Lesson 84), used here purely as a two-slot container, not for its indexed-access properties — any two-slot structure would do; the vector is simply a convenient one already in this series' vocabulary.
- **`(make-node 10 (make-node 20 (make-node 30 nil)))`** — built from the inside out: the innermost node (`30`) references `nil`; the next node out (`20`) references *that* node; the outermost node (`10`) references *that* one — a chain of references, each node knowing only about the single node directly after it.

### CS Lens

`node-value` and `node-next` are exactly `first` and `rest`, under different names — Clojure's actual, real list implementation is built from precisely this node-and-reference shape (traditionally called a "cons cell" in every Lisp dialect, including Clojure's own ancestry); this lesson hasn't invented a new structure, it's made an already-present one visible for the first time.

### SE Lens

Naming the mechanism explicitly — nodes, references — is what makes the cost claims from Lesson 83 *derivable* rather than merely asserted: once "a list is a chain of nodes, each referencing the next" is stated plainly, `cons`'s `O(1)` cost and `value-at`'s `O(n)` cost both follow directly from that one structural fact, the subject of this lesson's second unit.

---

## Concept Unit: Deriving Lists' Costs from Their Actual Structure

### The Problem

Lesson 83 stated `cons` is `O(1)` and `value-at` is `O(n)`, as observed facts. Now that the actual node-and-reference mechanism is visible, can those costs be *derived* from it directly, the way Lesson 84 derived array access from contiguous memory?

### Introduce the concept in isolation

```clojure
(defn node-cons [value node]
  (make-node value node))

(defn node-length [node]
  (if (nil? node)
    0
    (+ 1 (node-length (node-next node)))))
```

```
user=> (node-cons 5 my-list)
[5 [10 [20 [30 nil]]]]
user=> (node-length my-list)
3
```

`node-cons` builds exactly *one* new node, whose `next` reference points at the existing structure unchanged — no existing node is touched, copied, or modified at all, which is precisely why this costs a fixed, constant amount of work no matter how long the existing chain already is: `O(1)`, derived directly from "a new node just needs one reference to attach itself," not merely observed as a fact. `node-length`, by contrast, must follow the `next` reference one node at a time until reaching `nil` — there is no way to know how many nodes remain without actually visiting each one in turn, since nodes are connected only by these one-at-a-time references, never stored contiguously (Lesson 84's own structural opposite): `O(n)`, derived from the same node-and-reference shape.

### Discard the throwaway example

Not applicable — `node-cons` and `node-length` are real functions, and this derivation is a genuine structural fact.

### Mechanical walkthrough — how it works in isolation

- **`(make-node value node)`** — `node-cons`'s entire body: one new node, one reference to the rest — no traversal of `node` at all, the structural reason this costs `O(1)`.
- **`(if (nil? node) 0 (+ 1 (node-length (node-next node))))`** — reappearing counting-recursion shape (Lesson 20), forced to recurse once per node because the *only* way to reach a later node is through the reference held by the node directly before it.

### CS Lens

This is the precise structural mirror of Lesson 84's derivation: contiguous memory makes position computable directly (cheap access, expensive insertion elsewhere); node-and-reference structure makes attaching a new node trivial (cheap insertion) but makes reaching any node other than the first require following references one at a time (expensive access) — two representations, two structurally-derived, opposite cost profiles.

### SE Lens

Understanding *why* `cons` is cheap — not merely that it is — is what lets a real design decision generalize correctly: any operation that only needs to attach one new reference, on any linked structure, will share this same `O(1)` cost, while any operation needing to reach a specific position by following references will share `value-at`'s `O(n)` cost, a predictable pattern rather than a fact to look up per structure.

### Connection to the previous unit

The previous unit made the node-and-reference mechanism visible for the first time; this unit shows that mechanism alone — nothing else — is sufficient to derive every cost claim Lesson 83 made about lists, exactly paralleling Lesson 84's derivation for arrays.

---

## Connect the Pieces

Both derivations, side by side, confirming the structural mirror:

```clojure
(println "Node structure:" my-list)
(println "node-cons, O(1) -- one new reference:" (node-cons 5 my-list))
(println "node-length, O(n) -- must follow every reference:" (node-length my-list))
```

```
Node structure: [10 [20 [30 nil]]]
node-cons, O(1) -- one new reference: [5 [10 [20 [30 nil]]]]
node-length, O(n) -- must follow every reference: 3
```

Lesson 83's list costs and Lesson 84's array costs are no longer two separate observed facts to remember — both now follow directly, and oppositely, from each representation's own physical structure: contiguous positions versus chained references.

## What Breaks Without This

Suppose someone needed to find "the node three steps before the end" of a long linked structure, and expected it to be cheap, reasoning loosely that "lists are fast" the way Lesson 84 showed arrays are fast for access. Without the reference mechanism made explicit in this lesson, there'd be no way to see *why* that expectation is wrong: reaching any node other than the first genuinely requires following references from the start, one at a time — there is no shortcut, no address arithmetic, because nothing about this structure is contiguous. The node-and-reference mechanism this lesson exposed is exactly what makes that limitation predictable in advance, rather than a surprise discovered only after writing slow code.

## Exercises

1. **Trace.** By hand, draw (on paper, boxes-and-arrows style) the three nodes making up `my-list`, showing each node's value and its reference to the next.
2. **Predict.** Before checking, predict whether `node-length` on a `100`-node chain takes roughly `20` times longer than on a `5`-node chain, or some very different ratio. Justify using this lesson's derivation.
3. **Verify.** Write `node-last`, returning the final node's value, and confirm — from its own recursive structure — that it is `O(n)`, not `O(1)`.
4. **Break it, on purpose.** Attempt to write a function that inserts a new node *two steps into* an existing chain (not at the front) in genuinely constant time. Explain, using the reference mechanism, exactly which part of this operation cannot avoid being `O(n)`.
5. **Generalize.** Write `node-sum`, adding every value in a node chain, using the identical recursive shape as `node-length`.
6. **Reconstruct.** Close this lesson. From memory, explain what a node and a reference are, and derive, from that structure alone, why `cons` is `O(1)` and position-based access is `O(n)`.

## Definition of Done

- [ ] You can build a node-and-reference structure from scratch and explain what each part represents.
- [ ] You can derive, not merely state, why `cons`-style insertion is `O(1)` on this structure.
- [ ] You completed Exercise 3 and correctly classified `node-last`'s cost.
- [ ] You completed Exercise 5 and wrote a correct `node-sum`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you built — for example, `"Implement node-last (O(n)) and node-sum; confirm both follow the same reference-chasing structure"` — not just `"lesson 85 exercise"`.

---

**Next lesson:** Lesson 86, *Stacks*, takes this lesson's node-and-reference structure and restricts it to a single, disciplined access pattern — LIFO — deriving real applications directly from that one restriction.
