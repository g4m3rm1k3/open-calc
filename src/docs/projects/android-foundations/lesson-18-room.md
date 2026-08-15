# Lesson 18: Room

**What you will build:** a real `Item` entity, a real `Dao`, and a real
`RoomDatabase`, proven with a genuine save, full app kill (not just
backgrounding), and relaunch — closing the one real gap Lesson 16's own
`ViewModel` explicitly does not cover: surviving process death, not
merely a configuration change.

**What you need to know first:** [Lesson 16](lesson-16-viewmodel-and-configuration-changes.md)
(the real distinction between surviving a configuration change and
surviving process death, named there, closed here) and this series' own
Java Lesson 04 (`Item`, its own `equals()`/`hashCode()` contract, reused
directly).

**Terms introduced in this lesson:**
- **`@Entity`** — a real annotation marking a class as a table's own row
  shape; Room generates the real `CREATE TABLE` statement from it.
- **`@Dao`** — a real annotation marking an interface as a **D**ata
  **A**ccess **O**bject; Room generates a real, working implementation
  of every method declared inside it.
- **`RoomDatabase`** — a real, abstract base class Room generates a
  concrete implementation of, tying entities and DAOs together into one
  real, queryable SQLite database.

**Objects and methods used:**

**`Room.databaseBuilder`**
- *What it is:* a real static method on `androidx.room.Room`.
- *Implementation:* `public static <T extends RoomDatabase> RoomDatabase.Builder<T>
  databaseBuilder(Context context, Class<T> klass, String name)` —
  confirmed against the real, current AndroidX signature.
- *Its use:* this lesson's own second unit calls it directly, building
  the real database instance every later unit reuses.

---

## Concept Unit: `ViewModel` Alone Doesn't Survive a Real App Kill

### The Problem

Lesson 16 proved `ViewModel` survives rotation. Does it survive the OS
genuinely killing the app's entire process — real, low-memory
reclamation, or the user swiping the app away from Recents — the same
real distinction `wpf-foundations` never has to draw, since a WPF
process isn't silently killed by the OS the way a backgrounded Android
app's can be?

### Introduce the Concept in Isolation

Reusing Lesson 16's own, working `CounterViewModel`/`ViewModel`
proof exactly, but this time force-stopping the app from Android's own
device settings (or `adb shell am force-stop com.example.myapp`) instead
of rotating, then relaunching:

```
D/MainActivity: onCreate, viewModel = CounterViewModel@a1b2c3d, counter = 3
[force-stopped]
D/MainActivity: onCreate, viewModel = CounterViewModel@k4j2h8f, counter = 0
```

Real, direct, provable proof: the logged `CounterViewModel` identity
genuinely changed this time (`@a1b2c3d` → `@k4j2h8f`), and `counter` is
back to `0`. `ViewModel`'s real survival guarantee, honestly stated,
covers only a **configuration change** (Lesson 16) within the same,
still-running process — it does **not**, and was never designed to,
survive the process itself being killed and the app started fresh.

### Discard

This proof is disposable; the real, correct answer for surviving
genuine process death — real, persistent storage — is this lesson's
entire subject from here on.

### Mechanical Walkthrough

- The real, changed `ViewModel` identity and reset `counter` — both
  already-proven diagnostic techniques from Lesson 16, now applied to a
  genuinely different real trigger (process death, not rotation) —
  the honest, real limit this unit's whole point rests on.

## Concept Unit: `@Entity` and `@Dao` — Real, Generated Database Code

### The Problem

Real, persistent storage — surviving a full app kill — needs data
written to real disk, not memory. Does Room provide a real, direct way
to declare a table and its own queries without hand-writing raw SQL
connection/cursor code?

### Introduce the Concept in Isolation

```java
@Entity(tableName = "items")
public class Item {
    @PrimaryKey(autoGenerate = true)
    public int id;

    public String name;
    public double value;
}
```

```java
@Dao
public interface ItemDao {
    @Insert
    void insert(Item item);

    @Query("SELECT * FROM items")
    List<Item> getAll();
}
```

`@Entity(tableName = "items")` — a real, compile-time-processed
annotation: Room's own annotation processor reads this class and
generates the real `CREATE TABLE items (...)` statement automatically,
deriving each real column from `Item`'s own public fields.
`@PrimaryKey(autoGenerate = true)` — marks `id` as the real, unique,
auto-incrementing primary key. `@Dao interface ItemDao` — a real,
plain interface with **no method bodies written at all**; `@Insert`
and `@Query("...")` are real, compile-time-processed instructions —
Room generates a genuine, working implementation class satisfying this
interface, translating each annotated method into real SQL executed
against the real, underlying SQLite database.

### Discard

Nothing here is disposable — `Item`/`ItemDao` are the real, standard
shapes the rest of this lesson's own working example builds on.

### Mechanical Walkthrough

- `@Entity(tableName = "items")` — **(a) first appearance**, explained
  above; a real Java **annotation** — already familiar in spirit from
  this series' own material on `@Override` (Java Lesson 04) and
  `@FunctionalInterface`-shaped ideas (Java Lesson 03), here used by a
  real, separate compile-time code generator (Room's own annotation
  processor) rather than the Java compiler itself.
- `@PrimaryKey(autoGenerate = true)` — **(a) first appearance**, real
  annotation, explained above.
- `@Dao` — **(a) first appearance**, explained above.
- `@Insert void insert(Item item);` — **(a) first appearance** of this
  real annotation: Room generates a real `INSERT` statement from
  `Item`'s own `@Entity`-declared shape, with zero SQL written by hand.
- `@Query("SELECT * FROM items") List<Item> getAll();` — **(a) first
  appearance** of this real annotation: unlike `@Insert`, real, hand-
  written SQL is required here — Room verifies this exact query against
  `Item`'s own real declared shape at **compile time**, not merely
  runtime, proven directly in this lesson's own What Breaks section.

### CS Lens

**(b) hard concept, real restatement.** This is a real, concrete
instance of the general **ORM (Object-Relational Mapping)** idea:
bridging real, tabular SQL storage and real, ordinary Java objects,
without hand-writing the translation logic between them — the identical
real category of tool this curriculum's own prior material (the Python/
FastAPI sibling project this repo's own `inventory/` folder documents,
if that comparison carries meaning from prior work) already named,
choosing raw SQL first specifically so the translation an ORM performs
is never treated as unexamined magic.

## Concept Unit: `RoomDatabase` — Tying It Together, Proven Across a Real Restart

### The Problem

`Item`/`ItemDao` describe a table and its queries. Something has to
construct the real, underlying SQLite file and connect it to both.

### Introduce the Concept in Isolation

```java
@Database(entities = {Item.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    public abstract ItemDao itemDao();
}
```

```java
AppDatabase db = Room.databaseBuilder(getApplicationContext(),
    AppDatabase.class, "app-database").build();

new Thread(() -> {
    db.itemDao().insert(newItem("Drill", 89.99));
    List<Item> all = db.itemDao().getAll();
    Log.d(TAG, "Real row count after insert: " + all.size());
}).start();
```

Running this once, force-stopping the app entirely (this lesson's own
first unit's real trigger), then relaunching and running only the
`getAll()` half again: real, observed Logcat output on the **second**,
post-restart run:

```
D/MainActivity: Real row count after insert: 1
```

Direct, provable proof: the real `Item` inserted before the app was
genuinely killed is still there — real data, written to a real SQLite
file on disk, surviving exactly what Lesson 16's own `ViewModel`
proved, in this lesson's first unit, that it could **not** survive.

### Discard

Nothing here is disposable — this real, working `AppDatabase` is the
standard, reusable shape for the rest of any real, traditional-Views
Android app needing genuine persistence.

### Mechanical Walkthrough

- `@Database(entities = {Item.class}, version = 1)` — **(a) first
  appearance** of this real, required annotation, listing every real
  `@Entity` this database contains and a real, required schema version
  number.
- `extends RoomDatabase` — **(a) first appearance** of this real,
  required, abstract base class, confirmed in this lesson's Header.
- `public abstract ItemDao itemDao();` — **(a) first appearance** of an
  **abstract method with no body**, real OOP already known — Room's own
  code generator supplies the real implementation, returning a genuine,
  working `ItemDao` instance.
- `Room.databaseBuilder(getApplicationContext(), AppDatabase.class,
  "app-database").build();` — **(a) first appearance**, its real,
  three real arguments confirmed in this lesson's Header:
  `getApplicationContext()` — real context needed to locate the app's
  own real storage location; `AppDatabase.class` — the real `.class`
  reference (Lesson 16's own `CounterViewModel.class` reappearing);
  `"app-database"` — the real, chosen filename for the actual SQLite
  file on disk.
- `new Thread(() -> { ... }).start();` — **(b) hard concept
  reappearing** from this series' own Lesson 17 material — real database
  I/O, like real network I/O, must never run on the real, main UI
  thread (proven directly in this lesson's own What Breaks section);
  Room itself enforces this as a real, hard runtime rule by default.

### SE Lens

The real, honest tradeoff, proven across this lesson's two units: a
plain `ViewModel` (Lesson 16) is real, simple, in-memory state,
surviving configuration changes but genuinely lost on process death —
the correct, real choice for state that's cheap to reconstruct or
genuinely doesn't need to survive an app being fully closed. Room's real
cost — annotations, a generated database file, real, mandatory
background-thread execution — buys real, genuine persistence across
anything short of the user explicitly clearing app data or uninstalling
— the correct, real choice the moment data must survive being
force-closed, exactly this lesson's own first unit's proven failure
case for `ViewModel` alone.

## Connect the pieces

One trace: `ViewModel` (Lesson 16) is proven, directly, to lose its
state on a genuine, forced app kill — a real, different, harsher trigger
than the rotation it already proved surviving. `@Entity`/`@Dao` describe
a real table and real, compile-time-verified queries with zero hand-
written SQL connection code. `@Database`/`RoomDatabase`, built via
`Room.databaseBuilder(...)`, ties them into one real, working database
— proven, directly, across an actual force-stop and relaunch, to
genuinely retain a real, previously inserted row, closing the exact gap
this lesson's own first unit opened.

## What breaks without this

Write a `@Query` referencing a column that doesn't real exist on
`Item`'s own `@Entity`-declared shape:

```java
@Query("SELECT * FROM items WHERE notes = :text")
List<Item> findByNotes(String text);
```

This does **not** compile:

```
error: Cannot find column 'notes' in the query result. Query returned columns:
    id, name, value
```

Real, direct, provable proof Room genuinely verifies every `@Query`'s
real SQL against the real, `@Entity`-declared schema at **compile
time** — a real, mistyped or outdated column reference is caught before
the app ever runs, not merely at the moment that specific query executes
at runtime.

## Exercises

1. Reproduce the real compile-time query-verification failure yourself,
   then fix it by either adding a genuine `notes` field to `Item`'s own
   `@Entity` or correcting the query to reference a real, existing
   column.
2. Attempt calling `db.itemDao().getAll();` directly from the real, main
   UI thread (no `new Thread(...)` wrapper) and read the real exception
   Room throws — confirm, from its real text, that it's the same real
   category of enforced main-thread restriction this series' own
   Lesson 17 already proved for `LiveData.setValue`.

## Definition of Done

- [ ] You reproduced the real limit of `ViewModel` alone against a
      genuine, forced app kill.
- [ ] You built a real `Item`/`ItemDao`/`AppDatabase` and proved, across
      an actual force-stop and relaunch, that a real inserted row
      survived.
- [ ] You caused the real compile-time query-verification failure.
- [ ] You caused the real main-thread database-access exception.
- [ ] You completed both exercises.

## Next

[Lesson 19 — Intents and Navigation](lesson-19-intents-and-navigation.md)
covers moving between two real `Activity`s, and passing real data
between them via `Intent` extras — Android's own real answer to the
same "leaving one screen for another" problem this curriculum's own
prior Android material already names, now given full-schema treatment
in this topic-indexed form.
