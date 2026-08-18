# Lesson 19: Counting Sort and Radix Sort

**What you will build**
You will write isolated integer sorting algorithms that completely avoid comparing elements, breaking the theoretical O(n log n) speed limit of comparison sorts like Merge Sort and Quick Sort. The transferable problem this solves is mapping raw data values directly to memory addresses, allowing you to sort elements in linear O(n + k) time by leveraging the constraints of your data rather than generic comparisons.

**What you need to know first**
DSA Lesson 01 (Big-O), DSA Lesson 16-18 (Comparison Sorts). You should be comfortable with basic `std::vector` usage, pointers, and the fact that comparison sorts cannot theoretically run faster than O(n log n).

**Terms used in this lesson**
- **Non-comparison sort** — An algorithm that orders elements without ever using `<` or `>` to compare two elements directly against each other. *Why it exists:* To bypass the mathematical O(n log n) minimum bound that restricts all comparison-based sorting algorithms, achieving linear time complexity for specific types of data.
- **Key range (k)** — The numeric difference between the maximum and minimum possible values in a dataset. *Why it exists:* To determine the exact size of the auxiliary memory array needed for direct-address counting.
- **Stable sort** — A sorting algorithm that preserves the original relative order of elements that have the exact same value. *Why it exists:* To allow multiple sorting passes over the same data without scrambling the results of previous passes—an absolute requirement for Radix Sort to function correctly.
- **Radix** — The base of a number system (e.g., base 10 for decimal numbers). *Why it exists:* To break down unmanageably large integer ranges into a sequence of small, manageable digit-by-digit chunks that can be sorted sequentially.

**Objects and methods used**
- **`std::vector<T>` / `size`**
  - *What it is:* A standard container method that returns the number of elements in the dynamic array.
  - *Implementation:* `size_t size() const noexcept;`
  - *Its use:* To dynamically determine the length of our input arrays and appropriately size our output arrays without hardcoding dimensions.
- **`std::max_element`**
  - *What it is:* A standard library algorithm that locates the largest element in a defined range.
  - *Implementation:* `ForwardIt max_element(ForwardIt first, ForwardIt last);`
  - *Its use:* To scan the input array exactly once to determine the maximum value present, which tells Radix Sort when it has run out of digits to process.

---

## Concept Unit: Stable Counting Sort

### The Problem
All comparison sorts (like `std::sort` or Merge Sort) take at least O(n log n) time because comparing every element against the others requires a mathematical minimum number of operations. However, if you know your array contains only non-negative integers up to a specific maximum value `k`, you do not need to compare them at all. You can achieve O(n + k) time by simply counting how many times each number appears and placing them directly into their final positions.

### Project Change
No reference counterpart — this is a from-scratch addition because we are exploring algorithmic concepts in isolation using throwaway code.
- **Files affected:** `counting_sort.cpp` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {4, 2, 2, 8, 3, 3, 1};
    int max_val = 8;
    
    std::vector<int> count(max_val + 1, 0);
    std::vector<int> output(arr.size());
    
    for (int num : arr) {
        count[num]++;
    }
    
    for (size_t i = 1; i < count.size(); i++) {
        count[i] += count[i - 1];
    }
    
    for (int i = arr.size() - 1; i >= 0; i--) {
        int num = arr[i];
        output[count[num] - 1] = num;
        count[num]--;
    }
    
    for (int num : output) {
        std::cout << num << " ";
    }
    std::cout << "\n";
    
    return 0;
}
```

### The Updated Project
Because this code is an entirely isolated throwaway script to demonstrate the concept, there is no surrounding project structure. The script functions standalone as written above.

### Mechanical Walkthrough
- `#include <iostream>`: Includes the standard I/O library to allow console output.
- `#include <vector>`: Includes the dynamic array container.
- `int main() {`: The standard entry point of a C++ application.
- `std::vector<int> arr = {4, 2, 2, 8, 3, 3, 1};`: Allocates a `std::vector` of integers and initializes it with an unsorted sequence containing duplicates.
- `int max_val = 8;`: Defines the maximum value `k` known to exist in the array.
- `std::vector<int> count(max_val + 1, 0);`: Allocates the count array. We size it to `9` (`max_val + 1`) so that the indices `0` through `8` exist. The second argument `0` initializes all slots to zero.
- `std::vector<int> output(arr.size());`: Allocates the output array to match the exact size of the input array.
- `for (int num : arr)`: A range-based for loop traversing each integer in the input.
- `count[num]++;`: We use the *value* of the data directly as a memory *index*. If `num` is `4`, we increment the integer stored at `count[4]`. This avoids all comparisons.
- `for (size_t i = 1; i < count.size(); i++)`: A traditional for loop starting at index 1 up to the end of the `count` array. `size_t` is an unsigned integer type returned by `size()`.
- `count[i] += count[i - 1];`: A prefix sum. This transforms the `count` array from holding "how many times this exact number appears" to "how many numbers are less than or equal to this number". This sum represents the actual correct 1-indexed position in the output array.
- `for (int i = arr.size() - 1; i >= 0; i--)`: A reverse for loop over the input array. Iterating backward is the exact mechanical trick that ensures this sort is **stable**.
- `int num = arr[i];`: Reads the value from the original array.
- `output[count[num] - 1] = num;`: Uses the prefix sum to find exactly where this number belongs. We subtract `1` because our arrays are 0-indexed.
- `count[num]--;`: Decrements the prefix sum slot. If we encounter another identical number (like the second `2`), it will now be placed one slot to the left, preserving original relative order.
- `for (int num : output)`: A range-based loop over the newly sorted data.
- `std::cout << num << " ";`: Prints the sorted integers to the terminal.
- `return 0;`: Signals successful program termination.

### CS Lens
This is **Counting Sort**. Its time complexity is O(n + k), where `n` is the number of elements and `k` is the range of values. It fundamentally breaks the O(n log n) comparison barrier because it uses **direct addressing**—mapping the value of the data directly to a memory address in the `count` array. There are no `if (a < b)` statements anywhere in this code.

### SE Lens
The alternative not chosen is using `std::sort`, which operates in O(n log n) time with zero extra memory overhead (O(1) or O(log n) auxiliary space). The massive tradeoff with Counting Sort is memory bound to the key range `k`. If you want to sort just three integers `{1, 2, 1000000000}`, Counting Sort requires allocating a 4-gigabyte count array filled almost entirely with zeros. Counting Sort is explicitly engineered only for scenarios where `k` is roughly equal to or smaller than `n`, such as sorting ages, test scores, or bytes.

### Commands needed to make this unit real
- `g++ -std=c++17 counting_sort.cpp -o counting_sort`: Invokes the GNU C++ compiler, strictly using the C++17 standard, compiling the source file into an executable named `counting_sort`.
- `./counting_sort`: Executes the resulting binary.

### Run It
```text
1 2 2 3 3 4 8 
```
*This throwaway code proves the concept and is now explicitly discarded. We will use the stable nature of this logic to build something that solves its massive memory flaw.*

### Connection
Counting Sort gave us blazing linear speed but shattered under the weight of large key ranges; next, we will slice large numbers into small digits and repeatedly apply Counting Sort to each slice.

---

## Concept Unit: Radix Sort

### The Problem
Counting sort fails when the range `k` is huge. But large numbers are just sequences of small digits. In base 10, every single digit is bounded strictly between 0 and 9. We can sort massive numbers without a massive count array by repeatedly applying our stable Counting Sort digit by digit—starting from the ones place, then the tens place, then the hundreds.

### Project Change
No reference counterpart — this is a from-scratch addition exploring Radix Sort in isolation.
- **Files affected:** `radix_sort.cpp` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> arr = {170, 45, 75, 90, 802, 24, 2, 66};
    int max_val = *std::max_element(arr.begin(), arr.end());
    
    for (int exp = 1; max_val / exp > 0; exp *= 10) {
        std::vector<int> count(10, 0);
        std::vector<int> output(arr.size());
        
        for (int num : arr) {
            int digit = (num / exp) % 10;
            count[digit]++;
        }
        
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        for (int i = arr.size() - 1; i >= 0; i--) {
            int digit = (arr[i] / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
        }
        
        arr = output;
    }
    
    for (int num : arr) {
        std::cout << num << " ";
    }
    std::cout << "\n";
    
    return 0;
}
```

### The Updated Project
Because this code is an entirely isolated throwaway script to demonstrate the concept, there is no surrounding project structure. The script functions standalone as written above.

### Mechanical Walkthrough
- `#include <algorithm>`: Brings in standard algorithms, specifically `std::max_element`.
- `std::vector<int> arr = {...};`: Initializes the vector with scattered, multi-digit numbers.
- `std::max_element(arr.begin(), arr.end())`: Scans the array once to find the pointer/iterator to the maximum element (802).
- `*`: The dereference operator. It converts the iterator returned by `std::max_element` into the actual integer value (`802`), which is stored in `max_val`.
- `for (int exp = 1; max_val / exp > 0; exp *= 10)`: The outer loop driving the digit-by-digit extraction. `exp` starts at 1 (ones place). `exp *= 10` shifts it to the tens place, then hundreds. The loop stops when `max_val / exp` collapses to `0`, meaning we have processed all digits of the largest number.
- `std::vector<int> count(10, 0);`: Allocates our auxiliary array. Notice it is strictly sized to `10`, representing the digits 0 through 9. We completely bypassed allocating a size-802 array.
- `std::vector<int> output(arr.size());`: Allocates the output array for this specific digit pass.
- `for (int num : arr)`: Loops over the elements for the frequency counting phase.
- `int digit = (num / exp) % 10;`: The extraction math. If `num` is 170 and `exp` is 10, `170 / 10` is `17`. `17 % 10` is `7`. We successfully extracted the tens digit.
- `count[digit]++;`: Increments the count for this specific digit (0-9).
- `for (int i = 1; i < 10; i++) { count[i] += count[i - 1]; }`: The exact same prefix sum logic from Counting Sort, but strictly bounded to 10 elements.
- `for (int i = arr.size() - 1; i >= 0; i--)`: The backwards loop over the data, heavily relying on the stability of this inner sort. If two numbers have the same tens digit, their relative order from the ones-digit pass must not be destroyed.
- `int digit = (arr[i] / exp) % 10;`: Extracts the digit again to use as an index.
- `output[count[digit] - 1] = arr[i];`: Places the full original number into the `output` array based on the sorting of the current digit.
- `count[digit]--;`: Decrements the prefix sum for the next occurrence.
- `arr = output;`: Overwrites the main array with the results of this pass, setting up the board for the next digit pass (e.g., hundreds).
- `for (int num : arr) { std::cout << num << " "; }`: Prints the fully sorted array.

### CS Lens
This is **Radix Sort** (specifically, Least Significant Digit or LSD Radix Sort). Its time complexity is O(d * (n + b)), where `d` is the number of digits, `n` is the number of elements, and `b` is the base (10). Because `d` and `b` are effectively constant for a fixed integer type (a 32-bit integer has at most 10 decimal digits), the overall time complexity remains strictly linear: O(n).

### SE Lens
The alternative not chosen is using `std::sort`. Radix Sort is mathematically linear and technically faster on paper, so why doesn't `std::sort` use it? The engineering reality is **constant factors**. Radix Sort requires repeatedly allocating output arrays, heavily jumping around memory causing cache misses, and performing modulo arithmetic. Modern comparison sorts like introsort (`std::sort`) are highly optimized for CPU caching and usually outperform Radix Sort in real-world scenarios unless the dataset is enormous and the keys are trivial to extract. Additionally, Radix Sort demands that your data can be broken down into integer keys; you cannot cleanly radix-sort complex objects without writing custom, fragile key-extraction mappings.

### Commands needed to make this unit real
- `g++ -std=c++17 radix_sort.cpp -o radix_sort`: Compiles the source file.
- `./radix_sort`: Executes the resulting binary.

### Run It
```text
2 24 45 66 75 90 170 802 
```
*This throwaway code proves the concept and is now explicitly discarded. You now have a complete mechanical understanding of linear-time integer sorting.*

### Connection
Radix Sort solved the memory limitations of Counting Sort by treating numbers as arrays of digits, allowing us to maintain O(n) performance without O(k) memory allocations.

---

## Connect the Pieces

Observe how the algorithm transitions from relying on value directly (Counting Sort) to slicing the value into base-dependent chunks (Radix Sort). At every stage, the algorithm fundamentally refuses to ask the question "is A greater than B?" Instead, it calculates the exact memory offset where the value belongs using raw mathematics. 

## What Breaks Without This

If you break the **stability** of the inner Counting Sort loop, Radix Sort instantly fails to produce ordered data.

Modify the reverse loop in `radix_sort.cpp` to run forward:
```cpp
// Change this:
// for (int i = arr.size() - 1; i >= 0; i--)
// To this:
for (size_t i = 0; i < arr.size(); i++) {
    int digit = (arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
}
```

**The resulting output:**
```text
802 170 90 75 66 45 24 2
```
The sort collapses. When sorting the tens digit, numbers with identical tens digits (like 170 and 75) are placed in reverse order of their arrival. The work done during the ones-digit pass is completely overwritten and scrambled, proving exactly why stable sorting is a hard engineering requirement for Radix algorithms.

## Exercises

1. **Char Sorting:** Write a Counting Sort that takes a `std::string` of lowercase letters (e.g., `"edcba"`) and sorts it. Your key range `k` is 26, and you will map characters to indices by subtracting `'a'` (e.g., `count[ch - 'a']++`).
2. **Binary Radix:** Modify the Radix Sort code to use base 2 instead of base 10. Change `exp *= 10` to `exp *= 2`, `count(10, 0)` to `count(2, 0)`, and `% 10` to `% 2`. Verify it still sorts correctly.
3. **Negative Numbers:** Read about how Radix Sort handles negative numbers. Attempt to modify the Radix script to separate the array into two buckets (negatives and positives), run Radix Sort on both, and merge them back together.

## Definition of Done

- [ ] You have run an isolated Counting Sort and verified its prefix-sum index assignment.
- [ ] You have run an isolated Radix Sort and understand the digit-extraction math.
- [ ] You have deliberately broken stability in Radix Sort and observed the sorting failure.
- [ ] You can explain out loud why allocating memory based on the key range `k` prevents Counting Sort from being a generic replacement for `std::sort`.
- [ ] You understand that `std::sort` remains the standard engineering default due to cache efficiency and flexibility.
