# Lesson 22: Dynamic Programming: Memoization

**What you will build**
You will write programs that solve exponential-time recursive problems in linear time by remembering past results. The transferable problem this solves is identical-work duplication—when a recursive algorithm blindly recomputes the same state millions of times, you will intercept it and serve the answer from memory instead.

**What you need to know first**
- The complete C++ From Scratch series (Lessons 01–35).
- DSA Lesson 01: Big-O.
- DSA Lesson 03: Recursion.

**Terms used in this lesson**
- **Dynamic Programming** — A method for solving complex problems by breaking them down into simpler subproblems and storing the results. *Why it exists:* To avoid the catastrophic performance cost of recomputing the same answers in massive recursive trees.
- **Overlapping Subproblems** — A condition where a recursive algorithm asks the exact same question multiple times. *Why it exists:* It is the fundamental flaw in naive divide-and-conquer that makes dynamic programming necessary; if subproblems don't overlap, caching is useless.
- **Optimal Substructure** — A property where the absolute best solution to a large problem can be constructed directly from the absolute best solutions to its smaller pieces. *Why it exists:* It proves that local, comparative combinations of sub-answers will actually produce a mathematically correct global answer, making caching safe.
- **Memoization** — The specific technique of writing a function so that it stores its return value in a lookup table before returning it, and checks that table before doing work. *Why it exists:* To act as the memory mechanism for dynamic programming, structurally turning a tree of recursive calls into a straight line.
- **Cache** — A data structure (often a hash map) that maps problem inputs to their computed outputs. *Why it exists:* To physically hold the saved answers across recursive call boundaries.

**Objects and methods used:**
- **`std::unordered_map<Key, T>` / `find`**
  - *What it is:* A collection of key-value pairs stored via hashing, providing constant-time lookups.
  - *Implementation:* `iterator find(const Key& key);`
  - *Its use:* Searches the cache for a previously computed subproblem result, returning an iterator to it if it exists.
- **`std::unordered_map<Key, T>` / `[]` operator**
  - *What it is:* The subscript access operator for a hash map.
  - *Implementation:* `T& operator[](const Key& key);`
  - *Its use:* Inserts a newly computed result into the cache so future recursive calls can intercept the request instead of computing it.

**Everything else in the file, not this lesson's subject but still explained:**
- **`std::unordered_map<Key, T>` / `end`**
  - *What it is:* A method returning a special iterator marking the position past the last element in the cache.
  - *Implementation:* `iterator end();`
  - *Its use:* Acts as a sentinel value to explicitly prove that `find()` failed to locate the subproblem result.
- **`std::vector<T>`**
  - *What it is:* A dynamic array used to hold an ordered collection of elements.
  - *Implementation:* `template <class T, class Allocator = std::allocator<T>> class vector;`
  - *Its use:* Holds the varying denominations of coins available for the change-making algorithm.
- **`std::min`**
  - *What it is:* A standard library function that returns the smaller of two values.
  - *Implementation:* `const T& min(const T& a, const T& b);`
  - *Its use:* Compares the cost of different recursive paths to identify the absolute shortest one, enforcing the optimal substructure.

---

## Concept Unit: The Cache (Memoization)

### The Problem
Recursion solves a problem by asking the same question about a smaller input. But naive recursion forgets the answers as soon as it returns them. In the Fibonacci sequence, `fib(5)` asks for `fib(4)` and `fib(3)`. But `fib(4)` *also* asks for `fib(3)`. The exact same `fib(3)` subtree is executed twice. For `fib(50)`, this duplication occurs trillions of times, making the program exponentially slow. We need a way for the recursive function to remember what it has already done.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are exploring algorithmic concepts in isolation.
- **Files affected:** `memoized_fibonacci.cpp` (created).
- **Change type:** Add.
- **Location:** Brand-new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <unordered_map>

long long fib(int n, std::unordered_map<int, long long>& cache) {
    if (n <= 1) return n;
    
    if (cache.find(n) != cache.end()) {
        return cache[n];
    }
    
    long long result = fib(n - 1, cache) + fib(n - 2, cache);
    cache[n] = result;
    return result;
}
```

### The Updated Project
Because `memoized_fibonacci.cpp` is a brand-new file, the code above is the entire structure, accompanied by a `main()` to invoke it:
```cpp
// ← new file: memoized_fibonacci.cpp
#include <iostream>
#include <unordered_map>

long long fib(int n, std::unordered_map<int, long long>& cache) {
    if (n <= 1) return n;
    
    if (cache.find(n) != cache.end()) {
        return cache[n];
    }
    
    long long result = fib(n - 1, cache) + fib(n - 2, cache);
    cache[n] = result;
    return result;
}

int main() {
    std::unordered_map<int, long long> memo;
    std::cout << "fib(50) = " << fib(50, memo) << "\n";
    return 0;
}
```

### Concept Isolation: The Cache Lookup
This is how we short-circuit computation in isolation. Before we integrate recursion, we just manually query a map.
```cpp
#include <iostream>
#include <unordered_map>

int main() {
    std::unordered_map<int, int> isolated_cache;
    isolated_cache[3] = 2; // Simulating that we already computed fib(3)
    
    int n = 3;
    if (isolated_cache.find(n) != isolated_cache.end()) {
        std::cout << "Found in cache! Result: " << isolated_cache[n] << "\n";
    } else {
        std::cout << "Computing from scratch...\n";
    }
    return 0;
}
```
**Output:**
```text
Found in cache! Result: 2
```
This proves **memoization**: by explicitly looking for `n` in the `unordered_map` before doing work, we intercept the request and return the mapped value immediately. This is exactly what `cache.find(n)` does in the real `fib` function above.

### Discarding the Throwaway
This hardcoded simulation is deleted and will not appear in our algorithm files.

### Mechanical Walkthrough
- `long long fib(...)`: A function that returns a `long long` (since Fibonacci numbers grow past the standard `int` limit at `n=47`) and takes the target `n` alongside a cache.
- `std::unordered_map<int, long long>& cache`: An `unordered_map` passed strictly by reference (`&`). If it were passed by value, every recursive call would get its own blank copy of the map, destroying the shared memory pool entirely.
- `if (n <= 1) return n;`: The base case, standard for recursion. 
- `cache.find(n)`: A method that searches the hash map for the key `n`. It returns an iterator to the key-value pair if found.
- `!= cache.end()`: An equality operator comparing the search result against the map's end marker. If they are not equal, it means the key exists in the cache.
- `return cache[n];`: The map's subscript operator retrieves the stored `long long` answer directly. This line executes, instantly returning the answer, completely bypassing the massive recursive tree below it.
- `fib(n - 1, cache) + fib(n - 2, cache)`: The core recursive overlapping subproblem. It asks the same function for the two preceding values, passing the shared cache down into both trees.
- `long long result = ...`: Stores the output of that massive tree computation in a local variable before we return it.
- `cache[n] = result;`: The memoization step. We record the computed answer into the hash map, keyed by `n`, so that any future branch asking for `fib(n)` hits the `cache.find(n)` intercept instead of computing this again.
- `return result;`: Finally, we yield the answer back to the caller.

1. `fib(3, cache)` — Starts computing `fib(3)`. Because `cache.find(3)` fails, it calls `fib(2)` and `fib(1)`.
2. `fib(2, cache)` — Starts computing `fib(2)`. Because `cache.find(2)` fails, it calls `fib(1)` and `fib(0)`, which hit the base case and return `1` and `0`.
3. `cache[2] = 1` — `fib(2)` records its answer (`1 + 0 = 1`) into the map before returning it.
4. `fib(1, cache)` — Hits the base case and returns `1`.
5. `cache[3] = 2` — `fib(3)` receives the answers, sums them (`1 + 1 = 2`), records the answer into the map, and returns.
6. `cache.find(3)` — From this point forward, if any other branch anywhere in the tree calls `fib(3)`, the find intercept instantly returns `2`. The recursive children are never spawned.

### CS Lens
This is **Dynamic Programming** in its top-down form (Memoization). By trading space (the memory used by the hash map) for time, we convert an $O(2^n)$ exponential time algorithm into an $O(n)$ linear time algorithm. The recursion still happens, but every state is evaluated exactly once. Also recognized in: database query caching, CPU instruction caches, HTTP proxy servers, web browser local storage, and CDNs (Content Delivery Networks).

### SE Lens
The alternative not chosen is pure bottom-up tabulation (an iterative loop from `0` to `n`). The tradeoff here is recursion depth overhead vs. conceptual simplicity. Bottom-up iteration is structurally faster because it avoids function call stack overhead entirely, but top-down memoization is often easier for engineers to write because it perfectly preserves the original recursive mathematical definition of the problem.

### Commands needed to make this unit real
`g++ -std=c++17 memoized_fibonacci.cpp -o memo_fib`

### Run it. Show the real output.
```text
$ ./memo_fib
fib(50) = 12586269025
```

### Connection
By giving a recursive function a memory bank, we eliminated redundant work; next, we will apply this to a problem where the recursion doesn't just calculate a sum, but actively searches for an absolute optimal choice.

---

## Concept Unit: Optimal Substructure

### The Problem
You need to make exact change for a target amount (e.g., 11 cents) using the fewest number of coins possible from a given set of denominations (e.g., {1, 2, 5}). A greedy approach (always taking the largest coin) fails on many coin sets. You must explore all combinations. To find the true minimum, the problem must exhibit **Optimal Substructure**: the absolute best way to make 11 cents is to find the absolute best way to make `11 - coin` cents, and add 1.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are isolating algorithm mechanics outside of a larger application.
- **Files affected:** `coin_change.cpp` (created).
- **Change type:** Add.
- **Location:** Brand-new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

const int INF = 1e9;

int minCoins(int amount, const std::vector<int>& coins, std::unordered_map<int, int>& cache) {
    if (amount == 0) return 0;
    if (amount < 0) return INF;
    
    if (cache.find(amount) != cache.end()) {
        return cache[amount];
    }
    
    int best = INF;
    for (int coin : coins) {
        int current = minCoins(amount - coin, coins, cache);
        if (current != INF) {
            best = std::min(best, current + 1);
        }
    }
    
    cache[amount] = best;
    return best;
}
```

### The Updated Project
Because `coin_change.cpp` is a brand-new file, the code above is the entire structure, accompanied by a `main()` to execute it:
```cpp
// ← new file: coin_change.cpp
#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

const int INF = 1e9;

int minCoins(int amount, const std::vector<int>& coins, std::unordered_map<int, int>& cache) {
    if (amount == 0) return 0;
    if (amount < 0) return INF;
    
    if (cache.find(amount) != cache.end()) {
        return cache[amount];
    }
    
    int best = INF;
    for (int coin : coins) {
        int current = minCoins(amount - coin, coins, cache);
        if (current != INF) {
            best = std::min(best, current + 1);
        }
    }
    
    cache[amount] = best;
    return best;
}

int main() {
    std::vector<int> coins = {1, 2, 5};
    std::unordered_map<int, int> memo;
    int amount = 11;
    
    int result = minCoins(amount, coins, memo);
    if (result == INF) {
        std::cout << "Cannot make change.\n";
    } else {
        std::cout << "Minimum coins for " << amount << ": " << result << "\n";
    }
    return 0;
}
```

### Concept Isolation: Testing Sub-Paths
To understand how `std::min` selects the optimal substructure path, look at this isolated test of choosing between three hardcoded child branches.
```cpp
#include <iostream>
#include <algorithm>

int main() {
    int INF = 1e9;
    int best = INF;
    
    // Simulating the recursive returns of amount - coin
    int path1 = 4;   // Took 4 coins down this branch
    int path2 = 2;   // Took 2 coins down this branch
    int path3 = INF; // This branch was invalid (amount < 0)
    
    if (path1 != INF) best = std::min(best, path1 + 1);
    if (path2 != INF) best = std::min(best, path2 + 1);
    if (path3 != INF) best = std::min(best, path3 + 1);
    
    std::cout << "The optimal choice took " << best << " coins.\n";
    return 0;
}
```
**Output:**
```text
The optimal choice took 3 coins.
```
This proves **optimal substructure search**: we evaluate multiple candidate paths (adding `1` to account for the current coin being spent), use `std::min` to blindly keep the smallest valid number, and discard the rest. The global best emerges from local comparisons.

### Discarding the Throwaway
This hardcoded simulation is deleted and will not appear in our dynamic programming files.

### Mechanical Walkthrough
- `const int INF = 1e9;`: A large integer acting as "infinity." We use this instead of `INT_MAX` because adding `1` to `INT_MAX` causes integer overflow, wrapping around to a negative number.
- `if (amount == 0) return 0;`: The success base case. It takes zero coins to make zero cents.
- `if (amount < 0) return INF;`: The failure base case. If we subtracted a coin that was too large, this path is invalid. Returning infinity effectively poisons this path.
- `cache.find(amount)`: The map searches for the remaining amount to see if it was already solved.
- `!= cache.end()`: Validates whether the search actually found a result.
- `return cache[amount];`: The early exit. If found, we instantly return the smallest number of coins needed for this amount.
- `int best = INF;`: A local tracker for the optimal answer. We initialize it to infinity so that *any* valid path will be smaller and overwrite it.
- `for (int coin : coins)`: A loop that tests every available coin denomination against the current amount.
- `int current = minCoins(amount - coin, coins, cache);`: The recursive step. We subtract the coin's value and ask the function, "what is the best way to make the remaining amount?"
- `if (current != INF)`: A guard preventing us from considering dead-end branches. 
- `best = std::min(best, current + 1);`: The optimal substructure decision. `std::min` compares the running `best` against `current + 1` (the `+ 1` counts the coin we just spent to drop down into the `current` state). The smaller value becomes the new `best`.
- `cache[amount] = best;`: The memoization step. After checking every coin branch and finding the absolute minimum, we save it into the hash map.
- `return best;`: Returns the smallest number of coins to the caller.

1. `minCoins(2, ...)` — The loop tests coin `1` first. It subtracts the coin and recursively calls `minCoins(1)`.
2. `minCoins(1, ...)` — Tests coin `1`. Subtracts the coin and calls `minCoins(0)`.
3. `minCoins(0, ...)` — Hits the exact change base case and returns `0`.
4. `best = std::min(INF, 0 + 1)` — Back in `minCoins(1)`, it receives `0` and adds `1` (for the coin just spent). The new `best` is `1`.
5. `minCoins(-1, ...)` — Still in `minCoins(1)`, it tests coin `2`. The remaining amount becomes `-1`. It hits the failure base case and returns `INF`.
6. `best = std::min(1, INF + 1)` — The invalid path is ignored because `1` is smaller than `INF`. `minCoins(1)` saves `cache[1] = 1` and returns `1`.
7. `best = std::min(INF, 1 + 1)` — Back in `minCoins(2)`, it receives the answer `1` from the coin `1` branch. `best` becomes `2`.
8. `minCoins(0, ...)` — Still in `minCoins(2)`, it tests coin `2`. The remaining amount becomes `0`. It returns `0`.
9. `best = std::min(2, 0 + 1)` — It compares the previous `best` of `2` against the new path which took `0 + 1` coins. The new path is shorter, so `best` becomes `1`. It saves `cache[2] = 1` and returns `1`.

### CS Lens
This algorithm models a **State-Space Search Tree**. Without memoization, exploring every branch is computationally identical to generating the permutations of a string—catastrophically slow. With memoization, it behaves like a **Directed Acyclic Graph (DAG)** search. If multiple coin sequences land on a remaining balance of `4` cents, the algorithm only solves the `4`-cent node once. Also recognized in: shortest path routing algorithms (Dijkstra's), network packet routing protocols (OSPF), sequence alignment in bioinformatics, and AI game tree pruning.

### SE Lens
The alternative not chosen is a pure greedy algorithm. A greedy approach is computationally trivial (just divide and take modulos), but greedy fails entirely on non-canonical coin sets (e.g., trying to make `6` cents with coins `{1, 3, 4}`; greedy takes `4 + 1 + 1` (3 coins), DP correctly finds `3 + 3` (2 coins)). The tradeoff here is correctness versus speed. DP guarantees absolute mathematical correctness by searching the entire valid space, heavily mitigated by the cache.

### Commands needed to make this unit real
`g++ -std=c++17 coin_change.cpp -o coin_change`

### Run it. Show the real output.
```text
$ ./coin_change
Minimum coins for 11: 3
```

### Connection
By integrating a cache into an exhaustive branching tree, we guarantee optimal answers without the exponential performance penalty.

---

## Connect the Pieces
We took a process that exploded exponentially—calculating Fibonacci by branching into identical subtrees—and broke the cycle by giving the function a memory (`std::unordered_map`). A call to `fib(50)` spawned a linear descent because every overlapping query hit the cache. We then carried this architecture into Coin Change. Instead of blindly summing, Coin Change used the same cache to remember the absolute smallest number of steps required to solve sub-amounts. By evaluating multiple branches, selecting the winner with `std::min`, and saving that winner to the map, a problem that naturally required searching millions of combinations collapsed into a fast, linear chain of lookups.

## What Breaks Without This
If we disable the cache on an optimal substructure search, the math remains correct, but the execution time becomes apocalyptic.

Modify the `coin_change.cpp` file to comment out the cache lookup:
```cpp
// if (cache.find(amount) != cache.end()) {
//     return cache[amount];
// }
```
Recompile and run the program for `amount = 50`.
**The actual failure:** The terminal will hang indefinitely. Without the cache, the program re-evaluates the same coin combinations millions of times. The cache is not an optimization; for problem spaces this deep, it is the only mechanism that allows the program to terminate at all.

## Exercises
1. **Cache Inspection:** Inside `memoized_fibonacci.cpp`, immediately after `cache[n] = result;`, add a print statement: `std::cout << "Computed fib(" << n << ")\n";`. Run the program and observe that every number is only computed exactly once.
2. **Coin Change Path:** Modify `coin_change.cpp` to use coins `{1, 3, 4}` and search for `amount = 6`. Print the answer. Verify it takes 2 coins (`3+3`) instead of 3 coins (`4+1+1`), proving that DP beats the greedy algorithm.
3. **Missing Base Case:** In `coin_change.cpp`, comment out the `if (amount < 0) return INF;` guard. Run the code. Notice the program crashes with a segmentation fault or stack overflow, proving that DP needs an absolute failure floor to prevent infinite recursion.

## Definition of Done
- [ ] You have written a recursive Fibonacci function backed by an `unordered_map`.
- [ ] You have written a Coin Change algorithm that makes choices using `std::min`.
- [ ] You have executed both programs and observed them run in linear time.
- [ ] You can explain out loud why overlapping subproblems make naive recursion unviable.
- [ ] `git commit -m "Implement memoization and DP for overlapping subtrees"`
