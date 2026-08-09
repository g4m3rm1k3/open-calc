# Tutorial 5: Change Impact Analysis

## Introduction

The true test of architecture is **how it handles change**. This tutorial teaches you to analyze:
- What breaks when something changes?
- How to minimize the blast radius of changes
- How to design for resilience

---

## Part 1: Why Change Analysis Matters

### 1.1 Change is Inevitable

Requirements change. Technologies evolve. Bugs are found. Teams grow. Every system experiences change.

The question is not **if** things will change, but **how painful** will change be?

### 1.2 Architecture is Change Management

Good architecture:
- **Isolates change**: Changes to one module don't ripple everywhere
- **Minimizes dependencies**: Fewer connections = fewer things to update
- **Abstracts volatile parts**: Hide what's likely to change behind stable interfaces

---

## Part 2: Change Scenarios for PartFlow

### 2.1 The Change Matrix

For each potential change, we analyze:
1. **What changes?** (the modification)
2. **What's affected?** (directly impacted modules)
3. **What might break?** (potential failures)
4. **How isolated is it?** (blast radius score: 1-5, 1=isolated)

### 2.2 Database Changes

#### Scenario: Switch from SQLite to PostgreSQL

| Aspect | Impact |
|--------|--------|
| **What changes** | Database engine, connection, SQL syntax |
| **What's affected** | Repository implementations, database.py |
| **What might break** | SQL syntax differences, connection handling |
| **Blast radius** | 2 (isolated to Repository layer) |

**Why low impact:**
- Domain layer: No changes (doesn't know about database)
- Service layer: No changes (uses interface)
- Web layer: No changes (uses service)
- Repository layer: Replace implementations

```
┌──────────┐   ┌──────────┐   ┌─────────────────────┐
│   Web    │──▶│ Service  │──▶│ Repository Interface │
└──────────┘   └──────────┘   └──────────┬──────────┘
                                          │
                              ┌───────────┴────────────┐
                              │                        │
                    ┌─────────▼─────────┐   ┌─────────▼─────────┐
                    │ SQLiteRepository  │   │ PostgresRepository │
                    │    (replace)      │   │     (new)          │
                    └───────────────────┘   └───────────────────┘
```

#### Scenario: Add new field to Part (e.g., `weight`)

| Aspect | Impact |
|--------|--------|
| **What changes** | Part entity, database schema, forms, display |
| **What's affected** | Domain/Part, migration, templates, possibly validation |
| **What might break** | Existing queries if NOT NULL without default |
| **Blast radius** | 3 (touches multiple layers but predictable) |

**Change checklist:**
1. Update `domain/entities/part.py` - add `weight` property
2. Create migration script - add column
3. Update `repository/part_repository.py` - include in INSERT/SELECT
4. Update `web/templates/parts/*.html` - display field
5. Update `web/routes/parts.py` - handle form input
6. Update tests

---

### 2.3 Business Rule Changes

#### Scenario: Change Part number format from XX-NNNNN to XXX-NNNNN

| Aspect | Impact |
|--------|--------|
| **What changes** | Validation regex, potentially existing data |
| **What's affected** | PartNumber value object, validation, possibly migration |
| **What might break** | Existing part numbers now invalid? |
| **Blast radius** | 2 (isolated to Domain + migration decision) |

**Key decision:** Do existing part numbers grandfather in, or must they migrate?

**If grandfathered:**
```python
# domain/value_objects/part_number.py
class PartNumber:
    LEGACY_PATTERN = r'^[A-Z]{2}-[0-9]{5}$'
    NEW_PATTERN = r'^[A-Z]{3}-[0-9]{5}$'
    
    @classmethod
    def is_valid(cls, value: str) -> bool:
        return (re.match(cls.LEGACY_PATTERN, value) or 
                re.match(cls.NEW_PATTERN, value))
```

#### Scenario: Add new approval level (Quality Engineer review)

| Aspect | Impact |
|--------|--------|
| **What changes** | Approval workflow, status transitions, roles |
| **What's affected** | Workflow state machine, Approval entity, possibly UI |
| **What might break** | Programs in mid-approval flow |
| **Blast radius** | 3 (workflow is contained but has tentacles) |

**Migration strategy:**
1. Add new status without removing old states
2. Programs in old flow complete with old rules
3. New programs use new flow
4. Eventually deprecate old path

---

### 2.4 Technology Changes

#### Scenario: Switch from Flask to FastAPI

| Aspect | Impact |
|--------|--------|
| **What changes** | Web framework, routing, request handling |
| **What's affected** | Entire web layer |
| **What might break** | Templates, session handling, all routes |
| **Blast radius** | 4 (major but contained to web layer) |

**Why 4, not 5:**
- Service layer: Unchanged
- Domain layer: Unchanged
- Repository layer: Unchanged
- Only web layer completely replaced

```
┌──────────────────────────────────────────┐
│         WEB LAYER (Flask → FastAPI)      │ ← Complete replacement
├──────────────────────────────────────────┤
│         SERVICE LAYER                     │ ← Unchanged
├──────────────────────────────────────────┤
│         DOMAIN LAYER                      │ ← Unchanged
├──────────────────────────────────────────┤
│         REPOSITORY LAYER                  │ ← Unchanged
└──────────────────────────────────────────┘
```

#### Scenario: Add caching layer (Redis)

| Aspect | Impact |
|--------|--------|
| **What changes** | Data retrieval path for read-heavy entities |
| **What's affected** | Service layer, new infrastructure |
| **What might break** | Cache invalidation bugs, stale data |
| **Blast radius** | 2 (additive change, optional) |

**Pattern: Add cache at Service level**
```python
# Before
class PartService:
    def __init__(self, repo: PartRepositoryInterface):
        self.repo = repo
    
    def find_part(self, part_number: str) -> Optional[Part]:
        return self.repo.find_by_number(part_number)

# After
class PartService:
    def __init__(self, repo: PartRepositoryInterface, cache: CacheInterface):
        self.repo = repo
        self.cache = cache
    
    def find_part(self, part_number: str) -> Optional[Part]:
        cached = self.cache.get(f"part:{part_number}")
        if cached:
            return cached
        part = self.repo.find_by_number(part_number)
        if part:
            self.cache.set(f"part:{part_number}", part, ttl=300)
        return part
```

---

### 2.5 Scale Changes

#### Scenario: Support 1000x more parts

| Aspect | Impact |
|--------|--------|
| **What changes** | Query performance, pagination, indexing |
| **What's affected** | Repository queries, UI pagination, search |
| **What might break** | Slow responses, timeout errors |
| **Blast radius** | 3 (optimization across layers) |

**Areas to address:**
1. Database: Add indexes, optimize queries
2. Repository: Add pagination to queries
3. Service: Support pagination parameters
4. Web: Implement paginated views

---

## Part 3: Change Impact Matrix

### 3.1 Complete Matrix

| Change | Domain | Repository | Service | Web | Data Migration | Blast (1-5) |
|--------|--------|------------|---------|-----|----------------|-------------|
| Add field to entity | ✓ | ✓ | Maybe | ✓ | ✓ | 3 |
| Change validation rule | ✓ | - | Maybe | - | Maybe | 2 |
| Switch database | - | ✓ | - | - | ✓ | 2 |
| Switch web framework | - | - | - | ✓ | - | 4 |
| Add new entity | ✓ | ✓ | ✓ | ✓ | ✓ | 3 |
| Change status flow | ✓ | - | ✓ | ✓ | Maybe | 3 |
| Add caching | - | - | ✓ | - | - | 2 |
| Add new role | ✓ | ✓ | ✓ | ✓ | ✓ | 4 |
| Rename entity | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |

Legend: ✓ = requires changes, - = no changes, Maybe = depends on specifics

### 3.2 Observations

**Low blast radius (1-2):**
- Validation rule changes
- Database technology changes
- Caching additions

**Medium blast radius (3):**
- Adding fields
- Adding entities
- Workflow changes

**High blast radius (4-5):**
- Framework changes
- Major renaming
- New cross-cutting concerns (roles)

---

## Part 4: Designing for Change

### 4.1 Isolate Volatile Decisions

**What's volatile?** (likely to change)
- UI framework
- Database choice
- External APIs
- Business rules

**What's stable?** (unlikely to change)
- Core domain concepts
- Basic entity relationships
- Fundamental invariants

**Strategy:** Hide volatile behind stable interfaces.

### 4.2 Minimize Dependencies

Each dependency is a change propagation path.

| Module Dependencies | Change Propagation |
|---------------------|-------------------|
| 10 dependencies | Changes in 10 places affect you |
| 3 dependencies | Changes in 3 places affect you |
| 0 dependencies | Nothing can break you |

**The Domain layer should have 0 external dependencies.**

### 4.3 Use Interfaces at Boundaries

Boundaries are:
- Between layers
- With external systems
- With technologies that might change

```python
# Bad: Service directly uses concrete implementation
class PartService:
    def __init__(self):
        self.repo = SQLitePartRepository()  # Tightly coupled
        self.mailer = SMTPMailer()          # Tightly coupled

# Good: Service uses interfaces
class PartService:
    def __init__(
        self, 
        repo: PartRepositoryInterface,
        mailer: MailerInterface
    ):
        self.repo = repo      # Changeable
        self.mailer = mailer  # Changeable
```

---

## Part 5: Exercises

### Exercise 1: Analyze This Change

Analyze the impact of:

> "We need to track who created each Part and when."

Fill in: What changes, what's affected, blast radius, migration strategy.

<details>
<summary>Solution</summary>

**What changes:**
- Domain: Part entity gets `created_by` (User reference) and `created_at` (timestamp)
- Repository: INSERT/SELECT include new fields
- Database: Add columns
- Web: Display creator information
- Service: Accept user context when creating

**What's affected:**
1. `domain/entities/part.py` - Add properties
2. `repository/part_repository.py` - Update SQL
3. `web/templates/parts/detail.html` - Show created by/at
4. `service/part_service.py` - Accept user_id parameter
5. Database migration - Add columns

**Blast radius:** 3

**Migration strategy:**
1. Add columns with NULL allowed initially
2. Backfill existing records with system user / current timestamp
3. Add NOT NULL constraint after backfill
4. Update code to require values on create

</details>

---

### Exercise 2: Compare Architectures

Consider these two architectures for the same change (add email notifications):

**Architecture A:**
```python
# In service
class PartService:
    def create_part(self, ...):
        part = Part(...)
        self.repo.save(part)
        send_email(...)  # Direct call
```

**Architecture B:**
```python
# In service
class PartService:
    def __init__(self, notifier: NotifierInterface):
        self.notifier = notifier
    
    def create_part(self, ...):
        part = Part(...)
        self.repo.save(part)
        self.notifier.part_created(part)  # Abstracted
```

Which is more change-resilient? Why?

<details>
<summary>Solution</summary>

**Architecture B is more resilient.**

| Aspect | Architecture A | Architecture B |
|--------|----------------|----------------|
| Change email provider | Edit service code | Replace notifier implementation |
| Add SMS notification | Edit service code | Composite notifier |
| Disable notifications | Edit service code | Null/NoOp notifier |
| Test without email | Must mock function | Inject mock notifier |
| Add new notification | Hunt through services | Extend interface |

**Architecture B benefits:**
- Notification logic isolated from service logic
- Easy to test (inject mock)
- Easy to swap implementations
- Open for extension (new notification types)
- Closed for modification (service doesn't change)

This demonstrates the **Open/Closed Principle**: open for extension, closed for modification.

</details>

---

### Exercise 3: Design for Change

You know that:
- The database will eventually change from SQLite to PostgreSQL
- The UI will eventually be rewritten in React (currently server-rendered)
- Business rules around approval might change frequently

How would you structure the code to minimize the impact of these known-coming changes?

<details>
<summary>Solution</summary>

**For database change:**
```
✓ Repository pattern - already isolates database
✓ No raw SQL in services or higher
✓ Interface defined in domain layer

Changes needed: Replace repository implementations only
```

**For UI rewrite (server-rendered → React/API):**
```
Currently: Flask routes render templates
Future: Flask/FastAPI serves JSON API

Design now:
1. Services return domain objects, not HTTP responses
2. Routes are thin (transform to/from HTTP)
3. Consider adding explicit DTOs for API responses

When React comes:
- Web layer changes to serve JSON
- Service layer unchanged
- Add CORS, API authentication
```

**For approval rule changes:**
```
Isolate approval logic:
1. Create ApprovalWorkflow class in domain
2. Make rules configurable or strategy-based
3. Version the workflow (v1, v2 can coexist)

class ApprovalWorkflow:
    def can_transition(self, current, target, user) -> bool:
        # Rules here, easily changeable
    
    def required_approvers(self, program) -> List[Role]:
        # Rules here, easily changeable

When rules change:
- Modify ApprovalWorkflow only
- Rest of system unaffected
```

</details>

---

## Summary

### Key Takeaways

| Concept | What It Means |
|---------|---------------|
| **Change analysis** | Predict impact before it happens |
| **Blast radius** | How far changes propagate |
| **Isolation** | Contains change to minimal modules |
| **Interfaces at boundaries** | Hide volatile behind stable |

### Change Resilience Checklist

- [ ] Can you switch databases without touching domain?
- [ ] Can you switch web frameworks without touching services?
- [ ] Can you add entity fields by changing predictable locations?
- [ ] Are business rules isolated and changeable?
- [ ] Are external systems behind interfaces?

---

## Next Tutorial

[Tutorial 6: Error Taxonomy →](./06-error-taxonomy.md)
