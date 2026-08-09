# Tutorial 2: Locking Strategies

## Introduction

This tutorial compares locking strategies in depth and justifies our choice.

---

## Part 1: Optimistic Locking

### 1.1 How It Works

Optimistic locking assumes conflicts are rare:

```python
# Part has a version number
class Part:
    version: int = 1

# When saving:
def save(self, part: Part):
    # Check version hasn't changed
    result = conn.execute("""
        UPDATE parts 
        SET name = ?, version = version + 1
        WHERE id = ? AND version = ?
    """, (part.name, part.id, part.version))
    
    if result.rowcount == 0:
        raise ConcurrencyError("Part was modified by another user")
```

### 1.2 Pros and Cons

| Pros | Cons |
|------|------|
| No blocking | Conflict detected late |
| Simple database | User loses work on conflict |
| Scales well | User experience on conflict |

### 1.3 When to Use

- High traffic, low conflict
- Short transactions
- Acceptable to retry

---

## Part 2: Pessimistic Locking

### 2.1 How It Works

Lock the row before reading:

```sql
-- Lock the row
SELECT * FROM parts WHERE id = ? FOR UPDATE;

-- Now we have exclusive access until transaction ends
UPDATE parts SET name = ? WHERE id = ?;

COMMIT;  -- Lock released
```

### 2.2 Pros and Cons

| Pros | Cons |
|------|------|
| No lost updates | Blocks other users |
| Guaranteed access | Deadlock potential |
| Simple logic | Doesn't work across requests |

### 2.3 When to Use

- Short, database-level operations
- Within a single transaction
- High conflict probability

---

## Part 3: Application-Level Locking (Our Choice)

### 3.1 How It Works

Explicit check-out/check-in at application level:

```python
# Check out (acquire lock)
lock_service.check_out(part_id, user_id)

# User edits... (could be minutes or hours)

# Check in (release lock)
lock_service.check_in(part_id, user_id)
```

### 3.2 Lock Entity

```python
@dataclass
class PartLock:
    part_id: UUID
    user_id: str
    locked_at: datetime
    expires_at: datetime
    reason: Optional[str] = None
```

### 3.3 Pros and Cons

| Pros | Cons |
|------|------|
| Clear ownership | Extra complexity |
| Works across requests | Abandoned locks |
| User-visible status | Needs expiration |
| Can extend | More to implement |

---

## Part 4: Our Implementation Design

### 4.1 Lock Lifecycle

```
User clicks "Edit"
        │
        ▼
┌───────────────────┐
│ Can I get a lock? │
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌───────┐   ┌───────────────┐
│  Yes  │   │ No - show who │
│       │   │ has it locked │
└───┬───┘   └───────────────┘
    │
    ▼
┌───────────────────┐
│ Create lock with  │
│ 2-hour expiration │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Show edit form    │
│ ⏱️ Timer visible  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ User saves/cancels│
│ → Release lock    │
└───────────────────┘
```

### 4.2 Lock Operations

| Operation | Who Can Do It | Effect |
|-----------|---------------|--------|
| check_out | Any user | Acquires lock |
| check_in | Lock owner | Releases lock |
| extend | Lock owner | Extends expiration |
| force_unlock | Admin | Releases any lock |
| is_locked | Anyone | Checks status |

### 4.3 Automatic Expiration

```python
def is_expired(self) -> bool:
    return datetime.utcnow() > self.expires_at

def get_lock(self, part_id: UUID) -> Optional[PartLock]:
    lock = self._repo.find_by_part(part_id)
    if lock and lock.is_expired():
        self._repo.delete(lock.part_id)
        return None
    return lock
```

---

## Part 5: Comparison Summary

### 5.1 Decision Matrix

| Criterion | Optimistic | Pessimistic | Check-in/out |
|-----------|------------|-------------|--------------|
| Long edits | ❌ | ❌ | ✅ |
| User visibility | ❌ | ❌ | ✅ |
| Implementation | Simple | Medium | Complex |
| Scalability | Excellent | Poor | Good |
| User experience | Poor on conflict | Blocking | Best |

### 5.2 Our Decision

**Check-in/Check-out** because:
1. Manufacturing edits take time (minutes to hours)
2. Users need to know who's editing
3. Clear ownership reduces confusion
4. We can show status in UI

---

## Summary

### Key Takeaways

| Strategy | Best For |
|----------|----------|
| Optimistic | Quick operations, rare conflicts |
| Pessimistic | Database-level, single transaction |
| Check-in/out | Long edits, visible ownership |

---

## Next Tutorial

[Tutorial 3: Lock Implementation →](./03-lock-implementation.md)
