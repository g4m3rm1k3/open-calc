# Concept: The Interface Segregation Principle

**What you'll understand by the end:** why an interface bundling
together methods that don't all belong together forces implementers to
either fake support for operations they can't really perform, or leave
them broken — and how splitting into smaller, focused interfaces avoids
both.

**Prerequisites:** `python-typing-protocol-structural-typing.md`,
`single-responsibility-principle.md`.

## Setup

Python 3.8+, no packages needed.

## The Problem

A single, broad interface bundling several real operations together —
"anything that handles a file can read it, write it, and delete it" —
quietly assumes every real implementer genuinely supports all three. A
real, read-only implementer (a log viewer, an archived record) doesn't
naturally have a working `write` or `delete` at all — forced to satisfy
the bundled interface anyway, it has exactly two bad options: implement
those methods to do nothing useful, or implement them to raise an
error the moment anyone actually calls them.

## The Isolated Example

The bundled interface — forcing every implementer to claim support for
all three real operations:

```python
from typing import Protocol, runtime_checkable


@runtime_checkable
class FileHandler(Protocol):
    def read(self) -> str: ...
    def write(self, data: str) -> None: ...
    def delete(self) -> None: ...


class ReadOnlyLog:
    def __init__(self, contents):
        self._contents = contents

    def read(self):
        return self._contents

    def write(self, data):
        raise NotImplementedError("read-only log cannot be written to")

    def delete(self):
        raise NotImplementedError("read-only log cannot be deleted")


log = ReadOnlyLog("startup ok")
print("isinstance FileHandler:", isinstance(log, FileHandler))
print("log.read():", log.read())
try:
    log.write("new entry")
except NotImplementedError as e:
    print(f"NotImplementedError: {e}")
```

**Real output, run this session:**
```
isinstance FileHandler: True
log.read(): startup ok
NotImplementedError: read-only log cannot be written to
```

**What this proves:** `ReadOnlyLog` genuinely satisfies `FileHandler`
(`isinstance` reports `True`) — but two-thirds of what it claims to
support don't actually work; calling `.write(...)` on it fails at
runtime, not before, with nothing in the interface itself warning a
caller in advance that this particular `FileHandler` can't really write
anything.

The segregated version — smaller interfaces, each describing exactly
one real capability:

```python
@runtime_checkable
class Readable(Protocol):
    def read(self) -> str: ...


@runtime_checkable
class Writable(Protocol):
    def write(self, data: str) -> None: ...


class ReadOnlyLog2:
    def __init__(self, contents):
        self._contents = contents

    def read(self):
        return self._contents


log2 = ReadOnlyLog2("startup ok")
print("isinstance Readable:", isinstance(log2, Readable))
print("isinstance Writable:", isinstance(log2, Writable))
print("log2.read():", log2.read())
print("has write() at all:", hasattr(log2, "write"))
```

**Real output, run this session:**
```
isinstance Readable: True
isinstance Writable: False
log2.read(): startup ok
has write() at all: False
```

**What this proves:** `ReadOnlyLog2` never claims to be `Writable` at
all — `isinstance(log2, Writable)` genuinely, correctly reports
`False`. There's no `write` method faking support, no
`NotImplementedError` waiting to surprise a caller — any code that
first checks `isinstance(x, Writable)` before calling `.write(...)`
correctly skips `log2` entirely, catching the real mismatch *before*
attempting an operation that was never going to work, rather than
after.

## Mechanical Walkthrough

- A **bundled** interface groups several real operations into one
  contract — implementing it means claiming to support *all* of them,
  whether or not that's genuinely true for a specific real
  implementer.
- A **segregated** set of smaller interfaces lets each implementer
  claim exactly, and only, the real capabilities it actually has —
  `ReadOnlyLog2` is honestly `Readable` and honestly **not** `Writable`,
  with no method pretending otherwise.
- Calling code benefits directly: checking `isinstance(x, Writable)`
  before calling `.write(...)` is only a meaningful, trustworthy guard
  if being `Writable` genuinely implies a working `.write()` — a
  bundled interface where every implementer is automatically
  `FileHandler`-shaped, working or not, can't offer that guarantee at
  all.

## CS Lens

This is the **Interface Segregation Principle**, the "I" in SOLID:
clients shouldn't be forced to depend on (or implementers forced to
satisfy) methods they don't actually use. It's a real, structural
companion to `single-responsibility-principle.md` — SRP asks whether
one unit of *code* has more than one real reason to change; ISP asks
the identical kind of question about an *interface*: does it bundle
more than one real, independently-useful capability that not every
implementer genuinely needs together.

Also recognized in: a "fat" base class in an inheritance hierarchy
that forces every subclass to override methods that don't apply to it
with a `raise NotImplementedError` (the exact real symptom the bundled
`FileHandler` example shows); REST API design guidance recommending
narrow, focused endpoints/resources over one bloated endpoint trying to
serve every possible client's needs at once.

## SE Lens

The real, practical payoff: a segregated interface lets calling code
ask a precise, honest, checkable question ("can this specific thing be
written to?") and get a trustworthy answer *before* attempting the
operation, rather than discovering the truth only via a runtime
failure. The real, honest cost: more interfaces to define and keep
track of — worth it specifically when real implementers genuinely
diverge in which operations they support; not worth it if every real
implementer, in practice, always supports every bundled operation
anyway (in which case the extra interfaces add real indirection for no
real, corresponding benefit — the identical judgment call `avoid-
premature-abstraction.md` already names, applied here to interface
granularity).

## Connection

Builds on `python-typing-protocol-structural-typing.md` (Protocols are
exactly the real mechanism used here to define each segregated
interface) and `single-responsibility-principle.md`. A real, applied
instance in this project's own history: a shared tab-content interface
declaring only the two methods every real tab genuinely, always
supports (getting its active editor, listing all its editors),
deliberately **not** including a "detach a partner editor" operation
that only some, but not all, real tab kinds can actually perform —
that operation lives in its own, separate, smaller interface instead,
satisfied only by the kinds of tabs that genuinely support it.

## Try It Yourself

1. Add a third segregated interface, `Deletable`, and a class that's
   both `Readable` and `Deletable` but not `Writable` — confirm
   `isinstance` correctly reports `True`/`True`/`False` for the three
   checks, with no single method having to fake or reject anything.
2. Write a function `safe_write(x, data)` that checks `isinstance(x,
   Writable)` before calling `.write(data)`, falling back to a clear
   message otherwise — call it with both `log2` (not `Writable`) and a
   real, genuine `Writable` implementer, confirming it never triggers a
   real `NotImplementedError` the way calling `.write()` on the bundled
   `FileHandler` version did.
3. Revisit the bundled `FileHandler` example and count how many of its
   three methods `ReadOnlyLog` can *genuinely* support versus how many
   exist purely to satisfy the interface — reasoning about what real,
   growing problem a fourth and fifth read-only-style implementer would
   each add to that same bundled interface, one `NotImplementedError`
   at a time.
