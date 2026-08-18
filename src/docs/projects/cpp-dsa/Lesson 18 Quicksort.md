# Lesson 18: Quicksort

**What you will build:** You will implement the Quicksort algorithm from scratch to efficiently sort collections of data in-place. The transferable problem this solves is organizing data for fast retrieval without the heavy memory overhead required by other recursive sorting methods.

**What you need to know first:** Lesson 01 Big-O, Lesson 17 Merge Sort.

**Terms used in this lesson:**
- **Pivot** — A chosen element from the array used as a dividing line. *Why it exists:* To act as a reference point for comparing and organizing all other elements in the current segment.
- **Partitioning** — The process of rearranging the array so that elements smaller than the pivot are on one side and elements larger are on the other. *Why it exists:* To guarantee the pivot is placed in its final sorted position (or to guarantee separate smaller/larger blocks), breaking the problem into smaller independent subproblems.
- **In-place sorting** — A sorting algorithm that requires no extra memory allocation proportional to the input size. *Why it exists:* To avoid the memory pressure and allocation time of creating temporary arrays during sorting.
- **Introsort** — A hybrid sorting algorithm that begins with Quicksort and switches to Heapsort when recursion depth becomes too high. *Why it exists:* To provide the fast average-case performance of Quicksort while guaranteeing a worst-case O(n log n) runtime without stack overflows.

**Objects and methods used:**
- **`std::swap`**
  - *What it is:* A standard library template function that exchanges the values of two variables.
  - *Implementation:* `void swap(T& a, T& b);`
  - *Its use:* To efficiently move elements around within the array during partitioning.
- **`std::sort`**
  - *What it is:* The standard library's default sorting algorithm, commonly implemented as introsort.
  - *Implementation:* `void sort(RandomIt first, RandomIt last);`
  - *Its use:* To sort collections in production code, bypassing the need to write a custom partitioning loop.

---

## Concept Unit: The Lomuto Partition Scheme

### The Problem
Before you can recursively divide and conquer, you need a mechanism to separate an array into "smaller than X" and "larger than X" segments without allocating a second array. You need to scan the array and swap elements into their correct sides in a single pass.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition to prove the algorithm's mechanics.
- **Files affected:** `lomuto.cpp` (created).
- **Change type:** Add.
- **Location:** Entire file.
- **Dependencies:** Standard C++ library.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <utility>

int lomuto_partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

int main() {
    std::vector<int> data = {10, 80, 30, 90, 40, 50, 70};
    int pivot_index = lomuto_partition(data, 0, data.size() - 1);
    
    std::cout << "Pivot placed at index: " << pivot_index << "\n";
    for (int num : data) {
        std::cout << num << " ";
    }
    std::cout << "\n";
    return 0;
}
```

### The Updated Project
*(No enclosing project structure yet—this is a standalone throwaway to prove partitioning. The entire code above represents the working file.)*

### Mechanical Walkthrough
- `#include <iostream>`: Instructs the compiler to include the standard input/output stream library so you can print to the console.
- `#include <vector>`: Instructs the compiler to include the dynamic array container.
- `#include <utility>`: Instructs the compiler to include utility functions, which includes `std::swap`.
- `int lomuto_partition(std::vector<int>& arr, int low, int high)`: Defines a function that takes a reference to the array and the integer boundaries of the segment to partition. Taking the vector by reference (`&`) ensures no copy is made.
- `int pivot = arr[high];`: Chooses the last element in the segment as the **pivot** value.
- `int i = low - 1;`: Initializes an index `i` that tracks the boundary of the "smaller than pivot" segment. It starts just outside the segment because no smaller elements have been found yet.
- `for (int j = low; j < high; j++)`: Iterates a scanning index `j` from the beginning of the segment up to, but not including, the pivot itself.
- `if (arr[j] <= pivot)`: Checks if the current element belongs on the left side of the pivot.
- `i++;`: Expands the "smaller" segment by moving its boundary forward by one.
- `std::swap(arr[i], arr[j]);`: Exchanges the newly found smaller element at `j` with the element at the new boundary `i`.
- `std::swap(arr[i + 1], arr[high]);`: Moves the pivot from its temporary spot at the end (`high`) into its correct sorted position immediately following the last smaller element (`i + 1`).
- `return i + 1;`: Returns the final index of the pivot so the caller knows where the array was split.
- `std::vector<int> data = {10, 80, 30, 90, 40, 50, 70};`: Creates a standard vector initialized with seven test values.
- `int pivot_index = lomuto_partition(data, 0, data.size() - 1);`: Calls the partitioning function passing the lowest index (`0`) and the highest valid index.
- `std::cout << "Pivot placed at index: " << pivot_index << "\n";`: Prints the integer returned by the partition function.
- `for (int num : data)`: A range-based for loop that accesses each element in the `data` vector sequentially.
- `std::cout << num << " ";`: Prints each array element followed by a space.

Execution trace for `lomuto_partition`:
1. `i = -1`, `j = 0`, `arr[0]` is `10` (<= 70) — `i` becomes `0`, swaps `arr[0]` with `arr[0]`.
2. `i = 0`, `j = 1`, `arr[1]` is `80` (> 70) — no swap.
3. `i = 0`, `j = 2`, `arr[2]` is `30` (<= 70) — `i` becomes `1`, swaps `arr[1]` (`80`) with `arr[2]` (`30`). Array: `{10, 30, 80, 90, 40, 50, 70}`.
4. `i = 1`, `j = 3`, `arr[3]` is `90` (> 70) — no swap.
5. `i = 1`, `j = 4`, `arr[4]` is `40` (<= 70) — `i` becomes `2`, swaps `arr[2]` (`80`) with `arr[4]` (`40`). Array: `{10, 30, 40, 90, 80, 50, 70}`.
6. `i = 2`, `j = 5`, `arr[5]` is `50` (<= 70) — `i` becomes `3`, swaps `arr[3]` (`90`) with `arr[5]` (`50`). Array: `{10, 30, 40, 50, 80, 90, 70}`.
7. Loop ends. Swaps `arr[4]` (`80`) with `arr[6]` (`70`). Final array: `{10, 30, 40, 50, 70, 90, 80}`. Pivot `70` is now fixed at index `4`.

### CS Lens
This algorithm operates strictly **in-place**. Unlike Merge Sort, which allocates a completely new array to merge halves together, Lomuto partitioning requires O(1) extra space because it rearranges elements by swapping them directly within the existing memory. 

### SE Lens
The design principle here is trading predictability for memory efficiency. The alternative not chosen is allocating left and right sub-arrays, pushing elements into them, and copying them back. That alternative is easier to write and mentally model but introduces high memory allocation overhead, which is exactly the performance hit Quicksort aims to avoid.

### Run It Yourself
1. Open a terminal and create a file named `lomuto.cpp` with the code above.
2. Compile it: `g++ -std=c++17 lomuto.cpp -o lomuto`.
3. Run the executable: `./lomuto`.
4. Observe the output: 
   Pivot placed at index: 4
   10 30 40 50 70 90 80

*State plainly: This exact `lomuto_partition` throwaway is now discarded. It will not appear in the project again. It is being replaced by the more efficient Hoare scheme.*

---

## Concept Unit: The Hoare Partition Scheme

### The Problem
Lomuto partitioning is straightforward to read but does more swaps than necessary, especially when many elements are already in the correct order. You need a partitioning algorithm that minimizes memory writes by moving pointers from both ends.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `hoare.cpp` (created).
- **Change type:** Add.
- **Location:** Entire file.
- **Dependencies:** Standard C++ library.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <utility>

int hoare_partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[low + (high - low) / 2];
    int i = low - 1;
    int j = high + 1;

    while (true) {
        do { i++; } while (arr[i] < pivot);
        do { j--; } while (arr[j] > pivot);

        if (i >= j) return j;
        std::swap(arr[i], arr[j]);
    }
}

int main() {
    std::vector<int> data = {10, 80, 30, 90, 40, 50, 70};
    int split_index = hoare_partition(data, 0, data.size() - 1);
    
    std::cout << "Split index: " << split_index << "\n";
    for (int num : data) {
        std::cout << num << " ";
    }
    std::cout << "\n";
    return 0;
}
```

### The Updated Project
*(No enclosing project structure yet—this is a standalone throwaway to prove partitioning. The entire code above represents the working file.)*

### Mechanical Walkthrough
- `int hoare_partition(std::vector<int>& arr, int low, int high)`: Defines the partition function using Hoare's scheme.
- `int pivot = arr[low + (high - low) / 2];`: Selects the middle element as the **pivot**. This specific calculation `low + (high - low) / 2` avoids integer overflow that `(low + high) / 2` might cause on massive arrays.
- `int i = low - 1;`: Initializes the left pointer `i` strictly outside the array segment.
- `int j = high + 1;`: Initializes the right pointer `j` strictly outside the array segment.
- `while (true)`: An infinite loop that will only exit via the `return` statement inside it.
- `do { i++; } while (arr[i] < pivot);`: Moves the left pointer forward sequentially as long as it sees elements that correctly belong on the left. It stops when it finds an element that is `>= pivot`.
- `do { j--; } while (arr[j] > pivot);`: Moves the right pointer backward sequentially as long as it sees elements that correctly belong on the right. It stops when it finds an element that is `<= pivot`.
- `if (i >= j) return j;`: Checks if the pointers have crossed. If they have, partitioning is done. It returns `j`, which marks the highest index of the lower partition.
- `std::swap(arr[i], arr[j]);`: Exchanges the two out-of-place elements, moving them to their correct sides.
- `int split_index = hoare_partition(data, 0, data.size() - 1);`: Calls the function and stores the resulting boundary index.

### CS Lens
Hoare's scheme uses two pointers working inward. It performs on average three times fewer swaps than Lomuto's scheme. Unlike Lomuto, Hoare does not guarantee the pivot itself is placed exactly at the split index; it merely guarantees that all elements from `low` through `j` are smaller than or equal to all elements from `j + 1` through `high`.

### SE Lens
The alternative not chosen is keeping the Lomuto algorithm. The tradeoff is code complexity versus runtime performance. Hoare's `do-while` loops and indices are notoriously easy to write incorrectly, resulting in out-of-bounds access or infinite loops. We choose Hoare because in a foundational sorting routine, maximizing runtime efficiency outweighs internal implementation difficulty.

### Run It Yourself
1. Save the code in `hoare.cpp`.
2. Compile: `g++ -std=c++17 hoare.cpp -o hoare`.
3. Run: `./hoare`.
4. Observe the output. Notice the array is separated into smaller and larger halves around index `4`.

*State plainly: This standalone `hoare.cpp` throwaway code is deleted. The partition logic will now be integrated directly into the full Quicksort.*

---

## Concept Unit: Recursive Quicksort

### The Problem
Partitioning groups the array into two halves, but neither half is internally sorted yet. You need to repeatedly partition those smaller and smaller halves until the segments are so small they are trivially sorted.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `quicksort.cpp` (created).
- **Change type:** Add.
- **Location:** Entire file.
- **Dependencies:** Standard C++ library.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <utility>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[low + (high - low) / 2];
    int i = low - 1;
    int j = high + 1;
    while (true) {
        do { i++; } while (arr[i] < pivot);
        do { j--; } while (arr[j] > pivot);
        if (i >= j) return j;
        std::swap(arr[i], arr[j]);
    }
}

void quicksort(std::vector<int>& arr, int low, int high) {
    if (low >= high) return;

    int split = partition(arr, low, high);
    quicksort(arr, low, split);
    quicksort(arr, split + 1, high);
}

int main() {
    std::vector<int> data = {90, 10, 80, 30, 70, 40, 50};
    
    quicksort(data, 0, data.size() - 1);
    
    for (int num : data) {
        std::cout << num << " ";
    }
    std::cout << "\n";
    return 0;
}
```

### The Updated Project
*(No enclosing project structure yet—this is a standalone program to prove the recursive behavior. The entire code above represents the working file.)*

### Mechanical Walkthrough
- `void quicksort(std::vector<int>& arr, int low, int high)`: Defines the recursive sorting function that coordinates the partitioning.
- `if (low >= high) return;`: The base case for the recursion. If the segment has one element or zero elements, it is already logically sorted. The function returns immediately.
- `int split = partition(arr, low, high);`: Calls the Hoare partitioning logic. The segment is rearranged in-place, and the split point index is retrieved.
- `quicksort(arr, low, split);`: Recursively calls itself to sort the left partition, from `low` up to the `split` index.
- `quicksort(arr, split + 1, high);`: Recursively calls itself to sort the right partition, from strictly after the `split` index up to `high`.

### CS Lens
This is the **Divide and Conquer** algorithm design paradigm. On average, the pivot splits the array roughly in half, leading to a recursion tree depth of exactly `log(n)`. At each depth level, partitioning does linear scanning work `O(n)`. This yields an **average time complexity of O(n log n)**. 
However, if the pivot selection is consistently poor (e.g., picking the maximum element every time in a pre-sorted array), one partition will hold 1 element and the other will hold `n-1` elements. This degenerates the recursion depth to `n`, creating a **worst-case time complexity of O(n²)**. 

### SE Lens
The design principle here is optimizing for expected real-world performance. The tradeoff is accepting a theoretical O(n²) worst-case edge behavior to gain significantly faster real-world execution times than Merge Sort, because Quicksort's in-place, contiguous-memory nature entirely avoids cache misses and memory allocator bottlenecks.

### Run It Yourself
1. Save the code in `quicksort.cpp`.
2. Compile: `g++ -std=c++17 quicksort.cpp -o quicksort`.
3. Run: `./quicksort`.
4. Observe the output: `10 30 40 50 70 80 90`

*State plainly: Discard `quicksort.cpp`. You have proven the underlying mechanics; now you will rely on the standard library's robust implementation.*

---

## Concept Unit: `std::sort` and Introsort

### The Problem
Writing custom partitioning schemes in production code is inherently risky due to subtle off-by-one errors and the worst-case O(n²) performance vulnerability of a naive recursive Quicksort. You need a fast, tested, production-grade sort that prevents the worst-case scenario automatically.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `std_sort.cpp` (created).
- **Change type:** Add.
- **Location:** Entire file.
- **Dependencies:** Standard C++ library algorithm header.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> data = {90, 10, 80, 30, 70, 40, 50};
    
    std::sort(data.begin(), data.end());
    
    for (int num : data) {
        std::cout << num << " ";
    }
    std::cout << "\n";
    return 0;
}
```

### The Updated Project
*(No enclosing project structure yet—this is a standalone program using the standard library. The entire code above represents the working file.)*

### Mechanical Walkthrough
- `#include <algorithm>`: Brings in the standard library algorithms package, which exposes functions designed to work across all C++ containers.
- `std::sort(data.begin(), data.end());`: Invokes the standard library sorting algorithm.
- `data.begin()`: Returns an iterator pointing to the very first element of the vector.
- `data.end()`: Returns an iterator pointing just past the final element of the vector, defining the end of the range.

### CS Lens
Modern C++ compilers typically implement `std::sort` as **Introsort** (introspective sort). It begins by using exactly the Quicksort partitioning mechanics you built because it is highly cache-efficient. However, Introsort tracks its own recursion depth. If the recursion depth exceeds `2 * log2(n)`, Introsort concludes that the pivot choices are poor (approaching the O(n²) worst-case) and automatically halts the Quicksort recursion, switching to **Heapsort** to guarantee an `O(n log n)` completion.

### SE Lens
The design principle here is **defense in depth**. The alternative not chosen is enforcing a strict pure Quicksort implementation or forcing developers to choose their algorithm manually. The tradeoff is a slightly more complex standard library implementation under the hood, but it completely shields the application programmer from malicious input that could otherwise trigger an O(n²) Denial of Service via stack overflow or algorithmic complexity attacks.

### Run It Yourself
1. Save the code in `std_sort.cpp`.
2. Compile: `g++ -std=c++17 std_sort.cpp -o std_sort`.
3. Run: `./std_sort`.
4. Observe the exact same sorted output: `10 30 40 50 70 80 90`.

---

## Connect the Pieces

You began by conceptually dividing an array in a single pass without extra memory using the Lomuto scheme. You optimized memory writes by working from both ends inward using the Hoare scheme. You applied this recursively to divide and conquer the collection in an average `O(n log n)` time. Finally, you discarded the manual implementation in favor of `std::sort`, knowing that beneath its simple interface lies an introspective hybrid that relies on the exact Quicksort mechanics you just built, safely guarded against stack exhaustion.

## What Breaks Without This

If you implement naive Quicksort and feed it an already sorted array of a massive size, the recursion depth will equal the array size instead of `log(n)`. 

Modify your recursive `quicksort` test data to sort an array of 50,000 ascending integers:
```cpp
std::vector<int> data(50000);
for(int i = 0; i < 50000; i++) {
    data[i] = i;
}
quicksort(data, 0, data.size() - 1);
```

**The compiler error/runtime failure:** 
The program will likely crash at runtime with a **Segmentation Fault**. Because the data is sorted and the pivot logic doesn't perfectly halve it, `50,000` recursive function calls pile up in memory and exhaust the system's call stack. `std::sort` specifically prevents this by tracking depth and switching to Heapsort.

## Exercises

1. **Pivot Strategy:** Modify the manual Hoare partition code to select the first element (`arr[low]`) as the pivot instead of the middle element. Run it against unsorted data and observe if the final sorted output remains logically correct.
2. **Descending Sort:** Look up the `std::greater<int>()` comparator function online. Pass it as a third argument to your `std::sort` call to sort the array in descending order.
3. **Tracking Swaps:** Add a global integer variable `swap_count` to your recursive `quicksort.cpp`. Increment it every time `std::swap` is called. Print the final count to empirically see how many physical memory moves the algorithm performed.

## Definition of Done

- [ ] You have compiled and run a custom Quicksort utilizing the Hoare partition scheme.
- [ ] You have observed how a partitioning function places elements on correct sides of a pivot.
- [ ] You can explain out loud why Quicksort is an in-place algorithm.
- [ ] You have successfully called `std::sort` and can explain why it uses Introsort under the hood instead of naive Quicksort.
- [ ] You understand the difference between the average `O(n log n)` runtime and the worst-case `O(n²)` runtime.
