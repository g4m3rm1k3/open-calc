# Lesson 4a: Reference — What a Variable Actually Holds

**What you will build:** A disposable lab. Today's case study: what a
variable holding an object actually contains, and a real, common
misconception that follows from not knowing it.

**What you need to know first:** Lesson 0c's `object`.

**Terms introduced in this lesson:**

- **Reference** — a variable holding not the object itself but a
  pointer to where it actually lives — copying the variable copies the
  pointer, not the object.

---

## Concept Unit: Reference — What a Variable Actually Holds

### The Problem

`Dog myDog = new Dog();` has read, throughout this course, as "myDog
holds a Dog." That phrasing hides a real, important detail: a variable
of a class type does not hold the object's actual data directly the
way an `int` variable holds a number directly — it holds something
else, a pointer to where the real object actually lives, and that
distinction has real, observable consequences the moment a second
variable enters the picture.

### Introduce the Concept in Isolation

```
mkdir lesson-4a
cd lesson-4a
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
        second.value = 99;

        System.out.println("first.value: " + first.value);
        System.out.println("second.value: " + second.value);
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
first.value: 99
second.value: 99
```

`Box second = first;` did not create a second, independent `Box` —
changing `second.value` also changed what `first.value` reads as,
because both variables hold the exact same `reference` — **first
appearance**: a variable holding not the object itself but a pointer to
where it actually lives — copying the variable copies the pointer, not
the object. There is exactly one `Box` object here; `first` and
`second` are two separate names pointing at that same one object.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Box first = new Box();` — **(b) reappearing** object creation from
   Lesson 0d. `first` is assigned a reference to the newly-built
   object — not the object's own storage directly.
2. `first.value = 10;` — reaches through the reference to set the real
   object's field.
3. `Box second = first;` — **(a) first appearance** of this exact
   assignment shape: copies `first`'s reference into `second`. This
   does not construct a new `Box` — there is no `new` anywhere on this
   line — it copies the pointer, so `second` now points at the exact
   same object `first` does.
4. `second.value = 99;` — changes the one real object's field, reached
   through `second` this time.
5. `first.value` — read afterward, shows `99`, not the original `10`,
   because `first` was never pointing at a separate object to begin
   with — there was only ever one `Box`.

### CS Lens

A reference is a real, distinct kind of value from the object it
points to — copying a reference is a cheap, small operation (copying a
pointer), entirely different from copying an object's actual data,
which this lesson's example never did at all. Every non-primitive
variable in Java works this way — there is no separate "value type"
for objects the way some languages provide.

Also recognized in: every variable in Python (referencing, not
copying, mutable objects the same way), pointers in C/C++ (explicit,
visible syntax for the same underlying idea Java keeps implicit),
reference types in C# (identical behavior to Java's, with `struct` as a
deliberate, named exception that copies by value instead).

### SE Lens

This concept itself is foundational rather than a design choice with
an alternative — it's how the language actually works, not a tradeoff
being selected. Its value is entirely in what it *explains*: every
later lesson's mention of "returns a reference" or "modifies the
object in place" depends on this exact model already being understood.

---

## Connect the Pieces

`Box first = new Box();` built one real object, referenced by
`first`. `Box second = first;` copied that reference, not the object.
The next lesson (Aliasing) names the specific situation this creates.

## What Breaks Without This

Assuming `Box second = first;` created an independent copy, then being
surprised that modifying `first` later also changes `second` — this is
a real, common confusion the next lesson demonstrates directly.

## Exercises

1. Add a second field to `Box`, `String label`, and confirm changing it
   through `second` also changes what `first.label` reads as.
2. Write a method `Box createIndependentCopy(Box original)` that
   constructs a genuinely new `Box` and copies `original.value` into it
   field by field, then confirm changing the copy's `value` does *not*
   affect the original.
3. Explain, in your own words, why `Box second = first;` does not
   construct a new `Box`.

## Definition of Done

- [ ] You ran the `first`/`second` example and saw the real, shared
      output confirming both variables reflect the same change.
- [ ] You completed Exercise 2 and produced a genuinely independent
      copy.
- [ ] You can state, without looking back at this lesson, what `Box
      second = first;` actually copies.
