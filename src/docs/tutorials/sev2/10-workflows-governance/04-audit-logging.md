# Tutorial 4: Audit Logging

## Introduction

Manufacturing compliance requires **audit logs**—a tamper-resistant record of who did what and when.

---

## Part 1: Audit Requirements

### 1.1 What Must Be Logged

| Event Type | What to Log |
|------------|-------------|
| Create | User, entity type, entity ID, values |
| Update | User, entity, old values, new values |
| Delete | User, entity, deleted values |
| State change | User, from/to state, reason |
| Login/logout | User, time, success/failure |

### 1.2 Audit Log Fields

| Field | Purpose |
|-------|---------|
| id | Log entry ID |
| timestamp | When event occurred |
| user_id | Who did it |
| entity_type | What kind of thing |
| entity_id | Which specific thing |
| action | What was done |
| old_values | Before (for changes) |
| new_values | After (for changes) |
| ip_address | Where from (optional) |

---

## Part 2: AuditLog Entity

Create `src/partflow/domain/entities/audit_log.py`:

```python
"""AuditLog entity for compliance tracking."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from uuid import UUID


class AuditAction(Enum):
    """Types of auditable actions."""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    STATE_CHANGE = "state_change"
    LOGIN = "login"
    LOGOUT = "logout"
    ACCESS = "access"


@dataclass
class AuditLog:
    """An audit log entry.
    
    Audit logs are immutable and tamper-resistant.
    They record who did what, when, and what changed.
    """
    id: UUID
    timestamp: datetime
    user_id: str
    entity_type: str
    entity_id: str
    action: AuditAction
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @classmethod
    def create(
        cls,
        log_id: UUID,
        user_id: str,
        entity_type: str,
        entity_id: str,
        action: AuditAction,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> 'AuditLog':
        """Factory method to create audit log."""
        return cls(
            id=log_id,
            timestamp=datetime.utcnow(),
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            old_values=old_values,
            new_values=new_values,
            metadata=metadata,
        )
    
    @property
    def summary(self) -> str:
        """Human-readable summary of the action."""
        return f"{self.user_id} {self.action.value}d {self.entity_type} {self.entity_id}"
```

---

## Part 3: Audit Repository

Create `src/partflow/domain/interfaces/audit_repository.py`:

```python
"""Repository interface for AuditLog entities."""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.audit_log import AuditLog, AuditAction


class AuditRepositoryInterface(ABC):
    """Abstract interface for audit log persistence."""
    
    @abstractmethod
    def save(self, log: AuditLog) -> None:
        """Save an audit log entry."""
        pass
    
    @abstractmethod
    def find_by_entity(self, entity_type: str, entity_id: str) -> List[AuditLog]:
        """Find all logs for an entity."""
        pass
    
    @abstractmethod
    def find_by_user(self, user_id: str, limit: int = 100) -> List[AuditLog]:
        """Find logs by user."""
        pass
    
    @abstractmethod
    def find_by_date_range(
        self,
        start: datetime,
        end: datetime,
        entity_type: Optional[str] = None,
    ) -> List[AuditLog]:
        """Find logs within date range."""
        pass
```

Create `src/partflow/repository/sqlite/audit_repository.py`:

```python
"""SQLite implementation of AuditRepositoryInterface."""

import json
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.audit_log import AuditLog, AuditAction
from partflow.domain.interfaces.audit_repository import AuditRepositoryInterface
from partflow.repository.sqlite.database import Database


class SQLiteAuditRepository(AuditRepositoryInterface):
    """SQLite implementation of audit repository."""
    
    def __init__(self, db: Database):
        self._db = db
    
    def save(self, log: AuditLog) -> None:
        with self._db.connection() as conn:
            conn.execute(
                """
                INSERT INTO audit_logs 
                (id, timestamp, user_id, entity_type, entity_id, 
                 action, old_values, new_values, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    str(log.id),
                    log.timestamp.isoformat(),
                    log.user_id,
                    log.entity_type,
                    log.entity_id,
                    log.action.value,
                    json.dumps(log.old_values) if log.old_values else None,
                    json.dumps(log.new_values) if log.new_values else None,
                    json.dumps(log.metadata) if log.metadata else None,
                )
            )
            conn.commit()
    
    def find_by_entity(self, entity_type: str, entity_id: str) -> List[AuditLog]:
        with self._db.connection() as conn:
            rows = conn.execute(
                """
                SELECT * FROM audit_logs 
                WHERE entity_type = ? AND entity_id = ?
                ORDER BY timestamp DESC
                """,
                (entity_type, entity_id)
            ).fetchall()
            return [self._row_to_log(row) for row in rows]
    
    def find_by_user(self, user_id: str, limit: int = 100) -> List[AuditLog]:
        with self._db.connection() as conn:
            rows = conn.execute(
                """
                SELECT * FROM audit_logs 
                WHERE user_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (user_id, limit)
            ).fetchall()
            return [self._row_to_log(row) for row in rows]
    
    def find_by_date_range(
        self,
        start: datetime,
        end: datetime,
        entity_type: Optional[str] = None,
    ) -> List[AuditLog]:
        with self._db.connection() as conn:
            if entity_type:
                rows = conn.execute(
                    """
                    SELECT * FROM audit_logs 
                    WHERE timestamp >= ? AND timestamp <= ? AND entity_type = ?
                    ORDER BY timestamp DESC
                    """,
                    (start.isoformat(), end.isoformat(), entity_type)
                ).fetchall()
            else:
                rows = conn.execute(
                    """
                    SELECT * FROM audit_logs 
                    WHERE timestamp >= ? AND timestamp <= ?
                    ORDER BY timestamp DESC
                    """,
                    (start.isoformat(), end.isoformat())
                ).fetchall()
            return [self._row_to_log(row) for row in rows]
    
    def _row_to_log(self, row) -> AuditLog:
        return AuditLog(
            id=UUID(row['id']),
            timestamp=datetime.fromisoformat(row['timestamp']),
            user_id=row['user_id'],
            entity_type=row['entity_type'],
            entity_id=row['entity_id'],
            action=AuditAction(row['action']),
            old_values=json.loads(row['old_values']) if row['old_values'] else None,
            new_values=json.loads(row['new_values']) if row['new_values'] else None,
            metadata=json.loads(row['metadata']) if row['metadata'] else None,
        )
```

Add schema:

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp);
```

---

## Part 4: Audit Service

Create `src/partflow/service/audit_service.py`:

```python
"""Audit service for logging user actions."""

from typing import Any, Dict, Optional
from uuid import UUID, uuid4

from partflow.domain.entities.audit_log import AuditLog, AuditAction
from partflow.domain.interfaces.audit_repository import AuditRepositoryInterface


class AuditService:
    """Service for audit logging."""
    
    def __init__(self, audit_repo: AuditRepositoryInterface):
        self._audit_repo = audit_repo
    
    def log_create(
        self,
        user_id: str,
        entity_type: str,
        entity_id: str,
        values: Dict[str, Any],
    ) -> None:
        """Log entity creation."""
        log = AuditLog.create(
            log_id=uuid4(),
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=AuditAction.CREATE,
            new_values=values,
        )
        self._audit_repo.save(log)
    
    def log_update(
        self,
        user_id: str,
        entity_type: str,
        entity_id: str,
        old_values: Dict[str, Any],
        new_values: Dict[str, Any],
    ) -> None:
        """Log entity update."""
        log = AuditLog.create(
            log_id=uuid4(),
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=AuditAction.UPDATE,
            old_values=old_values,
            new_values=new_values,
        )
        self._audit_repo.save(log)
    
    def log_state_change(
        self,
        user_id: str,
        entity_type: str,
        entity_id: str,
        from_state: str,
        to_state: str,
        reason: Optional[str] = None,
    ) -> None:
        """Log state change."""
        log = AuditLog.create(
            log_id=uuid4(),
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=AuditAction.STATE_CHANGE,
            old_values={"state": from_state},
            new_values={"state": to_state, "reason": reason},
        )
        self._audit_repo.save(log)
```

---

## Summary

### Audit Trail Complete

| Event | Logged? |
|-------|---------|
| Part created | ✅ |
| Part updated | ✅ |
| State changed | ✅ |
| Approval/rejection | ✅ |

---

## Next Tutorial

[Tutorial 5: Workflow UI →](./05-workflow-ui.md)
