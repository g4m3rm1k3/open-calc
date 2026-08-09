# Tutorial 3: Machine Repository

## Introduction

This tutorial implements repositories for Machine and PartMachine, following the same patterns as PartRepository.

---

## Part 1: Machine Repository Interface

Create `src/partflow/domain/interfaces/machine_repository.py`:

```python
"""Repository interface for Machine entities."""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.machine import Machine, MachineStatus


class MachineRepositoryInterface(ABC):
    """Abstract interface for Machine persistence operations."""
    
    @abstractmethod
    def save(self, machine: Machine) -> None:
        """Save a Machine to the repository."""
        pass
    
    @abstractmethod
    def find_by_id(self, machine_uuid: UUID) -> Optional[Machine]:
        """Find Machine by internal UUID."""
        pass
    
    @abstractmethod
    def find_by_machine_id(self, machine_id: str) -> Optional[Machine]:
        """Find Machine by user-visible machine_id."""
        pass
    
    @abstractmethod
    def find_all(self) -> List[Machine]:
        """Get all Machines."""
        pass
    
    @abstractmethod
    def find_by_status(self, status: MachineStatus) -> List[Machine]:
        """Get all Machines with given status."""
        pass
    
    @abstractmethod
    def delete(self, machine_uuid: UUID) -> bool:
        """Delete Machine by UUID."""
        pass
    
    @abstractmethod
    def exists_by_machine_id(self, machine_id: str) -> bool:
        """Check if machine_id exists."""
        pass
    
    @abstractmethod
    def count(self) -> int:
        """Count total Machines."""
        pass
```

---

## Part 2: SQLite Machine Repository

Create `src/partflow/repository/sqlite/machine_repository.py`:

```python
"""SQLite implementation of MachineRepositoryInterface."""

import sqlite3
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.machine import Machine, ControllerType, MachineStatus
from partflow.domain.interfaces.machine_repository import MachineRepositoryInterface
from partflow.domain.errors import DuplicateEntityError
from partflow.repository.sqlite.database import Database


class SQLiteMachineRepository(MachineRepositoryInterface):
    """SQLite implementation of Machine repository."""
    
    def __init__(self, db: Database):
        self._db = db
    
    def save(self, machine: Machine) -> None:
        """Save Machine (insert or update)."""
        with self._db.connection() as conn:
            try:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO machines 
                    (id, machine_id, name, controller_type, axes, 
                     max_spindle_speed, status, description, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        str(machine.id),
                        machine.machine_id,
                        machine.name,
                        machine.controller_type.value,
                        machine.axes,
                        machine.max_spindle_speed,
                        machine.status.value,
                        machine.description,
                        machine.created_at.isoformat(),
                    )
                )
                conn.commit()
            except sqlite3.IntegrityError as e:
                if "UNIQUE constraint failed: machines.machine_id" in str(e):
                    raise DuplicateEntityError("Machine", machine.machine_id)
                raise
    
    def find_by_id(self, machine_uuid: UUID) -> Optional[Machine]:
        """Find Machine by UUID."""
        with self._db.connection() as conn:
            row = conn.execute(
                "SELECT * FROM machines WHERE id = ?",
                (str(machine_uuid),)
            ).fetchone()
            
            if row is None:
                return None
            return self._row_to_machine(row)
    
    def find_by_machine_id(self, machine_id: str) -> Optional[Machine]:
        """Find Machine by machine_id."""
        with self._db.connection() as conn:
            row = conn.execute(
                "SELECT * FROM machines WHERE machine_id = ?",
                (machine_id,)
            ).fetchone()
            
            if row is None:
                return None
            return self._row_to_machine(row)
    
    def find_all(self) -> List[Machine]:
        """Get all Machines."""
        with self._db.connection() as conn:
            rows = conn.execute(
                "SELECT * FROM machines ORDER BY machine_id"
            ).fetchall()
            return [self._row_to_machine(row) for row in rows]
    
    def find_by_status(self, status: MachineStatus) -> List[Machine]:
        """Get Machines by status."""
        with self._db.connection() as conn:
            rows = conn.execute(
                "SELECT * FROM machines WHERE status = ? ORDER BY machine_id",
                (status.value,)
            ).fetchall()
            return [self._row_to_machine(row) for row in rows]
    
    def delete(self, machine_uuid: UUID) -> bool:
        """Delete Machine by UUID."""
        with self._db.connection() as conn:
            cursor = conn.execute(
                "DELETE FROM machines WHERE id = ?",
                (str(machine_uuid),)
            )
            conn.commit()
            return cursor.rowcount > 0
    
    def exists_by_machine_id(self, machine_id: str) -> bool:
        """Check if machine_id exists."""
        with self._db.connection() as conn:
            row = conn.execute(
                "SELECT 1 FROM machines WHERE machine_id = ? LIMIT 1",
                (machine_id,)
            ).fetchone()
            return row is not None
    
    def count(self) -> int:
        """Count Machines."""
        with self._db.connection() as conn:
            row = conn.execute("SELECT COUNT(*) FROM machines").fetchone()
            return row[0]
    
    def _row_to_machine(self, row: sqlite3.Row) -> Machine:
        """Convert database row to Machine entity."""
        return Machine(
            id=UUID(row['id']),
            machine_id=row['machine_id'],
            name=row['name'],
            controller_type=ControllerType(row['controller_type']),
            axes=row['axes'],
            max_spindle_speed=row['max_spindle_speed'],
            status=MachineStatus(row['status']),
            description=row['description'],
            created_at=datetime.fromisoformat(row['created_at']),
        )
```

---

## Part 3: PartMachine Repository

Create `src/partflow/domain/interfaces/part_machine_repository.py`:

```python
"""Repository interface for Part-Machine associations."""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.part_machine import PartMachine


class PartMachineRepositoryInterface(ABC):
    """Abstract interface for Part-Machine association operations."""
    
    @abstractmethod
    def save(self, association: PartMachine) -> None:
        """Save an association."""
        pass
    
    @abstractmethod
    def find(self, part_id: UUID, machine_id: UUID) -> Optional[PartMachine]:
        """Find specific association."""
        pass
    
    @abstractmethod
    def find_by_part(self, part_id: UUID) -> List[PartMachine]:
        """Find all associations for a Part."""
        pass
    
    @abstractmethod
    def find_by_machine(self, machine_id: UUID) -> List[PartMachine]:
        """Find all associations for a Machine."""
        pass
    
    @abstractmethod
    def delete(self, part_id: UUID, machine_id: UUID) -> bool:
        """Delete an association."""
        pass
    
    @abstractmethod
    def delete_by_part(self, part_id: UUID) -> int:
        """Delete all associations for a Part. Returns count deleted."""
        pass
    
    @abstractmethod
    def set_primary(self, part_id: UUID, machine_id: UUID) -> None:
        """Set a machine as primary for a part, clearing others."""
        pass
```

Create `src/partflow/repository/sqlite/part_machine_repository.py`:

```python
"""SQLite implementation of PartMachineRepositoryInterface."""

import sqlite3
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.part_machine import PartMachine
from partflow.domain.interfaces.part_machine_repository import PartMachineRepositoryInterface
from partflow.repository.sqlite.database import Database


class SQLitePartMachineRepository(PartMachineRepositoryInterface):
    """SQLite implementation of Part-Machine association repository."""
    
    def __init__(self, db: Database):
        self._db = db
    
    def save(self, association: PartMachine) -> None:
        """Save association (insert or update)."""
        with self._db.connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO part_machines 
                (part_id, machine_id, setup_time_minutes, is_primary, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    str(association.part_id),
                    str(association.machine_id),
                    association.setup_time_minutes,
                    1 if association.is_primary else 0,
                    association.created_at.isoformat(),
                )
            )
            conn.commit()
    
    def find(self, part_id: UUID, machine_id: UUID) -> Optional[PartMachine]:
        """Find specific association."""
        with self._db.connection() as conn:
            row = conn.execute(
                """
                SELECT * FROM part_machines 
                WHERE part_id = ? AND machine_id = ?
                """,
                (str(part_id), str(machine_id))
            ).fetchone()
            
            if row is None:
                return None
            return self._row_to_association(row)
    
    def find_by_part(self, part_id: UUID) -> List[PartMachine]:
        """Find all associations for a Part."""
        with self._db.connection() as conn:
            rows = conn.execute(
                "SELECT * FROM part_machines WHERE part_id = ?",
                (str(part_id),)
            ).fetchall()
            return [self._row_to_association(row) for row in rows]
    
    def find_by_machine(self, machine_id: UUID) -> List[PartMachine]:
        """Find all associations for a Machine."""
        with self._db.connection() as conn:
            rows = conn.execute(
                "SELECT * FROM part_machines WHERE machine_id = ?",
                (str(machine_id),)
            ).fetchall()
            return [self._row_to_association(row) for row in rows]
    
    def delete(self, part_id: UUID, machine_id: UUID) -> bool:
        """Delete specific association."""
        with self._db.connection() as conn:
            cursor = conn.execute(
                """
                DELETE FROM part_machines 
                WHERE part_id = ? AND machine_id = ?
                """,
                (str(part_id), str(machine_id))
            )
            conn.commit()
            return cursor.rowcount > 0
    
    def delete_by_part(self, part_id: UUID) -> int:
        """Delete all associations for a Part."""
        with self._db.connection() as conn:
            cursor = conn.execute(
                "DELETE FROM part_machines WHERE part_id = ?",
                (str(part_id),)
            )
            conn.commit()
            return cursor.rowcount
    
    def set_primary(self, part_id: UUID, machine_id: UUID) -> None:
        """Set machine as primary, clearing others."""
        with self._db.connection() as conn:
            # Clear existing primary for this part
            conn.execute(
                """
                UPDATE part_machines 
                SET is_primary = 0 
                WHERE part_id = ?
                """,
                (str(part_id),)
            )
            # Set new primary
            conn.execute(
                """
                UPDATE part_machines 
                SET is_primary = 1 
                WHERE part_id = ? AND machine_id = ?
                """,
                (str(part_id), str(machine_id))
            )
            conn.commit()
    
    def _row_to_association(self, row: sqlite3.Row) -> PartMachine:
        """Convert row to PartMachine."""
        return PartMachine(
            part_id=UUID(row['part_id']),
            machine_id=UUID(row['machine_id']),
            setup_time_minutes=row['setup_time_minutes'],
            is_primary=bool(row['is_primary']),
            created_at=datetime.fromisoformat(row['created_at']),
        )
```

---

## Part 4: Integration Tests

Create `tests/integration/repository/test_machine_repository.py`:

```python
"""Integration tests for Machine repositories."""

import pytest
from uuid import uuid4

from partflow.domain.entities.machine import Machine, ControllerType, MachineStatus
from partflow.domain.entities.part import Part
from partflow.domain.entities.part_machine import PartMachine
from partflow.repository.sqlite.database import Database
from partflow.repository.sqlite.machine_repository import SQLiteMachineRepository
from partflow.repository.sqlite.part_repository import SQLitePartRepository
from partflow.repository.sqlite.part_machine_repository import SQLitePartMachineRepository


class TestSQLiteMachineRepository:
    """Tests for SQLiteMachineRepository."""
    
    @pytest.fixture
    def db(self):
        return Database(":memory:")
    
    @pytest.fixture
    def repo(self, db):
        return SQLiteMachineRepository(db)
    
    def test_save_and_find_by_id(self, repo):
        machine = Machine(
            id=uuid4(),
            machine_id="MCH-001",
            name="Haas VF-2",
            controller_type=ControllerType.HAAS,
        )
        
        repo.save(machine)
        found = repo.find_by_id(machine.id)
        
        assert found is not None
        assert found.machine_id == "MCH-001"
        assert found.name == "Haas VF-2"
    
    def test_find_by_machine_id(self, repo):
        machine = Machine(
            id=uuid4(),
            machine_id="MCH-001",
            name="Test Machine",
            controller_type=ControllerType.FANUC,
        )
        
        repo.save(machine)
        found = repo.find_by_machine_id("MCH-001")
        
        assert found is not None
        assert found.name == "Test Machine"
    
    def test_find_by_status(self, repo):
        active = Machine(
            id=uuid4(), machine_id="MCH-001", name="Active",
            controller_type=ControllerType.FANUC, status=MachineStatus.ACTIVE
        )
        maintenance = Machine(
            id=uuid4(), machine_id="MCH-002", name="Maintenance",
            controller_type=ControllerType.FANUC, status=MachineStatus.MAINTENANCE
        )
        
        repo.save(active)
        repo.save(maintenance)
        
        active_machines = repo.find_by_status(MachineStatus.ACTIVE)
        assert len(active_machines) == 1
        assert active_machines[0].name == "Active"


class TestSQLitePartMachineRepository:
    """Tests for Part-Machine associations."""
    
    @pytest.fixture
    def db(self):
        return Database(":memory:")
    
    @pytest.fixture
    def repos(self, db):
        return {
            'part': SQLitePartRepository(db),
            'machine': SQLiteMachineRepository(db),
            'assoc': SQLitePartMachineRepository(db),
        }
    
    def test_create_association(self, repos):
        # Create part and machine
        part = Part(id=uuid4(), part_number="PN-12345", name="Test Part")
        machine = Machine(
            id=uuid4(), machine_id="MCH-001", name="Test Machine",
            controller_type=ControllerType.FANUC
        )
        
        repos['part'].save(part)
        repos['machine'].save(machine)
        
        # Create association
        assoc = PartMachine(
            part_id=part.id,
            machine_id=machine.id,
            setup_time_minutes=45,
        )
        repos['assoc'].save(assoc)
        
        # Verify
        found = repos['assoc'].find(part.id, machine.id)
        assert found is not None
        assert found.setup_time_minutes == 45
    
    def test_find_by_part(self, repos):
        part = Part(id=uuid4(), part_number="PN-12345", name="Part")
        machine1 = Machine(id=uuid4(), machine_id="MCH-001", name="M1", controller_type=ControllerType.FANUC)
        machine2 = Machine(id=uuid4(), machine_id="MCH-002", name="M2", controller_type=ControllerType.FANUC)
        
        repos['part'].save(part)
        repos['machine'].save(machine1)
        repos['machine'].save(machine2)
        
        repos['assoc'].save(PartMachine(part_id=part.id, machine_id=machine1.id))
        repos['assoc'].save(PartMachine(part_id=part.id, machine_id=machine2.id))
        
        associations = repos['assoc'].find_by_part(part.id)
        assert len(associations) == 2
    
    def test_set_primary(self, repos):
        part = Part(id=uuid4(), part_number="PN-12345", name="Part")
        machine1 = Machine(id=uuid4(), machine_id="MCH-001", name="M1", controller_type=ControllerType.FANUC)
        machine2 = Machine(id=uuid4(), machine_id="MCH-002", name="M2", controller_type=ControllerType.FANUC)
        
        repos['part'].save(part)
        repos['machine'].save(machine1)
        repos['machine'].save(machine2)
        
        repos['assoc'].save(PartMachine(part_id=part.id, machine_id=machine1.id, is_primary=True))
        repos['assoc'].save(PartMachine(part_id=part.id, machine_id=machine2.id))
        
        # Set machine2 as primary
        repos['assoc'].set_primary(part.id, machine2.id)
        
        # Verify
        assoc1 = repos['assoc'].find(part.id, machine1.id)
        assoc2 = repos['assoc'].find(part.id, machine2.id)
        
        assert assoc1.is_primary is False
        assert assoc2.is_primary is True
```

---

## Summary

### Key Patterns

| Pattern | Usage |
|---------|-------|
| **Repository per entity** | Machine, PartMachine separate |
| **Composite key** | PartMachine identity |
| **Set primary** | Clear-and-set pattern |

---

## Next Tutorial

[Tutorial 4: Part-Machine Service →](./04-part-machine-service.md)
