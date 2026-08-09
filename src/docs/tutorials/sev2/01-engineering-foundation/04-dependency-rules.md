# Tutorial 4: Dependency Rules

## Introduction

Dependencies determine how changes propagate through your system. A well-designed dependency graph:
- **Minimizes the blast radius** of changes
- **Enables independent testing** of modules
- **Prevents circular dependencies** that create unmaintainable code

This tutorial defines the dependency rules for PartFlow.

---

## Part 1: What is a Dependency?

### 1.1 Definition

A **dependency** exists when Module A needs Module B to function.

```python
# module_a.py
from module_b import SomeClass  # A depends on B

# If B changes, A might break
# If B is missing, A cannot run
```

### 1.2 Dependency Direction

Dependencies have direction. If A depends on B:

```
A ────────▶ B

A "knows about" B
A "imports" B
A "uses" B
Changes to B may affect A
Changes to A do NOT affect B
```

### 1.3 Why Direction Matters

| Scenario | Consequence |
|----------|-------------|
| Everything depends on everything | Change anything, break everything |
| Core depends on edge | Stable core becomes unstable |
| Edge depends on core | Core remains stable |
| No cycles | Changes are predictable |

---

## Part 2: The Dependency Rule

### 2.1 The Rule

> **Dependencies should point toward stability.**

Stable modules are those that:
- Change infrequently
- Have clear, narrow responsibilities
- Define abstractions rather than implementations

### 2.2 In PartFlow Terms

```
UNSTABLE (changes often)              STABLE (changes rarely)
─────────────────────────────────────────────────────────────▶

Web Layer → Service Layer → Domain Layer → Core Abstractions
 (routes,     (use cases)   (entities,       (interfaces)
  templates)                 business rules)
```

### 2.3 Visual Dependency Diagram

```
                    ┌─────────────────────────────────────────┐
                    │        Dependency Direction              │
                    │              everything points           │
                    │                 ▼ inward ▼               │
                    └─────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                         WEB LAYER                                  │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐       │
│  │   routes.py    │   │ templates/    │   │   forms.py    │       │
│  └───────────────┘   └───────────────┘   └───────────────┘       │
│         │                                                          │
│         │ imports services                                         │
│         ▼                                                          │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                                │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐       │
│  │ part_service  │   │machine_service│   │program_service│       │
│  └───────────────┘   └───────────────┘   └───────────────┘       │
│         │                                                          │
│         │ imports domain + repositories                            │
│         ▼                                                          │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER (Core)                          │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐       │
│  │     Part      │   │    Machine    │   │   Program     │       │
│  │   (entity)    │   │   (entity)    │   │   (entity)    │       │
│  └───────────────┘   └───────────────┘   └───────────────┘       │
│  ┌───────────────┐   ┌───────────────┐                           │
│  │  Interfaces   │   │ Value Objects │                           │
│  │  (abstract)   │   │   (types)     │                           │
│  └───────────────┘   └───────────────┘                           │
│         │                                                          │
│         │ defines interfaces (no imports!)                         │
│         ▼                                                          │
└───────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌───────────────────────────────────────────────────────────────────┐
│                      REPOSITORY LAYER                              │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐       │
│  │PartRepository │   │MachineRepo     │   │ProgramRepo   │       │
│  │ (implements)  │   │ (implements)   │   │ (implements) │       │
│  └───────────────┘   └───────────────┘   └───────────────┘       │
│                                                                    │
│  implements domain interfaces, depends on domain entities          │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Dependency Matrix

### 3.1 Module May/May Not Import Table

| Module | May Import | May NOT Import |
|--------|------------|----------------|
| **Domain entities** | Standard library, domain value objects | Services, repositories, web layer |
| **Domain interfaces** | Domain entities | Any implementations |
| **Repositories** | Domain entities, domain interfaces, database | Services, web layer |
| **Services** | Domain entities, domain interfaces, repository interfaces | Web layer, database directly |
| **Web routes** | Services, domain entities (for types) | Repositories directly, database |
| **Templates** | (context only, no imports) | Everything |

### 3.2 Violation Examples

| Violation | Why It's Bad |
|-----------|--------------|
| Entity imports Repository | Core depends on infrastructure |
| Route accesses database | Bypasses service layer |
| Service imports Flask | Service tightly coupled to web |
| Repository imports Service | Circular dependency |

### 3.3 Code Examples

**✅ CORRECT: Service imports Repository interface**
```python
# service/part_service.py
from domain.part import Part
from domain.interfaces import PartRepositoryInterface

class PartService:
    def __init__(self, repo: PartRepositoryInterface):
        self.repo = repo
```

**❌ WRONG: Service imports concrete Repository**
```python
# service/part_service.py
from repository.sqlite_part_repository import SQLitePartRepository  # WRONG!

class PartService:
    def __init__(self):
        self.repo = SQLitePartRepository()  # Tightly coupled
```

**❌ WRONG: Entity imports Repository**
```python
# domain/part.py
from repository.part_repository import PartRepository  # WRONG!

class Part:
    def save(self):
        PartRepository().save(self)  # Entity should not know about persistence
```

---

## Part 4: Dependency Inversion

### 4.1 The Problem

How can Service use Repository without depending on it?

```
Service ────────▶ Repository
       (depends on)
```

If Service imports Repository, then:
- Service is coupled to Repository implementation
- Can't test Service without database
- Can't swap Repository

### 4.2 The Solution: Depend on Abstraction

```
Service ────────▶ Interface ◀──────── Repository
       (depends on)        (implements)
```

```python
# domain/interfaces.py (in Domain layer)
from abc import ABC, abstractmethod
from typing import Optional
from domain.part import Part

class PartRepositoryInterface(ABC):
    @abstractmethod
    def save(self, part: Part) -> None: ...
    
    @abstractmethod
    def find_by_number(self, part_number: str) -> Optional[Part]: ...
```

```python
# repository/part_repository.py (in Repository layer)
from domain.interfaces import PartRepositoryInterface
from domain.part import Part

class SQLitePartRepository(PartRepositoryInterface):
    def save(self, part: Part) -> None:
        # SQL implementation
        pass
    
    def find_by_number(self, part_number: str) -> Optional[Part]:
        # SQL implementation
        pass
```

```python
# service/part_service.py (in Service layer)
from domain.interfaces import PartRepositoryInterface
from domain.part import Part

class PartService:
    def __init__(self, repo: PartRepositoryInterface):
        self.repo = repo  # Works with any implementation
```

### 4.3 Why This Works

- **Domain** defines the interface (what I need)
- **Repository** implements the interface (how I provide it)
- **Service** depends on the interface (I don't care how)

Dependencies:
- Domain depends on: nothing external
- Repository depends on: Domain (interface + entities)
- Service depends on: Domain (interface + entities)

No circular dependencies. Domain is truly stable.

---

## Part 5: File Structure for Dependencies

### 5.1 PartFlow Directory Structure

```
src/
└── partflow/
    ├── __init__.py
    │
    ├── domain/                    # CORE - No external dependencies
    │   ├── __init__.py
    │   ├── entities/              # Business entities
    │   │   ├── __init__.py
    │   │   ├── part.py
    │   │   ├── machine.py
    │   │   └── program.py
    │   ├── value_objects/         # Typed values
    │   │   ├── __init__.py
    │   │   ├── part_number.py
    │   │   └── revision.py
    │   ├── interfaces/            # Abstract repository interfaces
    │   │   ├── __init__.py
    │   │   ├── part_repository.py
    │   │   └── machine_repository.py
    │   └── errors.py              # Domain-specific errors
    │
    ├── repository/                # DATA ACCESS - Depends on Domain
    │   ├── __init__.py
    │   ├── sqlite/
    │   │   ├── __init__.py
    │   │   ├── part_repository.py
    │   │   ├── machine_repository.py
    │   │   └── database.py
    │   └── memory/                # For testing
    │       ├── __init__.py
    │       └── part_repository.py
    │
    ├── service/                   # USE CASES - Depends on Domain
    │   ├── __init__.py
    │   ├── part_service.py
    │   ├── machine_service.py
    │   └── program_service.py
    │
    └── web/                       # HTTP LAYER - Depends on Service
        ├── __init__.py
        ├── app.py
        ├── routes/
        │   ├── __init__.py
        │   ├── parts.py
        │   └── machines.py
        └── templates/
            ├── base.html
            └── parts/
                ├── list.html
                └── detail.html
```

### 5.2 Import Rules by Directory

| From | Can Import |
|------|------------|
| `domain/entities/*` | `domain/value_objects/*`, standard library |
| `domain/interfaces/*` | `domain/entities/*`, typing |
| `repository/*` | `domain/*` |
| `service/*` | `domain/*`, receives repository via DI |
| `web/*` | `service/*`, `domain/entities/*` (for type hints) |

---

## Part 6: Exercises

### Exercise 1: Identify the Violation

Which dependency rule does each code snippet violate?

**Snippet A:**
```python
# domain/part.py
import sqlite3

class Part:
    def save(self):
        conn = sqlite3.connect('parts.db')
        ...
```

**Snippet B:**
```python
# web/routes/parts.py
from repository.sqlite.part_repository import SQLitePartRepository

@app.route('/parts')
def list_parts():
    repo = SQLitePartRepository()
    return repo.find_all()
```

**Snippet C:**
```python
# repository/part_repository.py
from service.part_service import PartService

class SQLitePartRepository:
    def validate_before_save(self, part):
        PartService().validate(part)
```

<details>
<summary>Solution</summary>

**Snippet A**: Domain depends on infrastructure
- Part (domain entity) imports sqlite3 (infrastructure)
- Violation: Domain must not know about persistence

**Snippet B**: Web bypasses service layer
- Route imports repository directly
- Should import PartService instead
- Violation: Web should depend on Service, not Repository

**Snippet C**: Repository depends on Service (circular)
- Repository imports Service
- Service typically imports Repository interface
- Creates circular dependency
- Violation: Repository should be called BY service, not call service

</details>

---

### Exercise 2: Fix the Dependency

Refactor this code to follow dependency rules:

```python
# Current (bad) structure
# domain/part.py
from database.connection import get_db

class Part:
    def save(self):
        db = get_db()
        db.execute("INSERT INTO parts ...")
    
    def find(cls, part_id):
        db = get_db()
        return db.execute("SELECT * FROM parts WHERE id = ?", [part_id])
```

<details>
<summary>Hints</summary>

- Extract persistence to Repository
- Define interface in Domain
- Part should have no imports from persistence

</details>

<details>
<summary>Solution</summary>

```python
# 1. domain/entities/part.py - No persistence
class Part:
    def __init__(self, id: str, part_number: str, name: str):
        self.id = id
        self.part_number = part_number
        self.name = name

# 2. domain/interfaces/part_repository.py - Abstract interface
from abc import ABC, abstractmethod
from typing import Optional
from domain.entities.part import Part

class PartRepositoryInterface(ABC):
    @abstractmethod
    def save(self, part: Part) -> None: ...
    
    @abstractmethod
    def find_by_id(self, part_id: str) -> Optional[Part]: ...

# 3. repository/sqlite/part_repository.py - Implementation
from domain.interfaces.part_repository import PartRepositoryInterface
from domain.entities.part import Part
from repository.sqlite.database import get_db

class SQLitePartRepository(PartRepositoryInterface):
    def save(self, part: Part) -> None:
        db = get_db()
        db.execute(
            "INSERT INTO parts (id, part_number, name) VALUES (?, ?, ?)",
            [part.id, part.part_number, part.name]
        )
    
    def find_by_id(self, part_id: str) -> Optional[Part]:
        db = get_db()
        row = db.execute(
            "SELECT * FROM parts WHERE id = ?", 
            [part_id]
        ).fetchone()
        if row:
            return Part(id=row['id'], part_number=row['part_number'], name=row['name'])
        return None

# 4. service/part_service.py - Uses interface
from domain.interfaces.part_repository import PartRepositoryInterface
from domain.entities.part import Part

class PartService:
    def __init__(self, repo: PartRepositoryInterface):
        self.repo = repo
    
    def create_part(self, part_number: str, name: str) -> Part:
        part = Part(id=generate_uuid(), part_number=part_number, name=name)
        self.repo.save(part)
        return part
    
    def get_part(self, part_id: str) -> Optional[Part]:
        return self.repo.find_by_id(part_id)
```

**Dependency flow:**
- Part (domain): no dependencies
- PartRepositoryInterface (domain): imports Part
- SQLitePartRepository: imports interface, Part, database
- PartService: imports interface, Part (receives implementation via DI)

</details>

---

### Exercise 3: Draw Dependency Graph

Given these imports, draw the dependency graph and identify any violations:

```python
# File: web/routes.py
from service.part_service import PartService
from domain.entities.part import Part

# File: service/part_service.py
from domain.entities.part import Part
from domain.interfaces.part_repository import PartRepositoryInterface

# File: domain/interfaces/part_repository.py
from domain.entities.part import Part

# File: repository/part_repository.py
from domain.entities.part import Part
from domain.interfaces.part_repository import PartRepositoryInterface
import sqlite3
```

<details>
<summary>Solution</summary>

```
┌────────────────┐
│  web/routes    │
└───────┬────────┘
        │
        ├────────────────▶ PartService (service)
        │                        │
        │                        ├──▶ Part (domain)
        │                        │
        │                        └──▶ PartRepositoryInterface (domain)
        │
        └────────────────▶ Part (domain)
                                ▲
                                │
┌────────────────────────┐     │
│ part_repository (repo) │─────┴──▶ PartRepositoryInterface ──▶ Part
│                        │
│                        │─────────▶ sqlite3
└────────────────────────┘
```

**No violations!** All arrows point toward stability:
- Web → Service → Domain
- Repository → Domain
- No circular dependencies
- Domain depends on nothing external

</details>

---

## Summary

### Key Takeaways

| Concept | What It Means |
|---------|---------------|
| **Dependency direction** | Point toward stability |
| **Stable modules** | Change rarely, define abstractions |
| **Dependency Inversion** | Depend on interfaces, not concrete classes |
| **Layer boundaries** | Each layer only knows neighbors |

### Dependency Rules Checklist

- [ ] Domain has no external dependencies
- [ ] Interfaces defined in Domain, implemented in Repository
- [ ] Service receives Repository via injection
- [ ] Web depends on Service, not Repository directly
- [ ] No circular dependencies

---

## Next Tutorial

[Tutorial 5: Change Impact Analysis →](./05-change-analysis.md)
