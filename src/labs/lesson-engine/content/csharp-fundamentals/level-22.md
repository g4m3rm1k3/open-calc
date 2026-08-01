---
series: csharp-fundamentals
level: 22
title: File I/O
lang: csharp
---

# File I/O

Every program in this course has existed only in memory — every value gone the instant the program ends. Real programs often need to persist data past their own lifetime, or read data another program (or a person) already created. `System.IO` provides that.

## Writing and Reading a Whole File

```csharp
using System;
using System.IO;

class Program
{
    static void Main()
    {
        string path = "test.txt";
        File.WriteAllText(path, "Hello, file!");

        string content = File.ReadAllText(path);
        Console.WriteLine(content);

        File.Delete(path);
        Console.WriteLine(File.Exists(path));
    }
}
```

```text
Hello, file!
False
```

`File.WriteAllText(path, content)` — creates the file at `path` if it doesn't exist, or completely replaces its contents if it does, writing `content` in one call.
`File.ReadAllText(path)` — reads the entire file back as one `string`.
`File.Delete(path)` — removes the file.
`File.Exists(path)` — `true` if a file currently exists at `path`; `false` here, since the line above just deleted it.

**CS lens:** Every one of these methods is `static`, called through the `File` class itself, not through any object — because a file on disk isn't a C# object at all; `File`'s own methods are the interface between C# and the operating system's real, separate file system.

## Working With Lines

```csharp
using System;
using System.IO;

class Program
{
    static void Main()
    {
        string path = "lines.txt";
        string[] lines = { "line1", "line2", "line3" };

        File.WriteAllLines(path, lines);

        string[] readBack = File.ReadAllLines(path);
        foreach (string line in readBack) Console.WriteLine(line);

        File.Delete(path);
    }
}
```

```text
line1
line2
line3
```

`File.WriteAllLines(path, lines)` — writes an array of strings, one per line, handling the line-break characters automatically.
`File.ReadAllLines(path)` — the reverse: reads the file back as a real `string[]`, one element per line — no manual splitting needed, unlike `ReadAllText` followed by `Split` (Level 4) by hand.

## Appending Instead of Overwriting

```csharp
using System;
using System.IO;

class Program
{
    static void Main()
    {
        string path = "append.txt";
        File.WriteAllText(path, "first" + Environment.NewLine);
        File.AppendAllText(path, "second" + Environment.NewLine);

        Console.WriteLine(File.ReadAllText(path));
        File.Delete(path);
    }
}
```

```text
first
second

```

`File.AppendAllText(path, content)` — adds `content` onto the **end** of the existing file, unlike `WriteAllText`, which would have erased `"first"` entirely and left only `"second"`.

`Environment.NewLine` — the correct line-break sequence for whatever operating system the program is actually running on, rather than hard-coding `"\n"` (right on some systems, wrong on others).

## Handling a Missing File

```csharp
using System;
using System.IO;

class Program
{
    static void Main()
    {
        try
        {
            string content = File.ReadAllText("does-not-exist.txt");
        }
        catch (FileNotFoundException ex)
        {
            Console.WriteLine("Caught: " + ex.GetType().Name);
        }
    }
}
```

```text
Caught: FileNotFoundException
```

`File.ReadAllText` on a path that doesn't exist — throws a real, catchable `FileNotFoundException` (Level 10's own `try`/`catch` mechanism), rather than returning `null` or an empty string. Any real program reading a file a user provides needs to expect and handle this — the file might have been moved, deleted, or simply mistyped.

## StreamWriter and StreamReader — Line by Line

```csharp
using System;
using System.IO;

class Program
{
    static void Main()
    {
        string path = "using-test.txt";

        using (StreamWriter writer = new StreamWriter(path))
        {
            writer.WriteLine("written via StreamWriter");
        }

        using (StreamReader reader = new StreamReader(path))
        {
            Console.WriteLine(reader.ReadLine());
        }

        File.Delete(path);
    }
}
```

```text
written via StreamWriter
```

`using (StreamWriter writer = new StreamWriter(path)) { ... }` — `StreamWriter` holds a real, open connection to the file while it's being written to. `using` guarantees that connection is properly closed the moment the block ends, even if an exception is thrown inside it — the same guarantee `finally` (Level 10) provides, written more concisely for exactly this "must clean up a resource" shape.

`writer.WriteLine(...)` — writes one line at a time, useful when a file is built up incrementally rather than assembled as one complete string first, which `File.WriteAllText`'s all-at-once approach requires.

**SE lens:** `File.WriteAllText`/`ReadAllText`/`WriteAllLines` are the right choice for small files, read or written all at once. `StreamWriter`/`StreamReader` matter once a file is large enough that loading the whole thing into memory at once would be wasteful, or when lines need to be written one at a time as they become available, rather than all collected into one array first.

## Challenge: count_lines

Write a `static int CountLines(string path)` method that returns how many lines a file at `path` contains, using `System.IO.File.ReadAllLines`. If the file doesn't exist, catch the resulting `System.IO.FileNotFoundException` and return `-1` instead of letting it propagate. Use the fully-qualified `System.IO.File`/`System.IO.FileNotFoundException` names, the same way `Utility.Max` (an earlier lesson) was always called by its full path rather than assuming a `using` that isn't there.

```challenge
static int CountLines(string path)
{
    // TODO
}
```

```test
System.IO.File.WriteAllLines("count-test.txt", new string[] { "a", "b", "c" });
assert CountLines("count-test.txt") == 3
System.IO.File.Delete("count-test.txt");
assert CountLines("does-not-exist-xyz.txt") == -1
System.IO.File.WriteAllLines("count-test2.txt", new string[] { "only one" });
assert CountLines("count-test2.txt") == 1
System.IO.File.Delete("count-test2.txt");
System.IO.File.WriteAllLines("count-test3.txt", new string[] { });
assert CountLines("count-test3.txt") == 0
System.IO.File.Delete("count-test3.txt");
```
