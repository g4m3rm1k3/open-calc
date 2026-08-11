# Concept: Java `null` and `NullPointerException`

**What you'll understand by the end:** what `null` actually represents,
and exactly what happens — and why — the moment code tries to use a
reference that holds it.

**Prerequisites:** `java-references-and-aliasing.md`,
`java-primitive-vs-reference-types.md` (`null` is only ever possible for
a reference type, never a primitive).

## Setup

```
mkdir nulldemo && cd nulldemo
```
Plain `javac`/`java`, no dependencies.

## The Problem

An object variable holds a reference to a real object somewhere in
memory. What does that variable hold before anything has been assigned
to it — or if it's deliberately given no object at all?

## The Isolated Example

```java
public class NullDemo {
    public static void main(String[] args) {
        String message = null;

        System.out.println(message);
        System.out.println(message == null);
    }
}
```

```
javac NullDemo.java
java NullDemo
```

**Real output:**
```
null
true
```

**What this proves:** `String message = null;` assigns the special
literal `null` — not the text `"null"`, a genuinely distinct literal
value, spelled without quotes — meaning "this reference points at no
object at all." Printing it produces the text `null` only because
`println` specifically checks for this case. `message == null`
compares the reference itself against the `null` literal and correctly
reports `true`. This is only possible because `String` is a reference
type — a primitive `int` variable can never hold `null`.

Calling an actual method through a `null` reference is a different
story:

```java
public class NullPointerDemo {
    public static void main(String[] args) {
        String message = null;
        System.out.println(message.length());
    }
}
```

**Real, captured crash:**
```
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "message" is null
	at NullPointerDemo.main(NullPointerDemo.java:3)
```

**What this proves:** `message.length()` asks the reference stored in
`message` to find its `length()` method and call it — but `message`
doesn't point at any real object at all. Java's runtime detects this
precisely, at the exact line and variable name, and throws a
`NullPointerException` rather than silently doing nothing. The error
message itself names the specific method called (`String.length()`)
and the specific variable that was `null` (`"message"`).

## Mechanical Walkthrough

- `String message = null;` — assigns `null` to a reference-type
  variable — legal specifically because `String` is a reference type;
  `int message = null;` would not compile at all.
- `System.out.println(message);` — `println` has a real, specific
  special case for a `null` argument: prints the literal text `null`
  instead of crashing.
- `message.length()` — calling a method through a `null` reference:
  `.length()` is real, but there is no object to call it on. Java's
  runtime detects exactly this and throws, rather than returning `0` or
  some other placeholder.

## CS Lens

`null` representing "no object" is a real, deliberate design choice
with a well-known cost: Tony Hoare, who introduced the null reference
into programming language design in 1965, later called it his
"billion-dollar mistake," because forgetting to check for it is such a
common, costly category of bug across the entire software industry.

Also recognized in: Python's `None`, JavaScript's `null` and
`undefined`, C's `NULL` pointer (a lower-level, less-safe ancestor of
the same idea), and — as a deliberate reaction against this exact
problem — newer languages like Kotlin and Swift building "can this hold
nothing?" directly into the type system so a `NullPointerException`
equivalent becomes a compile-time error instead of a runtime crash.

## SE Lens

Why let a reference hold `null` at all, instead of requiring every
reference to always point at a real object? Genuine "nothing here yet"
states are real and necessary — a field that only gets its real value
once something else finishes loading, a search that legitimately finds
no match. A language with no way to represent "nothing" would need some
other signal for these cases, no less error-prone in a different way.
The tradeoff cost — a runtime crash instead of a compiler error when
code forgets to check — is exactly why real code always initializes a
reference-type field before use rather than trusting it's already set.

## Connection

Depends on `java-references-and-aliasing.md` (only a reference can hold
`null`) and `java-primitive-vs-reference-types.md` (primitives never
can). Any code reading a field that might not be set yet needs this
concept before it's safe to write.

## Try It Yourself

1. Change `NullPointerDemo` to check for `null` first —
   `if (message != null) { System.out.println(message.length()); }
   else { System.out.println("no message yet"); }` — and confirm this
   prevents the crash entirely.
2. Declare an uninitialized field on a disposable class (no
   constructor setting it, no inline value) and print it directly from
   `main`, without calling any method on it. Confirm it prints `null`
   automatically — Java defaults every un-assigned reference-type field
   to `null`, with no special effort required.
