---
title: Java Level 0: Hello, Classes, and main()
series: java-fundamentals
level: 0
topic: java
lang: java
---

# Java Level 0: Hello, Classes, and main()

## Java Starts in `main`

Java programs are built from classes. The `main` method is the entry point the JVM looks for when the program starts.

**CS lens:** Java separates source code, compiled bytecode, and runtime execution. That makes it a useful language for learning what a runtime environment does.

```java
public class Main {
    public static void main(String[] args) {
        int count = 3;
        System.out.println("Count: " + count);
    }
}
```

## Objects Bundle State and Behavior

An object keeps related data and methods together. This is the core move behind object-oriented programming.

```java
class Counter {
    int value = 0;

    void increment() {
        value = value + 1;
    }
}

public class Main {
    public static void main(String[] args) {
        Counter counter = new Counter();
        counter.increment();
        System.out.println(counter.value);
    }
}
```
