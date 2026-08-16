# Lesson 136: Constraint Satisfaction

**What you will build**: By the end of this lesson you'll take a real problem — coloring a small four-region map so that no two bordering regions share a color — and represent it as pure data, in a shared vocabulary general enough to describe scheduling and puzzle-solving with the identical shape: a fixed set of variables, each with its own domain of legal values, and a set of constraints between them. You'll build two checkers: one confirming whether a *complete* guess actually obeys every constraint, and one confirming whether a still-*partial* guess hasn't broken anything yet — the exact question Lesson 137's search needs answered after every single step, well before a full solution exists to check.

**What you need to know first**: Lesson 84's vectors and `get`; Lesson 7's `nil` and its truthiness rule; Lesson 123's graphs, as one motivating instance of this lesson's more general model; Lesson 110's specification-first discipline — checking whether a candidate satisfies a rule, before any algorithm exists to *find* one.

**Terms introduced in this lesson**:

- **constraint satisfaction problem (CSP)** — a problem posed as a fixed set of variables, each restricted to its own finite domain of legal values, together with a set of constraints restricting which combinations of values assigned variables may hold at once; solving it means finding an assignment that violates none of them. *Why it matters*: one shared vocabulary general enough to describe map coloring, exam scheduling, and puzzle-solving as the identical kind of problem, rather than each needing its own bespoke algorithm invented from scratch.
- **variable** — one unknown slot in a CSP that needs exactly one value chosen for it before the problem counts as solved. *Why it matters*: separates "the thing being decided" from "the values it could take" (its domain) and "the rules it must obey" (its constraints) — three genuinely different pieces of the same model.
- **domain** — the finite set of values one specific variable is legally allowed to take, independent of any other variable. *Why it matters*: fixes the space of choices before any searching begins — Lesson 137's search only ever tries values that already belong to a variable's own domain, never anything outside it.
- **constraint** — a restriction on which combinations of values two (or more) variables may simultaneously hold. *Why it matters*: this is the entire source of difficulty in a CSP — without constraints, every variable could be chosen independently and there would be nothing left to solve.
- **assignment** — a specific choice of value for some or all of a CSP's variables; **complete** if every variable has one, **partial** otherwise. *Why it matters*: Lesson 137's search builds a solution one variable at a time, which means almost every assignment it ever looks at is partial, not complete — a distinction this lesson's third unit depends on directly.
- **consistent assignment** — an assignment, complete or partial, that violates none of the constraints whose variables are all currently assigned. *Why it matters*: the exact question a search algorithm needs answered after every single guess, long before a complete solution exists to check at all.

**Objects and methods used**:

- **`not=`**
  - *What it is:* a function in Clojure's core library that tests whether two values are *not* equal — the direct negation of Lesson 6's `=`.
  - *Implementation:* `(not= a b)` returns `true` when `a` and `b` are unequal, `false` when they're equal — exactly `(not (= a b))` (Lesson 6's `=`, Lesson 7's `not`), spelled as one function call instead of two nested ones. Verified this session: `(not= "red" "blue")` → `true`, `(not= "red" "red")` → `false`, and `(= (not= "red" "blue") (not (= "red" "blue")))` → `true`, confirming the two spellings agree.
  - *Its use:* every constraint check in this lesson — a "must differ" constraint between two variables is exactly a `not=` demand between their assigned values.
- **`nil?`**
  - *What it is:* a function in Clojure's core library that tests whether a value is `nil` (Lesson 7) specifically, returning a real boolean rather than relying on `nil`'s own truthiness.
  - *Implementation:* `(nil? x)` returns `true` only when `x` is `nil`, `false` for every other value, including `false` itself. This is the first lesson in this curriculum to actually explain it — earlier lessons (85, 92, 109, among others) used `(nil? x)` as an "empty subtree" or "end of structure" check but only ever cited it back to Lesson 85, which itself never explained it either; per the Repetition Rule, a citation to an explanation that was never really given owes the real thing now. Verified this session: `(nil? nil)` → `true`, `(nil? false)` → `false`, `(nil? "red")` → `false`.
  - *Its use:* this lesson's third unit, to tell "this variable hasn't been assigned a value yet" apart from "this variable was assigned the value `nil`" — a distinction Lesson 7's own truthiness rule alone can't make, since `nil` and `false` are otherwise treated alike.

This lesson also reuses `get` (Lesson 84) and `count` (Lesson 94), each already covered.

---

## Concept Unit: Variables and Domains, as Data

### The Problem

A small map has four regions, numbered `0` through `3`. Each one needs a color, chosen from `"red"`, `"green"`, or `"blue"`. Before anything about *how* to choose colors, how is "region `2` may legally be red, green, or blue" written down as data at all — something the rest of this lesson's code can actually inspect, rather than a sentence only a human reader understands?

### Introduce the concept in isolation

```clojure
(def domains [["red" "green" "blue"] ["red" "green" "blue"] ["red" "green" "blue"] ["red" "green" "blue"]])
```

```
user=> (get domains 2)
["red" "green" "blue"]
user=> (get (get domains 2) 0)
"red"
```

`domains` is a vector of four vectors (Lesson 84's own vector literal, nothing new syntactically) — but what it *means* is new: index `i` names variable `i`, and `(get domains i)` is that one variable's entire legal domain. Here, every variable happens to share the identical three-color domain, but nothing about the representation requires that — variable `0` could have a shorter or entirely different list of colors, and the representation would look no different in shape.

This is called a **constraint satisfaction problem (CSP)**: a fixed set of variables (here, implicit as indices `0` through `3`), each with its own domain of legal values (`domains`), plus a set of constraints between them — not built yet, this lesson's next unit's job.

### Discard the throwaway example

Not applicable — `domains` is real, reusable data, not a throwaway.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch data representation, not a port of an existing implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def domains [["red" "green" "blue"] ["red" "green" "blue"] ["red" "green" "blue"] ["red" "green" "blue"]])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`["red" "green" "blue"]`, four times, nested in an outer `[...]`** — reappearing vector-literal-of-vector-literals (Lesson 84's own construct, and the "vector-as-triple"-style multi-slot pattern this series has reused since Lesson 92) — genuinely basic syntax, but applied here with a new representational meaning: index-as-variable-identity, value-at-that-index-as-that-variable's-own-domain.
- **`(get domains 2)`** — reappearing single-level `get` (Lesson 84): retrieves variable `2`'s own domain, the whole three-element vector, not yet a single color.
- **`(get (get domains 2) 0)`** — reappearing nested `get` (used constantly since Lesson 94's arrays and Lesson 123's matrices): drills one level further, from "variable `2`'s domain" down to "the first legal color in that domain."

### CS Lens

This `(X, D, C)` shape — variables, domains, constraints — is the **constraint satisfaction problem** formalism, and it is deliberately more general than any single problem it describes. Also recognized in: Sudoku (each cell a variable, digits `1`–`9` its domain, "no repeat in this row/column/box" its constraints), exam scheduling (each exam a variable, time slots its domain, "no student has two exams at once" its constraints), register allocation inside a real compiler (each program variable a CSP variable, physical registers its domain, "two variables live at the same time can't share a register" its constraint), and the classic N-Queens puzzle (each queen's row a variable, columns its domain). Four unrelated-sounding problems, one shared model.

### SE Lens

Separating "what values are legal" (this unit's pure data) from "how to search for values that actually work" (not yet written — Lesson 137's job) is Lesson 110's specification-first discipline applied here directly: the model can be built, inspected, and reasoned about before any solving algorithm exists at all, and — the real payoff — more than one solver could later share this identical `domains` data unchanged, the same way Lesson 135's `is-valid-flow?` never needed to know it was checking a matching rather than a literal transportation network.

---

## Concept Unit: Constraints as Data, and Checking a Complete Guess

### The Problem

`domains` alone can't express "regions `0` and `1` border each other and must differ" — that's a relationship *between* two variables, not a property either one holds alone. How is that written down, and then mechanically checked against one specific, complete guess at a coloring?

### Introduce the concept in isolation

First, a small, genuinely new piece of syntax, in isolation before it's used for real:

```
user=> (not= "red" "blue")
true
user=> (not= "red" "red")
false
user=> (= (not= "red" "blue") (not (= "red" "blue")))
true
```

This is called **negated equality**, `not=` — exactly `(not (= a b))` (Lesson 6's `=`, Lesson 7's `not`), spelled as one call instead of two nested ones. The third line proves the two spellings agree on real values, not just by claim.

Discarded — that three-line demonstration used no real project data and won't appear again. Now the real constraint representation and checker:

```clojure
(def constraints [[0 1] [0 2] [1 2] [1 3] [2 3]])

(defn constraint-satisfied? [assignment pair]
  (not= (get assignment (get pair 0)) (get assignment (get pair 1))))

(defn all-constraints-satisfied? [assignment constraints i]
  (if (>= i (count constraints))
    true
    (if (constraint-satisfied? assignment (get constraints i))
      (all-constraints-satisfied? assignment constraints (+ i 1))
      false)))
```

```
user=> (all-constraints-satisfied? ["red" "green" "blue" "red"] constraints 0)
true
user=> (all-constraints-satisfied? ["red" "red" "blue" "green"] constraints 0)
false
```

`constraints` is `C`: a vector of pairs, each naming two variable indices that must not share a value — a **not-equal constraint**, the specific kind this lesson's map needs (the general CSP definition allows any restriction, not only "must differ"). Region `0` borders `1` and `2`; region `1` borders `0`, `2`, and `3`; region `2` borders `0`, `1`, and `3`; region `3` borders `1` and `2` only — `0` and `3` don't border each other at all, which is exactly why `[0 3]` is absent from `constraints`. `assignment` is a vector shaped identically to `domains`, but holding one concrete chosen value per variable instead of a menu of options. The first guess — red, green, blue, red — passes every one of the five constraints; the second fails at the very first one checked, `[0 1]`, since both regions were colored red.

### Discard the throwaway example

Already discarded above, before this real code — `constraints`, `constraint-satisfied?`, and `all-constraints-satisfied?` are all real, hand-verified, reusable.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch checker for this lesson's own data representation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn constraint-satisfied? [assignment pair]
  (not= (get assignment (get pair 0)) (get assignment (get pair 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[[0 1] [0 2] [1 2] [1 3] [2 3]]`** — reappearing vector-of-pairs (Lesson 135's own edge-list style), applied here to a new meaning: each pair is one constraint, `C`, not a graph edge — even though it happens to look identical to how Lesson 123 would represent this same map's border adjacency.
- **`(get pair 0)`, `(get pair 1)`** — reappearing vector-as-pair access (Lesson 85 onward): pulls the two variable indices a constraint names.
- **`(get assignment (get pair 0))`** — reappearing nested `get`: looks up the *value currently assigned* to whichever variable the constraint's first slot names, not the variable index itself.
- **`not=`** — first appearance, just isolated and named above: the actual "must differ" check, applied to the two looked-up values.
- **`(if (>= i (count constraints)) true ...)`** — reappearing scan-with-index-bound shape, the same structure as Lesson 134's `all-capacity-ok?` and Lesson 128's `uf-components-from`: once every constraint has been checked, report success.
- **`(constraint-satisfied? assignment (get constraints i))`** — reappearing recursive-scan-over-a-vector call, one constraint at a time.

### CS Lens

Each constraint here is a **binary constraint** — exactly two variables — the simplest, most common case; the general CSP model permits constraints over any number of variables at once (a "no three exams share this time slot" rule would be ternary), though every constraint this lesson builds stays binary. This specific "must differ, connected pair" shape is precisely Lesson 123's graph-edge representation, reused for an entirely different reason: not "these are connected," but "these may not match."

### SE Lens

Checking constraints as a generic scan over data — rather than one large hand-written boolean expression naming every pair explicitly (`(and (not= r0 r1) (not= r0 r2) (not= r1 r2) ...)`) — means `all-constraints-satisfied?`'s own code never has to change when the map's shape changes; only the `constraints` data does. This is the same separation-of-rule-from-instance this lesson's first unit already made for domains, applied now to relationships between variables instead of values within one.

### Connection to the previous unit

The previous unit gave every variable its own menu of legal values; this unit adds the relationships between them and, for the first time, actually checks a full guess against both pieces together.

---

## Concept Unit: Partial Assignments — Consistency Before Completion

### The Problem

Lesson 137's search will build a guess one variable at a time, trying a value, checking it, and backtracking if it fails — which means most of the time, the "assignment" it's holding is *incomplete*: some slots still have no real value at all. What should `(get assignment 3)` even return before variable `3` has been decided, and what happens if the previous unit's `all-constraints-satisfied?` is run on a guess like that?

### Introduce the concept in isolation

An unassigned variable is represented the same way Lesson 7's own truthiness rule already treats "nothing": `nil`.

```
user=> (all-constraints-satisfied? ["red" nil "blue" nil] constraints 0)
false
```

That result is wrong, in two different directions at once, even though the code ran without error. Tracing every pair by hand: `[0 1]` compares `"red"` to `nil` — genuinely different, so `constraint-satisfied?` reports it as *satisfied* — but variable `1` was never actually decided; nothing was really proven consistent there, `not=` just happened to be true because `nil` isn't `"red"`. `[1 2]` compares `nil` to `"blue"` — the identical false pass. `[1 3]` compares `nil` to `nil` — and those *are* equal, so `constraint-satisfied?` reports a *violation*, the false `all-constraints-satisfied?` returned above — even though neither variable `1` nor variable `3` has ever been given a real color. Two completely undecided variables get flagged as conflicting with each other, purely because `nil` equals itself.

This is called `nil?`: a function testing whether a value is `nil` specifically.

```
user=> (nil? nil)
true
user=> (nil? false)
false
user=> (nil? "red")
false
```

`nil?` returns a real boolean rather than relying on `nil`'s own truthiness (Lesson 7) — needed here because `false` is *also* falsy under that rule, but `false` is a perfectly legal color choice in a different CSP, while `nil` specifically means "not chosen yet." Truthiness alone can't tell those two apart; `nil?` can.

With that in hand, a corrected checker: skip any constraint touching a variable that isn't decided yet, rather than comparing against `nil` as if it were a real value.

```clojure
(defn pair-consistent? [assignment pair]
  (if (nil? (get assignment (get pair 0)))
    true
    (if (nil? (get assignment (get pair 1)))
      true
      (not= (get assignment (get pair 0)) (get assignment (get pair 1))))))

(defn assignment-consistent? [assignment constraints i]
  (if (>= i (count constraints))
    true
    (if (pair-consistent? assignment (get constraints i))
      (assignment-consistent? assignment constraints (+ i 1))
      false)))
```

```
user=> (assignment-consistent? ["red" nil "blue" nil] constraints 0)
true
user=> (assignment-consistent? ["red" "red" nil nil] constraints 0)
false
```

The first call — the exact same partial guess that broke the previous unit's checker — now correctly reports `true`: nothing has actually gone wrong yet, only some variables are still undecided. The second call correctly reports `false`: variables `0` and `1` are *both* assigned, both `"red"`, a genuine conflict `assignment-consistent?` catches immediately, even though variables `2` and `3` remain untouched.

### Discard the throwaway example

Not applicable — every function shown is real, reusable, and hand-verified against both a correct and an incorrect partial guess.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch fix to this lesson's own checker, motivated by the bug demonstrated above.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn pair-consistent? [assignment pair]
  (if (nil? (get assignment (get pair 0)))
    true
    (if (nil? (get assignment (get pair 1)))
      true
      (not= (get assignment (get pair 0)) (get assignment (get pair 1))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? (get assignment (get pair 0)))`** — first real use of `nil?`, just isolated and named above: checks whether the constraint's *first* variable has been assigned anything yet.
- **`(if (nil? ...) true ...)`** — first appearance of this specific idea: treating "not yet decided" as automatically consistent, rather than comparing against `nil` as if it were a real color — the actual fix for the previous unit's bug.
- **`(nil? (get assignment (get pair 1)))`**, nested inside the first `if`'s else-branch — the same check, repeated for the constraint's *second* variable, only reached once the first is confirmed assigned.
- **`(not= (get assignment (get pair 0)) (get assignment (get pair 1)))`** — reappearing (this lesson's second unit): the real comparison, now only reached once both variables are confirmed to hold actual values, never a `nil`.
- **`assignment-consistent?`** — reappearing scan-with-index-bound shape (this lesson's second unit's `all-constraints-satisfied?`), unchanged in structure, calling `pair-consistent?` instead of `constraint-satisfied?`.

### CS Lens

A **consistent** partial assignment (violates nothing checkable *so far*) is a strictly weaker, different claim than a **complete, satisfying** assignment (violates nothing *at all*, with every variable decided). Search needs the weaker question answered after every single step, and the stronger one only once, at the very end. Also recognized in: a type checker accepting a partially-written expression as "not yet wrong" rather than demanding the whole program first; a compiler's incremental syntax checking as code is typed; a database rejecting one bad statement inside a transaction immediately, rather than waiting until commit to check everything at once.

### SE Lens

Treating "undecided" as automatically consistent — rather than either crashing on a `nil` or silently miscomparing it, this unit's own opening bug — is a deliberate design choice with a real alternative: require every variable to be assigned before checking anything at all, i.e., only ever call the previous unit's `all-constraints-satisfied?`. That alternative would force Lesson 137's search to build an entire speculative guess before learning it was already broken, discovering failures as late as possible. Checking consistency incrementally, as each variable is assigned, lets a bad partial choice be abandoned the moment it goes wrong instead.

### Connection to the previous unit

The previous unit could only judge a guess once every variable was already filled in; this unit judges a guess at any point along the way, including the very first variable assigned — exactly what a step-by-step search needs and a complete-only checker cannot provide.

---

## Connect the Pieces

One variable assigned at a time, checked after each step, exactly the shape Lesson 137's search will repeat:

```clojure
(println "Assign 0 = red:" (assignment-consistent? ["red" nil nil nil] constraints 0))
(println "Assign 1 = blue:" (assignment-consistent? ["red" "blue" nil nil] constraints 0))
(println "Assign 2 = red (conflicts with 0):" (assignment-consistent? ["red" "blue" "red" nil] constraints 0))
```

```
Assign 0 = red: true
Assign 1 = blue: true
Assign 2 = red (conflicts with 0): false
```

Variable `0`'s own color, chosen first, is still the thing that eventually breaks the third step — `assignment-consistent?` catches the `[0 2]` conflict the instant it happens, with variable `3` never even assigned. This is the entire reason this lesson built a partial checker at all: Lesson 137 needs exactly this "stop here, this branch already failed" signal, one variable at a time, not just a final yes-or-no on a finished guess.

## What Breaks Without This

Suppose Lesson 137's search used the second unit's `all-constraints-satisfied?` directly, instead of this unit's `assignment-consistent?`, while building up a guess one variable at a time. Every single intermediate check — after assigning just the first variable, or the first two — would compare real values against `nil` for every variable not yet reached, exactly this unit's own opening demonstration: some constraints would falsely "pass" (a real color happens to differ from `nil`), and others would falsely "fail" (two different, still-undecided variables both read as `nil`, which are equal to each other). A search trusting that checker would sometimes abandon a perfectly good partial guess for no real reason, and sometimes accept one that was already broken — both silent, and both worse than a crash, because nothing would ever signal that the check itself was answering the wrong question.

## Exercises

1. **Trace.** By hand, confirm `(all-constraints-satisfied? ["red" nil "blue" nil] constraints 0)` reaches `false` specifically at constraint `[1 3]`, comparing `nil` to `nil` — reproducing this lesson's own opening bug.
2. **Predict.** Before checking, predict `(assignment-consistent? ["red" "green" "red" nil] constraints 0)` — regions `0` and `2` both red. Then verify.
3. **Verify.** On the completed assignment `["red" "green" "blue" "red"]`, confirm `all-constraints-satisfied?` and `assignment-consistent?` agree — both `true` — showing the two checkers never disagree once nothing is left `nil`.
4. **Break it, on purpose.** Construct an assignment with two *different* unassigned (`nil`) variables that `all-constraints-satisfied?` incorrectly flags as conflicting, and confirm `assignment-consistent?` correctly reports `true` on the identical assignment. Identify which specific constraint pair the buggy checker fails on.
5. **Generalize.** Describe, without coding it, how `domains` (this lesson's first unit) could be used to check a second kind of legality — "is this assigned value even in this variable's own domain" — separately from `assignment-consistent?`'s "does it conflict with an already-assigned neighbor."
6. **Reconstruct.** Close this lesson. From memory, explain why a search algorithm needs "consistent so far," not "fully satisfied," answered after every single step, not only at the end.

## Definition of Done

- [ ] You can represent a CSP's variables, domains, and constraints as plain vectors, matching this lesson's `domains`/`constraints` shapes.
- [ ] You can check whether a *complete* assignment satisfies every constraint using `all-constraints-satisfied?`.
- [ ] You can explain, concretely, the two different ways `all-constraints-satisfied?` gives a wrong answer on a partial assignment.
- [ ] You can check whether a *partial* assignment is still consistent using `assignment-consistent?`, and explain why it treats an unassigned variable as automatically consistent.
- [ ] You completed Exercise 3 and confirmed both checkers agree on a complete assignment.
- [ ] You completed Exercise 4 and identified the exact constraint pair the buggy checker fails on.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm all-constraints-satisfied?/assignment-consistent? agree once complete; identify [1 3]-style nil=nil false conflict"` — not just `"lesson 136 exercise"`.

---

**Next lesson:** Lesson 137, *Search, Pruning, and Heuristics*, actually searches this lesson's `domains`/`constraints` representation for a real solution — trying a value for one variable at a time, using `assignment-consistent?` to prune a branch the moment it goes wrong instead of wastefully completing it first, and derives ways to shrink an otherwise enormous search space.
