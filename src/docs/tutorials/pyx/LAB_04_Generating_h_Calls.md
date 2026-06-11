# PyX — LAB 04 — Generating h() Calls

**Prerequisites:** Lab 03 complete. `python compiler/tests/test_parser.py` shows "13 passed, 0 failed."

**What this lab adds:**
- A code generator that walks the element tree and emits Python `h()` calls
- The visitor pattern — dispatching on node type to call the right generator
- Indented, readable output so the generated Python is easy to inspect
- Tests that verify the generated string against known inputs

**Time:** 60–90 minutes.

---

## What You Will Build

A function `generate(nodes: list[Node]) -> str` that takes the parsed node tree and produces a Python source string where every element is replaced with an `h()` call.

```
Input tree:
  PythonNode('return ')
  ElementNode('div', {'class': 'app'}, [
    ElementNode('p', {}, [TextNode('Hello'), ExpressionNode('name')])
  ])

Output string:
  return h("div", {"class": "app"},
      h("p", {},
          "Hello", name))
```

The output is valid Python. `ast.parse` can parse it. If you ran it with an `h` function defined, it would work. This is what the pre-processor produces before handing to the real Python AST parser.

---

> **Quick Check — try to answer before reading further:**
>
> 1. Parsing turns a string into a tree. Code generation turns a tree into a string. What pattern does each use? (Hint: both involve walking a tree.)
> 2. The `h()` call `h("div", {"class": "app"}, "hi")` has three arguments. Where does each argument come from in the `ElementNode`?
> 3. If you generate code by building a list of strings and joining them at the end, what is the advantage over concatenating strings one by one with `+`?
>
> *(Answers at the end of this lab)*

---

## Concept: Code Generation as Tree Serialisation

**What it is:** Code generation is the inverse of parsing. Parsing turns a string into a tree. Code generation turns a tree back into a string.

Both use the same technique: **tree traversal**. You visit each node in the tree and produce output for it. If the node has children, you visit the children recursively.

**The symmetry with parsing:**

In the parser, `_parse_element` called `_parse_children` which called `_parse_element` — mutual recursion handling nesting.

In the code generator, `_generate_element` will call `_generate_children` which will call `_generate_node` — the same mutual recursion, running in the opposite direction.

**Why tree traversal is the right model:**

The output structure mirrors the input structure. A nested element produces a nested `h()` call. The recursion depth of the generator matches the depth of the element tree.

**Watch for:** The code generator in this lab handles the pre-processor's element tree (the `Node` types from Lab 03). In Lab 12, you will write a second code generator for the full PyX IR. The structure of both generators is identical — the same visitor pattern, the same recursive traversal. The only difference is the node types and the output language.

---

## Concept: The Visitor Pattern

**What it is:** The **visitor pattern** is a way to dispatch to different logic based on the type of an object, without modifying the object class.

**The problem it solves:**

You have a tree with five different node types: `PythonNode`, `TextNode`, `ExpressionNode`, `ElementNode`. For each node type, the code generation logic is completely different. How do you organise this?

**Option 1 — if/elif chain:**
```python
def generate_node(node):
    if isinstance(node, PythonNode):
        return node.code
    elif isinstance(node, TextNode):
        return f'"{node.text}"'
    elif isinstance(node, ExpressionNode):
        return node.expression
    elif isinstance(node, ElementNode):
        # ... complex logic
```

This works. It is what you will write. The "visitor pattern" is just a formal name for this approach — a function that dispatches on node type.

**Option 2 — method on the class:**
```python
class PythonNode:
    def generate(self) -> str:
        return self.code
```

This is the other common approach. It works too, but it couples the "what is a node?" (the data) with "how do I generate code from it?" (the behaviour). When you want to add a different kind of operation (like `print_tree` from Lab 03), you would have to add a method to every node class.

**The visitor pattern keeps operations separate from data.** A function outside the class dispatches on type. This means you can add new operations (a code generator, a type-checker, a debugger) without touching the node classes.

**Watch for:** Python's own `ast.NodeVisitor` class uses this pattern (you will see it in Lab 06). The `visit_X` method convention — where `visit_FunctionDef` handles `FunctionDef` nodes — is `ast.NodeVisitor`'s version of this same dispatcher.

---

## Concept: String Building with Lists

**What it is:** Building up a string by collecting parts into a list and joining at the end, rather than concatenating with `+`.

**Why not concatenate with `+`:**

```python
# This is slow for long strings:
result = ""
for child in children:
    result += generate(child)  # creates a new string on every iteration
```

In Python, strings are **immutable** — a `str` object cannot be modified in place. Every `+=` creates a brand-new string object by copying the old string plus the new piece. For a 1000-character string with 100 children, this is 100 copy operations, each longer than the last. Total work: O(n²).

```python
# This is fast:
parts = []
for child in children:
    parts.append(generate(child))
result = "".join(parts)  # one copy at the end
```

`list.append` adds a reference to the list without copying string content. `"".join(parts)` makes exactly one copy. Total work: O(n).

For a small program this difference is invisible. For a 10,000-line codebase being compiled, it matters. Building strings with lists is a habit worth forming now.

**Watch for:** This is the same pattern you used in the lexer — `current_text: list[str]` collected characters, and `"".join(current_text)` produced the token text. The same reasoning applies everywhere you build strings incrementally.

---

## Step 1 — Write the Code Generator

Create `compiler/codegen_preprocessor.py`:

```python
from __future__ import annotations
from compiler.nodes import ElementNode, ExpressionNode, Node, PythonNode, TextNode


def generate(nodes: list[Node]) -> str:
    """
    Walk a list of top-level nodes and produce a Python source string.
    PythonNode text is emitted as-is.
    ElementNode is emitted as h() calls.
    """
    parts: list[str] = []
    for node in nodes:
        parts.append(_generate_node(node, indent=0))
    return "".join(parts)


def _generate_node(node: Node, indent: int) -> str:
    if isinstance(node, PythonNode):
        return node.code

    elif isinstance(node, TextNode):
        # Escape backslashes and double quotes so the text is valid inside a string literal
        escaped = node.text.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'

    elif isinstance(node, ExpressionNode):
        # Expression content is emitted as-is — it is already valid Python
        return node.expression

    elif isinstance(node, ElementNode):
        return _generate_element(node, indent)

    else:
        raise TypeError(f"Unknown node type: {type(node)}")


def _generate_element(node: ElementNode, indent: int) -> str:
    """
    Generate an h() call for an ElementNode.

    h("div", {"class": "app"},
        h("p", {}, "Hello", name))
    """
    parts: list[str] = []

    # First argument: tag name as a string
    parts.append(f'h("{node.tag}"')

    # Second argument: props dict
    parts.append(f", {_generate_props(node.props)}")

    # Remaining arguments: children
    if node.children:
        child_indent = indent + 4
        child_parts: list[str] = []
        for child in node.children:
            child_parts.append(_generate_node(child, child_indent))

        # If there is only one child and it is a short string, keep it on the same line
        if len(node.children) == 1 and isinstance(node.children[0], TextNode):
            parts.append(", ")
            parts.append(child_parts[0])
        else:
            # Multiple children or complex children: one per line, indented
            indent_str = " " * child_indent
            children_str = f",\n{indent_str}".join(child_parts)
            parts.append(f",\n{indent_str}{children_str}")

    parts.append(")")
    return "".join(parts)


def _generate_props(props: dict) -> str:
    """
    Generate a Python dict literal from a props dict.
    String values become "value" literals.
    ExpressionNode values become their expression text.
    """
    if not props:
        return "{}"

    parts: list[str] = []
    for key, value in props.items():
        if isinstance(value, ExpressionNode):
            parts.append(f'"{key}": {value.expression}')
        else:
            escaped = str(value).replace("\\", "\\\\").replace('"', '\\"')
            parts.append(f'"{key}": "{escaped}"')

    return "{" + ", ".join(parts) + "}"
```

---

### SAVE AND TRY

```
> python -c "
from compiler.lexer import lex
from compiler.parser import parse
from compiler.codegen_preprocessor import generate

source = 'return <div class=\"app\"><p>Hello</p></div>'
nodes = parse(lex(source))
print(generate(nodes))
"
```

**Expected output:**
```
return h("div", {"class": "app"},
    h("p", {}, "Hello"))
```

---

## Step 2 — Write the Tests

Create `compiler/tests/test_codegen_preprocessor.py`:

```python
from compiler.lexer import lex
from compiler.parser import parse
from compiler.codegen_preprocessor import generate


def _gen(source: str) -> str:
    return generate(parse(lex(source)))


def test_python_only():
    assert _gen("x = 1\n") == "x = 1\n"


def test_simple_element():
    assert _gen("<div>hello</div>") == 'h("div", {}, "hello")'


def test_element_no_children():
    assert _gen("<div></div>") == 'h("div", {})'


def test_self_closing():
    result = _gen('<input type="text" />')
    assert result == 'h("input", {"type": "text"})'


def test_element_with_string_prop():
    result = _gen('<div class="app">text</div>')
    assert result == 'h("div", {"class": "app"}, "text")'


def test_element_with_expression_prop():
    result = _gen("<Counter value={state} />")
    assert result == 'h("Counter", {"value": state})'


def test_expression_child():
    result = _gen("<p>{count}</p>")
    assert result == "h(\"p\", {}, count)"


def test_mixed_text_and_expression():
    result = _gen("<p>Hello {name}!</p>")
    assert 'h("p"' in result
    assert '"Hello "' in result
    assert 'name' in result
    assert '"!"' in result


def test_nested_element():
    result = _gen("<div><p>inner</p></div>")
    assert 'h("div"' in result
    assert 'h("p"' in result
    assert '"inner"' in result


def test_python_around_element():
    result = _gen('return <div>hi</div>\n')
    assert result.startswith("return ")
    assert 'h("div"' in result
    assert result.endswith("\n")


def test_multiple_children():
    result = _gen("<div><p>a</p><span>b</span></div>")
    assert 'h("div"' in result
    assert 'h("p"' in result
    assert 'h("span"' in result


def test_deeply_nested():
    result = _gen("<div><section><p>deep</p></section></div>")
    assert 'h("div"' in result
    assert 'h("section"' in result
    assert 'h("p"' in result
    assert '"deep"' in result


def test_output_is_valid_python():
    """The generated output must be parseable by Python's ast module."""
    import ast
    result = _gen('def Hello():\n    return <div class="app">Hi {name}</div>\n')
    # Wrap in a function stub that defines h so the parse succeeds
    wrapped = f"def h(*args): pass\n{result}"
    ast.parse(wrapped)  # raises SyntaxError if invalid


if __name__ == "__main__":
    tests = [
        test_python_only,
        test_simple_element,
        test_element_no_children,
        test_self_closing,
        test_element_with_string_prop,
        test_element_with_expression_prop,
        test_expression_child,
        test_mixed_text_and_expression,
        test_nested_element,
        test_python_around_element,
        test_multiple_children,
        test_deeply_nested,
        test_output_is_valid_python,
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

The last test — `test_output_is_valid_python` — is especially important. It uses Python's own `ast.parse` to verify that the generated string is valid Python. If the code generator ever produces malformed output, this test catches it immediately, before the problem appears much later in the pipeline.

---

### SAVE AND TRY

```
> python compiler/tests/test_codegen_preprocessor.py
```

**Expected output:**
```
  PASS  test_python_only
  PASS  test_simple_element
  PASS  test_element_no_children
  PASS  test_self_closing
  PASS  test_element_with_string_prop
  PASS  test_element_with_expression_prop
  PASS  test_expression_child
  PASS  test_mixed_text_and_expression
  PASS  test_nested_element
  PASS  test_python_around_element
  PASS  test_multiple_children
  PASS  test_deeply_nested
  PASS  test_output_is_valid_python

13 passed, 0 failed
```

---

## Step 3 — Update `hello.pyx` and Verify End-to-End

Create a richer test file at `examples/counter.pyx`:

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

Run the compiler with `--tree` first to see the parsed structure:

```
> pyxc build examples/counter.pyx --tree
```

You will see the full node tree. Then run the code generator debug flag — add `--codegen` to the CLI to print the generated Python before it becomes the output:

Add to `compiler/cli.py` build subparser:
```python
build_parser.add_argument(
    "--codegen",
    action="store_true",
    help="Print the pre-processor output and exit (debugging)",
)
```

Update `_run_build`:
```python
def _run_build(
    input_path: str,
    output_path: str | None,
    show_tokens: bool = False,
    show_tree: bool = False,
    show_codegen: bool = False,
) -> None:
    ...
    if show_codegen:
        from compiler.lexer import lex
        from compiler.parser import parse
        from compiler.codegen_preprocessor import generate
        tokens = lex(source)
        nodes = parse(tokens)
        print(generate(nodes))
        return

    result = source
    ...
```

Update the `main()` call:
```python
if args.command == "build":
    _run_build(
        args.input, args.output,
        show_tokens=args.tokens,
        show_tree=args.tree,
        show_codegen=args.codegen,
    )
```

---

### SAVE AND TRY

```
> pyxc build examples/counter.pyx --codegen
```

**Expected output** (approximately):
```python
from pyx import useState

def Counter():
    count, set_count = useState(0)

    def increment():
        set_count(count + 1)

    return (
        h("div", {"class": "counter"},
            h("p", {}, "Count: ", count),
            h("button", {"onClick": increment}, "+"))
    )
```

The Python code is preserved unchanged. The element syntax is replaced with `h()` calls. This is valid Python — if you defined `h` and `useState`, you could run this file directly.

---

## Challenge: Handle Text With Newlines and Spaces

**You know:** Inside an element, the text between tags often has leading and trailing whitespace from indentation:

```python
return (
    <div>
        <p>Hello</p>
    </div>
)
```

The `TextNode` for the space between `<div>` and `<p>` contains `"\n        "` — a newline and eight spaces. This becomes `"\n        "` (a string literal with whitespace) in the generated `h()` call, which adds a visible text node in the DOM.

**Task:** Modify `_generate_node` for `TextNode` to strip text nodes that contain only whitespace characters. A text node that is all whitespace should not be emitted at all — return an empty string.

**Expected behavior:**
- `"Hello"` → `'"Hello"'` (preserved)
- `"\n    "` → `""` (stripped, produces no output)
- `"Count: "` → `'"Count: "'` (preserved — has non-whitespace content)

Try for 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

In `_generate_node`, update the `TextNode` case:

```python
elif isinstance(node, TextNode):
    if not node.text.strip():
        return ""  # whitespace-only text node — do not emit
    escaped = node.text.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'
```

**Key insight:** HTML treats whitespace between tags as significant, but PyX element syntax (like JSX) treats whitespace-only text between block elements as irrelevant. React's JSX compiler does the same thing — `<div>\n  <p>` does not produce a text node for the newline and spaces. This is a deliberate semantic decision that differs from how browsers parse HTML directly. The `strip()` check is the right place to make this decision — in the code generator, not in the lexer or parser.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `generate` produces `h()` calls | `generate(parse(lex("<div>hi</div>")))` returns `'h("div", {}, "hi")'` |
| Props are in dict syntax | `generate(parse(lex('<div class="x"></div>')))` includes `{"class": "x"}` |
| Expression props are unquoted | `generate(parse(lex('<C v={x} />')))` produces `{"v": x}` not `{"v": "x"}` |
| Output is valid Python | `test_output_is_valid_python` passes |
| All 13 tests pass | `python compiler/tests/test_codegen_preprocessor.py` shows "13 passed, 0 failed" |
| `--codegen` flag works | `pyxc build examples/counter.pyx --codegen` prints h()-transformed source |

---

## Your Complete Files

### `compiler/codegen_preprocessor.py`
*(full file as written in Step 1)*

### `compiler/tests/test_codegen_preprocessor.py`
*(full file as written in Step 2)*

### Project structure at end of Lab 04
```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py          ← updated with --codegen flag
│   ├── codegen_preprocessor.py  ← new
│   ├── lexer.py
│   ├── nodes.py
│   ├── parser.py
│   ├── tokens.py
│   └── tests/
│       ├── __init__.py
│       ├── test_codegen_preprocessor.py  ← new
│       ├── test_lexer.py
│       └── test_parser.py
├── examples/
│   ├── counter.pyx     ← new
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. What pattern does each step (parsing and code generation) use?**

Both use **recursive tree traversal** (the visitor pattern). Parsing: a token at the start of an element triggers a function call that recursively processes children — the recursion depth equals the nesting depth. Code generation: a node at the start of an element triggers a function call that recursively generates children, inserting them as arguments inside the parent's `h()` call. Both are depth-first tree traversals. The difference is direction: parsing builds a tree from a stream; generation produces a stream from a tree.

**2. Where do the three arguments of `h("div", {"class": "app"}, "hi")` come from?**

- `"div"` — from `ElementNode.tag`
- `{"class": "app"}` — from `ElementNode.props` (a dict)
- `"hi"` — from `ElementNode.children[0]` (a `TextNode`)

The code generator produces the arguments by visiting each part of the `ElementNode` separately and joining the results.

**3. What is the advantage of collecting strings in a list before joining?**

Performance. Strings in Python are immutable. Concatenating with `+` creates a new string object on every operation, copying all previous content. For n children each producing a string of length L, that is O(n²·L) total copies. `list.append` is O(1). `"".join(parts)` makes one copy of all parts at the end — O(n·L). The list approach is also cleaner code: you can append, extend, or conditionally append to the list before the final join, without managing intermediate string variables.

---

*End of LAB 04.*

*Lab 05 integrates the lexer, parser, and code generator into a complete pre-processor. A full `.pyx` file with multiple components, nested elements, and expressions runs through the entire pipeline and produces valid Python. This is the first time `pyxc build` does something real.*
