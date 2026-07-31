# Lesson 01: The Blueprint and the Instance

**What you will build:** Nothing added to Pocket Inventory yet, and nothing
ever will be — every `track-foundations/` lesson is a standalone,
throwaway lab, run outside any project, whose only job is to make sure a
concept `track/` (the Pocket Inventory course) later assumes you already
know is actually taught first. Today's case study: a small `Dog` class, and
what it means to build real objects from it.

**What you need to know first:** Nothing. This is the first lesson in this
series. It assumes only variables, assignment, expressions, `if`/`else`,
loops, functions, basic debugging, and writing simple scripts — ordinary
programming, not yet Java or object-oriented programming specifically.

**Terms introduced in this lesson:**

- **Class** — a blueprint describing what fields and methods every object
  built from it will have.
- **Object (instance)** — a concrete, constructed value built from a
  class's blueprint, with its own independent copy of each field the class
  declares.
- **Instantiation (object creation)** — the act of constructing a new
  object from a class's blueprint, allocating its own storage.
- **Nested class** — a class declared entirely inside another class's
  braces, referred to from outside via a dot-qualified `Outer.Inner` name.
- **`javac`** — the Java compiler; reads `.java` source files and produces
  `.class` bytecode files.
- **`java`** — the Java launcher; runs a compiled class's `main` method.
- **`mkdir`** — a terminal command that creates a new, empty folder.
- **`cd`** — a terminal command that changes the terminal's current
  working directory.

---

## Concept Unit: A Class Is a Blueprint; an Object Is the Real Thing Built From It

### The Problem

Every program that models more than one of something — more than one dog,
more than one row in an inventory list, more than one screen in an app —
needs a way to say "these things all have the same *shape*: the same
fields, the same behavior — but each one holds its own values." Writing a
separate set of variables for every dog (`dog1Name`, `dog1Age`, `dog2Name`,
`dog2Age`, ...) doesn't scale past a handful, and gives the language no way
to know that `dog1Name` and `dog2Name` are "the same kind of thing." Before
any real program can be written, there has to be a way to describe a shape
once and build as many independent copies of it as needed.

### Introduce the Concept in Isolation

#### Setting Up

Every lesson in this series is a disposable lab — nothing written here
becomes part of Pocket Inventory, so it doesn't live inside that project's
folder at all. Create one new, empty folder to hold this lesson's code,
and move into it:

```
mkdir lesson-01
cd lesson-01
```

`mkdir` — **first appearance**: a terminal command that creates a new,
empty folder — here, one named `lesson-01`, inside whatever folder the
terminal is currently "in." `cd` — **first appearance** (short for
"change directory"): moves the terminal's current folder — its **working
directory**, the folder every later command runs relative to — into the
one just created. Both commands print nothing on success; a missing
folder or a typo produces a one-line error naming the problem (e.g. `cd:
lesson-01: No such file or directory` if `mkdir` was skipped or misspelled).

Every later lesson in this series gets its own folder the same way —
`lesson-02`, `lesson-03`, and so on. This matters more once a later lesson
introduces Java's **package** (its version of a namespace): a package name
and a folder path have to match exactly, so establishing "one folder per
lesson" now, rather than piling every lesson's code into one shared
folder, is what keeps that later requirement from forcing a reorganization.
Nothing here has a package yet — this is a plain folder, and the code
below has no `package` line at all.

Inside `lesson-01`, create one new file named exactly `Main.java`, using
any plain-text editor or code editor. Which editor and exactly how to
create a file in it isn't shown here — that step is specific to whatever
editor is installed — but the file's name is not a free choice: Java
requires that a file containing a `public class` be named after that class
exactly, with `.java` appended, capitalization included. The code below
declares `public class Main`, which is why the file must be `Main.java`,
not `main.java` or `Dog.java`. This rule is walked through again below,
against the real code.

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

Two commands turn this saved file into a running program, both typed from
inside `lesson-01`:

```
javac Main.java
```

`javac Main.java` — **first appearance**: `javac` is the Java compiler. It
reads one or more `.java` source files, checks them for errors, and — if
there are none — translates them into `.class` files: compiled bytecode
the Java Virtual Machine can actually run. `Main.java` is the argument:
the specific file to compile. This command produces two new files in
`lesson-01`, `Main.class` and `Dog.class` — one per class declared inside
`Main.java`, even though both classes were typed into the same source
file. `javac` prints nothing at all when it succeeds — silence means
success, not that nothing happened. If there's a mistake — a missing
semicolon, a misspelled type — `javac` prints an error naming the exact
file, line, and problem instead of producing any `.class` file; for
example, deleting the semicolon after `int age` produces `error: ';'
expected`, pointing at the exact line.

```
java Main
```

`java Main` — **first appearance**: `java` is the Java launcher. It loads
a compiled class and runs its `main` method — the one required entry point
every runnable Java program has exactly one of. `Main` is the argument:
the name of the class to run, written as the bare class name, with neither
`.class` nor `.java` appended. `java Dog` would fail here with an error
naming a missing `main` method, even though `Dog.class` also exists,
because `Dog` was never given a `main` method — only `Main` was.

Run both commands, in that order. The terminal prints:

```
Rex says Woof!
```

That line is `println`, inside `bark()`, actually executing — real proof
the whole chain worked end to end: the source compiled with no errors, the
class loaded, `main` ran, `new Dog()` built a real object, and calling
`.bark()` on that specific object printed a message built from its own
`name`.

`class Dog { ... }` declares a `class` — **first appearance**. A class is
a blueprint. It says every `Dog` will have a `name` (text), an `age` (a
whole number), and a `bark()` behavior — but on its own, a class builds
nothing. Nothing named `Rex` exists yet from this declaration alone; it's a
description, the same way a blueprint for a house describes rooms and
walls without being a house anyone can stand inside.

`new Dog()` performs `instantiation` — **first appearance** (also called
**object creation**): the moment a real, concrete `Dog` gets built from the
blueprint, with its own storage for `name` and `age`, separate from any
other `Dog` that might ever be built. The result — the thing `myDog` now
refers to — is an `object` — **first appearance**, also called an
**instance** of `Dog`. `Dog` is the blueprint; `myDog` is one real thing
built from it.

That one line, `Dog myDog = new Dog();`, is the entire idea this unit
exists to teach: a class describes a shape once; `new` builds as many
independent objects from that shape as the program needs.

### Discard the Throwaway Example

This `Dog`/`Main` pair is deleted now. It will not appear in the project
again — its only job was to make `class`, `object`, and `new` observable in
the smallest possible program before either word is trusted to carry any
real weight.

### Mechanical Walkthrough

Enumerating every distinct element of the code above, in order:

1. `class Dog { ... }` — **(a) first appearance.** Declares a new class
   named `Dog`. Everything between the braces belongs to this blueprint.
2. `String name;` — **(a) first appearance** of a **field**: a variable
   declared directly inside a class body (not inside a method), describing
   one piece of data every `Dog` object will hold. `String` is Java's
   built-in text type — a sequence of characters, written between double
   quotes (`"Rex"`).
3. `int age;` — a second field, of type `int` (a whole number, no decimal
   point). Two fields, two independent pieces of data every `Dog` carries.
4. `void bark() { ... }` — **(a) first appearance** of a **method**: a
   function declared inside a class, callable on an object of that class.
   `void` means it returns no value; `bark()` takes no arguments.
5. `System.out.println(name + " says Woof!");` — genuinely basic,
   already-established syntax at this point in the curriculum (a function
   call and string concatenation with `+`), sorted as **(c)**: reused
   without restatement. What's new here is only that `name` refers to
   *this particular* `Dog` object's own field — covered next.
6. `public class Main { ... }` and `public static void main(String[]
   args) { ... }` — Java's required program-entry-point shape. Treated as
   already-established scaffolding for this lesson (every `track/` lesson
   opens with it unexplained); a later `track-foundations/` lesson in this
   series gives it its own full first-appearance treatment. Not
   re-explained here to avoid claiming the same term "first appearance" in
   two files, which the glossary rule treats as an error.
7. `Dog myDog = new Dog();` — **(a) first appearance**, the line the whole
   unit exists for. Left to right: `Dog myDog` declares a variable named
   `myDog` that can hold a `Dog`. `new Dog()` instantiates the class —
   builds one real object with its own `name` and `age` storage, distinct
   from any other `Dog` ever built. `=` stores the newly built object into
   `myDog`.
8. `myDog.name = "Rex";` and `myDog.age = 3;` — `.` (dot) reaches into the
   specific object `myDog` refers to and sets *that object's own* `name`
   and `age`. If a second `Dog` existed, setting its `name` would not touch
   `myDog`'s — each object's fields are independent storage, not shared.
9. `myDog.bark();` — calls the `bark()` method *on* `myDog` specifically.
   Inside `bark()`, `name` refers to `myDog`'s own `name` field — `"Rex"` —
   which is why the output says `Rex says Woof!` and not some other name.

### CS Lens

This is the foundational idea of **object-oriented programming**: a
**class** is a type — a description of shape and behavior — and an
**object** is a value of that type, the same way `int` is a type and `3`
is a value of it. The difference is that a class's shape is chosen by the
programmer, not built into the language, and a class can bundle multiple
pieces of data (`name` and `age` together) plus behavior (`bark()`) into
one unit, where `int` only ever holds one number.

Also recognized in: every row in a spreadsheet sharing the same columns
but different values, every `struct` in C, every database table's schema
versus its individual rows, every class in Python or C#, every entity in a
game engine (one `Enemy` class, many enemy objects on screen at once).

### SE Lens

The alternative to a class — a separate variable per dog (`dog1Name`,
`dog2Name`, `dog1Age`, `dog2Age`) — was not chosen because it doesn't
compose: nothing in the language would know `dog1Name` and `dog2Name`
belong together, a function that operates on "a dog" would need to accept
four separate parameters instead of one `Dog`, and adding a third dog means
hand-writing two more variables instead of writing one more `new Dog()`.
Bundling related data and behavior into one named type is the first,
smallest instance of a much larger principle this whole curriculum returns
to repeatedly: group what changes together, for the same reason, in the
same place. The maintenance cost of *not* doing this compounds — a
four-dog program with unbundled variables needs sixteen separate names to
track by hand; a class needs one blueprint and as many `new Dog()` calls as
there are dogs.

---

## Concept Unit: Nested Classes — A Class Declared Inside Another

### The Problem

Sometimes a class only makes sense in the context of exactly one other
class, and has no meaningful identity outside it — a single dog's collar,
say, is not something any other kind of object would ever need to build or
reference. Declaring it as a fully separate, top-level class works, but
puts a name in the global namespace of the program for something that is
never used anywhere except inside `Dog`. Java has a more precise way to
express "this class belongs entirely to that one."

### Introduce the Concept in Isolation

Still inside `lesson-01` (no new folder needed), replace `Main.java`'s
entire contents with the code below — the previous `Dog`/`bark()` example
is already discarded, so overwriting it loses nothing:

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

Save the file, then compile and run it the same way as before:

```
javac Main.java
java Main
```

The terminal prints:

```
Rex's collar is red
```

`class Collar { ... }`, declared entirely inside `Dog`'s braces, is a
`nested class` — **first appearance**: a class with no meaningful identity
outside its enclosing class, referred to from outside via the dot-qualified
name `Dog.Collar`, never just `Collar` alone.

### Discard the Throwaway Example

This `Collar` example is deleted now. It will not appear in the project
again — its only job was to make the nested-class relationship observable
in the smallest possible program.

### Mechanical Walkthrough

1. `class Collar { ... }`, written inside `Dog`'s braces — **(a) first
   appearance.** A **nested class**: `Collar` exists only as a member of
   `Dog`, the same way `name` is a field member of `Dog`.
2. `String name;` inside `Collar`'s `describe()` method — genuinely basic
   field access, sorted **(c)**, except for one new fact: `describe()` is
   a method of `Collar`, yet it reads `name`, a field that belongs to
   `Dog`, with no `Dog.` qualifier anywhere in sight. This works because a
   non-static nested class (the default, and the only kind this unit
   covers) is silently built holding a reference back to the specific
   `Dog` object that created it — `describe()` can reach that enclosing
   object's fields directly.
3. `Dog.Collar myCollar = myDog.new Collar();` — **(a) first appearance**
   of this exact syntax shape. `Dog.Collar` is the dot-qualified type name
   from outside `Dog`. `myDog.new Collar()` is not the ordinary `new
   Collar()` — it explicitly names *which* `Dog` this new `Collar` belongs
   to, `myDog`, which is exactly the enclosing object `describe()` will
   reach back into for `name`.
4. `myCollar.color = "red";` and `myCollar.describe();` — reused,
   already-established field-access and method-call syntax from the
   previous unit, sorted **(c)**.

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

The alternative — making `Collar` a fully separate, top-level class — was
not chosen because it would put a name in the program's global namespace
(`Collar`) for something that is never meaningfully used except through a
`Dog`. A reader scanning the list of top-level classes in a large program
benefits from that list only containing things that genuinely stand alone;
burying `Collar` inside `Dog` communicates, structurally, "you will never
need this by itself." The cost: a nested class is slightly more ceremony
to construct from outside (`myDog.new Collar()` instead of `new
Collar()`), a small, deliberate tradeoff traded for that clarity.

---

## Connect the Pieces

Both units built on the same underlying idea from opposite directions: the
first showed that a class is a blueprint and `new` builds independent
objects from it; the second showed that a class can itself be declared
*inside* another class's blueprint, restricting who can ever build one.
Tracing one value all the way through: `Dog` describes what every dog has
(`name`, `age`); `new Dog()` builds one real dog, `myDog`, with `name` set
to `"Rex"`; `Dog.Collar`, nested inside `Dog`, describes what every collar
has (`color`), and `myDog.new Collar()` builds one real collar tied
specifically to `myDog` — reachable only because a `Dog` named `"Rex"`
already existed to build it from.

## What Breaks Without This

Delete the `new Dog()` call entirely and try to compile:

```java
Dog myDog;
myDog.name = "Rex";
```

This fails to compile with an error resembling:

```
error: variable myDog might not have been initialized
        myDog.name = "Rex";
        ^
```

`Dog myDog;` only declares a variable that *can* hold a `Dog` — it never
built one. Without `new Dog()`, there is no object for `myDog` to refer to
at all, and the compiler refuses to let the program reach into a field
(`.name`) on something that was never constructed. This is the concrete
proof that declaring a class and instantiating it are two separate steps,
not one: the blueprint existing changes nothing about the program's actual
data until `new` is used.

## Exercises

1. Add a second field to `Dog`, `String breed`, and a second object,
   `Dog secondDog = new Dog();`, with its own `name` and `breed`. Print
   both dogs' `bark()` output and confirm each one prints its own `name`,
   not the other's — proof that each object's fields are independent
   storage.
2. Add a method `Collar describeMaterial()`... no — add a second field to
   `Collar`, `String material`, set it, and print it from `describe()`
   alongside `color`, confirming a nested class can hold more than one
   field exactly like a top-level class can.
3. Try building a `Collar` without a `Dog` at all — write `new
   Collar();` with no `myDog.` prefix, outside of any `Dog`, and read the
   real compiler error. It will name the exact requirement this lesson
   described: an enclosing instance is required to construct a non-static
   nested class.

## Definition of Done

- [ ] You ran the `Dog`/`myDog`/`bark()` example yourself and saw `Rex
      says Woof!` printed.
- [ ] You ran the `Dog.Collar` example yourself and saw `Rex's collar is
      red` printed.
- [ ] You deliberately deleted `new Dog()` (or commented it out) and saw
      the real "might not have been initialized" compiler error, then
      restored it.
- [ ] You completed Exercise 1 and can explain, in your own words, why
      `secondDog`'s `name` and `myDog`'s `name` never collide.
- [ ] You can state, without looking back at this lesson, the difference
      between a class and an object.
