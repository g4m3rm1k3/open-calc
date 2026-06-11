# PyX — LAB 12 — Generating JSX from the IR

**Prerequisites:** Lab 11 complete. All test suites pass.

**What this lab adds:**
- `compiler/codegen.py` — the JSX code generator
- Generation of: imports, function declarations, variables, assignments, control flow, elements
- Indented, readable JSX output
- Tests that verify the generated string for each IR node type

**Time:** 90–120 minutes.

---

## What You Will Build

A `CodeGenerator` class that walks a `IRModule` and produces a `.jsx` string:

```
IRModule
  IRImport('pyx-runtime', ('useState',))
  IRFunction('Counter', params=(), body=(
    IRAssign(('count', 'set_count'), IRCall(useState, (IRConstant(0),)))
    IRReturn(IRElement('div', [className='counter'], children=[
      IRElement('p', [], [IRText('Count: '), IRVariable('count')])
      IRElement('button', [onClick=IRVariable('increment')], [IRText('+')])
    ]))
  ))

JSX output:
  import { useState } from 'pyx-runtime';

  function Counter() {
    const [count, set_count] = useState(0);
    return (
      <div className="counter">
        <p>Count: {count}</p>
        <button onClick={increment}>+</button>
      </div>
    );
  }

  export default Counter;
```

This is valid JSX. Vite compiles it to JavaScript. The browser runs it.

---

> **Quick Check — try to answer before reading further:**
>
> 1. The code generator produces JSX, not plain JavaScript. What is JSX? How does Vite turn JSX into JavaScript that the browser can run?
> 2. The `IRElement` in the IR is emitted as `<div className="x">` in JSX. But earlier in the pipeline (pre-processor output), the same element was `h("div", {"className": "x"})`. Why did you emit JSX element syntax instead of `h()` calls?
> 3. `const [count, set_count] = useState(0)` — the `[count, set_count]` is array destructuring in JavaScript. Where in the IR is the information that this is an array destructuring assignment (not a regular assignment)?
>
> *(Answers at the end of this lab)*

---

## Concept: What Is JSX?

**What it is:** JSX is a syntax extension to JavaScript that allows HTML-like element literals inside JavaScript code. `<div className="app">Hello</div>` is not valid JavaScript — but it is valid JSX.

**How JSX works:**

Before the browser sees JSX, a tool (Vite, in the PyX case) compiles it to regular JavaScript function calls:

```jsx
// JSX (what you write):
<div className="app">Hello</div>

// What Vite compiles it to:
React.createElement("div", {className: "app"}, "Hello")
// or, with the newer JSX transform:
_jsx("div", {className: "app", children: "Hello"})
```

The PyX runtime provides its own `h()` function that replaces `React.createElement`. The JSX transform is configured (in Lab 14) to use `h` instead of `React.createElement`.

**Why emit JSX instead of plain JavaScript:**

The code generator has two options: emit JSX (`<div>...</div>`) or emit `h()` calls directly. JSX is more readable and already handled by Vite. Emitting JSX means you get human-readable output with the visual structure of HTML. Emitting `h()` calls is also valid but is harder to read and debug.

The pre-processor (Phase 1) worked with `h()` calls as the intermediate form because Python's `ast.parse` needed to see valid Python — and `<div>` is not valid Python. By the time the code generator runs, the output is JavaScript/JSX where element literals are perfectly valid.

**Watch for:** JSX uses `className` instead of `class` (because `class` is a JavaScript reserved word). The transformer already renamed `class` → `className`. The code generator emits `className` as-is.

---

## Concept: Indentation Tracking

**What it is:** Well-formatted code is easier to read and debug. The code generator tracks an indentation level and increases it inside function bodies, if blocks, and for loops.

**The pattern:**

```python
class CodeGenerator:
    def __init__(self):
        self._indent = 0
        self._lines: list[str] = []

    def _emit(self, line: str) -> None:
        """Emit one line with current indentation."""
        self._lines.append("  " * self._indent + line)

    def _indent_in(self) -> None:
        self._indent += 1

    def _indent_out(self) -> None:
        self._indent -= 1
```

When generating a function body, call `_indent_in()` before the body and `_indent_out()` after. The `_emit` calls inside produce correctly indented lines.

**Why this matters:**

The output JSX is read by developers who are debugging their PyX components. A function body with no indentation looks like this:

```js
function Counter() {
const [count, set_count] = useState(0);
function increment() {
set_count(count + 1);
}
return (...);
}
```

With correct indentation:
```js
function Counter() {
  const [count, set_count] = useState(0);
  function increment() {
    set_count(count + 1);
  }
  return (...);
}
```

The second version is what you want developers to see when they inspect the output.

---

## Step 1 — Write the Code Generator

Create `compiler/codegen.py`:

```python
"""
PyX Code Generator

Walks a PyX IR tree and emits a JSX string.
"""
from __future__ import annotations
from compiler.ir import (
    IRArrowFunction, IRAssign, IRBinOp, IRCall, IRConstant,
    IRElement, IRExprStatement, IRFor, IRFunction, IRIf, IRImport,
    IRMemberAccess, IRModule, IRNode, IRReturn, IRText, IRVariable,
)

try:
    from compiler.ir import IRWhile
    _HAS_IR_WHILE = True
except ImportError:
    _HAS_IR_WHILE = False


class CodeGenerator:
    """Generates JSX from a PyX IR tree."""

    def __init__(self) -> None:
        self._indent: int = 0
        self._lines: list[str] = []

    def generate(self, module: IRModule) -> str:
        """Generate JSX from an IRModule. Returns the complete file string."""
        self._indent = 0
        self._lines = []

        # Imports
        for imp in module.imports:
            self._gen_import(imp)

        if module.imports:
            self._lines.append("")  # blank line after imports

        # Function declarations
        for i, func in enumerate(module.functions):
            self._gen_function(func)
            if i < len(module.functions) - 1:
                self._lines.append("")  # blank line between functions

        # Default export
        if module.default_export:
            self._lines.append("")
            self._lines.append(f"export default {module.default_export};")

        return "\n".join(self._lines) + "\n"

    # ── Utilities ──────────────────────────────────────────────────────────

    def _emit(self, line: str) -> None:
        self._lines.append("  " * self._indent + line)

    def _indent_in(self) -> None:
        self._indent += 1

    def _indent_out(self) -> None:
        self._indent -= 1

    # ── Imports ────────────────────────────────────────────────────────────

    def _gen_import(self, node: IRImport) -> None:
        names = ", ".join(node.names)
        self._emit(f"import {{ {names} }} from '{node.source}';")

    # ── Functions ──────────────────────────────────────────────────────────

    def _gen_function(self, node: IRFunction) -> None:
        params = ", ".join(node.params)
        self._emit(f"function {node.name}({params}) {{")
        self._indent_in()
        for stmt in node.body:
            self._gen_statement(stmt)
        self._indent_out()
        self._emit("}")

    # ── Statements ─────────────────────────────────────────────────────────

    def _gen_statement(self, node: IRNode) -> None:
        if isinstance(node, IRAssign):
            self._gen_assign(node)
        elif isinstance(node, IRReturn):
            self._gen_return(node)
        elif isinstance(node, IRIf):
            self._gen_if(node)
        elif isinstance(node, IRFor):
            self._gen_for(node)
        elif _HAS_IR_WHILE and isinstance(node, IRWhile):
            self._gen_while(node)
        elif isinstance(node, IRExprStatement):
            expr_str = self._gen_expr(node.expr)
            self._emit(f"{expr_str};")
        elif isinstance(node, IRFunction):
            # Nested function definition
            self._gen_function(node)
        else:
            self._emit(f"// TODO: unhandled statement {type(node).__name__}")

    def _gen_assign(self, node: IRAssign) -> None:
        keyword = "const" if node.is_const else "let"
        value_str = self._gen_expr(node.value)

        if len(node.targets) == 1:
            self._emit(f"{keyword} {node.targets[0]} = {value_str};")
        else:
            # Array destructuring: const [a, b] = expr
            names = ", ".join(node.targets)
            self._emit(f"{keyword} [{names}] = {value_str};")

    def _gen_return(self, node: IRReturn) -> None:
        if node.value is None:
            self._emit("return;")
            return

        if isinstance(node.value, IRElement):
            # Return with an element: use parentheses for multiline JSX
            self._emit("return (")
            self._indent_in()
            self._gen_jsx_element(node.value)
            self._indent_out()
            self._emit(");")
        else:
            value_str = self._gen_expr(node.value)
            self._emit(f"return {value_str};")

    def _gen_if(self, node: IRIf) -> None:
        test_str = self._gen_expr(node.test)
        self._emit(f"if ({test_str}) {{")
        self._indent_in()
        for stmt in node.body:
            self._gen_statement(stmt)
        self._indent_out()

        if node.orelse:
            if len(node.orelse) == 1 and isinstance(node.orelse[0], IRIf):
                # elif: emit as 'else if'
                inner = node.orelse[0]
                inner_test = self._gen_expr(inner.test)
                self._emit(f"}} else if ({inner_test}) {{")
                self._indent_in()
                for stmt in inner.body:
                    self._gen_statement(stmt)
                self._indent_out()
                if inner.orelse:
                    self._emit("} else {")
                    self._indent_in()
                    for stmt in inner.orelse:
                        self._gen_statement(stmt)
                    self._indent_out()
            else:
                self._emit("} else {")
                self._indent_in()
                for stmt in node.orelse:
                    self._gen_statement(stmt)
                self._indent_out()

        self._emit("}")

    def _gen_for(self, node: IRFor) -> None:
        iter_str = self._gen_expr(node.iter)
        self._emit(f"for (const {node.target} of {iter_str}) {{")
        self._indent_in()
        for stmt in node.body:
            self._gen_statement(stmt)
        self._indent_out()
        self._emit("}")

    def _gen_while(self, node) -> None:
        test_str = self._gen_expr(node.test)
        self._emit(f"while ({test_str}) {{")
        self._indent_in()
        for stmt in node.body:
            self._gen_statement(stmt)
        self._indent_out()
        self._emit("}")

    # ── Expressions ────────────────────────────────────────────────────────

    def _gen_expr(self, node: IRNode) -> str:
        if isinstance(node, IRConstant):
            return self._gen_constant(node)
        elif isinstance(node, IRVariable):
            return node.name
        elif isinstance(node, IRBinOp):
            return self._gen_binop(node)
        elif isinstance(node, IRCall):
            return self._gen_call(node)
        elif isinstance(node, IRMemberAccess):
            obj_str = self._gen_expr(node.obj)
            return f"{obj_str}.{node.attr}"
        elif isinstance(node, IRArrowFunction):
            return self._gen_arrow(node)
        elif isinstance(node, IRElement):
            # Element used as an expression (not in return)
            return self._gen_h_call(node)
        elif isinstance(node, IRText):
            escaped = node.text.replace("\\", "\\\\").replace('"', '\\"')
            return f'"{escaped}"'
        else:
            return f"/* TODO: {type(node).__name__} */"

    def _gen_constant(self, node: IRConstant) -> str:
        if node.value is None:
            return "null"
        if node.value is True:
            return "true"
        if node.value is False:
            return "false"
        if isinstance(node.value, str):
            escaped = node.value.replace("\\", "\\\\").replace('"', '\\"')
            return f'"{escaped}"'
        return str(node.value)

    def _gen_binop(self, node: IRBinOp) -> str:
        left = self._gen_expr(node.left)
        right = self._gen_expr(node.right)
        # Special case: unary not (left is IRConstant(None))
        if node.op == "!" and isinstance(node.left, IRConstant) and node.left.value is None:
            return f"!{right}"
        return f"{left} {node.op} {right}"

    def _gen_call(self, node: IRCall) -> str:
        func_str = self._gen_expr(node.func)
        args = [self._gen_expr(arg) for arg in node.args]
        return f"{func_str}({', '.join(args)})"

    def _gen_arrow(self, node: IRArrowFunction) -> str:
        params = ", ".join(node.params)
        body = self._gen_expr(node.body)
        if len(node.params) == 1:
            return f"{params} => {body}"
        return f"({params}) => {body}"

    # ── JSX Element Generation ─────────────────────────────────────────────

    def _gen_jsx_element(self, node: IRElement) -> None:
        """Emit a JSX element as indented lines."""
        props_str = self._gen_jsx_props(node.props)
        tag = node.tag

        if not node.children:
            # Self-closing
            self._emit(f"<{tag}{props_str} />")
            return

        # Check if all children are simple (inline-able)
        all_simple = all(
            isinstance(c, (IRText, IRVariable))
            for c in node.children
        )

        if all_simple and len(node.children) <= 3:
            # Inline: <p>Count: {count}</p>
            children_str = "".join(self._gen_jsx_inline_child(c) for c in node.children)
            self._emit(f"<{tag}{props_str}>{children_str}</{tag}>")
        else:
            # Multiline
            self._emit(f"<{tag}{props_str}>")
            self._indent_in()
            for child in node.children:
                self._gen_jsx_child(child)
            self._indent_out()
            self._emit(f"</{tag}>")

    def _gen_jsx_props(self, props: tuple) -> str:
        if not props:
            return ""
        parts: list[str] = []
        for name, value in props:
            if isinstance(value, IRConstant) and isinstance(value.value, str):
                escaped = value.value.replace('"', '\\"')
                parts.append(f' {name}="{escaped}"')
            else:
                expr_str = self._gen_expr(value)
                parts.append(f" {name}={{{expr_str}}}")
        return "".join(parts)

    def _gen_jsx_inline_child(self, child: IRNode) -> str:
        if isinstance(child, IRText):
            return child.text
        elif isinstance(child, IRVariable):
            return f"{{{child.name}}}"
        else:
            return f"{{{self._gen_expr(child)}}}"

    def _gen_jsx_child(self, child: IRNode) -> None:
        if isinstance(child, IRText):
            if child.text.strip():
                self._emit(child.text)
        elif isinstance(child, IRVariable):
            self._emit(f"{{{child.name}}}")
        elif isinstance(child, IRElement):
            self._gen_jsx_element(child)
        else:
            expr_str = self._gen_expr(child)
            self._emit(f"{{{expr_str}}}")

    def _gen_h_call(self, node: IRElement) -> str:
        """Generate an h() call for elements used as expressions (not in return)."""
        tag = f'"{node.tag}"' if node.tag[0].islower() else node.tag
        props_parts = []
        for name, value in node.props:
            val_str = self._gen_expr(value)
            props_parts.append(f"{name}: {val_str}")
        props_str = "{" + ", ".join(props_parts) + "}" if props_parts else "{}"

        children = [self._gen_expr(c) for c in node.children]
        all_args = [tag, props_str] + children
        return f"h({', '.join(all_args)})"
```

---

## Step 2 — Write the Tests

Create `compiler/tests/test_codegen.py`:

```python
from compiler.ir import (
    IRArrowFunction, IRAssign, IRBinOp, IRCall, IRConstant, IRElement,
    IRExprStatement, IRFor, IRFunction, IRIf, IRImport, IRMemberAccess,
    IRModule, IRReturn, IRText, IRVariable,
)
from compiler.codegen import CodeGenerator


def _gen(module: IRModule) -> str:
    return CodeGenerator().generate(module)


def _module(*functions, imports=()):
    return IRModule(imports=tuple(imports), functions=tuple(functions))


def _func(name, *body, params=()):
    upper = name[0].isupper() if name else False
    return IRFunction(name=name, params=params, body=tuple(body), is_component=upper)


def test_empty_module():
    result = _gen(_module())
    assert result.strip() == ""


def test_import():
    m = IRModule(
        imports=(IRImport(source="pyx-runtime", names=("useState",)),),
        functions=(),
    )
    result = _gen(m)
    assert "import { useState } from 'pyx-runtime'" in result


def test_multiple_imports():
    m = IRModule(
        imports=(IRImport(source="pyx-runtime", names=("useState", "useEffect")),),
        functions=(),
    )
    result = _gen(m)
    assert "useState" in result
    assert "useEffect" in result


def test_function_declaration():
    m = _module(_func("greet", IRReturn(value=IRConstant(value=None))))
    result = _gen(m)
    assert "function greet()" in result
    assert "return null;" in result


def test_function_with_params():
    m = _module(_func("add", IRReturn(value=IRVariable(name="a")), params=("a", "b")))
    result = _gen(m)
    assert "function add(a, b)" in result


def test_const_assignment():
    m = _module(_func("f",
        IRAssign(targets=("x",), value=IRConstant(value=1), is_const=True)
    ))
    result = _gen(m)
    assert "const x = 1;" in result


def test_array_destructuring():
    m = _module(_func("f",
        IRAssign(
            targets=("count", "set_count"),
            value=IRCall(func=IRVariable(name="useState"), args=(IRConstant(value=0),)),
            is_const=True,
        )
    ))
    result = _gen(m)
    assert "const [count, set_count] = useState(0);" in result


def test_binop():
    m = _module(_func("f",
        IRReturn(value=IRBinOp(
            left=IRVariable(name="a"),
            op="+",
            right=IRConstant(value=1),
        ))
    ))
    result = _gen(m)
    assert "return a + 1;" in result


def test_if_else():
    m = _module(_func("f",
        IRIf(
            test=IRVariable(name="x"),
            body=(IRReturn(value=IRConstant(value=1)),),
            orelse=(IRReturn(value=IRConstant(value=0)),),
        )
    ))
    result = _gen(m)
    assert "if (x)" in result
    assert "} else {" in result


def test_for_loop():
    m = _module(_func("f",
        IRFor(
            target="item",
            iter=IRVariable(name="items"),
            body=(IRExprStatement(expr=IRCall(
                func=IRVariable(name="process"),
                args=(IRVariable(name="item"),),
            )),),
        )
    ))
    result = _gen(m)
    assert "for (const item of items)" in result


def test_element_in_return():
    m = _module(_func("Hello",
        IRReturn(value=IRElement(
            tag="div",
            props=(),
            children=(IRText(text="Hello"),),
        ))
    ))
    result = _gen(m)
    assert "return (" in result
    assert "<div>" in result or "<div " in result
    assert "Hello" in result
    assert "</div>" in result


def test_element_with_classname():
    m = _module(_func("App",
        IRReturn(value=IRElement(
            tag="div",
            props=(("className", IRConstant(value="app")),),
            children=(),
        ))
    ))
    result = _gen(m)
    assert 'className="app"' in result


def test_element_with_expression_prop():
    m = _module(_func("App",
        IRReturn(value=IRElement(
            tag="button",
            props=(("onClick", IRVariable(name="handleClick")),),
            children=(IRText(text="Click"),),
        ))
    ))
    result = _gen(m)
    assert "onClick={handleClick}" in result


def test_default_export():
    m = IRModule(
        imports=(),
        functions=(_func("App", IRReturn(value=IRConstant(value=None))),),
        default_export="App",
    )
    result = _gen(m)
    assert "export default App;" in result


def test_arrow_function():
    arrow = IRArrowFunction(
        params=("x",),
        body=IRBinOp(
            left=IRVariable(name="x"),
            op="*",
            right=IRConstant(value=2),
        ),
    )
    m = _module(_func("f",
        IRAssign(targets=("double",), value=arrow, is_const=True)
    ))
    result = _gen(m)
    assert "x => x * 2" in result


if __name__ == "__main__":
    tests = [
        test_empty_module, test_import, test_multiple_imports,
        test_function_declaration, test_function_with_params,
        test_const_assignment, test_array_destructuring, test_binop,
        test_if_else, test_for_loop, test_element_in_return,
        test_element_with_classname, test_element_with_expression_prop,
        test_default_export, test_arrow_function,
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
> python compiler/tests/test_codegen.py
```

**Expected:** 15 passed, 0 failed.

---

## Step 3 — Wire the Code Generator Into the CLI

Update `_run_build` in `compiler/cli.py`. Replace the placeholder comment:

```python
    # Code generator
    from compiler.codegen import CodeGenerator
    cg = CodeGenerator()
    result = cg.generate(ir_module)
```

---

### SAVE AND TRY

```
> pyxc build examples/counter.pyx
```

Open `examples/counter.jsx`. You should see valid JSX:

```jsx
import { useState } from 'pyx-runtime';

function Counter() {
  const [count, set_count] = useState(0);
  function increment() {
    set_count(count + 1);
  }
  return (
    <div className="counter">
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}

export default Counter;
```

This is the first time `pyxc build` produces real JSX output. You have completed the full compiler pipeline.

---

## Challenge: Emit `const` vs `let` Correctly

**You know:** `IRAssign.is_const` tells you whether to emit `const` or `let`. The current code uses this. But there is a subtle issue: if a variable is assigned multiple times (e.g., in a loop body and before the loop), it should be `let`, not `const`.

**Task:** Walk the IR function body before generating code and identify all variable names that are assigned more than once. Emit `let` for those variables and `const` for all others.

**Hint:** Collect all `IRAssign.targets` in the function body. Any name that appears more than once should use `let`.

---

<details>
<summary>▶ Show Solution</summary>

Add a helper method to `CodeGenerator`:

```python
def _find_reassigned(self, body: tuple) -> set[str]:
    """Find all variable names assigned more than once in a body."""
    counts: dict[str, int] = {}
    for node in body:
        if isinstance(node, IRAssign):
            for name in node.targets:
                counts[name] = counts.get(name, 0) + 1
    return {name for name, count in counts.items() if count > 1}
```

Then in `_gen_function`, pass the reassigned set down to `_gen_assign`:

```python
def _gen_function(self, node: IRFunction) -> None:
    params = ", ".join(node.params)
    self._emit(f"function {node.name}({params}) {{")
    self._indent_in()
    reassigned = self._find_reassigned(node.body)
    for stmt in node.body:
        self._gen_statement(stmt, reassigned=reassigned)
    self._indent_out()
    self._emit("}")
```

And update `_gen_assign` to check:

```python
def _gen_assign(self, node: IRAssign, reassigned: set[str] = None) -> None:
    is_reassigned = reassigned and any(t in reassigned for t in node.targets)
    keyword = "let" if (not node.is_const or is_reassigned) else "const"
    ...
```

**Key insight:** `const` in JavaScript means "this binding cannot be reassigned." Using `const` everywhere that you can is idiomatic JavaScript — it makes code easier to reason about. But if a variable is genuinely reassigned, `const` would produce a `TypeError` at runtime. This analysis (scanning for reassignment before emitting) is a simple form of **dataflow analysis** — a technique used in every real compiler to optimise and verify code.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Imports generate correctly | `IRImport("pyx-runtime", ("useState",))` → `import { useState } from 'pyx-runtime';` |
| Array destructuring works | `IRAssign(("a","b"), ...)` → `const [a, b] = ...;` |
| JSX element in return | `IRElement("div", (), ...)` in `IRReturn` → JSX with `return (...)` |
| Props with string values | `("className", IRConstant("app"))` → `className="app"` |
| Props with expression values | `("onClick", IRVariable("fn"))` → `onClick={fn}` |
| Default export emitted | `IRModule(default_export="App")` → `export default App;` |
| `pyxc build counter.pyx` produces JSX | Output file contains `function Counter()` and `<div` |
| All 15 codegen tests pass | `python compiler/tests/test_codegen.py` shows "15 passed, 0 failed" |

---

## Your Complete Files

### New file this lab

**`compiler/codegen.py`** — the IR-to-JSX code generator. Full file content in Steps 1–3.

**`compiler/tests/test_codegen.py`** — new test suite (Step 3).

### Project structure at end of Lab 12

```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py
│   ├── codegen.py               ← new
│   ├── codegen_preprocessor.py
│   ├── errors.py
│   ├── ir.py
│   ├── lexer.py
│   ├── nodes.py
│   ├── parser.py
│   ├── parser_py.py
│   ├── preprocessor.py
│   ├── tokens.py
│   ├── transformer.py
│   └── tests/
│       ├── __init__.py
│       ├── test_codegen.py      ← new
│       ├── test_codegen_preprocessor.py
│       ├── test_lexer.py
│       ├── test_parser.py
│       ├── test_pipeline.py
│       ├── test_transformer.py
│       └── test_transformer_errors.py
├── examples/
│   ├── counter.pyx
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. What is JSX? How does Vite compile it?**

JSX is a syntax extension for JavaScript that allows HTML-like element literals (`<div className="app">`) inside JavaScript code. It is not natively understood by browsers. Vite (using `@vitejs/plugin-react` or a custom transform) compiles JSX to `React.createElement(...)` calls (or, with a custom pragma, to `h(...)` calls from the PyX runtime). This compilation happens at build time — the browser only ever sees plain JavaScript.

**2. Why emit JSX element syntax instead of `h()` calls?**

JSX is more readable. When a developer opens `counter.jsx` to debug their component, `<div className="counter"><p>Count: {count}</p></div>` is immediately understandable. `h("div", {className: "counter"}, h("p", {}, "Count: ", count))` is technically equivalent but harder to read. The pre-processor used `h()` calls because it needed to produce valid Python that `ast.parse` would accept. The code generator outputs JSX because that is the most natural representation for the output language.

**3. Where in the IR is array destructuring encoded?**

In `IRAssign.targets`. When `targets` has more than one element, the code generator emits array destructuring syntax: `const [a, b] = ...`. When `targets` has exactly one element, it emits a simple assignment: `const x = ...`. The transformer fills in multiple targets for tuple unpacking assignments (`a, b = f()`). The code generator does not need to "know" about Python tuple unpacking — it only needs to check whether there are one or multiple targets.

---

*End of LAB 12.*

*Lab 13 wires the full pipeline end-to-end — running `pyxc build counter.pyx` produces a readable, valid `.jsx` file. You verify the output by reading it and tracing every line back to its source in `counter.pyx`.*
