# Python Tool Database — LAB 06 — Classes and Objects

**Prerequisites:** Lab 05. You know lists, dicts, tuples, sets, and functions. `tooldb/tool.py` already has a `Tool` dataclass from Lab 00f — this lesson explains what that decorator generates and teaches the full class syntax from scratch.

**What this lab adds:**
- What a `class` is: a blueprint for creating objects
- `__init__`: the initializer that sets up each instance's data
- `self`: the reference to the current instance — why it is explicit in Python
- Instance attributes vs class attributes
- Methods: functions that belong to a class and operate on instance data
- `__repr__` and `__str__`: controlling how Python displays objects
- A `Holder` class built from scratch through Red-Green-Refactor

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A class and an object — are they the same thing? If not, how are they related?
> 2. In `def calculate_sfm(diameter_inches, rpm)`, there is no `self` parameter. In a method like `def describe(self)`, where does `self` come from when you call `tool.describe()`?
> 3. The project already has `@dataclass class Tool`. What do you think `@dataclass` is doing to save you from writing?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have a `Holder` class that tracks tool holder data — the physical part that grips the cutting tool and is held by the machine spindle:

```python
holder = Holder(name="CAT40-ER32", taper="CAT40", collet_size_inches=0.5)
print(holder)
# → Holder('CAT40-ER32', taper='CAT40', collet=0.500")

holder.accepts_tool(0.5)   # → True  (this holder can grip a 0.5" shank)
holder.accepts_tool(0.75)  # → False (too large for the collet)
```

---

## Step 1 — Classes: Blueprints for Objects

Open the REPL: `python`

Before writing a class, understand why they exist. Without a class, you represent a holder as a dict:

```python
holder = {
    "name": "CAT40-ER32",
    "taper": "CAT40",
    "collet_size_inches": 0.5,
}
holder["name"]     # access by key
```

Dicts work but have two problems:
1. **No behavior** — you cannot attach a function that belongs to this holder specifically
2. **No contract** — any key can be added or omitted; there is no guarantee of structure

A class solves both:

```python
class Holder:
    def __init__(self, name, taper, collet_size_inches):
        self.name = name
        self.taper = taper
        self.collet_size_inches = collet_size_inches

    def accepts_tool(self, shank_diameter_inches):
        return shank_diameter_inches <= self.collet_size_inches
```

---

### Concept: `class` — Blueprint for Creating Objects

**What it is:** A template that defines the structure (what data each object holds) and behavior (what operations each object can perform) of a category of things.

**Blueprint vs instance:**

- **Class** (`Holder`): the blueprint. It exists once. It describes what all holders have in common.
- **Instance** (`holder = Holder(...)`) — a specific holder created from the blueprint. You can create many instances from one class.

```
Class: Holder  ←  defined once
  ↓  ↓  ↓     ←  create many instances
  holder_1 = Holder("CAT40-ER32", ...)
  holder_2 = Holder("BT30-ER16", ...)
  holder_3 = Holder("HSK63A-ER40", ...)
```

**What a class provides that a dict cannot:**

1. **Guaranteed structure**: every `Holder` instance has `name`, `taper`, and `collet_size_inches`. No missing keys, no typos.
2. **Behavior**: `holder.accepts_tool(0.5)` is attached to the object. The function knows which holder it is working on.
3. **Type identity**: `isinstance(holder, Holder)` is `True`. Dicts cannot be told apart this way.

**What it hides:** The memory layout of the object. Python allocates memory for each instance's attributes, manages the reference from the instance to the class methods, and handles garbage collection. You see `holder.name`; Python handles the rest.

**Canonical example (General):**

A cookie cutter. The cutter is the class — it defines the shape. Each cookie you cut is an instance. All cookies have the same shape (from the blueprint), but they are different physical objects — you can frost one differently, some are larger (if the dough is thicker), and eating one does not affect the others.

**Project application:** Every domain concept — `Tool`, `Holder`, `Assembly`, `Job` — is a class. Each represents a category of thing with specific structure and behavior. The `Holder` class says "every holder has a name, a taper, and a collet size, and can tell you whether it accepts a given tool shank."

**Smallest possible example:**

```python
class Tool:
    def __init__(self, name, diameter_inches):   # initializer
        self.name = name                         # instance attribute
        self.diameter_inches = diameter_inches   # instance attribute

tool_1 = Tool("EM-0500", 0.5)   # create instance 1
tool_2 = Tool("DR-0250", 0.25)  # create instance 2

print(tool_1.name)               # → "EM-0500"
print(tool_2.name)               # → "DR-0250"  — different instance, different data
```

**You will see this again in:** Every Python program with more than a few functions. In PySide6 (Block 3): every widget is a class instance. In SQLAlchemy (Block 5): every database model is a class. In Pydantic (Block 9): every validation schema is a class.

**Watch for:** A class definition does not create any instances. `class Holder:` defines the blueprint. Nothing is created until you call `Holder(...)`.

---

## Step 2 — `__init__` and `self`

The two things that confuse everyone at first:

```python
class Holder:
    def __init__(self, name, taper, collet_size_inches):
        #        ^^^^                                   ← first parameter is always self
        self.name = name                  # self.name: store name ON THIS INSTANCE
        self.taper = taper
        self.collet_size_inches = collet_size_inches

holder = Holder("CAT40-ER32", "CAT40", 0.5)
```

---

### Concept: `__init__` — The Initializer

**What it is:** A special method that runs automatically when you create a new instance. It sets up the initial state of the object.

**The name `__init__`:** The double underscores (called "dunder" — double underscore) signal that this is a Python-recognized special method name. `__init__` means "initialize."

**What `__init__` is NOT:** It is not a constructor in the C++ or Java sense. Python has already created the instance by the time `__init__` runs. `__init__` is the initializer — it fills in the data.

**The call sequence:**

```python
holder = Holder("CAT40-ER32", "CAT40", 0.5)
#  1. Python creates a new empty Holder instance
#  2. Python calls holder.__init__("CAT40-ER32", "CAT40", 0.5)
#  3. __init__ stores the values as attributes on the instance
#  4. Python returns the initialized instance to `holder`
```

**Canonical example (General):**

Filling out a new employee form on the first day. The employee exists (the person exists before the form). The form (`__init__`) fills in their name, role, and start date. After the form is complete, the employee record is fully initialized and ready to use.

**You will see this again in:** Every class in this project. In PySide6 (Block 3): `def __init__(self, parent=None)`. In SQLAlchemy (Block 5): model classes may not explicitly define `__init__` — SQLAlchemy generates it from column definitions.

**Watch for:** Forgetting `self.name = name` is the most common error. Writing `name = name` inside `__init__` creates a local variable that disappears when `__init__` returns — it does NOT save the value on the instance. Always prefix with `self.`.

---

### Concept: `self` — The Current Instance

**What it is:** The first parameter of every instance method, automatically bound to the instance the method is called on.

**Why it is explicit:** In Java and C++, `this` is an implicit keyword. In Python, `self` is an explicit parameter. Python makes it visible to be clear that "this method operates on an instance" is not magic — it is just a function that receives the instance as its first argument.

**The mechanism:**

```python
holder = Holder("CAT40-ER32", "CAT40", 0.5)
holder.accepts_tool(0.5)
# Python translates this to:
Holder.accepts_tool(holder, 0.5)
# The instance is passed as the first argument — that is what self receives
```

**The name `self` is a convention, not a rule.** You could write `def __init__(this, name)` and it would work. But everyone uses `self`, and you should too. Code that uses a different name stands out as wrong to any Python programmer.

**Why `self.name` and not just `name`:**

```python
def __init__(self, name, taper, collet_size_inches):
    self.name = name    # self.name: attribute stored ON THE INSTANCE
    name = name         # local variable only — vanishes when __init__ ends
```

Attributes stored with `self.` persist for the lifetime of the instance. Local variables disappear when the method returns.

**Smallest possible example:**

```python
class Counter:
    def __init__(self):
        self.count = 0       # each Counter instance has its own count

    def increment(self):
        self.count += 1      # operate on THIS instance's count

c1 = Counter()
c2 = Counter()
c1.increment()
c1.increment()
c2.increment()

print(c1.count)   # → 2
print(c2.count)   # → 1  — separate instance, separate count
```

**You will see this again in:** Every method in every class. In SQLAlchemy models: `self.name` stores column values. In PySide6 widgets: `self.layout` holds the widget's layout.

**Watch for:** Calling an instance method without `self` causes `TypeError: method() takes 0 positional arguments but 1 was given`. Python tried to pass the instance as the first argument, but there was no parameter to receive it.

---

### SAVE AND TRY

In the REPL:

```python
class Holder:
    def __init__(self, name, taper, collet_size_inches):
        self.name = name
        self.taper = taper
        self.collet_size_inches = collet_size_inches

holder_1 = Holder("CAT40-ER32", "CAT40", 0.5)
holder_2 = Holder("BT30-ER16",  "BT30",  0.375)

print(holder_1.name)              # → "CAT40-ER32"
print(holder_2.name)              # → "BT30-ER16"
print(holder_1.collet_size_inches)  # → 0.5
```

**You should see:** Three lines, each printing an attribute from its respective instance.

**Console test:** Call `type(holder_1)`. **Expected:** `<class '__main__.Holder'>` — the instance's type is the class.

**Change something:** Add a method `collet_description(self)` that returns a string like `"0.500\" ER32 collet"`. Call it on `holder_1`. Then add it to `holder_2` too.

---

## Step 3 — Methods

Methods are functions defined inside a class. They always receive `self` as the first parameter.

```python
class Holder:
    def __init__(self, name, taper, collet_size_inches):
        self.name = name
        self.taper = taper
        self.collet_size_inches = collet_size_inches

    def accepts_tool(self, shank_diameter_inches: float) -> bool:
        return shank_diameter_inches <= self.collet_size_inches
        # compare the shank against THIS holder's collet size

    def describe(self) -> str:
        return (
            f"Holder: {self.name}  "
            f"taper: {self.taper}  "
            f'collet: {self.collet_size_inches:.3f}"'
        )
```

Call methods with dot notation:

```python
holder = Holder("CAT40-ER32", "CAT40", 0.5)
holder.accepts_tool(0.5)     # → True   (exact match: 0.5 <= 0.5)
holder.accepts_tool(0.75)    # → False  (too large: 0.75 > 0.5)
holder.describe()            # → "Holder: CAT40-ER32  taper: CAT40  collet: 0.500\""
```

---

### Concept: Instance Attribute vs Class Attribute

**What they are:** Attributes stored on an instance (unique to that instance) vs attributes shared by all instances of the class.

```python
class Holder:
    VALID_TAPERS = ["CAT40", "BT30", "HSK63A", "CAT50"]  # class attribute — shared by all

    def __init__(self, name, taper, collet_size_inches):
        self.name = name                                   # instance attribute — unique per instance
        self.taper = taper
        self.collet_size_inches = collet_size_inches
```

- `Holder.VALID_TAPERS` — access on the class directly
- `holder.name` — access on an instance

Class attributes are typically used for constants shared by all instances (like `VALID_TAPERS`) or for class-level counts. Instance attributes are used for data that differs between instances.

**Watch for:** If you accidentally assign to a class attribute via an instance (`self.VALID_TAPERS = [...]`), Python creates a new instance attribute that shadows the class attribute — the class attribute is unchanged. This is a source of bugs.

---

## Step 4 — `__repr__` and `__str__`

Try printing a holder in the REPL:

```python
holder = Holder("CAT40-ER32", "CAT40", 0.5)
print(holder)
```

**You should see something like:** `<__main__.Holder object at 0x000001A3B5C20D90>`

That is Python's default display for an object — the class name and the memory address. Not useful. Fix it with `__repr__`:

```python
class Holder:
    def __init__(self, name, taper, collet_size_inches):
        self.name = name
        self.taper = taper
        self.collet_size_inches = collet_size_inches

    def __repr__(self) -> str:      # "official" string representation
        return f"Holder({self.name!r}, taper={self.taper!r}, collet={self.collet_size_inches:.3f}\")"
        # !r adds quotes: "CAT40-ER32" not CAT40-ER32 — shows it is a string
```

Now `print(holder)` shows: `Holder('CAT40-ER32', taper='CAT40', collet=0.500")`

**`__repr__` vs `__str__`:**

- `__repr__`: the "official" representation — unambiguous, designed for developers. Should ideally look like valid Python that could recreate the object.
- `__str__`: the "human-readable" representation — designed for end users.

If only `__repr__` is defined, Python uses it for both. This is fine for most domain objects. Define `__str__` separately only if you need different output for users vs developers.

**This is what `@dataclass` generates:** The `@dataclass` decorator used on `Tool` in Lab 00f automatically generates `__init__` and `__repr__` for you, based on the declared fields. That is all it does — the same class written manually would have the same `__init__` and `__repr__`.

---

## Step 5 — Red: Write the Tests

Now build `Holder` properly through Red-Green-Refactor.

Create `tests/test_holder.py`:

```python
from tooldb.holder import Holder   # ← will fail — module does not exist yet


def test_holder_stores_name():
    holder = Holder("CAT40-ER32", "CAT40", 0.5)
    assert holder.name == "CAT40-ER32"


def test_holder_stores_taper():
    holder = Holder("CAT40-ER32", "CAT40", 0.5)
    assert holder.taper == "CAT40"


def test_holder_stores_collet_size():
    holder = Holder("CAT40-ER32", "CAT40", 0.5)
    assert holder.collet_size_inches == 0.5


def test_accepts_tool_within_collet_size():
    holder = Holder("CAT40-ER32", "CAT40", 0.5)
    assert holder.accepts_tool(0.5) is True    # exact match
    assert holder.accepts_tool(0.25) is True   # smaller tool — also fits


def test_rejects_tool_larger_than_collet():
    holder = Holder("CAT40-ER32", "CAT40", 0.5)
    assert holder.accepts_tool(0.75) is False   # too large


def test_repr_includes_name():
    holder = Holder("CAT40-ER32", "CAT40", 0.5)
    assert "CAT40-ER32" in repr(holder)         # repr() calls __repr__
    assert "CAT40" in repr(holder)
```

Run:

```powershell
pytest tests/test_holder.py
```

**You should see:**

```
ModuleNotFoundError: No module named 'tooldb.holder'
```

Red.

---

## Step 6 — Green: Write the Class

Create `tooldb/holder.py`:

```python
class Holder:
    def __init__(self, name: str, taper: str, collet_size_inches: float):
        self.name = name                                # physical name on the holder
        self.taper = taper                              # machine taper: CAT40, BT30, HSK63A, etc.
        self.collet_size_inches = collet_size_inches    # maximum shank diameter this holder grips
```

Run the first three tests:

```powershell
pytest tests/test_holder.py::test_holder_stores_name tests/test_holder.py::test_holder_stores_taper tests/test_holder.py::test_holder_stores_collet_size
```

**You should see:** 3 passed.

Add the methods:

```python
class Holder:
    def __init__(self, name: str, taper: str, collet_size_inches: float):  # ← already exists
        self.name = name
        self.taper = taper
        self.collet_size_inches = collet_size_inches

    def accepts_tool(self, shank_diameter_inches: float) -> bool:          # ← add this
        return shank_diameter_inches <= self.collet_size_inches
        # True if the tool shank fits in this holder's collet

    def __repr__(self) -> str:                                             # ← add this
        return (
            f"Holder({self.name!r}, "
            f"taper={self.taper!r}, "
            f"collet={self.collet_size_inches:.3f}\")"
        )
```

Run all tests:

```powershell
pytest tests/test_holder.py
```

**You should see:** 6 passed.

---

## Step 7 — Refactor: Understand `@dataclass`

Open `tooldb/tool.py`. It has:

```python
from dataclasses import dataclass

@dataclass
class Tool:
    name: str
    diameter_inches: float
```

The `@dataclass` decorator inspects the class body, reads the `name: str` and `diameter_inches: float` field declarations, and automatically generates:

```python
# What @dataclass generates for you:
def __init__(self, name: str, diameter_inches: float):
    self.name = name
    self.diameter_inches = diameter_inches

def __repr__(self):
    return f"Tool(name={self.name!r}, diameter_inches={self.diameter_inches!r})"

def __eq__(self, other):
    if isinstance(other, Tool):
        return self.name == other.name and self.diameter_inches == other.diameter_inches
    return NotImplemented
```

Three methods for free. That is the entire value of `@dataclass`. When a class is purely data — no complex initialization logic, no methods needed beyond the standard ones — `@dataclass` reduces boilerplate.

`Holder` has a method (`accepts_tool`) and domain logic. `@dataclass` could still be used, but writing `Holder` manually makes the class structure explicit, which is appropriate for learning.

Run the full test suite:

```powershell
pytest tests/
```

**You should see:** All tests pass.

---

### SAVE AND TRY

In the REPL:

```python
from tooldb.holder import Holder

holders = [
    Holder("CAT40-ER32",  "CAT40", 0.5),
    Holder("BT30-ER16",   "BT30",  0.375),
    Holder("HSK63A-ER40", "HSK63A", 0.625),
]

for holder in holders:
    print(holder)                               # calls __repr__

tool_shank = 0.5
fitting = [h for h in holders if h.accepts_tool(tool_shank)]
print(f"\nHolders that accept a {tool_shank:.3f}\" shank:")
for h in fitting:
    print(f"  {h.name}")
```

**You should see:**

```
Holder('CAT40-ER32', taper='CAT40', collet=0.500")
Holder('BT30-ER16', taper='BT30', collet=0.375")
Holder('HSK63A-ER40', taper='HSK63A', collet=0.625")

Holders that accept a 0.500" shank:
  CAT40-ER32
  HSK63A-ER40
```

**Console test:** Try `repr(holders[0])`. **Expected:** Same as `print(holders[0])` — `repr()` calls `__repr__`.

**Change something:** Change `<=` to `<` in `accepts_tool`. Run pytest. `test_accepts_tool_within_collet_size` fails — exact match `0.5 <= 0.5` is now `False`. Change it back.

---

## 🎯 Challenge: Add `describe` and Class Attribute

**You know:** `__init__`, `self`, methods, class attributes, `__repr__`.

**Task:** Add two things to `tooldb/holder.py`:

1. A class attribute `VALID_TAPERS = ["CAT40", "BT30", "HSK63A", "CAT50", "BT50"]`
2. A method `describe(self) -> str` that returns a human-readable description:
   `'CAT40-ER32 (CAT40 taper, 0.500" collet)'`

Write the tests first:

```python
def test_valid_tapers_is_class_attribute():
    # Class attributes are accessible on the class, not just on instances
    assert "CAT40" in Holder.VALID_TAPERS   # access on the CLASS directly
    assert "BT30" in Holder.VALID_TAPERS

def test_describe_returns_formatted_string():
    holder = Holder("CAT40-ER32", "CAT40", 0.5)
    result = holder.describe()
    assert "CAT40-ER32" in result
    assert "CAT40" in result
    assert "0.500" in result
```

---

<details>
<summary>▶ Show Solution</summary>

**Tests** (add to `tests/test_holder.py`):

```python
def test_valid_tapers_is_class_attribute():
    assert "CAT40" in Holder.VALID_TAPERS
    assert "BT30" in Holder.VALID_TAPERS

def test_describe_returns_formatted_string():
    holder = Holder("CAT40-ER32", "CAT40", 0.5)
    result = holder.describe()
    assert "CAT40-ER32" in result
    assert "CAT40" in result
    assert "0.500" in result
```

**Updated `tooldb/holder.py`**:

```python
class Holder:
    VALID_TAPERS = ["CAT40", "BT30", "HSK63A", "CAT50", "BT50"]  # ← add class attribute

    def __init__(self, name: str, taper: str, collet_size_inches: float):   # ← already exists
        self.name = name
        self.taper = taper
        self.collet_size_inches = collet_size_inches

    def accepts_tool(self, shank_diameter_inches: float) -> bool:  # ← already exists
        return shank_diameter_inches <= self.collet_size_inches

    def describe(self) -> str:                                     # ← add this method
        return f'{self.name} ({self.taper} taper, {self.collet_size_inches:.3f}" collet)'

    def __repr__(self) -> str:                                     # ← already exists
        return (
            f"Holder({self.name!r}, "
            f"taper={self.taper!r}, "
            f"collet={self.collet_size_inches:.3f}\")"
        )
```

**Key insight:** `VALID_TAPERS` is defined at the class level, outside any method. It is shared across all `Holder` instances — `Holder.VALID_TAPERS` and `holder.VALID_TAPERS` both return the same list. `describe()` has `self` as its only parameter because it only needs the instance's own data — it reads `self.name`, `self.taper`, and `self.collet_size_inches` and formats them together.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `Holder("CAT40-ER32", "CAT40", 0.5)` creates an instance | `pytest tests/test_holder.py` — all tests pass |
| `holder.accepts_tool(0.5)` returns `True` | `test_accepts_tool_within_collet_size` passes |
| `holder.accepts_tool(0.75)` returns `False` | `test_rejects_tool_larger_than_collet` passes |
| `repr(holder)` includes name and taper | `test_repr_includes_name` passes |
| All previous tests still pass | `pytest tests/` — no regressions |
| Can explain `self` in one sentence | "Python passes the instance as the first argument; `self` is the name that receives it" |
| Can explain what `@dataclass` generates | `__init__`, `__repr__`, `__eq__` from field declarations |

---

## Quick Check Answers

**1. A class and an object — are they the same thing?**

No. A class is the blueprint; an object (or instance) is a specific thing created from that blueprint. `class Holder:` defines the blueprint once. `holder_1 = Holder(...)` creates one instance. `holder_2 = Holder(...)` creates another. The class exists once; you can create as many instances from it as you need. The class defines what data and behavior all holders share; each instance holds its own unique data (`name`, `taper`, `collet_size_inches`).

**2. Where does `self` come from when you call `tool.describe()`?**

Python translates `tool.describe()` into `Tool.describe(tool)`. The instance `tool` is automatically passed as the first argument. The parameter named `self` in `def describe(self)` receives it. This is not magic — Python makes it explicit by requiring `self` as the first parameter. `self` is just the name for "the instance this method is operating on." When you write `self.name` inside the method, you are accessing the `name` attribute of that specific instance.

**3. What does `@dataclass` generate?**

`@dataclass` reads the field declarations in the class body (like `name: str` and `diameter_inches: float`) and automatically generates three methods: `__init__` (which takes the fields as parameters and assigns them to `self`), `__repr__` (which returns a string showing the class name and all field values), and `__eq__` (which compares two instances by their field values). This is all `@dataclass` does — it saves you from writing the same boilerplate `__init__`, `__repr__`, and `__eq__` for every data-holding class.
