# Concept: The Liskov Substitution Principle

**What you'll understand by the end:** what it really means for a
subclass to be genuinely substitutable for its base class — not just
"has the same method names," but "honors the same real promises" —
and the concrete, silent failure that shows up when a subclass breaks
that promise instead of signaling it.

**Prerequisites:** `python-classes-instances.md`,
`replace-conditional-with-polymorphism-refactoring.md`.

## Setup

Python 3, no packages needed.

## The Problem

Code written against a base class's own real, documented behavior — "a
successful `push` always increases the stack's size by one" — is
entitled to assume every real subclass honors that same promise; that's
the entire point of polymorphism (`replace-conditional-with-
polymorphism-refactoring.md`'s own payoff depends on it). A subclass
that overrides a method to *quietly* do something different — say,
silently discarding an item instead of storing it — still has the
right method name and the right signature, but genuinely breaks the
base class's own real contract, and any caller written against that
contract gets silently wrong results with no error anywhere.

## The Isolated Example

```python
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        return self._items.pop()

    def __len__(self):
        return len(self._items)


def fill_and_drain(stack, items):
    for item in items:
        stack.push(item)
    print("size after filling with", len(items), "items:", len(stack))
    while len(stack):
        stack.pop()
    print("size after draining:", len(stack))


print("--- plain Stack ---")
fill_and_drain(Stack(), [1, 2, 3])


class SilentlyBoundedStack(Stack):
    def __init__(self, max_size):
        super().__init__()
        self.max_size = max_size

    def push(self, item):
        if len(self._items) < self.max_size:
            self._items.append(item)
        # silently drops the item otherwise -- no error, no signal


print("--- SilentlyBoundedStack(max_size=2), SAME caller code ---")
fill_and_drain(SilentlyBoundedStack(max_size=2), [1, 2, 3])
```

**Real output, run this session:**
```
--- plain Stack ---
size after filling with 3 items: 3
size after draining: 0
--- SilentlyBoundedStack(max_size=2), SAME caller code ---
size after filling with 3 items: 2
size after draining: 0
```

**What this proves:** `fill_and_drain` — completely unmodified,
written entirely against `Stack`'s own real, base-class behavior —
silently reports the wrong size (`2` instead of the real `3` items it
attempted to push) the moment it's handed a `SilentlyBoundedStack`
instead. Nothing raised, nothing warned, no output anywhere hints that
one of the three pushed items was silently discarded — `fill_and_
drain`'s own assumption ("every push increases the size by one") was
quietly violated by a subclass that still has the right method name and
signature, just not the right real behavior.

**The fix isn't "don't bound the stack" — it's "don't violate the
contract silently":**

```python
class StackFull(Exception):
    pass


class HonestBoundedStack(Stack):
    def __init__(self, max_size):
        super().__init__()
        self.max_size = max_size

    def push(self, item):
        if len(self._items) >= self.max_size:
            raise StackFull(f"cannot push: already at max_size={self.max_size}")
        super().push(item)


bounded = HonestBoundedStack(max_size=2)
bounded.push(1)
bounded.push(2)
try:
    bounded.push(3)
except StackFull as e:
    print(f"StackFull: {e}")
print("size stayed correct and honest:", len(bounded))
```

**Real output, run this session:**
```
StackFull: cannot push: already at max_size=2
size stayed correct and honest: 2
```

**What this proves:** `HonestBoundedStack` still can't accept a third
real item — that real, physical constraint doesn't go away — but it
now **fails loudly**, with a real, catchable exception, at the exact
moment the constraint is violated, instead of silently pretending the
push succeeded. A caller using `fill_and_drain` against this version
would get a real, visible `StackFull` failure it can actually handle,
rather than a silently wrong final size.

## Mechanical Walkthrough

- `SilentlyBoundedStack` **is-a** `Stack` in Python's own type system
  (`isinstance(bounded, Stack)` is `True`) — it satisfies every
  mechanical requirement of inheritance — but it is **not** genuinely
  substitutable for `Stack`, because it silently breaks a real behavior
  `Stack`'s own callers are entitled to rely on.
- `HonestBoundedStack` **also** can't do everything `Stack` can (it
  still can't accept unlimited real pushes) — the real, structural
  difference is that it makes this limitation an explicit, catchable
  part of its own contract (`raise StackFull`) rather than a silent
  divergence a caller has no way to detect.
- Liskov Substitution isn't about a subclass having *identical*
  capabilities to its base class — it's about a subclass never
  **silently** violating the base class's own stated promises. A
  subclass that can't honor a promise at all should say so loudly
  (raise, document, or simply not inherit from that base), not pretend
  to comply while quietly doing something else.

## CS Lens

This is the **Liskov Substitution Principle**, the "L" in SOLID,
originally stated formally by Barbara Liskov: if `S` is a subtype of
`T`, objects of type `T` should be replaceable with objects of type `S`
without altering any of the real, desirable properties of the program
(correctness, in particular). It's a real, stricter requirement than
"has the same methods" — it's specifically about **behavioral**
compatibility, not just structural compatibility (the same real
distinction `python-typing-protocol-structural-typing.md`'s own
structural-typing framing doesn't, by itself, guarantee — a `Protocol`
checks that a shape matches, never that the *behavior* behind that
shape honors the same real promises).

Also recognized in: the classic "Square is-a Rectangle" example (a
`Square` that overrides `set_width` to also change its own height
silently breaks a caller that expects `set_width` to leave height
alone); C#/Java's own design guidance around overriding methods
without weakening postconditions or strengthening preconditions,
formalized versions of the identical real idea.

## SE Lens

The real, practical danger LSP names directly: a violation like
`SilentlyBoundedStack`'s doesn't fail at the point of inheritance, or
even necessarily at the point of the bad override — it fails later,
silently, at whatever real call site happens to rely on the broken
promise, often far from where the subclass was even defined, making it
genuinely hard to trace back to its real cause. The real, practical
fix demonstrated above costs almost nothing (one `raise` instead of a
silent `if`) and converts an invisible correctness bug into a real,
visible, handleable failure at the exact moment and place it actually
happens.

## Connection

Builds on `python-classes-instances.md` and directly enables
`replace-conditional-with-polymorphism-refactoring.md`'s own real
payoff — polymorphic dispatch is only trustworthy if every real
subtype genuinely honors the base type's own contract; a caller that
stops checking `isinstance` and starts trusting polymorphism is exactly
the caller LSP violations hurt the worst. A real, applied instance in
this project's own history: every real implementer of its shared
tab-content interface is fully substitutable everywhere that interface
is used — none of them silently do something different from what every
caller of `active_editor()`/`all_editors()` already assumes, which is
precisely what makes collapsing the old `isinstance`/`elif` chain into
one polymorphic call (that same refactoring) actually safe to do.

## Try It Yourself

1. Write a third subclass, `LoggingStack`, that overrides `push` to
   print a message and then call `super().push(item)` — confirm it's
   genuinely, fully substitutable for `Stack` (run it through `fill_
   and_drain` unmodified) because it adds behavior without breaking
   the base contract at all.
2. Find a real, different way `SilentlyBoundedStack` could violate
   `Stack`'s contract beyond the one shown here (consider `pop()` on an
   empty stack, or `__len__`'s own real meaning) and reason about
   whether your candidate is a genuine LSP violation or just a
   different, still-honest real behavior.
3. Revisit the classic "Square is-a Rectangle" example independently —
   write a small, real, executed version demonstrating a `Square`
   subclass breaking a caller that assumes `set_width` never affects
   height — and compare its shape directly against this file's own
   `SilentlyBoundedStack` example.
