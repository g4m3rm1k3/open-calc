# Tutorial 6: Error Taxonomy

## Introduction

Errors are inevitable. How you **categorize** and **handle** them determines whether your system is robust or fragile.

This tutorial establishes a complete error taxonomy for PartFlow—every type of error, its cause, and its proper handling.

---

## Part 1: Why Categorize Errors?

### 1.1 The Problem with Generic Error Handling

```python
# Bad: Generic handling
try:
    do_something()
except Exception as e:
    print(f"Error: {e}")
```

This catches everything and handles nothing well. It:
- Hides programmer mistakes
- Treats user errors like system crashes
- Provides no useful feedback
- Makes debugging impossible

### 1.2 Error Categories Enable Appropriate Response

| Category | User Should See | System Should Do |
|----------|-----------------|------------------|
| User error | Helpful message | Validate, reject |
| Business rule violation | Rule explanation | Enforce, log |
| Infrastructure failure | "Try again later" | Retry, alert ops |
| Programmer error | "Unexpected error" | Crash, log, page on-call |

---

## Part 2: The Error Taxonomy

### 2.1 Category 1: User Errors

**Definition:** User provided invalid input.

**Examples:**
- Empty required field
- Wrong format (email, part number)
- Value out of range
- Invalid selection

**Handling:**
- Return clear validation message
- Do NOT log as error (this is normal operation)
- Do NOT crash
- Show how to correct

**Code Pattern:**
```python
class ValidationError(Exception):
    """User input failed validation."""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message

# Raise in domain/service
if not PartNumber.is_valid(part_number):
    raise ValidationError("part_number", "Must match format XX-NNNNN")

# Handle in web layer
@app.route('/parts', methods=['POST'])
def create_part():
    try:
        part = part_service.create_part(...)
        return redirect(...)
    except ValidationError as e:
        return render_template('parts/create.html', error=e.message), 400
```

---

### 2.2 Category 2: Business Rule Violations

**Definition:** Input is valid but violates a business rule.

**Examples:**
- Duplicate part number (identity invariant)
- Approving without permission (authorization)
- Editing locked artifact (concurrency)
- Transitioning to invalid state (workflow)

**Handling:**
- Return clear business message
- Log for audit purposes
- Do NOT crash
- Explain the rule

**Code Pattern:**
```python
class DuplicatePartError(Exception):
    """Part number already exists."""
    def __init__(self, part_number: str):
        self.part_number = part_number

class NotAuthorizedError(Exception):
    """User lacks required permission."""
    def __init__(self, user_id: str, action: str, resource: str):
        self.user_id = user_id
        self.action = action
        self.resource = resource

class ArtifactLockedError(Exception):
    """Artifact is locked by another user."""
    def __init__(self, artifact_id: str, locked_by: str, since: datetime):
        self.artifact_id = artifact_id
        self.locked_by = locked_by
        self.since = since
```

---

### 2.3 Category 3: Infrastructure Errors

**Definition:** External systems are unavailable or failing.

**Examples:**
- Database connection failed
- Network timeout
- Disk full
- External API unavailable

**Handling:**
- Log error with context
- Return generic "service unavailable" to user
- Consider retry logic
- Alert operations team if persistent

**Code Pattern:**
```python
class InfrastructureError(Exception):
    """External system failure."""
    def __init__(self, system: str, details: str):
        self.system = system
        self.details = details

# Wrap in repository
def save(self, part: Part) -> None:
    try:
        self.db.execute(...)
    except sqlite3.Error as e:
        logger.error(f"Database error saving part: {e}")
        raise InfrastructureError("database", str(e))

# Handle in web layer
@app.errorhandler(InfrastructureError)
def handle_infrastructure_error(e):
    return render_template('errors/503.html'), 503
```

---

### 2.4 Category 4: Programmer Errors

**Definition:** Bug in the code. Should never happen in correct code.

**Examples:**
- Null pointer / None access
- Array index out of bounds
- Type mismatch
- Assertion failure
- Invariant violation by code (not user)

**Handling:**
- **Crash (don't catch)** – this is intentional
- Log full stack trace
- Generic "unexpected error" to user
- Alert developers immediately
- Fix the bug (not the error handling)

**Code Pattern:**
```python
# DO NOT CATCH programmer errors
# Let them crash so they're visible

def get_part(self, part_id: str) -> Part:
    if part_id is None:
        # This should never happen if code is correct
        raise RuntimeError("Programmer error: part_id cannot be None")
    ...

# Assertions for invariants
def set_revision(self, revision: Revision):
    assert revision.major >= self._revision.major, \
        f"Invariant violation: revision must increase"
    self._revision = revision
```

**Why crash?**
- Continuing with corrupted state is worse than stopping
- Makes bugs visible (harder to ignore)
- Prevents data corruption from propagating
- Gets fixed faster

---

## Part 3: Error Hierarchy

### 3.1 PartFlow Exception Hierarchy

```python
# domain/errors.py

class PartFlowError(Exception):
    """Base class for all PartFlow errors."""
    pass

# --- User Errors ---
class ValidationError(PartFlowError):
    """User input failed validation."""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")

# --- Business Rule Violations ---
class BusinessRuleError(PartFlowError):
    """Business rule was violated."""
    pass

class DuplicateEntityError(BusinessRuleError):
    """Entity with this identity already exists."""
    def __init__(self, entity_type: str, identifier: str):
        self.entity_type = entity_type
        self.identifier = identifier
        super().__init__(f"{entity_type} '{identifier}' already exists")

class NotFoundError(BusinessRuleError):
    """Requested entity not found."""
    def __init__(self, entity_type: str, identifier: str):
        self.entity_type = entity_type
        self.identifier = identifier
        super().__init__(f"{entity_type} '{identifier}' not found")

class NotAuthorizedError(BusinessRuleError):
    """User not authorized for this action."""
    def __init__(self, action: str, resource: str = None):
        self.action = action
        self.resource = resource
        msg = f"Not authorized to {action}"
        if resource:
            msg += f" on {resource}"
        super().__init__(msg)

class ArtifactLockedError(BusinessRuleError):
    """Artifact is locked by another user."""
    def __init__(self, artifact_type: str, artifact_id: str, locked_by: str):
        self.artifact_type = artifact_type
        self.artifact_id = artifact_id
        self.locked_by = locked_by
        super().__init__(
            f"{artifact_type} {artifact_id} is locked by {locked_by}"
        )

class InvalidStateTransitionError(BusinessRuleError):
    """State transition is not allowed."""
    def __init__(self, current_state: str, target_state: str):
        self.current_state = current_state
        self.target_state = target_state
        super().__init__(
            f"Cannot transition from '{current_state}' to '{target_state}'"
        )

# --- Infrastructure Errors ---
class InfrastructureError(PartFlowError):
    """External system failure."""
    def __init__(self, system: str, details: str = None):
        self.system = system
        self.details = details
        msg = f"{system} failure"
        if details:
            msg += f": {details}"
        super().__init__(msg)

class DatabaseError(InfrastructureError):
    """Database operation failed."""
    def __init__(self, operation: str, details: str = None):
        self.operation = operation
        super().__init__("database", details or operation)
```

---

## Part 4: Error Handling by Layer

### 4.1 Domain Layer

**Rules:**
- Define error types
- Raise validation errors on entity creation
- Never catch errors (let them propagate)

```python
# domain/entities/part.py
class Part:
    def __init__(self, part_number: str, name: str):
        if not part_number:
            raise ValidationError("part_number", "Part number is required")
        if not PartNumber.is_valid(part_number):
            raise ValidationError("part_number", "Invalid format")
        if not name:
            raise ValidationError("name", "Name is required")
        
        self._part_number = PartNumber(part_number)
        self._name = name
```

### 4.2 Repository Layer

**Rules:**
- Wrap infrastructure exceptions
- Convert to domain errors where appropriate
- Log failures

```python
# repository/part_repository.py
class SQLitePartRepository(PartRepositoryInterface):
    def save(self, part: Part) -> None:
        try:
            self.db.execute(
                "INSERT INTO parts (id, part_number, name) VALUES (?, ?, ?)",
                [str(part.id), str(part.part_number), part.name]
            )
        except sqlite3.IntegrityError as e:
            if "UNIQUE constraint failed" in str(e):
                raise DuplicateEntityError("Part", str(part.part_number))
            raise DatabaseError("insert", str(e))
        except sqlite3.Error as e:
            raise DatabaseError("insert", str(e))
    
    def find_by_id(self, part_id: str) -> Part:
        try:
            row = self.db.execute(...).fetchone()
            if row is None:
                raise NotFoundError("Part", part_id)
            return self._row_to_part(row)
        except sqlite3.Error as e:
            raise DatabaseError("select", str(e))
```

### 4.3 Service Layer

**Rules:**
- Catch and re-raise with context where helpful
- Add authorization checks
- Coordinate transactions

```python
# service/part_service.py
class PartService:
    def create_part(self, part_number: str, name: str, user: User) -> Part:
        # Authorization
        if not user.can('create_part'):
            raise NotAuthorizedError('create part')
        
        # Domain validation happens in Part.__init__
        part = Part(
            id=uuid4(),
            part_number=part_number,
            name=name,
            created_by=user.id
        )
        
        # Persistence (may raise DuplicateEntityError)
        self.repo.save(part)
        
        return part
```

### 4.4 Web Layer

**Rules:**
- Convert errors to HTTP responses
- Show friendly messages
- Log appropriately
- Never expose internal details

```python
# web/routes/parts.py

@app.route('/parts', methods=['POST'])
def create_part():
    try:
        user = get_current_user()
        part = part_service.create_part(
            part_number=request.form['part_number'],
            name=request.form['name'],
            user=user
        )
        return redirect(url_for('part_detail', id=part.id))
    
    except ValidationError as e:
        flash(f"Invalid input: {e.message}", 'error')
        return render_template('parts/create.html'), 400
    
    except DuplicateEntityError as e:
        flash(f"Part number already exists", 'error')
        return render_template('parts/create.html'), 409
    
    except NotAuthorizedError as e:
        flash("You don't have permission to create parts", 'error')
        return redirect(url_for('parts_list')), 403

# Global handler for infrastructure errors
@app.errorhandler(InfrastructureError)
def handle_infrastructure_error(e):
    logger.error(f"Infrastructure error: {e.system} - {e.details}")
    return render_template('errors/503.html'), 503

# Global handler for unknown errors
@app.errorhandler(Exception)
def handle_unexpected_error(e):
    logger.exception("Unexpected error")  # Full stack trace
    return render_template('errors/500.html'), 500
```

---

## Part 5: HTTP Status Code Mapping

| Error Type | HTTP Status | Meaning |
|------------|-------------|---------|
| ValidationError | 400 | Bad Request |
| NotFoundError | 404 | Not Found |
| NotAuthorizedError | 403 | Forbidden |
| DuplicateEntityError | 409 | Conflict |
| ArtifactLockedError | 423 | Locked |
| InvalidStateTransitionError | 422 | Unprocessable Entity |
| InfrastructureError | 503 | Service Unavailable |
| Unexpected/Programmer error | 500 | Internal Server Error |

---

## Part 6: Exercises

### Exercise 1: Classify These Errors

Classify each error and describe proper handling:

1. User submits form with empty part number
2. Database connection times out during save
3. Two users create same part number simultaneously
4. Code tries to call method on None
5. User tries to release program they didn't create

<details>
<summary>Solution</summary>

1. **Empty part number**
   - Category: User Error (ValidationError)
   - Handling: Return 400, show "Part number is required"
   - Logging: None (expected behavior)

2. **Database timeout**
   - Category: Infrastructure Error
   - Handling: Return 503, show "Service temporarily unavailable"
   - Logging: Error level with details

3. **Simultaneous duplicate**
   - Category: Business Rule Violation (DuplicateEntityError)
   - Handling: Return 409, show "Part number already exists"
   - Logging: Info level (not an error, just a conflict)

4. **Method on None**
   - Category: Programmer Error
   - Handling: Crash (don't catch), return 500
   - Logging: Exception level with full stack trace

5. **Unauthorized release**
   - Category: Business Rule Violation (NotAuthorizedError)
   - Handling: Return 403, show "You don't have permission"
   - Logging: Warning level (possible abuse attempt)

</details>

---

### Exercise 2: Design an Error

Design a complete error for this scenario:

> "User tries to approve a program that requires Quality Engineer approval, but they only have Operator role."

Include: Class definition, properties, message format, HTTP status, logging level.

<details>
<summary>Solution</summary>

```python
class InsufficientRoleError(BusinessRuleError):
    """User's role is insufficient for the requested action."""
    
    def __init__(
        self, 
        required_role: str, 
        actual_role: str, 
        action: str,
        resource: str = None
    ):
        self.required_role = required_role
        self.actual_role = actual_role
        self.action = action
        self.resource = resource
        
        msg = f"Action '{action}' requires role '{required_role}', "
        msg += f"but user has role '{actual_role}'"
        if resource:
            msg += f" (resource: {resource})"
        
        super().__init__(msg)
    
    @property
    def user_message(self) -> str:
        return (f"You need {self.required_role} permission to {self.action}. "
                f"Please contact your administrator.")

# Usage
raise InsufficientRoleError(
    required_role="Quality Engineer",
    actual_role="Operator",
    action="approve program",
    resource="O1234"
)

# HTTP Status: 403 Forbidden
# Logging: Warning (possible attempt to exceed permissions)
```

</details>

---

### Exercise 3: Trace Error Handling

Trace how this error flows through the system:

Scenario: User submits new Part with part_number "PN12345" (missing hyphen).

Show what happens at each layer.

<details>
<summary>Solution</summary>

```
1. WEB LAYER: Request received
   - POST /parts
   - Form data: part_number="PN12345", name="Test Part"

2. WEB LAYER: Calls service
   - part_service.create_part("PN12345", "Test Part", user)

3. SERVICE LAYER: Calls domain
   - Part(part_number="PN12345", name="Test Part", ...)

4. DOMAIN LAYER: Validates
   - Part.__init__()
   - PartNumber.is_valid("PN12345") → False
   - RAISES: ValidationError("part_number", "Invalid format, expected XX-NNNNN")

5. SERVICE LAYER: Exception propagates
   - No catch, lets it bubble up

6. WEB LAYER: Catches ValidationError
   try:
       ...
   except ValidationError as e:
       flash(f"Invalid input: {e.message}", 'error')
       return render_template('parts/create.html'), 400

7. HTTP RESPONSE
   - Status: 400 Bad Request
   - Body: Create form with error message
   - Message: "Invalid input: Invalid format, expected XX-NNNNN"

8. LOGGING: None (user error, expected behavior)
```

</details>

---

## Summary

### Key Takeaways

| Category | User Should See | Code Should Do | HTTP |
|----------|-----------------|----------------|------|
| User error | How to fix | Validate, reject | 400 |
| Business rule | Rule explanation | Enforce | 403/409/422 |
| Infrastructure | "Try later" | Log, retry, alert | 503 |
| Programmer | "Unexpected error" | Crash, page dev | 500 |

### Error Handling Checklist

- [ ] Each error type has explicit class
- [ ] Errors carry context (what failed, why)
- [ ] User errors show helpful messages
- [ ] Infrastructure errors are logged
- [ ] Programmer errors crash (don't hide bugs)
- [ ] HTTP status codes match error types

---

## Phase 01 Complete!

You have now completed Phase 01: Engineering Foundation. You've created:

- ✅ Domain Model
- ✅ Invariant Registry
- ✅ Architectural Decision Records
- ✅ Dependency Rules
- ✅ Change Impact Analysis
- ✅ Error Taxonomy

**Next:** [Phase 02: Development Environment →](../02-development-environment/README.md)

In Phase 02, you'll set up your actual development environment—Python, virtual environments, IDE configuration, and the skeleton project structure.
