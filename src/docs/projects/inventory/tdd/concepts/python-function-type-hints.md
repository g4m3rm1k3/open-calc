# Concept: Function Parameter and Return Type Hints

**What you'll understand by the end:** the real syntax for annotating a
function's parameters and return value with their intended types, and
why Python itself never enforces any of it at runtime.

**Prerequisites:** `static-vs-dynamic-typing.md`.

## Setup

Python 3, no packages needed for the syntax itself; `pip install mypy`
to actually check hints (used below to prove they're real, checkable
information, not just comments).

## The Problem

A function's parameter names alone don't say what *kind* of value each
one expects, or what kind of value it returns — a reader (or an
automated tool) has to guess from the implementation, or from
documentation that can drift out of sync with the real code. Python
lets a function's own signature state this directly, in a form both
humans and tools can read.

## The Isolated Example

```python
def load_settings(level: str = "INFO") -> dict:
    return {"level": level}


def greet(name: str, times: int = 1) -> None:
    for _ in range(times):
        print(f"Hello, {name}!")


settings = load_settings("DEBUG")
print(settings)
greet("Ada", times=2)

# Python itself never enforces any of the annotations above:
print(load_settings(12345))
```

**Real output, run this session:**
```
{'level': 'DEBUG'}
Hello, Ada!
Hello, Ada!
{'level': 12345}
```

**The same file, checked with `mypy` instead of run:**
```
ex_typehints.py:15: error: Argument 1 to "load_settings" has incompatible type "int"; expected "str"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

**What this proves:** calling `load_settings(12345)` — an `int` where
the signature says `str` — runs completely fine under plain Python,
producing `{'level': 12345}` with no error or warning at all. The
*exact same code*, checked with `mypy` instead of executed, reports a
real, specific error at the real line. The hints are real, structured
information a separate tool can read and check — they just aren't
enforced by the Python interpreter itself.

## Mechanical Walkthrough

- `level: str = "INFO"` — a parameter annotation (`: str`) stating the
  intended type, combined with a default value (`= "INFO"`) — these are
  two independent, combinable pieces of syntax, not the same thing.
- `times: int = 1` — same pattern, a different type.
- `-> dict` / `-> None` — the arrow syntax after the parameter list
  states the function's intended **return** type; `-> None` is the
  real, correct annotation for a function that never returns a
  meaningful value (falls off the end, or has a bare `return`).
- None of this changes what the function actually *does* at runtime —
  `load_settings(12345)` executes its body exactly as written, with
  `level` genuinely bound to the integer `12345`, no conversion or
  rejection happening anywhere.
- `mypy` reads these same annotations statically (without running the
  code at all) and reports a real, specific mismatch — this is the
  concrete, working instance of `static-vs-dynamic-typing.md`'s own
  "gradually-typed system" idea: a static check layered on top of a
  runtime that stays fully dynamic underneath either way.

## CS Lens

This is **optional static type annotation** on top of a dynamically-
typed language — the annotations carry real, structured type
information (readable by tools via Python's own `__annotations__`
machinery, not just decorative comments) without changing the
language's actual runtime semantics at all.

Also recognized in: TypeScript's own parameter/return annotations
(`static-vs-dynamic-typing.md`'s own comparison) — the real, structural
difference being that TypeScript's compiler actually *produces* the
running JavaScript from checked source, while Python's interpreter runs
the original source directly, annotations or not, so nothing Python
itself does is gated on `mypy` ever having been run at all.

## SE Lens

The real, practical value: a reader (or an IDE's real autocomplete)
can tell what a function expects and returns without reading its whole
body, and a tool like `mypy` can catch a real class of mistake — a
caller passing the wrong kind of value — across an entire codebase,
before ever running it, the same real benefit `static-vs-dynamic-
typing.md` already named for statically-checked languages generally.
The real, honest limit: hints are only as good as a team's discipline
running the checker regularly — nothing about Python itself stops
`load_settings(12345)` from shipping and running exactly as shown
above if no one ever runs `mypy` against it.

## Connection

Builds directly on `static-vs-dynamic-typing.md` — this is the real
Python syntax that file's own Try It Yourself #3 already pointed to
without teaching. `mypy`, the first real tool that actually *reads*
these hints in this project's own history, gets its own dedicated
concept once it's introduced for real.

## Try It Yourself

1. Add a third parameter to `greet`, `shout: bool = False`, and use it
   to `.upper()` the greeting when `True`. Confirm both the runtime
   behavior and a `mypy` check pass cleanly for a correctly-typed call.
2. Call `greet(42, times="three")` — both arguments wrong-typed — and
   run both plain Python (observe what actually happens, which line
   fails and why) and `mypy` (observe both errors reported at once,
   before anything ran) against it. Compare what each approach actually
   told you and when.
3. Remove every annotation from both functions and confirm they still
   run identically — real, concrete proof that annotations are
   optional, additive information, never required for the code to work.

## A Second Real Facet: Forward References — Annotating a Type That Doesn't Exist Yet

Every annotation above named a type already fully defined by the time
it was used. A real, common situation breaks that assumption: two
classes that reference *each other* — one of them necessarily gets
defined first, meaning its own methods need to annotate a type that
doesn't exist yet at that point in the file.

```python
class LineNumberArea:
    def __init__(self, editor: "NumberedEditor"):
        self.editor = editor


class NumberedEditor:
    def create_gutter(self) -> LineNumberArea:
        return LineNumberArea(self)


editor = NumberedEditor()
gutter = editor.create_gutter()
print("gutter's editor is the real editor:", gutter.editor is editor)
print("LineNumberArea.__init__ annotation:", LineNumberArea.__init__.__annotations__)
```

**Real output, run this session:**
```
gutter's editor is the real editor: True
LineNumberArea.__init__ annotation: {'editor': 'NumberedEditor'}
```

**What this proves:** `LineNumberArea` is defined *before*
`NumberedEditor` even exists, yet its `__init__` annotates a parameter
as `"NumberedEditor"` — written as a real, quoted **string** — with no
error anywhere. `LineNumberArea.__init__.__annotations__` shows exactly
that: the stored annotation is the literal string `'NumberedEditor'`,
not a resolved class object, because it was never evaluated as real
Python code at definition time at all — just recorded as text.

**A real, current wrinkle worth being honest about:** on Python 3.14
(this environment), the *unquoted* version below — historically the
reason this string-quoting idiom exists at all — no longer fails either:

```python
class Broken:
    def __init__(self, editor: NumberedEditor):  # NOT quoted
        self.editor = editor


class NumberedEditor:
    pass


print("class body executed with NO error, even though NumberedEditor")
print("didn't exist yet at the point Broken was being defined.")
print("Broken.__init__ annotations (resolved lazily, on first access):", Broken.__init__.__annotations__)
```

**Real output, run this session:**
```
class body executed with NO error, even though NumberedEditor
didn't exist yet at the point Broken was being defined.
Broken.__init__ annotations (resolved lazily, on first access): {'editor': <class '__main__.NumberedEditor'>}
```

**What this proves, and the real history behind it:** for years, an
*unquoted* forward reference like `editor: NumberedEditor` genuinely
raised a real `NameError` the instant Python executed that `def` line,
because annotations used to be evaluated **immediately**, as real
expressions, at function-definition time — long before the rest of the
file (including `class NumberedEditor:`) had even run. Quoting the
annotation (`"NumberedEditor"`) sidestepped this entirely by making it
a plain string Python never tried to evaluate as code. Python 3.14
changed the *default* behavior (PEP 649): annotations are now evaluated
**lazily**, only when something actually asks for
`__annotations__`, by which point the whole module has finished
running and `NumberedEditor` genuinely exists — so the unquoted version
above now resolves to the real class object, not a string, with no
error at any point. The quoted, string-based idiom (still seen
throughout real, current code — including this project's own) remains
completely valid and is still required for code that must also run on
Python versions older than 3.14, where the immediate-evaluation
behavior still applies.

### Try It Yourself (second facet)

1. Run the unquoted `Broken` example on an older Python version (3.13 or
   earlier) if one is available, or research PEP 649/PEP 563, and
   confirm it genuinely raises `NameError: name 'NumberedEditor' is not
   defined` there — the real, historical failure this file's quoting
   idiom exists to prevent.
2. Add `from __future__ import annotations` at the top of a fresh
   version of the `Broken` example and compare its
   `__annotations__` output to both versions above — research what this
   import statement actually changes, and on which Python versions it's
   needed at all versus redundant.
3. Explain, in your own words, why `LineNumberArea.__init__.__annotations__`
   staying a plain string forever (even after `NumberedEditor` is fully
   defined) might matter to a tool like `mypy` that wants to check the
   real type — and look up how such tools handle resolving a string
   annotation back into a real type when they need to.

## A Third Real Facet: Generic Container Types (`list[str]`, PEP 585)

Every type shown so far has annotated a single, plain value. A real,
common need is annotating a **container** — a list, dict, or tuple —
stating not just "this is a list" but "this is a list *of strings*":

```python
def total_length(names: list[str]) -> int:
    return sum(len(n) for n in names)


print(total_length(["Ana", "Lee"]))

def summarize(pairs: list[tuple[str, int]]) -> dict[str, int]:
    return dict(pairs)


print(summarize([("apples", 3), ("pears", 5)]))

# Python itself still never ENFORCES any of this -- but here, the
# wrong-typed call happens to fail anyway, for an unrelated reason:
try:
    total_length([1, 2, 3])
except TypeError as e:
    print(f"TypeError: {e}")
```

**Real output, run this session:**
```
6
{'apples': 3, 'pears': 5}
TypeError: object of type 'int' has no len()
```

**Real `mypy` output, run this session:**
```
error: List item 0 has incompatible type "int"; expected "str"  [list-item]
error: List item 1 has incompatible type "int"; expected "str"  [list-item]
error: List item 2 has incompatible type "int"; expected "str"  [list-item]
Found 3 errors in 1 file (checked 1 source file)
```

**What this proves:** `list[tuple[str, int]]` and `dict[str, int]`
annotate genuinely **nested** structure — not just "a list" or "a
dict," but exactly what each element or value inside it should be —
and `summarize` used both a `list[...]` parameter and a `dict[...]`
return type in the same real signature. The wrong-typed call
(`total_length([1, 2, 3])`) happened to raise a real `TypeError` at
runtime here — but that's `sum`/`len`'s own doing, not Python enforcing
the hint; a function whose body never actually needed to call `len()`
on each element would run to completion on wrong-typed input with no
error at all, exactly like `load_settings(12345)` in this file's first
real example. `mypy`, by contrast, caught the real mismatch precisely
and immediately, once per bad list element.

**Mechanical note:** `list[str]` (built directly into `list` itself) is
the modern, real syntax — PEP 585, Python 3.9+. Older code sometimes
uses `typing.List[str]` (capital `L`, imported from `typing`) instead,
the identical real meaning, the same "older spelling still valid, newer
one preferred" relationship `python-union-type-pipe-syntax.md`'s own
`Optional`/`Union` vs. `|` contrast already establishes.

### Try It Yourself (third facet)

1. Change `total_length`'s parameter to `list[int]` and pass a real
   list of integers instead — confirm both the runtime call and `mypy`
   now pass cleanly.
2. Annotate a parameter as `dict[str, list[int]]` (a dict mapping
   strings to lists of integers) and construct one real, valid value
   for it — confirm `mypy` accepts it, then break just the innermost
   type and observe where in the nested structure `mypy`'s error points.
3. Look up `typing.List[str]` (the older, `typing`-module spelling) and
   confirm it type-checks identically to `list[str]` under `mypy` —
   direct, real proof they're two spellings of the same real type.

## A Fourth Real Facet: Annotating a Local Variable

Every annotation so far has been on a parameter or a return type. A
real, different need arises when a plain **local variable**, inside a
function body, is deliberately meant to hold more than one type across
different branches:

```python
from PySide6.QtCore import QRegularExpression


def build_needle(query: str, use_regex: bool) -> str | QRegularExpression:
    if use_regex:
        needle = QRegularExpression(query)
    else:
        needle = query
    return needle
```

**Real `mypy` output, run this session:**
```
error: Incompatible types in assignment (expression has type "str", variable has type "QRegularExpression")
Found 1 error in 1 file (checked 1 source file)
```

Adding an explicit local-variable annotation:

```python
def build_needle(query: str, use_regex: bool) -> str | QRegularExpression:
    needle: str | QRegularExpression
    if use_regex:
        needle = QRegularExpression(query)
    else:
        needle = query
    return needle
```

**Real `mypy` output, run this session:**
```
Success: no issues found in 1 source file
```

**What this proves:** with no explicit annotation, `mypy` infers
`needle`'s type from its **first** assignment (`QRegularExpression`,
inside the `if` branch) — then genuinely flags the `else` branch's
`needle = query` (a `str`) as a real type mismatch, since as far as
`mypy` can tell from that first assignment alone, `needle` should only
ever be a `QRegularExpression`. Adding `needle: str | QRegularExpression`
as its own, bare statement (no value assigned on that line — just the
declaration) tells `mypy` up front that this name is deliberately
allowed to hold either type, and both branches now type-check cleanly.

**Mechanical note:** `name: Type` with no `=` is real, valid syntax on
its own — a pure type declaration, establishing what `mypy` should
expect for a name before it's ever assigned, distinct from every prior
example in this file, which always paired an annotation with an
immediate value.

### Try It Yourself (fourth facet)

1. Swap the order of the two branches (assign `needle = query` first)
   with **no** explicit annotation, and confirm `mypy` now infers `str`
   from the first assignment instead, flagging the *other* branch this
   time — direct, real proof the inference genuinely depends on
   assignment order when no explicit annotation exists.
2. Try annotating `needle` with just `str` (not the full union) and
   confirm `mypy` now flags the `QRegularExpression` branch instead —
   an explicit annotation is only "correct" if it actually describes
   every real value the variable can hold.
3. Explain, in your own words, why parameters and return types
   `python-function-type-hints.md`'s earlier facets cover never needed
   this same "declare before assigning" treatment — what's different
   about a plain local variable assigned more than once inside a
   function body?

## A Fifth Real Facet: A Method Returning an Instance of Its Own, Still-Being-Defined Class

The second facet's forward reference involved **two** classes, each
needing the other. A real, distinct, and genuinely more common case:
one class, with a method that returns **another instance of that exact
same class** — a self-reference, not a cross-reference — while that
class's own body is still being executed.

```python
class Node:
    def next_node(self) -> "Node":  # quoted self-reference
        return self


n = Node()
print("call works:", n.next_node() is n)
print("annotations (lazy):", Node.next_node.__annotations__)
```

**Real output, run this session:**
```
call works: True
annotations (lazy): {'return': 'Node'}
```

**What this proves:** exactly like the second facet's two-class case,
`Node` itself doesn't have a real, bound name yet at the point Python
is executing `def next_node(self) -> "Node":` — the class object only
comes into existence once its *entire* body has finished running.
Quoting `"Node"` sidesteps this identically: a plain string, never
evaluated as a real expression at that point.

**Confirming the identical Python 3.14 wrinkle applies here too** — the
*unquoted* self-reference, which historically would have raised
`NameError` for the same reason as the second facet's `Broken` example:

```python
class Node2:
    def next_node(self) -> Node2:  # NOT quoted
        return self


n2 = Node2()
print("unquoted self-reference works too:", n2.next_node() is n2)
print("annotations (resolved lazily):", Node2.next_node.__annotations__)
```

**Real output, run this session:**
```
unquoted self-reference works too: True
annotations (resolved lazily): {'return': <class '__main__.Node2'>}
```

**What this proves:** the identical PEP 649 lazy-evaluation mechanism
the second facet already established covers this case too, with no
separate rule needed — by the time anything actually asks for
`Node2.next_node.__annotations__`, `Node2` is fully defined, so the
unquoted reference resolves cleanly.

**Mechanical note:** this is not a new mechanism — it's the second
facet's own forward-reference rule, applied to the specific, very
common real case of a class whose own methods build or return more
instances of itself (a linked-list `Node`, a fluent builder's `.with_
x()` methods, this project's own `DocumentEditor.active_editor(self) ->
"DocumentEditor": return self`). Worth naming explicitly because it's
easy to assume "the class is being defined right now, so surely its own
name already works inside its own body" — it doesn't, for the identical
real reason a *different*, not-yet-defined class's name doesn't.

### Try It Yourself (fifth facet)

1. Add a second method to `Node`, `with_label(self, label: str) ->
   "Node":`, that sets an attribute and returns `self` — a real, small
   fluent-builder shape — and confirm chaining two calls
   (`Node().with_label("a").with_label("b")`) works exactly as expected.
2. Look up `typing.Self` (available since Python 3.11) as a real,
   purpose-built alternative to quoting the class's own name by hand —
   rewrite `next_node`'s annotation using it and compare which one
   better survives the class later being subclassed.
3. Explain, in your own words, why this project's own real
   `DocumentEditor.active_editor(self) -> "DocumentEditor": return self`
   is a real instance of *this* facet's self-reference case — then
   contrast it with `MultichannelEditorTab.active_editor(self) ->
   DocumentEditor:`, a method on a *different* class returning an
   already-imported `DocumentEditor`, unquoted, with no forward-
   reference problem at all — reasoning about exactly what structural
   difference between the two (same class vs. a different, already-
   fully-defined one) makes only the first one need quoting in the
   first place.
