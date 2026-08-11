# Lesson 05: Package Declarations and the Project Wizard

**What you will build:** A brand-new Android Studio project, created
correctly from the New Project wizard, with a Java package name you
understand rather than accept on faith. The transferable problem: in
Java, a "namespace" isn't just a label attached to code — it's a
contract between your source files and your filesystem, enforced by the
compiler. Getting this wrong later (renaming a package carelessly, moving
a file without updating its declaration) produces a wall of confusing
compiler errors. Understanding it now means those errors will make
instant sense later instead of feeling like magic.

**What you need to know first:** Lesson 01 — `class`, `public`, `static
void main`, `System.out.println`, and the compile-then-run two-step
model.

**Terms introduced in this lesson:**
- **Package declaration** — a compiler-checked claim, at the top of a
  `.java` file, that the file lives at the end of a matching folder path.
- **`-d` compiler flag** — tells `javac` to place compiled output into a
  proper package-based folder structure, instead of next to the source
  file.
- **Fully-qualified name** — a class's full identity from the compiler's
  point of view, package path included (`com.example.demo.Greeter`, not
  just `Greeter`).
- **Gradle (recognition only)** — the build system Android Studio sets up
  for every project; what it actually does is deferred to the first
  lesson that needs to edit its configuration.

**Objects and methods used**
- `javac`/`java` — the two-step compile-then-run toolchain taught in
  Lesson 01 — reappear here with one new flag (`-d`), given full
  treatment above, since a new flag on an already-known tool is new
  material, not a bare reminder.

---

## Concept Unit: Package Declarations Are a Promise About Folder Location

### The Problem

In a language like Python, a "namespace" is mostly cosmetic — you can
often move a file around and just fix an import statement. Java is
stricter. Every `.java` file that declares `package com.example.demo;`
at the top is making a specific, checked claim: *"the compiler will find
me inside a folder path that ends in `com/example/demo/`."* If that claim
is false, the code does not compile — not "runs with a warning," does
not compile at all. This is why Android Studio's package name field, which
you're about to fill in, feels so heavy: it isn't naming your code, it's
committing you to a folder structure.

### Introduce the Concept in Isolation

Prove this with two tiny files, entirely outside of Android, using
nothing but the compiler from Lesson 01.

Create a folder structure that does **NOT** match the package name, on
purpose:

```
mkdir -p pkgdemo/wrongplace
```

Create `pkgdemo/wrongplace/Greeter.java`:

```java
package com.example.demo;

public class Greeter {
    public static void main(String[] args) {
        System.out.println("Hello from the demo package");
    }
}
```

From inside the `pkgdemo` folder, compile with the `-d` flag:

```
javac -d wrongplace_out wrongplace/Greeter.java
```

`javac` is the same compiler from Lesson 01. `-d wrongplace_out` tells it:
"place the compiled output into a proper package-based folder structure,
rooted at `wrongplace_out`." This flag is what makes the package/folder
relationship visible — without `-d`, `javac` doesn't care where the
compiled `.class` file lands; with `-d`, it builds the full package path
for you, which is exactly what Android Studio does under the hood on
every build.

Real output from running this just now: the command itself prints
nothing (success), and:

```
find wrongplace_out
```

produces:

```
wrongplace_out
wrongplace_out/com
wrongplace_out/com/example
wrongplace_out/com/example/demo
wrongplace_out/com/example/demo/Greeter.class
```

Notice the compiler built the nested folder structure
`com/example/demo/` for the compiled output — regardless of the fact
that the *source* file physically sat in a folder called `wrongplace`.
That's the point being proven: **the package declaration drives where the
compiled class lives, independent of where the source file started.**

Confirm it actually runs, referencing it by its **fully-qualified name** —
the class's full identity, package path included:

```
java -cp wrongplace_out com.example.demo.Greeter
```

Real output:

```
Hello from the demo package
```

You had to type `com.example.demo.Greeter`, not just `Greeter` — that's
the payoff. The package name isn't decoration; it's literally part of the
class's real identity, from the compiler's point of view.

### Discard the Throwaway Example

Delete the `pkgdemo` folder now. It was only ever a throwaway lab; it
does not become part of any real project. Also available as a
standalone concept file, `java-package-declarations.md`.

### Mechanical Walkthrough

- `package com.example.demo;` — a **package declaration**: a
  compiler-checked claim that this file lives at the end of a folder
  path matching `com/example/demo/`, regardless of where the file
  physically sits when `javac` is invoked.
- `javac -d wrongplace_out wrongplace/Greeter.java` — the same `javac`
  from Lesson 01, now with the `-d` flag: build the full
  `com/example/demo/` folder structure under `wrongplace_out`, derived
  entirely from the `package` line inside the file, not from
  `wrongplace/` (the source file's own, unrelated folder).
- `java -cp wrongplace_out com.example.demo.Greeter` — running it
  requires the class's **fully-qualified name**
  (`com.example.demo.Greeter`), not the bare `Greeter` Lesson 01 used —
  direct proof the package is a real part of the class's identity, not
  a cosmetic label.

### CS Lens

This is a **namespace / addressing scheme** — giving every unit in a
large system a globally unique, hierarchical name so two unrelated pieces
of code can both have a class called `Greeter` without colliding.

Also recognized in: DNS domain names (most-specific label read
right-to-left — Java's reversed-domain package convention is borrowed
directly from this), filesystem paths themselves, URL paths, C++/C#
namespaces, and database schema-qualified table names.

### SE Lens

**Why enforce this instead of a looser convention?** The alternative — a
single global namespace where you just hope two libraries never both
define a class called `Parser` — works fine for a small project and
becomes a real liability at scale: two libraries with a colliding class
name simply cannot be used together without manual renaming. Java trades
more upfront ceremony (folder structure must match) for a guarantee that
a class's full name is unique across every library you'll ever depend on,
as long as everyone follows the reversed-domain convention. The
"ridiculous folder structure" feeling this can produce isn't accidental
complexity — it's the price of that collision guarantee.

---

## Concept Unit: Creating the Project Through the Wizard

### The Problem

Android Studio's New Project wizard does, automatically, exactly what you
just did by hand: builds a folder structure that matches a package name,
plus a large amount of supporting project configuration a bare `javac`
project doesn't need. Knowing what you just proved, the wizard's fields
now read as instructions instead of mysteries.

### The New Code

There's no code to type here — it's a sequence of decisions in the
wizard:

1. **New Project → Empty Views Activity.** ("Views" is the older,
   XML-based UI system this series is built on, as opposed to the newer
   Compose system — Compose is out of scope here.)
2. **Name:** any project name you want — this is a display name only,
   separate from the package name.
3. **Package name:** Android Studio suggests something like
   `com.yourname.yourapp`, built from the same reversed-domain convention
   from the CS Lens above. Accepting it means Android Studio will create
   real folders `com/yourname/yourapp/` under the hood, exactly like
   `wrongplace_out` did a moment ago, and every generated Java file will
   declare `package com.yourname.yourapp;` at the top to match.
4. **Language: Java.** Double-check this specifically — Android Studio
   defaults new projects to Kotlin.
5. **Minimum SDK:** leave the suggested default.
6. Click **Finish**. Android Studio now generates the folder structure,
   a default screen, and the **Gradle** configuration that governs how
   the whole project builds — Gradle itself is only flagged here, not
   explained; the first lesson that needs to edit its configuration will
   explain it for real.

### The Updated Project

Once the wizard finishes, find the **Project** panel on the left (make
sure its top dropdown says **Android**, not **Project** — the Android
view groups files sensibly; the Project view shows the real, messier,
physical folder tree). Expand `app > java > com.yourname.yourapp`. You'll
see one file: `MainActivity.java`. Open it — near the top, exactly the
pattern from the lab:

```java
package com.yourname.yourapp;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

The `package` line matches the folder path you just expanded to get
here — the entire point of this lesson. Everything else in this file —
`extends AppCompatActivity`, `@Override`, `onCreate`, `super`,
`setContentView`, `R.layout` — is real material this series covers next,
starting with Lesson 06. Nothing here is being glossed over permanently;
it's simply not this lesson's concept.

### Mechanical Walkthrough

- `package com.yourname.yourapp;` — **reappearing**, same concept from
  the lab above, now seen inside a real Android project instead of a
  hand-built one.
- Everything else in `MainActivity.java` is flagged, not explained yet —
  picked up starting Lesson 06.

### SE Lens

**Why does the wizard force you through these decisions instead of
picking sensible defaults silently?** Auto-generating a package name you
never see would hide the exact mechanism you just spent this lesson
proving, and would bite you the first time you needed to rename it later —
package renames in a real project touch every file's `package` line plus
the physical folder structure; IDEs automate this but it's never truly
free. Making you confirm it once, up front, costs a small amount of
attention now to avoid a much more disruptive change later.

---

## Connect the Pieces

One concrete trace through this lesson: the string
`com.yourname.yourapp` started as a decision in a wizard field, became a
physical folder path `app/src/main/java/com/yourname/yourapp/` on disk,
and simultaneously became the first line inside `MainActivity.java`. All
three are the same fact, expressed three ways — a filesystem path, a
compiler declaration, and a UI field — because the Java compiler treats
them as one thing, not three.

## What Breaks Without This

Open `MainActivity.java` and change the top line to a package name that
does **not** match the folder it sits in — delete a segment, e.g.
`package com.yourname;`. Build the project (Build → Make Project). Real
error you'll see: a package-mismatch complaint from the compiler — the
same enforcement `javac -d` demonstrated a moment ago, surfaced through
the IDE instead of the raw compiler. Undo the change (Ctrl+Z, or restore
the line by hand) before moving on.

## Exercises

1. Redo the throwaway lab, but make the source folder path *deeper* than
   the package declares (e.g., source physically at
   `pkgdemo/a/b/wrongplace/Greeter.java`, package still
   `com.example.demo`). Confirm `javac -d` still only cares about the
   `-d` output target, never the source file's own location.
2. In the Android **Project** view (not the grouped Android view),
   physically locate the real nested folders
   `app/src/main/java/com/yourname/yourapp/` on disk and confirm they
   match what the grouped view showed you.

## Definition of Done

- [ ] You ran the `javac -d` lab yourself and saw real compiler output,
      not just read about it.
- [ ] You can explain, in your own words, why a package rename is more
      than a text edit.
- [ ] A real Android Studio project exists, Java selected, package name
      confirmed.
- [ ] You located `MainActivity.java` and matched its `package` line to
      a real folder path yourself.
- [ ] You pressed Run and saw the default template screen appear on an
      emulator or device — confirming the project builds and runs before
      you understand every line inside it.
- [ ] Commit: `git init` in the project if the wizard didn't already do
      it, then commit with a message like "Initial project scaffold —
      package name confirmed to match the generated folder structure"
      (explaining *why* it's structured that way, not just "initial
      commit").

Next: `MainActivity.java` contains `extends AppCompatActivity` and
`@Override` — two words this series hasn't explained yet. Lesson 06
explains them for real, using the exact file you just ran.
