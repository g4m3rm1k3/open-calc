# PyX — LAB 30 — What You Built and What Comes Next

**Prerequisites:** Labs 01–29 complete. The full PyX toolchain works.

**What this lab does:**
- No new code.
- Surveys every concept implemented across the 30 labs.
- Shows how each pattern appears in professional software.
- Describes what would be needed to extend PyX.

**Time:** 30–45 minutes. Read, reflect, and then look at what comes next.

---

> **Quick Check — before reading, try to answer from memory:**
>
> 1. Name the four stages of the PyX compiler pipeline in order, and the data type each stage inputs and outputs.
> 2. What are the two heuristics that make the reconciler O(n) instead of O(n³)?
> 3. Why does the pre-processor run before `ast.parse` — what would happen if you tried to `ast.parse` a raw `.pyx` file?
>
> *(Answers at the end of this lab)*

---

## The Complete Concept Map

For each concept, find where you implemented it and where it appears in professional software.

---

### Computer Science Concepts

**Finite State Machine**

You implemented it in `lexer.py` — three states (`IN_PYTHON`, `IN_ELEMENT`, `IN_EXPRESSION`), transitions on individual characters. The same model appears in: network protocol state machines (TCP connection states), game AI state machines (idle → attacking → retreating), UI component state machines (closed → opening → open → closing), and regular expressions (which compile to FSMs under the hood).

**Recursive Descent Parsing**

You implemented it in `parser.py` — `_parse_element` calling `_parse_children` calling `_parse_element`. This is how Python's own parser works, how every hand-written parser works (including the original C compiler, written in C). The call stack is the parse stack — this insight is fundamental. When you write a recursive function, you are always using the call stack as memory.

**Abstract Syntax Tree**

You worked with two ASTs: the Python AST (produced by `ast.parse`) and the PyX IR (produced by `transformer.py`). The pattern — represent a program as a tree of typed nodes — appears in every language tooling system. TypeScript's own compiler produces an AST that TypeScript Language Server uses for autocomplete. ESLint and Prettier both operate on ASTs.

**Intermediate Representation**

The PyX IR is between two languages: Python (the input) and JSX (the output). Compilers almost always use an IR. LLVM is a famous IR used by Clang, Rust, and Swift — they all compile to LLVM IR, which LLVM then compiles to machine code. The IR decouples the "understand the source language" problem from the "produce the target language" problem.

**Tree Diffing**

You implemented the O(n) tree diffing algorithm in `reconciler.ts`. The same algorithm (with the same two heuristics: different types → replace, keys → stable identity) is in React, Preact, Vue, Solid, and every other virtual DOM framework. It is one of the most widely deployed algorithms in frontend development.

**Virtual Machine**

The hook slot array is a simple virtual machine. It has memory (the slots array), an instruction pointer (`_currentSlotIndex`), and instructions (`useState` calls that read/write slots). The Python interpreter is a far more complex virtual machine operating on bytecode. The JVM is a virtual machine that compiles bytecode to native code at runtime (JIT compilation). The pattern — a controlled execution environment with explicit memory — is universal.

**Source Maps**

You implemented Base64 VLQ encoding and source map generation. Every production JavaScript toolchain uses source maps: Webpack, Rollup, esbuild, SWC all produce them. When you use TypeScript and see TypeScript line numbers in Chrome devtools, that is a source map working.

---

### Software Engineering Concepts

**Pipeline Pattern**

The compiler pipeline: `preprocess → parse → transform → codegen`. Each stage has a clear input type and output type. This is how Unix pipes work (`cat file | grep pattern | sort | uniq`), how Express.js middleware works, how event processing pipelines work. The pattern scales from five stages to hundreds — the principle (clear interfaces between independent transformations) is the same.

**Visitor Pattern**

You implemented it three times: `_generate_node` in `codegen_preprocessor.py`, `transform()` in `transformer.py`, `_gen_statement()` in `codegen.py`. Each dispatches on node type using `isinstance`. The formal visitor pattern (with a `Visitor` base class) is the OO version of this. You have now used it three times — the pattern is automatic.

**Observer Pattern**

The setState/rerender loop in `hooks.ts` is an observer. State is the subject. `instance.rerender` is the observer. When state changes (via the setter), the observer is notified (rerender is called). This is the same pattern as: DOM `addEventListener` (event listeners observe events), RxJS observables, Redux store subscriptions, React's `useEffect` dependencies.

**Higher-Order Functions**

Components are higher-order in the sense that the runtime calls them. The `.map(x => expr)` that list comprehensions produce is a higher-order function call. `useEffect(() => { cleanup }, [])` takes a function as an argument. Higher-order functions are the foundation of functional programming — Python, JavaScript, TypeScript, Scala, Haskell all use them pervasively.

**Separation of Concerns**

The diff/apply split in the reconciler. The lexer/parser/codegen split in the pre-processor. The compiler/runtime split between Python and TypeScript. Each module has one job. This is not a style choice — it is what makes code testable, and testability is what makes code maintainable.

---

## The Full Project Structure

```
pyx/
├── compiler/               ← Python: the pyxc compiler
│   ├── tokens.py           ← Finite state machine (lexer tokens)
│   ├── lexer.py            ← Finite state machine (character → token)
│   ├── nodes.py            ← Pre-processor AST node types
│   ├── parser.py           ← Recursive descent (token → element tree)
│   ├── codegen_preprocessor.py ← Visitor (element tree → h() calls)
│   ├── preprocessor.py     ← Pipeline (lex → parse → generate)
│   ├── parser_py.py        ← Python AST parsing wrapper
│   ├── ir.py               ← Intermediate representation node types
│   ├── transformer.py      ← Visitor (Python AST → PyX IR)
│   ├── codegen.py          ← Visitor (PyX IR → JSX string)
│   ├── sourcemap.py        ← Source map generation (Base64 VLQ)
│   ├── cli.py              ← Pipeline orchestration + CLI
│   └── tests/              ← Independent test suite per module
├── runtime/                ← TypeScript: the pyx-runtime library
│   └── src/
│       ├── types.ts         ← VNode type definitions
│       ├── h.ts             ← Element factory (virtual DOM creation)
│       ├── render.ts        ← First render (VNode → real DOM)
│       ├── reconciler.ts    ← O(n) tree diffing algorithm
│       ├── patches.ts       ← Patch operation types
│       ├── apply.ts         ← DOM mutation (patch → real DOM change)
│       ├── update.ts        ← diff + apply orchestration
│       ├── hooks.ts         ← useState, useEffect, hook slot array
│       ├── debug.ts         ← Tree printer
│       └── index.ts         ← Public exports
├── app/                    ← Vite project (the PyX app)
│   ├── vite-plugin-pyx.js  ← Vite plugin (auto-compile .pyx files)
│   └── src/
└── backend/                ← FastAPI server
    └── main.py
```

---

## What You Did Not Build

These are real extensions — each is well-defined and achievable:

**`try/except` support:**
Map Python `try/except` to JavaScript `try/catch`. The IR needs `IRTryCatch`. The transformer handles `ast.Try`. The code generator emits `try { } catch (e) { }`. The error message in `transform_Try` would change from "not supported" to "translates to try/catch."

**`async/await` support:**
Map Python `async def` to JavaScript `async function`. Map `await` to `await`. The transformer handles `ast.AsyncFunctionDef` and `ast.Await`. This requires the Vite project to use a module bundler that supports async/await (all modern ones do).

**`@decorator` support:**
Map Python decorators (`@memoize`, `@cache`) to JavaScript wrapper function calls. Most Python decorators have JavaScript equivalents or can be implemented as HOFs.

**TypeScript output:**
The code generator could emit `.tsx` instead of `.jsx` — adding type annotations for the component's props. This would require the transformer to infer prop types from the Python function signature.

**Server-side rendering:**
Run the PyX runtime on Node.js (it already works there — no browser-only APIs). Render a VNode tree to an HTML string. FastAPI serves the pre-rendered HTML. The browser receives meaningful HTML immediately instead of a blank page.

---

## Where These Concepts Appear in C# and Java

You are now ready for C# and Java. Here is what you already know, translated:

| PyX/TypeScript | C# | Java |
|---|---|---|
| `interface VNode { ... }` | `interface IVNode { ... }` | `interface VNode { ... }` |
| `type ComponentFn = (props: Props) => VNode` | `delegate VNode ComponentFn(Props props)` | `@FunctionalInterface interface ComponentFn` |
| `function h<T>(...)` | `T H<T>(...)` | `<T> T h(...)` |
| `<T extends Props>` | `where T : Props` | `<T extends Props>` |
| `readonly` frozen dataclass | `readonly struct` or `record` | `record` (Java 14+) |
| `Map<K, V>` | `Dictionary<K, V>` | `HashMap<K, V>` |
| `WeakMap<K, V>` | `WeakReference<V>` | `WeakHashMap<K, V>` |
| Visitor pattern | Visitor pattern (identical) | Visitor pattern (identical) |
| Recursive descent parser | Recursive descent parser | Recursive descent parser |

The concepts are identical. The syntax differs by a few characters. You know the concepts.

---

## The Final Check

This is not a code check. It is a knowledge check.

**Without looking at the code**, answer these:

1. What does `pyxc build counter.pyx` do, step by step?
2. What is the difference between `IRAssign(targets=("x",), ...)` and `IRAssign(targets=("a", "b"), ...)`? What JavaScript does each produce?
3. Why is the hook slot array a virtual machine?
4. Why can't hooks be called conditionally?
5. What is the difference between the pre-processor's AST (the Node types in `nodes.py`) and the Python AST produced by `ast.parse`?
6. The reconciler uses two heuristics to achieve O(n). What are they?
7. When a user clicks a button, name every line of code that executes from the click to the DOM update.
8. What does a source map contain, and why does it use Base64 VLQ encoding?

If you can answer all eight from memory, you have genuinely learned what this project set out to teach.

---

## Your Complete Files

No new files this lab.

### The complete PyX project structure

```
pyx/
├── .venv/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── compiler/
│   ├── __init__.py
│   ├── cli.py
│   ├── codegen.py
│   ├── codegen_preprocessor.py
│   ├── errors.py
│   ├── ir.py
│   ├── lexer.py
│   ├── nodes.py
│   ├── parser.py
│   ├── parser_py.py
│   ├── preprocessor.py
│   ├── sourcemap.py
│   ├── tokens.py
│   ├── transformer.py
│   └── tests/
│       ├── test_codegen.py
│       ├── test_codegen_preprocessor.py
│       ├── test_lexer.py
│       ├── test_parser.py
│       ├── test_pipeline.py
│       ├── test_sourcemap.py
│       ├── test_transformer.py
│       └── test_transformer_errors.py
├── runtime/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── debug.ts
│       ├── h.ts  /  h.test.ts
│       ├── hooks.ts  /  hooks.test.ts
│       ├── index.ts
│       ├── main.tsx
│       ├── reconciler.ts  /  reconciler.test.ts
│       └── render.ts  /  render.test.ts
├── examples/
│   ├── counter.pyx  /  counter.jsx  /  counter.jsx.map
│   ├── error-tests/every-error.pyx
│   ├── hello.pyx
│   └── todo.pyx  /  todo.jsx
└── pyproject.toml
```

---

## Challenge: What Would It Take to Add `async/await`?

PyX v1.0 does not support `async def` or `await`. Describe — in writing, no code required — what changes you would make to each stage of the compiler to support them:

1. Pre-processor: does anything need to change?
2. Transformer: which new IR node(s) would you add?
3. Code generator: what JavaScript does `async def f(): await g()` compile to?
4. Runtime: does `async/await` affect the runtime at all?

Try to sketch the changes before revealing the answer.

---

<details>
<summary>▶ Show Answer</summary>

1. **Pre-processor:** No changes needed. `async def` and `await` are valid Python syntax — `ast.parse` handles them. The pre-processor only transforms element syntax.

2. **Transformer:** Add `IRAsyncFunction` (same as `IRFunction` but `async: bool = True`) and `IRAwait(value: IRNode)`. Update `transform_AsyncFunctionDef` and `transform_Await` in the transformer.

3. **Code generator:** `IRAsyncFunction` emits `async function Name(args) { ... }`. `IRAwait` emits `await expr`. JavaScript's `async/await` syntax is nearly identical to Python's, so the code generator changes are minimal.

4. **Runtime:** No changes needed for the runtime itself. `async` components work naturally — `renderRoot` calls the component function, and if it returns a Promise, the component just renders nothing until the Promise resolves. If you want loading states, the component can use `useState(null)` and call `setData(result)` inside a `useEffect` with `await`.

**Key insight:** The stages are independent. A change to the transformer (new IR nodes) requires a corresponding change to the code generator (how to emit them), but does not touch the pre-processor, the runtime, or the reconciler. This is the payoff of the four-stage pipeline: each extension is localised to exactly the stages it affects.

</details>

---

## Quick Check Answers

**1. The four pipeline stages and their types:**

1. Pre-processor: `str (.pyx)` → `str (valid Python with h() calls)`
2. `ast.parse`: `str (valid Python)` → `ast.Module`
3. Transformer: `ast.Module` → `IRModule`
4. Code generator: `IRModule` → `str (JSX)`

**2. The two O(n) heuristics:**

(1) Nodes of different types produce different trees — replace the whole subtree, do not recurse. This makes type-change diffs O(1) per node. (2) Developer-supplied `key` props identify stable nodes across renders — use a `Map<key, VNode>` to match old and new nodes by key rather than by position. This makes list diffs O(n) instead of O(n²).

**3. Why the pre-processor runs before `ast.parse`:**

`ast.parse` only understands valid Python syntax. Element syntax (`<div>Hello</div>`) is not valid Python — Python would parse `<div>` as a less-than comparison `(div > Hello) / div`, which is also not valid Python. `ast.parse` would raise `SyntaxError`. The pre-processor transforms element syntax into `h()` calls (valid Python) before `ast.parse` sees the file.

---

## What You Built — in One Sentence

You built a programming language. It reads Python, produces JavaScript, and the result runs in a browser. That is what compilers do, and now you know how they do it.

---

*End of LAB 30.*

*This is the end of the PyX curriculum. Go build something with it.*
