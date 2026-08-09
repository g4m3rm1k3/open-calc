# Tutorial 1: Part Entity (TDD)

## Introduction

This tutorial implements the `Part` entity using Test-Driven Development. Every line of code is preceded by a test.

> **Remember: RED → GREEN → REFACTOR**

---

## Part 1: What is a Part?

From the domain model (Phase 01):

| Property | Type | Description |
|----------|------|-------------|
| id | UUID | Internal identifier |
| part_number | PartNumber | User-visible, unique (XX-NNNNN) |
| name | string | Display name |
| description | string (optional) | Details |
| status | PartStatus | draft, active, obsolete |
| created_at | timestamp | When created |

**Invariants:**
- part_number must be unique
- part_number cannot change after creation
- name cannot be empty

---

## Part 2: First Test - Part Creation

### 2.1 RED: Write Failing Test

Create `tests/unit/domain/entities/test_part.py`:

```python
"""Tests for Part entity."""

import pytest
from uuid import uuid4


class TestPartCreation:
    """Tests for creating Part entities."""
    
    def test_create_part_with_required_fields(self):
        """Part should be creatable with required fields."""
        from partflow.domain.entities.part import Part
        
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test Part",
        )
        
        assert part.name == "Test Part"
        assert str(part.part_number) == "PN-12345"
```

### 2.2 Run Test - See it Fail

```bash
pytest tests/unit/domain/entities/test_part.py -v
```

**Expected failure:**
```
ImportError: cannot import name 'Part' from 'partflow.domain.entities.part'
```

This is RED. Test fails because Part doesn't exist.

### 2.3 GREEN: Write Minimal Code

Create `src/partflow/domain/entities/part.py`:

```python
"""Part entity for PartFlow.

A Part represents a manufacturable component with a unique part number.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class Part:
    """A manufacturable part with unique identification.
    
    Attributes:
        id: Internal unique identifier (UUID)
        part_number: User-visible part number (format: XX-NNNNN)
        name: Display name for the part
        description: Optional detailed description
        created_at: Timestamp of creation
    """
    id: UUID
    part_number: str
    name: str
    description: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
```

### 2.4 Run Test - See it Pass

```bash
pytest tests/unit/domain/entities/test_part.py -v
```

**Expected:**
```
test_create_part_with_required_fields PASSED
```

This is GREEN!

---

## Part 3: Add Validation Tests

### 3.1 RED: Empty Name Should Fail

Add test:

```python
def test_create_part_with_empty_name_raises(self):
    """Part cannot have empty name."""
    from partflow.domain.entities.part import Part
    from partflow.domain import ValidationError
    
    with pytest.raises(ValidationError, match="name"):
        Part(
            id=uuid4(),
            part_number="PN-12345",
            name="",
        )
```

Run: **FAILS** (no validation yet)

### 3.2 GREEN: Add Validation

Update `part.py`:

```python
"""Part entity for PartFlow."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID

from partflow.domain.errors import ValidationError


@dataclass
class Part:
    """A manufacturable part with unique identification."""
    
    id: UUID
    part_number: str
    name: str
    description: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        """Validate fields after initialization."""
        self._validate()
    
    def _validate(self):
        """Validate all fields."""
        if not self.name or not self.name.strip():
            raise ValidationError("name", "Name cannot be empty")
```

Run: **PASSES**

---

## Part 4: Status Field

### 4.1 RED: Add Status Test

```python
def test_part_has_default_draft_status(self):
    """New parts should default to draft status."""
    from partflow.domain.entities.part import Part, PartStatus
    
    part = Part(
        id=uuid4(),
        part_number="PN-12345",
        name="Test Part",
    )
    
    assert part.status == PartStatus.DRAFT
```

Run: **FAILS** (no PartStatus)

### 4.2 GREEN: Add PartStatus Enum

Update `part.py`:

```python
"""Part entity for PartFlow."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from partflow.domain.errors import ValidationError


class PartStatus(Enum):
    """Lifecycle status of a Part."""
    
    DRAFT = "draft"         # Not yet finalized
    ACTIVE = "active"       # In production use
    OBSOLETE = "obsolete"   # No longer used


@dataclass
class Part:
    """A manufacturable part with unique identification."""
    
    id: UUID
    part_number: str
    name: str
    description: Optional[str] = None
    status: PartStatus = PartStatus.DRAFT
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        """Validate fields after initialization."""
        self._validate()
    
    def _validate(self):
        """Validate all fields."""
        if not self.name or not self.name.strip():
            raise ValidationError("name", "Name cannot be empty")
```

Run: **PASSES**

---

## Part 5: Complete Test Suite

### 5.1 Full Test File

```python
"""Tests for Part entity."""

import pytest
from datetime import datetime
from uuid import uuid4

from partflow.domain.entities.part import Part, PartStatus
from partflow.domain import ValidationError


class TestPartCreation:
    """Tests for creating Part entities."""
    
    def test_create_part_with_required_fields(self):
        """Part should be creatable with required fields."""
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test Part",
        )
        
        assert part.name == "Test Part"
        assert part.part_number == "PN-12345"
    
    def test_create_part_with_all_fields(self):
        """Part should accept all optional fields."""
        part_id = uuid4()
        part = Part(
            id=part_id,
            part_number="PN-12345",
            name="Test Part",
            description="A detailed description",
            status=PartStatus.ACTIVE,
        )
        
        assert part.id == part_id
        assert part.description == "A detailed description"
        assert part.status == PartStatus.ACTIVE
    
    def test_part_has_default_draft_status(self):
        """New parts should default to draft status."""
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test Part",
        )
        
        assert part.status == PartStatus.DRAFT
    
    def test_part_has_created_at_timestamp(self):
        """Part should have creation timestamp."""
        before = datetime.utcnow()
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test Part",
        )
        after = datetime.utcnow()
        
        assert before <= part.created_at <= after


class TestPartValidation:
    """Tests for Part validation rules."""
    
    def test_empty_name_raises_validation_error(self):
        """Part cannot have empty name."""
        with pytest.raises(ValidationError, match="name"):
            Part(
                id=uuid4(),
                part_number="PN-12345",
                name="",
            )
    
    def test_whitespace_only_name_raises(self):
        """Name that is only whitespace should fail."""
        with pytest.raises(ValidationError, match="name"):
            Part(
                id=uuid4(),
                part_number="PN-12345",
                name="   ",
            )


class TestPartStatus:
    """Tests for PartStatus enum."""
    
    def test_status_values(self):
        """PartStatus should have expected values."""
        assert PartStatus.DRAFT.value == "draft"
        assert PartStatus.ACTIVE.value == "active"
        assert PartStatus.OBSOLETE.value == "obsolete"
```

### 5.2 Run All Tests

```bash
pytest tests/unit/domain/entities/test_part.py -v
```

All should pass.

---

## Part 6: Export Part

### 6.1 Update entities/__init__.py

```python
# src/partflow/domain/entities/__init__.py
"""Domain entities for PartFlow."""

from .part import Part, PartStatus

__all__ = ['Part', 'PartStatus']
```

### 6.2 Verify Import Works

```python
from partflow.domain.entities import Part, PartStatus
```

---

## Part 7: Exercises

### Exercise 1: Add Invalid Part Number Test

Write a test that verifies Part rejects obviously invalid part numbers (like empty string).

<details>
<summary>Solution</summary>

```python
def test_empty_part_number_raises(self):
    """Part number cannot be empty."""
    with pytest.raises(ValidationError, match="part_number"):
        Part(
            id=uuid4(),
            part_number="",
            name="Test Part",
        )
```

Then add validation:
```python
def _validate(self):
    if not self.name or not self.name.strip():
        raise ValidationError("name", "Name cannot be empty")
    if not self.part_number or not self.part_number.strip():
        raise ValidationError("part_number", "Part number cannot be empty")
```

</details>

---

### Exercise 2: TDD Status Transition

Using TDD, add a method to transition from DRAFT to ACTIVE.

<details>
<summary>Solution</summary>

**Test first:**
```python
def test_activate_transitions_draft_to_active(self):
    """Draft part can be activated."""
    part = Part(id=uuid4(), part_number="PN-12345", name="Test")
    
    part.activate()
    
    assert part.status == PartStatus.ACTIVE

def test_activate_from_obsolete_raises(self):
    """Obsolete parts cannot be activated."""
    part = Part(
        id=uuid4(), 
        part_number="PN-12345", 
        name="Test",
        status=PartStatus.OBSOLETE
    )
    
    with pytest.raises(InvalidStateTransitionError):
        part.activate()
```

**Then implement:**
```python
def activate(self):
    """Transition part to active status."""
    if self.status == PartStatus.OBSOLETE:
        raise InvalidStateTransitionError(
            self.status.value, 
            PartStatus.ACTIVE.value
        )
    self.status = PartStatus.ACTIVE
```

</details>

---

## Summary

### Key Takeaways

| Concept | What We Did |
|---------|-------------|
| **TDD** | Every line of Part code was preceded by a test |
| **RED** | Wrote test, saw it fail |
| **GREEN** | Wrote minimal code to pass |
| **Dataclass** | Used Python dataclass for entity |
| **Validation** | __post_init__ validates on creation |

### Part Entity Checklist

- [ ] Part class created with tests
- [ ] PartStatus enum created
- [ ] Validation for empty name
- [ ] All tests pass
- [ ] Exported from entities package

---

## Next Tutorial

[Tutorial 2: PartNumber Value Object →](./02-part-number.md)
