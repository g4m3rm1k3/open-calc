# Lesson 32 — Algorithms and Data Structures in Your App

## What You Will Build

Implement three real features backed by specific data structures: a trie for instant
autocomplete of lesson titles, a min-heap priority queue for a ranked "next lesson" recommender,
and a graph for a prerequisite checker that detects cycles. These are not toy exercises —
each solves a real problem in the app.

---

## What You Need to Know First

- Lesson 23: Search and filtering (context for autocomplete)
- Lesson 21: Lesson data model (orderIndex, prerequisites)

---

## The Lesson

### Step 1 — Tries for Autocomplete

**The problem with the current search:**
The PostgreSQL full-text search in Lesson 23 is powerful but requires a database round-trip.
For instant autocomplete (suggestions as you type, before a query is sent), a client-side
in-memory structure is faster.

**What a trie is:**
A **trie** (pronounced "try", from "retrieval") is a tree where each node represents a
character. The path from root to a node spells a prefix. Every string sharing the same
prefix shares the same path.

```
Root
├── j
│   └── a
│       └── v
│           └── a (lesson: "JavaScript Variables")
│           └── a
│               └── s (lesson: "JavaScript Arrays", "JavaScript Objects")
└── t
    └── y
        └── p (lesson: "TypeScript Basics", "TypeScript Generics")
```

Looking up all lessons starting with "java" follows the path j → a → v → a and
collects all strings below. O(k) where k is the query length — independent of the number
of lessons.

**Implementation:**
```typescript
interface TrieNode {
  children: Map<string, TrieNode>
  lessons: string[]   // lesson titles ending here or passing through this node
}

export class LessonTrie {
  private readonly root: TrieNode = { children: new Map(), lessons: [] }

  insert(title: string): void {
    let node = this.root
    const lower = title.toLowerCase()
    for (const char of lower) {
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), lessons: [] })
      }
      node = node.children.get(char)!
    }
    node.lessons.push(title)
  }

  search(prefix: string): string[] {
    let node = this.root
    const lower = prefix.toLowerCase()

    for (const char of lower) {
      if (!node.children.has(char)) return []
      node = node.children.get(char)!
    }

    return this.collectAll(node)
  }

  private collectAll(node: TrieNode): string[] {
    const results: string[] = [...node.lessons]
    for (const child of node.children.values()) {
      results.push(...this.collectAll(child))
    }
    return results
  }
}
```

**CS lens — space/time tradeoff:**
The trie uses more memory than a sorted array (each character is a node with a `Map`),
but provides O(k) prefix search vs O(n × k) for scanning all strings. For autocomplete
with many queries, the time savings outweigh the memory cost.

**CS lens — tree traversal:**
`collectAll` is a depth-first search (DFS) on the trie. It visits every node reachable
from the current node, collecting lessons as it goes. The recursive `...this.collectAll(child)`
call processes the entire subtree before moving to the next sibling.

### Step 2 — Min-Heap for Next Lesson Recommender

**The problem:**
After completing a lesson, recommend the best next lesson. "Best" = lowest orderIndex
among incomplete lessons. If the list is large and updates frequently (completions
add/remove lessons from the eligible set), scanning the entire list each time is O(n).

**A min-heap provides O(log n) extraction of the minimum:**

```typescript
export class MinHeap<T> {
  private readonly data: Array<{ priority: number; value: T }> = []

  push(value: T, priority: number): void {
    this.data.push({ priority, value })
    this.bubbleUp(this.data.length - 1)
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined
    const min = this.data[0]!.value
    const last = this.data.pop()!
    if (this.data.length > 0) {
      this.data[0] = last
      this.sinkDown(0)
    }
    return min
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.data[parent]!.priority <= this.data[index]!.priority) break
      ;[this.data[parent], this.data[index]] = [this.data[index]!, this.data[parent]!]
      index = parent
    }
  }

  private sinkDown(index: number): void {
    const size = this.data.length
    while (true) {
      const left = 2 * index + 1
      const right = 2 * index + 2
      let smallest = index

      if (left < size && this.data[left]!.priority < this.data[smallest]!.priority) smallest = left
      if (right < size && this.data[right]!.priority < this.data[smallest]!.priority) smallest = right
      if (smallest === index) break

      ;[this.data[smallest], this.data[index]] = [this.data[index]!, this.data[smallest]!]
      index = smallest
    }
  }
}
```

**Heap property:** In a min-heap, each parent has a priority less than or equal to both
children. The minimum is always at index 0. `push` adds at the end and "bubbles up"
to restore the property. `pop` removes the root, moves the last element to the root,
and "sinks down" to restore the property.

**CS lens — array as a tree:**
The heap is stored as an array but represents a binary tree. For a node at index `i`:
- Left child is at `2i + 1`
- Right child is at `2i + 2`
- Parent is at `Math.floor((i - 1) / 2)`

This avoids the memory overhead of explicit node objects and pointer following.

**Using the recommender:**
```typescript
function getNextLesson(allLessons: Lesson[], completedIds: Set<number>): Lesson | null {
  const heap = new MinHeap<Lesson>()
  for (const lesson of allLessons) {
    if (!completedIds.has(lesson.id)) {
      heap.push(lesson, lesson.orderIndex)
    }
  }
  return heap.pop() ?? null
}
```

### Step 3 — Graph for Prerequisite Checking

**The problem:**
Lessons have prerequisites. If a content admin adds "Lesson 8 requires Lesson 16 requires
Lesson 8", that is a cycle — a student can never satisfy all prerequisites. Detect cycles
before saving.

**Representing the prerequisite graph:**
An **adjacency list** represents a graph. Each lesson ID maps to an array of lesson IDs
that are its prerequisites:
```
{ 1: [], 2: [1], 3: [1, 2], 8: [16], 16: [8] }  ← cycle: 8→16→8
```

**Cycle detection with DFS:**
```typescript
type Graph = Map<number, number[]>

export function hasCycle(graph: Graph): boolean {
  const visited = new Set<number>()
  const inStack = new Set<number>()   // nodes in the current DFS path

  function dfs(node: number): boolean {
    visited.add(node)
    inStack.add(node)

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true    // cycle found in subtree
      } else if (inStack.has(neighbor)) {
        return true                        // back edge = cycle
      }
    }

    inStack.delete(node)   // leaving this node's DFS path
    return false
  }

  for (const node of graph.keys()) {
    if (!visited.has(node) && dfs(node)) return true
  }
  return false
}
```

**How the algorithm works:**
- `visited`: nodes we have started exploring (prevents re-exploring)
- `inStack`: nodes currently in the recursion stack (the current DFS path)
- A **back edge** is an edge from a node to one of its ancestors in the DFS tree
- A back edge means: there is a path from that ancestor back to itself = a cycle

**CS lens — Directed Acyclic Graph (DAG):**
A valid prerequisite structure is a **DAG** — a directed graph with no cycles.
Topological sorting (ordering nodes so every prerequisite comes before the lesson
that requires it) is only possible on DAGs. npm's dependency resolution uses DAG
topological sort. Prisma's migration ordering uses it. Build systems (Make, Gradle) use it.

**Validating before saving:**
```typescript
router.post('/lessons', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, prerequisites, ...rest } = lessonCreateSchema.parse(req.body)

    // Build current graph and add the new lesson
    const existingLessons = await prisma.lesson.findMany({ include: { prerequisites: true } })
    const graph = buildGraph(existingLessons)
    // Add the proposed new edges
    graph.set(NEW_ID, prerequisites)

    if (hasCycle(graph)) {
      return res.status(400).json({ error: 'Prerequisite cycle detected' })
    }

    const lesson = await prisma.lesson.create({ data: { title, ...rest } })
    res.json(lesson)
  } catch (error) {
    next(error)
  }
})
```

---

## Connect the Pieces

The trie is a specialization of the tree data structure from Lesson 03 (React's virtual
DOM tree). All three are trees: their differences are in what each node stores and how
traversal is used. The trie uses DFS for collection, just as React uses DFS for
reconciliation (Lesson 03).

The heap's array-as-binary-tree representation is the same principle as contiguous memory
layouts for efficiency. The array avoids pointer chasing (following a reference to find
the next node's memory location) — all heap data is in one contiguous block, cache-friendly.
This is why heaps (and the binary search algorithm) use arrays, not linked lists.

The prerequisite graph's DAG constraint is enforced at the API layer, not the database layer.
This is a business rule — databases can enforce referential integrity (foreign keys) but
not cycle prevention. Business rules enforced only in the application layer, without database
constraints, can be bypassed by direct database writes. For cycle prevention, the API layer
is the correct enforcement point because the database has no native cycle detection.

---

## What Breaks Without This

Without cycle detection in prerequisites, a cycle makes certain lessons permanently
unreachable. A student who reaches lesson 8 sees "you must complete lesson 16 first."
Lesson 16 says "you must complete lesson 8 first." The student is stuck forever.
The bug is invisible until a student hits it; fixing it requires direct database surgery.

Without the trie, autocomplete makes a database request on every keystroke (even with
debouncing, three characters triggers a query). For a feature where sub-50ms latency
is needed for the "instant" feel, a database round-trip (5–50ms) is too slow. The trie
preloaded in memory returns results in microseconds.

---

## Definition of Done

- [ ] Typing in the autocomplete input shows suggestions from the trie without API calls
- [ ] The trie is built once on app load and reused (not rebuilt on each keystroke)
- [ ] The "next lesson" banner uses the min-heap recommender
- [ ] Adding a lesson with a cycle in prerequisites returns a 400 error with a clear message
- [ ] `hasCycle` is unit-tested with a graph that has no cycle and one that does
- [ ] You can answer: what is a trie and what problem does it solve?
- [ ] You can answer: what is the heap property and what does O(log n) extraction mean?
- [ ] You can answer: what is a DAG, a back edge, and how does DFS detect cycles?
- [ ] `git commit` with a message explaining why — "Add trie autocomplete, heap recommender, and DAG cycle detection for prerequisites"
