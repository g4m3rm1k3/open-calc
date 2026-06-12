# Lesson 33 — Functional Programming Concepts

## What You Will Build

Refactor the lesson engine's output processing pipeline and the search filter composition
using functional programming: pure functions, function composition, immutability, and
higher-order functions. No new features — the same behavior, implemented with FP principles
that make the logic more testable and easier to reason about.

---

## What You Need to Know First

- Lesson 21: The lesson engine, `checkOutput`, output processing
- Lesson 23: Search filter composition, `Prisma.LessonWhereInput[]`

---

## The Lesson

### Step 1 — Pure Functions

**A pure function:**
1. Returns the same output for the same input (deterministic)
2. Has no side effects (does not modify external state, write to disk, send HTTP requests)

```typescript
// Pure: same inputs → same output, no side effects
function normalizeOutput(raw: string): string {
  return raw.trim().replace(/\r\n/g, '\n')
}

// Impure: depends on external state (Date.now)
function timestampedOutput(raw: string): string {
  return `[${Date.now()}] ${raw.trim()}`
}

// Impure: side effect (modifies the array argument)
function appendResult(results: string[], result: string): void {
  results.push(result)    // mutates the argument
}
```

**Why pure functions are valuable:**
- **Testable:** No setup required. Call with inputs, assert on output. No mocks.
- **Composable:** Output of one pure function is input to the next. No shared state.
- **Cacheable:** Same inputs → same output, so results can be memoized (Lesson 26).
- **Parallelizable:** No shared mutable state means no race conditions (Lesson 37).

**CS lens — referential transparency:**
A pure function is **referentially transparent** — any call can be replaced with its
return value without changing program behavior. `normalizeOutput("hello\n")` can be
replaced with `"hello"` everywhere it appears. This property enables compilers to
perform optimizations (inlining, constant folding) that are impossible with impure functions.

### Step 2 — Function Composition

**Composition:** Combining small functions into larger ones. The output of function `f`
becomes the input of function `g`: `g(f(x))`.

```typescript
// Individual processing steps — each pure, each small
const trimOutput = (s: string): string => s.trim()
const normalizeLineEndings = (s: string): string => s.replace(/\r\n/g, '\n')
const collapseEmptyLines = (s: string): string => s.replace(/\n{3,}/g, '\n\n')
const lowercase = (s: string): string => s.toLowerCase()

// Compose manually
const normalizeForComparison = (s: string): string =>
  lowercase(collapseEmptyLines(normalizeLineEndings(trimOutput(s))))

// Or with a compose utility
function compose<T>(...fns: Array<(x: T) => T>): (x: T) => T {
  return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x)
}

function pipe<T>(...fns: Array<(x: T) => T>): (x: T) => T {
  return (x: T) => fns.reduce((acc, fn) => fn(acc), x)
}

const normalizeForComparison2 = pipe(
  trimOutput,
  normalizeLineEndings,
  collapseEmptyLines,
  lowercase,
)

// Apply to both actual and expected output
function checkOutput(actual: string, expected: string): DiffResult {
  const normalize = pipe(trimOutput, normalizeLineEndings, collapseEmptyLines)
  return {
    matches: normalize(actual) === normalize(expected),
    diff: diffLines(normalize(expected), normalize(actual)),
  }
}
```

**`pipe` vs `compose` explained:**
- `pipe(f, g, h)(x)` = `h(g(f(x)))` — left to right, like reading a Unix pipeline
- `compose(f, g, h)(x)` = `f(g(h(x)))` — right to left, mathematical function composition

`pipe` reads in the order operations happen: first `trimOutput`, then `normalizeLineEndings`.
`compose` reads in reverse. `pipe` is more readable for sequential data transformations.

**`reduceRight` explained:**
`[f, g, h].reduceRight((acc, fn) => fn(acc), x)` applies functions from right to left:
first `h(x)`, then `g(result)`, then `f(result)`. The accumulator is the current result.

### Step 3 — Higher-Order Functions

A **higher-order function** takes a function as an argument or returns a function.
`Array.map`, `Array.filter`, `Array.reduce` are higher-order functions.

```typescript
// The filter builders from Lesson 23, refactored as higher-order functions
type Predicate<T> = (value: T) => boolean
type LessonFilter = Predicate<{ difficulty: string; title: string }>

const byDifficulty = (difficulty: string): LessonFilter =>
  (lesson) => lesson.difficulty === difficulty

const byTitleMatch = (query: string): LessonFilter =>
  (lesson) => lesson.title.toLowerCase().includes(query.toLowerCase())

// Combining predicates
const andAll = <T>(...predicates: Array<Predicate<T>>): Predicate<T> =>
  (value) => predicates.every(p => p(value))

// Client-side filtering (complements server-side search)
function filterLessons(lessons: Lesson[], filters: { difficulty?: string; query?: string }) {
  const predicates: LessonFilter[] = []

  if (filters.difficulty !== undefined) {
    predicates.push(byDifficulty(filters.difficulty))
  }
  if (filters.query !== undefined && filters.query !== '') {
    predicates.push(byTitleMatch(filters.query))
  }

  const combined = andAll(...predicates)
  return lessons.filter(combined)
}
```

**Why higher-order functions over `if`/`else` chains:**
The `if`/`else` version:
```typescript
function filterLessons(lessons, filters) {
  return lessons.filter(lesson => {
    if (filters.difficulty && lesson.difficulty !== filters.difficulty) return false
    if (filters.query && !lesson.title.includes(filters.query)) return false
    return true
  })
}
```

This works but grows with each new filter. Adding a `tags` filter means editing the
filtering function. The higher-order version adds a new predicate function without
touching the composition logic — the **open/closed principle**: open for extension,
closed for modification.

**`Array.reduce` for aggregation:**
```typescript
// Compute lesson statistics in one pass
interface LessonStats {
  readonly total: number
  readonly byDifficulty: Record<string, number>
  readonly completedCount: number
}

function computeStats(lessons: Lesson[], completedIds: Set<number>): LessonStats {
  return lessons.reduce<LessonStats>(
    (acc, lesson) => ({
      total: acc.total + 1,
      byDifficulty: {
        ...acc.byDifficulty,
        [lesson.difficulty]: (acc.byDifficulty[lesson.difficulty] ?? 0) + 1,
      },
      completedCount: acc.completedCount + (completedIds.has(lesson.id) ? 1 : 0),
    }),
    { total: 0, byDifficulty: {}, completedCount: 0 }
  )
}
```

**`reduce` explained:**
`reduce(callback, initialValue)` processes each element by passing the accumulated result
and the current element to `callback`. The callback returns the new accumulated result.
The final accumulated result is returned. One pass through the array, O(n).

### Step 4 — Immutability in Practice

Mutating state creates bugs because the same object is two things at different times.
FP avoids mutation: instead of changing an object, create a new one with the change applied.

```typescript
// Mutable — the original object is changed, any code holding a reference to it sees the change
function updateLessonMutable(lesson: Lesson, title: string): void {
  lesson.title = title    // mutates the argument
}

// Immutable — returns a new object, original is unchanged
function updateLessonImmutable(lesson: Lesson, title: string): Lesson {
  return { ...lesson, title }   // spread creates a new object with title overridden
}

// Immutable array operations
const addLesson = (lessons: readonly Lesson[], lesson: Lesson): readonly Lesson[] =>
  [...lessons, lesson]

const removeLesson = (lessons: readonly Lesson[], id: number): readonly Lesson[] =>
  lessons.filter(l => l.id !== id)

const updateLesson = (lessons: readonly Lesson[], updated: Lesson): readonly Lesson[] =>
  lessons.map(l => l.id === updated.id ? updated : l)
```

**`readonly` modifier:**
`readonly Lesson[]` is a TypeScript type that prevents mutation methods (`push`, `pop`,
`splice`). The array can be iterated and spread, but not mutated. The `readonly` prefix
makes the immutability contract explicit and compiler-enforced.

**Why immutability matters for React:**
React's `useState` setter and `useReducer` work correctly only when state is replaced,
not mutated. If you mutate state in-place (`state.title = 'new'`), React does not
detect the change (reference equality check: same object, same reference = no re-render).
Spread operators (`{ ...state, title: 'new' }`) create a new object — new reference =
React detects the change and re-renders.

---

## Connect the Pieces

The `pipe` function implements the same sequential transformation as the middleware chain
in Lesson 11 (Express `app.use(...)` pipeline). Both are function composition: each
stage receives the output of the previous stage. The difference: Express middleware is
imperative (the middleware calls `next()`); `pipe` is declarative (the composition is
a value).

`andAll(...predicates)` is the runtime equivalent of the `Prisma.LessonWhereInput[]`
array with `{ AND: conditions }` from Lesson 23. Both combine predicates with logical AND.
One runs in the database; one runs in JavaScript. The same composable predicate pattern
appears in both.

Immutability and the `readonly` modifier are enforced by TypeScript at compile time and
by convention at runtime. React hooks enforce immutability by convention (they rely on
reference equality). This is why the TypeScript/React combination encourages FP patterns:
the type system and the UI framework both reward immutability.

---

## What Breaks Without This

Without immutability in reducer state updates, React's `useReducer` fails silently.
Mutating the state object in the reducer (`state.title = action.title; return state`)
returns the same object reference. React compares `prevState === newState` — same reference,
no re-render. The UI does not update even though the state "changed". The bug is
invisible in the JavaScript runtime but detected by tests that check render output.

Without pure functions in `checkOutput`, adding a `Date.now()` timestamp to the output
makes the function non-deterministic. The same code run twice produces different output.
Tests become unreliable — they may pass or fail depending on timing. The expected output
in the lesson database cannot match a timestamped output.

---

## Definition of Done

- [ ] `checkOutput` uses `pipe` for output normalization
- [ ] `filterLessons` uses composable predicates with `andAll`
- [ ] The reducer for lesson state uses immutable updates (spread operators, no mutation)
- [ ] `computeStats` uses `reduce` in one pass
- [ ] Pure function unit tests require zero mocks
- [ ] You can answer: what is a pure function and why is it more testable than an impure one?
- [ ] You can answer: what is the difference between `pipe` and `compose`?
- [ ] You can answer: why does React require immutable state updates?
- [ ] You can answer: what is referential transparency?
- [ ] `git commit` with a message explaining why — "Refactor output processing and search filters using functional composition and immutable patterns"
