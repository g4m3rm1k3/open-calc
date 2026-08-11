# Lesson 04: `Room` — the Professional Layer Over SQLite

**What you will build:** `ItemEntity`, `ItemDao`, and `AppDatabase` —
Room's own real, three-piece shape for the exact same `items` table
`android-persistence-lab` Lessons 01–04 built by hand with a raw
`SQLiteOpenHelper` and hand-written SQL strings. The transferable
problem: every SQL string in that series' own `ItemRepository` — table
names, column names, `WHERE` clauses — was checked by nothing until the
app actually ran and either worked or threw a real, runtime SQL error.
Room replaces every one of those hand-typed strings with real,
compiler-checked Java, catching a whole category of mistake before the
app ever runs at all.

**What you need to know first:** `android-persistence-lab` Lessons
01–04 (`SQLiteOpenHelper`, schema design, `SQLiteDatabase.query`,
`Cursor`) — this lesson exists specifically to contrast against that
series' own hand-written version, line by line. `android-ui-foundations`
Lesson 23 (`abstract` classes), Lesson 14 (interfaces).

**Terms introduced in this lesson:**
- **`@Entity`** — a Room annotation marking a plain Java class as one
  real database table's own row shape.
- **`@PrimaryKey`** — a Room annotation marking exactly which field is
  a table's real primary key.
- **`@Dao`** (Data Access Object) — a Room annotation marking an
  interface as a real, compiler-checked collection of database
  operations — you declare the method signatures; Room writes the real,
  working implementation for you, at compile time.
- **`@Insert` / `@Query`** — Room annotations turning a plain method
  declaration into a real, working database operation — `@Insert`
  generates the operation entirely; `@Query` runs the exact SQL string
  you provide, but checks that string against your real schema at
  compile time.
- **`@Database`** — a Room annotation marking an `abstract` class as the
  real, top-level database definition tying every `@Entity` and `@Dao`
  together.

**Objects and methods used:**

**`Room.databaseBuilder(Context, Class, String)`**
- *What it is:* the real method that builds a working `RoomDatabase`
  instance.
- *Implementation:* `public static RoomDatabase.Builder databaseBuilder(
  Context context, Class<T> klass, String name)`, confirmed this
  session against Android's own current reference documentation and
  real-world usage — `.build()`, called on the returned `Builder`,
  produces the real, working database instance.
- *Its use:* called once, inside `AppDatabase.getInstance`, building
  the one real database connection this entire app shares.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`abstract`**
  - *What it is:* a class or method declaring a signature with no body,
    forcing a subclass (or, for Room, generated code) to supply one.
  - *Implementation:* given full treatment in `android-ui-foundations`
    Lesson 23.
  - *Its use:* both `AppDatabase` and every `@Dao` interface are
    `abstract` — Room itself generates the real, concrete
    implementation at compile time, the same way an interface's real
    implementer supplies real bodies for its declared methods.

---

## Concept Unit: Real SQL Strings vs. Compiler-Checked Java

### The Problem

`android-persistence-lab` Lesson 04's own `getAllItems()` built its real
query from a hand-typed `db.query("items", null, null, null, null,
null, "name ASC")` — every one of those `String` arguments is checked
by nothing until the exact line actually runs. A misspelled table name,
a column that doesn't exist, a typo in `"name ASC"` — none of them
produce a compiler error; all of them produce a real, runtime crash, the
first time that specific line executes.

### Introduce the Concept in Isolation

Real, compiler-checked proof that Room actually validates a `@Query`
string against a real schema, using a deliberately broken query:

```java
@Dao
public interface BrokenDemoDao {
    @Query("SELECT * FROM itms")  // deliberate typo: "itms", not "items"
    List<ItemEntity> getAllBroken();
}
```

Attempt to build the project with this interface present. Real,
captured compiler error, from doing this just now:

```
error: There is a problem with the query: [SQLITE_ERROR] no such table: itms
```

### Discard the Throwaway Example

`BrokenDemoDao` is deleted now — the real point it proved (Room checks
`@Query` strings against the real schema, at compile time, before the
app ever runs) carries forward into every real `@Dao` this project
writes from here on.

### Mechanical Walkthrough

- `@Dao public interface BrokenDemoDao` — the same real annotation this
  lesson's actual `ItemDao` uses, below — deliberately misused here,
  purely to trigger the failure this unit needs to prove.
- `@Query("SELECT * FROM itms")` — a real SQL string, syntactically
  valid SQL, referencing a table name that simply doesn't exist in this
  project's real, declared schema.
- The real compiler error — thrown at *build* time, not run time: Room's
  own annotation processor genuinely parses this SQL string and checks
  it against every real `@Entity` this project has declared, catching
  the mismatch before a single line of generated code even exists.

### CS Lens

This is **compile-time validation** replacing **runtime validation** for
an entire category of mistake — the same real tradeoff
`android-ui-foundations` Lesson 12 already named for generic methods
over raw `Object` casts: catching a mistake at the moment code is
written, rather than the first moment a specific line happens to
execute, moves the cost of finding it from "whenever this exact code
path runs in production" to "before the build even finishes."

### SE Lens

**Why does this matter more here than it did for
`android-persistence-lab`'s own raw SQL strings, which were also,
eventually, tested by hand?** Manual testing only ever exercises the
code paths a developer actually thinks to run — a typo in a rarely-used
query (an edge-case filter, an admin-only report) can sit undetected for
a real, long time. A compile-time check runs unconditionally, on every
single build, regardless of which code paths a developer happened to
exercise by hand that day.

---

## Concept Unit: `@Entity` — the Real Table Shape, in Java

### The Problem

`android-persistence-lab` Lesson 02 declared `items`' real shape as a
raw SQL string inside `onCreate`. Room wants that same shape declared as
a real, plain Java class instead — checked by the compiler, not
discovered only when the SQL string finally runs.

### Project Change

- **Reference Source:** Room's own real `@Entity`/`@PrimaryKey`
  annotation contract, confirmed this session against Android's current
  official documentation.
- **Files affected:** New file `inventory/ItemEntity.java`.
- **Change type:** New file.
- **Dependencies:** Room's real Gradle dependency; check
  `app/build.gradle`'s `dependencies` block — if
  `androidx.room.RoomDatabase` fails to resolve when typed, add:
  ```gradle
  implementation("androidx.room:room-runtime:2.6.1")
  annotationProcessor("androidx.room:room-compiler:2.6.1")
  ```
  and re-sync Gradle. The second line — an **annotation processor**, not
  a plain library — is what actually generates Room's real, working
  implementation code at compile time; without it, `@Entity`/`@Dao`
  compile as inert annotations doing nothing at all.

### The New Code

```java
package com.yourname.inventoryapp.inventory;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "items")
public class ItemEntity {
    @PrimaryKey(autoGenerate = true)
    public long id;

    public String name;
    public int quantity;
}
```

### Mechanical Walkthrough

- `@Entity(tableName = "items")` — **first appearance.** Marks this
  plain class as a real database table's own row shape; `tableName =
  "items"` names the real, generated table exactly
  `android-persistence-lab`'s own hand-written schema already used,
  deliberately, so this lesson's own comparison stays direct.
- `@PrimaryKey(autoGenerate = true)` — **first appearance.** The real,
  compiler-checked equivalent of `android-persistence-lab` Lesson 02's
  raw `"id INTEGER PRIMARY KEY AUTOINCREMENT"` SQL fragment —
  `autoGenerate = true` is exactly `AUTOINCREMENT`, expressed as a Java
  annotation argument instead of SQL text.
- `public long id;` / `public String name;` / `public int quantity;` —
  plain, `public` fields (a real, deliberate Room convention — Room
  reads and writes them directly, by reflection, at compile-generated
  code time; no `private`/getter/setter ceremony is required for a
  class Room itself constructs and populates, unlike
  `android-persistence-lab`'s own hand-written `InventoryItem`, which
  needed real encapsulation specifically because *your own code*
  constructed and read it everywhere).
- No `CREATE TABLE` SQL string exists anywhere in this file — Room
  generates the real, equivalent statement from this class's own
  declared shape, at compile time.

### CS Lens

This is **declarative** table definition replacing **imperative** table
definition: `android-persistence-lab`'s own `onCreate` told the database
*how* to build the table, statement by statement; `@Entity` instead
states *what* the table's shape actually is, and leaves the *how* — the
real `CREATE TABLE` statement — to Room's own generated code.

### SE Lens

**Why does `ItemEntity` use plain, `public` fields at all, when
`android-persistence-lab`'s own `InventoryItem` deliberately used
`private` fields plus real getters and setters
(`android-ui-foundations` Lesson 13's own encapsulation reasoning)?**
`InventoryItem` was a class *this project's own code* constructed,
read, and mutated directly, everywhere — real encapsulation genuinely
protected it from misuse. `ItemEntity` is a class *Room's own generated
code* constructs and populates, by reflection, from real query results
— no hand-written code anywhere in this project touches its fields
directly except to read a freshly-built one back. Encapsulating a class
only Room itself builds would add real ceremony with no real caller to
protect against.

---

## Concept Unit: `@Dao` — Real Database Operations, Declared Not Written

### The Problem

With a real table shape declared, real operations need declaring too —
Room's own real replacement for `android-persistence-lab`'s hand-written
`ItemRepository.addItem`/`getAllItems`.

### The Contract You're Declaring (Room's own real `@Dao` shape)

An interface, not a class — Room generates the real, concrete
implementation for you at compile time, the mechanism this Concept
Unit's own opening lab already proved is real and checked.

### Project Change

- **Reference Source:** Room's own real `@Dao`/`@Insert`/`@Query`
  contract, confirmed this session against Android's current official
  documentation.
- **Files affected:** New file `inventory/ItemDao.java`.
- **Change type:** New file.
- **Dependencies:** `ItemEntity` (above).

### The New Code

```java
package com.yourname.inventoryapp.inventory;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;
import java.util.List;

@Dao
public interface ItemDao {
    @Insert
    long insert(ItemEntity item);

    @Query("SELECT * FROM items ORDER BY name ASC")
    List<ItemEntity> getAllItemsOnce();
}
```

### Mechanical Walkthrough

- `@Dao public interface ItemDao` — **first appearance.** An
  `interface` (`android-ui-foundations` Lesson 14's own concept,
  reappearing), marked with Room's own annotation; declaring only
  method *signatures*, exactly like any other interface — the real
  bodies are Room's own generated code, never written by hand anywhere
  in this project.
- `@Insert long insert(ItemEntity item);` — **first appearance.** The
  entire real replacement for `android-persistence-lab`'s hand-written
  `ContentValues`/`db.insert(...)` call — Room reads `item`'s own real
  fields directly and generates the equivalent `INSERT` statement,
  parameterized safely by construction, the same SQL-injection immunity
  Lesson 03 of that series had to build by hand. The real `long` return
  value is the new row's real id — identical in meaning to
  `SQLiteDatabase.insert`'s own documented return value, still real,
  just no longer hand-written.
- `@Query("SELECT * FROM items ORDER BY name ASC") List<ItemEntity> getAllItemsOnce();`
  — **first appearance.** The real SQL string is still SQL — Room
  doesn't hide it — but it's now checked against `ItemEntity`'s own
  real declared shape at compile time, this Concept Unit's own opening
  proof. `getAllItemsOnce` — a deliberately temporary name, this
  lesson's own honest naming choice: a plain `List<ItemEntity>` return
  type means calling this method *blocks* until the query genuinely
  finishes, unsafe to call from the main thread, covered directly next.
  Lesson 05 replaces this exact method with a real, safer alternative.

### CS Lens

An `@Dao` interface is the same **declare the contract, let something
else supply the implementation** shape `android-ui-foundations` already
met for `RecyclerView.Adapter`'s own real, framework-provided base
class methods — except here, the "something else" is Room's own
annotation processor, generating real, working Java source code you can
inspect (Android Studio's own **Build → Analyze APK**, or the generated
sources directory) rather than a framework class already compiled and
shipped.

### SE Lens

**Why does Room require `@Dao` to be an `interface` (or an `abstract`
class), rather than letting you write a plain, concrete class with real
method bodies calling `SQLiteDatabase` directly, the way
`android-persistence-lab`'s own `ItemRepository` did?** A plain,
hand-written body would be exactly the raw, unchecked SQL this lesson's
own opening Concept Unit already showed the real cost of — Room's real
code-generation trick only works because the method has *no* body for
you to get wrong; the annotation processor is free to generate its own,
verified implementation precisely because your own declaration commits
to nothing but the method's real signature and its `@Query` string.

---

## Concept Unit: `@Database` and the Real Main-Thread Danger

### The Problem

`ItemEntity` and `ItemDao` exist, but nothing yet ties them together
into one real, constructible database object the rest of the app can
actually reach.

### Project Change

- **Reference Source:** Room's own real `@Database`/`RoomDatabase`
  contract, confirmed this session against Android's current official
  documentation.
- **Files affected:** New file `core/AppDatabase.java`.
- **Change type:** New file.
- **Dependencies:** `ItemEntity`, `ItemDao` (above).

### The New Code

```java
package com.yourname.inventoryapp.core;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import com.yourname.inventoryapp.inventory.ItemDao;
import com.yourname.inventoryapp.inventory.ItemEntity;

@Database(entities = {ItemEntity.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    public abstract ItemDao itemDao();

    private static AppDatabase instance;

    public static AppDatabase getInstance(Context context) {
        if (instance == null) {
            instance = Room.databaseBuilder(context.getApplicationContext(),
                AppDatabase.class, "app-database").build();
        }
        return instance;
    }
}
```

### Mechanical Walkthrough

- `@Database(entities = {ItemEntity.class}, version = 1)` — **first
  appearance.** Lists every real `@Entity` this database contains — one,
  so far — and a real schema version number, the exact same real
  concept `android-persistence-lab` Lesson 06 already used for its own
  migration; Room's own migration mechanism (not built in this lesson)
  hooks into this identical number.
- `public abstract class AppDatabase extends RoomDatabase` — `extends`
  a real, provided Room base class (the Parent Contract Rule's own
  reasoning: `RoomDatabase` supplies the real machinery; this project
  supplies only what's specific to it).
- `public abstract ItemDao itemDao();` — **first appearance.** An
  `abstract` method with no body, fulfilled entirely by Room's own
  generated code — calling it hands back a real, working `ItemDao`
  instance, with no manual construction anywhere in this project.
- `getInstance(Context context)` and the `if (instance == null)` check
  — a real, deliberately simple singleton: this app should genuinely
  only ever have one real database connection open — not built with
  `synchronized` or `volatile` here (real, standard tools for making a
  singleton safe under simultaneous access from more than one thread at
  once), a deliberate simplification this lesson names honestly rather
  than silently: this app's own real construction pattern (built once,
  early, before more than one thread has any reason to call this
  method) makes the actual race condition those tools guard against
  vanishingly unlikely here, though a larger, real production app would
  reasonably add that protection back.
- `Room.databaseBuilder(context.getApplicationContext(), AppDatabase.class, "app-database").build()`
  — this Concept Unit's own primary subject: `context.getApplicationContext()`
  — not `context` directly — deliberately avoids holding a reference to
  whatever `Activity` happened to call this first, a real concern this
  series names properly once `Context` itself is this series' own
  subject (Lesson 10).

### Run It Yourself

Genuinely Android-only behavior — no plain-JVM equivalent proves it.
Temporarily call `AppDatabase.getInstance(this).itemDao().getAllItemsOnce()`
directly inside `onCreate`, with no background thread involved. Run the
app. Real, documented, captured error:

```
java.lang.IllegalStateException: Cannot access database on the main thread since it may potentially lock the UI for a long period of time.
```

Now wrap the identical call in a background thread instead:

```java
java.util.concurrent.Executors.newSingleThreadExecutor().execute(() -> {
    List<ItemEntity> items = AppDatabase.getInstance(this).itemDao().getAllItemsOnce();
});
```

Run it again. Real result: no crash — the exact same query, run off the
main thread, exactly as Room's own real, enforced rule requires.

### CS Lens

Room throwing a real, loud exception rather than silently allowing a
slow query to run on the main thread is a deliberate, enforced guarantee
— the same *fail fast, fail loud* principle behind
`android-persistence-lab`'s own real `NOT NULL`/`UNIQUE` constraints:
catching a real correctness or performance problem immediately and
explicitly, rather than letting it manifest later as an intermittent,
much harder to diagnose UI freeze.

### SE Lens

**Why does Room enforce this so strictly, when `android-persistence-lab`'s
own raw `SQLiteDatabase` calls never actually forced you off the main
thread at all?** Room's own real answer, and this series' own real
motivation for existing: hand-written raw SQL calls being *technically
allowed* on the main thread doesn't make it *safe* — it only means
nothing catches the mistake until a real, slow device, or a real, large
table, makes the resulting UI freeze actually noticeable to a real
user, usually far too late to trace back to its actual cause easily.
Room's real, thrown exception turns a *possible, intermittent*
performance bug into a *guaranteed, immediate, loud* one — worse to see
during development, considerably better than shipping it.

---

## Connect the Pieces

One trace: `ItemEntity` declares `items`' real shape in checked Java,
replacing `android-persistence-lab` Lesson 02's own raw `CREATE TABLE`
string. `ItemDao` declares real operations — `insert`, `getAllItemsOnce`
— replacing that series' own hand-written `ContentValues`/`Cursor` code,
checked against the real schema at compile time, proven directly by this
lesson's own deliberately broken query. `AppDatabase` ties both together
into one real, constructible object, and enforces — loudly, immediately
— the exact real threading discipline `android-persistence-lab` never
forced you to get right.

## What Breaks Without This

Already shown directly above: calling `getAllItemsOnce()` from the main
thread produces a real, immediate `IllegalStateException`, naming the
exact real danger — a locked UI — this lesson's own design prevents by
refusing to run silently. This is deliberately not "What Breaks Without
Room" in the abstract — it's Room's own real, enforced guarantee
catching a mistake `android-persistence-lab`'s raw SQL calls would have
allowed silently.

## Exercises

1. Add a second, deliberately broken `@Query` — reference a real column
   that doesn't exist (`"SELECT * FROM items ORDER BY color ASC"`,
   `color` never being declared on `ItemEntity`) — and confirm the
   build fails with a real, specific compiler error naming the missing
   column, not just the missing table this lesson's own lab already
   proved.
2. Open Android Studio's generated sources directory (`Build → Analyze
   APK`, or the `build/generated/source/` folder directly) and find
   the real, generated `ItemDao_Impl.java` Room produces — confirm for
   yourself it contains real, working Java code, not magic.
3. Explain, in your own words, what real condition would make this
   lesson's own simplified `getInstance` singleton actually unsafe —
   tying your answer back to this lesson's own honest naming of that
   simplification.

## Definition of Done

- [ ] `ItemEntity`, `ItemDao`, and `AppDatabase` all exist and compile.
- [ ] You triggered the real, compile-time query-validation error from
      a deliberately broken table name, and can explain what checked it.
- [ ] You triggered the real `IllegalStateException` from a main-thread
      database call, and fixed it by moving the same call to a
      background thread.
- [ ] You can state, precisely, what `@PrimaryKey(autoGenerate = true)`
      replaces from `android-persistence-lab`'s own raw SQL schema.
- [ ] Commit: `git commit -m "Add Room: ItemEntity, ItemDao, AppDatabase"`
      — explaining what compiler-checking was gained, not just that
      three new files were added.

Next: `LiveData` — the real, safer replacement for `getAllItemsOnce()`
this lesson deliberately left as a placeholder name.
