---
concept: 134-indexing
name: Indexing
---

## Definition

An index is a separate, ordered data structure that lets a database find
rows matching a condition without scanning every row — trading extra
storage and slower writes for dramatically faster reads on indexed
columns.

## Problem

Without an index, finding a row matching a condition requires checking
EVERY row one by one (a full table scan) — fine for a handful of rows, but
prohibitively slow once a table has millions. An index precomputes a
sorted/structured lookup (conceptually similar to a book's index) so the
database can jump directly to matching rows instead of scanning
everything.

## Execution

Table has 1,000,000 rows; searching for email = 'alice@example.com' with
NO index
↓
Database checks EVERY row, one at a time, until it finds a match (or
exhausts the table) — O(n)
↓
With an index on email: database looks up 'alice@example.com' in the
index's sorted structure (e.g., a B-tree) directly — O(log n)
↓
Index points to exactly which row(s) match — no full scan needed

## Computer Science

Indexes are typically implemented as B-trees (or hash tables for
equality-only lookups), giving O(log n) search instead of O(n) linear scan
— the same fundamental trade-off as any precomputed lookup structure:
faster reads, at the cost of extra memory and the overhead of keeping the
structure updated on every write.

Tags: B-trees, Search complexity, Precomputed lookup, Balanced trees

## Software Engineering

Every index speeds up reads on that column but slows down writes (inserts,
updates, and deletes now must also update the index, not just the row),
and consumes additional storage — indiscriminately indexing every column
is a common performance anti-pattern; the right call is indexing columns
actually used in frequent WHERE/JOIN/ORDER BY clauses.

Tags: Write overhead, Index selection, Query optimization

## Common Mistakes

- Adding an index to every column "just in case" — each index adds write overhead and storage cost, so indexes should target columns actually queried frequently, not applied indiscriminately.
- Expecting an index to help a query that doesn't filter, join, or sort on the indexed column — an index only accelerates lookups that actually use it.

## Exercises

- Estimate roughly how many comparisons a full scan of 1,000,000 rows needs versus an indexed lookup using a balanced structure with about 20 levels (log2(1,000,000) ≈ 20).
- Identify which of these queries would benefit from an index on `email`: `WHERE email = ?`, `WHERE age > 25`, `ORDER BY created_at`.

## javascript

```javascript
// Simulating the scan-vs-index tradeoff directly, since real disk-level
// index structures require an actual database engine.
function linearScan(rows, email) {
  let comparisons = 0
  for (const row of rows) {
    comparisons++
    if (row.email === email) return { row, comparisons }
  }
  return { row: null, comparisons }
}

function indexedLookup(index, email) {
  // an index is conceptually a precomputed map from value -> row location
  return { row: index.get(email) ?? null, comparisons: 1 }
}

const rows = Array.from({ length: 1000 }, (_, i) => ({ id: i, email: `user${i}@example.com` }))
const index = new Map(rows.map(r => [r.email, r]))

const target = 'user999@example.com'   // the LAST row -- worst case for a scan
console.log(linearScan(rows, target).comparisons)     // 1000 -- had to check every row
console.log(indexedLookup(index, target).comparisons)  // 1 -- direct lookup, regardless of position
```
Walkthrough: `target` is deliberately the LAST row, the worst case for
`linearScan` — it must check all 1000 rows before finding it.
`indexedLookup` finds the exact same row in a single lookup, since the
index already maps every email directly to its row, regardless of where
that row physically sits.

## python

```python
def linear_scan(rows, email):
    comparisons = 0
    for row in rows:
        comparisons += 1
        if row['email'] == email:
            return row, comparisons
    return None, comparisons


def indexed_lookup(index, email):
    return index.get(email), 1


rows = [{'id': i, 'email': f'user{i}@example.com'} for i in range(1000)]
index = {r['email']: r for r in rows}

target = 'user999@example.com'   # the LAST row -- worst case for a scan
_, scan_comparisons = linear_scan(rows, target)
_, index_comparisons = indexed_lookup(index, target)
print(scan_comparisons)    # 1000 -- had to check every row
print(index_comparisons)   # 1 -- direct lookup, regardless of position
```
Walkthrough: identical scan-vs-index mechanics as the JavaScript version —
`linear_scan` needs 1000 comparisons for the worst-case last row, while
`indexed_lookup` finds it in exactly 1, since the index already knows
where every email lives.
