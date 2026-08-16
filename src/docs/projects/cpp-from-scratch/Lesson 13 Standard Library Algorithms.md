# Lesson 13: Standard Library Algorithms

**What you will build:** A series of standalone programs that search, sort, transform, and summarize data without writing manual loops. This proves that you can manipulate collections declaratively. The problem this solves is the verbosity, error-proneness, and rigidity of writing custom loops every time you need to process data.

**What you need to know first:** Lesson 12: Standard Library Containers.

**Terms introduced in this lesson:**
- **Algorithm** — a generic, reusable function that operates on sequences of data rather than specific container types. *Why it exists:* to decouple the logic of an operation (like sorting) from the details of how data is stored.
- **Iterator** — an object that points to an element within a container and can step to the next element. *Why it exists:* to provide a uniform interface for algorithms to traverse any container, regardless of its internal memory layout.
- **Predicate** — a function or lambda that returns a boolean true or false. *Why it exists:* to provide custom conditional logic to algorithms, such as defining what "matching" means during a search.

**Objects and methods used:**
- **std::begin / std::end**
  - *What it is:* Functions that return iterators to the start and one-past-the-end of a container.
  - *Implementation:* `template <class C> auto begin(C& c) -> decltype(c.begin());`
  - *Its use:* Defining the exact range of elements an algorithm should process.
- **std::sort**
  - *What it is:* A function that orders elements in a range.
  - *Implementation:* `template <class RandomIt> void sort(RandomIt first, RandomIt last);`
  - *Its use:* Sorting data in-place.
- **std::find**
  - *What it is:* A function that searches a range for a specific value.
  - *Implementation:* `template <class InputIt, class T> InputIt find(InputIt first, InputIt last, const T& value);`
  - *Its use:* Locating an element without writing a manual loop.
- **std::transform**
  - *What it is:* A function that applies an operation to each element in a range and stores the result.
  - *Implementation:* `template <class InputIt, class OutputIt, class UnaryOperation> OutputIt transform(InputIt first1, InputIt last1, OutputIt d_first, UnaryOperation unary_op);`
  - *Its use:* Converting or mapping data from one form to another.
- **std::accumulate**
  - *What it is:* A function that folds or reduces a range of elements into a single value.
  - *Implementation:* `template <class InputIt, class T> T accumulate(InputIt first, InputIt last, T init);`
  - *Its use:* Summarizing data, such as calculating a sum or product.

---

## Concept Unit: The Iterator Interface

### The Problem
If you write a function to search a `std::vector`, it expects elements stored contiguously in memory. If you change your mind and use a `std::list` (which stores elements in disconnected memory nodes), your search function breaks. We need a standardized way to describe a sequence of data so that algorithms can traverse it without knowing how it is stored.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {10, 20, 30};

    std::vector<int>::iterator start = numbers.begin();
    std::vector<int>::iterator finish = numbers.end();

    std::cout << "First element: " << *start << "\n";
    
    // Move the iterator forward
    start++;
    std::cout << "Second element: " << *start << "\n";

    if (start != finish) {
        std::cout << "Not at the end yet.\n";
    }

    return 0;
}
```

### Mechanical Walkthrough
- `#include <vector>`: Provides the `std::vector` container.
- `std::vector<int> numbers = {10, 20, 30};`: Creates a standard vector containing three integers.
- `std::vector<int>::iterator`: The explicit type for an object that can point to and traverse elements inside a `std::vector<int>`.
- `numbers.begin()`: Returns an iterator pointing to the very first element (`10`).
- `numbers.end()`: Returns an iterator pointing to the conceptual position *one past the last element*. It does not point to `30`; it points to the boundary marking the end of the data.
- `*start`: The dereference operator `*`. It accesses the actual integer value sitting at the location the iterator currently points to.
- `start++`: The increment operator. It advances the iterator to point to the next element in the container (`20`).
- `start != finish`: Compares two iterators. It checks if the `start` iterator has reached the `finish` boundary.

### CS Lens
This is the Iterator pattern. It abstracts the traversal of a collection. Real-world equivalent: a bookmark in a book. The bookmark tells you exactly where you are and lets you turn to the next page, regardless of whether the book is a paperback, hardcover, or printed on a scroll.

### SE Lens
Iterators provide a generic boundary. The alternative is passing raw pointers or index integers `0` through `size - 1`. Indices only work for containers that support random access (like vectors). Iterators work for *all* standard library containers. The tradeoff is syntax complexity: iterators require verbose types and explicit dereferencing compared to a simple array index.

### Run It Yourself
1. Save the code as `iterators.cpp`.
2. Compile: `g++ -std=c++17 iterators.cpp -o iterators`
3. Run: `./iterators`
4. Observe the output:
First element: 10
Second element: 20
Not at the end yet.

---

## Concept Unit: `std::sort`

### The Problem
You need to order a collection of elements. Writing a sorting algorithm from scratch using raw loops is tedious, prone to off-by-one errors, and generally less efficient than a highly tuned standard implementation.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> scores = {85, 42, 100, 12, 73};

    std::sort(scores.begin(), scores.end());

    std::cout << "Sorted: ";
    for (int s : scores) {
        std::cout << s << " ";
    }
    std::cout << "\n";

    return 0;
}
```

### Mechanical Walkthrough
- `#include <algorithm>`: The header that contains most of the standard library algorithms, including `std::sort`.
- `std::sort(...)`: Calls the sorting algorithm. It operates entirely in-place, meaning it rearranges the original elements rather than creating a new container.
- `scores.begin(), scores.end()`: The two iterators defining the range to sort. `std::sort` takes a start point and an endpoint, allowing you to sort the entire container or just a subset of it.
- `for (int s : scores)`: A range-based for loop. Behind the scenes, this loop actually uses `begin()` and `end()` to traverse the vector, proving the result is correctly ordered.

### CS Lens
Sorting is a fundamental computational problem. `std::sort` typically implements Introsort, a hybrid algorithm that begins with Quicksort and switches to Heapsort if the recursion depth grows too large. Real-world equivalent: organizing a hand of playing cards from lowest to highest.

### SE Lens
Using `std::sort` communicates intent immediately. The alternative is a manual loop implementing a sort, which requires a reader to mentally parse the algorithm to realize "this just sorts the data." The standard library guarantees average and worst-case $O(N \log N)$ performance, which is mathematically optimal for comparison-based sorting.

### Run It Yourself
1. Save the code as `sort.cpp`.
2. Compile: `g++ -std=c++17 sort.cpp -o sort`
3. Run: `./sort`
4. Observe the output:
Sorted: 12 42 73 85 100 

---

## Concept Unit: `std::find`

### The Problem
You need to locate a specific value in a container. Writing a `for` loop that checks every element and breaks when it finds a match requires defining temporary variables to track success or failure.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> keys = {404, 200, 500, 301};

    auto it = std::find(keys.begin(), keys.end(), 500);

    if (it != keys.end()) {
        std::cout << "Found element: " << *it << "\n";
    } else {
        std::cout << "Element not found.\n";
    }

    return 0;
}
```

### Mechanical Walkthrough
- `auto it`: Uses the `auto` keyword to let the compiler deduce the type (which is `std::vector<int>::iterator`). This avoids typing out the verbose iterator type manually.
- `std::find(...)`: Calls the search algorithm. It takes three arguments: the start iterator, the end iterator, and the value to search for (`500`).
- `keys.end()`: If `std::find` cannot locate the value, it returns the end iterator (the one-past-the-end boundary). This is the standard C++ way of signaling "not found."
- `if (it != keys.end())`: We must check if the returned iterator is valid before trying to read its value.
- `*it`: Dereferences the valid iterator to extract the matched integer.

### CS Lens
This is a linear search. It checks elements sequentially from start to finish. Real-world equivalent: looking for a specific book on an unsorted shelf by examining the spine of every single book, one by one, until you spot the title.

### SE Lens
Standardized failure signaling. By returning the `end()` iterator on failure, `std::find` avoids needing special null pointers or returning invalid indices like `-1`. Every standard library algorithm uses this exact convention, making failure handling identical across the entire language.

### Run It Yourself
1. Save the code as `find.cpp`.
2. Compile: `g++ -std=c++17 find.cpp -o find`
3. Run: `./find`
4. Observe the output:
Found element: 500

---

## Concept Unit: `std::transform`

### The Problem
You have a sequence of data and you need to apply an operation to every element (like doubling a number or converting text to uppercase), storing the results in another container. Managing the source iterators, destination iterators, and the transformation logic manually is verbose.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> source = {1, 2, 3, 4};
    std::vector<int> destination(4); // Must pre-allocate space!

    std::transform(
        source.begin(), 
        source.end(), 
        destination.begin(), 
        [](int n) { return n * 2; }
    );

    std::cout << "Transformed: ";
    for (int n : destination) {
        std::cout << n << " ";
    }
    std::cout << "\n";

    return 0;
}
```

### Mechanical Walkthrough
- `std::vector<int> destination(4)`: Constructs a vector pre-filled with exactly four default elements (`0`). `std::transform` overwrites existing elements; it does not automatically resize the destination container. If the destination is too small, the program will corrupt memory and crash.
- `std::transform(...)`: The algorithm that maps inputs to outputs.
- `source.begin(), source.end()`: The range of input data to read from.
- `destination.begin()`: The starting point where the transformed results will be written. The algorithm assumes there is enough space starting at this iterator.
- `[](int n) { return n * 2; }`: A lambda expression. For each element read from the source, it is passed into the lambda as `n`. The lambda returns `n * 2`, which is then written to the destination.

### CS Lens
This is the `map` operation in functional programming. It transforms every element of a domain into a new value in a codomain. Real-world equivalent: an assembly line station that takes unpainted car doors (input), paints them, and places the painted doors onto a new conveyor belt (output).

### SE Lens
Data projection. The alternative is a manual `for` loop modifying elements one by one. `std::transform` explicitly declares the intent to map one set of data to another without altering the size or order of the elements. The cost is the strict requirement to pre-allocate the destination container, which can be a trap for beginners.

### Run It Yourself
1. Save the code as `transform.cpp`.
2. Compile: `g++ -std=c++17 transform.cpp -o transform`
3. Run: `./transform`
4. Observe the output:
Transformed: 2 4 6 8 

---

## Concept Unit: `std::accumulate`

### The Problem
You need to combine all elements in a sequence into a single value, such as calculating the sum of a list of numbers. Writing a loop requires declaring a running total variable outside the loop, modifying it inside, and reading it afterward.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> expenses = {15, 30, 22, 8};

    int total = std::accumulate(expenses.begin(), expenses.end(), 0);

    std::cout << "Total expenses: " << total << "\n";

    return 0;
}
```

### Mechanical Walkthrough
- `#include <numeric>`: The header file containing algorithms for numerical processing. `std::accumulate` lives here, not in `<algorithm>`.
- `std::accumulate(...)`: The algorithm that reduces a range to a single value.
- `expenses.begin(), expenses.end()`: The range of values to combine.
- `0`: The initial starting value. The algorithm begins with `0`, then adds `15`, then `30`, and so on. The type of this initial value (an integer) dictates the return type of the entire operation.
- `int total`: Stores the final calculated result.

### CS Lens
This is the `reduce` or `fold` operation in functional programming. It collapses a collection into a scalar value. Real-world equivalent: a cashier ringing up items at a grocery store. They start with a total of $0.00 and sequentially add the price of each item to the running total.

### SE Lens
Declarative aggregation. Using `std::accumulate` eliminates the external state (the running total variable) that a raw `for` loop requires. This guarantees that the initial value and the aggregation logic are tightly coupled in one expression, reducing the chance of state-related bugs.

### Run It Yourself
1. Save the code as `accumulate.cpp`.
2. Compile: `g++ -std=c++17 accumulate.cpp -o accumulate`
3. Run: `./accumulate`
4. Observe the output:
Total expenses: 75

---

## Connect the Pieces

A single sequence processing pipeline. Watch raw integers be sorted, filtered, and summed using only standard library algorithms.

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    std::vector<int> data = {5, 2, 8, 1, 9};

    // 1. Sort the data
    std::sort(data.begin(), data.end());

    // 2. Transform the data by multiplying by 10
    std::vector<int> scaled(data.size());
    std::transform(data.begin(), data.end(), scaled.begin(), [](int n) { 
        return n * 10; 
    });

    // 3. Accumulate the final result
    int final_sum = std::accumulate(scaled.begin(), scaled.end(), 0);

    std::cout << "Final sum: " << final_sum << "\n";

    return 0;
}
```

1. **`std::sort`**: Takes the raw unordered data and places it in ascending order: `1, 2, 5, 8, 9`.
2. **`std::transform`**: Reads the sorted data, multiplies each element by 10, and writes it to the pre-allocated `scaled` vector: `10, 20, 50, 80, 90`.
3. **`std::accumulate`**: Folds the `scaled` vector into a single integer sum, starting from `0`. The result is `250`.

## What Breaks Without This

Attempting to read an iterator that indicates failure without checking it first.

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 2, 3};

    auto it = std::find(numbers.begin(), numbers.end(), 99);

    // This will cause undefined behavior. The iterator points to the end boundary, not a real element.
    std::cout << "Found: " << *it << "\n"; 
    
    return 0;
}
```

**The Error:**
The program may print garbage data, crash with a segmentation fault, or behave unpredictably. `*it` dereferences invalid memory.

**The Fix:**
Always check the iterator against the `end()` boundary before dereferencing.
```cpp
if (it != numbers.end()) {
    std::cout << "Found: " << *it << "\n";
}
```

## Exercises
1. **The Descending Sort:** Create a vector of integers. Use `std::sort`, but pass a custom lambda as the third argument `[](int a, int b) { return a > b; }` to sort the vector in descending order. Print the result.
2. **The String Search:** Create a `std::vector<std::string>` containing three names. Use `std::find` to search for a specific name. Print whether it was found or not.
3. **The Base Offset:** Create a vector of integers. Use `std::accumulate`, but instead of passing `0` as the initial value, pass `100`. Print the result and verify the total is exactly 100 higher than the raw sum of the vector.

## Definition of Done
- [ ] You can declare and use iterators via `begin()` and `end()` to describe a range.
- [ ] You can use `std::sort` to order a collection in-place.
- [ ] You can safely use `std::find` and check its result against the `end()` iterator.
- [ ] You can use `std::transform` to map elements from one vector to a correctly sized destination vector.
- [ ] You can fold elements into a single value using `std::accumulate`.
- [ ] You can explain out loud why standard algorithms rely on iterators rather than container-specific loops.
