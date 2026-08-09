# Tutorial 3: Thinking in Systems

## Introduction

A **system** is more than its parts. When you write a function, you're programming. When you design how functions, modules, and components interact, you're thinking in systems.

Systems thinking is the ability to see:
- **Connections** between components, not just the components themselves
- **Flows** of data and control through the system
- **Feedback loops** where outputs affect inputs
- **Emergent behavior** that arises from interactions
- **Boundaries** that define what's inside and outside

This tutorial teaches you to see software as a system of interacting parts.

---

## Part 1: What is a System?

### 1.1 Definition

A system is:
- A set of **components** (parts)
- Connected by **relationships** (how they interact)
- Working toward a **purpose** (what it achieves)
- With **boundaries** (what's inside vs. outside)

### 1.2 Software as a System

Software is a system where:

| System Element | Software Equivalent |
|----------------|---------------------|
| Components | Modules, classes, functions |
| Relationships | Function calls, data flow, dependencies |
| Purpose | User value, business outcomes |
| Boundaries | APIs, interfaces, module boundaries |
| Environment | Users, external systems, infrastructure |

### 1.3 Why Systems Thinking Matters

Without systems thinking, you see this:

```
Function A calls Function B
Function B calls Function C
```

With systems thinking, you see:

```
Module X provides Service P
Module Y depends on Service P
Changes to P affect Y
Y's requirements constrain P's evolution
```

**The difference is seeing consequences, not just connections.**

---

## Part 2: Components and Boundaries

### 2.1 What is a Component?

A component is a unit of software that:
- Has a **single responsibility** (what it does)
- Exposes a **public interface** (how others use it)
- Hides **implementation details** (how it works inside)
- Has **dependencies** (what it needs to function)

### 2.2 What is a Boundary?

A boundary separates:
- What a component **exposes** (its contract)
- What a component **hides** (its internals)
- Who is **inside** the boundary (has access)
- Who is **outside** the boundary (must use the interface)

### 2.3 Drawing Boundaries

**The most important architectural decision is where to draw boundaries.**

| Boundary Decision | Consequence |
|-------------------|-------------|
| Too few boundaries | Everything depends on everything (Big Ball of Mud) |
| Too many boundaries | Over-engineering, excessive abstraction |
| Wrong boundaries | Changes ripple in unexpected directions |
| Right boundaries | Changes are isolated, system is evolvable |

### 2.4 Example: Part Management

Let's apply this to Part management in our Manufacturing Platform:

**Poor boundary design:**
```
┌─────────────────────────────────────────────────┐
│                  Application                     │
│                                                  │
│  URLs know about database tables                 │
│  Templates contain business logic                │
│  Database schema visible everywhere              │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Good boundary design:**
```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│    Web Layer    │   │  Service Layer  │   │  Domain Layer   │
│                 │   │                 │   │                 │
│ Knows: HTTP     │──▶│ Knows: Use cases│──▶│ Knows: Rules    │
│ Hides: HTML     │   │ Hides: Flow     │   │ Hides: Entities │
│                 │   │                 │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                                                    │
                                                    ▼
                              ┌─────────────────────────────────┐
                              │          Data Layer             │
                              │                                 │
                              │ Knows: Storage                  │
                              │ Hides: SQL, file system         │
                              │                                 │
                              └─────────────────────────────────┘
```

---

## Part 3: Dependencies and Direction

### 3.1 What is a Dependency?

A dependency exists when:
- Component A uses Component B
- Changes to B may require changes to A
- A cannot work without B

### 3.2 Dependency Direction

Dependencies have direction. The direction determines:
- What can change without breaking things
- What is stable vs. volatile
- Where complexity accumulates

**The Dependency Rule**: Dependencies should point toward stability.

```
Unstable (changes often) ──────▶ Stable (changes rarely)

UI ──────▶ Services ──────▶ Domain ──────▶ Core Libraries
```

### 3.3 Why Direction Matters

| Dependency Direction | Consequence |
|---------------------|-------------|
| Stable depends on unstable | Core breaks when UI changes |
| Unstable depends on stable | UI can change freely |
| Circular dependencies | Everything breaks when anything changes |

### 3.4 Example: Part Entity

**Wrong direction (Domain depends on Database):**

```python
# domain/part.py
import sqlite3  # WRONG: Domain knows about database

class Part:
    def save(self):
        conn = sqlite3.connect('parts.db')
        conn.execute("INSERT INTO parts ...")  # WRONG: SQL in domain
```

**Right direction (Database depends on Domain):**

```python
# domain/part.py
class Part:
    # No database knowledge
    pass

# repository/part_repository.py
from domain.part import Part  # RIGHT: Repository knows Domain

class PartRepository:
    def save(self, part: Part):
        # Database logic here
        pass
```

### 3.5 The Dependency Inversion Principle

High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Before inversion:**
```
PartService ──────▶ SQLitePartRepository
                    (concrete implementation)
```

**After inversion:**
```
PartService ──────▶ PartRepositoryInterface ◀────── SQLitePartRepository
                    (abstraction)                   (concrete implementation)
```

Now PartService depends on an interface, not a specific database.

---

## Part 4: Data Flow

### 4.1 Following the Data

To understand a system, trace how data flows through it:

1. Where does data **enter** the system? (inputs)
2. How is data **transformed**? (processing)
3. Where does data **exit** the system? (outputs)
4. Where is data **stored**? (persistence)

### 4.2 Example: Creating a Part

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│   User     │────▶│   Form     │────▶│   API      │────▶│  Service   │
│   Action   │     │   Data     │     │  Request   │     │  Method    │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
                                                               │
     ┌─────────────────────────────────────────────────────────┘
     ▼
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│  Domain    │────▶│ Repository │────▶│  Database  │────▶│  Response  │
│  Entity    │     │   Save     │     │   Row      │     │  to User   │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
```

### 4.3 Data Transformation Points

At each boundary, data changes form:

| Boundary | Input Form | Output Form |
|----------|------------|-------------|
| UI → API | Form data (strings) | Request object |
| API → Service | Request object | Domain entity |
| Service → Repository | Domain entity | Database row |
| Repository → Database | Database row | SQL statement |

### 4.4 Why Transformation Matters

Each transformation is a:
- **Validation opportunity** (reject bad data early)
- **Conversion point** (change representation)
- **Security boundary** (sanitize, authorize)
- **Error handling location** (respond appropriately)

---

## Part 5: Feedback Loops

### 5.1 What is a Feedback Loop?

A feedback loop exists when:
- Output from one part of the system affects input to another
- The effect can be **positive** (amplifying) or **negative** (stabilizing)

### 5.2 Examples in Software

**Positive feedback (can be dangerous):**
- Error → Retry → More load → More errors → More retries
- Cache miss → Database query → Slow response → User refresh → More queries

**Negative feedback (stabilizing):**
- High load → Rate limiting → Reduced load
- Error rate increase → Circuit breaker opens → Errors stop propagating

### 5.3 Designing for Feedback

| Scenario | Without Feedback Control | With Feedback Control |
|----------|--------------------------|----------------------|
| Database overwhelmed | Keep trying until crash | Back off exponentially |
| User spamming submit | Process all requests | Deduplicate, rate limit |
| External API down | Wait forever | Timeout, circuit breaker |

---

## Part 6: Emergent Behavior

### 6.1 What is Emergence?

Emergent behavior is system behavior that:
- Cannot be predicted from individual components
- Arises from **interactions** between components
- Often appears only under certain conditions (load, data patterns)

### 6.2 Examples

| Individual Behavior | Emergent Behavior |
|--------------------|-------------------|
| Each user saves normally | Two users save simultaneously → data corruption |
| Each query is fast | Many queries combined → N+1 problem → slowness |
| Each module logs | All modules log → disk fills up → crash |
| Each cache works | Multiple caches → stale data inconsistency |

### 6.3 Thinking About Emergence

For every design decision, ask:
- What happens when there are **many** of these?
- What happens when these happen **simultaneously**?
- What happens when these happen **in sequence**?
- What happens when these **interact with other systems**?

---

## Part 7: Applying Systems Thinking to PartFlow

### 7.1 The PartFlow System

Let's model our Manufacturing Platform as a system:

**Components:**
```
┌──────────────────────────────────────────────────────────────────┐
│                        PartFlow System                            │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   Web UI    │  │    API      │  │  Services   │               │
│  │             │  │             │  │             │               │
│  │ - Views     │  │ - Routes    │  │ - PartSvc   │               │
│  │ - Forms     │  │ - Handlers  │  │ - MachineSvc│               │
│  │             │  │             │  │ - ProgramSvc│               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │
│         │                │                │                       │
│         └────────────────┼────────────────┘                       │
│                          ▼                                        │
│                  ┌─────────────┐                                  │
│                  │   Domain    │                                  │
│                  │             │                                  │
│                  │ - Part      │                                  │
│                  │ - Machine   │                                  │
│                  │ - Program   │                                  │
│                  └──────┬──────┘                                  │
│                         ▼                                         │
│                  ┌─────────────┐                                  │
│                  │ Persistence │                                  │
│                  │             │                                  │
│                  │ - Repos     │                                  │
│                  │ - Database  │                                  │
│                  └─────────────┘                                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Boundaries:**
1. **Web ↔ API**: HTTP boundary (requests/responses)
2. **API ↔ Services**: Function call boundary (use cases)
3. **Services ↔ Domain**: Entity boundary (business rules)
4. **Domain ↔ Persistence**: Abstraction boundary (data access)

**Dependencies (all pointing downward):**
- Web depends on API
- API depends on Services
- Services depend on Domain
- Domain defines interfaces, Persistence implements them

### 7.2 Data Flow Through PartFlow

**Creating a Part:**
```
User input (form)
  │
  ▼
HTTP POST /parts
  │
  ▼
PartController.create(request)
  │
  ├─ Validate request format
  │
  ▼
PartService.create_part(data)
  │
  ├─ Validate business rules
  ├─ Create Part entity
  │
  ▼
PartRepository.save(part)
  │
  ├─ Convert to database row
  ├─ Execute INSERT
  │
  ▼
Return Part (with ID)
  │
  ▼
HTTP 201 Created (JSON)
  │
  ▼
UI update (show new part)
```

### 7.3 Potential Emergent Behaviors

| Scenario | Components Involved | Emergent Risk |
|----------|---------------------|---------------|
| Two users create same part number | Validation, Repository | Duplicate key error |
| User edits while another views | Service, Repository | Stale data shown |
| Large CAM file import | Parser, Repository, Database | Memory exhaustion |
| Approval chain with absent approver | Workflow, Notifications | Process blocked |

---

## Part 8: Systems Thinking Exercises

### Exercise 1: Draw the Boundaries

Given this description, draw a component diagram with boundaries:

> "The application has a web interface where users browse parts. The API handles authentication and routes requests to services. Services apply business rules and use repositories to access the database. Parts have revisions stored in a separate table."

<details>
<summary>Hints</summary>

- Identify each layer mentioned
- Draw boundaries between layers
- Show which direction dependencies point
- Consider: where does authentication happen?

</details>

<details>
<summary>Solution</summary>

```
┌────────────────────────────────────────────────────────┐
│                    Web Layer                            │
│  ┌─────────────┐                                       │
│  │   Views     │ Renders HTML, handles user input      │
│  └─────────────┘                                       │
└───────────┬────────────────────────────────────────────┘
            │ HTTP (boundary)
            ▼
┌────────────────────────────────────────────────────────┐
│                    API Layer                            │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │ Auth Guard  │  │   Routes    │                      │
│  └─────────────┘  └─────────────┘                      │
└───────────┬────────────────────────────────────────────┘
            │ Function calls (boundary)
            ▼
┌────────────────────────────────────────────────────────┐
│                   Service Layer                         │
│  ┌─────────────┐                                       │
│  │ PartService │ Business rules                        │
│  └─────────────┘                                       │
└───────────┬────────────────────────────────────────────┘
            │ Domain abstraction (boundary)
            ▼
┌────────────────────────────────────────────────────────┐
│                   Domain Layer                          │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │    Part     │  │  Revision   │                      │
│  └─────────────┘  └─────────────┘                      │
└───────────┬────────────────────────────────────────────┘
            │ Repository interface (boundary)
            ▼
┌────────────────────────────────────────────────────────┐
│                 Persistence Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │PartRepo     │  │RevisionRepo │  │  Database   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└────────────────────────────────────────────────────────┘
```

</details>

---

### Exercise 2: Trace the Data Flow

Trace the data flow for this scenario:

> "A Manufacturing Engineer approves a G-code program for release to the shop floor."

Describe what data transformations occur at each boundary.

<details>
<summary>Hints</summary>

- What does the user click/submit?
- What does the API receive?
- What does the workflow service do?
- What state changes occur?
- What notifications are sent?

</details>

<details>
<summary>Solution</summary>

```
User Action: Click "Approve" button
  │
  ├─ Transform: User gesture → Form submission
  ▼
HTTP POST /programs/{id}/approve
  Body: { comments: "Verified on test run" }
  │
  ├─ Transform: HTTP request → Request object
  ▼
ProgramController.approve(id, request)
  │
  ├─ Extract: user_id from auth context
  ├─ Validate: user has Manufacturing Engineer role
  ▼
WorkflowService.approve_program(program_id, user_id, comments)
  │
  ├─ Fetch: current program state
  ├─ Validate: program is in "Pending Approval" state
  ├─ Validate: user is authorized approver
  ├─ Transform: Create ApprovalRecord entity
  ├─ Transform: Update Program status to "Approved"
  ▼
ProgramRepository.save(program)
  │
  ├─ Transform: Program entity → Database UPDATE
  ▼
ApprovalRepository.save(approval_record)
  │
  ├─ Transform: ApprovalRecord → Database INSERT
  ▼
NotificationService.notify_stakeholders(program)
  │
  ├─ Transform: Program → Notification messages
  ├─ Dispatch: Email/push notifications
  ▼
Return: ApprovalResult
  │
  ├─ Transform: Domain result → HTTP 200 OK
  ▼
UI Update: Show "Approved" status with timestamp
```

</details>

---

### Exercise 3: Identify Emergent Behavior

Given this system design, identify three potential emergent behaviors:

> "Users can request program locks. Locks expire after 24 hours. Administrators can force-release locks. Multiple programs can be locked by the same user."

<details>
<summary>Hints</summary>

- What if a user locks many programs and goes on vacation?
- What if two admins try to force-release the same lock?
- What if the lock expires exactly when the user tries to save?

</details>

<details>
<summary>Solution</summary>

**Emergent Behavior 1: Lock Hoarding**
- Individual behavior: User locks programs when starting work
- Emergent result: User locks 50 programs, goes on vacation, blocks entire team for 24 hours
- Mitigation: Limit concurrent locks per user, or shorter expiration

**Emergent Behavior 2: Race Condition on Force-Release**
- Individual behavior: Admin force-releases lock; user saves work
- Emergent result: User saves work exactly as lock is released, overwriting another user's concurrent edit
- Mitigation: Optimistic locking with version numbers

**Emergent Behavior 3: Expiration Mid-Save**
- Individual behavior: Lock expires after 24 hours; user is editing
- Emergent result: User edits for 23 hours 59 minutes, lock expires, save fails
- Mitigation: Lock extension, warning at 23 hours, save draft regularly

</details>

---

## Summary

### Key Takeaways

| Concept | What It Means |
|---------|---------------|
| **Components** | Units with single responsibility and clear interface |
| **Boundaries** | Separations between what's exposed and hidden |
| **Dependencies** | Relationships that create coupling |
| **Dependency direction** | Should point toward stability |
| **Data flow** | How information moves through the system |
| **Feedback loops** | When outputs affect inputs |
| **Emergent behavior** | System behavior not predictable from parts |

### Systems Thinking Checklist

Before designing any feature:

- [ ] Identified all components involved
- [ ] Drew boundaries between components
- [ ] Mapped dependency directions
- [ ] Traced data flow through the system
- [ ] Considered feedback loops
- [ ] Predicted emergent behaviors

---

## Next Tutorial

[Tutorial 4: How Engineers Make Decisions →](./04-decision-making.md)
