---
concept: 139-schema-design
name: Schema Design
---

## Definition

Schema design is the process of deciding how to structure a database's
tables (or documents), their columns/fields, relationships, and
constraints — the blueprint that determines what data can be stored, how
it relates, and what invalid states are prevented outright.

## Problem

A poorly designed schema (e.g., storing a comma-separated list of tags in
a single text column, or no foreign key linking orders to customers)
makes some queries awkward or impossible, and allows invalid data (an
order referencing a customer that doesn't exist) to be silently stored.
Deliberate schema design — choosing the right tables, columns, types, and
constraints up front — prevents entire categories of bugs and awkward
queries later.

## Execution

Bad schema: an orders table has a `tags` column storing
`"urgent,fragile,gift"` as one string
↓
Query "find all urgent orders": requires string-matching/parsing inside
every row's tags column — slow, error-prone (a partial match like
"urgentcare" could false-positive)
↓
Good schema: a separate `order_tags` table [order_id, tag], one row per
tag
↓
Query "find all urgent orders": a simple, indexable `WHERE tag =
'urgent'` — fast, exact, no string parsing

## Computer Science

Schema design decisions directly determine which queries are natural and
efficient versus awkward and slow — this is the same underlying tradeoff
space as Normalization (how much to split data across tables) plus
explicit constraints (foreign keys, NOT NULL, CHECK) that define which
states the database will accept as valid, catching bad data at write time
rather than discovering it later as a bug.

Tags: Constraints, Foreign keys, Normalization, Data modeling

## Software Engineering

Schema changes get more expensive the longer a system runs in production
— later changes may require careful migrations across live data with zero
downtime, so investing real design time up front (thinking through what
relationships and constraints the data actually needs) pays off far more
than in a codebase's early prototype stage, where the schema is still
cheap to change.

Tags: Migrations, Technical debt, Production constraints

## Common Mistakes

- Storing multiple values in a single column (a comma-separated list) instead of a proper one-row-per-value related table — this makes filtering, counting, and indexing that data far harder than it needs to be.
- Skipping foreign key constraints "to keep things simple" — this allows orphaned or invalid references (an order pointing to a customer_id that doesn't exist) to be silently created, a bug a constraint would have caught immediately at write time.

## Exercises

- Redesign a `tags` column storing `"urgent,fragile,gift"` as a proper related table, and write out what querying "all orders tagged urgent" looks like in each design.
- Identify one constraint (NOT NULL, foreign key, UNIQUE) that would have caught a specific data bug you've encountered or can imagine, and explain what invalid state it would have prevented.

## javascript

```javascript
// Simulating why "one row per related value" beats "comma-separated string
// in one column" for querying, since a real schema constraint needs an
// actual database engine to enforce.

// Bad: tags crammed into a single string column
const badOrders = [
  { id: 1, tags: 'urgent,fragile' },
  { id: 2, tags: 'gift' },
  { id: 3, tags: 'urgentcare' },   // NOT actually tagged "urgent" -- but naive substring matching would false-positive
]
const naiveUrgentMatch = badOrders.filter(o => o.tags.includes('urgent'))

// Good: one row per (order, tag) pair -- an "order_tags" table
const orderTags = [
  { orderId: 1, tag: 'urgent' },
  { orderId: 1, tag: 'fragile' },
  { orderId: 2, tag: 'gift' },
  { orderId: 3, tag: 'urgentcare' },
]
const exactUrgentMatch = orderTags.filter(t => t.tag === 'urgent')

console.log(naiveUrgentMatch.map(o => o.id))         // [ 1, 3 ] -- WRONG: order 3 falsely matched via substring
console.log(exactUrgentMatch.map(t => t.orderId))    // [ 1 ] -- correct: only order 1 is actually tagged "urgent"
```
Walkthrough: the comma-separated-string approach's substring match
incorrectly includes order 3 (tagged `'urgentcare'`, not `'urgent'`)
since `.includes('urgent')` matches any substring. The related-table
approach compares whole tag VALUES for equality, so `'urgentcare'` never
equals `'urgent'` — only order 1's actual `'urgent'` tag matches, which
is the correct result.

## python

```python
# Bad: tags crammed into a single string column
bad_orders = [
    {'id': 1, 'tags': 'urgent,fragile'},
    {'id': 2, 'tags': 'gift'},
    {'id': 3, 'tags': 'urgentcare'},   # NOT actually tagged "urgent" -- but naive substring matching would false-positive
]
naive_urgent_match = [o for o in bad_orders if 'urgent' in o['tags']]

# Good: one row per (order, tag) pair -- an "order_tags" table
order_tags = [
    {'order_id': 1, 'tag': 'urgent'},
    {'order_id': 1, 'tag': 'fragile'},
    {'order_id': 2, 'tag': 'gift'},
    {'order_id': 3, 'tag': 'urgentcare'},
]
exact_urgent_match = [t for t in order_tags if t['tag'] == 'urgent']

print([o['id'] for o in naive_urgent_match])            # [1, 3] -- WRONG: order 3 falsely matched via substring
print([t['order_id'] for t in exact_urgent_match])      # [1] -- correct: only order 1 is actually tagged "urgent"
```
Walkthrough: identical substring-false-positive-vs-exact-match contrast as
the JavaScript version — the related-table design compares whole tag
values, correctly excluding order 3's unrelated `'urgentcare'` tag.
