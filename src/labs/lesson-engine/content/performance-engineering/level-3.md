---
series: performance-engineering
level: 3
title: Performance Engineering — Putting It Together
lang: javascript
---

# Performance Engineering — Putting It Together

The three tools you have learned — measurement and diagnosis, caching, and database query optimisation — address the most common categories of performance problems in web applications. This capstone lesson integrates them into a complete performance improvement workflow: profile, identify the bottleneck, apply the right fix, measure the improvement.

## The complete performance workflow

```text
STEP 1: ESTABLISH A BASELINE
  Before changing anything, measure the current performance.
  Record: p50, p95, p99 latency; throughput (RPS); error rate.
  This is your before state. Without it, you cannot measure improvement.

STEP 2: REPRODUCE THE PROBLEM
  Find a specific scenario that demonstrates the slowness.
  A reproducible test case (load test, specific request) is essential.
  Symptoms like "the dashboard page is slow" must become:
    "GET /api/dashboard?userId=123 takes 4.2 seconds at 50 concurrent users"

STEP 3: PROFILE
  Run the specific scenario with profiling enabled.
  Find the function or operation that dominates execution time.
  Do not trust your intuition — always look at the profile.

STEP 4: IDENTIFY THE BOTTLENECK
  Where is the time spent?
    → Database queries (EXPLAIN, query logging)
    → Memory allocation (heap profiler, GC events)
    → Synchronous computation (CPU profiler)
    → Network I/O (external API calls, latency measurement)

STEP 5: APPLY THE FIX
  Algorithm: reduce complexity (O(n²) → O(n))
  Cache: cache expensive results (database, computation, external API)
  Batch: eliminate N+1 queries
  Parallelise: run independent operations concurrently (Promise.all)
  Index: add database index for frequent query patterns

STEP 6: MEASURE AGAIN
  Re-run the scenario with profiling.
  Compare before and after measurements.
  Did the fix actually help? By how much?
  Is there a new bottleneck now?

STEP 7: ITERATE
  Fix the next bottleneck. Repeat until the performance goal is met.
  Stop when the goal is met — further optimisation has diminishing returns.
```

## Case study: slow dashboard API

```javascript
// BEFORE: slow implementation of a dashboard API endpoint

app.get('/api/dashboard/:userId', async (req, res) => {
  const { userId } = req.params

  // Sequential queries (N+1 pattern):
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId])
  // Takes 15ms

  const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId])
  // Takes 20ms — sequential, not parallel

  const products = []
  for (const order of orders) {
    // N+1: one query per order!
    const orderProducts = await db.query(
      'SELECT * FROM products WHERE id IN (?)',
      [order.product_ids]
    )
    products.push(...orderProducts)
  }
  // If 50 orders: 50 queries × 5ms = 250ms

  // Recomputed on every request (no cache):
  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
    averageOrderValue: orders.reduce((sum, o) => sum + o.total, 0) / orders.length,
  }
  // totalSpent is computed twice — unnecessary work

  res.json({ user, orders, stats, products: [...new Set(products)] })
})

// PROFILE RESULTS:
//   Total: 320ms
//   user query: 15ms (5% of time)
//   orders query: 20ms (6% of time)
//   N+1 product queries: 250ms (78% of time) ← BOTTLENECK
//   stats computation: 2ms (negligible)
```

```javascript
// AFTER: optimised implementation

// Cache for user data (changes rarely):
const userCache = createCache({ ttlMs: 5 * 60 * 1000 })   // 5 min TTL

app.get('/api/dashboard/:userId', async (req, res) => {
  const { userId } = req.params

  // 1. Cache user lookup:
  let user = userCache.get(`user:${userId}`)
  if (!user) {
    user = await db.query('SELECT * FROM users WHERE id = ?', [userId])
    userCache.set(`user:${userId}`, user)
  }

  // 2. Parallel queries (user and orders are independent):
  const [_, orders] = await Promise.all([
    Promise.resolve(user),   // already loaded above
    db.query('SELECT * FROM orders WHERE user_id = ?', [userId]),
  ])

  // 3. Batch product query (eliminate N+1):
  const allProductIds = [...new Set(orders.flatMap(o => o.product_ids))]
  const products = allProductIds.length > 0
    ? await db.query('SELECT * FROM products WHERE id IN (?)', [allProductIds])
    : []

  // 4. Single-pass stats computation:
  let totalSpent = 0
  for (const order of orders) totalSpent += order.total
  const stats = {
    totalOrders: orders.length,
    totalSpent,
    averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
  }

  res.json({ user, orders, stats, products })
})

// AFTER PROFILE:
//   Total: 25ms (cache hit for user: 0ms, orders: 20ms, batch products: 5ms)
//   Speedup: 320ms → 25ms = 12.8× faster
//   p99 improvement: similar — the bottleneck was the N+1, which is now fixed
```

**CS lens:** The optimisation applied three separate transformations: (1) memoisation (user cache), (2) parallelisation (simultaneous queries), and (3) batch processing (N+1 → 1 query). Each addresses a different aspect of the performance model. Together they reduce the execution time from 320ms to 25ms — a 12.8× speedup. This is Amdahl's Law in action: the bottleneck (N+1 at 78% of time) was eliminated first, producing most of the speedup. The remaining 22% (user and order queries) was further reduced by caching and parallelisation.

## Performance anti-patterns

```text
ANTI-PATTERN: PREMATURE OPTIMISATION
  Optimising before measuring, optimising code that is not the bottleneck,
  adding caching to avoid work that is already fast.
  Result: complex code with no performance benefit.
  
  Fix: measure first. Only optimise code that is measured to be slow.

ANTI-PATTERN: CACHE EVERYTHING
  Adding a cache to every function that accesses the database.
  Result: complex invalidation logic, stale data bugs, memory exhaustion.
  
  Fix: cache only data that is expensive AND read significantly more often than it changes.

ANTI-PATTERN: OVER-INDEXING
  Creating an index on every database column.
  Result: slow inserts, high disk usage, no query benefit for unqueried columns.
  
  Fix: add indexes only where EXPLAIN shows a table scan on a frequently-run query.

ANTI-PATTERN: DENORMALISATION WITHOUT MEASUREMENT
  Duplicating data to avoid joins, before checking whether joins are actually slow.
  Result: data consistency problems, complex update logic, no performance benefit.
  
  Fix: check EXPLAIN for join performance first. Most joins on indexed columns are fast.

ANTI-PATTERN: INFINITE CACHE TTL
  Caching data forever without expiry, or with a TTL longer than data freshness allows.
  Result: users see stale data; cache invalidation logic is wrong or missing.
  
  Fix: set TTL based on how stale the data is acceptable to be.
```

**SE lens:** Every performance optimisation is a tradeoff: caching trades freshness for speed; indexing trades write speed for read speed; denormalisation trades consistency for query simplicity. These tradeoffs are not inherently good or bad — they depend on the specific access patterns, data freshness requirements, and team capacity to manage the complexity. Performance engineering is about choosing the right tradeoffs, not blindly applying every available technique. The right performance improvement is the one that achieves the performance goal with the minimum increase in complexity.

## Challenge: optimise_user_stats

Implement an optimised user statistics function.

```challenge
async function getUserStats(userIds, db, cache) {
  // userIds: string[]
  // db: object with:
  //   queryUsers(ids): returns { id, name, email }[]
  //   queryOrdersByUser(ids): returns { id, user_id, total, status }[]
  // cache: object with get(key)/set(key, value) interface
  //
  // For each userId:
  //   1. Check cache for 'stats:' + userId
  //   2. If cache miss: compute stats from db results
  //   3. Cache the computed stats
  //
  // Return: { [userId]: { name, email, orderCount, totalSpent, averageOrderValue } }
  //
  // EFFICIENCY REQUIREMENTS:
  //   - Load ALL users in ONE db.queryUsers() call
  //   - Load ALL orders in ONE db.queryOrdersByUser() call
  //   - Both loads should happen in PARALLEL
  //   - Skip db calls for users already in cache
}
```

```test
const dbCalls = { users: [], orders: [] }
const db = {
  queryUsers: async (ids) => { dbCalls.users.push(ids); return ids.map(id => ({ id, name: 'User' + id, email: id + '@test.com' })) },
  queryOrdersByUser: async (ids) => { dbCalls.orders.push(ids); return [
    { id: 'o1', user_id: '1', total: 100, status: 'completed' },
    { id: 'o2', user_id: '1', total: 50,  status: 'completed' },
    { id: 'o3', user_id: '2', total: 200, status: 'pending'   },
  ]}
}

const store = new Map()
const cache = { get: k => store.get(k), set: (k,v) => store.set(k,v) }

const stats = await getUserStats(['1', '2', '3'], db, cache)

assert stats['1'].orderCount === 2 && stats['1'].totalSpent === 150 && Math.abs(stats['1'].averageOrderValue - 75) < 0.01
assert stats['2'].orderCount === 1 && stats['2'].totalSpent === 200
assert stats['3'].orderCount === 0 && stats['3'].totalSpent === 0

// Only ONE db call each, in parallel — not one call per user
assert dbCalls.users.length === 1 && dbCalls.orders.length === 1

// Results cached
assert store.has('stats:1') && store.has('stats:2')

// Second call: use cache (no new db calls)
dbCalls.users.length = 0
dbCalls.orders.length = 0
await getUserStats(['1', '2'], db, cache)
assert dbCalls.users.length === 0 && dbCalls.orders.length === 0
```
