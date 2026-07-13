---
series: cpp-fundamentals
level: 1
title: Control Flow
lang: cpp
---

# Control Flow

A program that executes the same instructions every time it runs cannot make decisions. Control flow — `if`, `while`, and `for` — gives a program the ability to choose different paths and repeat work. These constructs exist in every general-purpose language; in C++ they use braces to delimit blocks and require explicit types for loop variables.

## if / else if / else

```cpp
#include <iostream>
using namespace std;

int main() {
    int score = 73;

    if (score >= 90) {
        cout << "A" << endl;
    } else if (score >= 80) {
        cout << "B" << endl;
    } else if (score >= 70) {
        cout << "C" << endl;
    } else {
        cout << "F" << endl;
    }

    return 0;
}
```

```text
C
```

`if (condition) { body }` — evaluates the condition. If `true`, executes the body. The braces `{ }` delimit the block; they are required when the body has more than one statement, and are a good habit always.

Conditions use comparison operators:
```text
==    equal to
!=    not equal to
>     greater than
<     less than
>=    greater than or equal to
<=    less than or equal to
&&    logical AND (both true)
||    logical OR (either true)
!     logical NOT (negates)
```

**CS lens:** In C++, any non-zero integer is truthy and `0` is falsy — the same rule as C. `if (n)` is true whenever `n` is not zero. This lets you write `if (pointer)` to check if a pointer is non-null, a pattern covered in Level 4.

## while Loops

```cpp
#include <iostream>
using namespace std;

int main() {
    int count = 1;

    while (count <= 5) {
        cout << count << " ";
        count++;
    }

    cout << endl;
    return 0;
}
```

```text
1 2 3 4 5 
```

`count++` — post-increment: equivalent to `count = count + 1`. `++count` (pre-increment) also adds 1 but returns the incremented value rather than the original.

The while loop checks the condition before each iteration. When `count` reaches `6`, `count <= 5` is false and the loop stops.

**Enable Debug and step through this.** Watch `count` increment in the variables panel on each iteration.

## for Loops

```cpp
#include <iostream>
using namespace std;

int main() {
    int sum = 0;

    for (int i = 1; i <= 10; i++) {
        sum += i;
    }

    cout << "Sum 1..10: " << sum << endl;
    return 0;
}
```

```text
Sum 1..10: 55
```

`for (initialisation; condition; update)` — three parts separated by semicolons:
- `int i = 1` — runs once before the loop starts; declares the loop variable
- `i <= 10` — checked before each iteration
- `i++` — runs after each iteration

`sum += i` — shorthand for `sum = sum + i`. Similar shorthands: `-=`, `*=`, `/=`, `%=`.

`i` is scoped to the `for` loop — it does not exist after the loop ends. Attempting to use `i` after the loop is a compile error.

## Nested Loops — Multiplication Table

```cpp
#include <iostream>
using namespace std;

int main() {
    for (int row = 1; row <= 3; row++) {
        for (int col = 1; col <= 3; col++) {
            cout << row * col;
            if (col < 3) cout << "\t";
        }
        cout << endl;
    }
    return 0;
}
```

```text
1	2	3
2	4	6
3	6	9
```

`"\t"` — a tab character (escape sequence from Level 0). Used for alignment.

**CS lens:** Nested loops multiply complexity. If the outer loop runs `m` times and the inner loop runs `n` times, the body executes `m × n` times — O(m × n). For the 3×3 table: 9 iterations. For an n×n table: n² iterations. This is why nested loops over large data sets are often too slow.

## break and continue

`break` exits the loop immediately. `continue` skips to the next iteration:

```cpp
#include <iostream>
using namespace std;

int main() {
    for (int i = 0; i < 10; i++) {
        if (i == 7) break;
        if (i % 2 == 0) continue;
        cout << i << " ";
    }
    cout << endl;
    return 0;
}
```

```text
1 3 5 
```

When `i == 7`, `break` exits. Even numbers hit `continue` and skip `cout`. Only odd numbers below 7 reach `cout`.

## Challenge: sum_of_odds

Write a program that uses a `for` loop from `1` to `100` (inclusive) and prints the sum of all odd numbers in that range. An odd number satisfies `n % 2 != 0`.

```challenge cpp-program
#include <iostream>
using namespace std;

int main() {
    // TODO: sum all odd numbers from 1 to 100 and print the sum
    return 0;
}
```

```test
assert output.trim() === '2500'
var n = parseInt(output.trim(), 10)
assert n === 2500
assert n !== 5050   // not the sum of ALL numbers 1-100 (forgot the odd filter)
assert n !== 2550   // not the sum of the EVEN numbers (wrong parity check)
```
