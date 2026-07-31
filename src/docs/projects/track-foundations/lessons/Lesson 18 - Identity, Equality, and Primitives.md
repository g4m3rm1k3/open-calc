# Lesson 18: Identity, Equality, and Primitives

**What you will build:** A disposable lab, same pattern as earlier
Java-only lessons. Today's case study: two genuinely different questions
that look like one, and the real split Java draws between primitive
values and everything else.

**What you need to know first:** Lesson 17's `reference` and `aliasing`.

**Terms introduced in this lesson:**

- **Identity vs. equality** — whether two references point to the
  literally same object (identity) versus whether two objects merely have
  equal contents (equality) — two genuinely different questions.
- **Primitives vs. reference types** — Java splits every type into
  primitives (raw values, copied by value, never `null`) and
  objects/reference types (copied by reference, can be `null`).

---

## Concept Unit: Identity vs. Equality

### The Problem

Lesson 17 showed that `Box second = first;` makes `second` and `first`
aliases of one object — genuinely the same object, not two equal ones.
A different, easily confused situation is two *separately built* objects
that happen to hold identical data — same fields, same values, but never
aliased at all. Whether `==` should treat these as "the same" is a real
question with a real, specific answer in Java, not an assumption safe to
carry over from every language.

### Introduce the Concept in Isolation

```
mkdir lesson-18
cd lesson-18
```

Create `Main.java`:

```java
class Box {
    int value;
}

public class Main {
    public static void main(String[] args) {
        Box first = new Box();
        first.value = 10;

        Box second = first;
        Box third = new Box();
        third.value = 10;

        System.out.println("first == second: " + (first == second));
        System.out.println("first == third: " + (first == third));
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
first == second: true
first == third: false
```

#### Execution Trace

Two separate `new Box()` calls happen in this program, building genuinely
different objects, even though one ends up holding the same value as the
other:

1. `new Box()`, assigned to `first` — allocates the first, genuinely
   distinct `Box` object. `first.value = 10;` sets that object's own
   field.
2. `Box second = first;` — no `new` on this line at all; `second`
   becomes an alias of the exact same object `first` already refers to,
   per Lesson 17. No second object exists yet.
3. `new Box()`, assigned to `third` — allocates a *second*, genuinely
   distinct object, entirely unconnected to the first one. `third.value =
   10;` sets this second object's own field to the same number, `10`, but
   this is a coincidence of content, not a connection between the
   objects themselves.
4. `first == second` compares two references to the *same* object (from
   step 1) — `true`. `first == third` compares references to *two
   different* objects (from steps 1 and 3) — `false`, regardless of
   `value` matching, because `==` never looks at field contents at all.

`first == second` is `true` because they're aliases (Lesson 17) — the
literal same object. `first == third` is `false`, even though
`third.value` holds the identical number, `10` — because `third` is a
genuinely separate object, built with its own `new Box()`. This is
`identity vs. equality` — **first appearance**: whether two references
point to the literally same object (identity) versus whether two objects
merely have equal contents (equality) — two genuinely different
questions. `==`, on object types, checks identity, not content —
answering "are these the same object," never "do these hold the same
data."

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Box third = new Box(); third.value = 10;` — **(b) reappearing** object
   creation, building a genuinely separate object holding the same value
   as `first`.
2. `first == second` — **(a) first appearance** of `==` applied to
   object-typed variables specifically: compares the two references
   themselves — are they pointing at the same storage — not the objects'
   contents. `true`, because Lesson 17 already aliased them.
3. `first == third` — the identical comparison operator, applied to two
   references that happen to point at objects with equal `value` fields.
   `false`, because `==` never inspects field contents at all — only
   whether the two references point to the exact same object.

### CS Lens

Identity asks "is this the same object" — a question about references and
memory, answerable in principle by comparing two pointers directly.
Equality asks "do these represent the same value" — a question about
content, which requires actually inspecting fields, and has no single
universal answer without a class defining what "equal" means for its own
data (Lesson 07's own `equals()` treatment, in a later lesson, covers
this fully). This lesson establishes only that the two questions are
different; `==` on objects always answers the identity question, never
the equality one.

Also recognized in: `is` versus `==` in Python (`is` checks identity,
`==` calls a class's own `__eq__`, closer to Java's separate `.equals()`
method by default), reference-equality checks in virtually every
object-oriented language, database row identity (a primary key) versus
row content equality (every column matching) — the same distinction
recurring in a completely different domain.

### SE Lens

The alternative — `==` checking content automatically for any object type
— was not chosen by Java's own design, because "what counts as equal
content" genuinely differs per class (two `Box` objects might reasonably
be equal if their `value` matches; two `Dog` objects might need `name`
*and* `age` to match) — there is no single, universal rule the language
itself could apply correctly for every class. Leaving `==` as a pure
identity check, and requiring each class to define its own notion of
equality separately, is a deliberate design choice this curriculum
returns to directly once `.equals()` itself is introduced.

---

## Concept Unit: Primitives vs. Reference Types

### The Problem

Every field and variable seen so far — `Box`, `String`, and Lesson 03's
`int` fields — hasn't been shown to behave identically. Java genuinely
splits every type into two categories with real, different behavior, and
conflating them (assuming an `int` behaves like a `Box` reference, or the
reverse) leads to real, wrong predictions about a program's behavior.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
public class Main {
    public static void main(String[] args) {
        int firstNumber = 10;
        int secondNumber = firstNumber;
        secondNumber = 99;

        System.out.println("firstNumber: " + firstNumber);
        System.out.println("secondNumber: " + secondNumber);
    }
}
```

Compile and run it. Here is the real output:

```
firstNumber: 10
secondNumber: 99
```

Unlike Lesson 17's `Box second = first;`, changing `secondNumber` left
`firstNumber` completely unaffected. This is `primitives vs. reference
types` — **first appearance**: Java splits every type into primitives
(raw values, copied by value, never `null`) and objects/reference types
(copied by reference, can be `null`). `int` is a primitive: `secondNumber
= firstNumber;` copied the actual number, `10`, into `secondNumber` — two
genuinely independent values, unlike `Box`, where the same-looking
assignment copied a shared reference instead.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `int firstNumber = 10;` — **(b) reappearing** primitive declaration,
   already used since Lesson 03, now examined specifically for its copy
   behavior rather than taken for granted.
2. `int secondNumber = firstNumber;` — **(a) first appearance** of this
   exact contrast: visually identical in shape to Lesson 17's `Box second
   = first;`, but copies the raw value `10` itself, not a reference to
   shared storage — there is no "shared `int`" the way there was a
   shared `Box` object.
3. `secondNumber = 99;` — changes only `secondNumber`'s own independent
   storage; `firstNumber` was never connected to it at all.

### CS Lens

This split is real and has genuine consequences beyond copy behavior: a
primitive can never be `null` (an `int` variable always holds some actual
number), where any reference-typed variable, including `Box`, can hold
`null` — a reference pointing at nothing. Generics (Lesson 07) also only
work with reference types — `List<int>` cannot exist in Java at all;
`List<Integer>` (the `int` wrapper class, a real reference type) is the
actual, required alternative.

Also recognized in: value types (`struct`) versus reference types
(`class`) in C#, an almost identical split to Java's own; stack-allocated
versus heap-allocated values in C++, a related but more manually-
controlled version of the same underlying idea. Python has no such split
at all — every value there, including small integers, is genuinely an
object, a real and consequential contrast worth naming directly.

### SE Lens

The alternative — Java treating every value, including numbers, as a
reference type uniformly (as Python does) — was not chosen for Java's own
design; primitives exist specifically for performance: an `int` stored
directly, with no separate object allocation or reference indirection, is
faster to create and access than a reference-typed number would be. The
cost is exactly this lesson's own subject: two genuinely different copy
behaviors a programmer must keep straight, rather than one uniform rule
covering every type.

---

## Connect the Pieces

`first == second` (aliased, Lesson 17) is `true`; `first == third`
(separately built, equal content) is `false` — identity, not equality, is
what `==` on objects actually answers. `int secondNumber = firstNumber;`
looks identical in shape to `Box second = first;`, but behaves completely
differently, because primitives are copied by value while reference types
are copied by reference — the exact distinction that makes Lesson 17's
aliasing possible for `Box` at all, and impossible for a plain `int`.

## What Breaks Without This

Assuming `==` checks content, the way it might in a language without this
split, produces a real, silently wrong result:

```java
Box a = new Box();
a.value = 5;
Box b = new Box();
b.value = 5;

if (a == b) {
    System.out.println("Boxes are equal!");
} else {
    System.out.println("Boxes are NOT equal, even though their values match.");
}
```

Running this prints:

```
Boxes are NOT equal, even though their values match.
```

No compiler error, no crash — just a real, easy-to-miss logic mistake:
code that assumed `==` compares content silently does the wrong thing
whenever two separately-built, equal-content objects are compared this
way.

## Exercises

1. Add a `String` comparison to the first unit's example — two separately
   built `String` objects with identical text, compared with `==` — and
   observe the real result (a genuine subtlety Java's own `String`
   handling introduces, worth investigating directly rather than assumed).
2. Change the second unit's example to use `Integer` (the reference-type
   wrapper for `int`) instead of `int`, and predict, then confirm,
   whether `secondNumber = 99;` still leaves `firstNumber` unaffected.
3. Write a short program demonstrating that a primitive variable can
   never hold `null`, by trying to compile `int x = null;` and reading
   the real compiler error.

## Definition of Done

- [ ] You ran the identity/equality example and saw the real `true`/
      `false` output for aliased versus separately-built objects.
- [ ] You ran the primitive-copy example and saw the real, independent
      output confirming `int` copies by value.
- [ ] You completed Exercise 3 and saw the real compiler error for
      assigning `null` to a primitive.
- [ ] You can state, without looking back at this lesson, why `first ==
      third` is `false` even though both `Box` objects hold the same
      `value`.
