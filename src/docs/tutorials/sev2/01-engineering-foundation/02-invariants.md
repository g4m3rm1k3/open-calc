# Tutorial 2: Invariants and Business Rules

## Introduction

An **invariant** is a condition that must always be true. It's a rule that the system must never violate, regardless of what operations are performed.

Invariants are:
- The **non-negotiable truths** of your domain
- The **guardrails** that prevent corruption
- The **contracts** that users can depend on

> **If an invariant is violated, the system is broken.** Not "behaving unexpectedly"—broken.

---

## Part 1: What is an Invariant?

### 1.1 Definition

An invariant is a condition that:
1. Must be true at all times
2. Is enforced by the system (not just hoped for)
3. Has specific consequences if violated

### 1.2 Invariants vs. Preferences

| Type | Example | Enforcement | Consequence if Broken |
|------|---------|-------------|----------------------|
| **Invariant** | Part number must be unique | System prevents duplicates | Data corruption, referential integrity lost |
| **Preference** | Part names should be descriptive | Documentation/review | Poor usability, but system works |
| **Guideline** | Revisions should be reviewed | Process recommendation | Quality risk, but not system failure |

### 1.3 Why Invariants Matter

Consider this scenario without invariants:

```python
# No invariant checking
def create_part(part_number, name):
    db.insert({"part_number": part_number, "name": name})
```

What happens if:
- `part_number` is empty? → Invalid part, queries fail
- `part_number` already exists? → Duplicate, which one is "the" part?
- `name` is None? → Display errors, downstream failures

With invariants:

```python
def create_part(part_number, name):
    if not part_number:
        raise ValidationError("Part number is required")
    if not matches_format(part_number, PART_NUMBER_FORMAT):
        raise ValidationError("Part number must match XX-NNNNN")
    if part_exists(part_number):
        raise DuplicateError("Part number already exists")
    
    db.insert({"part_number": part_number, "name": name})
```

---

## Part 2: Categories of Invariants

### 2.1 Identity Invariants

**What they protect**: Uniqueness and identification of entities.

| Entity | Identity Invariant |
|--------|-------------------|
| Part | part_number must be unique |
| Machine | machine_id must be unique |
| User | username must be unique |
| PartMachine | (part_id, machine_id) combination must be unique |

### 2.2 State Invariants

**What they protect**: Valid state at any point in time.

| Entity | State Invariant |
|--------|----------------|
| Revision | major cannot decrease; minor cannot decrease within same major |
| Program.status | cannot go from "released" to "draft" |
| Part.status | "obsolete" parts cannot have new programs |
| Machine.status | "decommissioned" machines cannot accept new programs |

### 2.3 Relationship Invariants

**What they protect**: Valid connections between entities.

| Relationship | Invariant |
|--------------|-----------|
| Program → PartMachine | Every Program must belong to exactly one PartMachine |
| PartMachine → Part | PartMachine cannot exist without valid Part reference |
| ToolUsage → Tool | Cannot reference non-existent Tool |
| Approval → User | approver must have appropriate role |

### 2.4 Data Invariants

**What they protect**: Data validity within an entity.

| Entity | Data Invariant |
|--------|---------------|
| Part.part_number | Must match format ^[A-Z]{2}-[0-9]{5}$ |
| Tool.tool_number | Must be positive integer |
| Dimension.value | Must be > 0 |
| User.password_hash | Must never be empty (system guarantees hashed) |

### 2.5 Temporal Invariants

**What they protect**: Time-based correctness.

| Scenario | Invariant |
|----------|-----------|
| Approval | approved_at must be >= requested_at |
| Revision | created_at must be >= previous revision's created_at |
| Lock | expires_at must be > acquired_at |
| Audit | entry cannot be backdated beyond creation time |

---

## Part 3: Invariants for PartFlow

Let's document the invariants for our Manufacturing Platform.

### 3.1 Complete Invariant Registry

```markdown
# PartFlow Invariant Registry

## Identity Invariants

### INV-ID-001: Part Number Uniqueness
**Statement**: No two Parts may have the same part_number.
**Scope**: Part entity
**Enforcement**: 
- Database: UNIQUE constraint on parts.part_number
- Application: Check before insert
**Violation Consequence**: 
- Referential confusion
- Wrong parts associated with programs
- Data integrity loss
**Example**:
- Part A exists with number "PN-12345"
- Attempt to create Part B with "PN-12345"
- System rejects: "Part number already exists"

### INV-ID-002: Machine ID Uniqueness
**Statement**: No two Machines may have the same machine_id.
**Scope**: Machine entity
**Enforcement**: Database UNIQUE + application validation
**Violation Consequence**: Programs assigned to wrong machine

### INV-ID-003: Username Uniqueness
**Statement**: No two Users may have the same username.
**Scope**: User entity
**Enforcement**: Database UNIQUE + application validation
**Violation Consequence**: Authentication confusion, audit trail corruption

### INV-ID-004: PartMachine Uniqueness
**Statement**: Only one PartMachine may exist for a given (Part, Machine) pair.
**Scope**: PartMachine entity
**Enforcement**: Database UNIQUE constraint on (part_id, machine_id)
**Violation Consequence**: Ambiguous program assignments

---

## State Invariants

### INV-STATE-001: Revision Monotonicity
**Statement**: Revision numbers must only increase, never decrease.
**Scope**: All versioned entities
**Enforcement**: Application logic, trigger validation
**Rules**:
- Minor can reset to 0 when major increments
- Minor must increase for same major
- Major must increase for major changes
**Example**:
- Valid: 1.0 → 1.1 → 1.2 → 2.0 → 2.1
- Invalid: 1.2 → 1.1 (decrease not allowed)

### INV-STATE-002: Program Status Flow
**Statement**: Program status can only transition through valid paths.
**Scope**: GCodeProgram entity
**Valid Transitions**:
```
draft → pending_approval → approved → released → obsolete
                        ↘ rejected → draft (back to revise)
```
**Invalid Transitions**:
- released → draft (cannot un-release)
- obsolete → anything (terminal state)
**Enforcement**: State machine in application layer

### INV-STATE-003: Immutable Released Programs
**Statement**: Once a Program is "released", its content cannot change.
**Scope**: GCodeProgram entity
**Enforcement**: Application rejects updates to content when status = released
**Rationale**: Released programs are shop-floor documents of record

### INV-STATE-004: Decommissioned Machine Restriction
**Statement**: Decommissioned Machines cannot accept new PartMachine or Program assignments.
**Scope**: Machine entity
**Enforcement**: Validation on PartMachine and Program creation

---

## Relationship Invariants

### INV-REL-001: Program Requires PartMachine
**Statement**: Every GCodeProgram must belong to exactly one PartMachine.
**Scope**: GCodeProgram entity
**Enforcement**: NOT NULL foreign key, database constraint
**Violation Consequence**: Orphan programs, no context for execution

### INV-REL-002: No Orphan PartMachine
**Statement**: PartMachine must reference valid Part and Machine.
**Scope**: PartMachine entity
**Enforcement**: Foreign key constraints
**Cascade Rule**: If Part is deleted, decide policy (prevent or cascade)

### INV-REL-003: Approval Requires Valid Approver
**Statement**: An Approval's approver must have Manufacturing Engineer role or higher.
**Scope**: Approval entity
**Enforcement**: Application validation before approval recorded
**Violation Consequence**: Invalid approval chain, audit failure

---

## Data Invariants

### INV-DATA-001: Part Number Format
**Statement**: Part number must match format ^[A-Z]{2}-[0-9]{5}$.
**Scope**: Part.part_number
**Enforcement**: Application validation, database check constraint
**Examples**:
- Valid: "PN-12345", "AB-00001"
- Invalid: "12345", "PN12345", "pn-12345"

### INV-DATA-002: Non-Empty Required Fields
**Statement**: Required fields cannot be empty or null.
**Scope**: All entities with required fields
**Enforcement**: Database NOT NULL + application validation
**Fields**:
- Part: part_number, name
- Machine: machine_id, name
- User: username, password_hash

### INV-DATA-003: Positive Dimensions
**Statement**: Dimensional values must be positive.
**Scope**: Dimension value objects
**Enforcement**: Application validation
**Example**: tool diameter = -5 is invalid

---

## Temporal Invariants

### INV-TIME-001: Approval Time Order
**Statement**: approved_at must be >= requested_at.
**Scope**: Approval entity
**Enforcement**: Application logic (system sets timestamps)
**Rationale**: Cannot approve before requesting

### INV-TIME-002: Lock Validity
**Statement**: Lock expires_at must be > acquired_at.
**Scope**: Lock entity
**Enforcement**: Application sets valid expiration

### INV-TIME-003: Audit Immutability
**Statement**: Audit records cannot be modified after creation.
**Scope**: AuditEntry entity
**Enforcement**: No UPDATE operations allowed, only INSERT

---

## Constraint Matrix

| Invariant ID | Enforced At DB | Enforced At App | Critical? |
|--------------|----------------|-----------------|-----------|
| INV-ID-001 | UNIQUE | Validation | Yes |
| INV-ID-002 | UNIQUE | Validation | Yes |
| INV-ID-003 | UNIQUE | Validation | Yes |
| INV-ID-004 | UNIQUE(2 cols) | Validation | Yes |
| INV-STATE-001 | Trigger | Logic | Yes |
| INV-STATE-002 | — | State machine | Yes |
| INV-STATE-003 | — | Guard check | Yes |
| INV-STATE-004 | — | Validation | Medium |
| INV-REL-001 | FK NOT NULL | Constructor | Yes |
| INV-REL-002 | FK | Constructor | Yes |
| INV-REL-003 | — | Validation | Yes |
| INV-DATA-001 | CHECK | Validation | Yes |
| INV-DATA-002 | NOT NULL | Validation | Yes |
| INV-DATA-003 | — | Validation | Medium |
| INV-TIME-001 | — | System sets | Yes |
| INV-TIME-002 | — | System sets | Yes |
| INV-TIME-003 | No UPDATE | No update method | Yes |
```

---

## Part 4: Where to Enforce Invariants

### 4.1 Defense in Depth

Invariants should be enforced at **multiple levels**:

```
    User Input
         │
         ▼
    ┌─────────────┐
    │ UI/Form     │ ← First check (user-friendly feedback)
    │ Validation  │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ API Layer   │ ← Second check (security boundary)
    │ Validation  │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Domain      │ ← Third check (business rules)
    │ Entity      │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Database    │ ← Final check (data integrity)
    │ Constraints │
    └─────────────┘
```

### 4.2 Why Multiple Levels?

| Level | Purpose | Catches |
|-------|---------|---------|
| UI | User experience | Typos, format errors |
| API | Security | Malicious input, bypass attempts |
| Domain | Business rules | Logic violations |
| Database | Data integrity | Bugs, race conditions |

### 4.3 Example: Part Number Invariant

```python
# Level 1: UI (JavaScript/HTML)
<input pattern="[A-Z]{2}-[0-9]{5}" title="Format: XX-12345">

# Level 2: API (Flask route)
@app.route('/parts', methods=['POST'])
def create_part():
    if not re.match(r'^[A-Z]{2}-[0-9]{5}$', request.json['part_number']):
        return {"error": "Invalid part number format"}, 400
    ...

# Level 3: Domain (Part entity)
class Part:
    def __init__(self, part_number: str, ...):
        if not PartNumber.is_valid(part_number):
            raise InvalidPartNumberError(part_number)
        self._part_number = PartNumber(part_number)

# Level 4: Database (SQLite)
CREATE TABLE parts (
    part_number TEXT NOT NULL UNIQUE 
        CHECK (part_number GLOB '[A-Z][A-Z]-[0-9][0-9][0-9][0-9][0-9]')
);
```

---

## Part 5: Exercises

### Exercise 1: Identify the Invariant

For each scenario, identify which invariant is being violated:

1. Two different Parts have part_number "PN-12345"
2. A Program in "released" status has its G-code modified
3. A Program is approved by a user with "Operator" role
4. A new PartMachine is created for a decommissioned Machine
5. A revision goes from 2.5 to 2.3

<details>
<summary>Solution</summary>

1. **INV-ID-001**: Part Number Uniqueness
2. **INV-STATE-003**: Immutable Released Programs
3. **INV-REL-003**: Approval Requires Valid Approver
4. **INV-STATE-004**: Decommissioned Machine Restriction
5. **INV-STATE-001**: Revision Monotonicity

</details>

---

### Exercise 2: Write an Invariant

Write a complete invariant specification for this requirement:

> "A Program cannot be released unless at least one successful Inspection exists."

Use the template:
- ID, Statement, Scope, Enforcement, Violation Consequence, Example

<details>
<summary>Hints</summary>

- What entity is this checking?
- When is this check performed?
- What is a "successful" inspection?

</details>

<details>
<summary>Solution</summary>

```markdown
### INV-REL-004: Release Requires Inspection
**Statement**: A GCodeProgram cannot transition to "released" status 
              unless at least one Inspection with result="pass" exists 
              for that Program.
**Scope**: GCodeProgram entity, status transition
**Enforcement**: 
- Application: State machine guard on transition to "released"
- Check: `SELECT COUNT(*) FROM inspections WHERE program_id = ? AND result = 'pass'`
**Violation Consequence**: 
- Untested programs reach shop floor
- Quality escapes
- Regulatory non-compliance
**Example**:
- Program O1234 is in "approved" status
- Attempt to release without any inspections
- System rejects: "Cannot release: no passing inspection on record"
- After inspection with result="pass" is recorded
- Release succeeds
```

</details>

---

### Exercise 3: Enforcement Level

For each invariant, decide which levels should enforce it:

| Invariant | UI | API | Domain | DB |
|-----------|----|----|--------|-----|
| Part number format | ? | ? | ? | ? |
| User must have permission to approve | ? | ? | ? | ? |
| Released programs are immutable | ? | ? | ? | ? |
| Revision must increase | ? | ? | ? | ? |

<details>
<summary>Solution</summary>

| Invariant | UI | API | Domain | DB |
|-----------|----|----|--------|-----|
| Part number format | ✓ | ✓ | ✓ | ✓ |
| User must have permission to approve | ✗ | ✓ | ✓ | ✗ |
| Released programs are immutable | ✗ | ✓ | ✓ | ✗* |
| Revision must increase | ✗ | ✗ | ✓ | ✓ |

*Could use trigger but adds complexity

**Rationale:**
- Part number format: Validate everywhere (defense in depth)
- Permission check: Not UI concern, but API and Domain must check
- Immutability: Application enforcement (status check), DB would need trigger
- Revision increase: Domain logic, DB trigger as safety net

</details>

---

### Exercise 4: Design the State Machine

Given these requirements:

> "Programs go through: draft, pending_approval, approved, released, obsolete. 
> A rejected approval returns to draft. 
> Released programs can only become obsolete."

Draw the state machine and list all valid transitions.

<details>
<summary>Solution</summary>

```
                    ┌──────────────────────────────┐
                    │                              │
                    ▼                              │
               ┌────────┐                          │
               │ draft  │◀─────────────────────────┤
               └───┬────┘                          │
                   │ submit_for_approval           │
                   ▼                               │
          ┌─────────────────┐                      │
          │ pending_approval │                     │
          └───────┬─────────┘                      │
                  │                                │
         ┌────────┴────────┐                       │
         │                 │                       │
         ▼                 ▼                       │
    ┌──────────┐      ┌──────────┐                │
    │ approved │      │ rejected │ ───────────────┘
    └────┬─────┘      └──────────┘
         │ release
         ▼
    ┌──────────┐
    │ released │
    └────┬─────┘
         │ obsolete
         ▼
    ┌──────────┐
    │ obsolete │ (terminal)
    └──────────┘
```

**Valid Transitions:**

| From | To | Trigger |
|------|-----|---------|
| draft | pending_approval | submit_for_approval |
| pending_approval | approved | approve |
| pending_approval | rejected | reject |
| rejected | draft | revise |
| approved | released | release |
| released | obsolete | mark_obsolete |

**Invalid (blocked):**
- released → draft (cannot un-release)
- obsolete → anything (terminal)
- draft → released (must go through approval)

</details>

---

## Summary

### Key Takeaways

| Concept | What It Means |
|---------|---------------|
| **Invariant** | A rule that must NEVER be violated |
| **Identity invariant** | Ensures uniqueness |
| **State invariant** | Ensures valid state transitions |
| **Relationship invariant** | Ensures valid connections |
| **Defense in depth** | Enforce at multiple levels |

### Invariant Documentation Checklist

For every invariant:

- [ ] Unique ID for reference
- [ ] Clear statement of the rule
- [ ] Scope (which entities/fields)
- [ ] Enforcement (where/how)
- [ ] Violation consequence (what breaks)
- [ ] Concrete example

---

## Next Tutorial

[Tutorial 3: Architectural Decisions →](./03-architectural-decisions.md)
