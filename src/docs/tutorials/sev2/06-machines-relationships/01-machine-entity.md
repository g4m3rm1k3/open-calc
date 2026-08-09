# Tutorial 1: Machine Entity

## Introduction

The **Machine** entity represents a CNC machine that can run Parts. This tutorial implements Machine using the same TDD approach as Part.

> **Entities model real-world things with identity**

---

## Part 1: Engineering Foundation

### 1.1 What is a Machine?

From the domain model:

| Property | Type | Description |
|----------|------|-------------|
| id | UUID | Internal identifier |
| machine_id | string | User-visible identifier (e.g., "MCH-001") |
| name | string | Display name (e.g., "Haas VF-2") |
| controller_type | ControllerType | Fanuc, Haas, Siemens, etc. |
| axes | int | Number of axes (3, 4, 5) |
| max_spindle_speed | int | Max RPM |
| status | MachineStatus | active, maintenance, retired |
| created_at | timestamp | When added to system |

### 1.2 Machine Invariants

| Invariant | Why It Exists | Enforcement |
|-----------|---------------|-------------|
| machine_id unique | No duplicates | Database UNIQUE |
| machine_id immutable | References depend on it | Domain prevents change |
| name required | Display purposes | Validation |
| axes 3-5 | CNC machine reality | Validation |
| spindle_speed positive | Physical constraint | Validation |

### 1.3 Controller Types

```python
class ControllerType(Enum):
    FANUC = "fanuc"           # Fanuc controls (GE Fanuc)
    HAAS = "haas"             # Haas proprietary
    SIEMENS = "siemens"       # Siemens Sinumerik
    MAZAK = "mazak"           # Mazak Mazatrol
    OKUMA = "okuma"           # Okuma OSP
    MITSUBISHI = "mitsubishi" # Mitsubishi MELDAS
    OTHER = "other"           # Other/custom
```

---

## Part 2: TDD Implementation

### 2.1 RED: First Test

Create `tests/unit/domain/entities/test_machine.py`:

```python
"""Tests for Machine entity."""

import pytest
from uuid import uuid4


class TestMachineCreation:
    """Tests for creating Machine entities."""
    
    def test_create_machine_with_required_fields(self):
        """Machine should be creatable with required fields."""
        from partflow.domain.entities.machine import Machine, ControllerType
        
        machine = Machine(
            id=uuid4(),
            machine_id="MCH-001",
            name="Haas VF-2",
            controller_type=ControllerType.HAAS,
        )
        
        assert machine.name == "Haas VF-2"
        assert machine.machine_id == "MCH-001"
        assert machine.controller_type == ControllerType.HAAS
    
    def test_machine_has_default_values(self):
        """Machine should have sensible defaults."""
        from partflow.domain.entities.machine import Machine, ControllerType, MachineStatus
        
        machine = Machine(
            id=uuid4(),
            machine_id="MCH-001",
            name="Test Machine",
            controller_type=ControllerType.FANUC,
        )
        
        assert machine.axes == 3  # Default 3-axis
        assert machine.max_spindle_speed == 10000  # Default RPM
        assert machine.status == MachineStatus.ACTIVE
```

Run: **FAILS** (Machine doesn't exist)

### 2.2 GREEN: Create Machine Entity

Create `src/partflow/domain/entities/machine.py`:

```python
"""Machine entity for PartFlow.

A Machine represents a CNC machine capable of running Parts.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from partflow.domain.errors import ValidationError


class ControllerType(Enum):
    """CNC machine controller types.
    
    Different manufacturers use different control systems with
    their own G-code dialects and capabilities.
    """
    FANUC = "fanuc"
    HAAS = "haas"
    SIEMENS = "siemens"
    MAZAK = "mazak"
    OKUMA = "okuma"
    MITSUBISHI = "mitsubishi"
    OTHER = "other"


class MachineStatus(Enum):
    """Operational status of a Machine."""
    ACTIVE = "active"           # In production use
    MAINTENANCE = "maintenance"  # Undergoing maintenance
    RETIRED = "retired"         # No longer in use


@dataclass
class Machine:
    """A CNC machine in the manufacturing facility.
    
    Machines have identity (machine_id), can run Parts, and have
    specific capabilities (axes, spindle speed, controller type).
    
    Attributes:
        id: Internal UUID identifier
        machine_id: User-visible machine identifier
        name: Display name
        controller_type: Type of CNC controller
        axes: Number of axes (3, 4, or 5)
        max_spindle_speed: Maximum spindle RPM
        status: Operational status
        description: Optional description
        created_at: When added to system
    """
    id: UUID
    machine_id: str
    name: str
    controller_type: ControllerType
    axes: int = 3
    max_spindle_speed: int = 10000
    status: MachineStatus = MachineStatus.ACTIVE
    description: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        """Validate fields after initialization."""
        self._validate()
    
    def _validate(self):
        """Validate all fields meet domain rules."""
        # Required fields
        if not self.machine_id or not self.machine_id.strip():
            raise ValidationError("machine_id", "Machine ID cannot be empty")
        
        if not self.name or not self.name.strip():
            raise ValidationError("name", "Name cannot be empty")
        
        # Axes must be 3, 4, or 5
        if self.axes not in (3, 4, 5):
            raise ValidationError(
                "axes", 
                f"Axes must be 3, 4, or 5. Got: {self.axes}"
            )
        
        # Spindle speed must be positive
        if self.max_spindle_speed <= 0:
            raise ValidationError(
                "max_spindle_speed",
                "Max spindle speed must be positive"
            )
        
        # Reasonable spindle speed limit (30,000 RPM is typical max)
        if self.max_spindle_speed > 50000:
            raise ValidationError(
                "max_spindle_speed",
                f"Max spindle speed seems unreasonable: {self.max_spindle_speed}"
            )
```

Run: **PASSES**

### 2.3 Add Validation Tests

```python
class TestMachineValidation:
    """Tests for Machine validation rules."""
    
    def test_empty_machine_id_raises(self):
        """Machine ID cannot be empty."""
        from partflow.domain.entities.machine import Machine, ControllerType
        from partflow.domain.errors import ValidationError
        
        with pytest.raises(ValidationError, match="machine_id"):
            Machine(
                id=uuid4(),
                machine_id="",
                name="Test",
                controller_type=ControllerType.FANUC,
            )
    
    def test_empty_name_raises(self):
        """Name cannot be empty."""
        from partflow.domain.entities.machine import Machine, ControllerType
        from partflow.domain.errors import ValidationError
        
        with pytest.raises(ValidationError, match="name"):
            Machine(
                id=uuid4(),
                machine_id="MCH-001",
                name="",
                controller_type=ControllerType.FANUC,
            )
    
    def test_invalid_axes_raises(self):
        """Axes must be 3, 4, or 5."""
        from partflow.domain.entities.machine import Machine, ControllerType
        from partflow.domain.errors import ValidationError
        
        with pytest.raises(ValidationError, match="axes"):
            Machine(
                id=uuid4(),
                machine_id="MCH-001",
                name="Test",
                controller_type=ControllerType.FANUC,
                axes=7,
            )
    
    def test_negative_spindle_speed_raises(self):
        """Spindle speed must be positive."""
        from partflow.domain.entities.machine import Machine, ControllerType
        from partflow.domain.errors import ValidationError
        
        with pytest.raises(ValidationError, match="spindle"):
            Machine(
                id=uuid4(),
                machine_id="MCH-001",
                name="Test",
                controller_type=ControllerType.FANUC,
                max_spindle_speed=-1000,
            )
    
    def test_valid_axes_values(self):
        """3, 4, and 5 axis machines are valid."""
        from partflow.domain.entities.machine import Machine, ControllerType
        
        for axes in [3, 4, 5]:
            machine = Machine(
                id=uuid4(),
                machine_id=f"MCH-{axes}AX",
                name=f"{axes}-Axis Machine",
                controller_type=ControllerType.FANUC,
                axes=axes,
            )
            assert machine.axes == axes
```

---

## Part 3: Machine Status Transitions

### 3.1 Status State Machine

```
┌─────────────┐       ┌─────────────────┐
│   ACTIVE    │ ◀───▶ │   MAINTENANCE   │
└──────┬──────┘       └────────┬────────┘
       │                       │
       └───────┬───────────────┘
               ▼
       ┌─────────────┐
       │   RETIRED   │ (terminal state)
       └─────────────┘
```

### 3.2 Transition Tests

```python
class TestMachineStatusTransitions:
    """Tests for Machine status state machine."""
    
    def test_active_to_maintenance(self):
        """Active machine can go to maintenance."""
        from partflow.domain.entities.machine import Machine, ControllerType, MachineStatus
        
        machine = Machine(
            id=uuid4(),
            machine_id="MCH-001",
            name="Test",
            controller_type=ControllerType.FANUC,
            status=MachineStatus.ACTIVE,
        )
        
        machine.start_maintenance()
        assert machine.status == MachineStatus.MAINTENANCE
    
    def test_maintenance_to_active(self):
        """Maintenance machine can return to active."""
        from partflow.domain.entities.machine import Machine, ControllerType, MachineStatus
        
        machine = Machine(
            id=uuid4(),
            machine_id="MCH-001",
            name="Test",
            controller_type=ControllerType.FANUC,
            status=MachineStatus.MAINTENANCE,
        )
        
        machine.complete_maintenance()
        assert machine.status == MachineStatus.ACTIVE
    
    def test_retire_from_active(self):
        """Active machine can be retired."""
        from partflow.domain.entities.machine import Machine, ControllerType, MachineStatus
        
        machine = Machine(
            id=uuid4(),
            machine_id="MCH-001",
            name="Test",
            controller_type=ControllerType.FANUC,
        )
        
        machine.retire()
        assert machine.status == MachineStatus.RETIRED
    
    def test_cannot_unretire(self):
        """Retired machines cannot return to service."""
        from partflow.domain.entities.machine import Machine, ControllerType, MachineStatus
        from partflow.domain.errors import InvalidStateTransitionError
        
        machine = Machine(
            id=uuid4(),
            machine_id="MCH-001",
            name="Test",
            controller_type=ControllerType.FANUC,
            status=MachineStatus.RETIRED,
        )
        
        with pytest.raises(InvalidStateTransitionError):
            machine.start_maintenance()
```

### 3.3 Implement Transitions

Add to `machine.py`:

```python
def start_maintenance(self) -> None:
    """Put machine into maintenance mode."""
    if self.status == MachineStatus.RETIRED:
        from partflow.domain.errors import InvalidStateTransitionError
        raise InvalidStateTransitionError(
            self.status.value, 
            MachineStatus.MAINTENANCE.value
        )
    self.status = MachineStatus.MAINTENANCE

def complete_maintenance(self) -> None:
    """Return machine to active status after maintenance."""
    if self.status != MachineStatus.MAINTENANCE:
        from partflow.domain.errors import InvalidStateTransitionError
        raise InvalidStateTransitionError(
            self.status.value,
            MachineStatus.ACTIVE.value
        )
    self.status = MachineStatus.ACTIVE

def retire(self) -> None:
    """Permanently retire the machine."""
    self.status = MachineStatus.RETIRED
```

---

## Part 4: Add InvalidStateTransitionError

Update `src/partflow/domain/errors.py`:

```python
class InvalidStateTransitionError(PartFlowError):
    """Attempted invalid state transition."""
    
    def __init__(self, from_state: str, to_state: str):
        self.from_state = from_state
        self.to_state = to_state
        super().__init__(f"Cannot transition from {from_state} to {to_state}")
```

---

## Part 5: Export Machine

Update `src/partflow/domain/entities/__init__.py`:

```python
"""Domain entities for PartFlow."""

from .part import Part, PartStatus
from .machine import Machine, ControllerType, MachineStatus

__all__ = [
    'Part', 'PartStatus',
    'Machine', 'ControllerType', 'MachineStatus',
]
```

---

## Part 6: Exercises

### Exercise 1: Add Capability Check

Add a method to check if machine can run a specific operation type.

<details>
<summary>Solution</summary>

```python
def can_run_5_axis_operations(self) -> bool:
    """Check if machine supports 5-axis operations."""
    return self.axes >= 5

def can_run_high_speed(self, required_rpm: int) -> bool:
    """Check if machine supports required spindle speed."""
    return self.max_spindle_speed >= required_rpm
```

</details>

---

### Exercise 2: Machine ID Validation

Add format validation for machine_id (e.g., must start with "MCH-").

<details>
<summary>Solution</summary>

```python
import re

MACHINE_ID_PATTERN = re.compile(r'^MCH-\d{3}$')

def _validate(self):
    # ... existing validation ...
    
    if not self.MACHINE_ID_PATTERN.match(self.machine_id):
        raise ValidationError(
            "machine_id",
            f"Invalid format: '{self.machine_id}'. Expected: MCH-NNN"
        )
```

</details>

---

## Summary

### Key Concepts

| Concept | Implementation |
|---------|---------------|
| **Entity with identity** | UUID + machine_id |
| **Enum for types** | ControllerType, MachineStatus |
| **State machine** | Status transitions |
| **Domain validation** | In __post_init__ |

### Machine Checklist

- [ ] Machine entity created
- [ ] ControllerType enum defined
- [ ] MachineStatus enum defined
- [ ] Validation works
- [ ] Status transitions work
- [ ] All tests pass

---

## Next Tutorial

[Tutorial 2: Association Tables →](./02-association-tables.md)
