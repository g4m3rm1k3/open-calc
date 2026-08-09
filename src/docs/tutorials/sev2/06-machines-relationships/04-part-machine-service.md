# Tutorial 4: Part-Machine Service

## Introduction

The **MachineService** and association management orchestrate Machine operations and Part-Machine relationships.

---

## Part 1: Machine Service

Create `src/partflow/service/machine_service.py`:

```python
"""Machine service for orchestrating Machine operations."""

from typing import List, Optional
from uuid import UUID, uuid4

from partflow.domain.entities.machine import Machine, ControllerType, MachineStatus
from partflow.domain.entities.part_machine import PartMachine
from partflow.domain.interfaces.machine_repository import MachineRepositoryInterface
from partflow.domain.interfaces.part_machine_repository import PartMachineRepositoryInterface
from partflow.domain.errors import DuplicateEntityError, NotFoundError


class MachineService:
    """Service for Machine operations."""
    
    def __init__(
        self, 
        machine_repo: MachineRepositoryInterface,
        part_machine_repo: PartMachineRepositoryInterface,
    ):
        self._machine_repo = machine_repo
        self._part_machine_repo = part_machine_repo
    
    def create_machine(
        self,
        machine_id: str,
        name: str,
        controller_type: ControllerType,
        axes: int = 3,
        max_spindle_speed: int = 10000,
        description: Optional[str] = None,
    ) -> Machine:
        """Create a new Machine."""
        if self._machine_repo.exists_by_machine_id(machine_id):
            raise DuplicateEntityError("Machine", machine_id)
        
        machine = Machine(
            id=uuid4(),
            machine_id=machine_id,
            name=name,
            controller_type=controller_type,
            axes=axes,
            max_spindle_speed=max_spindle_speed,
            description=description,
        )
        
        self._machine_repo.save(machine)
        return machine
    
    def get_machine(self, machine_uuid: UUID) -> Machine:
        """Get Machine by UUID."""
        machine = self._machine_repo.find_by_id(machine_uuid)
        if machine is None:
            raise NotFoundError("Machine", str(machine_uuid))
        return machine
    
    def get_machine_by_id(self, machine_id: str) -> Machine:
        """Get Machine by machine_id."""
        machine = self._machine_repo.find_by_machine_id(machine_id)
        if machine is None:
            raise NotFoundError("Machine", machine_id)
        return machine
    
    def get_all_machines(self) -> List[Machine]:
        """Get all Machines."""
        return self._machine_repo.find_all()
    
    def get_active_machines(self) -> List[Machine]:
        """Get all active Machines."""
        return self._machine_repo.find_by_status(MachineStatus.ACTIVE)
    
    def update_machine(
        self,
        machine_uuid: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Machine:
        """Update Machine details."""
        machine = self._machine_repo.find_by_id(machine_uuid)
        if machine is None:
            raise NotFoundError("Machine", str(machine_uuid))
        
        if name is not None:
            machine.name = name
        if description is not None:
            machine.description = description
        
        self._machine_repo.save(machine)
        return machine
    
    def start_maintenance(self, machine_uuid: UUID) -> Machine:
        """Put Machine into maintenance mode."""
        machine = self._machine_repo.find_by_id(machine_uuid)
        if machine is None:
            raise NotFoundError("Machine", str(machine_uuid))
        
        machine.start_maintenance()
        self._machine_repo.save(machine)
        return machine
    
    def complete_maintenance(self, machine_uuid: UUID) -> Machine:
        """Return Machine to active status."""
        machine = self._machine_repo.find_by_id(machine_uuid)
        if machine is None:
            raise NotFoundError("Machine", str(machine_uuid))
        
        machine.complete_maintenance()
        self._machine_repo.save(machine)
        return machine
    
    def retire_machine(self, machine_uuid: UUID) -> Machine:
        """Retire a Machine."""
        machine = self._machine_repo.find_by_id(machine_uuid)
        if machine is None:
            raise NotFoundError("Machine", str(machine_uuid))
        
        machine.retire()
        self._machine_repo.save(machine)
        return machine
    
    # Part-Machine Association Methods
    
    def assign_part_to_machine(
        self,
        part_id: UUID,
        machine_id: UUID,
        setup_time_minutes: int = 30,
        is_primary: bool = False,
    ) -> PartMachine:
        """Associate a Part with a Machine."""
        # Verify machine exists
        if self._machine_repo.find_by_id(machine_id) is None:
            raise NotFoundError("Machine", str(machine_id))
        
        association = PartMachine(
            part_id=part_id,
            machine_id=machine_id,
            setup_time_minutes=setup_time_minutes,
            is_primary=is_primary,
        )
        
        self._part_machine_repo.save(association)
        
        # If this is primary, clear others
        if is_primary:
            self._part_machine_repo.set_primary(part_id, machine_id)
        
        return association
    
    def get_machines_for_part(self, part_id: UUID) -> List[PartMachine]:
        """Get all machine associations for a Part."""
        return self._part_machine_repo.find_by_part(part_id)
    
    def get_parts_for_machine(self, machine_id: UUID) -> List[PartMachine]:
        """Get all part associations for a Machine."""
        return self._part_machine_repo.find_by_machine(machine_id)
    
    def remove_part_from_machine(self, part_id: UUID, machine_id: UUID) -> bool:
        """Remove association between Part and Machine."""
        return self._part_machine_repo.delete(part_id, machine_id)
    
    def set_primary_machine(self, part_id: UUID, machine_id: UUID) -> None:
        """Set a machine as the primary for a part."""
        # Verify association exists
        assoc = self._part_machine_repo.find(part_id, machine_id)
        if assoc is None:
            raise NotFoundError("PartMachine", f"{part_id}/{machine_id}")
        
        self._part_machine_repo.set_primary(part_id, machine_id)
```

---

## Part 2: Service Tests

Create `tests/unit/service/test_machine_service.py`:

```python
"""Tests for MachineService."""

import pytest
from uuid import uuid4
from unittest.mock import Mock

from partflow.domain.entities.machine import Machine, ControllerType, MachineStatus
from partflow.domain.entities.part_machine import PartMachine
from partflow.domain.errors import DuplicateEntityError, NotFoundError


class TestMachineServiceCreate:
    """Tests for creating Machines."""
    
    @pytest.fixture
    def mock_repos(self):
        return {
            'machine': Mock(),
            'part_machine': Mock(),
        }
    
    @pytest.fixture
    def service(self, mock_repos):
        from partflow.service.machine_service import MachineService
        return MachineService(
            mock_repos['machine'],
            mock_repos['part_machine'],
        )
    
    def test_create_machine(self, service, mock_repos):
        mock_repos['machine'].exists_by_machine_id.return_value = False
        
        machine = service.create_machine(
            machine_id="MCH-001",
            name="Haas VF-2",
            controller_type=ControllerType.HAAS,
        )
        
        assert machine.machine_id == "MCH-001"
        assert machine.name == "Haas VF-2"
        mock_repos['machine'].save.assert_called_once()
    
    def test_create_duplicate_raises(self, service, mock_repos):
        mock_repos['machine'].exists_by_machine_id.return_value = True
        
        with pytest.raises(DuplicateEntityError):
            service.create_machine(
                machine_id="MCH-001",
                name="Test",
                controller_type=ControllerType.FANUC,
            )


class TestMachineServiceAssociations:
    """Tests for Part-Machine associations."""
    
    @pytest.fixture
    def mock_repos(self):
        return {
            'machine': Mock(),
            'part_machine': Mock(),
        }
    
    @pytest.fixture
    def service(self, mock_repos):
        from partflow.service.machine_service import MachineService
        return MachineService(
            mock_repos['machine'],
            mock_repos['part_machine'],
        )
    
    def test_assign_part_to_machine(self, service, mock_repos):
        machine = Machine(
            id=uuid4(), machine_id="MCH-001", 
            name="Test", controller_type=ControllerType.FANUC
        )
        mock_repos['machine'].find_by_id.return_value = machine
        
        part_id = uuid4()
        assoc = service.assign_part_to_machine(
            part_id=part_id,
            machine_id=machine.id,
            setup_time_minutes=45,
        )
        
        assert assoc.part_id == part_id
        assert assoc.machine_id == machine.id
        mock_repos['part_machine'].save.assert_called_once()
    
    def test_assign_to_nonexistent_machine_raises(self, service, mock_repos):
        mock_repos['machine'].find_by_id.return_value = None
        
        with pytest.raises(NotFoundError):
            service.assign_part_to_machine(
                part_id=uuid4(),
                machine_id=uuid4(),
            )
```

---

## Part 3: Export in Service Package

Update `src/partflow/service/__init__.py`:

```python
"""Service layer for PartFlow."""

from .part_service import PartService
from .machine_service import MachineService

__all__ = ['PartService', 'MachineService']
```

---

## Summary

### Service Responsibilities

| Method | Responsibility |
|--------|---------------|
| `create_machine` | Validate + persist |
| `assign_part_to_machine` | Create association |
| `set_primary_machine` | Clear others + set |
| `start_maintenance` | State transition |

---

## Next Tutorial

[Tutorial 5: Machine Web Layer →](./05-machine-web.md)
