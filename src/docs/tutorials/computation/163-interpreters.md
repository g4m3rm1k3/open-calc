# Lesson 163: Interpreters

**What you will build**: By the end of this lesson you'll write `eval-ast`, a real function that walks Lesson 162's own AST and computes the actual number it represents — and run the complete pipeline this section has been building since Lesson 159, start to finish, on one concrete value: the raw tokens for `1 + 2 + 3`, all the way through to the real answer, `6`.

**Pipeline diagram.** This section has been building one connected pipeline, one stage per lesson:

```
Tokens → Grammar-checked → Parse Tree → AST → Evaluation
```

Lesson 160 defined which token sequences are valid; Lesson 161 built a parse tree recording how one matched; Lesson 162 simplified that into an AST; this lesson adds the final stage — actually computing what the AST means. Carried through every stage on one concrete value, `1 + 2 + 3`:

```
[["num" 1] ["plus"] ["num" 2] ["plus"] ["num" 3]]
  → valid (Lesson 160)
  → [1 "plus" [2 "plus" [3]]]        (parse tree, Lesson 161)
  → ["add" 1 ["add" 2 3]]            (AST, Lesson 162)
  → 6                                 (this lesson)
```

**What you need to know first**: Lesson 162's AST and `tree->ast`; Lesson 156's denotation, revisited here as this lesson's own real, computed result; Lesson 41's `number?`.

**Terms introduced in this lesson**:

- **interpreter** — a program that directly computes a program's meaning by walking its AST, rather than translating it into some other form first. *Why it matters*: the final stage of this section's pipeline — everything since Lesson 159 built toward being able to write exactly this kind of function.

**Objects and methods used**: None new. This lesson reuses `number?` (Lesson 41), `get` (Lesson 84), and `+` (Lesson 2), each already covered.

---

## Concept Unit: `eval-ast` — Computing What an AST Means

### The Problem

Lesson 162's AST, `["add" 1 ["add" 2 3]]`, is a real, inspectable structure — but nothing has actually computed the number it represents yet. Can a function walk it and produce that real value?

### Introduce the concept in isolation

```clojure
(defn eval-ast [ast]
  (if (number? ast)
    ast
    (+ (eval-ast (get ast 1)) (eval-ast (get ast 2)))))
```

```
user=> (eval-ast 1)
1
user=> (eval-ast ["add" 1 2])
3
user=> (eval-ast ["add" 1 ["add" 2 3]])
6
```

A bare number evaluates to itself — Lesson 162's own simplification, where a single number needed no AST wrapping, pays off directly here: no special case is needed beyond checking `number?`. An `"add"` node evaluates by *recursively* evaluating both its operands first, then adding the two real results — `["add" 1 ["add" 2 3]]` correctly reaches `6`, not by inspecting the whole structure at once, but by trusting the recursive call on the nested `["add" 2 3]` to already have reduced it to `5` before the outer addition ever runs.

### Discard the throwaway example

Not applicable — `eval-ast` is real, reusable, and verified against a bare number, a simple sum, and a nested sum.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch evaluator for Lesson 162's own AST shape.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn eval-ast [ast]
  (if (number? ast)
    ast
    (+ (eval-ast (get ast 1)) (eval-ast (get ast 2)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(number? ast)`** — reappearing (Lesson 41): distinguishes the AST's two real shapes — a bare number, needing no further evaluation, versus a compound `"add"` node.
- **`(get ast 1)`, `(get ast 2)`** — reappearing `get` (Lesson 84): reads an `"add"` node's two operands, at index `1` and `2` — index `0` is the operator name itself, never evaluated.
- **`(+ (eval-ast (get ast 1)) (eval-ast (get ast 2)))`** — first appearance of this specific recursive shape: both operands are evaluated *first*, recursively, before the real `+` combines their already-computed results — exactly Lesson 149's own `fold-tree` skeleton, specialized to this one AST shape.

### CS Lens

`eval-ast` is Lesson 156's own denotation, made real: it computes the actual mathematical value an AST *means*, the precise question Lesson 159 opened this section by naming — and this lesson is the first point in Section VIII where that question gets a real, runnable answer instead of a human reader's own reasoning.

### SE Lens

An **interpreter** — walking the AST directly, the way `eval-ast` does — is the simplest way to give a program real meaning; Lesson 182, much later in this section, will contrast this against a *compiler*, which translates the AST into some other form first rather than computing an answer directly, a genuinely different tradeoff this lesson's own direct-walking approach doesn't need to make yet.

---

## Concept Unit: A Second Operator — Proving This Is Genuinely Useful

### The Problem

An interpreter that only ever adds isn't much of a language. The BRD's own framing for this lesson calls for "the smallest *useful* interpreter" — can `eval-ast` handle a second, genuinely different operator, mixed freely with the first, without its own recursive shape changing at all?

### Introduce the concept in isolation

```clojure
(defn eval-ast [ast]
  (cond
    (number? ast) ast
    (= (get ast 0) "mul") (* (eval-ast (get ast 1)) (eval-ast (get ast 2)))
    true (+ (eval-ast (get ast 1)) (eval-ast (get ast 2)))))
```

```
user=> (eval-ast ["mul" 3 4])
12
user=> (eval-ast ["add" 2 ["mul" 3 4]])
14
user=> (eval-ast ["mul" ["add" 1 2] 4])
12
```

`"mul"` reduces via `*` instead of `+`, checked with `cond` (Lesson 151) instead of the previous unit's plain `if` — everything else about `eval-ast`'s own shape is untouched. `["add" 2 ["mul" 3 4]]` mixes both operators in one real expression and reaches `14` — `2 + (3 \times 4)` — correctly: the nested `"mul"` node is evaluated by the identical recursive mechanism the previous unit already proved handles nesting, regardless of which operator happens to sit at any given node. `["mul" ["add" 1 2] 4]` proves the reverse nesting works too: `(1+2) \times 4 = 12`.

### Discard the throwaway example

Not applicable — `eval-ast` is real, reusable, and verified on a bare `"mul"`, a mixed `"add"`-containing-`"mul"`, and a mixed `"mul"`-containing-`"add"`.

### Project Change

- **Reference Source**: This lesson's own first-unit `eval-ast`, extended with one new `cond` branch — logic otherwise unchanged.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(= (get ast 0) "mul") (* (eval-ast (get ast 1)) (eval-ast (get ast 2)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(cond (number? ast) ast (= (get ast 0) "mul") ... true ...)`** — reappearing `cond` (Lesson 151): the base case is unchanged; a new branch is inserted for `"mul"`, and the previous unit's `"add"` handling becomes the final, catch-all branch.
- **`(* (eval-ast (get ast 1)) (eval-ast (get ast 2)))`** — reappearing `*` (Lesson 2) in the identical recursive shape the previous unit already established for `+`: both operands evaluated first, recursively, before combining.

### CS Lens

Nothing about the recursive *skeleton* changed to add a second operator — only one new `cond` branch, checking one new tag. This is exactly Lesson 151's own pattern-matching payoff: a sum type (Lesson 150) with a new alternative needs one new branch, not a redesign, and an AST is precisely such a sum type, one alternative per operator.

### SE Lens

Mixing `"add"` and `"mul"` freely, with neither needing to know the other exists, is only possible because both share the identical two-operand shape and both trust the same recursive evaluation of their own operands — a design decision (uniform node shape) made all the way back in Lesson 162, paying off directly here.

### Connection to the previous unit

The previous unit proved `eval-ast` correctly recurses on nested `"add"` nodes; this unit proves that same recursive mechanism is operator-agnostic — adding real second functionality cost one line, not a rewrite.

---

## Connect the Pieces

The complete pipeline, one concrete value, every stage from Lesson 160 through this lesson:

```clojure
(def tokens [["num" 1] ["plus"] ["num" 2] ["plus"] ["num" 3]])
(def tree (parse-expr tokens 0))
(def ast (tree->ast tree))
(def result (eval-ast ast))
(println "Tokens:" tokens)
(println "Parse tree:" tree)
(println "AST:" ast)
(println "Result:" result)
```

```
Tokens: [[num 1] [plus] [num 2] [plus] [num 3]]
Parse tree: [1 plus [2 plus [3]]]
AST: [add 1 [add 2 3]]
Result: 6
```

Four completely different-looking values — raw tokens, a nested parse tree, a clean AST, a bare number — each one produced entirely from the one before it, ending in the real answer `1 + 2 + 3` was always asking for.

## What Breaks Without This

Suppose `eval-ast` tried to evaluate an `"add"` node's operands *without* recursing — reading `(get ast 1)` and `(get ast 2)` directly into `+`, assuming both were already bare numbers. On `["add" 1 2]` that would work by coincidence; on the nested `["add" 1 ["add" 2 3]]`, `+` would receive `1` and the raw vector `["add" 2 3]` itself, not the number `5` that vector represents — a real, likely crash (adding a number to a non-number), or worse, a silently wrong result if `+` happened to coerce it into something unintended. The recursive call isn't optional scaffolding; it's the only reason a nested AST evaluates correctly at all, rather than only the shallowest, non-nested case.

## Exercises

1. **Trace.** By hand, trace `(eval-ast ["add" 1 ["add" 2 3]])` through every recursive call, confirming the innermost `["add" 2 3]` reduces to `5` before the outer `+` ever runs.
2. **Predict.** Before checking, predict `(eval-ast (tree->ast (parse-expr [["num" 4] ["plus"] ["num" 5] ["plus"] ["num" 6]] 0)))` — the full pipeline on a new set of numbers. Then verify.
3. **Verify.** Confirm `eval-ast` on a single bare number, with no `"add"` node at all, correctly skips the recursive branch entirely.
4. **Break it, on purpose.** Modify `eval-ast` to check `(get ast 0)` for `"add"` explicitly, but misspell it as `"ad"` — run it on `["add" 1 2]` and describe the real error or wrong result that follows.
5. **Generalize.** Describe, without coding it, how `eval-ast` would need to change to also handle a `"subtract"` AST node, alongside `"add"`.
6. **Reconstruct.** Close this lesson. From memory, trace `1 + 2 + 3` through all four pipeline stages — tokens, parse tree, AST, result — without looking back at this lesson's own diagram.

## Definition of Done

- [ ] You can write `eval-ast` and explain why it must recurse on both operands before combining them.
- [ ] You can trace the complete pipeline, tokens through result, on a value of your own choosing.
- [ ] You can explain why `eval-ast` is a real interpreter, and what a compiler would do differently (previewed, not yet built).
- [ ] You completed Exercise 2 and verified the full pipeline on `4 + 5 + 6`.
- [ ] You completed Exercise 4 and described the real failure from a misspelled operator check.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm full pipeline gives 15 for 4+5+6; show misspelled 'ad' check causes eval-ast to silently fall through to the wrong branch"` — not just `"lesson 163 exercise"`.

---

**Next lesson:** Lesson 164, *Environments*, extends this lesson's own interpreter to handle variables — a real name bound to a real value, looked up during evaluation, the first piece of state this section's pipeline hasn't needed until now.
