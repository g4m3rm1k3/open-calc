# Tutorial 2: State Machine Implementation

## Introduction

This tutorial implements the Part lifecycle state machine with TDD.

---

## Part 1: Update PartStatus Enum

Update `src/partflow/domain/entities/part.py`:

```python
class PartStatus(Enum):
    """Lifecycle status of a Part."""
    DRAFT = "draft"           # Work in progress
    REVIEW = "review"         # Submitted for approval
    APPROVED = "approved"     # Approved but not yet active
    ACTIVE = "active"         # In production use
    OBSOLETE = "obsolete"     # No longer used
```

---

## Part 2: Transition Matrix

### 2.1 Define Valid Transitions

```python
# src/partflow/domain/workflow/transitions.py
"""Part state transition rules."""

from partflow.domain.entities.part import PartStatus

# Map: from_state -> list of valid to_states
VALID_TRANSITIONS = {
    PartStatus.DRAFT: [PartStatus.REVIEW],
    PartStatus.REVIEW: [PartStatus.DRAFT, PartStatus.APPROVED],
    PartStatus.APPROVED: [PartStatus.ACTIVE],
    PartStatus.ACTIVE: [PartStatus.OBSOLETE],
    PartStatus.OBSOLETE: [],  # Terminal state
}


def can_transition(from_state: PartStatus, to_state: PartStatus) -> bool:
    """Check if transition is valid."""
    valid_targets = VALID_TRANSITIONS.get(from_state, [])
    return to_state in valid_targets


def get_available_transitions(from_state: PartStatus) -> list[PartStatus]:
    """Get all states reachable from current state."""
    return VALID_TRANSITIONS.get(from_state, [])
```

### 2.2 Tests

```python
"""Tests for state transitions."""

import pytest
from partflow.domain.entities.part import PartStatus
from partflow.domain.workflow.transitions import can_transition, get_available_transitions


class TestTransitionRules:
    """Tests for transition validity."""
    
    def test_draft_can_go_to_review(self):
        assert can_transition(PartStatus.DRAFT, PartStatus.REVIEW) is True
    
    def test_draft_cannot_skip_to_approved(self):
        assert can_transition(PartStatus.DRAFT, PartStatus.APPROVED) is False
    
    def test_review_can_go_to_approved(self):
        assert can_transition(PartStatus.REVIEW, PartStatus.APPROVED) is True
    
    def test_review_can_go_back_to_draft(self):
        assert can_transition(PartStatus.REVIEW, PartStatus.DRAFT) is True
    
    def test_obsolete_is_terminal(self):
        assert get_available_transitions(PartStatus.OBSOLETE) == []
    
    def test_cannot_go_from_active_to_draft(self):
        assert can_transition(PartStatus.ACTIVE, PartStatus.DRAFT) is False
```

---

## Part 3: StateTransition Entity

Create `src/partflow/domain/entities/state_transition.py`:

```python
"""StateTransition entity for audit trail."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID

from partflow.domain.entities.part import PartStatus


@dataclass
class StateTransition:
    """Record of a state change.
    
    Captures who changed what, when, and why.
    """
    id: UUID
    part_id: UUID
    from_state: PartStatus
    to_state: PartStatus
    transitioned_by: str
    transitioned_at: datetime = field(default_factory=datetime.utcnow)
    comments: Optional[str] = None
    
    @property
    def transition_name(self) -> str:
        """Get human-readable transition name."""
        names = {
            (PartStatus.DRAFT, PartStatus.REVIEW): "Submitted for Review",
            (PartStatus.REVIEW, PartStatus.DRAFT): "Rejected",
            (PartStatus.REVIEW, PartStatus.APPROVED): "Approved",
            (PartStatus.APPROVED, PartStatus.ACTIVE): "Activated",
            (PartStatus.ACTIVE, PartStatus.OBSOLETE): "Obsoleted",
        }
        return names.get(
            (self.from_state, self.to_state), 
            f"{self.from_state.value} → {self.to_state.value}"
        )
```

---

## Part 4: Add Transitions to Part Entity

Update Part entity with transition methods:

```python
# Add to Part class

def submit_for_review(self) -> None:
    """Submit this Part for review/approval."""
    from partflow.domain.workflow.transitions import can_transition
    from partflow.domain.errors import InvalidStateTransitionError
    
    if not can_transition(self.status, PartStatus.REVIEW):
        raise InvalidStateTransitionError(
            self.status.value, 
            PartStatus.REVIEW.value
        )
    self.status = PartStatus.REVIEW

def reject(self) -> None:
    """Reject this Part back to draft."""
    from partflow.domain.workflow.transitions import can_transition
    from partflow.domain.errors import InvalidStateTransitionError
    
    if not can_transition(self.status, PartStatus.DRAFT):
        raise InvalidStateTransitionError(
            self.status.value,
            PartStatus.DRAFT.value
        )
    self.status = PartStatus.DRAFT

def approve(self) -> None:
    """Approve this Part."""
    from partflow.domain.workflow.transitions import can_transition
    from partflow.domain.errors import InvalidStateTransitionError
    
    if not can_transition(self.status, PartStatus.APPROVED):
        raise InvalidStateTransitionError(
            self.status.value,
            PartStatus.APPROVED.value
        )
    self.status = PartStatus.APPROVED

def activate(self) -> None:
    """Activate this Part for production use."""
    from partflow.domain.workflow.transitions import can_transition
    from partflow.domain.errors import InvalidStateTransitionError
    
    if not can_transition(self.status, PartStatus.ACTIVE):
        raise InvalidStateTransitionError(
            self.status.value,
            PartStatus.ACTIVE.value
        )
    self.status = PartStatus.ACTIVE

def obsolete(self) -> None:
    """Mark this Part as obsolete."""
    from partflow.domain.workflow.transitions import can_transition
    from partflow.domain.errors import InvalidStateTransitionError
    
    if not can_transition(self.status, PartStatus.OBSOLETE):
        raise InvalidStateTransitionError(
            self.status.value,
            PartStatus.OBSOLETE.value
        )
    self.status = PartStatus.OBSOLETE
```

---

## Part 5: Tests for Part Transitions

```python
"""Tests for Part state transitions."""

import pytest
from uuid import uuid4

from partflow.domain.entities.part import Part, PartStatus
from partflow.domain.errors import InvalidStateTransitionError


class TestPartWorkflow:
    """Test Part lifecycle transitions."""
    
    @pytest.fixture
    def draft_part(self):
        return Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test Part",
            status=PartStatus.DRAFT,
        )
    
    def test_submit_for_review(self, draft_part):
        draft_part.submit_for_review()
        assert draft_part.status == PartStatus.REVIEW
    
    def test_approve_from_review(self, draft_part):
        draft_part.submit_for_review()
        draft_part.approve()
        assert draft_part.status == PartStatus.APPROVED
    
    def test_cannot_approve_draft(self, draft_part):
        with pytest.raises(InvalidStateTransitionError):
            draft_part.approve()
    
    def test_reject_returns_to_draft(self, draft_part):
        draft_part.submit_for_review()
        draft_part.reject()
        assert draft_part.status == PartStatus.DRAFT
    
    def test_activate_from_approved(self, draft_part):
        draft_part.submit_for_review()
        draft_part.approve()
        draft_part.activate()
        assert draft_part.status == PartStatus.ACTIVE
    
    def test_obsolete_from_active(self, draft_part):
        draft_part.submit_for_review()
        draft_part.approve()
        draft_part.activate()
        draft_part.obsolete()
        assert draft_part.status == PartStatus.OBSOLETE
    
    def test_cannot_transition_from_obsolete(self, draft_part):
        draft_part.submit_for_review()
        draft_part.approve()
        draft_part.activate()
        draft_part.obsolete()
        
        with pytest.raises(InvalidStateTransitionError):
            draft_part.submit_for_review()
```

---

## Summary

### State Machine Implementation

| Component | Purpose |
|-----------|---------|
| `PartStatus` enum | All possible states |
| `VALID_TRANSITIONS` | Transition matrix |
| `can_transition()` | Check validity |
| Part methods | Execute transitions |
| `StateTransition` | Audit trail |

---

## Next Tutorial

[Tutorial 3: Approval Workflow →](./03-approval-workflow.md)
