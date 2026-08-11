# Lesson 04: `null` and `NullPointerException`

**What you will build:** Nothing app-related yet — a disposable example
proving exactly what `null` represents and what happens the moment code
tries to use a reference that holds it. The transferable problem: this
project is about to declare fields that don't get a real value until
later (an `EditText` field that starts empty until a layout finishes
loading), and the single most common runtime crash in Java code, by a
wide margin, comes from touching one of these before it's ready.

**What you need to know first:** Lesson 02 (references), Lesson 03
(primitive vs. reference types — `null` is only ever possible for a
reference type, never a primitive).

**Terms introduced in this lesson:**
- **`null`** — a special literal value meaning "this reference points at
  no object at all."
- **`NullPointerException`** — the runtime error Java throws the moment
  code tries to call a method or read a field through a reference that
  currently holds `null`.

**Objects and methods used**
- `System.out.println(...)` — Java's `static` print-to-standard-output
  method, already taught in Lesson 01 — reappears in this lesson's own
  labs exactly as before.
- **`String`** — Java's built-in text type; a real class (a reference
  type, per this lesson's own point), not a primitive, even though
  string literals (`"..."`) look like they could be. **`.length()`** —
  an instance method every `String` object has, returning its number
  of characters as an `int`. Used here specifically because calling it
  on a `null` reference is what actually triggers this lesson's
  `NullPointerException` — not this lesson's own subject, but the
  concrete example that makes the subject real.

---

## Concept Unit: `null` — a Reference to Nothing

### The Problem

Lesson 02 established that an object variable holds a reference to a
real object somewhere in memory. What does that variable hold *before*
anything has been assigned to it — or if it's deliberately given no
object at all?

### Introduce the Concept in Isolation

```java
public class NullDemo {
    public static void main(String[] args) {
        String message = null;

        System.out.println(message);
        System.out.println(message == null);
    }
}
```

Compile and run:

```
javac NullDemo.java
java NullDemo
```

Real output:

```
null
true
```

`String message = null;` assigns the special literal `null` — not the
text `"null"`, a genuinely distinct literal value, spelled without
quotes — meaning "this reference points at no object at all." Printing
it produces the text `null` only because `println` specifically checks
for this case and prints that word rather than crashing.
`message == null` compares the reference itself against the `null`
literal and correctly reports `true`. This is only possible at all
because `String` is a reference type (Lesson 03) — a primitive `int`
variable can never hold `null`; it always holds a real number, defaulting
to `0` if never assigned.

### Discard the Throwaway Example

`NullDemo` is deleted now. `null` itself is not a throwaway concept — it
carries forward into every reference-type field this project declares,
starting with the very next unit.

### Mechanical Walkthrough

- `String message = null;` — assigns the `null` literal to a
  reference-type variable — legal specifically because `String` is a
  reference type (Lesson 03); the same line written as `int message =
  null;` would not compile at all.
- `System.out.println(message);` — `println` has a real, specific
  special case for a `null` argument: it prints the literal text
  `null` instead of crashing, which is why this line succeeds even
  though `message` points at nothing.
- `message == null` — an ordinary `==` comparison (already-established
  syntax), here comparing a reference against the `null` literal rather
  than against another object.

### SE Lens

Why does Java represent "no object here" as a real, distinct value
(`null`) that any reference-type variable can hold, rather than
requiring every reference to always point at something real? Genuine
"nothing here yet" states are unavoidable — a field that only gets its
real value once something else finishes loading, a search that
legitimately finds no match. `null` gives every reference type a
built-in way to represent that state without a separate sentinel object
or a special "empty" subclass for every type that might need one — the
cost of that convenience, a crash instead of a compile error when code
forgets to check, is exactly what the next unit proves directly.

---

## Concept Unit: `NullPointerException` — Using a Reference That Points at Nothing

### The Problem

`null` printed harmlessly above only because `println` specifically
handles it. Most code doesn't — calling an actual method through a
`null` reference has a real, specific consequence.

### Introduce the Concept in Isolation

```java
public class NullPointerDemo {
    public static void main(String[] args) {
        String message = null;
        System.out.println(message.length());
    }
}
```

Compile and run:

```
javac NullPointerDemo.java
java NullPointerDemo
```

Real output:

```
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "message" is null
	at NullPointerDemo.main(NullPointerDemo.java:3)
```

`message.length()` asks the reference stored in `message` to find its
`length()` method and call it — but `message` doesn't point at any real
`String` object at all; there's no object anywhere to find that method
on. Java's runtime detects this precisely, at the exact line and the
exact variable name, and throws a **`NullPointerException`** rather than
silently doing nothing or crashing unpredictably somewhere else. The
error message itself, in modern Java, names the specific method that was
called (`String.length()`) and the specific variable that was `null`
(`"message"`) — genuinely useful, specific information, not a generic
failure.

### Discard the Throwaway Example

`NullPointerDemo` is deleted now. This exact exception — same shape,
same kind of message — is the real, concrete failure mode waiting behind
any reference-typed field this project reads before it's actually been
assigned a real object. Both labs in this lesson are also available as
a standalone concept file, `java-null-and-nullpointerexception.md`.

### Mechanical Walkthrough

- `String message = null;` — same mechanism as the previous unit: a
  reference-type variable holding no object.
- `message.length()` — **first appearance of calling a method through a
  `null` reference.** `.length()` is a real method `String` objects
  have, but there is no object here to call it on — Java's runtime
  detects exactly this and throws, rather than silently returning `0`
  or some other placeholder.
- The thrown `NullPointerException` — its message names both the exact
  method call (`String.length()`) and the exact variable (`"message"`)
  responsible, real, specific diagnostic information produced by the
  JVM at the moment of the crash, not a generic failure message.

### CS Lens

`null` representing "no object" is a real, deliberate design choice with
a well-known cost: Tony Hoare, who introduced the null reference into
programming language design in 1965, later called it his "billion-dollar
mistake," because forgetting to check for it is such a common, costly
category of bug across the entire software industry, not just Java.

Also recognized in: Python's `None`, JavaScript's `null` and `undefined`,
C's `NULL` pointer (a lower-level, less-safe ancestor of the same idea),
and, as a deliberate reaction against this exact problem, newer
languages like Kotlin and Swift building "can this hold nothing?" directly
into the type system so a `NullPointerException`-equivalent becomes a
compile-time error instead of a runtime crash.

### SE Lens

**Why does Java let a reference hold `null` at all, instead of requiring
every reference to always point at a real object?** Genuine "nothing
here yet" states are real and necessary — a field that only gets its
real value once a layout finishes loading, a search that legitimately
finds no match, an optional piece of data that isn't always present. A
language with no way to represent "nothing" would need some other
signal for these cases, one no less error-prone in a different way. The
tradeoff cost Java pays for allowing `null` at all — a runtime crash
instead of a compiler error when code forgets to check — is exactly why
this project's own real code, once fields are introduced, always
initializes them in `onCreate` before use, rather than after.

---

## Connect the Pieces

One trace: `String message = null;` gave `message` a reference pointing
at nothing. Printing it directly was safe, because `println` special-
cases `null`. Calling a real method through it was not — Java's runtime
caught the exact moment code tried to use a nonexistent object and threw
`NullPointerException`, naming the specific variable responsible.

## What Breaks Without This

This lesson's entire second unit *is* "what breaks" — the
`NullPointerException` triggered above is the genuine, common failure
this lesson exists to make familiar rather than mysterious the first
time it happens for real, mid-project.

## Exercises

1. Change `NullPointerDemo` to check for `null` first —
   `if (message != null) { System.out.println(message.length()); } else
   { System.out.println("no message yet"); }` — and confirm this
   prevents the crash entirely, printing the fallback text instead.
2. Declare an uninitialized field on a disposable class (a field with no
   constructor setting it, and no value assigned inline) and print it
   directly from a `main` method in the same file, without calling any
   method on it. Confirm it prints `null` automatically — proving Java
   itself defaults every un-assigned reference-type field to `null`,
   with no special effort required to produce that state.

## Definition of Done

- [ ] You ran both labs and saw the real, exact `NullPointerException`
      message, including the variable name it identified.
- [ ] You can explain what `null` represents and why it's only possible
      for reference types, never primitives.
- [ ] You added the `if (message != null)` check yourself and confirmed
      it prevents the crash.
- [ ] Commit: not applicable — both examples are throwaway labs.

Next: back to the real project — `extends`, overriding, and `@Override`,
now with `new`, references, and `null` already understood rather than
encountered for the first time inside unfamiliar Android code.
