# PyX — LAB 29 — Error Messages as a Product

**Prerequisites:** Lab 28 complete. The Vite plugin compiles `.pyx` files automatically.

**What this lab adds:**
- A comprehensive review of every error message in the compiler and runtime
- Evaluation of each message against the three-question standard
- Rewrites of every poor message
- A test file with every class of error as a regression suite

**Time:** 45–60 minutes.

---

## What You Will Build

A review document listing every error message category in PyX, evaluated and improved where needed. Plus a `.pyx` test file that exercises every error class.

---

> **Quick Check:**
>
> 1. List the three questions a good error message answers.
> 2. A compiler error says "SyntaxError: invalid syntax." What are the three things missing from this message?
> 3. React's famous error "Hooks can only be called inside a function component" was added after users were confused by the cryptic alternative. What does this message tell you that a stack trace alone does not?
>
> *(Answers at the end)*

---

## The Three-Question Standard

Every error message in PyX must answer:

1. **What went wrong?** — the specific construct, not a category
2. **Where?** — filename and line number
3. **What to do?** — a concrete suggestion

---

## Step 1 — Audit Every Error Class

Run through this checklist. For each, examine the current message and rewrite if it fails the standard.

**Pre-processor errors (compiler/preprocessor.py):**

| Error condition | Current message | Passes standard? |
|---|---|---|
| Unclosed element `<div>` | "Unclosed element `<div>`: no matching `</div>` found" | ✅ |
| Mismatched tags `<div></span>` | "Mismatched tags: opened `<div>` but found `</span>`" | ✅ |
| Unexpected end of file in expression | "Unexpected end of file: unclosed element or expression" | ⚠️ (no suggestion) |

Rewrite the failing one:
```python
raise SyntaxError(
    "Unexpected end of file inside a {expression}. "
    "Check for a missing closing } brace."
)
```

**Transformer errors (compiler/transformer.py):**

| Error condition | Current message | Passes standard? |
|---|---|---|
| try/except | "try/except is not supported. Use if/else..." | ✅ |
| async def | "async def is not supported. Use useEffect..." | ✅ |
| class def | "class definitions not supported. Use function components..." | ✅ |
| Wildcard import | "'from x import *' is not supported. Name imports explicitly." | ✅ |
| Filtered comprehension | "Filtered list comprehensions not supported. Use .filter().map()" | ✅ |
| Unknown node type | "'{node_type}' is not supported in PyX v1.0." | ⚠️ (generic) |

Rewrite the generic one by creating specific handlers for every Python construct you encounter in practice. Add to `transformer.py`:

```python
def transform_Subscript(self, node: ast.Subscript) -> IRNode | None:
    """item["key"] — subscript access. Map to member access or call."""
    obj = self.transform(node.value)
    # Constant key: item["key"] → item.key (in JS, both work for strings)
    if isinstance(node.slice, ast.Constant) and isinstance(node.slice.value, str):
        return IRMemberAccess(obj=obj, attr=node.slice.value, line=self._line(node))
    # Dynamic key: item[i] → item[i] (use IRCall to index)
    key = self.transform(node.slice)
    return IRCall(
        func=IRMemberAccess(obj=obj, attr="at" if False else "__index__"),
        args=(key,),
        line=self._line(node),
    )
```

Actually, dictionary subscript (`item["id"]`) is extremely common in PyX. Add proper support:

```python
def transform_Subscript(self, node: ast.Subscript) -> IRNode | None:
    """item[key] → item[key] in JS."""
    obj = self.transform(node.value)
    key = self.transform(node.slice)
    # In JS, obj[key] is the subscript syntax
    # Represent as a special IRCall or as IRBinOp — use a dedicated node
    # For now, map string keys to member access and numeric keys to subscript
    if isinstance(node.slice, ast.Constant) and isinstance(node.slice.value, str):
        return IRMemberAccess(obj=obj, attr=node.slice.value, line=self._line(node))
    return IRCall(
        func=IRMemberAccess(obj=IRVariable(name="__subscript__"), attr="get"),
        args=(obj, key),
        line=self._line(node),
    )
```

The cleaner approach: add an `IRSubscript` node to the IR and handle it in the code generator.

**Runtime errors (runtime/src/):**

| Error condition | Current message | Passes standard? |
|---|---|---|
| useState outside component | "useState must be called inside a component function during rendering." | ✅ |
| useEffect outside component | "useEffect must be called inside a component function during rendering." | ✅ |
| Component returns undefined | (silent bug — no error) | ❌ |

Add a guard to `createDOMNode`:

```typescript
if (typeof v.type === 'function') {
  const result = v.type(propsWithChildren);
  if (result === undefined || result === null) {
    console.error(
      `PyX: Component "${v.type.name || 'anonymous'}" returned ${result}. ` +
      `Components must return a VNode. ` +
      `Did you forget a return statement?`
    );
    return document.createComment(`[PyX: ${v.type.name} returned ${result}]`);
  }
  return createDOMNode(result);
}
```

---

## Step 2 — Write the Error Regression Test File

Create `examples/error-tests/every-error.pyx`:

```python
# This file exercises every error class in the compiler.
# Run: pyxc check examples/error-tests/every-error.pyx
# Expected: multiple errors, all with useful messages.

from pyx import useState

# ERROR 1: try/except
def component_with_try():
    try:
        x = 1
    except:
        x = 0
    return <div>{x}</div>

# ERROR 2: class definition
class NotAComponent:
    pass

# ERROR 3: async def
async def async_component():
    return <div>async</div>

# ERROR 4: yield
def generator_component():
    yield <div>a</div>
    yield <div>b</div>
```

Run:

```
> pyxc check examples/error-tests/every-error.pyx
```

**Expected:** All four errors are reported with line numbers and suggestions.

---

## Step 3 — Write the Runtime Error Tests

Add to `runtime/src/hooks.test.ts`:

```typescript
it('warns when component returns undefined', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  renderRoot(() => {
    return undefined as any;  // bug: forgot to return
  }, container);

  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('returned undefined')
  );

  consoleSpy.mockRestore();
});
```

---

### SAVE AND TRY

```
> pyxc check examples/error-tests/every-error.pyx
```

**Expected:** 4 errors are reported, each with a filename, line number, and a suggestion. If any error says "unsupported construct" without a suggestion, find that message in `transformer.py` and add one.

---

## Challenge: Write a Better "Missing Return" Error

**You know:** A component that returns `None` or forgets to return is a common beginner mistake. The runtime currently checks for this and warns with `'returned undefined'`. The message could be better.

**Task:** Improve the runtime's undefined-return check to print:

```
[PyX] Component "Counter" returned undefined.
Make sure every code path in your component returns a VNode.
Example: return <div>your content here</div>
```

The component name comes from `instance.fn.name` (the function's `.name` property in JavaScript).

Try writing the improved message before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

In `render.ts` (or wherever you check for undefined render results), find the undefined check and update it:

```typescript
function renderComponent(instance: ComponentInstance): VNode {
  const vnode = instance.fn(instance.props);
  if (vnode === undefined || vnode === null) {
    const name = instance.fn.name || 'Anonymous';
    console.error(
      `[PyX] Component "${name}" returned undefined.\n` +
      `Make sure every code path in your component returns a VNode.\n` +
      `Example: return h('div', null, 'your content here')`
    );
    return h('div', null);  // fallback to empty div so the app doesn't crash
  }
  return vnode;
}
```

**Key insight:** The fallback `h('div', null)` prevents a cascade of crashes — without it, an undefined VNode would crash the reconciler on the next render. The error message includes the component name so the developer knows exactly which component to fix. `instance.fn.name` is the JavaScript function's `.name` property, which is the function identifier from the source — `function Counter() {}` → `name = 'Counter'`.

</details>

---

## Final Check

| Error class | Has message? | Passes standard? |
|---|---|---|
| Unclosed element | ✅ | ✅ |
| Mismatched tags | ✅ | ✅ |
| try/except | ✅ | ✅ |
| async def | ✅ | ✅ |
| class def | ✅ | ✅ |
| Component returns undefined | ✅ (after this lab) | ✅ |
| useState outside component | ✅ | ✅ |
| Conditional hook (wrong slot) | ⚠️ (documented, not detected) | acceptable |

---

## Your Complete Files

### Changed files this lab

This lab improves error messages rather than adding new modules. Files changed:

**`compiler/transformer.py`** — updated `transform_unsupported` suggestion strings for each unsupported construct.

**`runtime/src/render.ts`** — updated the undefined-return check with a component name and suggestion.

**`examples/error-tests/every-error.pyx`** — new test file exercising every error class.

### Project structure at end of Lab 29

All files from Lab 28, plus:

```
pyx/
├── examples/
│   ├── counter.pyx  /  counter.jsx
│   ├── hello.pyx
│   ├── todo.pyx
│   └── error-tests/
│       └── every-error.pyx    ← new
```

---

## Quick Check Answers

**1. The three questions a good error message answers:**

1. What went wrong? (specific, not generic)
2. Where? (filename and line number)
3. What to do? (concrete suggestion or fix)

**2. What "SyntaxError: invalid syntax" is missing:**

1. What is invalid — which construct or character caused the error
2. Where — no filename or line number
3. What to do — no suggestion about how to fix it

This is the archetypal bad error message. Python itself improved significantly from Python 2 to Python 3.11 in error message quality — the Python 3.11 parser gives messages like "f-string: single '}' is not allowed" instead of "invalid syntax."

**3. What React's hooks error tells you that a stack trace does not:**

It tells you the *rule* that was violated and *why* the rule exists. A stack trace shows you where the crash occurred, but not why calling a hook outside a component is wrong. React's message educates: "this is a rule, you can only call hooks here, this is why." A stack trace just shows the failure site. The conceptual explanation in the message is what makes it actionable.

---

*End of LAB 29.*

*Lab 30 is the final lab — no new code. You read through the compiler and runtime, name every concept you implemented, and look at what would be needed to extend PyX.*
