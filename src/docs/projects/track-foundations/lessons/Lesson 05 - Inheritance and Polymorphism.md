# Lesson 05: Inheritance and Polymorphism

**What you will build:** A disposable lab, same pattern as Lessons 01–04.
Today's case study: one type extending another, replacing inherited
behavior, and the runtime mechanism that makes a program call the right
version automatically. This is the single most load-bearing idea in this
whole curriculum — nearly everything built later depends on it.

**What you need to know first:** Lesson 01's `class`/`object`, Lesson 02's
`method`.

**Terms introduced in this lesson:**

- **Inheritance (`extends`)** — a child type that extends a parent type,
  receiving the parent's fields and methods and able to add or replace
  its own.
- **Method overriding (`@Override`)** — a subclass supplying its own
  version of a method its parent already defines, replacing the parent's
  behavior for objects of the subclass's type.
- **Dynamic dispatch (polymorphism)** — a method call resolves to the
  actual runtime type of the object it's called on, regardless of the
  type the holding variable was declared as.
- **Runtime type narrowing (`instanceof`, casting)** — checking a
  variable's actual runtime type and then explicitly narrowing its
  declared type to a more specific one, verified rather than assumed.
- **Sealing a method or class (`final`)** — marking a method as
  un-overridable or a class as un-subclassable, a deliberate restriction
  on future inheritance.

---

## Concept Unit: Inheritance — A Child Type Extends a Parent Type

### The Problem

A `Cat` and a `Dog` share real structure — both have a `name`, both can
`makeSound()` — but are also genuinely different: a `Dog` barks, a `Cat`
meows. Writing `Cat` and `Dog` as two completely separate classes forces
`name` to be declared and handled twice, identically, in both places, with
no language-level way to say "these are both, fundamentally, animals."
Every shared piece of structure duplicated across every related class is
exactly the kind of drift Lesson 01 already showed doesn't scale.

### Introduce the Concept in Isolation

```
mkdir lesson-05
cd lesson-05
```

Create `Main.java`:

```java
class Animal {
    String name;

    void makeSound() {
        System.out.println(name + " makes a generic animal sound.");
    }
}

class Dog extends Animal {
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.name = "Rex";
        myDog.makeSound();
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

The terminal prints:

```
Rex makes a generic animal sound.
```

`class Dog extends Animal { }` is `inheritance` — **first appearance**: a
child type that extends a parent type, receiving the parent's fields and
methods and able to add or replace its own. `Dog`'s own body is empty —
yet `myDog.name` and `myDog.makeSound()` both work, because `Dog`
automatically has everything `Animal` declares, without retyping any of
it.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class Animal { ... }` — an ordinary class, **(c)** reappearing shape
   from Lesson 01.
2. `class Dog extends Animal { }` — **(a) first appearance** of `extends`:
   declares `Dog` as a **subclass** (or **child class**) of `Animal`, the
   **superclass** (or **parent class**). `Dog`'s own body is empty on
   purpose, to prove inheritance alone accounts for everything that
   follows.
3. `Dog myDog = new Dog();` — **(b) reappearing** object creation from
   Lesson 01, now building a `Dog` specifically, not an `Animal`.
4. `myDog.name = "Rex";` — reaches a field `Dog` never declared itself —
   `name` belongs to `Animal`, and `Dog` inherited it automatically by
   extending `Animal`.
5. `myDog.makeSound();` — calls a method `Dog` never declared either;
   `makeSound()` belongs to `Animal`, inherited the same way `name` was.

### CS Lens

Inheritance establishes an **is-a** relationship, checked by the compiler:
a `Dog` genuinely *is an* `Animal`, not merely similar to one — anywhere
an `Animal` is expected, a `Dog` can be used instead, because it carries
every field and method `Animal` guarantees, plus whatever it adds of its
own.

Also recognized in: class inheritance in Python, C#, and C++ (nearly
identical mechanism to Java's), a UI toolkit's `Button` extending a more
general `View` or `Widget` base class, a biological taxonomy (a `Dog` is
a `Mammal` is an `Animal`) — the same nested-generality shape recurring.

### SE Lens

The alternative — writing `Cat` and `Dog` as fully separate classes, each
redeclaring `name` and a near-identical `makeSound()` — was not chosen
because shared structure duplicated across classes has to be kept in sync
by hand forever: adding a new shared field later means editing every
class that needs it, instead of editing the one shared parent once.
Inheritance's cost is real too — a subclass is now permanently coupled to
its parent's shape, and changing the parent can ripple into every
subclass — which is exactly why later units in this lesson (particularly
`sealing`) exist: to let a class deliberately opt out of being extended
when that coupling isn't wanted.

---

## Concept Unit: Method Overriding — Replacing Inherited Behavior

### The Problem

`Animal.makeSound()`'s generic message is a poor fit for a real `Dog` —
dogs don't make "a generic animal sound," they bark. Inheritance alone
only reuses a parent's behavior unchanged; some way is needed for a
subclass to keep everything else it inherited while replacing just this
one method with its own version.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
class Animal {
    String name;

    void makeSound() {
        System.out.println(name + " makes a generic animal sound.");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        System.out.println(name + " says Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.name = "Rex";
        myDog.makeSound();
    }
}
```

Compile and run it. The terminal prints:

```
Rex says Woof!
```

`Dog` now declares its own `makeSound()`, marked `@Override` — **first
appearance** of `method overriding`: a subclass supplying its own version
of a method its parent already defines, replacing the parent's behavior
for objects of the subclass's type. `myDog.makeSound()` now runs `Dog`'s
version, not `Animal`'s — the inherited method is completely replaced for
any `Dog`, while `name` is still inherited unchanged.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `@Override` — **(a) first appearance** of this **annotation**:
   metadata, read by the compiler, that isn't executed as code itself but
   asserts a claim the compiler actually checks — that this method really
   does override a method the parent class declares. It exists as a
   safety net: misspelling the method name below (`makeSond` instead of
   `makeSound`) would, without `@Override`, silently compile as an
   unrelated new method nothing ever calls; with `@Override` present, that
   same typo becomes a compile error instead, because the compiler can
   confirm no such method exists in `Animal` to override.
2. `void makeSound() { ... }` inside `Dog` — same method name and
   signature as `Animal`'s version, **(a) first appearance** of the
   overriding shape itself: declaring a method identical in name and
   parameters to one the parent already has.
3. `System.out.println(name + " says Woof!");` — reused println/field
   syntax, **(c)**.
4. `myDog.makeSound();` — calls the method; which version runs is the
   subject of the next unit specifically, since it isn't obvious just
   from this call site alone that it must be `Dog`'s version.

### CS Lens

Overriding is how a subclass **specializes** inherited behavior instead of
only ever reusing or fully replacing a parent wholesale. `Dog` keeps every
field and every other method `Animal` provides, and replaces exactly one
piece of behavior — the minimum possible change needed to make `Dog`
genuinely dog-like.

Also recognized in: overriding a base class method in Python (no `@`
marker required, since Python has no compiler to check it against), C#'s
`override` keyword (which, unlike Java's optional `@Override`, is
mandatory — a real, stricter contrast worth naming), any framework
callback a subclass customizes by overriding a method the framework's own
base class defines.

### SE Lens

The alternative — giving `Dog` a differently-named method,
`dogMakeSound()`, instead of overriding `makeSound()` — was not chosen
because it breaks the very thing inheritance was for: any code written
to call `.makeSound()` on an `Animal` would need to somehow know to call
`.dogMakeSound()` instead for a `Dog`, defeating the whole point of
treating `Dog` as a kind of `Animal`. Overriding keeps the method name
identical on purpose, so that calling code never needs to know or care
which specific subclass it's actually holding.

---

## Concept Unit: Dynamic Dispatch — Which Version Actually Runs

### The Problem

The previous unit called `makeSound()` through a variable declared as
`Dog` — unsurprising that `Dog`'s version ran. But the deeper, more
useful question is what happens when the *variable's declared type* is
the parent, `Animal`, while the *actual object* is still a `Dog`. Does
`Animal`'s generic version run, because that's the declared type — or
`Dog`'s overridden version, because that's what the object really is?

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
class Animal {
    String name;

    void makeSound() {
        System.out.println(name + " makes a generic animal sound.");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        System.out.println(name + " says Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal myAnimal = new Dog();
        myAnimal.name = "Rex";
        myAnimal.makeSound();
    }
}
```

Compile and run it. The terminal prints:

```
Rex says Woof!
```

`Animal myAnimal = new Dog();` declares `myAnimal` as type `Animal`, but
builds a real `Dog` — legal precisely because a `Dog` *is an* `Animal`,
per the first unit's inheritance relationship. `myAnimal.makeSound()`
still runs `Dog`'s overridden version, not `Animal`'s generic one, even
though the *variable* is declared `Animal`. This is `dynamic dispatch` —
**first appearance** (also called **polymorphism**): a method call
resolves to the actual runtime type of the object it's called on,
regardless of the type the holding variable was declared as.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Animal myAnimal = new Dog();` — **(a) first appearance** of this exact
   shape: a variable declared as the *parent* type, holding an object of
   the *child* type. Legal because of inheritance's is-a relationship,
   established in the first unit.
2. `myAnimal.makeSound();` — **(a) first appearance** of dynamic dispatch
   in action: at this line, Java does not look at `myAnimal`'s *declared*
   type (`Animal`) to decide which `makeSound()` to run. It looks at the
   *actual* object `myAnimal` refers to — a real `Dog` — and runs that
   object's version, `Dog`'s overridden one.

**Execution trace.** Which method body actually executes isn't visible
from the source text alone — a control-flow trace, not a changing-values
one:

1. `new Dog()` allocates a real `Dog` object and runs its (inherited,
   unmodified) constructor. This object's *actual* type, permanently, is
   `Dog` — that fact travels with the object itself, not with whatever
   variable happens to be holding it at any given moment.
2. `Animal myAnimal = ...` stores a reference to that `Dog` object in a
   variable declared as `Animal`. The variable's declared type restricts
   *which methods can be called through it* (only `Animal`'s declared
   methods — `myAnimal.someDogOnlyMethod()` would fail to compile even
   though the real object is a `Dog`), but does not change what the
   object underneath actually is.
3. `myAnimal.makeSound()` is called. Java resolves this at runtime by
   checking the real object's actual type — `Dog` — and finds that `Dog`
   overrides `makeSound()`. That overridden version runs, printing "Rex
   says Woof!", not `Animal`'s generic message.

### CS Lens

Dynamic dispatch is what makes overriding actually useful in practice —
without it, a method call's behavior would depend on the variable's
*declared* type, and every piece of code would need to know the exact
real type of every object it touches to predict what runs. This is
**runtime polymorphism**: the same line of code, `myAnimal.makeSound()`,
produces different real behavior depending on what object is actually
behind `myAnimal` at the moment it runs — a `Cat` there would bark... no,
would meow, with no change to the calling code at all.

Also recognized in: every framework that calls one method name on a base
type and gets each subclass's own behavior automatically (a UI toolkit
calling `draw()` on a list of different shape objects; Android calling
`onCreate()` on whatever specific `Activity` subclass the app declares),
virtual method dispatch in C++ (which, unlike Java, requires the
`virtual` keyword to opt in — Java dispatches dynamically by default).

### SE Lens

The alternative — writing code that checks "is this actually a `Dog`? a
`Cat`?" before deciding what to do — was not chosen, and dynamic dispatch
is precisely what makes that unnecessary: calling code writes
`myAnimal.makeSound()` once, and every current and future subclass's own
override runs correctly with zero changes to that calling code. This is
the mechanism behind every framework callback in the rest of this
curriculum — a framework calls one method name on a general type, and
each subclass's own override supplies the actual behavior, with the
framework never needing to know which subclass it's holding.

---

## Concept Unit: Runtime Type Narrowing — Going Back to the Specific Type

### The Problem

Once an object is referred to through its parent type — `Animal myAnimal
= new Dog();` — only `Animal`'s declared methods can be called through
that variable, even though the real object is a `Dog` with potentially
more of its own methods. Sometimes code genuinely needs to get back to
the specific type — to call a `Dog`-only method, for instance — and
needs a safe, checked way to do it, since simply *assuming* `myAnimal` is
a `Dog` could be wrong.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
class Animal {
    String name;
}

class Dog extends Animal {
    void fetch() {
        System.out.println(name + " fetches the ball!");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal myAnimal = new Dog();
        myAnimal.name = "Rex";

        if (myAnimal instanceof Dog) {
            Dog myDog = (Dog) myAnimal;
            myDog.fetch();
        }
    }
}
```

Compile and run it. The terminal prints:

```
Rex fetches the ball!
```

`myAnimal instanceof Dog` checks, at runtime, whether the real object
`myAnimal` refers to is actually a `Dog`. `(Dog) myAnimal` then performs
the cast: producing a new reference to the same object, declared as
`Dog`, through which `Dog`-only methods like `fetch()` become callable.
Together, this is `runtime type narrowing` — **first appearance**:
checking a variable's actual runtime type and then explicitly narrowing
its declared type to a more specific one, verified rather than assumed.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class Dog extends Animal { void fetch() { ... } }` — `Dog` now
   declares a method `Animal` does not have, **(c)** reusing method
   declaration syntax from Lesson 02.
2. `myAnimal instanceof Dog` — **(a) first appearance** of `instanceof`: a
   check, evaluated at runtime, returning `true` if the object `myAnimal`
   actually refers to is a `Dog` (or any further subclass of `Dog`), and
   `false` otherwise — checked against the object's real type, never its
   variable's declared type.
3. `(Dog) myAnimal` — **(a) first appearance** of a **cast**: an explicit
   instruction telling the compiler "trust me, treat this `Animal`
   reference as a `Dog` reference from here on." Written inside the
   `instanceof` check specifically because an incorrect cast — narrowing
   to a type the object isn't actually an instance of — fails at runtime
   with a `ClassCastException`, not silently; checking first is what
   makes the cast safe.
4. `Dog myDog = (Dog) myAnimal;` — stores the newly-cast reference in a
   variable now declared as `Dog`, through which `fetch()` becomes
   callable.

### CS Lens

Runtime type narrowing is the explicit escape hatch a statically-typed
language needs to go from a general declared type back to a specific one
— the compiler alone, looking only at declared types, cannot know that
`myAnimal` really holds a `Dog`; only a runtime check can confirm it.
Python's dynamic typing never creates this exact problem in the first
place, since a Python variable never has a fixed declared type to narrow
away from — every variable already refers to whatever it actually refers
to, with no separate "declared type" layer to reconcile.

Also recognized in: `isinstance()` in Python (checking, not narrowing,
since Python doesn't separately track declared types), `is`/`as` in C#
(a closer structural equivalent — `is` mirrors `instanceof`, `as` performs
a null-returning cast instead of throwing), any type-checked language's
"downcast" operation generally.

### SE Lens

The alternative — casting without checking first, `Dog myDog = (Dog)
myAnimal;` with no `instanceof` guard — was not chosen because an
incorrect cast throws a `ClassCastException` at runtime, crashing the
program at exactly that line if the object turns out not to actually be a
`Dog`. Checking with `instanceof` first trades a small amount of extra
code for a program that degrades safely (skipping the `if` block) instead
of crashing, when the assumption turns out to be wrong.

---

## Concept Unit: Sealing a Method or Class — Preventing Further Inheritance

### The Problem

Inheritance and overriding are powerful specifically because a subclass
can replace almost anything a parent defines — but sometimes that
flexibility is exactly what shouldn't be allowed. A method whose
correctness depends on running exactly as written — a security check, a
core invariant — being silently overridable by some future subclass is a
real risk, not a hypothetical one. Java needs a way to say "this method,
or this entire class, cannot be extended or replaced, ever."

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
class Animal {
    final void breathe() {
        System.out.println("Breathing.");
    }
}

class Dog extends Animal {
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.breathe();
    }
}
```

Compile and run it. The terminal prints:

```
Breathing.
```

`final void breathe() { ... }` is `sealing a method` — **first
appearance**: marking a method as un-overridable, a deliberate
restriction on future inheritance. `Dog` inherits `breathe()` normally —
`final` does not block inheritance itself — but no subclass of `Animal`,
including `Dog`, is allowed to declare its own `breathe()` that overrides
this one; attempting it is a compile error, tried directly in this
lesson's exercises.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `final void breathe() { ... }` — **(a) first appearance** of `final`
   applied to a method: this exact method body is guaranteed to run for
   every `Animal` and every subclass of it, because no subclass is
   permitted to override it.
2. `class Dog extends Animal { }` — **(b) reappearing** inheritance,
   unaffected by `breathe()` being sealed; `Dog` still inherits and can
   still call `breathe()` normally, it just cannot *replace* it.
3. `myDog.breathe();` — calls the inherited, sealed method; reused
   method-call syntax, **(c)**.

`final` can also mark an entire class, not just one method — `final class
Dog { }` would mean no class at all may `extend Dog`, sealing the whole
type against further inheritance rather than sealing one method within
it. Both uses share the same underlying idea: a deliberate, compiler-
enforced stop on future overriding or subclassing.

### CS Lens

Sealing trades away flexibility for a guarantee: once a method or class is
`final`, every caller can trust its exact behavior will never be silently
replaced by some future subclass they don't know about. This is a
different guarantee from `final` on a variable (covered in a later
lesson, which prevents *reassignment* of a value) — sealing a method or
class is about preventing *behavior* from being replaced, a genuinely
different meaning carried by the same keyword.

Also recognized in: `sealed`/`sealed override` in C# (a separate keyword
from C#'s own value-immutability keywords, unlike Java's single `final`
covering both meanings — a real, worth-noting contrast), `final` classes
throughout the Java standard library (`String` itself is `final`,
specifically so no code anywhere can subclass it and change what a
`String` fundamentally guarantees).

### SE Lens

The alternative — leaving every method freely overridable, always — was
not chosen for methods whose correctness the rest of a class depends on:
an unsealed `breathe()` could be silently replaced by a subclass with a
version that breaks some invariant the rest of `Animal` assumes still
holds. Sealing costs real flexibility — a legitimate future subclass that
genuinely needed to customize `breathe()` now cannot — which is exactly
why it's a deliberate, occasional choice, not a default: most methods in
this curriculum going forward are left unsealed, specifically because
most are actually meant to be customized by subclasses.

---

## Connect the Pieces

One value traced through every unit in this lesson: `Dog extends Animal`
establishes that a `Dog` genuinely is an `Animal` (inheritance); `Dog`
overrides `makeSound()` to bark instead of making a generic sound (method
overriding); calling `makeSound()` through a variable declared as
`Animal` but actually holding a `Dog` still runs `Dog`'s version, because
dispatch is resolved against the real object, not the declared type
(dynamic dispatch); getting back to `Dog`-only behavior like `fetch()`
from an `Animal`-typed reference requires an explicit, checked
`instanceof`-and-cast (runtime type narrowing); and any of this can be
deliberately shut off for one method or one whole class with `final`
(sealing), when replaceability is a risk rather than a feature.

## What Breaks Without This

Try to override the sealed method from the last unit:

```java
class Dog extends Animal {
    @Override
    void breathe() {
        System.out.println("Panting.");
    }
}
```

This fails to compile with an error resembling:

```
error: breathe() in Dog cannot override breathe() in Animal
overridden method is final
    void breathe() {
         ^
```

`@Override` here is doing exactly the job it was introduced for: without
it, this mistake could still fail (Java checks `final` regardless), but
`@Override` makes the *intent* explicit, so the resulting error is about
`final` specifically, not a mysterious "unrelated new method" situation.
This is concrete proof that `final` isn't a soft suggestion — there is no
way to override a sealed method, full stop, caught at compile time before
the program ever runs.

## Exercises

1. Add a `Cat` class, also extending `Animal`, with its own overridden
   `makeSound()` that prints a meow. Build an `Animal myAnimal = new
   Cat();` and confirm dynamic dispatch calls `Cat`'s version.
2. Add an array or a few separate variables holding a mix of `Dog` and
   `Cat` objects, all declared as `Animal`, and call `makeSound()` on each
   through a loop — confirming each one's *own* overridden version runs,
   not a shared one.
3. Try `(Dog) myAnimal` without an `instanceof` check first, on an
   `Animal` that's actually a `Cat`, and read the real
   `ClassCastException` this produces at runtime — then add the
   `instanceof` guard back.
4. Try overriding the sealed `breathe()` method yourself, read the real
   compiler error, then remove the attempted override.

## Definition of Done

- [ ] You ran all versions of `Main.java` in this lesson and saw each
      one's real output.
- [ ] You deliberately tried overriding a sealed method, saw the real
      "overridden method is final" compiler error, and removed the
      attempt.
- [ ] You deliberately triggered a real `ClassCastException` from an
      unguarded cast and saw the actual exception message.
- [ ] You completed Exercise 2 and can explain, in your own words, why
      the loop's single `.makeSound()` call site produces different
      output per object without checking any type itself.
- [ ] You can state, without looking back at this lesson, the difference
      between method overriding and dynamic dispatch.
