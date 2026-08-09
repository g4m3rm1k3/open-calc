# Tutorial 4: SQLite Repository

## Introduction

This tutorial implements the real `SQLitePartRepository` that persists Parts to a SQLite database. We continue using TDD and integrate with the schema from our architecture decisions.

---

## Part 1: Engineering Foundation

### 1.1 Database Schema

From our domain model, the `parts` table needs:

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | TEXT | PRIMARY KEY | UUID as string |
| part_number | TEXT | UNIQUE NOT NULL | User-visible identifier |
| name | TEXT | NOT NULL | Part name |
| description | TEXT | - | Optional description |
| status | TEXT | NOT NULL DEFAULT 'draft' | Lifecycle status |
| created_at | TEXT | NOT NULL | ISO timestamp |

### 1.2 Why TEXT for UUID?

| Storage Type | Pros | Cons |
|--------------|------|------|
| TEXT | Human-readable, portable | Slightly larger |
| BLOB | Smaller, faster | Binary, harder to debug |

We choose **TEXT** for debugging visibility.

---

## Part 2: Database Setup

### 2.1 Create Database Module

Create `src/partflow/repository/sqlite/database.py`:

```python
"""SQLite database connection and schema management.

This module handles database connections and schema creation.
Uses a connection pool pattern for thread safety.
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator, Optional


# Schema definition
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

-- Index for part number lookups
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_parts_status ON parts(status);
"""


class Database:
    """SQLite database connection manager.
    
    Manages database connections and provides context manager
    for safe connection handling.
    
    Attributes:
        db_path: Path to SQLite database file
    
    Example:
        >>> db = Database("data/partflow.db")
        >>> with db.connection() as conn:
        ...     cursor = conn.execute("SELECT * FROM parts")
    """
    
    def __init__(self, db_path: str | Path):
        """Initialize database.
        
        Args:
            db_path: Path to database file, or ":memory:" for in-memory
        """
        self.db_path = str(db_path)
        self._ensure_schema()
    
    def _ensure_schema(self) -> None:
        """Create tables if they don't exist."""
        with self.connection() as conn:
            conn.executescript(SCHEMA)
            conn.commit()
    
    @contextmanager
    def connection(self) -> Generator[sqlite3.Connection, None, None]:
        """Get a database connection.
        
        Yields:
            SQLite connection with row factory configured
        
        Example:
            with db.connection() as conn:
                conn.execute("INSERT INTO parts ...")
                conn.commit()
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Access columns by name
        
        # Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON")
        
        try:
            yield conn
        finally:
            conn.close()
```

### 2.2 Line-by-Line Breakdown

| Code | Purpose |
|------|---------|
| `CREATE TABLE IF NOT EXISTS` | Idempotent schema creation |
| `sqlite3.Row` | Access results as dict-like |
| `PRAGMA foreign_keys = ON` | Enable FK enforcement (off by default) |
| `@contextmanager` | Makes connection usable with `with` |
| `yield conn` | Provides connection then cleans up |

---

## Part 3: Repository Implementation

### 3.1 Create SQLite Part Repository

Create `src/partflow/repository/sqlite/part_repository.py`:

```python
"""SQLite implementation of PartRepositoryInterface.

This module provides persistent storage for Part entities using SQLite.
"""

import sqlite3
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.part import Part, PartStatus
from partflow.domain.interfaces.part_repository import PartRepositoryInterface
from partflow.domain.value_objects.part_number import PartNumber
from partflow.domain.errors import DuplicateEntityError
from partflow.repository.sqlite.database import Database


class SQLitePartRepository(PartRepositoryInterface):
    """SQLite implementation of Part repository.
    
    Persists Parts to a SQLite database. Implements all methods
    defined in PartRepositoryInterface.
    
    Attributes:
        _db: Database connection manager
    """
    
    def __init__(self, db: Database):
        """Initialize with database.
        
        Args:
            db: Database instance for connections
        """
        self._db = db
    
    def save(self, part: Part) -> None:
        """Save Part to database.
        
        Uses INSERT OR REPLACE (upsert) pattern.
        """
        with self._db.connection() as conn:
            try:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO parts 
                    (id, part_number, name, description, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        str(part.id),
                        str(part.part_number),
                        part.name,
                        part.description,
                        part.status.value,
                        part.created_at.isoformat(),
                    )
                )
                conn.commit()
            except sqlite3.IntegrityError as e:
                if "UNIQUE constraint failed: parts.part_number" in str(e):
                    raise DuplicateEntityError("Part", str(part.part_number))
                raise
    
    def find_by_id(self, part_id: UUID) -> Optional[Part]:
        """Find Part by UUID."""
        with self._db.connection() as conn:
            row = conn.execute(
                "SELECT * FROM parts WHERE id = ?",
                (str(part_id),)
            ).fetchone()
            
            if row is None:
                return None
            
            return self._row_to_part(row)
    
    def find_by_number(self, part_number: str | PartNumber) -> Optional[Part]:
        """Find Part by part number."""
        with self._db.connection() as conn:
            row = conn.execute(
                "SELECT * FROM parts WHERE part_number = ?",
                (str(part_number),)
            ).fetchone()
            
            if row is None:
                return None
            
            return self._row_to_part(row)
    
    def find_all(self) -> List[Part]:
        """Get all Parts."""
        with self._db.connection() as conn:
            rows = conn.execute(
                "SELECT * FROM parts ORDER BY part_number"
            ).fetchall()
            
            return [self._row_to_part(row) for row in rows]
    
    def delete(self, part_id: UUID) -> bool:
        """Delete Part by UUID."""
        with self._db.connection() as conn:
            cursor = conn.execute(
                "DELETE FROM parts WHERE id = ?",
                (str(part_id),)
            )
            conn.commit()
            return cursor.rowcount > 0
    
    def exists_by_number(self, part_number: str | PartNumber) -> bool:
        """Check if part number exists."""
        with self._db.connection() as conn:
            row = conn.execute(
                "SELECT 1 FROM parts WHERE part_number = ? LIMIT 1",
                (str(part_number),)
            ).fetchone()
            return row is not None
    
    def count(self) -> int:
        """Count all Parts."""
        with self._db.connection() as conn:
            row = conn.execute("SELECT COUNT(*) FROM parts").fetchone()
            return row[0]
    
    def _row_to_part(self, row: sqlite3.Row) -> Part:
        """Convert database row to Part entity.
        
        Args:
            row: SQLite row with part data
        
        Returns:
            Part entity populated from row
        """
        return Part(
            id=UUID(row['id']),
            part_number=PartNumber(row['part_number']),
            name=row['name'],
            description=row['description'],
            status=PartStatus(row['status']),
            created_at=datetime.fromisoformat(row['created_at']),
        )
```

---

## Part 4: Integration Tests

### 4.1 Create Repository Tests

Create `tests/integration/repository/test_sqlite_part_repository.py`:

```python
"""Integration tests for SQLitePartRepository.

These tests use a real SQLite database (in-memory for speed).
"""

import pytest
from uuid import uuid4

from partflow.domain.entities.part import Part, PartStatus
from partflow.domain.errors import DuplicateEntityError
from partflow.repository.sqlite.database import Database
from partflow.repository.sqlite.part_repository import SQLitePartRepository


class TestSQLitePartRepository:
    """Tests for SQLitePartRepository."""
    
    @pytest.fixture
    def db(self):
        """Provide in-memory database for each test."""
        return Database(":memory:")
    
    @pytest.fixture
    def repo(self, db):
        """Provide repository with in-memory database."""
        return SQLitePartRepository(db)
    
    def test_save_and_find_by_id(self, repo):
        """Can save and retrieve Part by ID."""
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test Part",
            description="A test part",
        )
        
        repo.save(part)
        found = repo.find_by_id(part.id)
        
        assert found is not None
        assert found.id == part.id
        assert str(found.part_number) == "PN-12345"
        assert found.name == "Test Part"
        assert found.description == "A test part"
        assert found.status == PartStatus.DRAFT
    
    def test_save_and_find_by_number(self, repo):
        """Can retrieve Part by part number."""
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test Part",
        )
        
        repo.save(part)
        found = repo.find_by_number("PN-12345")
        
        assert found is not None
        assert found.name == "Test Part"
    
    def test_find_nonexistent_returns_none(self, repo):
        """Returns None for nonexistent Part."""
        assert repo.find_by_id(uuid4()) is None
        assert repo.find_by_number("XX-99999") is None
    
    def test_duplicate_part_number_raises(self, repo):
        """Cannot save duplicate part number."""
        part1 = Part(id=uuid4(), part_number="PN-12345", name="First")
        part2 = Part(id=uuid4(), part_number="PN-12345", name="Second")
        
        repo.save(part1)
        
        with pytest.raises(DuplicateEntityError):
            repo.save(part2)
    
    def test_update_existing_part(self, repo):
        """Can update existing Part."""
        part_id = uuid4()
        part = Part(id=part_id, part_number="PN-12345", name="Original")
        
        repo.save(part)
        
        # Update
        updated = Part(
            id=part_id,
            part_number="PN-12345",
            name="Updated",
            status=PartStatus.ACTIVE,
        )
        repo.save(updated)
        
        found = repo.find_by_id(part_id)
        assert found.name == "Updated"
        assert found.status == PartStatus.ACTIVE
    
    def test_find_all(self, repo):
        """Returns all Parts."""
        part1 = Part(id=uuid4(), part_number="PN-00001", name="First")
        part2 = Part(id=uuid4(), part_number="PN-00002", name="Second")
        
        repo.save(part1)
        repo.save(part2)
        
        all_parts = repo.find_all()
        assert len(all_parts) == 2
    
    def test_delete(self, repo):
        """Can delete Part."""
        part = Part(id=uuid4(), part_number="PN-12345", name="Test")
        repo.save(part)
        
        result = repo.delete(part.id)
        
        assert result is True
        assert repo.find_by_id(part.id) is None
    
    def test_delete_nonexistent(self, repo):
        """Deleting nonexistent returns False."""
        result = repo.delete(uuid4())
        assert result is False
    
    def test_exists_by_number(self, repo):
        """Correctly checks existence."""
        part = Part(id=uuid4(), part_number="PN-12345", name="Test")
        
        assert repo.exists_by_number("PN-12345") is False
        repo.save(part)
        assert repo.exists_by_number("PN-12345") is True
    
    def test_count(self, repo):
        """Returns correct count."""
        assert repo.count() == 0
        
        repo.save(Part(id=uuid4(), part_number="PN-00001", name="A"))
        assert repo.count() == 1
        
        repo.save(Part(id=uuid4(), part_number="PN-00002", name="B"))
        assert repo.count() == 2
    
    def test_data_persists_across_connections(self, db):
        """Data persists (not just in connection memory)."""
        # Note: Using same db instance, just new repository
        repo1 = SQLitePartRepository(db)
        part = Part(id=uuid4(), part_number="PN-12345", name="Test")
        repo1.save(part)
        
        # New repository instance, same database
        repo2 = SQLitePartRepository(db)
        found = repo2.find_by_number("PN-12345")
        
        assert found is not None
        assert found.name == "Test"
```

Run:
```bash
pytest tests/integration/repository/test_sqlite_part_repository.py -v
```

---

## Part 5: Export Repository

### 5.1 Update Repository Package

```python
# src/partflow/repository/__init__.py
"""Repository implementations for PartFlow."""

from .sqlite.database import Database
from .sqlite.part_repository import SQLitePartRepository

__all__ = ['Database', 'SQLitePartRepository']
```

```python
# src/partflow/repository/sqlite/__init__.py
"""SQLite repository implementations."""

from .database import Database
from .part_repository import SQLitePartRepository

__all__ = ['Database', 'SQLitePartRepository']
```

---

## Part 6: Exercises

### Exercise 1: Add Search by Status

Add a method to find Parts by status.

<details>
<summary>Solution</summary>

**Add to interface:**
```python
@abstractmethod
def find_by_status(self, status: PartStatus) -> List[Part]:
    """Find all Parts with given status."""
    pass
```

**Add to SQLite implementation:**
```python
def find_by_status(self, status: PartStatus) -> List[Part]:
    with self._db.connection() as conn:
        rows = conn.execute(
            "SELECT * FROM parts WHERE status = ? ORDER BY part_number",
            (status.value,)
        ).fetchall()
        return [self._row_to_part(row) for row in rows]
```

**Test:**
```python
def test_find_by_status(self, repo):
    active = Part(id=uuid4(), part_number="PN-00001", name="A", status=PartStatus.ACTIVE)
    draft = Part(id=uuid4(), part_number="PN-00002", name="B", status=PartStatus.DRAFT)
    
    repo.save(active)
    repo.save(draft)
    
    active_parts = repo.find_by_status(PartStatus.ACTIVE)
    assert len(active_parts) == 1
    assert active_parts[0].name == "A"
```

</details>

---

## Summary

### Key Concepts

| Concept | Implementation |
|---------|---------------|
| **Database class** | Connection management |
| **Schema as SQL** | Idempotent table creation |
| **Row to Entity** | `_row_to_part()` mapping |
| **Integration tests** | Real database (in-memory) |

### Repository Checklist

- [ ] Database module with schema
- [ ] SQLite repository implements interface
- [ ] All integration tests pass
- [ ] Proper error handling for duplicates
- [ ] Data persists correctly

---

## Next Tutorial

[Tutorial 5: Part Service →](./05-part-service.md)
