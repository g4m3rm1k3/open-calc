# Lesson 16: Bubble Sort and Insertion Sort

**What you will build:** You will write isolated console programs implementing classical quadratic sorting algorithms from scratch, followed by demonstrating their production counterpart. The transferable problem this solves is understanding the mechanics of in-place array manipulation, stability in sorting, and recognizing why an algorithm with poor theoretical complexity (Insertion Sort) is structurally essential to high-performance standard library algorithms.

**What you need to know first:** Lesson 01 Big-O, Lesson 11 Templates, Lesson 03 Pointers, and the complete C++ From Scratch series.

**Terms used in this lesson:**
- **Comparison sort** — An algorithm that orders elements by examining pairs and deciding which should come first based on a strict less-than relationship. *Why it exists:* To provide a generic way to sort any type of data as long as it defines an ordering operator, abstracting the sorting logic away from the specific data type.
- **In-place sort** — An algorithm that transforms input using no auxiliary data structures. *Why it exists:* To sort datasets strictly within their existing memory bounds, preventing out-of-memory crashes and allocation overhead when working with huge vectors.
- **Stable sort** — A sorting algorithm that preserves the relative order of equal elements. *Why it exists:* To allow sorting by multiple criteria sequentially (e.g., sorting objects by first name, then by last name) without scrambling the previous sort's work.

**Objects and methods used:**
- **`std::swap`**
  - *What it is:* A standard library utility function that exchanges the values of two variables.
  - *Implementation:* `void swap(T& a, T& b);`
  - *Its use:* To cleanly exchange two array elements without writing manual temporary variable boilerplate.
- **`std::sort`**
  - *What it is:* The standard library's default highly optimized sorting algorithm.
  - *Implementation:* `void sort(RandomIt first, RandomIt last);`
  - *Its use:* To sort an array in O(n log n) time automatically without writing manual nested loops.

**Everything else in the file, not this lesson's subject but still explained:**
- **`std::vector<T>`**
  - *What it is:* A dynamic array that holds contiguous elements.
  - *Implementation:* `class vector;`
  - *Its use:* To hold the unsorted dataset in a continuous block of memory.

---

## Concept Unit: Bubble Sort

### The Problem
When given an unsorted collection of data, we need a mechanism to order it by repeatedly pushing the absolute largest remaining element to its correct final position at the end of the array.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are analyzing basic sorting algorithms.
- **Files affected:** `bubble_sort.cpp` (created).
- **Change type:** Add.
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <utility>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    bool swapped;
    for (int i = 0; i < n - 1; i++) {
        swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

int main() {
    std::vector<int> data = {5, 2, 9, 1};
    bubbleSort(data);
    for (int v : data) std::cout << v << " ";
    std::cout << "\n";
    return 0;
}
```

### Introduce the Concept in Isolation and Discard
This code block is an isolated, standalone lab proving the execution of Bubble Sort. It is functionally complete, but because Bubble Sort is fundamentally slow, this script is immediately considered discarded and will not be incorporated into a production project.

### Mechanical Walkthrough
- `#include <iostream>`: Instructs the compiler to include the file defining input/output streams for console printing.
- `#include <vector>`: Brings in the `std::vector` template.
- `#include <utility>`: Brings in the definition for `std::swap`.
- `void bubbleSort(std::vector<int>& arr)`: Declares a function taking the vector by reference (`&`). Taking it by reference is mandatory here because an in-place sort must modify the caller's actual memory, not an isolated local copy.
- `int n = arr.size();`: Calls the `size()` method on the vector to get the total number of elements, storing it so it isn't recomputed every loop.
- `bool swapped;`: Declares a boolean flag to track if any changes occurred during a pass.
- `for (int i = 0; i < n - 1; i++)`: The outer loop. It runs `n - 1` times because the last remaining element is inherently sorted when all others are correct.
- `swapped = false;`: Resets the flag at the beginning of each pass.
- `for (int j = 0; j < n - i - 1; j++)`: The inner loop. It stops early (`- i`) because every complete outer loop guarantees the absolute largest remaining element has successfully "bubbled" to its final correct position at the end. We do not need to re-check the already-sorted tail.
- `if (arr[j] > arr[j + 1])`: The comparison. Evaluates to true if the left element is strictly greater than the right element.
- `std::swap(arr[j], arr[j + 1])`: A standard library utility that safely exchanges the contents of the two memory locations without manual temporary variables.
- `swapped = true;`: Records that a swap happened.
- `if (!swapped) break;`: An early exit condition. If an entire pass completes without a single swap, the array is perfectly sorted, and we bypass all remaining iterations.
- `int main()`: The entry point of the program.
- `std::vector<int> data = {5, 2, 9, 1};`: Instantiates the vector with an initial unsorted set of integers.
- `bubbleSort(data);`: Executes the sort on our vector.
- `for (int v : data)`: A range-based for loop. It asks the vector for its beginning and end iterators, sequentially pulling each integer into the local `v` variable.
- `std::cout << v << " ";`: Prints the current integer and a space to the console.
- `std::cout << "\n";`: Prints a newline character.
- `return 0;`: Exits the program successfully.

1. `i = 0, j = 0` — The algorithm compares `arr[0]` (5) to `arr[1]` (2). Because 5 > 2 is true, it calls `std::swap`. The array becomes `[2, 5, 9, 1]`, and `swapped` becomes `true`.
2. `i = 0, j = 1` — It compares `arr[1]` (5) to `arr[2]` (9). Because 5 is not greater than 9, no swap occurs. The array remains `[2, 5, 9, 1]`.
3. `i = 0, j = 2` — It compares `arr[2]` (9) to `arr[3]` (1). Because 9 > 1 is true, it calls `std::swap`. The array becomes `[2, 5, 1, 9]`. The largest element (9) has now correctly bubbled to its final slot.

### CS Lens
**Bubble Sort** is an **O(n²)** comparison sort. Its worst-case and average-case time complexities are quadratic because it must iterate over the array repeatedly, making it entirely impractical for large datasets. It is an **in-place** sort (requiring O(1) auxiliary memory) and a **stable** sort (equal elements never swap past each other, strictly preserving their initial relative order).

### SE Lens
The design principle here is algorithmic simplicity. The alternative not chosen is implementing a sophisticated algorithm like Merge Sort or Quick Sort immediately. The tradeoff is code complexity versus performance. Bubble Sort is almost never the right choice in production engineering because even among O(n²) sorts, it performs significantly more expensive memory writes (swaps) than Insertion Sort. It exists primarily as an educational stepping stone.

### Commands Needed
- `g++` — The GNU C++ Compiler.
- `-std=c++17` — Instructs the compiler to strictly adhere to the C++17 language standard.
- `bubble_sort.cpp` — The source file to compile.
- `-o bubble_sort` — Directs the compiler to name the final executable output `bubble_sort`.
- `./bubble_sort` — Executes the compiled binary.

### Run It
```text
1 2 5 9
```

While Bubble Sort is conceptually simple, its heavy reliance on swapping makes it inefficient, leading us to an algorithm that prefers shifting over swapping.

---

## Concept Unit: Insertion Sort

### The Problem
We need to sort elements efficiently when the dataset is already mostly sorted or extremely small, minimizing unnecessary and expensive memory writes.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `insertion_sort.cpp` (created).
- **Change type:** Add.
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>

void insertionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    std::vector<int> data = {5, 2, 9, 1};
    insertionSort(data);
    for (int v : data) std::cout << v << " ";
    std::cout << "\n";
    return 0;
}
```

### Introduce the Concept in Isolation and Discard
Like Bubble Sort, this file serves as an isolated demonstration of Insertion Sort mechanics. We will run it to prove the concept, and then discard this manual implementation in favor of the standard library.

### Mechanical Walkthrough
- `void insertionSort(std::vector<int>& arr)`: Declares the function, taking the vector by reference to modify it directly.
- `int n = arr.size();`: Stores the length of the vector.
- `for (int i = 1; i < n; i++)`: The outer loop. It starts at index `1` instead of `0` because a single element (at index 0) is intrinsically already a sorted sub-array of length 1.
- `int key = arr[i];`: Extracts the current element we are trying to place into the sorted portion, holding it in a local variable. This effectively creates an empty "hole" at index `i`.
- `int j = i - 1;`: Initializes the comparison pointer `j` to the element immediately left of the `key`.
- `while (j >= 0 && arr[j] > key)`: The core shifting loop. It continues as long as we haven't fallen off the left edge of the array (`j >= 0`) and the sorted element we are looking at is strictly larger than our `key`.
- `arr[j + 1] = arr[j];`: Copies the larger element one slot to the right, overwriting the hole and effectively sliding the hole one position to the left.
- `j--;`: Decrements `j` to examine the next element to the left.
- `arr[j + 1] = key;`: Drops the `key` into the final, correct hole once the `while` loop finishes shifting larger elements out of the way.

1. `i = 1` — `key` is `arr[1]` (2). The inner loop checks `j = 0` where `arr[0]` is 5. Because 5 > 2, it copies 5 to index 1. The loop ends. It places the `key` (2) at index 0. The array becomes `[2, 5, 9, 1]`.
2. `i = 2` — `key` is `arr[2]` (9). The inner loop checks `j = 1` where `arr[1]` is 5. Because 5 > 9 is false, the `while` loop never runs. It places 9 back at index 2. The array remains `[2, 5, 9, 1]`.
3. `i = 3` — `key` is `arr[3]` (1). The inner loop finds that 9, 5, and 2 are all strictly greater than 1, shifting all of them rightward. It finally places the `key` (1) at index 0. The array becomes `[1, 2, 5, 9]`.

### CS Lens
**Insertion Sort** is an **O(n²)** comparison sort in the worst and average cases. However, its best-case time complexity is an incredibly fast **O(n)** when the array is already sorted, because the `while` loop immediately fails and no memory shifts occur. Like Bubble Sort, it is strictly **in-place** and **stable**.

### SE Lens
The alternative not chosen is using Bubble Sort. The tradeoff is that while both share an O(n²) worst-case complexity, Insertion Sort performs vastly fewer memory operations. Bubble Sort swaps (which requires three memory writes) for every inversion; Insertion Sort simply shifts (one memory write) and places the key once. Because it involves tight loops, contiguous memory access, and predictable branching, Insertion Sort is the undisputed performance champion for extremely small arrays (typically fewer than 16 to 64 elements).

### Commands Needed
- `g++ -std=c++17 insertion_sort.cpp -o insertion_sort`
- `./insertion_sort`

### Run It
```text
1 2 5 9
```

Insertion Sort rules the domain of tiny or nearly-sorted arrays, but handling large, chaotic data requires a different class of algorithm provided directly by the standard library.

---

## Concept Unit: Standard Library `std::sort`

### The Problem
Writing manual nested loops for sorting is error-prone and scales poorly for large N. Production C++ code delegates this entirely to the standard library, which automatically chooses the most mathematically efficient algorithm sequence based on the dataset's size.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `std_sort_demo.cpp` (created).
- **Change type:** Add.
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> data = {5, 2, 9, 1};
    
    std::sort(data.begin(), data.end());
    
    for (int v : data) std::cout << v << " ";
    std::cout << "\n";
    return 0;
}
```

### Introduce the Concept in Isolation and Discard
This demonstrates the final, production-ready way to sort vectors. Unlike the previous two scripts, this approach is exactly what you will write in real-world C++ codeframes going forward.

### Mechanical Walkthrough
- `#include <algorithm>`: Brings in the standard library definitions for collection manipulation algorithms, explicitly including `std::sort`.
- `std::sort`: A standard library function template that sorts elements in-place using a hybrid algorithm.
- `data.begin()`: A vector method returning an iterator pointing to the very first element.
- `data.end()`: A vector method returning an iterator pointing to the memory location immediately after the last element.
- `std::sort(data.begin(), data.end())`: Executes the sort on the provided continuous range. By default, it uses the `<` operator to determine order.

```cpp
template <class RandomIt>
void sort(RandomIt first, RandomIt last);
```
- **`sort`**: This signature shows that the function accepts two iterators representing a range.

1. `data.begin()` to `data.end()` — The standard library receives the memory bounds and begins sorting the integer array in-place. Because the array is small, the internal implementation quietly routes this directly to an Insertion Sort routine.

### CS Lens
`std::sort` provides a guaranteed **O(n log n)** worst-case time complexity. Modern C++ standard libraries (like libstdc++ or libc++) implement this as **Introsort**. Introsort begins as Quick Sort for high performance, monitors the recursion depth, switches to Heap Sort if the depth becomes too deep (guaranteeing O(n log n)), and crucially, delegates completely to **Insertion Sort** for small sub-arrays (like ours) because Insertion Sort's low overhead fundamentally beats O(n log n) algorithms on tiny inputs. Note that `std::sort` is **not** a stable sort; `std::stable_sort` is provided if stability is explicitly required.

Also recognized in: V8 JavaScript engine's `Array.prototype.sort`, Python's `list.sort()` (via Timsort), and Rust's `slice::sort`, all of which aggressively fall back to Insertion Sort for tiny data chunks.

### SE Lens
The alternative not chosen is writing a bespoke Quick Sort or Merge Sort manually for everyday data. The tradeoff is strict control versus guaranteed safety and speed. By delegating to `std::sort`, you lose the ability to micromanage the sorting strategy, but you gain an aggressively optimized, deeply tested implementation that automatically leverages the specific architectural strengths of Insertion Sort on small data without you having to code the fallback logic yourself.

### Commands Needed
- `g++ -std=c++17 std_sort_demo.cpp -o std_sort_demo`
- `./std_sort_demo`

### Run It
```text
1 2 5 9
```

With `std::sort`, the standard library seamlessly blends theoretical complexity guarantees with raw hardware efficiency.

---

## Connect the Pieces
Sorting small arrays is an unavoidable foundation of computer science. Every time you invoke `std::sort` on massive datasets, the standard library divides your massive vectors into tiny partitions. Once those partitions are small enough, it silently drops its advanced O(n log n) logic and deploys the humble Insertion Sort at the absolute bottom of the call stack to finish the job fast.

## What Breaks Without This
If you attempt to write an in-place sorting algorithm but accidentally forget the pass-by-reference operator, your logic becomes disconnected from the real data.

Modify the Bubble Sort signature to pass by value:
```cpp
void bubbleSort(std::vector<int> arr) {
```

**The result:**
The code compiles and runs, but the final output is `5 2 9 1`. Passing by value silently creates a complete copy of the vector. The algorithm flawlessly sorts the isolated local copy inside the function's scope, but the moment `bubbleSort` returns, that sorted copy is destroyed. `main` prints the original, completely unmodified unsorted vector.

## Exercises
1. **Reverse Bubble Sort:** Modify the Bubble Sort `if` condition to `arr[j] < arr[j + 1]`. Run it and observe how it sorts the array in descending order.
2. **Stable Verification:** Create a struct representing a `Person` with an `age` and a `name`. Create a vector of people where two different people have the exact same age. Sort them by age using Insertion Sort and prove that their original relative ordering is preserved.
3. **Sort Subset:** Use `std::sort` but pass `data.begin()` and `data.begin() + 2`. Print the vector to prove that only the first two elements were sorted while the rest were untouched.

## Definition of Done
- [ ] You have compiled and executed a manual Bubble Sort.
- [ ] You have compiled and executed a manual Insertion Sort, tracing its shift logic.
- [ ] You have compiled and executed `std::sort` from the `<algorithm>` library.
- [ ] You can explain out loud why Insertion Sort outperforms O(n log n) algorithms on very small arrays.
- [ ] You have committed your code with a message explaining why `std::sort` internally relies on Insertion Sort.
