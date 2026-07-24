# Lesson 0: Java Fundamentals You Didn't Get From Python or JavaScript

**Developer Story**
> As a developer who knows Python and JavaScript, I want to understand the
> specific ways Java's type system and object model differ, before writing
> a single line of the kata.

**What you will build**
Nothing in the Bowling Game yet — this lesson is a targeted gap-filler, not
a feature. You already know how to program; this lesson hits exactly the
handful of things that are genuinely different in Java, verified by
actually running real, sometimes-surprising Java behavior, not a syntax
tour.

**What you need to know first**
Real programming experience (Python, JavaScript) and some prior exposure
to Java from `../track/`'s Android course. This lesson does not re-teach
`if`/`for`/functions — it teaches what's specifically different about
Java's own type system and object model.

---

## Concept Unit: Primitives, Wrapper Classes, and the Mechanism Behind `int` → `String`

### The Problem

You've Googled "how to convert int to String in Java" and it works — but
knowing *that* it works isn't the same as knowing *why* there are three
common ways to do it, and why Java even distinguishes a primitive `int`
from a boxed `Integer` at all. Neither Python nor JavaScript has this
distinction: Python's `int` is always an object; JavaScript's `number` is
always a primitive, with no separate "boxed" form you'd reach for
day-to-day.

### Introduce the concept in isolation

```java
public class IntToString {
    public static void main(String[] args) {
        int pins = 7;
        String viaValueOf = String.valueOf(pins);
        String viaIntegerToString = Integer.toString(pins);
        String viaConcatenation = "" + pins;
        System.out.println(viaValueOf);
        System.out.println(viaIntegerToString);
        System.out.println(viaConcatenation);
        System.out.println(viaValueOf.equals(viaIntegerToString));
    }
}
```

Run it:

```bash
javac IntToString.java
java IntToString
```

Real output — verified this session:

```text
7
7
7
true
```

*What this proves:* all three approaches produce an equal, correct
`String`. `Integer.toString(pins)` is the most direct — a `static` method
on `Integer` (the class name is capitalized on purpose; more on that
below) that does the conversion. `String.valueOf(pins)` is a general
overloaded helper that does the same thing for many types, not just `int`.
`"" + pins` works because Java's `+` operator, when either side is a
`String`, converts the other side to a `String` automatically — a real,
intentional operator behavior, not a coincidence.

### The primitive/wrapper distinction, made concrete

`int` is a **primitive type** — a raw numeric value, not an object, with
no methods of its own (`pins.toString()` would not compile). `Integer` is
its **wrapper class** — a real object wrapping an `int` value, with real
methods (`Integer.toString(...)`, and instance methods once you have an
`Integer` object). Java automatically converts between them where needed —
this is called **autoboxing** (primitive → wrapper) and **unboxing**
(wrapper → primitive) — but the conversion is not free, and not always
safe. Prove the unsafe case:

```java
public class Unboxing {
    public static void main(String[] args) {
        Integer boxed = null;
        int unboxed = boxed;
        System.out.println(unboxed);
    }
}
```

Run it:

```bash
javac Unboxing.java
java Unboxing
```

Real output — verified this session:

```text
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "<local1>" is null
	at Unboxing.main(Unboxing.java:4)
```

*What this proves:* `int unboxed = boxed;` looks like a harmless
assignment, but the compiler inserts a hidden call to `boxed.intValue()`
to perform the unboxing — and calling any method on a `null` reference
throws `NullPointerException`, the exact same exception you'd get calling
a method on `null` explicitly. Python has no primitive/object split to
create this exact trap; this is a real, Java-specific gotcha worth knowing
before it bites you inside a collection of `Integer`s (which is exactly
what the kata's roll list will be, starting next lesson).

### Discard the throwaway examples

Both files are discarded. `Integer.toString`/autoboxing understanding
carries forward into the kata.

### CS Lens

The primitive/wrapper split exists because Java's object model requires
every object to carry extra bookkeeping (a reference, type information) —
primitives skip all of that for the common case (raw arithmetic), at the
cost of not being real objects. Wrapper classes exist specifically for the
places Java's type system *requires* an object — generic type parameters
(`List<Integer>`, not `List<int>` — Lesson 2 hits this directly), and
anywhere `null` needs to be a meaningful possible value.

### SE Lens

Why does Java keep this split at all, when it's a real source of bugs
(the `NullPointerException` above)? Performance and historical
compatibility — primitives compile to raw CPU-level operations with no
object overhead, which mattered enormously when Java was designed and
still matters in tight loops. The cost, honestly: every Java programmer
eventually gets bitten by an unboxing `NullPointerException` at least
once — knowing the mechanism now (autoboxing hides a `null` check you'd
otherwise see explicitly) turns that inevitable bug into a recognizable
pattern instead of a mystery.

### Connection

The kata's roll list, starting Lesson 2, is a `List<Integer>` specifically
*because* Java's generics can't hold primitives directly — this is the
first real consequence of what this unit just proved.

---

## Concept Unit: `==` vs. `.equals()` — The Trap That Looks Fine Until It Isn't

### The Problem

In Python, `==` compares values for the types you'll use daily (numbers,
strings) the way you'd expect. In Java, `==` on any object type —
including `Integer` — compares **reference identity** (are these the
literal same object in memory?), not content. This is worth seeing fail in
a way that looks like it's working, then stops.

### Introduce the concept in isolation

```java
public class EqualsVsDoubleEquals {
    public static void main(String[] args) {
        Integer a = 100;
        Integer b = 100;
        System.out.println("a == b for 100: " + (a == b));
        System.out.println("a.equals(b) for 100: " + a.equals(b));

        Integer c = 200;
        Integer d = 200;
        System.out.println("c == d for 200: " + (c == d));
        System.out.println("c.equals(d) for 200: " + c.equals(d));
    }
}
```

Run it:

```bash
javac EqualsVsDoubleEquals.java
java EqualsVsDoubleEquals
```

Real output — verified this session:

```text
a == b for 100: true
a.equals(b) for 100: true
c == d for 200: false
c.equals(d) for 200: true
```

*What this proves:* this is not a hypothetical — `==` on two `Integer`s
holding the identical value `100` returns `true`, but the same comparison
on `200` returns `false`. The reason: Java caches (reuses the same object
for) boxed `Integer` values from `-128` to `127` specifically, as a
performance optimization — `100` falls in that cached range and happens to
be the same object; `200` does not, and autoboxing creates two genuinely
separate `Integer` objects. `.equals()` correctly returns `true` in both
cases, because it compares actual content, not identity. This is a
real, famous Java trap: code that "works" in testing with small numbers
can silently break in production with larger ones, purely because of `==`.

### Discard the throwaway example

Deleted. The rule going forward: **never use `==` to compare `Integer`,
`String`, or any other object type for equality — always use `.equals()`.**
`==` is correct only for primitives (`int == int`) and for deliberately
checking whether two references point to the exact same object.

### CS Lens

This is **reference equality vs. value equality** — two genuinely
different questions an equality check can answer, and Java's `==` answers
the first one for objects, unlike Python's `==` (value equality by
default for its built-in types) or JavaScript's `==`/`===` (which have
their own, differently-confusing coercion rules). This curriculum's Kotlin
course covers the same distinction from the opposite direction: Kotlin's
`==` calls `.equals()` automatically (value equality by default), and
Kotlin has its own separate `===` for reference identity — Java's rule is
effectively reversed from Kotlin's.

### SE Lens

Why does Java's `==` default to reference comparison for objects instead
of calling `.equals()` automatically, the way Kotlin does? Historical and
performance reasons from Java's original design — reference comparison is
a single, fast, unambiguous CPU-level check; deciding "what does equality
mean for this type" is a design decision Java leaves to each class's own
`.equals()` implementation (Lesson 9 writes one by hand) rather than
assuming one universal answer. The real cost: this ambiguity is
exactly why the `Integer` caching trap above is possible at all.

### Connection

Every comparison in the kata and the app that follows — comparing scores,
looking up a player — uses `.equals()` or a real comparison method,
never bare `==` on objects, starting immediately in Lesson 1's assertions
(which use JUnit's `assertEquals`, itself built on `.equals()` internally).

---

## Concept Unit: Access Modifiers — Four Levels, Not a Naming Convention

### The Problem

Python signals "this is private" with a leading underscore — a convention,
not enforced by the language. JavaScript has real private fields (`#field`)
but only that one level. Java has four distinct, compiler-enforced access
levels, and getting them right is part of designing a class's public
contract, not an afterthought.

### Introduce the concept in isolation

```java
class Account {
    private double balance = 100.0;
}

public class AccessDemo {
    public static void main(String[] args) {
        Account account = new Account();
        System.out.println(account.balance);
    }
}
```

Run it:

```bash
javac AccessDemo.java
```

Real output — verified this session:

```text
AccessDemo.java:8: error: balance has private access in Account
        System.out.println(account.balance);
                                  ^
1 error
```

*What this proves:* this is a genuine compile error, not a linter warning
or a runtime crash — `private` is enforced by the compiler itself, before
the program can even be built, the same static-checking philosophy behind
every type error you'll hit in this language.

### The four levels, named

- **`private`** — visible only inside the same class. The default choice
  for a class's internal fields (Lesson 9's `Roll` fields will be
  `private`).
- **(no modifier at all — "package-private")** — visible to any class in
  the same package, nowhere else. Java's actual default when you write
  nothing, easy to do by accident.
- **`protected`** — visible to the same package, plus subclasses in any
  package. Rare in this course; it exists mainly for inheritance-heavy
  designs.
- **`public`** — visible everywhere. The kata's `Game.roll(...)` and
  `Game.score()` are `public` because they're the class's actual contract
  with the outside world.

### Discard nothing — this is real, permanent Java knowledge

No throwaway code to delete here — the four levels themselves are the
lesson.

### CS Lens

This is **encapsulation**, one of this curriculum's recurring "hard
concepts" (per the Repetition Rule) — restricting access to a type's
internals so its invariants can't be violated from outside. Also
recognized in: every object-oriented language's own privacy mechanism
(Python's convention, JavaScript's `#field`, Kotlin and C#'s own modifier
systems from this curriculum's other courses) — the concept is universal;
Java's specific implementation is four enforced levels instead of one
convention or one enforced level.

### SE Lens

Why four levels instead of Python's one convention or JavaScript's one
enforced level? Package-private and `protected` exist specifically for
designs where "private to this class" is too restrictive but "public to
the whole world" is too permissive — a whole package of cooperating
classes (Lesson 16's `Player`/`Game`/`Leaderboard`, for instance) can share
access to each other's internals without exposing those same internals to
unrelated code elsewhere in the program. The real cost: four levels is
genuinely more to think about per field/method than one convention — worth
it specifically because the compiler, not a linter or a comment, enforces
the boundary.

### Connection

Every class this course builds, starting with Lesson 1's `Game`, makes a
real access-level decision for every field and method — not defaulted to
`public` out of convenience.

---

## Closing

### Connect the pieces

`int`/`Integer` (unit 1) is the mechanism behind the `int`-to-`String`
conversion you'd already Googled — now understood, not just used, and the
same mechanism explains why unboxing a `null` crashes. `==` vs. `.equals()`
(unit 2) is the single most common real bug this exact distinction causes,
proven with genuinely surprising real output. Access modifiers (unit 3)
are Java's compiler-enforced version of encapsulation, with four real
levels instead of Python's or JavaScript's simpler models.

### What breaks without this

Change `EqualsVsDoubleEquals`'s `200`s to `50`s and re-run. Real,
observable consequence: `c == d` now prints `true` — because `50` also
falls inside Java's `-128` to `127` `Integer` cache range. This is the
exact trap: code that happens to only ever see small numbers during
testing can look completely correct while harboring a real bug, invisible
until a larger number reaches it in production.

### Exercises

- Find the exact boundary of Java's `Integer` cache yourself — try `127`
  and `128` with `==` and confirm where it flips.
- Write a class with a `package-private` (no modifier) method, and a
  second class in the same package that calls it successfully — then move
  the second class to a different package (a different directory with its
  own `package` declaration) and confirm the call now fails to compile.

### Definition of done

- [ ] You triggered the real unboxing `NullPointerException` yourself.
- [ ] You found the exact `Integer` cache boundary yourself (not just
      trusted `100`/`200` as the example).
- [ ] You triggered the real `private` access compile error yourself.
- [ ] You can state, in your own words, why `==` is unsafe for comparing
      `Integer`s but safe for comparing `int`s.
- [ ] Commit: `git commit -m "No production code yet — notes on Java's type system gaps from Python/JavaScript, before the kata begins"`.
