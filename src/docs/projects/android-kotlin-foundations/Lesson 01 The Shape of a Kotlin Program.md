# Lesson 01: The Shape of a Kotlin Program

**What you will build:** Nothing visual yet — the smallest possible
Kotlin program, typed and run by hand with the raw `kotlinc` and `kotlin`
tools, outside of any project or IDE, the same throwaway-scratch approach
the Java series' Lesson 01 used. The transferable problem: you already
know Java's shape is strict — a mandatory `class` wrapper, one exact
`public static void main(String[] args)` signature. Kotlin compiles to
the exact same kind of JVM bytecode Java does. So which parts of that
ceremony does Kotlin actually keep, and which does it drop — and for the
parts it drops, does the requirement really disappear, or does the
compiler just start doing it *for* you without telling you?

**What you need to know first:** The Java series' Lesson 01 (`The Shape
of a Java Program`) — specifically its `class` container requirement,
the exact `public static void main(String[] args)` shape, `javac`/`java`
as two separate steps, and bytecode/the JVM as the thing that actually
executes a compiled program. This lesson assumes all of that and spends
its entire time on what's different.

**Terms introduced in this lesson:**
- **Top-level function** — a function declared directly in a file, not
  inside any class. Kotlin allows this; Java's Lesson 01 rule ("every
  line of code must live inside a class") does not.
- **`fun`** — the keyword that introduces a function declaration; Kotlin's
  equivalent of Java's return-type-first method syntax.
- **`fun main()`** — Kotlin's entry point shape. Contrast target: Java
  required one exact, fixed signature; Kotlin's is looser, and this
  lesson proves exactly how.
- **Semicolon-optional statement termination** — Kotlin infers most
  statement boundaries from line breaks; the semicolon becomes an
  optional separator, not a requirement.
- **`println`** — a top-level standard library function in Kotlin, called
  directly with no receiver, unlike Java's `System.out.println(...)`.
- **`kotlinc` / `.jar` / `kotlin`** — Kotlin's own compile-then-run
  tooling, and where it still bottoms out on the same `java`/JVM Lesson
  01 already taught.

---

## Concept Unit: The Shape of a Kotlin Program

### The Problem

Java's Lesson 01 established two hard rules: every line of code lives
inside a `class`, and running a program requires one method matching an
exact, fixed shape — `public static void main(String[] args)` — found by
name, not by convention. Kotlin runs on the very same JVM, and a `.kt`
file compiles down to the very same kind of `.class` bytecode a `.java`
file does. That raises a real question, not a rhetorical one: does a
program written in a *different* language, targeting the *same* virtual
machine, have to obey the same rules? If Kotlin drops the `class`
requirement — and it does — where does the JVM's own, unchanged
requirement for an entry point actually go? It cannot simply vanish; the
JVM itself hasn't changed. Something has to still be satisfying it.

### Introduce the Concept in Isolation

Create a scratch folder anywhere outside of any project, and inside it a
file named exactly `HelloWorld.kt`:

```kotlin
fun main() {
    println("Hello, Kotlin")
}
```

Notice immediately what's absent compared to Java's version: no `class`
declaration wraps this, no `public`, no `static`, no `void`, no
`String[] args`. From a terminal, inside that folder, compile it:

```
kotlinc HelloWorld.kt -include-runtime -d HelloWorld.jar
```

Real output, from running this just now: nothing printed — silence means
success, exactly like `javac`. `-include-runtime` bundles Kotlin's own
standard-library classes into the output so the result is a single
self-contained `.jar` (a zipped archive of compiled `.class` files plus a
manifest) rather than a bare `.class` file needing Kotlin's runtime on a
separate classpath. Now run it:

```
java -jar HelloWorld.jar
```

Real output, from running this just now:

```
Hello, Kotlin
```

That command is worth stopping on: it's `java`, the exact same JVM
launcher Lesson 01 used to run `HelloWorld.class` — not a `kotlin`-
specific runner. Kotlin compiled down to something the ordinary `java`
tool can execute directly, with no idea it started life as Kotlin source.

### Proving the Class Didn't Actually Disappear

The source file above declares no class — but Java's Lesson 01 rule that
the JVM only knows how to start a program via a `class` containing
`public static void main(String[] args)` is a rule about the JVM, and the
JVM did not change. So what is `java -jar` actually finding and calling
inside `HelloWorld.jar`? Asserting "the compiler handles it" here would
be exactly the kind of unverified claim about hidden behavior worth being
suspicious of — so instead, look inside the jar for real. Unzip it and
disassemble the class Kotlin generated with `javap`, the JVM's own
bytecode-inspection tool:

```
unzip -o HelloWorld.jar -d extracted
javap -p extracted/HelloWorldKt.class
```

Real output, from running this just now:

```
Compiled from "HelloWorld.kt"
public final class HelloWorldKt {
  public static final void main();
  public static void main(java.lang.String[]);
}
```

This is the proof, not an assertion: Kotlin's compiler invented a class
named `HelloWorldKt` — the filename, `HelloWorld`, with `Kt` appended —
that you never wrote, and put *two* `main` methods inside it. Disassemble
the bytecode of both, with `javap -c` (`-c` adds the actual bytecode
instructions):

```
javap -c extracted/HelloWorldKt.class
```

Real output, from running this just now:

```
public final class HelloWorldKt {
  public static final void main();
    Code:
       0: ldc           #8      // String Hello, Kotlin
       2: getstatic     #14     // Field java/lang/System.out:Ljava/io/PrintStream;
       5: swap
       6: invokevirtual #20     // Method java/io/PrintStream.println:(Ljava/lang/Object;)V
       9: return

  public static void main(java.lang.String[]);
    Code:
       0: invokestatic  #23     // Method main:()V
       3: return
}
```

Read the second method's bytecode: its entire body is one instruction —
call the first `main()` (`invokestatic`, calling a method that belongs to
the class itself, exactly like Java's `static`), then `return`. That
second method, with the exact signature `public static void
main(java.lang.String[])`, is a compiler-generated shim whose only job is
to satisfy the JVM's real, unchanged Lesson-01 requirement — it exists
purely so `java` has something matching the exact shape it's hardcoded to
look for. Your own `fun main()` is what actually runs; the args-taking
overload exists only to be found. Nothing about the JVM's entry-point
rule was ever dropped. Kotlin's compiler is writing the Java-shaped
boilerplate for you, invisibly, every time.

### Discard the Throwaway Example

Delete this scratch folder now. Like Java's Lesson 01 `HelloWorld.java`,
it never becomes part of any real project — its only job was proving, by
disassembling real bytecode rather than trusting a description, exactly
what Kotlin's compiler does with the `class`-and-`main` ceremony Java
made you write by hand.

### Mechanical Walkthrough

Enumerating every distinct piece of `HelloWorld.kt` above, in order:

- `fun main()` — **first appearance.** `fun` is the keyword that starts
  every Kotlin function declaration — Kotlin's equivalent of Java writing
  a return type first (`void main(...)`). `main` is still the required
  name for Kotlin's own entry-point convention, same as Java — but two
  real differences: no enclosing `class` is required around it (this is a
  **top-level function** — a function that exists directly in the file,
  something Java's Lesson 01 rule flatly forbade), and the parameter list
  is empty. Java's `main` required `(String[] args)` unconditionally,
  whether or not the program read it; Kotlin allows a fully empty
  parameter list *or* `(args: Array<String>)` when a program actually
  needs command-line arguments — the language doesn't force you to
  declare something you don't use. There is also no `public`, `static`,
  or `void` written anywhere: this lesson's disassembly proved *why*
  that's safe — the compiler regenerates the equivalent JVM-required
  shape (`public static void main(String[])`) on its own, as the second
  method seen in `javap`'s output, so nothing the JVM actually needs was
  removed, only what you have to *type*.
- `{` ... `}` — genuinely basic, already-established syntax from Java's
  Lesson 01: curly braces still mark a block's start and end, unchanged.
- `println("Hello, Kotlin")` — **first appearance.** Java wrote
  `System.out.println(...)` — a method call on the `out` object living
  inside the `System` class. Kotlin's `println` is a **top-level
  function** in Kotlin's standard library, callable directly by name with
  no object in front of it at all — the same "top-level, no class needed"
  idea main itself demonstrates, applied to a function the standard
  library ships for you rather than one you wrote. It does the same job:
  print its argument, then a newline.
- No `;` after `println(...)` — **first appearance.** Java required a
  semicolon ending every statement. Kotlin infers most statement
  boundaries from line breaks, making the semicolon optional in this
  position — confirmed directly: adding `;` back after this line still
  compiles and runs identically, since Kotlin accepts an optional trailing
  semicolon, it just doesn't require one. The one place it stops being
  optional is packing two statements onto a single line — `val x = 1; val
  y = 2` on one line genuinely needs the `;` to separate them, since
  there's no line break there to infer a boundary from — real, run
  separately, this is what confirms it:

  ```kotlin
  fun main() {
      println("Hello, Kotlin");
      val x = 1; val y = 2
      println(x + y)
  }
  ```

  Real output, from running this just now:

  ```
  Hello, Kotlin
  3
  ```

  Proving both halves of the same rule at once: the trailing `;` after
  `println` was harmless but unnecessary, and the `;` between `val x = 1`
  and `val y = 2` was load-bearing — remove it and the two declarations
  on one line become ambiguous to the compiler.

### CS Lens

This is the same **entry-point convention** Java's Lesson 01 named — a
fixed, agreed-upon shape a program loader looks for to know where
execution begins. What's new here is seeing that convention survive
*underneath* a language that no longer makes you write it by hand — the
convention belongs to the JVM, not to Java specifically, and Kotlin
targeting the same JVM has to satisfy the same convention, whether or not
its own syntax makes that visible.

Also recognized in: any language with multiple front-ends compiling to
one shared bytecode or IR (Java and Kotlin both targeting the JVM;
C, Rust, and Swift all capable of targeting LLVM IR); a C compiler
silently inserting a `_start` symbol around the `main` you wrote, which
the OS loader — not you — actually calls first.

### SE Lens

**Why would a language designer choose to auto-generate ceremony instead
of just changing what the JVM requires?** Changing the JVM's own
entry-point contract was never Kotlin's decision to make — the JVM
predates Kotlin by over a decade, runs an enormous existing ecosystem of
Java bytecode, and changing what it looks for at startup would break all
of it. Kotlin's actual choice was narrower and cheaper: keep the
underlying contract completely untouched, and have the *compiler* absorb
the boilerplate instead of the *programmer*. The tradeoff this lesson's
`javap` output makes visible: you now write less code, but the code you
write is no longer a complete, literal picture of what actually runs —
reading `fun main()` alone, without ever disassembling anything, would
never reveal that a second, args-taking `main` exists purely to satisfy a
rule you didn't know was still in force. Convenience was purchased with a
small, permanent gap between source and reality — the same gap every
compiler-generated boilerplate trades on, and the exact reason this
lesson insisted on `javap` proof rather than a confident sentence.

---

## Connect the Pieces

One trace through this lesson: `kotlinc HelloWorld.kt -include-runtime -d
HelloWorld.jar` read a class-free, four-line Kotlin file and produced
`HelloWorld.jar` — inside which, unasked, it had generated a real class,
`HelloWorldKt`, containing not one `main` method but two: the one your
source actually defined, and a second, `String[]`-shaped one whose entire
body is a single call back into the first. `java -jar HelloWorld.jar`
then ran exactly the way it would have for a hand-written Java class —
because by the time `java` sees it, that's precisely what it is.

## What Breaks Without This

Recreate the throwaway example, but delete `main` entirely, leaving only
an unrelated function:

```kotlin
fun greet() {
    println("Hello, Kotlin")
}
```

Save as `NoMain.kt`, compile, and try to run:

```
kotlinc NoMain.kt -include-runtime -d NoMain.jar
java -jar NoMain.jar
```

Real output, from running this just now:

```
no main manifest attribute, in NoMain.jar
```

That error comes from the jar's manifest — `kotlinc` had no `main` to
point `Main-Class:` at, so `java -jar` doesn't even know which class to
try. Compiling instead without packaging into a jar, then asking the JVM
to run the generated class directly by name — the same way Java's Lesson
01 ran `java HelloWorld` — surfaces the *actual* JVM-level error, not a
jar-packaging one:

```
kotlinc NoMain.kt -d out.jar
java -cp "out.jar:$(find /opt/homebrew -name 'kotlin-stdlib*.jar' | head -1)" NoMainKt
```

Real output, from running this just now:

```
Error: Main method not found in class NoMainKt, please define the main method as:
   public static void main(String[] args)
or a JavaFX application class must extend javafx.application.Application
```

Read that message again: it is, word for word, the same error Java's
Lesson 01 triggered by renaming `main` to `Main` — because it's the same
JVM launcher, enforcing the same unchanged rule, against a class named
`NoMainKt` that this lesson's earlier `javap` proved the compiler
generates automatically from the filename. Nothing about deleting `fun
main()` removed the requirement; it only removed the compiler-generated
shim that used to satisfy it. Restore `fun main() { ... }` and delete
both scratch folders when done.

## Exercises

1. Rename the file's function from `main` to `run`, keeping everything
   else identical. Compile and try to run it exactly as `NoMain.kt` was
   run above. Confirm you get the same "Main method not found" error, and
   explain, in your own words, why renaming the function has the same
   effect as deleting it.
2. Add a second top-level function above `main` — anything, e.g. `fun
   shout(msg: String) { println(msg.uppercase()) }` — and call it from
   inside `main`. Recompile, rerun, and confirm this still works with no
   enclosing class anywhere in the file, proving "top-level function" was
   not something special about `main` specifically.
3. Run `javap -p` again on this two-function version's generated
   `HelloWorldKt.class` (or whatever the file is now named) and find both
   functions listed as `static` methods on the same generated class —
   confirming a file with multiple top-level functions still produces
   exactly one class, not one per function.

## Definition of Done

- [ ] You ran `kotlinc`/`kotlin`/`java -jar` yourself and saw real output
      at every step, not just read about it.
- [ ] You disassembled a compiled Kotlin class with `javap` yourself and
      can point to the exact compiler-generated `main(String[])` overload
      that satisfies the JVM's unchanged entry-point rule.
- [ ] You triggered both the "no main manifest attribute" and the "Main
      method not found" errors yourself, and can explain why they're
      different symptoms of the same missing thing.
- [ ] You can explain, in your own words, why Kotlin dropping the `class`
      requirement in source code does not mean the JVM's own requirement
      for one went away.
- [ ] Commit: not applicable yet — this lesson's code was two scratch
      folders, deleted, not part of any tracked project.

Next: a real Kotlin Android Studio project — and the language feature
Java's Lesson 04 dedicated an entire lesson to living with
(`NullPointerException`), which Kotlin's type system turns into a
compile-time question instead.
