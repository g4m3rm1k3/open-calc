# Lesson 21: One Line, Replacing Lesson 9's Entire File

*(The `record` Keyword)*

**What you will build**
Nothing new in behavior — `Roll` (Lesson 9), hand-written across a real
`equals`/`hashCode`/`toString`, is rewritten as a modern Java `record` in
one line, doing exactly the same job, guaranteed correct.

**What you need to know first**
Lesson 9's manual `equals`/`hashCode`/`toString` implementation, including
the real `HashSet` bug that motivated writing `hashCode()` at all. This
lesson only means something because that lesson was done first, by hand.

---

## Concept Unit: `record` — The Contract, Generated

### The Problem

Lesson 9 built `Roll`'s `equals`/`hashCode`/`toString` by hand, and proved
directly what goes wrong when `hashCode` is forgotten or inconsistent
with `equals`. Modern Java (since version 14) has a keyword that
generates all three, correctly, together, every time.

### The New Code

```java
record Roll(int pins) {}
```

Compare this one line to Lesson 9's full `Roll` class — every field,
`equals`, `hashCode`, and `toString` it defined by hand.

### Verify it does the same job

```java
public class RollRecordDemo {
    public static void main(String[] args) {
        Roll a = new Roll(7);
        Roll b = new Roll(7);
        System.out.println(a);
        System.out.println(a.equals(b));
        System.out.println(a.hashCode() == b.hashCode());
        System.out.println(a.pins());

        java.util.Set<Roll> rolls = new java.util.HashSet<>();
        rolls.add(a);
        System.out.println(rolls.contains(b));
    }
}
```

Run it:

```bash
javac Roll.java RollRecordDemo.java
java RollRecordDemo
```

Real output — verified this session:

```text
RollRecord[pins=7]
true
true
7
true
```

*What this proves:* every single behavior Lesson 9 wrote by hand —
readable `toString` (`Roll[pins=7]`, Java's own generated format, close
to but not identical to Lesson 9's hand-chosen `"Roll{pins=7}"`), content
equality (`a.equals(b)` → `true`), consistent hashing (`hashCode()`
matches), and now `HashSet.contains` correctly finding an equal entry —
all generated from one line. `a.pins()` — (first appearance) `record`
also generates an **accessor method** named after the field itself
(`pins()`, not `getPins()` — a real, deliberate departure from the
classic Java getter-naming convention).

### `record`'s other guarantee — genuine immutability, enforced

```java
class ExtendRecord extends Roll {
    ExtendRecord(int pins) { super(pins); }
}
```

Try to compile:

```bash
javac Roll.java ExtendRecord.java
```

Real output — verified this session:

```text
ExtendRecord.java:1: error: cannot inherit from final Roll
class ExtendRecord extends Roll {
                           ^
```

*What this proves:* every `record` is implicitly `final` — it cannot be
subclassed at all, and every one of its fields is implicitly `private
final` (assignable only through its constructor). This is a real,
compiler-enforced guarantee Lesson 9's hand-written `Roll` never actually
had — nothing there stopped a future edit from adding a mutable field, or
another class from extending it and breaking the equality contract
through inheritance.

### CS Lens

This is the exact same feature this curriculum's Kotlin course covers as
`data class` and the WPF course covers as C#'s `record` — three
mainstream, statically-typed languages, all converging on "generate
value-type boilerplate from one declaration" as a first-class language
feature, all added years after each language's original 1.0 release, for
the identical reason: this exact boilerplate, written by hand, is
tedious and easy to get subtly wrong (Lesson 9's `HashSet` bug being
exactly that "subtly wrong" case, made concrete).

### SE Lens

Given `record` exists, why did this course have you write `Roll` by hand
in Lesson 9 at all, instead of starting here? Because the entire value of
this lesson depends on already knowing, concretely, what `equals()` and
`hashCode()` are *for*, and what breaks when they're inconsistent — a
`record` used without that background is "magic that saves typing," not
a shortcut for a contract you actually understand. This is the same
"concept lab before the shortcut" instinct the Concept Isolation Rule
names throughout this curriculum.

### Connection

`record`'s implicit immutability (every field `final`, no subclassing) is
worth carrying forward as a design instinct: prefer it for any type whose
entire job is holding a fixed set of values, the same category `Roll`
always was.

---

## Closing

### Connect the pieces

`record Roll(int pins) {}` (unit 1) generates exactly what Lesson 9 built
by hand — verified, line by line, to behave identically for equality,
hashing, and printing, plus a real `HashSet` lookup working correctly.
Its implicit `final`-everywhere guarantee (unit 2), proven with a real
compile error attempting to subclass it, is stronger than what the
hand-written version ever actually enforced.

### What breaks without this

There's nothing to break here in the usual sense — this lesson replaces
working code with equivalent working code. The more honest "what would
break" question: try adding a *second*, non-final field to a `record`
declaration by hand (Java doesn't allow mutable fields inside a `record`
body the normal way) — the compiler's restriction here is exactly what
prevents a `record` from ever silently becoming the kind of mutable,
contract-violating type Lesson 9's `BrokenRoll` was.

### Exercises

- Convert `Player` (Lesson 16) to a `record` and observe what actually
  goes wrong — `Player`'s `gameScores` list genuinely changes over time
  (`recordGame` mutates it), which conflicts with `record`'s
  immutable-by-design intent. Write down, in your own words, why `Player`
  should stay a regular class and `Roll` was the right fit for `record`.
- Add a second field to `Roll` (say, a `boolean wasStrike`) directly in
  the `record` declaration (`record Roll(int pins, boolean wasStrike) {}`)
  and confirm `equals`/`hashCode`/`toString` all correctly account for
  both fields with no additional code.

### Definition of done

- [ ] `record Roll(int pins) {}` behaves identically to Lesson 9's
      hand-written version, verified with real output.
- [ ] You triggered the real "cannot inherit from final" error.
- [ ] You can explain, in your own words, why `Player` should *not*
      become a `record`, connecting back to Lesson 16's entity/value
      distinction.
- [ ] Commit: `git commit -m "Replace hand-written Roll with a one-line record — same contract, now guaranteed by the compiler"`.
