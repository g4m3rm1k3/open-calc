# Tutorial 1: Workflow Concepts

## Introduction

Manufacturing parts must follow **approval workflows**—they can't just appear in production. This tutorial explains workflow concepts and state machines.

---

## Part 1: Why Workflows?

### 1.1 Business Requirements

From the BRD:
- Parts move through defined states: Draft → Review → Approved → Active
- Only approved Parts can be used in production
- Changes to active Parts require re-approval
- History of state changes must be recorded

### 1.2 Real-World Scenarios

| Scenario | Workflow Needed? |
|----------|-----------------|
| Engineer creates new Part | Yes - must be reviewed |
| Manager approves Part | Yes - state transition |
| Part needs correction | Yes - back to draft |
| Part obsoleted | Yes - controlled retirement |

---

## Part 2: State Machine Fundamentals

### 2.1 What is a State Machine?

A **state machine** defines:
1. All possible states
2. Valid transitions between states
3. Who can trigger each transition
4. What happens on transition

### 2.2 Part Lifecycle State Machine

```
                    ┌─────────────────┐
                    │                 │
                    ▼                 │
┌───────────┐   ┌───────────┐   ┌─────┴─────┐   ┌───────────┐
│   DRAFT   │──▶│  REVIEW   │──▶│  APPROVED │──▶│  ACTIVE   │
└───────────┘   └───────────┘   └───────────┘   └─────┬─────┘
      ▲               │                               │
      │               │                               │
      └───────────────┘                               │
        (reject)                                      │
                                                      ▼
                                               ┌───────────┐
                                               │ OBSOLETE  │
                                               └───────────┘
```

### 2.3 State Definitions

| State | Meaning | Who Can Create |
|-------|---------|----------------|
| **DRAFT** | Work in progress | Engineer |
| **REVIEW** | Awaiting approval | Engineer submits |
| **APPROVED** | Approved for use | Approver |
| **ACTIVE** | In production use | System (after approval) |
| **OBSOLETE** | No longer used | Admin |

---

## Part 3: Transitions

### 3.1 Transition Table

| From | To | Transition Name | Who Can Do It |
|------|----|-----------------|---------------|
| DRAFT | REVIEW | submit_for_review | Owner |
| REVIEW | DRAFT | reject | Approver |
| REVIEW | APPROVED | approve | Approver |
| APPROVED | ACTIVE | activate | System/Admin |
| ACTIVE | OBSOLETE | obsolete | Admin |
| any | DRAFT | revise | Owner (creates new version) |

### 3.2 Transition Rules

| Rule | Why |
|------|-----|
| Cannot skip states | Ensures review |
| Cannot go backwards arbitrarily | Audit trail |
| Rejection returns to DRAFT | Allows fixes |
| OBSOLETE is terminal | No resurrection |

---

## Part 4: Approvers and Roles

### 4.1 Role-Based Access

| Role | Can Do |
|------|--------|
| **Engineer** | Create, edit draft, submit |
| **Approver** | Review, approve, reject |
| **Admin** | All above + obsolete |

### 4.2 Approval Record

Every approval must record:

| Field | Purpose |
|-------|---------|
| approved_by | Who approved |
| approved_at | When approved |
| approval_comments | Why approved/rejected |
| approval_checklist | What was verified |

---

## Part 5: Implementation Approach

### 5.1 Where State Lives

| Approach | Pros | Cons |
|----------|------|------|
| State field on Part | Simple | No history |
| **State + transitions table** | Full history | More tables |
| External workflow engine | Flexible | Complex |

**Our choice:** State field + StateTransition entity for history.

### 5.2 StateTransition Entity

```python
@dataclass
class StateTransition:
    id: UUID
    part_id: UUID
    from_state: PartStatus
    to_state: PartStatus
    transitioned_by: str
    transitioned_at: datetime
    comments: Optional[str]
```

---

## Part 6: Workflow Invariants

| Invariant | Enforcement |
|-----------|-------------|
| Only valid transitions allowed | Domain logic |
| Approver cannot be owner | Service check |
| Comments required for rejection | Validation |
| Transition recorded | After state change |

---

## Summary

### Key Concepts

| Concept | Meaning |
|---------|---------|
| **State machine** | Defined states and transitions |
| **Transition** | Moving between states |
| **Guard** | Condition for transition |
| **Approver** | Role that can approve |

---

## Next Tutorial

[Tutorial 2: State Machine Implementation →](./02-state-machine.md)
