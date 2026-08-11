# Lesson 01: The Shape of a Java Program

**What you will build:** Nothing visual yet — the smallest possible Java
program, typed and run by hand with the raw `javac` and `java` tools,
outside of any project or IDE. The transferable problem: every language
has some minimum shape a runnable program must take, and Java's shape is
stricter than most. Before any real app gets built, you need to recognize
that shape on sight and understand the two separate steps — compile, then
run — that Java splits program execution into.

**What you need to know first:** Nothing about Java. This lesson assumes
you're comfortable with variables, `if`/`else`, loops, and writing
functions in *some* language (Python, JavaScript, whatever) — not Java
specifically.

**Terms introduced in this lesson:**
- **`class`** — the required container every line of Java code must live
  inside; nothing can run at a file's top level the way it can in Python
  or JavaScript.
- **Access modifier / `public`** — a keyword controlling which other code
  is allowed to see and use a class or method; `public` means "anything,
  anywhere, can see this."
- **`main` method / entry point** — the one exact method shape, `public
  static void main(String[] args)`, that the JVM looks for inside a named
  class to begin running a program.
- **`static`** — marks a method as belonging to the class itself, not to
  an object made from the class.
- **Return type / `void`** — the type of value a method declares it hands
  back; `void` means "returns nothing."
- **Parameter list / array (`String[]`)** — an array is a fixed-size,
  ordered list of values; `String[] args` is an array of `String` values.
- **`System.out.println` / method call syntax** — Java's built-in print
  statement, and the general `.methodName(...)` shape for calling a
  method that belongs to an object.
- **Statement / semicolon** — Java requires a semicolon at the end of
  every statement.
- **Compiler (`javac`) / bytecode / JVM (`java`)** — Java's two separate
  steps, translate-then-run.

**Objects and methods used**
- No supporting cast to cover separately — `System.out.println` is
  this lesson's own subject, and gets full treatment below rather than
  being deferred to this section.

---

## Concept Unit: The Shape of a Java Program

### The Problem

In Python, a file containing one line — `print("hello")` — is a
complete, runnable program. In JavaScript, `console.log("hello")` alone
in a file is also complete and runnable. Both languages let you write
statements directly at the top level of a file and just run it, no
ceremony required.

Java does not allow this. A bare `System.out.println("hello");` sitting
alone in a `.java` file will not run — it will not even compile. Every
line of Java code must live inside a **class**: a named container for
code. What a class actually *is* — a blueprint for building objects —
matters later, once you're building things with it; for this lesson, it's
only "the box every Java file's code must be written inside." And if you
want to *run* a Java program rather than just compile it, one of those
classes must contain a method (a function that belongs to a class or
object) with one very specific, exact name and shape. Get that shape
even slightly wrong and nothing runs — often with no helpful error
telling you why.

There's also a step here with no equivalent in Python or plain
browser/Node JavaScript: **compiling**. Python reads your `.py` file and
runs it directly, line by line, in one step. Java splits this into two
separate steps, using two separate programs:

1. `javac` — the Java **compiler**. It reads your human-written `.java`
   source file and translates it into **bytecode** (a lower-level,
   compact instruction format — not the CPU's native machine code, and
   not your original source text either) saved into a new `.class` file.
   This step catches a large category of mistakes — like using a
   variable that doesn't exist — before your program ever runs.
2. `java` — the **JVM** (Java Virtual Machine). It reads a compiled
   `.class` file's bytecode and actually executes it.

Python and JavaScript hide an equivalent translation step from you
(Python compiles to its own bytecode internally; JS engines compile
just-in-time) — but you never see it as a separate command and never
think about it. Java makes it visible and manual, and you're about to do
both steps yourself.

### Introduce the Concept in Isolation

Create a scratch folder anywhere outside of any project, and inside it a
file named exactly `HelloWorld.java`:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Java");
    }
}
```

From a terminal, inside that folder, compile it:

```
javac HelloWorld.java
```

No output at all means success. Look at the folder and you'll see a new
file: `HelloWorld.class` — the compiled bytecode from step 1. Now run it:

```
java HelloWorld
```

Real output, from running this just now:

```
Hello, Java
```

Notice the `java` command names `HelloWorld` — the class name — not
`HelloWorld.class` and not `HelloWorld.java`. That's deliberate: `java`
isn't opening a file, it's looking up a compiled class by name. This
two-command, translate-then-run sequence is what every Android build
does under the hood, on a much larger scale, every time you press Run —
this is the mechanism that button is hiding from you.

### Discard the Throwaway Example

Delete this scratch folder now. It never becomes part of any real
project — its only job was proving the compile-then-run shape to you
once, by hand, so that when a build tool does it automatically later,
you know exactly what's happening underneath.

### Mechanical Walkthrough

Enumerating every distinct piece of the file above, in order:

- `public class HelloWorld` — **first appearance.** `class` declares a
  new class named `HelloWorld`. `public` is an **access modifier** — a
  keyword controlling which other code is allowed to see and use this
  class. `public` means "anything, anywhere, can see this." The name
  `HelloWorld` must exactly match the filename `HelloWorld.java` — this
  is a compiler rule, not a style choice: a public class's name and its
  file's name must be identical or the compiler rejects it outright.
- `{` ... `}` immediately after the class declaration — **first
  appearance.** Curly braces mark the start and end of a block — here,
  "everything inside `HelloWorld`." Python uses indentation for this;
  JavaScript also uses braces, so this will feel familiar if you've
  written JS.
- `public static void main(String[] args)` — **first appearance, and the
  most important line in this lesson.** This is a **method signature** —
  like a JavaScript `function` declaration or a Python `def`, written
  differently, and one specific instance of it has a job no other method
  in your program has: it's the entry point. When you run `java
  HelloWorld`, the JVM looks *inside* the `HelloWorld` class specifically
  for a method matching this exact shape and starts execution there.
  Breaking down each word:
  - `public` — same access modifier as above; the JVM needs to be able to
    see and call this method from outside your class.
  - `static` — means "this method belongs to the class itself, not to an
    object made from the class." This matters concretely here: when your
    program first starts, no object exists yet — there's nothing to call
    a non-`static` method *on*. `static` is what lets the JVM call `main`
    before anything else in your program exists.
  - `void` — the method's **return type**. `void` means "this method
    does not return a value." Every Java method declares what type of
    value it hands back — a real difference from Python and JavaScript,
    where a function can return whatever, or nothing, with no upfront
    declaration.
  - `main` — the exact required name. Not a convention, not a
    suggestion — the JVM is looking for this literal word. Rename it to
    `Main` or `run` and `java HelloWorld` fails with "no main method
    found," even though the code is otherwise identical.
  - `(String[] args)` — the parameter list. `String[]` means "an array
    (a fixed-size, ordered list) of `String` values." `args` is the name
    given to that parameter — it holds any command-line arguments typed
    after `java HelloWorld` when the program is run. This program never
    reads `args`; it's required to be *declared* as part of the standard
    entry-point shape whether or not the program uses it.
- `System.out.println("Hello, Java");` — **first appearance.** `System`
  is a class Java provides to every program, with facilities for talking
  to the operating system. `System.out` — reading a value (`out`) that
  lives inside `System` — is a pre-built object representing "the
  console's output stream." `.println(...)` is a **method call**:
  `println` is a method belonging to that `out` object, and writing
  `.methodName(...)` after a value is how Java calls a method that
  belongs to something — the same general shape as Python's
  `someObject.someMethod()` or JavaScript's `someObject.someMethod()`.
  `println` prints its argument followed by a newline — equivalent to
  Python's `print(...)` or JavaScript's `console.log(...)`.
- `;` at the end of the `println` line — **first appearance.** Java
  requires a semicolon at the end of every statement. Python uses line
  breaks for this; JavaScript makes semicolons mostly optional. Java does
  not — a missing semicolon is one of the most common first compiler
  errors you'll hit.

### CS Lens

`public static void main(String[] args)` is Java's **entry point
convention** — a fixed, agreed-upon shape that tells a program loader
where execution begins, rather than "wherever the file's first line is."

Also recognized in: Python's `if __name__ == "__main__":` block (same
job, different mechanism — Python's version is enforced by nothing but
agreement, while Java's is enforced by the JVM refusing to run without
it), C and C++'s `int main()`, and every compiled language's linker
expecting a symbol named `main` to exist somewhere in the final program.

### SE Lens

**Why does Java force this ceremony instead of just running whatever's at
the top of the file, the way Python does?** The alternative — top-level
executable statements — is simpler to write for a five-line script, and
that's exactly the case Python and JavaScript optimize for: quick
scripts, notebooks, browser pages. Java was designed for large,
long-lived, multi-file programs, where "just run whatever's at the top"
stops making sense the moment a program has a hundred files — which one
runs first? Requiring every runnable program to declare exactly one
unambiguous entry point removes that question entirely, at the cost of
the boilerplate you just typed.

---

## Connect the Pieces

One trace through this lesson: `javac HelloWorld.java` read your source
text and produced `HelloWorld.class`, a file of bytecode. `java
HelloWorld` then loaded that bytecode and looked, specifically, for a
method matching `public static void main(String[] args)` inside the
class named `HelloWorld` — found it, and ran its one line. Two commands,
two distinct jobs, one program.

## What Breaks Without This

Recreate `HelloWorld.java` from above, rename `main` to `Main` (capital
M), and try to run it — recompile first (`javac HelloWorld.java`, which
succeeds with no error at all), then run (`java HelloWorld`). Real error
from doing this just now:

```
Error: Main method not found in class HelloWorld, please define the main method as:
   public static void main(String[] args)
```

This proves the entry-point shape is checked by name, at the moment you
try to *run*, not at compile time — the file compiles perfectly with no
`main` at all. Restore the correct spelling and delete the scratch folder
when done.

## Exercises

1. Delete the semicolon from the end of the `println` line and try to
   compile. Read the real compiler error and confirm it names the exact
   line.
2. Change `void` to `int` and try to compile with no `return` statement
   added. Read the real error and connect it to this lesson's own
   explanation of what a return type is.

## Definition of Done

- [ ] You ran `javac`/`java` yourself and saw the real two-step process,
      not just read about it.
- [ ] You can explain, in your own words, why Java has two separate steps
      where Python has one.
- [ ] You triggered the "main method not found" error yourself by
      renaming `main`, and saw the real message.
- [ ] You can name, without looking, every word in `public static void
      main(String[] args)` and what it does.
- [ ] Commit: not applicable yet — this lesson's code was a scratch
      folder, deleted, not part of any tracked project.

Next: a real Android Studio project — and why the class it generates for
you already contains two words this lesson hasn't explained yet
(`extends`, `@Override`).
