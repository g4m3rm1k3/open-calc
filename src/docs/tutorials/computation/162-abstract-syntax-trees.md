# Lesson 162: Abstract Syntax Trees

**What you will build**: By the end of this lesson you'll convert Lesson 161's parse tree — `[1 "plus" [2 "plus" [3]]]`, still carrying the literal `"plus"` token — into a real **abstract syntax tree**: `["add" 1 ["add" 2 3]]`, a uniform, semantically-named structure with no leftover syntax noise, ready for Lesson 163's interpreter to evaluate directly.

**What you need to know first**: Lesson 161's `parse-expr` and its own parse-tree shapes; Lesson 149's tree constructors and recursive folding.

**Terms introduced in this lesson**:

- **abstract syntax tree (AST)** — a tree representing a program's real structure, with syntax-specific details (literal tokens, punctuation) removed, keeping only what's needed to know what the program means. *Why it matters*: a parse tree (Lesson 161) records exactly how the grammar matched, including details — like the literal string `"plus"` — that add nothing beyond what the tree's own shape already implies; an AST keeps only what actually matters for evaluation.

**Objects and methods used**: None new. This lesson reuses `get`/`count` (Lesson 84, Lesson 94) and `=` (Lesson 6), each already covered.

---

## Concept Unit: Dropping Syntax Noise

### The Problem

`[1 "plus" [2]]` — Lesson 161's own parse tree for `1 + 2` — records the literal token `"plus"` explicitly, even though *every* parse tree this grammar produces uses the identical operator; the literal string adds nothing an evaluator couldn't already infer from the tree's own three-element shape. Can that redundant detail be dropped, replaced with something that names the actual *operation* instead of repeating the syntax that spelled it?

### Introduce the concept in isolation

```clojure
(defn tree->ast [tree]
  (if (= (count tree) 1)
    (get tree 0)
    ["add" (get tree 0) (tree->ast (get tree 2))]))
```

```
user=> (tree->ast [1])
1
user=> (tree->ast [1 "plus" [2]])
["add" 1 2]
user=> (tree->ast [1 "plus" [2 "plus" [3]]])
["add" 1 ["add" 2 3]]
```

A single-number parse tree, `[1]`, becomes just `1` — no wrapping vector needed once there's no operation to record. A two-number sum becomes `["add" 1 2]` — a real operator name, `"add"`, replacing the literal `"plus"` token, with both operands sitting directly alongside it. The three-number case nests identically to the parse tree it came from, `["add" 1 ["add" 2 3]]`, but every level now names the real operation rather than repeating the syntax token that happened to spell it.

### Discard the throwaway example

Not applicable — `tree->ast` is real, reusable, and verified against all three of Lesson 161's own parse-tree shapes.

### Project Change

- **Reference Source**: Lesson 161's own `parse-expr` output, converted here by a new function rather than modifying the parser itself.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn tree->ast [tree]
  (if (= (count tree) 1)
    (get tree 0)
    ["add" (get tree 0) (tree->ast (get tree 2))]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (count tree) 1)`** — reappearing `count`/`=` (Lesson 94, Lesson 6): distinguishes the parse tree's two shapes (Lesson 161's own sum type) — a one-element `[value]` versus a three-element `[value "plus" sub-tree]`.
- **`(get tree 0)`**, returned bare — first appearance of this specific simplification: a single number needs no AST wrapping at all, since there's no operation for a wrapper to name.
- **`["add" (get tree 0) (tree->ast (get tree 2))]`** — first appearance of the real AST node shape: a literal operator name, `"add"`, replacing `"plus"`, and the right-hand side recursively converted rather than left as a raw parse-tree fragment.

### CS Lens

This is `map-tree` (Lesson 153) in spirit, though not literally the same function: transforming every node of a structure while changing its shape at each level — the parse tree's syntax-mirroring shape becomes the AST's semantics-oriented shape, the identical "transform without losing the structure's own meaning" idea, applied to code representing code instead of ordinary data.

### SE Lens

Separating parsing (Lesson 161) from this AST-simplification step, rather than having the parser build the AST directly, means a *different* syntax — say, a future version of this language spelling addition with a symbol instead of the word `"plus"` — would only require changing the parser; `tree->ast` and everything built on the AST afterward would never need to know the syntax changed at all.

---

## Connect the Pieces

Parse, then simplify to an AST, in one real pipeline:

```clojure
(println "Parse tree:" [1 "plus" [2 "plus" [3]]])
(println "AST:" (tree->ast [1 "plus" [2 "plus" [3]]]))
```

```
Parse tree: [1 "plus" [2 "plus" [3]]]
AST: [add 1 [add 2 3]]
```

The parse tree records exactly how the grammar matched; the AST records only what the interpreter will actually need — the real, deliberate narrowing this lesson's whole point rests on.

## What Breaks Without This

Suppose an interpreter were built directly against Lesson 161's own parse trees, checking for the literal string `"plus"` at every evaluation step instead of a clean `"add"` AST node. Extending the language with a second operator — subtraction, say — would mean every piece of code that inspects a parse tree needs updating to also recognize a new literal token, scattered across however many places happened to check for `"plus"` directly. An AST with a uniform node shape — an operator name, then its operands — means adding a new operator is a matter of recognizing one more operator name in one place, not hunting down every raw syntax check across the whole interpreter.

## Exercises

1. **Trace.** By hand, trace `(tree->ast [5 "plus" [10]])` through `tree->ast`'s own two branches, confirming it reaches `["add" 5 10]`.
2. **Predict.** Before checking, predict the AST for a four-number sum, `1 + 2 + 3 + 4`, using this lesson's own nesting pattern. Then verify.
3. **Verify.** Confirm `(get (tree->ast [1 "plus" [2 "plus" [3]]]) 0)` is always `"add"`, for both the outer and — after one more `get`, into the nested AST — the inner node.
4. **Break it, on purpose.** Modify `tree->ast` to use `"plus"` instead of `"add"` in its own output, and describe why that change would silently defeat this lesson's entire point — what did switching to `"add"` actually buy that keeping `"plus"` wouldn't have?
5. **Generalize.** Describe, without coding it, how `tree->ast` would need to change if Lesson 160's grammar (per that lesson's own Exercise 5) also allowed a `"minus"` token.
6. **Reconstruct.** Close this lesson. From memory, explain why `tree->ast [1]` returns the bare number `1`, not `["add" 1]` or any other wrapped shape.

## Definition of Done

- [ ] You can explain the real difference between a parse tree and an AST, using this lesson's own `"plus"`-versus-`"add"` example.
- [ ] You can convert a parse tree to an AST and predict its exact nested shape before running the conversion.
- [ ] You can explain why keeping parsing and AST-simplification as separate steps makes a future syntax change cheaper.
- [ ] You completed Exercise 3 and confirmed every AST node's own first slot is `"add"`, at both nesting levels.
- [ ] You completed Exercise 4 and explained precisely what real property `"add"` has that `"plus"` doesn't, in this context.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm both AST levels use 'add'; explain why a semantic operator name, not the literal token, is what an evaluator should dispatch on"` — not just `"lesson 162 exercise"`.

---

**Next lesson:** Lesson 163, *Interpreters*, builds the smallest useful interpreter — a real function that walks this lesson's own AST and actually computes the number it represents, the first point in this section where a program's meaning, not just its structure, becomes real, runnable code.
