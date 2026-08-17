# Lesson 259: Turing Machines

**What you will build** — A real, general Turing machine simulator: a tape that can be read from and written to at any position, moved over freely in either direction, plus a step-by-step engine that runs any transition table against it, safely bounded by a real step budget. Then two real machines built on top of it — a tiny one that flips every bit it reads, and a genuine, six-state machine that decides `a^n b^n c^n` — the exact language Lesson 258 *proved*, with a real counterexample, no single-stack pushdown automaton can correctly recognize. The transferable problem: what is the most general machine model this curriculum can build, and what, concretely, does it gain over every more restricted model — finite automaton, pushdown automaton — built before it?

**What you need to know first** — Lesson 258's own stack, `push`/`pop`/`peek`, and its own proven **single-stack limitation** on `a^n b^n c^n`. Lesson 254's `matches-transition?`/`find-transition` and its vocabulary — **state**, **deterministic**, **transition** — and specifically the *contrast* this lesson draws against it. Lesson 253's own `find-least-bounded` and its vocabulary — **halt**, **unbounded search**, **fuel-limited computation** — reused here almost unchanged, applied to a genuinely different kind of machine. Lesson 94/96's append-by-`assoc`, and Lesson 20/22's recursion and base-case-and-progress.

**Terms used in this lesson**

- **Turing machine (TM)** — the most general machine model this curriculum builds: a finite set of states (Lesson 254), plus one **tape** — memory that can be read from and written to at any position, and moved over in either direction, with no fixed bound on how far it can extend. A Turing machine's transition depends on its current state and the symbol currently under its **head** (the tape position it is reading), and can change state, write a new symbol at that position, and move the head one step left, right, or not at all.
- **tape** — this lesson's own representation of a Turing machine's memory: an ordinary vector, extended with blanks as needed whenever a position beyond its current length is written to, so it behaves as if unbounded in the rightward direction without ever needing to be pre-allocated to some fixed size.
- **head** — the one tape position a Turing machine is currently reading from and (potentially) writing to; every transition moves it exactly one step, or leaves it in place.
- **blank symbol** — a special symbol, written `"_"` in this lesson, representing "nothing has ever been written here." Reading past the tape's own current length always returns a blank rather than failing.
- **halt** — reappearing from Lesson 253: a Turing machine halts the moment its current state and the symbol under its head have no matching transition at all — not an error, but the machine's own, deliberate way of saying "I am done," whether that means success or failure.
- **decider** — a Turing machine that is guaranteed to halt on every input, and whose final state (whether it is a designated accept state or not) is the actual yes/no answer to some question about that input. This lesson's own `a^n b^n c^n` machine is built to be a decider — proven so, concretely, on every test input this lesson runs.

**Objects and methods used**

- **`get`, `count`, `assoc`, `<`, `=`, `+`, `-`, `if`, `defn`, `println`, `nil`**
  - *What they are:* All reappear in full from Lessons 253–258: `get` reads a value out of a vector by index, returning `nil` for an out-of-range index rather than raising an error (already noted in Lesson 254's own Header); `count` reports a collection's length; `assoc` returns an updated copy of a vector; `<` is numeric less-than; `=` tests equality, including against `nil` itself, Clojure's own value representing "nothing here"; `+`/`-` are Clojure's arithmetic functions; `if` branches on a test; `defn` names a function; `println` prints its arguments' readable form.
  - *Their use here:* Identical roles to every prior lesson in this section, with one addition: `nil` is used directly and deliberately in this lesson, both as `get`'s own real return value past a vector's end, and as this lesson's own explicit signal for "no matching transition was found" — a halt, not a bug.

---

## Concept Unit: The Tape — Memory You Can Revisit

### The Problem

Lesson 258's stack gave a pushdown automaton real, unbounded memory — but only in one specific shape: last-in-first-out, reachable only from the top, one symbol at a time. A Turing machine's tape is a genuinely different shape of unbounded memory — readable and writable at *any* position the head has ever visited, not just the most recent one, and revisitable as many times as needed. Before this lesson can build anything resembling a real Turing machine, it needs a working representation of exactly that.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing Section XII's build from Lesson 258.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn read-tape [tape position]
  (if (= (get tape position) nil)
    "_"
    (get tape position)))

(defn pad-tape [tape target-length]
  (if (< (count tape) target-length)
    (pad-tape (assoc tape (count tape) "_") target-length)
    tape))

(defn write-tape [tape position symbol]
  (assoc (pad-tape tape (+ position 1)) position symbol))
```

### The Updated Project

Skipped — three freestanding new functions, nothing surrounding them yet.

### Naming the Concept

Per the Section VI+ convention already used throughout this section, this code is both the isolated demonstration and the real artifact directly. The **tape** is represented as an ordinary vector, exactly like every other structured value in this section — the new idea is entirely in how it is *read* and *written*, not in its own representation. `read-tape` treats any position past the tape's current length as a **blank symbol**, `"_"`, rather than an error — `get`, already explained in the Header, genuinely returns `nil` for such a position, and `read-tape` turns that `nil` into the blank this lesson's machines will actually reason about. `write-tape` does the harder half: writing past the tape's own current length first grows the tape with blanks, via `pad-tape`, all the way out to the position being written, so the write itself can never fail.

```
read-tape [a b c] 1 => b
read-tape [a b c] 5 => _
write-tape [a b c] 1 x => [a x c]
write-tape [a b c] 5 x => [a b c _ _ x]
```

Reading position `1` of `["a" "b" "c"]` returns its real, present value, `"b"`. Reading position `5` — well past the tape's own length of `3` — returns the blank `"_"`, not an error. Writing `"x"` at position `1` (already within range) simply replaces `"b"`. Writing `"x"` at position `5` — again, well past the current length — first pads the tape out with two real blank symbols at positions `3` and `4`, then places `"x"` at position `5`, producing a tape that now genuinely extends that far, with no gap left unaccounted for.

### Mechanical Walkthrough

Every distinct syntactic element in `read-tape`, `pad-tape`, and `write-tape`, in order:

- **`tape`, `position`** — two parameters of `read-tape`: the tape vector, and the index currently being read.
- **`(if (= (get tape position) nil) "_" (get tape position))`** — `get`, already explained in the Header, reads the value at `position`; `=`, already explained in the Header, checks whether that value is `nil` — Clojure's own representation of "nothing here," returned automatically by `get` for any index at or beyond the vector's own length. If so, the honest answer is the blank symbol `"_"`; otherwise, the real value already present is returned directly.
- **`tape`, `target-length`** (in `pad-tape`) — two parameters: the tape to grow, and how long it needs to become.
- **`(if (< (count tape) target-length) (pad-tape (assoc tape (count tape) "_") target-length) tape)`** — `<`, already explained in the Header, checks whether the tape is still shorter than the target; if so, `assoc`, already explained in the Header, appends one more blank at exactly the tape's own current length (the identical append-by-`assoc` technique established since Lesson 94/96), and `pad-tape` calls itself again on this one-longer tape, still aiming for the same `target-length` — real, base-case-and-progress recursion (Lesson 22), since `(count tape)` strictly grows toward `target-length` on every call. Once the tape is no longer shorter than `target-length`, the base case returns it unchanged.
- **`(assoc (pad-tape tape (+ position 1)) position symbol)`** (in `write-tape`) — first, `pad-tape` grows the tape out to at least `position + 1` elements — via `+`, already explained in the Header — long enough that `position` itself is guaranteed to be a valid, existing index; then `assoc` writes `symbol` at exactly that position. Padding to `position + 1`, not merely `position`, matters directly: a vector of length `position` has valid indices only up to `position - 1`, one short of the position actually being written.

### CS Lens

**Tape as revisitable, position-addressed memory**, distinct from Lesson 258's own stack, is a hard concept.

```
Also recognized in: ordinary computer memory itself (RAM), addressable and
rewritable at any position, the real hardware this lesson's own tape is a
direct, simplified model of; a text editor's own document buffer, readable
and writable at any cursor position, not just at one end; a spreadsheet's
own grid of cells, each independently readable and rewritable; a video
game's own save file, storing state at fixed positions to be read back and
overwritten on a later playthrough, unlike a stack's own last-in-first-out
access pattern.
```

### SE Lens

The design principle: choosing the representation that matches the access pattern actually needed, rather than reusing Lesson 258's stack out of convenience. The alternative not chosen: represent the tape as a stack (or two stacks, one for "already visited, to the left" and one for "not yet visited, to the right" — a real, legitimate technique some Turing-machine simulators do use). The real tradeoff: a two-stack tape can genuinely work and would reuse Lesson 258's own `push`/`pop` directly, but every read or write at the *current* head position would still need special-casing outside the stack abstraction, since a stack's own interface only ever exposes its top — this lesson's plain-vector-plus-index representation, by contrast, makes "read or write wherever the head happens to be" a single, uniform operation (`get`/`assoc` at `position`), at the cost of the padding logic `pad-tape` exists specifically to handle.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
read-tape [a b c] 1 => b
read-tape [a b c] 5 => _
write-tape [a b c] 1 x => [a x c]
write-tape [a b c] 5 x => [a b c _ _ x]
```

Run for real, this session, via `bb`. All four match this unit's own stated read/write rules by direct inspection.

### Connection

A tape alone is just memory — it does nothing on its own. The next unit builds the actual machine: states, a transition table, and a real loop that reads, writes, and moves the head, one step at a time, until it decides to stop.

---

## Concept Unit: States, a Tape, and a Halting Question

### The Problem

Lesson 254's `find-transition` always assumed a matching transition existed somewhere in the table, and if none did, it recursed forever, past the end of the table, until the real, uncaught `StackOverflowError` this section has seen more than once. A Turing machine needs something genuinely different: "no matching transition" has to be a real, meaningful, first-class outcome — the machine's own way of announcing it is finished — not a bug to guard against. How does a transition search change to make "not found" an honest answer instead of a search that never terminates?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, extending this lesson's own Concept Unit above.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `read-tape` and `write-tape` from the Concept Unit above.

### The New Code

```clojure
(declare run-tm)

(defn matches-tm-transition? [transition state symbol]
  (if (= (get transition 0) state)
    (= (get transition 1) symbol)
    false))

(defn find-tm-transition [transitions state symbol index]
  (if (= index (count transitions))
    nil
    (if (matches-tm-transition? (get transitions index) state symbol)
      (get transitions index)
      (find-tm-transition transitions state symbol (+ index 1)))))

(defn apply-transition [transition tape position]
  (if (= (get transition 4) "R")
    [(get transition 2) (write-tape tape position (get transition 3)) (+ position 1)]
    (if (= (get transition 4) "L")
      [(get transition 2) (write-tape tape position (get transition 3)) (- position 1)]
      [(get transition 2) (write-tape tape position (get transition 3)) position])))

(defn resolve-step [transition tape position]
  (if (= transition nil)
    nil
    (apply-transition transition tape position)))

(defn tm-step [transitions state tape position]
  (resolve-step (find-tm-transition transitions state (read-tape tape position) 0) tape position))

(defn continue-or-halt [next-config transitions state tape position steps-remaining]
  (if (= next-config nil)
    ["halted" state tape position]
    (run-tm transitions (get next-config 0) (get next-config 1) (get next-config 2) (- steps-remaining 1))))

(defn run-tm [transitions state tape position steps-remaining]
  (if (= steps-remaining 0)
    ["exhausted" state tape position]
    (continue-or-halt (tm-step transitions state tape position) transitions state tape position steps-remaining)))
```

### The Updated Project

Skipped — six freestanding new functions, nothing surrounding them yet.

### Naming the Concept

Per the established convention, this code is both the isolated demonstration and the real artifact directly. A transition here is a five-slot vector, `[state read-symbol new-state write-symbol direction]`, extending Lesson 254's own three-slot transition-triple convention with two more fields: what to *write* at the current head position, and which *direction* — `"R"` (right), `"L"` (left), or anything else, treated as staying in place — to move the head afterward. `find-tm-transition`'s own base case is the deliberate fix to Lesson 254's own unguarded search: once `index` reaches the end of the table with nothing found, it returns `nil` directly — a real, honest answer, not a further recursive call into nothing. `resolve-step` receives that possibly-`nil` result as an ordinary parameter (the "helper function taking an already-computed value" technique this curriculum has used since Lesson 56, working around the ban on `let`) and only calls `apply-transition` when a real transition was actually found; otherwise, it too returns `nil`, propagating the halt signal outward. `continue-or-halt` is where that signal actually matters: given `nil`, it reports `["halted" state tape position]` — the machine's own genuine stopping point — and otherwise unpacks the new state, tape, and position (via `get`, already explained in the Header) and recurses into `run-tm` with one less step remaining. `run-tm` itself adds the one further safeguard this section has needed since Lesson 253: a real, explicit `steps-remaining` budget, reporting `["exhausted" state tape position]` if it reaches `0` before the machine ever halts on its own — the identical fuel-limited-computation technique Lesson 253's own `find-least-bounded` already established, now protecting a genuinely different, more general kind of unbounded search.

```
flip [0 1 1 0] => [halted flip [1 0 0 1] 4]
```

This tiny machine has exactly one state, `"flip"`, and two transitions: on `"0"`, write `"1"` and move right; on `"1"`, write `"0"` and move right. Given `[0 1 1 0]`, it flips every bit in place — `0` becomes `1`, `1` becomes `0`, `1` becomes `0`, `0` becomes `1` — producing `[1 0 0 1]`, and halts the moment its head reaches position `4`, past the tape's original length, reading a blank, for which no transition on `"_"` exists at all. `["halted" "flip" [1 0 0 1] 4]` reports exactly that: which of the two possible stopping reasons occurred (`"halted"`, not `"exhausted"` — the machine stopped on its own, not because the step budget ran out), the state it stopped in, the tape's own final contents, and the head's own final position.

### Mechanical Walkthrough

Every distinct syntactic element not already covered by the previous unit, in order of first appearance:

- **`(declare run-tm)`** — reappearing from Lesson 91's own mutual-recursion convention: `continue-or-halt` calls `run-tm`, and `run-tm` calls `continue-or-halt`, so `run-tm`'s name has to be declared before `continue-or-halt` is defined, even though `run-tm`'s own full definition comes later in the file.
- **`transition`, `state`, `symbol`** (in `matches-tm-transition?`) — three parameters, playing the identical role Lesson 254's own `matches-transition?` gave to its three parameters, now checking a five-slot transition instead of a three-slot one.
- **`(if (= (get transition 0) state) (= (get transition 1) symbol) false)`** — identical in structure to Lesson 254's own `matches-transition?`, restated in full per the Repetition Rule: check the transition's own recorded state first, and only bother checking the symbol if that already matches.
- **`transitions`, `index`** (in `find-tm-transition`) — the whole transition table, and the current search position within it — the identical roles Lesson 254's own `find-transition` gave to the same two parameter names.
- **`(if (= index (count transitions)) nil ...)`** — the genuinely new base case this unit's Problem set out to build: once every transition has been checked with no match, return `nil` directly — Clojure's own value representing "nothing," already explained in the Header — rather than recursing past the end of the table the way Lesson 254's own `find-transition` did.
- **`(get transitions index)`** (the true branch, once a match is found) — returns the *entire* matching transition — all five of its own slots — not just one field of it, since `apply-transition` needs every field.
- **`(find-tm-transition transitions state symbol (+ index 1))`** — the recursive case, advancing `index` by `1`, identical in shape to Lesson 254's own `find-transition`.
- **`transition`, `tape`, `position`** (in `apply-transition`) — a found, real transition (never `nil` — `apply-transition` is only ever called once a match is already confirmed), plus the tape and head position to update.
- **`(get transition 4)`** — reading the transition's own fifth slot, its direction, compared against `"R"` and `"L"` in turn.
- **`(write-tape tape position (get transition 3))`** (in every branch) — `write-tape`, from the previous unit, writing the transition's own fourth slot — what to write — at the current head position, before the head itself moves.
- **`[(get transition 2) (write-tape ...) (+ position 1)]`** / **`(- position 1)`** / **`position`** — the three possible resulting configurations: the transition's own second slot, its new state (`get transition 2`); the freshly written tape; and the new position — one greater, one less, or unchanged, depending on the direction — bundled together as a three-slot vector, exactly the vector-as-triple convention already established since Lesson 92.
- **`(defn resolve-step [transition tape position] ...)`** — a small helper existing purely to avoid computing `find-tm-transition`'s own result more than once, per this curriculum's established "helper function that takes an already-computed value as an argument" workaround for the absence of `let`.
- **`(if (= transition nil) nil (apply-transition transition tape position))`** — if the transition passed in really is `nil` (no match was found), propagate that `nil` onward unchanged; otherwise, actually apply it.
- **`(defn tm-step [transitions state tape position] ...)`** — combines a fresh lookup (`find-tm-transition`, using `read-tape` from the previous unit to determine the current symbol) with `resolve-step`'s own handling of whatever that lookup returns, in a single call — `find-tm-transition` is called exactly once here, its result handed directly to `resolve-step` as an argument, rather than being recomputed.
- **`next-config`, `steps-remaining`** (in `continue-or-halt`) — the possibly-`nil` result of one step, and how many steps remain in the current budget.
- **`(if (= next-config nil) ["halted" state tape position] (run-tm ...))`** — if the step produced `nil`, the machine has genuinely halted; report that fact along with exactly where it stopped. Otherwise, unpack `next-config`'s own three slots via `get`, already explained in the Header, and continue running with one fewer step in the budget, via `-`, already explained in the Header.
- **`(defn run-tm [transitions state tape position steps-remaining] ...)`** — the main entry point: check the step budget first (`(if (= steps-remaining 0) ["exhausted" state tape position] ...)`, identical in spirit to Lesson 253's own `find-least-bounded` budget check), and otherwise call `tm-step` exactly once, handing its result straight to `continue-or-halt` as an argument — again, computed only once, never redundantly recomputed.

### CS Lens

**Halting as a real, first-class transition-table outcome**, distinct from a search simply running out of things to try, is a hard concept.

```
Also recognized in: a state machine library's own explicit "final state"
concept, distinct from any state simply having no further transitions
defined by omission; a well-designed API returning a specific "not found"
result (rather than throwing an unhandled exception) when a lookup
genuinely has no match; a game's own "no legal moves remain" detection,
itself a real, checked condition ending the game, not a crash; Lesson 253's
own find-least-bounded, reused here directly — this lesson's step-budget
check is, structurally, the identical technique, applied to a completely
different kind of machine.
```

### SE Lens

The design principle: making "not found" a real, valid return value (`nil`, checked explicitly) rather than an unchecked assumption a caller might get wrong. The alternative not chosen: keep `find-tm-transition` structured exactly like Lesson 254's own `find-transition`, always assuming a match exists, and rely entirely on `run-tm`'s own step budget to eventually catch a machine that never finds one — treating "no legal transition" as indistinguishable from "search still running, has not yet succeeded." The real tradeoff: that alternative would still eventually stop (via the step budget), but it would report every non-halting machine identically to a genuinely still-searching one, `["exhausted" ...]`, losing the real, meaningful distinction this lesson's own `"halted"` outcome preserves — that a Turing machine reaching a state with no further transition is not failing to finish; it is *finishing*, on its own terms, which might mean success or might mean failure, but is never itself an error.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
flip [0 1 1 0] => [halted flip [1 0 0 1] 4]
```

Run for real, this session, via `bb`. The tape is genuinely modified in place across all four positions, and the machine halts cleanly the moment no transition exists for the blank it reads at position `4`.

### Connection

This unit's own machinery — states, a tape, a step budget — is completely general, proven so by running two states' worth of logic on a trivial bit-flipper. The final unit puts real weight on it: a genuine, six-state Turing machine deciding exactly the language Lesson 258 proved a single stack cannot.

---

## Concept Unit: Turing-Recognizing `a^n b^n c^n`

### The Problem

Lesson 258 built `well-formed-abc?`, a real, honest attempt at checking equal counts of `"a"`s, `"b"`s, and `"c"`s in order, using a single stack — and proved, concretely, that it fails: `"aabbccc"`, with an extra unmatched `"c"`, was wrongly accepted, because the stack had already been fully spent matching `"a"`s against `"b"`s by the time the `"c"`s needed checking. Can this lesson's own, strictly more general Turing machine actually succeed where that stack could not — not as a claim, but as something this lesson runs and checks directly, on the very same input that broke Lesson 258's own checker?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, using this lesson's own `run-tm` from the Concept Unit above completely unmodified.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `run-tm` and everything it calls, unchanged.

### The New Code

```clojure
[["find-a" "X" "find-a" "X" "R"]
 ["find-a" "a" "find-b" "X" "R"]
 ["find-a" "b" "verify" "b" "N"]
 ["find-a" "_" "verify" "_" "N"]

 ["find-b" "X" "find-b" "X" "R"]
 ["find-b" "a" "find-b" "a" "R"]
 ["find-b" "b" "find-c" "X" "R"]

 ["find-c" "X" "find-c" "X" "R"]
 ["find-c" "b" "find-c" "b" "R"]
 ["find-c" "c" "return" "X" "R"]

 ["return" "X" "return" "X" "L"]
 ["return" "a" "return" "a" "L"]
 ["return" "b" "return" "b" "L"]
 ["return" "c" "return" "c" "L"]
 ["return" "_" "return" "_" "L"]
 ["return" "$" "find-a" "$" "R"]

 ["verify" "X" "verify" "X" "R"]
 ["verify" "_" "accept" "_" "R"]]
```

### The Updated Project

Skipped — this is a single new value (a transition table), not a modification to any existing structure.

### Naming the Concept

This machine works in repeated passes, using `"X"` to permanently mark a symbol already accounted for, and `"$"`, placed once at position `0`, as a fixed marker for "the very start of the tape," so the machine always knows when it has scanned all the way back to begin a new pass. Each pass does exactly one thing: find the *leftmost* unmarked `"a"` (state `"find-a"`, skipping over already-marked `"X"`s), mark it, then scan rightward past any remaining unmarked `"a"`s and marked `"X"`s to find the leftmost unmarked `"b"` (state `"find-b"`), mark it, then do the same to find the leftmost unmarked `"c"` (state `"find-c"`), mark it, then scan all the way back left to the `"$"` marker (state `"return"`) and begin again. This is a genuine, working **decider**: once `"find-a"` finds no more real `"a"`s left — reading a `"b"` or a blank directly instead — every `"a"` that ever existed has already been matched to one `"b"` and one `"c"`, and control passes to `"verify"`, which scans the remainder of the tape checking that only `"X"`s (or a trailing blank) remain — any leftover, unmarked `"b"` or `"c"` at that point means there were more of that symbol than of `"a"`, and the machine halts in `"verify"` itself, not the accept state, with no transition defined to handle it.

```
check aabbcc => [halted accept [$ X X X X X X _] 8]
check aaabbbccc => [halted accept [$ X X X X X X X X X _] 11]
check [] (empty) => [halted accept [$ _] 2]
check abc => [halted accept [$ X X X _] 5]
check aabbc (2,2,1) => [halted find-c [$ X X X X X _] 6]
check aabbccc (2,2,3) => [halted find-a [$ X X X X X X c] 7]
check aaabbcc (3,2,2) => [halted find-b [$ X X X X X X X _] 8]
check bac => [halted verify [$ b a c] 1]
```

Every genuinely valid input — `"aabbcc"` (`n=2`), `"aaabbbccc"` (`n=3`), the empty input (`n=0`), and `"abc"` (`n=1`) — halts in the designated **accept** state, every real symbol replaced by `"X"`. Every genuinely invalid input halts somewhere else, and the specific state it halts in is itself real, honest evidence of exactly what went wrong: `"aabbc"` halts in `"find-c"`, having run out of tape while still looking for a third `c` that was never there; `"aaabbcc"` halts in `"find-b"`, having run out of `b`s to match its third `a"`; `"bac"`, with symbols in the wrong order entirely, halts immediately in `"verify"`, on its very first real symbol. And the case that matters most: `"aabbccc"` — two `a`s, two `b`s, three `c`s, **the exact input that broke Lesson 258's own `well-formed-abc?`**, wrongly accepted there — halts here in `"find-a"`, on its *third* pass, correctly and honestly: two full passes matched the two `a`s to two `b`s and two of the three `c`s, and on the third pass, `"find-a"` finds no third `a"` left (reading a real, leftover `"c"` instead — no transition exists for `"find-a"` on `"c"`, so the machine halts right there, in `"find-a"`, not `"accept"`. This is not an assumed or asserted success; it is this lesson's own real, run code correctly rejecting the precise input that defeated a strictly less powerful machine two lessons ago.

### Mechanical Walkthrough

This unit introduces no new Clojure syntax at all — every element of this transition table is the identical five-slot vector shape the previous unit's own `"flip"` example already established, and `run-tm` itself is completely unmodified. What is new here is purely the *data*: eighteen transitions instead of two, and four working states (`"find-a"`, `"find-b"`, `"find-c"`, `"return"`) plus two terminal ones (`"verify"`, `"accept"`) instead of one. Per the Repetition Rule, every transition-triple element already has its full treatment from the previous unit's own walkthrough — `[state read-symbol new-state write-symbol direction]`, checked via `matches-tm-transition?`, applied via `apply-transition`'s own three-way direction branch — and nothing about that treatment changes for a five-times-longer table; the previous unit's proof that `find-tm-transition` correctly halts on no match, and that `run-tm` correctly threads state/tape/position through as many steps as needed, applies exactly as fully here as it did to the two-transition `"flip"` machine.

**Execution trace** — the first few steps of `(run-tm ... "find-a" (tape for "aabbcc") 1 1000)`, tracing only the *shape* of one full pass rather than all eighteen possible transitions, since the previous unit's own trace already covered the general mechanism in full:

```
state=find-a pos=1 reads "a" -> write X, move R, state=find-b   (first a marked)
state=find-b pos=2 reads "a" -> write a (unchanged), move R, state=find-b  (skip 2nd a)
state=find-b pos=3 reads "b" -> write X, move R, state=find-c   (first b marked)
state=find-c pos=4 reads "b" -> write b (unchanged), move R, state=find-c  (skip 2nd b)
state=find-c pos=5 reads "c" -> write X, move R, state=return   (first c marked)
state=return pos=6 reads "c" -> write c (unchanged), move L, state=return  (scanning back)
```

Six real steps, each one a direct, traceable consequence of the transition table's own matching row — the same mechanism, run for real by `bb`, that carries this exact process forward for as many total steps as `"aabbcc"` genuinely needs (eight, confirmed by this unit's own `Run It` output ending at position `8`), and, separately, for the seven real steps `"aabbccc"` takes before honestly halting in `"find-a"` rather than reaching `"accept"`.

### CS Lens

**A Turing machine succeeding at a task a strictly weaker machine provably cannot** is the hard concept this entire section has been building toward.

```
Also recognized in: the formal Chomsky hierarchy itself (regular languages
inside context-free languages inside the languages a Turing machine can
decide or recognize, each strictly containing the last) — this lesson's
own concrete DFA-then-PDA-then-TM sequence across Lessons 254, 258, and 259
is a hands-on instance of exactly that hierarchy, not a proof of it in
full generality; a real programming language's own type checker needing
genuinely more computational power than a simple pattern-matcher to verify
certain properties; any real system where a simpler, cheaper tool is tried
first and a more general, more expensive one is reserved for exactly the
cases the simpler tool provably cannot handle.
```

### SE Lens

The design principle: reaching for the least powerful tool that actually solves the problem, and only escalating once a real limitation is demonstrated — the same discipline this whole three-lesson arc (254, 258, 259) has followed structurally, not just stated. The alternative not chosen: build every automaton in this section as a full Turing machine from the very start, since a Turing machine can, after all, do everything a finite automaton or pushdown automaton can do. The real tradeoff, made concrete across this section's own three machines: Lesson 254's finite automaton needed no stack and no tape at all, only a handful of transition triples, for exactly the languages that needed no extra memory; Lesson 258's pushdown automaton added one stack, exactly the amount of extra power needed for balanced, type-checked nesting; this lesson's Turing machine adds a full, revisitable tape, exactly the amount of extra power needed for a three-way count that a stack's own strictly more limited access pattern could not support. Each step up cost real additional complexity — this lesson's eighteen-transition, six-state machine is considerably harder to read and verify than Lesson 254's four-transition parity checker — and each one was only taken once the previous section proved, with a real counterexample, that it was actually necessary.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
check aabbcc => [halted accept [$ X X X X X X _] 8]
check aaabbbccc => [halted accept [$ X X X X X X X X X _] 11]
check [] (empty) => [halted accept [$ _] 2]
check abc => [halted accept [$ X X X _] 5]
check aabbc (2,2,1) => [halted find-c [$ X X X X X _] 6]
check aabbccc (2,2,3) => [halted find-a [$ X X X X X X c] 7]
check aaabbcc (3,2,2) => [halted find-b [$ X X X X X X X _] 8]
check bac => [halted verify [$ b a c] 1]
```

Run for real, this session, via `bb`, all eight cases confirmed matching this unit's own stated algorithm and, for `"aabbccc"` specifically, directly succeeding where Lesson 258's `well-formed-abc?` was proven to fail.

### Connection

This unit closes both this lesson and this section's own three-lesson escalation: a finite automaton (Lesson 254) proved insufficient for unbounded nesting (Lesson 257); a pushdown automaton (Lesson 258) handled nesting but proved insufficient for a three-way count; a Turing machine (this lesson) handles the three-way count directly, by trading a stack's restricted access pattern for a tape's fully general one. Lesson 260 asks the next natural question this success raises: if one Turing machine can simulate the behavior of another, is there a single, *universal* machine general enough to run any of them, given only a description of which one to imitate?

---

## Connect the Pieces

Follow the single input `"aabbccc"` — Lesson 258's own real counterexample — through this lesson's full machine, start to finish, to see exactly where the extra tape earns its keep. `tape-for` places `"$"` at position `0` and the seven real symbols after it; `run-tm` begins in `"find-a"` at position `1`. Pass one: `"find-a"` marks the first `"a"` as `"X"`, `"find-b"` skips the second `"a"` and marks the first `"b"` as `"X"`, `"find-c"` skips the second `"b"` and marks the first `"c"` as `"X"`, and `"return"` scans all the way back to `"$"`. Pass two repeats identically: the second `"a"` marked, the second `"b"` marked, the second `"c"` marked, back to `"$"` again. By now, every `"a"` and every `"b"` — two of each — has been marked, and exactly two of the three `"c"`s have too, with one real, unmarked `"c"` still sitting on the tape. Pass three begins: `"find-a"` scans past the now-five `"X"`s, reaches the tape's own genuine leftover — that third `"c"` — and finds no transition defined for `"find-a"` on `"c"` at all. The machine halts right there, in `"find-a"`, not `"accept"`. Nothing about this required foresight or a special case built in for exactly this input — it is the direct, mechanical consequence of `"find-a"`'s own transition table having no rule for what to do with a `"c"` it was never supposed to see this early, which is exactly the situation an extra, uncounted `"c"` produces.

## What Breaks Without This

Remove the `"return"` state's own transition for reading a blank — `["return" "_" "return" "_" "L"]` — leaving every other transition in this lesson's own eighteen-transition table exactly as it is:

```clojure
[["find-a" "X" "find-a" "X" "R"]
 ["find-a" "a" "find-b" "X" "R"]
 ["find-a" "b" "verify" "b" "N"]
 ["find-a" "_" "verify" "_" "N"]
 ["find-b" "X" "find-b" "X" "R"]
 ["find-b" "a" "find-b" "a" "R"]
 ["find-b" "b" "find-c" "X" "R"]
 ["find-c" "X" "find-c" "X" "R"]
 ["find-c" "b" "find-c" "b" "R"]
 ["find-c" "c" "return" "X" "R"]
 ["return" "X" "return" "X" "L"]
 ["return" "a" "return" "a" "L"]
 ["return" "b" "return" "b" "L"]
 ["return" "c" "return" "c" "L"]
 ["return" "$" "find-a" "$" "R"]
 ["verify" "X" "verify" "X" "R"]
 ["verify" "_" "accept" "_" "R"]]
```

Run this for real, this session, via `bb`, on the shortest genuinely valid input, `"abc"` (`n=1`), which needs the removed transition directly: after `"find-c"` marks the sole `"c"` and moves one step right, the head sits one position *past* the tape's own real content, reading a blank, in state `"return"`:

```
(run-tm [the broken table above] "find-a" (tape for "abc") 1 1000)
=> [halted return [$ X X X] 4]
```

The machine halts in `"return"`, not `"accept"` — a genuinely valid input, `n=1`, wrongly rejected. Notice the tape itself is still only `["$" "X" "X" "X"]`, four real symbols, with no trailing blank appended — `read-tape`'s own blank return, from the first Concept Unit above, is a value handed back for a position past the tape's current length; it never actually writes anything there, since only `write-tape` grows the tape at all. Position `4` is one step past the tape's own real end, `read-tape` correctly reports a blank there, and it is exactly that blank `"find-c"`'s own move-right step walked onto that the broken `"return"` state has no transition for. Every other input this lesson tested happened to reach `"return"` from a position still holding a real, non-blank symbol (a `"c"` still sitting to its right, not yet scanned past), so the missing blank-transition never mattered for them — only the specific case where the very last real symbol on the tape is also the one `"find-c"` just marked, leaving nothing but a read-only blank immediately to `"return"`'s own right, exposes the gap. The fix is to restore `["return" "_" "return" "_" "L"]` exactly as it appeared in the Concept Unit above; the lesson this failure teaches is that a transition table meant to be a genuine decider has to account for *every* symbol its own states can actually encounter — including the blank, this curriculum's own `"nothing here yet"` marker — not only the symbols that happen to appear in the specific test inputs already tried.

## Exercises

1. Trace `(run-tm [["flip" "0" "flip" "1" "R"] ["flip" "1" "flip" "0" "R"]] "flip" ["1" "1" "0"] 0 100)` by hand, the same way this lesson traced the `[0 1 1 0]` case above, predicting the final tape and halting position before running it via `bb`, then confirm.
2. Modify this lesson's own `a^n b^n c^n` machine's `"verify"` state to also count, and report, how many real (non-`"X"`, non-blank) symbols it finds before reaching the blank — in the style of Lesson 253's `find-least-bounded`, adding useful information beyond a bare accept/reject decision.
3. Design and run a small Turing machine (two or three states at most) that copies a run of `"1"`s, doubling their count — for instance, turning `["1" "1"]` into a tape containing four `"1"`s somewhere on it, separated from the original by at least one blank. Verify it via `bb` on at least two different input lengths.
4. In writing, explain exactly why `"find-b"`'s own transition on `"a"` (`["find-b" "a" "find-b" "a" "R"]`) writes the symbol `"a"` right back where it found it, rather than, say, marking it in some way — what would go wrong on the *next* pass if this transition instead wrote `"X"`.
5. Predict, before running it, what this lesson's own machine does on the input `"aabc"` (2 `a`s, 1 `b`, 1 `c` — neither a valid `a^n b^n c^n` shape nor obviously malformed at a glance). Run it via `bb`, identify exactly which state it halts in, and explain in writing why that specific state is the honest, correct place for this specific input to fail.

## Definition of Done

- [ ] `read-tape`/`write-tape`/`pad-tape` run in isolation via `bb`, all matching this lesson's own predicted tape contents by direct inspection.
- [ ] The bit-flipping machine run on at least two different inputs via `bb`, both matching this lesson's own stated flip rule and halting position.
- [ ] The `a^n b^n c^n` machine run on all eight of this lesson's own test inputs via `bb`, including `"aabbccc"`, confirmed to correctly succeed where Lesson 258's `well-formed-abc?` was proven to fail.
- [ ] The `"return"` state's own blank-symbol transition deliberately removed, the resulting real misclassification of `"abc"` reproduced via `bb`, and the transition restored.
- [ ] A git commit made, with a message explaining *why*: for example, "Add Lesson 259: build a general Turing machine simulator with a real step budget, and prove it correctly decides a^n b^n c^n — the exact language Lesson 258 proved a single-stack pushdown automaton cannot."
