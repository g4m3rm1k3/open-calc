# Lesson 13: Generics That Demand a Capability, Not Just a Type

*(A Bounded `Leaderboard<T extends Comparable<T>>`)*

**What you will build**
A reusable `Leaderboard<T>` that can rank *any* type — as long as that
type can be compared to itself. Lesson 2 used `List<Integer>` as a given;
this lesson writes your own generic class, and the bound is the whole
point.

**What you need to know first**
Lesson 2's `Box<T>`/`List<Integer>` concept lab — this lesson is where
generics stop being "the type in the angle brackets" and start being
"the type, restricted to ones that can actually do what this class needs."

---

## Concept Unit: Why Sorting Needs a Bound

### The Problem

A `Leaderboard<T>` needs to sort its entries — but sorting requires being
able to compare two `T`s to each other. An unrestricted `T` (any type at
all) gives the compiler no way to know that comparison is even possible.

### Introduce the concept in isolation — the unbounded version, first

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class UnboundedLeaderboard<T> {
    private final List<T> entries = new ArrayList<>();

    void add(T entry) { entries.add(entry); }

    List<T> ranked() {
        List<T> sorted = new ArrayList<>(entries);
        Collections.sort(sorted);
        return sorted;
    }
}
```

Try to compile:

```bash
javac UnboundedLeaderboard.java
```

Real output — verified this session:

```text
UnboundedLeaderboard.java:12: error: no suitable method found for sort(List<T#1>)
        Collections.sort(sorted);
                   ^
    method Collections.<T#2>sort(List<T#2>) is not applicable
      (inference variable T#2 has incompatible bounds
        equality constraints: T#1
        upper bounds: Comparable<? super T#2>)
```

*What this proves:* `Collections.sort` itself requires its element type to
implement `Comparable` — the error names this directly (`upper bounds:
Comparable<? super T#2>`). `UnboundedLeaderboard`'s plain `T` makes no such
promise, so the compiler correctly refuses to let `sort` be called on it
at all — this is caught here, at the one place sorting is attempted, not
deferred to some confusing runtime failure.

### Discard the broken version

`UnboundedLeaderboard` is deleted. The fix is a **bounded type parameter**.

### The New Code

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class Leaderboard<T extends Comparable<T>> {
    private final List<T> entries = new ArrayList<>();

    void add(T entry) {
        entries.add(entry);
    }

    List<T> ranked() {
        List<T> sorted = new ArrayList<>(entries);
        Collections.sort(sorted);
        Collections.reverse(sorted);
        return sorted;
    }
}
```

```java
public class LeaderboardDemo {
    public static void main(String[] args) {
        Leaderboard<Integer> scores = new Leaderboard<>();
        scores.add(150);
        scores.add(300);
        scores.add(210);
        System.out.println(scores.ranked());
    }
}
```

Run it:

```bash
javac Leaderboard.java LeaderboardDemo.java
java LeaderboardDemo
```

Real output — verified this session:

```text
[300, 210, 150]
```

*What this proves:* `T extends Comparable<T>` is Java's syntax for a
**bounded type parameter** — despite the keyword `extends`, this works for
interfaces too (`Comparable` is an interface) — it means "`T` can be
anything, as long as it implements `Comparable<T>`." `Integer` already
does (it's how `100 < 200` style ordering works for boxed integers), so
`Leaderboard<Integer>` compiles and sorts correctly — highest score first,
after `Collections.sort` (ascending) followed by `Collections.reverse`.

### Mechanical walkthrough

1. `class Leaderboard<T extends Comparable<T>>` — (first appearance) the
   bound itself — read as "T, restricted to types that can compare
   themselves to another T."
2. `Collections.sort(sorted);` — (first appearance) sorts using each
   element's own `compareTo` method (`Comparable`'s one method) — this
   compiles now specifically because the class's own declared bound
   guarantees every possible `T` has one.
3. `Collections.reverse(sorted);` — reverses the now-ascending list to get
   highest-first ranking — two small, standard-library steps instead of a
   custom descending comparator.

### The bound enforced at the type-argument site, too

```java
class NotComparable {
    int value;
    NotComparable(int value) { this.value = value; }
}
```

```java
public class BadLeaderboardUse {
    public static void main(String[] args) {
        Leaderboard<NotComparable> board = new Leaderboard<>();
    }
}
```

Try to compile:

```bash
javac Leaderboard.java NotComparable.java BadLeaderboardUse.java
```

Real output — verified this session:

```text
BadLeaderboardUse.java:3: error: type argument NotComparable is not within bounds of type-variable T
        Leaderboard<NotComparable> board = new Leaderboard<>();
                    ^
  where T is a type-variable:
    T extends Comparable<T> declared in class Leaderboard
```

*What this proves:* the bound is checked the moment someone tries
`Leaderboard<NotComparable>` — before a single method is even called —
because `NotComparable` never declared `implements Comparable<NotComparable>`.
This is caught at the earliest possible point, exactly where the mistake
actually is.

### CS Lens

This is a **bounded type parameter** — generics restricted not just to "a
type" but to "a type with a specific capability," checked entirely at
compile time. This is meaningfully stronger than duck typing (Python,
JavaScript) — there, calling `.compareTo()` on something that doesn't have
it fails at runtime, potentially far from where the mistake was made;
here, the mistake is caught the moment the wrong type argument is even
named.

### SE Lens

Why declare the bound on the *class* (`Leaderboard<T extends
Comparable<T>>`) rather than only checking inside `ranked()` at the point
sorting happens? Because declaring it on the class documents the real
requirement at the exact point a reader decides whether to use
`Leaderboard` at all — a reader sees the class signature and immediately
knows "my type needs to implement `Comparable`" without reading `ranked()`'s
implementation to discover it. This is the same "state the contract where
someone will actually look" instinct behind `ScoringStrategy` (Lesson 12).

### Connection

Lesson 17 uses this exact `Leaderboard<T>` to rank real `Player` objects —
which will need to implement `Comparable<Player>` themselves for exactly
the reason this lesson proved is required.

---

## Closing

### Connect the pieces

An unbounded `Leaderboard<T>` (unit 1) failed to compile the moment it
tried to sort, with a real error naming the missing `Comparable`
requirement. Bounding it (`T extends Comparable<T>`) fixed the class
itself, verified with real, correctly-ranked output, and the bound is
enforced again at every use site, proven by `NotComparable`'s real,
early compile error.

### What breaks without this

You already ran both broken cases above — the unbounded class failing at
`sort()`, and the bounded class correctly rejecting a non-`Comparable`
type argument. Both are this lesson's real "what breaks" moments, each
proving the bound is doing real, load-bearing work, not decoration.

### Exercises

- Make `NotComparable implements Comparable<NotComparable>` (write a real
  `compareTo` comparing the `value` field) and confirm
  `Leaderboard<NotComparable>` now compiles and ranks correctly.
- Add a `size()` method to `Leaderboard<T>` and confirm it needs no bound
  of its own — only the operations that actually require comparison
  (`ranked()`) need the class's bound; not every method automatically
  needs to justify it.

### Definition of done

- [ ] You triggered both real compile errors yourself (unbounded sort
      failure, bounded type-argument rejection).
- [ ] `Leaderboard<Integer>` ranks correctly, verified with real output.
- [ ] You can explain, in your own words, what `T extends Comparable<T>`
      actually restricts, and why `extends` applies to an interface here.
- [ ] Commit: `git commit -m "Add a bounded Leaderboard<T extends Comparable<T>> — sorting requires the bound, proven both ways"`.
