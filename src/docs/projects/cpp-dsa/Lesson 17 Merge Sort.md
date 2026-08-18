# Lesson 17: Merge Sort

**What you will build:** You will write a program that sorts an array of integers using the Merge Sort algorithm from scratch, and then you will replicate the same stable sorting behavior using the C++ Standard Library. The transferable problem this solves is ordering large datasets efficiently in O(n log n) time while maintaining the relative order of identical elements.

**What you need to know first:** Lesson 01 Big-O, Lesson 16.

**Terms used in this lesson:**
- **Divide and conquer** — An algorithmic paradigm that solves a complex problem by recursively breaking it down into smaller, simpler subproblems, solving those, and combining their results. *Why it exists:* To reduce the time complexity of algorithms that would otherwise require exhaustive quadratic (O(n²)) or exponential work on the whole dataset at once.
- **Merge step** — The process of reading two separately sorted sequences and combining them into a single sorted sequence in a single pass. *Why it exists:* It is the engine of Merge Sort; it performs all the actual sorting work, while the recursion merely handles the splitting.
- **Auxiliary space** — Additional memory required by an algorithm, beyond the memory used to hold the input itself. *Why it exists:* To quantify memory overhead; algorithms like Merge Sort cannot easily shuffle elements in-place without overwriting unread data, so they require a separate buffer to hold intermediate results.
- **Stability** — A property of a sorting algorithm where equal elements reliably retain their original relative order after sorting. *Why it exists:* To preserve secondary sorting criteria, such as sorting a list by last name, and then sorting it by first name without destroying the last name order for people with the same first name.

**Objects and methods used:**
- **`std::stable_sort`**
  - *What it is:* A Standard Library algorithm that sorts elements while guaranteeing stability.
  - *Implementation:* `template<class RandomIt> void stable_sort(RandomIt first, RandomIt last);`
  - *Its use:* To sort datasets reliably in production when preserving the original relative order of equal items is required, avoiding the risk of writing an unstable or bug-prone custom sort.

**Everything else in the file, not this lesson's subject but still explained:**
- **`std::vector<T>`**
  - *What it is:* A dynamic array that can grow in size.
  - *Implementation:* `template <class T> class vector;`
  - *Its use:* To hold the sequences of elements we are sorting and merging, because its size can be determined at runtime and it handles its own memory management.
- **`push_back`**
  - *What it is:* A method on `std::vector` that appends a new element.
  - *Implementation:* `void push_back(const T& value);`
  - *Its use:* To construct the temporary merged sequence element by element safely.
- **`size`**
  - *What it is:* A method on `std::vector` that returns the current number of elements.
  - *Implementation:* `size_t size() const;`
  - *Its use:* To determine the bounds of our loops when copying merged elements back into the original array.
- **`std::cout`**
  - *What it is:* The standard character output stream.
  - *Implementation:* `extern std::ostream cout;`
  - *Its use:* To print values to the console so we can prove our sorting logic works.

---

## Concept Unit: The Merge Step

### The Problem
You have two separate sequences of data that are already sorted individually. You need to combine them into one larger sorted sequence. A naive approach might simply append the second sequence to the end of the first and run a full sorting algorithm on the combined result, completely destroying the performance advantage that the halves are already sorted. You need an operation that reads both sequences exactly once and weaves them together into a single sorted result.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building a standalone algorithmic proof.
- **Files affected:** `merge_sort.cpp` (created).
- **Change type:** Add.
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>

void merge(std::vector<int>& arr, int left_idx, int mid, int right_idx) {
    std::vector<int> temp;
    int i = left_idx;
    int j = mid + 1;

    while (i <= mid && j <= right_idx) {
        if (arr[i] <= arr[j]) {
            temp.push_back(arr[i]);
            i++;
        } else {
            temp.push_back(arr[j]);
            j++;
        }
    }

    while (i <= mid) {
        temp.push_back(arr[i]);
        i++;
    }

    while (j <= right_idx) {
        temp.push_back(arr[j]);
        j++;
    }

    for (int k = 0; k < temp.size(); k++) {
        arr[left_idx + k] = temp[k];
    }
}
```

### Concept Isolation
Before walking through the real code, let's look at a throwaway lab demonstrating exactly what this logic does to two tiny, fully separate sorted arrays.

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> left = {2, 5, 8};
    std::vector<int> right = {3, 6, 9};
    std::vector<int> result;
    
    int i = 0;
    int j = 0;
    
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) {
            result.push_back(left[i]);
            i++;
        } else {
            result.push_back(right[j]);
            j++;
        }
    }
    
    // Copy any remaining
    while (i < left.size()) { result.push_back(left[i]); i++; }
    while (j < right.size()) { result.push_back(right[j]); j++; }
    
    for (int val : result) {
        std::cout << val << " ";
    }
    std::cout << "\n";
    return 0;
}
```
**Output:** `2 3 5 6 8 9 `

This demonstrates the **merge step**. This is exactly what the `while` loops in the real code above are doing, except the real code operates on two contiguous halves of the same array instead of two totally separate arrays.

### Discard the Throwaway Example
We discard this standalone two-array version. It will not appear in the project again. Our real `merge` function operates on a single array using boundary indices.

### Mechanical Walkthrough
- **`void merge`** — Declares a function named `merge` that returns no value.
- **`std::vector<int>& arr`** — The first parameter. `std::vector<int>` is a dynamic array holding integers; the `&` means it is passed by reference so we directly modify the original array in memory, not a copy.
- **`int left_idx, int mid, int right_idx`** — Integer parameters defining the boundaries of the sequences within the array. `left_idx` is the start of the first sequence, `mid` is its end, and `right_idx` is the end of the second sequence.
- **`std::vector<int> temp;`** — Declares a new, empty dynamic array named `temp`. This acts as our auxiliary space, required because shifting elements directly within `arr` would overwrite unread data.
- **`int i = left_idx;`** — Declares an integer `i` initialized to `left_idx`. This serves as the read pointer for the left sequence.
- **`int j = mid + 1;`** — Declares an integer `j` initialized to `mid + 1`. This serves as the read pointer for the right sequence.
- **`while (i <= mid && j <= right_idx)`** — A loop that continues only as long as both pointers have not passed the end of their respective sequences. The `&&` (logical AND) ensures we stop weaving as soon as either sequence is exhausted.
- **`if (arr[i] <= arr[j])`** — Compares the element at index `i` with the element at index `j`. The `<=` operator is what guarantees stability: if two elements are equal, the left one is chosen first, preserving its earlier relative position.
- **`temp.push_back(arr[i]);`** — Reads the integer at index `i` from `arr` and appends it to the end of `temp`, saving it safely.
- **`i++;`** — The post-increment operator. It advances the read pointer `i` by one so the next iteration examines the next element in the left sequence.
- **`else`** — The branch taken if the element in the right sequence was strictly smaller than the left sequence's current element.
- **`temp.push_back(arr[j]);`** — Appends the element from the right sequence to `temp`.
- **`j++;`** — Advances the read pointer `j` by one.
- **`while (i <= mid)`** — A secondary loop that runs only if the right sequence was exhausted first. It safely copies any remaining unread elements from the left sequence.
- **`temp.push_back(arr[i]); i++;`** — Appends the remaining left element and advances the pointer.
- **`while (j <= right_idx)`** — A tertiary loop that runs only if the left sequence was exhausted first. It safely copies any remaining unread elements from the right sequence.
- **`temp.push_back(arr[j]); j++;`** — Appends the remaining right element and advances the pointer.
- **`for (int k = 0; k < temp.size(); k++)`** — A standard counting loop. `k` starts at `0`, increments by `1` each time via `k++`, and stops when it reaches the total number of elements currently stored in `temp` (returned by `temp.size()`).
- **`arr[left_idx + k] = temp[k];`** — The assignment operator `=`. It reads the sorted value from `temp` at offset `k` and writes it back into the original `arr` at the correct global offset starting from `left_idx`.

Execution trace of the main while loop merging `{2, 5}` and `{3, 6}`:
1. `i = 0, j = 2` — The left element `2` is less than or equal to the right element `3`, so `2` is appended to `temp`, and `i` advances to `1`.
2. `i = 1, j = 2` — The left element `5` is strictly greater than the right element `3`, so `3` is appended to `temp`, and `j` advances to `3`.
3. `i = 1, j = 3` — The left element `5` is less than or equal to the right element `6`, so `5` is appended to `temp`, and `i` advances to `2`.
4. The loop terminates because `i > mid`, and the remaining `6` is picked up by the tertiary clean-up loop.

### CS Lens
The time complexity of this merge operation is O(n), where n is the total number of elements between `left_idx` and `right_idx`. We touch each element exactly once when moving it into `temp`, and exactly once when copying it back. The auxiliary space is also O(n) because `temp` grows to hold exactly n elements.

### SE Lens
The design principle here is simplicity and safety over theoretical micro-optimization. The alternative not chosen is attempting an "in-place" merge to avoid allocating `temp`. Real in-place merging is highly complex, involves heavy block-swapping logic, and severely degrades the O(n) time performance. Allocating a temporary buffer is the industry standard tradeoff to keep the merge fast and stable.

### Run It
This fragment cannot run standalone yet because it is just a function definition. It will connect to the recursive driver function built in the next unit.

---

## Concept Unit: Recursive Divide and Conquer

### The Problem
The merge step requires its two input halves to already be sorted. But you start with a single, completely unsorted array. You need a way to break the large problem down into pieces so small that they are trivially sorted by definition, and then feed them back up into your merge function.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `merge_sort.cpp` (modified).
- **Change type:** Add.
- **Location:** Below the `merge` function.
- **Dependencies:** The `merge` function just written.

### The New Code
```cpp
void merge_sort(std::vector<int>& arr, int left_idx, int right_idx) {
    if (left_idx >= right_idx) {
        return;
    }
    
    int mid = left_idx + (right_idx - left_idx) / 2;
    
    merge_sort(arr, left_idx, mid);
    merge_sort(arr, mid + 1, right_idx);
    
    merge(arr, left_idx, mid, right_idx);
}

int main() {
    std::vector<int> data = {38, 27, 43, 3, 9, 82, 10};
    merge_sort(data, 0, data.size() - 1);
    
    for (int val : data) {
        std::cout << val << " ";
    }
    std::cout << "\n";
    return 0;
}
```

### The Updated Project
```cpp
#include <iostream>
#include <vector>

void merge(std::vector<int>& arr, int left_idx, int mid, int right_idx) {
    std::vector<int> temp;
    int i = left_idx;
    int j = mid + 1;

    while (i <= mid && j <= right_idx) {
        if (arr[i] <= arr[j]) {
            temp.push_back(arr[i]);
            i++;
        } else {
            temp.push_back(arr[j]);
            j++;
        }
    }

    while (i <= mid) {
        temp.push_back(arr[i]);
        i++;
    }

    while (j <= right_idx) {
        temp.push_back(arr[j]);
        j++;
    }

    for (int k = 0; k < temp.size(); k++) {
        arr[left_idx + k] = temp[k];
    }
}

// ← new
void merge_sort(std::vector<int>& arr, int left_idx, int right_idx) {
    if (left_idx >= right_idx) {
        return;
    }
    
    int mid = left_idx + (right_idx - left_idx) / 2;
    
    merge_sort(arr, left_idx, mid);
    merge_sort(arr, mid + 1, right_idx);
    
    merge(arr, left_idx, mid, right_idx);
}

// ← new
int main() {
    std::vector<int> data = {38, 27, 43, 3, 9, 82, 10};
    merge_sort(data, 0, data.size() - 1);
    
    for (int val : data) {
        std::cout << val << " ";
    }
    std::cout << "\n";
    return 0;
}
```
The file now contains the full sorting pipeline. The `main` function sets up the data and kicks off the recursive process, which splits the array down to base cases and merges it back up.

### Concept Isolation
Before walking through the real code, let's look at a throwaway lab demonstrating exactly what calling a function from inside itself does.

```cpp
#include <iostream>

void countdown(int n) {
    if (n <= 0) return;
    std::cout << n << " ";
    countdown(n - 1);
}

int main() {
    countdown(3);
    return 0;
}
```
**Output:** `3 2 1 `

This demonstrates **recursion**. This is exactly what `merge_sort` calling itself in the code above is doing, using the call stack to pause the current execution context, dig deeper into a smaller subproblem, and then resume once the deeper problem finishes.

### Discard the Throwaway Example
We discard this standalone countdown. It will not appear in the project again. Our real code uses recursion to halve array bounds, not to count numbers.

### Mechanical Walkthrough
- **`void merge_sort`** — Declares the function.
- **`std::vector<int>& arr`** — The array, passed by reference so all recursive branches operate on the exact same underlying memory.
- **`int left_idx, int right_idx`** — The bounds defining which segment of the array this specific function call is responsible for sorting.
- **`if (left_idx >= right_idx)`** — The base case condition. The `>=` operator checks if the subarray consists of one or zero elements.
- **`return;`** — Exits the function immediately, because a subarray of size one is already sorted by definition and needs no further splitting or merging.
- **`int mid = left_idx + (right_idx - left_idx) / 2;`** — Computes the exact middle index. The mathematical structure `left + (right - left) / 2` safely determines the midpoint while preventing integer overflow that could occur if we naïvely calculated `(left + right) / 2` with very large numbers.
- **`merge_sort(arr, left_idx, mid);`** — A recursive call invoking the function itself to sort the left half. The current execution pauses until this left side is fully divided and merged.
- **`merge_sort(arr, mid + 1, right_idx);`** — A recursive call invoking the function itself to sort the right half.
- **`merge(arr, left_idx, mid, right_idx);`** — Calls the `merge` function we wrote earlier to combine the two newly sorted halves into one sorted whole.
- **`int main()`** — The program entry point.
- **`std::vector<int> data = {38, 27, 43, 3, 9, 82, 10};`** — Declares a dynamic array and initializes it with an unsorted sequence of integers.
- **`merge_sort(data, 0, data.size() - 1);`** — Kicks off the sort on the entire array, passing `0` as the left bound and the last valid index as the right bound.
- **`for (int val : data)`** — A range-based for loop. It asks `data` for its beginning and end, sequentially copying each element into the local variable `val`.
- **`std::cout << val << " ";`** — Streams the integer `val` and a space string literal to the standard output.
- **`return 0;`** — Signals to the operating system that the program ran successfully.

Execution trace for control flow:
1. `merge_sort(data, 0, 6)` — Starts the sort for the whole array. It calculates `mid = 3` and pauses itself to call the left half.
2. `merge_sort(data, 0, 3)` — Recursively calls itself to sort the left half `{38, 27, 43, 3}`. It calculates `mid = 1` and pauses.
3. `merge_sort(data, 0, 1)` — Recursively calls itself to sort `{38, 27}`. It calculates `mid = 0` and pauses.
4. `merge_sort(data, 0, 0)` — Recursively calls itself to sort `{38}`. Since `left_idx == right_idx`, it hits the base case and immediately returns.
5. `merge_sort(data, 1, 1)` — Recursively calls itself to sort `{27}`. It hits the base case and returns.
6. `merge(data, 0, 0, 1)` — The two trivial halves `{38}` and `{27}` are passed to `merge`, which correctly orders them and overwrites the array segment to become `{27, 38}`.

### CS Lens
The time complexity of the entire algorithm is O(n log n). The recursion halves the array repeatedly, creating a recursion tree with a depth of O(log n). At each level of depth, the `merge` operations across all branches combine to perform O(n) total work. 

### SE Lens
The design principle here is relying on the call stack to manage state. The alternative not chosen is an iterative, bottom-up merge sort using loops instead of recursion. The tradeoff is that recursion consumes stack memory (O(log n) frames). However, because log₂(1,000,000) is only about 20, the stack depth is incredibly shallow even for massive datasets, making recursion completely safe here without risking a stack overflow.

### Commands Needed to Make This Unit Real
- `g++ -std=c++17 merge_sort.cpp -o merge_sort` — Invokes the GNU C++ compiler using the C++17 standard, compiling `merge_sort.cpp` into an executable binary named `merge_sort`.

### Run It
1. Compile the code using the command above.
2. Run `./merge_sort`
3. **Output:** `3 9 10 27 38 43 82 `

---

## Concept Unit: `std::stable_sort`

### The Problem
Writing Merge Sort by hand is tedious and exposes you to off-by-one errors in your indices. In production, you need a pre-written, highly optimized standard algorithm that guarantees O(n log n) stable sorting without writing custom logic.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `stable_sort_demo.cpp` (created).
- **Change type:** Add.
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> data = {38, 27, 43, 3, 9, 82, 10};
    
    std::stable_sort(data.begin(), data.end());
    
    for (int val : data) {
        std::cout << val << " ";
    }
    std::cout << "\n";
    return 0;
}
```

### Concept Isolation
Before walking through the real code, let's look at a throwaway lab demonstrating exactly what stability means when dealing with complex objects rather than plain integers.

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

struct Item {
    int key;
    std::string value;
};

int main() {
    std::vector<Item> items = {{2, "A"}, {1, "B"}, {2, "C"}};
    
    std::stable_sort(items.begin(), items.end(), [](const Item& a, const Item& b) {
        return a.key < b.key;
    });
    
    for (const auto& item : items) {
        std::cout << item.key << ":" << item.value << " ";
    }
    std::cout << "\n";
    return 0;
}
```
**Output:** `1:B 2:A 2:C `

This demonstrates **stability**. This is exactly what `std::stable_sort` guarantees in the real code above: even though the two items with key `2` are technically tied, `"A"` remains strictly before `"C"` because that is how they appeared in the original unsorted input.

### Discard the Throwaway Example
We discard this standalone struct demo. It will not appear in the project again. Our real code sorts a plain vector of integers.

### Mechanical Walkthrough
- **`#include <algorithm>`** — Instructs the compiler to include the Standard Library algorithms header, which contains the definition for `std::stable_sort`. Without this, the compiler cannot find the sorting logic.
- **`int main()`** — The program entry point.
- **`std::vector<int> data`** — Declares the dynamic array sequence.
- **`std::stable_sort(data.begin(), data.end());`** — Calls the Standard Library's stable sorting algorithm, passing it the start and end bounds of the array. It performs the sorting entirely in place, hiding its internal memory allocations.
- **`data.begin()`** — A method on `std::vector` that returns an iterator pointing to the very first element.
- **`data.end()`** — A method on `std::vector` that returns an iterator pointing to the theoretical memory slot exactly one position past the final element, defining an exclusive upper bound for the sort.
- **`for (int val : data)`** — Iterates over the now-sorted array.
- **`std::cout << val << " ";`** — Prints the element.
- **`return 0;`** — Returns success.

### CS Lens
Under the hood, `std::stable_sort` relies on a highly optimized, adaptive variant of Merge Sort. It allocates temporary auxiliary memory dynamically.

### SE Lens
The design principle here is relying on standard abstractions. The alternative not chosen is using `std::sort`. The tradeoff is that `std::sort` uses Introsort (a fast variant of Quicksort) which is generally faster and requires O(log n) space, but it is entirely unstable. You must explicitly choose `std::stable_sort` over `std::sort` when the initial relative order of equal items is semantically important.

### Commands Needed to Make This Unit Real
- `g++ -std=c++17 stable_sort_demo.cpp -o stable_sort_demo` — Compiles the standard library demonstration.

### Run It
1. Compile the code using the command above.
2. Run `./stable_sort_demo`
3. **Output:** `3 9 10 27 38 43 82 `

---

## Connect the Pieces
Start with the value `82` in the initial unsorted `data` array `{38, 27, 43, 3, 9, 82, 10}`. The recursive `merge_sort` calls repeatedly halve the array, eventually isolating `82` into its own trivial subarray `{82}`. Because the left index equals the right index, the recursion bottoms out. It is then passed into `merge` alongside the trivial subarray `{10}`. The `merge` function compares `82` and `10`, appends `10` to `temp` first, then appends `82`, weaving them into the sorted sequence `{10, 82}`. This sequence continues being merged up the tree until `82` reaches its final, fully sorted position near the end of the array.

## What Breaks Without This
If you accidentally write an unstable comparison inside your `merge` function, equal elements will permanently swap positions.

Modify the `merge` function's critical condition by removing the equals sign:
```cpp
if (arr[i] < arr[j]) { // Was <=
```
If your array contains `{5, 5}`, when `merge` processes the two halves, the strict `<` check will force it to pull the element from the right sequence *before* the element from the left sequence. The original relative order is destroyed. Your algorithm still sorts, but it has quietly lost its stability property.

## Exercises
1. **Descending Order:** Modify your custom `merge` function to sort the integers in descending order (largest to smallest) by changing exactly one character.
2. **Counting Operations:** Add a global integer variable named `comparisons`. Increment it every time `if (arr[i] <= arr[j])` executes. Print it at the end of `main` to see exactly how many comparisons it took to sort the array.
3. **Custom Lambda:** Write a program using `std::stable_sort` that sorts a vector of strings strictly by their lengths, rather than alphabetically, using a custom lambda function.

## Definition of Done
- [ ] You have compiled and run the custom `merge_sort.cpp` successfully.
- [ ] You have compiled and run the `stable_sort_demo.cpp` successfully.
- [ ] You can explain out loud why allocating a `temp` vector inside the merge step is necessary.
- [ ] You have committed your changes to version control: `git commit -m "Implement stable Merge Sort from scratch and using the STL"`
