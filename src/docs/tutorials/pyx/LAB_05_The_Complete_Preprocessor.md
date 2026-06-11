# PyX — LAB 05 — The Complete Pre-Processor

**Prerequisites:** Lab 04 complete. All three test suites pass (lexer, parser, codegen).

**What this lab adds:**
- A `preprocess(source: str) -> str` function that combines lexer + parser + code generator
- The `preprocessor.py` module — the public interface for Phase 1
- Error messages with line numbers when element syntax is malformed
- `pyxc build` now outputs a real pre-processed `.jsx` file instead of a copy

**Time:** 45–60 minutes.

---

## What You Will Build

The pre-processor is the composition of the three modules you wrote in Labs 02, 03, and 04:

```
source string (.pyx)
    ↓  lexer.lex()
token list
    ↓  parser.parse()
node tree
    ↓  codegen_preprocessor.generate()
output string (valid Python with h() calls instead of elements)
```

This function is one of the cleanest in the entire compiler:

```python
def preprocess(source: str) -> str:
    tokens = lex(source)
    nodes = parse(tokens)
    return generate(nodes)
```

That is the whole function — three lines. Each stage has a clear interface and does exactly one job. This is what the pipeline pattern looks like when it works correctly.

After this lab, running `pyxc build counter.pyx` produces a `.jsx` file containing valid Python with `h()` calls. Not `.jsx` syntax yet — that comes in Phase 3. For now the output is Python, because the next step (Phase 2, Labs 06-11) is feeding this output to Python's own `ast.parse`.

---

> **Quick Check — try to answer before reading further:**
>
> 1. The pre-processor calls `lex()`, then `parse()`, then `generate()` in sequence. What would happen if you called them in the wrong order, like `generate(lex(source))`?
> 2. When a user runs `pyxc build broken.pyx` and the element syntax has an error, what information should the error message contain to be useful?
> 3. Phase 1 (the pre-processor) is complete after this lab. Phase 2 introduces Python's `ast.parse`. What would happen if you ran `ast.parse` directly on a `.pyx` file — would it work? Why or why not?
>
> *(Answers at the end of this lab)*

---

## Concept: The Substitution Model

**What it is:** The **substitution model** describes code transformation as replacing one sub-expression with an equivalent one. The rest of the program is unchanged — only the specific sub-expression is swapped out.

The pre-processor transforms `.pyx` source using substitution:

```
# Before pre-processing:
def Counter():
    return <div class="counter"><p>Count: {count}</p></div>

# After pre-processing — the element expression is substituted:
def Counter():
    return h("div", {"class": "counter"}, h("p", {}, "Count: ", count))
```

The `def Counter():` and `return` are preserved exactly. Only the element syntax is replaced with its `h()` call equivalent.

**Why substitution is the right model:**

Any other approach — rewriting the entire function, re-parsing all Python — would be unnecessarily complex and error-prone. The pre-processor only needs to touch the element syntax. Everything else is preserved byte-for-byte.

This is exactly what Babel does with JSX: the file passes through unchanged except that each JSX expression is replaced with its `React.createElement` equivalent. The Python parser never sees `<div>` — it sees `h("div", ...)` instead.

**Watch for:** "Substitution" also describes how you reason about function calls in general. When you call `f(x)`, you can mentally substitute the function body with `x` in place of the parameter. This model is foundational in functional programming and will come up again in the reconciler (Lab 20) when you think about component calls.

---

## Concept: Error Messages With Line Numbers

**What it is:** When the pre-processor encounters malformed element syntax, it should print an error that tells the user exactly where the problem is — which file, which line, what went wrong.

**A bad error message:**

```
SyntaxError: Unexpected end of file: unclosed element or expression
```

This tells you something broke. It does not tell you where.

**A good error message:**

```
pyxc: error in counter.pyx line 7:
    return <div class="counter">
                                ^
    Unclosed element: <div> has no matching </div>
```

This tells you the file, the line, the problematic code, and what to fix.

**How to track line numbers:**

The lexer processes the source character by character. Every time it sees a `\n`, the line number increments. If you track the current line number as you lex, you can attach it to each token.

This lab adds `line` to the `Token` dataclass and updates the lexer to track it. The parser and code generator propagate line numbers through the node types so that by the time an error occurs anywhere in the pipeline, the original `.pyx` line number is available.

**Watch for:** Source location tracking runs through the entire compiler — lexer, parser, transformer, code generator. It is tedious but non-negotiable. A compiler that produces error messages without line numbers is unusable. You will add source locations at the lexer level now so every subsequent stage inherits them.

---

## Step 1 — Add Line Numbers to Tokens

Update `compiler/tokens.py` to add a `line` field:

```python
from dataclasses import dataclass, field
from enum import Enum, auto


class TokenType(Enum):
    PYTHON_CODE = auto()
    ELEMENT_OPEN = auto()
    ELEMENT_CLOSE = auto()
    TEXT = auto()
    EXPRESSION = auto()


@dataclass
class Token:
    type: TokenType
    text: str
    line: int = field(default=1)

    def __repr__(self) -> str:
        preview = self.text[:40].replace("\n", "\\n")
        if len(self.text) > 40:
            preview += "..."
        return f"Token({self.type.name}, {preview!r}, line={self.line})"
```

The `field(default=1)` gives `line` a default value of 1, so existing test code that creates `Token(TokenType.X, "text")` without a line number still works. Only the lexer needs to fill in actual line numbers.

---

## Step 2 — Update the Lexer to Track Line Numbers

Update `compiler/lexer.py`. Add a `line` counter and update each flush call to pass the current line:

The key changes:
1. Add `line = 1` at the start of `lex`
2. Increment `line` whenever you encounter `\n`
3. Pass `line` to each `Token` constructor

Here is the updated section of the lexer — the `flush_python` and `flush_text` closures and the main loop with line tracking:

```python
def lex(source: str) -> list[Token]:
    tokens: list[Token] = []
    pos = 0
    length = len(source)
    current_text: list[str] = []
    line = 1          # ← track current line number
    token_start_line = 1  # ← line where the current token started

    in_element_tag = False
    in_element_body = False
    in_expression = False
    in_attr_string = False
    attr_string_char = '"'
    expression_depth = 0

    def flush_python() -> None:
        if current_text:
            tokens.append(Token(TokenType.PYTHON_CODE, "".join(current_text), token_start_line))
            current_text.clear()

    def flush_text() -> None:
        if current_text:
            tokens.append(Token(TokenType.TEXT, "".join(current_text), token_start_line))
            current_text.clear()

    while pos < length:
        ch = source[pos]

        # Track line numbers
        if ch == '\n':
            line += 1

        # ... rest of the state machine unchanged, but update token creation:
        # When emitting a token, use `line` not hardcoded 1
```

The full updated `lex` function (complete replacement — update the entire file with line tracking throughout). The key additions are:
- `line = 1` initialisation
- `if ch == '\n': line += 1` before each state check
- `token_start_line = line` when starting a new token
- Passing `line` (or `token_start_line`) to each `Token(...)` constructor

Update your `compiler/lexer.py` with these changes. After updating, run the lexer tests to make sure they still pass — the test assertions compare `Token` objects, and since `line` has a default of 1, the tests do not need to change.

```
> python compiler/tests/test_lexer.py
```

**Expected:** Still "10 passed, 0 failed."

---

## Step 3 — Write the Pre-Processor Module

Create `compiler/preprocessor.py`:

```python
from compiler.lexer import lex
from compiler.parser import parse
from compiler.codegen_preprocessor import generate


class PreprocessorError(Exception):
    """Raised when the pre-processor encounters invalid element syntax."""

    def __init__(self, message: str, line: int, filename: str = "<unknown>") -> None:
        self.line = line
        self.filename = filename
        super().__init__(message)

    def format(self) -> str:
        return f"pyxc: error in {self.filename} line {self.line}:\n  {self}"


def preprocess(source: str, filename: str = "<unknown>") -> str:
    """
    Transform a .pyx source string into valid Python by replacing
    all element syntax with h() calls.

    Raises PreprocessorError if the element syntax is malformed.
    """
    try:
        tokens = lex(source)
        nodes = parse(tokens)
        return generate(nodes)
    except SyntaxError as e:
        # The lexer and parser raise SyntaxError with a message.
        # Wrap it in a PreprocessorError with location info.
        # If the exception has a lineno attribute (from the lexer's token),
        # use it; otherwise default to line 1.
        line = getattr(e, 'lineno', 1) or 1
        raise PreprocessorError(str(e), line=line, filename=filename) from e
```

---

## Step 4 — Wire the Pre-Processor Into the CLI

Update `compiler/cli.py`. Replace the `result = source` identity transform with a real pre-processing step:

```python
def _run_build(
    input_path: str,
    output_path: str | None,
    show_tokens: bool = False,
    show_tree: bool = False,
    show_codegen: bool = False,
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

    if show_codegen:
        from compiler.preprocessor import preprocess
        print(preprocess(source, filename=input_path))
        return

    # ── Real build: pre-process and write output ──────────────────────────
    from compiler.preprocessor import preprocess, PreprocessorError
    try:
        result = preprocess(source, filename=input_path)
    except PreprocessorError as e:
        print(e.format())
        import sys
        sys.exit(1)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)

    print(f"Compiled {input_path} → {output_path}")
```

---

### SAVE AND TRY

```
> pyxc build examples/counter.pyx
```

**Expected output:**
```
Compiled examples/counter.pyx → examples/counter.jsx
```

Open `examples/counter.jsx`. You should see:

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

This is valid Python. If you ran it with `h` and `useState` defined, it would execute correctly. Phase 1 is complete.

---

## Step 5 — Write Pre-Processor Integration Tests

Create `compiler/tests/test_preprocessor.py`:

```python
from compiler.preprocessor import preprocess, PreprocessorError


def test_python_only():
    result = preprocess("x = 1\ny = 2\n")
    assert result == "x = 1\ny = 2\n"


def test_simple_element():
    result = preprocess("<div>hello</div>")
    assert result == 'h("div", {}, "hello")'


def test_full_component():
    source = (
        "def Hello():\n"
        "    return <div>Hello</div>\n"
    )
    result = preprocess(source)
    assert "def Hello():" in result
    assert 'h("div"' in result
    assert '"Hello"' in result
    assert "<div>" not in result


def test_element_with_expression():
    source = "<p>Count: {count}</p>"
    result = preprocess(source)
    assert 'h("p"' in result
    assert '"Count: "' in result
    assert 'count' in result
    assert "{count}" not in result


def test_nested_elements():
    source = "<div><p>inner</p></div>"
    result = preprocess(source)
    assert 'h("div"' in result
    assert 'h("p"' in result
    assert '"inner"' in result


def test_output_is_valid_python():
    import ast
    source = (
        "from pyx import useState\n"
        "def Counter():\n"
        "    count, set_count = useState(0)\n"
        "    return <div class=\"counter\"><p>{count}</p></div>\n"
    )
    result = preprocess(source)
    ast.parse(result)  # must not raise


def test_error_on_unclosed_tag():
    try:
        preprocess("<div>unclosed", filename="test.pyx")
        assert False, "Expected PreprocessorError"
    except PreprocessorError as e:
        assert "test.pyx" in e.format()


def test_error_on_mismatched_tags():
    try:
        preprocess("<div></span>", filename="test.pyx")
        assert False, "Expected PreprocessorError"
    except PreprocessorError as e:
        assert "test.pyx" in e.format()


if __name__ == "__main__":
    tests = [
        test_python_only,
        test_simple_element,
        test_full_component,
        test_element_with_expression,
        test_nested_elements,
        test_output_is_valid_python,
        test_error_on_unclosed_tag,
        test_error_on_mismatched_tags,
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
> python compiler/tests/test_preprocessor.py
```

**Expected output:**
```
  PASS  test_python_only
  PASS  test_simple_element
  PASS  test_full_component
  PASS  test_element_with_expression
  PASS  test_nested_elements
  PASS  test_output_is_valid_python
  PASS  test_error_on_unclosed_tag
  PASS  test_error_on_mismatched_tags

8 passed, 0 failed
```

---

## Phase 1 Complete — What You Have Built

You now have a working pre-processor. Let's be concrete about what that means.

**What the pre-processor does:**

It takes a `.pyx` source string — Python mixed with element syntax — and returns a valid Python string with all elements replaced by `h()` calls. The output can be parsed by `ast.parse` and run by Python.

**What it cannot do yet:**

- The `h` function does not exist. If you tried to run the output, Python would raise `NameError: name 'h' is not defined`.
- Python imports (`from pyx import useState`) are not transformed into JavaScript imports yet.
- The output is Python, not JSX. Phase 3 (Lab 12) converts it to JSX.

**The three modules you wrote:**

| Module | Input | Output | Job |
|---|---|---|---|
| `lexer.py` | `str` | `list[Token]` | Identify element boundaries |
| `parser.py` | `list[Token]` | `list[Node]` | Assemble element trees |
| `codegen_preprocessor.py` | `list[Node]` | `str` | Emit `h()` calls |

Each module is independently testable. The pre-processor is their composition.

---

## Challenge: Add a `--check` Subcommand

**You know:** `argparse` supports multiple subcommands. The `build` subcommand reads and writes files. A `check` subcommand would read a file, run the pre-processor, and report whether it succeeded — without writing the output.

**Task:** Add a `pyxc check <file>` subcommand that:
- Reads the `.pyx` file
- Runs the pre-processor
- If it succeeds, prints `OK: <filename>`
- If it fails, prints the formatted error and exits with code 1
- Does NOT write any output file

**Expected behavior:**
```
> pyxc check examples/counter.pyx
OK: examples/counter.pyx

> pyxc check examples/broken.pyx
pyxc: error in examples/broken.pyx line 3:
  Unclosed element <div>
```

Try for 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

In `main()`, add to the subparsers:

```python
check_parser = subparsers.add_parser("check", help="Check a .pyx file for errors without compiling")
check_parser.add_argument("input", help="Path to the .pyx file to check")
```

Add a handler:

```python
elif args.command == "check":
    _run_check(args.input)
```

```python
def _run_check(input_path: str) -> None:
    from compiler.preprocessor import preprocess, PreprocessorError
    with open(input_path, "r", encoding="utf-8") as f:
        source = f.read()
    try:
        preprocess(source, filename=input_path)
        print(f"OK: {input_path}")
    except PreprocessorError as e:
        print(e.format())
        import sys
        sys.exit(1)
```

**Key insight:** Separating "check" from "build" is a real feature that compilers offer (TypeScript has `tsc --noEmit` for this purpose). It lets CI pipelines verify that code compiles without generating output files. It also runs faster because it skips the file write step — useful in a large codebase where you want to check 100 files quickly.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Pre-processor integrates all three stages | `preprocess("<div>hi</div>")` returns `'h("div", {}, "hi")'` |
| CLI actually pre-processes now | `pyxc build examples/counter.pyx` produces a `.jsx` with `h()` calls |
| Error messages include filename | `preprocess("<div>", filename="a.pyx")` raises error mentioning `a.pyx` |
| `test_output_is_valid_python` passes | Generated Python passes `ast.parse` |
| All 8 integration tests pass | `python compiler/tests/test_preprocessor.py` shows "8 passed, 0 failed" |
| All previous tests still pass | Lexer (10), parser (13), codegen (13) still all pass |

---

## Your Complete Files

### `compiler/preprocessor.py`
*(full file as written in Step 3)*

### Updated `compiler/tokens.py`
*(with `line: int = field(default=1)` added)*

### Updated `compiler/lexer.py`
*(with line tracking throughout)*

### Updated `compiler/cli.py`
*(with real pre-processing in `_run_build`)*

### `compiler/tests/test_preprocessor.py`
*(full file as written in Step 5)*

### Project structure at end of Lab 05
```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py
│   ├── codegen_preprocessor.py
│   ├── lexer.py           ← updated (line tracking)
│   ├── nodes.py
│   ├── parser.py
│   ├── preprocessor.py    ← new
│   ├── tokens.py          ← updated (line field)
│   └── tests/
│       ├── __init__.py
│       ├── test_codegen_preprocessor.py
│       ├── test_lexer.py
│       ├── test_parser.py
│       └── test_preprocessor.py  ← new
├── examples/
│   ├── counter.pyx
│   ├── counter.jsx        ← now contains real h() output
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. What would happen if you called `generate(lex(source))`?**

`lex(source)` returns `list[Token]`. `generate` expects `list[Node]`. The types do not match — `generate` would receive `Token` objects and call `isinstance(node, PythonNode)` on them, which would always be False, falling through to the `raise TypeError` line. You would get `TypeError: Unknown node type: <class 'compiler.tokens.Token'>`. This is exactly why the pipeline pattern has distinct types for each stage's output — mismatched stage calls produce immediate, descriptive errors rather than silent wrong output.

**2. What information should a useful error message contain?**

At minimum: the filename, the line number, the problematic source line, and what went wrong. Ideally: a suggested fix. Compare `SyntaxError: unexpected EOF` (tells you nothing about where or what to do) to `pyxc: error in counter.pyx line 7: Unclosed element <div> — add </div> to close it`. The second message answers three questions immediately: where is it, what happened, and what should I do? The cost of generating useful error messages is low; the cost of debugging without them is high.

**3. Would `ast.parse` work on a `.pyx` file directly?**

No. `ast.parse` is Python's parser — it only understands valid Python syntax. A `.pyx` file contains element syntax like `<div>hello</div>`, which is not valid Python (`<` followed by a letter is parsed as a less-than comparison, but `<div>hello</div>` would then be parsed as `(div > hello) / div` which is also not valid Python syntax). `ast.parse` would raise `SyntaxError` at the first `<` that starts an element. The pre-processor's job is to transform element syntax into valid Python (`h(...)` calls) before `ast.parse` sees the file.

---

*End of LAB 05.*

*Lab 06 introduces Python's `ast` module. You will parse several Python snippets and learn to read the AST that Python's own compiler produces. This is the foundation for Phase 2: the transformer that walks the Python AST and produces the PyX intermediate representation.*
