# PyX — Python-to-JavaScript Compiler with React-like Runtime
## Business Requirements Document & Curriculum

**Version:** 1.0
**Date:** June 2026
**What it is:** A compiler that takes `.pyx` files (Python with JSX-like syntax)
and outputs JavaScript. A runtime library that implements React-like state,
components, and DOM reconciliation. A CLI tool `pyxc` that drives the compiler.
**Teaching contract:** Full contract applied — every concept taught at first use.

---

## Part 1 — Business Requirements Document

### 1.1 Problem Statement

JavaScript is the only language that runs natively in the browser. Every language
that wants to run in the browser must either transpile to JavaScript (TypeScript,
CoffeeScript, Elm, ClojureScript) or run on top of a JavaScript runtime (Python
via Pyodide, which is a different model entirely). There is no escape from
JavaScript at the machine level — but there is no rule that says developers must
write it.

PyX is a compiler and runtime that lets developers write full-stack web applications
in Python. The `.pyx` file format extends Python syntax with JSX-like element
literals. The `pyxc` compiler reads `.pyx` files and emits JavaScript. The PyX
runtime (a small JavaScript library) provides the React-like component model,
state management, and DOM reconciliation that the emitted JavaScript depends on.

The result: a developer writes Python, runs `pyxc build app.pyx`, and gets
`app.js` — a self-contained JavaScript file that runs in any browser with no
server required.

### 1.2 What This Project Teaches

This is the most technically demanding project in the curriculum. It touches
every layer of computer science: parsing, AST transformation, code generation,
runtime design, virtual DOM, reconciliation, and the JavaScript execution model.
It is also the project that makes every other project make more sense in retrospect.

After building PyX you will understand:
- How TypeScript, CoffeeScript, and every other compile-to-JS language works
- How React's virtual DOM and reconciliation actually work (you will have built one)
- How Python's own compiler works (you use the same techniques)
- How Babel and esbuild transform code
- What a source map is and why it exists
- Why JSX is syntax sugar and what it compiles to

### 1.3 The Parsing Decision — All Options Explained

This is the most important architectural decision in the project. The right answer
depends on what you want to learn.

**Option A: Python's `ast` module**

Python ships with a module called `ast` that can parse any valid Python source
file into a tree of Python objects. `ast.parse("x = 1 + 2")` returns a tree with
an `Assign` node containing a `BinOp` node containing two `Num` nodes.

Pros: free, correct, handles all Python syntax perfectly.
Cons: `.pyx` files are not valid Python — they contain element syntax like
`<div class="app">` which is not legal Python. The `ast` module will reject them
before you can handle the element syntax.
Workaround: a pre-processing step that transforms element syntax into valid Python
function calls before `ast.parse` sees it. This is what Babel does with JSX —
it is a valid approach.

**Option B: Write a custom parser from scratch**

Write a lexer that tokenises `.pyx` source, and a parser that builds an AST from
the token stream. You have done this for your calculator and MATLAB clone.

Pros: complete understanding of every part, handles any syntax you invent,
the deepest learning.
Cons: significant work, easy to get wrong in edge cases, Python has a large
grammar.

**Option C: Use a parser generator (Lark)**

Lark is a Python library that reads a formal grammar definition (a file describing
the rules of the language) and generates a parser from it. You write the grammar;
Lark writes the parser.

Pros: handles complex grammars correctly, less code, formal and correct.
Cons: learning the grammar notation is a prerequisite, less direct control.

**Option D: Python `ast` + pre-processor (recommended for this project)**

Pre-process `.pyx` files to transform element syntax into Python function calls,
then use `ast.parse` on the result. This is exactly what Babel does: JSX
(`<div>hello</div>`) is transformed to `React.createElement("div", null, "hello")`
before the JavaScript parser sees it.

```
# What the developer writes (.pyx):
def App():
    return <div class="app"><h1>Hello</h1></div>

# What the pre-processor produces (valid Python):
def App():
    return h("div", {"class": "app"}, h("h1", {}, "Hello"))

# What ast.parse sees:
# A function definition returning a call expression — valid Python
```

This approach teaches:
- How JSX actually works (it is a pre-processor, not a language feature)
- How Python's AST module works (you traverse and transform the tree)
- How Babel's transform pipeline works
- The difference between syntax and semantics

**PyX uses Option D.** The pre-processor is Phase 1. The AST transformer is Phase 2.
The code generator is Phase 3. Each phase is a separate, testable module.

### 1.4 What the Compiler Outputs — Recommendation Explained

**The recommendation: compile to readable JSX, then let Vite/esbuild handle the rest.**

There are two ways to think about what `pyxc` produces:

**Direct JS output:** `pyxc` emits plain JavaScript that runs in any browser with
no further tooling. Self-contained, no dependencies. But writing a full JavaScript
code generator is a very large amount of work — you have to handle every Python
construct (list comprehensions, generators, decorators, exception handling) and
produce correct JavaScript for each one. Languages like CoffeeScript took years
to get right.

**JSX output + Vite:** `pyxc` emits JSX (JavaScript with React element syntax).
Vite (which you already know) then compiles the JSX to JavaScript as part of a
normal project build. This splits the work: `pyxc` handles Python-specific syntax;
Vite handles JavaScript bundling and optimisation.

PyX uses the JSX output approach. This means:
- `pyxc` is a Python-to-JSX transpiler, not a Python-to-JS compiler
- The emitted JSX is readable — a developer can inspect it to understand what
  their Python compiled to
- Vite handles the JSX-to-JS step as it does for any React project
- The PyX runtime is a React-like library that the emitted JSX calls

This is how most compile-to-JS languages work in practice. TypeScript does not
emit optimised machine code — it emits JavaScript and lets the browser's V8
engine optimise it.

### 1.5 The PyX Runtime

The compiler emits JSX that calls PyX runtime functions. The runtime is a
JavaScript library (about 400 lines) that provides:

**`h(type, props, ...children)`** — the element factory. Like `React.createElement`.
Creates a virtual DOM node. The pre-processor transforms `<div class="x">` into
`h("div", {class: "x"})`.

**`render(element, container)`** — mounts a PyX app into a DOM element.
Like `ReactDOM.render`.

**`useState(initialValue)`** — returns `[value, setter]`. When the setter is
called, the component re-renders.

**`useEffect(fn, deps)`** — runs a side effect after render. When deps change,
the effect runs again.

**The reconciler** — the algorithm that compares the previous virtual DOM tree
to the new one and makes the minimum set of DOM changes. This is the most
technically interesting part of the runtime and the subject of several lessons.

### 1.6 The `.pyx` Syntax

`.pyx` is Python with one extension: element literals. Every Python construct
that is valid in Python is valid in `.pyx`. The only new syntax is elements.

**Element syntax:**

```python
# A simple element
element = <div>Hello</div>

# An element with props
element = <div class="app" id="main">Hello</div>

# A nested element
element = <div><h1>Title</h1><p>Body</p></div>

# An element with a Python expression inside {}
name = "world"
element = <div>Hello {name}</div>

# A component (capitalised name = component, lowercase = HTML element)
element = <App title="My App" />

# Self-closing
element = <input type="text" value={state} />
```

**A full component:**

```python
from pyx import useState

def Counter():
    count, set_count = useState(0)

    def increment():
        set_count(count + 1)

    return (
        <div class="counter">
            <p>Count: {count}</p>
            <button onClick={increment}>+</button>
        </div>
    )
```

**What this compiles to (JSX output):**

```jsx
import { h, useState } from 'pyx-runtime';

function Counter() {
    const [count, set_count] = useState(0);

    function increment() {
        set_count(count + 1);
    }

    return (
        h("div", {className: "counter"},
            h("p", {}, "Count: ", count),
            h("button", {onClick: increment}, "+")
        )
    );
}
```

### 1.7 The Compiler Pipeline

```
.pyx source file
      ↓
  PRE-PROCESSOR
  Find element syntax, replace with h() calls
  Output: valid Python source
      ↓
  PYTHON AST PARSER
  ast.parse() — produces a Python AST
  Output: ast.Module node tree
      ↓
  AST TRANSFORMER
  Walk the tree, transform Python constructs to JS equivalents
  Handle imports, function definitions, list comprehensions, etc.
  Output: a PyX IR (intermediate representation) — our own AST
      ↓
  CODE GENERATOR
  Walk the IR, emit JSX strings
  Output: .jsx file
      ↓
  VITE (external)
  Compile JSX to JavaScript, bundle, optimise
  Output: .js file
```

Each stage is a separate Python module with a clear interface:
- `preprocessor.py` — takes a string, returns a string
- `parser.py` — takes a string, returns a Python AST
- `transformer.py` — takes a Python AST, returns a PyX IR
- `codegen.py` — takes a PyX IR, returns a string
- `cli.py` — the `pyxc` command, orchestrates the pipeline

### 1.8 What the Runtime Must Implement

The PyX runtime is a JavaScript library. It is the most technically interesting
part of the project. It implements a simplified version of what React does.

**The virtual DOM:** Instead of manipulating the real DOM directly (which is slow),
the runtime builds a lightweight JavaScript object tree that mirrors what the DOM
should look like. This is the virtual DOM. Rendering a component produces a virtual
DOM tree, not real DOM nodes.

**Reconciliation:** When state changes, the component re-renders and produces a
new virtual DOM tree. The reconciler compares the new tree to the previous tree
(this comparison is called "diffing") and computes the minimum set of real DOM
operations needed to make the real DOM match the new virtual DOM. This is why
React is fast: it does not re-create the entire DOM on every state change.

**The diffing algorithm:** The naive approach (compare every node in the old tree
to every node in the new tree) is O(n³). React's algorithm is O(n) by making two
assumptions: elements of different types produce different trees; developer-supplied
keys identify stable elements across renders. PyX implements the same algorithm.

**Hooks:** `useState` and `useEffect` are implemented using a global array of
"hook slots" associated with each component instance. This is why hooks cannot
be called conditionally — the slot index must be stable across renders. The lesson
that implements hooks explains this in full.

### 1.9 Project Structure

```
pyx/
  compiler/           ← Python package, the pyxc compiler
    preprocessor.py   ← element syntax → h() calls
    parser.py         ← wraps ast.parse
    transformer.py    ← Python AST → PyX IR
    codegen.py        ← PyX IR → JSX string
    ir.py             ← the IR node types
    cli.py            ← the pyxc command-line tool
    tests/
  runtime/            ← JavaScript package, the pyx-runtime library
    src/
      h.js            ← element factory
      render.js       ← mounts app to DOM
      reconciler.js   ← virtual DOM diffing
      hooks.js        ← useState, useEffect
      index.js        ← exports
    tests/
  examples/
    counter/          ← the counter app from the syntax section
    todo/             ← a to-do list app
    full-stack/       ← a full PyX app with an Express backend
```

### 1.10 Languages Used and Why

**Python** for the compiler. The compiler reads Python source (`.pyx` files),
so Python is the natural implementation language — you can use Python's own `ast`
module, and the transformer code can reference Python AST node types directly.

**JavaScript** for the runtime. The runtime runs in the browser. There is no
choice — it must be JavaScript.

**The CLI (`pyxc`) is a Python script** installed via `pip install pyx-compiler`.
When a developer runs `pyxc build app.pyx`, Python runs the compiler pipeline
and writes the JSX output.

---

## Part 2 — Curriculum

### Structure

Six phases. The first three build the compiler. The next two build the runtime.
The last phase builds a real application with both.

**Phase 1 — The Pre-Processor (Lessons 01–05)**
The pre-processor finds and transforms element syntax in `.pyx` files.
No AST yet — string processing only. `pyxc` exists as a CLI and transforms
one file.

**Phase 2 — The AST and Transformer (Lessons 06–11)**
Python's `ast` module is introduced. The transformer walks the Python AST and
produces a PyX IR. Every Python construct that PyX supports is handled.

**Phase 3 — The Code Generator (Lessons 12–15)**
The IR is walked and JSX strings are emitted. The full compiler pipeline runs
end-to-end. A `.pyx` file compiles to a `.jsx` file.

**Phase 4 — The Runtime: Virtual DOM (Lessons 16–19)**
The JavaScript runtime is built. The `h()` factory, the virtual DOM tree,
and the `render()` function. A hardcoded virtual DOM tree renders to real DOM.

**Phase 5 — The Runtime: Reconciliation and Hooks (Lessons 20–25)**
The reconciler diffs two virtual DOM trees. `useState` and `useEffect` are
implemented. The counter example works end-to-end.

**Phase 6 — Full Stack and Polish (Lessons 26–30)**
A full PyX application with a Python/Express backend. Source maps. The Vite
plugin. Error messages that point to the `.pyx` source, not the generated JSX.

---

### Phase 1 — The Pre-Processor

---

#### Lesson 01 — What a Compiler Is

**What you will build:**
The `pyxc` CLI exists. Running `pyxc build hello.pyx` reads the file and prints
its contents back unchanged. No transformation yet. But the pipeline is in place:
read → transform (identity) → write. The project is set up with a `pyproject.toml`,
a virtual environment, and a `pyxc` entry point.

**CS concepts introduced:** What a compiler is (a program that transforms source
code in one language to another language), the difference between a compiler and
an interpreter, the stages of a compiler (lexing, parsing, transformation, code
generation), why each stage is separate.
**SE concepts introduced:** The pipeline pattern — a series of transformations,
each with a clear input type and output type.
**Tools introduced:** Python packaging (`pyproject.toml`, `pip install -e .`),
`argparse` for CLI argument parsing, Python virtual environments.

**Sections:**
1. What a compiler is — not magic. A program that reads text and writes different
   text. The input language and output language can be anything.
2. Famous compile-to-JS languages: TypeScript, CoffeeScript, Elm, ClojureScript,
   Dart — what they all have in common (they all implement the same pipeline).
3. The four stages of a compiler: lexing (characters → tokens), parsing
   (tokens → AST), transformation (source AST → target AST), code generation
   (target AST → output string). These stages are the same in every compiler.
4. `pyproject.toml` — the modern Python project definition file. Every field
   explained. Why it replaces `setup.py`.
5. `pip install -e .` — editable install. What it does (makes your package
   importable from anywhere, using the source files directly — changes take
   effect immediately without reinstalling).
6. `argparse` — Python's standard library CLI argument parser. The `build`
   subcommand. What `sys.argv` is.
7. Reading a file with `open()` and `read()` — explaining the context manager
   (`with` statement), why it closes the file automatically.
8. Writing the output file.
9. Definition of done: `pyxc build hello.pyx` copies the file unchanged.

---

#### Lesson 02 — Lexing Element Syntax

**What you will build:**
The pre-processor's lexer. It reads a `.pyx` source string character by character
and identifies the boundaries of element expressions: where `<div` starts, where
`</div>` ends, what is Python and what is element syntax.

**CS concepts introduced:** Lexing (tokenisation), finite state machines, the
difference between a lexer and a parser.
**SE concepts introduced:** Why lexing is separate from parsing — a lexer makes
one pass over characters and produces tokens; a parser makes one pass over tokens
and produces structure. Separating them makes each simpler.

**Sections:**
1. What lexing is — turning a stream of characters into a stream of tokens. A
   token is a named chunk: `PYTHON_CODE`, `ELEMENT_OPEN`, `ELEMENT_CLOSE`,
   `ELEMENT_SELF_CLOSE`, `EXPRESSION` (a `{...}` inside an element).
2. The finite state machine — the lexer is a state machine. States: `IN_PYTHON`,
   `IN_ELEMENT`, `IN_EXPRESSION`. Transitions triggered by characters.
3. Why a state machine is the right model — the lexer only ever needs to look at
   one character at a time, and its next action depends only on the current state
   and the current character. This is lookahead(1).
4. Implementing the state machine — a `while` loop over characters, a `state`
   variable, transition logic.
5. Token types as a Python `Enum` — what an Enum is (a named set of constants),
   why it is better than string literals for state names.
6. Testing the lexer — a simple `.pyx` string, verifying the token stream.
7. Definition of done: the lexer correctly identifies element boundaries in a
   mixed Python/element source string.

---

#### Lesson 03 — Parsing Element Trees

**What you will build:**
The pre-processor's parser. It takes the token stream from the lexer and builds
a tree of element nodes. `<div><h1>Title</h1></div>` becomes a tree where `div`
is the root with one child `h1` whose child is the text `"Title"`.

**CS concepts introduced:** Recursive descent parsing, tree construction,
the call stack as the implicit parse stack.
**SE concepts introduced:** Why parsing is separate from lexing — the parser
enforces structure (nesting rules, matching open/close tags); the lexer only
identifies tokens.

**Sections:**
1. What parsing is — turning a flat token stream into a tree that reflects the
   nesting structure of the source.
2. Recursive descent parsing — a family of mutually recursive functions, one per
   grammar rule. `parse_element` calls `parse_children` which calls `parse_element`
   for nested elements. The call stack IS the parse stack.
3. The element node type — `ElementNode(tag, props, children)`. Each field.
4. Parsing props — `class="app"` becomes `{"class": "app"}`. Handling quoted
   strings and `{expression}` values.
5. Matching open and close tags — detecting `<div>...</div>` mismatches and
   reporting a clear error.
6. Self-closing elements — `<input />` has no children.
7. Text nodes — raw text between tags becomes a `TextNode`.
8. Definition of done: the parser correctly builds an element tree from a token
   stream.

---

#### Lesson 04 — Generating `h()` Calls

**What you will build:**
The code generator for the pre-processor. It walks the element tree and emits
Python `h()` function calls. `<div class="app"><h1>Hello</h1></div>` becomes
`h("div", {"class": "app"}, h("h1", {}, "Hello"))`. The output is valid Python.

**CS concepts introduced:** Tree traversal for code generation, the visitor
pattern.
**SE concepts introduced:** Code generation as tree serialisation — walking a
tree and emitting a string representation of it.

**Sections:**
1. Code generation as tree serialisation — the reverse of parsing. Parsing turns
   a string into a tree; code generation turns a tree into a string.
2. The visitor pattern — a function that dispatches on node type. `visit(node)`
   checks `node.type` and calls the right handler. This is the same pattern used
   in Python's own `ast.NodeVisitor`.
3. Generating `h()` calls — the recursive structure: generate the tag string,
   generate the props dict, recursively generate each child.
4. Handling expression children — `{count}` inside an element becomes the Python
   variable `count` in the `h()` call (not a string).
5. Indentation and readability — emitting indented output so the generated Python
   is readable.
6. Definition of done: `<div class="app"><h1>Hello {name}</h1></div>` emits
   correct, runnable Python `h()` calls.

---

#### Lesson 05 — The Complete Pre-Processor

**What you will build:**
The pre-processor integrates the lexer, parser, and code generator. It takes a
full `.pyx` source string (with Python code and element syntax mixed), extracts
all element expressions, replaces them with `h()` calls, and returns valid Python.
`pyxc build` now outputs valid Python instead of copying the file.

**CS concepts introduced:** The substitution model — replacing sub-expressions
in-place.
**SE concepts introduced:** Integration testing — testing the whole pipeline
with real `.pyx` files, not just unit-testing individual stages.

**Sections:**
1. Integrating the three stages: lexer → parser → code generator.
2. Substitution — the pre-processor finds element expressions in the Python source,
   replaces them with `h()` calls, and leaves everything else unchanged.
3. Handling multiple element expressions in one file.
4. Handling nested `.pyx` imports — `from pyx import useState`.
5. The integration test — a real `.pyx` file with components, state, and nested
   elements. The output is valid Python.
6. Error messages — what happens when the element syntax is malformed. Printing
   the line number and a clear message.
7. Definition of done: `pyxc build counter.pyx` outputs valid Python that
   contains `h()` calls. Running the output with Python fails (no `h` function
   yet) but with no syntax errors.

---

### Phase 2 — The AST and Transformer

---

#### Lesson 06 — Python's AST Module

**What you will build:**
A standalone exploration of Python's `ast` module. No compiler changes yet.
The student parses several Python snippets and prints the AST. By the end, the
student can read any Python AST and describe what it represents.

**CS concepts introduced:** Abstract syntax trees — what "abstract" means (the
tree captures structure, not formatting or whitespace), the difference between a
parse tree (also called a concrete syntax tree) and an AST.
**SE concepts introduced:** Using the standard library before writing your own —
`ast.parse` is battle-tested Python. There is no reason to write a Python parser
from scratch.

**Sections:**
1. What an AST is — a tree where each node represents a syntactic construct.
   `x = 1 + 2` has an `Assign` node containing a `Name` node and a `BinOp` node.
2. `ast.parse()` — what it returns, the `ast.dump()` function for printing.
3. Walking the tree — `ast.walk()`, which yields every node. `ast.NodeVisitor`,
   which lets you define handlers for specific node types.
4. The nodes you will encounter most: `Module`, `FunctionDef`, `Return`,
   `Assign`, `Name`, `Call`, `Constant`, `BinOp`, `If`, `For`, `Import`,
   `ImportFrom`. Each one described.
5. Node fields — every node has fields. `FunctionDef` has `name`, `args`, `body`,
   `decorator_list`. Where to find this information (`ast` module documentation).
6. Definition of done: the student can look at any Python snippet, call `ast.parse`,
   and describe every node in the output.

---

#### Lesson 07 — The PyX IR

**What you will build:**
The intermediate representation (IR) — the custom AST that the transformer
produces and the code generator consumes. Every IR node type is defined in
`ir.py` as a Python dataclass.

**CS concepts introduced:** Intermediate representations — why compilers often
use two ASTs (a source AST and a target IR). The source AST mirrors the input
language; the IR mirrors the output language.
**SE concepts introduced:** Dataclasses as value objects — immutable, typed,
comparable. Why the IR nodes are dataclasses and not dicts.
**Tools introduced:** Python `dataclasses` — what `@dataclass` does, `field()`,
`frozen=True`.

**Sections:**
1. Why a separate IR — the Python AST has Python concepts (`lambda`, `list
   comprehension`, `with` statement). The target is JSX which has JS concepts
   (`const`, `let`, arrow functions, template literals). The transformer maps
   one to the other. Having a separate IR makes the code generator simpler:
   it only knows about JS concepts.
2. Python dataclasses — `@dataclass` generates `__init__`, `__repr__`, and
   `__eq__` automatically. `frozen=True` makes instances immutable.
3. The IR node types: `IRModule`, `IRFunction`, `IRReturn`, `IRVariable`,
   `IRAssign`, `IRCall`, `IRBinOp`, `IRIf`, `IRFor`, `IRImport`, `IRElement`,
   `IRText`, `IRExpression`. Each field defined.
4. Why the IR mirrors JSX, not JavaScript — the code generator emits JSX, which
   Vite then compiles to JavaScript.
5. Definition of done: every IR node type is defined, documented, and has a test
   case showing its structure.

---

#### Lesson 08 — Transforming Functions and Variables

**What you will build:**
The transformer handles Python function definitions and variable assignments.
`def Counter():` becomes `IRFunction("Counter", [], body)`. `count = 0` becomes
`IRAssign("count", IRConstant(0))`.

**CS concepts introduced:** Tree transformation — visiting every node in the
source AST and producing a corresponding node in the IR.
**SE concepts introduced:** The transformer as a pure function — it takes an AST,
returns an IR. No side effects. This makes it testable.

**Sections:**
1. `ast.NodeTransformer` — Python's built-in base class for AST transformers.
   The `visit_X` method convention.
2. Transforming `FunctionDef` — mapping Python function definition fields to
   `IRFunction` fields. Handling default arguments.
3. Transforming `Assign` — simple assignment, tuple unpacking (`count, set_count = ...`).
4. Transforming `Name` and `Constant` — variable references and literals.
5. Transforming `BinOp` — Python's operator names (`Add`, `Sub`, `Mult`, `Div`)
   mapped to JS operators (`+`, `-`, `*`, `/`).
6. The recursive structure — every `visit_X` method calls `self.visit()` on child
   nodes. This is the same recursive pattern as the pre-processor's code generator.
7. Definition of done: a Python function with arithmetic operations transforms to
   the correct IR.

---

#### Lesson 09 — Transforming Control Flow

**What you will build:**
The transformer handles `if` statements, `for` loops, and `while` loops. Python's
`if/elif/else` maps to JS's ternary operator for expressions and `if/else` for
statements.

**CS concepts introduced:** Control flow as a graph — the different paths through
a program. How `if`, `for`, and `while` are represented in the AST.
**SE concepts introduced:** The impedance mismatch between Python and JavaScript —
some Python constructs have direct JS equivalents; some do not. The transformer
decides how to bridge the gap.

**Sections:**
1. `ast.If` — the `test`, `body`, and `orelse` fields. How `elif` is represented
   (as a nested `If` in `orelse`).
2. Mapping Python `if/elif/else` to JS `if/else if/else`.
3. `ast.For` — Python's `for x in iterable` loop. Mapping to JS `for...of`.
4. `ast.While` — direct mapping to JS `while`.
5. List comprehensions — `[x * 2 for x in items]`. No direct JS equivalent.
   Mapped to `.map()`: `items.map(x => x * 2)`. This is a deliberate semantic
   mapping decision — it is documented as such.
6. Definition of done: a `.pyx` file with conditionals and loops transforms to
   correct IR.

---

#### Lesson 10 — Transforming Imports and the `h()` Call

**What you will build:**
The transformer handles `import` statements and recognises `h()` calls (produced
by the pre-processor). `from pyx import useState` becomes an IR import from
`pyx-runtime`. `h("div", {...}, ...)` calls are recognised and become `IRElement`
nodes.

**CS concepts introduced:** Import resolution — how a compiler handles cross-file
dependencies.
**SE concepts introduced:** The pipeline contract — the pre-processor guarantees
that all element syntax is `h()` calls by the time the transformer sees the AST.
The transformer trusts this guarantee and handles `h()` calls as a special case.

**Sections:**
1. `ast.Import` and `ast.ImportFrom` — the AST nodes for import statements.
2. The PyX module map — `pyx` (the Python module) maps to `pyx-runtime` (the
   JS package). The transformer knows this mapping.
3. Recognising `h()` calls — a `Call` node whose function is a `Name` with
   id `"h"`. Transforming it to `IRElement`.
4. Recognising `useState` and `useEffect` calls — transforming them to IR hooks.
5. Definition of done: a full `.pyx` component with imports and element syntax
   transforms to a complete IR.

---

#### Lesson 11 — Error Handling in the Transformer

**What you will build:**
The transformer produces clear, useful error messages when it encounters Python
syntax it does not support. `try/except`, generators, `yield`, `async/await` —
these are not supported in v1.0. The error message names the unsupported construct,
gives the line number in the original `.pyx` file, and suggests an alternative.

**CS concepts introduced:** Error recovery — a compiler that stops at the first
error is less useful than one that collects multiple errors. Strategy for continuing
after an error.
**SE concepts introduced:** Error messages as a UX concern — a compiler error
message is a communication to the developer. It should say what went wrong, where,
and what to do about it.

**Sections:**
1. Source location tracking — every `ast` node has `lineno` and `col_offset`.
   The transformer preserves these through the IR.
2. Unsupported constructs — listing every Python AST node type that PyX v1.0 does
   not support, and the error message for each.
3. Error accumulation — collecting multiple errors before aborting, so the developer
   sees all problems at once.
4. The `PyXError` exception type — structured error with location, message, and
   suggestion.
5. Definition of done: using `try/except` in a `.pyx` file produces a clear error
   pointing to the line.

---

### Phase 3 — The Code Generator

---

#### Lesson 12 — Generating JSX from the IR

**What you will build:**
The code generator walks the PyX IR and emits JSX strings. `IRFunction` becomes
a JavaScript function declaration. `IRElement` becomes an `h()` call (which Vite
will later compile to `React.createElement` equivalent calls). The output is
readable, correctly indented JSX.

**CS concepts introduced:** Pretty printing — emitting formatted, indented output
rather than a single concatenated string.
**SE concepts introduced:** The code generator as the inverse of the parser — the
parser turns strings into trees; the code generator turns trees into strings.

**Sections:**
1. The code generator structure — a class with a `generate(node)` method that
   dispatches on node type. The same visitor pattern as the transformer.
2. Indentation tracking — an `indent_level` counter. Helper methods `indent()` and
   `dedent()`. Emitting the correct number of spaces before each line.
3. Generating function declarations — `function Name(args) { body }`.
4. Generating variable declarations — `const name = value` vs `let name = value`.
   When to use each (PyX uses `const` for everything except loop variables).
5. Generating `h()` calls for `IRElement` nodes.
6. Generating the module — the import statements at the top, then the function
   declarations, then the default export.
7. Definition of done: the counter component compiles to readable, valid JSX.

---

#### Lesson 13 — The Full Pipeline End-to-End

**What you will build:**
`pyxc build counter.pyx` runs the complete pipeline: pre-processor → AST parse →
transformer → code generator → write `.jsx` file. The output file can be opened
and read. It is valid JSX.

**SE concepts introduced:** Integration — the moment each module is correct in
isolation, you wire them together. Integration bugs (mismatched interfaces,
incorrect assumptions between stages) are a separate class of bug from unit bugs.

**Sections:**
1. Wiring the pipeline in `cli.py`.
2. The output file convention — `counter.pyx` compiles to `counter.jsx`.
3. Reading the output — the student reads the generated JSX and verifies it
   matches the expected output for their `.pyx` source.
4. The error propagation chain — a pre-processor error, transformer error, or
   codegen error all surface as a `PyXError` with location and message.
5. The `--output` flag — specifying a custom output path.
6. Definition of done: `pyxc build counter.pyx` produces a `.jsx` file that is
   valid JSX and readable.

---

#### Lesson 14 — Running the Output with Vite

**What you will build:**
The compiled `.jsx` file is placed in a Vite project. `npm run dev` starts Vite,
which compiles the JSX to JavaScript and serves it. The browser loads `index.html`
which loads the compiled app. Nothing renders yet — the `pyx-runtime` package
does not exist. But the import chain is correct.

**Tools introduced:** How Vite handles `.jsx` files, the `index.html` entry point,
the `import` statement in the browser context.

**Sections:**
1. Setting up a Vite project alongside the compiler.
2. The `index.html` entry point — how Vite discovers which files to compile.
3. The import chain — `index.html` → `main.jsx` → `counter.jsx` → `pyx-runtime`.
4. The error in the browser console — `Cannot find module 'pyx-runtime'`. This
   is expected. The next phase builds the runtime.
5. Definition of done: Vite starts without errors; the only error is the missing
   runtime module.

---

#### Lesson 15 — Source Maps

**What you will build:**
The code generator emits a source map alongside the `.jsx` file. When a runtime
error occurs in the browser, the browser's devtools show the error pointing to
the `.pyx` source line, not the generated `.jsx` line.

**CS concepts introduced:** Source maps — a file that maps positions in generated
code back to positions in source code. The standard format (JSON with `mappings`
encoded as Base64 VLQ).
**SE concepts introduced:** The developer experience obligation — a compiler that
produces undebuggable output has failed. Source maps are not optional polish; they
are the mechanism that makes compiled languages usable.

**Sections:**
1. What a source map is — a JSON file that maps (generated line, generated column)
   pairs to (source file, source line, source column) pairs.
2. The source map format — the `mappings` field, Base64 VLQ encoding (explained
   from first principles — it is a compact encoding for sequences of integers).
3. Why source maps exist — without them, a stack trace in generated code is
   useless. With them, the browser translates it back to source locations.
4. Generating a source map — tracking source locations through the pipeline (the
   transformer preserves `lineno` and `col_offset` from the Python AST).
5. The `//# sourceMappingURL=` comment appended to the generated JSX.
6. Testing: introduce a runtime error in a `.pyx` file, compile, load in the
   browser, observe the stack trace pointing to the correct `.pyx` line.
7. Definition of done: errors in the browser console point to `.pyx` line numbers.

---

### Phase 4 — The Runtime: Virtual DOM

---

#### Lesson 16 — The `h()` Factory

**What you will build:**
`h.js` — the element factory. `h("div", {className: "app"}, "Hello")` returns a
plain JavaScript object `{type: "div", props: {className: "app"}, children: ["Hello"]}`.
This object is a virtual DOM node. No real DOM is touched.

**CS concepts introduced:** Virtual DOM — a lightweight in-memory representation
of what the real DOM should look like. Why virtual DOM is faster than direct DOM
manipulation (batch updates, minimal changes).
**SE concepts introduced:** The element factory as a pure function — given the
same arguments, it always returns the same virtual node. No side effects.

**Sections:**
1. What the DOM is — the browser's in-memory tree of all elements on the page.
   What `document.createElement`, `appendChild`, `setAttribute` do.
2. Why direct DOM manipulation is slow — each DOM operation can trigger reflow
   and repaint. Batching changes is faster.
3. The virtual DOM — a plain JavaScript object tree. Cheap to create, cheap to
   compare, no reflow cost.
4. The `h()` function — three arguments: `type` (string or function), `props`
   (object), `...children` (array). Returns a virtual node object.
5. Component vs host elements — lowercase `type` (`"div"`) is an HTML element;
   capitalised or function `type` (`Counter`) is a component.
6. Normalising children — flattening nested arrays, filtering `null` and `false`,
   converting numbers to strings.
7. Definition of done: `h("div", {id: "app"}, h("h1", {}, "Hello"))` returns
   the correct nested virtual node structure.

---

#### Lesson 17 — Rendering to the Real DOM

**What you will build:**
`render.js` — `render(vnode, container)` takes a virtual node and mounts it to
a real DOM element. A hardcoded virtual DOM tree (no components, no state)
renders a visible page in the browser.

**CS concepts introduced:** Tree traversal for DOM construction — a recursive
function that walks the virtual node tree and creates real DOM nodes.
**SE concepts introduced:** The render function as a tree walker — the same
recursive pattern as the code generator and the transformer.

**Sections:**
1. Creating real DOM nodes — `document.createElement(type)` for elements,
   `document.createTextNode(text)` for text nodes.
2. Setting props as DOM attributes — `element.setAttribute(key, value)` for
   HTML attributes, `element.addEventListener(event, handler)` for event props
   (`onClick` → `click`).
3. The `className` convention — JSX uses `className` instead of `class` because
   `class` is a JavaScript reserved word. The renderer maps `className` back to
   the `class` attribute.
4. Recursive construction — for each child in `vnode.children`, call `render`
   recursively and `appendChild` the result.
5. Mounting to the container — `container.appendChild(rendered)`.
6. Definition of done: a hardcoded virtual tree renders a visible heading and
   paragraph in the browser.

---

#### Lesson 18 — Rendering Components

**What you will build:**
When `vnode.type` is a function (a component), `render.js` calls it with props
to get the virtual node it returns, then renders that. `<Counter />` compiles to
`h(Counter, {})`, which calls `Counter({})` to get the virtual DOM tree.

**CS concepts introduced:** Higher-order functions — a component is a function
that returns a virtual DOM tree. The renderer calls it.
**SE concepts introduced:** Components as the unit of composition — a complex UI
is a tree of component calls, each returning its own virtual subtree.

**Sections:**
1. The function component contract — a function that accepts props and returns a
   virtual node.
2. Detecting component vs host elements in the renderer — `typeof vnode.type === 'function'`.
3. Calling the component function — `vnode.type(vnode.props)`.
4. Rendering the returned subtree — the result of the component call is itself
   a virtual node, rendered recursively.
5. Definition of done: a `Counter` component (without state yet — hardcoded values)
   renders correctly.

---

#### Lesson 19 — The Component Tree

**What you will build:**
Multiple nested components render correctly. `App` renders `Header` and `Main`.
`Main` renders a list of `Item` components. The full virtual DOM tree is logged
to the console. The student can see the shape of the tree before and after
component calls are resolved.

**SE concepts introduced:** The component tree vs the virtual DOM tree — before
components are called, the tree contains component nodes. After, it contains only
host nodes. This two-phase resolution is how React works.

**Sections:**
1. The two-phase render — component resolution and host rendering are logically
   separate (even if implemented in one recursive pass in PyX v1.0).
2. Logging the virtual tree — a `debug` mode that prints the tree at each stage.
3. Props passing — `h(Header, {title: "PyX"})` passes `{title: "PyX"}` to the
   `Header` function.
4. Children as props — `props.children` is the standard way to pass content
   into a component from its parent.
5. Definition of done: a three-level component tree renders correctly.

---

### Phase 5 — Reconciliation and Hooks

---

#### Lesson 20 — The Reconciler: Diffing Two Trees

**What you will build:**
`reconciler.js` — given an old virtual DOM tree and a new virtual DOM tree,
compute the list of DOM operations needed to make the real DOM match the new tree.
No state yet — the reconciler is tested with two hardcoded trees.

**CS concepts introduced:** Tree diffing, the O(n) reconciliation algorithm,
the two heuristics that make it O(n) (different types → replace; keys → stable
identity).
**SE concepts introduced:** The reconciler as the performance-critical core —
every state change triggers the reconciler. It must be fast.

**Sections:**
1. Naive tree diffing is O(n³) — comparing every node in the old tree to every
   node in the new tree. For a tree with 1000 nodes, that is 10⁹ comparisons.
2. React's O(n) heuristics — two rules that make diffing linear:
   (a) Nodes of different types are treated as completely different subtrees —
   replace everything. (b) `key` props identify stable nodes across renders —
   the reconciler matches old and new nodes by key, not position.
3. Implementing the diffing algorithm — `diff(oldVnode, newVnode, domNode)`.
4. The three cases: same type (update props and recurse into children), different
   type (replace the DOM node), null (insert or delete).
5. Updating props — computing the delta between old and new props objects.
6. Updating children — aligning old and new children arrays.
7. Definition of done: diffing two hardcoded trees produces the correct minimal
   list of DOM operations.

---

#### Lesson 21 — Applying the Diff to the DOM

**What you will build:**
The reconciler's diff output is applied to the real DOM. A button click swaps
two hardcoded virtual trees. The real DOM updates correctly with the minimum
number of operations.

**SE concepts introduced:** The separation between diff computation and DOM
mutation — computing the diff is pure (no side effects); applying it is impure
(mutates the DOM). Keeping them separate makes the diff testable without a DOM.

**Sections:**
1. The operation types — `INSERT`, `DELETE`, `REPLACE`, `UPDATE_PROPS`,
   `REORDER`.
2. Applying each operation to the DOM.
3. Event listener cleanup — when a node is replaced or deleted, its event
   listeners must be removed to avoid memory leaks.
4. The test harness — a button that swaps tree A for tree B, verifying that only
   the changed nodes are touched.
5. Definition of done: swapping two hardcoded trees updates the real DOM correctly
   with the minimum number of operations.

---

#### Lesson 22 — `useState`

**What you will build:**
`useState(initialValue)` returns `[value, setter]`. Calling the setter triggers
a re-render. The counter component works: clicking + increments the count.

**CS concepts introduced:** Closures — the setter function closes over the
component's slot index. How hooks use a global array of slots indexed by call order.
**SE concepts introduced:** Why hooks cannot be called conditionally — the slot
index must be stable across renders. If a hook is inside an `if` statement, the
index shifts on the next render. This is a design constraint, not a limitation.

**Sections:**
1. The hook slot array — a global array, one entry per hook call in the current
   component. `useState` reads and writes its slot.
2. The current component context — when a component is being rendered, a global
   variable records which component is current and resets the slot index to 0.
3. `useState` — on first call, stores `initialValue` in the slot and returns it.
   On subsequent calls, returns the current slot value.
4. The setter — a closure over the slot index. Calling it writes a new value to
   the slot and triggers a re-render.
5. Re-rendering — calling the component function again with the same props,
   running the reconciler on the new virtual tree.
6. Why hooks cannot be in `if` statements — demonstrated by breaking this rule
   and observing the wrong values returned.
7. Definition of done: the counter component increments correctly on click.

---

#### Lesson 23 — `useEffect`

**What you will build:**
`useEffect(fn, deps)` runs `fn` after the component renders. When `deps` changes,
`fn` runs again. The previous effect's cleanup function is called first.

**CS concepts introduced:** Side effects in a pure rendering model — rendering
should be a pure function of props and state. Effects are the escape hatch for
impure operations (fetching data, setting up subscriptions, timers).
**SE concepts introduced:** The dependency array as a memoisation key — `useEffect`
runs only when deps change. This is a performance optimisation that also prevents
infinite loops.

**Sections:**
1. What a side effect is in the context of rendering — anything that affects the
   world outside the component (network requests, timers, DOM mutations, log output).
2. Why effects run after render — the component must render first; effects happen
   in the background.
3. The dependency array — `useEffect(fn, [count])` runs `fn` when `count` changes.
   `useEffect(fn, [])` runs once on mount. `useEffect(fn)` runs every render.
4. Cleanup functions — `useEffect` can return a function. The runtime calls it
   before running the effect again, and when the component unmounts. Used to
   cancel timers, cancel network requests, remove event listeners.
5. Implementation — storing `[fn, deps, cleanup]` in a hook slot, comparing deps
   arrays with shallow equality.
6. Definition of done: a `useEffect` that fetches data on mount and cancels the
   request on unmount works correctly.

---

#### Lesson 24 — Keys and List Rendering

**What you will build:**
Rendering a list of components with `key` props. The reconciler uses keys to match
old and new list items. Adding, removing, and reordering items updates the DOM
correctly without re-creating unchanged items.

**CS concepts introduced:** The key as a stable identity — keys allow the
reconciler to track which item is which across renders, even if positions change.
**SE concepts introduced:** The key as a contract between the developer and the
runtime — the developer promises keys are unique and stable; the runtime promises
not to re-create DOM nodes unnecessarily.

**Sections:**
1. Why lists are the hardest reconciliation case — without keys, the reconciler
   can only compare by position. Inserting an item at the top causes every
   subsequent item to diff as changed.
2. Keys as a hash map — the reconciler builds a `Map<key, vnode>` for old and
   new children, then matches by key.
3. Detecting key violations — duplicate keys, missing keys — and the error messages.
4. Implementing keyed reconciliation.
5. Definition of done: a to-do list where items can be added, removed, and
   reordered updates correctly without re-creating unchanged DOM nodes.

---

#### Lesson 25 — Phase 5 Review: The Counter End-to-End

**What you will build:**
The counter app works end-to-end. Write `counter.pyx`, run `pyxc build counter.pyx`,
place the output in the Vite project, `npm run dev`, click + in the browser. The
student traces the full path: `.pyx` source → pre-processor → AST → transformer
→ IR → code generator → JSX → Vite → browser → `h()` → virtual DOM → render →
reconciler → real DOM update.

**Sections:**
1. The full trace, written by the student.
2. What each stage added — the pre-processor, the transformer, the code generator,
   the runtime. Which stage could be wrong if the count is incorrect, if the DOM
   is not updating, if there is a compile error.
3. Definition of done: the counter works; the student has written the full trace.

---

### Phase 6 — Full Stack and Polish

---

#### Lesson 26 — A PyX To-Do App

**What you will build:**
A complete to-do list application in PyX — add items, mark complete, delete.
Multiple components, list rendering with keys, `useState` for the list, `useEffect`
to persist to `localStorage`.

---

#### Lesson 27 — Full Stack: PyX Frontend + Python Backend

**What you will build:**
A Python Express-equivalent backend (using FastAPI) serves a REST API. The PyX
frontend fetches from it using `useEffect` and `fetch`. Data is real, not hardcoded.

**Tools introduced:** FastAPI — Python's modern async web framework. What CORS is
and why the browser blocks cross-origin requests without it.

---

#### Lesson 28 — The Vite Plugin

**What you will build:**
A Vite plugin that invokes `pyxc` automatically when a `.pyx` file changes. The
developer writes `.pyx`, saves, and the browser hot-reloads. No manual `pyxc build`
step needed.

**Tools introduced:** The Vite plugin API — `transform` hook, `load` hook.
What a Vite plugin is and how it fits into the build pipeline.

---

#### Lesson 29 — Error Messages as a Product

**What you will build:**
A review of every error message the compiler and runtime produce. Each is evaluated
against the standard: does it say what went wrong, where, and what to do? Poor
error messages are rewritten. A `.pyx` file with every class of error is the
test suite.

**SE concepts introduced:** Error messages as developer experience. The compiler
is a product and its users are developers. Bad error messages make the product
unusable.

---

#### Lesson 30 — What You Built and What Comes Next

**What you will build:**
A lesson with no new code. The student reads through the compiler and runtime
and names every concept from the curriculum map that they just implemented:
the finite state machine (pre-processor lexer), recursive descent parsing,
the visitor pattern (transformer and code generator), the strategy pattern
(executor in the LMS was the same pattern), tree diffing, closures (hook slots),
the observer pattern (file watcher in the LMS was the same pattern).

The lesson closes by showing what would be needed to support the unsupported
Python constructs: `async/await`, generators, decorators, exceptions. Each is
a well-defined extension with a clear implementation path.

---

## Part 3 — Concepts Taught By Lesson

| Concept | First Introduced |
|---|---|
| What a compiler is | Lesson 01 |
| `pyproject.toml` and pip editable install | Lesson 01 |
| `argparse` and CLI design | Lesson 01 |
| Lexing and finite state machines | Lesson 02 |
| Python `Enum` | Lesson 02 |
| Recursive descent parsing | Lesson 03 |
| Code generation as tree serialisation | Lesson 04 |
| The visitor pattern | Lesson 04 |
| Python `ast` module | Lesson 06 |
| Abstract syntax trees | Lesson 06 |
| Python dataclasses | Lesson 07 |
| Intermediate representations | Lesson 07 |
| AST transformation | Lesson 08 |
| Impedance mismatch between languages | Lesson 09 |
| List comprehensions → `.map()` | Lesson 09 |
| Source location tracking | Lesson 11 |
| Error accumulation | Lesson 11 |
| Pretty printing / indented codegen | Lesson 12 |
| Source maps and Base64 VLQ | Lesson 15 |
| Virtual DOM | Lesson 16 |
| DOM manipulation | Lesson 17 |
| Higher-order functions / function components | Lesson 18 |
| O(n) tree diffing and the two heuristics | Lesson 20 |
| Diff computation vs DOM mutation | Lesson 21 |
| Hook slot array and closures | Lesson 22 |
| Why hooks cannot be conditional | Lesson 22 |
| Side effects in a pure rendering model | Lesson 23 |
| Dependency arrays and memoisation | Lesson 23 |
| Keyed reconciliation | Lesson 24 |
| FastAPI and CORS | Lesson 27 |
| Vite plugin API | Lesson 28 |

---

## Part 4 — How This Project Connects to Everything Else

**To your existing projects:**
Your calculator and MATLAB clone already have a lexer and a parser. The pre-processor
in PyX is a third lexer/parser you will write. By the third time, the pattern is
permanent. The lesson on Python's `ast` module will make you look at your existing
parsers differently — they produce the same kind of tree that `ast.parse` produces.

**To the curriculum map:**
- A3 (Virtual Machine) — the hook slot array is a small virtual machine. State
  lives in slots indexed by call order. The component renderer is the executor.
- A2 (BST and Graph) — the virtual DOM is a tree. The reconciler is a tree
  traversal algorithm.
- E1 (Plugin System) — the Vite plugin in Lesson 28 is an implementation of
  the strategy pattern in a real plugin API.
- B1 (Shell) — the `pyxc` CLI is a small shell. Lesson 01 uses `argparse` the
  same way a shell uses argument parsing.

**To the PDM system:**
The PyX compiler is a tool you can build the PDM system's frontend in. A developer
on your team writes PyX components; `pyxc` compiles them; the PDM Electron app
serves them. The two projects are independently useful and together form a toolchain.
