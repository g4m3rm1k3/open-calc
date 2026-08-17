# Lesson 254: Finite Automata

**What you will build** — A real, four-function Clojure implementation of a deterministic finite automaton: transitions represented as literal data, a function that computes the transition function by searching that data, a function that runs an automaton over a whole input one symbol at a time, and a function that decides acceptance. You will use it to recognize exactly the binary sequences containing an even number of `1`s — nothing hand-coded as a chain of `if`s, only data a program reads and runs. The transferable problem: how do you represent "a machine that reacts to input, one piece at a time, using only a fixed, finite amount of memory" as literal data your own code can inspect and run, rather than as control flow baked permanently into the language's own syntax?

**What you need to know first** — Lesson 253's own vocabulary: **computable function**, **halt**, **unbounded search**, and the real, uncaught `java.lang.StackOverflowError` that vocabulary produced for real — this lesson's own transition search reopens that exact failure mode on purpose, in a new setting. Lesson 20's recursive functions and Lesson 22's base-case-and-progress termination argument. Lesson 84's vector indexing via `get` — the point at which this curriculum's own vectors became usable as fixed-position, directly addressable storage, not just front-to-back sequences. This curriculum's own vector-as-pair and vector-as-triple convention (Lessons 85, 87, 88 for pairs; Lesson 92's `make-bst-node` for a three-slot record), reused here as a three-slot transition record.

**Terms used in this lesson**

- **finite automaton** — a machine model with a finite, fixed set of states, a finite set of input symbols it can read, and a rule for moving from one state to another based on the symbol currently being read. "Finite" is the entire point: no matter how long the input, the machine itself never needs more than a fixed, bounded amount of memory to run — unlike, say, `find-least-bounded` from Lesson 253, whose `budget` could in principle be any size.
- **state** — one of the machine's finitely many possible "modes" at any instant; the *only* thing the machine remembers between one input symbol and the next. Everything about a finite automaton's behavior is determined by its current state and the symbol it is currently reading — nothing else.
- **alphabet / input symbol** — the finite set of distinct values the automaton can read, one at a time; an "input" to the automaton is a finite sequence of these. This lesson's alphabet is exactly two values, the numbers `0` and `1`.
- **transition (the transition function, δ)** — the rule, for every state and every input symbol, saying exactly which state to move to next. Classically written `δ(state, symbol) = next-state`; this lesson represents it as literal, inspectable data rather than as hidden logic.
- **deterministic** — for every state and every input symbol, there is exactly one transition — never zero, never more than one. This is what makes "the next state" a well-defined question with one right answer, rather than a choice or an ambiguity.
- **start state** — the one state the automaton is in before it has read any input at all.
- **accept state (final state)** — one of a designated subset of states; if the automaton is in one of these states after reading an entire input, that input is accepted. Every other state, after a full input, means the input is rejected.
- **run (configuration sequence)** — the actual, concrete sequence of states an automaton passes through while consuming one specific input, start state first, one state per symbol read.
- **language (of an automaton)** — the set of every input sequence that automaton accepts. Lesson 255 (Regular Languages) picks this term up directly and gives it its own full treatment as this section's next subject.

**Objects and methods used**

- **`get`**
  - *What it is:* A Clojure function for retrieving a value out of an indexable collection.
  - *Implementation:* `(get collection key)` returns the value stored at `key`; for a vector, `key` is a zero-based integer position. If the position does not exist, `get` returns `nil` rather than raising an error — a fact this lesson's own "What Breaks Without This" section below depends on directly.
  - *Its use:* Every transition triple in this lesson is a three-slot vector, and every field of it — the from-state, the symbol, the to-state — is read out with `get`.
- **`count`**
  - *What it is:* A Clojure function that reports how many elements a collection holds.
  - *Implementation:* `(count collection)` returns a single integer, the number of elements currently in the collection; for a vector, this is its length.
  - *Its use:* This lesson's input-running loop needs to know when it has consumed the entire input sequence, and its acceptance check needs to know when it has searched the entire accept-state list without success; both ask `count` directly rather than guessing or hard-coding a length.
- **`=`, `+`, `if`, `defn`, `println`**
  - *What they are:* Reappearing from Lesson 253 in full: `=` tests value equality and returns a boolean; `+` is Clojure's addition function, called in prefix position like any other function; `if` is the conditional special form, evaluating exactly one of its two branches based on a test; `defn` binds a name to a function with a declared parameter list; `println` prints its arguments' human-readable form followed by a newline.
  - *Their use here:* `=` drives every base-case and match check in this lesson's four functions; `+` advances a search index by one; `if` separates every base case from every recursive case; `defn` names all four of this lesson's functions; `println` shows every one of this lesson's real, run results below.

---

## Concept Unit: Finite Automata as Data

### The Problem

Every state machine this curriculum has built so far — the register machine's fetch/decode/execute cycle back in Section IX, the process scheduler in Section X — was written as ordinary Clojure functions, with the machine's actual behavior baked directly into `if`/`cond` branches in the source code. That works, but it means changing what the machine does requires editing and re-running the program itself. A finite automaton's whole classical definition, by contrast, treats the machine's behavior as separable from the code that runs it: a finite set of states, a finite alphabet, and a transition rule are just *facts* about a particular machine — facts that could, in principle, be written down, handed to someone else, or fed to a different program entirely. Before this lesson can run an automaton or ask what it accepts, it needs a concrete way to write those facts down as literal, inspectable Clojure data.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing Section XII's fresh start from Lesson 253.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn matches-transition? [transition from-state input-symbol]
  (if (= (get transition 0) from-state)
    (= (get transition 1) input-symbol)
    false))
```

### The Updated Project

Skipped — a freestanding new function, nothing surrounding it yet.

### Naming the Concept

Per the Section VI+ convention already established across this curriculum, this code is both the isolated demonstration and the real artifact directly — there is no separate throwaway version. A single **transition** is represented here as a three-slot vector: `[from-state input-symbol to-state]` — for example, `["even" 0 "even"]` means "while in state `even`, reading symbol `0`, move to state `even`," and `["even" 1 "odd"]` means "while in state `even`, reading symbol `1`, move to state `odd`." This is exactly the vector-as-triple convention already established by Lesson 92's `make-bst-node`, applied here to a completely different kind of three-part record.

`matches-transition?` checks whether one specific transition triple is the *right* one to use for a given state and symbol — whether its own recorded `from-state` and `input-symbol` match the ones being asked about right now:

```
find-transition even,0 => even
```

That single line (produced by the next Concept Unit's code, shown here because `matches-transition?` alone has no useful printable result on its own — it is a predicate, meant to be used inside a search, not run standalone) is the proof this predicate correctly identifies a matching transition; the next unit builds the search that actually uses it.

### Mechanical Walkthrough

Every distinct syntactic element in `matches-transition?`, in order:

- **`(defn matches-transition? [transition from-state input-symbol] ...)`** — `defn`, already fully explained in the Header, binding the name `matches-transition?` to a function taking three parameters.
- **`transition`** — a name bound, for the duration of one call, to a single transition triple — a three-element vector such as `["even" 0 "even"]`. This is ordinary parameter binding, reappearing from Lesson 3.
- **`from-state`, `input-symbol`** — two more parameters, bound respectively to the state and symbol this call is asking "does this transition apply here?" about.
- **`(if (= (get transition 0) from-state) ... false)`** — the outer `if`, already fully explained in the Header: it evaluates its test, then evaluates and returns only the matching branch.
- **`(get transition 0)`** — a call to `get`, already explained in the Header: reads the element at index `0` of the `transition` vector — its recorded from-state.
- **`(= (get transition 0) from-state)`** — a call to `=`, already explained in the Header: compares the transition's own recorded from-state against the `from-state` this call was asked about.
- **`(= (get transition 1) input-symbol)`** (the true branch) — the same pattern, one index over: `(get transition 1)` reads the transition's recorded input symbol, and `=` compares it against `input-symbol`. This is only reached at all when the from-states already matched — meaning `matches-transition?` only bothers checking the symbol once the state half of the question has already been answered "yes."
- **`false`** (the else branch) — a literal boolean, returned directly the moment the from-state comparison fails, without ever bothering to check the symbol at all. This is a real short-circuit, not just a stylistic choice: if the state doesn't match, the symbol comparison would be irrelevant regardless of its own answer.

### CS Lens

**Finite automaton**, **state**, and **transition** are hard concepts, foundational to the rest of Section XII.

```
Also recognized in: a traffic light's fixed red/yellow/green cycle; a vending
machine's coin-counting logic before it dispenses; a garage-door opener's
open/opening/closed/closing states; a TCP connection's own handshake states
(SYN-SENT, ESTABLISHED, FIN-WAIT); a text editor's own modal states (insert
mode versus command mode) reacting to the exact same keystroke differently
depending on which state it is currently in.
```

The thread through every one of these: a small, fixed set of "modes," and a rule saying exactly which mode comes next given the current mode and what just happened.

### SE Lens

The design principle: representing behavior as data (a transition table) rather than as control flow (a chain of `if`s hard-coded into a function) — a real, general software-engineering tradeoff usually called "data-driven design." The alternative not chosen here: write one big function with an `if`/`cond` branch for every state, directly encoding "if in state `even` and reading `0`, become `even`; if in state `even` and reading `1`, become `odd`; ..." That version would run identically for this one automaton, and would be marginally simpler to write for exactly this single example. The real tradeoff: a data-driven transition table can be built at runtime, generated by another program, saved to a file, or swapped for a completely different automaton without touching a single line of the code that *runs* it — the four functions this lesson builds will run any deterministic finite automaton whose transitions fit this same three-slot shape, not just the one this lesson happens to demonstrate. A hard-coded `if`-chain version could never do that; every new automaton would mean editing and re-testing the runner itself.

### Commands Needed

`bb <path-to-file>.clj`, exactly as established since Section VI and reused throughout Lesson 253.

### Run It

`matches-transition?` alone produces no independently interesting output — it is a predicate consumed by the next unit's search, not called at the top level by itself. Its correctness is verified indirectly, through `find-transition`'s own real output in the next unit, which could not be correct if this predicate were wrong.

### Connection

A transition, on its own, is just three inert values sitting in a vector — data with no behavior. The next unit builds the actual **transition function**: given a state and a symbol, ask "which one of these transitions, if any, applies right now?"

---

## Concept Unit: The Transition Function via Search

### The Problem

A real automaton typically has more than one transition — this lesson's own running example needs four (two states, times two symbols each). Given a current state and the symbol currently being read, how does the automaton actually decide which single transition, out of the whole table, is the one to follow?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing this lesson's own fresh start.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `matches-transition?` from the Concept Unit above.

### The New Code

```clojure
(defn find-transition [transitions from-state input-symbol index]
  (if (matches-transition? (get transitions index) from-state input-symbol)
    (get (get transitions index) 2)
    (find-transition transitions from-state input-symbol (+ index 1))))
```

### The Updated Project

Skipped — a freestanding new function, nothing surrounding it yet.

### Naming the Concept

Again, this code is both the isolated demonstration and the real artifact directly, per the established Section VI+ convention. `find-transition` searches a whole table of transitions, one at a time starting from `index`, using `matches-transition?` from the unit above to test each one, until it finds the transition that applies — then returns that transition's own recorded destination state. This is the concrete, running implementation of the **transition function (δ)** — the same idea, computed by literal search rather than looked up from an abstract table on paper.

```
find-transition even,0 => even
find-transition even,1 => odd
find-transition odd,1 => even
```

Given the full four-transition table for this lesson's running example — `[["even" 0 "even"] ["even" 1 "odd"] ["odd" 0 "odd"] ["odd" 1 "even"]]` — `find-transition` correctly locates the one matching transition for each state/symbol pair asked about, regardless of where in the table it happens to sit: the first entry, the second, or the fourth.

### Mechanical Walkthrough

New elements not already covered above:

- **`transitions`** — a parameter bound to the *whole* transition table: a vector of transition triples, not a single one.
- **`index`** — a parameter tracking which position in `transitions` this particular call is currently checking; it starts at `0` (the first call to `find-transition` is always given `0` explicitly, as shown in every call above) and grows by exactly `1` on every recursive call that does not find a match.
- **`(matches-transition? (get transitions index) from-state input-symbol)`** — a call to `matches-transition?` from the unit above, given `(get transitions index)` — the single transition triple currently sitting at position `index` — plus the state and symbol being searched for. This is where the concept from the previous unit is actually put to use, not just defined.
- **`(get (get transitions index) 2)`** (the true branch) — two nested calls to `get`: the inner one retrieves the matching transition triple at `index` (the same value `matches-transition?` was just given), and the outer one reads index `2` of *that* triple — its recorded destination state. This is the actual answer `find-transition` exists to compute.
- **`(find-transition transitions from-state input-symbol (+ index 1))`** (the else branch) — the recursive case: if the transition at the current `index` did not match, try the next one, via `+`, already explained in the Header, advancing `index` by exactly `1`.

**Execution trace** — `(find-transition [["even" 0 "even"] ["even" 1 "odd"] ["odd" 0 "odd"] ["odd" 1 "even"]] "odd" 1 0)`, matching this lesson's own third `Run It` line above:

```
Call index=0: transition ["even" 0 "even"], matches-transition? "odd" -> from-state "even" <> "odd" -> false -> recurse index=1
Call index=1: transition ["even" 1 "odd"],  matches-transition? "odd" -> from-state "even" <> "odd" -> false -> recurse index=2
Call index=2: transition ["odd" 0 "odd"],   matches-transition? "odd" -> from-state matches, symbol 0 <> 1 -> false -> recurse index=3
Call index=3: transition ["odd" 1 "even"],  matches-transition? "odd" -> from-state matches, symbol 1 = 1  -> true  -> returns (get ["odd" 1 "even"] 2) = "even"
```

Four candidate transitions checked, in table order, before the matching one at position `3` is found — this is exactly the same shape of search this curriculum built in Lesson 253's own `find-least`, applied here to a transition table instead of a growing number, and it deserves to be named directly rather than left implicit: **`find-transition` is Lesson 253's unbounded search, reused on a new kind of data.**

### CS Lens

The **transition function (δ)** is a hard concept, and this unit's real payoff is recognizing it as a specific instance of a more general idea this curriculum already has a name for.

```
Also recognized in: a routing table looking up the next hop for a packet's
destination address; a dictionary lookup finding a word's own definition; a
CPU's own branch-target lookup deciding where to jump next; a rule engine
matching the first applicable rule against a set of facts; a DNS resolver
matching a domain name against its own records.
```

### SE Lens

The design principle: `find-transition` reuses **exactly** the unbounded-search shape Lesson 253 already built, rather than inventing new search logic from nothing — the same reasoning, in the same form, applied to different data. The alternative not chosen was writing a fresh, automaton-specific lookup — perhaps hard-coding index arithmetic assuming exactly two states and two symbols. The real tradeoff: reusing the general linear-search shape costs nothing extra here and generalizes immediately to any transition table, of any size, for any automaton — but it inherits Lesson 253's own unresolved cost along with the reuse: **`find-transition` is only guaranteed to halt if the table it searches is genuinely deterministic and complete** — a matching transition really does exist for every state/symbol pair it will ever be asked about. This lesson's own transition table is complete by construction (checked by hand while designing it, above), so every call in this unit halts. Nothing in `find-transition`'s own code checks that guarantee, though, which is exactly the same honest gap Lesson 253 left open in `find-least` — this lesson's own "What Breaks Without This" section, below, reopens it for real.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
find-transition even,0 => even
find-transition even,1 => odd
find-transition odd,1 => even
```

Run for real, this session, via `bb`. All three match this lesson's own hand-designed transition table by direct inspection, and the third matches the execution trace above exactly.

### Connection

`find-transition` answers "where does one step go?" The next unit chains many single steps together, one input symbol at a time, to answer "where does the *whole* input end up?"

---

## Concept Unit: Running an Automaton Over an Input

### The Problem

A single transition moves the automaton one step. A real input is a whole sequence of symbols — how does the automaton apply `find-transition` repeatedly, once per symbol, keeping track of where it currently is, until the entire input has been consumed?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing this lesson's own fresh start.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `find-transition` from the Concept Unit above.

### The New Code

```clojure
(defn run-from [transitions state input index]
  (if (= index (count input))
    state
    (run-from transitions
              (find-transition transitions state (get input index) 0)
              input
              (+ index 1))))
```

### The Updated Project

Skipped — a freestanding new function, nothing surrounding it yet.

### Naming the Concept

Once again, this code is both the isolated demonstration and the real artifact, per the established convention. `run-from` threads a `state` value through an entire `input` sequence: at each step, it reads the next input symbol, calls `find-transition` to compute the next state, and moves on — until `index` reaches the end of `input`, at which point it reports whatever state it ended up in. This is the automaton's **run**: the concrete sequence of states it actually passes through while consuming one specific input, start to finish.

```
run-from [] => even
run-from [1] => odd
run-from [1 1] => even
run-from [0 1 0 1 1] => odd
run-from [1 1 0 1 1] => even
```

The first result — an empty input `[]` producing `even`, the state it started in unchanged — proves the base case works correctly on its own: with nothing to read, the automaton simply stays wherever it started. Every input after that shows the same starting state, `even`, ending up somewhere different depending entirely on how many `1`s that particular input actually contained: one `1` lands on `odd`; two `1`s land back on `even`; three `1`s (in `[0 1 0 1 1]`) land on `odd`; four `1`s (in `[1 1 0 1 1]`) land back on `even`. That pattern — landing on `even` exactly when the count of `1`s is even — is not a coincidence this lesson is asking you to trust; the next unit turns it into a checkable, formal acceptance decision.

### Mechanical Walkthrough

New elements not already covered above:

- **`state`** — a parameter holding the automaton's current state at this point in the run; on the very first call it is whatever start state the caller supplied, and on every later call it is whatever `find-transition` most recently computed.
- **`input`** — a parameter holding the entire input sequence to run, as a vector of symbols (numbers `0`/`1` in this lesson's own example) — unchanged across every recursive call; only `index` and `state` change as the run progresses.
- **`(if (= index (count input)) state ...)`** — the base case: `count`, already explained in the Header, reports how many symbols are in `input`; once `index` has reached that number, every symbol has been read, and the run stops, returning whatever `state` it currently holds — not `0`, not a default, but the real, current value of the parameter that has been threaded through every prior step.
- **`(find-transition transitions state (get input index) 0)`** — a call to the previous unit's `find-transition`, given the transition table, the current state, and `(get input index)` — the one symbol currently being read, retrieved via `get`, already explained in the Header, at the current `index` position. The trailing `0` is `find-transition`'s own starting search index, always `0` — every symbol lookup searches the whole transition table again, from its very first entry, exactly like every top-level call in the previous unit did.
- **`(run-from transitions ... input (+ index 1))`** — the recursive case: `run-from` calls itself, passing the *newly computed* state (the result of `find-transition`, not the old one) forward as the new `state`, along with `index` advanced by `1` via `+`, already explained in the Header.

**Execution trace** — `(run-from [["even" 0 "even"] ["even" 1 "odd"] ["odd" 0 "odd"] ["odd" 1 "even"]] "even" [1 1 0 1 1] 0)`, matching this lesson's own fifth `Run It` line above:

```
Call index=0 state=even: (get input 0)=1 -> find-transition even,1 -> odd  -> recurse index=1 state=odd
Call index=1 state=odd:  (get input 1)=1 -> find-transition odd,1  -> even -> recurse index=2 state=even
Call index=2 state=even: (get input 2)=0 -> find-transition even,0 -> even -> recurse index=3 state=even
Call index=3 state=even: (get input 3)=1 -> find-transition even,1 -> odd  -> recurse index=4 state=odd
Call index=4 state=odd:  (get input 4)=1 -> find-transition odd,1  -> even -> recurse index=5 state=even
Call index=5 state=even: (= 5 (count [1 1 0 1 1])) -> (= 5 5) -> true -> base case, returns even
```

Five symbols, five transitions applied in order, landing on `even` after all five — matching `run-from [1 1 0 1 1] => even` exactly. Each `find-transition` call inside this trace is itself the four-step search the previous unit already traced in full for one case; this trace does not re-expand each of those five searches individually, since that mechanism was already fully shown once and does not change here.

### CS Lens

**Run (configuration sequence)** is a hard concept.

```
Also recognized in: a video game character's own animation-state sequence
across a level; a build pipeline's own stage-by-stage progression (compile,
test, package, deploy); an elevator's own floor-by-floor state as it
services a sequence of requests; a parser's own state as it consumes a
token stream one token at a time (foreshadowing Lesson 257's context-free
grammars and Lesson 258's pushdown automata, both built directly on this
same "consume one input piece at a time, tracking one current state" idea).
```

### SE Lens

The design principle: separating "compute one step" (`find-transition`, previous unit) from "repeat that step across a whole input" (`run-from`, this unit) into two distinct functions, rather than writing one function that does both at once. The alternative not chosen: inline the transition search directly inside the input-consuming recursion, as one larger function. The real tradeoff: keeping them separate means `find-transition` can be tested, traced, and reasoned about completely on its own — exactly what the previous unit's execution trace did — without also having to think about input-consumption at the same time; the cost is one extra function definition and one extra function call per step, a cost this curriculum has accepted repeatedly since Lesson 91's mutual-recursion convention (`binary-search`/`search-at-mid`) specifically because it keeps each function's own responsibility singular and traceable.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
run-from [] => even
run-from [1] => odd
run-from [1 1] => even
run-from [0 1 0 1 1] => odd
run-from [1 1 0 1 1] => even
```

Run for real, this session, via `bb`. All five match the parity pattern described above and the execution trace for the fifth.

### Connection

`run-from` answers "what state does the automaton end up in?" On its own, "ending up in `odd`" or "ending up in `even`" is just a fact about a state — the next unit turns that fact into a real yes/no decision: accept, or reject.

---

## Concept Unit: Acceptance and Language Recognition

### The Problem

`run-from` reports a final state after consuming an entire input — `even` or `odd` in this lesson's own example. That state, by itself, is not yet a decision. How does an automaton turn "I ended up in this particular state" into the actual yes/no answer — accept this input, or reject it — that makes it useful for recognizing anything at all?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing this lesson's own fresh start.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `run-from` from the Concept Unit above.

### The New Code

```clojure
(defn is-accept-state? [accept-states state index]
  (if (= index (count accept-states))
    false
    (if (= (get accept-states index) state)
      true
      (is-accept-state? accept-states state (+ index 1)))))

(defn accepts? [transitions start accept-states input]
  (is-accept-state? accept-states (run-from transitions start input 0) 0))
```

### The Updated Project

Skipped — two freestanding new functions, nothing surrounding them yet.

### Naming the Concept

Per the same Section VI+ convention used throughout this lesson, this code is both the isolated demonstration and the real artifact directly. `is-accept-state?` searches a list of designated accept states — for this lesson's running example, just `["even"]`, a single-element vector — checking whether one specific state appears in it. `accepts?` combines this with the previous unit's `run-from`: run the automaton over the entire input, then check whether the state it landed on is one of the accept states. This is **acceptance**: the actual criterion that turns a finite automaton into a real yes/no decision procedure.

```
accepts? [] => true
accepts? [1] => false
accepts? [1 1] => true
accepts? [0 1 0 1 1] => false
accepts? [1 1 0 1 1] => true
```

Every one of these five results matches the previous unit's own `run-from` results exactly: whenever `run-from` landed on `even`, `accepts?` reports `true`; whenever it landed on `odd`, `accepts?` reports `false` — because `even`, and only `even`, appears in the accept-states list `["even"]` this lesson's example uses throughout. Read together, these five results are a real, checkable definition of this automaton's **language**: the set of every input sequence containing an even number of `1`s — `[]` (zero `1`s), `[1 1]` (two `1`s), `[1 1 0 1 1]` (four `1`s) accepted; `[1]` (one `1`), `[0 1 0 1 1]` (three `1`s) rejected. Lesson 255 (Regular Languages) gives this exact idea — "the set of inputs one specific automaton accepts" — its own full, formal treatment next.

### Mechanical Walkthrough

New elements not already covered above:

- **`accept-states`** — a parameter holding the vector of states that count as accepting; for this lesson's own example, always `["even"]`, though `is-accept-state?` places no restriction on how many states this vector could hold.
- **`(if (= index (count accept-states)) false ...)`** — `is-accept-state?`'s base case: once `index` has reached the length of `accept-states` (via `count`, already explained in the Header) without finding a match, the search has genuinely checked every accept state and found none equal to `state` — so the honest answer is `false`, returned directly.
- **`(if (= (get accept-states index) state) true ...)`** — the inner check: `(get accept-states index)`, already explained in the Header, reads the accept state currently being checked; `=` compares it against `state`, the value being searched for. If they match, `true` is returned immediately — this specific state really is an accept state.
- **`(is-accept-state? accept-states state (+ index 1))`** — the recursive case: if the current position didn't match, try the next one, advancing `index` by `1` via `+`, already explained in the Header. This is the identical linear-search shape `find-transition` already used two units above, applied here to a flat list of states instead of a table of transition triples — a second real instance of Lesson 253's own unbounded-search shape inside this single lesson.
- **`(defn accepts? [transitions start accept-states input] ...)`** — a second function, taking four parameters: the transition table, the start state, the accept-state list, and the input to check.
- **`(run-from transitions start input 0)`** — a call to the previous unit's `run-from`, given the transition table, the start state, the input, and `0` as the starting index — always `0`, exactly like every top-level `run-from` call in the previous unit's own `Run It` output.
- **`(is-accept-state? accept-states (run-from ...) 0)`** — `accepts?`'s entire body is one call: take whatever final state `run-from` computed, and ask `is-accept-state?` whether that one state is in `accept-states`, starting its own search at `0`.

**Execution trace** — `(accepts? [["even" 0 "even"] ["even" 1 "odd"] ["odd" 0 "odd"] ["odd" 1 "even"]] "even" ["even"] [1])`, matching this lesson's own second `Run It` line above:

```
1. (run-from ... "even" [1] 0) -- reads the single symbol 1, transitions even -> odd, returns "odd"
2. (is-accept-state? ["even"] "odd" 0) -- checks position 0: (get ["even"] 0) = "even", "even" <> "odd" -> recurse index=1
3. (is-accept-state? ["even"] "odd" 1) -- (= 1 (count ["even"])) -> (= 1 1) -> true -> base case, returns false
4. accepts? returns false
```

This trace uses the numbered-list, control-flow shape rather than the fenced `Iteration N:` shape used elsewhere in this lesson, because step 1 here is not one more step of the *same* kind of search as steps 2–3 — it is a call into an entirely different function (`run-from`, already fully traced in the previous unit), and the point of showing it as its own numbered step is exactly *when* it runs relative to the accept-state search, not a repeating value pattern.

### CS Lens

**Acceptance** and **language (of an automaton)** are hard concepts, and this unit is where Section XII's whole reason for building finite automata first actually pays off.

```
Also recognized in: a form-validation rule ultimately reducing to one
yes/no answer ("is this input well-formed") after checking many individual
fields; a spam filter's final accept/reject verdict after evaluating many
individual signals; a compiler's lexer deciding whether a sequence of
characters is a legal token; a firewall rule deciding whether to allow or
block one specific packet, based on which of its own internal states that
packet's header caused it to reach.
```

### SE Lens

The design principle: separating "what happened during the run" (`run-from`, entirely mechanical, no notion of right or wrong) from "was that outcome acceptable" (`is-accept-state?`/`accepts?`, the actual judgment) into two distinct functions. The alternative not chosen: fold the accept-state check directly into `run-from` itself, so it returns a boolean instead of a state. The real tradeoff: keeping them separate means `run-from`'s own result — the real final state, not just an accept/reject verdict — stays available for other uses this lesson doesn't need yet but a later one might (for instance, comparing two different accept-state sets against the same underlying run, without re-running the automaton at all). Folding acceptance into the run itself would make that impossible without literally running the automaton twice.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
accepts? [] => true
accepts? [1] => false
accepts? [1 1] => true
accepts? [0 1 0 1 1] => false
accepts? [1 1 0 1 1] => true
```

Run for real, this session, via `bb`. All five match this lesson's own hand-verified execution trace and the parity pattern described above.

### Connection

`accepts?` closes the arc this lesson opened: a transition (Concept Unit 1) is inert data; `find-transition` (Concept Unit 2) turns that data into a real, computable single step; `run-from` (Concept Unit 3) chains single steps into a whole run; `accepts?` (this unit) turns a completed run into the actual yes/no decision a finite automaton exists to make. Lesson 255 asks what the *set* of every input `accepts?` says `true` to actually looks like, as a mathematical object in its own right.

---

## Connect the Pieces

Follow one input, `[1 1 0 1 1]`, through every function this lesson built. It begins as four raw values passed to `accepts?`: the four-transition table, the start state `"even"`, the accept-state list `["even"]`, and the input itself. `accepts?` immediately hands the transition table, start state, and input to `run-from`, along with a starting index of `0`. `run-from` consumes the input one symbol at a time — five calls, traced in full above — and at each step calls `find-transition` with the current state and the one symbol currently being read; `find-transition`, in turn, searches the transition table using `matches-transition?` against each candidate triple until it finds the one whose recorded from-state and symbol both match, then returns that triple's own recorded destination state. After all five symbols, `run-from` returns `"even"` — the real, final state, not a boolean. `accepts?` takes that state and hands it to `is-accept-state?`, along with the accept-state list `["even"]`; `is-accept-state?` searches that one-element list, finds `"even"` at position `0` immediately, and returns `true`. `accepts?` returns that `true` directly, unchanged — the whole chain, four separate functions, one literal input, ending in the single real value `accepts? [1 1 0 1 1] => true` shown above.

## What Breaks Without This

Delete one transition from the table — `["odd" 1 "even"]`, the rule for what happens while in state `odd` reading a `1` — leaving the other three untouched:

```clojure
(run-from [["even" 0 "even"] ["even" 1 "odd"] ["odd" 0 "odd"]] "even" [1 1] 0)
```

Run for real, this session, via `bb`, on the input `[1 1]` — an input that genuinely needs the deleted transition, since after reading the first `1` the automaton is in state `odd`, and the second `1` has nowhere defined to go:

```
before call
----- Error --------------------------------------------------------------------
Type:     java.lang.StackOverflowError
Location: ...254-break.clj:9:5
```

`find-transition` (Concept Unit 2), searching this now-incomplete three-entry table for a transition matching `odd`/`1`, never finds one — because `get` on an out-of-range vector index returns `nil` rather than raising an error, so `matches-transition?` just keeps comparing `nil`'s own (nonexistent) fields against `odd`/`1`, forever finding `false`, and `find-transition` keeps recursing with `index` growing past the end of the table with no base case left to stop it. This is not a new failure mode this lesson invented — it is Lesson 253's own `find-least` on `never-satisfied?`, exactly, reached this time because the transition table stopped being **deterministic and complete** (this lesson's own SE Lens for Concept Unit 2 named this exact risk directly, before it was ever demonstrated). The fix is to restore the deleted transition — `["odd" 1 "even"]` — exactly as it appeared in every Concept Unit above; the lesson this failure teaches is that `find-transition`'s guarantee of halting was never really about the search code itself, which is correct and unchanged either way — it was always a fact about whether the *data* it searches happens to define an answer for every question it will ever be asked.

## Exercises

1. Trace `(run-from [["even" 0 "even"] ["even" 1 "odd"] ["odd" 0 "odd"] ["odd" 1 "even"]] "even" [0 0 1] 0)` by hand, the same way this lesson traced `[1 1 0 1 1]` above, predicting the final state before running it; then run it via `bb` and confirm.
2. Design a different two-state automaton, with a different transition table, that accepts exactly the binary sequences ending in `1` (the empty sequence should be rejected). Write out its transition table as a literal vector, then run it through this lesson's own `accepts?` on at least three inputs of your own choosing.
3. Add a third state to this lesson's own parity automaton — without changing what it accepts — and explain in writing why the automaton's *language* (the set of inputs it accepts) does not have to change just because its *number of states* did.
4. Modify `is-accept-state?` so that, instead of returning a single boolean, it returns which position in `accept-states` the match was found at (or a sentinel, in the style of Lesson 253's `find-least-bounded`, if none was found). Decide whether this changes anything about what `accepts?` itself needs to do with the result.
5. Predict, before running it, what `(accepts? [["even" 0 "even"] ["even" 1 "odd"] ["odd" 0 "odd"] ["odd" 1 "even"]] "even" ["odd"] [1 1 0 1 1])` returns — the same input as this lesson's own final example, but with the accept-state list changed to `["odd"]` instead of `["even"]`. Run it and confirm, then explain in one sentence what changing only the accept-state list, and nothing else about the automaton, actually changes about its language.

## Definition of Done

- [ ] `find-transition` run against this lesson's own four-entry transition table for at least three different state/symbol pairs, all matching by direct inspection of the table.
- [ ] `run-from` run on at least four different inputs, including the empty input `[]`, all matching this lesson's own parity-based prediction (even number of `1`s lands on `even`, odd number lands on `odd`).
- [ ] `accepts?` run on the same set of inputs, confirmed to agree with `run-from`'s own final states exactly as this lesson's Connect the Pieces section traces.
- [ ] The transition table deliberately made incomplete by deleting one entry, the resulting `StackOverflowError` reproduced for real via `bb`, and the entry restored.
- [ ] A git commit made, with a message explaining *why*: for example, "Add Lesson 254: represent finite automata as literal, inspectable data, and show that a deterministic transition table's completeness — not the search code itself — is what actually guarantees the automaton always finishes running."
