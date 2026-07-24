# Lesson 15: Making "Might Not Exist" Impossible to Ignore

*(`Optional<T>`)*

**What you will build**
A player-lookup function that returns `Optional<String>` instead of a
possibly-`null` `String` — the library-level convention Java offers in
place of the compiler-enforced nullability this curriculum's Kotlin
course gets for free from its type system.

**What you need to know first**
Lesson 0's `NullPointerException` from unboxing — this lesson is the same
underlying problem (a missing value, encountered too late), with Java's
best available tool for it.

---

## Concept Unit: The Problem `Optional` Exists to Solve

### The Problem

A method that looks up a player by name has a genuine "might not find
one" case. Returning `null` for "not found" is legal Java and extremely
common — and it silently defers the problem to whoever calls the method.

### Introduce the concept in isolation — the `null`-returning version, first

```java
import java.util.List;

public class NullReturningFinder {
    static String findPlayer(List<String> players, String name) {
        for (String p : players) {
            if (p.equals(name)) return p;
        }
        return null;
    }

    public static void main(String[] args) {
        List<String> players = List.of("Ada", "Grace");
        String found = findPlayer(players, "Alan");
        System.out.println(found.toUpperCase());
    }
}
```

Run it:

```bash
javac NullReturningFinder.java
java NullReturningFinder
```

Real output — verified this session:

```text
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.toUpperCase()" because "<local2>" is null
	at NullReturningFinder.main(NullReturningFinder.java:14)
```

*What this proves:* `findPlayer`'s signature — `static String
findPlayer(...)` — gives absolutely no hint, at the call site, that the
result might be `null`. The crash happens three lines away from the
actual missing-player case, at whatever line first tries to *use* the
result. This is the exact same category of bug Lesson 0's unboxing
`NullPointerException` demonstrated, now happening at the level of your
own method design instead of Java's autoboxing.

### Discard the throwaway example

Deleted. `Optional<T>` is the fix.

### The New Code

```java
import java.util.List;
import java.util.Optional;

public class OptionalDemo {
    static Optional<String> findPlayer(List<String> players, String name) {
        for (String p : players) {
            if (p.equals(name)) return Optional.of(p);
        }
        return Optional.empty();
    }

    public static void main(String[] args) {
        List<String> players = List.of("Ada", "Grace");
        Optional<String> found = findPlayer(players, "Ada");
        System.out.println(found.isPresent());
        System.out.println(found.orElse("no such player"));

        Optional<String> missing = findPlayer(players, "Alan");
        System.out.println(missing.isPresent());
        System.out.println(missing.orElse("no such player"));
    }
}
```

Run it:

```bash
javac OptionalDemo.java
java OptionalDemo
```

Real output — verified this session:

```text
true
Ada
false
no such player
```

*What this proves:* `findPlayer`'s signature now reads
`Optional<String>` — anyone calling it sees, right there in the type,
that a missing result is a real, expected possibility they must handle,
not something they can accidentally forget until it crashes. `isPresent()`
checks whether a value exists; `orElse(...)` supplies a fallback instead
of ever handing back a raw, possibly-`null` `String`.

### Mechanical walkthrough

1. `Optional<String>` — (first appearance) a wrapper type holding either
   exactly one `String`, or nothing — never `null` itself (an `Optional`
   reference should never be `null`; "no value" is represented by an
   *empty* `Optional`, a real, distinct object).
2. `Optional.of(p)` — (first appearance) wraps a known-non-null value.
3. `Optional.empty()` — (first appearance) the "no value" case, as a real
   object, not `null`.
4. `found.isPresent()` — checks which case you have.
5. `found.orElse("no such player")` — (first appearance) returns the
   wrapped value if present, or the given fallback if empty — one line,
   replacing what would otherwise be an explicit `if (found != null)`
   check.

### CS Lens

`Optional<T>` is Java's version of an **option type** — the same idea as
Kotlin's `String?` (this curriculum's Kotlin course), Swift's `Optional`,
and Rust's `Option<T>`. The real, meaningful difference: Kotlin's `?` is
enforced *by the compiler* at every assignment — you cannot accidentally
put a `null` into a non-nullable `String` at all (Lesson 0 of the Kotlin
course proves this directly). Java's `Optional` is a **library
convention**, not a compiler guarantee — nothing stops a method from
still returning a raw, possibly-`null` `String` instead of using
`Optional` at all, and nothing stops someone from calling `.get()` on an
empty `Optional` (which throws its own exception) without checking
`isPresent()` first. `Optional` is genuinely better than nothing, but it
is opt-in discipline, not an enforced guarantee.

### SE Lens

Given that real limitation, why use `Optional` at all instead of just
being careful with `null`? Because the *signature itself* now documents
the possibility, at the one place a caller is looking when they write the
call — `String findPlayer(...)` gives no hint; `Optional<String>
findPlayer(...)` does. This is a real, meaningful improvement in
self-documentation even without compiler enforcement — worth using
consistently for exactly the situations Lesson 0's unboxing crash and this
lesson's `null`-returning finder both represent: a value that might
legitimately not exist.

### Connection

Lesson 16's player lookups (finding a `Player` by name in a growing
bowling alley) use `Optional<Player>` for exactly this reason — the same
pattern, applied to a real domain type instead of a `String`.

---

## Closing

### Connect the pieces

A `null`-returning `findPlayer` (unit 1) crashed three lines from its real
cause, with no warning in its own signature. `Optional<String>` (unit 2)
makes "might not find one" part of the type itself, verified with real
output for both the found and not-found cases — a genuine improvement in
honesty, even though Java doesn't enforce it the way Kotlin's `?` does.

### What breaks without this

Call `.get()` directly on `missing` (the empty `Optional` from the demo
above) instead of `.orElse(...)`. Real, observable failure: a
`NoSuchElementException`, Java's own dedicated exception for exactly this
misuse — a clearer, more specific failure than a generic
`NullPointerException`, but still a real crash if you skip checking
`isPresent()` (or use `.get()` instead of a safer accessor) first —
concrete proof that `Optional` reduces this class of bug but doesn't
eliminate the need for care.

### Exercises

- Trigger the real `NoSuchElementException` yourself by calling `.get()`
  on an empty `Optional`.
- Rewrite `findPlayer`'s body using `Optional.ofNullable(...)` around a
  value that might itself be `null` (look up its exact behavior) instead
  of the explicit `of`/`empty` branching shown here.

### Definition of done

- [ ] You triggered the real `null`-returning crash and the real
      `Optional` `NoSuchElementException`, both yourself.
- [ ] `findPlayer` returns `Optional<String>` and both branches (found,
      not found) work correctly, verified with real output.
- [ ] You can explain, concretely, the real difference between Java's
      `Optional` and Kotlin's `?` — not just that "they're similar."
- [ ] Commit: `git commit -m "Introduce Optional<T> for player lookups — prerequisite for Epic 3's real player list"`.
