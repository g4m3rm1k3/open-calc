---
series: java-fundamentals
level: 13
title: Optional & Null Safety
lang: java
---

# Optional & Null Safety

Level 10 already caught a real `NullPointerException` — calling a method on a reference that points at nothing. `null` is legal for any object type in Java, which means any method that might have "nothing to return" has always had exactly one option: return `null`, and trust every caller to remember to check. `Optional<T>` makes that possibility part of the type itself, impossible to silently forget.

## Optional.of, Optional.empty, and isPresent

```java
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        Optional<String> present = Optional.of("hello");
        Optional<String> empty = Optional.empty();

        System.out.println(present.isPresent());
        System.out.println(empty.isPresent());
        System.out.println(present.get());
        System.out.println(empty.orElse("default"));
    }
}
```

```text
true
false
hello
default
```

`Optional<String>` — not a `String` itself, but a wrapper that either genuinely holds a `String`, or genuinely holds nothing — the "nothing" case represented as a real, distinct object, not a `null` reference that looks identical to a valid one until it's too late.

`Optional.of("hello")` — wraps a real, known-present value. `Optional.empty()` — the explicit "nothing here" case. `.isPresent()` — `true`/`false` for which one this is.

`present.get()` — unwraps the value, `"hello"`. `empty.orElse("default")` — unwraps `empty`'s value *or*, since there isn't one, immediately falls back to `"default"` instead — no `null` ever appears anywhere in this example.

## Calling get() on an Empty Optional

```java
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        Optional<String> empty = Optional.empty();
        try {
            empty.get();
        } catch (java.util.NoSuchElementException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
```

```text
Caught: No value present
```

`empty.get()` — throws `NoSuchElementException` (Level 10's own exception mechanism) rather than silently returning `null` or crashing with a confusing `NullPointerException` somewhere unrelated later. This is a real, deliberate design point: `.get()` is the one `Optional` method that *can* still fail exactly the way ignoring `null` always could — which is precisely why the methods below exist, so `.get()` rarely needs to be called directly at all.

## Optional as a Return Type

```java
import java.util.Optional;

public class Main {
    static Optional<String> findUser(int id) {
        if (id == 1) return Optional.of("Alice");
        return Optional.empty();
    }

    public static void main(String[] args) {
        String name = findUser(1).map(s -> s.toUpperCase()).orElse("NOT FOUND");
        System.out.println(name);

        String name2 = findUser(99).map(s -> s.toUpperCase()).orElse("NOT FOUND");
        System.out.println(name2);

        try {
            findUser(99).orElseThrow(() -> new RuntimeException("no user"));
        } catch (RuntimeException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
```

```text
ALICE
NOT FOUND
Caught: no user
```

`static Optional<String> findUser(int id)` — the method's own signature now states, honestly, that a user might not be found — impossible to miss the way a plain `String findUser(int id)` returning `null` on failure would be, since nothing in that older signature would ever hint it might not give back a real `String`.

`.map(s -> s.toUpperCase())` — transforms the value *if present*, and does nothing at all if the `Optional` is empty — no null-check needed first, unlike calling `.toUpperCase()` directly on a possibly-`null` `String`. `.orElse("NOT FOUND")` — the same fallback pattern as before, now chained directly onto the transformed result.

`.orElseThrow(() -> new RuntimeException("no user"))` — the alternative to `orElse`: instead of a default value, throw a specific, chosen exception when nothing is present. The `() -> ...` here is a **lambda expression** (Level 14 explains this syntax in full) — a small, inline function, only actually run if the `Optional` really is empty.

## Optional.ofNullable — Bridging From Code That Still Uses null

```java
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        String maybeNull = null;
        Optional<String> opt = Optional.ofNullable(maybeNull);
        System.out.println(opt.isEmpty());
        System.out.println(opt.isPresent());
    }
}
```

```text
true
false
```

`Optional.ofNullable(maybeNull)` — unlike `Optional.of(...)`, which throws immediately if handed a `null`, `ofNullable` accepts a possibly-`null` reference and safely converts it: a real value becomes a present `Optional`, `null` becomes an empty one. This is the real, practical entry point for adopting `Optional` around code — a legacy method, a library call — that still hands back plain `null` the old way. `.isEmpty()` — the direct opposite of `.isPresent()`, added for exactly this kind of readability.

**SE lens:** `Optional` isn't a replacement for `null` everywhere — using it as a field type or a method *parameter* type is widely considered a misuse; it adds an extra wrapper object for no real benefit when the caller already has to pass something explicit either way. Its real, intended use is almost entirely as a **return type**, specifically for methods where "nothing to return" is a genuine, expected outcome — turning a silent, easy-to-forget possibility into something the type system itself won't let a caller ignore.

## Challenge: describe_score

Write a `static String describeScore(Optional<Integer> score)` method that returns `"Score: " + score` (e.g. `"Score: 85"`) if `score` is present, or `"No score recorded"` if it's empty. Use `.map(...)` and `.orElse(...)`.

```challenge
static String describeScore(Optional<Integer> score) {
    // TODO
}
```

```test
assert describeScore(Optional.of(85)).equals("Score: 85")
assert describeScore(Optional.empty()).equals("No score recorded")
assert describeScore(Optional.of(0)).equals("Score: 0")
assert describeScore(Optional.of(100)).equals("Score: 100")
```
