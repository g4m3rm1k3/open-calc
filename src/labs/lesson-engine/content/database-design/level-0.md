---
series: database-design
level: 0
title: What Databases Are For
lang: sql
---

# What Databases Are For

A file can store data. An in-memory object can store data. So can a spreadsheet, a text file, or a JSON blob on disk. A database is not valuable because it stores data — it is valuable because of what it provides that files do not: durability across crashes, concurrent access by many programs simultaneously, fast retrieval from large datasets, and guarantees that data remains consistent even when multiple things change it at once.

Understanding why databases exist — what problems they solve that no other tool solves as well — is the foundation for making good decisions about when to use one, which kind, and how to design it. By the end of this lesson you will understand the four guarantees a relational database provides (ACID), what distinguishes a relational database from a document store, and when to choose one over the other.

## The problems a file does not solve

```text
Suppose you store all user data in a JSON file: users.json.

PROBLEM 1 — CONCURRENT ACCESS:
  Your server handles 100 simultaneous requests. Each reads users.json, modifies something,
  and writes it back. Two simultaneous writes produce a corrupted file — the second write
  overwrites the first.
  → A database serialises writes — only one write happens at a time, without loss.

PROBLEM 2 — QUERY PERFORMANCE:
  You have 10 million users. Finding users in California requires reading ALL 10 million
  entries and checking each one.
  → A database maintains indexes that make this lookup O(log n) instead of O(n).

PROBLEM 3 — CRASH SAFETY:
  Your server crashes mid-write. The JSON file is now half-written and corrupted.
  → A database uses a write-ahead log (WAL) — changes are written to a log first,
  then committed. A crash before commit leaves the data unchanged.

PROBLEM 4 — PARTIAL UPDATES:
  Transferring $100 from Alice to Bob requires two writes: debit Alice, credit Bob.
  If your server crashes between the two writes, Alice loses $100 but Bob gains nothing.
  → A database transaction makes both writes atomic — either both succeed or neither does.
```

## ACID: the four guarantees of a relational database

ACID is the set of properties that relational databases guarantee about transactions (a transaction is a group of operations that succeed or fail together).

```text
A — ATOMICITY:
  A transaction is all-or-nothing. Either every operation in the transaction succeeds,
  or none of them are applied.
  
  Example: bank transfer (debit Alice, credit Bob).
  If Bob's credit fails, Alice's debit is automatically rolled back.
  The database never ends up in a half-applied state.

C — CONSISTENCY:
  A transaction brings the database from one valid state to another valid state.
  Any constraints defined on the data (foreign keys, unique constraints, not-null) are
  enforced at commit time. A transaction that would violate a constraint is rolled back.
  
  Example: inserting an order with a customer_id that does not exist fails —
  the foreign key constraint ensures every order has a valid customer.

I — ISOLATION:
  Concurrent transactions do not see each other's intermediate states.
  When Alice is transferring money, Bob querying Alice's balance sees either the pre-transfer
  balance or the post-transfer balance — never the intermediate state where money was debited
  but not yet credited.

D — DURABILITY:
  Once a transaction commits, it is permanent — even if the server crashes immediately after.
  The write-ahead log ensures committed data is not lost.
  
  Example: your application receives "transaction committed." The server crashes 1ms later.
  On restart, the database reads the WAL and recovers the committed state.
```

```sql
-- A transaction in SQL:
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';
  UPDATE accounts SET balance = balance + 100 WHERE id = 'bob';
COMMIT;

-- If either UPDATE fails, ROLLBACK (automatic) undoes both.
-- If server crashes after COMMIT, the WAL guarantees both updates are applied on recovery.
-- If server crashes before COMMIT, neither update is applied.
```

**CS lens:** The write-ahead log (WAL) that provides durability and crash recovery is a technique from database systems theory. Before modifying any data page on disk, the database writes a log record describing the intended change. On recovery after a crash, the database replays all committed log records (REDO) and undoes all uncommitted ones (UNDO). This log-before-data rule is what makes durability possible without flushing every write to disk synchronously (which would be too slow). Modern databases (PostgreSQL, MySQL InnoDB, SQLite) all use WAL. Git also uses a similar mechanism — the git object store is append-only, and references are updated atomically.

## Relational vs document stores: choosing the right model

```text
RELATIONAL DATABASES (PostgreSQL, MySQL, SQLite):
  Data is structured as tables with typed columns and explicit relationships (foreign keys).
  Queries use SQL (joins, aggregates, subqueries, window functions).
  Schema is defined upfront — every row in a table has the same columns.
  Strong ACID guarantees.

  Best for:
    Data with stable, well-understood structure.
    Data with relationships between entities (users → orders → products).
    Need for complex queries (reporting, analytics, aggregations).
    Financial or transactional data where ACID matters.

DOCUMENT STORES (MongoDB, DynamoDB, Firestore):
  Data is stored as nested JSON-like documents. Each document can have different fields.
  No joins — related data is often embedded in the same document.
  Flexible schema — you can add new fields without migrating all documents.
  Weaker consistency guarantees by default (configurable).

  Best for:
    Data with highly variable structure (each user has different custom fields).
    Read-heavy workloads where you always fetch the whole document.
    Rapid prototyping where schema changes frequently.
    Very high write throughput at the cost of some consistency.

THE MYTH of "use NoSQL for scale":
  PostgreSQL handles millions of transactions per second with proper indexing.
  The scale question is: read vs write patterns, query complexity, data shape.
  Not: SQL vs NoSQL as a blanket rule.
```

**SE lens:** The most expensive database decision is choosing the wrong model early and needing to migrate later. A relational schema with well-designed tables and indexes can serve most applications at scale. Document stores shine when the document IS the unit of access — you always read and write the whole thing, and its structure is genuinely variable. When in doubt, start with a relational database: it is easier to migrate from a relational model to a document model than the reverse, because the structure has already been discovered.

**Common mistakes:**
- Choosing a database based on "what's popular for this stack" rather than data characteristics — the data model drives the database choice, not the framework.
- Using transactions for read-only operations — transactions have overhead. Read-only queries that do not need isolation do not need transaction wrappers.
- Assuming durability is free — configuring a database for maximum throughput (write-ahead log flushed infrequently) trades durability for performance. Know your database's durability settings and what you are trading.

**Debug tip:** When a database operation fails, read the error message fully: it includes which constraint was violated, which column, and what value caused the violation. "FOREIGN KEY constraint failed" means you are inserting a row that references a non-existent row in another table. "UNIQUE constraint failed" means the value already exists. These are constraint violations — the fix is in the data being inserted, not the schema.

## Challenge: database_concepts

Apply the ACID concepts and model-selection knowledge to concrete scenarios.

```challenge javascript
const databaseConcepts = {
  // ACID: A bank transfer involves two UPDATE statements. Which ACID property
  // ensures that if the second UPDATE fails, the first is rolled back?
  atomicityProperty: '',    // one of: 'Atomicity', 'Consistency', 'Isolation', 'Durability'

  // ACID: After "COMMIT", the server loses power. Will the data be saved?
  durabilityQuestion: '',   // 'yes' or 'no'

  // ACID: While Alice's money transfer is running, Bob queries Alice's balance.
  // Which property ensures Bob sees either the full before or after state, not the middle?
  isolationProperty: '',

  // MODEL CHOICE: you are building a blog platform. Posts have: title, body, author,
  // tags (variable number), published_at. Comments belong to posts and have: body, author.
  // You need to query: all posts by author, total comments per post, posts with a given tag.
  // Relational or document store?
  blogModel: '',            // 'relational' or 'document'
  blogModel_why: '',

  // MODEL CHOICE: you store user profiles where each user can add completely arbitrary
  // custom fields. Different users have 0–50 custom fields of varying types.
  // You always fetch the entire profile in one go. No joins needed.
  profileModel: '',         // 'relational' or 'document'
  profileModel_why: '',
}
```

```test
const d = databaseConcepts
assert d.atomicityProperty === 'Atomicity'
assert d.durabilityQuestion === 'yes'
assert d.isolationProperty === 'Isolation'
assert d.blogModel === 'relational'    && d.blogModel_why.length > 15
assert d.profileModel === 'document'  && d.profileModel_why.length > 15
```
