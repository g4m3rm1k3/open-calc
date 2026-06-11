# PyX — LAB 11 — Error Handling in the Transformer

**Prerequisites:** Lab 10 complete. `python compiler/tests/test_pipeline.py` shows "5 passed, 0 failed."

**What this lab adds:**
- Error accumulation — collecting all transformer errors before aborting instead of stopping at the first one
- Clear, located error messages for every unsupported Python construct
- A `PyXError` with filename, line number, construct name, and a suggested alternative
- Tests that verify each error case produces the right message

**Time:** 45–60 minutes.

---

## What You Will Build

Right now, the transformer calls `transform_unsupported` for any unrecognised node type, which appends a `PyXError` to `self._errors`. But several things are not yet right:

1. `transform_unsupported` is called but the errors are only checked at the CLI level after all transformation finishes — so multiple errors are accumulated but the first one does not stop anything, which is correct behaviour. However, the error messages are generic: "Unsupported Python construct: TryStar." They do not say what to do.

2. Many specific unsupported constructs (decorators, `try/except`, generators, `async def`, `yield`) reach `transform_unsupported` only because no method exists for them. The error messages should be specific per construct.

After this lab:
```
> pyxc build broken.pyx
pyxc: error in broken.pyx line 8:
  try/except is not supported in PyX v1.0.
  Suggestion: use if/else guards to avoid exceptions, or handle errors in useEffect.

pyxc: error in broken.pyx line 14:
  Generators (yield) are not supported in PyX v1.0.
  Suggestion: use a regular function that returns a list instead.

2 error(s) found. Fix these before building.
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why is collecting multiple errors before aborting better than stopping at the first error? What is the cost of this approach?
> 2. The `transform_unsupported` method currently appends to `self._errors` and returns `None`. The caller then has a `None` where it expected an `IRNode`. What could go wrong, and how do you guard against it?
> 3. An error message that says "unsupported construct: Try" is technically correct. Why is it still a bad error message?
>
> *(Answers at the end of this lab)*

---

## Concept: Error Accumulation

**What it is:** A compiler that stops at the first error forces the developer to fix one error, recompile, find the next error, fix it, recompile — N errors means N compile cycles. A compiler that collects all errors and reports them together lets the developer see and fix all problems at once.

**The tradeoff:**

Collecting all errors requires the compiler to continue after encountering an error. This means: when the transformer sees `try/except` (unsupported), it must produce *something* to continue transforming the rest of the file. The current design returns `None` from `transform_unsupported`, and callers skip `None` values.

The risk: a `None` from an error can propagate and cause a second, misleading error later. For example, if `transform_Assign` calls `transform(node.value)` and gets `None`, then tries to include `None` in an `IRAssign`, the IR is malformed — and the code generator may then crash with a confusing error about receiving `None` where it expected an `IRNode`.

The solution: every caller of `self.transform()` must handle `None` gracefully. The pattern used throughout the transformer is: `ir = self.transform(x); if ir is not None: body.append(ir)`.

**When to stop collecting errors:**

Some errors make it impossible to continue meaningfully. A syntax error in element nesting (Lab 05) stops immediately — there is no way to produce a useful token list from an unclosed element. The transformer's errors are different: an unsupported statement can be skipped and transformation continues with the next statement.

**Watch for:** The two-pass approach — first collect all errors, then report and abort — is used by TypeScript, Rust, and most modern compilers. It is a quality-of-life feature that is worth implementing early. Later changes to the compiler may introduce new error conditions, and the accumulation infrastructure is already in place.

---

## Concept: Error Messages as Developer Experience

**What it is:** A compiler error message is a communication from the compiler author to the developer using the compiler. It should answer three questions:

1. **What went wrong?** Name the specific thing that failed.
2. **Where?** Give the filename and line number.
3. **What to do?** Suggest a fix or alternative.

**Examples:**

| Bad | Good |
|---|---|
| `Unsupported: Try` | `try/except is not supported in PyX v1.0. Use if/else guards or handle errors in useEffect.` |
| `Unsupported: AsyncFunctionDef` | `async def is not supported in PyX v1.0. Use useEffect with a Promise for async operations.` |
| `Unsupported: Yield` | `yield (generators) is not supported in PyX v1.0. Return a list instead of yielding values.` |
| `Unsupported: With` | `with statements are not supported in PyX v1.0. Manage resources in useEffect cleanup.` |
| `Unsupported: ClassDef` | `class definitions are not supported in PyX v1.0. Use function components instead.` |

The good version takes 5 more seconds to write but saves the developer minutes of confusion.

**The suggestion should be actionable.** "not supported" is not a suggestion. "use X instead" is.

---

## Step 1 — Create Specific Error Handlers

Replace the generic `transform_unsupported` in `compiler/transformer.py` and add specific handlers for each unsupported construct.

First, update `PyXError` to include a `suggestion` field:

```python
class PyXError(Exception):
    """Raised for unsupported Python constructs in .pyx files."""

    def __init__(
        self,
        message: str,
        line: int = 0,
        filename: str = "<unknown>",
        suggestion: str = "",
    ) -> None:
        self.pyx_line = line
        self.filename = filename
        self.suggestion = suggestion
        super().__init__(message)

    def format(self) -> str:
        lines = [f"pyxc: error in {self.filename} line {self.pyx_line}:"]
        lines.append(f"  {self}")
        if self.suggestion:
            lines.append(f"  Suggestion: {self.suggestion}")
        return "\n".join(lines)
```

Now update `transform_unsupported` to be the fallback for truly unknown nodes:

```python
    def transform_unsupported(self, node: ast.AST) -> None:
        """Called for any AST node type with no specific handler."""
        line = getattr(node, "lineno", 0)
        node_type = type(node).__name__
        error = PyXError(
            f"'{node_type}' is not supported in PyX v1.0.",
            line=line,
            filename=self.filename,
            suggestion=f"See the PyX documentation for supported Python constructs.",
        )
        self._errors.append(error)
        return None
```

---

## Step 2 — Add Specific Unsupported Construct Handlers

Add these methods to the `Transformer` class:

```python
    # ── Unsupported constructs with helpful messages ───────────────────────

    def transform_Try(self, node: ast.Try) -> None:
        self._errors.append(PyXError(
            "try/except is not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Use if/else guards to avoid exceptions, or handle errors in useEffect.",
        ))
        return None

    def transform_TryStar(self, node) -> None:
        # Python 3.11+ try/except* syntax
        self._errors.append(PyXError(
            "try/except* (exception groups) are not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Use standard if/else error handling instead.",
        ))
        return None

    def transform_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._errors.append(PyXError(
            "async def is not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Use useEffect with a Promise for async operations: "
                       "useEffect(lambda: fetch_data().then(set_data), [])",
        ))
        return None

    def transform_Yield(self, node: ast.Yield) -> None:
        self._errors.append(PyXError(
            "yield (generators) are not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Return a list instead of yielding values.",
        ))
        return None

    def transform_YieldFrom(self, node: ast.YieldFrom) -> None:
        self._errors.append(PyXError(
            "yield from (generators) are not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Return a list instead of yielding values.",
        ))
        return None

    def transform_ClassDef(self, node: ast.ClassDef) -> None:
        self._errors.append(PyXError(
            "class definitions are not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Use function components (def ComponentName(): ...) instead of classes.",
        ))
        return None

    def transform_With(self, node: ast.With) -> None:
        self._errors.append(PyXError(
            "with statements are not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Manage resources in useEffect cleanup functions.",
        ))
        return None

    def transform_Raise(self, node: ast.Raise) -> None:
        self._errors.append(PyXError(
            "raise statements are not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Use conditional returns or useEffect error handling.",
        ))
        return None

    def transform_Delete(self, node: ast.Delete) -> None:
        self._errors.append(PyXError(
            "del statements are not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Use None assignment or array filtering instead.",
        ))
        return None

    def transform_Global(self, node: ast.Global) -> None:
        self._errors.append(PyXError(
            "global statements are not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Pass values as props or use useState for component state.",
        ))
        return None

    def transform_Nonlocal(self, node: ast.Nonlocal) -> None:
        self._errors.append(PyXError(
            "nonlocal statements are not supported in PyX v1.0.",
            line=self._line(node),
            filename=self.filename,
            suggestion="Pass setter functions as arguments to inner functions.",
        ))
        return None
```

---

## Step 3 — Update the CLI to Report All Errors

Update the error reporting in `_run_build` to show all errors and a summary:

```python
    if t._errors:
        for error in t._errors:
            print(error.format())
            print()  # blank line between errors
        count = len(t._errors)
        print(f"{count} error{'s' if count != 1 else ''} found. Fix these before building.")
        import sys; sys.exit(1)
```

---

## Step 4 — Write Error Tests

Create `compiler/tests/test_errors.py`:

```python
"""
Tests for transformer error messages on unsupported constructs.
"""
import ast
from compiler.preprocessor import preprocess
from compiler.parser_py import parse_python
from compiler.transformer import Transformer, PyXError


def _transform_errors(source: str) -> list[PyXError]:
    """Run the full pipeline and return any transformer errors."""
    preprocessed = preprocess(source, filename="test.pyx")
    py_ast = parse_python(preprocessed, filename="test.pyx")
    t = Transformer(filename="test.pyx")
    t.transform_module(py_ast)
    return t._errors


def test_try_except_produces_error():
    source = (
        "def f():\n"
        "    try:\n"
        "        x = 1\n"
        "    except:\n"
        "        pass\n"
    )
    errors = _transform_errors(source)
    assert len(errors) >= 1
    assert "try/except" in str(errors[0])


def test_async_def_produces_error():
    source = "async def f():\n    pass\n"
    errors = _transform_errors(source)
    assert len(errors) >= 1
    assert "async" in str(errors[0]).lower()


def test_class_def_produces_error():
    source = "class MyClass:\n    pass\n"
    errors = _transform_errors(source)
    assert len(errors) >= 1
    assert "class" in str(errors[0]).lower()


def test_yield_produces_error():
    source = "def f():\n    yield 1\n"
    errors = _transform_errors(source)
    assert len(errors) >= 1
    assert "yield" in str(errors[0]).lower()


def test_error_includes_filename():
    source = "def f():\n    try:\n        pass\n    except:\n        pass\n"
    errors = _transform_errors(source)
    assert errors[0].filename == "test.pyx"


def test_error_includes_line():
    source = "def f():\n    try:\n        pass\n    except:\n        pass\n"
    errors = _transform_errors(source)
    assert errors[0].pyx_line > 0


def test_error_has_suggestion():
    source = "def f():\n    try:\n        pass\n    except:\n        pass\n"
    errors = _transform_errors(source)
    formatted = errors[0].format()
    assert "Suggestion:" in formatted


def test_multiple_errors_all_collected():
    """Multiple unsupported constructs in one file produce multiple errors."""
    source = (
        "def f():\n"
        "    try:\n"
        "        pass\n"
        "    except:\n"
        "        pass\n"
        "class C:\n"
        "    pass\n"
    )
    errors = _transform_errors(source)
    assert len(errors) >= 2  # try/except AND class def


def test_valid_component_has_no_errors():
    source = (
        "from pyx import useState\n"
        "def Counter():\n"
        "    count, set_count = useState(0)\n"
        "    return <div>{count}</div>\n"
    )
    errors = _transform_errors(source)
    assert errors == []


if __name__ == "__main__":
    tests = [
        test_try_except_produces_error,
        test_async_def_produces_error,
        test_class_def_produces_error,
        test_yield_produces_error,
        test_error_includes_filename,
        test_error_includes_line,
        test_error_has_suggestion,
        test_multiple_errors_all_collected,
        test_valid_component_has_no_errors,
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
> python compiler/tests/test_errors.py
```

**Expected output:**
```
  PASS  test_try_except_produces_error
  PASS  test_async_def_produces_error
  PASS  test_class_def_produces_error
  PASS  test_yield_produces_error
  PASS  test_error_includes_filename
  PASS  test_error_includes_line
  PASS  test_error_has_suggestion
  PASS  test_multiple_errors_all_collected
  PASS  test_valid_component_has_no_errors

9 passed, 0 failed
```

---

### SAVE AND TRY — Test the CLI Error Output

Create `examples/broken.pyx`:

```python
from pyx import useState

def BrokenComponent():
    count, set_count = useState(0)

    try:
        risky = compute()
    except ValueError:
        risky = 0

    class Inner:
        pass

    return <div>{count}</div>
```

Run:

```
> pyxc build examples/broken.pyx
```

**Expected output:**
```
pyxc: error in examples/broken.pyx line 6:
  try/except is not supported in PyX v1.0.
  Suggestion: Use if/else guards to avoid exceptions, or handle errors in useEffect.

pyxc: error in examples/broken.pyx line 11:
  class definitions are not supported in PyX v1.0.
  Suggestion: Use function components (def ComponentName(): ...) instead of classes.

2 errors found. Fix these before building.
```

Both errors are reported, each with a location and a suggestion. The developer sees all problems at once.

---

## Challenge: Add a Filtered Comprehension Error

**You know:** `transform_ListComp` in Lab 09 calls `transform_unsupported` when the comprehension has a condition (`[x for x in items if x > 0]`). The error message currently says "Unsupported Python construct: ListComp."

**Task:** Replace the `transform_unsupported` call in `transform_ListComp` with a specific error that names the pattern and suggests `.filter().map()` as the JavaScript equivalent.

**Expected error message:**
```
pyxc: error in test.pyx line 3:
  Filtered list comprehensions ([x for x in items if condition]) are not supported in PyX v1.0.
  Suggestion: Use JavaScript-style chaining: items.filter(x => condition).map(x => expr)
```

---

<details>
<summary>▶ Show Solution</summary>

In `transform_ListComp`, replace the two `return self.transform_unsupported(node)` calls:

```python
if len(node.generators) != 1:
    self._errors.append(PyXError(
        "Multi-generator list comprehensions are not supported in PyX v1.0.",
        line=self._line(node),
        filename=self.filename,
        suggestion="Break it into nested .map() calls.",
    ))
    return None

if generator.ifs:
    self._errors.append(PyXError(
        "Filtered list comprehensions ([x for x in items if condition]) "
        "are not supported in PyX v1.0.",
        line=self._line(node),
        filename=self.filename,
        suggestion="Use JavaScript-style chaining: items.filter(x => condition).map(x => expr)",
    ))
    return None
```

**Key insight:** Each call to `transform_unsupported` is an opportunity for a specific error message. The generic fallback catches the things you truly did not anticipate. Every construct you do anticipate (and choose not to support) deserves a specific, helpful message. Error messages are user-facing API — treat them with the same care as public function names.

</details>

---

## Phase 2 Complete — What You Have Built

Phase 2 added the transformer — the most complex stage of the compiler. Let's review what it does:

| Input | Output | Module |
|---|---|---|
| Python source string | Valid Python with `h()` calls | `preprocessor.py` (Phase 1) |
| Valid Python string | Python AST | `parser_py.py` |
| Python AST | PyX IR | `transformer.py` |

The transformer handles: functions, return statements, variable assignments (single and tuple), constants, variable references, binary operations, comparisons, boolean operations, unary operations, function calls, `h()` calls (→ `IRElement`), attribute access, if/else, for loops, while loops, list comprehensions (→ `.map()`), lambdas (→ arrow functions), imports (with module name mapping), and expression statements.

Unsupported constructs (`try/except`, `async def`, `class`, `yield`, `with`, `raise`, `del`, `global`, `nonlocal`) produce specific error messages with actionable suggestions.

---

## Final Check

| Feature | How to verify |
|---|---|
| `try/except` produces a specific error | `_transform_errors("def f():\n    try:\n        pass\n    except:\n        pass")` has ≥1 error |
| Error message has suggestion | `error.format()` contains "Suggestion:" |
| Multiple errors collected | Two unsupported constructs → two errors |
| Valid component has no errors | Counter component → empty error list |
| All 9 error tests pass | `python compiler/tests/test_errors.py` shows "9 passed, 0 failed" |
| CLI shows all errors | `pyxc build examples/broken.pyx` shows all errors with suggestions |

---

## Your Complete Files

### Changed files this lab

**`compiler/errors.py`** — new file defining `PyXError` with `filename`, `line`, `construct`, and `suggestion` fields (full definition in Step 1).

**`compiler/transformer.py`** — updated `transform_unsupported` to record a `PyXError` in `self.errors`; transformer now accumulates errors instead of raising immediately (changes in Step 2).

**`compiler/tests/test_transformer_errors.py`** — new file with tests for every unsupported construct (Step 3).

### Project structure at end of Lab 11

```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py
│   ├── codegen_preprocessor.py
│   ├── errors.py          ← new
│   ├── ir.py
│   ├── lexer.py
│   ├── nodes.py
│   ├── parser.py
│   ├── parser_py.py
│   ├── preprocessor.py
│   ├── tokens.py
│   ├── transformer.py     ← updated (error accumulation)
│   └── tests/
│       ├── __init__.py
│       ├── test_codegen_preprocessor.py
│       ├── test_lexer.py
│       ├── test_parser.py
│       ├── test_pipeline.py
│       ├── test_transformer.py
│       └── test_transformer_errors.py  ← new
├── examples/
│   ├── counter.pyx
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. Why is collecting multiple errors better? What is the cost?**

Better because: each compile cycle takes time. If you must fix-and-recompile for every single error, 10 errors means 10 cycles. Seeing all errors at once means one fix cycle for all of them. The cost: the compiler must continue transforming after an error, which means handling `None` values throughout the transformer. If done carelessly, a `None` from error recovery causes a secondary crash that obscures the real error. The pattern of `ir = self.transform(x); if ir is not None: body.append(ir)` handles this correctly — `None` nodes are skipped, not propagated.

**2. What could go wrong when `transform_unsupported` returns `None`?**

A caller that does not check for `None` would try to use `None` as an `IRNode`. For example: `IRBinOp(left=None, op="+", right=IRConstant(1))` — the frozen dataclass accepts it (the type annotation says `IRNode`, but Python does not enforce annotations at runtime). Later, the code generator calls `generate(node.left)` and crashes with `AttributeError: 'NoneType' object has no attribute 'tag'`. This secondary crash message points to the code generator, not to the original unsupported construct — very confusing. The correct guard is in every caller: `ir = self.transform(x); if ir is None: return None`.

**3. Why is "unsupported construct: Try" a bad error message?**

It tells the developer what category of problem occurred but not what to do about it. A developer using PyX for the first time does not know: "Is this a permanent limitation? Is there a workaround? Do I need a different version of PyX? Is this a bug?" A message that says "Use if/else guards or handle errors in useEffect" immediately tells them: this is a known limitation, here is how to proceed, and it is not a bug. Good error messages turn confusion into action. They are part of the product, not afterthoughts.

---

*End of LAB 11.*

*Lab 12 writes the code generator — it walks the PyX IR and emits JSX strings. `IRFunction` becomes a JavaScript function declaration. `IRElement` becomes an `h()` call. After Lab 12, `pyxc build counter.pyx` produces a `.jsx` file that Vite can compile.*
