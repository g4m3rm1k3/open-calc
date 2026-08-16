# Lesson 181: Static Analysis

**What you will build**: By the end of this lesson you'll build `free-vars`, a real analysis answering "which outer variables does this expression actually depend on" without ever running it — `["fn" "y" ["add" ["var" "x"] ["var" "y"]]]` correctly reports only `["x"]` as free, since `"y"` is bound by the function's own parameter, and a function using its own parameter twice, `["fn" "x" ["add" ["var" "x"] ["var" "x"]]]`, correctly reports no free variables at all.

**What you need to know first**: Lesson 174's `mentions?`, revisited here with a genuinely different question; Lesson 165's closures and their own captured-environment idea, revisited as exactly what "free variable" means.

**Terms introduced in this lesson**:

- **static analysis** — deriving real, useful information about a program without executing it. *Why it matters*: the general name for what Lesson 173's type checker and Lesson 174's type inference both already were — this lesson applies the identical discipline to a genuinely different question.
- **free variable** — a variable referenced inside an expression but not bound by any enclosing `"fn"` within that same expression. *Why it matters*: exactly the set of names a closure (Lesson 165) actually needs to capture from its defining environment — everything else, the function's own bound parameters, it never needs to reach outside itself for.

**Objects and methods used**: None new. This lesson reuses `cond`/`if` (Lesson 151, Lesson 7) and `assoc`/`get`/`count` (Lesson 84, Lesson 94), each already covered.

---

## Concept Unit: Which Names Are Bound, and Which Are Free

### The Problem

Lesson 174's `mentions?` finds every use of one specific name. Answering "which names does this whole expression depend on from *outside* itself" needs something different — every name used, *except* the ones a `"fn"` node binds locally, within its own body.

### Introduce the concept in isolation

```clojure
(declare in-bound?)
(defn in-bound? [name bound i]
  (if (>= i (count bound))
    false
    (if (= (get bound i) name)
      true
      (in-bound? name bound (+ i 1)))))

(declare free-vars merge-free)
(defn free-vars [ast bound]
  (cond
    (number? ast) []
    (= (get ast 0) "var") (if (in-bound? (get ast 1) bound 0) [] [(get ast 1)])
    (= (get ast 0) "fn") (free-vars (get ast 2) (assoc bound (count bound) (get ast 1)))
    true (merge-free (free-vars (get ast 1) bound) (free-vars (get ast 2) bound))))
```

```
user=> (free-vars ["add" ["var" "x"] ["var" "y"]] [])
["x" "y"]
user=> (free-vars ["fn" "y" ["add" ["var" "x"] ["var" "y"]]] [])
["x"]
```

`free-vars` walks the AST tracking `bound` — every name a `"fn"` node has locally introduced so far. A `"var"` node contributes its own name only if it's *not* already in `bound`. Reaching a `"fn"` node adds its parameter to `bound` before recursing into its body — so `["fn" "y" ["add" ["var" "x"] ["var" "y"]]]` correctly reports only `["x"]`: `"y"` is bound by the `"fn"` itself, `"x"` is not, and is genuinely free.

### Discard the throwaway example

Not applicable — `free-vars`/`in-bound?` are real, reusable, and verified against both an unbound expression and one with a real local binding.

### Project Change

- **Reference Source**: Lesson 174's own `mentions?`, restructured here to track bound names rather than search for one specific name.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn in-bound? [name bound i]
  (if (>= i (count bound))
    false
    (if (= (get bound i) name)
      true
      (in-bound? name bound (+ i 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`in-bound?`** — reappearing scan-with-index shape (used constantly since Lesson 94): a plain linear search, checking whether `name` appears anywhere in `bound`.
- **`(if (in-bound? (get ast 1) bound 0) [] [(get ast 1)])`**, in the `"var"` branch — first appearance of this specific idea: a bound name contributes nothing; a free one contributes itself, as a one-element result.
- **`(free-vars (get ast 2) (assoc bound (count bound) (get ast 1)))`**, in the `"fn"` branch — reappearing `assoc`-as-append (Lesson 94): the parameter joins `bound` *before* recursing into the body, so every reference to it inside correctly counts as bound.

### CS Lens

`bound`, threaded through `free-vars`, is doing exactly what Lesson 165's closures already do at runtime — tracking which names are locally available versus which must come from outside — the identical distinction, checked here statically, before any real environment or closure exists at all.

### SE Lens

`free-vars` answers, without running anything, exactly what Lesson 165's own `call-closure` needs at runtime: which names a function's captured environment actually has to supply — a real, useful fact derivable in advance, rather than only discoverable by running the function and seeing what breaks.

---

## Concept Unit: A Function Depending on Nothing Outside Itself

### The Problem

Can a function be shown to depend on *nothing* from its outer environment at all — every name it uses being one it binds itself?

### Introduce the concept in isolation

```clojure
(defn merge-step [a b i]
  (if (>= i (count b))
    a
    (merge-step (if (in-bound? (get b i) a 0) a (assoc a (count a) (get b i))) b (+ i 1))))
(defn merge-free [a b] (merge-step a b 0))
```

```
user=> (free-vars ["fn" "x" ["add" ["var" "x"] ["var" "x"]]] [])
[]
```

`["fn" "x" ["add" ["var" "x"] ["var" "x"]]]` — a function adding its own parameter to itself — reports *no* free variables at all. Both references to `"x"` inside the body are bound by the `"fn"`'s own parameter; `merge-free` combines the two branches' own free-variable lists without duplicating `"x"` twice, and since neither branch ever contributes it in the first place (both are correctly bound), the empty result is exactly right, not a coincidence of deduplication.

### Discard the throwaway example

Not applicable — real, verified output confirming an entirely self-contained function.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch merge helper for this lesson's own two-branch AST nodes.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn merge-free [a b] (merge-step a b 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (in-bound? (get b i) a 0) a (assoc a (count a) (get b i)))`**, in `merge-step` — first appearance of this specific idea: combines two free-variable lists without adding a name already present in the first — a real, if small, set-union operation, avoiding double-counting a name free in both branches of an `"add"`.

### CS Lens

A function with zero free variables is exactly a **closed term**: fully self-contained, needing nothing at all from any enclosing environment to run correctly — the strongest possible case of Lesson 165's own environment-capture idea, where the captured environment could be empty and the function would still behave identically.

### SE Lens

Knowing in advance that a function is closed — no free variables — is real, useful information: such a function can be safely moved, serialized, or run in a completely different context with no risk of a missing variable, a guarantee `free-vars` provides *before* ever attempting any of those things, not discovered by trying and failing.

### Connection to the previous unit

The previous unit found free variables in a simple case; this unit shows the analysis correctly recognizes the *absence* of any — proving the bound-tracking mechanism works precisely, not just for the easy case.

---

## Connect the Pieces

Two functions, one depending on the outside world, one entirely self-contained:

```clojure
(println "Depends on x:" (free-vars ["fn" "y" ["add" ["var" "x"] ["var" "y"]]] []))
(println "Depends on nothing:" (free-vars ["fn" "x" ["add" ["var" "x"] ["var" "x"]]] []))
```

```
Depends on x: [x]
Depends on nothing: []
```

The identical analysis, no execution required for either, correctly distinguishing a function that genuinely needs something from outside itself from one that doesn't need anything at all.

## What Breaks Without This

Suppose a program tried to move a closure to a different part of a system — serializing it, sending it elsewhere, running it later — without first checking whether it had any free variables. A closure depending on `"x"` from its defining environment, moved somewhere `"x"` was never available, would fail the moment it actually ran, potentially far from and long after the actual mistake (choosing to move an unsuitable closure) was made. `free-vars`, checked *before* attempting the move, turns "will this closure work somewhere else" from a question only answerable by trying into one answerable in advance, with a real, checkable answer.

## Exercises

1. **Trace.** By hand, trace `(free-vars ["fn" "y" ["add" ["var" "x"] ["var" "y"]]] [])` through `free-vars`, confirming exactly where `"y"` gets added to `bound`.
2. **Predict.** Before checking, predict the free variables of `["fn" "x" ["fn" "y" ["add" ["var" "x"] ["var" "z"]]]]` — a function inside a function. Then verify.
3. **Verify.** Confirm `(free-vars ["add" ["var" "a"] ["var" "a"]] [])` reports `"a"` only once, not twice, proving `merge-free` correctly avoids duplication.
4. **Break it, on purpose.** Modify `free-vars`'s `"fn"` branch to *not* add the parameter to `bound` before recursing, and describe the real, wrong result this produces for a function referencing its own parameter.
5. **Generalize.** Describe, without coding it, how `free-vars` would need to change to also handle `"pair"`/`"fst"`/`"snd"` nodes (Lesson 177), which this lesson's own version never accounted for.
6. **Reconstruct.** Close this lesson. From memory, explain why a function with zero free variables is genuinely safer to move to a different context than one with free variables — using this lesson's own two examples, not a general statement.

## Definition of Done

- [ ] You can build a free-variable analysis that correctly tracks which names are locally bound.
- [ ] You can identify a genuinely closed (zero free variable) function and explain why that matters.
- [ ] You can explain why `free-vars` is static analysis — real information, derived without running anything.
- [ ] You completed Exercise 2 and correctly predicted the free variables of a nested function.
- [ ] You completed Exercise 4 and described the real, wrong result from an incorrect binding implementation.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm nested fn correctly reports x and z as free, y bound; show skipping the fn binding step wrongly reports a function's own parameter as free"` — not just `"lesson 181 exercise"`.

---

**Next lesson:** Lesson 182, *Interpreters and Compilers*, steps back to compare this whole section's own approach — walking the AST directly, every time — against translating it into some other form first, the real spectrum this section's interpreter has sat at one end of the entire time.
