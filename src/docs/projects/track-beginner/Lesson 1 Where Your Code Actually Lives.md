# Lesson 1: Where Your Code Actually Lives

> **Revised 2026-07-25** — added the missing "Run It" step. Headings
> marked `(revised 07/25)` below (check "On This Page" in the sidebar)
> are exactly what changed — no need to reread the rest. Full detail in
> `CHANGELOG.md` in this folder.

**What you will build:** A brand-new Android Studio project named Pocket
Inventory, created correctly from the New Project wizard, with a Java
package name you understand rather than accepted on faith. The
transferable problem this lesson is actually about: in Java, a
"namespace" is not just a label attached to code — it is a contract
between your source files and your filesystem, enforced by the
compiler (the program that translates your Java source code into a
form the computer can run — the next Concept Unit explains this in
full). Get this wrong later (rename a package carelessly, move a file
without updating its declaration) and you get a wall of confusing
compiler errors. Understanding it now means those errors will make
instant sense later instead of feeling like magic.

**What you need to know first:** Nothing — this is Lesson 1. You're
coming from Python or JavaScript: you're comfortable with variables,
`if`/`else`, loops, and writing functions. This lesson assumes **zero**
Java and **zero** object-oriented programming. Nothing here is
"assumed familiar because you took a Java class" — every Java-specific
idea is explained from scratch, at the exact point it first shows up,
including things that might otherwise feel too basic to explain.

---

## Concept Unit: The Shape of a Java Program

### The Problem

In Python, a file with one line — `print("hello")` — is a complete,
runnable program. In JavaScript (say, in Node), `console.log("hello")`
on its own in a file is also complete and runnable. Both languages let
you write statements directly at the top level of a file and just run
it.

Java does not allow this. If you put `System.out.println("hello");` by
itself in a `.java` file with nothing else around it, it will not run —
it will not even compile. Every single line of Java code, with no
exception, must live inside a **class** (a named container for code —
you'll learn what a class really is, and why Java forces this, in a
dedicated lesson soon; for now, treat it as "the box every Java file's
code must be written inside"). And if you want to actually *run* a
Java program rather than just compile it, one of those classes must
contain a method (Java's word for a function that belongs to a class or
an object) with one very specific, exact name and shape. Get the shape
slightly wrong — misspell it, capitalize it differently — and nothing
runs, often with no helpful error at all.

There's also a step here with no equivalent in Python or plain
browser/Node JavaScript: **compiling.** Python reads your `.py` file
and runs it directly, line by line, in one step. Java splits this into
two separate steps, using two separate programs:

1. `javac` — the Java **compiler**. It reads your human-written `.java`
   source file and translates it into **bytecode** (a lower-level,
   compact instruction format that isn't the CPU's native machine code,
   but also isn't your original source text) saved into a new `.class`
   file. This step catches a large category of mistakes — like using a
   variable name that doesn't exist — before your program ever runs.
2. `java` — the **JVM** (Java Virtual Machine), the program that reads
   a compiled `.class` file's bytecode and actually executes it.

Python and JavaScript hide an equivalent process from you (Python
secretly compiles to its own bytecode behind the scenes; JS engines
compile just-in-time as they run) — but you never see it as a separate
command, and you never have to think about it. Java makes it visible
and manual, and you're about to do both steps yourself.

### Introduce the Concept in Isolation

You're going to write the smallest possible Java program, entirely
outside of Android, and run it with the raw `javac` / `java` tools you
already have installed.

Create a scratch folder anywhere outside this project, and inside it,
a file named exactly `HelloWorld.java`:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello from Pocket Inventory");
    }
}
```

From a terminal, inside that folder, compile it:

```
javac HelloWorld.java
```

Nothing prints — no output at all means success. Look at the folder
now (`ls` on Mac/Linux, `dir` on Windows) and you'll see a new file
appeared: `HelloWorld.class`. That's the compiled bytecode from step 1
above. Now run it:

```
java HelloWorld
```

Real output from running this, right now, in this session:

```
Hello from Pocket Inventory
```

Notice the `java` command names `HelloWorld` — the class name — not
`HelloWorld.class` and not `HelloWorld.java`. That's deliberate, and
you'll see why in the next Concept Unit: `java` isn't opening a file,
it's looking up a class by name.

### Discard the Throwaway Example

Delete this scratch folder now (or just leave it outside the project —
either way, it never becomes part of Pocket Inventory). Its only job
was proving the compile-then-run shape to you once. From here on,
Android Studio runs both steps for you with a single Run button — but
now you know exactly what that button is actually doing underneath.

### Mechanical Walkthrough

Enumerating every distinct piece of that file, in order:

- `public class HelloWorld` — **first appearance.** `class` declares a
  new class named `HelloWorld`. `public` is an **access modifier** — a
  keyword controlling which other code is allowed to see and use this
  class. `public` means "anything, anywhere, can see this." (There are
  other access modifiers with narrower meanings — you'll get a full,
  dedicated explanation of all of them, with the actual design reason
  they exist, the first time this project genuinely needs one to matter.
  For now: every class you write in this lesson and the next few is
  `public`, full stop.) The name `HelloWorld` must exactly match the
  filename, `HelloWorld.java` — this is a Java rule, not a style
  choice: a public class's name and its file's name must be identical,
  or the compiler rejects it.
- `{` ... `}` immediately after the class declaration — **first
  appearance.** Curly braces mark the start and end of a block — in
  this case, "everything inside `HelloWorld`." Python uses
  indentation for this; JavaScript uses braces too, so this part will
  feel familiar if you've written JS.
- `public static void main(String[] args)` — **first appearance, and
  the single most important line in this lesson.** This is a **method
  signature** — like a JavaScript `function` declaration or a Python
  `def`, but written differently and, critically, one specific instance
  of it has a job no other method in your program has: it's the entry
  point. When you run `java HelloWorld`, the JVM looks *inside* the
  `HelloWorld` class specifically for a method matching this exact
  shape, and starts execution there. Breaking down each word:
  - `public` — same access modifier as above; the JVM needs to be able
    to see and call this method from outside your class.
  - `static` — means "this method belongs to the class itself, not to
    an object made from the class." This matters here for a very
    concrete reason: when your program first starts, no object exists
    yet — there's nothing to call a non-`static` method *on*. `static`
    is what lets the JVM call `main` with no object around at all.
    That's the minimum you need to run a program; the full meaning of
    `static` — and how it's different for a method that isn't
    `static` — gets its own complete lesson once we're writing code
    where the distinction actually changes behavior.
  - `void` — the method's **return type**. `void` specifically means
    "this method does not return a value." Every Java method declares
    what type of value it hands back — this is one of the biggest
    differences from Python and JavaScript, where a function can just
    return whatever, or nothing, with no upfront declaration. Java
    checks this at compile time: a method declared `void` is not
    allowed to `return` a value, and a method declared to return, say,
    an `int`, must return one on every path through it, or it fails to
    compile.
  - `main` — the exact required name. Not a suggestion, not a
    convention — the JVM is looking for this literal word. Rename it
    to `Main` or `run` and `java HelloWorld` will fail with "no main
    method found," even though the code is otherwise identical.
  - `(String[] args)` — the parameter list. `String[]` means "an array
    (a fixed-size, ordered list — you'll get the full array treatment
    in a dedicated lesson soon) of `String` values." `args` is the name
    given to that parameter — it will hold any command-line arguments
    someone typed after `java HelloWorld` when they ran it. This
    program never uses `args`; it's required to be *declared* as part
    of the standard entry-point shape, whether or not the program
    reads it.
- `System.out.println("Hello from Pocket Inventory");` — **first
  appearance.** `System` is a class Java provides for every program,
  with facilities for talking to the operating system. `System.out` —
  reading a value (`out`) that lives inside `System` — is a
  pre-built object representing "the console's output stream."
  `.println(...)` is a **method call**: `println` is a method that
  belongs to that `out` object, and writing `.methodName(...)` after a
  value is how Java calls a method that belongs to something, the same
  general shape as Python's `someObject.someMethod()` or
  JavaScript's `someObject.someMethod()` — this part genuinely is
  familiar syntax, just now attached to Java's particular built-in
  objects. `println` specifically prints its argument followed by a
  newline character (a "print with the line break already handled" —
  equivalent to Python's `print(...)` or JavaScript's `console.log(...)`).
  What an object actually *is*, and how to build your own with your
  own methods, is the entire subject of a dedicated lesson coming very
  soon (Lesson 2 starts pulling this thread). For now: this exact line
  is Java's print statement.
- `;` at the end of the `println` line — **first appearance.** Java
  requires a semicolon at the end of every statement. Python uses line
  breaks for this; JavaScript makes semicolons mostly optional. Java
  does not — a missing semicolon is one of the most common first
  compiler errors you'll hit, and now you know why the compiler is
  complaining.

### CS Lens

`public static void main(String[] args)` is Java's **entry point
convention** — a fixed, agreed-upon shape that tells a program loader
where execution begins, rather than "wherever the file's first line
is." Also recognized in: Python's `if __name__ == "__main__":` block
(same job, different mechanism — Python's version is a convention
enforced by nothing but agreement, while Java's is enforced by the JVM
refusing to run without it), C and C++'s `int main()`, and every
compiled language's linker expecting a symbol named `main` to exist
somewhere in the final program.

### SE Lens

**Why does Java force this ceremony instead of just running whatever's
at the top of the file, the way Python does?** The alternative —
top-level executable statements — is simpler to write for a five-line
script, and that's exactly the case Python and JavaScript are
optimized for: quick scripts, notebooks, browser pages. Java was
designed for large, long-lived, multi-file programs, where "just run
whatever's at the top" stops making sense the moment you have a
hundred files — which one runs first? Requiring every runnable program
to declare exactly one unambiguous entry point removes that question
entirely, at the cost of the boilerplate you just typed. That
boilerplate is the price of the guarantee: given any compiled Java
program, there is exactly one place execution can start, and it is
always spelled the same way.

---

## Concept Unit: Package Declarations Are a Promise About Folder Location

### The Problem

In a language like Python, a "namespace" is mostly cosmetic — you can
often move a file around and just fix an import statement. Java is
stricter. Every `.java` file can declare `package com.example.foo;` at
the top, and doing so makes a specific, checked claim: *"the compiler
will find me inside a folder path that ends in `com/example/foo/`."*
If that claim is false, the code does not compile. Not "runs with a
warning" — does not compile at all. This is why Android Studio's
package name field feels so heavy: it isn't naming your code, it's
committing you to a folder structure.

### Introduce the Concept in Isolation

You're going to prove this to yourself with two tiny files, entirely
outside of Android, reusing the class-and-main shape from the previous
Concept Unit.

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

### Discard the Throwaway Example — later

Not yet — run it first (this lab needs its output before it's
discarded; the discard statement is at the end of this section).

### Mechanical Walkthrough

- `package com.example.pocketinventory;` — **first appearance.** This
  line is not a comment or a suggestion. It's a compiler-checked
  declaration: "this file belongs at the end of a folder path
  `com/example/pocketinventory/`." The compiler verifies this when you
  build with a package-aware build — which `javac -d` does, as you're
  about to see. `package` must be the very first non-comment line in
  the file, before even the `class` declaration.
- `public class Greeter`, `public static void main(String[] args)`,
  `System.out.println(...)` — all **reappearing**, same as the
  previous Concept Unit, reusable silently.

### Run It Yourself

From inside the `pkgdemo` folder, run:

```
javac -d wrongplace_out wrongplace/Greeter.java
```

`javac` is the same compiler from the previous unit. `-d wrongplace_out`
is a new flag: it tells `javac` "place the compiled output into a
proper package-based folder structure rooted at `wrongplace_out`,"
instead of dropping the `.class` file next to the source file the way
plain `javac HelloWorld.java` did earlier. This flag is exactly what
makes the package/folder relationship visible — without `-d`, `javac`
doesn't care where your source file physically sits; with `-d`, it
enforces the package contract, which is also what Android Studio does
under the hood every time you build.

Run it and note what happens — real output from this session:

```
(no output — compiles silently, same as before)
```

You should **not** get an error from this step. `javac -d` doesn't
care what folder your *source* file started in (`wrongplace/`, which
doesn't match the package at all), only where it *puts* the compiled
output. Now look inside `wrongplace_out`:

```
find wrongplace_out -type f
```

Real output:

```
wrongplace_out/com/example/pocketinventory/Greeter.class
```

The compiler built the correct nested folder structure for you,
regardless of where your source file physically was. This is the
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

`-cp` (classpath) tells `java` where to look for compiled classes —
`wrongplace_out`, the folder from the previous command. Real output:

```
Hello from Pocket Inventory
```

Notice you referenced the class by its *full package path*,
`com.example.pocketinventory.Greeter`, not just `Greeter`. That's the
payoff of the whole exercise: the package name isn't decoration, it's
literally part of the class's real identity from the compiler's point
of view — exactly like `java HelloWorld` in the last unit looked up a
class by name, except now that name has a package attached.

### CS Lens

This is an instance of a **namespace / addressing scheme** — giving
every unit in a large system a globally unique, hierarchical name so
two unrelated pieces of code can both have a class called `Greeter`
without colliding. Also recognized in: DNS domain names (most-specific
label read right-to-left, same idea Java borrows its reversed-domain
convention from), file system paths themselves, URL paths, C++/C#
namespaces, and database schema-qualified table names. Python and
JavaScript both have their own versions of this — Python's module/
package system (`import package.module`) and JavaScript's ES module
paths — but neither one physically requires your folder layout to
match a declared name the way Java's compiler enforces here.

### SE Lens

**Why enforce this instead of a looser convention?** The alternative —
what languages like early JavaScript or loose Python scripts often do —
is a single global namespace where you just hope two libraries never
both define a class called `Parser`. That works fine for a small
project and becomes a real liability at scale: two libraries with a
colliding class name simply cannot be used together without manual
renaming. Java's tradeoff is more upfront ceremony (folder structure
must match) in exchange for a guarantee that a class's full name
(`com.example.pocketinventory.Greeter`) is unique across every library
you'll ever depend on, as long as everyone follows the reversed-domain
convention. The cost you're paying for that guarantee is exactly the
"why is this folder structure so deep" feeling you'll get from Android
Studio — that's not accidental complexity, it's the price of the
collision guarantee.

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
- **Dependencies:** Android Studio installed.

### The New Code

There's no code to type in this step — it's a sequence of decisions in
the wizard. Walking through them with the concept you just learned:

1. **New Project → Empty Views Activity.** ("Views" here means the
   older XML-layout UI system this whole curriculum is built on, as
   opposed to a newer alternative called Compose — you want Views,
   since that matches typical Android coursework and this curriculum.)
2. **Name:** `Pocket Inventory` — this is a display name only, separate
   from the package name.
3. **Package name:** Android Studio will suggest something like
   `com.yourname.pocketinventory`, built from a reversed identifier —
   the same reversed-domain convention from the CS Lens above. You can
   accept the suggestion. This field is the one you now understand
   isn't cosmetic: accepting it means Android Studio will create actual
   folders `com/yourname/pocketinventory/` under the hood, exactly like
   `wrongplace_out` did a moment ago, and every Java file it generates
   inside will declare `package com.yourname.pocketinventory;` at the
   top to match.
4. **Language: Java.** Double-check this specifically — Android Studio
   defaults to a different language called Kotlin now, and this
   curriculum is Java-based.
5. **Minimum SDK:** leave the suggested default. (SDK — Software
   Development Kit — is the collection of tools and pre-built code
   Android gives you to build apps; "minimum SDK" is the oldest Android
   version your app agrees to run on. Not touched again until much
   later in this curriculum, when it actually matters.)
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

The `package` line and `public class MainActivity` are both patterns
you already know from this lesson. `extends AppCompatActivity` and
everything inside the class body are genuinely new — that's Lesson 2's
subject, not this one. For now, just confirm the `package` line
matches the folder path, which is the entire point of this lesson.

### Mechanical Walkthrough

- `package com.yourname.pocketinventory;` — **reappearing**, same
  concept from the lab above, now seen for real inside an actual
  Android project.
- `public class MainActivity` — **reappearing**, same shape as
  `HelloWorld` and `Greeter` above; only the name changed.
- `extends AppCompatActivity` and everything inside the class body —
  intentionally not explained yet, flagged and picked up in Lesson 2.

### Run It

This lesson doesn't end at "confirm the package line" — Android Studio
already built something real for you, and you haven't seen it run yet.
Click the green **Run ▶** button in the toolbar (or Shift+F10). If you
don't have one already, Android Studio will prompt you to create a
virtual device — an **emulator**, a full software-simulated Android
phone running on your computer, letting you test without owning a
physical Android device. Pick any default phone profile and let it
start (the first launch is slow — later ones are much faster). Once
it's running, wait for Android Studio to build the project and install
the app — you'll see a progress bar, then the emulator will show your
app open on its own, displaying a plain screen with the text
**"Hello World!"** in the middle. That placeholder text is coming from
`activity_main.xml`, the wizard-generated layout file `setContentView`
(Lesson 2c) points at; you'll replace it with a real screen in Lesson
3. For now, this is the "visible, working result" every lesson in this
curriculum ends with — you just built and ran a real Android app.

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
Underneath, both the throwaway `HelloWorld.java` and the real
`MainActivity.java` follow the identical two-step
compile-then-run shape you proved by hand with `javac` and `java` —
Android Studio's Run button is not doing anything conceptually
different, just automating the same two commands.

## What Breaks Without This

Open `MainActivity.java` and change the top line to a package name
that does **not** match the folder it's sitting in — for example,
delete a segment: `package com.yourname;`. Try to build (Build → Make
Project). Read the actual error Android Studio gives you. It will
complain about a package mismatch — this is the same enforcement you
saw from `javac -d`, just surfaced through the IDE instead of the raw
compiler. Undo the change (Ctrl+Z, or Cmd+Z on Mac, or manually restore
the correct line) before moving on.

## Exercises

1. Redo the throwaway package lab, but this time make the folder path
   *deeper* than the package declares (e.g., source file physically at
   `pkgdemo/a/b/wrongplace/Greeter.java`, package still
   `com.example.pocketinventory`). Confirm for yourself that
   `javac -d` still doesn't care about source location, only the `-d`
   output target.
2. In the Android **Project** view (not the Android grouped view),
   physically locate the real nested folders
   `app/src/main/java/com/yourname/pocketinventory/` on disk and
   confirm they match what you saw in the grouped view.

## Definition of Done (revised 07/25 — one item added)

- [ ] You ran the `HelloWorld.java` lab yourself and saw real compiler
      and JVM output, not just read about it.
- [ ] You ran the `javac -d` package lab yourself and saw real compiler
      output.
- [ ] You can explain, in your own words, the difference between
      `javac` and `java`, and why Java has two separate steps where
      Python has one.
- [ ] You can explain why a package rename is more than a text edit.
- [ ] Pocket Inventory project exists in Android Studio, Java selected,
      package name confirmed.
- [ ] You located `MainActivity.java` and matched its `package` line to
      a real folder path yourself.
- [ ] You clicked Run, picked or created an emulator, and saw the app
      actually launch and show "Hello World!" on screen.
- [ ] Commit: `git init` in the project if not already done by the
      wizard, then commit with a message like `Initial project scaffold
      — package name confirmed to match com.yourname.pocketinventory
      folder structure` (explaining *why* it's structured that way, not
      just "initial commit").

Next lesson picks up right here: what `extends AppCompatActivity`
means (Java's inheritance, taught from scratch), what the Manifest
file is for, and why Android calls methods on your Activity that you
never call yourself.
