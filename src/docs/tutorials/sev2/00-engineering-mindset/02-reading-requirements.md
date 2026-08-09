# Tutorial 2: Reading Requirements Like an Engineer

## Introduction

Requirements documents are where engineering begins. A Business Requirements Document (BRD) tells you **what** the customer wants. It does not tell you **how** to build it, **what's missing**, or **what could go wrong**.

An engineer reads requirements differently than a programmer:

| Programmer | Engineer |
|------------|----------|
| "What features do I need to build?" | "What system do I need to design?" |
| Reads for implementation tasks | Reads for domain understanding |
| Accepts requirements as complete | Questions what's missing |
| Focuses on happy path | Considers failure modes |

This tutorial teaches you to read requirements like an engineer.

---

## Part 1: The BRD is Not a Specification

### 1.1 What a BRD Contains

A Business Requirements Document describes:
- **Business objectives** (why are we building this?)
- **User roles** (who will use it?)
- **Functional requirements** (what should it do?)
- **Non-functional requirements** (how well should it perform?)
- **Constraints** (what limitations exist?)

### 1.2 What a BRD Does NOT Contain

A BRD does not specify:
- Database schema
- API endpoints
- Code structure
- Error handling strategy
- Edge cases and validation rules
- System behavior under failure
- Performance requirements (often vague)
- Security implementation

**This gap is the engineer's job to fill.**

### 1.3 The Gap Between "What" and "How"

Consider this requirement from our BRD:

> "Each artifact shall have a unique identity across the system."

This statement contains:
- **One explicit requirement**: unique identity
- **Multiple implicit questions**:
  - What constitutes "identity"? A number? A UUID? A composite key?
  - Unique across all time, or just current records?
  - What happens if someone tries to create a duplicate?
  - Who enforces uniqueness? The database? The application? Both?
  - Can identity ever change?

**The engineer surfaces these questions** before building.

---

## Part 2: A Systematic Approach to Reading Requirements

### 2.1 The Five-Pass Reading Method

**Pass 1: Nouns (Entities)**
- Underline every noun that represents a "thing" in the system
- These are your candidate entities

**Pass 2: Verbs (Operations)**
- Underline every verb that represents an action
- These become your services and use cases

**Pass 3: Adjectives (Constraints)**
- Underline every adjective that limits or qualifies
- These become your validation rules and invariants

**Pass 4: Relationships (Connections)**
- Draw lines between related nouns
- These become your data model relationships

**Pass 5: Questions (Gaps)**
- For every sentence, ask: "What's missing?"
- Document these questions for clarification

### 2.2 Applying to Our BRD

Let's apply this to a section of our Manufacturing Platform BRD:

> "The Platform shall manage the following artifact types as first-class entities: Parts, Part–Machine combinations, Fixtures, Tools, Machines, CAM files, G-code programs, Inspection records."

**Pass 1: Nouns (Entities)**

| Noun | Entity? | Notes |
|------|---------|-------|
| Platform | No | The system itself |
| Parts | Yes | Core business concept |
| Part–Machine combinations | Yes | Relationship entity |
| Fixtures | Yes | Physical resource |
| Tools | Yes | Physical resource |
| Machines | Yes | Physical resource |
| CAM files | Yes | Digital artifact |
| G-code programs | Yes | Digital artifact |
| Inspection records | Yes | Event/audit data |

**Pass 2: Verbs (Operations)**

| Verb | Operation | Notes |
|------|-----------|-------|
| manage | CRUD operations | Create, Read, Update, Delete |
| (implied) create | Create new artifacts | Not explicit in this sentence |
| (implied) relate | Create relationships | Part–Machine implies linking |

**Pass 3: Adjectives (Constraints)**

| Adjective | Constraint | Questions |
|-----------|------------|-----------|
| first-class | Equal treatment | What does this mean technically? |
| unique identity | Uniqueness | How is identity defined? |
| reusable | No duplication | How do we reference, not copy? |
| full revision history | Immutability | How do we implement this? |
| major and minor | Versioning scheme | What triggers major vs minor? |

**Pass 4: Relationships**

```
    Part ←→ Machine (via Part–Machine combination)
      ↓
    CAM file ← processed from
      ↓
    G-code program ← generated from
      ↓
    Inspection record ← validates
```

**Pass 5: Questions (Gaps)**

| Implicit Assumption | Question to Ask |
|---------------------|-----------------|
| "artifact types" | Can new types be added later? |
| "first-class entities" | Do all entities have the same operations? |
| "Part–Machine combinations" | Is this a separate entity or a relationship? |
| "revision history" | Do all artifacts have revisions, or just some? |
| "reusable without duplication" | How do we handle shared tools across parts? |

---

## Part 3: Extracting Domain Knowledge

### 3.1 What is a Domain Model?

A domain model captures:
- **Entities**: Things with identity that persist over time
- **Value Objects**: Things defined by their properties, not identity
- **Relationships**: How entities connect to each other
- **Invariants**: Rules that must always be true
- **Operations**: What can be done to/with entities

### 3.2 From BRD to Domain Model

From our analysis, we can start sketching a domain model:

**Entities (have identity)**
- Part (identified by part number)
- Machine (identified by machine ID)
- Tool (identified by tool number)
- Fixture (identified by fixture ID)
- CAM File (identified by file ID)
- G-Code Program (identified by program ID)
- Inspection Record (identified by record ID)

**Relationships**
- Part has many Part–Machine combinations
- Part–Machine has one Part and one Machine
- Part–Machine has many CAM Files
- CAM File has many G-Code Programs
- G-Code Program has many Inspection Records

**Early Invariants Identified**
- Every Part has a unique part number
- Every Machine has a unique machine ID
- A Part–Machine combination is unique per (Part, Machine) pair
- A G-Code Program must belong to exactly one Part–Machine

### 3.3 What We Don't Know Yet

At this stage, we have questions that require clarification:

| Question | Why It Matters |
|----------|----------------|
| Can a Tool belong to multiple Parts? | Affects data model (shared vs. copied) |
| Can a Machine have multiple G-Code programs for the same Part? | Affects uniqueness constraints |
| What happens to programs when a Part is deleted? | Affects cascade/orphan strategy |
| Who can create Parts vs. modify them? | Affects permission model |
| What is the lifecycle of a Part–Machine combination? | Affects workflow design |

---

## Part 4: Reading for Invariants

### 4.1 What are Invariants?

Invariants are rules that must **never** be violated, regardless of the operation. They are the non-negotiable truths of your domain.

Types of invariants:
- **Identity invariants**: What makes something unique
- **State invariants**: What must always be true about state
- **Relationship invariants**: What must be true about connections
- **Temporal invariants**: What must be true over time

### 4.2 Finding Invariants in the BRD

Look for these keywords:
- "must", "shall", "always", "never"
- "unique", "only one", "exactly"
- "before", "after", "when"
- "required", "mandatory", "necessary"

**Example from our BRD:**

> "User accounts are created and managed by Administrators only."

Invariants extracted:
1. Only users with Administrator role can create user accounts
2. Only users with Administrator role can modify user accounts
3. Non-administrators cannot self-register

> "Automatic revision creation on change."

Invariants extracted:
1. Every change creates a new revision (never mutate in place)
2. Revisions are immutable once created
3. The revision chain is unbroken (no gaps)

> "Artifact locking during edit."

Invariants extracted:
1. An artifact being edited must have exactly one lock
2. Only the lock holder can save changes
3. A lock prevents other users from editing

### 4.3 Invariant Documentation Template

For each invariant, document:

| Field | Description |
|-------|-------------|
| **ID** | Unique identifier (INV-001) |
| **Statement** | What must always be true |
| **Scope** | Which entities it applies to |
| **Enforcement** | Where/how it is enforced |
| **Violation Consequence** | What breaks if violated |
| **Example** | Concrete scenario |

**Example:**

```
ID: INV-001
Statement: Each Part must have a unique part number across all Parts in the system.
Scope: Part entity
Enforcement: 
  - Database: UNIQUE constraint on part_number column
  - Application: Validation before insert
Violation Consequence: 
  - Duplicate parts cause data corruption
  - Relationships become ambiguous
  - Reports become unreliable
Example:
  - Part A with number "PN-12345" exists
  - Attempt to create Part B with number "PN-12345"
  - System must reject with "Part number already exists"
```

---

## Part 5: Reading for Change

### 5.1 The Change Scenario Matrix

Requirements change. Products evolve. Good engineering anticipates change by asking: **"What if X changes?"**

For each major entity or requirement, consider:

| Change Type | Question |
|-------------|----------|
| Add field | What if we need to add a new property? |
| Change relationship | What if the connection between X and Y changes? |
| Add entity | What if we need a new type of thing? |
| Change rule | What if this business rule is modified? |
| Scale | What if we have 10x the data? |
| Integrate | What if we need to connect to external systems? |

### 5.2 Example Change Analysis

From our BRD:

> "The Platform is organized around Parts as the primary unit of work."

**Change scenario: What if we need to support Assemblies (parts made of other parts)?**

| Aspect | Current Design | After Change |
|--------|----------------|--------------|
| Part entity | Standalone | Can have parent_part_id |
| Part queries | Simple | Recursive (tree traversal) |
| Deletion | Direct | Must handle children |
| Display | Flat list | Hierarchical tree |

**Engineering implication**: Design Part entity with potential for hierarchy. Even if not implemented now, avoid decisions that prevent it later.

### 5.3 Common Changes to Anticipate

| Domain | Likely Changes |
|--------|----------------|
| Users | New roles, permission changes, external auth |
| Entities | New fields, new types, new relationships |
| Workflows | New statuses, new approval levels, exceptions |
| Integration | Export formats, external systems, APIs |
| Scale | More users, more data, faster response times |

---

## Part 6: Reading for Error Cases

### 6.1 The BRD Doesn't Mention Errors

Requirements documents describe what should happen. They rarely describe what happens when things go wrong.

**The engineer must infer failure modes from success paths.**

### 6.2 Error Categories

| Category | Example | Typical Handling |
|----------|---------|------------------|
| **User error** | Invalid input | Validation message |
| **Business rule violation** | Duplicate part number | Rejection with reason |
| **Authorization failure** | User lacks permission | Access denied response |
| **Data integrity** | Referenced entity doesn't exist | Prevent operation |
| **Infrastructure** | Database unavailable | Retry or degrade gracefully |
| **Programmer error** | Null reference | Crash (to prevent corruption) |

### 6.3 Extracting Error Cases from Requirements

For each requirement, ask: **"What could prevent this from succeeding?"**

**Requirement:**
> "Import of CAM data (e.g., Mastercam XML)"

**Error cases to handle:**
1. File is not valid XML → Parse error
2. XML is valid but schema is unrecognized → Schema error
3. Referenced Tool doesn't exist in system → Reference error
4. CAM data violates naming conventions → Validation error
5. User doesn't have import permission → Authorization error
6. Part–Machine already has CAM data → Conflict error
7. File is too large → Resource error
8. Import interrupted mid-way → Transaction error

**Each of these needs a design decision for handling.**

---

## Part 7: The Complete Analysis Framework

### 7.1 Summary Checklist

For every section of requirements, produce:

| Output | Description |
|--------|-------------|
| **Entity List** | All nouns that represent things with identity |
| **Operation List** | All verbs that represent actions |
| **Relationship Map** | How entities connect |
| **Invariant List** | Rules that must never be violated |
| **Question List** | What needs clarification |
| **Change Scenarios** | What might change and how it affects design |
| **Error Cases** | What can go wrong |

### 7.2 Template for Requirements Analysis

```markdown
# Requirements Analysis: [Section Name]

## Raw Requirement
[Quote the requirement text]

## Entities Identified
- Entity 1: [description, identity]
- Entity 2: [description, identity]

## Operations Identified
- Operation 1: [who, what, constraints]
- Operation 2: [who, what, constraints]

## Relationships
- Entity A relates to Entity B by [relationship type]

## Invariants
- INV-XX: [statement]

## Questions
1. [question requiring clarification]

## Change Scenarios
- What if [change]? → [impact]

## Error Cases
- [scenario] → [handling]
```

---

## Exercises

### Exercise 1: Entity Extraction

Read this requirement and list all entities:

> "The Platform shall track Tooling data including cutting tools, tool holders, and tool assemblies. Each tool has a manufacturer, a tool type, and dimensional specifications. Tool assemblies combine a holder with one or more cutting tools. Tools may be shared across multiple Parts."

<details>
<summary>Hints</summary>

- Look for nouns that represent "things" with identity
- "Tool assemblies" suggests a composite entity
- "shared across multiple Parts" implies a relationship

</details>

<details>
<summary>Solution</summary>

**Entities:**
| Entity | Identity | Properties |
|--------|----------|------------|
| Cutting Tool | Tool ID | manufacturer, tool type, dimensions |
| Tool Holder | Holder ID | manufacturer, type, dimensions |
| Tool Assembly | Assembly ID | holder_id, list of cutting tools |
| Part | Part ID | (referenced) |

**Relationships:**
- Tool Assembly contains one Tool Holder
- Tool Assembly contains many Cutting Tools
- Cutting Tool can belong to many Parts (many-to-many)

**Invariant:**
- A Tool Assembly must have exactly one Tool Holder
- A Tool Assembly must have at least one Cutting Tool

</details>

---

### Exercise 2: Invariant Discovery

Read this requirement and identify invariants:

> "Role-based approval chains. Programs must be approved by a Manufacturing Engineer before release to the shop floor. Proven programs may skip re-approval for minor changes only."

<details>
<summary>Hints</summary>

- Look for words like "must", "before", "only"
- What makes a program "proven"?
- What is a "minor" change?

</details>

<details>
<summary>Solution</summary>

**Invariants identified:**

1. **INV-APPR-001**: A program cannot transition to "Released" status without approval from a user with Manufacturing Engineer role.

2. **INV-APPR-002**: Only programs with status "Proven" can skip approval for minor changes.

3. **INV-APPR-003**: Major changes to any program require full approval regardless of proven status.

**Questions raised:**

1. What defines a "Manufacturing Engineer" role? Is it a single role or a capability?
2. What distinguishes a "minor" change from a "major" change?
3. How does a program become "Proven"?
4. Can "Proven" status be revoked?
5. What if a program is partially approved when requirements change?

</details>

---

### Exercise 3: Change Scenario Analysis

Given this requirement:

> "Machines have definitions including capabilities, controller type, and work envelope. Programs are associated with approved machines."

Write three change scenarios and their impacts.

<details>
<summary>Hints</summary>

- What if we need to track machine maintenance?
- What if a machine is decommissioned?
- What if capabilities change?

</details>

<details>
<summary>Solution</summary>

**Change Scenario 1: Machine Decommissioning**

| Aspect | Current | After Change |
|--------|---------|--------------|
| Machine entity | Active/deleted | Status field (active, decommissioned) |
| Program queries | All machines | Filter by status |
| Historical data | Orphaned if deleted | Preserved with status |
| New programs | Can target any machine | Cannot target decommissioned |

**Change Scenario 2: Machine Capability Changes**

| Aspect | Current | After Change |
|--------|---------|--------------|
| Capabilities | Static | Versioned (capability history) |
| Program compatibility | Simple check | Check against capability version |
| Validation | At creation time | Re-validate periodically |

**Change Scenario 3: Multi-Location Support**

| Aspect | Current | After Change |
|--------|---------|--------------|
| Machine entity | No location | location_id field |
| Program assignment | Machine only | Machine + location check |
| Reporting | Global | By location |

</details>

---

### Exercise 4: Error Case Identification

Given this requirement:

> "Artifact locking during edit. Conflict prevention. Visibility into who is editing what. Administrative override for stale or abandoned check-outs."

List five error cases and how they should be handled.

<details>
<summary>Hints</summary>

- What if someone requests a lock that already exists?
- What if the lock holder goes offline?
- What if an admin override is abused?

</details>

<details>
<summary>Solution</summary>

| Error Case | Scenario | Handling |
|------------|----------|----------|
| Lock conflict | User A requests lock on artifact already locked by User B | Reject with message: "Locked by [User B] since [timestamp]" |
| Self-lock | User A tries to lock artifact they already locked | No-op (return existing lock) |
| Lock on non-existent | User requests lock on deleted artifact | Return error: "Artifact not found" |
| Stale lock timeout | Lock older than threshold (e.g., 24 hours) | Mark as stale, eligible for override |
| Override without audit | Admin forces release without documentation | Require comment, log with full context |
| Lock release mismatch | User A tries to release lock held by User B | Reject unless admin with override permission |

</details>

---

## Summary

### Key Takeaways

| Skill | What You Learned |
|-------|------------------|
| **Five-pass reading** | Nouns → Verbs → Adjectives → Relationships → Questions |
| **Domain extraction** | Entities, relationships, invariants from text |
| **Invariant discovery** | Rules that must never be violated |
| **Change anticipation** | "What if X changes?" thinking |
| **Error identification** | Inferring failure modes from success paths |

### The Engineer's Reading Checklist

Before accepting any requirement as "understood":

- [ ] Identified all entities (nouns)
- [ ] Identified all operations (verbs)
- [ ] Mapped relationships between entities
- [ ] Extracted invariants ("must", "always", "never")
- [ ] Listed questions for clarification
- [ ] Analyzed change scenarios
- [ ] Identified error cases

---

## Next Tutorial

[Tutorial 3: Thinking in Systems →](./03-thinking-in-systems.md)
