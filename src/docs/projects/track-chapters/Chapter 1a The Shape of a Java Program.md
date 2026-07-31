# Chapter 1, Lesson A: The Shape of a Java Program

**What you will build:** Nothing app-related yet — the smallest
possible Java program, run with the raw `javac`/`java` tools, entirely
outside of Android. The transferable problem: every language has some
minimum shape a runnable program must take. Python and JavaScript let
you write a single bare statement and run it. Java doesn't. Before
touching an Android project at all, you need to recognize that shape on
sight, and understand the two separate steps (compile, then run) Java
splits execution into that Python and JavaScript hide from you.

**What you need to know first:** Nothing — you're coming from Python or
JavaScript: comfortable with variables, `if`/`else`, loops, and writing
functions. This lesson assumes zero Java.

**Terms introduced in this lesson:**
- **`class`** — the required container every line of Java code must
  live inside; nothing can run at a file's top level the way it can in
  Python or JavaScript.
- **Public class name must match its filename** — `HelloWorld` must
  live in a file named exactly `HelloWorld.java`; this is a compiler
  rule, not a style choice.
- **`public` (recognition only)** — one of Java's access modifiers. For
  now, you only need to recognize that `public class` and `public
  static void main(...)` are the required forms you'll see in almost
  every Java program. What access modifiers actually control is a
  later lesson's subject.
- **`main` method / entry point** — the one exact method shape,
  `public static void main(String[] args)`, the JVM looks for inside a
  named class to begin running a program.
- **`static` (minimum meaning only)** — marks something that belongs to
  the class itself. For this lesson, the only important fact is that
  the JVM requires `main` to be `static` so it can start your program
  before anything else in it exists yet. What else `static` changes is
  a later lesson's subject.
- **Return type / `void`** — the type of value a method declares it
  hands back; `void` means "returns nothing," checked by the compiler.
- **`String[] args` (ceremonial, for now)** — part of Java's required
  entry-point shape; every `main` method needs this parameter list
  written exactly this way, whether or not the program actually reads
  it. What an array actually is gets its own lesson later.
- **`System.out.println` / method call syntax** — Java's built-in print
  statement, and the general `.methodName(...)` shape for calling a
  method that belongs to an object.
- **Statement / semicolon** — Java requires a semicolon at the end of
  every statement, where Python uses line breaks and JavaScript makes
  it optional.
- **Compiler (`javac`) / bytecode / JVM (`java`)** — Java's two
  separate steps, translate-then-run, replacing the one step Python and
  JavaScript hide from you.

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
dedicated later lesson; for now, treat it as "the box every Java file's
code must be written inside"). And if you want to actually *run* a Java
program rather than just compile it, one of those classes must contain
a method (Java's word for a function that belongs to a class or an
object) with one very specific, exact name and shape. Get the shape
slightly wrong — misspell it, capitalize it differently — and nothing
runs, often with no helpful error at all.

There's also a step here with no equivalent in Python or plain
browser/Node JavaScript: **compiling.** Python reads your `.py` file and
runs it directly, line by line, in one step. Java splits this into two
separate steps, using two separate programs:

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

Create a scratch folder anywhere outside any project, and inside it, a
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

Nothing prints — no output at all means success. Look at the folder now
and you'll see a new file appeared: `HelloWorld.class`. That's the
compiled bytecode from step 1 above. Now run it:

```
java HelloWorld
```

Real output from running this, right now, in this session:

```
Hello, Java
```

Notice the `java` command names `HelloWorld` — the class name — not
`HelloWorld.class` and not `HelloWorld.java`. That's deliberate: `java`
isn't opening a file, it's looking up a class by name.

### Discard the Throwaway Example

Delete this scratch folder now — it never becomes part of any real
project. Its only job was proving the compile-then-run shape to you
once. Android Studio runs both steps for you with a single Run button —
but now you'll know exactly what that button is actually doing
underneath, the moment it comes up.

### Mechanical Walkthrough

Enumerating every distinct piece of that file, in order:

- `public class HelloWorld` — **first appearance.** `class` declares a
  new class named `HelloWorld`. `public` is an **access modifier** — a
  keyword controlling which other code is allowed to see and use this
  class. `public` means "anything, anywhere, can see this." The name
  `HelloWorld` must exactly match the filename, `HelloWorld.java` —
  this is a Java rule, not a style choice: a public class's name and
  its file's name must be identical, or the compiler rejects it.
- `{` ... `}` immediately after the class declaration — **first
  appearance.** Curly braces mark the start and end of a block — in
  this case, "everything inside `HelloWorld`." Python uses indentation
  for this; JavaScript uses braces too, so this part will feel familiar
  if you've written JS.
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
  - `void` — the method's **return type**. `void` specifically means
    "this method does not return a value." Every Java method declares
    what type of value it hands back — this is one of the biggest
    differences from Python and JavaScript, where a function can just
    return whatever, or nothing, with no upfront declaration.
  - `main` — the exact required name. Not a suggestion, not a
    convention — the JVM is looking for this literal word. Rename it to
    `Main` or `run` and `java HelloWorld` will fail with "no main method
    found," even though the code is otherwise identical.
  - `(String[] args)` — the parameter list. `String[]` means "an array
    (a fixed-size, ordered list) of `String` values." `args` is the
    name given to that parameter — it will hold any command-line
    arguments someone typed after `java HelloWorld` when they ran it.
    This program never uses `args`; it's required to be *declared* as
    part of the standard entry-point shape, whether or not the program
    reads it.
- `System.out.println("Hello, Java");` — **first appearance.** `System`
  is a class Java provides for every program, with facilities for
  talking to the operating system. `System.out` — reading a value
  (`out`) that lives inside `System` — is a pre-built object
  representing "the console's output stream." `.println(...)` is a
  **method call**: `println` is a method that belongs to that `out`
  object, and writing `.methodName(...)` after a value is how Java
  calls a method that belongs to something, the same general shape as
  Python's `someObject.someMethod()` or JavaScript's
  `someObject.someMethod()`. `println` specifically prints its argument
  followed by a newline character — equivalent to Python's `print(...)`
  or JavaScript's `console.log(...)`.
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
script, and that's exactly the case Python and JavaScript are optimized
for: quick scripts, notebooks, browser pages. Java was designed for
large, long-lived, multi-file programs, where "just run whatever's at
the top" stops making sense the moment you have a hundred files — which
one runs first? Requiring every runnable program to declare exactly one
unambiguous entry point removes that question entirely, at the cost of
the boilerplate you just typed.

---

## Connect the Pieces

One trace through this lesson: `javac HelloWorld.java` read your source
text and produced `HelloWorld.class`, a file of bytecode. `java
HelloWorld` then loaded that bytecode and looked, specifically, for a
method matching `public static void main(String[] args)` inside the
class named `HelloWorld` — found it, and ran its one line. Two
commands, two distinct jobs, one program.

## What Breaks Without This

In `HelloWorld.java`, rename `main` to `Main` (capital M) and try to run
it again — recompile first (`javac HelloWorld.java`, which will succeed
with no error at all), then run (`java HelloWorld`). Read the real
error: something to the effect of "main method not found in class
HelloWorld." This proves the entry-point shape is checked by name, at
the moment you try to *run*, not at compile time — the file compiles
perfectly with no `main` at all. Restore the correct spelling
afterward.

## Exercises

1. Delete the semicolon from the end of the `println` line and try to
   compile. Read the real compiler error and confirm it names the exact
   line.
2. Change `void` to `int` and try to compile with no `return` statement
   added. Read the real error and connect it back to this lesson's own
   explanation of what a return type is.

## Definition of Done

- [ ] You ran `javac`/`java` yourself and saw the real two-step
      process, not just read about it.
- [ ] You can explain, in your own words, why Java has two separate
      steps where Python has one.
- [ ] You triggered the "main method not found" error yourself by
      renaming `main`, and restored it.
- [ ] You can name, without looking, every word in
      `public static void main(String[] args)` and what it does.

Next: Chapter 1, Lesson B picks up here — a real Android Studio
project, and why the package name field in that wizard isn't cosmetic.
