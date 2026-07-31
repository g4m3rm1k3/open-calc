# Lesson 0d: Object Creation (Instantiation)

**What you will build:** A standalone, throwaway lab, reusing Lesson
0c's `Dog` class.

**What you need to know first:** Lesson 0c's `object`.

**Terms introduced in this lesson:**

- **Instantiation (object creation)** — the act of constructing a new
  object from a class's blueprint, allocating its own storage.

---

## Concept Unit: Object Creation (Instantiation)

### The Problem

Lesson 0c named `myDog` — the real, built thing — an object. But nothing
so far has named the actual *act* that builds one, or explained what
that act actually does at the moment it runs.

### Introduce the Concept in Isolation

```
mkdir lesson-0d
cd lesson-0d
```

Create `Main.java`:

```java
class Dog {
    String name;
    int age;
}

public class Main {
    public static void main(String[] args) {
        Dog firstDog = new Dog();
        Dog secondDog = new Dog();

        firstDog.name = "Rex";
        secondDog.name = "Fido";

        System.out.println(firstDog.name);
        System.out.println(secondDog.name);
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
Rex
Fido
```

#### Execution Trace

Trace of the two `new Dog()` calls:

1. `new Dog()` (first call) — allocates a real, independent block of
   storage for one `Dog`'s own `name`/`age` fields; `firstDog` refers to
   it.
2. `new Dog()` (second call) — allocates a *second*, separate block of
   storage, entirely independent of the first; `secondDog` refers to
   this one.
3. `firstDog.name = "Rex";` — writes only into the first block.
4. `secondDog.name = "Fido";` — writes only into the second block,
   leaving the first block's `name` (`"Rex"`) untouched.

Two separate calls to `new Dog()` each perform `instantiation` — **first
appearance** (also called **object creation**): the moment a real,
concrete `Dog` gets built from the blueprint, with its own storage for
`name` and `age`, separate from any other `Dog` that might ever be
built. `firstDog` and `secondDog` are two independent objects — setting
`secondDog.name` never touches `firstDog.name`, real proof each `new
Dog()` call allocated its own, separate storage.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Dog firstDog = new Dog();` — **(a) first appearance**: `new Dog()`
   allocates storage for one real `Dog` object's own `name` and `age`
   fields; `firstDog` refers to it.
2. `Dog secondDog = new Dog();` — a second, entirely separate call to
   `new Dog()`, allocating a *second*, independent block of storage;
   `secondDog` refers to this one, not the first.
3. `firstDog.name = "Rex";` then `secondDog.name = "Fido";` — each
   assignment reaches only its own object's storage.
4. `println(firstDog.name)` prints `Rex`; `println(secondDog.name)`
   prints `Fido` — proof the two `new Dog()` calls produced genuinely
   separate objects, not two names for the same one.

### CS Lens

Instantiation is the one specific moment a class's description stops
being merely a description and becomes real, addressable data in memory.
Every object this curriculum ever builds — a `Dog`, an `Item`, an
`Activity` — comes into existence at exactly one `new` call, never
gradually or implicitly.

Also recognized in: `new` in virtually every mainstream object-oriented
language, object construction in Python (`Dog()`, no `new` keyword but
the identical underlying act), row insertion in a database (a schema
plus one `INSERT` producing one real row).

### SE Lens

Two separate `new Dog()` calls, rather than one `Dog` object reused and
overwritten, is what allows `firstDog` and `secondDog` to coexist and be
compared, printed, or modified independently — reusing a single object
for both would make it impossible to ever hold two dogs' data at the
same time.

---

## Connect the Pieces

Lesson 0c named the real, built thing an object. This lesson named the
exact act — `new Dog()` — that produces one, and showed that two
separate calls to it produce two genuinely independent objects, never
one shared object under two names.

## What Breaks Without This

Skipping `new Dog()` for `secondDog` and instead writing
`Dog secondDog = firstDog;` does not create a second object at all — it
makes `secondDog` refer to the *exact same* object `firstDog` already
refers to. Setting `secondDog.name = "Fido";` would then also change
`firstDog.name`, since there is only one real object, referred to by two
names — a real, observable bug distinct from the two-independent-objects
case this lesson demonstrated.

## Exercises

1. Replace `Dog secondDog = new Dog();` with `Dog secondDog = firstDog;`
   and run the program again — confirm both `println` calls now print
   the same name, proving no second object was ever built.
2. Add a third `new Dog()` call and confirm it doesn't affect either
   existing dog's `name`.
3. Explain, in your own words, what "allocating its own storage" means,
   using `firstDog` and `secondDog` as your example.

## Definition of Done

- [ ] You ran the two-dog example and saw `Rex` then `Fido` printed.
- [ ] You completed Exercise 1 and observed the aliasing bug it produces.
- [ ] You can state, without looking back at this lesson, what happens
      in memory each time `new Dog()` runs.
