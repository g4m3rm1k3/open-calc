# Lesson 14: Three Shapes of "A Bunch of Values"

*(`List`, `Set`, `Map`, and `Comparator`)*

**What you will build**
No new `Game` feature — a clear picture of Java's three core collection
shapes, needed before Epic 3 builds a real multi-player, multi-game
bowling alley on top of them.

**What you need to know first**
Lesson 2's `List<Integer>` — this lesson broadens that into the other two
shapes Java's Collections Framework provides, plus sorting custom objects
by an arbitrary field.

---

## Concept Unit: `List`, `Set`, and `Map` — Three Different Questions

### The Problem

`List<Integer>` (Lesson 2) answers "an ordered sequence, duplicates
allowed." Not every collection of values fits that shape — sometimes you
need "no duplicates, order doesn't matter" or "look something up by a
key," and Java has a purpose-built type for each.

### Introduce the concept in isolation

```java
import java.util.*;

public class CollectionsDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Ada", "Grace", "Ada", "Alan"));
        System.out.println("List (allows duplicates, ordered): " + names);

        Set<String> uniqueNames = new HashSet<>(names);
        System.out.println("Set (no duplicates): " + uniqueNames.size() + " unique names");

        Map<String, Integer> highScores = new HashMap<>();
        highScores.put("Ada", 210);
        highScores.put("Grace", 300);
        highScores.put("Ada", 245);
        System.out.println("Map (Ada's high score, last write wins): " + highScores.get("Ada"));
        System.out.println("Map keys: " + highScores.size());
    }
}
```

Run it:

```bash
javac CollectionsDemo.java
java CollectionsDemo
```

Real output — verified this session:

```text
List (allows duplicates, ordered): [Ada, Grace, Ada, Alan]
Set (no duplicates): 3 unique names
Map (Ada's high score, last write wins): 245
Map keys: 2
```

*What this proves:* the `List` kept `"Ada"` twice, in insertion order — a
`Set` built from the same names automatically collapsed the duplicate
down to three unique entries. The `Map` shows a real, important behavior:
calling `put("Ada", 245)` a second time didn't add a second entry — it
**overwrote** the first, because a `Map`'s keys are unique by definition;
`get("Ada")` returns whatever was written *last*.

### CS Lens

`List`, `Set`, and `Map` are three of the most fundamental **abstract data
types** in computer science — a sequence, a collection with no
duplicates, and a key-value association — each with several concrete
implementations (`ArrayList` vs. `LinkedList` for `List`; `HashSet` vs.
`TreeSet` for `Set`; `HashMap` vs. `TreeMap` for `Map`), differing in
performance characteristics and ordering guarantees this course doesn't
need to go deep on yet, but is worth knowing exist.

### SE Lens

Why does `HashSet` correctly deduplicate `"Ada"`, given only `equals()`
and `hashCode()`, with no explicit "compare these two strings" code
written anywhere in this example? Because `HashSet` relies on exactly the
`equals()`/`hashCode()` contract Lesson 9 built by hand for `Roll` —
`String` already implements both correctly, which is *why* this "just
works" here. Any custom type used as a `Set` element or `Map` key needs
that same contract honored, or it silently breaks the same way
`BrokenRoll` did.

---

## Concept Unit: `Comparator` — Sorting by a Rule You Supply

### The Problem

Lesson 13's `Leaderboard<T extends Comparable<T>>` sorts using each
element's *own* built-in ordering. Sometimes you need to sort by a
specific field, or by more than one possible rule — `Comparator` supplies
an ordering from *outside* the type being sorted, rather than requiring
the type to define one itself.

### Introduce the concept in isolation

```java
import java.util.*;

class ScoreEntry {
    String name;
    int score;
    ScoreEntry(String name, int score) { this.name = name; this.score = score; }
    public String toString() { return name + ":" + score; }
}

public class ComparatorDemo {
    public static void main(String[] args) {
        List<ScoreEntry> entries = new ArrayList<>(List.of(
            new ScoreEntry("Ada", 210),
            new ScoreEntry("Grace", 300),
            new ScoreEntry("Alan", 150)
        ));
        entries.sort(Comparator.comparingInt(e -> e.score));
        System.out.println("Ascending: " + entries);
        entries.sort(Comparator.comparingInt((ScoreEntry e) -> e.score).reversed());
        System.out.println("Descending: " + entries);
    }
}
```

Run it:

```bash
javac ComparatorDemo.java
java ComparatorDemo
```

Real output — verified this session:

```text
Ascending: [Alan:150, Ada:210, Grace:300]
Descending: [Grace:300, Ada:210, Alan:150]
```

*What this proves:* `ScoreEntry` implements no `Comparable` at all — it
doesn't need to, because `Comparator.comparingInt(e -> e.score)` supplies
the ordering rule externally, as a lambda extracting the field to compare
by. `.reversed()` flips any `Comparator`'s ordering without writing a
second one from scratch.

### Discard the throwaway example

Deleted. `Comparator` is used for real in Lesson 17's leaderboard, sorting
real `Player` objects by their best game score.

### CS Lens

`Comparable` (Lesson 13) is a type describing its *own* natural ordering;
`Comparator` is a separate, standalone object describing *an* ordering,
supplied from outside. A type can have exactly one natural ordering (one
`compareTo`), but as many different `Comparator`s as there are reasonable
ways someone might want to sort it.

### SE Lens

Why would `Leaderboard<T extends Comparable<T>>` (Lesson 13) ever *not*
be the right tool, given it already works? Because forcing every type
that might ever need sorting to implement `Comparable` bakes in exactly
*one* ordering — a `Player` might reasonably need to be ranked by best
game, total games played, or average score, at different times.
`Comparator` supports all of those from one type, without picking a
single "natural" one the type itself is stuck with forever.

### Connection

Lesson 17's leaderboard uses a `Comparator` on `Player` specifically for
this reason — a player's rank depends on *which* statistic you're ranking
by, not one fixed, built-in ordering.

---

## Closing

### Connect the pieces

`List`, `Set`, and `Map` (unit 1) answer three genuinely different
questions about how to hold a group of values — proven with real,
observable differences (duplicates kept vs. collapsed, keys overwritten).
`Comparator` (unit 2) supplies an ordering from outside a type, rather
than requiring the type to define its own — proven by sorting a type with
no `Comparable` implementation at all, ascending then descending.

### What breaks without this

Try using a custom type with a broken `equals()`/`hashCode()` (Lesson 9's
`BrokenRoll`) as a `HashSet` element or `HashMap` key. Real, observable
consequence — the exact same silent failure Lesson 9 already proved:
`set.contains(equalButDifferentInstance)` returns `false` even though
`.equals()` alone says `true`. This isn't a new bug — it's the same one,
now shown to affect every hash-based collection, not just `HashSet`
specifically.

### Exercises

- Build a `Map<String, List<Integer>>` — a player's name mapped to a list
  of their game scores — and add two games for the same player, confirming
  both land in the same list rather than overwriting each other.
- Sort `ScoreEntry` by `name` alphabetically instead of `score`, using
  `Comparator.comparing(e -> e.name)`.

### Definition of done

- [ ] You can state, concretely, one real difference between `List`,
      `Set`, and `Map`, each with an example, not just a definition.
- [ ] The `Comparator`-based sort works both ascending and descending,
      verified with real output.
- [ ] You can explain, in your own words, when you'd reach for
      `Comparable` (Lesson 13) versus `Comparator` (this lesson).
- [ ] Commit: `git commit -m "No production code — notes on List/Set/Map and Comparator, prerequisite for Epic 3's multi-player features"`.
