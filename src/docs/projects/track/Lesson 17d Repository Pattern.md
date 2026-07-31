# Lesson 17d: Repository Pattern

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 17a's delegation, Lesson 17b's
layered architecture, Lesson 17c's Open/Closed Principle, Lesson 0r's
program to an interface.

**Terms introduced in this lesson:**

- **Repository Pattern** — one class responsible only for "get me the
  data, from wherever it actually lives, and hand back a single, unified
  answer" — hiding the actual source (one database, several, a network
  call, a cache, any combination) behind one small, stable interface.

---

## Concept Unit: The Repository Pattern

### The Problem

`PriceCalculator` and `DiscountedPriceCalculator` (Lessons 17a-17c) show
a real payoff for delegation, layering, and the open/closed principle —
but the pattern that combines all three most directly, in real
applications, is about *where data comes from*: a database today,
possibly a network call or a cache added later, with calling code that
shouldn't need to change regardless of which.

### Introduce the Concept in Isolation

```
mkdir lesson-17d
cd lesson-17d
```

Create `Main.java`:

```java
interface ItemSource {
    String getItemName(int id);
}

class DatabaseItemSource implements ItemSource {
    public String getItemName(int id) {
        return "Item #" + id + " from the database";
    }
}

class ItemRepository {
    private ItemSource source = new DatabaseItemSource();

    String getItemName(int id) {
        return source.getItemName(id);
    }
}

public class Main {
    public static void main(String[] args) {
        ItemRepository repository = new ItemRepository();
        System.out.println(repository.getItemName(42));
    }
}
```

Compile and run it. Here is the real output:

```
Item #42 from the database
```

`ItemRepository` is a `Repository Pattern` — **first appearance**: one
class responsible only for "get me the data, from wherever it actually
lives, and hand back a single, unified answer" — hiding the actual
source (one database, several, a network call, a cache, any combination)
behind one small, stable interface. `Main` calls
`repository.getItemName(42)` with no idea the real answer came from
`DatabaseItemSource` specifically — Lesson 17a's own delegation
(`ItemRepository` forwards to `source`), Lesson 17b's own layering
(`Main` never reaches `DatabaseItemSource` directly), and Lesson 17c's
own open/closed principle (a `NetworkItemSource` could be added later,
implementing the same `ItemSource` interface, with zero changes to
`ItemRepository` or `Main`) all combine in this one, real, widely-used
pattern.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface ItemSource { String getItemName(int id); }` — **(b)
   reappearing** interface, program-to-an-interface (Lesson 0r),
   describing *where data comes from* generically.
2. `class DatabaseItemSource implements ItemSource { ... }` — one
   concrete source; a `NetworkItemSource` could exist alongside it,
   implementing the identical contract.
3. `private ItemSource source = new DatabaseItemSource();` and `String
   getItemName(int id) { return source.getItemName(id); }` — pure
   delegation (Lesson 17a), forwarding entirely to whichever source is
   actually configured.

### CS Lens

The Repository Pattern is Lessons 17a through 17c's three earlier ideas,
combined into one real, widely-recognized shape: delegate the actual
work, enforce a layer boundary between calling code and the real data
source, and stay open to new sources being added later without modifying
existing, working code.

Also recognized in: the Repository pattern by name across nearly every
mainstream application architecture (Android's own architecture
guidance, ASP.NET's own layered conventions), any data-access layer
hiding multiple possible backing stores behind one stable interface.

### SE Lens

The alternative — `Main` (or any calling code) talking to
`DatabaseItemSource` directly — was not chosen because it would couple
every caller to one specific data source, permanently; adding a second
source later (a cache, checked before falling through to the database)
would mean editing every call site instead of editing `ItemRepository`
alone, in one place.

---

## Connect the Pieces

`ItemRepository` combines all three earlier lessons: delegates to
whichever `ItemSource` it holds, stays the one layer calling code goes
through, and can accept new source implementations later with zero
changes to itself or its callers.

## What Breaks Without This

Calling `DatabaseItemSource` directly from `Main`, skipping
`ItemRepository` entirely, compiles and runs fine on its own — the real
cost only appears later: adding a second, alternate source (a cache, say)
would require finding and editing every single place that skipped the
repository and called `DatabaseItemSource` directly, rather than editing
`ItemRepository` alone, in one place.

## Exercises

1. Add a second `ItemSource` implementation, `CachedItemSource`, and
   swap `ItemRepository`'s own `source` field to use it instead —
   confirm `Main` needs zero changes.
2. Add a second repository method, `getItemPrice(int id)`, following the
   same delegation shape as `getItemName`.
3. Explain, in your own words, why `ItemRepository`'s field is typed as
   `ItemSource`, not `DatabaseItemSource`, connecting this back to Lesson
   0r's own program-to-an-interface principle.

## Definition of Done

- [ ] You ran the `ItemRepository` example and saw the real output.
- [ ] You completed Exercise 1 and swapped the repository's data source
      with zero changes to calling code.
- [ ] You can state, without looking back at this lesson, which of
      Lessons 17a-17c's concepts the Repository Pattern combines, and
      how.
