# Lesson 13e: Annotation-Driven ORM

**What you will build:** No new code to compile — this reads real
Android/Room code directly.

**What you need to know first:** Lesson 0w's annotations, Lesson 12b's
relational database model.

**Terms introduced in this lesson:**

- **Annotation-driven ORM** — annotating a plain class to describe a
  database table and its columns, then having a separate build-time tool
  generate the actual SQL-calling code from those annotations instead of
  hand-writing it.

---

## Concept Unit: Annotation-Driven ORM

### The Problem

Lesson 12b's own hand-written `CREATE TABLE` SQL string and a plain
Java class's own fields are two entirely separate things a developer
must keep in sync by hand — nothing stops the table's columns and the
class's fields from silently drifting apart over time.

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

This is `annotation-driven ORM` — **first appearance**: annotating a
plain class to describe a database table and its columns, then having a
separate build-time tool generate the actual SQL-calling code from those
annotations instead of hand-writing it. `@Entity` and `@PrimaryKey`
(Java annotations, Lesson 0w) are read by Room at build time, which
generates the real table-creation and query code itself — no hand-written
`CREATE TABLE` string like Lesson 12b's own required.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `@Entity(tableName = "items")` — **(b) reappearing** annotation syntax
   from Lesson 0w, here read by Room's own build-time code generator
   rather than by reflection at runtime.
2. `@PrimaryKey(autoGenerate = true)` — **(b) reappearing** annotation
   syntax from Lesson 0w, marking which field the generated table's own
   primary key (Lesson 12d) column comes from.
3. `public String name; public int quantity;` — **(b) reappearing**
   ordinary Java fields, now doubling as the exact column definitions
   Room generates the real table from.

### CS Lens

This is annotation-driven ORM's whole value proposition: the table
definition and the Java type it represents can no longer drift apart the
way a hand-written `CREATE TABLE` string (Lesson 12b) easily could — one
annotated class *is* the single source of truth for both.

Also recognized in: annotation-driven ORMs across virtually every
mainstream backend framework (Hibernate/JPA in Java, Entity Framework in
C#, Django's own model classes) — the same "one annotated class defines
both the code type and the database table" idea.

### SE Lens

The alternative — keeping a Java class and a hand-written `CREATE TABLE`
string in sync manually, as Lesson 12b did directly — was not chosen
going forward because it requires a developer to remember to update both
places identically, forever; annotation-driven ORM removes that
synchronization burden by generating the table definition directly from
the one class the tool can see.

---

## Connect the Pieces

Annotating a class to describe its own table removes the manual
synchronization burden Lesson 12b's hand-written SQL required. The next
lesson shows Room's own real version of this idea, applied to `Item`
directly.

## What Breaks Without This

Keeping a hand-written `CREATE TABLE` string and a Java class in sync
manually means a renamed field with no matching column change simply
fails, or silently loses data, at runtime — nothing catches the drift at
compile time.

## Exercises

1. Explain, in your own words, why `@Entity`/`@PrimaryKey` alone aren't
   enough to make a table exist — something still has to read them.
2. Compare this lesson's `Item` class to Lesson 12b's own hand-written
   `CREATE TABLE items (...)` and identify which annotation corresponds
   to which column definition.
3. Explain, in your own words, why keeping a class and a hand-written SQL
   string in sync manually is a real, ongoing maintenance burden.

## Definition of Done

- [ ] You read the real annotated `Item` example and can explain what
      problem annotation-driven ORM solves.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a
      hand-written `CREATE TABLE` string can silently drift from a Java
      class's own fields.
