# Tutorial 1: Performance Analysis

## Introduction

This refactoring checkpoint focuses on **performance**—identifying slow queries and optimizing the system.

---

## Part 1: Measuring Performance

### 1.1 What to Measure

| Metric | Why |
|--------|-----|
| Response time | User experience |
| Database queries | N+1 problems |
| Memory usage | Scalability |
| CPU time | Efficiency |

### 1.2 Simple Timing Decorator

```python
# src/partflow/utils/timing.py
"""Timing utilities for performance analysis."""

import time
import functools
from typing import Callable, Any


def timed(func: Callable) -> Callable:
    """Decorator to time function execution."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper


# Usage:
@timed
def slow_function():
    time.sleep(1)
    return "done"
```

### 1.3 Query Logging

```python
# Enable SQLite query logging
import logging

logging.getLogger('sqlite3').setLevel(logging.DEBUG)
```

---

## Part 2: Common Performance Issues

### 2.1 N+1 Query Problem

**Problem:**
```python
def get_parts_with_machines():
    parts = part_repo.find_all()  # 1 query
    for part in parts:
        machines = pm_repo.find_by_part(part.id)  # N queries!
    # Total: N+1 queries
```

**Solution:**
```python
def get_parts_with_machines():
    parts = part_repo.find_all()  # 1 query
    part_ids = [p.id for p in parts]
    all_machines = pm_repo.find_by_parts(part_ids)  # 1 query
    # Total: 2 queries
```

### 2.2 Missing Indexes

Check your queries against indexes:

| Query Pattern | Index Needed |
|--------------|--------------|
| `WHERE part_number = ?` | `idx_parts_part_number` |
| `WHERE status = ?` | `idx_parts_status` |
| `WHERE part_id = ?` | `idx_pm_part` |

---

## Part 3: Index Analysis

### 3.1 Check Existing Indexes

```sql
-- List all indexes
SELECT name, sql FROM sqlite_master WHERE type = 'index';
```

### 3.2 Add Missing Indexes

```sql
-- Compound index for common query patterns
CREATE INDEX IF NOT EXISTS idx_parts_status_created 
    ON parts(status, created_at);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_entity_time 
    ON audit_logs(entity_type, entity_id, timestamp);
```

---

## Part 4: Batch Operations

### 4.1 Batch Insert

```python
def save_many(self, entities: List[Part]) -> None:
    """Save multiple entities efficiently."""
    with self._db.connection() as conn:
        conn.executemany(
            """
            INSERT INTO parts (id, part_number, name, status, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            [(str(e.id), str(e.part_number), e.name, 
              e.status.value, e.created_at.isoformat())
             for e in entities]
        )
        conn.commit()
```

---

## Summary

### Performance Checklist

- [ ] Add timing to slow operations
- [ ] Check for N+1 queries
- [ ] Verify indexes exist
- [ ] Add batch operations where needed
- [ ] Profile actual usage patterns

---

## Next Tutorial

[Tutorial 2: Query Optimization →](./02-query-optimization.md)
