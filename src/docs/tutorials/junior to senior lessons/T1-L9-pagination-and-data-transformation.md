# Junior to Senior — T1·L9 — Pagination and Data Transformation

**Prerequisites:** T1·L8 (HTTP with fetch). You can make API requests.
This lesson covers how to retrieve multi-page data and how to merge, transform,
and join data from multiple sources.

**What this lab adds:**
- Offset pagination — `?page=2&limit=20`
- Cursor pagination — `?after=cursor_id` — why it is more reliable
- Fetching all pages with a `while` loop
- Merging data from two sources on a shared key
- Transforming nested/flat data structures

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You fetch page 1 of a 100-item list. Between your page 1 and page 2
>    requests, someone adds a new item at position 1. What does page 2 return
>    for offset pagination? For cursor pagination?
> 2. You have two arrays: contacts (with `email`) and addresses (with `email`
>    and `city`). How do you combine them into one array of enriched contacts?
> 3. `Promise.all` fetches all pages at the same time. When is that dangerous?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A paginated contact fetcher that retrieves all users and merges them with
their address data:

```
$ npx ts-node paginate.ts

--- Offset Pagination ---
Page 1: 3 users
Page 2: 3 users
Page 3: 3 users
Page 4: 1 user
Total fetched: 10 users

--- Data Merging ---
Alice Graham — London, UK
Ervin Howell — Victor Plains, US
... (10 contacts with addresses)

--- Transformation ---
By city:
  Gwenborough: 1 contact
  Wisokyburgh: 1 contact
  ...
```

---

### Concept: Offset Pagination

**What it is:** Offset pagination divides results into pages using two
parameters: `page` (which page to fetch) or `offset` (how many items to skip),
and `limit` (how many items per page).

```
GET /users?page=1&limit=3  → items 1–3
GET /users?page=2&limit=3  → items 4–6
GET /users?page=3&limit=3  → items 7–9
GET /users?page=4&limit=3  → items 10 (last page — fewer than limit)
```

**The "last page" detection:**
```ts
// Page is the last one when fewer items are returned than the limit:
const isLastPage = items.length < limit;

// Or when an API provides total count:
const isLastPage = offset + items.length >= total;
```

**The classic offset pagination bug:**

```
Page 1 fetch: returns items 1, 2, 3
↕ Someone inserts a new item at position 1
Page 2 fetch: returns items 4, 5, 6 (was 3, 4, 5 before the insert)
```

Item 3 (which was at the boundary) is now shifted to position 4. Page 2
returns it again. Some items are duplicated; others are skipped.

**Cursor pagination solves this:**

Instead of "skip N items," a cursor is an opaque ID that says "give me items
after this specific item." New insertions at the top do not affect the cursor
position. The cursor is usually the ID of the last item on the previous page.

**You will see this again in:** Every API that returns lists (REST APIs, GraphQL),
MongoDB pagination, SQL `LIMIT`/`OFFSET`, infinite scroll implementations.
Offset pagination is simple to implement; cursor pagination is correct at scale.

---

## Step 1 — Offset Pagination

Create `paginate.ts`:

```ts
const API_BASE = 'https://jsonplaceholder.typicode.com';

interface User {
  id:       number;
  name:     string;
  email:    string;
  username: string;
  address: {
    city:    string;
    suite:   string;
    street:  string;
    zipcode: string;
    geo:     { lat: string; lng: string };
  };
}

async function fetchPage(page: number, limit: number): Promise<User[]> {
  const url      = `${API_BASE}/users?_page=${page}&_limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchAllPages(limit: number): Promise<User[]> {
  const allUsers: User[] = [];
  let   page = 1;

  console.log('--- Offset Pagination ---');

  while (true) {
    const pageUsers = await fetchPage(page, limit);
    console.log(`Page ${page}: ${pageUsers.length} users`);

    allUsers.push(...pageUsers);  // spread append

    // Last page: fewer items than the limit:
    if (pageUsers.length < limit) break;

    page++;
  }

  console.log(`Total fetched: ${allUsers.length} users`);
  return allUsers;
}

async function main(): Promise<void> {
  const users = await fetchAllPages(3);
}

main().catch(console.error);
```

### SAVE AND TRY

```bash
npx ts-node paginate.ts
```

Expected:
```
--- Offset Pagination ---
Page 1: 3 users
Page 2: 3 users
Page 3: 3 users
Page 4: 1 user
Total fetched: 10 users
```

**Change something:** Change the limit to `5`. Expected: page 1 has 5,
page 2 has 5. The pagination still works — the limit is the page size.
Change it back to 3 to keep the pagination visible.

---

### Concept: Joining Data from Two Sources

**What it is:** A join combines records from two arrays that share a common key —
like SQL's `JOIN` but in memory with JavaScript.

**The problem before:**

```ts
// O(n²) approach — for each user, scan all addresses:
const enriched = users.map(user => ({
  ...user,
  address: addresses.find(a => a.userId === user.id),
}));
```

For 100 users and 100 addresses, this is 100 × 100 = 10,000 comparisons.

**The solution — pre-index one collection:**

```ts
// Build an index: O(n) once
const addressIndex = new Map(addresses.map(a => [a.userId, a]));

// Join: O(1) per lookup — O(n) total
const enriched = users.map(user => ({
  ...user,
  address: addressIndex.get(user.id),
}));
```

**What it hides:** The Map-based join hides the linear scan. The Map is a
hash map — looking up `addressIndex.get(userId)` is O(1) regardless of
how many addresses exist.

**Canonical example:** A join is like having a phone book sorted by name
(the Map index) instead of by when people moved to the city (the unsorted array).
Finding a number by name takes constant time with the phone book; it takes
linear time scanning the unsorted list.

**You will see this again in:** Any time you relate two data sources (users + orders,
contacts + addresses, products + inventory), normalised database query results,
API response merging. This Map-based join is the correct approach at any scale.

---

## Step 2 — Merging User and Address Data

```ts
interface EnrichedContact {
  id:       number;
  name:     string;
  email:    string;
  city:     string;
  country:  string;  // derived from the address data
}

// JSONPlaceholder users already have addresses — let's use a transformation:
function enrichUsers(users: User[]): EnrichedContact[] {
  return users.map(user => ({
    id:      user.id,
    name:    user.name,
    email:   user.email,
    city:    user.address.city,
    country: 'US',  // all JSONPlaceholder addresses are US
  }));
}

// Add to main() after fetchAllPages:
const enriched = enrichUsers(users);

console.log('\n--- Data Merging ---');
enriched.slice(0, 5).forEach(c => {
  console.log(`${c.name} — ${c.city}, ${c.country}`);
});
```

### SAVE AND TRY

```bash
npx ts-node paginate.ts
```

Expected new output:
```
--- Data Merging ---
Leanne Graham — Gwenborough, US
Ervin Howell — Wisokyburgh, US
Clementine Bauch — Anaheim, US
Patricia Lebsack — South Elvis, US
Chelsey Dietrich — Roscoeview, US
```

**Change something:** Add a `fullAddress` field to `EnrichedContact`:
```ts
fullAddress: `${user.address.street}, ${user.address.city} ${user.address.zipcode}`
```
Log `c.fullAddress` for each contact.

---

### Concept: Data Transformation — Grouping and Aggregating

**What it is:** Transforming a flat list into a grouped structure using `reduce`.

**The problem:**

```ts
// Group contacts by city:
// [{ name: 'Alice', city: 'London' }, { name: 'Bob', city: 'London' }]
// → { London: [Alice, Bob], Paris: [Carol] }
```

**The solution with `reduce`:**

```ts
const byCity = contacts.reduce<Record<string, EnrichedContact[]>>(
  (groups, contact) => ({
    ...groups,
    [contact.city]: [...(groups[contact.city] ?? []), contact],
  }),
  {},
);
```

**Or — cleaner with a Map:**

```ts
const byCity = contacts.reduce((map, contact) => {
  const group = map.get(contact.city) ?? [];
  return map.set(contact.city, [...group, contact]);
}, new Map<string, EnrichedContact[]>());
```

**You will see this again in:** Any dashboard, analytics page, or grouped
display. "Show contacts grouped by city" is the frontend's job; the data
structure is this groupBy transform.

---

## Step 3 — Grouping and Counting

```ts
// Group contacts by city and count:
function groupByCity(contacts: EnrichedContact[]): Map<string, number> {
  return contacts.reduce((map, contact) => {
    map.set(contact.city, (map.get(contact.city) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
}

// Sort by count descending:
function sortedCityCounts(cityMap: Map<string, number>): [string, number][] {
  return [...cityMap.entries()].sort(([, a], [, b]) => b - a);
}

// Add to main():
const cityGroups = groupByCity(enriched);
const sorted     = sortedCityCounts(cityGroups);

console.log('\n--- Transformation ---');
console.log('By city:');
sorted.forEach(([city, count]) => {
  console.log(`  ${city}: ${count} contact${count === 1 ? '' : 's'}`);
});
```

### SAVE AND TRY

```bash
npx ts-node paginate.ts
```

Expected:
```
--- Transformation ---
By city:
  South Elvis: 1 contacts
  Gwenborough: 1 contacts
  ...
```

**Change something:** Instead of counting per city, list the names: replace `count`
with an array of contact names. Hint: use `map.get(city) ?? []` and append `.push(name)`.

---

## 🎯 Challenge: Cursor Pagination Simulation

**You know:** Offset pagination, data merging, transformations.

**Task:** Simulate cursor pagination using JSONPlaceholder's ID-based filtering.
Implement `fetchAllWithCursor(initialCursor: number, limit: number): Promise<User[]>`
that fetches users page by page using `?id_gte=${cursor}&_limit=${limit}`.

After each page, the next cursor is `lastId + 1` where `lastId` is the ID of
the last item on the current page.

```ts
const users = await fetchAllWithCursor(1, 3);
// Fetches: ids 1-3, then 4-6, then 7-9, then 10-12 (partial)
```

**Requirements:**
- Uses cursor (ID-based) not page number
- Stops when fewer than `limit` items are returned
- Returns all users in order

**Hint:** JSONPlaceholder's `_gte` filter: `/users?id_gte=4&_limit=3` returns
users with id ≥ 4, limited to 3.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
async function fetchAllWithCursor(
  initialCursor: number,
  limit: number,
): Promise<User[]> {
  const allUsers: User[] = [];
  let cursor = initialCursor;

  console.log('\n--- Cursor Pagination ---');

  while (true) {
    const url      = `${API_BASE}/users?id_gte=${cursor}&_limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const pageUsers: User[] = await response.json();
    console.log(`Cursor ${cursor}: fetched ${pageUsers.length} users`);

    allUsers.push(...pageUsers);

    // No more items:
    if (pageUsers.length < limit) break;

    // Move cursor to just after the last ID on this page:
    cursor = pageUsers[pageUsers.length - 1].id + 1;
  }

  console.log(`Total via cursor: ${allUsers.length}`);
  return allUsers;
}

// Add to main():
await fetchAllWithCursor(1, 3);
```

**Key insight:** The cursor is the last item's ID + 1, not a page number.
If a new user is inserted with a large ID (say 50), existing cursor navigation
from id=1 to id=10 is unaffected — the cursor points past ID 10 regardless.
The stability of cursor pagination comes from this independence: the cursor
says "give me everything after this specific item," not "skip N items from
the start" (which shifts when items are inserted at the beginning).

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Offset pagination stops correctly | `pageUsers.length < limit` at end | Loop exits |
| All pages collected | `allUsers.length` after loop | 10 (all JSONPlaceholder users) |
| Join is O(1) per lookup | Use `Map.get` for the join | No nested loop |
| `reduce` groups correctly | `groupByCity` on 10 users | Each city has correct count |
| Sort descending | Modify data so one city has 2+ contacts | That city appears first |

---

## Quick Check Answers

**1. Offset pagination with a new item inserted between page 1 and page 2?**

With offset pagination: page 1 returned items 1-3. A new item is inserted at
position 1, pushing everything down. Page 2 now returns items 4-6 — which are
what were previously items 3-5. Item 3 (the boundary item) appears on both pages.
Items at position 4-5 are skipped. You get duplicates and gaps.

With cursor pagination: page 1 returned items with IDs 1, 2, 3. The cursor is
set to "after ID 3." Page 2 requests "give me items after ID 3," which returns
items with IDs 4, 5, 6 regardless of what was inserted at position 1. The new
item will appear on the next page 1 fetch, but the in-progress pagination is
unaffected. No duplicates, no gaps.

**2. Merging two arrays on a shared key — how?**

Build a `Map` from one array keyed by the shared field (O(n)), then use
`map.get(key)` to look up the match for each item in the other array (O(1) per item).
Total: O(n) instead of O(n²) for the nested-find approach. The pattern:
```ts
const index = new Map(arrayB.map(b => [b.email, b]));
const merged = arrayA.map(a => ({ ...a, ...index.get(a.email) }));
```

**3. When is `Promise.all` for all pages dangerous?**

When the API has rate limiting. Fetching 100 pages simultaneously sends 100
requests to the server at once. If the API limits you to 10 requests per second,
90 of those requests will be rejected with 429 Too Many Requests. For paginated
data, sequential fetching (one page at a time) is usually the correct default.
`Promise.all` is appropriate for a small, known number of requests or when the
API explicitly supports batch requests.
