# Junior to Senior — T1·L12 — MongoDB Query Operators and Indexes

**Prerequisites:** T1·L11 (MongoDB CRUD). You can perform basic CRUD operations.
This lesson covers filtering with query operators and making queries fast with indexes.

**What this lab adds:**
- Comparison operators: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`
- Array operators: `$in`, `$nin`, `$all`
- Logical operators: `$and`, `$or`, `$not`, `$nor`
- What an index is and why queries without them are slow
- Creating indexes and measuring their impact with `explain()`

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have 1,000,000 contacts. You run `findOne({ email: 'alice@example.com' })`.
>    Without an index, how many documents does MongoDB examine?
>    With an index on `email`, how many?
> 2. `{ $or: [{ city: 'London' }, { isVip: true }] }` — does this need ONE index
>    or TWO indexes to be efficient?
> 3. What does `explain('executionStats')` tell you about a query?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A query demonstration that shows each operator family and how indexes change performance:

```
$ npx ts-node mongo-queries.ts

--- Comparison ---
Contacts with loginCount > 5: Charlie (9), Alice (6)
Contacts NOT from London: Bob, Charlie, Diana, Eve

--- Array ---
Contacts with 'vip' OR 'newsletter' tag: Alice, Bob, Charlie
Contacts with BOTH 'vip' AND 'newsletter' tags: Alice

--- Logical ---
Active VIPs OR contacts from Paris: Alice, Bob, Charlie

--- Without index (full scan) ---
Examined: 10000 documents to find 1 match

--- With index (fast lookup) ---
Examined: 1 document to find 1 match
```

---

### Concept: Comparison Query Operators

**What it is:** Comparison operators match documents where a field's value
satisfies a numeric or equality comparison.

```ts
// $eq (default — no operator needed):
{ loginCount: 5 }
{ loginCount: { $eq: 5 } }  // identical

// $ne — not equal:
{ city: { $ne: 'London' } }

// $gt, $gte, $lt, $lte — greater than, less than:
{ loginCount: { $gt: 5 } }          // strictly greater
{ loginCount: { $gte: 5, $lte: 10 } } // between 5 and 10 inclusive

// $in — value is in the list:
{ city: { $in: ['London', 'Paris'] } }

// $nin — value is NOT in the list:
{ city: { $nin: ['Berlin', 'Rome'] } }
```

**What it hides:** These operators hide the conditional logic you would
otherwise write in application code after fetching all documents. Filtering
in the database is orders of magnitude faster than filtering in application code
for large collections.

**Canonical example:** `$gt` is like a WHERE clause in SQL: `WHERE login_count > 5`.
The database evaluates it, not your code.

---

## Step 1 — Set Up and Comparison Queries

Create `mongo-queries.ts` with 10 contacts:

```ts
import { MongoClient, type Collection } from 'mongodb';

interface Contact {
  name:       string;
  email:      string;
  city:       string;
  isActive:   boolean;
  isVip:      boolean;
  tags:       string[];
  loginCount: number;
}

const MONGO_URI = 'mongodb://localhost:27017';

async function setup(): Promise<{ client: MongoClient; coll: Collection<Contact> }> {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const coll = client.db('query_demo').collection<Contact>('contacts');
  await coll.deleteMany({});

  await coll.insertMany([
    { name: 'Alice',   email: 'alice@e.com',   city: 'London', isActive: true,  isVip: true,  tags: ['vip','newsletter'], loginCount: 6 },
    { name: 'Bob',     email: 'bob@e.com',     city: 'Paris',  isActive: true,  isVip: false, tags: ['newsletter'],       loginCount: 3 },
    { name: 'Charlie', email: 'charlie@e.com', city: 'Madrid', isActive: true,  isVip: true,  tags: ['vip'],              loginCount: 9 },
    { name: 'Diana',   email: 'diana@e.com',   city: 'Rome',   isActive: true,  isVip: false, tags: [],                   loginCount: 1 },
    { name: 'Eve',     email: 'eve@e.com',     city: 'London', isActive: false, isVip: false, tags: [],                   loginCount: 0 },
  ]);

  return { client, coll };
}

async function demonstrateComparison(coll: Collection<Contact>): Promise<void> {
  console.log('--- Comparison ---');

  // $gt — loginCount greater than 5:
  const highLogins = await coll
    .find({ loginCount: { $gt: 5 } })
    .sort({ loginCount: -1 })
    .toArray();
  console.log('Contacts with loginCount > 5:', highLogins.map(c => `${c.name} (${c.loginCount})`).join(', '));

  // $ne — not from London:
  const notLondon = await coll.find({ city: { $ne: 'London' } }).toArray();
  console.log('Not from London:', notLondon.map(c => c.name).join(', '));

  // $in — city is London or Paris:
  const capitals = await coll.find({ city: { $in: ['London', 'Paris'] } }).toArray();
  console.log('London or Paris:', capitals.map(c => c.name).join(', '));
}
```

### SAVE AND TRY

```bash
npx ts-node mongo-queries.ts
```

Expected:
```
--- Comparison ---
Contacts with loginCount > 5: Charlie (9), Alice (6)
Not from London: Bob, Charlie, Diana, Eve
London or Paris: Alice, Bob, Eve
```

---

### Concept: Array Query Operators

**`$elemMatch`** — matches if at least one array element matches all conditions  
**`$all`** — matches if the array contains ALL specified values  
**`$size`** — matches if the array has exactly the given length

For simple containment, no special operator is needed:

```ts
// Does the tags array contain 'vip'?
{ tags: 'vip' }           // simple value match against array elements — works!
{ tags: { $in: ['vip'] } } // equivalent but more explicit

// Does tags contain BOTH 'vip' AND 'newsletter'?
{ tags: { $all: ['vip', 'newsletter'] } }

// Does tags contain 'vip' OR 'newsletter'?
{ tags: { $in: ['vip', 'newsletter'] } }

// Does the contact have exactly 2 tags?
{ tags: { $size: 2 } }
```

---

## Step 2 — Array Operators

```ts
async function demonstrateArrayOperators(coll: Collection<Contact>): Promise<void> {
  console.log('\n--- Array ---');

  // Any tag is 'vip' or 'newsletter':
  const withEitherTag = await coll
    .find({ tags: { $in: ['vip', 'newsletter'] } })
    .toArray();
  console.log("Contacts with 'vip' OR 'newsletter':", withEitherTag.map(c => c.name).join(', '));

  // Has BOTH 'vip' AND 'newsletter':
  const withBothTags = await coll
    .find({ tags: { $all: ['vip', 'newsletter'] } })
    .toArray();
  console.log("Contacts with BOTH tags:", withBothTags.map(c => c.name).join(', '));

  // Has no tags at all (empty array):
  const noTags = await coll.find({ tags: { $size: 0 } }).toArray();
  console.log('Contacts with no tags:', noTags.map(c => c.name).join(', '));
}
```

### SAVE AND TRY

Expected:
```
--- Array ---
Contacts with 'vip' OR 'newsletter': Alice, Bob, Charlie
Contacts with BOTH tags: Alice
Contacts with no tags: Diana, Eve
```

---

### Concept: Logical Operators

**`$and`** — implicit when multiple conditions on different fields are combined:

```ts
// These are equivalent:
{ isActive: true, isVip: true }
{ $and: [{ isActive: true }, { isVip: true }] }
```

Use explicit `$and` when applying multiple conditions to the SAME field:

```ts
// Two conditions on loginCount — MUST use explicit $and (or $gt/$lt shorthand):
{ $and: [{ loginCount: { $gte: 3 } }, { loginCount: { $lte: 8 } }] }
// OR shorter:
{ loginCount: { $gte: 3, $lte: 8 } }
```

**`$or`** — document matches if ANY condition is true:

```ts
{ $or: [{ city: 'London' }, { isVip: true }] }
```

**`$nor`** — document matches if NO condition is true:

```ts
// Not active AND not VIP:
{ $nor: [{ isActive: true }, { isVip: true }] }
```

---

## Step 3 — Logical Operators

```ts
async function demonstrateLogical(coll: Collection<Contact>): Promise<void> {
  console.log('\n--- Logical ---');

  // $or — active VIPs or contacts from Paris:
  const orResult = await coll
    .find({ $or: [{ isActive: true, isVip: true }, { city: 'Paris' }] })
    .toArray();
  console.log('Active VIPs or Paris:', orResult.map(c => c.name).join(', '));

  // $nor — not VIP and not from London:
  const norResult = await coll
    .find({ $nor: [{ isVip: true }, { city: 'London' }] })
    .toArray();
  console.log('Not VIP and not London:', norResult.map(c => c.name).join(', '));

  // Combined — active contacts with loginCount between 2 and 8:
  const combined = await coll
    .find({ isActive: true, loginCount: { $gte: 2, $lte: 8 } })
    .sort({ loginCount: 1 })
    .toArray();
  console.log('Active, logins 2-8:', combined.map(c => `${c.name}(${c.loginCount})`).join(', '));
}
```

### SAVE AND TRY

Expected:
```
--- Logical ---
Active VIPs or Paris: Alice, Bob, Charlie
Not VIP and not London: Bob, Charlie, Diana
Active, logins 2-8: Bob(3), Alice(6)
```

---

### Concept: Indexes — Why Queries Without Them Are Slow

**What it is:** An index is a separate data structure that MongoDB maintains
alongside a collection. It stores the values of one or more fields in sorted
order, along with pointers to the documents. A query that uses an index does not
scan every document — it jumps directly to the matching entries.

**Without an index — a collection scan (COLLSCAN):**

```
Query: { email: 'alice@example.com' }

MongoDB reads document 1 → does it match? No
MongoDB reads document 2 → does it match? No
...
MongoDB reads document 50,000 → Yes! Return it.

Examined: 100,000 documents to find 1 match
```

**With an index on `email` — an index scan (IXSCAN):**

```
Index: { alice@example.com → doc_50000, bob@example.com → doc_12000, ... }

MongoDB looks up 'alice@example.com' in the index → finds pointer → fetches doc_50000

Examined: 1 document (the one that matches)
```

**The performance difference:**

```
100,000 contacts, 1 match:
Without index: examines 100,000 → ~50ms
With index:    examines 1       → ~0.1ms

500× faster.
```

**What it hides:** An index hides the linear scan. The collection can grow
to any size; the index lookup remains O(log n) at worst, O(1) for unique indexes.

The invariant: an index guarantees that `findOne` with the indexed field never
scans more documents than necessary. The trade-off is write performance:
every `insertOne`, `updateOne`, and `deleteOne` must also update the index.

**Canonical example:** An index is like the index at the back of a textbook.
Without it, finding "MongoDB" in a 500-page book means reading every page.
With it, you flip to "M", find the page number, and go directly. The index
takes space and must be updated when content changes, but lookups become instant.

---

## Step 4 — Create and Measure Indexes

```ts
async function demonstrateIndexes(coll: Collection<Contact>): Promise<void> {
  // Insert 10,000 contacts to make the impact visible:
  const bulk: Contact[] = Array.from({ length: 10000 }, (_, i) => ({
    name:       `Contact${i}`,
    email:      `contact${i}@example.com`,
    city:       i % 2 === 0 ? 'London' : 'Paris',
    isActive:   true,
    isVip:      i % 10 === 0,
    tags:       [],
    loginCount: Math.floor(Math.random() * 20),
  }));
  // Add a specific contact to find:
  bulk.push({ name: 'Target', email: 'target@example.com', city: 'London', isActive: true, isVip: true, tags: [], loginCount: 5 });

  await coll.deleteMany({});
  await coll.insertMany(bulk);

  console.log('\n--- Without index (full scan) ---');

  // Check the query plan WITHOUT an index:
  const withoutIndex = await coll
    .find({ email: 'target@example.com' })
    .explain('executionStats');

  const statsWithout = withoutIndex.executionStats;
  console.log(`Examined: ${statsWithout.totalDocsExamined} documents to find ${statsWithout.nReturned} match`);
  console.log(`Execution time: ${statsWithout.executionTimeMillis}ms`);

  // Create an index on the email field:
  await coll.createIndex({ email: 1 });   // 1 = ascending

  console.log('\n--- With index (fast lookup) ---');

  const withIndex = await coll
    .find({ email: 'target@example.com' })
    .explain('executionStats');

  const statsWith = withIndex.executionStats;
  console.log(`Examined: ${statsWith.totalDocsExamined} documents to find ${statsWith.nReturned} match`);
  console.log(`Execution time: ${statsWith.executionTimeMillis}ms`);

  // List all indexes:
  const indexes = await coll.listIndexes().toArray();
  console.log('\nIndexes:', indexes.map(i => JSON.stringify(i.key)));
}
```

### SAVE AND TRY

```bash
npx ts-node mongo-queries.ts
```

Expected (times vary by machine):
```
--- Without index (full scan) ---
Examined: 10001 documents to find 1 match
Execution time: 12ms

--- With index (fast lookup) ---
Examined: 1 documents to find 1 match
Execution time: 0ms

Indexes: ['{"_id":1}', '{"email":1}']
```

**Change something:** Query `{ city: 'London' }` — a field without an index —
and check `explain('executionStats').executionStats.totalDocsExamined`. It will
be 10,001 (full scan). Create an index on `city` and run again. Expected: much fewer
documents examined.

---

## 🎯 Challenge: Compound Index

**You know:** Creating indexes, measuring with `explain`, comparison operators.

**Task:** Many queries filter by `{ isActive: true, city: '...' }`. A separate
index on `isActive` and a separate index on `city` are less efficient than one
compound index on both fields together.

Create a compound index `{ isActive: 1, city: 1 }` and use `explain('executionStats')`
to confirm that querying `{ isActive: true, city: 'London' }` uses the compound index
(look for `IXSCAN` in the `winningPlan` and `totalKeysExamined` being much less
than `totalDocsExamined` would be without the index).

**Requirements:**
- Create the compound index
- Run a query that uses both fields
- Log `winningPlan.inputStage.stage` — it should be `'IXSCAN'`
- Log `totalDocsExamined` — it should be far less than the collection size

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
async function demonstrateCompoundIndex(coll: Collection<Contact>): Promise<void> {
  // Create compound index — order matters for compound indexes:
  // This index efficiently serves: { isActive: ... }, { isActive: ..., city: ... }
  // but NOT { city: ... } alone (city is not the leading field)
  await coll.createIndex({ isActive: 1, city: 1 });

  const result = await coll
    .find({ isActive: true, city: 'London' })
    .explain('executionStats');

  const stats = result.executionStats;
  const winningStage = result.queryPlanner.winningPlan.inputStage?.stage
    ?? result.queryPlanner.winningPlan.stage;

  console.log('\n--- Compound Index ---');
  console.log('Query stage:', winningStage);           // 'IXSCAN'
  console.log('Docs examined:', stats.totalDocsExamined);  // small number
  console.log('Docs returned:', stats.nReturned);
}
```

**Key insight:** Compound index field order matters. An index on `{ isActive: 1, city: 1 }`
efficiently serves queries that filter on `isActive` alone or `isActive` AND `city`,
but NOT `city` alone (because `city` is not the leading field). This is the
"leftmost prefix" rule: a compound index is usable for any query that uses a
consecutive left-to-right subset of the indexed fields.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `$gt` filters numbers | `{ loginCount: { $gt: 5 } }` | Only contacts with loginCount > 5 |
| `$in` matches arrays | `{ tags: { $in: ['vip'] } }` | All VIP-tagged contacts |
| `$all` requires all values | `{ tags: { $all: ['vip','newsletter'] } }` | Only contacts with BOTH tags |
| `$or` is inclusive | `{ $or: [cond1, cond2] }` | All docs matching cond1 OR cond2 |
| COLLSCAN before index | `explain` on non-indexed field | Large `totalDocsExamined` |
| IXSCAN after index | `createIndex` then `explain` | Small `totalDocsExamined` |
| Unique index | `createIndex({ email: 1 }, { unique: true })` + duplicate | Insert rejects |

---

## Quick Check Answers

**1. Documents examined with vs without an email index?**

Without an index: MongoDB performs a collection scan (COLLSCAN). It must read
every document in the collection to check if `email` matches. For 1,000,000
documents, that is 1,000,000 reads. With an index on `email`: MongoDB performs
an index scan (IXSCAN). The index is a sorted structure (B-tree) that allows
binary search. Finding one specific email value takes O(log n) steps —
roughly 20 comparisons for 1,000,000 entries. Then MongoDB fetches exactly
the matching document — typically 1 read. Total: 21 operations instead of 1,000,000.

**2. Does `$or` need one index or two?**

Two indexes — one on `city` and one on `isVip`. MongoDB can use both indexes
simultaneously for an `$or` query (using an index union), or it may fall back
to a collection scan if no useful index combination exists. A single compound
index `{ city: 1, isVip: 1 }` does NOT efficiently serve this `$or` query
because `$or` conditions are on different documents, not the same document.
The correct solution: two separate indexes, one per `$or` condition.

**3. What does `explain('executionStats')` tell you?**

It shows the query execution plan and statistics: `totalDocsExamined` (how many
documents MongoDB read), `nReturned` (how many matched the filter), `executionTimeMillis`
(how long the query took), and the winning plan — the query strategy MongoDB
chose. The `stage` field shows `COLLSCAN` (full scan, no index) or `IXSCAN`
(used an index). Comparing `totalDocsExamined` to `nReturned` reveals
efficiency: 1,000,000 examined to find 1 document means no index is being used.
