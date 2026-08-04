# Concept: Class Inheritance and `super()`

**What you'll understand by the end:** how one class can be built on
top of another (inheriting everything it already does), why a
subclass's own `__init__` almost always has to call the parent's
`__init__` explicitly, and what `super()` actually does when it does.

**Prerequisites:** none beyond the assumed floor (classes/instances as
plain data-plus-functions are treated as already known; this file
covers what changes once a *second* class builds on a first one).

## Setup

Python 3, no packages needed.

## The Problem

Two real, different kinds of things (a generic vehicle, a car) often
share real, common structure (both have wheels) while each also needing
something the other doesn't (a car has a brand). Writing `Car` from
scratch, duplicating everything `Vehicle` already does, means every
future fix to the shared part has to be made twice, in two places, with
no guarantee they stay in sync.

## The Isolated Example

```python
class Vehicle:
    def __init__(self, wheels):
        print(f"Vehicle.__init__ running, wheels={wheels}")
        self.wheels = wheels

    def describe(self):
        return f"a vehicle with {self.wheels} wheels"


class Car(Vehicle):
    def __init__(self, brand):
        print(f"Car.__init__ running, brand={brand}")
        super().__init__(wheels=4)
        self.brand = brand

    def describe(self):
        base = super().describe()
        return f"{base} ({self.brand})"


car = Car("Volvo")
print(car.describe())
print(isinstance(car, Vehicle))
print(isinstance(car, Car))
```

**Real output, run this session:**
```
Car.__init__ running, brand=Volvo
Vehicle.__init__ running, wheels=4
a vehicle with 4 wheels (Volvo)
True
True
```

**What this proves:** `Car` never redefines `self.wheels` anywhere in
its own body — `Vehicle.__init__` is the only code that ever sets it,
and `Car`'s own `__init__` reaches it by calling `super().__init__(
wheels=4)` rather than duplicating the assignment. The print order in
the real output (`Car.__init__` first, then `Vehicle.__init__`) shows
the parent's constructor doesn't run automatically before the child's —
it only runs at the exact line `super().__init__(...)` appears, which
`Car` chose to put *after* its own print, not before.

## Mechanical Walkthrough

- `class Car(Vehicle):` — the parentheses after the class name declare
  `Car` as a subclass of `Vehicle`: every attribute and method
  `Vehicle` defines is available on a `Car` instance unless `Car`
  itself defines its own version.
- `super()` returns a real, temporary proxy object bound to the
  *parent* class (`Vehicle`) from the context of the currently-running
  method — `super().__init__(wheels=4)` calls `Vehicle.__init__`
  specifically, passing `wheels=4`, with `self` supplied automatically.
- Without calling `super().__init__(...)`, `Vehicle.__init__` would
  never run at all for a `Car` instance, and `self.wheels` would never
  get set — accessing `car.wheels` afterward would raise
  `AttributeError`, not silently default to anything.
- `Car.describe` **overrides** `Vehicle.describe` (a subclass defining
  a method with the same name replaces the parent's version for its own
  instances) but still calls `super().describe()` to reuse the parent's
  real logic instead of re-deriving the `"a vehicle with N wheels"`
  string itself — overriding a method doesn't require throwing away
  what the parent version already does.
- `isinstance(car, Vehicle)` is `True` even though `car` was
  constructed as a `Car` — a subclass instance genuinely *is* an
  instance of every one of its parent classes too, not merely something
  resembling one.

## CS Lens

This is **inheritance**, one of the foundational ideas of
object-oriented programming: a new type (`Car`) defined in terms of an
existing one (`Vehicle`), automatically receiving its structure and
behavior, and able to add to or override specific pieces without
touching the original class's own code at all. `super()` is the
mechanism for a subclass to still reach the parent's original
implementation of something it has overridden, rather than losing
access to it entirely.

Also recognized in: nearly every object-oriented language's class
hierarchy (Java's `extends` + `super(...)`, C++'s base-class
constructors, JavaScript's `class X extends Y` + `super(...)`) — the
exact keyword and calling convention differ, but the real idea (a
subclass explicitly reaching back to its parent's own implementation)
recurs everywhere classes can be extended.

## SE Lens

The real, practical payoff: a fix or improvement to `Vehicle.__init__`
(say, validating that `wheels` is a positive number) automatically
applies to every subclass that calls `super().__init__(...)`, with zero
changes needed in any of them — the shared logic genuinely lives in
exactly one place. The real cost is a small one, worth naming honestly:
a subclass's constructor has to remember to call `super().__init__(...)`
at all, and with the right arguments — skipping it, or getting the
arguments wrong, is a real, common bug class in inherited hierarchies,
not a purely theoretical risk.

## Connection

This is the prerequisite every later "a widget/class subclasses a
framework base class" concept in this project builds on — any concept
covering a specific base class (a GUI window, a syntax highlighter, an
exception type) assumes this file's own content (subclassing syntax,
`super()`, method overriding) rather than re-explaining it each time.

## Try It Yourself

1. Add a third class, `SportsCar(Car)`, whose `__init__` accepts a
   `top_speed` and calls `super().__init__(brand)` before storing it.
   Confirm `SportsCar.describe()` (inherited unchanged from `Car`, not
   redefined) still works correctly on a `SportsCar` instance.
2. Delete the `super().__init__(wheels=4)` line from `Car.__init__` and
   try to access `car.wheels` afterward. Read the real exception Python
   raises and explain, in your own words, exactly why it happens.
3. Change `Car.describe` to *not* call `super().describe()`, instead
   writing out `f"a vehicle with {self.wheels} wheels ({self.brand})"`
   directly. Confirm the output is identical either way, then explain
   the real, concrete cost of having done it this second way instead
   (what happens if `Vehicle.describe`'s own wording later changes).

## A Second Real Facet: Extending a Method's Behavior, Not Just Initializing Through It

Every `super()` call above is inside `__init__`, purely to initialize
the parent before adding to it. `super()` works identically inside any
other method too — including running the parent's real logic *first*,
then adding genuinely new behavior *after* it, rather than only
delegating construction:

```python
class Vehicle:
    def __init__(self, wheels):
        self.wheels = wheels
        self.speed = 0

    def accelerate(self, amount):
        self.speed += amount
        return self.speed


class Car(Vehicle):
    def __init__(self, brand):
        super().__init__(wheels=4)
        self.brand = brand
        self.top_speed_warnings = 0

    def accelerate(self, amount):
        new_speed = super().accelerate(amount)
        if new_speed > 120:
            self.top_speed_warnings += 1
            print(f"warning: {self.brand} exceeding safe speed ({new_speed})")
        return new_speed


car = Car("Volvo")
print("after +50:", car.accelerate(50))
print("after +80:", car.accelerate(80))
print("warnings so far:", car.top_speed_warnings)
```

**Real output, run this session:**
```
after +50: 50
warning: Volvo exceeding safe speed (130)
after +80: 130
warnings so far: 1
```

**What this proves:** `Car.accelerate` never re-implements the real
speed-tracking logic — `super().accelerate(amount)` does that exact
same work `Vehicle.accelerate` always did, returning the *real,
already-updated* speed (`130` on the second call). `Car`'s own code
only runs *after* that real call returns, adding a genuinely new
behavior (a warning, and a counter) the parent class knows nothing
about. This is a different real shape from `__init__` chaining: there,
`super().__init__(...)` sets up state the subclass then adds *more*
state to; here, `super().accelerate(...)` performs the parent's real
work and returns a real result the subclass's own code goes on to use
and react to.

### Try It Yourself (second facet)

1. Add a third override — `Car.accelerate` currently only *reads*
   `new_speed`; change it to also *cap* the real speed (call
   `super().accelerate(-10)` to correct it back down when a warning
   fires) and confirm `car.speed` reflects the correction on the next
   call.
2. Write a version of `Car.accelerate` that calls `super().accelerate(
   amount)` **after** its own warning-check logic instead of before, and
   explain why that ordering can't work correctly here — the warning
   check genuinely needs the parent's *updated* real speed, not the
   speed from before this call.
3. Compare this file's own two real facets side by side: `__init__`
   calling `super()` once, at the very top, purely to set up shared
   state; `accelerate` calling `super()` mid-method, to reuse the
   parent's real computation and react to its actual result. Both are
   real, valid uses of `super()` — name, in your own words, what
   distinguishes them.
