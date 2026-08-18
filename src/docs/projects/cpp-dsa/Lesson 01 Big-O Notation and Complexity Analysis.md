# Lesson 01: Big-O Notation and Complexity Analysis

**What you will build:** You will write isolated console programs that execute algorithms with different scaling properties. These programs demonstrate how execution time and memory usage grow as the size of the input grows. The transferable problem this solves is predicting whether an algorithm will survive real-world data volumes before you actually run it.

**What you need to know first:** The entire C++ From Scratch series (Lessons 01–35) is assumed complete. You must be comfortable with `std::vector`, loops, functions, and basic standard library usage.

**Terms used in this lesson:**
- **Time Complexity** — A measure of how the runtime of an algorithm increases as the input size increases. *Why it exists:* To evaluate algorithm speed mathematically, independent of CPU clock speed or hardware details.
- **Space Complexity** — A measure of how much extra memory an algorithm requires as the input size increases. *Why it exists:* To evaluate whether an algorithm will exhaust available RAM on massive datasets, separate from its execution speed.
- **Asymptotic Analysis** — The method of describing limiting behavior, focusing on the dominant term as the input size approaches infinity. *Why it exists:* To formalize the rule that constant factors and smaller terms do not matter at massive scale.
- **Best, Worst, and Average Case** — Categorizations of an algorithm's performance based on the specific arrangement of the input data, not just its size. *Why it exists:* To provide a complete picture of an algorithm's reliability, since some algorithms are fast usually but catastrophic occasionally.

**Objects and methods used:**
- **`std::vector<T>` / `size`**
  - *What it is:* A dynamic array.
  - *Implementation:* `size_t size() const;`
  - *Its use:* Provides the input size ($n$) that our algorithms must process.
- **`std::sort`**
  - *What it is:* A standard library algorithm for sorting a range of elements.
  - *Implementation:* `void sort(RandomIt first, RandomIt last);`
  - *Its use:* Demonstrates an operation that inherently takes more than linear time.

---

## Concept Unit: Constant Time — O(1)

### The Problem
If you measure an algorithm's speed in seconds, the same code will run faster on a new computer than an old one. To communicate efficiency universally, we need a metric that counts the exact number of operations an algorithm performs. The simplest case is an operation whose cost never changes, no matter how much data exists.

### The New Code
```cpp
#include <iostream>
#include <vector>

void printFirstElement(const std::vector<int>& data) {
    if (data.empty()) return;
    
    // This takes the same amount of time whether the vector has 10 items or 10 million.
    std::cout << "First element: " << data[0] << "\n";
}

int main() {
    std::vector<int> smallData = {5, 10, 15};
    std::vector<int> massiveData(1000000, 42); // 1 million items
    
    printFirstElement(smallData);
    printFirstElement(massiveData);
    
    return 0;
}
```

### Mechanical Walkthrough
- `void printFirstElement(const std::vector<int>& data)`: Takes a read-only reference to a vector.
- `if (data.empty()) return;`: A single check to prevent crashing.
- `data[0]`: The subscript operator accesses the first memory location of the vector directly. It does not scan the rest of the elements.
- `std::cout`: Prints the value.

### CS Lens
This is **O(1)**, or Constant Time. "O" stands for "Order of". O(1) means the number of operations is bounded by a constant. It does not literally mean "one operation"—it might be five instructions or fifty—but the critical fact is that the number of operations *does not scale* with the input size ($n$).

### SE Lens
The alternative not chosen is assuming that all operations are instantaneous. The tradeoff of recognizing O(1) is learning to identify what operations are truly "free" at scale. Array indexing is O(1); finding an item in a linked list is not. You design massive systems around O(1) lookups whenever possible.

### Run It Yourself
1. Save the code in `constant_time.cpp`.
2. Compile: `g++ -std=c++17 constant_time.cpp -o constant_time`.
3. Run: `./constant_time`.
4. Observe the output. Notice that both calls return instantly.

---

## Concept Unit: Linear Time — O(n) and Dropping Constants

### The Problem
When you must inspect every piece of data, the time taken grows proportionally to the input size. Furthermore, if you loop through the data twice, does that make it an entirely new category of complexity? We need a rule for handling linear growth and constant multipliers.

### The New Code
```cpp
#include <iostream>
#include <vector>

void printAllAndSum(const std::vector<int>& data) {
    // Loop 1
    for (int value : data) {
        std::cout << value << " ";
    }
    std::cout << "\n";
    
    // Loop 2
    int sum = 0;
    for (int value : data) {
        sum += value;
    }
    std::cout << "Sum: " << sum << "\n";
}

int main() {
    std::vector<int> data = {1, 2, 3, 4, 5};
    printAllAndSum(data);
    return 0;
}
```

### Mechanical Walkthrough
- `for (int value : data)` (first loop): Visits every element once to print it. If $n$ is 5, this loop runs 5 times.
- `int sum = 0;`: Initializes a counter.
- `for (int value : data)` (second loop): Visits every element again to add it to `sum`. This loop also runs 5 times.
- Total iterations: For $n$ items, the function performs $n + n = 2n$ iterations.

### CS Lens
This is **O(n)**, or Linear Time. But wait, there are two loops, so shouldn't it be O(2n)? Asymptotic analysis dictates that **constant factors are dropped**. As $n$ approaches infinity, the difference between $n$ and $2n$ is insignificant compared to the difference between $n$ and $n^2$. O(2n), O(500n), and O(n/2) are all simplified to O(n). They represent the same linear growth curve.

### SE Lens
The alternative not chosen is tracking exact operational counts (like precisely $2n + 3$ instructions). The tradeoff is that dropping constants loses precision for small inputs, but gains universal comparability. In engineering, an O(n) algorithm with a large constant factor might be slower than an O(n^2) algorithm for $n=10$, but the O(n) will inevitably win as data scales to millions. 

### Run It Yourself
1. Save the code in `linear_time.cpp`.
2. Compile: `g++ -std=c++17 linear_time.cpp -o linear_time`.
3. Run: `./linear_time`.

---

## Concept Unit: Quadratic Time — O(n²)

### The Problem
When logic requires comparing every element against every other element, the number of operations explodes. We need to measure what happens when linear operations are nested inside other linear operations.

### The New Code
```cpp
#include <iostream>
#include <vector>

void printAllPairs(const std::vector<int>& data) {
    int operations = 0;
    for (size_t i = 0; i < data.size(); ++i) {
        for (size_t j = 0; j < data.size(); ++j) {
            std::cout << "(" << data[i] << ", " << data[j] << ") ";
            operations++;
        }
        std::cout << "\n";
    }
    std::cout << "Total operations: " << operations << "\n";
}

int main() {
    std::vector<int> data = {1, 2, 3, 4};
    printAllPairs(data);
    return 0;
}
```

### Mechanical Walkthrough
- `for (size_t i = 0; i < data.size(); ++i)`: The outer loop. Runs exactly $n$ times.
- `for (size_t j = 0; j < data.size(); ++j)`: The inner loop. For *every single tick* of the outer loop, this inner loop runs exactly $n$ times from start to finish.
- `operations++`: A counter to prove the exact number of inner executions. If $n=4$, the inner block executes $4 \times 4 = 16$ times.

### CS Lens
This is **O(n²)**, or Quadratic Time. If you double the input size, the execution time quadruples. Nested loops iterating over the same dataset are the classic hallmark of O(n²). At massive scale, O(n²) is generally considered a failure mode for an algorithm; an O(n²) solution that works for a thousand items will freeze a server when given a million.

### SE Lens
The alternative not chosen is writing code this way because it is usually the easiest logic to write (e.g., a brute-force duplicate check). The tradeoff is catastrophic failure under load. Engineers spend significant effort redesigning O(n²) algorithms into O(n log n) or O(n) using hash maps or sorting.

### Run It Yourself
1. Save the code in `quadratic_time.cpp`.
2. Compile and run. 
3. Observe the output: 4 items result in 16 pairs. If you change the vector to hold 10 items, it will run 100 times.

---

## Concept Unit: Logarithmic Time — O(log n)

### The Problem
O(n) is considered fast, but if you are searching a database of billions of records, visiting every item once is still too slow. If the data is already sorted, we need a way to discard vast amounts of the search space instantly.

### The New Code
```cpp
#include <iostream>

void simulateBinarySearch(int n) {
    int operations = 0;
    int remainingElements = n;
    
    while (remainingElements > 1) {
        remainingElements /= 2; // Discard half the data
        operations++;
    }
    
    std::cout << "Input size: " << n << " -> Operations: " << operations << "\n";
}

int main() {
    simulateBinarySearch(16);
    simulateBinarySearch(1024);
    simulateBinarySearch(1048576); // ~1 million
    simulateBinarySearch(1073741824); // ~1 billion
    
    return 0;
}
```

### Mechanical Walkthrough
- `int remainingElements = n;`: Simulates starting with a sorted dataset of size $n$.
- `while (remainingElements > 1)`: The loop continues until only one element is left (the target).
- `remainingElements /= 2;`: The core mechanic. In a real binary search, you check the middle element. If your target is smaller, you discard the entire upper half. The search space is cut exactly in half every iteration.
- `operations++`: Counts how many times we halve the data.

### CS Lens
This is **O(log n)**, or Logarithmic Time (specifically, base 2). It is the inverse of exponentiation. If exponentiation doubles the value at every step, logarithm halves it. For 1 billion items, an O(n) search takes 1,000,000,000 operations. An O(log n) search takes exactly 30 operations. It is overwhelmingly powerful.

### SE Lens
The alternative not chosen is ignoring sorted data and always using linear search. The tradeoff is setup cost: you can only achieve O(log n) searches if the data is rigidly kept in sorted order, which costs time to maintain when inserting new data. 

### Run It Yourself
1. Save the code in `log_time.cpp`.
2. Compile and run.
3. Observe the output: 1 billion items process in just 30 operations.

---

## Concept Unit: Linearithmic Time — O(n log n)

### The Problem
We know O(n) visits everything once, and O(log n) halves the dataset. What happens when an algorithm must perform an O(log n) operation *for every single item* in an $n$-sized dataset? This is the theoretical limit for comparison-based sorting.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> data = {5, 2, 9, 1, 5, 6};
    
    // std::sort operates in O(n log n) time
    std::sort(data.begin(), data.end());
    
    for (int value : data) {
        std::cout << value << " ";
    }
    std::cout << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <algorithm>`: Brings in the standard library's optimized algorithms.
- `std::sort(data.begin(), data.end())`: Sorts the entire vector from beginning to end.
- `data.begin()`, `data.end()`: Iterators marking the range.

### CS Lens
This is **O(n log n)**, or Linearithmic Time. Efficient sorting algorithms like Merge Sort, Heap Sort, and C++'s `std::sort` (usually IntroSort) fall into this category. It means the algorithm splits the data logarithmically, but must touch every element linearly to merge or partition them. It is much slower than O(n), but dramatically faster than O(n²).

### SE Lens
The alternative not chosen is writing a naive sorting loop (like Bubble Sort) which is O(n²). The tradeoff is that O(n log n) algorithms are significantly more complex to write from scratch, which is why engineering relies entirely on standard library implementations like `std::sort` rather than reinventing them.

### Run It Yourself
1. Save the code in `n_log_n_time.cpp`.
2. Compile and run. Observe the sorted output.

---

## Concept Unit: Best, Worst, and Average Case

### The Problem
If you use linear search to find the number 5, and 5 is the very first item in the array, it takes 1 operation. If it's the last item, it takes $n$ operations. Saying the algorithm is "O(n)" tells a partial truth. We need distinct terminology to describe how data arrangement affects performance.

### The New Code
```cpp
#include <iostream>
#include <vector>

bool findTarget(const std::vector<int>& data, int target) {
    int operations = 0;
    for (int value : data) {
        operations++;
        if (value == target) {
            std::cout << "Found in " << operations << " operations.\n";
            return true;
        }
    }
    std::cout << "Not found. Took " << operations << " operations.\n";
    return false;
}

int main() {
    std::vector<int> data = {10, 20, 30, 40, 50};
    
    findTarget(data, 10); // Target is first
    findTarget(data, 50); // Target is last
    findTarget(data, 99); // Target is missing
    
    return 0;
}
```

### Mechanical Walkthrough
- `if (value == target)`: Checks the current element against the target.
- `return true;`: Exits the function immediately. The loop terminates. The rest of the vector is skipped.
- `findTarget(data, 10)`: The first call searches for `10`, which is at index 0.

### CS Lens
- **Best Case:** The target is first. It takes 1 operation. The Best Case complexity is O(1).
- **Worst Case:** The target is last, or doesn't exist at all. It must scan the entire array. The Worst Case is O(n).
- **Average Case:** Assuming random distribution, you will find the item halfway through, taking $n/2$ operations. Dropping the constant, the Average Case is O(n).

When engineers simply say "this algorithm is O(n)", they are almost always referring to the **Worst Case**.

### SE Lens
The alternative not chosen is judging algorithms by their Best Case. The tradeoff is that engineering relies on guarantees. If a web server's search function is fast on average but takes 10 seconds in the worst case, a malicious user can send a payload that forces the worst-case path and crashes the server. We engineer for the worst case.

### Run It Yourself
1. Save the code in `cases.cpp`.
2. Compile and run.
3. Observe the output: the first call takes 1 operation, the others take 5 operations.

---

## Concept Unit: Space Complexity

### The Problem
Time is not the only constrained resource; memory is finite. An algorithm might be incredibly fast (O(1) time) but require duplicating the entire dataset in RAM. We must measure the *extra* memory an algorithm consumes as $n$ scales.

### The New Code
```cpp
#include <iostream>
#include <vector>

std::vector<int> duplicateArray(const std::vector<int>& original) {
    // We allocate a brand new vector of the same size
    std::vector<int> copy;
    for (int value : original) {
        copy.push_back(value);
    }
    return copy;
}

int main() {
    std::vector<int> data = {1, 2, 3};
    std::vector<int> result = duplicateArray(data);
    
    std::cout << "Original size: " << data.size() << "\n";
    std::cout << "Copy size: " << result.size() << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `std::vector<int> copy;`: A new, empty vector is created in memory.
- `copy.push_back(value);`: For every element in `original`, a new element is allocated inside `copy`.
- `return copy;`: The function yields the new memory structure.

### CS Lens
This algorithm has an **O(n) Space Complexity**. The space required by the input (`original`) does not count. Space complexity strictly measures the *auxiliary* (extra) space required by the algorithm itself. Because we create a new vector matching the size of the input, the extra memory scales linearly with $n$. If we modified `original` directly without making a copy, the space complexity would be **O(1)**.

### SE Lens
The alternative not chosen is mutating the original data in place. The tradeoff is safety versus memory. Creating a copy (O(n) space) preserves the original data for other functions to use safely. Mutating in place (O(1) space) destroys the original state but allows algorithms to run on massive datasets that are too large to fit in RAM twice.

### Run It Yourself
1. Save the code in `space_complexity.cpp`.
2. Compile and run.

---

## Connect the Pieces

Imagine a multi-stage pipeline processing user data. You read a file of user IDs into a vector (O(n) space). You must filter out duplicates. If you use a nested loop comparing every ID to every other ID, the time taken is O(n²), and your server freezes when a million users register. You replace the nested loop by first sorting the vector with `std::sort` (O(n log n) time), then running a single pass over it to remove adjacent duplicates (O(n) time). By analyzing the complexity class, you proved the pipeline would survive before ever running the code.

## What Breaks Without This

If you fail to drop constants or focus on the worst case, you will choose the wrong data structure. 

Consider an algorithm that does $100n$ operations and an algorithm that does $n^2$ operations. Without asymptotic analysis, a developer testing with $n=10$ will see the $n^2$ algorithm take 100 operations, and the $100n$ algorithm take 1,000 operations. They will deploy the $n^2$ algorithm because it was "faster." When the data hits $n=10,000$, the $100n$ algorithm takes a manageable 1 million operations, but the $n^2$ algorithm attempts 100 million operations and times out.

## Exercises

1. **Complexity Identification:** Write a function that takes a vector, iterates through it once, and then iterates through it a second time backwards. What is the time complexity? What is the space complexity?
2. **Space Optimization:** Write a function that reverses a `std::vector<int>`. Do it once by creating a new vector and pushing elements in reverse (O(n) space). Do it a second time by swapping elements in the original vector using a `while` loop with two pointers. What is the new space complexity?
3. **Logarithmic Logic:** In the binary search simulation code, change the initial $n$ to 8. Track by hand how many times the loop runs. Now change it to 32. How many additional operations did multiplying the input by 4 cost?

## Definition of Done

- [ ] You can explain why O(2n) is simplified to O(n).
- [ ] You can identify a nested loop as O(n²) time complexity.
- [ ] You have run code demonstrating O(log n) scaling and observed its extreme efficiency.
- [ ] You understand that Space Complexity measures *extra* memory, not the memory of the input itself.
- [ ] You can articulate why engineers primarily focus on Worst Case scenarios.
