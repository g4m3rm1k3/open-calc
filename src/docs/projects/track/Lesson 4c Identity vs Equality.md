# Lesson 4c: Identity vs. Equality

**What you will build:** A disposable lab.

**What you need to know first:** Lesson 4a's reference, Lesson 4b's
aliasing.

**Terms introduced in this lesson:**

- **Identity vs. equality** — whether two references point to the
  literally same object (identity) versus whether two objects merely
  have equal contents (equality) — two genuinely different questions.

---

## Concept Unit: Identity vs. Equality

### The Problem

Lesson 4b showed that `Box second = first;` makes `second` and `first`
aliases of one object — genuinely the same object, not two equal ones.
A different, easily confused situation is two *separately built*
objects that happen to hold identical data — same fields, same values,
but never aliased at all. Whether `==` should treat these as "the
same" is a real question with a real, specific answer in Java, not an
assumption safe to carry over from every language.

### Introduce the Concept in Isolation

```
mkdir lesson-4c
cd lesson-4c
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

Two separate `new Box()` calls happen in this program, building
genuinely different objects, even though one ends up holding the same
value as the other:

1. `new Box()`, assigned to `first` — allocates the first, genuinely
   distinct `Box` object. `first.value = 10;` sets that object's own
   field.
2. `Box second = first;` — no `new` on this line at all; `second`
   becomes an alias of the exact same object `first` already refers
   to, per Lesson 4b. No second object exists yet.
3. `new Box()`, assigned to `third` — allocates a *second*, genuinely
   distinct object, entirely unconnected to the first one.
   `third.value = 10;` sets this second object's own field to the same
   number, `10`, but this is a coincidence of content, not a connection
   between the objects themselves.
4. `first == second` compares two references to the *same* object
   (from step 1) — `true`. `first == third` compares references to
   *two different* objects (from steps 1 and 3) — `false`, regardless
   of `value` matching, because `==` never looks at field contents at
   all.

`first == second` is `true` because they're aliases (Lesson 4b) — the
literal same object. `first == third` is `false`, even though
`third.value` holds the identical number, `10` — because `third` is a
genuinely separate object, built with its own `new Box()`. This is
`identity vs. equality` — **first appearance**: whether two references
point to the literally same object (identity) versus whether two
objects merely have equal contents (equality) — two genuinely
different questions. `==`, on object types, checks identity, not
content — answering "are these the same object," never "do these hold
the same data."

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Box third = new Box(); third.value = 10;` — **(b) reappearing**
   object creation, building a genuinely separate object holding the
   same value as `first`.
2. `first == second` — **(a) first appearance** of `==` applied to
   object-typed variables specifically: compares the two references
   themselves — are they pointing at the same storage — not the
   objects' contents. `true`, because Lesson 4b already aliased them.
3. `first == third` — the identical comparison operator, applied to
   two references that happen to point at objects with equal `value`
   fields. `false`, because `==` never inspects field contents at all
   — only whether the two references point to the exact same object.

### CS Lens

Identity asks "is this the same object" — a question about references
and memory, answerable in principle by comparing two pointers
directly. Equality asks "do these represent the same value" — a
question about content, which requires actually inspecting fields, and
has no single universal answer without a class defining what "equal"
means for its own data (a later lesson's own `equals()` treatment
covers this fully). This lesson establishes only that the two
questions are different; `==` on objects always answers the identity
question, never the equality one.

Also recognized in: `is` versus `==` in Python (`is` checks identity,
`==` calls a class's own `__eq__`, closer to Java's separate
`.equals()` method by default), reference-equality checks in virtually
every object-oriented language, database row identity (a primary key)
versus row content equality (every column matching) — the same
distinction recurring in a completely different domain.

### SE Lens

The alternative — `==` checking content automatically for any object
type — was not chosen by Java's own design, because "what counts as
equal content" genuinely differs per class (two `Box` objects might
reasonably be equal if their `value` matches; two `Dog` objects might
need `name` *and* `age` to match) — there is no single, universal rule
the language itself could apply correctly for every class. Leaving
`==` as a pure identity check, and requiring each class to define its
own notion of equality separately, is a deliberate design choice a
later lesson returns to directly once `.equals()` itself is
introduced.

---

## Connect the Pieces

`first == second` (aliased, Lesson 4b) is `true`; `first == third`
(separately built, equal content) is `false` — identity, not equality,
is what `==` on objects actually answers. The next lesson (Primitives
vs. Reference Types) shows why `int` variables don't share this same
behavior at all.

## What Breaks Without This

Assuming `==` checks content, the way it might in a language without
this split, produces a real, silently wrong result:

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

Run it yourself and see the real output:
`Boxes are NOT equal, even though their values match.` No compiler
error, no crash — just a real, easy-to-miss logic mistake.

## Exercises

1. Add a `String` comparison to this lesson's own example — two
   separately built `String` objects with identical text, compared
   with `==` — and observe the real result (a genuine subtlety Java's
   own `String` handling introduces).
2. Run "What Breaks Without This" yourself and confirm the real output.
3. Explain, in your own words, why `first == third` is `false` even
   though both `Box` objects hold the same `value`.

## Definition of Done

- [ ] You ran the identity/equality example and saw the real
      `true`/`false` output for aliased versus separately-built
      objects.
- [ ] You completed Exercise 2 and saw the real, silently-wrong-looking
      output.
- [ ] You can state, without looking back at this lesson, why `first ==
      third` is `false` even though both `Box` objects hold the same
      `value`.
