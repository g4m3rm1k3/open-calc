---
series: async-programming
level: 2
title: Async/Await Patterns and Pitfalls
lang: javascript
---

# Async/Await Patterns and Pitfalls

`async/await` is syntactic sugar over Promises. It makes async code look synchronous, which makes it easier to read and reason about. But the underlying behaviour is still Promise-based, and several subtle bugs arise from misunderstanding what `await` does and when to use it.

By the end of this lesson you will understand the correct patterns for sequential and parallel execution, how error handling works with `async/await`, the most common pitfalls (including the notorious sequential-when-parallel bug), and how to use `async/await` in loops and with iterators.

## What `async/await` actually does

```javascript
// This async function:
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`)
  const data = await response.json()
  return data
}

// Is exactly equivalent to this Promise chain:
function fetchUser(id) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(data => data)
}
```

```text
async/await MECHANICS:
  'async' keyword: makes the function return a Promise.
    Even if you 'return 42', the caller gets Promise.resolve(42).

  'await' keyword: suspends the current function and resumes when the Promise settles.
    The call stack is freed while suspended.
    When the Promise fulfills, execution resumes with the resolved value.
    When the Promise rejects, an exception is thrown at the await point.

  ERROR HANDLING: rejected Promises become thrown exceptions.
    try { const data = await fetchUser(id) } catch (err) { /* handle err */ }
    is equivalent to:
    fetchUser(id).catch(err => { /* handle err */ })
```

## Error handling patterns

```javascript
// Pattern 1: try/catch wrapping the whole sequence
async function loadUserPage(userId) {
  try {
    const user = await fetchUser(userId)
    const orders = await fetchOrders(userId)
    return renderPage(user, orders)
  } catch (err) {
    // ALL errors from ALL awaits land here
    // Problem: you don't know which fetch failed
    return renderErrorPage(err)
  }
}

// Pattern 2: per-operation catch for different handling
async function loadUserPage(userId) {
  let user
  try {
    user = await fetchUser(userId)
  } catch (err) {
    throw new Error(`User not found: ${userId}`, { cause: err })
  }

  let orders
  try {
    orders = await fetchOrders(userId)
  } catch (err) {
    orders = []   // orders are optional — fall back to empty
  }

  return renderPage(user, orders)
}

// Pattern 3: async helper that returns [error, value] tuple (Go-style)
async function tryAsync(promise) {
  try {
    return [null, await promise]
  } catch (err) {
    return [err, null]
  }
}

const [userErr, user] = await tryAsync(fetchUser(userId))
if (userErr) return { error: 'User load failed' }

const [ordersErr, orders] = await tryAsync(fetchOrders(userId))
const safeOrders = ordersErr ? [] : orders
```

## The sequential-when-parallel bug

The most common async/await mistake: accidentally running things sequentially that could run in parallel.

```javascript
// BUG: sequential execution — each await waits for the previous to complete
// Total time: fetchUser + fetchOrders + fetchInventory (e.g., 3 × 300ms = 900ms)
async function loadDashboardSlow(userId) {
  const user      = await fetchUser(userId)       // wait 300ms
  const orders    = await fetchOrders(userId)     // wait 300ms AFTER user
  const inventory = await fetchInventory(userId)  // wait 300ms AFTER orders
  return { user, orders, inventory }
}

// FIXED: parallel execution — all start simultaneously
// Total time: max(fetchUser, fetchOrders, fetchInventory) (e.g., 300ms)
async function loadDashboardFast(userId) {
  const [user, orders, inventory] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchInventory(userId),
  ])
  return { user, orders, inventory }
}
```

```text
WHEN TO AWAIT SEQUENTIALLY:
  → When the second operation depends on the first result:
      const user = await fetchUser(userId)
      const orders = await fetchOrders(user.accountId)   // needs user.accountId first

  → When the second operation must not start until the first completes:
      await lockDatabase()
      await runMigration()   // only start after lock acquired
      await unlockDatabase()

WHEN TO AWAIT IN PARALLEL (use Promise.all):
  → When the operations are independent (neither needs the other's result)
  → When all results are needed before proceeding
  → When performance matters

KEY DIAGNOSTIC: "Could these two awaits happen at the same time?"
  If yes: use Promise.all. If no: sequential await is correct.
```

**CS lens:** The sequential-vs-parallel distinction is the core of concurrent program analysis. Sequential operations have a **happens-before** relationship (A must complete before B starts). Parallel operations have no happens-before constraint between them (A and B can interleave freely). `await` enforces happens-before. `Promise.all` removes the happens-before constraint and allows interleaving. Identifying which pairs of operations have a required happens-before relationship — and which do not — is the fundamental skill of async programming.

## Async in loops

```javascript
// MISTAKE: await inside .map() doesn't wait for all iterations
async function processOrders(orderIds) {
  const results = orderIds.map(async (id) => {
    return await processOrder(id)   // async map returns Promise[], not results
  })
  // results is an array of Promises, not an array of results!
  return results   // WRONG: caller gets unresolved Promises
}

// CORRECT: Promise.all over the mapped Promises
async function processOrders(orderIds) {
  const promises = orderIds.map(id => processOrder(id))   // start all immediately
  return await Promise.all(promises)   // wait for all to complete
}

// SEQUENTIAL iteration with for...of (when order matters or one depends on previous)
async function processOrdersInSequence(orderIds) {
  const results = []
  for (const id of orderIds) {
    const result = await processOrder(id)   // await each one
    results.push(result)
  }
  return results
}
```

```javascript
// CONTROLLED CONCURRENCY: limit to N concurrent operations
async function processWithConcurrencyLimit(items, processItem, limit = 5) {
  const results = []
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit)
    const chunkResults = await Promise.all(chunk.map(processItem))
    results.push(...chunkResults)
  }
  return results
}

// Usage: process up to 5 orders at a time (avoid overwhelming the database)
const results = await processWithConcurrencyLimit(1000Orders, processOrder, 5)
```

## Async iterators and generators

```javascript
// Async generator: produces values asynchronously, consumed with for await...of
async function* fetchPages(baseUrl) {
  let page = 1
  while (true) {
    const response = await fetch(`${baseUrl}?page=${page}`)
    const { items, hasNextPage } = await response.json()
    yield items        // produces a value (resumes the caller)
    if (!hasNextPage) break
    page++
  }
}

// Consumer: for await...of works with async generators
async function collectAllItems(url) {
  const allItems = []
  for await (const page of fetchPages(url)) {
    allItems.push(...page)
    if (allItems.length > 10000) break   // can stop early
  }
  return allItems
}
```

**SE lens:** Async generators are the JavaScript implementation of **lazy sequences over asynchronous data sources**. Each `yield` is a checkpoint: the generator pauses, the consumer processes the yielded value, and then the generator resumes and fetches the next batch. This is the correct model for paginated APIs, database cursors, and streaming data — fetch only what is needed, when it is needed, without loading the entire dataset into memory. The consumer controls the pace via the `for await...of` loop.

**Common mistakes:**
- Forgetting `await` before a Promise — `const user = fetchUser(id)` — `user` is a Promise, not the user object. Accessing `user.name` returns `undefined`. The function does not throw; it silently produces wrong results. Modern TypeScript and ESLint can catch this.
- `await` in a class constructor — constructors cannot be async. Use a static factory: `static async create() { const instance = new MyClass(); await instance.init(); return instance; }`.
- Unhandled rejection from floating Promises — `processInBackground(item)` without `await` — if it rejects, the rejection is unhandled. Either `await` it, or attach `.catch(handleError)` to the floating Promise.

**Debug tip:** When sequential code that "should be parallel" is slow: check every `await` and ask "is this result needed before the next line?" If not, extract it and use `Promise.all`. To measure: `console.time('parallel')` before and `console.timeEnd('parallel')` after your Promise.all. Compare with the sequential version — the speedup should be proportional to the number of operations minus the slowest one.

## Challenge: parallel_data_loader

Implement a data loader that respects data dependencies and maximises parallelism.

```challenge
async function loadOrderPage(orderId, fetcher) {
  // fetcher: async function(url) → data
  //
  // Required loads and their dependencies:
  //   order:    fetcher('/orders/' + orderId)            — no deps
  //   user:     fetcher('/users/' + order.userId)        — needs order first
  //   shipping: fetcher('/shipping/' + orderId)          — no deps
  //   catalog:  fetcher('/catalog')                      — no deps
  //
  // Load as much in parallel as possible:
  //   First parallel group: order + shipping + catalog (all independent)
  //   Second parallel group: user (needs order.userId)
  //
  // Return: { order, user, shipping, catalog }
  // Any single failure should propagate (do not catch — let it throw)
}
```

```test
const callOrder = []
const fetcher = async (url) => {
  callOrder.push(url)
  if (url.includes('/orders/o1')) return { id: 'o1', userId: 'u1' }
  if (url.includes('/users/u1'))  return { id: 'u1', name: 'Alice' }
  if (url.includes('/shipping'))  return { status: 'shipped' }
  if (url.includes('/catalog'))   return { items: [] }
  throw new Error('Unknown URL: ' + url)
}

const data = await loadOrderPage('o1', fetcher)
assert data.order.id === 'o1'
assert data.user.name === 'Alice'
assert data.shipping.status === 'shipped'
assert data.catalog.items.length === 0

// Verify shipping and catalog were fetched BEFORE user
// (they have no dependencies, so they should start with order)
const shippingIdx = callOrder.indexOf('/shipping/o1')
const userIdx     = callOrder.findIndex(u => u.includes('/users/'))
assert shippingIdx < userIdx   // shipping started before user was fetched
```
