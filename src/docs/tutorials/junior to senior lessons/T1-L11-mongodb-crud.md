# Junior to Senior — T1·L11 — MongoDB CRUD in Depth

**Prerequisites:** T1·L10 (MongoDB Fundamentals). You have connected to MongoDB
and run basic operations. This lesson covers the full CRUD API — every method
you need for real application development.

**What this lab adds:**
- `insertOne` and `insertMany` — create with returned IDs
- `findOne`, `find`, cursors, `toArray` — reading documents
- `updateOne`, `updateMany`, `$set`, `$push`, `$inc`, `$unset` — partial updates
- `deleteOne`, `deleteMany` — removing documents
- Projection — returning only specific fields
- `sort`, `limit`, `skip` — controlling result sets

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `collection.find({})` — what does this return, and why do you need `.toArray()`?
> 2. `updateOne({ name: 'Alice' }, { email: 'new@example.com' })` — is this correct?
>    What happens to Alice's other fields?
> 3. How do you add an item to an array field in a document without replacing
>    the whole array?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A complete CRUD demonstration covering every real-world operation:

```
$ npx ts-node mongo-crud.ts

[Insert] Created 5 contacts
[Find] Alice: alice@example.com, tags: ['vip', 'newsletter']
[Find] All active VIPs:
  Alice (London)
  Charlie (Madrid)

[Update] Alice's email updated
[Update] Added 'priority' tag to Alice
[Update] Incremented login count for all contacts

[Delete] Removed 1 inactive contact
[Count] 4 contacts remain

[Projection] Names only: ['Alice', 'Bob', 'Charlie', 'Diana']
[Sort+Limit] Top 2 by name (desc): ['Diana', 'Charlie']
```

---

## Step 1 — Setup and Insert

Create `mongo-crud.ts`:

```ts
import { MongoClient, ObjectId, type Collection, type WithId } from 'mongodb';

interface Contact {
  _id?:       ObjectId;
  name:       string;
  email:      string;
  city:       string;
  isActive:   boolean;
  isVip:      boolean;
  tags:       string[];
  loginCount: number;
  createdAt:  Date;
}

const MONGO_URI = 'mongodb://localhost:27017';

async function getCollection(): Promise<{ client: MongoClient; coll: Collection<Contact> }> {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const coll = client.db('crud_demo').collection<Contact>('contacts');
  await coll.deleteMany({});  // start clean each run
  return { client, coll };
}

async function demonstrateInsert(coll: Collection<Contact>): Promise<void> {
  const contacts: Contact[] = [
    { name: 'Alice',  email: 'alice@e.com',  city: 'London', isActive: true,  isVip: true,  tags: ['vip', 'newsletter'], loginCount: 5,  createdAt: new Date() },
    { name: 'Bob',    email: 'bob@e.com',    city: 'Paris',  isActive: true,  isVip: false, tags: ['newsletter'],         loginCount: 2,  createdAt: new Date() },
    { name: 'Charlie',email: 'charlie@e.com',city: 'Madrid', isActive: true,  isVip: true,  tags: ['vip'],                loginCount: 8,  createdAt: new Date() },
    { name: 'Diana',  email: 'diana@e.com',  city: 'Rome',   isActive: true,  isVip: false, tags: [],                     loginCount: 1,  createdAt: new Date() },
    { name: 'Eve',    email: 'eve@e.com',    city: 'Athens', isActive: false, isVip: false, tags: [],                     loginCount: 0,  createdAt: new Date() },
  ];

  const result = await coll.insertMany(contacts);
  console.log(`[Insert] Created ${result.insertedCount} contacts`);
}
```

### SAVE AND TRY

```bash
npx ts-node mongo-crud.ts
```

Expected: `[Insert] Created 5 contacts`

**Change something:** Use `insertOne` instead of `insertMany` for the first
contact and log `result.insertedId`. Expected: the `ObjectId` of Alice.

---

### Concept: Cursors — Why `find` Returns a Cursor, Not an Array

**What it is:** `collection.find(filter)` returns a `FindCursor` — a lazy
object that can retrieve results from the database one batch at a time.
`.toArray()` materialises all results into memory.

**Why cursors exist:**

```ts
// toArray() — loads ALL matching documents into memory:
const all = await coll.find({}).toArray();  // potentially millions of documents in RAM

// Cursor iteration — processes one batch at a time:
const cursor = coll.find({});
for await (const doc of cursor) {
  process(doc);  // only current batch in memory
}
```

**When to use `.toArray()` vs cursor iteration:**

| Use `.toArray()` | Use cursor iteration |
|---|---|
| Small result sets (< 10,000 docs) | Large result sets |
| Need all results to process together | Can process one at a time |
| Pagination — only fetching a page | Streaming/export |

**What it hides:** The cursor hides the network round-trips. MongoDB returns
results in batches (default 101 documents per batch). The cursor automatically
fetches the next batch when the current one is exhausted.

---

## Step 2 — Finding Documents

```ts
async function demonstrateFind(coll: Collection<Contact>): Promise<void> {
  // ── findOne — returns the first matching document or null:
  const alice = await coll.findOne({ name: 'Alice' });
  if (alice) {
    console.log(`[Find] Alice: ${alice.email}, tags: [${alice.tags.map(t => `'${t}'`).join(', ')}]`);
  }

  // ── find with filter — returns a cursor:
  const activeVips = await coll
    .find({ isActive: true, isVip: true })  // both conditions must match ($and implicit)
    .sort({ name: 1 })                      // sort by name ascending
    .toArray();

  console.log('[Find] All active VIPs:');
  activeVips.forEach(c => console.log(`  ${c.name} (${c.city})`));

  // ── Projection — return only specific fields:
  const namesOnly = await coll
    .find({})
    .project<{ name: string }>({ name: 1, _id: 0 })  // 1 = include, 0 = exclude
    .sort({ name: 1 })
    .toArray();

  console.log('[Projection] Names only:', namesOnly.map(c => c.name));

  // ── sort + limit + skip — pagination:
  const page2 = await coll
    .find({})
    .sort({ loginCount: -1 })  // -1 = descending
    .skip(2)                   // skip first 2
    .limit(2)                  // take 2
    .toArray();

  console.log('[Sort+Skip+Limit] Contacts 3-4 by loginCount desc:');
  page2.forEach(c => console.log(`  ${c.name} (logins: ${c.loginCount})`));
}
```

### SAVE AND TRY

Add `demonstrateFind` call to main:

```ts
async function main(): Promise<void> {
  const { client, coll } = await getCollection();
  try {
    await demonstrateInsert(coll);
    await demonstrateFind(coll);
  } finally {
    await client.close();
  }
}
main().catch(console.error);
```

```bash
npx ts-node mongo-crud.ts
```

Expected:
```
[Insert] Created 5 contacts
[Find] Alice: alice@e.com, tags: ['vip', 'newsletter']
[Find] All active VIPs:
  Alice (London)
  Charlie (Madrid)
[Projection] Names only: [ 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve' ]
[Sort+Skip+Limit] Contacts 3-4 by loginCount desc:
  Alice (logins: 5)
  Bob (logins: 2)
```

**Change something:** Add `{ isActive: true }` to the projection query. Expected
compile warning or error — projection types must be explicitly declared in
TypeScript. MongoDB silently includes the field at runtime regardless.

---

### Concept: Update Operators — Modifying Without Replacing

**What it is:** MongoDB update operations use operators (prefixed with `$`)
that specify how to change a field. Without operators, the entire document
is replaced.

**Critical distinction:**

```ts
// WRONG — replaces the entire document (loses all other fields!):
await coll.updateOne(
  { name: 'Alice' },
  { email: 'new@example.com' },  // no operator — this IS the new document
);
// Alice now only has: { _id, email: 'new@example.com' }

// RIGHT — updates only the email field:
await coll.updateOne(
  { name: 'Alice' },
  { $set: { email: 'new@example.com' } },
);
// Alice retains all other fields; only email changes
```

**Common update operators:**

| Operator | Effect | Example |
|---|---|---|
| `$set` | Set field to value | `{ $set: { email: 'new@e.com' } }` |
| `$unset` | Remove a field | `{ $unset: { temporaryField: '' } }` |
| `$inc` | Increment/decrement a number | `{ $inc: { loginCount: 1 } }` |
| `$push` | Append to an array | `{ $push: { tags: 'priority' } }` |
| `$pull` | Remove from an array | `{ $pull: { tags: 'inactive' } }` |
| `$addToSet` | Append if not present | `{ $addToSet: { tags: 'vip' } }` |

**You will see this again in:** Every MongoDB update in production code.
The `$set` operator is used in virtually every update. Forgetting `$set` is
a common MongoDB mistake that causes silent data loss.

---

## Step 3 — Update Operations

```ts
async function demonstrateUpdate(coll: Collection<Contact>): Promise<void> {
  // $set — update specific fields:
  await coll.updateOne(
    { name: 'Alice' },
    { $set: { email: 'alice-updated@example.com' } },
  );
  const alice = await coll.findOne({ name: 'Alice' });
  console.log(`[Update] Alice's email updated: ${alice?.email}`);

  // $push — add to array field:
  await coll.updateOne(
    { name: 'Alice' },
    { $push: { tags: 'priority' } },
  );
  const aliceAfterPush = await coll.findOne({ name: 'Alice' });
  console.log(`[Update] Alice's tags: [${aliceAfterPush?.tags.join(', ')}]`);

  // $inc — increment a number (no read-modify-write cycle needed):
  await coll.updateMany(
    {},                              // all documents
    { $inc: { loginCount: 1 } },    // increment loginCount by 1 for every contact
  );
  const allCounts = await coll.find({}).project<{name:string;loginCount:number}>({ name:1, loginCount:1, _id:0 }).toArray();
  console.log('[Update] Login counts after +1:');
  allCounts.forEach(c => console.log(`  ${c.name}: ${c.loginCount}`));
}
```

### SAVE AND TRY

```bash
npx ts-node mongo-crud.ts
```

Expected:
```
[Update] Alice's email updated: alice-updated@example.com
[Update] Alice's tags: [vip, newsletter, priority]
[Update] Login counts after +1:
  Alice: 6
  Bob: 3
  Charlie: 9
  Diana: 2
  Eve: 1
```

**Change something:** Try updating without `$set` — `{ email: 'broken' }`.
Expected: TypeScript should warn (the type system catches this). If it compiles,
Alice's document becomes `{ _id, email: 'broken' }` — all other fields gone.

---

## Step 4 — Delete and Count

```ts
async function demonstrateDelete(coll: Collection<Contact>): Promise<void> {
  // deleteOne — removes the first matching document:
  const result = await coll.deleteOne({ isActive: false });
  console.log(`\n[Delete] Removed ${result.deletedCount} inactive contact`);

  // countDocuments — count matching documents:
  const remaining = await coll.countDocuments();
  const activeCount = await coll.countDocuments({ isActive: true });
  console.log(`[Count] ${remaining} total, ${activeCount} active`);

  // deleteMany — remove all matching:
  const massDeleteResult = await coll.deleteMany({ isVip: false });
  console.log(`[Delete] Removed ${massDeleteResult.deletedCount} non-VIP contacts`);
  console.log(`[Count] ${await coll.countDocuments()} contacts remain`);
}
```

### SAVE AND TRY

```bash
npx ts-node mongo-crud.ts
```

Expected:
```
[Delete] Removed 1 inactive contact
[Count] 4 total, 4 active
[Delete] Removed 2 non-VIP contacts
[Count] 2 contacts remain
```

---

## 🎯 Challenge: Upsert Contact

**You know:** `insertMany`, `findOne`, `updateOne`, `deleteOne`.

**Task:** Write an `upsertContact(collection, contact)` function that:
- If a contact with the same `email` already exists, updates their `name`,
  `city`, and adds new `tags` (without duplicates using `$addToSet`)
- If no contact with that email exists, inserts a new document
- Returns the contact after the operation

MongoDB's `upsert` option: `updateOne(filter, update, { upsert: true })`
inserts a new document if no match is found.

```ts
const created = await upsertContact(coll, {
  name: 'Frank', email: 'frank@example.com', city: 'Oslo', tags: ['new']
});

const updated = await upsertContact(coll, {
  name: 'Frank Updated', email: 'frank@example.com', city: 'Bergen', tags: ['updated']
});

console.log(updated.name);  // 'Frank Updated'
console.log(updated.tags);  // ['new', 'updated'] — merged, not replaced
```

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
async function upsertContact(
  coll: Collection<Contact>,
  data: { name: string; email: string; city: string; tags: string[] },
): Promise<WithId<Contact>> {
  await coll.updateOne(
    { email: data.email },           // find by email
    {
      $set: {
        name: data.name,
        city: data.city,
        isActive: true,
        loginCount: 0,
        createdAt: new Date(),
      },
      $addToSet: {
        tags: { $each: data.tags },  // $each adds multiple items without duplicates
      },
    },
    { upsert: true },                // insert if not found
  );

  // Return the document after the upsert:
  const result = await coll.findOne({ email: data.email });
  if (!result) throw new Error(`Upsert failed for ${data.email}`);
  return result;
}
```

**Key insight:** `$addToSet` with `$each` solves the "merge tags" problem —
it adds only values not already in the array. `{ upsert: true }` makes
`updateOne` insert a new document if no match is found. The `$set` fields
are set on both create and update (they run regardless of whether it's an
insert or update). MongoDB combines the `$set` and `$addToSet` into a single
atomic operation — there is no window where the document exists partially updated.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `find` returns cursor | Log type of `coll.find({})` | `FindCursor` object |
| `.toArray()` needed | Log without `.toArray()` | Cursor object, not array |
| `$set` preserves fields | Update one field, check others | All other fields intact |
| No `$set` replaces doc | Attempt without `$set` in TypeScript | Type error or warning |
| `$inc` is atomic | `$inc: { count: 1 }` vs `count = count + 1` | Same result but `$inc` is race-condition safe |
| `$push` adds to array | Push one tag, count tags | Array length grows by 1 |
| `deleteMany` count | `deleteMany({}).deletedCount` | Total documents deleted |

---

## Quick Check Answers

**1. What does `collection.find({})` return and why do you need `.toArray()`?**

`find({})` returns a `FindCursor` — a lazy object that knows how to retrieve
results from MongoDB but has not yet fetched anything. This is intentional:
if the collection has 1 million documents, you do not want them all in memory
at once. The cursor fetches results in batches as you iterate. `.toArray()`
instructs the cursor to fetch all remaining batches and return them as a single
JavaScript array. For small, bounded result sets (a page of 20 items), `.toArray()`
is fine. For large or unbounded sets, iterate the cursor with `for await (const doc of cursor)`.

**2. `updateOne({ name: 'Alice' }, { email: 'new@example.com' })` — what happens?**

This replaces Alice's entire document with `{ email: 'new@example.com' }`.
All other fields (name, city, tags, loginCount, etc.) are lost. This is the
most common MongoDB mistake. The second argument to `updateOne` is NOT a set
of changes — it IS the new document (minus `_id`). To update only the email
field, you must use an update operator: `{ $set: { email: 'new@example.com' } }`.

**3. How do you add to an array field without replacing the whole array?**

Use `$push` (append one item: `{ $push: { tags: 'new-tag' } }`) or
`$addToSet` (append only if not present: `{ $addToSet: { tags: 'new-tag' } }`).
Both operators modify the array field in place without affecting any other
fields. To append multiple items at once, use `$each`:
`{ $push: { tags: { $each: ['tag1', 'tag2'] } } }`.
