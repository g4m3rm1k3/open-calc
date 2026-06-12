# Lesson 26 — Performance and Optimization

## What You Will Build

A performance audit of the app: measure load times, identify the slowest queries, profile
React renders, add database query optimization, implement caching with Redis, and use
React's memoization tools. By the end, the lesson list loads 10× faster and unnecessary
re-renders are eliminated.

---

## What You Need to Know First

- Lesson 12: Database indexes, B-tree, O(log n)
- Lesson 16: TanStack Query, `staleTime`, `useQuery`
- Lesson 25: Async/event loop basics

---

## The Lesson

### Step 1 — Measuring Before Optimizing

**The first rule of performance work: measure first, optimize second.**
Optimizing without measurement produces faster code in the wrong places. The bottleneck
you imagine is rarely the actual bottleneck.

**Three things to measure:**
1. **Time to first byte (TTFB):** How long until the browser receives the first byte of
   the HTTP response. Measures server processing time.
2. **Render performance:** How long React takes to render and update the DOM.
3. **Database query time:** How long each SQL query takes.

**Measuring server response time with `pino-http`:**
```typescript
import pino from 'pino'
import pinoHttp from 'pino-http'

const logger = pino({ level: 'info' })
app.use(pinoHttp({ logger }))
// Every request is now logged with: method, url, statusCode, responseTime
// Output: {"method":"GET","url":"/api/lessons","statusCode":200,"responseTime":143}
```

**`pino` and `pino-http` explained:**
`pino` is a fast Node.js logger. `pino-http` is middleware that automatically logs every
request with timing information. `responseTime` is in milliseconds — from the moment the
request arrives to the moment the response is sent. This is the metric to track.

**Measuring React renders with React DevTools Profiler:**
Open React DevTools in the browser, go to the Profiler tab, click Record, interact with
the app, stop recording. The flame chart shows:
- Which components rendered
- How long each render took
- Why each component rendered (which prop or state changed)

**CS lens — Big O and profiling:**
Big O notation describes how an algorithm scales with input size. O(1) means constant time
regardless of input size. O(n) means time grows linearly. O(n²) means time grows quadratically.
Profiling tells you *where* time is actually spent — it is empirical, not theoretical.
Both are needed: Big O guides algorithmic choices; profiling confirms which choices matter.

### Step 2 — Slow Database Queries

**The N+1 query problem:**
A common performance anti-pattern:
```typescript
// Anti-pattern: N+1 queries
const lessons = await prisma.lesson.findMany()       // 1 query: get all lessons
for (const lesson of lessons) {
  const count = await prisma.progress.count({         // N queries: one per lesson
    where: { lessonId: lesson.id }
  })
  lesson.completionCount = count
}
// 1 lesson → 2 queries. 100 lessons → 101 queries.
```

For 100 lessons, this fires 101 queries. Each query has a round-trip cost to the database.
At 1ms per query, 101 queries take 101ms. At 5ms per query (network latency), 101 queries
take 505ms — perceivable delay.

**Fix: a single query with aggregation:**
```typescript
// Correct: 1 query
const lessonsWithCounts = await prisma.lesson.findMany({
  include: {
    _count: {
      select: { progress: true }
    }
  }
})
// lessonsWithCounts[0]._count.progress === 12
```

Prisma generates a single SQL query with a `LEFT JOIN` and `COUNT()`. The database does
the aggregation — databases are optimised for this; JavaScript loops are not.

**Missing indexes:**
Run `EXPLAIN ANALYZE` to see how PostgreSQL executes a query:
```sql
EXPLAIN ANALYZE
SELECT * FROM progress WHERE user_id = 42 ORDER BY completed_at DESC;
```

If the output shows `Seq Scan` (sequential scan = reading every row), the column is not
indexed. If it shows `Index Scan`, an index is being used.

Add the missing index via a Prisma migration:
```prisma
model Progress {
  // ...
  @@index([userId])
  @@index([lessonId])
}
```

### Step 3 — Server-Side Caching with Redis

**Why cache?** The lesson list changes rarely (admins add lessons occasionally), but is
fetched on every page load. Re-computing it from the database on every request is waste.
Cache the result; serve it from memory; invalidate when the data changes.

**What Redis is:** An in-memory key-value store. Reading from Redis takes ~0.1ms.
Reading from PostgreSQL (with disk I/O and query planning) takes 5–50ms.
Redis sits between your API and PostgreSQL.

**Install and run Redis:**
```bash
$ docker run -p 6379:6379 redis:7-alpine
$ npm install redis
```

```typescript
import { createClient } from 'redis'

const redis = createClient({ url: process.env['REDIS_URL'] ?? 'redis://localhost:6379' })
await redis.connect()

// Cache lessons with a 5-minute TTL
export async function getCachedLessons() {
  const cached = await redis.get('lessons:all')

  if (cached !== null) {
    return JSON.parse(cached)       // cache hit: return immediately
  }

  const lessons = await prisma.lesson.findMany({
    orderBy: { orderIndex: 'asc' },
  })

  await redis.set('lessons:all', JSON.stringify(lessons), { EX: 300 })  // expire in 300s
  return lessons
}

// Call this after creating/updating a lesson
export async function invalidateLessonsCache() {
  await redis.del('lessons:all')
}
```

**`redis.set(..., { EX: 300 })` — TTL explained:**
`EX: 300` sets a **Time To Live** of 300 seconds. After 300 seconds, Redis automatically
deletes the key. TTL prevents the cache from holding stale data indefinitely — if the
invalidation call is missed, the cache expires anyway.

**Cache invalidation strategy — cache-aside:**
The application code manages the cache explicitly:
1. Try to read from cache
2. On cache miss, read from database and populate cache
3. On write, invalidate (delete) the cache entry

This is the **cache-aside** (or lazy loading) pattern. The cache is populated on demand,
not pre-warmed. Simpler to reason about than write-through or read-through caches.

**CS lens — space/time tradeoff:**
Caching trades memory for time. Redis holds data in RAM (expensive, limited) to avoid
recomputing it (slow, unbounded cost). The cache introduces complexity (invalidation,
consistency, cold start). The engineering question is: does the speedup justify the
complexity? For a frequently-read, rarely-changed resource like lesson data, yes.

### Step 4 — React Memoization

**The problem: unnecessary re-renders.**
React re-renders a component when its props or state change. But re-renders propagate
down: if `LessonList` re-renders, all its children re-render — even if their props did
not change.

**`React.memo`:** Wraps a component and skips re-rendering if props are reference-equal:
```typescript
import { memo } from 'react'

interface LessonCardProps {
  readonly title: string
  readonly difficulty: string
  readonly isCompleted: boolean
}

export const LessonCard = memo(function LessonCard({ title, difficulty, isCompleted }: LessonCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <DifficultyBadge difficulty={difficulty} />
      {isCompleted && <CheckIcon />}
    </View>
  )
})
```

If `LessonList` re-renders because the search query changed, but a specific `LessonCard`'s
props are unchanged, that card is skipped. Saves render time proportional to the number
of cards.

**`useMemo`:** Memoizes an expensive computation:
```typescript
import { useMemo } from 'react'

function LessonList({ lessons, completedIds }: Props) {
  const enrichedLessons = useMemo(
    () => lessons.map(lesson => ({
      ...lesson,
      isCompleted: completedIds.has(lesson.id),
    })),
    [lessons, completedIds]    // recompute only when these change
  )

  return <FlatList data={enrichedLessons} renderItem={...} />
}
```

Without `useMemo`, `lessons.map(...)` runs on every render — even if `lessons` and
`completedIds` have not changed. With `useMemo`, the result is cached between renders
with the same inputs.

**When NOT to memoize:**
`memo` and `useMemo` have overhead: they store the previous result and compare inputs on
every render. For cheap computations, this overhead exceeds the savings.
- Use `memo` for components that render frequently with stable props
- Use `useMemo` for computations that are measurably expensive
- Measure before adding memoization

---

## Connect the Pieces

The N+1 query problem is algorithmically the same as reading a book by fetching one word
at a time instead of one page: the per-word cost is low, but the total round-trip count
dominates. The fix — one query with a JOIN — is the same as fetching the page: the data
volume is the same, but the round trips collapse to one.

Redis caching here is the same caching that browsers use for HTTP responses (Lesson 11),
but at the application layer. Both use a key (URL vs Redis key), a TTL, and invalidation.
The principles are identical; the scope differs.

React's `useMemo` and the database's query cache both apply the space/time tradeoff. The
correctness risk is also the same: stale data in both cases if invalidation is incorrect.
This is why Phil Karlton's quote about cache invalidation being hard applies to both.

---

## What Breaks Without This

Without Redis caching, a flash sale or a viral moment (10,000 simultaneous users) turns
every page load into 10,000 database queries for the same lesson list. PostgreSQL handles
hundreds of concurrent queries; 10,000 simultaneous queries will cause timeouts and
partial failures for most users.

Without `React.memo` on `LessonCard`, a search input that updates `searchQuery` state
on every keystroke re-renders every `LessonCard` in the list on every keypress. For a
list of 50 lessons, this is 50 × 16ms budget = 800ms of render work per keystroke. The
input feels laggy; users complain about typing delay.

---

## Definition of Done

- [ ] `pino-http` logs response times for every API request
- [ ] The lesson list endpoint's response time drops after Redis caching is added
- [ ] `EXPLAIN ANALYZE` on a progress query shows `Index Scan`, not `Seq Scan`
- [ ] `LessonCard` is wrapped in `React.memo` and skips re-renders during search
- [ ] Redis is running and the cache is confirmed with `redis-cli get lessons:all`
- [ ] You can answer: what is the N+1 query problem and how does a JOIN fix it?
- [ ] You can answer: what is the cache-aside pattern and what does TTL prevent?
- [ ] You can answer: when should you NOT use `React.memo`?
- [ ] You can answer: what does `EXPLAIN ANALYZE` tell you?
- [ ] `git commit` with a message explaining why — "Optimize performance: Redis cache, index on progress.userId, React.memo on LessonCard"
