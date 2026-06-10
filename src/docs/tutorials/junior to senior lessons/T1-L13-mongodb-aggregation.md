# Junior to Senior — T1·L13 — MongoDB Aggregation Pipeline

**Prerequisites:** T1·L12 (MongoDB Queries and Indexes). You can filter documents
efficiently. This lesson covers the aggregation pipeline — the MongoDB equivalent
of SQL's GROUP BY, JOIN, and aggregate functions.

**What this lab adds:**
- The pipeline concept — sequential stages that transform documents
- `$match` — filter (like WHERE)
- `$group` — aggregate (like GROUP BY)
- `$sort`, `$limit`, `$skip` — ordering and pagination
- `$project` — reshape documents (include, exclude, compute fields)
- `$lookup` — join from another collection

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You want to count contacts per city, sorted by count descending.
>    What three pipeline stages do you need?
> 2. `$match` before `$group` vs `$match` after `$group` — when is each used?
>    Which is more important for performance?
> 3. What does `$lookup` do, and which SQL clause is it equivalent to?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact analytics pipeline:

```
$ npx ts-node mongo-aggregate.ts

--- Contacts per city ---
London: 3
Paris: 2
Berlin: 1

--- Average logins by VIP status ---
VIP contacts: avg 7.3 logins
Non-VIP:      avg 2.1 logins

--- Top tags ---
newsletter: 4 contacts
vip: 3 contacts
priority: 1 contacts

--- Contacts with address data (lookup) ---
Alice (London) → 10 Downing St, London SW1A
Bob (Paris) → 1 Rue de la Paix, Paris 75001
```

---

### Concept: The Aggregation Pipeline

**What it is:** An aggregation pipeline is a sequence of stages. Each stage
receives the output of the previous stage, transforms it, and passes the result
to the next stage. The final stage's output is the query result.

```
Collection
  │
  ▼ $match    — filter documents (like WHERE)
  │
  ▼ $group    — group and aggregate (like GROUP BY + COUNT/SUM/AVG)
  │
  ▼ $sort     — order results
  │
  ▼ $limit    — take the first N
  │
  Result
```

**The problem before:**

```ts
// Without aggregation — do grouping in application code:
const all = await coll.find({}).toArray();
const byCity = all.reduce((groups, contact) => {
  const count = groups[contact.city] ?? 0;
  return { ...groups, [contact.city]: count + 1 };
}, {});
// Loads ALL documents into memory before grouping
```

**The solution:**

```ts
// Aggregation — MongoDB does the grouping inside the database:
const result = await coll.aggregate([
  { $group: { _id: '$city', count: { $sum: 1 } } },
  { $sort:  { count: -1 } },
]).toArray();
// Only the grouped results are returned — no full dataset in memory
```

**What it hides:** The aggregation pipeline hides the iteration and accumulation
that would otherwise happen in application code. The database engine processes
the pipeline efficiently, often using indexes for `$match` stages.

The invariant: stages run in order. A document passes through each stage sequentially.
The output type can change at any stage — `$group` produces `{ _id, aggregatedField }`
documents, not the original document shape.

**Canonical example:** A pipeline is a manufacturing assembly line.
Raw parts (documents) enter at stage 1 (`$match` — quality control, rejects defective).
Surviving parts move to stage 2 (`$group` — assembly, groups components into products).
Products move to stage 3 (`$sort` — sorted by size). Only the packaged products
are shipped (returned to the application).

**You will see this again in:** Every analytics query, every dashboard, every
"top N" or "count per category" report. The MongoDB aggregation pipeline is the
equivalent of a SQL SELECT with GROUP BY, HAVING, and ORDER BY.

---

## Step 1 — Setup and Basic Grouping

Create `mongo-aggregate.ts`:

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
  const coll = client.db('agg_demo').collection<Contact>('contacts');
  await coll.deleteMany({});

  await coll.insertMany([
    { name:'Alice',   email:'a@e.com', city:'London', isActive:true,  isVip:true,  tags:['vip','newsletter'], loginCount:8 },
    { name:'Bob',     email:'b@e.com', city:'Paris',  isActive:true,  isVip:false, tags:['newsletter'],       loginCount:3 },
    { name:'Charlie', email:'c@e.com', city:'London', isActive:true,  isVip:true,  tags:['vip','priority'],   loginCount:6 },
    { name:'Diana',   email:'d@e.com', city:'Berlin', isActive:false, isVip:false, tags:['newsletter'],       loginCount:1 },
    { name:'Eve',     email:'e@e.com', city:'Paris',  isActive:true,  isVip:false, tags:[],                   loginCount:2 },
    { name:'Frank',   email:'f@e.com', city:'London', isActive:true,  isVip:true,  tags:['vip','newsletter'], loginCount:8 },
  ]);

  return { client, coll };
}

async function contactsPerCity(coll: Collection<Contact>): Promise<void> {
  console.log('--- Contacts per city ---');

  const result = await coll.aggregate<{ _id: string; count: number }>([
    // Stage 1: group by city, count documents in each group:
    {
      $group: {
        _id:   '$city',    // group key — '$city' means the value of the city field
        count: { $sum: 1 }, // accumulate: add 1 for each document in the group
      },
    },
    // Stage 2: sort by count descending:
    { $sort: { count: -1 } },
  ]).toArray();

  result.forEach(r => console.log(`${r._id}: ${r.count}`));
}

async function main(): Promise<void> {
  const { client, coll } = await setup();
  try {
    await contactsPerCity(coll);
  } finally {
    await client.close();
  }
}
main().catch(console.error);
```

### SAVE AND TRY

```bash
npx ts-node mongo-aggregate.ts
```

Expected:
```
--- Contacts per city ---
London: 3
Paris: 2
Berlin: 1
```

**Change something:** Add a `$match` stage before `$group` to count only active
contacts: `{ $match: { isActive: true } }`. Expected: Berlin count drops to 0
(Diana is inactive), or Berlin disappears from results entirely.

---

### Concept: `$match` Placement — Performance Critical

**The rule:** Place `$match` as early as possible in the pipeline.

**Why:**

```
Without early $match:
  10,000 documents → $group (processes all) → $sort → $limit 10 → result

With $match first:
  10,000 documents → $match (keeps 200 active) → $group (processes 200) → $sort → $limit 10 → result
```

The `$group` stage with 200 documents instead of 10,000 is 50× faster.
If `$match` can use an index, even better — MongoDB never loads the filtered-out
documents into the pipeline at all.

**The exception:** `$match` AFTER `$group` is equivalent to SQL's `HAVING` —
filtering on aggregated results:

```ts
// Only cities with more than 2 contacts:
[
  { $group: { _id: '$city', count: { $sum: 1 } } },
  { $match: { count: { $gt: 2 } } },  // filter on aggregated count
]
```

You cannot filter on aggregated values before the aggregation exists.

---

## Step 2 — Averaging, Filtering on Aggregates

```ts
async function averageLoginsByVip(coll: Collection<Contact>): Promise<void> {
  console.log('\n--- Average logins by VIP status ---');

  const result = await coll.aggregate<{ _id: boolean; avgLogins: number; total: number }>([
    // Group by isVip, compute average and count:
    {
      $group: {
        _id:       '$isVip',
        avgLogins: { $avg: '$loginCount' },  // average of loginCount in each group
        total:     { $sum: 1 },
      },
    },
    // Sort: VIP contacts first (true sorts after false in ascending, so use desc):
    { $sort: { _id: -1 } },
  ]).toArray();

  result.forEach(r => {
    const label = r._id ? 'VIP contacts' : 'Non-VIP     ';
    console.log(`${label}: avg ${r.avgLogins.toFixed(1)} logins (${r.total} contacts)`);
  });
}

async function topTags(coll: Collection<Contact>): Promise<void> {
  console.log('\n--- Top tags ---');

  const result = await coll.aggregate<{ _id: string; count: number }>([
    // $unwind — expand the tags array: one document becomes N documents (one per tag):
    { $unwind: '$tags' },

    // Now each document has a single tag — group by it:
    { $group: { _id: '$tags', count: { $sum: 1 } } },

    // Sort and limit:
    { $sort:  { count: -1 } },
    { $limit: 5 },
  ]).toArray();

  result.forEach(r => console.log(`${r._id}: ${r.count} contacts`));
}
```

### SAVE AND TRY

Add calls to `main()`:
```ts
await averageLoginsByVip(coll);
await topTags(coll);
```

Expected:
```
--- Average logins by VIP status ---
VIP contacts: avg 7.3 logins (3 contacts)
Non-VIP     : avg 2.0 logins (3 contacts)

--- Top tags ---
vip: 3 contacts
newsletter: 4 contacts
priority: 1 contacts
```

*(Order of newsletter/vip may vary depending on counts)*

**Change something:** Add a `$match { isActive: true }` before `$unwind` in
`topTags`. Diana (inactive) has 'newsletter' — removing her changes the count.

---

### Concept: `$project` — Reshaping Documents

**What it is:** `$project` controls which fields appear in the output documents.
It can include, exclude, and compute new fields.

```ts
// Include only name and email (exclude everything else including _id):
{ $project: { _id: 0, name: 1, email: 1 } }

// Compute a new field:
{ $project: {
    name: 1,
    isHighValue: { $gt: ['$loginCount', 5] },     // computed boolean
    displayName: { $toUpper: '$name' },            // computed string
} }
```

**What it hides:** `$project` hides the transformation that would otherwise
happen in application code after fetching all fields. Computing derived fields
in the database saves network bandwidth — you only transfer what you need.

---

## Step 3 — `$project` and `$lookup`

```ts
async function projectAndLookup(coll: Collection<Contact>): Promise<void> {
  console.log('\n--- Projection ---');

  // Project: compute a displayName and classify as high/low value:
  const projected = await coll.aggregate<{
    displayName: string;
    city: string;
    isHighValue: boolean;
  }>([
    { $match:   { isActive: true } },
    { $project: {
        _id:         0,
        displayName: { $toUpper: '$name' },        // uppercase name
        city:        1,
        isHighValue: { $gte: ['$loginCount', 6] }, // boolean: high logins?
    }},
    { $sort: { displayName: 1 } },
  ]).toArray();

  projected.forEach(p => {
    const label = p.isHighValue ? '★' : ' ';
    console.log(`  ${label} ${p.displayName} — ${p.city}`);
  });
}

// For $lookup, create a second collection (addresses):
async function setupAddresses(client: MongoClient): Promise<void> {
  const addresses = client.db('agg_demo').collection('addresses');
  await addresses.deleteMany({});
  await addresses.insertMany([
    { contactEmail: 'a@e.com', street: '10 Downing St',    city: 'London', postcode: 'SW1A' },
    { contactEmail: 'b@e.com', street: '1 Rue de la Paix', city: 'Paris',  postcode: '75001' },
  ]);
}

async function lookupAddresses(
  coll: Collection<Contact>,
  client: MongoClient,
): Promise<void> {
  console.log('\n--- Lookup (join) ---');

  await setupAddresses(client);

  const result = await coll.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from:         'addresses',     // collection to join from
        localField:   'email',         // field in contacts
        foreignField: 'contactEmail',  // field in addresses
        as:           'address',       // output array field name
      },
    },
    // $unwind the address array (1 or 0 addresses per contact):
    { $unwind: { path: '$address', preserveNullAndEmpty: true } },
    { $match:  { address: { $exists: true, $ne: null } } },  // only contacts with addresses
    { $project: { _id: 0, name: 1, 'address.street': 1, 'address.city': 1, 'address.postcode': 1 } },
  ]).toArray();

  result.forEach((r: any) => {
    const addr = r.address;
    if (addr) console.log(`${r.name} → ${addr.street}, ${addr.city} ${addr.postcode}`);
  });
}
```

### SAVE AND TRY

Add calls to main:
```ts
await projectAndLookup(coll);
await lookupAddresses(coll, client);
```

Expected:
```
--- Projection ---
    BOB — Paris
  ★ ALICE — London
  ★ CHARLIE — London
  ★ FRANK — London
    EVE — Paris

--- Lookup (join) ---
Alice → 10 Downing St, London SW1A
Bob → 1 Rue de la Paix, Paris 75001
```

---

## 🎯 Challenge: Monthly Signup Report

**You know:** `$match`, `$group`, `$sort`, `$project`, `$lookup`.

**Task:** Insert 20 contacts with different `createdAt` dates across three months.
Write a pipeline that produces a report:

```
January 2026:   8 new contacts, 4 VIP
February 2026:  7 new contacts, 2 VIP
March 2026:     5 new contacts, 3 VIP
```

**Pipeline stages needed:**
1. `$group` by month and year using `$dateToString` or `$month` + `$year`
2. Compute `total` with `$sum: 1` and `vipCount` with `$sum: { $cond: [isVip, 1, 0] }`
3. `$sort` by date ascending
4. `$project` to format the output

**Hint:** `$month: '$createdAt'` extracts the month number. `$year: '$createdAt'` extracts the year.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
async function monthlyReport(coll: Collection<Contact>): Promise<void> {
  // Insert contacts with varied dates:
  const months = [1, 2, 3];
  const contacts = months.flatMap(month =>
    Array.from({ length: month === 1 ? 8 : month === 2 ? 7 : 5 }, (_, i) => ({
      name:       `Contact_${month}_${i}`,
      email:      `c${month}${i}@e.com`,
      city:       'London',
      isActive:   true,
      isVip:      i % 3 === 0,  // every 3rd is VIP
      tags:       [],
      loginCount: 0,
      createdAt:  new Date(2026, month - 1, i + 1), // Jan=0, Feb=1, Mar=2 in JS Date
    }))
  );

  await coll.deleteMany({});
  await coll.insertMany(contacts);

  const result = await coll.aggregate<{
    _id:      { year: number; month: number };
    total:    number;
    vipCount: number;
  }>([
    {
      $group: {
        _id: {
          year:  { $year:  '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total:    { $sum: 1 },
        vipCount: { $sum: { $cond: [{ $eq: ['$isVip', true] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id:      0,
        month:    {
          $dateToString: {
            format: '%B %Y',
            date:   {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: 1,
              },
            },
          },
        },
        total:    1,
        vipCount: 1,
      },
    },
  ]).toArray();

  console.log('\n--- Monthly Signup Report ---');
  result.forEach(r => {
    console.log(`${r.month}: ${r.total} new contacts, ${r.vipCount} VIP`);
  });
}
```

**Key insight:** MongoDB's date operators (`$year`, `$month`, `$dateToString`,
`$dateFromParts`) let you extract and format date components inside the pipeline.
`$cond` is MongoDB's conditional: `{ $cond: [condition, trueValue, falseValue] }`.
Using `$sum` with `$cond` is the pattern for counting a subset of grouped documents —
the equivalent of SQL's `COUNT(*) FILTER (WHERE is_vip)`.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `$group` groups correctly | Count per city | Each city appears once |
| `$match` before `$group` | Filter then group | Only matching docs grouped |
| `$match` after `$group` | Group then filter | Filters on aggregated values |
| `$unwind` flattens arrays | `$unwind: '$tags'` then `$group` | One doc per tag-contact pair |
| `$project` excludes `_id` | `{ $project: { _id: 0 } }` | `_id` absent from results |
| `$lookup` joins collections | Two collections, matching key | Joined documents in `as` field |
| Pipeline order matters | Move `$sort` before `$group` | Results differ or error |

---

## Quick Check Answers

**1. Three pipeline stages to count contacts per city, sorted by count descending?**

1. `$group: { _id: '$city', count: { $sum: 1 } }` — creates one document per
   unique city value, with `count` accumulated as 1 per input document
2. `$sort: { count: -1 }` — sort the grouped documents by count, highest first
3. (Optional) `$limit: N` — take only the top N cities

The `$group` stage is essential — without it you would have one document per
contact, not one document per city. The `$sort` stage operates on the output
of `$group`, which has `{ _id: city, count: number }` shape.

**2. `$match` before vs after `$group` — which is performance-critical?**

`$match` before `$group` is critical for performance. It reduces the number of
documents that the `$group` stage must process. If `$match` can use an index,
MongoDB never reads the filtered-out documents at all — they never enter the
pipeline. `$match` after `$group` is used for filtering on aggregated values
(like SQL's HAVING clause) — it cannot run before `$group` because the
aggregated values do not exist yet. Both serve different purposes; only the
early `$match` affects performance significantly.

**3. What does `$lookup` do? Which SQL clause?**

`$lookup` joins documents from another collection based on a matching field value.
It is equivalent to SQL's `LEFT JOIN`. For each document in the current pipeline,
`$lookup` finds all documents in the `from` collection where `foreignField` equals
the current document's `localField` value, and adds them as an array in a new
field (`as`). Since it is a LEFT JOIN, documents with no match get an empty array.
Unlike SQL joins, `$lookup` always produces an array — even for 1-to-1 relationships.
Use `$unwind` immediately after to flatten the array back to individual documents.
