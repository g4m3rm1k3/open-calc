---
series: cpp-fundamentals
level: 7
title: Strings & the Standard Library
lang: cpp
---

# Strings & the Standard Library

C-style strings (`char[]`) are just arrays of characters terminated by a null byte `\0`. They are error-prone and tedious to work with. C++ provides `std::string` — a class from the standard library that manages its own memory, knows its own length, and supports operators and methods that make string manipulation safe and readable. This lesson also introduces `std::vector`, the standard library's resizable array.

## std::string — The Safe String

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Alice";
    string greeting = "Hello, " + name + "!";

    cout << greeting << endl;
    cout << "Length: " << name.length() << endl;
    cout << "First char: " << name[0] << endl;
    cout << "Last char: " << name[name.length() - 1] << endl;

    name += " Smith";
    cout << name << endl;

    return 0;
}
```

```text
Hello, Alice!
Length: 5
First char: A
Last char: e
Alice Smith
```

`#include <string>` — includes the string class. (Some compilers include it implicitly via `<iostream>`, but always include it explicitly.)

`"Hello, " + name` — the `+` operator concatenates strings. At least one operand must be a `std::string`; the other can be a string literal.

`name[0]` — index into a string to get a character. No bounds checking (like arrays). Use `name.at(0)` for bounds-checked access (throws an exception out of range).

`name.length()` — returns the number of characters as a `size_t` (an unsigned integer type).

**CS lens:** `std::string` stores characters in a heap-allocated buffer and tracks the length separately. This is why `length()` is O(1) — it reads a stored integer, not count characters. A C-style `strlen()` is O(n) because it scans for the `\0`. The `std::string` class also handles memory management — when the string grows, it reallocates automatically.

## Common String Methods

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "Hello, World!";

    cout << s.substr(7, 5)         << endl;
    cout << s.find("World")        << endl;
    cout << (s.find("xyz") == string::npos ? "not found" : "found") << endl;

    string lower = s;
    for (char& c : lower) {
        if (c >= 'A' && c <= 'Z') c += 32;
    }
    cout << lower << endl;

    return 0;
}
```

```text
World
7
not found
hello, world!
```

`s.substr(7, 5)` — returns a new string starting at index 7 with length 5.
`s.find("World")` — returns the index of the first occurrence of the substring. Returns `string::npos` (a very large integer) if not found.
`string::npos` — a sentinel value meaning "not found". Comparing `find()` result to `string::npos` is the standard pattern.

`for (char& c : lower)` — a range-based for loop over the characters. `char&` is a reference, so modifying `c` modifies the character in `lower`. `c += 32` converts uppercase ASCII to lowercase (A is 65, a is 97 — the difference is 32).

## std::vector — A Resizable Array

`std::vector` is C++'s standard resizable array. It owns its memory, grows automatically, and always knows its size:

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> scores;

    scores.push_back(88);
    scores.push_back(92);
    scores.push_back(75);
    scores.push_back(95);

    cout << "Count: " << scores.size() << endl;
    cout << "First: " << scores[0] << endl;

    int total = 0;
    for (int score : scores) {
        total += score;
    }
    cout << "Average: " << total / (int)scores.size() << endl;

    scores.pop_back();
    cout << "After pop: " << scores.size() << endl;

    return 0;
}
```

```text
Count: 4
First: 88
Average: 87
After pop: 3
```

`vector<int>` — a vector of integers. The type in `<>` is the **template parameter** — vectors can hold any type: `vector<string>`, `vector<double>`, `vector<Point>`.

`push_back(value)` — appends to the end. Amortized O(1).
`pop_back()` — removes the last element. O(1).
`scores.size()` — returns the number of elements as `size_t`.
`(int)scores.size()` — cast to `int` to avoid a signed/unsigned comparison warning when dividing.

`for (int score : scores)` — range-based for: iterates over all elements. `score` is a copy. Use `int& score` to modify elements in-place.

**SE lens:** Prefer `std::vector` over raw arrays in almost all new code. It is safer (knows its size), more flexible (resizes), and performs identically to a raw array for random access (both are O(1) index).

## Challenge: word_count

Write a function `int wordCount(const string& sentence)` that counts the number of words in a sentence. Words are separated by single spaces. An empty string has 0 words.

Use `string::find` and `string::substr` to scan through the sentence, or a range-based for loop that counts when you see a transition.

```challenge
int wordCount(const string& sentence) {
    // TODO
}
```

```test
assert wordCount("Hello World") == 2
assert wordCount("one") == 1
assert wordCount("") == 0
assert wordCount("a b c d e") == 5
assert wordCount("the quick brown fox") == 4
```
