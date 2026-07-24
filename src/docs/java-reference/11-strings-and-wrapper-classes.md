# Wrapper Classes, Autoboxing, and Formatting

Every primitive type (see
[01-syntax-basics.md](01-syntax-basics.md)) has a corresponding object
type — `int` → `Integer`, `double` → `Double`, `boolean` → `Boolean`,
and so on — needed anywhere Java requires a real object, not a raw
primitive (generics and collections, mainly). Every example on this
page was compiled and run for real.

---

## Autoboxing and Unboxing

```java
int primitive = 5;
Integer wrapped = 5;        // autoboxing: int silently becomes Integer
int unwrapped = wrapped;    // auto-unboxing: Integer silently becomes int
```

Real output: `primitive=5 wrapped=5 unwrapped=5`

This conversion happens automatically, silently, wherever needed — most
commonly when putting primitives into a generic collection, since
generics (see [06-generics.md](06-generics.md)) only work with object
types, never raw primitives:

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(10);              // int 10 autoboxed to Integer
int first = numbers.get(0);   // Integer auto-unboxed back to int
```

Real output: `first=10`

`List<int>` is not legal Java at all — it must be `List<Integer>`;
autoboxing is what makes writing `numbers.add(10)` feel seamless
despite that restriction.

---

## The Integer Caching Gotcha

```java
Integer a = 100;
Integer b = 100;
a == b   // true

Integer c = 200;
Integer d = 200;
c == d   // false
```

Real output:

```text
100==100 (boxed): true
200==200 (boxed): false
```

Java caches (and reuses) boxed `Integer` objects for values from `-128`
to `127` — so two separately-autoboxed `Integer`s in that range happen
to be the exact same object (`==` is true), purely as an internal
optimization detail. Outside that range, each autoboxed value is a
genuinely new object, and `==` correctly returns `false`. This is a
famous, real Java trap: code that appears to work correctly in testing
(small numbers) can silently break in production once real values
exceed `127`.

```java
a.equals(b)   // true
c.equals(d)   // true
```

**Rule of thumb: never use `==` to compare wrapper-type values (`Integer`,
`Long`, `Double`, ...) — always use `.equals()`.** The exact same rule as
`String` (see [01-syntax-basics.md](01-syntax-basics.md)), for the exact
same underlying reason: `==` compares object identity, not value, and an
internal caching optimization is what makes the bug so easy to miss
until it silently breaks outside the cached range.

---

## `null` and Wrapper Types

A primitive `int` field defaults to `0` and can *never* be `null`. A
wrapped `Integer` field defaults to `null` and genuinely can be:

```java
Integer nullable = null;
int crash = nullable;   // auto-unboxing null
```

Real output — a real, common runtime crash:

```text
Caught NPE unboxing null: NullPointerException
```

Auto-unboxing `null` throws `NullPointerException` — this is a real,
common source of bugs specifically because the unboxing is invisible in
the source code; `int crash = nullable;` looks like a harmless
assignment, not a method call that can throw.

---

## Parsing and Formatting

```java
int parsed = Integer.parseInt("42");
double parsedDouble = Double.parseDouble("3.14");
```

Real output: `parsed int=42 parsed double=3.14`

(`Integer.parseInt` throwing `NumberFormatException` on invalid input
is covered in depth in [08-exceptions.md](08-exceptions.md).)

```java
String formatted = String.format("Name: %s, Age: %d, Score: %.2f", "Alice", 30, 92.5);
```

Real output: `Name: Alice, Age: 30, Score: 92.50`

`%s` — a `String` (or anything, via `.toString()`). `%d` — an integer.
`%.2f` — a decimal, forced to exactly 2 places after the point. The
same format-string idea as Python's `%`-formatting or C's `printf`.

---

## Text Blocks (Java 15+)

```java
String textBlock = """
        Line one
        Line two
        Line three""";
```

Real output:

```text
Line one
Line two
Line three
```

A multi-line string literal, without needing `"\n"` between every
line — the closest Java equivalent to Python's triple-quoted strings or
JavaScript's template literals (though without `${}`-style
interpolation — use `String.format`/`+` for that).
