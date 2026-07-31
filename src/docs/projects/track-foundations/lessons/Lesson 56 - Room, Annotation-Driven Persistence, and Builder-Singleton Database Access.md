# Lesson 56: Room, Annotation-Driven Persistence, and Builder/Singleton Database Access

**What you will build:** One unit is a small, fully runnable, plain Java
lab. Five units read real Android/Room code directly.

**What you need to know first:** Lesson 01's classes, Lesson 03's
class-level state, Lesson 06's interfaces, Lesson 08's annotations,
Lesson 55's relational database model and primary keys.

**Terms introduced in this lesson:**

- **Abstract class** — a class that can declare method signatures with no
  body, leaving them for a subclass to implement, while still holding
  real, shared fields and fully-implemented methods of its own —
  something neither a plain class nor a plain interface expresses alone.
- **Room `@Entity`** — an annotation marking a Java class as the exact
  definition of a database table, so the table's columns and the class's
  fields can never drift apart.
- **Annotation-driven ORM** — an object-relational mapping approach where
  annotations on plain Java classes and methods drive code generation
  connecting those classes directly to real database tables and queries,
  without hand-written `CREATE TABLE`/SQL strings scattered through the
  app.
- **Room `@Dao`** — an interface whose methods, each annotated with a SQL
  operation, are given a real, generated implementation by Room —
  collecting every database operation the app performs against one table
  in a single, declared place.
- **Room `@Database`** — an abstract class, annotated to list every
  `@Entity` it manages, whose abstract DAO-returning methods Room
  supplies real implementations for.
- **Builder Pattern** — constructing a complex object step by step
  through a dedicated builder object, rather than through one large
  constructor taking every parameter at once.
- **Singleton Pattern** — a class deliberately designed so that exactly
  one instance of it is ever created, with every caller receiving that
  same shared instance.

---

## Concept Unit: Abstract Class

### The Problem

A database access class needs to hold real, hand-written logic (like a
singleton's own `getInstance` method) alongside methods it deliberately
leaves for something else to implement — neither a plain class (every
method must have a body) nor a plain interface (Lesson 06 — no fields, no
method bodies at all) expresses that specific mix by itself.

### Introduce the Concept in Isolation

```
mkdir lesson-56
cd lesson-56
```

Create `Main.java`:

```java
public class Main {
    abstract static class Shape {
        String label = "shape";

        abstract double area();

        String describe() {
            return label + " has area " + area();
        }
    }

    static class Square extends Shape {
        double side;
        Square(double side) { this.side = side; }

        @Override
        double area() {
            return side * side;
        }
    }

    public static void main(String[] args) {
        Shape shape = new Square(4);
        System.out.println(shape.describe());
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
shape has area 16.0
```

This is `abstract class` — **first appearance**: a class that can
declare method signatures with no body, leaving them for a subclass to
implement, while still holding real, shared fields and fully-implemented
methods of its own — something neither a plain class nor a plain
interface expresses alone. `Shape` holds a real field (`label`) and a
real, fully-implemented method (`describe()`), while `area()` has no body
at all — left entirely for `Square` to supply.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `abstract static class Shape { String label = "shape"; abstract
   double area(); String describe() { ... } }` — **(a) first
   appearance**: a real field, a fully-implemented method, and an
   unimplemented, abstract method, all in one class.
2. `class Square extends Shape { ... @Override double area() { return
   side * side; } }` — **(b) reappearing** inheritance from Lesson 05,
   supplying the one method `Shape` itself left unimplemented.
3. `shape.describe()` — calls `Shape`'s own real, inherited method, which
   itself calls `area()` — resolved, at the moment it runs, to
   `Square`'s own implementation.

### CS Lens

An abstract class sits between a plain class (fully implemented, directly
instantiable) and an interface (no implementation, no fields at all) —
useful exactly when some behavior should be shared and fixed across every
subclass, while other behavior must be left for each subclass to supply
individually.

Also recognized in: abstract classes in virtually every mainstream
object-oriented language (C#, Python's `ABC`, Kotlin's `abstract`), any
design needing shared state plus a required, subclass-supplied
implementation.

### SE Lens

The alternative — a plain interface instead of an abstract class — was
not chosen for this lesson's own upcoming `AppDatabase` because an
interface cannot hold real fields or a real, hand-written method body;
`AppDatabase` needs exactly the mix an abstract class provides: real,
hand-written logic (a shared instance) alongside a method Room itself
will supply an implementation for.

---

## Concept Unit: Room `@Entity`

### The Problem

Lesson 55's own hand-written `CREATE TABLE` SQL string and `Item`'s Java
fields (Lesson 07) are two entirely separate things a developer must keep
in sync by hand — nothing stops the table's columns and the class's
fields from silently drifting apart over time.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Room framework source:

```java
@Entity(tableName = "items")
public class Item {
    @PrimaryKey(autoGenerate = true)
    public int id;

    public String name;
    public int quantity;
}
```

This is Room `@Entity` — **first appearance**: an annotation marking a
Java class as the exact definition of a database table, so the table's
columns and the class's fields can never drift apart. This is
`annotation-driven ORM` — **first appearance**: an object-relational
mapping approach where annotations on plain Java classes and methods
drive code generation connecting those classes directly to real database
tables and queries, without hand-written `CREATE TABLE`/SQL strings
scattered through the app. `@Entity(tableName = "items")` declares this
exact class *is* the `items` table; `@PrimaryKey` (Lesson 55's own
primary key concept) marks `id` as the column guaranteeing each row's
uniqueness — Room reads these annotations (Lesson 08) at build time and
generates the real table-creation code itself.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `@Entity(tableName = "items")` — **(a) first appearance**: names the
   real database table this class defines.
2. `@PrimaryKey(autoGenerate = true)` — **(b) reappearing** primary key
   concept from Lesson 55, now expressed as a Room annotation rather than
   hand-written SQL; `autoGenerate = true` has Room assign each new row's
   `id` automatically.
3. `public String name; public int quantity;` — **(b) reappearing**
   `Item` fields from Lesson 07, now doubling as the exact column
   definitions Room generates the real table from.

### CS Lens

This is Room's whole value proposition: the table definition and the
Java type it represents can no longer drift apart the way a hand-written
`CREATE TABLE` string (Lesson 55) easily could — one annotated class *is*
the single source of truth for both.

Also recognized in: annotation-driven ORMs across virtually every
mainstream backend framework (Hibernate/JPA in Java, Entity Framework in
C#, Django's own model classes) — the same "one annotated class defines
both the code type and the database table" idea.

### SE Lens

The alternative — keeping `Item.java` and a hand-written `CREATE TABLE`
string in sync manually, as Lesson 55 did directly — was not chosen going
forward because it requires a developer to remember to update both places
identically, forever; annotation-driven ORM removes that synchronization
burden by generating the table definition directly from the one class
Room can see.

---

## Concept Unit: Room `@Dao`

### The Problem

Lesson 55's own hand-written `execSQL`/`rawQuery` calls are scattered
wherever a query happens to be needed in the app, with no single place
declaring every operation the app is allowed to perform against the
`items` table.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Room framework source:

```java
@Dao
public interface ItemDao {
    @Insert
    void insert(Item item);

    @Query("SELECT * FROM items WHERE quantity > :minQuantity")
    List<Item> getItemsAbove(int minQuantity);
}
```

This is Room `@Dao` — **first appearance**: an interface whose methods,
each annotated with a SQL operation, are given a real, generated
implementation by Room — collecting every database operation the app
performs against one table in a single, declared place. `ItemDao`
(Lesson 06's own interface contract) declares only method signatures;
Room reads `@Insert` and `@Query`'s own real SQL text at build time and
generates the actual, working implementation of both methods.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `@Dao public interface ItemDao { ... }` — **(b) reappearing** interface
   contract from Lesson 06, now processed by Room's own annotation
   processor rather than hand-implemented.
2. `@Insert void insert(Item item);` — **(a) first appearance**: Room
   generates a real implementation inserting the given `Item` as a new
   row — no SQL text needed for this common case.
3. `@Query("SELECT * FROM items WHERE quantity > :minQuantity") List<Item>
   getItemsAbove(int minQuantity);` — **(a) first appearance**: real SQL
   (Lesson 55) supplied directly in the annotation; `:minQuantity` binds
   to the method's own parameter, and Room generates the implementation
   that runs this exact query and returns real `Item` objects.

### CS Lens

`@Dao` replaces Lesson 55's own scattered, hand-written `execSQL`/
`rawQuery` calls with one declared place listing every operation the app
performs against a table — the Data Access Object pattern generally,
regardless of which specific ORM or language implements it.

Also recognized in: repository/DAO interfaces across virtually every
backend framework with database access, any design collecting all
queries against one table into a single, focused type.

### SE Lens

The alternative — hand-written `execSQL`/`rawQuery` calls scattered
throughout the app wherever a query happens to be needed, as Lesson 55
demonstrated directly — was not chosen going forward because it makes
every database operation the app performs against `items` hard to find,
audit, or change consistently; `@Dao` collects them all in one interface,
with Room supplying a correct, generated implementation for each.

---

## Concept Unit: Room `@Database`

### The Problem

`Item` (an `@Entity`) and `ItemDao` (an `@Dao`) exist independently of
each other until something declares "this is the actual database, made
of these entities, offering these DAOs" and provides the one real
instance the rest of the app uses.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Room framework source:

```java
@Database(entities = {Item.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    public abstract ItemDao itemDao();
}
```

This is Room `@Database` — **first appearance**: an abstract class,
annotated to list every `@Entity` it manages, whose abstract
DAO-returning methods Room supplies real implementations for.
`AppDatabase` (this lesson's own abstract class, `extends`ing Room's own
`RoomDatabase`) declares `itemDao()` with no body at all — Room generates
the real implementation, returning a working `ItemDao` backed by this
exact database.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `@Database(entities = {Item.class}, version = 1)` — **(a) first
   appearance**: lists every `@Entity` this database manages, and the
   schema's own version number.
2. `public abstract class AppDatabase extends RoomDatabase` — **(b)
   reappearing** this lesson's own abstract class, now subclassing Room's
   real `RoomDatabase` base class.
3. `public abstract ItemDao itemDao();` — **(b) reappearing** `@Dao`
   interface from this lesson's own previous unit, declared here with no
   body — Room generates the real, working implementation.

### CS Lens

`@Database` is exactly the mix an abstract class was introduced for at
the start of this lesson: `AppDatabase` will soon hold real, hand-written
logic (a shared instance, this lesson's next unit) alongside a method
(`itemDao()`) Room itself supplies an implementation for — neither a
plain class nor a plain interface could express that combination.

Also recognized in: the same "one class wires together every entity and
DAO into a real database" role across virtually every annotation-driven
ORM (JPA's own `EntityManager`, Entity Framework's `DbContext`).

### SE Lens

The alternative — each part of the app opening and querying the database
file directly and independently — was not chosen because nothing would
declare, in one place, exactly which entities and DAOs together make up
"the real inventory database"; `@Database` is that one declaration, with
Room generating a real, working implementation from it.

---

## Concept Unit: Builder Pattern

### The Problem

Constructing a real, running `AppDatabase` instance needs several pieces
of configuration at once (a `Context`, the database class, a file name,
and potentially more later) — a single constructor taking every one of
these as positional parameters becomes hard to read and easy to call
incorrectly as more configuration is added over time.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Room framework source:

```java
AppDatabase db = Room.databaseBuilder(appContext, AppDatabase.class, "inventory").build();
```

This is the `Builder Pattern` — **first appearance**: constructing a
complex object step by step through a dedicated builder object, rather
than through one large constructor taking every parameter at once.
`Room.databaseBuilder(...)` returns a builder object configured with the
application Context (Lesson 48), the `AppDatabase` class itself, and the
database's file name; `.build()` is the final step, producing the real,
working `AppDatabase` instance only once every needed piece has been
supplied.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `Room.databaseBuilder(appContext, AppDatabase.class, "inventory")` —
   **(a) first appearance**: constructs the builder itself, configured
   with the application Context (Lesson 48's own concept, applied here
   directly), the database class, and the file name.
2. `.build();` — **(a) first appearance**: the final step, producing the
   real `AppDatabase` instance from everything configured on the builder
   so far.

### CS Lens

`Room.databaseBuilder(...).build()` is the first appearance, in this
curriculum, of a shape that recurs across other Android APIs going
forward: a fluent builder object, configured step by step, ending in one
explicit call that produces the real, finished object.

Also recognized in: builder patterns across virtually every mainstream
language and framework (`StringBuilder` in Java itself, fluent builder
APIs in countless libraries), any API preferring configured, incremental
construction over one large constructor.

### SE Lens

The alternative — a single `AppDatabase` constructor taking a `Context`,
a class reference, and a file name (and potentially more configuration
later) as positional parameters — was not chosen because it becomes
harder to read and easier to call incorrectly (parameters in the wrong
order) as more configuration options are added; a builder makes each
piece of configuration explicit and named.

---

## Concept Unit: Singleton Pattern

### The Problem

`Room.databaseBuilder(...).build()` is real, working code — but calling
it every single time the app needs the database would construct a brand
new, separate `AppDatabase` instance each time, when exactly one, shared
instance is what the rest of the app actually needs.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Room framework source:

```java
public abstract class AppDatabase extends RoomDatabase {
    public abstract ItemDao itemDao();

    private static AppDatabase instance;

    public static AppDatabase getInstance(Context context) {
        if (instance == null) {
            Context appContext = context.getApplicationContext();
            instance = Room.databaseBuilder(appContext, AppDatabase.class, "inventory").build();
        }
        return instance;
    }
}
```

This is the `Singleton Pattern` — **first appearance**: a class
deliberately designed so that exactly one instance of it is ever created,
with every caller receiving that same shared instance. `instance`
(Lesson 03's own class-level state) holds the one real `AppDatabase`
object once built; `getInstance` builds it exactly once — the first time
any caller asks — and hands back that exact same object on every later
call, no matter how many different callers ask.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `private static AppDatabase instance;` — **(b) reappearing**
   class-level state from Lesson 03, holding the one, shared instance
   once built.
2. `if (instance == null) { ... instance = Room.databaseBuilder(...)
   .build(); }` — **(b) reappearing** builder call from this lesson's own
   previous unit; runs only the very first time `getInstance` is ever
   called, since `instance` stays non-null on every later call.
3. `return instance;` — hands back the exact same object on every call,
   after the first — proof `getInstance` never constructs a second,
   separate `AppDatabase`.

### CS Lens

The Singleton Pattern is the formal name for the exact shape this
curriculum has already shown informally more than once (Lesson 36's own
`DataCache`, Lesson 48's own `AppDatabase` example): exactly one instance,
built once, shared by every caller thereafter.

Also recognized in: singletons across virtually every object-oriented
language, connection pools, configuration objects, and logging
frameworks generally — anywhere exactly one shared instance is the
correct design.

### SE Lens

The alternative — constructing a fresh `AppDatabase` (and a fresh
underlying database connection) every time it's needed — was not chosen
because it wastes real resources reopening the same database file
repeatedly, and risks two separate `AppDatabase` objects disagreeing
about the same underlying data; a single, shared instance guarantees
every part of the app reads and writes through the exact same connection.

---

## Connect the Pieces

An abstract class is the mix `AppDatabase` needs: real, hand-written logic
(`getInstance`) alongside a method (`itemDao()`) Room itself supplies an
implementation for. `@Entity` makes `Item` the single source of truth for
both the Java type and the database table. `@Dao` collects every
operation against that table into one interface, `ItemDao`. `@Database`
wires `Item` and `ItemDao` together into one real, declared database.
`Room.databaseBuilder(...).build()` — the Builder Pattern — actually
constructs that real instance from its needed configuration. And the
Singleton Pattern, wrapping that builder call in `getInstance`, ensures it
only ever runs once, with every caller in the app sharing the exact same
`AppDatabase` object afterward.

## What Breaks Without This

Skipping `@Entity`/`@Dao`/`@Database` in favor of Lesson 55's own
hand-written SQL strings means the table definition and the Java type can
silently drift apart with no compiler error — a renamed field with no
matching column change simply fails, or silently loses data, at runtime.
Calling `Room.databaseBuilder(...).build()` directly, every time the
database is needed, instead of wrapping it in a singleton's `getInstance`,
constructs a separate `AppDatabase` (and a separate underlying
connection) each time — wasteful, and a real risk that two instances
disagree about the same data.

## Exercises

1. Add a `@Update` method to `ItemDao` and explain, in your own words, why
   Room can generate a real implementation for it from the annotation
   alone.
2. Explain, in your own words, why `AppDatabase` must be an abstract
   class rather than a plain interface, connecting your answer to this
   lesson's own first Concept Unit.
3. Explain, in your own words, what would go wrong if `getInstance`
   omitted the `if (instance == null)` check entirely.

## Definition of Done

- [ ] You ran the `Shape`/`Square` abstract-class example and can explain
      why `Shape` cannot be instantiated directly.
- [ ] You read the real `@Entity`, `@Dao`, and `@Database` examples and
      can explain what each one declares.
- [ ] You read the real `Room.databaseBuilder(...).build()` example and
      can explain what the Builder Pattern is.
- [ ] You read the real `getInstance` example and can explain why it only
      ever builds one `AppDatabase` instance.
