---
concept: 137-sql-joins
name: SQL Joins
---

## Definition

A JOIN combines rows from two related tables based on a matching column
(typically a foreign key), reassembling data that normalization
deliberately split across separate tables.

## Problem

After normalizing data into separate tables (e.g., customers and orders),
answering "what did each customer order?" requires combining rows from
BOTH tables back together, matched by the customer_id they share. A JOIN
performs exactly this: pairing rows from two tables wherever their join
column values match.

## Execution

customers table: [{id:1, name:'Alice'}, {id:2, name:'Bob'}]
↓
orders table: [{id:101, customerId:1, item:'Book'}, {id:102,
customerId:1, item:'Pen'}, {id:103, customerId:2, item:'Mug'}]
↓
INNER JOIN on customers.id = orders.customerId
↓
For each order, find the customer row where id equals customerId, pair
them together
↓
Result: 3 joined rows, each combining a customer's name with one of their
orders

## Computer Science

A JOIN is conceptually a filtered Cartesian product — pairing every row
of one table with every row of the other, then keeping only the pairs
where the join condition holds. Real database engines don't naively
compute the full Cartesian product (they use indexes and smarter join
algorithms — hash joins, merge joins), but the LOGICAL result is exactly
as if they had.

Tags: Cartesian product, Hash joins, Foreign keys, Relational algebra

## Software Engineering

An INNER JOIN only returns rows with a match on BOTH sides — a customer
with zero orders disappears entirely from the result; a LEFT JOIN instead
keeps every row from the left table, filling in null for any right-side
columns with no match, which is essential when the point of the query is
"list every customer, even ones with no orders yet."

Tags: INNER JOIN, LEFT JOIN, Query design

## Common Mistakes

- Using INNER JOIN when rows with NO match need to still appear in the result — this silently drops them; a LEFT JOIN is needed to keep unmatched left-side rows.
- Joining on a column that isn't actually a reliable, unique key (e.g., matching on a customer's NAME instead of their ID) — two different customers named "Alice" would incorrectly get paired with each other's orders.

## Exercises

- Trace through what an INNER JOIN would produce if a THIRD customer, Carol, had zero orders — is she in the result?
- Trace through what a LEFT JOIN (keeping every customer row) would produce for the same data, including Carol.

## javascript

```javascript
// Simulating an INNER JOIN and a LEFT JOIN directly, since a real SQL
// engine isn't available -- the logical matching behavior is identical.
function innerJoin(left, right, leftKey, rightKey) {
  const result = []
  for (const l of left) {
    for (const r of right) {
      if (l[leftKey] === r[rightKey]) result.push({ ...l, ...r })
    }
  }
  return result
}

function leftJoin(left, right, leftKey, rightKey) {
  const result = []
  for (const l of left) {
    const matches = right.filter(r => r[rightKey] === l[leftKey])
    if (matches.length === 0) result.push({ ...l, item: null })
    else matches.forEach(r => result.push({ ...l, ...r }))
  }
  return result
}

const customers = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Carol' }]
const orders = [{ id: 101, customerId: 1, item: 'Book' }, { id: 102, customerId: 1, item: 'Pen' }, { id: 103, customerId: 2, item: 'Mug' }]

console.log(innerJoin(customers, orders, 'id', 'customerId').length)   // 3 -- Carol (no orders) never appears
console.log(leftJoin(customers, orders, 'id', 'customerId').length)    // 4 -- Carol appears once, with item: null
```
Walkthrough: `innerJoin` only pairs rows where a match exists on both
sides — Carol, who has zero orders, contributes nothing to the 3-row
result. `leftJoin` explicitly keeps every customer row even with no
match, producing a 4th row for Carol with `item: null`, since it
preserves every left-side row regardless of whether a match exists.

## python

```python
def inner_join(left, right, left_key, right_key):
    result = []
    for l in left:
        for r in right:
            if l[left_key] == r[right_key]:
                result.append({**l, **r})
    return result


def left_join(left, right, left_key, right_key):
    result = []
    for l in left:
        matches = [r for r in right if r[right_key] == l[left_key]]
        if not matches:
            result.append({**l, 'item': None})
        else:
            for r in matches:
                result.append({**l, **r})
    return result


customers = [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}, {'id': 3, 'name': 'Carol'}]
orders = [{'id': 101, 'customerId': 1, 'item': 'Book'}, {'id': 102, 'customerId': 1, 'item': 'Pen'}, {'id': 103, 'customerId': 2, 'item': 'Mug'}]

print(len(inner_join(customers, orders, 'id', 'customerId')))   # 3 -- Carol (no orders) never appears
print(len(left_join(customers, orders, 'id', 'customerId')))    # 4 -- Carol appears once, with item: None
```
Walkthrough: identical join mechanics as the JavaScript version —
`inner_join` drops Carol entirely (3 results), while `left_join` keeps
her with a `None` item (4 results), matching SQL's INNER JOIN vs LEFT
JOIN semantics exactly.
