# Lesson 164: Movement Without a Map — Random Walks

**What you will build.** A random walker moving through a small network of five servers, connected by real links, choosing a uniformly random neighbor to hop to at every step — no destination, no plan, just structure and chance. Four real procedures: `walk-step` and `walk-trajectory`, which move the walker one step and many steps; `steps-to-return`, which measures how long a single real walk takes to come back to where it started; and `average-return-time`, which measures that over many trials. The transferable problem: once movement is random, "how long until X happens" stops being a question with one fixed answer and becomes a question about an *average* — and this lesson derives and verifies a real, exact formula for one specific such average, connecting a walk's own long-run behavior directly back to the plain, structural fact of how connected each node is.

**What you need to know first.** Era V's early lessons (113–116) for representing a graph as adjacency lists — one of several representations compared there on real cost — and for a node's *degree*, the count of its own neighbors. Lesson 163 (Markov Chains) for the Markov property, `simulate-step`/`simulate-trajectory`'s own accumulator-recursion pattern (extended here to a graph-derived walk instead of a hand-specified matrix), and this curriculum's practice of checking a probabilistic claim against real, independent evidence. Lesson 159 (Monte Carlo Algorithms) and Lesson 162 (Sampling) for `random`, exact rational arithmetic, and running many real trials to check a claim by frequency.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body.
- **`let*`** — like `let`, but each binding can see the ones that came before it in the same block; ordinary `let`'s bindings can't reference each other at all. It exists for exactly the case this lesson needs it for: computing a node's neighbor list first, then computing something else (how many neighbors there are) that depends on that first result, in one local block.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. Scheme's loop construct, with no separate `for` or `while` keyword.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call. This lesson reuses it, unchanged, from Lesson 163's `simulate-trajectory`.
- **Count-terminated loop** — a named-let loop whose base case is "a fixed number of steps have happened," checked against a counter that counts down (or up) by a known amount each time, so the total number of iterations is decided in advance, before the loop even starts. Every loop in Lesson 163 was shaped this way.
- **Condition-terminated loop** — a named-let loop whose base case is "some condition about the *current state* has become true," with no fixed number of iterations decided in advance — the loop could, in principle, run for a long time, or briefly, depending entirely on what actually happens as it runs. This lesson's `steps-to-return` is shaped this way: it stops when the walker happens to land back on the start, whenever that happens to be, not after a predetermined number of hops.
- **`if`** — a two-branch conditional: evaluates its test, then evaluates exactly one of its remaining sub-expressions.
- **`lambda`** — builds an anonymous procedure: a procedure with no top-level name of its own, created right where it's needed. This lesson uses it for the tiny, one-off "record this node's visit" step inside `for-each`, which nothing else ever needs to call by name.
- **Quoted list literal** — a list written directly in source code, preceded by `'`, that Scheme treats as a literal value rather than a procedure call. `(1 2)`, unquoted, would be an attempt to call `1` as a procedure with argument `2` — an error, since `1` isn't callable; `'(1 2)`, quoted, is simply the two-element list containing `1` and `2`, built once, when the code is read, not computed by calling anything.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction, never a rounded decimal. This lesson's return-time predictions are computed as exact fractions before ever being converted to a decimal for reading.
- **Random walk** — a sequence of positions produced by starting somewhere and repeatedly moving to a random next position, chosen according to some rule that depends only on the current position. A random walk is a Markov chain, per Lesson 163's own definition, whose transition rule happens to come from a graph's structure rather than being specified by hand.
- **Degree** — the number of edges touching a given node; equivalently, the length of that node's own neighbor list. A node with degree `4` has four neighbors it could move to next; a node with degree `2` has only two.
- **Hitting time** — the number of steps a random walk actually takes, starting from some position, before it first reaches some target position. A random quantity: running the same walk twice from the same start can hit the same target after a different number of steps each time.
- **Return time** — a hitting time where the target is the walk's own starting position: how many steps before the walker comes back to where it began.
- **Long-run visit frequency** — the fraction of a very long walk's own steps that were spent at a particular node. This lesson shows, empirically, that this fraction settles down to a stable value for each node as the walk gets longer, and that this stable value is proportional to that node's own degree.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`walk-step`**
  - *What it is:* a procedure this lesson derives in Concept Unit 1 — takes the walker's current node and returns the next node, chosen uniformly at random among that node's own real neighbors.
  - *Implementation:* `(walk-step node)` → an exact integer, one of `node`'s own neighbors from `adjacency`.
  - *Its use:* the single unit of movement this whole lesson is built from — every other procedure below calls this, directly or indirectly.
- **`walk-trajectory`**
  - *What it is:* derived in Concept Unit 2 — takes a starting node and a number of steps, and returns the full sequence of nodes actually visited.
  - *Implementation:* `(walk-trajectory start n)` → a list of `n + 1` node indices, beginning with `start`.
  - *Its use:* produces one real, concrete path the walker could actually take, exactly the way Lesson 163's `simulate-trajectory` did for a hand-specified Markov chain.
- **`steps-to-return`**
  - *What it is:* derived in Concept Unit 2 — takes a starting node, walks from it until landing back on that same node, and returns how many steps that took.
  - *Implementation:* `(steps-to-return start)` → a positive exact integer, at least `1`.
  - *Its use:* measures one single, real instance of a **return time** — the raw material this lesson's later average is built from.
- **`average-return-time`**
  - *What it is:* derived in Concept Unit 3 — runs `steps-to-return` many independent times from the same start and reports the exact average.
  - *Implementation:* `(average-return-time start trials)` → an exact rational number, the mean of `trials` real return-time measurements.
  - *Its use:* the empirical side of this lesson's central claim — checked, for real, against an exact formula derived from nothing but the graph's own structure.

*Everything else in the file, not this lesson's subject but still explained:*

- **`vector`**
  - *What it is:* a constructor — builds a new vector from the arguments given to it.
  - *Implementation:* `(vector v0 v1 ... vn)` returns a fresh vector holding exactly those values, in that order.
  - *Its use:* builds `adjacency`, one slot per node, each slot holding that node's own neighbor list.
- **`vector-ref`**
  - *What it is:* an accessor — reads the value stored at a given index of a vector.
  - *Implementation:* `(vector-ref v i)` returns the value at index `i` (0-based).
  - *Its use:* looks up a specific node's neighbor list out of `adjacency`.
- **`vector-set!`**
  - *What it is:* a mutator — overwrites a vector's value at a given index, in place.
  - *Implementation:* `(vector-set! v i x)` sets index `i` of `v` to `x`.
  - *Its use:* records a tally count in this lesson's long-run visit-frequency check.
- **`make-vector`**
  - *What it is:* a constructor — builds a new vector of a given length.
  - *Implementation:* `(make-vector k)` returns a fresh vector of length `k` with an unspecified placeholder in every slot; `(make-vector k fill)` sets every slot to `fill` instead.
  - *Its use:* allocates the tally vector this lesson's visit-frequency check counts into.
- **`random`**
  - *What it is:* Guile's built-in source of pseudo-randomness, first given full treatment in Lesson 162.
  - *Implementation:* `(random n)`, for exact integer `n`, returns an exact integer uniformly chosen from `0` up to (not including) `n`.
  - *Its use:* `walk-step` draws one uniform index into whichever neighbor list it's given, different in length depending on the node.
- **`list-ref`**
  - *What it is:* an accessor — reads the value at a given position in a list.
  - *Implementation:* `(list-ref lst i)` walks `lst` forward `i` times and returns what's there; unlike `vector-ref`, this takes time proportional to `i`, not constant time, since a list has no direct index into its middle.
  - *Its use:* turns a random index, produced by `random`, into an actual neighbor from a node's own list.
- **`length`**
  - *What it is:* a measuring procedure — counts how many elements a list has.
  - *Implementation:* `(length lst)` returns an exact integer, walking the whole list once to count it.
  - *Its use:* tells `walk-step` how many neighbors a node has, so `random` knows the valid range to draw from; also computes a node's **degree** directly, since a node's degree and the length of its own neighbor list are the same number by definition.
- **`list`**
  - *What it is:* a constructor — builds a list directly from its arguments.
  - *Implementation:* `(list v0 v1 ... vn)` returns a fresh list holding exactly those values, in that order.
  - *Its use:* bundles several real results together for a single `display` call, and builds a trajectory's one-element starting history, exactly as in Lesson 163.
- **`exact->inexact`**
  - *What it is:* a converter — turns an exact number (an integer or a rational, like `7/2`) into an ordinary inexact decimal, for reading.
  - *Implementation:* `(exact->inexact n)` returns the closest inexact (floating-point) representation of `n`; the computation that produced `n` itself never used it.
  - *Its use:* converts this lesson's exact visit-frequency fractions into plain decimals for comparing against the predicted `degree / 14` values, since eyeballing `71562/500001` against `1/7` is far harder than eyeballing `0.143` against `0.143`.
- **`cons`**
  - *What it is:* a constructor — builds one new pair from two values; repeated `cons`ing builds a list.
  - *Implementation:* `(cons a b)` returns a fresh pair whose `car` is `a` and whose `cdr` is `b`.
  - *Its use:* `walk-trajectory` builds its history one visited node at a time, exactly as Lesson 163's `simulate-trajectory` did.
- **`reverse`**
  - *What it is:* a converter — builds a new list holding the same elements as a given list, but in the opposite order.
  - *Implementation:* `(reverse lst)` returns a fresh list; `lst` itself is untouched.
  - *Its use:* `walk-trajectory` builds its history backwards (most recent first, via `cons`) and `reverse`s it once at the end, exactly as Lesson 163's `simulate-trajectory` did.
- **`for-each`**
  - *What it is:* an iteration procedure — calls a given procedure once per element of a list, purely for whatever side effect that call causes.
  - *Implementation:* `(for-each proc list)` calls `(proc x)` for each `x` in `list`, left to right, discarding every individual call's return value.
  - *Its use:* tallies, into a shared vector, which node was visited on each step of one very long walk.
- **`member`**
  - *What it is:* a search procedure — looks for a value inside a list.
  - *Implementation:* `(member obj list)` returns the first sublist of `list` whose `car` is `obj` if found, or `#f` if `obj` never appears.
  - *Its use:* this Concept Unit's own Isolated Lab uses it to figure out which position a picked letter came from, purely to build a readable tally — it never appears in the real project code.
- **`display`**
  - *What it is:* an output procedure — writes a human-readable representation of a value to the terminal.
  - *Implementation:* `(display obj)` sends `obj`'s printed form to the current output port.
  - *Its use:* every real result in this lesson's Run It sections was produced with `display`.
- **`newline`**
  - *What it is:* an output procedure — writes a single line break.
  - *Implementation:* `(newline)` takes no required arguments.
  - *Its use:* keeps each displayed result on its own line.
- **`+`, `-`, `/`**
  - *What it is:* three of Scheme's arithmetic procedures — ordinary procedures, not special syntax.
  - *Implementation:* each takes any number of numeric arguments; `/` on two exact integers that don't divide evenly returns an exact rational.
  - *Its use:* `+` sums degrees into a total and accumulates a running total of return-time measurements; `-` counts down a trajectory's remaining steps; `/` computes both the average return time and the predicted formula it gets checked against.
- **`<`, `=`**
  - *What it is:* numeric comparison procedures, returning `#t` or `#f`.
  - *Implementation:* `(< a b)` and `(= a b)` compare two numbers.
  - *Its use:* `=` recognizes every loop's base case, including `steps-to-return`'s "has the walker come back yet"; this lesson's Isolated Lab uses `<` to drive its own verification trial count.

---

## Concept Unit: A Graph's Structure Becomes a Transition Rule

### The Problem

Five servers, connected by real network links: server `0` talks directly to `1` and `2`; `1` talks to `0`, `2`, and `3`; `2` talks to `0`, `1`, `3`, and `4`; `3` talks to `1`, `2`, and `4`; `4` talks to `2` and `3`. A monitoring tool needs to wander this network at random — hopping from whichever server it's currently checking to one of its *direct* neighbors, with no neighbor favored over any other — to get a feel for how traffic might spread or how a failure might propagate. Lesson 163 built a whole Markov chain machinery for exactly this kind of movement, but it assumed the modeler already knew, and wrote down by hand, every transition probability. Here, nobody wrote any probabilities down at all — only the network's own real connections exist. What's needed is a way to turn *that* — pure structure, no numbers — into an actual rule for what happens next.

### Project Change

- **Reference Source** — No reference counterpart. This lesson derives a random walk from first principles, the same way Era VI's other lessons have.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree.
- **Change type** — add: one new top-level definition (data) and one new top-level procedure.
- **Location** — nothing precedes them in this lesson yet; these are the first definitions this lesson makes.
- **Dependencies** — none beyond Guile's built-in vector and list procedures.

### The New Code

```scheme
(define adjacency
  (vector '(1 2)
          '(0 2 3)
          '(0 1 3 4)
          '(1 2 4)
          '(2 3)))

(define (walk-step node)
  (let* ((neighbors (vector-ref adjacency node))
         (k (length neighbors)))
    (list-ref neighbors (random k))))
```

### The Updated Project

Skipped — `adjacency` and `walk-step` are brand-new top-level definitions with no existing enclosing structure to place them inside yet; Project Change already covers this case.

### Isolated Lab: Uniform Choice Over a List of Any Length

The core new idea here is choosing uniformly among a list whose length isn't fixed in advance — Lesson 162's `sample-with-replacement` always drew from a vector of a known, constant size; here, different nodes have different numbers of neighbors, and the same choosing procedure has to work correctly no matter how many. Isolated, on a small made-up list:

```scheme
(define (pick-uniform lst)
  (list-ref lst (random (length lst))))
```

Five real, individual calls, on a five-letter list:

```scheme
(pick-uniform '(a b c d e))
;=> d

(pick-uniform '(a b c d e))
;=> e

(pick-uniform '(a b c d e))
;=> b

(pick-uniform '(a b c d e))
;=> e

(pick-uniform '(a b c d e))
;=> c
```

Four different letters across five calls — plausible, but not proof. Run for real, 10,000 times, tallying which letter comes up:

```scheme
(define tally (make-vector 5 0))
(define (index-of x lst) (- (length lst) (length (member x lst))))
(let loop ((t 0))
  (if (< t 10000)
      (let ((pick (pick-uniform '(a b c d e))))
        (vector-set! tally (index-of pick '(a b c d e)) (+ 1 (vector-ref tally (index-of pick '(a b c d e)))))
        (loop (+ t 1)))))

tally
;=> #(2018 1990 2003 2030 1959)
```

All five letters land close to the predicted `2000` (`10000` divided evenly five ways) — real, measured evidence of uniformity across a list, the same standard Lesson 162 held vector-based sampling to. `'(a b c d e)`, written with a leading `'`, is a **quoted list literal**: a literal five-element list, built once, not five separate procedure calls. This is precisely what `walk-step` does with a real node's own neighbor list instead of this lab's five letters: `(length neighbors)` measures how many choices there are — a number that's different for every node — and `(random (length neighbors))` draws uniformly across exactly that many.

### Discarding the Lab

This five-letter, ten-thousand-trial demonstration, along with its `index-of` helper, is discarded now. It never appears in the project again — `walk-step`, defined above, applies this exact same uniform-choice idea to a real node's own real neighbors.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define adjacency (vector '(1 2) '(0 2 3) '(0 1 3 4) '(1 2 4) '(2 3)))`** — `define` binds `adjacency` to a vector of five quoted list literals. `(vector-ref adjacency 0)` reads `'(1 2)` — node `0`'s own two neighbors; `(vector-ref adjacency 2)` reads `'(0 1 3 4)` — node `2`'s own four neighbors. Each list is quoted because it's a literal value written directly into the source, not the result of calling `1` or `0` as procedures.
- **`(define (walk-step node) ...)`** — `define` binds `walk-step` to a one-parameter procedure.
- **`(let* ((neighbors (vector-ref adjacency node)) (k (length neighbors))) ...)`** — a `let*`, needed here specifically because its second binding depends on its first: `neighbors` is bound to `node`'s own list, read out of `adjacency`; `k` is then bound to `(length neighbors)`, the count of that *same* list — `k`'s own binding expression refers to `neighbors`, which an ordinary `let` (whose bindings can never see each other) could not do.
- **`(list-ref neighbors (random k))`** — `(random k)` draws one fresh, uniform index into the valid range for *this specific node's* neighbor count — this Concept Unit's own Isolated Lab, applied to a real, structurally-derived list instead of a made-up one; `list-ref` then reads whichever neighbor sits at that random position.

### CS Lens

This is deriving a **Markov chain**'s own transition rule directly from a graph's structure — a **random walk** — rather than a modeler writing transition probabilities down by hand, as Lesson 163's server-health model did.

Also recognized in: PageRank's own underlying model, a random walk over the graph of web pages and links, where a page with more outgoing links doesn't get any special treatment — the walker just picks one, uniformly, exactly like `walk-step`; peer-to-peer network protocols that discover new machines by having a message hop randomly from node to node across whatever connections happen to exist; epidemiological models of disease spread across a real contact network, where "who gets exposed next" is exactly a random walk's own next step; and maze-solving by a lost, memoryless wanderer picking a random open direction at every junction.

### SE Lens

The design principle here is **deriving behavior from structure instead of specifying it redundantly**. `walk-step` never states a single probability anywhere in its own body — every transition probability it implies (each of node `2`'s four neighbors, for instance, each getting probability `1/4`) exists only implicitly, computed fresh from `(length neighbors)` at the moment it's needed.

An alternative that was *not* chosen: build a full stochastic matrix, Lesson 163-style, by converting `adjacency` into explicit probabilities once, up front — row `2` becoming `#(1/4 1/4 0 1/4 1/4)`, and so on. That alternative has a real advantage this lesson's approach lacks: Lesson 163's `distribution-step` needs an actual matrix to operate on, so an exact, matrix-based multi-step distribution computation (not just simulation) would require building one. The cost of building it anyway, always, even when only simulation is ever needed: `adjacency`'s own five short lists are far more compact than a `5×5` matrix — mostly zeros for any node that isn't directly connected to most of the others — and every time the graph's real connections change, a matrix built once from it would need to be entirely rebuilt from scratch, rather than `walk-step` simply reading whatever `adjacency` currently says.

### Run It

```scheme
(walk-step 0)
;=> 2

(walk-step 0)
;=> 2

(walk-step 0)
;=> 1

(walk-step 0)
;=> 2

(walk-step 0)
;=> 2
```

Five real calls from node `0`, which only has two neighbors, `1` and `2` — and indeed only `1` and `2` ever come back, in some order, never `0` itself or any of the more distant nodes `3`/`4`.

### Connection

A single hop is now well-defined and verified. The next problem is chaining many hops together into an actual walk, and asking a genuinely new kind of question about it: not just *where* the walker goes, but *how long* something takes to happen.

---

## Concept Unit: Walking, and Waiting to Return

### The Problem

A single hop answers "where does the walker go next." Two real, different questions build on top of that: first, what does a whole extended walk actually look like, hop after hop — and second, starting from some node, how many hops does it typically take before the walker happens to wander back to that exact same node? That second question is genuinely different in shape from anything Lesson 163 needed: every loop there ran for a number of steps decided *in advance* — `simulate-trajectory` always took a fixed `n`. Here, nothing decides in advance how long the walker takes to get back — it could happen in one hop, or take a hundred, and the only way to find out is to actually keep walking until it does.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: two new, freestanding top-level procedures.
- **Location** — after `adjacency` and `walk-step`; both call `walk-step` directly.
- **Dependencies** — `walk-step`, defined in Concept Unit 1.

### The New Code

```scheme
(define (walk-trajectory start n)
  (let loop ((node start) (steps-left n) (history (list start)))
    (if (= steps-left 0)
        (reverse history)
        (let ((next (walk-step node)))
          (loop next (- steps-left 1) (cons next history))))))

(define (steps-to-return start)
  (let loop ((node (walk-step start)) (steps 1))
    (if (= node start)
        steps
        (loop (walk-step node) (+ steps 1)))))
```

### The Updated Project

Skipped — both are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside.

### Isolated Lab: A Loop With No Fixed Length

The core new idea here is a loop whose own stopping point isn't known ahead of time — a **condition-terminated loop**, in contrast to every loop this curriculum has built so far, which always counted down from a known `n`. Isolated, with the simplest possible version: flip a fair coin, over and over, until it comes up heads, and report how many flips that took:

```scheme
(define (flips-until-heads)
  (let loop ((flips 1))
    (if (= (random 2) 1)
        flips
        (loop (+ flips 1)))))
```

Five real, individual calls:

```scheme
(flips-until-heads)
;=> 1

(flips-until-heads)
;=> 1

(flips-until-heads)
;=> 2

(flips-until-heads)
;=> 1

(flips-until-heads)
;=> 1
```

Four `1`s (heads on the very first flip) and one `2` (one tail, then heads) — genuinely different numbers of loop iterations across five calls to the *same* procedure with the *same* arguments, something no count-terminated loop in this curriculum has ever produced, since a count-terminated loop's own iteration count is fixed by its own argument, not by what happens while it runs. `steps-to-return` is built from exactly this shape: instead of "flip until heads," it's "hop until back at the start."

### Discarding the Lab

`flips-until-heads` is discarded now. It never appears in the project again — `steps-to-return`, defined above, is this same condition-terminated shape, checking "is the current node the start node" instead of "did this flip come up heads."

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (walk-trajectory start n) ...)`** — `define` binds `walk-trajectory` to a two-parameter procedure.
- **`(let loop ((node start) (steps-left n) (history (list start))) (if (= steps-left 0) (reverse history) (let ((next (walk-step node))) (loop next (- steps-left 1) (cons next history)))))`** — a named `let`, count-terminated, structurally identical to Lesson 163's `simulate-trajectory`: `node` tracks the current position, `steps-left` counts down from `n`, `history` accumulates every node visited via `cons`, and `(reverse history)` restores visit order once `steps-left` reaches `0`. The one real difference from Lesson 163's version: `(walk-step node)` computes the next node from the graph's own structure, in place of Lesson 163's `(simulate-step state)` reading a hand-written probability row.
- **`(define (steps-to-return start) ...)`** — `define` binds `steps-to-return` to a one-parameter procedure.
- **`(let loop ((node (walk-step start)) (steps 1)) ...)`** — a named `let`, this lesson's first genuinely **condition-terminated** loop: `node` starts already one hop *away* from `start` — `(walk-step start)` is called once, immediately, before the loop body ever runs, since the walker has to actually move before "has it come back yet" is a meaningful question — and `steps` starts at `1`, counting that first hop.
- **`(if (= node start) steps (loop (walk-step node) (+ steps 1)))`** — the base case, `(= node start)`, checks whether the walker has landed back home; if so, `steps` — the total count of hops it took — is the answer. Otherwise, `(loop (walk-step node) (+ steps 1))` takes one more real hop from wherever the walker currently is right now (`node`) — not from `start` again, which would restart the walk instead of continuing it — and counts it.

### CS Lens

This is a **hitting time** — specifically a **return time**, the special case where the target is the walk's own starting point — measured by a **condition-terminated loop**.

Also recognized in: a "retry until success" network request, which keeps attempting a flaky operation an unknown number of times rather than a fixed count; the Birthday Problem's own real crossover point, from Lesson 156, discovered by checking collision probability at each real group size rather than assuming a fixed size in advance; a `while`-style loop in any language, whose iteration count is a genuine runtime property of the data, not a compile-time constant; and gambler's-ruin-style problems in probability, which ask "how many bets until broke or rich," a question with no fixed answer, only a distribution of possible answers.

### SE Lens

The design principle here is **the loop's own termination condition matching what's actually being measured**, rather than approximating an unknown stopping point with a large, hopefully-big-enough fixed count.

An alternative that was *not* chosen: cap `steps-to-return` at some large fixed number, like `10000`, and return that as a stand-in "return time" if the walker hasn't come back by then — turning a condition-terminated loop back into a count-terminated one, with a hard ceiling. That alternative would guarantee the procedure always finishes quickly, no matter how the walk behaves, but at a real cost: on a graph where a genuine return sometimes takes longer than the cap (rare on this lesson's own well-connected five-node graph, but not impossible on a graph with a node connected by only one thin path), the reported "return time" would be a lie — not a measurement of what actually happened, but an artifact of an arbitrary limit. The cost this lesson's version accepts instead: `steps-to-return` has no guaranteed upper bound on how long it might run, in principle, for a genuinely pathological graph — a real, honest trade of predictable running time for a measurement that's always true.

### Run It

```scheme
(walk-trajectory 0 15)
;=> (0 2 3 4 3 2 3 2 3 1 2 4 2 3 1 2)

(walk-trajectory 0 15)
;=> (0 2 1 3 2 3 1 3 4 2 4 3 2 4 3 1)
```

Two independent fifteen-step walks from node `0`, visiting a real, varied mix of nodes — node `2`, with the highest degree (`4`), shows up especially often in both, an early hint of the connection this lesson is building toward between degree and how much a node gets visited.

```scheme
(steps-to-return 0)
;=> 15

(steps-to-return 0)
;=> 5

(steps-to-return 0)
;=> 4

(steps-to-return 0)
;=> 12

(steps-to-return 0)
;=> 10
```

Five real, independent measurements of how long it takes to return to node `0` — `15`, `5`, `4`, `12`, `10` — genuinely different every time, exactly as `flips-until-heads` was, and for the same underlying reason: each one is a real random process, stopped by a real condition, not a fixed schedule.

### Connection

Five real return-time measurements already look like they cluster somewhere in the neighborhood of `5`–`15`, but five numbers aren't a claim. The next problem is turning many such measurements into one precise average, and finding out whether that average has anything to do with the graph's own plain structure.

---

## Concept Unit: The Return-Time Formula

### The Problem

Five real return-time measurements from node `0` — `15`, `5`, `4`, `12`, `10` — vary a lot, individually. But their *average*, over enough trials, ought to settle down to something stable and meaningful, the same way Lesson 162's sampling frequencies and Lesson 163's Monte Carlo checks did. The real question this Concept Unit exists to answer: is that stable average just some number that has to be measured, with no shortcut — or does it connect to something already known about this graph, computable directly from `adjacency` with no simulation at all, the way Lesson 163's exact `distribution-step` computed a true answer no simulation ever could improve on?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: one new, freestanding top-level procedure.
- **Location** — after `steps-to-return`; calls it directly, many times.
- **Dependencies** — `steps-to-return`, defined in Concept Unit 2.

### The New Code

```scheme
(define (average-return-time start trials)
  (let loop ((t 0) (total 0))
    (if (= t trials)
        (/ total trials)
        (loop (+ t 1) (+ total (steps-to-return start))))))
```

### The Updated Project

Skipped — a brand-new, freestanding top-level procedure with no existing enclosing structure to place it inside.

### Isolated Lab: None — Justified Skip

Every construct `average-return-time` is built from — a count-terminated named-let loop, an accumulator, `+`, `/` — has already had full, real treatment earlier in this lesson or in Lesson 163. Nothing about *combining* them here is a new idea in its own right the way, for instance, a condition-terminated loop was in Concept Unit 2; this procedure's own real contribution is a new *use* of already-established pieces, not a new piece. Per the Concept Isolation Rule, a lab is warranted when a Concept Unit is built around a genuinely new construct — this one isn't, so none is given.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (average-return-time start trials) ...)`** — `define` binds `average-return-time` to a two-parameter procedure.
- **`(let loop ((t 0) (total 0)) ...)`** — a named `let`, count-terminated: `t` counts how many trials have run so far, `total` accumulates the sum of every trial's own return time.
- **`(if (= t trials) (/ total trials) ...)`** — the base case: once `trials` many measurements have been taken, `(/ total trials)` — this lesson's first genuine call to `/` — divides the accumulated sum by the trial count, computing the exact average as an exact rational, not a rounded decimal.
- **`(loop (+ t 1) (+ total (steps-to-return start)))`** — the recursive step: `(steps-to-return start)` takes one entire real, condition-terminated walk, from start to a real return, and its own result — however many steps that took — is added into `total`; `(+ t 1)` counts this trial as done.

### CS Lens

This is estimating an **expected value** — Lesson 153's own term, reused here without modification — of a **return time**, by averaging many independent real measurements, exactly the Monte Carlo method Lesson 159 established.

Also recognized in: reliability engineering's *mean time between failures*, an average computed from many real, independently-timed failure events, none of which take the same amount of time as any other; A/B testing's average session length, a real average over sessions that each genuinely lasted a different amount of time; and every earlier Monte Carlo check in this curriculum — Lesson 159's own amplification argument, Lesson 162's reservoir-sampling frequency check — all sharing this same shape: many real, independent trials, averaged, converging toward a true underlying value as the trial count grows.

### SE Lens

The design principle here is the same one Lesson 163's SE Lens named for `distribution-step`: **prefer an exact answer over an estimate, when an exact one is actually available** — which raises the real question this Concept Unit's Run It section answers directly: is one available here?

An alternative that was *not* chosen, because it doesn't exist as an alternative *yet*: derive `average-return-time`'s true value directly from `adjacency`, the way `n-step-distribution` derived an exact answer directly from `trans-matrix`, with no simulation at all. This lesson doesn't build that derivation from first principles — proving it rigorously needs machinery (a full argument about a Markov chain's long-run stationary behavior) beyond this lesson's own scope — but it does something this curriculum has done before when a full proof isn't the point: state the real formula, and check it against real, independent evidence two different ways, honestly, rather than either asserting it unverified or refusing to use it until it's fully derived.

### Run It

The formula this Concept Unit checks: for a random walk on a connected graph, the expected return time to a node is `2 · (total edges) / (that node's own degree)`.

```scheme
(define (degree node) (length (vector-ref adjacency node)))
(define total-edges (/ (+ (degree 0) (degree 1) (degree 2) (degree 3) (degree 4)) 2))

total-edges
;=> 7
```

`degree`'s own definition is exactly what Concept Unit 1's Mechanical Walkthrough already established: a node's degree is nothing more than the length of its own neighbor list. Summing every node's degree and dividing by `2` counts each real edge exactly once — an edge between nodes `1` and `2`, for instance, contributes one count to `1`'s own degree and one to `2`'s, so the raw sum of all five degrees double-counts every edge, and dividing by `2` corrects for it.

```scheme
(average-return-time 0 50000)
;=> 176161/25000

(/ (* 2 total-edges) (degree 0))
;=> 7
```

`176161/25000` — an exact rational, the true average of `50,000` real, independent trials, no rounding anywhere in computing it — is `7.04644` converted to a decimal for reading. Against a predicted `7`, computed with no simulation at all, purely from `total-edges` and `(degree 0)`, that's a match to within about half a percent.

```scheme
(average-return-time 2 50000)
;=> 174799/50000

(/ (* 2 total-edges) (degree 2))
;=> 7/2
```

`174799/50000` is `3.49598` as a decimal.

Node `2`, with the highest degree in the graph (`4`), has the *shortest* predicted return time, `7/2 = 3.5` — and the real measurement, `3.49598`, matches, closely, again. This is the formula's own real content, not just its arithmetic: a well-connected node gets *visited* more often by a wandering walker, so it also gets *returned to* faster, on average — more connections mean more ways back, not just more ways out.

**One more independent check, connecting to a genuinely different real measurement:** if a well-connected node is really visited more often, that should show up directly in one very long walk's own visit counts, not just in return times.

```scheme
(define long-walk (walk-trajectory 0 500000))
(define visits (make-vector 5 0))
(for-each (lambda (node) (vector-set! visits node (+ 1 (vector-ref visits node)))) long-walk)

visits
;=> #(71562 107120 142835 107170 71314)
```

Out of `500,001` total steps, node `2` — degree `4` — was visited `142,835` times, roughly double node `0` or node `4`'s own counts (each degree `2`), and roughly a third more than node `1` or node `3`'s (each degree `3`) — real, measured evidence that **long-run visit frequency** tracks degree directly. Converted to fractions of the whole walk, and compared against each node's own `degree / (2 · total-edges)`:

```scheme
(list (exact->inexact (/ (vector-ref visits 0) (length long-walk)))
      (exact->inexact (/ (vector-ref visits 1) (length long-walk)))
      (exact->inexact (/ (vector-ref visits 2) (length long-walk)))
      (exact->inexact (/ (vector-ref visits 3) (length long-walk)))
      (exact->inexact (/ (vector-ref visits 4) (length long-walk))))
;=> (0.1431237137525725 0.21423957152085696 0.2856694286611427 0.21433957132085735 0.1426277147445705)

(list (exact->inexact (/ (degree 0) 14)) (exact->inexact (/ (degree 1) 14))
      (exact->inexact (/ (degree 2) 14)) (exact->inexact (/ (degree 3) 14))
      (exact->inexact (/ (degree 4) 14)))
;=> (0.14285714285714285 0.21428571428571427 0.2857142857142857 0.21428571428571427 0.14285714285714285)
```

An extremely close match on every single node — and the same numbers, read a different way, explain the return-time formula itself: a node visited a fraction `f` of the time is, on average, revisited roughly every `1/f` steps, and `1 / (degree / (2 · total-edges))` is exactly `2 · total-edges / degree` — this lesson's own formula, arrived at from a completely different real measurement.

### Connection

Two genuinely independent real measurements — thousands of individually-timed returns, and one single very long walk's own visit counts — agree with each other, and both agree with one exact formula computed straight from the graph's own structure. What's left is tracing one thread through everything this lesson built, and seeing what a disconnected graph does to a formula that assumes the walker can always find its way back.

---

## Closing

### Connect the Pieces

One graph, moving through every piece built in this lesson, start to finish:

```scheme
adjacency
;=> #((1 2) (0 2 3) (0 1 3 4) (1 2 4) (2 3))
```

The raw structure — five nodes, seven real edges, verified via `total-edges` in Concept Unit 3.

```scheme
(walk-trajectory 0 8)
;=> (0 2 1 0 2 3 2 4 2)
```

One real, concrete path — eight real random hops, each one a uniform choice among whichever neighbors the current node actually has, per Concept Unit 1's own derivation from `adjacency`. This particular run happened to return to `0` once already, at step `3`, well before the walk itself ended.

```scheme
(steps-to-return 0)
;=> 5
```

One real, single return-time measurement for this same node — a condition-terminated walk, stopping exactly when it happened to come back, per Concept Unit 2.

```scheme
(/ (* 2 total-edges) (degree 0))
;=> 7
```

And the exact, structure-only prediction for what that measurement should average out to over many trials — computed in Concept Unit 3 with no simulation at all, and confirmed, independently, by two different kinds of real evidence: thousands of measured returns, and one very long walk's own real visit counts.

### What Breaks Without This

The return-time formula's own real content, per Concept Unit 3, is "a well-connected node has more ways back" — which quietly assumes the walker can *always* eventually get back, no matter where it wanders. Breaking that assumption on purpose: add a sixth node, `5`, connected to nothing at all.

```scheme
(define disconnected-adjacency
  (vector '(1 2) '(0 2 3) '(0 1 3 4) '(1 2 4) '(2 3) '()))

(define (disconnected-walk-step node)
  (let* ((neighbors (vector-ref disconnected-adjacency node))
         (k (length neighbors)))
    (list-ref neighbors (random k))))

(disconnected-walk-step 5)
```

Run for real:

```
;; real output:
;; ERROR: In procedure random: Argument 1 out of range: 0
```

Not an error about an empty list, specifically — the real failure is about `random` itself refusing an invalid range. `(vector-ref disconnected-adjacency 5)` returns `'()`, the empty list, so `k`, bound to `(length '())`, is `0` — and `(random 0)` isn't a call `random` can accept: there's no valid integer in the range "from `0` up to, but not including, `0`," so Guile rejects the argument outright, the same real kind of failure Lesson 162 hit when `sample-without-replacement` was asked for more items than existed. Node `5` isn't merely hard to return to — the walk can't even take its *first* step away from it, because `walk-step`'s own logic assumes every node has at least one neighbor to choose among, an assumption `adjacency`'s first five real nodes always satisfied and this new, isolated sixth one doesn't. This is precisely what "connected graph" means in this lesson's own formula, made concrete: the return-time formula, and the walk itself, both quietly depend on that assumption holding, not just on the graph having *some* edges somewhere.

### Exercises

- Add a real edge connecting node `5` to node `0`, restoring connectivity, and confirm `walk-step` works on it again. Then predict `5`'s own return time using this lesson's formula before measuring it for real, and check the two against each other.
- Node `2` has the highest degree in this lesson's graph. Add one more real edge to some other node — say, connecting `0` directly to `4` — and recompute every node's predicted return time. Which nodes' predictions actually change, and which don't?
- This lesson measured return time to the walk's own starting node. Modify `steps-to-return` into a `steps-to-hit` that takes two arguments, a start and a target, and measures hitting time between two *different* nodes instead. Measure it for real between node `0` and node `4`, the two most distant nodes in this lesson's graph.
- The visit-frequency check in Concept Unit 3 used a walk of `500,000` steps. Rerun it at `5,000` steps instead, and compare how close the measured fractions come to the predicted `degree / 14` values — a real, direct look at how much sampling noise shrinks as trial count grows, the same relationship Lesson 162 and Lesson 163 both measured in their own contexts.

### Definition of Done

- [ ] `adjacency`, `walk-step`, `walk-trajectory`, `steps-to-return`, and `average-return-time` are all defined, all actually run in Guile this session, with real output pasted in for every claim.
- [ ] The return-time formula, `2 · total-edges / degree`, has been checked against real Monte Carlo trials for at least two different nodes with different degrees.
- [ ] The same formula has been independently connected to a real long-run visit-frequency measurement, not just to return-time trials alone.
- [ ] The disconnected-node failure has been caused on purpose, its real error message read and explained, not just anticipated.
- [ ] `git commit` — a message explaining *why* a graph's own structure, alone, is enough to predict a random walk's long-run behavior: it's not a coincidence that a better-connected node gets visited more and returns faster, it's the same fact, degree, showing up in two different real measurements.
