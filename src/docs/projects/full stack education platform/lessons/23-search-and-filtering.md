# Lesson 23 — Search and Filtering

## What You Will Build

Search lessons by title. Filter by difficulty. Sort by completion status. Results filter
in real time as the user types. No results state is handled gracefully.

---

## What You Need to Know First

- Lesson 12: SQL, indexes, PostgreSQL
- Lesson 14: Zod, Express route handlers, query parameters
- Lesson 16: TanStack Query, `useQuery`

---

## The Lesson

### Step 1 — Search Algorithms

**Linear scan:** Check every item in the collection for a match. O(n) — each doubling
of data doubles the search time. For 10 lessons, instant. For 10,000 lessons, perceptible.

**Index lookup:** A pre-built data structure reduces lookups to O(log n). For 10,000
lessons, a B-tree index reduces lookups from 10,000 comparisons to ~14.

**Full-text search:** `LIKE '%query%'` performs a full scan — it cannot use a standard
B-tree index because the query does not start with a known prefix. PostgreSQL's
**full-text search** (`tsvector` and `tsquery`) builds an inverted index — a data structure
mapping words to the rows that contain them.

**What an inverted index is:** Instead of a B-tree (row ID → content), an inverted index
maps content → row IDs. For the lesson "JavaScript variables and types":
```
'javascript' → [lesson_id: 2, lesson_id: 7]
'variable'   → [lesson_id: 2, lesson_id: 15]
'type'       → [lesson_id: 2, lesson_id: 8, lesson_id: 15]
```
Searching for "javascript variables" looks up both words in the inverted index and
intersects the sets — O(1) per word lookup, then O(m log m) for intersection (where m
is the number of results).

**CS lens:** An inverted index is the same data structure used by every search engine,
every code editor's symbol search, and every database full-text search. Google's PageRank
is built on top of an inverted index.

### Step 2 — PostgreSQL Full-Text Search

Update the `Lesson` schema to include a search vector:

```sql
-- Add a tsvector column
ALTER TABLE lessons ADD COLUMN search_vector tsvector;

-- Fill it
UPDATE lessons SET search_vector = to_tsvector('english', title || ' ' || prompt);

-- Create a GIN index (optimised for tsvector)
CREATE INDEX idx_lessons_search ON lessons USING GIN(search_vector);

-- Trigger to keep it updated
CREATE TRIGGER lessons_search_update
  BEFORE INSERT OR UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION
    tsvector_update_trigger(search_vector, 'pg_catalog.english', title, prompt);
```

**`tsvector` explained:** A `tsvector` is a PostgreSQL type for storing preprocessed
text: stemmed (running → run, runs → run), stop words removed (the, a, and), and word
positions recorded. `to_tsvector('english', 'Hello world')` produces `'hello':1 'world':2`.

**`tsquery` explained:** A `tsquery` is a search query against a `tsvector`. `'javascript & variable'`
matches rows containing both words. `to_tsquery('javascript:* & var:*')` supports
prefix matching (`:*`) — "javascript" matches "javascript", "javascripts".

**GIN index (Generalised Inverted Index):** GIN is an index type optimised for inverted
indexes — fast lookup for "find all rows containing this word."

**The migration:** Add to `prisma/migrations/`:
```bash
$ npx prisma migrate dev --name add-fulltext-search
```

Edit the generated migration to include the raw SQL above (Prisma does not natively
generate `tsvector` columns or GIN indexes).

### Step 3 — The Search API

Update `server/src/repositories/lessonRepository.ts`:

```typescript
import { Prisma } from '@prisma/client'

interface LessonSearchParams {
  readonly query?: string
  readonly difficulty?: string
  readonly orderBy?: 'title' | 'createdAt' | 'orderIndex'
}

export async function searchLessons({ query, difficulty, orderBy = 'orderIndex' }: LessonSearchParams) {
  const conditions: Prisma.LessonWhereInput[] = []

  if (difficulty !== undefined && difficulty !== '') {
    conditions.push({ difficulty })
  }

  if (query !== undefined && query !== '') {
    // Use full-text search for queries with 3+ characters; ILIKE for shorter
    if (query.length >= 3) {
      conditions.push({
        OR: [
          { title: { search: query.split(' ').map(w => `${w}:*`).join(' & ') } },
          { prompt: { search: query.split(' ').map(w => `${w}:*`).join(' & ') } },
        ],
      })
    } else {
      conditions.push({
        title: { contains: query, mode: 'insensitive' },
      })
    }
  }

  return prisma.lesson.findMany({
    where: conditions.length > 0 ? { AND: conditions } : {},
    orderBy: { [orderBy]: 'asc' },
    select: { id: true, title: true, difficulty: true, orderIndex: true },
  })
}
```

**Prisma's `search` mode:**
`{ title: { search: 'javascript:* & var:*' } }` uses PostgreSQL's `@@` full-text search
operator. Prisma generates: `WHERE to_tsvector('english', title) @@ to_tsquery('english', 'javascript:* & var:*')`.

**`Prisma.LessonWhereInput[]`:**
Building query conditions dynamically. Instead of nested ternaries in one large `where`,
we push conditions to an array and combine with `{ AND: conditions }`. This is
**predicate composition**: each filter is a boolean condition; combining them is logical AND.
A predicate is a function (or condition) that returns true or false.

**The filter for "queries with 3+ characters":**
Short queries (1-2 characters) are common noise — single letters, partial words. Full-text
search on them returns too many results. `ILIKE '%j%'` matches every lesson containing "j"
— nearly all lessons. The 3-character threshold trades perfect recall for precision.

### Step 4 — Debouncing

**The problem:** A search input that fires an API request on every keystroke sends
10 requests while typing "javascript" (j, ja, jav, java, javas, javasc, javascr, javascri,
javascript). All but the last request are wasted.

**Debouncing** delays a function call until the user stops triggering it for a specified duration.

```typescript
import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => clearTimeout(timer)  // cleanup: cancel if value changes before delay
  }, [value, delayMs])

  return debouncedValue
}
```

**How the algorithm works:**
1. User types "j" — timer starts (300ms)
2. User types "a" — timer resets (old timer cancelled, new 300ms timer starts)
3. User types "v" — timer resets again
4. User stops typing
5. 300ms elapses — `setDebouncedValue('jav')` fires
6. `useQuery` with the debounced value fires

**CS lens:** Debouncing is algorithmically a timer that resets on each event. It is a
special case of **rate limiting** — not limiting the total rate, but limiting the rate
of a specific sequence. Throttling (a different pattern) fires at most once per interval
regardless of input frequency.

**Using the debounced value in the search screen:**

```typescript
export function SearchScreen() {
  const [searchText, setSearchText] = useState('')
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined)
  const debouncedSearch = useDebounce(searchText, 300)

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', 'search', { query: debouncedSearch, difficulty }],
    queryFn: () => searchLessons({ query: debouncedSearch, difficulty }),
  })

  return (
    <View style={styles.container}>
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search lessons..."
        style={styles.searchInput}
      />
      {lessons?.length === 0 && !isLoading && (
        <Text style={styles.noResults}>No lessons found for "{debouncedSearch}"</Text>
      )}
      <FlatList data={lessons ?? []} renderItem={...} />
    </View>
  )
}
```

**`queryKey: ['lessons', 'search', { query, difficulty }]`:**
The query key includes the search parameters. Different search terms produce different
cache entries — TanStack Query keeps each result separately cached. Returning to a
previous search shows the cached result instantly while refetching in the background.

---

## Connect the Pieces

The inverted index for full-text search is the same data structure as the trie discussed
in Lesson 32 (algorithms). Both allow fast lookup by content rather than by row position.
The trie gives O(k) prefix search; the inverted index gives O(1) word lookup followed by
set intersection.

Debouncing is an optimisation pattern that appears throughout the app: search uses it
to avoid excess requests, performance-sensitive event handlers (scroll, resize) use it
to avoid firing too frequently, auto-save uses it to avoid writing on every keystroke.
The 300ms delay is a UX heuristic — fast enough to feel responsive, slow enough to avoid
excess requests.

`Prisma.LessonWhereInput[]` with `AND` composition is the same composable predicate
approach used in functional programming (Lesson 33): each predicate is independent,
composing them is combining with `AND`/`OR`.

---

## What Breaks Without This

Without debouncing, typing "javascript" fires 10 simultaneous API requests. The network
tab shows them racing — and the last letter might not be the last response. If the
request for "javascrip" responds after "javascript", the results showing "javascript"
matches are overwritten by "javascrip" matches. With TanStack Query's deduplication,
requests with the same key are deduplicated — but the key changes on every keystroke
without debouncing.

Without the `query.length >= 3` threshold, typing a single letter "j" triggers a full-text
search that, with a small dataset, returns every lesson containing "j". With 1,000 lessons,
it returns nearly all of them — the search box appears broken.

---

## Definition of Done

- [ ] Typing in the search box filters lessons in real time
- [ ] Results update after the user stops typing (debounced, not on every keypress)
- [ ] Selecting a difficulty filter shows only lessons with that difficulty
- [ ] Typing a search that matches nothing shows "No lessons found for..."
- [ ] Search works with partial words ("java" matches "JavaScript")
- [ ] The PostgreSQL `search_vector` column and GIN index exist (check with `\d lessons` in psql)
- [ ] You can answer: what is an inverted index and how does it differ from a B-tree index?
- [ ] You can answer: what is debouncing and what problem does it solve?
- [ ] You can answer: what is predicate composition and how does `AND: conditions` implement it?
- [ ] `git commit` with a message explaining why — "Add full-text search with PostgreSQL tsvector, GIN index, and debounced input"
