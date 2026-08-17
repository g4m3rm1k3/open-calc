# Lesson 260: Universal Computation

**What you will build** — A single, fixed Turing-machine interpreter, `run-tm`, and a direct, real proof that the *identical*, unmodified `run-tm` correctly simulates two genuinely different machines — one that decides whether a bit string contains an even number of `1`s, another that decides whether a bit string contains a `1` at all — purely because it is handed different *data*, never because its own source code changed. Then a way to bundle a machine's transition table together with its own input into a single, self-contained value, and the formal name for what that buys: a **Universal Turing Machine**. The transferable problem: is it possible to build one piece of machinery general enough to compute *anything* any other machine in this whole model could compute, or does every new problem genuinely require its own new machine?

**What you need to know first** — Lesson 259's Turing machine model in full: **state**, **tape**, **transition**, **halt**, and **decider**. Lesson 258's stack-vs-counter distinction, only as motivation for "one mechanism, many uses." Lesson 254's `matches-transition?`/`find-transition` vocabulary. Lesson 253's fuel-limited computation technique — a real step budget standing in for "how long are we willing to wait," reused directly here. Lesson 22's base-case-and-progress recursion, and Lesson 91's mutual recursion via `(declare ...)`.

**Terms used in this lesson**

- **Turing machine (TM)** — a machine with a finite set of states and one tape (unbounded memory, readable and writable at any position), whose behavior at every step is fixed entirely by its current state and the symbol currently under its head. Reappearing in full from Lesson 259; this lesson's entire subject is what happens when a TM's own transition table stops being fixed at write-time and becomes an ordinary value instead.
- **transition table** — the complete list of a Turing machine's rules, each one a 5-tuple `[state read-symbol new-state write-symbol direction]`: "when in this state, reading this symbol, move to this new state, write this new symbol, and step in this direction." Reappearing from Lesson 259. This lesson's whole point rests on one fact about it that was already true in Lesson 259 but never exploited directly: a transition table is an ordinary Clojure vector — data, not syntax — exactly like any list this curriculum has built since Lesson 24.
- **head** — the one tape position a Turing machine is currently reading from and writing to. Reappearing from Lesson 259.
- **blank symbol** — written `"_"` in this lesson, meaning "nothing has ever been written here." Reading past the tape's current length always returns a blank. Reappearing from Lesson 259.
- **fuel-limited computation** — reappearing from Lesson 253: rather than letting a computation run for a genuinely unbounded number of steps (risking it never finishing at all), a numeric budget is threaded through every recursive step and decremented each time; hitting zero halts the computation honestly, with a real sentinel value marking "ran out of budget," rather than crashing or looping forever. Lesson 259 already used this to bound its own Turing-machine simulator; this lesson reuses the identical technique.
- **decider** — a Turing machine guaranteed to halt on every input, whose final state is the actual yes/no answer to some question about that input. Reappearing from Lesson 259; both machines built in this lesson are deciders.
- **accept state** — one of a designated set of states meaning "the answer is yes" if the machine halts there. This lesson makes that designated set an explicit value, `accept-states`, passed in alongside the transition table, rather than a single hardcoded name — the reason is this lesson's own first Concept Unit.
- **interpreter** — a single piece of code whose entire behavior, for any given run, comes from a *value* it is handed (a program, a table, a description), rather than from which function was called. This lesson's `run-tm` is a real interpreter in exactly this sense: it does not contain the word `"even"` or `"odd"` or any other detail belonging to any one specific machine anywhere in its own body.
- **universal computation** — the idea this lesson exists to prove concretely: that a single, fixed interpreter, general enough in what it accepts as data, can compute anything *any* machine describable in that same data format could compute — not by being rewritten per machine, but by being handed a different description.
- **Universal Turing Machine (UTM)** — the formal name for a Turing machine (or, as built here, a Turing-machine *interpreter*) that takes a description of another machine `M` together with an input `w`, and produces exactly what `M` would produce if run directly on `w`. Historically (Turing, 1936) `M` and `w` are both encoded as a single string on one shared tape, so the universal machine has no separate "which machine" input at all — only a tape, like every other machine. This lesson builds the computational essence of that idea — one interpreter, run against genuinely different machine descriptions, provably unmodified — without implementing that full string encoding; see this lesson's own closing note on that honestly scoped-down piece.
- **⟨M, w⟩** — standard notation for "a machine `M` bundled together with an input `w`," read as a single object, not two separate things. This lesson's second Concept Unit builds a real, concrete value playing exactly this role.

**Objects and methods used**

- **`get`, `count`, `assoc`, `empty?`, `first`, `rest`, `nil?`, `not`, `<`, `<=`, `=`, `+`, `-`, `if`, `defn`, `declare`**
  - *What they are:* All reappear in full from earlier lessons. `get` reads a value out of a vector by index, returning `nil` for an out-of-range index. `count` reports a collection's length. `assoc` returns an updated copy of a vector, with one index's value replaced — or, when the index given is exactly equal to the vector's own current length, appended as a brand-new last element (Lesson 94/96's own append-by-`assoc` technique). `empty?` tests whether a collection has zero elements. `first` and `rest` split a list into its leading element and everything after it. `nil?` tests whether a value is Clojure's own "nothing here" value. `not` flips a boolean. `<` and `<=` are numeric comparisons; `=` is equality, usable on any two values, not just numbers. `+` and `-` are arithmetic. `if` branches on a test. `defn` names a function. `declare` creates a placeholder name for a function that will be given a real body later in the same file, letting two functions call each other before both exist.
  - *Their use here:* Identical roles to every prior lesson that used them. `declare` specifically appears because this lesson's `run-tm` and `decide-step` call each other — real mutual recursion, the same shape as Lesson 91's `binary-search`/`search-at-mid`.

---

## Concept Unit: One Interpreter, Many Programs

### The Problem

Every machine this curriculum has built since Lesson 254 was written to do exactly one job. The parity-checking automaton in Lesson 254 could only ever check parity; Lesson 259's own `a^n b^n c^n` decider could only ever decide that one language. Each was a fresh function, with the rules of its own machine typed directly into its own body. A real computer does not work this way — the same physical hardware that ran a word processor an hour ago is running a web browser right now, with no rewiring in between. Is a Turing machine, as this curriculum has built it, capable of the same thing: one fixed piece of machinery computing many genuinely different things, distinguished only by what it is *given*, never by how it was *built*?

### Introduce the Concept in Isolation

Before touching a Turing machine at all, here is the smallest possible version of the same idea: a single function whose entire behavior comes from a value passed to it, not from which function got called.

```clojure
(defn apply-step [instruction total]
  (if (= (get instruction 0) "add")
    (+ total (get instruction 1))
    (* total (get instruction 1))))

(defn run-recipe [recipe total]
  (if (empty? recipe)
    total
    (run-recipe (rest recipe) (apply-step (first recipe) total))))

(run-recipe [["add" 3] ["add" 4]] 0)
(run-recipe [["add" 3] ["mult" 4]] 0)
```

Hand-traced: the first call starts with `total = 0`. `apply-step ["add" 3] 0` reads `(get instruction 0)` as `"add"`, so it returns `(+ 0 3) = 3`. `run-recipe` calls itself again with `total = 3` and the recipe now just `[["add" 4]]`; `apply-step ["add" 4] 3` returns `(+ 3 4) = 7`. The recipe is now empty, so `run-recipe` returns `7`.

The second call starts identically — `apply-step ["add" 3] 0` again returns `3` — but its second instruction is `["mult" 4]`, not `["add" 4]`. `apply-step` reads `(get instruction 0)` as `"mult"`, takes the *other* branch, and returns `(* 3 4) = 12`. The recipe is now empty, so `run-recipe` returns `12`.

```
(run-recipe [["add" 3] ["add" 4]] 0)  => 7
(run-recipe [["add" 3] ["mult" 4]] 0) => 12
```

Two calls to the *exact same* `run-recipe` and `apply-step` — not one character of either function's own source changed between them — produced two genuinely different real results, `7` and `12`, purely because the second call's `recipe` argument was different data. This is called a **data-driven interpreter**: a function whose behavior for any given call is determined entirely by a value it receives, not by which function was invoked.

### Discard the Throwaway Example

`apply-step` and `run-recipe` are discarded here — they exist only to prove the principle in miniature, in a context with none of a Turing machine's own bookkeeping (no tape, no head, no state) to distract from it. Neither appears again in this lesson or this curriculum.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition, continuing Section XII's build from Lesson 259, rewritten fresh per this curriculum's standing zero-old-lesson-file-reads rule (every construct below gets its own full, real treatment in this lesson's own body, per the Repetition Rule, rather than being carried over from any earlier lesson's file).
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed (unreachable this session — every claim below is hand-traced, step by step, rather than run; see the note before the first real output block).

### The New Code

```clojure
(defn read-tape [tape position]
  (if (< position (count tape))
    (get tape position)
    "_"))

(defn write-tape [tape position value]
  (assoc tape position value))

(defn move-position [position direction]
  (if (= direction "R")
    (+ position 1)
    (- position 1)))

(defn matches-transition? [transition state symbol]
  (if (= (get transition 0) state)
    (= (get transition 1) symbol)
    false))

(defn find-transition [transition-table state symbol]
  (if (empty? transition-table)
    nil
    (if (matches-transition? (first transition-table) state symbol)
      (first transition-table)
      (find-transition (rest transition-table) state symbol))))

(defn member? [value collection]
  (if (empty? collection)
    false
    (if (= value (first collection))
      true
      (member? value (rest collection)))))

(defn verdict-for [accept-states state tape]
  (if (member? state accept-states)
    ["accept" state tape]
    ["reject" state tape]))

(declare decide-step)

(defn run-tm [transition-table accept-states tape position state fuel]
  (if (<= fuel 0)
    ["exhausted" state tape]
    (decide-step (find-transition transition-table state (read-tape tape position))
                 transition-table accept-states tape position state fuel)))

(defn decide-step [transition transition-table accept-states tape position state fuel]
  (if (nil? transition)
    (verdict-for accept-states state tape)
    (run-tm transition-table accept-states
            (write-tape tape position (get transition 3))
            (move-position position (get transition 4))
            (get transition 2)
            (- fuel 1))))
```

### The Updated Project

Skipped — ten freestanding new functions, nothing surrounding them yet.

### Mechanical Walkthrough

Every distinct syntactic element, in order:

- **`(defn read-tape [tape position] ...)`** — names a function of two parameters: the tape itself, and the position being read.
- **`(if (< position (count tape)) (get tape position) "_")`** — `<` compares `position` against `(count tape)`, the tape's own length; `count` reappears in full from every earlier lesson that measured a collection. If `position` is a genuinely valid index (strictly less than the length), `get` reads the real value stored there. Otherwise — `position` at or past the tape's current end — the answer is the blank symbol `"_"` directly, no lookup attempted. This is what lets the tape behave as though it extends forever to the right without ever needing to be pre-sized: nothing distinguishes "not yet written" from a real blank symbol from the caller's point of view.
- **`(defn write-tape [tape position value] (assoc tape position value))`** — `assoc` returns a new vector, identical to `tape` except at `position`, which now holds `value`. Every write in this lesson's two demonstration machines happens at a position the tape already has a real cell for, so this simple form is honestly sufficient here — it is *not* claimed to safely write past the tape's current end (Lesson 259's own tape handled that separately; this lesson's machines never need to).
- **`(defn move-position [position direction] ...)`** — names a function of two parameters: the current head position, and which way to move.
- **`(if (= direction "R") (+ position 1) (- position 1))`** — `=` checks whether `direction` is the literal string `"R"`; if so, `+` advances the position by one; otherwise (this lesson only ever uses `"R"` or `"L"`), `-` moves it back by one.
- **`(defn matches-transition? [transition state symbol] ...)`** — names a predicate of three parameters: one transition (a 5-tuple), the state to check it against, and the symbol to check it against.
- **`(if (= (get transition 0) state) (= (get transition 1) symbol) false)`** — `get transition 0` reads the transition's own *from-state*, the first slot of the 5-tuple; `=` compares it against `state`. Only if that matches does the function bother comparing `get transition 1`, the transition's own *read-symbol*, against `symbol` — if the state did not match at all, the answer is `false` immediately, without needing to inspect the symbol slot.
- **`(defn find-transition [transition-table state symbol] ...)`** — names a function of three parameters: the whole transition table (a vector of 5-tuples), and the state/symbol pair to search for.
- **`(if (empty? transition-table) nil (if (matches-transition? ...) (first transition-table) (find-transition (rest transition-table) state symbol)))`** — `empty?` is this recursion's base case: an empty table has no matching transition, so the honest answer is `nil`, Clojure's own "nothing here" value. Otherwise, `matches-transition?` checks the table's own first entry, `first transition-table`; if it matches, that exact transition is returned. If not, `find-transition` calls itself on `rest transition-table` — everything after the first entry — searching the same way. This is base-case-and-progress recursion: the table given to each recursive call is strictly one element shorter than the one before it, guaranteeing the search eventually reaches the empty-table base case.
- **`(defn member? [value collection] ...)`** — names a function of two parameters: a value to search for, and a collection to search inside.
- **`(if (empty? collection) false (if (= value (first collection)) true (member? value (rest collection))))`** — the identical recursive shape as `find-transition`, one level simpler: an empty collection means the value was never found (`false`); otherwise, compare `value` against `first collection` directly, and if they don't match, recurse on `rest collection`.
- **`(defn verdict-for [accept-states state tape] ...)`** — names a function of three parameters: the designated set of accepting state names, the state the machine actually halted in, and the tape at that moment.
- **`(if (member? state accept-states) ["accept" state tape] ["reject" state tape])`** — `member?`, just defined, checks whether the halting `state` is one of the names listed in `accept-states`. Either branch returns a real 3-element vector — the verdict itself (`"accept"` or `"reject"`), the state that produced it, and the tape at the moment of halting — the vector-as-triple pattern this curriculum has used since Lesson 92's binary search tree nodes, reused here for a function that genuinely has three separate, meaningful things to hand back.
- **`(declare decide-step)`** — creates a placeholder Var named `decide-step`, with no function body yet, purely so that `run-tm`, defined next, can reference the name `decide-step` inside its own body without Clojure raising "unable to resolve symbol" at the moment `run-tm` itself is being read and compiled. The real body arrives two definitions later. This is the identical technique as Lesson 91's `(declare search-at-mid)` before `binary-search`.
- **`(defn run-tm [transition-table accept-states tape position state fuel] ...)`** — names a function of six parameters: the transition table, the accept-states, and the four pieces of a machine's own current situation — its tape, head position, current state, and remaining fuel.
- **`(if (<= fuel 0) ["exhausted" state tape] (decide-step (find-transition transition-table state (read-tape tape position)) transition-table accept-states tape position state fuel))`** — `<=` checks whether the fuel budget has been fully spent; if so, the honest answer is `["exhausted" state tape]`, the fuel-limited-computation sentinel reappearing directly from Lesson 253 — a real value stating plainly "this ran out of budget before reaching a verdict," never a crash and never a guessed answer. Otherwise, `read-tape` (just defined) reads the symbol currently under the head, `find-transition` (just defined) looks up the one matching rule for the current `state` and that symbol, and the *result of that lookup* — found transition or `nil` — is handed directly into `decide-step` as its very first argument, computed exactly once here rather than being looked up again inside `decide-step` itself (the "compute once, pass to a helper" pattern this curriculum has used since Lesson 56, in place of a `let` binding this curriculum does not allow).
- **`(defn decide-step [transition transition-table accept-states tape position state fuel] ...)`** — names a function of seven parameters: the transition already found (or `nil`), plus everything `run-tm` was carrying.
- **`(if (nil? transition) (verdict-for accept-states state tape) (run-tm transition-table accept-states (write-tape tape position (get transition 3)) (move-position position (get transition 4)) (get transition 2) (- fuel 1)))`** — `nil?` tests whether the transition passed in really is `nil` — meaning `find-transition` found nothing for the current state and symbol, which is exactly how a Turing machine halts in this model: not by reaching some special "stop" instruction, but by simply running out of rules that apply. When that happens, `verdict-for` (just defined) turns the halting state into a real accept/reject answer. Otherwise, a real transition was found, and the machine takes one genuine step: `write-tape` writes `(get transition 3)`, the transition's own *write-symbol* (the fourth of its five slots), at the current position; `move-position` moves the head according to `(get transition 4)`, the transition's own *direction* (the fifth slot); the new state is `(get transition 2)`, the transition's own *new-state* (the third slot); and `-` spends exactly one unit of fuel. All four new values are handed straight into a fresh call to `run-tm` — one real step of the machine, then control passes back to the very function that started it.

### CS Lens

This pair of functions, `run-tm` and `decide-step`, is called an **interpreter** — and specifically, because it can execute *any* transition table handed to it, a **universal machine** with respect to this curriculum's own Turing-machine model. The defining fact, provable just by reading the code above: nowhere in `read-tape`, `write-tape`, `move-position`, `matches-transition?`, `find-transition`, `member?`, `verdict-for`, `run-tm`, or `decide-step` does the literal string `"even"`, `"odd"`, or any other detail belonging to one specific machine appear. Every one of those names is a parameter, filled in fresh on every call.

Also recognized in: a general-purpose CPU, which runs a spreadsheet today and a game tomorrow without being rewired, because both are just different bit patterns fed to the identical hardware; a Game Boy emulator, a real, ordinary program that reads a game's ROM file as data and produces the exact behavior a real Game Boy chip would have produced, without containing any of that specific game's own logic anywhere in the emulator's own source; the Python interpreter, one fixed program that runs every `.py` file anyone has ever written; the JVM, one fixed program that runs every compiled `.class` file anyone has ever produced, including this curriculum's own Clojure code once compiled to bytecode.

### SE Lens

The alternative to building `run-tm` this way is the one every machine before Lesson 260 actually used: write a fresh function per machine, with that machine's own states and transitions typed directly into its own `if`/`cond` branches. That alternative has a real advantage this lesson's version gives up: a purpose-built function can be faster, because it never has to spend time looking a transition up in a table — the right branch is already sitting right there in the function's own compiled code. `run-tm`'s `find-transition` genuinely does real work, a linear scan through the table, on every single step, for every machine it ever runs — real, measurable interpretation overhead that a hand-written, machine-specific function would not pay.

What `run-tm` buys back is the thing Lesson 254 through Lesson 259 never had: the ability to add a *new* machine to this curriculum's toolkit without writing a single new line of simulation code — only a new transition table, tested against code that has already been verified correct, once, for every machine that will ever use it. This is the same tradeoff a real operating system's process scheduler, or a real database's query engine, makes constantly: one general, somewhat slower engine, interpreting many different jobs, instead of one hand-tuned, maximally fast routine per job — chosen because the engineering cost of maintaining N separate hand-tuned routines, correctly, forever, is worse than the real, honest performance cost of interpretation.

### Commands Needed

None new. `bb` was checked for at the start of this session via `Get-ChildItem -Path $env:TEMP -Filter "bb.exe" -Recurse` (PowerShell) and via `where bb` — neither found it reachable this session.

### Run It — Hand-Traced, Not Executed

`bb` was unreachable this session, so every claim below is a full, careful hand-trace rather than a real run, following this curriculum's own established rule for exactly this situation (build from careful hand-tracing, say so honestly).

Two machines, both run through the identical `run-tm`/`decide-step` pair above, with nothing in either function changed between calls.

**Machine A — even number of `1`s.** Two states, `"even"` (the start state) and `"odd"`; reading a `"0"` never changes the state, reading a `"1"` always flips it.

```clojure
(def transitions-a
  [["even" "0" "even" "0" "R"]
   ["even" "1" "odd" "1" "R"]
   ["odd" "0" "odd" "0" "R"]
   ["odd" "1" "even" "1" "R"]])

(run-tm transitions-a ["even"] ["1" "0" "1" "0"] 0 "even" 10)
```

Traced step by step, on input `["1" "0" "1" "0"]` (two `1`s — an even count, so this should accept):

```
Step 0: state "even", pos 0, read "1" -> matches ["even" "1" "odd" "1" "R"]
        write "1" (unchanged), move to pos 1, state -> "odd", fuel -> 9
Step 1: state "odd",  pos 1, read "0" -> matches ["odd" "0" "odd" "0" "R"]
        write "0" (unchanged), move to pos 2, state -> "odd", fuel -> 8
Step 2: state "odd",  pos 2, read "1" -> matches ["odd" "1" "even" "1" "R"]
        write "1" (unchanged), move to pos 3, state -> "even", fuel -> 7
Step 3: state "even", pos 3, read "0" -> matches ["even" "0" "even" "0" "R"]
        write "0" (unchanged), move to pos 4, state -> "even", fuel -> 6
Step 4: state "even", pos 4, read-tape: 4 is not < (count tape)=4, so read "_"
        find-transition table "even" "_" -> no entry has symbol "_" -> nil
        decide-step gets transition = nil -> verdict-for ["even"] "even" tape
        member? "even" ["even"] -> true -> ["accept" "even" ["1" "0" "1" "0"]]
```

Every step's own reasoning is stated directly above: which transition matched, and why (state and symbol both had to equal the transition's own first two slots). Final result: `["accept" "even" ["1" "0" "1" "0"]]` — correctly accepted, two `1`s being an even count.

The same table, on input `["1"]` (one `1` — an odd count, so this should reject):

```
Step 0: state "even", pos 0, read "1" -> matches ["even" "1" "odd" "1" "R"]
        write "1" (unchanged), move to pos 1, state -> "odd", fuel -> 9
Step 1: state "odd", pos 1, read-tape: 1 is not < (count tape)=1, so read "_"
        find-transition table "odd" "_" -> no entry has symbol "_" -> nil
        decide-step gets transition = nil -> verdict-for ["even"] "odd" tape
        member? "odd" ["even"] -> false -> ["reject" "odd" ["1"]]
```

Final result: `["reject" "odd" ["1"]]` — correctly rejected, one `1` being an odd count.

**Machine B — a genuinely different machine: contains at least one `1`.** Two states, `"scanning"` (the start state, meaning "no `1` seen yet") and `"found"` (meaning "a `1` was seen"). Once in `"found"`, the machine stays there no matter what it reads next.

```clojure
(def transitions-b
  [["scanning" "0" "scanning" "0" "R"]
   ["scanning" "1" "found" "1" "R"]
   ["found" "0" "found" "0" "R"]
   ["found" "1" "found" "1" "R"]])

(run-tm transitions-b ["found"] ["0" "0" "1"] 0 "scanning" 10)
```

Traced on input `["0" "0" "1"]` (contains a `1`, so this should accept):

```
Step 0: state "scanning", pos 0, read "0" -> matches ["scanning" "0" "scanning" "0" "R"]
        write "0" (unchanged), move to pos 1, state -> "scanning", fuel -> 9
Step 1: state "scanning", pos 1, read "0" -> matches the same rule again
        write "0" (unchanged), move to pos 2, state -> "scanning", fuel -> 8
Step 2: state "scanning", pos 2, read "1" -> matches ["scanning" "1" "found" "1" "R"]
        write "1" (unchanged), move to pos 3, state -> "found", fuel -> 7
Step 3: state "found", pos 3, read-tape: 3 is not < (count tape)=3, so read "_"
        find-transition table "found" "_" -> no entry has symbol "_" -> nil
        decide-step gets transition = nil -> verdict-for ["found"] "found" tape
        member? "found" ["found"] -> true -> ["accept" "found" ["0" "0" "1"]]
```

Final result: `["accept" "found" ["0" "0" "1"]]` — correctly accepted.

The same table, on input `["0" "0" "0"]` (contains no `1`, so this should reject): the identical `"scanning"`/`"0"` transition fires three times, moving the head from position `0` to `3`, state staying `"scanning"` the entire time. At position `3`, `read-tape` returns `"_"` exactly as above; `find-transition table "scanning" "_"` again finds nothing (no entry has symbol `"_"`) and returns `nil`. `verdict-for ["found"] "scanning" tape` — `member? "scanning" ["found"]` is `false` — final result `["reject" "scanning" ["0" "0" "0"]]` — correctly rejected.

Four real, hand-traced runs. Two different transition tables, two different accept-state sets, two different tapes — and `run-tm`/`decide-step`, called four separate times, never had a single line of their own bodies changed. That is the entire, concrete proof of this Concept Unit's claim.

### One Sentence Connecting This Unit

The throwaway `run-recipe` proved the principle in miniature — one function, two recipes, two real results — and `run-tm` is the identical principle, at full scale, applied to this curriculum's own Turing-machine model: one interpreter, two machines, two correct verdicts, with nothing in the interpreter itself ever touched.

---

## Concept Unit: The Machine Description Is Just More Data

### The Problem

The previous unit proved `run-tm` can simulate different machines — but it did so by passing a transition table and an accept-state set as two of `run-tm`'s six separate arguments. Nothing about that setup lets a machine's own description be handled as *one single thing* — stored in one place, compared as one value, or (this is where this is heading) handed to some other piece of code that itself needs to reason about "which machine is this." Is there a way to bundle an entire machine, together with the specific input it is meant to run on, into one self-contained value?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing directly from this lesson's first Concept Unit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: `run-tm`, `verdict-for`, and every function this lesson has already built above.

### The New Code

```clojure
(defn make-description [transition-table accept-states tape position state fuel]
  [transition-table accept-states tape position state fuel])

(defn run-description [description]
  (run-tm (get description 0)
          (get description 1)
          (get description 2)
          (get description 3)
          (get description 4)
          (get description 5)))
```

### The Updated Project

Skipped — two freestanding new functions, built directly on top of this lesson's first unit, with nothing else surrounding them yet.

### Mechanical Walkthrough

- **`(defn make-description [transition-table accept-states tape position state fuel] [transition-table accept-states tape position state fuel])`** — names a function of six parameters, identical in number and order to `run-tm`'s own six, whose entire body is a single vector literal collecting all six into one value. This is the vector-as-N-slot-record pattern this curriculum has used since Lesson 92 (a binary search tree node, three slots) and Lesson 130/131/133 (Dijkstra/Bellman-Ford/Prim's threaded state, several slots) — nothing new in the mechanism, only in what it is now being used to represent: not a data structure's own internal bookkeeping, but an entire *machine, bundled with its own input*, as one movable value.
- **`(defn run-description [description] ...)`** — names a function of exactly one parameter: a value built by `make-description`.
- **`(run-tm (get description 0) (get description 1) (get description 2) (get description 3) (get description 4) (get description 5))`** — `get`, reappearing in full, reads each of the six slots back out of `description`, in the exact order `run-tm` expects them, and calls `run-tm` with all six. Nothing about `run-tm` itself changed to make this possible — `run-description` is purely a thin unwrapping layer sitting in front of the identical function built in this lesson's first unit.

### CS Lens

This is the formal move that turns "one interpreter, many programs" (this lesson's first unit) into a genuine **Universal Turing Machine**: a description built by `make-description` is exactly what theoretical computer science writes as **⟨M, w⟩** — a machine `M` (here, `transition-table` plus `accept-states`) bundled together with an input `w` (here, `tape`, `position`, `state`, and `fuel`) as one single object. `run-description` is a function that takes *only* ⟨M, w⟩ — one argument — and produces exactly what `M` would produce if run directly on `w`, which is the textbook definition of a universal machine's own job.

Turing's actual 1936 construction goes one step further than this lesson does: `M` and `w` are both encoded as a single *string*, written onto the universal machine's own tape, using the same fixed tape alphabet the universal machine already uses for everything else — so the universal machine has no special "which machine" input at all, only an ordinary tape, exactly like every other Turing machine in this curriculum. Building that string encoding — a real, standard technique, sometimes called Gödel-numbering a machine — is a genuinely separate, sizeable project on its own, and is deliberately not implemented in this lesson, the same honest scoping-down this curriculum already applied to full red-black tree rebalancing (Lesson 99), full B-tree splitting (Lesson 100), and full augmenting-path search (Lesson 134): the tractable, representative core — one fixed interpreter, genuinely unmodified across genuinely different machines, bundled into one self-contained ⟨M, w⟩ value — is built and verified in full above; the remaining string-encoding machinery is described honestly rather than shipped as unverified "verified" code.

### SE Lens

The alternative to `make-description`/`run-description` is what this lesson's first unit already did: call `run-tm` directly, with six separate arguments, every time. That alternative is not wrong — it is what every call in the first unit actually used — but it does not compose: nothing about "six separate arguments" can be stored in one variable, passed as one function argument to some *other* function that wants to reason about "a machine" as a single thing, or compared for equality against another machine-plus-input pair with one `=` call. Bundling into one vector costs exactly one extra layer of unwrapping (`run-description`'s own six `get` calls) in exchange for turning "a machine, running on some input" into a first-class value — the same tradeoff every one of this curriculum's own record-like vectors has made since Lesson 92, now applied one level up, to whole computations instead of individual data points. This is not a cosmetic convenience: Lesson 261 depends on exactly this — a decision procedure that needs to inspect "a machine together with its input" as one single argument cannot be built at all until that pairing exists as one real value, which is precisely what this Concept Unit built.

### Commands Needed

None new.

### Run It — Hand-Traced, Not Executed

```clojure
(def description-a (make-description transitions-a ["even"] ["1" "0" "1" "0"] 0 "even" 10))
(def description-b (make-description transitions-b ["found"] ["0" "0" "1"] 0 "scanning" 10))

(run-description description-a)
(run-description description-b)
(= (get description-a 0) (get description-b 0))
```

`description-a` is the vector `[transitions-a ["even"] ["1" "0" "1" "0"] 0 "even" 10]`. `(run-description description-a)` reads all six slots back out in order and calls `(run-tm transitions-a ["even"] ["1" "0" "1" "0"] 0 "even" 10)` — the identical call already hand-traced in the first Concept Unit above, so the result is identical too: `["accept" "even" ["1" "0" "1" "0"]]`.

`description-b` is the vector `[transitions-b ["found"] ["0" "0" "1"] 0 "scanning" 10]`. `(run-description description-b)` unwraps it into `(run-tm transitions-b ["found"] ["0" "0" "1"] 0 "scanning" 10)` — again identical to a call already hand-traced above — result: `["accept" "found" ["0" "0" "1"]]`.

`(= (get description-a 0) (get description-b 0))` compares `transitions-a` against `transitions-b` directly — two genuinely different 4-element vectors of 5-tuples, sharing no entries — so this is `false`: concrete, checkable proof that `description-a` and `description-b` really do hold two different machines, not the same table under two different names.

### One Sentence Connecting This Unit

`run-tm` proved one interpreter can simulate different machines; `make-description`/`run-description` prove that "which machine, running on what" can itself be a single, ordinary, storable value — the real, working shape of ⟨M, w⟩ that Lesson 261 needs next.

---

## Connect the Pieces

Follow one concrete value, `description-a`, through everything this lesson built. `make-description transitions-a ["even"] ["1" "0" "1" "0"] 0 "even" 10` bundles a transition table, an accept-state set, and a starting tape/position/state/fuel into one vector — this lesson's own concrete ⟨M, w⟩. `run-description description-a` unwraps those six slots and hands them to `run-tm`. `run-tm` checks its fuel, calls `read-tape` to see what is under the head, calls `find-transition` (itself built from `matches-transition?`) to find the one rule that applies, and — since a rule was found — hands that rule to `decide-step`. `decide-step` calls `write-tape` and `move-position` to compute the machine's next tape/position/state, spends one unit of fuel, and calls `run-tm` again. This repeats three more times until the head runs past the tape's real end; `read-tape` returns the blank symbol `"_"`; `find-transition` finds no rule at all for `"_"`; `decide-step` receives `nil` and calls `verdict-for`, which calls `member?` to check the halting state against the accept-states bundled all the way back at the start — and returns `["accept" "even" ["1" "0" "1" "0"]]`. Nine functions, called in sequence, and not one of them knows or cares that it is specifically Machine A running — every single one would do exactly the same sequence of real work for `description-b`, or any other ⟨M, w⟩ built the same way.

## What Breaks Without This

Delete `accept-states` as a real, passed-in parameter, and hardcode `verdict-for` to check for one specific, fixed name instead:

```clojure
(defn verdict-for-broken [state tape]
  (if (= state "accept")
    ["accept" state tape]
    ["reject" state tape]))
```

Run Machine A's own `"1010"` case through this broken version (`decide-step` calling `verdict-for-broken` instead of `verdict-for`, everything else identical). The hand-trace up through the final step is unchanged: the machine halts in state `"even"`, having correctly processed two `1`s — an even count, which should accept. But `verdict-for-broken` checks `(= "even" "accept")`, which is `false`, so it returns `["reject" "even" ["1" "0" "1" "0"]]` — the *wrong* answer, for a machine that was never actually broken at all. The bug is not in Machine A's transition table, and it is not in `run-tm`'s own stepping logic — both are exactly as verified above. The bug is that `verdict-for-broken` silently assumed every machine that will ever be run through it names its own accept state `"accept"` — an assumption that happened to be true for nothing this lesson ever built, since Machine A calls its accept state `"even"` and Machine B calls its `"found"`. The instant an interpreter's own code bakes in one specific machine's vocabulary, it stops being universal — restoring `verdict-for`'s real `accept-states` parameter, and `member?`'s real check against it, is what makes the claim "this handles any machine" true again, rather than merely true by coincidence for the two machines already tested.

## Exercises

1. Build a third transition table and accept-state set — for example, a machine deciding "the string has length at least `3`" — and run it through `run-description` exactly as `description-a` and `description-b` were run, without changing `run-tm`, `decide-step`, or any function above it.
2. Hand-trace `(run-tm transitions-b ["found"] ["1"] 0 "scanning" 10)` — Machine B on a one-symbol input that is itself the target symbol — step by step, the same way the two full traces above were written out, and state the final verdict.
3. `member?` and `find-transition` are both linear searches through a list, structurally identical apart from what they compare. Write out, in one or two sentences, exactly which lines of `find-transition` would need to change to make it behave like `member?` — and which would not.

## Definition of Done

- [ ] `read-tape`, `write-tape`, `move-position`, `matches-transition?`, `find-transition`, `member?`, `verdict-for`, `run-tm`, and `decide-step` are all defined, in the order shown, with `(declare decide-step)` appearing before `run-tm`.
- [ ] `run-tm` is called at least twice, against two genuinely different transition tables and accept-state sets, with correct, hand-verified verdicts for both.
- [ ] `make-description` and `run-description` are defined and demonstrated bundling a full ⟨M, w⟩ into one value and running it back out correctly.
- [ ] The broken `verdict-for-broken` variant has been hand-traced and shown to produce a wrong verdict on an otherwise-correct run, and the reason has been stated in terms of hardcoded vocabulary, not a logic bug.
- [ ] `git commit -m "Add a universal Turing-machine interpreter, proven unmodified across two different machines, and bundle machine-plus-input into a single ⟨M, w⟩ value"`
