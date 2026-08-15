# Lesson 37: Recursion vs Iteration

**What you will build**: By the end of this lesson you'll be able to write the same computation as either a self-recursive function or an explicit `loop`, see that Clojure's `recur` makes the two nearly identical under the hood, and understand precisely what's gained and lost by choosing one shape over the other — not a vague style preference, but a real difference in how directly each shape connects back to this section's proof techniques.

**What you need to know first**: Lesson 34's accumulators and Lesson 35's `recur` — this lesson introduces `loop`, `recur`'s other allowed target, and compares it directly against the self-recursive functions this section has written throughout.

**Terms introduced in this lesson**:

- **iteration** — repeating a computation by updating a fixed set of variables across repeated passes, rather than by a function calling itself. *Why it matters*: names the general alternative to recursion this lesson compares directly, realized in Clojure specifically through `loop` and `recur` together.

**Objects and methods used**:

- **`loop`**
  - *What it is:* a special form in Clojure that establishes a recursion point with initial variable bindings, which `recur` (Lesson 35) can jump back to.
  - *Implementation:* `(loop [var1 init1 var2 init2 ...] body)` — evaluates `body` with `var1`, `var2`, and so on bound to their initial values; a `recur` inside `body` rebinds them to new values and re-evaluates `body`, without growing the stack, exactly the way `recur` inside a `defn` jumps back to the function's own start.
  - *Its use:* Concept Unit 2, to express a computation using explicit iteration instead of a separately named recursive function.

---

## Concept Unit: The Same Computation, Two Different Shapes

### The Problem

`list-sum-acc` (Lessons 34–35) needs its own name, its own accumulator parameter, and a caller who remembers to supply `0` as that accumulator's starting value every time it's called. Is a separately named function actually necessary just to sum a list — or is that structure doing more than the computation itself strictly requires?

### Introduce the concept in isolation

Recall `list-sum-acc`, exactly as Lesson 35 left it:

```clojure
(defn list-sum-acc [lst acc]
  (if (empty? lst)
    acc
    (recur (rest lst) (+ acc (first lst)))))
```

```
user=> (list-sum-acc (list 1 2 3) 0)
6
```

Every call site needs to remember two things: the function's name, and to pass `0` as the starting accumulator. Nothing about *this specific summing task* actually needs a separately named, independently callable function — it's a self-contained loop that happens to be written using `defn` and `recur` together. The next unit shows the same computation, expressed as an explicit loop instead.

### Discard the throwaway example

Not applicable — this re-examines an already-established function, setting up its direct comparison.

### Generalizing

This tension — does a repeated computation need its own name, or is it a one-off, self-contained repetition — recurs throughout programming, in every language. Clojure's answer for the "one-off, self-contained" case is the subject of the next unit.

### CS Lens

The underlying question — recursion versus **iteration** — long predates Clojure, and in most languages the two are implemented completely differently (a loop keyword, versus a stack of function calls). Clojure's `recur`, usable both inside a `defn` and inside a `loop`, is comparatively unusual: both cases compile to the identical constant-space mechanism, making the choice between them almost entirely about *code organization*, not performance.

### SE Lens

`list-sum-acc`'s named-function shape is the right choice when the summing behavior needs to be called from multiple places, tested independently, or reused generally (Lesson 4's original reuse argument). When none of that applies — the accumulation is needed once, inline, as part of some larger function — a separate name and an externally-supplied starting accumulator are pure overhead, motivating the next unit's alternative.

---

## Concept Unit: `loop` — Iteration Without a Separate Named Function

### The Problem

Is there a way to get `recur`'s constant-space, accumulator-carrying behavior without needing a separately named function and an externally-supplied starting value?

### Introduce the concept in isolation

```clojure
(defn list-sum-loop [lst]
  (loop [remaining lst
         acc 0]
    (if (empty? remaining)
      acc
      (recur (rest remaining) (+ acc (first remaining))))))
```

```
user=> (list-sum-loop (list 1 2 3 4))
10
```

`list-sum-loop` takes a single argument, `lst` — exactly the same calling convention as the original, non-accumulator `list-sum` (Lesson 27) — but internally, `loop` establishes two local bindings, `remaining` (starting at `lst`) and `acc` (starting at `0`), and `recur` inside the loop's body rebinds both, jumping back to the top of the `loop` rather than the top of `list-sum-loop` itself. The accumulator is now an internal implementation detail, entirely invisible to anyone calling `list-sum-loop` — `list-sum-acc`'s externally-visible second parameter has become `loop`'s own internal, initialized-once binding.

### Discard the throwaway example

Not applicable — `list-sum-loop` is a real, reusable function.

### Project Change

- **Reference Source**: `list-sum-acc`, from Lesson 35, serves as the direct function this unit reshapes.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn list-sum-loop [lst]
  (loop [remaining lst
         acc 0]
    (if (empty? remaining)
      acc
      (recur (rest remaining) (+ acc (first remaining))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`loop`** — first appearance (covered fully in Objects and methods used, above): establishes `remaining` and `acc` as local bindings (Lesson 3's binding vocabulary, reused inside a new construct), initialized once, at the start.
- **`(recur (rest remaining) (+ acc (first remaining)))`** — reappearing `recur` (Lesson 35), but this time jumping back to `loop`'s own bindings rather than to `list-sum-loop`'s parameter list — the *same mechanism*, targeting a different recursion point.

### CS Lens

`loop` followed immediately by a matching `recur` is functionally identical to a self-recursive helper function with an accumulator parameter, called once with the initial values — Clojure gives both the same underlying constant-space guarantee, and the choice between them is a question of *scope and naming*, not capability: does this repetition deserve its own name and independent callability, or is it a private detail of one larger function?

### SE Lens

`list-sum-loop`'s single-argument calling convention is a genuine usability improvement over `list-sum-acc`'s two-argument one — callers never need to know or remember that summing is internally implemented with an accumulator starting at `0`, the same encapsulation benefit Lesson 30's `tree-value`/`tree-left`/`tree-right` accessor functions already provided for tree structure.

### Connection to the previous unit

The previous unit identified that `list-sum-acc`'s named-function shape carries real overhead when the accumulation is only ever needed once, inline; this unit is Clojure's direct answer — the identical computation, the identical constant-space guarantee, without a separately named, externally-parameterized function.

---

## Concept Unit: Reasoning Advantages — Why the Recursive Shape Still Matters

### The Problem

`list-sum-acc` and `list-sum-loop` compute identically and run identically. Is there any real reason to prefer one over the other beyond calling convention — specifically, does either one connect more directly to this section's proof techniques?

### Introduce the concept in isolation

Recall Lesson 21's structural recursion: `list-sum`'s *original*, non-accumulator shape (Lesson 27) mirrored Lesson 19's recursive list definition directly — an empty-list base case, and a recursive case built from `(first lst)` and a smaller list, `(rest lst)`. That direct correspondence is exactly what made Lesson 20's "derive the function from the definition" method work, and what made a Lesson 15-style induction proof (base case, then a step that holds for an arbitrary smaller case) apply to it almost automatically.

`list-sum-loop`'s `loop`/`recur` body still performs the identical checks (`empty?`, then process `first`, recurse on `rest`) — the connection to the list's own recursive definition hasn't actually disappeared, but it's less visually immediate: `loop`'s bindings (`remaining`, `acc`) are plain local variables, updated in place across passes, rather than a function being handed a genuinely smaller instance of the same recursively-defined data at each call. Proving `list-sum-loop` correct by induction still works — the underlying reasoning is identical to `list-sum-acc`'s — but stating that proof requires translating "what does `loop`'s binding become on each pass" back into "what does the inductive step actually claim," an extra step `list-sum`'s original, directly structurally recursive shape never needed.

### Discard the throwaway example

Not applicable — this is a direct comparison between two already-written, already-verified functions.

### CS Lens

This tradeoff is exactly why Lesson 21 (*Structural Recursion*) and this section's whole "derive the function from the data definition" method were taught using genuinely self-recursive functions, not loops: the correspondence between a recursive function's shape and a recursive definition's own base case and recursive case is direct and visible, which is precisely what made deriving `sum-to`, `factorial`, and `tree-sum` feel close to mechanical. A `loop`, while computationally equivalent once `recur` is involved, doesn't carry that same visible correspondence — it's a real, practical tool, but not the clearest *teaching* shape for a genuinely new recursive definition.

### SE Lens

Neither shape is simply "better" — this is a real engineering tradeoff, not a rule with one correct answer: a self-recursive function (like `list-sum-acc`) makes the connection to the underlying recursive data definition easiest to see and prove, and is independently reusable and testable; a `loop` (like `list-sum-loop`) is more convenient when the repetition is genuinely private to one larger function and doesn't need its own name, at some cost to how directly the code's shape mirrors the reasoning behind its correctness. Choosing between them, deliberately, based on which property matters more for a specific piece of code, is the actual skill — not memorizing that one is always preferred.

### Connection to the previous unit

The previous unit showed `loop` provides the identical computational power as a self-recursive accumulator function, with better encapsulation; this unit is the honest accounting of what that convenience costs — a slightly less direct connection to the recursive-definition-driven reasoning this entire section has been built around.

---

## Connect the Pieces

All three shapes for summing a list, confirmed to agree, with their tradeoffs stated plainly:

```clojure
(println "list-sum (Lesson 27, structurally direct, no recur):" (list-sum (list 1 2 3 4 5)))
(println "list-sum-acc (Lesson 35, named, recur, external accumulator):" (list-sum-acc (list 1 2 3 4 5) 0))
(println "list-sum-loop (this lesson, internal accumulator via loop):" (list-sum-loop (list 1 2 3 4 5)))
```

```
list-sum (Lesson 27, structurally direct, no recur): 15
list-sum-acc (Lesson 35, named, recur, external accumulator): 15
list-sum-loop (this lesson, internal accumulator via loop): 15
```

All three agree. `list-sum` most directly mirrors Lesson 19's recursive list definition, at the cost of no constant-space guarantee. `list-sum-acc` gets the constant-space guarantee and stays independently callable and testable, at the cost of an externally-visible accumulator parameter. `list-sum-loop` gets the constant-space guarantee *and* hides the accumulator, at the cost of a less direct visual connection to the list's own recursive definition. No single one of the three is correct in every situation — each trades one property for another, deliberately.

## What Breaks Without This

Suppose `list-sum-loop`'s internal accumulator logic were subtly wrong — say, `acc` started at `1` instead of `0`, a plausible typo:

```clojure
(defn broken-list-sum-loop [lst]
  (loop [remaining lst
         acc 1]
    (if (empty? remaining)
      acc
      (recur (rest remaining) (+ acc (first remaining))))))
```

```
user=> (broken-list-sum-loop (list 1 2 3))
```

This produces `7`, not `6` — off by exactly the wrong starting value, `1`. Because the accumulator is now hidden entirely inside `loop`'s own bindings, a caller has no way to notice anything is wrong except by getting an incorrect answer — unlike `list-sum-acc`, where an external caller supplying the accumulator explicitly might at least have a chance to notice a suspiciously wrong starting value passed at the call site. This is the concrete cost of `loop`'s encapsulation benefit: hiding an implementation detail also hides any mistake made inside it, one more reason Concept Unit 3's tradeoff is real, not just theoretical.

## Exercises

1. **Trace.** By hand, trace `(list-sum-loop (list 10 20 30))`, tracking `remaining` and `acc` at each pass, the way Lesson 34 traced `list-sum-acc`.
2. **Predict.** Before running it, predict `(broken-list-sum-loop (list))` — an empty list, with the buggy starting accumulator. Does the bug still manifest on this input? Why or why not?
3. **Convert.** Rewrite `factorial` (Lesson 20) as a `loop`-based function, `factorial-loop`, taking a single argument the way the original did. Verify it against `factorial` on at least two inputs.
4. **Break it, on purpose.** Deliberately introduce the same category of mistake "What Breaks Without This" described (a wrong starting value) into your Exercise 3 `factorial-loop`, and confirm it produces a wrong answer with no visible sign of the error at the call site.
5. **Generalize.** `reverse-acc` (Lesson 28) has the identical named-function-with-external-accumulator shape as `list-sum-acc`. Rewrite it as `reverse-loop`, using `loop`, taking a single argument.
6. **Reconstruct.** Close this lesson. From memory, state one genuine advantage each of `list-sum`, `list-sum-acc`, and `list-sum-loop` has over the other two — not just "they're different," but the specific property each one uniquely provides.

## Definition of Done

- [ ] You can rewrite a named, accumulator-based recursive function as a `loop`-based one, and explain what calling convention changed.
- [ ] You completed Exercise 3 (`factorial-loop`) and Exercise 5 (`reverse-loop`), each verified against its original.
- [ ] You can state, precisely, why a `loop`'s hidden accumulator makes a starting-value bug harder for a caller to notice than an external accumulator parameter would.
- [ ] You can state one genuine, specific advantage of each of the three shapes covered in this lesson, not a vague preference.
- [ ] Commit `factorial-loop` and `reverse-loop` to your notes repository, with a commit message stating which of the three shapes (direct recursion, named accumulator, or `loop`) you chose and why for each — for example, `"Add factorial-loop and reverse-loop — chose loop for both since neither accumulator needs to be externally visible"` — not just `"lesson 37 exercise"`.

---

**Next lesson:** Lesson 38, *Memoization*, returns to a cost this section already found and named — Lesson 23's `fib`, recomputing identical subproblems many times over — and derives a general technique for eliminating exactly that waste, applicable to any recursive function with the same overlapping-subproblems property.
