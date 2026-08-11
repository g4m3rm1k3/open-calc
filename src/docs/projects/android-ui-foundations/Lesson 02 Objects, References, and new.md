# Lesson 02: Objects, References, and `new`

**What you will build:** Nothing app-related yet — a disposable, bare-Java
example proving what actually happens in memory when an object is
created, and a fact about variables that Java shares with Python and
JavaScript but that no beginner tutorial in any of those languages
tends to state out loud. The transferable problem: this project is about
to build dozens of objects — screens, widgets, list items — and nearly
every confusing bug in object-oriented code traces back to one
misunderstanding: that a variable holding an object *is* the object,
rather than a pointer to one that might be shared, or missing entirely.

**What you need to know first:** Lesson 01 (`class`, methods, `public`,
`static`, the compile-then-run model).

**Terms introduced in this lesson:**
- **Instance / object** — an actual, individual thing built from a class
  (the blueprint), holding its own copy of the class's fields.
- **Reference** — the value a variable of a class type actually holds:
  not the object itself, but a pointer to where that object really lives.
- **Aliasing** — two different variables holding the exact same
  reference, meaning both point at one shared object rather than two
  independent copies.

**Objects and methods used:** `new`, references, and aliasing are this
lesson's own subject, given full treatment below.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`System.out.println(...)`**
  - *What it is:* Java's `static` print-to-standard-output method.
  - *Implementation:* given full treatment in Lesson 01.
  - *Its use:* prints each demo's real output in this lesson's own labs,
    exactly as before.

---

## Concept Unit: A Class Is a Blueprint; an Object Is a Real Thing Built From It

### The Problem

`class` has been used since Lesson 01 as "the container code lives
in," which is true but incomplete. A class is also a **blueprint** — a
description of what fields and methods something will have — and by
itself, a blueprint isn't a thing you can use. A blueprint for a house
is not a house. Something has to actually *build* a real instance from
that blueprint before there's anything to work with, and Java has one
specific keyword that does exactly that.

### Introduce the Concept in Isolation

```java
class Lightbulb {
    private boolean isOn = false;

    void turnOn() {
        isOn = true;
    }

    String describe() {
        return isOn ? "on" : "off";
    }
}

public class ObjectDemo {
    public static void main(String[] args) {
        Lightbulb kitchenBulb = new Lightbulb();
        Lightbulb bedroomBulb = new Lightbulb();

        kitchenBulb.turnOn();

        System.out.println("Kitchen: " + kitchenBulb.describe());
        System.out.println("Bedroom: " + bedroomBulb.describe());
    }
}
```

Compile and run:

```
javac ObjectDemo.java
java ObjectDemo
```

Real output:

```
Kitchen: on
Bedroom: off
```

#### Execution Trace

1. `Lightbulb kitchenBulb = new Lightbulb();` — `new Lightbulb()`
   allocates a brand-new `Lightbulb` **object** in memory (its own,
   independent `isOn` field, starting `false` per the field's own
   declaration) and hands back a **reference** to it, stored in
   `kitchenBulb`.
2. `Lightbulb bedroomBulb = new Lightbulb();` — a second, independent
   call to `new Lightbulb()`, because `new` always allocates a fresh
   object — `bedroomBulb` gets its own separate `isOn` field, unrelated
   to `kitchenBulb`'s.
3. `kitchenBulb.turnOn();` — reaches through `kitchenBulb`'s own
   reference and sets *that specific object's* `isOn` to `true`.
   `bedroomBulb`'s object is untouched, since `kitchenBulb` and
   `bedroomBulb` reference two different objects, not one shared one.
4. `kitchenBulb.describe()` — reads `kitchenBulb`'s own `isOn`
   (`true`, from step 3) and prints `"on"`.
5. `bedroomBulb.describe()` — reads `bedroomBulb`'s own `isOn` — still
   `false`, because step 3 never touched it — and prints `"off"`.

### Mechanical Walkthrough

- `class Lightbulb { ... }` — the **blueprint**: it says every
  `Lightbulb` will have an `isOn` field, a `turnOn` method, and a
  `describe` method — but declaring it builds zero actual lightbulbs.
- `new Lightbulb()` — a **constructor call** (a plain, no-argument one
  here — a version that accepts arguments gets its own full lesson once
  this project needs one). It does two distinct things: allocates a
  real, individual `Lightbulb` object in memory, and hands back a
  **reference** — a value that lets you reach that specific object
  later.
- `Lightbulb kitchenBulb = ...` / `Lightbulb bedroomBulb = ...` — each
  stores the reference `new Lightbulb()` just returned into its own
  variable; two separate `new` calls, so two separate objects, as the
  Execution Trace above proves directly rather than just asserts.
- `kitchenBulb.turnOn()` / `kitchenBulb.describe()` — the `.` reaches
  through `kitchenBulb`'s own reference to call a method on *that
  specific object* — never on `bedroomBulb`'s.

### CS Lens

An object being a real, individual allocation with its own state, built
from a shared, reusable blueprint (the class), is the foundational idea
of **object-oriented programming** — a paradigm this whole project is
written in, as opposed to, say, a style where all data lives in loose,
unstructured variables and functions operate on it from outside with no
bundling at all.

Also recognized in: every object-oriented language's own instantiation
syntax (Python's `Lightbulb()`, JavaScript's `new Lightbulb()`, C#'s `new
Lightbulb()`), and, more generally, any system distinguishing a
*template* (a class, a recipe, a blueprint) from the *specific things*
built from it (a cake, a house, an object).

### SE Lens

Why does a class have to be built up through an explicit `new` call at
all, rather than a program just declaring "one `Lightbulb`" directly the
way it declares an `int`? Because a program routinely needs an unknown
number of objects of the same kind, decided at runtime — zero
lightbulbs, three, a hundred — and a class describes the *shape*
every one of them will share without committing to how many will ever
actually exist. `new` is the one, explicit moment that turns "a shape
that could exist" into "a real, specific instance that now does," which
is exactly why it's a distinct step from writing the class itself.

---

## Concept Unit: A Variable Holds a Reference, Not the Object Itself

### The Problem

`Lightbulb kitchenBulb = new Lightbulb();` looks, at a glance, like it
stores "a lightbulb" directly inside the variable `kitchenBulb` — the
same way `int count = 5;` stores the number `5` directly. This is
**not** what actually happens for objects, and the difference matters
the moment two variables ever refer to the same object.

### Introduce the Concept in Isolation

Extend the same disposable `Lightbulb` class with one more scratch
example:

```java
public class AliasDemo {
    public static void main(String[] args) {
        Lightbulb original = new Lightbulb();
        Lightbulb alias = original;

        alias.turnOn();

        System.out.println("original: " + original.describe());
        System.out.println("alias: " + alias.describe());
    }
}
```

Compile and run (in the same folder as the `Lightbulb` class above):

```
javac AliasDemo.java
java AliasDemo
```

Real output:

```
original: on
alias: on
```

`Lightbulb alias = original;` does **not** build a second `Lightbulb`
object — there is no `new` on this line at all. It copies `original`'s
**reference** — the pointer to the one existing object — into `alias`.
Both variables now point at the exact same object in memory. Calling
`alias.turnOn()` changes that one shared object's `isOn` field, and
`original` — a completely different variable — sees the change
immediately, because `original` and `alias` were never two separate
lightbulbs to begin with; they're two names for the same one. This
specific situation — two variables referencing one shared object — is
called **aliasing**.

### Mechanical Walkthrough

- `Lightbulb original = new Lightbulb();` — the same mechanism as the
  previous unit: one real object, one reference, stored in `original`.
- `Lightbulb alias = original;` — **first appearance of copying a
  reference without `new`.** No object is built here at all — this
  copies the *value stored in* `original` (a reference) into `alias`,
  the same way `int y = x;` copies whatever number `x` holds into `y`.
  What's being copied is the pointer, not the thing it points to.
- `alias.turnOn()` — reaches through `alias`'s reference — which, after
  the line above, points at the exact same object `original` does — and
  mutates that one object's `isOn` field.
- `original.describe()` — reads `isOn` off the same object `alias` just
  mutated, because `original` and `alias` were never separate objects
  to begin with — proving aliasing directly, not just naming it.

### Discard the Throwaway Example

`Lightbulb`, `ObjectDemo`, and `AliasDemo` are deleted now — they never
enter the real project. The mechanism they proved — `new` builds a real
object and hands back a reference; assignment between object-typed
variables copies the reference, not the object — carries forward into
every object this project builds from here on, including ones built
much later where two different classes end up holding a reference to
the exact same shared list. Both labs in this lesson are also available
as a standalone concept file, `java-references-and-aliasing.md`, for a
quick refresher later without re-reading this whole lesson.

### CS Lens

A variable holding a reference rather than the value itself is
**reference semantics** — as opposed to **value semantics**, where
copying a variable genuinely duplicates its contents (proven distinctly
for Java's own primitive types in the next lesson). Aliasing is the
direct, sometimes surprising consequence of reference semantics: mutating
an object through one reference is visible through every other reference
to that same object, because there was only ever one object.

Also recognized in: Python's own object model (`list1 = list2` aliases
two names to one list, exactly like this lesson's `Lightbulb`), JavaScript
objects and arrays (identical behavior), and — the practical reason this
lesson exists this early — any later Java code where one object is
deliberately handed to two different places specifically *so* they stay
in sync, which this project relies on more than once.

### SE Lens

**Why does Java (and most object-oriented languages) default to
reference semantics for objects instead of always copying?** Copying an
entire object every time it's assigned or passed to a method would be
correct but wasteful — imagine copying an entire large list every time
it's handed to a method that just needs to read one item from it.
Reference semantics means passing an object around is always cheap (just
copying a pointer, not the object's whole contents) and, as a deliberate
consequence, lets two different parts of a program share and
collaborate on one real piece of state on purpose — exactly the shape a
later lesson in this series uses when one screen's data list needs to
stay in sync with the code that displays it.

---

## Connect the Pieces

One trace: `new Lightbulb()` allocated one real object and returned a
reference to it, stored in `original`. `Lightbulb alias = original`
copied that reference — not the object — into a second variable.
Calling a method through either variable reaches the same one object,
because reference semantics means there was only ever one to reach.

## What Breaks Without This

Change `Lightbulb alias = original;` to `Lightbulb alias = new
Lightbulb();` instead (an honestly separate object this time) and rerun.
Real output:

```
original: on
alias: off
```

Turning on `alias` now has zero effect on `original` — direct, observed
proof that the *previous* version's shared behavior came specifically
from aliasing one shared object, not from some general property of
`Lightbulb` itself.

## Exercises

1. Add a third variable, `Lightbulb secondAlias = alias;`, after `alias`
   is turned on. Confirm `secondAlias.describe()` also reports `"on"` —
   proving a reference can be copied more than once, with every copy
   still pointing at the same one object.
2. Write a `resetTo(Lightbulb other)` method-shaped thought experiment
   (no need to actually implement it): if `Lightbulb` had a method that
   reassigned its *own* internal reference to point somewhere else,
   would that affect variables that already aliased it? Reason through
   it, then explain in your own words why reassigning a variable is
   different from mutating the object it currently points to.

## Definition of Done

- [ ] You ran both labs yourself and saw the real, contrasting output.
- [ ] You can explain, in your own words, the difference between "two
      variables holding two separate objects" and "two variables
      aliasing one shared object."
- [ ] You can state what `new` actually does, in two parts: allocate, and
      return a reference.
- [ ] Commit: not applicable — both examples are throwaway labs.

Next: primitive types like `int` — which, unlike everything in this
lesson, do **not** work this way at all.
