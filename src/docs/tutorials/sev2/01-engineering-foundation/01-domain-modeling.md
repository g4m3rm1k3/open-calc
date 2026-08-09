# Tutorial 1: Domain Modeling

## Introduction

Domain modeling is the process of understanding and describing the **"things"** (entities) in your system, their **properties**, and how they **relate to each other**. This is the foundation of all software design.

A domain model is:
- **Not** a database schema (though it influences one)
- **Not** a class diagram (though it guides one)
- **Not** an ER diagram (though it resembles one)

A domain model is a **shared understanding** of what the system is about.

> **Before you can build a system, you must understand what it represents.**

---

## Part 1: Why Domain Modeling Comes First

### 1.1 Code Reflects Understanding

Consider two developers building Part management:

**Developer A (no domain model):**
- Jumps into coding
- Creates tables as needed
- Adds columns when problems arise
- Ends up with inconsistent naming, missing relationships

**Developer B (domain model first):**
- Studies the domain
- Identifies entities and relationships
- Defines identity and invariants
- Writes code that reflects the model

Developer B's code is:
- More consistent
- Easier to understand
- More resilient to change

### 1.2 The Map Before the Journey

You wouldn't drive across the country without a map. Domain modeling is your map:

| Journey Stage | Domain Modeling Equivalent |
|---------------|---------------------------|
| Origin | Current understanding |
| Destination | Complete system |
| Landmarks | Key entities |
| Roads | Relationships |
| Constraints | Invariants |

---

## Part 2: Entity Identification

### 2.1 What is an Entity?

An **entity** is something with:
- **Identity**: A way to distinguish it from other entities
- **Lifecycle**: It is created, exists, and may be deleted
- **Continuity**: It persists over time, even if properties change

Compare:
| Concept | Is Entity? | Why |
|---------|------------|-----|
| Part | Yes | Has part number, persists, can change |
| Money amount | No | $10 is $10, no identity |
| Machine | Yes | Has ID, persists, has state |
| Timestamp | No | Value, not identity |

### 2.2 Extracting Entities from the BRD

From our Manufacturing Platform BRD:

> "The Platform shall manage the following artifact types as first-class entities: Parts, Part–Machine combinations, Fixtures, Tools, Machines, CAM files, G-code programs, Inspection records."

**Entities identified:**

| Entity | Identity (what makes it unique) |
|--------|--------------------------------|
| Part | Part number |
| Machine | Machine ID |
| Tool | Tool number |
| Fixture | Fixture ID |
| CAM File | File ID |
| G-Code Program | Program ID |
| Inspection Record | Record ID |
| Part–Machine | (Part ID, Machine ID) pair |

### 2.3 The Part–Machine Combination

This deserves special attention. The BRD says:

> "Part–Machine combinations (unique execution context)"

This means:
- A Part by itself is one thing
- A Machine by itself is another thing
- A Part **on** a Machine is a **third thing** with its own identity

This is called an **association entity** or **join entity**. It represents the relationship as an entity.

```
Part ──────────┐
               │
               ├──────▶ PartMachine (has its own properties)
               │
Machine ───────┘
```

Why is this important?
- A Part might have different operations on different Machines
- CAM files are specific to a Part–Machine combination
- G-Code is specific to a Part–Machine combination

---

## Part 3: Value Objects

### 3.1 What is a Value Object?

A **value object** is something defined entirely by its properties. Two value objects with the same properties are interchangeable.

| Concept | Type | Why |
|---------|------|-----|
| Part Number "PN-12345" | Value Object | The string itself is the value |
| Email address | Value Object | Defined by the string |
| Dimension (10.5 mm) | Value Object | Number + unit |
| Money ($100 USD) | Value Object | Amount + currency |
| Part entity | Entity | Has identity beyond its properties |

### 3.2 Value Objects in PartFlow

| Value Object | Properties | Where Used |
|--------------|------------|------------|
| PartNumber | string, format (XX-NNNNN) | Part entity |
| MachineId | string, format (MCH-NNN) | Machine entity |
| ToolNumber | string, format (T1, T2, ...) | Tool entity |
| Revision | major (int), minor (int) | All entities |
| Dimension | value (float), unit (mm/inch) | Part, Tool entities |

### 3.3 Why Distinguish Entities from Value Objects?

The distinction matters for:

| Concern | Entity | Value Object |
|---------|--------|--------------|
| Equality | Compare by ID | Compare by properties |
| Storage | Has own table | Embedded in parent |
| Lifecycle | Independent | Lives with parent |
| Mutability | Can change over time | Immutable (replace, don't mutate) |

---

## Part 4: Relationships

### 4.1 Types of Relationships

| Relationship | Meaning | Example |
|--------------|---------|---------|
| One-to-One | Each A has exactly one B | Part has one CurrentRevision |
| One-to-Many | Each A has many B's | Machine has many Programs |
| Many-to-Many | Each A has many B's and vice versa | Tools used in many Parts |

### 4.2 PartFlow Relationships

Let's map the relationships from the BRD:

**Part Relationships:**
```
Part (1) ─────────────── (N) PartMachine
  │
  └─── "A Part can be manufactured on many Machines"
```

**PartMachine Relationships:**
```
PartMachine (1) ─────────── (N) CAMFile
     │
     └─── "A PartMachine execution context has many CAM files"

PartMachine (1) ─────────── (N) GCodeProgram
     │
     └─── "A PartMachine has many related G-Code programs"
```

**Machine Relationships:**
```
Machine (1) ─────────────── (N) PartMachine
     │
     └─── "A Machine handles many Parts"

Machine (1) ─────────────── (N) Tool (available)
     │
     └─── "A Machine has many available tools"
```

**Tool Relationships:**
```
Tool (N) ─────────────── (N) PartMachine (used in)
     │
     └─── "Tools can be used in many PartMachine contexts"
```

### 4.3 Relationship Diagram

Here's the complete relationship map:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOMAIN MODEL                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         ┌─────────┐                             │
│                         │  User   │                             │
│                         └────┬────┘                             │
│                              │ creates/modifies                 │
│                              ▼                                  │
│    ┌────────┐          ┌─────────┐          ┌─────────┐        │
│    │  Part  │─────────▶│PartMach │◀─────────│ Machine │        │
│    └────────┘  1:N     └────┬────┘    N:1   └────┬────┘        │
│                             │                    │              │
│                    ┌────────┴────────┐          │              │
│                    │                 │          │              │
│               1:N  ▼            1:N  ▼          │ 1:N          │
│           ┌──────────┐      ┌──────────┐       ▼              │
│           │ CAMFile  │      │ Program  │  ┌─────────┐         │
│           └──────────┘      └────┬─────┘  │  Tool   │         │
│                                  │        └────┬────┘         │
│                             1:N  ▼             │              │
│                          ┌────────────┐        │              │
│                          │ Inspection │        │              │
│                          └────────────┘        │              │
│                                                │              │
│    ◀───────── used in PartMachine ─────────────┘              │
│    (via ToolUsage join entity)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 5: Identity Rules

### 5.1 What Makes Two Things "The Same"?

Identity is crucial. If two Part records have the same part_number, are they:
- The same Part (duplicate record)?
- Different Parts (data error)?
- Different versions of the same Part (revision)?

### 5.2 Identity Rules for PartFlow

| Entity | Identity Rule | Explanation |
|--------|--------------|-------------|
| Part | Unique by part_number | No two Parts can have the same number |
| Machine | Unique by machine_id | No two Machines can have the same ID |
| Tool | Unique by tool_number | No two Tools can have the same number |
| PartMachine | Unique by (part_id, machine_id) | One combination per pair |
| CAMFile | Unique by file_id | Globally unique |
| GCodeProgram | Unique by program_id | Globally unique |
| User | Unique by username | No duplicate usernames |

### 5.3 Natural vs. Surrogate Keys

| Key Type | Example | Pros | Cons |
|----------|---------|------|------|
| Natural | part_number = "PN-12345" | Meaningful, user-visible | Can change, format constraints |
| Surrogate | id = UUID or auto-increment | Never changes, consistent | Meaningless to users |

**Our decision for PartFlow:**

Use **both**:
- Surrogate key (`id`) for internal relationships
- Natural key (`part_number`) for user-facing identity, with unique constraint

```
Part {
    id: UUID                  # Internal, never shown
    part_number: PartNumber   # User-visible, unique
    ...
}
```

---

## Part 6: Building the Domain Model Document

### 6.1 Domain Model Template

```markdown
# Domain Model: [System Name]

## Entities

### [Entity Name]
**Identity**: How is this uniquely identified?
**Properties**:
- property1: type (description)
- property2: type (description)

**Relationships**:
- has many [Related Entity]
- belongs to [Parent Entity]

**Invariants**:
- Rule that must always be true

---

## Value Objects

### [Value Object Name]
**Properties**:
- property1: type

**Validation**:
- Format requirements, constraints

---

## Relationships

[Diagram or description]
```

### 6.2 PartFlow Domain Model

Let's create the domain model for our Manufacturing Platform:

```markdown
# Domain Model: PartFlow Manufacturing Platform

## Entities

### Part
**Identity**: Unique by `part_number`

**Properties**:
- id: UUID (internal identifier)
- part_number: PartNumber (user-visible, format: XX-NNNNN)
- name: string (descriptive name)
- description: text (optional)
- revision: Revision (current major.minor version)
- status: PartStatus (draft, active, obsolete)
- created_at: timestamp
- updated_at: timestamp
- created_by: User reference

**Relationships**:
- has many PartMachine
- has many Revisions (historical)

**Invariants**:
- part_number must be unique across all Parts
- part_number cannot change after creation
- revision must be monotonically increasing

---

### Machine
**Identity**: Unique by `machine_id`

**Properties**:
- id: UUID (internal identifier)
- machine_id: MachineId (user-visible, format: MCH-NNN)
- name: string (display name)
- controller_type: ControllerType (fanuc, siemens, haas, etc.)
- status: MachineStatus (active, maintenance, decommissioned)
- work_envelope: WorkEnvelope (X, Y, Z dimensions)
- created_at: timestamp

**Relationships**:
- has many PartMachine
- has many Tool (available tools)

**Invariants**:
- machine_id must be unique
- decommissioned machines cannot accept new programs

---

### PartMachine
**Identity**: Unique by `(part_id, machine_id)`

**Properties**:
- id: UUID (internal identifier)
- part_id: Part reference
- machine_id: Machine reference
- status: PartMachineStatus (setup, proven, production)
- created_at: timestamp

**Relationships**:
- belongs to Part
- belongs to Machine
- has many CAMFile
- has many GCodeProgram
- has many ToolUsage

**Invariants**:
- Cannot create duplicate (part, machine) pairs
- Status transitions must follow workflow

---

### GCodeProgram
**Identity**: Unique by `program_id`

**Properties**:
- id: UUID (internal identifier)
- program_id: ProgramId (e.g., O1234)
- part_machine_id: PartMachine reference
- content: text (G-code content)
- revision: Revision
- status: ProgramStatus (draft, pending_approval, approved, released, obsolete)
- is_proven: boolean

**Relationships**:
- belongs to PartMachine
- has many Inspection

**Invariants**:
- Released programs are immutable
- Proven programs require documented evidence

---

### Tool
**Identity**: Unique by `tool_number`

**Properties**:
- id: UUID (internal identifier)
- tool_number: ToolNumber (T1, T2, ...)
- description: string
- manufacturer: string
- category: ToolCategory (drill, endmill, etc.)

**Relationships**:
- available on many Machines
- used by many PartMachine (via ToolUsage)

---

### User
**Identity**: Unique by `username`

**Properties**:
- id: UUID
- username: string
- password_hash: string (never expose)
- role: Role (admin, engineer, programmer, operator, viewer)
- created_at: timestamp

**Invariants**:
- Users can only be created by admins
- Password must meet security requirements

---

## Value Objects

### PartNumber
**Format**: XX-NNNNN (2 letters, hyphen, 5 digits)
**Examples**: PN-12345, AB-00001
**Validation**: Must match regex ^[A-Z]{2}-[0-9]{5}$

### Revision
**Properties**: major (int), minor (int)
**Format**: Displayed as "major.minor" (e.g., 1.3)
**Rules**: 
- Minor increments for small changes
- Major increments for significant changes
- Cannot decrease

### ControllerType
**Values**: fanuc, siemens, haas, mazak, okuma
**Purpose**: Determines G-code dialect

---

## Relationship Summary

| From | Relationship | To |
|------|--------------|-----|
| Part | 1:N | PartMachine |
| Machine | 1:N | PartMachine |
| PartMachine | 1:N | CAMFile |
| PartMachine | 1:N | GCodeProgram |
| PartMachine | N:N | Tool (via ToolUsage) |
| GCodeProgram | 1:N | Inspection |
| User | 1:N | Part (created_by) |
```

---

## Part 7: Exercises

### Exercise 1: Identify Missing Entities

The domain model above is incomplete. What entities are missing based on the BRD?

<details>
<summary>Hints</summary>

- Look at sections 4.3, 4.6, 4.14 of the BRD
- What about Fixtures?
- What about CAM files?
- What about Inspection Records?

</details>

<details>
<summary>Solution</summary>

**Missing entities:**

1. **Fixture**
   - Identity: fixture_id
   - Used in PartMachine setups
   - Has dimensions, description

2. **CAMFile**
   - Identity: file_id
   - Belongs to PartMachine
   - Contains parsed CAM data

3. **Inspection** (partially mentioned but not detailed)
   - Identity: inspection_id
   - Belongs to GCodeProgram run
   - Contains pass/fail, measurements

4. **ToolUsage** (join entity)
   - Links Tool to PartMachine
   - Has properties: position, offset values

5. **Revision** (as entity, not just value object)
   - Historical record of entity state
   - Immutable snapshot

</details>

---

### Exercise 2: Define Relationships

Given this requirement:

> "Tool assemblies combine a holder with one or more cutting tools."

Draw the relationship diagram and identify:
- What entities are involved
- What type of relationship exists
- Whether any join entities are needed

<details>
<summary>Hints</summary>

- Is "ToolAssembly" a separate entity?
- What's the relationship between Holder and CuttingTool?
- Can a CuttingTool be in multiple assemblies?

</details>

<details>
<summary>Solution</summary>

**Entities:**
- ToolHolder (identity: holder_id)
- CuttingTool (identity: tool_id)
- ToolAssembly (identity: assembly_id)

**Relationships:**
```
ToolAssembly (1) ─────────── (1) ToolHolder
      │
      │  "An assembly has exactly one holder"
      │
      └────────── (N) CuttingTool
         
         "An assembly has one or more cutting tools"
```

**Join entity needed?** 
Yes, if cutting tools have different positions/offsets in the assembly:

```
ToolAssembly (1) ──── (N) AssemblyPosition ──── (1) CuttingTool
                           │
                           └── position: int
                               offset: float
```

**Invariant:**
- A ToolAssembly must have exactly one ToolHolder
- A ToolAssembly must have at least one CuttingTool

</details>

---

### Exercise 3: Identity Rule Decision

For the "GCodeProgram" entity, should we use:
A) The program number (O1234) as the identity
B) A surrogate UUID as the identity
C) Both

Justify your answer with trade-offs.

<details>
<summary>Hints</summary>

- Can two programs have the same O-number?
- What if we need to track multiple revisions of O1234?
- What do users expect to see?

</details>

<details>
<summary>Solution</summary>

**Answer: C) Both**

**Rationale:**

| Approach | Pros | Cons |
|----------|------|------|
| O-number only | User-meaningful | O-numbers repeat across parts; multiple revisions have same O-number |
| UUID only | Unique, stable | Users work with O-numbers, not UUIDs |
| Both | Best of both | Slight complexity |

**Implementation:**
```
GCodeProgram {
    id: UUID              # Internal, never changes
    program_number: "O1234"  # User-visible
    part_machine_id: UUID    # Context
    revision: Revision       # Version
    
    # Unique constraint: (part_machine_id, program_number, revision)
}
```

**Trade-off accepted:**
- More complex uniqueness rule
- Benefit: O-number meaningful + revisions trackable + internal ID stable

</details>

---

### Exercise 4: Create Your Own Entity

Define an entity for **Approval** based on this requirement:

> "Role-based approval chains. Programs must be approved by a Manufacturing Engineer before release to the shop floor."

Include: identity, properties, relationships, invariants.

<details>
<summary>Hints</summary>

- What's being approved?
- Who approves it?
- When does approval happen?
- What's the result?

</details>

<details>
<summary>Solution</summary>

```markdown
### Approval
**Identity**: Unique by `approval_id`

**Properties**:
- id: UUID (internal)
- approval_id: string (APR-YYYYMMDD-NNNN)
- subject_type: enum (program, part_machine, etc.)
- subject_id: UUID (what is being approved)
- requested_by: User reference
- requested_at: timestamp
- approved_by: User reference (nullable until approved)
- approved_at: timestamp (nullable)
- status: ApprovalStatus (pending, approved, rejected, expired)
- comments: text

**Relationships**:
- belongs to User (requested_by)
- belongs to User (approved_by)
- belongs to GCodeProgram (or other subject)

**Invariants**:
- approved_by must have role: Manufacturing Engineer (or higher)
- approved_at cannot be before requested_at
- Once approved, cannot be revoked
- Expired approvals cannot be approved
```

</details>

---

## Summary

### Key Takeaways

| Concept | What It Means |
|---------|---------------|
| **Entity** | Something with identity that persists |
| **Value Object** | Something defined by properties, no identity |
| **Relationship** | How entities connect (1:1, 1:N, N:N) |
| **Identity Rule** | What makes two entities "the same" |
| **Domain Model** | Living document describing system concepts |

### Domain Modeling Checklist

Before coding any entity:

- [ ] Identified what makes it unique (identity)
- [ ] Listed its properties with types
- [ ] Mapped relationships to other entities
- [ ] Distinguished entities from value objects
- [ ] Documented invariants (rules that must hold)

---

## Next Tutorial

[Tutorial 2: Invariants and Business Rules →](./02-invariants.md)
