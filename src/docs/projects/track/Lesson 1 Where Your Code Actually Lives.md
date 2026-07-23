# Lesson 1: Where Your Code Actually Lives

**What you will build:** A brand-new Android Studio project named Pocket
Inventory, created correctly from the New Project wizard, with a Java
package name you understand rather than accepted on faith. The
transferable problem this lesson is actually about: in Java, a
"namespace" is not just a label attached to code — it is a contract
between your source files and your filesystem, enforced by the
compiler. Get this wrong later (rename a package carelessly, move a
file without updating its declaration) and you get a wall of confusing
compiler errors. Understanding it now means those errors will make
instant sense later instead of feeling like magic.

**What you need to know first:** Nothing — this is Lesson 1. You've
taken a basic Java class, so `public class`, `public static void
main`, and `System.out.println` are assumed familiar; everything else
is explained from scratch.

---

## Concept Unit: Package Declarations Are a Promise About Folder Location

### The Problem

In a language like Python, a "namespace" is mostly cosmetic — you can
often move a file around and just fix an import statement. Java is
stricter. Every `.java` file that declares `package com.example.foo;`
at the top is making a specific, checked claim: *"the compiler will
find me inside a folder path that ends in `com/example/foo/`."* If
that claim is false, the code does not compile. Not "runs with a
warning" — does not compile at all. This is why Android Studio's
package name field feels so heavy: it isn't naming your code, it's
committing you to a folder structure.

### The New Code

You're going to prove this to yourself with two tiny files, entirely
outside of Android, using nothing but the Java compiler you already
have installed.

First, create a folder structure that does **NOT** match the package
name on purpose:

```
mkdir -p pkgdemo/wrongplace
```

Now create this file at `pkgdemo/wrongplace/Greeter.java`:

```java
package com.example.pocketinventory;

public class Greeter {
    public static void main(String[] args) {
        System.out.println("Hello from Pocket Inventory");
    }
}
```

### The Updated Project

This is a brand-new standalone file with nothing surrounding it yet —
there's no existing structure to show it landing inside of. That's the
whole file, sitting in a folder called `wrongplace`, which does **not**
match the `com.example.pocketinventory` the file claims.

### Mechanical Walkthrough

Enumerating what's in this file, in order:

- `package com.example.pocketinventory;` — **first appearance.** This
  line is not a comment or a suggestion. It's a compiler-checked
  declaration: "this file belongs at the end of a folder path
  `com/example/pocketinventory/`." The compiler will verify this when
  you try to build with a package-aware build (which `javac -d` does,
  as you're about to see).
- `public class Greeter` — already-basic syntax from your Java class,
  reusable silently.
- `public static void main(String[] args)` — already-basic syntax,
  reusable silently.
- `System.out.println(...)` — already-basic syntax, reusable silently.

### Run It Yourself

From inside the `pkgdemo` folder, run:

```
javac -d wrongplace_out wrongplace/Greeter.java
```

`javac` is the Java compiler. `-d wrongplace_out` tells it: "place the
compiled output into a proper package-based folder structure rooted at
`wrongplace_out`." This flag is exactly what makes the mismatch
visible — without `-d`, javac is lenient about location; with `-d`, it
enforces the package contract, which is also what Android Studio does
under the hood every time you build.

Run it and note what happens. You should **not** get an error from
this step — `javac -d` doesn't care what folder your *source* file
started in, only where it *puts* the compiled output. Now look inside
`wrongplace_out`:

```
find wrongplace_out
```

You'll see it created `wrongplace_out/com/example/pocketinventory/Greeter.class`
— notice the compiler built the correct nested folder structure for
you, regardless of where your source file physically was. This is the
detail that matters: **the package declaration drives where the
compiled class lives, independent of where the source file started.**
Android Studio's project templates just do this step for you
automatically and keep source and compiled layout in sync, which is
why it insists on creating the matching source folders up front rather
than leaving your `.java` files scattered.

Now run the compiled class to confirm it actually works:

```
java -cp wrongplace_out com.example.pocketinventory.Greeter
```

Notice `-cp wrongplace_out com.example.pocketinventory.Greeter` — you
have to reference the class by its *full package path*, not just
`Greeter`. That's the payoff of the whole exercise: the package name
isn't decoration, it's literally part of the class's real identity
from the compiler's point of view.

### CS Lens

This is an instance of a **namespace / addressing scheme** — giving
every unit in a large system a globally unique, hierarchical name so
two unrelated pieces of code can both have a class called `Greeter`
without colliding. Also recognized in: DNS domain names (most-specific
label read right-to-left, same idea Java borrows reversed-domain
convention from), file system paths themselves, URL paths, C++/C#
namespaces, and database schema-qualified table names.

### SE Lens

**Why enforce this instead of a looser convention?** The alternative —
what languages like early JavaScript or Python scripts often do — is a
single global namespace where you just hope two libraries never both
define a class called `Parser`. That works fine for a small project
and becomes a real liability at scale: two libraries with a colliding
class name simply cannot be used together without manual renaming.
Java's tradeoff is more upfront ceremony (folder structure must match)
in exchange for a guarantee that a class's full name
(`com.example.pocketinventory.Greeter`) is unique across every library
you'll ever depend on, as long as everyone follows the reversed-domain
convention. The cost you're paying for that guarantee is exactly the
"ridiculous folder structure" feeling you flagged — that's not
accidental complexity, it's the price of the collision guarantee.

Delete the `pkgdemo` folder now — it was only ever a throwaway lab and
will not appear in the real project again.

---

## Concept Unit: Creating the Project Through the Wizard

### The Problem

Android Studio's New Project wizard is doing, automatically, exactly
what you just did by hand: creating a folder structure that matches a
package name, plus a large amount of supporting configuration
(explained in Lesson 2) that a bare `javac` project doesn't need.
Knowing what you just learned, the wizard's fields should now read as
instructions rather than mysteries.

### Project Change

- **Reference Source:** No reference counterpart — this is tooling
  setup, not application code.
- **Files affected:** Creates an entire new project directory tree
  (new project, not a modification).
- **Change type:** Configure / create.
- **Dependencies:** Android Studio installed (you already have this).

### The New Code

There's no code to type in this step — it's a sequence of decisions in
the wizard. Walking through them with the concept you just learned:

1. **New Project → Empty Views Activity.** ("Views" here means the
   older XML-layout UI system this whole curriculum is built on, as
   opposed to the newer Compose system — you want Views, since that
   matches your coursework and this curriculum's Phase 1–8 stories.)
2. **Name:** `Pocket Inventory` — this is a display name only, separate
   from the package name.
3. **Package name:** Android Studio will suggest something like
   `com.yourname.pocketinventory`, built from a reversed identifier —
   same reversed-domain convention from the CS Lens above. You can
   accept the suggestion. This field is the one you now understand
   isn't cosmetic: accepting it means Android Studio will create actual
   folders `com/yourname/pocketinventory/` under the hood, exactly like
   `wrongplace_out` did a moment ago, and every Java file it generates
   inside will declare `package com.yourname.pocketinventory;` at the
   top to match.
4. **Language: Java.** Double-check this specifically — Android Studio
   defaults to Kotlin now, and this curriculum (and your coursework) is
   Java-based.
5. **Minimum SDK:** leave the suggested default.
6. Click **Finish**.

### The Updated Project

Once the wizard finishes, look at the **Project** panel on the left
(make sure the dropdown at its top says **Android**, not **Project** —
the Android view groups things sensibly; the raw Project view will
show you the real, much messier, physical folder tree). Expand
`app > java > com.yourname.pocketinventory`. You should see one file:
`MainActivity.java`. Open it, and near the top you'll see exactly the
pattern from the lab:

```java
package com.yourname.pocketinventory;  // ← matches the folder path you expanded to get here

public class MainActivity extends AppCompatActivity {
    ...
}
```

(`extends AppCompatActivity` and everything inside the class body is
new material — that's Lesson 2's Concept Unit, not this one. For now,
just confirm the `package` line matches the folder path, which is the
entire point of this lesson.)

### Mechanical Walkthrough

- `package com.yourname.pocketinventory;` — **reappearing**, same
  concept from the lab above, now seen for real inside an actual
  Android project.
- Everything else in `MainActivity.java` is intentionally not
  explained yet — flagged, not skipped, and picked up in Lesson 2.

### SE Lens

**Why does the wizard force you through these decisions instead of
picking sensible defaults silently?** The alternative — auto-generating
a package name you never see — would hide exactly the mechanism you
just spent this lesson learning, and would bite you the first time you
needed to rename it later (package renames in a real project touch
every file's `package` line plus the physical folder structure; IDEs
automate this but it's never truly free). Making you confirm it once,
up front, costs a small amount of attention now to avoid a much more
disruptive change later.

---

## Connect the Pieces

One concrete trace through this lesson: the string
`com.yourname.pocketinventory` started as a decision in a wizard field,
became a physical folder path `app/src/main/java/com/yourname/pocketinventory/`
on your disk, and simultaneously became the literal first line inside
`MainActivity.java`. All three are the same fact, expressed three
ways — a filesystem path, a compiler declaration, and a UI wizard
field — because the Java compiler treats them as one thing, not three.

## What Breaks Without This

Open `MainActivity.java` and change the top line to a package name
that does **not** match the folder it's sitting in — for example,
delete a segment: `package com.yourname;`. Try to build (Build → Make
Project). Read the actual error Android Studio gives you. It will
complain about a package mismatch — this is the same enforcement you
saw from `javac -d`, just surfaced through the IDE instead of the raw
compiler. Undo the change (Ctrl+Z or manually restore the correct
line) before moving on.

## Exercises

1. Redo the throwaway lab, but this time make the folder path *deeper*
   than the package declares (e.g., source file physically at
   `pkgdemo/a/b/wrongplace/Greeter.java`, package still
   `com.example.pocketinventory`). Confirm for yourself that `javac -d`
   still doesn't care about source location, only the `-d` output
   target — the mismatch you deliberately broke in "What Breaks Without
   This" only happens *inside* Android Studio's build, not with raw
   `javac -d`. Think about why that distinction might matter later
   (hint: it's about what each tool is checking).
2. In the Android **Project** view (not the Android grouped view),
   physically locate the real nested folders
   `app/src/main/java/com/yourname/pocketinventory/` on disk and
   confirm they match what you saw in the grouped view.

## Definition of Done

- [ ] You ran the `javac -d` lab yourself and saw real compiler output,
      not just read about it.
- [ ] You can explain, in your own words, why a package rename is more
      than a text edit.
- [ ] Pocket Inventory project exists in Android Studio, Java selected,
      package name confirmed.
- [ ] You located `MainActivity.java` and matched its `package` line to
      a real folder path yourself.
- [ ] Commit: `git init` in the project if not already done by the
      wizard, then commit with a message like `Initial project scaffold
      — package name confirmed to match com.yourname.pocketinventory
      folder structure` (explaining *why* it's structured that way, not
      just "initial commit").

Next lesson picks up right here: what `extends AppCompatActivity`
means, what the Manifest file is for, and why Android calls methods on
your Activity that you never call yourself.