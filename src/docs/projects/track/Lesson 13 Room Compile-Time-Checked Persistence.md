# Lesson 13: Room — Compile-Time-Checked Persistence

**What you will build:** The inventory list stops being a hardcoded
`ArrayList` built fresh every launch (Lesson 7) and becomes a real,
durable SQLite database (Lesson 12) — accessed entirely through typed
Java interfaces instead of raw SQL strings. The transferable problem:
Lesson 12 proved raw SQLite works but is a minefield of stringly-typed
risk — typo'd column names, mismatched `Cursor` reads, no compiler in
the loop anywhere. Room is Android's official answer: you still get
real SQLite underneath (nothing about the database engine changes),
but you describe your schema and queries as annotated Java, and a
compile-time code generator — the same category of tool as the `R`
class from Lesson 2 — writes the actual raw-SQL-calling code for you,
checked against your schema at build time instead of failing at
runtime.

**What you need to know first:** Lesson 7 (`Item`, its fields,
`Parcelable`), Lesson 12 (tables, columns, primary keys, and
specifically *why* raw SQL's rough edges are worth avoiding — this
lesson is the payoff of that discomfort), Lesson 10
(`InventoryActivity`'s `items`/`adapter` fields and the Add Item result
flow, both modified here).

---

## Concept Unit: `@Entity` — `Item` Becomes a Table Definition

### The Problem

Lesson 12 hand-wrote a `CREATE TABLE` string. Room's approach: annotate
the *class you already have* and let it generate the equivalent SQL
itself, keeping the table definition and the Java type it represents
permanently in sync — impossible to let them drift apart the way a
hand-written string easily could.

### Commands Needed

Open `app/build.gradle` (module-level, same file Lesson 6 edited) and
add two lines inside `dependencies { }`:

```gradle
implementation 'androidx.room:room-runtime:2.6.1'
annotationProcessor 'androidx.room:room-compiler:2.6.1'
```

Click **Sync Now**, same as Lesson 6.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Item.java`.
- **Change type:** Modify — add annotations, a primary key field, and
  reconcile with the existing `Parcelable` and validating constructors
  from Lessons 7–8.

### The New Code

```java
@Entity(tableName = "items")
public class Item implements android.os.Parcelable {
    @PrimaryKey(autoGenerate = true)
    private long id;

    private final String name;
    private int quantity;
    private final String location;

    public Item(long id, String name, int quantity, String location) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.location = location;
    }

    @Ignore
    public Item(String name, int quantity, String location) {
        this(0, name, quantity, location);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }
}
```

### The Updated Project

```java
package com.yourname.pocketinventory;

import androidx.room.Entity;
import androidx.room.Ignore;
import androidx.room.PrimaryKey;

@Entity(tableName = "items")                                              // ← new
public class Item implements android.os.Parcelable {
    @PrimaryKey(autoGenerate = true)                                      // ← new
    private long id;                                                       // ← new

    private final String name;
    private int quantity;
    private final String location;

    public Item(long id, String name, int quantity, String location) {    // ← changed (was 3 params)
        this.id = id;                                                      // ← new
        this.name = name;
        this.quantity = quantity;
        this.location = location;
    }

    @Ignore                                                                // ← new
    public Item(String name, int quantity, String location) {              // ← new (kept, for un-inserted items)
        this(0, name, quantity, location);                                 // ← new
    }                                                                       // ← new

    public long getId() {                                                  // ← new
        return id;                                                         // ← new
    }                                                                       // ← new

    public void setId(long id) {                                          // ← new
        this.id = id;                                                      // ← new
    }                                                                       // ← new

    public String getName() {
        return name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getLocation() {
        return location;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof Item)) return false;
        Item that = (Item) other;
        return quantity == that.quantity
                && name.equals(that.name)
                && location.equals(that.location);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(name, quantity, location);
    }

    @Ignore                                                                // ← new
    protected Item(android.os.Parcel in) {
        id = in.readLong();                                               // ← new
        name = in.readString();
        quantity = in.readInt();
        location = in.readString();
    }

    @Override
    public void writeToParcel(android.os.Parcel dest, int flags) {
        dest.writeLong(id);                                                // ← new
        dest.writeString(name);
        dest.writeInt(quantity);
        dest.writeString(location);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final android.os.Parcelable.Creator<Item> CREATOR =
            new android.os.Parcelable.Creator<Item>() {
        @Override
        public Item createFromParcel(android.os.Parcel in) {
            return new Item(in);
        }

        @Override
        public Item[] newArray(int size) {
            return new Item[size];
        }
    };
}
```

`Item` now carries a fourth field, `id`, that every existing collaborator
(`InventoryAdapter`, `ItemDetailActivity`, `Parcelable`'s read/write
pair) either ignores or passes through unchanged — nothing about the
Lesson 6–11 code that already treats `Item` as a data-holder needs to
change, because `id` is purely additive.

### Mechanical Walkthrough
- `@Entity(tableName = "items")` — **first appearance.** Declares this
  class as a Room-managed table; `tableName` names the actual SQL
  table Room generates (`CREATE TABLE items (...)`, equivalent to
  Lesson 12's hand-written version, generated instead of typed).
- `@PrimaryKey(autoGenerate = true)` on `private long id;` — **first
  appearance.** The direct Room equivalent of Lesson 12's
- `INTEGER PRIMARY KEY AUTOINCREMENT` — `autoGenerate = true` means
  Room/SQLite assigns this value on insert; you never set it yourself
  ahead of time. `long` (not `int`) is Room's conventional type for
  auto-generated keys.
- `public Item(long id, String name, int quantity, String location)` —
  **reappearing** (constructor, Lesson 6/7), now Room's designated
  **primary constructor**: by default, Room picks the one constructor
  whose parameter names match every entity field, to know how to
  rebuild an `Item` from a query result row.
- `@Ignore` on the second constructor — **first appearance.** Tells
  Room "don't consider this constructor for entity construction" —
  necessary because Room requires exactly one usable constructor
  matching all fields; without `@Ignore` here, Room would find two
  candidates and fail to build.
- `this(0, name, quantity, location);` — **first appearance of
  constructor chaining.** `this(...)` inside a constructor calls
  *another* constructor of the same class instead of duplicating its
  body — this convenience constructor exists purely so the rest of the
  project (`new Item(name, quantity, location)` calls from Lesson 7–11)
  keeps compiling unchanged, defaulting `id` to `0` for an item that
  hasn't been inserted yet.
- `getId()` / `setId(long id)` — reappearing (getter/setter pattern,
  Lesson 7), applied to the new field; `setId` is needed because,
  unlike `name`/`location`, `id` genuinely does need to be set *after*
  construction — the moment the database assigns a real value on
  insert, covered later this lesson.
- `@Ignore` on the `Item(Parcel in)` constructor — reappearing use of
  the same annotation, same reason: Room must not consider this
  constructor either.
- `in.readLong()` / `dest.writeLong(id)` — reappearing (`Parcel`
  read/write, Lesson 8), new primitive type (`long` instead of
  `String`/`int`), same ordering-must-match warning from Lesson 8
  applies again here.

### CS Lens

Annotating a plain class to describe a table, then having a separate
tool generate the actual database code from those annotations, is
**declarative, metadata-driven code generation** — the same underlying
idea as the `R` class from Lesson 2 (annotations here instead of
resource-folder scanning, but the same "describe intent, let a build
tool produce the mechanical implementation" shape). Also recognized in:
JPA/Hibernate `@Entity` annotations in Java's broader ecosystem,
Django's ORM model classes generating SQL migrations, and
Protocol Buffer `.proto` schemas generating serialization code across
languages.

### SE Lens

**Why does Room require exactly one unambiguous constructor instead of
just picking the "biggest" one automatically?** The alternative —
guessing — is exactly the kind of implicit, magic behavior that makes
generated code hard to trust: if Room silently chose between two
plausible constructors, a future refactor adding a third constructor
could silently change which one gets used for database reconstruction,
with no compiler warning. Requiring `@Ignore` on every constructor
Room *shouldn't* use makes the choice explicit and visible directly in
`Item.java`'s source, at the small cost of one annotation per
extra constructor.

---

## Concept Unit: `@Dao` — Declaring Queries as an Interface

### The Problem

Lesson 12 wrote `execSQL`/`rawQuery` calls by hand, scattered wherever
they were needed. Room's approach: declare every operation your app
performs against the `items` table in one place, as an interface —
Room generates the real implementation at compile time.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `app/src/main/java/.../ItemDao.java`.
- **Change type:** Create.
- **Dependencies:** `Item.java`, just annotated above.

### The New Code

```java
package com.yourname.pocketinventory;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;
import java.util.List;

@Dao
public interface ItemDao {
    @Insert
    long insert(Item item);

    @Update
    void update(Item item);

    @Delete
    void delete(Item item);

    @Query("SELECT * FROM items")
    List<Item> getAll();
}
```

### The Updated Project

This is the whole new file — a `public interface`, same syntax
category as `OnItemClickListener` from Lesson 8, but with **zero**
method bodies at all, not even a lambda-shaped one — every method here
is fully implemented by generated code you'll never hand-write or even
directly see the source of.

### Mechanical Walkthrough
- `@Dao` — **first appearance.** "Data Access Object" — marks this
  interface as one Room should generate a real implementation for.
- `interface ItemDao` — reappearing (interface syntax, Lesson 8), new
  detail: an interface with *multiple* abstract methods, unlike Lesson
- 8's single-method `OnItemClickListener` — this is exactly why nothing
  here could be written as a lambda (same reason `Parcelable.Creator`
  in Lesson 8 needed an anonymous class instead).
- `@Insert long insert(Item item);` — **first appearance.** Room
  generates the actual `INSERT` SQL from the entity's `@Entity`/`@PrimaryKey`
- annotations — no SQL string written anywhere. The `long` return value is the newly auto-generated `id` — this is *how* you find out what

  id the database assigned.
- `@Update void update(Item item);` — **first appearance.** Room
  matches the row to update by the entity's `@PrimaryKey` value already
- present on the object you pass in — this is precisely why `Item`
  needed a real, stable `id` (the Lesson 12 motivation for primary keys
  made concrete): without one, Room would have no reliable way to know
  *which* row `update` means.
- `@Delete void delete(Item item);` — **first appearance**, same
  primary-key-based row matching as `@Update`.
- `@Query("SELECT * FROM items") List<Item> getAll();` — **first
  appearance.** Unlike the other three, this one *does* contain a raw
  SQL string — Room's design specifically keeps you writing real SQL
  for queries (since query logic can be arbitrarily complex — sorting,
  filtering, joins) while generating the boilerplate `INSERT`/`UPDATE`/
  `DELETE`/`Cursor`-to-object mapping for you. Crucially, this string
  **is checked at compile time**: misspell `items` or a column name
  Room expects, and the build itself fails with a clear error, not a
  runtime crash — this is the single biggest concrete improvement over
  Lesson 12's raw approach.

### CS Lens

Separating *what data operations exist* (this interface's method
signatures) from *how they're implemented* (Room's generated code) is
the same **interface/implementation separation** already met with
`RecyclerView.Adapter`'s three overridden methods (Lesson 6) and
`OnItemClickListener` (Lesson 8) — here applied to a whole persistence
layer instead of a UI callback.

### SE Lens

**Why generate an implementation instead of Room providing one
concrete class you'd just call methods on directly** (the way
`SQLiteOpenHelper` in Lesson 12 was one concrete class you subclassed)?
An interface-plus-codegen approach means the *type* your app depends on
(`ItemDao`) has zero framework-specific implementation details baked
into it — useful directly for testing (a fake `ItemDao` implementation
can stand in during a unit test, a real concern picked up properly in
Lesson 30) in a way a concrete `SQLiteOpenHelper` subclass, tightly
bound to the real database, cannot support nearly as cleanly.

---

## Concept Unit: `@Database` — Wiring the Entity and the DAO Together

### The Problem

`Item` and `ItemDao` exist independently. Something has to declare
"this is the actual database, made of these entities, offering these
DAOs" and provide the one real, running instance the rest of the app
uses.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `app/src/main/java/.../AppDatabase.java`.
- **Change type:** Create.
- **Dependencies:** `Item.java`, `ItemDao.java`.

### The New Code

```java
package com.yourname.pocketinventory;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

@Database(entities = {Item.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    public abstract ItemDao itemDao();

    private static AppDatabase instance;

    public static AppDatabase getInstance(Context context) {
        if (instance == null) {
            instance = Room.databaseBuilder(context.getApplicationContext(),
                    AppDatabase.class, "pocket_inventory.db").build();
        }
        return instance;
    }
}
```

### The Updated Project

This is the whole new file — nothing to show it landing inside, since
it's a brand-new top-level class.

### Mechanical Walkthrough
- `@Database(entities = {Item.class}, version = 1)` — **first
  appearance.** Lists every `@Entity` class this database contains
- (just `Item` for now — a real multi-table app would list several)
  and a schema version number, the same concept as Lesson 12's
  `SQLiteOpenHelper` version argument, now driving Room's own
  migration system if the schema ever changes.
- `public abstract class AppDatabase extends RoomDatabase` — **first
  appearance of an `abstract class`.** Unlike an interface (zero
  implementation at all), an abstract class *can* have real
  implemented methods and fields (the `getInstance` logic below is
  real, hand-written Java) while still declaring some methods with no
  body, left for a subclass — here, Room's generated code — to supply.
- `public abstract ItemDao itemDao();` — **first appearance of an
- abstract method** — no body, no `@Query`-style annotation either;
  Room recognizes this pattern (an abstract method returning a `@Dao`
  interface) and generates the implementation automatically.
- `private static AppDatabase instance;` — **first appearance of a
  `static` field holding object state** (as opposed to `static` nested
  classes/interfaces seen so far, Lesson 6/8). `static` means this
  field belongs to the *class* `AppDatabase` itself, one single slot
  shared by the whole app, not per-object the way every other field in
  this project has been.
- `getInstance(Context context)` also `static` — callable as
  `AppDatabase.getInstance(...)` without ever constructing an
  `AppDatabase` object directly first.
- `if (instance == null) { instance = ...; }` — **first appearance of
  the Singleton pattern's basic shape.** Build the real database
  exactly once, the first time anyone asks; every subsequent call reuses
  the same object. **Worth flagging honestly:** this specific version
  isn't safe if two different threads call `getInstance` at the
  *exact* same moment for the first time — a real subtlety in
  concurrent code that a full treatment (`synchronized`, covered in
  Lesson 14) would close. This project's single background executor
  thread (built next) means that race can't actually occur here, so
  the simpler version is the honest, correct-for-this-project choice,
  not a corner cut silently.
- `Room.databaseBuilder(context.getApplicationContext(), AppDatabase.class, "pocket_inventory.db")`
- — **first appearance.** `context.getApplicationContext()` — **first appearance** — returns a `Context` tied to the whole app's process

  lifetime rather than one Activity's (Lesson 5's short-lived
  Activities), appropriate here since the database instance is meant to
- outlive any single screen.
- `.build()` — **first appearance** —
  finalizes the builder and returns the real, usable database object,
  same Builder-pattern shape you'll recognize from other Android APIs
  going forward.

### CS Lens

`getInstance` implementing lazy, single-shared-instance construction is
the **Singleton pattern** — exactly one instance of a class exists for
the whole application's lifetime, created only when first needed. Also
recognized in: a logging framework's single global logger instance,
a connection pool manager, and a configuration object loaded once and
reused everywhere rather than re-read from disk on every access.

---

## Concept Unit: Room Forbids Main-Thread Queries — a Necessary Detour

### The Problem

Wire this up the naive way — call `AppDatabase.getInstance(this).itemDao().getAll()`
directly inside `onCreate`, the same way every previous lesson called
things — and Room throws
`IllegalStateException: Cannot access database on the main thread`
immediately. This isn't a bug to work around quietly; it's Room
enforcing a real constraint you need at least a working answer to right
now, with the *why* saved in full for Lesson 14.

### The Concept, Briefly

Every UI update in this app so far has run on Android's single **main
thread** — the same thread that also draws every frame and responds to
every tap. A database read or write takes real, sometimes-slow time (a
disk operation), and if it ran directly on the main thread, the whole
UI would freeze for that duration — no scrolling, no button response,
nothing — for however long the query takes. Room refuses to let this
happen by default, forcing database work onto a **separate thread** —
a genuinely different unit of concurrent execution — instead.

`ExecutorService` is the tool for that, used here at the minimum depth
needed to make Room work correctly; Lesson 14 covers what a thread
actually is, what an ANR is, and why `ExecutorService` specifically was
chosen, in full.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Replace the hardcoded `items` list from Lesson 7/10
  with real Room-backed loading, insertion, and update.
- **Dependencies:** `AppDatabase`, `ItemDao`, both built above.

### The New Code

```java
private final java.util.concurrent.ExecutorService dbExecutor =
        java.util.concurrent.Executors.newSingleThreadExecutor();
private ItemDao itemDao;
```

```java
itemDao = AppDatabase.getInstance(this).itemDao();

items = new ArrayList<>();
adapter = new InventoryAdapter(items, item -> { /* unchanged from Lesson 8 */ });
recyclerView.setAdapter(adapter);

dbExecutor.execute(() -> {
    List<Item> loaded = itemDao.getAll();
    runOnUiThread(() -> {
        items.clear();
        items.addAll(loaded);
        adapter.notifyDataSetChanged();
    });
});
```

And in the `addItemLauncher` callback:

```java
if (newItem != null) {
    dbExecutor.execute(() -> {
        long id = itemDao.insert(newItem);
        newItem.setId(id);
        runOnUiThread(() -> {
            items.add(newItem);
            adapter.notifyItemInserted(items.size() - 1);
        });
    });
}
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    private List<Item> items;
    private InventoryAdapter adapter;
    private ItemDao itemDao;                                                          // ← new
    private final java.util.concurrent.ExecutorService dbExecutor =                   // ← new
            java.util.concurrent.Executors.newSingleThreadExecutor();                 // ← new

    private ActivityResultLauncher<Intent> addItemLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
            Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");
            if (newItem != null) {
                dbExecutor.execute(() -> {                                             // ← changed
                    long id = itemDao.insert(newItem);                                 // ← new
                    newItem.setId(id);                                                 // ← new
                    runOnUiThread(() -> {                                              // ← new
                        items.add(newItem);
                        adapter.notifyItemInserted(items.size() - 1);
                    });                                                                // ← new
                });                                                                     // ← new
            }
        }
    });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        itemDao = AppDatabase.getInstance(this).itemDao();                             // ← new

        items = new ArrayList<>();                                                     // ← changed (starts empty)

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(items, item -> {
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        dbExecutor.execute(() -> {                                                     // ← new
            List<Item> loaded = itemDao.getAll();                                       // ← new
            runOnUiThread(() -> {                                                       // ← new
                items.clear();                                                          // ← new
                items.addAll(loaded);                                                   // ← new
                adapter.notifyDataSetChanged();                                         // ← new
            });                                                                          // ← new
        });                                                                              // ← new

        Button settingsButton = findViewById(R.id.settingsButton);
        settingsButton.setOnClickListener(v ->
                startActivity(new Intent(InventoryActivity.this, SettingsActivity.class)));

        Button addButton = findViewById(R.id.addItemButton);
        addButton.setOnClickListener(v ->
                addItemLauncher.launch(new Intent(InventoryActivity.this, AddItemActivity.class)));
    }

    @Override
    protected void onResume() {
        super.onResume();
        SharedPreferences prefs = getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE);
        int threshold = prefs.getInt("low_stock_threshold", 5);
        adapter.setLowStockThreshold(threshold);
    }
}
```

`onCreate` now starts the list empty and asynchronously fills it from
the real database the moment loading finishes — the five hardcoded
`Item`s from Lesson 7 are gone entirely, replaced by whatever the user
has actually saved, surviving full app closure for the first time in
this project's life (Lesson 11 gave `SharedPreferences` this property
for one number; the whole inventory now has it too).

### Mechanical Walkthrough
- `ExecutorService` / `Executors.newSingleThreadExecutor()` — **first
  appearance.** `Executors` is a standard-library factory producing
  different kinds of thread pools; `newSingleThreadExecutor()` creates
  one dedicated background thread that runs submitted tasks one at a
  time, in order — enough to guarantee database operations never race
  against each other, without yet needing the fuller thread-pool
  vocabulary Lesson 14 covers.
- `dbExecutor.execute(() -> { ... })` — **first appearance.** Submits a
  lambda (reappearing syntax) to run on that background thread instead
  of the current (main) one — execution genuinely leaves the calling
  thread here, unlike every prior lambda in this project (all of which
  ran synchronously, on whatever thread called them).
- `itemDao.getAll()` — reappearing (DAO method call, this lesson),
  now actually invoked, from a safe, non-main thread.
- `runOnUiThread(() -> { ... })` — **first appearance.** The return
  trip: posts a lambda back to run on the main thread specifically —
  required because `items`, `adapter`, and every View this app touches
  are **not** safe to update from a background thread; only the main
  thread is allowed to touch the UI, a rule enforced by the framework
  and explained fully next lesson.
- `items.clear()` / `items.addAll(loaded)` — **first appearance of
- `List.clear()`/`addAll()`** — standard-library methods, already-basic
  once `List.add`/`get` (Lesson 6/7) are familiar.
- `adapter.notifyDataSetChanged()` — reappearing, Lesson 11, correct
  here because the entire list's content is being replaced at once,
  not one specific row.
- `itemDao.insert(newItem)` returning `long id` — reappearing (DAO
  method, this lesson), first real use: the actual database-assigned
  primary key comes back here.
- `newItem.setId(id)` — reappearing (setter, this lesson), keeping the
  in-memory `Item` object's `id` in sync with the row Room just created
- — without this, a later `update`/`delete` call on this same object
  (not built yet, arriving in a later lesson) would have no valid
  primary key to match against.

### Run It

Run the app. The list starts empty for a fraction of a second, then
populates — nothing yet, since the database is genuinely empty on
first run (the five Lesson 7 hardcoded items are gone). Tap "+ Add
Item," save a real item, watch it appear in the list exactly as Lesson
10 did — then fully close the app (swipe away, Lesson 11's test) and
reopen it: the item is still there, loaded fresh from `itemDao.getAll()`,
the actual, permanent fix for everything Lesson 11's `SharedPreferences`
work and Lesson 12's raw-SQL detour were both pointing toward.

### CS Lens

**This is a hard concept — synchronous versus asynchronous execution —
and it recurs constantly:** work that blocks the calling thread until
done, versus work handed off to run independently, with results
delivered back later through a separate channel. Also recognized in:
JavaScript's `async`/`await` and Promises, any GUI framework's
background-worker-plus-callback pattern, database connection pools
handling queries off a web server's request-handling thread, and
operating systems scheduling processes across CPU cores in the first
place.

---

## Connect the Pieces

Full trace: `AppDatabase.getInstance(this)` (Singleton pattern) returns
one shared Room-backed database, generated at compile time from
`Item`'s `@Entity`/`@PrimaryKey` annotations and `ItemDao`'s declared
methods → `onCreate` submits `itemDao.getAll()` to `dbExecutor`,
running Room's generated `SELECT * FROM items` query (Lesson 12's raw
SQL shape, now hidden behind a typed method call) on a background
thread → the result is posted back via `runOnUiThread` to safely
populate `items` and refresh the `RecyclerView` (Lesson 6) → adding a
new item (Lesson 9's validated form, Lesson 10's Activity Result API)
now inserts into the real database via `itemDao.insert`, captures the
real assigned `id`, and only then updates the on-screen list — every
piece of this project since Lesson 6 still works exactly as before,
now backed by data that survives the app closing entirely.

## What Breaks Without This

Temporarily call `itemDao.getAll()` directly inside `onCreate`,
*outside* `dbExecutor.execute(...)` — on the main thread. Run the app
and read the real crash: `IllegalStateException: Cannot access
database on the main thread since it may potentially lock the UI for a
long period of time.` — Room's own defensive check, firing immediately,
exactly the constraint this lesson's last unit exists to satisfy.
Restore the executor-wrapped version afterward.

## Exercises

1. Add `@Update void update(Item item);`'s real usage: from
   `ItemDetailActivity`, add a button that increments the shown item's
   quantity by one and calls `itemDao.update(item)` (via a `dbExecutor`,
   same pattern as `insert`) — confirm the change persists after
   navigating back to the list and reopening the app.
2. Temporarily remove the `@Ignore` annotation from `Item`'s three-
   argument constructor and try to build the project. Read Room's
   actual annotation-processor error message (it will complain about
   multiple eligible constructors) — a real, compile-time-caught
   mistake, in direct contrast to Lesson 12's silent runtime failures.
   Restore `@Ignore` afterward.

## Definition of Done

- [ ] `Item` is a Room `@Entity` with a real auto-generated primary key,
      and every existing collaborator (`Parcelable`, `equals`,
      `InventoryAdapter`) still compiles and works.
- [ ] `ItemDao` and `AppDatabase` exist and compile — Room generated
      real implementations with no build errors.
- [ ] The inventory list loads from and saves to a real database,
      surviving a full app close and reopen.
- [ ] You triggered the real main-thread `IllegalStateException` on
      purpose and understand why `dbExecutor`/`runOnUiThread` fix it.
- [ ] Commit: message explaining why (e.g. "Replace the hardcoded
      in-memory item list with Room-backed persistence, loading and
      inserting off the main thread since Room forbids blocking UI
      responsiveness with database work").

Lesson 14 is next: what a thread actually is, what an ANR looks like
when you don't dodge it in time, and why `ExecutorService` specifically
— not `Thread` directly, not `AsyncTask` — is the right tool here,
covered in the depth this lesson deliberately deferred.
