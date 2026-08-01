---
series: java-fundamentals
level: 2
title: Arrays
lang: java
---

# Arrays

Every variable so far has held exactly one value. An **array** holds a fixed number of values of the same type, all accessible by a numeric position — the first real Java data structure in this course, and the foundation every other collection (Level 16's `ArrayList`, in particular) is ultimately built on top of.

## Declaring, Indexing, and Default Values

```java
public class Main {
    public static void main(String[] args) {
        int[] scores = new int[5];
        scores[0] = 90;
        scores[1] = 85;
        System.out.println(scores[0]);
        System.out.println(scores[4]);
        System.out.println(scores.length);

        int[] literal = {10, 20, 30};
        for (int i = 0; i < literal.length; i++) {
            System.out.println(literal[i]);
        }
    }
}
```

```text
90
85
5
0
10
20
30
```

`new int[5]` — allocates an array of exactly `5` `int` slots, all starting at `0` (`int`'s own default value — every unassigned slot in a numeric array starts this way, never `null`). `scores[0] = 90;` — assigns into position `0`; array indices always start counting at `0`, not `1`.

`scores[4]` — printed before ever being explicitly assigned, and prints `0` — direct proof of that default-value initialization.

`scores.length` — `.length` is a field, not a method (no parentheses, unlike `String`'s own `.length()` from Level... this course hasn't covered strings yet, but it's worth noting now: arrays and `String` spell "how many elements" two different ways, a real, common source of typos).

`int[] literal = {10, 20, 30};` — an **array literal**: creates and fills a `3`-element array in one expression, sized automatically to match the number of values given.

## Index Out of Bounds

```java
public class Main {
    public static void main(String[] args) {
        int[] nums = {5, 3, 8, 1};
        try {
            System.out.println(nums[10]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
```

```text
Caught: Index 10 out of bounds for length 4
```

`nums[10]` — `nums` only has `4` valid indices (`0`-`3`); asking for index `10` throws a real, catchable `ArrayIndexOutOfBoundsException`, rather than silently returning garbage the way raw memory access in a language like C would. `try`/`catch` — this course's later Exceptions lesson (Level 10) covers the full mechanism; for now, the shape to recognize is: risky code inside `try`, the specific failure handled inside `catch`.

**CS lens:** This bounds check is not free — every single array access in Java pays a small, real runtime cost to verify the index is legal before reading memory. Languages without it (C, raw pointer arithmetic) are faster per-access but trade away this exact safety: an out-of-bounds C array access doesn't throw anything catchable — it reads or corrupts whatever memory happens to be at that address, a real, historical source of security vulnerabilities.

## Sorting and 2D Arrays

```java
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {5, 3, 8, 1};
        Arrays.sort(nums);
        System.out.println(Arrays.toString(nums));

        int[][] grid = new int[2][3];
        grid[0][0] = 1;
        grid[1][2] = 9;
        System.out.println(grid[0][0]);
        System.out.println(grid[1][2]);
        System.out.println(grid.length);
        System.out.println(grid[0].length);
    }
}
```

```text
[1, 3, 5, 8]
1
9
2
3
```

`import java.util.Arrays;` — `Arrays` is a utility class living outside `java.lang` (unlike `String` or `Math`), so it needs an explicit `import` before its name can be used unqualified.

`Arrays.sort(nums)` — sorts `nums` **in place**: `nums` itself is reordered; nothing is returned (`sort`'s return type is `void`).

`Arrays.toString(nums)` — arrays don't override `toString()` the useful way `ArrayList` (Level 16) does; printing `nums` directly would print something like `[I@1b6d3586` (a memory-address-flavored default). `Arrays.toString` is the real, standard way to get a readable `[1, 3, 5, 8]` instead.

`new int[2][3]` — a 2D array: `2` rows, each holding `3` `int`s. `grid[0][0]` — row `0`, column `0`. `grid.length` — the number of rows (`2`); `grid[0].length` — the number of columns in row `0` (`3`) — a genuinely separate `.length`, since in Java a 2D array is really an array of arrays, and each inner array carries its own length.

## Challenge: sum_array

Write a `static int sumArray(int[] arr)` method that returns the sum of every element in `arr`. An empty array should return `0`.

```challenge
static int sumArray(int[] arr) {
    // TODO
}
```

```test
assert sumArray(new int[]{1, 2, 3}) == 6
assert sumArray(new int[]{}) == 0
assert sumArray(new int[]{-5, 5}) == 0
assert sumArray(new int[]{10}) == 10
```
