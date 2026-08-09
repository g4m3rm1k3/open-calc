# Tutorial 2: Entity Base Class

## Introduction

Both Part and Machine share patterns. This tutorial extracts a base class to reduce duplication.

---

## Part 1: Shared Patterns

### 1.1 What's Common

| Pattern | Part | Machine |
|---------|------|---------|
| UUID id | ✓ | ✓ |
| created_at | ✓ | ✓ |
| __post_init__ validation | ✓ | ✓ |
| Status enum | ✓ | ✓ |

### 1.2 What's Different

| Aspect | Part | Machine |
|--------|------|---------|
| User ID | part_number | machine_id |
| Status type | PartStatus | MachineStatus |
| Fields | name, description | name, controller, axes |

---

## Part 2: Base Entity Design

### 2.1 TDD First

Create `tests/unit/domain/entities/test_base_entity.py`:

```python
"""Tests for base entity functionality."""

import pytest
from uuid import uuid4
from datetime import datetime


class TestBaseEntityTimestamp:
    """Tests for entity timestamps."""
    
    def test_created_at_set_automatically(self):
        """Entities should get created_at on initialization."""
        from partflow.domain.entities.part import Part
        
        before = datetime.utcnow()
        part = Part(id=uuid4(), part_number="PN-12345", name="Test")
        after = datetime.utcnow()
        
        assert before <= part.created_at <= after
    
    def test_created_at_preserved_when_provided(self):
        """Provided created_at should be used."""
        from partflow.domain.entities.part import Part
        
        specific_time = datetime(2024, 1, 1, 12, 0, 0)
        part = Part(
            id=uuid4(), 
            part_number="PN-12345", 
            name="Test",
            created_at=specific_time,
        )
        
        assert part.created_at == specific_time
```

### 2.2 Create Base Entity

Create `src/partflow/domain/entities/base.py`:

```python
"""Base entity class for PartFlow domain entities.

Provides common functionality for all entities including
timestamp management and validation patterns.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class BaseEntity:
    """Base class for domain entities.
    
    Provides:
    - UUID identification
    - Creation timestamp
    - Validation hook
    
    Subclasses should:
    1. Define their own fields
    2. Override _validate() to add validation rules
    3. Call super().__post_init__() in their __post_init__
    """
    id: UUID
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        """Initialize and validate entity."""
        self._validate()
    
    def _validate(self):
        """Validate entity fields.
        
        Override in subclasses to add validation rules.
        """
        pass
```

### 2.3 Decision: NOT To Use Inheritance

After consideration, we decide **NOT** to use inheritance here:

| Approach | Pros | Cons |
|----------|------|------|
| **Inheritance** | Less duplication | Rigid, coupling |
| **Composition** | Flexible | More code |
| **Keep separate** | Simple, clear | Some duplication |

**Decision: Keep entities separate.**

Why?
1. Part and Machine are not the same kind of thing
2. Their validation rules are different
3. Python dataclass inheritance is tricky
4. The duplication is minimal and acceptable

### 2.4 Document the Decision

Create ADR:

```markdown
# ADR-008: Entity Design - No Base Class

## Status
Accepted

## Context
Part and Machine share some patterns (UUID, created_at).
Should we create a base class?

## Decision
No base class. Keep entities independent.

## Rationale
- Entities are fundamentally different domain concepts
- Shared fields (id, created_at) are minimal
- Python dataclass inheritance has edge cases
- Simpler to maintain independently
- Domain clarity over code reuse

## Consequences
- Some field duplication (acceptable)
- Each entity is fully self-contained
- Easier to understand individually
```

---

## Part 3: What We CAN Extract

### 3.1 Common Validation Helpers

Create `src/partflow/domain/validation.py`:

```python
"""Validation utilities for domain entities."""

from partflow.domain.errors import ValidationError


def require_not_empty(field_name: str, value: str) -> None:
    """Validate that a string field is not empty.
    
    Args:
        field_name: Name of the field (for error message)
        value: The value to validate
    
    Raises:
        ValidationError: If value is empty or whitespace only
    """
    if not value or not value.strip():
        raise ValidationError(field_name, f"{field_name} cannot be empty")


def require_positive(field_name: str, value: int) -> None:
    """Validate that a number is positive.
    
    Args:
        field_name: Name of the field
        value: The value to validate
    
    Raises:
        ValidationError: If value is not positive
    """
    if value <= 0:
        raise ValidationError(field_name, f"{field_name} must be positive")


def require_in_range(
    field_name: str, 
    value: int, 
    min_val: int, 
    max_val: int
) -> None:
    """Validate that a number is in range.
    
    Args:
        field_name: Name of the field
        value: The value to validate
        min_val: Minimum allowed value (inclusive)
        max_val: Maximum allowed value (inclusive)
    
    Raises:
        ValidationError: If value is out of range
    """
    if value < min_val or value > max_val:
        raise ValidationError(
            field_name, 
            f"{field_name} must be between {min_val} and {max_val}"
        )
```

### 3.2 Update Entities to Use Helpers

```python
# In part.py
from partflow.domain.validation import require_not_empty

def _validate(self):
    require_not_empty("name", self.name)
    require_not_empty("part_number", str(self.part_number))

# In machine.py
from partflow.domain.validation import require_not_empty, require_in_range

def _validate(self):
    require_not_empty("machine_id", self.machine_id)
    require_not_empty("name", self.name)
    require_in_range("axes", self.axes, 3, 5)
```

---

## Summary

### Key Decisions

| Topic | Decision |
|-------|----------|
| Entity base class | No - keep separate |
| Validation helpers | Yes - extract utilities |
| Common patterns | Document, don't force abstraction |

### Refactoring Principle

> **Prefer duplication over wrong abstraction.**

A little copy-paste is better than a forced inheritance hierarchy that doesn't match the domain.

---

## Next Tutorial

[Tutorial 3: Repository Patterns →](./03-repository-patterns.md)
