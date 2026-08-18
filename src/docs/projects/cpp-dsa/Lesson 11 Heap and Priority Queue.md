# Lesson 11: Heap and Priority Queue

**What you will build:** You will build a sequence of isolated, throwaway programs that implement a binary heap from scratch over an array, demonstrating how to maintain the heap property during insertions and extractions, how to build a heap in linear time, and how to sort an array using a heap. Finally, you will use the C++ Standard Library's `std::priority_queue` to achieve the same result. The transferable problem this solves is finding and removing the "most important" or "smallest/largest" element in a changing dataset in guaranteed $O(\log n)$ time, without keeping the entire dataset perfectly sorted.

**What you need to know first:** Lesson 09 Binary Tree.

**Terms used in this lesson:**
- **Priority Queue** — An abstract data type where elements are extracted in order of their priority (e.g., largest or smallest first), rather than the order they were inserted. *Why it exists:* To schedule tasks, route network packets, or run greedy algorithms where the "next best" item must be retrieved repeatedly as the data changes.
- **Heap** — A complete binary tree that satisfies the heap property. *Why it exists:* To implement a priority queue efficiently using an array without the memory overhead of node pointers.
- **Max-heap / Min-heap property** — A rule stating that every parent node must be greater than or equal to (max-heap) or less than or equal to (min-heap) its children. *Why it exists:* To guarantee that the root of the tree always contains the absolute maximum (or minimum) value, making retrieval $O(1)$.
- **Heapify-up** — The process of moving a newly inserted element up the tree until the heap property is restored. *Why it exists:* To fix the heap after an insertion at the bottom.
- **Heapify-down** — The process of moving a node down the tree, swapping it with its largest (or smallest) child until the heap property is restored. *Why it exists:* To fix the heap after the root is removed and replaced by the last element.
- **Heapsort** — A sorting algorithm that builds a heap from an array, then repeatedly extracts the root to produce a sorted sequence. *Why it exists:* To provide an in-place sort with a guaranteed $O(n \log n)$ worst-case time complexity, unlike QuickSort.

**Objects and methods used:**
- **`std::vector<T>`**
  - *What it is:* A dynamic array that manages its own memory.
  - *Implementation:* `std::vector<int>`
  - *Its use:* To store the heap elements contiguously in memory.
- **`std::swap`**
  - *What it is:* A utility function that exchanges the values of two variables.
  - *Implementation:* `void swap(T& a, T& b);`
  - *Its use:* To physically move elements up and down the array during heap operations.
- **`std::priority_queue<T>`**
  - *What it is:* A standard library container adapter that provides priority queue functionality, implemented as a max-heap by default.
  - *Implementation:* `template<class T, class Container = std::vector<T>, class Compare = std::less<T>> class priority_queue;`
  - *Its use:* To manage prioritized data automatically in production code without writing manual heapify logic.

---

## Concept Unit: The Array-Based Representation

### The Problem
A binary tree uses dynamic node allocation and pointers (`left` and `right`) to map its structure. This requires extra memory for the pointers and causes memory fragmentation. Because a heap is a **complete** binary tree (every level is fully filled except possibly the last, which is filled left-to-right), you can map the entire tree directly into a flat array. You need a way to find a node's parent and children using pure math instead of pointers.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> heap = {100, 80, 90, 70, 60, 85};
    
    int index = 1; // Looking at the value 80
    
    int parent_index = (index - 1) / 2;
    int left_child_index = 2 * index + 1;
    int right_child_index = 2 * index + 2;
    
    std::cout << "Node at index " << index << " is: " << heap[index] << "\n";
    std::cout << "Its parent is at index " << parent_index << ": " << heap[parent_index] << "\n";
    std::cout << "Its left child is at index " << left_child_index << ": " << heap[left_child_index] << "\n";
    std::cout << "Its right child is at index " << right_child_index << ": " << heap[right_child_index] << "\n";
    
    return 0;
}
```

### The Updated Project
No project changes — this is an isolated, throwaway example.

### Mechanical Walkthrough
- `std::vector<int> heap = {100, 80, 90, 70, 60, 85};`: Creates a contiguous array representing a complete binary tree. `100` is the root (index 0). Its children are `80` and `90` (indices 1 and 2).
- `int index = 1;`: We deliberately target the element `80` to inspect its relationships.
- `int parent_index = (index - 1) / 2;`: Calculates the parent's index. In a 0-indexed array, the parent of index $i$ is exactly at $(i - 1) / 2$ (integer division). `(1 - 1) / 2` yields `0`.
- `int left_child_index = 2 * index + 1;`: Calculates the left child. `2 * 1 + 1` yields `3`.
- `int right_child_index = 2 * index + 2;`: Calculates the right child. `2 * 1 + 2` yields `4`.
- `std::cout << ...`: Prints the relationships, proving the mathematical mapping holds without any pointers.

### CS Lens
This implicit data structure takes advantage of spatial locality. Because the elements are stored in contiguous memory, traversing the tree is extremely cache-friendly for the CPU, unlike jumping around random heap memory locations with pointers.

### SE Lens
The alternative not chosen is to build a `struct Node { int val; Node* left; Node* right; }` and use `new`. The tradeoff here is pointer management: pointer-based trees are easier to modify if the tree shape changes arbitrarily, but a heap's shape is strictly a complete tree, making the math-based array representation vastly superior in both speed and memory overhead.

### Run It Yourself
1. Save the code in `array_tree.cpp`.
2. Compile: `g++ -std=c++17 array_tree.cpp -o array_tree`.
3. Run: `./array_tree`.
4. Observe the output:
   Node at index 1 is: 80
   Its parent is at index 0: 100
   Its left child is at index 3: 70
   Its right child is at index 4: 60
5. Delete `array_tree.cpp`. This throwaway example will not be used again.

---

## Concept Unit: The Heap Property and Heapify-Up

### The Problem
When you insert a new element into a heap, you must maintain the complete tree structure, so you place the new element at the very end of the array. However, this new element might violate the max-heap property (if it is larger than its parent). You need an algorithm to move the newly inserted element up the tree until the property is restored.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

void heapify_up(std::vector<int>& heap, int index) {
    while (index > 0) {
        int parent_index = (index - 1) / 2;
        if (heap[index] > heap[parent_index]) {
            std::swap(heap[index], heap[parent_index]);
            index = parent_index;
        } else {
            break;
        }
    }
}

int main() {
    std::vector<int> heap = {100, 80, 90, 70, 60, 85};
    
    // Insert a new value at the end (bottom of the tree)
    heap.push_back(95);
    int new_index = heap.size() - 1;
    
    heapify_up(heap, new_index);
    
    for (int val : heap) {
        std::cout << val << " ";
    }
    std::cout << "\n";
    
    return 0;
}
```

### The Updated Project
No project changes.

### Mechanical Walkthrough
- `void heapify_up(std::vector<int>& heap, int index)`: A function that takes the array by reference and the index of the newly inserted element.
- `while (index > 0)`: Loops as long as the current node is not the root. The root has no parent, so the process must stop there.
- `int parent_index = (index - 1) / 2;`: Identifies the parent of the current node.
- `if (heap[index] > heap[parent_index])`: Checks the max-heap property. If the child is greater than its parent, the property is violated.
- `std::swap(heap[index], heap[parent_index]);`: Physically exchanges the values in the array, moving the larger value up one level in the tree.
- `index = parent_index;`: Updates the working index to the new position, preparing to check the next level up.
- `else { break; }`: If the child is not greater than the parent, the heap property is satisfied. Because the rest of the tree was already a valid heap, we can stop immediately.
- `heap.push_back(95);`: Appends `95` to the end of the array, simulating insertion at the next available leaf node.

Execution trace of the loop for `heapify_up(heap, 6)`:
1. Iteration 1: `index` 6 → 2. `heap[6]` is 95, `heap[2]` is 90. 95 > 90, so they swap.
2. Iteration 2: `index` 2 → 2 (loop breaks). `heap[2]` is 95, `heap[0]` is 100. 95 is not > 100. The loop breaks.

### CS Lens
This is an $O(\log n)$ operation. The tree depth is logarithmic relative to the number of elements. At worst, an element inserted at the bottom only needs to travel up the height of the tree to become the new root.

### SE Lens
The alternative not chosen is sorting the entire array after every insertion. Sorting would take $O(n \log n)$ time for a single insert, which is devastatingly slow. A heap does not guarantee the whole array is perfectly sorted—only that parents are larger than children—saving vast amounts of computational work while still guaranteeing the root is the maximum.

### Run It Yourself
1. Save the code in `heapify_up.cpp`.
2. Compile and run it.
3. Observe the output: `100 80 95 70 60 85 90`. Note how `95` bubbled up to index 2, and `90` was pushed down to index 6.
4. Delete `heapify_up.cpp`.

---

## Concept Unit: Heapify-Down (Extraction)

### The Problem
To serve the priority queue, you extract the root (the maximum value). This leaves a hole at the root. You cannot simply shift all elements left to fill it, because that destroys the tree's complete structure. The standard procedure is to move the very last element of the heap into the root position, shrinking the array by one. However, this new root is usually very small and violates the heap property. You need to sink it down the tree until the heap is valid again.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

void heapify_down(std::vector<int>& heap, int index, int size) {
    while (true) {
        int largest = index;
        int left = 2 * index + 1;
        int right = 2 * index + 2;
        
        if (left < size && heap[left] > heap[largest]) {
            largest = left;
        }
        if (right < size && heap[right] > heap[largest]) {
            largest = right;
        }
        
        if (largest != index) {
            std::swap(heap[index], heap[largest]);
            index = largest;
        } else {
            break;
        }
    }
}

int extract_max(std::vector<int>& heap) {
    int max_val = heap[0];
    heap[0] = heap.back();
    heap.pop_back();
    
    if (!heap.empty()) {
        heapify_down(heap, 0, heap.size());
    }
    return max_val;
}

int main() {
    std::vector<int> heap = {100, 80, 95, 70, 60, 85, 90};
    
    int max_val = extract_max(heap);
    
    std::cout << "Extracted: " << max_val << "\nRemaining heap: ";
    for (int val : heap) {
        std::cout << val << " ";
    }
    std::cout << "\n";
    
    return 0;
}
```

### The Updated Project
No project changes.

### Mechanical Walkthrough
- `void heapify_down(std::vector<int>& heap, int index, int size)`: Accepts the heap, the index to sink down (initially 0), and the active size of the heap.
- `int largest = index;`: Assumes the current node is the largest among itself and its children.
- `int left = ...; int right = ...;`: Calculates child positions.
- `if (left < size && heap[left] > heap[largest])`: Ensures the left child actually exists (`left < size`), then checks if it is strictly greater than the current `largest`. If so, updates `largest` to point to `left`.
- `if (right < size && heap[right] > heap[largest])`: Performs the exact same check for the right child. After both `if` blocks, `largest` perfectly holds the index of the maximum value among the parent and its two children.
- `if (largest != index)`: If the parent wasn't the largest, a swap is required.
- `std::swap(...)`: Swaps the parent with its largest child, fixing this local triangle.
- `index = largest;`: Advances the working index downward to continue sinking the element.
- `int extract_max(...)`: The public interface. It copies the root (`100`), overwrites the root with `heap.back()` (the last element, `90`), deletes the last element to shrink the array, and kicks off `heapify_down` from index 0.

### CS Lens
Heapify-down ensures that the maximum element bubbles up to fill the void. By always swapping with the *largest* of the two children, it guarantees that the new parent will be greater than both of its children, satisfying the heap property locally before continuing down. This is an $O(\log n)$ operation.

### SE Lens
The alternative not chosen is shifting the array elements left by one index to "fill" the hole at index 0. Shifting an array takes $O(n)$ time and utterly scrambles the mathematical parent-child relationships, destroying the tree. Swapping the last element to the root and sinking it keeps the operation at $O(\log n)$ and preserves the complete tree structure perfectly.

### Run It Yourself
1. Save the code in `heapify_down.cpp`.
2. Compile and run it.
3. Observe the output: `Extracted: 100`, followed by `95 80 90 70 60 85`. The value `90` was placed at the root and sank down, allowing `95` to become the new root.
4. Delete `heapify_down.cpp`.

---

## Concept Unit: Building a Heap in $O(n)$

### The Problem
If you have an unsorted array of data and you want to turn it into a valid heap, you could start with an empty heap and call `heapify_up` $n$ times. However, doing $n$ insertions of $O(\log n)$ takes $O(n \log n)$ time. Floyd's heap-building algorithm can reorganize an array into a valid heap in-place in linear $O(n)$ time by working from the bottom up.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

// Reusing heapify_down from the previous unit
void heapify_down(std::vector<int>& heap, int index, int size) {
    while (true) {
        int largest = index;
        int left = 2 * index + 1;
        int right = 2 * index + 2;
        if (left < size && heap[left] > heap[largest]) largest = left;
        if (right < size && heap[right] > heap[largest]) largest = right;
        if (largest != index) {
            std::swap(heap[index], heap[largest]);
            index = largest;
        } else {
            break;
        }
    }
}

void build_heap(std::vector<int>& arr) {
    int size = arr.size();
    // Start from the last non-leaf node
    for (int i = (size / 2) - 1; i >= 0; --i) {
        heapify_down(arr, i, size);
    }
}

int main() {
    std::vector<int> arr = {40, 10, 50, 90, 20, 80, 30};
    
    build_heap(arr);
    
    for (int val : arr) {
        std::cout << val << " ";
    }
    std::cout << "\n";
    
    return 0;
}
```

### The Updated Project
No project changes.

### Mechanical Walkthrough
- `void build_heap(std::vector<int>& arr)`: Reorganizes a raw, unsorted array into a heap directly in memory.
- `int i = (size / 2) - 1;`: Finds the index of the last non-leaf node. In a complete binary tree, the second half of the array consists entirely of leaf nodes. A leaf node with no children is automatically a valid heap of size 1. There is no reason to heapify-down on a leaf. `(size / 2) - 1` pinpoints the parent of the absolute last element.
- `for (...; i >= 0; --i)`: Iterates backward from the last non-leaf node up to the root (index 0).
- `heapify_down(arr, i, size);`: Sinks the current node down if necessary. Because we are working from the bottom up, by the time we process a node, its left and right subtrees are mathematically guaranteed to already be valid heaps.

### CS Lens
This algorithm operates in $O(n)$ time. It seems counterintuitive because there is a loop running $n/2$ times calling an $O(\log n)$ function. However, the majority of the nodes are at the bottom of the tree and only need to sink down a maximum of 1 or 2 levels. The rigorous mathematical sum of the heights of all nodes in a complete binary tree converges strictly to $O(n)$.

### SE Lens
The alternative not chosen is inserting elements one by one into an empty array. The tradeoff is entirely performance. Bottom-up heap construction is a classic algorithm optimization: by recognizing that half the elements are trivially valid (the leaves), you skip half the work immediately, and process the rest optimally.

### Run It Yourself
1. Save the code in `build_heap.cpp`.
2. Compile and run it.
3. Observe the output: `90 40 80 10 20 50 30`. The array is not perfectly sorted, but it satisfies the max-heap property (90 is the root).
4. Delete `build_heap.cpp`.

---

## Concept Unit: Heapsort

### The Problem
You now possess a linear-time mechanism to build a max-heap, and a logarithmic-time mechanism to extract the absolute largest element. You can combine these to sort an array entirely in-place. You need to implement Heapsort.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

// Reusing heapify_down from above
void heapify_down(std::vector<int>& heap, int index, int size) {
    while (true) {
        int largest = index;
        int left = 2 * index + 1;
        int right = 2 * index + 2;
        if (left < size && heap[left] > heap[largest]) largest = left;
        if (right < size && heap[right] > heap[largest]) largest = right;
        if (largest != index) {
            std::swap(heap[index], heap[largest]);
            index = largest;
        } else {
            break;
        }
    }
}

void heap_sort(std::vector<int>& arr) {
    int size = arr.size();
    
    // Step 1: Build the max heap
    for (int i = (size / 2) - 1; i >= 0; --i) {
        heapify_down(arr, i, size);
    }
    
    // Step 2: Repeatedly extract the max and place it at the end
    for (int i = size - 1; i > 0; --i) {
        std::swap(arr[0], arr[i]); // Move max to the end
        heapify_down(arr, 0, i);   // Restore heap property for the remaining subset
    }
}

int main() {
    std::vector<int> data = {40, 10, 50, 90, 20, 80, 30};
    
    heap_sort(data);
    
    for (int val : data) {
        std::cout << val << " ";
    }
    std::cout << "\n";
    
    return 0;
}
```

### The Updated Project
No project changes.

### Mechanical Walkthrough
- `void heap_sort(std::vector<int>& arr)`: An in-place sorting algorithm.
- Step 1 builds the max-heap, running in $O(n)$. The largest element is now at index 0.
- `for (int i = size - 1; i > 0; --i)`: Iterates backward through the array. `i` marks the boundary between the active heap (left) and the sorted final array (right).
- `std::swap(arr[0], arr[i]);`: The root (`arr[0]`) is the maximum element of the active heap. We swap it into index `i` (the very end of the array). The max element is now permanently in its correct, final sorted position.
- `heapify_down(arr, 0, i);`: The active heap is now one element smaller (size `i`). The element we swapped into index 0 is probably small and out of place. We heapify-down from 0 to restore the heap property, bounded exactly by size `i`.

### CS Lens
Heapsort guarantees an $O(n \log n)$ worst-case runtime. Unlike QuickSort, which can degrade to $O(n^2)$ if the pivot choices are poor, Heapsort is structurally incapable of degrading. The tradeoff is that Heapsort exhibits poor cache locality during the `heapify_down` swaps, meaning QuickSort is generally faster in practice for typical data despite the theoretical worst-case risk.

### SE Lens
Heapsort does not require any additional memory allocation. It operates entirely in-place. If you are developing embedded systems with extremely strict memory limits and real-time execution deadlines where worst-case performance is critical, Heapsort is often preferred over QuickSort.

### Run It Yourself
1. Save the code in `heapsort.cpp`.
2. Compile and run it.
3. Observe the output: `10 20 30 40 50 80 90`. The array is completely sorted in ascending order.
4. Delete `heapsort.cpp`.

---

## Concept Unit: `std::priority_queue`

### The Problem
You now understand exactly how a heap works, how it is mapped onto an array, and how $O(\log n)$ insertions and extractions are performed. Writing `heapify_up` and `heapify_down` by hand is tedious and error-prone for real software. The C++ Standard Library provides a container adapter that wraps a `std::vector` and manages the heap algorithms for you automatically.

### The New Code
```cpp
#include <iostream>
#include <queue>
#include <vector>

int main() {
    // By default, priority_queue is a max-heap.
    std::priority_queue<int> pq;
    
    pq.push(40);
    pq.push(90);
    pq.push(20);
    pq.push(50);
    
    std::cout << "Processing tasks by priority (max-heap):\n";
    while (!pq.empty()) {
        std::cout << pq.top() << " ";
        pq.pop();
    }
    std::cout << "\n";
    
    return 0;
}
```

### The Updated Project
No project changes.

### Mechanical Walkthrough
- `#include <queue>`: The `std::priority_queue` adapter is defined in the `<queue>` header, not `<vector>`.
- `std::priority_queue<int> pq;`: Instantiates a priority queue holding integers. By default, it uses `std::vector` underneath and `std::less<int>` for comparisons, which paradoxically builds a **max-heap** (it puts the "greatest" element at the top).
- `pq.push(...)`: Adds an element. Under the hood, this calls `std::vector::push_back` and then executes `std::push_heap` (the standard library's optimized version of your `heapify_up`).
- `pq.empty()`: Returns true if the queue has no elements.
- `pq.top()`: Returns a `const` reference to the maximum element (the root of the heap). It does not remove it.
- `pq.pop()`: Removes the maximum element. Under the hood, this swaps the root with the last element, shrinks the vector, and executes `std::pop_heap` (your `heapify_down`).

### CS Lens
A "container adapter" means `std::priority_queue` is not a raw data structure itself. It is a restrictive interface wrapper placed over a `std::vector`. You are not allowed to iterate over a `std::priority_queue` or use the `[ ]` brackets, because arbitrarily accessing middle elements breaks the priority queue's abstract contract. You can only insert (`push`), view the maximum (`top`), and remove the maximum (`pop`).

### SE Lens
The standard library prevents you from making mistakes. If you try to iterate over the `pq` with a range-based `for` loop, the code will refuse to compile, actively preventing you from writing logic that depends on the internal array layout. The abstraction hides the complex index math you wrote earlier, presenting a simple, reliable interface for fetching the most important item.

### Run It Yourself
1. Save the code in `priority_queue.cpp`.
2. Compile and run it.
3. Observe the output: `90 50 40 20`. The values are returned strictly in descending order, regardless of the insertion order.
4. Delete `priority_queue.cpp`.

---

## Connect the Pieces

Trace the lifecycle of a priority queue: You receive incoming network packets with integer priority flags. You push them into `std::priority_queue` (a `std::vector` in disguise). The container places the packet at the very end of its array, does the integer division math to find its parent, and swaps it upwards in $O(\log n)$ time until the max-heap property is satisfied. When your network processor is ready for work, it calls `.top()` to instantly grab the absolute highest-priority packet in $O(1)$ time, then `.pop()` to remove it, causing the heap to quietly swap its last leaf to the root and sink it down using $O(\log n)$ multiplications to find the next largest item. The system runs flawlessly, processing the most urgent work first.

## What Breaks Without This

If you omit the `#include <queue>` and try to rely on a raw array to maintain a "always get the biggest item" queue, you'd likely use `std::sort` after every insertion.

```cpp
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> data = {40, 90, 20};
    data.push_back(50);
    std::sort(data.begin(), data.end()); // O(n log n) cost per push!
    return 0;
}
```

If you process 1,000,000 items, `std::sort` on every push brings the application to a crawl. The heap provides exactly the sorting you *need*—no more, no less—shrinking the penalty for insertion from $O(n \log n)$ to $O(\log n)$.

## Exercises

1. **Min-Heap Configuration:** A `std::priority_queue` can be configured as a min-heap by providing three template arguments: `std::priority_queue<int, std::vector<int>, std::greater<int>> pq;`. Write a throwaway program that uses this min-heap configuration to find the 3 *smallest* elements in an array of 20 random numbers.
2. **K-th Largest Element:** Given an array, write a program that uses a `std::priority_queue` to efficiently locate the $k$-th largest element without sorting the entire array. Hint: push elements into the queue, then `pop()` exactly $k-1$ times.
3. **Array Validation:** Write a function `bool is_max_heap(const std::vector<int>& arr)` that iterates through an array and mathematically checks if the max-heap property holds for every parent-child relationship. Run it against a randomly scrambled array to prove it correctly returns `false`.

## Definition of Done

- [ ] You have manually traced the mathematical relationship between parent and child array indices in a complete binary tree.
- [ ] You have implemented and discarded a custom `heapify_up` and `heapify_down` function.
- [ ] You have observed a linear-time `build_heap` converting raw data into a valid heap.
- [ ] You have executed an in-place `heap_sort`.
- [ ] You have used `std::priority_queue` to manage priorities automatically, without manual pointer manipulation.
- [ ] You can explain out loud why a heap is more efficient than a sorted array for priority-based workloads.
