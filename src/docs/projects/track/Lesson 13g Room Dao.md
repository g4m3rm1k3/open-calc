# Lesson 13g: Room `@Dao`

**What you will build:** No new code to compile — this reads real
Android/Room code directly.

**What you need to know first:** Lesson 0q's interface, Lesson 13f's
Room `@Entity`.

**Terms introduced in this lesson:**

- **Room `@Dao`** — an interface declaring every database operation as a
  method signature, each annotated with the corresponding SQL operation;
  Room generates the real implementation entirely at compile time.

---

## Concept Unit: Room `@Dao`

### The Problem

Lesson 12g's own hand-written `execSQL`/`rawQuery` calls are scattered
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

This is the Room `@Dao` annotation, marking an interface for real,
Room-generated implementation — **first appearance**: an interface
declaring every database operation as a method signature, each
annotated with the corresponding SQL operation; Room generates the real
implementation entirely at compile time. `ItemDao` (Lesson 0q's own
interface contract)
declares only method signatures; Room reads `@Insert` and `@Query`'s own
real SQL text at build time and generates the actual, working
implementation of both methods.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `@Dao public interface ItemDao { ... }` — **(b) reappearing** interface
   contract from Lesson 0q, now processed by Room's own annotation
   processor rather than hand-implemented.
2. `@Insert void insert(Item item);` — **(a) first appearance**: Room
   generates a real implementation inserting the given `Item` (Lesson
   13f's own entity) as a new row — no SQL text needed for this common
   case.
3. `@Query("SELECT * FROM items WHERE quantity > :minQuantity") List<Item>
   getItemsAbove(int minQuantity);` — **(a) first appearance**: real SQL
   (Lesson 12c) supplied directly in the annotation; `:minQuantity` binds
   to the method's own parameter, and Room generates the implementation
   that runs this exact query and returns real `Item` objects.

### CS Lens

`@Dao` replaces Lesson 12g's own scattered, hand-written `execSQL`/
`rawQuery` calls with one declared place listing every operation the app
performs against a table — the Data Access Object pattern generally,
regardless of which specific ORM or language implements it.

Also recognized in: repository/DAO interfaces across virtually every
backend framework with database access, any design collecting all
queries against one table into a single, focused type.

### SE Lens

The alternative — hand-written `execSQL`/`rawQuery` calls scattered
throughout the app wherever a query happens to be needed, as Lesson 12g
demonstrated directly — was not chosen going forward because it makes
every database operation the app performs against `items` hard to find,
audit, or change consistently; `@Dao` collects them all in one interface,
with Room supplying a correct, generated implementation for each.

---

## Connect the Pieces

`@Entity` (Lesson 13f) made `Item` the single source of truth for the
table; `@Dao` collects every operation against that table into one
interface, `ItemDao`. The next lesson introduces a pattern for
guaranteeing exactly one shared instance of a class exists.

## What Breaks Without This

Hand-written queries scattered throughout an app, instead of collected
in one `@Dao` interface, make every database operation against a table
hard to find, audit, or change consistently — nothing declares, in one
place, the full set of operations the app performs.

## Exercises

1. Add a `@Delete` method to `ItemDao` and explain, in your own words,
   why Room can generate a real implementation for it from the
   annotation alone.
2. Explain, in your own words, why `ItemDao` has no method bodies at all,
   connecting your answer to Lesson 0q's own interface material.
3. Explain, in your own words, how `:minQuantity` in the `@Query` string
   connects to `getItemsAbove`'s own parameter.

## Definition of Done

- [ ] You read the real `@Dao` example and can explain what `@Insert`
      and `@Query` each generate.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why `@Dao`
      collects operations in one place rather than scattering them.
