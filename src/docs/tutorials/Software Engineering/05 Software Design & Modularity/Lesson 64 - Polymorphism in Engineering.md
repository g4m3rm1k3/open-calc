# Lesson 64: Polymorphism in Engineering

**What you will build.** A `charge` function decides how to process a
payment with a chain of `isinstance` checks — one branch for
`CreditCard`, one for `PayPal`. It works, until a third payment type,
`GiftCard`, is added, and the very first attempt to charge one raises
`TypeError: unsupported payment method`, because nothing about adding a
new class touched the function that's supposed to handle it. This
lesson gives each payment type its own `charge` method instead, and
rewrites the checkout code to call `payment_method.charge(amount)`
uniformly — at which point adding `GiftCard` requires zero changes to
checkout at all. The transferable problem: Lesson 63 proved what happens
when a type doesn't actually satisfy an interface's real promise; this
lesson is what polymorphism looks like when it's used for its actual
purpose — letting code that doesn't know or care which concrete type
it's holding keep working correctly as new types are added around it.

**What you need to know first.** Substitution (Lesson 63) — the test
this lesson's own `charge` methods are held to; every payment type here
genuinely satisfies the same contract, which is exactly what makes this
lesson's polymorphism safe where Lesson 63's `RushOrder` wasn't.
Interface Design (Lesson 55) — a shared method signature as a real
promise multiple types can each fulfill in their own way.

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

Still the **Design** stage. Carried through: Lesson 63 showed
substitution failing; this lesson shows it succeeding, on purpose, for
the actual reason polymorphism exists in real systems — not code reuse,
which Lesson 62 already separated out, but letting new types join a
system without modifying the code that already works with the old ones.

**Terms introduced in this lesson.** One line each.

- **polymorphism** — the ability for code written against one shared
  interface to work correctly with any type that implements it, without
  needing to know or check which specific type it's actually holding.
  It's distinguished from Lesson 63's demonstration by direction: Lesson
  63 showed what happens when a type doesn't actually satisfy the
  interface it claims to; this lesson is what the same mechanism looks
  like when every type genuinely does.
- **open/closed principle** — the idea that code should be open to new
  behavior — new types can be added — without needing to be modified
  itself to support them. It names precisely what an `isinstance` chain
  violates (every new type requires editing the chain) and what a
  shared, polymorphic method achieves (every new type requires editing
  nothing outside itself).

**Objects and methods used.** None new — ordinary method definitions and
calls, both already established; what's new is using them across
several types that share one method name on purpose, covered in this
lesson's own Concept Unit.

## Concept Unit: One Interface, Many Types, Zero Changes to Add One More

### The Problem

`charge` decides how to process a payment with an `isinstance` chain:

```python
def charge(payment_method, amount):
    if isinstance(payment_method, CreditCard):
        return f"charged ${amount} to card ending {payment_method.number[-4:]}"
    elif isinstance(payment_method, PayPal):
        return f"charged ${amount} via PayPal account {payment_method.email}"
    else:
        raise TypeError(f"unsupported payment method: {type(payment_method).__name__}")
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. `CreditCard` and `PayPal` both work
correctly. A third type, `GiftCard`, is added later — a perfectly
ordinary class, with no obvious mistake in it:

```python
class GiftCard:
    def __init__(self, code):
        self.code = code


gift = GiftCard(code="GC-9921")
try:
    print(charge(gift, 50))
except TypeError as e:
    print("TypeError:", e)
```

Running it produces:

```
TypeError: unsupported payment method: GiftCard
```

`GiftCard` itself has no bug. The bug is that `charge` — code that
already worked, already shipped, already handled two payment types
correctly — has to be found and edited every single time a new payment
type is added, or that new type simply doesn't work, with an error that
gives no hint the fix belongs in a completely different file than the
one that was just written.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `payments.py`, modified — each payment type gains
  its own `charge` method; the standalone `charge` function is replaced.
- **Change type:** refactor.
- **Location:** `CreditCard`, `PayPal`, and `GiftCard`'s own class
  bodies; the calling code that used to call the standalone function.
- **Dependencies:** none.

### The New Code

The smallest new piece is one payment type's own method:

```python
def charge(self, amount):
    return f"charged ${amount} to card ending {self.number[-4:]}"
```

### The Updated Project

Every payment type gets its own `charge` method with the identical
name and parameter shape, and the calling code stops asking which type
it's holding at all:

```python
class CreditCard:
    def __init__(self, number):
        self.number = number

    def charge(self, amount):                                    # ← new
        return f"charged ${amount} to card ending {self.number[-4:]}"  # ← new


class PayPal:
    def __init__(self, email):
        self.email = email

    def charge(self, amount):                                    # ← new
        return f"charged ${amount} via PayPal account {self.email}"  # ← new


def checkout_charge(payment_method, amount):                     # ← changed, replaces isinstance chain
    return payment_method.charge(amount)
```

`checkout_charge` no longer names `CreditCard` or `PayPal` anywhere in
its own body — it calls `.charge(amount)` on whatever it's given, and
trusts that call to work, the same trust every one of this domain's
substitution-safe relationships has been built on since Lesson 63.

### Isolating the Concept: A Shared Method Name Instead of a Type Check

The mechanism doing the real work above — several unrelated types
sharing one method name, called uniformly by code that never checks
which one it's holding — deserves to be seen on its own. Here it is
letting a zoo feed unrelated animals without an `isinstance` in sight:

```python
class Lion:
    def make_sound(self):
        return "roar"


class Duck:
    def make_sound(self):
        return "quack"


def announce(animal):
    return animal.make_sound()


for creature in [Lion(), Duck()]:
    print(announce(creature))
```

Running it produces:

```
roar
quack
```

This is exactly what `checkout_charge` is doing above, isolated:
`announce` never asks `isinstance(creature, Lion)` — it calls
`.make_sound()` and trusts whatever it's holding to answer correctly.
Adding a third animal, `class Snake: def make_sound(self): return
"hiss"`, would need zero changes to `announce` at all, the identical
guarantee `checkout_charge` now has for `GiftCard`. This throwaway
example is now discarded; `Lion` and `Duck` do not appear anywhere else
in this lesson or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def charge(self, amount):`** (on `CreditCard`) — an ordinary method
  definition; nothing about its syntax differs from any other method
  already established in this curriculum. What matters is that `PayPal`
  and `GiftCard` each define a method with this exact same name and
  parameter shape, independently, without inheriting it from anywhere
  shared.
- **`return payment_method.charge(amount)`** (inside `checkout_charge`)
  — an attribute access, `payment_method.charge`, followed immediately
  by a call. Python resolves `.charge` at the moment this line actually
  runs, by looking at whatever object `payment_method` refers to right
  then — a `CreditCard` instance, a `PayPal` instance, or a `GiftCard`
  instance, each contributing its own version of the method being
  called, with `checkout_charge`'s own source code never naming any of
  them.

### CS Lens

This is **polymorphism**, specifically the shape Python (and other
dynamically-typed languages) call **duck typing**: `CreditCard`,
`PayPal`, and `GiftCard` share no common parent class and no declared
interface at all — they're polymorphic purely because each one happens
to define a `charge` method with a compatible shape, and Python resolves
which one runs based on the actual object at the moment of the call, not
on any declared type. This is the same underlying mechanism behind
operator overloading (`+` calling different code for numbers, strings,
or a custom `Money` type), and the identical idea a statically-typed
language expresses through an explicit `interface` or `protocol`
declaration instead of relying on the method simply existing.

Also recognized in: any plugin system where the host code calls
`plugin.run()` on every registered plugin without knowing their concrete
types, a rendering engine calling `.draw()` on a list of unrelated shape
objects, and Python's own `len()` working on strings, lists, and dicts
alike because each defines a compatible `__len__`.

### SE Lens

The principle is **the open/closed principle**: code should be open to
extension — new types can be added — without needing modification itself
to support them. The alternative that was rejected, the `isinstance`
chain, is closed in exactly the wrong place: every new payment type
requires editing `charge`'s own body, code that already worked and
already shipped, which is real, ongoing risk every time it happens —
not just the effort of the edit, but the chance of breaking
`CreditCard` or `PayPal`'s already-correct branches while adding a third
one. The real cost of the polymorphic fix: every payment type now has to
independently guarantee it implements `charge` correctly, with no
central function checking that it does — Lesson 63's substitution test
becomes each new type's own responsibility to satisfy, not something one
`isinstance` chain could ever have verified either, honestly, but easy
to forget is now nobody's job in particular to check.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed `checkout_charge` against all three payment types,
including the one that used to break it:

```python
card = CreditCard(number="4111111111111234")
paypal = PayPal(email="dana@example.com")
gift = GiftCard(code="GC-9921")

print(checkout_charge(card, 50))
print(checkout_charge(paypal, 50))
print(checkout_charge(gift, 50))
```

The real output:

```
charged $50 to card ending 1234
charged $50 via PayPal account dana@example.com
charged $50 against gift card GC-9921
```

All three payment types work through the identical call,
`checkout_charge(payment_method, amount)`, with no branch anywhere
checking which one it received. `GiftCard`'s own `charge` method,
defined entirely inside `GiftCard` itself, is the only new code this
fix required — `checkout_charge`'s own source is completely unchanged
from the moment it was first written this way.

### Connecting Back

Where Lesson 63 proved substitution failing when a subclass narrowed its
parent's promise, this lesson proves it succeeding when several
unrelated types each genuinely keep the same promise on their own terms
— the same underlying test, this time passed by every type it's applied
to.

## Connect the Pieces

A `GiftCard` was charged twice in this lesson, using the identical
`amount`. First, against the `isinstance`-chain version of `charge`:
`TypeError`, because `GiftCard` was never named anywhere inside the
function that was supposed to handle it. Second, against
`checkout_charge`, calling `.charge()` polymorphically: success,
identical in shape to `CreditCard` and `PayPal`'s own results, with
`checkout_charge`'s own source never once mentioning `GiftCard` at all.

## What Breaks Without This

Polymorphism only protects code that actually calls through the shared
interface. Code that still checks concrete types directly gets none of
the benefit, even after every payment type has its own `charge` method:

```python
def apply_loyalty_bonus(payment_method, amount):
    if isinstance(payment_method, CreditCard):
        return amount * 1.05
    return amount


print("loyalty-adjusted total for a gift card:", apply_loyalty_bonus(gift, 50))
```

Run for real, this is what comes back:

```
loyalty-adjusted total for a gift card: 50
```

`apply_loyalty_bonus` never raises an error — `GiftCard` correctly falls
through to the default case — but this function was never rewritten to
use polymorphism at all; it still reasons about concrete types directly,
and every future payment type will need this function checked and
possibly edited by hand, the same maintenance burden `checkout_charge`
no longer has. Fixing one function's use of `isinstance` doesn't
retroactively fix every other function in the same codebase that still
reaches for the same pattern.

## Exercises

1. Rewrite `apply_loyalty_bonus` polymorphically — give each payment
   type its own `loyalty_multiplier` attribute or method, and have
   `apply_loyalty_bonus` read it uniformly, the same way
   `checkout_charge` calls `.charge()`. Prove, with real output, that
   adding a fourth payment type needs no change to
   `apply_loyalty_bonus`'s own body.
2. `Lion` and `Duck`, from this lesson's isolated lab, share no common
   parent class. Would adding one — an `Animal` base class both inherit
   from — change anything about whether `announce` needs to change to
   support a new animal? Justify your answer using this lesson's own
   open/closed test.
3. Find a place in this domain's own earlier running examples —
   `Order`, `Customer`, `InvoiceFormatter` — where an `isinstance` check
   or an equivalent type-based branch already exists, or would be a
   natural first instinct. Decide whether polymorphism would genuinely
   help there, or whether the branch is checking something that isn't
   actually about type at all.

## Definition of Done

- [ ] `CreditCard`, `PayPal`, and `GiftCard` each define their own
      `charge(self, amount)` method.
- [ ] `checkout_charge` contains no `isinstance` check and no reference
      to any specific payment type by name.
- [ ] The Problem section's `TypeError` has been reproduced for real,
      against the *original* `isinstance`-chain version, before you
      apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" `apply_loyalty_bonus` gap has been
      run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `polymorphism:
      give each payment type its own charge method so checkout_charge
      never needs editing to support a new one`, not `remove isinstance
      chain`.

Up next: Lesson 65, Extension Points — designing, on purpose, exactly
where a system is meant to grow new types like `GiftCard`, instead of
discovering it after the fact.
