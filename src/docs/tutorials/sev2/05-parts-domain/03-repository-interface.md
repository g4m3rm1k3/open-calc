# Tutorial 3: Repository Interface

## Introduction

The **Repository Pattern** abstracts data access. It allows the domain layer to remain ignorant of how data is stored.

This tutorial defines the `PartRepositoryInterface` in the domain layer—an abstract contract that any storage implementation must fulfill.

---

## Part 1: Engineering Foundation

### 1.1 Why Repository Pattern?

| Without Repository | With Repository |
|--------------------|-----------------|
| Domain knows about SQL | Domain knows only interface |
| Hard to test (needs database) | Easy to test (mock implementation) |
| Change database = change domain | Change database = change repository only |
| Domain coupled to infrastructure | Domain is pure |

### 1.2 Dependency Direction

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEPENDENCY DIRECTION                       │
│                                                                 │
│   Domain Layer                     Repository Layer             │
│   ┌──────────────────┐            ┌──────────────────┐         │
│   │ PartRepository   │◀───────────│ SQLitePartRepo   │         │
│   │   Interface      │ implements │                  │         │
│   └──────────────────┘            └──────────────────┘         │
│                                                                 │
│   Interface lives in DOMAIN       Implementation in REPOSITORY │
│   Domain doesn't know about SQLite                              │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Interface vs Implementation

| Concept | Location | Purpose |
|---------|----------|---------|
| **Interface** | `domain/interfaces/` | Defines WHAT operations exist |
| **Implementation** | `repository/sqlite/` | Defines HOW operations work |

---

## Part 2: Define the Interface

### 2.1 What Operations Does Part Need?

From the domain model:

| Operation | Description |
|-----------|-------------|
| `save(part)` | Create or update a Part |
| `find_by_id(id)` | Get Part by UUID |
| `find_by_number(part_number)` | Get Part by part number |
| `find_all()` | Get all Parts |
| `delete(id)` | Remove a Part |
| `exists(part_number)` | Check if part number is taken |

### 2.2 Create the Interface

Create `src/partflow/domain/interfaces/part_repository.py`:

```python
"""Repository interface for Part entities.

This module defines the abstract contract that all Part repository
implementations must fulfill. The interface lives in the domain layer
to maintain proper dependency direction (domain doesn't depend on infrastructure).
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.part import Part
from partflow.domain.value_objects.part_number import PartNumber


class PartRepositoryInterface(ABC):
    """Abstract interface for Part persistence operations.
    
    This interface defines the contract that all Part repository
    implementations must fulfill. Implementations may use SQLite,
    PostgreSQL, in-memory storage, or any other persistence mechanism.
    
    The interface is defined in the domain layer so that:
    - Domain code can depend on this interface
    - Implementation details are hidden from domain
    - Different implementations can be swapped easily
    - Testing can use in-memory implementations
    
    All methods that modify state should be atomic—either fully
    complete or have no effect.
    """
    
    @abstractmethod
    def save(self, part: Part) -> None:
        """Save a Part to the repository.
        
        If the Part doesn't exist (by ID), creates it.
        If the Part exists (by ID), updates it.
        
        Args:
            part: The Part entity to save
        
        Raises:
            DuplicateEntityError: If part_number already exists for different ID
            RepositoryError: If storage operation fails
        """
        pass
    
    @abstractmethod
    def find_by_id(self, part_id: UUID) -> Optional[Part]:
        """Find a Part by its internal ID.
        
        Args:
            part_id: The UUID of the Part
        
        Returns:
            The Part if found, None otherwise
        
        Raises:
            RepositoryError: If retrieval fails
        """
        pass
    
    @abstractmethod
    def find_by_number(self, part_number: str | PartNumber) -> Optional[Part]:
        """Find a Part by its part number.
        
        Args:
            part_number: The part number (string or PartNumber)
        
        Returns:
            The Part if found, None otherwise
        
        Raises:
            RepositoryError: If retrieval fails
        """
        pass
    
    @abstractmethod
    def find_all(self) -> List[Part]:
        """Retrieve all Parts.
        
        Returns:
            List of all Parts, empty list if none exist
        
        Raises:
            RepositoryError: If retrieval fails
        
        Note:
            For large datasets, consider using pagination.
            This is intentionally simple for early development.
        """
        pass
    
    @abstractmethod
    def delete(self, part_id: UUID) -> bool:
        """Delete a Part by ID.
        
        Args:
            part_id: The UUID of the Part to delete
        
        Returns:
            True if deleted, False if not found
        
        Raises:
            RepositoryError: If deletion fails
        """
        pass
    
    @abstractmethod
    def exists_by_number(self, part_number: str | PartNumber) -> bool:
        """Check if a part number is already in use.
        
        Args:
            part_number: The part number to check
        
        Returns:
            True if part number exists, False otherwise
        
        Raises:
            RepositoryError: If check fails
        """
        pass
    
    @abstractmethod
    def count(self) -> int:
        """Count total number of Parts.
        
        Returns:
            Total count of Parts
        
        Raises:
            RepositoryError: If count fails
        """
        pass
```

---

## Part 3: Line-by-Line Breakdown

### 3.1 ABC and abstractmethod

```python
from abc import ABC, abstractmethod
```

| Component | Purpose |
|-----------|---------|
| `ABC` | Abstract Base Class—cannot be instantiated |
| `abstractmethod` | Marks method that subclasses MUST implement |

### 3.2 Why ABC?

```python
# Without ABC - Nothing prevents this:
repo = PartRepositoryInterface()  # Creates broken instance!

# With ABC:
repo = PartRepositoryInterface()  # TypeError: Can't instantiate abstract class
```

### 3.3 The Interface Contract

Each method's docstring defines:
1. **What it does** (behavior)
2. **What it takes** (arguments)
3. **What it returns** (return type)
4. **What can go wrong** (exceptions)

This is the **contract** that implementations must fulfill.

---

## Part 4: In-Memory Implementation for Testing

### 4.1 Why In-Memory?

| SQLite Repository | In-Memory Repository |
|-------------------|---------------------|
| Needs database file | No file system |
| Slower (I/O) | Fast (memory only) |
| State persists | State resets per test |
| Integration testing | Unit testing |

### 4.2 Create In-Memory Implementation

Create `tests/fakes/in_memory_part_repository.py`:

```python
"""In-memory Part repository for testing.

This implementation stores Parts in memory, making it perfect for
unit tests that need a repository but don't want database I/O.
"""

from typing import Dict, List, Optional
from uuid import UUID

from partflow.domain.entities.part import Part
from partflow.domain.interfaces.part_repository import PartRepositoryInterface
from partflow.domain.value_objects.part_number import PartNumber


class InMemoryPartRepository(PartRepositoryInterface):
    """In-memory implementation of PartRepositoryInterface.
    
    Stores Parts in a dictionary, keyed by UUID.
    Perfect for unit testing—fast, no I/O, fresh state per test.
    
    Attributes:
        _parts: Dictionary mapping UUID to Part
    """
    
    def __init__(self):
        """Initialize empty repository."""
        self._parts: Dict[UUID, Part] = {}
    
    def save(self, part: Part) -> None:
        """Save Part to memory.
        
        Duplicates by part_number (for different IDs) are rejected.
        """
        # Check for duplicate part number (different ID)
        for existing in self._parts.values():
            if (str(existing.part_number) == str(part.part_number) 
                and existing.id != part.id):
                from partflow.domain.errors import DuplicateEntityError
                raise DuplicateEntityError("Part", str(part.part_number))
        
        self._parts[part.id] = part
    
    def find_by_id(self, part_id: UUID) -> Optional[Part]:
        """Find Part by UUID."""
        return self._parts.get(part_id)
    
    def find_by_number(self, part_number: str | PartNumber) -> Optional[Part]:
        """Find Part by part number."""
        search_value = str(part_number)
        for part in self._parts.values():
            if str(part.part_number) == search_value:
                return part
        return None
    
    def find_all(self) -> List[Part]:
        """Return all Parts."""
        return list(self._parts.values())
    
    def delete(self, part_id: UUID) -> bool:
        """Delete Part by UUID."""
        if part_id in self._parts:
            del self._parts[part_id]
            return True
        return False
    
    def exists_by_number(self, part_number: str | PartNumber) -> bool:
        """Check if part number exists."""
        return self.find_by_number(part_number) is not None
    
    def count(self) -> int:
        """Return count of Parts."""
        return len(self._parts)
    
    def clear(self) -> None:
        """Clear all Parts (useful for test cleanup)."""
        self._parts.clear()
```

---

## Part 5: Test the Interface Contract

### 5.1 Interface Tests

Create `tests/unit/domain/interfaces/test_part_repository.py`:

```python
"""Tests for PartRepositoryInterface contract.

These tests verify that implementations correctly implement
the repository interface. Run with any implementation.
"""

import pytest
from uuid import uuid4

from partflow.domain.entities.part import Part
from partflow.domain.errors import DuplicateEntityError
from tests.fakes.in_memory_part_repository import InMemoryPartRepository


class TestPartRepositorySaveAndFind:
    """Tests for save and find operations."""
    
    @pytest.fixture
    def repo(self):
        """Provide fresh repository for each test."""
        return InMemoryPartRepository()
    
    def test_save_and_find_by_id(self, repo):
        """Saved Part should be findable by ID."""
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test Part",
        )
        
        repo.save(part)
        found = repo.find_by_id(part.id)
        
        assert found is not None
        assert found.id == part.id
        assert found.name == "Test Part"
    
    def test_save_and_find_by_number(self, repo):
        """Saved Part should be findable by part number."""
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test Part",
        )
        
        repo.save(part)
        found = repo.find_by_number("PN-12345")
        
        assert found is not None
        assert str(found.part_number) == "PN-12345"
    
    def test_find_nonexistent_returns_none(self, repo):
        """Finding nonexistent Part should return None."""
        assert repo.find_by_id(uuid4()) is None
        assert repo.find_by_number("XX-99999") is None
    
    def test_duplicate_part_number_raises(self, repo):
        """Cannot save two Parts with same part number."""
        part1 = Part(id=uuid4(), part_number="PN-12345", name="Part 1")
        part2 = Part(id=uuid4(), part_number="PN-12345", name="Part 2")
        
        repo.save(part1)
        
        with pytest.raises(DuplicateEntityError):
            repo.save(part2)


class TestPartRepositoryFindAll:
    """Tests for find_all operation."""
    
    @pytest.fixture
    def repo(self):
        return InMemoryPartRepository()
    
    def test_find_all_empty(self, repo):
        """Empty repository returns empty list."""
        assert repo.find_all() == []
    
    def test_find_all_returns_all(self, repo):
        """Returns all saved Parts."""
        part1 = Part(id=uuid4(), part_number="PN-00001", name="Part 1")
        part2 = Part(id=uuid4(), part_number="PN-00002", name="Part 2")
        
        repo.save(part1)
        repo.save(part2)
        
        all_parts = repo.find_all()
        assert len(all_parts) == 2


class TestPartRepositoryDelete:
    """Tests for delete operation."""
    
    @pytest.fixture
    def repo(self):
        return InMemoryPartRepository()
    
    def test_delete_existing_returns_true(self, repo):
        """Deleting existing Part returns True."""
        part = Part(id=uuid4(), part_number="PN-12345", name="Test")
        repo.save(part)
        
        result = repo.delete(part.id)
        
        assert result is True
        assert repo.find_by_id(part.id) is None
    
    def test_delete_nonexistent_returns_false(self, repo):
        """Deleting nonexistent Part returns False."""
        result = repo.delete(uuid4())
        assert result is False


class TestPartRepositoryExists:
    """Tests for exists_by_number operation."""
    
    @pytest.fixture
    def repo(self):
        return InMemoryPartRepository()
    
    def test_exists_when_present(self, repo):
        """Returns True when Part exists."""
        part = Part(id=uuid4(), part_number="PN-12345", name="Test")
        repo.save(part)
        
        assert repo.exists_by_number("PN-12345") is True
    
    def test_exists_when_absent(self, repo):
        """Returns False when Part doesn't exist."""
        assert repo.exists_by_number("PN-99999") is False
```

Run:
```bash
pytest tests/unit/domain/interfaces/test_part_repository.py -v
```

---

## Part 6: Export Interface

### 6.1 Update interfaces/__init__.py

```python
# src/partflow/domain/interfaces/__init__.py
"""Domain interfaces for PartFlow.

Interfaces define contracts that implementations must fulfill.
They live in the domain layer to maintain proper dependency direction.
"""

from .part_repository import PartRepositoryInterface

__all__ = ['PartRepositoryInterface']
```

---

## Part 7: Exercises

### Exercise 1: Add Update Test

Write a test that verifies updating an existing Part works correctly.

<details>
<summary>Solution</summary>

```python
def test_save_updates_existing_part(self, repo):
    """Saving Part with same ID updates it."""
    part_id = uuid4()
    part1 = Part(id=part_id, part_number="PN-12345", name="Original")
    part2 = Part(id=part_id, part_number="PN-12345", name="Updated")
    
    repo.save(part1)
    repo.save(part2)  # Same ID = update
    
    found = repo.find_by_id(part_id)
    assert found.name == "Updated"
    assert repo.count() == 1  # Not a new entry
```

</details>

---

## Summary

### Key Concepts

| Concept | Purpose |
|---------|---------|
| **Repository Interface** | Defines data access contract |
| **Lives in Domain** | Domain doesn't depend on infrastructure |
| **ABC + abstractmethod** | Enforces implementation |
| **In-Memory Implementation** | Testing without database |

### Repository Checklist

- [ ] Interface in `domain/interfaces/`
- [ ] All CRUD operations defined
- [ ] Clear docstrings with contracts
- [ ] In-memory implementation for tests
- [ ] Interface tests pass

---

## Next Tutorial

[Tutorial 4: SQLite Repository →](./04-sqlite-repository.md)
