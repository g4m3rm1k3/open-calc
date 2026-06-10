# Python Tool Database — LAB 00h — Domain-Driven Design: Modeling the Real World

**Prerequisites:** Labs 00–00g. You have `Tool`, `ToolService`, `ToolRepositoryPort`, and `FakeToolRepository`. All tests are passing.

**What this lab adds:**
- DDD vocabulary: entity, value object, aggregate, repository, domain service, application service
- Ubiquitous language: the discipline of using the same words as the domain expert
- A domain glossary for this project that all future code will follow
- One concrete language fix: renaming something that currently uses programmer vocabulary instead of machinist vocabulary

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A tool has a name, a diameter, and a serial number. Two tools with identical names and identical diameters but different serial numbers are different tools. What makes something an "entity" — what is the key concept?
> 2. A cutting speed of "1000 SFM" and another "1000 SFM" are the same — there is no "which 1000 SFM" to track. What makes something a "value object"?
> 3. A machinist calls a combination of tool + holder + stickout a "tool assembly." Your code calls it a `ToolConfig`. What problem does this mismatch cause over time?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

This lesson produces:

1. A **domain glossary** (`domain-glossary.md` in the project root) — ten terms, each defined in machinist language, each classified by DDD type
2. One **language fix** in the codebase: at least one name corrected to match the domain expert's vocabulary
3. A clear mental model of the six DDD building blocks used in this project

---

## Why Domain Modeling Matters

Software is a translation. On one side: a machinist's mental model of tools, holders, assemblies, jobs, and materials. On the other side: Python classes, database tables, and function calls. The quality of that translation determines how closely the software matches what users actually need.

Domain-Driven Design (DDD), introduced by Eric Evans in his 2003 book "Domain-Driven Design: Tackling Complexity in the Heart of Software," starts with one observation:

> Software that models the domain closely is software that domain experts can understand, verify, and extend. Software that models the database or the framework is software that nobody understands but the original programmer.

DDD is not a technology choice. It is a way of thinking about what the code represents and how to name it.

---

## Concept: Ubiquitous Language

**What it is:** The practice of using the exact same vocabulary throughout the project — in code, in conversations, in documentation, and in tests. The terms come from the domain experts (the machinists, the shop floor workers, the people who actually use cutting tools), not from programmers.

**The problem before:**

Without a shared language, every layer translates:

```
Machinist says:  "assembly"
Database has:    table "tool_configs"
Service uses:    class ToolConfiguration
UI shows:        "Setup"
Test uses:       tool_spec
```

When a machinist says "I need to add an assembly to this job," the programmer thinks "which layer do I touch?" — is it `ToolConfiguration`? Is it `Setup`? Are those the same thing? This translation cost compounds across every conversation and every code change.

**The solution:**

Choose the machinist's word and use it everywhere:

```
Machinist says:  "assembly"
Database has:    table "assemblies"
Service uses:    class Assembly
UI shows:        "Assembly"
Test uses:       assembly
```

One word. Zero translation. Any machinist reading the code can tell you what `assembly` means.

**What it hides:** The coordination cost of mismatched vocabularies. When everyone uses the same words, misunderstandings are fewer, bugs caused by "I thought X meant Y" are eliminated, and new team members onboard faster.

**Canonical example (General):**

An insurance company uses "policy" to mean the contract with the customer. If the code uses `Contract`, `Agreement`, `Coverage`, and `Plan` in different places for the same concept, every developer must maintain a mental translation table. "Ubiquitous" means it appears everywhere — not "we call it policy in the UI but agreement in the database."

**Project application:**

The machinist's vocabulary for this project:

| Machinist says | What it means | DDD classification | Code must use |
|---|---|---|---|
| **tool** | a cutting tool — endmill, drill, etc. | Entity | `Tool` |
| **holder** | the collet or chuck that holds the tool | Entity | `Holder` |
| **assembly** | tool + holder + stickout measurement | Aggregate | `Assembly` |
| **job** | a machining job with multiple operations | Entity | `Job` |
| **stickout** | how far the tool extends below the holder | Value Object | `stickout_inches` |
| **SFM** | surface feet per minute — cutting speed | Value Object | `sfm` |
| **RPM** | spindle speed in revolutions per minute | Value Object | `rpm` |
| **tooldb** / **tool database** | the library of all tools and assemblies | Aggregate Root | `ToolDatabase` |
| **operation** | one machining step in a job | Entity | `Operation` |
| **setup sheet** | document describing how to set up a job | (Report) | `SetupSheet` |

**You will see this again in:**
- Every class name, variable name, and function name from here on — they all come from this table
- Lab 00h's domain glossary file, which becomes the project's living dictionary
- Code review: "this variable is named `config` but the machinist calls it `assembly` — fix it"
- When you port this to React (Block 11), the API endpoint names come from this vocabulary

**Watch for:** Ubiquitous language is a discipline, not a one-time decision. When a machinist says a new term you have not heard before, add it to the glossary and use it. When the glossary and the code diverge, the glossary wins.

---

## Concept: Entity

**What it is:** A domain object with identity — something that persists over time and is tracked by its unique ID, not by its attribute values.

**The key question:** Two objects with identical attributes — are they the same object or two different objects?

**For a Tool:** Tool #47 is `EM-0500`, diameter 0.5 inches. Tool #48 is also `EM-0500`, diameter 0.5 inches — just purchased from a different supplier. Same name, same diameter. But they are two different physical tools. The shop might want to track them separately (one is worn, one is new). They have different identities even though their attributes match.

**For an Assembly:** Assembly #101 uses Tool #47. Assembly #102 uses Tool #48. Even if all other attributes are identical, these are different assemblies — they reference different physical tools.

**What makes it an entity:** It has an `id` field that uniquely identifies it. Two entities with the same `id` are the same thing, regardless of other attribute values.

**Canonical example (General):**

A person. Two people named "John Smith" born on the same day are still two different people — they have different identity documents (SSN, passport). A person's name can change; their identity does not. Identity is separate from attributes.

**Project application:**

In this project, `Tool`, `Holder`, `Assembly`, and `Job` are entities. Each will have a unique identifier (`id` or `uuid`) in the database. Even if two assemblies have identical components, they are tracked separately.

**Code pattern:**

```python
@dataclass
class Tool:
    id: int            # the identity — what makes this tool unique in the system
    name: str          # an attribute — can change (regrind changes the name convention)
    diameter_inches: float   # an attribute — can change (worn tools are reground smaller)
```

**You will see this again in:**
- Block 2 (SQL): every entity becomes a database table with a primary key
- Block 4 (polymorphism): `Drill`, `EndMill`, `FaceMill` are all entity types
- Block 8 (SQLAlchemy): each entity class maps to a database table

---

## Concept: Value Object

**What it is:** A domain object defined entirely by its value — with no identity to track. Two value objects with equal values are interchangeable.

**The key question:** If two objects have the same value, does it matter which one you use?

**For SFM:** "1000 SFM" is "1000 SFM." There is no "Tool #47's 1000 SFM" versus "Tool #48's 1000 SFM." One thousand surface feet per minute is one thousand surface feet per minute.

**For stickout:** `stickout_inches = 1.5` means "1.5 inches of tool extending below the holder." Any two assemblies with the same stickout have the same stickout — there is no identity to distinguish them.

**What makes it a value object:** It has no `id`. Equality is determined by value. Value objects are immutable — you do not change a stickout, you replace it with a new stickout value.

**Canonical example (General):**

Money: $10.00 is $10.00. There is no "my $10.00" versus "your $10.00" in terms of value. (The serial number on a bill makes the bill an entity; the dollar amount is a value object.)

**Project application:**

Measurements in this project are value objects: `stickout_inches`, SFM targets, RPM values, diameter values, length values. In Python, they are often just floats. In later lessons, they will be wrapped in small classes to carry their units: `Measurement(value=1.5, unit="inches")`.

**Code pattern:**

```python
@dataclass(frozen=True)   # frozen=True makes it immutable — cannot change fields after creation
class CuttingSpeed:
    sfm: float             # no id — equality is purely by value
    # CuttingSpeed(1000.0) == CuttingSpeed(1000.0) → True
    # CuttingSpeed(1000.0) is CuttingSpeed(1000.0) → False (different objects, same value)
```

**You will see this again in:**
- Pydantic models (Block 9) — often model value objects with built-in validation
- Database value columns — stored as fields in the parent entity's row, not in their own table
- Money, dates, coordinates in any domain — classic value object examples

**Watch for:** The immutability rule is easy to forget in Python since Python objects are mutable by default. Use `@dataclass(frozen=True)` or Pydantic's immutable model configuration to enforce it.

---

## Concept: Aggregate

**What it is:** A cluster of entities and value objects treated as a single unit for data changes. One entity in the cluster is the **aggregate root** — the only public entry point. All changes to the cluster go through the root.

**The problem before:**

Without aggregates, callers can modify the internals of a compound object directly:

```python
# Without aggregate boundary — anything can reach in and modify anything:
assembly = Assembly(tool=tool, holder=holder, stickout_inches=1.5)
assembly.tool.diameter_inches = 0.6   # ← reaching inside to modify the tool directly

# This bypasses Assembly's rules. Assembly might have an invariant like:
# "stickout_inches must be less than the tool's flute length"
# That invariant is now unenforceable because tool changes happen behind Assembly's back.
```

**The solution — go through the root:**

```python
class Assembly:
    def __init__(self, tool, holder, stickout_inches):
        self.tool = tool
        self.holder = holder
        self.stickout_inches = stickout_inches

    def update_stickout(self, new_stickout_inches):   # ← the only way to change stickout
        if new_stickout_inches > self.tool.flute_length_inches:
            raise ValueError("Stickout cannot exceed flute length")
        self.stickout_inches = new_stickout_inches    # invariant enforced before change
```

**What it hides:** The invariant enforcement logic. The aggregate root guarantees that its internal state always satisfies its invariants. Callers cannot violate those invariants without going through the root's methods.

**Project application:**

`Assembly` is an aggregate. Its root enforces: stickout must be positive, stickout must not exceed the tool's flute length, a tool and holder must be compatible. Every change to an assembly goes through `Assembly` methods, never through direct attribute assignment.

**You will see this again in:**
- Block 4 (polymorphism): `Assembly` with enforced invariants
- Block 5 (SQLAlchemy): aggregates are loaded and saved as units
- Every complex business object — orders with line items, invoices with line items, jobs with operations

---

## Concept: Repository

**What it is:** The abstraction for retrieving and storing aggregates. A repository speaks domain language — it is a collection of domain objects, not a database query interface.

**The difference from raw SQL:**

```python
# Raw SQL — speaks database language:
cursor.execute("SELECT * FROM tools WHERE material='carbide' AND diameter < 0.5")

# Repository — speaks domain language:
tool_repository.find_carbide_tools_smaller_than(diameter_inches=0.5)
```

Both do the same thing. The repository method name expresses the domain intent. The SQL expresses the implementation.

**What it hides:** The storage mechanism. Whether tools are stored in SQLite, PostgreSQL, or a flat file is the repository's responsibility, not the caller's. The caller says "give me carbide tools under 0.5 inches"; the repository decides how to satisfy that request.

**Project application:**

`ToolRepositoryPort` (from Lab 00f) is the port that defines what the repository must do. `SQLiteToolRepository` (Block 4) will implement it for production. `FakeToolRepository` implements it for tests. The domain service calls `find_carbide_tools_smaller_than` — it never writes SQL.

---

## Concept: Domain Service vs Application Service

**What it is:** Two types of service, with different responsibilities.

**Domain service:** Logic that involves multiple domain entities but does not belong to any one entity. The logic is part of the domain — a machinist would recognize it as a domain rule.

```python
# Domain service — pure domain logic, no infrastructure
class SFMRecommendationService:
    def recommended_sfm(self, tool: Tool, material: str) -> float:
        # Logic that uses Tool properties and material properties
        # A machinist understands this business rule
        base_sfm = MATERIAL_SFM_TABLE[material]
        return base_sfm * tool.speed_correction_factor
```

**Application service:** Orchestrates a use case — reading input, calling domain services, saving results. Not domain logic. Infrastructure-aware (it calls repositories, reads files, sends notifications).

```python
# Application service — orchestration, not domain logic
class ImportMastercamLibraryService:
    def __init__(self, parser, repository, validator):
        ...

    def import_from_file(self, file_path):
        raw_records = self.parser.parse(file_path)       # reads file
        valid_records, errors = self.validator.validate_all(raw_records)  # validates
        for tool in valid_records:
            self.repository.save(tool)                   # saves
        return ImportReport(saved=len(valid_records), errors=errors)  # reports
```

`ImportMastercamLibraryService` is an application service: it coordinates infrastructure (file parsing, database saving) to implement a use case. `ToolService` (from Lab 00f) is also an application service — it orchestrates creation and storage.

`SFMRecommendationService` is a domain service: it contains pure domain logic (how to recommend a cutting speed based on tool and material), with no infrastructure dependency.

**You will see this again in:**
- Block 5 (application services for import, export, and reporting)
- Block 6 (domain service for toolpath recommendation)
- Every service you write — classify it as domain or application before writing

---

## Step 1 — Build the Domain Glossary

Create `domain-glossary.md` in the `python-tooldb/` root directory:

```markdown
# Domain Glossary — Python Tool Database

This glossary defines the ten most important terms in this project,
in the language a machinist would use.
All code, tests, and documentation must use these names.

| Term | DDD Type | Definition |
|---|---|---|
| **tool** | Entity | A cutting tool — endmill, drill, face mill, reamer, or thread mill. Each physical tool has a unique identity even if specifications match another tool. |
| **holder** | Entity | The collet, chuck, or toolholder that clamps the tool. Independent of any specific tool. |
| **assembly** | Aggregate | A combination of one tool, one holder, and a stickout distance. Can be used across multiple jobs. The assembly root enforces that stickout does not exceed the tool's flute length. |
| **stickout** | Value Object | The distance the tool extends below the holder face, in inches. Measured at setup. |
| **job** | Entity | A machining job — a collection of operations to be run on a specific part. |
| **operation** | Entity | One machining step within a job, with a tool assignment, feeds, and speeds. |
| **sfm** | Value Object | Surface feet per minute — the speed at which the cutting edge moves past the material. Calculated from diameter and RPM. |
| **rpm** | Value Object | Revolutions per minute — the spindle speed. Calculated from SFM and diameter. |
| **tool database** / **tooldb** | Aggregate Root concept | The library of all tools and assemblies available to the shop. |
| **setup sheet** | Report | A document generated from a job listing all assemblies, stick-outs, and cutting parameters. Output only, not stored as a first-class entity. |
```

### SAVE AND TRY

```powershell
pytest tests/
```

Still passing — the glossary is documentation, not code. But this file is now the contract. Every class name, function name, and variable name in this project must agree with it.

---

## Step 2 — Fix a Language Mismatch

The current code uses `FakeToolRepository` in `tooldb/fakes.py`. This is appropriate for test infrastructure naming. But look at the `Tool` dataclass:

```python
@dataclass
class Tool:
    name: str
    diameter_inches: float
```

The domain glossary shows `tool` as the canonical term. The current `name` field on `Tool` is fine — machinists do refer to tool names. But there is a potential issue: when we add an `id` field (Block 2), should it be called `id`, `tool_id`, or something else?

The glossary says: a tool has an identity. The code should make that identity explicit. For now, `Tool` lacks an `id` field entirely — which is fine for these early lessons, but worth noting.

**The language fix for this lesson:** The `ToolService` currently has a method called `get_all_tools`. A machinist would not say "get all tools." They would say "list tools" or "show all tools from the library." The domain language is "list tools."

Apply the rename:

In `tooldb/service.py`, rename `get_all_tools` to `list_tools`:

```python
def list_tools(self) -> list:      # ← was: get_all_tools
    return self.repository.find_all()
```

Update any tests that call `get_all_tools`:

```python
all_tools = service.list_tools()   # ← was: service.get_all_tools()
```

### SAVE AND TRY

```powershell
pytest tests/
```

All tests still pass. The rename is safe.

**Note the language alignment:** `service.list_tools()` reads like a sentence a machinist might say: "list the tools." `service.get_all_tools()` reads like a programmer talking to a computer. The difference is subtle now; it compounds across hundreds of methods.

---

## 🎯 Challenge: Classify Your Current Code

**You know:** Entity, Value Object, Aggregate, Repository, Domain Service, Application Service.

**Task:** Open each file in `tooldb/` and classify every class and function by its DDD type. Fill in this table:

| File | Class / Function | DDD Type | Why |
|---|---|---|---|
| `tooldb/tool.py` | `Tool` | ? | ? |
| `tooldb/ports.py` | `ToolRepositoryPort` | ? | ? |
| `tooldb/fakes.py` | `FakeToolRepository` | ? | ? |
| `tooldb/service.py` | `ToolService` | ? | ? |
| `tooldb/validation.py` | `ToolValidator` | ? | ? |
| `tooldb/sfm.py` | `calculate_sfm` | ? | ? |
| `tooldb/sfm.py` | `calculate_rpm` | ? | ? |

Some cells may be ambiguous — note the ambiguity and explain your reasoning.

---

<details>
<summary>▶ Show Solution</summary>

| File | Class / Function | DDD Type | Why |
|---|---|---|---|
| `tooldb/tool.py` | `Tool` | **Entity** (incomplete) | Has identity in principle (tools are tracked individually) but lacks an `id` field yet. Will become a full entity in Block 2 when `id` is added. |
| `tooldb/ports.py` | `ToolRepositoryPort` | **Repository Port** | Defines the abstraction for storing and retrieving tools — this is the port side of the repository pattern. |
| `tooldb/fakes.py` | `FakeToolRepository` | **Test Adapter** (Infrastructure) | An in-memory implementation of the repository port, used only in tests. Not domain; infrastructure. |
| `tooldb/service.py` | `ToolService` | **Application Service** | Orchestrates the use case of creating tools — calls validator, calls repository, returns result. Not domain logic; orchestration. |
| `tooldb/validation.py` | `ToolValidator` | **Domain Service** (borderline) | Contains rules about what a valid tool name looks like — that IS domain knowledge. A machinist would recognize "tool names start with two uppercase letters" as a shop naming convention. Borderline because it could also be considered an application concern. |
| `tooldb/sfm.py` | `calculate_sfm` | **Domain Service** (pure function) | Pure domain logic — a machinist would recognize this calculation. No side effects, no infrastructure. The best kind of domain service. |
| `tooldb/sfm.py` | `calculate_rpm` | **Domain Service** (pure function) | Same as `calculate_sfm` — pure domain knowledge expressed as a function. |

**Key insight:** Not everything is an entity. Many domain concepts are pure functions (the SFM calculations), ports (the repository abstraction), or services (the validator). DDD's building blocks cover the full range of domain expressions, not just data containers.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `domain-glossary.md` exists in project root | `ls` in `python-tooldb/` — file present |
| Glossary has 10 terms with DDD classifications | Open `domain-glossary.md` — each row has Term, DDD Type, Definition |
| `get_all_tools` renamed to `list_tools` | Open `tooldb/service.py` — method named `list_tools` |
| All tests pass after rename | Run `pytest tests/` — all green |
| You can explain entity vs value object | Say the difference without reading: identity vs value equality |

---

## Quick Check Answers

**1. What makes something an entity?**

Identity — the fact that two objects with identical attribute values can still be different objects, tracked separately by the system. Tool #47 and Tool #48 have the same name and diameter. They are different entities because they are different physical tools with different histories (different wear, purchased at different times). The `id` field is the code representation of this real-world identity.

**2. What makes something a value object?**

Value equality — two objects with the same value are interchangeable. "1000 SFM" is "1000 SFM" regardless of which variable holds it. There is no identity to track, no `id` field, and the object is immutable: you do not change a cutting speed; you replace it with a different cutting speed. Measurements, amounts, dates, and coordinates are typically value objects.

**3. The code uses `ToolConfig`, the machinist says "assembly." What problem does this cause?**

Every conversation between a developer and a machinist requires translation. "I need to see the assembly for this job" — which table? `tool_configs`? "The assembly is wrong" — is that a `ToolConfiguration` error? Over time, new developers join and assume `ToolConfig` and `assembly` are different things. The misalignment accumulates bugs, misunderstandings, and wasted time. The fix — align the code vocabulary with the domain vocabulary from the start — costs one rename now and saves hundreds of misunderstandings over the project's lifetime.
