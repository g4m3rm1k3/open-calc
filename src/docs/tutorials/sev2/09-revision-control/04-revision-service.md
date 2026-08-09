# Tutorial 4: Revision Service

## Introduction

The Revision Service orchestrates version control operations—creating revisions, retrieving history, and comparing versions.

---

## Part 1: Service Design

### 1.1 Service Responsibilities

| Method | Purpose |
|--------|---------|
| create_revision | Save new version of Part |
| get_revision | Get specific revision |
| get_history | Get all revisions for Part |
| get_latest | Get most recent revision |
| compare | Diff two revisions |
| restore | Create new revision from old snapshot |

### 1.2 Integration with Part Updates

When a Part is updated:
1. Capture snapshot of new state
2. Determine if major or minor change
3. Create revision with reason
4. Save revision

---

## Part 2: Repository Interface

Create `src/partflow/domain/interfaces/revision_repository.py`:

```python
"""Repository interface for Revision entities."""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.revision import Revision


class RevisionRepositoryInterface(ABC):
    """Abstract interface for Revision persistence."""
    
    @abstractmethod
    def save(self, revision: Revision) -> None:
        """Save a revision."""
        pass
    
    @abstractmethod
    def find_by_id(self, revision_id: UUID) -> Optional[Revision]:
        """Find revision by ID."""
        pass
    
    @abstractmethod
    def find_by_part(self, part_id: UUID) -> List[Revision]:
        """Get all revisions for a Part, ordered by version."""
        pass
    
    @abstractmethod
    def find_latest(self, part_id: UUID) -> Optional[Revision]:
        """Get most recent revision for a Part."""
        pass
    
    @abstractmethod
    def find_by_version(
        self, 
        part_id: UUID, 
        major: int, 
        minor: int
    ) -> Optional[Revision]:
        """Find specific version."""
        pass
    
    @abstractmethod
    def count_by_part(self, part_id: UUID) -> int:
        """Count revisions for a Part."""
        pass
```

---

## Part 3: SQLite Implementation

Create `src/partflow/repository/sqlite/revision_repository.py`:

```python
"""SQLite implementation of RevisionRepositoryInterface."""

import json
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from partflow.domain.entities.revision import Revision
from partflow.domain.interfaces.revision_repository import RevisionRepositoryInterface
from partflow.repository.sqlite.database import Database


class SQLiteRevisionRepository(RevisionRepositoryInterface):
    """SQLite implementation of revision repository."""
    
    def __init__(self, db: Database):
        self._db = db
    
    def save(self, revision: Revision) -> None:
        with self._db.connection() as conn:
            conn.execute(
                """
                INSERT INTO revisions 
                (id, part_id, major, minor, snapshot, 
                 changed_by, changed_at, change_reason, external_revision)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    str(revision.id),
                    str(revision.part_id),
                    revision.major,
                    revision.minor,
                    json.dumps(revision.snapshot),
                    revision.changed_by,
                    revision.changed_at.isoformat(),
                    revision.change_reason,
                    revision.external_revision,
                )
            )
            conn.commit()
    
    def find_by_id(self, revision_id: UUID) -> Optional[Revision]:
        with self._db.connection() as conn:
            row = conn.execute(
                "SELECT * FROM revisions WHERE id = ?",
                (str(revision_id),)
            ).fetchone()
            
            if row is None:
                return None
            return self._row_to_revision(row)
    
    def find_by_part(self, part_id: UUID) -> List[Revision]:
        with self._db.connection() as conn:
            rows = conn.execute(
                """
                SELECT * FROM revisions 
                WHERE part_id = ? 
                ORDER BY major DESC, minor DESC
                """,
                (str(part_id),)
            ).fetchall()
            return [self._row_to_revision(row) for row in rows]
    
    def find_latest(self, part_id: UUID) -> Optional[Revision]:
        with self._db.connection() as conn:
            row = conn.execute(
                """
                SELECT * FROM revisions 
                WHERE part_id = ? 
                ORDER BY major DESC, minor DESC 
                LIMIT 1
                """,
                (str(part_id),)
            ).fetchone()
            
            if row is None:
                return None
            return self._row_to_revision(row)
    
    def find_by_version(
        self, 
        part_id: UUID, 
        major: int, 
        minor: int
    ) -> Optional[Revision]:
        with self._db.connection() as conn:
            row = conn.execute(
                """
                SELECT * FROM revisions 
                WHERE part_id = ? AND major = ? AND minor = ?
                """,
                (str(part_id), major, minor)
            ).fetchone()
            
            if row is None:
                return None
            return self._row_to_revision(row)
    
    def count_by_part(self, part_id: UUID) -> int:
        with self._db.connection() as conn:
            row = conn.execute(
                "SELECT COUNT(*) FROM revisions WHERE part_id = ?",
                (str(part_id),)
            ).fetchone()
            return row[0]
    
    def _row_to_revision(self, row) -> Revision:
        return Revision(
            id=UUID(row['id']),
            part_id=UUID(row['part_id']),
            major=row['major'],
            minor=row['minor'],
            snapshot=json.loads(row['snapshot']),
            changed_by=row['changed_by'],
            changed_at=datetime.fromisoformat(row['changed_at']),
            change_reason=row['change_reason'],
            external_revision=row['external_revision'],
        )
```

Add to schema:

```sql
CREATE TABLE IF NOT EXISTS revisions (
    id TEXT PRIMARY KEY,
    part_id TEXT NOT NULL,
    major INTEGER NOT NULL,
    minor INTEGER NOT NULL,
    snapshot TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    changed_at TEXT NOT NULL,
    change_reason TEXT NOT NULL,
    external_revision TEXT,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    UNIQUE(part_id, major, minor)
);

CREATE INDEX IF NOT EXISTS idx_revisions_part ON revisions(part_id);
CREATE INDEX IF NOT EXISTS idx_revisions_version ON revisions(part_id, major, minor);
```

---

## Part 4: Revision Service

Create `src/partflow/service/revision_service.py`:

```python
"""Revision service for version control."""

from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from partflow.domain.entities.revision import Revision
from partflow.domain.interfaces.revision_repository import RevisionRepositoryInterface
from partflow.domain.errors import NotFoundError
from partflow.service.snapshot_service import SnapshotService


class RevisionService:
    """Service for managing Part revisions."""
    
    def __init__(
        self,
        revision_repo: RevisionRepositoryInterface,
        snapshot_service: SnapshotService,
    ):
        self._revision_repo = revision_repo
        self._snapshot_service = snapshot_service
    
    def create_revision(
        self,
        part_id: UUID,
        changed_by: str,
        change_reason: str,
        is_major: bool = False,
        external_revision: Optional[str] = None,
    ) -> Revision:
        """Create a new revision of a Part.
        
        Captures current Part state and creates revision.
        """
        # Capture current state
        snapshot = self._snapshot_service.capture_part_snapshot(part_id)
        
        # Get latest revision
        latest = self._revision_repo.find_latest(part_id)
        
        if latest is None:
            # First revision
            revision = Revision.create_initial(
                revision_id=uuid4(),
                part_id=part_id,
                snapshot=snapshot,
                changed_by=changed_by,
                change_reason=change_reason,
            )
        else:
            # Subsequent revision
            revision = Revision.create_next(
                revision_id=uuid4(),
                previous=latest,
                snapshot=snapshot,
                changed_by=changed_by,
                change_reason=change_reason,
                is_major=is_major,
            )
        
        if external_revision:
            revision.external_revision = external_revision
        
        self._revision_repo.save(revision)
        return revision
    
    def get_revision(self, revision_id: UUID) -> Revision:
        """Get revision by ID."""
        revision = self._revision_repo.find_by_id(revision_id)
        if revision is None:
            raise NotFoundError("Revision", str(revision_id))
        return revision
    
    def get_history(self, part_id: UUID) -> List[Revision]:
        """Get all revisions for a Part."""
        return self._revision_repo.find_by_part(part_id)
    
    def get_latest(self, part_id: UUID) -> Optional[Revision]:
        """Get latest revision for a Part."""
        return self._revision_repo.find_latest(part_id)
    
    def get_version(self, part_id: UUID, major: int, minor: int) -> Revision:
        """Get specific version."""
        revision = self._revision_repo.find_by_version(part_id, major, minor)
        if revision is None:
            raise NotFoundError("Revision", f"{major}.{minor}")
        return revision
    
    def compare(
        self,
        revision_id_1: UUID,
        revision_id_2: UUID,
    ) -> Dict[str, Any]:
        """Compare two revisions."""
        rev1 = self.get_revision(revision_id_1)
        rev2 = self.get_revision(revision_id_2)
        
        return self._snapshot_service.create_diff(
            rev1.snapshot,
            rev2.snapshot,
        )
    
    def restore(
        self,
        from_revision_id: UUID,
        changed_by: str,
        change_reason: str,
    ) -> Revision:
        """Create new revision from old snapshot.
        
        Does NOT actually restore the Part—only creates a new
        revision with the old snapshot. Caller must update Part.
        """
        old_revision = self.get_revision(from_revision_id)
        
        # This would be a major change
        latest = self._revision_repo.find_latest(old_revision.part_id)
        
        revision = Revision.create_next(
            revision_id=uuid4(),
            previous=latest,
            snapshot=old_revision.snapshot,  # Use old snapshot
            changed_by=changed_by,
            change_reason=f"Restored from v{old_revision.version_string}: {change_reason}",
            is_major=True,
        )
        
        self._revision_repo.save(revision)
        return revision
```

---

## Summary

### Revision Workflow

1. Part updated in database
2. `create_revision` called
3. Snapshot captured
4. Revision saved
5. History preserved

---

## Next Tutorial

[Tutorial 5: History UI →](./05-history-ui.md)
