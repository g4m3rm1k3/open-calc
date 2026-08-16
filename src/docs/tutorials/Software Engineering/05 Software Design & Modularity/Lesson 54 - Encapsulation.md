# Lesson 54: Encapsulation

**What you will build.** `Customer.get_shipping_address()` looks like a
proper, encapsulated accessor — a method, not a bare public field — but
it returns the real internal dict, not a copy of it. Anyone holding the
result can mutate it directly, and the change lands on `Customer`'s own
private data, no method call involved. This lesson fixes it by returning
a defensive copy, and adds a real `update_shipping_address` method as
the one sanctioned way to actually change it. The transferable problem:
having a method stand between outside code and an object's data isn't
the same as that data actually being protected — a getter that hands
back a mutable reference to the real internal object provides the
appearance of encapsulation without any of its substance.

**What you need to know first.** Aggregates (Lesson 49) — `Order._lines`
protected by returning a `tuple` instead of the real list; this lesson
names the general principle that fix was already a specific case of, and
applies it to a `dict` instead of a `list`. Information Hiding (Lesson
53) — the same underlying instinct applied to a module's own internal
data; this lesson is where both of those earlier fixes get their shared
name. Value Objects (Lesson 42) — the earlier, real bug from a shared
mutable reference this domain's own history already demonstrated once,
now recurring at the level of a getter method instead of a bare
assignment.

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

Still the **Design** stage. Carried through: Lessons 52 and 53 each
protected one specific kind of boundary — a namespace, then a module's
internal representation. This lesson names the principle both of those
were already instances of, the same way Lesson 51 named "domain
language" only after eleven lessons had already been practicing it.

**Terms introduced in this lesson.** One line each.

- **encapsulation** — bundling a piece of data together with the
  operations allowed to change it, so that state and the behavior
  responsible for keeping it valid live in one place instead of being
  separated. It's the general principle underneath both Lesson 49's
  `Order._lines` and Lesson 53's `_ORDER_TRANSITIONS` — both were
  specific applications of this one idea, one at the level of a single
  object, one at the level of a module.
- **defensive copy** — a fresh, independent copy of a piece of mutable
  data, handed out instead of the real internal reference, so changes
  made to the copy can never reach the original. It's worth naming
  because "has a getter method" and "is actually protected" are not the
  same claim — a getter that returns the real internal object provides
  the appearance of encapsulation without any of its substance, and a
  defensive copy is specifically what closes that gap.

**Objects and methods used.**

- **`dict(mapping)`** (Python's built-in dict constructor, called on an
  existing dict)
  - *What it is:* a built-in that builds a new, independent dict from
    the key-value pairs of an existing mapping.
  - *Implementation:* `dict(self._shipping_address)` copies every
    key-value pair currently in `self._shipping_address` into a
    brand-new dict object; the new dict and the original share no
    identity — mutating one has no effect on the other, the same
    relationship `tuple(self._lines)` already established between a
    tuple and the list it was built from in Lesson 49.
  - *Its use:* this lesson uses it to hand external code a safe,
    independent copy of `_shipping_address` instead of the real
    dict, closing the exact leak this lesson's Problem section
    demonstrates.

## Concept Unit: A Getter Is Not a Guarantee

### The Problem

`Customer` gains a shipping address, stored privately, with a getter
method that looks properly encapsulated — a method call, not a bare
attribute:

```python
class Customer:
    def __init__(self, customer_id, name):
        self.customer_id = customer_id
        self.name = name
        self._shipping_address = {"street": "100 Main St", "city": "Springfield"}

    def get_shipping_address(self):
        return self._shipping_address


customer = Customer(customer_id=17, name="Dana")
address = customer.get_shipping_address()
address["city"] = "Shelbyville"
print("customer's real shipping city:", customer.get_shipping_address()["city"])
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
customer's real shipping city: Shelbyville
```

Nobody called a setter. Nobody touched `customer._shipping_address`
directly, past any underscore. The caller simply edited the dict
`get_shipping_address()` handed back — and because that dict *is*
`self._shipping_address`, not a copy of it, the edit landed on
`Customer`'s own real data. `get_shipping_address` looks exactly like
the kind of proper, guarded access this domain has been building toward
since Lesson 49 — a method standing between outside code and internal
state — and it provides none of the protection that shape usually
implies, because what it returns is a live reference to the real thing,
not a snapshot of it.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Customer` example, not a port of an external
  reference codebase.
- **Files affected:** `customers.py`, modified.
- **Change type:** refactor — `get_shipping_address` returns a copy
  instead of the real dict; a new `update_shipping_address` method
  becomes the one sanctioned way to actually change it.
- **Location:** inside `Customer`, alongside `__init__`.
- **Dependencies:** none.

### The New Code

The smallest new piece is the copy itself:

```python
def get_shipping_address(self):
    return dict(self._shipping_address)
```

### The Updated Project

`Customer` gains a real update method alongside the now-safe getter, so
there's exactly one sanctioned way to change the address and one safe
way to read it:

```python
class Customer:
    def __init__(self, customer_id, name):
        self.customer_id = customer_id
        self.name = name
        self._shipping_address = {"street": "100 Main St", "city": "Springfield"}

    def get_shipping_address(self):
        return dict(self._shipping_address)                    # ← changed

    def update_shipping_address(self, city=None, street=None):   # ← new
        if city is not None:                                      # ← new
            self._shipping_address["city"] = city                 # ← new
        if street is not None:                                     # ← new
            self._shipping_address["street"] = street               # ← new
```

`get_shipping_address` no longer hands out anything that can reach
`self._shipping_address`; `update_shipping_address` is the only method
that touches the real dict directly, and it does so deliberately, one
named field at a time.

### Isolating the Concept: A Copy Instead of a Reference

The mechanism doing the real work above — returning a copy from a getter
instead of the real internal object — deserves to be seen on its own.
Here it is protecting a bank account's transaction history instead of a
customer's address:

```python
class BankAccount:
    def __init__(self, owner):
        self.owner = owner
        self._transaction_log = ["opened account"]

    def get_transaction_log(self):
        return list(self._transaction_log)

    def deposit(self, amount):
        self._transaction_log.append(f"deposit {amount}")


account = BankAccount(owner="Dana")
log = account.get_transaction_log()
log.append("forged withdrawal 10000")
print("real log after external tampering attempt:", account.get_transaction_log())

account.deposit(50)
print("real log after sanctioned deposit:", account.get_transaction_log())
```

Running it produces:

```
real log after external tampering attempt: ['opened account']
real log after sanctioned deposit: ['opened account', 'deposit 50']
```

This is exactly what `get_shipping_address` is doing above, isolated:
`get_transaction_log` returns `list(self._transaction_log)`, a fresh
list built from the real one's current contents, not the real list
itself. Appending a forged entry to what `log` points at does nothing to
`account`'s own real log — the first `print` proves it's untouched. The
second `print`, after a real, sanctioned `deposit` call, shows the log
actually can change, correctly, through the one method that's allowed to
change it. This throwaway example is now discarded; `BankAccount` does
not appear anywhere else in this lesson or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def get_shipping_address(self):`** — an unchanged method signature;
  what changed is entirely in the body, not the shape of the call.
- **`return dict(self._shipping_address)`** — calls Python's built-in
  `dict` constructor with `self._shipping_address`, the real internal
  dict, as its argument. `dict`, given an existing mapping, builds a new
  dict containing copies of the same key-value pairs, the same
  relationship `tuple(some_list)` already established for lists in
  Lesson 49 — the object returned is not `self._shipping_address`, it's
  a different dict that happened to be built from its contents at the
  moment this method ran; nothing done to it afterward reaches the
  original.

### CS Lens

This is **encapsulation**, the general principle both Lesson 49 and
Lesson 53 were already specific applications of: bundling data together
with the operations that are allowed to change it, so that anything
touching that data has to go through code that can enforce the object's
own rules. A getter that leaks a mutable reference is a well-known,
specific failure of this principle — sometimes called breaking
encapsulation "through the back door" — because the object *looks*
encapsulated from the outside (private field, public method) while
actually providing no more protection than a bare public attribute
would have. The identical failure recurs anywhere a language lets a
caller receive a live handle to internal, mutable state instead of a
value: a getter returning a mutable array, a function returning a
reference to an internal buffer, or a cache returning the actual stored
object instead of a copy of it.

Also recognized in: a UI framework's `getChildren()` method that returns
its actual internal list instead of an unmodifiable view, a game engine
handing a script a live reference to a physics object's position vector
instead of a copy, and a caching library returning the cached object
itself rather than a clone, allowing one caller's mutation to corrupt
what every other caller sees as "the cached value."

### SE Lens

The principle is **a boundary drawn around data has to survive contact
with mutable objects, not just immutable ones** — Lesson 49's `tuple`
fix worked cleanly because a tuple genuinely cannot be mutated once
built; this lesson's dict is different, because a dict handed out as-is
remains just as mutable outside the object as inside it. The alternative
that was rejected here — leaving `get_shipping_address` returning the
real dict, and trusting callers not to mutate what they're given — has
the same honest weakness every trust-based fix in this curriculum has
had: it works exactly as long as every caller happens to behave, and
breaks the instant one doesn't, without any warning that it was ever at
risk.

The real cost of a defensive copy: it's a real, if usually small,
performance cost, paid on every single read, whether or not the caller
was ever going to mutate what they received — and for a large enough
piece of data, copying it defensively on every access can become a
genuine tradeoff against just trusting callers, rather than a free
safety net. This lesson's `_shipping_address` is small enough that the
cost is negligible; a codebase working with much larger collections has
to weigh that cost honestly rather than applying "always return a
defensive copy" as an unconditional rule.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed `Customer`, attempting the exact same external
tampering that succeeded before:

```python
customer = Customer(customer_id=17, name="Dana")
address = customer.get_shipping_address()
address["city"] = "Shelbyville"
print("customer's real shipping city after external edit attempt:", customer.get_shipping_address()["city"])

customer.update_shipping_address(city="Ogdenville")
print("customer's real shipping city after sanctioned update:", customer.get_shipping_address()["city"])
```

The real output:

```
customer's real shipping city after external edit attempt: Springfield
customer's real shipping city after sanctioned update: Ogdenville
```

The identical mutation attempt from the Problem section — editing
`"city"` on whatever `get_shipping_address()` returned — now has no
effect at all; the real address stays `"Springfield"`. The second call,
through the new `update_shipping_address` method, does change it,
correctly, to `"Ogdenville"` — proving the fix isn't "nothing can change
the address anymore," it's "only the sanctioned method can."

### Connecting Back

Where Lesson 49 protected a list by handing back an immutable `tuple`,
this lesson protects a dict — a type with no immutable counterpart built
into the language the same way — by handing back a mutable copy
instead, proving the general principle, encapsulation, has more than one
concrete technique depending on what kind of data is actually being
protected.

## Connect the Pieces

Dana's shipping address moved through this lesson twice, with the
identical external mutation attempted both times: reaching into whatever
`get_shipping_address()` returned and editing `"city"` directly. First,
against the leaking getter: the real address changed to `"Shelbyville"`,
with no method call ever touching `Customer`'s own data on purpose.
Second, against the fixed getter: the identical attempt changed nothing
— the real address stayed `"Springfield"` until the new
`update_shipping_address` method changed it deliberately, to
`"Ogdenville"`, through the one path meant to change it.

## What Breaks Without This

`update_shipping_address` only accepts `city` and `street` by name.
Nothing stops code that already has a reference to the real dict — from
before this fix existed, or from code inside `Customer` itself — from
still mutating it directly, the same honest limit every encapsulation
fix in this domain has had:

```python
customer = Customer(customer_id=17, name="Dana")
customer._shipping_address["city"] = "Capital City"
print("real city after reaching past the underscore:", customer.get_shipping_address()["city"])
```

Run for real, this is what comes back:

```
real city after reaching past the underscore: Capital City
```

`_shipping_address` is still an ordinary, real, mutable dict — the
defensive copy only protects what's handed *out* through
`get_shipping_address`; it does nothing about code that reaches the real
attribute directly. This is the identical limit named in Lesson 49 and
Lesson 53: a leading underscore is a signal a well-behaved caller
respects, not a lock the language enforces.

## Exercises

1. `update_shipping_address` currently accepts any string for `city`,
   including an empty one. Add a validation check — reusing the shape of
   `Order.add_line`'s quantity check from Lesson 49 — that rejects a
   blank city with a `ValueError`, and prove it with real output.
2. Write a `get_transaction_count(account)` function for the
   `BankAccount` lab that returns `len(account.get_transaction_log())`.
   Should it call `get_transaction_log()` (the safe, copying version) or
   reach for `account._transaction_log` directly? Justify your answer
   using the real cost tradeoff named in this lesson's SE Lens.
3. Find one place in a project you've worked on, or plan to build, where
   a method returns a list, dict, or other mutable object directly from
   an object's own internal state. Decide whether it needs a defensive
   copy, and write two sentences on how you'd tell — what's the real
   cost of copying it on every read, for that specific piece of data?

## Definition of Done

- [ ] `get_shipping_address` returns `dict(self._shipping_address)`, not
      the real dict.
- [ ] `update_shipping_address` exists as the one sanctioned way to
      change the address.
- [ ] The Problem section's leak has been reproduced for real, against
      the *original*, non-copying getter, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" underscore-bypass has been run
      against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `encapsulation:
      return a copy from get_shipping_address so callers can't mutate
      Customer's real internal state through the getter`, not `fix
      getter`.

Up next: Lesson 55, Interface Design — not just what a module or object
hides, but how to shape the parts it deliberately exposes so they're
actually good to depend on.
