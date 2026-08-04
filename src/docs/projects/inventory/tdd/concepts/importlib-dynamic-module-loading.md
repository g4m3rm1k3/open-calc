# Concept: Loading and Running an Arbitrary `.py` File at Runtime, by Path

**What you'll understand by the end:** how `importlib.util.
spec_from_file_location`/`module_from_spec`/`exec_module` load and
execute a real Python file chosen at **runtime**, by its filesystem
path — not a normal `import` statement, which only ever works against
modules already known at the time the code was written — and how
introspecting the loaded module's own namespace (`vars(module)`) finds
whatever real class it defines, without knowing that class's name in
advance.

**Prerequisites:** `python-inheritance-and-super.md`,
`template-method-pattern.md`.

## Setup

Python 3, no packages needed — `importlib` is standard library.

## The Problem

An ordinary `import some_module` statement needs the module's own
name written directly into the code, resolved once, at import time,
against whatever's on `sys.path` — it has no way to load a file whose
real path is only known **while the program is already running** (a
user-provided plugin file, a per-installation customization file sitting
in a folder nobody could have named in advance). Some real extensibility
needs genuinely can't be satisfied by any `import` statement, no matter
how it's phrased.

## The Isolated Example

A base class defining default, overridable behavior:

```python
class BaseGreeter:
    def greeting(self, name):
        return f"Hello, {name}."
```

A real, external file — written independently, on disk, discovered
only at runtime — defining a real override:

```python
from greeter_base import BaseGreeter


class GreetingOverride(BaseGreeter):
    def greeting(self, name):
        return f"Ahoy, {name}!"
```

The real loader — no `import custom_greeting` anywhere in this code,
because at the time this file is written, that file's name (or even
its existence) isn't known yet:

```python
import importlib.util
import os


def load_override(path):
    if path is None or not os.path.exists(path):
        return BaseGreeter()

    spec = importlib.util.spec_from_file_location("user_override", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    for value in vars(module).values():
        if isinstance(value, type) and issubclass(value, BaseGreeter) and value is not BaseGreeter:
            return value()
    return BaseGreeter()


default = load_override("/nonexistent/path/does/not/exist.py")
print("no override file -- greeting:", default.greeting("Sam"))

custom = load_override("custom_greeting.py")
print("with override file -- greeting:", custom.greeting("Sam"))
print("custom is a real, live instance of a class defined in a file loaded at runtime:", type(custom).__name__)
```

**Real output, run this session:**
```
no override file -- greeting: Hello, Sam.
with override file -- greeting: Ahoy, Sam!
custom is a real, live instance of a class defined in a file loaded at runtime: GreetingOverride
```

**What this proves:** `load_override` genuinely returned two
different real behaviors depending purely on which path was handed to
it at runtime — a **missing** file correctly fell back to the plain
base class (`"Hello, Sam."`), while a **real, existing** override file
was actually loaded, executed, and its own defined subclass
instantiated and used (`"Ahoy, Sam!"`) — `type(custom).__name__`
confirms the returned object is a genuine, live instance of
`GreetingOverride`, a class this code never once names directly
anywhere in its own source.

## Mechanical Walkthrough

- `importlib.util.spec_from_file_location(name, path)` builds a real
  **module spec** — a description of how to load a module — from a
  plain filesystem path, rather than from a dotted module name
  resolved against `sys.path` the way ordinary `import` works.
- `importlib.util.module_from_spec(spec)` creates a real, empty,
  genuine module object from that spec — it exists, but none of the
  target file's own code has run yet.
- `spec.loader.exec_module(module)` actually **runs** the target
  file's code, using `module` as its own namespace — every top-level
  class, function, and variable the file defines becomes an attribute
  of `module`, exactly as if it had been imported normally.
- `vars(module)` returns that module's own namespace as a plain
  `dict` — the loading code can then **introspect** it, checking every
  value to find whatever real class (if any) satisfies a real
  condition (`isinstance(value, type) and issubclass(value,
  BaseGreeter)`), without ever needing to know that class's own name
  in advance.
- A missing or nonexistent path is handled as a real, honest, expected
  case (returning the plain base class) — not an error; a real file
  that exists but fails to execute correctly (a syntax error, a real
  exception) is deliberately **not** caught here, letting it surface
  directly rather than silently falling back.

## CS Lens

This is a real, concrete instance of **dynamic loading** — resolving
what code actually runs at **runtime**, based on real, external data
(a file path) rather than at the time the program was written and
compiled. Combined with `template-method-pattern.md`'s own shape (a
base class defining default hooks, a subclass selectively overriding
specific ones), this is a genuine, real **plugin architecture**: the
*mechanism* for finding and loading a plugin is dynamic (unknown class
names, discovered via introspection), while the *contract* a plugin
must satisfy (subclass a known base, override known methods) stays
statically defined and type-checkable.

Also recognized in: any real plugin system (browser extensions, IDE
plugins, WordPress plugins) that loads third-party code discovered at
runtime, not linked in at build time; Python's own `importlib`-based
plugin discovery patterns (`entry_points` in a real
`pyproject.toml`, resolved dynamically at application startup);
`dlopen`/`LoadLibrary` in C — the identical real idea of loading
executable code by path, chosen at runtime, one level below Python.

## SE Lens

The real, practical payoff: an application's own core code never has
to be modified, or even know in advance, to support a genuinely new,
unanticipated real customization — a user (or a future maintainer) can
add a real `.py` file implementing exactly the specific override their
own situation needs, with zero changes to the application itself. The
real, honest cost is a genuine **trust boundary**: this mechanism
executes arbitrary, real Python code from wherever the given path
points — appropriate specifically when that path is trusted (a file
the application's own user placed there deliberately, on their own
machine), and a real, serious security concern the moment the path (or
its contents) could come from an untrusted source instead.

## Connection

Builds on `python-inheritance-and-super.md` and
`template-method-pattern.md` — the loaded subclass's own real
relationship to the base class is ordinary inheritance; what's new
here is *how* that subclass is found at all. A real, applied instance
in this project's own history: a machine's own behavioral
customization — a real, computed relationship between two axes
(a spindle mirroring another axis's position through a rotation) that
no plain data field could ever express, no matter how many were added
— solved by loading a real, separate `<machine>.overrides.py` file at
runtime and introspecting it for a subclass of the documented base
`MachineOverrides` class, with a missing file treated as an honest
no-op and a real error inside an existing file deliberately left
unswallowed, surfacing directly rather than silently falling back.

## Try It Yourself

1. Write a **second** real override file with a class that does
   **not** subclass `BaseGreeter` at all, and confirm `load_override`
   correctly falls back to the plain base class — direct, real proof
   the introspection loop genuinely checks the subclass relationship,
   not just "any class defined in the file."
2. Add a **second**, unrelated class to the real override file
   (one that doesn't subclass `BaseGreeter`) alongside `GreetingOverride`
   — confirm the loader still correctly finds and uses only the real,
   matching subclass, ignoring the unrelated one.
3. Deliberately introduce a real syntax error into the override file
   and confirm `load_override` raises a real, visible exception rather
   than silently falling back to the base class — reasoning about why
   silently swallowing that error would be the wrong real choice for
   this specific mechanism.
