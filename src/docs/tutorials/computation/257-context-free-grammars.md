# Lesson 257: Context-Free Grammars

**What you will build** — A real, deliberately limited finite automaton that tries, and provably fails, to correctly recognize balanced parentheses beyond a small fixed nesting depth — proof, not assertion, that Section XII's own automaton machinery has a genuine ceiling. Then a formal context-free grammar for balanced parentheses, and a real recursive checker derived directly from it that succeeds exactly where the automaton failed. The transferable problem: some real, common structure — nesting, the same shape behind matched brackets, HTML tags, and function calls — needs more than a fixed, finite amount of memory to track correctly, no matter how many states a designer is willing to add.

**What you need to know first** — Every function from Lesson 254: `matches-transition?`, `find-transition`, `run-from`, `is-accept-state?`, `accepts?`. Lesson 254's and 255's own vocabulary — **state**, **deterministic**, **regular language**. Lesson 66's Pigeonhole Principle: if more items are placed into fewer containers than items, at least two items must share a container — this lesson's own first unit is a direct, concrete instance of exactly that principle. Lesson 20's recursion and Lesson 22's base-case-and-progress.

**Terms used in this lesson**

- **context-free grammar (CFG)** — a formal way of describing a language using **production rules**: a rule says a **non-terminal** symbol (a placeholder, standing for "some valid piece of structure goes here") can be replaced by a sequence of **terminal** symbols (literal, final symbols that appear in real input) and/or further non-terminals. A language is context-free if some CFG generates exactly it, the same "exists a witness" shape Lesson 255 already used to define "regular."
- **terminal** — a literal symbol that actually appears in the input itself, and can never be replaced further — this lesson's own terminals are the two literal symbols `(` and `)`.
- **non-terminal** — a placeholder symbol, never part of the actual input, standing in for "some valid piece of structure belongs here," which a production rule says how to expand.
- **production rule** — one line of a grammar's definition, of the shape "this non-terminal can become this sequence." A non-terminal can have more than one rule, meaning more than one way it is allowed to expand.
- **start symbol** — the one non-terminal a grammar begins from; a string belongs to the grammar's language exactly when it can be produced by starting from the start symbol and repeatedly applying rules until only terminals remain.
- **nesting depth** — how many still-unmatched opening symbols exist at some point while reading a nested structure left to right; this lesson's own running example counts how many `(` symbols have been opened but not yet closed by a matching `)`.

**Objects and methods used**

- **`get`, `count`, `=`, `+`, `-`, `<`, `if`, `defn`, `println`**
  - *What they are:* All reappear in full from Lessons 253–256: `get` reads a value out of a vector by index; `count` reports a collection's length; `=` tests equality; `+`/`-` are Clojure's arithmetic functions; `<` is numeric less-than; `if` branches on a test; `defn` names a function; `println` prints its arguments' readable form.
  - *Their use here:* Identical roles to every prior lesson in this section — indexing into vectors, counting lengths for base cases, comparing symbols and depths for equality, incrementing and decrementing a running nesting-depth counter, testing whether that counter has gone negative, branching on every base case, naming every function below, and printing every real result shown.

---

## Concept Unit: Nested Structure and Why Finite Automata Fail

### The Problem

Every automaton this section has built so far — Lesson 254's parity checker, Lesson 255's ends-in-`1` and identifier checkers — needed only two or three states, regardless of how long the input got. Balanced parentheses feel similar at first glance: read symbols one at a time, react to each one. But correctly deciding whether parentheses balance means knowing, at every point, exactly how deep the current nesting is — and nesting depth in a real input can be arbitrarily large. Can a finite automaton, with some fixed number of states decided once and for all before it ever sees an input, actually track that correctly?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing Section XII's build from Lesson 256.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends directly on `accepts?` and everything it calls, from Lesson 254, unchanged.

### The New Code

```clojure
(accepts? [["d0" "(" "d1"] ["d0" ")" "bad"]
           ["d1" "(" "d2"] ["d1" ")" "d0"]
           ["d2" "(" "over"] ["d2" ")" "d1"]
           ["over" "(" "over"] ["over" ")" "over"]
           ["bad" "(" "bad"] ["bad" ")" "bad"]]
          "d0" ["d0"] ["(" "(" "(" ")" ")" ")"])
```

### The Updated Project

Skipped — a single call to Lesson 254's own already-complete `accepts?`, with no enclosing structure of its own.

### Naming the Concept

This automaton is a genuine, honest attempt at recognizing balanced parentheses, deliberately built with only enough states to track nesting depth up to `2` exactly: `"d0"`, `"d1"`, `"d2"` mean "currently `0`, `1`, or `2` unmatched opens," `"bad"` is a trap state for an early unmatched `)`, and `"over"` means "depth `3` or deeper — I have lost exact count." From `"d2"`, reading one more `(` has nowhere honest to go, since there is no `"d3"` state — it goes to `"over"` instead. And critically, from `"over"`, reading a `)` has the same problem in reverse: the automaton does not know whether it was really at depth `3`, `4`, or higher, so it cannot know whether one `)` should bring it back down to `"d2"` or leave it still above depth `2` — so `"over"` simply stays `"over"` on every symbol, both `(` and `)`, permanently unable to recover exact tracking again.

```
depth-limited () => true
depth-limited (()) => true
depth-limited ((())) => false
depth-limited )( => false
```

`"()"` and `"(())"` — nesting depth `1` and `2` — are both handled correctly, exactly as designed. `")("` is correctly rejected — an unmatched `)` at the very start sends it straight to the `"bad"` trap. But `"((()))"` — a perfectly, genuinely balanced string, nesting depth `3` — is **incorrectly rejected**: `false`, when the honest answer is `true`. This is not a bug to fix by patching the transition table; it is the automaton's own fixed size failing, concretely and reproducibly, exactly as predicted. Lesson 66's **Pigeonhole Principle** names precisely why no amount of table-patching within this many states can ever fix it: with only three depth-tracking states (`"d0"`, `"d1"`, `"d2"`) and no upper bound at all on how deep real input can nest, *some* two different actual depths must eventually be forced to share a state once nesting exceeds what those three states can distinguish — more depths (the "items") than states (the "containers") to hold them uniquely. Once two genuinely different depths share one state, the automaton's very next transition necessarily treats them identically, and at least one of the two must therefore be decided wrong. Adding a `"d3"` state only pushes the exact same failure out to depth `4` — it does not remove it, because the input's own nesting depth has no fixed ceiling for any *finite* number of added states to finally cover.

### Mechanical Walkthrough

Every distinct syntactic element in this unit's own code, restated in full per the Repetition Rule even though every element already appeared in Lessons 254–256:

- **The ten transition-triple vectors** — `["d0" "(" "d1"]` through `["bad" ")" "bad"]` — ten three-slot vectors, the vector-as-triple shape established since Lesson 92 and reused throughout Lessons 254–255, each `[from-state input-symbol to-state]`.
- **`"("`, `")"`** — string literals used as this automaton's own two input symbols, the same role `0`/`1` played in Lesson 254 and `"letter"`/`"digit"` played in Lesson 255 — `matches-transition?`'s own `=` comparison, already fully explained in those lessons, works identically regardless of which literal values are being compared.
- **`"d0"`** (the second argument) — a string literal naming the start state.
- **`["d0"]`** (the third argument) — a one-element vector naming the sole accept state: balance requires ending back at exactly zero unmatched opens.
- **`["(" "(" "(" ")" ")" ")"]`** (the fourth argument) — the input being tested: three opens, then three closes, in that order — `"((()))"`, read one character at a time.
- **`(accepts? ...)`** — a call to Lesson 254's own `accepts?`, unmodified, doing everything Lesson 254's own Connect the Pieces section already traced in full: repeatedly calling `run-from`, which repeatedly calls `find-transition`, which itself searches via `matches-transition?`, once per input symbol, then checking the final state via `is-accept-state?`.

### CS Lens

**Context-free structure exceeding what a fixed-state automaton can track** is a hard concept, and the Pigeonhole Principle's own reappearance here — reasoning about code, not just counting objects — is worth naming directly as its own recognition.

```
Also recognized in: any real parser needing to match nested brackets,
parentheses, or braces in source code (a compiler's own syntax checker,
built on exactly this reasoning, is why source-code editors can reliably
highlight matching brackets no matter how deeply nested); XML/HTML tag
nesting (an open tag must be closed by its own matching close tag, not
just any close tag); nested function calls or nested loops in real code;
a call stack itself (Lesson 193), which is precisely how a real compiler
or interpreter actually tracks unbounded nesting depth in practice — using
memory that grows with the input, not a fixed number of states decided in
advance.
```

### SE Lens

The design principle: proving a limitation concretely, with a real, run counterexample, rather than asserting it as received wisdom ("automata can't do nesting," stated and never demonstrated). The alternative not chosen: skip building the depth-limited automaton at all, and simply state in prose that finite automata cannot recognize balanced parentheses. The real tradeoff: the prose-only version would be shorter and easier to write, and would still be true — but it would ask the reader to trust an unproven claim, the exact failure this curriculum's own schema exists to prevent (a claim about hidden or automatic behavior needs real evidence, not a confident sentence). Building the automaton, watching it correctly handle depth `1` and `2`, and then watching it concretely fail at depth `3` turns "automata cannot handle unbounded nesting" from an assertion into a demonstrated, reproducible fact this lesson's own reader can rerun and verify personally.

### Commands Needed

`bb <path-to-file>.clj`, unchanged from every lesson in this section so far.

### Run It

```
depth-limited () => true
depth-limited (()) => true
depth-limited ((())) => false
depth-limited )( => false
```

Run for real, this session, via `bb`. The third result — a real, balanced string incorrectly rejected — is the actual point of this unit, not a mistake to be corrected.

### Connection

A fixed-state automaton cannot correctly track unbounded nesting. The next unit introduces a different formal tool, built specifically to describe nested structure directly, rather than trying to force it through a fixed number of states.

---

## Concept Unit: Context-Free Grammars, Defined by Rules

### The Problem

If a finite, fixed set of states cannot describe balanced-parenthesis nesting, what kind of description *can*? The nesting itself is genuinely recursive: a balanced string is either empty, or it is one balanced piece wrapped in a matching pair of parentheses, followed by another balanced piece. Is there a formal way to write exactly that recursive definition down, precisely enough to reason about and eventually implement?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing this lesson's own build.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: None beyond ordinary prose and notation; no new Clojure code in this unit.

### The New Code

This unit's "code" is a grammar, written in the standard notation for a **context-free grammar**, not executable Clojure — the next unit turns it into real, running code directly.

```
S -> "" | "(" S ")" S
```

### The Updated Project

Not applicable — this is a from-scratch formal definition, not a modification to any existing structure.

### Naming the Concept

`S` is this grammar's **non-terminal** — indeed, its only one, and therefore also its **start symbol**: every balanced string is, by definition, whatever `S` can be expanded into. The rule itself, `S -> "" | "(" S ")" S`, is a single **production rule** offering two alternatives, separated by `|`: `S` can become the empty string (`""`, meaning "nothing" — zero symbols), or `S` can become the literal **terminal** `(`, followed by another `S`, followed by the literal terminal `)`, followed by yet another `S`. Both `(` and `)` are terminals — real symbols that appear directly in the final input, never expanded further, exactly the two symbols the depth-limited automaton in the previous unit tried and failed to track.

Trace the grammar generating `"(())"`, one expansion at a time: start with `S`. Apply the second rule: `S` becomes `( S ) S`. Expand the *first* `S` (inside the parentheses) using the second rule again: `( ( S ) S ) S`. Expand that innermost `S` using the *first* rule this time — the empty option: `( ( ) S ) S`. Expand the remaining `S` right after the inner closing paren using the first rule too: `( ( ) ) S`. Expand the final, outermost `S` using the first rule: `( ( ) )`. Every non-terminal is now gone, leaving only terminals: `"(())"` — exactly the balanced string this grammar was meant to generate. The grammar's own recursive shape — `S` appearing inside its *own* definition, wrapped in a matching pair of parentheses — is precisely what a fixed-state automaton could never express: there is no limit, anywhere in this rule, on how many times `S` can nest inside itself before finally bottoming out at the empty-string option.

### CS Lens

**Context-free grammar** is a hard concept, foundational to the rest of this curriculum's treatment of formal languages (Lesson 258's pushdown automata next, and this curriculum's own toy-language interpreter work in Section VIII, whose own grammar and parse-tree lessons this same recursive shape already underlies, though this lesson does not reopen that prior material directly).

```
Also recognized in: a programming language's own official grammar
specification (every real language's reference manual defines its syntax
this way); a markup format's nesting rules (HTML, XML, JSON's own nested
objects and arrays); a mathematical expression's own recursive structure
(an expression is a number, or two expressions joined by an operator,
possibly parenthesized — the exact shape behind every calculator and
compiler's own expression parser); a family tree or organizational chart,
where "a person's own subtree" is defined recursively in terms of smaller
subtrees the same way "a balanced string" is defined here.
```

### SE Lens

The design principle: describing structure by its own recursive shape, rather than by an enumerated, fixed set of "modes" a system can be in. The alternative not chosen: attempt to patch the previous unit's depth-limited automaton by adding more states — `"d3"`, `"d4"`, and so on. The real tradeoff, already proven concretely in the previous unit: that alternative can always be pushed one depth further by pushing nesting one level deeper — it never actually closes the gap, only moves it, no matter how many states are added. A context-free grammar's recursive definition, by contrast, has no depth limit built into its own shape at all; the same two-line rule already covers every possible nesting depth, because it describes nesting *structurally* — "a balanced piece inside parentheses" — rather than by naming a specific number of "how deep am I right now" states.

### Commands Needed

None — this unit is a formal definition, not executable code.

### Run It

Not applicable — no code to run in this unit; the grammar's own correctness was demonstrated above by hand-expanding it to `"(())"`, matching the previous unit's own second test input exactly.

### Connection

A grammar describes *what counts* as balanced, precisely, on paper. The final unit turns this exact grammar into a real, running Clojure function — one that succeeds on the very depth-`3` input the previous unit's automaton got wrong.

---

## Concept Unit: A Real Checker Derived From the Grammar

### The Problem

The grammar `S -> "" | "(" S ")" S` precisely defines balanced parentheses, but it is not itself a runnable program. What is the smallest, most direct way to turn that recursive definition into real, working Clojure code — one that actually succeeds where the depth-limited automaton failed?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, deriving directly from this lesson's own grammar above.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn balance-at [input index depth]
  (if (< depth 0)
    false
    (if (= index (count input))
      (= depth 0)
      (if (= (get input index) "(")
        (balance-at input (+ index 1) (+ depth 1))
        (balance-at input (+ index 1) (- depth 1))))))

(defn balanced? [input]
  (balance-at input 0 0))
```

### The Updated Project

Skipped — two freestanding new functions, nothing surrounding them yet.

### Naming the Concept

Rather than following the grammar's own two-alternative shape literally (which would mean deciding, at every `(`, exactly where its matching `)` is before recursing — real, harder backtracking search, in the same style as Lesson 256's own star matcher), `balance-at` uses a simpler, well-known equivalent: a running `depth` counter, standing in directly for "how many `S`-expansions are currently open, waiting for their own matching `)`." Every `(` increases `depth` by one — one more open, unmatched `S` — and every `)` decreases it by one — one of those opens has now found its match. If `depth` ever goes negative, some `)` had no open `(` left to match at all, an immediate, certain failure regardless of anything that comes later in the input. At the very end, the string is balanced exactly when `depth` has returned to `0` — every `S` that was ever opened has also been properly closed, precisely the grammar's own base case, `S -> ""`, being satisfied with nothing left unresolved.

```
balanced? () => true
balanced? (()) => true
balanced? ((())) => true
balanced? )( => false
balanced? ( => false
balanced? [] => true
balanced? ()() => true
balanced? (()(())) => true
```

The third result is the one that matters most directly: `balanced? ((()))` is `true` — this lesson's own `((()))`, at nesting depth `3`, correctly recognized as balanced, exactly the input the previous unit's own depth-limited automaton incorrectly rejected. `)(` and `(` (an unmatched close, and an unmatched open) are both correctly rejected. The empty input `[]` is correctly accepted — the grammar's own first alternative, `S -> ""`, made real. `()()`  and `(()(()))` — two balanced pieces placed one after another, and one balanced piece nested inside another — are both correctly accepted too, exactly the grammar's own "one `S`, then another `S`" and "an `S` nested inside parentheses" alternatives, both made real by the identical, unmodified code.

### Mechanical Walkthrough

Every distinct syntactic element in `balance-at` and `balanced?`, in order:

- **`input`, `index`, `depth`** — three parameters: the vector of `"("`/`")"` symbols being checked, how far into it this call has read, and the running nesting-depth counter — ordinary name bindings, reappearing in role from every indexed-recursion function this section has already built.
- **`(if (< depth 0) false ...)`** — the first check on every call: `<`, already explained in the Header, tests whether `depth` has gone negative. This check runs *before* checking whether the input is exhausted, which matters: an unmatched `)` should fail immediately, the moment it happens, not only once the whole rest of the input has also been read.
- **`(if (= index (count input)) (= depth 0) ...)`** — the base case, reached once every symbol has been read: `count`, already explained in the Header, reports the input's length; `=` checks whether `index` has reached it. If so, the honest final answer is whether `depth` is exactly `0` — every open matched, nothing left outstanding.
- **`(= (get input index) "(")`** — a call to `get`, already explained in the Header, reading the current symbol, compared via `=` against the literal `"("`.
- **`(balance-at input (+ index 1) (+ depth 1))`** (when the current symbol is `"("`) — the recursive case for an open: advance `index` by `1` via `+`, already explained in the Header, and increase `depth` by `1` — one more unmatched open now on record.
- **`(balance-at input (+ index 1) (- depth 1))`** (when the current symbol is not `"("` — meaning it is `")"`, this lesson's only other possible symbol) — advance `index` by `1`, and decrease `depth` by `1` via `-`, already explained in the Header — one open just found its match, or, if `depth` was already `0`, this produces the negative value the very next call's own first check will catch.
- **`(defn balanced? [input] (balance-at input 0 0))`** — a small wrapper, exactly Lesson 254's own `matches-pattern?`-style convenience wrapper from Lesson 256: callers supply only the input; `index` and `depth` both start at `0`, the beginning of the string and zero nesting, respectively.

**Execution trace** — `(balanced? ["(" "(" "(" ")" ")" ")"])`, matching this unit's own third `Run It` line above, and the exact input the previous unit's own automaton got wrong:

```
Call index=0 depth=0: depth>=0; input[0]="(" -> recurse index=1 depth=1
Call index=1 depth=1: depth>=0; input[1]="(" -> recurse index=2 depth=2
Call index=2 depth=2: depth>=0; input[2]="(" -> recurse index=3 depth=3
Call index=3 depth=3: depth>=0; input[3]=")" -> recurse index=4 depth=2
Call index=4 depth=2: depth>=0; input[4]=")" -> recurse index=5 depth=1
Call index=5 depth=1: depth>=0; input[5]=")" -> recurse index=6 depth=0
Call index=6 depth=0: depth>=0; (= 6 (count input) 6) -> true -> (= depth 0) -> (= 0 0) -> true
```

`depth` climbs to a real, genuine `3` at its peak — the exact nesting level the depth-limited automaton's own three states (`"d0"`, `"d1"`, `"d2"`) could not distinguish from depth `4` or higher — and `balance-at` tracks it correctly the entire way, because `depth` here is an ordinary number, not a fixed state chosen from a table decided in advance; it can grow as large as the input actually demands.

### CS Lens

The technique of replacing a **fixed-state automaton with an unbounded counter** is a hard concept in its own right — it is, informally, exactly the extra power a **pushdown automaton** (Lesson 258, next) has that an ordinary finite automaton does not.

```
Also recognized in: a text editor's own bracket-matching highlighter,
tracking nesting depth as the cursor moves through real source code; an
XML/JSON validator's own nesting-depth counter, flagging a document the
instant a close tag or brace appears with no corresponding open; a
compiler's own indentation-sensitivity check (in a language where nesting
is expressed by indentation instead of brackets); a stack-based calculator
evaluating a fully-parenthesized expression, where the running "how many
open groups are still active" count is exactly this same depth counter.
```

### SE Lens

The design principle: choosing the simplest correct implementation of the grammar's own recursive idea, rather than mechanically translating the grammar's two alternatives into two literal, backtracking recursive branches. The alternative not chosen: a direct recursive-descent matcher, trying every possible split point for where an inner `S` ends and an outer, following `S` begins — real, working code, but requiring genuine backtracking search, the same style of cost this curriculum's own Lesson 256 already measured directly. The real tradeoff: the counter-based version shown here is provably equivalent to the grammar for this specific language (an argument this unit gives directly, not just asserts: every symbol maps to exactly one depth-counter update, with no ambiguity about how to interpret it, unlike Lesson 256's own star, which genuinely could consume different numbers of repetitions) — a real, honest simplification available *because* balanced parentheses happen to have exactly this counting structure, not a general technique that works for every context-free grammar. A grammar without this special counting structure (real programming-language syntax, for instance) genuinely does need something closer to the backtracking, split-point-searching approach this unit chose not to build — Lesson 258's pushdown automata name the general machine model for exactly that harder case.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
balanced? () => true
balanced? (()) => true
balanced? ((())) => true
balanced? )( => false
balanced? ( => false
balanced? [] => true
balanced? ()() => true
balanced? (()(())) => true
```

Run for real, this session, via `bb`. All eight match the grammar's own stated rule by direct inspection, and the third matches the execution trace above exactly.

### Connection

This unit closes the lesson by succeeding, concretely, exactly where the first unit's own automaton failed — the same input, `"((()))"`, correctly recognized once nesting is tracked with a real, unbounded counter instead of a fixed set of states. Lesson 258 names the general machine model this counter is secretly already emulating: a pushdown automaton, a finite automaton extended with exactly one unbounded stack.

---

## Connect the Pieces

Follow the single input `"((()))"` through both halves of this lesson, end to end. The depth-limited automaton, in the first Concept Unit, reads it symbol by symbol through `accepts?`: `"(" "(" "("` climbs `"d0" -> "d1" -> "d2" -> "over"` — the third open already pushed it past what its three depth-states can track — and every symbol after that, `")" ")" ")"`, leaves it stuck at `"over"`, because `"over"` cannot tell how far to climb back down. It ends at `"over"`, not the lone accept state `"d0"`, and reports `false` — wrong, since the string genuinely is balanced. The second Concept Unit's grammar, `S -> "" | "(" S ")" S`, was hand-expanded to generate exactly this shape of string, showing the *correct* structure is `(` followed by a fully-balanced inner `S`, followed by `)`, followed by another (here, empty) `S`. The third Concept Unit's `balanced?` makes that structure real and checkable: reading the same six symbols, `depth` climbs `0 -> 1 -> 2 -> 3` across the three opens, genuinely reaching `3` — a real number, not a state name reused from a table of only three — then descends `3 -> 2 -> 1 -> 0` across the three closes, landing exactly on `0` at the end, and reports `true` — correct. One input, two entirely different machines, and the difference between `false` and `true` is exactly the difference this whole lesson set out to explain: a fixed number of states versus a genuinely unbounded counter.

## What Breaks Without This

Remove `balance-at`'s own negative-depth check — keep the parameter and the recursion exactly as they are, but stop testing for it:

```clojure
(defn balance-at-broken [input index depth]
  (if (= index (count input))
    (= depth 0)
    (if (= (get input index) "(")
      (balance-at-broken input (+ index 1) (+ depth 1))
      (balance-at-broken input (+ index 1) (- depth 1)))))
```

Run this for real, this session, via `bb`, on an input with one unmatched close paren immediately followed by one unmatched open — `")("` — the same input the working `balanced?` already correctly rejected in the Concept Unit above:

```
(balance-at-broken [")" "("] 0 0)
=> true
```

`true` — this input is reported as balanced, when the honest answer is `false`: the `)` at the very start has no `(` before it to match, which nothing later in the string can retroactively fix. Without the removed check, `depth` is allowed to dip to `-1` after that first symbol and then climb straight back to `0` on the very next symbol, and the base case only ever asks "did `depth` end at exactly `0`," with no memory of whether it went negative to get there. The fix is to restore the removed `(if (< depth 0) false ...)` check exactly as it appeared in the Concept Unit above; the lesson this failure teaches is that "ended at the right total" and "never became invalid along the way" are two genuinely different conditions, and a counter-based check like this one has to test both, not just the final tally.

## Exercises

1. Trace `(balanced? ["(" ")" ")"])` by hand, the same way this lesson traced `"((()))"` above, predicting exactly which call first detects the failure and why. Run it via `bb` and confirm.
2. Extend the depth-limited automaton from the first Concept Unit with a fourth depth-tracking state, `"d3"`, correctly wired in place of the current `"over"` state. Confirm it now correctly accepts `"((()))"`, then find a *new*, deeper input it still incorrectly rejects, proving the underlying limitation was only pushed one level deeper, not removed.
3. Modify `balanced?` to also track and return the maximum nesting depth actually reached during a successful check, in the style of Lesson 253's `find-least-bounded` returning a two-slot `[result extra-information]` vector instead of a bare boolean.
4. Write out, by hand, the full grammar-expansion trace (in the style shown in this lesson's second Concept Unit) that generates `"()()"` from `S -> "" | "(" S ")" S`, showing which rule is applied at each step.
5. In writing, explain why `balance-at`'s own negative-depth check has to run *before* checking whether the input is exhausted, rather than only being checked once, at the very end, alongside the final `(= depth 0)` test.

## Definition of Done

- [ ] The depth-limited automaton run on at least four inputs via `bb`, including the deliberate misclassification of `"((()))"`, reproduced and understood, not just observed.
- [ ] The balanced-parentheses grammar hand-expanded to generate at least one real string, shown step by step as this lesson's own second unit did for `"(())"`.
- [ ] `balanced?` run on at least six inputs via `bb`, including `"((()))"`, all matching this lesson's own execution trace and grammar by direct inspection.
- [ ] The negative-depth check deliberately removed from a copy of `balance-at`, the resulting real misclassification (`")()"`  wrongly accepted) reproduced via `bb`, and the check restored.
- [ ] A git commit made, with a message explaining *why*: for example, "Add Lesson 257: prove, with a real counterexample, that fixed-state automata cannot track unbounded nesting, then derive a context-free grammar and a correct counter-based checker for balanced parentheses."
