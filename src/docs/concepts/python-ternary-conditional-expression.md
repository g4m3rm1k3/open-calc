# Concept: Python's Conditional Expression (`x if condition else y`)

**What you'll understand by the end:** Python's real ternary syntax —
`value_if_true if condition else value_if_false` — how it differs in
word order (but not meaning) from the JS/TS-style `condition ? a : b`,
and how to use it for a real, compact conditional value.

**Prerequisites:** `ternary-conditional-operator.md`.

## Setup

Python 3, no packages needed.

## The Problem

Choosing between two *values* based on a condition — not two different
actions, just two different results to use in the same place — with a
full `if`/`else` statement requires declaring a variable first, then
assigning to it inside each branch, real ceremony for what is
conceptually a single expression. `ternary-conditional-operator.md`
already covers this problem and its JS/TS-style solution in full; this
file exists specifically because that file only *mentions* Python's own
real syntax as a research exercise, never actually demonstrating it —
worth its own real, executed treatment rather than assuming the
JS/TS version transfers by guesswork.

## The Isolated Example

```python
def describe(status_code):
    # Full if/else version
    if status_code < 400:
        label_ifelse = "ok"
    else:
        label_ifelse = "error"

    # Python's ternary ("conditional expression") -- reordered word order
    label_ternary = "ok" if status_code < 400 else "error"

    return label_ifelse, label_ternary


print(describe(200))
print(describe(404))

# A real, common use: choosing between two RETURN VALUES based on a
# condition, inline, with no intermediate variable at all.
def respond(label):
    return ("X", True) if "Find" in label else ("Z", True)


print(respond("Find:"))
print(respond("Replace with:"))
```

**Real output, run this session:**
```
('ok', 'ok')
('error', 'error')
('X', True)
('Z', True)
```

**What this proves:** both the `if`/`else` statement and the ternary
expression produce identical results for every input — the ternary is
not a different capability, only a more compact way to write the exact
same conditional-value logic. `respond`'s own ternary, appearing
directly in a `return` statement with no intermediate variable at all,
shows the real, common case this syntax is reached for: picking one of
two ready-made values inline, based on a simple condition applied to an
argument.

## Mechanical Walkthrough

- `value_if_true if condition else value_if_false` — read left to
  right, this evaluates `condition` first; if truthy, the whole
  expression evaluates to `value_if_true`, and `value_if_false` is
  never computed at all; if falsy, the reverse. This is the identical
  short-circuiting behavior `ternary-conditional-operator.md` already
  describes for the `? :` form — only the *word order* differs, not the
  underlying semantics: Python states the "true" result **first**, then
  the condition, then the "false" result, rather than
  condition-then-true-then-false.
- Because it's a real **expression** (produces a value), it can appear
  anywhere a value is expected — inside a `return` statement directly
  (as `respond` shows), inside a function call's arguments, inside an
  f-string — none of which a full `if`/`else` *statement* can do without
  first being assigned to a variable, exactly the same practical
  advantage `ternary-conditional-operator.md`'s own SE Lens already
  names for the JS/TS form.
- Python deliberately has **no** `? :` operator at all — this
  `x if c else y` form is the *only* real conditional-expression syntax
  Python provides; there's no second, symbol-based alternative to
  choose between.

## CS Lens

This is the identical underlying language-design idea
`ternary-conditional-operator.md`'s own CS Lens already names —
`if` usable directly as an **expression**, not only as a **statement**
— demonstrated here with Python's own real, different concrete syntax
rather than left as an abstract cross-language claim. Python chose a
reordered, more English-like word order (`x if c else y` reads
naturally as "x, if c, else y") over the terser symbolic form several
other C-family languages share.

Also recognized in: the same real design space `ternary-conditional-
operator.md` already surveys — Rust's `if` as a native expression with
no separate ternary syntax at all, SQL's `CASE WHEN ... THEN ... ELSE
... END` — Python's own choice sits between those two: a single,
dedicated conditional-expression syntax (unlike Rust's reuse of `if`
itself), but with English keywords rather than a terse symbol (unlike
`? :`).

## SE Lens

The identical real readability boundary `ternary-conditional-
operator.md` already names applies here unchanged: `"ok" if
status_code < 400 else "error"` reads cleanly in one glance; nesting
two together (`"ok" if x < 400 else "warn" if x < 500 else "error"`)
becomes genuinely harder to read than an equivalent `if`/`elif`/`else`
chain would have been — the same real tradeoff, not a Python-specific
new consideration.

## Connection

Directly extends `ternary-conditional-operator.md`, which names this
exact syntax but never demonstrates it — this file is that
demonstration. A real, applied instance of this syntax appears in this
project's own test code, where a monkeypatched dialog's replacement
function branches on which real argument it received
(`pyside6-qinputdialog-gettext.md`'s stub/fake spectrum,
`test-doubles-and-mocking.md`'s own vocabulary).

## Try It Yourself

1. Rewrite `describe`'s ternary as a nested one (`"ok" if status_code <
   400 else "client error" if status_code < 500 else "server error"`)
   and compare it against an equivalent `if`/`elif`/`else` chain for
   readability, the same exercise `ternary-conditional-operator.md`'s
   own Try It Yourself #1 poses for the JS/TS form.
2. Use a Python ternary directly inside an f-string (`f"status:
   {'ok' if status_code < 400 else 'error'}"`) with no intermediate
   variable — confirm it embeds cleanly inside a larger expression the
   same way the JS/TS template-string case does.
3. Write the identical logic both ways — Python's `x if c else y` and,
   if you have a JS/TS runtime available, `c ? x : y` — for the same
   real condition, and confirm side by side that only the word order
   differs, never the actual result.
