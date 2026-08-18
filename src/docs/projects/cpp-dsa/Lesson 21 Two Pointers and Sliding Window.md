# Lesson 21: Two Pointers and Sliding Window

**What you will build**
You will write isolated algorithm proofs demonstrating two integer indices traversing an array. The transferable problem this solves is reducing quadratic O(n²) nested loop performance down to linear O(n) time by taking advantage of ordered data or overlapping contiguous sequences.

**What you need to know first**
- Lesson 01 Big-O
- Lesson 02 Arrays

**Terms used in this lesson**
- **Two Pointers** — An algorithmic pattern that uses two reference indices to traverse a collection, typically moving towards each other or in the same direction. *Why it exists:* To reduce nested loops (O(n²)) down to a single pass (O(n)) by taking advantage of ordered data or specific constraints.
- **Sliding Window** — A subset of the two-pointer technique where the two pointers define the boundaries of a contiguous subarray (a "window") moving in the same direction. *Why it exists:* To process contiguous sequence problems efficiently by reusing overlapping work from the previous step instead of recalculating from scratch.
- **Brute Force** — The most straightforward, exhaustive approach to solving a problem, usually relying on nested loops to check every possibility. *Why it exists:* To establish a baseline for correctness before optimizing for performance.

**Objects and methods used**
- **`std::max` and `std::min`**
  - *What it is:* Standard library function templates for basic value comparison.
  - *Implementation:* `constexpr const T& max(const T& a, const T& b);` and `constexpr const T& min(const T& a, const T& b);`
  - *Its use:* Returns the greater or lesser of two values, avoiding manual `if-else` branching when updating running bounds.

**Everything else in the file, not this lesson's subject but still explained**
- **`std::vector<T>`**
  - *What it is:* A dynamic array.
  - *Implementation:* `template <class T, class Allocator = std::allocator<T>> class vector;`
  - *Its use:* Holds the contiguous sequences of integers we will traverse.

---

## Concept Unit: The Two-Pointer Technique

### The Problem
Finding a pair of numbers in a sorted array that sum to a specific target. A brute force approach checks every possible pair using nested loops, which takes O(n²) time. As the array grows, nested iterations become unacceptably slow. We need a way to find the pair in a single pass.

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are building isolated algorithm proofs.
- **Files affected** — Created `two_sum.cpp`
- **Change type** — Add
- **Location** — Brand new file.
- **Dependencies** — None.

### The New Code — type it yourself
```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {2, 7, 11, 15, 21};
    int target = 26;
    
    int left = 0;
    int right = numbers.size() - 1;
    
    while (left < right) {
        int current_sum = numbers[left] + numbers[right];
        
        if (current_sum == target) {
            std::cout << "Found target at indices: " << left << " and " << right << "\n";
            break;
        } else if (current_sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return 0;
}
```

### Introduce the concept in isolation
Before solving the specific sum problem, look at the mechanical engine driving it: two integer indices traversing an array from opposite ends.

```cpp
#include <iostream>

int main() {
    int left = 0;
    int right = 4;
    
    while (left < right) {
        std::cout << "Evaluating " << left << " and " << right << "\n";
        left++;
        right--;
    }
    return 0;
}
```
Output:
```text
Evaluating 0 and 4
Evaluating 1 and 3
```
This output proves that two separate index variables can track two different positions in a sequence simultaneously and move towards each other, meeting in the middle without ever crossing or requiring a nested loop. This is called the **two-pointer technique**.

### Discard the throwaway example
This empty loop is deleted and will not appear in the project again.

### Mechanical walkthrough
- `#include <iostream>`: Includes the standard input/output stream library so we can print results to the console.
- `#include <vector>`: Instructs the compiler to include the definition for the `std::vector` dynamic array template.
- `int main() {`: The entry point of the C++ program where execution begins.
- `std::vector<int> numbers = {2, 7, 11, 15, 21};`: Declares a dynamic array restricted to holding integers, initialized with a strictly sorted list of values. The sorting is critical; without it, this algorithm fails.
- `int target = 26;`: Declares the integer sum we are trying to find.
- `int left = 0;`: Initializes the first pointer to index `0`, the absolute start of the array.
- `int right = numbers.size() - 1;`: Initializes the second pointer to the absolute end of the array. We subtract `1` because `size()` returns the total count, but array indices are zero-based.
- `while (left < right)`: The traversal loop. It continues as long as the left index is strictly less than the right index, ensuring the pointers never cross over each other.
- `int current_sum = numbers[left] + numbers[right];`: Calculates the sum of the two values currently pointed to by our left and right indices.
- `if (current_sum == target)`: Checks if the sum exactly matches our goal.
- `std::cout << ...`: Prints the found indices to the console.
- `break;`: Immediately terminates the `while` loop, preventing further unnecessary searching since we already found the answer.
- `else if (current_sum < target)`: Checks if the sum is too small. Because the array is sorted, the only way to increase the sum is to move the left pointer to the right, pointing to a larger number.
- `left++;`: Increments the left index by one.
- `else { right--; }`: If the sum is neither equal nor too small, it must be too large. Because the array is sorted, the only way to decrease the sum is to move the right pointer to the left, pointing to a smaller number. Decrements the right index by one.
- `return 0;`: Signals to the operating system that the program executed successfully.

Execution trace:
1. `left` is 0 (value 2), `right` is 4 (value 21). `current_sum` is 23. Because 23 < 26, `left` increments to 1.
2. `left` is 1 (value 7), `right` is 4 (value 21). `current_sum` is 28. Because 28 > 26, `right` decrements to 3.
3. `left` is 1 (value 7), `right` is 3 (value 15). `current_sum` is 22. Because 22 < 26, `left` increments to 2.
4. `left` is 2 (value 11), `right` is 3 (value 15). `current_sum` is 26. This matches `target`, the `if` branch executes, prints, and `break` exits the loop.

### CS lens
This reduces an O(n²) quadratic search down to O(n) linear time. By relying on the strict sorted order of the input array, every failed check systematically eliminates an entire row or column of potential pairs without having to actually evaluate them.
Also recognized in: quicksort partitioning, palindrome checking, reversing linked lists.

### SE lens
The alternative not chosen is a brute-force nested loop checking every pair. The tradeoff is that the two-pointer technique strictly requires the input array to be pre-sorted. If the input is unsorted, you must pay the O(n log n) cost to sort it first, or use a completely different approach like a hash map.

### Commands needed to make this unit real
`g++ -std=c++17 two_sum.cpp -o two_sum` — Invokes the compiler, enforces the C++17 standard, and names the executable `two_sum`.

### Run it. Show the real output.
```text
Found target at indices: 2 and 3
```

### Connection
With opposite-end pointers established for searching, we can now adapt the pointers to move in the same direction to capture contiguous sequences.

---

## Concept Unit: Fixed-Size Sliding Window

### The Problem
Finding the maximum sum of any contiguous subarray of size `k`. A brute force approach calculates the sum of elements `0` to `k-1`, then elements `1` to `k`, then `2` to `k+1`. This recalculates the same overlapping inner elements over and over, doing O(k) work for every single position in the array. We need to reuse the overlapping work.

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are building isolated algorithm proofs.
- **Files affected** — Created `fixed_window.cpp`
- **Change type** — Add
- **Location** — Brand new file.
- **Dependencies** — None.

### The New Code — type it yourself
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> arr = {2, 1, 5, 1, 3, 2};
    int k = 3;
    
    int window_sum = 0;
    for (int i = 0; i < k; i++) {
        window_sum += arr[i];
    }
    
    int max_sum = window_sum;
    
    for (int i = k; i < arr.size(); i++) {
        window_sum = window_sum - arr[i - k] + arr[i];
        max_sum = std::max(max_sum, window_sum);
    }
    
    std::cout << "Maximum sum of subarray of size " << k << ": " << max_sum << "\n";
    
    return 0;
}
```

### Introduce the concept in isolation
Before calculating maximums, look at how a sum can be maintained by adding and subtracting at the edges rather than recalculating the middle.

```cpp
#include <iostream>

int main() {
    int sum = 2 + 1 + 5; // 8
    std::cout << "Initial sum: " << sum << "\n";
    
    sum = sum - 2 + 1; 
    std::cout << "Next sum: " << sum << "\n";
    
    return 0;
}
```
Output:
```text
Initial sum: 8
Next sum: 7
```
This proves that you can compute the sum of the *next* block of numbers by simply subtracting the number that fell out of the left side and adding the new number that entered on the right side. This is called the **sliding window technique**.

### Discard the throwaway example
This manual arithmetic is deleted and will not appear in the project again.

### Mechanical walkthrough
- `#include <iostream>`: Includes the standard input/output stream library.
- `#include <vector>`: Brings in the definition for `std::vector`.
- `#include <algorithm>`: Brings in standard algorithms, specifically `std::max`, which we need for comparing maximum values without writing manual `if` blocks.
- `int main() {`: The entry point of the C++ program.
- `std::vector<int> arr = {2, 1, 5, 1, 3, 2};`: Declares our array of integers. This data does not need to be sorted.
- `int k = 3;`: Declares the strict, fixed size of the contiguous window we must evaluate.
- `int window_sum = 0;`: Declares an integer to track the running total of the elements currently inside our window.
- `for (int i = 0; i < k; i++)`: A loop that runs exactly `k` times to establish the very first window at the start of the array.
- `window_sum += arr[i];`: Adds the first `k` elements to `window_sum`.
- `int max_sum = window_sum;`: Stores the sum of the first window as the initial baseline record to beat.
- `for (int i = k; i < arr.size(); i++)`: Begins looping from the element immediately *after* the first window (`i = k`), scanning to the end of the array.
- `window_sum = window_sum - arr[i - k] + arr[i];`: The core slide mechanic. `arr[i - k]` identifies the element that is exiting the left side of the window, subtracting it. `arr[i]` identifies the new element entering the right side of the window, adding it.
- `std::max(max_sum, window_sum)`: Compares the all-time record (`max_sum`) against the newly slid window's sum (`window_sum`), returning the larger of the two.
- `max_sum = ...`: Updates the all-time record with the result of the `std::max` comparison.
- `std::cout << ...`: Prints the maximum sum found to the console.
- `return 0;`: Signals successful execution.

Execution trace:
1. Initial loop finishes: `window_sum` is 8 (2 + 1 + 5). `max_sum` becomes 8.
2. Main loop `i=3` (value 1): `window_sum` becomes 8 - 2 + 1 = 7. `max_sum` remains 8.
3. Main loop `i=4` (value 3): `window_sum` becomes 7 - 1 + 3 = 9. `max_sum` updates to 9.
4. Main loop `i=5` (value 2): `window_sum` becomes 9 - 5 + 2 = 6. `max_sum` remains 9.

### CS lens
This is a fixed-size sliding window. It converts an O(n * k) overlapping recalculation into a pure O(n) linear sweep. By treating the window as a continuous stream of state, we process each element in the entire array exactly twice: once when it enters the window, and once when it leaves.
Also recognized in: network packet rate limiting, moving averages in signal processing, rendering viewports in graphics.

### SE lens
The alternative not chosen is nesting two loops and running a fresh sum calculation for every position. The tradeoff here is maintaining valid state across loop iterations (`window_sum` and `max_sum` living outside the loop). State that persists across iterations is notoriously prone to off-by-one errors (like getting `arr[i - k]` wrong), making the boundaries of the loop far more fragile than a brute-force approach.

### Commands needed to make this unit real
`g++ -std=c++17 fixed_window.cpp -o fixed_window`

### Run it. Show the real output.
```text
Maximum sum of subarray of size 3: 9
```

### Connection
A fixed window handles problems with a strict size constraint, but some problems require the window to dynamically expand and shrink depending on the data it encounters.

---

## Concept Unit: Dynamic-Size Sliding Window

### The Problem
Finding the length of the smallest contiguous subarray whose sum is greater than or equal to a `target`. Here, we don't know the window size `k` in advance; the window needs to grow to accumulate enough sum, then shrink from the back to find the absolute minimum length that still satisfies the target. 

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are building isolated algorithm proofs.
- **Files affected** — Created `dynamic_window.cpp`
- **Change type** — Add
- **Location** — Brand new file.
- **Dependencies** — None.

### The New Code — type it yourself
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> arr = {2, 1, 5, 2, 8};
    int target = 7;
    
    int min_length = arr.size() + 1;
    int window_sum = 0;
    int left = 0;
    
    for (int right = 0; right < arr.size(); right++) {
        window_sum += arr[right];
        
        while (window_sum >= target) {
            int current_length = right - left + 1;
            min_length = std::min(min_length, current_length);
            
            window_sum -= arr[left];
            left++;
        }
    }
    
    if (min_length == arr.size() + 1) {
        min_length = 0;
    }
    
    std::cout << "Minimum length subarray: " << min_length << "\n";
    
    return 0;
}
```

### Introduce the concept in isolation
Before dealing with minimums, look at how a dynamic window manages its two boundaries independently.

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> data = {10, 20, 30};
    int left = 0;
    
    for (int right = 0; right < data.size(); right++) {
        std::cout << "Expanding right to " << right << "\n";
        
        while (left < right) {
            std::cout << "  Shrinking left to " << left + 1 << "\n";
            left++;
        }
    }
    return 0;
}
```
Output:
```text
Expanding right to 0
Expanding right to 1
  Shrinking left to 1
Expanding right to 2
  Shrinking left to 2
```
This output proves that a `while` loop nested inside a `for` loop does not mean O(n²) time. The `right` index moves forward, and the `left` index solely plays "catch up". Because `left` only ever moves forward and never resets, both indices traverse the array exactly once, making the total traversal O(n). This is a **dynamic sliding window**.

### Discard the throwaway example
This boundary-moving simulation is deleted and will not appear in the project again.

### Mechanical walkthrough
- `#include <iostream>`: Includes the standard input/output stream library.
- `#include <vector>`: Brings in the definition for `std::vector`.
- `#include <algorithm>`: Brings in standard algorithms, specifically `std::min`, used to keep the smallest length.
- `int main() {`: The entry point of the C++ program.
- `std::vector<int> arr = {2, 1, 5, 2, 8};`: Declares the array to search.
- `int target = 7;`: Declares the minimum sum threshold our subarray must meet.
- `int min_length = arr.size() + 1;`: Initializes the record tracker to an impossibly large value. If the array has 5 elements, the maximum possible valid length is 5. Setting it to 6 ensures any real valid length will immediately overwrite it.
- `int window_sum = 0;`: Tracks the current sum.
- `int left = 0;`: Initializes the trailing pointer that will define the back end of the dynamic window.
- `for (int right = 0; right < arr.size(); right++)`: The leading pointer `right` iterates through every element one by one, unconditionally expanding the window.
- `window_sum += arr[right];`: Incorporates the newly encountered leading element into the running total.
- `while (window_sum >= target)`: The condition that determines if the window is currently "valid". As long as the sum is high enough, we enter the loop to shrink the window from the back to see if a smaller valid window is possible.
- `int current_length = right - left + 1;`: Calculates the inclusive length of the window right now.
- `std::min(min_length, current_length)`: Compares the smallest recorded length against the current valid window.
- `min_length = ...`: Updates the all-time record if the current valid window is smaller than the previous record.
- `window_sum -= arr[left];`: The core shrinking mechanic. Removes the value at the trailing pointer from the running sum *before* we move the pointer.
- `left++;`: Advances the trailing pointer, physically shrinking the window. The `while` loop then re-evaluates if the window is still valid.
- `if (min_length == arr.size() + 1)`: A final safety check. If the record never changed from its impossible initial value, it means no valid subarray was ever found.
- `min_length = 0;`: Sets the result to 0 to accurately report no valid windows.
- `std::cout << ...`: Prints the final result.
- `return 0;`: Signals successful execution.

Execution trace:
1. `right` is 0 (value 2), sum is 2. `while` loop is skipped.
2. `right` is 1 (value 1), sum is 3. `while` loop is skipped.
3. `right` is 2 (value 5), sum is 8. 8 >= 7, enter `while`.
   - `current_length` is 3 (indices 0 to 2). `min_length` becomes 3.
   - Subtract `arr[left]` (value 2), sum becomes 6. `left` increments to 1.
   - `while` loop condition (6 >= 7) is now false.
4. `right` is 3 (value 2), sum is 8. 8 >= 7, enter `while`.
   - `current_length` is 3 (indices 1 to 3). `min_length` remains 3.
   - Subtract `arr[left]` (value 1), sum becomes 7. `left` increments to 2.
   - `while` loop condition (7 >= 7) is true! Enter `while` again.
   - `current_length` is 2 (indices 2 to 3). `min_length` becomes 2.
   - Subtract `arr[left]` (value 5), sum becomes 2. `left` increments to 3.
   - `while` loop condition (2 >= 7) is now false.
5. `right` is 4 (value 8), sum is 10. 10 >= 7, enter `while`.
   - `current_length` is 2 (indices 3 to 4). `min_length` remains 2.
   - Subtract `arr[left]` (value 2), sum becomes 8. `left` increments to 4.
   - `while` loop condition (8 >= 7) is true.
   - `current_length` is 1 (indices 4 to 4). `min_length` becomes 1.
   - Subtract `arr[left]` (value 8), sum becomes 0. `left` increments to 5.
   - `while` loop condition (0 >= 7) is false.

### CS lens
This expands the window pattern to variable sizes, adapting dynamically to the data. It maintains O(n) linear time complexity despite the nested `while` loop because the inner loop pointer (`left`) never resets to `0` — both `left` and `right` traverse the array exactly once, meaning at most 2n operations occur.
Also recognized in: garbage collection compaction, TCP congestion control sliding windows.

### SE lens
The alternative not chosen is recalculating the subarray sum from scratch for every possible pair of start and end indices. The tradeoff here is complex boundary management. The logic for exactly when to increment `left`, and doing so strictly *after* reading `arr[left]`, is a common source of off-by-one errors that the brute-force approach avoids.

### Commands needed to make this unit real
`g++ -std=c++17 dynamic_window.cpp -o dynamic_window`

### Run it. Show the real output.
```text
Minimum length subarray: 1
```

### Connection
By recognizing that contiguous elements share overlapping state, we can eliminate nested array traversals entirely, leaving us with highly efficient linear-time algorithms.

---

## Connect the Pieces
A full trace of algorithmic progression: we start with brute force O(n²) searching, checking every pair. By sorting the data, we enable opposite-end Two Pointers to eliminate invalid pairs instantly, dropping the time to O(n). When dealing with contiguous sequences rather than isolated pairs, we adapt the pointers to move in the same direction, turning Two Pointers into a Sliding Window. Whether fixed or dynamic, the fundamental mechanic remains the same: two indices that never backtrack, ensuring we only pass through the data once.

## What Breaks Without This
If we attempt to solve the dynamic sliding window without independent pointer tracking, we fall back to a naive nested loop approach.

Modify the `dynamic_window.cpp` code to a brute force approach:
```cpp
int min_length = arr.size() + 1;
for (int i = 0; i < arr.size(); i++) {
    int sum = 0;
    for (int j = i; j < arr.size(); j++) {
        sum += arr[j];
        if (sum >= target) {
            min_length = std::min(min_length, j - i + 1);
            break;
        }
    }
}
```
**The result:** This code is functionally correct and produces the exact same output. However, what breaks is performance at scale. Because `j` resets back to `i` on every iteration, this runs in O(n²) time. On an array of 100,000 elements, the sliding window finishes in milliseconds; the brute force nested loop executes 5 billion inner loop iterations and freezes your program.

## Exercises
1. **Two Pointers:** Write a program that takes `std::vector<int> nums = {0, 1, 0, 3, 12};` and moves all `0`s to the end of the array using two pointers moving in the same direction.
2. **Fixed Window:** Given `std::vector<double> temps = {70.0, 72.5, 71.0, 75.0, 74.0, 76.0};`, find the maximum average temperature over any 3-day window.
3. **Dynamic Window:** Given a string `std::string s = "abcabcbb";`, find the length of the longest substring without repeating characters using a sliding window and a `std::set` or `std::unordered_map` to track character uniqueness inside the window.

## Definition of Done
- [ ] You have compiled and run an opposite-direction two-pointer algorithm.
- [ ] You have compiled and run a fixed-size sliding window algorithm.
- [ ] You have compiled and run a dynamic-size sliding window algorithm.
- [ ] You can explain out loud why a `while` loop nested inside a `for` loop does not automatically mean O(n²) time complexity.
- [ ] `git commit -m "feat: complete two pointers and sliding window concepts"` — Commits the isolated concept files.
