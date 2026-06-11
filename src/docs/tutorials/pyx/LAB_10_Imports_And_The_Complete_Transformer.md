# PyX — LAB 10 — Imports and the Complete Transformer

**Prerequisites:** Lab 09 complete. All transformer tests pass.

**What this lab adds:**
- Wiring the transformer into the `pyxc` CLI pipeline
- A `--ir` debug flag that prints the IR tree
- Full end-to-end testing of the pre-processor → transformer pipeline
- Verification that the counter component produces a complete, correct IR

**Time:** 45–60 minutes. This is an integration lab — less new code, more wiring and verification.

---

## What You Will Build

The transformer is not yet part of the `pyxc build` pipeline. After this lab, it is:

```
.pyx source
    ↓  preprocessor.preprocess()       (Labs 01-05)
valid Python with h() calls
    ↓  ast.parse()
Python AST
    ↓  Transformer.transform_module()  (Labs 07-09)
PyX IR
    ↓  (Lab 12: code generator)
JSX string
```

The `pyxc build --ir` flag will let you inspect the IR for any `.pyx` file. This is the last debug flag before the full compiler works end-to-end.

---

> **Quick Check — try to answer before reading further:**
>
> 1. The pre-processor outputs valid Python. The transformer takes a Python AST. To go from pre-processor output to transformer input, what step runs in between?
> 2. The pre-processor's `h()` calls use string dict keys (`{"class": "app"}`). The transformer's `_transform_h_call` method renames `"class"` to `"className"`. At what point in the pipeline does this renaming happen?
> 3. After the transformer runs, the `from pyx import useState` statement should become `import { useState } from 'pyx-runtime'` in the output. Which IR node type represents this?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Add a Parser Module

The step between pre-processor output (a Python string) and transformer input (a Python AST) is `ast.parse`. Wrap it in a module to keep `cli.py` clean:

Create `compiler/parser_py.py`:

```python
"""
Python AST parser — wraps ast.parse for use in the PyX pipeline.

Named parser_py.py to avoid shadowing the built-in 'parser' module
and to distinguish it from compiler/parser.py (the element parser).
"""
import ast


class ParseError(Exception):
    """Raised when ast.parse fails on pre-processed source."""

    def __init__(self, message: str, line: int = 0, filename: str = "<unknown>") -> None:
        self.pyx_line = line
        self.filename = filename
        super().__init__(message)

    def format(self) -> str:
        return f"pyxc: parse error in {self.filename} line {self.pyx_line}:\n  {self}"


def parse_python(source: str, filename: str = "<unknown>") -> ast.Module:
    """
    Parse a pre-processed Python source string into a Python AST.
    
    The source has already been through the pre-processor — all element
    syntax is h() calls. If ast.parse fails, the pre-processor produced
    invalid Python, which is a pre-processor bug.
    """
    try:
        return ast.parse(source, filename=filename)
    except SyntaxError as e:
        raise ParseError(
            f"Pre-processed source has a syntax error: {e.msg}",
            line=e.lineno or 0,
            filename=filename,
        ) from e
```

---

## Step 2 — Wire the Transformer Into the CLI

Update `compiler/cli.py` to add:
1. A `--ir` flag that prints the IR tree
2. The transformer stage in the build pipeline

Add to the build subparser:

```python
build_parser.add_argument(
    "--ir",
    action="store_true",
    help="Print the PyX IR tree and exit (debugging)",
)
```

Update `_run_build` to add the `--ir` flag and the transformer stage:

```python
def _run_build(
    input_path: str,
    output_path: str | None,
    show_tokens: bool = False,
    show_tree: bool = False,
    show_codegen: bool = False,
    show_ir: bool = False,
) -> None:
    if output_path is None:
        if input_path.endswith(".pyx"):
            output_path = input_path[:-4] + ".jsx"
        else:
            output_path = input_path + ".jsx"

    with open(input_path, "r", encoding="utf-8") as f:
        source = f.read()

    # ── Debug: tokens ──────────────────────────────────────────────────
    if show_tokens:
        from compiler.lexer import lex
        for token in lex(source):
            print(token)
        return

    # ── Debug: element tree ────────────────────────────────────────────
    if show_tree:
        from compiler.lexer import lex
        from compiler.parser import parse
        for node in parse(lex(source)):
            print(node)
        return

    # ── Debug: pre-processor output ────────────────────────────────────
    if show_codegen:
        from compiler.preprocessor import preprocess
        print(preprocess(source, filename=input_path))
        return

    # ── Debug: IR tree ─────────────────────────────────────────────────
    if show_ir:
        from compiler.preprocessor import preprocess, PreprocessorError
        from compiler.parser_py import parse_python, ParseError
        from compiler.transformer import Transformer

        try:
            preprocessed = preprocess(source, filename=input_path)
        except PreprocessorError as e:
            print(e.format())
            import sys; sys.exit(1)

        try:
            py_ast = parse_python(preprocessed, filename=input_path)
        except ParseError as e:
            print(e.format())
            import sys; sys.exit(1)

        t = Transformer(filename=input_path)
        ir_module = t.transform_module(py_ast)
        _print_ir(ir_module)
        return

    # ── Real build ─────────────────────────────────────────────────────
    from compiler.preprocessor import preprocess, PreprocessorError
    from compiler.parser_py import parse_python, ParseError
    from compiler.transformer import Transformer

    try:
        preprocessed = preprocess(source, filename=input_path)
    except PreprocessorError as e:
        print(e.format())
        import sys; sys.exit(1)

    try:
        py_ast = parse_python(preprocessed, filename=input_path)
    except ParseError as e:
        print(e.format())
        import sys; sys.exit(1)

    t = Transformer(filename=input_path)
    ir_module = t.transform_module(py_ast)

    if t._errors:
        for error in t._errors:
            print(error.format())
        import sys; sys.exit(1)

    # Placeholder — code generator not written yet
    result = f"// Generated by pyxc from {input_path}\n// Code generation (Lab 12) not yet implemented\n"

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)

    print(f"Compiled {input_path} → {output_path} (IR stage complete)")
```

Update `main()`:

```python
if args.command == "build":
    _run_build(
        args.input, args.output,
        show_tokens=args.tokens,
        show_tree=args.tree,
        show_codegen=args.codegen,
        show_ir=args.ir,
    )
```

---

## Step 3 — Add the IR Printer

Add a helper function to `cli.py` that pretty-prints an IR tree:

```python
def _print_ir(node, indent: int = 0) -> None:
    """Recursively print an IR tree with indentation."""
    from compiler.ir import (
        IRModule, IRFunction, IRArrowFunction, IRReturn, IRAssign,
        IRBinOp, IRCall, IRConstant, IRElement, IRExprStatement,
        IRFor, IRIf, IRImport, IRMemberAccess, IRText, IRVariable,
    )

    prefix = "  " * indent

    if isinstance(node, IRModule):
        print(f"{prefix}IRModule (exports: {node.default_export!r})")
        for imp in node.imports:
            _print_ir(imp, indent + 1)
        for func in node.functions:
            _print_ir(func, indent + 1)

    elif isinstance(node, IRImport):
        print(f"{prefix}IRImport from {node.source!r}: {', '.join(node.names)}")

    elif isinstance(node, IRFunction):
        kind = "Component" if node.is_component else "Function"
        print(f"{prefix}IR{kind} {node.name}({', '.join(node.params)})")
        for stmt in node.body:
            _print_ir(stmt, indent + 1)

    elif isinstance(node, IRReturn):
        print(f"{prefix}IRReturn")
        if node.value is not None:
            _print_ir(node.value, indent + 1)

    elif isinstance(node, IRAssign):
        names = ", ".join(node.targets)
        kw = "const" if node.is_const else "let"
        print(f"{prefix}IRAssign [{kw}] {names} =")
        _print_ir(node.value, indent + 1)

    elif isinstance(node, IRElement):
        props = ", ".join(f"{k}=..." for k, _ in node.props)
        print(f"{prefix}IRElement <{node.tag}> props=[{props}]")
        for child in node.children:
            _print_ir(child, indent + 1)

    elif isinstance(node, IRText):
        print(f"{prefix}IRText {node.text!r}")

    elif isinstance(node, IRVariable):
        print(f"{prefix}IRVariable {node.name!r}")

    elif isinstance(node, IRConstant):
        print(f"{prefix}IRConstant {node.value!r}")

    elif isinstance(node, IRBinOp):
        print(f"{prefix}IRBinOp {node.op!r}")
        _print_ir(node.left, indent + 1)
        _print_ir(node.right, indent + 1)

    elif isinstance(node, IRCall):
        print(f"{prefix}IRCall")
        _print_ir(node.func, indent + 1)
        for arg in node.args:
            _print_ir(arg, indent + 1)

    elif isinstance(node, IRIf):
        print(f"{prefix}IRIf")
        _print_ir(node.test, indent + 1)
        for stmt in node.body:
            _print_ir(stmt, indent + 2)
        if node.orelse:
            print(f"{prefix}  else:")
            for stmt in node.orelse:
                _print_ir(stmt, indent + 2)

    elif isinstance(node, IRFor):
        print(f"{prefix}IRFor {node.target!r} in")
        _print_ir(node.iter, indent + 1)
        for stmt in node.body:
            _print_ir(stmt, indent + 1)

    elif isinstance(node, IRExprStatement):
        print(f"{prefix}IRExprStatement")
        _print_ir(node.expr, indent + 1)

    elif isinstance(node, IRMemberAccess):
        print(f"{prefix}IRMemberAccess .{node.attr}")
        _print_ir(node.obj, indent + 1)

    else:
        print(f"{prefix}{type(node).__name__}")
```

---

### SAVE AND TRY

```
> pyxc build examples/counter.pyx --ir
```

**Expected output** (approximately):

```
IRModule (exports: 'Counter')
  IRImport from 'pyx-runtime': useState
  IRComponent Counter()
    IRAssign [const] count, set_count =
      IRCall
        IRVariable 'useState'
        IRConstant 0
    IRFunction increment()
      IRExprStatement
        IRCall
          IRVariable 'set_count'
          IRBinOp '+'
            IRVariable 'count'
            IRConstant 1
    IRReturn
      IRElement <div> props=[className=...]
        IRElement <p> props=[]
          IRText 'Count: '
          IRVariable 'count'
        IRElement <button> props=[onClick=...]
          IRText '+'
```

This is the complete IR for the counter component. Every Python construct has been transformed to its JavaScript equivalent. The code generator (Lab 12) will turn this tree into a JSX string.

---

## Step 4 — Integration Tests

Create `compiler/tests/test_pipeline.py`:

```python
"""
Integration tests: pre-processor → ast.parse → transformer.
These tests exercise the full Phase 1+2 pipeline.
"""
import ast
from compiler.preprocessor import preprocess
from compiler.parser_py import parse_python
from compiler.transformer import Transformer
from compiler.ir import (
    IRAssign, IRCall, IRElement, IRFunction, IRImport,
    IRModule, IRReturn, IRText, IRVariable,
)


def _pipeline(source: str) -> IRModule:
    preprocessed = preprocess(source, filename="test.pyx")
    py_ast = parse_python(preprocessed, filename="test.pyx")
    t = Transformer(filename="test.pyx")
    return t.transform_module(py_ast)


def test_python_passthrough():
    """Python-only source transforms without errors."""
    m = _pipeline("def f():\n    return 1\n")
    assert len(m.functions) == 1
    assert m.functions[0].name == "f"


def test_import_pyx_runtime():
    """from pyx import useState → import from pyx-runtime."""
    m = _pipeline("from pyx import useState\n")
    assert len(m.imports) == 1
    assert m.imports[0].source == "pyx-runtime"
    assert "useState" in m.imports[0].names


def test_element_in_component():
    """An element in a component becomes an IRElement in the IR."""
    source = (
        "def Hello():\n"
        "    return <div>Hello</div>\n"
    )
    m = _pipeline(source)
    assert len(m.functions) == 1
    f = m.functions[0]
    assert f.is_component is True
    ret = f.body[0]
    assert isinstance(ret, IRReturn)
    elem = ret.value
    assert isinstance(elem, IRElement)
    assert elem.tag == "div"
    assert len(elem.children) == 1
    assert isinstance(elem.children[0], IRText)
    assert elem.children[0].text == "Hello"


def test_class_renamed_to_classname():
    """HTML class prop becomes className in the IR."""
    source = "def App():\n    return <div class=\"main\">hi</div>\n"
    m = _pipeline(source)
    elem = m.functions[0].body[0].value
    assert isinstance(elem, IRElement)
    prop_names = [name for name, _ in elem.props]
    assert "className" in prop_names
    assert "class" not in prop_names


def test_counter_component():
    """The counter component produces a correct full IR."""
    source = (
        "from pyx import useState\n"
        "def Counter():\n"
        "    count, set_count = useState(0)\n"
        "    def increment():\n"
        "        set_count(count + 1)\n"
        "    return (\n"
        "        <div class=\"counter\">\n"
        "            <p>Count: {count}</p>\n"
        "            <button onClick={increment}>+</button>\n"
        "        </div>\n"
        "    )\n"
    )
    m = _pipeline(source)

    # Module structure
    assert len(m.imports) == 1
    assert m.imports[0].source == "pyx-runtime"
    assert len(m.functions) == 1
    assert m.default_export == "Counter"

    # Component
    counter = m.functions[0]
    assert counter.name == "Counter"
    assert counter.is_component is True

    # useState call
    assign = counter.body[0]
    assert isinstance(assign, IRAssign)
    assert assign.targets == ("count", "set_count")

    # Return with element
    ret = counter.body[-1]
    assert isinstance(ret, IRReturn)
    elem = ret.value
    assert isinstance(elem, IRElement)
    assert elem.tag == "div"


if __name__ == "__main__":
    tests = [
        test_python_passthrough,
        test_import_pyx_runtime,
        test_element_in_component,
        test_class_renamed_to_classname,
        test_counter_component,
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
> python compiler/tests/test_pipeline.py
```

**Expected output:**
```
  PASS  test_python_passthrough
  PASS  test_import_pyx_runtime
  PASS  test_element_in_component
  PASS  test_class_renamed_to_classname
  PASS  test_counter_component

5 passed, 0 failed
```

---

## Challenge: Handle `useEffect` in the Pipeline

**You know:** `from pyx import useEffect` should also map to `pyx-runtime`. The `_MODULE_MAP` in `transformer.py` already handles the module name. But `useEffect` takes a function as its first argument — a common pattern in PyX components:

```python
def App():
    data, set_data = useState(None)

    useEffect(lambda: fetch_data(set_data), [])

    return <div>{data}</div>
```

The `lambda: fetch_data(set_data)` is a zero-argument lambda that should become `() => fetch_data(set_data)` in JavaScript.

**Task:** Write a pipeline integration test that verifies this component transforms correctly. Check that:
1. `from pyx import useState, useEffect` → single `IRImport` with both names
2. `useEffect(lambda: ...)` → `IRExprStatement` containing `IRCall` with an `IRArrowFunction` argument

---

<details>
<summary>▶ Show Solution</summary>

```python
def test_use_effect_lambda():
    source = (
        "from pyx import useState, useEffect\n"
        "def App():\n"
        "    data, set_data = useState(None)\n"
        "    useEffect(lambda: fetch(set_data), [])\n"
        "    return <div>app</div>\n"
    )
    m = _pipeline(source)

    # Both hooks imported from pyx-runtime
    assert len(m.imports) == 1
    assert "useState" in m.imports[0].names
    assert "useEffect" in m.imports[0].names

    app = m.functions[0]
    # Second statement is the useEffect call
    effect_stmt = app.body[1]
    assert isinstance(effect_stmt, IRExprStatement)
    effect_call = effect_stmt.expr
    assert isinstance(effect_call, IRCall)
    # First arg is the lambda → IRArrowFunction
    assert len(effect_call.args) >= 1
    assert isinstance(effect_call.args[0], IRArrowFunction)
    arrow = effect_call.args[0]
    assert arrow.params == ()  # lambda: ... has no parameters
```

**Key insight:** `lambda: expr` (zero-argument lambda) produces `ast.Lambda(args=arguments(args=[]), body=expr)`. The transformer's `transform_Lambda` handles this: `params = tuple(arg.arg for arg in node.args.args)` produces `()` for a zero-arg lambda. Zero-arg arrow functions in JavaScript are `() => expr`.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `parser_py.py` wraps `ast.parse` | `parse_python("x = 1")` returns an `ast.Module` |
| `pyxc build --ir` works | Prints the IR tree for counter.pyx |
| Full pipeline runs | `pyxc build examples/counter.pyx` prints "IR stage complete" |
| Integration tests pass | `python compiler/tests/test_pipeline.py` shows "5 passed, 0 failed" |
| Counter IR has correct structure | `test_counter_component` passes with the right imports, function, and element |

---

## Your Complete Files

### New / changed files this lab

**`compiler/parser_py.py`** — wraps `ast.parse` with a `ParseError` that includes filename and line number (Step 1).

**`compiler/cli.py`** — updated with `--ir` flag and the pre-processor → ast.parse → transformer pipeline wired together (Step 2).

**`compiler/tests/test_pipeline.py`** — integration tests for the two-stage pipeline (Step 3).

### Project structure at end of Lab 10

```
pyx/
├── compiler/
│   ├── cli.py             ← updated (--ir flag, pipeline wired)
│   ├── parser_py.py       ← new
│   ├── transformer.py     ← complete (from Labs 08-09)
│   └── tests/
│       ├── test_pipeline.py   ← new
│       └── ... (all previous tests)
└── ... (all other files unchanged)
```

---

## Quick Check Answers

**1. What step runs between the pre-processor output and transformer input?**

`ast.parse`. The pre-processor produces a valid Python string with `h()` calls. `ast.parse` takes that string and returns a Python AST (`ast.Module` object). The transformer then walks the AST. In the pipeline: `preprocess(source)` → `ast.parse(preprocessed)` → `Transformer().transform_module(py_ast)`. The `parse_python` wrapper handles `ast.parse` and converts its `SyntaxError` to a `ParseError` with location information.

**2. At what point in the pipeline does `class` → `className` renaming happen?**

In the transformer, specifically in `_transform_h_call`. The pre-processor produces `h("div", {"class": "app"}, ...)` — the dict key is `"class"`. When the transformer visits this `Call` node and detects it is an `h()` call, it reads each prop name and renames `"class"` to `"className"` for lowercase (HTML) tag names. Component tag names (uppercase) do not get this renaming — `<MyComp class="x" />` keeps `class` as the prop name, because components receive arbitrary props.

**3. Which IR node type represents `import { useState } from 'pyx-runtime'`?**

`IRImport(source="pyx-runtime", names=("useState",))`. The `source` field is the JavaScript module path (a string). The `names` field is a tuple of the imported names. The code generator (Lab 12) will turn this into the JSX import statement.

---

*End of LAB 10.*

*Lab 11 adds error handling to the transformer — when a `.pyx` file uses an unsupported Python construct (`try/except`, generators, `async/await`), the transformer collects all errors before aborting and prints clear messages that point to the original `.pyx` source line.*
