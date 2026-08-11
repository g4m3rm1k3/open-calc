# Concept: Java Package Declarations

**What you'll understand by the end:** why a Java package name isn't
just a label — it's a compiler-checked claim about where a file lives
on disk, and what breaks when that claim is false.

**Prerequisites:** a compile-then-run Java program (`javac`/`java`,
`class`, `public static void main`).

## Setup

```
mkdir pkgdemo && cd pkgdemo
```
Plain JDK, no dependencies.

## The Problem

In a language like Python, a namespace is mostly cosmetic — you can
often move a file around and just fix an import statement. Java is
stricter. A `.java` file that declares `package com.example.demo;` at
the top is making a specific, checked claim: the compiler will find it
inside a folder path ending in `com/example/demo/`. If that claim is
false, the code does not compile.

## The Isolated Example

Create a folder structure that does **not** match the package name, on
purpose:

```
mkdir -p wrongplace
```

`wrongplace/Greeter.java`:
```java
package com.example.demo;

public class Greeter {
    public static void main(String[] args) {
        System.out.println("Hello from the demo package");
    }
}
```

Compile with the `-d` flag, from inside `pkgdemo`:
```
javac -d wrongplace_out wrongplace/Greeter.java
```

**Real output:** the command itself prints nothing (success). Then:
```
find wrongplace_out
```
```
wrongplace_out
wrongplace_out/com
wrongplace_out/com/example
wrongplace_out/com/example/demo
wrongplace_out/com/example/demo/Greeter.class
```

Run it, referencing it by its fully-qualified name:
```
java -cp wrongplace_out com.example.demo.Greeter
```
**Real output:**
```
Hello from the demo package
```

**What this proves:** the compiler built the nested `com/example/demo/`
structure for the compiled output, regardless of the fact that the
*source* file physically sat in a folder called `wrongplace` — the
package declaration drives where the compiled class lives, independent
of where the source started. Running it required the class's full,
fully-qualified name (`com.example.demo.Greeter`), not just `Greeter` —
the package name is literally part of the class's real identity, from
the compiler's point of view.

## Mechanical Walkthrough

- `package com.example.demo;` — a **package declaration**: a
  compiler-checked claim that this file lives at the end of a folder
  path matching `com/example/demo/`.
- `javac -d wrongplace_out wrongplace/Greeter.java` — the `-d` flag
  tells `javac` to build the full package-derived folder structure
  under `wrongplace_out`, from the `package` line, not from
  `wrongplace/`.
- `java -cp wrongplace_out com.example.demo.Greeter` — running it needs
  the **fully-qualified name** — the class's full identity, package
  path included.

## CS Lens

This is a **namespace / addressing scheme** — giving every unit in a
large system a globally unique, hierarchical name so two unrelated
pieces of code can both have a class called `Greeter` without
colliding.

Also recognized in: DNS domain names (most-specific label read
right-to-left — Java's reversed-domain package convention is borrowed
directly from this), filesystem paths, URL paths, C++/C# namespaces,
and database schema-qualified table names.

## SE Lens

Why enforce this instead of a looser convention? The alternative — a
single global namespace where you just hope two libraries never both
define a class called `Parser` — works fine for a small project and
becomes a real liability at scale: two libraries with a colliding class
name simply cannot be used together without manual renaming. Java
trades more upfront ceremony (folder structure must match) for a
guarantee that a class's full name is unique across every library
depended on, as long as everyone follows the reversed-domain
convention.

## Connection

Every real Java build tool (Maven, Gradle) automates exactly this
folder-structure requirement — the manual `-d` flag here is what those
tools are doing under the hood on every build.

## Try It Yourself

1. Delete `wrongplace_out` and recompile without `-d` at all
   (`javac wrongplace/Greeter.java`) — observe where the `.class` file
   actually lands this time, and connect that back to what `-d` was
   doing for you.
2. Change the package declaration to `com.example.other` (without
   moving the source file) and recompile with `-d` — confirm the output
   folder structure changes to match the new declaration exactly.
