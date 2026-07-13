---
series: cpp-fundamentals
level: 3
title: Arrays & Pointers
lang: cpp
---

# Arrays & Pointers

An array in C++ is a fixed-size block of memory holding elements of the same type, stored contiguously — one after another, no gaps. A pointer is a variable that stores a memory address. These two concepts are inseparable: the name of an array is a pointer to its first element. Understanding pointers is the key to understanding C++ — and to understanding what higher-level languages hide from you.

## Declaring and Using Arrays

```cpp
#include <iostream>
using namespace std;

int main() {
    int scores[5] = {88, 92, 75, 95, 83};

    cout << scores[0] << endl;
    cout << scores[4] << endl;
    cout << scores[5] << endl;  // undefined behaviour — past the end

    int total = 0;
    for (int i = 0; i < 5; i++) {
        total += scores[i];
    }
    cout << "Total: " << total << endl;

    return 0;
}
```

```text
88
83
(unpredictable — reading past the array)
Total: 433
```

`int scores[5]` — declares an array of 5 `int` values. The size `5` must be a compile-time constant.
`{88, 92, 75, 95, 83}` — an **initialiser list** that fills the array.
`scores[0]` — indices are zero-based, as in Python and JavaScript.

`scores[5]` — **undefined behaviour**: there is no element at index 5 (valid indices are 0–4). C++ does not check bounds. Reading out of bounds reads whatever bytes happen to follow the array in memory — the output is unpredictable and may crash the program.

**CS lens:** Arrays are contiguous memory. `scores` is stored as 20 bytes (5 × 4 bytes per `int`) in a row. `scores[i]` is compiled to: `*(scores + i)` — start at the base address of `scores`, advance `i × sizeof(int)` bytes, and read. This is O(1) index access. Python lists store pointers to objects, not the objects themselves; C++ arrays store the objects directly.

## Pointers — Variables That Store Addresses

A pointer stores the memory address of another variable. `&variable` gives the address of a variable; `*pointer` dereferences a pointer (reads the value at that address):

```cpp
#include <iostream>
using namespace std;

int main() {
    int temperature = 22;
    int* ptr = &temperature;

    cout << temperature << endl;
    cout << &temperature << endl;
    cout << ptr << endl;
    cout << *ptr << endl;

    *ptr = 30;
    cout << temperature << endl;

    return 0;
}
```

```text
22
(a memory address, e.g. 0x7ffee4b3c3ac)
(same memory address)
22
30
```

`int* ptr` — declares a pointer to `int`. The `*` is part of the type, not the name.
`&temperature` — the **address-of** operator. Returns the memory address where `temperature` is stored.
`*ptr` — the **dereference** operator. Reads (or writes) the value at the address `ptr` holds.
`*ptr = 30` — writes `30` to the address `ptr` points to. Since `ptr` holds `&temperature`, this changes `temperature`.

**Enable Debug and step through this.** Watch `ptr` show a hex address, and watch `temperature` change to `30` when `*ptr = 30` executes.

## Arrays Are Pointers

The name of an array is a pointer to its first element:

```cpp
#include <iostream>
using namespace std;

int main() {
    int numbers[4] = {10, 20, 30, 40};
    int* p = numbers;

    cout << *p     << endl;
    cout << *(p+1) << endl;
    cout << *(p+2) << endl;

    p++;
    cout << *p << endl;

    return 0;
}
```

```text
10
20
30
20
```

`int* p = numbers` — `numbers` decays to a pointer to its first element. `p` holds the address of `numbers[0]`.
`*(p+1)` — pointer arithmetic: add 1 to the pointer (advances by `sizeof(int)` = 4 bytes), then dereference. Reads `numbers[1]`.
`p++` — advances the pointer to the next element. `*p` is now `numbers[1]` = 20.

**CS lens:** This is why `scores[i]` and `*(scores + i)` are identical — the compiler generates the same machine code for both. Array indexing in C++ is just syntactic sugar for pointer arithmetic.

## Passing Arrays to Functions

Arrays are always passed by pointer. The function receives the address of the first element:

```cpp
#include <iostream>
using namespace std;

int arraySum(int arr[], int size) {
    int total = 0;
    for (int i = 0; i < size; i++) {
        total += arr[i];
    }
    return total;
}

int main() {
    int values[5] = {1, 2, 3, 4, 5};
    cout << arraySum(values, 5) << endl;
    return 0;
}
```

```text
15
```

`int arr[]` in the parameter is equivalent to `int* arr`. The size is passed separately because the pointer alone carries no length information — there is no `.length` property.

**SE lens:** This is one of C++'s most common sources of bugs: passing an array without its size, or passing the wrong size. The standard library's `std::vector` (covered in Level 6) solves this by bundling the data and its size together. In modern C++, raw arrays are rarely used in new code.

## Challenge: array_max

Write a function `int arrayMax(int arr[], int size)` that returns the largest element in the array. Assume `size >= 1`.

```challenge
int arrayMax(int arr[], int size) {
    // TODO
}
```

```test
int a[] = {3, 7, 1, 9, 4};
int b[] = {-5, -1, -3};
int c[] = {42};
int d[] = {5, 5, 5};
assert arrayMax(a, 5) == 9
assert arrayMax(b, 3) == -1
assert arrayMax(c, 1) == 42
assert arrayMax(d, 3) == 5
```
