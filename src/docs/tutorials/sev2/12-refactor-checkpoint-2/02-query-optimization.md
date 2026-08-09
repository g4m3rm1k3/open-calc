# Tutorial 2: Query Optimization

## Introduction

This tutorial optimizes database queries for common access patterns.

---

## Part 1: Identify Slow Queries

### 1.1 Common Slow Patterns

| Pattern | Problem | Solution |
|---------|---------|----------|
| SELECT * | Fetches unused data | Select only needed columns |
| No LIMIT | Returns all rows | Add pagination |
| Full table scan | No index | Add appropriate index |
| Multiple round trips | Separate queries | Use JOINs or batch |

---

## Part 2: Optimized Queries

### 2.1 Parts with Machine Count

**Before (N+1):**
```python
parts = repo.find_all()
for part in parts:
    machines = pm_repo.find_by_part(part.id)
    part.machine_count = len(machines)
```

**After (Single Query):**
```sql
SELECT p.*, COUNT(pm.machine_id) as machine_count
FROM parts p
LEFT JOIN part_machines pm ON p.id = pm.part_id
GROUP BY p.id
ORDER BY p.part_number;
```

### 2.2 Pagination

```python
def find_paginated(
    self, 
    page: int = 1, 
    page_size: int = 20,
    status: Optional[PartStatus] = None,
) -> tuple[List[Part], int]:
    """Get paginated parts with total count."""
    offset = (page - 1) * page_size
    
    with self._db.connection() as conn:
        # Get total count
        if status:
            count = conn.execute(
                "SELECT COUNT(*) FROM parts WHERE status = ?",
                (status.value,)
            ).fetchone()[0]
        else:
            count = conn.execute(
                "SELECT COUNT(*) FROM parts"
            ).fetchone()[0]
        
        # Get page
        if status:
            rows = conn.execute(
                """
                SELECT * FROM parts 
                WHERE status = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                (status.value, page_size, offset)
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT * FROM parts 
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                (page_size, offset)
            ).fetchall()
        
        return [self._row_to_part(r) for r in rows], count
```

---

## Part 3: Add Repository Methods

### 3.1 Batch Find

```python
def find_by_ids(self, ids: List[UUID]) -> List[Part]:
    """Find multiple Parts by ID efficiently."""
    if not ids:
        return []
    
    placeholders = ','.join('?' * len(ids))
    with self._db.connection() as conn:
        rows = conn.execute(
            f"SELECT * FROM parts WHERE id IN ({placeholders})",
            [str(id) for id in ids]
        ).fetchall()
        return [self._row_to_part(r) for r in rows]
```

### 3.2 Exists Check

```python
def exists(self, part_id: UUID) -> bool:
    """Check if Part exists without loading it."""
    with self._db.connection() as conn:
        row = conn.execute(
            "SELECT 1 FROM parts WHERE id = ? LIMIT 1",
            (str(part_id),)
        ).fetchone()
        return row is not None
```

---

## Summary

### Optimization Techniques

| Technique | When to Use |
|-----------|-------------|
| Add indexes | Frequent WHERE clauses |
| Batch queries | Multiple related fetches |
| Pagination | Large result sets |
| SELECT needed columns | Reduce data transfer |
| EXISTS vs COUNT | Just checking presence |

---

## Next Tutorial

[Tutorial 3: Common Utilities →](./03-common-utilities.md)
