# PyX — LAB 07 — The PyX Intermediate Representation

**Prerequisites:** Lab 06 complete. You can read a Python AST and identify `FunctionDef`, `Assign`, `Call`, `ImportFrom`, and `Return` nodes.

**What this lab adds:**
- `ir.py` — every IR node type defined as a frozen Python dataclass
- Understanding of why compilers use two ASTs
- The full mapping from Python AST node types to PyX IR node types
- A visual reference you will use in every transformer lesson (Labs 08–11)

**Time:** 45–60 minutes. This lab defines data structures; the next lab writes the transformer that produces them.

---

## What You Will Build

A module `compiler/ir.py` containing 14 dataclass node types that represent JavaScript/JSX constructs:

```python
# Python AST (what goes in):
FunctionDef(name='Counter', args=..., body=[...])

# PyX IR (what comes out):
IRFunction(name='Counter', params=[], body=[...])

# JSX output (what code generation produces from the IR):
"function Counter() { ... }"
```

The IR is the bridge. Its node types match the JavaScript output language, not the Python input language. This makes the code generator (Lab 12) simple: it only needs to know about IR nodes and JavaScript syntax, not about Python syntax.

---

> **Quick Check — try to answer before reading further:**
>
> 1. Python has `lambda` functions. JavaScript has arrow functions (`x => x + 1`). They are similar concepts. Should the IR have an `IRLambda` node or an `IRArrowFunction` node? Which choice makes the code generator simpler?
> 2. Python list comprehensions (`[x*2 for x in items]`) have no direct JavaScript equivalent. How could an IR represent this so the code generator can emit correct JavaScript?
> 3. Python uses `None`; JavaScript uses `null`. Should the IR use `IRNone` or `IRNull`? Why does this choice matter?
>
> *(Answers at the end of this lab)*

---

## Concept: Why Two ASTs?

**What it is:** A compiler that transforms one high-level language to another typically uses two ASTs: a **source AST** (mirrors the input language) and a **target AST** (mirrors the output language). The stage in between — the transformer — maps source AST nodes to target AST nodes.

**Why not go directly from source AST to output string?**

You could. It would work. It would also mean the transformer would need to know about JavaScript string syntax, indentation rules, how to format JSX props, when to use `const` vs `let`, and how to handle the JSX fragment syntax — all mixed in with the logic for mapping Python concepts to JavaScript concepts.

With an IR, the transformer only asks: "what is the JavaScript equivalent of this Python concept?" It produces IR nodes. The code generator (a separate module) only asks: "how do I write this IR node as JavaScript?" It produces strings.

Each module has one job and knows about one thing.

**The source AST is Python's.** You did not write it. `ast.parse` produces it. Its node types were designed to represent Python code.

**The target AST is the IR.** You are writing it now. Its node types are designed to represent the JSX code that `pyxc` outputs. This gives you control — you can add an `IRElement` node that has no Python AST equivalent and no direct JavaScript equivalent but is the right intermediate form for the code generator.

**Watch for:** The IR is a design choice. There is no single correct IR. A real compiler (like TypeScript) uses a much more detailed IR with dozens of node types. PyX's IR covers only the Python constructs that `.pyx` components typically use. An unsupported construct (like `try/except`) produces an error in the transformer (Lab 11), not a broken IR node.

---

## Concept: Frozen Dataclasses

**What it is:** A **frozen dataclass** is a dataclass where every instance is immutable after creation. Once you set `node.name = "Counter"` in the constructor, no code can later do `node.name = "Broken"`. Attempts to modify a frozen dataclass field raise `FrozenInstanceError`.

**Why frozen?**

AST nodes should be values, not mutable objects. A transformer that produces an IR does not need to mutate the nodes it creates — it creates new nodes as needed. Immutability prevents a class of bugs where a function that "should not" modify a node accidentally does.

**The syntax:**

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class IRConstant:
    value: int | float | str | bool | None
```

`frozen=True` is added as a keyword argument to `@dataclass`.

**`field(default_factory=...)` for mutable defaults:**

Dataclasses cannot have mutable default values (like `[]`) directly, because every instance would share the same list. Instead, use `field(default_factory=list)`:

```python
from dataclasses import dataclass, field

@dataclass(frozen=True)
class IRFunction:
    name: str
    params: tuple[str, ...]  # tuples (immutable) are fine as defaults
    body: tuple              # frozen dataclasses use tuples, not lists
```

Actually, frozen dataclasses work better with tuples for collections (since tuples are immutable). You will see this in the IR definitions below.

**Watch for:** Frozen dataclasses generate a `__hash__` method automatically (because immutable objects can be hashed). This means IR nodes can be used as dictionary keys or stored in sets — useful for the reconciler in Lab 20.

---

## Step 1 — Write `compiler/ir.py`

Create `compiler/ir.py`:

```python
"""
PyX Intermediate Representation (IR)

The IR is a tree of immutable nodes that represents JavaScript/JSX code.
The transformer (transformer.py) produces IR from a Python AST.
The code generator (codegen.py) produces JSX strings from IR.

Each node has a `line` field for source location tracking.
The default is 0 (unknown) — the transformer fills it in.
"""
from __future__ import annotations
from dataclasses import dataclass, field


# ── Base ─────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class IRNode:
    """Base class for all IR nodes."""
    line: int = field(default=0, compare=False)
    # compare=False: line numbers are excluded from equality checks.
    # Two IRConstant(value=1, line=3) and IRConstant(value=1, line=7) are equal.


# ── Values ───────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class IRConstant(IRNode):
    """A literal value: number, string, boolean, or null.
    
    Python: 42, "hello", True, None
    JS:     42, "hello", true, null
    """
    value: int | float | str | bool | None = None


@dataclass(frozen=True)
class IRVariable(IRNode):
    """A variable reference.
    
    Python: count
    JS:     count
    """
    name: str = ""


@dataclass(frozen=True)
class IRBinOp(IRNode):
    """A binary operation: left op right.
    
    Python: count + 1
    JS:     count + 1
    """
    left: IRNode = field(default_factory=lambda: IRConstant())
    op: str = "+"
    right: IRNode = field(default_factory=lambda: IRConstant())


@dataclass(frozen=True)
class IRCall(IRNode):
    """A function call.
    
    Python: useState(0)
    JS:     useState(0)
    """
    func: IRNode = field(default_factory=lambda: IRVariable())
    args: tuple[IRNode, ...] = ()
    kwargs: tuple[tuple[str, IRNode], ...] = ()


@dataclass(frozen=True)
class IRMemberAccess(IRNode):
    """Attribute access: obj.attr.
    
    Python: obj.method
    JS:     obj.method
    """
    obj: IRNode = field(default_factory=lambda: IRVariable())
    attr: str = ""


# ── Statements ────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class IRAssign(IRNode):
    """A variable assignment.
    
    Python: count = 0
    JS:     const count = 0   (or let for loop vars)
    """
    targets: tuple[str, ...] = ()  # variable names being assigned to
    value: IRNode = field(default_factory=lambda: IRConstant())
    is_const: bool = True  # True → const, False → let


@dataclass(frozen=True)
class IRReturn(IRNode):
    """A return statement.
    
    Python: return element
    JS:     return element
    """
    value: IRNode | None = None


@dataclass(frozen=True)
class IRIf(IRNode):
    """An if/else statement.
    
    Python: if condition: ... else: ...
    JS:     if (condition) { ... } else { ... }
    """
    test: IRNode = field(default_factory=lambda: IRConstant())
    body: tuple[IRNode, ...] = ()
    orelse: tuple[IRNode, ...] = ()


@dataclass(frozen=True)
class IRFor(IRNode):
    """A for loop over an iterable.
    
    Python: for item in items: ...
    JS:     for (const item of items) { ... }
    """
    target: str = ""
    iter: IRNode = field(default_factory=lambda: IRVariable())
    body: tuple[IRNode, ...] = ()


@dataclass(frozen=True)
class IRExprStatement(IRNode):
    """A standalone expression used as a statement.
    
    Python: set_count(count + 1)   (call used as statement)
    JS:     set_count(count + 1);
    """
    expr: IRNode = field(default_factory=lambda: IRConstant())


# ── Functions ─────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class IRFunction(IRNode):
    """A function definition.
    
    Python: def Counter(): ...
    JS:     function Counter() { ... }
    """
    name: str = ""
    params: tuple[str, ...] = ()
    body: tuple[IRNode, ...] = ()
    is_component: bool = False  # True if the name starts with a capital letter


# ── Imports ───────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class IRImport(IRNode):
    """An import statement.
    
    Python: from pyx import useState
    JS:     import { useState } from 'pyx-runtime'
    """
    source: str = ""           # the JS module path
    names: tuple[str, ...] = ()  # the names being imported


# ── Elements ──────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class IRElement(IRNode):
    """An h() element call — an element in the virtual DOM.
    
    Python (pre-processed): h("div", {"class": "app"}, child1, child2)
    JSX output:             h("div", {className: "app"}, child1, child2)
    """
    tag: str = ""
    props: tuple[tuple[str, IRNode], ...] = ()  # (name, value) pairs
    children: tuple[IRNode, ...] = ()


@dataclass(frozen=True)
class IRText(IRNode):
    """A text string child of an element.
    
    Python (pre-processed): "Hello"
    JSX output:             "Hello"
    """
    text: str = ""


# ── Module ────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class IRModule(IRNode):
    """The top-level module — the entire compiled file.
    
    JS output: import statements, then function declarations, then default export.
    """
    imports: tuple[IRImport, ...] = ()
    functions: tuple[IRFunction, ...] = ()
    # The name of the component to export as default (usually the last component defined)
    default_export: str = ""
```

---

### SAVE AND TRY

```
> python -c "
from compiler.ir import IRFunction, IRReturn, IRVariable, IRConstant
body = (IRReturn(value=IRConstant(value=42)),)
f = IRFunction(name='getAnswer', params=(), body=body)
print(f)
print('name:', f.name)
print('body[0]:', f.body[0])
"
```

**Expected output:**
```
IRFunction(line=0, name='getAnswer', params=(), body=(IRReturn(line=0, value=IRConstant(line=0, value=42)),), is_component=False)
name: getAnswer
body[0]: IRReturn(line=0, value=IRConstant(line=0, value=42))
```

---

## Step 2 — Verify Immutability

```
> python -c "
from compiler.ir import IRConstant
c = IRConstant(value=42)
c.value = 99
"
```

**Expected output:**
```
dataclasses.FrozenInstanceError: cannot assign to field 'value'
```

The frozen dataclass correctly rejects mutation. An IR node cannot be accidentally modified once created.

---

## Step 3 — Write the IR Reference Tests

These tests document the complete Python → IR mapping. They are the specification that the transformer will implement.

Create `compiler/tests/test_ir.py`:

```python
from compiler.ir import (
    IRAssign, IRBinOp, IRCall, IRConstant, IRElement, IRFor,
    IRFunction, IRIf, IRImport, IRMemberAccess, IRModule, IRNode,
    IRReturn, IRText, IRVariable, IRExprStatement,
)


def test_constant():
    assert IRConstant(value=42).value == 42
    assert IRConstant(value="hello").value == "hello"
    assert IRConstant(value=True).value is True
    assert IRConstant(value=None).value is None


def test_variable():
    v = IRVariable(name="count")
    assert v.name == "count"


def test_binop():
    op = IRBinOp(
        left=IRVariable(name="count"),
        op="+",
        right=IRConstant(value=1),
    )
    assert op.op == "+"
    assert isinstance(op.left, IRVariable)
    assert isinstance(op.right, IRConstant)


def test_assign():
    a = IRAssign(
        targets=("count",),
        value=IRConstant(value=0),
        is_const=True,
    )
    assert a.targets == ("count",)
    assert a.is_const is True


def test_function():
    f = IRFunction(
        name="Counter",
        params=("props",),
        body=(IRReturn(value=IRConstant(value=None)),),
        is_component=True,
    )
    assert f.name == "Counter"
    assert f.is_component is True
    assert len(f.body) == 1


def test_import():
    imp = IRImport(source="pyx-runtime", names=("useState", "useEffect"))
    assert imp.source == "pyx-runtime"
    assert "useState" in imp.names


def test_element():
    elem = IRElement(
        tag="div",
        props=(("className", IRConstant(value="app")),),
        children=(IRText(text="Hello"),),
    )
    assert elem.tag == "div"
    assert elem.props[0] == ("className", IRConstant(value="app"))
    assert elem.children[0] == IRText(text="Hello")


def test_frozen():
    c = IRConstant(value=42)
    try:
        c.value = 99  # type: ignore
        assert False, "Should have raised FrozenInstanceError"
    except Exception as e:
        assert "cannot assign" in str(e).lower() or "frozen" in str(e).lower()


def test_equality():
    """Two IR nodes with the same structure are equal (line number excluded)."""
    a = IRConstant(value=42, line=1)
    b = IRConstant(value=42, line=99)
    assert a == b  # line is excluded from comparison


def test_module():
    m = IRModule(
        imports=(IRImport(source="pyx-runtime", names=("useState",)),),
        functions=(
            IRFunction(name="App", params=(), body=(), is_component=True),
        ),
        default_export="App",
    )
    assert len(m.imports) == 1
    assert len(m.functions) == 1
    assert m.default_export == "App"


if __name__ == "__main__":
    tests = [
        test_constant, test_variable, test_binop, test_assign,
        test_function, test_import, test_element, test_frozen,
        test_equality, test_module,
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
> python compiler/tests/test_ir.py
```

**Expected output:**
```
  PASS  test_constant
  PASS  test_variable
  PASS  test_binop
  PASS  test_assign
  PASS  test_function
  PASS  test_import
  PASS  test_element
  PASS  test_frozen
  PASS  test_equality
  PASS  test_module

10 passed, 0 failed
```

---

## The Mapping Table

This is your reference for Labs 08–11. For every Python AST node type, here is the IR node it maps to:

| Python AST | PyX IR | Notes |
|---|---|---|
| `Module` | `IRModule` | imports sorted first, then functions |
| `FunctionDef` | `IRFunction` | `is_component=True` if name starts uppercase |
| `Return` | `IRReturn` | |
| `Assign(targets=[Name])` | `IRAssign(targets=(name,))` | single target |
| `Assign(targets=[Tuple])` | `IRAssign(targets=(a, b, ...))` | tuple unpack |
| `AugAssign` | `IRAssign` | converts `x += 1` to `x = x + 1` |
| `Name (Load)` | `IRVariable` | |
| `Constant` | `IRConstant` | None → null in JS |
| `Call` | `IRCall` | special case: `h(...)` → `IRElement` |
| `BinOp` | `IRBinOp` | Python operator names → JS symbols |
| `If` | `IRIf` | |
| `For` | `IRFor` | Python `for x in y` → JS `for (const x of y)` |
| `ListComp` | `IRCall(func=IRMemberAccess(iter, "map"))` | `[x for x in items]` → `items.map(x => x)` |
| `ImportFrom (pyx)` | `IRImport(source="pyx-runtime")` | module name translated |
| `ImportFrom (other)` | `IRImport(source=module)` | preserved as-is |
| `Expr (Call statement)` | `IRExprStatement` | a call used as a statement |
| `Attribute` | `IRMemberAccess` | `obj.attr` |

**Special cases:**

- `h(tag, props, ...children)` calls (from the pre-processor) → `IRElement`
- `None` → `IRConstant(value=None)` → JS `null`
- `True` / `False` → `IRConstant(value=True/False)` → JS `true` / `false`
- `class` prop → `className` prop (HTML attribute name mapping)

---

## Challenge: Design an IR Node for a Ternary

**You know:** Python has no ternary operator. Instead it has: `value_if_true if condition else value_if_false`. JavaScript has: `condition ? value_if_true : value_if_false`. They are the same concept with different syntax.

**Task:** Design an `IRTernary` dataclass node for this construct. Then write a test that creates an `IRTernary` and verifies its fields.

**Hint:** What fields does a ternary need? What types should they be?

---

<details>
<summary>▶ Show Solution</summary>

```python
@dataclass(frozen=True)
class IRTernary(IRNode):
    """A conditional (ternary) expression.
    
    Python: x if condition else y
    JS:     condition ? x : y
    """
    test: IRNode = field(default_factory=lambda: IRConstant())
    consequent: IRNode = field(default_factory=lambda: IRConstant())
    alternate: IRNode = field(default_factory=lambda: IRConstant())
```

Test:
```python
from compiler.ir import IRTernary, IRVariable, IRConstant

t = IRTernary(
    test=IRVariable(name="isLoggedIn"),
    consequent=IRConstant(value="Welcome"),
    alternate=IRConstant(value="Please log in"),
)
assert t.test == IRVariable(name="isLoggedIn")
assert t.consequent == IRConstant(value="Welcome")
```

**Key insight:** This node is not in the lab's main `ir.py` yet because the transformer does not handle Python ternaries until a later version. But the IR is designed to be extended — adding a new node type requires only adding the dataclass. No other code needs to change until you write the transformer case and the code generator case for it.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `ir.py` imports without error | `from compiler.ir import IRModule` works |
| Frozen nodes reject mutation | `IRConstant(value=1).value = 2` raises `FrozenInstanceError` |
| Equality ignores line numbers | `IRConstant(value=1, line=1) == IRConstant(value=1, line=9)` is True |
| `IRElement` stores tuple props | `IRElement("div", (("className", IRConstant("app")),), ())` works |
| All 10 IR tests pass | `python compiler/tests/test_ir.py` shows "10 passed, 0 failed" |

---

## Your Complete Files

### `compiler/ir.py`
*(full file as written in Step 1)*

### `compiler/tests/test_ir.py`
*(full file as written in Step 3)*

### Project structure at end of Lab 07
```
pyx/
├── compiler/
│   ├── ir.py              ← new
│   └── tests/
│       ├── test_ir.py     ← new
│       └── ... (previous tests unchanged)
└── ... (all other files unchanged)
```

---

## Quick Check Answers

**1. Should the IR have `IRLambda` or `IRArrowFunction`?**

`IRArrowFunction`. The IR mirrors the output language (JavaScript/JSX), not the input language (Python). The code generator only knows about IR nodes and JavaScript syntax. If the IR had `IRLambda`, the code generator would need to know that "a lambda becomes an arrow function" — that mapping belongs in the transformer, not the code generator. With `IRArrowFunction`, the code generator just emits `(params) => body`. The transformer handles the Python→IR mapping: Python `lambda` → `IRArrowFunction`.

**2. How can the IR represent list comprehensions so the code generator can emit `.map()`?**

Map the comprehension to an `IRCall` of `.map()` on the iterable. `[x*2 for x in items]` becomes `IRCall(func=IRMemberAccess(obj=IRVariable("items"), attr="map"), args=(IRArrowFunction(...),))`. The code generator emits this as `items.map((x) => x * 2)`. The key insight: the IR does not need a "list comprehension" node — it uses a function call node, which the code generator already knows how to emit. The transformer makes the semantic decision (comprehension = `.map`); the code generator just emits calls.

**3. Should the IR use `IRNone` or `IRNull`? Why does the choice matter?**

`IRConstant(value=None)` with the code generator emitting `null` for `None` values. The reason the choice matters: the code generator must emit the correct JavaScript. JavaScript has two "empty" values: `null` and `undefined`. Python has one: `None`. If the IR had `IRNone`, the code generator would still need to decide "does `IRNone` become `null` or `undefined`?" — the same problem, just renamed. Using `IRConstant(value=None)` and handling the `None` case in the code generator is cleaner: the code generator knows the rule (`None` → `null`) in one place.

---

*End of LAB 07.*

*Lab 08 writes the transformer — the module that walks a Python AST and produces a PyX IR. You will implement `visit_FunctionDef`, `visit_Assign`, `visit_Return`, `visit_BinOp`, and `visit_Name`. By the end, a function with arithmetic operations transforms to the correct IR.*
