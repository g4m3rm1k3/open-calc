---
series: csharp-fundamentals
level: 2
title: Arrays
lang: csharp
---

# Arrays

Every variable so far has held exactly one value. An **array** holds a fixed number of values of the same type, stored contiguously and accessed by position. Arrays are the foundation every other C# collection — `List<T>`, `Dictionary<TKey, TValue>` — is eventually built on top of.

## Declaring and Indexing

```csharp
using System;

class Program
{
    static void Main()
    {
        int[] scores = { 88, 92, 75, 95 };

        Console.WriteLine(scores.Length);
        Console.WriteLine(scores[0]);
        Console.WriteLine(scores[3]);

        scores[1] = 100;
        Console.WriteLine(scores[1]);

        foreach (int s in scores)
        {
            Console.Write(s + " ");
        }
        Console.WriteLine();
    }
}
```

```text
4
88
95
100
88 100 75 95 
```

`int[] scores = { 88, 92, 75, 95 };` — `int[]` is the type "array of `int`". The `{ }` initialiser fixes both the contents and the length at creation — an array's length can never change after this line.

`scores.Length` — the number of elements. A property, not a method — no parentheses.

`scores[0]` — indexing starts at `0`. `scores[0]` is the first element; `scores[3]` is the fourth and last, since the array holds four elements total.

`scores[1] = 100;` — arrays are mutable through their indices, even though their length is fixed. Assigning to `scores[1]` overwrites the second element in place.

`foreach (int s in scores)` — visits every element in order, from the first to the last.

**CS lens:** An array is stored as one contiguous block of memory. `scores[2]` is computed directly as "the base address, plus `2` times the size of one `int`" — an O(1) operation regardless of the array's length, the same reason array indexing is always fast, in any language.

## Every Slot Starts at a Default Value

```csharp
using System;

class Program
{
    static void Main()
    {
        int[] nums = new int[5];
        Console.WriteLine(nums[0]);
        Console.WriteLine(nums.Length);
    }
}
```

```text
0
5
```

`new int[5]` — creates an array of length `5` with no initial values listed. Every slot is filled with that type's **default value** — `0` for numeric types, `false` for `bool`, `null` for reference types like `string`. C# never leaves array memory uninitialised the way some lower-level languages do.

## Out-of-Bounds Access Is a Real, Caught Error

```csharp
using System;

class Program
{
    static void Main()
    {
        int[] nums = { 1, 2, 3 };
        try
        {
            Console.WriteLine(nums[5]);
        }
        catch (IndexOutOfRangeException ex)
        {
            Console.WriteLine("Caught: " + ex.GetType().Name);
        }
    }
}
```

```text
Caught: IndexOutOfRangeException
```

`nums[5]` — `nums` only has indices `0` through `2`; `5` is out of bounds. C# does not silently return garbage memory the way C does — it throws a real, catchable `IndexOutOfRangeException` (a full lesson on `try`/`catch` comes later; this example previews the shape because the failure itself is the point here).

**SE lens:** This is a real, deliberate safety guarantee: every array access is bounds-checked at runtime. It costs a small amount of performance compared to C's unchecked access, in exchange for turning "silently corrupt some unrelated memory" into "a real exception, at the exact line that caused it" — a trade C# (and Java, and most modern managed languages) makes on purpose.

## Sorting and Reversing

```csharp
using System;

class Program
{
    static void Main()
    {
        int[] nums = { 5, 2, 8, 1, 9 };

        Array.Sort(nums);
        foreach (int n in nums) Console.Write(n + " ");
        Console.WriteLine();

        Array.Reverse(nums);
        foreach (int n in nums) Console.Write(n + " ");
        Console.WriteLine();
    }
}
```

```text
1 2 5 8 9 
9 8 5 2 1 
```

`Array.Sort(nums)` — sorts `nums` **in place**, ascending. Nothing is returned; `nums` itself is mutated.
`Array.Reverse(nums)` — reverses `nums` in place, also mutating rather than returning a new array.

**SE lens:** Both methods mutate their argument directly instead of returning a new, sorted array. This is efficient — no second array is ever allocated — but it means calling `Array.Sort(nums)` and then continuing to use an *earlier* reference to the original order is a real bug: there is no earlier order left to read, because `nums` was changed in place.

## Two-Dimensional Arrays

```csharp
using System;

class Program
{
    static void Main()
    {
        int[,] grid = new int[2, 3];
        grid[0, 0] = 1;
        grid[1, 2] = 9;

        Console.WriteLine(grid[0, 0]);
        Console.WriteLine(grid[1, 2]);
        Console.WriteLine(grid.GetLength(0));
        Console.WriteLine(grid.GetLength(1));
    }
}
```

```text
1
9
2
3
```

`int[,]` — a **rectangular** two-dimensional array: two dimensions, comma-separated inside the brackets, one single underlying block of memory. `new int[2, 3]` creates 2 rows of 3 columns each — 6 slots total, all starting at `0`.

`grid[0, 0]` / `grid[1, 2]` — indexed with both coordinates inside one pair of brackets, row then column.

`grid.GetLength(0)` — the size of dimension `0` (rows): `2`. `grid.GetLength(1)` — the size of dimension `1` (columns): `3`. `Length` alone would give the total element count (`6`); `GetLength` asks about one specific dimension.

## Challenge: sum_array

Write a `static int SumArray(int[] numbers)` method that returns the sum of every element in `numbers`. An empty array should return `0`.

```challenge
static int SumArray(int[] numbers)
{
    // TODO
}
```

```test
assert SumArray(new int[] { 1, 2, 3, 4 }) == 10
assert SumArray(new int[] { 5 }) == 5
assert SumArray(new int[] { }) == 0
assert SumArray(new int[] { -3, 3 }) == 0
assert SumArray(new int[] { 10, -20, 30 }) == 20
```
