---
series: rest-apis
level: 2
title: Request and Response Design
lang: javascript
---

# Request and Response Design

A REST API's usability is determined by the design of its request and response bodies, not just its URLs and status codes. Good request design makes the API easy to call correctly. Good response design makes it easy to consume. Inconsistencies — different date formats across endpoints, missing pagination metadata, surprise field names — make an API painful to use and expensive to integrate with.

This lesson covers the conventions that professional REST APIs follow for JSON bodies, pagination, filtering, versioning, and content negotiation.

## JSON conventions

```text
FIELD NAMING: choose one convention and use it everywhere
  camelCase (recommended for JavaScript APIs):
    { "userId": 42, "firstName": "Alice", "createdAt": "..." }
  snake_case (common in Python/Ruby APIs):
    { "user_id": 42, "first_name": "Alice", "created_at": "..." }
  
  NEVER mix: { "userId": 42, "first_name": "Alice" } — inconsistent

DATE/TIME FORMAT: always ISO 8601 UTC
  ✓ "2026-07-12T14:30:00Z"     — date and time in UTC
  ✓ "2026-07-12"               — date only
  ✗ "12/07/2026"               — ambiguous (UK or US?)
  ✗ 1720789800                 — Unix timestamp (not human-readable)
  ✗ "July 12, 2026"            — locale-specific, not sortable
  
  Why ISO 8601: it sorts lexicographically, it's unambiguous,
  it includes timezone information, every language has a parser for it.

IDs: always strings in JSON (even if integers in the database)
  ✓ { "id": "42" }
  ✗ { "id": 42 }
  
  Why: JavaScript's Number type loses precision for integers > 2^53.
  Twitter's original API returned IDs as numbers and broke JavaScript clients
  for tweets with IDs > 2^53. Now they return both: { "id": 12345, "id_str": "12345" }.
  Use strings from the start.

BOOLEANS: use native JSON booleans
  ✓ { "isActive": true }
  ✗ { "isActive": "true" }    — string, requires parsing
  ✗ { "is_active": 1 }        — integer, requires interpretation

NULL vs omitted fields:
  null:    the field exists but has no value (the user's middle name is known to be absent)
  omitted: the field doesn't apply (the user object doesn't have a middleName field at all)
  Be consistent: don't sometimes omit optional fields and sometimes null them.
```

## Pagination

Never return all records in a single response. A collection with 1 million records in a 500MB JSON response will time out, run out of memory, and crash clients.

```javascript
// CURSOR-BASED PAGINATION (recommended for production):
// Returns a stable page of results + a cursor for the next page
// Cursor: an opaque string encoding the position in the result set
// (often base64-encoded: { id: lastId, createdAt: lastCreatedAt })

// GET /users?cursor=eyJpZCI6MTAwfQ&limit=20
// Returns:
{
  "data": [
    { "id": "101", "name": "Alice" },
    { "id": "102", "name": "Bob" }
    // ... 20 items
  ],
  "pagination": {
    "hasNextPage": true,
    "cursor": "eyJpZCI6MTIwfQ",   // opaque cursor for the next page
    "limit": 20
  }
}

// GET /users?cursor=eyJpZCI6MTIwfQ&limit=20  (next page)
// Returns the next 20 users, and so on until hasNextPage is false
```

```javascript
// OFFSET-BASED PAGINATION (simpler, but has issues):
// GET /users?page=3&per_page=20
{
  "data": [ ... ],
  "pagination": {
    "page": 3,
    "per_page": 20,
    "total": 1547,       // total record count — expensive to compute
    "total_pages": 78,   // total_pages = ceil(total / per_page)
    "has_prev": true,
    "has_next": true
  }
}
```

```text
CURSOR vs OFFSET:

  OFFSET PROBLEMS:
    → Requires counting all records (SELECT COUNT(*)) — expensive on large tables
    → Page drift: if a new record is inserted, page 3 shows a different record
      than it did when page 2 was fetched. Items can skip or appear twice.
    → Performance: OFFSET 10000 in SQL scans and discards 10000 rows before reading 20

  CURSOR ADVANTAGES:
    → No COUNT(*) needed
    → Stable: new records don't affect already-returned pages
    → Performance: WHERE id > cursor_id uses the index directly
    
  USE OFFSET WHEN:
    → Total count is genuinely needed (admin dashboards, search result counts)
    → The dataset is small and doesn't change
    → The client needs to jump to an arbitrary page ("go to page 50")
    
  USE CURSOR WHEN:
    → Infinite scroll or "load more" UX
    → The dataset is large or changes frequently (social feeds, activity streams)
```

## Filtering and sorting

```javascript
// FILTERING: via query parameters
// GET /users?role=admin&status=active
// GET /orders?created_after=2026-01-01&created_before=2026-06-30
// GET /products?min_price=10&max_price=100&category=electronics

// SORTING: consistent naming
// GET /users?sort=name&order=asc      (sort by name ascending)
// GET /users?sort=created_at&order=desc  (newest first)
// GET /products?sort=price             (ascending by default)

// FIELD SELECTION (sparse fieldsets): return only requested fields
// GET /users?fields=id,name,email    (omit createdAt, role, etc.)
// Useful when the client doesn't need all fields — reduces response size

// SEARCH: a filter, not a separate resource
// GET /users?search=alice            (full-text search in name and email)
// GET /products?q=laptop             (search term as 'q' — common convention)
```

```javascript
// SERVER IMPLEMENTATION: building a query from filter params
async function getUsers(queryParams) {
  let sql = 'SELECT id, name, email, role FROM users WHERE 1=1'
  const params = []

  if (queryParams.role) {
    sql += ' AND role = ?'
    params.push(queryParams.role)
  }

  if (queryParams.status) {
    sql += ' AND status = ?'
    params.push(queryParams.status)
  }

  const allowedSortFields = ['name', 'email', 'created_at']  // whitelist!
  const sortField = allowedSortFields.includes(queryParams.sort)
    ? queryParams.sort
    : 'created_at'   // default sort

  const sortOrder = queryParams.order === 'asc' ? 'ASC' : 'DESC'
  sql += ` ORDER BY ${sortField} ${sortOrder}`   // sortField is whitelisted — safe

  const limit = Math.min(parseInt(queryParams.limit) || 20, 100)  // max 100
  sql += ' LIMIT ?'
  params.push(limit)

  return db.query(sql, params)
}
```

**CS lens:** The sort field whitelist is a **trust boundary** check (from the web-security series): `sortField` comes from the client and cannot be parameterised in SQL (column names can't be `?` parameters). By whitelisting allowed sort fields, we prevent SQL injection via the `ORDER BY` clause. An attacker sending `sort=(SELECT password FROM users LIMIT 1)` gets `ORDER BY created_at` instead. This is the same principle as the table name whitelist in the injection lesson: parameterisation is for values; whitelisting is for structural SQL elements.

## API versioning

APIs evolve. A field you add today may need to change name next year. Versioning lets old clients continue working while new features are introduced.

```text
VERSIONING STRATEGIES:

  URL VERSIONING (most common, most visible):
    /api/v1/users
    /api/v2/users
    
    ✓ Easy to see which version is in use
    ✓ Can run v1 and v2 simultaneously for gradual migration
    ✓ Easy to route: proxy sends /v1/* to old service, /v2/* to new service
    ✗ Pollutes URLs with infrastructure concerns

  HEADER VERSIONING:
    GET /api/users
    API-Version: 2
    
    ✓ Clean URLs
    ✗ Hard to use in a browser or with simple tools (curl needs -H flag)
    ✗ Less discoverable

  CONTENT NEGOTIATION (Accept header):
    GET /api/users
    Accept: application/vnd.myapi.v2+json
    
    ✓ Technically correct (REST purists prefer this)
    ✗ Verbose and hard to use
    ✗ Rarely used in practice

VERSIONING STRATEGY:
  → Start with URL versioning (/api/v1/)
  → Never remove v1 while clients still use it — give deprecation notice + timeline
  → Version the whole API, not individual endpoints (consistency matters)
  → MAJOR version bumps (v1 → v2) for breaking changes only
    Breaking: removing a field, renaming a field, changing a field's type
    Non-breaking: adding a new field (clients ignore unknown fields)
```

**SE lens:** API versioning is an application of the **open/closed principle** at the API level: a REST API should be open for extension (adding new fields, new endpoints) and closed for modification (existing endpoints don't break). Adding a field to a response is safe (clients that don't know about it ignore it). Removing or renaming a field is a breaking change that requires a version bump and a migration period. This is why good API design is additive: only add, never remove.

**Common mistakes:**
- No envelope for collections — returning a bare array `[{...}, {...}]` instead of `{ "data": [...], "pagination": {...} }`. Once you've returned a bare array, you can never add pagination metadata without a breaking change.
- Different field names for the same concept — `user_id` in one endpoint, `userId` in another, `authorId` in a third, all referring to the same thing. Establish a naming convention on day one.
- Pagination without a total count for offset pagination — returning `{ "data": [...] }` without telling the client how many pages there are forces extra requests to detect the last page.

**Debug tip:** To test pagination, request a small page size and page through manually: `curl "https://api.example.com/users?limit=3"`, then use the returned cursor in the next request. Verify that all records appear exactly once across pages, and that `hasNextPage: false` on the last page. If records are duplicated or skipped, the cursor implementation has a bug.

## Challenge: buildPaginatedResponse

Build a consistent paginated API response.

```challenge
function buildPaginatedResponse(allItems, limit, cursor) {
  // allItems: array of { id, name } objects with NUMERIC ids in ascending order
  // limit: how many items to return per page (positive integer)
  // cursor: a string (serialised cursor) or null for the first page
  //         The cursor encodes the id of the LAST item on the previous page.
  //         cursor format: base64 of JSON string '{"lastId":N}'
  //         When cursor is null, start from the beginning.
  //
  // Returns:
  //   {
  //     data: [...],           // up to `limit` items whose id > lastId (or all if no cursor)
  //     pagination: {
  //       hasNextPage: boolean,
  //       cursor: string | null,   // cursor for next page, or null if no next page
  //       limit: number
  //     }
  //   }
  //
  // HINT for decoding/encoding the cursor:
  //   decode: JSON.parse(atob(cursor))   → { lastId: N }
  //   encode: btoa(JSON.stringify({ lastId: item.id }))
  //   (atob/btoa are global base64 encode/decode functions)
}
```

```test
const items = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
  { id: 4, name: 'Dave' },
  { id: 5, name: 'Eve' },
]

// First page
const page1 = buildPaginatedResponse(items, 2, null)
assert page1.data.length === 2 && page1.data[0].id === 1 && page1.data[1].id === 2
assert page1.pagination.hasNextPage === true && typeof page1.pagination.cursor === 'string'

// Second page using the cursor from page 1
const page2 = buildPaginatedResponse(items, 2, page1.pagination.cursor)
assert page2.data[0].id === 3 && page2.data[1].id === 4

// Third page (only 1 item left) — no next page, no cursor
const page3 = buildPaginatedResponse(items, 2, page2.pagination.cursor)
assert page3.data.length === 1 && page3.data[0].id === 5
assert page3.pagination.hasNextPage === false && page3.pagination.cursor === null
```
