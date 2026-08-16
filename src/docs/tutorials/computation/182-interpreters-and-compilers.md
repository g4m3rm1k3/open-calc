# Lesson 182: Interpreters and Compilers

**What you will build**: By the end of this lesson you'll compile `["add" 1 ["add" 2 3]]` into a flat sequence of instructions — `[["push" 1] ["push" 2] ["push" 3] ["add"] ["add"]]` — and run that sequence on a small stack-based virtual machine, reaching the identical answer, `6`, that `eval-env` (Lesson 164) would compute directly from the AST — two completely different execution strategies, one shared correct answer.

**What you need to know first**: Lesson 164's `eval-env`, revisited by contrast; Lesson 86's stack; Lesson 24's `empty?`/`first`/`rest`.

**Terms introduced in this lesson**:

- **compilation** — translating a program from one representation into another *before* running it, rather than acting on the original representation directly. *Why it matters*: `eval-env` never translates anything — it walks the AST directly, every single time; this lesson's `compile-ast` produces something genuinely different to run instead.
- **bytecode** — a flat, linear sequence of simple instructions, each one small enough to execute with almost no further interpretation needed. *Why it matters*: the real target `compile-ast` produces — no more tree structure, no more recursion into an AST's own shape, just a straight-line list of steps.
- **virtual machine (VM)** — a program that executes bytecode instructions one at a time against a simple runtime state (here, a stack). *Why it matters*: `run-vm`'s own job — genuinely different work than `eval-env`'s AST-walking, even though both ultimately compute the same real answer.

**Objects and methods used**: None new. This lesson reuses `empty?`/`first`/`rest` (Lesson 24), `pop`/`assoc` (Lesson 94, Lesson 84), and `concat` (Lesson 28), each already covered.

---

## Concept Unit: Compiling an AST Into Flat Instructions

### The Problem

`eval-env` always walks the AST's own tree shape directly, recursing into it fresh on every call. Can the *same* expression be translated, once, into something with no tree structure at all — a flat, linear sequence instead?

### Introduce the concept in isolation

```clojure
(defn compile-ast [ast]
  (if (number? ast)
    [["push" ast]]
    (concat (compile-ast (get ast 1)) (compile-ast (get ast 2)) [["add"]])))
```

```
user=> (compile-ast ["add" 1 2])
(["push" 1] ["push" 2] ["add"])
user=> (compile-ast ["add" 1 ["add" 2 3]])
(["push" 1] ["push" 2] ["push" 3] ["add"] ["add"])
```

A bare number compiles to one instruction: push it. An `"add"` node compiles to *both* operands' own instructions, concatenated, followed by one `"add"` instruction — no nesting left at all, everything flattened into one straight-line sequence. The nested AST's own structure (an `"add"` inside an `"add"`) becomes, after compilation, simply "two pushes, then one add, then one more push, then one more add" — the tree shape is gone; only order remains.

### Discard the throwaway example

Not applicable — `compile-ast` is real, reusable, and verified on both a flat and a genuinely nested expression.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch compiler, translating this section's own AST shape into a new, flat target.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn compile-ast [ast]
  (if (number? ast)
    [["push" ast]]
    (concat (compile-ast (get ast 1)) (compile-ast (get ast 2)) [["add"]])))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[["push" ast]]`** — first appearance of this specific idea: a single **bytecode** instruction, "push this literal value" — the simplest unit `compile-ast` ever produces.
- **`(concat (compile-ast (get ast 1)) (compile-ast (get ast 2)) [["add"]])`** — reappearing `concat` (Lesson 28, Lesson 141's own monoid example): both operands' own instruction sequences joined together, with one final `"add"` instruction appended — the entire tree, flattened into order alone.

### CS Lens

This is **compilation**, made concrete: translating a program from one representation (a tree) into another (a flat instruction sequence) *before* anything runs — a genuinely different activity than `eval-env`'s own direct, tree-walking interpretation.

### SE Lens

Once compiled, `["add" 1 ["add" 2 3]]`'s own tree shape never has to be walked again — the flat instruction sequence can be run repeatedly, or stored, or inspected as plain data, independent of the original AST entirely, a real, practical benefit direct tree-walking interpretation doesn't offer on its own.

---

## Concept Unit: A Virtual Machine, Running the Instructions

### The Problem

A flat instruction sequence isn't a value yet — something has to actually *execute* it. Can a small machine, tracking nothing but a stack, run these instructions and reach the correct final answer?

### Introduce the concept in isolation

```clojure
(defn push-sum [a b remaining] (assoc remaining (count remaining) (+ a b)))
(defn exec-add [stack] (push-sum (get stack (- (count stack) 2)) (get stack (- (count stack) 1)) (pop (pop stack))))

(declare exec-instr)
(defn run-vm [instrs stack]
  (if (empty? instrs)
    (get stack 0)
    (exec-instr (first instrs) (rest instrs) stack)))

(defn exec-instr [instr rest-instrs stack]
  (if (= (get instr 0) "push")
    (run-vm rest-instrs (assoc stack (count stack) (get instr 1)))
    (run-vm rest-instrs (exec-add stack))))
```

```
user=> (run-vm (compile-ast ["add" 1 2]) [])
3
user=> (run-vm (compile-ast ["add" 1 ["add" 2 3]]) [])
6
```

A `"push"` instruction adds its own literal onto the stack (Lesson 86's own stack shape, reused directly). An `"add"` instruction pops the top *two* values, adds them, and pushes the sum back — `exec-add`, built from Lesson 94's own `pop`. `run-vm` processes instructions one at a time, `first`/`rest` (Lesson 24), until none remain, at which point the stack holds exactly one value: the final answer. Both compiled programs reach the identical results `eval-env` would compute directly — `3`, then `6` — this time by a **virtual machine** executing flat bytecode, never touching the original tree shape at all.

### Discard the throwaway example

Not applicable — `run-vm`/`exec-instr`/`exec-add` are real, reusable, and verified to reach the correct final value on both compiled programs.

### Project Change

- **Reference Source**: Lesson 86's own stack shape and Lesson 94's `pop`, reused directly as this lesson's own VM state.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn run-vm [instrs stack]
  (if (empty? instrs)
    (get stack 0)
    (exec-instr (first instrs) (rest instrs) stack)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(empty? instrs)`** — reappearing `empty?` (Lesson 24): once no instructions remain, the stack's own single remaining value *is* the final answer.
- **`(first instrs)`, `(rest instrs)`** — reappearing (Lesson 24): the next instruction to execute, and everything after it — the VM's own version of "what's next," genuinely simpler than `eval-env`'s recursive AST-walking, since there's no tree shape left to recurse into.
- **`(pop (pop stack))`**, in `exec-add` — reappearing `pop` (Lesson 94), applied twice: removes both operands the `"add"` instruction needs, leaving the stack ready for the new sum.

### CS Lens

`eval-env` and `run-vm` sit at genuinely different points on the same real spectrum: pure interpretation (walk the original representation directly, every time) versus compile-then-execute (translate once, then run something simpler, repeatedly if needed) — real languages pick a point on this spectrum deliberately, and some (bytecode-based languages like Python and Java) do exactly what this lesson just built, at much larger scale.

### SE Lens

The real tradeoff: `compile-ast` does real, upfront work translating the tree — work `eval-env` never does at all — in exchange for `run-vm`'s own execution being simpler per step (no recursion into a tree, just "what's next in this flat list"); for a program run only once, that tradeoff might not pay off, but for one compiled once and run many times, it very often does.

### Connection to the previous unit

The previous unit translated a tree into flat instructions; this unit executes those instructions and proves the translation was faithful — the same final answer `eval-env` would reach directly.

---

## Connect the Pieces

Two genuinely different strategies, the identical program, the identical final answer:

```clojure
(println "eval-env directly:" (eval-env ["add" 1 ["add" 2 3]] []))
(println "compiled, then run-vm:" (run-vm (compile-ast ["add" 1 ["add" 2 3]]) []))
```

```
eval-env directly: 6
compiled, then run-vm: 6
```

Neither strategy is more "correct" than the other — both reach `6`, by genuinely different real work, exactly the interpreter-versus-compiler spectrum this lesson set out to make concrete rather than merely name.

## What Breaks Without This

Suppose a program needed to run the identical expression thousands of times — inside a tight loop, say. Using `eval-env` directly would re-walk the *entire* AST from scratch on every single call, redoing the identical structural traversal every time, even though the tree itself never changes between calls. Compiling once with `compile-ast`, then calling `run-vm` on the already-flattened instructions repeatedly, does the tree-walking work exactly once — the real, practical reason bytecode-compiled languages exist at all, made concrete rather than asserted.

## Exercises

1. **Trace.** By hand, trace `(run-vm (compile-ast ["add" 1 2]) [])` through every instruction, showing the stack's own contents after each one.
2. **Predict.** Before checking, predict the compiled instruction sequence for `["add" ["add" 1 2] ["add" 3 4]]` — two separate nested `"add"` nodes combined by a third. Then verify.
3. **Verify.** Confirm `run-vm` on your Exercise 2 answer reaches the identical value `eval-env` computes directly for the same AST.
4. **Break it, on purpose.** Modify `exec-add` to pop only *one* value instead of two, and describe the real, wrong stack state (or crash) this produces on `(compile-ast ["add" 1 2])`.
5. **Generalize.** Describe, without coding it, what `compile-ast` and `run-vm` would each need to gain to support `"var"` nodes, the way `eval-env` already does.
6. **Reconstruct.** Close this lesson. From memory, explain why `compile-ast`'s own output has no tree structure left at all, using this lesson's own nested example, not a general statement about compilation.

## Definition of Done

- [ ] You can compile a nested AST into a flat sequence of stack-based instructions.
- [ ] You can execute compiled instructions on a small VM and reach the correct final value.
- [ ] You can explain the real tradeoff between direct interpretation and compile-then-execute.
- [ ] You completed Exercise 3 and confirmed compiled execution agrees with direct interpretation on a new expression.
- [ ] You completed Exercise 4 and described the real corruption from a broken `exec-add`.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm compiled and direct evaluation agree on (add (add 1 2) (add 3 4)) = 10; show single-pop exec-add leaves a stale value on the stack"` — not just `"lesson 182 exercise"`.

---

**Next lesson:** Lesson 183, *Build a Small Language*, closes this section with its own checkpoint — integrating every real piece this section built (lexer, parser, AST, evaluator, environments, functions, types) into one small, real language, built by you with minimal scaffolding, plus a deliberately planted inconsistency in a companion interpreter to find before it's revealed.
