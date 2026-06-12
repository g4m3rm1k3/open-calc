# Lesson 21 — The Lesson Engine

## What You Will Build

A lesson has a prompt, starter code, expected output, and hints. The engine runs the
user's code and compares the output to the expected output. A green checkmark means the
output matched; a diff shows exactly what was wrong if it did not. The lesson is marked
complete in the database when the user succeeds.

---

## What You Need to Know First

- Lesson 09: The sandboxed iframe runner, `ExecutionResult`
- Lesson 13: The `progress` table, `markLessonComplete`
- Lesson 18: The auth token, sending authenticated API requests

---

## The Lesson

### Step 1 — String Comparison and Whitespace

The simplest checker compares strings: does the user's output equal the expected output?

```typescript
function outputMatches(actual: string, expected: string): boolean {
  return actual.trim() === expected.trim()
}
```

**The `.trim()` normalisation:**
`"hello\n"` and `"hello"` do not pass `===`, but `.trim()` removes leading and trailing
whitespace (including newlines) before comparing. Without normalisation:
- A Python `print("hello")` produces `"hello\n"` (with a trailing newline)
- The expected output `"hello"` does not include the newline
- The comparison fails, the lesson is incorrectly marked wrong

`.trim()` handles the most common case. More thorough normalisation would also normalise
multiple spaces, line endings (`\r\n` vs `\n`), and case — but `.trim()` handles 95% of
cases without over-engineering.

**Determinism:** The expected output of a lesson must be deterministic — the same input
always produces the same output. Never use `Math.random()`, `Date.now()`, or any source
of non-determinism in expected output. If the expected output can vary, the checker
cannot verify it.

**CS lens:** Output comparison is a string equality check — O(n) where n is the length
of the shorter string. For typical lesson output (a few lines), this is instant.

### Step 2 — Diffing for Error Messages

When the output does not match, showing only "incorrect" is unhelpful. Showing what was
different is actionable.

**What a diff is:** The minimum set of changes to transform one string into another.
The same algorithm `git diff` uses. For single-line outputs, the diff is trivial. For
multi-line outputs, it shows which lines are added, which are removed, and which are unchanged.

Install a diff library:
```bash
$ npm install diff
$ npm install --save-dev @types/diff
```

```typescript
import { diffLines, type Change } from 'diff'

interface DiffResult {
  readonly matches: boolean
  readonly diff: ReadonlyArray<{ value: string; added?: boolean; removed?: boolean }>
}

function checkOutput(actual: string, expected: string): DiffResult {
  const normalizedActual = actual.trim()
  const normalizedExpected = expected.trim()

  if (normalizedActual === normalizedExpected) {
    return { matches: true, diff: [] }
  }

  const changes: Change[] = diffLines(normalizedExpected, normalizedActual)
  return { matches: false, diff: changes }
}
```

**`diffLines` explained:**
`diffLines(oldText, newText)` returns an array of `Change` objects, each with:
- `value` — the text of this segment
- `added?: true` — this line exists in the new text but not the old (user's unexpected output)
- `removed?: true` — this line exists in the old text but not the new (expected output the user missed)
- Neither — this line is unchanged (user's output matched this part)

**SE lens — the specification as code:**
The expected output is a precise, machine-checkable specification. Tests are specifications.
The lesson engine is a test runner. This is what automated testing is: a checker that
verifies a specification. Students writing lessons are writing specifications, not just
code.

### Step 3 — The Lesson Data Model

Update the `Lesson` model in `prisma/schema.prisma`:

```prisma
model Lesson {
  id             Int        @id @default(autoincrement())
  title          String
  difficulty     String     @default("beginner")
  prompt         String
  starterCode    String     @map("starter_code")
  expectedOutput String     @map("expected_output")
  hints          String[]
  orderIndex     Int        @map("order_index")
  createdAt      DateTime   @default(now()) @map("created_at")
  progress       Progress[]
}
```

**`String[]` — array type in Prisma:**
PostgreSQL supports array columns. `hints String[]` maps to `TEXT[]` in PostgreSQL.
Prisma exposes it as a TypeScript `string[]`. An alternative is to store hints as JSON
(`Json` type in Prisma). `String[]` is simpler when the array contains only strings.

**`orderIndex`:** Lessons should appear in a specific order. Without an explicit order
field, `findMany` returns lessons in insertion order (unreliable) or `id` order
(tight coupling of business order to database ID). An explicit `orderIndex` allows
reordering lessons without changing their IDs.

### Step 4 — The Engine Component

Create `src/components/LessonEngine.tsx`:

```typescript
import { useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { CodeEditor } from './CodeEditor'
import { OutputPanel } from './OutputPanel'
import { createSandboxRunner } from '../runner/sandbox'
import { checkOutput } from '../engine/checker'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markLessonComplete } from '../api/progress'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, typography } from '../theme'

interface LessonEngineProps {
  readonly lesson: {
    id: number
    title: string
    prompt: string
    starterCode: string
    expectedOutput: string
    hints: string[]
  }
}

export function LessonEngine({ lesson }: LessonEngineProps) {
  const [currentCode, setCurrentCode] = useState(lesson.starterCode)
  const [runResult, setRunResult] = useState<ExecutionResult | null>(null)
  const [checkResult, setCheckResult] = useState<DiffResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)

  const { token } = useAuth()
  const queryClient = useQueryClient()

  const completeMutation = useMutation({
    mutationFn: () => markLessonComplete(lesson.id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })

  async function handleRun() {
    if (isRunning) return
    setIsRunning(true)
    setRunResult(null)
    setCheckResult(null)

    const runner = createSandboxRunner()
    try {
      const result = await runner.run(currentCode)
      setRunResult(result)

      const actualOutput = result.stdout.join('\n')
      const check = checkOutput(actualOutput, lesson.expectedOutput)
      setCheckResult(check)

      if (check.matches && completeMutation.isIdle) {
        completeMutation.mutate()
      }
    } finally {
      setIsRunning(false)
      runner.cleanup()
    }
  }

  function showNextHint() {
    setHintIndex(Math.min(hintIndex + 1, lesson.hints.length - 1))
    setShowHints(true)
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.prompt}>{lesson.prompt}</Text>

      <CodeEditor
        defaultValue={lesson.starterCode}
        language="javascript"
        onValueChange={setCurrentCode}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={handleRun}
          disabled={isRunning}
        >
          <Text style={styles.runButtonText}>{isRunning ? 'Running…' : '▶ Run'}</Text>
        </TouchableOpacity>

        {lesson.hints.length > 0 && (
          <TouchableOpacity style={styles.hintButton} onPress={showNextHint}>
            <Text style={styles.hintButtonText}>Hint</Text>
          </TouchableOpacity>
        )}
      </View>

      {showHints && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>{lesson.hints[hintIndex]}</Text>
        </View>
      )}

      {runResult !== null && <OutputPanel result={runResult} isRunning={false} />}

      {checkResult !== null && (
        <CheckResult result={checkResult} isComplete={completeMutation.isSuccess} />
      )}
    </ScrollView>
  )
}
```

**`useMutation` explained:**
`useMutation` is TanStack Query's hook for state-changing operations (POST, PUT, DELETE).
Unlike `useQuery` (for reading data), mutations are triggered manually.
- `mutationFn` — the async function to call
- `onSuccess` — called after a successful mutation
- `completeMutation.mutate()` — triggers the mutation
- `completeMutation.isIdle` — true before the first call
- `completeMutation.isSuccess` — true after successful completion

**`queryClient.invalidateQueries({ queryKey: ['progress'] })`:**
After marking a lesson complete, the cached progress data is stale. `invalidateQueries`
tells TanStack Query to refetch all queries with this key — the progress percentage on
the Profile screen updates automatically.

**CS lens — data-driven design:**
Instead of writing a function for each lesson (`handleLesson01`, `handleLesson02`),
you write one engine that handles all lessons, driven by lesson data. This is the
**data-driven approach**: the behaviour (checking output) is fixed; the specification
(expected output) is data. Adding a new lesson requires no code change — only data.

**SE lens — separation of concerns:**
`LessonEngine` renders the UI and orchestrates the flow. `createSandboxRunner` handles
execution isolation. `checkOutput` handles comparison. `markLessonComplete` handles
persistence. Each concern is a separate module, each testable independently.

---

## Connect the Pieces

The `checkOutput` function is a precise, machine-checkable specification of what "correct"
means for each lesson. This is the same concept as automated tests: a test is a
specification. The lesson engine is running the user's code against that specification.

`queryClient.invalidateQueries` is TanStack Query's mechanism for cache invalidation —
the hardest problem in caching (Phil Karlton famously said: "There are only two hard
things in Computer Science: cache invalidation and naming things"). The query key
provides the granularity: invalidating `['progress']` refreshes only progress data, not lessons.

The data-driven approach here — lessons as data, one engine for all — is the same
design as the executor registry (building towards Lesson 34): one dispatch mechanism,
many implementations, driven by data. The principle is universal.

---

## What Breaks Without This

Without `normalizedActual === normalizedExpected` (the `.trim()` normalisation), every
Python lesson fails — `print("hello")` adds a trailing newline, and `"hello\n" !== "hello"`.
Students see their code as wrong even when it is correct. They spend time debugging code
that works, looking for a problem that does not exist.

Without `queryClient.invalidateQueries`, the progress percentage on the Profile screen
stays at the old value after completing a lesson. The user completes 5 lessons and still
sees "40%". They refresh the page — it updates to 50%. Stale cache causing inconsistent
UI is a classic cause of user confusion.

---

## Definition of Done

- [ ] Clicking Run executes the code and shows output
- [ ] Correct output shows a green checkmark and marks the lesson complete
- [ ] Incorrect output shows a diff of what was expected vs what was received
- [ ] The lesson is marked complete in the database (check via `GET /api/progress`)
- [ ] The Profile screen's progress percentage updates after completing a lesson
- [ ] Clicking "Hint" shows one hint at a time
- [ ] You can answer: why does `.trim()` matter for output comparison?
- [ ] You can answer: what is determinism and why is it required for expected output?
- [ ] You can answer: what does `queryClient.invalidateQueries` do and when is it needed?
- [ ] `git commit` with a message explaining why — "Add lesson engine with output comparison, diff display, and completion tracking"
