# Packages, Annotations, and Concurrency Basics

How Java organizes code across files (`package`/`import`), the
built-in annotations you'll see constantly, and the fundamentals of
running code on more than one thread. Every example on this page was
compiled and run for real.

---

## Packages and Imports

```java
// com/example/util/StringHelper.java
package com.example.util;

public class StringHelper {
    public static String shout(String s) {
        return s.toUpperCase() + "!";
    }
}
```

```java
// Main.java
import com.example.util.StringHelper;

public class Main {
    public static void main(String[] args) {
        System.out.println(StringHelper.shout("hello"));
    }
}
```

Real output: `HELLO!`

A `package` declaration must match the class's actual folder path —
`com.example.util` means the file lives at `com/example/util/`, exactly
like Java's own real folder structure requirement. `import` brings a
class from another package into scope by its simple name (`StringHelper`
instead of always writing `com.example.util.StringHelper`). Classes in
the *same* package never need an `import` for each other at all.

This is also the mechanism behind package-private access (see
[03-access-modifiers-and-encapsulation.md](03-access-modifiers-and-encapsulation.md))
— "same package" is a real, physical folder-location fact the compiler
checks, not just a naming convention.

---

## Built-In Annotations

`@Override` and `@FunctionalInterface` are covered in
[04-inheritance-and-polymorphism.md](04-inheritance-and-polymorphism.md)
and [05-interfaces-and-lambdas.md](05-interfaces-and-lambdas.md). Two
more you'll see constantly:

```java
class LegacyUtil {
    @Deprecated
    static void oldMethod() {
        System.out.println("old method still works, but you'll get a compiler warning using it");
    }
}
```

```java
LegacyUtil.oldMethod();
```

Real output — the code still runs, but `javac` emits a real warning:

```text
Note: AnnotationsConcurrency.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
```

`@Deprecated` marks a method (or class) as "still works, but shouldn't
be used in new code" — usually paired with a `@deprecated` line in the
method's documentation comment explaining what to use instead.

```java
@SuppressWarnings("unchecked")
static void rawTypeUsage() {
    java.util.List list = new java.util.ArrayList();   // raw type — no <T>
    list.add("no compiler warning here, because of the annotation above");
}
```

`@SuppressWarnings("unchecked")` tells the compiler "I know this
specific line would normally warn, I've deliberately decided it's fine
here" — genuinely useful sometimes, but easy to misuse as a way to
silence a real generics mistake instead of fixing it. Use sparingly and
deliberately.

An annotation, generally: metadata attached to code, read either by the
compiler itself (`@Override`, `@FunctionalInterface`), by tools and
libraries at runtime (e.g. Room's `@Entity`/`@Dao` in an Android
project), or purely for human documentation (`@Deprecated`). It never
changes what the code *does* by itself — only what checks or tooling
respond to it.

---

## Threads — Running Code Concurrently

```java
Runnable task = () -> {
    System.out.println("Running on thread: " + Thread.currentThread().getName());
};
Thread worker = new Thread(task);
worker.start();
worker.join();
System.out.println("Main thread continues after join()");
```

Real output:

```text
Running on thread: Thread-0
Main thread continues after join()
```

`Runnable` is a functional interface (see
[05-interfaces-and-lambdas.md](05-interfaces-and-lambdas.md)) — a
single `run()` method describing work to do. `new Thread(task)` creates
a real, separate thread of execution; `.start()` actually begins it
running *concurrently* with the code that called `.start()` — not
immediately, in-line, the way a normal method call would. `.join()`
blocks the calling thread until the other thread finishes — without it,
`main` could finish and the program could exit before `worker` ever
gets to run.

---

## Race Conditions and `synchronized`

Two threads modifying the same shared data at the same time, with no
coordination, can silently produce a wrong result:

```java
class UnsafeCounter {
    int count = 0;

    void increment() {
        count++;
    }
}
```

Ten threads, each calling `.increment()` 1000 times (10,000 calls
total):

Real output:

```text
Expected 10000, got (unsafe): 7205
```

`count++` is not one atomic step — it's really "read `count`, add one,
write it back" — and two threads can both read the same old value
before either writes its update back, silently losing one of the two
increments. The exact wrong number varies run to run, which is itself
part of what makes race conditions dangerous: they don't fail
consistently or obviously.

```java
class SafeCounter {
    int count = 0;

    synchronized void increment() {
        count++;
    }
}
```

Real output:

```text
Expected 10000, got (safe): 10000
```

`synchronized` on a method means only one thread at a time can be
executing it on a given object — every other thread calling
`.increment()` concurrently simply waits its turn. This guarantees
correctness at the cost of that waiting — for a single counter, cheap;
for code with many threads all contending for the same lock constantly,
a real, measurable performance cost, which is why concurrent code
design is a genuinely deep topic beyond this page's scope.
