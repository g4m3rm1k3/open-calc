# Tutorial 2: Association Tables

## Introduction

A **many-to-many relationship** between Parts and Machines requires an **association table**. This tutorial explains why and how to implement it.

> **The junction between entities often carries its own data.**

---

## Part 1: Understanding Relationships

### 1.1 The Domain Requirement

From the BRD:
- A Part can run on multiple Machines
- A Machine can run multiple Parts
- Each association has metadata (setup time, is_primary)

This is a **many-to-many** relationship.

### 1.2 Relationship Types

| Type | Example | Implementation |
|------|---------|----------------|
| One-to-One | Part → CurrentRevision | FK on either side |
| One-to-Many | Part → Revisions | FK on "many" side |
| **Many-to-Many** | Part ↔ Machine | **Association table** |

### 1.3 Why Association Tables?

Without association table:
```
Part                    Machine
├─ machine_1           ├─ part_1
├─ machine_2           ├─ part_2
├─ machine_3           ├─ part_3
```

**Problem**: Where does setup_time go? It's specific to the Part-Machine pair!

With association table:
```
Part        PartMachine             Machine
  │         ├─ part_id ─────────────│
  ├─────────┤ machine_id ───────────┤
            ├─ setup_time
            └─ is_primary
```

The association itself has attributes.

---

## Part 2: Domain Model

### 2.1 PartMachine Entity

```python
@dataclass
class PartMachine:
    """Association between Part and Machine.
    
    This is NOT just a join—it carries its own data:
    - setup_time: How long to set up this part on this machine
    - is_primary: Is this the preferred machine for this part?
    """
    part_id: UUID
    machine_id: UUID
    setup_time_minutes: int = 30
    is_primary: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
```

### 2.2 Identity

What makes two PartMachine records "the same"?

| Approach | Problem |
|----------|---------|
| Separate ID | Allows duplicate part_id + machine_id |
| **Composite key (part_id + machine_id)** | Natural, prevents duplicates |

We use composite key: `(part_id, machine_id)` is the identity.

---

## Part 3: TDD Implementation

### 3.1 RED: First Tests

Create `tests/unit/domain/entities/test_part_machine.py`:

```python
"""Tests for PartMachine association entity."""

import pytest
from uuid import uuid4


class TestPartMachineCreation:
    """Tests for creating PartMachine associations."""
    
    def test_create_association(self):
        """Can create basic association."""
        from partflow.domain.entities.part_machine import PartMachine
        
        part_id = uuid4()
        machine_id = uuid4()
        
        assoc = PartMachine(
            part_id=part_id,
            machine_id=machine_id,
        )
        
        assert assoc.part_id == part_id
        assert assoc.machine_id == machine_id
        assert assoc.setup_time_minutes == 30  # default
        assert assoc.is_primary is False  # default
    
    def test_create_with_metadata(self):
        """Can create with custom setup time and primary flag."""
        from partflow.domain.entities.part_machine import PartMachine
        
        assoc = PartMachine(
            part_id=uuid4(),
            machine_id=uuid4(),
            setup_time_minutes=45,
            is_primary=True,
        )
        
        assert assoc.setup_time_minutes == 45
        assert assoc.is_primary is True


class TestPartMachineValidation:
    """Tests for PartMachine validation."""
    
    def test_negative_setup_time_raises(self):
        """Setup time cannot be negative."""
        from partflow.domain.entities.part_machine import PartMachine
        from partflow.domain.errors import ValidationError
        
        with pytest.raises(ValidationError, match="setup_time"):
            PartMachine(
                part_id=uuid4(),
                machine_id=uuid4(),
                setup_time_minutes=-10,
            )
    
    def test_zero_setup_time_valid(self):
        """Zero setup time is valid (quick change)."""
        from partflow.domain.entities.part_machine import PartMachine
        
        assoc = PartMachine(
            part_id=uuid4(),
            machine_id=uuid4(),
            setup_time_minutes=0,
        )
        
        assert assoc.setup_time_minutes == 0


class TestPartMachineEquality:
    """Tests for PartMachine equality (composite key)."""
    
    def test_same_ids_equal(self):
        """Same part_id and machine_id are equal."""
        from partflow.domain.entities.part_machine import PartMachine
        
        part_id = uuid4()
        machine_id = uuid4()
        
        assoc1 = PartMachine(part_id=part_id, machine_id=machine_id)
        assoc2 = PartMachine(part_id=part_id, machine_id=machine_id)
        
        assert assoc1 == assoc2
    
    def test_different_part_not_equal(self):
        """Different part_id means not equal."""
        from partflow.domain.entities.part_machine import PartMachine
        
        machine_id = uuid4()
        
        assoc1 = PartMachine(part_id=uuid4(), machine_id=machine_id)
        assoc2 = PartMachine(part_id=uuid4(), machine_id=machine_id)
        
        assert assoc1 != assoc2
```

Run: **FAILS**

### 3.2 GREEN: Create PartMachine

Create `src/partflow/domain/entities/part_machine.py`:

```python
"""PartMachine association entity for PartFlow.

Represents the many-to-many relationship between Parts and Machines,
including metadata specific to the association.
"""

from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from partflow.domain.errors import ValidationError


@dataclass
class PartMachine:
    """Association between a Part and a Machine.
    
    This is an association entity—it represents the relationship itself
    and carries data specific to the relationship (not to Part or Machine).
    
    Identity is composite: (part_id, machine_id) together form the key.
    
    Attributes:
        part_id: UUID of the Part
        machine_id: UUID of the Machine
        setup_time_minutes: Time to set up this Part on this Machine
        is_primary: Whether this is the preferred Machine for this Part
        created_at: When association was created
    """
    part_id: UUID
    machine_id: UUID
    setup_time_minutes: int = 30
    is_primary: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        """Validate after initialization."""
        self._validate()
    
    def _validate(self):
        """Validate association data."""
        if self.setup_time_minutes < 0:
            raise ValidationError(
                "setup_time_minutes",
                "Setup time cannot be negative"
            )
    
    def __eq__(self, other: object) -> bool:
        """Equality based on composite key (part_id + machine_id)."""
        if not isinstance(other, PartMachine):
            return NotImplemented
        return (
            self.part_id == other.part_id 
            and self.machine_id == other.machine_id
        )
    
    def __hash__(self) -> int:
        """Hash based on composite key."""
        return hash((self.part_id, self.machine_id))
```

Run: **ALL PASS**

---

## Part 4: Database Schema

### 4.1 Association Table Schema

```sql
CREATE TABLE IF NOT EXISTS part_machines (
    part_id TEXT NOT NULL,
    machine_id TEXT NOT NULL,
    setup_time_minutes INTEGER NOT NULL DEFAULT 30,
    is_primary INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    
    -- Composite primary key
    PRIMARY KEY (part_id, machine_id),
    
    -- Foreign keys
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

-- Index for finding all machines for a part
CREATE INDEX IF NOT EXISTS idx_part_machines_part 
    ON part_machines(part_id);

-- Index for finding all parts for a machine
CREATE INDEX IF NOT EXISTS idx_part_machines_machine 
    ON part_machines(machine_id);
```

### 4.2 Why These Indexes?

| Query | Index Used |
|-------|------------|
| "What machines can run Part X?" | idx_part_machines_part |
| "What parts can Machine Y run?" | idx_part_machines_machine |
| "Is Part X associated with Machine Y?" | PRIMARY KEY |

### 4.3 Update Database Schema

Update `src/partflow/repository/sqlite/database.py`:

```python
SCHEMA = """
-- Parts table
CREATE TABLE IF NOT EXISTS parts (
    id TEXT PRIMARY KEY,
    part_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_status ON parts(status);

-- Machines table
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    machine_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    controller_type TEXT NOT NULL,
    axes INTEGER NOT NULL DEFAULT 3,
    max_spindle_speed INTEGER NOT NULL DEFAULT 10000,
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_machines_machine_id ON machines(machine_id);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);

-- Part-Machine associations
CREATE TABLE IF NOT EXISTS part_machines (
    part_id TEXT NOT NULL,
    machine_id TEXT NOT NULL,
    setup_time_minutes INTEGER NOT NULL DEFAULT 30,
    is_primary INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    PRIMARY KEY (part_id, machine_id),
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_part_machines_part ON part_machines(part_id);
CREATE INDEX IF NOT EXISTS idx_part_machines_machine ON part_machines(machine_id);
"""
```

---

## Part 5: Association Patterns

### 5.1 Common Operations

| Operation | SQL |
|-----------|-----|
| Add association | `INSERT INTO part_machines ...` |
| Remove association | `DELETE FROM part_machines WHERE ...` |
| Get machines for part | `SELECT * FROM machines JOIN part_machines ...` |
| Get parts for machine | `SELECT * FROM parts JOIN part_machines ...` |
| Check if associated | `SELECT 1 FROM part_machines WHERE ...` |

### 5.2 Cascading Deletes

```sql
FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
```

When a Part is deleted:
- All its associations are automatically deleted
- Machines are NOT deleted (only the relationship)

---

## Part 6: Exercises

### Exercise 1: Unique Primary Constraint

A Part should have at most ONE primary machine. How would you enforce this?

<details>
<summary>Solution</summary>

**Option 1: Database partial index (SQLite 3.8+)**
```sql
CREATE UNIQUE INDEX idx_part_machines_primary 
    ON part_machines(part_id) 
    WHERE is_primary = 1;
```

**Option 2: Application logic in service**
```python
def set_primary_machine(self, part_id: UUID, machine_id: UUID):
    # Clear existing primary
    self._repo.clear_primary_for_part(part_id)
    # Set new primary
    self._repo.update_association(part_id, machine_id, is_primary=True)
```

**Recommendation**: Use both—database for safety, application for clarity.

</details>

---

### Exercise 2: Query Optimization

Write a query to get all Parts with their primary Machine name in a single query.

<details>
<summary>Solution</summary>

```sql
SELECT 
    p.id,
    p.part_number,
    p.name AS part_name,
    m.name AS primary_machine_name
FROM parts p
LEFT JOIN part_machines pm 
    ON p.id = pm.part_id AND pm.is_primary = 1
LEFT JOIN machines m 
    ON pm.machine_id = m.id;
```

</details>

---

## Summary

### Key Concepts

| Concept | Implementation |
|---------|---------------|
| **Many-to-many** | Association table |
| **Composite key** | (part_id, machine_id) |
| **Association has data** | setup_time, is_primary |
| **Cascading deletes** | ON DELETE CASCADE |

### Association Checklist

- [ ] PartMachine entity created
- [ ] Composite key equality implemented
- [ ] Validation works
- [ ] Database schema updated
- [ ] Foreign keys defined
- [ ] Indexes created

---

## Next Tutorial

[Tutorial 3: Machine Repository →](./03-machine-repository.md)
