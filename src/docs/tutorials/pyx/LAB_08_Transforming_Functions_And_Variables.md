# PyX — LAB 08 — Transforming Functions and Variables

**Prerequisites:** Lab 07 complete. `python compiler/tests/test_ir.py` shows "10 passed, 0 failed." You can read Python ASTs and know every IR node type.

**What this lab adds:**
- `compiler/transformer.py` — a `Transformer` class that walks a Python AST and produces a PyX IR
- Transformation of: `FunctionDef`, `Return`, `Assign` (single and tuple), `Name`, `Constant`, `BinOp`, `Call`, `Attribute`
- Tests that verify each transformation produces the correct IR

**Time:** 90–120 minutes. This is the most technically dense lab in Phase 2 — take it at the pace you need.

---

## What You Will Build

A `Transformer` class with methods like `transform_FunctionDef`, `transform_Assign`, `transform_Return` — each taking a Python AST node and returning the corresponding IR node.

```python
# Input: Python AST node for `def Counter(): return 0`
# (produced by ast.parse after pre-processing)

FunctionDef(
    name='Counter',
    args=arguments(args=[], ...),
    body=[Return(value=Constant(value=0))]
)

# Output: IR node
IRFunction(
    name='Counter',
    params=(),
    body=(IRReturn(value=IRConstant(value=0)),),
    is_component=True  # 'Counter' starts with uppercase
)
```

The transformer is pure: given the same input AST, it always produces the same IR. No side effects. This makes it testable in isolation without a file system.

---

> **Quick Check — try to answer before reading further:**
>
> 1. The transformer takes a Python AST node and returns an IR node. For a `FunctionDef` that contains other statements in its body, how does the transformer handle those inner statements?
> 2. Python's `True`, `False`, and `None` are all represented as `Constant` nodes in the AST (since Python 3.8). How should the transformer handle them differently from number literals?
> 3. `ast.NodeTransformer` (from the `ast` module) visits an AST and can replace nodes. Would using it be the right approach for PyX's transformer? Why or why not?
>
> *(Answers at the end of this lab)*

---

## Concept: The Transformer as a Visitor

**What it is:** The PyX transformer is a class where each method transforms one type of Python AST node into the corresponding IR node. A central `transform` method dispatches to the right method by node type.

**Why not use `ast.NodeTransformer`:**

`ast.NodeTransformer` is designed to modify a Python AST and return a modified Python AST. Its `visit_X` methods return Python AST nodes. PyX's transformer returns IR nodes — a completely different type. Using `ast.NodeTransformer` would be fighting against its design.

Instead, PyX's transformer is a plain class with a `transform(node)` dispatcher:

```python
def transform(self, node: ast.AST) -> IRNode:
    method_name = f"transform_{type(node).__name__}"
    method = getattr(self, method_name, self.transform_unsupported)
    return method(node)
```

`type(node).__name__` gives `"FunctionDef"` for a `FunctionDef` node, `"Assign"` for an `Assign` node, etc. `getattr` looks up the corresponding method on the transformer instance. If no method exists, `transform_unsupported` raises an error.

**The recursive structure:**

`transform_FunctionDef` calls `self.transform(stmt)` for each statement in the function body. `transform_Assign` calls `self.transform(node.value)` to transform the right-hand side. The recursion depth matches the nesting depth of the AST.

This is the same mutual recursion as the parser and code generator — all three use the tree visitor pattern.

**Watch for:** Every `transform_X` method receives the specific AST node type for `X`. You do not need to check `isinstance` inside the method — the dispatcher already did that. If `transform_BinOp` is called, you know `node` is a `BinOp`. This is the benefit of method dispatch over an if/elif chain.

---

## Concept: Python Operators in the AST

**What it is:** Python's `ast` module represents binary operators as separate node types inside a `BinOp`. `1 + 2` is `BinOp(left=Constant(1), op=Add(), right=Constant(2))`. The `op` field is an object, not a string.

The Python operators you will encounter and their JavaScript equivalents:

| Python AST `op` | Python source | JS output |
|---|---|---|
| `ast.Add()` | `a + b` | `a + b` |
| `ast.Sub()` | `a - b` | `a - b` |
| `ast.Mult()` | `a * b` | `a * b` |
| `ast.Div()` | `a / b` | `a / b` |
| `ast.FloorDiv()` | `a // b` | `Math.floor(a / b)` |
| `ast.Mod()` | `a % b` | `a % b` |
| `ast.Pow()` | `a ** b` | `Math.pow(a, b)` |
| `ast.Eq()` | `a == b` | `a === b` (strict equality) |
| `ast.NotEq()` | `a != b` | `a !== b` |
| `ast.Lt()` | `a < b` | `a < b` |
| `ast.LtE()` | `a <= b` | `a <= b` |
| `ast.Gt()` | `a > b` | `a > b` |
| `ast.GtE()` | `a >= b` | `a >= b` |
| `ast.And()` | `a and b` | `a && b` |
| `ast.Or()` | `a or b` | `a \|\| b` |
| `ast.Not()` | `not a` | `!a` |

Note: Python `==` becomes JavaScript `===` (strict equality). Python's `==` is already strict for most types; JavaScript's `==` performs type coercion. This is a semantic mapping decision: PyX always emits `===` for `==` because PyX components do not rely on JavaScript's type coercion rules.

**Watch for:** `Compare` nodes (like `x > 0`) are different from `BinOp` in the Python AST. `BinOp` is for arithmetic. `Compare` is for comparisons. A `Compare` has a `left`, a list of `ops`, and a list of `comparators`. You will handle `Compare` in this lab as well.

---

## Step 1 — Write the Transformer Skeleton

Create `compiler/transformer.py`:

```python
"""
PyX Transformer

Walks a Python AST (produced by ast.parse on pre-processed .pyx source)
and produces a PyX IR tree.
"""
from __future__ import annotations
import ast
from compiler.ir import (
    IRAssign, IRBinOp, IRCall, IRConstant, IRElement, IRExprStatement,
    IRFor, IRFunction, IRIf, IRImport, IRMemberAccess, IRModule,
    IRNode, IRReturn, IRText, IRVariable,
)


# Mapping from Python operator AST types to JS operator strings
_BINOP_MAP: dict[type, str] = {
    ast.Add:      "+",
    ast.Sub:      "-",
    ast.Mult:     "*",
    ast.Div:      "/",
    ast.Mod:      "%",
    ast.Eq:       "===",
    ast.NotEq:    "!==",
    ast.Lt:       "<",
    ast.LtE:      "<=",
    ast.Gt:       ">",
    ast.GtE:      ">=",
    ast.And:      "&&",
    ast.Or:       "||",
}

# PyX module names → JS package names
_MODULE_MAP: dict[str, str] = {
    "pyx": "pyx-runtime",
}


class PyXError(Exception):
    """Raised for unsupported Python constructs in .pyx files."""

    def __init__(self, message: str, line: int = 0, filename: str = "<unknown>") -> None:
        self.pyx_line = line
        self.filename = filename
        super().__init__(message)

    def format(self) -> str:
        return f"pyxc: error in {self.filename} line {self.pyx_line}:\n  {self}"


class Transformer:
    """
    Transforms a Python AST Module into a PyX IRModule.
    
    Usage:
        t = Transformer(filename="counter.pyx")
        ir_module = t.transform_module(ast.parse(preprocessed_source))
    """

    def __init__(self, filename: str = "<unknown>") -> None:
        self.filename = filename
        self._errors: list[PyXError] = []

    def transform_module(self, module: ast.Module) -> IRModule:
        """Transform a top-level Module node into an IRModule."""
        imports: list[IRImport] = []
        functions: list[IRFunction] = []
        default_export = ""

        for node in module.body:
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                ir_import = self.transform(node)
                if ir_import is not None:
                    imports.append(ir_import)
            elif isinstance(node, ast.FunctionDef):
                ir_func = self.transform(node)
                if ir_func is not None:
                    functions.append(ir_func)
                    if ir_func.is_component:
                        default_export = ir_func.name
            else:
                # Other top-level statements are silently skipped for now.
                # Lab 11 adds error messages for unsupported constructs.
                pass

        return IRModule(
            imports=tuple(imports),
            functions=tuple(functions),
            default_export=default_export,
        )

    def transform(self, node: ast.AST) -> IRNode | None:
        """Dispatch to the correct transform_X method based on node type."""
        method_name = f"transform_{type(node).__name__}"
        method = getattr(self, method_name, self.transform_unsupported)
        return method(node)

    def transform_unsupported(self, node: ast.AST) -> None:
        """Called for any AST node type that has no transform method."""
        line = getattr(node, "lineno", 0)
        node_type = type(node).__name__
        error = PyXError(
            f"Unsupported Python construct: {node_type}. "
            f"PyX v1.0 does not support {node_type}.",
            line=line,
            filename=self.filename,
        )
        self._errors.append(error)
        return None

    def _line(self, node: ast.AST) -> int:
        return getattr(node, "lineno", 0)
```

---

## Step 2 — Transform Functions and Variables

Add these methods to the `Transformer` class in `transformer.py`:

```python
    # ── Functions ─────────────────────────────────────────────────────────

    def transform_FunctionDef(self, node: ast.FunctionDef) -> IRFunction:
        """Transform a Python function definition to IRFunction."""
        # Extract parameter names (simple positional args only for now)
        params = tuple(arg.arg for arg in node.args.args)

        # Transform each statement in the body
        body_nodes: list[IRNode] = []
        for stmt in node.body:
            ir_node = self.transform(stmt)
            if ir_node is not None:
                body_nodes.append(ir_node)

        # A component has an uppercase name (Counter, App, Header)
        is_component = node.name[0].isupper() if node.name else False

        return IRFunction(
            name=node.name,
            params=params,
            body=tuple(body_nodes),
            is_component=is_component,
            line=self._line(node),
        )

    def transform_Return(self, node: ast.Return) -> IRReturn:
        """Transform a return statement."""
        value = self.transform(node.value) if node.value is not None else None
        return IRReturn(value=value, line=self._line(node))

    # ── Variables and Literals ─────────────────────────────────────────────

    def transform_Name(self, node: ast.Name) -> IRVariable | IRConstant:
        """Transform a variable reference or special name (True, False, None)."""
        # Python 3.8+ represents True, False, None as Constant nodes, but
        # older code may still produce Name nodes for them.
        if node.id == "True":
            return IRConstant(value=True, line=self._line(node))
        if node.id == "False":
            return IRConstant(value=False, line=self._line(node))
        if node.id == "None":
            return IRConstant(value=None, line=self._line(node))
        return IRVariable(name=node.id, line=self._line(node))

    def transform_Constant(self, node: ast.Constant) -> IRConstant:
        """Transform a literal value."""
        return IRConstant(value=node.value, line=self._line(node))

    # ── Operations ────────────────────────────────────────────────────────

    def transform_BinOp(self, node: ast.BinOp) -> IRBinOp:
        """Transform a binary arithmetic operation."""
        op_str = _BINOP_MAP.get(type(node.op), "???")
        if op_str == "???":
            # Floor division and power need special handling in code gen
            if isinstance(node.op, ast.FloorDiv):
                # floor(a / b) — emit as IRCall to Math.floor
                div = IRBinOp(
                    left=self.transform(node.left),
                    op="/",
                    right=self.transform(node.right),
                    line=self._line(node),
                )
                return IRCall(
                    func=IRMemberAccess(
                        obj=IRVariable(name="Math"),
                        attr="floor",
                    ),
                    args=(div,),
                    line=self._line(node),
                )
        return IRBinOp(
            left=self.transform(node.left),
            op=op_str,
            right=self.transform(node.right),
            line=self._line(node),
        )

    def transform_Compare(self, node: ast.Compare) -> IRBinOp:
        """Transform a comparison expression.
        
        Only single comparisons are supported (x > 0).
        Chained comparisons (0 < x < 10) are not supported in PyX v1.0.
        """
        if len(node.ops) != 1:
            return self.transform_unsupported(node)
        op_str = _BINOP_MAP.get(type(node.ops[0]), "===")
        return IRBinOp(
            left=self.transform(node.left),
            op=op_str,
            right=self.transform(node.comparators[0]),
            line=self._line(node),
        )

    def transform_BoolOp(self, node: ast.BoolOp) -> IRBinOp:
        """Transform a boolean operation (and/or).
        
        Python: a and b and c → (a && b) && c (left-associative)
        """
        op_str = "&&" if isinstance(node.op, ast.And) else "||"
        # Fold multiple values left-to-right
        result: IRNode = self.transform(node.values[0])
        for value in node.values[1:]:
            result = IRBinOp(
                left=result,
                op=op_str,
                right=self.transform(value),
                line=self._line(node),
            )
        return result

    def transform_UnaryOp(self, node: ast.UnaryOp) -> IRBinOp | IRCall:
        """Transform a unary operation (not, -, +)."""
        if isinstance(node.op, ast.Not):
            # 'not x' becomes '!x' — represented as a special IRBinOp with empty left
            return IRBinOp(
                left=IRConstant(value=None),
                op="!",
                right=self.transform(node.operand),
                line=self._line(node),
            )
        if isinstance(node.op, ast.USub):
            # '-x' becomes '0 - x'
            return IRBinOp(
                left=IRConstant(value=0),
                op="-",
                right=self.transform(node.operand),
                line=self._line(node),
            )
        return self.transform_unsupported(node)

    # ── Assignments ────────────────────────────────────────────────────────

    def transform_Assign(self, node: ast.Assign) -> IRAssign | None:
        """Transform a variable assignment.
        
        Handles both single assignments (x = 1) and tuple unpacking (a, b = f()).
        """
        value = self.transform(node.value)
        if value is None:
            return None

        target = node.targets[0]  # PyX only handles single targets

        if isinstance(target, ast.Name):
            return IRAssign(
                targets=(target.id,),
                value=value,
                is_const=True,
                line=self._line(node),
            )

        elif isinstance(target, ast.Tuple):
            names = []
            for elt in target.elts:
                if isinstance(elt, ast.Name):
                    names.append(elt.id)
                else:
                    return self.transform_unsupported(node)
            return IRAssign(
                targets=tuple(names),
                value=value,
                is_const=True,
                line=self._line(node),
            )

        return self.transform_unsupported(node)

    def transform_AugAssign(self, node: ast.AugAssign) -> IRAssign | None:
        """Transform x += 1 into x = x + 1."""
        if not isinstance(node.target, ast.Name):
            return self.transform_unsupported(node)

        op_str = _BINOP_MAP.get(type(node.op), "+")
        var = IRVariable(name=node.target.id, line=self._line(node))
        rhs = self.transform(node.value)
        if rhs is None:
            return None

        new_value = IRBinOp(left=var, op=op_str, right=rhs, line=self._line(node))
        return IRAssign(
            targets=(node.target.id,),
            value=new_value,
            is_const=False,  # augmented assignments use let, not const
            line=self._line(node),
        )

    # ── Attribute access ───────────────────────────────────────────────────

    def transform_Attribute(self, node: ast.Attribute) -> IRMemberAccess:
        """Transform obj.attr access."""
        return IRMemberAccess(
            obj=self.transform(node.value),
            attr=node.attr,
            line=self._line(node),
        )

    # ── Calls ──────────────────────────────────────────────────────────────

    def transform_Call(self, node: ast.Call) -> IRCall | IRElement:
        """Transform a function call.
        
        Special case: h("tag", props, ...children) → IRElement
        """
        # Detect h() calls from the pre-processor
        if (
            isinstance(node.func, ast.Name)
            and node.func.id == "h"
            and node.args
            and isinstance(node.args[0], ast.Constant)
            and isinstance(node.args[0].value, str)
        ):
            return self._transform_h_call(node)

        func = self.transform(node.func)
        args = tuple(
            self.transform(arg)
            for arg in node.args
            if self.transform(arg) is not None
        )
        return IRCall(func=func, args=args, line=self._line(node))

    def _transform_h_call(self, node: ast.Call) -> IRElement:
        """Transform an h("tag", props, ...children) call to IRElement."""
        tag = node.args[0].value  # the tag name string

        # Second argument is the props dict
        props: list[tuple[str, IRNode]] = []
        if len(node.args) > 1 and isinstance(node.args[1], ast.Dict):
            props_dict = node.args[1]
            for key_node, val_node in zip(props_dict.keys, props_dict.values):
                if isinstance(key_node, ast.Constant):
                    key = key_node.value
                    # Map 'class' → 'className' for HTML elements
                    if key == "class" and tag[0].islower():
                        key = "className"
                    value = self.transform(val_node)
                    if value is not None:
                        props.append((key, value))

        # Remaining arguments are children
        children: list[IRNode] = []
        for child_node in node.args[2:]:
            child = self.transform(child_node)
            if child is not None:
                # Wrap plain string constants as IRText
                if isinstance(child, IRConstant) and isinstance(child.value, str):
                    children.append(IRText(text=child.value, line=child.line))
                else:
                    children.append(child)

        return IRElement(
            tag=tag,
            props=tuple(props),
            children=tuple(children),
            line=self._line(node),
        )

    # ── Expression statements ──────────────────────────────────────────────

    def transform_Expr(self, node: ast.Expr) -> IRExprStatement:
        """Transform a standalone expression used as a statement."""
        value = self.transform(node.value)
        if value is None:
            return None
        return IRExprStatement(expr=value, line=self._line(node))

    # ── Imports ────────────────────────────────────────────────────────────

    def transform_ImportFrom(self, node: ast.ImportFrom) -> IRImport | None:
        """Transform a 'from x import y' statement."""
        module = node.module or ""
        js_source = _MODULE_MAP.get(module, module)
        names = tuple(alias.name for alias in node.names)
        return IRImport(source=js_source, names=names, line=self._line(node))

    def transform_Import(self, node: ast.Import) -> IRImport | None:
        """Transform a plain 'import x' statement."""
        # Plain imports are uncommon in PyX components; handle the simplest case
        if node.names:
            name = node.names[0].name
            js_source = _MODULE_MAP.get(name, name)
            return IRImport(source=js_source, names=(name,), line=self._line(node))
        return None
```

---

## Step 3 — Write the Transformer Tests

Create `compiler/tests/test_transformer.py`:

```python
import ast
from compiler.transformer import Transformer
from compiler.ir import (
    IRAssign, IRBinOp, IRCall, IRConstant, IRElement, IRExprStatement,
    IRFunction, IRImport, IRMemberAccess, IRModule, IRReturn, IRText, IRVariable,
)


def _t(source: str) -> IRModule:
    """Parse source and transform to IR."""
    t = Transformer(filename="test.pyx")
    return t.transform_module(ast.parse(source))


def test_empty_module():
    m = _t("")
    assert m.imports == ()
    assert m.functions == ()


def test_simple_function():
    m = _t("def greet():\n    return 1\n")
    assert len(m.functions) == 1
    f = m.functions[0]
    assert f.name == "greet"
    assert f.params == ()
    assert len(f.body) == 1
    assert isinstance(f.body[0], IRReturn)
    assert f.body[0].value == IRConstant(value=1)


def test_function_with_params():
    m = _t("def add(a, b):\n    return a\n")
    f = m.functions[0]
    assert f.params == ("a", "b")


def test_is_component_uppercase():
    m = _t("def Counter():\n    return 1\n")
    assert m.functions[0].is_component is True


def test_is_component_lowercase():
    m = _t("def helper():\n    return 1\n")
    assert m.functions[0].is_component is False


def test_default_export_is_component():
    m = _t("def App():\n    return 1\n")
    assert m.default_export == "App"


def test_simple_assignment():
    m = _t("def f():\n    x = 1\n")
    assign = m.functions[0].body[0]
    assert isinstance(assign, IRAssign)
    assert assign.targets == ("x",)
    assert assign.value == IRConstant(value=1)
    assert assign.is_const is True


def test_tuple_unpack():
    m = _t("def f():\n    a, b = get_pair()\n")
    assign = m.functions[0].body[0]
    assert isinstance(assign, IRAssign)
    assert assign.targets == ("a", "b")


def test_variable_reference():
    m = _t("def f():\n    return x\n")
    ret = m.functions[0].body[0]
    assert isinstance(ret, IRReturn)
    assert ret.value == IRVariable(name="x")


def test_constant_int():
    m = _t("def f():\n    return 42\n")
    assert m.functions[0].body[0].value == IRConstant(value=42)


def test_constant_string():
    m = _t("def f():\n    return 'hello'\n")
    assert m.functions[0].body[0].value == IRConstant(value="hello")


def test_constant_true():
    m = _t("def f():\n    return True\n")
    assert m.functions[0].body[0].value == IRConstant(value=True)


def test_constant_none():
    m = _t("def f():\n    return None\n")
    assert m.functions[0].body[0].value == IRConstant(value=None)


def test_binop_add():
    m = _t("def f():\n    return a + 1\n")
    op = m.functions[0].body[0].value
    assert isinstance(op, IRBinOp)
    assert op.op == "+"
    assert op.left == IRVariable(name="a")
    assert op.right == IRConstant(value=1)


def test_binop_equality_becomes_strict():
    m = _t("def f():\n    return a == b\n")
    op = m.functions[0].body[0].value
    assert isinstance(op, IRBinOp)
    assert op.op == "==="  # Python == → JavaScript ===


def test_import_from_pyx():
    m = _t("from pyx import useState\n")
    assert len(m.imports) == 1
    assert m.imports[0].source == "pyx-runtime"
    assert "useState" in m.imports[0].names


def test_h_call_becomes_ir_element():
    # This is what the pre-processor produces
    source = 'def f():\n    return h("div", {"class": "app"}, "hello")\n'
    m = _t(source)
    ret = m.functions[0].body[0]
    assert isinstance(ret, IRReturn)
    elem = ret.value
    assert isinstance(elem, IRElement)
    assert elem.tag == "div"
    # class → className
    assert elem.props[0][0] == "className"
    assert elem.children[0] == IRText(text="hello")


def test_nested_h_calls():
    source = 'def f():\n    return h("div", {}, h("p", {}, "inner"))\n'
    m = _t(source)
    elem = m.functions[0].body[0].value
    assert isinstance(elem, IRElement)
    assert elem.tag == "div"
    assert len(elem.children) == 1
    child = elem.children[0]
    assert isinstance(child, IRElement)
    assert child.tag == "p"


def test_call_expression_statement():
    m = _t("def f():\n    print('hi')\n")
    stmt = m.functions[0].body[0]
    assert isinstance(stmt, IRExprStatement)
    assert isinstance(stmt.expr, IRCall)


if __name__ == "__main__":
    tests = [
        test_empty_module, test_simple_function, test_function_with_params,
        test_is_component_uppercase, test_is_component_lowercase,
        test_default_export_is_component, test_simple_assignment,
        test_tuple_unpack, test_variable_reference, test_constant_int,
        test_constant_string, test_constant_true, test_constant_none,
        test_binop_add, test_binop_equality_becomes_strict,
        test_import_from_pyx, test_h_call_becomes_ir_element,
        test_nested_h_calls, test_call_expression_statement,
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
> python compiler/tests/test_transformer.py
```

**Expected output:**
```
  PASS  test_empty_module
  PASS  test_simple_function
  PASS  test_function_with_params
  PASS  test_is_component_uppercase
  PASS  test_is_component_lowercase
  PASS  test_default_export_is_component
  PASS  test_simple_assignment
  PASS  test_tuple_unpack
  PASS  test_variable_reference
  PASS  test_constant_int
  PASS  test_constant_string
  PASS  test_constant_true
  PASS  test_constant_none
  PASS  test_binop_add
  PASS  test_binop_equality_becomes_strict
  PASS  test_import_from_pyx
  PASS  test_h_call_becomes_ir_element
  PASS  test_nested_h_calls
  PASS  test_call_expression_statement

19 passed, 0 failed
```

---

## Challenge: Handle `f-strings`

**You know:** Python f-strings (`f"Hello {name}"`) are `JoinedStr` nodes in the AST. They have a `values` list where each item is either a `Constant` (literal text) or a `FormattedValue` (an expression inside `{}`).

JavaScript template literals are the equivalent: `` `Hello ${name}` ``.

**Task:** Look up `ast.JoinedStr` in the REPL (`ast.dump(ast.parse('f"Hello {name}"'), indent=2)`) and understand its structure. Then add `transform_JoinedStr` to the `Transformer` class. You will need a new IR node — add `IRTemplateLiteral` to `ir.py`.

This is a design exercise as much as an implementation exercise. Think: what fields does `IRTemplateLiteral` need? How do you represent alternating text and expressions?

---

<details>
<summary>▶ Show Solution</summary>

**In `ir.py`, add:**
```python
@dataclass(frozen=True)
class IRTemplateLiteral(IRNode):
    """A template literal: `Hello ${name}!`
    
    parts is a sequence of (text | IRNode) where strings are literal text
    and IRNode objects are expressions.
    """
    parts: tuple[str | IRNode, ...] = ()
```

**In `transformer.py`, add:**
```python
def transform_JoinedStr(self, node: ast.JoinedStr) -> IRTemplateLiteral:
    """Transform a Python f-string to a JS template literal."""
    parts: list[str | IRNode] = []
    for value in node.values:
        if isinstance(value, ast.Constant):
            parts.append(value.value)
        elif isinstance(value, ast.FormattedValue):
            expr = self.transform(value.value)
            if expr is not None:
                parts.append(expr)
    return IRTemplateLiteral(parts=tuple(parts), line=self._line(node))
```

**Key insight:** `IRTemplateLiteral` mixes string literals and IR nodes in one tuple. The code generator (Lab 12) will handle it: strings are emitted as-is, IR nodes are wrapped in `${}`. This is a case where the IR has a node type (`IRTemplateLiteral`) that has no Python AST equivalent — it exists because it is the most natural representation of the output language (JS template literals).

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Transformer dispatches correctly | `Transformer().transform(ast.parse("x=1").body[0])` returns an `IRAssign` |
| Functions transform with params | `def f(a, b): pass` → `IRFunction(params=("a", "b"), ...)` |
| Components detected by uppercase | `def App(): ...` → `IRFunction(is_component=True, ...)` |
| Tuple unpack works | `a, b = f()` → `IRAssign(targets=("a", "b"), ...)` |
| `==` becomes `===` | Compare node with `Eq` → `IRBinOp(op="===", ...)` |
| `h()` becomes `IRElement` | `h("div", {}, "hi")` → `IRElement(tag="div", ...)` |
| `class` prop renamed to `className` | `h("div", {"class": "x"})` → props contain `("className", ...)` |
| All 19 tests pass | `python compiler/tests/test_transformer.py` shows "19 passed, 0 failed" |

---

## Your Complete Files

### `compiler/transformer.py`
*(full file combining the skeleton and all transform methods)*

### `compiler/tests/test_transformer.py`
*(full file as written in Step 3)*

---

## Quick Check Answers

**1. How does the transformer handle inner statements inside a `FunctionDef`?**

`transform_FunctionDef` iterates over `node.body` and calls `self.transform(stmt)` for each statement. Each call dispatches to the appropriate `transform_X` method. If a statement is an `Assign`, it calls `transform_Assign`. If it is a `Return`, it calls `transform_Return`. The recursion happens naturally — no special code handles nesting. A function inside a function (`def increment(): ...` inside `def Counter():`) calls `transform_FunctionDef` again from within the outer `transform_FunctionDef`.

**2. How should `True`, `False`, and `None` be handled?**

In Python 3.8+, `True`, `False`, and `None` in source code produce `Constant` nodes (`Constant(value=True)`, `Constant(value=False)`, `Constant(value=None)`). `transform_Constant` handles them correctly: `IRConstant(value=True)` and the code generator emits `true`, `IRConstant(value=None)` emits `null`. Number literals use the same node type with different value types — `Constant(value=42)` is the same node as `Constant(value=True)`, distinguished only by the Python type of the `value` field.

**3. Would `ast.NodeTransformer` be the right approach?**

No. `ast.NodeTransformer` is for modifying an AST and returning a modified AST of the same type — it returns `ast` nodes. PyX's transformer produces `IRNode` objects, which are a completely different class hierarchy. Using `ast.NodeTransformer` would require shoehorning IR nodes into a Python AST structure, which would be both wrong and confusing. The plain `Transformer` class with a `transform(node)` dispatcher is the correct design because the input and output types are different.

---

*End of LAB 08.*

*Lab 09 adds control flow: `if` statements, `for` loops, and list comprehensions. Python's `for x in items` maps to JavaScript's `for (const x of items)`, and `[x*2 for x in items]` maps to `items.map(x => x*2)`. These semantic mapping decisions are documented in the transformer, not hidden.*
