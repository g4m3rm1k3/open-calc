---
series: csharp-fundamentals
level: 3
title: LINQ & Collections
lang: csharp
---

# LINQ & Collections

`System.Collections.Generic` provides strongly-typed collection classes — `List<T>`, `Dictionary<TKey, TValue>`, `HashSet<T>` — that replace the need for raw arrays in most situations. **LINQ** (Language Integrated Query) adds query operators directly to the language, letting you filter, transform, group, and sort any collection with concise, readable syntax.

## List&lt;T&gt; — The Workhorse Collection

```csharp
using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var scores = new List<int> { 88, 92, 75, 95, 83, 91 };

        scores.Add(77);
        scores.Remove(75);

        Console.WriteLine($"Count: {scores.Count}");
        Console.WriteLine($"First: {scores[0]}");

        foreach (int score in scores)
        {
            Console.Write(score + " ");
        }
        Console.WriteLine();
    }
}
```

```text
Count: 6
First: 88
88 92 95 83 91 77 
```

`new List<int> { 88, 92, ... }` — creates a `List<int>` with an **initialiser list**. No fixed size — it grows automatically.

`scores.Add(value)` — appends to the end. Amortized O(1).
`scores.Remove(value)` — removes the first occurrence of `value`. O(n) — scans from the front.
`scores.Count` — the number of elements (property, not a method).
`scores[0]` — O(1) random access, same as an array.

`foreach (int score in scores)` — iterates over all elements. C#'s `foreach` works with any type that implements `IEnumerable<T>`.

## Dictionary&lt;TKey, TValue&gt;

```csharp
using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var wordCount = new Dictionary<string, int>();
        string[] words = { "the", "quick", "brown", "fox", "the", "quick", "the" };

        foreach (string word in words)
        {
            if (wordCount.ContainsKey(word))
                wordCount[word]++;
            else
                wordCount[word] = 1;
        }

        foreach (var pair in wordCount)
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
    }
}
```

```text
the: 3
quick: 2
brown: 1
fox: 1
```

`wordCount[word]++` — indexer access on `Dictionary`. Reads or writes the value for `word`. If the key does not exist, reading throws a `KeyNotFoundException`.

`wordCount.ContainsKey(word)` — O(1) lookup (hash map under the hood). Returns `true` if the key exists.

`var pair in wordCount` — iterating a dictionary yields `KeyValuePair<TKey, TValue>` objects with `.Key` and `.Value`.

**CS lens:** `Dictionary<TKey, TValue>` is C#'s hash map. Under the hood it uses open addressing with chaining. Average O(1) insert/lookup; worst-case O(n) on pathological hash collisions.

## LINQ — Querying Collections

LINQ provides extension methods on any `IEnumerable<T>`. Import `System.Linq`:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        var scores = new List<int> { 88, 92, 75, 95, 83, 62, 91 };

        var passing = scores.Where(s => s >= 70).ToList();
        var sorted  = scores.OrderByDescending(s => s).ToList();
        double avg  = scores.Average();
        int max     = scores.Max();

        Console.WriteLine($"Passing: {string.Join(", ", passing)}");
        Console.WriteLine($"Sorted:  {string.Join(", ", sorted)}");
        Console.WriteLine($"Average: {avg:F1}");
        Console.WriteLine($"Max:     {max}");

        var doubled = scores.Select(s => s * 2).ToList();
        Console.WriteLine($"Doubled: {string.Join(", ", doubled)}");
    }
}
```

```text
Passing: 88, 92, 75, 95, 83, 91
Sorted:  95, 92, 91, 88, 83, 75, 62
Average: 83.7
Max:     95
Doubled: 176, 184, 150, 190, 166, 124, 182
```

`Where(predicate)` — filters: keeps only elements where the lambda returns `true`. Returns `IEnumerable<T>`.
`OrderByDescending(keySelector)` — sorts descending by the key the lambda returns.
`Average()`, `Max()`, `Min()`, `Sum()` — aggregate methods. Return a single value.
`Select(transform)` — maps: applies the lambda to every element. Returns `IEnumerable<T>` of the results.
`ToList()` — materialises the lazy query into a `List<T>`. LINQ queries are **lazy** — they execute only when iterated or converted.
`string.Join(separator, collection)` — joins collection elements into a single string with the separator between them.

**SE lens:** LINQ uses the same deferred-execution model as Python generators. `scores.Where(s => s >= 70)` returns an iterator that hasn't executed yet. Chaining `Where(...).Select(...)` builds a pipeline; calling `ToList()` pulls all elements through at once. This is why you can chain many LINQ operators without creating intermediate lists.

## Challenge: top_students

Given a list of `(name, score)` tuples, write a method `List<string> TopStudents(List<(string Name, int Score)> students, int threshold)` that returns the names of students whose score is at or above the threshold, sorted alphabetically.

Use LINQ: `Where`, `OrderBy`, `Select`, and `ToList`.

```challenge
static List<string> TopStudents(List<(string Name, int Score)> students, int threshold)
{
    // TODO
}
```

```test
var students = new List<(string, int)>
{
    ("Alice", 92), ("Bob", 65), ("Carol", 88),
    ("Dave", 72), ("Eve", 95), ("Frank", 58)
};
var top = TopStudents(students, 70);
assert top.Count == 4
assert top[0] == "Alice" && top[1] == "Carol"
assert top[2] == "Dave" && top[3] == "Eve"
assert TopStudents(students, 100).Count == 0
```
