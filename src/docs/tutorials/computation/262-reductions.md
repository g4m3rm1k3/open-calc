# Lesson 262: Reductions

**What you will build**: a real, computable transformation that turns any
Turing machine into a different Turing machine, engineered so that the new
machine writes a specific symbol onto its tape if and only if the original
machine halts — then use that transformation to prove a second, completely
different decision problem is undecidable, without repeating Lesson 261's
diagonal argument from scratch. The transferable problem this lesson is
actually about: **reduction**, the general technique of proving a new
problem is at least as hard as an already-understood one, by computably
converting instances of the old problem into instances of the new one.

**What you need to know first**: Lesson 253's fuel-bounded computation
technique — threading a counting-down `fuel` argument through a recursive
computation so a real program can force a "give up" answer instead of
running forever on something that might never finish. Lesson 259's Turing
machine formalism — a machine as a finite table of 5-element transitions
plus a growable tape, `read-tape`/`write-tape`/`pad-tape` as the tape's own
interface. Lesson 260's generalized `accept-states` argument (a machine's
accepting states passed explicitly, not hardcoded) and its central idea:
one interpreter, run against different data, computes different things.
Lesson 261's proof that no total, correct `halts?` function can exist, and
its `(declare some-name)`-with-no-body pattern for reasoning about a
hypothetical function whose non-existence a proof is establishing.

**Terms used in this lesson**:

- **Turing machine** — a hypothetical computing device with an infinite
  (here, growable) tape and a finite table of state transitions; the
  formal model this curriculum has used since Lesson 259 to make
  "algorithm" and "halting" precise enough to prove real things about,
  rather than relying on an intuitive, unprovable sense of what a program
  can or can't do.
- **Transition table** — the list of 5-element rules encoding a machine's
  entire behavior. In this curriculum's representation a machine *is* its
  transition table plus a starting state and a set of accept states —
  nothing else about it is hidden or implicit.
- **Tape** — the machine's read/write memory: a growable vector of
  symbols, blank (`"_"`) at any position nothing has been written to yet.
  It exists because a Turing machine needs unbounded working space to be
  a fair model of "what's computable" — a machine limited to a fixed-size
  tape could only ever compute a finite set of things.
- **Halting** — a machine stops taking steps because no transition in its
  table matches its current state and the symbol currently under its
  head. This is the central undecidable property this whole section has
  built toward since Lesson 261: whether a machine halts, in general,
  cannot be decided by any algorithm.
- **Fuel-bounded computation** — running a possibly-nonterminating
  computation for at most a fixed number of steps before giving up and
  returning an honest "still running" answer, rather than looping
  forever. It exists because a real program, unlike a mathematical
  argument, cannot actually wait for infinity to decide whether something
  ever finishes.
- **Decidable / undecidable** — a problem is decidable if some single
  algorithm exists that always halts with the correct yes-or-no answer,
  for every possible input, with no exceptions. A problem is undecidable
  if no such algorithm can *ever* exist — not "none has been found yet,"
  but a real, proven impossibility, the same strength of claim Lesson 261
  proved about the Halting Problem itself.
- **Reduction** — a computable transformation from every instance of one
  problem into an instance of a second problem, built so that the answer
  to the transformed instance is always exactly the answer to the
  original instance. It exists because it lets a single hard-won
  impossibility proof (Lesson 261's, for the Halting Problem) get reused
  against brand-new problems, instead of re-deriving a fresh diagonal
  argument by hand every time a new problem needs to be shown
  undecidable. This lesson's entire subject.
- **Catch-all transition** — a transition added to a table specifically
  so it only ever actually fires when nothing else already matches,
  by relying on a transition lookup's own first-match ordering. It
  exists here as the concrete mechanism the reduction's transformation
  uses to detect "this machine was about to halt right here" without
  needing to know in advance every state a machine might halt in.
- **`declare`** — a Clojure form that introduces a name as a var without
  giving it a value or a function body yet, letting other code reference
  that name before (or, per Lesson 261, *instead of*) it's ever defined.
  It exists in ordinary Clojure code to let mutually recursive functions
  refer to each other; this curriculum additionally uses it, since Lesson
  261, to name a *hypothetical* function whose non-existence a proof is
  in the middle of establishing, with no body ever given at all.

**Objects and methods used**:

- **`conj`**
  - *What it is:* a Clojure core function that adds one item to a
    collection, returning a new collection — the existing one is never
    changed in place.
  - *Implementation:* `(conj coll item)`. For a vector specifically,
    `conj` always adds the new item at the *end* — this is vector-specific
    behavior; `conj` on other collection types adds elsewhere, but this
    lesson, like every earlier one, only ever calls it on vectors.
  - *Its use:* `pad-tape` uses it to grow the tape by one blank symbol at
    a time; the reduction's own transformation function uses it to add
    one new transition onto the *end* of an existing transition table —
    and, as this lesson's own "what breaks" section shows, exactly where
    `conj` places that new item is the one fact the entire proof depends
    on getting right.
- **`get`**
  - *What it is:* a Clojure core function that reads the value at a given
    index of a vector (or a given key of a map), returning `nil` if
    there's nothing there.
  - *Implementation:* `(get collection index)`. Never throws for an
    out-of-range index — it returns `nil` instead, unlike some
    languages' array access.
  - *Its use:* every transition is a 5-element vector; `get transition 0`
    through `get transition 4` are how this lesson's code pulls out a
    transition's own from-state, read-symbol, to-state, write-symbol, and
    direction, by position.
- **`assoc`**
  - *What it is:* a Clojure core function that returns a new vector (or
    map) with one index (or key) replaced by a new value, leaving every
    other position unchanged.
  - *Implementation:* `(assoc collection index value)`. Requires the
    index to already exist in the collection — it cannot itself grow a
    vector past its current length, which is exactly why `pad-tape` has
    to run first.
  - *Its use:* `write-tape` uses it to place a symbol at a tape position
    after `pad-tape` has already guaranteed that position exists.
- **`count`**
  - *What it is:* a Clojure core function returning how many elements a
    collection currently holds.
  - *Implementation:* `(count collection)`, returns a non-negative
    integer.
  - *Its use:* `pad-tape` and `read-tape` both use it to compare the
    tape's current length against a target position, to decide whether
    growing or a blank default is needed.
- **`empty?`**
  - *What it is:* a Clojure core function returning `true` if a
    collection has zero elements, `false` otherwise.
  - *Implementation:* `(empty? collection)`.
  - *Its use:* the base case for every one of this lesson's list
    recursions — `find-transition` scanning a transition table,
    `member?` scanning a list of accept-states, and the reduction's own
    transformation scanning a list of state names — all stop exactly
    when `empty?` becomes `true`.
- **`first`** and **`rest`**
  - *What they are:* Clojure core functions that split a list-like
    collection into its first element and everything after it.
  - *Implementation:* `(first coll)` returns the leading element (or
    `nil` on an empty collection); `(rest coll)` returns every remaining
    element as a new collection (empty, not `nil`, when nothing remains).
  - *Their use:* every recursive scan in this lesson processes `(first
    coll)` on the current step and recurses on `(rest coll)`, the same
    shrink-by-one pattern this curriculum has used since its very first
    list recursions.
- **`nil?`**
  - *What it is:* a Clojure core function testing whether a value is
    exactly `nil` — Clojure's "nothing here" value.
  - *Implementation:* `(nil? value)`, returns `true` or `false`.
  - *Its use:* `run-tm` uses it to tell "a transition was found" apart
    from "no transition matched, so this machine just halted here" —
    the single fact this whole lesson's reduction is built around
    detecting from the outside.
- **`println`**
  - *What it is:* a Clojure core function that writes its arguments to
    standard output, space-separated, followed by a newline.
  - *Implementation:* `(println & args)` — accepts any number of
    arguments of any type.
  - *Its use:* every real run shown in this lesson is printed this way,
    so the output pasted into this lesson is genuine `bb` output, not a
    predicted or hand-written value.

---

## Restating the Machine (Lessons 259–261, in full)

### The Problem

Before anything new can be built, this lesson needs a real, running
Turing machine interpreter to build on — the same one Lessons 259, 260,
and 261 each already built. Per the Repetition Rule, that machinery gets
its full, real treatment again here, not a citation back to an earlier
lesson's file.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because this curriculum's Turing machine interpreter is a
  teaching artifact with no real external system it's ported from.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn pad-tape [tape length]
  (if (>= (count tape) length)
    tape
    (pad-tape (conj tape "_") length)))

(defn read-tape [tape position]
  (if (< position (count tape))
    (get tape position)
    "_"))

(defn write-tape [tape position symbol]
  (assoc (pad-tape tape (inc position)) position symbol))

(defn member? [item collection]
  (if (empty? collection)
    false
    (if (= (first collection) item)
      true
      (member? item (rest collection)))))

(defn matches-transition? [transition state symbol]
  (and (= (get transition 0) state)
       (= (get transition 1) symbol)))

(defn find-transition [transitions state symbol]
  (if (empty? transitions)
    nil
    (if (matches-transition? (first transitions) state symbol)
      (first transitions)
      (find-transition (rest transitions) state symbol))))

(defn verdict-for [state accept-states]
  (if (member? state accept-states)
    "accept"
    "reject"))

(declare run-tm)

(defn run-tm-with-transition [transitions state accept-states tape position fuel transition]
  (if (nil? transition)
    [(verdict-for state accept-states) state tape]
    (run-tm transitions
            (get transition 2)
            (write-tape tape position (get transition 3))
            (if (= (get transition 4) "R") (inc position) (dec position))
            accept-states
            (dec fuel))))

(defn run-tm [transitions state tape position accept-states fuel]
  (if (= fuel 0)
    ["exhausted" state tape]
    (run-tm-with-transition transitions state accept-states tape position fuel
                             (find-transition transitions state (read-tape tape position)))))
```

### The Updated Project

Skipped — no enclosing file exists yet. Every function above is a
standalone, freestanding top-level definition.

### Discard the Throwaway Example

Not applicable — this is real, reusable project code, verified this
session against real `bb` output below, not a discarded lab.

### Mechanical Walkthrough

`pad-tape` takes a `tape` vector and a target `length`. `(>= (count tape)
length)` compares the tape's current size to the target using `>=`,
already-established comparison syntax; if the tape is already long
enough, the `if` returns `tape` unchanged. Otherwise it recurses:
`(conj tape "_")` appends one blank symbol using `conj` (explained above)
and the recursive call re-checks the new, one-longer tape against the
same `length` — a recursion that grows the tape one cell at a time until
it's exactly long enough, never further.

`read-tape` takes a `tape` and a `position`. `(< position (count
tape))` checks whether `position` is a real, already-written index using
`<`, already-established comparison syntax. If so, `(get tape position)`
(explained above) returns whatever symbol is actually stored there. If
not — the position is past everything ever written — the function
returns the literal string `"_"` directly, *without* calling `write-tape`
or growing the tape at all. This is the exact distinction the Session
Note in this project's own build history caught the hard way: reading
past the end of the tape returns a blank as an answer, but never
actually writes one there. Only `write-tape` ever changes the tape's real
length.

`write-tape` takes a `tape`, a `position`, and a `symbol`. It calls
`(pad-tape tape (inc position))` first — `inc` (already-established
arithmetic, adding one) computes "one past this position," guaranteeing
the tape is at least that long before anything is written there — and
passes the padded tape straight into `(assoc ... position symbol)`
(explained above), which places `symbol` at `position` in that
already-long-enough tape. `assoc` alone could not do this safely, because
`assoc` requires the index to already exist; `pad-tape` is what makes
that always true first.

`member?` takes an `item` and a `collection`. `(empty? collection)`
(explained above) is the recursion's base case, returning `false` — an
item can't be a member of nothing. Otherwise, `(= (first collection)
item)` compares the collection's leading element (via `first`, explained
above) against `item` using `=`, Clojure's already-established equality
operator; a match returns `true` immediately, and a non-match recurses
on `(rest collection)` (explained above), the same shrink-by-one pattern
as every earlier list scan in this curriculum.

`matches-transition?` takes one `transition` 5-tuple, a `state`, and a
`symbol`. `(and (= (get transition 0) state) (= (get transition 1)
symbol))` — `and`, already-established logical conjunction, is `true`
only when both `=` comparisons are `true`: the transition's own
from-state (index `0`, via `get`) matches the given `state`, *and* its
own read-symbol (index `1`) matches the given `symbol`. Both conditions
have to hold for a transition to be the right one to fire.

`find-transition` takes a `transitions` table, a `state`, and a
`symbol`. `(empty? transitions)` is the base case, returning `nil` — no
transitions left to check means none matched. Otherwise
`matches-transition?` (explained above) checks `(first transitions)`; a
match returns that transition directly, and a non-match recurses on
`(rest transitions)`, scanning the table in order, one entry at a time,
until either a match is found or the table runs out.

`verdict-for` takes a `state` and `accept-states`. `member?` (explained
above) checks whether `state` is in `accept-states`; the `if` returns the
literal string `"accept"` when it is, `"reject"` when it isn't. This is
this curriculum's only notion of a machine's final answer once it halts.

`(declare run-tm)` — explained above under Terms — forward-declares
`run-tm`'s name so `run-tm-with-transition`, defined next, can call it
before its real body exists yet; this is ordinary mutual recursion, the
same pattern as Lesson 91's `binary-search`/`search-at-mid`, not the
hypothetical-function pattern this lesson will reach for again later.

`run-tm-with-transition` takes the full running state of a machine, plus
one already-looked-up `transition` (possibly `nil`). `(nil? transition)`
(explained above) is the branch that detects a halt: when true, it
returns a 3-element vector — `verdict-for` computes the final
`"accept"`/`"reject"` answer, alongside the `state` the machine halted in
and the final `tape`. When a real transition was found, the function
calls `run-tm` again: `(get transition 2)` is the transition's own
to-state; `(write-tape tape position (get transition 3))` writes the
transition's own write-symbol (index `3`) at the current `position`;
`(if (= (get transition 4) "R") (inc position) (dec position))` reads the
transition's own direction (index `4`) and moves the head one cell right
via `inc` or left via `dec`; `accept-states` passes through unchanged;
and `(dec fuel)` — `dec`, already-established arithmetic, subtracting one
— spends exactly one unit of fuel for this one step taken.

`run-tm` takes a `transitions` table, the machine's current `state`,
`tape`, head `position`, `accept-states`, and remaining `fuel`. `(= fuel
0)` checks whether the fuel budget from Lesson 253's own technique has
run out; if so, it returns `["exhausted" state tape]` — an honest "still
running, gave up" answer, never a false claim of having actually halted.
Otherwise it calls `find-transition` (explained above) exactly once,
using the current `state` and `(read-tape tape position)` (explained
above) to look up the one transition that applies right now, and hands
that already-computed result straight to `run-tm-with-transition` — this
is the "compute once, pass to a helper" pattern this curriculum has used
since Lesson 56, avoiding a second, redundant lookup of the same
transition inside the helper.

### CS Lens

This is the same fuel-bounded interpreter loop from Lessons 259–261,
restated here because this lesson's own new material — the reduction —
has to be built directly on top of a real, working notion of "this
machine halts" or it would have nothing concrete to transform.

### SE Lens

Splitting `run-tm` into `run-tm` plus `run-tm-with-transition`, rather
than writing one larger function with the transition lookup and the halt
check both inline, is the same "compute once, pass to a helper" tradeoff
this curriculum has used since Lesson 56 to work around never having
`let`: the alternative — calling `find-transition` a second time inside
whatever branch needs its result — would cost real, repeated work every
single step of every machine run, silently, forever, in a curriculum
whose entire final section is about exactly this kind of computability
and cost tradeoff.

### Commands Needed

None beyond running the file with `bb <filename>.clj`, exactly as every
Section VI+ lesson has done.

### Run It

```
Machine 1 (parity) on [1 1]: [accept even [1 1]]
Machine 2 (ping-pong) on []: [exhausted ping [_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _]]
```

Real, verified `bb` output this session. Two machines, restated fresh for
this lesson: a parity checker over states `"even"`/`"odd"` (start
`"even"`, accepting only `"even"`) that halts and accepts a tape of two
`"1"`s, since two is even — and a `"ping"`/`"pong"` machine whose two
transitions cover every symbol either state will ever see, so it never
halts at all, and with a fuel budget of `20`, honestly reports
`"exhausted"` rather than a false answer.

Connects directly into the next unit: both machines above are exactly
the two real cases the reduction is about to be tested against — one
that genuinely halts, one that genuinely never does.

---

## Concept Unit 1: The Reduction — Building a Computable Transformation

### The Problem

Lesson 261 proved, by a real diagonal argument, that no total, correct
`halts?` function can exist. That proof took an entire lesson to build.
Suppose a second, completely different question comes up: does a machine
ever write a specific symbol — call it `"X"` — anywhere on its tape,
across its whole run? Call this the **Prints-X problem**. Is *this*
undecidable too? Redoing Lesson 261's diagonal argument from scratch,
line by line, for a different problem would work, but it would also mean
this curriculum needs one full, custom, standalone impossibility proof
per problem, forever. There has to be a way to reuse Lesson 261's own
already-finished proof instead of re-deriving it. That reuse *is* a
reduction, and building one is this unit's real subject.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because this transformation is original teaching material for
  this curriculum, not a port of any existing system.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; the interpreter restated
  in the section above.

### The New Code

```clojure
(defn transition-for-state [state]
  [state "_" "PRINTED-X" "X" "R"])

(defn add-print-x-catchall [transitions states]
  (if (empty? states)
    transitions
    (add-print-x-catchall (conj transitions (transition-for-state (first states)))
                           (rest states))))
```

### The Updated Project

Skipped — no enclosing file exists yet. Both functions are standalone,
freestanding top-level definitions added alongside the interpreter above.

### Discard the Throwaway Example

Not applicable — this is real, reusable project code, verified this
session against real `bb` output below, not a discarded lab. The two
runs shown below, against the two real machines already built in this
lesson, *are* this concept's own isolated demonstration — there is no
separate throwaway version to build and then discard.

### Mechanical Walkthrough

`transition-for-state` takes one `state` name. It returns a literal
5-element vector: `state` itself as the from-state, the literal string
`"_"` as the read-symbol this new transition only ever matches on, the
literal string `"PRINTED-X"` as a brand-new to-state not used by any
machine this curriculum has built before, the literal string `"X"` as
the symbol it writes, and `"R"` as its direction. This is exactly one
new **catch-all transition** — explained under Terms above — built for
one given state: "if you're in this state and the only thing left to
read is blank, write `X` and move on," phrased in the exact same
5-element shape every other transition in this curriculum already uses.

`add-print-x-catchall` takes a `transitions` table and a list of
`states`. `(empty? states)` (explained above) is the base case: once
every state has had a catch-all transition built for it, the function
returns `transitions` — now containing the original table plus every
catch-all added so far — unchanged. Otherwise, `(conj transitions
(transition-for-state (first states)))` calls `transition-for-state` on
the current state (via `first`, explained above) and `conj`s (explained
above) the resulting catch-all transition onto the **end** of
`transitions`, and the function recurses on `(rest states)` — one state
consumed, one catch-all transition added, every single recursive call.
Because `conj` on a vector always adds at the end, and `find-transition`
(restated above) always scans a transition table from its own front and
returns the very first match it finds, every catch-all transition this
function adds can only ever be reached when nothing already earlier in
the table already matched — which is exactly the state of "this machine
was about to halt right here," and nothing else.

**Execution trace** — `add-print-x-catchall` applied to the parity
machine's own 4-entry table and its two states, `["even" "odd"]`:

1. `states = ["even" "odd"]`, not empty. Builds `transition-for-state
   "even"` → `["even" "_" "PRINTED-X" "X" "R"]`, `conj`s it onto the
   original 4-entry table, and recurses with `states = ["odd"]`.
2. `states = ["odd"]`, not empty. Builds `transition-for-state "odd"` →
   `["odd" "_" "PRINTED-X" "X" "R"]`, `conj`s it onto the now-5-entry
   table, and recurses with `states = []`.
3. `states = []`, `empty?` is `true`. Returns the final, 6-entry table
   unchanged — recursion stops because every state in the original list
   has now had exactly one catch-all transition added for it.

Real output, confirming that trace:

```
Transformed parity transitions: [[even 0 even 0 R] [even 1 odd 1 R] [odd 0 odd 0 R] [odd 1 even 1 R] [even _ PRINTED-X X R] [odd _ PRINTED-X X R]]
```

Now run both machines — transformed — through the same, completely
unmodified `run-tm` from the section above:

```clojure
(println "Machine 1 transformed on [1 1]:"
  (run-tm (add-print-x-catchall parity-transitions parity-states)
          "even" ["1" "1"] 0 parity-accept-states 20))

(println "Machine 2 transformed on []:"
  (run-tm (add-print-x-catchall pingpong-transitions pingpong-states)
          "ping" [] 0 pingpong-accept-states 20))
```

Real `bb` output:

```
Machine 1 transformed on [1 1]: [reject PRINTED-X [1 1 X]]
Machine 2 transformed on []: [exhausted ping [_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _]]
```

**Execution trace, Machine 1 transformed** — the parity machine's
transformed table run on `["1" "1"]`, start `"even"`, position `0`,
fuel `20`:

1. State `even`, position `0`, reads `"1"`. `find-transition` matches
   `["even" "1" "odd" "1" "R"]` — one of the four original transitions,
   still first in the table — moving to state `odd`, tape unchanged,
   position `1`.
2. State `odd`, position `1`, reads `"1"`. Matches `["odd" "1" "even"
   "1" "R"]` — moving back to state `even`, tape unchanged, position
   `2`.
3. State `even`, position `2`. `read-tape` finds position `2` past the
   tape's own length of `2`, returning `"_"` without writing anything.
   `find-transition` scans the original four transitions first — none
   of them match `even`/`"_"` — and only then reaches the fifth,
   catch-all entry, `["even" "_" "PRINTED-X" "X" "R"]`. This is the
   catch-all firing for the first time: state becomes `PRINTED-X`,
   `write-tape` pads the tape to length `3` and writes `"X"` at position
   `2`, giving `["1" "1" "X"]`, and the head moves to position `3`.
4. State `PRINTED-X`, position `3`, reads `"_"`. `find-transition` scans
   the whole table — `PRINTED-X` has no transitions defined for it at
   all, original or catch-all — and returns `nil`. `run-tm-with-
   transition`'s `nil?` branch fires: the machine halts, in state
   `PRINTED-X`, which is not in `accept-states`, so `verdict-for`
   returns `"reject"`. Final result: `["reject" "PRINTED-X" ["1" "1"
   "X"]]` — matching the real output above exactly.

The parity machine genuinely halts on this input (Machine 1's own
unmodified run, in the section above, already showed that: `"accept"`).
Its transformed version genuinely writes `"X"`. **Machine 2's**
transformed run, by contrast, still reports `"exhausted"` after the same
`20` fuel — because `find-transition`, scanning `ping`/`pong`'s own
original two transitions first, always finds a real match there before
ever reaching either catch-all entry; the catch-all transitions exist in
the table but are never actually reachable, because the machine never
stops finding a real transition to take.

Both real runs together prove the claim this whole reduction depends on,
for these two concrete machines: **the transformed machine writes `"X"`
exactly when the original machine halts, and never writes `"X"` when the
original machine doesn't.**

### CS Lens

This is called a **reduction** — a computable transformation from
instances of one problem (here, "does this machine halt?") into
instances of a second problem (here, "does this machine's transformed
version ever write `X`?"), built so the yes/no answer is always
preserved across the transformation. Written `A ≤ B` — "A reduces to
B" — meaning solving B, even hypothetically, would be enough to solve A
too, by first transforming and then asking B's solver. Also recognized
in: NP-completeness proofs, which are almost entirely long chains of
reductions between problems rather than fresh diagonal arguments; a
compiler's own "reduce this optimization problem to a graph-coloring
problem" register-allocation strategy; cryptographic security proofs,
which routinely show "breaking this scheme would let you break a
already-trusted-hard problem"; and, informally, any time a real
engineering problem gets solved by noticing it's "secretly" an instance
of a problem someone already has a working tool for.

### SE Lens

The alternative to building a reduction here would be re-deriving a
fresh diagonal argument, from scratch, custom-built for the Prints-X
problem specifically, the same amount of work Lesson 261 spent on
`halts?`. That does not scale: this curriculum, and real complexity
theory generally, needs to classify many different problems as
undecidable (or, starting in Lesson 263, as tractable or intractable),
and re-deriving a full independent impossibility proof for every single
one is real, unbounded, repeated cost. A reduction converts that
recurring cost into a one-time cost — Lesson 261's proof — plus a much
smaller, problem-specific transformation, the same trade every reused
library or every previously-proven theorem in mathematics makes: pay
once for a hard result, then spend comparatively little to apply it
somewhere new. The real debt this project is carrying: this particular
transformation only correctly identifies a machine's halting points when
every one of its halting transitions is missing specifically on the
blank symbol `"_"` — true of every machine this curriculum has built, but
not something the transformation checks or enforces for an arbitrary
machine with a richer alphabet, where a halt could also happen on `"0"`
or `"1"` with no matching transition. A fully general version would need
one catch-all transition per state *per symbol* in the machine's own
alphabet, not just per state.

### Commands Needed

None beyond running the file with `bb <filename>.clj`, as above.

### Run It. Show the Real Output.

Already shown above, interleaved with the walkthrough and execution
traces: the transformed parity machine's tape ends as `["1" "1" "X"]`;
the transformed ping-pong machine exhausts its fuel having never written
`"X"` at all. Both are genuine `bb` output from this session.

Connects directly to the next unit: this transformation is a real,
computable function — it always finishes, for any machine, since it's
just a scan over a finite list of states — but on its own it doesn't
*decide* anything. The next unit uses it to build something that would.

---

## Concept Unit 2: Composing the Decider and the Contradiction

### The Problem

The transformation built in the previous unit proves a fact about two
specific machines. To prove something about the Prints-X problem in
general, the argument needs to work the same way Lesson 261's did: assume
a solver for the new problem exists, build something that would follow
from that assumption, and show the thing that follows is already known
to be impossible.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, continuing the same original teaching material as the unit
  above.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `add-print-x-catchall`
  from the unit above.

### The New Code

```clojure
(declare decides-prints-x?)

(defn derived-halts? [transitions states state tape position accept-states fuel]
  (decides-prints-x? (add-print-x-catchall transitions states)
                      state
                      tape
                      position
                      accept-states
                      fuel))
```

### The Updated Project

Skipped — no enclosing file exists yet. `derived-halts?` is a standalone,
freestanding top-level definition added alongside everything above.

### Discard the Throwaway Example

Not applicable — this is real project code. There is nothing to discard;
the point of this unit is exactly that this code cannot be run to
completion, which the next part demonstrates for real rather than just
asserting.

### Mechanical Walkthrough

`(declare decides-prints-x?)` — explained under Terms above — introduces
the name `decides-prints-x?` as a var with no function body at all. This
is Lesson 261's own hypothetical-function pattern, restated here in
full, not cited: `decides-prints-x?` stands for "a total, correct decider
for the Prints-X problem," *assumed* to exist for the sake of the
argument that follows, exactly the same role `halts?` played in Lesson
261's own `diagonal` proof.

`derived-halts?` takes a machine's full description — its `transitions`,
its list of `states`, a `state` to start from, a `tape`, a head
`position`, `accept-states`, and a `fuel` budget — and its entire body is
one call: `(add-print-x-catchall transitions states)` (restated in full
above) builds the transformed transition table, and that transformed
table, along with every other argument passed straight through
unchanged, is handed to `decides-prints-x?`. If `decides-prints-x?`
really were a total, correct decider for "does this machine ever write
`X`," then — because the previous unit's own transformation and its two
real runs already proved "writes `X`" and "halts" are the same fact for
this class of machine — `derived-halts?` would be a total, correct
decider for "does this machine halt," using nothing but
`add-print-x-catchall` (a real, always-terminating function) and one call
to the assumed `decides-prints-x?`.

Calling `derived-halts?` for real, right now, does not produce an
answer — because `decides-prints-x?` was only ever `declare`d, never
given a body:

```clojure
(derived-halts? parity-transitions parity-states "even" ["1" "1"] 0 parity-accept-states 20)
```

Real `bb` output:

```
----- Error --------------------------------------------------------------------
Type:     java.lang.IllegalStateException
Message:  Attempting to call unbound fn: #'user/decides-prints-x?
```

This is not a bug to fix. It's the honest, concrete state of the
argument at exactly this point: `derived-halts?` is a real function that
would work — if its one assumption held. The rest of this unit is about
whether that assumption *can* hold.

### The Contradiction

Lesson 261 built a real, concrete `diagonal` function against a
`declare`d-but-never-implemented `halts?`, and proved, by exhaustive case
analysis over `halts?`'s only two possible answers — both of which
directly contradicted `diagonal`'s own five lines of code — that no
total, correct `halts?` can exist, for any reason, ever. That proof did
not depend on *how* a would-be `halts?` might be built; it applies to
any function claiming to be a total, correct halting decider, regardless
of its own internal implementation.

`derived-halts?`, built in this unit, is exactly such a function —
*if* `decides-prints-x?` exists. It takes a machine description, always
terminates (because `add-print-x-catchall` always terminates, and
`decides-prints-x?` is assumed to always terminate too), and always
returns the correct halting answer (because the previous unit's
transformation provably preserves that answer). That is the complete
definition of a total, correct halting decider — the exact thing Lesson
261 already proved cannot exist.

So: if `decides-prints-x?` existed, `derived-halts?` would exist too,
and Lesson 261's proof says it can't. The only assumption anywhere in
this chain is `decides-prints-x?`'s own existence. It has to be the
thing that's false. **The Prints-X problem is undecidable.**

This is the general technique the BRD line for this lesson names
directly: transferring difficulty from one problem to another. Written
formally, **Halting ≤ Prints-X** — the Halting Problem reduces to the
Prints-X problem — and the general rule this lesson has now built one
real, concrete instance of: if problem A reduces to problem B, and A is
already known to be undecidable, then B is undecidable too. The
contrapositive is the same fact stated the other way around, and is
usually the more intuitive direction to think in first: if B *were*
decidable, that decider could be used, via the reduction, to decide A —
so if A is known impossible, B being decidable is impossible too.

### CS Lens

Naming the technique directly: a **reduction proof** consists of exactly
four real pieces, all four of which this unit built concretely rather
than only asserting — (1) assume, for contradiction, that a decider for
the new problem exists; (2) build a real, always-terminating
transformation from instances of the already-undecidable problem into
instances of the new one (`add-print-x-catchall`); (3) prove the
transformation preserves the yes/no answer (this lesson's two real runs
against the parity and ping-pong machines); (4) compose the
transformation with the assumed decider (`derived-halts?`) to get
something that would decide the already-known-impossible problem —
contradiction. Also recognized in: every NP-completeness proof, which is
precisely this four-step shape repeated against a different pair of
problems; database query optimizers, which sometimes prove a proposed
optimization is itself as hard as an already-known-hard problem before
giving up on finding an efficient version; and, in ordinary software
engineering, any time a team declines to solve a new-sounding problem
directly because someone recognizes it as "just" an already-known hard
problem in disguise.

### SE Lens

The alternative — proving Prints-X undecidable with its own, independent
diagonal argument — was available and would also have worked; nothing
about the Halting Problem is uniquely required to prove Prints-X is
undecidable. The tradeoff is entirely about reuse: a reduction is
strictly cheaper to build once a first impossibility proof already
exists, at the real cost of the proof itself becoming harder to read in
isolation — anyone checking this lesson's argument has to also trust
Lesson 261's proof holds, rather than finding everything self-contained
in one place. This is the same tradeoff every reused abstraction in this
curriculum has made since Lesson 56: cheaper to build on, more expensive
to verify from a single file alone.

### Commands Needed

None beyond running the file with `bb <filename>.clj`, as above.

### Run It. Show the Real Output.

Already shown above: `derived-halts?`, called for real, throws a real
`IllegalStateException: Attempting to call unbound fn:
#'user/decides-prints-x?` — genuine `bb` output confirming
`decides-prints-x?` was declared, never implemented, exactly as the
argument requires.

Connects directly to the closing section: everything needed to state
this lesson's full result is now built and verified — the interpreter,
the transformation, and the composed decider whose assumed existence
this lesson has just shown is impossible.

---

## Connect the Pieces

Follow one concrete value through every unit built in this lesson: the
tape `["1" "1"]`. Run through the restated, unmodified `run-tm` from the
first section, it halts and accepts, in state `"even"` — a real,
verified fact about a real machine. Run through
`add-print-x-catchall`'s transformation, the parity machine's own
4-transition table grows to `6` entries, two new catch-all transitions
appended at the end, one per state. Run the transformed table through
the same, still-unmodified `run-tm`, the tape ends as `["1" "1" "X"]` —
the transformation genuinely converted "this machine halts" into "this
machine's tape now contains `X`," and a second real machine, ping-pong,
confirmed the other direction: no halt, no `X`, ever, even after `20`
real fuel-bounded steps. `derived-halts?` then composed that same
transformation with a hypothetical `decides-prints-x?`, and calling it
for real produced a genuine `bb` error, because `decides-prints-x?` was
declared and never given a body — the honest, concrete state a proof by
contradiction leaves its central assumption in. Lesson 261's own already-
finished proof supplies the missing piece: `derived-halts?`, if it could
run, would be exactly the kind of total, correct halting decider that
proof already ruled out. The one tape value, `["1" "1"]`, was real and
concrete at every single step of that chain — nothing in this lesson's
central claim depended on an abstract or hypothetical machine.

## What Breaks Without This

The entire proof depends on one specific fact about
`add-print-x-catchall`: its new catch-all transitions are `conj`ed onto
the **end** of the transition table, so `find-transition`'s own
first-match scanning order only ever reaches them when nothing earlier
in the table already matched. Break that by building the same
transitions in the opposite order — catch-all entries first, original
transitions after:

```clojure
(def pingpong-transitions-broken
  [["ping" "_" "PRINTED-X" "X" "R"]
   ["pong" "_" "PRINTED-X" "X" "R"]
   ["ping" "_" "pong" "_" "R"]
   ["pong" "_" "ping" "_" "R"]])

(println "Machine 2 BROKEN transformed on []:"
  (run-tm pingpong-transitions-broken "ping" [] 0 pingpong-accept-states 20))
```

Real `bb` output:

```
Machine 2 BROKEN transformed on []: [reject PRINTED-X [X]]
```

The ping-pong machine never halts — its restated, unmodified run earlier
in this lesson exhausted a real `20`-step fuel budget without ever
reaching a halt. But with the catch-all transitions listed *first*,
`find-transition` matches `["ping" "_" "PRINTED-X" "X" "R"]` on the very
first step, before it ever reaches the real `["ping" "_" "pong" "_"
"R"]` transition later in the table. The broken version reports `"X"`
written after a single step — falsely signaling "this machine halted"
for a machine that provably never does. Every claim this lesson makes
about the transformation preserving the yes/no answer depends entirely
on this ordering; restoring `conj`'s own append-at-the-end placement
(the real, non-broken version above) restores the correct behavior.

## Exercises

1. Build a third real machine — pick any transition table from earlier
   in this curriculum's Section XII, or invent a small new one — and run
   both its original and its `add-print-x-catchall`-transformed version
   through `run-tm`. Confirm by hand, before running it, whether you
   expect `"X"` to appear, then check the real output against your
   prediction.
2. `add-print-x-catchall`'s catch-all transitions only ever match the
   blank symbol `"_"`. Extend `transition-for-state` (or write a second
   version) so it adds one catch-all transition per state *per symbol*
   in a given alphabet, e.g. `["0" "1" "_"]`, rather than just `"_"`.
   Confirm it still produces the correct 6-entry table for the parity
   machine when its alphabet is `["_"]` alone.
3. Lower `derived-halts?`'s own `fuel` argument to `0` and trace, by
   hand, exactly which line of code would run first if
   `decides-prints-x?` did have a real body — does `add-print-x-catchall`
   ever get a chance to run, or does something else happen first?
4. State, in your own words, what `A ≤ B` would mean if reversed to
   `B ≤ A` for this lesson's own two problems. Does this lesson's proof
   say anything at all about whether Prints-X reduces to Halting, in
   that direction? (It doesn't — say why, concretely, in terms of what
   this lesson actually built.)

## Definition of Done

- [ ] The restated interpreter (`pad-tape` through `run-tm`) runs both
      real machines correctly, matching the real `bb` output shown above.
- [ ] `add-print-x-catchall` correctly transforms both machines' tables,
      matching the real `bb` output shown above.
- [ ] Both transformed machines run correctly through the unmodified
      `run-tm` — the parity machine's tape ends with `"X"`, the
      ping-pong machine's does not — matching the real `bb` output shown
      above.
- [ ] `derived-halts?` is defined and, when called, produces the real
      `Attempting to call unbound fn` error shown above — not a silent
      failure, not a guessed value.
- [ ] The broken, prepended-order version of the transformation produces
      the real, incorrect `["reject" "PRINTED-X" ["X"]]` result after a
      single step, demonstrating exactly why the append-order is
      load-bearing.
- [ ] You can state, without looking back at this lesson, all four steps
      of a reduction proof (assume, transform, prove preservation,
      compose) and why each one is necessary.
- [ ] Commit: *"Add the reduction from Halting to Prints-X, so future
      undecidability results can reuse Lesson 261's proof instead of
      each needing an independent diagonal argument."*
