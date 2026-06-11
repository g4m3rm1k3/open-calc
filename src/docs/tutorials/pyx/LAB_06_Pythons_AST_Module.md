# PyX — LAB 06 — Python's AST Module

**Prerequisites:** Lab 05 complete. `pyxc build examples/counter.pyx` produces a `.jsx` file containing `h()` calls.

**What this lab adds:**
- Hands-on exploration of Python's built-in `ast` module
- The ability to read and describe any Python AST
- Understanding of the 13 most important AST node types
- A mental model of how Python represents code as data — the foundation for Phase 2

**Time:** 60–75 minutes. This lab writes almost no production code — it is a focused study session. Every minute here pays off across Labs 07–11.

---

## What You Will Build

No new modules. No new CLI flags. Instead, you will spend this lab in the Python REPL examining real Python ASTs and building the mental model you need to write the transformer in Labs 07–11.

By the end, you should be able to look at any Python snippet and describe its AST structure — which node types appear, what fields they have, and how they nest. The exercises at the end verify this.

---

> **Quick Check — try to answer before reading further:**
>
> 1. You wrote a lexer and parser for `.pyx` element syntax. Python's `ast` module is also a parser. What is the difference between what your lexer produces and what `ast.parse` produces?
> 2. Python's AST is described as "abstract." What is the concrete thing it abstracts away from?
> 3. If `ast.parse("x = 1")` produces a tree, what do you think `ast.parse("y = 1")` produces? Is it the same tree, a different tree, or an error?
>
> *(Answers at the end of this lab)*

---

## Concept: What Is Python's `ast` Module?

**What it is:** `ast` (Abstract Syntax Tree) is a Python standard library module that can parse any valid Python source string and return a tree of Python objects representing the code's structure.

```python
import ast
tree = ast.parse("x = 1 + 2")
print(ast.dump(tree, indent=2))
```

`ast.parse` does what your Lab 02–03 lexer and parser did — but for all of Python, not just element syntax. The Python developers have been maintaining this parser for decades; it handles every edge case correctly. PyX uses it rather than writing a Python parser from scratch.

**What `ast.dump` shows:**

`ast.dump(tree, indent=2)` prints a human-readable representation of the tree. For `x = 1 + 2`:

```
Module(
  body=[
    Assign(
      targets=[
        Name(id='x', ctx=Store())],
      value=BinOp(
        left=Constant(value=1),
        op=Add(),
        right=Constant(value=2)))],
  type_ignores=[])
```

Read this as:
- A `Module` (every Python file is a module) containing a body of statements
- The first statement is an `Assign` node
- The `Assign` has a `targets` list (what is being assigned to) and a `value` (what is being assigned)
- `targets[0]` is a `Name` node with `id='x'` and `ctx=Store()` (being written to)
- `value` is a `BinOp` (binary operation) with `left=Constant(1)`, `op=Add()`, `right=Constant(2)`

The characters `=`, `+`, `1`, `2`, `x`, whitespace — all gone. Only structure remains. This is what "abstract" means.

**Watch for:** The `ast` module output changed between Python versions. In Python 3.8+, number literals are `Constant(value=1)` instead of the older `Num(n=1)`. If you see `Num` in online examples, they were written for Python 3.7 or earlier. Always test with your own Python version.

---

## Step 1 — Explore `ast.parse` in the REPL

Open the Python REPL with your virtual environment active:

```
> python
```

Run each example and look carefully at the output. Do not just read — type each one.

---

**Example 1: A simple assignment**

```python
>>> import ast
>>> print(ast.dump(ast.parse("x = 1"), indent=2))
```

Find in the output: `Assign`, `Name`, `Constant`. Note that `Name` has a `ctx` of `Store()` (you are storing into `x`).

---

**Example 2: Reading a variable**

```python
>>> print(ast.dump(ast.parse("y = x"), indent=2))
```

The right-hand side is a `Name` with `ctx=Load()` — you are reading from `x`. Compare `ctx=Store()` (write) vs `ctx=Load()` (read). The same `Name` node type covers both cases; the `ctx` field distinguishes them.

---

**Example 3: A function definition**

```python
>>> print(ast.dump(ast.parse("def greet(name):\n    return name"), indent=2))
```

Find: `FunctionDef` with fields `name` (a string, the function name), `args` (an `arguments` node with the parameter list), and `body` (a list of statements). The `Return` statement inside has a `value` field.

---

**Example 4: A function call**

```python
>>> print(ast.dump(ast.parse("print('hello')"), indent=2))
```

Find: `Call` with fields `func` (what is being called — a `Name` with `id='print'`), `args` (positional arguments), and `keywords` (keyword arguments). `Constant(value='hello')` is the string argument.

---

**Example 5: An if statement**

```python
>>> print(ast.dump(ast.parse("if x > 0:\n    y = 1\nelse:\n    y = -1"), indent=2))
```

Find: `If` with fields `test` (the condition — a `Compare` node), `body` (the if branch — a list), and `orelse` (the else branch — a list, empty when there is no else).

---

**Example 6: A for loop**

```python
>>> print(ast.dump(ast.parse("for item in items:\n    print(item)"), indent=2))
```

Find: `For` with fields `target` (the loop variable — a `Name` with `ctx=Store()`), `iter` (the iterable — a `Name` with `ctx=Load()`), and `body`.

---

**Example 7: Tuple unpacking (important for PyX)**

```python
>>> print(ast.dump(ast.parse("count, set_count = useState(0)"), indent=2))
```

Find: `Assign` with `targets=[Tuple(...)]`. The tuple on the left side of the assignment has two `Name` elements — `count` and `set_count`, both with `ctx=Store()`.

This is the exact pattern that `useState` returns. The transformer must handle this correctly.

---

**Example 8: An import statement**

```python
>>> print(ast.dump(ast.parse("from pyx import useState"), indent=2))
```

Find: `ImportFrom` with fields `module` (the `"pyx"` string), `names` (a list of `alias` objects with `name='useState'`), and `level` (0 for absolute imports).

---

## Step 2 — Learn `ast.walk` and `ast.NodeVisitor`

Two tools for traversing an AST:

**`ast.walk(tree)`** — yields every node in the tree, in no particular order:

```python
>>> import ast
>>> tree = ast.parse("def f():\n    x = 1\n    return x")
>>> for node in ast.walk(tree):
...     print(type(node).__name__)
```

**Expected output** (order may vary):
```
Module
FunctionDef
arguments
Assign
Return
Name
Constant
Name
```

`ast.walk` is useful when you want to find all nodes of a specific type regardless of depth:

```python
>>> names = [n.id for n in ast.walk(tree) if isinstance(n, ast.Name)]
>>> print(names)
['x', 'x']
```

---

**`ast.NodeVisitor`** — a class-based visitor where each method handles a specific node type:

```python
>>> import ast
>>> 
>>> class FunctionFinder(ast.NodeVisitor):
...     def visit_FunctionDef(self, node):
...         print(f"Found function: {node.name}")
...         self.generic_visit(node)  # continue visiting children
...
>>> finder = FunctionFinder()
>>> finder.visit(ast.parse("def foo():\n    def bar():\n        pass"))
Found function: foo
Found function: bar
```

`visit_FunctionDef` is called automatically for every `FunctionDef` node. `generic_visit` continues the traversal into children — without it, the visitor stops at the first matching node.

The naming convention: `visit_` + node type name. `visit_Assign` for `Assign` nodes, `visit_For` for `For` nodes, etc.

**This is the same visitor pattern from Lab 04** — dispatching on type to call different logic. Python's `ast.NodeVisitor` is the formalised version of the `isinstance` chain you wrote in the code generator.

---

## Step 3 — The 13 Node Types You Must Know

The PyX transformer handles these node types. Learn each one now. For each, type it in the REPL and examine the output.

| Node type | What it represents | Key fields |
|---|---|---|
| `Module` | A complete Python file | `body: list[stmt]` |
| `FunctionDef` | A function definition | `name: str`, `args: arguments`, `body: list[stmt]`, `decorator_list` |
| `Return` | A return statement | `value: expr \| None` |
| `Assign` | An assignment | `targets: list`, `value: expr` |
| `AugAssign` | `x += 1` style | `target`, `op`, `value` |
| `Name` | A variable reference | `id: str`, `ctx: Load \| Store \| Del` |
| `Constant` | A literal value | `value: int \| float \| str \| bool \| None` |
| `Call` | A function call | `func: expr`, `args: list`, `keywords: list` |
| `BinOp` | Binary operation `a + b` | `left`, `op`, `right` |
| `If` | An if statement | `test`, `body: list`, `orelse: list` |
| `For` | A for loop | `target`, `iter`, `body: list`, `orelse: list` |
| `Import` | `import x` | `names: list[alias]` |
| `ImportFrom` | `from x import y` | `module: str`, `names: list[alias]`, `level: int` |

Run this in the REPL for each node type to see a concrete example:

```python
>>> import ast
>>> snippets = {
...     "Module": "x = 1",
...     "FunctionDef": "def f(a, b):\n    return a + b",
...     "Return": "def f():\n    return 42",
...     "Assign": "x = 1",
...     "AugAssign": "x += 1",
...     "Name": "x",
...     "Constant": "42",
...     "Call": "f(1, 2)",
...     "BinOp": "1 + 2",
...     "If": "if x:\n    pass",
...     "For": "for i in items:\n    pass",
...     "Import": "import os",
...     "ImportFrom": "from pyx import useState",
... }
>>> for name, code in snippets.items():
...     tree = ast.parse(code)
...     print(f"\n── {name} ──")
...     print(ast.dump(tree, indent=2)[:300])
```

---

## Step 4 — Examine the Pre-Processed Counter

Open `examples/counter.jsx` (the output of `pyxc build examples/counter.pyx`). Parse it with `ast.parse` and examine the tree:

```python
>>> import ast
>>> with open("examples/counter.jsx", "r") as f:
...     source = f.read()
>>> tree = ast.parse(source)
>>> print(ast.dump(tree, indent=2))
```

You should see the full AST of the pre-processed counter component. Identify:

1. The `ImportFrom` node — `from pyx import useState`
2. The outer `FunctionDef` node — `def Counter()`
3. The inner `Assign` with a `Tuple` target — `count, set_count = useState(0)`
4. The inner `FunctionDef` — `def increment()`
5. The `Return` statement with a `Call` node — `return h("div", ...)`

If you can find all five, you understand the AST well enough to write the transformer.

---

## Step 5 — Write a Simple AST Analyser

This exercise builds AST reading skill by doing. Create `compiler/tests/test_ast_reading.py`:

```python
import ast


def test_function_names():
    """Extract all function names defined in a source string."""
    source = (
        "def foo():\n"
        "    def bar():\n"
        "        pass\n"
        "def baz():\n"
        "    pass\n"
    )
    tree = ast.parse(source)
    names = sorted(
        node.name
        for node in ast.walk(tree)
        if isinstance(node, ast.FunctionDef)
    )
    assert names == ["bar", "baz", "foo"]


def test_all_constants():
    """Extract all constant values from an expression."""
    source = "result = 1 + 2 * (3 - 4)"
    tree = ast.parse(source)
    constants = sorted(
        node.value
        for node in ast.walk(tree)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float))
    )
    assert constants == [1, 2, 3, 4]


def test_import_names():
    """Extract what is being imported from pyx."""
    source = "from pyx import useState, useEffect"
    tree = ast.parse(source)
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and node.module == "pyx":
            imports = [alias.name for alias in node.names]
    assert sorted(imports) == ["useEffect", "useState"]


def test_tuple_unpack_names():
    """Detect tuple unpacking: count, set_count = useState(0)"""
    source = "count, set_count = useState(0)"
    tree = ast.parse(source)
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            assert len(node.targets) == 1
            target = node.targets[0]
            assert isinstance(target, ast.Tuple)
            names = [elt.id for elt in target.elts if isinstance(elt, ast.Name)]
            assert names == ["count", "set_count"]


def test_h_call_detection():
    """Detect h() calls in pre-processed PyX output."""
    source = 'return h("div", {}, h("p", {}, "hello"))'
    tree = ast.parse(source, mode="eval")
    # mode="eval" parses a single expression
    h_calls = [
        node for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "h"
    ]
    assert len(h_calls) == 2  # outer h("div") and inner h("p")


if __name__ == "__main__":
    tests = [
        test_function_names,
        test_all_constants,
        test_import_names,
        test_tuple_unpack_names,
        test_h_call_detection,
    ]

    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            print(f"  PASS  {test.__name__}")
            passed += 1
        except AssertionError as e:
            print(f"  FAIL  {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"  ERROR {test.__name__}: {type(e).__name__}: {e}")
            failed += 1

    print(f"\n{passed} passed, {failed} failed")
```

---

### SAVE AND TRY

```
> python compiler/tests/test_ast_reading.py
```

**Expected output:**
```
  PASS  test_function_names
  PASS  test_all_constants
  PASS  test_import_names
  PASS  test_tuple_unpack_names
  PASS  test_h_call_detection

5 passed, 0 failed
```

---

## Challenge: Find All h() Call Tag Names

**You know:** `ast.walk` yields every node. `isinstance(node, ast.Call)` identifies calls. A `Call` node has a `func` field (what is being called) and an `args` field (the positional arguments).

**Task:** Write a function `find_element_tags(source: str) -> list[str]` that parses a pre-processed PyX source string (containing `h()` calls) and returns the list of all tag names used, in the order they appear.

For `'h("div", {}, h("p", {}, "hello"))'`:
```python
find_element_tags('return h("div", {}, h("p", {}, "hello"))')
# → ["div", "p"]
```

**Hint:** An `h()` call has `func.id == "h"` and `args[0]` is the tag name — a `Constant` with a `str` value.

Try for 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
import ast

def find_element_tags(source: str) -> list[str]:
    tree = ast.parse(source)
    tags = []
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Name)
            and node.func.id == "h"
            and node.args
            and isinstance(node.args[0], ast.Constant)
            and isinstance(node.args[0].value, str)
        ):
            tags.append(node.args[0].value)
    return tags
```

**Key insight:** The chain of `isinstance` checks might look defensive, but every check is necessary. `node.func` might not be a `Name` (it could be a method call like `pyx.h(...)`). `node.args` might be empty. `node.args[0]` might not be a `Constant`. Without each check, the function would crash on valid Python code that is not a PyX `h()` call. This defensive style is standard when traversing ASTs — you can never guarantee the shape of every node without checking.

`ast.walk` does not preserve source order for sibling nodes (siblings are visited by dict iteration order, which is consistent but not necessarily left-to-right). For guaranteed source order, use `ast.NodeVisitor` with `generic_visit` instead.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `ast.parse` works | `ast.parse("x = 1")` returns a `Module` object without error |
| You can read an `Assign` node | `ast.dump(ast.parse("x = 1"), indent=2)` shows `Assign`, `Name`, `Constant` |
| You can read a `FunctionDef` | `ast.dump(ast.parse("def f(x): return x"), indent=2)` shows the full structure |
| Tuple unpack pattern is visible | `ast.dump(ast.parse("a, b = f()"), indent=2)` shows `Tuple` with two `Name` targets |
| `h()` calls appear as `Call` nodes | `ast.dump(ast.parse('h("div", {})'), indent=2)` shows a `Call` with `func.id='h'` |
| All 5 AST reading tests pass | `python compiler/tests/test_ast_reading.py` shows "5 passed, 0 failed" |

---

## Your Complete Files

This lab has no new source files — you explored the `ast` module entirely in the REPL and wrote tests. Only the test file is new.

**`compiler/tests/test_ast_reading.py`** — five assertion-based tests verifying you can read the key AST node types. Full content in Step 5.

### Project structure at end of Lab 06

```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py
│   ├── codegen_preprocessor.py
│   ├── lexer.py
│   ├── nodes.py
│   ├── parser.py
│   ├── preprocessor.py
│   ├── tokens.py
│   └── tests/
│       ├── __init__.py
│       ├── test_ast_reading.py      ← new
│       ├── test_codegen_preprocessor.py
│       ├── test_lexer.py
│       └── test_parser.py
├── examples/
│   ├── counter.pyx
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. What is the difference between what your lexer produces and what `ast.parse` produces?**

Your lexer produces a flat list of `Token` objects — named chunks of text with no structure. `ast.parse` produces a deeply nested tree of `ast` node objects — a fully structured representation of the code. Your lexer and parser together produce a tree for the element syntax only. `ast.parse` produces a tree for the entire Python language. Scale and complexity differ enormously, but the concept is the same: turn characters into structure.

**2. What does the AST abstract away from?**

The concrete syntax: the `=` sign in an assignment, the parentheses in a function call, the `def` keyword in a function definition, the `return` keyword, colons, commas, indentation. None of these appear as nodes in the AST — they are implied by the node structure. `Assign(targets=[Name('x')], value=Constant(1))` encodes the assignment without the `=`. The structure carries the meaning; the punctuation is discarded.

**3. Is `ast.parse("y = 1")` the same tree as `ast.parse("x = 1")`?**

A different tree. They have the same structure (`Module → Assign → Name + Constant`) but the `Name.id` field is `'y'` instead of `'x'`. The structure is the same shape; the content differs. This distinction — same structure, different values — is important for the transformer: you transform the structure (e.g., `Assign` becomes `IRAssign`) while preserving or translating the values (the variable name `'x'` becomes the JS variable `x`).

---

*End of LAB 06.*

*Lab 07 defines the PyX Intermediate Representation — a second AST whose node types mirror JavaScript concepts rather than Python concepts. Every node the transformer will produce is defined in `ir.py` using Python dataclasses. Understanding the IR before writing the transformer is how you avoid the trap of designing as you go.*
