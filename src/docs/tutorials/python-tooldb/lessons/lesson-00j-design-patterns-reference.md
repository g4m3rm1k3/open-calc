# Python Tool Database — LAB 00j — Design Patterns: A Reference for the Whole Project

**Prerequisites:** Labs 00–00i. All tests are passing.

**What this lab adds:**
- The official definition of a design pattern and what makes a pattern different from just "code that works"
- Ten patterns used in this project, each with a one-sentence description, its Gang of Four category, and the lesson where it first appears
- A pattern-recognition skill: given unfamiliar code, recognize the pattern it is implementing
- A patterns section in the domain glossary

**Time:** 30–45 minutes (this is primarily a reading lesson with a recognition exercise)

---

> **Quick Check — try to answer before reading:**
>
> 1. `ToolRepositoryPort` hides the database behind an abstraction, and `FakeToolRepository` implements it for tests. You have already built this. What pattern name have you been using?
> 2. When Qt's `QSortFilterProxyModel` wraps a table model and adds filtering, the wrapped model's interface is unchanged. What does that remind you of?
> 3. If you say "this is the Observer pattern," and another developer knows that name, what do they immediately understand about your code structure?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

This lesson produces:

1. A **patterns section** in `domain-glossary.md` — ten patterns, each with: name, category, problem, one-sentence solution, where it first appears in this project
2. A pattern recognition exercise applied to the existing codebase

---

## What a Design Pattern Is

A design pattern is a named, reusable solution to a recurring design problem. The definition has three parts:

**Named:** The value of a pattern is almost entirely in its name. When you say "this is the Repository pattern," a developer who knows the pattern immediately understands:
- The structure (an abstract interface + concrete implementations)
- The intent (hide storage details behind domain-language methods)
- The tradeoffs (adds indirection; enables swappable storage)

Without a name, you would have to describe all three of these from scratch every time.

**Reusable:** The same pattern solves the same problem in different contexts. The Repository pattern solves the "how do I decouple business logic from storage" problem whether you are building a tool database, an e-commerce platform, or a healthcare system.

**Recurring:** The pattern exists because the problem appears again and again. Nobody invented the Repository pattern once and never saw it again. It was named because it kept appearing as the right solution to a common problem.

**Patterns vs code:** A pattern is a shape, not code. The Repository pattern in Python looks different from the Repository pattern in Java, which looks different from the Repository pattern in Go. The shape (abstract interface + concrete implementations + single-entry access) is the same; the syntax is different.

---

## The Ten Patterns in This Project

---

### Pattern 1 — Repository

**Category:** Behavioral (GoF-adjacent; formally from DDD)

**Problem:** Business logic that depends directly on database queries is hard to test (requires a real database) and hard to change (a database schema change requires changes throughout the business layer).

**Solution:** Define an abstract interface that speaks domain language. The business logic calls `tool_repository.find_carbide_tools_under(diameter=0.5)` rather than writing SQL. Concrete implementations (SQLite, PostgreSQL, in-memory) implement the interface. The business logic never changes when the storage changes.

**Where it first appears:** Lab 00f — `ToolRepositoryPort` + `FakeToolRepository` + `SQLiteToolRepository` (Block 4)

**You have already built this.** The name is Repository.

---

### Pattern 2 — Adapter

**Category:** Structural

**Problem:** You have a third-party system (Mastercam's `.tooldb` format, XML operation sheets) that produces data in a format your domain does not understand. You cannot change the third-party system.

**Solution:** Write a class (the Adapter) that reads the third-party format and translates it to your domain's language. The domain never sees the Mastercam format — it receives clean `Tool` objects with proper names and types.

```
Mastercam SQLite → [MastercamAdapter] → Tool objects → ToolRepositoryPort → database
```

**Where it first appears:** Block 7 — Mastercam `.tooldb` import

**Why it matters:** The Adapter is one of the most common patterns in integration work. Any time you consume an external API, file format, or legacy system, you write an Adapter. The rest of your code never knows the external format existed.

---

### Pattern 3 — Observer

**Category:** Behavioral

**Problem:** When something changes in the system, other parts of the system need to react — but you do not want the thing that changed to know about every possible reactor. Tight coupling in both directions.

**Solution:** Define an event. Components that care about the event subscribe to it. The publisher fires the event and does not know who is listening. The UI updates when the tool list changes without the service knowing anything about the UI.

**In Qt:** Signals and slots. A model emits `dataChanged` signal; any widget connected to it updates automatically.

**Where it first appears:** Block 3 — Qt signals in the table model (when a tool is saved, the UI table refreshes)

**Canonical form:**

```python
# Publisher:
class ToolService:
    def __init__(self):
        self.on_tool_created = []   # list of subscriber callbacks

    def create_tool(self, name, diameter_inches):
        tool = Tool(name=name, diameter_inches=diameter_inches)
        for callback in self.on_tool_created:  # notify all subscribers
            callback(tool)
        return tool

# Subscriber:
def refresh_tool_table(tool):
    print(f"New tool added: {tool.name}")   # the subscriber reacts

service.on_tool_created.append(refresh_tool_table)  # subscribe
```

---

### Pattern 4 — Command

**Category:** Behavioral

**Problem:** You want to represent a user action (create a tool, delete a job) as an object — so it can be named, stored, undone, queued, or executed from multiple places (menu, toolbar, keyboard shortcut).

**Solution:** Define a `Command` class. Each user action is a `Command` instance with an `execute()` method and optionally an `undo()` method. The UI binds to commands; the domain logic lives inside them.

**In Qt:** `QAction` — a named, activatable object with a shortcut, an icon, and `triggered` signal. You bind `QAction` to menus, toolbars, and keyboard shortcuts simultaneously.

**Where it first appears:** Block 3 — Qt `QAction` for "New Tool", "Delete Tool", keyboard shortcuts

**Why it matters:** The Command pattern is the standard interview topic for "how would you implement undo/redo?" Answer: every action is a Command; undo reverses the Command; redo re-applies it. The Command history is a stack.

---

### Pattern 5 — Factory

**Category:** Creational

**Problem:** You need to create the right subclass of an object based on a type string (e.g., `"endmill"` → `EndMill`, `"drill"` → `Drill`) without the caller knowing the concrete type.

**Solution:** A Factory function or class that takes the type identifier and returns the right object:

```python
def create_tool_by_type(tool_type: str, name: str, diameter_inches: float) -> Tool:
    if tool_type == "endmill":
        return EndMill(name=name, diameter_inches=diameter_inches)
    elif tool_type == "drill":
        return Drill(name=name, diameter_inches=diameter_inches)
    elif tool_type == "face_mill":
        return FaceMill(name=name, diameter_inches=diameter_inches)
    else:
        raise ValueError(f"Unknown tool type: {tool_type!r}")
```

The caller says `create_tool_by_type("drill", "DR-0250", 0.25)` and receives a `Drill` without knowing anything about the `Drill` class.

**Where it first appears:** Block 4 — polymorphic tool types, factory for creating the right subclass from a type string

**Why it matters:** Factory is the solution to the Open/Closed Principle for object creation: add a new type by adding a branch to the factory (or better, by registering the new type in a dictionary). The caller never changes.

---

### Pattern 6 — Strategy

**Category:** Behavioral

**Problem:** You need to perform the same operation (e.g., merging imported tools into the database) but the behavior changes depending on user configuration (skip duplicates, overwrite duplicates, rename duplicates). You do not want a long if/elif chain.

**Solution:** Define a Strategy interface. Each merge behavior is a Strategy class. The import service accepts a strategy at construction time:

```python
class SkipDuplicateStrategy:
    def handle_duplicate(self, existing_tool, new_tool):
        return existing_tool   # keep the existing one

class OverwriteStrategy:
    def handle_duplicate(self, existing_tool, new_tool):
        return new_tool   # replace with the imported one

class RenameStrategy:
    def handle_duplicate(self, existing_tool, new_tool):
        new_tool.name = new_tool.name + "_imported"
        return new_tool   # keep both with a modified name
```

**Where it first appears:** Block 9 — merge policy during multi-database import

**Why it matters:** Strategy replaces a parameter that controls behavior with a full object. Instead of `import(merge_policy="skip")` with an if/elif inside, you have `import(strategy=SkipDuplicateStrategy())` and each strategy class is independently testable.

---

### Pattern 7 — Facade

**Category:** Structural

**Problem:** A subsystem has many interacting classes (validator, repository, ORM session, event publisher). Callers should not need to know about all of them — they just want to "create a tool."

**Solution:** A Facade class provides a simple, unified interface to the subsystem. Callers only talk to the Facade; the Facade coordinates everything else.

**You have already built this.** `ToolService` is a Facade:

```python
service.create_tool(name="EM-0500", diameter_inches=0.5)
# The caller does not know about ToolValidator, ToolRepositoryPort,
# FakeToolRepository, or the Tool dataclass — ToolService hides all of that.
```

**Where it first appears:** Lab 00f — `ToolService` as the simple entry point for tool operations

**Pattern category:** Structural

---

### Pattern 8 — Proxy

**Category:** Structural

**Problem:** You want to add behavior (filtering, sorting, caching, logging) to an object without changing its interface and without the caller knowing the behavior was added.

**Solution:** A Proxy class wraps the original object and implements the same interface. The caller talks to the Proxy; the Proxy delegates to the original and adds the extra behavior.

**In Qt:** `QSortFilterProxyModel` — wraps a `QAbstractTableModel` and adds sorting and filtering. The view does not know whether it is talking to a `ToolTableModel` or a `QSortFilterProxyModel`; both implement the same model interface.

**Where it first appears:** Block 10 — `QSortFilterProxyModel` for table filtering

**Why it matters:** Proxy is the clean way to add cross-cutting behavior (logging, caching, access control) without modifying the original class. It is also how Python's `unittest.mock.Mock` works — it wraps an object and records calls.

---

### Pattern 9 — Value Object

**Category:** Non-GoF (from DDD)

**Problem:** A measurement like "1.5 inches" is passed around as a plain float. Nothing prevents `diameter_inches = -0.5` (impossible in reality). Nothing prevents confusing `stickout_inches` with `flute_length_inches` — both are floats, and the type system cannot distinguish them.

**Solution:** Wrap the measurement in a small class that carries its unit, enforces its invariant (positive), and is comparable by value:

```python
@dataclass(frozen=True)   # immutable — you cannot change a value object, you replace it
class Measurement:
    value: float
    unit: str   # "inches", "mm", "sfm", "rpm"

    def __post_init__(self):    # __post_init__ runs after __init__ in a dataclass
        if self.value < 0:
            raise ValueError(f"Measurement value cannot be negative: {self.value}")

stickout = Measurement(1.5, "inches")
sfm = Measurement(1000, "sfm")
# stickout == sfm is False — different units, even if values matched
```

**Where it first appears:** Block 9 — formal value objects for measurements

**Note:** The current `Tool.diameter_inches: float` is a primitive — a value object is the eventual destination. For now, the float is sufficient. When the domain grows more complex, the float will be replaced with a `Measurement` value object.

---

### Pattern 10 — Decorator

**Category:** Structural

**Problem:** You want to add behavior (logging, validation, timing, retry) to a function without modifying its body. The added behavior is "wrapped around" the original.

**Solution:** Python's decorator syntax:

```python
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Done: {func.__name__}")
        return result
    return wrapper

@log_calls   # ← this is the Decorator pattern applied via Python syntax
def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT

# calculate_sfm(1.0, 3820) now prints before and after, without changing the function body
```

**Where it first appears:** Block 9 — validation decorators; also used throughout as pytest's `@pytest.fixture`

**Why it matters:** `@dataclass`, `@abstractmethod`, `@pytest.fixture` are all Python's built-in decorator syntax. The Decorator pattern is how Python's framework machinery plugs into user code.

---

## Add to `domain-glossary.md`

Append the patterns table:

```markdown
## Design Patterns in This Project

| Pattern | Category | Problem solved | First appears |
|---|---|---|---|
| Repository | Behavioral/DDD | Decouple storage from domain | Lab 00f |
| Adapter | Structural | Translate external formats to domain | Block 7 |
| Observer | Behavioral | React to changes without coupling | Block 3 |
| Command | Behavioral | Represent user actions as objects | Block 3 |
| Factory | Creational | Create correct subtype from type string | Block 4 |
| Strategy | Behavioral | Swappable algorithms (merge policy) | Block 9 |
| Facade | Structural | Simple interface over complex subsystem | Lab 00f |
| Proxy | Structural | Add behavior without changing interface | Block 10 |
| Value Object | Non-GoF/DDD | Type-safe measurements with invariants | Block 9 |
| Decorator | Structural | Wrap a function to add behavior | Block 9 |
```

---

## Pattern Recognition Exercise

### SAVE AND TRY

Look at the current code in `tooldb/service.py`. Two patterns from this lesson are already present:

1. **Facade** — `ToolService` provides a simple interface over `ToolValidator`, `ToolRepositoryPort`, and `Tool` construction. Callers need only `service.create_tool(name, diameter_inches)`.

2. **Repository** — `ToolService` depends on `ToolRepositoryPort` (abstract), not on `FakeToolRepository` or `SQLiteToolRepository` (concrete). The storage is hidden behind the repository interface.

```powershell
pytest tests/
```

All tests pass. Nothing to change — this is a recognition exercise.

**Change something:** Read through `tooldb/validation.py`. Which pattern could `ToolValidator` evolve into if the validation rules became configurable (e.g., different shops have different naming conventions)? The answer is in the patterns list.

---

## 🎯 Challenge: Recognize the Pattern

**You know:** All ten patterns and what shapes they take.

**Task:** Read each code snippet below and name the pattern it is implementing. For each: state the pattern name, the category, and the specific problem it is solving in this context.

**Snippet A:**

```python
class CachedToolRepository:
    def __init__(self, real_repository):
        self.real_repository = real_repository
        self._cache = {}

    def find_by_name(self, name):
        if name not in self._cache:
            self._cache[name] = self.real_repository.find_by_name(name)
        return self._cache[name]

    def save(self, tool):
        self._cache.pop(tool.name, None)   # invalidate cache
        self.real_repository.save(tool)
```

**Snippet B:**

```python
def import_tools(file_path, on_progress=None):
    tools = parse_mastercam_file(file_path)
    for tool in tools:
        save_to_database(tool)
        if on_progress:
            on_progress(tool)   # notify whoever subscribed, if anyone did
```

---

<details>
<summary>▶ Show Solution</summary>

**Snippet A: Proxy pattern**

`CachedToolRepository` wraps `real_repository` and implements the same interface (has `find_by_name` and `save`). The caller cannot tell whether it is talking to the real repository or the caching proxy. The caching behavior is added transparently.

The specific problem: repeated calls to `find_by_name` for the same tool would hit the database every time. The proxy caches the result, so repeated calls return immediately. The domain code (and the caller) does not change.

**Snippet B: Observer pattern**

`on_progress` is a callback — a subscriber. The `import_tools` function publishes progress events by calling `on_progress(tool)`. Any caller can subscribe by passing a function: `import_tools(path, on_progress=lambda t: print(t.name))`. If no one subscribes, the import runs silently.

The specific problem: the import function should not know or care what happens with progress notifications. Logging, UI updates, and test assertions are all possible subscribers — `import_tools` never changes to support them.

**Key insight:** The same pattern can appear in very different contexts (caching vs. event notification). Recognizing the pattern shape lets you apply the known solution (and known tradeoffs) even in new contexts.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Patterns table in `domain-glossary.md` | Open the file — 10 patterns with category, problem, first appears |
| All tests pass | Run `pytest tests/` — all green |
| You can name all 10 patterns | Close the lesson and list them without reading |
| You can classify each pattern as Creational/Structural/Behavioral | Say the category for each |

---

## Quick Check Answers

**1. `ToolRepositoryPort` + `FakeToolRepository` — what pattern?**

Repository. The abstract interface (`ToolRepositoryPort`) hides storage details. Concrete implementations (`FakeToolRepository`, later `SQLiteToolRepository`) implement the interface. The service calls the interface and never knows which concrete class is behind it. This is the Repository pattern's defining structure: abstract storage access behind a domain-language interface.

**2. `QSortFilterProxyModel` wraps a table model without changing its interface — what pattern?**

Proxy. The wrapped model's interface is unchanged — the view still calls the same methods. The proxy adds sorting and filtering behavior transparently. This is the Proxy pattern: wrap an object to add behavior without the caller knowing the wrapper exists.

**3. If you say "this is the Observer pattern," what does another developer immediately understand?**

They understand: there is a publisher that emits events, one or more subscribers that react to those events, and the publisher does not know who is listening. They also understand the tradeoffs: loose coupling (publishers and subscribers can change independently), but difficult to trace (following an event to all its subscribers requires knowing the subscription list). The name carries all of this context — a description that says "things are notified when other things change" carries none of it.
