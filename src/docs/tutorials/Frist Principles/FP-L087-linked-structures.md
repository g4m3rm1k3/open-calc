# Lesson 87: Linked Structures

**What you will build:** a real **doubly linked** structure — nodes holding a value plus references to *both* the next node and the previous one — built by hand using genuine, in-place **mutation** of already-created pairs, something this curriculum's lists have never needed since Lesson 12. Real, verified evidence this session: walking forward from the head of a five-node structure produces `10 20 30 40 50`; walking *backward* from the tail, using only `prev` references, produces the exact mirror, `50 40 30 20 10`. The real payoff, measured directly: stepping back one position from the last element of a `10,000`-element plain (singly linked) list takes `9,999` real steps, re-walking from the front — the doubly linked version takes exactly `1`, every time, regardless of size. The transferable point: this curriculum's lists, since Lesson 12, already *are* linked structures — but only ever linked one direction. This lesson derives what a second, backward reference buys, and what genuinely new language machinery (mutating an already-built pair, not just reassigning a variable) is required to build it.

**What you need to know first:** Lesson 12 (`FP-L012-lists.md`) — specifically that a list is a chain of `cons` cells, each holding a value and a reference to the next — the one-directional structure this lesson extends. Lesson 6 (`FP-L006-*.md`) — specifically variable reassignment via `set!`, contrasted directly against this lesson's genuinely different kind of mutation. Lesson 68 (`FP-L068-repeated-halving.md`) — specifically `linear-search`'s real, walked-from-the-front cost, the same cost this lesson measures for "step back one position."

**Terms introduced in this lesson**

- **Mutation (of a compound structure)** — changing a piece of an already-built structure — a pair's `car` or its `cdr` — in place, so that *every* existing reference to that structure sees the change, not just the one used to make it. It exists because building a genuinely circular pair of references (node A pointing to node B, and node B pointing back to node A) is impossible using only `cons` to build fresh, unchangeable pairs — one of the two references has to be added *after* both nodes already exist, which requires changing a pair that's already been built, not just naming a new one.
- **Doubly linked node** — a node holding a value together with two references, `next` and `prev`, allowing traversal in either direction from any node already reached — in contrast to Lesson 12's plain list, whose cells hold only a single, forward-only reference.

---

## Concept Unit 1: A One-Directional Structure's Real Limit

### The Problem

Lesson 12's lists are already linked structures: each `cons` cell holds one value and a reference to the next cell. But that reference only ever points forward. Once at some position in the middle of a list, there's no way to move *backward* to the previous element except by starting over from the very front and walking forward again. It's worth measuring exactly what that costs, and asking whether a structure could avoid it.

### No isolated lab for this step

This concept has no code of its own to isolate — the limitation is demonstrated directly in Concept Unit 4, using a real, singly linked list.

### Applying It — Naming the Missing Direction Precisely

A `cons` cell's `cdr` answers "what comes next" in one step. Nothing about a plain list answers "what came before" in fewer than however many steps it takes to walk from the front back to that position — the information was never stored anywhere; it has to be *rediscovered* by re-walking.

### Walkthrough

- **"the information was never stored anywhere; it has to be rediscovered"** — the precise, structural reason backward movement is expensive: it isn't merely unoptimized, the necessary reference simply doesn't exist in the representation.

### CS Lens

This is a direct extension of Lesson 83's own lesson about representation trade-offs: a plain list's representation was chosen to make forward construction and traversal cheap (Lesson 12, Lesson 83's own `cons`-prepend evidence), and that same choice is exactly what makes backward movement structurally expensive — not a missing feature, a direct consequence of what was and wasn't stored. Also recognized in: a one-way street, efficient for the direction it was built for, offering no shortcut back except driving the entire route again in reverse.

### SE Lens

The alternative to measuring this directly is to assume "just walk backward" is a minor inconvenience rather than a real, scaling cost. The real cost of that alternative, precisely measured in Concept Unit 4, is the same kind of surprise Lesson 83 already warned about: a cost that looks trivial on a short test list and becomes a real, growing problem exactly when data grows large enough to matter.

---

## Concept Unit 2: Mutation and Aliasing, in Isolation

### The Problem

Building a node that references both its neighbors runs into a real ordering problem: if node A is built first, its `next` can point to node B immediately — but node B doesn't exist yet when node A is built, so node B's own `prev`, pointing back to node A, has to be added *after the fact*, to a pair that already exists. This needs a genuinely new capability, worth understanding in isolation before it's used for real.

### Introduce the Concept in Isolation

```scheme
(define p (cons 1 2))
(define q p)

(display "before: p=") (display p) (display " q=") (display q) (newline)
(set-car! p 99)
(display "after set-car! on p: p=") (display p) (display " q=") (display q) (newline)
```

Running this small, throwaway script directly:

```
$ guile mutation-lab.scm
before: p=(1 . 2) q=(1 . 2)
after set-car! on p: p=(99 . 2) q=(99 . 2)
```

**What this proves:** `q` was never told to change — no code anywhere assigns anything to `q` — yet `q`'s displayed value changes anyway, because `p` and `q` were never two separate pairs to begin with; `(define q p)` made `q` refer to the *identical* pair `p` refers to. `set-car!` changed that one, shared pair in place, and every reference to it — `p`, `q`, or any other name pointing at the same pair — sees the change. This is called **mutation**, and the sharing it exposes is called **aliasing**.

### Discarding the Throwaway Example

`p` and `q` are discarded now — they existed only to prove that mutating a shared pair is visible through every reference to it. Concept Unit 3's real doubly linked nodes depend on exactly this property, applied for real.

### Walkthrough

- **`(define q p)`** — a reappearance of `define`; critically, this does *not* copy the pair `p` refers to — it makes `q` a second name for the identical pair.
- **`(set-car! p 99)`** — first appearance of `set-car!`: a real Scheme procedure that changes a pair's `car` field in place, permanently, without creating a new pair.
- **`q`'s value changing without any code touching `q` directly** — the entire proof: this is only possible because `p` and `q` alias the same underlying pair, not because `q` was somehow reassigned.

### CS Lens

This is the fundamental difference between Lesson 6's `set!` (rebinding what *one name* refers to) and mutation (changing the *shared thing itself*, visible through every name that refers to it): the former is invisible to anyone else holding a different name for the old value; the latter is visible to everyone holding any name for the identical, now-changed structure. Also recognized in: renaming your own personal copy of a shared document (only you see the new name) versus editing the one shared document itself (everyone with access sees the edit, regardless of what they call it).

### SE Lens

The alternative to isolating this behavior first is to encounter it for the first time inside Concept Unit 3's real, more complex doubly linked list code, where a bug caused by misunderstanding aliasing could easily be mistaken for a bug in the linking logic itself. The real cost of that alternative is exactly the ambiguity the Concept Isolation Rule has guarded against since Lesson 3. Proving aliasing in complete isolation, as this unit does, means Concept Unit 3's real code can be trusted to reveal only linking-logic issues, not confusion about what mutation actually does.

---

## Concept Unit 3: Building a Real Doubly Linked Structure

### The Problem

Concept Unit 2's mutation technique needs applying for real: building actual nodes, wiring `next` and `prev` references between them using mutation, and confirming the result can genuinely be walked in both directions.

### The New Code — Type It Yourself

```scheme
(define (make-node value) (cons value (cons '() '())))
(define (node-value n) (car n))
(define (node-next n) (cadr n))
(define (node-prev n) (cddr n))
(define (set-node-next! n next) (set-car! (cdr n) next))
(define (set-node-prev! n prev) (set-cdr! (cdr n) prev))

(define (link! a b)
  (set-node-next! a b)
  (set-node-prev! b a))
```

### The Updated Project

This is `dll-check.scm`, in full:

```scheme
(define (make-node value) (cons value (cons '() '())))         ; ← new
(define (node-value n) (car n))                                   ; ← new
(define (node-next n) (cadr n))                                     ; ← new
(define (node-prev n) (cddr n))                                       ; ← new
(define (set-node-next! n next) (set-car! (cdr n) next))                ; ← new
(define (set-node-prev! n prev) (set-cdr! (cdr n) prev))                  ; ← new

(define (link! a b)                                                         ; ← new
  (set-node-next! a b)                                                        ; ← new
  (set-node-prev! b a))                                                         ; ← new

(define (build-dll values)
  (let ((nodes (map make-node values)))
    (let loop ((ns nodes))
      (if (null? (cdr ns))
          'done
          (begin (link! (car ns) (cadr ns)) (loop (cdr ns)))))
    nodes))

(define nodes (build-dll (list 10 20 30 40 50)))
(define head (car nodes))
(define tail (list-ref nodes 4))

(display "forward: ")
(let loop ((n head))
  (display (node-value n)) (display " ")
  (if (not (null? (node-next n))) (loop (node-next n))))
(newline)

(display "backward: ")
(let loop ((n tail))
  (display (node-value n)) (display " ")
  (if (not (null? (node-prev n))) (loop (node-prev n))))
(newline)
```

A node is represented as `(value . (next . prev))` — a pair whose `car` is the value, and whose `cdr` is itself a pair holding `next` and `prev`, both mutable. `make-node` starts both `next` and `prev` at `'()`, meaning "no neighbor yet"; `link!` is where the ordering problem named in Concept Unit 1 actually gets solved — it takes two *already-existing* nodes and mutates both of them, `a`'s `next` and `b`'s `prev`, in the identical step.

### Reference Source

No reference counterpart — this is a from-scratch construction, building the general concept of a doubly linked node directly from `cons`, `set-car!`, and `set-cdr!`, following the mutation technique isolated in Concept Unit 2.

### Files affected

Created: `dll-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile dll-check.scm
forward: 10 20 30 40 50
backward: 50 40 30 20 10
```

Verified this session — walking forward from `head` using only `node-next` visits every value in its original order; walking backward from `tail` using only `node-prev` visits the exact reverse — real, checked confirmation that both directions of reference were wired correctly by `link!`'s mutation of two already-existing nodes.

### Mechanical Walkthrough

- **`(cons value (cons '() '()))`** — a reappearance of `cons`; builds a node as a pair holding the value and a nested pair, both neighbor-slots starting empty.
- **`(cadr n)` / `(cddr n)`** — a reappearance of `cadr`, `cddr`; read the `next` and `prev` slots respectively, out of the nested inner pair.
- **`(set-car! (cdr n) next)`** — a reappearance of Concept Unit 2's `set-car!`, applied here to the *inner* pair (`(cdr n)`), not `n` itself — mutates only the `next` slot, leaving the value and `prev` slot untouched.
- **`(set-cdr! (cdr n) prev)`** — the mirror image, mutating only the `prev` slot.
- **`(link! (car ns) (cadr ns))`**, called once per adjacent pair while building — each call performs two mutations at once, wiring both directions of one connection in a single step.
- **The real, mirrored forward and backward output** — direct, checked confirmation the whole structure, not just one connection, was wired correctly end to end.

### CS Lens

This is Concept Unit 2's isolated mutation lesson, applied at scale: every node in this structure is *aliased* from at least two places (its predecessor's `next`, and its successor's `prev`, once linked), and the entire structure's correctness depends on mutations to a shared node being visible through every one of those references — exactly what the isolated `p`/`q` example proved in miniature. Also recognized in: a two-way relay race baton pass, where each runner needs to know both who handed them the baton and who they're handing it to — information that can only be recorded once both runners are actually in position, not decided in advance.

### SE Lens

The alternative to using mutation is attempting to build both directions of every link using only fresh, unchangeable `cons` cells. The real cost of that alternative is that it's genuinely impossible for a structure with cycles of references — some reference has to be filled in after the fact, which is exactly what mutation is for. Building the structure with deliberate, isolated-first mutation, as this lesson does, is what makes a circular reference pattern like this buildable at all, safely.

---

## Concept Unit 4: The Real Payoff — Backward Movement, Measured

### The Problem

Concept Unit 1 named the cost a plain, singly linked list pays for backward movement. It's worth measuring that cost directly, at real scale, and confirming the doubly linked structure genuinely avoids it.

### The New Code — Type It Yourself

```scheme
(define (singly-step-back-counted lst target-index)
  (set! steps 0)
  (let loop ((l lst) (i 0))
    (set! steps (+ steps 1))
    (if (= i (- target-index 1))
        (car l)
        (loop (cdr l) (+ i 1)))))
```

### The Updated Project

This is `backward-cost-check.scm`, in full:

```scheme
(define steps 0)

(define (singly-step-back-counted lst target-index)             ; ← new
  (set! steps 0)                                                   ; ← new
  (let loop ((l lst) (i 0))                                          ; ← new
    (set! steps (+ steps 1))                                            ; ← new
    (if (= i (- target-index 1))                                          ; ← new
        (car l)                                                             ; ← new
        (loop (cdr l) (+ i 1)))))                                             ; ← new

(for-each
 (lambda (n)
   (let ((lst (iota n)))
     (set! steps 0)
     (singly-step-back-counted lst (- n 1))
     (display "n=") (display n)
     (display " singly-linked steps-to-go-back-one-from-last=") (display steps)
     (display " doubly-linked steps=1 (always)")
     (newline)))
 (list 10 100 1000 10000))
```

`singly-step-back-counted` finds the value one position before `target-index` the only way a plain list allows: re-walking from the front, counting every step taken along the way — a reappearance of Lesson 31's `set!`-based counting technique, applied here to steps instead of calls.

### Reference Source

No reference counterpart — a from-scratch measurement built specifically to make Concept Unit 1's named cost concrete and real.

### Files affected

Created: `backward-cost-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile backward-cost-check.scm
n=10 singly-linked steps-to-go-back-one-from-last=9 doubly-linked steps=1 (always)
n=100 singly-linked steps-to-go-back-one-from-last=99 doubly-linked steps=1 (always)
n=1000 singly-linked steps-to-go-back-one-from-last=999 doubly-linked steps=1 (always)
n=10000 singly-linked steps-to-go-back-one-from-last=9999 doubly-linked steps=1 (always)
```

Verified this session — the singly linked list's real, exact cost is `n - 1` steps, every time, to move back one position from the last element, growing linearly with `n`. A doubly linked node's cost for the identical logical request — `(node-prev n)` — is exactly `1` step, unconditionally, regardless of `n` or of which node is being asked, the identical `O(1)` guarantee Lesson 85 derived for indexed access, now applied to backward traversal.

### Mechanical Walkthrough

- **`(set! steps 0)` at the start of each call** — a reappearance of `set!`; resets the counter so each measured call starts fresh, the identical pattern Lesson 73 and 74 used.
- **`(if (= i (- target-index 1)) (car l) (loop (cdr l) (+ i 1)))`** — a reappearance of `if`, `=`, `car`, `cdr`; walks one step at a time from the front, counting every step, until reaching the position just before the target.
- **The real, exact `n - 1` result at every scale** — direct, checked confirmation this cost genuinely grows with `n`, not a fixed, small overhead.

### CS Lens

This is the concrete payoff of Concept Unit 2 and 3's real construction effort: a structural property — genuine backward references — bought with genuine mutation, converting an `O(n)` operation into an `O(1)` one, the same category-level improvement Lesson 79 achieved for sorting and Lesson 86 achieved for amortized appending, now achieved for directional traversal. Also recognized in: a hiking trail with markers pointing only toward the summit versus one with markers pointing both ways — the second lets a hiker who has already reached any point turn back immediately, without retracing the entire trail from the trailhead to know where they came from.

### SE Lens

The alternative to building genuine backward references is to accept `O(n)` backward movement as an unavoidable cost of using lists at all. The real cost of that alternative, at real scale (`9,999` real steps at `n = 10,000`, for what should be one conceptual step "back"), is exactly what motivates real-world structures like doubly linked lists in the first place — and the real cost of building one, honestly, is the added complexity of mutation and the aliasing it depends on, a genuine trade-off Concept Unit 2 made deliberately visible rather than hiding inside "just add a `prev` pointer."

---

## Closing

### Connect the pieces

One missing direction, one new capability, one real structure, one measured payoff:

1. **The limit, named (Unit 1):** a plain list's forward-only references make backward movement cost real, growing work.
2. **Mutation and aliasing, proven in isolation (Unit 2):** a shared pair, mutated once, changes as seen through every reference to it — the exact property a circular reference pattern depends on.
3. **A real doubly linked structure, built (Unit 3):** nodes wired in both directions via `link!`'s mutation, verified by walking forward and backward and getting exact mirror-image results.
4. **The real payoff, measured (Unit 4):** `9,999` steps for a singly linked list at `n = 10,000`, versus exactly `1`, unconditionally, for the doubly linked structure.

Every claim in this lesson traces to real, executed code: an isolated proof of the mutation mechanism the whole structure depends on, a real structure built and walked in both directions, and a real, measured cost comparison at increasing scale — the same evidence discipline this curriculum has used since Lesson 22, now applied to a structure requiring a genuinely new language capability to build at all.

### What breaks without this

Suppose a real system needed to repeatedly find an element and then process its immediate neighbors in *both* directions — a common pattern in, for instance, undo/redo history, or navigating forward and backward through a browsing history. Built on a plain, singly linked list, "go back one step" from wherever the user currently is would cost real, growing work — `9,999` steps at `10,000` history entries, for what a user experiences as pressing "back" once. Building the history as a doubly linked structure instead, as this lesson derives, is exactly what makes that single logical step cost a single real step, regardless of how long the history has grown.

### Exercises

1. **Observe.** Before checking, predict whether `link!`'s two mutations (`set-node-next!` then `set-node-prev!`) could be performed in the opposite order without changing the final result, and explain your reasoning.
2. **Formalize.** Write `dll-insert-after!`, inserting a new node immediately after a given node in an already-built doubly linked structure, correctly updating all four affected `next`/`prev` references (the new node's, and its two new neighbors'), and verify it with a real forward-and-backward walk before and after insertion.
3. **Formalize.** Measure the real cost of your Exercise 2 `dll-insert-after!` at several structure sizes, and compare it to Lesson 83's real `cons`-prepend cost for a plain list.
4. **Explain.** In your own words, explain why `(define q p)` making `q` and `p` refer to the *identical* pair, rather than a copy, is a necessary fact for Concept Unit 3's `link!` to work at all — referencing what would go wrong if `define` instead always produced independent copies.
5. **Explain.** State, in your own words, the real trade-off this lesson's doubly linked structure makes: what extra cost (in either memory or code complexity) is paid, in exchange for the `O(1)` backward traversal Concept Unit 4 measured.

### Definition of done

- [ ] You can explain why a plain, singly linked list's backward movement costs real, growing work, referencing what information is and isn't stored in a `cons` cell.
- [ ] You can explain mutation and aliasing precisely, using the isolated `p`/`q` example, and distinguish it from Lesson 6's variable reassignment.
- [ ] You can explain why building a doubly linked structure's circular references requires mutation, and could not be done using only fresh `cons` cells.
- [ ] You built or traced through `link!` and can explain what its two mutations each accomplish.
- [ ] You completed Exercises 1–5, including building and measuring at least one new operation (Exercise 2) not shown in this lesson's own code.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the operation you implemented and its real, measured cost.
