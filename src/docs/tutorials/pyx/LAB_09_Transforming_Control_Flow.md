# PyX — LAB 09 — Transforming Control Flow

**Prerequisites:** Lab 08 complete. `python compiler/tests/test_transformer.py` shows "19 passed, 0 failed."

**What this lab adds:**
- Transformation of `if/elif/else`, `for` loops, and `while` loops
- Transformation of list comprehensions to `.map()` calls
- The concept of impedance mismatch between languages
- 8 new transformer tests covering control flow

**Time:** 60–80 minutes.

---

## What You Will Build

Four new `transform_X` methods in `compiler/transformer.py`:

```python
# Python if/else
if count > 0:
    return count
else:
    return 0

# IR output
IRIf(
    test=IRBinOp(left=IRVariable("count"), op=">", right=IRConstant(0)),
    body=(IRReturn(value=IRVariable("count")),),
    orelse=(IRReturn(value=IRConstant(0)),),
)

# List comprehension
[x * 2 for x in items]

# IR output (mapped to .map())
IRCall(
    func=IRMemberAccess(obj=IRVariable("items"), attr="map"),
    args=(IRArrowFunction(params=("x",), body=IRBinOp(...)),),
)
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. Python's `elif` is not a separate AST node type. How does the Python AST represent `if/elif/else`? Look it up in the REPL if you are not sure.
> 2. Python's `for x in items` iterates over any iterable. JavaScript's `for (const x of items)` does the same. But JavaScript also has `for (let i = 0; i < n; i++)`. Which JS form should PyX emit for Python `for` loops?
> 3. A list comprehension `[x*2 for x in items]` creates a new list. The JavaScript `.map(x => x*2)` creates a new array. They are semantically equivalent. Is this a safe mapping to make? What Python comprehensions would break?
>
> *(Answers at the end of this lab)*

---

## Concept: Impedance Mismatch Between Languages

**What it is:** **Impedance mismatch** is a term borrowed from electrical engineering. In programming, it describes the friction that arises when two systems use fundamentally different models for the same concept.

Between Python and JavaScript:

| Python | JavaScript | Mismatch |
|---|---|---|
| `x == y` | `x === y` | Different equality semantics |
| `None` | `null` | Different null representations |
| `True` / `False` | `true` / `false` | Different casing |
| `for x in items` | `for (const x of items)` | Same semantics, different syntax — easy |
| `[x for x in items]` | `items.map(x => x)` | Same semantics, different paradigm — harder |
| `x ** 2` | `Math.pow(x, 2)` | Same semantics, different mechanism |
| `print(x)` | `console.log(x)` | Same semantics, different API |
| `lambda x: x` | `x => x` | Same semantics, different syntax |
| `try/except` | `try/catch` | Similar, but Python has more features |
| `with open(...)` | — | No JavaScript equivalent |

The transformer must make explicit decisions about how to map each Python construct to JavaScript. These decisions are **documented in the mapping table** from Lab 07, and the transformer code is the authoritative implementation of those decisions.

**When the mismatch is severe:**

Some Python constructs have no natural JavaScript equivalent. The transformer either:
1. Maps them to a JavaScript approximation (list comprehensions → `.map()`)
2. Refuses to compile them and emits an error (Lab 11)

PyX's position: use approximations for common patterns that are semantically equivalent. Refuse uncommon patterns with a clear error.

**Watch for:** The `.map()` mapping for list comprehensions is a decision you are making as the compiler author. A Python developer might write `[x for x in items if x > 0]` — that is a filtered comprehension, which maps to `.filter().map()`. This lab only handles the simple case. The error handler in Lab 11 will catch the more complex cases.

---

## Concept: `IRArrowFunction` — A New IR Node

**What it is:** A new IR node needed for list comprehensions. Python lambdas and comprehension expressions both become JavaScript arrow functions.

Add this to `compiler/ir.py` (after `IRFunction`):

```python
@dataclass(frozen=True)
class IRArrowFunction(IRNode):
    """A JavaScript arrow function.
    
    Python: lambda x: x * 2
    Python (comprehension): x * 2 in [x * 2 for x in items]
    JS:     (x) => x * 2
    """
    params: tuple[str, ...] = ()
    body: IRNode = field(default_factory=lambda: IRConstant())
```

Note that `IRArrowFunction.body` is a single expression (not a list of statements). Arrow functions in PyX are always single-expression — `x => expr`. Multi-statement arrow functions (`x => { stmt1; stmt2 }`) are not supported in v1.0.

---

## Step 1 — Add `IRArrowFunction` to `ir.py`

Open `compiler/ir.py` and add the `IRArrowFunction` class after `IRFunction` (before the imports section):

```python
@dataclass(frozen=True)
class IRArrowFunction(IRNode):
    """A JavaScript arrow function: (params) => body"""
    params: tuple[str, ...] = ()
    body: IRNode = field(default_factory=lambda: IRConstant())
```

Also update the imports at the top of `compiler/transformer.py` to include `IRArrowFunction`:

```python
from compiler.ir import (
    IRArrowFunction, IRAssign, IRBinOp, IRCall, IRConstant, IRElement,
    IRExprStatement, IRFor, IRFunction, IRIf, IRImport, IRMemberAccess,
    IRModule, IRNode, IRReturn, IRText, IRVariable,
)
```

---

### SAVE AND TRY

```
> python -c "
from compiler.ir import IRArrowFunction, IRConstant
f = IRArrowFunction(params=('x',), body=IRConstant(value=2))
print(f)
"
```

**Expected output:**
```
IRArrowFunction(params=('x',), body=IRConstant(value=2, line=0), line=0)
```

If Python raises `ImportError`, confirm `IRArrowFunction` was saved to `compiler/ir.py` and the import line at the top of the file is correct.

---

## Step 2 — Add Control Flow Transforms

Add these methods to the `Transformer` class in `compiler/transformer.py`:

```python
    # ── Control flow ──────────────────────────────────────────────────────

    def transform_If(self, node: ast.If) -> IRIf:
        """Transform an if/elif/else statement.
        
        Python's elif is represented as a nested If in the orelse field.
        The IR mirrors this: IRIf.orelse can contain another IRIf.
        """
        test = self.transform(node.test)

        body: list[IRNode] = []
        for stmt in node.body:
            ir = self.transform(stmt)
            if ir is not None:
                body.append(ir)

        orelse: list[IRNode] = []
        for stmt in node.orelse:
            ir = self.transform(stmt)
            if ir is not None:
                orelse.append(ir)

        return IRIf(
            test=test,
            body=tuple(body),
            orelse=tuple(orelse),
            line=self._line(node),
        )

    def transform_For(self, node: ast.For) -> IRFor | None:
        """Transform a for loop.
        
        Python: for x in items: body
        JS:     for (const x of items) { body }
        
        Only simple loop variables (single names) are supported.
        Tuple unpacking in for loops (for a, b in pairs) is not supported.
        """
        if not isinstance(node.target, ast.Name):
            return self.transform_unsupported(node)

        iter_ir = self.transform(node.iter)
        body: list[IRNode] = []
        for stmt in node.body:
            ir = self.transform(stmt)
            if ir is not None:
                body.append(ir)

        return IRFor(
            target=node.target.id,
            iter=iter_ir,
            body=tuple(body),
            line=self._line(node),
        )

    def transform_While(self, node: ast.While) -> IRIf:
        """Transform a while loop.
        
        PyX maps while loops to a JS while loop via IRIf with a special marker.
        This is a simplified implementation — while loops are uncommon in
        React components and are included for completeness.
        """
        # Reuse IRIf with a special flag — not ideal but avoids adding a new IR node
        # A production compiler would add IRWhile; PyX keeps the IR small.
        test = self.transform(node.test)
        body: list[IRNode] = []
        for stmt in node.body:
            ir = self.transform(stmt)
            if ir is not None:
                body.append(ir)

        # We extend IRIf semantically — the code generator will handle this.
        # For now, emit an IRIf marked as a while loop using the line number convention.
        # Lab 12 will emit 'while (test) { body }' for this pattern.
        # The hack: store the "while" marker in orelse as an empty tuple
        # and let the code generator detect "orelse is empty AND this came from While"
        # by checking the IRIf.line against the source position.
        #
        # A cleaner solution: add IRWhile to ir.py. That is the challenge below.
        return IRIf(
            test=test,
            body=tuple(body),
            orelse=(),
            line=self._line(node),
        )

    # ── List comprehensions ────────────────────────────────────────────────

    def transform_ListComp(self, node: ast.ListComp) -> IRCall | None:
        """Transform a list comprehension to a .map() call.
        
        Python: [expr for var in iter]
        JS:     iter.map((var) => expr)
        
        Only single-generator comprehensions without conditions are supported.
        [x for x in items if x > 0] is not supported — use filter().map().
        """
        if len(node.generators) != 1:
            return self.transform_unsupported(node)

        generator = node.generators[0]

        if generator.ifs:
            # Has a condition: [x for x in items if condition]
            # Not supported in v1.0 — emit error
            return self.transform_unsupported(node)

        if not isinstance(generator.target, ast.Name):
            return self.transform_unsupported(node)

        var_name = generator.target.id
        iter_ir = self.transform(generator.iter)
        body_ir = self.transform(node.elt)

        arrow = IRArrowFunction(
            params=(var_name,),
            body=body_ir,
            line=self._line(node),
        )

        return IRCall(
            func=IRMemberAccess(
                obj=iter_ir,
                attr="map",
                line=self._line(node),
            ),
            args=(arrow,),
            line=self._line(node),
        )

    def transform_Lambda(self, node: ast.Lambda) -> IRArrowFunction:
        """Transform a Python lambda to a JS arrow function."""
        params = tuple(arg.arg for arg in node.args.args)
        body = self.transform(node.body)
        return IRArrowFunction(params=params, body=body, line=self._line(node))
```

---

### SAVE AND TRY

Test one transform manually before running the full test suite:

```
> python -c "
import ast
from compiler.transformer import Transformer

src = 'def f():\n    if x > 0:\n        return x\n    else:\n        return 0\n'
tree = ast.parse(src)
t = Transformer()
ir = t.transform_module(tree)
print(ir.functions[0].body[0])
"
```

**Expected output:** An `IRIf` node with a `test` field showing the `x > 0` comparison and non-empty `body` and `orelse` tuples. If you see `AttributeError`, confirm you added all four transform methods (`transform_If`, `transform_For`, `transform_While`, `transform_ListComp`, `transform_Lambda`).

---

## Step 3 — Write the Tests

Add to `compiler/tests/test_transformer.py` (or create a separate `test_transformer_control.py`):

```python
# Add these tests to test_transformer.py

def test_if_statement():
    source = "def f():\n    if x > 0:\n        return x\n    else:\n        return 0\n"
    m = _t(source)
    stmt = m.functions[0].body[0]
    assert isinstance(stmt, IRIf)
    assert isinstance(stmt.test, IRBinOp)
    assert stmt.test.op == ">"
    assert len(stmt.body) == 1
    assert len(stmt.orelse) == 1


def test_if_no_else():
    source = "def f():\n    if done:\n        return True\n"
    m = _t(source)
    stmt = m.functions[0].body[0]
    assert isinstance(stmt, IRIf)
    assert stmt.orelse == ()


def test_elif_is_nested_if():
    source = (
        "def f():\n"
        "    if a:\n"
        "        return 1\n"
        "    elif b:\n"
        "        return 2\n"
        "    else:\n"
        "        return 3\n"
    )
    m = _t(source)
    outer = m.functions[0].body[0]
    assert isinstance(outer, IRIf)
    # elif becomes a nested IRIf in orelse
    assert len(outer.orelse) == 1
    inner = outer.orelse[0]
    assert isinstance(inner, IRIf)


def test_for_loop():
    source = "def f():\n    for item in items:\n        process(item)\n"
    m = _t(source)
    stmt = m.functions[0].body[0]
    assert isinstance(stmt, IRFor)
    assert stmt.target == "item"
    assert stmt.iter == IRVariable(name="items")
    assert len(stmt.body) == 1


def test_list_comprehension_becomes_map():
    source = "def f():\n    return [x * 2 for x in items]\n"
    m = _t(source)
    ret = m.functions[0].body[0]
    assert isinstance(ret, IRReturn)
    call = ret.value
    assert isinstance(call, IRCall)
    assert isinstance(call.func, IRMemberAccess)
    assert call.func.attr == "map"
    # The argument is an arrow function
    assert len(call.args) == 1
    assert isinstance(call.args[0], IRArrowFunction)
    arrow = call.args[0]
    assert arrow.params == ("x",)


def test_lambda_becomes_arrow():
    source = "def f():\n    double = lambda x: x * 2\n"
    m = _t(source)
    assign = m.functions[0].body[0]
    assert isinstance(assign, IRAssign)
    assert isinstance(assign.value, IRArrowFunction)
    arrow = assign.value
    assert arrow.params == ("x",)


def test_bool_and():
    source = "def f():\n    return a and b\n"
    m = _t(source)
    op = m.functions[0].body[0].value
    assert isinstance(op, IRBinOp)
    assert op.op == "&&"


def test_bool_or():
    source = "def f():\n    return a or b\n"
    m = _t(source)
    op = m.functions[0].body[0].value
    assert isinstance(op, IRBinOp)
    assert op.op == "||"
```

Add these to the test runner list and run:

```
> python compiler/tests/test_transformer.py
```

**Expected output:** Previous 19 pass, plus the 8 new tests.

---

### SAVE AND TRY

```
> python compiler/tests/test_transformer.py
```

**Expected output:**
```
  PASS  test_function_def
  ...  (19 prior tests)
  PASS  test_if_statement
  PASS  test_if_no_else
  PASS  test_elif_is_nested_if
  PASS  test_for_loop
  PASS  test_list_comprehension_becomes_map
  PASS  test_lambda_becomes_arrow
  PASS  test_bool_and
  PASS  test_bool_or

27 passed, 0 failed
```

If any test fails, read its assertion message — it tells you which IR node type was expected and which was produced.

---

## Challenge: Add `IRWhile` to the IR

**You know:** The `transform_While` method currently emits `IRIf` with a comment saying "this is a hack." The correct solution is a dedicated `IRWhile` IR node.

**Task:**
1. Add `IRWhile` to `compiler/ir.py`
2. Update `transform_While` in `transformer.py` to return `IRWhile`
3. Write a test that verifies a while loop transforms to `IRWhile`

**`IRWhile` should have:**
- `test: IRNode` — the loop condition
- `body: tuple[IRNode, ...]` — the loop body

---

<details>
<summary>▶ Show Solution</summary>

**In `ir.py`:**
```python
@dataclass(frozen=True)
class IRWhile(IRNode):
    """A while loop.
    
    Python: while condition: body
    JS:     while (condition) { body }
    """
    test: IRNode = field(default_factory=lambda: IRConstant())
    body: tuple[IRNode, ...] = ()
```

**In `transformer.py`, replace `transform_While`:**
```python
def transform_While(self, node: ast.While) -> IRWhile:
    test = self.transform(node.test)
    body = []
    for stmt in node.body:
        ir = self.transform(stmt)
        if ir is not None:
            body.append(ir)
    return IRWhile(test=test, body=tuple(body), line=self._line(node))
```

**Test:**
```python
def test_while_loop():
    source = "def f():\n    while running:\n        step()\n"
    m = _t(source)
    stmt = m.functions[0].body[0]
    assert isinstance(stmt, IRWhile)
    assert stmt.test == IRVariable(name="running")
```

**Key insight:** The "do not add IR nodes for hypothetical future requirements" principle applies here in reverse — the hack in the lab is a real problem that you are fixing immediately. The principle is about avoiding premature generalisation, not avoiding fixing actual bugs. A while loop that generates the wrong IR is a bug; fixing it by adding the right IR node is exactly the right response.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `if/else` transforms correctly | `if x: return 1` → `IRIf` with body and empty orelse |
| `elif` becomes nested `IRIf` | `if a: ... elif b: ...` → `IRIf.orelse` contains another `IRIf` |
| `for` loop transforms | `for x in items: ...` → `IRFor(target="x", iter=IRVariable("items"))` |
| List comprehension → `.map()` | `[x*2 for x in items]` → `IRCall` with `IRMemberAccess(attr="map")` |
| Arrow function has correct params | The `.map()` argument is `IRArrowFunction(params=("x",), ...)` |
| `and` → `&&`, `or` → `||` | `a and b` → `IRBinOp(op="&&", ...)` |
| All tests pass | 27 total transformer tests pass |

---

## Your Complete Files

### New / changed files this lab

**`compiler/ir.py`** — add `IRArrowFunction` after `IRFunction` (full definition in Step 1).

**`compiler/transformer.py`** — add five new methods: `transform_If`, `transform_For`, `transform_While`, `transform_ListComp`, `transform_Lambda` (full methods in Step 2). Update the import line at the top to include `IRArrowFunction`.

**`compiler/tests/test_transformer.py`** — add eight new test functions (full tests in Step 3).

### Project structure at end of Lab 09

```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py
│   ├── codegen_preprocessor.py
│   ├── errors.py
│   ├── ir.py              ← updated (IRArrowFunction added)
│   ├── lexer.py
│   ├── nodes.py
│   ├── parser.py
│   ├── preprocessor.py
│   ├── tokens.py
│   ├── transformer.py     ← updated (control flow transforms added)
│   └── tests/
│       ├── __init__.py
│       ├── test_codegen_preprocessor.py
│       ├── test_lexer.py
│       ├── test_parser.py
│       └── test_transformer.py  ← updated (8 new tests)
├── examples/
│   ├── counter.pyx
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. How does the Python AST represent `elif`?**

`elif` is not a separate AST node. It is represented as a nested `If` node inside the `orelse` field of the outer `If`. `if a: ... elif b: ... else: ...` becomes `If(test=a, body=[...], orelse=[If(test=b, body=[...], orelse=[...])])`. The `orelse` of the outer `If` contains exactly one `If` node. The transformer handles this naturally: `transform_If` transforms each `node.orelse` statement, and if that statement is an `If`, it recursively calls `transform_If` again. The nested `IRIf` in the output mirrors this structure exactly.

**2. Which JavaScript form should PyX emit for Python `for` loops?**

`for (const x of items)` — the `for...of` loop. Python's `for x in items` iterates over any iterable (lists, generators, sets). JavaScript's `for...of` does the same. JavaScript's C-style `for (let i = 0; ...)` is for index-based loops and has no Python equivalent. PyX components typically iterate over arrays (lists of data items), where `for...of` is semantically identical to Python's `for...in`.

**3. Is the `.map()` mapping for list comprehensions safe? What would break?**

The simple case is safe: `[expr(x) for x in items]` → `items.map((x) => expr(x))` produces identical results. What breaks:

- Filtered comprehensions: `[x for x in items if x > 0]` — no `.map()` equivalent; needs `.filter().map()`. The lab's transformer emits an error for this.
- Multi-variable comprehensions: `[(x, y) for x in xs for y in ys]` — no direct `.map()` equivalent; needs nested `.flatMap()`. Unsupported.
- Generator comprehensions: `(x for x in items)` — in PyX, these are likely unintentional; emits an error.
- Dictionary comprehensions: `{k: v for k, v in pairs}` — JavaScript `Object.fromEntries(pairs.map(...))`. Unsupported in v1.0.

The semantic mapping is documented as a design choice. PyX's position: the common case (transform a list of data items) works correctly. The uncommon cases produce clear error messages.

---

*End of LAB 09.*

*Lab 10 handles imports and the `h()` call recognition — the critical bridge between Phase 1 (the pre-processor, which produced `h()` calls) and Phase 2 (the transformer, which turns those calls into `IRElement` nodes). After Lab 10, the transformer handles a complete `.pyx` component with imports and elements.*
