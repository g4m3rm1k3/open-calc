# PyX — LAB 03 — Parsing Element Trees

**Prerequisites:** Lab 02 complete. `python compiler/tests/test_lexer.py` shows "10 passed, 0 failed."

**What this lab adds:**
- `ElementNode` and `TextNode` dataclasses — the element tree node types
- A prop parser that turns `class="app" id="main"` into `{"class": "app", "id": "main"}`
- A recursive descent parser that turns a token list into a tree of element nodes
- Tests that verify tree structure against known inputs

**Time:** 75–105 minutes.

---

## What You Will Build

A function `parse(tokens: list[Token]) -> list[Node]` that takes the flat token list from the lexer and assembles it into a tree. The "root" list contains `PYTHON_CODE` tokens (unchanged) and root-level element trees. Each element tree has the element node at the root and its children below.

```
Token list in:
  Token(PYTHON_CODE, 'return ')
  Token(ELEMENT_OPEN, '<div class="app">')
  Token(ELEMENT_OPEN, '<p>')
  Token(TEXT, 'Hello')
  Token(ELEMENT_CLOSE, '</p>')
  Token(ELEMENT_CLOSE, '</div>')

Tree out:
  PythonNode('return ')
  ElementNode(
    tag='div',
    props={'class': 'app'},
    children=[
      ElementNode(
        tag='p',
        props={},
        children=[TextNode('Hello')]
      )
    ]
  )
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. The lexer produces a *flat* list of tokens. The parser produces a *tree*. What information does the tree capture that the flat list does not?
> 2. When the parser sees `ELEMENT_OPEN` for `<div>`, how does it know where the `</div>` closing tag is? It cannot jump ahead to look — it processes tokens in order.
> 3. Why is the call stack called a "parse stack"? What does the call stack have to do with tracking element nesting?
>
> *(Answers at the end of this lab)*

---

## Concept: Recursive Descent Parsing

**What it is:** **Recursive descent parsing** is a technique where each grammar rule is implemented as a function, and functions call each other — including calling themselves — to handle nested structure.

**The grammar of PyX element trees:**

```
document   ::= (python_chunk | element)*
element    ::= ELEMENT_OPEN child* ELEMENT_CLOSE
             | ELEMENT_OPEN  (self-closing, no children)
child      ::= element | TEXT | EXPRESSION
python_chunk ::= PYTHON_CODE
```

Read this as: "A document is zero or more items, each of which is either a python chunk or an element. An element is an open tag, zero or more children, and a close tag. A child is either a nested element, text, or an expression."

**Each rule becomes a function:**

```python
def parse_document(tokens):   # handles the top-level list
def parse_element(tokens):    # handles one element and its children
def parse_children(tokens):   # handles the list of children
```

`parse_children` calls `parse_element` for each nested element. `parse_element` calls `parse_children` to get its children. `parse_element` calling `parse_children` calling `parse_element` — this mutual recursion is what handles nesting.

**The call stack IS the parse stack:**

When parsing `<div><p>text</p></div>`:

1. `parse_document` calls `parse_element` to parse `<div>`
2. `parse_element` (div) calls `parse_children`
3. `parse_children` sees `<p>`, calls `parse_element` to parse it
4. `parse_element` (p) calls `parse_children`
5. `parse_children` sees `text`, returns `[TextNode("text")]`
6. `parse_element` (p) returns `ElementNode("p", {}, [TextNode("text")])`
7. `parse_children` (div's) sees `</div>`, returns `[ElementNode(p)]`
8. `parse_element` (div) returns `ElementNode("div", {}, [ElementNode(p)])`

At step 3, both `parse_element` calls are on the call stack simultaneously — one for `div` and one for `p`. The call stack literally holds the nesting state. When `parse_element` returns, it pops off the stack, and the caller (the element one level up) continues. You get nesting tracking for free, by virtue of how function calls work.

This is why recursive descent is the dominant parsing technique: the nesting structure of the grammar maps directly onto the nesting structure of function calls, and the call stack handles all the bookkeeping automatically.

**Watch for:** Recursive descent only works when the grammar is not "left-recursive" — a rule that starts with itself (like `expr ::= expr + term`). PyX elements are not left-recursive, so you are safe.

---

## Concept: Parse Tree vs Abstract Syntax Tree

**What it is:** A **parse tree** (also called a **concrete syntax tree**) contains every token including whitespace, punctuation, and delimiters. An **abstract syntax tree** (AST) strips away everything that does not carry meaning and keeps only the structure.

**Example:** Parsing `<div class="app">text</div>`

**Parse tree** (everything):
```
Element
  OpenTag "<div class="app">"
    TagName "div"
    AttrList
      Attr
        AttrName "class"
        Equals "="
        Quote '"'
        AttrValue "app"
        Quote '"'
    CloseBracket ">"
  Text "text"
  CloseTag "</div>"
    Slash "/"
    TagName "div"
    CloseBracket ">"
```

**AST** (meaning only):
```
ElementNode(tag="div", props={"class": "app"}, children=[TextNode("text")])
```

The AST discards the quotes, the `=`, the `<`, the `>`, and the closing tag name (which is always the same as the opening tag name). None of that information is needed to generate `h("div", {"class": "app"}, "text")`.

The parser in this lab produces an AST directly — it does not build a parse tree first. The "abstract" part means: all the concrete syntax details are parsed and then thrown away, keeping only what is semantically meaningful.

**Watch for:** Python's own `ast` module (Lab 06) produces an AST in this same sense — `ast.parse("x = 1")` does not give you the `=` sign as a separate node; it gives you an `Assign` node with a `targets` list and a `value`. The equals sign is implied by the node type.

---

## Step 1 — Define the Node Types

Create `compiler/nodes.py`:

```python
from __future__ import annotations
from dataclasses import dataclass, field


class Node:
    """Base class for all parse tree nodes."""
    pass


@dataclass
class PythonNode(Node):
    """A chunk of Python source code between or after elements."""
    code: str

    def __repr__(self) -> str:
        preview = self.code[:40].replace("\n", "\\n")
        return f"PythonNode({preview!r})"


@dataclass
class TextNode(Node):
    """Plain text content inside an element."""
    text: str

    def __repr__(self) -> str:
        return f"TextNode({self.text!r})"


@dataclass
class ExpressionNode(Node):
    """A {expr} expression inside an element, e.g. {count} or {name.upper()}."""
    expression: str

    def __repr__(self) -> str:
        return f"ExpressionNode({self.expression!r})"


@dataclass
class ElementNode(Node):
    """An element with a tag name, props dict, and list of children."""
    tag: str
    props: dict[str, str | ExpressionNode]
    children: list[Node] = field(default_factory=list)

    def __repr__(self) -> str:
        props_str = ", ".join(f"{k}={v!r}" for k, v in self.props.items())
        return f"ElementNode({self.tag!r}, {{{props_str}}}, children={self.children!r})"
```

The `from __future__ import annotations` at the top enables "forward references" — it allows `list[Node]` in the type annotation of `ElementNode.children` even though `Node` is defined earlier in the same file. Without it, Python evaluates annotations at definition time, which would fail for circular references. With it, annotations are treated as strings and evaluated lazily. You will see this at the top of many Python files that use self-referential type hints.

---

### SAVE AND TRY

```
> python -c "from compiler.nodes import ElementNode, TextNode; e = ElementNode('div', {}, [TextNode('hi')]); print(e)"
```

**Expected output:**
```
ElementNode('div', {}, children=[TextNode('hi')])
```

---

## Concept: Parsing Props

**What it is:** The props string inside an opening tag — `class="app" id="main" onClick={handler}` — needs to be turned into a Python dictionary: `{"class": "app", "id": "main", "onClick": ExpressionNode("handler")}`.

**The three forms of prop values:**

| Source | Meaning | Output |
|---|---|---|
| `class="app"` | String value in double quotes | `"app"` (a str) |
| `class='app'` | String value in single quotes | `"app"` (a str) |
| `onClick={handler}` | Python expression | `ExpressionNode("handler")` |

**The parsing strategy:**

Strip the tag delimiters first: `<div class="app">` → `div class="app"`. Split on the first space to get the tag name `"div"` and the props string `class="app"`. Then scan the props string character by character:

1. Read an attribute name (letters, digits, `-`, `_`) until `=`
2. If the next character is `"` or `'`, read until the matching close quote — string value
3. If the next character is `{`, read until the matching `}` — expression value
4. Skip whitespace between attributes

This is another state machine — a small one embedded inside the parser.

**Watch for:** Props in HTML/JSX use `=` for assignment, but Python uses `=` for keyword arguments. They look the same but the parser handles them differently. The prop parser only needs to understand `name=value` pairs; it does not need to understand Python expressions (those are parsed later by `ast.parse`).

---

## Step 2 — Write the Prop Parser

Create `compiler/parser.py` with the prop parser first:

```python
from __future__ import annotations
from compiler.nodes import (
    ElementNode, ExpressionNode, Node, PythonNode, TextNode
)
from compiler.tokens import Token, TokenType


def _parse_props(tag_text: str) -> tuple[str, dict[str, str | ExpressionNode]]:
    """
    Given the full text of an opening tag (e.g. '<div class="app" id="main">'),
    return (tag_name, props_dict).

    tag_text examples:
      '<div>'                    → ('div', {})
      '<div class="app">'        → ('div', {'class': 'app'})
      '<input type="text" />'    → ('input', {'type': 'text'})
      '<Counter title={name} />' → ('Counter', {'title': ExpressionNode('name')})
    """
    # Strip the surrounding < and > (and optional /)
    inner = tag_text.strip('<').rstrip('>')
    if inner.endswith('/'):
        inner = inner[:-1]
    inner = inner.strip()

    # The tag name is everything up to the first space (or the whole thing)
    if ' ' not in inner:
        return inner, {}

    space_pos = inner.index(' ')
    tag_name = inner[:space_pos]
    props_str = inner[space_pos:].strip()

    props: dict[str, str | ExpressionNode] = {}

    pos = 0
    length = len(props_str)

    while pos < length:
        # Skip whitespace
        while pos < length and props_str[pos].isspace():
            pos += 1
        if pos >= length:
            break

        # Read attribute name
        name_start = pos
        while pos < length and props_str[pos] not in ('=', ' ', '\t', '\n'):
            pos += 1
        attr_name = props_str[name_start:pos]

        if not attr_name:
            pos += 1
            continue

        # Expect '='
        if pos >= length or props_str[pos] != '=':
            # Boolean prop with no value (e.g. <input disabled>)
            props[attr_name] = "true"
            continue
        pos += 1  # consume '='

        # Read value
        if pos >= length:
            break

        if props_str[pos] in ('"', "'"):
            quote_char = props_str[pos]
            pos += 1
            value_start = pos
            while pos < length and props_str[pos] != quote_char:
                pos += 1
            value = props_str[value_start:pos]
            pos += 1  # consume closing quote
            props[attr_name] = value

        elif props_str[pos] == '{':
            pos += 1  # consume '{'
            depth = 1
            value_chars: list[str] = []
            while pos < length and depth > 0:
                if props_str[pos] == '{':
                    depth += 1
                elif props_str[pos] == '}':
                    depth -= 1
                if depth > 0:
                    value_chars.append(props_str[pos])
                pos += 1
            props[attr_name] = ExpressionNode("".join(value_chars))

        else:
            # Unquoted value — read until space
            value_start = pos
            while pos < length and not props_str[pos].isspace():
                pos += 1
            props[attr_name] = props_str[value_start:pos]

    return tag_name, props
```

---

### SAVE AND TRY

```
> python -c "
from compiler.parser import _parse_props
from compiler.nodes import ExpressionNode

print(_parse_props('<div>'))
print(_parse_props('<div class=\"app\">'))
print(_parse_props('<input type=\"text\" />'))
print(_parse_props('<Counter title={name} />'))
"
```

**Expected output:**
```
('div', {})
('div', {'class': 'app'})
('input', {'type': 'text'})
('Counter', {'title': ExpressionNode('name')})
```

---

## Step 3 — Write the Recursive Descent Parser

Add the parser functions to `compiler/parser.py` below the prop parser:

```python
def parse(tokens: list[Token]) -> list[Node]:
    """
    Parse a flat token list into a document-level list of nodes.
    Returns a mix of PythonNode, ElementNode, TextNode, and ExpressionNode
    at the top level.
    """
    pos = 0
    result: list[Node] = []

    while pos < len(tokens):
        token = tokens[pos]

        if token.type == TokenType.PYTHON_CODE:
            result.append(PythonNode(token.text))
            pos += 1

        elif token.type == TokenType.ELEMENT_OPEN:
            element, pos = _parse_element(tokens, pos)
            result.append(element)

        elif token.type == TokenType.TEXT:
            result.append(TextNode(token.text))
            pos += 1

        elif token.type == TokenType.EXPRESSION:
            result.append(ExpressionNode(token.text))
            pos += 1

        elif token.type == TokenType.ELEMENT_CLOSE:
            raise SyntaxError(
                f"Unexpected closing tag {token.text!r} with no matching opening tag"
            )

        else:
            pos += 1

    return result


def _parse_element(tokens: list[Token], pos: int) -> tuple[ElementNode, int]:
    """
    Parse one element starting at pos (which must be an ELEMENT_OPEN token).
    Returns (ElementNode, new_pos) where new_pos is past the ELEMENT_CLOSE.

    For self-closing tags, there is no ELEMENT_CLOSE — returns immediately.
    """
    open_token = tokens[pos]
    assert open_token.type == TokenType.ELEMENT_OPEN

    tag_name, props = _parse_props(open_token.text)
    pos += 1

    # Self-closing: <input /> or <Counter />
    if open_token.text.rstrip('>').endswith('/') or open_token.text.endswith('/>'):
        return ElementNode(tag_name, props, children=[]), pos

    # Parse children until we hit the matching close tag
    children: list[Node] = []

    while pos < len(tokens):
        token = tokens[pos]

        if token.type == TokenType.ELEMENT_CLOSE:
            close_tag_name = token.text.strip('</').rstrip('>')
            if close_tag_name != tag_name:
                raise SyntaxError(
                    f"Mismatched tags: opened <{tag_name}> but found </{close_tag_name}>"
                )
            pos += 1  # consume the close tag
            return ElementNode(tag_name, props, children), pos

        elif token.type == TokenType.ELEMENT_OPEN:
            child, pos = _parse_element(tokens, pos)
            children.append(child)

        elif token.type == TokenType.TEXT:
            children.append(TextNode(token.text))
            pos += 1

        elif token.type == TokenType.EXPRESSION:
            children.append(ExpressionNode(token.text))
            pos += 1

        else:
            pos += 1

    raise SyntaxError(f"Unclosed element <{tag_name}>: no matching </{tag_name}> found")
```

---

### SAVE AND TRY

```
> python -c "
from compiler.lexer import lex
from compiler.parser import parse

source = 'return <div class=\"app\"><p>Hello</p></div>'
tokens = lex(source)
nodes = parse(tokens)
for node in nodes:
    print(node)
"
```

**Expected output:**
```
PythonNode('return ')
ElementNode('div', {'class': 'app'}, children=[ElementNode('p', {}, children=[TextNode('Hello')])])
```

---

## Step 4 — Write the Tests

Create `compiler/tests/test_parser.py`:

```python
from compiler.lexer import lex
from compiler.nodes import ElementNode, ExpressionNode, PythonNode, TextNode
from compiler.parser import parse


def _parse(source: str):
    return parse(lex(source))


def test_python_only():
    result = _parse("x = 1\n")
    assert result == [PythonNode("x = 1\n")]


def test_simple_element():
    result = _parse("<div>hello</div>")
    assert result == [
        ElementNode("div", {}, [TextNode("hello")])
    ]


def test_element_with_props():
    result = _parse('<div class="app">text</div>')
    assert result == [
        ElementNode("div", {"class": "app"}, [TextNode("text")])
    ]


def test_nested_elements():
    result = _parse("<div><p>inner</p></div>")
    assert result == [
        ElementNode("div", {}, [
            ElementNode("p", {}, [TextNode("inner")])
        ])
    ]


def test_self_closing():
    result = _parse('<input type="text" />')
    assert result == [
        ElementNode("input", {"type": "text"}, [])
    ]


def test_expression_child():
    result = _parse("<p>{count}</p>")
    assert result == [
        ElementNode("p", {}, [ExpressionNode("count")])
    ]


def test_expression_prop():
    result = _parse("<Counter value={state} />")
    assert result == [
        ElementNode("Counter", {"value": ExpressionNode("state")}, [])
    ]


def test_mixed_children():
    result = _parse("<p>Hello {name}!</p>")
    assert result == [
        ElementNode("p", {}, [
            TextNode("Hello "),
            ExpressionNode("name"),
            TextNode("!"),
        ])
    ]


def test_python_around_element():
    result = _parse("return <div>hi</div>\n")
    assert result == [
        PythonNode("return "),
        ElementNode("div", {}, [TextNode("hi")]),
        PythonNode("\n"),
    ]


def test_multiple_props():
    result = _parse('<a href="/" class="link">text</a>')
    assert result == [
        ElementNode("a", {"href": "/", "class": "link"}, [TextNode("text")])
    ]


def test_deeply_nested():
    result = _parse("<div><section><p>deep</p></section></div>")
    assert result == [
        ElementNode("div", {}, [
            ElementNode("section", {}, [
                ElementNode("p", {}, [TextNode("deep")])
            ])
        ])
    ]


def test_mismatched_tags_raises():
    try:
        _parse("<div></span>")
        assert False, "Expected SyntaxError"
    except SyntaxError:
        pass


def test_unclosed_tag_raises():
    try:
        _parse("<div>text")
        assert False, "Expected SyntaxError"
    except SyntaxError:
        pass


if __name__ == "__main__":
    tests = [
        test_python_only,
        test_simple_element,
        test_element_with_props,
        test_nested_elements,
        test_self_closing,
        test_expression_child,
        test_expression_prop,
        test_mixed_children,
        test_python_around_element,
        test_multiple_props,
        test_deeply_nested,
        test_mismatched_tags_raises,
        test_unclosed_tag_raises,
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
> python compiler/tests/test_parser.py
```

**Expected output:**
```
  PASS  test_python_only
  PASS  test_simple_element
  PASS  test_element_with_props
  PASS  test_nested_elements
  PASS  test_self_closing
  PASS  test_expression_child
  PASS  test_expression_prop
  PASS  test_mixed_children
  PASS  test_python_around_element
  PASS  test_multiple_props
  PASS  test_deeply_nested
  PASS  test_mismatched_tags_raises
  PASS  test_unclosed_tag_raises

13 passed, 0 failed
```

---

## Step 5 — Add `--tree` Debug Flag to the CLI

Update `compiler/cli.py` to support `--tree`, which prints the parsed tree:

```python
build_parser.add_argument(
    "--tree",
    action="store_true",
    help="Print the parsed element tree and exit (debugging)",
)
```

Update `_run_build`:

```python
def _run_build(
    input_path: str,
    output_path: str | None,
    show_tokens: bool = False,
    show_tree: bool = False,
) -> None:
    if output_path is None:
        if input_path.endswith(".pyx"):
            output_path = input_path[:-4] + ".jsx"
        else:
            output_path = input_path + ".jsx"

    with open(input_path, "r", encoding="utf-8") as f:
        source = f.read()

    if show_tokens:
        from compiler.lexer import lex
        tokens = lex(source)
        for token in tokens:
            print(token)
        return

    if show_tree:
        from compiler.lexer import lex
        from compiler.parser import parse
        tokens = lex(source)
        nodes = parse(tokens)
        for node in nodes:
            print(node)
        return

    result = source

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)

    print(f"Compiled {input_path} → {output_path}")
```

Update the call in `main()`:

```python
if args.command == "build":
    _run_build(args.input, args.output, show_tokens=args.tokens, show_tree=args.tree)
```

---

### SAVE AND TRY

```
> pyxc build examples/hello.pyx --tree
```

**Expected output:**
```
PythonNode('def Hello():\n    return ')
ElementNode('div', {}, children=[TextNode('Hello from PyX')])
PythonNode('\n')
```

---

## Challenge: Pretty-Print the Tree

**You know:** The `__repr__` of `ElementNode` puts everything on one line. For deeply nested trees this becomes unreadable. Recursive descent is the right approach for printing too — print the node, then indent and print each child.

**Task:** Write a function `print_tree(nodes: list[Node], indent: int = 0) -> None` that prints each node at the correct indentation level, with children indented two more spaces than their parent.

**Expected output for `<div><p>Hello {name}</p></div>`:**

```
ElementNode div props={}
  ElementNode p props={}
    TextNode 'Hello '
    ExpressionNode 'name'
```

Try for 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
from compiler.nodes import ElementNode, ExpressionNode, Node, PythonNode, TextNode

def print_tree(nodes: list[Node], indent: int = 0) -> None:
    prefix = "  " * indent
    for node in nodes:
        if isinstance(node, PythonNode):
            preview = node.code[:30].replace("\n", "\\n")
            print(f"{prefix}PythonNode {preview!r}")
        elif isinstance(node, TextNode):
            print(f"{prefix}TextNode {node.text!r}")
        elif isinstance(node, ExpressionNode):
            print(f"{prefix}ExpressionNode {node.expression!r}")
        elif isinstance(node, ElementNode):
            props_str = ", ".join(f"{k}={v!r}" for k, v in node.props.items())
            print(f"{prefix}ElementNode {node.tag} props={{{props_str}}}")
            print_tree(node.children, indent + 1)
```

**Key insight:** `isinstance(node, ElementNode)` dispatches to the right code path based on the runtime type of `node`. This is the **visitor pattern** in its simplest form — dispatching on type to call different logic. In Lab 04 you will formalise this into a `visit(node)` function, but the core idea is exactly this. The recursive call `print_tree(node.children, indent + 1)` handles nesting — each level of nesting increases the indent by 1, and the function calls itself to handle children, which call themselves to handle grandchildren.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `ElementNode` creates correctly | `ElementNode("div", {}, [TextNode("hi")])` prints without error |
| Prop parser handles string values | `_parse_props('<div class="app">')` returns `('div', {'class': 'app'})` |
| Prop parser handles expression values | `_parse_props('<C value={x} />')` returns `('C', {'value': ExpressionNode('x')})` |
| Parser builds correct tree | `parse(lex("<div><p>hi</p></div>"))` has nested structure |
| Mismatched tags raise error | `parse(lex("<div></span>"))` raises `SyntaxError` |
| All 13 parser tests pass | `python compiler/tests/test_parser.py` shows "13 passed, 0 failed" |
| `--tree` flag works | `pyxc build examples/hello.pyx --tree` prints the node tree |

---

## Your Complete Files

### `compiler/nodes.py`
*(full file as written in Step 1)*

### `compiler/parser.py`
*(full file combining Steps 2 and 3)*

### `compiler/tests/test_parser.py`
*(full file as written in Step 4)*

### `compiler/cli.py`
Updated version with `--tokens` and `--tree` flags and `show_tree` parameter.

### Project structure at end of Lab 03
```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py
│   ├── lexer.py
│   ├── nodes.py       ← new
│   ├── parser.py      ← new
│   ├── tokens.py
│   └── tests/
│       ├── __init__.py
│       ├── test_lexer.py
│       └── test_parser.py  ← new
├── examples/
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. What information does the tree capture that the flat token list does not?**

Nesting. The flat token list `[OPEN_div, OPEN_p, TEXT, CLOSE_p, CLOSE_div]` tells you the order tokens appear, but not that `p` is a child of `div`. The tree makes the relationship explicit: `ElementNode(div, children=[ElementNode(p, children=[TextNode])])`. This matters for code generation — `h("div", {}, h("p", {}, "text"))` has the `h("p")` nested inside the `h("div")` call, which is only possible if you know the nesting structure.

**2. When the parser sees `<div>`, how does it know where `</div>` is?**

It does not look ahead. It calls `_parse_element`, which calls `_parse_children`, which processes tokens one at a time. When `_parse_children` encounters an `ELEMENT_CLOSE` token, it checks whether the closing tag name matches the current element name. If it matches, it returns the children list and the position past the closing tag. If it does not match, it raises a `SyntaxError`. The parser never needs to see the closing tag in advance — it discovers it by processing the token stream in order.

**3. Why is the call stack called a "parse stack"? What does the call stack have to do with nesting?**

The call stack holds all currently-active function calls. When `_parse_element(div)` calls `_parse_element(p)`, both are on the stack simultaneously — `div`'s frame below, `p`'s frame above. When `_parse_element(p)` returns (having found `</p>`), it pops off the stack. Control returns to `_parse_element(div)`, which now receives `p`'s result as a child. The stack depth tracks nesting depth. For `<div><section><p>`, all three `_parse_element` frames are on the stack at once, representing the three levels of nesting. When each closing tag is found, one frame pops. The call stack IS the parse stack — you get nesting tracking for free because function call mechanics already work this way.

---

*End of LAB 03.*

*Lab 04 builds the code generator for the pre-processor — it walks the element tree and emits Python `h()` function calls. `ElementNode("div", {"class": "app"}, [TextNode("hi")])` becomes the string `h("div", {"class": "app"}, "hi")`. This is your first code generation: turning a tree back into text.*
