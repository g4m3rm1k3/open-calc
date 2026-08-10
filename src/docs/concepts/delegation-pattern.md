# Concept: The Delegation Pattern

**What you'll understand by the end:** how one object can deliberately
hold no real state or logic of its own, forwarding every real action to
a second object that actually has what's needed to do the work — and
how this differs from both Adapter (translating an interface) and
ordinary composition (collaborators each doing their own meaningfully
different work).

**Prerequisites:** none beyond the assumed floor.

## Setup

None — plain Python, no packages.

## The Problem

Some real objects exist only to present a particular, simple interface
— a remote control's buttons, a thin wrapper widget — while the actual
state and logic needed to act on that interface genuinely lives
somewhere else, in a different object that already has it. Duplicating
that state and logic into the simple-interface object would create two
places that both have to agree, and could drift out of sync; the
simple object doesn't need its own copy — it needs a way to *hand off*
to the object that already has the real answer.

## The Isolated Example

```python
class Television:
    def __init__(self):
        self.volume = 10
        self.channel = 1
        self.is_on = False

    def turn_on(self):
        self.is_on = True
        return f"TV on, channel {self.channel}, volume {self.volume}"

    def set_volume(self, level):
        self.volume = level
        return f"volume now {self.volume}"


class RemoteControl:
    """Holds no real state or logic of its own -- every real action is
    forwarded straight to the television it controls."""

    def __init__(self, tv):
        self.tv = tv

    def power_button(self):
        return self.tv.turn_on()

    def volume_up(self):
        return self.tv.set_volume(self.tv.volume + 1)


tv = Television()
remote = RemoteControl(tv)
print(remote.power_button())
print(remote.volume_up())
print("remote itself has no volume/channel state:", not hasattr(remote, "volume"))
print("tv's real state actually changed:", tv.is_on, tv.volume)
```

**Real output, run this session:**
```
TV on, channel 1, volume 10
volume now 11
remote itself has no volume/channel state: True
tv's real state actually changed: True 11
```

**What this proves:** `RemoteControl` has no `volume` or `channel`
attribute of its own at all (`hasattr(remote, "volume")` is `False`) —
every real button press immediately calls straight through to `tv`,
and it's `tv`'s own state that actually changes (`is_on: True`,
`volume: 11`). `RemoteControl` never computed or stored anything;
it only forwarded.

## Mechanical Walkthrough

- `RemoteControl.__init__` stores a reference to a real `Television`
  instance — the object that will actually do the work — but sets up
  no other state of its own.
- `power_button()` and `volume_up()` each do exactly one real thing:
  call a method on `self.tv` and return whatever it returns, unchanged.
  Neither method contains any independent logic beyond that one
  forwarding call.
- The delegating object (`RemoteControl`) can still shape *which*
  underlying calls happen and with what arguments (`volume_up` computes
  `self.tv.volume + 1` before forwarding) — delegation doesn't mean
  zero code, it means the *real* state and the *core* logic live
  entirely in the delegate, not duplicated in the delegator.

## CS Lens

This is the **Delegation** pattern: an object forwards a request to a
second, real object rather than implementing the corresponding
behavior itself. It is deliberately **not** the Adapter pattern
(`adapter-pattern.md`) — no interface translation is happening here;
`RemoteControl`'s methods aren't reshaping `Television`'s interface
into a different one, they're simply relaying calls through, largely
unchanged. It's also a narrower, more deliberate case than ordinary
object composition in general — in typical composition, two
collaborating objects each do their own, genuinely different real
work; in delegation specifically, the delegating object deliberately
does *none* of the real work itself, existing only to present a
particular interface on top of another object that does.

Also recognized in: a GUI's thin "view" object that immediately hands
every real action off to a separate "controller" or "model" object
holding the actual application state (the general shape behind many
MVC-style architectures); a proxy or wrapper class whose every method
is a one-line forward to a wrapped object.

## SE Lens

The real, practical payoff: `Television`'s actual state (`volume`,
`channel`, `is_on`) lives in exactly one place — if a bug in volume
tracking needs fixing, or a new real feature (say, muting) needs
adding, it's added once, to `Television`, and `RemoteControl` (or any
other future delegating object built the same way) automatically
reflects it correctly, with no separate, parallel state to keep in
sync. The real cost: a delegating object is, by design, not very useful
on its own — inspecting a `RemoteControl` instance in isolation tells
you almost nothing about the television's actual state; you always
have to follow the reference to `self.tv` to find the real answer.

## Connection

Distinct from `adapter-pattern.md` (translating one interface into a
different one a specific consumer needs) — delegation instead relays
calls through largely unchanged, with the delegating object deliberately
holding no real state of its own. A real, applied instance of this
pattern in this project is a widget deliberately kept "dumb" — a thin
gutter widget's own `sizeHint()`/`paintEvent()` immediately forward to
methods on the real, stateful widget next to it, rather than computing
anything themselves (see `pyside6-custom-widget-painting.md` for that
real, applied Qt context).

## Try It Yourself

1. Add a third real method to `Television` (say, `mute()`), and add a
   matching, purely-forwarding `mute_button()` to `RemoteControl` —
   confirm it requires zero new state on `RemoteControl` itself.
2. Try storing a *copy* of `tv.volume` on `RemoteControl` instead of
   delegating (`self.volume = tv.volume` in `__init__`), then change
   `tv.volume` directly and observe `remote.volume` no longer matches —
   a concrete, real demonstration of exactly the state-duplication risk
   delegation avoids.
3. Build a second `RemoteControl` pointed at the *same* `tv` instance
   and confirm an action taken through either remote is immediately
   visible through the other — both are delegating to the identical,
   single real source of truth.
