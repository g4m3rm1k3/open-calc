# The Standard Library: Containers, Algorithms, and Iterators

In 1992, Alexander Stepanov — a mathematician-turned-programmer who had spent years thinking about the relationship between algorithms and the data structures they operate on — presented a paper to the C++ standardization committee. The paper proposed what would become the Standard Template Library: a collection of containers and algorithms unified through a common interface called **iterators**.

The committee was skeptical. The proposal was mathematical in its rigor and unfamiliar in its design philosophy. But Stepanov's argument was compelling: if you separate data structures from algorithms — letting each algorithm work with any compatible container via iterators — you achieve something remarkable. You write `std::sort` once, and it works on arrays, vectors, deques, and any other sequence. You write a container once, and every algorithm works with it automatically.

The STL was incorporated into the C++ standard in 1994. Bjarne Stroustrup later called it the most significant single contribution to C++ since the language itself. It shipped with every standard C++ compiler and, quietly and completely, changed how the language was used.

## The Container Hierarchy

The STL provides containers for every common data structure need:

**Sequence containers** — elements in a defined order:
- `std::vector<T>` — dynamic array, O(1) random access, O(1) amortized push_back
- `std::deque<T>` — double-ended queue, O(1) push/pop at both ends
- `std::list<T>` — doubly linked list, O(1) insertion anywhere, no random access
- `std::array<T, N>` — fixed-size array, stack-allocated

**Associative containers** — elements organized for fast lookup:
- `std::map<K, V>` — ordered key-value pairs, O(log n) lookup (red-black tree)
- `std::set<T>` — ordered unique elements, O(log n) lookup
- `std::unordered_map<K, V>` — hash map, O(1) average lookup
- `std::unordered_set<T>` — hash set, O(1) average lookup

```cpp
#include <iostream>
#include <vector>
#include <map>
#include <unordered_map>
#include <set>

int main() {
    // vector: use for most sequences
    std::vector<int> v = {3, 1, 4, 1, 5, 9, 2, 6};
    v.push_back(5);
    std::cout << "Vector size: " << v.size() << std::endl;

    // set: unique, sorted elements automatically
    std::set<int> s(v.begin(), v.end());  // Construct from vector — deduplicates
    std::cout << "Unique elements: ";
    for (int n : s) std::cout << n << " ";
    std::cout << std::endl;

    // map: dictionary — key-value pairs, sorted by key
    std::map<std::string, int> wordCount;
    wordCount["hello"]++;
    wordCount["world"]++;
    wordCount["hello"]++;
    for (const auto& [word, count] : wordCount) {  // C++17 structured bindings
        std::cout << word << ": " << count << std::endl;
    }

    // unordered_map: hash map — faster lookup, no ordering
    std::unordered_map<std::string, int> scores;
    scores["Alice"] = 95;
    scores["Bob"] = 82;
    scores["Charlie"] = 91;
    std::cout << "Alice's score: " << scores["Alice"] << std::endl;
}
```

### Choosing the Right Container

The wrong container choice can make your program 10x slower. Key decision points:

- Need random access by index? → `vector`
- Need fast lookup by key? → `unordered_map` (hash) or `map` (ordered)
- Need unique elements, sorted? → `set`
- Need to insert/delete frequently in the middle? → `list` (but think twice — poor cache behavior)
- Need fast push/pop at both ends? → `deque`
- Default to `vector`. Most code that uses `list` or `deque` would be faster with `vector`.

Cache locality explains why `vector` wins so often. Modern CPUs fetch 64 bytes at a time (a cache line). Iterating a `vector<int>` reads 16 integers per cache miss. A `list` with the same integers stores each node separately on the heap — each access is a potential cache miss. In practice, `vector` beats `list` even for insertions at arbitrary positions, up to tens of thousands of elements.

## Iterators: The Glue Between Containers and Algorithms

An **iterator** is an object that acts like a pointer to an element in a container. It supports three operations:
- `*it` — dereference (get the element)
- `++it` — advance to the next element
- `it != end` — check if we've gone past the end

```cpp
#include <iostream>
#include <vector>
#include <list>

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5};

    // Explicit iterator usage
    for (std::vector<int>::iterator it = vec.begin(); it != vec.end(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;

    // auto makes this bearable
    for (auto it = vec.begin(); it != vec.end(); ++it) {
        *it *= 2;  // Double each element
    }

    // Range-based for is sugar for iterator loop
    for (auto n : vec) std::cout << n << " ";
    std::cout << std::endl;

    // Reverse iteration
    for (auto it = vec.rbegin(); it != vec.rend(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;
}
```

The power of iterators is that algorithms don't need to know what kind of container they're working with — just that the iterator supports the required operations. `std::sort` needs random-access iterators (like vector's). `std::find` only needs forward iterators (like list's). The iterator category determines which algorithms work.

## The Algorithm Library: `<algorithm>`

The `<algorithm>` header contains over 100 functions implementing fundamental operations. Most follow the pattern: take a range `[begin, end)` and do something to it.

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <string>

int main() {
    std::vector<int> v = {5, 2, 8, 1, 9, 3, 7, 4, 6};

    // Sorting
    std::sort(v.begin(), v.end());  // Ascending
    std::sort(v.begin(), v.end(), std::greater<int>());  // Descending

    // Searching
    auto it = std::find(v.begin(), v.end(), 5);
    if (it != v.end()) {
        std::cout << "Found 5 at position " << (it - v.begin()) << std::endl;
    }

    // Binary search (requires sorted range)
    std::sort(v.begin(), v.end());
    bool found = std::binary_search(v.begin(), v.end(), 7);
    std::cout << "7 found: " << std::boolalpha << found << std::endl;

    // Counting and filtering
    int evenCount = std::count_if(v.begin(), v.end(), [](int n) { return n % 2 == 0; });
    std::cout << "Even count: " << evenCount << std::endl;

    // Accumulation (sum, product, etc.)
    int sum = std::accumulate(v.begin(), v.end(), 0);
    int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<int>());
    std::cout << "Sum: " << sum << ", Product: " << product << std::endl;

    // Transform (apply a function to each element)
    std::vector<int> squares(v.size());
    std::transform(v.begin(), v.end(), squares.begin(), [](int n) { return n * n; });
    for (auto n : squares) std::cout << n << " ";
    std::cout << std::endl;

    // Removing elements (erase-remove idiom)
    v.erase(std::remove_if(v.begin(), v.end(), [](int n) { return n > 5; }), v.end());
    for (auto n : v) std::cout << n << " ";
    std::cout << std::endl;
}
```

The **erase-remove idiom** deserves explanation. `std::remove_if` moves matching elements to the end and returns an iterator to the new end — it doesn't actually erase. You then call `v.erase(new_end, v.end())` to remove those elements. This two-step is required because `remove_if` is a generic algorithm — it can't call `erase` because it doesn't know what kind of container it's working with.

## Lambdas: The Modern Revolution

Before C++11, passing a function to an algorithm required writing a separate functor class. C++11's lambda syntax changed this completely:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<std::pair<std::string, int>> students = {
        {"Alice", 95}, {"Bob", 82}, {"Charlie", 91}, {"Diana", 88}
    };

    // Sort by score descending
    std::sort(students.begin(), students.end(),
        [](const auto& a, const auto& b) { return a.second > b.second; });

    std::cout << "Rankings:" << std::endl;
    int rank = 1;
    for (const auto& [name, score] : students) {
        std::cout << rank++ << ". " << name << ": " << score << std::endl;
    }

    // Lambda capturing local variables
    int passingScore = 90;
    auto passed = std::count_if(students.begin(), students.end(),
        [passingScore](const auto& s) { return s.second >= passingScore; });
    std::cout << "Students passing (" << passingScore << "+): " << passed << std::endl;

    // Stateful lambda with mutable capture
    int total = 0;
    std::for_each(students.begin(), students.end(),
        [&total](const auto& s) { total += s.second; });
    std::cout << "Average: " << total / (int)students.size() << std::endl;
}
```

A lambda `[capture](params) { body }` is syntactic sugar for an anonymous class with an `operator()`. The capture clause specifies which variables from the enclosing scope are accessible:
- `[]` — capture nothing
- `[=]` — capture all by value (copy)
- `[&]` — capture all by reference
- `[x, &y]` — capture `x` by value, `y` by reference

## `std::string_view` and `std::span`: Non-Owning Views

C++17 added **views** — lightweight references to existing data that avoid copying:

```cpp
#include <iostream>
#include <string>
#include <string_view>

// Takes a view — no copy, works with any string-like source
void printFirstWord(std::string_view sv) {
    auto space = sv.find(' ');
    std::cout << sv.substr(0, space) << std::endl;
}

int main() {
    std::string s = "Hello World from C++";
    printFirstWord(s);  // No copy of the string!
    printFirstWord("Compile time string");  // Works with string literals too
    printFirstWord(s.substr(6, 5));  // And with substrings
}
```

`std::string_view` is just a pointer + length — it borrows the string's memory without copying. This makes string processing functions dramatically faster while remaining readable.

The STL is what separates C++ from C in daily use. Write a program in modern C++ and you'll use `vector`, `string`, a handful of algorithms, and maybe a `map`. These are not abstractions that slow you down — they're the result of 30 years of optimization and are frequently faster than hand-rolled equivalents because the optimizers have had decades to tune them. Trust the standard library.
