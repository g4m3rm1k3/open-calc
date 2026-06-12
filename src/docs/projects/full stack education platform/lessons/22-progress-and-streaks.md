# Lesson 22 — Progress and Streaks

## What You Will Build

Track daily progress. Show a streak counter — the number of consecutive days with activity.
Persist to the database. The Profile screen shows the streak count and a completion chart.

---

## What You Need to Know First

- Lesson 13: The `progress` table, `markLessonComplete`
- Lesson 16: TanStack Query, `useQuery`

---

## The Lesson

### Step 1 — Date Arithmetic

Dates are surprisingly difficult to handle correctly. The core issue: dates are relative
to a timezone, but timestamps are absolute.

**Unix timestamps:** A Unix timestamp is the number of seconds (or milliseconds) since
January 1, 1970 00:00:00 UTC. `1705312800000` is a specific moment in time, regardless
of where the user is. `new Date().getTime()` returns the current Unix timestamp in milliseconds.

**Why store timestamps, not date strings:**
- `"2024-01-15"` is ambiguous — which timezone? Paris midnight and New York midnight are
  different moments in time.
- A timestamp `1705276800000` is unambiguous — it identifies one specific millisecond.
- When you display a timestamp, you format it in the user's local timezone.

**Timezone arithmetic pitfall:**
"Did the user complete a lesson today?" depends on their timezone. `new Date()` in
UTC gives today in UTC. A user in Tokyo completing a lesson at 1am Tokyo time is doing
it the previous UTC day. For streaks, use the user's local date, not UTC.

**Converting timestamps to dates:**
```typescript
function getLocalDateString(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date)
  // Returns 'YYYY-MM-DD' in the specified timezone
}

const today = getLocalDateString(new Date(), 'America/New_York')
// '2024-01-15' (in New York's timezone)
```

`Intl.DateTimeFormat` is a browser API for locale-aware date formatting. `'en-CA'` uses
Canadian English formatting, which happens to use ISO `YYYY-MM-DD` format — convenient
for comparison. The `timeZone` option formats the date in the user's timezone.

### Step 2 — The Streak Algorithm

A streak is the number of consecutive days with at least one completion.

**The four cases:**
1. **No prior activity** — streak = 1 (first ever lesson completed)
2. **Activity on the same day** — streak unchanged (already counted today)
3. **Activity on the previous day** — streak + 1 (consecutive)
4. **Activity before yesterday** — streak = 1 (streak broken, start over)

**CS lens — identifying all cases before writing code:**
This analysis is **edge case identification** — listing every possible input before writing
code. Programming bugs often live in the cases that were not thought about. Listing four
cases and handling each explicitly is better than writing code that accidentally handles
some and silently ignores others.

```typescript
interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null  // ISO date string 'YYYY-MM-DD'
}

function calculateStreakUpdate(
  current: StreakData,
  activityDate: string,
  timeZone: string,
): StreakData {
  const today = getLocalDateString(new Date(), timeZone)
  const yesterday = getLocalDateString(
    new Date(Date.now() - 24 * 60 * 60 * 1000),
    timeZone
  )

  if (current.lastActivityDate === null) {
    // Case 1: first ever activity
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: activityDate,
    }
  }

  if (current.lastActivityDate === activityDate) {
    // Case 2: already active today — no change
    return current
  }

  if (current.lastActivityDate === yesterday) {
    // Case 3: active yesterday — extend streak
    const newStreak = current.currentStreak + 1
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, current.longestStreak),
      lastActivityDate: activityDate,
    }
  }

  // Case 4: streak broken — start over
  return {
    currentStreak: 1,
    longestStreak: current.longestStreak,
    lastActivityDate: activityDate,
  }
}
```

**SE lens — the business logic layer:**
`calculateStreakUpdate` has no dependencies on React, the database, or HTTP. It is a pure
function — given the same inputs, it returns the same output. This means it can be tested
without any infrastructure:

```typescript
test('extends streak on consecutive days', () => {
  const result = calculateStreakUpdate(
    { currentStreak: 5, longestStreak: 10, lastActivityDate: '2024-01-14' },
    '2024-01-15',
    'UTC'
  )
  expect(result.currentStreak).toBe(6)
})
```

Business logic that lives in route handlers, embedded in `useEffect` calls, or mixed
with database queries cannot be tested this way. The principle: extract business rules
into pure functions. Route handlers and components call these functions; they do not
contain business logic.

### Step 3 — Storing Streak Data

Add to the `User` model in Prisma:

```prisma
model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  name            String
  currentStreak   Int       @default(0) @map("current_streak")
  longestStreak   Int       @default(0) @map("longest_streak")
  lastActivityDate String?  @map("last_activity_date")
  // ...
}
```

**`String?` — optional field:**
In Prisma, `?` means the field is nullable. `lastActivityDate` is `null` for new users
who have never completed a lesson. The TypeScript type is `string | null`.

**Update streak when a lesson is completed:**
```typescript
export async function markLessonComplete(userId: number, lessonId: number, timeZone: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActivityDate: true },
  })

  if (user === null) throw new Error('User not found')

  const activityDate = getLocalDateString(new Date(), timeZone)

  const updatedStreak = calculateStreakUpdate(
    { currentStreak: user.currentStreak, longestStreak: user.longestStreak, lastActivityDate: user.lastActivityDate },
    activityDate,
    timeZone,
  )

  await prisma.$transaction([
    prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId },
      update: { completedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: updatedStreak.currentStreak,
        longestStreak: updatedStreak.longestStreak,
        lastActivityDate: updatedStreak.lastActivityDate,
      },
    }),
  ])
}
```

**`prisma.$transaction([...])` explained:**
A transaction groups multiple operations so they either all succeed or all fail.
If the `progress.upsert` succeeds but the `user.update` fails, the lesson would be marked
complete but the streak not updated. With a transaction, either both succeed or both fail —
the database is left in a consistent state.

This is the **Atomicity** property of ACID: a transaction is atomic — it is an indivisible
unit. The database treats all operations inside a transaction as a single operation.

**`$transaction` as an array:** Prisma's interactive transactions accept an array of
Prisma client operations. Each runs in sequence within one database transaction.

### Step 4 — The Profile Screen

```typescript
export function ProfileScreen() {
  const { user } = useAuth()
  const { data: progress } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: () => fetchProgress(user!.id),
    enabled: user !== null,
  })
  const { data: lessonsTotal } = useQuery({
    queryKey: ['lessons', 'count'],
    queryFn: fetchLessonCount,
  })

  const completedCount = progress?.length ?? 0
  const percentage = lessonsTotal != null && lessonsTotal > 0
    ? Math.round((completedCount / lessonsTotal) * 100)
    : 0

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Hello, {user?.name}</Text>

      <View style={styles.statsRow}>
        <StatCard label="Day Streak" value={user?.currentStreak ?? 0} />
        <StatCard label="Completed" value={completedCount} />
        <StatCard label="Progress" value={`${percentage}%`} />
      </View>
    </ScrollView>
  )
}
```

**`enabled: user !== null`:** TanStack Query's `enabled` option prevents the query from
running when `user` is `null`. Without it, the query would fire before the user is loaded,
using `user!.id` which throws — the `!` assertion assumes `user` is defined, but it is not yet.

---

## Connect the Pieces

The streak algorithm's four cases (first activity, same day, consecutive day, broken streak)
is the same rigorous case analysis applied to the sandboxed runner in Lesson 09: list all
possible states and transitions before writing code. This is not a special technique — it
is the expected approach for non-trivial algorithms.

The `prisma.$transaction` call mirrors the ACID properties taught in Lesson 12. The streak
update and completion record are a single atomic operation. If the server crashes between
them, the database rolls back to before either ran. Partial updates that leave the database
in an inconsistent state are one of the hardest categories of bugs to debug.

Streak algorithms appear in every gamification system: Duolingo, GitHub's contributions
graph, Wordle's streak, fitness apps. The algorithm is simple; the edge cases (timezone,
same-day activity, missed days) are universal.

---

## What Breaks Without This

Without the `lastActivityDate === activityDate` check (Case 2), completing two lessons
on the same day increments the streak twice: `completedLesson1 → streak = 1`,
`completedLesson2 → streak = 2`. A user who completes 5 lessons in one day shows a
streak of 5 days without ever opening the app on consecutive days.

Without a database transaction, a server crash between the two updates leaves the
`progress` record created but the `user` streak unchanged. The user's lesson is marked
complete, but their streak is one lower than it should be. The next day, they extend
their streak from the uncounted day — their streak is permanently one day behind.

---

## Definition of Done

- [ ] Completing a lesson on day 1 shows streak = 1
- [ ] Completing a lesson on day 2 shows streak = 2
- [ ] Completing two lessons on the same day keeps streak = 1 (not 2)
- [ ] Skipping a day resets streak to 1
- [ ] The `calculateStreakUpdate` function has tests covering all four cases
- [ ] The Profile screen shows current streak, completed count, and percentage
- [ ] You can answer: why are dates stored as timestamps and displayed in the user's timezone?
- [ ] You can answer: what is a database transaction and why is it needed for the streak update?
- [ ] You can answer: what makes `calculateStreakUpdate` a business logic layer function?
- [ ] `git commit` with a message explaining why — "Add streak tracking with atomic progress + streak update transaction"
