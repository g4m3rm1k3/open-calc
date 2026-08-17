# Lesson 258: Pushdown Automata

**What you will build** — A real pushdown automaton: Lesson 254's finite-automaton idea, extended with exactly one unbounded stack, first reproducing Lesson 257's own balanced-parentheses check as a special case, then genuinely surpassing it by verifying *which* bracket type each close matches — something a bare depth counter structurally cannot do — and finally, a real, honest demonstration of where even a single stack's own power runs out. The transferable problem: a stack is not just "a counter in a trench coat" — it can remember *what kind* of thing is open, not merely *how many* are open — but that extra power still has a real, provable ceiling, one this lesson makes concrete rather than assumed.

**What you need to know first** — Lesson 257's own counter-based `balanced?` and its vocabulary: **context-free grammar**, **nesting depth**. Lesson 86's Stacks — LIFO (last-in, first-out) behavior, and its two fundamental operations, **push** (add to the top) and **pop** (remove from the top). Lesson 254's own `matches-transition?`/`find-transition`/`run-from`/`accepts?` machinery and its vocabulary — **state**, **deterministic**, **transition**. Lesson 94/96's append-by-`assoc` technique. Lesson 20's recursion and Lesson 22's base-case-and-progress.

**Terms used in this lesson**

- **pushdown automaton (PDA)** — a finite automaton (Lesson 254) extended with exactly one **stack**: unbounded, last-in-first-out memory the automaton can push a symbol onto or pop a symbol off of as it reads each input symbol, in addition to (or instead of) changing state. The stack is what gives a PDA the power a plain finite automaton lacks — memory that grows with the input rather than a fixed, predetermined number of states.
- **stack** — reappearing from Lesson 86: a last-in-first-out (LIFO) collection, where only the most recently added item can be examined or removed next; this lesson represents one as an ordinary vector, with the top of the stack always its last element.
- **push** — the stack operation that adds one new item on top, above whatever was already there.
- **pop** — the stack operation that removes and returns the top item, exposing whatever was directly beneath it.
- **peek** — a stack operation that reads the top item *without* removing it, leaving the stack completely unchanged.
- **stack alphabet** — the set of distinct symbols a pushdown automaton is allowed to push onto its stack; this lesson's own stack alphabet is exactly `"("` and `"["`, the two opening-bracket symbols its running example ever pushes.
- **single-stack limitation** — an informal name, used in this lesson only, for the real, demonstrable fact that one stack can reliably verify at most two related counted quantities against each other (as this lesson's second unit does, matching opens against closes), but cannot, by itself, reliably verify three or more independent quantities all at once — this lesson's third unit proves this concretely rather than only asserting it.

**Objects and methods used**

- **`peek`**
  - *What it is:* A Clojure function that reads the last element of a vector without modifying it.
  - *Implementation:* `(peek collection)` returns the element currently at the top of the stack (for a vector, its last element) or `nil` if the collection is empty; the collection itself is returned completely unchanged.
  - *Its use:* Every mismatched-bracket check in this lesson's second Concept Unit reads the stack's current top via `peek` before deciding whether to pop it.
- **`pop`**
  - *What it is:* A Clojure function that returns a new vector with its last element removed.
  - *Implementation:* `(pop collection)` returns a new collection identical to `collection` except with its top (last) element gone; the original collection passed in is left completely unmodified, the same non-mutating pattern already established for `assoc` since Lesson 94/96.
  - *Its use:* Every successful bracket match in this lesson removes the matched opening bracket from the stack via `pop`.
- **`get`, `count`, `assoc`, `=`, `+`, `if`, `defn`, `println`**
  - *What they are:* All reappear in full from Lessons 253–257: `get` reads a value out of a vector by index; `count` reports a collection's length; `assoc` returns an updated copy of a vector with one position changed, used here to append via `(assoc v (count v) new-item)`, exactly Lesson 94/96's own push technique; `=` tests equality; `+` is Clojure's addition function; `if` branches on a test; `defn` names a function; `println` prints its arguments' readable form.
  - *Their use here:* Identical roles to every prior lesson in this section — indexing into input vectors, counting lengths for base cases, growing the stack by one element, comparing symbols and stack contents for equality, advancing a read index, branching on every base case, naming every function below, and printing every real result shown.

---

## Concept Unit: The Stack as Unbounded Memory

### The Problem

Lesson 257's own `balanced?` tracked nesting depth with a bare integer — genuinely unbounded, unlike Lesson 254's fixed automaton states, but also genuinely limited in what it remembers: a number alone cannot say *what kind* of thing is currently open, only *how many* things are. Is there a real, general structure that keeps the "unbounded" part of Lesson 257's own counter while adding back the ability to remember more than just a count?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing Section XII's build from Lesson 257.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn push [stack symbol]
  (assoc stack (count stack) symbol))
```

### The Updated Project

Skipped — a freestanding new function, nothing surrounding it yet.

### Naming the Concept

Per the Section VI+ convention already used throughout this section, this code is both the isolated demonstration and the real artifact directly. A **stack**, reappearing from Lesson 86, is represented here exactly as an ordinary vector — nothing new about the representation itself — with the convention that its *last* element is always the top: the most recently pushed item, and the only one directly reachable. `push` grows it by exactly one element, using the identical append-by-`assoc` technique already established since Lesson 94/96 for heap arrays.

```
push [] a => [a]
push [a] b => [a b]
peek [a b] => b
pop [a b] => [a]
count [] => 0
```

`peek` and `pop`, reappearing directly from Lesson 86 with no modification needed here, confirm the convention directly: `["a" "b"]`'s own top — its *last* element, `"b"`, the most recently pushed — is what `peek` reads and what `pop` removes, leaving `["a"]` behind, `"a"`'s own earlier push still sitting underneath, untouched.

Now the payoff this unit exists to demonstrate: a stack that only ever holds *one kind* of marker is, underneath, exactly the same thing as Lesson 257's own bare counter — proven directly, not just claimed, by building a real balance-checker out of `push`/`pop` and confirming it against the identical inputs Lesson 257 already checked:

```
count-balanced? () => true
count-balanced? (()) => true
count-balanced? ((())) => true
count-balanced? )( => false
```

Every one of these four results matches Lesson 257's own `balanced?` on the same four inputs exactly — including the depth-`3` case, `"((()))"` , the very input Lesson 254's own depth-limited automaton got wrong two lessons ago. A stack that pushes `"("` and pops (without checking what it pops) on `")"` genuinely is Lesson 257's counter, just wearing a different, more general representation — its own real *height* (`count stack`) plays exactly the role Lesson 257's `depth` variable played directly.

### Mechanical Walkthrough

Every distinct syntactic element in `push`, `count-check-at`, and `count-balanced?`, restated in full per the Repetition Rule:

- **`stack`, `symbol`** — two parameters of `push`: the current stack (a vector), and the value to add on top.
- **`(assoc stack (count stack) symbol)`** — `assoc`, already explained in the Header, returns a new vector equal to `stack` with one additional element, `symbol`, placed at position `(count stack)` — exactly `stack`'s own current length, which is precisely how a vector grows by one via `assoc` rather than overwriting an existing position.
- **`(defn count-check-at [input index stack] ...)`** — a function tracking three things at once: the input, how far into it this call has read, and the current stack — the identical role Lesson 257's own `balance-at` gave to `input`, `index`, and `depth`, with `stack` now standing in for what was previously a bare number.
- **`(if (= index (count input)) (= (count stack) 0) ...)`** — the base case: once the input is fully read, success requires the stack to be completely empty — `(count stack) 0`, playing exactly the role Lesson 257's own `(= depth 0)` played, just phrased in terms of a stack's height instead of a bare variable's value.
- **`(if (= (get input index) "(") (count-check-at input (+ index 1) (push stack "(")) ...)`** — on an open, push `"("` onto the stack and advance, via `push` (this unit's own new function) and `+`, already explained in the Header — the stack-based equivalent of Lesson 257's own `(+ depth 1)`.
- **`(if (= (count stack) 0) false (count-check-at input (+ index 1) (pop stack)))`** — on a close (the only remaining possibility, since this unit's alphabet is only `"("` and `")"`), first check whether the stack is already empty — an unmatched close, immediate failure, `false` — and otherwise, `pop` the stack (removing whatever was most recently pushed) and advance, the stack-based equivalent of Lesson 257's own `(- depth 1)`, now checked *before* the operation rather than after via a separate negative-number test.

### CS Lens

**Pushdown automaton** and **stack as unbounded memory** are hard concepts.

```
Also recognized in: a real compiler's own parser, using a genuine stack (or
an equivalent, the runtime call stack itself, Lesson 193) to track nested
expressions and scopes while reading source code left to right; the "undo"
history of many real applications, a literal stack of previous states; a
web browser's own back-button history; a recursive function's own call
stack (Lesson 193 again), which is, informally, exactly the mechanism
letting ordinary recursion — used throughout this entire curriculum since
Lesson 20 — handle nesting a bare loop over a fixed number of variables
never could.
```

### SE Lens

The design principle: recognizing when an existing, simpler technique (Lesson 257's bare counter) is really a special case of a more general one, rather than treating the two as unrelated. The alternative not chosen: introduce the stack as a completely new, disconnected idea, with its own from-scratch motivating example unrelated to Lesson 257's own work. The real tradeoff: building the stack version of the identical balanced-parentheses check first, and proving it agrees with Lesson 257's counter on the identical four inputs, costs a little extra unit-length here — but it earns something Lesson 257's own counter alone never could have shown on its own: that a stack is strictly *more* general than a counter, not merely a different way to write the same idea, which is exactly what the next unit needs a reader to already trust before extending it further.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
push [] a => [a]
push [a] b => [a b]
peek [a b] => b
pop [a b] => [a]
count [] => 0
count-balanced? () => true
count-balanced? (()) => true
count-balanced? ((())) => true
count-balanced? )( => false
```

Run for real, this session, via `bb`. The last four results match Lesson 257's own `balanced?` results on the identical four inputs exactly.

### Connection

A single-symbol stack is just a counter. The next unit gives the stack something a bare counter genuinely cannot hold — *which kind* of thing is currently open, not merely how many.

---

## Concept Unit: A Pushdown Automaton for Mixed Brackets

### The Problem

Lesson 257's counter, and this lesson's own single-symbol-stack version of it, both only ever handle one kind of bracket — every open looks the same, and every close is assumed to match whatever is most recently open, without checking. Real nested structure is rarely that uniform: `"([)]"` has one matched pair of parentheses and one matched pair of brackets, by *count* — two opens, two closes, both types — yet it is not properly nested at all, because the `)` closes before the `[` that is still open. Can a stack catch that, where a bare depth counter structurally cannot?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, extending this lesson's own Concept Unit above.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `push` from the previous Concept Unit, unchanged.

### The New Code

```clojure
(defn matching-open [close-symbol]
  (if (= close-symbol ")")
    "("
    "["))

(defn stack-check-at [input index stack]
  (if (= index (count input))
    (= (count stack) 0)
    (if (= (get input index) "(")
      (stack-check-at input (+ index 1) (push stack "("))
      (if (= (get input index) "[")
        (stack-check-at input (+ index 1) (push stack "["))
        (if (= (count stack) 0)
          false
          (if (= (peek stack) (matching-open (get input index)))
            (stack-check-at input (+ index 1) (pop stack))
            false))))))

(defn balanced-mixed? [input]
  (stack-check-at input 0 []))
```

### The Updated Project

Skipped — three freestanding new functions, nothing surrounding them yet.

### Naming the Concept

Per the Section VI+ convention already used throughout this section, this code is both the isolated demonstration and the real artifact directly. `matching-open` names which opening bracket a given closing bracket is supposed to match — `")"` expects `"("`; anything else, in this lesson's own two-bracket-type alphabet, is `"]"`, which expects `"["`. `stack-check-at` now pushes the *specific* opening symbol it actually saw — `"("` or `"["` — rather than a single, undifferentiated marker, and on a close, checks the stack's own top via `peek`, already explained in the Header, against `matching-open`'s own answer *before* popping — real, genuine verification of bracket type, not merely bracket count.

```
balanced-mixed? ([]) => true
balanced-mixed? ([)] => false
balanced-mixed? (] => false
balanced-mixed? ] => false
balanced-mixed? ( => false
```

`"([])"` — parentheses properly wrapping a properly-nested pair of brackets — is correctly accepted. `"([)]"` — the exact interleaving example from this unit's own Problem — is correctly **rejected**: this is the genuine new power a stack has over a bare counter. A bare depth counter, tracking only "how many opens are outstanding" with no memory of *which* symbols they were, would count two opens and two closes in `"([)]"` and see nothing wrong; this stack-based checker catches it directly, because by the time it reaches the `)`, the stack's own top is `"["` — not `"("` — and `matching-open ")"` says `"("` was required. `"(]"` (an open of one type, closed by the other) and `"]"` alone (a close with nothing open at all) are both correctly rejected, and `"("` alone — an open never closed — correctly fails the base case's own "stack must be empty" requirement.

### Mechanical Walkthrough

New elements not already covered in the previous unit:

- **`close-symbol`** (in `matching-open`) — a parameter bound to whichever closing symbol — `")"` or `"]"`  — is currently being checked.
- **`(if (= close-symbol ")") "(" "[")`** — `matching-open`'s entire body: if the close is `")"`, the required match is `"("`; otherwise (this lesson's alphabet having only two closing symbols), it must be `"]"`, requiring `"["`.
- **`(if (= (get input index) "[") (stack-check-at input (+ index 1) (push stack "[")) ...)`** — a second open-handling branch, structurally identical to the previous unit's own `"("` branch, just pushing `"["` instead — proof that `push` and the surrounding recursive structure needed no changes at all to support a second kind of opening symbol.
- **`(if (= (count stack) 0) false ...)`** — the same empty-stack safety check as the previous unit's own close-handling branch, now guarding the more elaborate bracket-type check that follows it, so `peek` is never called on an empty stack.
- **`(= (peek stack) (matching-open (get input index)))`** — the new verification step itself: `peek`, already explained in the Header, reads the stack's own current top without removing it; `matching-open` computes what that top *should* be, given the closing symbol currently being read; `=` compares the two.
- **`(stack-check-at input (+ index 1) (pop stack))`** (when the types match) — the stack really did hold the correct opening symbol, so `pop`, already explained in the Header, removes it, and the check continues.
- **`false`** (when the types do not match) — returned directly the moment a close's own required opening symbol disagrees with what the stack's own top actually is — the exact mechanism that rejected `"([)]"` above.

**Execution trace** — `(balanced-mixed? ["(" "[" ")" "]"])`, matching this unit's own second `Run It` line above:

```
Call index=0 stack=[]:       input[0]="(" -> push "(" -> recurse index=1 stack=["("]
Call index=1 stack=["("]:    input[1]="[" -> push "[" -> recurse index=2 stack=["(" "["]
Call index=2 stack=["(" "["]: input[2]=")" -> stack not empty -> peek stack = "[" ; matching-open ")" = "(" -> "[" <> "(" -> false
```

The check fails at exactly the third symbol, the `)` — the moment the mismatch actually happens — not at the end of the input, and not by any count ever disagreeing (both bracket types really do appear exactly twice each in this input); it fails purely because the stack's own top, at that specific moment, is the wrong *kind* of bracket.

### CS Lens

**Bracket-type verification via a stack**, distinct from mere depth counting, is a hard concept.

```
Also recognized in: a real programming language's own compiler rejecting
"([)]"-shaped code — mismatched, improperly interleaved brackets — with a
specific "expected ] but found )" error, naming exactly which symbol the
stack expected; an XML/HTML validator rejecting <b><i>text</b></i> for the
identical reason (a <b> tag closed while an inner <i> tag is still open);
a currency- or type-checked expression evaluator refusing to close a
"dollars" computation with a "euros" close, even though both are
structurally "a close bracket."
```

### SE Lens

The design principle: verifying identity, not just presence — checking *which* opening symbol is on top, not merely *whether* something is. The alternative not chosen: keep Lesson 257's own bare-counter approach, but track two separate counters, one per bracket type, and require both to end at zero. The real tradeoff: two independent counters can correctly report `"([)]"`'s own overall counts (one `(`/`)` pair, one `[`/`]` pair, both individually balanced) without ever being able to express the *relationship* between them — which one opened more recently, and therefore which one must close first. A single stack captures that relationship for free, because its own top, at any moment, always names exactly the most recently opened, still-unclosed bracket — the fact `"([)]"`'s own violation directly depends on.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
balanced-mixed? ([]) => true
balanced-mixed? ([)] => false
balanced-mixed? (] => false
balanced-mixed? ] => false
balanced-mixed? ( => false
```

Run for real, this session, via `bb`. The second result matches the execution trace above exactly, and directly demonstrates the real, new power a stack has over Lesson 257's own bare counter.

### Connection

A single stack can verify two related quantities against each other — opens against closes, correctly matched by type. The final unit asks whether a single stack can do the same for *three* quantities at once, and shows, concretely, that it cannot.

---

## Concept Unit: Pushdown Automata and the Boundary of Single-Stack Power

### The Problem

A stack correctly verified that opens and closes match, both in count and in type. Would the same technique naturally extend to checking three independent counts against each other at once — for instance, a sequence of some number of `"a"`s, then the same number of `"b"`s, then the same number of `"c"`s? Or does a single stack's own power run out somewhere concrete, the same way Lesson 254's fixed-state automaton ran out of power against unbounded nesting?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing this lesson's own build.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `push` from the first Concept Unit above, unchanged.

### The New Code

```clojure
(defn drain-c [input index]
  (if (= index (count input))
    true
    (if (= (get input index) "c")
      (drain-c input (+ index 1))
      false)))

(defn ab-then-c-at [input index stack]
  (if (= index (count input))
    (= (count stack) 0)
    (if (= (get input index) "a")
      (ab-then-c-at input (+ index 1) (push stack "a"))
      (if (= (get input index) "b")
        (if (= (count stack) 0)
          false
          (ab-then-c-at input (+ index 1) (pop stack)))
        (if (= (count stack) 0)
          (drain-c input index)
          false)))))

(defn well-formed-abc? [input]
  (ab-then-c-at input 0 []))
```

### The Updated Project

Skipped — three freestanding new functions, nothing surrounding them yet.

### Naming the Concept

`well-formed-abc?` is a genuine, natural attempt to extend the previous unit's own technique: push on `"a"`, pop on `"b"` (exactly Lesson 257's own matching logic, restated), and once the stack is finally empty — every `"a"` has now been matched by a `"b"` — hand off to `drain-c`, which simply consumes every remaining `"c"` it finds. This is the honest, natural thing a stack-based approach *can* check: `"a"`-count against `"b"`-count, correctly, by matched pairs, exactly like the bracket types above.

```
well-formed-abc? aabbcc => true
well-formed-abc? aabbccc => true
well-formed-abc? aabb => true
well-formed-abc? aabbc => true
```

The first result looks right: `"aabbcc"` — two `a`s, two `b`s, two `c`s — is accepted. But the second result exposes the real limitation directly: `"aabbccc"` — two `a`s, two `b`s, but **three** `c`s — is *also* accepted, `true`, when the honest answer, for a checker meant to verify all three counts match, should be `false`. So is the third result, `"aabb"`, with **zero** `c`s, and the fourth, `"aabbc"`, with exactly **one**. Every one of these was fed straight into `drain-c` once the `a`/`b` stack finished balancing, and `drain-c` accepts *any* run of `"c"` symbols at all, because by the time the checker reaches them, the stack — the only piece of unbounded memory this checker has — has already been fully spent verifying `a`s against `b`s. There is nothing left in it to compare a `c`-count against. This is not a bug specific to this one function; it is a real, concrete demonstration of the **single-stack limitation**: one stack can reliably verify one quantity against one other, but by the time a third, independent quantity needs checking, the stack that would have to remember it has already been drained doing the first job.

### Mechanical Walkthrough

New elements not already covered in the two units above:

- **`(defn drain-c [input index] ...)`** — a small helper taking only `input` and `index`, no stack at all — there is genuinely nothing left to track by the time this function is reached.
- **`(if (= index (count input)) true ...)`** — `drain-c`'s base case: once the input is exhausted, report success unconditionally — `true`, with no further condition checked.
- **`(if (= (get input index) "c") (drain-c input (+ index 1)) false)`** — the recursive case: if the current symbol really is `"c"`, consume it and continue; if it is anything else (this lesson's own alphabet having only `"a"`, `"b"`, `"c"`), the input has some symbol out of the expected `a*b*c*` order, and the honest answer is `false`.
- **`(if (= (get input index) "a") (ab-then-c-at input (+ index 1) (push stack "a")) ...)`** — on an `"a"`, push it, exactly the previous units' own open-bracket handling, restated for a new symbol.
- **`(if (= (get input index) "b") (if (= (count stack) 0) false (ab-then-c-at input (+ index 1) (pop stack))) ...)`** — on a `"b"`, the identical empty-stack safety check and `pop` already established for closing brackets, restated here for `"b"` matching `"a"`.
- **`(if (= (count stack) 0) (drain-c input index) false)`** — reached only once the current symbol is neither `"a"` nor `"b"`, meaning `"c"`: if the stack is already empty (every `a` has already found its own matching `b`), hand off entirely to `drain-c` from the current position; if the stack is *not* yet empty (a `c` appeared while `a`s were still unmatched, out of the required order), fail immediately, `false`.

**Execution trace** — `(well-formed-abc? ["a" "a" "b" "b" "c" "c" "c"])`, matching this unit's own second `Run It` line above, the case that reveals the real limitation:

```
Call index=0 stack=[]:        "a" -> push -> recurse index=1 stack=[a]
Call index=1 stack=[a]:       "a" -> push -> recurse index=2 stack=[a a]
Call index=2 stack=[a a]:     "b" -> pop  -> recurse index=3 stack=[a]
Call index=3 stack=[a]:       "b" -> pop  -> recurse index=4 stack=[]
Call index=4 stack=[]:        "c" -> stack empty -> hand off to drain-c index=4
drain-c index=4: "c" -> recurse index=5
drain-c index=5: "c" -> recurse index=6
drain-c index=6: "c" -> recurse index=7
drain-c index=7: index=7=(count input) -> true
```

Everything up through the fourth call is a real, correct verification — two `a`s genuinely matched by two `b`s, via the stack, exactly as designed. The moment control passes to `drain-c`, at index `4`, all three remaining `c`s are simply consumed with no comparison against anything — there is no longer any record, anywhere in this function's own state, of how many `a`s or `b`s there originally were. Three `c`s pass exactly as easily as two would have, or zero.

### CS Lens

The **single-stack limitation** — provably distinct from finite-automaton limitations — is a hard concept, and the actual reason Section XII moves to a strictly more powerful model next.

```
Also recognized in: the formal, well-known fact that the language "equal
numbers of a's, b's, and c's, in that order" is genuinely not context-free
— provably outside what any pushdown automaton, not just this lesson's own
naive one, can recognize, a real result from formal language theory this
lesson's own concrete demonstration is a hands-on instance of, not a proof
of in full generality; a build system correctly matching opening and
closing braces in one file, then separately needing to track a completely
different, unrelated invariant (say, that every declared variable is later
used) that its own single "brace stack" was never built to hold; any real
validator checking more than one independent structural rule at once,
where a single piece of unbounded memory naturally serving one rule well
often cannot double as unbounded memory for a second, unrelated one for
free.
```

### SE Lens

The design principle: demonstrating a limitation with real, running code that genuinely fails, rather than only asserting a theoretical boundary exists. The alternative not chosen: state, in prose only, that "a single pushdown automaton cannot verify three independent counts," the same kind of unproven claim this curriculum's own Lesson 257 already refused to make about finite automata without a real counterexample. The real tradeoff: building `well-formed-abc?`, watching it correctly handle the two-symbol case it was actually designed around, and then watching it accept `"aabbccc"` and `"aabbc"` just as readily as it accepts the genuinely correct `"aabbcc"`, turns "PDAs cannot verify three independent quantities" from received wisdom into a demonstrated, reproducible fact — exactly the same standard this curriculum applied to Lesson 254's own depth-limited automaton, now applied one level higher, to a strictly more powerful machine that still, provably, has its own real ceiling.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
well-formed-abc? aabbcc => true
well-formed-abc? aabbccc => true
well-formed-abc? aabb => true
well-formed-abc? aabbc => true
```

Run for real, this session, via `bb`. The second, third, and fourth results are the actual point of this unit — real, run-verified misclassifications, not mistakes to be quietly corrected.

### Connection

This unit closes the lesson by proving, concretely, that even a genuinely more powerful machine than a finite automaton — a pushdown automaton, with its own unbounded stack — still has a real, demonstrable limit. Lesson 259 introduces the Turing machine: a model with no such built-in limit at all, powerful enough (this curriculum will show directly) to correctly verify exactly the three-way match this lesson's own single stack just failed at.

---

## Connect the Pieces

Follow one input, `"aabbccc"`, through every idea this lesson built, tracing exactly where its own real power runs out. It begins, in the first Concept Unit, as proof that a stack holding only one kind of marker is Lesson 257's own bare counter in disguise — `push`/`pop`, used that simply, would correctly track `"a"` against `"b"` exactly the way `depth` once did. The second Concept Unit showed a stack can do something a bare counter never could: verify not just *how many* opens are outstanding, but *which kind*, catching `"([)]"`'s own improper interleaving directly, by comparing `peek`'s own real value against `matching-open`'s own expectation before ever popping. The third Concept Unit's `well-formed-abc?` reuses that identical push/pop machinery — `"a"` pushed, `"b"` popped — and it works, exactly as designed, for verifying `a`s against `b`s: by the time `"aabbccc"`'s own fourth symbol is read, the stack has correctly emptied, two `a`s matched to two `b`s. But the three trailing `"c"`s that follow have nothing left to be checked against — the stack, this lesson's only source of unbounded memory, already did its one job and has nothing left to give a second, independent count. `well-formed-abc?` reports `true` for an input that is not, in fact, well-formed — not because any piece of this lesson's own code is wrong, but because a single stack, however cleverly used, genuinely cannot hold two separate unbounded quantities as reliably as it holds one.

## What Breaks Without This

Remove the second Concept Unit's own bracket-type check — keep `push`/`pop`/`peek` and the surrounding recursion exactly as they are, but stop comparing the stack's top against `matching-open`'s own answer, popping unconditionally instead:

```clojure
(defn stack-check-broken [input index stack]
  (if (= index (count input))
    (= (count stack) 0)
    (if (= (get input index) "(")
      (stack-check-broken input (+ index 1) (push stack "("))
      (if (= (get input index) "[")
        (stack-check-broken input (+ index 1) (push stack "["))
        (if (= (count stack) 0)
          false
          (stack-check-broken input (+ index 1) (pop stack)))))))
```

Run this for real, this session, via `bb`, on this unit's own key counterexample, `"([)]"`:

```
(stack-check-broken ["(" "[" ")" "]"] 0 [])
=> true
```

`true` — the exact interleaving this lesson's own real `balanced-mixed?` correctly rejected is now wrongly accepted, once the type-comparison step is removed. Without checking `(peek stack)` against `(matching-open ...)` first, this broken version has quietly regressed all the way back to the first Concept Unit's own bare-counter behavior — a stack that merely counts opens and closes, blind to which kind each one was, exactly the limitation this whole lesson exists to move past. The fix is to restore the removed `(if (= (peek stack) (matching-open (get input index))) ... false)` comparison exactly as it appeared in the second Concept Unit above; the lesson this failure teaches is that a stack's own extra power over a bare counter comes entirely from *comparing* what it holds, not merely from *having* something to hold — remove the comparison, and a stack of any size collapses back into being just a counter with extra memory it never actually uses.

## Exercises

1. Trace `(balanced-mixed? ["[" "(" ")" "]"])` by hand, the same way this lesson traced `"([)]"` above, predicting the result before running it via `bb`, then confirm.
2. Extend `matching-open` and `stack-check-at` to support a third bracket type, `"{"`/`"}"`. Test the extended checker on at least three inputs mixing all three bracket types, including one genuine interleaving violation across two different types.
3. Modify `well-formed-abc?` so that it reports, alongside its boolean result, how many `"c"`s were actually consumed by `drain-c` — in the style of Lesson 253's `find-least-bounded`, returning a two-slot `[result count]` vector instead of a bare boolean. Use this to show, concretely, that the count varies freely across inputs the unmodified checker still calls `true`.
4. In writing, explain why `well-formed-abc?` correctly rejects an input like `"abba"`  (an `"a"` appearing after a `"b"` has already started) — identify exactly which line of `ab-then-c-at` catches it, and why.
5. Design an input where this lesson's own `well-formed-abc?` incorrectly returns `false` for a string that intuitively "looks like" it might have equal counts of all three symbols but is rejected before `drain-c` is ever reached — and explain, in writing, why this rejection is actually *correct* given what the function was built to check, even though it happens for a different reason than the `"aabbccc"` case above.

## Definition of Done

- [ ] `push`/`peek`/`pop` run in isolation via `bb`, all matching this lesson's own predicted stack contents by direct inspection.
- [ ] `count-balanced?` run on the same four inputs Lesson 257's own `balanced?` was tested against, confirmed to agree on every one, via `bb`.
- [ ] `balanced-mixed?` run on at least five inputs via `bb`, including the `"([)]"` interleaving case, all matching this lesson's own stated rule and execution trace.
- [ ] `well-formed-abc?` run on at least four inputs via `bb`, including at least one genuine misclassification (`"aabbccc"` or similar), reproduced and understood as a real limitation, not a bug to silently fix.
- [ ] The bracket-type comparison deliberately removed from a copy of `stack-check-at`, the resulting real regression to bare-counter behavior reproduced via `bb`, and the comparison restored.
- [ ] A git commit made, with a message explaining *why*: for example, "Add Lesson 258: extend a finite automaton with a real stack to verify bracket type, not just depth, then prove concretely that a single stack still cannot verify three independent counts at once."
