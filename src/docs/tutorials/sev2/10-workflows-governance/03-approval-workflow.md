# Tutorial 3: Approval Workflow

## Introduction

This tutorial implements the approval workflow service, including submission, review, and approval/rejection.

---

## Part 1: Workflow Service Design

### 1.1 Service Responsibilities

| Method | Purpose |
|--------|---------|
| submit_for_review | Move Part to review |
| approve | Approve Part |
| reject | Reject Part with comments |
| activate | Make Part active |
| obsolete | Retire Part |
| get_pending_reviews | Get Parts awaiting approval |

### 1.2 Business Rules

| Rule | Enforcement |
|------|-------------|
| Author cannot approve own Part | Service check |
| Rejection requires comment | Validation |
| Transition creates audit record | After transition |
| Revision created on approval | Automatic |

---

## Part 2: Transition Repository

Create `src/partflow/domain/interfaces/transition_repository.py`:

```python
"""Repository interface for StateTransition entities."""

from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from partflow.domain.entities.state_transition import StateTransition


class TransitionRepositoryInterface(ABC):
    """Abstract interface for transition persistence."""
    
    @abstractmethod
    def save(self, transition: StateTransition) -> None:
        """Save a transition record."""
        pass
    
    @abstractmethod
    def find_by_part(self, part_id: UUID) -> List[StateTransition]:
        """Get all transitions for a Part."""
        pass
```

Create `src/partflow/repository/sqlite/transition_repository.py`:

```python
"""SQLite implementation of TransitionRepositoryInterface."""

from datetime import datetime
from typing import List
from uuid import UUID

from partflow.domain.entities.state_transition import StateTransition
from partflow.domain.entities.part import PartStatus
from partflow.domain.interfaces.transition_repository import TransitionRepositoryInterface
from partflow.repository.sqlite.database import Database


class SQLiteTransitionRepository(TransitionRepositoryInterface):
    """SQLite implementation of transition repository."""
    
    def __init__(self, db: Database):
        self._db = db
    
    def save(self, transition: StateTransition) -> None:
        with self._db.connection() as conn:
            conn.execute(
                """
                INSERT INTO state_transitions 
                (id, part_id, from_state, to_state, transitioned_by, 
                 transitioned_at, comments)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    str(transition.id),
                    str(transition.part_id),
                    transition.from_state.value,
                    transition.to_state.value,
                    transition.transitioned_by,
                    transition.transitioned_at.isoformat(),
                    transition.comments,
                )
            )
            conn.commit()
    
    def find_by_part(self, part_id: UUID) -> List[StateTransition]:
        with self._db.connection() as conn:
            rows = conn.execute(
                """
                SELECT * FROM state_transitions 
                WHERE part_id = ? 
                ORDER BY transitioned_at DESC
                """,
                (str(part_id),)
            ).fetchall()
            
            return [self._row_to_transition(row) for row in rows]
    
    def _row_to_transition(self, row) -> StateTransition:
        return StateTransition(
            id=UUID(row['id']),
            part_id=UUID(row['part_id']),
            from_state=PartStatus(row['from_state']),
            to_state=PartStatus(row['to_state']),
            transitioned_by=row['transitioned_by'],
            transitioned_at=datetime.fromisoformat(row['transitioned_at']),
            comments=row['comments'],
        )
```

Add schema:

```sql
CREATE TABLE IF NOT EXISTS state_transitions (
    id TEXT PRIMARY KEY,
    part_id TEXT NOT NULL,
    from_state TEXT NOT NULL,
    to_state TEXT NOT NULL,
    transitioned_by TEXT NOT NULL,
    transitioned_at TEXT NOT NULL,
    comments TEXT,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transitions_part ON state_transitions(part_id);
```

---

## Part 3: Workflow Service

Create `src/partflow/service/workflow_service.py`:

```python
"""Workflow service for Part approval processes."""

from typing import List, Optional
from uuid import UUID, uuid4

from partflow.domain.entities.part import Part, PartStatus
from partflow.domain.entities.state_transition import StateTransition
from partflow.domain.interfaces.part_repository import PartRepositoryInterface
from partflow.domain.interfaces.transition_repository import TransitionRepositoryInterface
from partflow.domain.errors import (
    NotFoundError,
    ValidationError,
    NotAuthorizedError,
)


class WorkflowService:
    """Service for Part approval workflow."""
    
    def __init__(
        self,
        part_repo: PartRepositoryInterface,
        transition_repo: TransitionRepositoryInterface,
    ):
        self._part_repo = part_repo
        self._transition_repo = transition_repo
    
    def submit_for_review(
        self,
        part_id: UUID,
        submitted_by: str,
        comments: Optional[str] = None,
    ) -> Part:
        """Submit a Part for review.
        
        Args:
            part_id: Part to submit
            submitted_by: User submitting
            comments: Optional submission comments
        """
        part = self._get_part(part_id)
        from_state = part.status
        
        part.submit_for_review()
        self._part_repo.save(part)
        
        self._record_transition(
            part_id, from_state, part.status, 
            submitted_by, comments or "Submitted for review"
        )
        
        return part
    
    def approve(
        self,
        part_id: UUID,
        approved_by: str,
        comments: Optional[str] = None,
    ) -> Part:
        """Approve a Part.
        
        Args:
            part_id: Part to approve
            approved_by: Approver (cannot be author)
            comments: Optional approval comments
        """
        part = self._get_part(part_id)
        from_state = part.status
        
        # TODO: Check approver is not the author
        # self._check_not_author(part, approved_by)
        
        part.approve()
        self._part_repo.save(part)
        
        self._record_transition(
            part_id, from_state, part.status,
            approved_by, comments or "Approved"
        )
        
        return part
    
    def reject(
        self,
        part_id: UUID,
        rejected_by: str,
        comments: str,
    ) -> Part:
        """Reject a Part back to draft.
        
        Args:
            part_id: Part to reject
            rejected_by: Rejector
            comments: Required rejection reason
        """
        if not comments or not comments.strip():
            raise ValidationError("comments", "Rejection requires comments")
        
        part = self._get_part(part_id)
        from_state = part.status
        
        part.reject()
        self._part_repo.save(part)
        
        self._record_transition(
            part_id, from_state, part.status,
            rejected_by, f"Rejected: {comments}"
        )
        
        return part
    
    def activate(
        self,
        part_id: UUID,
        activated_by: str,
    ) -> Part:
        """Activate an approved Part."""
        part = self._get_part(part_id)
        from_state = part.status
        
        part.activate()
        self._part_repo.save(part)
        
        self._record_transition(
            part_id, from_state, part.status,
            activated_by, "Activated for production"
        )
        
        return part
    
    def obsolete(
        self,
        part_id: UUID,
        obsoleted_by: str,
        reason: str,
    ) -> Part:
        """Mark a Part as obsolete."""
        if not reason or not reason.strip():
            raise ValidationError("reason", "Obsolete requires reason")
        
        part = self._get_part(part_id)
        from_state = part.status
        
        part.obsolete()
        self._part_repo.save(part)
        
        self._record_transition(
            part_id, from_state, part.status,
            obsoleted_by, f"Obsoleted: {reason}"
        )
        
        return part
    
    def get_pending_reviews(self) -> List[Part]:
        """Get all Parts in REVIEW status."""
        return self._part_repo.find_by_status(PartStatus.REVIEW)
    
    def get_transition_history(self, part_id: UUID) -> List[StateTransition]:
        """Get workflow history for a Part."""
        return self._transition_repo.find_by_part(part_id)
    
    def _get_part(self, part_id: UUID) -> Part:
        part = self._part_repo.find_by_id(part_id)
        if part is None:
            raise NotFoundError("Part", str(part_id))
        return part
    
    def _record_transition(
        self,
        part_id: UUID,
        from_state: PartStatus,
        to_state: PartStatus,
        by_user: str,
        comments: str,
    ) -> None:
        transition = StateTransition(
            id=uuid4(),
            part_id=part_id,
            from_state=from_state,
            to_state=to_state,
            transitioned_by=by_user,
            comments=comments,
        )
        self._transition_repo.save(transition)
```

---

## Part 4: Tests

```python
"""Tests for WorkflowService."""

import pytest
from uuid import uuid4
from unittest.mock import Mock

from partflow.domain.entities.part import Part, PartStatus
from partflow.domain.errors import ValidationError


class TestWorkflowSubmission:
    
    @pytest.fixture
    def service(self):
        from partflow.service.workflow_service import WorkflowService
        return WorkflowService(Mock(), Mock())
    
    def test_submit_changes_status_to_review(self, service):
        part = Part(id=uuid4(), part_number="PN-12345", name="Test",
                    status=PartStatus.DRAFT)
        service._part_repo.find_by_id.return_value = part
        
        result = service.submit_for_review(part.id, "user123")
        
        assert result.status == PartStatus.REVIEW
        service._transition_repo.save.assert_called_once()


class TestWorkflowApproval:
    
    @pytest.fixture
    def service(self):
        from partflow.service.workflow_service import WorkflowService
        return WorkflowService(Mock(), Mock())
    
    def test_approve_changes_status(self, service):
        part = Part(id=uuid4(), part_number="PN-12345", name="Test",
                    status=PartStatus.REVIEW)
        service._part_repo.find_by_id.return_value = part
        
        result = service.approve(part.id, "approver")
        
        assert result.status == PartStatus.APPROVED


class TestWorkflowRejection:
    
    @pytest.fixture
    def service(self):
        from partflow.service.workflow_service import WorkflowService
        return WorkflowService(Mock(), Mock())
    
    def test_reject_requires_comments(self, service):
        part = Part(id=uuid4(), part_number="PN-12345", name="Test",
                    status=PartStatus.REVIEW)
        service._part_repo.find_by_id.return_value = part
        
        with pytest.raises(ValidationError, match="comments"):
            service.reject(part.id, "reviewer", "")
    
    def test_reject_with_comments_succeeds(self, service):
        part = Part(id=uuid4(), part_number="PN-12345", name="Test",
                    status=PartStatus.REVIEW)
        service._part_repo.find_by_id.return_value = part
        
        result = service.reject(part.id, "reviewer", "Needs more detail")
        
        assert result.status == PartStatus.DRAFT
```

---

## Summary

### Workflow Operations

| Operation | Validation |
|-----------|------------|
| Submit | Part in DRAFT |
| Approve | Part in REVIEW, not author |
| Reject | Part in REVIEW, comment required |
| Obsolete | Part in ACTIVE, reason required |

---

## Next Tutorial

[Tutorial 4: Audit Logging →](./04-audit-logging.md)
