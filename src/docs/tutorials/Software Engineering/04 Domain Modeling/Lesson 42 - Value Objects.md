# Lesson 42: Value Objects

**What you will build.** A `Money` class — an amount and a currency — that
behaves, at first, exactly the opposite of how money should: two `Money`
objects holding the identical amount and currency compare as unequal,
because Python's default `==` asks "are these the literal same object,"
not "do these represent the same value." You'll fix that, and then find
a second, more dangerous problem hiding behind the first: a discount
function that mutates a `Money` object in place, silently corrupting a
second variable that happened to reference the same one.

**What you need to know first.** Lesson 41's entity, and specifically its
closing forward-reference to this lesson: a value object is the category
Lesson 41 defined an entity *against* — sameness by attributes instead of
by identity.

**Terms introduced in this lesson**

- **value object** — a domain object defined entirely by its attribute
  values, with no separate, persistent identity of its own. Two value
  objects holding identical attributes represent the identical value and
  should be treated as interchangeable and equal — unlike Lesson 41's
  entity, where identical attributes never made two different customers
  the same one. Money is a value object: there's no meaningful sense in
  which "this specific five dollars" is a different five dollars than
  "that five dollars" — any five dollars is exactly as good as any other.
- **immutability**, as this lesson applies it — a value object, once
  created, is never changed in place; any operation that would "change"
  it instead produces a new value object, leaving the original untouched.
  This matters specifically because a value object, having no identity of
  its own, is often shared or referenced from more than one place at
  once, and mutating it in place changes it everywhere it's referenced,
  not just where the change was intended.

**Objects and methods used.**

- **`__eq__`** —
  *What it is:* a special method Python calls automatically whenever `==`
  is used between two instances of a class.
  *Implementation:* defined as `def __eq__(self, other):`, returning
  `True` or `False`; if a class doesn't define it, Python falls back to
  comparing object identity — the same check `is` performs.
  *Its use:* this lesson's `Money` class defines it to make `==` compare
  amount and currency, which is what a value object's equality is
  actually supposed to mean.

Pipeline: this lesson continues in the *Domain model* stage, restated per
Lesson 40's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: Two Equal Amounts, Reported as Unequal

### The Problem

Build a small `Money` class — an amount and a currency — and check
whether two instances holding the identical value are equal.

### The Code, Run for Real

```python
class Money:
    def __init__(self, amount, currency):
        self.amount = amount
        self.currency = currency

price = Money(5, "USD")
expected_charge = Money(5, "USD")
```

Compare the attributes directly, then compare the objects themselves with
`==`:

```python
print("same amount and currency:", price.amount == expected_charge.amount and price.currency == expected_charge.currency)
print("price == expected_charge:", price == expected_charge)
```

Running it:

```text
$ python money.py
same amount and currency: True
price == expected_charge: False
```

The attributes genuinely match — `True` — and `price == expected_charge`
still comes back `False`. Without a class saying otherwise, Python's `==`
falls back to the identical check `is` performs: are these two names
pointing at the literal same object in memory? `price` and
`expected_charge` are two separate `Money` instances, so the answer is
no, regardless of what values they hold.

### Mechanical Walkthrough

- `price.amount == expected_charge.amount and price.currency ==
  expected_charge.currency` — already-assumed attribute access, equality,
  and `and`; manually checks the two fields this class actually cares
  about.
- `price == expected_charge` — already-assumed `==` syntax; the new fact
  worth naming is what it does *by default* for a plain class with no
  `__eq__`: falls back to identity comparison, the same thing `is` does,
  which is almost never what a value object actually needs.

### CS Lens

This is Lesson 41's entity distinction, encountered from the value side
instead of the entity side: Python's own default behavior treats every
object as though it were an entity — compared by identity — until told
otherwise, which is exactly backward for something like `Money`, where
no two instances should ever need to be told apart at all.

### SE Lens

This isn't a Python design flaw — identity comparison is the only
generically correct default a language can pick without knowing what a
class actually represents. The responsibility falls on whoever writes
`Money` to say, explicitly, that this particular class represents a
value, not an entity, and that its `==` should mean something different
from the language's own default.

---

## Concept Unit: Defining What "Equal" Actually Means for a Value

### The Problem

Tell Python what `Money`'s own equality should actually check.

### The New Code

```python
class Money:
    def __init__(self, amount, currency):
        self.amount = amount
        self.currency = currency

    def __eq__(self, other):
        return self.amount == other.amount and self.currency == other.currency
```

Run the identical comparison from the previous unit, and a new one
against a genuinely different value:

```python
price = Money(5, "USD")
expected_charge = Money(5, "USD")
print("price == expected_charge:", price == expected_charge)

different_currency = Money(5, "EUR")
print("price == different_currency:", price == different_currency)
```

Running it:

```text
$ python money.py
price == expected_charge: True
price == different_currency: False
```

`price == expected_charge` is now correctly `True` — two separate
objects, identical value, reported as equal. `price == different_currency`
is correctly `False` — same amount, different currency, genuinely a
different value.

### The Concept

`__eq__` — given full treatment in this lesson's header — is what
actually makes `Money` behave like a **value object** instead of
inheriting Python's default entity-shaped comparison. This one method is
the entire mechanism: nothing about `Money`'s constructor or its other
behavior needed to change, because the only thing that was ever wrong was
*what equality meant*, exactly the same narrow, precise diagnosis Lesson
34 asked for when a check fails — is the implementation wrong, or is the
comparison itself asking the wrong question?

### CS Lens

This is a real, direct instance of **operator overloading** — giving an
existing operator, `==`, a new, type-specific meaning by defining a
special method Python calls automatically. The same mechanism extends
beyond equality: `__lt__` for `<`, `__add__` for `+`, and others, each
letting a class define what a built-in operator should mean for its own
values.

### SE Lens

Writing `__eq__` is the real, concrete commitment that turns "I built a
class with an amount and a currency" into "I built a value object" — a
decision with consequences beyond this one comparison, which the next
unit shows directly.

---

## Concept Unit: A Value Object Shared, Then Silently Corrupted

### The Problem

Apply a discount to a price — a completely ordinary operation — the
obvious way: modify the `Money` object's `amount` directly.

### The Code, Run for Real

```python
def apply_discount_mutating(money, percent):
    money.amount = money.amount * (1 - percent / 100)
    return money
```

Two variables end up referencing the identical `Money` object — a
realistic mistake, the kind that happens when one value is copied by
reference instead of by value, without anyone noticing:

```python
item1_price = Money(100, "USD")
item2_price = item1_price

apply_discount_mutating(item1_price, 10)
print("item1:", item1_price.amount)
print("item2:", item2_price.amount)
```

Running it:

```text
$ python money.py
item1: 90.0
item2: 90.0
```

`item2_price` was never passed to `apply_discount_mutating` at all — and
its price dropped to `90.0` anyway, because `item2_price` and
`item1_price` were never two separate values to begin with, only two
names for the same one object, and mutating that object's `amount`
changed it for every name pointing at it.

### The Fix

```python
def apply_discount(money, percent):
    return Money(money.amount * (1 - percent / 100), money.currency)
```

Run the identical scenario:

```python
item1_price = Money(100, "USD")
item2_price = item1_price

item1_price_discounted = apply_discount(item1_price, 10)
print("item1 discounted:", item1_price_discounted.amount)
print("item2 (untouched):", item2_price.amount)
```

Running it:

```text
$ python money.py
item1 discounted: 90.0
item2 (untouched): 100
```

`item2_price` correctly stays at `100` — nothing about `apply_discount`
ever modifies the object it's given; it builds and returns a brand-new
`Money` instead, leaving whatever `money` originally pointed at
completely alone, no matter how many other names might be referencing it.

### Mechanical Walkthrough

- `money.amount = money.amount * (1 - percent / 100)` — already-assumed
  attribute assignment; the bug's entire mechanism is right here: this
  line mutates the object `money` refers to, in place, rather than
  creating a new one.
- `return Money(money.amount * (1 - percent / 100), money.currency)` —
  already-assumed constructor call; builds a genuinely new `Money`
  instance, leaving the original `money` object's own `amount` and
  `currency` exactly as they were.

### The Concept

This is **immutability**, given full treatment in this lesson's header,
shown as a real, load-bearing consequence rather than an abstract rule:
because `Money` has no identity of its own, two variables can innocently
end up referencing the exact same instance with nobody intending it —
`item2_price = item1_price` looks harmless precisely because a value
object is supposed to be freely shareable. Mutating a shared value object
in place breaks that assumption silently, corrupting every reference to
it at once. Treating a value object as immutable — always returning a new
value instead of changing an existing one — is what makes sharing it
freely actually safe.

### CS Lens

This is the identical hazard Lesson 9's `mutable-object-aliasing` concern
raises generically, now demonstrated specifically for a class this lesson
already established should behave like a value: two names referencing one
object is completely ordinary and harmless for anything read-only; it
becomes dangerous the instant something mutates the object in place,
because "in place" means everywhere at once.

### SE Lens

The realistic cost of immutability is real, ordinary allocation — every
discount, every currency conversion, every arithmetic operation on
`Money` now creates a new object instead of reusing one. That cost is
worth paying specifically because value objects, by their very nature as
this lesson defined them, get shared and passed around freely, with no
identity to signal "this one's special, don't touch it" — immutability is
what makes that freedom safe instead of a silent, waiting bug.

---

## Connect the Pieces

One value object, two real failures, both traced to the same category
mistake:

1. **Equality, wrong by default** — two `Money` objects holding identical
   values compared as unequal, because nothing told Python this class
   represents a value, not an entity.
2. **Equality, fixed by `__eq__`** — the same two objects now correctly
   compare equal, and a genuinely different value correctly compares
   unequal.
3. **Mutation, silently corrupting a shared reference** — discounting one
   variable's price accidentally discounted a second, unrelated-looking
   variable referencing the identical object.
4. **Fixed by immutability** — a non-mutating `apply_discount` leaves
   every existing reference untouched, returning a new value instead.

## What Breaks Without This

Build a real order system on top of a mutable `Money` with default
identity-based equality. A check confirming "the charged amount matches
the expected amount" fails constantly, for orders that are actually
correct, because `==` never meant what anyone assumed it meant.
Separately, a shared `Money` reference — assigned once and reused,
assuming it's just a harmless value — gets silently discounted twice
somewhere nobody intended, corrupting a real total with no error, no
traceback, and no code anywhere that looks obviously wrong on its own.

## Exercises

1. Add a `__repr__` method to `Money` (research its purpose briefly if
   needed) so that `print(Money(5, "USD"))` displays something readable
   like `Money(5, USD)` instead of a default object address. Confirm with
   real output.
2. Write an `add(self, other)` method on `Money` that returns a new
   `Money` with the summed amount, raising a real error if the two
   currencies don't match. Test both the success case and the error case.
3. Look back at Lesson 33's `ResetToken`. Is it a value object or an
   entity, in this lesson's and Lesson 41's precise sense? Justify your
   answer, and explain what would go wrong if it were treated as the
   other category.

## Definition of Done

- [ ] You can define "value object" in your own words, and explain how it
      differs from Lesson 41's entity.
- [ ] You've reproduced both real failures — wrong-by-default equality
      and silent shared mutation — and confirmed both fixes.
- [ ] You've completed all three exercises.
- [ ] Commit the immutable `Money` class with `__eq__` and the
      non-mutating `apply_discount`. Commit message should explain *why*:
      for example, `Lesson 42 — Money now compares by value instead of
      identity, and apply_discount returns a new instance instead of
      mutating a possibly-shared one.`
