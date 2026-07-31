# Lesson 0b: Nested Classes — A Class Declared Inside Another

**What you will build:** A standalone, throwaway lab — a `Dog`/`Collar`
example, run outside Pocket Inventory.

**What you need to know first:** Lesson 0a's `class`.

**Terms introduced in this lesson:**

- **Nested class** — a class declared entirely inside another class's
  braces, referred to from outside via a dot-qualified `Outer.Inner`
  name.

---

## Concept Unit: Nested Classes — A Class Declared Inside Another

### The Problem

Sometimes a class only makes sense in the context of exactly one other
class, and has no meaningful identity outside it — a single dog's
collar, say, is not something any other kind of object would ever need
to build or reference. Declaring it as a fully separate, top-level class
works, but puts a name in the global namespace of the program for
something that is never used anywhere except inside `Dog`. Java has a
more precise way to express "this class belongs entirely to that one."

### Introduce the Concept in Isolation

```
mkdir lesson-0b
cd lesson-0b
```

Create `Main.java`:

```java
class Dog {
    String name;

    class Collar {
        String color;

        void describe() {
            System.out.println(name + "'s collar is " + color);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.name = "Rex";

        Dog.Collar myCollar = myDog.new Collar();
        myCollar.color = "red";
        myCollar.describe();
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
Rex's collar is red
```

`class Collar { ... }`, declared entirely inside `Dog`'s braces, is a
`nested class` — **first appearance**: a class with no meaningful
identity outside its enclosing class, referred to from outside via the
dot-qualified name `Dog.Collar`, never just `Collar` alone.

### Discard the Throwaway Example

This `Collar` example is deleted now. It will not appear again — its
only job was to make the nested-class relationship observable in the
smallest possible program.

### Mechanical Walkthrough

1. `class Collar { ... }`, written inside `Dog`'s braces — **(a) first
   appearance.** A **nested class**: `Collar` exists only as a member of
   `Dog`, the same way `name` is a field member of `Dog`.
2. `String name;` inside `Collar`'s `describe()` method — genuinely basic
   field access, except for one new fact: `describe()` is a method of
   `Collar`, yet it reads `name`, a field that belongs to `Dog`, with no
   `Dog.` qualifier anywhere in sight. This works because a non-static
   nested class (the default, and the only kind this unit covers) is
   silently built holding a reference back to the specific `Dog` object
   that created it — `describe()` can reach that enclosing object's
   fields directly.
3. `Dog.Collar myCollar = myDog.new Collar();` — **(a) first appearance**
   of this exact syntax shape. `Dog.Collar` is the dot-qualified type
   name from outside `Dog`. `myDog.new Collar()` is not the ordinary
   `new Collar()` — it explicitly names *which* `Dog` this new `Collar`
   belongs to, `myDog`, which is exactly the enclosing object
   `describe()` will reach back into for `name`.
4. `myCollar.color = "red";` and `myCollar.describe();` — reused,
   already-established field-access and method-call syntax.

### CS Lens

A nested class expresses a **has-a**, belongs-to relationship at the
language level, not just by convention or naming. `Collar` is not merely
*named* like it's part of `Dog` — the compiler enforces that a `Collar`
cannot be built without an enclosing `Dog` to belong to (`myDog.new
Collar()` requires a real `Dog` object on the left of `.new`).

Also recognized in: any UI toolkit's inner "Builder" or "ViewHolder" type
that's only ever meaningful attached to its outer component, a parser's
inner "Token" type meaningful only inside that specific parser, any
language's convention for scoping a helper type to the one class that
actually uses it.

### SE Lens

The alternative — making `Collar` a fully separate, top-level class —
was not chosen because it would put a name in the program's global
namespace (`Collar`) for something that is never meaningfully used
except through a `Dog`. A reader scanning the list of top-level classes
in a large program benefits from that list only containing things that
genuinely stand alone; burying `Collar` inside `Dog` communicates,
structurally, "you will never need this by itself." The cost: a nested
class is slightly more ceremony to construct from outside (`myDog.new
Collar()` instead of `new Collar()`), a small, deliberate tradeoff
traded for that clarity.

---

## Connect the Pieces

Lesson 0a's `Dog` showed that a class is a blueprint and `new` builds
independent objects from it. This lesson showed that a class can itself
be declared *inside* another class's blueprint, restricting who can ever
build one. `Dog.Collar`, nested inside `Dog`, describes what every collar
has (`color`), and `myDog.new Collar()` builds one real collar tied
specifically to `myDog` — reachable only because a `Dog` already existed
to build it from.

## What Breaks Without This

Try building a `Collar` without a `Dog` at all — write `new Collar();`
with no `myDog.` prefix, outside of any `Dog`. Compile it yourself to see
the real compiler error, naming the exact requirement this lesson
described: an enclosing instance is required to construct a non-static
nested class.

## Exercises

1. Add a second field to `Collar`, `String material`, set it, and print
   it from `describe()` alongside `color`, confirming a nested class can
   hold more than one field exactly like a top-level class can.
2. Add a second `Dog`, with its own `Collar`, and confirm each collar's
   `describe()` output names its own dog, not the other one's.
3. Delete `myDog.` from `myDog.new Collar()`, leaving just
   `new Collar();`, and read the real compiler error this produces.

## Definition of Done

- [ ] You ran the `Dog.Collar` example yourself and saw `Rex's collar is
      red` printed.
- [ ] You completed Exercise 3 and saw the real compiler error for
      building a `Collar` with no enclosing `Dog`.
- [ ] You can state, without looking back at this lesson, why
      `Dog.Collar` cannot be constructed without a `Dog` object to
      belong to.
