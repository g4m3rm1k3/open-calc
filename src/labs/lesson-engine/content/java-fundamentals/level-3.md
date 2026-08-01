---
series: java-fundamentals
level: 3
title: Loops
lang: java
---

# Loops

Level 2's own `for (int i = 0; i < literal.length; i++)` already used a loop without naming it directly. This lesson names every loop shape Java has, and the two statements — `break` and `continue` — that change a loop's normal path through its own body.

## while and do-while

```java
public class Main {
    public static void main(String[] args) {
        int i = 0;
        while (i < 3) {
            System.out.println(i);
            i++;
        }

        int j = 0;
        do {
            System.out.println("j=" + j);
            j++;
        } while (j < 3);
    }
}
```

```text
0
1
2
j=0
j=1
j=2
```

`while (i < 3) { ... }` — checks `i < 3` **before** every iteration, including the first; if the condition starts out `false`, the body never runs at all.

`do { ... } while (j < 3);` — checks `j < 3` **after** every iteration instead. The body always runs at least once, even if `j < 3` were `false` from the start — the one real, structural difference between the two.

`i++` — post-increment: adds `1` to `i`. Without it here, `i < 3` would never become `false`, and the loop would run forever — an **infinite loop**, one of the most common real bugs a loop can have.

## for and Nested Loops

```java
public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 5; i++) {
            if (i == 3) continue;
            if (i == 4) break;
            System.out.println(i);
        }

        for (int r = 0; r < 2; r++) {
            for (int c = 0; c < 2; c++) {
                System.out.println(r + "," + c);
            }
        }
    }
}
```

```text
0
1
2
0,0
0,1
1,0
1,1
```

`for (int i = 0; i < 5; i++) { ... }` — a `for` loop packages initialization (`int i = 0`), condition (`i < 5`), and increment (`i++`) into one line, run in that order: initialize once, then repeat check-body-increment until the condition is `false`.

`continue;` — skips the rest of *this* iteration's body and jumps straight to the increment step, without exiting the loop. `i == 3` — `3` is printed nowhere in the output because `continue` skipped `System.out.println(i)` for that one iteration only; the loop kept going afterward.

`break;` — exits the loop entirely, right now, skipping every remaining iteration. `i == 4` — the loop stops here permanently; `4` never gets checked against `continue`, and no higher value is ever reached.

Execution trace for the first loop:

1. `i=0` — neither `if` matches, `0` prints, `i` becomes `1`.
2. `i=1` — neither `if` matches, `1` prints, `i` becomes `2`.
3. `i=2` — neither `if` matches, `2` prints, `i` becomes `3`.
4. `i=3` — `i == 3` is `true`, `continue` skips the print, `i` becomes `4`.
5. `i=4` — `i == 4` is `true`, `break` exits the loop immediately; nothing after this line in the loop body runs.

`for (int r = 0; r < 2; r++) { for (int c = 0; c < 2; c++) { ... } }` — a **nested loop**: the entire inner `for` runs to completion for every single iteration of the outer one. Outer `r=0` runs the whole inner loop (`c=0`, then `c=1`), *then* outer advances to `r=1` and the inner loop runs again from `c=0`. `4` total inner-body executions for `2` outer iterations × `2` inner iterations each.

**SE lens:** `while` reads best when the number of iterations genuinely isn't known ahead of time (waiting for real user input, reading a file until it runs out of lines). `for` reads best when the iteration count *is* known or computable up front (looping exactly `array.length` times). Choosing the shape that matches the real situation, rather than defaulting to one everywhere, is itself part of writing readable code — a `for` loop with no real counter, or a `while` loop manually re-deriving what a `for` loop states in one line, both signal to a reader that something doesn't quite fit.

## Challenge: count_vowels

Write a `static int countVowels(String s)` method that returns how many characters in `s` are vowels (`a`, `e`, `i`, `o`, `u`), counting both uppercase and lowercase. Use `s.length()` and `s.charAt(i)` to examine each character.

```challenge
static int countVowels(String s) {
    // TODO
}
```

```test
assert countVowels("hello") == 2
assert countVowels("HELLO") == 2
assert countVowels("xyz") == 0
assert countVowels("") == 0
assert countVowels("AEIOU") == 5
```
