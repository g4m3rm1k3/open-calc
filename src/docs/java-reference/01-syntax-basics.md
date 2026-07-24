# Java Syntax Basics

Variables, operators, control flow, arrays, and `String` — the parts of
Java that are closest to what you already know from Python/JavaScript,
with Java's own specific syntax and rules called out. Every example on
this page was compiled and run for real.

---

## Variables and Primitive Types

Unlike Python or JavaScript, every variable in Java has a fixed,
declared type, checked by the compiler — it can never later hold a
value of a different, incompatible type.

```java
int wholeNumber = 42;
double decimal = 3.14;
boolean flag = true;
char letter = 'J';
long bigNumber = 10_000_000_000L;
float smallDecimal = 2.5f;
byte tiny = 127;
short small = 30000;
```

Output:

```text
42 3.14 true J 10000000000 2.5 127 30000
```

The eight **primitive types**: `int` (32-bit whole number), `long`
(64-bit whole number, needs an `L` suffix for large literals), `double`
(64-bit decimal, the default for decimal literals), `float` (32-bit
decimal, needs an `f` suffix), `boolean` (`true`/`false`, nothing
else — unlike JavaScript, `0` and `""` are not falsy), `char` (a single
16-bit character, single quotes), `byte` (8-bit, -128 to 127), `short`
(16-bit). Underscores in numeric literals (`10_000_000_000L`) are
purely a readability aid — ignored by the compiler.

**Gotcha:** `boolean` cannot be used where an `int` is expected, and
vice versa — no implicit truthy/falsy conversion the way JavaScript
does it.

---

## Operators

```java
int a = 10, b = 3;
a + b   // 13
a - b   // 7
a * b   // 30
a / b   // 3   — integer division truncates, doesn't round
a % b   // 1   — remainder
a > b   // true
a == b  // false
true && false  // false
true || false  // true
```

Real output:

```text
a+b=13 a-b=7 a*b=30 a/b=3 a%b=1
a>b=true a==b=false a!=b=true
true&&false=false true||false=true
```

**Gotcha:** `10 / 3` is `3`, not `3.333...` — dividing two `int`s
always produces an `int`, truncating any remainder. Use `10.0 / 3` or
cast one operand to `double` to get a decimal result.

Compound assignment and increment/decrement:

```java
int c = 5;
c += 3;   // c is now 8
c *= 2;   // c is now 16

int d = 5;
d++;      // POST-increment: the expression's value is 5, THEN d becomes 6
++d;      // PRE-increment: d becomes 7, THEN the expression's value is 7
```

Real output:

```text
after += and *=: 16
d++ =5, d now=6
++d =7
```

The ternary operator: `condition ? valueIfTrue : valueIfFalse`

```java
int max = (a > b) ? a : b;
```

```text
ternary max=10
```

---

## `if`/`else` and `switch`

```java
int score = 85;
if (score >= 90) {
    System.out.println("A");
} else if (score >= 80) {
    System.out.println("B");
} else {
    System.out.println("C or below");
}
```

Output: `B`

Classic `switch` statement — each `case` needs `break`, or execution
**falls through** into the next case:

```java
switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Some other day");
}
```

Modern **switch expression** (Java 14+) — no fall-through, no `break`
needed, and it directly produces a value:

```java
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    default -> "Unknown";
};
```

Output: `Wednesday`

**Gotcha:** forgetting `break` in a classic `switch` statement is one of
Java's most common real bugs — execution silently continues into the
next `case`'s body. The switch *expression* form doesn't have this
problem at all, which is why it's generally preferred in new code.

---

## Loops

```java
for (int i = 0; i < 3; i++) {
    System.out.println("for i=" + i);
}

int n = 0;
while (n < 3) {
    System.out.println("while n=" + n);
    n++;
}

int m = 0;
do {
    System.out.println("do-while m=" + m);
    m++;
} while (m < 3);

int[] nums = {10, 20, 30};
for (int num : nums) {
    System.out.println("enhanced-for num=" + num);
}
```

`while` checks the condition before the first iteration; `do`/`while`
always runs the body at least once, checking after. The **enhanced
for** (`for (Type name : collection)`) reads as "for each element in
this array/collection" — no index variable needed at all, the same
role Python's `for x in list` or JavaScript's `for...of` plays.

---

## Arrays

Arrays are **fixed-size** once created — unlike a Python list or a
JavaScript array, you cannot grow or shrink one; `java.util.List` (see
[07-collections-and-streams.md](07-collections-and-streams.md)) is what
you reach for when the size needs to change.

```java
int[] scores = new int[3];   // fixed size 3, all zeros initially
scores[0] = 90;
scores[1] = 85;
scores[2] = 77;

int[] literalScores = {100, 95, 88};   // size and contents given directly

int[][] grid = new int[2][3];   // a 2D array, 2 rows of 3 columns
grid[1][2] = 9;

String[] names = {"Alice", "Bob"};
```

Real output:

```text
scores[1]=85 length=3
literalScores[2]=88
grid[1][2]=9 grid[0][0]=0
names[0]=Alice
```

`.length` is a **field**, not a method (no parentheses) — unlike
`String`'s `.length()`, which *is* a method. This inconsistency is a
real, known wrinkle in Java, not something you're misremembering.

---

## `String`

Java `String`s are **immutable** — every method that looks like it
modifies a string actually returns a brand-new one, leaving the
original untouched.

```java
String s1 = "hello";
String s2 = s1.concat(" world");
```

Real output:

```text
s1=hello s2=hello world (s1 unchanged)
```

Common methods:

```java
s2.length()          // 11
s2.substring(6)       // "world"
s2.indexOf("world")   // 6
s2.toUpperCase()      // "HELLO WORLD"
s2.contains("wor")    // true
```

**The `==` vs. `.equals()` gotcha** — arguably the single most common
real bug for anyone arriving in Java from Python or JavaScript:

```java
String a = "test";
String b = "test";
String c = new String("test");

a == b          // true  — string literals are interned/cached, same object
a == c          // false — new String(...) always creates a distinct object
a.equals(c)     // true  — compares actual content
```

Real output:

```text
a==b (literals)=true
a==c (new String)=false
a.equals(c)=true
```

**Rule of thumb: always use `.equals()` to compare `String` content,
never `==`.** `==` on objects compares *identity* (are these the exact
same object in memory), not content — it happens to work for simple
literals due to an internal caching optimization, which is exactly
what makes the bug so easy to miss until it silently breaks on a
`new String(...)` or a string built at runtime (e.g. from user input,
concatenation, or `.substring()`).

`StringBuilder` — for building up a string piece by piece efficiently
(each `String.concat`/`+` in a loop would otherwise create a new
throwaway `String` object every time):

```java
StringBuilder sb = new StringBuilder();
sb.append("a").append("b").append("c");
sb.toString();   // "abc"
```

---

## Casting Between Primitives

```java
double d = 9.99;
int i = (int) d;   // explicit (narrowing) cast — truncates, doesn't round
```

Output: `9`

```java
int wide = 100;
long widened = wide;   // widening — automatic, no cast needed, never loses data
```

```java
long big = 300;
byte narrowed = (byte) big;   // narrowing — explicit cast required, CAN lose data
```

Real output:

```text
(int) 9.99 = 9
int to long (widening, automatic): 100
long 300 to byte (narrowing, explicit, overflows): 44
```

**Gotcha:** narrowing a value that doesn't fit (`300` into a `byte`,
whose range is only -128 to 127) doesn't throw an error — it silently
wraps around (`300` becomes `44`). Java trusts you once you've written
an explicit cast; it won't double-check the result fits.

---

## `var` — Local Type Inference

```java
var count = 5;        // inferred as int
var label = "items";  // inferred as String
```

`var` is *not* dynamic typing — `count` is genuinely, permanently an
`int` from this point on; `var` only saves you from writing the type
name explicitly, letting the compiler infer it from the right-hand
side. Only legal for local variables with an initializer — never for
fields, method parameters, or return types.
