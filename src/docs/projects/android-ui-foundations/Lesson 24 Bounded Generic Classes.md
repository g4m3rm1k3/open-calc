# Lesson 24: Bounded Generic Classes

**What you will build:** Nothing app-related yet — a disposable example
combining two ideas this series has each met once, separately, but never
together: a generic class (Lesson 20's `ArrayList<E>`) and a bounded
type parameter (Lesson 13's `<T extends View>`). The transferable
problem: a real framework class this project extends next combines both
in one declaration, and meeting that combination for the first time on
unfamiliar framework code — rather than on something disposable — is
exactly the situation this series avoids wherever it can.

**What you need to know first:** Lesson 13 (bounded generic methods),
Lesson 20 (generic classes, `ArrayList<E>`).

**Terms introduced in this lesson:**
- **Bounded generic class** — a generic class (the type parameter
  belongs to the whole class) whose type parameter is additionally
  constrained to some specific type or its subtypes, combining Lesson
  20's generic-class shape with Lesson 13's bounding idea.

**Objects and methods used:** Combining a generic class with a bound
into one bounded generic class is this lesson's own subject, given full
treatment above.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`System.out.println(...)`**
  - *What it is:* Java's `static` print-to-standard-output method.
  - *Implementation:* given full treatment in Lesson 01.
  - *Its use:* prints `dogCage.describeOccupant()`'s result, proving the
    bound lets a type-specific method be called with no cast.
- **Generic classes**
  - *What it is:* a class whose own declaration carries a type
    parameter.
  - *Implementation:* given full treatment in Lesson 20.
  - *Its use:* `Cage<A>`'s own shape — the type parameter belongs to the
    whole class, not just one method.
- **Bounded type parameters**
  - *What it is:* a type parameter constrained to a specific type or its
    subtypes.
  - *Implementation:* given full treatment in Lesson 13.
  - *Its use:* `<A extends Animal>`, restricting what `Cage` can ever
    hold to `Animal` or a subtype.

---

## Concept Unit: A Generic Class, Constrained

### The Problem

Lesson 20's `ArrayList<E>` accepts any type at all for `E` — a
completely unconstrained generic class. Sometimes a generic class
genuinely needs to *do something* with its contents that only makes
sense for a specific family of types — call a method only that family
has, for instance — which requires combining the generic-class shape
with a bound, the same way Lesson 13 bounded a generic method.

### Introduce the Concept in Isolation

```java
class Animal {
    String makeSound() {
        return "...";
    }
}

class Dog extends Animal {
    @Override
    String makeSound() {
        return "Woof";
    }
}

class Cage<A extends Animal> {
    private final A occupant;

    Cage(A occupant) {
        this.occupant = occupant;
    }

    String describeOccupant() {
        return occupant.makeSound();
    }
}

public class BoundedGenericClassDemo {
    public static void main(String[] args) {
        Cage<Dog> dogCage = new Cage<>(new Dog());
        System.out.println(dogCage.describeOccupant());
    }
}
```

Compile and run:

```
javac BoundedGenericClassDemo.java
java BoundedGenericClassDemo
```

Real output:

```
Woof
```

### Mechanical Walkthrough

`class Cage<A extends Animal>` — the type parameter `A` belongs to the
whole `Cage` class (Lesson 20's generic-class shape: every field and
method inside can use `A`, not just one method), and it's bounded
(Lesson 13's bounding idea: `A` must always be `Animal` or some subclass
of it). Try `new Cage<String>("not an animal")` in a scratch copy — real
error:

```
error: type argument String is not within bounds of type-variable A
```

confirming `String` is rejected precisely because it isn't an `Animal`.
Because `A` is guaranteed to be some kind of `Animal`, `describeOccupant()`
can call `occupant.makeSound()` directly — a method only `Animal` and
its subclasses have — with no cast and no uncertainty about whether that
method actually exists on whatever `A` turns out to be.

### Discard the Throwaway Example

`Cage`, `Animal`, `Dog`, and `BoundedGenericClassDemo` are deleted now.
The real framework class this project extends next is the same
bounded-generic-class shape, with a real framework type in the bound
instead of a disposable `Animal`.

### CS Lens

A bounded generic class is the same **parametric polymorphism** already
named for `ArrayList<E>`, narrowed by a bound the same way a bounded
generic method narrows its own type parameter — the two concepts compose
directly, without needing a third, separate mechanism to combine them.

### SE Lens

**Why bound the type parameter at all, instead of leaving `Cage<A>`
completely unconstrained and only calling `Object` methods on
`occupant`?** An unconstrained `Cage<A>` could hold any type, but could
then only ever call the handful of methods every `Object` has —
`toString()`, `equals()`, and a few others — losing the ability to call
anything specific to the kind of thing actually being caged. Bounding
`A` to `Animal` is a deliberate tradeoff: `Cage` can now only ever hold
an `Animal` (narrower, less flexible), in exchange for being able to
call `Animal`-specific methods directly, with full compiler-checked
safety, on whatever it holds.

---

## Connect the Pieces

One trace: `Cage<Dog>` guaranteed, at compile time, that its one
`occupant` field would always be some kind of `Animal` — proven by the
real rejection of `Cage<String>` — which is exactly what let
`describeOccupant()` call `occupant.makeSound()` with no cast and no
runtime risk. The real framework class this project extends next relies
on this identical guarantee for a real, more specific bound.

## What Breaks Without This

Already shown above: `Cage<String>` fails to compile, naming the bound
violated directly. Remove the bound entirely (`class Cage<A>`, no
`extends Animal`) and try calling `occupant.makeSound()` inside
`describeOccupant()` — real error:

```
error: cannot find symbol: method makeSound()
```

proving concretely that without the bound, the compiler has no
guarantee `A` is anything more specific than `Object`, and rejects the
call outright.

## Exercises

1. Add a second subclass of `Animal`, `Cat`, and confirm `Cage<Cat>`
   works identically to `Cage<Dog>` — proving the bound accepts any
   subtype of `Animal`, not just the one used in the original example.
2. Reason through, without necessarily writing it: could `Cage<A extends
   Animal>` ever hold a plain `Animal` itself, not just a subclass?
   Confirm by trying `Cage<Animal> genericCage = new
   Cage<>(new Animal());` — a bound written with `extends` always
   includes the bound type itself, not only its subtypes.

## Definition of Done

- [ ] You ran the lab and saw a bounded generic class call a
      type-specific method with no cast.
- [ ] You triggered the real "not within bounds" error from an invalid
      type argument.
- [ ] You triggered the real "cannot find symbol" error from removing
      the bound entirely, and can explain why it happened.
- [ ] Commit: not applicable — the example is a throwaway lab.

Next: the real framework class this project extends, bounded to a real
framework type instead of a disposable `Animal`.
