# Lesson 65: Extension Points

**What you will build.** Lesson 64 made `checkout_charge` polymorphic —
it works with any payment method that has a `.charge()` method, without
naming any concrete type. But something still has to *build* a payment
method from a name, typically loaded from a database or a user's
selection, and `build_payment_method` does that with the identical
`isinstance`-chain shape Lesson 64 just removed from the other side:
`if name == "credit_card": ... elif name == "paypal": ...`. Adding
`GiftCard` still means editing this function, even though `charge()`
itself is already fully polymorphic. This lesson replaces the chain with
a registry — `register_payment_method` — that `GiftCard`'s own file
calls to add itself, so `build_payment_method`'s own source never
changes again. The transferable problem: polymorphism makes *using* many
types uniform; it says nothing about how those types get *discovered* or
*constructed* in the first place — and without a deliberate place for
that to happen, the same modify-existing-code problem Lesson 64 solved
on one side of a system quietly reappears on the other.

**What you need to know first.** Polymorphism in Engineering (Lesson
64) — `charge()` as a shared interface; this lesson is about the
construction step Lesson 64's own fix didn't cover. Dependency Inversion
(Lesson 61) — `register_transition_listener` as an earlier, close
cousin of this lesson's registry: both let one side of a relationship
add itself without the other side needing to know it exists.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Design** stage. Carried through: Lesson 64 made the *use* of
several types uniform; this lesson makes their *discovery* uniform too
— the last piece needed before a new type can be added to this system
with truly zero edits to anything that already exists.

**Terms introduced in this lesson.** One line each.

- **extension point** — a place in a system deliberately designed for
  new implementations to be added, without editing the code that
  already exists there. It's distinguished from Lesson 64's
  polymorphism by what it covers: polymorphism is "this system works
  uniformly once you already have an object"; an extension point is "this
  system has a designed place for a brand-new type to plug itself in
  before that."
- **self-registration** — a pattern where a new implementation adds
  itself to a shared registry at the moment it's defined, rather than
  the registry's own code needing to know about every implementation in
  advance. It's the specific mechanism that lets `build_payment_method`
  stay genuinely unmodified when `GiftCard` is added — nothing in the
  registry's file changes; the new file does the work of announcing
  itself.

**Objects and methods used.** None new — an ordinary module-level dict
and function calls, both already established; what's new is using them
as a registry other files write into, the same shape Lesson 61's
listener list already introduced for a different purpose.

## Concept Unit: A Registry Instead of a Chain of Names

### The Problem

`build_payment_method` constructs a payment method from a plain string
name, the same `isinstance`-shaped chain Lesson 64 already removed from
the *calling* side of this system:

```python
def build_payment_method(name, *args, **kwargs):
    if name == "credit_card":
        return CreditCard(*args, **kwargs)
    elif name == "paypal":
        return PayPal(*args, **kwargs)
    else:
        raise ValueError(f"unsupported payment method: {name!r}")
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. `GiftCard`, added the same way Lesson 64
added it, still isn't buildable this way:

```python
try:
    build_payment_method("gift_card", code="GC-9921")
except ValueError as e:
    print("ValueError:", e)
```

Running it produces:

```
ValueError: unsupported payment method: 'gift_card'
```

`GiftCard.charge()` works perfectly — Lesson 64 already proved that.
This function was never touched to know `GiftCard` exists at all, and
nothing about *defining* `GiftCard` in its own file does anything to fix
that; `build_payment_method` still has to be found and edited by hand,
every single time, exactly the maintenance burden this domain has been
removing from every other relationship since Lesson 57.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `payments.py`, gaining a registry; `gift_card.py`,
  a new file, registering itself.
- **Change type:** add — `PAYMENT_METHOD_REGISTRY`,
  `register_payment_method`, and a rewritten `build_payment_method`.
- **Location:** module level in `payments.py`; a new top-level
  registration call in `gift_card.py`.
- **Dependencies:** none.

### The New Code

The smallest new piece is the registration function itself:

```python
PAYMENT_METHOD_REGISTRY = {}


def register_payment_method(name, factory):
    PAYMENT_METHOD_REGISTRY[name] = factory
```

### The Updated Project

`build_payment_method` looks the new name up in the registry instead of
checking it against a hardcoded chain, and `GiftCard`'s own file
registers itself:

```python
PAYMENT_METHOD_REGISTRY = {}                                   # ← new  (payments.py)


def register_payment_method(name, factory):                     # ← new
    PAYMENT_METHOD_REGISTRY[name] = factory                       # ← new


def build_payment_method(name, *args, **kwargs):                 # ← changed
    if name not in PAYMENT_METHOD_REGISTRY:                        # ← changed
        raise ValueError(f"no payment method registered under {name!r}")
    return PAYMENT_METHOD_REGISTRY[name](*args, **kwargs)           # ← changed


register_payment_method("credit_card", CreditCard)                # ← new
register_payment_method("paypal", PayPal)                          # ← new
```

`gift_card.py`, a new file, never touches `payments.py` at all — it
defines `GiftCard` and registers it in the same breath:

```python
class GiftCard:                                                # gift_card.py    # ← new file
    def __init__(self, code):
        self.code = code

    def charge(self, amount):
        return f"charged ${amount} against gift card {self.code}"


register_payment_method("gift_card", GiftCard)                   # ← new
```

`build_payment_method`'s own source, inside `payments.py`, is identical
before and after `gift_card.py` exists — the registry is what changed,
not the function that reads it.

### Isolating the Concept: New Code Announces Itself, Instead of Being Looked Up

The mechanism doing the real work above — a shared registry that new
code writes into at definition time, read generically by code that never
names any specific entry — deserves to be seen on its own. Here it is
letting a document renderer support a new file format without editing
its own dispatch logic:

```python
RENDERERS = {}


def register_renderer(extension, render_fn):
    RENDERERS[extension] = render_fn


def render(path, content):
    extension = path.rsplit(".", 1)[-1]
    if extension not in RENDERERS:
        raise ValueError(f"no renderer registered for .{extension}")
    return RENDERERS[extension](content)


register_renderer("txt", lambda content: content)
register_renderer("md", lambda content: f"<rendered markdown>{content}</rendered>")

print(render("notes.txt", "hello"))
print(render("notes.md", "hello"))

try:
    render("notes.pdf", "hello")
except ValueError as e:
    print("ValueError:", e)
```

Running it produces:

```
hello
<rendered markdown>hello</rendered>
ValueError: no renderer registered for .pdf
```

This is exactly what `payments.py` is doing above, isolated: `render`
never names `"txt"` or `"md"` specifically anywhere in its own logic —
it looks up whatever extension it's given in `RENDERERS`, the same way
`build_payment_method` looks up whatever name it's given in
`PAYMENT_METHOD_REGISTRY`. A `.pdf` renderer, added later in its own
file, would need one `register_renderer("pdf", ...)` call and zero
changes to `render` itself — exactly `GiftCard`'s own story. This
throwaway example is now discarded; `render` and `RENDERERS` do not
appear anywhere else in this lesson or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`PAYMENT_METHOD_REGISTRY = {}`** — a module-level dict, empty at
  first, mapping a payment method's string name to whatever's callable
  to construct one.
- **`def register_payment_method(name, factory):`** — a function taking
  a name and a `factory` — anything callable with the right arguments to
  build an instance, most often simply the class itself, since calling a
  class is exactly how Python constructs an instance of it.
- **`PAYMENT_METHOD_REGISTRY[name] = factory`** — stores the factory
  under the given name, an ordinary dict assignment; calling this
  function twice with the same name silently replaces the earlier
  registration, a real, deliberate design choice this lesson doesn't
  guard against.
- **`if name not in PAYMENT_METHOD_REGISTRY: raise ValueError(...)`** —
  the one remaining check `build_payment_method` still makes, no longer
  about *which* type was requested, only about *whether anything at all*
  was ever registered under that name.
- **`return PAYMENT_METHOD_REGISTRY[name](*args, **kwargs)`** — looks up
  the stored factory and calls it, forwarding whatever positional and
  keyword arguments the caller supplied, the same mechanism a direct
  `CreditCard(number=...)` call already used, just reached through one
  extra level of indirection.

### CS Lens

This is a **registry pattern**, sometimes called a **factory registry**:
constructing an object indirectly, through a lookup keyed by name,
instead of naming a concrete type or a fixed set of branches directly in
the constructing code. It's the same underlying idea as a plugin
architecture's own plugin-discovery mechanism, an operating system's
device-driver registry mapping hardware identifiers to driver code
without the kernel naming every possible device, and a web framework's
own URL-routing table, mapping a path string to a handler function
registered by whichever module owns that route.

Also recognized in: a dependency-injection container resolving an
interface to a concrete implementation by a registered key, a game
engine's component registry letting a mod add a new entity type without
touching the engine's own source, and Python's own `codecs` module,
which lets a new text encoding register itself for use by `str.encode`
without editing anything inside the standard library.

### SE Lens

The principle is **the place a new type gets discovered deserves the
same design attention as the place it gets used** — the alternative that
was rejected, `build_payment_method`'s own `isinstance`- or
name-checking chain, isn't a different mistake from Lesson 64's; it's
the identical mistake, showing up on the construction side instead of
the calling side, because fixing one didn't automatically fix the other.
The real cost of a registry: registration has to actually happen before
`build_payment_method` is called with a given name — if `gift_card.py`
is never imported anywhere in a running program, `"gift_card"` was never
registered, and `build_payment_method("gift_card", ...)` fails exactly
as if the type didn't exist at all. A registry trades "the dispatcher
has to know about every type in advance" for "every type has to make
sure it actually gets imported" — a different failure mode, not a free
win.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py`, from the
directory containing `payments.py` and `gift_card.py` — the `python`
program, given one positional argument, executes that file's statements
top to bottom, importing whatever local modules it names along the way.

### Run It

Building a `GiftCard` by name, through the registry, with
`payments.py`'s own source unchanged from before `gift_card.py` existed:

```python
import gift_card  # registers "gift_card" as a side effect of import

pm = build_payment_method("gift_card", code="GC-9921")
print(pm.charge(50))
```

The real output:

```
charged $50 against gift card GC-9921
```

`GiftCard` is constructed by its registered name, then charged
polymorphically through the identical `.charge()` interface Lesson 64
already established — construction and use are both now uniform, and
`payments.py`'s own source hasn't needed a single edit since
`register_payment_method` was first written.

### Connecting Back

Where Lesson 64 made using several types uniform, this lesson makes
discovering and constructing them uniform too — the two lessons together
close the entire gap between "a new type exists" and "the rest of the
system can use it," with no step in between requiring anyone to edit
code that already worked.

## Connect the Pieces

`"gift_card"` was passed to `build_payment_method` twice in this lesson.
First, against the hardcoded chain: `ValueError`, because
`build_payment_method`'s own source had no branch for it and nothing
about defining `GiftCard` elsewhere could change that. Second, against
the registry: a real `GiftCard` instance, correctly constructed and
correctly charged, because `gift_card.py` registered itself the moment
it was imported, and `build_payment_method`'s own source never needed to
change to make that possible.

## What Breaks Without This

A registry only knows about what actually got registered. Forgetting to
import the file that does the registering reproduces the exact same
failure a missing `isinstance` branch would have:

```python
# a fresh program that never imports gift_card at all
try:
    build_payment_method("gift_card", code="GC-9921")
except ValueError as e:
    print("ValueError:", e)
```

Run for real, this is what comes back:

```
ValueError: no payment method registered under 'gift_card'
```

`GiftCard`'s own code is completely correct, and it genuinely does
register itself — but only if something, somewhere, actually imports
`gift_card.py` before `build_payment_method("gift_card", ...)` is
called. A registry replaces "the dispatcher forgot about this type" with
"nobody imported the file that would have told the dispatcher about it"
— a real, different failure, not a stronger guarantee that the type is
always available just because it exists somewhere in the codebase.

## Exercises

1. Add a `list_payment_methods()` function that returns every name
   currently in `PAYMENT_METHOD_REGISTRY`, and use it to prove, with real
   output, exactly which payment methods are available before and after
   `import gift_card` runs.
2. The `render` function in this lesson's isolated lab has the identical
   "nobody imported the registering file" risk this lesson's own "What
   Breaks Without This" demonstrated. Reproduce it for a hypothetical
   `.pdf` renderer that's defined but never imported, with real output.
3. `register_payment_method` silently overwrites an existing entry if
   called twice with the same name. Decide whether that's the right
   behavior for this registry, or whether it should raise an error on a
   duplicate registration instead — and justify your answer using a real
   scenario where the current, silent behavior would hide a mistake.

## Definition of Done

- [ ] `PAYMENT_METHOD_REGISTRY` and `register_payment_method` exist in
      `payments.py`; `build_payment_method` reads the registry instead
      of checking names directly.
- [ ] `gift_card.py` exists as its own file and registers `GiftCard`
      at import time.
- [ ] The Problem section's `ValueError` has been reproduced for real,
      against the *original*, hardcoded-chain version, before you apply
      the fix.
- [ ] The "Run It" scenario above runs against your own fixed files and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" missing-import scenario has been
      run against your own files, not just read.
- [ ] Commit, with a message stating *why*: something like `extension
      points: replace build_payment_method's hardcoded chain with a
      registry so a new payment type never requires editing it`, not
      `add registry`.

Up next: Lesson 66, Configuration vs Code — which of a system's own
decisions, like which payment methods are actually enabled, should live
in code at all versus in data that can change without a deployment.
