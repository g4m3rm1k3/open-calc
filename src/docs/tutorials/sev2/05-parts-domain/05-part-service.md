# Tutorial 5: Part Service

## Introduction

The **Service Layer** orchestrates use cases. It sits between the web layer and the domain, coordinating operations without containing business logic.

---

## Part 1: Service Layer Responsibilities

### 1.1 What Services Do

| Responsibility | Example |
|----------------|---------|
| **Orchestration** | Coordinate repository and domain |
| **Transaction boundaries** | Wrap operations in transactions |
| **Authorization** | Check if user can perform action |
| **Input transformation** | Convert DTOs to domain objects |
| **Error translation** | Convert domain errors to service errors |

### 1.2 What Services Don't Do

| Not Service Responsibility | Where It Belongs |
|---------------------------|------------------|
| Business rules | Domain entities |
| Data access | Repository |
| HTTP handling | Web layer |
| Validation logic | Value objects, entities |

---

## Part 2: TDD Implementation

### 2.1 RED: First Test

Create `tests/unit/service/test_part_service.py`:

```python
"""Tests for PartService."""

import pytest
from uuid import uuid4
from unittest.mock import Mock

from partflow.domain.entities.part import Part, PartStatus
from partflow.domain.errors import DuplicateEntityError, NotFoundError


class TestPartServiceCreate:
    """Tests for creating Parts through service."""
    
    @pytest.fixture
    def mock_repo(self):
        """Provide mock repository."""
        return Mock()
    
    @pytest.fixture
    def service(self, mock_repo):
        """Provide service with mock repository."""
        from partflow.service.part_service import PartService
        return PartService(mock_repo)
    
    def test_create_part_returns_part(self, service, mock_repo):
        """Creating Part returns the Part."""
        mock_repo.exists_by_number.return_value = False
        
        part = service.create_part(
            part_number="PN-12345",
            name="Test Part",
        )
        
        assert part.name == "Test Part"
        assert str(part.part_number) == "PN-12345"
        assert part.status == PartStatus.DRAFT
    
    def test_create_part_saves_to_repository(self, service, mock_repo):
        """Creating Part saves to repository."""
        mock_repo.exists_by_number.return_value = False
        
        service.create_part(
            part_number="PN-12345",
            name="Test Part",
        )
        
        mock_repo.save.assert_called_once()
    
    def test_create_duplicate_raises(self, service, mock_repo):
        """Cannot create Part with existing part number."""
        mock_repo.exists_by_number.return_value = True
        
        with pytest.raises(DuplicateEntityError):
            service.create_part(
                part_number="PN-12345",
                name="Test Part",
            )
```

Run: **FAILS** (service doesn't exist)

### 2.2 GREEN: Create Service

Create `src/partflow/service/part_service.py`:

```python
"""Part service for orchestrating Part operations.

The service layer coordinates between the web layer and domain,
providing use-case specific methods.
"""

from typing import List, Optional
from uuid import UUID, uuid4

from partflow.domain.entities.part import Part, PartStatus
from partflow.domain.interfaces.part_repository import PartRepositoryInterface
from partflow.domain.errors import DuplicateEntityError, NotFoundError


class PartService:
    """Service for Part operations.
    
    Orchestrates Part creation, retrieval, and modification.
    Delegates business logic to domain entities.
    
    Attributes:
        _repo: Repository for Part persistence
    """
    
    def __init__(self, repo: PartRepositoryInterface):
        """Initialize with repository.
        
        Args:
            repo: Part repository implementation
        """
        self._repo = repo
    
    def create_part(
        self,
        part_number: str,
        name: str,
        description: Optional[str] = None,
    ) -> Part:
        """Create a new Part.
        
        Args:
            part_number: Unique part number (format: XX-NNNNN)
            name: Display name
            description: Optional description
        
        Returns:
            The created Part
        
        Raises:
            DuplicateEntityError: If part number already exists
            ValidationError: If part data is invalid
        """
        # Check for duplicate
        if self._repo.exists_by_number(part_number):
            raise DuplicateEntityError("Part", part_number)
        
        # Create Part (validation happens in Part.__init__)
        part = Part(
            id=uuid4(),
            part_number=part_number,
            name=name,
            description=description,
        )
        
        # Persist
        self._repo.save(part)
        
        return part
```

Run: **PASSES**

### 2.3 Add More Service Methods

**Tests:**

```python
class TestPartServiceGet:
    """Tests for retrieving Parts."""
    
    @pytest.fixture
    def mock_repo(self):
        return Mock()
    
    @pytest.fixture
    def service(self, mock_repo):
        from partflow.service.part_service import PartService
        return PartService(mock_repo)
    
    def test_get_by_id_returns_part(self, service, mock_repo):
        """Get by ID returns Part when exists."""
        part_id = uuid4()
        expected = Part(id=part_id, part_number="PN-12345", name="Test")
        mock_repo.find_by_id.return_value = expected
        
        result = service.get_part(part_id)
        
        assert result == expected
    
    def test_get_by_id_not_found_raises(self, service, mock_repo):
        """Get by ID raises when not found."""
        mock_repo.find_by_id.return_value = None
        
        with pytest.raises(NotFoundError):
            service.get_part(uuid4())
    
    def test_get_all_returns_list(self, service, mock_repo):
        """Get all returns list of Parts."""
        mock_repo.find_all.return_value = []
        
        result = service.get_all_parts()
        
        assert result == []


class TestPartServiceUpdate:
    """Tests for updating Parts."""
    
    @pytest.fixture
    def mock_repo(self):
        return Mock()
    
    @pytest.fixture
    def service(self, mock_repo):
        from partflow.service.part_service import PartService
        return PartService(mock_repo)
    
    def test_update_part_saves(self, service, mock_repo):
        """Updating Part saves changes."""
        part_id = uuid4()
        existing = Part(id=part_id, part_number="PN-12345", name="Old")
        mock_repo.find_by_id.return_value = existing
        
        result = service.update_part(part_id, name="New Name")
        
        mock_repo.save.assert_called_once()
        assert result.name == "New Name"
    
    def test_update_nonexistent_raises(self, service, mock_repo):
        """Updating nonexistent Part raises."""
        mock_repo.find_by_id.return_value = None
        
        with pytest.raises(NotFoundError):
            service.update_part(uuid4(), name="New")
```

**Complete Service:**

```python
"""Part service for orchestrating Part operations."""

from dataclasses import replace
from typing import List, Optional
from uuid import UUID, uuid4

from partflow.domain.entities.part import Part, PartStatus
from partflow.domain.interfaces.part_repository import PartRepositoryInterface
from partflow.domain.errors import DuplicateEntityError, NotFoundError


class PartService:
    """Service for Part operations."""
    
    def __init__(self, repo: PartRepositoryInterface):
        self._repo = repo
    
    def create_part(
        self,
        part_number: str,
        name: str,
        description: Optional[str] = None,
    ) -> Part:
        """Create a new Part."""
        if self._repo.exists_by_number(part_number):
            raise DuplicateEntityError("Part", part_number)
        
        part = Part(
            id=uuid4(),
            part_number=part_number,
            name=name,
            description=description,
        )
        
        self._repo.save(part)
        return part
    
    def get_part(self, part_id: UUID) -> Part:
        """Get Part by ID.
        
        Args:
            part_id: UUID of the Part
        
        Returns:
            The Part
        
        Raises:
            NotFoundError: If Part doesn't exist
        """
        part = self._repo.find_by_id(part_id)
        if part is None:
            raise NotFoundError("Part", str(part_id))
        return part
    
    def get_part_by_number(self, part_number: str) -> Part:
        """Get Part by part number.
        
        Args:
            part_number: The part number
        
        Returns:
            The Part
        
        Raises:
            NotFoundError: If Part doesn't exist
        """
        part = self._repo.find_by_number(part_number)
        if part is None:
            raise NotFoundError("Part", part_number)
        return part
    
    def get_all_parts(self) -> List[Part]:
        """Get all Parts.
        
        Returns:
            List of all Parts
        """
        return self._repo.find_all()
    
    def update_part(
        self,
        part_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Part:
        """Update an existing Part.
        
        Args:
            part_id: UUID of the Part to update
            name: New name (if provided)
            description: New description (if provided)
        
        Returns:
            The updated Part
        
        Raises:
            NotFoundError: If Part doesn't exist
        """
        part = self._repo.find_by_id(part_id)
        if part is None:
            raise NotFoundError("Part", str(part_id))
        
        # Update fields using dataclass replace
        updates = {}
        if name is not None:
            updates['name'] = name
        if description is not None:
            updates['description'] = description
        
        if updates:
            # Note: For mutable dataclass, we modify directly
            if name is not None:
                part.name = name
            if description is not None:
                part.description = description
            
            self._repo.save(part)
        
        return part
    
    def delete_part(self, part_id: UUID) -> bool:
        """Delete a Part.
        
        Args:
            part_id: UUID of the Part to delete
        
        Returns:
            True if deleted, False if not found
        """
        return self._repo.delete(part_id)
    
    def count_parts(self) -> int:
        """Count all Parts.
        
        Returns:
            Total number of Parts
        """
        return self._repo.count()
```

---

## Part 3: Export Service

```python
# src/partflow/service/__init__.py
"""Service layer for PartFlow."""

from .part_service import PartService

__all__ = ['PartService']
```

---

## Part 4: Exercises

### Exercise 1: Add Activate Method

Add `activate_part(part_id)` that transitions a DRAFT Part to ACTIVE.

<details>
<summary>Solution</summary>

```python
def activate_part(self, part_id: UUID) -> Part:
    """Activate a Part.
    
    Transitions Part from DRAFT to ACTIVE status.
    """
    part = self._repo.find_by_id(part_id)
    if part is None:
        raise NotFoundError("Part", str(part_id))
    
    if part.status != PartStatus.DRAFT:
        from partflow.domain.errors import InvalidStateTransitionError
        raise InvalidStateTransitionError(
            part.status.value, 
            PartStatus.ACTIVE.value
        )
    
    part.status = PartStatus.ACTIVE
    self._repo.save(part)
    return part
```

</details>

---

## Summary

### Key Concepts

| Concept | Purpose |
|---------|---------|
| **Service layer** | Orchestrates use cases |
| **Dependency Injection** | Repository passed in constructor |
| **Mock repository** | Unit test without database |
| **Single responsibility** | Services don't contain business rules |

---

## Next Tutorial

[Tutorial 6: Web Routes and Templates →](./06-web-layer.md)
