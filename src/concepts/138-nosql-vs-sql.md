---
concept: 138-nosql-vs-sql
name: NoSQL vs SQL
---

## Definition

SQL (relational) databases store data in fixed-schema tables with
relationships enforced via foreign keys and JOINs; NoSQL databases cover
several alternative models (document, key-value, graph, wide-column) that
typically trade some of SQL's structure and consistency guarantees for
flexibility or horizontal scalability.

## Problem

A rigid relational schema requires a migration to add a new field, and
JOINs across many tables can become a bottleneck at very large scale.
NoSQL databases address this by allowing flexible, schema-less documents
(add a new field to one record without touching any others) or by being
designed from the ground up to scale horizontally across many machines,
at the cost of some of SQL's strict consistency and join capabilities.

## Execution

Relational: a users table (fixed columns: id, name, email) plus a
separate addresses table, joined by user_id
↓
Adding a new field (e.g., "phone") relationally: requires a migration
affecting every row's shape
↓
Document (NoSQL) equivalent: each user is a single self-contained
JSON-like document, embedding their address directly
↓
Adding "phone" to a document database: just add the field to new
documents; existing documents without it simply don't have that field —
no migration required

## Computer Science

This reflects a genuine structural tradeoff, not a strict
"NoSQL is better/worse" — relational databases enforce a fixed schema and
strong consistency (ACID) using JOINs to avoid redundancy (see
Normalization); document/key-value NoSQL databases typically embed
related data directly (denormalizing on purpose) to avoid needing joins
at read time, trading some consistency and storage efficiency for read
speed and horizontal scalability.

Tags: Schema flexibility, Horizontal scaling, Denormalization by design, CAP theorem

## Software Engineering

The right choice depends on the access pattern — data with many small,
evolving relationships queried in complex ways (analytics, financial
records requiring strict consistency) tends to fit SQL better; data
naturally read and written as whole self-contained units at very large
scale (a user's profile, a product catalog entry, session/cache data)
tends to fit NoSQL's document or key-value model better.

Tags: Data modeling, Access patterns, Database selection

## Common Mistakes

- Assuming NoSQL means "no schema at all, so no data modeling is needed" — NoSQL databases still need a deliberate data model, just a different one (usually denormalized, embedding related data), and a poorly modeled NoSQL database can be just as problematic as a poorly modeled relational one.
- Choosing NoSQL purely because it sounds more modern or scalable, without an actual access-pattern or scale requirement that relational can't meet — relational databases remain the better default for most applications with complex relationships and a need for strong consistency.

## Exercises

- Model a blog post with comments as (a) a relational schema with posts/comments tables and a JOIN, and (b) a document model with comments embedded directly in the post document — what does each approach make easy or hard?
- Identify one application where strict ACID consistency (a financial ledger) would make SQL the clearly better fit over a NoSQL document store.

## javascript

```javascript
// Simulating the schema-migration-vs-flexible-document contrast directly.

// Relational-style: fixed columns, all rows must share the same shape
const relationalUsers = [
  { id: 1, name: 'Alice', email: 'alice@x.com' },
  { id: 2, name: 'Bob', email: 'bob@x.com' },
]
// Adding "phone" relationally requires updating EVERY existing row's shape
relationalUsers.forEach(u => { u.phone = null })   // simulates a migration touching every row

// Document-style: each record is independent; new fields don't require touching old documents
const documentUsers = [
  { id: 1, name: 'Alice', email: 'alice@x.com' },              // no phone field at all -- and that's fine
  { id: 2, name: 'Bob', email: 'bob@x.com', phone: '555-1234' },   // this one has it
]

console.log(relationalUsers.every(u => 'phone' in u))   // true -- migration touched every row uniformly
console.log('phone' in documentUsers[0])                 // false -- older document simply lacks the field, no migration needed
console.log('phone' in documentUsers[1])                 // true -- newer document has it
```
Walkthrough: the relational simulation needs an explicit pass over every
existing row to add the new `phone` field uniformly (a stand-in for a
real schema migration) — every row ends up with the field, even if
`null`. The document-style array shows two documents with genuinely
different shapes coexisting with no migration at all — the older one
simply has no `phone` key, and that's valid.

## python

```python
# Relational-style: fixed columns, all rows must share the same shape
relational_users = [
    {'id': 1, 'name': 'Alice', 'email': 'alice@x.com'},
    {'id': 2, 'name': 'Bob', 'email': 'bob@x.com'},
]
# Adding "phone" relationally requires updating EVERY existing row's shape
for u in relational_users:
    u['phone'] = None   # simulates a migration touching every row

# Document-style: each record is independent; new fields don't require touching old documents
document_users = [
    {'id': 1, 'name': 'Alice', 'email': 'alice@x.com'},                               # no phone field at all -- and that's fine
    {'id': 2, 'name': 'Bob', 'email': 'bob@x.com', 'phone': '555-1234'},               # this one has it
]

print(all('phone' in u for u in relational_users))   # True -- migration touched every row uniformly
print('phone' in document_users[0])                   # False -- older document simply lacks the field, no migration needed
print('phone' in document_users[1])                   # True -- newer document has it
```
Walkthrough: identical schema-flexibility contrast as the JavaScript
version — the relational rows are forced into a uniform shape via an
explicit migration-like pass, while the documents happily coexist with
different shapes with no such step required.
