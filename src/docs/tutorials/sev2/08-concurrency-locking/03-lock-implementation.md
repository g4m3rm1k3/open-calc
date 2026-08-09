# Tutorial 3: Lock Implementation

## Introduction

This tutorial implements the PartLock entity and repository using TDD.

---

## Part 1: Lock Entity

### 1.1 TDD: First Tests

Create `tests/unit/domain/entities/test_part_lock.py`:

```python
"""Tests for PartLock entity."""

import pytest
from datetime import datetime, timedelta
from uuid import uuid4


class TestPartLockCreation:
    """Tests for creating PartLock entities."""
    
    def test_create_lock(self):
        """Can create a lock with required fields."""
        from partflow.domain.entities.part_lock import PartLock
        
        part_id = uuid4()
        lock = PartLock(
            part_id=part_id,
            user_id="user123",
        )
        
        assert lock.part_id == part_id
        assert lock.user_id == "user123"
        assert lock.locked_at is not None
        assert lock.expires_at is not None
    
    def test_default_expiration_2_hours(self):
        """Default expiration should be 2 hours."""
        from partflow.domain.entities.part_lock import PartLock
        
        before = datetime.utcnow()
        lock = PartLock(part_id=uuid4(), user_id="user123")
        
        expected_min = before + timedelta(hours=2)
        expected_max = datetime.utcnow() + timedelta(hours=2, seconds=1)
        
        assert expected_min <= lock.expires_at <= expected_max
    
    def test_custom_duration(self):
        """Can specify custom duration."""
        from partflow.domain.entities.part_lock import PartLock
        
        lock = PartLock(
            part_id=uuid4(),
            user_id="user123",
            duration_hours=4,
        )
        
        duration = lock.expires_at - lock.locked_at
        assert duration.total_seconds() == 4 * 3600


class TestPartLockExpiration:
    """Tests for lock expiration."""
    
    def test_not_expired_when_fresh(self):
        """Fresh lock should not be expired."""
        from partflow.domain.entities.part_lock import PartLock
        
        lock = PartLock(part_id=uuid4(), user_id="user123")
        
        assert lock.is_expired() is False
    
    def test_expired_after_time_passes(self):
        """Lock should be expired after expiration time."""
        from partflow.domain.entities.part_lock import PartLock
        
        lock = PartLock(
            part_id=uuid4(),
            user_id="user123",
            locked_at=datetime.utcnow() - timedelta(hours=3),
            duration_hours=2,
        )
        
        assert lock.is_expired() is True
    
    def test_time_remaining(self):
        """Should report time remaining."""
        from partflow.domain.entities.part_lock import PartLock
        
        lock = PartLock(
            part_id=uuid4(),
            user_id="user123",
            duration_hours=2,
        )
        
        remaining = lock.time_remaining()
        assert timedelta(hours=1, minutes=59) <= remaining <= timedelta(hours=2)


class TestPartLockExtend:
    """Tests for extending lock."""
    
    def test_extend_adds_time(self):
        """Extending should add more time."""
        from partflow.domain.entities.part_lock import PartLock
        
        lock = PartLock(
            part_id=uuid4(),
            user_id="user123",
            duration_hours=1,
        )
        
        original_expires = lock.expires_at
        lock.extend(hours=1)
        
        assert lock.expires_at == original_expires + timedelta(hours=1)
    
    def test_cannot_extend_expired(self):
        """Cannot extend an expired lock."""
        from partflow.domain.entities.part_lock import PartLock
        from partflow.domain.errors import LockExpiredError
        
        lock = PartLock(
            part_id=uuid4(),
            user_id="user123",
            locked_at=datetime.utcnow() - timedelta(hours=3),
            duration_hours=1,
        )
        
        with pytest.raises(LockExpiredError):
            lock.extend(hours=1)
```

### 1.2 Implement PartLock

Create `src/partflow/domain/entities/part_lock.py`:

```python
"""PartLock entity for concurrency control."""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from partflow.domain.errors import LockExpiredError


@dataclass
class PartLock:
    """A lock on a Part for exclusive editing.
    
    Implements check-in/check-out concurrency control.
    Locks have an owner and an expiration time.
    
    Attributes:
        part_id: The Part being locked
        user_id: Who owns the lock
        locked_at: When the lock was acquired
        expires_at: When the lock automatically expires
        reason: Optional reason for the lock
    """
    part_id: UUID
    user_id: str
    locked_at: datetime = field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    reason: Optional[str] = None
    
    def __post_init__(self):
        """Set expiration if not provided."""
        if self.expires_at is None:
            self.expires_at = self.locked_at + timedelta(hours=2)
    
    @classmethod
    def create(
        cls,
        part_id: UUID,
        user_id: str,
        duration_hours: int = 2,
        reason: Optional[str] = None,
    ) -> 'PartLock':
        """Factory method to create a lock with custom duration."""
        locked_at = datetime.utcnow()
        return cls(
            part_id=part_id,
            user_id=user_id,
            locked_at=locked_at,
            expires_at=locked_at + timedelta(hours=duration_hours),
            reason=reason,
        )
    
    def is_expired(self) -> bool:
        """Check if the lock has expired."""
        return datetime.utcnow() > self.expires_at
    
    def time_remaining(self) -> timedelta:
        """Get time remaining on the lock."""
        remaining = self.expires_at - datetime.utcnow()
        return max(remaining, timedelta(0))
    
    def extend(self, hours: int = 1) -> None:
        """Extend the lock expiration.
        
        Args:
            hours: Hours to add to expiration
        
        Raises:
            LockExpiredError: If lock is already expired
        """
        if self.is_expired():
            raise LockExpiredError(self.part_id)
        
        self.expires_at = self.expires_at + timedelta(hours=hours)
    
    def is_owned_by(self, user_id: str) -> bool:
        """Check if a user owns this lock."""
        return self.user_id == user_id
```

### 1.3 Add Error Type

Add to `src/partflow/domain/errors.py`:

```python
class LockExpiredError(PartFlowError):
    """Lock has expired."""
    
    def __init__(self, part_id: UUID):
        self.part_id = part_id
        super().__init__(f"Lock on Part {part_id} has expired")


class PartLockedError(PartFlowError):
    """Part is locked by another user."""
    
    def __init__(self, part_id: UUID, locked_by: str):
        self.part_id = part_id
        self.locked_by = locked_by
        super().__init__(f"Part {part_id} is locked by {locked_by}")
```

---

## Part 2: Lock Repository

### 2.1 Interface

Create `src/partflow/domain/interfaces/lock_repository.py`:

```python
"""Repository interface for PartLock entities."""

from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from partflow.domain.entities.part_lock import PartLock


class LockRepositoryInterface(ABC):
    """Abstract interface for lock persistence."""
    
    @abstractmethod
    def save(self, lock: PartLock) -> None:
        """Save or update a lock."""
        pass
    
    @abstractmethod
    def find_by_part(self, part_id: UUID) -> Optional[PartLock]:
        """Find lock for a part."""
        pass
    
    @abstractmethod
    def delete(self, part_id: UUID) -> bool:
        """Delete a lock."""
        pass
    
    @abstractmethod
    def delete_expired(self) -> int:
        """Delete all expired locks. Returns count deleted."""
        pass
```

### 2.2 SQLite Implementation

Add to database schema:

```sql
CREATE TABLE IF NOT EXISTS part_locks (
    part_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    locked_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    reason TEXT,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);
```

Create `src/partflow/repository/sqlite/lock_repository.py`:

```python
"""SQLite implementation of LockRepositoryInterface."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from partflow.domain.entities.part_lock import PartLock
from partflow.domain.interfaces.lock_repository import LockRepositoryInterface
from partflow.repository.sqlite.database import Database


class SQLiteLockRepository(LockRepositoryInterface):
    """SQLite implementation of lock repository."""
    
    def __init__(self, db: Database):
        self._db = db
    
    def save(self, lock: PartLock) -> None:
        with self._db.connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO part_locks 
                (part_id, user_id, locked_at, expires_at, reason)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    str(lock.part_id),
                    lock.user_id,
                    lock.locked_at.isoformat(),
                    lock.expires_at.isoformat(),
                    lock.reason,
                )
            )
            conn.commit()
    
    def find_by_part(self, part_id: UUID) -> Optional[PartLock]:
        with self._db.connection() as conn:
            row = conn.execute(
                "SELECT * FROM part_locks WHERE part_id = ?",
                (str(part_id),)
            ).fetchone()
            
            if row is None:
                return None
            
            return PartLock(
                part_id=UUID(row['part_id']),
                user_id=row['user_id'],
                locked_at=datetime.fromisoformat(row['locked_at']),
                expires_at=datetime.fromisoformat(row['expires_at']),
                reason=row['reason'],
            )
    
    def delete(self, part_id: UUID) -> bool:
        with self._db.connection() as conn:
            cursor = conn.execute(
                "DELETE FROM part_locks WHERE part_id = ?",
                (str(part_id),)
            )
            conn.commit()
            return cursor.rowcount > 0
    
    def delete_expired(self) -> int:
        with self._db.connection() as conn:
            cursor = conn.execute(
                "DELETE FROM part_locks WHERE expires_at < ?",
                (datetime.utcnow().isoformat(),)
            )
            conn.commit()
            return cursor.rowcount
```

---

## Summary

### Implemented

- [x] PartLock entity with expiration
- [x] Lock repository interface
- [x] SQLite lock repository
- [x] Error types for locking
- [x] All tests pass

---

## Next Tutorial

[Tutorial 4: Lock Service →](./04-lock-service.md)
