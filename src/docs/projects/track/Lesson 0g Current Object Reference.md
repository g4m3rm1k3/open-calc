# Lesson 0g: The Current Object Reference — `this`

**What you will build:** A standalone, throwaway lab, reusing the `Dog`
class.

**What you need to know first:** Lesson 0f's constructor.

**Terms introduced in this lesson:**

- **Current object reference (`this`)** — an implicit reference,
  available inside any instance method or constructor, to the object
  currently being operated on.

---

## Concept Unit: The Current Object Reference — `this`

### The Problem

Lesson 0f's constructor deliberately used `dogName`/`dogAge` instead of
`name`/`age` as parameter names, specifically to dodge a problem: what
happens when a constructor parameter is named exactly the same as the
field it's meant to initialize? That's not a hypothetical — matching a
parameter's name to the field it sets is the natural, common way to
write a constructor, and Java needs a way to say "the field, not the
parameter" when both share one name.

### Introduce the Concept in Isolation

```
mkdir lesson-0g
cd lesson-0g
```

Create `Main.java`:

```java
class Dog {
    String name;
    int age;

    Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    void describe() {
        System.out.println(name + " is " + age + " years old.");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog("Rex", 3);
        myDog.describe();
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
Rex is 3 years old.
```

Same output as before — but the constructor's parameters are now named
identically to the fields (`name`, `age`), which is only possible
because of `this.name` / `this.age`. `this` is the `current object
reference` — **first appearance**: an implicit reference, available
inside any instance method or constructor, to the object currently
being operated on. Inside this constructor, `this` refers to whichever
`Dog` is actually being built — `this.name = name;` reads as "the new
object's own `name` field gets the value of the plain local variable
`name`," which is the constructor's parameter, not the field.

### Discard the Throwaway Example

This version is deleted now. `this` is understood and carried forward
without re-explanation from here.

### Mechanical Walkthrough

1. `Dog(String name, int age) { ... }` — same constructor shape as
   Lesson 0f, but the parameters are now named `name` and `age`,
   identical to the fields. Without `this`, `name = name;` inside the
   body would assign the parameter to itself and leave the field
   untouched — a real, silent bug this exact shape would otherwise
   cause.
2. `this.name = name;` — **(a) first appearance** of `this` used to
   disambiguate. Left of `=`: `this.name`, the current object's field.
   Right of `=`: `name`, the plain local parameter (Java always resolves
   an unqualified name to the *closest* matching declaration, which is
   the parameter here, not the field — this is why the qualifier is
   required at all). `this.age = age;` follows the identical shape.

#### Execution Trace

No loop or repeated construction here — the trace that matters is
*which* `name` each side of the assignment refers to, which isn't
visible from the values alone:

1. `new Dog("Rex", 3)` is called — a new `Dog` object is allocated, and
   its constructor starts running with `this` bound to that new object,
   the parameter `name` bound to `"Rex"`, and the parameter `age` bound
   to `3`.
2. `this.name = name;` runs — `this.name` (the new object's field,
   currently unset) is assigned the value of the local variable `name`
   (the parameter, `"Rex"`). After this line, the object's own `name`
   field holds `"Rex"`; the parameter `name` is unaffected by the
   assignment, it was only ever the *source* of the value.
3. `this.age = age;` runs the same way — the object's `age` field is set
   to `3` from the parameter `age`.
4. The constructor finishes; `myDog` now refers to a fully-initialized
   `Dog` whose fields were set from `this`-qualified assignments, not
   from the bare parameters directly.

### CS Lens

`this` is how a method or constructor refers to *its own receiver* —
the specific object it's currently running against — without that
object being an explicit parameter anywhere in the method's declared
signature. Every instance method secretly has access to this reference;
Java just never requires writing it out except when a name collision,
like this one, makes it necessary to disambiguate.

Also recognized in: `self` in Python (the direct equivalent, except
Python requires writing it as an explicit first parameter on every
method, where Java makes it implicit), `this` in C++, C#, and
JavaScript — nearly every object-oriented language has some name for
exactly this concept.

### SE Lens

The alternative — keeping Lesson 0f's mismatched parameter names
(`dogName`/`dogAge`) forever, specifically to avoid ever needing `this`
— was not chosen going forward because it doesn't scale: a class with
ten fields would need ten awkwardly-renamed parameters, each one a
small, permanent readability cost paid to dodge a problem `this` solves
directly.

---

## Connect the Pieces

Lesson 0f's constructor dodged the name-collision problem by using
different parameter names. This lesson solved it directly: `this.name`
and `this.age` disambiguate the object's own field from the constructor
parameter, even when both share the exact same name.

## What Breaks Without This

Remove `this` from the constructor, keeping the matching parameter
names:

```java
Dog(String name, int age) {
    name = name;
    age = age;
}
```

This compiles with no error at all — and that's exactly the danger. Run
it yourself and see the real output: `null is 0 years old.` `name =
name;` assigns the parameter to itself; the field `name` is never
touched, and stays at its default value, `null`. No compiler error, no
crash — just silently wrong data.

## Exercises

1. Deliberately remove `this` as shown above, run the program, and
   confirm you see the real `null is 0 years old.` output, then restore
   it.
2. Add a method `void haveBirthday()` that increments `age` by one,
   using `this.age = this.age + 1;`. Call it twice on the same `Dog`
   and confirm `age` increases both times.
3. Explain, in your own words, why `this.name = name;` and `name =
   name;` behave completely differently even though they look similar.

## Definition of Done

- [ ] You ran the example and saw the real output.
- [ ] You completed Exercise 1 and observed the silent `null is 0 years
      old.` bug firsthand.
- [ ] You can state, in one sentence, why `this` was needed once
      parameter names started matching field names.
