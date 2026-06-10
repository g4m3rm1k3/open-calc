# Junior to Senior — T1·L10 — MongoDB Fundamentals

**Prerequisites:** T1·L9 (Pagination and Data Transformation). You can fetch
and transform API data. This lesson covers connecting to and working with MongoDB —
a document database where each record is a self-contained JSON-like object.

**What this lab adds:**
- Document databases vs relational databases — the trade-offs
- Connecting to MongoDB with the Node.js driver
- Collections and documents — the equivalent of tables and rows
- `ObjectId` — MongoDB's built-in identifier
- BSON — what MongoDB actually stores

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A contact has an address with city, street, and postcode. In a relational
>    database, where does the address live? In MongoDB?
> 2. Two documents in the same MongoDB collection — must they have the same fields?
> 3. What type is a MongoDB `_id` by default, and why is it not just a number?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact store backed by MongoDB:

```
$ npx ts-node mongo-contacts.ts

--- Connected to MongoDB ---

--- Inserted 3 contacts ---
IDs: 64a1f2..., 64a1f3..., 64a1f4...

--- Found by ID ---
Contact: Alice <alice@example.com> — London

--- Listed all contacts ---
Total: 3
  Alice — London
  Bob — Paris
  Carol — Berlin

--- Disconnected ---
```

---

### Concept: Document Databases vs Relational Databases

**What it is:** A document database stores each record as a self-contained
document (a JSON-like object). Related data is often embedded directly in the
document rather than in a separate table with a foreign key.

**Relational (SQL):**
```sql
-- Two tables, joined at query time:
contacts: id | name  | email
addresses: id | contact_id | city | country

SELECT c.name, a.city
FROM contacts c JOIN addresses a ON a.contact_id = c.id;
```

**Document (MongoDB):**
```json
{
  "_id": "64a1f2...",
  "name": "Alice",
  "email": "alice@example.com",
  "address": {
    "city": "London",
    "country": "UK"
  }
}
```

The contact and its address are one document. No join needed.

**When to embed vs reference:**

| Embed | Reference (separate document) |
|---|---|
| Data is always accessed together | Data is accessed independently |
| One-to-one or one-to-few | One-to-many or many-to-many |
| Data does not change independently | Data is shared across documents |
| Examples: address, preferences | Examples: orders, tags shared across items |

**What it hides:** Embedding hides join complexity. If every contact always
needs its address, storing them together means one read operation instead of two.

The invariant: a MongoDB document is atomic — a write either updates the entire
document or nothing. Embedded data stays consistent with its parent.

**Canonical example:** A relational database is like a library with separate
shelves for books, authors, and publishers — linked by catalogue numbers.
A document database is like giving each book its own folder with a photocopy
of the author bio and publisher info inside. Looking up one book's full info
is instant — but if the author changes their bio, you must update every folder.

**You will see this again in:** Any application that needs flexible schemas,
nested data structures, or high read performance on self-contained records.
MongoDB is widely used for user profiles, content management, and real-time data.

---

## Step 1 — Install MongoDB and Connect

Install the MongoDB Node.js driver:

```bash
npm install mongodb
npm install -D @types/mongodb  # if needed (types may be bundled)
```

Start a local MongoDB instance. If you do not have MongoDB installed, use
MongoDB Atlas (free cloud instance) or MongoDB Memory Server for tests:

```bash
npm install -D mongodb-memory-server
```

Create `mongo-contacts.ts`:

```ts
import { MongoClient, ObjectId, type Collection } from 'mongodb';

// ── Types ────────────────────────────────────────────────────────────

interface ContactDocument {
  _id?:    ObjectId;   // optional: MongoDB assigns it on insert
  name:    string;
  email:   string;
  address: {
    city:    string;
    country: string;
  };
  tags:      string[];
  createdAt: Date;
}

// ── Connection ────────────────────────────────────────────────────────

const MONGO_URI = 'mongodb://localhost:27017';  // adjust if using Atlas

async function connect(): Promise<{ client: MongoClient; contacts: Collection<ContactDocument> }> {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('--- Connected to MongoDB ---\n');

  const db       = client.db('contacts_db');
  const contacts = db.collection<ContactDocument>('contacts');

  return { client, contacts };
}
```

### SAVE AND TRY

```bash
npx ts-node mongo-contacts.ts
```

Expected: no output (nothing calls `connect()` yet). If MongoDB is not running,
the script will hang or time out. Start MongoDB first.

**Change something:** Call `connect()` and log the collection name:
```ts
const { client, contacts } = await connect();
console.log('Collection:', contacts.collectionName);
await client.close();
```
Expected: `Collection: contacts`.

---

### Concept: `ObjectId` — MongoDB's Document Identifier

**What it is:** An `ObjectId` is a 12-byte BSON type that MongoDB generates
for every document's `_id` field by default. It encodes a timestamp, machine
ID, process ID, and a random increment — making it globally unique without
a central coordinator.

**Why not just use a number?**

```
Auto-increment integer (SQL approach):
  - Requires a central counter
  - Multiple servers cannot generate IDs independently
  - Exposes record count to clients (security risk)

ObjectId:
  - Generated by the client or MongoDB
  - Globally unique across servers
  - Encodes creation timestamp (extractable)
  - Not guessable
```

**The timestamp in an ObjectId:**

```ts
const id = new ObjectId();
console.log(id.getTimestamp()); // Date — when this ObjectId was created
```

**What it hides:** `ObjectId` hides the coordination problem of unique ID
generation in a distributed system. Any client, any server, any thread can
generate an `ObjectId` that will not collide with any other.

**Canonical example:** An `ObjectId` is like a unique barcode generated on a
portable printer. Every warehouse can print barcodes independently without
checking with a central barcode registry. Collisions are statistically impossible
because the barcode encodes who made it, when, and a random counter.

**Watch for:** `ObjectId` is not a string. `'64a1f2...' === new ObjectId('64a1f2...')`
is `false`. When building a query, use `new ObjectId(idString)` not the raw string.

---

## Step 2 — Insert Documents

```ts
async function insertContacts(
  contacts: Collection<ContactDocument>,
): Promise<void> {
  // Delete existing data to start fresh:
  await contacts.deleteMany({});

  const sampleContacts: ContactDocument[] = [
    {
      name:      'Alice',
      email:     'alice@example.com',
      address:   { city: 'London', country: 'UK' },
      tags:      ['vip', 'newsletter'],
      createdAt: new Date(),
    },
    {
      name:      'Bob',
      email:     'bob@example.com',
      address:   { city: 'Paris', country: 'FR' },
      tags:      ['newsletter'],
      createdAt: new Date(),
    },
    {
      name:      'Carol',
      email:     'carol@example.com',
      address:   { city: 'Berlin', country: 'DE' },
      tags:      [],
      createdAt: new Date(),
    },
  ];

  // insertMany — inserts all at once, returns the generated _id values:
  const result = await contacts.insertMany(sampleContacts);

  console.log('--- Inserted 3 contacts ---');
  console.log('IDs:', Object.values(result.insertedIds).map(id => id.toString()));
}

// ── Main ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { client, contacts } = await connect();

  try {
    await insertContacts(contacts);
  } finally {
    await client.close();
    console.log('\n--- Disconnected ---');
  }
}

main().catch(console.error);
```

### SAVE AND TRY

```bash
npx ts-node mongo-contacts.ts
```

Expected:
```
--- Connected to MongoDB ---

--- Inserted 3 contacts ---
IDs: 64a1f2abc..., 64a1f2abd..., 64a1f2abe...
```

**Change something:** Insert a document without the `tags` field:
`{ name: 'Dave', email: 'dave@example.com', address: { city: 'Rome', country: 'IT' }, createdAt: new Date() }`.
MongoDB accepts it — documents in the same collection can have different fields.
Add `tags?: string[]` to `ContactDocument` to make this type-safe.

---

## Step 3 — Find, Update, Delete

```ts
async function demonstrateCRUD(contacts: Collection<ContactDocument>): Promise<void> {
  // ── Find one ──────────────────────────────────────────────────────
  const alice = await contacts.findOne({ name: 'Alice' });
  if (alice) {
    console.log('\n--- Found by name ---');
    console.log(`Contact: ${alice.name} <${alice.email}> — ${alice.address.city}`);

    // ── Find by ID ───────────────────────────────────────────────
    const byId = await contacts.findOne({ _id: alice._id });
    console.log(`Found by ID: ${byId?.name}`);
  }

  // ── Find all ──────────────────────────────────────────────────────
  const all = await contacts.find({}).toArray();
  console.log('\n--- Listed all contacts ---');
  console.log(`Total: ${all.length}`);
  all.forEach(c => console.log(`  ${c.name} — ${c.address.city}`));

  // ── Update ────────────────────────────────────────────────────────
  await contacts.updateOne(
    { name: 'Alice' },                              // filter
    { $set: { email: 'alice-new@example.com' } },   // update operator
  );

  const updatedAlice = await contacts.findOne({ name: 'Alice' });
  console.log('\n--- After update ---');
  console.log(`Alice's email: ${updatedAlice?.email}`);

  // ── Delete ────────────────────────────────────────────────────────
  const deleteResult = await contacts.deleteOne({ name: 'Carol' });
  console.log(`\n--- Deleted ${deleteResult.deletedCount} contact ---`);
  console.log(`Remaining: ${await contacts.countDocuments()}`);
}

// Update main() to call this:
async function main(): Promise<void> {
  const { client, contacts } = await connect();
  try {
    await insertContacts(contacts);
    await demonstrateCRUD(contacts);
  } finally {
    await client.close();
    console.log('\n--- Disconnected ---');
  }
}
```

### SAVE AND TRY

```bash
npx ts-node mongo-contacts.ts
```

Expected:
```
--- Found by name ---
Contact: Alice <alice@example.com> — London
Found by ID: Alice

--- Listed all contacts ---
Total: 3
  Alice — London
  Bob — Paris
  Carol — Berlin

--- After update ---
Alice's email: alice-new@example.com

--- Deleted 1 contact ---
Remaining: 2
```

**Change something:** Try `contacts.updateOne({ name: 'Alice' }, { email: 'broken' })`.
Expected: MongoDB throws an error — you must use an update operator like `$set`.
Without operators, MongoDB replaces the entire document.

---

## 🎯 Challenge: Contact Search Function

**You know:** `insertMany`, `findOne`, `find`, `updateOne`, `deleteOne`.

**Task:** Write a `searchContacts(collection, query)` function that searches
for contacts matching any of these criteria:
- Name contains the query string (case-insensitive)
- Email starts with the query string
- City equals the query string exactly

```ts
const results = await searchContacts(contacts, 'ali');
// Returns Alice (name contains 'ali')

const results2 = await searchContacts(contacts, 'London');
// Returns Alice (city equals 'London')
```

**Requirements:**
- Use `$or` to combine multiple conditions
- Use `$regex` for the name search with the `i` flag (case-insensitive)
- Return a typed `ContactDocument[]`
- Sort results by `name` ascending

**Hint:** MongoDB query: `{ $or: [{ name: /query/i }, { email: { $regex: `^${query}` } }] }`

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
async function searchContacts(
  collection: Collection<ContactDocument>,
  query: string,
): Promise<ContactDocument[]> {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex special chars

  return collection
    .find({
      $or: [
        { name:          { $regex: escaped, $options: 'i' } }, // name contains (case-insensitive)
        { email:         { $regex: `^${escaped}`, $options: 'i' } }, // email starts with
        { 'address.city': query }, // city exact match (note dot notation for nested field)
      ],
    })
    .sort({ name: 1 }) // 1 = ascending
    .toArray();
}

// Test:
const aliSearch = await searchContacts(contacts, 'ali');
console.log('Search "ali":', aliSearch.map(c => c.name));
// [ 'Alice' ]

const londonSearch = await searchContacts(contacts, 'London');
console.log('Search "London":', londonSearch.map(c => c.name));
// [ 'Alice' ]
```

**Key insight:** `$or` takes an array of conditions — a document matches if any
condition is true. The dot notation `'address.city'` accesses nested fields in
MongoDB queries. Escaping the query string before building the regex prevents
injection — a user who searches for `.*` would otherwise match every document.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Connection works | `connect()` completes | No error |
| Insert returns IDs | `insertMany` result | Object with `insertedIds` |
| `_id` is ObjectId | `typeof result._id` | `'object'` |
| Find returns documents | `findOne({ name: 'Alice' })` | Alice's document |
| `$set` updates field | Update email, findOne again | New email returned |
| Delete reduces count | Delete one, `countDocuments()` | Count reduced by 1 |
| Missing field in filter | `findOne({ name: 'Nonexistent' })` | `null` |

---

## Quick Check Answers

**1. Where does an address live in relational vs MongoDB?**

In a relational database, the address is in a separate `addresses` table with
a foreign key linking it to the `contacts` table. Retrieving a contact with
its address requires a `JOIN` at query time. In MongoDB, the address is embedded
directly inside the contact document as a nested object. The entire contact —
including its address — is returned in one read with no join needed. The trade-off:
embedded data is efficient for reads but harder to update independently. If many
contacts share the same city object and the city name changes, every embedded
address must be updated. In a relational database, you update one row in the
`cities` table.

**2. Must documents in the same collection have the same fields?**

No. MongoDB has a flexible schema — two documents in the same collection can
have completely different fields. This is different from SQL where every row
must match the table's column definitions. The flexibility is useful when data
evolves over time (old documents have the old shape; new documents have the new
shape). The risk is that you lose compile-time safety about which fields exist.
The MongoDB TypeScript driver lets you define an interface for the collection
(`Collection<ContactDocument>`) to get type safety at the application level,
even though the database itself does not enforce it.

**3. What type is MongoDB's `_id` and why not a number?**

The `_id` is an `ObjectId` by default — a 12-byte value that encodes a timestamp,
machine identifier, process identifier, and a random counter. It is not a number
because auto-increment numbers require a central coordinator: every insert must
ask "what is the next number?" in sequence. This creates a bottleneck in
distributed systems (multiple servers writing to the same database). An `ObjectId`
is generated independently by any client without coordination. Collision is
statistically impossible because each ObjectId encodes who generated it and when.
