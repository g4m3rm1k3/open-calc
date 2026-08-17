# Lesson 261: The Halting Problem

**What you will build** — A real, working, fuel-based heuristic that inspects a machine description and guesses whether it halts — genuinely useful, and openly honest about the cases it cannot resolve. Then a real, concrete function, `diagonal`, built to do the *opposite* of whatever any hypothetical, fully-correct halting decider would predict about it — and a rigorous, case-by-case proof that this single piece of code makes such a decider's existence logically impossible, no matter how it might be written. The transferable problem: Lesson 260 proved one interpreter can run any machine handed to it as data — does that same interpreter, or *any* algorithm at all, no matter how clever, have a way to look at a machine description and correctly say, every time, whether that machine will ever stop?

**What you need to know first** — Lesson 260's `run-tm`, `make-description`, `run-description`, and the ⟨M, w⟩ notation in full — this lesson reuses all of it directly. Lesson 253's **fuel-limited computation** and its own **total function**/**partial function** vocabulary — this lesson's entire first half is a direct continuation of that exact distinction. Lesson 91's mutual recursion via `(declare ...)`. Lesson 25's functions as ordinary values that can be passed as arguments, not just called. Lesson 17's proof by contradiction — this lesson's second half is one, in full.

**Terms used in this lesson**

- **Turing machine (TM)**, **transition table**, **tape**, **blank symbol**, **head** — reappearing in full from Lessons 259–260: a machine with a finite set of states and one unbounded tape, whose behavior at every step is fixed by its current state and the symbol under its head; a transition table is the complete list of its rules, each a 5-tuple; the blank symbol `"_"` marks a tape position never written to.
- **fuel-limited computation** — reappearing from Lesson 253: a numeric budget threaded through a recursive computation and decremented each step, so that a computation that might otherwise never finish still halts honestly, with a real sentinel marking "ran out of budget," rather than running forever or crashing.
- **decider** — reappearing from Lesson 259: a Turing machine guaranteed to halt on every input, whose final state is the real yes/no answer to some question about that input.
- **total function** — reappearing from Lesson 253: a function guaranteed to produce a real answer for every possible input, never failing to terminate. This lesson's entire argument is about whether one specific total function could possibly exist.
- **heuristic** — a procedure that gives a genuinely useful answer in many real cases, without being guaranteed correct — or even guaranteed to give a definite answer at all — in every possible case. This lesson's first Concept Unit builds a real one; its second Concept Unit proves why a *non*-heuristic version of the exact same question cannot exist.
- **decidable** — a question for which some total function is guaranteed to exist that answers it correctly for every possible input, and always finishes. Lesson 254 through 259 built deciders for decidable questions (parity, containment, balanced brackets, `a^n b^n c^n`) without ever naming this term directly; this lesson names it.
- **undecidable** — a question for which no total function answering it correctly on every input can exist — not "no one has found one yet," but a real, provable impossibility. This lesson's second Concept Unit proves the single most famous example of one.
- **the halting problem** — the specific undecidable question this lesson proves undecidable: given a machine description ⟨M, w⟩, does `M` eventually halt when run on `w`?
- **self-application** — calling a function using itself, or a value built from itself, as one of its own arguments. Already legal, ordinary Clojure since Lesson 25 first passed a function as a value; this lesson's second Concept Unit is the first time this curriculum uses it to build a genuine logical paradox on purpose.
- **diagonalization** — a proof technique that constructs one specific object designed, by its own structure, to disagree with whatever a hypothetical general procedure would say about it — named for Cantor's original 19th-century version, which built a real number guaranteed to differ from every number in an assumed-complete list, one digit at a time, along the list's own diagonal. This lesson's `diagonal` function is a direct, concrete instance of the same technique, aimed at a hypothetical halting decider instead of a list of real numbers.
- **proof by contradiction** — reappearing from Lesson 17: assume the opposite of what is being proven, derive a genuine logical impossibility from that assumption alone, and conclude the assumption must have been false. This lesson's second Concept Unit is a full, worked example: assume a correct halting decider exists, derive a contradiction, conclude none can.

**Objects and methods used**

- **`get`, `count`, `assoc`, `empty?`, `first`, `rest`, `nil?`, `not`, `<`, `<=`, `=`, `+`, `-`, `if`, `defn`, `declare`**
  - *What they are:* All reappear in full from Lesson 260. `get` reads a value out of a vector by index. `count` reports a collection's length. `assoc` returns an updated copy of a vector. `empty?` tests whether a collection has zero elements. `first`/`rest` split a list into its leading element and everything after it. `nil?` tests Clojure's "nothing here" value. `not` flips a boolean. `<`/`<=` are numeric comparisons; `=` is equality on any two values. `+`/`-` are arithmetic. `if` branches on a test. `defn` names a function. `declare` creates a placeholder Var for a function whose real body is given later, or — new in this lesson's second Concept Unit — a placeholder Var that is *never* given a real body at all, standing in for a function whose existence is exactly what is being disproven.
  - *Their use here:* Identical roles to Lesson 260, with one genuine new use: this lesson's `(declare halts?)` is not a temporary forward-reference waiting to be filled in later in the same file — it is left permanently unbound, on purpose, because `halts?` is a hypothesis being tested, not a function this lesson ever implements.

---

## Concept Unit: A Real (but Incomplete) Halting Heuristic

### The Problem

Lesson 260 proved one interpreter, `run-tm`, can simulate any machine handed to it as a ⟨M, w⟩ description. A natural next question: can that same machinery be used to build something that looks at a description and reports, honestly and usefully, whether the machine it describes will ever stop?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing directly from Lesson 260.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed (unreachable this session — every claim below is hand-traced, not run).

### The New Code

This lesson reuses Lesson 260's entire interpreter, unchanged — restated here in full, per this curriculum's Repetition Rule, rather than cited:

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

And this lesson's own two new functions, built directly on top of that:

```clojure
(defn describes-exhaustion? [verdict]
  (= (get verdict 0) "exhausted"))

(defn candidate-halts? [description]
  (not (describes-exhaustion? (run-description description))))
```

### The Updated Project

Skipped — `describes-exhaustion?` and `candidate-halts?` are freestanding new functions, layered directly on top of the reused interpreter above, with nothing else surrounding them yet.

### Mechanical Walkthrough

`read-tape` through `run-description` are the identical eleven functions built and fully explained, element by element, in Lesson 260 — every `if`, every `get`, every base case, every recursive call reappearing here with its meaning unchanged, since none of their own bodies were touched. Two structural patterns worth naming again in full, since both appear twice each in this reused block and both do real work every time: `find-transition` and `member?` are both base-case-and-progress recursion (Lesson 22) over a list — `empty?` is the base case in both, returning an honest "not found" (`nil` for one, `false` for the other), and each recursive call passes `(rest ...)`, a strictly shorter list, guaranteeing the search eventually terminates; `run-tm` and `decide-step` are mutual recursion (Lesson 91), each calling the other, with `(declare decide-step)` making that legal by giving Clojure a real, if empty, Var for `decide-step` to resolve against before `run-tm`'s own body is compiled.

This lesson's own new code:

- **`(defn describes-exhaustion? [verdict] (= (get verdict 0) "exhausted"))`** — names a one-parameter predicate. `get verdict 0` reads the first slot of a verdict vector — the string `"accept"`, `"reject"`, or `"exhausted"` that `verdict-for` or `run-tm`'s own fuel check produces. `=` compares it against the literal string `"exhausted"`.
- **`(defn candidate-halts? [description] (not (describes-exhaustion? (run-description description))))`** — names a one-parameter function taking a full ⟨M, w⟩ description. `run-description`, reused unchanged from Lesson 260, actually runs it, producing a real verdict vector. `describes-exhaustion?`, just defined, checks whether that verdict was `"exhausted"`. `not` flips the result: if the run was *not* exhausted — meaning it reached a real `"accept"` or `"reject"` before its fuel ran out — `candidate-halts?` reports `true`; if it *was* exhausted, it reports `false`.

### CS Lens

`candidate-halts?` is a **heuristic**, not a **decider**: it gives a real, useful answer for any machine that happens to halt (or provably loops, within its own fixed fuel budget) — but its `false` answer genuinely means two different things it cannot itself tell apart: "this machine truly never halts" and "this machine would have halted with more fuel than we gave it." Lesson 253 built the identical honest gap once already, at a smaller scale: `find-least-bounded` could not tell "no answer exists" apart from "an answer exists past where we stopped looking." `candidate-halts?` is that exact same gap, now applied to the single hardest question this curriculum has asked a heuristic to answer.

Also recognized in: a static type checker that reports "type error" or "type OK" for most code but times out or gives up on some deliberately pathological input; a virus scanner that recognizes known malware patterns but cannot, in general, prove a completely novel program safe; a compiler's own dead-code eliminator, which can prove *some* code unreachable but not all of it, for the identical underlying reason this lesson is about to prove in full.

### SE Lens

The alternative to shipping a heuristic like `candidate-halts?` is refusing to ship anything until a fully correct, always-terminating decider exists. Real software almost never takes that option, for a reason this lesson's own second Concept Unit is about to make precise: for the halting question specifically, that fully correct decider does not exist to wait for, at any level of engineering effort. The honest choice is not "heuristic vs. perfect" — it is "an honestly incomplete heuristic that says `"exhausted"` instead of guessing" vs. "a heuristic that silently guesses on the cases it cannot actually resolve, and is wrong sometimes without ever admitting it." `candidate-halts?`'s own `false` result already carries this cost quietly (it cannot distinguish its two meanings) — the fix is never "make it always right," which this lesson is about to prove impossible; the fix is making every caller of `candidate-halts?` treat `false` as "inconclusive," not as "proven false."

### Commands Needed

None new.

### Run It — Hand-Traced, Not Executed

A third machine, genuinely different from Lesson 260's two: a real, provable infinite loop, bouncing between two tape positions forever.

```clojure
(def transitions-loop
  [["right" "0" "left" "0" "R"]
   ["left" "0" "right" "0" "L"]])

(def description-loop (make-description transitions-loop [] ["0" "0"] 0 "right" 8))

(candidate-halts? description-loop)
```

Traced: starting at position `0`, state `"right"`, reading `"0"`, the only matching rule moves right into state `"left"`. From position `1`, state `"left"`, reading `"0"`, the only matching rule moves left back into state `"right"`. These two rules are now the *entire* situation again, identical to the start — nothing about the tape, the position, or the state differs from before the first step, so the same two rules fire again, forever:

```
Step 1: right,pos0 -> left,pos1   (fuel 8 -> 7)
Step 2: left,pos1  -> right,pos0  (fuel 7 -> 6)
Step 3: right,pos0 -> left,pos1   (fuel 6 -> 5)
Step 4: left,pos1  -> right,pos0  (fuel 5 -> 4)
Step 5: right,pos0 -> left,pos1   (fuel 4 -> 3)
Step 6: left,pos1  -> right,pos0  (fuel 3 -> 2)
Step 7: right,pos0 -> left,pos1   (fuel 2 -> 1)
Step 8: left,pos1  -> right,pos0  (fuel 1 -> 0)
```

After the eighth transition, `run-tm` is called with `fuel = 0`; `(<= fuel 0)` is now true, so it returns `["exhausted" "right" ["0" "0"]]` directly, without consulting `find-transition` at all. `describes-exhaustion?` reads slot `0` as `"exhausted"` — `true`. `candidate-halts?` returns `(not true)`, which is `false`.

Bumping the fuel from `8` to `800` or `8000000` changes nothing about *why* it returns `false` — the same two-step cycle repeats identically no matter how many times it is allowed to run, because reaching either state at either position always reproduces the exact same next state and position. `candidate-halts?` is genuinely correct here — but only because this particular machine happens to be simple enough to see, by inspection, that it never reaches a base case. For Lesson 260's `description-a` and `description-b`, `candidate-halts?` already correctly returns `true` for both (both real verdicts, `["accept" "even" ...]` and `["accept" "found" ...]`, are already computed in Lesson 260 and are not `"exhausted"`).

### One Sentence Connecting This Unit

`candidate-halts?` is a real, working, honestly-incomplete answer to "does this halt?" — the next Concept Unit proves that no *complete* answer, honest or otherwise, can exist for every possible machine.

---

## Concept Unit: Diagonalization — No Machine Can Judge Every Machine

### The Problem

Suppose someone claims to have written a genuinely complete halting decider — not the honest, sometimes-inconclusive `candidate-halts?` above, but a real function, call it `halts?`, that takes any zero-argument function `f` and always, itself, terminates with a correct `true` (calling `(f)` would eventually return a value) or `false` (calling `(f)` would run forever) — no third answer, ever, for any `f` at all. Is that claim possibly true?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing directly from this lesson's first Concept Unit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: None beyond ordinary Clojure recursion and function values (Lesson 25).

### The New Code

```clojure
(declare halts?)

(defn diagonal []
  (if (halts? diagonal)
    (diagonal)
    "halted"))
```

### The Updated Project

Skipped — a brand-new, freestanding function, with nothing surrounding it yet.

### Mechanical Walkthrough

- **`(declare halts?)`** — creates a placeholder Var named `halts?`, exactly as Lesson 91 first did for mutual recursion and Lesson 260 did again for `decide-step`. The difference this time is deliberate and permanent: `halts?` is never given a real body anywhere in this lesson. It stands, throughout everything below, for the *hypothesis* being tested — "suppose a function like this existed" — not for a function this lesson actually builds.
- **`(defn diagonal [] ...)`** — names a function taking zero parameters, called with no arguments at all: `(diagonal)`.
- **`(halts? diagonal)`** — calls `halts?` (whatever it hypothetically is) with one argument: the bare symbol `diagonal`, referring to the function itself as a value, not calling it. Passing a function as a plain value, without invoking it, is exactly what Lesson 25's `map` already required of every function passed to it — nothing new in the mechanism, only in what it is now being used to ask: "would calling *this very function*, `diagonal`, with no arguments, ever return?"
- **`(if (halts? diagonal) (diagonal) "halted")`** — `if` branches on `halts?`'s answer. If `halts?` says `true` (it predicts `diagonal` halts), the branch taken is `(diagonal)` — a real, ordinary recursive self-call, structurally identical to every base-case-and-progress recursion this curriculum has built since Lesson 20, except that this one has no base case at all: `diagonal` always calls `(halts? diagonal)` again, and if that keeps returning `true`, it keeps calling itself, forever. If `halts?` says `false` (it predicts `diagonal` does *not* halt), the branch taken is the plain string `"halted"` — an ordinary literal, returned immediately, with no further calls of any kind.

### The Proof

`halts?` was assumed to be **total** (Lesson 253's own term: guaranteed to return an answer for every input, never failing to terminate itself) and **correct** (its answer always matches what really happens). Being total means `(halts? diagonal)` returns exactly one of two things, `true` or `false` — there is no third option to fall back on. Check both, by cases, per Lesson 17's own proof-by-contradiction structure:

1. **Suppose `(halts? diagonal)` returns `true`.** By `halts?`'s own assumed correctness, this is a claim: calling `(diagonal)` really does eventually return a value. But look at what `diagonal`'s own code actually does in this exact case: the `if` sees a `true` test, so it evaluates `(diagonal)` — a call to itself, which again checks `(halts? diagonal)`, which — nothing about the situation has changed — again returns `true`, so `diagonal` calls itself yet again, and again, with no line of code anywhere in `diagonal`'s own body capable of returning anything other than another call to `(diagonal)`. Calling `(diagonal)` therefore never returns a value at all. This directly contradicts what `halts?` just claimed.
2. **Suppose `(halts? diagonal)` returns `false`.** By `halts?`'s own assumed correctness, this is a claim: calling `(diagonal)` never returns — it runs forever. But look at `diagonal`'s code in this exact case: the `if` sees a `false` test, so it evaluates `"halted"` — a plain literal value, returned immediately, with no recursive call at all. Calling `(diagonal)` therefore returns a value right away. This directly contradicts what `halts?` just claimed.

Both of the only two possible answers `halts?` could give lead, by nothing more than reading `diagonal`'s own five lines of code, to a direct contradiction of that exact answer. `halts?` was assumed to always answer correctly for every possible zero-argument function — and `diagonal` is a perfectly ordinary zero-argument function, built from nothing but `if`, a function call, a recursive self-call, and a string literal, every one of them already fully explained above. The only assumption anywhere in this argument that could be false is the one made at the very start: that a total, correct `halts?` exists at all. It does not — for this specific, concrete, exhibited function, `diagonal`, no such function can correctly answer "does this halt?" This is **the halting problem**, and this is why it is **undecidable**, not merely unsolved.

### CS Lens

This exact technique — build one object whose entire structure is defined in terms of "disagree with whatever the general procedure under test would say about me" — is called **diagonalization**, after Cantor's original version: given any claimed-complete list of real numbers, build a new real number whose first digit differs from the first list entry's first digit, whose second digit differs from the second entry's second digit, and so on down the list's own diagonal — guaranteeing, by construction, that the new number cannot equal *any* entry on the list, no matter how the list was built.

Also recognized in: Gödel's incompleteness theorems, which build a mathematical statement that effectively asserts "this statement cannot be proven," using the identical self-reference trick `diagonal` uses on `halts?`; Russell's paradox, "the set of all sets that do not contain themselves," which asks whether that set contains itself and gets a contradiction either way, exactly as `(halts? diagonal)`'s two cases both did; the real, working proof (not covered in this lesson, but built on the identical technique) that no general algorithm can decide whether two arbitrary programs compute the same function, or whether a given program ever accesses a specific piece of memory — an entire family of "no general algorithm can decide this" results, all provable by building a `diagonal`-shaped counterexample against whatever decider is being disproven.

### SE Lens

The tempting alternative here is to treat this as a purely theoretical curiosity with no bearing on real engineering — but every static analysis tool, linter, and type checker genuinely built and shipped by real engineering teams is a direct, practical consequence of this exact proof. None of them attempt to be `halts?`; every one of them is built, deliberately, as this lesson's own `candidate-halts?` was: a real, useful heuristic that is honest about the inputs it cannot resolve, rather than a mythical complete decider. The maintenance cost this proof forces onto every real tool of this kind is permanent and unavoidable: no amount of additional engineering effort, cleverness, or computing power will ever close the gap between "heuristic, correct on everything we've tested" and "decider, provably correct on everything" — because the gap is not a current limitation of any particular tool, it is a fact about every possible tool, proven above using nothing but `diagonal`'s own five lines of ordinary code.

### Commands Needed

None new.

### Run It

`(diagonal)` is deliberately never run in this lesson, for a reason that is itself the point rather than a gap in verification: `halts?` was only ever `declare`d, never given a real function body, so calling `(diagonal)` for real would immediately try to call `(halts? diagonal)` and throw a real, honest Clojure error — an unbound-function exception — the moment it tried to consult a decider that was never actually built, because The Proof, directly above, already showed it cannot be built. There is no version of `halts?` that could be substituted in to make `(diagonal)` runnable in a way that would prove anything — supplying any *specific*, real implementation for `halts?` would only demonstrate that *that one implementation* is wrong about `diagonal`, which Lesson 261's exercises below ask for directly; it would not touch the general claim, which is about every possible implementation, not any one of them.

### One Sentence Connecting This Unit

The first Concept Unit built a real, useful, honestly incomplete answer to "does this halt?"; this one proves, by exhibiting one concrete function that turns any claimed complete answer into a direct contradiction, that "incomplete" was never a limitation waiting to be fixed.

---

## Connect the Pieces

Follow the halting question through both Concept Units. `candidate-halts?` answers it for `description-loop` by actually running the machine for eight real steps and honestly reporting `"exhausted"` rather than guessing — a genuine, useful, but admittedly bounded answer, built entirely from Lesson 260's own `run-tm`/`run-description`. `diagonal` then asks the identical question — does a specific piece of code halt? — but about itself, and does something `candidate-halts?` never attempts: it uses the *hypothetical answer itself* to decide its own next action, via `(if (halts? diagonal) (diagonal) "halted")`, so that whichever of the only two possible answers `halts?` gives, `diagonal`'s own next move is built, by construction, to make that exact answer wrong. `candidate-halts?` never has this problem, because it never claims completeness — its own honest `"exhausted"` sentinel is precisely the escape hatch `halts?` was assumed not to need, and The Proof shows that assumption is exactly what breaks.

## What Breaks Without This

The entire proof rests on one specific detail of `diagonal`'s own structure: the `if`'s two branches do the *opposite* of what each answer predicts. Swap them:

```clojure
(defn diagonal-swapped []
  (if (halts? diagonal-swapped)
    "halted"
    (diagonal-swapped)))
```

Re-run both cases of The Proof against this version. **Case `(halts? diagonal-swapped)` returns `true`** (claims `diagonal-swapped` halts): the `if` now takes the `true`-branch, `"halted"` — an immediate return. `diagonal-swapped` really does halt. `halts?`'s claim was correct — no contradiction. **Case `(halts? diagonal-swapped)` returns `false`** (claims `diagonal-swapped` does not halt): the `if` now takes the `false`-branch, `(diagonal-swapped)` — an unbounded self-call. `diagonal-swapped` really does run forever. `halts?`'s claim was correct again — still no contradiction.

Both cases are now perfectly consistent with whatever `halts?` says. This is not a runtime crash — `diagonal-swapped` is a perfectly well-formed, if practically pointless, function — the actual failure is that the entire proof technique stops working: swapping the two branches removed the one property, "always do the opposite of the prediction," that forced a contradiction out of every possible answer. This is the real, concrete reason the branch order in `diagonal`'s own `if` is not an arbitrary stylistic choice — it is the single load-bearing fact the whole argument depends on.

## Exercises

1. `candidate-halts?` correctly reports `false` for `description-loop`. Build a fourth machine — one whose transition table has a real, matching rule for every state/symbol pair it could ever encounter, so it never halts, but that also never repeats the exact same state-and-position pair twice (unlike `description-loop`'s own two-step cycle) — and explain, in a sentence or two, why `candidate-halts?` still correctly says `false` for it despite never seeing the same situation twice.
2. Suppose a specific, real function were substituted in for `halts?` — for instance, one that always returns `true` no matter what it is given. Hand-trace what `(diagonal)` would actually do if run against that specific substitution, and state whether that specific `halts?` was correct about `diagonal`.
3. `candidate-halts?`, from this lesson's first Concept Unit, is not `halts?` — it never claims to be total and correct for every input. Explain, in your own words, exactly which of `halts?`'s two assumed properties (total, or correct) `candidate-halts?` deliberately does not have, and why that is precisely what keeps The Proof from applying to it.

## Definition of Done

- [ ] Lesson 260's full interpreter (`read-tape` through `run-description`) is restated in this lesson's own file and compiles/hand-verifies identically to Lesson 260's own results.
- [ ] `describes-exhaustion?` and `candidate-halts?` are defined and correctly classify `description-a`, `description-b`, and the new `description-loop`.
- [ ] `description-loop`'s two-state cycle is hand-traced far enough to show, and state in words, why it repeats forever rather than merely "probably" looping.
- [ ] `halts?` is `declare`d and never given a body; `diagonal` is defined in terms of it exactly as shown.
- [ ] The Proof's two cases are both stated, each ending in an explicit contradiction with the case's own assumption.
- [ ] The branch-swapped `diagonal-swapped` variant has been hand-traced through both cases and shown to produce no contradiction in either.
- [ ] `git commit -m "Prove the halting problem undecidable via a concrete diagonal construction, after building an honest, bounded heuristic that approximates it"`
