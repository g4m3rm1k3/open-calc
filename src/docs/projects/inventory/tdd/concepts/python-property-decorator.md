# Concept: The `@property` Decorator

**What you'll understand by the end:** how `@property` lets a method
be accessed using plain attribute syntax (`obj.value`, no parentheses)
instead of a method call (`obj.value()`), why that matters for
computed or validated values, and how `@x.setter` extends the same
mechanism to assignment (`obj.value = ...`).

**Prerequisites:** `single-responsibility-principle.md` (for the
"computed vs. stored" distinction this file builds on).

## Setup

Python 3, no packages needed.

## The Problem

A plain instance attribute (`self.celsius = 20`) is just a stored
value — reading it back gives exactly what was last assigned, with no
code running in between. Sometimes what looks like a simple attribute
should actually be **computed** on the fly (a Fahrenheit reading
derived from a stored Celsius value) or should run real logic when
**assigned** (converting an incoming Fahrenheit value back to Celsius
before storing it) — without forcing every caller to write
`obj.get_value()`/`obj.set_value(x)` instead of the plain, natural
`obj.value`/`obj.value = x` syntax.

## The Isolated Example

```python
class Thermostat:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        self._celsius = (value - 32) * 5 / 9


t = Thermostat(20)
print("celsius:", t._celsius)
print("fahrenheit (read like an attribute, no parens):", t.fahrenheit)

t.fahrenheit = 100  # assignment, not a method call -- runs the setter
print("after setting fahrenheit = 100 -- celsius:", round(t._celsius, 2))
print("after setting fahrenheit = 100 -- fahrenheit:", t.fahrenheit)
```

**Real output, run this session:**
```
celsius: 20
fahrenheit (read like an attribute, no parens): 68.0
after setting fahrenheit = 100 -- celsius: 37.78
after setting fahrenheit = 100 -- fahrenheit: 100.0
```

**What this proves:** `t.fahrenheit` genuinely runs the `fahrenheit`
method's own code every time it's read (`self._celsius * 9 / 5 + 32`)
— there's no stored `fahrenheit` value anywhere on `t` at all — yet it
reads with plain attribute syntax, no `()`. `t.fahrenheit = 100` is a
real **assignment statement**, not a call, but it genuinely runs the
setter method's own logic (converting 100°F back to ~37.78°C) and
stores the *converted* value — confirmed by `t.fahrenheit` correctly
reading back `100.0` afterward, derived fresh from the newly-stored
Celsius value, not from anything cached.

## Mechanical Walkthrough

- `@property` above a method turns *reading* `instance.method_name`
  (no parentheses) into a call to that method — the method's return
  value becomes what the attribute access evaluates to.
- `@fahrenheit.setter` above a **second** method of the same name
  registers it as what runs when code *assigns* to `instance.
  fahrenheit` — the assigned value is passed as that method's own
  argument (`value` here).
- The underlying stored value (`self._celsius`) is a real, ordinary
  instance attribute — nothing special about it. The leading
  underscore is a real, common convention signaling "treat this as
  the class's own internal detail," not a language rule; `@property`
  itself doesn't require or enforce that convention.
- A `@property` with no matching `@x.setter` is **read-only** —
  attempting to assign to it raises `AttributeError`, a real, useful
  way to expose a computed value while forbidding direct assignment
  to it entirely.

## CS Lens

This is a real, language-level instance of **encapsulation**: the
calling code's own syntax (`t.fahrenheit`, `t.fahrenheit = 100`) stays
identical whether the underlying implementation is a plain stored
value or a computed/validated one — the class is free to change *how*
`fahrenheit` is represented internally (or add new logic to its
getter/setter later) without breaking a single caller, because callers
never had access to the internal representation to begin with.

Also recognized in: Java/C#'s explicit `getX()`/`setX()` accessor-
method convention (the identical real goal, without the calling
syntax staying attribute-like); JavaScript's own `get`/`set` object
and class syntax, a direct language-level equivalent to Python's
`@property`.

## SE Lens

The real, practical payoff this project's own code takes advantage
of: a class can **start** with a plain, ordinary attribute, and later
convert it to a `@property` — with getter/setter logic added — without
changing a single line of calling code anywhere, since the access
syntax (`obj.value`) never had to change. This is a genuinely
different, and often better, migration path than starting with
explicit `get_value()`/`set_value()` methods from day one "in case
logic is ever needed" (that's exactly the kind of speculative
complexity `avoid-premature-abstraction.md` warns against) — a plain
attribute can be upgraded to a `@property` later, precisely when a
real, concrete need for it actually shows up.

## Connection

Builds on the "computed vs. stored" distinction that
`single-responsibility-principle.md`'s own framing of "what a piece of
code is really responsible for" touches on more generally. A real,
applied instance in this project's own history: a document-editing
widget's `dirty` and `current_path` were originally plain instance
attributes; once a single document needed to be shown in **two**
independent, live views at once, both were converted to `@property`s
reading through to state stored on the shared, underlying document
object itself — every existing caller (`editor.dirty`, `editor.
current_path = path`) kept working completely unchanged, because the
attribute-style syntax never had to change, only what ran underneath
it.

## Try It Yourself

1. Remove the `@fahrenheit.setter` method entirely (keep only the
   `@property` getter) and try `t.fahrenheit = 100` — read the real
   `AttributeError` Python raises, confirming a property with no
   setter is genuinely read-only.
2. Add a second property, `kelvin`, computed from `self._celsius` the
   same way `fahrenheit` is — confirm a single stored value can back
   any number of independently computed, read-only or read/write
   properties.
3. Add a validation check inside `fahrenheit`'s setter (e.g., reject
   values that would convert to a Celsius reading below -273.15, the
   real physical minimum) and confirm assigning an invalid value now
   raises whatever error you choose to raise — direct, real proof a
   setter can run arbitrary logic, not just store the value verbatim.
