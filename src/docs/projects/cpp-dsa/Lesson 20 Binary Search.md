# Lesson 20: Binary Search

**What you will build:** You will write isolated console programs that efficiently locate specific items within sorted arrays and calculate mathematical thresholds across continuous value spaces. The transferable problem this solves is finding an answer in logarithmic time by completely discarding half of your remaining search space at every step, bypassing the performance penalty of a linear scan.

**What you need to know first:** DSA Lesson 01 Big-O, C++ From Scratch (Lessons 01-35).

**Terms used in this lesson:**
- **Precondition** — A requirement that must be true before an algorithm runs. *Why it exists:* To guarantee the algorithm's logic is mathematically sound; if the precondition is violated, the algorithm's output is completely undefined.
- **Loop invariant** — A condition that remains mathematically true before and after every single iteration of a loop. *Why it exists:* To formally prove that a loop will eventually terminate and produce a correct result, rather than relying on trial and error to avoid an infinite loop.
- **Monotonic function** — A mathematical function that strictly never increases, or strictly never decreases, as its input grows. *Why it exists:* To define the exact property that makes a non-array search space valid for binary search; if a function is monotonic, you can reliably predict which half of the space contains the correct answer.

**Objects and methods used:**
- **`std::binary_search`**
  - *What it is:* The C++ Standard Library algorithm to check for existence in a sorted range.
  - *Implementation:* `bool binary_search(ForwardIt first, ForwardIt last, const T& value);`
  - *Its use:* Returns a boolean indicating whether the exact target value exists, safely abstracting away the manual `while` loop math.
- **`std::lower_bound`**
  - *What it is:* The C++ Standard Library algorithm to find an exact insertion point.
  - *Implementation:* `ForwardIt lower_bound(ForwardIt first, ForwardIt last, const T& value);`
  - *Its use:* Returns an iterator to the first element that is not less than the target value, allowing direct element retrieval rather than a simple existence check.

**Everything else in the file, not this lesson's subject but still explained:**
- **`std::vector<T>`**
  - *What it is:* A dynamic array that can grow in size.
  - *Implementation:* `template <class T> class vector;`
  - *Its use:* Holds the contiguous sequence of integers we perform our searches against.
- **`std::fixed` and `std::setprecision`**
  - *What it is:* Stream manipulators that explicitly format floating-point output.
  - *Implementation:* `std::ios_base& fixed(std::ios_base& str);` and `/*unspecified*/ setprecision(int n);`
  - *Its use:* Guarantees the computed square root prints with exactly four visible decimal places.
- **`std::boolalpha`**
  - *What it is:* A stream manipulator that formats boolean output.
  - *Implementation:* `std::ios_base& boolalpha(std::ios_base& str);`
  - *Its use:* Instructs the output stream to print search existence as `true` or `false` rather than `1` or `0`.

---

## Concept Unit: Raw Binary Search

### The Problem
Finding a specific item in an array using a linear scan takes time proportional to the number of items, O(n). When searching a dataset of a billion records, checking every record one by one is unacceptably slow. If the data is already sorted, you need a way to discard vast chunks of the search space at once, finding the target in logarithmic time without inspecting every element.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int target = 23;
    
    int low = 0;
    int high = arr.size() - 1;
    int found_index = -1;
    
    while (low <= high) {
        int mid = low + (high - low) / 2;
        
        if (arr[mid] == target) {
            found_index = mid;
            break;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    
    std::cout << "Target " << target << " found at index: " << found_index << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>`: Includes the standard library headers for console output.
- `#include <vector>`: Includes the standard library headers for the dynamic array.
- `int main() { ... }`: The entry point for the executable.
- `std::vector<int> arr = { ... };`: Initializes a dynamically sized array. **Crucially, these numbers are sorted.** This sorted order is the algorithm's absolute **precondition**; if the array were unsorted, the logic below would fail entirely.
- `int target = 23;`: Declares the specific integer value we want to find within the vector.
- `int low = 0;`: Sets the lower bound of the search space to the first index.
- `int high = arr.size() - 1;`: Sets the upper bound of the search space to the final index.
- `int found_index = -1;`: Initializes a variable to hold the final result, defaulting to `-1` as a signal that the element was not found.
- `while (low <= high)`: The loop condition. This establishes the **loop invariant**: if the target exists in the array, it *must* be located at an index strictly between `low` and `high`, inclusive. The loop continues as long as this search space has at least one valid element.
- `int mid = low + (high - low) / 2;`: Calculates the midpoint. Writing `(low + high) / 2` is a famous integer overflow bug waiting to happen; if `low` and `high` are massive integers, adding them together wraps around to a negative number before dividing. Subtracting them first avoids exceeding the maximum integer limit.
- `if (arr[mid] == target)`: Checks if the midpoint happens to be the exact target.
- `found_index = mid;`: Stores the successfully found index.
- `break;`: Immediately terminates the `while` loop, as the item has been found and no further searching is necessary.
- `else if (arr[mid] < target)`: The target is strictly greater than the midpoint value. Because the array is sorted, the target cannot possibly be at `mid`, nor anywhere to its left.
- `low = mid + 1;`: The canonical off-by-one correction. Because we just proved `mid` is not the target, we must explicitly exclude it from the next search space. If we wrote `low = mid`, the loop would eventually get stuck checking the exact same interval infinitely when `low == high - 1`.
- `else`: The target is strictly less than the midpoint value.
- `high = mid - 1;`: Discards the right half of the search space, excluding `mid` for the identical off-by-one reasoning.
- `std::cout << ...`: Prints the result to the console stream.
- `return 0;`: Signals to the operating system that the program executed successfully.

1. `low = 0`, `high = 9` — The initial bounds cover the whole array. `mid` computes as `4`, looking at `arr[4]`, which is `16`.
2. `low = 5` — Because `16 < 23`, the lower bound steps past the midpoint to `5`. The search space is now exactly the right half of the array. `mid` computes as `7`, looking at `arr[7]`, which is `56`.
3. `high = 6` — Because `56 > 23`, the upper bound pulls down to `6`. The search space shrinks to just two indices. `mid` computes as `5`, looking at `arr[5]`, which is `23`. The `if (arr[mid] == target)` block triggers and terminates the loop.

### CS Lens
This is an O(log n) algorithm. By discarding half of the search space at every step, the number of required checks grows logarithmically rather than linearly. Searching one million sorted items requires at most 20 comparisons. Searching one billion takes at most 30. This makes it exponentially faster than an O(n) linear scan.
Also recognized in: binary search trees, B-trees in databases, isolating regressions via `git bisect`, finding roots in collision simulations.

### SE Lens
The alternative not chosen is `std::find`, which runs a linear scan. The tradeoff is the precondition of sorting. Sorting an array takes O(n log n) time. If you only need to search an array a single time, sorting it first to use binary search is actually slower overall than just scanning it linearly. Binary search is only an architectural win if the data is naturally generated in sorted order, or if you will query the same static dataset thousands of times.

### Run It Yourself
1. Save the code in `raw_binary_search.cpp`.
2. Compile: `g++ -std=c++17 raw_binary_search.cpp -o raw_binary_search`.
3. Run: `./raw_binary_search`.
4. Observe the output: `Target 23 found at index: 5`.

---

## Concept Unit: `std::binary_search` and `std::lower_bound`

### The Problem
Writing `while(low <= high)` manually is dangerous. The off-by-one errors (forgetting the `+ 1` or `- 1`) and integer overflow bugs are notorious for causing silent infinite loops in production. You need a vetted, robust implementation that handles the loop invariant and bound shifting automatically.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    
    bool exists = std::binary_search(arr.begin(), arr.end(), 12);
    auto it = std::lower_bound(arr.begin(), arr.end(), 15);
    
    std::cout << "12 exists: " << std::boolalpha << exists << "\n";
    
    if (it != arr.end()) {
        std::cout << "First item not less than 15 is: " << *it << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>`: Includes the library responsible for printing to the console.
- `#include <vector>`: Includes the dynamic array container.
- `#include <algorithm>`: Brings in the standard library sorting and searching functions, which include the vetted binary search algorithms.
- `int main() { ... }`: The entry point.
- `std::vector<int> arr = { ... };`: Instantiates the dynamic array and populates it with pre-sorted integers, guaranteeing the mandatory sorting precondition.
- `bool exists = std::binary_search(...)`: Executes a binary search across the provided range. It returns a simple boolean (`true` or `false`) stating whether the exact target exists, assigning it to the `exists` variable.
- `arr.begin()`: A method that returns an iterator pointing to the very first element in the array.
- `arr.end()`: A method returning an iterator pointing one slot *past* the last element. C++ algorithms use a half-open interval `[begin, end)`, meaning the search space goes up to, but strictly excludes, `end`.
- `12`: The target integer being searched for.
- `auto it = std::lower_bound(...)`: A distinct standard algorithm that executes a binary search to find an *insertion point*. It returns an iterator pointing to the first element in the range that is not less than the target, assigning it to the `it` variable. `auto` tells the compiler to deduce the exact iterator type itself.
- `15`: The target integer for the `lower_bound` search.
- `std::cout << ...`: Prints output to the terminal stream.
- `std::boolalpha`: An I/O manipulator that forces the stream to print boolean values as the text `"true"` or `"false"` instead of `1` or `0`.
- `if (it != arr.end())`: Checks if the returned iterator points to a valid element. If every single item in the array was strictly less than `15`, `lower_bound` would have returned the `end()` iterator, signaling failure.
- `*it`: The dereference operator. It follows the iterator to read the actual integer residing at that position in the memory space.
- `return 0;`: Exits the program successfully.

### CS Lens
`std::lower_bound` cleanly separates the concept of "searching" from the concept of "equality." By returning the first element that is `>=` the target, it guarantees O(log n) localization whether the exact element exists or not. This is an essential operation for data structures that must repeatedly insert new elements while maintaining a strictly sorted invariant.

### SE Lens
The alternative not chosen is writing the raw `while` loop from the previous unit. The tradeoff is explicit index control versus abstraction safety. The `<algorithm>` library guarantees optimal O(log n) time without off-by-one errors, but it abstracts away the exact index math, requiring you to perform iterator arithmetic (`std::distance(arr.begin(), it)`) if your software architecture demands the raw integer offset.

### Run It Yourself
1. Save the code in `stl_binary_search.cpp`.
2. Compile: `g++ -std=c++17 stl_binary_search.cpp -o stl_binary_search`.
3. Run: `./stl_binary_search`.
4. Observe the output: 
   `12 exists: true`
   `First item not less than 15 is: 16`

---

## Concept Unit: Binary Search on the Answer

### The Problem
Binary search does not strictly require an array in memory. It only requires a search space where you can ask a true/false question, and the answer to that question flips from `false` to `true` exactly once across the entire space. When you need to find an optimal threshold—like the precise square root of a number, or the maximum speed a machine can run without failing—you must binary search across an abstract mathematical value space.

### The New Code
```cpp
#include <iostream>
#include <iomanip>

int main() {
    double target_area = 50.0;
    
    double low = 0.0;
    double high = target_area;
    double mid = 0.0;
    
    while (high - low > 0.00001) {
        mid = low + (high - low) / 2.0;
        double current_area = mid * mid;
        
        if (current_area < target_area) {
            low = mid;
        } else {
            high = mid;
        }
    }
    
    std::cout << std::fixed << std::setprecision(4);
    std::cout << "Square root of " << target_area << " is approx: " << mid << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>`: Includes the standard input/output stream library.
- `#include <iomanip>`: Brings in the I/O manipulators required for explicitly formatting floating-point output constraints.
- `int main() { ... }`: The executable entry point.
- `double target_area = 50.0;`: Declares a floating-point variable representing the value we want to find the square root of.
- `double low = 0.0;`: Sets the absolute lowest possible mathematical answer for the root.
- `double high = target_area;`: Sets the highest possible bound. For integers > 1, the root cannot physically exceed the original number itself.
- `double mid = 0.0;`: Initializes the variable that will hold the midpoint test value.
- `while (high - low > 0.00001)`: The loop condition. Because we are searching continuous floating-point numbers, `low` and `high` will never exactly equal each other. We subtract `low` from `high` to get the mathematical distance, and loop until that gap shrinks below an arbitrary precision threshold.
- `mid = low + (high - low) / 2.0;`: Computes the exact decimal midpoint of the current continuous search space. Division by `2.0` forces floating-point division.
- `double current_area = mid * mid;`: This multiplication forms the **monotonic function**. As `mid` increases, `mid * mid` strictly increases. This guarantees that if our result is too small, the true root *must* lie in the higher mathematical half.
- `if (current_area < target_area)`: Tests the squared midpoint against our target constraint.
- `low = mid;`: If the area is too small, the true root is strictly larger. Because we are using continuous floating-point math, the next valid number isn't `mid + 1`. We set `low` directly to `mid` to narrow the window without mathematically skipping over valid decimal values.
- `else`: The target area is less than or equal to the midpoint's square.
- `high = mid;`: The upper bound drops directly to `mid`, explicitly discarding the upper half of the mathematical space.
- `std::cout << ...`: Begins the console output stream.
- `std::fixed`: Forces the standard output stream to use standard decimal notation rather than switching automatically to scientific notation.
- `std::setprecision(4)`: Commands the output stream to round and print exactly four digits after the decimal point.
- `return 0;`: Signals successful execution to the system.

1. `low = 0.0`, `high = 50.0` — `mid` computes as `25.0`. The square of `25.0` is `625.0`.
2. `high = 25.0` — Because `625.0 > 50.0`, the upper bound drops to `25.0`. `mid` computes as `12.5`. The square of `12.5` is `156.25`.
3. `high = 12.5` — Because `156.25 > 50.0`, the upper bound drops again to `12.5`. The space halves continuously. The algorithm mathematically hones in on the exact decimal until the bounds are `0.00001` apart.

### CS Lens
This is known formally as "binary search on the answer." The precondition is no longer "a sorted array," but rather a **monotonic function**—a deterministic condition that maps the entire search space so that it is entirely false on one side of a threshold and entirely true on the other (`F F F F T T T T`). 

### SE Lens
The alternative not chosen is stepping upward by tiny linear increments (`0.0001`, `0.0002`) and checking each one continuously. The tradeoff is extreme performance gain at the direct cost of precision management. A linear step of `0.00001` to find a root near `50.0` takes roughly seven hundred thousand loops. The binary search achieves the exact same precision in under 30 loops, but requires you to reason carefully about floating-point comparison and exact termination bounds.

### Run It Yourself
1. Save the code in `value_binary_search.cpp`.
2. Compile: `g++ -std=c++17 value_binary_search.cpp -o value_binary_search`.
3. Run: `./value_binary_search`.
4. Observe the output: `Square root of 50.0 is approx: 7.0711`.

---

## Connect the Pieces

Observe how the identical mathematical logic—halving a search space by strictly predicting which direction holds the answer—applies equally to memory addresses in a vector, half-open iterators in a standard library algorithm, and continuous floating-point variables tracking a physical threshold. The core invariant remains exactly the same: provided the space is strictly monotonic (either physically sorted or mathematically increasing), the answer is always bounded safely between `low` and `high` at every step.

## What Breaks Without This

If the data is completely unsorted, binary search produces a silent mathematical failure. 

Modify the `raw_binary_search.cpp` to shuffle the array slightly:
```cpp
std::vector<int> arr = {5, 2, 8, 16, 12, 23, 38, 56, 72, 91};
```

When you search for `12`, the algorithm checks the midpoint, sees `12 < 16`, and strictly bounds the search to the left half (`5, 2, 8`). The target `12` was physically located on the right, but the algorithm mathematically excluded it based on the broken sorting precondition. The loop terminates naturally and returns `-1` (not found), despite `12` existing in the array. This is mathematically undefined behavior caused by an invariant violation.

## Exercises

1. **Descending Order:** Write a raw binary search loop for an array that is sorted strictly in descending order (`90, 80, 70...`). The loop invariant is the exact same, but the condition that moves `low` and `high` must invert.
2. **Finding the Upper Bound:** C++ includes an algorithm named `std::upper_bound` which finds the first element strictly *greater* than the target. Create a vector of `[10, 10, 10, 20]`. Call `lower_bound` for `10` and `upper_bound` for `10`, subtract the returned iterators, and print the resulting difference to count the duplicates.
3. **Monotonic Capacity:** Imagine a function `bool can_ship_in_days(int capacity)` that returns true if a truck can ship all packages in an array within 5 days. Write a binary search loop from `low = 1` to `high = 10000` to find the minimum capacity that returns `true`.

## Definition of Done

- [ ] You have compiled and run a raw binary search loop checking for a specific integer.
- [ ] You have explicitly tracked why `low = mid + 1` prevents infinite loops.
- [ ] You have compiled and run `std::lower_bound` to find an insertion iterator.
- [ ] You have compiled and run a floating-point binary search to find a mathematical root.
- [ ] You can explain out loud the difference between searching an array and searching a monotonic function.
