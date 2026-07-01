# Post 9: Classes, Objects, and OOP Fundamentals

## What you will build

Your own custom types — bundles of data and the functions that act on that
data, grouped together under one name. By the end you'll understand
exactly what `self` means, what actually happens when you write
`SomeClass()`, and you'll have the vocabulary every single post in this
series' glossary section has been quietly assuming you already had.

## What you need to know first

Post 8 (Functions, Parameters, and Stack Frames), and everything before
it. Classes are built directly out of functions and the symbol-table
concept from the variables post — if either feels shaky, those posts are
the ones to revisit first.

---

## The lesson

### Step 1: The problem with separate, disconnected data

Suppose you're tracking information about a dog:

```python
name = "Rex"
breed = "Labrador"
age = 3
```

This works for one dog. For two dogs, you'd need a second, completely
separate set of variables:

```python
name2 = "Fido"
breed2 = "Poodle"
age2 = 1
```

**Walkthrough of why this is a bad design:** Nothing in the code itself
indicates that `name`, `breed`, and `age` belong *together*, describing one
single dog — they're just three independent variables that happen to be
near each other. Worse, this approach doesn't scale: ten dogs would mean
thirty separate, manually-numbered variables, with no way to loop over
"all the dogs" the way the lists post let you loop over a collection. You
need a way to bundle related data into a single, structured unit — and
that unit needs a name to refer to it by.

---

### Step 2: Defining your first class

```python
class Dog:
    def __init__(self, name, breed, age):
        self.name = name
        self.breed = breed
        self.age = age
```

**Walkthrough — new syntax, defined precisely.** `class` is a keyword that
begins a **class definition** — a class is a blueprint or template that
describes what data and behavior every object built from it will have.
`Dog` is the name of this new type, following the convention (not
enforced by Python, but followed almost universally) of starting class
names with a capital letter, distinguishing them visually from variables
and functions.

`def __init__(self, name, breed, age):` defines a special method called
the **constructor** — recall this term briefly from earlier glossary
posts in this series; here it's properly introduced. `__init__` (two
underscores before and after — recall from this series' strings post:
double-underscore names are treated specially by Python, called **dunder
methods**) runs automatically every single time a new `Dog` is created. It
is not called directly by you — Python calls it for you, at the exact
moment a new object is built.

`self` is the first parameter of `__init__`, and of every method you'll
write inside a class. It refers to **the specific object currently being
created or acted on** — not the class `Dog` itself, but one particular dog.
`self.name = name` takes the `name` parameter (an ordinary function
parameter, exactly like the ones from the previous post) and stores it
*on this specific object*, as an **attribute** — a named piece of data that
belongs to this particular object, accessible later via `.name`.

This is genuinely new and worth sitting with directly: `self.name` and
`name` are two *different* things occupying the same line. `name` is a
local variable inside `__init__`'s own stack frame (recall stack frames
from the previous post), existing only while `__init__` is running.
`self.name` is a piece of data attached permanently to the object itself,
existing for as long as the object does — long after this particular call
to `__init__` has finished and its stack frame has been discarded.

```python
rex = Dog("Rex", "Labrador", 3)
print(rex.name)
print(rex.breed)
print(rex.age)
```

```
Rex
Labrador
3
```

**Walkthrough — what actually happens when you write `Dog("Rex",
"Labrador", 3)`.** This is called **instantiation**: creating a specific
**instance** (a specific object built from the class) of `Dog`. Mechanically,
in order: Python creates a new, empty object. Python calls `__init__` on
that new object, automatically passing the new object itself as `self`,
and passing `"Rex"`, `"Labrador"`, `3` as `name`, `breed`, `age`
respectively (matched by position, exactly like an ordinary function call
from the previous post). `__init__` runs its body, setting
`self.name = "Rex"`, `self.breed = "Labrador"`, `self.age = 3` *on that
new object*. The fully-built object is then handed back and bound to the
variable `rex` — note `rex` is just an ordinary variable name, following
the same symbol-table mechanism from the variables post; it happens to
point at a `Dog` object instead of a number or string.

`rex.name` — the dot (`.`) is **attribute access**: "look up the attribute
named `name` on the object `rex`." This is the exact same dot syntax used
throughout this series for calling methods (`"hello".upper()`,
`my_list.append(...)`) — a method call is attribute access followed by
calling the thing you found, and a plain attribute access like `rex.name`
simply retrieves a stored value rather than calling anything.

```python
fido = Dog("Fido", "Poodle", 1)
print(fido.name)
print(rex.name)
```

```
Fido
Rex
```

**Walkthrough:** `rex` and `fido` are two completely separate objects,
each with its own independent set of attributes — exactly like two
separate stack frames from the previous post having their own independent
local variables. Setting `fido`'s attributes via its own call to
`__init__` had zero effect on `rex`'s attributes; each `Dog` instance
holds its own private copy of `name`, `breed`, and `age`.

**CS lens — what is an object, computationally?** An object is, at its
core, its own small symbol table (recall this term from the variables
post) — a mapping from attribute names (`"name"`, `"breed"`, `"age"`) to
values, bundled together with a reference to the class that describes what
methods are available on it. When you write `rex.name`, Python looks up
`"name"` in `rex`'s own personal symbol table, exactly the same lookup
mechanism used for ordinary variables, just scoped to one specific object
instead of to a function call or the top level of your program.

---

### Step 3: Methods — functions that belong to an object

Data alone isn't usually enough — objects typically need behavior too:

```python
class Dog:
    def __init__(self, name, breed, age):
        self.name = name
        self.breed = breed
        self.age = age

    def bark(self):
        print(f"{self.name} says Woof!")

    def have_birthday(self):
        self.age += 1
        print(f"{self.name} is now {self.age} years old.")
```

**Walkthrough:** `bark` and `have_birthday` are **methods** — functions
defined inside a class, automatically receiving `self` (the specific
object the method was called on) as their first parameter, just like
`__init__` does. Notice `bark` and `have_birthday` aren't called with an
explicit `self` argument — that part is handled automatically by Python
based on *which object's dot-syntax you used to call it*.

```python
rex = Dog("Rex", "Labrador", 3)
rex.bark()
rex.have_birthday()
rex.have_birthday()
```

```
Rex says Woof!
Rex is now 4 years old.
Rex is now 5 years old.
```

**Walkthrough — exactly what happens when you write `rex.bark()`.** Python
sees the dot-syntax call and translates it, roughly, into `Dog.bark(rex)`
— the object before the dot is automatically supplied as the `self`
argument. This is worth doing once explicitly to demystify it entirely:

```python
Dog.bark(rex)
```

```
Rex says Woof!
```

**Walkthrough:** This produces identical output to `rex.bark()` — proving
that the dot-syntax form is purely a convenient shorthand for "call this
function, defined inside the class, automatically passing in the object
on the left of the dot as `self`." `have_birthday` demonstrates a method
*modifying* the object's own state: `self.age += 1` (recall the `+=`
shorthand from the variables post) permanently changes `rex`'s `age`
attribute — calling `have_birthday()` twice correctly produces `4` then
`5`, because each call sees the *updated* value left behind by the
previous call. This is the core difference between a class's mutability
(introduced for lists in this series, now appearing for custom objects)
and the immutable values (numbers, strings) covered earlier: objects you
define yourself are mutable by default, and methods routinely change an
object's own attributes as their primary job.

**SE lens — why bundle data and behavior together at all?** This is the
foundational idea of **object-oriented programming** (OOP): rather than
having loose data (`name`, `breed`, `age` as separate variables) and
separate, disconnected functions that operate on that data by being
handed it as arguments, a class bundles both together — the data
`Dog` needs, and every operation that makes sense to perform on a `Dog`,
live in exactly one place, under exactly one name. Anyone reading
`rex.bark()` immediately understands both *what* is being acted on and
*what* is happening to it, without needing to trace through separate
variables and functions to reconstruct that relationship.

**What breaks without this:** Without methods bundled into the class,
`have_birthday`-style logic would need to be a standalone function taking
a dog's data as separate arguments (`have_birthday(name, age)`, returning
a new age the caller would have to remember to store back) — and nothing
would stop that function from being called with mismatched data belonging
to *different* dogs entirely (passing `rex`'s name alongside `fido`'s
age), a class of mistake that bundling data and behavior together inside
one object structurally prevents.

---

### Step 4: Instance attributes vs. class attributes

So far, every attribute (`name`, `breed`, `age`) has been set individually
per object, inside `__init__` — these are called **instance attributes**:
each instance has its own independent copy. Python also supports
**class attributes**: a single value shared by every instance of the
class.

```python
class Dog:
    species = "Canis familiaris"

    def __init__(self, name, breed, age):
        self.name = name
        self.breed = breed
        self.age = age
```

```python
rex = Dog("Rex", "Labrador", 3)
fido = Dog("Fido", "Poodle", 1)

print(rex.species)
print(fido.species)
print(rex.species == fido.species)
```

```
Canis familiaris
Canis familiaris
True
```

**Walkthrough:** `species = "Canis familiaris"`, written directly inside
the class body but *outside* `__init__` (and with no `self.` prefix), is a
class attribute — there is exactly one copy of it, shared by `Dog` itself
and accessible from every instance. Both `rex.species` and `fido.species`
retrieve the same shared value, because neither object has its own
*personal* `species` attribute — Python, finding no instance attribute
named `species` on `rex` specifically, falls back to checking the class
`Dog` itself, and finds it there.

**CS lens — why does this distinction matter?** Class attributes are
appropriate for data that's genuinely the same across every instance and
doesn't vary per object — a constant, a default, a shared configuration
value. Instance attributes are appropriate for data that's specific to
*this particular object* — which is the much more common case, and why
`__init__` setting `self.x = x` is the pattern you'll use for the vast
majority of attributes you define.

**What breaks without understanding this distinction:** A common mistake
is using a *mutable* class attribute (like a list) expecting each instance
to get its own independent copy:

```python
class BrokenDog:
    tricks = []

    def __init__(self, name):
        self.name = name

    def learn_trick(self, trick):
        self.tricks.append(trick)


rex = BrokenDog("Rex")
fido = BrokenDog("Fido")

rex.learn_trick("sit")
print(fido.tricks)
```

```
['sit']
```

**Walkthrough of the bug:** `fido.tricks` shows `"sit"`, a trick that was
only ever taught to `rex` — because `tricks = []` is a *class* attribute,
there is only one shared list, and `self.tricks.append(...)` mutates that
one shared list (recall mutability and shared references directly from
this series' lists post) regardless of which instance's `self` was used
to call it. The fix is moving the list into `__init__` as an instance
attribute: `self.tricks = []`, ensuring each `Dog` gets its own
independent list, created fresh for every new instance.

---

### Step 5: A second class, and the vocabulary this series has been using

Every glossary post in this series so far has used terms like "instance,"
"object," "constructor," and "method" assuming you already had this
vocabulary. This step exists specifically to connect what you've just
learned to that usage directly.

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount

    def __str__(self):
        return f"{self.owner}'s account: ${self.balance:.2f}"
```

**Walkthrough:** `balance=0` is a default argument, exactly as covered in
the previous post — a new `BankAccount` doesn't require an initial balance
to be specified; it defaults to `0` if omitted. `deposit` and `withdraw`
both validate their input *before* changing `self.balance`, raising
`ValueError` (briefly seen in the dictionaries post) on invalid input
rather than silently allowing an account to go negative or accept a
nonsensical deposit. `__str__` is the same dunder method from this
series' Builder pattern post — it controls what `print(some_account)`
displays.

```python
account = BankAccount("Alice", 100)
print(account)

account.deposit(50)
print(account)

account.withdraw(30)
print(account)

try:
    account.withdraw(1000)
except ValueError as e:
    print(f"Error: {e}")
```

```
Alice's account: $100.00
Alice's account: $150.00
Alice's account: $120.00
Error: Insufficient funds
```

**Walkthrough:** This is now familiar in full: `BankAccount("Alice", 100)`
is **instantiation**, calling the **constructor** (`__init__`), creating
an **instance** with two **instance attributes** (`owner`, `balance`).
`.deposit(50)` and `.withdraw(30)` are **method calls**, each implicitly
passing `account` as `self`. The `try`/`except` block (briefly introduced
in this series' Aggregate post, used here in its natural home) catches
the `ValueError` raised by `withdraw`'s validation, preventing the program
from crashing and instead handling the error gracefully.

---

## Connect the pieces

A class is a blueprint; an object (or instance) is one specific thing
built from that blueprint, with its own independent copy of every instance
attribute. `self` is how a method refers to the specific object it was
called on — mechanically, it's just the first parameter of an ordinary
function, automatically supplied by Python's dot-call syntax. `__init__`
is the constructor: a method that runs automatically at creation time to
set up an object's initial state. Everything in this post is built
directly on top of functions and the symbol-table concept from earlier in
this series — a method is a function living inside a class; an object's
attributes are entries in that object's own personal symbol table, looked
up the same way any variable lookup works. Every glossary post in this
series — Proxy, Factory, Observer, Repository, and all the rest — is
built from exactly these mechanics: classes, `__init__`, `self`, instance
attributes, and methods, combined in different shapes to solve different
design problems.

## What breaks without this

Without classes, related data and the functions that operate on it remain
disconnected — scattered variables and functions that *happen* to work
together by convention, with nothing in the code itself enforcing or even
clearly documenting that relationship, and no way to create multiple
independent "copies" of a structured thing (multiple dogs, multiple bank
accounts) without manually duplicating and renumbering variables by hand.

## Definition of done

- [ ] You can define a class with an `__init__` method and at least one
      other method, and create two separate instances of it.
- [ ] You can explain what `self` refers to, and demonstrate (as this post
      did with `Dog.bark(rex)`) that `rex.bark()` is shorthand for passing
      `rex` in explicitly.
- [ ] You can explain the difference between an instance attribute and a
      class attribute, and you've deliberately caused and explained the
      shared-mutable-class-attribute bug from Step 4.
- [ ] You can explain, using the symbol-table vocabulary from the
      variables post, what an object actually is.
- [ ] You've built and run the `BankAccount` example, including
      triggering and catching the `ValueError` from an invalid withdrawal.
- [ ] You can now read back through this series' Proxy/Decorator/Adapter
      post (or any other glossary post) and identify every use of `class`,
      `__init__`, `self`, and method calls without needing them
      re-explained.
