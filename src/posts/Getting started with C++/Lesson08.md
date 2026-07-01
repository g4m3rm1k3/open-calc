# Arrays, Strings, and Memory Layout

In November 1988, a graduate student at Cornell named Robert Morris launched what would become the first major internet worm. The Morris Worm exploited several vulnerabilities, but its most elegant attack vector was a **buffer overflow** in the Unix `fingerd` daemon. The program used C's `gets()` function to read user input into a fixed-size array. `gets()` had no way of knowing how large the array was — it just kept writing until it hit a newline. Morris provided more input than the array could hold. The excess data overwrote adjacent memory, including the saved return address on the call stack. When `fingerd` returned from the vulnerable function, it jumped not back to its caller, but to Morris's injected code.

The Morris Worm infected around 6,000 machines — roughly 10% of the internet in 1988. `gets()` was eventually deprecated in C99 and removed from C11. But the underlying vulnerability it exposed — the gap between "size of the array" and "amount of data written into it" — is still one of the most exploited classes of bugs in systems software. Understanding arrays at the memory level is not academic. It's the foundation of writing code that can't be attacked.

## What an Array Actually Is

An array in C++ is the simplest possible data structure: a **contiguous block of memory** holding a fixed number of elements of the same type. Nothing more. No length. No bounds checking. No metadata. Just bytes.

```cpp
#include <iostream>

int main() {
    int numbers[5] = {10, 20, 30, 40, 50};

    // The array variable IS the address of the first element
    std::cout << "Address of numbers:    " << numbers << std::endl;
    std::cout << "Address of numbers[0]: " << &numbers[0] << std::endl;
    // These print the same address!

    // Array elements are contiguous in memory
    for (int i = 0; i < 5; i++) {
        std::cout << "numbers[" << i << "] at address " << &numbers[i]
                  << " = " << numbers[i] << std::endl;
    }

    // The size of the array in bytes:
    std::cout << "Total bytes: " << sizeof(numbers) << std::endl;  // 5 * 4 = 20
    std::cout << "Element count: " << sizeof(numbers) / sizeof(numbers[0]) << std::endl;
}
```

Why does indexing start at 0? Because `numbers[i]` is compiled as `*(numbers + i)` — the address of `numbers` plus `i` elements worth of bytes. `numbers[0]` is `*(numbers + 0)` = the first element. This is pointer arithmetic — and it's why 0-indexing is natural in a language where arrays *are* pointers.

## C-Strings vs `std::string`

Before `std::string`, text in C was represented as a null-terminated array of `char` — a **C-string**. The string "hello" is stored as `{'h', 'e', 'l', 'l', 'o', '\0'}` — six bytes, with a zero byte signaling the end. Every function that processes C-strings (`strlen`, `strcpy`, `strcat`) has to scan for that zero byte to know where the string ends.

```cpp
#include <iostream>
#include <cstring>  // For C-string functions

int main() {
    // C-style string (null-terminated char array)
    char cstr[] = "hello";
    std::cout << "C-string: " << cstr << std::endl;
    std::cout << "Length (strlen): " << strlen(cstr) << std::endl;  // 5 (not counting \0)
    std::cout << "Size (sizeof): " << sizeof(cstr) << std::endl;    // 6 (including \0)

    // C++ std::string — manages its own memory, knows its length
    std::string s = "hello";
    std::cout << "std::string: " << s << std::endl;
    std::cout << "Length: " << s.length() << std::endl;
    std::cout << "Capacity: " << s.capacity() << std::endl;  // May be > length!

    // std::string operations that would be painful with C-strings:
    std::string s2 = s + " world";  // Concatenation
    s.insert(5, ",");               // Insert at position
    std::cout << s << std::endl;
    std::cout << s2 << std::endl;
}
```

`std::string` is the right choice for virtually all text handling in modern C++. It manages memory automatically (no buffer overflows), knows its own length (no null-terminator scanning), and provides a rich set of operations:

```cpp
#include <iostream>
#include <string>
#include <algorithm>

int main() {
    std::string text = "C++ is a powerful systems programming language";

    // Searching
    size_t pos = text.find("systems");
    if (pos != std::string::npos) {
        std::cout << "Found 'systems' at position " << pos << std::endl;
    }

    // Substring
    std::string sub = text.substr(11, 8);  // 8 chars starting at pos 11
    std::cout << "Substring: " << sub << std::endl;

    // Modification
    text.replace(pos, 7, "general-purpose");
    std::cout << text << std::endl;

    // Case conversion (using algorithm)
    std::string upper = text;
    std::transform(upper.begin(), upper.end(), upper.begin(), ::toupper);
    std::cout << upper << std::endl;

    // Splitting by delimiter (manual — no built-in split in C++17)
    std::string csv = "one,two,three,four";
    std::string token;
    size_t start = 0, end;
    while ((end = csv.find(',', start)) != std::string::npos) {
        std::cout << csv.substr(start, end - start) << std::endl;
        start = end + 1;
    }
    std::cout << csv.substr(start) << std::endl;  // Last token
}
```

## `std::array`: Safe Fixed-Size Arrays

C++11 introduced `std::array<T, N>` — a wrapper around a raw array that knows its size and works with the standard library:

```cpp
#include <iostream>
#include <array>
#include <algorithm>
#include <numeric>

int main() {
    std::array<int, 5> arr = {3, 1, 4, 1, 5};

    // Size is known at compile time
    std::cout << "Size: " << arr.size() << std::endl;

    // Works with standard algorithms
    std::sort(arr.begin(), arr.end());
    int sum = std::accumulate(arr.begin(), arr.end(), 0);

    std::cout << "Sorted: ";
    for (auto n : arr) std::cout << n << " ";
    std::cout << std::endl;
    std::cout << "Sum: " << sum << std::endl;

    // Bounds-checked access with .at() — throws std::out_of_range
    try {
        std::cout << arr.at(10) << std::endl;  // throws!
    } catch (const std::out_of_range& e) {
        std::cout << "Caught: " << e.what() << std::endl;
    }
}
```

Use `std::array` when you need a fixed-size collection that interoperates with standard library algorithms. Use a raw array only when interfacing with C code or in performance-critical embedded contexts.

## `std::vector`: The Dynamic Array

When you don't know the size at compile time, `std::vector<T>` is C++'s dynamic array — it grows automatically as you add elements:

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;

    std::cout << "Initial size: " << v.size() << ", capacity: " << v.capacity() << std::endl;

    // Push elements — vector grows as needed
    for (int i = 1; i <= 10; i++) {
        v.push_back(i * i);  // Square numbers
        std::cout << "After push_back: size=" << v.size()
                  << " capacity=" << v.capacity() << std::endl;
    }

    // Access elements
    std::cout << "Third element: " << v[2] << std::endl;  // No bounds check
    std::cout << "Third element: " << v.at(2) << std::endl;  // With bounds check

    // Remove last element
    v.pop_back();

    // Insert at position
    v.insert(v.begin() + 2, 999);

    std::cout << "Final vector: ";
    for (auto n : v) std::cout << n << " ";
    std::cout << std::endl;
}
```

Watch the capacity doubling. When a vector runs out of space, it allocates a new buffer of roughly double the current capacity, copies all elements, and frees the old buffer. This amortizes the cost of growing — N push_backs cost O(N) total even though individual pushes occasionally trigger O(N) copies.

If you know how many elements you'll need, call `v.reserve(N)` upfront to avoid reallocations:

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    v.reserve(1000);  // Allocate space for 1000 elements upfront

    std::cout << "After reserve: size=" << v.size()
              << " capacity=" << v.capacity() << std::endl;

    for (int i = 0; i < 1000; i++) {
        v.push_back(i);  // No reallocations — capacity was reserved
    }

    std::cout << "After filling: size=" << v.size()
              << " capacity=" << v.capacity() << std::endl;
}
```

## 2D Arrays and Memory Layout

A 2D array in C++ is an array of arrays — and it's laid out **row-major**: all elements of the first row, then all elements of the second row, and so on. This matters for performance.

```cpp
#include <iostream>

int main() {
    // Static 2D array
    int matrix[3][4] = {
        {1,  2,  3,  4},
        {5,  6,  7,  8},
        {9, 10, 11, 12}
    };

    // Row-major layout: elements are contiguous within a row
    std::cout << "Row-major layout in memory:" << std::endl;
    int* flat = &matrix[0][0];  // Treat as 1D
    for (int i = 0; i < 12; i++) {
        std::cout << flat[i] << " ";
    }
    std::cout << std::endl;

    // Accessing elements
    for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 4; col++) {
            std::cout << matrix[row][col] << "\t";
        }
        std::cout << std::endl;
    }

    // Dynamic 2D array using vector of vectors
    int rows = 3, cols = 4;
    std::vector<std::vector<int>> dyn(rows, std::vector<int>(cols, 0));
    dyn[1][2] = 42;
    std::cout << "Dynamic [1][2]: " << dyn[1][2] << std::endl;
}
```

The row-major order has cache performance implications. CPUs load data in cache lines — contiguous blocks of 64 bytes. Iterating over a 2D array **row by row** (`matrix[row][col]`) accesses sequential memory — cache-friendly. Iterating **column by column** (`matrix[col][row]`) jumps across memory in strides — cache-hostile. For large matrices, this can cause a 10x performance difference. This is the connection between data layout and performance that systems programmers think about daily.

The gap between high-level "array of numbers" and the physical reality of contiguous bytes in RAM is where bugs are born and where performance is found. Understanding it is what makes C++ programmers dangerous in the best possible sense.
