# Java and the Machine: A First Program

In 1991, a team of engineers at Sun Microsystems led by James Gosling was working on a project called **Green** — an attempt to build software for embedded consumer electronics devices like cable TV set-top boxes. The problem they kept running into: each device had a different processor. Software written for one couldn't run on another. Every new device meant starting over.

Gosling's solution was to introduce a layer of abstraction between the program and the hardware. Instead of compiling to machine code for a specific CPU, you'd compile to a neutral intermediate format — **bytecode** — and ship an interpreter that could run that bytecode on any device. The interpreter became the Java Virtual Machine. The language became Java.

The project pivoted. Set-top boxes weren't the future — the internet was. In 1995, Sun released Java with the tagline that would define a generation of enterprise software: **"Write Once, Run Anywhere."** A Java program compiled on a Windows machine would run identically on Linux, on macOS, on a mainframe. No recompilation needed. Just install a JVM.

That promise is still Java's defining characteristic today, though what it means has evolved. Java now runs on billions of Android phones (via the ART runtime), powers the backends of companies like LinkedIn, Twitter, and Amazon, and remains the most commonly required language in enterprise software engineering job postings. Gosling's 1991 tooling insight turned into one of the most consequential platforms in computing history.

## The Platform: JDK, JRE, and JVM

Understanding Java's toolchain requires distinguishing three things that beginners often conflate:

The **JVM** (Java Virtual Machine) is the runtime — the program that takes bytecode and executes it. It's a software emulation of a hypothetical computer, with its own instruction set (bytecode), its own memory model, and a just-in-time (JIT) compiler that translates hot bytecode into real machine code at runtime for performance.

The **JRE** (Java Runtime Environment) is the JVM plus the standard library — the thousands of classes in `java.lang`, `java.util`, `java.io`, and beyond that your programs use. End users who just want to *run* Java programs need the JRE.

The **JDK** (Java Development Kit) is the JRE plus the compiler (`javac`), debugger (`jdb`), and other development tools. Anyone *writing* Java needs the JDK.

When you compile your program with `javac`, you're producing `.class` files containing bytecode. When you run with `java`, the JVM loads those `.class` files and executes them. The JIT compiler watches which methods get called frequently and compiles them to native machine code on the fly — so Java's startup is slower than C++ (interpreter overhead), but its steady-state performance is competitive.

## Your First Java Program

Every Java program lives inside a **class**. Every class lives inside a file named exactly after it. The file extension is `.java`. Java enforces this naming rule at compile time — `Main.java` must contain `public class Main`.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Run it and watch the output:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        System.out.println("Running on: " + System.getProperty("java.version"));
        System.out.println("OS: " + System.getProperty("os.name"));
    }
}
```

## Anatomy of Hello World

**`public class Main`** — `class` is the fundamental organizational unit of Java. Unlike C++, there are no free-standing functions. Everything — absolutely everything — is a method inside a class. `public` means this class is accessible from anywhere. `Main` is the name, which must match the filename.

**`public static void main(String[] args)`** — This is the entry point, the method the JVM calls when you run your program. Each keyword matters:
- `public` — the JVM needs to be able to call it from outside the class
- `static` — it belongs to the class itself, not to any particular instance of the class (so the JVM can call it without creating a `Main` object first)
- `void` — it returns nothing (the JVM doesn't use a return value)
- `String[] args` — an array of command-line arguments passed when you run the program

**`System.out.println("Hello, World!")`** — `System` is a built-in class. `out` is a static field of type `PrintStream`. `println` is a method on that stream that prints a line followed by a newline. This chain of dots is Java's way of accessing nested objects and methods.

The semicolon `;` terminates every statement. This comes directly from C and remains one of Java's most common sources of beginner errors.

## The Compilation Pipeline

In C++, `g++ main.cpp` produces a native binary — executable directly by the CPU. Java's pipeline is different:

```
source code (.java)
       ↓
   javac (compiler)
       ↓
 bytecode (.class)
       ↓
  java (JVM + JIT)
       ↓
  machine code
```

The `.class` file is platform-neutral. The JVM on the target machine handles the final translation to actual CPU instructions. This is the "Write Once, Run Anywhere" mechanism — the bytecode is the portable artifact, not the source code.

The JIT (Just-In-Time) compiler inside the JVM is a remarkable piece of engineering. It observes which methods are called most frequently (called "hot spots" — which is why the JVM implementation is named HotSpot), compiles them to native machine code, and can even inline them across call sites. Modern JIT-compiled Java often outperforms equivalent C++ code that wasn't carefully optimized, because the JIT has runtime profile information the ahead-of-time C++ compiler doesn't.

## Multiple Statements and Comments

```java
public class Main {
    public static void main(String[] args) {
        // This is a single-line comment — ignored by the compiler
        System.out.println("Line 1");
        System.out.println("Line 2");

        /*
         * This is a multi-line comment.
         * Often used for longer explanations.
         */
        System.out.println("Line 3");

        // Concatenation: + joins strings
        String name = "Java";
        int year = 1995;
        System.out.println(name + " was released in " + year);
    }
}
```

The `+` operator is overloaded for strings in Java — it concatenates them. Unlike C++, where operator overloading is explicit and controllable, Java hard-codes string concatenation into the language. When you write `"Year: " + 1995`, Java converts the integer to a string automatically and joins them.

## `System.out.print` vs `System.out.println`

`println` adds a newline at the end. `print` does not. `printf` works like C's `printf` with format strings:

```java
public class Main {
    public static void main(String[] args) {
        System.out.print("Hello ");    // No newline
        System.out.print("World");    // Continues on same line
        System.out.println("!");      // Adds newline

        // printf: C-style formatted output
        System.out.printf("Name: %s, Age: %d, Score: %.2f%n", "Alice", 25, 98.5);

        // String.format: build a formatted string without printing
        String msg = String.format("The answer is %d", 42);
        System.out.println(msg);
    }
}
```

The `%n` in `printf` is Java's portable newline — it uses `\n` on Unix and `\r\n` on Windows, so your output is correct on any platform.

## Java vs C++: A Design Philosophy Contrast

James Gosling explicitly designed Java as a reaction to C++. The stated goals: remove the features of C++ that caused the most bugs — pointers, manual memory management, multiple inheritance, operator overloading — and replace them with safer alternatives. Java adds:

- **Automatic garbage collection** — no `delete`, no memory leaks (in theory)
- **No pointer arithmetic** — references instead, always valid or null
- **Array bounds checking** — `ArrayIndexOutOfBoundsException` instead of silent corruption
- **A single inheritance hierarchy** — everything extends `Object`
- **Interfaces** instead of multiple inheritance for types

The tradeoff: Java programs typically use more memory, start slower, and have less predictable latency than equivalent C++ (garbage collection pauses). For systems programming, embedded, and games, C++ often wins. For enterprise software, Android apps, and large team codebases, Java's safety guarantees and rich ecosystem often win.

This series covers Java deeply. Not just how to write it — but why it works the way it does, what the JVM is doing beneath your code, and where the design choices came from. Let's build up from here.
