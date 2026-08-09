# Tutorial 2: Revision Entity

## Introduction

This tutorial implements the `Revision` entity using TDD, capturing complete snapshots of Part state.

---

## Part 1: Revision Design

### 1.1 What a Revision Stores

| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Revision identity |
| part_id | UUID | Parent Part |
| major | int | Major version (1, 2, 3...) |
| minor | int | Minor version (0, 1, 2...) |
| snapshot | dict | Complete Part state as JSON |
| changed_by | str | User who made change |
| changed_at | datetime | When change was made |
| change_reason | str | Required reason |
| external_revision | str | Optional Rev A, Rev B |

### 1.2 Snapshot Contents

The snapshot captures the Part at a point in time:

```python
{
    "part_number": "PN-12345",
    "name": "Widget Assembly",
    "description": "Main assembly component",
    "status": "active",
    "machines": ["MCH-001", "MCH-003"],
    # ... any other Part data
}
```

---

## Part 2: TDD Implementation

### 2.1 First Tests

Create `tests/unit/domain/entities/test_revision.py`:

```python
"""Tests for Revision entity."""

import pytest
from datetime import datetime
from uuid import uuid4


class TestRevisionCreation:
    """Tests for creating Revision entities."""
    
    def test_create_revision(self):
        """Can create a revision with required fields."""
        from partflow.domain.entities.revision import Revision
        
        part_id = uuid4()
        snapshot = {"name": "Test Part", "status": "draft"}
        
        revision = Revision(
            id=uuid4(),
            part_id=part_id,
            major=1,
            minor=0,
            snapshot=snapshot,
            changed_by="user123",
            change_reason="Initial creation",
        )
        
        assert revision.part_id == part_id
        assert revision.major == 1
        assert revision.minor == 0
        assert revision.snapshot == snapshot
        assert revision.changed_by == "user123"
    
    def test_version_string(self):
        """Version should be formatted as major.minor."""
        from partflow.domain.entities.revision import Revision
        
        revision = Revision(
            id=uuid4(),
            part_id=uuid4(),
            major=2,
            minor=3,
            snapshot={},
            changed_by="user",
            change_reason="Test",
        )
        
        assert revision.version_string == "2.3"
    
    def test_changed_at_defaults_to_now(self):
        """changed_at should default to current time."""
        from partflow.domain.entities.revision import Revision
        
        before = datetime.utcnow()
        revision = Revision(
            id=uuid4(),
            part_id=uuid4(),
            major=1,
            minor=0,
            snapshot={},
            changed_by="user",
            change_reason="Test",
        )
        after = datetime.utcnow()
        
        assert before <= revision.changed_at <= after


class TestRevisionValidation:
    """Tests for Revision validation."""
    
    def test_change_reason_required(self):
        """change_reason cannot be empty."""
        from partflow.domain.entities.revision import Revision
        from partflow.domain.errors import ValidationError
        
        with pytest.raises(ValidationError, match="change_reason"):
            Revision(
                id=uuid4(),
                part_id=uuid4(),
                major=1,
                minor=0,
                snapshot={},
                changed_by="user",
                change_reason="",  # Empty!
            )
    
    def test_version_numbers_non_negative(self):
        """Version numbers cannot be negative."""
        from partflow.domain.entities.revision import Revision
        from partflow.domain.errors import ValidationError
        
        with pytest.raises(ValidationError):
            Revision(
                id=uuid4(),
                part_id=uuid4(),
                major=-1,  # Negative!
                minor=0,
                snapshot={},
                changed_by="user",
                change_reason="Test",
            )


class TestRevisionComparison:
    """Tests for comparing revisions."""
    
    def test_is_newer_than(self):
        """Can compare version ordering."""
        from partflow.domain.entities.revision import Revision
        
        v1_0 = Revision(id=uuid4(), part_id=uuid4(), major=1, minor=0,
                        snapshot={}, changed_by="u", change_reason="r")
        v1_1 = Revision(id=uuid4(), part_id=uuid4(), major=1, minor=1,
                        snapshot={}, changed_by="u", change_reason="r")
        v2_0 = Revision(id=uuid4(), part_id=uuid4(), major=2, minor=0,
                        snapshot={}, changed_by="u", change_reason="r")
        
        assert v1_1.is_newer_than(v1_0)
        assert v2_0.is_newer_than(v1_1)
        assert not v1_0.is_newer_than(v1_1)
```

### 2.2 Implementation

Create `src/partflow/domain/entities/revision.py`:

```python
"""Revision entity for version control."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from partflow.domain.errors import ValidationError


@dataclass
class Revision:
    """A versioned snapshot of a Part.
    
    Revisions are immutable once created. They capture the complete
    state of a Part at a point in time.
    
    Attributes:
        id: Unique revision identifier
        part_id: The Part this revision belongs to
        major: Major version number
        minor: Minor version number
        snapshot: Complete Part state as dictionary
        changed_by: User who created this revision
        changed_at: When this revision was created
        change_reason: Why this revision was created (required)
        external_revision: Optional drawing revision (Rev A, Rev B)
    """
    id: UUID
    part_id: UUID
    major: int
    minor: int
    snapshot: Dict[str, Any]
    changed_by: str
    change_reason: str
    changed_at: datetime = field(default_factory=datetime.utcnow)
    external_revision: Optional[str] = None
    
    def __post_init__(self):
        """Validate after initialization."""
        self._validate()
    
    def _validate(self):
        """Validate revision fields."""
        if not self.change_reason or not self.change_reason.strip():
            raise ValidationError(
                "change_reason",
                "Change reason is required for audit trail"
            )
        
        if self.major < 0:
            raise ValidationError("major", "Major version cannot be negative")
        
        if self.minor < 0:
            raise ValidationError("minor", "Minor version cannot be negative")
        
        if not self.changed_by or not self.changed_by.strip():
            raise ValidationError("changed_by", "User is required")
    
    @property
    def version_string(self) -> str:
        """Get version as string (e.g., '1.0', '2.3')."""
        return f"{self.major}.{self.minor}"
    
    @property
    def version_tuple(self) -> tuple:
        """Get version as tuple for comparison."""
        return (self.major, self.minor)
    
    def is_newer_than(self, other: 'Revision') -> bool:
        """Check if this revision is newer than another."""
        return self.version_tuple > other.version_tuple
    
    def is_major_change_from(self, other: 'Revision') -> bool:
        """Check if this is a major change from another revision."""
        return self.major > other.major
    
    @classmethod
    def create_initial(
        cls,
        revision_id: UUID,
        part_id: UUID,
        snapshot: Dict[str, Any],
        changed_by: str,
        change_reason: str = "Initial creation",
    ) -> 'Revision':
        """Create initial revision (1.0)."""
        return cls(
            id=revision_id,
            part_id=part_id,
            major=1,
            minor=0,
            snapshot=snapshot,
            changed_by=changed_by,
            change_reason=change_reason,
        )
    
    @classmethod
    def create_next(
        cls,
        revision_id: UUID,
        previous: 'Revision',
        snapshot: Dict[str, Any],
        changed_by: str,
        change_reason: str,
        is_major: bool = False,
    ) -> 'Revision':
        """Create next revision from previous.
        
        Args:
            revision_id: ID for new revision
            previous: Previous revision
            snapshot: New snapshot
            changed_by: User making change
            change_reason: Reason for change
            is_major: If True, increment major (X.0), else minor (N.X)
        """
        if is_major:
            major = previous.major + 1
            minor = 0
        else:
            major = previous.major
            minor = previous.minor + 1
        
        return cls(
            id=revision_id,
            part_id=previous.part_id,
            major=major,
            minor=minor,
            snapshot=snapshot,
            changed_by=changed_by,
            change_reason=change_reason,
        )
```

---

## Part 3: Snapshot Creation

### 3.1 Creating Snapshots from Part

```python
def create_snapshot(part: Part) -> Dict[str, Any]:
    """Create a snapshot dictionary from a Part.
    
    Captures all relevant Part data in a format that can be
    stored and later restored.
    """
    return {
        "part_number": str(part.part_number),
        "name": part.name,
        "description": part.description,
        "status": part.status.value,
        "created_at": part.created_at.isoformat(),
    }
```

### 3.2 Restoring from Snapshot

```python
def restore_from_snapshot(
    part_id: UUID,
    snapshot: Dict[str, Any]
) -> Part:
    """Restore a Part from a snapshot.
    
    Creates a Part instance from stored snapshot data.
    Note: This creates a new Part object; it doesn't update database.
    """
    from partflow.domain.entities.part import Part, PartStatus
    from partflow.domain.value_objects.part_number import PartNumber
    
    return Part(
        id=part_id,
        part_number=PartNumber(snapshot["part_number"]),
        name=snapshot["name"],
        description=snapshot.get("description"),
        status=PartStatus(snapshot["status"]),
        created_at=datetime.fromisoformat(snapshot["created_at"]),
    )
```

---

## Part 4: Export

Update `src/partflow/domain/entities/__init__.py`:

```python
from .revision import Revision

__all__ = [
    'Part', 'PartStatus',
    'Machine', 'ControllerType', 'MachineStatus',
    'PartMachine',
    'PartLock',
    'Revision',
]
```

---

## Summary

### Key Patterns

| Pattern | Usage |
|---------|-------|
| **Factory methods** | create_initial, create_next |
| **Immutable data** | Snapshot never changes |
| **Version comparison** | is_newer_than |

---

## Next Tutorial

[Tutorial 3: Snapshot Strategy →](./03-snapshot-strategy.md)
