# Lesson 0a: A Class Is a Blueprint

**What you will build:** A standalone, throwaway lab, run outside Pocket
Inventory — its only job is to make `class` observable before `track/`'s
own Lesson 0 assumes you already know it. Today's case study: a small
`Dog` class.

**What you need to know first:** Nothing. This is the first lesson in
this series. It assumes only variables, assignment, expressions,
`if`/`else`, loops, functions, basic debugging, and writing simple
scripts — ordinary programming, not yet Java or object-oriented
programming specifically.

**Terms introduced in this lesson:**

- **Class** — a blueprint describing what fields and methods every object
  built from it will have.
- **`javac`** — the Java compiler; reads `.java` source files and
  produces `.class` bytecode files.
- **`java`** — the Java launcher; runs a compiled class's `main` method.
- **`mkdir`** — a terminal command that creates a new, empty folder.
- **`cd`** — a terminal command that changes the terminal's current
  working directory.

---

## Concept Unit: A Class Is a Blueprint

### The Problem

Every program that models more than one of something — more than one
dog, more than one row in an inventory list, more than one screen in an
app — needs a way to say "these things all have the same *shape*: the
same fields, the same behavior — but each one holds its own values."
Writing a separate set of variables for every dog (`dog1Name`, `dog1Age`,
`dog2Name`, `dog2Age`, ...) doesn't scale past a handful, and gives the
language no way to know that `dog1Name` and `dog2Name` are "the same kind
of thing." Before any real program can be written, there has to be a way
to describe a shape once.

### Introduce the Concept in Isolation

#### Setting Up

Every lesson in this series is a disposable lab — nothing written here
becomes part of Pocket Inventory, so it doesn't live inside that
project's folder at all. Create one new, empty folder to hold this
lesson's code, and move into it:

```
mkdir lesson-0a
cd lesson-0a
```

`mkdir` — **first appearance**: a terminal command that creates a new,
empty folder — here, one named `lesson-0a`, inside whatever folder the
terminal is currently "in." `cd` — **first appearance** (short for
"change directory"): moves the terminal's current folder — its
**working directory**, the folder every later command runs relative to —
into the one just created. Both commands print nothing on success; a
missing folder or a typo produces a one-line error naming the problem
(e.g. `cd: lesson-0a: No such file or directory` if `mkdir` was skipped
or misspelled).

Every later lesson in this series gets its own folder the same way.
Inside `lesson-0a`, create one new file named exactly `Main.java`. Java
requires that a file containing a `public class` be named after that
class exactly, with `.java` appended, capitalization included.

```java
class Dog {
    String name;
    int age;

    void bark() {
        System.out.println(name + " says Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.name = "Rex";
        myDog.age = 3;
        myDog.bark();
    }
}
```

Type this into `Main.java` and save it.

#### Compile and Run It

Two commands turn this saved file into a running program, both typed
from inside `lesson-0a`:

```
javac Main.java
```

`javac Main.java` — **first appearance**: `javac` is the Java compiler.
It reads one or more `.java` source files, checks them for errors, and —
if there are none — translates them into `.class` files: compiled
bytecode the Java Virtual Machine can actually run. `Main.java` is the
argument: the specific file to compile. This command produces two new
files in `lesson-0a`, `Main.class` and `Dog.class` — one per class
declared inside `Main.java`, even though both classes were typed into
the same source file. `javac` prints nothing at all when it succeeds —
silence means success, not that nothing happened.

```
java Main
```

`java Main` — **first appearance**: `java` is the Java launcher. It
loads a compiled class and runs its `main` method — the one required
entry point every runnable Java program has exactly one of. `Main` is
the argument: the name of the class to run, written as the bare class
name, with neither `.class` nor `.java` appended.

Run both commands, in that order. The terminal prints:

```
Rex says Woof!
```

That line is `println`, inside `bark()`, actually executing — real proof
the whole chain worked end to end: the source compiled with no errors,
the class loaded, `main` ran, `new Dog()` built a real object, and
calling `.bark()` on that specific object printed a message built from
its own `name`.

`class Dog { ... }` declares a `class` — **first appearance**. A class is
a blueprint. It says every `Dog` will have a `name` (text), an `age` (a
whole number), and a `bark()` behavior — but on its own, a class builds
nothing. Nothing named `Rex` exists yet from this declaration alone; it's
a description, the same way a blueprint for a house describes rooms and
walls without being a house anyone can stand inside.

### Discard the Throwaway Example

This `Dog`/`Main` pair is deleted now. It will not appear again — its
only job was to make `class` observable in the smallest possible program.

### Mechanical Walkthrough

1. `class Dog { ... }` — **(a) first appearance.** Declares a new class
   named `Dog`. Everything between the braces belongs to this blueprint.
2. `String name;` — **(a) first appearance** of a **field**: a variable
   declared directly inside a class body (not inside a method),
   describing one piece of data every `Dog` object will hold. `String`
   is Java's built-in text type — a sequence of characters, written
   between double quotes (`"Rex"`).
3. `int age;` — a second field, of type `int` (a whole number, no decimal
   point). Two fields, two independent pieces of data every `Dog`
   carries.
4. `void bark() { ... }` — **(a) first appearance** of a **method**: a
   function declared inside a class. `void` means it returns no value;
   `bark()` takes no arguments.
5. `public class Main { ... }` and `public static void main(String[]
   args) { ... }` — Java's required program-entry-point shape. Treated
   as already-established scaffolding for this lesson (every `track/`
   lesson opens with it unexplained); a later lesson in this series gives
   it its own full first-appearance treatment.

### CS Lens

This is the foundational idea of **object-oriented programming**: a
**class** is a type — a description of shape and behavior. Unlike `int`,
whose shape is built into the language, a class's shape is chosen by the
programmer, and a class can bundle multiple pieces of data (`name` and
`age` together) plus behavior (`bark()`) into one unit.

Also recognized in: every row in a spreadsheet sharing the same columns
but different values, every `struct` in C, every database table's schema
versus its individual rows, every class in Python or C#, every entity in
a game engine (one `Enemy` class, many enemy objects on screen at once).

### SE Lens

The alternative to a class — a separate variable per dog (`dog1Name`,
`dog2Name`, `dog1Age`, `dog2Age`) — was not chosen because it doesn't
compose: nothing in the language would know `dog1Name` and `dog2Name`
belong together, a function that operates on "a dog" would need to
accept four separate parameters instead of one `Dog`, and adding a third
dog means hand-writing two more variables instead of writing one more
line. Bundling related data and behavior into one named type is the
first, smallest instance of a much larger principle this whole
curriculum returns to repeatedly: group what changes together, for the
same reason, in the same place.

---

## Connect the Pieces

`class Dog { ... }` describes what every dog has (`name`, `age`,
`bark()`) — a shape, described exactly once, regardless of how many real
dogs the program will ever build. Nothing here builds a dog yet; the
next lesson (Object) picks up exactly where this one leaves off, showing
what `new Dog()` actually does with this blueprint.

## What Breaks Without This

Trying to write `myDog.name = "Rex";` with no `class Dog { ... }`
declaration anywhere fails to compile at all. Delete the `class Dog`
declaration yourself and recompile to see the real compiler error —
the compiler has no idea what `Dog` even means, producing an error
resembling `cannot find symbol: class Dog`. A class must exist,
declared, before anything can ever be built from it.

## Exercises

1. Add a second field to `Dog`, `String breed`, and set it in `main`
   alongside `name` and `age`.
2. Add a second method to `Dog`, `void sit()`, printing
   `<name> sits.`, and call it from `main`.
3. Explain, in your own words, why `class Dog { ... }` alone — with no
   `new Dog()` anywhere — produces no visible output at all when the
   program runs.

## Definition of Done

- [ ] You ran the `Dog`/`myDog`/`bark()` example yourself and saw `Rex
      says Woof!` printed.
- [ ] You completed Exercise 1 and Exercise 2.
- [ ] You can state, without looking back at this lesson, what a class
      is and what it is not (i.e., that declaring one builds nothing by
      itself).
