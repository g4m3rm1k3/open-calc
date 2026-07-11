---
series: cpp-fundamentals
level: 4
title: References & Pass-by-Reference
lang: cpp
---

# References & Pass-by-Reference

C++ has two ways to make a variable refer to something else: **references** and **pointers**. A reference is an alias — another name for an existing variable. Once bound, a reference cannot be rebound to a different variable, and it can never be null. This lesson covers references, the critical difference between pass-by-value and pass-by-reference, and when to use each.

## References — Aliases for Variables

A reference is declared with `&` after the type:

```cpp
#include <iostream>
using namespace std;

int main() {
    int original = 10;
    int& ref = original;

    cout << original << endl;
    cout << ref      << endl;

    ref = 99;

    cout << original << endl;
    cout << ref      << endl;

    return 0;
}
```

```text
10
10
99
99
```

`int& ref = original` — `ref` is a reference to `original`. Both names refer to the same memory location. Changing `ref` changes `original`, and vice versa.

A reference **must** be initialised at declaration — `int& ref;` is a compile error. A reference cannot be reseated: after `int& ref = original`, you cannot make `ref` refer to a different variable.

**CS lens:** A reference is not a separate variable. The compiler typically implements it as a pointer behind the scenes, but the syntax makes it invisible: you do not use `*` to dereference a reference, and you do not use `&` to get its address (doing so gives you the address of the original variable, not the reference itself). References are "pointer arithmetic you cannot do accidentally."

## Pass-by-Value vs Pass-by-Reference

By default, C++ passes arguments **by value** — the function gets a copy:

```cpp
#include <iostream>
using namespace std;

void doubleIt_value(int x) {
    x *= 2;
    cout << "Inside (value): " << x << endl;
}

void doubleIt_ref(int& x) {
    x *= 2;
    cout << "Inside (ref): " << x << endl;
}

int main() {
    int a = 5;
    doubleIt_value(a);
    cout << "After value: " << a << endl;

    int b = 5;
    doubleIt_ref(b);
    cout << "After ref: " << b << endl;

    return 0;
}
```

```text
Inside (value): 10
After value: 5
Inside (ref): 10
After ref: 10
```

`doubleIt_value(int x)` — `x` is a copy. Changing `x` does not affect `a` at the call site.
`doubleIt_ref(int& x)` — `x` is an alias for the caller's variable. Changing `x` changes `b` at the call site.

**Enable Debug and step into both calls.** In `doubleIt_value`, the variables panel shows `x` as a separate variable from `a`. In `doubleIt_ref`, `x` refers to the same address as `b` — watch `b` change in the outer frame as `x` is modified.

## Returning Multiple Values via Reference Parameters

A function can return only one value. References let a function produce multiple outputs:

```cpp
#include <iostream>
using namespace std;

void minMax(int arr[], int size, int& minOut, int& maxOut) {
    minOut = arr[0];
    maxOut = arr[0];
    for (int i = 1; i < size; i++) {
        if (arr[i] < minOut) minOut = arr[i];
        if (arr[i] > maxOut) maxOut = arr[i];
    }
}

int main() {
    int values[] = {4, 2, 9, 1, 7};
    int lo, hi;
    minMax(values, 5, lo, hi);
    cout << "Min: " << lo << endl;
    cout << "Max: " << hi << endl;
    return 0;
}
```

```text
Min: 1
Max: 9
```

`int& minOut, int& maxOut` — the function writes its results into the caller's variables `lo` and `hi` directly.

**SE lens:** This pattern is common in C-style APIs (and older C++ code). Modern C++ often uses `std::pair` or structured return types instead. But the reference pattern is important to recognise because you will encounter it in system libraries and legacy code.

## const References — Read Without Copying

Passing a large object by value copies every byte. Passing by `const` reference avoids the copy and prevents modification:

```cpp
#include <iostream>
#include <string>
using namespace std;

void printLength(const string& s) {
    cout << s.length() << endl;
}

int main() {
    string message = "Hello, references!";
    printLength(message);
    return 0;
}
```

```text
18
```

`const string& s` — the function can read `s` but cannot modify it (attempting to assign to `s` is a compile error). No copy is made — the function operates directly on the caller's string in memory.

**SE lens:** `const&` is the idiomatic way to pass any object you do not intend to modify and do not want to copy. The rule of thumb: pass built-in types (`int`, `double`, etc.) by value (they are small); pass objects and arrays by `const&` (they may be large).

## Pointers vs References

Both references and pointers can alias another variable. The differences:

```text
Reference:        int& r = x;     Must be initialised; cannot be null; no reseating
Pointer:          int* p = &x;    Can be null; can be reseated; must dereference with *
```

Use a reference when the alias will always refer to a valid object and will never change what it refers to. Use a pointer when null is a valid state (e.g., "no result found"), or when you need to change what the pointer points to.

## Challenge: swap

Write a function `void swap(int& a, int& b)` that exchanges the values of `a` and `b`. After calling `swap(x, y)`, the caller's `x` and `y` must be swapped. No temporary variable hint is given — figure out the mechanics from what you know about references.

```challenge
#include <iostream>
using namespace std;

void swap(int& a, int& b) {
    // TODO
}

int main() {
    int x = 3, y = 7;
    swap(x, y);
    cout << x << " " << y << endl;
    return 0;
}
```

```test
#include <iostream>
#include <cassert>
using namespace std;

void swap(int& a, int& b) {
    int tmp = a;
    a = b;
    b = tmp;
}

int main() {
    int x = 3, y = 7;
    swap(x, y);
    assert(x == 7);
    assert(y == 3);

    int p = 0, q = 0;
    swap(p, q);
    assert(p == 0);
    assert(q == 0);

    int a = -5, b = 5;
    swap(a, b);
    assert(a == 5);
    assert(b == -5);

    cout << "ok" << endl;
    return 0;
}
```
