# Concept: Guard Clauses (Replace Nested Conditional with Guard Clauses)

**What you'll understand by the end:** how checking the invalid or
trivial case first and returning immediately keeps a function's real
logic flat, and why this is a real, named refactoring — not just "using
`if`."

**Prerequisites:** none beyond the assumed floor.

## Setup

None — plain Python, no packages.

## The Problem

A function that has several conditions to check before doing its real
work can be written two genuinely different ways: nest the real logic
one level deeper inside each passing condition (an "arrow" shape that
drifts rightward with every added check), or check each invalid/trivial
case up front and return immediately, leaving the real logic sitting at
the function's own top level, never nested inside anything. Both can be
completely correct — the difference is how easy the result is to read.

## The Isolated Example

```python
def describe_nested(user):
    if user is not None:
        if user.get("active"):
            if user.get("age", 0) >= 18:
                return f"{user['name']}: eligible"
            else:
                return f"{user['name']}: too young"
        else:
            return "inactive user"
    else:
        return "no user"


def describe_guard(user):
    if user is None:
        return "no user"
    if not user.get("active"):
        return "inactive user"
    if user.get("age", 0) < 18:
        return f"{user['name']}: too young"
    return f"{user['name']}: eligible"


cases = [
    None,
    {"name": "Sam", "active": False},
    {"name": "Ana", "active": True, "age": 16},
    {"name": "Lee", "active": True, "age": 30},
]

for c in cases:
    a = describe_nested(c)
    b = describe_guard(c)
    print(f"{a} | {b} | {a == b}")
```

**Real output, run this session:**
```
no user | no user | True
inactive user | inactive user | True
Ana: too young | Ana: too young | True
Lee: eligible | Lee: eligible | True
```

**What this proves:** every real input produces the identical result
from both functions (`a == b` is `True` on all four cases) — the two
versions are behaviorally interchangeable. The only real difference is
structural: `describe_nested`'s real "eligible" logic sits three `if`
levels deep, wrapped in the exact conditions that must *not* apply for
it to run; `describe_guard`'s identical logic sits at the function's own
top level, with each invalid case disposed of and gone one line at a
time before it.

## Mechanical Walkthrough

- A **guard clause** is an `if` at the top of a function that checks for
  an invalid, trivial, or already-handled case and `return`s (or
  `raise`s) immediately — it never has an `else`, because there's
  nothing left to fall through to once it returns.
- Each guard clause permanently removes one condition from everything
  written below it: by the time `describe_guard` reaches its final
  `return`, it has already ruled out "no user," "inactive," and "too
  young" — the last line can be the plain, unconditional "eligible"
  case with no surrounding `if` at all, because every other case already
  exited.
- The nested version instead keeps *every* condition in scope for the
  entire rest of the function — the "eligible" return is only reachable
  by mentally holding all three conditions (`is not None`, `active`,
  `age >= 18`) true at once, because it's physically nested inside all
  three.
- This is a real, named refactoring from Martin Fowler's catalog:
  **Replace Nested Conditional with Guard Clauses** — a deliberate,
  well-known transformation, not an informal habit.

## CS Lens

This is a concrete reduction in **cyclomatic complexity as experienced
by a reader**, even though the actual number of branches is identical
in both versions — what changes is how many of those branches a reader
has to hold in their head simultaneously to understand any single
`return`. In the nested version, understanding the last branch requires
tracking three levels of enclosing state; in the guarded version, each
branch is independently understandable given only "we got this far,"
because every earlier condition already exited on failure.

Also recognized in: "fail fast" logic in general (`fail-fast-
validation.md`'s validate-immediately idea, applied here to a function's
internal control flow rather than to boundary input); linear,
flat-shaped code as a general readability goal across virtually every
style guide and refactoring text.

## SE Lens

The real, practical cost of the nested shape shows up when a *fifth*
condition needs adding later: in the nested version, it requires another
level of indentation wrapped around the existing innermost logic,
pushing everything deeper; in the guarded version, it's one more early
`if ...: return ...` inserted near the top, and nothing already written
below it needs to be touched or re-indented at all. The guarded version
is also more directly testable-by-reading: each early return states its
own condition and its own result on one line, with nothing else to
cross-reference.

## Connection

This exact pattern already appeared, unnamed, in `python-pathlib-file-
reading.md`'s file-reading code and in earlier boundary-checking code
(an early `if not path: return` disposing of the trivial case before the
real work) — this file gives that already-used shape its real, formal
name for the first time, rather than being its first appearance.
Related to `single-responsibility-principle.md` in spirit: a guard
clause keeps "is this input even usable" cleanly separated from "what do
we do with usable input," rather than braiding the two questions
together inside one nested condition.

## Try It Yourself

1. Add a fifth real condition (say, a `"banned"` flag that should
   short-circuit to `"banned user"`) to both versions and compare how
   much of each function's *existing* code had to change versus how much
   was purely additive.
2. Count the maximum indentation depth of each version's real logic (the
   line that returns `"eligible"`) — confirm the guarded version's is
   exactly one level, regardless of how many guard clauses precede it.
3. Take a real nested-conditional function you've written before (or one
   from this project's own `build-log/`) and rewrite it with guard
   clauses; confirm with a real test, or by hand-checking every input
   case, that the observable behavior is unchanged.
