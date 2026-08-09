# Tutorial 2: PartNumber Value Object

## Introduction

A **value object** is an object defined entirely by its properties, with no distinct identity. Two PartNumbers with the same value are interchangeable.

This tutorial implements `PartNumber` using TDD, enforcing the format `XX-NNNNN` (2 uppercase letters, hyphen, 5 digits).

---

## Part 1: Engineering Foundation

### 1.1 Why a Value Object?

| Approach | Problem |
|----------|---------|
| Raw string | No validation, no type safety |
| Entity | Overkill—part numbers don't have lifecycle |
| **Value Object** | Validates on creation, immutable, type-safe |

### 1.2 Value Object Properties

| Property | Meaning |
|----------|---------|
| **Immutable** | Cannot change after creation |
| **Equality by value** | Two identical values are equal |
| **Self-validating** | Invalid values impossible |
| **No identity** | No ID field needed |

### 1.3 Format Definition

| Component | Rule | Example |
|-----------|------|---------|
| Prefix | 2 uppercase letters | PN, AB, ZZ |
| Separator | Hyphen | - |
| Number | 5 digits, zero-padded | 00001, 12345 |
| Complete | XX-NNNNN | PN-12345 |

---

## Part 2: TDD Implementation

### 2.1 RED: First Test - Valid Format

Create `tests/unit/domain/value_objects/test_part_number.py`:

```python
"""Tests for PartNumber value object."""

import pytest


class TestPartNumberCreation:
    """Tests for creating PartNumber instances."""
    
    def test_valid_part_number_creates_successfully(self):
        """Standard format should be accepted."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        pn = PartNumber("PN-12345")
        
        assert str(pn) == "PN-12345"
```

Run:
```bash
pytest tests/unit/domain/value_objects/test_part_number.py -v
```

**Result:** FAILS (module doesn't exist)

### 2.2 GREEN: Minimal Implementation

Create `src/partflow/domain/value_objects/part_number.py`:

```python
"""PartNumber value object for PartFlow.

A PartNumber is a validated, immutable identifier for Parts.
Format: XX-NNNNN (2 uppercase letters, hyphen, 5 digits)
"""


class PartNumber:
    """Validated part number with format XX-NNNNN.
    
    PartNumber is a value object—immutable and defined by its value.
    Two PartNumbers with the same string representation are equal.
    
    Attributes:
        _value: The validated part number string
    
    Example:
        >>> pn = PartNumber("PN-12345")
        >>> str(pn)
        'PN-12345'
    """
    
    def __init__(self, value: str):
        """Create a new PartNumber.
        
        Args:
            value: Part number string in format XX-NNNNN
        
        Raises:
            ValueError: If format is invalid
        """
        self._value = value
    
    def __str__(self) -> str:
        """Return string representation."""
        return self._value
```

Run test: **PASSES**

### 2.3 RED: Validation Tests

Add validation tests:

```python
class TestPartNumberValidation:
    """Tests for PartNumber validation rules."""
    
    def test_missing_hyphen_raises(self):
        """Part number without hyphen should fail."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        with pytest.raises(ValueError, match="Invalid part number"):
            PartNumber("PN12345")
    
    def test_lowercase_letters_raises(self):
        """Lowercase letters should fail."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        with pytest.raises(ValueError, match="Invalid part number"):
            PartNumber("pn-12345")
    
    def test_too_few_digits_raises(self):
        """Less than 5 digits should fail."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        with pytest.raises(ValueError, match="Invalid part number"):
            PartNumber("PN-1234")
    
    def test_too_many_digits_raises(self):
        """More than 5 digits should fail."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        with pytest.raises(ValueError, match="Invalid part number"):
            PartNumber("PN-123456")
    
    def test_empty_string_raises(self):
        """Empty string should fail."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        with pytest.raises(ValueError, match="Invalid part number"):
            PartNumber("")
    
    def test_only_numbers_raises(self):
        """Only numbers should fail."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        with pytest.raises(ValueError, match="Invalid part number"):
            PartNumber("12-34567")
```

Run: **ALL FAIL** (no validation yet)

### 2.4 GREEN: Add Validation

```python
"""PartNumber value object for PartFlow."""

import re


class PartNumber:
    """Validated part number with format XX-NNNNN."""
    
    # Regex pattern: 2 uppercase letters, hyphen, 5 digits
    PATTERN = re.compile(r'^[A-Z]{2}-\d{5}$')
    
    def __init__(self, value: str):
        """Create a new PartNumber.
        
        Args:
            value: Part number string in format XX-NNNNN
        
        Raises:
            ValueError: If format is invalid
        """
        if not self.PATTERN.match(value):
            raise ValueError(
                f"Invalid part number format: '{value}'. "
                f"Expected format: XX-NNNNN (e.g., PN-12345)"
            )
        self._value = value
    
    def __str__(self) -> str:
        """Return string representation."""
        return self._value
    
    @classmethod
    def is_valid(cls, value: str) -> bool:
        """Check if a string is a valid part number format.
        
        Args:
            value: String to check
        
        Returns:
            True if valid format, False otherwise
        """
        return bool(cls.PATTERN.match(value))
```

Run: **ALL PASS**

---

## Part 3: Equality and Hashing

### 3.1 RED: Equality Tests

Value objects must be equal when their values are equal:

```python
class TestPartNumberEquality:
    """Tests for PartNumber equality."""
    
    def test_equal_values_are_equal(self):
        """Same value should be equal."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        pn1 = PartNumber("PN-12345")
        pn2 = PartNumber("PN-12345")
        
        assert pn1 == pn2
    
    def test_different_values_not_equal(self):
        """Different values should not be equal."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        pn1 = PartNumber("PN-12345")
        pn2 = PartNumber("PN-99999")
        
        assert pn1 != pn2
    
    def test_can_use_as_dict_key(self):
        """Should be usable as dictionary key."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        pn = PartNumber("PN-12345")
        data = {pn: "some value"}
        
        # Look up with different instance, same value
        pn2 = PartNumber("PN-12345")
        assert data[pn2] == "some value"
    
    def test_can_use_in_set(self):
        """Should work in sets (detects duplicates)."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        pn1 = PartNumber("PN-12345")
        pn2 = PartNumber("PN-12345")
        pn3 = PartNumber("PN-99999")
        
        part_numbers = {pn1, pn2, pn3}
        
        assert len(part_numbers) == 2  # pn1 and pn2 are same
```

Run: **FAILS** (default equality is by identity)

### 3.2 GREEN: Add Equality Methods

```python
class PartNumber:
    """Validated part number with format XX-NNNNN."""
    
    PATTERN = re.compile(r'^[A-Z]{2}-\d{5}$')
    
    def __init__(self, value: str):
        if not self.PATTERN.match(value):
            raise ValueError(
                f"Invalid part number format: '{value}'. "
                f"Expected format: XX-NNNNN (e.g., PN-12345)"
            )
        self._value = value
    
    def __str__(self) -> str:
        return self._value
    
    def __repr__(self) -> str:
        """Return developer-friendly representation."""
        return f"PartNumber('{self._value}')"
    
    def __eq__(self, other: object) -> bool:
        """Check equality by value.
        
        Two PartNumbers are equal if they have the same string value.
        """
        if not isinstance(other, PartNumber):
            return NotImplemented
        return self._value == other._value
    
    def __hash__(self) -> int:
        """Return hash for use in sets and dicts.
        
        Must be defined when __eq__ is defined.
        """
        return hash(self._value)
    
    @classmethod
    def is_valid(cls, value: str) -> bool:
        return bool(cls.PATTERN.match(value))
```

Run: **ALL PASS**

---

## Part 4: Complete Implementation

### 4.1 Full PartNumber File

```python
"""PartNumber value object for PartFlow.

A PartNumber is a validated, immutable identifier for Parts.
Format: XX-NNNNN (2 uppercase letters, hyphen, 5 digits)

Examples:
    Valid: PN-12345, AB-00001, ZZ-99999
    Invalid: pn-12345, PN12345, PN-1234

This is a VALUE OBJECT. Two PartNumbers with the same value are equal.
PartNumbers are immutable—once created, they cannot change.
"""

import re
from typing import Final


class PartNumber:
    """Validated part number with format XX-NNNNN.
    
    PartNumber is a value object—immutable and equality is by value.
    Invalid formats raise ValueError on construction.
    
    Attributes:
        _value: The validated part number string (private)
    
    Class Attributes:
        PATTERN: Compiled regex for validation
    
    Example:
        >>> pn = PartNumber("PN-12345")
        >>> str(pn)
        'PN-12345'
        >>> pn == PartNumber("PN-12345")
        True
    """
    
    # Pattern: 2 uppercase letters, hyphen, 5 digits, nothing else
    PATTERN: Final = re.compile(r'^[A-Z]{2}-\d{5}$')
    
    __slots__ = ('_value',)  # Memory optimization, prevents adding attributes
    
    def __init__(self, value: str) -> None:
        """Create a new PartNumber.
        
        Args:
            value: Part number string in format XX-NNNNN
        
        Raises:
            ValueError: If format is invalid
        
        Example:
            >>> pn = PartNumber("PN-12345")  # Valid
            >>> pn = PartNumber("invalid")   # Raises ValueError
        """
        if not isinstance(value, str):
            raise TypeError(f"Part number must be string, got {type(value).__name__}")
        
        if not self.PATTERN.match(value):
            raise ValueError(
                f"Invalid part number format: '{value}'. "
                f"Expected format: XX-NNNNN (2 uppercase letters, hyphen, 5 digits). "
                f"Examples: PN-12345, AB-00001"
            )
        
        # Store as private, immutable
        object.__setattr__(self, '_value', value)
    
    def __setattr__(self, name: str, value: object) -> None:
        """Prevent modification of attributes (immutability)."""
        raise AttributeError("PartNumber is immutable")
    
    def __str__(self) -> str:
        """Return the part number string.
        
        Returns:
            The part number in XX-NNNNN format
        """
        return self._value
    
    def __repr__(self) -> str:
        """Return developer-friendly representation.
        
        Returns:
            String like PartNumber('PN-12345')
        """
        return f"PartNumber('{self._value}')"
    
    def __eq__(self, other: object) -> bool:
        """Check equality by value.
        
        Two PartNumbers are equal if they have the same string value.
        Comparison with non-PartNumber returns NotImplemented.
        
        Args:
            other: Object to compare with
        
        Returns:
            True if equal value, False otherwise
        """
        if not isinstance(other, PartNumber):
            return NotImplemented
        return self._value == other._value
    
    def __hash__(self) -> int:
        """Return hash for use in sets and dicts.
        
        Returns:
            Integer hash of the part number value
        """
        return hash(self._value)
    
    @property
    def prefix(self) -> str:
        """Extract the 2-letter prefix.
        
        Returns:
            The first two letters (e.g., 'PN' from 'PN-12345')
        """
        return self._value[:2]
    
    @property
    def number(self) -> int:
        """Extract the numeric portion.
        
        Returns:
            The 5-digit number as integer (e.g., 12345 from 'PN-12345')
        """
        return int(self._value[3:])
    
    @classmethod
    def is_valid(cls, value: str) -> bool:
        """Check if a string is a valid part number format.
        
        Args:
            value: String to check
        
        Returns:
            True if valid format, False otherwise
        
        Example:
            >>> PartNumber.is_valid("PN-12345")
            True
            >>> PartNumber.is_valid("invalid")
            False
        """
        if not isinstance(value, str):
            return False
        return bool(cls.PATTERN.match(value))
```

### 4.2 Line-by-Line Breakdown

| Line | Purpose |
|------|---------|
| `PATTERN = re.compile(...)` | Precompile regex for performance |
| `^[A-Z]{2}` | Start with exactly 2 uppercase letters |
| `-` | Literal hyphen |
| `\d{5}$` | End with exactly 5 digits |
| `__slots__` | Memory optimization, prevent new attributes |
| `object.__setattr__` | Bypass our blocked `__setattr__` for initial assignment |
| `__setattr__` raises | Enforce immutability |
| `__eq__` returns `NotImplemented` | Proper handling for non-PartNumber comparison |
| `__hash__` | Required when `__eq__` defined, enables set/dict usage |

---

## Part 5: Update Part Entity

### 5.1 Use PartNumber in Part

Update `src/partflow/domain/entities/part.py`:

```python
"""Part entity for PartFlow."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, Union
from uuid import UUID

from partflow.domain.errors import ValidationError
from partflow.domain.value_objects.part_number import PartNumber


class PartStatus(Enum):
    """Lifecycle status of a Part."""
    DRAFT = "draft"
    ACTIVE = "active"
    OBSOLETE = "obsolete"


@dataclass
class Part:
    """A manufacturable part with unique identification."""
    
    id: UUID
    part_number: PartNumber  # Now typed as PartNumber
    name: str
    description: Optional[str] = None
    status: PartStatus = PartStatus.DRAFT
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        """Validate and convert fields after initialization."""
        # Convert string to PartNumber if needed
        if isinstance(self.part_number, str):
            object.__setattr__(self, 'part_number', PartNumber(self.part_number))
        
        self._validate()
    
    def _validate(self):
        """Validate all fields."""
        if not self.name or not self.name.strip():
            raise ValidationError("name", "Name cannot be empty")
```

### 5.2 Update Tests

```python
def test_part_accepts_string_part_number(self):
    """Part should accept string and convert to PartNumber."""
    part = Part(
        id=uuid4(),
        part_number="PN-12345",  # String
        name="Test Part",
    )
    
    assert isinstance(part.part_number, PartNumber)
    assert str(part.part_number) == "PN-12345"

def test_part_accepts_part_number_object(self):
    """Part should accept PartNumber directly."""
    pn = PartNumber("PN-12345")
    part = Part(
        id=uuid4(),
        part_number=pn,
        name="Test Part",
    )
    
    assert part.part_number == pn
```

---

## Part 6: Exercises

### Exercise 1: Add Prefix Property Test

Write a test for the `prefix` property, then verify it works.

<details>
<summary>Solution</summary>

```python
def test_prefix_extracts_first_two_letters(self):
    """prefix property should return letter portion."""
    pn = PartNumber("AB-12345")
    assert pn.prefix == "AB"
```

</details>

---

### Exercise 2: Add Number Property Test

Write a test for the `number` property.

<details>
<summary>Solution</summary>

```python
def test_number_extracts_numeric_portion(self):
    """number property should return integer."""
    pn = PartNumber("PN-00042")
    assert pn.number == 42  # Leading zeros stripped
```

</details>

---

## Summary

### Key Concepts

| Concept | Implementation |
|---------|---------------|
| **Value Object** | Immutable, equality by value |
| **Validation** | Regex pattern in `__init__` |
| **Immutability** | `__slots__` + blocked `__setattr__` |
| **Equality** | `__eq__` + `__hash__` |

### Value Object Checklist

- [ ] Validates on creation
- [ ] Immutable (cannot change)
- [ ] Equality by value
- [ ] Hashable (can use in sets/dicts)
- [ ] Good error messages

---

## Next Tutorial

[Tutorial 3: Repository Interface →](./03-repository-interface.md)
