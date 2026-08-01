---
series: java-fundamentals
level: 15
title: Records & Pattern Matching
lang: java
---

# Records & Pattern Matching

Level 7's `Rectangle` needed a constructor, private fields, and getters written by hand, just to hold two plain values. Most of that is boilerplate the compiler could generate itself for a class whose entire job is "hold some fixed data." A **record** does exactly that. This lesson also covers **pattern matching** — a shorter, safer way to ask "is this value shaped like X?" than a manual cast ever was.

## Declaring a Record

```java
public class Main {
    record Point(int x, int y) {}

    public static void main(String[] args) {
        Point p1 = new Point(3, 4);
        Point p2 = new Point(3, 4);
        System.out.println(p1);
        System.out.println(p1.x() + ", " + p1.y());
        System.out.println(p1.equals(p2));
        System.out.println(p1 == p2);
    }
}
```

```text
Point[x=3, y=4]
3, 4
true
false
```

`record Point(int x, int y) {}` — one line replaces everything Level 7's `Rectangle` needed by hand: a constructor taking `x` and `y`, two `private final` fields, and accessor methods — all generated automatically by the compiler from this single declaration.

`p1.x()` / `p1.y()` — the generated accessors; note no `get` prefix, unlike Level 7's own `getBalance()` convention — record accessors are just the field name followed by `()`.

`System.out.println(p1)` — prints `Point[x=3, y=4]`, a real, readable `toString()`, generated automatically — unlike Level 2's plain arrays, which needed `Arrays.toString()` to avoid an unreadable default.

`p1.equals(p2)` — `true`, even though `p1` and `p2` are two separate objects — records generate a real, content-based `equals()` automatically too (Level 18 covers what writing this by hand for an ordinary class actually involves, and why it matters). `p1 == p2` — still `false`, exactly as Level 4's `String` `==` trap predicted: `==` checks identity, never content, no matter the type — `equals()` remains the only correct way to compare two objects' actual data.

**CS lens:** A record's fields are implicitly `private` and `final` (Level 8) — once constructed, a `Point`'s `x` and `y` can never change. This is deliberate: a record models **immutable data**, the same category `String` (Level 4) belongs to. Reach for a record specifically when a type's whole purpose is holding a fixed bundle of values with no independent identity of its own — two `Point(3, 4)`s really are interchangeable, the same value twice, unlike two `BankAccount`s that happen to share a balance but remain genuinely distinct accounts.

## A Compact Constructor for Validation

```java
public class Main {
    record Range(int min, int max) {
        Range {
            if (min > max) throw new IllegalArgumentException("min must be <= max");
        }

        int span() { return max - min; }
    }

    public static void main(String[] args) {
        Range r = new Range(2, 10);
        System.out.println(r.span());

        try {
            Range bad = new Range(10, 2);
        } catch (IllegalArgumentException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
```

```text
8
Caught: min must be <= max
```

`Range { if (min > max) throw ... }` — a **compact constructor**: no parameter list of its own (it reuses `Range`'s own record header, `(int min, int max)`), just a body that runs before the fields are actually assigned. This is where a record enforces its own invariants — Level 7's `BankAccount` did the same job with a full, ordinary constructor; a record's compact form exists because most records need only validation, not a full field-by-field assignment written out by hand (the compiler still does that part automatically, right after the compact constructor's own code finishes).

`int span() { return max - min; }` — a record can add its own real methods too, exactly like an ordinary class, alongside the fields it auto-generates accessors for.

## instanceof Pattern Matching

```java
public class Main {
    static String describe(Object obj) {
        if (obj instanceof Integer i) {
            return "int: " + i;
        } else if (obj instanceof String s) {
            return "string of length " + s.length();
        }
        return "unknown";
    }

    public static void main(String[] args) {
        System.out.println(describe(42));
        System.out.println(describe("hello"));
        System.out.println(describe(3.14));
    }
}
```

```text
int: 42
string of length 5
unknown
```

`obj instanceof Integer i` — checks whether `obj` really is an `Integer` *and*, if so, immediately binds it to a new variable `i`, already correctly typed — in one expression. The older style needed two separate steps: `if (obj instanceof Integer) { Integer i = (Integer) obj; ... }` — a manual cast, written out by hand, every single time. `instanceof Integer i` does both at once, and `i` only exists (and is only usable) inside the branch where the check actually passed.

`describe(42)` — Java automatically boxes the primitive `42` into an `Integer` object here, since `describe` takes `Object` (Level 5's primitive/object split, meeting Level 12's polymorphism: only object types, never raw primitives, can be passed where `Object` is expected). `describe(3.14)` — a `Double`, matching neither `instanceof Integer` nor `instanceof String`, falls through to `"unknown"`.

**SE lens:** Pattern matching and records solve related but different problems: records remove boilerplate from *declaring* a fixed shape of data; `instanceof` pattern matching removes boilerplate from *checking* what shape a value already has, at the exact place that check happens. Together, they make code working with several different, fixed "kinds of thing" (a `Circle` vs. a `Square`, as the challenge below asks for) read close to how the logic is actually described in plain language, instead of being buried under manual casts.

## Challenge: classify_value

Write two records, `record Circle(double radius) {}` and `record Square(double side) {}`, and a `static String classifyValue(Object shape)` method using `instanceof` patterns:
- If `shape` is a `Circle`, return `"circle with area " + <area formatted to 2 decimal places>` (area is `Math.PI * radius * radius`; use `String.format("%.2f", ...)`)
- If `shape` is a `Square`, return `"square with area " + <area formatted to 2 decimal places>` (area is `side * side`)
- Otherwise, return `"unknown shape"`

```challenge
record Circle(double radius) {}
record Square(double side) {}

static String classifyValue(Object shape) {
    // TODO
}
```

```test
assert classifyValue(new Circle(2)).equals("circle with area 12.57")
assert classifyValue(new Square(3)).equals("square with area 9.00")
assert classifyValue("not a shape").equals("unknown shape")
assert classifyValue(new Circle(0)).equals("circle with area 0.00")
```
