# Python Tool Database — LAB 00g — SOLID: Five Rules for Code That Can Change

**Prerequisites:** Labs 00–00f. You have `ToolService`, `ToolRepositoryPort`, `FakeToolRepository`, and `Tool`. All tests are passing.

**What this lab adds:**
- The five SOLID principles, each named and explained with a concrete example from the tool database
- An analysis of the current codebase against each principle
- A SOLID checklist to apply to every new class from here on
- One code change that fixes a real SRP violation introduced and explained in this lesson

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a function that creates a tool AND validates the tool name format AND logs the result. How many reasons does this function have to change?
> 2. You add a `ThreadMill` type and must add `elif tool_type == "threadmill":` in five different places. What design rule does this violate?
> 3. A `Drill` subclass overrides `describe()` and returns `None`. The rest of the code calls `tool.describe()` and formats the result as a string. What breaks silently?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

This lesson produces:

1. A **SOLID checklist** in `notes.md` — five questions to apply to every new class
2. A **modified `tooldb/service.py`** where the SRP violation introduced in this lesson is then fixed
3. A clear understanding of how each SOLID principle appears in this specific codebase

---

## The Single Idea Behind All Five Principles

SOLID is not five separate rules. It is one observation expressed five different ways:

> **Code that is easy to change has one job, knows only what it must know, and depends on stable abstractions rather than volatile concretions.**

Each principle names one specific way code can fail this standard and one specific fix. They were gathered by Robert Martin from earlier work by Barbara Liskov, Bertrand Meyer, and others.

The five principles do not guarantee good design. But a class that violates any one of them is a predictable source of bugs and maintenance cost. Knowing the principles lets you name the problem — and naming the problem is the first step to fixing it.

---

## Principle S — Single Responsibility

### Concept: Single Responsibility Principle (SRP)

**What it is:** A class or function should have only one reason to change. Not "one thing it does" — one axis of change, one actor who would request a change.

**The problem — multiple reasons to change:**

```python
class ToolService:
    def __init__(self, repository):
        self.repository = repository

    def create_tool(self, name, diameter_inches):
        # Responsibility 1: validation
        if not name or len(name) < 3:
            raise ValueError("Tool name must be at least 3 characters")
        if diameter_inches <= 0:
            raise ValueError("Diameter must be positive")
        if not name[0:2].isupper():
            raise ValueError("Tool name must start with two uppercase letters (e.g. EM, DR)")

        # Responsibility 2: business logic — creating the tool
        tool = Tool(name=name, diameter_inches=diameter_inches)

        # Responsibility 3: logging — recording what happened
        print(f"[LOG] Created tool: {tool.name}")

        # Responsibility 4: storage — saving to the repository
        self.repository.save(tool)
        return tool
```

This function has four reasons to change:
1. Validation rules change (machinist adds a new naming convention)
2. Business logic changes (tools need a new required field)
3. Logging changes (switch from `print` to a proper logger, or add a timestamp)
4. Storage changes (change from repository to direct SQL)

Every time any one of these changes, this function is edited. Every edit risks accidentally breaking one of the other three responsibilities.

**The solution — one responsibility per unit:**

```python
# tooldb/validation.py — one reason to change: validation rules
class ToolValidator:
    def validate_create(self, name, diameter_inches):
        errors = []
        if not name or len(name) < 3:
            errors.append("Tool name must be at least 3 characters")
        if diameter_inches <= 0:
            errors.append("Diameter must be positive")
        if not name[0:2].isupper():
            errors.append("Tool name must start with two uppercase letters")
        return errors   # returns a list of problems — empty list = valid


# tooldb/service.py — one reason to change: use-case orchestration
class ToolService:
    def __init__(self, repository, validator):   # accepts the validator through constructor
        self.repository = repository
        self.validator = validator

    def create_tool(self, name, diameter_inches):
        errors = self.validator.validate_create(name, diameter_inches)
        if errors:
            raise ValueError(errors)              # delegate to ValueError — not ToolService's problem

        tool = Tool(name=name, diameter_inches=diameter_inches)
        self.repository.save(tool)
        return tool                               # no logging here — logging is a cross-cutting concern
```

Now:
- Validation rule changes → only `ToolValidator` changes
- Use-case orchestration changes → only `ToolService` changes
- The two classes have different test suites: `test_tool_validator.py` tests edge cases in naming rules; `test_tool_service.py` tests that `create_tool` calls the validator and repository correctly

**What it hides:** The change-impact chain. When a responsibility is isolated in one class, a change to that responsibility is also isolated — it cannot ripple into unrelated code.

**Canonical example (General):**

A report class that `generate()`s data AND `print()`s it to screen AND `save()`s it to disk has three responsibilities. Change the printer → retest all three. Split into `ReportGenerator`, `ReportPrinter`, `ReportSaver` → change the printer, retest only `ReportPrinter`.

**You will see this again in:**
- Every code review comment: "this function does two things"
- The reason Flask routes are thin (they orchestrate, they don't contain business logic)
- pytest fixtures: each fixture has one responsibility (set up one thing)
- The "one assertion per test" rule: each test has one reason to fail

**Watch for:** SRP does not mean one function per class or one line per function. It means one reason to change. A class with ten methods can still have a single responsibility. A function with twenty lines can still have a single responsibility if all twenty lines are about the same job.

---

## Step 1 — Red: Introduce and Then Fix a SRP Violation

The current `ToolService.create_tool` is clean but has no validation. In this step, you will:
1. Add validation incorrectly (SRP violation) — watch the test catch it
2. See the violation analyzed against the principle
3. Fix it by splitting the responsibility

**First**, update `tooldb/service.py` to add inline validation (the wrong way):

```python
from tooldb.tool import Tool
from tooldb.ports import ToolRepositoryPort

class ToolService:
    def __init__(self, repository: ToolRepositoryPort):
        self.repository = repository

    def create_tool(self, name: str, diameter_inches: float) -> Tool:
        # ← NEW: inline validation — this is the SRP violation we will fix
        if not name or len(name) < 3:
            raise ValueError("Tool name must be at least 3 characters")
        if diameter_inches <= 0:
            raise ValueError("Diameter must be positive")

        tool = Tool(name=name, diameter_inches=diameter_inches)
        self.repository.save(tool)
        return tool

    def get_all_tools(self) -> list:
        return self.repository.find_all()
```

Add a test to `tests/test_tool_service.py` that exercises the new validation:

```python
def test_service_rejects_empty_name():
    repository = FakeToolRepository()
    service = ToolService(repository)

    import pytest          # ← we need pytest.raises to test exceptions
    with pytest.raises(ValueError):
        service.create_tool(name="", diameter_inches=0.5)   # empty name should raise ValueError

def test_service_rejects_negative_diameter():
    repository = FakeToolRepository()
    service = ToolService(repository)

    import pytest
    with pytest.raises(ValueError):
        service.create_tool(name="EM-0500", diameter_inches=-1.0)
```

### SAVE AND TRY

```powershell
pytest tests/
```

**You should see:**

```
4 passed in 0.01s
```

The validation works. But there is a problem: validation rules are now inside `ToolService`. If a machinist says "tool names must have exactly two uppercase letters followed by a hyphen followed by four digits," the change is in `ToolService` — a class whose other responsibility is orchestrating tool creation. That is two reasons to change.

**Change something:** Add a new validation rule directly in `ToolService.create_tool`:

```python
if not name[0:2].isupper():     # ← add this after the existing validation
    raise ValueError("Tool name must start with two uppercase letters")
```

The rule works, but the validation logic is growing. If the rules get complex (naming conventions, diameter ranges by tool type, checking against a database of known tool families), `create_tool` becomes hard to read. It has two competing jobs.

---

## Step 2 — Green: Fix the SRP Violation

Extract the validation into its own class. Create `tooldb/validation.py`:

```python
class ToolValidator:
    def validate_create(self, name: str, diameter_inches: float) -> list:
        """Returns a list of error strings. An empty list means valid."""
        errors = []     # collect all errors rather than stopping at first failure

        if not name or len(name) < 3:
            errors.append("Tool name must be at least 3 characters")
        if diameter_inches <= 0:
            errors.append("Diameter must be positive")

        return errors   # empty = valid; non-empty = caller decides how to handle
```

Update `tooldb/service.py` to use the validator:

```python
from tooldb.tool import Tool
from tooldb.ports import ToolRepositoryPort
from tooldb.validation import ToolValidator   # ← import the separate validator

class ToolService:
    def __init__(self, repository: ToolRepositoryPort, validator: ToolValidator = None):
        self.repository = repository
        self.validator = validator or ToolValidator()   # use provided validator or create default

    def create_tool(self, name: str, diameter_inches: float) -> Tool:
        errors = self.validator.validate_create(name, diameter_inches)  # delegate to validator
        if errors:
            raise ValueError(errors)    # validation failed — raise with all error messages

        tool = Tool(name=name, diameter_inches=diameter_inches)
        self.repository.save(tool)
        return tool

    def get_all_tools(self) -> list:
        return self.repository.find_all()
```

### SAVE AND TRY

```powershell
pytest tests/
```

**You should see:**

```
4 passed in 0.01s
```

All tests still pass. The SRP violation is fixed: validation rules change in `tooldb/validation.py`, orchestration logic changes in `tooldb/service.py`. The tests in `test_tool_service.py` test the orchestration; future tests in `test_tool_validator.py` will test the validation rules.

**Change something:** Move the validation logic back inline into `create_tool`. Run pytest. Still passes. But the architecture is now worse: the next rule change goes in `create_tool`, and the next, until it becomes unreadable. Move it back out.

---

## Principle O — Open/Closed

### Concept: Open/Closed Principle (OCP)

**What it is:** A module, class, or function should be open for extension (new behavior can be added) but closed for modification (adding new behavior does not require changing existing code).

**The problem — modification required for every extension:**

```python
def calculate_recommended_sfm(tool_type, diameter_inches, material):
    if tool_type == "endmill":
        if material == "aluminum":
            return 800    # high SFM for aluminum + endmill
        else:
            return 400    # moderate SFM for steel + endmill
    elif tool_type == "drill":
        if material == "aluminum":
            return 400
        else:
            return 200
    elif tool_type == "face_mill":    # ← EVERY new tool type requires modifying this function
        return 600
    # Missing tool types silently return None
```

Every time a new tool type is added (thread mills, reamers, boring bars), this function must be modified. Every modification is a risk: the existing branches can break, the new branch can be wrong, and the function grows without limit.

**The solution — extension without modification:**

```python
# Each tool type encapsulates its own speed recommendations
class ToolSpeedProfile:
    def recommended_sfm(self, material: str) -> int:
        raise NotImplementedError

class EndMillSpeedProfile(ToolSpeedProfile):
    def recommended_sfm(self, material: str) -> int:
        return 800 if material == "aluminum" else 400

class DrillSpeedProfile(ToolSpeedProfile):
    def recommended_sfm(self, material: str) -> int:
        return 400 if material == "aluminum" else 200

# Adding thread mills: ONE new class. Zero changes to EndMill or Drill.
class ThreadMillSpeedProfile(ToolSpeedProfile):
    def recommended_sfm(self, material: str) -> int:
        return 150    # thread mills run slow
```

The base class is "closed" — you do not change `ToolSpeedProfile`. Each subclass is "open" — you extend the system by adding subclasses.

**The project application:** In Block 4 (polymorphic tool types), `Drill`, `EndMill`, and `FaceMill` will each have properties that are specific to their type. The OCP principle means: when you add `ThreadMill`, you add a class — you do not change `Drill` or `EndMill`. The existing tests for those classes continue to pass unchanged.

**You will see this again in:**
- Plugin systems — add a new plugin without changing the plugin framework
- pytest fixtures: `conftest.py` extends test capabilities without modifying test files
- Django middleware: add a new middleware without modifying the existing request handling pipeline
- The reason abstract base classes (from lesson-00f) are valuable: they define the contract for extension

**Watch for:** OCP is most useful for behavior that varies. Data that varies (tool diameter, material) is not a violation. OCP applies to behavior (algorithms, calculations, display logic) that needs to vary by type.

---

## Principle L — Liskov Substitution

### Concept: Liskov Substitution Principle (LSP)

**What it is:** If `S` is a subclass of `T`, then everywhere a `T` is used, an `S` can be substituted without breaking the program. Named after Barbara Liskov, who formalized it in 1987.

**Informal version:** A subclass must honor all the contracts of its parent. It cannot return a type the parent did not promise, raise exceptions the parent did not declare, or silently do less than the parent.

**The problem — a subclass that breaks callers:**

```python
class Tool:
    def describe(self) -> str:    # contract: always returns a string
        return f"Tool: {self.name}, diameter: {self.diameter_inches}\""

class Drill(Tool):
    def describe(self):           # LSP violation: parent promised str, this returns None
        if not self.name:
            return None           # ← this is not a str — breaks any caller that concatenates or formats
        return f"Drill: {self.name}"

# The caller that breaks:
for tool in all_tools:
    label = "Tool: " + tool.describe()   # TypeError when Drill returns None
```

The caller cannot know that `Drill` returns `None` — it uses `Tool`'s contract, which promises a string. The bug is silent until runtime.

**The solution:**

```python
class Drill(Tool):
    def describe(self) -> str:              # must return str — the parent's contract
        if not self.name:
            return "Drill: (unnamed)"       # ← return a string even in the edge case
        return f"Drill: {self.name}"
```

**The project application:** In Block 4, every subclass of `Tool` must implement all methods that `Tool` promises. A method marked `-> str` must always return a `str`. A method that could raise an exception must document that in its signature or docstring.

**You will see this again in:**
- Python's `abc.abstractmethod` — the tool that enforces LSP at the syntax level
- `isinstance()` checks in code are often LSP violation signals — if code must check `isinstance(tool, Drill)` to handle a Drill differently, something has violated LSP
- Type checkers like `mypy` — they report LSP violations statically before runtime

**Watch for:** LSP is violated silently. Python does not enforce return types at runtime. A `Drill.describe()` that returns `None` does not raise an error — it causes a `TypeError` somewhere else, possibly far from the `Drill` definition. Type annotations (`-> str`) and a strict type checker are the defense.

---

## Principle I — Interface Segregation

### Concept: Interface Segregation Principle (ISP)

**What it is:** A client should not be forced to depend on methods it does not use. Instead of one large interface, prefer several smaller, focused interfaces.

**The problem — a fat port:**

Imagine `ToolRepositoryPort` grows over time:

```python
class ToolRepositoryPort(ABC):
    @abstractmethod
    def save(self, tool): pass

    @abstractmethod
    def delete(self, tool_id): pass

    @abstractmethod
    def find_all(self): pass

    @abstractmethod
    def find_by_material(self, material): pass

    @abstractmethod
    def find_by_diameter_range(self, min_d, max_d): pass

    @abstractmethod
    def count(self): pass

    @abstractmethod
    def bulk_import(self, tools): pass

    @abstractmethod
    def export_to_csv(self): pass    # ← reporting concern mixed in
```

Now a `ReportingService` that only needs `find_all()` and `count()` must implement — or work with an adapter that implements — all eight methods, including `delete`, `bulk_import`, and `export_to_csv`. If the `FakeReportRepository` does not implement `export_to_csv`, Python raises a `TypeError` when it is instantiated, even though `ReportingService` never calls that method.

**The solution — focused ports:**

```python
class ToolReaderPort(ABC):
    @abstractmethod
    def find_all(self): pass

    @abstractmethod
    def find_by_material(self, material): pass

    @abstractmethod
    def count(self): pass


class ToolWriterPort(ABC):
    @abstractmethod
    def save(self, tool): pass

    @abstractmethod
    def delete(self, tool_id): pass

    @abstractmethod
    def bulk_import(self, tools): pass


class ToolRepositoryPort(ToolReaderPort, ToolWriterPort):  # full repository = both ports
    pass    # inherits all abstract methods from both parents
```

Now `ReportingService` depends on `ToolReaderPort` only. It cannot call `save` or `delete` — they are not on its interface. `FakeReportRepository` only needs to implement the three reader methods.

**The project application:** In Block 8 (REST API), the routes will be split into read-only endpoints (served by the query side) and write endpoints (served by the command side). ISP ensures each side depends only on what it needs.

**You will see this again in:**
- Python protocols (`typing.Protocol`) — a zero-inheritance alternative to ABC that naturally segregates interfaces
- REST API design: GET endpoints don't need write permissions; POST endpoints don't need read permissions
- The reason `ToolService` and a hypothetical `ReportService` might use different parts of the repository port

**Watch for:** ISP is easy to violate by adding convenience methods to a port that only a subset of clients need. Each time a method is added to `ToolRepositoryPort`, ask: does every client that uses this port need this method? If not, the method belongs on a narrower interface.

---

## Principle D — Dependency Inversion

### Concept: Dependency Inversion Principle (DIP)

**What it is:** High-level modules (business logic, services) should not depend on low-level modules (databases, UIs, file systems). Both should depend on abstractions (ports, interfaces).

**This is exactly what Lab 00f built.** Here it is named and connected to the other four principles.

**The problem — direct dependency on implementation:**

```python
import sqlite3   # ← ToolService depends on a low-level detail

class ToolService:
    def create_tool(self, name, diameter_inches):
        conn = sqlite3.connect("cadcam.db")   # ← coupled to SQLite file path
        conn.execute("INSERT INTO tools ...", (name, diameter_inches))
        conn.commit()
```

`ToolService` is now coupled to SQLite. To test it, you need a file on disk. To switch to PostgreSQL, you rewrite `ToolService`. To run it in an environment without SQLite, you fail at import.

**The solution (what you already have from Lab 00f):**

```python
from tooldb.ports import ToolRepositoryPort  # ← depend on abstraction, not implementation

class ToolService:
    def __init__(self, repository: ToolRepositoryPort):  # ← accept through constructor
        self.repository = repository                     # ← never know which adapter

    def create_tool(self, name, diameter_inches):
        tool = Tool(name=name, diameter_inches=diameter_inches)
        self.repository.save(tool)    # ← call the port, not SQLite
        return tool
```

Both `ToolService` (high-level) and `SQLiteToolRepository` (low-level) depend on `ToolRepositoryPort` (the abstraction). Neither depends on the other. This is the "inversion" — the dependency arrow was pointing down from high to low; now both point to the abstraction.

**You will see this again in:**
- Dependency injection frameworks — Spring (Java), Nest.js (TypeScript) — all enforce DIP at the framework level
- FastAPI's `Depends()` mechanism — injects dependencies from above rather than constructing them internally
- Every place in this project where a service receives a repository through its constructor

**Watch for:** DIP is violated when a class constructs its own dependencies internally (`self.repository = SQLiteToolRepository()`). Constructing your own dependencies means you decide the implementation — that is a concrete, not an abstract, dependency. Accept dependencies from outside; do not construct them.

---

## The SOLID Audit of Current Code

Apply each principle to the current codebase:

| Class/Function | S | O | L | I | D | Notes |
|---|---|---|---|---|---|---|
| `Tool` (dataclass) | ✓ | ✓ | N/A (no subclasses yet) | N/A | N/A | Pure data, no behavior |
| `ToolRepositoryPort` | ✓ | ✓ | N/A | ✓ (only 2 methods) | N/A (it IS the abstraction) | Good — keep it small |
| `FakeToolRepository` | ✓ | N/A | ✓ (returns list as promised) | ✓ | ✓ (depends on port) | Test adapter |
| `ToolService` | ✓* | ✓ | N/A | ✓ | ✓ | *SRP fixed in this lesson |
| `ToolValidator` | ✓ | ✓ | N/A | N/A | N/A | New in this lesson |
| `calculate_sfm` | ✓ | N/A | N/A | N/A | N/A | Pure function |

The `*` on `ToolService` SRP is the violation this lesson introduced and fixed. The current state, after Step 2, is clean.

---

## The SOLID Checklist

Add this to `notes.md`:

```
## SOLID Checklist — Ask These Before Marking a Class Done

S — Does this class have more than one reason to change? (If yes, split it.)
O — Would adding a new type require modifying this class? (If yes, introduce an abstraction.)
L — Do all subclasses honor every contract of the parent? (Check return types and exceptions.)
I — Does this port/interface have methods that some clients never call? (If yes, split the port.)
D — Does this class construct its own dependencies? (If yes, inject them through the constructor.)
```

---

## 🎯 Challenge: Find the Violations

**You know:** All five SOLID principles and how each one is violated.

**Task:** The following class violates three SOLID principles. Identify each violation, name the principle, and describe the fix.

```python
import sqlite3
import smtplib

class ToolManager:
    def __init__(self):
        self.conn = sqlite3.connect("cadcam.db")   # constructs its own database connection
        self.tools = {}                            # in-memory cache

    def add_tool(self, name, diameter, tool_type):
        # validate
        if diameter <= 0:
            raise ValueError("Diameter must be positive")
        # save to SQLite
        self.conn.execute("INSERT INTO tools VALUES (?,?,?)", (name, diameter, tool_type))
        self.conn.commit()
        # update cache
        self.tools[name] = {"diameter": diameter, "type": tool_type}
        # send email notification
        server = smtplib.SMTP("smtp.company.com")
        server.sendmail("tooldb@company.com", "admin@company.com", f"New tool: {name}")

    def get_tool(self, name):
        if name in self.tools:
            return self.tools[name]
        cursor = self.conn.execute("SELECT * FROM tools WHERE name=?", (name,))
        return cursor.fetchone()

    def calculate_sfm(self, name, rpm):
        tool = self.get_tool(name)
        return 3.14159 * tool["diameter"] * rpm / 12   # SFM formula embedded here
```

**Hints:**

1. Count how many different things would change in `add_tool` for different reasons
2. Look at what `ToolManager.__init__` creates rather than accepting
3. Look at the responsibilities that belong in other modules

---

<details>
<summary>▶ Show Solution</summary>

**Violation 1: Single Responsibility Principle (S)**

`ToolManager` has at least five responsibilities:
- Input validation (`if diameter <= 0`)
- Database storage (SQLite operations)
- In-memory caching (`self.tools`)
- Email notification (smtplib)
- SFM calculation (the formula in `calculate_sfm`)

Any of these can change independently. A change to the email server requires touching the same class as a change to the validation rules. These should be separate classes: `ToolValidator`, `ToolRepository`, `ToolCache`, `ToolNotifier`, and `calculate_sfm` (already exists as a standalone function).

**Violation 2: Dependency Inversion Principle (D)**

`ToolManager.__init__` constructs its own SQLite connection: `self.conn = sqlite3.connect("cadcam.db")`. It also constructs an SMTP server inside `add_tool`. These are concrete dependencies that are built internally rather than injected from outside.

- `ToolManager` is untestable without a real SQLite file at `"cadcam.db"` and a real SMTP server at `"smtp.company.com"`
- To switch databases, you must find and change `ToolManager` — the high-level class should not know the low-level details

Fix: accept the repository and notifier through the constructor.

**Violation 3: Single Responsibility again — `calculate_sfm` embedded**

`calculate_sfm` already exists as a standalone pure function in `tooldb/sfm.py`. Duplicating it inside `ToolManager` violates both SRP (calculation is a separate concern) and DRY (two copies of the formula can diverge).

**A corrected structure:**

```python
from tooldb.ports import ToolRepositoryPort
from tooldb.sfm import calculate_sfm              # reuse the existing function
from tooldb.validation import ToolValidator

class ToolService:
    def __init__(self, repository: ToolRepositoryPort, validator: ToolValidator):
        self.repository = repository    # injected — can be fake in tests
        self.validator = validator      # injected — can be fake in tests

    def create_tool(self, name, diameter_inches, tool_type):
        errors = self.validator.validate_create(name, diameter_inches)
        if errors:
            raise ValueError(errors)
        tool = Tool(name=name, diameter_inches=diameter_inches, tool_type=tool_type)
        self.repository.save(tool)
        return tool

    def get_recommended_rpm(self, tool_name, target_sfm):
        tool = self.repository.find_by_name(tool_name)
        return calculate_sfm.calculate_rpm(target_sfm, tool.diameter_inches)
```

**Key insight:** A class that violates S often violates D as well — when a class has too many responsibilities, it usually constructs the tools for all of them itself. Fixing S (splitting responsibilities) creates the natural boundary where D can be applied (inject the tools from outside).

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| All tests pass after SRP fix | Run `pytest tests/` — all green |
| `tooldb/validation.py` exists with `ToolValidator` | Open the file — `validate_create` returns a list of error strings |
| `ToolService` imports `ToolValidator` | Open `tooldb/service.py` — `from tooldb.validation import ToolValidator` present |
| `ToolService.create_tool` has no inline validation | Open `tooldb/service.py` — no `if not name` or `if diameter <= 0` inside `create_tool` |
| SOLID checklist added to `notes.md` | Open `notes.md` — five questions present |
| You can state each principle without reading | Name all five from memory with one sentence each |

---

## Quick Check Answers

**1. A function that creates, validates, and logs has how many reasons to change?**

Three. Validation rules change (machinist updates naming conventions). Creation logic changes (tools get a new required field). Logging changes (switch to a structured logger, add a request ID). Because all three are in one function, any of these changes requires editing the function — even when the change has nothing to do with the other two responsibilities. This is the SRP violation: more than one reason to change.

**2. Adding `elif tool_type == "threadmill":` in five places violates which principle?**

The Open/Closed Principle. The code is not "closed for modification" — adding a new tool type requires modifying existing functions in five places. OCP says: adding a new type should require adding code (a new class, a new method), not modifying existing code. The fix is to give each tool type its own class that handles its own behavior, so adding `ThreadMill` means adding one class and zero modifications elsewhere.

**3. `Drill.describe()` returns `None` instead of `str`. What breaks?**

Any code that calls `tool.describe()` and uses the result as a string. For example: `label = "Tool: " + tool.describe()` raises `TypeError: can only concatenate str (not "NoneType") to str`. The break happens at the call site, not at the `Drill` definition — making it hard to trace. The caller trusted the parent's contract (`-> str`); the subclass violated it. This is the Liskov Substitution violation.
