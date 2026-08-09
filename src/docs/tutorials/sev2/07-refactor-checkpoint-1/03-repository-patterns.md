# Tutorial 3: Repository Patterns

## Introduction

Our repositories share patterns. This tutorial examines them and extracts reusable components.

---

## Part 1: Common Repository Operations

### 1.1 Shared Interface Pattern

Every repository has:

| Method | Part | Machine |
|--------|------|---------|
| save | ✓ | ✓ |
| find_by_id | ✓ | ✓ |
| find_all | ✓ | ✓ |
| delete | ✓ | ✓ |
| count | ✓ | ✓ |
| exists_by_* | ✓ | ✓ |

### 1.2 Type-Specific Methods

| Method | Entity |
|--------|--------|
| find_by_number | Part |
| find_by_machine_id | Machine |
| find_by_status | Both (different enum) |

---

## Part 2: Generic Repository Consideration

### 2.1 Generic Interface (NOT Recommended)

```python
# This is what we could do (but won't):
from typing import TypeVar, Generic

T = TypeVar('T')

class RepositoryInterface(Generic[T], ABC):
    @abstractmethod
    def save(self, entity: T) -> None: ...
    
    @abstractmethod
    def find_by_id(self, id: UUID) -> Optional[T]: ...
```

### 2.2 Why We Don't Use Generics Here

| Pro | Con |
|-----|-----|
| Less duplication | Harder to understand |
| Single pattern | Type hints confusing |
| DRY | Repositories ARE different |

**Decision:** Keep specific interfaces but document the pattern.

---

## Part 3: What We WILL Extract

### 3.1 Database Connection Pattern

The connection context manager is duplicated:

```python
# Current pattern in every repo:
with self._db.connection() as conn:
    # do stuff
```

This is actually fine—it's clear and explicit.

### 3.2 Row Conversion Pattern

Each repository has `_row_to_entity`. This is intentionally different because entities are different.

### 3.3 Error Handling Pattern

This IS worth standardizing:

```python
# Current (inconsistent):
except sqlite3.IntegrityError as e:
    if "UNIQUE constraint failed: parts.part_number" in str(e):
        raise DuplicateEntityError("Part", str(part.part_number))
```

**Improvement:** Create a helper:

```python
# src/partflow/repository/sqlite/helpers.py
"""Repository helper functions."""

import sqlite3
from partflow.domain.errors import DuplicateEntityError


def handle_integrity_error(
    error: sqlite3.IntegrityError,
    entity_type: str,
    unique_field: str,
    unique_value: str,
) -> None:
    """Convert SQLite integrity errors to domain errors.
    
    Args:
        error: The SQLite error
        entity_type: Name of entity type (e.g., "Part")
        unique_field: Name of the unique field (e.g., "part_number")
        unique_value: Value that caused the conflict
    
    Raises:
        DuplicateEntityError: If it's a unique constraint violation
        sqlite3.IntegrityError: Re-raises other integrity errors
    """
    error_str = str(error)
    if "UNIQUE constraint failed" in error_str:
        raise DuplicateEntityError(entity_type, unique_value)
    raise error
```

**Usage:**

```python
from partflow.repository.sqlite.helpers import handle_integrity_error

def save(self, part: Part) -> None:
    with self._db.connection() as conn:
        try:
            conn.execute(...)
            conn.commit()
        except sqlite3.IntegrityError as e:
            handle_integrity_error(e, "Part", "part_number", str(part.part_number))
```

---

## Part 4: Create Repository Tests Base

### 4.1 Common Test Fixtures

Create `tests/conftest.py` improvements:

```python
"""Shared test fixtures."""

import pytest
from uuid import uuid4

from partflow.repository.sqlite.database import Database
from partflow.domain.entities.part import Part
from partflow.domain.entities.machine import Machine, ControllerType


@pytest.fixture
def in_memory_db():
    """Provide fresh in-memory database for each test."""
    return Database(":memory:")


@pytest.fixture
def sample_part():
    """Provide a sample Part for testing."""
    return Part(
        id=uuid4(),
        part_number="PN-12345",
        name="Test Part",
        description="A sample part for testing",
    )


@pytest.fixture
def sample_machine():
    """Provide a sample Machine for testing."""
    return Machine(
        id=uuid4(),
        machine_id="MCH-001",
        name="Test Machine",
        controller_type=ControllerType.FANUC,
    )
```

### 4.2 Parameterized Repository Tests

For common operations, we can use parameterized tests:

```python
"""Parameterized tests for repository patterns."""

import pytest
from uuid import uuid4


class TestRepositoryPatterns:
    """Generic tests that all repositories should pass."""
    
    @pytest.mark.parametrize("repo_fixture,entity_fixture", [
        ("part_repo", "sample_part"),
        ("machine_repo", "sample_machine"),
    ])
    def test_save_and_find_by_id(self, repo_fixture, entity_fixture, request):
        """All repositories should save and find by ID."""
        repo = request.getfixturevalue(repo_fixture)
        entity = request.getfixturevalue(entity_fixture)
        
        repo.save(entity)
        found = repo.find_by_id(entity.id)
        
        assert found is not None
        assert found.id == entity.id
```

---

## Part 5: Repository Export Organization

### 5.1 Clean Exports

```python
# src/partflow/repository/__init__.py
"""Repository layer for PartFlow.

Provides data persistence implementations.
"""

from .sqlite.database import Database
from .sqlite.part_repository import SQLitePartRepository
from .sqlite.machine_repository import SQLiteMachineRepository
from .sqlite.part_machine_repository import SQLitePartMachineRepository

__all__ = [
    'Database',
    'SQLitePartRepository',
    'SQLiteMachineRepository',
    'SQLitePartMachineRepository',
]
```

---

## Summary

### Refactoring Applied

| Change | Benefit |
|--------|---------|
| Error handling helper | Consistent error translation |
| Shared fixtures | Less test boilerplate |
| Clean exports | Easier imports |

### What We Kept

| Pattern | Why Keep |
|---------|----------|
| Separate interfaces | Domain clarity |
| _row_to_entity methods | Entity-specific |
| Explicit connection handling | Clear flow |

---

## Next Tutorial

[Tutorial 4: Service Improvements →](./04-service-improvements.md)
