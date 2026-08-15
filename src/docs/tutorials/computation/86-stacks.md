# Lesson 86: Stacks

**What you will build**: By the end of this lesson you'll be able to derive a stack directly from a deliberate restriction on Lesson 85's node-and-reference structure — touch only the front — and use it to solve a genuine problem, checking whether a sequence of parentheses is balanced, that the restriction itself makes natural to solve.

**What you need to know first**: Lesson 85's node-and-reference structure, and `cons`/`first`/`rest`, already fully covered.

**Terms introduced in this lesson**:

- **stack** — a collection restricted to one access pattern: add and remove only from the same end, called the *top*. *Why it matters*: this single restriction, applied to a structure this series already has, is what makes an entire class of real problems — this lesson's parenthesis-checking among them — solvable with a simple, disciplined recursion.
- **LIFO** (Last-In-First-Out) — the ordering a stack enforces: the most recently added element is always the first one removed. *Why it matters*: the precise, formal name for the discipline "only touch the top" produces.

**Objects and methods used**: None new. This lesson combines `cons`, `first`, `rest`, and `empty?`, each already covered.

---

## Concept Unit: Deriving a Stack from a Restriction

### The Problem

Lesson 85 showed `cons` attaches one new node at the front in `O(1)`, and `first`/`rest` read and remove that same front node in `O(1)`. What happens if a collection is used through *only* these three operations — always at the front, never anywhere else?

### Introduce the concept in isolation

```clojure
(defn stack-push [stack value] (cons value stack))
(defn stack-pop [stack] (rest stack))
(defn stack-peek [stack] (first stack))
```

```
user=> (def s (stack-push (stack-push (list) 1) 2))
user=> s
(2 1)
user=> (stack-peek s)
2
user=> (stack-pop s)
(1)
```

`1` was pushed first, then `2` — and `2`, the *most recently* added value, is exactly what `stack-peek` returns and what `stack-pop` removes. This ordering is **LIFO**: whichever value arrived last is always the first one to leave. Nothing new was built — `stack-push`, `stack-pop`, and `stack-peek` are direct, named wrappers around `cons`, `rest`, and `first` — but naming this specific *discipline* (top-only access) is what turns "a list" into a **stack**.

### Discard the throwaway example

Not applicable — `stack-push`, `stack-pop`, and `stack-peek` are real, reusable functions.

### Project Change

- **Reference Source**: Directly built from Lesson 85's `cons`/`first`/`rest` node operations, restricted to top-only access.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn stack-push [stack value] (cons value stack))
(defn stack-pop [stack] (rest stack))
(defn stack-peek [stack] (first stack))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`stack-push`** — reappearing `cons` (Lesson 83/85), unchanged, simply given a name that communicates its restricted *role*, not a new operation.
- **`stack-pop`, `stack-peek`** — reappearing `rest` and `first`, identically renamed — the entire "stack" abstraction is a naming and discipline choice layered on top of operations this series has trusted since Lesson 24.

### CS Lens

Choosing a list (Lesson 85's node structure) as a stack's underlying representation is not arbitrary — Lesson 83 and Lesson 85 already established that front-only operations are exactly what lists make cheap (`O(1)`); a stack's own access pattern (top-only) is a perfect match for that cost profile, precisely the kind of representation-to-operation matching Lesson 83 first argued for.

### SE Lens

Restricting *how* a structure can be used, even when nothing about the underlying data changes, is a genuinely valuable engineering discipline: code that only ever calls `stack-push`/`stack-pop`/`stack-peek`, never reaching into the middle of the structure directly, is easier to reason about precisely because LIFO ordering is guaranteed by the interface itself, not merely by convention.

---

## Concept Unit: An Application — Checking Balanced Parentheses

### The Problem

Given a sequence of open and close parentheses, determine whether every open one is eventually matched by a close one, in the correct nested order. Does a stack's LIFO discipline fit this problem naturally?

### Introduce the concept in isolation

```clojure
(defn balanced? [tokens stack]
  (if (empty? tokens)
    (empty? stack)
    (if (= (first tokens) 'open)
      (balanced? (rest tokens) (stack-push stack 'open))
      (if (empty? stack)
        false
        (balanced? (rest tokens) (stack-pop stack))))))
```

```
user=> (balanced? (list 'open 'open 'close 'close) (list))
true
user=> (balanced? (list 'close 'open) (list))
false
user=> (balanced? (list 'open 'close 'close) (list))
false
user=> (balanced? (list 'open 'open 'close) (list))
false
```

Every `'open` token gets **pushed**; every `'close` token **pops** the most recently pushed, still-unmatched `'open` — exactly LIFO's own guarantee: the most recent open paren is the first one a close paren should match. If a `'close` arrives with nothing left on the stack (an unmatched close), or tokens run out while the stack still holds unmatched opens, the sequence is unbalanced.

### Discard the throwaway example

Not applicable — `balanced?` is a real, complete, correct solution to a genuine problem.

### Mechanical walkthrough — how it works in isolation

- **`'open`, `'close`** — reappearing quoted symbols (Lesson 41), used as token labels exactly as Lesson 80's weather states were.
- **`(stack-push stack 'open)`** — every open token adds one entry, recording "this open paren is still waiting for its match."
- **`(if (empty? stack) false (balanced? (rest tokens) (stack-pop stack)))`** — a close token with no matching open on the stack is an immediate, direct failure; otherwise, it removes the *most recent* unmatched open, LIFO's defining behavior applied directly to the problem.
- **`(if (empty? tokens) (empty? stack) ...)`** — the base case: the sequence is balanced only if every pushed open has *also* been popped by the time the tokens run out — a stack left non-empty means some opens were never matched.

### Hand Trace

Trace `(balanced? (list 'open 'open 'close) (list))`, the third failing example above, to see exactly where it fails:

```
tokens=(open open close), stack=()
  first=open -> push -> stack=(open), tokens=(open close)
  first=open -> push -> stack=(open open), tokens=(close)
  first=close, stack not empty -> pop -> stack=(open), tokens=()
tokens empty -> return (empty? stack) = (empty? (open)) = false
```

The stack still holds one unmatched `open` when the tokens run out — exactly the reported `false`, and exactly why: one open paren was never closed.

### CS Lens

This is the canonical use of a stack in real parsing and compilers: matching nested, ordered structure — parentheses, brackets, function calls, HTML tags — is precisely a LIFO problem, since the innermost, most-recently-opened structure must always be the first one closed.

### SE Lens

`balanced?`'s correctness rests entirely on the stack's LIFO guarantee holding — if `stack-pop` somehow removed an arbitrary element instead of specifically the most recent one, this exact algorithm would silently produce wrong answers on nested (not just sequential) parentheses; the discipline named in the previous unit is not incidental, it's load-bearing for this unit's correctness.

### Connection to the previous unit

The previous unit named and restricted an already-known operation set into a stack; this unit shows that restriction wasn't just tidy naming — it's exactly the structure a genuine, real problem needs, solved here with a direct, natural recursion.

---

## Connect the Pieces

The complete stack, both its raw operations and its real application:

```clojure
(println "Push/peek/pop:" (stack-push (list) 1) (stack-peek (stack-push (list) 1)) (stack-pop (stack-push (stack-push (list) 1) 2)))
(println "Balanced ((())):" (balanced? (list 'open 'open 'open 'close 'close 'close) (list)))
(println "Unbalanced (()) ):" (balanced? (list 'open 'open 'close 'close 'close) (list)))
```

```
Push/peek/pop: (1) 1 (2)
Balanced ((())): true
Unbalanced (()) ): false
```

`balanced?` never inspects the stack's structure directly — it only ever calls `stack-push`, `stack-pop`, and (implicitly, via emptiness checks) relies on LIFO ordering, exactly the disciplined interface the previous unit built, now doing genuine, useful work.

## What Breaks Without This

Suppose parenthesis-matching were attempted without a stack — say, by only counting the total number of opens and closes, checking they're equal. `(list 'close 'open)` has one of each, passing a count-based check, yet is genuinely unbalanced (the close comes before any open exists to match). A count alone discards *order* entirely — exactly the information LIFO ordering exists to preserve. This isn't a hypothetical bug; it's precisely the difference between `balanced?`'s correct `false` on this input (demonstrated above) and what a naive counting approach would wrongly accept.

## Exercises

1. **Trace.** By hand, trace `(balanced? (list 'close 'open) (list))` completely, confirming it returns `false` immediately, before any push occurs.
2. **Predict.** Before checking, predict the result of `(balanced? (list) (list))` — an empty sequence with no tokens at all. Justify using the base case directly.
3. **Verify.** Trace `(balanced? (list 'open 'open 'close 'close) (list))` completely by hand, confirming every intermediate stack state matches what LIFO ordering predicts.
4. **Break it, on purpose.** Modify `balanced?` so it uses `stack-peek` instead of checking `(empty? stack)` before popping on a close token. Find a specific input where this modified version crashes or misbehaves, and explain why.
5. **Generalize.** Extend `balanced?` to handle *two* kinds of brackets, `'open-paren`/`'close-paren` and `'open-bracket`/`'close-bracket`, correctly rejecting a sequence like `'open-paren 'open-bracket 'close-paren 'close-bracket` (mismatched nesting) as unbalanced.
6. **Reconstruct.** Close this lesson. From memory, define a stack's LIFO discipline, and re-derive `balanced?`'s logic for both the open-token and close-token cases.

## Definition of Done

- [ ] You can implement `stack-push`, `stack-pop`, and `stack-peek` from `cons`/`first`/`rest`, and explain LIFO ordering.
- [ ] You can trace `balanced?` completely on both a balanced and an unbalanced sequence.
- [ ] You completed Exercise 4 and identified a specific input where the modified version fails.
- [ ] You completed Exercise 5, correctly handling two bracket kinds with proper nesting rules.
- [ ] Commit your Exercise 4 and Exercise 5 work to your notes repository, with a commit message stating what you found and built — for example, `"Find balanced? crash case with unguarded peek; extend to two bracket kinds with correct nesting rejection"` — not just `"lesson 86 exercise"`.

---

**Next lesson:** Lesson 87, *Queues*, derives the opposite discipline — first in, first out — from the identical node-and-reference structure, and confronts a genuinely new cost problem this section hasn't faced yet: the end you need is the one this structure makes expensive to reach.
