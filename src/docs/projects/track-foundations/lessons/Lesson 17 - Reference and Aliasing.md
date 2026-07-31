# Lesson 17: Reference and Aliasing

**What you will build:** A disposable lab, same pattern as earlier
Java-only lessons. Today's case study: what a variable holding an object
actually contains, and a real, common misconception that follows from
not knowing it.

**What you need to know first:** Lesson 01's `object`.

**Terms introduced in this lesson:**

- **Reference** — a variable holding not the object itself but a pointer
  to where it actually lives — copying the variable copies the pointer,
  not the object.
- **Aliasing** — two or more variables referencing the exact same
  underlying object, so a change made through one is visible through the
  other.

---

## Concept Unit: Reference — What a Variable Actually Holds

### The Problem

`Dog myDog = new Dog();` has read, throughout this curriculum, as "myDog
holds a Dog." That phrasing hides a real, important detail: a variable of
a class type does not hold the object's actual data directly the way an
`int` variable holds a number directly — it holds something else, a
pointer to where the real object actually lives, and that distinction has
real, observable consequences the moment a second variable enters the
picture.

### Introduce the Concept in Isolation

```
mkdir lesson-17
cd lesson-17
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
changing `second.value` also changed what `first.value` reads as, because
both variables hold the exact same `reference` — **first appearance**: a
variable holding not the object itself but a pointer to where it
actually lives — copying the variable copies the pointer, not the
object. There is exactly one `Box` object here; `first` and `second` are
two separate names pointing at that same one object.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Box first = new Box();` — **(b) reappearing** object creation from
   Lesson 01. `first` is assigned a reference to the newly-built object —
   not the object's own storage directly.
2. `first.value = 10;` — reaches through the reference to set the real
   object's field.
3. `Box second = first;` — **(a) first appearance** of this exact
   assignment shape: copies `first`'s reference into `second`. This does
   not construct a new `Box` — there is no `new` anywhere on this line —
   it copies the pointer, so `second` now points at the exact same object
   `first` does.
4. `second.value = 99;` — changes the one real object's field, reached
   through `second` this time.
5. `first.value` — read afterward, shows `99`, not the original `10`,
   because `first` was never pointing at a separate object to begin with
   — there was only ever one `Box`.

### CS Lens

A reference is a real, distinct kind of value from the object it points
to — copying a reference is a cheap, small operation (copying a pointer),
entirely different from copying an object's actual data, which this
lesson's example never did at all. Every non-primitive variable in Java
works this way — there is no separate "value type" for objects the way
some languages provide.

Also recognized in: every variable in Python (referencing, not copying,
mutable objects the same way), pointers in C/C++ (explicit, visible
syntax for the same underlying idea Java keeps implicit), reference
types in C# (identical behavior to Java's, with `struct` as a deliberate,
named exception that copies by value instead).

### SE Lens

This concept itself is foundational rather than a design choice with an
alternative — it's how the language actually works, not a tradeoff being
selected. Its value is entirely in what it *explains*: every later
lesson's mention of "returns a reference" or "modifies the object in
place" depends on this exact model already being understood, or those
phrases are just words with no real mechanism behind them.

---

## Concept Unit: Aliasing — Two Names, One Object

### The Problem

The previous unit's `first`/`second` example demonstrated a real
consequence without naming it: two variables can refer to the exact same
object, and a change made through either one is visible through both.
This specific situation — not the general fact that variables hold
references, but two variables sharing one reference at the same time —
deserves its own name, since it's the actual, specific source of the
common "why did changing X also change Y" confusion.

### Introduce the Concept in Isolation

This concept doesn't need new code beyond what the previous unit already
built and ran — it names the specific situation that code already
demonstrated. `first` and `second`, both pointing at the one real `Box`
object, are `aliasing` — **first appearance**: two or more variables
referencing the exact same underlying object, so a change made through
one is visible through the other. `first` and `second` are **aliases**
of each other — two different names for the exact same thing, not two
different things that happen to currently hold equal values.

### Discard the Throwaway Example

No new code was introduced in this unit — it names a situation the
previous unit's own real, executed code already demonstrated.

### Mechanical Walkthrough

No new syntax appears in this unit; its content is the CS/SE framing
below, applied to code already run and proven in the previous unit.

### CS Lens

Aliasing is the specific, real-world consequence of reference semantics:
whenever two variables end up holding the same reference — through direct
assignment, as in the previous unit, or by both being passed the same
object as an argument — they become aliases, and neither variable "owns"
the object more than the other. Modifying an object through any one of
its aliases is visible through every other alias, because there was only
ever one real object all along.

Also recognized in: two variables in Python both bound to the same list
(`b = a` aliases exactly like Java's `second = first`), any language with
reference semantics generally, shared mutable state in concurrent
programming (a much higher-stakes version of the exact same underlying
fact — two threads holding aliases to the same object).

### SE Lens

Aliasing is not a mistake to avoid outright — it's a real, load-bearing
mechanism (a method receiving an object as a parameter is handed an
alias to the caller's own object, on purpose, so the method can act on
it). The risk is specifically *unintentional* aliasing: code that assumes
it's working with its own independent copy of an object, when it's
actually sharing one with other code that can change it unexpectedly.
Recognizing when two variables are aliases, rather than independent
copies, is what prevents that exact class of bug.

---

## Connect the Pieces

`Box first = new Box();` built one real object, referenced by `first`.
`Box second = first;` copied that reference, not the object — the two
variables became aliases of one single `Box`. Every change made through
either variable was visible through both, not because of anything special
about `Box`, but because that's what a reference genuinely is: a pointer
to shared storage, not a private copy.

## What Breaks Without This

A common mistake this exact confusion causes: assuming `second = first;`
created an independent copy, then being surprised that modifying `first`
later also changes `second`:

```java
Box first = new Box();
first.value = 10;

Box second = first;
// ... later, expecting `second` to be unaffected:
first.value = 500;

System.out.println("second.value: " + second.value);
```

Running this prints:

```
second.value: 500
```

`second.value` changed even though `second` itself was never directly
touched after its creation — because `second` was never an independent
copy in the first place. This is the concrete, observable proof that
`=` between two object-typed variables copies a reference, not the
object's contents.

## Exercises

1. Add a method `void resetValue()` to `Box`, setting `value` back to
   `0`, and confirm calling `second.resetValue()` also changes what
   `first.value` reads as — the same aliasing consequence, now through a
   method call instead of direct field assignment.
2. Write a method `Box createIndependentCopy(Box original)` that
   constructs a genuinely new `Box` and copies `original.value` into it
   field by field, then confirm changing the copy's `value` does *not*
   affect the original — the deliberate alternative to aliasing.
3. Predict, before running it, what `first.value` and `second.value`
   would each print after Exercise 1's `resetValue()` call, then check
   your prediction against the real output.

## Definition of Done

- [ ] You ran the `first`/`second` example and saw the real, shared
      output confirming both variables reflect the same change.
- [ ] You completed Exercise 2 and produced a genuinely independent copy,
      confirming a change to one no longer affects the other.
- [ ] You can state, without looking back at this lesson, what `Box
      second = first;` actually copies.
