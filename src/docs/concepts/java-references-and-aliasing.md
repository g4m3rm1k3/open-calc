# Concept: Java References and Aliasing

**What you'll understand by the end:** what a Java variable of a class
type actually holds (not the object itself), and what happens when two
variables end up pointing at the same one.

**Prerequisites:** basic classes and `new` (any "a class is a blueprint,
`new` builds a real object" introduction).

## Setup

```
mkdir refdemo && cd refdemo
```
No dependencies beyond a JDK — compile and run with plain `javac`/`java`.

## The Problem

`Lightbulb kitchenBulb = new Lightbulb();` looks like it stores "a
lightbulb" directly inside the variable — the same way `int count = 5;`
stores the number `5` directly. For an object, that's not what actually
happens, and the difference matters the moment two variables end up
referring to the same object.

## The Isolated Example

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

```
javac AliasDemo.java
java AliasDemo
```

**Real output:**
```
original: on
alias: on
```

**What this proves:** `Lightbulb alias = original;` does not build a
second `Lightbulb` object — there is no `new` on that line at all. It
copies `original`'s **reference** — the pointer to the one existing
object — into `alias`. Both variables now point at the exact same
object. Calling `alias.turnOn()` changes that one shared object's
`isOn` field, and `original` — a completely different variable — sees
the change immediately, because `original` and `alias` were never two
separate lightbulbs; they're two names for the same one. This situation
is called **aliasing**.

## Mechanical Walkthrough

- `Lightbulb original = new Lightbulb();` — `new Lightbulb()` allocates
  a real, individual object and returns a **reference** to it, stored in
  `original`.
- `Lightbulb alias = original;` — copies the *value stored in*
  `original` (a reference) into `alias`, the same way `int y = x;`
  copies whatever number `x` holds — no object is built here.
- `alias.turnOn()` — reaches through `alias`'s reference, which now
  points at the same object `original` does, and mutates that one
  object's field.
- `original.describe()` — reads the same object `alias` just mutated,
  proving aliasing directly rather than just naming it.

## CS Lens

This is **reference semantics** — as opposed to **value semantics**,
where copying a variable genuinely duplicates its contents. Also
recognized in: Python's own object model (`list1 = list2` aliases two
names to one list), JavaScript objects and arrays (identical behavior),
C#'s reference types.

## SE Lens

Why default to reference semantics for objects instead of always
copying? Copying an entire object every time it's assigned or passed to
a method would be correct but wasteful — imagine copying a whole large
list every time it's handed to a method that only reads one item from
it. Reference semantics keeps passing an object around cheap (copying a
pointer, not the object's contents), and lets two different parts of a
program deliberately share and collaborate on one real piece of state.

## Connection

Contrast directly with a language's primitive/value types (an `int`
copying its raw value, never aliasing) — the same distinction a value
type vs. reference type comparison always comes down to.

## Try It Yourself

1. Add a third variable, `Lightbulb secondAlias = alias;`, after
   `alias` is turned on. Confirm `secondAlias.describe()` also reports
   `"on"` — a reference can be copied more than once, every copy still
   pointing at the same object.
2. Change `Lightbulb alias = original;` to `Lightbulb alias = new
   Lightbulb();` instead (an honestly separate object) and rerun.
   Confirm `original` now reports `"off"` — turning on `alias` has zero
   effect on a genuinely separate object, direct proof the previous
   version's shared behavior came specifically from aliasing.
