# Tutorial 4: Lock Service

## Introduction

The Lock Service orchestrates locking operations, including check-out, check-in, and expiration handling.

---

## Part 1: Lock Service Design

### 1.1 Service Responsibilities

| Method | Purpose |
|--------|---------|
| check_out | Acquire lock for user |
| check_in | Release lock |
| extend_lock | Add time to lock |
| force_unlock | Admin release any lock |
| get_lock_status | Check if locked |
| is_locked_by_other | Check if blocked |

### 1.2 Business Rules

| Rule | Implementation |
|------|---------------|
| One lock per Part | Check before creating |
| Only owner unlocks | Check user_id |
| Auto-expire on check | Clean stale locks |
| Admin can force | Role check (later) |

---

## Part 2: TDD Implementation

### 2.1 Tests

Create `tests/unit/service/test_lock_service.py`:

```python
"""Tests for LockService."""

import pytest
from datetime import datetime, timedelta
from uuid import uuid4
from unittest.mock import Mock

from partflow.domain.entities.part_lock import PartLock
from partflow.domain.errors import PartLockedError, NotFoundError, LockExpiredError


class TestLockServiceCheckOut:
    """Tests for checking out (acquiring lock)."""
    
    @pytest.fixture
    def mock_repos(self):
        return {
            'lock': Mock(),
            'part': Mock(),
        }
    
    @pytest.fixture
    def service(self, mock_repos):
        from partflow.service.lock_service import LockService
        return LockService(mock_repos['lock'], mock_repos['part'])
    
    def test_check_out_creates_lock(self, service, mock_repos):
        """Check out should create a lock."""
        part_id = uuid4()
        mock_repos['part'].find_by_id.return_value = Mock()  # Part exists
        mock_repos['lock'].find_by_part.return_value = None  # No lock
        
        lock = service.check_out(part_id, "user123")
        
        assert lock.part_id == part_id
        assert lock.user_id == "user123"
        mock_repos['lock'].save.assert_called_once()
    
    def test_check_out_fails_when_locked(self, service, mock_repos):
        """Cannot check out already locked Part."""
        part_id = uuid4()
        existing = PartLock(part_id=part_id, user_id="other_user")
        mock_repos['part'].find_by_id.return_value = Mock()
        mock_repos['lock'].find_by_part.return_value = existing
        
        with pytest.raises(PartLockedError):
            service.check_out(part_id, "user123")
    
    def test_can_reacquire_own_lock(self, service, mock_repos):
        """Owner can refresh their own lock."""
        part_id = uuid4()
        existing = PartLock(part_id=part_id, user_id="user123")
        mock_repos['part'].find_by_id.return_value = Mock()
        mock_repos['lock'].find_by_part.return_value = existing
        
        lock = service.check_out(part_id, "user123")
        
        assert lock.user_id == "user123"
    
    def test_expired_lock_can_be_acquired(self, service, mock_repos):
        """Expired lock allows new acquisition."""
        part_id = uuid4()
        expired = PartLock(
            part_id=part_id,
            user_id="old_user",
            locked_at=datetime.utcnow() - timedelta(hours=3),
            expires_at=datetime.utcnow() - timedelta(hours=1),
        )
        mock_repos['part'].find_by_id.return_value = Mock()
        mock_repos['lock'].find_by_part.return_value = expired
        
        lock = service.check_out(part_id, "new_user")
        
        assert lock.user_id == "new_user"


class TestLockServiceCheckIn:
    """Tests for checking in (releasing lock)."""
    
    @pytest.fixture
    def mock_repos(self):
        return {'lock': Mock(), 'part': Mock()}
    
    @pytest.fixture
    def service(self, mock_repos):
        from partflow.service.lock_service import LockService
        return LockService(mock_repos['lock'], mock_repos['part'])
    
    def test_check_in_releases_lock(self, service, mock_repos):
        """Check in should delete the lock."""
        part_id = uuid4()
        lock = PartLock(part_id=part_id, user_id="user123")
        mock_repos['lock'].find_by_part.return_value = lock
        mock_repos['lock'].delete.return_value = True
        
        result = service.check_in(part_id, "user123")
        
        assert result is True
        mock_repos['lock'].delete.assert_called_once_with(part_id)
    
    def test_only_owner_can_check_in(self, service, mock_repos):
        """Other users cannot release lock."""
        part_id = uuid4()
        lock = PartLock(part_id=part_id, user_id="owner")
        mock_repos['lock'].find_by_part.return_value = lock
        
        from partflow.domain.errors import NotAuthorizedError
        with pytest.raises(NotAuthorizedError):
            service.check_in(part_id, "not_owner")


class TestLockServiceStatus:
    """Tests for lock status checks."""
    
    @pytest.fixture
    def mock_repos(self):
        return {'lock': Mock(), 'part': Mock()}
    
    @pytest.fixture
    def service(self, mock_repos):
        from partflow.service.lock_service import LockService
        return LockService(mock_repos['lock'], mock_repos['part'])
    
    def test_get_lock_status_when_locked(self, service, mock_repos):
        """Returns lock info when locked."""
        part_id = uuid4()
        lock = PartLock(part_id=part_id, user_id="user123")
        mock_repos['lock'].find_by_part.return_value = lock
        
        status = service.get_lock_status(part_id)
        
        assert status['is_locked'] is True
        assert status['locked_by'] == "user123"
    
    def test_get_lock_status_when_unlocked(self, service, mock_repos):
        """Returns unlocked status when no lock."""
        part_id = uuid4()
        mock_repos['lock'].find_by_part.return_value = None
        
        status = service.get_lock_status(part_id)
        
        assert status['is_locked'] is False
```

### 2.2 Implementation

Create `src/partflow/service/lock_service.py`:

```python
"""Lock service for concurrency control."""

from datetime import timedelta
from typing import Dict, Any, Optional
from uuid import UUID

from partflow.domain.entities.part_lock import PartLock
from partflow.domain.interfaces.lock_repository import LockRepositoryInterface
from partflow.domain.interfaces.part_repository import PartRepositoryInterface
from partflow.domain.errors import (
    NotFoundError, 
    PartLockedError, 
    NotAuthorizedError,
)


class LockService:
    """Service for managing Part locks."""
    
    def __init__(
        self,
        lock_repo: LockRepositoryInterface,
        part_repo: PartRepositoryInterface,
    ):
        self._lock_repo = lock_repo
        self._part_repo = part_repo
    
    def check_out(
        self,
        part_id: UUID,
        user_id: str,
        duration_hours: int = 2,
        reason: Optional[str] = None,
    ) -> PartLock:
        """Acquire a lock on a Part.
        
        Args:
            part_id: Part to lock
            user_id: User acquiring lock
            duration_hours: Lock duration
            reason: Optional reason for lock
        
        Returns:
            The acquired lock
        
        Raises:
            NotFoundError: If Part doesn't exist
            PartLockedError: If Part is locked by another user
        """
        # Verify part exists
        if self._part_repo.find_by_id(part_id) is None:
            raise NotFoundError("Part", str(part_id))
        
        # Check existing lock
        existing = self._lock_repo.find_by_part(part_id)
        
        if existing:
            # Expired locks can be taken
            if existing.is_expired():
                self._lock_repo.delete(part_id)
            # Same user can refresh
            elif existing.user_id == user_id:
                # Update existing lock
                existing.extend(hours=duration_hours)
                self._lock_repo.save(existing)
                return existing
            else:
                # Locked by someone else
                raise PartLockedError(part_id, existing.user_id)
        
        # Create new lock
        lock = PartLock.create(
            part_id=part_id,
            user_id=user_id,
            duration_hours=duration_hours,
            reason=reason,
        )
        
        self._lock_repo.save(lock)
        return lock
    
    def check_in(self, part_id: UUID, user_id: str) -> bool:
        """Release a lock on a Part.
        
        Args:
            part_id: Part to unlock
            user_id: User releasing lock
        
        Returns:
            True if lock was released
        
        Raises:
            NotAuthorizedError: If user doesn't own lock
        """
        lock = self._lock_repo.find_by_part(part_id)
        
        if lock is None:
            return True  # Already unlocked
        
        if lock.user_id != user_id:
            raise NotAuthorizedError(
                f"Lock is owned by {lock.user_id}, not {user_id}"
            )
        
        return self._lock_repo.delete(part_id)
    
    def extend_lock(self, part_id: UUID, user_id: str, hours: int = 1) -> PartLock:
        """Extend an existing lock.
        
        Args:
            part_id: Part with lock
            user_id: Lock owner
            hours: Hours to extend
        
        Returns:
            Updated lock
        """
        lock = self._lock_repo.find_by_part(part_id)
        
        if lock is None:
            raise NotFoundError("Lock", str(part_id))
        
        if lock.user_id != user_id:
            raise NotAuthorizedError("Only lock owner can extend")
        
        lock.extend(hours=hours)
        self._lock_repo.save(lock)
        return lock
    
    def force_unlock(self, part_id: UUID, admin_id: str) -> bool:
        """Force release a lock (admin only).
        
        Args:
            part_id: Part to unlock
            admin_id: Admin performing action
        
        Returns:
            True if lock was released
        """
        # In real app, verify admin_id has admin role
        return self._lock_repo.delete(part_id)
    
    def get_lock_status(self, part_id: UUID) -> Dict[str, Any]:
        """Get lock status for a Part.
        
        Returns:
            Dict with is_locked, locked_by, expires_at, time_remaining
        """
        lock = self._lock_repo.find_by_part(part_id)
        
        if lock is None or lock.is_expired():
            if lock and lock.is_expired():
                self._lock_repo.delete(part_id)
            return {
                'is_locked': False,
                'locked_by': None,
                'expires_at': None,
                'time_remaining': None,
            }
        
        return {
            'is_locked': True,
            'locked_by': lock.user_id,
            'expires_at': lock.expires_at,
            'time_remaining': lock.time_remaining().total_seconds(),
        }
    
    def is_locked_by_other(self, part_id: UUID, user_id: str) -> bool:
        """Check if Part is locked by someone other than user."""
        status = self.get_lock_status(part_id)
        return status['is_locked'] and status['locked_by'] != user_id
    
    def cleanup_expired(self) -> int:
        """Remove all expired locks. Returns count removed."""
        return self._lock_repo.delete_expired()
```

### 2.3 Add NotAuthorizedError

Add to `src/partflow/domain/errors.py`:

```python
class NotAuthorizedError(PartFlowError):
    """User not authorized for this action."""
    
    def __init__(self, message: str):
        super().__init__(message)
```

---

## Summary

### Service Methods

| Method | When Used |
|--------|-----------|
| check_out | Starting to edit |
| check_in | Finished editing |
| extend_lock | Need more time |
| force_unlock | Admin override |
| get_lock_status | Display in UI |

---

## Next Tutorial

[Tutorial 5: Lock UI Indicators →](./05-lock-ui.md)
