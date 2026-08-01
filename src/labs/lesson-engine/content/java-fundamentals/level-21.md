---
series: java-fundamentals
level: 21
title: File I/O
lang: java
---

# File I/O

Every program in this course has existed only in memory — every value gone the instant the program ends. Real programs often need to persist data past their own lifetime, or read data another program (or a person) already created. `java.nio.file` — the modern, standard way to do this in Java — provides that.

## Writing and Reading a Whole File

```java
import java.nio.file.*;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        Path path = Path.of("test.txt");
        Files.writeString(path, "Hello, file!");

        String content = Files.readString(path);
        System.out.println(content);

        Files.delete(path);
        System.out.println(Files.exists(path));
    }
}
```

```text
Hello, file!
false
```

`Path.of("test.txt")` — a `Path` represents a location on the filesystem; it doesn't read or write anything by itself. `Files.writeString(path, content)` — creates the file if it doesn't exist, or completely replaces its contents if it does. `Files.readString(path)` — reads the whole file back as one `String`.

`Files.delete(path)` — removes the file. `Files.exists(path)` — `false` here, since the line above just deleted it.

`public static void main(String[] args) throws IOException` — every one of these `Files` methods can throw a checked `IOException` (Level 10's checked-exception rule): the file might not be writable, the disk might be full, permissions might be wrong. `main` here declares `throws IOException` rather than catching it, letting any real I/O failure propagate all the way out and stop the program — acceptable for this small example, though the missing-file case below shows the more careful, real alternative.

## Working With Lines

```java
import java.nio.file.*;
import java.io.IOException;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        Path path = Path.of("lines.txt");
        List<String> lines = List.of("line1", "line2", "line3");

        Files.write(path, lines);

        List<String> readBack = Files.readAllLines(path);
        for (String line : readBack) System.out.println(line);

        Files.delete(path);
    }
}
```

```text
line1
line2
line3
```

`List.of("line1", "line2", "line3")` — an immutable list literal (Level 16's `ArrayList` is mutable; `List.of(...)` deliberately is not — attempting `.add(...)` on it would throw `UnsupportedOperationException`). `Files.write(path, lines)` — writes one list element per line, handling line-break characters automatically. `Files.readAllLines(path)` — the reverse: reads the file back as a real `List<String>`, one element per line, no manual splitting (Level 4's `.split()`) needed.

## Handling a Missing File

```java
import java.nio.file.*;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        try {
            String content = Files.readString(Path.of("does-not-exist.txt"));
        } catch (NoSuchFileException e) {
            System.out.println("Caught: " + e.getClass().getSimpleName());
        } catch (IOException e) {
            System.out.println("Other IOException");
        }
    }
}
```

```text
Caught: NoSuchFileException
```

`Files.readString` on a path that doesn't exist — throws `NoSuchFileException`, a specific subtype of `IOException`, rather than returning `null` or an empty string. `catch (NoSuchFileException e)` comes *before* the broader `catch (IOException e)` — Java requires more specific exception types to be caught first; a `catch (IOException e)` written first would silently swallow the more specific `NoSuchFileException` case, since every `NoSuchFileException` genuinely is an `IOException` too (Level 11's own inheritance rules, applied to the exception hierarchy).

Any real program reading a file a user provides needs to expect and handle this — the file might have been moved, deleted, or simply mistyped.

## try-with-resources — BufferedWriter and BufferedReader

```java
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        String path = "buffered-test.txt";

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(path))) {
            writer.write("written via BufferedWriter");
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            System.out.println(reader.readLine());
        }

        new File(path).delete();
    }
}
```

```text
written via BufferedWriter
```

`try (BufferedWriter writer = new BufferedWriter(new FileWriter(path))) { ... }` — **try-with-resources**: `BufferedWriter` holds a real, open connection to the file while writing. This form guarantees that connection is properly closed the instant the block ends, even if an exception is thrown partway through — the same cleanup guarantee `finally` (Level 10) provides, written specifically for the "must close a resource" shape. Any class implementing `AutoCloseable` (as `BufferedWriter` and `BufferedReader` both do) can be used this way.

`writer.write(...)` — writes text incrementally, useful when content is built up piece by piece rather than assembled as one complete `String` first, the way `Files.writeString`'s all-at-once approach requires.

**SE lens:** `Files.writeString`/`readString`/`write`/`readAllLines` are the right choice for small files, handled all at once — the modern, preferred API for most real use. `BufferedWriter`/`BufferedReader` matter once a file is large enough that loading the whole thing into memory at once would be wasteful, or when content needs to be written incrementally as it becomes available rather than collected into one `String` or `List` first.

## Challenge: count_lines

Write a `static int countLines(String path)` method that returns how many lines a file at `path` contains, using `java.nio.file.Files.readAllLines`. If the file doesn't exist, catch the resulting `java.nio.file.NoSuchFileException` and return `-1` instead of letting it propagate.

Since the generated test harness doesn't declare `throws IOException` on its own `main`, wrap any setup calls to `Files.write`/`Files.delete` in their own `try { ... } catch (Exception e) {}` — shown below — rather than leaving them bare.

```challenge
static int countLines(String path) {
    // TODO
}
```

```test
try { java.nio.file.Files.write(java.nio.file.Path.of("jcount-test.txt"), java.util.List.of("a", "b", "c")); } catch (Exception e) {}
assert countLines("jcount-test.txt") == 3
try { java.nio.file.Files.delete(java.nio.file.Path.of("jcount-test.txt")); } catch (Exception e) {}
assert countLines("jcount-does-not-exist.txt") == -1
try { java.nio.file.Files.write(java.nio.file.Path.of("jcount-test2.txt"), java.util.List.of("only one")); } catch (Exception e) {}
assert countLines("jcount-test2.txt") == 1
try { java.nio.file.Files.delete(java.nio.file.Path.of("jcount-test2.txt")); } catch (Exception e) {}
try { java.nio.file.Files.write(java.nio.file.Path.of("jcount-test3.txt"), java.util.List.of()); } catch (Exception e) {}
assert countLines("jcount-test3.txt") == 0
try { java.nio.file.Files.delete(java.nio.file.Path.of("jcount-test3.txt")); } catch (Exception e) {}
```
