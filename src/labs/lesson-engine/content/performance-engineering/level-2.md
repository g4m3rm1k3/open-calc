---
series: performance-engineering
level: 2
title: Database Query Performance
lang: javascript
---

# Database Query Performance

The database is the bottleneck in most web applications. A single inefficient query in a loop can turn a 50ms API response into a 5-second timeout under load. Understanding how databases execute queries, what makes them slow, and how to fix them is one of the highest-leverage skills in web development.

By the end of this lesson you will understand the N+1 query problem, how indexes make queries fast, how to use `EXPLAIN` to see what the database is doing, and how to batch queries to eliminate unnecessary round trips.

## The N+1 problem

The N+1 problem occurs when loading a list of N items, then making 1 additional query per item. N items → N+1 queries total.

```javascript
// N+1 QUERY (bad):
async function loadUsersWithOrders(userIds) {
  const users = await db.query(
    'SELECT * FROM users WHERE id IN (?)', [userIds]
  )   // Query 1: fetch N users

  for (const user of users) {
    user.orders = await db.query(
      'SELECT * FROM orders WHERE user_id = ?', [user.id]
    )   // Queries 2 through N+1: one per user!
  }

  return users
}

// For 100 users: 101 queries.
// If each query takes 5ms: 505ms total.
// Under load: database connection pool exhaustion, cascading slowness.
```

```javascript
// FIXED with a single JOIN query:
async function loadUsersWithOrders(userIds) {
  const rows = await db.query(`
    SELECT u.*, o.id as order_id, o.total, o.status
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.id IN (?)
  `, [userIds])

  // Group rows by user (JOIN produces one row per order)
  const usersMap = new Map()
  for (const row of rows) {
    if (!usersMap.has(row.id)) {
      usersMap.set(row.id, { ...row, orders: [] })
    }
    if (row.order_id) {
      usersMap.get(row.id).orders.push({
        id: row.order_id, total: row.total, status: row.status
      })
    }
  }
  return Array.from(usersMap.values())
}

// 1 query for any number of users. 5ms instead of 505ms.
```

```javascript
// ALTERNATIVE: batch query instead of JOIN (better for complex data)
async function loadUsersWithOrders(userIds) {
  const [users, allOrders] = await Promise.all([
    db.query('SELECT * FROM users WHERE id IN (?)', [userIds]),
    db.query('SELECT * FROM orders WHERE user_id IN (?)', [userIds]),
  ])

  // Group orders by user_id in JavaScript
  const ordersByUser = {}
  for (const order of allOrders) {
    if (!ordersByUser[order.user_id]) ordersByUser[order.user_id] = []
    ordersByUser[order.user_id].push(order)
  }

  return users.map(user => ({ ...user, orders: ordersByUser[user.id] ?? [] }))
}

// 2 queries in parallel → total time = max(query1, query2) ≈ 5ms
```

**CS lens:** The N+1 problem is a consequence of **impedance mismatch** between object graphs (in-memory trees of related objects) and relational data (flat tables with foreign keys). The natural way to load an object graph in code (load users, then load their orders) maps to N+1 queries. The relational model's natural operation (JOIN) does it in 1 query. Bridging this gap — recognising when object-graph thinking is creating N+1 queries and restructuring to use relational operations — is the core database performance skill.

## Using EXPLAIN to understand query execution

```sql
-- EXPLAIN shows the query plan: how the database will execute the query
EXPLAIN SELECT * FROM orders WHERE user_id = 1;

-- Output (SQLite example):
-- QUERY PLAN
-- `--SCAN orders
--   (no index used → scans ALL rows to find user_id = 1)

-- After adding index:
CREATE INDEX idx_orders_user_id ON orders(user_id);
EXPLAIN SELECT * FROM orders WHERE user_id = 1;

-- Output:
-- QUERY PLAN
-- `--SEARCH orders USING INDEX idx_orders_user_id (user_id=?)
--   (uses index → jumps directly to matching rows)
```

```text
EXPLAIN KEY TERMS:
  SCAN / FULL SCAN: reads every row in the table.
    → O(n) — slow for large tables.
    → Acceptable for small tables or when filtering most rows.
    → Sign of a missing index when the WHERE clause filters few rows.

  INDEX SCAN / SEEK: uses an index to find rows matching the condition.
    → O(log n) for finding the first match, then O(k) for k matching rows.
    → Fast. This is what you want.

  NESTED LOOP JOIN: for each row in table A, scan table B.
    → O(n × m) without an index on B.
    → O(n × log m) with an index on B.
    → Watch for when table B is large.

  HASH JOIN / MERGE JOIN: more efficient for large tables.
    → Usually the database chooses this automatically when beneficial.
```

## Index design

```sql
-- Single-column index: speeds up equality and range on one column
CREATE INDEX idx_products_category ON products(category);
SELECT * FROM products WHERE category = 'electronics';   -- uses index

-- Composite index: speeds up queries that filter on multiple columns
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
SELECT * FROM orders WHERE user_id = 1 AND status = 'pending';   -- uses index

-- Composite index: LEFTMOST PREFIX RULE
-- An index on (user_id, status) helps:
--   WHERE user_id = 1 AND status = 'pending'  ← full index
--   WHERE user_id = 1                         ← uses first column only
-- Does NOT help:
--   WHERE status = 'pending'                  ← can't use index without leftmost column
```

```javascript
// Identifying missing indexes: look for N+1 or full scans
// Then add an index on the column(s) in the WHERE clause

// Example: common query pattern
const orders = await db.query(
  'SELECT * FROM orders WHERE user_id = ? AND created_at > ?',
  [userId, thirtyDaysAgo]
)
// This needs an index on (user_id, created_at) to avoid a full scan:
// CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
```

**SE lens:** Index design is a form of **read/write tradeoff**. An index makes reads faster (O(log n) instead of O(n)) but makes writes slower (the index must be updated on every INSERT, UPDATE, DELETE). For read-heavy tables (product catalog, user profiles), indexes are almost always worth it. For write-heavy tables (log tables, audit trails, append-only event stores), too many indexes hurt write performance. The rule: add indexes where they eliminate full table scans on frequently executed queries; remove indexes on columns that are rarely queried.

## Batching and DataLoader pattern

The DataLoader pattern deduplicates and batches database requests made within the same "tick" of the event loop:

```javascript
function createDataLoader(batchFn) {
  let pendingKeys = []
  let pendingResolvers = []
  let scheduled = false

  function schedule() {
    if (scheduled) return
    scheduled = true
    // Wait until end of current tick, then batch all accumulated keys
    queueMicrotask(() => {
      const keys = pendingKeys
      const resolvers = pendingResolvers
      pendingKeys = []
      pendingResolvers = []
      scheduled = false

      batchFn(keys).then(values => {
        resolvers.forEach((resolve, i) => resolve(values[i]))
      }).catch(err => {
        resolvers.forEach(({ reject }) => reject(err))
      })
    })
  }

  return function load(key) {
    return new Promise((resolve, reject) => {
      pendingKeys.push(key)
      pendingResolvers.push({ resolve, reject })
      schedule()
    })
  }
}

// Usage: all loadUser() calls within one async tick become ONE batch query
const loadUser = createDataLoader(async (ids) => {
  const users = await db.query('SELECT * FROM users WHERE id IN (?)', [ids])
  // Return in same order as requested ids:
  return ids.map(id => users.find(u => u.id === id) ?? null)
})

// These three calls within one async tick → one batch query
const [user1, user2, user3] = await Promise.all([
  loadUser(1),
  loadUser(2),
  loadUser(3),
])
// Single query: SELECT * FROM users WHERE id IN (1, 2, 3)
```

**Common mistakes:**
- Not checking for N+1 in loops — any `await` inside a `for` loop that is fetching data from a database is a potential N+1. Always check whether the query could be batched.
- Over-indexing — creating an index on every column. Indexes take space and slow down writes. Create indexes selectively: only where queries are slow AND EXPLAIN shows a full scan.
- Ignoring query complexity — a JOIN across 5 tables with 4 subqueries may be technically a single query but execute slowly. Denormalization (duplicating some data) or restructuring the query may be needed.

**Debug tip:** To find N+1 problems in a running application: enable query logging (`SET GLOBAL general_log = 'ON'` in MySQL, or the equivalent in your database). Then run a typical user workflow. Count the queries — if you see 51 queries when loading a page with 50 items, you have N+1. The pattern in the log: one distinct query followed by N identical queries with different parameters.

## Challenge: batch_loader

Implement a DataLoader that batches key lookups within the same event loop tick.

```challenge
function createBatchLoader(batchFn) {
  // batchFn: async (keys: string[]) → values[] (same order and length as keys)
  //
  // Returns: async load(key) function
  //   Multiple calls to load() within the same microtask tick are collected.
  //   After the current synchronous code finishes, batchFn is called ONCE with all keys.
  //   Each load(key) Promise resolves with the corresponding value from batchFn's result.
  //   Duplicate keys: batchFn is called with deduplicated keys;
  //                   both callers receive the same value.
}
```

```test
const batchLog = []

const loadItem = createBatchLoader(async (keys) => {
  batchLog.push([...keys])   // record what was batched
  return keys.map(k => ({ id: k, name: 'item-' + k }))
})

// All three called before any microtask runs → should batch
const [a, b, c] = await Promise.all([
  loadItem('1'),
  loadItem('2'),
  loadItem('3'),
])

assert a.name === 'item-1'
assert b.name === 'item-2'
assert c.name === 'item-3'
assert batchLog.length === 1          // only ONE batch call
assert batchLog[0].length === 3       // all 3 keys in one batch

// Duplicate keys should not cause duplicate batch entries
batchLog.length = 0
const [d, e] = await Promise.all([loadItem('x'), loadItem('x')])
assert d.name === 'item-x'
assert e.name === 'item-x'
assert batchLog[0].filter(k => k === 'x').length === 1   // deduplicated

// Sequential awaits → separate batch calls
batchLog.length = 0
await loadItem('p')
await loadItem('q')
assert batchLog.length === 2   // two separate batches (one per tick)
```
