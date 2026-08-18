# Clojupye Language Specification

Version: initial (produced by Lesson 0, Curriculum.md Section 0.1). This
is the canonical reference every later lesson's "Reference Source" field
may cite by section name below. It is a living document — sections marked
**(principle only, pending Section N)** are intentionally incomplete and
get filled in for real when that section of `Curriculum.md` is
implemented; every other section is a firm rule already in force.

No compiler or interpreter exists yet. This document defines what one
will eventually have to obey.

---

## 1. Syntax

Clojupye is S-expression syntax: every form is either a single atom (a
literal or a symbol) or a delimited sequence of forms.

Delimiters:

```
(  )     list / function call / special form
[  ]     vector
{  }     map
#{ }     set
"  "     string
:name    keyword
'form    reader shorthand for (quote form)
; ...    line comment, runs to end of line
```

**Number vs. symbol disambiguation:** a token is read as a number if it
starts with a digit, or starts with `-` or `+` immediately followed by a
digit. Otherwise, if it starts with a legal symbol character, it is read
as a symbol. This is what allows `-5` to read as negative five while `-`
and `-foo` still read as symbols.

**Symbol characters:** a symbol is either an alphabetic-leading
identifier (letters, digits after the first character, `-`, `?`, `!`)
such as `foo`, `some-name`, `valid?` — or a token made entirely of
symbolic characters (`+ - * / = < > <= >=`), which covers the initial
function names directly. Both shapes are simply symbols; the reader does
not distinguish them.

---

## 2. Values

| Value | Syntax | Self-evaluating? | Python interop mapping |
|---|---|---|---|
| nil | `nil` | yes | `None` |
| boolean | `true`, `false` | yes | `True`, `False` |
| integer | `42`, `-5` | yes | `int` |
| float | `3.14`, `-0.5` | yes | `float` |
| string | `"hello"` | yes | `str` |
| keyword | `:name` | yes, and **interned** — every occurrence of `:name` is the same object | no direct Python equivalent; dedicated type |
| symbol | `foo` | no — evaluates by environment lookup unless quoted | no direct Python equivalent; dedicated type |

String escapes: `\n`, `\t`, `\"`, `\\`, and standard Unicode escapes.

---

## 3. Collections

| Collection | Syntax | Evaluates as | Python interop mapping |
|---|---|---|---|
| list | `(1 2 3)` | **call syntax by default** — see Evaluation Rules | not directly; see `quote` |
| vector | `[1 2 3]` | literal — every element evaluated, never call syntax | `list` (exact mapping detail: **pending Section 18**) |
| map | `{:k v}` | literal — every key and value evaluated | `dict` (exact mapping detail: **pending Section 18**) |
| set | `#{1 2 3}` | literal — every element evaluated, duplicates collapse to one | `set` (exact mapping detail: **pending Section 18**) |

A list is call syntax unless quoted (`'(1 2 3)` or `(quote (1 2 3))`);
vectors, maps, and sets are never call syntax under any circumstance —
this asymmetry is why `quote` exists.

---

## 4. Special forms

| Form | Shape | Rule |
|---|---|---|
| `def` | `(def sym value)` | Evaluates `value` in the current environment; binds `sym` in the **top-level** environment only (no local `def`); evaluates to `sym`. |
| `let` | `(let [sym1 val1 ...] body...)` | Evaluates each binding's value in order, in a new child environment, with earlier bindings already visible to later ones in the same `let`; evaluates body forms in order in that environment; result is the last body form's value; bindings vanish once the `let` ends. |
| `if` | `(if cond then else)` | All three sub-forms required. `cond` evaluated first; based on truthiness, exactly one of `then`/`else` is evaluated — never both, never neither. |
| `do` | `(do form1 form2 ...)` | Evaluates each form in order for side effects; result is the last form's value; `(do)` evaluates to `nil`. |
| `fn` | `(fn [param1 ...] body...)` | Evaluates to a function value. Body is not evaluated until called. At call time, a new environment binds parameters to arguments; its **parent is the environment active when the `fn` form was evaluated**, not the caller's environment — this is the closure rule. |
| `quote` | `(quote form)` | Evaluates to `form`, completely unevaluated. `'form` is reader sugar for the same thing. |

---

## 5. Evaluation rules

- Self-evaluating forms (§2): evaluate to themselves.
- A symbol evaluates by looking itself up through the current
  environment's parent chain, innermost scope first, out to the
  top-level environment. An unbound symbol is an evaluation error (§8).
- A list evaluates by special-form dispatch (§4) if its first element
  names one of the six special forms; otherwise it is an ordinary call:
  evaluate every element left to right, then apply the first result to
  the rest.
- Vectors, maps, and sets evaluate every element (or key and value) and
  collect the results into a new collection of the same kind.

**Truthiness:** only `nil` and `false` are false. Every other value —
including `0`, `0.0`, `""`, and empty collections — is true.

---

## 6. Scope rules

Clojupye is lexically scoped. A symbol resolves to whichever binding
textually encloses the reference in source, found by walking the
environment chain from innermost to outermost. Environments are
parent-linked; `let` and a `fn` call each create a new child environment;
`def` only ever affects the single top-level environment.

An inner binding shadows a same-named outer binding for the extent of the
inner scope; the outer binding is unaffected and reappears once the inner
scope ends.

A `fn` value is a **closure**: it permanently captures the environment
active at its creation point, regardless of where or how many times it
is later called.

---

## 7. Python interoperability rules — (principle only, pending Sections 16–20)

- Primitive values (nil, boolean, integer, float, string) already share a
  runtime representation with their Python equivalents (§2) and require
  no conversion at the interop boundary.
- The compiler interacts with Python **only** through a fixed, generic
  operation set: import, attribute resolution, function call, object
  construction, indexing, iteration, and exception handling — built on
  Python's own generic introspection (`getattr`, `setattr`, `hasattr`,
  `callable`, `isinstance`, `importlib`).
- The compiler is never permitted to gain special-cased knowledge of any
  individual Python library by name (Curriculum.md Section 17's core
  architectural rule).
- Exact conversion rules for compound values (vector/map/set ↔
  list/dict/set) are decided in Section 18.

---

## 8. Module rules — (principle only, pending Section 21)

- A Clojupye source file is a compilation unit.
- `(ns name)` at the top of a file declares that file's namespace.
- `(require ...)` makes another Clojupye module's public names available.
- Exact visibility semantics (what "public" means, opt-in vs. opt-out)
  are decided in Section 21.

---

## 9. Error rules

Two categories, caught at different points:

- **Reader errors** — detected before evaluation begins: unexpected `)`,
  unclosed `(`, `[`, or `{`, invalid number, invalid string.
- **Evaluation errors** — detected while a well-formed program runs: an
  unbound symbol, calling a non-callable value, a special form given the
  wrong number of sub-forms.

Every error carries filename, line, and column once the reader tracks
source positions (Section 3.2 onward); before that, an error is a plain
exception with a message only.

**Philosophy:** errors fail loudly and immediately. No silent coercion —
no automatic `nil`-to-zero, no swallowed exception that lets a program
continue on bad data.
</content>
