# Python Tool Database — LAB 00f — Hexagonal Architecture: The Domain at the Center

**Prerequisites:** Labs 00–00e (XP practices, Red-Green-Refactor, YAGNI, Simple Design, Refactoring). You have `tooldb/sfm.py` and passing tests. You are comfortable with Python functions, imports, and `def`.

**What this lab adds:**
- The architectural principle that determines how every layer of this project connects: Hexagonal Architecture (Ports and Adapters)
- Your first Python classes: `Tool`, `ToolRepositoryPort`, `FakeToolRepository`, `ToolService`
- A test that passes with no database, no file system, and no UI — the proof that the architecture is correct
- The Python language features needed: `class`, `dataclass`, abstract base classes

**Note on Python depth:** This lesson introduces Python classes to demonstrate the architecture. Block 1 teaches the full Python class system from zero. If class syntax feels fast here, that is intentional — the architecture is the lesson. Block 1 slows down and teaches every piece.

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If `ToolService` imports `from sqlalchemy.orm import Session` directly, what happens when you want to run `ToolService` tests with no database installed?
> 2. The word "interface" appears in many programming contexts. Before reading further: what do you think "interface" means as a software concept?
> 3. PySide6 is the current UI. React will be the future UI. If both UIs call `ToolService.create_tool` — does `ToolService` need to change when you switch UIs?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson, this test will pass:

```python
def test_service_creates_tool_without_database():
    repository = FakeToolRepository()     # no SQLite, no file, no network
    service = ToolService(repository)

    created_tool = service.create_tool(name="EM-0500", diameter_inches=0.5)

    assert created_tool.name == "EM-0500"
    assert created_tool.diameter_inches == 0.5
    assert len(repository.all_tools) == 1
```

This test imports nothing database-related. `FakeToolRepository` is a Python list with a method. The test proves that `ToolService` is independent of any storage technology — you could swap in SQLite, PostgreSQL, or a cloud API, and `ToolService` would not change a single line.

That independence is what Hexagonal Architecture achieves.

---

## The Problem That Architecture Solves

Before introducing the solution, you need to feel the problem.

Here is a simpler implementation of `ToolService` — the kind you might write without architectural guidance:

```python
# tooldb/service.py — WITHOUT Hexagonal Architecture
import sqlite3   # ← service imports the database library directly

def create_tool(name, diameter_inches):
    connection = sqlite3.connect("cadcam.db")   # ← connects to a real file
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO tools (name, diameter_inches) VALUES (?, ?)",
        (name, diameter_inches)
    )
    connection.commit()
    connection.close()
    return {"name": name, "diameter_inches": diameter_inches}
```

This function works. What is wrong with it?

**Problem 1: You cannot test it without a database.** Every test that calls `create_tool` creates a file on disk, writes a row, then — if the test cleans up — deletes it. Tests are slow. Tests leave files around when they crash. Tests fail if the database file is in use by another process.

**Problem 2: You cannot replace the database without rewriting the function.** If you later want to store tools in PostgreSQL instead of SQLite, you rewrite `create_tool`. If you want to test with a different database (a clean test database), you change the `"cadcam.db"` string everywhere. If the database schema changes, this function changes.

**Problem 3: You cannot run this function in a context where sqlite3 is not available.** In a future lesson, the domain logic (creating a tool, validating a tool, computing SFM) will be ported to a different environment. If the domain logic is entangled with SQLite, it cannot be moved.

**The pattern these three problems share:** The function that should be about business logic (creating a tool in the tool database) is also about storage technology (SQLite, file paths, SQL syntax). The two concerns are mixed into one function.

---

## Concept: Hexagonal Architecture (Ports and Adapters)

**What it is:** An architectural pattern that places the domain (the real-world concepts being modeled) at the center of the system, with zero dependencies on any external technology. External systems — databases, UIs, APIs, file systems — connect to the domain through defined interfaces called ports.

**Official name:** Hexagonal Architecture, also called Ports and Adapters, also called Clean Architecture (Robert Martin's version), also called Onion Architecture (Jeffrey Palermo's version). All describe the same core idea with minor variations.

**The problem before:**

In traditional layered architecture ("UI on top, database on the bottom"), each layer still knows the specifics of the layer below it. The service imports SQLAlchemy. The route handler imports the service by name. When any layer changes, the layers above it must change too. The system is a stack of dependencies:

```
PySide6 form → ToolService → SQLAlchemy Session → SQLite file
```

Change SQLite to PostgreSQL: the service changes. Change the service interface: the form changes. Add a REST API: you must add it as a new top layer and hope the service's interface matches what the API needs.

**The solution — the hexagonal model:**

```
                  ┌─────────────────────────────────────────┐
                  │                                         │
  PySide6 UI ─── PORT ──► ToolService ──► PORT ─── FakeToolRepository (tests)
  REST API   ─── PORT ──► (domain)    ──► PORT ─── SQLiteToolRepository (production)
  CLI script ─── PORT ──►             ──► PORT ─── PostgreSQLRepository (future)
                  │                                         │
                  └─────────────────────────────────────────┘
```

The domain (`ToolService`) is in the center. It does not import PySide6, SQLAlchemy, or Flask. It declares what it needs (a port — a defined interface) and anything that satisfies that interface can be plugged in.

**A port** is a contract: "I need something that can save a tool and give me all tools back." The port is defined by the domain. It says what shape the adapter must have.

**An adapter** is a specific implementation of a port. `SQLiteToolRepository` is one adapter. `FakeToolRepository` (a Python list) is another adapter. The domain never knows which adapter is behind the port — it only knows the contract.

**What it hides:** The complexity of swapping external systems. Without this pattern, swapping a database requires changing the service. With this pattern, swapping a database means writing a new adapter that satisfies the existing port contract. The domain changes zero lines.

**The invariant it protects:** The domain has zero imports from any external technology. If `tooldb/service.py` contains `import sqlite3`, `import sqlalchemy`, or `import PySide6`, the invariant is violated. Ports are defined using Python's abstract base class system — the only dependency the domain is allowed to have is on other domain code and the Python standard library.

**Canonical example (General):**

A power outlet is a port. It defines a contract: "provide 120V, 60Hz, via two flat pins and one round pin." A phone charger is an adapter. A laptop adapter is another adapter. Both satisfy the port contract. The outlet does not know or care what is plugged in. You can swap a phone charger for a laptop charger without modifying the outlet.

The wall (the domain) defines the outlet shape. External devices conform to it. Not the other way around.

**Project application:**

`ToolRepositoryPort` is a port. It declares two methods: `save(tool)` and `find_all() → list[Tool]`. `ToolService` depends on `ToolRepositoryPort`. In production, `SQLiteToolRepository` implements the port. In tests, `FakeToolRepository` implements the port with a plain Python list. `ToolService` is identical in both cases.

**You will see this again in:**
- Lab 00g (SOLID) — this is the Dependency Inversion Principle (the D in SOLID) in architectural form
- Lab 08 (SQLAlchemy) — the SQLAlchemy repository is one adapter; the pattern stays the same
- Lab 11 (REST API) — the FastAPI route handler is one adapter for the "incoming" port
- Every professional Python codebase that takes testing seriously — the test suite is only fast and reliable if the domain is decoupled from external systems
- Domain-Driven Design (Lab 00h) — "repository" is a DDD term; this is the DDD repository pattern

**Watch for:** The pattern is only valuable if the domain has zero external dependencies. A `ToolService` that calls `self.repository.save(tool)` and also imports `sqlite3` directly defeats the purpose. The port only works if the domain talks to the port, never to the implementation.

**Pattern category:** Architectural (Non-GoF)
**Tradeoff:** More files, more indirection. You define a port, then an adapter, then wire them together — three places where previously there was one. The payoff: the domain is testable in isolation, and external systems are swappable. Worth it for any codebase that will survive more than one year.

---

## Python Language Tools for This Lesson

Before writing any code, four Python features need to be introduced:

1. `class` — define a new type with its own data and behavior
2. `@dataclass` — a shortcut for defining classes that primarily hold data
3. Abstract Base Classes (`ABC`, `abstractmethod`) — define a port that concrete classes must implement
4. Basic list operations — `[]`, `append()`, `len()`

Block 1 teaches all of these thoroughly. Here you see them in their minimum form — enough to understand the architecture, not enough to master Python classes.

---

## Concept: Python Class (Minimum Form)

**What it is:** A template for creating objects — bundles of related data and the functions that operate on that data, grouped under a single name.

**The problem before:**

Without classes, related data is passed around as separate arguments or loose dictionaries:

```python
def describe_tool(name, diameter_inches, material):
    return f"{name} ({diameter_inches}\" {material})"

# Every function that needs tool data must accept all these arguments:
def calculate_sfm_for_tool(name, diameter_inches, rpm):
    # only needs diameter_inches — but you have to carry name along too
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
```

**The solution:**

```python
class Tool:                          # define a new type named "Tool"
    def __init__(self, name, diameter_inches):   # __init__ runs when you create a Tool
        self.name = name             # self = this specific Tool instance; .name = one of its fields
        self.diameter_inches = diameter_inches

hammer = Tool("EM-0500", 0.5)       # create one Tool instance
print(hammer.name)                   # → EM-0500
print(hammer.diameter_inches)        # → 0.5
```

- `class Tool:` — declares a new type named `Tool`
- `def __init__(self, name, diameter_inches):` — the constructor; called automatically when you write `Tool("EM-0500", 0.5)`. `self` is a reference to the specific instance being created.
- `self.name = name` — stores `name` as a field on this specific instance; every `Tool` has its own `.name`

**What it hides:** The manual dictionary approach:

```python
# Without classes:
tool = {"name": "EM-0500", "diameter_inches": 0.5}
# Nothing stops someone from writing tool["diamter_inches"] — silent typo, wrong key, no error
# Nothing stops someone from adding any key they want: tool["favorite_color"] = "blue"
```

A class enforces structure. `Tool` objects have exactly the fields `Tool` defines — no more, no less.

**Smallest possible example:**

```python
class Point:
    def __init__(self, x, y):    # x and y are the required fields
        self.x = x               # store x on this instance
        self.y = y               # store y on this instance

origin = Point(0, 0)             # create a Point with x=0, y=0
print(origin.x, origin.y)       # → 0 0

target = Point(3, 4)             # a different Point
print(target.x, target.y)       # → 3 4
```

**You will see this again in:**
- Block 1 (Lab 07) — full Python class tutorial with inheritance, methods, and properties
- `@dataclass` (next concept) — a shortcut that writes `__init__` for you
- SQLAlchemy models (Block 4) — classes that map to database tables
- Every service and repository in this project — all are classes

**Watch for:** `self` is always the first parameter of any method inside a class. It refers to the instance the method is called on. Forgetting `self` causes `TypeError: method() takes 0 positional arguments but 1 was given` — Python is passing the instance as the first argument even though you did not write it.

---

## Concept: `@dataclass`

**What it is:** A decorator that automatically generates `__init__`, `__repr__`, and `__eq__` methods for a class based on field declarations. A shortcut for classes that primarily hold data.

**The problem before:**

```python
class Tool:
    def __init__(self, name, diameter_inches):
        self.name = name
        self.diameter_inches = diameter_inches

    def __repr__(self):     # how the object looks when printed
        return f"Tool(name={self.name!r}, diameter_inches={self.diameter_inches})"

    def __eq__(self, other):    # how two Tools are compared with ==
        return self.name == other.name and self.diameter_inches == other.diameter_inches
```

For a class that only holds data, this is boilerplate — the same pattern every time, with different field names.

**The solution:**

```python
from dataclasses import dataclass  # import the dataclass decorator

@dataclass                         # tells Python to auto-generate __init__, __repr__, __eq__
class Tool:
    name: str                      # field name: type — Python reads these at class creation time
    diameter_inches: float         # another field with its type annotation

tool = Tool(name="EM-0500", diameter_inches=0.5)  # __init__ was generated automatically
print(tool)        # → Tool(name='EM-0500', diameter_inches=0.5)  — __repr__ generated
tool2 = Tool(name="EM-0500", diameter_inches=0.5)
print(tool == tool2)   # → True  — __eq__ compares field-by-field
```

**What it hides:** The manually-written `__init__`, `__repr__`, and `__eq__` methods that data-holding classes require. With `@dataclass`, the field list is the class.

**What `str` and `float` mean here:** These are **type annotations** — hints to the reader (and to type checkers) about what kind of value goes in each field. `name: str` means "name should be a string." `diameter_inches: float` means "diameter should be a float." Python does not enforce these at runtime (Block 9 introduces Pydantic for runtime validation), but they document intent.

**Canonical example (General):**

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

origin = Point(0.0, 0.0)
print(origin)         # → Point(x=0.0, y=0.0)
```

**Project application:**

`Tool` is a data class — it holds a name and diameter, nothing more. `@dataclass` is the appropriate tool for pure data containers. In Block 9, `Tool` will become a Pydantic model for runtime validation — that transition will be natural because `@dataclass` and Pydantic's `BaseModel` follow similar patterns.

**You will see this again in:**
- Lab 09 (Pydantic) — `BaseModel` is to Pydantic what `@dataclass` is to Python's stdlib
- FastAPI (Lab 11) — request and response schemas are often dataclasses or Pydantic models
- SQLAlchemy mapped classes (Lab 08) — similar field-declaration syntax

**Watch for:** `@dataclass` requires field type annotations (`name: str`, not just `name`). Without the annotation, Python does not recognize the field. If you write `name = ""` instead of `name: str`, Python treats it as a class variable (shared across all instances), not an instance field.

---

## Concept: Abstract Base Classes (`ABC`)

**What it is:** A class that defines a contract — a set of method signatures that any subclass must implement — without providing the implementations. The abstract base class IS the port in Hexagonal Architecture.

**The problem before:**

Without abstract base classes, you can write a `ToolService` that accepts any object as a repository:

```python
class ToolService:
    def __init__(self, repository):
        self.repository = repository    # what methods does repository need? no enforcement

    def create_tool(self, name, diameter_inches):
        tool = Tool(name=name, diameter_inches=diameter_inches)
        self.repository.save(tool)   # fails at runtime if repository has no save() method
        return tool
```

If you create `ToolService(FakeToolRepository())` and `FakeToolRepository` has no `save` method, the error only appears when `create_tool` is called — at runtime. You have no compile-time (or import-time) enforcement that `FakeToolRepository` implements the required interface.

**The solution:**

```python
from abc import ABC, abstractmethod  # ABC = Abstract Base Class, abstractmethod = marker decorator

class ToolRepositoryPort(ABC):       # inherits from ABC — this class is now abstract
    @abstractmethod                  # this method MUST be overridden in any subclass
    def save(self, tool):
        pass                         # no implementation — the body is intentionally empty

    @abstractmethod
    def find_all(self):
        pass
```

`ABC` stands for Abstract Base Class — Python's built-in mechanism for defining interfaces. A class that inherits from `ABC` and has any `@abstractmethod` methods **cannot be instantiated directly**:

```python
port = ToolRepositoryPort()   # → TypeError: Can't instantiate abstract class ToolRepositoryPort
                              #   with abstract method save
```

This error fires at the moment of instantiation, not at the moment the method is called — earlier, clearer feedback.

**What it hides:** The manual check pattern:

```python
# Without ABC — checking at runtime whether the interface is satisfied:
def create_service(repository):
    if not hasattr(repository, 'save'):
        raise TypeError("repository must have a save() method")
    if not hasattr(repository, 'find_all'):
        raise TypeError("repository must have a find_all() method")
    return ToolService(repository)
```

With `ABC`, this check is automatic. Any class that inherits from `ToolRepositoryPort` but does not implement `save` and `find_all` cannot be instantiated. Python enforces the contract at construction time.

**The invariant it protects:** Any object that successfully instantiates from a subclass of `ToolRepositoryPort` is guaranteed to have implemented both `save` and `find_all`. The `ToolService` can always call these methods safely.

**Canonical example (General):**

```python
from abc import ABC, abstractmethod

class Shape(ABC):             # abstract class — cannot instantiate directly
    @abstractmethod
    def area(self):           # subclasses MUST implement this
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):           # implements the required method
        return math.pi * self.radius ** 2

circle = Circle(5)
print(circle.area())   # → 78.53...

shape = Shape()        # → TypeError: Can't instantiate abstract class Shape
```

**Project application:**

`ToolRepositoryPort` is an abstract class. `FakeToolRepository` (used in tests) and `SQLiteToolRepository` (used in production) both inherit from it and implement `save` and `find_all`. `ToolService` accepts any `ToolRepositoryPort` — it does not care which concrete class is behind it.

**You will see this again in:**
- Lab 00g (SOLID) — the Dependency Inversion Principle names what `ABC` enables
- Python protocols (`typing.Protocol`) — an alternative to `ABC` that does not require inheritance
- SQLAlchemy (Lab 08) — `DeclarativeBase` uses a similar inheritance pattern
- Every "strategy" or "adapter" you implement in this project

**Watch for:** The `@abstractmethod` decorator must be used inside a class that inherits from `ABC`. A class with `@abstractmethod` but no `ABC` inheritance will not enforce the constraint — the methods will just be overrideable methods, not required ones.

---

## Step 1 — Red: Write the Test

The test you are about to write will assert that `ToolService` can create a tool using a `FakeToolRepository` — with no database, no imports of SQLite, nothing external.

Create `tests/test_tool_service.py`:

```python
from tooldb.service import ToolService        # the service we are about to build
from tooldb.fakes import FakeToolRepository   # the fake adapter we are about to build

def test_service_creates_tool_without_database():
    repository = FakeToolRepository()         # no database — just a Python list inside
    service = ToolService(repository)         # service receives the repository through its constructor

    created_tool = service.create_tool(name="EM-0500", diameter_inches=0.5)

    assert created_tool.name == "EM-0500"         # the tool was created with the right name
    assert created_tool.diameter_inches == 0.5     # the tool was created with the right diameter
    assert len(repository.all_tools) == 1          # the tool was saved to the repository
```

### SAVE AND TRY

```powershell
pytest tests/test_tool_service.py
```

**You should see:**

```
FAILED tests/test_tool_service.py::test_service_creates_tool_without_database
  - ModuleNotFoundError: No module named 'tooldb.service'
```

The test is Red. `tooldb/service.py` does not exist. This is the right failure — the test correctly identifies that the code it needs has not been written.

**Change something:** Change `from tooldb.service import ToolService` to `from tooldb.sfm import calculate_sfm` (something that does exist). Run pytest. The import succeeds, but the test then fails because `ToolService` is not defined. Both are valid Red states. Change it back.

---

## Step 2 — Green: Create the `Tool` Dataclass

The first thing `ToolService.create_tool` returns is a `Tool` instance. Create the `Tool` type.

Create `tooldb/tool.py`:

```python
from dataclasses import dataclass   # import the @dataclass decorator

@dataclass                          # generates __init__, __repr__, __eq__ automatically
class Tool:
    name: str                       # field 1: name (a string, e.g. "EM-0500")
    diameter_inches: float          # field 2: diameter in inches (e.g. 0.5)
```

Four lines. This is the first domain entity: the thing the domain is fundamentally about.

### SAVE AND TRY

Verify the dataclass works directly:

```powershell
python -c "from tooldb.tool import Tool; t = Tool('EM-0500', 0.5); print(t)"
```

**You should see:**

```
Tool(name='EM-0500', diameter_inches=0.5)
```

`@dataclass` generated the `__repr__` that produced this output. The `print()` called `__repr__` automatically.

**Change something:** Remove `@dataclass` and run the same command. You should see something like `<tooldb.tool.Tool object at 0x...>` — an unhelpful default representation that `__repr__` would have replaced. Add `@dataclass` back.

---

## Step 3 — Green: Create the `ToolRepositoryPort`

The port defines the contract: what `ToolService` needs from any storage adapter.

Create `tooldb/ports.py`:

```python
from abc import ABC, abstractmethod   # ABC enables abstract classes; abstractmethod marks required methods

class ToolRepositoryPort(ABC):        # inherits from ABC — makes this class abstract (cannot instantiate directly)

    @abstractmethod                   # any subclass MUST implement this method or cannot be instantiated
    def save(self, tool):
        pass                          # no body — the implementation is the adapter's responsibility

    @abstractmethod
    def find_all(self):               # returns a list of all saved tools
        pass
```

### SAVE AND TRY

Verify the port cannot be instantiated directly:

```powershell
python -c "from tooldb.ports import ToolRepositoryPort; r = ToolRepositoryPort()"
```

**You should see:**

```
TypeError: Can't instantiate abstract class ToolRepositoryPort without an implementation for abstract methods 'find_all', 'save'
```

This error is the point. Python is enforcing the contract — you cannot create a `ToolRepositoryPort` object because it does not implement the abstract methods. This guarantees any concrete adapter that does successfully instantiate has implemented both methods.

**Change something:** Remove `@abstractmethod` from `save`. Run the command again. The error disappears — you can now instantiate `ToolRepositoryPort` directly. But the contract is no longer enforced. An adapter that forgets to implement `save` will only fail when `save` is actually called. Add `@abstractmethod` back.

---

## Step 4 — Green: Create the `FakeToolRepository`

The fake adapter implements `ToolRepositoryPort` using a plain Python list. No database. No file system.

Create `tooldb/fakes.py`:

```python
from tooldb.ports import ToolRepositoryPort   # import the port this adapter implements

class FakeToolRepository(ToolRepositoryPort): # inherits from the port — MUST implement save and find_all
    def __init__(self):
        self.all_tools = []                   # a plain Python list — the "database" for tests

    def save(self, tool):
        self.all_tools.append(tool)           # append() adds the tool to the end of the list

    def find_all(self):
        return self.all_tools                 # return the whole list
```

Line by line:

- `class FakeToolRepository(ToolRepositoryPort):` — inherits from the port; Python will enforce that `save` and `find_all` are implemented
- `def __init__(self):` — the constructor; called when `FakeToolRepository()` is created
- `self.all_tools = []` — creates an empty list, accessible as `repository.all_tools` from tests
- `self.all_tools.append(tool)` — `append()` adds one item to the end of the list; `len(self.all_tools)` after one `save` call returns `1`
- `return self.all_tools` — returns the whole list; the test can assert on its length

### SAVE AND TRY

Verify the fake works:

```powershell
python -c "
from tooldb.fakes import FakeToolRepository
from tooldb.tool import Tool
repo = FakeToolRepository()
repo.save(Tool('EM-0500', 0.5))
print(len(repo.all_tools))
print(repo.all_tools[0])
"
```

**You should see:**

```
1
Tool(name='EM-0500', diameter_inches=0.5)
```

One tool saved. `repo.all_tools[0]` accesses the first element of the list (index 0).

**Change something:** Remove `def find_all(self): return self.all_tools` from `FakeToolRepository` and try to instantiate it:

```powershell
python -c "from tooldb.fakes import FakeToolRepository; r = FakeToolRepository()"
```

**You should see:**

```
TypeError: Can't instantiate abstract class FakeToolRepository without an implementation for abstract method 'find_all'
```

The port contract caught the incomplete implementation. Add `find_all` back.

---

## Step 5 — Green: Create `ToolService`

The service contains the business logic. It depends on the port, not on any specific adapter.

Create `tooldb/service.py`:

```python
from tooldb.tool import Tool               # the domain entity
from tooldb.ports import ToolRepositoryPort  # the port — NOT a specific adapter

class ToolService:
    def __init__(self, repository: ToolRepositoryPort):  # accepts any ToolRepositoryPort
        self.repository = repository        # stores the repository for use in other methods

    def create_tool(self, name: str, diameter_inches: float) -> Tool:
        tool = Tool(name=name, diameter_inches=diameter_inches)  # create the domain entity
        self.repository.save(tool)          # delegate storage to the repository (through the port)
        return tool                         # return the created tool to the caller
```

Line by line:

- `def __init__(self, repository: ToolRepositoryPort):` — the `: ToolRepositoryPort` is a type annotation; it documents that `repository` should be any implementation of `ToolRepositoryPort`. Python does not enforce this at runtime (that's what `ABC` does), but it documents the intent.
- `self.repository = repository` — stores the repository so `create_tool` can access it later
- `def create_tool(self, name: str, diameter_inches: float) -> Tool:` — type annotations on parameters and return type; `-> Tool` says this method returns a `Tool`
- `tool = Tool(name=name, diameter_inches=diameter_inches)` — creates the `Tool` dataclass instance
- `self.repository.save(tool)` — calls the port method; Python dispatches to whichever adapter is behind the port
- `return tool` — the created tool goes back to the caller (and to the test's assertion)

**Critical observation:** `tooldb/service.py` does NOT import `sqlite3`, `SQLAlchemy`, `FakeToolRepository`, or `PySide6`. It imports `Tool` (a domain type) and `ToolRepositoryPort` (a port it defines the need for). That is the entire dependency. This is what "domain at the center" means in code.

### SAVE AND TRY

```powershell
pytest tests/test_tool_service.py
```

**You should see:**

```
collected 1 item

tests/test_tool_service.py .                                     [100%]

1 passed in 0.01s
```

The test is Green. No database involved. The architecture is working.

Run the full test suite to confirm nothing broke:

```powershell
pytest tests/
```

All tests pass.

**Change something:** In `tooldb/service.py`, change `self.repository.save(tool)` to `self.repository.store(tool)` — a method that does not exist on `FakeToolRepository`. Save. Run pytest. You should see `AttributeError: 'FakeToolRepository' object has no attribute 'store'`. This is a runtime error — the port contract only covers the methods declared with `@abstractmethod`. `store` is not in the contract. Change it back.

---

## The Architecture at a Glance

Your current file structure implements the hexagonal pattern:

```
tooldb/
    tool.py        ← domain entity: Tool (pure Python, no external imports)
    ports.py       ← port: ToolRepositoryPort (defines the contract)
    service.py     ← domain service: ToolService (depends on port, not adapters)
    fakes.py       ← test adapter: FakeToolRepository (used in tests only)
    sfm.py         ← domain calculation: calculate_sfm (no external imports)
```

What is missing from this picture (added in later lessons):

```
    repositories/
        sqlite_repository.py   ← production adapter: SQLiteToolRepository (implements port with real DB)
```

When `SQLiteToolRepository` is added in Block 4, `ToolService` will not change. The test in `test_tool_service.py` will not change. The only new file is the adapter.

---

## 🎯 Challenge: Add `find_all` to the Service

**You know:** How to add a method to `ToolService` that delegates to the repository port.

**Task:** Add a `get_all_tools` method to `ToolService` that returns all tools from the repository. Then write a test that:

1. Creates a service with a `FakeToolRepository`
2. Creates two tools through the service
3. Calls `service.get_all_tools()`
4. Asserts there are two tools in the result

**Starting code (the test you will write):**

```python
def test_service_returns_all_tools():
    repository = FakeToolRepository()
    service = ToolService(repository)

    service.create_tool(name="EM-0500", diameter_inches=0.5)
    service.create_tool(name="DR-0250", diameter_inches=0.25)

    all_tools = service.get_all_tools()

    assert len(all_tools) == 2
    assert all_tools[0].name == "EM-0500"
    assert all_tools[1].name == "DR-0250"
```

The test is the spec. Make it pass using the TDD cycle: Red → Green → Refactor.

**Hints:**

1. `ToolService.get_all_tools` should call `self.repository.find_all()`
2. `FakeToolRepository.find_all` already exists — you wrote it in Step 4

---

<details>
<summary>▶ Show Solution</summary>

Add one method to `tooldb/service.py`:

```python
def get_all_tools(self) -> list:          # ← add this method to ToolService
    return self.repository.find_all()     # delegate to the port — the adapter does the work
```

The full updated `tooldb/service.py`:

```python
from tooldb.tool import Tool
from tooldb.ports import ToolRepositoryPort

class ToolService:
    def __init__(self, repository: ToolRepositoryPort):
        self.repository = repository

    def create_tool(self, name: str, diameter_inches: float) -> Tool:
        tool = Tool(name=name, diameter_inches=diameter_inches)
        self.repository.save(tool)
        return tool

    def get_all_tools(self) -> list:              # ← the new method
        return self.repository.find_all()
```

Run `pytest tests/`. Both tests pass.

**Key insight:** `get_all_tools` is one line. That is not laziness — it is the correct implementation. The service's responsibility is to define what operations are available (the business API). The repository's responsibility is to perform the storage operation. A service that contains storage logic has violated the Single Responsibility Principle (Lab 00g). One line is the right answer.

</details>

---

## 🎯 Challenge: The Concrete Import Test

**You know:** The invariant of Hexagonal Architecture — `tooldb/service.py` must not import any external technology.

**Task:** Write a test that verifies this invariant. The test should:

1. Read the contents of `tooldb/service.py`
2. Assert that neither `"sqlite3"` nor `"sqlalchemy"` nor `"PySide6"` appear anywhere in the file

This is a structural test — it checks the architecture, not the behavior.

**Hints:**

1. Python's built-in `open()` function reads a file; `file.read()` returns the entire content as a string
2. The `in` operator checks if a substring is in a string: `"sqlite3" in contents`
3. You may need to find the path to `service.py` relative to the test file's location

---

<details>
<summary>▶ Show Solution</summary>

```python
def test_service_has_no_infrastructure_imports():
    # Read the service file's contents to verify no external tech is imported
    service_file_path = "tooldb/service.py"
    with open(service_file_path) as service_file:   # open() returns a file object; 'with' closes it automatically
        contents = service_file.read()              # read() returns the entire file as one string

    # The domain must not depend on any storage technology
    assert "sqlite3" not in contents, "service.py must not import sqlite3 directly"
    assert "sqlalchemy" not in contents, "service.py must not import sqlalchemy directly"
    assert "PySide6" not in contents, "service.py must not import PySide6 directly"
```

Add this to `tests/test_tool_service.py`. Run `pytest tests/`. It should pass.

**Key insight:** Tests can check code structure, not just behavior. This is called an **architectural fitness function** — a test that enforces an architectural rule. As the project grows, this test will catch any accidental dependency on external technology in the service layer. Add more technology names as they are introduced in later lessons.

The `with open(path) as file:` pattern is standard Python for file reading. The `with` keyword ensures the file is closed even if an error occurs inside the block.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| All tests pass | Run `pytest tests/` — all green |
| `tooldb/tool.py` exists with `@dataclass Tool` | Open the file — `@dataclass`, `name: str`, `diameter_inches: float` all present |
| `tooldb/ports.py` exists with `ToolRepositoryPort(ABC)` | Open the file — both `save` and `find_all` marked `@abstractmethod` |
| `tooldb/fakes.py` exists with `FakeToolRepository` | Open the file — inherits from `ToolRepositoryPort`, has `self.all_tools = []` |
| `tooldb/service.py` has no database imports | Open the file — no `sqlite3`, `sqlalchemy`, `psycopg2`, or `PySide6` |
| `ToolRepositoryPort()` raises `TypeError` | Run `python -c "from tooldb.ports import ToolRepositoryPort; ToolRepositoryPort()"` |
| Test uses `FakeToolRepository` (no DB needed) | Open `tests/test_tool_service.py` — no database-related imports |

---

## Quick Check Answers

**1. If `ToolService` imports `from sqlalchemy.orm import Session` directly, what happens when you run tests?**

Tests that instantiate `ToolService` will try to import SQLAlchemy. If SQLAlchemy is not installed, the test fails at import time with `ModuleNotFoundError`. If it is installed, any test that calls `create_tool` will attempt to connect to a database — adding setup/teardown complexity, slowing down tests, and creating a failure mode (database not running). The solution is exactly what this lesson built: `ToolService` imports only `ToolRepositoryPort`, and tests provide a `FakeToolRepository` that never touches SQLAlchemy.

**2. What does "interface" mean as a software concept?**

An interface is a contract: a defined set of method signatures that any conforming class must implement. An interface says "I require a class that has these methods with these signatures" without specifying how those methods work. In Python, abstract base classes are the primary tool for defining interfaces. `ToolRepositoryPort` is an interface — it says "to be a repository, you must implement `save` and `find_all`." An interface defines the shape; adapters fill in the implementation.

**3. Does `ToolService` need to change when you switch from PySide6 to React?**

No. `ToolService` is not aware of the UI layer at all. The UI (PySide6 form or React page) calls `ToolService.create_tool` — the UI is the adapter on the "incoming" port side. When the UI changes from PySide6 to React (via FastAPI), the UI adapter changes. `ToolService` does not. This is the fundamental payoff of Hexagonal Architecture: the domain is fixed; the adapters change around it.
