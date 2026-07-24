# Lesson 23: Persistence, the Suspend-Function Way

*(Room + Coroutines/Flow for Calculation History)*

**User Story**
> As a user, I don't want my calculation history to disappear when I close
> the app.

**What you will build**
Lesson 8's in-memory `mutableStateListOf<CalculationEntry>` is replaced by
a real Room database — history now survives a full app restart, and the
UI updates live as new entries are saved.

**What you need to know first**
Lesson 8's `CalculationEntry` and history list. From `../track/`: Lesson
13, Room — the `@Entity`/`@Dao`/`@Database` annotations, migrations, and
what a compile-time-checked query actually means are all assumed known and
not re-explained here; this lesson is specifically about the *coroutine*
layer on top of that same Room setup.

---

## Concept Unit: `suspend fun` in a Room `@Dao`

### The Problem

`../track/` Lesson 13 already covers Room's basic shape:
`@Entity`/`@Dao`/`@Database`. What that course's Java-based examples
couldn't show is Room's modern Kotlin integration — DAO methods declared
as `suspend fun`, letting a database write happen off the main thread
(Lesson 22's exact concern, applied to disk I/O instead of animation
timing) with code that still reads as an ordinary sequential function
call.

### Project Change

- **Reference Source:** No reference counterpart — the Kotlin-coroutine
  layer added on top of the same Room concepts `../track/` Lesson 13
  already covers.
- **Files affected:** New files `CalculationEntity.kt`, `CalculationDao.kt`,
  `AppDatabase.kt`; the calculator screen's `onButtonPressed`.
- **Change type:** Add.
- **Location:** Replacing Lesson 8's `mutableStateListOf` history.
- **Dependencies:** `androidx.room:room-runtime`, `androidx.room:room-ktx`
  (the `-ktx` artifact specifically is what provides `suspend fun`/`Flow`
  support on top of Room's core).

### The New Code

```kotlin
@Entity
data class CalculationEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val expression: String,
    val result: String
)

@Dao
interface CalculationDao {
    @Insert
    suspend fun insert(entry: CalculationEntity)

    @Query("SELECT * FROM CalculationEntity ORDER BY id DESC")
    fun observeAll(): Flow<List<CalculationEntity>>
}
```

### Mechanical walkthrough

1. `@Entity` / `data class CalculationEntity` — (hard concept reappearing)
   the exact Room annotation from `../track/` Lesson 13, here on a Kotlin
   `data class` instead of a Java class — Room reads a `data class`'s
   primary-constructor properties (Lesson 0's `Point` shape) the same way
   it reads a Java class's fields.
2. `suspend fun insert(entry: CalculationEntity)` — (first appearance in
   this context) marking a Room DAO method `suspend` tells Room to
   generate code that runs the actual SQL off the main thread and resumes
   the calling coroutine when it's done — the direct, modern replacement
   for `../track/`'s `AsyncTask`-or-background-`Thread` pattern for
   database access specifically.
3. `fun observeAll(): Flow<List<CalculationEntity>>` — (first appearance)
   **not** `suspend` — a `Flow`-returning Room query instead returns a
   stream that emits a new `List<CalculationEntity>` every time the
   underlying table's data actually changes, automatically, for as long as
   something is observing it. This is Room's own answer to
   `../track/` Lesson 16's `LiveData` — same underlying idea (data that
   announces itself), a different, more general stream type.

### CS Lens

`Flow` is Kotlin's coroutine-based stream type — a sequence of values
delivered over time, each one requiring the ability to suspend between
emissions, the same way `suspend fun` allows pausing between individual
values instead of a single final result. Also recognized in: RxJava's
`Observable` (which `../track/`'s ecosystem may already be adjacent to),
JavaScript's async iterators, and reactive streams generally — the
recurring "values arriving over time, consumer processes them as they
come" idea, appearing for the third time in this curriculum (`LiveData` in
`../track/`, `MutableState`/recomposition in this course's own Lesson 2,
now `Flow`).

### SE Lens

Why does Room offer *both* `suspend fun` (for one-shot operations like
`insert`) and `Flow` (for an ongoing, live-updating query)? Because they
answer different questions: "do this once, tell me when it's done"
(`suspend fun`) versus "keep me updated on this data for as long as I'm
watching" (`Flow`) — using `suspend fun` for `observeAll()` would only
give you the list's state at one moment, not future changes; using `Flow`
for `insert()` would be a strange fit for an operation that happens
exactly once and produces no ongoing stream of values.

### Connection

Lesson 24 replaces the `ViewModel`'s remaining `mutableStateOf` (Lesson 11)
with `StateFlow`, converting this DAO's `Flow` into something a Compose
screen reads with `collectAsState()`.

---

## Concept Unit: Calling a Suspend Function from a Click Handler

### The Problem

`onButtonPressed` (Lesson 5 onward) is a plain, non-suspend function —
button clicks in Compose are ordinary callbacks, not coroutines. Calling
`dao.insert(...)`, a `suspend fun`, directly from inside it is a compile
error for exactly the reason Concept Unit 1 named: `suspend` functions can
only be called from other `suspend` functions or from a coroutine.

### The Updated Project

```kotlin
val coroutineScope = rememberCoroutineScope()   // ← new

fun onButtonPressed(label: String) {
    expression = when (label) {
        // ...
        "=" -> when (val result = safeEvaluate(expression)) {
            is CalcResult.Ok -> {
                coroutineScope.launch {                                          // ← new
                    dao.insert(CalculationEntity(expression = expression, result = result.value.toString()))
                }
                result.value.toString()
            }
            is CalcResult.Error -> result.message
        }
        else -> expression + label
    }
}

val history by dao.observeAll().collectAsState(initial = emptyList())   // ← changed from Lesson 8's mutableStateListOf
```

### Mechanical walkthrough

1. `rememberCoroutineScope()` — (first appearance) gives a plain, ordinary
   (non-`suspend`) function like `onButtonPressed` a `CoroutineScope`
   tied to the composable's lifecycle — the bridge that lets a regular
   click handler start coroutine work without itself being `suspend`.
2. `coroutineScope.launch { dao.insert(...) }` — (first appearance)
   `launch` starts a new coroutine running the given block — inside it,
   calling the `suspend fun insert(...)` is legal, satisfying the
   restriction from Concept Unit 1.
3. `dao.observeAll().collectAsState(initial = emptyList())` — (first
   appearance) `collectAsState` bridges a `Flow` into Compose's state
   system (Lesson 2) — every new list `observeAll()` emits becomes the
   current value of `history`, triggering recomposition of whatever reads
   it, exactly the same observation mechanism as `mutableStateOf`, now
   fed by a database-backed stream instead of an in-memory value.

### CS Lens

`rememberCoroutineScope()` + `launch` is the "fire and forget, from a
regular event handler" coroutine pattern — contrasted directly with Lesson
22's `LaunchedEffect`, which is the "run automatically when this
composable enters the screen, or a key changes" pattern. Two different
entry points into coroutines for two different triggers: a user action
versus a composable's own lifecycle.

### SE Lens

The real payoff over Lesson 8's `mutableStateListOf`: history now survives
a full process death (app fully closed, not just backgrounded), not merely
a configuration change (Lesson 11's rotation problem) — Room persists to
an actual SQLite file on disk, the same durability guarantee `../track/`
Lesson 12/13 already established, now delivered through a coroutine/Flow
API that fits naturally into Compose's own state model instead of
requiring a manual `LiveData` observer registration/teardown.

### Connection

Lesson 24 moves `history`'s exposure from directly inside the composable
(`dao.observeAll().collectAsState(...)`) into the `ViewModel`, matching
where Lesson 11 already put `memory` — keeping all persistent app state in
one consistent place.

---

## Closing

### Connect the pieces

`CalculationEntity`/`CalculationDao` (unit 1) reuse `../track/` Lesson 13's
Room concepts directly, adding `suspend fun` for writes and `Flow` for a
live-updating read. `rememberCoroutineScope()` + `launch` (unit 2) let the
button's ordinary click handler start that `suspend` insert; `collectAsState`
feeds the resulting `Flow` back into Compose's state system, so the
history list updates live from the database exactly the way Lesson 8's
in-memory version did — just now genuinely durable.

### What breaks without this

Call `dao.insert(...)` directly inside `onButtonPressed`, without wrapping
it in `coroutineScope.launch { }`. Try to compile. Real, observable
failure: a compile error stating `insert` is a suspend function and can
only be called from a coroutine or another suspend function — the
compiler enforces Concept Unit 1's restriction directly, rather than
letting the mistake compile and fail at runtime. Restore the `launch { }`
wrapper and it compiles again.

### Exercises

- Add a "Clear History" button calling a new `@Query("DELETE FROM
  CalculationEntity") suspend fun clearAll()` DAO method, wrapped in the
  same `coroutineScope.launch { }` pattern.
- Fully close the app (swipe it away, not just background it), reopen it,
  and confirm history is still there — the concrete, hands-on proof this
  lesson's persistence claim is real.

### Definition of done

- [ ] History persists across a full app restart (verified yourself, not
      just assumed).
- [ ] New calculations appear in history immediately, via `Flow`.
- [ ] You can explain, concretely, why `dao.insert(...)` can't be called
      directly from `onButtonPressed` without `launch`.
- [ ] Commit: `git commit -m "Persist calculation history with Room, suspend functions, and Flow"`.
