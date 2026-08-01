---
series: java-fundamentals
level: 18
title: equals(), hashCode() & toString()
lang: java
---

# equals(), hashCode() & toString()

Level 15's records generated `equals()`, `hashCode()`, and `toString()` automatically. Every ordinary class this course has written since Level 7 — `Rectangle`, `BankAccount`, `Employee` — has three real methods it never wrote, silently inherited from `Object` itself, and those defaults are almost never what a real class actually wants.

## The Default Behavior, Before Overriding Anything

```java
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
}

public class Main {
    public static void main(String[] args) {
        Point p1 = new Point(3, 4);
        Point p2 = new Point(3, 4);
        System.out.println(p1.equals(p2));
    }
}
```

```text
false
```

`p1.equals(p2)` — `false`, even though `p1` and `p2` hold identical `x`/`y` values. `Point` never wrote its own `equals()`, so it inherits `Object`'s own default: pure identity comparison, functionally the same as `==` (Level 4's `String ==` trap, generalized to every object type that doesn't override this). Two separately-constructed `Point`s, however identical their contents, are never `equals()` under this default — a real, common surprise for anyone assuming "same values" is what `equals` checks by default.

## Overriding equals() and hashCode() Together

```java
import java.util.Objects;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Point)) return false;
        Point other = (Point) obj;
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }
}

public class Main {
    public static void main(String[] args) {
        Point p1 = new Point(3, 4);
        Point p2 = new Point(3, 4);
        Point p3 = new Point(5, 6);

        System.out.println(p1.equals(p2));
        System.out.println(p1.equals(p3));
        System.out.println(p1 == p2);
        System.out.println(p1);
        System.out.println(p1.hashCode() == p2.hashCode());
    }
}
```

```text
true
false
false
Point(3, 4)
true
```

`if (this == obj) return true;` — a real optimization, not just a correctness check: if `obj` is literally the same object as `this`, it's trivially equal, no field comparison needed. `if (!(obj instanceof Point)) return false;` — `equals` must safely handle being handed *anything*, including `null` or a completely unrelated type (`instanceof` — Level 15 — is `false` for `null`, so this line alone also protects against a `null` argument). `Point other = (Point) obj;` — only cast after confirming `obj` really is a `Point`. `x == other.x && y == other.y` — the actual, real content comparison this class needed all along.

`Objects.hash(x, y)` — computes a hash code by combining `x` and `y`; the specific numeric result doesn't matter, but the guarantee does: **equal objects must always produce equal hash codes** — `p1.equals(p2)` being `true` requires `p1.hashCode() == p2.hashCode()`, checked directly in the last line's output.

`@Override public String toString() { ... }` — replaces `Object`'s own default `toString()` (which would print something like `Point@1b6d3586`, a class name plus a memory-address-flavored hash — genuinely useless for debugging) with real, readable output. `System.out.println(p1)` calls `p1.toString()` internally to decide what to print, exactly the way Level 15's records got this for free.

**CS lens:** `equals()` and `hashCode()` **must** be overridden together, never just one — this is a real, documented contract in `Object`'s own specification, not a style preference. Any `HashMap` or `HashSet` (Level 16) relies on `hashCode()` to pick which bucket an object goes into, and then relies on `equals()` to check for a real match *within* that bucket. Override `equals()` alone, leaving the old identity-based `hashCode()` in place, and two objects that are `equals()` can end up hashed into completely different buckets — a `HashSet` would then insert both, treating them as distinct, silently violating the very equality just defined.

## Why the Contract Matters in Practice

```java
import java.util.*;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Point)) return false;
        Point other = (Point) obj;
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() { return Objects.hash(x, y); }
}

public class Main {
    public static void main(String[] args) {
        HashSet<Point> points = new HashSet<>();
        points.add(new Point(1, 1));
        points.add(new Point(1, 1));
        points.add(new Point(2, 2));
        System.out.println(points.size());
    }
}
```

```text
2
```

Two separate `new Point(1, 1)` calls, added to a `HashSet` — `size()` is `2`, not `3`: the second `Point(1, 1)` is correctly recognized as a duplicate of the first and never actually added, because `hashCode()` routes both into the same bucket and `equals()` then confirms they really do match once there. Remove either override — keep only `equals()`, or only `hashCode()` — and this exact example would silently produce `3` instead, the bug the shared contract exists to prevent.

**SE lens:** `Objects.hash(x, y)` and the `instanceof`/cast pattern above are the real, standard shape almost every hand-written `equals`/`hashCode` pair follows — most IDEs generate close to this exact code automatically. Knowing the pattern by hand still matters: it's what a record (Level 15) is quietly doing on the developer's behalf, and it's the version still required the moment a class needs *mutable* fields or extra behavior beyond what a record's fixed, immutable shape allows.

## Challenge: money_equals

Write a `Money` class with:
- An `int cents` field and a constructor taking it
- `equals(Object obj)`, following the pattern above, comparing `cents`
- `hashCode()` using `Objects.hash(cents)`
- `toString()` returning `"$" + (cents / 100.0)`

```challenge
class Money {
    // TODO
}
```

```test
Money m1 = new Money(150);
Money m2 = new Money(150);
Money m3 = new Money(200);
assert m1.equals(m2)
assert !m1.equals(m3)
assert m1.hashCode() == m2.hashCode()
HashSet<Money> set = new HashSet<>();
set.add(m1); set.add(m2); set.add(m3);
assert set.size() == 2
assert m1.toString().equals("$1.5")
```
